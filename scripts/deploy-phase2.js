const hre = require('hardhat');

async function main() {
    // Deploy the YieldOptimizer contract
    const YieldOptimizer = await hre.ethers.getContractFactory('YieldOptimizer');
    const yieldOptimizer = await YieldOptimizer.deploy();
    await yieldOptimizer.deployed();

    // Deploy the OracleAggregator contract
    const OracleAggregator = await hre.ethers.getContractFactory('OracleAggregator');
    const oracleAggregator = await OracleAggregator.deploy();
    await oracleAggregator.deployed();

    // Deploy the LiquidityManager contract
    const LiquidityManager = await hre.ethers.getContractFactory('LiquidityManager');
    const liquidityManager = await LiquidityManager.deploy();
    await liquidityManager.deployed();

    // Deploy the GovernanceModule contract
    const GovernanceModule = await hre.ethers.getContractFactory('GovernanceModule');
    const governanceModule = await GovernanceModule.deploy();
    await governanceModule.deployed();
}

main();