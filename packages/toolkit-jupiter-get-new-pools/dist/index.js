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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JupiterGetNewPoolsToolkit = void 0;
const base_1 = require("@agent-toolkits/base");
const shared_1 = require("@perpetual-motion-app/shared");
const axios_1 = __importDefault(require("axios"));
const date_fns_1 = require("date-fns");
const BASE_URL = "https://datapi.jup.ag/v1";
class JupiterGetNewPoolsToolkit extends base_1.BaseToolkit {
    constructor() {
        super();
        this.registerTool(this.getNewPoolsTool());
    }
    /**
     * Convert a Jupiter pool to the normalized format
     */
    normalizePool(pool) {
        console.log('\nNormalizing Jupiter pool:', JSON.stringify(pool, null, 2));
        const normalizedData = {
            id: pool.id,
            address: pool.baseAsset.id, // Jupiter uses token address as pool address
            name: `${pool.baseAsset.symbol}/SOL`, // Most Jupiter pools are against SOL
            platform: shared_1.Platform.JUPITER,
            chainId: 'solana',
            createdAt: pool.createdAt,
            // Token 0 (Base Asset)
            token0: {
                address: pool.baseAsset.id,
                symbol: pool.baseAsset.symbol,
                name: pool.baseAsset.name,
                decimals: pool.baseAsset.decimals,
                chainId: 'solana',
                logoURI: pool.baseAsset.icon,
                metadata: {
                    organicScore: pool.baseAsset.organicScore,
                    isAudited: pool.baseAsset.audit.mintAuthorityDisabled &&
                        pool.baseAsset.audit.freezeAuthorityDisabled,
                    auditInfo: [{
                            auditor: 'Jupiter',
                            auditDate: pool.createdAt, // Using pool creation date as audit date
                            reportUrl: undefined
                        }]
                }
            },
            // Token 1 (SOL - Default quote asset for Jupiter)
            token1: {
                address: 'So11111111111111111111111111111111111111112', // Native SOL mint address
                symbol: 'SOL',
                name: 'Solana',
                decimals: 9,
                chainId: 'solana',
                metadata: {
                    isAudited: true
                }
            },
            // Metrics
            metrics: {
                price: pool.baseAsset.usdPrice,
                priceChange: {
                    '5m': pool.baseAsset.stats5m?.priceChange ?? 0,
                    '1h': pool.baseAsset.stats1h?.priceChange ?? 0,
                    '6h': pool.baseAsset.stats6h?.priceChange ?? 0,
                    '24h': pool.baseAsset.stats24h?.priceChange ?? 0
                },
                volume: {
                    '5m': (pool.baseAsset.stats5m?.buyVolume ?? 0) + (pool.baseAsset.stats5m?.sellVolume ?? 0),
                    '1h': (pool.baseAsset.stats1h?.buyVolume ?? 0) + (pool.baseAsset.stats1h?.sellVolume ?? 0),
                    '6h': (pool.baseAsset.stats6h?.buyVolume ?? 0) + (pool.baseAsset.stats6h?.sellVolume ?? 0),
                    '24h': pool.volume24h
                },
                liquidity: {
                    total: pool.liquidity,
                    token0: pool.liquidity / 2, // Approximate split
                    token1: pool.liquidity / 2 // Approximate split
                },
                transactions: {
                    '24h': {
                        total: (pool.baseAsset.stats24h?.numBuys ?? 0) + (pool.baseAsset.stats24h?.numSells ?? 0),
                        buys: pool.baseAsset.stats24h?.numBuys ?? 0,
                        sells: pool.baseAsset.stats24h?.numSells ?? 0,
                        uniqueTraders: pool.baseAsset.stats24h?.numTraders ?? 0
                    }
                }
            },
            // Store additional Jupiter-specific data
            platformData: {
                dex: pool.dex,
                type: pool.type,
                bondingCurve: pool.bondingCurve,
                baseAssetDetails: {
                    tokenProgram: pool.baseAsset.tokenProgram,
                    launchpad: pool.baseAsset.launchpad,
                    holderCount: pool.baseAsset.holderCount,
                    circSupply: pool.baseAsset.circSupply,
                    totalSupply: pool.baseAsset.totalSupply,
                    fdv: pool.baseAsset.fdv,
                    mcap: pool.baseAsset.mcap
                }
            }
        };
        return new shared_1.Pool(normalizedData);
    }
    async fetchPoolsPage() {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/pools`, {
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
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Jupiter API error: ${error.message}`);
            }
            throw error;
        }
    }
    filterPoolsByAge(pools, maxAgeMinutes) {
        const now = new Date();
        return pools.filter(pool => {
            const poolAge = (0, date_fns_1.differenceInMinutes)(now, (0, date_fns_1.parseISO)(pool.createdAt));
            return poolAge <= maxAgeMinutes;
        });
    }
    getNewPoolsTool() {
        return {
            name: 'getNewPools',
            description: 'Fetches new pools from Jupiter API',
            execute: async (params = {}) => {
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
exports.JupiterGetNewPoolsToolkit = JupiterGetNewPoolsToolkit;
// Export types
__exportStar(require("./types"), exports);
