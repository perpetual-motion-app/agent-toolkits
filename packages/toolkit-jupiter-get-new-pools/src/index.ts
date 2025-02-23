import { BaseToolkit, Tool } from '@agent-toolkits/base';
import { Pool, IPoolBase, Platform, TimeWindow } from '@perpetual-motion-app/shared';
import axios from 'axios';
import { differenceInMinutes, parseISO } from 'date-fns';
import { GetNewPoolsParams, GetNewPoolsResponse, JupiterPool, JupiterResponse } from './types';

const BASE_URL = "https://datapi.jup.ag/v1";

export class JupiterGetNewPoolsToolkit extends BaseToolkit {
  constructor() {
    super();
    this.registerTool(this.getNewPoolsTool());
  }

  /**
   * Convert a Jupiter pool to the normalized format
   */
  private normalizePool(pool: any): Pool {
    console.log('Normalizing Jupiter pool:', JSON.stringify(pool, null, 2));

    const baseAsset = pool.baseAsset;
    const stats = baseAsset?.stats24h || {};
    const audit = baseAsset?.audit || {};

    const normalizedData = {
      id: pool.id,
      address: pool.id,
      name: `${baseAsset?.name || 'Unknown'}/SOL`,
      platform: 'jupiter',
      chainId: 'solana',
      createdAt: pool.createdAt,
      token0: {
        address: baseAsset?.id,
        symbol: baseAsset?.symbol || 'Unknown',
        name: baseAsset?.name || 'Unknown',
        decimals: baseAsset?.decimals || 6,
        chainId: 'solana',
        logoURI: baseAsset?.icon,
        metadata: {
          organicScore: baseAsset?.organicScore || 0,
          isAudited: audit?.mintAuthorityDisabled && audit?.freezeAuthorityDisabled,
          auditInfo: audit?.mintAuthorityDisabled ? [
            {
              auditor: 'Jupiter',
              auditDate: pool.createdAt
            }
          ] : []
        }
      },
      token1: {
        address: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        chainId: 'solana',
        metadata: {
          isAudited: true
        }
      },
      metrics: {
        price: baseAsset?.usdPrice || 0,
        priceChange: {
          '5m': stats?.priceChange || 0,
          '1h': stats?.priceChange || 0,
          '6h': stats?.priceChange || 0,
          '24h': stats?.priceChange || 0
        },
        volume: {
          '5m': (stats?.buyVolume || 0) + (stats?.sellVolume || 0),
          '1h': (stats?.buyVolume || 0) + (stats?.sellVolume || 0),
          '6h': (stats?.buyVolume || 0) + (stats?.sellVolume || 0),
          '24h': pool.volume24h || 0
        },
        liquidity: {
          token0: pool.liquidity || 0,
          token1: 0,
          total: pool.liquidity || 0
        },
        transactions: {
          '24h': {
            total: (stats?.numBuys || 0) + (stats?.numSells || 0),
            buys: stats?.numBuys || 0,
            sells: stats?.numSells || 0,
            uniqueTraders: stats?.numTraders || 0
          }
        }
      },
      platformData: {
        dex: pool.dex,
        type: pool.type,
        bondingCurve: pool.bondingCurve || 0,
        baseAssetDetails: {
          tokenProgram: baseAsset?.tokenProgram,
          launchpad: baseAsset?.launchpad,
          circSupply: baseAsset?.circSupply,
          totalSupply: baseAsset?.totalSupply
        }
      }
    };

    return new Pool(normalizedData);
  }

  private async fetchPoolsPage(): Promise<JupiterResponse> {
    try {
      const response = await axios.get(`${BASE_URL}/pools`, {
        params: {
          sortBy: 'listedTime',
          sortDir: 'desc'
        }
      });
      
      // Log the first pool to see its structure
      if (response.data.pools && response.data.pools.length > 0) {
        console.log('\nJupiter Raw Pool Data:');
        console.log(JSON.stringify(response.data.pools[0], null, 2));
      }
      
      return {
        pools: response.data.pools,
        total: response.data.total,
        next: response.data.next
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Jupiter API error: ${error.message}`);
      }
      throw error;
    }
  }

  private filterPoolsByAge(pools: JupiterPool[], maxAgeMinutes: number): JupiterPool[] {
    const now = new Date();
    return pools.filter(pool => {
      const poolAge = differenceInMinutes(now, parseISO(pool.createdAt));
      return poolAge <= maxAgeMinutes;
    });
  }

  public getNewPoolsTool(): Tool {
    return {
      name: 'getNewPools',
      description: 'Fetches new pools from Jupiter API',
      execute: async (params: GetNewPoolsParams = {}): Promise<GetNewPoolsResponse> => {
        const { maxAgeMinutes = 2, limit = 50 } = params;
        
        // Fetch first page of pools
        const response = await this.fetchPoolsPage();
        
        // Filter pools by age
        const filteredPools = this.filterPoolsByAge(response.pools, maxAgeMinutes);
        
        // Normalize pools
        const normalizedPools = filteredPools.map(pool => this.normalizePool(pool));
        
        // Check if we need more pools
        const hasMore = Boolean(limit > filteredPools.length && response.next);
        
        return {
          pools: normalizedPools.slice(0, limit),
          hasMore,
          nextCursor: hasMore ? response.next : undefined
        };
      }
    };
  }
}

// Export types
export * from './types'; 