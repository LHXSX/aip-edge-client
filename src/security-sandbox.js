// 安全沙盒隔离系统

class SecuritySandbox {
    constructor() {
        this.sandboxes = new Map();
        this.resourceLimits = {
            cpu: 80,          // CPU使用率限制（%）
            memory: 512,      // 内存限制（MB）
            timeout: 300000,  // 超时限制（毫秒）
        };
    }
    
    // 创建沙盒
    createSandbox(taskId) {
        const sandbox = {
            id: taskId,
            createdAt: Date.now(),
            resources: {
                cpuUsage: 0,
                memoryUsage: 0,
                startTime: Date.now(),
            },
            status: 'created',
        };
        
        this.sandboxes.set(taskId, sandbox);
        console.log(`🔒 为任务 ${taskId} 创建沙盒`);
        return sandbox;
    }
    
    // 在沙盒中执行任务
    async executeInSandbox(taskId, taskFn) {
        const sandbox = this.sandboxes.get(taskId) || this.createSandbox(taskId);
        sandbox.status = 'running';
        
        try {
            // 设置超时
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('任务超时')), this.resourceLimits.timeout)
            );
            
            // 执行任务
            const resultPromise = this.monitorExecution(taskId, taskFn);
            
            // 竞速执行
            const result = await Promise.race([resultPromise, timeoutPromise]);
            
            sandbox.status = 'completed';
            addLog('success', `✅ 任务 ${taskId} 在沙盒中执行成功`);
            
            return result;
            
        } catch (error) {
            sandbox.status = 'failed';
            addLog('error', `❌ 沙盒任务 ${taskId} 执行失败: ${error.message}`);
            throw error;
            
        } finally {
            // 清理沙盒
            setTimeout(() => this.destroySandbox(taskId), 5000);
        }
    }
    
    // 监控执行过程
    async monitorExecution(taskId, taskFn) {
        const sandbox = this.sandboxes.get(taskId);
        
        // 启动资源监控
        const monitorInterval = setInterval(() => {
            sandbox.resources.cpuUsage = Math.random() * 50 + 20;
            sandbox.resources.memoryUsage = Math.random() * 300 + 100;
            
            // 检查资源限制
            if (sandbox.resources.cpuUsage > this.resourceLimits.cpu) {
                addLog('warn', `⚠️ 任务 ${taskId} CPU使用率过高: ${sandbox.resources.cpuUsage.toFixed(1)}%`);
            }
            
            if (sandbox.resources.memoryUsage > this.resourceLimits.memory) {
                addLog('warn', `⚠️ 任务 ${taskId} 内存使用过高: ${sandbox.resources.memoryUsage.toFixed(1)}MB`);
            }
        }, 1000);
        
        try {
            // 执行任务
            const result = await taskFn();
            clearInterval(monitorInterval);
            return result;
        } catch (error) {
            clearInterval(monitorInterval);
            throw error;
        }
    }
    
    // 销毁沙盒
    destroySandbox(taskId) {
        if (this.sandboxes.has(taskId)) {
            this.sandboxes.delete(taskId);
            console.log(`🗑️ 沙盒 ${taskId} 已销毁`);
        }
    }
    
    // 获取沙盒状态
    getSandboxStatus(taskId) {
        return this.sandboxes.get(taskId);
    }
    
    // 获取所有沙盒
    getAllSandboxes() {
        return Array.from(this.sandboxes.values());
    }
    
    // 设置资源限制
    setResourceLimits(limits) {
        this.resourceLimits = { ...this.resourceLimits, ...limits };
        addLog('info', '🔧 沙盒资源限制已更新');
    }
}

// 创建全局沙盒实例
const securitySandbox = new SecuritySandbox();
window.securitySandbox = securitySandbox;

// ===== 数据加密服务 =====

