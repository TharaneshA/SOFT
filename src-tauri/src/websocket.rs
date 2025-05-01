use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use std::thread;
use ws::{listen, Handler, Message, Sender, CloseCode};
use serde::{Serialize, Deserialize};
use serde_json;

#[derive(Debug, Serialize, Deserialize)]
pub enum WebSocketMessage {
    Search { query: String },
    IndexFolder { path: String },
    RemoveFolder { path: String },
    SearchResult { files: Vec<String> },
    Error { message: String },
}

struct WebSocketHandler {
    out: Sender,
    clients: Arc<Mutex<HashMap<usize, Sender>>>,
    id: usize,
}

impl Handler for WebSocketHandler {
    fn on_open(&mut self, _: ws::Handshake) -> ws::Result<()> {
        // Add the new client to our map
        self.clients.lock().unwrap().insert(self.id, self.out.clone());
        Ok(())
    }

    fn on_message(&mut self, msg: Message) -> ws::Result<()> {
        // Parse the message
        if let Ok(text) = msg.as_text() {
            match serde_json::from_str::<WebSocketMessage>(text) {
                Ok(message) => {
                    // Process the message based on its type
                    match message {
                        WebSocketMessage::Search { query } => {
                            // In a real implementation, this would call the search function
                            println!("Received search query: {}", query);
                            
                            // Send a mock response
                            let response = WebSocketMessage::SearchResult { 
                                files: vec!["file1.txt".to_string(), "file2.pdf".to_string()] 
                            };
                            let response_json = serde_json::to_string(&response).unwrap();
                            self.out.send(response_json)
                        },
                        WebSocketMessage::IndexFolder { path } => {
                            // In a real implementation, this would call the index function
                            println!("Indexing folder: {}", path);
                            Ok(())
                        },
                        WebSocketMessage::RemoveFolder { path } => {
                            // In a real implementation, this would remove the folder from indexing
                            println!("Removing folder: {}", path);
                            Ok(())
                        },
                        _ => {
                            // Client shouldn't send other message types
                            let error = WebSocketMessage::Error { 
                                message: "Invalid message type".to_string() 
                            };
                            let error_json = serde_json::to_string(&error).unwrap();
                            self.out.send(error_json)
                        }
                    }
                },
                Err(e) => {
                    // Send an error message back to the client
                    let error = WebSocketMessage::Error { 
                        message: format!("Failed to parse message: {}", e) 
                    };
                    let error_json = serde_json::to_string(&error).unwrap();
                    self.out.send(error_json)
                }
            }
        } else {
            // Send an error message back to the client
            let error = WebSocketMessage::Error { 
                message: "Message must be text".to_string() 
            };
            let error_json = serde_json::to_string(&error).unwrap();
            self.out.send(error_json)
        }
    }

    fn on_close(&mut self, _: CloseCode, _: &str) {
        // Remove the client from our map
        self.clients.lock().unwrap().remove(&self.id);
    }
}

pub fn start_websocket_server(port: u16) {
    let clients = Arc::new(Mutex::new(HashMap::new()));
    let clients_clone = clients.clone();
    
    thread::spawn(move || {
        let mut id_counter = 0;
        
        listen(format!("127.0.0.1:{}", port), move |out| {
            id_counter += 1;
            WebSocketHandler {
                out,
                clients: clients_clone.clone(),
                id: id_counter,
            }
        }).unwrap();
    });
}
