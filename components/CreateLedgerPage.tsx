import React, { useState } from 'react';
import { ArrowLeft, Check, MapPin, Palette, Coins, ArrowRight } from 'lucide-react';
import { Trip } from '../types';

interface CreateLedgerPageProps {
  onBack: () => void;
  onSubmit: (trip: Omit<Trip, 'id' | 'members' | 'status'>) => void;
}

// 预设皮肤颜色
const SKIN_COLORS = [
  { id: 'orange', bg: 'bg-orange-100', primary: 'bg-orange-500', text: 'text-orange-500', name: '活力橙' },
  { id: 'blue', bg: 'bg-blue-100', primary: 'bg-blue-500', text: 'text-blue-500', name: '天空蓝' },
  { id: 'green', bg: 'bg-emerald-100', primary: 'bg-emerald-500', text: 'text-emerald-500', name: '自然绿' },
  { id: 'purple', bg: 'bg-purple-100', primary: 'bg-purple-500', text: 'text-purple-500', name: '梦幻紫' },
  { id: 'pink', bg: 'bg-pink-100', primary: 'bg-pink-500', text: 'text-pink-500', name: '浪漫粉' },
  { id: 'gray', bg: 'bg-gray-100', primary: 'bg-gray-500', text: 'text-gray-500', name: '简约灰' },
];

// 常用货币
const CURRENCIES = [
  { code: 'CNY', symbol: '¥', name: '人民币', flag: '🇨🇳' },
  { code: 'USD', symbol: '$', name: '美元', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: '欧元', flag: '🇪🇺' },
  { code: 'JPY', symbol: '¥', name: '日元', flag: '🇯🇵' },
  { code: 'KRW', symbol: '₩', name: '韩元', flag: '🇰🇷' },
  { code: 'THB', symbol: '฿', name: '泰铢', flag: '🇹🇭' },
  { code: 'SGD', symbol: 'S$', name: '新加坡元', flag: '🇸🇬' },
  { code: 'HKD', symbol: 'HK$', name: '港币', flag: '🇭🇰' },
];

const CreateLedgerPage: React.FC<CreateLedgerPageProps> = ({ 
  onBack, 
  onSubmit 
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [currency, setCurrency] = useState('CNY');
  const [skin, setSkin] = useState('orange');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const selectedSkin = SKIN_COLORS.find(s => s.id === skin);

  const handleSubmit = () => {
    if (!name || !location) return;
    
    onSubmit({
      name,
      location,
      startDate,
      budget: parseFloat(budget) || 0,
      image: '',
    });
  };

  const nextStep = () => {
    if (step === 1 && name && location) {
      setStep(2);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={prevStep}
            className="p-2 -ml-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-gray-800">
            {step === 1 ? '创建新账本' : '完善信息'}
          </h1>
          <div className="w-10" />
        </div>

        {/* Progress */}
        <div className="flex space-x-2">
          {[1, 2].map(s => (
            <div 
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                s <= step ? selectedSkin?.primary || 'bg-orange-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {step === 1 ? (
          <div className="space-y-6">
            {/* Trip Name */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block flex items-center">
                <span className="w-1 h-4 bg-gray-300 rounded-full mr-2" />
                账本名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：云南七日游"
                className="w-full bg-white rounded-2xl p-4 text-lg font-bold border border-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                autoFocus
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block flex items-center">
                <MapPin size={14} className="mr-2 text-gray-400" />
                目的地
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="例如：云南·大理"
                  className="w-full bg-white rounded-2xl p-4 pl-12 text-lg font-bold border border-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block flex items-center">
                <span className="w-1 h-4 bg-gray-300 rounded-full mr-2" />
                开始日期
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white rounded-2xl p-4 text-lg font-bold border border-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
            </div>

            {/* Quick Templates */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                快速选择
              </label>
              <div className="flex flex-wrap gap-2">
                {['周末短途', '国内游', '出境游', '商务出差', '亲子游'].map((template) => (
                  <button
                    key={template}
                    onClick={() => setName(template)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-orange-300 hover:text-orange-500 transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Currency Selection */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block flex items-center">
                <Coins size={14} className="mr-2 text-gray-400" />
                默认货币
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CURRENCIES.map(curr => (
                  <button
                    key={curr.code}
                    onClick={() => setCurrency(curr.code)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      currency === curr.code
                        ? `border-orange-500 bg-orange-50`
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{curr.flag}</span>
                      <div>
                        <span className="text-lg font-bold block">{curr.symbol}</span>
                        <span className="text-xs text-gray-500">{curr.name}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Selection */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block flex items-center">
                <Palette size={14} className="mr-2 text-gray-400" />
                账本皮肤
              </label>
              <div className="grid grid-cols-3 gap-3">
                {SKIN_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setSkin(color.id)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      skin === color.id
                        ? 'border-gray-800 shadow-md'
                        : 'border-transparent'
                    } ${color.bg}`}
                  >
                    <div className={`w-8 h-8 rounded-full ${color.primary} mx-auto mb-2 shadow-sm`} />
                    <span className="text-xs font-bold text-gray-700">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget (Optional) */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block flex items-center">
                <span className="w-1 h-4 bg-gray-300 rounded-full mr-2" />
                预算上限（可选）
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                  {CURRENCIES.find(c => c.code === currency)?.symbol}
                </span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white rounded-2xl p-4 pl-12 text-lg font-bold border border-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                />
              </div>
            </div>

            {/* Preview Card */}
            <div className={`p-5 rounded-3xl ${selectedSkin?.bg || 'bg-orange-100'} mt-6`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${selectedSkin?.text || 'text-orange-500'}`}>
                  预览
                </span>
                <span className="text-xs text-gray-500">{CURRENCIES.find(c => c.code === currency)?.symbol}</span>
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-1">{name || '账本名称'}</h3>
              <p className="text-sm text-gray-600 flex items-center">
                <MapPin size={14} className="mr-1" />
                {location || '目的地'}
              </p>
              {budget && (
                <div className="mt-3 pt-3 border-t border-black/10">
                  <span className="text-xs text-gray-500">预算上限</span>
                  <p className="text-lg font-bold text-gray-800">
                    {CURRENCIES.find(c => c.code === currency)?.symbol}{budget}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="bg-white px-6 py-4 pb-8 border-t border-gray-100">
        {step === 1 ? (
          <button
            onClick={nextStep}
            disabled={!name || !location}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center space-x-2 ${
              !name || !location
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : `${selectedSkin?.primary || 'bg-orange-500'} text-white shadow-orange-200 hover:opacity-90`
            }`}
          >
            <span>下一步</span>
            <ArrowRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center space-x-2 ${
              selectedSkin?.primary || 'bg-orange-500'
            } text-white shadow-orange-200 hover:opacity-90`}
          >
            <Check size={20} />
            <span>创建账本</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateLedgerPage;