
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, ChevronRight, Check, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { SettlementStep, Member } from '../types';

interface SettlementProps {
  plan: SettlementStep[];
  members: Member[];
  memberBalances: Record<string, number>;
  onBack: () => void;
}

const Settlement: React.FC<SettlementProps> = ({ plan, members, memberBalances, onBack }) => {
  const [tab, setTab] = useState<'current' | 'plan'>('plan');
  const [smartRounding, setSmartRounding] = useState(true);
  const [settledSteps, setSettledSteps] = useState<number[]>([]);

  const handleSettle = (idx: number) => {
    if (settledSteps.includes(idx)) {
      setSettledSteps(prev => prev.filter(i => i !== idx));
    } else {
      setSettledSteps(prev => [...prev, idx]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-32 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-20 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-gray-900 tracking-tight">结算中心</h2>
        <div className="w-10"></div>
      </div>

      <div className="p-6">
        {/* Navigation Tabs */}
        <div className="bg-gray-200/50 p-1.5 rounded-[24px] flex mb-8">
          <button 
            onClick={() => setTab('current')}
            className={`flex-1 py-2.5 text-xs font-black rounded-[20px] transition-all duration-300 ${tab === 'current' ? 'bg-white shadow-lg shadow-gray-200/50 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            当前结余
          </button>
          <button 
            onClick={() => setTab('plan')}
            className={`flex-1 py-2.5 text-xs font-black rounded-[20px] transition-all duration-300 ${tab === 'plan' ? 'bg-white shadow-lg shadow-gray-200/50 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            结算方案
          </button>
        </div>

        {tab === 'current' ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xs font-black text-gray-400 mb-5 ml-1 uppercase tracking-widest">成员净资产状态</h3>
            <div className="bg-white rounded-[32px] p-2 shadow-xl shadow-gray-200/30 overflow-hidden divide-y divide-gray-50">
              {members.map(member => {
                const balance = memberBalances[member.id] || 0;
                const isCreditor = balance > 0;
                const isBalanced = Math.abs(balance) < 0.01;
                
                return (
                  <div key={member.id} className="p-5 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img src={member.avatar} className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100" />
                        {!isBalanced && (
                          <div className={`absolute -bottom-1 -right-1 p-1 rounded-full text-white border-2 border-white ${isCreditor ? 'bg-emerald-500' : 'bg-red-400'}`}>
                            {isCreditor ? <TrendingUp size={10} strokeWidth={3} /> : <TrendingDown size={10} strokeWidth={3} />}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800">{member.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wide ${isCreditor ? 'text-emerald-500' : isBalanced ? 'text-gray-300' : 'text-red-400'}`}>
                          {isBalanced ? '已结平' : isCreditor ? '待收回' : '应支付'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black ${isCreditor ? 'text-emerald-600' : isBalanced ? 'text-gray-300' : 'text-red-500'}`}>
                        {isBalanced ? '¥0' : `${isCreditor ? '+' : '-'}¥${Math.abs(Math.round(balance))}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 bg-gray-900 rounded-[28px] p-6 text-white shadow-2xl shadow-gray-400/20">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="text-orange-400" size={20} />
                <span className="text-sm font-black">旅行进行中</span>
              </div>
              <p className="text-xs opacity-70 leading-relaxed font-medium">
                当前数据基于已记录的 {Object.keys(memberBalances).length} 位成员消费计算。结算方案将根据这些结余自动生成。
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            {/* Settings Toggle */}
            <div className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-50 p-2.5 rounded-2xl text-orange-500 shadow-sm shadow-orange-100">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800 tracking-tight">智能简化方案</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">AI Algorithm Enabled</p>
                </div>
              </div>
              <button 
                onClick={() => setSmartRounding(!smartRounding)}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${smartRounding ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${smartRounding ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {/* AI Tip Box */}
            <div className="bg-blue-600 rounded-[28px] p-5 flex items-center space-x-4 mb-8 shadow-xl shadow-blue-200/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-50"></div>
              <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-2xl text-white shrink-0">
                <Sparkles size={20} />
              </div>
              <div className="relative">
                <p className="text-xs font-black text-white mb-0.5">转账次数最少化</p>
                <p className="text-[10px] text-blue-100 font-medium leading-relaxed">已自动计算最优路径，仅需 {plan.length} 次转账即可结平全组账单。</p>
              </div>
            </div>

            {/* Settlement Steps List */}
            <div className="space-y-6">
              {plan.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="text-gray-300" size={32} />
                  </div>
                  <p className="text-sm font-black text-gray-400">目前账单已全部结平</p>
                </div>
              ) : (
                plan.map((step, idx) => {
                  const fromMember = members.find(m => m.id === step.from);
                  const toMember = members.find(m => m.id === step.to);
                  const isSettled = settledSteps.includes(idx);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`group bg-white rounded-[32px] p-6 shadow-xl transition-all duration-500 border ${isSettled ? 'border-emerald-100 opacity-60 bg-emerald-50/20' : 'border-gray-50 shadow-gray-200/40 hover:shadow-gray-300/40'}`}
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex flex-col items-center space-y-3">
                          <div className={`w-14 h-14 rounded-full p-1 border-2 transition-colors duration-500 ${isSettled ? 'border-gray-200 grayscale' : 'border-red-400'}`}>
                            <img src={fromMember?.avatar} className="w-full h-full rounded-full object-cover" alt={fromMember?.name} />
                          </div>
                          <div className="text-center">
                            <span className="text-[11px] font-black text-gray-900 block">{fromMember?.name}</span>
                            <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">支付方</span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center px-4">
                          <div className="relative w-full flex items-center justify-center mb-2">
                             <div className={`h-0.5 flex-1 bg-gradient-to-r transition-all duration-500 ${isSettled ? 'from-gray-100 to-gray-200' : 'from-red-200 to-emerald-200'}`}></div>
                             <div className={`px-4 py-2 rounded-2xl text-base font-black shadow-lg transition-all duration-500 ${isSettled ? 'bg-gray-100 text-gray-400 shadow-none' : 'bg-white text-gray-900 shadow-gray-100'}`}>
                               ¥{step.amount}
                             </div>
                             <div className={`h-0.5 flex-1 bg-gradient-to-r transition-all duration-500 ${isSettled ? 'from-gray-200 to-gray-100' : 'from-emerald-200 to-red-200'}`}></div>
                             {!isSettled && <ChevronRight size={14} className="absolute -right-1 text-emerald-400 animate-pulse" />}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isSettled ? 'text-gray-300' : 'text-orange-500'}`}>
                            {isSettled ? '已确认转账' : '微信 / 支付宝 / 现金'}
                          </span>
                        </div>

                        <div className="flex flex-col items-center space-y-3">
                          <div className={`w-14 h-14 rounded-full p-1 border-2 transition-colors duration-500 ${isSettled ? 'border-gray-200 grayscale' : 'border-emerald-400'}`}>
                            <img src={toMember?.avatar} className="w-full h-full rounded-full object-cover" alt={toMember?.name} />
                          </div>
                          <div className="text-center">
                            <span className="text-[11px] font-black text-gray-900 block">{toMember?.name}</span>
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">接收方</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleSettle(idx)}
                        className={`w-full py-4 rounded-[22px] text-xs font-black flex items-center justify-center space-x-2 transition-all duration-300 active:scale-95 ${
                          isSettled 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                          : 'bg-gray-900 text-white shadow-xl shadow-gray-300 hover:bg-black'
                        }`}
                      >
                        {isSettled ? (
                          <>
                            <Check size={16} strokeWidth={3} />
                            <span>结清成功</span>
                          </>
                        ) : (
                          <>
                            <span>标记已转账</span>
                            <ChevronRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settlement;
