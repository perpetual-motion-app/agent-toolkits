import { PoolAnalyzerToolkit } from './index';
import { AnalyzedPool } from './types';

async function main() {
  // Create an instance of the toolkit
  const toolkit = new PoolAnalyzerToolkit();

  try {
    // Analyze pools with more lenient criteria
    const analyzedPools = await toolkit.executeTool('analyzePools', {
      network: 'eth',
      page: 1,
      limit: 20,
      config: {
        minLiquidityUSD: 5000, // Reduced from 10k to 5k
        minTotalTransactions24h: 5, // Reduced from 10 to 5
        maxPoolAgeMinutes: 120, // Increased from 60 to 120 minutes
        minVolumeUSD24h: 1000, // Reduced from 5k to 1k
        minPriceChangePercent24h: 0.5, // Reduced from 1% to 0.5%
        maxPriceChangePercent24h: 1000, // Increased from 500% to 1000%
        includeDexes: ['uniswap_v2', 'uniswap-v4-ethereum']
      }
    });

    // Get pools that meet all criteria
    const qualifiedPools = analyzedPools.filter((pool: AnalyzedPool) => pool.analysis.meetsAllCriteria);
    
    console.log(`Found ${qualifiedPools.length} qualified pools out of ${analyzedPools.length} total pools\n`);

    // Print summary statistics
    const stats = {
      avgLiquidity: 0,
      avgVolume: 0,
      avgTransactions: 0,
      avgAge: 0,
      dexDistribution: {} as Record<string, number>
    };

    analyzedPools.forEach((pool: AnalyzedPool) => {
      stats.avgLiquidity += pool.analysis.liquidityUSD;
      stats.avgVolume += pool.analysis.volumeUSD24h;
      stats.avgTransactions += pool.analysis.totalTransactions24h;
      stats.avgAge += pool.analysis.ageMinutes;
      
      const dex = pool.relationships.dex.data.id;
      stats.dexDistribution[dex] = (stats.dexDistribution[dex] || 0) + 1;
    });

    const poolCount = analyzedPools.length;
    console.log('Pool Statistics:');
    console.log(`Average Liquidity: $${(stats.avgLiquidity / poolCount).toLocaleString()}`);
    console.log(`Average 24h Volume: $${(stats.avgVolume / poolCount).toLocaleString()}`);
    console.log(`Average Transactions: ${(stats.avgTransactions / poolCount).toFixed(1)}`);
    console.log(`Average Age (minutes): ${(stats.avgAge / poolCount).toFixed(1)}`);
    console.log('\nDEX Distribution:');
    Object.entries(stats.dexDistribution).forEach(([dex, count]) => {
      console.log(`${dex}: ${count} pools (${((count / poolCount) * 100).toFixed(1)}%)`);
    });

    // Print details of qualified pools
    if (qualifiedPools.length > 0) {
      console.log('\nQualified Pools:');
      qualifiedPools.forEach((pool: AnalyzedPool) => {
        const buyRatio = pool.attributes.transactions.h24.buys / 
          (pool.attributes.transactions.h24.buys + pool.attributes.transactions.h24.sells);
        
        console.log(`
Pool: ${pool.attributes.name}
Address: ${pool.attributes.address}
DEX: ${pool.relationships.dex.data.id}
Analysis:
  - Liquidity USD: $${pool.analysis.liquidityUSD.toLocaleString()}
  - 24h Transactions: ${pool.analysis.totalTransactions24h} (${(buyRatio * 100).toFixed(1)}% buys)
  - Age (minutes): ${pool.analysis.ageMinutes}
  - 24h Volume USD: $${pool.analysis.volumeUSD24h.toLocaleString()}
  - 24h Price Change: ${pool.analysis.priceChangePercent24h}%
  - Base Token Price: $${parseFloat(pool.attributes.base_token_price_usd).toFixed(8)}
  - Quote Token Price: $${parseFloat(pool.attributes.quote_token_price_usd).toFixed(2)}
        `);
      });
    }

    // Print summary of failed criteria
    const failureReasons = new Map<string, number>();
    analyzedPools
      .filter((pool: AnalyzedPool) => !pool.analysis.meetsAllCriteria)
      .forEach((pool: AnalyzedPool) => {
        pool.analysis.failedCriteria.forEach((criteria: string) => {
          const reason = criteria.split(':')[0];
          failureReasons.set(reason, (failureReasons.get(reason) || 0) + 1);
        });
      });

    console.log('\nFailure Analysis:');
    failureReasons.forEach((count, reason) => {
      console.log(`${reason}: ${count} pools (${((count / analyzedPools.length) * 100).toFixed(1)}%)`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main(); 