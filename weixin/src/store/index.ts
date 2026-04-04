/**
 * 拼途记账 Redux Store — V2.0 增强版
 *
 * 新增能力：
 * - ExpenseStatus (confirmed/pending) 支持 AI 收件箱
 * - 影子成员认领 (CLAIM_SHADOW_MEMBER)
 * - 皮肤更换 (UPDATE_LEDGER_SKIN)
 * - 汇率缓存 (SET_EXCHANGE_RATE)
 * - 按日分组账单选择器
 * - 待整理/影子成员 选择器
 */

import { createStore, combineReducers } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import Taro from '@tarojs/taro'
import {
  Ledger, Member, Expense, PublicWallet, Recharge,
  Category, SettlementData, ExchangeRate,
  SkinColor, ExpenseStatus
} from '../types'

// ============= Action Types =============

const CREATE_LEDGER = 'CREATE_LEDGER'
const UPDATE_LEDGER = 'UPDATE_LEDGER'
const DELETE_LEDGER = 'DELETE_LEDGER'
const ARCHIVE_LEDGER = 'ARCHIVE_LEDGER'
const SET_CURRENT_LEDGER = 'SET_CURRENT_LEDGER'

// Expense
const ADD_EXPENSE = 'ADD_EXPENSE'
const UPDATE_EXPENSE = 'UPDATE_EXPENSE'
const DELETE_EXPENSE = 'DELETE_EXPENSE'
const SET_EXPENSE_STATUS = 'SET_EXPENSE_STATUS'

// Member
const ADD_MEMBER = 'ADD_MEMBER'
const UPDATE_MEMBER = 'UPDATE_MEMBER'
const DELETE_MEMBER = 'DELETE_MEMBER'
const CLAIM_SHADOW_MEMBER = 'CLAIM_SHADOW_MEMBER'

// Wallet
const RECHARGE_WALLET = 'RECHARGE_WALLET'
const PAY_FROM_WALLET = 'PAY_FROM_WALLET'

// New V2.0
const SET_EXCHANGE_RATES = 'SET_EXCHANGE_RATES'
const MARK_SETTLEMENT_PAID = 'MARK_SETTLEMENT_PAID'

// ============= State Interface =============

interface AppState {
  ledgers: Ledger[]
  currentLedgerId: string | null
  exchangeRates: ExchangeRate[]
  settlementsPaid: Record<string, boolean>  // { "from_to": boolean }
}

// ============= Initial State =============

const initialState: AppState = {
  ledgers: [],
  currentLedgerId: null,
  exchangeRates: [],
  settlementsPaid: {},
}

// ============= Reducer =============

