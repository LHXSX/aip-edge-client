// 通知管理器

let notifications = [];

// 通知类型映射
const notificationTypes = {
    'task': { name: '任务通知', color: '#10b981', icon: '✅' },
    'earning': { name: '收益通知', color: '#f59e0b', icon: '💰' },
    'warning': { name: '警告通知', color: '#ef4444', icon: '⚠️' },
    'system': { name: '系统通知', color: '#3b82f6', icon: '📢' },
};

// 生成模拟通知
function generateMockNotifications() {
    const types = Object.keys(notificationTypes);
    const messages = {
        task: ['任务 #12345 已完成', '新任务可用', '任务执行失败', '任务队列已清空'],
        earning: ['收益到账 +0.5 AIP', '今日收益达成目标', '推荐奖励 +0.2 AIP', '每日奖励已发放'],
        warning: ['CPU使用率过高', '内存不足', '网络连接不稳定', '存储空间不足'],
        system: ['系统更新可用', '维护通知', '新功能上线', '节点状态异常'],
    };
    
    notifications = [];
    for (let i = 0; i < 30; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const messageList = messages[type];
        const message = messageList[Math.floor(Math.random() * messageList.length)];
        const time = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const read = Math.random() > 0.4;
        
        notifications.push({
            id: `notif_${Date.now()}_${i}`,
            type,
            message,
            time: time.toISOString(),
            read,
        });
    }
    
    // 按时间倒序排序
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    updateNotificationStats();
    renderNotifications();
}

// 更新通知统计
function updateNotificationStats() {
    document.getElementById('notif-total').textContent = notifications.length;
    document.getElementById('notif-task').textContent = notifications.filter(n => n.type === 'task').length;
    document.getElementById('notif-earning').textContent = notifications.filter(n => n.type === 'earning').length;
    document.getElementById('notif-warning').textContent = notifications.filter(n => n.type === 'warning').length;
}

// 渲染通知列表
function renderNotifications() {
    const container = document.getElementById('notifications-list');
    if (!container) return;
    
    const filter = document.getElementById('notif-filter')?.value || 'all';
    
    let filtered = notifications;
    if (filter === 'unread') {
        filtered = notifications.filter(n => !n.read);
    } else if (filter !== 'all') {
        filtered = notifications.filter(n => n.type === filter);
    }
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="padding: 60px; text-align: center; color: #9ca3af;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔔</div>
                <div style="font-size: 16px; font-weight: 600;">暂无通知</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(notif => {
        const typeInfo = notificationTypes[notif.type];
        const time = new Date(notif.time);
        const timeStr = formatTimeAgo(time);
        
        return `
            <div style="display: flex; align-items: flex-start; gap: 16px; padding: 20px; border-bottom: 1px solid #e5e7eb; background: ${notif.read ? '#ffffff' : '#f0f9ff'}; cursor: pointer; transition: background 0.2s;" onclick="markAsRead('${notif.id}')">
                <div style="flex-shrink: 0; width: 48px; height: 48px; border-radius: 12px; background: ${typeInfo.color}15; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    ${typeInfo.icon}
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="font-weight: 700; color: ${typeInfo.color}; font-size: 13px;">${typeInfo.name}</span>
                        ${!notif.read ? '<span style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></span>' : ''}
                    </div>
                    <div style="color: #1f2937; font-size: 15px; margin-bottom: 6px;">${notif.message}</div>
                    <div style="color: #9ca3af; font-size: 12px;">${timeStr}</div>
                </div>
                <button onclick="deleteNotification(event, '${notif.id}')" style="flex-shrink: 0; padding: 8px; background: #f3f4f6; border: none; border-radius: 8px; cursor: pointer; color: #6b7280; transition: all 0.2s;">
                    🗑️
                </button>
            </div>
        `;
    }).join('');
}

// 格式化相对时间
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return '刚刚';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}天前`;
    
    return date.toLocaleDateString();
}

// 标记为已读
function markAsRead(notifId) {
    const notif = notifications.find(n => n.id === notifId);
    if (notif) {
        notif.read = true;
        renderNotifications();
        updateNotificationStats();
    }
}

// 全部标记为已读
function markAllRead() {
    notifications.forEach(n => n.read = true);
    renderNotifications();
    addLog('success', '✅ 所有通知已标记为已读');
}

// 删除通知
function deleteNotification(event, notifId) {
    event.stopPropagation();
    notifications = notifications.filter(n => n.id !== notifId);
    updateNotificationStats();
    renderNotifications();
}

// 清空所有通知
function clearAllNotifications() {
    if (confirm('确定要清空所有通知吗？')) {
        notifications = [];
        updateNotificationStats();
        renderNotifications();
        addLog('info', '🗑️ 所有通知已清空');
    }
}

// 监听筛选器变化
document.addEventListener('DOMContentLoaded', () => {
    const filter = document.getElementById('notif-filter');
    if (filter) {
        filter.addEventListener('change', renderNotifications);
    }
    
    // 生成模拟通知
    setTimeout(generateMockNotifications, 1000);
});

