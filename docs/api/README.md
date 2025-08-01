# API Reference

## Overview

The Lemora Wallet Tracker API provides comprehensive endpoints for interacting with Solana blockchain data, wallet monitoring, and trading signals. All endpoints are designed for high performance and real-time data access.

## Base URL

```
https://api.lemora-bot.com/v1
```

## Authentication

All API requests require authentication using API keys. Include your API key in the request header:

```http
Authorization: Bearer YOUR_API_KEY
```

## Rate Limits

| Plan | Requests per minute | Requests per hour |
|------|-------------------|------------------|
| Free | 60 | 1,000 |
| Pro | 600 | 10,000 |
| Enterprise | 6,000 | 100,000 |

## Core Endpoints

### Wallet Monitoring

#### Track Wallet
Monitor a specific Solana wallet for transactions and balance changes.

```http
POST /wallets/track
```

**Request Body:**
```json
{
  "address": "DjVE6JNiYqPL2QXyCUUh8rNjHrbz6hXHNYt99MQ59qw1",
  "alerts": {
    "balance_change": true,
    "new_tokens": true,
    "large_transactions": true,
    "threshold": 1000
  },
  "webhook_url": "https://your-webhook.com/alerts"
}
```

**Response:**
```json
{
  "success": true,
  "wallet_id": "track_123456",
  "address": "DjVE6JNiYqPL2QXyCUUh8rNjHrbz6hXHNYt99MQ59qw1",
  "status": "active",
  "created_at": "2025-01-01T00:00:00Z"
}
```

#### Get Wallet Details
Retrieve comprehensive information about a tracked wallet.

```http
GET /wallets/{wallet_id}
```

**Response:**
```json
{
  "wallet_id": "track_123456",
  "address": "DjVE6JNiYqPL2QXyCUUh8rNjHrbz6hXHNYt99MQ59qw1",
  "balance": {
    "sol": 1500.25,
    "usd_value": 75012.50
  },
  "tokens": [
    {
      "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "symbol": "USDC",
      "balance": 10000,
      "usd_value": 10000
    }
  ],
  "recent_activity": [
    {
      "signature": "2ZE7R...",
      "type": "swap",
      "amount": 100,
      "token": "USDC",
      "timestamp": "2025-01-01T12:00:00Z"
    }
  ]
}
```

### Transaction Analysis

#### Get Transaction Details
Analyze a specific transaction with AI-powered insights.

```http
GET /transactions/{signature}
```

**Response:**
```json
{
  "signature": "2ZE7R7QKNzTC1WmWmQQLmMoEzFJNd3VkRBhxFyqkfF8AkB2HLzYvP3YqjQrKoHH1",
  "block_time": 1672531200,
  "slot": 123456789,
  "type": "swap",
  "analysis": {
    "risk_score": 0.2,
    "profit_loss": 150.25,
    "strategy": "arbitrage",
    "confidence": 0.85
  },
  "wallet_involved": "DjVE6JNiYqPL2QXyCUUh8rNjHrbz6hXHNYt99MQ59qw1",
  "tokens": [
    {
      "mint": "So11111111111111111111111111111111111111112",
      "symbol": "SOL",
      "amount": -10,
      "direction": "out"
    },
    {
      "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "symbol": "USDC",
      "amount": 500,
      "direction": "in"
    }
  ]
}
```

### Market Data

#### Get Token Price
Real-time token pricing with historical data.

```http
GET /market/price/{mint_address}
```

**Parameters:**
- `timeframe`: 1h, 4h, 1d, 7d, 30d (optional)
- `include_history`: boolean (optional)

**Response:**
```json
{
  "mint": "So11111111111111111111111111111111111111112",
  "symbol": "SOL",
  "name": "Solana",
  "price_usd": 50.25,
  "price_change_24h": 2.5,
  "volume_24h": 1500000000,
  "market_cap": 23000000000,
  "history": [
    {
      "timestamp": "2025-01-01T00:00:00Z",
      "price": 49.75,
      "volume": 125000000
    }
  ]
}
```

### AI Signals

#### Get Trading Signals
AI-generated trading signals based on wallet behavior analysis.

```http
GET /signals
```

