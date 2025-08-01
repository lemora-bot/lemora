/**
 * Lemora Wallet Tracker - WebSocket Connection Manager
 * Manages WebSocket connections for real-time Solana data streaming
 */

import { WebSocketConfig, ConnectionStatus, WebSocketConnection } from '../types/websocket.types';
import { CONFIG } from '../config/config';
import { logInfo, logError, logWarning } from '../utils/logging.util';

export class WebSocketConnectionManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts: number = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, Function> = new Map();
  private connectionInfo: WebSocketConnection;
  
  constructor(config: WebSocketConfig) {
    this.config = config;
    this.connectionInfo = {
      id: this.generateConnectionId(),
      status: ConnectionStatus.DISCONNECTED,
      subscriptions: []
    };
  }

  /**
   * Establishes WebSocket connection to Helius API
   */
  public async connect(): Promise<void> {
    try {
      this.updateConnectionStatus(ConnectionStatus.CONNECTING);
      
      const wsUrl = `${this.config.url}?api-key=${this.config.apiKey}`;
      this.ws = new WebSocket(wsUrl);
      
      this.setupEventHandlers();
      
    } catch (error) {
      logError('Failed to establish WebSocket connection', error);
      this.handleConnectionError(error);
    }
  }

  /**
   * Sets up WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onerror = this.handleError.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
  }

  /**
   * Handles WebSocket connection open event
   */
  private handleOpen(): void {
    logInfo('WebSocket connection established');
    this.updateConnectionStatus(ConnectionStatus.CONNECTED);
    this.reconnectAttempts = 0;
    this.connectionInfo.connectedAt = new Date();
    this.startHeartbeat();
  }

  /**
   * Handles incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      this.processMessage(message);
    } catch (error) {
      logError('Failed to process WebSocket message', error);
    }
  }

  /**
   * Processes parsed WebSocket messages
   */
  private processMessage(message: any): void {
    const { type, data } = message;
    
    if (type === 'heartbeat') {
      this.connectionInfo.lastHeartbeat = new Date();
      return;
    }

    const handler = this.messageHandlers.get(type);
    if (handler) {
      handler(data);
    } else {
      logWarning(`No handler registered for message type: ${type}`);
    }
  }

  /**
   * Handles WebSocket errors
   */
  private handleError(error: Event): void {
    logError('WebSocket error occurred', error);
    this.updateConnectionStatus(ConnectionStatus.ERROR);
  }

  /**
   * Handles WebSocket connection close event
   */
  private handleClose(event: CloseEvent): void {
    logInfo(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
    this.updateConnectionStatus(ConnectionStatus.DISCONNECTED);
    this.stopHeartbeat();
    
    if (!event.wasClean) {
      this.attemptReconnection();
    }
  }

  /**
   * Attempts to reconnect to WebSocket
   */
  private attemptReconnection(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      logError('Maximum reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.updateConnectionStatus(ConnectionStatus.RECONNECTING);
    
    logInfo(`Attempting reconnection ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
    
    setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval);
  }

  /**
   * Starts heartbeat mechanism
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'heartbeat', timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stops heartbeat mechanism
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Sends data through WebSocket
   */
  public send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      logWarning('Cannot send data: WebSocket is not connected');
    }
  }

  /**
   * Registers a message handler for a specific message type
   */
  public registerHandler(type: string, handler: Function): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Disconnects WebSocket connection
   */
  public disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client initiated disconnect');
      this.ws = null;
    }
  }

  /**
   * Updates connection status
   */
  private updateConnectionStatus(status: ConnectionStatus): void {
    this.connectionInfo.status = status;
    logInfo(`Connection status updated: ${status}`);
  }

  /**
   * Generates unique connection ID
   */
  private generateConnectionId(): string {
    return `lemora-ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handles connection errors
   */
  private handleConnectionError(error: any): void {
    logError('Connection error handler invoked', error);
    this.updateConnectionStatus(ConnectionStatus.ERROR);
    this.attemptReconnection();
  }

  /**
   * Gets current connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionInfo.status;
  }

  /**
   * Gets connection information
   */
  public getConnectionInfo(): WebSocketConnection {
    return { ...this.connectionInfo };
  }
}
