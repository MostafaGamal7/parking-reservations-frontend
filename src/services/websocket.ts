import { WebSocketMessage } from "@/types";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000/api/v1/ws";

export type WebSocketEventHandler = (message: WebSocketMessage) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private eventHandlers: Set<WebSocketEventHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private subscribedGates: Set<string> = new Set();
  private lastError: string | null = null;
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.connect();
      // Set up periodic connection check
      this.connectionCheckInterval = setInterval(() => {
        this.checkConnection();
      }, 5000);
    }
  }

  private connect(): void {
    if (this.isConnecting) {
      return;
    }

    // Don't try to reconnect if we've exceeded max attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    // If we have an existing connection that's open or connecting, don't create a new one
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        return;
      }
      // Clean up existing connection
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
    }

    this.isConnecting = true;
    this.reconnectAttempts++;

    try {
      console.log(`Connecting to WebSocket (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.lastError = null;

        // Re-subscribe to previously subscribed gates
        const gatesToResubscribe = Array.from(this.subscribedGates);
        this.subscribedGates.clear(); // Clear and resubscribe to ensure clean state
        gatesToResubscribe.forEach((gateId) => {
          this.subscribe(gateId);
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.eventHandlers.forEach((handler) => {
            try {
              handler(message);
            } catch (err) {
              console.error('Error in WebSocket message handler:', err);
            }
          });
        } catch (error) {
          console.error("Error parsing WebSocket message:", error, event.data);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code} ${event.reason}`);
        this.isConnecting = false;
        
        // Don't try to reconnect if this was a normal closure
        if (event.code === 1000) {
          console.log('WebSocket closed normally');
          return;
        }
        
        this.attemptReconnect();
      };

      this.ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        this.lastError = 'WebSocket connection error';
        // The onclose handler will be called after onerror
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      this.isConnecting = false;
      this.lastError = error?.toString() || 'Failed to create WebSocket connection';
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnection attempts reached");
      this.lastError = 'Unable to connect to server. Please refresh the page to try again.';
      return;
    }

    const baseDelay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      30000 // Max 30 seconds delay
    );
    
    // Add some jitter to prevent thundering herd
    const jitter = Math.random() * 1000;
    const delay = Math.floor(baseDelay + jitter);

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  subscribe(gateId: string): void {
    if (!gateId) return;
    
    // Add to subscribed gates first to ensure it gets subscribed on reconnect
    this.subscribedGates.add(gateId);
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(
          JSON.stringify({
            type: "subscribe",
            payload: { gateId },
          })
        );
      } catch (error) {
        console.error('Error sending subscribe message:', error);
      }
    } else {
      // If not connected, try to connect (will resubscribe on open)
      this.connect();
    }
  }

  unsubscribe(gateId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "unsubscribe",
          payload: { gateId },
        })
      );
      this.subscribedGates.delete(gateId);
    }
  }

  addEventListener(handler: WebSocketEventHandler): () => void {
    this.eventHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  getConnectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
  
  getLastError(): string | null {
    return this.lastError;
  }
  
  private checkConnection(): void {
    // If we think we're connected but the readyState says otherwise, update our state
    if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
      console.log('Connection check failed, reconnecting...');
      this.connect();
    }
  }

  getConnectionStatus(): "connected" | "disconnected" | "connecting" {
    if (this.isConnecting) return "connecting";
    if (this.isConnected()) return "connected";
    return "disconnected";
  }

  disconnect(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
    
    if (this.ws) {
      try {
        this.ws.close(1000, 'Client disconnecting');
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      this.ws = null;
    }
    
    this.eventHandlers.clear();
    this.subscribedGates.clear();
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null;

export const getWebSocketClient = (): WebSocketClient => {
  if (!wsClient && typeof window !== "undefined") {
    wsClient = new WebSocketClient();
  }
  return wsClient!;
};

// Hook for React components
export const useWebSocket = () => {
  const client = getWebSocketClient();

  return {
    subscribe: client.subscribe.bind(client),
    unsubscribe: client.unsubscribe.bind(client),
    addEventListener: client.addEventListener.bind(client),
    isConnected: client.isConnected.bind(client),
    getConnectionState: client.getConnectionState.bind(client),
    getConnectionStatus: client.getConnectionStatus.bind(client),
  };
};
