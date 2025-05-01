use std::path::Path;
use std::fs;
use walkdir::WalkDir;
use uuid::Uuid;
use chrono::{DateTime, Local};
use crate::FileInfo;

pub struct FileIndexer;

impl FileIndexer {
    pub fn new() -> Self {
        FileIndexer
    }

    pub fn index_folder(&self, folder_path: &str) -> Vec<FileInfo> {
        let mut files = Vec::new();
        
        for entry in WalkDir::new(folder_path)
            .follow_links(true)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file()) {
                
            let path = entry.path();
            if let Some(file_info) = self.process_file(path) {
                files.push(file_info);
            }
        }
        
        files
    }
    
    fn process_file(&self, path: &Path) -> Option<FileInfo> {
        let extension = path.extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("");
            
        // Skip binary files and only process text-based files
        if !self.is_supported_file_type(extension) {
            return None;
        }
        
        let file_name = path.file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("Unknown");
            
        let file_path = path.to_str().unwrap_or("");
        
        // Extract content based on file type
        let content = match self.extract_content(path) {
            Ok(content) => content,
            Err(_) => return None,
        };
        
        // Generate a summary (in a real app, this would use an LLM or extraction algorithm)
        let summary = if content.len() > 200 {
            content[..200].to_string() + "..."
        } else {
            content.clone()
        };
        
        // Get file modification time
        let metadata = fs::metadata(path).ok()?;
        let modified: DateTime<Local> = metadata.modified().ok()?.into();
        
        Some(FileInfo {
            id: Uuid::new_v4().to_string(),
            name: file_name.to_string(),
            path: file_path.to_string(),
            file_type: extension.to_string(),
            summary,
            content,
            modified: modified.to_rfc3339(),
        })
    }
    
    fn is_supported_file_type(&self, extension: &str) -> bool {
        match extension.to_lowercase().as_str() {
            "txt" | "md" | "pdf" | "docx" | "html" | "htm" | "css" | "js" | "ts" | "tsx" | 
            "jsx" | "json" | "yaml" | "yml" | "toml" | "rs" | "py" | "c" | "cpp" | "h" | 
            "java" | "go" | "rb" | "php" | "sql" => true,
            _ => false,
        }
    }
    
    fn extract_content(&self, path: &Path) -> Result<String, String> {
        let extension = path.extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("")
            .to_lowercase();
            
        match extension.as_str() {
            "txt" | "md" | "js" | "ts" | "html" | "css" | "json" | "yaml" | "yml" | "toml" | 
            "rs" | "py" | "c" | "cpp" | "h" | "java" | "go" | "rb" | "php" | "sql" => {
                fs::read_to_string(path).map_err(|e| e.to_string())
            },
            "pdf" => {
                // In a real implementation, this would use a PDF extraction library
                // For now, we'll just return a placeholder
                Ok("PDF content extraction not implemented in this demo".to_string())
            },
            "docx" => {
                // In a real implementation, this would use a DOCX extraction library
                // For now, we'll just return a placeholder
                Ok("DOCX content extraction not implemented in this demo".to_string())
            },
            _ => Err(format!("Unsupported file type: {}", extension)),
        }
    }
}
