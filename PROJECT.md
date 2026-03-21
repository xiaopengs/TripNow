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
├── 📄 README.md              # 项目简介
├── 📘 PROJECT.md             # ⭐ 本文件：项目总纲领（必读）
├── ⚙️  package.json          # 依赖配置
├── 🏗️  tsconfig.json         # TypeScript 配置
├── ⚡ vite.config.ts         # Vite 构建配置
│
├── 📂 components/            # React 组件
│   ├── FabMenu.tsx           # FAB 扇形菜单 ⭐
│   ├── Inbox.tsx             # 待处理收件箱 ⭐
│   ├── Dashboard.tsx         # 首页仪表盘
│   ├── AddExpenseModal.tsx   # 记账弹窗
│   ├── Records.tsx           # 流水记录
│   ├── Statistics.tsx        # 统计图表
│   ├── Settlement.tsx        # 结算中心
│   └── ...
│
├── 📂 hooks/                 # 自定义 Hooks
│   └── useTripViewModel.ts   # 业务逻辑 ViewModel ⭐
│
├── 📂 services/              # 服务层
│   └── geminiService.ts      # Google AI API 封装
│
├── 📂 data/                  # Mock 数据
│   ├── mockData.ts           # 云南七日游完整数据 ⭐
│   └── mockData.README.md    # 数据说明
│
├── 📂 doc/                   # 文档目录
│   ├── requirements.md       # 完整需求文档（产品来源）
│   ├── project-plan.md       # 开发计划与进度追踪 ⭐
│   ├── tech-architecture.md  # 技术架构分析
│   ├── test-plan.md          # 测试方案 ⭐
│   └── bug-tracker.md        # 问题追踪清单 ⭐
│
├── 📂 query/                 # 决策记录目录
│   └── {决策点}-{日期}.md    # 每次关键对话决策
│
└── 📂 types.ts               # TypeScript 类型定义
```

---

## 📂 目录使用原则

### 1. components/ - UI 组件
**用途：** React 功能组件

**重点组件：**
| 组件 | 功能 | 状态 |
|------|------|------|
| FabMenu.tsx | 扇形菜单（手动/拍照/语音）| ✅ 已完成 |
| Inbox.tsx | 待处理账单管理 | ✅ 已完成 |
| Dashboard.tsx | 首页仪表盘 | ✅ 基础完成 |
| AddExpenseModal.tsx | 记账弹窗 | ✅ 基础完成 |

### 2. doc/ - 文档中心
**用途：** 项目文档和进度追踪

| 文件 | 说明 | 重要性 |
|------|------|--------|
| requirements.md | 产品需求文档 | ⭐⭐⭐ |
| project-plan.md | 开发计划清单 | ⭐⭐⭐ |
| tech-architecture.md | 技术架构分析 | ⭐⭐ |
| test-plan.md | 测试方案 | ⭐⭐ |
| bug-tracker.md | 问题追踪 | ⭐⭐ |

**原则：**
- 需求文档只增不改（历史追溯）
- 计划清单实时更新（状态同步）
- Bug 追踪即时记录

### 3. query/ - 决策记录
**用途：** 记录每次对话的关键决策

**命名规则：** `{简短决策点}-{YYYY-MM-DD}.md`

**示例：**
- `创建文档结构-2026-03-21.md`
- `确定技术栈-2026-03-22.md`

### 4. data/ - Mock 数据
**用途：** 开发和演示数据

**当前数据：**
- 场景：云南七日游
- 人数：4人（小明、小红、小刚、小美）
- 支出：22笔，总计 ¥10,230
- 天数：7天（2024-10-01 至 2024-10-07）

---

## 🎯 当前进度（2026-03-21）

### 总体统计
| 状态 | 数量 |
|------|------|
| ✅ 已完成 | **9** |
| 🔄 进行中 | 2 |
| ⏳ 待办 | 7 |
| **总计** | **18** |

### 已完成 ✅

#### 项目基础（100%）
- [x] React 19 + TypeScript + Vite 搭建
- [x] Tailwind CSS 样式系统
- [x] Google Gemini AI 集成
- [x] GitHub 配置（Token 认证）

#### 文档体系（100%）
- [x] PROJECT.md 项目总纲领
- [x] requirements.md 需求文档
- [x] tech-architecture.md 技术架构
- [x] test-plan.md 测试方案
- [x] bug-tracker.md 问题追踪
- [x] query/ 决策记录

#### Mock 数据（100%）
- [x] 云南七日游完整场景
- [x] 4人成员数据
- [x] 22笔支出记录
- [x] 公账流水数据
- [x] ViewModel 接入

#### 前端核心功能（部分完成）
- [x] **FAB 扇形菜单** - 扇形展开、动画、震动反馈
- [x] **Inbox 收件箱** - 红点提示、确认/删除/重试
- [x] 首页仪表盘 - 基础展示
- [x] 记账弹窗 - 基础功能

### 进行中 🔄
- [ ] AI 拍照识别优化（异步处理、类目对齐）
- [ ] 手动记账优化（智能分摊、语音备注）

### 待办 ⏳
- [ ] 账本创建页面
- [ ] 定位 API 集成
- [ ] 影子成员系统
- [ ] 多账本管理
- [ ] 后端服务搭建
- [ ] 数据库设计
- [ ] 微信登录

---

## 🏗️ 技术栈

### 前端（已确定）
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.3 | UI 框架 |
| TypeScript | 5.8.2 | 类型安全 |
| Vite | 6.2.0 | 构建工具 |
| Tailwind CSS | - | 原子样式 |
| lucide-react | 0.562.0 | 图标库 |
| recharts | 3.6.0 | 图表 |
| @google/genai | 1.34.0 | AI API |

### 后端（待选型）
- **选项 A：** Node.js + Express + PostgreSQL
- **选项 B：** Python + FastAPI + PostgreSQL

### 基础设施
- **部署：** 待定
- **AI/OCR：** Google Gemini API

---

## 🧪 测试状态

| 模块 | 测试用例 | 通过 | 失败 | 状态 |
|------|----------|------|------|------|
| TypeScript 编译 | - | - | 0 | ✅ 通过 |
| 功能测试 | 40+ | - | - | ⏳ 待执行 |

**已知问题：**
- BUG-001: Dashboard 缺少图标导入 ✅ 已修复
- BUG-002: useTripViewModel 缺少类型导入 ✅ 已修复

---

## 📝 开发规范

### Git 提交规范
```
feat:     新功能
fix:      修复
docs:     文档
style:    格式
refactor: 重构
chore:    构建/工具
```

### 代码规范
- TypeScript 严格模式
- 组件使用 PascalCase
- 工具函数使用 camelCase

---

## 🤖 AI 接入指南（新会话快速上手）

如果你是新接入的 AI，请按以下步骤：

### 步骤 1：阅读核心文档（5分钟）
1. 读 **PROJECT.md**（本文件）- 了解项目全貌
2. 读 **doc/project-plan.md** - 了解当前进度
3. 读 **doc/requirements.md** - 了解产品需求

### 步骤 2：查看关键代码（5分钟）
```bash
# 重点文件
components/FabMenu.tsx      # FAB 菜单
components/Inbox.tsx        # 收件箱
hooks/useTripViewModel.ts   # 业务逻辑
data/mockData.ts            # Mock 数据
```

### 步骤 3：确认当前任务
**询问用户：** "我们现在要开发哪个模块？"

**当前建议优先级：**
1. 🔴 执行测试方案（test-plan.md）
2. 🟡 完善 AI 拍照识别流程
3. 🟡 优化手动记账体验
4. 🟢 搭建后端服务

### 重要原则
- ✅ 每次开发前确认："我们正在开发 TripNow 项目，对吗？"
- ✅ 每次重要决策后：在 query/ 目录记录
- ✅ 每次进度更新：同步 project-plan.md
- ✅ 发现问题：立即记录到 bug-tracker.md

---

## 📁 Git 仓库信息

### 仓库地址
- **GitHub：** https://github.com/xiaopengs/TripNow
- **本地路径：** `/Users/ray/.openclaw/workspace/project/TripNow`
- **当前分支：** main

### 认证配置
- **Token：** 已配置（GitHub PAT）
- **推送权限：** ✅ 已验证

### 常用命令
```bash
# 进入项目目录
cd /Users/ray/.openclaw/workspace/project/TripNow

