// 灵动岛实时状态更新

let startTime = Date.now();
let lastPingTime = 0;

// 更新灵动岛状态
function updateDynamicIsland() {
    // 1. 更新运行时长
    const elapsed = Date.now() - startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    const runtimeElem = document.getElementById('runtime');
    if (runtimeElem) {
        runtimeElem.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 2. 更新任务状态
    const taskStatusElem = document.getElementById('task-status');
    if (taskStatusElem && window.globalTaskQueue) {
        const running = window.globalTaskQueue.getRunningTasks().length;
        const waiting = window.globalTaskQueue.getWaitingTasks().length;
        taskStatusElem.textContent = `${running}运行 ${waiting}等待`;
    }
    
    // 3. 更新连接延迟（每5秒测试一次）
    if (Date.now() - lastPingTime > 5000) {
        testPing();
    }
}

// 测试连接延迟
async function testPing() {
    lastPingTime = Date.now();
    
    try {
        const start = Date.now();
        await fetch('http://8.218.206.57/api/v1/health', { 
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });
        const latency = Date.now() - start;
        
        const pingElem = document.getElementById('ping');
        if (pingElem) {
            pingElem.textContent = `${latency}ms`;
            
            // 根据延迟设置颜色
            if (latency < 100) {
                pingElem.style.color = '#10b981'; // 绿色-优秀
            } else if (latency < 300) {
                pingElem.style.color = '#f59e0b'; // 橙色-一般
            } else {
                pingElem.style.color = '#ef4444'; // 红色-较慢
            }
        }
    } catch (e) {
        const pingElem = document.getElementById('ping');
        if (pingElem) {
            pingElem.textContent = '超时';
            pingElem.style.color = '#ef4444';
        }
    }
}

// 更新心跳状态显示
function updateHeartbeatStatus(success) {
    const statusElem = document.getElementById('heartbeat-status');
    const pulseElem = document.getElementById('node-pulse');
    
    if (statusElem) {
        if (success) {
            statusElem.textContent = '心跳正常';
            if (pulseElem) {
                pulseElem.style.background = '#10b981';
                pulseElem.style.boxShadow = '0 0 8px #10b981';
            }
        } else {
            statusElem.textContent = '心跳异常';
            if (pulseElem) {
                pulseElem.style.background = '#ef4444';
                pulseElem.style.boxShadow = '0 0 8px #ef4444';
            }
        }
    }
}

// 每秒更新一次灵动岛
setInterval(updateDynamicIsland, 1000);

// 立即执行一次
updateDynamicIsland();

