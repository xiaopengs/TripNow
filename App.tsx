import React, { useState, useCallback } from 'react';
import { Home, List, PieChart, DollarSign, Loader2, Inbox as InboxIcon } from 'lucide-react';
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
import { useTripViewModel } from './hooks/useTripViewModel';
import { parseExpenseFromImage, parseExpenseFromVoice } from './services/geminiService';
import { Expense, Category } from './types';

type TabType = 'home' | 'records' | 'stats' | 'settle' | 'wallet' | 'payable' | 'daily';

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
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<Partial<Expense> | undefined>();
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [pendingItems, setPendingItems] = useState<PendingExpense[]>([]);

  // 初始化 ViewModel
  const vm = useTripViewModel();

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

  const renderContent = () => {
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

      {/* FAB 扇形菜单 */}
      <FabMenu
        onManual={handleManualAction}
        onCamera={handleCameraAction}
        onVoice={handleVoiceAction}
      />

      {/* 底部导航 */}
      <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-100 flex justify-between items-center px-6 py-4 pb-8 z-40 shadow-[0_-4px-30px_rgba(0,0,0,0.04)]">
        <button 
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center space-y-1.5 transition-all duration-300 ${['home', 'wallet', 'payable', 'daily'].includes(currentTab) ? 'text-orange-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Home size={20} strokeWidth={['home', 'wallet', 'payable', 'daily'].includes(currentTab) ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-widest">首页</span>
        </button>
        <button 
          onClick={() => setCurrentTab('records')}
          className={`flex flex-col items-center space-y-1.5 transition-all duration-300 ${currentTab === 'records' ? 'text-orange-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <List size={20} strokeWidth={currentTab === 'records' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-widest">流水</span>
        </button>

        {/* 占位 - FAB 菜单在中间 */}
        <div className="w-16" />

        <button 
          onClick={() => setCurrentTab('stats')}
          className={`flex flex-col items-center space-y-1.5 transition-all duration-300 ${currentTab === 'stats' ? 'text-orange-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <PieChart size={20} strokeWidth={currentTab === 'stats' ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-widest">统计</span>
        </button>
        <button 
          onClick={() => setCurrentTab('settle')}
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
