
import React from 'react';
import { ArrowLeft, Receipt, User, ChevronRight } from 'lucide-react';
import { Expense, Member } from '../types';

interface PayableDetailsProps {
  expenses: Expense[];
  currentUserId: string;
  members: Member[];
  onBack: () => void;
}

const PayableDetails: React.FC<PayableDetailsProps> = ({ expenses, currentUserId, members, onBack }) => {
  // Filter expenses where I am a participant but NOT the payer
  const itemsIOwe = expenses.filter(e => 
    e.participants.includes(currentUserId) && e.payerId !== currentUserId
  );

  const totalOwed = itemsIOwe.reduce((sum, e) => sum + (e.amount / e.participants.length), 0);

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-32 overflow-y-auto no-scrollbar">
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-20 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-gray-900 tracking-tight">我的应付明细</h2>
        <div className="w-10"></div>
      </div>

      <div className="p-6">
        <div className="bg-amber-500 rounded-[32px] p-6 text-white mb-8 shadow-xl shadow-amber-100">
          <p className="text-xs font-bold opacity-70 mb-1">待结算总金额</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold opacity-80">¥</span>
            <span className="text-4xl font-black">{totalOwed.toFixed(2)}</span>
          </div>
          <p className="text-[10px] font-medium opacity-60 mt-2 italic">* 该金额为他人代付项的均分总和</p>
        </div>

        <h3 className="text-xs font-black text-gray-400 mb-5 ml-1 uppercase tracking-widest">待支付项来源</h3>
        
        <div className="space-y-4">
          {itemsIOwe.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 font-bold">目前没有欠款项</p>
            </div>
          ) : (
            itemsIOwe.map(expense => {
              const payer = members.find(m => m.id === expense.payerId);
              const myShare = expense.amount / expense.participants.length;
              
              return (
                <div key={expense.id} className="bg-white p-5 rounded-[28px] border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-50 p-2.5 rounded-xl text-amber-500">
                        <Receipt size={18} />
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-gray-800">{expense.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{expense.date} · {expense.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[16px] font-black text-amber-600">¥{myShare.toFixed(2)}</p>
                      <p className="text-[9px] text-gray-300 font-bold uppercase mt-1">我应付</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={payer?.avatar} className="w-6 h-6 rounded-full border border-gray-100" />
                      <span className="text-[11px] font-bold text-gray-600">{payer?.name} 已预付</span>
                    </div>
                    <span className="text-[10px] text-gray-300 font-medium">总额 ¥{expense.amount} / {expense.participants.length}人</span>
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

export default PayableDetails;
