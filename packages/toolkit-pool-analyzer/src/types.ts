import { PoolData } from '@agent-toolkits/geckoterminal-get-new-pools';

export interface PoolAnalyzerConfig {
  // Minimum liquidity in USD
  minLiquidityUSD: number;
  
  // Minimum total transactions in the last 24h
  minTotalTransactions24h: number;
  
  // Maximum pool age in minutes
  maxPoolAgeMinutes: number;
  
  // Optional: Minimum volume in USD for the last 24h
  minVolumeUSD24h?: number;
  
  // Optional: Minimum price change percentage in 24h
  minPriceChangePercent24h?: number;
  
  // Optional: Maximum price change percentage in 24h
  maxPriceChangePercent24h?: number;
  
  // Optional: Specific DEXes to include
  includeDexes?: string[];
}

export interface AnalyzedPool extends PoolData {
  analysis: {
    liquidityUSD: number;
    totalTransactions24h: number;
    ageMinutes: number;
    volumeUSD24h: number;
    priceChangePercent24h: number;
    meetsAllCriteria: boolean;
    failedCriteria: string[];
  };
}

export interface AnalyzePoolsParams {
  network?: string;
  page?: number;
  limit?: number;
  config: PoolAnalyzerConfig;
} 