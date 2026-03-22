import React, { useState, useEffect } from 'react';
import { X, Plus, UserPlus, Check, User, Copy, Share2, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { ExtendedMember, MemberType } from '../types';

export interface ShadowMember {
  id: string;
  name: string;
  type: MemberType;
  isClaimed: boolean;
  claimedBy?: string;
  avatar?: string;
  claimToken?: string;
  createdAt: string;
}

interface ShadowMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: ShadowMember[];
  currentUserId: string;
  currentUserName: string;
  tripId: string;
  onAddShadowMember: (name: string) => void;
  onClaimShadowMember: (shadowId: string, userId: string) => void;
  onMigrateMember?: (fromId: string, toId: string) => void;
}

// 生成认领令牌
const generateClaimToken = (memberId: string, tripId: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 6);
  return `claim_${tripId}_${memberId}_${timestamp}_${random}`;
};

const ShadowMemberModal: React.FC<ShadowMemberModalProps> = ({
  isOpen,
  onClose,
  members,
  currentUserId,
  currentUserName,
  tripId,
  onAddShadowMember,
  onClaimShadowMember,
  onMigrateMember,
}) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'shadow' | 'real'>('all');
  const [showMigrationConfirm, setShowMigrationConfirm] = useState<string | null>(null);

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setNewMemberName('');
      setShowAddForm(false);
      setCopiedToken(null);
      setActiveTab('all');
      setShowMigrationConfirm(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      onAddShadowMember(newMemberName.trim());
      setNewMemberName('');
      setShowAddForm(false);
    }
  };

  const handleCopyToken = (member: ShadowMember) => {
    const token = member.claimToken || generateClaimToken(member.id, tripId);
    navigator.clipboard.writeText(token).then(() => {
      setCopiedToken(member.id);
      setTimeout(() => setCopiedToken(null), 2000);
    });
  };

  const handleShareClaimLink = (member: ShadowMember) => {
    const token = member.claimToken || generateClaimToken(member.id, tripId);
    const claimUrl = `${window.location.origin}/claim/${token}`;
    
    if (navigator.share) {
      navigator.share({
        title: '认领 TripNow 成员',
        text: `${currentUserName} 邀请你认领 "${member.name}" 的身份`,
        url: claimUrl,
      });
    } else {
      navigator.clipboard.writeText(claimUrl);
      setCopiedToken(member.id);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  // 过滤成员
  const filteredMembers = members.filter(m => {
    if (activeTab === 'shadow') return m.type === 'shadow';
    if (activeTab === 'real') return m.type === 'real';
    return true;
  });

  const shadowMembers = filteredMembers.filter(m => m.type === 'shadow');
  const realMembers = filteredMembers.filter(m => m.type === 'real');

  // 检查当前用户是否可以认领某个影子成员
  const canClaim = (member: ShadowMember) => {
    // 不能认领已被认领的
    if (member.isClaimed) return false;
    // 不能认领自己创建的影子成员（可选规则）
    // if (member.createdBy === currentUserId) return false;
    return true;
  };

  // 检查当前用户是否可以迁移身份
  const canMigrate = (member: ShadowMember) => {
    return member.type === 'shadow' && !member.isClaimed && onMigrateMember;
  };

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

        {/* Tab 切换 */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          {(['all', 'shadow', 'real'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === tab
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'all' ? '全部' : tab === 'shadow' ? '影子成员' : '真实用户'}
            </button>
          ))}
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
                placeholder="输入成员姓名（无需注册）"
                className="flex-1 bg-white rounded-xl p-3 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              />
              <button
                onClick={handleAddMember}
                disabled={!newMemberName.trim()}
                className="bg-orange-500 text-white px-4 rounded-xl font-bold disabled:opacity-50"
              >
                添加
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              影子成员无需注册，创建后即可参与记账
            </p>
          </div>
        )}

        {/* 影子成员区域 */}
        {(activeTab === 'all' || activeTab === 'shadow') && shadowMembers.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                影子成员
              </h4>
              <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                无需注册
              </span>
            </div>
            <div className="space-y-2">
              {shadowMembers.map(member => (
                <div
                  key={member.id}
                  className={`rounded-2xl p-4 transition-all ${
                    member.isClaimed 
                      ? 'bg-emerald-50 border border-emerald-100' 
                      : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        member.isClaimed ? 'bg-emerald-100' : 'bg-gray-200'
                      }`}>
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User size={24} className={member.isClaimed ? 'text-emerald-500' : 'text-gray-400'} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{member.name}</p>
                        <p className={`text-xs flex items-center ${
                          member.isClaimed ? 'text-emerald-600' : 'text-gray-400'
                        }`}>
                          {member.isClaimed ? (
                            <>
                              <Check size={12} className="mr-1" />
                              已认领
                            </>
                          ) : (
                            '待认领'
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex items-center space-x-2">
                      {!member.isClaimed ? (
                        <>
                          {/* 认领按钮 */}
                          {canClaim(member) && (
                            <button
                              onClick={() => onClaimShadowMember(member.id, currentUserId)}
                              className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors"
                            >
                              认领
                            </button>
                          )}
                          {/* 分享认领链接 */}
                          <button
                            onClick={() => handleShareClaimLink(member)}
                            className="p-2 bg-white rounded-xl text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                            title="分享认领链接"
                          >
                            <Share2 size={18} />
                          </button>
                          {/* 复制令牌 */}
                          <button
                            onClick={() => handleCopyToken(member)}
                            className="p-2 bg-white rounded-xl text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                            title="复制认领令牌"
                          >
                            {copiedToken === member.id ? (
                              <Check size={18} className="text-emerald-500" />
                            ) : (
                              <Copy size={18} />
                            )}
                          </button>
                          {/* 身份迁移 */}
                          {canMigrate(member) && (
                            <button
                              onClick={() => setShowMigrationConfirm(member.id)}
                              className="p-2 bg-white rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                              title="迁移身份"
                            >
                              <ArrowRightLeft size={18} />
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium">
                          已绑定
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 认领信息 */}
                  {member.isClaimed && member.claimedBy && (
                    <div className="mt-3 pt-3 border-t border-emerald-100">
                      <p className="text-xs text-emerald-600">
                        认领者: {member.claimedBy === currentUserId ? '你' : member.claimedBy}
                      </p>
                    </div>
                  )}

                  {/* 迁移确认弹窗 */}
                  {showMigrationConfirm === member.id && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-start space-x-2">
                        <AlertCircle size={16} className="text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-blue-800 font-medium">
                            确认迁移身份？
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            将 "{member.name}" 的所有账单迁移到当前账户
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => {
                                onMigrateMember?.(member.id, currentUserId);
                                setShowMigrationConfirm(null);
                              }}
                              className="flex-1 bg-blue-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              确认迁移
                            </button>
                            <button
                              onClick={() => setShowMigrationConfirm(null)}
                              className="flex-1 bg-white text-gray-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 真实用户区域 */}
        {(activeTab === 'all' || activeTab === 'real') && realMembers.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              真实用户
            </h4>
            <div className="space-y-2">
              {realMembers.map(member => (
                <div
                  key={member.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User size={24} className="text-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{member.name}</p>
                      <p className="text-xs text-blue-500 flex items-center">
                        <Check size={12} className="mr-1" />
                        已注册
                      </p>
                    </div>
                  </div>
                  {member.id === currentUserId && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                      我
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">暂无成员</p>
            <p className="text-xs mt-1">点击上方按钮添加影子成员</p>
          </div>
        )}

        {/* 说明信息 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            关于影子成员
          </h5>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• 影子成员无需注册即可参与记账</li>
            <li>• 任何真实用户都可以认领影子成员</li>
            <li>• 认领后，影子成员的历史账单将归属于认领者</li>
            <li>• 可以通过分享链接邀请他人认领</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShadowMemberModal;
