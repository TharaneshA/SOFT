#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod file_indexer;
mod vector_search;
mod websocket;
mod types;

use std::sync::Arc;
use tauri::{Manager, State};
use tokio::sync::Mutex;
use types::{FileInfo, AppError, SearchResult, SearchQuery};
use websocket::WebSocketServer;
use tracing_subscriber::{fmt, EnvFilter};

#[derive(Default)]
struct AppState {
    indexed_folders: Arc<Mutex<Vec<String>>>,
    files: Arc<Mutex<Vec<FileInfo>>>,
}

#[tauri::command]
async fn get_indexed_folders(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    Ok(state.indexed_folders.lock().await.clone())
}

#[tauri::command]
async fn add_indexed_folder(folder_path: String, state: State<'_, AppState>) -> Result<(), String> {
    let mut folders = state.indexed_folders.lock().await;
    if !folders.contains(&folder_path) {
        folders.push(folder_path);
    }
    Ok(())
}

#[tauri::command]
async fn remove_indexed_folder(folder_path: String, state: State<'_, AppState>) -> Result<(), String> {
    let mut folders = state.indexed_folders.lock().await;
    folders.retain(|path| path != &folder_path);
    Ok(())
}

#[tauri::command]
async fn search_files(query: String, state: State<'_, AppState>) -> Result<SearchResult, String> {
    let files = state.files.lock().await;
    Ok(SearchResult {
        files: files.clone(),
        total: files.len(),
        query_time_ms: 0,
    })
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env()
            .add_directive("file_search_app=debug".parse()?)
            .add_directive("actix_web=info".parse()?)
        )
        .init();

    // Initialize WebSocket server
    let ws_server = WebSocketServer::new().await
        .map_err(|e| format!("Failed to create WebSocket server: {}", e))?;

    // Start WebSocket server in the background
    let ws_handle = tokio::spawn(async move {
        if let Err(e) = ws_server.start("127.0.0.1", 8080).await {
            eprintln!("WebSocket server error: {}", e);
        }
    });

    // Start Tauri application
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            get_indexed_folders,
            add_indexed_folder,
            remove_indexed_folder,
            search_files
        ])
        .setup(|app| {
            let app_handle = app.handle();
            
            // You can add any additional setup here
            // For example, initializing the file watcher or setting up IPC handlers
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    // Wait for WebSocket server to finish (it won't in practice)
    ws_handle.await?
        .map_err(|e| format!("WebSocket server failed: {}", e))?;

    Ok(())
}
