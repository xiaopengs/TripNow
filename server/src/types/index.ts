// 类型定义 - 与前端 types.ts 保持一致

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

export enum Currency {
  CNY = 'CNY',
  USD = 'USD',
  EUR = 'EUR',
  JPY = 'JPY',
  KRW = 'KRW',
  THB = 'THB',
  HKD = 'HKD',
  SGD = 'SGD'
}

export enum LedgerTheme {
  Ocean = 'ocean',
  Sunset = 'sunset',
  Forest = 'forest',
  Lavender = 'lavender',
  Midnight = 'midnight',
  Sakura = 'sakura'
}

export enum MemberType {
  Real = 'real',
  Shadow = 'shadow'
}

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  type: MemberType;
  isClaimed: boolean;
  claimedBy?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  ledgerId: string;
  title: string;
  amount: number;
  currency: Currency;
  payerId: string;
  date: string;
  time: string;
  location: string;
  category: Category;
  splitType: SplitType;
  participants: string[];
  image?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ledger {
  id: string;
  name: string;
  description?: string;
  currency: Currency;
  theme: LedgerTheme;
  budget?: number;
  members: Member[];
  expenses: Expense[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// 请求体类型
export interface CreateLedgerRequest {
  name: string;
  description?: string;
  currency: Currency;
  theme: LedgerTheme;
  budget?: number;
}

export interface CreateExpenseRequest {
  ledgerId: string;
  title: string;
  amount: number;
  currency: Currency;
  payerId: string;
  date: string;
  time: string;
  location: string;
  category: Category;
  splitType: SplitType;
  participants: string[];
  image?: string;
  note?: string;
}
