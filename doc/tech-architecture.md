# TripNow 技术架构分析

**分析日期：** 2026-03-21  
**项目版本：** v0.1（MVP阶段）

---

## 📊 架构概览

TripNow 采用 **纯前端单页应用（SPA）** 架构，当前无后端服务，所有数据存储在内存中。

```
┌─────────────────────────────────────────────────────────────┐
│                     前端层 (Frontend)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   React 19   │  │  TypeScript  │  │   Vite 6     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  lucide-react│  │  recharts    │  │ @google/genai│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI 服务层 (AI Services)                    │
│              Google Gemini API (gemini-3-flash)              │
│         - OCR 图片识别        - 语音文本解析                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ 技术栈详解

### 1. 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.3 | UI 框架（最新版） |
| TypeScript | 5.8.2 | 类型安全 |
| Vite | 6.2.0 | 构建工具 |

**React 19 特性使用：**
- 使用 `react-jsx` 转换（无需引入 React）
- 函数组件 + Hooks 架构
- 状态管理使用自定义 Hooks（useTripViewModel）

### 2. UI 组件库

| 库 | 用途 |
|----|------|
| lucide-react | 图标库（Home, List, Plus 等） |
| recharts | 数据可视化（统计图表） |
| Tailwind CSS | 样式（通过 className 内联） |

**样式特点：**
- 使用 Tailwind 原子类（如 `bg-orange-500`, `rounded-full`）
- 自定义阴影和动画效果（如 `shadow-[0_12px_24px_rgba(249,115,22,0.4)]`）
- 响应式设计（`max-w-md mx-auto` 移动端优先）

### 3. AI 服务集成

| 服务 | 模型 | 功能 |
|------|------|------|
| Google GenAI | gemini-3-flash-preview | OCR + 语音解析 |

**API 调用方式：**
```typescript
// 图片识别
parseExpenseFromImage(base64Image) -> {title, amount, category, location}

// 语音解析
parseExpenseFromVoice(transcript) -> {title, amount, category}
```

**认证方式：**
- 通过环境变量 `GEMINI_API_KEY` 注入
- Vite 配置中通过 `define` 注入 `process.env.API_KEY`

---

## 📁 代码结构分析

### 目录组织

```
TripNow/
├── App.tsx                    # 根组件（路由+布局）
├── components/                # UI 组件
│   ├── Dashboard.tsx          # 首页仪表盘
│   ├── Records.tsx            # 流水记录
│   ├── Statistics.tsx         # 统计图表
│   ├── Settlement.tsx         # 结算中心
│   ├── AddExpenseModal.tsx    # 添加支出弹窗
│   └── ...
├── hooks/                     # 自定义 Hooks
│   └── useTripViewModel.ts    # 业务逻辑集中管理
├── services/                  # 服务层
│   └── geminiService.ts       # Google AI API 封装
├── types.ts                   # TypeScript 类型定义
└── ...
```

### 架构模式

**当前模式：MVVM（Model-View-ViewModel）**

```
View (组件)  <--->  ViewModel (useTripViewModel)  <--->  Model (内存数据)
     │                        │
     └────── 用户交互 ────────┘
```

**ViewModel 职责：**
- 管理应用状态（currentTrip, expenses, members）
- 提供计算属性（totalSpent, myPayable, settlementPlan）
- 封装业务方法（addExpense, addWalletTransaction）

---

## ⚙️ 构建配置

### Vite 配置（vite.config.ts）

```typescript
{
  server: {
    port: 3000,
    host: '0.0.0.0',      // 允许局域网访问
  },
  plugins: [react()],
  define: {
    // 环境变量注入
    'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),  // 路径别名
    }
  }
}
```

### TypeScript 配置（tsconfig.json）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "jsx": "react-jsx",           // React 19 JSX 转换
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./*"]             // 支持 @/components 导入
    }
  }
}
```

---

## 🔧 编译说明

### 开发环境

```bash
# 1. 进入项目目录
cd /Users/ray/.openclaw/workspace/project/TripNow

# 2. 安装依赖（如未安装）
npm install

# 3. 配置环境变量
echo "GEMINI_API_KEY=your_api_key" > .env

# 4. 启动开发服务器
npm run dev

# 5. 访问地址
http://localhost:3000
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

**构建输出：**
- 输出目录：`dist/`
- 包含：HTML + JS + CSS 静态文件
- 可部署到：Vercel / Netlify / GitHub Pages

---

## ⚠️ 当前架构限制

### 1. 数据持久化
- ❌ 无后端数据库
- ❌ 无本地存储（LocalStorage/IndexedDB）
- ⚠️ 刷新页面数据丢失

### 2. 用户系统
- ❌ 无用户认证
- ❌ 无多设备同步
- ⚠️ 当前使用 mock 数据

### 3. 后端服务
- ❌ 无 API 服务器
- ❌ 无数据库
- ⚠️ 仅依赖 Google AI 前端调用

---

## 🚀 后续架构演进建议

### 阶段 1：本地持久化（短期）
- 添加 LocalStorage 存储
- 支持数据导入/导出

### 阶段 2：后端服务（中期）
- 搭建 Node.js/Python 后端
- 数据库选型：PostgreSQL / MongoDB
- 用户认证：JWT / OAuth

### 阶段 3：云服务（长期）
- 部署到云服务器
- 多设备实时同步
- 微信登录集成

---

## 📝 关键文件说明

| 文件 | 职责 | 修改频率 |
|------|------|----------|
| App.tsx | 路由控制、全局状态 | 中 |
| hooks/useTripViewModel.ts | 核心业务逻辑 | 高 |
| services/geminiService.ts | AI API 封装 | 低 |
| components/Dashboard.tsx | 首页 UI | 高 |
| types.ts | 类型定义 | 中 |

---

## ✅ 编译检查清单

- [ ] Node.js 版本 >= 18
- [ ] 已安装依赖 `npm install`
- [ ] 已配置 `.env` 文件（GEMINI_API_KEY）
- [ ] 端口 3000 未被占用
- [ ] 浏览器支持 ES2022

---

*文档生成：AI Assistant*  
*关联文件：PROJECT.md, doc/requirements.md*
