import { BaseToolkit, Tool } from '@agent-toolkits/base';
import axios from 'axios';
import { differenceInMinutes, parseISO } from 'date-fns';
import { GetNewPoolsParams, GetNewPoolsResponse, JupiterPool, JupiterResponse } from './types';

const BASE_URL = "https://datapi.jup.ag/v1";

export class JupiterGetNewPoolsToolkit extends BaseToolkit {
  constructor() {
    super();
    this.registerTool(this.getNewPoolsTool());
  }

  private async fetchPoolsPage(): Promise<JupiterResponse> {
    try {
      const response = await axios.get(`${BASE_URL}/pools`, {
        params: {
          sortBy: 'listedTime',
          sortDir: 'desc'
        }
      });
      
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

  private getNewPoolsTool(): Tool {
    return {
      name: 'getNewPools',
      description: 'Fetches new pools from Jupiter API',
      execute: async (params: GetNewPoolsParams = {}): Promise<GetNewPoolsResponse> => {
        const { maxAgeMinutes = 2, limit = 50 } = params;
        
        // Fetch first page of pools
        const response = await this.fetchPoolsPage();
        
        // Filter pools by age
        const filteredPools = this.filterPoolsByAge(response.pools, maxAgeMinutes);
        
        // Check if we need more pools
        const hasMore = Boolean(limit > filteredPools.length && response.next);
        
        return {
          pools: filteredPools.slice(0, limit),
          hasMore,
          nextCursor: hasMore ? response.next : undefined
        };
      }
    };
  }
}

// Export types
export * from './types'; 