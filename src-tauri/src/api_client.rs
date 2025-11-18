/// API客户端 - 连接生产服务器 8.218.206.57
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginResponse {
    pub success: bool,
    pub token: Option<String>,
    pub user: Option<serde_json::Value>,
    pub error: Option<String>,
}

pub struct APIClient {
    base_url: String,
    token: Arc<Mutex<Option<String>>>,
    client: reqwest::Client,
}

impl APIClient {
    pub fn new() -> Self {
        Self {
            base_url: "http://8.218.206.57/api/v1".to_string(),
            token: Arc::new(Mutex::new(None)),
            client: reqwest::Client::new(),
        }
    }
    
    pub async fn login(&self, email: String, password: String) -> Result<LoginResponse, String> {
        let url = format!("{}/auth/login", self.base_url);
        let body = LoginRequest { email, password };
        
        let response = self.client
            .post(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("请求失败: {}", e))?;
        
        let data: LoginResponse = response
            .json()
            .await
            .map_err(|e| format!("解析响应失败: {}", e))?;
        
        if let Some(token) = &data.token {
            *self.token.lock().await = Some(token.clone());
        }
        
        Ok(data)
    }
    
    pub async fn register_node(&self, node_data: serde_json::Value) -> Result<serde_json::Value, String> {
        let url = format!("{}/compute/clients/register", self.base_url);
        let token = self.token.lock().await.clone();
        
        let mut request = self.client.post(&url).json(&node_data);
        
        if let Some(t) = token {
            request = request.header("Authorization", format!("Bearer {}", t));
        }
        
        let response = request
            .send()
            .await
            .map_err(|e| format!("节点注册失败: {}", e))?;
        
        let data: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("解析响应失败: {}", e))?;
        
        Ok(data)
    }
    
    pub async fn send_heartbeat(&self, node_id: String, status: serde_json::Value) -> Result<serde_json::Value, String> {
        let url = format!("{}/compute/clients/heartbeat", self.base_url);
        let token = self.token.lock().await.clone();
        
        let mut request = self.client.post(&url).json(&status);
        
        if let Some(t) = token {
            request = request.header("Authorization", format!("Bearer {}", t));
        }
        
        let response = request
            .send()
            .await
            .map_err(|e| format!("心跳失败: {}", e))?;
        
        let data: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("解析响应失败: {}", e))?;
        
        Ok(data)
    }
    
    pub async fn pull_tasks(&self, node_id: String) -> Result<serde_json::Value, String> {
        let url = format!("{}/compute/tasks/pull?nodeId={}", self.base_url, node_id);
        let token = self.token.lock().await.clone();
        
        let mut request = self.client
            .get(&url)
            .header("x-node-id", &node_id);
        
        if let Some(t) = token {
            request = request.header("Authorization", format!("Bearer {}", t));
        }
        
        let response = request
            .send()
            .await
            .map_err(|e| format!("拉取任务失败: {}", e))?;
        
        let data: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("解析响应失败: {}", e))?;
        
        Ok(data)
    }
    
    pub async fn submit_task_result(&self, task_id: String, result: serde_json::Value) -> Result<serde_json::Value, String> {
        let url = format!("{}/compute/tasks/result", self.base_url);
        let token = self.token.lock().await.clone();
        
        let body = serde_json::json!({
            "task_id": task_id,
            "result": result
        });
        
        let mut request = self.client.post(&url).json(&body);
        
        if let Some(t) = token {
            request = request.header("Authorization", format!("Bearer {}", t));
        }
        
        let response = request
            .send()
            .await
            .map_err(|e| format!("提交结果失败: {}", e))?;
        
        let data: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("解析响应失败: {}", e))?;
        
        Ok(data)
    }
}

