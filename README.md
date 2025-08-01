<div align="center">
  <img src="assets/images/lemora-banner.svg" alt="Lemora Wallet Tracker" width="800"/>
  
  # Lemora Wallet Tracker
  
  ### Advanced AI-Powered Trading Signals & Wallet Monitoring for Solana
  
[![GitHub Stars](https://img.shields.io/github/stars/lemora-github/lemora-github?style=social)](https://github.com/lemora-github/lemora-github/stargazers)
[![Twitter](https://img.shields.io/badge/Twitter-@Lemorabot-1DA1F2.svg?style=social&logo=twitter)](https://x.com/Lemorabot)
  
  ---
  
  **The Ultimate Solana Wallet Tracker** - Monitor whale movements, detect insider trading, and receive AI-powered trading signals in real-time.
  
</div>

## Features

- **Real-time Transaction Monitoring** - Track wallet activities instantly
- **Smart Filtering System** - Advanced rules engine for transaction filtering
- **Market Data Integration** - Live prices from Birdeye and Jupiter APIs
- **Alert System** - Custom notifications for trading opportunities
- **Secure Architecture** - Non-custodial, privacy-focused design
- **Chrome Extension** - Seamless browser integration
- **Multi-Wallet Support** - Track multiple wallets simultaneously
- **WebSocket Streaming** - Ultra-low latency data feeds

## Project Structure

```
lemora-bot/
├── 📂 .changeset/          # Version management
├── 📂 .codesandbox/        # CodeSandbox configuration
├── 📂 .github/             # GitHub workflows and templates
├── 📂 .husky/              # Git hooks
├── 📂 docs/                # 📚 Documentation hub
├── 📂 examples/            # Usage examples and demos
├── 📂 packages/            # Monorepo packages
├── 📂 src/                 # 💻 Source code
│   ├── 📂 api/             # API integrations
│   ├── 📂 components/      # UI components
│   ├── 📂 filters/         # Transaction filtering
│   ├── 📂 services/        # Business logic
│   ├── 📂 types/           # TypeScript definitions
│   ├── 📂 utils/           # Utility functions
│   └── 📂 websocket/       # Real-time communication
├── ⚙️ Configuration files
└── 📄 Documentation
```

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Extension**
   ```bash
   npm run build
   ```

3. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked" and select `dist/` folder

## Documentation

- [📖 User Guide](docs/user-guide.md)
- [🔧 API Reference](docs/api-reference.md)
- [⚡ WebSocket Documentation](docs/websocket.md)
- [🎯 Filter System Guide](docs/filters.md)
- [🔐 Security Architecture](docs/security.md)
- [🚀 Deployment Guide](docs/deployment.md)

## Core Components

### 🌐 WebSocket Backend
Real-time connection management with automatic reconnection and load balancing across multiple Helius API keys.

**Files:** `src/websocket/connection.ts`, `src/websocket/handlers.ts`

### 🎯 Smart Filters
Advanced transaction filtering with customizable rules engine for spam detection and signal identification.

**Files:** `src/filters/transaction.ts`, `src/filters/rules.ts`

### 📊 API Services
Integrated connections to Helius, Birdeye, and Jupiter for comprehensive market data.

**Files:** `src/services/api.service.ts`, `src/api/helius.ts`, `src/api/birdeye.ts`

### 🎨 UI Components
Modern, responsive interface with dark theme and real-time updates.

**Files:** `src/ui/sidepanel/`, `src/components/`

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- [🌐 Website](https://lemora-bot.com)
- [📱 Chrome Store](https://chrome.google.com/webstore/detail/lemora-bot)
- [🐦 Twitter](https://twitter.com/LemoraBot)
- [💬 Discord](https://discord.gg/lemora-bot)
- [📧 Support](mailto:support@lemora-bot.com)

---

