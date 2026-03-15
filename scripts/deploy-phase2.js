const { ethers } = require('ethers');
const { YieldOptimizer, OracleAggregator, LiquidityManager, GovernanceModule } = require('../contracts');

async function deploy() {
    const provider = new ethers.providers.InfuraProvider('mainnet', 'YOUR_PROJECT_ID');
    const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);

    const yieldOptimizer = await new YieldOptimizer().deploy({
        gasLimit: 1000000,
        gasPrice: ethers.utils.parseUnits('20', 'gwei')
    });
    console.log('YieldOptimizer deployed to:', yieldOptimizer.address);

    const oracleAggregator = await new OracleAggregator().deploy({
        gasLimit: 1000000,
        gasPrice: ethers.utils.parseUnits('20', 'gwei')
    });
    console.log('OracleAggregator deployed to:', oracleAggregator.address);

    const liquidityManager = await new LiquidityManager().deploy({
        gasLimit: 1000000,
        gasPrice: ethers.utils.parseUnits('20', 'gwei')
    });
    console.log('LiquidityManager deployed to:', liquidityManager.address);

    const governanceModule = await new GovernanceModule().deploy({
        gasLimit: 1000000,
        gasPrice: ethers.utils.parseUnits('20', 'gwei')
    });
    console.log('GovernanceModule deployed to:', governanceModule.address);
}
deploy();