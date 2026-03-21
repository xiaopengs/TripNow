import React, { useState } from 'react';
import { X, Plus, UserPlus, Check, User } from 'lucide-react';
import { Member } from '../types';

interface ShadowMember {
  id: string;
  name: string;
  isClaimed: boolean;
  claimedBy?: string;
  avatar?: string;
}

interface ShadowMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: ShadowMember[];
  onAddMember: (name: string) => void;
  onClaimMember: (shadowId: string, userId: string) => void;
  currentUserId: string;
}

const ShadowMemberModal: React.FC<ShadowMemberModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddMember,
  onClaimMember,
  currentUserId,
}) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      onAddMember(newMemberName.trim());
      setNewMemberName('');
      setShowAddForm(false);
    }
  };

  const unclaimedMembers = members.filter(m => !m.isClaimed);
  const claimedMembers = members.filter(m => m.isClaimed);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
          <h3 className="text-lg font-bold text-gray-800">成员管理</h3>
          <div className="w-10" />
        </div>

        {/* Add Member Button */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl p-4 flex items-center justify-center space-x-2 text-orange-600 hover:bg-orange-100 transition-colors mb-6"
          >
            <Plus size={20} />
            <span className="font-bold">添加影子成员</span>
          </button>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              成员姓名
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="输入成员姓名"
                className="flex-1 bg-white rounded-xl p-3 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
              <button
                onClick={handleAddMember}
                disabled={!newMemberName.trim()}
                className="bg-orange-500 text-white px-4 rounded-xl font-bold disabled:opacity-50"
              >
                添加
              </button>
            </div>
          </div>
        )}

        {/* Unclaimed Members */}
        {unclaimedMembers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              待认领成员
            </h4>
            <div className="space-y-2">
              {unclaimedMembers.map(member => (
                <div
                  key={member.id}
                  className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={24} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{member.name}</p>
                      <p className="text-xs text-gray-400">影子成员</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onClaimMember(member.id, currentUserId)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors"
                  >
                    认领
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claimed Members */}
        {claimedMembers.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              已认领成员
            </h4>
            <div className="space-y-2">
              {claimedMembers.map(member => (
                <div
                  key={member.id}
                  className="bg-emerald-50 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User size={24} className="text-emerald-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{member.name}</p>
                      <p className="text-xs text-emerald-600 flex items-center">
                        <Check size={12} className="mr-1" />
                        已认领
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {members.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">暂无成员</p>
            <p className="text-xs mt-1">点击上方按钮添加</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShadowMemberModal;
