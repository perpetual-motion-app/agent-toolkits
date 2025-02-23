import { PoolData } from '@agent-toolkits/geckoterminal-get-new-pools';
export interface PoolAnalyzerConfig {
    minLiquidityUSD: number;
    minTotalTransactions24h: number;
    maxPoolAgeMinutes: number;
    minVolumeUSD24h?: number;
    minPriceChangePercent24h?: number;
    maxPriceChangePercent24h?: number;
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
