import React from 'react';
import { X, Check, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Expense, Category } from '../types';

interface PendingExpense {
  id: string;
  tempId: string;
  image?: string;
  parsedData?: {
    title?: string;
    amount?: number;
    category?: Category;
    location?: string;
  };
  status: 'parsing' | 'pending' | 'error';
  createdAt: number;
}

interface InboxProps {
  isOpen: boolean;
  onClose: () => void;
  pendingItems: PendingExpense[];
  onConfirm: (tempId: string, data: Partial<Expense>) => void;
  onDelete: (tempId: string) => void;
  onRetry: (tempId: string) => void;
}

const Inbox: React.FC<InboxProps> = ({ 
  isOpen, 
  onClose, 
  pendingItems, 
  onConfirm, 
  onDelete,
  onRetry 
}) => {
  if (!isOpen) return null;

  const getCategoryIcon = (category?: Category) => {
    const icons: Record<string, string> = {
      '餐饮': '🍜',
      '交通': '🚗',
      '住宿': '🏨',
      '门票': '🎫',
      '购物': '🛍️',
      '娱乐': '🎭',
    };
    return icons[category || ''] || '📝';
  };

  const formatAmount = (amount?: number) => {
    if (amount === undefined || amount === null) return '¥--';
    return `¥${amount.toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom duration-300">
      {/* 头部 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">待处理账单</h2>
          {pendingItems.length > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {pendingItems.length}
            </span>
          )}
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* 内容区 */}
      <div className="p-4 pb-24 overflow-y-auto h-full">
        {pendingItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-medium">暂无待处理账单</p>
            <p className="text-sm mt-2">拍照或语音记账后会显示在这里</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <div 
                key={item.tempId}
                className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
                  item.status === 'parsing' 
                    ? 'border-orange-200 bg-orange-50/30' 
                    : item.status === 'error'
                    ? 'border-red-200 bg-red-50/30'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex">
                  {/* 图片缩略图 */}
                  <div className="w-24 h-24 bg-gray-100 flex-shrink-0 flex items-center justify-center relative">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt="receipt" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    )}
                    {item.status === 'parsing' && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* 信息区 */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(item.parsedData?.category)}</span>
                        <span className="font-bold text-lg text-gray-900">
                          {formatAmount(item.parsedData?.amount)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {item.parsedData?.title || '识别中...'}
                      </p>
                      {item.parsedData?.location && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          📍 {item.parsedData.location}
                        </p>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center justify-end gap-2 mt-2">
                      {item.status === 'error' ? (
                        <button
                          onClick={() => onRetry(item.tempId)}
                          className="px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                        >
                          重试
                        </button>
                      ) : item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onDelete(item.tempId)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onConfirm(item.tempId, item.parsedData || {})}
                            className="px-4 py-1.5 text-sm font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            确认
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
