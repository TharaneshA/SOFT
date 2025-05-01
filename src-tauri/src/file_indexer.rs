use std::path::{Path, PathBuf};
use std::fs::{self, File};
use std::io::Read;
use std::sync::Arc;
use tokio::sync::mpsc;
use notify::{Watcher, RecursiveMode, Event};
use walkdir::WalkDir;
use uuid::Uuid;
use chrono::{DateTime, Local};
use pdf::file::File as PdfFile;
use docx::document::Document;
use crate::types::{FileInfo, AppError, IndexStats};
use tracing::{info, warn, error};

pub struct FileIndexer {
    indexed_paths: Arc<tokio::sync::RwLock<Vec<PathBuf>>>,
    watcher: Option<notify::RecommendedWatcher>,
    file_tx: mpsc::Sender<FileEvent>,
}

#[derive(Debug)]
pub enum FileEvent {
    Created(PathBuf),
    Modified(PathBuf),
    Deleted(PathBuf),
}

impl FileIndexer {
    pub async fn new() -> Result<(Self, mpsc::Receiver<FileEvent>), AppError> {
        let (file_tx, file_rx) = mpsc::channel(100);
        let indexed_paths = Arc::new(tokio::sync::RwLock::new(Vec::new()));

        Ok((Self {
            indexed_paths,
            watcher: None,
            file_tx,
        }, file_rx))
    }

    pub async fn start_watching(&mut self) -> Result<(), AppError> {
        let paths = self.indexed_paths.read().await.clone();
        let file_tx = self.file_tx.clone();

        let mut watcher = notify::recommended_watcher(move |res: Result<Event, notify::Error>| {
            let tx = file_tx.clone();
            match res {
                Ok(event) => {
                    if let Some(event_path) = event.paths.first() {
                        let event = match event.kind {
                            notify::EventKind::Create(_) => FileEvent::Created(event_path.clone()),
                            notify::EventKind::Modify(_) => FileEvent::Modified(event_path.clone()),
                            notify::EventKind::Remove(_) => FileEvent::Deleted(event_path.clone()),
                            _ => return,
                        };
                        let _ = tx.blocking_send(event);
                    }
                }
                Err(e) => error!("Watch error: {}", e),
            }
        })?;

        for path in paths {
            watcher.watch(&path, RecursiveMode::Recursive)?;
        }

        self.watcher = Some(watcher);
        Ok(())
    }

    pub async fn add_folder(&mut self, folder_path: PathBuf) -> Result<(), AppError> {
        let mut paths = self.indexed_paths.write().await;
        if !paths.contains(&folder_path) {
            paths.push(folder_path.clone());
            if let Some(watcher) = &mut self.watcher {
                watcher.watch(&folder_path, RecursiveMode::Recursive)?;
            }
        }
        Ok(())
    }

    pub async fn index_folder(&self, folder_path: &Path) -> Result<Vec<FileInfo>, AppError> {
        let mut files = Vec::new();
        let mut stats = IndexStats {
            total_files: 0,
            indexed_files: 0,
            failed_files: 0,
            total_chunks: 0,
            index_size_bytes: 0,
        };

        for entry in WalkDir::new(folder_path)
            .follow_links(true)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file()) {

            stats.total_files += 1;
            let path = entry.path();
            match self.process_file(path).await {
                Ok(Some(file_info)) => {
                    stats.indexed_files += 1;
                    files.push(file_info);
                }
                Ok(None) => {} // Unsupported file type
                Err(e) => {
                    stats.failed_files += 1;
                    warn!("Failed to process file {}: {}", path.display(), e);
                }
            }
        }

        info!("Indexing completed: {:?}", stats);
        Ok(files)
    }

    async fn process_file(&self, path: &Path) -> Result<Option<FileInfo>, AppError> {
        let extension = path.extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("");

        if !self.is_supported_file_type(extension) {
            return Ok(None);
        }

        let file_name = path.file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("Unknown");

        let file_path = path.to_str().unwrap_or("");
        let content = self.extract_content(path).await?;

        let summary = if content.len() > 200 {
            content[..200].to_string() + "..."
        } else {
            content.clone()
        };

        let metadata = fs::metadata(path)?;
        let modified: DateTime<Local> = metadata.modified()?.into();

        Ok(Some(FileInfo {
            id: Uuid::new_v4().to_string(),
            name: file_name.to_string(),
            path: file_path.to_string(),
            file_type: extension.to_string(),
            summary,
            content,
            modified: modified.to_rfc3339(),
            embedding: None,
        }))
    }

    fn is_supported_file_type(&self, extension: &str) -> bool {
        matches!(
            extension.to_lowercase().as_str(),
            "txt" | "md" | "pdf" | "docx" | "html" | "htm" | "css" | "js" | "ts" | "tsx" |
            "jsx" | "json" | "yaml" | "yml" | "toml" | "rs" | "py" | "c" | "cpp" | "h" |
            "java" | "go" | "rb" | "php" | "sql"
        )
    }

    async fn extract_content(&self, path: &Path) -> Result<String, AppError> {
        let extension = path.extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("")
            .to_lowercase();

        match extension.as_str() {
            "txt" | "md" | "js" | "ts" | "html" | "css" | "json" |
            "yaml" | "yml" | "toml" | "rs" | "py" | "c" | "cpp" |
            "h" | "java" | "go" | "rb" | "php" | "sql" => {
                fs::read_to_string(path).map_err(AppError::from)
            }
            "pdf" => self.extract_pdf_content(path),
            "docx" => self.extract_docx_content(path),
            _ => Err(AppError::UnsupportedFileType(extension.to_string())),
        }
    }

    fn extract_pdf_content(&self, path: &Path) -> Result<String, AppError> {
        let mut file = File::open(path)?;
        let mut data = Vec::new();
        file.read_to_end(&mut data)?;

        let pdf = PdfFile::from_data(data)?;
        let mut content = String::new();

        for page in pdf.pages() {
            if let Ok(text) = page.text() {
                content.push_str(&text);
                content.push('\n');
            }
        }

        Ok(content)
    }

    fn extract_docx_content(&self, path: &Path) -> Result<String, AppError> {
        let mut file = File::open(path)?;
        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer)?;

        let docx = Document::from_file(&buffer)
            .map_err(|e| AppError::Other(e.to_string()))?;

        let mut content = String::new();
        for paragraph in docx.paragraphs {
            content.push_str(&paragraph.text);
            content.push('\n');
        }

        Ok(content)
    }
}
