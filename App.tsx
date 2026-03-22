import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Home, List, PieChart, DollarSign, Loader2 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Records from './components/Records';
import Statistics from './components/Statistics';
import Settlement from './components/Settlement';
import PublicWalletDetails from './components/PublicWalletDetails';
import PayableDetails from './components/PayableDetails';
import DailyConsumptionDetails from './components/DailyConsumptionDetails';
import AddExpenseModal from './components/AddExpenseModal';
import FabMenu from './components/FabMenu';
import Inbox from './components/Inbox';
import TripList from './components/TripList';
import Sidebar from './components/Sidebar';
import CreateLedgerModal from './components/CreateLedgerModal';
import { useTripViewModel } from './hooks/useTripViewModel';
import { useMultiLedger } from './hooks/useMultiLedger';
import { parseExpenseFromImage, parseExpenseFromVoice } from './services/geminiService';
import { Expense, Category, Trip } from './types';

type TabType = 'home' | 'records' | 'stats' | 'settle' | 'wallet' | 'payable' | 'daily';
type ViewType = 'tripList' | 'dashboard';

// 待处理账单类型
interface PendingExpense {
  id: string;
  tempId: string;
  image?: string;
  parsedData?: {
    title?: string;
    amount?: number;
    category?: Category;
    location?: string;
  };
  status: 'parsing' | 'pending' | 'error';
  createdAt: number;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<Partial<Expense> | undefined>();
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [pendingItems, setPendingItems] = useState<PendingExpense[]>([]);

  // 初始化多账本管理
  const { 
    trips, 
    currentTripId, 
    setCurrentTripId, 
    addTrip, 
    archiveTrip, 
    unarchiveTrip 
  } = useMultiLedger();

  // 获取当前账本数据
  const currentTrip = trips.find(t => t.id === currentTripId) || trips[0];

  // 初始化 ViewModel (使用当前账本)
  const vm = useTripViewModel(currentTrip);

