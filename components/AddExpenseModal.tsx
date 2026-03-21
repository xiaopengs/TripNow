import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, Mic, MicOff, Calculator, Users } from 'lucide-react';
import { Category, SplitType, Member, Expense } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  members: Member[];
  initialData?: Partial<Expense>;
}

// 分摊方式
interface SplitConfig {
  type: SplitType;
  customAmounts?: Record<string, number>; // 自定义金额
  customShares?: Record<string, number>;   // 自定义份额
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  members, 
  initialData 
}) => {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<Category>(initialData?.category || Category.Food);
  const [payerId, setPayerId] = useState(initialData?.payerId || members[3]?.id || members[0]?.id);
  const [participants, setParticipants] = useState<string[]>(initialData?.participants || members.map(m => m.id));
  const [note, setNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [splitConfig, setSplitConfig] = useState<SplitConfig>({
    type: SplitType.Equal
  });
  const [showSplitDetail, setShowSplitDetail] = useState(false);

  // 语音输入模拟
  const handleVoiceInput = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      // 模拟语音识别结果
      setTimeout(() => {
        setNote('今天吃的这家餐厅味道不错，推荐');
      }, 500);
    } else {
      setIsRecording(true);
      // 3秒后自动停止
      setTimeout(() => {
        setIsRecording(false);
        setNote('今天吃的这家餐厅味道不错，推荐');
      }, 3000);
    }
  }, [isRecording]);

  // 计算每人分摊金额
  const calculateSplitAmount = useCallback((memberId: string): number => {
    const total = parseFloat(amount) || 0;
    
    switch (splitConfig.type) {
      case SplitType.Equal:
        return participants.includes(memberId) ? total / participants.length : 0;
      
      case SplitType.Fixed:
        return splitConfig.customAmounts?.[memberId] || 0;
      
      case SplitType.Percentage:
        const share = splitConfig.customShares?.[memberId] || 0;
        return total * (share / 100);
      
      default:
        return 0;
    }
  }, [amount, participants, splitConfig]);

  useEffect(() => {
    if (initialData) {
      if (initialData.amount) setAmount(initialData.amount.toString());
      if (initialData.title) setTitle(initialData.title);
      if (initialData.category) setCategory(initialData.category);
      if (initialData.payerId) setPayerId(initialData.payerId);
      if (initialData.participants) setParticipants(initialData.participants);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!amount || !title) return;
    onSubmit({
      title,
      amount: parseFloat(amount),
      payerId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      location: '大理古城',
      category,
      splitType: splitConfig.type,
      participants,
    });
    onClose();
  };

  const toggleParticipant = (id: string) => {
    setParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // 智能分摊建议
  const getSmartSplitSuggestion = () => {
    const total = parseFloat(amount) || 0;
    if (total === 0) return null;
    
    // 根据金额智能建议分摊方式
    if (total < 100) {
      return { type: SplitType.Equal, reason: '小额消费建议均分' };
    } else if (total > 500 && participants.length <= 2) {
      return { type: SplitType.Fixed, reason: '大额消费建议自定义' };
    }
    return { type: SplitType.Equal, reason: '建议均分' };
  };

  const suggestion = getSmartSplitSuggestion();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
          <h3 className="text-lg font-bold text-gray-800">新支出</h3>
          <button 
            onClick={handleSubmit} 
            className="p-2 bg-orange-500 rounded-full text-white shadow-lg shadow-orange-200 hover:bg-orange-600 transition-colors"
          >
            <Check size={20} />
          </button>
        </div>

        {/* Amount Input */}
        <div className="text-center mb-8">
          <span className="text-gray-400 text-sm mb-1 block">支出金额</span>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-3xl font-bold text-gray-900">¥</span>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-5xl font-black text-gray-900 w-48 text-center focus:outline-none placeholder-gray-200"
              placeholder="0.00"
              autoFocus
            />
          </div>
        </div>

        <div className="space-y-6 pb-10">
          {/* Title */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <input 
              type="text" 
              placeholder="这项支出叫什么？" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent w-full focus:outline-none text-sm font-medium placeholder-gray-400"
            />
          </div>

          {/* Category Picker */}
          <div>
            <p className="text-xs font-bold text-gray-400 mb-3 ml-1 uppercase tracking-wider">选择分类</p>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                    category === cat 
                      ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-100' 
                      : 'bg-white text-gray-500 border-gray-100 hover:border-orange-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Payer Selection */}
          <div>
            <p className="text-xs font-bold text-gray-400 mb-3 ml-1 uppercase tracking-wider">谁付的钱？</p>
            <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
              {members.map(member => (
                <button 
                  key={member.id}
                  onClick={() => setPayerId(member.id)}
                  className="flex flex-col items-center shrink-0"
                >
                  <div className={`w-14 h-14 rounded-full p-1 border-2 mb-2 transition-all ${payerId === member.id ? 'border-orange-500 scale-110' : 'border-transparent opacity-60'}`}>
                    <img src={member.avatar} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <span className={`text-[10px] font-bold ${payerId === member.id ? 'text-gray-900' : 'text-gray-400'}`}>{member.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Smart Split Section */}
          <div>
            <div className="flex justify-between items-center mb-3 ml-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">智能分摊</p>
              {suggestion && (
                <span className="text-[10px] text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                  {suggestion.reason}
                </span>
              )}
            </div>
            
            {/* Split Type Tabs */}
            <div className="flex space-x-2 mb-4">
              {[
                { type: SplitType.Equal, label: '均分', icon: Users },
                { type: SplitType.Fixed, label: '自定义', icon: Calculator },
              ].map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setSplitConfig({ type })}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    splitConfig.type === type
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Participants with Split Preview */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400">参与成员</span>
                <button 
                  onClick={() => setParticipants(members.map(m => m.id))}
                  className="text-[10px] font-bold text-orange-500"
                >
                  全选
                </button>
              </div>
              
              <div className="space-y-2">
                {members.map(member => {
                  const splitAmount = calculateSplitAmount(member.id);
                  const isParticipating = participants.includes(member.id);
                  
                  return (
                    <button 
                      key={member.id}
                      onClick={() => toggleParticipant(member.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isParticipating 
                          ? 'bg-white border-emerald-100' 
                          : 'bg-gray-100 border-transparent opacity-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img src={member.avatar} className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-sm font-bold text-gray-700">{member.name}</span>
                      </div>
                      {isParticipating && (
                        <span className="text-sm font-bold text-emerald-600">
                          ¥{splitAmount.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Voice Note */}
          <div>
            <p className="text-xs font-bold text-gray-400 mb-3 ml-1 uppercase tracking-wider">备注（语音输入）</p>
            <div className="bg-gray-50 rounded-2xl p-4 relative">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="添加备注..."
                className="w-full bg-transparent focus:outline-none text-sm resize-none"
                rows={2}
              />
              <button
                onClick={handleVoiceInput}
                className={`absolute right-3 bottom-3 p-2 rounded-full transition-all ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-orange-100 text-orange-500 hover:bg-orange-200'
                }`}
              >
                {isRecording ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
            </div>
            {isRecording && (
              <p className="text-xs text-red-500 mt-2 text-center">正在录音...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
