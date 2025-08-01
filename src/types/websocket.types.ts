/**
 * Lemora Wallet Tracker - WebSocket Type Definitions
 * Types for real-time communication and streaming data
 */

export interface WebSocketConfig {
  url: string;
  apiKey: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface WebSocketConnection {
  id: string;
  status: ConnectionStatus;
  connectedAt?: Date;
  lastHeartbeat?: Date;
  subscriptions: Subscription[];
}

export enum ConnectionStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

export interface Subscription {
  id: string;
  type: SubscriptionType;
  params: SubscriptionParams;
  createdAt: Date;
}

export enum SubscriptionType {
  WALLET_UPDATES = 'WALLET_UPDATES',
  TOKEN_PRICES = 'TOKEN_PRICES',
  TRANSACTION_STREAM = 'TRANSACTION_STREAM',
  MARKET_DATA = 'MARKET_DATA'
}

export interface SubscriptionParams {
  walletAddresses?: string[];
  tokenAddresses?: string[];
  updateFrequency?: number;
  filters?: StreamFilters;
}

export interface StreamFilters {
  minAmount?: number;
  maxAmount?: number;
  tokenTypes?: string[];
  transactionTypes?: string[];
}

export interface StreamMessage {
  id: string;
  subscription: string;
  type: MessageType;
  data: any;
  timestamp: number;
}

export enum MessageType {
  TRANSACTION_UPDATE = 'TRANSACTION_UPDATE',
  PRICE_UPDATE = 'PRICE_UPDATE',
  WALLET_BALANCE = 'WALLET_BALANCE',
  ERROR = 'ERROR',
  HEARTBEAT = 'HEARTBEAT'
}

export interface TransactionStreamData {
  signature: string;
  walletAddress: string;
  type: string;
  amount: number;
  tokenAddress: string;
  timestamp: number;
  confirmed: boolean;
}

export interface PriceStreamData {
  tokenAddress: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  timestamp: number;
}
