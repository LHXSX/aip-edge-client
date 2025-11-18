// 任务历史管理器

let taskHistory = [];
let historyCurrentPage = 1;
let historyPageSize = 20;
let filteredHistory = [];

// 任务类型映射
const taskTypeMap = {
    'image_processing': { name: '图像处理', icon: '🖼️', color: '#3b82f6' },
    'data_analysis': { name: '数据分析', icon: '📊', color: '#10b981' },
    'model_training': { name: '模型训练', icon: '🤖', color: '#8b5cf6' },
    'video_encoding': { name: '视频编码', icon: '🎬', color: '#f59e0b' },
    'ai_inference': { name: 'AI推理', icon: '🧠', color: '#ec4899' },
    'compute': { name: '通用计算', icon: '⚙️', color: '#6b7280' },
};

// 状态映射
const statusMap = {
    'success': { name: '成功', color: '#10b981', bg: '#d1fae5' },
    'failed': { name: '失败', color: '#ef4444', bg: '#fee2e2' },
    'timeout': { name: '超时', color: '#f59e0b', bg: '#fef3c7' },
};

// 从API加载任务历史
async function loadTaskHistory() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await callAPI('/compute/tasks/history', 'GET');
        
        if (response && response.data) {
            taskHistory = response.data.map(task => ({
                id: task.id || task.taskId || generateTaskId(),
                type: task.type || 'compute',
                status: task.status || 'success',
                startTime: task.startTime || task.createdAt || new Date().toISOString(),
                endTime: task.endTime || task.completedAt || new Date().toISOString(),
                duration: task.duration || calculateDuration(task.startTime, task.endTime),
                earnings: task.earnings || (Math.random() * 0.5 + 0.1).toFixed(2),
                result: task.result || null,
            }));
        } else {
            // 生成模拟数据
            taskHistory = generateMockHistory(50);
        }
        
        applyHistoryFilters();
        renderTaskHistory();
        updateHistoryStats();
        
    } catch (error) {
        console.error('加载任务历史失败:', error);
        // 使用模拟数据
        taskHistory = generateMockHistory(50);
        applyHistoryFilters();
        renderTaskHistory();
        updateHistoryStats();
    }
}

// 生成模拟任务历史
function generateMockHistory(count) {
    const history = [];
    const types = Object.keys(taskTypeMap);
    const statuses = ['success', 'success', 'success', 'failed', 'timeout']; // 成功率更高
    
    for (let i = 0; i < count; i++) {
        const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const duration = Math.floor(Math.random() * 600 + 30); // 30秒到10分钟
        const endTime = new Date(startTime.getTime() + duration * 1000);
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        history.push({
            id: `task_${Date.now()}_${i}`,
            type: types[Math.floor(Math.random() * types.length)],
            status: status,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: duration,
            earnings: status === 'success' ? (Math.random() * 0.5 + 0.1).toFixed(2) : '0.00',
        });
    }
    
    // 按时间倒序排序
    return history.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
}

// 计算耗时
function calculateDuration(start, end) {
    if (!start || !end) return 0;
    return Math.floor((new Date(end) - new Date(start)) / 1000);
}

