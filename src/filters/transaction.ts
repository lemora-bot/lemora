/**
 * Lemora Wallet Tracker - Transaction Filter
 * Implements smart filtering for transaction data
 */

import { Transaction, TransactionType } from '../types';
import { CONSTANTS } from '../config/constants';

export interface FilterOptions {
  minAmount?: number;
  maxAmount?: number;
  tokenAddresses?: string[];
  walletAddresses?: string[];
  transactionTypes?: TransactionType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export class QuickClassifier {
  classifyTransaction(tx: Transaction): 'BUY' | 'SELL' | 'TRANSFER' | 'OTHER' {
    if (tx.type === 'SWAP') {
      return tx.amount > 0 ? 'BUY' : 'SELL';
    }
    if (tx.type === 'TRANSFER') {
      return 'TRANSFER';
    }
    return 'OTHER';
  }

  isSignificantTrade(tx: Transaction, minValue = 100): boolean {
    return (tx.amount * (tx.price || 0)) >= minValue;
  }

  getTradeSize(tx: Transaction): 'SMALL' | 'MEDIUM' | 'LARGE' | 'WHALE' {
    const value = tx.amount * (tx.price || 0);
    if (value < 100) return 'SMALL';
    if (value < 1000) return 'MEDIUM';
    if (value < 10000) return 'LARGE';
    return 'WHALE';
  }

  getRecentTrades(transactions: Transaction[], hours = 24): Transaction[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return transactions.filter(tx => tx.timestamp >= cutoff);
  }

  groupByToken(transactions: Transaction[]): Map<string, Transaction[]> {
    const groups = new Map<string, Transaction[]>();
    
    transactions.forEach(tx => {
      const token = tx.token?.address || 'SOL';
      if (!groups.has(token)) {
        groups.set(token, []);
      }
      groups.get(token)!.push(tx);
    });
    
    return groups;
  }

  calculateProfitLoss(trades: Transaction[]): number {
    let totalPnL = 0;
    const holdings = new Map<string, { amount: number; avgPrice: number }>();
    
    trades.forEach(trade => {
      const token = trade.token?.address || 'SOL';
      const classification = this.classifyTransaction(trade);
      
      if (classification === 'BUY') {
        const current = holdings.get(token) || { amount: 0, avgPrice: 0 };
        const newAmount = current.amount + trade.amount;
        const newAvgPrice = ((current.avgPrice * current.amount) + (trade.price * trade.amount)) / newAmount;
        holdings.set(token, { amount: newAmount, avgPrice: newAvgPrice });
      } else if (classification === 'SELL') {
        const current = holdings.get(token);
        if (current && current.amount > 0) {
          const sellAmount = Math.min(trade.amount, current.amount);
          totalPnL += (trade.price - current.avgPrice) * sellAmount;
          current.amount -= sellAmount;
        }
      }
    });
    
    return totalPnL;
  }
}