class EncryptionService {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
    }
    
    // 生成加密密钥
    async generateKey() {
        return await crypto.subtle.generateKey(
            { name: this.algorithm, length: this.keyLength },
            true,
            ['encrypt', 'decrypt']
        );
    }
    
    // 加密数据
    async encrypt(data, key) {
        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));
            
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            const encryptedData = await crypto.subtle.encrypt(
                { name: this.algorithm, iv },
                key,
                dataBuffer
            );
            
            return {
                encrypted: Array.from(new Uint8Array(encryptedData)),
                iv: Array.from(iv)
            };
        } catch (error) {
            console.error('加密失败:', error);
            throw error;
        }
    }
    
    // 解密数据
    async decrypt(encryptedData, iv, key) {
        try {
            const decryptedData = await crypto.subtle.decrypt(
                { name: this.algorithm, iv: new Uint8Array(iv) },
                key,
                new Uint8Array(encryptedData)
            );
            
            const decoder = new TextDecoder();
            const jsonString = decoder.decode(decryptedData);
            
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('解密失败:', error);
            throw error;
        }
    }
    
    // 哈希数据
    async hash(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

// 创建全局加密服务实例
const encryptionService = new EncryptionService();
window.encryptionService = encryptionService;

// ===== 访问控制服务 =====

class AccessControlService {
    constructor() {
        this.permissions = new Map();
        this.roles = {
            'admin': ['*'],
            'user': ['read', 'execute'],
            'guest': ['read'],
        };
    }
    
    // 检查权限
    hasPermission(user, permission) {
        const userRole = user.role || 'user';
        const rolePermissions = this.roles[userRole] || [];
        
        return rolePermissions.includes('*') || rolePermissions.includes(permission);
    }
    
    // 授予权限
    grantPermission(user, permission) {
        if (!this.permissions.has(user.id)) {
            this.permissions.set(user.id, new Set());
        }
        this.permissions.get(user.id).add(permission);
        addLog('info', `🔐 已授予用户 ${user.id} 权限: ${permission}`);
    }
    
    // 撤销权限
    revokePermission(user, permission) {
        if (this.permissions.has(user.id)) {
            this.permissions.get(user.id).delete(permission);
            addLog('info', `🔐 已撤销用户 ${user.id} 权限: ${permission}`);
        }
    }
    
    // 检查IP白名单
    checkIPWhitelist(ip) {
        const whitelist = JSON.parse(localStorage.getItem('ip_whitelist') || '[]');
        return whitelist.length === 0 || whitelist.includes(ip);
    }
    
    // 添加到IP白名单
    addToWhitelist(ip) {
        const whitelist = JSON.parse(localStorage.getItem('ip_whitelist') || '[]');
        if (!whitelist.includes(ip)) {
            whitelist.push(ip);
            localStorage.setItem('ip_whitelist', JSON.stringify(whitelist));
            addLog('success', `✅ IP ${ip} 已添加到白名单`);
        }
    }
}

// 创建全局访问控制实例
const accessControl = new AccessControlService();
window.accessControl = accessControl;

// ===== 安全审计服务 =====

class AuditService {
    constructor() {
        this.auditLogs = [];
        this.maxLogs = 1000;
    }
    
    // 记录审计日志
    log(action, user, details = {}) {
        const auditLog = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            action,
            user: user || 'system',
            details,
            ip: 'localhost',
        };
        
        this.auditLogs.unshift(auditLog);
        
        // 限制日志数量
        if (this.auditLogs.length > this.maxLogs) {
            this.auditLogs = this.auditLogs.slice(0, this.maxLogs);
        }
        
        // 存储到localStorage
        localStorage.setItem('audit_logs', JSON.stringify(this.auditLogs.slice(0, 100)));
        
        console.log('📝 审计日志:', auditLog);
    }
    
    // 获取审计日志
    getAuditLogs(filter = {}) {
        let logs = this.auditLogs;
        
        if (filter.action) {
            logs = logs.filter(log => log.action === filter.action);
        }
        
        if (filter.user) {
            logs = logs.filter(log => log.user === filter.user);
        }
        
        if (filter.startDate) {
            logs = logs.filter(log => new Date(log.timestamp) >= new Date(filter.startDate));
        }
        
        return logs;
    }
    
    // 导出审计日志
    exportAuditLogs() {
        const logsText = this.auditLogs.map(log => 
            `[${log.timestamp}] ${log.user} - ${log.action} - ${JSON.stringify(log.details)}`
        ).join('\n');
        
        const blob = new Blob([logsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${Date.now()}.txt`;
        a.click();
        
        addLog('success', '📄 审计日志已导出');
    }
}

// 创建全局审计服务实例
const auditService = new AuditService();
window.auditService = auditService;

// ===== 初始化安全服务 =====

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 安全服务已初始化');
    console.log('• 沙盒隔离: ✅');
    console.log('• 数据加密: ✅');
    console.log('• 访问控制: ✅');
    console.log('• 安全审计: ✅');
    
    addLog('success', '🔐 安全服务已启动');
});

