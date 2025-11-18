# 🚀 客户端部署指南 - 上传到生产服务器

## 📋 部署准备

### 已准备好的文件
1. **Web客户端包**: `aip-edge-client-web-v1.0.0.tar.gz` (86KB)
2. **源文件目录**: `src/` (所有HTML/CSS/JS文件)
3. **更新后的下载页面**: `frontend/website/client-download.html`
4. **上传脚本**: `upload_commands.sh`

---

## 🔑 方案1：使用SSH密码上传（推荐）

### 步骤1：上传Web包
```bash
scp /Users/pd/ai算力/aip-edge-tauri/aip-edge-client-web-v1.0.0.tar.gz \
    root@8.218.206.57:/var/www/html/downloads/
```
输入服务器root密码后上传

### 步骤2：上传源文件（在线版本）
```bash
rsync -avz --progress \
    /Users/pd/ai算力/aip-edge-tauri/src/ \
    root@8.218.206.57:/var/www/html/client/
```

### 步骤3：上传下载页面
```bash
scp /Users/pd/ai算力/frontend/website/client-download.html \
    root@8.218.206.57:/var/www/html/
```

### 步骤4：设置权限
```bash
ssh root@8.218.206.57
chmod -R 755 /var/www/html/client
chmod -R 755 /var/www/html/downloads
chmod 644 /var/www/html/client-download.html
chown -R www-data:www-data /var/www/html/client
exit
```

---

## 🔑 方案2：使用SFTP上传

### 使用FileZilla或Cyberduck

1. **连接信息**
   - 主机：8.218.206.57
   - 用户名：root
   - 密码：（你的服务器密码）
   - 端口：22

2. **上传文件**
   - 本地：`/Users/pd/ai算力/aip-edge-tauri/aip-edge-client-web-v1.0.0.tar.gz`
   - 远程：`/var/www/html/downloads/`
   
3. **上传源文件目录**
   - 本地：`/Users/pd/ai算力/aip-edge-tauri/src/*`
   - 远程：`/var/www/html/client/`
   
4. **上传下载页面**
   - 本地：`/Users/pd/ai算力/frontend/website/client-download.html`
   - 远程：`/var/www/html/`

---

## 🔑 方案3：在服务器上直接创建

如果无法上传，可以在服务器上直接部署：

### SSH登录服务器
```bash
ssh root@8.218.206.57
```

### 在服务器上创建客户端目录
```bash
# 创建目录
mkdir -p /var/www/html/client
mkdir -p /var/www/html/downloads
cd /var/www/html/client

# 下载客户端源码（如果有Git仓库）
# git clone https://your-repo.git .

# 或手动创建index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>AIP边缘算力客户端</title>
    <meta http-equiv="refresh" content="0;url=http://localhost:8080">
</head>
<body>
    <p>正在跳转到客户端...</p>
    <p>如未自动跳转，请访问: <a href="http://localhost:8080">http://localhost:8080</a></p>
</body>
</html>
EOF

# 设置权限
chmod -R 755 /var/www/html/client
chown -R www-data:www-data /var/www/html/client
```

---

## 🌐 方案4：使用Web面板上传

如果服务器有宝塔面板或cPanel：

1. 登录Web管理面板
2. 进入文件管理器
3. 导航到 `/var/www/html/`
4. 创建 `client` 和 `downloads` 目录
5. 上传文件到对应目录
6. 设置权限为 755

---

## ✅ 上传完成后验证

### 验证步骤

1. **访问在线版本**
   ```
   http://8.218.206.57/client
   ```
   应该能看到客户端登录页面

2. **访问下载页面**
   ```
   http://8.218.206.57/client-download.html
   ```
   应该能看到更新后的下载页面

3. **测试下载**
   ```
   http://8.218.206.57/downloads/aip-edge-client-web-v1.0.0.tar.gz
   ```
   应该能下载86KB的文件

### 如果访问不了

