# 🚀 GitHub自动编译Windows .exe指南

## 📋 快速步骤

### 1️⃣ 创建GitHub仓库

在GitHub上创建新仓库：
- 仓库名：`aip-edge-client`
- 描述：AIP边缘算力客户端
- 公开或私有：都可以

### 2️⃣ 推送代码到GitHub

```bash
cd /Users/pd/ai算力/aip-edge-tauri

# 初始化git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "AIP边缘算力客户端 v1.0.0 - 初始提交"

# 添加远程仓库（替换YOUR_USERNAME为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/aip-edge-client.git

# 推送到GitHub
git push -u origin main
```

### 3️⃣ 创建Release触发编译

在GitHub上：
1. 进入你的仓库
2. 点击"Releases" → "Create a new release"
3. 标签名：`v1.0.0`
4. 标题：`AIP边缘算力客户端 v1.0.0`
5. 点击"Publish release"

### 4️⃣ 自动编译开始

GitHub Actions会自动：
- ✅ 在Windows服务器上编译 → 生成 .exe 和 .msi
- ✅ 在macOS服务器上编译 → 生成 .dmg
- ✅ 在Linux服务器上编译 → 生成 .AppImage 和 .deb

### 5️⃣ 下载编译好的文件

10-20分钟后：
1. 进入仓库的"Actions"标签
2. 查看编译进度
3. 编译完成后，在"Releases"页面下载：
   - Windows: `AIP-Edge-Client-Setup-1.0.0.exe`（安装版）
   - Windows: `AIP-Edge-Client-1.0.0.exe`（便携版）
   - macOS: `AIP-Edge-Client-1.0.0.dmg`
   - Linux: `AIP-Edge-Client-1.0.0.AppImage`

---

## 🎯 或者手动触发编译

访问GitHub仓库的Actions页面：
```
https://github.com/YOUR_USERNAME/aip-edge-client/actions
```

点击"Build Multi-Platform Release" → "Run workflow"

---

## ✅ 文件已准备好

- ✅ `.github/workflows/build-release.yml` - 自动编译配置
- ✅ `src-tauri/` - Tauri配置
- ✅ `src/` - 完整客户端代码
- ✅ `.gitignore` - Git忽略配置

现在只需推送到GitHub即可自动编译！

