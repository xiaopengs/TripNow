import { useState, useCallback, useMemo, useEffect } from 'react';
import { Trip, Expense, Member, SettlementStep, WalletTransaction, Category, ExtendedMember, MemberType } from '../types';
import { MOCK_MEMBERS, MOCK_TRIPS, MOCK_EXPENSES, MOCK_WALLET_TRANSACTIONS } from '../data/mockData';

// 扩展的成员类型，包含影子成员信息
interface MemberWithShadow extends ExtendedMember {}

// 使用 Mock 数据作为初始数据
const INITIAL_TRIP: Trip = MOCK_TRIPS[0];

// 初始化成员（将 mock 成员转换为扩展格式）
const initializeMembers = (): MemberWithShadow[] => {
  return MOCK_MEMBERS.map((m, index) => ({
    ...m,
    type: index < 2 ? 'real' : 'shadow' as MemberType, // 前两个为真实用户，后两个为影子成员
    isClaimed: index < 2,
    claimedBy: index < 2 ? m.id : undefined,
    createdAt: new Date().toISOString(),
  }));
};

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

  // 影子成员状态
  const [members, setMembers] = useState<MemberWithShadow[]>(() => {
    const saved = localStorage.getItem('ts_members');
    return saved ? JSON.parse(saved) : initializeMembers();
  });

  const [currentTrip] = useState<Trip>(INITIAL_TRIP);
  const currentUserId = 'm1'; // 模拟当前用户（小明）

  // 2. Persistence Logic (保存到本地数据库)
  useEffect(() => {
    localStorage.setItem('ts_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('ts_wallet', JSON.stringify(walletTransactions));
  }, [walletTransactions]);

  useEffect(() => {
    localStorage.setItem('ts_members', JSON.stringify(members));
  }, [members]);

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

  // ==================== 影子成员系统 ====================

  // 生成唯一ID
  const generateMemberId = useCallback((): string => {
    return `shadow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 生成认领令牌
  const generateClaimToken = useCallback((memberId: string): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    return `claim_${currentTrip.id}_${memberId}_${timestamp}_${random}`;
  }, [currentTrip.id]);

  // 添加影子成员
  const addShadowMember = useCallback((name: string): MemberWithShadow => {
    const newMember: MemberWithShadow = {
      id: generateMemberId(),
      name: name.trim(),
      avatar: `https://picsum.photos/seed/${Date.now()}/100`,
      type: 'shadow',
      isClaimed: false,
      createdAt: new Date().toISOString(),
      claimToken: generateClaimToken(generateMemberId()),
    };
    
    setMembers(prev => [...prev, newMember]);
    return newMember;
  }, [generateClaimToken]);

  // 认领影子成员
  const claimShadowMember = useCallback((shadowId: string, userId: string): boolean => {
    setMembers(prev => {
      const member = prev.find(m => m.id === shadowId);
      if (!member || member.isClaimed || member.type !== 'shadow') {
        return prev;
      }

      return prev.map(m => 
        m.id === shadowId 
          ? { ...m, isClaimed: true, claimedBy: userId, type: 'real' as MemberType }
          : m
      );
    });
    return true;
  }, []);

  // 通过令牌认领影子成员
  const claimShadowMemberByToken = useCallback((token: string, userId: string): { success: boolean; memberName?: string } => {
    // 解析令牌格式: claim_tripId_memberId_timestamp_random
    const parts = token.split('_');
    if (parts.length < 5 || parts[0] !== 'claim') {
      return { success: false };
    }

    const memberId = parts[2];
    
    let claimedMemberName: string | undefined;
    
    setMembers(prev => {
      const member = prev.find(m => m.id === memberId);
      if (!member || member.isClaimed || member.type !== 'shadow') {
        return prev;
      }
      
      claimedMemberName = member.name;
      return prev.map(m => 
        m.id === memberId 
          ? { ...m, isClaimed: true, claimedBy: userId, type: 'real' as MemberType, claimToken: token }
          : m
      );
    });

    return { success: !!claimedMemberName, memberName: claimedMemberName };
  }, []);

  // 身份迁移（将影子成员的账单迁移到真实用户）
  const migrateMember = useCallback((fromId: string, toId: string): boolean => {
    // 验证两个成员都存在
    const fromMember = members.find(m => m.id === fromId);
    const toMember = members.find(m => m.id === toId);
    
    if (!fromMember || !toMember) {
      console.error('成员不存在');
      return false;
    }

    if (fromMember.type !== 'shadow') {
      console.error('只能迁移影子成员');
      return false;
    }

    // 迁移账单中的付款人
    setExpenses(prev => prev.map(expense => {
      if (expense.payerId === fromId) {
        return { ...expense, payerId: toId };
      }
      return expense;
    }));

    // 迁移账单中的参与者
    setExpenses(prev => prev.map(expense => {
      if (expense.participants.includes(fromId)) {
        return {
          ...expense,
          participants: expense.participants.map(p => p === fromId ? toId : p)
        };
      }
      return expense;
    }));

    // 迁移公账流水
    setWalletTransactions(prev => prev.map(transaction => {
      if (transaction.memberId === fromId) {
        return { ...transaction, memberId: toId };
      }
      return transaction;
    }));

    // 更新成员状态：标记影子成员为已迁移，并记录迁移关系
    setMembers(prev => prev.map(m => {
      if (m.id === fromId) {
        return { 
          ...m, 
          isClaimed: true, 
          claimedBy: toId,
          type: 'real' as MemberType
        };
      }
      return m;
    }));

    return true;
  }, [members]);

  // 获取影子成员列表
  const shadowMembers = useMemo(() => {
    return members.filter(m => m.type === 'shadow');
  }, [members]);

  // 获取真实用户列表
  const realMembers = useMemo(() => {
    return members.filter(m => m.type === 'real');
  }, [members]);

  // 获取未认领的影子成员
  const unclaimedShadowMembers = useMemo(() => {
    return members.filter(m => m.type === 'shadow' && !m.isClaimed);
  }, [members]);

  // 获取当前用户的影子成员（已认领的）
  const myShadowMembers = useMemo(() => {
    return members.filter(m => m.claimedBy === currentUserId);
  }, [members, currentUserId]);

  // 更新当前行程的成员列表（保持兼容性）
  const currentTripWithMembers = useMemo(() => ({
    ...currentTrip,
    members: members.map(m => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar,
    })),
  }), [currentTrip, members]);

  // 4. Computed Properties (ViewModel 负责计算派生状态，减轻 View 负担)
  const walletBalance = useMemo(() => {
    return walletTransactions.reduce((sum, t) => t.type === 'deposit' ? sum + t.amount : sum - t.amount, 0);
  }, [walletTransactions]);

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const memberBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    members.forEach(m => balances[m.id] = 0);

    expenses.forEach(e => {
      const share = e.amount / e.participants.length;
      balances[e.payerId] += e.amount;
      e.participants.forEach(pId => {
        balances[pId] -= share;
      });
    });
    return balances;
  }, [expenses, members]);

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
      avgPerPerson: totalSpent / members.length,
      count: expenses.length,
      avgPerEntry: expenses.length ? totalSpent / expenses.length : 0,
      categories
    };
  }, [expenses, totalSpent, members.length]);

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
    currentTrip: currentTripWithMembers,
    expenses,
    walletTransactions,
    currentUserId,
    members,
    // Shadow Member System
    shadowMembers,
    realMembers,
    unclaimedShadowMembers,
    myShadowMembers,
    // Shadow Member Actions
    addShadowMember,
    claimShadowMember,
    claimShadowMemberByToken,
    migrateMember,
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
