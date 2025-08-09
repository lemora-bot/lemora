import { EventEmitter } from 'events';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;

  constructor(private url: string) {
    super();
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
        resolve();
        return;
      }

      this.isConnecting = true;
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startPing();
        this.emit('connected');
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.stopPing();
        this.emit('disconnected', event);
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', error);
        reject(error);
      };
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this.stopPing();
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  subscribe(address: string): void {
    this.send({
      type: 'subscribe',
      data: { address },
      timestamp: Date.now()
    });
  }

  unsubscribe(address: string): void {
    this.send({
      type: 'unsubscribe',
      data: { address },
      timestamp: Date.now()
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    this.updateConnectionMetrics('message_received');
    
    try {
      this.validateMessage(message);
      
      switch (message.type) {
        case 'transaction':
          this.processTransactionMessage(message.data);
          break;
        case 'balance_update':
          this.processBalanceUpdate(message.data);
          break;
        case 'price_update':
          this.processPriceUpdate(message.data);
          break;
        case 'wallet_status':
          this.processWalletStatus(message.data);
          break;
        case 'error':
          this.processErrorMessage(message.data);
          break;
        case 'pong':
          this.processPongMessage(message);
          break;
        case 'subscription_confirmed':
          this.processSubscriptionConfirmation(message.data);
          break;
        case 'market_data':
          this.processMarketData(message.data);
          break;
        case 'system_status':
          this.processSystemStatus(message.data);
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
          this.emit('unknownMessage', message);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      this.emit('messageError', { error, message });
    }
  }

  private validateMessage(message: WebSocketMessage): void {
    if (!message.type || typeof message.type !== 'string') {
      throw new Error('Invalid message format: missing or invalid type');
    }
    
    if (!message.timestamp || typeof message.timestamp !== 'number') {
      throw new Error('Invalid message format: missing or invalid timestamp');
    }
    
    const messageAge = Date.now() - message.timestamp;
    if (messageAge > 60000) { // 1 minute
      console.warn(`Received old message: ${messageAge}ms old`);
    }
  }

  private processTransactionMessage(data: any): void {
    if (data && data.signature && data.walletAddress) {
      this.emit('transaction', {
        ...data,
        processedAt: Date.now(),
        source: 'websocket'
      });
    } else {
      console.error('Invalid transaction data received');
    }
  }

  private processBalanceUpdate(data: any): void {
    if (data && data.address && typeof data.balance === 'number') {
      this.emit('balanceUpdate', {
        ...data,
        lastUpdated: Date.now()
      });
    }
  }

  private processPriceUpdate(data: any): void {
    if (data && data.mint && typeof data.price === 'number') {
      this.emit('priceUpdate', {
        ...data,
        receivedAt: Date.now()
      });
    }
  }

  private processWalletStatus(data: any): void {
    this.emit('walletStatus', data);
  }

  private processErrorMessage(data: any): void {
    console.error('WebSocket server error:', data);
    this.emit('serverError', data);
  }

  private processPongMessage(message: WebSocketMessage): void {
    const latency = Date.now() - message.timestamp;
    this.updateConnectionMetrics('pong_received', latency);
  }

  private processSubscriptionConfirmation(data: any): void {
    console.log('Subscription confirmed:', data);
    this.emit('subscriptionConfirmed', data);
  }

  private processMarketData(data: any): void {
    this.emit('marketData', data);
  }

  private processSystemStatus(data: any): void {
    this.emit('systemStatus', data);
  }

  private updateConnectionMetrics(event: string, value?: number): void {
    // Implementation for connection metrics tracking
    const timestamp = Date.now();
    console.log(`WebSocket metric: ${event}`, { timestamp, value });
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max delay of 30 seconds
    );
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect().catch((error) => {
          console.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error);
          this.emit('reconnectFailed', {
            attempt: this.reconnectAttempts,
            error,
            nextAttempt: this.reconnectAttempts < this.maxReconnectAttempts
          });
        });
      } else {
        console.error('Max reconnection attempts reached');
        this.emit('reconnectExhausted', {
          totalAttempts: this.reconnectAttempts,
          maxAttempts: this.maxReconnectAttempts
        });
      }
    }, delay);
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'CLOSED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }
}
