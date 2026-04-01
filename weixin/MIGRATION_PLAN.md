# TripNow 微信小程序改造方案

## 📋 项目概述

将现有的 TripNow Web 应用（React + Vite）改造为微信小程序，充分利用微信生态能力。

---

## 🎯 改造目标

1. **完整功能迁移** - 保留所有核心功能
2. **微信生态集成** - 利用微信登录、支付、分享等能力
3. **性能优化** - 针对小程序做性能调优
4. **体验升级** - 符合微信小程序设计规范

---

## 🏗️ 技术栈对比

| 维度 | Web 版 (现有) | 微信小程序 |
|------|--------------|-----------|
| 框架 | React 19 | 微信小程序原生 / Taro |
| 语言 | TypeScript | TypeScript |
| 样式 | Tailwind CSS | WXSS / Tailwind 小程序版 |
| 状态管理 | React Hooks | MobX / 微信全局状态 |
| 路由 | React Router | 微信小程序路由 |
| 存储 | LocalStorage | 微信 Storage |
| 网络 | Fetch | wx.request |
| AI | Google Gemini | 微信云开发 / 自建服务 |

---

## 📁 目录结构规划

```
weixin/
├── README.md                    # 改造说明
├── MIGRATION_PLAN.md            # 改造进度清单（本文件）
├── taro.config.js               # Taro 配置
├── package.json
├── tsconfig.json
├── src/
│   ├── app.config.ts            # 小程序全局配置
│   ├── app.tsx                  # 入口
│   ├── app.scss                 # 全局样式
│   ├── index.html
│   │
│   ├── pages/                   # 页面
│   │   ├── index/               # 首页（账本列表）
│   │   ├── ledger/              # 账本详情
│   │   ├── create-ledger/       # 创建账本
│   │   ├── expense/             # 记账
│   │   ├── records/             # 流水记录
│   │   ├── statistics/          # 统计
│   │   ├── settlement/          # 结算
│   │   ├── inbox/               # 收件箱
│   │   ├── members/             # 成员管理
│   │   └── profile/             # 个人中心
│   │
│   ├── components/              # 组件
│   │   ├── Sidebar/             # 侧边栏
│   │   ├── FabMenu/             # FAB 菜单
│   │   ├── ExpenseCard/         # 账单卡片
│   │   ├── MemberAvatar/        # 成员头像
│   │   ├── CurrencyPicker/      # 币种选择器
│   │   ├── DatePicker/          # 日期选择
│   │   └── ...
│   │
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── useUser.ts           # 用户信息
│   │   ├── useLedger.ts         # 账本管理
│   │   ├── useExpenses.ts       # 账单管理
│   │   └── useLocation.ts       # 定位
│   │
│   ├── services/                # 服务层
│   │   ├── api.ts               # API 封装
│   │   ├── auth.ts              # 微信登录
│   │   ├── ai.ts                # AI 识别
│   │   └── payment.ts           # 支付
│   │
│   ├── stores/                  # 状态管理
│   │   ├── userStore.ts
│   │   ├── ledgerStore.ts
│   │   └── expenseStore.ts
│   │
│   ├── utils/                   # 工具函数
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── validators.ts
│   │
│   └── types/                   # 类型定义
│       └── index.ts
│
├── cloud/                       # 微信云开发
│   ├── functions/               # 云函数
│   │   ├── login/               # 登录
│   │   ├── ai-recognize/        # AI 识别
│   │   ├── settlement/          # 结算计算
│   │   └── notify/              # 消息通知
│   └── database/                # 数据库设计
│       └── schema.json
│
└── assets/                      # 静态资源
    ├── images/
    ├── icons/
    └── tabbar/
```

---

## 🔄 功能改造清单

### Phase 1: 基础架构搭建

| 序号 | 任务 | 状态 | 说明 |
|-----|------|------|------|
| 1.1 | 初始化 Taro 项目 | ✅ | 创建小程序项目框架 |
| 1.2 | 配置 TypeScript | ✅ | 类型检查和配置 |
| 1.3 | 配置 Tailwind 小程序版 | ⏸️ | 暂跳过（后续优化） |
| 1.4 | 配置状态管理 (MobX) | ✅ | 全局状态 |
| 1.5 | 配置 ESLint + Prettier | ✅ | 代码规范 |
| 1.6 | 创建基础目录结构 | ✅ | 按规划创建 |

### Phase 2: 微信能力集成

| 序号 | 任务 | 状态 | 说明 |
|-----|------|------|------|
| 2.1 | 微信登录集成 | ⏳ | wx.login + 获取用户信息 |
| 2.2 | 微信分享功能 | ⏳ | 分享给好友/群 |
| 2.3 | 微信扫码功能 | ⏳ | 扫描二维码加入账本 |
| 2.4 | 微信支付集成 | ⏳ | 结算支付 |
| 2.5 | 微信订阅消息 | ⏳ | 结算提醒通知 |
| 2.6 | 微信位置服务 | ⏳ | 获取定位、选择位置 |
| 2.7 | 微信相册/相机 | ⏳ | 拍照记账 |

### Phase 3: 页面开发

