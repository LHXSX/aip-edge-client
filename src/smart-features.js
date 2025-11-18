// 智能功能模块

// ===== 1. AI智能助手 =====

class AIAssistant {
    constructor() {
        this.suggestions = [];
        this.context = [];
    }
    
    // 获取智能建议
    async getSuggestions(context) {
        // 基于上下文生成建议
        const suggestions = [];
        
        // 任务推荐
        if (context.type === 'task') {
            suggestions.push({
                type: 'task',
                title: '推荐高收益任务',
                description: '图像处理任务平均收益较高，建议优先执行',
                action: 'switch_to_image_processing'
            });
        }
        
        // 优化建议
        if (context.cpuUsage > 80) {
            suggestions.push({
                type: 'optimization',
                title: 'CPU使用率过高',
                description: '建议降低并发任务数或启用节能模式',
                action: 'reduce_concurrent_tasks'
            });
        }
        
        // 收益优化
        if (context.type === 'earnings') {
            suggestions.push({
                type: 'earnings',
                title: '收益优化建议',
                description: '推荐好友可获得额外10%佣金',
                action: 'open_referral_page'
            });
        }
        
        return suggestions;
    }
    
    // 异常诊断
    async diagnoseIssue(issue) {
        const diagnoses = {
            'high_cpu': {
                problem: 'CPU使用率过高',
                causes: ['并发任务过多', '后台程序占用', '任务类型不匹配'],
                solutions: ['降低并发数', '关闭其他程序', '调整任务优先级']
            },
            'network_slow': {
                problem: '网络速度慢',
                causes: ['网络拥塞', '服务器负载高', '本地网络问题'],
                solutions: ['切换网络', '等待高峰期过去', '联系网络运营商']
            },
            'task_failed': {
                problem: '任务执行失败',
                causes: ['任务数据损坏', '资源不足', '超时'],
                solutions: ['重试任务', '增加资源', '联系技术支持']
            }
        };
        
        return diagnoses[issue] || {
            problem: '未知问题',
            causes: ['需要进一步分析'],
            solutions: ['查看日志', '运行诊断', '联系客服']
        };
    }
}

const aiAssistant = new AIAssistant();
window.aiAssistant = aiAssistant;

// ===== 2. 快捷键系统 =====

class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.enabled = true;
        this.registerDefaultShortcuts();
    }
    
    // 注册默认快捷键
    registerDefaultShortcuts() {
        this.register('Ctrl+/', () => this.showShortcutsHelp());
        this.register('Ctrl+R', () => location.reload());
        this.register('Ctrl+L', () => this.switchTab('logs'));
        this.register('Ctrl+T', () => this.switchTab('tasks'));
        this.register('Ctrl+E', () => this.switchTab('earnings'));
        this.register('Ctrl+P', () => this.switchTab('performance'));
        this.register('Ctrl+S', () => this.switchTab('settings'));
        this.register('Escape', () => this.closeModal());
    }
    
    // 注册快捷键
    register(combination, callback) {
        this.shortcuts.set(combination, callback);
    }
    
    // 处理按键
    handleKeyPress(event) {
        if (!this.enabled) return;
        
        const key = [];
        if (event.ctrlKey || event.metaKey) key.push('Ctrl');
        if (event.shiftKey) key.push('Shift');
        if (event.altKey) key.push('Alt');
        key.push(event.key);
        
        const combination = key.join('+');
        
        if (this.shortcuts.has(combination)) {
            event.preventDefault();
            this.shortcuts.get(combination)();
        }
    }
    
    // 切换标签
    switchTab(tabName) {
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabBtn) tabBtn.click();
    }
    
    // 显示快捷键帮助
    showShortcutsHelp() {
        alert(`⌨️ 快捷键帮助

Ctrl + / : 显示快捷键帮助
Ctrl + R : 刷新页面
Ctrl + L : 切换到日志页面
Ctrl + T : 切换到任务页面
Ctrl + E : 切换到收益页面
Ctrl + P : 切换到性能监控
Ctrl + S : 切换到设置页面
Escape  : 关闭弹窗`);
    }
    
    // 关闭模态框
    closeModal() {
        // 关闭所有模态框的逻辑
    }
    
    // 启用/禁用快捷键
    toggle(enabled) {
        this.enabled = enabled;
    }
}

const keyboardShortcuts = new KeyboardShortcuts();
window.keyboardShortcuts = keyboardShortcuts;

// 监听键盘事件
document.addEventListener('keydown', (e) => keyboardShortcuts.handleKeyPress(e));

// ===== 3. 全局搜索 =====

class GlobalSearch {
    constructor() {
        this.searchIndex = [];
        this.buildIndex();
    }
    
