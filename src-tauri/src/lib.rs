mod api_client;
mod node_manager;
mod task_manager;

use api_client::APIClient;
use node_manager::NodeManager;
use task_manager::TaskManager;
use serde_json::json;
use std::sync::Arc;
use sysinfo::System;
use tokio::sync::Mutex;

#[tauri::command]
async fn login(email: String, password: String, state: tauri::State<'_, AppState>) -> Result<serde_json::Value, String> {
    let result = state.api_client.login(email, password).await?;
    Ok(serde_json::to_value(result).unwrap())
}

#[tauri::command]
async fn register_node(username: String, state: tauri::State<'_, AppState>) -> Result<serde_json::Value, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    let node_id = format!("tauri-{}-{}", hostname::get().unwrap().to_str().unwrap(), chrono::Utc::now().timestamp());
    
    let node_data = json!({
        "id": node_id,
        "username": username,
        "node_name": format!("{}-{}", hostname::get().unwrap().to_str().unwrap(), std::env::consts::OS),
        "platform": std::env::consts::OS,
        "architecture": std::env::consts::ARCH,
        "cpuCores": sys.cpus().len(),
        "memoryTotal": sys.total_memory(),
        "memoryFree": sys.available_memory(),
        "gpuCount": 0,
        "computePower": sys.cpus().len() * 100,
        "capabilities": {
            "cpu": {"cores": sys.cpus().len(), "avgSpeedGHz": 2.5},
            "memory": {"total": sys.total_memory()}
        }
    });
    
    state.api_client.register_node(node_data).await
}

#[tauri::command]
async fn get_system_info() -> Result<serde_json::Value, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    // 计算平均CPU使用率
    let cpu_usage = if !sys.cpus().is_empty() {
        sys.cpus().iter().map(|cpu| cpu.cpu_usage()).sum::<f32>() / sys.cpus().len() as f32
    } else {
        0.0
    };
    
    Ok(json!({
        "cpu_cores": sys.cpus().len(),
        "cpu_usage": cpu_usage,
        "memory_total": sys.total_memory(),
        "memory_free": sys.available_memory(),
        "memory_used": sys.used_memory(),
        "memory_usage": (sys.used_memory() as f64 / sys.total_memory() as f64 * 100.0),
        "platform": std::env::consts::OS,
        "hostname": hostname::get().unwrap().to_str().unwrap()
    }))
}

pub struct AppState {
    pub api_client: APIClient,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let api_client = APIClient::new();
    let state = AppState { api_client };
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            login,
            register_node,
            get_system_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
