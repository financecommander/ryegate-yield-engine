const { run } = require("hardhat");

/**
 * Standalone contract verification script
 * Use this if verification failed during deployment
 * 
 * Usage: npx hardhat run scripts/verify-contracts.js --network amoy
 */

const CONTRACTS = {
  // Amoy Testnet
  amoy: {
    MockUSDC: {
      address: process.env.TESTNET_USDC_ADDRESS,
      args: []
    },
    KYCWhitelist: {
      address: process.env.TESTNET_KYC_ADDRESS,
      args: []
    },
    RevenueOracle: {
      address: process.env.TESTNET_ORACLE_ADDRESS,
      args: []
    },
    RyegateNotes: {
      address: process.env.TESTNET_NOTES_ADDRESS,
      args: [
        process.env.TESTNET_USDC_ADDRESS,
        process.env.TESTNET_KYC_ADDRESS,
        process.env.TESTNET_ORACLE_ADDRESS
      ]
    }
  },
  
  // Polygon Mainnet
  polygon: {
    KYCWhitelist: {
      address: process.env.MAINNET_KYC_ADDRESS,
      args: []
    },
    RevenueOracle: {
      address: process.env.MAINNET_ORACLE_ADDRESS,
      args: []
    },
    RyegateNotes: {
      address: process.env.MAINNET_NOTES_ADDRESS,
      args: [
        process.env.MAINNET_USDC_ADDRESS || "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC native on Polygon
        process.env.MAINNET_KYC_ADDRESS,
        process.env.MAINNET_ORACLE_ADDRESS
      ]
    }
  }
};

async function verifyContract(name, address, constructorArguments) {
  console.log(`\nVerifying ${name} at ${address}...`);
  
  try {
    await run("verify:verify", {
      address: address,
      constructorArguments: constructorArguments,
    });
    console.log(`✅ ${name} verified successfully`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(`✓ ${name} already verified`);
    } else {
      console.log(`⚠️ ${name} verification failed:`, error.message);
    }
  }
}

async function main() {
  const network = hre.network.name;
  console.log(`🔍 Verifying contracts on ${network}...\n`);
  
  const contracts = CONTRACTS[network];
  
  if (!contracts) {
    console.log(`❌ No contracts configured for network: ${network}`);
    console.log(`   Supported networks: ${Object.keys(CONTRACTS).join(", ")}`);
    process.exit(1);
  }
  
  for (const [name, config] of Object.entries(contracts)) {
    if (!config.address || config.address === "") {
      console.log(`⚠️ Skipping ${name}: Address not set in .env`);
      continue;
    }
    
    await verifyContract(name, config.address, config.args);
    
    // Wait 5 seconds between verifications to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log("\n✅ Verification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
