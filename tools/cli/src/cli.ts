import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { generateCommand } from './commands/generate';
import { createAICommand } from './commands/ai';
import { datasetCommand } from './commands/dataset';
import { createIntegrateCommand } from './commands/integrate';

const program = new Command();

program
  .name('synthkit')
  .description('Synthkit CLI - Mock data generation and scenario management')
  .version('0.1.0');

// Add commands
program.addCommand(initCommand);
program.addCommand(generateCommand);
program.addCommand(createAICommand());
program.addCommand(datasetCommand);
program.addCommand(createIntegrateCommand());

// Global error handler
program.exitOverride((err) => {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  console.error(chalk.red('Error:'), err.message);
  process.exit(1);
});

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}