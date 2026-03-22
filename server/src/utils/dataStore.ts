// 内存数据存储（后续可替换为数据库）
import { Ledger, Expense } from '../types';

class DataStore {
  private ledgers: Map<string, Ledger> = new Map();
  private expenses: Map<string, Expense> = new Map();

  // Ledger 操作
  getAllLedgers(): Ledger[] {
    return Array.from(this.ledgers.values())
      .filter(l => l.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getLedgerById(id: string): Ledger | undefined {
    return this.ledgers.get(id);
  }

  createLedger(ledger: Ledger): Ledger {
    this.ledgers.set(ledger.id, ledger);
    return ledger;
  }

  updateLedger(id: string, updates: Partial<Ledger>): Ledger | undefined {
    const ledger = this.ledgers.get(id);
    if (!ledger) return undefined;
    
    const updated = { ...ledger, ...updates, updatedAt: new Date().toISOString() };
    this.ledgers.set(id, updated);
    return updated;
  }

  deleteLedger(id: string): boolean {
    const ledger = this.ledgers.get(id);
    if (!ledger) return false;
    
    ledger.status = 'archived';
    ledger.updatedAt = new Date().toISOString();
    this.ledgers.set(id, ledger);
    return true;
  }

  // Expense 操作
  getAllExpenses(): Expense[] {
    return Array.from(this.expenses.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getExpensesByLedgerId(ledgerId: string): Expense[] {
    return this.getAllExpenses().filter(e => e.ledgerId === ledgerId);
  }

  getExpenseById(id: string): Expense | undefined {
    return this.expenses.get(id);
  }

  createExpense(expense: Expense): Expense {
    this.expenses.set(expense.id, expense);
    
    // 同时更新账本的支出列表
    const ledger = this.ledgers.get(expense.ledgerId);
    if (ledger) {
      ledger.expenses.push(expense);
      ledger.updatedAt = new Date().toISOString();
    }
    
    return expense;
  }

  updateExpense(id: string, updates: Partial<Expense>): Expense | undefined {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    
    const updated = { ...expense, ...updates, updatedAt: new Date().toISOString() };
    this.expenses.set(id, updated);
    return updated;
  }

  deleteExpense(id: string): boolean {
    const expense = this.expenses.get(id);
    if (!expense) return false;
    
    this.expenses.delete(id);
    
    // 从账本支出列表中移除
    const ledger = this.ledgers.get(expense.ledgerId);
    if (ledger) {
      ledger.expenses = ledger.expenses.filter(e => e.id !== id);
      ledger.updatedAt = new Date().toISOString();
    }
    
    return true;
  }

  // 初始化 Mock 数据
  initMockData(): void {
    // 创建示例账本
    const mockLedger: Ledger = {
      id: 'ledger-001',
      name: '云南七日游',
      description: '2024年春节云南自驾游',
      currency: Currency.CNY,
      theme: 'ocean' as LedgerTheme,
      budget: 20000,
      members: [
        {
          id: 'member-001',
          name: '小明',
          avatar: '👨',
          type: 'real' as MemberType,
          isClaimed: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'member-002',
          name: '小红',
          avatar: '👩',
          type: 'real' as MemberType,
          isClaimed: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'member-003',
          name: '阿杰',
          avatar: '👦',
          type: 'real' as MemberType,
          isClaimed: true,
          createdAt: new Date().toISOString()
        }
      ],
      expenses: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.ledgers.set(mockLedger.id, mockLedger);

    // 创建示例支出
    const mockExpenses: Expense[] = [
      {
        id: 'expense-001',
        ledgerId: 'ledger-001',
        title: '大理古城晚餐',
        amount: 268,
        currency: Currency.CNY,
        payerId: 'member-001',
        date: '2024-02-10',
        time: '19:30',
        location: '大理古城',
        category: 'Food' as Category,
        splitType: 'Equal' as SplitType,
        participants: ['member-001', 'member-002', 'member-003'],
        note: '白族特色菜',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'expense-002',
        ledgerId: 'ledger-001',
        title: '洱海租车',
        amount: 350,
        currency: Currency.CNY,
        payerId: 'member-002',
        date: '2024-02-11',
        time: '09:00',
        location: '大理',
        category: 'Transport' as Category,
        splitType: 'Equal' as SplitType,
        participants: ['member-001', 'member-002', 'member-003'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    mockExpenses.forEach(expense => {
      this.expenses.set(expense.id, expense);
    });

    // 更新账本支出列表
    mockLedger.expenses = mockExpenses;
  }
}

// 导入类型
import { Currency, LedgerTheme, MemberType, Category, SplitType } from '../types';

export const dataStore = new DataStore();
