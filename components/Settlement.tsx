import React, { useState, useCallback } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  ChevronRight, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  QrCode,
  Copy,
  CheckCircle2,
  Wallet,
  CreditCard,
  Bell,
  X,
  MessageCircle
} from 'lucide-react';
import { SettlementStep, Member } from '../types';

interface SettlementProps {
  plan: SettlementStep[];
  members: Member[];
  memberBalances: Record<string, number>;
  onBack: () => void;
}

type SettlementStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface SettlementRecord {
  stepIndex: number;
  status: SettlementStatus;
  paidAt?: string;
  method?: 'wechat' | 'alipay' | 'cash';
  transactionId?: string;
}

type NotificationType = 'payment' | 'reminder' | 'success' | 'info';

interface NotificationCard {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  amount?: number;
  fromMember?: Member;
  toMember?: Member;
  timestamp: number;
  isRead: boolean;
}

const Settlement: React.FC<SettlementProps> = ({ plan, members, memberBalances, onBack }) => {
  const [tab, setTab] = useState<'current' | 'plan' | 'notifications'>('plan');
  const [smartRounding, setSmartRounding] = useState(true);
  const [settlementRecords, setSettlementRecords] = useState<SettlementRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationCard[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<{ step: SettlementStep; index: number } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmingStep, setConfirmingStep] = useState<number | null>(null);

  const generatePaymentLink = useCallback((step: SettlementStep) => {
    const toMember = members.find(m => m.id === step.to);
    return `weixin://wxpay/bizpayurl?pr=${Math.random().toString(36).substring(2, 10)}&amount=${step.amount}&name=${encodeURIComponent(toMember?.name || '')}`;
  }, [members]);

  const handleCopyLink = useCallback(async (step: SettlementStep) => {
    const link = generatePaymentLink(step);
    try {
      await navigator.clipboard.writeText(link);
      alert('支付链接已复制到剪贴板');
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('支付链接已复制到剪贴板');
    }
  }, [generatePaymentLink]);

  const handleOpenQR = useCallback((step: SettlementStep, index: number) => {
    setSelectedStep({ step, index });
    setShowQRModal(true);
  }, []);

  const handleCloseQR = useCallback(() => {
    setShowQRModal(false);
    setSelectedStep(null);
  }, []);

  const handleOpenConfirm = useCallback((index: number) => {
    setConfirmingStep(index);
    setShowConfirmModal(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setShowConfirmModal(false);
    setConfirmingStep(null);
  }, []);

  const handleConfirmSettle = useCallback((index: number, method: 'wechat' | 'alipay' | 'cash') => {
    const step = plan[index];
    const fromMember = members.find(m => m.id === step.from);
    const toMember = members.find(m => m.id === step.to);

    setSettlementRecords(prev => {
      const existing = prev.find(r => r.stepIndex === index);
      if (existing) {
        return prev.map(r => r.stepIndex === index ? {
          ...r,
          status: 'completed' as SettlementStatus,
          paidAt: new Date().toISOString(),
          method,
          transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        } : r);
      }
      return [...prev, {
        stepIndex: index,
        status: 'completed',
        paidAt: new Date().toISOString(),
        method,
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      }];
    });

    const newNotification: NotificationCard = {
      id: `notif_${Date.now()}`,
      type: 'success',
      title: '结算完成',
      message: `${fromMember?.name} 已向 ${toMember?.name} 支付 ¥${step.amount}`,
      amount: step.amount,
      fromMember,
      toMember,
      timestamp: Date.now(),
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);

    setShowConfirmModal(false);
    setConfirmingStep(null);
  }, [plan, members]);

  const isStepSettled = useCallback((index: number) => {
    return settlementRecords.some(r => r.stepIndex === index && r.status === 'completed');
  }, [settlementRecords]);

  const getSettlementRecord = useCallback((index: number) => {
    return settlementRecords.find(r => r.stepIndex === index);
  }, [settlementRecords]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const sendReminder = useCallback((step: SettlementStep) => {
    const fromMember = members.find(m => m.id === step.from);
    const toMember = members.find(m => m.id === step.to);
    
    const reminderNotification: NotificationCard = {
      id: `notif_${Date.now()}`,
      type: 'reminder',
      title: '付款提醒已发送',
      message: `已向 ${fromMember?.name} 发送付款提醒（应付给 ${toMember?.name} ¥${step.amount}）`,
      amount: step.amount,
      fromMember,
      toMember,
      timestamp: Date.now(),
      isRead: false
    };
    setNotifications(prev => [reminderNotification, ...prev]);
  }, [members]);

  const stats = React.useMemo(() => {
    const totalAmount = plan.reduce((sum, step) => sum + step.amount, 0);
    const settledAmount = settlementRecords
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + plan[r.stepIndex].amount, 0);
    const pendingAmount = totalAmount - settledAmount;
    const progress = totalAmount > 0 ? (settledAmount / totalAmount) * 100 : 0;
    
    return { totalAmount, settledAmount, pendingAmount, progress };
  }, [plan, settlementRecords]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
        <div className="bg-gray-200/50 p-1.5 rounded-[24px] flex mb-6 relative">
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
          <button 
            onClick={() => setTab('notifications')}
            className={`flex-1 py-2.5 text-xs font-black rounded-[20px] transition-all duration-300 relative ${tab === 'notifications' ? 'bg-white shadow-lg shadow-gray-200/50 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            通知
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* 统计卡片 */}
        {tab !== 'notifications' && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">待结算</p>
              <p className="text-lg font-black text-orange-500">¥{stats.pendingAmount}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">已结算</p>
              <p className="text-lg font-black text-emerald-500">¥{stats.settledAmount}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">进度</p>
              <p className="text-lg font-black text-gray-900">{stats.progress.toFixed(0)}%</p>
            </div>
          </div>
        )}

        {/* 进度条 */}
        {tab !== 'notifications' && stats.totalAmount > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-600">结算进度</span>
              <span className="text-xs font-black text-emerald-500">
                {settlementRecords.filter(r => r.status === 'completed').length} / {plan.length} 笔
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
        )}

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
        ) : tab === 'plan' ? (
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
                  const isSettled = isStepSettled(idx);
                  const record = getSettlementRecord(idx);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`group bg-white rounded-[32px] p-6 shadow-xl transition-all duration-500 border ${isSettled ? 'border-emerald-100 opacity-80 bg-emerald-50/20' : 'border-gray-50 shadow-gray-200/40 hover:shadow-gray-300/40'}`}
                    >
                      {/* 结算状态标签 */}
                      {isSettled && (
                        <div className="flex items-center justify-center mb-4">
                          <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black flex items-center space-x-1">
                            <CheckCircle2 size={12} />
                            <span>已结算 · {record?.method === 'wechat' ? '微信支付' : record?.method === 'alipay' ? '支付宝' : '现金'}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-6">
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
                             <div className={`px-4 py-2 rounded-2xl text-base font-black shadow-lg transition-all duration-500 ${isSettled ? 'bg-emerald-100 text-emerald-600 shadow-none' : 'bg-white text-gray-900 shadow-gray-100'}`}>
                               ¥{step.amount}
                             </div>
                             <div className={`h-0.5 flex-1 bg-gradient-to-r transition-all duration-500 ${isSettled ? 'from-gray-200 to-gray-100' : 'from-emerald-200 to-red-200'}`}></div>
                             {!isSettled && <ChevronRight size={14} className="absolute -right-1 text-emerald-400 animate-pulse" />}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isSettled ? 'text-emerald-400' : 'text-orange-500'}`}>
                            {isSettled ? '✓ 结算完成' : '待支付'}
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

                      {/* 操作按钮组 */}
                      {!isSettled ? (
                        <div className="grid grid-cols-3 gap-3">
                          <button 
                            onClick={() => handleOpenQR(step, idx)}
                            className="py-3 rounded-[18px] text-[10px] font-black flex flex-col items-center justify-center space-y-1 transition-all duration-300 active:scale-95 bg-green-500 text-white shadow-lg shadow-green-200 hover:bg-green-600"
                          >
                            <QrCode size={16} />
                            <span>微信扫码</span>
                          </button>
                          <button 
                            onClick={() => handleCopyLink(step)}
                            className="py-3 rounded-[18px] text-[10px] font-black flex flex-col items-center justify-center space-y-1 transition-all duration-300 active:scale-95 bg-blue-500 text-white shadow-lg shadow-blue-200 hover:bg-blue-600"
                          >
                            <Copy size={16} />
                            <span>复制链接</span>
                          </button>
                          <button 
                            onClick={() => handleOpenConfirm(idx)}
                            className="py-3 rounded-[18px] text-[10px] font-black flex flex-col items-center justify-center space-y-1 transition-all duration-300 active:scale-95 bg-gray-900 text-white shadow-xl shadow-gray-300 hover:bg-black"
                          >
                            <Check size={16} />
                            <span>确认转账</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2 text-emerald-500">
                          <CheckCircle2 size={16} />
                          <span className="text-xs font-black">已于 {record?.paidAt ? new Date(record.paidAt).toLocaleDateString() : ''} 完成结算</span>
                        </div>
                      )}

                      {/* 提醒按钮 */}
                      {!isSettled && (
                        <button 
                          onClick={() => sendReminder(step)}
                          className="w-full mt-3 py-2 rounded-[14px] text-[10px] font-bold text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300 flex items-center justify-center space-x-1"
                        >
                          <Bell size={12} />
                          <span>发送付款提醒</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* 通知中心 */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xs font-black text-gray-400 mb-5 ml-1 uppercase tracking-widest">结算通知</h3>
            
            {notifications.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="text-gray-300" size={32} />
                </div>
                <p className="text-sm font-black text-gray-400">暂无通知</p>
                <p className="text-xs text-gray-300 mt-1">结算动态将显示在这里</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`bg-white rounded-[24px] p-5 shadow-sm border transition-all duration-300 ${notification.isRead ? 'border-gray-100 opacity-70' : 'border-orange-100 shadow-orange-100/30'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-2xl ${notification.type === 'success' ? 'bg-emerald-100 text-emerald-500' : notification.type === 'reminder' ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-blue-500'}`}>
                          {notification.type === 'success' ? <CheckCircle2 size={18} /> : notification.type === 'reminder' ? <Bell size={18} /> : <MessageCircle size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {!notification.isRead && (
                          <button 
                            onClick={() => markNotificationRead(notification.id)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 支付二维码弹窗 */}
      {showQRModal && selectedStep && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">微信支付</h3>
              <button onClick={handleCloseQR} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 mb-1">向 {members.find(m => m.id === selectedStep.step.to)?.name} 支付</p>
              <p className="text-3xl font-black text-gray-900">¥{selectedStep.step.amount}</p>
            </div>

            {/* 模拟二维码 */}
            <div className="bg-gray-50 rounded-3xl p-8 mb-6 flex items-center justify-center">
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-6 h-6 rounded-sm ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}
                    />
                  ))}
                </div>
                <div className="flex justify-center mt-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <QrCode size={16} className="text-white" />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mb-6">
              请使用微信扫一扫完成支付
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleCloseQR}
                className="py-3 rounded-[18px] text-xs font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-300"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  handleCloseQR();
                  handleOpenConfirm(selectedStep.index);
                }}
                className="py-3 rounded-[18px] text-xs font-black text-white bg-green-500 hover:bg-green-600 transition-all duration-300"
              >
                已完成支付
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 确认结算弹窗 */}
      {showConfirmModal && confirmingStep !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">确认结算</h3>
              <button onClick={handleCloseConfirm} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <p className="text-sm text-gray-500 mb-1">确认已向 {members.find(m => m.id === plan[confirmingStep].to)?.name} 支付</p>
              <p className="text-3xl font-black text-gray-900">¥{plan[confirmingStep].amount}</p>
            </div>

            <p className="text-xs text-gray-400 text-center mb-6">
              请选择支付方式
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <button 
                onClick={() => handleConfirmSettle(confirmingStep, 'wechat')}
                className="py-4 rounded-[18px] text-[10px] font-black flex flex-col items-center justify-center space-y-2 transition-all duration-300 active:scale-95 bg-green-50 text-green-600 hover:bg-green-100 border-2 border-green-200"
              >
                <QrCode size={20} />
                <span>微信支付</span>
              </button>
              <button 
                onClick={() => handleConfirmSettle(confirmingStep, 'alipay')}
                className="py-4 rounded-[18px] text-[10px] font-black flex flex-col items-center justify-center space-y-2 transition-all duration-300 active:scale-95 bg-blue-50 text-blue-600 hover:bg-blue-100 border-2 border-blue-200"
              >
                <CreditCard size={20} />
                <span>支付宝</span>
              </button>
              <button 
                onClick={() => handleConfirmSettle(confirmingStep, 'cash')}
                className="py-4 rounded-[18px] text-[10px] font-black flex flex-col items-center justify-center space-y-2 transition-all duration-300 active:scale-95 bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-gray-200"
              >
                <Wallet size={20} />
                <span>现金</span>
              </button>
            </div>

            <button 
              onClick={handleCloseConfirm}
              className="w-full py-3 rounded-[18px] text-xs font-black text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-300"
            >
              取消
            </button>          </div>
        </div>
      )}
    </div>
  );
};

export default Settlement;
