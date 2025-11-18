// 图表渲染模块 - 使用 Chart.js 风格的简易实现

export class ChartRenderer {
    // 渲染折线图
    static renderLineChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 计算数据点
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        const maxValue = Math.max(...data.map(d => d.value), 1);
        const points = data.map((d, i) => ({
            x: padding + (chartWidth / (data.length - 1)) * i,
            y: height - padding - (d.value / maxValue) * chartHeight
        }));
        
        // 绘制网格线
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // 绘制折线
        ctx.strokeStyle = options.color || '#667eea';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        points.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        
        // 绘制渐变填充
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, (options.color || '#667eea') + '40');
        gradient.addColorStop(1, (options.color || '#667eea') + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        points.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.lineTo(width - padding, height - padding);
        ctx.closePath();
        ctx.fill();
        
        // 绘制数据点
        points.forEach(point => {
            ctx.fillStyle = options.color || '#667eea';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }
    
    // 渲染柱状图
    static renderBarChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const padding = 40;
        const chartHeight = height - padding * 2;
        const maxValue = Math.max(...data.map(d => d.value), 1);
        
        const barWidth = (width - padding * 2) / data.length - 10;
        
        data.forEach((d, i) => {
            const barHeight = (d.value / maxValue) * chartHeight;
            const x = padding + i * ((width - padding * 2) / data.length);
            const y = height - padding - barHeight;
            
            // 渐变填充
            const gradient = ctx.createLinearGradient(x, y, x, height - padding);
            gradient.addColorStop(0, options.color || '#667eea');
            gradient.addColorStop(1, options.colorEnd || '#764ba2');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // 数值标签
            ctx.fillStyle = '#374151';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(d.value, x + barWidth / 2, y - 8);
        });
    }
    
    // 渲染环形进度
    static renderDonutChart(canvasId, percentage, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;
        
        ctx.clearRect(0, 0, width, height);
        
        // 背景圆环
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 进度圆环
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, options.color || '#667eea');
        gradient.addColorStop(1, options.colorEnd || '#764ba2');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * percentage / 100));
        ctx.stroke();
        
        // 中心文字
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage}%`, centerX, centerY);
    }
}

// 生成模拟数据
export function generateMockData(points = 30) {
    return Array.from({ length: points }, (_, i) => ({
        time: new Date(Date.now() - (points - i) * 60000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        value: Math.random() * 80 + 20
    }));
}

