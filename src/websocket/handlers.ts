/**
 * Lemora Wallet Tracker - WebSocket Message Handlers
 * Handles different types of WebSocket messages for real-time updates
 */

import { StreamMessage, MessageType, TransactionStreamData, PriceStreamData } from '../types/websocket.types';
import { Transaction, TokenInfo } from '../types';
import { logInfo, logError, logWarning } from '../utils/logging.util';

export class WebSocketHandlers {
  private transactionCallbacks: ((transaction: Transaction) => void)[] = [];
  private priceUpdateCallbacks: ((priceData: PriceStreamData) => void)[] = [];
  private errorCallbacks: ((error: Error) => void)[] = [];

  /**
   * Handles incoming WebSocket messages based on their type
   */
  public handleMessage(message: StreamMessage): void {
    logInfo(`Handling WebSocket message of type: ${message.type}`);

    switch (message.type) {
      case MessageType.TRANSACTION_UPDATE:
        this.handleTransactionUpdate(message.data as TransactionStreamData);
        break;
      
      case MessageType.PRICE_UPDATE:
        this.handlePriceUpdate(message.data as PriceStreamData);
        break;
      
      case MessageType.WALLET_BALANCE:
        this.handleWalletBalanceUpdate(message.data);
        break;
      
      case MessageType.ERROR:
        this.handleError(message.data);
        break;
      
      case MessageType.HEARTBEAT:
        this.handleHeartbeat(message.data);
        break;
      
      default:
        logWarning(`Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handles transaction update messages
   */
  private handleTransactionUpdate(data: TransactionStreamData): void {
    try {
      const transaction = this.parseTransactionData(data);
      this.notifyTransactionListeners(transaction);
    } catch (error) {
      logError('Error handling transaction update', error);
      this.notifyErrorListeners(error as Error);
    }
  }

  /**
   * Handles price update messages
   */
  private handlePriceUpdate(data: PriceStreamData): void {
    try {
      this.validatePriceData(data);
      this.notifyPriceListeners(data);
    } catch (error) {
      logError('Error handling price update', error);
      this.notifyErrorListeners(error as Error);
    }
  }

  /**
   * Handles wallet balance update messages
   */
  private handleWalletBalanceUpdate(data: any): void {
    logInfo('Wallet balance update received', data);
    // Implement wallet balance update logic
  }

  /**
   * Handles error messages
   */
  private handleError(error: any): void {
    logError('WebSocket error received', error);
    this.notifyErrorListeners(new Error(error.message || 'Unknown WebSocket error'));
  }

  /**
   * Handles heartbeat messages
   */
  private handleHeartbeat(data: any): void {
    logInfo('Heartbeat received', { timestamp: data.timestamp });
  }

  /**
   * Parses raw transaction data into Transaction object
   */
  private parseTransactionData(data: TransactionStreamData): Transaction {
    return {
      signature: data.signature,
      timestamp: data.timestamp,
      type: this.determineTransactionType(data.type),
      amount: data.amount,
      token: {
        address: data.tokenAddress,
        symbol: '',
        name: '',
        decimals: 0
      } as TokenInfo,
      from: data.walletAddress,
      to: '',
      fee: 0,
      status: data.confirmed ? 'CONFIRMED' : 'PENDING'
    } as Transaction;
  }

  /**
   * Determines transaction type from string
   */
  private determineTransactionType(type: string): string {
    const typeMap: Record<string, string> = {
      'swap': 'SWAP',
      'transfer': 'TRANSFER',
      'mint': 'MINT',
      'burn': 'BURN'
    };
    
    return typeMap[type.toLowerCase()] || 'TRANSFER';
  }

  /**
   * Validates price data structure
   */
  private validatePriceData(data: PriceStreamData): void {
    if (!data.tokenAddress || typeof data.price !== 'number') {
      throw new Error('Invalid price data structure');
    }
  }

  /**
   * Registers a transaction update callback
   */
  public onTransaction(callback: (transaction: Transaction) => void): void {
    this.transactionCallbacks.push(callback);
  }

  /**
   * Registers a price update callback
   */
  public onPriceUpdate(callback: (priceData: PriceStreamData) => void): void {
    this.priceUpdateCallbacks.push(callback);
  }

  /**
   * Registers an error callback
   */
  public onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Notifies all transaction listeners
   */
  private notifyTransactionListeners(transaction: Transaction): void {
    this.transactionCallbacks.forEach(callback => {
      try {
        callback(transaction);
      } catch (error) {
        logError('Error in transaction callback', error);
      }
    });
  }

  /**
   * Notifies all price listeners
   */
  private notifyPriceListeners(priceData: PriceStreamData): void {
    this.priceUpdateCallbacks.forEach(callback => {
      try {
        callback(priceData);
      } catch (error) {
        logError('Error in price callback', error);
      }
    });
  }

  /**
   * Notifies all error listeners
   */
  private notifyErrorListeners(error: Error): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (error) {
        logError('Error in error callback', error);
      }
    });
  }

  /**
   * Removes all registered callbacks
   */
  public removeAllListeners(): void {
    this.transactionCallbacks = [];
    this.priceUpdateCallbacks = [];
    this.errorCallbacks = [];
  }
}