function appReducer(state = initialState, action: any): AppState {
  // 安全校验：state 结构异常时返回初始状态
  if (!state || !Array.isArray(state.ledgers)) {
    return initialState
  }

  switch (action.type) {
    // ---- 账本 CRUD ----
    case CREATE_LEDGER: {
      const members = (action.payload.members || []).map((m: any) => ({
        ...m,
        id: m.id || genId(),
      }))
      const newLedger: Ledger = {
        ...action.payload,
        id: genId(),
        members,
        expenses: [],
        publicWallet: emptyWallet(),
        createdAt: new Date().toISOString(),
        status: 'active',
      }
      return { ...state, ledgers: [...state.ledgers, newLedger], currentLedgerId: newLedger.id }
    }

    case UPDATE_LEDGER:
      return {
        ...state,
        ledgers: state.ledgers.map(l =>
          l.id === action.payload.id ? { ...l, ...action.payload.updates } : l
        ),
      }

    case DELETE_LEDGER:
      return {
        ...state,
        ledgers: state.ledgers.filter(l => l.id !== action.payload),
        currentLedgerId: state.currentLedgerId === action.payload ? null : state.currentLedgerId,
      }

    case ARCHIVE_LEDGER:
      return {
        ...state,
        ledgers: state.ledgers.map(l =>
          l.id === action.payload ? { ...l, status: 'archived' as const } : l
        ),
      }

    case SET_CURRENT_LEDGER:
      return { ...state, currentLedgerId: action.payload }

    // ---- 费用 CRUD ----
    case ADD_EXPENSE: {
      const { ledgerId, expenseData } = action.payload
      const newExpense: Expense = {
        ...expenseData,
        id: genId(),
        ledgerId,
        timestamp: new Date().toISOString(),
        status: expenseData.status || ('confirmed' as ExpenseStatus),
      }
      return {
        ...state,
        ledgers: state.ledgers.map(l =>
          l.id === ledgerId ? { ...l, expenses: [...l.expenses, newExpense] } : l
        ),
      }
    }

    case UPDATE_EXPENSE: {
      const { ledgerId, expenseId, updates } = action.payload
      return {
        ...state,
        ledgers: state.ledgers.map(l =>
          l.id === ledgerId ? {
            ...l,
            expenses: l.expenses.map(e => e.id === expenseId ? { ...e, ...updates } : e)
          } : l
        ),
      }
    }

    case DELETE_EXPENSE: {
      const { ledgerId, expenseId } = action.payload
      return {
        ...state,
        ledgers: state.ledgers.map(l =>
          l.id === ledgerId ? { ...l, expenses: l.expenses.filter(e => e.id !== expenseId) } : l
        ),
      }
    }

    // V2.0 新增：设置账单状态（AI 收件箱确认/删除）
    case SET_EXPENSE_STATUS: {
      const { ledgerId, expenseId, status } = action.payload
      if (status === 'deleted') {
        // 删除该笔待整理记录
        return {
          ...state,
          ledgers: state.ledgers.map(l =>
            l.id === ledgerId ? { ...l, expenses: l.expenses.filter(e => e.id !== expenseId) } : l
          ),
        }
      }
      return {
        ...state,
        ledgers: state.ledgers.map(l =>
          l.id === ledgerId ? {
            ...l,
            expenses: l.expenses.map(e => e.id === expenseId ? { ...e, status: status as ExpenseStatus } : e)
          } : l
        ),
      }
    }

    // ---- 成员管理 ----
    case ADD_MEMBER: {
      const { ledgerId, memberData } = action.payload
      const newMember: Member = { ...memberData, id: genId() }
      return {
        ...state,
        ledgers: state.ledgers.map(l =>
          l.id === ledgerId ? { ...l, members: [...l.members, newMember] } : l
        ),
      }
    }

    case UPDATE_MEMBER: {
      const { ledgerId, memberId, updates } = action.payload
      return {
        ...state,
        ledgers: state.ledgers.map(l =>
          l.id === ledgerId ? {
            ...l,
            members: l.members.map(m => m.id === memberId ? { ...m, ...updates } : m)
          } : l
        ),
      }
    }

    case DELETE_MEMBER: {
      const { ledgerId, memberId } = action.payload
      return {
        ...state,
        ledgers: state.ledgers.map(l =>
          l.id === ledgerId ? { ...l, members: l.members.filter(m => m.id !== memberId) } : l
        ),
      }
    }

    // V2.0 新增：影子成员认领
    case CLAIM_SHADOW_MEMBER: {
      const { ledgerId, shadowMemberId, claimedByUserId, claimedByName, claimedByAvatar } = action.payload
      return {
        ...state,
        ledgers: state.ledgers.map(l => {
          if (l.id !== ledgerId) return l
          return {
            ...l,
            members: l.members.map(m =>
              m.id === shadowMemberId
                ? {
                    ...m,
                    isShadow: false,
                    claimedBy: claimedByUserId,
                    name: m.name, // 保持原始影子名称
                  }
                : m
            ),
          }
        }),
      }
    }

    // ---- 钱包 ----
    case RECHARGE_WALLET: {
      const { ledgerId, memberId, amount } = action.payload
      const recharge: Recharge = { id: genId(), memberId, amount, timestamp: new Date().toISOString() }
      return {
        ...state,
        ledgers: state.ledgers.map(l => {
          if (l.id !== ledgerId) return l
          return {
            ...l,
            publicWallet: {
              ...l.publicWallet,
              balance: l.publicWallet.balance + amount,
              recharges: [...l.publicWallet.recharges, recharge],
            },
          }
        }),
      }
    }

    case PAY_FROM_WALLET: {
      const { ledgerId, expenseId } = action.payload
      return {
        ...state,
        ledgers: state.ledgers.map(l => {
          if (l.id !== ledgerId) return l
          const exp = l.expenses.find(e => e.id === expenseId)
          if (!exp) return l
          return {
            ...l,
            publicWallet: {
              ...l.publicWallet,
              balance: l.publicWallet.balance - exp.amount,
              expenses: [...l.publicWallet.expenses, expenseId],
            },
          }
        }),
      }
    }

    // V2.0 新增：汇率缓存
    case SET_EXCHANGE_RATES:
      return { ...state, exchangeRates: action.payload }

    // V2.0 新增：标记结算已付
    case MARK_SETTLEMENT_PAID: {
      const key = `${action.payload.from}_${action.payload.to}`
      return {
        ...state,
        settlementsPaid: { ...state.settlementsPaid, [key]: action.payload.settled },
      }
    }

    default:
      return state
  }
}

