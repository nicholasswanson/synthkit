import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { loadConfig, ConfigLoader } from '../utils/config-loader';
import { getPackLoader } from '../utils/pack-loader';

interface Snapshot {
  name: string;
  description?: string;
  timestamp: string;
  config: any;
  data: Record<string, any[]>;
  metadata: {
    version: string;
    packs: string[];
    scenarios: Record<string, string>;
    totalRecords: number;
  };
}

export const snapshotCommand = new Command('snapshot')
  .description('State snapshot management')
  .addCommand(
    new Command('create')
      .description('Create a state snapshot')
      .argument('<name>', 'Snapshot name')
      .option('-d, --description <desc>', 'Snapshot description')
      .option('--include-data', 'Include generated data in snapshot', true)
      .option('--no-include-data', 'Exclude generated data from snapshot')
      .action(async (name, options) => {
        try {
          console.log(chalk.blue(`📸 Creating snapshot: ${name}`));
          
          const config = await loadConfig();
          const configLoader = ConfigLoader.getInstance();
          const projectRoot = configLoader.getProjectRoot();
          
          // Create snapshots directory
          const snapshotsDir = path.join(projectRoot, '.synthkit', 'snapshots');
          await fs.ensureDir(snapshotsDir);
          
          const snapshotPath = path.join(snapshotsDir, `${name}.json`);
          
          // Check if snapshot already exists
          if (await fs.pathExists(snapshotPath)) {
            const { overwrite } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'overwrite',
                message: `Snapshot "${name}" already exists. Overwrite?`,
                default: false
              }
            ]);
            
            if (!overwrite) {
              console.log(chalk.yellow('⚠️ Snapshot creation cancelled'));
              return;
            }
          }

          let description = options.description;
          if (!description) {
            const answers = await inquirer.prompt([
              {
                type: 'input',
                name: 'description',
                message: 'Snapshot description (optional):',
                default: `Snapshot created on ${new Date().toLocaleDateString()}`
              }
            ]);
            description = answers.description;
          }

          console.log(chalk.gray('📊 Collecting current state...'));
          
          // Collect data from generated files
          let data: Record<string, any[]> = {};
          let totalRecords = 0;
          
          if (options.includeData) {
            const generatedDataDir = path.join(projectRoot, 'generated-data');
            if (await fs.pathExists(generatedDataDir)) {
              const files = await fs.readdir(generatedDataDir);
              
              for (const file of files) {
                if (file.endsWith('.json')) {
                  const filePath = path.join(generatedDataDir, file);
                  try {
                    const fileData = await fs.readJSON(filePath);
                    const schemaName = path.basename(file, '.json');
                    
                    if (Array.isArray(fileData)) {
                      data[schemaName] = fileData;
                      totalRecords += fileData.length;
                    } else if (fileData.data && Array.isArray(fileData.data)) {
                      data[schemaName] = fileData.data;
                      totalRecords += fileData.data.length;
                    }
                  } catch (error) {
                    console.log(chalk.yellow(`⚠️ Could not read ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`));
                  }
                }
              }
            }
          }

          // Create snapshot object
          const snapshot: Snapshot = {
            name,
            description,
            timestamp: new Date().toISOString(),
            config: { ...config },
            data,
            metadata: {
              version: '1.0.0',
              packs: (config as any).packs || [],
              scenarios: (config as any).scenarios || {},
              totalRecords
            }
          };

          // Save snapshot
          await fs.writeJSON(snapshotPath, snapshot, { spaces: 2 });
          
          console.log(chalk.green('✅ Snapshot created successfully'));
          console.log();
          console.log(chalk.cyan('📋 Snapshot Details:'));
          console.log(`  Name: ${chalk.white(name)}`);
          console.log(`  Description: ${chalk.white(description)}`);
          console.log(`  Packs: ${chalk.white((config as any).packs?.join(', ') || 'none')}`);
          console.log(`  Records: ${chalk.white(totalRecords)}`);
          console.log(`  File: ${chalk.gray(snapshotPath)}`);
          console.log();
          console.log(chalk.cyan('💡 Next steps:'));
          console.log(chalk.gray(`  - Restore: synthkit snapshot restore ${name}`));
          console.log(chalk.gray('  - List all: synthkit snapshot list'));

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('restore')
      .description('Restore from a snapshot')
      .argument('[name]', 'Snapshot name (optional - will prompt if not provided)')
      .option('--restore-config', 'Restore configuration settings', true)
      .option('--no-restore-config', 'Skip configuration restoration')
      .option('--restore-data', 'Restore generated data', true)
      .option('--no-restore-data', 'Skip data restoration')
      .action(async (name, options) => {
        try {
          const config = await loadConfig();
          const configLoader = ConfigLoader.getInstance();
          const projectRoot = configLoader.getProjectRoot();
          
          const snapshotsDir = path.join(projectRoot, '.synthkit', 'snapshots');
          
          if (!await fs.pathExists(snapshotsDir)) {
            console.log(chalk.yellow('⚠️ No snapshots directory found'));
            console.log(chalk.gray('Create a snapshot first: synthkit snapshot create my-snapshot'));
            return;
          }

          // Get available snapshots
          const snapshotFiles = (await fs.readdir(snapshotsDir))
            .filter(f => f.endsWith('.json'))
            .map(f => path.basename(f, '.json'));

          if (snapshotFiles.length === 0) {
            console.log(chalk.yellow('⚠️ No snapshots found'));
            console.log(chalk.gray('Create a snapshot first: synthkit snapshot create my-snapshot'));
            return;
          }

          let targetSnapshot = name;

          // If no snapshot provided, prompt user to select
          if (!targetSnapshot) {
            const { selectedSnapshot } = await inquirer.prompt([
              {
                type: 'list',
                name: 'selectedSnapshot',
                message: 'Select a snapshot to restore:',
                choices: snapshotFiles
              }
            ]);
            targetSnapshot = selectedSnapshot;
          }

          const snapshotPath = path.join(snapshotsDir, `${targetSnapshot}.json`);
          
          if (!await fs.pathExists(snapshotPath)) {
            console.error(chalk.red(`Snapshot "${targetSnapshot}" not found`));
            console.log(chalk.gray('Available snapshots:'));
            snapshotFiles.forEach(s => console.log(chalk.gray(`  - ${s}`)));
            process.exit(1);
          }

          // Load snapshot
          const snapshot: Snapshot = await fs.readJSON(snapshotPath);
          
          console.log(chalk.blue(`🔄 Restoring snapshot: ${snapshot.name}`));
          console.log(chalk.gray(`Created: ${new Date(snapshot.timestamp).toLocaleString()}`));
          console.log(chalk.gray(`Description: ${snapshot.description || 'No description'}`));
          console.log();

          // Confirm restoration
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: 'This will overwrite current configuration and data. Continue?',
              default: false
            }
          ]);

          if (!confirm) {
            console.log(chalk.yellow('⚠️ Restoration cancelled'));
            return;
          }

          let restoredItems = [];

          // Restore configuration
          if (options.restoreConfig) {
            console.log(chalk.gray('⚙️ Restoring configuration...'));
            await configLoader.saveConfig(snapshot.config);
            restoredItems.push('Configuration');
          }

          // Restore data
          if (options.restoreData && snapshot.data && Object.keys(snapshot.data).length > 0) {
            console.log(chalk.gray('📊 Restoring generated data...'));
            
            const generatedDataDir = path.join(projectRoot, 'generated-data');
            await fs.ensureDir(generatedDataDir);
            
            let restoredRecords = 0;
            for (const [schemaName, records] of Object.entries(snapshot.data)) {
              const filePath = path.join(generatedDataDir, `${schemaName}.json`);
              await fs.writeJSON(filePath, records, { spaces: 2 });
              restoredRecords += records.length;
            }
            
            restoredItems.push(`Data (${restoredRecords} records)`);
          }

          console.log(chalk.green('✅ Snapshot restored successfully'));
          console.log();
          console.log(chalk.cyan('📋 Restored:'));
          restoredItems.forEach(item => {
            console.log(`  ✓ ${chalk.white(item)}`);
          });
          console.log();
          console.log(chalk.cyan('💡 Next steps:'));
          console.log(chalk.gray('  - Restart your development server to see changes'));
          console.log(chalk.gray('  - Generate new data: synthkit generate --count 50'));

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('list')
      .description('List available snapshots')
      .option('--detailed', 'Show detailed information')
      .action(async (options) => {
        try {
          const config = await loadConfig();
          const configLoader = ConfigLoader.getInstance();
          const projectRoot = configLoader.getProjectRoot();
          
          const snapshotsDir = path.join(projectRoot, '.synthkit', 'snapshots');
          
          if (!await fs.pathExists(snapshotsDir)) {
            console.log(chalk.yellow('⚠️ No snapshots directory found'));
            console.log(chalk.gray('Create a snapshot first: synthkit snapshot create my-snapshot'));
            return;
          }

          const snapshotFiles = (await fs.readdir(snapshotsDir))
            .filter(f => f.endsWith('.json'));

          if (snapshotFiles.length === 0) {
            console.log(chalk.yellow('⚠️ No snapshots found'));
            console.log(chalk.gray('Create a snapshot first: synthkit snapshot create my-snapshot'));
            return;
          }

          console.log(chalk.blue('📋 Available snapshots:'));
          console.log();

          const snapshots: Snapshot[] = [];
          
          // Load all snapshots
          for (const file of snapshotFiles) {
            try {
              const snapshotPath = path.join(snapshotsDir, file);
              const snapshot = await fs.readJSON(snapshotPath);
              snapshots.push(snapshot);
            } catch (error) {
              console.log(chalk.yellow(`⚠️ Could not read ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`));
            }
          }

          // Sort by timestamp (newest first)
          snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          for (const snapshot of snapshots) {
            const age = getRelativeTime(new Date(snapshot.timestamp));
            
            console.log(`${chalk.cyan('●')} ${chalk.white(snapshot.name)}`);
            console.log(`  ${chalk.gray(snapshot.description || 'No description')}`);
            console.log(`  ${chalk.gray(`Created ${age} • ${snapshot.metadata.totalRecords} records`)}`);
            
            if (options.detailed) {
              console.log(`  ${chalk.gray(`Packs: ${snapshot.metadata.packs.join(', ') || 'none'}`)}`);
              if (snapshot.metadata.scenarios?.default) {
                console.log(`  ${chalk.gray(`Active scenario: ${snapshot.metadata.scenarios.default}`)}`);
              }
              
              if (snapshot.data && Object.keys(snapshot.data).length > 0) {
                const dataBreakdown = Object.entries(snapshot.data)
                  .map(([schema, records]) => `${schema}: ${records.length}`)
                  .join(', ');
                console.log(`  ${chalk.gray(`Data: ${dataBreakdown}`)}`);
              }
            }
            
            console.log();
          }

          console.log(chalk.green(`Found ${snapshots.length} snapshot(s)`));
          console.log();
          console.log(chalk.cyan('💡 Commands:'));
          console.log(chalk.gray('  - Restore: synthkit snapshot restore <name>'));
          console.log(chalk.gray('  - Create: synthkit snapshot create <name>'));
          console.log(chalk.gray('  - Details: synthkit snapshot info <name>'));

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('info')
      .description('Show detailed information about a snapshot')
      .argument('<name>', 'Snapshot name')
      .action(async (name) => {
        try {
          const config = await loadConfig();
          const configLoader = ConfigLoader.getInstance();
          const projectRoot = configLoader.getProjectRoot();
          
          const snapshotPath = path.join(projectRoot, '.synthkit', 'snapshots', `${name}.json`);
          
          if (!await fs.pathExists(snapshotPath)) {
            console.error(chalk.red(`Snapshot "${name}" not found`));
            process.exit(1);
          }

          const snapshot: Snapshot = await fs.readJSON(snapshotPath);
          
          console.log(chalk.blue(`📋 Snapshot Information`));
          console.log();
          console.log(chalk.cyan('Basic Info:'));
          console.log(`  Name: ${chalk.white(snapshot.name)}`);
          console.log(`  Description: ${chalk.white(snapshot.description || 'No description')}`);
          console.log(`  Created: ${chalk.white(new Date(snapshot.timestamp).toLocaleString())}`);
          console.log(`  Age: ${chalk.white(getRelativeTime(new Date(snapshot.timestamp)))}`);
          
          console.log();
          console.log(chalk.cyan('Configuration:'));
          console.log(`  Packs: ${chalk.white(snapshot.metadata.packs.join(', ') || 'none')}`);
          if (snapshot.metadata.scenarios?.default) {
            console.log(`  Active Scenario: ${chalk.white(snapshot.metadata.scenarios.default)}`);
          }
          console.log(`  Total Records: ${chalk.white(snapshot.metadata.totalRecords)}`);
          
          if (snapshot.data && Object.keys(snapshot.data).length > 0) {
            console.log();
            console.log(chalk.cyan('Data Breakdown:'));
            for (const [schema, records] of Object.entries(snapshot.data)) {
              console.log(`  ${schema}: ${chalk.white(records.length)} records`);
            }
          }

          console.log();
          console.log(chalk.cyan('💡 Actions:'));
          console.log(chalk.gray(`  Restore: synthkit snapshot restore ${name}`));
          console.log(chalk.gray('  List all: synthkit snapshot list'));

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('delete')
      .description('Delete a snapshot')
      .argument('<name>', 'Snapshot name')
      .option('-f, --force', 'Skip confirmation prompt')
      .action(async (name, options) => {
        try {
          const config = await loadConfig();
          const configLoader = ConfigLoader.getInstance();
          const projectRoot = configLoader.getProjectRoot();
          
          const snapshotPath = path.join(projectRoot, '.synthkit', 'snapshots', `${name}.json`);
          
          if (!await fs.pathExists(snapshotPath)) {
            console.error(chalk.red(`Snapshot "${name}" not found`));
            process.exit(1);
          }

          if (!options.force) {
            const { confirm } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'confirm',
                message: `Delete snapshot "${name}"? This cannot be undone.`,
                default: false
              }
            ]);

            if (!confirm) {
              console.log(chalk.yellow('⚠️ Deletion cancelled'));
              return;
            }
          }

          await fs.remove(snapshotPath);
          
          console.log(chalk.green(`✅ Snapshot "${name}" deleted successfully`));

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  );

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}