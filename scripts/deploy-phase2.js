const hre = require('hardhat');
const { deploy } = require('./utils');

async function main() {
    // Deploy YieldOptimizer contract
    const yieldOptimizer = await deploy('YieldOptimizer');
    console.log(`YieldOptimizer contract deployed to ${yieldOptimizer.address}`);

    // Deploy OracleAggregator contract
    const oracleAggregator = await deploy('OracleAggregator');
    console.log(`OracleAggregator contract deployed to ${oracleAggregator.address}`);

    // Deploy LiquidityManager contract
    const liquidityManager = await deploy('LiquidityManager');
    console.log(`LiquidityManager contract deployed to ${liquidityManager.address}`);

    // Deploy GovernanceModule contract
    const governanceModule = await deploy('GovernanceModule');
    console.log(`GovernanceModule contract deployed to ${governanceModule.address}`);
}

main();