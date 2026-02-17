const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Oracle Integration Tests", function () {
  async function deployOracleFixture() {
    const [owner, oracle1, oracle2, unauthorized] = await ethers.getSigners();
    
    const RevenueOracle = await ethers.getContractFactory("RevenueOracle");
    const revenueOracle = await RevenueOracle.deploy();
    
    const ORACLE_ROLE = await revenueOracle.ORACLE_ROLE();
    await revenueOracle.grantRole(ORACLE_ROLE, oracle1.address);
    
    return { revenueOracle, owner, oracle1, oracle2, unauthorized, ORACLE_ROLE };
  }
  
  it("should push sequential revenue reports correctly", async function () {
    const { revenueOracle, oracle1 } = await loadFixture(deployOracleFixture);
    
    // Push Q1 2024 report
    const period1 = 20241;
    const revenue1 = ethers.parseUnits("500000", 6);
    const ebitda1 = ethers.parseUnits("200000", 6);
    const distribute1 = ethers.parseUnits("50000", 6);
    
    await revenueOracle.connect(oracle1).pushRevenueReport(
      period1,
      revenue1,
      ebitda1,
      distribute1,
      "QmQ1Report"
    );
    
    let report = await revenueOracle.getLatestReport();
    expect(report.period).to.equal(period1);
    expect(report.revenue).to.equal(revenue1);
    expect(report.ebitda).to.equal(ebitda1);
    
    // Push Q2 2024 report
    const period2 = 20242;
    const revenue2 = ethers.parseUnits("600000", 6);
    const ebitda2 = ethers.parseUnits("250000", 6);
    const distribute2 = ethers.parseUnits("60000", 6);
    
    await revenueOracle.connect(oracle1).pushRevenueReport(
      period2,
      revenue2,
      ebitda2,
      distribute2,
      "QmQ2Report"
    );
    
    report = await revenueOracle.getLatestReport();
    expect(report.period).to.equal(period2);
    expect(report.revenue).to.equal(revenue2);
    
    // Verify we can retrieve both reports
    const report1 = await revenueOracle.getReportByPeriod(period1);
    const report2 = await revenueOracle.getReportByPeriod(period2);
    
    expect(report1.revenue).to.equal(revenue1);
    expect(report2.revenue).to.equal(revenue2);
  });
  
  it("should reject duplicate period reports", async function () {
    const { revenueOracle, oracle1 } = await loadFixture(deployOracleFixture);
    
    const period = 20241;
    const revenue = ethers.parseUnits("500000", 6);
    const ebitda = ethers.parseUnits("200000", 6);
    const distribute = ethers.parseUnits("50000", 6);
    
    // Push first report
    await revenueOracle.connect(oracle1).pushRevenueReport(
      period,
      revenue,
      ebitda,
      distribute,
      "QmFirstReport"
    );
    
    // Try to push duplicate period (should fail)
    await expect(
      revenueOracle.connect(oracle1).pushRevenueReport(
        period,
        ethers.parseUnits("600000", 6),
        ethers.parseUnits("250000", 6),
        ethers.parseUnits("60000", 6),
        "QmDuplicateReport"
      )
    ).to.be.revertedWith("Period already reported");
  });
  
  it("should handle varying EBITDA correctly", async function () {
    const { revenueOracle, oracle1 } = await loadFixture(deployOracleFixture);
    
    // Q1: Positive EBITDA
    await revenueOracle.connect(oracle1).pushRevenueReport(
      20241,
      ethers.parseUnits("500000", 6),
      ethers.parseUnits("200000", 6), // 40% margin
      ethers.parseUnits("50000", 6),
      "QmQ1"
    );
    
    // Q2: Lower EBITDA
    await revenueOracle.connect(oracle1).pushRevenueReport(
      20242,
      ethers.parseUnits("500000", 6),
      ethers.parseUnits("50000", 6), // 10% margin
      ethers.parseUnits("12500", 6),
      "QmQ2"
    );
    
    // Q3: Zero EBITDA (edge case)
    await revenueOracle.connect(oracle1).pushRevenueReport(
      20243,
      ethers.parseUnits("500000", 6),
      0, // Break-even
      0,
      "QmQ3"
    );
    
    const report1 = await revenueOracle.getReportByPeriod(20241);
    const report2 = await revenueOracle.getReportByPeriod(20242);
    const report3 = await revenueOracle.getReportByPeriod(20243);
    
    expect(report1.ebitda).to.equal(ethers.parseUnits("200000", 6));
    expect(report2.ebitda).to.equal(ethers.parseUnits("50000", 6));
    expect(report3.ebitda).to.equal(0);
  });
  
  it("should support oracle signer rotation", async function () {
    const { revenueOracle, owner, oracle1, oracle2, ORACLE_ROLE } = await loadFixture(deployOracleFixture);
    
    // oracle1 pushes Q1 report
    await revenueOracle.connect(oracle1).pushRevenueReport(
      20241,
      ethers.parseUnits("500000", 6),
      ethers.parseUnits("200000", 6),
      ethers.parseUnits("50000", 6),
      "QmQ1"
    );
    
    // Grant oracle role to oracle2
    await revenueOracle.grantRole(ORACLE_ROLE, oracle2.address);
    
    // oracle2 pushes Q2 report
    await revenueOracle.connect(oracle2).pushRevenueReport(
      20242,
      ethers.parseUnits("600000", 6),
      ethers.parseUnits("250000", 6),
      ethers.parseUnits("60000", 6),
      "QmQ2"
    );
    
    // Revoke oracle1's role
    await revenueOracle.revokeRole(ORACLE_ROLE, oracle1.address);
    
    // oracle1 should no longer be able to push reports
    await expect(
      revenueOracle.connect(oracle1).pushRevenueReport(
        20243,
        ethers.parseUnits("700000", 6),
        ethers.parseUnits("300000", 6),
        ethers.parseUnits("70000", 6),
        "QmQ3"
      )
    ).to.be.reverted;
    
    // But oracle2 should still work
    await revenueOracle.connect(oracle2).pushRevenueReport(
      20243,
      ethers.parseUnits("700000", 6),
      ethers.parseUnits("300000", 6),
      ethers.parseUnits("70000", 6),
      "QmQ3"
    );
    
    const report = await revenueOracle.getLatestReport();
    expect(report.period).to.equal(20243);
  });
  
  it("should update distributeThreshold correctly", async function () {
    const { revenueOracle, owner } = await loadFixture(deployOracleFixture);
    
    // Default threshold should be set (if implemented)
    // Update threshold to 100k USDC
    const newThreshold = ethers.parseUnits("100000", 6);
    await revenueOracle.setDistributeThreshold(newThreshold);
    
    expect(await revenueOracle.distributeThreshold()).to.equal(newThreshold);
    
    // Only admin should be able to update
    const [,, unauthorized] = await ethers.getSigners();
    await expect(
      revenueOracle.connect(unauthorized).setDistributeThreshold(ethers.parseUnits("50000", 6))
    ).to.be.reverted;
  });
  
  it("should reject malformed or invalid data", async function () {
    const { revenueOracle, oracle1 } = await loadFixture(deployOracleFixture);
    
    // Invalid period (0)
    await expect(
      revenueOracle.connect(oracle1).pushRevenueReport(
        0,
        ethers.parseUnits("500000", 6),
        ethers.parseUnits("200000", 6),
        ethers.parseUnits("50000", 6),
        "QmInvalid"
      )
    ).to.be.revertedWith("Invalid period");
    
    // EBITDA > Revenue (impossible)
    await expect(
      revenueOracle.connect(oracle1).pushRevenueReport(
        20241,
        ethers.parseUnits("100000", 6),
        ethers.parseUnits("200000", 6), // EBITDA > Revenue
        ethers.parseUnits("50000", 6),
        "QmInvalid"
      )
    ).to.be.revertedWith("EBITDA cannot exceed revenue");
    
    // Distribute amount > EBITDA
    await expect(
      revenueOracle.connect(oracle1).pushRevenueReport(
        20241,
        ethers.parseUnits("500000", 6),
        ethers.parseUnits("200000", 6),
        ethers.parseUnits("250000", 6), // Distribute > EBITDA
        "QmInvalid"
      )
    ).to.be.revertedWith("Distribute amount exceeds EBITDA");
    
    // Empty IPFS hash
    await expect(
      revenueOracle.connect(oracle1).pushRevenueReport(
        20241,
        ethers.parseUnits("500000", 6),
        ethers.parseUnits("200000", 6),
        ethers.parseUnits("50000", 6),
        ""
      )
    ).to.be.revertedWith("IPFS hash required");
  });
});
