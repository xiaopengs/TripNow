import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types';

const router = Router();

// GET /api/health - 健康检查
router.get('/', (req: Request, res: Response) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  const response: ApiResponse<typeof healthData> = {
    success: true,
    data: healthData
  };

  res.json(response);
});

export default router;