**Parameters:**
- `confidence_min`: 0.0-1.0 (minimum confidence threshold)
- `timeframe`: 5m, 15m, 1h, 4h, 1d
- `signal_type`: buy, sell, hold

**Response:**
```json
{
  "signals": [
    {
      "id": "signal_789",
      "token": {
        "mint": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        "symbol": "BONK",
        "name": "BONK"
      },
      "type": "buy",
      "confidence": 0.87,
      "price_target": 0.000025,
      "stop_loss": 0.000020,
      "reasoning": "Large wallet accumulation detected with 15% increase in holdings",
      "wallets_involved": [
        "DjVE6JNiYqPL2QXyCUUh8rNjHrbz6hXHNYt99MQ59qw1"
      ],
      "created_at": "2025-01-01T12:00:00Z",
      "expires_at": "2025-01-01T16:00:00Z"
    }
  ],
  "total": 1,
  "page": 1
}
```

## WebSocket API

### Real-time Wallet Updates

Connect to real-time wallet monitoring via WebSocket:

```javascript
const ws = new WebSocket('wss://api.lemora-bot.com/v1/ws');

ws.onopen = function() {
  // Subscribe to wallet updates
  ws.send(JSON.stringify({
    action: 'subscribe',
    channel: 'wallet_updates',
    wallet_id: 'track_123456'
  }));
};

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Wallet update:', data);
};
```

**Message Format:**
```json
{
  "channel": "wallet_updates",
  "wallet_id": "track_123456",
  "event": "transaction",
  "data": {
    "signature": "2ZE7R...",
    "type": "swap",
    "amount": 100,
    "token": "USDC",
    "timestamp": "2025-01-01T12:00:00Z"
  }
}
```

## Error Handling

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "WALLET_NOT_FOUND",
    "message": "The specified wallet could not be found",
    "details": {
      "wallet_id": "invalid_id"
    }
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_API_KEY` | API key is invalid or expired |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `WALLET_NOT_FOUND` | Wallet does not exist |
| `INSUFFICIENT_PERMISSIONS` | API key lacks required permissions |
| `INVALID_PARAMETERS` | Request parameters are invalid |

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @lemora-bot/sdk
```

```javascript
import { LemoraAPI } from '@lemora-bot/sdk';

const api = new LemoraAPI({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});

// Track a wallet
const wallet = await api.wallets.track({
  address: 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz6hXHNYt99MQ59qw1',
  alerts: {
    balance_change: true,
    threshold: 1000
  }
});
```

### Python

```bash
pip install lemora-bot-sdk
```

```python
from lemora_bot import LemoraAPI

api = LemoraAPI(api_key='your-api-key')

# Get trading signals
signals = api.signals.get(confidence_min=0.8)
for signal in signals:
    print(f"Signal: {signal.type} {signal.token.symbol} - Confidence: {signal.confidence}")
```

## Webhooks

Configure webhooks to receive real-time notifications:

### Webhook Payload Example

```json
{
  "event": "wallet_transaction",
  "wallet_id": "track_123456",
  "timestamp": "2025-01-01T12:00:00Z",
  "data": {
    "signature": "2ZE7R7QKNzTC1WmWmQQLmMoEzFJNd3VkRBhxFyqkfF8AkB2HLzYvP3YqjQrKoHH1",
    "type": "swap",
    "amount": 100,
    "token": "USDC",
    "wallet_address": "DjVE6JNiYqPL2QXyCUUh8rNjHrbz6hXHNYt99MQ59qw1"
  }
}
```

### Webhook Security

All webhooks include an HMAC signature for verification:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}
```

## Support

For API support and questions:

- Email: api-support@lemora-bot.com
- Discord: #api-support channel
- Documentation: https://docs.lemora-bot.com

## Changelog

### v1.2.0 - 2025-01-01
- Added AI trading signals endpoint
- Improved WebSocket performance
- Added Python SDK

### v1.1.0 - 2024-12-15
- Added transaction analysis endpoint
- Enhanced wallet tracking capabilities
- Added webhook support

### v1.0.0 - 2024-12-01
- Initial API release
- Basic wallet monitoring
- Real-time updates via WebSocket
