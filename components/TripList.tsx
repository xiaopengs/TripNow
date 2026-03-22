import React from 'react';
import { Plus, Users, Archive } from 'lucide-react';
import { Trip } from '../types';

interface TripListProps {
  trips: Trip[];
  currentTripId: string;
  onSelect: (trip: Trip) => void;
  onCreate: () => void;
  onOpenSidebar: () => void;
}

const TripList: React.FC<TripListProps> = ({ 
  trips, 
  currentTripId,
  onSelect, 
  onCreate,
  onOpenSidebar 
}) => {
  const currentTrip = trips.find(t => t.id === currentTripId);
  const ongoing = trips.filter(t => t.status === 'ongoing');
  const archived = trips.filter(t => t.status === 'finished' || t.status === 'archived');

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

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">拼途</h1>
            <p className="text-sm text-gray-400 mt-1">多账本旅行记账</p>
          </div>
          {/* 账本切换入口 */}
          <button
            onClick={onOpenSidebar}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${currentTrip ? getSkinColor(currentTrip.id) : 'from-gray-300 to-gray-400'}`} />
            <span className="text-sm font-bold text-gray-700">切换账本</span>
          </button>
        </div>
      </div>

      {/* Current Trip Card */}
      {currentTrip && (
        <div className="px-6 mb-8">
          <div className="bg-white rounded-3xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">当前账本</span>
              <span className="text-xs text-gray-400 font-medium">
                {currentTrip.status === 'ongoing' ? '进行中' : '已归档'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{currentTrip.name}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center space-x-1">
                <Users size={14} />
                <span>{currentTrip.members.length}人</span>
              </span>
              <span>·</span>
              <span>{currentTrip.location}</span>
            </div>
            <button
              onClick={() => onSelect(currentTrip)}
              className="w-full bg-gray-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-colors"
            >
              进入账本
            </button>
          </div>
        </div>
      )}

      <div className="px-6 space-y-8">
        {/* Ongoing Trips */}
        {ongoing.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-4 tracking-wider uppercase flex items-center justify-between">
              <span>进行中的旅行</span>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{ongoing.length}</span>
            </h3>
            <div className="space-y-4">
              {ongoing.filter(t => t.id !== currentTripId).map(trip => (
                <div 
                  key={trip.id} 
                  onClick={() => onSelect(trip)}
                  className="relative h-48 rounded-3xl overflow-hidden shadow-xl shadow-gray-200 group cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${getSkinColor(trip.id)}`}>
                    {trip.image && (
                      <img 
                        src={trip.image} 
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" 
                        alt={trip.name} 
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                    <h4 className="text-2xl font-bold text-white mb-2">{trip.name}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="bg-emerald-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold">进行中</div>
                        <div className="flex -space-x-2">
                          {trip.members.map((m, i) => (
                            <div key={m.id} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                              <img 
                                src={m.avatar || `https://picsum.photos/seed/${m.id}/100`} 
                                className="w-full h-full object-cover" 
                                alt={m.name} 
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/60 mb-0.5">预算</p>
                        <p className="text-lg font-bold text-white">¥{trip.budget.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/80 mt-2">{trip.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Archived Trips */}
        {archived.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-4 tracking-wider uppercase flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Archive size={14} />
                <span>已归档</span>
              </span>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{archived.length}</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {archived.map(trip => (
                <div 
                  key={trip.id} 
                  onClick={() => onSelect(trip)}
                  className="flex flex-col space-y-2 group cursor-pointer"
                >
                  <div className={`relative aspect-square rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-all bg-gradient-to-br ${getSkinColor(trip.id)}`}>
                    {trip.image && (
                      <img 
                        src={trip.image} 
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" 
                        alt={trip.name} 
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/30 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded-full">
                        已归档
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-800">{trip.name}</h5>
                    <p className="text-[10px] text-gray-400 font-medium">{trip.location} · ¥{trip.budget.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create New Button */}
      <div className="fixed bottom-28 left-0 right-0 flex justify-center">
        <button 
          onClick={onCreate}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full shadow-2xl shadow-indigo-200 flex items-center space-x-2 font-bold hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>开启新旅程</span>
        </button>
      </div>
    </div>
  );
};

export default TripList;