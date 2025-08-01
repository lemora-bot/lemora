/**
 * Lemora Wallet Tracker - Wallet-specific Type Definitions
 * Extended types for wallet management and tracking
 */

import { Transaction } from './index';

export interface ExtendedWalletData {
  address: string;
  publicKey: string;
  balance: WalletBalance;
  metadata: WalletMetadata;
  transactions: Transaction[];
  trackedTokens: TrackedToken[];
  alerts: WalletAlert[];
}

export interface WalletBalance {
  sol: number;
  tokens: TokenBalance[];
  totalValueUSD: number;
  lastUpdated: Date;
}

export interface TokenBalance {
  tokenAddress: string;
  amount: number;
  decimals: number;
  usdValue?: number;
  percentage?: number;
}

export interface WalletMetadata {
  name?: string;
  tags: string[];
  createdAt: Date;
  lastActive: Date;
  riskScore?: number;
  notes?: string;
}

export interface TrackedToken {
  address: string;
  symbol: string;
  addedAt: Date;
  priceAlerts: PriceAlert[];
  autoSell?: AutoSellConfig;
}

export interface PriceAlert {
  id: string;
  type: 'ABOVE' | 'BELOW';
  price: number;
  enabled: boolean;
  createdAt: Date;
}

export interface AutoSellConfig {
  enabled: boolean;
  triggerPrice: number;
  sellPercentage: number;
}

export interface WalletAlert {
  id: string;
  type: WalletAlertType;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: Date;
  read: boolean;
}

export enum WalletAlertType {
  LARGE_TRANSACTION = 'LARGE_TRANSACTION',
  PRICE_ALERT = 'PRICE_ALERT',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  TOKEN_LISTING = 'TOKEN_LISTING',
  WALLET_COMPROMISE = 'WALLET_COMPROMISE'
}
