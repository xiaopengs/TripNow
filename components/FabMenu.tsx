import React, { useState, useEffect } from 'react';
import { Plus, Camera, Mic, PenLine, X } from 'lucide-react';

interface FabMenuProps {
  onManual: () => void;
  onCamera: () => void;
  onVoice: () => void;
}

const FabMenu: React.FC<FabMenuProps> = ({ onManual, onCamera, onVoice }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.fab-container')) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      // 震动反馈
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fab-container fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
      {/* 扇形菜单按钮 */}
      <div className={`relative transition-all duration-300 ${isOpen ? 'scale-100' : 'scale-0'}`}>
        {/* 手动记账 - 左侧 */}
        <button
          onClick={() => handleAction(onManual)}
          className={`absolute bottom-0 right-20 flex flex-col items-center gap-1 transition-all duration-300 ${
            isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}
          style={{ transitionDelay: isOpen ? '50ms' : '0ms' }}
        >
          <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100 hover:bg-orange-50 transition-colors">
            <PenLine className="w-6 h-6 text-orange-500" />
          </div>
          <span className="text-xs text-gray-600 font-medium whitespace-nowrap">手动记账</span>
        </button>

        {/* 拍照识别 - 上方 */}
        <button
          onClick={() => handleAction(onCamera)}
          className={`absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 transition-all duration-300 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: isOpen ? '100ms' : '0ms' }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-xl flex items-center justify-center border-4 border-white hover:scale-105 transition-transform">
            <Camera className="w-7 h-7 text-white" />
          </div>
          <span className="text-xs text-gray-600 font-medium whitespace-nowrap">拍照识别</span>
        </button>

        {/* 语音记账 - 右侧 */}
        <button
          onClick={() => handleAction(onVoice)}
          className={`absolute bottom-0 left-20 flex flex-col items-center gap-1 transition-all duration-300 ${
            isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}
          style={{ transitionDelay: isOpen ? '150ms' : '0ms' }}
        >
          <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100 hover:bg-orange-50 transition-colors">
            <Mic className="w-6 h-6 text-orange-500" />
          </div>
          <span className="text-xs text-gray-600 font-medium whitespace-nowrap">语音记账</span>
        </button>
      </div>

      {/* 主按钮 */}
      <button
        onClick={handleToggle}
        className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-gray-800 rotate-45' 
            : 'bg-gradient-to-br from-orange-400 to-orange-600 hover:scale-105'
        }`}
      >
        {isOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <Plus className="w-8 h-8 text-white" />
        )}
      </button>

      {/* 背景遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 animate-in fade-in duration-200"
          style={{ margin: '-100vh -100vw' }}
        />
      )}
    </div>
  );
};

export default FabMenu;
