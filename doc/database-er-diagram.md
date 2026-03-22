# TripNow 数据库 ER 图说明

## 数据库概览

TripNow 使用 PostgreSQL 作为数据库，共包含 **11 张表** 和 **2 个视图**，支持账本管理、成员关系、账单记录、结算追踪等核心功能。

---

## ER 图（实体关系图）

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TripNow Database Schema                              │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    users     │◄────────┤   members    │◄────────┤   ledgers    │
├──────────────┤    1:N  ├──────────────┤   N:1   ├──────────────┤
│ PK id        │         │ PK id        │         │ PK id        │
│    phone     │◄───────┐│ FK ledger_id │────────►│ FK owner_id  │
│    email     │        ││ FK user_id   │◄────────│    name      │
│    nickname  │        ││    name      │         │    currency  │
│    wechat_*  │        ││    type      │         │    budget    │
│    status    │        ││    role      │         │    status    │
└──────────────┘        ││    shadow_*  │         └──────────────┘
                        │└──────────────┘                │
                        │         ▲                      │
                        │         │                      │
                        │    ┌────┴────┐                 │
                        │    │         │                 │
                        ▼    ▼         ▼                 ▼
                 ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                 │   expenses   │  │  settlements │  │   wallets    │
                 ├──────────────┤  ├──────────────┤  ├──────────────┤
                 │ PK id        │  │ PK id        │  │ PK id        │
                 │ FK ledger_id │  │ FK ledger_id │  │ FK ledger_id │
    ┌───────────►│ FK payer_id  │  │ FK from_id   │  │    balance   │
    │            │    title     │  │ FK to_id     │  └──────────────┘
    │            │    amount    │  │    amount    │         │
    │            │    category  │  │    status    │         │
    │            │    date/time │  │    method    │         ▼
    │            │    location  │  └──────────────┘  ┌──────────────┐
    │            │    split_type│                     │wallet_trans  │
    │            │    status    │                     ├──────────────┤
    │            └──────────────┘                     │ PK id        │
    │                     │                           │ FK wallet_id │
    │                     │                           │    type      │
    │                     ▼                           │    amount    │
    │            ┌──────────────┐                     │ FK member_id │
    │            │expense_splits│                     │ FK expense_id│
    │            ├──────────────┤                     └──────────────┘
    └────────────│ PK id        │
                 │ FK expense_id│
                 │ FK member_id │
                 │    amount    │
                 └──────────────┘

┌──────────────┐         ┌──────────────┐
│ledger_invit  │◄────────│exchange_rate │
├──────────────┤         ├──────────────┤
│ PK id        │         │ PK id        │
│ FK ledger_id │         │ from_currency│
│    code      │         │ to_currency  │
│    status    │         │    rate      │
└──────────────┘         └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    VIEWS                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ledger_stats    - 账本统计视图（成员数、账单数、总支出、预算余额）              │
│  member_balances - 成员余额视图（支付金额、应付金额、净余额）                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 表关系详解

### 1. 用户与账本关系

```
users (1) ──────< (N) members (N) >────── (1) ledgers
```

- **一个用户**可以创建**多个账本**（通过 `ledgers.owner_id`）
- **一个用户**可以加入**多个账本**（通过 `members` 关联表）
- **一个账本**可以有**多个成员**（包括注册用户和影子成员）

### 2. 账本与账单关系

```
ledgers (1) ──────< (N) expenses
```

- **一个账本**包含**多笔账单**
- 账单通过 `ledger_id` 关联到所属账本
- 账单通过 `payer_id` 关联到支付成员

### 3. 账单与分摊关系

```
expenses (1) ──────< (N) expense_splits (N) >────── (1) members
```

- **一笔账单**可以有**多个分摊明细**
- 每个分摊明细记录**一个成员**应分摊的金额
- 支持多种分摊方式：均分、按比例、固定金额、按份数

### 4. 结算关系

```
settlements (N) >────── (1) members (from_member_id)
settlements (N) >────── (1) members (to_member_id)
```

- **结算记录**表示从**付款方**到**收款方**的资金转移
- 记录结算金额、状态、支付方式等信息

### 5. 公账/钱包关系

```
ledgers (1) ────── (1) wallets (1) ──────< (N) wallet_transactions
```

- **一个账本**对应**一个公共钱包**
- 钱包记录当前余额
- 所有资金流动记录在 `wallet_transactions` 中

---

## 核心业务流程

