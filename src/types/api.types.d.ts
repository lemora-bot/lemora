export interface APIConfig {
  baseURL: string;
  headers: Record<string, string>;
  timeout: number;
  retryCount?: number;
  retryDelay?: number;
}

export interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  config: APIConfig;
  data?: any;
  params?: Record<string, any>;
}

export interface HeliusTransactionResponse {
  signature: string;
  blockTime: number;
  slot: number;
  fee: number;
  status: 'success' | 'failed';
  accounts: string[];
  instructions: HeliusInstruction[];
  innerInstructions?: HeliusInnerInstruction[];
  logs?: string[];
}

export interface HeliusInstruction {
  programId: string;
  accounts: string[];
  data: string;
  parsed?: any;
}

export interface HeliusInnerInstruction {
  index: number;
  instructions: HeliusInstruction[];
}

export interface BirdeyeTokenResponse {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  fdv: number;
  holders: number;
  supply: number;
}

export interface JupiterPriceResponse {
  data: Record<string, {
    id: string;
    mintSymbol: string;
    vsToken: string;
    vsTokenSymbol: string;
    price: number;
  }>;
  timeTaken: number;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface CachedResponse<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}
