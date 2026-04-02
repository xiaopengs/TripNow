import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'

// 账本类型
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

// 成员类型
export interface Member {
  id: string
  name: string
  avatar?: string
  isShadow?: boolean // 影子成员
  claimedBy?: string // 认领者ID
}

// 账单类型
export interface Expense {
  id: string
  ledgerId: string
  title: string
  amount: number
  category: Category
  payer: string // 支付人ID
  splitMembers: string[] // 分摊成员ID列表
  splitMethod: 'equal' | 'custom'
  customSplit?: Record<string, number> // 自定义分摊比例
  note?: string
  receiptImage?: string
  timestamp: string
  confidence?: number // AI识别置信度
}

// 公账类型
export interface PublicWallet {
  balance: number
  recharges: Recharge[]
  expenses: string[] // 公账支付的账单ID
}

export interface Recharge {
  id: string
  memberId: string
  amount: number
  timestamp: string
}

// 类目枚举
export enum Category {
  Food = 'food',
  Transport = 'transport',
  Accommodation = 'accommodation',
  Entertainment = 'entertainment',
  Shopping = 'shopping',
  Tickets = 'tickets'
}

// Store 状态
interface LedgerState {
  ledgers: Ledger[]
  currentLedgerId: string | null

  // Actions
  createLedger: (ledger: Omit<Ledger, 'id' | 'expenses' | 'publicWallet' | 'createdAt' | 'status'>) => void
  updateLedger: (id: string, updates: Partial<Ledger>) => void
  deleteLedger: (id: string) => void
  archiveLedger: (id: string) => void
  setCurrentLedger: (id: string) => void

  // Expense Actions
  addExpense: (ledgerId: string, expense: Omit<Expense, 'id' | 'ledgerId' | 'timestamp'>) => void
  updateExpense: (ledgerId: string, expenseId: string, updates: Partial<Expense>) => void
  deleteExpense: (ledgerId: string, expenseId: string) => void

  // Member Actions
  addMember: (ledgerId: string, member: Omit<Member, 'id'>) => void
  updateMember: (ledgerId: string, memberId: string, updates: Partial<Member>) => void
  deleteMember: (ledgerId: string, memberId: string) => void
  claimShadowMember: (ledgerId: string, shadowMemberId: string, claimedBy: string) => void

  // Public Wallet Actions
  rechargeWallet: (ledgerId: string, memberId: string, amount: number) => void
  payFromWallet: (ledgerId: string, expenseId: string) => void

  // Getters
  getCurrentLedger: () => Ledger | null
  getMemberBalance: (ledgerId: string, memberId: string) => number
  getSettlementData: (ledgerId: string) => SettlementData[]
}

// 结算数据类型
export interface SettlementData {
  from: string
  to: string
  amount: number
}

// Taro 存储适配器
const taroStorage = {
  getItem: async (name: string) => {
    const value = await Taro.getStorageSync(name)
    return value || null
  },
  setItem: async (name: string, value: string) => {
    await Taro.setStorageSync(name, value)
  },
  removeItem: async (name: string) => {
    await Taro.removeStorageSync(name)
  },
}

