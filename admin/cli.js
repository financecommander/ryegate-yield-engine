const { Command } = require('commander');

const program = new Command();

program
    .command('manage-strategies')
    .description('Manage yield strategies')
    .action(() => {
        // TODO: implement logic to manage yield strategies
    });

program.parse(process.argv);
