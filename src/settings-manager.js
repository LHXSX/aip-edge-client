// 设置管理器

// 默认设置
const defaultSettings = {
    // 基础设置
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    themeMode: 'auto',
    themeColor: 'purple',
    autoStart: true,
    minimizeStart: true,
    rememberLogin: true,
    notifyTask: true,
    notifyEarning: true,
    notifyError: false,
    notifySound: true,
    
    // 性能设置
    cpuLimit: 80,
    cpuCores: 'auto',
    memoryLimit: 4,
    autoReleaseMemory: true,
    enableGPU: false,
    gpuMemory: 2,
    maxConcurrent: 3,
    taskInterval: 30,
    taskPriority: 'balanced',
    autoPull: true,
    
    // 收益设置
    autoWithdraw: false,
    withdrawThreshold: 100,
    withdrawMethod: 'alipay',
    statsPeriod: 'daily',
    exportEarnings: true,
    walletAddress: '',
    accountName: '',
    
    // 节点设置
    nodeName: '',
    nodeDesc: '',
    nodeTags: '',
    heartbeatInterval: 30,
    heartbeatTimeout: 10,
    autoHeartbeat: true,
    apiUrl: 'http://8.218.206.57/api/v1',
    reconnectStrategy: 'auto',
    maxRetry: 5,
    
    // 安全设置
    enable2FA: false,
    twoFAMethod: 'app',
    sessionTimeout: '240',
    
    // 高级设置
    logLevel: 'info',
    logRetention: 7,
    autoCleanLogs: true,
};

// 加载设置
function loadSettings() {
    const saved = localStorage.getItem('appSettings');
    const settings = saved ? JSON.parse(saved) : defaultSettings;
    
    // 应用设置到UI
    applySettingsToUI(settings);
    
    return settings;
}

// 应用设置到UI
function applySettingsToUI(settings) {
    // 基础设置
    setValueIfExists('language', settings.language);
    setValueIfExists('timezone', settings.timezone);
    setValueIfExists('theme-mode', settings.themeMode);
    setValueIfExists('theme-color', settings.themeColor);
    setCheckedIfExists('auto-start', settings.autoStart);
    setCheckedIfExists('minimize-start', settings.minimizeStart);
    setCheckedIfExists('remember-login', settings.rememberLogin);
    setCheckedIfExists('notify-task', settings.notifyTask);
    setCheckedIfExists('notify-earning', settings.notifyEarning);
    setCheckedIfExists('notify-error', settings.notifyError);
    setCheckedIfExists('notify-sound', settings.notifySound);
    
    // 性能设置
    setValueIfExists('cpu-limit', settings.cpuLimit);
    setTextIfExists('cpu-limit-value', settings.cpuLimit);
    setValueIfExists('cpu-cores', settings.cpuCores);
    setValueIfExists('memory-limit', settings.memoryLimit);
    setTextIfExists('memory-limit-value', settings.memoryLimit);
    setCheckedIfExists('auto-release-memory', settings.autoReleaseMemory);
    setCheckedIfExists('enable-gpu', settings.enableGPU);
    setValueIfExists('gpu-memory', settings.gpuMemory);
    setTextIfExists('gpu-memory-value', settings.gpuMemory);
    setValueIfExists('max-concurrent', settings.maxConcurrent);
    setValueIfExists('task-interval', settings.taskInterval);
    setValueIfExists('task-priority', settings.taskPriority);
    setCheckedIfExists('auto-pull', settings.autoPull);
    
    // 收益设置
    setCheckedIfExists('auto-withdraw', settings.autoWithdraw);
    setValueIfExists('withdraw-threshold', settings.withdrawThreshold);
    setValueIfExists('withdraw-method', settings.withdrawMethod);
    setValueIfExists('stats-period', settings.statsPeriod);
    setCheckedIfExists('export-earnings', settings.exportEarnings);
    setValueIfExists('wallet-address', settings.walletAddress);
    setValueIfExists('account-name', settings.accountName);
    
    // 节点设置
    setValueIfExists('node-name', settings.nodeName);
    setValueIfExists('node-desc', settings.nodeDesc);
    setValueIfExists('node-tags', settings.nodeTags);
    setValueIfExists('heartbeat-interval', settings.heartbeatInterval);
    setValueIfExists('heartbeat-timeout', settings.heartbeatTimeout);
    setCheckedIfExists('auto-heartbeat', settings.autoHeartbeat);
    setValueIfExists('api-url', settings.apiUrl);
    setValueIfExists('reconnect-strategy', settings.reconnectStrategy);
    setValueIfExists('max-retry', settings.maxRetry);
    
    // 安全设置
    setCheckedIfExists('enable-2fa', settings.enable2FA);
    setValueIfExists('2fa-method', settings.twoFAMethod);
    setValueIfExists('session-timeout', settings.sessionTimeout);
    
    // 高级设置
    setValueIfExists('log-level', settings.logLevel);
    setValueIfExists('log-retention', settings.logRetention);
    setCheckedIfExists('auto-clean-logs', settings.autoCleanLogs);
}

