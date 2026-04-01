import React, { useState, useEffect } from 'react';
import { Settings, X, ToggleLeft, ToggleRight, RefreshCw, Info } from 'lucide-react';

interface FinancialSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: FinancialSettings) => void;
}

export interface FinancialSettings {
  roundingEnabled: boolean; // 抹零开关
  roundingRule: 'none' | 'integer' | 'half'; // 抹零规则：不抹零/取整/四舍五入
  exchangeRateCache: boolean; // 汇率缓存
  exchangeRateExpiry: number; // 汇率过期时间（小时）
  autoSettlement: boolean; // 自动结算
  settlementThreshold: number; // 结算阈值（元）
}

const DEFAULT_SETTINGS: FinancialSettings = {
  roundingEnabled: false,
  roundingRule: 'none',
  exchangeRateCache: true,
  exchangeRateExpiry: 24, // 默认24小时
  autoSettlement: true,
  settlementThreshold: 100,
};

const FinancialSettingsModal: React.FC<FinancialSettingsProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
}) => {
  const [settings, setSettings] = useState<FinancialSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // 从本地存储加载设置
    const savedSettings = localStorage.getItem('tripnow_financial_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('tripnow_financial_settings', JSON.stringify(settings));
    onSettingsChange(settings);
    onClose();
  };

  const updateSetting = <K extends keyof FinancialSettings>(
    key: K,
    value: FinancialSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-900">财务设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[70vh] space-y-6">
          {/* 抹零设置 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">金额抹零</h3>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={() => updateSetting('roundingEnabled', !settings.roundingEnabled)}
                className="transition-transform active:scale-95"
              >
                {settings.roundingEnabled ? (
                  <ToggleRight className="w-12 h-7 text-orange-500" />
                ) : (
                  <ToggleLeft className="w-12 h-7 text-gray-300" />
                )}
              </button>
            </div>
            
            {settings.roundingEnabled && (
              <div className="ml-2 space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="roundingRule"
                    value="integer"
                    checked={settings.roundingRule === 'integer'}
                    onChange={() => updateSetting('roundingRule', 'integer')}
                    className="w-4 h-4 text-orange-500"
                  />
                  <span className="text-sm text-gray-700">取整（去小数）</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="roundingRule"
                    value="half"
                    checked={settings.roundingRule === 'half'}
                    onChange={() => updateSetting('roundingRule', 'half')}
                    className="w-4 h-4 text-orange-500"
                  />
                  <span className="text-sm text-gray-700">四舍五入</span>
                </label>
              </div>
            )}
          </section>

          {/* 汇率缓存 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">汇率缓存</h3>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={() => updateSetting('exchangeRateCache', !settings.exchangeRateCache)}
                className="transition-transform active:scale-95"
              >
                {settings.exchangeRateCache ? (
                  <ToggleRight className="w-12 h-7 text-orange-500" />
                ) : (
                  <ToggleLeft className="w-12 h-7 text-gray-300" />
                )}
              </button>
            </div>
            
            {settings.exchangeRateCache && (
              <div className="ml-2">
                <label className="block text-sm text-gray-700 mb-2">
                  缓存过期时间（小时）
                </label>
                <input
                  type="number"
                  value={settings.exchangeRateExpiry}
                  onChange={(e) => updateSetting('exchangeRateExpiry', Number(e.target.value))}
                  min={1}
                  max={168}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  onClick={() => {
                    // 清除汇率缓存
                    localStorage.removeItem('tripnow_exchange_rates');
                    alert('汇率缓存已清除');
                  }}
                  className="mt-2 flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600"
                >
                  <RefreshCw className="w-4 h-4" />
                  清除缓存
                </button>
              </div>
            )}
          </section>

          {/* 自动结算 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">自动结算</h3>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={() => updateSetting('autoSettlement', !settings.autoSettlement)}
                className="transition-transform active:scale-95"
              >
                {settings.autoSettlement ? (
                  <ToggleRight className="w-12 h-7 text-orange-500" />
                ) : (
                  <ToggleLeft className="w-12 h-7 text-gray-300" />
                )}
              </button>
            </div>
            
            {settings.autoSettlement && (
              <div className="ml-2">
                <label className="block text-sm text-gray-700 mb-2">
                  自动结算阈值（元）
                </label>
                <input
                  type="number"
                  value={settings.settlementThreshold}
                  onChange={(e) => updateSetting('settlementThreshold', Number(e.target.value))}
                  min={0}
                  step={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  当欠款超过此金额时，自动提醒结算
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all active:scale-95"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialSettingsModal;

// 辅助函数：应用抹零规则
export const applyRounding = (
  amount: number,
  settings: FinancialSettings
): number => {
  if (!settings.roundingEnabled) return amount;

  switch (settings.roundingRule) {
    case 'integer':
      return Math.floor(amount);
    case 'half':
      return Math.round(amount);
    default:
      return amount;
  }
};

// 辅助函数：获取缓存汇率
export const getCachedExchangeRate = async (
  fromCurrency: string,
  toCurrency: string,
  settings: FinancialSettings
): Promise<number | null> => {
  if (!settings.exchangeRateCache) {
    return null;
  }

  const cacheKey = `tripnow_exchange_rates_${fromCurrency}_${toCurrency}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { rate, timestamp } = JSON.parse(cached);
    const hoursSinceCache = (Date.now() - timestamp) / (1000 * 60 * 60);
    
    if (hoursSinceCache < settings.exchangeRateExpiry) {
      return rate;
    }
  }

  return null;
};

// 辅助函数：缓存汇率
export const cacheExchangeRate = (
  fromCurrency: string,
  toCurrency: string,
  rate: number
): void => {
  const cacheKey = `tripnow_exchange_rates_${fromCurrency}_${toCurrency}`;
  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      rate,
      timestamp: Date.now(),
    })
  );
};
