const { ethers } = require("hardhat");

/**
 * Seed testnet deployment with realistic demo data
 * - Create test investors
 * - Mint tokens across partitions
 * - Fund yield pool
 * - Push demo revenue reports
 * - Distribute initial yield
 */

async function main() {
  console.log("🌱 Seeding Amoy testnet with demo data...\n");
  
  const [deployer] = await ethers.getSigners();
  
  // Load deployed contract addresses from env
  const USDC_ADDRESS = process.env.TESTNET_USDC_ADDRESS;
  const KYC_ADDRESS = process.env.TESTNET_KYC_ADDRESS;
  const ORACLE_ADDRESS = process.env.TESTNET_ORACLE_ADDRESS;
  const NOTES_ADDRESS = process.env.TESTNET_NOTES_ADDRESS;
  
  if (!USDC_ADDRESS || !KYC_ADDRESS || !ORACLE_ADDRESS || !NOTES_ADDRESS) {
    console.log("❌ Missing contract addresses in .env");
    console.log("   Run deploy-testnet.js first");
    process.exit(1);
  }
  
  // Connect to deployed contracts
  const usdc = await ethers.getContractAt("MockUSDC", USDC_ADDRESS);
  const kycWhitelist = await ethers.getContractAt("KYCWhitelist", KYC_ADDRESS);
  const revenueOracle = await ethers.getContractAt("RevenueOracle", ORACLE_ADDRESS);
  const ryegateNotes = await ethers.getContractAt("RyegateNotes", NOTES_ADDRESS);
  
  console.log("Connected to contracts:");
  console.log("  MockUSDC:      ", USDC_ADDRESS);
  console.log("  KYCWhitelist:  ", KYC_ADDRESS);
  console.log("  RevenueOracle: ", ORACLE_ADDRESS);
  console.log("  RyegateNotes:  ", NOTES_ADDRESS);
  console.log();
  
  // Demo investor wallets (replace with real testnet addresses)
  const DEMO_INVESTORS = [
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Investor 1 (accredited)
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Investor 2 (accredited)
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Investor 3 (non-accredited)
  ];
  
  const REG_D = ethers.keccak256(ethers.toUtf8Bytes("REG_D"));
  const REG_A_PLUS = ethers.keccak256(ethers.toUtf8Bytes("REG_A_PLUS"));
  
  // Step 1: Whitelist demo investors
  console.log("1️⃣ Whitelisting demo investors...");
  await kycWhitelist.addToWhitelist(DEMO_INVESTORS[0], true); // accredited
  await kycWhitelist.addToWhitelist(DEMO_INVESTORS[1], true); // accredited
  await kycWhitelist.addToWhitelist(DEMO_INVESTORS[2], false); // non-accredited
  console.log("✅ 3 investors whitelisted");
  
  // Step 2: Mint REG_D tokens to accredited investors
  console.log("\n2️⃣ Minting REG_D tokens...");
  await ryegateNotes.issueByPartition(
    REG_D,
    DEMO_INVESTORS[0],
    ethers.parseUnits("100000", 18), // 100k tokens
    "0x"
  );
  await ryegateNotes.issueByPartition(
    REG_D,
    DEMO_INVESTORS[1],
    ethers.parseUnits("75000", 18), // 75k tokens
    "0x"
  );
  console.log("✅ 175k REG_D tokens minted");
  
  // Step 3: Mint REG_A_PLUS tokens to non-accredited investor
  console.log("\n3️⃣ Minting REG_A_PLUS tokens...");
  await ryegateNotes.issueByPartition(
    REG_A_PLUS,
    DEMO_INVESTORS[2],
    ethers.parseUnits("50000", 18), // 50k tokens
    "0x"
  );
  console.log("✅ 50k REG_A_PLUS tokens minted");
  
  // Step 4: Mint and fund yield pool with USDC
  console.log("\n4️⃣ Funding yield pool with USDC...");
  const fundAmount = ethers.parseUnits("200000", 6); // 200k USDC
  await usdc.mint(deployer.address, fundAmount);
  await usdc.approve(NOTES_ADDRESS, fundAmount);
  await ryegateNotes.fundYieldPool(fundAmount);
  console.log("✅ 200k USDC added to yield pool");
  
  // Step 5: Grant oracle role to deployer for demo
  console.log("\n5️⃣ Configuring oracle...");
  const ORACLE_ROLE = await revenueOracle.ORACLE_ROLE();
  await revenueOracle.grantRole(ORACLE_ROLE, deployer.address);
  console.log("✅ Oracle role granted");
  
  // Step 6: Push Q1 2024 revenue report
  console.log("\n6️⃣ Pushing Q1 2024 revenue report...");
  await revenueOracle.pushRevenueReport(
    20241, // Q1 2024
    ethers.parseUnits("3500000", 6), // $3.5M revenue
    ethers.parseUnits("1200000", 6), // $1.2M EBITDA (34% margin)
    ethers.parseUnits("75000", 6),   // Distribute $75k (25% of EBITDA)
    "QmYwAPJzv5CZsnA9KdJFz6V6Kj8V6YrE7F2H3J2Kj8V6Yr" // Demo IPFS hash
  );
  console.log("✅ Q1 2024 report pushed");
  
  // Step 7: Distribute yield for Q1
  console.log("\n7️⃣ Distributing Q1 yield...");
  await ryegateNotes.distributeYield(20241);
  console.log("✅ Q1 yield distributed");
  
  // Step 8: Check pending yields
  console.log("\n8️⃣ Checking pending yields...");
  const pending1 = await ryegateNotes.pendingYield(DEMO_INVESTORS[0]);
  const pending2 = await ryegateNotes.pendingYield(DEMO_INVESTORS[1]);
  const pending3 = await ryegateNotes.pendingYield(DEMO_INVESTORS[2]);
  
  console.log(`  Investor 1: $${ethers.formatUnits(pending1, 6)} USDC`);
  console.log(`  Investor 2: $${ethers.formatUnits(pending2, 6)} USDC`);
  console.log(`  Investor 3: $${ethers.formatUnits(pending3, 6)} USDC`);
  
  // Step 9: Push Q2 2024 revenue report
  console.log("\n9️⃣ Pushing Q2 2024 revenue report...");
  await revenueOracle.pushRevenueReport(
    20242, // Q2 2024
    ethers.parseUnits("4200000", 6), // $4.2M revenue (20% growth)
    ethers.parseUnits("1600000", 6), // $1.6M EBITDA (38% margin)
    ethers.parseUnits("100000", 6),  // Distribute $100k
    "QmTestQ2Report2024HashForDemoSeedData"
  );
  console.log("✅ Q2 2024 report pushed");
  
  // Step 10: Add demo documents (ERC-1643)
  console.log("\n🔟 Adding demo disclosure documents...");
  
  const docName1 = ethers.encodeBytes32String("REG_D_PPM");
  const docName2 = ethers.encodeBytes32String("FINANCIAL_2023");
  const docName3 = ethers.encodeBytes32String("SUBSCRIPTION");
  
  await ryegateNotes.setDocument(
    docName1,
    "QmPrivatePlacementMemorandumRegD2024",
    ethers.keccak256(ethers.toUtf8Bytes("ppm-content-hash"))
  );
  
  await ryegateNotes.setDocument(
    docName2,
    "QmAuditedFinancialStatements2023Annual",
    ethers.keccak256(ethers.toUtf8Bytes("financials-2023"))
  );
  
  await ryegateNotes.setDocument(
    docName3,
    "QmSubscriptionAgreementTemplateV1",
    ethers.keccak256(ethers.toUtf8Bytes("subscription-template"))
  );
  
  console.log("✅ 3 demo documents added");
  
  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 TESTNET SEEDING COMPLETE!");
  console.log("=".repeat(60));
  console.log("\nDemo Data Summary:");
  console.log("  Total Tokens:     225,000 (175k REG_D + 50k REG_A_PLUS)");
  console.log("  Yield Pool:       $200,000 USDC");
  console.log("  Revenue Reports:  Q1 & Q2 2024");
  console.log("  Distributed:      $75,000 (Q1)");
  console.log("  Pending:          $100,000 (Q2)");
  console.log("  Documents:        3 disclosure docs");
  console.log("\nDemo Investor Addresses:");
  console.log("  Investor 1 (accredited):     ", DEMO_INVESTORS[0]);
  console.log("  Investor 2 (accredited):     ", DEMO_INVESTORS[1]);
  console.log("  Investor 3 (non-accredited): ", DEMO_INVESTORS[2]);
  console.log("\nNext Steps:");
  console.log("  - Open frontend and connect with demo wallets");
  console.log("  - Test claiming yield for Q1");
  console.log("  - Test subscribing for new tokens");
  console.log("  - Test document access");
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
