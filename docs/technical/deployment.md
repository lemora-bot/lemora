# Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying Lemora Wallet Tracker in different environments, from development to production. The application supports multiple deployment strategies including local development, staging, and production environments.

## Prerequisites

### System Requirements

**Minimum Requirements:**
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git 2.30.0 or higher
- Chrome/Chromium 100.0.0 or higher

**Recommended Requirements:**
- Node.js 20.0.0 or higher
- npm 10.0.0 or higher
- 8GB RAM minimum
- SSD storage for optimal performance

### API Keys and Configuration

Before deployment, ensure you have the following API keys:

1. **Helius API Key**
   - Sign up at [Helius.xyz](https://helius.xyz)
   - Create a new project and obtain your API key
   - Required for Solana blockchain data

2. **Birdeye API Key** (Optional)
   - Sign up at [Birdeye.so](https://birdeye.so)
   - Obtain API key for enhanced market data

3. **Jupiter API Access** (Optional)
   - No API key required, but rate limits apply
   - Used for swap routing and pricing

## Environment Setup

### Development Environment

1. **Clone the Repository**
   ```bash
   git clone https://github.com/lemora-bot/lemora-bot.git
   cd lemora-bot
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.development` file:
   ```env
   # API Configuration
   HELIUS_API_KEY=your_helius_api_key_here
   BIRDEYE_API_KEY=your_birdeye_api_key_here
   
   # Development Settings
   NODE_ENV=development
   PORT=3000
   LOG_LEVEL=debug
   
   # WebSocket Configuration
   WS_RECONNECT_INTERVAL=5000
   WS_MAX_RECONNECT_ATTEMPTS=10
   
   # Chrome Extension Settings
   EXTENSION_ID=development
   DEBUG_MODE=true
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Build Extension for Development**
   ```bash
   npm run build:dev
   ```

6. **Load Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

### Staging Environment

1. **Environment Configuration**
   Create a `.env.staging` file:
   ```env
   # API Configuration
   HELIUS_API_KEY=your_staging_helius_api_key
   BIRDEYE_API_KEY=your_staging_birdeye_api_key
   
   # Staging Settings
   NODE_ENV=staging
   PORT=3001
   LOG_LEVEL=info
   
   # WebSocket Configuration
   WS_RECONNECT_INTERVAL=3000
   WS_MAX_RECONNECT_ATTEMPTS=15
   
   # Chrome Extension Settings
   EXTENSION_ID=staging
   DEBUG_MODE=false
   ANALYTICS_ENABLED=true
   ```

2. **Build for Staging**
   ```bash
   npm run build:staging
   ```

3. **Run Tests**
   ```bash
   npm test
   npm run test:e2e
   ```

### Production Environment

1. **Environment Configuration**
   Create a `.env.production` file:
   ```env
   # API Configuration
   HELIUS_API_KEY=your_production_helius_api_key
   BIRDEYE_API_KEY=your_production_birdeye_api_key
   
   # Production Settings
   NODE_ENV=production
   PORT=80
   LOG_LEVEL=warn
   
   # WebSocket Configuration
   WS_RECONNECT_INTERVAL=2000
   WS_MAX_RECONNECT_ATTEMPTS=20
   
   # Chrome Extension Settings
   EXTENSION_ID=production
   DEBUG_MODE=false
   ANALYTICS_ENABLED=true
   SENTRY_DSN=your_sentry_dsn_here
   
   # Security Settings
   CORS_ORIGIN=https://lemora-bot.com
   RATE_LIMIT_ENABLED=true
   MAX_REQUESTS_PER_MINUTE=60
   ```

2. **Build for Production**
   ```bash
   npm run build:production
   ```

3. **Run Production Tests**
   ```bash
   npm run test:production
   npm run test:security
   ```

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   
   services:
     lemora-bot:
       build:
         context: .
         dockerfile: Dockerfile
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - HELIUS_API_KEY=${HELIUS_API_KEY}
         - BIRDEYE_API_KEY=${BIRDEYE_API_KEY}
       volumes:
         - ./logs:/app/logs
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
         interval: 30s
         timeout: 10s
         retries: 3
   
     redis:
       image: redis:7-alpine
       ports:
         - "6379:6379"
       volumes:
         - redis_data:/data
       restart: unless-stopped
   
   volumes:
     redis_data:
   ```

2. **Build and Deploy**
   ```bash
   docker-compose up -d
   ```

3. **View Logs**
   ```bash
   docker-compose logs -f lemora-bot
   ```

### Single Container Deployment

1. **Build Docker Image**
   ```bash
   docker build -t lemora-bot:latest .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     --name lemora-bot \
     -p 3000:3000 \
     -e NODE_ENV=production \
     -e HELIUS_API_KEY=your_api_key \
     --restart unless-stopped \
     lemora-bot:latest
   ```

## Cloud Deployment

### AWS Deployment

#### Using AWS ECS

1. **Create Task Definition**
   ```json
   {
     "family": "lemora-bot",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "512",
     "memory": "1024",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "lemora-bot",
         "image": "your-account.dkr.ecr.region.amazonaws.com/lemora-bot:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ],
         "secrets": [
           {
             "name": "HELIUS_API_KEY",
             "valueFrom": "arn:aws:secretsmanager:region:account:secret:lemora-bot/api-keys"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/lemora-bot",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

2. **Deploy with AWS CLI**
   ```bash
   aws ecs create-service \
     --cluster lemora-cluster \
     --service-name lemora-bot-service \
     --task-definition lemora-bot:1 \
     --desired-count 2 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
   ```

#### Using AWS Lambda (Serverless)

1. **Install Serverless Framework**
   ```bash
   npm install -g serverless
   npm install serverless-webpack serverless-offline
   ```

2. **Create serverless.yml**
   ```yaml
   service: lemora-bot
   
   provider:
     name: aws
     runtime: nodejs18.x
     region: us-east-1
     environment:
       NODE_ENV: production
       HELIUS_API_KEY: ${ssm:/lemora-bot/helius-api-key}
   
   functions:
     api:
       handler: src/lambda.handler
       events:
         - http:
             path: /{proxy+}
             method: ANY
             cors: true
   
   plugins:
     - serverless-webpack
     - serverless-offline
   ```

3. **Deploy**
   ```bash
   serverless deploy
   ```

### Google Cloud Platform

#### Using Cloud Run

1. **Build and Push to Container Registry**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/lemora-bot
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy lemora-bot \
     --image gcr.io/PROJECT_ID/lemora-bot \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production \
     --set-secrets HELIUS_API_KEY=lemora-bot-secrets:latest
   ```

### Azure Deployment

#### Using Azure Container Instances

1. **Create Resource Group**
   ```bash
   az group create --name lemora-bot-rg --location eastus
   ```

2. **Deploy Container**
   ```bash
   az container create \
     --resource-group lemora-bot-rg \
     --name lemora-bot \
     --image lemora-bot:latest \
     --dns-name-label lemora-bot \
     --ports 3000 \
     --environment-variables NODE_ENV=production \
     --secure-environment-variables HELIUS_API_KEY=your_api_key
   ```

## Chrome Web Store Deployment

### Preparing for Web Store Submission

1. **Build Production Version**
   ```bash
   npm run build:production
   ```

2. **Create Deployment Package**
   ```bash
   npm run package
   ```

3. **Validate Extension**
   ```bash
   npm run validate:extension
   ```

### Submission Process

1. **Developer Account Setup**
   - Register at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
   - Pay the one-time $5 registration fee

2. **Upload Extension**
   - Click "Add new item"
   - Upload the generated `.zip` file from the `package/` directory

3. **Store Listing Information**
   ```
   Name: Lemora Wallet Tracker
   Description: Advanced AI-Powered Trading Signals & Wallet Monitoring for Solana
   Category: Productivity
   Language: English
   ```

4. **Screenshots and Assets**
   - Add 1280x800 screenshots (minimum 1, maximum 5)
   - Add 128x128 icon
   - Add promotional tile (440x280)

5. **Privacy and Permissions**
   - Complete privacy practices disclosure
   - Justify all requested permissions

6. **Submit for Review**
   - Review can take 1-7 days
   - Address any feedback from Google's review team

## Monitoring and Maintenance

### Health Checks

1. **Application Health Endpoint**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Database Connectivity**
   ```bash
   npm run health:db
   ```

3. **API Dependencies**
   ```bash
   npm run health:apis
   ```

### Logging

1. **Application Logs**
   ```bash
   tail -f logs/application.log
   ```

2. **Error Logs**
   ```bash
   tail -f logs/error.log
   ```

3. **Access Logs**
   ```bash
   tail -f logs/access.log
   ```

### Performance Monitoring

1. **Install Monitoring Tools**
   ```bash
   npm install @sentry/node newrelic
   ```

2. **Configure Monitoring**
   ```javascript
   // src/monitoring.js
   const Sentry = require('@sentry/node');
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV
   });
   ```

### Backup and Recovery

1. **Database Backup**
   ```bash
   npm run backup:db
   ```

2. **Configuration Backup**
   ```bash
   npm run backup:config
   ```

3. **Restore Procedures**
   ```bash
   npm run restore:db -- --backup-file=backup-2025-01-01.sql
   ```

## Troubleshooting

### Common Issues

1. **Extension Not Loading**
   - Check Chrome version compatibility
   - Verify manifest.json syntax
   - Check console for JavaScript errors

2. **API Connection Issues**
   - Verify API keys are correctly set
   - Check network connectivity
   - Review rate limiting status

3. **Performance Issues**
   - Monitor memory usage
   - Check for WebSocket connection leaks
   - Review database query performance

### Debug Mode

Enable debug mode for detailed logging:

```bash
export DEBUG=lemora:*
npm start
```

### Support

For deployment support:
- Email: devops@lemora-bot.com
- Discord: #deployment-support
- Documentation: https://docs.lemora-bot.com/deployment

## Security Considerations

### API Key Management
- Use environment variables for sensitive data
- Implement key rotation procedures
- Monitor API key usage and quotas

### Network Security
- Use HTTPS for all communications
- Implement proper CORS policies
- Set up rate limiting and DDoS protection

### Data Protection
- Encrypt sensitive data at rest
- Implement proper access controls
- Regular security audits and updates

## Rollback Procedures

### Quick Rollback
```bash
npm run rollback:quick
```

### Full Rollback
```bash
npm run rollback:full -- --version=1.2.0
```

### Database Rollback
```bash
npm run rollback:db -- --migration=20250101000000
```

---

For additional deployment assistance, contact our DevOps team at devops@lemora-bot.com.
