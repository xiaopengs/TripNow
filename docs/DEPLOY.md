# TripNow 小程序发布指南

## 📋 两种发布方式

| 方式 | 触发方式 | 适合场景 | 需要配置 |
|------|----------|----------|----------|
| **本地一键发布** | 运行 `deploy.bat` | 开发调试、快速迭代 | 本地私钥 |
| **GitHub Actions** | push 代码 / 手动触发 | 自动化、团队协作 | GitHub Secrets |

---

## 🖥️ 本地一键发布

### 准备工作：获取微信私钥

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入「开发」→「开发管理」→「开发设置」
3. 找到「小程序代码上传密钥」
4. 点击「生成密钥」，下载私钥文件
5. 将私钥文件重命名为 `private.wx86331a99c51be758.key`
6. 放到 `weixin` 目录下

### 一键发布

```bash
cd F:\CreateAI\ClawBuddy\workMain\TripNow\weixin
deploy.bat
```

会显示菜单：
- **[1] 预览版** - 生成二维码，手机扫码预览（推荐开发测试）
- **[2] 上传版** - 上传代码到微信后台，需手动发布审核
- **[3] 构建并打开开发者工具**

### 命令行方式

```bash
cd weixin

# 设置环境变量
set MINIPROGRAM_APPID=wx86331a99c51be758
set MINIPROGRAM_PRIVATE_KEY_PATH=./private.wx86331a99c51be758.key

# 构建并预览
npm run build:weapp && npm run upload:preview

# 构建并上传
npm run build:weapp && npm run upload:upload
```

---

## 🚀 GitHub Actions 自动发布

### 配置 GitHub Secrets

1. 进入仓库：https://github.com/xiaopengs/TripNow/settings/secrets
2. 点击 **New repository secret**，添加：

| Name | Value |
|------|-------|
| `MINIPROGRAM_APPID` | `wx86331a99c51be758` |
| `MINIPROGRAM_PRIVATE_KEY` | 私钥文件的**全部内容**（包括 -----BEGIN RSA PRIVATE KEY----- 和 -----END RSA PRIVATE KEY-----） |

### 触发发布

- **自动发布**：代码 push 到 main 分支自动触发
- **手动触发**：GitHub → Actions → Deploy Mini Program → Run workflow

---

## 🔧 常见问题

### Q1: 私钥文件找不到
确保私钥文件名为 `private.wx86331a99c51be758.key`，放在 `weixin` 目录下。

### Q2: upload 报错 "invalid signature"
1. 确保私钥与 AppID 匹配
2. 确认私钥文件格式正确（以 `-----BEGIN RSA PRIVATE KEY-----` 开头）

### Q3: miniprogram-ci 上传失败
```bash
cd weixin
npm install miniprogram-ci@latest
```

---

## 📚 参考资料

- [微信开发者工具 CLI 文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html)
- [miniprogram-ci npm](https://www.npmjs.com/package/miniprogram-ci)
- [微信开放文档](https://developers.weixin.qq.com/doc/)

---

*最后更新：2026-04-04*
