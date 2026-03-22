import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../utils/dataStore';
import { ApiResponse, Ledger, CreateLedgerRequest } from '../types';

const router = Router();

// GET /api/ledgers - 获取账本列表
router.get('/', (req: Request, res: Response) => {
  const ledgers = dataStore.getAllLedgers();
  
  const response: ApiResponse<Ledger[]> = {
    success: true,
    data: ledgers,
    meta: {
      total: ledgers.length
    }
  };

  res.json(response);
});

// GET /api/ledgers/:id - 获取单个账本详情
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const ledger = dataStore.getLedgerById(id);

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

  const response: ApiResponse<Ledger> = {
    success: true,
    data: ledger
  };

  res.json(response);
});

// POST /api/ledgers - 创建账本
router.post('/', (req: Request, res: Response) => {
  const body = req.body as CreateLedgerRequest;
  
  const now = new Date().toISOString();
  const newLedger: Ledger = {
    id: `ledger-${uuidv4().slice(0, 8)}`,
    name: body.name.trim(),
    description: body.description?.trim(),
    currency: body.currency,
    theme: body.theme,
    budget: body.budget,
    members: [],
    expenses: [],
    status: 'active',
    createdAt: now,
    updatedAt: now
  };

  const created = dataStore.createLedger(newLedger);

  const response: ApiResponse<Ledger> = {
    success: true,
    data: created
  };

  res.status(201).json(response);
});

// PUT /api/ledgers/:id - 更新账本
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body as Partial<CreateLedgerRequest>;

  const existing = dataStore.getLedgerById(id);
  if (!existing) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'LEDGER_NOT_FOUND',
        message: '账本不存在'
      }
    };
    return res.status(404).json(response);
  }

  const updated = dataStore.updateLedger(id, updates);

  const response: ApiResponse<Ledger> = {
    success: true,
    data: updated!
  };

  res.json(response);
});

// DELETE /api/ledgers/:id - 删除（归档）账本
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = dataStore.getLedgerById(id);
  if (!existing) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'LEDGER_NOT_FOUND',
        message: '账本不存在'
      }
    };
    return res.status(404).json(response);
  }

  dataStore.deleteLedger(id);

  const response: ApiResponse = {
    success: true,
    data: { message: '账本已归档' }
  };

  res.json(response);
});

export default router;
