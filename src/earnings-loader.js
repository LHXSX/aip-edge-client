// 收益数据加载和更新

async function loadEarningsData() {
    try {
        addLog('INFO', '正在加载收益数据...');
        
        const earningsData = await callAPI('/users/earnings');
        
        if (!earningsData || !earningsData.success) {
            addLog('WARN', '收益数据加载失败');
            return;
        }
        
        const data = earningsData.data || earningsData;
        const earnings = data.earnings || [];
        
        // 使用收益计算模块
        const { EarningsCalculator, EarningsTrendAnalyzer, EarningsTypeClassifier } = window.EarningsModules;
        
        // 计算各项收益
        const totalEarnings = EarningsCalculator.calculateTotal(data);
        const todayEarnings = EarningsCalculator.calculateToday(data);
        const yesterdayEarnings = EarningsCalculator.calculateYesterday(data);
        const weekEarnings = EarningsCalculator.calculateThisWeek(data);
        const monthEarnings = EarningsCalculator.calculateThisMonth(data);
        const estimatedToday = EarningsCalculator.estimateTodayEarnings(data);
        
        // 更新显示
        updateElement('total-earnings-detail', totalEarnings.toFixed(4));
        updateElement('today-earnings', todayEarnings.toFixed(4));
        updateElement('yesterday-earnings', yesterdayEarnings.toFixed(4));
        updateElement('week-earnings', weekEarnings.toFixed(4));
        updateElement('month-earnings', monthEarnings.toFixed(4));
        updateElement('estimated-earnings', estimatedToday.toFixed(4));
        updateElement('withdrawable-amount', `${totalEarnings.toFixed(4)} AIP`);
        
        // 仪表盘也更新总收益
        updateElement('total-earnings', totalEarnings.toFixed(4));
        
        // 生成趋势数据并绘制图表
        const trendData = EarningsTrendAnalyzer.generateDailyTrend(data, 30);
        window.EarningsModules.EarningsChartRenderer.renderTrendChart('earnings-trend-chart', trendData);
        
        // 收益类型分布
        const typeData = EarningsTypeClassifier.classify(earnings);
        renderEarningsTypeDistribution(typeData);
        
        // 收益历史
        window.EarningsModules.EarningsHistory.renderHistory(earnings, 'earnings-history');
        
        addLog('SUCCESS', `收益数据加载成功: 总收益 ${totalEarnings.toFixed(4)} AIP, 今日 ${todayEarnings.toFixed(4)} AIP`);
        
    } catch (e) {
        console.error('加载收益数据失败:', e);
        addLog('ERROR', `收益数据加载失败: ${e.message}`);
    }
}

function updateElement(id, value) {
    const elem = document.getElementById(id);
    if (elem) elem.textContent = value;
}

function renderEarningsTypeDistribution(typeData) {
    const container = document.getElementById('earnings-type-distribution');
    if (!container) return;
    
    const types = Object.values(typeData).filter(t => t.amount > 0);
    
    if (types.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 40px;">暂无数据</p>';
        return;
    }
    
    container.innerHTML = types.map(type => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 10px; background: #f9fafb; border-radius: 10px; border-left: 4px solid ${type.color};">
            <div style="flex: 1;">
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">
                    ${type.label}
                </div>
                <div style="font-size: 12px; color: #6b7280;">
                    ${type.count} 笔
                </div>
            </div>
            <div style="font-weight: 700; color: ${type.color}; font-size: 16px;">
                ${type.amount.toFixed(4)} AIP
            </div>
        </div>
    `).join('');
}

window.exportEarnings = function() {
    addLog('INFO', '导出收益数据...');
    // TODO: 实现导出功能
    alert('收益数据导出功能开发中');
}

window.openWithdraw = function() {
    const amount = prompt('请输入提现金额（AIP）:');
    if (amount && parseFloat(amount) >= 10) {
        addLog('INFO', `申请提现 ${amount} AIP`);
        window.open('http://pidbai.com/withdraw.html', '_blank');
    } else if (amount) {
        alert('最小提现额度为 10 AIP');
    }
}

// 定期更新收益数据（每30秒）
setInterval(() => {
    if (document.getElementById('earnings-tab')?.classList.contains('active')) {
        loadEarningsData();
    }
}, 30000);

