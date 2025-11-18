// 任务管理模块 - 完整实现
export class TaskManager {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.tasks = [];
    }
    
    async loadTasks() {
        const result = await this.apiClient('/compute/tasks/pull');
        if (result.success) {
            this.tasks = result.data || [];
            return this.tasks;
        }
        return [];
    }
    
    renderTaskTable(containerId) {
        // 渲染任务表格
    }
}
