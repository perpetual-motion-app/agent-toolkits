import { BaseToolkit, Tool } from '@agent-toolkits/base';
import { GeckoTerminalGetNewPoolsToolkit, PoolData } from '@agent-toolkits/geckoterminal-get-new-pools';
import { differenceInMinutes, parseISO } from 'date-fns';
import { AnalyzePoolsParams, AnalyzedPool, PoolAnalyzerConfig } from './types';

export class PoolAnalyzerToolkit extends BaseToolkit {
  private poolsToolkit: GeckoTerminalGetNewPoolsToolkit;

  constructor() {
    super();
    this.poolsToolkit = new GeckoTerminalGetNewPoolsToolkit();
    this.registerTool(this.analyzePoolsTool());
  }

  private analyzePool(pool: PoolData, config: PoolAnalyzerConfig): AnalyzedPool {
    const liquidityUSD = parseFloat(pool.attributes.reserve_in_usd);
    const totalTransactions24h = pool.attributes.transactions.h24.buys + pool.attributes.transactions.h24.sells;
    const ageMinutes = differenceInMinutes(new Date(), parseISO(pool.attributes.pool_created_at));
    const volumeUSD24h = parseFloat(pool.attributes.volume_usd.h24);
    const priceChangePercent24h = parseFloat(pool.attributes.price_change_percentage.h24);

    const failedCriteria: string[] = [];

    // Check required criteria
    if (liquidityUSD < config.minLiquidityUSD) {
      failedCriteria.push(`Insufficient liquidity: ${liquidityUSD} < ${config.minLiquidityUSD}`);
    }

    if (totalTransactions24h < config.minTotalTransactions24h) {
      failedCriteria.push(`Low transaction count: ${totalTransactions24h} < ${config.minTotalTransactions24h}`);
    }

    if (ageMinutes > config.maxPoolAgeMinutes) {
      failedCriteria.push(`Pool too old: ${ageMinutes} > ${config.maxPoolAgeMinutes}`);
    }

    // Check optional criteria
    if (config.minVolumeUSD24h && volumeUSD24h < config.minVolumeUSD24h) {
      failedCriteria.push(`Insufficient volume: ${volumeUSD24h} < ${config.minVolumeUSD24h}`);
    }

    if (config.minPriceChangePercent24h && priceChangePercent24h < config.minPriceChangePercent24h) {
      failedCriteria.push(`Price change too low: ${priceChangePercent24h}% < ${config.minPriceChangePercent24h}%`);
    }

    if (config.maxPriceChangePercent24h && priceChangePercent24h > config.maxPriceChangePercent24h) {
      failedCriteria.push(`Price change too high: ${priceChangePercent24h}% > ${config.maxPriceChangePercent24h}%`);
    }

    if (config.includeDexes && !config.includeDexes.includes(pool.relationships.dex.data.id)) {
      failedCriteria.push(`DEX not included: ${pool.relationships.dex.data.id}`);
    }

    return {
      ...pool,
      analysis: {
        liquidityUSD,
        totalTransactions24h,
        ageMinutes,
        volumeUSD24h,
        priceChangePercent24h,
        meetsAllCriteria: failedCriteria.length === 0,
        failedCriteria
      }
    };
  }

  private analyzePoolsTool(): Tool {
    return {
      name: 'analyzePools',
      description: 'Analyzes pools based on liquidity, transactions, and age criteria',
      execute: async (params: AnalyzePoolsParams): Promise<AnalyzedPool[]> => {
        const { network, page, limit, config } = params;
        
        // Fetch pools using the GeckoTerminal toolkit
        const pools = await this.poolsToolkit.executeTool('getNewPools', {
          network,
          page,
          limit
        });

        // Analyze each pool
        return pools.data.map((pool: PoolData) => this.analyzePool(pool, config));
      }
    };
  }
}

// Export types
export * from './types'; 