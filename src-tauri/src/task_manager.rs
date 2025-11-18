/// 任务管理模块
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub task_type: String,
    pub status: String,
    pub start_time: Option<u64>,
    pub input_data: Option<serde_json::Value>,
    pub result: Option<serde_json::Value>,
}

pub struct TaskManager {
    active_tasks: HashMap<String, Task>,
    task_queue: Vec<Task>,
    max_concurrent: usize,
}

impl TaskManager {
    pub fn new() -> Self {
        Self {
            active_tasks: HashMap::new(),
            task_queue: Vec::new(),
            max_concurrent: 3,
        }
    }
    
    pub fn add_task(&mut self, task: Task) {
        if self.active_tasks.len() < self.max_concurrent {
            self.execute_task(task);
        } else {
            self.task_queue.push(task);
        }
    }
    
    fn execute_task(&mut self, mut task: Task) {
        task.status = "running".to_string();
        task.start_time = Some(
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs()
        );
        
        self.active_tasks.insert(task.id.clone(), task);
    }
    
    pub fn complete_task(&mut self, task_id: &str, result: serde_json::Value) -> Option<Task> {
        if let Some(mut task) = self.active_tasks.remove(task_id) {
            task.status = "completed".to_string();
            task.result = Some(result);
            
            // 处理队列中的下一个任务
            if let Some(next_task) = self.task_queue.pop() {
                self.execute_task(next_task);
            }
            
            Some(task)
        } else {
            None
        }
    }
    
    pub fn get_active_tasks(&self) -> Vec<&Task> {
        self.active_tasks.values().collect()
    }
    
    pub fn get_task_queue(&self) -> &[Task] {
        &self.task_queue
    }
    
    pub fn get_active_count(&self) -> usize {
        self.active_tasks.len()
    }
}

