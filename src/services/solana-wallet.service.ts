import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import { WalletAddress, WalletTransaction, TransactionType } from '@types/wallet';

export class SolanaWalletService {
  private connection: Connection;
  private heliusEndpoint: string;

  constructor(rpcEndpoint: string, heliusApiKey: string) {
    this.connection = new Connection(rpcEndpoint, 'confirmed');
    this.heliusEndpoint = `https://api.helius.xyz/v0/addresses/${heliusApiKey}`;
  }

  async getWalletInfo(address: string): Promise<WalletAddress> {
    const publicKey = new PublicKey(address);
    const accountInfo = await this.connection.getAccountInfo(publicKey);
    
    if (!accountInfo) {
      throw new Error(`Wallet ${address} not found`);
    }

    const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit: 100 });
    
    return {
      address,
      label: '',
      isWhitelisted: false,
      lastActivity: new Date(signatures[0]?.blockTime * 1000 || Date.now()),
      totalTransactions: signatures.length,
      totalVolume: await this.calculateTotalVolume(address),
      averageTransactionValue: 0,
      riskScore: this.calculateRiskScore(signatures.length),
      tags: []
    };
  }

  async getRecentTransactions(address: string, limit: number = 20): Promise<WalletTransaction[]> {
    const publicKey = new PublicKey(address);
    const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit });
    
    const transactions: WalletTransaction[] = [];
    
    for (const sig of signatures) {
      const tx = await this.connection.getParsedTransaction(sig.signature);
      if (tx) {
        const parsedTx = this.parseTransaction(tx, address);
        if (parsedTx) {
          transactions.push(parsedTx);
        }
      }
    }
    
    return transactions;
  }

  private async calculateTotalVolume(address: string): Promise<number> {
    // Implementation for calculating total volume
    const signatures = await this.connection.getSignaturesForAddress(new PublicKey(address), { limit: 1000 });
    let totalVolume = 0;
    
    // Calculate based on transaction history
    for (const sig of signatures.slice(0, 100)) {
      const tx = await this.connection.getParsedTransaction(sig.signature);
      if (tx?.meta?.postBalances && tx.meta.preBalances) {
        const balanceChange = Math.abs(tx.meta.postBalances[0] - tx.meta.preBalances[0]);
        totalVolume += balanceChange / 1e9; // Convert lamports to SOL
      }
    }
    
    return totalVolume;
  }

  private calculateRiskScore(transactionCount: number): number {
    // Simple risk scoring algorithm
    if (transactionCount < 10) return 0.9;
    if (transactionCount < 100) return 0.5;
    if (transactionCount < 1000) return 0.3;
    return 0.1;
  }

  private parseTransaction(tx: ParsedTransactionWithMeta, walletAddress: string): WalletTransaction | null {
    if (!tx.meta || !tx.blockTime) return null;

    const instruction = tx.transaction.message.instructions[0];
    
    return {
      signature: tx.transaction.signatures[0],
      blockTime: tx.blockTime,
      slot: tx.slot,
      fee: tx.meta.fee,
      status: tx.meta.err ? 'failed' : 'success',
      type: this.determineTransactionType(instruction),
      from: walletAddress,
      to: '',
      amount: 0,
      mint: '',
      symbol: 'SOL',
      price: 0,
      valueUSD: 0,
      programId: instruction.programId.toString(),
      instructions: []
    };
  }

  private determineTransactionType(instruction: any): TransactionType {
    const programId = instruction.programId.toString();
    
    if (programId.includes('11111111111111111111111111111111')) {
      return TransactionType.TRANSFER;
    }
    if (programId.includes('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')) {
      return TransactionType.SWAP;
    }
    
    return TransactionType.UNKNOWN;
  }

  async subscribeToWallet(address: string, callback: (transaction: WalletTransaction) => void): Promise<number> {
    const publicKey = new PublicKey(address);
    
    return this.connection.onAccountChange(publicKey, (accountInfo, context) => {
      // Handle account changes and emit transaction events
      console.log(`Account ${address} changed at slot ${context.slot}`);
    });
  }

  unsubscribeFromWallet(subscriptionId: number): void {
    this.connection.removeAccountChangeListener(subscriptionId);
  }
}