  // 添加待处理账单
  const addPendingItem = useCallback((item: Omit<PendingExpense, 'tempId' | 'createdAt'>) => {
    const newItem: PendingExpense = {
      ...item,
      tempId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    setPendingItems(prev => [newItem, ...prev]);
    return newItem.tempId;
  }, []);

  // 更新待处理账单
  const updatePendingItem = useCallback((tempId: string, updates: Partial<PendingExpense>) => {
    setPendingItems(prev => prev.map(item => 
      item.tempId === tempId ? { ...item, ...updates } : item
    ));
  }, []);

  // 删除待处理账单
  const deletePendingItem = useCallback((tempId: string) => {
    setPendingItems(prev => prev.filter(item => item.tempId !== tempId));
  }, []);

  // 处理拍照识别
  const handleCameraAction = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async () => {
          const imageUrl = reader.result as string;
          const base64 = imageUrl.split(',')[1];
          
          // 添加到待处理列表
          const tempId = addPendingItem({
            id: '',
            image: imageUrl,
            status: 'parsing',
          });
          
          setIsInboxOpen(true);
          
          try {
            const result = await parseExpenseFromImage(base64);
            if (result) {
              updatePendingItem(tempId, {
                status: 'pending',
                parsedData: result,
              });
            } else {
              updatePendingItem(tempId, { status: 'error' });
            }
          } catch (error) {
            updatePendingItem(tempId, { status: 'error' });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // 处理语音记账
  const handleVoiceAction = async () => {
    setIsProcessingAI(true);
    const mockTranscript = "今天晚上吃菌子火锅花了350块钱";
    
    // 添加到待处理列表
    const tempId = addPendingItem({
      id: '',
      status: 'parsing',
    });
    
    setIsInboxOpen(true);
    
    setTimeout(async () => {
      try {
        const result = await parseExpenseFromVoice(mockTranscript);
        if (result) {
          updatePendingItem(tempId, {
            status: 'pending',
            parsedData: result,
          });
        } else {
          updatePendingItem(tempId, { status: 'error' });
        }
      } catch (error) {
        updatePendingItem(tempId, { status: 'error' });
      }
      setIsProcessingAI(false);
    }, 1500);
  };

  // 处理手动记账
  const handleManualAction = () => {
    setModalInitialData(undefined);
    setIsAddModalOpen(true);
  };

  // 确认待处理账单
  const handleConfirmPending = (tempId: string, data: Partial<Expense>) => {
    if (data.amount && data.title) {
      vm.addExpense({
        title: data.title,
        amount: data.amount,
        payerId: vm.currentUserId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        location: data.location || '未知地点',
        category: data.category || Category.Food,
        splitType: '均分' as any,
        participants: vm.currentTrip.members.map(m => m.id),
      });
      deletePendingItem(tempId);
    }
  };

  // 重试识别
  const handleRetry = async (tempId: string) => {
    updatePendingItem(tempId, { status: 'parsing' });
    // 模拟重试
    setTimeout(() => {
      updatePendingItem(tempId, {
        status: 'pending',
        parsedData: {
          title: '重试识别成功',
          amount: 100,
          category: Category.Food,
          location: '测试地点',
        },
      });
    }, 1000);
  };

  // 处理创建新账本
  const handleCreateTrip = (tripData: Omit<Trip, 'id' | 'members' | 'status'>) => {
    const newTrip = addTrip({
      ...tripData,
      members: [], // 新账本初始没有成员，需要后续添加
    });
    setCurrentTripId(newTrip.id);
    setIsCreateModalOpen(false);
    setCurrentView('dashboard');
  };

  // 处理选择账本
  const handleSelectTrip = (trip: Trip) => {
    setCurrentTripId(trip.id);
    setCurrentView('dashboard');
  };

  // 处理归档账本
  const handleArchiveTrip = (tripId: string) => {
    archiveTrip(tripId);
  };

  // 处理恢复账本
  const handleUnarchiveTrip = (tripId: string) => {
    unarchiveTrip(tripId);
  };

  const renderContent = () => {
    // 账本列表视图
    if (currentView === 'tripList') {
      return (
        <TripList
          trips={trips}
          currentTripId={currentTripId}
          onSelect={handleSelectTrip}
          onCreate={() => setIsCreateModalOpen(true)}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      );
    }

    // Dashboard 视图
    switch (currentTab) {
      case 'home':
        return (
          <Dashboard 
            trip={vm.currentTrip} 
            totalSpent={vm.totalSpent} 
            myPayable={vm.myPayable} 
            walletBalance={vm.walletBalance}
            recentExpenses={vm.expenses}
            pendingCount={pendingItems.filter(i => i.status === 'pending').length}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onAction={(type) => {
              if (type === 'wallet') {
                setCurrentTab('wallet');
              } else if (type === 'records') {
                setCurrentTab('records');
              } else if (type === 'payable') {
                setCurrentTab('payable');
              } else if (type === 'daily') {
                setCurrentTab('daily');
              } else if (type === 'inbox') {
                setIsInboxOpen(true);
              } else if (type === 'manual') {
                handleManualAction();
              } else if (type === 'ocr') {
                handleCameraAction();
              } else if (type === 'voice') {
                handleVoiceAction();
              }
            }}
          />
        );
      case 'wallet':
        return (
          <PublicWalletDetails 
            balance={vm.walletBalance}
            transactions={vm.walletTransactions}
            members={vm.currentTrip.members}
            onBack={() => setCurrentTab('home')}
            onAddTransaction={() => {
              vm.addWalletTransaction({
                amount: 500,
                type: 'deposit',
                title: '成员充值公款',
                date: new Date().toISOString().split('T')[0],
                memberId: 'm4'
              });
            }}
          />
        );
      case 'payable':
        return (
          <PayableDetails 
            expenses={vm.expenses}
            currentUserId={vm.currentUserId}
            members={vm.currentTrip.members}
            onBack={() => setCurrentTab('home')}
          />
        );
      case 'daily':
        return (
          <DailyConsumptionDetails 
            expenses={vm.expenses}
            members={vm.currentTrip.members}
            onBack={() => setCurrentTab('home')}
          />
        );
      case 'records':
        return (
          <Records 
            expenses={vm.expenses} 
            members={vm.currentTrip.members} 
            onBack={() => setCurrentTab('home')} 
          />
        );
      case 'stats':
        return (
          <Statistics 
            stats={vm.stats} 
            onBack={() => setCurrentTab('home')} 
          />
        );
      case 'settle':
        return (
          <Settlement 
            plan={vm.settlementPlan} 
            members={vm.currentTrip.members} 
            memberBalances={vm.memberBalances}
            onBack={() => setCurrentTab('home')} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen relative bg-gray-50 flex flex-col shadow-2xl overflow-hidden border-x border-gray-100">
      <div className="flex-1 overflow-hidden relative border-b border-gray-100">
        {renderContent()}
        
        {isProcessingAI && (
          <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white p-12 text-center animate-in fade-in duration-300">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-orange-500 rounded-full blur-3xl opacity-40 animate-pulse"></div>
              <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[40px] flex items-center justify-center border border-white/20">
                <Loader2 className="animate-spin text-orange-400" size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-black mb-2 tracking-tight">拼途 AI 识别中</h2>
            <p className="text-sm opacity-60 font-medium">正在解析消费金额、分类与商家...</p>
          </div>
        )}
      </div>

      <AddExpenseModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={vm.addExpense}
        members={vm.currentTrip.members}
        initialData={modalInitialData}
      />

      <Inbox
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        pendingItems={pendingItems}
        onConfirm={handleConfirmPending}
        onDelete={deletePendingItem}
        onRetry={handleRetry}
      />

      {/* 侧边栏 - 多账本管理 */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        trips={trips}
        currentTripId={currentTripId}
        onSelectTrip={setCurrentTripId}
        onCreateTrip={() => {
          setIsSidebarOpen(false);
          setIsCreateModalOpen(true);
        }}
        onArchiveTrip={handleArchiveTrip}
        onUnarchiveTrip={handleUnarchiveTrip}
      />

      {/* 创建账本模态框 */}
      <CreateLedgerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTrip}
      />

      {/* FAB 扇形菜单 */}
      <FabMenu
        onManual={handleManualAction}
        onCamera={handleCameraAction}
        onVoice={handleVoiceAction}
      />

      {/* 底部导航 */}
      <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-100 flex justify-between items-center px-6 py-4 pb-8 z-40 shadow-[0_-4px-30px_rgba(0,0,0,0.04)]">
        <button 
          onClick={() => {
            setCurrentTab('home');
            setCurrentView('dashboard');
          }}
          className={`flex flex-col items-center space-y-1.5 transition-all duration-300 ${['home', 'wallet', 'payable', 'daily'].includes(currentTab) && currentView === 'dashboard' ? 'text-orange-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Home size={20} strokeWidth={['home', 'wallet', 'payable', 'daily'].includes(currentTab) && currentView === 'dashboard' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-widest">首页</span>
        </button>
        <button 
          onClick={() => {
            setCurrentTab('records');
            setCurrentView('dashboard');
          }}
          className={`flex flex-col items-center space-y-1.5 transition-all duration-300 ${currentTab === 'records' ? 'text-orange-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <List size={20} strokeWidth={currentTab === 'records' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-widest">流水</span>
        </button>

        {/* 占位 - FAB 菜单在中间 */}
        <div className="w-16" />

        <button 
          onClick={() => {
            setCurrentTab('stats');
            setCurrentView('dashboard');
          }}
          className={`flex flex-col items-center space-y-1.5 transition-all duration-300 ${currentTab === 'stats' ? 'text-orange-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <PieChart size={20} strokeWidth={currentTab === 'stats' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-widest">统计</span>
        </button>
        <button 
          onClick={() => {
            setCurrentTab('settle');
            setCurrentView('dashboard');
          }}
          className={`flex flex-col items-center space-y-1.5 transition-all duration-300 ${currentTab === 'settle' ? 'text-orange-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <DollarSign size={20} strokeWidth={currentTab === 'settle' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-widest">结算</span>
        </button>
      </nav>
    </div>
  );
};

export default App;