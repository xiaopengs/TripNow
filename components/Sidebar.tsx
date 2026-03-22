import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  Archive, 
  Plus, 
  Settings, 
  Users, 
  MapPin, 
  Calendar,
  MoreVertical,
  ChevronLeft,
  Wallet
} from 'lucide-react';
import { Trip } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  trips: Trip[];
  currentTripId: string;
  onSelectTrip: (tripId: string) => void;
  onCreateTrip: () => void;
  onArchiveTrip: (tripId: string) => void;
  onUnarchiveTrip: (tripId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  trips,
  currentTripId,
  onSelectTrip,
  onCreateTrip,
  onArchiveTrip,
  onUnarchiveTrip,
}) => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'archived'>('ongoing');
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  const ongoingTrips = trips.filter(t => t.status === 'ongoing');
  const archivedTrips = trips.filter(t => t.status === 'finished' || t.status === 'archived');

  const currentTrips = activeTab === 'ongoing' ? ongoingTrips : archivedTrips;

  const handleTripClick = (tripId: string) => {
    if (expandedTripId === tripId) {
      setExpandedTripId(null);
    } else {
      setExpandedTripId(tripId);
    }
  };

  const handleSelectTrip = (tripId: string) => {
    onSelectTrip(tripId);
    onClose();
  };

  const handleArchive = (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    onArchiveTrip(tripId);
    setExpandedTripId(null);
  };

  const handleUnarchive = (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    onUnarchiveTrip(tripId);
    setExpandedTripId(null);
  };

  // 获取账本皮肤颜色
  const getSkinColor = (tripId: string) => {
    const colors = [
      'from-orange-400 to-orange-500',
      'from-blue-400 to-blue-500',
      'from-emerald-400 to-emerald-500',
      'from-purple-400 to-purple-500',
      'from-pink-400 to-pink-500',
    ];
    const index = tripId.charCodeAt(tripId.length - 1) % colors.length;
    return colors[index];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 遮罩层 */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* 侧边栏 */}
      <div className="relative w-80 h-full bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                <Wallet className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">我的账本</h2>
                <p className="text-xs text-gray-400 font-medium">{trips.length} 个账本</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('ongoing')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ongoing'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              进行中 ({ongoingTrips.length})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'archived'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              已归档 ({archivedTrips.length})
            </button>
          </div>
        </div>

        {/* Trip List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentTrips.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive className="text-gray-300" size={24} />
              </div>
              <p className="text-sm text-gray-400 font-medium">
                {activeTab === 'ongoing' ? '暂无进行中的账本' : '暂无归档账本'}
              </p>
            </div>
          ) : (
            currentTrips.map(trip => (
              <div
                key={trip.id}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-200 ${
                  currentTripId === trip.id 
                    ? 'ring-2 ring-orange-500 ring-offset-2' 
                    : 'hover:shadow-md'
                }`}
              >
                {/* Trip Card */}
                <div 
                  onClick={() => handleTripClick(trip.id)}
                  className="cursor-pointer"
                >
                  {/* Background Image */}
                  <div className={`h-24 bg-gradient-to-br ${getSkinColor(trip.id)} relative p-4`}>
                    {trip.image && (
                      <img 
                        src={trip.image} 
                        alt={trip.name}
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                      />
                    )}
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-black text-lg drop-shadow-md">{trip.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin size={12} className="text-white/80" />
                          <span className="text-xs text-white/80 font-medium">{trip.location}</span>
                        </div>
                      </div>
                      {currentTripId === trip.id && (
                        <div className="bg-white/20 backdrop-blur-md rounded-full px-2 py-1">
                          <span className="text-[10px] text-white font-bold">当前</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trip Info */}
                  <div className="bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                          {trip.members.slice(0, 3).map((m, i) => (
                            <div 
                              key={m.id} 
                              className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                            >
                              <img 
                                src={m.avatar || `https://picsum.photos/seed/${m.id}/100`} 
                                className="w-full h-full object-cover" 
                                alt={m.name}
                              />
                            </div>
                          ))}
                          {trip.members.length > 3 && (
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                              <span className="text-[8px] text-gray-500 font-bold">+{trip.members.length - 3}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{trip.members.length}人</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Calendar size={12} />
                        <span className="text-xs font-medium">{trip.startDate}</span>
                      </div>
                    </div>

                    {/* Budget Progress */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">预算</span>
                        <span className="text-xs font-bold text-gray-700">¥{trip.budget.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full"
                          style={{ width: `${Math.min((trip.budget / 10000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Actions */}
                {expandedTripId === trip.id && (
                  <div className="bg-gray-50 p-3 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSelectTrip(trip.id)}
                        className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <span>切换到此账本</span>
                        <ChevronRight size={14} />
                      </button>
                      {activeTab === 'ongoing' ? (
                        <button
                          onClick={(e) => handleArchive(e, trip.id)}
                          className="px-3 py-2.5 bg-gray-200 text-gray-600 rounded-xl hover:bg-gray-300 transition-colors"
                          title="归档账本"
                        >
                          <Archive size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleUnarchive(e, trip.id)}
                          className="px-3 py-2.5 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-colors"
                          title="恢复账本"
                        >
                          <Settings size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer - Create New */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onCreateTrip}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
          >
            <Plus size={18} />
            <span>创建新账本</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;