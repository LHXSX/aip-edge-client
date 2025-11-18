// 高级功能UI处理器

// 查看审计日志
function viewAuditLogs() {
    const logs = auditService.getAuditLogs();
    
    if (logs.length === 0) {
        alert('暂无审计日志');
        return;
    }
    
    const recent = logs.slice(0, 10);
    const message = `📝 最近10条审计日志\n\n${recent.map(log => 
        `[${new Date(log.timestamp).toLocaleString()}]\n${log.user} - ${log.action}\n${JSON.stringify(log.details)}`
    ).join('\n\n')}`;
    
    alert(message);
}

// 查看缓存统计
function viewCacheStats() {
    const stats = cacheManager.getStats();
    alert(`📊 缓存统计

当前大小：${stats.size} / ${stats.maxSize}
使用率：${stats.usage}
TTL：5分钟
状态：正常`);
}

// 运行性能测试
async function runPerformanceTest() {
    addLog('info', '⚡ 开始性能测试...');
    
    const tests = [
        { name: 'API响应', fn: () => callAPI('/system/status') },
        { name: '缓存读写', fn: () => { cacheManager.set('test', 'data'); cacheManager.get('test'); } },
        { name: '数据压缩', fn: () => compressionService.compressObject({ test: 'data' }) },
    ];
    
    const results = [];
    for (const test of tests) {
        const start = performance.now();
        try {
            await test.fn();
            const duration = performance.now() - start;
            results.push(`✅ ${test.name}: ${duration.toFixed(2)}ms`);
        } catch {
            results.push(`❌ ${test.name}: 失败`);
        }
    }
    
    alert('⚡ 性能测试结果\n\n' + results.join('\n'));
    addLog('success', '✅ 性能测试完成');
}

// 显示AI建议
async function showAISuggestions() {
    const context = {
        type: 'general',
        cpuUsage: 50,
        memoryUsage: 60
    };
    
    const suggestions = await aiAssistant.getSuggestions(context);
    
    if (suggestions.length === 0) {
        alert('暂无优化建议');
        return;
    }
    
    const message = `🤖 AI智能建议\n\n${suggestions.map((s, i) => 
        `${i + 1}. ${s.title}\n   ${s.description}`
    ).join('\n\n')}`;
    
    alert(message);
}

// 查看任务统计
function viewTaskStats() {
    const stats = dataAnalytics.getTaskStats('day');
    
    alert(`📊 今日任务统计

总任务数：${stats.total}
成功任务：${stats.success}
失败任务：${stats.failed}
平均耗时：${stats.avgDuration.toFixed(1)}秒
总收益：¥${stats.totalEarnings.toFixed(4)}`);
}

// 查看收益趋势
function viewEarningsTrend() {
    const trend = dataAnalytics.getEarningsTrend(7);
    
    const message = `📈 最近7天收益趋势\n\n${trend.map(day => 
        `${day.date}: ¥${day.earnings.toFixed(4)} (${day.tasks}个任务)`
    ).join('\n')}`;
    
    alert(message);
}

// 查看任务模板
function viewTaskTemplates() {
    const templates = taskTemplates.getAllTemplates();
    
    const message = `📋 任务模板库\n\n${templates.map((t, i) => 
        `${i + 1}. ${t.name}\n   类型：${t.type}\n   预计耗时：${t.estimatedDuration}秒\n   预计收益：¥${t.estimatedRevenue}`
    ).join('\n\n')}`;
    
    alert(message);
}

// 创建定时任务
function createScheduledTask() {
    const name = prompt('请输入定时任务名称:');
    if (!name) return;
    
    const interval = prompt('请输入执行间隔（分钟）:', '60');
    if (!interval) return;
    
    // 简化的cron表达式
    const cronExpression = `*/${interval} * * * *`;
    
    scheduledTasks.schedule(name, cronExpression, () => {
        addLog('info', `⏰ 定时任务"${name}"执行`);
    });
    
    alert(`✅ 定时任务已创建\n\n名称：${name}\n间隔：每${interval}分钟`);
}

// 监听设置变化
document.addEventListener('DOMContentLoaded', () => {
    // 沙盒隔离
    const sandboxCheckbox = document.getElementById('enable-sandbox');
    if (sandboxCheckbox) {
        sandboxCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                addLog('success', '🔒 沙盒隔离已启用');
            } else {
                addLog('warn', '⚠️ 沙盒隔离已禁用（不建议）');
            }
        });
    }
    
    // 数据加密
    const encryptionCheckbox = document.getElementById('enable-encryption');
    if (encryptionCheckbox) {
        encryptionCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                addLog('success', '🔐 数据加密已启用');
            } else {
                addLog('warn', '⚠️ 数据加密已禁用（不建议）');
            }
        });
    }
    
    // 节能模式
    const powerSavingCheckbox = document.getElementById('enable-power-saving');
    if (powerSavingCheckbox) {
        powerSavingCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                powerSaving.enable();
            } else {
                powerSaving.disable();
            }
        });
    }
    
    // 自动备份
    const autoBackupCheckbox = document.getElementById('enable-auto-backup');
    if (autoBackupCheckbox) {
        autoBackupCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                backupRestore.enableAutoBackup();
            } else {
                backupRestore.disableAutoBackup();
            }
        });
    }
    
    // 健康检查
    const healthCheckCheckbox = document.getElementById('enable-health-check');
    if (healthCheckCheckbox) {
        healthCheckCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                healthCheck.startPeriodicCheck();
                addLog('success', '✅ 健康检查已启用');
            } else {
                healthCheck.stopPeriodicCheck();
                addLog('info', '⏸️ 健康检查已禁用');
            }
        });
    }
});

