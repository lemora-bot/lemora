/**
 * Lemora Wallet Tracker - Filter Rules Engine
 * Advanced filtering rules for transaction and token data
 */

import { Transaction, TokenInfo } from '../types';
import { CONSTANTS } from '../config/constants';

export interface FilterRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  condition: FilterCondition;
  action: FilterAction;
}

export interface FilterCondition {
  type: 'AND' | 'OR';
  rules: ConditionRule[];
}

export interface ConditionRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
}

export interface FilterAction {
  type: 'include' | 'exclude' | 'flag' | 'transform';
  parameters?: Record<string, any>;
}

export class SimpleFilter {
  private spamTokens = new Set(['SPAM', 'SCAM', 'FAKE']);
  private trustedTokens = new Set(['SOL', 'USDC', 'USDT']);

  filterTransactions(transactions: Transaction[]): Transaction[] {
    return transactions.filter(tx => {
      if (this.isSpamToken(tx.token?.symbol)) return false;
      if (tx.amount < 0.0001) return false;
      return true;
    });
  }

  getLargeTransactions(transactions: Transaction[], threshold = 1000): Transaction[] {
    return transactions.filter(tx => (tx.amount * tx.price) > threshold);
  }

  getTradingTransactions(transactions: Transaction[]): Transaction[] {
    const tradingTypes = ['SWAP', 'TRANSFER'];
    return transactions.filter(tx => tradingTypes.includes(tx.type));
  }

  private isSpamToken(symbol?: string): boolean {
    if (!symbol) return false;
    const upperSymbol = symbol.toUpperCase();
    return this.spamTokens.has(upperSymbol) || upperSymbol.includes('SPAM');
  }

  addSpamToken(symbol: string): void {
    this.spamTokens.add(symbol.toUpperCase());
  }

  removeSpamToken(symbol: string): void {
    this.spamTokens.delete(symbol.toUpperCase());
  }

  addTrustedToken(symbol: string): void {
    this.trustedTokens.add(symbol.toUpperCase());
  }

  getTrustedTokens(): string[] {
    return Array.from(this.trustedTokens);
  }
}
