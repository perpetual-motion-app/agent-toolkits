"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolAnalyzerToolkit = void 0;
const base_1 = require("@agent-toolkits/base");
const geckoterminal_get_new_pools_1 = require("@agent-toolkits/geckoterminal-get-new-pools");
const date_fns_1 = require("date-fns");
class PoolAnalyzerToolkit extends base_1.BaseToolkit {
    constructor() {
        super();
        this.poolsToolkit = new geckoterminal_get_new_pools_1.GeckoTerminalGetNewPoolsToolkit();
        this.registerTool(this.analyzePoolsTool());
    }
    analyzePool(pool, config) {
        const liquidityUSD = parseFloat(pool.attributes.reserve_in_usd);
        const totalTransactions24h = pool.attributes.transactions.h24.buys + pool.attributes.transactions.h24.sells;
        const ageMinutes = (0, date_fns_1.differenceInMinutes)(new Date(), (0, date_fns_1.parseISO)(pool.attributes.pool_created_at));
        const volumeUSD24h = parseFloat(pool.attributes.volume_usd.h24);
        const priceChangePercent24h = parseFloat(pool.attributes.price_change_percentage.h24);
        const failedCriteria = [];
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
    analyzePoolsTool() {
        return {
            name: 'analyzePools',
            description: 'Analyzes pools based on liquidity, transactions, and age criteria',
            execute: async (params) => {
                const { network, page, limit, config } = params;
                // Fetch pools using the GeckoTerminal toolkit
                const pools = await this.poolsToolkit.executeTool('getNewPools', {
                    network,
                    page,
                    limit
                });
                // Analyze each pool
                return pools.data.map((pool) => this.analyzePool(pool, config));
            }
        };
    }
}
exports.PoolAnalyzerToolkit = PoolAnalyzerToolkit;
// Export types
__exportStar(require("./types"), exports);
