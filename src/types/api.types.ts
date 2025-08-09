/**
 * Lemora Wallet Tracker - API Type Definitions
 * Types for API requests, responses, and configurations
 */

export interface APIConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  retryConfig: RetryConfig;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition: (error: any) => boolean;
}

export interface HeliusAPIConfig extends APIConfig {
  apiKey: string;
  network: 'mainnet-beta' | 'devnet' | 'testnet';
}

export interface BirdeyeAPIConfig extends APIConfig {
  apiKey: string;
  chain: 'solana';
}

export interface APIRequest {
  method: HTTPMethod;
  endpoint: string;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

export interface SimpleTransactionData {
  id: string;
  amount: number;
  timestamp: number;
  walletAddress: string;
  tokenMint: string;
  transactionType: 'BUY' | 'SELL' | 'TRANSFER';
  priceUSD: number;
  success: boolean;
  gasFee: number;
}

export interface TokenPriceData {
  mint: string;
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdate: number;
}

export interface WalletAnalytics {
  address: string;
  totalTransactions: number;
  totalVolumeUSD: number;
  profitLossUSD: number;
  winRate: number;
  averageHoldTime: number;
  riskScore: number;
  activeTokens: string[];
  lastActivityTime: number;
}

export interface MarketSummary {
  totalMarketCap: number;
  totalVolume24h: number;
  topGainers: TokenPriceData[];
  topLosers: TokenPriceData[];
  trendingTokens: string[];
  marketSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  lastUpdated: number;
}

export interface AlertConfiguration {
  id: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'VOLUME_SPIKE' | 'NEW_TOKEN';
  tokenMint?: string;
  walletAddress?: string;
  threshold: number;
  enabled: boolean;
  lastTriggered?: number;
}

export interface TradeSignal {
  tokenMint: string;
  signalType: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string[];
  priceTarget?: number;
  stopLoss?: number;
  timeframe: '5m' | '15m' | '1h' | '4h' | '1d';
  generatedAt: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: number;
}
