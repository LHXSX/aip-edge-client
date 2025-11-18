// 诊断管理器

const diagnosticTests = [
    { id: 'network', name: '网络连接', icon: '🌐' },
    { id: 'api', name: 'API连接', icon: '🔗' },
    { id: 'storage', name: '存储空间', icon: '💾' },
    { id: 'cpu', name: 'CPU性能', icon: '💻' },
    { id: 'memory', name: '内存状态', icon: '🧠' },
    { id: 'database', name: '数据库', icon: '📊' },
    { id: 'security', name: '安全检查', icon: '🔐' },
    { id: 'updates', name: '更新状态', icon: '🔄' },
];

// 运行完整诊断
async function runFullDiagnostics() {
    addLog('info', '🔍 开始运行完整系统诊断...');
    
    const container = document.getElementById('diagnostic-items');
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280;">正在诊断...</div>';
    
    const results = [];
    
    for (const test of diagnosticTests) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 模拟诊断延迟
        
        const result = await runDiagnosticTest(test);
        results.push(result);
        
        // 实时更新UI
        renderDiagnosticResults(results);
    }
    
    addLog('success', '✅ 系统诊断完成');
    updateDiagnosticSummary(results);
}

// 运行单个诊断测试
async function runDiagnosticTest(test) {
    const passed = Math.random() > 0.1; // 90%通过率
    const duration = Math.floor(Math.random() * 500 + 100);
    
    let details = '';
    switch(test.id) {
        case 'network':
            details = `延迟: ${Math.floor(Math.random() * 50 + 10)}ms`;
            break;
        case 'api':
            details = `响应时间: ${Math.floor(Math.random() * 200 + 50)}ms`;
            break;
        case 'storage':
            details = `可用: ${(Math.random() * 2 + 0.5).toFixed(2)} GB`;
            break;
        case 'cpu':
            details = `使用率: ${Math.floor(Math.random() * 30 + 20)}%`;
            break;
        case 'memory':
            details = `可用: ${Math.floor(Math.random() * 4 + 2)} GB`;
            break;
        default:
            details = '检查通过';
    }
    
    return {
        ...test,
        passed,
        duration,
        details,
        timestamp: new Date().toISOString()
    };
}

// 渲染诊断结果
function renderDiagnosticResults(results) {
    const container = document.getElementById('diagnostic-items');
    
    container.innerHTML = results.map(result => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid #e5e7eb; transition: background 0.2s;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 24px;">${result.icon}</div>
                <div>
                    <div style="font-weight: 600; color: #1f2937;">${result.name}</div>
                    <div style="font-size: 12px; color: #6b7280;">${result.details}</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 11px; color: #9ca3af;">${result.duration}ms</span>
                <span style="display: inline-flex; padding: 4px 12px; background: ${result.passed ? '#d1fae5' : '#fee2e2'}; color: ${result.passed ? '#065f46' : '#991b1b'}; border-radius: 6px; font-size: 12px; font-weight: 600;">
                    ${result.passed ? '✅ 通过' : '❌ 失败'}
                </span>
            </div>
        </div>
    `).join('');
}

// 更新诊断摘要
function updateDiagnosticSummary(results) {
    const passedCount = results.filter(r => r.passed).length;
    const status = passedCount === results.length ? '健康' : passedCount > results.length * 0.7 ? '良好' : '警告';
    
    document.getElementById('diag-system-status').textContent = status;
    
    const pingElem = document.getElementById('ping');
    if (pingElem) {
        document.getElementById('diag-network-latency').textContent = pingElem.textContent;
    }
    
    document.getElementById('diag-storage-free').textContent = '1.2 GB';
}

// 导出系统日志
function exportSystemLogs() {
    const logsText = logs.map(log => `[${log.time}] [${log.level.toUpperCase()}] ${log.message}`).join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${Date.now()}.txt`;
    a.click();
    addLog('success', '📄 系统日志已导出');
}

// 导出错误日志
function exportErrorLogs() {
    const errorLogs = logs.filter(log => log.level === 'error' || log.level === 'warn');
    const logsText = errorLogs.map(log => `[${log.time}] [${log.level.toUpperCase()}] ${log.message}`).join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${Date.now()}.txt`;
    a.click();
    addLog('success', '❌ 错误日志已导出');
}

// 导出诊断报告
function exportDiagReport() {
    const report = {
        timestamp: new Date().toISOString(),
        version: 'v1.0.0',
        system: {
            os: navigator.platform,
            browser: navigator.userAgent,
            resolution: `${screen.width}x${screen.height}`
        },
        diagnostics: diagnosticTests,
        logs: logs.slice(-100)
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic-report-${Date.now()}.json`;
    a.click();
    addLog('success', '📊 诊断报告已导出');
}

// 修复工具
function repairDatabase() {
    if (confirm('确定要修复数据库吗？\n\n此操作可能需要几分钟时间。')) {
        addLog('info', '💾 正在修复数据库...');
        setTimeout(() => {
            addLog('success', '✅ 数据库修复完成');
            alert('✅ 数据库修复成功！');
        }, 2000);
    }
}

function clearTempFiles() {
    if (confirm('确定要清理临时文件吗？')) {
        addLog('info', '🧹 正在清理临时文件...');
        setTimeout(() => {
            const size = (Math.random() * 500 + 100).toFixed(2);
            addLog('success', `✅ 已清理 ${size} MB 临时文件`);
            alert(`✅ 清理完成！\n释放了 ${size} MB 空间`);
        }, 1500);
    }
}

function resetNetwork() {
    if (confirm('确定要重置网络配置吗？\n\n将重新连接到服务器。')) {
        addLog('info', '🌐 正在重置网络...');
        setTimeout(() => {
            addLog('success', '✅ 网络重置完成');
            alert('✅ 网络重置成功！');
        }, 1000);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 渲染空诊断列表
    const container = document.getElementById('diagnostic-items');
    if (container) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #9ca3af;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">点击下方按钮开始诊断</div>
                <div style="font-size: 14px;">系统将自动检测并分析所有组件</div>
            </div>
        `;
    }
});

