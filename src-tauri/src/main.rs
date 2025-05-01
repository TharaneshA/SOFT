#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod file_indexer;
mod vector_search;
mod websocket;

use std::sync::{Arc, Mutex};
use tauri::{Manager, State};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileInfo {
    id: String,
    name: String,
    path: String,
    file_type: String,
    summary: String,
    content: String,
    modified: String,
}

struct AppState {
    indexed_folders: Arc<Mutex<Vec<String>>>,
    files: Arc<Mutex<Vec<FileInfo>>>,
}

#[tauri::command]
fn get_indexed_folders(state: State<AppState>) -> Vec<String> {
    state.indexed_folders.lock().unwrap().clone()
}

#[tauri::command]
fn add_indexed_folder(folder_path: String, state: State<AppState>) -> Result<(), String> {
    let mut folders = state.indexed_folders.lock().unwrap();
    if !folders.contains(&folder_path) {
        folders.push(folder_path);
    }
    Ok(())
}

#[tauri::command]
fn remove_indexed_folder(folder_path: String, state: State<AppState>) -> Result<(), String> {
    let mut folders = state.indexed_folders.lock().unwrap();
    folders.retain(|path| path != &folder_path);
    Ok(())
}

#[tauri::command]
fn search_files(query: String, state: State<AppState>) -> Vec<FileInfo> {
    // In a real implementation, this would use the vector search and Tantivy
    // For now, we'll just return all files
    state.files.lock().unwrap().clone()
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            indexed_folders: Arc::new(Mutex::new(vec![
                String::from("/Users/Documents"),
                String::from("/Users/Desktop"),
            ])),
            files: Arc::new(Mutex::new(vec![])),
        })
        .invoke_handler(tauri::generate_handler![
            get_indexed_folders,
            add_indexed_folder,
            remove_indexed_folder,
            search_files
        ])
        .setup(|app| {
            // Initialize the file indexer and websocket server here
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
