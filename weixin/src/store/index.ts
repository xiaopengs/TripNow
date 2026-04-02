import { createStore, combineReducers } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import Taro from '@tarojs/taro'

// ============= 类型定义 =============

export interface Ledger {
  id: string
  name: string
  currency: string
  skin: string
  budget?: number
  members: Member[]
  expenses: Expense[]
  publicWallet: PublicWallet
  createdAt: string
  status: 'active' | 'archived'
}

export interface Member {
  id: string
  name: string
  avatar?: string
  isShadow?: boolean
  claimedBy?: string
}

export interface Expense {
  id: string
  ledgerId: string
  title: string
  amount: number
  category: Category
  payer: string
  splitMembers: string[]
  splitMethod: 'equal' | 'custom'
  customSplit?: Record<string, number>
  note?: string
  receiptImage?: string
  timestamp: string
  confidence?: number
}

export interface PublicWallet {
  balance: number
  recharges: Recharge[]
  expenses: string[]
}

export interface Recharge {
  id: string
  memberId: string
  amount: number
  timestamp: string
}

export enum Category {
  Food = 'food',
  Transport = 'transport',
  Accommodation = 'accommodation',
  Entertainment = 'entertainment',
  Shopping = 'shopping',
  Tickets = 'tickets'
}

export interface SettlementData {
  from: string
  to: string
  amount: number
}

// ============= State 类型 =============

interface LedgerState {
  ledgers: Ledger[]
  currentLedgerId: string | null
}

// ============= Action 类型 =============

const CREATE_LEDGER = 'CREATE_LEDGER'
const UPDATE_LEDGER = 'UPDATE_LEDGER'
const DELETE_LEDGER = 'DELETE_LEDGER'
const ARCHIVE_LEDGER = 'ARCHIVE_LEDGER'
const SET_CURRENT_LEDGER = 'SET_CURRENT_LEDGER'
const ADD_EXPENSE = 'ADD_EXPENSE'
const UPDATE_EXPENSE = 'UPDATE_EXPENSE'
const DELETE_EXPENSE = 'DELETE_EXPENSE'
const ADD_MEMBER = 'ADD_MEMBER'
const UPDATE_MEMBER = 'UPDATE_MEMBER'
const DELETE_MEMBER = 'DELETE_MEMBER'
const RECHARGE_WALLET = 'RECHARGE_WALLET'
const PAY_FROM_WALLET = 'PAY_FROM_WALLET'

// ============= Reducer =============

const initialState: LedgerState = {
  ledgers: [],
  currentLedgerId: null
}

