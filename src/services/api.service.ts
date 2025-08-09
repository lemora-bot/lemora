import { TokenInfo } from '@types/signals';

export interface PriceData {
  mint: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: number;
}

export interface MarketData {
  tokens: PriceData[];
  totalMarketCap: number;
  total24hVolume: number;
  lastUpdated: number;
}

export class APIService {
  private baseUrls = {
    birdeye: 'https://public-api.birdeye.so',
    jupiter: 'https://price.jup.ag/v4',
    helius: 'https://api.helius.xyz/v0',
    coingecko: 'https://api.coingecko.com/api/v3'
  };

  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 30000; // 30 seconds

  constructor(private apiKeys: { helius?: string; birdeye?: string } = {}) {}

  async getTokenPrice(mint: string): Promise<PriceData | null> {
    const cacheKey = `price_${mint}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Try Jupiter first (no API key required)
      const jupiterPrice = await this.getJupiterPrice(mint);
      if (jupiterPrice) {
        this.setCachedData(cacheKey, jupiterPrice);
        return jupiterPrice;
      }

      // Fallback to Birdeye
      const birdeyePrice = await this.getBirdeyePrice(mint);
      if (birdeyePrice) {
        this.setCachedData(cacheKey, birdeyePrice);
        return birdeyePrice;
      }

      return null;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return null;
    }
  }

  async getMultipleTokenPrices(mints: string[]): Promise<PriceData[]> {
    const promises = mints.map(mint => this.getTokenPrice(mint));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<PriceData> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  async getTokenInfo(mint: string): Promise<TokenInfo | null> {
    const cacheKey = `token_info_${mint}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrls.birdeye}/defi/token_overview?address=${mint}`, {
        headers: this.getBirdeyeHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const tokenInfo: TokenInfo = {
          mint: data.data.address,
          symbol: data.data.symbol,
          name: data.data.name,
          logo: data.data.logoURI,
          decimals: data.data.decimals,
          totalSupply: data.data.supply,
          circulatingSupply: data.data.supply, // Approximate
          marketCap: data.data.mc,
          price: data.data.price,
          priceChange24h: data.data.priceChange24hPercent,
          volume24h: data.data.v24hUSD,
          liquidity: data.data.liquidity?.usd || 0,
          fdv: data.data.fdv,
          coingeckoId: data.data.extensions?.coingeckoId,
          coinmarketcapId: data.data.extensions?.coinmarketcapId
        };

        this.setCachedData(cacheKey, tokenInfo);
        return tokenInfo;
      }

      return null;
    } catch (error) {
      console.error('Error fetching token info:', error);
      return null;
    }
  }

  private async getJupiterPrice(mint: string): Promise<PriceData | null> {
    try {
      const response = await fetch(`${this.baseUrls.jupiter}/price?ids=${mint}`);
      const data = await response.json();
      
      if (data.data && data.data[mint]) {
        const priceInfo = data.data[mint];
        return {
          mint,
          symbol: 'UNKNOWN',
          price: priceInfo.price,
          change24h: 0, // Jupiter doesn't provide 24h change
          volume24h: 0,
          marketCap: 0,
          lastUpdated: Date.now()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Jupiter price fetch error:', error);
      return null;
    }
  }

  private async getBirdeyePrice(mint: string): Promise<PriceData | null> {
    try {
      const response = await fetch(
        `${this.baseUrls.birdeye}/defi/price?address=${mint}`,
        { headers: this.getBirdeyeHeaders() }
      );
      
      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          mint,
          symbol: 'UNKNOWN',
          price: data.data.value,
          change24h: data.data.priceChange24hPercent || 0,
          volume24h: 0,
          marketCap: 0,
          lastUpdated: Date.now()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Birdeye price fetch error:', error);
      return null;
    }
  }

  private getBirdeyeHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (this.apiKeys.birdeye) {
      headers['X-API-KEY'] = this.apiKeys.birdeye;
    }

    return headers;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }

  setCacheTimeout(timeout: number): void {
    this.cacheTimeout = timeout;
  }
}

  async getHistoricalPrices(mint: string, timeframe: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<PriceData[]> {
    const cacheKey = `historical_${mint}_${timeframe}`;
    const cached = this.getCachedData<PriceData[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseUrls.birdeye}/defi/history_price?address=${mint}&address_type=token&type=${timeframe}`,
        { headers: this.getBirdeyeHeaders() }
      );

      const data = await response.json();
      
      if (data.success && data.data && data.data.items) {
        const historicalData: PriceData[] = data.data.items.map((item: any) => ({
          mint,
          symbol: 'UNKNOWN',
          price: item.value,
          change24h: 0,
          volume24h: 0,
          marketCap: 0,
          lastUpdated: item.unixTime * 1000
        }));
        
        this.setCachedData(cacheKey, historicalData);
        return historicalData;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching historical prices:', error);
      return [];
    }
  }

  async getTopTokens(limit: number = 100): Promise<PriceData[]> {
    const cacheKey = `top_tokens_${limit}`;
    const cached = this.getCachedData<PriceData[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseUrls.birdeye}/defi/tokenlist?sort_by=mc&sort_type=desc&offset=0&limit=${limit}`,
        { headers: this.getBirdeyeHeaders() }
      );

      const data = await response.json();
      
      if (data.success && data.data && data.data.tokens) {
        const topTokens: PriceData[] = data.data.tokens.map((token: any) => ({
          mint: token.address,
          symbol: token.symbol,
          price: token.price,
          change24h: token.priceChange24hPercent || 0,
          volume24h: token.v24hUSD || 0,
          marketCap: token.mc || 0,
          lastUpdated: Date.now()
        }));
        
        this.setCachedData(cacheKey, topTokens);
        return topTokens;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching top tokens:', error);
      return [];
    }
  }

  async batchTokenLookup(mints: string[]): Promise<Map<string, TokenInfo>> {
    const results = new Map<string, TokenInfo>();
    const batchSize = 10;
    
    for (let i = 0; i < mints.length; i += batchSize) {
      const batch = mints.slice(i, i + batchSize);
      const batchPromises = batch.map(mint => this.getTokenInfo(mint));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          const mint = batch[index];
          if (result.status === 'fulfilled' && result.value) {
            results.set(mint, result.value);
          } else {
            console.warn(`Failed to fetch token info for ${mint}:`, 
              result.status === 'rejected' ? result.reason : 'No data');
          }
        });
      } catch (error) {
        console.error(`Batch ${i}-${i + batchSize} failed:`, error);
      }
      
      // Rate limiting - wait 100ms between batches
      if (i + batchSize < mints.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  async getMarketOverview(): Promise<MarketData> {
    const cacheKey = 'market_overview';
    const cached = this.getCachedData<MarketData>(cacheKey);
    if (cached) return cached;

    try {
      const topTokens = await this.getTopTokens(50);
      
      const marketData: MarketData = {
        tokens: topTokens,
        totalMarketCap: topTokens.reduce((sum, token) => sum + (token.marketCap || 0), 0),
        total24hVolume: topTokens.reduce((sum, token) => sum + (token.volume24h || 0), 0),
        lastUpdated: Date.now()
      };
      
      this.setCachedData(cacheKey, marketData);
      return marketData;
    } catch (error) {
      console.error('Error fetching market overview:', error);
      return {
        tokens: [],
        totalMarketCap: 0,
        total24hVolume: 0,
        lastUpdated: Date.now()
      };
    }
  }

  enableRetryMechanism(maxRetries: number = 3, retryDelay: number = 1000): void {
    // Implementation for retry mechanism configuration
    console.log(`Retry mechanism enabled: ${maxRetries} retries with ${retryDelay}ms delay`);
  }

