
import React from 'react';
import { ArrowLeft, Plus, TrendingDown, TrendingUp, History } from 'lucide-react';
import { WalletTransaction, Member } from '../types';

interface PublicWalletDetailsProps {
  balance: number;
  transactions: WalletTransaction[];
  members: Member[];
  onBack: () => void;
  onAddTransaction: () => void;
}

const PublicWalletDetails: React.FC<PublicWalletDetailsProps> = ({ balance, transactions, members, onBack, onAddTransaction }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50 pb-32 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-20 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-gray-900 tracking-tight">公款钱包</h2>
        <div className="w-10"></div>
      </div>

      <div className="p-6">
        {/* Balance Card */}
        <div className="bg-emerald-600 rounded-[40px] p-8 text-white shadow-2xl shadow-emerald-200/50 relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <p className="text-xs font-black opacity-60 uppercase tracking-widest mb-2">当前可用余额</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold opacity-80">¥</span>
            <span className="text-5xl font-black">{balance.toLocaleString()}</span>
          </div>
          
          <button 
            onClick={onAddTransaction}
            className="mt-8 w-full bg-white text-emerald-600 py-4 rounded-[22px] text-sm font-black flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-xl shadow-emerald-900/20"
          >
            <Plus size={18} strokeWidth={3} />
            <span>缴纳公款 / 充值</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">总存入</span>
            </div>
            <p className="text-lg font-black text-gray-800">¥{transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingDown size={14} className="text-red-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">总支出</span>
            </div>
            <p className="text-lg font-black text-gray-800">¥{transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex items-center space-x-2 mb-5 px-1">
          <History size={16} className="text-gray-400" />
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">收支明细</h3>
        </div>

        <div className="space-y-3">
          {transactions.map(transaction => {
            const member = members.find(m => m.id === transaction.memberId);
            return (
              <div key={transaction.id} className="bg-white p-5 rounded-[28px] border border-gray-50 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl ${transaction.type === 'deposit' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-400'}`}>
                    {transaction.type === 'deposit' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-gray-800">{transaction.title}</p>
                    <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-medium mt-0.5">
                      <span>{transaction.date}</span>
                      {member && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-600 font-bold">{member.name} 缴纳</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-[16px] font-black ${transaction.type === 'deposit' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {transaction.type === 'deposit' ? '+' : '-'}¥{transaction.amount}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PublicWalletDetails;
