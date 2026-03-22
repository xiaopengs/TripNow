# TripNow 微信小程序版

将 TripNow Web 应用改造为微信小程序，充分利用微信生态能力。

---

## 📋 项目信息

- **原项目**：TripNow Web（React + Vite + TypeScript）
- **目标平台**：微信小程序
- **技术方案**：Taro 3.x + React + TypeScript
- **后端方案**：微信云开发（云函数 + 云数据库）

---

## 🎯 核心特性

### 微信生态集成
- 🔐 微信一键登录
- 💰 微信支付结算
- 📤 微信好友/群分享
- 📍 微信位置服务
- 📷 微信相机/相册
- 🔔 微信订阅消息通知

### 保留功能
- 🤖 AI 拍照识别账单
- ✏️ 手动记账
- 👥 影子成员系统
- 💱 多币种支持
- 📊 智能结算
- 📈 统计分析

---

## 🏗️ 技术栈

| 技术 | 用途 |
|------|------|
| Taro 3.x | 小程序跨端框架 |
| React 18 | UI 框架 |
| TypeScript | 类型安全 |
| MobX | 状态管理 |
| Tailwind CSS | 样式系统 |
| 微信云开发 | 后端服务 |

---

## 📁 目录结构

```
weixin/
├── MIGRATION_PLAN.md      # 改造进度清单
├── src/
│   ├── pages/             # 小程序页面
│   ├── components/        # 公共组件
│   ├── hooks/             # 自定义 Hooks
│   ├── services/          # 服务层
│   ├── stores/            # 状态管理
│   └── utils/             # 工具函数
├── cloud/                 # 云开发
│   ├── functions/         # 云函数
│   └── database/          # 数据库
└── assets/                # 静态资源
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd weixin
npm install
```

### 2. 配置环境

复制 `.env.example` 为 `.env`，填写：
- 微信小程序 AppID
- 云开发环境 ID

### 3. 启动开发

```bash
npm run dev:weapp
```

### 4. 导入微信开发者工具

- 打开微信开发者工具
- 选择 `weixin/dist` 目录
- 填入 AppID

---

## 📊 改造进度

详见 [MIGRATION_PLAN.md](./MIGRATION_PLAN.md)

| 阶段 | 进度 |
|------|------|
| Phase 1: 基础架构 | 0% |
| Phase 2: 微信能力 | 0% |
| Phase 3: 页面开发 | 0% |
| Phase 4: 组件迁移 | 0% |
| Phase 5: 后端适配 | 0% |
| Phase 6: 测试发布 | 0% |

---

## 📝 注意事项

1. **API 适配**：小程序使用 `wx.request` 替代 `fetch`
2. **存储适配**：使用 `wx.setStorageSync` 替代 `localStorage`
3. **路由适配**：使用微信小程序路由 API
4. **登录适配**：集成微信登录流程
5. **AI 识别**：通过云函数调用（保护 API Key）

---

## 📚 相关文档

- [原项目文档](../PROJECT.md)
- [改造进度清单](./MIGRATION_PLAN.md)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Taro 文档](https://docs.taro.zone/)

---

*创建时间：2026-03-22*
