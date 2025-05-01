use std::sync::Arc;
use actix_web::{web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_ws::Message as WsMessage;
use futures::{StreamExt, SinkExt};
use serde_json::json;
use tokio::sync::mpsc;
use crate::types::{WebSocketMessage, SearchQuery, AppError};
use crate::file_indexer::{FileIndexer, FileEvent};
use crate::vector_search::VectorSearch;
use tracing::{info, error};

pub struct WebSocketServer {
    file_indexer: Arc<FileIndexer>,
    vector_search: Arc<VectorSearch>,
    file_events_rx: mpsc::Receiver<FileEvent>,
}

impl WebSocketServer {
    pub async fn new() -> Result<Self, AppError> {
        let (file_indexer, file_events_rx) = FileIndexer::new().await?;
        let vector_search = VectorSearch::new().await?;

        Ok(Self {
            file_indexer: Arc::new(file_indexer),
            vector_search: Arc::new(vector_search),
            file_events_rx,
        })
    }

    pub async fn start(self, host: &str, port: u16) -> Result<(), AppError> {
        let file_indexer = self.file_indexer.clone();
        let vector_search = self.vector_search.clone();
        let mut file_events_rx = self.file_events_rx;

        // Start the file watcher
        file_indexer.start_watching().await?;

        // Handle file events
        tokio::spawn(async move {
            while let Some(event) = file_events_rx.recv().await {
                match event {
                    FileEvent::Created(path) | FileEvent::Modified(path) => {
                        if let Ok(mut files) = file_indexer.index_folder(&path).await {
                            for file in files.iter_mut() {
                                if let Err(e) = vector_search.add_document(file).await {
                                    error!("Failed to add document to vector search: {}", e);
                                }
                            }
                        }
                    }
                    FileEvent::Deleted(path) => {
                        // Handle file deletion
                        info!("File deleted: {}", path.display());
                    }
                }
            }
        });

        // Start WebSocket server
        let server = HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(file_indexer.clone()))
                .app_data(web::Data::new(vector_search.clone()))
                .route("/ws", web::get().to(ws_handler))
        })
        .bind((host, port))?;

        info!("WebSocket server started on {}:{}", host, port);
        server.run().await.map_err(|e| AppError::Other(e.to_string()))
    }
}

async fn ws_handler(
    req: HttpRequest,
    stream: web::Payload,
    file_indexer: web::Data<Arc<FileIndexer>>,
    vector_search: web::Data<Arc<VectorSearch>>,
) -> Result<HttpResponse, Error> {
    let (response, mut session, mut msg_stream) = actix_ws::handle(&req, stream)?;

    // Start WebSocket handler
    tokio::spawn(async move {
        while let Some(Ok(msg)) = msg_stream.next().await {
            match msg {
                WsMessage::Text(text) => {
                    match serde_json::from_str::<WebSocketMessage>(&text) {
                        Ok(ws_msg) => {
                            let result = match ws_msg {
                                WebSocketMessage::Search(query) => {
                                    handle_search(&query, &vector_search).await
                                }
                                WebSocketMessage::IndexFolder { path } => {
                                    handle_index_folder(&path, &file_indexer, &vector_search).await
                                }
                                WebSocketMessage::RemoveFolder { path } => {
                                    handle_remove_folder(&path, &file_indexer).await
                                }
                                _ => Err(AppError::Other("Invalid message type".to_string())),
                            };

                            let response = match result {
                                Ok(msg) => msg,
                                Err(e) => json!({
                                    "type": "error",
                                    "message": e.to_string()
                                }),
                            };

                            if let Err(e) = session.text(response.to_string()).await {
                                error!("Failed to send WebSocket response: {}", e);
                                break;
                            }
                        }
                        Err(e) => {
                            error!("Failed to parse WebSocket message: {}", e);
                            if let Err(e) = session.text(json!({
                                "type": "error",
                                "message": "Invalid message format"
                            }).to_string()).await {
                                error!("Failed to send error response: {}", e);
                                break;
                            }
                        }
                    }
                }
                WsMessage::Close(reason) => {
                    info!("WebSocket connection closed: {:?}", reason);
                    break;
                }
                _ => {}
            }
        }

        let _ = session.close(None).await;
    });

    Ok(response)
}

async fn handle_search(
    query: &SearchQuery,
    vector_search: &web::Data<Arc<VectorSearch>>,
) -> Result<serde_json::Value, AppError> {
    let limit = query.limit.unwrap_or(10);
    let result = vector_search.search(&query.text, limit).await?;

    Ok(json!({
        "type": "searchResult",
        "data": result
    }))
}

async fn handle_index_folder(
    path: &str,
    file_indexer: &web::Data<Arc<FileIndexer>>,
    vector_search: &web::Data<Arc<VectorSearch>>,
) -> Result<serde_json::Value, AppError> {
    let path = std::path::PathBuf::from(path);
    file_indexer.add_folder(path.clone()).await?;

    let mut files = file_indexer.index_folder(&path).await?;
    for file in files.iter_mut() {
        vector_search.add_document(file).await?;
    }

    Ok(json!({
        "type": "indexingComplete",
        "data": {
            "path": path,
            "fileCount": files.len()
        }
    }))
}

async fn handle_remove_folder(
    path: &str,
    file_indexer: &web::Data<Arc<FileIndexer>>,
) -> Result<serde_json::Value, AppError> {
    // Implement folder removal logic here
    Ok(json!({
        "type": "folderRemoved",
        "data": { "path": path }
    }))
}

