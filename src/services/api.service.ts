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

