/**
 * Lemora Wallet Tracker - Constants
 * Application-wide constants and enumerations
 */

export const CONSTANTS = {
  // Network Constants
  NETWORK: {
    MAINNET: 'mainnet-beta',
    DEVNET: 'devnet',
    TESTNET: 'testnet',
    DEFAULT: 'mainnet-beta'
  },

  // Token Standards
  TOKEN_STANDARDS: {
    SPL: 'spl',
    SPL_2022: 'spl-2022',
    NFT: 'nft',
    COMPRESSED_NFT: 'compressed-nft'
  },

  // Transaction Types
  TRANSACTION_TYPES: {
    SWAP: 'swap',
    TRANSFER: 'transfer',
    MINT: 'mint',
    BURN: 'burn',
    STAKE: 'stake',
    UNSTAKE: 'unstake',
    CREATE_ACCOUNT: 'create_account',
    CLOSE_ACCOUNT: 'close_account'
  },

  // Time Constants
  TIME: {
    SECOND: 1000,
    MINUTE: 60000,
    HOUR: 3600000,
    DAY: 86400000,
    WEEK: 604800000
  },

  // Cache Keys
  CACHE_KEYS: {
    WALLET_DATA: 'wallet_data',
    TOKEN_INFO: 'token_info',
    TRANSACTION_HISTORY: 'transaction_history',
    PRICE_DATA: 'price_data',
    USER_PREFERENCES: 'user_preferences'
  },

  // Error Messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network connection failed',
    API_ERROR: 'API request failed',
    INVALID_WALLET: 'Invalid wallet address',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    TRANSACTION_FAILED: 'Transaction failed',
    WEBSOCKET_ERROR: 'WebSocket connection error'
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    WALLET_ADDED: 'Wallet added successfully',
    TRANSACTION_SENT: 'Transaction sent successfully',
    SETTINGS_SAVED: 'Settings saved successfully',
    CONNECTION_ESTABLISHED: 'Connection established'
  },

  // Regex Patterns
  PATTERNS: {
    WALLET_ADDRESS: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    TOKEN_ADDRESS: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    TRANSACTION_SIGNATURE: /^[1-9A-HJ-NP-Za-km-z]{87,88}$/
  },

  // Limits
  LIMITS: {
    MAX_WALLETS: 10,
    MAX_TOKENS_TRACKED: 50,
    MAX_TRANSACTIONS_STORED: 1000,
    MAX_WEBSOCKET_RECONNECTS: 5,
    MAX_API_RETRIES: 3
  },

  // Default Values
  DEFAULTS: {
    CURRENCY: 'USD',
    LANGUAGE: 'en',
    THEME: 'dark',
    NOTIFICATION_DURATION: 5000,
    REFRESH_INTERVAL: 10000
  }
};
