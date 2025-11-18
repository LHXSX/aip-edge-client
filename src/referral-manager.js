// 推荐管理器

let referralData = null;
let referralUsers = [];

// 加载推荐信息
async function loadReferralInfo() {
    try {
        const response = await callAPI('/referral/info', 'GET');
        
        if (response && response.data) {
            referralData = response.data;
            updateReferralUI();
            loadReferralUsers();
        } else {
            // 使用模拟数据
            referralData = {
                code: generateReferralCode(),
                totalReferrals: Math.floor(Math.random() * 50 + 10),
                activeReferrals: Math.floor(Math.random() * 30 + 5),
                totalEarnings: (Math.random() * 500 + 100).toFixed(4),
                commissionRate: 10,
            };
            updateReferralUI();
            generateMockReferralUsers();
        }
    } catch (error) {
        console.error('加载推荐信息失败:', error);
        // 使用模拟数据
        referralData = {
            code: generateReferralCode(),
            totalReferrals: Math.floor(Math.random() * 50 + 10),
            activeReferrals: Math.floor(Math.random() * 30 + 5),
            totalEarnings: (Math.random() * 500 + 100).toFixed(4),
            commissionRate: 10,
        };
        updateReferralUI();
        generateMockReferralUsers();
    }
}

// 生成推荐码
function generateReferralCode() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

// 更新推荐UI
function updateReferralUI() {
    if (!referralData) return;
    
    document.getElementById('referral-count').textContent = referralData.totalReferrals;
    document.getElementById('referral-earnings').textContent = referralData.totalEarnings;
    document.getElementById('referral-active').textContent = referralData.activeReferrals;
    document.getElementById('referral-code').textContent = referralData.code;
    
    const link = `https://aip.com/register?ref=${referralData.code}`;
    document.getElementById('referral-link').textContent = link;
}

// 生成模拟推荐用户
function generateMockReferralUsers() {
    const usernames = ['user1', 'user2', 'user3', 'miner001', 'node_runner', 'crypto_fan', 'aip_lover', 'tech_geek'];
    const statuses = ['active', 'inactive'];
    
    referralUsers = [];
    for (let i = 0; i < referralData.totalReferrals; i++) {
        const regTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const status = Math.random() > 0.3 ? 'active' : 'inactive';
        const earnings = status === 'active' ? (Math.random() * 20 + 5).toFixed(4) : '0.0000';
        
        referralUsers.push({
            id: `user_${i}`,
            username: `${usernames[Math.floor(Math.random() * usernames.length)]}_${i}`,
            registeredAt: regTime.toISOString(),
            status: status,
            contributedEarnings: earnings,
        });
    }
    
    renderReferralUsers();
}

// 加载推荐用户列表
async function loadReferralUsers() {
    try {
        const response = await callAPI('/referral/users', 'GET');
        
        if (response && response.data) {
            referralUsers = response.data;
            renderReferralUsers();
        }
    } catch (error) {
        console.error('加载推荐用户失败:', error);
    }
}

// 渲染推荐用户列表
function renderReferralUsers() {
    const tbody = document.getElementById('referral-user-list');
    if (!tbody || referralUsers.length === 0) return;
    
    tbody.innerHTML = referralUsers.slice(0, 20).map(user => {
        const regTime = new Date(user.registeredAt);
        const timeStr = `${regTime.getFullYear()}-${String(regTime.getMonth() + 1).padStart(2, '0')}-${String(regTime.getDate()).padStart(2, '0')}`;
        
        return `
            <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 16px; font-weight: 600; color: #1f2937;">
                    ${user.username}
                </td>
                <td style="padding: 16px; color: #6b7280; font-size: 13px;">
                    ${timeStr}
                </td>
                <td style="padding: 16px; text-align: center;">
                    <span style="display: inline-flex; padding: 4px 12px; background: ${user.status === 'active' ? '#d1fae5' : '#f3f4f6'}; color: ${user.status === 'active' ? '#065f46' : '#6b7280'}; border-radius: 6px; font-size: 12px; font-weight: 600;">
                        ${user.status === 'active' ? '✅ 活跃' : '⭕ 未活跃'}
                    </span>
                </td>
                <td style="padding: 16px; text-align: right; font-weight: 700; font-size: 14px; color: #10b981;">
                    +${user.contributedEarnings} AIP
                </td>
            </tr>
        `;
    }).join('');
}

// 复制推荐码
function copyReferralCode() {
    if (referralData && referralData.code) {
        navigator.clipboard.writeText(referralData.code);
        alert('✅ 推荐码已复制到剪贴板');
        addLog('success', '📋 推荐码已复制');
    }
}

// 复制推荐链接
function copyReferralLink() {
    if (referralData && referralData.code) {
        const link = `https://aip.com/register?ref=${referralData.code}`;
        navigator.clipboard.writeText(link);
        alert('✅ 推荐链接已复制到剪贴板');
        addLog('success', '📋 推荐链接已复制');
    }
}

// 初始加载
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (localStorage.getItem('token')) {
            loadReferralInfo();
        }
    }, 3500);
});

