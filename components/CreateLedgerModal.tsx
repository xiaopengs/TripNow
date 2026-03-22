import React, { useState, useEffect } from 'react';
import { X, Check, MapPin, Palette, Users, ArrowRight, LocateFixed } from 'lucide-react';
import { Trip } from '../types';
import { getCurrentLocation, getCurrencyByLocationName, LocationInfo } from '../services/locationService';

interface CreateLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trip: Omit<Trip, 'id' | 'members' | 'status'>) => void;
}

// 预设皮肤颜色
const SKIN_COLORS = [
  { id: 'orange', bg: 'bg-orange-100', primary: 'bg-orange-500', name: '活力橙' },
  { id: 'blue', bg: 'bg-blue-100', primary: 'bg-blue-500', name: '天空蓝' },
  { id: 'green', bg: 'bg-emerald-100', primary: 'bg-emerald-500', name: '自然绿' },
  { id: 'purple', bg: 'bg-purple-100', primary: 'bg-purple-500', name: '梦幻紫' },
  { id: 'pink', bg: 'bg-pink-100', primary: 'bg-pink-500', name: '浪漫粉' },
  { id: 'gray', bg: 'bg-gray-100', primary: 'bg-gray-500', name: '简约灰' },
];

// 常用货币
const CURRENCIES = [
  { code: 'CNY', symbol: '¥', name: '人民币' },
  { code: 'USD', symbol: '$', name: '美元' },
  { code: 'EUR', symbol: '€', name: '欧元' },
  { code: 'JPY', symbol: '¥', name: '日元' },
  { code: 'KRW', symbol: '₩', name: '韩元' },
  { code: 'THB', symbol: '฿', name: '泰铢' },
  { code: 'SGD', symbol: 'S$', name: '新加坡元' },
  { code: 'HKD', symbol: 'HK$', name: '港币' },
];

const CreateLedgerModal: React.FC<CreateLedgerModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [currency, setCurrency] = useState('CNY');
  const [skin, setSkin] = useState('orange');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<LocationInfo | null>(null);

  // 自动检测位置并设置货币
  useEffect(() => {
    if (isOpen && step === 1) {
      detectLocation();
    }
  }, [isOpen]);

  const detectLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const locationInfo = await getCurrentLocation();
      setDetectedLocation(locationInfo);
      // 自动设置货币
      setCurrency(locationInfo.currency);
      // 如果位置名称为空，自动填充城市
      if (!location && locationInfo.city) {
        setLocation(locationInfo.city);
      }
    } catch (error) {
      console.log('定位失败:', error);
      setLocationError('无法获取位置，请手动输入');
    } finally {
      setIsLocating(false);
    }
  };

  // 当目的地输入变化时，尝试识别货币
  useEffect(() => {
    if (location) {
      const detected = getCurrencyByLocationName(location);
      setCurrency(detected.currency);
    }
  }, [location]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name || !location) return;
    
    const selectedSkin = SKIN_COLORS.find(s => s.id === skin);
    
    onSubmit({
      name,
      location,
      startDate,
      budget: parseFloat(budget) || 0,
      image: '', // 根据皮肤生成背景
    });
    
    // 重置表单
    setStep(1);
    setName('');
    setLocation('');
    setCurrency('CNY');
    setSkin('orange');
    setBudget('');
    
    onClose();
  };

  const nextStep = () => {
    if (step === 1 && name && location) {
      setStep(2);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={step === 1 ? onClose : prevStep} 
            className="p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 transition-colors"
          >
            {step === 1 ? <X size={20} /> : <ArrowRight size={20} className="rotate-180" />}
          </button>
          <h3 className="text-lg font-bold text-gray-800">
            {step === 1 ? '创建新账本' : '完善信息'}
          </h3>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Progress */}
        <div className="flex space-x-2 mb-8">
          {[1, 2].map(s => (
            <div 
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            {/* Trip Name */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                账本名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：云南七日游"
                className="w-full bg-gray-50 rounded-2xl p-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                目的地
                {isLocating && <span className="ml-2 text-orange-500">定位中...</span>}
                {detectedLocation && !isLocating && (
                  <span className="ml-2 text-green-500">已定位到 {detectedLocation.city || detectedLocation.country}</span>
                )}
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="例如：云南·大理"
                  className="w-full bg-gray-50 rounded-2xl p-4 pl-12 pr-12 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={detectLocation}
                  disabled={isLocating}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-orange-100 rounded-full text-orange-500 hover:bg-orange-200 transition-colors disabled:opacity-50"
                  title="重新定位"
                >
                  <LocateFixed size={16} className={isLocating ? 'animate-spin' : ''} />
                </button>
              </div>
              {locationError && (
                <p className="text-xs text-gray-400 mt-2">{locationError}</p>
              )}
              {detectedLocation && (
                <p className="text-xs text-green-600 mt-2">
                  自动识别货币: {detectedLocation.symbol} {detectedLocation.currency}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                开始日期
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-50 rounded-2xl p-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={nextStep}
              disabled={!name || !location}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
            >
              下一步
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Currency Selection */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                默认货币
                {detectedLocation && (
                  <span className="ml-2 text-green-500 text-xs">(根据位置自动识别)</span>
                )}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CURRENCIES.map(curr => (
                  <button
                    key={curr.code}
                    onClick={() => setCurrency(curr.code)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      currency === curr.code
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <span className="text-2xl font-bold">{curr.symbol}</span>
                    <span className="text-sm text-gray-600 ml-2">{curr.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Selection */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                账本皮肤
              </label>
              <div className="grid grid-cols-3 gap-3">
                {SKIN_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setSkin(color.id)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      skin === color.id
                        ? 'border-gray-800'
                        : 'border-transparent'
                    } ${color.bg}`}
                  >
                    <div className={`w-8 h-8 rounded-full ${color.primary} mx-auto mb-2`} />
                    <span className="text-xs font-bold text-gray-700">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget (Optional) */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                预算上限（可选）
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                  {CURRENCIES.find(c => c.code === currency)?.symbol}
                </span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-50 rounded-2xl p-4 pl-10 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Check size={24} />
              <span>创建账本</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateLedgerModal;
