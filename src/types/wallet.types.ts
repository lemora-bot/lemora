export interface QuickWallet {
  address: string;
  label?: string;
  solBalance: number;
  usdValue: number;
  isActive: boolean;
}

export interface TokenHolding {
  mint: string;
  symbol: string;
  amount: number;
  value: number;
}

export interface TradingProfile {
  walletAddress: string;
  totalTrades: number;
  winningTrades: number;
  totalPnL: number;
  bestTrade: number;
  worstTrade: number;
  averageTradeSize: number;
  favoriteTokens: string[];
  tradingFrequency: 'LOW' | 'MEDIUM' | 'HIGH';
  riskLevel: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
}

export interface SimpleNotification {
  id: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR';
  timestamp: number;
  read: boolean;
}

export interface WalletPerformance {
  address: string;
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  lastUpdated: number;
}

export interface TradeHistory {
  trades: QuickTrade[];
  summary: TradingSummary;
  timeRange: {
    start: number;
    end: number;
  };
}

export interface QuickTrade {
  id: string;
  tokenMint: string;
  tokenSymbol: string;
  action: 'BUY' | 'SELL';
  amount: number;
  priceUSD: number;
  totalValueUSD: number;
  timestamp: number;
  pnl?: number;
}

export interface TradingSummary {
  totalTrades: number;
  profitable: number;
  unprofitable: number;
  breakeven: number;
  totalVolume: number;
  netPnL: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
}
