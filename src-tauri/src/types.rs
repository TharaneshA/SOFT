use serde::{Deserialize, Serialize};
use thiserror::Error;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileInfo {
    pub id: String,
    pub name: String,
    pub path: String,
    pub file_type: String,
    pub summary: String,
    pub content: String,
    pub modified: String,
    pub embedding: Option<Vec<f32>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchQuery {
    pub text: String,
    pub limit: Option<usize>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub files: Vec<FileInfo>,
    pub total: usize,
    pub query_time_ms: u64,
}

#[derive(Debug, Error)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Tantivy error: {0}")]
    Tantivy(#[from] tantivy::Error),

    #[error("Qdrant error: {0}")]
    Qdrant(String),

    #[error("Python error: {0}")]
    Python(String),

    #[error("File type not supported: {0}")]
    UnsupportedFileType(String),

    #[error("WebSocket error: {0}")]
    WebSocket(String),

    #[error("{0}")]
    Other(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IndexConfig {
    pub folders: Vec<PathBuf>,
    pub file_types: Vec<String>,
    pub chunk_size: usize,
    pub index_path: PathBuf,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IndexStats {
    pub total_files: usize,
    pub indexed_files: usize,
    pub failed_files: usize,
    pub total_chunks: usize,
    pub index_size_bytes: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum WebSocketMessage {
    Search(SearchQuery),
    IndexFolder { path: String },
    RemoveFolder { path: String },
    SearchResult(SearchResult),
    IndexingProgress { stats: IndexStats },
    Error { message: String },
}