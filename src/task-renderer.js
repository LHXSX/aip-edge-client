// 任务渲染模块

function renderTaskTable(tasks, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #9ca3af;">
                <div style="font-size: 48px; margin-bottom: 12px;">📭</div>
                <p>暂无任务</p>
            </div>
        `;
        return;
    }
    
    const html = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead style="background: linear-gradient(135deg, #667eea, #764ba2); color: white;">
                <tr>
                    <th style="padding: 14px; text-align: left;">任务ID</th>
                    <th style="padding: 14px; text-align: left;">类型</th>
                    <th style="padding: 14px; text-align: left;">状态</th>
                    <th style="padding: 14px; text-align: left;">开始时间</th>
                    <th style="padding: 14px; text-align: left;">运行时长</th>
                    <th style="padding: 14px; text-align: left;">收益</th>
                    <th style="padding: 14px; text-align: left;">操作</th>
                </tr>
            </thead>
            <tbody>
                ${tasks.map(task => renderTaskRow(task)).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function renderTaskRow(task) {
    const statusColors = {
        'running': '#3b82f6',
        'waiting': '#f59e0b',
        'completed': '#10b981',
        'failed': '#ef4444'
    };
    
    const statusTexts = {
        'running': '运行中',
        'waiting': '等待中',
        'completed': '已完成',
        'failed': '失败'
    };
    
    const duration = task.startTime ? formatDuration(Date.now() - task.startTime) : '-';
    
    return `
        <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 14px; font-family: monospace; font-size: 12px;">${(task.id || 'N/A').substring(0, 16)}...</td>
            <td style="padding: 14px;">${task.task_type || task.type || '未知'}</td>
            <td style="padding: 14px;">
                <span style="padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${statusColors[task.status]}20; color: ${statusColors[task.status]};">
                    ${statusTexts[task.status] || task.status}
                </span>
            </td>
            <td style="padding: 14px; font-size: 13px;">${task.startTime ? new Date(task.startTime).toLocaleString('zh-CN', {hour: '2-digit', minute: '2-digit', second: '2-digit'}) : '-'}</td>
            <td style="padding: 14px; font-size: 13px;">${duration}</td>
            <td style="padding: 14px; color: #10b981; font-weight: 600;">${task.reward || '0.0000'} AIP</td>
            <td style="padding: 14px;">
                <button class="btn" style="padding: 6px 12px; font-size: 12px; background: white; color: #667eea; border: 2px solid #667eea;" onclick='viewTaskDetail(${JSON.stringify(task)})'>
                    查看
                </button>
            </td>
        </tr>
    `;
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}小时${minutes % 60}分`;
    if (minutes > 0) return `${minutes}分${seconds % 60}秒`;
    return `${seconds}秒`;
}

function renderRunningTasks(tasks) {
    const container = document.getElementById('running-tasks-list');
    if (!container) return;
    
    if (tasks.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #9ca3af;">暂无运行中的任务</div>';
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div style="padding: 16px; margin-bottom: 12px; background: #dbeafe; border-radius: 12px; border-left: 4px solid #3b82f6;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">
                        ${task.task_type || task.type} #${(task.id || '').substring(0, 8)}
                    </div>
                    <div style="font-size: 13px; color: #1e40af;">
                        运行时长: ${formatDuration(Date.now() - (task.startTime || Date.now()))}
                    </div>
                </div>
                <div style="width: 100px;">
                    <div style="height: 8px; background: rgba(59,130,246,0.2); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; background: #3b82f6; width: ${Math.random() * 100}%; transition: width 0.3s;"></div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderWaitingTasks(tasks) {
    const container = document.getElementById('waiting-tasks-list');
    if (!container) return;
    
    if (tasks.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #9ca3af;">暂无等待中的任务</div>';
        return;
    }
    
    container.innerHTML = tasks.map((task, index) => `
        <div style="padding: 14px; margin-bottom: 10px; background: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <span style="color: #92400e; font-weight: 600;">队列位置: ${index + 1}</span>
                <span style="margin-left: 16px; color: #92400e;">
                    ${task.task_type || task.type} #${(task.id || '').substring(0, 8)}
                </span>
            </div>
            <span style="font-size: 12px; color: #92400e;">预计收益: ${task.reward || '0.0000'} AIP</span>
        </div>
    `).join('');
}

// 全局任务队列
window.globalTaskQueue = new TaskQueue();

window.viewTaskDetail = function(task) {
    if (typeof task === 'string') {
        task = JSON.parse(task);
    }
    TaskDetailViewer.showDetail(task);
}

window.refreshTaskList = function() {
    updateTaskDisplay();
    addLog('INFO', '任务列表已刷新');
}

function updateTaskDisplay() {
    const queue = window.globalTaskQueue;
    
    // 更新统计
    document.getElementById('running-count').textContent = queue.getRunningTasks().length;
    document.getElementById('waiting-count').textContent = queue.getWaitingTasks().length;
    document.getElementById('completed-count').textContent = queue.getCompletedTasks().length;
    document.getElementById('failed-count').textContent = queue.getFailedTasks().length;
    
    // 更新列表
    renderRunningTasks(queue.getRunningTasks());
    renderWaitingTasks(queue.getWaitingTasks());
    renderTaskTable(queue.getAllTasks(), 'all-tasks-table');
}