    // 构建搜索索引
    buildIndex() {
        this.searchIndex = [
            { type: 'page', name: '仪表盘', keywords: ['dashboard', 'home', '首页', '概览'], action: () => this.goToPage('dashboard') },
            { type: 'page', name: '任务流行', keywords: ['task', '任务', '执行'], action: () => this.goToPage('tasks') },
            { type: 'page', name: '收益统计', keywords: ['earnings', '收益', '赚钱'], action: () => this.goToPage('earnings') },
            { type: 'page', name: '性能监控', keywords: ['performance', '性能', '监控'], action: () => this.goToPage('performance') },
            { type: 'page', name: '设置', keywords: ['settings', '设置', '配置'], action: () => this.goToPage('settings') },
            { type: 'feature', name: '节点注册', keywords: ['register', 'node', '注册', '节点'], action: () => this.executeFeature('register') },
            { type: 'feature', name: '清除日志', keywords: ['clear', 'log', '清除', '日志'], action: () => this.executeFeature('clearLogs') },
            { type: 'feature', name: '导出数据', keywords: ['export', '导出', '数据'], action: () => this.executeFeature('export') },
        ];
    }
    
    // 搜索
    search(query) {
        query = query.toLowerCase();
        
        return this.searchIndex.filter(item => {
            return item.name.toLowerCase().includes(query) ||
                   item.keywords.some(keyword => keyword.includes(query));
        });
    }
    
    // 跳转页面
    goToPage(page) {
        const tabBtn = document.querySelector(`[data-tab="${page}"]`);
        if (tabBtn) tabBtn.click();
    }
    
    // 执行功能
    executeFeature(feature) {
        switch(feature) {
            case 'register':
                // 执行节点注册逻辑
                break;
            case 'clearLogs':
                if (window.clearLogs) window.clearLogs();
                break;
            case 'export':
                if (window.backupData) window.backupData();
                break;
        }
    }
}

const globalSearch = new GlobalSearch();
window.globalSearch = globalSearch;

// ===== 4. 数据统计分析 =====

class DataAnalytics {
    constructor() {
        this.metrics = {
            tasks: [],
            earnings: [],
            performance: []
        };
    }
    
    // 记录任务指标
    recordTaskMetric(task) {
        this.metrics.tasks.push({
            id: task.id,
            type: task.type,
            duration: task.duration,
            earnings: task.earnings,
            status: task.status,
            timestamp: Date.now()
        });
        
        // 只保留最近1000条
        if (this.metrics.tasks.length > 1000) {
            this.metrics.tasks = this.metrics.tasks.slice(-1000);
        }
    }
    
    // 获取任务统计
    getTaskStats(period = 'day') {
        const now = Date.now();
        const ranges = {
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000
        };
        
        const range = ranges[period] || ranges.day;
        const filtered = this.metrics.tasks.filter(t => now - t.timestamp < range);
        
        return {
            total: filtered.length,
            success: filtered.filter(t => t.status === 'success').length,
            failed: filtered.filter(t => t.status === 'failed').length,
            avgDuration: filtered.reduce((sum, t) => sum + (t.duration || 0), 0) / filtered.length || 0,
            totalEarnings: filtered.reduce((sum, t) => sum + parseFloat(t.earnings || 0), 0)
        };
    }
    
    // 获取收益趋势
    getEarningsTrend(days = 7) {
        const trend = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const dayStart = date.getTime();
            const dayEnd = dayStart + 24 * 60 * 60 * 1000;
            
            const dayTasks = this.metrics.tasks.filter(t => 
                t.timestamp >= dayStart && t.timestamp < dayEnd
            );
            
            const earnings = dayTasks.reduce((sum, t) => sum + parseFloat(t.earnings || 0), 0);
            
            trend.push({
                date: date.toLocaleDateString(),
                earnings,
                tasks: dayTasks.length
            });
        }
        
        return trend;
    }
}

const dataAnalytics = new DataAnalytics();
window.dataAnalytics = dataAnalytics;

// ===== 5. 通知管理器 =====

