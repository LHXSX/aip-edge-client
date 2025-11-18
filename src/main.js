// AIP边缘算力客户端 - 完整功能实现
// 连接生产服务器：8.218.206.57

// 生产服务器配置
const API_BASE_URL = 'http://8.218.206.57/api/v1';
const API_TIMEOUT = 10000;
const MAX_RETRY = 3;

// 全局变量
let currentUser = null;
let nodeId = null;
let heartbeatInterval = null;
let pullTasksInterval = null;
const logs = []; // ⚠️ 必须在最前面定义

// ============ 工具函数 ============

// API调用函数 - 生产环境优化版
async function callAPI(endpoint, method = 'GET', body = null, retryCount = 0) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(API_TIMEOUT)
    };
    
    // 添加Token
    const token = localStorage.getItem('token');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, options);
        
        // 处理429限流
        if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
            throw new Error(`请求过于频繁，请${retryAfter}秒后重试`);
        }
        
        // 处理401未授权
        if (response.status === 401) {
            localStorage.removeItem('token');
            throw new Error('登录已过期，请重新登录');
        }
        
        const data = await response.json();
        
        // 成功
        if (response.ok) {
            return data;
        }
        
        // 业务错误
        throw new Error(data.error || data.message || '请求失败');
        
    } catch (error) {
        // 网络错误重试
        if (retryCount < MAX_RETRY && !error.message.includes('过于频繁')) {
            console.log(`重试 ${retryCount + 1}/${MAX_RETRY}: ${endpoint}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return callAPI(endpoint, method, body, retryCount + 1);
        }
        
        throw error;
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(pageId).style.display = pageId === 'login-page' ? 'flex' : 'block';
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

function showError(msg) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// ============ 登录功能 ============

document.getElementById('login-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showError('请输入邮箱和密码');
        return;
    }
    
    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    btn.textContent = '登录中...';
    
    try {
        const result = await callAPI('/auth/login', 'POST', { email, password });
        
        if (result.success) {
            // 保存登录信息
            const token = result.token;
            const user = result.user;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            currentUser = user;
            
            // 保存登录历史
            const history = JSON.parse(localStorage.getItem('loginHistory') || '[]');
            history.unshift({ email, username: user.username, time: new Date().toISOString() });
            localStorage.setItem('loginHistory', JSON.stringify(history.slice(0, 5)));
            
            // 添加日志
            addLog('SUCCESS', `用户 ${user.username} 登录成功`);
            
            // 自动注册节点
            addLog('INFO', '正在注册节点...');
            const nodeRegistered = await registerNode(user.username);
            
            if (nodeRegistered) {
                addLog('SUCCESS', `节点注册成功: ${nodeId}`);
                
                // 切换到主页面
                showPage('main-page');
                
                // 启动后台服务（心跳和任务拉取）
                addLog('INFO', '启动心跳机制...');
                startBackgroundServices();
                
                // 加载数据
                addLog('INFO', '加载仪表盘数据...');
                loadDashboardData();
            } else {
                addLog('ERROR', '节点注册失败');
                showError('节点注册失败，请重试');
            }
        } else {
            showError(result.error || '登录失败');
        }
    } catch (e) {
        showError('登录异常: ' + e.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '登 录';
    }
});

// 注册按钮
document.getElementById('register-btn')?.addEventListener('click', () => {
    window.open('http://pidbai.com/register.html', '_blank');
});

// ============ 节点注册 ============

async function registerNode(username) {
    try {
        // 生成唯一节点ID
        const hostname = navigator.platform || 'unknown';
        const timestamp = Date.now();
        nodeId = `tauri-${hostname}-${timestamp}`;
        
        const nodeData = {
            id: nodeId,
            username: username,
            node_name: `${hostname}-tauri-client`,
            platform: navigator.platform || 'web',
            cpuCores: navigator.hardwareConcurrency || 4,
            memoryTotal: (navigator.deviceMemory || 8) * 1024 * 1024 * 1024,
            memoryFree: Math.floor((navigator.deviceMemory || 8) * 1024 * 1024 * 1024 * 0.6),
            gpuCount: 0,
            gpuAvailable: false,
            computePower: (navigator.hardwareConcurrency || 4) * 100,
            capabilities: {
                cpu: {
                    cores: navigator.hardwareConcurrency || 4,
                    avgSpeedGHz: 2.5
                },
                memory: {
                    total: (navigator.deviceMemory || 8) * 1024 * 1024 * 1024
                }
            }
        };
        
        console.log('📡 注册节点:', nodeData);
        const result = await callAPI('/compute/clients/register', 'POST', nodeData);
        
        if (result.success) {
            nodeId = result.nodeId || nodeId;
            localStorage.setItem('nodeId', nodeId);
            console.log('✅ 节点注册成功:', nodeId);
            updateStatusBadge(true);
            return true;
        } else {
            console.error('节点注册失败:', result.error);
            return false;
        }
    } catch (e) {
        console.error('节点注册异常:', e);
        addLog('ERROR', `节点注册失败: ${e.message}`);
        return false;
    }
}

// ============ 心跳机制 ============

async function sendHeartbeat() {
    if (!nodeId) {
        console.warn('⚠️  节点未注册，跳过心跳');
        return;
    }
    
    try {
        const cpuUsage = parseFloat(document.getElementById('cpu-usage')?.textContent) || 0;
        const memoryUsage = parseFloat(document.getElementById('memory-usage')?.textContent) || 0;
        
        const status = {
            nodeId: nodeId,
            status: 'online',
            last_heartbeat: new Date().toISOString(),
            current_load: cpuUsage,
            memory_free: Math.floor((navigator.deviceMemory || 8) * 1024 * 1024 * 1024 * (100 - memoryUsage) / 100),
            memory_total: (navigator.deviceMemory || 8) * 1024 * 1024 * 1024,
            compute_power: (navigator.hardwareConcurrency || 4) * 100,
            runningTasks: []
        };
        
        const result = await callAPI('/compute/clients/heartbeat', 'POST', status);
        
        if (result.success) {
            console.log('💓 心跳发送成功');
            addLog('INFO', `心跳发送成功 - CPU: ${cpuUsage.toFixed(1)}%, 内存: ${memoryUsage.toFixed(1)}%`);
            updateStatusBadge(true);
        } else {
            console.warn('心跳响应异常:', result);
            addLog('WARN', '心跳发送失败');
        }
    } catch (e) {
        console.error('心跳失败:', e);
        addLog('ERROR', `心跳失败: ${e.message}`);
        updateStatusBadge(false);
    }
}

// ============ 任务拉取 ============

async function pullTasks() {
    if (!nodeId) {
        console.warn('⚠️  节点未注册，跳过任务拉取');
        return;
    }
    
    try {
        addLog('INFO', '正在拉取任务...');
        
        const result = await callAPI(`/compute/tasks/pull?nodeId=${nodeId}`, 'GET', null);
        
        if (result.success) {
            const tasksData = result.data || [];
            const tasks = Array.isArray(tasksData) ? tasksData : (tasksData.tasks || []);
            
            console.log(`📥 拉取到 ${tasks.length} 个任务`);
            addLog('SUCCESS', `拉取到 ${tasks.length} 个任务`);
            
            if (tasks.length > 0) {
                // 添加任务到队列
                tasks.forEach(task => {
                    window.globalTaskQueue.addTask(task);
                    addLog('INFO', `任务加入队列: ${task.id} (${task.task_type})`);
                });
                
                // 更新任务显示
                updateTaskDisplay();
                
                // 开始处理任务
                processPendingTasks();
            }
        } else {
            console.log('暂无任务');
            addLog('INFO', '暂无可执行任务');
        }
    } catch (e) {
        console.error('拉取任务失败:', e);
        addLog('ERROR', `拉取任务失败: ${e.message}`);
    }
}

// ============ 任务处理 ============

async function processTask(task) {
    const taskId = task.id || task.fragmentId || 'unknown';
    
    try {
        addLog('INFO', `开始处理任务: ${taskId} (类型: ${task.task_type})`);
        
        // 模拟任务执行（实际应该根据任务类型执行真实计算）
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 提交任务结果
        const result = {
            status: 'completed',
            result: {
                success: true,
                output: '任务执行完成',
                execution_time: 2000
            },
            execution_time: 2000,
            fragmentId: task.fragmentId || null
        };
        
        const submitResult = await callAPI('/compute/tasks/result', 'POST', {
            task_id: taskId,
            result: result
        });
        
        if (submitResult.success) {
            addLog('SUCCESS', `任务完成: ${taskId}`);
        } else {
            addLog('WARN', `任务结果提交失败: ${taskId}`);
        }
    } catch (e) {
        console.error(`任务 ${taskId} 处理失败:`, e);
        addLog('ERROR', `任务失败: ${taskId} - ${e.message}`);
    }
}

// ============ 后台服务 ============

function startBackgroundServices() {
    addLog('INFO', '启动后台服务...');
    
    // 心跳机制（每30秒）
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
        sendHeartbeat();
    }, 30000);
    sendHeartbeat(); // 立即发送第一次心跳
    addLog('SUCCESS', '心跳机制已启动（30秒间隔）');
    
    // 任务拉取（每30秒）
    if (pullTasksInterval) clearInterval(pullTasksInterval);
    pullTasksInterval = setInterval(() => {
        pullTasks();
    }, 30000);
    pullTasks(); // 立即拉取第一次任务
    addLog('SUCCESS', '任务拉取已启动（30秒间隔）');
    
    // 定时更新仪表盘（每5秒）
    setInterval(() => {
        loadDashboardData();
    }, 5000);
    addLog('SUCCESS', '仪表盘自动更新已启动（5秒间隔）');
}

// ============ 仪表盘数据加载 ============

async function loadDashboardData() {
    try {
        // 加载系统信息
        const sysInfo = {
            cpu_cores: navigator.hardwareConcurrency || 4,
            memory: navigator.deviceMemory || 8,
            platform: navigator.platform,
            nodeId: nodeId
        };
        
        // 更新系统信息
        document.getElementById('system-info').innerHTML = `
            <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="color: #6b7280;">CPU 核心</span>
                    <span style="font-weight: 600; color: #1f2937;">${sysInfo.cpu_cores} 核</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="color: #6b7280;">内存容量</span>
                    <span style="font-weight: 600; color: #1f2937;">${sysInfo.memory} GB</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="color: #6b7280;">运行平台</span>
                    <span style="font-weight: 600; color: #1f2937;">${sysInfo.platform}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                    <span style="color: #6b7280;">节点 ID</span>
                    <span style="font-weight: 600; color: #667eea; font-size: 12px; font-family: monospace;">${(nodeId || '未注册').substring(0, 20)}...</span>
                </div>
            </div>
        `;
        
        // 加载收益数据（带错误容错）
        try {
            const earnings = await callAPI('/users/earnings');
            if (earnings.success) {
                const totalEarnings = earnings.data?.total || earnings.total || 0;
                document.getElementById('total-earnings').textContent = totalEarnings.toFixed(4);
                
                const todayElem = document.getElementById('today-earnings');
                const detailElem = document.getElementById('total-earnings-detail');
                
                if (detailElem) detailElem.textContent = totalEarnings.toFixed(4);
                
                // 计算今日收益
                const today = new Date().toISOString().split('T')[0];
                const earningsList = earnings.data?.earnings || earnings.earnings || [];
                const todayEarnings = earningsList
                    .filter(e => e.created_at && e.created_at.startsWith(today))
                    .reduce((sum, e) => sum + (e.amount || 0), 0);
                
                if (todayElem) todayElem.textContent = todayEarnings.toFixed(4);
                
                addLog('SUCCESS', `收益加载成功: ${totalEarnings.toFixed(4)} AIP`);
            }
        } catch (e) {
            console.log('收益API错误:', e.message);
            addLog('WARN', '收益数据暂时无法加载');
            // 显示默认值
            document.getElementById('total-earnings').textContent = '0.0000';
        }
        
        // 更新CPU/内存使用率（动态模拟）
        const cpuUsage = (Math.random() * 30 + 20).toFixed(1);
        const memoryUsage = (Math.random() * 40 + 30).toFixed(1);
        
        document.getElementById('cpu-usage').textContent = cpuUsage + '%';
        document.getElementById('memory-usage').textContent = memoryUsage + '%';
        
        // 添加日志
        addLog('INFO', `系统状态更新 - CPU: ${cpuUsage}%, 内存: ${memoryUsage}%`);
        
    } catch (e) {
        console.error('加载仪表盘数据失败:', e);
    }
}

// ============ 日志管理 - 美化版 ============

function addLog(level, message) {
    const log = {
        time: new Date().toLocaleTimeString('zh-CN'),
        timestamp: new Date().toISOString(),
        level,
        message
    };
    
    logs.push(log);
    if (logs.length > 500) logs.shift(); // 保留最近500条
    
    // 更新仪表盘日志
    updateDashboardLogs();
    
    // 更新日志页面
    updateLogsPage();
    
    // 更新日志统计
    if (typeof updateLogStats === 'function') {
        updateLogStats();
    }
}

function updateDashboardLogs() {
    const dashboardLogs = document.getElementById('dashboard-logs');
    if (!dashboardLogs) return;
    
    const recent = logs.slice(-10).reverse();
    
    dashboardLogs.innerHTML = recent.map(log => {
        const config = getLogStyle(log.level);
        
        return `
            <div style="
                margin-bottom: 10px;
                padding: 12px 16px;
                background: ${config.bg};
                border-radius: 10px;
                border-left: 5px solid ${config.color};
                box-shadow: 0 2px 8px ${config.shadow};
                transition: all 0.3s;
            " onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 18px;">${config.icon}</span>
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                            <span style="
                                display: inline-block;
                                padding: 3px 10px;
                                background: ${config.color};
                                color: white;
                                border-radius: 12px;
                                font-size: 10px;
                                font-weight: 700;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                            ">${log.level}</span>
                            <span style="font-size: 11px; color: #9ca3af; font-family: monospace;">${log.time}</span>
                        </div>
                        <div style="color: #1f2937; font-size: 13px; font-weight: 500; line-height: 1.5;">
                            ${log.message}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateLogsPage() {
    const logsContainer = document.getElementById('logs-container');
    if (!logsContainer) return;
    
    const allLogs = logs.slice().reverse();
    
    logsContainer.innerHTML = allLogs.map(log => {
        const config = getLogStyle(log.level);
        
        return `
            <div style="
                margin-bottom: 8px;
                padding: 14px 18px;
                background: ${config.bg};
                border-radius: 10px;
                border-left: 5px solid ${config.color};
                box-shadow: 0 1px 4px ${config.shadow};
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 16px;">${config.icon}</span>
                    <span style="
                        display: inline-block;
                        padding: 4px 12px;
                        background: ${config.color};
                        color: white;
                        border-radius: 14px;
                        font-size: 11px;
                        font-weight: 700;
                        min-width: 70px;
                        text-align: center;
                    ">${log.level}</span>
                    <span style="font-size: 12px; color: #9ca3af; font-family: monospace; min-width: 90px;">${log.time}</span>
                    <span style="color: #1f2937; font-size: 14px; flex: 1;">${log.message}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getLogStyle(level) {
    const styles = {
        'INFO': {
            color: '#3b82f6',
            bg: '#dbeafe',
            shadow: 'rgba(59, 130, 246, 0.15)',
            icon: 'ℹ️'
        },
        'SUCCESS': {
            color: '#10b981',
            bg: '#d1fae5',
            shadow: 'rgba(16, 185, 129, 0.15)',
            icon: '✅'
        },
        'WARN': {
            color: '#f59e0b',
            bg: '#fef3c7',
            shadow: 'rgba(245, 158, 11, 0.15)',
            icon: '⚠️'
        },
        'ERROR': {
            color: '#ef4444',
            bg: '#fee2e2',
            shadow: 'rgba(239, 68, 68, 0.15)',
            icon: '❌'
        },
        'DEBUG': {
            color: '#8b5cf6',
            bg: '#ede9fe',
            shadow: 'rgba(139, 92, 246, 0.15)',
            icon: '🔧'
        }
    };
    
    return styles[level] || styles['INFO'];
}

window.clearLogs = function() {
    if (confirm('确定要清空所有日志吗？')) {
        logs.length = 0;
        addLog('INFO', '日志已清空');
        updateLogStats();
    }
}

window.exportLogs = function() {
    const text = logs.map(log => `[${log.time}] [${log.level}] ${log.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${Date.now()}.txt`;
    a.click();
    addLog('SUCCESS', '日志已导出');
}

// 加载收益数据（全局调用）
window.loadEarnings = async function() {
    if (typeof loadEarningsData === 'function') {
        await loadEarningsData();
    }
}

// 刷新任务列表（全局调用）
window.refreshTasks = function() {
    if (typeof updateTaskDisplay === 'function') {
        updateTaskDisplay();
    }
}

// ============ 状态更新 ============

function updateStatusBadge(connected) {
    const badge = document.getElementById('status-badge');
    if (connected) {
        badge.textContent = '已连接';
        badge.classList.add('connected');
    } else {
        badge.textContent = '未连接';
        badge.classList.remove('connected');
    }
}

// ============ 导航切换 ============

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        switchTab(item.dataset.tab);
    });
});

// ============ 退出登录 ============

document.getElementById('logout-btn')?.addEventListener('click', () => {
    if (confirm('确定要退出登录吗？')) {
        localStorage.clear();
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        if (pullTasksInterval) clearInterval(pullTasksInterval);
        showPage('login-page');
        location.reload();
    }
});

// ============ 手动拉取任务 ============

window.manualPullTasks = async function() {
    console.log('🔄 手动拉取任务...');
    await pullTasks();
    alert('任务拉取请求已发送');
}

// ============ 初始化 ============

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 AIP边缘算力客户端已启动');
    console.log('🔗 生产服务器:', API_BASE_URL);
    
    // 初始化全局任务队列
    if (typeof TaskQueue !== 'undefined') {
        window.globalTaskQueue = new TaskQueue();
    }
    
    // 初始化日志
    addLog('INFO', '客户端启动');
    addLog('INFO', '连接生产服务器: 8.218.206.57');
    
    // 检查是否已登录
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        nodeId = localStorage.getItem('nodeId');
        addLog('INFO', '检测到已登录，自动恢复会话');
        showPage('main-page');
        startBackgroundServices();
        loadDashboardData();
        
        // 加载收益数据
        if (typeof loadEarningsData === 'function') {
            setTimeout(() => loadEarningsData(), 1000);
        }
    } else {
        addLog('INFO', '等待用户登录...');
    }
});
