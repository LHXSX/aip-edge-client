// 纯CSS图表渲染器 - 高质量HTML5实现

// 更新环形进度
function updateCircularProgress(elementId, value) {
    const elem = document.querySelector(`#${elementId}`).closest('.circular-progress');
    if (elem) {
        elem.style.setProperty('--progress', value);
    }
    
    const valueElem = document.getElementById(elementId);
    if (valueElem) {
        valueElem.textContent = `${value.toFixed(1)}%`;
        valueElem.classList.add('number-roll');
        setTimeout(() => valueElem.classList.remove('number-roll'), 600);
    }
}

// 渲染趋势柱状图
function renderTrendBars(containerId, data, color, colorLight) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const maxValue = Math.max(...data, 1);
    
    container.innerHTML = data.map((value, i) => {
        const height = (value / maxValue) * 100;
        return `
            <div class="chart-bar stat-card-animated" 
                 style="
                     height: ${height}%;
                     --bar-color: ${color};
                     --bar-color-light: ${colorLight};
                     animation-delay: ${i * 0.05}s;
                 "
                 data-value="${value.toFixed(1)}%">
                <div class="chart-bar-value">${value.toFixed(1)}%</div>
            </div>
        `;
    }).join('');
}

// 性能监控数据更新
let cpuHistory = [];
let memoryHistory = [];

function updatePerformanceCharts() {
    // 获取当前CPU和内存使用率
    const cpuUsage = parseFloat(document.getElementById('cpu-usage')?.textContent) || (Math.random() * 30 + 20);
    const memoryUsage = parseFloat(document.getElementById('memory-usage')?.textContent) || (Math.random() * 40 + 30);
    
    // 添加到历史
    cpuHistory.push(cpuUsage);
    if (cpuHistory.length > 30) cpuHistory.shift();
    
    memoryHistory.push(memoryUsage);
    if (memoryHistory.length > 30) memoryHistory.shift();
    
    // 更新环形进度
    updateCircularProgress('cpu-gauge-value', cpuUsage);
    updateCircularProgress('memory-gauge-value', memoryUsage);
    
    // 更新趋势图
    renderTrendBars('cpu-trend-bars', cpuHistory, '#3b82f6', '#60a5fa');
    renderTrendBars('memory-trend-bars', memoryHistory, '#10b981', '#34d399');
}

// 每2秒更新一次
setInterval(updatePerformanceCharts, 2000);

// 立即执行一次
setTimeout(updatePerformanceCharts, 1000);

