"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
async function main() {
    // Create an instance of the toolkit
    const toolkit = new index_1.GeckoTerminalGetNewPoolsToolkit();
    try {
        // Get new pools from Ethereum network
        const newPools = await toolkit.executeTool('getNewPools', {
            network: 'eth',
            page: 1,
            limit: 10
        });
        console.log('New pools found:', newPools.data.length);
        // Print details of each pool
        newPools.data.forEach((pool) => {
            console.log(`
Pool: ${pool.attributes.name}
Address: ${pool.attributes.address}
Base Token Price USD: ${pool.attributes.base_token_price_usd}
Quote Token Price USD: ${pool.attributes.quote_token_price_usd}
Created At: ${pool.attributes.pool_created_at}
FDV USD: ${pool.attributes.fdv_usd}
Market Cap USD: ${pool.attributes.market_cap_usd || 'N/A'}
24h Volume USD: ${pool.attributes.volume_usd.h24}
24h Transactions: ${JSON.stringify(pool.attributes.transactions.h24)}
DEX: ${pool.relationships.dex.data.id}
Reserve in USD: ${pool.attributes.reserve_in_usd}
Price Change 24h: ${pool.attributes.price_change_percentage.h24}%
      `);
        });
    }
    catch (error) {
        console.error('Error:', error);
    }
}
// Run the example
main();
