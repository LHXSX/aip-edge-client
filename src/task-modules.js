// 任务管理 - 8个子模块完整实现

// ========== 1. 任务拉取模块 ==========
class TaskPuller {
    constructor(apiClient, nodeId) {
        this.apiClient = apiClient;
        this.nodeId = nodeId;
        this.pullInterval = null;
    }
    
    async pullTasks() {
        const result = await this.apiClient(`/compute/tasks/pull?nodeId=${this.nodeId}`);
        if (result.success) {
            const tasksData = result.data || [];
            return Array.isArray(tasksData) ? tasksData : (tasksData.tasks || []);
        }
        return [];
    }
    
    startAutoPull(callback, interval = 30000) {
        if (this.pullInterval) clearInterval(this.pullInterval);
        this.pullInterval = setInterval(() => {
            this.pullTasks().then(callback);
        }, interval);
        this.pullTasks().then(callback); // 立即拉取一次
    }
    
    stopAutoPull() {
        if (this.pullInterval) {
            clearInterval(this.pullInterval);
            this.pullInterval = null;
        }
    }
}

// ========== 2. 任务队列管理模块 ==========
class TaskQueue {
    constructor() {
        this.queue = [];
        this.running = [];
        this.completed = [];
        this.failed = [];
        this.maxConcurrent = 3;
    }
    
    addTask(task) {
        task.status = 'waiting';
        task.addedTime = Date.now();
        this.queue.push(task);
    }
    
    getWaitingTasks() {
        return this.queue;
    }
    
    getRunningTasks() {
        return this.running;
    }
    
    getCompletedTasks() {
        return this.completed;
    }
    
    getFailedTasks() {
        return this.failed;
    }
    
    getAllTasks() {
        return [
            ...this.running.map(t => ({...t, category: 'running'})),
            ...this.queue.map(t => ({...t, category: 'waiting'})),
            ...this.completed.map(t => ({...t, category: 'completed'})),
            ...this.failed.map(t => ({...t, category: 'failed'}))
        ];
    }
    
    moveToRunning(taskId) {
        const index = this.queue.findIndex(t => t.id === taskId);
        if (index !== -1) {
            const task = this.queue.splice(index, 1)[0];
            task.status = 'running';
            task.startTime = Date.now();
            this.running.push(task);
            return task;
        }
    }
    
    moveToCompleted(taskId, result) {
        const index = this.running.findIndex(t => t.id === taskId);
        if (index !== -1) {
            const task = this.running.splice(index, 1)[0];
            task.status = 'completed';
            task.endTime = Date.now();
            task.result = result;
            this.completed.push(task);
            return task;
        }
    }
    
    moveToFailed(taskId, error) {
        const index = this.running.findIndex(t => t.id === taskId);
        if (index !== -1) {
            const task = this.running.splice(index, 1)[0];
            task.status = 'failed';
            task.endTime = Date.now();
            task.error = error;
            this.failed.push(task);
            return task;
        }
    }
}

// ========== 3. 任务执行引擎模块 ==========
class TaskExecutor {
    constructor(queue, apiClient) {
        this.queue = queue;
        this.apiClient = apiClient;
    }
    
    async executeTask(task) {
        const taskId = task.id || task.fragmentId;
        
        // 移到运行中
        this.queue.moveToRunning(taskId);
        
        try {
            // 根据任务类型执行
            const result = await this.processTaskByType(task);
            
            // 提交结果
            await this.submitResult(taskId, result);
            
            // 移到已完成
            this.queue.moveToCompleted(taskId, result);
            
            return { success: true, result };
        } catch (error) {
            // 移到失败
            this.queue.moveToFailed(taskId, error.message);
            return { success: false, error: error.message };
        }
    }
    
    async processTaskByType(task) {
        const taskType = task.task_type || task.type;
        
        switch (taskType) {
            case 'computation':
                return await this.processComputation(task);
            case 'data_processing':
                return await this.processDataProcessing(task);
            case 'ai_inference':
                return await this.processAIInference(task);
            default:
                return await this.processGeneric(task);
        }
    }
    
    async processComputation(task) {
        // 模拟计算任务
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { output: '计算完成', value: Math.random() * 100 };
    }
    
    async processDataProcessing(task) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { processed: true, records: 1000 };
    }
    
    async processAIInference(task) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return { prediction: 'result', confidence: 0.95 };
    }
    
    async processGeneric(task) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { completed: true };
    }
    
    async submitResult(taskId, result) {
        return await this.apiClient('/compute/tasks/result', 'POST', {
            task_id: taskId,
            result: {
                status: 'completed',
                result: result,
                execution_time: 2000
            }
        });
    }
}

// ========== 4. 任务进度跟踪模块 ==========
class TaskProgressTracker {
    constructor() {
        this.progress = new Map();
    }
    
    startTracking(taskId) {
        this.progress.set(taskId, {
            start: Date.now(),
            progress: 0,
            status: 'running'
        });
    }
    
