// 收益管理 - 完整子模块系统

// ========== 1. 收益数据获取模块 ==========
class EarningsDataFetcher {
    constructor(apiClient, nodeId) {
        this.apiClient = apiClient;
        this.nodeId = nodeId;
        this.cache = null;
        this.lastFetch = 0;
    }
    
    async fetchEarnings(forceRefresh = false) {
        // 缓存5秒
        if (!forceRefresh && this.cache && (Date.now() - this.lastFetch < 5000)) {
            return this.cache;
        }
        
        try {
            const result = await this.apiClient('/users/earnings');
            
            if (result.success) {
                this.cache = result.data || result;
                this.lastFetch = Date.now();
                return this.cache;
            }
        } catch (e) {
            console.error('获取收益失败:', e);
        }
        
        return null;
    }
    
    async fetchNodeEarnings() {
        // 获取指定节点的收益
        try {
            const result = await this.apiClient(`/compute/nodes/${this.nodeId}`);
            if (result.success) {
                return result.data?.earnings || null;
            }
        } catch (e) {
            console.error('获取节点收益失败:', e);
        }
        return null;
    }
}

// ========== 2. 收益统计计算模块 ==========
class EarningsCalculator {
    // 计算总收益
    static calculateTotal(earningsData) {
        if (!earningsData) return 0;
        return earningsData.total || earningsData.totalEarnings || 0;
    }
    
    // 计算今日收益
    static calculateToday(earningsData) {
        if (!earningsData) return 0;
        
        const today = new Date().toISOString().split('T')[0];
        const earnings = earningsData.earnings || [];
        
        return earnings
            .filter(e => e.created_at && e.created_at.startsWith(today))
            .reduce((sum, e) => sum + (e.amount || 0), 0);
    }
    
    // 计算昨日收益
    static calculateYesterday(earningsData) {
        if (!earningsData) return 0;
        
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const earnings = earningsData.earnings || [];
        
        return earnings
            .filter(e => e.created_at && e.created_at.startsWith(yesterday))
            .reduce((sum, e) => sum + (e.amount || 0), 0);
    }
    
    // 计算本周收益
    static calculateThisWeek(earningsData) {
        if (!earningsData) return 0;
        
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const earnings = earningsData.earnings || [];
        
        return earnings
            .filter(e => {
                if (!e.created_at) return false;
                const date = new Date(e.created_at);
                return date >= weekAgo;
            })
            .reduce((sum, e) => sum + (e.amount || 0), 0);
    }
    
    // 计算本月收益
    static calculateThisMonth(earningsData) {
        if (!earningsData) return 0;
        
        const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
        const earnings = earningsData.earnings || [];
        
        return earnings
            .filter(e => e.created_at && e.created_at.startsWith(thisMonth))
            .reduce((sum, e) => sum + (e.amount || 0), 0);
    }
    
    // 预计今日收益（基于当前速率）
    static estimateTodayEarnings(earningsData) {
        const todayEarnings = this.calculateToday(earningsData);
        
        // 获取今天已过去的时间比例
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const elapsed = now - todayStart;
        const totalDay = 24 * 60 * 60 * 1000;
        const ratio = elapsed / totalDay;
        
        if (ratio > 0 && ratio < 1) {
            return todayEarnings / ratio;
        }
        
        return todayEarnings;
    }
}

// ========== 3. 收益趋势分析模块 ==========
class EarningsTrendAnalyzer {
    // 生成每日收益数据（最近30天）
    static generateDailyTrend(earningsData, days = 30) {
        const earnings = earningsData?.earnings || [];
        const trend = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(Date.now() - i * 86400000);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayEarnings = earnings
                .filter(e => e.created_at && e.created_at.startsWith(dateStr))
                .reduce((sum, e) => sum + (e.amount || 0), 0);
            
            trend.push({
                date: dateStr,
                dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
                amount: dayEarnings
            });
        }
        
        return trend;
    }
    
    // 计算增长率
    static calculateGrowthRate(earningsData) {
        const today = this.calculateToday(earningsData);
        const yesterday = this.calculateYesterday(earningsData);
        
        if (yesterday === 0) return 0;
        return ((today - yesterday) / yesterday * 100).toFixed(1);
    }
}

// ========== 4. 收益类型分类模块 ==========
class EarningsTypeClassifier {
    static classify(earnings) {
        const types = {
            task_completion: { label: '任务完成', amount: 0, count: 0, color: '#667eea' },
            task_reward: { label: '任务奖励', amount: 0, count: 0, color: '#10b981' },
            referral_level1: { label: '一级推荐', amount: 0, count: 0, color: '#3b82f6' },
            referral_level2: { label: '二级推荐', amount: 0, count: 0, color: '#8b5cf6' },
            mining: { label: '挖矿奖励', amount: 0, count: 0, color: '#f59e0b' },
            bonus: { label: '额外奖励', amount: 0, count: 0, color: '#ec4899' }
        };
        
        earnings.forEach(e => {
            const type = e.earnings_type || e.type || 'task_completion';
            if (types[type]) {
                types[type].amount += e.amount || 0;
                types[type].count += 1;
            }
        });
        
        return types;
    }
}

// ========== 5. 收益排行模块 ==========
class EarningsRanking {
    static async fetchRanking(apiClient) {
        try {
            const result = await apiClient('/users/earnings/ranking');
            if (result.success) {
                return result.data || [];
            }
        } catch (e) {
            console.log('排行榜暂不可用');
        }
        return [];
    }
    
