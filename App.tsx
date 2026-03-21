
import React, { useState } from 'react';
import { Home, List, PieChart, DollarSign, Plus, Mic, Loader2 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Records from './components/Records';
import Statistics from './components/Statistics';
import Settlement from './components/Settlement';
import TripList from './components/TripList';
import PublicWalletDetails from './components/PublicWalletDetails';
import PayableDetails from './components/PayableDetails';
import DailyConsumptionDetails from './components/DailyConsumptionDetails';
import AddExpenseModal from './components/AddExpenseModal';
import { useTripViewModel } from './hooks/useTripViewModel';
import { parseExpenseFromImage, parseExpenseFromVoice } from './services/geminiService';
import { Expense } from './types';

type TabType = 'home' | 'records' | 'stats' | 'settle' | 'trips' | 'wallet' | 'payable' | 'daily';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<Partial<Expense> | undefined>();
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // 初始化 ViewModel
  const vm = useTripViewModel();

  const handleOcrAction = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setIsProcessingAI(true);
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const result = await parseExpenseFromImage(base64);
          if (result) {
            setModalInitialData(result);
            setIsAddModalOpen(true);
          }
          setIsProcessingAI(false);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleVoiceAction = async () => {
    setIsProcessingAI(true);
    const mockTranscript = "今天晚上吃菌子火锅花了350块钱";
    setTimeout(async () => {
      const result = await parseExpenseFromVoice(mockTranscript);
      if (result) {
        setModalInitialData(result);
        setIsAddModalOpen(true);
      }
      setIsProcessingAI(false);
    }, 1500);
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
            onAction={(type) => {
              if (type === 'manual') {
                setModalInitialData(undefined);
                setIsAddModalOpen(true);
              } else if (type === 'ocr') {
                handleOcrAction();
              } else if (type === 'voice') {
                handleVoiceAction();
              } else if (type === 'wallet') {
                setCurrentTab('wallet');
              } else if (type === 'records') {
                setCurrentTab('records');
              } else if (type === 'payable') {
                setCurrentTab('payable');
              } else if (type === 'daily') {
                setCurrentTab('daily');
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

      <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-100 flex justify-between items-center px-6 py-4 pb-8 z-30 shadow-[0_-4px_30px_rgba(0,0,0,0.04)]">
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

        <div className="relative -mt-16">
          <div className="absolute inset-0 bg-orange-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <button 
            onClick={() => {
              setModalInitialData(undefined);
              setIsAddModalOpen(true);
            }}
            className="relative bg-orange-500 text-white w-16 h-16 rounded-full shadow-[0_12px_24px_rgba(249,115,22,0.4)] flex items-center justify-center active:scale-90 transition-all hover:bg-orange-600 border-4 border-white"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

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
