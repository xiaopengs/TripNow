
import React from 'react';
import { Settings, MapPin, Wallet, Plus, Mic, Camera, TrendingUp } from 'lucide-react';
import { Trip, Expense, Member } from '../types';

interface DashboardProps {
  trip: Trip;
  totalSpent: number;
  myPayable: number;
  walletBalance: number;
  onAction: (action: string) => void;
  recentExpenses: Expense[];
}

const Dashboard: React.FC<DashboardProps> = ({ trip, totalSpent, myPayable, walletBalance, onAction, recentExpenses }) => {
  const progressPercent = Math.min(Math.round((totalSpent / trip.budget) * 100), 100);
  const today = new Date().toISOString().split('T')[0];
  const todaySpent = recentExpenses
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto no-scrollbar pb-32">
      {/* Header with background image */}
      <div 
        className="relative h-72 bg-cover bg-center flex flex-col justify-end px-6 pb-20 text-white"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url(${trip.image})` }}
      >
        <div className="absolute top-12 left-6 bg-black/30 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center space-x-2 text-xs font-medium">
          <MapPin size={12} className="text-orange-400" />
          <span>{trip.location}</span>
        </div>
        <div className="absolute top-12 right-6 p-2 bg-white/10 backdrop-blur-md rounded-full">
          <Settings size={20} className="text-white" />
        </div>
        
        <h1 className="text-4xl font-black mb-1 drop-shadow-md">{trip.name}</h1>
        <p className="text-sm opacity-90 font-medium tracking-wide">2024年10月 · {trip.members.length}人同行</p>
      </div>

      {/* Summary Content Card - overlapping */}
      <div className="px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-[32px] p-6 shadow-2xl shadow-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp size={18} className="text-blue-500" />
              <h2 className="font-bold text-gray-800">今日概览</h2>
            </div>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md uppercase">Dec 17</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Today's Consumption Button */}
            <button 
              onClick={() => onAction('daily')}
              className="text-left bg-gradient-to-br from-orange-400 to-orange-500 rounded-[24px] p-4 text-white shadow-lg shadow-orange-100 active:scale-95 transition-all"
            >
              <p className="text-[10px] opacity-80 font-bold mb-1 uppercase tracking-wider">今日消费</p>
              <p className="text-3xl font-black">¥{todaySpent.toLocaleString()}</p>
              <p className="text-[10px] opacity-70 mt-1">点击查看详情</p>
            </button>
            {/* My Payable Button */}
            <button 
              onClick={() => onAction('payable')}
              className="text-left bg-gradient-to-br from-amber-400 to-amber-500 rounded-[24px] p-4 text-white shadow-lg shadow-amber-100 active:scale-95 transition-all"
            >
              <p className="text-[10px] opacity-80 font-bold mb-1 uppercase tracking-wider">我的应付</p>
              <p className="text-3xl font-black">¥{myPayable.toFixed(0)}</p>
              <p className="text-[10px] opacity-70 mt-1 font-medium">查看代付项</p>
            </button>
          </div>

          <div className="mb-6 px-1">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">总支出进度</span>
              <span className="text-sm font-black text-gray-900">¥{totalSpent.toLocaleString()} / {trip.budget.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Wallet Card - Clickable */}
          <button 
            onClick={() => onAction('wallet')}
            className="w-full bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100 active:bg-gray-100 active:scale-98 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-xl shadow-sm text-emerald-500">
                <Wallet size={18} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-800">公款钱包</p>
                <p className="text-[10px] text-gray-400 font-medium tracking-tight">点击查看收支明细</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-emerald-600 font-black text-xl">¥{walletBalance.toLocaleString()}</span>
              <Plus size={14} className="text-gray-300" />
            </div>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mt-10">
        <h3 className="text-xs font-bold text-gray-400 mb-5 ml-1 uppercase tracking-widest">智能记账入口</h3>
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => onAction('manual')}
            className="group flex flex-col items-center justify-center space-y-3 py-6 bg-white rounded-3xl shadow-sm border border-gray-100 active:scale-95 transition-all hover:bg-orange-50 hover:border-orange-100"
          >
            <div className="bg-orange-500 text-white p-3.5 rounded-2xl shadow-lg shadow-orange-100 group-hover:rotate-12 transition-transform">
              <Plus size={22} />
            </div>
            <span className="text-[11px] font-black text-gray-600">手动记账</span>
          </button>
          <button 
            onClick={() => onAction('voice')}
            className="group flex flex-col items-center justify-center space-y-3 py-6 bg-white rounded-3xl shadow-sm border border-gray-100 active:scale-95 transition-all hover:bg-purple-50 hover:border-purple-100"
          >
            <div className="bg-purple-500 text-white p-3.5 rounded-2xl shadow-lg shadow-purple-100 group-hover:-rotate-12 transition-transform">
              <Mic size={22} />
            </div>
            <span className="text-[11px] font-black text-gray-600">语音输入</span>
          </button>
          <button 
            onClick={() => onAction('ocr')}
            className="group flex flex-col items-center justify-center space-y-3 py-6 bg-white rounded-3xl shadow-sm border border-gray-100 active:scale-95 transition-all hover:bg-blue-50 hover:border-blue-100"
          >
            <div className="bg-blue-500 text-white p-3.5 rounded-2xl shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
              <Camera size={22} />
            </div>
            <span className="text-[11px] font-black text-gray-600">拍照识别</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 mt-10">
        <div className="flex items-center justify-between mb-5 px-1">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">最近活动</h3>
          <button onClick={() => onAction('records')} className="text-[10px] font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-full">全部记录</button>
        </div>
        <div className="space-y-3">
          {recentExpenses.slice(0, 3).map(expense => (
            <div key={expense.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-50 p-3 rounded-2xl text-gray-400">
                  <Wallet size={18} />
                </div>
                <div>
                  <p className="text-[13px] font-black text-gray-800">{expense.title}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">{expense.date} · {expense.location}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[15px] font-black text-gray-900">¥{expense.amount}</span>
                <p className="text-[9px] text-gray-300 font-bold uppercase mt-1">{expense.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
