const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('YieldOptimizer', () => {
    it('should add a new yield source', async () => {
        const yieldOptimizer = await ethers.getContractFactory('YieldOptimizer');
        const instance = await yieldOptimizer.deploy();
        await instance.deployed();

        const yieldSource = '0x...';
        const yieldRate = 100;
        const yieldToken = '0x...';

        await instance.addYieldSource(yieldSource, yieldRate, yieldToken);

        const yieldSources = await instance.getYieldSources();
        expect(yieldSources).to.include(yieldSource);
    });
});