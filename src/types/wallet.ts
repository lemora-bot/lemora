export interface WalletAddress {
  address: string;
  label?: string;
  isWhitelisted: boolean;
  lastActivity: Date;
  totalTransactions: number;
  totalVolume: number;
  averageTransactionValue: number;
  riskScore: number;
  tags: WalletTag[];
}

export interface WalletTag {
  id: string;
  name: string;
  color: string;
  category: TagCategory;
}

export enum TagCategory {
  WHALE = 'whale',
  DEV = 'dev',
  INSIDER = 'insider',
  INFLUENCER = 'influencer',
  BOT = 'bot',
  SUSPICIOUS = 'suspicious',
  VERIFIED = 'verified'
}

export interface WalletBalance {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  valueUSD: number;
  priceChange24h: number;
  logo?: string;
}

export interface WalletTransaction {
  signature: string;
  blockTime: number;
  slot: number;
  fee: number;
  status: TransactionStatus;
  type: TransactionType;
  from: string;
  to: string;
  amount: number;
  mint: string;
  symbol: string;
  price: number;
  valueUSD: number;
  programId: string;
  instructions: TransactionInstruction[];
}

export enum TransactionStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending'
}

export enum TransactionType {
  SWAP = 'swap',
  TRANSFER = 'transfer',
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  MINT = 'mint',
  BURN = 'burn',
  UNKNOWN = 'unknown'
}

export interface TransactionInstruction {
  programId: string;
  accounts: string[];
  data: string;
  parsed?: any;
}

export interface WalletPortfolio {
  address: string;
  totalValueUSD: number;
  totalChange24h: number;
  totalChange24hPercent: number;
  balances: WalletBalance[];
  lastUpdated: Date;
}

export interface WalletAnalytics {
  address: string;
  successfulTrades: number;
  failedTrades: number;
  winRate: number;
  totalPnL: number;
  totalPnLPercent: number;
  averageHoldTime: number;
  mostTradedTokens: TokenStats[];
  tradingVolume24h: number;
  tradingVolume7d: number;
  tradingVolume30d: number;
}

export interface TokenStats {
  mint: string;
  symbol: string;
  name: string;
  tradeCount: number;
  volume: number;
  pnl: number;
  pnlPercent: number;
  averagePrice: number;
  logo?: string;
}
