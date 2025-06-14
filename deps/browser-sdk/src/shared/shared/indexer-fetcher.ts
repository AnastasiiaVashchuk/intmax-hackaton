import { AxiosInstance } from 'axios';

import { DEVNET_ENV, MAINNET_ENV, TESTNET_ENV } from '../constants';
import { BlockBuilderResponse, IntMaxEnvironment } from '../types';
import { axiosClientInit } from '../utils';

export class IndexerFetcher {
  #url: string = '';

  readonly #httpClient: AxiosInstance;

  constructor(environment: IntMaxEnvironment) {
    this.#httpClient = axiosClientInit({
      baseURL:
        environment === 'mainnet'
          ? MAINNET_ENV.indexer_url
          : environment === 'testnet'
            ? TESTNET_ENV.indexer_url
            : DEVNET_ENV.indexer_url,
    });
  }

  async fetchBlockBuilderUrl(): Promise<string> {
    const data = await this.#httpClient.get<BlockBuilderResponse[], BlockBuilderResponse[]>('/builders');
    if (!data) {
      throw new Error('Failed to fetch block builder URL');
    }
    this.#url = data?.[0].url || '';

    return this.#url;
  }

  async getBlockBuilderUrl(): Promise<string> {
    if (this.#url) {
      return this.#url;
    }
    return await this.fetchBlockBuilderUrl();
  }
}
