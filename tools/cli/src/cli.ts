import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { generateCommand } from './commands/generate';
import { listCommand } from './commands/list';
import { packCommand } from './commands/pack';
import { mockCommand } from './commands/mock';
import { scenarioCommand } from './commands/scenario';
import { snapshotCommand } from './commands/snapshot';
import { createAICommand } from './commands/ai';
import { datasetCommand } from './commands/dataset';

const program = new Command();

program
  .name('synthkit')
  .description('Synthkit CLI - Mock data generation and scenario management')
  .version('0.1.0');

// Add commands
program.addCommand(initCommand);
program.addCommand(generateCommand);
program.addCommand(listCommand);
program.addCommand(packCommand);
program.addCommand(mockCommand);
program.addCommand(scenarioCommand);
program.addCommand(snapshotCommand);
program.addCommand(createAICommand());
program.addCommand(datasetCommand);

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