| 序号 | 任务 | 状态 | 说明 |
|-----|------|------|------|
| 3.1 | 首页（账本列表）| ⏳ | 展示所有账本 |
| 3.2 | 创建账本页 | ⏳ | 表单+定位+币种 |
| 3.3 | 账本详情页 | ⏳ | Dashboard 迁移 |
| 3.4 | 记账页 | ⏳ | 手动记账+AI识别 |
| 3.5 | 流水记录页 | ⏳ | Records 迁移 |
| 3.6 | 统计页 | ⏳ | Statistics 迁移 |
| 3.7 | 结算页 | ⏳ | Settlement 迁移 |
| 3.8 | 收件箱页 | ⏳ | Inbox 迁移 |
| 3.9 | 成员管理页 | ⏳ | 影子成员系统 |
| 3.10 | 个人中心 | ⏳ | 用户信息+设置 |

### Phase 4: 组件迁移

| 序号 | 任务 | 状态 | 说明 |
|-----|------|------|------|
| 4.1 | Sidebar 侧边栏 | ⏳ | 抽屉式导航 |
| 4.2 | FAB 菜单 | ⏳ | 扇形展开菜单 |
| 4.3 | 账单卡片 | ⏳ | ExpenseCard |
| 4.4 | 成员头像 | ⏳ | MemberAvatar |
| 4.5 | 币种选择器 | ⏳ | CurrencyPicker |
| 4.6 | 日期选择器 | ⏳ | 微信原生 |
| 4.7 | 图表组件 | ⏳ | 使用 echarts-for-weixin |

### Phase 5: 后端适配

| 序号 | 任务 | 状态 | 说明 |
|-----|------|------|------|
| 5.1 | 云开发环境配置 | ⏳ | 微信云开发 |
| 5.2 | 数据库迁移 | ⏳ | 云数据库 |
| 5.3 | 登录云函数 | ⏳ | 微信登录处理 |
| 5.4 | AI 识别云函数 | ⏳ | 图片识别 |
| 5.5 | 结算计算云函数 | ⏳ | 算法迁移 |
| 5.6 | 消息通知云函数 | ⏳ | 订阅消息 |

### Phase 6: 测试与发布

| 序号 | 任务 | 状态 | 说明 |
|-----|------|------|------|
| 6.1 | 单元测试 | ⏳ | Jest |
| 6.2 | 真机测试 | ⏳ | 微信开发者工具 |
| 6.3 | 性能优化 | ⏳ | 包体积、渲染 |
| 6.4 | 提交审核 | ⏳ | 微信小程序审核 |
| 6.5 | 正式发布 | ⏳ | 上线发布 |

---

## 📝 关键改造点

### 1. 登录改造

**Web 版：**
- 无需登录，使用 LocalStorage

**小程序版：**
```typescript
// 微信登录流程
wx.login({
  success: (res) => {
    // 发送 code 到后端换取 openid
    api.post('/auth/login', { code: res.code })
  }
})
```

### 2. 存储改造

**Web 版：**
```typescript
localStorage.setItem('ledgers', JSON.stringify(data))
```

**小程序版：**
```typescript
wx.setStorageSync('ledgers', data)
```

### 3. 路由改造

**Web 版：**
```typescript
navigate('/ledger/123')
```

**小程序版：**
```typescript
wx.navigateTo({ url: '/pages/ledger/index?id=123' })
```

### 4. 网络请求改造

**Web 版：**
```typescript
fetch('/api/ledgers').then(res => res.json())
```

**小程序版：**
```typescript
wx.request({
  url: 'https://api.tripnow.com/ledgers',
  success: (res) => { ... }
})
```

### 5. AI 识别改造

**Web 版：**
- 直接调用 Google Gemini API

**小程序版：**
- 通过云函数调用（保护 API Key）
- 或使用微信 OCR 能力

---

## 🎨 UI 适配要点

### 设计规范
- 遵循微信小程序设计规范
- 适配 iPhone 安全区
- 适配不同屏幕尺寸
- 暗黑模式支持

### 交互适配
- 下拉刷新
- 上拉加载更多
- 左滑删除
- 长按操作

---

## 📊 进度统计

| 阶段 | 任务数 | 已完成 | 完成度 |
|------|--------|--------|--------|
| Phase 1 | 6 | 5 | 83% |
| Phase 2 | 7 | 0 | 0% |
| Phase 3 | 10 | 0 | 0% |
| Phase 4 | 7 | 0 | 0% |
| Phase 5 | 6 | 0 | 0% |
| Phase 6 | 5 | 0 | 0% |
| **总计** | **41** | **5** | **12%** |

---

## 🚀 开发计划

### 第一周
- Phase 1: 基础架构搭建
- Phase 2: 微信登录集成

### 第二周
- Phase 3: 核心页面开发（首页、账本、记账）

### 第三周
- Phase 3: 核心页面开发（流水、统计、结算）
- Phase 4: 组件迁移

### 第四周
- Phase 5: 后端适配
- Phase 6: 测试与发布

---

## 📚 参考文档

- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Taro 文档](https://docs.taro.zone/)
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

---

*创建时间：2026-03-22*
*最后更新：2026-04-02*
