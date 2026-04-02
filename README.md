# TripNow - 智能旅行记账神器

<div align="center">

![TripNow Banner](https://img.shields.io/badge/TripNow-智能旅行记账神器-orange?style=for-the-badge)

[![GitHub stars](https://img.shields.io/github/stars/xiaopengs/TripNow?style=social)](https://github.com/xiaopengs/TripNow/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/xiaopengs/TripNow?style=social)](https://github.com/xiaopengs/TripNow/network/members)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**让旅行记账变得简单、透明、智能**

[在线演示](#) · [快速开始](#快速开始) · [功能特性](#功能特性) · [文档](#文档)

</div>

---

## 📖 项目背景

### 为什么开发 TripNow？

在团队旅行、团建、合租等场景中，费用分摊一直是个头疼的问题：

- ❌ **记账混乱**：小票丢失、金额记错、谁垫付搞不清
- ❌ **分摊复杂**：手动计算容易出错，Excel 表格难以维护
- ❌ **结算困难**：多人之间的欠款关系错综复杂，转账次数多
- ❌ **缺乏透明**：账目不清晰，容易产生误会和矛盾

**TripNow 应运而生！**

### 核心价值

- ✅ **智能记账**：AI 拍照识别，语音记账，告别手动输入
- ✅ **精确计算**：BigDecimal 精确计算，避免浮点数误差
- ✅ **智能结算**：最小路径算法，优化转账方案
- ✅ **完全透明**：账目清晰可见，公账管理有据可查

---

## ✨ 功能特性

### 核心功能

#### 1. 账本管理 📒
- 创建、编辑、删除账本
- 多账本管理，支持归档
- 自动识别当地货币
- 6种皮肤主题可选

#### 2. 智能记账 💰
- **手动记账**：快速录入，智能分摊
- **拍照识别**（开发中）：AI 自动识别小票信息
- **语音记账**（开发中）：说出账单，自动解析
- 6种费用类目：餐饮、交通、住宿、娱乐、购物、门票

#### 3. 成员管理 👥
- 灵活的成员添加方式
- 影子成员系统：先记账，后认领
- 成员余额实时计算

#### 4. 智能结算 🤝
- 最小路径结算算法
- 对冲欠款关系
- 微信收款码生成
- 结算状态跟踪

#### 5. 公账管理 🏦
- 预收公款统一管理
- 公共费用自动扣除
- 充值记录清晰可查
- 实时余额统计

#### 6. 数据质量 ⚙️
- BigDecimal 精确计算
- 幂等性保证
- 本地缓存管理
- 数据一致性校验

---

## 🛠️ 技术栈

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 19.2.3 | UI 框架 |
| **TypeScript** | 5.8.2 | 类型安全 |
| **Vite** | 6.2.0 | 构建工具 |
| **Tailwind CSS** | - | 样式框架 |
| **Recharts** | 3.6.0 | 图表库 |
| **Lucide React** | 0.562.0 | 图标库 |

### 小程序技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **Taro** | 4.1.11 | 多端框架 |
| **Redux** | 5.0.0 | 状态管理 |
| **React-Redux** | 9.1.0 | React 绑定 |
| **Redux-Persist** | 6.0.0 | 状态持久化 |

### 后端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **Node.js** | - | 运行环境 |
| **Express** | - | Web 框架 |
| **PostgreSQL** | - | 数据库 |

### AI 服务

| 服务 | 用途 |
|------|------|
| **Google Gemini** | AI 拍照识别、语音解析 |

### 开发工具

| 工具 | 用途 |
|------|------|
| **Vitest** | 单元测试 |
| **ESLint** | 代码检查 |
| **Prettier** | 代码格式化 |
| **GitHub Actions** | CI/CD |

---

## 📂 目录结构

```
TripNow/
├── 📁 components/           # Web 端组件
│   ├── AddExpenseModal.tsx      # 添加账单弹窗
│   ├── CreateLedgerModal.tsx    # 创建账本弹窗
│   ├── CreateLedgerPage.tsx     # 创建账本页面
│   ├── Dashboard.tsx            # 首页仪表盘
│   ├── FabMenu.tsx              # 扇形菜单
│   ├── FinancialSettings.tsx    # 财务设置
│   ├── Inbox.tsx                # 待处理收件箱
│   ├── Records.tsx              # 流水记录
│   ├── Settlement.tsx           # 结算页面
│   ├── ShadowMemberModal.tsx    # 影子成员
│   ├── Sidebar.tsx              # 侧边栏
│   └── Statistics.tsx           # 统计图表
│
├── 📁 services/             # 服务层
│   └── geminiService.ts         # AI 服务
│
├── 📁 utils/                # 工具类
│   └── dataQuality.ts           # 数据质量保证
│
├── 📁 weixin/               # 小程序代码
│   ├── 📁 src/                  # 源码
│   │   ├── 📁 pages/            # 页面
│   │   │   ├── index/           # 首页
│   │   │   ├── expense/         # 记账页
│   │   │   ├── ledger-detail/   # 账本详情
│   │   │   ├── settlement/      # 结算页
│   │   │   ├── ai-camera/       # AI拍照（占位）
│   │   │   └── voice/           # 语音记账（占位）
│   │   ├── 📁 store/            # Redux Store
│   │   │   └── index.ts         # 状态管理
│   │   ├── 📁 utils/            # 工具函数
│   │   │   ├── monitor.ts       # 监控
│   │   │   └── optimize.ts      # 优化
│   │   ├── app.tsx              # 应用入口
│   │   └── app.config.ts        # 应用配置
│   ├── 📁 dist/                 # 编译产物
│   └── package.json             # 依赖配置
│
├── 📁 docs/                 # 文档目录
│   ├── USER_GUIDE.md            # 用户手册
│   ├── PRIVACY_POLICY.md        # 隐私政策
│   ├── USER_AGREEMENT.md        # 用户协议
│   ├── REVIEW_SUBMISSION_CHECKLIST.md  # 审核清单
│   ├── QUICK_SUBMISSION_GUIDE.md       # 快速提交指南
│   ├── ARCHITECTURE_DECISIONS.md       # 架构决策
│   └── README.md                # 文档索引
│
├── 📁 .github/              # GitHub 配置
│   └── 📁 workflows/
│       └── ci.yml               # CI/CD 配置
│
├── 📁 src/                  # Web 端源码
│   ├── test/                    # 测试文件
│   └── ...
│
├── App.tsx                  # Web 应用入口
├── package.json             # 依赖配置
├── vite.config.ts           # Vite 配置
├── vitest.config.ts         # 测试配置
├── .eslintrc.cjs            # ESLint 配置
└── README.md                # 项目说明
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **微信开发者工具**: 最新版（小程序开发）

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/xiaopengs/TripNow.git
cd TripNow

# Web 端依赖
npm install

# 小程序依赖
cd weixin
npm install
cd ..
```

### 本地运行（Web 版）

```bash
# 开发模式
npm run dev

# 访问 http://localhost:5173
```

### 小程序编译

```bash
# 进入小程序目录
cd weixin

# 编译微信小程序
npm run build:weapp

# 开发模式（监听文件变化）
npm run dev:weapp

# 编译其他平台
npm run build:alipay    # 支付宝小程序
npm run build:h5        # H5
npm run build:rn        # React Native
```

### 微信开发者工具导入

```
1. 打开微信开发者工具
2. 导入项目
3. 选择目录：TripNow/weixin/dist
4. AppID：使用测试号或正式 AppID
5. 点击"导入"
```

---

## 📊 编译方式详解

### Web 版本编译

```bash
# 开发环境
npm run dev              # 启动开发服务器
npm run dev:host         # 局域网访问

# 生产环境
npm run build            # 构建生产版本
npm run preview          # 预览构建结果

# 代码质量
npm run lint             # ESLint 检查
npm run lint:fix         # 自动修复
npm run type-check       # TypeScript 类型检查
npm run format           # Prettier 格式化

# 测试
npm run test             # 运行测试
npm run test:ui          # 测试 UI
npm run test:coverage    # 测试覆盖率

# 完整 CI 流程
npm run ci               # lint + type-check + test + build
```

### 小程序编译

```bash
# 微信小程序
cd weixin
npm run build:weapp      # 生产编译
npm run dev:weapp        # 开发编译（监听）

# 其他平台
npm run build:alipay     # 支付宝小程序
npm run build:swan       # 百度小程序
npm run build:tt         # 抖音小程序
npm run build:h5         # H5 版本
npm run build:rn         # React Native
```

### 编译产物

```
weixin/dist/
├── app.js                # 应用入口
├── app.json              # 应用配置
├── app.wxss              # 全局样式
├── project.config.json   # 项目配置
└── pages/                # 页面文件
    ├── index/
    ├── expense/
    ├── ledger-detail/
    └── ...
```

---

## 🎯 核心功能演示

### 1. 创建账本

```typescript
import { actions } from './store'

// 创建新账本
store.dispatch(actions.createLedger({
  name: '云南七日游',
  currency: 'CNY',
  skin: 'ocean',
  budget: 10000,
  members: [
    { name: '我' },
    { name: '小明' },
    { name: '小红' },
    { name: '小李' }
  ]
}))
```

### 2. 记录账单

```typescript
// 手动记账
store.dispatch(actions.addExpense(ledgerId, {
  title: '午餐 - 桥香园米线',
  amount: 120,
  category: 'food',
  payer: 'member-id-1',
  splitMembers: ['member-id-1', 'member-id-2', 'member-id-3'],
  splitMethod: 'equal'
}))
```

### 3. 智能结算

```typescript
import { selectors } from './store'

// 获取结算方案
const settlements = selectors.getSettlementData(state, ledgerId)

// 示例输出
// [
//   { from: 'member-1', to: 'member-2', amount: 150.00 },
//   { from: 'member-3', to: 'member-4', amount: 75.50 }
// ]
```

---

## 🔧 开发指南

### 代码规范

项目使用以下工具保证代码质量：

- **ESLint**: JavaScript/TypeScript 代码检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型安全
- **Husky**: Git Hooks（可选）

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix

# 格式化
npm run format
```

### Git 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

### 分支管理

```
main        # 主分支（稳定版本）
develop     # 开发分支
feature/*   # 功能分支
hotfix/*    # 紧急修复
```

---

## 📱 小程序开发

### 技术架构

```
┌─────────────────┐
│   Pages (UI)    │  页面组件
├─────────────────┤
│  Redux Store    │  状态管理
├─────────────────┤
│  Redux Persist  │  持久化存储
├─────────────────┤
│  Taro Storage   │  本地存储
└─────────────────┘
```

### 状态管理

使用 **Redux + Redux-Persist** 进行状态管理：

```typescript
// Store 结构
{
  ledgers: Ledger[],          // 账本列表
  currentLedgerId: string     // 当前账本ID
}

// Actions
- createLedger
- addExpense
- updateMember
- rechargeWallet
// ...

// Selectors
- getCurrentLedger
- getMemberBalance
- getSettlementData
// ...
```

### 本地存储

```typescript
// 使用 Taro Storage
import Taro from '@tarojs/taro'

// 存储
Taro.setStorageSync('tripnow', data)

// 读取
const data = Taro.getStorageSync('tripnow')

// 删除
Taro.removeStorageSync('tripnow')
```

---

## 🌟 技术亮点

### 1. BigDecimal 精确计算

```typescript
// 避免浮点数误差
0.1 + 0.2 !== 0.3  // ❌ JavaScript 原生计算

// 使用工具函数
addPrecise(0.1, 0.2) === 0.3  // ✅ 精确计算
```

### 2. 最小路径结算算法

```typescript
// 原始欠款关系
A欠B 100元，B欠C 100元，C欠A 100元

// 优化后
无需转账（对冲为0）
```

### 3. 幂等性保证

```typescript
// 防止重复提交
const key = generateIdempotencyKey('add-expense', data)

if (isDuplicateOperation(key)) {
  return // 拒绝重复操作
}

recordOperation(key) // 记录操作
```

### 4. 数据一致性校验

```typescript
// 自动检测并修复数据不一致
const { isValid, errors } = validateLedgerConsistency(ledger)

if (!isValid) {
  const repaired = repairLedgerData(ledger)
}
```

---

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm run test

# UI 模式
npm run test:ui

# 覆盖率报告
npm run test:coverage
```

### 测试覆盖率目标

- ✅ 语句覆盖率：≥ 70%
- ✅ 分支覆盖率：≥ 60%
- ✅ 函数覆盖率：≥ 70%
- ✅ 行覆盖率：≥ 70%

---

## 📦 部署

### Web 版本部署

```bash
# 构建
npm run build

# 产物在 dist/ 目录
# 可部署到任意静态服务器
```

### 小程序发布

```bash
# 1. 编译
cd weixin
npm run build:weapp

# 2. 微信开发者工具上传
# 3. 提交审核
# 4. 发布上线
```

---

## 📚 文档

| 文档 | 说明 | 链接 |
|------|------|------|
| 用户手册 | 详细使用指南 | [USER_GUIDE.md](docs/USER_GUIDE.md) |
| 隐私政策 | 数据隐私说明 | [PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md) |
| 用户协议 | 服务协议 | [USER_AGREEMENT.md](docs/USER_AGREEMENT.md) |
| 审核清单 | 提交审核指南 | [REVIEW_SUBMISSION_CHECKLIST.md](docs/REVIEW_SUBMISSION_CHECKLIST.md) |
| 架构决策 | 技术选型说明 | [ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md) |

---

## 🤝 贡献指南

欢迎贡献代码、提出问题或建议！

### 如何贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范

- 遵循 ESLint 规则
- 编写单元测试
- 更新相关文档
- 保持代码简洁

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

感谢以下开源项目：

- [React](https://react.dev/)
- [Taro](https://taro.jd.com/)
- [Redux](https://redux.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Lucide](https://lucide.dev/)

---

## 📞 联系方式

- **项目主页**: https://github.com/xiaopengs/TripNow
- **问题反馈**: https://github.com/xiaopengs/TripNow/issues
- **邮箱**: support@tripnow.app

---

<div align="center">

**Made with ❤️ by TripNow Team**

[⬆ 返回顶部](#tripnow---智能旅行记账神器)

</div>