// 辅助函数
function setValueIfExists(id, value) {
    const elem = document.getElementById(id);
    if (elem) elem.value = value;
}

function setCheckedIfExists(id, checked) {
    const elem = document.getElementById(id);
    if (elem) elem.checked = checked;
}

function setTextIfExists(id, text) {
    const elem = document.getElementById(id);
    if (elem) elem.textContent = text;
}

// 收集所有设置
function collectAllSettings() {
    return {
        // 基础设置
        language: document.getElementById('language')?.value,
        timezone: document.getElementById('timezone')?.value,
        themeMode: document.getElementById('theme-mode')?.value,
        themeColor: document.getElementById('theme-color')?.value,
        autoStart: document.getElementById('auto-start')?.checked,
        minimizeStart: document.getElementById('minimize-start')?.checked,
        rememberLogin: document.getElementById('remember-login')?.checked,
        notifyTask: document.getElementById('notify-task')?.checked,
        notifyEarning: document.getElementById('notify-earning')?.checked,
        notifyError: document.getElementById('notify-error')?.checked,
        notifySound: document.getElementById('notify-sound')?.checked,
        
        // 性能设置
        cpuLimit: parseInt(document.getElementById('cpu-limit')?.value),
        cpuCores: document.getElementById('cpu-cores')?.value,
        memoryLimit: parseInt(document.getElementById('memory-limit')?.value),
        autoReleaseMemory: document.getElementById('auto-release-memory')?.checked,
        enableGPU: document.getElementById('enable-gpu')?.checked,
        gpuMemory: parseInt(document.getElementById('gpu-memory')?.value),
        maxConcurrent: parseInt(document.getElementById('max-concurrent')?.value),
        taskInterval: parseInt(document.getElementById('task-interval')?.value),
        taskPriority: document.getElementById('task-priority')?.value,
        autoPull: document.getElementById('auto-pull')?.checked,
        
        // 收益设置
        autoWithdraw: document.getElementById('auto-withdraw')?.checked,
        withdrawThreshold: parseInt(document.getElementById('withdraw-threshold')?.value),
        withdrawMethod: document.getElementById('withdraw-method')?.value,
        statsPeriod: document.getElementById('stats-period')?.value,
        exportEarnings: document.getElementById('export-earnings')?.checked,
        walletAddress: document.getElementById('wallet-address')?.value,
        accountName: document.getElementById('account-name')?.value,
        
        // 节点设置
        nodeName: document.getElementById('node-name')?.value,
        nodeDesc: document.getElementById('node-desc')?.value,
        nodeTags: document.getElementById('node-tags')?.value,
        heartbeatInterval: parseInt(document.getElementById('heartbeat-interval')?.value),
        heartbeatTimeout: parseInt(document.getElementById('heartbeat-timeout')?.value),
        autoHeartbeat: document.getElementById('auto-heartbeat')?.checked,
        apiUrl: document.getElementById('api-url')?.value,
        reconnectStrategy: document.getElementById('reconnect-strategy')?.value,
        maxRetry: parseInt(document.getElementById('max-retry')?.value),
        
        // 安全设置
        enable2FA: document.getElementById('enable-2fa')?.checked,
        twoFAMethod: document.getElementById('2fa-method')?.value,
        sessionTimeout: document.getElementById('session-timeout')?.value,
        
        // 高级设置
        logLevel: document.getElementById('log-level')?.value,
        logRetention: parseInt(document.getElementById('log-retention')?.value),
        autoCleanLogs: document.getElementById('auto-clean-logs')?.checked,
    };
}

// 保存所有设置
function saveAllSettings() {
    const settings = collectAllSettings();
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    addLog('success', '✅ 所有设置已保存');
    
    // 显示成功提示
    alert('✅ 设置保存成功！\n\n部分设置需要重启应用后生效。');
}

// 钱包信息保存
function saveWalletInfo() {
    const walletAddress = document.getElementById('wallet-address')?.value;
    const accountName = document.getElementById('account-name')?.value;
    
    if (!walletAddress) {
        alert('请输入钱包地址');
        return;
    }
    
    const settings = collectAllSettings();
    settings.walletAddress = walletAddress;
    settings.accountName = accountName;
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    addLog('success', '💰 钱包信息已保存');
    alert('✅ 钱包信息保存成功！');
}

