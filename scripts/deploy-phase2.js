const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  // Deploy YieldOptimizer
  const YieldOptimizer = await ethers.getContractFactory('YieldOptimizer');
  const yieldOptimizer = await YieldOptimizer.deploy();
  await yieldOptimizer.deployed();
  console.log('YieldOptimizer deployed to:', yieldOptimizer.address);

  // Deploy OracleAggregator
  const OracleAggregator = await ethers.getContractFactory('OracleAggregator');
  const oracleAggregator = await OracleAggregator.deploy();
  await oracleAggregator.deployed();
  console.log('OracleAggregator deployed to:', oracleAggregator.address);

  // TODO: Deploy LiquidityManager and GovernanceModule
  // TODO: Configure initial protocols and price feeds
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
