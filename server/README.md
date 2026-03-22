# TripNow 后端服务

旅行记账应用 TripNow 的 Node.js + Express 后端 API 服务。

## 技术栈

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Security**: Helmet, CORS
- **Logging**: Morgan

## 快速开始

### 安装依赖

```bash
cd server
npm install
```

### 环境配置

```bash
cp .env.example .env
# 编辑 .env 文件配置你的环境变量
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
npm start
```

## API 端点

### 健康检查
- `GET /api/health` - 服务健康状态

### 账本管理
- `GET /api/ledgers` - 获取账本列表
- `POST /api/ledgers` - 创建账本
- `GET /api/ledgers/:id` - 获取账本详情
- `PUT /api/ledgers/:id` - 更新账本
- `DELETE /api/ledgers/:id` - 归档账本

### 账单管理
- `GET /api/expenses?ledgerId=xxx` - 获取账单列表
- `POST /api/expenses` - 创建账单
- `GET /api/expenses/:id` - 获取账单详情
- `PUT /api/expenses/:id` - 更新账单
- `DELETE /api/expenses/:id` - 删除账单

## 数据模型

### Ledger（账本）
```typescript
{
  id: string;
  name: string;
  description?: string;
  currency: Currency;
  theme: LedgerTheme;
  budget?: number;
  members: Member[];
  expenses: Expense[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

### Expense（账单）
```typescript
{
  id: string;
  ledgerId: string;
  title: string;
  amount: number;
  currency: Currency;
  payerId: string;
  date: string;
  time: string;
  location: string;
  category: Category;
  splitType: SplitType;
  participants: string[];
  image?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 项目结构

```
server/
├── src/
│   ├── index.ts          # 应用入口
│   ├── routes/           # API 路由
│   │   ├── health.ts
│   │   ├── ledgers.ts
│   │   └── expenses.ts
│   ├── middleware/       # 中间件
│   │   ├── errorHandler.ts
│   │   └── validator.ts
│   ├── types/            # TypeScript 类型
│   │   └── index.ts
│   └── utils/            # 工具函数
│       └── dataStore.ts  # 内存数据存储
├── package.json
├── tsconfig.json
└── .env.example
```

## 注意事项

- 当前使用内存存储，数据在重启后会丢失
- 后续可扩展为数据库存储（PostgreSQL/MongoDB）
- 已集成 Mock 数据便于前端联调
