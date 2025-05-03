"use client"

type MessageHandler = (data: any) => void

export class WebSocketService {
  private socket: WebSocket | null = null
  private messageHandlers: Map<string, MessageHandler[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private connected: boolean = false
  private messageQueue: string[] = []
  
  constructor(private url: string = "ws://localhost:8080/ws") {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {


      this.socket = new WebSocket(this.url)

      this.socket.onopen = () => {
        console.log("WebSocket connected")
        this.reconnectAttempts = 0
        this.connected = true
        
        // Send any queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift()
          if (message && this.socket) {
            this.socket.send(message)
          }
        }
        
        resolve()
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const messageType = Object.keys(data)[0]

          if (this.messageHandlers.has(messageType)) {
            this.messageHandlers.get(messageType)?.forEach((handler) => handler(data[messageType]))
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error)
        reject(error)
      }

      this.socket.onclose = () => {
        console.log("WebSocket closed")
        this.connected = false
        this.attemptReconnect()
      }
    })
  }

  private attemptReconnect() {


    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++

      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

      this.reconnectTimeout = setTimeout(() => {
        this.connect().catch(() => {
          console.error("Reconnect failed")
        })
      }, delay)
    } else {
      console.error("Max reconnect attempts reached")
    }
  }

  disconnect() {


    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  on(messageType: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, [])
    }

    this.messageHandlers.get(messageType)?.push(handler)
  }

  off(messageType: string, handler: MessageHandler) {
    if (this.messageHandlers.has(messageType)) {
      const handlers = this.messageHandlers.get(messageType) || []
      const index = handlers.indexOf(handler)

      if (index !== -1) {
        handlers.splice(index, 1)
      }
    }
  }
  
  // search method is implemented below using the send method
  
  private sendMessage(message: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message)
    } else {
      // Queue the message to be sent when the connection is established
      this.messageQueue.push(message)
    }
  }

  send(messageType: string, data: any) {


    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = { [messageType]: data }
      this.socket.send(JSON.stringify(message))
    } else {
      console.error("WebSocket not connected")
    }
  }

  search(query: string) {
    this.send("search", { query })
  }

  indexFolder(path: string) {
    this.send("indexFolder", { path })
  }

  removeFolder(path: string) {
    this.send("removeFolder", { path })
  }
}

// Singleton instance
let websocketService: WebSocketService | null = null

export function getWebSocketService() {
  if (!websocketService) {
    websocketService = new WebSocketService("ws://localhost:8080")
  }

  return websocketService
}
