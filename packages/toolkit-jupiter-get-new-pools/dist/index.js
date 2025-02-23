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
const axios_1 = __importDefault(require("axios"));
const date_fns_1 = require("date-fns");
const BASE_URL = "https://datapi.jup.ag/v1";
class JupiterGetNewPoolsToolkit extends base_1.BaseToolkit {
    constructor() {
        super();
        this.registerTool(this.getNewPoolsTool());
    }
    async fetchPoolsPage() {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/pools`, {
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
exports.JupiterGetNewPoolsToolkit = JupiterGetNewPoolsToolkit;
// Export types
__exportStar(require("./types"), exports);
