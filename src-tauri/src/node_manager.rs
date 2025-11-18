/// 节点管理模块
use serde::{Deserialize, Serialize};
use sysinfo::System;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeInfo {
    pub node_id: String,
    pub username: String,
    pub platform: String,
    pub cpu_cores: usize,
    pub memory_total: u64,
    pub memory_free: u64,
    pub compute_power: usize,
}

pub struct NodeManager {
    system: System,
}

impl NodeManager {
    pub fn new() -> Self {
        Self {
            system: System::new_all(),
        }
    }
    
    pub fn generate_node_id() -> String {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        let hostname = hostname::get()
            .unwrap()
            .to_string_lossy()
            .to_string();
        
        format!("tauri-{}-{}", hostname, timestamp)
    }
    
    pub fn collect_system_info(&mut self) -> NodeInfo {
        self.system.refresh_all();
        
        let cpu_cores = self.system.cpus().len();
        let memory_total = self.system.total_memory();
        let memory_free = self.system.available_memory();
        let compute_power = cpu_cores * 100;
        
        NodeInfo {
            node_id: String::new(), // 将由外部设置
            username: String::new(), // 将由外部设置
            platform: std::env::consts::OS.to_string(),
            cpu_cores,
            memory_total,
            memory_free,
            compute_power,
        }
    }
    
    pub fn get_cpu_usage(&mut self) -> f32 {
        self.system.refresh_cpu();
        
        if !self.system.cpus().is_empty() {
            self.system.cpus().iter()
                .map(|cpu| cpu.cpu_usage())
                .sum::<f32>() / self.system.cpus().len() as f32
        } else {
            0.0
        }
    }
    
    pub fn get_memory_usage(&mut self) -> f64 {
        self.system.refresh_memory();
        
        let used = self.system.used_memory();
        let total = self.system.total_memory();
        
        if total > 0 {
            (used as f64 / total as f64) * 100.0
        } else {
            0.0
        }
    }
}

