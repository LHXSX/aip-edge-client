#!/bin/bash

# AIP边缘算力客户端 - Web版本编译（无需Rust）

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🌐 AIP边缘算力客户端 - Web版本编译                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="/Users/pd/ai算力/aip-edge-tauri"
OUTPUT_DIR="$PROJECT_DIR/release"

mkdir -p "$OUTPUT_DIR"

cd "$PROJECT_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 1. 打包Web通用版本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd src
tar -czf "$OUTPUT_DIR/aip-edge-client-web-v1.0.0.tar.gz" *
echo "✅ Web版本（通用）: $(ls -lh $OUTPUT_DIR/aip-edge-client-web-v1.0.0.tar.gz | awk '{print $5}')"
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 2. 创建Windows专用包（带批处理启动脚本）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 创建临时目录
TEMP_WIN="$OUTPUT_DIR/temp_windows"
mkdir -p "$TEMP_WIN"
cp -r src/* "$TEMP_WIN/"

# 创建Windows启动脚本
cat > "$TEMP_WIN/START-WINDOWS.bat" << 'BATEOF'
@echo off
echo ╔══════════════════════════════════════════════════════════════╗
echo ║     AIP边缘算力客户端 v1.0.0 - Windows版本                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 正在启动客户端...
echo.

REM 检查Python
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo 使用Python启动...
    start http://localhost:8080
    python -m http.server 8080
) else (
    where python3 >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo 使用Python3启动...
        start http://localhost:8080
        python3 -m http.server 8080
    ) else (
        echo 错误：未安装Python
        echo 请访问 https://www.python.org/downloads/ 下载安装Python
        pause
    )
)
BATEOF

# 创建说明文件
cat > "$TEMP_WIN/README-WINDOWS.txt" << 'READMEEOF'
AIP边缘算力客户端 - Windows版本

安装步骤：
1. 解压所有文件到任意目录
2. 双击运行 START-WINDOWS.bat
3. 浏览器会自动打开 http://localhost:8080
4. 使用 admin@aip.com / admin123 登录

如果双击bat文件没反应：
1. 确保已安装Python（https://www.python.org/downloads/）
2. 或手动在命令行运行：python -m http.server 8080
3. 然后访问 http://localhost:8080

系统要求：
• Windows 10/11
• Python 3.7+（或使用在线版本）
• 2GB RAM
• 网络连接
READMEEOF

cd "$OUTPUT_DIR"
zip -r "AIP-Edge-Client-Windows-v1.0.0.zip" temp_windows/ -q
echo "✅ Windows版本: $(ls -lh AIP-Edge-Client-Windows-v1.0.0.zip | awk '{print $5}')"
rm -rf temp_windows
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 3. 创建macOS专用包（带Shell启动脚本）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TEMP_MAC="$OUTPUT_DIR/temp_macos"
mkdir -p "$TEMP_MAC"
cp -r src/* "$TEMP_MAC/"

# 创建macOS启动脚本
cat > "$TEMP_MAC/START-MACOS.command" << 'SHEOF'
#!/bin/bash
cd "$(dirname "$0")"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🍎 AIP边缘算力客户端 v1.0.0 - macOS版本                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "正在启动客户端..."
echo ""

# 打开浏览器
open http://localhost:8080

# 启动服务器
python3 -m http.server 8080
SHEOF

chmod +x "$TEMP_MAC/START-MACOS.command"

# 创建说明文件
cat > "$TEMP_MAC/README-MACOS.txt" << 'READMEEOF'
AIP边缘算力客户端 - macOS版本

安装步骤：
1. 解压所有文件
2. 双击运行 START-MACOS.command
3. Safari会自动打开 http://localhost:8080
4. 使用 admin@aip.com / admin123 登录

或手动启动：
1. 打开终端
2. cd 到解压目录
3. 运行：python3 -m http.server 8080
4. 访问 http://localhost:8080

系统要求：
• macOS 10.14+
• Python 3（系统自带）
• 2GB RAM
• 网络连接
READMEEOF

cd "$OUTPUT_DIR"
tar -czf "AIP-Edge-Client-macOS-v1.0.0.tar.gz" -C temp_macos .
echo "✅ macOS版本: $(ls -lh AIP-Edge-Client-macOS-v1.0.0.tar.gz | awk '{print $5}')"
rm -rf temp_macos
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 4. 创建Linux专用包（带Shell启动脚本）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TEMP_LINUX="$OUTPUT_DIR/temp_linux"
mkdir -p "$TEMP_LINUX"
cp -r src/* "$TEMP_LINUX/"

# 创建Linux启动脚本
cat > "$TEMP_LINUX/START-LINUX.sh" << 'SHEOF'
#!/bin/bash
cd "$(dirname "$0")"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🐧 AIP边缘算力客户端 v1.0.0 - Linux版本                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "正在启动客户端..."
echo ""

# 尝试打开浏览器
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:8080 &
elif command -v gnome-open > /dev/null; then
    gnome-open http://localhost:8080 &
fi

# 启动服务器
python3 -m http.server 8080
SHEOF

chmod +x "$TEMP_LINUX/START-LINUX.sh"

# 创建说明文件
cat > "$TEMP_LINUX/README-LINUX.txt" << 'READMEEOF'
AIP边缘算力客户端 - Linux版本

安装步骤：
1. 解压文件：tar -xzf AIP-Edge-Client-Linux-v1.0.0.tar.gz
2. 进入目录：cd temp_linux
3. 运行启动脚本：./START-LINUX.sh
4. 浏览器会自动打开 http://localhost:8080
5. 使用 admin@aip.com / admin123 登录

或手动启动：
1. cd 到解压目录
2. python3 -m http.server 8080
3. 访问 http://localhost:8080

系统要求：
• Ubuntu 20.04+ / Debian 10+ / CentOS 8+
• Python 3
• 2GB RAM
• 网络连接
READMEEOF

cd "$OUTPUT_DIR"
tar -czf "AIP-Edge-Client-Linux-v1.0.0.tar.gz" -C temp_linux .
echo "✅ Linux版本: $(ls -lh AIP-Edge-Client-Linux-v1.0.0.tar.gz | awk '{print $5}')"
rm -rf temp_linux
cd ..

# 创建All-in-One包
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 5. 创建All-in-One完整包"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$OUTPUT_DIR"
zip -r "AIP-Edge-Client-AllPlatforms-v1.0.0.zip" *.tar.gz *.zip *.txt -q
echo "✅ All-in-One包: $(ls -lh AIP-Edge-Client-AllPlatforms-v1.0.0.zip | awk '{print $5}')"

# 最终总结
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🎊 所有平台包编译完成！                                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📦 已生成的安装包："
echo ""
ls -lh "$OUTPUT_DIR" | grep -E '\.(tar\.gz|zip)$'
echo ""
echo "📍 输出目录：$OUTPUT_DIR"
echo ""