### 流程 1：创建账本并添加成员

```
1. 用户创建账本 → ledgers 表插入记录
2. 创建者自动成为成员 → members 表插入记录 (type='owner')
3. 创建公共钱包 → wallets 表插入记录
4. 邀请其他成员 → ledger_invitations 表生成邀请码
5. 被邀请人加入 → members 表插入记录
```

### 流程 2：记录一笔账单

```
1. 创建账单 → expenses 表插入记录
2. 根据 split_type 计算分摊
3. 插入分摊明细 → expense_splits 表
4. 如果使用公账支付 → wallet_transactions 表记录支出
```

### 流程 3：成员结算

```
1. 计算成员余额（通过 member_balances 视图）
2. 生成结算方案（应用层算法）
3. 创建结算记录 → settlements 表插入记录
4. 完成支付后更新状态 → settlements.status = 'completed'
```

### 流程 4：影子成员认领

```
1. 账本创建时添加影子成员 → members 表 (type='shadow')
2. 用户注册/登录后认领
3. 更新影子成员状态 → members.shadow_status = 'claimed'
4. 关联用户账号 → members.user_id = 新用户ID
```

---

## 关键设计决策

### 1. 影子成员系统

| 字段 | 说明 |
|------|------|
| `members.type` | `shadow` 表示影子成员（未注册用户） |
| `members.shadow_status` | 跟踪认领状态 |
| `members.user_id` | 认领后关联到真实用户 |

**优势**：
- 允许先记账后注册
- 支持非注册用户参与分账
- 认领后历史数据自动关联

### 2. 分摊明细独立表

将分摊信息独立到 `expense_splits` 表：
- 支持复杂的分摊计算
- 方便查询个人应付金额
- 支持分摊方案修改

### 3. 软删除设计

所有核心表使用 `status` 字段实现软删除：
- `ledgers.status`: `active` | `archived` | `deleted`
- `expenses.status`: `pending` | `confirmed` | `deleted`
- `settlements.status`: `pending` | `completed` | `cancelled`

### 4. UUID 主键

- 使用 UUID v4 作为主键
- 支持分布式系统
- 避免 ID 猜测攻击

### 5. 时区处理

- 所有时间戳使用 `TIMESTAMP WITH TIME ZONE`
- 存储 UTC 时间，按客户端时区显示

---

## 索引策略

### 高频查询场景

| 场景 | 索引 |
|------|------|
| 用户登录 | `idx_users_phone`, `idx_users_wechat` |
| 账本列表 | `idx_ledgers_owner_status` |
| 账单查询 | `idx_expenses_ledger_date` |
| 成员余额 | `idx_expense_splits_member` |
| 结算记录 | `idx_settlements_ledger_status` |

### 复合索引

```sql
-- 账本+状态联合查询
idx_ledgers_owner_status ON ledgers(owner_id, status)

-- 账本+日期排序（账单列表默认排序）
idx_expenses_ledger_date ON expenses(ledger_id, expense_date DESC)
```

---

## 数据类型选择

| 类型 | 使用场景 | 说明 |
|------|----------|------|
| `UUID` | 主键 | 分布式安全 |
| `DECIMAL(15,2)` | 金额 | 精确计算，避免浮点误差 |
| `VARCHAR(n)` | 字符串 | 限制长度，节省空间 |
| `TEXT` | 长文本 | 无长度限制 |
| `TEXT[]` | 图片数组 | PostgreSQL 数组类型 |
| `JSONB` | AI 原始数据 | 灵活存储非结构化数据 |
| `TIMESTAMP WITH TIME ZONE` | 时间戳 | 时区安全 |
| `DATE` / `TIME` | 日期/时间 | 分离存储方便查询 |

---

## 扩展性考虑

### 未来可能添加的表

1. **categories** - 自定义分类表（支持用户自定义账单分类）
2. **notifications** - 通知表（结算提醒、邀请通知等）
3. **audit_logs** - 审计日志表（记录重要操作）
4. **comments** - 账单评论表（成员对账单讨论）
5. **attachments** - 附件表（支持多类型附件）

### 分区考虑

对于高并发场景，可考虑：
- `expenses` 表按 `ledger_id` 分区
- `wallet_transactions` 表按时间分区

---

## 数据库版本

- **PostgreSQL**: 14+
- **必需扩展**: `uuid-ossp`

---

*文档版本: 1.0*  
*创建时间: 2026-03-22*  
*最后更新: 2026-03-22*
