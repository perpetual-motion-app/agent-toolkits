"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
async function main() {
    // Create an instance of the toolkit
    const toolkit = new index_1.JupiterGetNewPoolsToolkit();
    try {
        // Get new pools from Jupiter
        const result = await toolkit.executeTool('getNewPools', {
            maxAgeMinutes: 5, // Get pools up to 5 minutes old
            limit: 20 // Get up to 20 pools
        });
        console.log(`Found ${result.pools.length} new pools in the last 5 minutes`);
        console.log(`Has more pools: ${result.hasMore}`);
        if (result.nextCursor) {
            console.log(`Next cursor: ${result.nextCursor}`);
        }
        // Print pool statistics
        const stats = {
            totalLiquidity: 0,
            totalVolume24h: 0,
            dexDistribution: {},
            averageHolderCount: 0,
            organicScoreDistribution: {}
        };
        result.pools.forEach((pool) => {
            stats.totalLiquidity += pool.liquidity;
            stats.totalVolume24h += pool.volume24h;
            stats.averageHolderCount += pool.baseAsset.holderCount;
            // Count DEXes
            stats.dexDistribution[pool.dex] = (stats.dexDistribution[pool.dex] || 0) + 1;
            // Count organic scores
            stats.organicScoreDistribution[pool.baseAsset.organicScoreLabel] =
                (stats.organicScoreDistribution[pool.baseAsset.organicScoreLabel] || 0) + 1;
        });
        const poolCount = result.pools.length;
        console.log('\nPool Statistics:');
        console.log(`Average Liquidity: $${(stats.totalLiquidity / poolCount).toLocaleString()}`);
        console.log(`Average 24h Volume: $${(stats.totalVolume24h / poolCount).toLocaleString()}`);
        console.log(`Average Holder Count: ${(stats.averageHolderCount / poolCount).toFixed(1)}`);
        console.log('\nDEX Distribution:');
        Object.entries(stats.dexDistribution).forEach(([dex, count]) => {
            console.log(`${dex}: ${count} pools (${((count / poolCount) * 100).toFixed(1)}%)`);
        });
        console.log('\nOrganic Score Distribution:');
        Object.entries(stats.organicScoreDistribution).forEach(([score, count]) => {
            console.log(`${score}: ${count} pools (${((count / poolCount) * 100).toFixed(1)}%)`);
        });
        // Print details of each pool
        console.log('\nPool Details:');
        result.pools.forEach((pool) => {
            const buyRatio = pool.baseAsset.stats24h.numBuys /
                (pool.baseAsset.stats24h.numBuys + (pool.baseAsset.stats24h.numSells || 0));
            console.log(`
Pool: ${pool.baseAsset.name} (${pool.baseAsset.symbol})
ID: ${pool.id}
DEX: ${pool.dex}
Created: ${pool.createdAt}
Analysis:
  - Liquidity: $${pool.liquidity.toLocaleString()}
  - 24h Volume: $${pool.volume24h.toLocaleString()}
  - 24h Transactions: ${pool.baseAsset.stats24h.numBuys + (pool.baseAsset.stats24h.numSells || 0)} (${(buyRatio * 100).toFixed(1)}% buys)
  - Price: $${pool.baseAsset.usdPrice.toFixed(8)}
  - Market Cap: $${pool.baseAsset.mcap.toLocaleString()}
  - Holder Count: ${pool.baseAsset.holderCount}
  - Organic Score: ${pool.baseAsset.organicScore} (${pool.baseAsset.organicScoreLabel})
  - Top Holders %: ${(pool.baseAsset.audit.topHoldersPercentage * 100).toFixed(1)}%
      `);
        });
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// Run the example
main();
