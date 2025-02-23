import { BaseToolkit, Tool } from '@agent-toolkits/base';
import { Pool, IPoolBase, Platform } from '@perpetual-motion-app/shared';
import axios, { AxiosError } from 'axios';
import { GetNewPoolsParams, GetNewPoolsResponse, PoolData } from './types';

const BASE_URL = "https://api.geckoterminal.com/api/v2";

interface ApiResponse {
  data: PoolData[];
  meta: {
    total_pages: number;
    current_page: number;
  };
}

export class GeckoTerminalGetNewPoolsToolkit extends BaseToolkit {
  constructor() {
    super();
    this.registerTool(this.getNewPoolsTool());
  }

  /**
   * Convert a GeckoTerminal pool to the normalized format
   */
  private normalizePool(pool: PoolData): Pool {
    const normalizedData: IPoolBase = {
      id: pool.id,
      address: pool.attributes.address,
      name: pool.attributes.name,
      platform: Platform.GECKO_TERMINAL,
      chainId: pool.relationships.dex.data.id.split('_')[0], // Network ID is first part of dex ID
      createdAt: pool.attributes.pool_created_at,

      // Base token (token0)
      token0: {
        address: pool.relationships.base_token.data.id,
        symbol: pool.attributes.name.split('/')[0], // Extract from pool name
        name: pool.attributes.name.split('/')[0], // Extract from pool name
        decimals: 18, // Default to 18, actual value needs to be fetched from token info
        chainId: pool.relationships.dex.data.id.split('_')[0],
      },

      // Quote token (token1)
      token1: {
        address: pool.relationships.quote_token.data.id,
        symbol: pool.attributes.name.split('/')[1], // Extract from pool name
        name: pool.attributes.name.split('/')[1], // Extract from pool name
        decimals: 18, // Default to 18, actual value needs to be fetched from token info
        chainId: pool.relationships.dex.data.id.split('_')[0],
      },

      // Metrics
      metrics: {
        price: parseFloat(pool.attributes.base_token_price_usd),
        priceChange: {
          '5m': parseFloat(pool.attributes.price_change_percentage.m5),
          '1h': parseFloat(pool.attributes.price_change_percentage.h1),
          '6h': parseFloat(pool.attributes.price_change_percentage.h6),
          '24h': parseFloat(pool.attributes.price_change_percentage.h24)
        },
        volume: {
          '5m': parseFloat(pool.attributes.volume_usd.m5),
          '1h': parseFloat(pool.attributes.volume_usd.h1),
          '6h': parseFloat(pool.attributes.volume_usd.h6),
          '24h': parseFloat(pool.attributes.volume_usd.h24)
        },
        liquidity: {
          total: parseFloat(pool.attributes.reserve_in_usd),
          token0: parseFloat(pool.attributes.reserve_in_usd) / 2, // Approximate split
          token1: parseFloat(pool.attributes.reserve_in_usd) / 2  // Approximate split
        },
        transactions: {
          '24h': {
            total: pool.attributes.transactions.h24.buys + pool.attributes.transactions.h24.sells,
            buys: pool.attributes.transactions.h24.buys,
            sells: pool.attributes.transactions.h24.sells,
            uniqueTraders: pool.attributes.transactions.h24.buyers + pool.attributes.transactions.h24.sellers
          }
        }
      },

      // Store additional GeckoTerminal-specific data
      platformData: {
        dexId: pool.relationships.dex.data.id,
        fdvUsd: pool.attributes.fdv_usd,
        marketCapUsd: pool.attributes.market_cap_usd,
        baseTokenPriceNativeCurrency: pool.attributes.base_token_price_native_currency,
        quoteTokenPriceNativeCurrency: pool.attributes.quote_token_price_native_currency,
        baseTokenPriceQuoteToken: pool.attributes.base_token_price_quote_token,
        quoteTokenPriceBaseToken: pool.attributes.quote_token_price_base_token
      }
    };

    return new Pool(normalizedData);
  }

  public getNewPoolsTool(): Tool {
    return {
      name: 'getNewPools',
      description: 'Fetches new pools from GeckoTerminal API',
      execute: async (params: GetNewPoolsParams = {}): Promise<GetNewPoolsResponse> => {
        const { network = 'solana', page = 1, limit = 100 } = params;
        
        try {
          const response = await axios.get<ApiResponse>(`${BASE_URL}/networks/${network}/new_pools`, {
            params: {
              page,
              limit
            },
            headers: {
              'Accept': 'application/json'
            }
          });

          // Normalize the pools
          const normalizedPools = response.data.data.map(pool => this.normalizePool(pool));

          return {
            data: normalizedPools,
            meta: response.data.meta
          };
        } catch (error: unknown) {
          if (error instanceof AxiosError) {
            throw new Error(`GeckoTerminal API error: ${error.message}`);
          }
          throw error;
        }
      }
    };
  }
}

// Export types
export * from './types'; 