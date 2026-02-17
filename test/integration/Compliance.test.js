const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Compliance Integration Tests", function () {
  const REG_D = ethers.keccak256(ethers.toUtf8Bytes("REG_D"));
  const REG_A_PLUS = ethers.keccak256(ethers.toUtf8Bytes("REG_A_PLUS"));
  const LOCKUP_DURATION = 365 * 24 * 60 * 60; // 12 months in seconds
  
  async function deployComplianceSystemFixture() {
    const [owner, investor1, investor2, investor3] = await ethers.getSigners();
    
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
    
    return {
      ryegateNotes,
      usdc,
      kycWhitelist,
      revenueOracle,
      owner,
      investor1,
      investor2,
      investor3
    };
  }
  
  describe("KYC Enforcement", function () {
    it("should block transfers from non-KYC'd addresses", async function () {
      const { ryegateNotes, kycWhitelist, investor1, investor2 } = await loadFixture(deployComplianceSystemFixture);
      
      // Whitelist only investor1
      await kycWhitelist.addToWhitelist(investor1.address, false);
      
      // Mint tokens to investor1
      const amount = ethers.parseUnits("10000", 18);
      await ryegateNotes.issueByPartition(REG_A_PLUS, investor1.address, amount, "0x");
      
      // Try to transfer to non-KYC'd investor2 (should fail)
      await expect(
        ryegateNotes.connect(investor1).operatorTransferByPartition(
          REG_A_PLUS,
          investor1.address,
          investor2.address,
          ethers.parseUnits("1000", 18),
          "0x",
          "0x"
        )
      ).to.be.revertedWith("Receiver not KYC'd");
    });
    
    it("should block transfers to addresses after KYC revocation", async function () {
      const { ryegateNotes, kycWhitelist, investor1, investor2 } = await loadFixture(deployComplianceSystemFixture);
      
      // Whitelist both investors
      await kycWhitelist.addToWhitelist(investor1.address, false);
      await kycWhitelist.addToWhitelist(investor2.address, false);
      
      // Mint tokens
      await ryegateNotes.issueByPartition(REG_A_PLUS, investor1.address, ethers.parseUnits("10000", 18), "0x");
      
      // First transfer should work
      await ryegateNotes.connect(investor1).operatorTransferByPartition(
        REG_A_PLUS,
        investor1.address,
        investor2.address,
        ethers.parseUnits("1000", 18),
        "0x",
        "0x"
      );
      
      // Revoke investor2's KYC
      await kycWhitelist.removeFromWhitelist(investor2.address);
      
      // Second transfer should fail
      await expect(
        ryegateNotes.connect(investor1).operatorTransferByPartition(
          REG_A_PLUS,
          investor1.address,
          investor2.address,
          ethers.parseUnits("1000", 18),
          "0x",
          "0x"
        )
      ).to.be.revertedWith("Receiver not KYC'd");
    });
  });
  
  describe("Accreditation Enforcement", function () {
    it("should block REG_D transfers to non-accredited investors", async function () {
      const { ryegateNotes, kycWhitelist, investor1, investor2 } = await loadFixture(deployComplianceSystemFixture);
      
      // Whitelist investor1 as accredited, investor2 as non-accredited
      await kycWhitelist.addToWhitelist(investor1.address, true); // accredited
      await kycWhitelist.addToWhitelist(investor2.address, false); // not accredited
      
      // Mint REG_D tokens to investor1
      const amount = ethers.parseUnits("10000", 18);
      await ryegateNotes.issueByPartition(REG_D, investor1.address, amount, "0x");
      
      // Try to transfer to non-accredited investor2 (should fail)
      await expect(
        ryegateNotes.connect(investor1).operatorTransferByPartition(
          REG_D,
          investor1.address,
          investor2.address,
          ethers.parseUnits("1000", 18),
          "0x",
          "0x"
        )
      ).to.be.revertedWith("Receiver not accredited for Reg D");
    });
    
    it("should allow REG_A_PLUS transfers to non-accredited investors", async function () {
      const { ryegateNotes, kycWhitelist, investor1, investor2 } = await loadFixture(deployComplianceSystemFixture);
      
      // Whitelist both as non-accredited
      await kycWhitelist.addToWhitelist(investor1.address, false);
      await kycWhitelist.addToWhitelist(investor2.address, false);
      
      // Mint REG_A_PLUS tokens to investor1
      const amount = ethers.parseUnits("10000", 18);
      await ryegateNotes.issueByPartition(REG_A_PLUS, investor1.address, amount, "0x");
      
      // Transfer should work
      await ryegateNotes.connect(investor1).operatorTransferByPartition(
        REG_A_PLUS,
        investor1.address,
        investor2.address,
        ethers.parseUnits("1000", 18),
        "0x",
        "0x"
      );
      
      expect(await ryegateNotes.balanceOfByPartition(REG_A_PLUS, investor2.address))
        .to.equal(ethers.parseUnits("1000", 18));
    });
  });
  
  describe("Lockup Period Enforcement", function () {
    it("should enforce 12-month lockup for REG_D tokens", async function () {
      const { ryegateNotes, kycWhitelist, investor1, investor2 } = await loadFixture(deployComplianceSystemFixture);
      
      // Whitelist both as accredited
      await kycWhitelist.addToWhitelist(investor1.address, true);
      await kycWhitelist.addToWhitelist(investor2.address, true);
      
      // Mint REG_D tokens to investor1
      const amount = ethers.parseUnits("10000", 18);
      await ryegateNotes.issueByPartition(REG_D, investor1.address, amount, "0x");
      
      // Immediate transfer should fail (lockup active)
      await expect(
        ryegateNotes.connect(investor1).operatorTransferByPartition(
          REG_D,
          investor1.address,
          investor2.address,
          ethers.parseUnits("1000", 18),
          "0x",
          "0x"
        )
      ).to.be.revertedWith("Reg D lockup active");
      
      // Fast forward 6 months (still locked)
      await time.increase(180 * 24 * 60 * 60);
      
      await expect(
        ryegateNotes.connect(investor1).operatorTransferByPartition(
          REG_D,
          investor1.address,
          investor2.address,
          ethers.parseUnits("1000", 18),
          "0x",
          "0x"
        )
      ).to.be.revertedWith("Reg D lockup active");
      
      // Fast forward past 12 months
      await time.increase(186 * 24 * 60 * 60); // Total > 365 days
      
      // Now transfer should work
      await ryegateNotes.connect(investor1).operatorTransferByPartition(
        REG_D,
        investor1.address,
        investor2.address,
        ethers.parseUnits("1000", 18),
        "0x",
        "0x"
      );
      
      expect(await ryegateNotes.balanceOfByPartition(REG_D, investor2.address))
        .to.equal(ethers.parseUnits("1000", 18));
    });
    
    it("should not enforce lockup for REG_A_PLUS tokens", async function () {
      const { ryegateNotes, kycWhitelist, investor1, investor2 } = await loadFixture(deployComplianceSystemFixture);
      
      // Whitelist both
      await kycWhitelist.addToWhitelist(investor1.address, false);
      await kycWhitelist.addToWhitelist(investor2.address, false);
      
      // Mint REG_A_PLUS tokens
      const amount = ethers.parseUnits("10000", 18);
      await ryegateNotes.issueByPartition(REG_A_PLUS, investor1.address, amount, "0x");
      
      // Immediate transfer should work (no lockup for REG_A_PLUS)
      await ryegateNotes.connect(investor1).operatorTransferByPartition(
        REG_A_PLUS,
        investor1.address,
        investor2.address,
        ethers.parseUnits("1000", 18),
        "0x",
        "0x"
      );
      
      expect(await ryegateNotes.balanceOfByPartition(REG_A_PLUS, investor2.address))
        .to.equal(ethers.parseUnits("1000", 18));
    });
  });
  
  describe("KYC Expiry Handling", function () {
    it("should handle KYC expiry dates correctly", async function () {
      const { kycWhitelist, investor1 } = await loadFixture(deployComplianceSystemFixture);
      
      // Add investor with expiry date 30 days from now
      const expiryDate = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
      await kycWhitelist.addToWhitelist(investor1.address, false);
      await kycWhitelist.setExpiryDate(investor1.address, expiryDate);
      
      // Should be whitelisted now
      expect(await kycWhitelist.isWhitelisted(investor1.address)).to.be.true;
      
      // Fast forward 31 days
      await time.increase(31 * 24 * 60 * 60);
      
      // Should no longer be whitelisted
      expect(await kycWhitelist.isWhitelisted(investor1.address)).to.be.false;
    });
  });
  
  describe("Pause Enforcement", function () {
    it("should block all transfers when paused", async function () {
      const { ryegateNotes, kycWhitelist, investor1, investor2 } = await loadFixture(deployComplianceSystemFixture);
      
      // Setup: whitelist and mint tokens
      await kycWhitelist.addToWhitelist(investor1.address, false);
      await kycWhitelist.addToWhitelist(investor2.address, false);
      await ryegateNotes.issueByPartition(REG_A_PLUS, investor1.address, ethers.parseUnits("10000", 18), "0x");
      
      // Transfer should work normally
      await ryegateNotes.connect(investor1).operatorTransferByPartition(
        REG_A_PLUS,
        investor1.address,
        investor2.address,
        ethers.parseUnits("1000", 18),
        "0x",
        "0x"
      );
      
      // Pause the contract
      await ryegateNotes.pause();
      
      // All transfers should fail
      await expect(
        ryegateNotes.connect(investor1).operatorTransferByPartition(
          REG_A_PLUS,
          investor1.address,
          investor2.address,
          ethers.parseUnits("1000", 18),
          "0x",
          "0x"
        )
      ).to.be.reverted;
      
      // Unpause
      await ryegateNotes.unpause();
      
      // Transfers should work again
      await ryegateNotes.connect(investor1).operatorTransferByPartition(
        REG_A_PLUS,
        investor1.address,
        investor2.address,
        ethers.parseUnits("1000", 18),
        "0x",
        "0x"
      );
    });
  });
});
