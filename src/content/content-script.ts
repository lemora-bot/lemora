class LemoraContentScript {
  private observer: MutationObserver | null = null;
  private walletAddressPattern = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
  private detectedWallets: Set<string> = new Set();
  private injectedElements: HTMLElement[] = [];

  constructor() {
    this.init();
  }

  private init(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.startDetection());
    } else {
      this.startDetection();
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });
  }

  private startDetection(): void {
    // Detect wallet addresses on current page
    this.detectWalletAddresses();
    
    // Setup mutation observer for dynamic content
    this.setupMutationObserver();
    
    // Inject floating widget if on supported sites
    this.injectFloatingWidget();
    
    console.log('Lemora content script initialized');
  }

  private detectWalletAddresses(): void {
    const textNodes = this.getTextNodes(document.body);
    
    textNodes.forEach(node => {
      if (node.textContent) {
        const matches = node.textContent.match(this.walletAddressPattern);
        if (matches) {
          matches.forEach(address => {
            if (this.isValidSolanaAddress(address)) {
              this.detectedWallets.add(address);
              this.highlightWalletAddress(node, address);
            }
          });
        }
      }
    });

    // Send detected wallets to background script
    if (this.detectedWallets.size > 0) {
      chrome.runtime.sendMessage({
        type: 'WALLETS_DETECTED',
        data: Array.from(this.detectedWallets),
        url: window.location.href
      });
    }
  }

  private getTextNodes(element: Node): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.textContent && node.textContent.trim()) {
        textNodes.push(node as Text);
      }
    }

    return textNodes;
  }

  private isValidSolanaAddress(address: string): boolean {
    // Basic validation for Solana address format
    return address.length >= 32 && address.length <= 44 && 
           /^[1-9A-HJ-NP-Za-km-z]+$/.test(address);
  }

  private highlightWalletAddress(textNode: Text, address: string): void {
    const parent = textNode.parentNode;
    if (!parent || parent.nodeName === 'SCRIPT' || parent.nodeName === 'STYLE') {
      return;
    }

    const content = textNode.textContent!;
    const parts = content.split(address);
    
    if (parts.length > 1) {
      const fragment = document.createDocumentFragment();
      
      parts.forEach((part, index) => {
        if (index > 0) {
          // Create highlighted wallet address element
          const walletElement = document.createElement('span');
          walletElement.className = 'lemora-wallet-highlight';
          walletElement.textContent = address;
          walletElement.title = `Solana Wallet: ${address}`;
          walletElement.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2px 4px;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            position: relative;
            z-index: 9999;
          `;
          
          // Add click handler
          walletElement.addEventListener('click', (e) => {
            e.preventDefault();
            this.showWalletActions(address, e.target as HTMLElement);
          });
          
          fragment.appendChild(walletElement);
          this.injectedElements.push(walletElement);
        }
        
        if (part) {
          fragment.appendChild(document.createTextNode(part));
        }
      });
      
      parent.replaceChild(fragment, textNode);
    }
  }

  private showWalletActions(address: string, element: HTMLElement): void {
    // Remove existing popup if any
    const existingPopup = document.querySelector('.lemora-wallet-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'lemora-wallet-popup';
    popup.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      min-width: 200px;
    `;

    popup.innerHTML = `
      <div style="margin-bottom: 8px; font-weight: 600; color: #333;">
        ${address.slice(0, 8)}...${address.slice(-8)}
      </div>
      <button class="lemora-action-btn" data-action="track" style="
        display: block;
        width: 100%;
        padding: 8px 12px;
        margin-bottom: 6px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
      ">Track Wallet</button>
      <button class="lemora-action-btn" data-action="copy" style="
        display: block;
        width: 100%;
        padding: 8px 12px;
        margin-bottom: 6px;
        background: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      ">Copy Address</button>
      <button class="lemora-action-btn" data-action="view" style="
        display: block;
        width: 100%;
        padding: 8px 12px;
        background: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      ">View on Solscan</button>
    `;

    // Position popup
    const rect = element.getBoundingClientRect();
    popup.style.left = `${rect.left}px`;
    popup.style.top = `${rect.bottom + 5}px`;

    // Add event handlers
    popup.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('lemora-action-btn')) {
        const action = target.getAttribute('data-action');
        this.handleWalletAction(action!, address);
        popup.remove();
      }
    });

    document.body.appendChild(popup);
    this.injectedElements.push(popup);

    // Remove popup when clicking outside
    setTimeout(() => {
      document.addEventListener('click', (e) => {
        if (!popup.contains(e.target as Node)) {
          popup.remove();
        }
      }, { once: true });
    }, 100);
  }

  private handleWalletAction(action: string, address: string): void {
    switch (action) {
      case 'track':
        chrome.runtime.sendMessage({
          type: 'ADD_WALLET',
          address: address
        });
        break;
        
      case 'copy':
        navigator.clipboard.writeText(address).then(() => {
          this.showToast('Address copied to clipboard');
        });
        break;
        
      case 'view':
        window.open(`https://solscan.io/account/${address}`, '_blank');
        break;
    }
  }

  private showToast(message: string): void {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  private setupMutationObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      let shouldRedetect = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
              shouldRedetect = true;
            }
          });
        }
      });
      
      if (shouldRedetect) {
        // Debounce redetection
        clearTimeout(this.redetectionTimeout);
        this.redetectionTimeout = setTimeout(() => {
          this.detectWalletAddresses();
        }, 1000);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private redetectionTimeout: any;

  private injectFloatingWidget(): void {
    const supportedSites = ['solscan.io', 'solanabeach.io', 'raydium.io', 'jupiter.exchange'];
    const currentSite = supportedSites.find(site => window.location.hostname.includes(site));
    
    if (!currentSite) return;

    const widget = document.createElement('div');
    widget.id = 'lemora-floating-widget';
    widget.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      cursor: pointer;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s ease;
    `;

    widget.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    `;

    widget.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
    });

    widget.addEventListener('mouseenter', () => {
      widget.style.transform = 'scale(1.1)';
    });

    widget.addEventListener('mouseleave', () => {
      widget.style.transform = 'scale(1)';
    });

    document.body.appendChild(widget);
    this.injectedElements.push(widget);
  }

  private handleMessage(message: any, sender: any, sendResponse: Function): void {
    switch (message.type) {
      case 'GET_DETECTED_WALLETS':
        sendResponse({ wallets: Array.from(this.detectedWallets) });
        break;
        
      case 'HIGHLIGHT_WALLET':
        // Re-highlight specific wallet if needed
        break;
    }
  }

  private cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Remove all injected elements
    this.injectedElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    
    this.injectedElements = [];
  }
}

// Initialize content script
new LemoraContentScript();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  // Cleanup will be handled by the browser
});
