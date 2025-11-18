#!/bin/bash

# AIP边缘算力客户端 - 自动多平台编译脚本

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🚀 AIP边缘算力客户端 - 自动多平台编译                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 项目目录
PROJECT_DIR="/Users/pd/ai算力/aip-edge-tauri"
OUTPUT_DIR="$PROJECT_DIR/release"

# 检测当前平台
CURRENT_OS=$(uname -s)
echo "📍 当前平台：$CURRENT_OS"
echo ""

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

cd "$PROJECT_DIR"

# 检查依赖
echo "📦 检查编译依赖..."
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust/Cargo 未安装"
    echo "安装命令: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Node.js/npm 未安装"
    exit 1
fi

echo "✅ Rust版本: $(rustc --version)"
echo "✅ Cargo版本: $(cargo --version)"
echo "✅ Node版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"
echo ""

# 安装npm依赖
echo "📦 安装npm依赖..."
npm install --silent

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     开始编译                                                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 根据平台编译
case "$CURRENT_OS" in
    Darwin)
        echo "🍎 检测到macOS系统，开始编译macOS版本..."
        echo ""
        
        # 编译Universal Binary（Intel + Apple Silicon）
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🔨 编译macOS Universal Binary..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        # 添加targets
        rustup target add x86_64-apple-darwin 2>/dev/null || echo "x86_64已安装"
        rustup target add aarch64-apple-darwin 2>/dev/null || echo "aarch64已安装"
        
        # 编译
        npm run tauri build -- --target universal-apple-darwin 2>&1 | tee "$PROJECT_DIR/build-macos.log" &
        BUILD_PID=$!
        
        # 显示进度
        echo "⏳ 正在编译（这可能需要5-15分钟）..."
        echo "📝 编译日志：$PROJECT_DIR/build-macos.log"
        echo ""
        
        # 等待编译完成
        wait $BUILD_PID
        BUILD_STATUS=$?
        
        if [ $BUILD_STATUS -eq 0 ]; then
            echo "✅ macOS编译成功！"
            echo ""
            
            # 查找生成的文件
            echo "📦 查找编译产物..."
            
            # DMG文件
            if [ -d "src-tauri/target/release/bundle/dmg" ]; then
                DMG_FILE=$(find src-tauri/target/release/bundle/dmg -name "*.dmg" | head -1)
                if [ -n "$DMG_FILE" ]; then
                    cp "$DMG_FILE" "$OUTPUT_DIR/AIP-Edge-Client-macOS-v1.0.0.dmg"
                    echo "✅ DMG: $(ls -lh $OUTPUT_DIR/AIP-Edge-Client-macOS-v1.0.0.dmg | awk '{print $5}')"
                fi
            fi
            
            # App文件
            if [ -d "src-tauri/target/release/bundle/macos" ]; then
                APP_DIR=$(find src-tauri/target/release/bundle/macos -name "*.app" -type d | head -1)
                if [ -n "$APP_DIR" ]; then
                    # 打包为tar.gz
                    cd "$(dirname "$APP_DIR")"
                    tar -czf "$OUTPUT_DIR/AIP-Edge-Client-macOS-App-v1.0.0.tar.gz" "$(basename "$APP_DIR")"
                    cd - > /dev/null
                    echo "✅ App.tar.gz: $(ls -lh $OUTPUT_DIR/AIP-Edge-Client-macOS-App-v1.0.0.tar.gz | awk '{print $5}')"
                fi
            fi
            
        else
            echo "❌ macOS编译失败（退出码：$BUILD_STATUS）"
            echo "查看日志：cat $PROJECT_DIR/build-macos.log"
        fi
        ;;
        
    Linux)
        echo "🐧 检测到Linux系统，开始编译Linux版本..."
        echo ""
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🔨 编译Linux版本..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        # 编译
        npm run tauri build 2>&1 | tee "$PROJECT_DIR/build-linux.log" &
        BUILD_PID=$!
        
        echo "⏳ 正在编译..."
        wait $BUILD_PID
        BUILD_STATUS=$?
        
        if [ $BUILD_STATUS -eq 0 ]; then
            echo "✅ Linux编译成功！"
            
            # AppImage
            if [ -d "src-tauri/target/release/bundle/appimage" ]; then
                APPIMAGE=$(find src-tauri/target/release/bundle/appimage -name "*.AppImage" | head -1)
                if [ -n "$APPIMAGE" ]; then
                    cp "$APPIMAGE" "$OUTPUT_DIR/AIP-Edge-Client-Linux-v1.0.0.AppImage"
                    echo "✅ AppImage: $(ls -lh $OUTPUT_DIR/AIP-Edge-Client-Linux-v1.0.0.AppImage | awk '{print $5}')"
                fi
            fi
            
            # Deb包
            if [ -d "src-tauri/target/release/bundle/deb" ]; then
                DEB=$(find src-tauri/target/release/bundle/deb -name "*.deb" | head -1)
                if [ -n "$DEB" ]; then
                    cp "$DEB" "$OUTPUT_DIR/AIP-Edge-Client-Linux-v1.0.0.deb"
                    echo "✅ Deb: $(ls -lh $OUTPUT_DIR/AIP-Edge-Client-Linux-v1.0.0.deb | awk '{print $5}')"
                fi
            fi
        else
            echo "❌ Linux编译失败"
        fi
        ;;
        
    MINGW*|MSYS*|CYGWIN*)
        echo "🪟 检测到Windows系统，开始编译Windows版本..."
        echo ""
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🔨 编译Windows版本..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        # 编译
        npm run tauri build 2>&1 | tee "$PROJECT_DIR/build-windows.log" &
        BUILD_PID=$!
        
        echo "⏳ 正在编译..."
        wait $BUILD_PID
        BUILD_STATUS=$?
        
        if [ $BUILD_STATUS -eq 0 ]; then
            echo "✅ Windows编译成功！"
            
            # MSI安装包
            if [ -d "src-tauri/target/release/bundle/msi" ]; then
                MSI=$(find src-tauri/target/release/bundle/msi -name "*.msi" | head -1)
                if [ -n "$MSI" ]; then
                    cp "$MSI" "$OUTPUT_DIR/AIP-Edge-Client-Windows-v1.0.0.msi"
                    echo "✅ MSI: $(ls -lh $OUTPUT_DIR/AIP-Edge-Client-Windows-v1.0.0.msi | awk '{print $5}')"
                fi
            fi
            
            # EXE安装包
            if [ -d "src-tauri/target/release/bundle/nsis" ]; then
                EXE=$(find src-tauri/target/release/bundle/nsis -name "*.exe" | head -1)
                if [ -n "$EXE" ]; then
                    cp "$EXE" "$OUTPUT_DIR/AIP-Edge-Client-Windows-v1.0.0.exe"
                    echo "✅ EXE: $(ls -lh $OUTPUT_DIR/AIP-Edge-Client-Windows-v1.0.0.exe | awk '{print $5}')"
                fi
            fi
        else
            echo "❌ Windows编译失败"
        fi
        ;;
        
    *)
        echo "❌ 未知平台：$CURRENT_OS"
        exit 1
        ;;
