// 更新管理器

let updateCheckInProgress = false;

// 检查更新
async function checkForUpdates() {
    if (updateCheckInProgress) return;
    
    updateCheckInProgress = true;
    addLog('info', '🔍 正在检查更新...');
    
    // 更新检查时间
    const now = new Date();
    document.getElementById('update-check-time').textContent = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    
    // 模拟检查延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90%概率已是最新
    const hasUpdate = Math.random() > 0.9;
    
    if (hasUpdate) {
        const newVersion = 'v1.1.0';
        document.getElementById('update-status').textContent = '发现新版本';
        document.getElementById('update-status').style.color = '#f59e0b';
        
        addLog('success', `✅ 发现新版本 ${newVersion}`);
        
        if (confirm(`发现新版本 ${newVersion}\n\n是否立即下载并更新？`)) {
            downloadUpdate(newVersion);
        }
    } else {
        document.getElementById('update-status').textContent = '已是最新';
        document.getElementById('update-status').style.color = '#10b981';
        addLog('success', '✅ 当前已是最新版本');
        alert('✅ 当前已是最新版本');
    }
    
    updateCheckInProgress = false;
}

// 下载更新
async function downloadUpdate(version) {
    addLog('info', `📥 正在下载 ${version}...`);
    
    // 模拟下载进度
    for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        addLog('info', `📥 下载进度: ${i}%`);
    }
    
    addLog('success', '✅ 下载完成');
    
    if (confirm('更新下载完成\n\n是否立即安装？\n（需要重启应用）')) {
        installUpdate(version);
    }
}

// 安装更新
function installUpdate(version) {
    addLog('info', '⚙️ 正在安装更新...');
    
    setTimeout(() => {
        addLog('success', '✅ 更新安装完成');
        alert(`✅ 更新安装成功！\n\n将在重启后生效。`);
        
        if (confirm('是否立即重启应用？')) {
            addLog('info', '♻️ 应用正在重启...');
            setTimeout(() => location.reload(), 1000);
        }
    }, 2000);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 设置更新频道监听
    const channelSelect = document.getElementById('update-channel');
    if (channelSelect) {
        channelSelect.addEventListener('change', (e) => {
            addLog('info', `🎯 更新频道切换为: ${e.target.options[e.target.selectedIndex].text}`);
        });
    }
});

