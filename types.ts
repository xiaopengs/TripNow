
export enum Category {
  Food = '餐饮',
  Transport = '交通',
  Accommodation = '住宿',
  Entertainment = '娱乐',
  Shopping = '购物',
  Tickets = '门票'
}

export enum SplitType {
  Equal = '均分',
  Percentage = '按比例',
  Fixed = '固定金额'
}

export interface Member {
  id: string;
  name: string;
  avatar?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  payerId: string;
  date: string;
  time: string;
  location: string;
  category: Category;
  splitType: SplitType;
  participants: string[]; // Member IDs
  image?: string;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'deposit' | 'expense';
  title: string;
  date: string;
  memberId?: string; // Who deposited
}

export interface Trip {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate?: string;
  members: Member[];
  budget: number;
  image?: string;
  status: 'ongoing' | 'finished' | 'archived';
}

export interface SettlementStep {
  from: string; // Member ID
  to: string; // Member ID
  amount: number;
  isSettled: boolean;
}

// ==================== 影子成员系统 ====================

export type MemberType = 'real' | 'shadow';

export interface ExtendedMember extends Member {
  type: MemberType;
  isClaimed: boolean;
  claimedBy?: string; // 真实用户ID
  claimToken?: string; // 认领令牌（用于邀请链接）
  createdAt: string;
}

export interface ShadowMemberClaim {
  shadowMemberId: string;
  claimToken: string;
  claimedBy: string;
  claimedAt: string;
}

export interface MemberMigration {
  fromMemberId: string; // 影子成员ID
  toMemberId: string;   // 真实用户ID
  tripId: string;
  migratedAt: string;
}
