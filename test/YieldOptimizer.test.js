const { expect } = require('chai');
const { YieldOptimizer } = require('../contracts');

describe('YieldOptimizer', () => {
    it('optimizes yield', async () => {
        const yieldOptimizer = await YieldOptimizer.deploy();
        await yieldOptimizer.optimizeYield();
        expect(await yieldOptimizer.getOptimizedYield()).to.be.above(0);
    });
});