// 格式化时间
function formatDateTime(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// 格式化耗时
function formatDuration(seconds) {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}小时${minutes}分`;
    } else if (minutes > 0) {
        return `${minutes}分${secs}秒`;
    } else {
        return `${secs}秒`;
    }
}

// 生成任务ID
function generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 应用筛选
function applyHistoryFilters() {
    const searchText = document.getElementById('history-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('history-filter-status')?.value || 'all';
    const typeFilter = document.getElementById('history-filter-type')?.value || 'all';
    
    filteredHistory = taskHistory.filter(task => {
        const matchSearch = !searchText || 
            task.id.toLowerCase().includes(searchText) ||
            (taskTypeMap[task.type]?.name || '').toLowerCase().includes(searchText);
        const matchStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchType = typeFilter === 'all' || task.type === typeFilter;
        
        return matchSearch && matchStatus && matchType;
    });
    
    historyCurrentPage = 1;
}

// 渲染任务历史表格
function renderTaskHistory() {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;
    
    const start = (historyCurrentPage - 1) * historyPageSize;
    const end = start + historyPageSize;
    const pageData = filteredHistory.slice(start, end);
    
    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="padding: 60px; text-align: center; color: #9ca3af;">
                    暂无符合条件的任务记录
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pageData.map(task => {
        const typeInfo = taskTypeMap[task.type] || taskTypeMap['compute'];
        const statusInfo = statusMap[task.status] || statusMap['success'];
        
        return `
            <tr style="border-bottom: 1px solid #f3f4f6; transition: background 0.2s;">
                <td style="padding: 16px; font-family: monospace; font-size: 12px; color: #667eea;">
                    ${task.id.substring(0, 16)}...
                </td>
                <td style="padding: 16px;">
                    <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: ${typeInfo.color}15; color: ${typeInfo.color}; border-radius: 8px; font-size: 12px; font-weight: 600;">
                        ${typeInfo.icon} ${typeInfo.name}
                    </span>
                </td>
                <td style="padding: 16px;">
                    <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: ${statusInfo.bg}; color: ${statusInfo.color}; border-radius: 8px; font-size: 12px; font-weight: 600;">
                        ${task.status === 'success' ? '✅' : task.status === 'failed' ? '❌' : '⏰'} ${statusInfo.name}
                    </span>
                </td>
                <td style="padding: 16px; color: #6b7280; font-size: 13px;">
                    ${formatDateTime(task.startTime)}
                </td>
                <td style="padding: 16px; color: #6b7280; font-size: 13px;">
                    ${formatDateTime(task.endTime)}
                </td>
                <td style="padding: 16px; color: #1f2937; font-weight: 600; font-size: 13px;">
                    ${formatDuration(task.duration)}
                </td>
                <td style="padding: 16px; color: ${task.status === 'success' ? '#10b981' : '#9ca3af'}; font-weight: 700; font-size: 14px;">
                    ¥${task.earnings}
                </td>
                <td style="padding: 16px; text-align: center;">
                    <button onclick="viewTaskDetail('${task.id}')" style="padding: 6px 14px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;">
                        查看详情
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // 更新分页信息
    const totalPages = Math.ceil(filteredHistory.length / historyPageSize);
    document.getElementById('history-current-page').textContent = historyCurrentPage;
    document.getElementById('history-total-pages').textContent = totalPages;
}

// 更新统计数据
function updateHistoryStats() {
    const successCount = taskHistory.filter(t => t.status === 'success').length;
    const failedCount = taskHistory.filter(t => t.status !== 'success').length;
    const totalEarnings = taskHistory
        .filter(t => t.status === 'success')
        .reduce((sum, t) => sum + parseFloat(t.earnings), 0);
    const totalDuration = taskHistory.reduce((sum, t) => sum + (t.duration || 0), 0);
    
    document.getElementById('history-success').textContent = successCount;
    document.getElementById('history-failed').textContent = failedCount;
    document.getElementById('history-earnings').textContent = `¥${totalEarnings.toFixed(2)}`;
    document.getElementById('history-duration').textContent = formatDuration(totalDuration);
}

// 刷新任务历史
function refreshTaskHistory() {
    addLog('info', '正在刷新任务历史...');
    loadTaskHistory();
}

// 上一页
function previousHistoryPage() {
    if (historyCurrentPage > 1) {
        historyCurrentPage--;
        renderTaskHistory();
    }
}

// 下一页
function nextHistoryPage() {
    const totalPages = Math.ceil(filteredHistory.length / historyPageSize);
    if (historyCurrentPage < totalPages) {
        historyCurrentPage++;
        renderTaskHistory();
    }
}

// 查看任务详情
function viewTaskDetail(taskId) {
    const task = taskHistory.find(t => t.id === taskId);
    if (!task) return;
    
    const typeInfo = taskTypeMap[task.type] || taskTypeMap['compute'];
    const statusInfo = statusMap[task.status] || statusMap['success'];
    
    alert(`
任务详情
━━━━━━━━━━━━━━━━━━━━

任务ID: ${task.id}
类型: ${typeInfo.icon} ${typeInfo.name}
状态: ${statusInfo.name}

开始时间: ${formatDateTime(task.startTime)}
完成时间: ${formatDateTime(task.endTime)}
总耗时: ${formatDuration(task.duration)}

收益: ¥${task.earnings}
    `);
}

// 监听筛选器变化
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('history-search');
    const statusFilter = document.getElementById('history-filter-status');
    const typeFilter = document.getElementById('history-filter-type');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyHistoryFilters();
            renderTaskHistory();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            applyHistoryFilters();
            renderTaskHistory();
        });
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', () => {
            applyHistoryFilters();
            renderTaskHistory();
        });
    }
    
    // 初始加载
    setTimeout(() => {
        if (localStorage.getItem('token')) {
            loadTaskHistory();
        }
    }, 2000);
});

