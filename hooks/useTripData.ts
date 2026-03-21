
import { useState, useCallback, useMemo } from 'react';
import { Trip, Expense, Member, Category, SplitType, SettlementStep, WalletTransaction } from '../types';

// Mock initial data based on screenshots
const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: '小明', avatar: 'https://picsum.photos/seed/m1/100' },
  { id: 'm2', name: '小红', avatar: 'https://picsum.photos/seed/m2/100' },
  { id: 'm3', name: '小刚', avatar: 'https://picsum.photos/seed/m3/100' },
  { id: 'm4', name: '小美', avatar: 'https://picsum.photos/seed/m4/100' },
];

const INITIAL_TRIP: Trip = {
  id: 't1',
  name: '云南七日游',
  location: '云南·大理',
  startDate: '2024-10-01',
  members: INITIAL_MEMBERS,
  budget: 5000,
  image: 'https://picsum.photos/seed/yunnan/800/400',
  status: 'ongoing',
};

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'e1',
    title: '网红菌子火锅',
    amount: 288,
    payerId: 'm1',
    date: '2024-10-05',
    time: '19:30',
    location: '大理古城',
    category: Category.Food,
    splitType: SplitType.Equal,
    participants: ['m1', 'm2', 'm3', 'm4'],
    image: 'https://picsum.photos/seed/food1/400/300'
  },
  {
    id: 'e2',
    title: '包车游洱海',
    amount: 420,
    payerId: 'm2',
    date: '2024-10-05',
    time: '09:00',
    location: '洱海',
    category: Category.Transport,
    splitType: SplitType.Equal,
    participants: ['m1', 'm2', 'm3', 'm4']
  }
];

const INITIAL_WALLET_TRANSACTIONS: WalletTransaction[] = [
  { id: 'w1', amount: 500, type: 'deposit', title: '全员预交公款', date: '2024-10-01', memberId: 'm1' },
  { id: 'w2', amount: 500, type: 'deposit', title: '全员预交公款', date: '2024-10-01', memberId: 'm2' },
  { id: 'w3', amount: 200, type: 'expense', title: '零散水果采购', date: '2024-10-04' }
];

export const useTripData = () => {
  const [currentTrip, setCurrentTrip] = useState<Trip>(INITIAL_TRIP);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(INITIAL_WALLET_TRANSACTIONS);
  const [trips, setTrips] = useState<Trip[]>([INITIAL_TRIP, {
    id: 't2',
    name: '普吉岛之旅',
    location: '泰国·普吉岛',
    startDate: '2023-12-01',
    members: INITIAL_MEMBERS,
    budget: 15000,
    status: 'finished',
    image: 'https://picsum.photos/seed/phuket/800/400'
  }]);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [{ ...expense, id: Date.now().toString() }, ...prev]);
  }, []);

  const addWalletTransaction = useCallback((transaction: Omit<WalletTransaction, 'id'>) => {
    setWalletTransactions(prev => [{ ...transaction, id: Date.now().toString() }, ...prev]);
  }, []);

  const walletBalance = useMemo(() => {
    return walletTransactions.reduce((sum, t) => t.type === 'deposit' ? sum + t.amount : sum - t.amount, 0);
  }, [walletTransactions]);

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  
  const currentUserId = 'm4';

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
  }, [memberBalances, currentUserId]);

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
    currentTrip,
    expenses,
    totalSpent,
    myPayable,
    stats,
    settlementPlan,
    memberBalances,
    walletBalance,
    walletTransactions,
    addWalletTransaction,
    currentUserId,
    addExpense,
    trips
  };
};
