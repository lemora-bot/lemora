/**
 * Lemora Wallet Tracker - Main Type Definitions
 * This file contains all the core type definitions used throughout the application
 */

export interface WalletData {
  address: string;
  balance: number;
  lastUpdated: Date;
  transactions: Transaction[];
}

export interface Transaction {
  signature: string;
  timestamp: number;
  type: TransactionType;
  amount: number;
  token: TokenInfo;
  from: string;
  to: string;
  fee: number;
  status: TransactionStatus;
}

export enum TransactionType {
  SWAP = 'SWAP',
  TRANSFER = 'TRANSFER',
  MINT = 'MINT',
  BURN = 'BURN',
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED'
}

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoURI?: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}
