const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

/**
 * Deploy Ryegate Yield Engine to mainnet (Polygon)
 * - Pre-deployment safety checks
 * - Deploys all contracts
 * - Transfers ownership to multisig
 * - Verification on Polygonscan
 * - Security checklist
 */

const SECURITY_CHECKLIST = [
  "✓ All contracts audited by reputable firm",
  "✓ Slither analysis passed with no high/critical issues",
  "✓ Test coverage > 95%",
  "✓ E2E tests passing on testnet",
  "✓ Oracle backend tested and secured",
  "✓ Multisig wallet configured and tested",
  "✓ KYC/AML provider integrated",
  "✓ Legal opinion obtained for token structure",
  "✓ Disclosure documents finalized and uploaded to IPFS",
  "✓ Emergency pause procedure documented"
];

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, answer => {
    rl.close();
    resolve(answer);
  }));
}

async function main() {
  console.log("🚨 MAINNET DEPLOYMENT - POLYGON");
  console.log("=".repeat(60));
  console.log("⚠️  This will deploy to PRODUCTION mainnet!");
  console.log("⚠️  Real funds will be at risk!");
  console.log("=".repeat(60) + "\n");
  
  // Security checklist confirmation
  console.log("📋 Security Checklist:\n");
  SECURITY_CHECKLIST.forEach(item => console.log(`  ${item}`));
  console.log();
  
  const confirm1 = await askQuestion("Have you completed ALL items in the security checklist? (yes/no): ");
  if (confirm1.toLowerCase() !== "yes") {
    console.log("❌ Deployment aborted. Complete security checklist first.");
    process.exit(1);
  }
  
  // Load multisig address
  const MULTISIG_ADDRESS = process.env.MAINNET_MULTISIG_ADDRESS;
  if (!MULTISIG_ADDRESS || MULTISIG_ADDRESS === "") {
    console.log("❌ MAINNET_MULTISIG_ADDRESS not set in .env");
    process.exit(1);
  }
  
  console.log("\nMultisig address:", MULTISIG_ADDRESS);
  const confirm2 = await askQuestion("Is this the correct multisig address? (yes/no): ");
  if (confirm2.toLowerCase() !== "yes") {
    console.log("❌ Deployment aborted. Update MAINNET_MULTISIG_ADDRESS in .env");
    process.exit(1);
  }
  
  // Final confirmation
  console.log("\n⚠️  FINAL WARNING: This deploys to PRODUCTION mainnet!");
  const confirm3 = await askQuestion("Type 'DEPLOY TO MAINNET' to proceed: ");
  if (confirm3 !== "DEPLOY TO MAINNET") {
    console.log("❌ Deployment aborted.");
    process.exit(1);
  }
  
  // Start deployment
  console.log("\n" + "=".repeat(60));
  console.log("🚀 Starting mainnet deployment...");
  console.log("=".repeat(60) + "\n");
  
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log("Deploying with account:", deployerAddress);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployerAddress)), "MATIC\n");
  
  // Check deployer has sufficient MATIC for gas
  const balance = await ethers.provider.getBalance(deployerAddress);
  const minBalance = ethers.parseEther("10"); // Need at least 10 MATIC for gas
  
  if (balance < minBalance) {
    console.log("❌ Insufficient MATIC balance for deployment");
    console.log("   Current:", ethers.formatEther(balance), "MATIC");
    console.log("   Required: At least 10 MATIC");
    process.exit(1);
  }
  
  // IMPORTANT: Use real USDC address on Polygon mainnet
  // const USDC_MAINNET = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC on Polygon (bridged)
  const USDC_MAINNET = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"; // USDC (native) on Polygon
  
  console.log("Using USDC address:", USDC_MAINNET);
  const confirmUSDC = await askQuestion("Is this the correct USDC address for Polygon mainnet? (yes/no): ");
  if (confirmUSDC.toLowerCase() !== "yes") {
    console.log("❌ Deployment aborted. Verify USDC address.");
    process.exit(1);
  }
  
  // Deploy KYCWhitelist
  console.log("\n1️⃣ Deploying KYCWhitelist...");
  const KYCWhitelist = await ethers.getContractFactory("KYCWhitelist");
  const kycWhitelist = await KYCWhitelist.deploy();
  await kycWhitelist.waitForDeployment();
  const kycAddress = await kycWhitelist.getAddress();
  console.log("✅ KYCWhitelist deployed to:", kycAddress);
  
  // Deploy RevenueOracle
  console.log("\n2️⃣ Deploying RevenueOracle...");
  const RevenueOracle = await ethers.getContractFactory("RevenueOracle");
  const revenueOracle = await RevenueOracle.deploy();
  await revenueOracle.waitForDeployment();
  const oracleAddress = await revenueOracle.getAddress();
  console.log("✅ RevenueOracle deployed to:", oracleAddress);
  
  // Deploy RyegateNotes
  console.log("\n3️⃣ Deploying RyegateNotes...");
  const RyegateNotes = await ethers.getContractFactory("RyegateNotes");
  const ryegateNotes = await RyegateNotes.deploy(
    USDC_MAINNET,
    kycAddress,
    oracleAddress
  );
  await ryegateNotes.waitForDeployment();
  const notesAddress = await ryegateNotes.getAddress();
  console.log("✅ RyegateNotes deployed to:", notesAddress);
  
  // Transfer ownership to multisig
  console.log("\n4️⃣ Transferring ownership to multisig...");
  
  const DEFAULT_ADMIN_ROLE = await kycWhitelist.DEFAULT_ADMIN_ROLE();
  
  // Grant admin role to multisig
  await kycWhitelist.grantRole(DEFAULT_ADMIN_ROLE, MULTISIG_ADDRESS);
  await revenueOracle.grantRole(DEFAULT_ADMIN_ROLE, MULTISIG_ADDRESS);
  await ryegateNotes.grantRole(DEFAULT_ADMIN_ROLE, MULTISIG_ADDRESS);
  
  console.log("✅ Admin role granted to multisig:", MULTISIG_ADDRESS);
  
  // Revoke deployer admin role (after 24 hour timelock recommended)
  console.log("\n⚠️  IMPORTANT: Deployer still has admin role.");
  console.log("   After 24 hours and verification, revoke deployer role via multisig:");
  console.log(`   - KYCWhitelist.revokeRole(DEFAULT_ADMIN_ROLE, ${deployerAddress})`);
  console.log(`   - RevenueOracle.revokeRole(DEFAULT_ADMIN_ROLE, ${deployerAddress})`);
  console.log(`   - RyegateNotes.revokeRole(DEFAULT_ADMIN_ROLE, ${deployerAddress})`);
  
  // Wait for confirmations before verification
  console.log("\n⏳ Waiting for 10 block confirmations before verification...");
  await new Promise(resolve => setTimeout(resolve, 120000)); // Wait 2 minutes
  
  // Verify contracts
  console.log("\n5️⃣ Verifying contracts on Polygonscan...");
  
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
      constructorArguments: [USDC_MAINNET, kycAddress, oracleAddress],
    });
    console.log("✅ RyegateNotes verified");
  } catch (error) {
    console.log("⚠️ RyegateNotes verification failed:", error.message);
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: "polygon",
    deployer: deployerAddress,
    multisig: MULTISIG_ADDRESS,
    timestamp: new Date().toISOString(),
    contracts: {
      USDC: USDC_MAINNET,
      KYCWhitelist: kycAddress,
      RevenueOracle: oracleAddress,
      RyegateNotes: notesAddress
    }
  };
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const deploymentFile = path.join(deploymentsDir, `polygon-mainnet-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n✅ Deployment info saved to:", deploymentFile);
  
  // Print final summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 MAINNET DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("  USDC:           ", USDC_MAINNET);
  console.log("  KYCWhitelist:   ", kycAddress);
  console.log("  RevenueOracle:  ", oracleAddress);
  console.log("  RyegateNotes:   ", notesAddress);
  console.log("\nMultisig:         ", MULTISIG_ADDRESS);
  console.log("\n⚠️  POST-DEPLOYMENT CHECKLIST:");
  console.log("  [ ] Verify all contracts on Polygonscan");
  console.log("  [ ] Test contract interactions via multisig");
  console.log("  [ ] Configure oracle signer in RevenueOracle");
  console.log("  [ ] Upload disclosure documents to IPFS");
  console.log("  [ ] Add documents via setDocument() on RyegateNotes");
  console.log("  [ ] Test minting small amount to test wallet");
  console.log("  [ ] Test yield distribution with small amount");
  console.log("  [ ] Update frontend production URLs");
  console.log("  [ ] Update oracle GCF with mainnet addresses");
  console.log("  [ ] After 24hr, revoke deployer admin roles via multisig");
  console.log("  [ ] Announce launch to investors");
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