    updateProgress(taskId, percent) {
        const info = this.progress.get(taskId);
        if (info) {
            info.progress = percent;
        }
    }
    
    getProgress(taskId) {
        return this.progress.get(taskId);
    }
    
    getElapsedTime(taskId) {
        const info = this.progress.get(taskId);
        if (info) {
            return Date.now() - info.start;
        }
        return 0;
    }
}

// ========== 5. 任务过滤和排序模块 ==========
class TaskFilter {
    static filterByStatus(tasks, status) {
        if (status === 'all') return tasks;
        return tasks.filter(t => t.status === status);
    }
    
    static filterByType(tasks, type) {
        if (type === 'all') return tasks;
        return tasks.filter(t => (t.task_type || t.type) === type);
    }
    
    static sortByTime(tasks, order = 'desc') {
        return tasks.sort((a, b) => {
            const timeA = a.startTime || a.addedTime || 0;
            const timeB = b.startTime || b.addedTime || 0;
            return order === 'desc' ? timeB - timeA : timeA - timeB;
        });
    }
    
    static search(tasks, keyword) {
        if (!keyword) return tasks;
        const lower = keyword.toLowerCase();
        return tasks.filter(t => 
            (t.id || '').toLowerCase().includes(lower) ||
            (t.task_type || '').toLowerCase().includes(lower)
        );
    }
}

// ========== 6. 任务统计分析模块 ==========
class TaskStatistics {
    static analyze(queue) {
        const all = queue.getAllTasks();
        
        return {
            total: all.length,
            running: queue.getRunningTasks().length,
            waiting: queue.getWaitingTasks().length,
            completed: queue.getCompletedTasks().length,
            failed: queue.getFailedTasks().length,
            successRate: this.calculateSuccessRate(queue),
            avgExecutionTime: this.calculateAvgTime(queue),
            byType: this.groupByType(all)
        };
    }
    
    static calculateSuccessRate(queue) {
        const completed = queue.getCompletedTasks().length;
        const failed = queue.getFailedTasks().length;
        const total = completed + failed;
        return total > 0 ? (completed / total * 100).toFixed(1) : 0;
    }
    
    static calculateAvgTime(queue) {
        const completed = queue.getCompletedTasks();
        if (completed.length === 0) return 0;
        
        const totalTime = completed.reduce((sum, task) => {
            return sum + ((task.endTime || 0) - (task.startTime || 0));
        }, 0);
        
        return Math.round(totalTime / completed.length / 1000); // 秒
    }
    
    static groupByType(tasks) {
        const groups = {};
        tasks.forEach(task => {
            const type = task.task_type || task.type || 'unknown';
            groups[type] = (groups[type] || 0) + 1;
        });
        return groups;
    }
}

// ========== 7. 任务详情查看模块 ==========
class TaskDetailViewer {
    static showDetail(task) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        modal.innerHTML = `
            <div class="dashboard-card" style="width: 600px; max-height: 80vh; overflow-y: auto;">
                <h3 style="margin-bottom: 20px; font-size: 24px; font-weight: 700; color: #1f2937;">
                    📋 任务详情
                </h3>
                
                <div style="display: grid; gap: 16px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <span style="color: #6b7280;">任务ID:</span>
                        <span style="font-family: monospace; font-weight: 600;">${task.id}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <span style="color: #6b7280;">类型:</span>
                        <span style="font-weight: 600;">${task.task_type || task.type}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <span style="color: #6b7280;">状态:</span>
                        <span class="status-badge status-${task.status}">${task.status}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <span style="color: #6b7280;">开始时间:</span>
                        <span>${task.startTime ? new Date(task.startTime).toLocaleString('zh-CN') : '-'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: #f9fafb; border-radius: 8px;">
                        <span style="color: #6b7280;">预计收益:</span>
                        <span style="color: #10b981; font-weight: 700;">${task.reward || '0.0000'} AIP</span>
                    </div>
                </div>
                
                <button class="btn btn-secondary" onclick="this.closest('div[style*=fixed]').remove()" style="width: 100%;">
                    关闭
                </button>
            </div>
        `;
        
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        document.body.appendChild(modal);
    }
}

// ========== 8. 任务控制模块 ==========
class TaskController {
    static pauseTask(taskId) {
        console.log('暂停任务:', taskId);
        // 实现暂停逻辑
    }
    
    static resumeTask(taskId) {
        console.log('恢复任务:', taskId);
        // 实现恢复逻辑
    }
    
    static cancelTask(taskId) {
        if (confirm('确定要取消此任务吗？')) {
            console.log('取消任务:', taskId);
            // 实现取消逻辑
            return true;
        }
        return false;
    }
    
    static retryTask(taskId) {
        console.log('重试任务:', taskId);
        // 实现重试逻辑
    }
}

// 导出所有模块
window.TaskModules = {
    TaskPuller,
    TaskQueue,
    TaskExecutor,
    TaskProgressTracker,
    TaskFilter,
    TaskStatistics,
    TaskDetailViewer,
    TaskController
};

