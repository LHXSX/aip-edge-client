// 任务处理核心逻辑

async function processPendingTasks() {
    const queue = window.globalTaskQueue;
    const waitingTasks = queue.getWaitingTasks();
    const runningTasks = queue.getRunningTasks();
    
    // 如果有等待的任务且运行中的任务未达上限
    while (waitingTasks.length > 0 && runningTasks.length < queue.maxConcurrent) {
        const task = waitingTasks.shift();
        await executeTask(task);
    }
}

async function executeTask(task) {
    const taskId = task.id || task.fragmentId;
    
    try {
        // 移到运行中
        window.globalTaskQueue.moveToRunning(taskId);
        updateTaskDisplay();
        
        addLog('INFO', `开始执行任务: ${taskId}`);
        
        // 模拟任务执行
        const executionTime = 2000 + Math.random() * 3000;
        await new Promise(resolve => setTimeout(resolve, executionTime));
        
        // 提交结果
        const result = {
            status: 'completed',
            result: {
                success: true,
                output: '任务执行完成',
                data: Math.random() * 100
            },
            execution_time: executionTime
        };
        
        const submitResult = await callAPI('/compute/tasks/result', 'POST', {
            task_id: taskId,
            result: result
        });
        
        if (submitResult && submitResult.success) {
            window.globalTaskQueue.moveToCompleted(taskId, result);
            addLog('SUCCESS', `任务完成: ${taskId}`);
            
            // 更新已完成任务数
            const currentCompleted = parseInt(document.getElementById('completed-tasks')?.textContent) || 0;
            document.getElementById('completed-tasks').textContent = currentCompleted + 1;
        } else {
            throw new Error('结果提交失败');
        }
        
    } catch (e) {
        window.globalTaskQueue.moveToFailed(taskId, e.message);
        addLog('ERROR', `任务失败: ${taskId} - ${e.message}`);
    }
    
    updateTaskDisplay();
    
    // 继续处理下一个任务
    processPendingTasks();
}