class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.requestPermission();
    }
    
    // 请求通知权限
    async requestPermission() {
        if ('Notification' in window) {
            this.permission = await Notification.requestPermission();
        }
    }
    
    // 发送系统通知
    send(title, options = {}) {
        if (this.permission !== 'granted') {
            console.log('通知权限未授予');
            return;
        }
        
        const notification = new Notification(title, {
            icon: '/icon.png',
            badge: '/badge.png',
            ...options
        });
        
        notification.onclick = () => {
            window.focus();
            if (options.action) options.action();
        };
        
        return notification;
    }
    
    // 任务完成通知
    notifyTaskComplete(taskId, earnings) {
        this.send('任务完成', {
            body: `任务 ${taskId} 已完成\n收益: ¥${earnings}`,
            tag: 'task-complete',
            action: () => keyboardShortcuts.switchTab('tasks')
        });
    }
    
    // 收益到账通知
    notifyEarnings(amount) {
        this.send('收益到账', {
            body: `+¥${amount} AIP Token`,
            tag: 'earnings',
            action: () => keyboardShortcuts.switchTab('earnings')
        });
    }
    
    // 警告通知
    notifyWarning(message) {
        this.send('⚠️ 警告', {
            body: message,
            tag: 'warning',
            requireInteraction: true
        });
    }
}

const notificationManager = new NotificationManager();
window.notificationManager = notificationManager;

// ===== 6. 任务模板系统 =====

class TaskTemplateSystem {
    constructor() {
        this.templates = new Map();
        this.loadDefaultTemplates();
    }
    
    // 加载默认模板
    loadDefaultTemplates() {
        const defaults = [
            {
                id: 'image_processing',
                name: '图像处理',
                type: 'image_processing',
                estimatedDuration: 180,
                estimatedRevenue: 0.5,
                requirements: { cpu: 4, memory: 2048 }
            },
            {
                id: 'data_analysis',
                name: '数据分析',
                type: 'data_analysis',
                estimatedDuration: 300,
                estimatedRevenue: 0.8,
                requirements: { cpu: 8, memory: 4096 }
            },
            {
                id: 'ai_inference',
                name: 'AI推理',
                type: 'ai_inference',
                estimatedDuration: 240,
                estimatedRevenue: 1.2,
                requirements: { cpu: 8, memory: 8192, gpu: true }
            }
        ];
        
        defaults.forEach(template => this.templates.set(template.id, template));
    }
    
    // 创建模板
    createTemplate(template) {
        this.templates.set(template.id, template);
        addLog('success', `✅ 模板 "${template.name}" 已创建`);
    }
    
    // 获取模板
    getTemplate(id) {
        return this.templates.get(id);
    }
    
    // 获取所有模板
    getAllTemplates() {
        return Array.from(this.templates.values());
    }
    
    // 从模板创建任务
    createTaskFromTemplate(templateId, customData = {}) {
        const template = this.getTemplate(templateId);
        if (!template) return null;
        
        return {
            ...template,
            ...customData,
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString()
        };
    }
}

const taskTemplates = new TaskTemplateSystem();
window.taskTemplates = taskTemplates;

// ===== 7. 定时任务系统 =====

class ScheduledTasksSystem {
    constructor() {
        this.scheduledTasks = new Map();
    }
    
    // 添加定时任务
    schedule(name, cronExpression, callback) {
        const taskId = `scheduled_${Date.now()}`;
        
        const task = {
            id: taskId,
            name,
            cronExpression,
            callback,
            nextRun: this.calculateNextRun(cronExpression),
            enabled: true
        };
        
        this.scheduledTasks.set(taskId, task);
        this.startTask(taskId);
        
        addLog('success', `⏰ 定时任务 "${name}" 已添加`);
        return taskId;
    }
    
    // 计算下次运行时间（简化版）
    calculateNextRun(cronExpression) {
        // 简化处理，实际应该解析cron表达式
        const now = Date.now();
        return now + 60000; // 1分钟后
    }
    
    // 启动任务
    startTask(taskId) {
        const task = this.scheduledTasks.get(taskId);
        if (!task) return;
        
        const delay = task.nextRun - Date.now();
        
        setTimeout(() => {
            if (task.enabled) {
                try {
                    task.callback();
                    addLog('info', `⏰ 定时任务 "${task.name}" 已执行`);
                } catch (error) {
                    addLog('error', `❌ 定时任务 "${task.name}" 执行失败: ${error.message}`);
                }
                
                // 计算下次运行时间
                task.nextRun = this.calculateNextRun(task.cronExpression);
                this.startTask(taskId);
            }
        }, Math.max(0, delay));
    }
    
    // 停止任务
    stopTask(taskId) {
        const task = this.scheduledTasks.get(taskId);
        if (task) {
            task.enabled = false;
            addLog('info', `⏸️ 定时任务 "${task.name}" 已停止`);
        }
    }
    
    // 删除任务
    removeTask(taskId) {
        this.stopTask(taskId);
        this.scheduledTasks.delete(taskId);
        addLog('info', `🗑️ 定时任务已删除`);
    }
}

const scheduledTasks = new ScheduledTasksSystem();
window.scheduledTasks = scheduledTasks;

// ===== 8. 节能模式 =====

