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

struct AppState {
    indexed_folders: Arc<Mutex<Vec<String>>>,
    files: Arc<Mutex<Vec<FileInfo>>>,
    app_handle: tauri::AppHandle,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            indexed_folders: Arc::new(Mutex::new(Vec::new())),
            files: Arc::new(Mutex::new(Vec::new())),
            app_handle: tauri::AppHandle::default(),
        }
    }
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
    // Create a search query
    let search_query = SearchQuery {
        text: query,
        limit: Some(20), // Default limit
    };
    
    // Get the WebSocketServer instance from the app state
    let ws_server = state.app_handle.state::<Arc<WebSocketServer>>()
        .ok_or_else(|| "WebSocketServer not initialized".to_string())?;
    
    // Use the vector search to perform the search
    let result = ws_server.vector_search.search(&search_query.text, search_query.limit.unwrap_or(20))
        .await
        .map_err(|e| format!("Search failed: {}", e))?;
    
    // Update the app state with the search results
    let mut files_state = state.files.lock().await;
    *files_state = result.files.clone();
    
    Ok(result)
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
    let ws_server = Arc::new(ws_server);

    // Start Tauri application
    tauri::Builder::default()
        .manage(ws_server.clone())
        .setup(|app| {
            // Create app state with app handle
            let app_state = AppState {
                indexed_folders: Arc::new(Mutex::new(Vec::new())),
                files: Arc::new(Mutex::new(Vec::new())),
                app_handle: app.handle(),
            };
            app.manage(app_state);
            
            // Start WebSocket server in the background
            let ws_server_clone = ws_server.clone();
            tokio::spawn(async move {
                if let Err(e) = ws_server_clone.start("127.0.0.1", 8080).await {
                    eprintln!("WebSocket server error: {}", e);
                }
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_indexed_folders,
            add_indexed_folder,
            remove_indexed_folder,
            search_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
