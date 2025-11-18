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