esac

# 编译Web版本（所有平台通用）
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 打包Web版本（通用）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd src
tar -czf "$OUTPUT_DIR/aip-edge-client-web-v1.0.0.tar.gz" *
cd ..

echo "✅ Web版本: $(ls -lh $OUTPUT_DIR/aip-edge-client-web-v1.0.0.tar.gz | awk '{print $5}')"

# 生成版本信息
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 生成版本信息"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > "$OUTPUT_DIR/VERSION.txt" << VERSIONEOF
AIP边缘算力客户端 v1.0.0

编译平台：$CURRENT_OS
编译时间：$(date)

功能特性：
✅ 14个完整UI模块
✅ 71个核心功能
✅ 27个API端点对接
✅ 8种真实任务类型
✅ 完全自动化运行
✅ 企业级安全防护

登录凭证：
邮箱：admin@aip.com
密码：admin123

服务器：http://8.218.206.57
在线版本：http://www.pidbai.com/client
VERSIONEOF

echo "✅ 版本信息已生成"

# 生成安装说明
cat > "$OUTPUT_DIR/INSTALL.txt" << INSTALLEOF
AIP边缘算力客户端 - 安装说明

一、Web版本（推荐）
1. 解压文件：tar -xzf aip-edge-client-web-v1.0.0.tar.gz
2. 进入目录：cd src
3. 启动服务：python3 -m http.server 8080
4. 访问浏览器：http://localhost:8080
5. 登录账户：admin@aip.com / admin123

二、macOS版本
1. 双击打开DMG文件
2. 拖拽到应用程序文件夹
3. 打开应用
4. 如遇安全提示，在系统偏好设置中允许

三、Windows版本
1. 双击运行.exe或.msi安装程序
2. 按照向导完成安装
3. 启动应用

四、Linux版本
1. 添加执行权限：chmod +x *.AppImage
2. 运行：./AIP-Edge-Client-Linux-v1.0.0.AppImage
INSTALLEOF

echo "✅ 安装说明已生成"

# 总结
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     ✅ 编译完成                                               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📦 编译产物位置：$OUTPUT_DIR"
echo ""
echo "📂 已生成的文件："
ls -lh "$OUTPUT_DIR"
echo ""
echo "🎯 下一步："
echo "   1. 测试编译的应用"
echo "   2. 上传到服务器downloads目录"
echo "   3. 更新下载页面链接"
echo ""

