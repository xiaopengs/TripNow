// ============= 拼途记账 全局类型定义 =============

// ============= 皮肤 =============
export type SkinColor =
  | 'emerald'
  | 'ocean'
  | 'sunset'
  | 'lavender'
  | 'rose'
  | 'forest'

// ============= 账单状态 =============
export type ExpenseStatus = 'confirmed' | 'pending'

// ============= 类目枚举 =============
export enum Category {
  Food = 'food',
  Transport = 'transport',
  Accommodation = 'accommodation',
  Tickets = 'tickets',
  Shopping = 'shopping',
  Other = 'other',
}

// ============= 成员 =============
export interface Member {
  id: string
  name: string
  avatar?: string
  isShadow?: boolean       // 是否影子成员
  claimedBy?: string        // 认领后的真实用户ID
}

// ============= 账单 =============
export interface Expense {
  id: string
  ledgerId: string
  title: string
  amount: number            // 以分为单位(整数)
  category: Category
  payer: string             // 支付者memberId
  splitMembers: string[]    // 分摊成员ID列表
  splitMethod: 'equal' | 'custom'
  customSplit?: Record<string, number>  // 自定义分摊 { memberId: 分(整数) }
  note?: string
  receiptImage?: string     // 收据图片路径
  timestamp: string
  status: ExpenseStatus     // 新增
  aiConfidence?: number     // AI置信度 0-1
  aiRawResult?: string      // AI原始识别结果
}

// ============= 公款钱包 =============
export interface PublicWallet {
  balance: number           // 以分为单位
  recharges: Recharge[]
  expenses: string[]        // 已支付的expenseId列表
}

export interface Recharge {
  id: string
  memberId: string
  amount: number            // 以分为单位
  timestamp: string
}

// ============= 账本 =============
export interface Ledger {
  id: string
  name: string
  currency: string          // ISO code, e.g. CNY, JPY
  skin: SkinColor           // 改为联合类型
  budget?: number           // 预算，以分为单位
  location?: string         // 地点
  startDate?: string        // 开始日期 YYYY-MM-DD
  endDate?: string          // 结束日期
  members: Member[]
  expenses: Expense[]
  publicWallet: PublicWallet
  createdAt: string
  status: 'active' | 'archived'
}

// ============= 结算数据 =============
export interface SettlementData {
  from: string              // 付款人 memberId
  to: string                // 收款人 memberId
  amount: number            // 以分为单位
  settled: boolean          // 是否已标记已付
}

// ============= 汇率 =============
export interface ExchangeRate {
  from: string
  to: string
  rate: number
  updatedAt: string
}

// ============= 离线队列 =============
export interface OfflineQueueItem {
  id: string
  action: string
  payload: any
  createdAt: number
  synced: boolean
}

// ============= AI OCR 结果 =============
export interface OCRResult {
  amount: number            // 分为单位
  title: string
  category: Category
  confidence: number
  rawText: string
}
