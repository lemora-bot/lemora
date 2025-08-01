export interface TradingSignal {
  id: string;
  timestamp: Date;
  type: SignalType;
  strength: SignalStrength;
  token: TokenInfo;
  walletAddress: string;
  action: TradeAction;
  confidence: number;
  price: number;
  volume: number;
  marketCap: number;
  description: string;
  metadata: SignalMetadata;
  expiry?: Date;
  isActive: boolean;
}

export enum SignalType {
  WHALE_MOVEMENT = 'whale_movement',
  SMART_MONEY = 'smart_money',
  INSIDER_TRADING = 'insider_trading',
  PUMP_DUMP = 'pump_dump',
  ARBITRAGE = 'arbitrage',
  SOCIAL_SENTIMENT = 'social_sentiment',
  TECHNICAL_ANALYSIS = 'technical_analysis',
  DEV_ACTIVITY = 'dev_activity'
}

export enum SignalStrength {
  WEAK = 'weak',
  MODERATE = 'moderate',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong'
}

export enum TradeAction {
  BUY = 'buy',
  SELL = 'sell',
  HOLD = 'hold',
  AVOID = 'avoid'
}

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  logo?: string;
  decimals: number;
  totalSupply: number;
  circulatingSupply: number;
  marketCap: number;
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  fdv: number;
  coingeckoId?: string;
  coinmarketcapId?: string;
}

export interface SignalMetadata {
  walletLabels: string[];
  transactionCount: number;
  averageTransactionSize: number;
  timeWindow: string;
  relatedSignals: string[];
  riskLevel: RiskLevel;
  dataSource: string[];
  algorithmVersion: string;
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXTREME = 'extreme'
}

export interface SignalFilter {
  types: SignalType[];
  strengths: SignalStrength[];
  actions: TradeAction[];
  minConfidence: number;
  maxRiskLevel: RiskLevel;
  tokens: string[];
  wallets: string[];
  timeRange: TimeRange;
}

export interface TimeRange {
  from: Date;
  to: Date;
}

export interface SignalPerformance {
  signalId: string;
  accuracy: number;
  profitability: number;
  averageReturn: number;
  successRate: number;
  totalSignals: number;
  executedSignals: number;
  avgTimeToProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface AISignalConfig {
  enabledSignalTypes: SignalType[];
  minConfidenceThreshold: number;
  maxSignalsPerHour: number;
  riskTolerance: RiskLevel;
  tradingPairFilters: string[];
  walletFilters: string[];
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  popup: boolean;
  desktop: boolean;
  email: boolean;
  webhook?: string;
  minStrength: SignalStrength;
}