function ledgerReducer(state = initialState, action: any): LedgerState {
  switch (action.type) {
    case CREATE_LEDGER: {
      const newLedger: Ledger = {
        ...action.payload,
        id: Date.now().toString(),
        expenses: [],
        publicWallet: {
          balance: 0,
          recharges: [],
          expenses: []
        },
        createdAt: new Date().toISOString(),
        status: 'active'
      }
      return {
        ...state,
        ledgers: [...state.ledgers, newLedger],
        currentLedgerId: newLedger.id
      }
    }

    case UPDATE_LEDGER:
      return {
        ...state,
        ledgers: state.ledgers.map(ledger =>
          ledger.id === action.payload.id
            ? { ...ledger, ...action.payload.updates }
            : ledger
        )
      }

    case DELETE_LEDGER:
      return {
        ...state,
        ledgers: state.ledgers.filter(ledger => ledger.id !== action.payload),
        currentLedgerId: state.currentLedgerId === action.payload
          ? null
          : state.currentLedgerId
      }

    case ARCHIVE_LEDGER:
      return {
        ...state,
        ledgers: state.ledgers.map(ledger =>
          ledger.id === action.payload
            ? { ...ledger, status: 'archived' as const }
            : ledger
        )
      }

    case SET_CURRENT_LEDGER:
      return {
        ...state,
        currentLedgerId: action.payload
      }

    case ADD_EXPENSE: {
      const { ledgerId, expenseData } = action.payload
      const newExpense: Expense = {
        ...expenseData,
        id: Date.now().toString(),
        ledgerId,
        timestamp: new Date().toISOString()
      }
      return {
        ...state,
        ledgers: state.ledgers.map(ledger =>
          ledger.id === ledgerId
            ? { ...ledger, expenses: [...ledger.expenses, newExpense] }
            : ledger
        )
      }
    }

    case UPDATE_EXPENSE: {
      const { ledgerId, expenseId, updates } = action.payload
      return {
        ...state,
        ledgers: state.ledgers.map(ledger =>
          ledger.id === ledgerId
            ? {
                ...ledger,
                expenses: ledger.expenses.map(exp =>
                  exp.id === expenseId ? { ...exp, ...updates } : exp
                )
              }
            : ledger
        )
      }
    }

    case DELETE_EXPENSE: {
      const { ledgerId, expenseId } = action.payload
      return {
        ...state,
        ledgers: state.ledgers.map(ledger =>
          ledger.id === ledgerId
            ? {
                ...ledger,
                expenses: ledger.expenses.filter(exp => exp.id !== expenseId)
              }
            : ledger
        )
      }
    }

    case ADD_MEMBER: {
      const { ledgerId, memberData } = action.payload
      const newMember: Member = {
        ...memberData,
        id: Date.now().toString()
      }
      return {
        ...state,
        ledgers: state.ledgers.map(ledger =>
          ledger.id === ledgerId
            ? { ...ledger, members: [...ledger.members, newMember] }
            : ledger
        )
      }
    }

    case UPDATE_MEMBER: {
      const { ledgerId, memberId, updates } = action.payload
      return {
        ...state,
        ledgers: state.ledgers.map(ledger =>
          ledger.id === ledgerId
            ? {
                ...ledger,
                members: ledger.members.map(member =>
                  member.id === memberId ? { ...member, ...updates } : member
                )
              }
            : ledger
        )
      }
    }

    case DELETE_MEMBER: {
      const { ledgerId, memberId } = action.payload
      return {
        ...state,
        ledgers: state.ledgers.map(ledger =>
          ledger.id === ledgerId
            ? {
                ...ledger,
                members: ledger.members.filter(member => member.id !== memberId)
              }
            : ledger
        )
      }
    }

    case RECHARGE_WALLET: {
      const { ledgerId, memberId, amount } = action.payload
      const recharge: Recharge = {
        id: Date.now().toString(),
        memberId,
        amount,
        timestamp: new Date().toISOString()
      }
      return {
        ...state,
        ledgers: state.ledgers.map(ledger => {
          if (ledger.id !== ledgerId) return ledger
          return {
            ...ledger,
            publicWallet: {
              ...ledger.publicWallet,
              balance: ledger.publicWallet.balance + amount,
              recharges: [...ledger.publicWallet.recharges, recharge]
            }
          }
        })
      }
    }

    case PAY_FROM_WALLET: {
      const { ledgerId, expenseId } = action.payload
      return {
        ...state,
        ledgers: state.ledgers.map(ledger => {
          if (ledger.id !== ledgerId) return ledger
          const expense = ledger.expenses.find(e => e.id === expenseId)
          if (!expense) return ledger
          return {
            ...ledger,
            publicWallet: {
              ...ledger.publicWallet,
              balance: ledger.publicWallet.balance - expense.amount,
              expenses: [...ledger.publicWallet.expenses, expenseId]
            }
          }
        })
      }
    }

    default:
      return state
  }
}

// ============= 持久化配置 =============

const persistConfig = {
  key: 'tripnow',
  storage: {
    getItem: (key: string) => {
      return Taro.getStorageSync(key) || null
    },
    setItem: (key: string, value: any) => {
      Taro.setStorageSync(key, value)
    },
    removeItem: (key: string) => {
      Taro.removeStorageSync(key)
    }
  },
  whitelist: ['ledgers', 'currentLedgerId']
}

const persistedReducer = persistReducer(persistConfig, ledgerReducer)

// ============= 创建 Store =============

export const store = createStore(persistedReducer)
export const persistor = persistStore(store)

// ============= Action Creators =============

