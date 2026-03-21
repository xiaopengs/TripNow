
import React from 'react';
import { ArrowLeft, Calendar, Utensils, Bus, Home, Ticket, ShoppingBag, Music } from 'lucide-react';
import { Expense, Category, Member } from '../types';

interface DailyConsumptionDetailsProps {
  expenses: Expense[];
  members: Member[];
  onBack: () => void;
}

const getCategoryIcon = (category: Category) => {
  switch (category) {
    case Category.Food: return <Utensils size={18} />;
    case Category.Transport: return <Bus size={18} />;
    case Category.Accommodation: return <Home size={18} />;
    case Category.Tickets: return <Ticket size={18} />;
    case Category.Shopping: return <ShoppingBag size={18} />;
    case Category.Entertainment: return <Music size={18} />;
  }
};

const DailyConsumptionDetails: React.FC<DailyConsumptionDetailsProps> = ({ expenses, members, onBack }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter(e => e.date === today);
  const totalToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-32 overflow-y-auto no-scrollbar">
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-20 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-gray-900 tracking-tight">今日消费明细</h2>
        <div className="w-10"></div>
      </div>

      <div className="p-6">
        <div className="bg-orange-500 rounded-[32px] p-6 text-white mb-8 shadow-xl shadow-orange-100">
          <div className="flex items-center space-x-2 opacity-80 mb-1">
            <Calendar size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{today}</span>
          </div>
          <p className="text-xs font-bold opacity-70 mb-1">今日累计总支出</p>
          <p className="text-4xl font-black">¥{totalToday.toLocaleString()}</p>
        </div>

        <div className="space-y-4">
          {todayExpenses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 font-bold">今天还没有消费记录哦</p>
            </div>
          ) : (
            todayExpenses.map(expense => {
              const payer = members.find(m => m.id === expense.payerId);
              return (
                <div key={expense.id} className="bg-white p-5 rounded-[28px] border border-gray-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-50 p-3 rounded-2xl text-gray-400">
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div>
                      <p className="text-[14px] font-black text-gray-800">{expense.title}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                        {payer?.name} 支付 · {expense.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-black text-gray-900">¥{expense.amount}</p>
                    <p className="text-[9px] text-gray-300 font-bold uppercase mt-1">{expense.category}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyConsumptionDetails;