// 创建 Store
export const useLedgerStore = create<LedgerState>()(
  persist(
    (set, get) => ({
      ledgers: [],
      currentLedgerId: null,

      // 创建账本
      createLedger: (ledgerData) => {
        const newLedger: Ledger = {
          ...ledgerData,
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
        set((state) => ({
          ledgers: [...state.ledgers, newLedger],
          currentLedgerId: newLedger.id
        }))
      },

      // 更新账本
      updateLedger: (id, updates) => {
        set((state) => ({
          ledgers: state.ledgers.map(ledger =>
            ledger.id === id ? { ...ledger, ...updates } : ledger
          )
        }))
      },

      // 删除账本
      deleteLedger: (id) => {
        set((state) => ({
          ledgers: state.ledgers.filter(ledger => ledger.id !== id),
          currentLedgerId: state.currentLedgerId === id ? null : state.currentLedgerId
        }))
      },

      // 归档账本
      archiveLedger: (id) => {
        set((state) => ({
          ledgers: state.ledgers.map(ledger =>
            ledger.id === id ? { ...ledger, status: 'archived' as const } : ledger
          )
        }))
      },

      // 设置当前账本
      setCurrentLedger: (id) => {
        set({ currentLedgerId: id })
      },

      // 添加账单
      addExpense: (ledgerId, expenseData) => {
        const newExpense: Expense = {
          ...expenseData,
          id: Date.now().toString(),
          ledgerId,
          timestamp: new Date().toISOString()
        }
        set((state) => ({
          ledgers: state.ledgers.map(ledger =>
            ledger.id === ledgerId
              ? { ...ledger, expenses: [...ledger.expenses, newExpense] }
              : ledger
          )
        }))
      },

      // 更新账单
      updateExpense: (ledgerId, expenseId, updates) => {
        set((state) => ({
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
        }))
      },

      // 删除账单
      deleteExpense: (ledgerId, expenseId) => {
        set((state) => ({
          ledgers: state.ledgers.map(ledger =>
            ledger.id === ledgerId
              ? {
                  ...ledger,
                  expenses: ledger.expenses.filter(exp => exp.id !== expenseId)
                }
              : ledger
          )
        }))
      },

      // 添加成员
      addMember: (ledgerId, memberData) => {
        const newMember: Member = {
          ...memberData,
          id: Date.now().toString()
        }
        set((state) => ({
          ledgers: state.ledgers.map(ledger =>
            ledger.id === ledgerId
              ? { ...ledger, members: [...ledger.members, newMember] }
              : ledger
          )
        }))
      },

      // 更新成员
      updateMember: (ledgerId, memberId, updates) => {
        set((state) => ({
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
        }))
      },

      // 删除成员
      deleteMember: (ledgerId, memberId) => {
        set((state) => ({
          ledgers: state.ledgers.map(ledger =>
            ledger.id === ledgerId
              ? {
                  ...ledger,
                  members: ledger.members.filter(member => member.id !== memberId)
                }
              : ledger
          )
        }))
      },

      // 认领影子成员
      claimShadowMember: (ledgerId, shadowMemberId, claimedBy) => {
        set((state) => ({
          ledgers: state.ledgers.map(ledger =>
            ledger.id === ledgerId
              ? {
                  ...ledger,
                  members: ledger.members.map(member =>
                    member.id === shadowMemberId
                      ? { ...member, isShadow: false, claimedBy }
                      : member
                  )
                }
              : ledger
          )
        }))
      },

      // 公账充值
      rechargeWallet: (ledgerId, memberId, amount) => {
        set((state) => ({
          ledgers: state.ledgers.map(ledger => {
            if (ledger.id !== ledgerId) return ledger

            const recharge: Recharge = {
              id: Date.now().toString(),
              memberId,
              amount,
              timestamp: new Date().toISOString()
            }

            return {
              ...ledger,
              publicWallet: {
                ...ledger.publicWallet,
                balance: ledger.publicWallet.balance + amount,
                recharges: [...ledger.publicWallet.recharges, recharge]
              }
            }
          })
        }))
      },

      // 公账支付
      payFromWallet: (ledgerId, expenseId) => {
        set((state) => ({
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
        }))
      },

      // 获取当前账本
      getCurrentLedger: () => {
        const state = get()
        return state.ledgers.find(l => l.id === state.currentLedgerId) || null
      },

      // 计算成员余额
      getMemberBalance: (ledgerId, memberId) => {
        const state = get()
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

      // 获取结算数据
      getSettlementData: (ledgerId) => {
        const state = get()
        const ledger = state.ledgers.find(l => l.id === ledgerId)
        if (!ledger) return []

        // 计算每个成员的余额
        const balances: Record<string, number> = {}
        ledger.members.forEach(member => {
          balances[member.id] = state.getMemberBalance(ledgerId, member.id)
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
    }),
    {
      name: 'tripnow-storage',
      storage: createJSONStorage(() => taroStorage),
    }
  )
)