# 查看状态
git status

# 添加并提交
git add -A
git commit -m "type: description"
git push origin main

# 查看日志
git log --oneline -10
```

### 提交规范
```
feat:     新功能（如：feat: 添加 FAB 菜单）
fix:      修复（如：fix: 修复 TypeScript 错误）
docs:     文档（如：docs: 更新 PROJECT.md）
style:    格式（如：style: 调整缩进）
refactor: 重构（如：refactor: 优化 ViewModel）
chore:    构建/工具（如：chore: 更新依赖）
```

---

## 🧪 测试信息

### 测试方案
- **文档位置：** `doc/test-plan.md`
- **用例数量：** 40+ 条
- **覆盖模块：** FAB、Inbox、记账、首页、流水、结算

### 问题追踪
- **文档位置：** `doc/bug-tracker.md`
- **当前状态：**
  | 状态 | 数量 |
  |------|------|
  | 🔴 待修复 | 0 |
  | 🟡 修复中 | 0 |
  | 🟢 已修复 | 2 |
  | ⚪ 已关闭 | 0 |

### 已知问题
| BUG ID | 描述 | 状态 |
|--------|------|------|
| BUG-001 | Dashboard 缺少图标导入 | ✅ 已修复 |
| BUG-002 | useTripViewModel 缺少类型导入 | ✅ 已修复 |

### 测试执行步骤
```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
echo "GEMINI_API_KEY=your_key" > .env

# 3. TypeScript 检查
npx tsc --noEmit

# 4. 启动开发服务器
npm run dev

# 5. 访问测试
http://localhost:3000
```

---

## 📞 项目信息

- **仓库：** https://github.com/xiaopengs/TripNow
- **需求来源：** 飞书文档
- **当前版本：** v0.2（前端功能完善版）
- **最后更新：** 2026-03-21

---

*文档版本：v1.2*  
*更新内容：添加 Git 仓库信息、测试相关信息*
