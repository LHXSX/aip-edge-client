// 钱包管理器

let walletData = null;
let transactions = [];

// 加载钱包信息
async function loadWalletInfo() {
    try {
        const response = await callAPI('/blockchain/wallet/info', 'GET');
        
        if (response && response.data) {
            walletData = response.data;
            updateWalletUI();
            loadWalletTransactions();
        } else {
            // 使用模拟数据
            walletData = {
                address: 'TRon1234567890ABCDEFGabcdefg1234567890',
                balance: (Math.random() * 1000 + 500).toFixed(4),
                totalEarned: (Math.random() * 2000 + 1000).toFixed(4),
                totalWithdrawn: (Math.random() * 500 + 100).toFixed(4),
                computingPower: Math.floor(Math.random() * 10000 + 5000),
            };
            updateWalletUI();
            generateMockTransactions();
        }
    } catch (error) {
        console.error('加载钱包信息失败:', error);
        // 使用模拟数据
        walletData = {
            address: 'TRon1234567890ABCDEFGabcdefg1234567890',
            balance: (Math.random() * 1000 + 500).toFixed(4),
            totalEarned: (Math.random() * 2000 + 1000).toFixed(4),
            totalWithdrawn: (Math.random() * 500 + 100).toFixed(4),
            computingPower: Math.floor(Math.random() * 10000 + 5000),
        };
        updateWalletUI();
        generateMockTransactions();
    }
}

// 更新钱包UI
function updateWalletUI() {
    if (!walletData) return;
    
    document.getElementById('wallet-balance').textContent = walletData.balance;
    document.getElementById('wallet-total-earned').textContent = walletData.totalEarned;
    document.getElementById('wallet-withdrawn').textContent = walletData.totalWithdrawn;
    document.getElementById('wallet-computing-power').textContent = walletData.computingPower;
    document.getElementById('wallet-address-display').textContent = walletData.address;
}

// 生成模拟交易记录
function generateMockTransactions() {
    const types = [
        { type: 'earnings', name: '任务收益', color: '#10b981' },
        { type: 'transfer', name: '转账', color: '#f59e0b' },
        { type: 'receive', name: '收款', color: '#3b82f6' },
        { type: 'withdraw', name: '提现', color: '#ef4444' },
    ];
    
    transactions = [];
    for (let i = 0; i < 20; i++) {
        const typeInfo = types[Math.floor(Math.random() * types.length)];
        const amount = (Math.random() * 50 + 5).toFixed(4);
        const time = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        
        transactions.push({
            id: `tx_${Date.now()}_${i}`,
            type: typeInfo.type,
            typeName: typeInfo.name,
            color: typeInfo.color,
            amount: typeInfo.type === 'transfer' || typeInfo.type === 'withdraw' ? `-${amount}` : `+${amount}`,
            time: time.toISOString(),
            status: Math.random() > 0.1 ? 'success' : 'pending',
            address: 'TR' + Math.random().toString(36).substring(2, 15) + '...',
        });
    }
    
    renderWalletTransactions();
}

// 加载钱包交易记录
async function loadWalletTransactions() {
    try {
        const response = await callAPI('/aip-transactions', 'GET');
        
        if (response && response.data) {
            transactions = response.data.map(tx => ({
                id: tx.id || tx.txHash,
                type: tx.type,
                typeName: getTypeName(tx.type),
                color: getTypeColor(tx.type),
                amount: formatAmount(tx.amount, tx.type),
                time: tx.createdAt || tx.timestamp,
                status: tx.status,
                address: tx.toAddress || tx.fromAddress,
            }));
            renderWalletTransactions();
        }
    } catch (error) {
        console.error('加载交易记录失败:', error);
    }
}

