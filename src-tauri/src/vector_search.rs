use std::sync::Arc;
use qdrant_client::prelude::*;
use qdrant_client::client::QdrantClient;
use pyo3::prelude::*;
use pyo3::types::PyDict;
use tokio::sync::Mutex;
use crate::types::{FileInfo, AppError, SearchResult};
use tracing::{info, error};

pub struct VectorSearch {
    client: Arc<QdrantClient>,
    collection_name: String,
    python_service: Arc<Mutex<PyObject>>,
}

const VECTOR_SIZE: usize = 768; // BGE-small embedding size
const COLLECTION_NAME: &str = "file_vectors";

impl VectorSearch {
    pub async fn new() -> Result<Self, AppError> {
        let client = QdrantClient::new(Some(QdrantClientConfig::new(
            "http://localhost:6334",
            None,
        ))).map_err(|e| AppError::Qdrant(e.to_string()))?;

        let collection_name = COLLECTION_NAME.to_string();

        // Initialize Python interpreter and load sentence-transformers
        let python_service = Python::with_gil(|py| {
            let sentence_transformers = PyModule::import(py, "sentence_transformers")?;
            let model = sentence_transformers.getattr("SentenceTransformer")?.call1((
                "BAAI/bge-small-en",
            ))?;
            Ok::<PyObject, PyErr>(model.into())
        }).map_err(|e| AppError::Python(e.to_string()))?;

        let instance = Self {
            client: Arc::new(client),
            collection_name,
            python_service: Arc::new(Mutex::new(python_service)),
        };

        instance.ensure_collection().await?;
        Ok(instance)
    }

    async fn ensure_collection(&self) -> Result<(), AppError> {
        let collections = self.client.list_collections()
            .await
            .map_err(|e| AppError::Qdrant(e.to_string()))?;

        if !collections.collections.iter().any(|c| c.name == self.collection_name) {
            self.client.create_collection(&CreateCollection {
                collection_name: self.collection_name.clone(),
                vectors_config: Some(VectorsConfig::Single(VectorParams {
                    size: VECTOR_SIZE,
                    distance: Distance::Cosine,
                    ..Default::default()
                })),
                ..Default::default()
            }).await.map_err(|e| AppError::Qdrant(e.to_string()))?;
        }

        Ok(())
    }

    pub async fn add_document(&self, file_info: &mut FileInfo) -> Result<(), AppError> {
        let embedding = self.generate_embedding(&file_info.content).await?;
        file_info.embedding = Some(embedding.clone());

        let point = PointStruct {
            id: Some(file_info.id.parse().map_err(|e| AppError::Other(e.to_string()))?),
            payload: Some(serde_json::to_value(file_info).unwrap()),
            vectors: Some(embedding),
            ..Default::default()
        };

        self.client.upsert_points(
            &self.collection_name,
            None,
            vec![point],
            None,
        ).await.map_err(|e| AppError::Qdrant(e.to_string()))?;

        Ok(())
    }

    pub async fn search(&self, query: &str, limit: usize) -> Result<SearchResult, AppError> {
        let start = std::time::Instant::now();
        let query_embedding = self.generate_embedding(query).await?;

        let search_result = self.client.search_points(&SearchPoints {
            collection_name: self.collection_name.clone(),
            vector: query_embedding,
            limit: limit as u64,
            with_payload: Some(true.into()),
            ..Default::default()
        }).await.map_err(|e| AppError::Qdrant(e.to_string()))?;

        let files = search_result.result
            .into_iter()
            .filter_map(|point| {
                point.payload
                    .and_then(|payload| serde_json::from_value::<FileInfo>(payload).ok())
            })
            .collect::<Vec<_>>();

        Ok(SearchResult {
            files,
            total: search_result.result.len(),
            query_time_ms: start.elapsed().as_millis() as u64,
        })
    }

    async fn generate_embedding(&self, text: &str) -> Result<Vec<f32>, AppError> {
        let python_service = self.python_service.lock().await;
        Python::with_gil(|py| {
            let kwargs = PyDict::new(py);
            kwargs.set_item("normalize_embeddings", true)?;
            let embeddings = python_service.call_method(py, "encode", (text,), Some(kwargs))?;
            let numpy_array = embeddings.as_ref(py).downcast::<PyArray1<f32>>()?;
            Ok(numpy_array.to_vec()?)
        }).map_err(|e| AppError::Python(e.to_string()))
    }

    pub async fn delete_document(&self, file_id: &str) -> Result<(), AppError> {
        self.client.delete_points(
            &self.collection_name,
            &PointsSelector::PointIds(vec![file_id.parse().map_err(|e| AppError::Other(e.to_string()))?]),
            None,
        ).await.map_err(|e| AppError::Qdrant(e.to_string()))?;

        Ok(())
    }
}
