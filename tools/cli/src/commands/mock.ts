import { Command } from 'commander';
import chalk from 'chalk';

export const mockCommand = new Command('mock')
  .description('Mock data operations')
  .addCommand(
    new Command('up')
      .description('Start mock server')
      .option('-p, --port <port>', 'Server port', '3001')
      .option('-c, --config <config>', 'Config file', 'synth.config.json')
      .action(async (options) => {
        console.log(chalk.blue('🚀 Starting mock server...'));
        console.log(chalk.gray(`Port: ${options.port}`));
        console.log(chalk.gray(`Config: ${options.config}`));
        
        // TODO: Implement mock server
        console.log(chalk.yellow('⚠️ Mock server not yet implemented'));
      })
  )
  .addCommand(
    new Command('generate')
      .description('Generate mock data files')
      .option('-o, --output <directory>', 'Output directory', './mock-data')
      .option('-f, --format <format>', 'Output format', 'json')
      .action(async (options) => {
        console.log(chalk.blue('📁 Generating mock data files...'));
        console.log(chalk.gray(`Output: ${options.output}`));
        console.log(chalk.gray(`Format: ${options.format}`));
        
        // TODO: Implement data generation
        console.log(chalk.yellow('⚠️ Data generation not yet implemented'));
      })
  );