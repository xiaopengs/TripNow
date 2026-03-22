import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../utils/dataStore';
import { ApiResponse, Expense, CreateExpenseRequest } from '../types';

const router = Router();

// GET /api/expenses - 获取账单列表
router.get('/', (req: Request, res: Response) => {
  const { ledgerId } = req.query;
  
  let expenses: Expense[];
  if (ledgerId && typeof ledgerId === 'string') {
    expenses = dataStore.getExpensesByLedgerId(ledgerId);
  } else {
    expenses = dataStore.getAllExpenses();
  }

  const response: ApiResponse<Expense[]> = {
    success: true,
    data: expenses,
    meta: {
      total: expenses.length
    }
  };

  res.json(response);
});

// GET /api/expenses/:id - 获取单个账单详情
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const expense = dataStore.getExpenseById(id);

  if (!expense) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'EXPENSE_NOT_FOUND',
        message: '账单不存在'
      }
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Expense> = {
    success: true,
    data: expense
  };

  res.json(response);
});

// POST /api/expenses - 创建账单
router.post('/', (req: Request, res: Response) => {
  const body = req.body as CreateExpenseRequest;
  
  // 验证账本是否存在
  const ledger = dataStore.getLedgerById(body.ledgerId);
  if (!ledger) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'LEDGER_NOT_FOUND',
        message: '账本不存在'
      }
    };
    return res.status(404).json(response);
  }

  const now = new Date().toISOString();
  const newExpense: Expense = {
    id: `expense-${uuidv4().slice(0, 8)}`,
    ledgerId: body.ledgerId,
    title: body.title.trim(),
    amount: Number(body.amount),
    currency: body.currency || ledger.currency,
    payerId: body.payerId,
    date: body.date,
    time: body.time || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    location: body.location?.trim() || '',
    category: body.category,
    splitType: body.splitType,
    participants: body.participants,
    image: body.image,
    note: body.note?.trim(),
    createdAt: now,
    updatedAt: now
  };

  const created = dataStore.createExpense(newExpense);

  const response: ApiResponse<Expense> = {
    success: true,
    data: created
  };

  res.status(201).json(response);
});

// PUT /api/expenses/:id - 更新账单
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body as Partial<CreateExpenseRequest>;

  const existing = dataStore.getExpenseById(id);
  if (!existing) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'EXPENSE_NOT_FOUND',
        message: '账单不存在'
      }
    };
    return res.status(404).json(response);
  }

  const updated = dataStore.updateExpense(id, updates);

  const response: ApiResponse<Expense> = {
    success: true,
    data: updated!
  };

  res.json(response);
});

// DELETE /api/expenses/:id - 删除账单
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = dataStore.getExpenseById(id);
  if (!existing) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'EXPENSE_NOT_FOUND',
        message: '账单不存在'
      }
    };
    return res.status(404).json(response);
  }

  dataStore.deleteExpense(id);

  const response: ApiResponse = {
    success: true,
    data: { message: '账单已删除' }
  };

  res.json(response);
});

export default router;
