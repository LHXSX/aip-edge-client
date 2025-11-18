// 性能监控模块 - 全方位数据监控

// ========== 1. 系统性能数据采集 ==========
class PerformanceCollector {
    constructor() {
        this.history = {
            cpu: [],
            memory: [],
            network: [],
            tasks: []
        };
        this.maxHistoryLength = 60; // 保留60个数据点
    }
    
    async collect() {
        const data = {
            timestamp: Date.now(),
            cpu: this.getCPUUsage(),
            memory: this.getMemoryUsage(),
            network: this.getNetworkSpeed(),
            battery: this.getBatteryInfo(),
            tasks: this.getTasksInfo()
        };
        
        // 添加到历史
        this.addToHistory('cpu', data.cpu);
        this.addToHistory('memory', data.memory);
        this.addToHistory('network', data.network);
        
        return data;
    }
    
    getCPUUsage() {
        // 模拟CPU使用率（实际应该从系统获取）
        const base = 25;
        const variation = Math.random() * 20;
        return parseFloat((base + variation).toFixed(1));
    }
    
    getMemoryUsage() {
        const total = (navigator.deviceMemory || 8) * 1024; // MB
        const used = total * (0.4 + Math.random() * 0.3);
        const free = total - used;
        const percent = (used / total * 100).toFixed(1);
        
        return {
            total: total,
            used: Math.floor(used),
            free: Math.floor(free),
            percent: parseFloat(percent)
        };
    }
    
    getNetworkSpeed() {
        // 模拟网络速度
        return {
            download: (Math.random() * 50 + 10).toFixed(2), // Mbps
            upload: (Math.random() * 20 + 5).toFixed(2),
            latency: Math.floor(Math.random() * 50 + 10) // ms
        };
    }
    
    getBatteryInfo() {
        // 电池信息（如果支持）
        return {
            level: 100,
            charging: true
        };
    }
    
    getTasksInfo() {
        const queue = window.globalTaskQueue;
        if (!queue) return { running: 0, waiting: 0, completed: 0 };
        
        return {
            running: queue.getRunningTasks().length,
            waiting: queue.getWaitingTasks().length,
            completed: queue.getCompletedTasks().length
        };
    }
    
    addToHistory(type, value) {
        this.history[type].push(value);
        if (this.history[type].length > this.maxHistoryLength) {
            this.history[type].shift();
        }
    }
    
    getHistory(type, points = 30) {
        return this.history[type].slice(-points);
    }
}

// ========== 2. 性能图表渲染 ==========
class PerformanceChartRenderer {
    static renderRealtimeChart(canvasId, data, config = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        if (!data || data.length === 0) return;
        
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        const maxValue = config.maxValue || Math.max(...data, 1);
        
        // 背景网格
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
            
            // Y轴标签
            const value = maxValue * (1 - i / 5);
            ctx.fillStyle = '#6b7280';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(0), padding - 10, y + 4);
        }
        
        // 数据点
        const points = data.map((value, i) => ({
            x: padding + (chartWidth / (data.length - 1)) * i,
            y: height - padding - (value / maxValue) * chartHeight
        }));
        
        // 渐变填充
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, (config.color || '#667eea') + '60');
        gradient.addColorStop(1, (config.color || '#667eea') + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(width - padding, height - padding);
        ctx.closePath();
        ctx.fill();
        
        // 折线
        ctx.strokeStyle = config.color || '#667eea';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        
        // 数据点
        points.forEach(p => {
            ctx.fillStyle = config.color || '#667eea';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }
    
    static renderGaugeChart(canvasId, value, max, config = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;
        
        ctx.clearRect(0, 0, width, height);
        
        // 背景圆弧
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 0);
        ctx.stroke();
        
        // 进度圆弧
        const angle = Math.PI * (value / max);
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, config.color || '#667eea');
        gradient.addColorStop(1, config.colorEnd || '#764ba2');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + angle);
        ctx.stroke();
        
        // 中心数值
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${value.toFixed(1)}%`, centerX, centerY);
    }
}

// ========== 3. 性能告警 ==========
class PerformanceAlerter {
    constructor() {
        this.alerts = [];
        this.thresholds = {
            cpu: 80,
            memory: 85,
            temperature: 75
        };
    }
    
    check(data) {
        const newAlerts = [];
        
        if (data.cpu > this.thresholds.cpu) {
            newAlerts.push({
                type: 'cpu',
                level: 'warning',
                message: `CPU使用率过高: ${data.cpu}%`
            });
        }
        
        if (data.memory.percent > this.thresholds.memory) {
            newAlerts.push({
                type: 'memory',
                level: 'warning',
                message: `内存使用率过高: ${data.memory.percent}%`
            });
        }
        
        this.alerts = newAlerts;
        return newAlerts;
    }
}

// 全局性能监控器
window.performanceCollector = new PerformanceCollector();
window.performanceAlerter = new PerformanceAlerter();

// 启动性能监控
window.startPerformanceMonitoring = function() {
    setInterval(async () => {
        const data = await window.performanceCollector.collect();
        
        // 更新UI
        updatePerformanceUI(data);
        
        // 检查告警
        const alerts = window.performanceAlerter.check(data);
        if (alerts.length > 0) {
            alerts.forEach(alert => {
                addLog('WARN', alert.message);
            });
        }
    }, 2000); // 每2秒采集一次
}

function updatePerformanceUI(data) {
    // 更新CPU
    const cpuElem = document.getElementById('cpu-gauge-value');
    if (cpuElem) cpuElem.textContent = `${data.cpu}%`;
    
    // 更新内存
    const memElem = document.getElementById('memory-gauge-value');
    if (memElem) memElem.textContent = `${data.memory.percent}%`;
    
    const memUsedElem = document.getElementById('memory-used');
    if (memUsedElem) memUsedElem.textContent = `${(data.memory.used / 1024).toFixed(2)} GB`;
    
    const memTotalElem = document.getElementById('memory-total');
    if (memTotalElem) memTotalElem.textContent = `${(data.memory.total / 1024).toFixed(2)} GB`;
    
    // 更新网络
    const downloadElem = document.getElementById('network-download');
    if (downloadElem) downloadElem.textContent = `${data.network.download} Mbps`;
    
    const uploadElem = document.getElementById('network-upload');
    if (uploadElem) uploadElem.textContent = `${data.network.upload} Mbps`;
    
    const latencyElem = document.getElementById('network-latency');
    if (latencyElem) latencyElem.textContent = `${data.network.latency} ms`;
    
    // 更新图表
    const cpuHistory = window.performanceCollector.getHistory('cpu');
    PerformanceChartRenderer.renderRealtimeChart('cpu-chart', cpuHistory, { 
        maxValue: 100, 
        color: '#3b82f6' 
    });
    
    const memoryHistory = window.performanceCollector.getHistory('memory').map(m => m.percent);
    PerformanceChartRenderer.renderRealtimeChart('memory-chart', memoryHistory, { 
        maxValue: 100, 
        color: '#10b981' 
    });
    
    // 更新仪表盘
    PerformanceChartRenderer.renderGaugeChart('cpu-gauge', data.cpu, 100, { 
        color: '#3b82f6', 
        colorEnd: '#2563eb' 
    });
    
    PerformanceChartRenderer.renderGaugeChart('memory-gauge', data.memory.percent, 100, { 
        color: '#10b981', 
        colorEnd: '#059669' 
    });
}

