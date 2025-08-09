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
    const transactionType = this.determineTransactionType(instruction);
    const balanceChange = this.calculateBalanceChange(tx.meta.preBalances, tx.meta.postBalances);
    const involvedAddresses = this.extractInvolvedAddresses(tx);
    
    return {
      signature: tx.transaction.signatures[0],
      blockTime: tx.blockTime,
      slot: tx.slot,
      fee: tx.meta.fee,
      status: tx.meta.err ? 'failed' : 'success',
      type: transactionType,
      from: walletAddress,
      to: involvedAddresses.recipient || '',
      amount: balanceChange.amount,
      mint: balanceChange.mint || '',
      symbol: this.getTokenSymbol(balanceChange.mint) || 'SOL',
      price: 0,
      valueUSD: 0,
      programId: instruction.programId.toString(),
      instructions: this.extractInstructionData(tx.transaction.message.instructions),
      computeUnitsConsumed: tx.meta.computeUnitsConsumed || 0,
      logs: tx.meta.logMessages || [],
      rewards: tx.meta.rewards || []
    };
  }

  private determineTransactionType(instruction: any): TransactionType {
    const programId = instruction.programId.toString();
    
    const PROGRAM_MAPPINGS = {
      '11111111111111111111111111111111': TransactionType.TRANSFER,
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': TransactionType.SWAP,
      'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': TransactionType.SWAP,
      'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX': TransactionType.SWAP,
      'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc': TransactionType.SWAP,
      'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1': TransactionType.STAKING,
      'Stake11111111111111111111111111111111111111': TransactionType.STAKING,
      'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb': TransactionType.NFT,
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s': TransactionType.NFT
    };
    
    for (const [programAddress, type] of Object.entries(PROGRAM_MAPPINGS)) {
      if (programId.includes(programAddress)) {
        return type;
      }
    }
    
    return TransactionType.UNKNOWN;
  }

  private calculateBalanceChange(preBalances: number[], postBalances: number[]): { amount: number; mint?: string } {
    if (!preBalances || !postBalances || preBalances.length === 0) {
      return { amount: 0 };
    }
    
    const mainAccountChange = Math.abs(postBalances[0] - preBalances[0]);
    return {
      amount: mainAccountChange / 1e9, // Convert lamports to SOL
      mint: 'So11111111111111111111111111111111111111112' // SOL mint
    };
  }

  private extractInvolvedAddresses(tx: ParsedTransactionWithMeta): { recipient?: string; sender?: string } {
    const accountKeys = tx.transaction.message.accountKeys;
    
    if (accountKeys.length > 1) {
      return {
        sender: accountKeys[0].pubkey.toString(),
        recipient: accountKeys[1].pubkey.toString()
      };
    }
    
    return {};
  }

  private extractInstructionData(instructions: any[]): any[] {
    return instructions.map(instruction => ({
      programId: instruction.programId.toString(),
      accounts: instruction.accounts?.map((acc: any) => acc.toString()) || [],
      data: instruction.data || null
    }));
  }

  private getTokenSymbol(mint?: string): string | null {
    const TOKEN_REGISTRY = {
      'So11111111111111111111111111111111111111112': 'SOL',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'mSOL',
      '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'stSOL'
    };
    
    return mint ? TOKEN_REGISTRY[mint as keyof typeof TOKEN_REGISTRY] || null : null;
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