// ============= Helpers =============

function genId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function emptyWallet(): PublicWallet {
  return { balance: 0, recharges: [], expenses: [] }
}

// ============= Persistence =============

const persistConfig = {
  key: 'tripnow_v2',
  storage: {
    getItem: (key: string) => Taro.getStorageSync(key) || null,
    setItem: (key: string, value: any) => Taro.setStorageSync(key, value),
    removeItem: (key: string) => Taro.removeStorageSync(key),
  },
  whitelist: ['ledgers', 'currentLedgerId', 'settlementsPaid'],
  // 数据迁移：修复从旧版本恢复的数据
  migrate: (state: any) => {
    if (!state) return state
    if (Array.isArray(state.ledgers)) {
      state.ledgers = state.ledgers.map((ledger: any) => ({
        ...ledger,
        expenses: Array.isArray(ledger.expenses) ? ledger.expenses.map((e: any) => ({
          ...e,
          status: e.status || 'confirmed',
          splitMembers: e.splitMembers || [],
          amount: typeof e.amount === 'number' ? e.amount : 0,
        })) : [],
        members: Array.isArray(ledger.members) ? ledger.members : [],
        publicWallet: ledger.publicWallet || { balance: 0, recharges: [], expenses: [] },
        skin: ledger.skin || 'ocean',
        status: ledger.status || 'active',
      }))
    }
    return state
  },
}

const persistedReducer = persistReducer(persistConfig, appReducer)

export const store = createStore(persistedReducer)
export const persistor = persistStore(store)

// ============= Action Creators =============

export const actions = {
  createLedger: (data: Omit<Ledger, 'id' | 'expenses' | 'publicWallet' | 'createdAt' | 'status'>) => ({
    type: CREATE_LEDGER, payload: data
  }),

  updateLedger: (id: string, updates: Partial<Ledger>) => ({
    type: UPDATE_LEDGER, payload: { id, updates }
  }),

  deleteLedger: (id: string) => ({ type: DELETE_LEDGER, payload: id }),

  archiveLedger: (id: string) => ({ type: ARCHIVE_LEDGER, payload: id }),

  setCurrentLedger: (id: string) => ({ type: SET_CURRENT_LEDGER, payload: id }),

  addExpense: (ledgerId: string, data: Omit<Expense, 'id' | 'ledgerId' | 'timestamp'>) => ({
    type: ADD_EXPENSE, payload: { ledgerId, expenseData: data }
  }),

  updateExpense: (ledgerId: string, expenseId: string, updates: Partial<Expense>) => ({
    type: UPDATE_EXPENSE, payload: { ledgerId, expenseId, updates }
  }),

  deleteExpense: (ledgerId: string, expenseId: string) => ({
    type: DELETE_EXPENSE, payload: { ledgerId, expenseId }
  }),

  // V2.0: 设置账单状态 (confirm / delete pending)
  setExpenseStatus: (ledgerId: string, expenseId: string, status: 'confirmed' | 'pending' | 'deleted') => ({
    type: SET_EXPENSE_STATUS, payload: { ledgerId, expenseId, status }
  }),

  addMember: (ledgerId: string, data: Omit<Member, 'id'>) => ({
    type: ADD_MEMBER, payload: { ledgerId, memberData: data }
  }),

  updateMember: (ledgerId: string, memberId: string, updates: Partial<Member>) => ({
    type: UPDATE_MEMBER, payload: { ledgerId, memberId, updates }
  }),

  deleteMember: (ledgerId: string, memberId: string) => ({
    type: DELETE_MEMBER, payload: { ledgerId, memberId }
  }),

  // V2.0: 影子成员认领
  claimShadowMember: (
    ledgerId: string, shadowMemberId: string,
    claimedByUserId: string, claimedByName?: string, claimedByAvatar?: string
  ) => ({
    type: CLAIM_SHADOW_MEMBER,
    payload: { ledgerId, shadowMemberId, claimedByUserId, claimedByName, claimedByAvatar },
  }),

  rechargeWallet: (ledgerId: string, memberId: string, amount: number) => ({
    type: RECHARGE_WALLET, payload: { ledgerId, memberId, amount }
  }),

  payFromWallet: (ledgerId: string, expenseId: string) => ({
    type: PAY_FROM_WALLET, payload: { ledgerId, expenseId }
  }),

  setExchangeRates: (rates: ExchangeRate[]) => ({
    type: SET_EXCHANGE_RATES, payload: rates
  }),

  markSettlementPaid: (from: string, to: string, settled: boolean) => ({
    type: MARK_SETTLEMENT_PAID, payload: { from, to, settled },
  }),
}