export const actions = {
  createLedger: (ledger: Omit<Ledger, 'id' | 'expenses' | 'publicWallet' | 'createdAt' | 'status'>) => ({
    type: CREATE_LEDGER,
    payload: ledger
  }),

  updateLedger: (id: string, updates: Partial<Ledger>) => ({
    type: UPDATE_LEDGER,
    payload: { id, updates }
  }),

  deleteLedger: (id: string) => ({
    type: DELETE_LEDGER,
    payload: id
  }),

  archiveLedger: (id: string) => ({
    type: ARCHIVE_LEDGER,
    payload: id
  }),

  setCurrentLedger: (id: string) => ({
    type: SET_CURRENT_LEDGER,
    payload: id
  }),

  addExpense: (ledgerId: string, expense: Omit<Expense, 'id' | 'ledgerId' | 'timestamp'>) => ({
    type: ADD_EXPENSE,
    payload: { ledgerId, expenseData: expense }
  }),

  updateExpense: (ledgerId: string, expenseId: string, updates: Partial<Expense>) => ({
    type: UPDATE_EXPENSE,
    payload: { ledgerId, expenseId, updates }
  }),

  deleteExpense: (ledgerId: string, expenseId: string) => ({
    type: DELETE_EXPENSE,
    payload: { ledgerId, expenseId }
  }),

  addMember: (ledgerId: string, member: Omit<Member, 'id'>) => ({
    type: ADD_MEMBER,
    payload: { ledgerId, memberData: member }
  }),

  updateMember: (ledgerId: string, memberId: string, updates: Partial<Member>) => ({
    type: UPDATE_MEMBER,
    payload: { ledgerId, memberId, updates }
  }),

  deleteMember: (ledgerId: string, memberId: string) => ({
    type: DELETE_MEMBER,
    payload: { ledgerId, memberId }
  }),

  rechargeWallet: (ledgerId: string, memberId: string, amount: number) => ({
    type: RECHARGE_WALLET,
    payload: { ledgerId, memberId, amount }
  }),

  payFromWallet: (ledgerId: string, expenseId: string) => ({
    type: PAY_FROM_WALLET,
    payload: { ledgerId, expenseId }
  })
}

// ============= Selectors =============

export const selectors = {
  getCurrentLedger: (state: LedgerState) => {
    return state.ledgers.find(l => l.id === state.currentLedgerId) || null
  },

  getLedgerById: (state: LedgerState, id: string) => {
    return state.ledgers.find(l => l.id === id) || null
  },

  getMemberBalance: (state: LedgerState, ledgerId: string, memberId: string) => {
    const ledger = state.ledgers.find(l => l.id === ledgerId)
    if (!ledger) return 0

    let paid = 0
    let shouldPay = 0

    ledger.expenses.forEach(expense => {
      const memberCount = expense.splitMembers.length
      const memberShare = expense.amount / memberCount

      if (expense.payer === memberId) {
        paid += expense.amount
      }

      if (expense.splitMembers.includes(memberId)) {
        shouldPay += memberShare
      }
    })

    return paid - shouldPay
  },

  getSettlementData: (state: LedgerState, ledgerId: string): SettlementData[] => {
    const ledger = state.ledgers.find(l => l.id === ledgerId)
    if (!ledger) return []

    // 计算每个成员的余额
    const balances: Record<string, number> = {}
    ledger.members.forEach(member => {
      balances[member.id] = selectors.getMemberBalance(state, ledgerId, member.id)
    })

    // 分离债权人和债务人
    const creditors: { id: string; amount: number }[] = []
    const debtors: { id: string; amount: number }[] = []

    Object.entries(balances).forEach(([id, balance]) => {
      if (balance > 0.01) {
        creditors.push({ id, amount: balance })
      } else if (balance < -0.01) {
        debtors.push({ id, amount: Math.abs(balance) })
      }
    })

    // 最小路径结算算法
    const settlements: SettlementData[] = []
    let i = 0
    let j = 0

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i]
      const creditor = creditors[j]
      const amount = Math.min(debtor.amount, creditor.amount)

      if (amount > 0.01) {
        settlements.push({
          from: debtor.id,
          to: creditor.id,
          amount: Math.round(amount * 100) / 100
        })
      }

      debtor.amount -= amount
      creditor.amount -= amount

      if (debtor.amount < 0.01) i++
      if (creditor.amount < 0.01) j++
    }

    return settlements
  }
}
