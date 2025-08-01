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

export interface HeliusTransactionResponse {
  signature: string;
  timestamp: number;
  slot: number;
  fee: number;
  status: string;
  type: string;
  source: string;
  accountData: AccountData[];
  tokenTransfers: TokenTransfer[];
}

export interface AccountData {
  account: string;
  nativeBalanceChange: number;
  tokenBalanceChanges: TokenBalanceChange[];
}

export interface TokenBalanceChange {
  mint: string;
  rawTokenAmount: RawTokenAmount;
  tokenAccount: string;
  userAccount: string;
}

export interface RawTokenAmount {
  decimals: number;
  tokenAmount: string;
}

export interface TokenTransfer {
  fromTokenAccount: string;
  toTokenAccount: string;
  fromUserAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  mint: string;
  tokenStandard: string;
}

export interface BirdeyeTokenResponse {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  liquidity: number;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  logoURI?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export interface BirdeyePriceResponse {
  value: number;
  updateUnixTime: number;
  updateHumanTime: string;
  priceChange24h: number;
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