// ============= Selectors =============

export const selectors = {
  getCurrentLedger: (state: AppState): Ledger | null =>
    state.ledgers.find(l => l.id === state.currentLedgerId) || null,

  getLedgerById: (state: AppState, id: string): Ledger | null =>
    state.ledgers.find(l => l.id === id) || null,

  getActiveLedgers: (state: AppState): Ledger[] =>
    state.ledgers.filter(l => l.status === 'active'),

  getArchivedLedgers: (state: AppState): Ledger[] =>
    state.ledgers.filter(l => l.status === 'archived'),

  // V2.0: 获取某账本的待整理(pending)账单
  getPendingExpenses: (state: AppState, ledgerId: string): Expense[] => {
    const ledger = state.ledgers.find(l => l.id === ledgerId)
    if (!ledger) return []
    return ledger.expenses.filter(e => e.status === 'pending')
  },

  // V2.0: 获取某账本的已确认账单
  getConfirmedExpenses: (state: AppState, ledgerId: string): Expense[] => {
    const ledger = state.ledgers.find(l => l.id === ledgerId)
    if (!ledger) return []
    return ledger.expenses.filter(e => e.status === 'confirmed')
  },

  // V2.0: 获取未认领的影子成员
  getShadowMembers: (state: AppState, ledgerId: string): Member[] => {
    const ledger = state.ledgers.find(l => l.id === ledgerId)
    if (!ledger) return []
    return ledger.members.filter(m => m.isShadow && !m.claimedBy)
  },

  // V2.0: 获取已认领/非影子成员
  getRealMembers: (state: AppState, ledgerId: string): Member[] => {
    const ledger = state.ledgers.find(l => l.id === ledgerId)
    if (!ledger) return []
    return ledger.members.filter(m => !m.isShadow || !!m.claimedBy)
  },

  // 计算成员余额（正数=别人欠TA，负数=TA欠别人）
  getMemberBalance: (state: AppState, ledgerId: string, memberId: string): number => {
    const ledger = state.ledgers.find(l => l.id === ledgerId)
    if (!ledger) return 0

    let paid = 0       // TA垫付的总金额
    let shouldPay = 0   // TA应该分担的总金额

    for (const exp of ledger.expenses) {
      if (exp.status === 'deleted') continue

      const shareCount = exp.splitMembers.length
      if (shareCount === 0) continue

      let memberShare: number
      if (exp.splitMethod === 'custom' && exp.customSplit) {
        memberShare = exp.customSplit[memberId] || 0
      } else {
        memberShare = Math.floor(exp.amount / shareCount)
      }

      if (exp.payer === memberId) paid += exp.amount
      if (exp.splitMembers.includes(memberId)) shouldPay += memberShare
    }

    return paid - shouldPay
  },

  // 最小路径结算算法
  getSettlementData: (state: AppState, ledgerId: string): SettlementData[] => {
    const ledger = state.ledgers.find(l => l.id === ledgerId)
    if (!ledger) return []

    const balances: Record<string, number> = {}
    ledger.members.forEach(m => {
      balances[m.id] = selectors.getMemberBalance(state, ledgerId, m.id)
    })

    const creditors: { id: string; amount: number }[] = []
    const debtors: { id: string; amount: number }[] = []

    Object.entries(balances).forEach(([id, bal]) => {
      if (bal > 1) creditors.push({ id, amount: bal })
      else if (bal < -1) debtors.push({ id, amount: Math.abs(bal) })
    })

    const results: SettlementData[] = []
    let i = 0, j = 0

    while (i < debtors.length && j < creditors.length) {
      const d = debtors[i]
      const c = creditors[j]
      const amt = Math.min(d.amount, c.amount)

      if (amt > 1) {
        const key = `${d.id}_${c.id}`
        results.push({
          from: d.id,
          to: c.id,
          amount: amt,
          settled: state.settlementsPaid[key] || false,
        })
      }

      d.amount -= amt
      c.amount -= amt
      if (d.amount <= 1) i++
      if (c.amount <= 1) j++
    }

    return results
  },

  // 待整理红点数量
  getPendingCount: (state: AppState, ledgerId: string): number =>
    selectors.getPendingExpenses(state, ledgerId).length,
}
