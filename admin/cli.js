#!/usr/bin/env node

const { ethers } = require('ethers');
const { Command } = require('commander');
require('dotenv').config();

// Contract ABIs
const RYEGATE_NOTES_ABI = [
  'function distributeYield() external',
  'function fundYieldPool(uint256 period, uint256 amount) external',
  'function issueByPartition(bytes32 partition, address to, uint256 amount, bytes data) external',
  'function currentPeriod() view returns (uint256)',
  'function totalSupply() view returns (uint256)'
];

const REVENUE_ORACLE_ABI = [
  'function pushRevenue(uint256 grossRevenue, uint256 operatingCosts, uint256 adjustedEBITDA, uint256 periodStart, uint256 periodEnd) external',
  'function getLatestReport() view returns (tuple(uint256 grossRevenue, uint256 operatingCosts, uint256 adjustedEBITDA, uint256 periodStart, uint256 periodEnd))'
];

const USDC_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address account) view returns (uint256)'
];

const KYC_WHITELIST_ABI = [
  'function whitelistAddress(address account, bytes32 kycHash, bool isAccredited, uint256 expiresAt) external'
];

// Helper functions
function dateToTimestamp(dateStr) {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

function dollarToWei(amount) {
  return amount * 1_000_000;
}

function weiToDollar(wei) {
  return wei / 1_000_000;
}

function partitionToBytes32(partition) {
  return ethers.id(partition);
}

async function getProvider() {
  return new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
}

async function getSigner() {
  const provider = await getProvider();
  return new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
}

// Command handlers
async function distributeYield() {
  try {
    console.log('Distributing yield...');
    const signer = await getSigner();
    const contract = new ethers.Contract(
      process.env.RYEGATE_NOTES_ADDRESS,
      RYEGATE_NOTES_ABI,
      signer
    );

    const tx = await contract.distributeYield();
    const receipt = await tx.wait();

    console.log(`✓ Yield distributed`);
    console.log(`  TX Hash: ${tx.hash}`);
    console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function fundYieldPool(period, amount) {
  try {
    console.log(`Funding yield pool for period ${period} with $${amount}...`);
    const signer = await getSigner();
    const provider = await getProvider();
    
    // Approve USDC spend
    const usdc = new ethers.Contract(process.env.USDC_ADDRESS, USDC_ABI, signer);
    const amountWei = dollarToWei(amount);
    
    console.log('Approving USDC spend...');
    const approveTx = await usdc.approve(process.env.RYEGATE_NOTES_ADDRESS, amountWei);
    await approveTx.wait();
    console.log('✓ USDC approved');

    // Fund yield pool
    const notes = new ethers.Contract(
      process.env.RYEGATE_NOTES_ADDRESS,
      RYEGATE_NOTES_ABI,
      signer
    );
    
    console.log('Funding yield pool...');
    const tx = await notes.fundYieldPool(period, amountWei);
    const receipt = await tx.wait();

    console.log(`✓ Yield pool funded`);
    console.log(`  Period: ${period}`);
    console.log(`  Amount: $${amount.toLocaleString()}`);
    console.log(`  TX Hash: ${tx.hash}`);
    console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function pushRevenue(options) {
  try {
    console.log('Pushing revenue data...');
    const signer = await getSigner();
    const oracle = new ethers.Contract(
      process.env.REVENUE_ORACLE_ADDRESS,
      REVENUE_ORACLE_ABI,
      signer
    );

    const grossRevenue = dollarToWei(parseInt(options.gross));
    const operatingCosts = dollarToWei(parseInt(options.opex));
    const adjustedEBITDA = dollarToWei(parseInt(options.ebitda));
    const periodStart = dateToTimestamp(options.start);
    const periodEnd = dateToTimestamp(options.end);

    const tx = await oracle.pushRevenue(
      grossRevenue,
      operatingCosts,
      adjustedEBITDA,
      periodStart,
      periodEnd
    );
    const receipt = await tx.wait();

    console.log(`✓ Revenue pushed`);
    console.log(`  Gross Revenue: $${parseInt(options.gross).toLocaleString()}`);
    console.log(`  Operating Costs: $${parseInt(options.opex).toLocaleString()}`);
    console.log(`  Adjusted EBITDA: $${parseInt(options.ebitda).toLocaleString()}`);
    console.log(`  Period: ${options.start} to ${options.end}`);
    console.log(`  TX Hash: ${tx.hash}`);
    console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function status() {
  try {
    console.log('Fetching contract status...');
    const signer = await getSigner();
    const provider = await getProvider();
    
    const notes = new ethers.Contract(
      process.env.RYEGATE_NOTES_ADDRESS,
      RYEGATE_NOTES_ABI,
      signer
    );
    
    const usdc = new ethers.Contract(process.env.USDC_ADDRESS, USDC_ABI, signer);
    
    const oracle = new ethers.Contract(
      process.env.REVENUE_ORACLE_ADDRESS,
      REVENUE_ORACLE_ABI,
      signer
    );

    const [currentPeriod, totalSupply, usdcBalance] = await Promise.all([
      notes.currentPeriod(),
      notes.totalSupply(),
      usdc.balanceOf(process.env.RYEGATE_NOTES_ADDRESS)
    ]);

    console.log('\n=== Ryegate Status ===');
    console.log(`Current Period: ${currentPeriod.toString()}`);
    console.log(`Total Supply: ${weiToDollar(totalSupply).toLocaleString()}`);
    console.log(`USDC Balance: $${weiToDollar(usdcBalance).toLocaleString()}`);
    
    // Fetch latest oracle report
    try {
      const latestReport = await oracle.getLatestReport();
      console.log('\n=== Latest Oracle Report ===');
      console.log(`Gross Revenue: $${weiToDollar(latestReport.grossRevenue).toLocaleString()}`);
      console.log(`Operating Costs: $${weiToDollar(latestReport.operatingCosts).toLocaleString()}`);
      console.log(`Adjusted EBITDA: $${weiToDollar(latestReport.adjustedEBITDA).toLocaleString()}`);
      console.log(`Period Start: ${new Date(Number(latestReport.periodStart) * 1000).toISOString().split('T')[0]}`);
      console.log(`Period End: ${new Date(Number(latestReport.periodEnd) * 1000).toISOString().split('T')[0]}`);
    } catch (error) {
      console.log('\n=== Latest Oracle Report ===');
      console.log('No report available yet or error fetching:', error.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function whitelist(address, options) {
  try {
    console.log(`Whitelisting ${address}...`);
    const signer = await getSigner();
    
    const kycWhitelist = new ethers.Contract(
      process.env.KYC_WHITELIST_ADDRESS,
      KYC_WHITELIST_ABI,
      signer
    );
    
    // Generate random KYC hash
    const kycHash = ethers.keccak256(ethers.randomBytes(32));
    
    const expiresAt = options.expires ? dateToTimestamp(options.expires) : 0;
    const isAccredited = options.accredited || false;
    
    const tx = await kycWhitelist.whitelistAddress(
      address,
      kycHash,
      isAccredited,
      expiresAt
    );
    const receipt = await tx.wait();

    console.log(`✓ Address whitelisted`);
    console.log(`  Address: ${address}`);
    console.log(`  Accredited: ${isAccredited ? 'Yes' : 'No'}`);
    console.log(`  KYC Hash: ${kycHash}`);
    if (options.expires) {
      console.log(`  Expires: ${options.expires}`);
    }
    console.log(`  TX Hash: ${tx.hash}`);
    console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function mint(partition, address, amount) {
  try {
    console.log(`Minting ${amount} tokens for partition ${partition} to ${address}...`);
    const signer = await getSigner();
    const notes = new ethers.Contract(
      process.env.RYEGATE_NOTES_ADDRESS,
      RYEGATE_NOTES_ABI,
      signer
    );

    const partitionBytes32 = partitionToBytes32(partition);
    const amountWei = dollarToWei(amount);

    const tx = await notes.issueByPartition(partitionBytes32, address, amountWei, '0x');
    const receipt = await tx.wait();

    console.log(`✓ Tokens minted`);
    console.log(`  Partition: ${partition}`);
    console.log(`  To: ${address}`);
    console.log(`  Amount: $${amount.toLocaleString()}`);
    console.log(`  TX Hash: ${tx.hash}`);
    console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Setup CLI
const program = new Command();

program
  .name('ryegate')
  .description('Ryegate Yield Engine Admin CLI')
  .version('1.0.0');

program
  .command('distribute')
  .description('Distribute yield to token holders')
  .action(distributeYield);

program
  .command('fund <period> <amount>')
  .description('Fund yield pool for a period (amount in whole dollars)')
  .action(fundYieldPool);

program
  .command('push-revenue')
  .description('Push revenue data to oracle')
  .option('--gross <n>', 'Gross revenue in dollars', 0)
  .option('--opex <n>', 'Operating costs in dollars', 0)
  .option('--ebitda <n>', 'Adjusted EBITDA in dollars', 0)
  .option('--start <date>', 'Period start date (ISO format)', '2026-01-01')
  .option('--end <date>', 'Period end date (ISO format)', '2026-03-31')
  .action(pushRevenue);

program
  .command('status')
  .description('Display current contract status')
  .action(status);

program
  .command('whitelist <address>')
  .description('Whitelist an address for KYC')
  .option('--accredited', 'Mark as accredited investor')
  .option('--expires <date>', 'Expiry date (ISO format)')
  .action(whitelist);

program
  .command('mint <partition> <address> <amount>')
  .description('Mint tokens (amount in whole dollars)')
  .action(mint);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