    static renderRanking(rankings, currentUserId) {
        return rankings.map((user, index) => {
            const isCurrent = user.user_id === currentUserId;
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            
            return `
                <div style="padding: 14px; margin-bottom: 10px; background: ${isCurrent ? '#f0fdf4' : '#f9fafb'}; border-radius: 12px; border-left: 4px solid ${isCurrent ? '#10b981' : '#e5e7eb'}; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 20px;">${medal}</span>
                        <span style="font-weight: ${isCurrent ? '700' : '600'}; color: #1f2937;">
                            ${user.username}${isCurrent ? ' (我)' : ''}
                        </span>
                    </div>
                    <span style="font-weight: 700; color: #10b981;">
                        ${user.total_earnings.toFixed(4)} AIP
                    </span>
                </div>
            `;
        }).join('');
    }
}

// ========== 6. 收益提现模块 ==========
class EarningsWithdrawal {
    static checkWithdrawable(totalEarnings) {
        const minWithdraw = 10; // 最小提现额度
        return {
            canWithdraw: totalEarnings >= minWithdraw,
            minAmount: minWithdraw,
            available: totalEarnings
        };
    }
    
    static async initiateWithdrawal(apiClient, amount, address) {
        try {
            const result = await apiClient('/users/withdraw', 'POST', {
                amount,
                address
            });
            return result;
        } catch (e) {
            console.error('提现失败:', e);
            return { success: false, error: e.message };
        }
    }
}

// ========== 7. 收益历史记录模块 ==========
class EarningsHistory {
    static renderHistory(earnings, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!earnings || earnings.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #9ca3af;">暂无收益记录</div>';
            return;
        }
        
        const html = `
            <table style="width: 100%;">
                <thead style="background: linear-gradient(135deg, #10b981, #059669); color: white;">
                    <tr>
                        <th style="padding: 14px; text-align: left;">时间</th>
                        <th style="padding: 14px; text-align: left;">类型</th>
                        <th style="padding: 14px; text-align: left;">金额</th>
                        <th style="padding: 14px; text-align: left;">任务ID</th>
                        <th style="padding: 14px; text-align: left;">描述</th>
                    </tr>
                </thead>
                <tbody>
                    ${earnings.slice(0, 50).map(e => `
                        <tr style="border-bottom: 1px solid #f3f4f6;">
                            <td style="padding: 14px; font-size: 13px;">${new Date(e.created_at).toLocaleString('zh-CN')}</td>
                            <td style="padding: 14px;">
                                <span style="padding: 4px 8px; background: #f0fdf4; color: #065f46; border-radius: 8px; font-size: 11px; font-weight: 600;">
                                    ${this.getTypeLabel(e.earnings_type)}
                                </span>
                            </td>
                            <td style="padding: 14px; color: #10b981; font-weight: 700; font-size: 15px;">
                                +${e.amount.toFixed(4)} AIP
                            </td>
                            <td style="padding: 14px; font-family: monospace; font-size: 11px; color: #6b7280;">
                                ${e.task_id ? e.task_id.substring(0, 12) + '...' : '-'}
                            </td>
                            <td style="padding: 14px; font-size: 13px; color: #6b7280;">
                                ${e.description || '-'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
    }
    
    static getTypeLabel(type) {
        const labels = {
            'task_completion': '任务完成',
            'task_reward': '任务奖励',
            'referral_level1': '一级推荐',
            'referral_level2': '二级推荐',
            'mining': '挖矿',
            'bonus': '奖金'
        };
        return labels[type] || type || '其他';
    }
}

// ========== 8. 收益图表模块 ==========
class EarningsChartRenderer {
    static renderTrendChart(canvasId, trendData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width || 800;
        const height = canvas.height || 300;
        
        // 清空
        ctx.clearRect(0, 0, width, height);
        
        if (!trendData || trendData.length === 0) return;
        
        const padding = 50;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        const maxAmount = Math.max(...trendData.map(d => d.amount), 1);
        
        // 绘制背景网格
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // 绘制数据点
        const points = trendData.map((d, i) => ({
            x: padding + (chartWidth / (trendData.length - 1)) * i,
            y: height - padding - (d.amount / maxAmount) * chartHeight
        }));
        
        // 绘制渐变填充
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, '#10b98160');
        gradient.addColorStop(1, '#10b98100');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(width - padding, height - padding);
        ctx.closePath();
        ctx.fill();
        
        // 绘制折线
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        
        // 绘制数据点
        points.forEach((p, i) => {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 绘制日期标签
            if (i % Math.ceil(trendData.length / 7) === 0) {
                ctx.fillStyle = '#6b7280';
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(trendData[i].dateLabel, p.x, height - padding + 20);
            }
        });
    }
    
    static renderTypeDistribution(canvasId, typeData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width || 400;
        const height = canvas.height || 400;
        
        ctx.clearRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 40;
        
        const types = Object.values(typeData).filter(t => t.amount > 0);
        if (types.length === 0) return;
        
        const total = types.reduce((sum, t) => sum + t.amount, 0);
        
        let startAngle = -Math.PI / 2;
        
        types.forEach(type => {
            const sliceAngle = (type.amount / total) * Math.PI * 2;
            
            ctx.fillStyle = type.color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            
            startAngle += sliceAngle;
        });
        
        // 中心白圈
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // 中心文字
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${total.toFixed(2)}`, centerX, centerY - 10);
        ctx.font = '14px sans-serif';
        ctx.fillText('AIP', centerX, centerY + 15);
    }
}

// 导出
window.EarningsModules = {
    EarningsDataFetcher,
    EarningsCalculator,
    EarningsTrendAnalyzer,
    EarningsTypeClassifier,
    EarningsRanking,
    EarningsWithdrawal,
    EarningsHistory,
    EarningsChartRenderer
};

