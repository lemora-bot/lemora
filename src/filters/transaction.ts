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

export class TransactionFilter {
  private blacklistedTokens: Set<string> = new Set();
  private whitelistedWallets: Set<string> = new Set();
  
  constructor() {
    this.initializeDefaultFilters();
  }

  /**
   * Initializes default filter configurations
   */
  private initializeDefaultFilters(): void {
    // Add common spam tokens to blacklist
    this.blacklistedTokens.add('spam-token-address-1');
    this.blacklistedTokens.add('spam-token-address-2');
  }

  /**
   * Filters transactions based on provided options
   */
  public filterTransactions(
    transactions: Transaction[], 
    options: FilterOptions
  ): Transaction[] {
    return transactions.filter(tx => {
      // Check if token is blacklisted
      if (this.isBlacklisted(tx.token.address)) {
        return false;
      }

      // Apply amount filters
      if (!this.passesAmountFilter(tx, options)) {
        return false;
      }

      // Apply token address filter
      if (!this.passesTokenFilter(tx, options)) {
        return false;
      }

      // Apply wallet address filter
      if (!this.passesWalletFilter(tx, options)) {
        return false;
      }

      // Apply transaction type filter
      if (!this.passesTypeFilter(tx, options)) {
        return false;
      }

      // Apply date range filter
      if (!this.passesDateFilter(tx, options)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Checks if a token is blacklisted
   */
  private isBlacklisted(tokenAddress: string): boolean {
    return this.blacklistedTokens.has(tokenAddress);
  }

  /**
   * Checks if transaction passes amount filter
   */
  private passesAmountFilter(
    transaction: Transaction, 
    options: FilterOptions
  ): boolean {
    if (options.minAmount && transaction.amount < options.minAmount) {
      return false;
    }
    
    if (options.maxAmount && transaction.amount > options.maxAmount) {
      return false;
    }
    
    return true;
  }

  /**
   * Checks if transaction passes token filter
   */
  private passesTokenFilter(
    transaction: Transaction, 
    options: FilterOptions
  ): boolean {
    if (!options.tokenAddresses || options.tokenAddresses.length === 0) {
      return true;
    }
    
    return options.tokenAddresses.includes(transaction.token.address);
  }

  /**
   * Checks if transaction passes wallet filter
   */
  private passesWalletFilter(
    transaction: Transaction, 
    options: FilterOptions
  ): boolean {
    if (!options.walletAddresses || options.walletAddresses.length === 0) {
      return true;
    }
    
    return options.walletAddresses.includes(transaction.from) || 
           options.walletAddresses.includes(transaction.to);
  }

  /**
   * Checks if transaction passes type filter
   */
  private passesTypeFilter(
    transaction: Transaction, 
    options: FilterOptions
  ): boolean {
    if (!options.transactionTypes || options.transactionTypes.length === 0) {
      return true;
    }
    
    return options.transactionTypes.includes(transaction.type);
  }

  /**
   * Checks if transaction passes date filter
   */
  private passesDateFilter(
    transaction: Transaction, 
    options: FilterOptions
  ): boolean {
    if (!options.dateRange) {
      return true;
    }
    
    const txDate = new Date(transaction.timestamp);
    
    if (options.dateRange.start && txDate < options.dateRange.start) {
      return false;
    }
    
    if (options.dateRange.end && txDate > options.dateRange.end) {
      return false;
    }
    
    return true;
  }

  /**
   * Adds a token to the blacklist
   */
  public addToBlacklist(tokenAddress: string): void {
    this.blacklistedTokens.add(tokenAddress);
  }

  /**
   * Removes a token from the blacklist
   */
  public removeFromBlacklist(tokenAddress: string): void {
    this.blacklistedTokens.delete(tokenAddress);
  }

  /**
   * Adds a wallet to the whitelist
   */
  public addToWhitelist(walletAddress: string): void {
    this.whitelistedWallets.add(walletAddress);
  }

  /**
   * Removes a wallet from the whitelist
   */
  public removeFromWhitelist(walletAddress: string): void {
    this.whitelistedWallets.delete(walletAddress);
  }

  /**
   * Gets trading-relevant transactions only
   */
  public getTradingTransactions(transactions: Transaction[]): Transaction[] {
    const tradingTypes = [
      TransactionType.SWAP,
      TransactionType.TRANSFER
    ];

    return this.filterTransactions(transactions, {
      transactionTypes: tradingTypes,
      minAmount: CONSTANTS.TRANSACTION.MIN_AMOUNT_FILTER
    });
  }

  /**
   * Clears all filters
   */
  public clearFilters(): void {
    this.blacklistedTokens.clear();
    this.whitelistedWallets.clear();
  }
}
