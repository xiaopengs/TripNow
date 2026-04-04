# TripNow 小程序本地调试与发布指南

## 📋 概述

本文档介绍 TripNow 微信小程序的本地调试和发布流程。

---

## 🧪 一、本地调试

### 方式一：微信开发者工具（推荐）

#### 1. 安装微信开发者工具

下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/

#### 2. 构建 Taro 项目

```bash
cd F:\CreateAI\ClawBuddy\workMain\TripNow\weixin

# 安装依赖
npm install

# 构建微信小程序
npm run build:weapp
```

构建产物会输出到 `dist` 目录。

#### 3. 打开项目

1. 打开微信开发者工具
2. 点击「项目」→「导入项目」
3. 选择 `dist` 目录
4. 填入 AppID（如果没有，使用测试号：https://mp.weixin.qq.com/）

#### 4. 开启服务端口

在开发者工具中：**设置 → 安全设置 → 开启服务端口**

---

### 方式二：命令行 CLI（自动化）

#### 1. 查找 CLI 路径

Windows 默认路径：
```
C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat
```

或者：
```
C:\Users\<用户名>\AppData\Local\微信web开发者工具\<版本号>\cli.bat
```

#### 2. 常用命令

```bash
# 打开开发者工具（不指定项目）
cli.bat open

# 打开指定项目
cli.bat open --project "F:\CreateAI\ClawBuddy\workMain\TripNow\weixin\dist"

# 预览（生成二维码）
cli.bat preview --project "F:\CreateAI\ClawBuddy\workMain\TripNow\weixin\dist"

# 上传代码（需要管理员权限）
cli.bat upload --project "F:\CreateAI\ClawBuddy\workMain\TripNow\weixin\dist" -v 1.0.0 -d "版本描述"
```

#### 3. 配置 CLI 快捷命令

在项目根目录创建 `deploy.bat`：

```batch
@echo off
set WECHAT_CLI=C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat
set PROJECT_DIR=F:\CreateAI\ClawBuddy\workMain\TripNow\weixin\dist

echo 正在构建项目...
cd /d F:\CreateAI\ClawBuddy\workMain\TripNow\weixin
call npm run build:weapp

echo 构建完成，正在打开微信开发者工具...
call "%WECHAT_CLI%" open --project "%PROJECT_DIR%"
```

---

## 🚀 二、一键发布

### 方案一：本地一键上传

#### 1. 安装 miniprogram-ci

```bash
cd F:\CreateAI\ClawBuddy\workMain\TripNow\weixin
npm install miniprogram-ci --save-dev
```

#### 2. 获取微信公众平台密钥

1. 登录 https://mp.weixin.qq.com/
2. 进入「开发」→「开发管理」→「开发设置」
3. 找到「小程序代码上传密钥」
4. 点击「生成密钥」，下载私钥文件

#### 3. 配置环境变量

```bash
# 设置小程序 AppID
set MINIPROGRAM_APPID=your_appid

# 私钥文件路径
set MINIPROGRAM_PRIVATE_KEY_PATH=F:\CreateAI\ClawBuddy\workMain\TripNow\weixin\private.your_appid.key
```

#### 4. 创建上传脚本

`scripts/upload.js`:

```javascript
const path = require('path');
const program = require('commander');
const Ci = require('miniprogram-ci');

async function upload() {
  const appid = process.env.MINIPROGRAM_APPID || 'your_appid';
  const privateKeyPath = process.env.MINIPROGRAM_PRIVATE_KEY_PATH || './private.key';

  const project = new Ci.Project({
    appid,
    type: 'miniProgram',
    projectPath: path.resolve(__dirname, '../dist'),
    privateKeyPath,
    ignores: ['node_modules/**/*'],
  });

  const uploadResult = await Ci.upload({
    project,
    version: process.argv.includes('--preview') ? '0.0.0' : '1.0.0',
    desc: process.argv.includes('--preview')
      ? '体验版自动上传'
      : '正式版上传',
    setting: {
      es6: true,
      minify: true,
    },
    onProgressUpdate: console.log,
  });

  console.log('上传成功:', uploadResult);
}

upload().catch(console.error);
```

#### 5. 一键发布命令

在 `package.json` 中添加：

```json
{
  "scripts": {
    "upload": "node scripts/upload.js",
    "upload:preview": "node scripts/upload.js --preview"
  }
}
```

#### 6. 执行发布

```bash
# 上传正式版
npm run upload

# 上传体验版
npm run upload:preview
```

---

### 方案二：GitHub Actions 自动发布（推荐）

#### 1. 创建密钥

在项目根目录创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy Mini Program

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd weixin
          npm install

      - name: Build
        run: |
          cd weixin
          npm run build:weapp

      - name: Upload
        env:
          MINIPROGRAM_APPID: ${{ secrets.MINIPROGRAM_APPID }}
          MINIPROGRAM_PRIVATE_KEY: ${{ secrets.MINIPROGRAM_PRIVATE_KEY }}
        run: |
          cd weixin
          echo "$MINIPROGRAM_PRIVATE_KEY" > private.key
          chmod 400 private.key
          npm run upload

      - name: Create Release QR Code
        if: github.event_name == 'workflow_dispatch'
        run: |
          echo "上传成功！请登录微信公众平台发布体验版或提交审核"
```

#### 2. 配置 GitHub Secrets

在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：

| Secret 名称 | 说明 |
|-------------|------|
| `MINIPROGRAM_APPID` | 小程序 AppID |
| `MINIPROGRAM_PRIVATE_KEY` | 私钥文件内容（复制整个文件内容） |

#### 3. 触发发布

- **自动发布**：代码 push 到 main 分支自动触发
- **手动发布**：GitHub Actions → Manual Workflow → Run workflow

---

## 🔧 三、常见问题

### Q1: CLI 命令找不到

**解决方案：**
```batch
# 查找 CLI 路径
where cli.bat

# 如果找不到，手动设置路径
set WECHAT_DEV_TOOLS=C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat
```

### Q2: upload 报错 "invalid signature"

**解决方案：**
1. 确保私钥与 AppID 匹配
2. 确认私钥文件格式正确（以 `-----BEGIN RSA PRIVATE KEY-----` 开头）

### Q3: miniprogram-ci 上传失败

**解决方案：**
```bash
# 检查版本
npm list miniprogram-ci

# 升级到最新版本
npm install miniprogram-ci@latest
```

### Q4: 端口被占用

**解决方案：**
```batch
# 指定端口
cli.bat open --port 9420
```

### Q5: 上传成功但体验版没有更新

**解决方案：**
1. 登录微信公众平台
2. 进入「管理」→「版本管理」
3. 确保体验版是最新上传的版本

### Q6: GitHub Actions 私有密钥写入失败

**解决方案：**
确保私钥内容正确复制，包括 `-----BEGIN RSA PRIVATE KEY-----` 和 `-----END RSA PRIVATE KEY-----`

---

## 📊 四、发布流程图

```
┌─────────────────────────────────────────────────────────────┐
│                        开发调试                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │ 编写代码     │───→│ 构建项目    │───→│ 开发者工具  │    │
│  └─────────────┘    └─────────────┘    │ 预览/调试   │    │
│                                         └─────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        一键发布                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │ npm run     │───→│ miniprogram │───→│ 微信公众平台│    │
│  │ upload      │    │ -ci 上传     │    │ 审核/发布   │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 五、参考资料

- [微信开发者工具 CLI 文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html)
- [miniprogram-ci npm](https://www.npmjs.com/package/miniprogram-ci)
- [微信开放文档](https://developers.weixin.qq.com/doc/)

---

*最后更新：2026-04-04*
