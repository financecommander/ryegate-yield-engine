const { Command } = require('commander');
const program = new Command();

program
    .option('-y, --yield-source <yieldSource>', 'add a new yield source')
    .option('-r, --yield-rate <yieldRate>', 'set the yield rate for a yield source')
    .option('-t, --yield-token <yieldToken>', 'set the yield token for a yield source');

program.parse(process.argv);

if (program.opts().yieldSource) {
    // Add a new yield source to the YieldOptimizer contract
    const web3 = require('web3');
    const yieldOptimizerContract = new web3.eth.Contract([...], '0x...');
    yieldOptimizerContract.methods.addYieldSource(program.opts().yieldSource, program.opts().yieldRate, program.opts().yieldToken).send();
}