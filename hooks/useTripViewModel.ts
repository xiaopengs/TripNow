
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Trip, Expense, Member, SettlementStep, WalletTransaction } from '../types';
import { MOCK_MEMBERS, MOCK_TRIPS, MOCK_EXPENSES, MOCK_WALLET_TRANSACTIONS } from '../data/mockData';

// 使用 Mock 数据作为初始数据
const INITIAL_MEMBERS: Member[] = MOCK_MEMBERS;
const INITIAL_TRIP: Trip = MOCK_TRIPS[0];

// --- ViewModel ---
export const useTripViewModel = () => {
  // 1. State (优先从 LocalStorage 加载，否则使用 Mock 数据)
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('ts_expenses');
    return saved ? JSON.parse(saved) : MOCK_EXPENSES;
  });

  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('ts_wallet');
    return saved ? JSON.parse(saved) : MOCK_WALLET_TRANSACTIONS;
  });

  const [currentTrip] = useState<Trip>(INITIAL_TRIP);
  const currentUserId = 'm4'; // 模拟当前用户

  // 2. Persistence Logic (保存到本地数据库)
  useEffect(() => {
    localStorage.setItem('ts_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('ts_wallet', JSON.stringify(walletTransactions));
  }, [walletTransactions]);

  // 3. Actions / Commands (ViewModel 的操作命令)
  const addExpense = useCallback((expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  }, []);

  const addWalletTransaction = useCallback((transactionData: Omit<WalletTransaction, 'id'>) => {
    const newTransaction: WalletTransaction = {
      ...transactionData,
      id: `w_${Date.now()}`
    };
    setWalletTransactions(prev => [newTransaction, ...prev]);
  }, []);

  // 4. Computed Properties (ViewModel 负责计算派生状态，减轻 View 负担)
  const walletBalance = useMemo(() => {
    return walletTransactions.reduce((sum, t) => t.type === 'deposit' ? sum + t.amount : sum - t.amount, 0);
  }, [walletTransactions]);

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const memberBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    currentTrip.members.forEach(m => balances[m.id] = 0);

    expenses.forEach(e => {
      const share = e.amount / e.participants.length;
      balances[e.payerId] += e.amount;
      e.participants.forEach(pId => {
        balances[pId] -= share;
      });
    });
    return balances;
  }, [expenses, currentTrip.members]);

  const myPayable = useMemo(() => {
    const bal = memberBalances[currentUserId] || 0;
    return bal < 0 ? Math.abs(bal) : 0;
  }, [memberBalances]);

  const stats = useMemo(() => {
    const categories = Object.values(Category).map(cat => ({
      name: cat,
      value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
    })).filter(c => c.value > 0);

    return {
      total: totalSpent,
      avgPerPerson: totalSpent / currentTrip.members.length,
      count: expenses.length,
      avgPerEntry: expenses.length ? totalSpent / expenses.length : 0,
      categories
    };
  }, [expenses, totalSpent, currentTrip.members.length]);

  const settlementPlan = useMemo(() => {
    const balancesCopy = { ...memberBalances };
    const debtors = (Object.entries(balancesCopy) as [string, number][])
      .filter(([_, bal]) => bal < -0.01)
      .sort((a, b) => a[1] - b[1]);
    const creditors = (Object.entries(balancesCopy) as [string, number][])
      .filter(([_, bal]) => bal > 0.01)
      .sort((a, b) => b[1] - a[1]);

    const plan: SettlementStep[] = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtAmount = Math.abs(debtors[i][1]);
      const creditAmount = creditors[j][1];
      const settlementAmount = Math.min(debtAmount, creditAmount);

      plan.push({
        from: debtors[i][0],
        to: creditors[j][0],
        amount: Math.round(settlementAmount),
        isSettled: false
      });

      debtors[i][1] += settlementAmount;
      creditors[j][1] -= settlementAmount;

      if (Math.abs(debtors[i][1]) < 0.01) i++;
      if (Math.abs(creditors[j][1]) < 0.01) j++;
    }

    return plan;
  }, [memberBalances]);

  return {
    // Model Data
    currentTrip,
    expenses,
    walletTransactions,
    currentUserId,
    // Computed State
    totalSpent,
    myPayable,
    stats,
    settlementPlan,
    memberBalances,
    walletBalance,
    // Commands
    addExpense,
    addWalletTransaction
  };
};
