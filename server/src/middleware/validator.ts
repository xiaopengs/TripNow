import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

// 验证请求体中间件
export const validateLedgerCreate = (req: Request, res: Response, next: NextFunction) => {
  const { name, currency, theme } = req.body;
  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('账本名称不能为空');
  }

  if (!currency) {
    errors.push('币种不能为空');
  }

  if (!theme) {
    errors.push('主题不能为空');
  }

  if (errors.length > 0) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: errors.join(', ')
      }
    };
    return res.status(400).json(response);
  }

  next();
};

export const validateExpenseCreate = (req: Request, res: Response, next: NextFunction) => {
  const { ledgerId, title, amount, payerId, date, category, splitType, participants } = req.body;
  const errors: string[] = [];

  if (!ledgerId) errors.push('账本ID不能为空');
  if (!title || typeof title !== 'string' || title.trim().length === 0) errors.push('标题不能为空');
  if (amount === undefined || amount === null || isNaN(Number(amount))) errors.push('金额必须是有效数字');
  if (!payerId) errors.push('付款人ID不能为空');
  if (!date) errors.push('日期不能为空');
  if (!category) errors.push('分类不能为空');
  if (!splitType) errors.push('分摊类型不能为空');
  if (!participants || !Array.isArray(participants) || participants.length === 0) {
    errors.push('参与人不能为空');
  }

  if (errors.length > 0) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: errors.join(', ')
      }
    };
    return res.status(400).json(response);
  }

  next();
};
