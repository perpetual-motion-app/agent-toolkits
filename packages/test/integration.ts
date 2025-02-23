import { JupiterGetNewPoolsToolkit } from '@agent-toolkits/jupiter-get-new-pools';
import { GeckoTerminalGetNewPoolsToolkit } from '@agent-toolkits/geckoterminal-get-new-pools';

async function testDataSources() {
  console.log('Testing data sources and normalization...\n');

  // Test Jupiter
  console.log('Testing Jupiter:');
  const jupiterToolkit = new JupiterGetNewPoolsToolkit();
  try {
    const jupiterResult = await jupiterToolkit.getNewPoolsTool().execute({ maxAgeMinutes: 60 });
    console.log(`✓ Successfully fetched ${jupiterResult.pools.length} Jupiter pools`);
    if (jupiterResult.pools.length > 0) {
      const samplePool = jupiterResult.pools[0];
      console.log('\nSample Jupiter normalized pool:');
      console.log(JSON.stringify(samplePool, null, 2));
    }
  } catch (error) {
    console.error('✗ Jupiter error:', error);
  }

  console.log('\n-------------------\n');

  // Test GeckoTerminal
  console.log('Testing GeckoTerminal:');
  const geckoToolkit = new GeckoTerminalGetNewPoolsToolkit();
  try {
    const geckoResult = await geckoToolkit.getNewPoolsTool().execute({ network: 'solana', limit: 5 });
    console.log(`✓ Successfully fetched ${geckoResult.data.length} GeckoTerminal pools`);
    if (geckoResult.data.length > 0) {
      const samplePool = geckoResult.data[0];
      console.log('\nSample GeckoTerminal normalized pool:');
      console.log(JSON.stringify(samplePool, null, 2));
    }
  } catch (error) {
    console.error('✗ GeckoTerminal error:', error);
  }
}

testDataSources().catch(console.error); 