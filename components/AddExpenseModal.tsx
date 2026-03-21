
import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { Category, SplitType, Member, Expense } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  members: Member[];
  initialData?: Partial<Expense>;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSubmit, members, initialData }) => {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<Category>(initialData?.category || Category.Food);
  const [payerId, setPayerId] = useState(initialData?.payerId || members[3].id); // 默认“小美”
  const [participants, setParticipants] = useState<string[]>(initialData?.participants || members.map(m => m.id));

  useEffect(() => {
    if (initialData) {
      if (initialData.amount) setAmount(initialData.amount.toString());
      if (initialData.title) setTitle(initialData.title);
      if (initialData.category) setCategory(initialData.category);
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
      splitType: SplitType.Equal,
      participants,
    });
    onClose();
  };

  const toggleParticipant = (id: string) => {
    setParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400">
            <X size={20} />
          </button>
          <h3 className="text-lg font-bold text-gray-800">新支出</h3>
          <button onClick={handleSubmit} className="p-2 bg-orange-500 rounded-full text-white shadow-lg shadow-orange-200">
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

        <div className="space-y-6 overflow-y-auto max-h-[60vh] no-scrollbar pb-10">
          {/* Title */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
              <ChevronRight size={18} />
            </div>
            <input 
              type="text" 
              placeholder="这项支出叫什么？" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent flex-1 focus:outline-none text-sm font-medium"
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

          {/* Participants */}
          <div>
            <div className="flex justify-between items-center mb-3 ml-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">谁参与分摊？</p>
              <button 
                onClick={() => setParticipants(members.map(m => m.id))}
                className="text-[10px] font-bold text-orange-500"
              >
                全选
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {members.map(member => (
                <button 
                  key={member.id}
                  onClick={() => toggleParticipant(member.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full border transition-all ${
                    participants.includes(member.id) 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                    : 'bg-white border-gray-100 text-gray-400 opacity-50'
                  }`}
                >
                  <img src={member.avatar} className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-[10px] font-bold">{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
