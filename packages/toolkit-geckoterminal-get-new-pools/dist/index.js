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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeckoTerminalGetNewPoolsToolkit = void 0;
const base_1 = require("@agent-toolkits/base");
const shared_1 = require("@perpetual-motion-app/shared");
const axios_1 = __importStar(require("axios"));
const BASE_URL = "https://api.geckoterminal.com/api/v2";
class GeckoTerminalGetNewPoolsToolkit extends base_1.BaseToolkit {
    constructor() {
        super();
        this.registerTool(this.getNewPoolsTool());
    }
    /**
     * Convert a GeckoTerminal pool to the normalized format
     */
    normalizePool(pool) {
        const normalizedData = {
            id: pool.id,
            address: pool.attributes.address,
            name: pool.attributes.name,
            platform: shared_1.Platform.GECKO_TERMINAL,
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
                    token1: parseFloat(pool.attributes.reserve_in_usd) / 2 // Approximate split
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
        return new shared_1.Pool(normalizedData);
    }
    getNewPoolsTool() {
        return {
            name: 'getNewPools',
            description: 'Fetches new pools from GeckoTerminal API',
            execute: async (params = {}) => {
                const { network = 'solana', page = 1, limit = 100 } = params;
                try {
                    const response = await axios_1.default.get(`${BASE_URL}/networks/${network}/new_pools`, {
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
                }
                catch (error) {
                    if (error instanceof axios_1.AxiosError) {
                        throw new Error(`GeckoTerminal API error: ${error.message}`);
                    }
                    throw error;
                }
            }
        };
    }
}
exports.GeckoTerminalGetNewPoolsToolkit = GeckoTerminalGetNewPoolsToolkit;
// Export types
__exportStar(require("./types"), exports);
