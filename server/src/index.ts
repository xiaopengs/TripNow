import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler';
import { validateLedgerCreate, validateExpenseCreate } from './middleware/validator';
import healthRoutes from './routes/health';
import ledgerRoutes from './routes/ledgers';
import expenseRoutes from './routes/expenses';
import { dataStore } from './utils/dataStore';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 配置
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// 中间件
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(requestLogger);

// 初始化 Mock 数据
dataStore.initMockData();

// API 路由
app.use('/api/health', healthRoutes);
app.use('/api/ledgers', validateLedgerCreate, ledgerRoutes);
app.use('/api/expenses', validateExpenseCreate, expenseRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({
    name: 'TripNow API',
    version: '1.0.0',
    description: '旅行记账后端服务',
    endpoints: {
      health: 'GET /api/health',
      ledgers: {
        list: 'GET /api/ledgers',
        create: 'POST /api/ledgers',
        get: 'GET /api/ledgers/:id',
        update: 'PUT /api/ledgers/:id',
        delete: 'DELETE /api/ledgers/:id'
      },
      expenses: {
        list: 'GET /api/expenses?ledgerId=xxx',
        create: 'POST /api/expenses',
        get: 'GET /api/expenses/:id',
        update: 'PUT /api/expenses/:id',
        delete: 'DELETE /api/expenses/:id'
      }
    }
  });
});

// 404 处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 TripNow Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

export default app;
