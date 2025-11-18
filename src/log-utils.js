// 日志工具函数

function getLogStyle(level) {
    const styles = {
        'INFO': {
            color: '#3b82f6',      // 蓝色
            bg: '#dbeafe',         // 浅蓝背景
            shadow: 'rgba(59, 130, 246, 0.15)',
            icon: 'ℹ️',
            label: '信息'
        },
        'SUCCESS': {
            color: '#10b981',      // 绿色
            bg: '#d1fae5',         // 浅绿背景
            shadow: 'rgba(16, 185, 129, 0.15)',
            icon: '✅',
            label: '成功'
        },
        'WARN': {
            color: '#f59e0b',      // 橙色
            bg: '#fef3c7',         // 浅橙背景
            shadow: 'rgba(245, 158, 11, 0.15)',
            icon: '⚠️',
            label: '警告'
        },
        'ERROR': {
            color: '#ef4444',      // 红色
            bg: '#fee2e2',         // 浅红背景
            shadow: 'rgba(239, 68, 68, 0.15)',
            icon: '❌',
            label: '错误'
        },
        'DEBUG': {
            color: '#8b5cf6',      // 紫色
            bg: '#ede9fe',         // 浅紫背景
            shadow: 'rgba(139, 92, 246, 0.15)',
            icon: '🔧',
            label: '调试'
        }
    };
    
    return styles[level] || styles['INFO'];
}

window.filterLogs = function() {
    const levelFilter = document.getElementById('log-level')?.value || 'ALL';
    const searchText = document.getElementById('log-search')?.value.toLowerCase() || '';
    
    let filteredLogs = logs.slice();
    
    // 级别筛选
    if (levelFilter !== 'ALL') {
        filteredLogs = filteredLogs.filter(log => log.level === levelFilter);
    }
    
    // 搜索筛选
    if (searchText) {
        filteredLogs = filteredLogs.filter(log => 
            log.message.toLowerCase().includes(searchText)
        );
    }
    
    // 渲染筛选后的日志
    const logsContainer = document.getElementById('logs-container');
    if (!logsContainer) return;
    
    if (filteredLogs.length === 0) {
        logsContainer.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #9ca3af;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <p style="font-size: 16px;">未找到匹配的日志</p>
            </div>
        `;
        return;
    }
    
    logsContainer.innerHTML = filteredLogs.reverse().map(log => {
        const config = getLogStyle(log.level);
        
        return `
            <div style="
                margin-bottom: 8px;
                padding: 14px 18px;
                background: ${config.bg};
                border-radius: 10px;
                border-left: 5px solid ${config.color};
                box-shadow: 0 1px 4px ${config.shadow};
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 16px;">${config.icon}</span>
                    <span style="
                        display: inline-block;
                        padding: 4px 12px;
                        background: ${config.color};
                        color: white;
                        border-radius: 14px;
                        font-size: 11px;
                        font-weight: 700;
                        min-width: 70px;
                        text-align: center;
                    ">${log.level}</span>
                    <span style="font-size: 12px; color: #9ca3af; font-family: monospace; min-width: 90px;">${log.time}</span>
                    <span style="color: #1f2937; font-size: 14px; flex: 1;">${log.message}</span>
                </div>
            </div>
        `;
    }).join('');
}

// 更新日志统计
function updateLogStats() {
    const counts = {
        INFO: 0,
        SUCCESS: 0,
        WARN: 0,
        ERROR: 0
    };
    
    logs.forEach(log => {
        if (counts.hasOwnProperty(log.level)) {
            counts[log.level]++;
        }
    });
    
    document.getElementById('info-count').textContent = counts.INFO;
    document.getElementById('success-count').textContent = counts.SUCCESS;
    document.getElementById('warn-count').textContent = counts.WARN;
    document.getElementById('error-count').textContent = counts.ERROR;
}

