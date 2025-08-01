import { WebSocketService } from '../services/websocket.service';
import { SolanaWalletService } from '../services/solana-wallet.service';

class BackgroundService {
  private websocketService: WebSocketService;
  private walletService: SolanaWalletService;
  private watchedWallets: Set<string> = new Set();
  private notificationQueue: any[] = [];

  constructor() {
    this.websocketService = new WebSocketService(process.env.WEBSOCKET_URL || 'wss://api.helius.xyz/v0/websocket');
    this.walletService = new SolanaWalletService(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      process.env.HELIUS_API_KEY || ''
    );

    this.setupEventListeners();
    this.setupWebSocketHandlers();
  }

  private setupEventListeners(): void {
    // Listen for extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      console.log('Extension installed:', details.reason);
      this.initialize();
    });

    // Listen for messages from popup/content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Listen for alarm events (for periodic tasks)
    chrome.alarms.onAlarm.addListener((alarm) => {
      this.handleAlarm(alarm);
    });

    // Listen for tab updates to inject content scripts
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.handleTabUpdate(tabId, tab);
      }
    });
  }

  private setupWebSocketHandlers(): void {
    this.websocketService.on('connected', () => {
      console.log('WebSocket connected in background');
      this.resubscribeWallets();
    });

    this.websocketService.on('transaction', (data) => {
      this.handleTransaction(data);
    });

    this.websocketService.on('balanceUpdate', (data) => {
      this.handleBalanceUpdate(data);
    });

    this.websocketService.on('error', (error) => {
      console.error('WebSocket error in background:', error);
    });
  }

  private async initialize(): void {
    try {
      // Load watched wallets from storage
      const result = await chrome.storage.sync.get(['watchedWallets']);
      if (result.watchedWallets) {
        this.watchedWallets = new Set(result.watchedWallets);
      }

      // Connect to WebSocket
      await this.websocketService.connect();

      // Setup periodic tasks
      chrome.alarms.create('refreshData', { periodInMinutes: 5 });
      chrome.alarms.create('cleanupNotifications', { periodInMinutes: 60 });

      console.log('Background service initialized');
    } catch (error) {
      console.error('Failed to initialize background service:', error);
    }
  }

  private async handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: Function): Promise<void> {
    try {
      switch (message.type) {
        case 'ADD_WALLET':
          await this.addWallet(message.address);
          sendResponse({ success: true });
          break;

        case 'REMOVE_WALLET':
          await this.removeWallet(message.address);
          sendResponse({ success: true });
          break;

        case 'GET_WALLET_INFO':
          const walletInfo = await this.walletService.getWalletInfo(message.address);
          sendResponse({ success: true, data: walletInfo });
          break;

        case 'GET_TRANSACTIONS':
          const transactions = await this.walletService.getRecentTransactions(message.address, message.limit);
          sendResponse({ success: true, data: transactions });
          break;

        case 'GET_WATCHED_WALLETS':
          sendResponse({ success: true, data: Array.from(this.watchedWallets) });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  private async addWallet(address: string): Promise<void> {
    this.watchedWallets.add(address);
    await this.saveWatchedWallets();
    this.websocketService.subscribe(address);
    
    // Send notification
    this.createNotification(`Started tracking wallet: ${address.slice(0, 8)}...`);
  }

  private async removeWallet(address: string): Promise<void> {
    this.watchedWallets.delete(address);
    await this.saveWatchedWallets();
    this.websocketService.unsubscribe(address);
    
    // Send notification
    this.createNotification(`Stopped tracking wallet: ${address.slice(0, 8)}...`);
  }

  private async saveWatchedWallets(): Promise<void> {
    await chrome.storage.sync.set({
      watchedWallets: Array.from(this.watchedWallets)
    });
  }

  private resubscribeWallets(): void {
    this.watchedWallets.forEach(address => {
      this.websocketService.subscribe(address);
    });
  }

  private handleTransaction(data: any): void {
    console.log('New transaction:', data);
    
    // Analyze transaction for signals
    if (this.isSignificantTransaction(data)) {
      this.createNotification(`Significant transaction detected on ${data.address.slice(0, 8)}...`);
      
      // Send to popup if open
      chrome.runtime.sendMessage({
        type: 'TRANSACTION_UPDATE',
        data: data
      }).catch(() => {
        // Popup might not be open, ignore error
      });
    }
  }

  private handleBalanceUpdate(data: any): void {
    console.log('Balance update:', data);
    
    // Send to popup if open
    chrome.runtime.sendMessage({
      type: 'BALANCE_UPDATE',
      data: data
    }).catch(() => {
      // Popup might not be open, ignore error
    });
  }

  private isSignificantTransaction(data: any): boolean {
    // Define criteria for significant transactions
    return data.amount > 100 || // Large amount
           data.type === 'swap' || // Swap transactions
           data.riskScore > 0.7; // High risk score
  }

  private createNotification(message: string): void {
    const notificationId = `notification_${Date.now()}`;
    
    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: '../assets/icons/icon48.png',
      title: 'Lemora Wallet Tracker',
      message: message
    });

    // Auto-clear notification after 5 seconds
    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, 5000);
  }

  private handleAlarm(alarm: chrome.alarms.Alarm): void {
    switch (alarm.name) {
      case 'refreshData':
        this.refreshWalletData();
        break;
      case 'cleanupNotifications':
        this.cleanupNotifications();
        break;
    }
  }

  private async refreshWalletData(): Promise<void> {
    // Refresh data for all watched wallets
    for (const address of this.watchedWallets) {
      try {
        const walletInfo = await this.walletService.getWalletInfo(address);
        
        // Cache the data
        await chrome.storage.local.set({
          [`wallet_${address}`]: {
            data: walletInfo,
            timestamp: Date.now()
          }
        });
      } catch (error) {
        console.error(`Failed to refresh data for wallet ${address}:`, error);
      }
    }
  }

  private cleanupNotifications(): void {
    // Clear old notifications from queue
    this.notificationQueue = this.notificationQueue.filter(
      notification => Date.now() - notification.timestamp < 24 * 60 * 60 * 1000 // 24 hours
    );
  }

  private handleTabUpdate(tabId: number, tab: chrome.tabs.Tab): void {
    // Inject content script if on supported sites
    const supportedSites = [
      'solscan.io',
      'solanabeach.io',
      'raydium.io',
      'jupiter.exchange'
    ];

    if (tab.url && supportedSites.some(site => tab.url!.includes(site))) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['src/content/content-script.js']
      }).catch(error => {
        console.log('Content script already injected or failed:', error);
      });
    }
  }
}

// Initialize the background service
const backgroundService = new BackgroundService();

export default backgroundService;
