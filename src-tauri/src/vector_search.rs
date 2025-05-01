use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use crate::FileInfo;

#[derive(Debug, Serialize, Deserialize)]
pub struct VectorSearchResult {
    pub file_info: FileInfo,
    pub score: f32,
}

pub struct VectorSearch {
    // In a real implementation, this would be a connection to Qdrant
    // For now, we'll just use a simple in-memory store
    embeddings: HashMap<String, Vec<f32>>,
}

impl VectorSearch {
    pub fn new() -> Self {
        VectorSearch {
            embeddings: HashMap::new(),
        }
    }
    
    pub fn add_document(&mut self, file_id: &str, embedding: Vec<f32>) {
        self.embeddings.insert(file_id.to_string(), embedding);
    }
    
    pub fn search(&self, query_embedding: Vec<f32>, files: &[FileInfo], limit: usize) -> Vec<VectorSearchResult> {
        let mut results: Vec<VectorSearchResult> = Vec::new();
        
        for file in files {
            if let Some(embedding) = self.embeddings.get(&file.id) {
                let score = self.cosine_similarity(&query_embedding, embedding);
                
                results.push(VectorSearchResult {
                    file_info: file.clone(),
                    score,
                });
            }
        }
        
        // Sort by score in descending order
        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
        
        // Limit results
        results.truncate(limit);
        
        results
    }
    
    fn cosine_similarity(&self, a: &[f32], b: &[f32]) -> f32 {
        let mut dot_product = 0.0;
        let mut norm_a = 0.0;
        let mut norm_b = 0.0;
        
        for i in 0..a.len().min(b.len()) {
            dot_product += a[i] * b[i];
            norm_a += a[i] * a[i];
            norm_b += b[i] * b[i];
        }
        
        dot_product / (norm_a.sqrt() * norm_b.sqrt())
    }
    
    // In a real implementation, this would call Python to generate embeddings
    pub fn generate_embedding(&self, text: &str) -> Vec<f32> {
        // This is a placeholder. In a real implementation, this would call
        // the Python service to generate embeddings using sentence-transformers
        let mut result = Vec::new();
        for i in 0..384 {
            result.push((i as f32).sin());
        }
        result
    }
}
