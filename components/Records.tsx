
import React from 'react';
import { Filter, ArrowLeft, Utensils, Bus, Home, Ticket, ShoppingBag, Music } from 'lucide-react';
import { Expense, Category, Member } from '../types';

interface RecordsProps {
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

const Records: React.FC<RecordsProps> = ({ expenses, members, onBack }) => {
  // Group expenses by date
  const grouped = expenses.reduce((acc, curr) => {
    if (!acc[curr.date]) acc[curr.date] = [];
    acc[curr.date].push(curr);
    return acc;
  }, {} as Record<string, Expense[]>);

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col h-full bg-white pb-24">
      {/* Sticky Header */}
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-20 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold">流水明细</h2>
        <button className="p-2 -mr-2 text-gray-600">
          <Filter size={20} />
        </button>
      </div>

      <div className="overflow-y-auto no-scrollbar flex-1">
        {dates.map(date => {
          const dayExpenses = grouped[date];
          const dailyTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
          
          return (
            <div key={date}>
              <div className="px-6 py-3 bg-gray-50 flex justify-between items-center text-xs text-gray-400 font-medium">
                <span>{date} · {new Date(date).toLocaleDateString('zh-CN', { weekday: 'long' })}</span>
                <span>今日消费 ¥{dailyTotal}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {dayExpenses.map(expense => {
                  const payer = members.find(m => m.id === expense.payerId);
                  const myShare = expense.amount / expense.participants.length;
                  
                  return (
                    <div key={expense.id} className="px-6 py-5">
                      <div className="flex items-start justify-between">
                        <div className="flex space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 shrink-0">
                            {getCategoryIcon(expense.category)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">{expense.title}</h4>
                            <div className="flex items-center space-x-2 text-[10px] text-gray-400">
                              <span>{payer?.name}</span>
                              <span>·</span>
                              <span>{expense.time}</span>
                              <span>·</span>
                              <span>{expense.location}</span>
                            </div>
                            {expense.image && (
                              <div className="mt-3 w-32 h-20 rounded-xl overflow-hidden shadow-sm">
                                <img src={expense.image} className="w-full h-full object-cover" alt="attachment" />
                              </div>
                            )}
                            <div className="mt-3 flex items-center space-x-2 text-[10px] text-gray-500 font-medium">
                              <span>{expense.participants.length}人参与</span>
                              <span>·</span>
                              <span>{expense.splitType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${expense.payerId === 'm1' ? 'text-red-400' : 'text-gray-900'}`}>
                            {expense.payerId === 'm1' ? `+¥${expense.amount}` : `¥${expense.amount}`}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 italic">我分摊 ¥{myShare.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Records;
