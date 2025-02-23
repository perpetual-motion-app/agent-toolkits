import { BaseToolkit, Tool } from '@agent-toolkits/base';
import axios, { AxiosError } from 'axios';
import { GetNewPoolsParams, GetNewPoolsResponse } from './types';

const BASE_URL = "https://api.geckoterminal.com/api/v2";

export class GeckoTerminalGetNewPoolsToolkit extends BaseToolkit {
  constructor() {
    super();
    this.registerTool(this.getNewPoolsTool());
  }

  private getNewPoolsTool(): Tool {
    return {
      name: 'getNewPools',
      description: 'Fetches new pools from GeckoTerminal API',
      execute: async (params: GetNewPoolsParams = {}): Promise<GetNewPoolsResponse> => {
        const { network = 'solana', page = 1, limit = 100 } = params;
        
        try {
          const response = await axios.get(`${BASE_URL}/networks/${network}/new_pools`, {
            params: {
              page,
              limit
            },
            headers: {
              'Accept': 'application/json'
            }
          });

          return response.data as GetNewPoolsResponse;
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