class PowerSavingMode {
    constructor() {
        this.enabled = false;
        this.originalSettings = {};
    }
    
    // 启用节能模式
    enable() {
        if (this.enabled) return;
        
        // 保存原始设置
        this.originalSettings = {
            cpuLimit: 80,
            maxConcurrent: 3,
            heartbeatInterval: 30000,
            taskInterval: 30000
        };
        
        // 应用节能设置
        PRODUCTION_CONFIG.HEARTBEAT_INTERVAL = 60000; // 1分钟
        PRODUCTION_CONFIG.TASK_PULL_INTERVAL = 60000; // 1分钟
        
        this.enabled = true;
        addLog('info', '🌿 节能模式已启用');
        
        // 显示通知
        notificationManager.send('节能模式', {
            body: '已启用节能模式，降低资源消耗'
        });
    }
    
    // 禁用节能模式
    disable() {
        if (!this.enabled) return;
        
        // 恢复原始设置
        if (this.originalSettings.heartbeatInterval) {
            PRODUCTION_CONFIG.HEARTBEAT_INTERVAL = this.originalSettings.heartbeatInterval;
            PRODUCTION_CONFIG.TASK_PULL_INTERVAL = this.originalSettings.taskInterval;
        }
        
        this.enabled = false;
        addLog('info', '⚡ 节能模式已禁用');
    }
    
    // 切换节能模式
    toggle() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }
}

const powerSaving = new PowerSavingMode();
window.powerSaving = powerSaving;

// ===== 9. 网络状态监控 =====

class NetworkMonitor {
    constructor() {
        this.online = navigator.onLine;
        this.speed = null;
        this.latency = null;
        this.setupListeners();
    }
    
    // 设置监听器
    setupListeners() {
        window.addEventListener('online', () => {
            this.online = true;
            addLog('success', '🌐 网络已连接');
            notificationManager.send('网络恢复', { body: '网络连接已恢复' });
        });
        
        window.addEventListener('offline', () => {
            this.online = false;
            addLog('warn', '⚠️ 网络已断开');
            notificationManager.send('网络断开', { body: '网络连接已断开' });
        });
    }
    
    // 测速
    async measureSpeed() {
        const startTime = performance.now();
        
        try {
            await fetch(PRODUCTION_CONFIG.BASE_URL + '/system/status', {
                method: 'HEAD'
            });
            
            this.latency = performance.now() - startTime;
            return this.latency;
        } catch (error) {
            return null;
        }
    }
    
    // 获取网络状态
    getStatus() {
        return {
            online: this.online,
            latency: this.latency,
            speed: this.speed
        };
    }
}

const networkMonitor = new NetworkMonitor();
window.networkMonitor = networkMonitor;

// ===== 10. 备份恢复系统 =====

class BackupRestoreSystem {
    constructor() {
        this.autoBackupEnabled = false;
        this.backupInterval = null;
    }
    
    // 创建完整备份
    createFullBackup() {
        const backup = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            data: {
                settings: collectAllSettings(),
                logs: logs,
                taskHistory: taskHistory || [],
                walletData: walletData,
                referralData: referralData,
                auditLogs: auditService.auditLogs,
                nodeId: localStorage.getItem('nodeId'),
                token: localStorage.getItem('token')
            }
        };
        
        return backup;
    }
    
    // 导出备份
    exportBackup() {
        const backup = this.createFullBackup();
        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aip-backup-${Date.now()}.json`;
        a.click();
        
        addLog('success', '💾 完整备份已导出');
        return backup;
    }
    
    // 启用自动备份
    enableAutoBackup(interval = 86400000) { // 默认24小时
        if (this.autoBackupEnabled) return;
        
        this.backupInterval = setInterval(() => {
            this.exportBackup();
            addLog('info', '💾 自动备份已完成');
        }, interval);
        
        this.autoBackupEnabled = true;
        addLog('success', '✅ 自动备份已启用');
    }
    
    // 禁用自动备份
    disableAutoBackup() {
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
            this.backupInterval = null;
        }
        this.autoBackupEnabled = false;
        addLog('info', '⏸️ 自动备份已禁用');
    }
}

const backupRestore = new BackupRestoreSystem();
window.backupRestore = backupRestore;

// ===== 初始化智能功能 =====

console.log('✨ 智能功能模块已加载');
console.log('• AI助手: ✅');
console.log('• 快捷键系统: ✅');
console.log('• 全局搜索: ✅');
console.log('• 数据分析: ✅');
console.log('• 通知管理: ✅');
console.log('• 任务模板: ✅');
console.log('• 定时任务: ✅');
console.log('• 节能模式: ✅');
console.log('• 网络监控: ✅');
console.log('• 备份恢复: ✅');

