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

/**
 * Lemora Wallet Tracker - API Service
 * Provides functions for interacting with external Solana and Token APIs
 */

import axios, { AxiosResponse } from 'axios';
import { APIConfig, HeliusTransactionResponse, BirdeyeTokenResponse, APIRequest } from '../types/api.types';

export class APIService {
  private heliusConfig: APIConfig;
  private birdeyeConfig: APIConfig;

  constructor(heliusConfig: APIConfig, birdeyeConfig: APIConfig) {
    this.heliusConfig = heliusConfig;
    this.birdeyeConfig = birdeyeConfig;
  }

  /**
   * Executes a GET request to the Helius transaction API
   */
  public async getHeliusTransactions(walletAddress: string): Promise<HeliusTransactionResponse[]> {
    const endpoint = `/transactions/address/${walletAddress}`;
    return this.executeRequest<HeliusTransactionResponse[]>({
      method: 'GET',
      endpoint,
      config: this.heliusConfig
    });
  }

  /**
   * Fetches token information from the Birdeye API
   */
  public async getTokenInfo(tokenAddress: string): Promise<BirdeyeTokenResponse> {
    const endpoint = `/token/${tokenAddress}`;
    return this.executeRequest<BirdeyeTokenResponse>({
      method: 'GET',
      endpoint,
      config: this.birdeyeConfig
    });
  }

  /**
   * Executes an API request with retry enabled
   */
  private async executeRequest<T>({ method, endpoint, config, data = null, params = {} }: APIRequest): Promise<T> {
    const url = `${config.baseURL}${endpoint}`;
    try {
      const response: AxiosResponse<T> = await axios.request<T>({
        method,
        url,
        data,
        params,
        headers: config.headers,
        timeout: config.timeout
      });
      return response.data;
    } catch (error) {
      console.error(`Request to ${url} failed:`, error);
      throw error;
    }
  }
}

