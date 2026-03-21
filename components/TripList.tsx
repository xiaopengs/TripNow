
import React from 'react';
import { Plus, Users } from 'lucide-react';
import { Trip } from '../types';

interface TripListProps {
  trips: Trip[];
  onSelect: (trip: Trip) => void;
  onCreate: () => void;
}

const TripList: React.FC<TripListProps> = ({ trips, onSelect, onCreate }) => {
  const ongoing = trips.filter(t => t.status === 'ongoing');
  const finished = trips.filter(t => t.status === 'finished');

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24 overflow-y-auto no-scrollbar">
      <div className="px-6 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900">拼途</h1>
      </div>

      <div className="px-6 space-y-8">
        <div>
          <h3 className="text-sm font-bold text-gray-500 mb-4 tracking-wider uppercase">进行中的旅行</h3>
          <div className="space-y-4">
            {ongoing.map(trip => (
              <div 
                key={trip.id} 
                onClick={() => onSelect(trip)}
                className="relative h-48 rounded-3xl overflow-hidden shadow-xl shadow-gray-200 group cursor-pointer"
              >
                <img src={trip.image} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt={trip.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                  <h4 className="text-2xl font-bold text-white mb-2">{trip.name}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="bg-emerald-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold">进行中</div>
                      <div className="flex -space-x-2">
                        {trip.members.map((m, i) => (
                          <div key={m.id} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                             <img src={m.avatar} className="w-full h-full object-cover" alt={m.name} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/60 mb-0.5">当前总支出</p>
                      <p className="text-lg font-bold text-white">¥2,618</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/80 mt-2">{trip.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-500 mb-4 tracking-wider uppercase">往期回忆</h3>
          <div className="grid grid-cols-2 gap-4">
            {finished.map(trip => (
              <div 
                key={trip.id} 
                onClick={() => onSelect(trip)}
                className="flex flex-col space-y-2 group cursor-pointer"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-all">
                  <img src={trip.image} className="w-full h-full object-cover group-hover:scale-110 duration-700" alt={trip.name} />
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-gray-800">{trip.name}</h5>
                  <p className="text-[10px] text-gray-400 font-medium">¥{trip.budget.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
