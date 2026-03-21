# TripNow - 旅行记账应用

> **项目愿景：** 实现从"零门槛创建"到"AI/手动双轨记账"，最后"智能无感结算"的全闭环。

---

## 📋 项目简介

TripNow 是一款面向旅行场景的**多人共享记账工具**，解决朋友结伴出行时的记账、分摊、结算痛点。

### 核心特性
- 🤖 **AI 拍照识别** - 拍小票自动识别金额、类目
- ✏️ **手动记账** - 无票据场景快速补录
- 👥 **影子成员** - 无需注册即可被记账，后续认领
- 💰 **智能结算** - 最小路径算法，减少转账次数
- 🌍 **多币种支持** - 自动识别当地货币

---

## 📁 目录结构

```
TripNow/
├── 📄 README.md              # 项目简介（自动生成）
├── 📘 PROJECT.md             # ⭐ 本文件：项目总纲领
├── ⚙️  package.json          # 依赖配置
├── 🏗️  tsconfig.json         # TypeScript 配置
├── ⚡ vite.config.ts         # Vite 构建配置
│
├── 📂 doc/                   # 文档目录
│   ├── requirements.md       # 完整需求文档（产品来源）
│   └── project-plan.md       # 开发计划与进度追踪
│
├── 📂 query/                 # 决策记录目录
│   └── {决策点}-{日期}.md    # 每次关键对话决策
│
├── 📂 src/                   # 源代码目录（待创建）
│   ├── components/           # React 组件
│   ├── pages/                # 页面级组件
│   ├── hooks/                # 自定义 Hooks
│   ├── services/             # API 服务层
│   ├── stores/               # 状态管理
│   ├── utils/                # 工具函数
│   └── types/                # TypeScript 类型定义
│
├── 📂 server/                # 后端服务（待创建）
│   ├── api/                  # API 路由
│   ├── models/               # 数据模型
│   └── services/             # 业务逻辑
│
└── 📂 assets/                # 静态资源
    ├── images/               # 图片
    └── icons/                # 图标
```

---

## 📂 目录使用原则

### 1. doc/ - 文档中心
**用途：** 存放所有项目文档

| 文件 | 说明 | 更新时机 |
|------|------|----------|
| requirements.md | 产品需求文档 | 需求变更时 |
| project-plan.md | 开发计划清单 | 每日/每周更新 |

**原则：**
- 需求文档只增不改（历史追溯）
- 计划清单实时更新（状态同步）

### 2. query/ - 决策记录
**用途：** 记录每次对话的关键决策

**命名规则：** `{简短决策点}-{YYYY-MM-DD}.md`

**示例：**
- `创建文档结构-2026-03-21.md`
- `确定技术栈-2026-03-22.md`

**内容模板：**
```markdown
# 决策：xxx
**日期：** YYYY-MM-DD

## 背景
...

## 决策点
1. ...
2. ...

## 后续行动
- [ ] ...
```

### 3. src/ - 前端源码
**用途：** React 前端应用代码

**组织原则：**
- 按功能模块划分，而非文件类型
- 组件使用 PascalCase（如 `LedgerCard.tsx`）
- 工具函数使用 camelCase（如 `formatCurrency.ts`）

### 4. server/ - 后端服务
**用途：** Node.js/Python 后端 API

**待确定：**
- 技术栈（Node.js/Express 或 Python/FastAPI）
- 数据库（PostgreSQL / MongoDB）

---

## 🎯 当前进度

### 已完成 ✅
- [x] 项目初始化
- [x] 需求文档整理
- [x] GitHub 配置
- [x] 文档目录结构

### 进行中 🔄
- [ ] 技术栈确认
- [ ] 数据库设计

### 待办 ⏳
- [ ] 账本创建功能
- [ ] 影子成员系统
- [ ] AI 拍照识别
- [ ] 手动记账
- [ ] 智能结算算法

**详细进度见：** `doc/project-plan.md`

---

## 🏗️ 技术栈（待确认）

### 前端（已有基础）
- **框架：** React + TypeScript
- **构建：** Vite
- **样式：** 待定（Tailwind / Styled Components）

### 后端（待选型）
- **选项 A：** Node.js + Express + PostgreSQL
- **选项 B：** Python + FastAPI + PostgreSQL

### 基础设施
- **部署：** 待定（Vercel / 阿里云）
- **AI/OCR：** 待定（百度/腾讯/阿里 API）

---

## 📝 开发规范

### Git 提交规范
```
feat:     新功能
fix:      修复
docs:     文档
style:    格式（不影响代码运行）
refactor: 重构
chore:    构建/工具
```

### 代码规范
- TypeScript 严格模式
- ESLint + Prettier
- 组件必须写 JSDoc 注释

---

## 🤖 AI 接入指南

如果你是新接入的 AI，请按以下步骤了解项目：

1. **读本文档** - 了解项目全貌
2. **读 requirements.md** - 了解产品需求
3. **读 project-plan.md** - 了解当前进度
4. **查看 query/ 目录** - 了解历史决策
5. **确认当前任务** - 询问用户"我们现在要开发哪个模块？"

**重要原则：**
- 每次开发前确认："我们正在开发 TripNow 项目，对吗？"
- 每次重要决策后：在 query/ 目录记录
- 每次进度更新：同步 project-plan.md

---

## 📞 联系

- **仓库：** https://github.com/xiaopengs/TripNow
- **需求来源：** 飞书文档

---

*最后更新：2026-03-21*
*版本：v0.1 - 项目初始化阶段*
