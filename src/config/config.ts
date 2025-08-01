/**
 * Lemora Wallet Tracker - Main Configuration
 * Central configuration for the application
 */

export const CONFIG = {
  APP_NAME: 'Lemora Wallet Tracker',
  VERSION: '1.0.0',
  
  API: {
    HELIUS: {
      BASE_URL: 'https://api.helius.xyz/v0',
      WS_URL: 'wss://api.helius.xyz/v0',
      API_KEYS: [
        'your-helius-api-key-1',
        'your-helius-api-key-2',
        'your-helius-api-key-3'
      ],
      TIMEOUT: 30000,
      RETRY_ATTEMPTS: 3
    },
    
    BIRDEYE: {
      BASE_URL: 'https://public-api.birdeye.so',
      API_KEY: 'your-birdeye-api-key',
      CHAIN: 'solana',
      TIMEOUT: 20000
    }
  },
  
  WEBSOCKET: {
    RECONNECT_INTERVAL: 5000,
    MAX_RECONNECT_ATTEMPTS: 10,
    HEARTBEAT_INTERVAL: 30000,
    MESSAGE_QUEUE_SIZE: 1000
  },
  
  TRANSACTION: {
    MIN_AMOUNT_FILTER: 0.1,
    MAX_TRANSACTIONS_DISPLAY: 100,
    REFRESH_INTERVAL: 1000,
    CACHE_DURATION: 300000
  },
  
  UI: {
    THEME: {
      PRIMARY: '#00FF88',
      SECONDARY: '#FF00FF',
      BACKGROUND: '#0A0A0A',
      TEXT: '#FFFFFF',
      ERROR: '#FF3333',
      SUCCESS: '#00FF00',
      WARNING: '#FFAA00'
    },
    
    ANIMATIONS: {
      DURATION: 300,
      EASING: 'ease-in-out'
    },
    
    SIDEPANEL: {
      WIDTH: 400,
      POSITION: 'right'
    }
  },
  
  STORAGE: {
    PREFIX: 'lemora_',
    ENCRYPTION_KEY: 'your-encryption-key',
    MAX_STORAGE_SIZE: 10485760 // 10MB
  },
  
  PERFORMANCE: {
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100,
    MAX_CONCURRENT_REQUESTS: 5
  }
};