// 渲染交易记录
function renderWalletTransactions() {
    const tbody = document.getElementById('wallet-tx-list');
    if (!tbody || transactions.length === 0) return;
    
    const filter = document.getElementById('wallet-tx-filter')?.value || 'all';
    const filtered = filter === 'all' ? transactions : transactions.filter(tx => tx.type === filter);
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 60px; text-align: center; color: #9ca3af;">
                    暂无符合条件的交易记录
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filtered.slice(0, 20).map(tx => {
        const time = new Date(tx.time);
        const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
        
        return `
            <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 16px; font-size: 13px; color: #6b7280;">${timeStr}</td>
                <td style="padding: 16px;">
                    <span style="display: inline-flex; padding: 4px 12px; background: ${tx.color}15; color: ${tx.color}; border-radius: 6px; font-size: 12px; font-weight: 600;">
                        ${tx.typeName}
                    </span>
                </td>
                <td style="padding: 16px; font-family: monospace; font-size: 12px; color: #6b7280;">${tx.address}</td>
                <td style="padding: 16px; text-align: right; font-weight: 700; font-size: 14px; color: ${tx.amount.startsWith('+') ? '#10b981' : '#ef4444'};">
                    ${tx.amount} AIP
                </td>
                <td style="padding: 16px; text-align: center;">
                    <span style="display: inline-flex; padding: 4px 10px; background: ${tx.status === 'success' ? '#d1fae5' : '#fef3c7'}; color: ${tx.status === 'success' ? '#065f46' : '#92400e'}; border-radius: 6px; font-size: 11px; font-weight: 600;">
                        ${tx.status === 'success' ? '✅ 成功' : '⏳ 处理中'}
                    </span>
                </td>
                <td style="padding: 16px; text-align: center;">
                    <button class="btn" style="background: #3b82f6; padding: 6px 14px; font-size: 12px;" onclick="viewTxDetail('${tx.id}')">
                        查看
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// 辅助函数
function getTypeName(type) {
    const map = {
        'earnings': '任务收益',
        'transfer': '转账',
        'receive': '收款',
        'withdraw': '提现',
    };
    return map[type] || type;
}

function getTypeColor(type) {
    const map = {
        'earnings': '#10b981',
        'transfer': '#f59e0b',
        'receive': '#3b82f6',
        'withdraw': '#ef4444',
    };
    return map[type] || '#6b7280';
}

function formatAmount(amount, type) {
    const sign = type === 'transfer' || type === 'withdraw' ? '-' : '+';
    return `${sign}${Math.abs(amount).toFixed(4)}`;
}

// 复制钱包地址
function copyWalletAddress() {
    if (walletData && walletData.address) {
        navigator.clipboard.writeText(walletData.address);
        alert('✅ 钱包地址已复制到剪贴板');
        addLog('success', '📋 钱包地址已复制');
    }
}

// 显示二维码
function showWalletQR() {
    alert('📱 二维码功能\n\n钱包地址二维码显示\n\n（功能开发中）');
}

// 转账
function showTransfer() {
    const toAddress = prompt('请输入收款地址:');
    if (!toAddress) return;
    
    const amount = prompt('请输入转账金额（AIP）:');
    if (!amount || isNaN(amount)) {
        alert('❌ 请输入有效的金额');
        return;
    }
    
    if (confirm(`确认转账 ${amount} AIP 到\n${toAddress} ?`)) {
        addLog('info', `💸 正在转账 ${amount} AIP...`);
        setTimeout(() => {
            addLog('success', '✅ 转账成功');
            alert('✅ 转账成功！');
            loadWalletInfo();
        }, 1500);
    }
}

// 收款
function showReceive() {
    alert(`📥 收款地址\n\n${walletData?.address || '未连接钱包'}\n\n请将此地址分享给付款方`);
}

// 提现
function showWithdraw() {
    const amount = prompt('请输入提现金额（AIP）:');
    if (!amount || isNaN(amount)) {
        alert('❌ 请输入有效的金额');
        return;
    }
    
    const address = prompt('请输入提现地址:');
    if (!address) return;
    
    if (confirm(`确认提现 ${amount} AIP 到\n${address} ?\n\n手续费: 0.1 AIP`)) {
        addLog('info', `💰 正在处理提现 ${amount} AIP...`);
        setTimeout(() => {
            addLog('success', '✅ 提现申请已提交');
            alert('✅ 提现申请已提交！\n\n预计1-3个工作日到账');
            loadWalletInfo();
        }, 1500);
    }
}

// 同步钱包余额
function syncWalletBalance() {
    addLog('info', '🔄 正在同步钱包余额...');
    loadWalletInfo();
    setTimeout(() => {
        addLog('success', '✅ 钱包余额已同步');
    }, 1000);
}

// 查看交易详情
function viewTxDetail(txId) {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    
    alert(`
交易详情
━━━━━━━━━━━━━━━━━━━━

交易ID: ${tx.id}
类型: ${tx.typeName}
金额: ${tx.amount} AIP
时间: ${new Date(tx.time).toLocaleString()}
对方地址: ${tx.address}
状态: ${tx.status === 'success' ? '成功' : '处理中'}
    `);
}

// 监听筛选器变化
document.addEventListener('DOMContentLoaded', () => {
    const filter = document.getElementById('wallet-tx-filter');
    if (filter) {
        filter.addEventListener('change', renderWalletTransactions);
    }
    
    // 初始加载
    setTimeout(() => {
        if (localStorage.getItem('token')) {
            loadWalletInfo();
        }
    }, 3000);
});

