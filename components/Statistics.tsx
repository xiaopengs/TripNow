
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface StatisticsProps {
  stats: any;
  onBack: () => void;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1'];

const Statistics: React.FC<StatisticsProps> = ({ stats, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-white pb-24 overflow-y-auto no-scrollbar">
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-20">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold">消费统计</h2>
        <div className="w-10"></div>
      </div>

      <div className="px-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-500 rounded-2xl p-4 text-white">
            <p className="text-xs opacity-80 mb-1">总消费</p>
            <p className="text-2xl font-bold">¥{stats.total.toLocaleString()}</p>
          </div>
          <div className="bg-purple-500 rounded-2xl p-4 text-white">
            <p className="text-xs opacity-80 mb-1">人均消费</p>
            <p className="text-2xl font-bold">¥{Math.round(stats.avgPerPerson).toLocaleString()}</p>
          </div>
          <div className="bg-emerald-500 rounded-2xl p-4 text-white">
            <p className="text-xs opacity-80 mb-1">消费笔数</p>
            <p className="text-2xl font-bold">{stats.count}</p>
          </div>
          <div className="bg-orange-500 rounded-2xl p-4 text-white">
            <p className="text-xs opacity-80 mb-1">平均单笔</p>
            <p className="text-2xl font-bold">¥{Math.round(stats.avgPerEntry).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-gray-800 mb-6">分类占比</h3>
          
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categories}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categories.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="text-center">
                 <p className="text-[10px] text-gray-400">主要支出</p>
                 <p className="text-sm font-bold text-gray-800">{stats.categories[0]?.name}</p>
               </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {stats.categories.map((cat: any, index: number) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm text-gray-600">{cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">¥{cat.value}</p>
                  <p className="text-[10px] text-gray-400">{((cat.value / stats.total) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