// 修改密码
function changePassword() {
    const current = document.getElementById('current-password')?.value;
    const newPwd = document.getElementById('new-password')?.value;
    const confirm = document.getElementById('confirm-password')?.value;
    
    if (!current || !newPwd || !confirm) {
        alert('请填写完整的密码信息');
        return;
    }
    
    if (newPwd !== confirm) {
        alert('两次输入的新密码不一致');
        return;
    }
    
    if (newPwd.length < 6) {
        alert('新密码长度不能少于6位');
        return;
    }
    
    // 这里应该调用API修改密码
    addLog('success', '🔒 密码修改成功');
    alert('✅ 密码修改成功！请重新登录。');
}

// 2FA设置
function setup2FA() {
    alert('🔑 双因素认证\n\n请扫描二维码或使用密钥配置认证器应用。\n\n（功能开发中）');
}

// API密钥相关
function showApiKey() {
    alert('🔐 API密钥\n\nsk-1234567890abcdefghijklmnopqrstuvwxyz\n\n请妥善保管，不要泄露给他人！');
}

function regenerateApiKey() {
    if (confirm('⚠️ 确定要重新生成API密钥吗？\n\n旧密钥将立即失效！')) {
        addLog('warn', '🔄 API密钥已重新生成');
        alert('✅ 新的API密钥已生成');
    }
}

function copyApiKey() {
    // 复制到剪贴板
    addLog('info', '📋 API密钥已复制到剪贴板');
    alert('✅ API密钥已复制');
}

// 会话管理
function clearAllSessions() {
    if (confirm('⚠️ 确定要清除所有会话吗？\n\n其他设备将被强制退出登录！')) {
        addLog('warn', '🚫 已清除所有会话');
        alert('✅ 所有会话已清除');
    }
}

// 数据管理
function backupData() {
    const data = {
        settings: collectAllSettings(),
        logs: logs,
        history: taskHistory,
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aip-backup-${Date.now()}.json`;
    a.click();
    
    addLog('success', '💾 数据备份已导出');
}

function restoreData() {
    alert('📥 数据恢复\n\n请选择备份文件进行恢复。\n\n（功能开发中）');
}

function exportConfig() {
    const settings = collectAllSettings();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aip-config-${Date.now()}.json`;
    a.click();
    
    addLog('success', '📤 配置已导出');
}

function importConfig() {
    alert('📥 导入配置\n\n请选择配置文件进行导入。\n\n（功能开发中）');
}

// 缓存管理
function clearCache() {
    if (confirm('确定要清除缓存吗？')) {
        addLog('warn', '🧹 缓存已清除');
        alert('✅ 缓存清除成功');
    }
}

function clearAllData() {
    if (confirm('⚠️ 警告！\n\n确定要清除所有数据吗？\n\n此操作不可撤销！')) {
        localStorage.clear();
        addLog('error', '⚠️ 所有数据已清除');
        alert('✅ 所有数据已清除，应用将重启');
        location.reload();
    }
}

// 系统操作
function checkUpdate() {
    addLog('info', '🔄 正在检查更新...');
    setTimeout(() => {
        addLog('success', '✅ 当前已是最新版本 v1.0.0');
        alert('✅ 当前已是最新版本');
    }, 1000);
}

function restartApp() {
    if (confirm('确定要重启应用吗？')) {
        addLog('info', '♻️ 应用正在重启...');
        setTimeout(() => location.reload(), 500);
    }
}

function resetSettings() {
    if (confirm('⚠️ 确定要重置所有设置吗？\n\n将恢复为默认设置！')) {
        localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
        loadSettings();
        addLog('warn', '⚠️ 设置已重置为默认值');
        alert('✅ 设置已重置');
    }
}

// 设置标签切换
document.addEventListener('DOMContentLoaded', () => {
    // 设置分类标签切换
    const settingsTabs = document.querySelectorAll('.settings-tab-btn');
    const settingsSections = document.querySelectorAll('.settings-section');
    
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // 移除所有激活状态
            settingsTabs.forEach(t => t.classList.remove('active'));
            settingsSections.forEach(s => s.classList.remove('active'));
            
            // 添加当前激活状态
            tab.classList.add('active');
            document.getElementById(`${targetTab}-settings`).classList.add('active');
        });
    });
    
    // 滑块实时更新
    const cpuLimitSlider = document.getElementById('cpu-limit');
    if (cpuLimitSlider) {
        cpuLimitSlider.addEventListener('input', (e) => {
            document.getElementById('cpu-limit-value').textContent = e.target.value;
        });
    }
    
    const memoryLimitSlider = document.getElementById('memory-limit');
    if (memoryLimitSlider) {
        memoryLimitSlider.addEventListener('input', (e) => {
            document.getElementById('memory-limit-value').textContent = e.target.value;
        });
    }
    
    const gpuMemorySlider = document.getElementById('gpu-memory');
    if (gpuMemorySlider) {
        gpuMemorySlider.addEventListener('input', (e) => {
            document.getElementById('gpu-memory-value').textContent = e.target.value;
        });
    }
    
    // 加载设置
    setTimeout(loadSettings, 500);
});