**检查Nginx配置**:
```bash
ssh root@8.218.206.57
nano /etc/nginx/sites-available/default
```

**添加配置**:
```nginx
server {
    listen 80;
    server_name 8.218.206.57;
    root /var/www/html;
    
    location /client {
        alias /var/www/html/client;
        index index.html;
        try_files $uri $uri/ /client/index.html;
    }
    
    location /downloads {
        alias /var/www/html/downloads;
        autoindex on;
    }
}
```

**重启Nginx**:
```bash
nginx -t
systemctl reload nginx
```

---

## 🧪 多平台测试计划

### Web版本测试（立即可测）

#### 桌面浏览器
- [ ] Chrome (Mac) - http://8.218.206.57/client
- [ ] Chrome (Windows) - http://8.218.206.57/client
- [ ] Chrome (Linux) - http://8.218.206.57/client
- [ ] Safari (Mac) - http://8.218.206.57/client
- [ ] Firefox (Mac) - http://8.218.206.57/client
- [ ] Firefox (Windows) - http://8.218.206.57/client
- [ ] Edge (Windows) - http://8.218.206.57/client

#### 移动浏览器
- [ ] Safari (iPhone/iPad)
- [ ] Chrome (Android)
- [ ] 微信内置浏览器
- [ ] UC浏览器

#### 测试项目
- [ ] 登录功能
- [ ] 自动注册节点
- [ ] 自动心跳发送
- [ ] 自动任务拉取
- [ ] 真实任务执行
- [ ] 结果自动提交
- [ ] 收益实时更新
- [ ] 所有14个模块
- [ ] 71个功能
- [ ] 响应式布局

---

## 📊 测试结果记录

### 功能测试清单

```
登录系统          [ ]  admin@aip.com登录
节点注册          [ ]  3秒后自动注册
心跳发送          [ ]  每30秒自动发送
任务拉取          [ ]  每30秒自动拉取
任务执行          [ ]  真实执行8种任务
结果提交          [ ]  自动提交到服务器
收益更新          [ ]  实时显示收益
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
仪表盘            [ ]  数据正常显示
任务流行          [ ]  8个模块正常
收益统计          [ ]  统计数据正确
运行日志          [ ]  日志实时更新
性能监控          [ ]  8个指标正常
任务历史          [ ]  历史记录显示
设置中心          [ ]  56配置可用
钱包              [ ]  余额交易正常
推荐              [ ]  推荐功能正常
诊断              [ ]  诊断工具可用
通知              [ ]  通知中心正常
更新              [ ]  更新系统正常
灵动岛            [ ]  实时状态显示
CSS图表           [ ]  图表清晰无误
```

---

## 🎯 当前状态

### ✅ 已完成
- [x] 客户端开发（14模块+71功能）
- [x] Web版本打包（86KB）
- [x] 下载页面更新
- [x] 上传脚本生成
- [x] 部署文档编写

### 🔄 待完成
- [ ] 上传到生产服务器（需要SSH密码）
- [ ] 配置Nginx（如需要）
- [ ] 多平台浏览器测试
- [ ] 功能完整性测试
- [ ] 性能压力测试

---

## 📝 部署检查清单

### 上传前
- [x] 客户端已打包
- [x] 版本号确认（v1.0.0）
- [x] 文件完整性检查
- [x] 配置文件检查

### 上传中
- [ ] Web包上传到 /downloads
- [ ] 源文件上传到 /client
- [ ] 下载页面上传到 /var/www/html
- [ ] 权限设置正确

### 上传后
- [ ] 访问 http://8.218.206.57/client 正常
- [ ] 访问 http://8.218.206.57/client-download.html 正常
- [ ] 下载功能正常
- [ ] 登录功能正常
- [ ] 自动化服务启动

---

## 🆘 如需帮助

请提供服务器SSH密码，或者：

1. 手动使用FileZilla/Cyberduck上传
2. 使用服务器Web面板上传
3. 提供SSH密钥以便自动上传

