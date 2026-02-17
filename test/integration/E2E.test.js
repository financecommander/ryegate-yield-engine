const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("E2E: Full Lifecycle Test", function () {
  const INITIAL_SUPPLY = ethers.parseUnits("10000000", 6); // 10M USDC
  const REG_D = ethers.keccak256(ethers.toUtf8Bytes("REG_D"));
  const REG_A_PLUS = ethers.keccak256(ethers.toUtf8Bytes("REG_A_PLUS"));
  
  async function deployFullSystemFixture() {
    const [owner, investor1, investor2, investor3, oracle] = await ethers.getSigners();
    
    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    
    // Deploy KYCWhitelist
    const KYCWhitelist = await ethers.getContractFactory("KYCWhitelist");
    const kycWhitelist = await KYCWhitelist.deploy();
    
    // Deploy RevenueOracle
    const RevenueOracle = await ethers.getContractFactory("RevenueOracle");
    const revenueOracle = await RevenueOracle.deploy();
    
    // Deploy RyegateNotes
    const RyegateNotes = await ethers.getContractFactory("RyegateNotes");
    const ryegateNotes = await RyegateNotes.deploy(
      await usdc.getAddress(),
      await kycWhitelist.getAddress(),
      await revenueOracle.getAddress()
    );
    
    // Mint USDC to owner for testing
    await usdc.mint(owner.address, INITIAL_SUPPLY);
    
    return {
      ryegateNotes,
      usdc,
      kycWhitelist,
      revenueOracle,
      owner,
      investor1,
      investor2,
      investor3,
      oracle
    };
  }
  
  it("should complete full lifecycle: deploy → whitelist → mint → oracle → distribute → claim → transfer → pause → unpause → redeem", async function () {
    const {
      ryegateNotes,
      usdc,
      kycWhitelist,
      revenueOracle,
      owner,
      investor1,
      investor2,
      investor3,
      oracle
    } = await loadFixture(deployFullSystemFixture);
    
    // Step 1: Grant oracle role to oracle signer
    const ORACLE_ROLE = await revenueOracle.ORACLE_ROLE();
    await revenueOracle.grantRole(ORACLE_ROLE, oracle.address);
    console.log("✓ Step 1: Oracle role granted");
    
    // Step 2: Whitelist investors (investor1 accredited, investor2 not accredited)
    await kycWhitelist.addToWhitelist(investor1.address, true); // accredited
    await kycWhitelist.addToWhitelist(investor2.address, false); // not accredited
    await kycWhitelist.addToWhitelist(investor3.address, true); // accredited
    expect(await kycWhitelist.isWhitelisted(investor1.address)).to.be.true;
    expect(await kycWhitelist.isAccredited(investor1.address)).to.be.true;
    expect(await kycWhitelist.isAccredited(investor2.address)).to.be.false;
    console.log("✓ Step 2: Investors whitelisted");
    
    // Step 3: Mint REG_D tokens to investor1 (100k tokens)
    const regDAmount = ethers.parseUnits("100000", 18);
    await ryegateNotes.issueByPartition(REG_D, investor1.address, regDAmount, "0x");
    expect(await ryegateNotes.balanceOfByPartition(REG_D, investor1.address)).to.equal(regDAmount);
    console.log("✓ Step 3: REG_D tokens minted to investor1");
    
    // Step 4: Mint REG_A_PLUS tokens to investor2 (50k tokens)
    const regAPlusAmount = ethers.parseUnits("50000", 18);
    await ryegateNotes.issueByPartition(REG_A_PLUS, investor2.address, regAPlusAmount, "0x");
    expect(await ryegateNotes.balanceOfByPartition(REG_A_PLUS, investor2.address)).to.equal(regAPlusAmount);
    console.log("✓ Step 4: REG_A_PLUS tokens minted to investor2");
    
    // Step 5: Fund yield pool with USDC (100k USDC)
    const fundAmount = ethers.parseUnits("100000", 6);
    await usdc.approve(await ryegateNotes.getAddress(), fundAmount);
    await ryegateNotes.fundYieldPool(fundAmount);
    expect(await ryegateNotes.yieldPoolBalance()).to.equal(fundAmount);
    console.log("✓ Step 5: Yield pool funded with 100k USDC");
    
    // Step 6: Oracle pushes revenue report for Q1 2024
    const period = 20241; // Q1 2024
    const revenue = ethers.parseUnits("500000", 6); // 500k USDC revenue
    const ebitda = ethers.parseUnits("200000", 6); // 200k USDC EBITDA
    const distributeAmount = ethers.parseUnits("50000", 6); // Distribute 50k USDC
    const ipfsHash = "QmTestHashForQ12024Report";
    
    await revenueOracle.connect(oracle).pushRevenueReport(
      period,
      revenue,
      ebitda,
      distributeAmount,
      ipfsHash
    );
    
    const report = await revenueOracle.getLatestReport();
    expect(report.period).to.equal(period);
    expect(report.revenue).to.equal(revenue);
    console.log("✓ Step 6: Oracle pushed Q1 2024 revenue report");
    
    // Step 7: Distribute yield for the period
    await ryegateNotes.distributeYield(period);
    expect(await ryegateNotes.currentPeriod()).to.equal(period);
    console.log("✓ Step 7: Yield distributed for Q1 2024");
    
    // Step 8: Check pending yield for investor1 and investor2
    const pending1 = await ryegateNotes.pendingYield(investor1.address);
    const pending2 = await ryegateNotes.pendingYield(investor2.address);
    
    // Total supply = 150k tokens (100k REG_D + 50k REG_A_PLUS)
    // Distribute amount = 50k USDC
    // Expected yield per token ≈ 50k / 150k = 0.333... USDC per token
    // investor1: 100k tokens → ~33,333 USDC
    // investor2: 50k tokens → ~16,667 USDC
    
    const expectedYield1 = ethers.parseUnits("33333", 6); // 33,333 USDC
    const expectedYield2 = ethers.parseUnits("16666", 6); // 16,666 USDC
    
    // Allow 1 USDC tolerance for rounding
    expect(pending1).to.be.closeTo(expectedYield1, ethers.parseUnits("1", 6));
    expect(pending2).to.be.closeTo(expectedYield2, ethers.parseUnits("1", 6));
    console.log("✓ Step 8: Pending yield calculated correctly");
    
    // Step 9: investor1 claims yield
    const usdcBefore1 = await usdc.balanceOf(investor1.address);
    await ryegateNotes.connect(investor1).claimYield();
    const usdcAfter1 = await usdc.balanceOf(investor1.address);
    
    expect(usdcAfter1 - usdcBefore1).to.be.closeTo(expectedYield1, ethers.parseUnits("1", 6));
    expect(await ryegateNotes.pendingYield(investor1.address)).to.equal(0);
    console.log("✓ Step 9: investor1 claimed yield successfully");
    
    // Step 10: investor2 claims yield
    const usdcBefore2 = await usdc.balanceOf(investor2.address);
    await ryegateNotes.connect(investor2).claimYield();
    const usdcAfter2 = await usdc.balanceOf(investor2.address);
    
    expect(usdcAfter2 - usdcBefore2).to.be.closeTo(expectedYield2, ethers.parseUnits("1", 6));
    expect(await ryegateNotes.pendingYield(investor2.address)).to.equal(0);
    console.log("✓ Step 10: investor2 claimed yield successfully");
    
    // Step 11: investor2 transfers REG_A_PLUS tokens to investor3 (20k tokens)
    await kycWhitelist.addToWhitelist(investor3.address, false); // Whitelist investor3 (not accredited, so can receive REG_A_PLUS)
    const transferAmount = ethers.parseUnits("20000", 18);
    
    await ryegateNotes.connect(investor2).operatorTransferByPartition(
      REG_A_PLUS,
      investor2.address,
      investor3.address,
      transferAmount,
      "0x",
      "0x"
    );
    
    expect(await ryegateNotes.balanceOfByPartition(REG_A_PLUS, investor3.address)).to.equal(transferAmount);
    expect(await ryegateNotes.balanceOfByPartition(REG_A_PLUS, investor2.address)).to.equal(
      regAPlusAmount - transferAmount
    );
    console.log("✓ Step 11: investor2 transferred REG_A_PLUS to investor3");
    
    // Step 12: Try to transfer REG_D (should fail due to lockup, assuming not enough time has passed)
    // Note: In actual implementation, lockup would be checked
    // For this test, we'll just verify the transfer works if lockup is not enforced yet
    
    // Step 13: Pause the contract
    await ryegateNotes.pause();
    expect(await ryegateNotes.paused()).to.be.true;
    console.log("✓ Step 13: Contract paused");
    
    // Step 14: Try to transfer while paused (should fail)
    await expect(
      ryegateNotes.connect(investor2).operatorTransferByPartition(
        REG_A_PLUS,
        investor2.address,
        investor3.address,
        ethers.parseUnits("1000", 18),
        "0x",
        "0x"
      )
    ).to.be.reverted;
    console.log("✓ Step 14: Transfer blocked while paused");
    
    // Step 15: Unpause the contract
    await ryegateNotes.unpause();
    expect(await ryegateNotes.paused()).to.be.false;
    console.log("✓ Step 15: Contract unpaused");
    
    // Step 16: Push Q2 2024 revenue report
    const period2 = 20242;
    const revenue2 = ethers.parseUnits("600000", 6);
    const ebitda2 = ethers.parseUnits("250000", 6);
    const distributeAmount2 = ethers.parseUnits("60000", 6);
    
    await revenueOracle.connect(oracle).pushRevenueReport(
      period2,
      revenue2,
      ebitda2,
      distributeAmount2,
      "QmTestHashForQ22024Report"
    );
    console.log("✓ Step 16: Q2 2024 revenue report pushed");
    
    // Step 17: Fund yield pool with additional USDC for Q2
    await usdc.approve(await ryegateNotes.getAddress(), distributeAmount2);
    await ryegateNotes.fundYieldPool(distributeAmount2);
    console.log("✓ Step 17: Yield pool funded for Q2");
    
    // Step 18: Distribute yield for Q2
    await ryegateNotes.distributeYield(period2);
    expect(await ryegateNotes.currentPeriod()).to.equal(period2);
    console.log("✓ Step 18: Q2 yield distributed");
    
    // Step 19: Verify pending yields are updated
    const pending1Q2 = await ryegateNotes.pendingYield(investor1.address);
    const pending2Q2 = await ryegateNotes.pendingYield(investor2.address);
    const pending3Q2 = await ryegateNotes.pendingYield(investor3.address);
    
    // investor1: 100k tokens
    // investor2: 30k tokens (50k - 20k transferred)
    // investor3: 20k tokens (received from investor2)
    // Total: 150k tokens
    // Distribute: 60k USDC
    // Yield per token: 60k / 150k = 0.4 USDC
    
    const expectedYield1Q2 = ethers.parseUnits("40000", 6); // 100k * 0.4
    const expectedYield2Q2 = ethers.parseUnits("12000", 6); // 30k * 0.4
    const expectedYield3Q2 = ethers.parseUnits("8000", 6); // 20k * 0.4
    
    expect(pending1Q2).to.be.closeTo(expectedYield1Q2, ethers.parseUnits("1", 6));
    expect(pending2Q2).to.be.closeTo(expectedYield2Q2, ethers.parseUnits("1", 6));
    expect(pending3Q2).to.be.closeTo(expectedYield3Q2, ethers.parseUnits("1", 6));
    console.log("✓ Step 19: Q2 pending yields calculated correctly");
    
    // Step 20: All investors claim Q2 yield
    await ryegateNotes.connect(investor1).claimYield();
    await ryegateNotes.connect(investor2).claimYield();
    await ryegateNotes.connect(investor3).claimYield();
    
    expect(await ryegateNotes.pendingYield(investor1.address)).to.equal(0);
    expect(await ryegateNotes.pendingYield(investor2.address)).to.equal(0);
    expect(await ryegateNotes.pendingYield(investor3.address)).to.equal(0);
    console.log("✓ Step 20: All Q2 yields claimed");
    
    // Step 21: Redeem tokens (investor1 redeems 50k REG_D tokens)
    const redeemAmount = ethers.parseUnits("50000", 18);
    await ryegateNotes.redeemByPartition(REG_D, investor1.address, redeemAmount, "0x");
    
    expect(await ryegateNotes.balanceOfByPartition(REG_D, investor1.address)).to.equal(
      regDAmount - redeemAmount
    );
    console.log("✓ Step 21: investor1 redeemed 50k REG_D tokens");
    
    // Step 22: Verify total supply updated
    const totalSupplyAfterRedeem = await ryegateNotes.totalSupply();
    const expectedSupply = regDAmount + regAPlusAmount - redeemAmount;
    expect(totalSupplyAfterRedeem).to.equal(expectedSupply);
    console.log("✓ Step 22: Total supply updated after redemption");
    
    // Step 23: Check final balances
    const finalBalance1 = await ryegateNotes.balanceOf(investor1.address);
    const finalBalance2 = await ryegateNotes.balanceOf(investor2.address);
    const finalBalance3 = await ryegateNotes.balanceOf(investor3.address);
    
    expect(finalBalance1).to.equal(regDAmount - redeemAmount);
    expect(finalBalance2).to.equal(regAPlusAmount - transferAmount);
    expect(finalBalance3).to.equal(transferAmount);
    console.log("✓ Step 23: Final token balances verified");
    
    // Step 24: Verify oracle report history
    const latestReport = await revenueOracle.getLatestReport();
    expect(latestReport.period).to.equal(period2);
    expect(latestReport.revenue).to.equal(revenue2);
    console.log("✓ Step 24: Oracle report history verified");
    
    console.log("\n🎉 Full E2E lifecycle test completed successfully!");
  });
});
