#!/bin/bash

# AIP边缘算力客户端 - 上传到生产服务器脚本

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     📤 上传客户端到生产服务器                                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 配置
SERVER="8.218.206.57"
USER="root"
DOWNLOAD_DIR="/var/www/html/downloads"
CLIENT_DIR="/var/www/html/client"
LOCAL_WEB_PACKAGE="/Users/pd/ai算力/aip-edge-tauri/aip-edge-client-web-v1.0.0.tar.gz"
LOCAL_SRC_DIR="/Users/pd/ai算力/aip-edge-tauri/src"

# 检查文件是否存在
if [ ! -f "$LOCAL_WEB_PACKAGE" ]; then
    echo "❌ Web包不存在，正在创建..."
    cd /Users/pd/ai算力/aip-edge-tauri/src
    tar -czf "$LOCAL_WEB_PACKAGE" *
    echo "✅ Web包已创建"
fi

echo "📦 准备上传文件："
echo "   • aip-edge-client-web-v1.0.0.tar.gz ($(ls -lh $LOCAL_WEB_PACKAGE | awk '{print $5}'))"
echo ""

# 方法1：上传到downloads目录（供下载）
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 方法1：上传到 downloads 目录（供下载）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "执行命令："
echo "scp $LOCAL_WEB_PACKAGE $USER@$SERVER:$DOWNLOAD_DIR/"
echo ""
echo "手动执行："
echo "scp /Users/pd/ai算力/aip-edge-tauri/aip-edge-client-web-v1.0.0.tar.gz root@8.218.206.57:/var/www/html/downloads/"
echo ""

# 方法2：部署到client目录（在线访问）
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 方法2：部署到 /client 目录（在线访问）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "SSH到服务器执行："
echo ""
echo "ssh root@8.218.206.57 << 'ENDSSH'"
echo "# 创建client目录"
echo "mkdir -p /var/www/html/client"
echo "mkdir -p /var/www/html/downloads"
echo ""
echo "# 设置权限"
echo "chmod 755 /var/www/html/client"
echo "chmod 755 /var/www/html/downloads"
echo "ENDSSH"
echo ""

# 方法3：使用rsync同步整个src目录
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 方法3：使用rsync同步（推荐）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "rsync -avz --progress $LOCAL_SRC_DIR/ $USER@$SERVER:$CLIENT_DIR/"
echo ""

# 生成上传命令文件
cat > /Users/pd/ai算力/aip-edge-tauri/upload_commands.sh << 'CMDEOF'
#!/bin/bash

# 快速上传命令

echo "🚀 开始上传客户端到生产服务器..."

# 1. 上传Web包到downloads目录
echo "📤 上传Web包..."
scp /Users/pd/ai算力/aip-edge-tauri/aip-edge-client-web-v1.0.0.tar.gz root@8.218.206.57:/var/www/html/downloads/

# 2. 上传源文件到client目录
echo "📤 上传源文件..."
rsync -avz --progress /Users/pd/ai算力/aip-edge-tauri/src/ root@8.218.206.57:/var/www/html/client/

# 3. 在服务器上设置权限
echo "🔧 设置权限..."
ssh root@8.218.206.57 << 'ENDSSH'
chmod -R 755 /var/www/html/client
chmod -R 755 /var/www/html/downloads
chown -R www-data:www-data /var/www/html/client
chown -R www-data:www-data /var/www/html/downloads
ENDSSH

echo "✅ 上传完成！"
echo ""
echo "🌐 访问地址："
echo "   • 在线版本: http://8.218.206.57/client"
echo "   • 下载页面: http://8.218.206.57/client-download.html"
echo ""

CMDEOF

chmod +x /Users/pd/ai算力/aip-edge-tauri/upload_commands.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 上传脚本已生成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 手动上传方法："
echo ""
echo "方法1 - 执行自动上传脚本："
echo "   ./upload_commands.sh"
echo ""
echo "方法2 - 手动上传Web包："
echo "   scp /Users/pd/ai算力/aip-edge-tauri/aip-edge-client-web-v1.0.0.tar.gz root@8.218.206.57:/var/www/html/downloads/"
echo ""
echo "方法3 - 手动同步源文件："
echo "   rsync -avz /Users/pd/ai算力/aip-edge-tauri/src/ root@8.218.206.57:/var/www/html/client/"
echo ""
echo "🌐 上传后访问地址："
echo "   • http://8.218.206.57/client"
echo "   • http://8.218.206.57/client-download.html"
echo ""

