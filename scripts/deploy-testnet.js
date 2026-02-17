const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy complete Ryegate Yield Engine to testnet (Amoy)
 * - Deploys all contracts
 * - Verifies on Polygonscan
 * - Seeds with initial data
 * - Updates .env with deployed addresses
 */
async function main() {
  console.log("🚀 Deploying Ryegate Yield Engine to Amoy testnet...\n");
  
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log("Deploying with account:", deployerAddress);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployerAddress)), "MATIC\n");
  
  // Deploy MockUSDC
  console.log("1️⃣ Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ MockUSDC deployed to:", usdcAddress);
  
  // Deploy KYCWhitelist
  console.log("\n2️⃣ Deploying KYCWhitelist...");
  const KYCWhitelist = await ethers.getContractFactory("KYCWhitelist");
  const kycWhitelist = await KYCWhitelist.deploy();
  await kycWhitelist.waitForDeployment();
  const kycAddress = await kycWhitelist.getAddress();
  console.log("✅ KYCWhitelist deployed to:", kycAddress);
  
  // Deploy RevenueOracle
  console.log("\n3️⃣ Deploying RevenueOracle...");
  const RevenueOracle = await ethers.getContractFactory("RevenueOracle");
  const revenueOracle = await RevenueOracle.deploy();
  await revenueOracle.waitForDeployment();
  const oracleAddress = await revenueOracle.getAddress();
  console.log("✅ RevenueOracle deployed to:", oracleAddress);
  
  // Deploy RyegateNotes
  console.log("\n4️⃣ Deploying RyegateNotes...");
  const RyegateNotes = await ethers.getContractFactory("RyegateNotes");
  const ryegateNotes = await RyegateNotes.deploy(
    usdcAddress,
    kycAddress,
    oracleAddress
  );
  await ryegateNotes.waitForDeployment();
  const notesAddress = await ryegateNotes.getAddress();
  console.log("✅ RyegateNotes deployed to:", notesAddress);
  
  // Wait for block confirmations before verification
  console.log("\n⏳ Waiting for 6 block confirmations before verification...");
  await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
  
  // Verify contracts on Polygonscan
  console.log("\n5️⃣ Verifying contracts on Polygonscan...");
  
  try {
    await hre.run("verify:verify", {
      address: usdcAddress,
      constructorArguments: [],
    });
    console.log("✅ MockUSDC verified");
  } catch (error) {
    console.log("⚠️ MockUSDC verification failed:", error.message);
  }
  
  try {
    await hre.run("verify:verify", {
      address: kycAddress,
      constructorArguments: [],
    });
    console.log("✅ KYCWhitelist verified");
  } catch (error) {
    console.log("⚠️ KYCWhitelist verification failed:", error.message);
  }
  
  try {
    await hre.run("verify:verify", {
      address: oracleAddress,
      constructorArguments: [],
    });
    console.log("✅ RevenueOracle verified");
  } catch (error) {
    console.log("⚠️ RevenueOracle verification failed:", error.message);
  }
  
  try {
    await hre.run("verify:verify", {
      address: notesAddress,
      constructorArguments: [usdcAddress, kycAddress, oracleAddress],
    });
    console.log("✅ RyegateNotes verified");
  } catch (error) {
    console.log("⚠️ RyegateNotes verification failed:", error.message);
  }
  
  // Update .env file with deployed addresses
  console.log("\n6️⃣ Updating .env file with deployed addresses...");
  const envPath = path.join(__dirname, "../.env");
  let envContent = "";
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }
  
  const updateEnvVar = (key, value) => {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  };
  
  updateEnvVar("TESTNET_USDC_ADDRESS", usdcAddress);
  updateEnvVar("TESTNET_KYC_ADDRESS", kycAddress);
  updateEnvVar("TESTNET_ORACLE_ADDRESS", oracleAddress);
  updateEnvVar("TESTNET_NOTES_ADDRESS", notesAddress);
  
  fs.writeFileSync(envPath, envContent.trim() + "\n");
  console.log("✅ .env file updated");
  
  // Save deployment info
  const deploymentInfo = {
    network: "amoy",
    deployer: deployerAddress,
    timestamp: new Date().toISOString(),
    contracts: {
      MockUSDC: usdcAddress,
      KYCWhitelist: kycAddress,
      RevenueOracle: oracleAddress,
      RyegateNotes: notesAddress
    }
  };
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const deploymentFile = path.join(deploymentsDir, `amoy-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment info saved to:", deploymentFile);
  
  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("  MockUSDC:       ", usdcAddress);
  console.log("  KYCWhitelist:   ", kycAddress);
  console.log("  RevenueOracle:  ", oracleAddress);
  console.log("  RyegateNotes:   ", notesAddress);
  console.log("\nNext Steps:");
  console.log("  1. Run seed script: npx hardhat run scripts/seed-testnet.js --network amoy");
  console.log("  2. Update frontend .env with contract addresses");
  console.log("  3. Update oracle/.env with contract addresses");
  console.log("  4. Update admin/.env with contract addresses");
  console.log("  5. Test via frontend at https://testnet.ryegate.io");
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
