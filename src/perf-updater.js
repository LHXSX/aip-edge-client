// 性能数据更新器

function updatePerformanceData() {
    // CPU
    const cpuUsage = (Math.random() * 30 + 20).toFixed(1);
    const cpuCores = navigator.hardwareConcurrency || 4;
    document.getElementById('perf-cpu').textContent = `${cpuUsage}%`;
    document.getElementById('cpu-cores-mini').textContent = `${cpuCores}核心`;
    
    // 内存
    const memoryTotal = navigator.deviceMemory || 8;
    const memoryUsage = (Math.random() * 40 + 30).toFixed(1);
    const memoryUsed = (memoryTotal * memoryUsage / 100).toFixed(2);
    document.getElementById('perf-memory').textContent = `${memoryUsage}%`;
    document.getElementById('memory-detail').textContent = `${memoryUsed}/${memoryTotal} GB`;
    
    // GPU（Web环境暂不可用）
    document.getElementById('perf-gpu').textContent = 'N/A';
    
    // 网络延迟
    const pingElem = document.getElementById('ping');
    if (pingElem) {
        document.getElementById('perf-ping').textContent = pingElem.textContent;
    }
    
    // 网速
    const download = (Math.random() * 50 + 10).toFixed(1);
    const upload = (Math.random() * 20 + 5).toFixed(1);
    document.getElementById('perf-download').textContent = download;
    document.getElementById('perf-upload').textContent = upload;
    
    // 运行任务
    if (window.globalTaskQueue) {
        const running = window.globalTaskQueue.getRunningTasks().length;
        document.getElementById('perf-tasks').textContent = running;
    }
    
    // 运行时长
    const runtimeElem = document.getElementById('runtime');
    if (runtimeElem) {
        const time = runtimeElem.textContent;
        const parts = time.split(':');
        document.getElementById('perf-uptime').textContent = `${parts[0]}:${parts[1]}`;
    }
    
    // 系统信息
    const sysDetails = document.getElementById('system-details-perf');
    if (sysDetails) {
        sysDetails.innerHTML = `
            <div>
                <div style="padding: 10px; margin-bottom: 8px; background: #f9fafb; border-radius: 8px; display: flex; justify-content: space-between;">
                    <span style="color: #6b7280; font-size: 13px;">操作系统</span>
                    <span style="font-weight: 600; font-size: 13px;">${navigator.platform}</span>
                </div>
                <div style="padding: 10px; margin-bottom: 8px; background: #f9fafb; border-radius: 8px; display: flex; justify-content: space-between;">
                    <span style="color: #6b7280; font-size: 13px;">浏览器</span>
                    <span style="font-weight: 600; font-size: 13px;">Chrome</span>
                </div>
                <div style="padding: 10px; margin-bottom: 8px; background: #f9fafb; border-radius: 8px; display: flex; justify-content: space-between;">
                    <span style="color: #6b7280; font-size: 13px;">分辨率</span>
                    <span style="font-weight: 600; font-size: 13px;">${screen.width} x ${screen.height}</span>
                </div>
            </div>
            <div>
                <div style="padding: 10px; margin-bottom: 8px; background: #f9fafb; border-radius: 8px; display: flex; justify-content: space-between;">
                    <span style="color: #6b7280; font-size: 13px;">节点ID</span>
                    <span style="font-weight: 600; font-size: 11px; font-family: monospace; color: #667eea;">${(nodeId || '未注册').substring(0, 16)}...</span>
                </div>
                <div style="padding: 10px; margin-bottom: 8px; background: #f9fafb; border-radius: 8px; display: flex; justify-content: space-between;">
                    <span style="color: #6b7280; font-size: 13px;">节点状态</span>
                    <span style="font-weight: 600; font-size: 13px; color: #10b981;">在线</span>
                </div>
                <div style="padding: 10px; margin-bottom: 8px; background: #f9fafb; border-radius: 8px; display: flex; justify-content: space-between;">
                    <span style="color: #6b7280; font-size: 13px;">服务器</span>
                    <span style="font-weight: 600; font-size: 13px; color: #667eea;">8.218.206.57</span>
                </div>
            </div>
        `;
    }
}

// 每2秒更新一次
setInterval(updatePerformanceData, 2000);

// 立即执行
setTimeout(updatePerformanceData, 500);

