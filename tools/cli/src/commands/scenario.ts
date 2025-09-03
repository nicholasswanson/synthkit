import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { loadConfig, ConfigLoader } from '../utils/config-loader';
import { getPackLoader } from '../utils/pack-loader';

export const scenarioCommand = new Command('scenario')
  .description('Scenario management')
  .addCommand(
    new Command('list')
      .description('List available scenarios')
      .option('-p, --pack <pack>', 'Filter by pack')
      .option('--active', 'Show only active scenarios')
      .action(async (options) => {
        try {
          const config = await loadConfig();
          const packLoader = getPackLoader();

          
          console.log(chalk.blue('📋 Available scenarios:'));
          console.log();

          const packs = await packLoader.discoverPacks(['packs/*']);
          let totalScenarios = 0;

          for (const packInfo of packs) {
            if (options.pack && packInfo.id !== options.pack) {
              continue;
            }

            const pack = packInfo.pack;
            if (!pack?.scenarios || Object.keys(pack.scenarios).length === 0) {
              continue;
            }

            console.log(chalk.cyan(`📦 ${pack.name || packInfo.id} (${packInfo.id})`));
            
            for (const [scenarioId, scenario] of Object.entries(pack.scenarios)) {
              const isActive = (config as any).scenarios?.default === scenarioId;
              const activeIndicator = isActive ? chalk.green('●') : chalk.gray('○');
              
              if (options.active && !isActive) {
                continue;
              }

              console.log(`  ${activeIndicator} ${chalk.white((scenario as any).name || scenarioId)}`);
              if ((scenario as any).description) {
                console.log(`    ${chalk.gray((scenario as any).description)}`);
              }
              
              if ((scenario as any).config) {
                const configDetails = [];
                if ((scenario as any).config.volume) {
                  const volumes = Object.entries((scenario as any).config.volume)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
                  configDetails.push(`Volume: ${volumes}`);
                }
                if ((scenario as any).config.locale) {
                  configDetails.push(`Locale: ${(scenario as any).config.locale}`);
                }
                if (configDetails.length > 0) {
                  console.log(`    ${chalk.gray(`Config: ${configDetails.join(' | ')}`)}`);
                }
              }
              
              totalScenarios++;
            }
            console.log();
          }

          if (totalScenarios === 0) {
            console.log(chalk.yellow('⚠️ No scenarios found'));
            if (options.pack) {
              console.log(chalk.gray(`Try removing the --pack filter or check if pack "${options.pack}" exists`));
            }
          } else {
            console.log(chalk.green(`Found ${totalScenarios} scenario(s)`));
          }

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('activate')
      .description('Activate a scenario')
      .argument('[scenario]', 'Scenario name (optional - will prompt if not provided)')
      .option('-p, --pack <pack>', 'Pack containing the scenario')
      .action(async (scenario, options) => {
        try {
          const config = await loadConfig();
          const configLoader = ConfigLoader.getInstance();
          const packLoader = getPackLoader();


          const packs = await packLoader.discoverPacks(['packs/*']);
          const availableScenarios: Array<{id: string, name: string, pack: string, description?: string}> = [];

          // Collect all available scenarios
          for (const packInfo of packs) {
            if (options.pack && packInfo.id !== options.pack) {
              continue;
            }

            const pack = packInfo.pack;
            if (!pack?.scenarios) continue;

            for (const [scenarioId, scenarioData] of Object.entries(pack.scenarios)) {
              availableScenarios.push({
                id: scenarioId,
                name: (scenarioData as any).name || scenarioId,
                pack: packInfo.id,
                description: (scenarioData as any).description
              });
            }
          }

          if (availableScenarios.length === 0) {
            console.log(chalk.yellow('⚠️ No scenarios available'));
            return;
          }

          let targetScenario = scenario;

          // If no scenario provided, prompt user to select
          if (!targetScenario) {
            const { selectedScenario } = await inquirer.prompt([
              {
                type: 'list',
                name: 'selectedScenario',
                message: 'Select a scenario to activate:',
                choices: availableScenarios.map(s => ({
                  name: `${s.name} (${s.pack}) ${s.description ? `- ${s.description}` : ''}`,
                  value: s.id
                }))
              }
            ]);
            targetScenario = selectedScenario;
          }

          // Find the scenario
          const scenarioInfo = availableScenarios.find(s => s.id === targetScenario);
          if (!scenarioInfo) {
            console.error(chalk.red(`Scenario "${targetScenario}" not found`));
            console.log(chalk.gray('Available scenarios:'));
            availableScenarios.forEach(s => {
              console.log(chalk.gray(`  - ${s.id} (${s.pack})`));
            });
            process.exit(1);
          }

          console.log(chalk.blue(`🎯 Activating scenario: ${scenarioInfo.name}`));
          console.log(chalk.gray(`Pack: ${scenarioInfo.pack}`));

          // Update config
          const updatedConfig = {
            ...config,
            scenarios: {
              ...(config as any).scenarios,
              default: targetScenario
            }
          };

          await configLoader.saveConfig(updatedConfig);
          
          console.log(chalk.green('✅ Scenario activated successfully'));
          console.log();
          console.log(chalk.cyan('💡 Next steps:'));
          console.log(chalk.gray('  - Generate data: synthkit generate --count 50'));
          console.log(chalk.gray('  - Start your app to see the scenario in action'));

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('create')
      .description('Create a new scenario')
      .argument('<name>', 'Scenario name')
      .option('-p, --pack <pack>', 'Target pack (required)')
      .option('-d, --description <desc>', 'Scenario description')
      .option('--locale <locale>', 'Default locale', 'en-US')
      .option('--seed <seed>', 'Random seed for reproducible data', '12345')
      .action(async (name, options) => {
        try {
          if (!options.pack) {
            console.error(chalk.red('Error: --pack option is required'));
            console.log(chalk.gray('Example: synthkit scenario create my-scenario --pack core'));
            process.exit(1);
          }

          const config = await loadConfig();
          const packLoader = getPackLoader();


          // Find the target pack
          const packs = await packLoader.discoverPacks(['packs/*']);
          const targetPack = packs.find(p => p.id === options.pack);
          
          if (!targetPack) {
            console.error(chalk.red(`Pack "${options.pack}" not found`));
            console.log(chalk.gray('Available packs:'));
            packs.forEach(p => console.log(chalk.gray(`  - ${p.id}`)));
            process.exit(1);
          }

          console.log(chalk.blue(`✨ Creating scenario: ${name}`));
          console.log(chalk.gray(`Pack: ${options.pack}`));

          // Gather scenario configuration
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'description',
              message: 'Scenario description:',
              default: options.description || `${name} scenario`
            },
            {
              type: 'input',
              name: 'locale',
              message: 'Default locale:',
              default: options.locale || 'en-US'
            },
            {
              type: 'number',
              name: 'seed',
              message: 'Random seed:',
              default: parseInt(options.seed) || 12345
            },
            {
              type: 'confirm',
              name: 'addVolume',
              message: 'Configure data volumes?',
              default: true
            }
          ]);

          let volumeConfig = {};
          if (answers.addVolume) {
            const pack = targetPack.pack;
            if (pack?.schemas) {
              console.log(chalk.blue('📊 Configure data volumes:'));
              
              for (const schemaName of Object.keys(pack.schemas)) {
                const { volume } = await inquirer.prompt([
                  {
                    type: 'number',
                    name: 'volume',
                    message: `Number of ${schemaName} records:`,
                    default: 50
                  }
                ]);
                (volumeConfig as any)[schemaName] = volume;
              }
            }
          }

          // Create scenario object
          const scenarioConfig = {
            id: name,
            name: name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' '),
            description: answers.description,
            config: {
              seed: answers.seed,
              locale: answers.locale,
              ...(Object.keys(volumeConfig).length > 0 && { volume: volumeConfig })
            }
          };

          // Create scenarios.js file path
          const packDir = path.join(process.cwd(), 'packs', options.pack);
          const scenariosFile = path.join(packDir, 'scenarios.js');

          // Read existing scenarios or create new structure
          let existingScenarios = {};
          if (await fs.pathExists(scenariosFile)) {
            try {
              // Read and parse existing scenarios file
              const content = await fs.readFile(scenariosFile, 'utf8');
              // Simple extraction of scenarios object (this is a basic approach)
              const match = content.match(/export const scenarios = ({[\s\S]*?});/);
              if (match) {
                // This is a simplified approach - in production you'd want proper AST parsing
                console.log(chalk.yellow('⚠️ Existing scenarios file found. Please manually add the new scenario.'));
                console.log();
                console.log(chalk.cyan('Add this to your scenarios.js:'));
                console.log();
                console.log(chalk.gray(`  ${name}: {`));
                console.log(chalk.gray(`    id: '${scenarioConfig.id}',`));
                console.log(chalk.gray(`    name: '${scenarioConfig.name}',`));
                console.log(chalk.gray(`    description: '${scenarioConfig.description}',`));
                console.log(chalk.gray(`    setup: async () => {`));
                console.log(chalk.gray(`      console.log('${scenarioConfig.name} scenario activated');`));
                console.log(chalk.gray(`      // Add your scenario setup logic here`));
                console.log(chalk.gray(`    },`));
                console.log(chalk.gray(`    teardown: async () => {`));
                console.log(chalk.gray(`      console.log('${scenarioConfig.name} scenario deactivated');`));
                console.log(chalk.gray(`    },`));
                console.log(chalk.gray(`  },`));
                return;
              }
            } catch (error) {
              console.log(chalk.yellow('⚠️ Could not parse existing scenarios file'));
            }
          }

          // Create new scenarios file
          const scenariosContent = `export const scenarios = {
  ${name}: {
    id: '${scenarioConfig.id}',
    name: '${scenarioConfig.name}',
    description: '${scenarioConfig.description}',
    setup: async () => {
      console.log('${scenarioConfig.name} scenario activated');
      // Add your scenario setup logic here
      // This could configure MSW handlers, set up test data, etc.
    },
    teardown: async () => {
      console.log('${scenarioConfig.name} scenario deactivated');
      // Add cleanup logic here
    },
  },
};
`;

          await fs.ensureDir(packDir);
          await fs.writeFile(scenariosFile, scenariosContent);

          console.log(chalk.green('✅ Scenario created successfully'));
          console.log();
          console.log(chalk.cyan('📁 Files created:'));
          console.log(chalk.gray(`  ${scenariosFile}`));
          console.log();
          console.log(chalk.cyan('💡 Next steps:'));
          console.log(chalk.gray(`  1. Edit ${scenariosFile} to add your scenario logic`));
          console.log(chalk.gray(`  2. Activate: synthkit scenario activate ${name} --pack ${options.pack}`));
          console.log(chalk.gray(`  3. Generate data: synthkit generate --count 50`));

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('info')
      .description('Show detailed information about a scenario')
      .argument('<scenario>', 'Scenario name')
      .option('-p, --pack <pack>', 'Pack containing the scenario')
      .action(async (scenario, options) => {
        try {
          const config = await loadConfig();
          const packLoader = getPackLoader();


          const packs = await packLoader.discoverPacks(['packs/*']);
          let foundScenario = null;
          let foundPack = null;

          // Find the scenario
          for (const packInfo of packs) {
            if (options.pack && packInfo.id !== options.pack) {
              continue;
            }

            const pack = packInfo.pack;
            if (!pack?.scenarios) continue;

            if (pack.scenarios[scenario]) {
              foundScenario = pack.scenarios[scenario];
              foundPack = packInfo;
              break;
            }
          }

          if (!foundScenario || !foundPack) {
            console.error(chalk.red(`Scenario "${scenario}" not found`));
            if (options.pack) {
              console.log(chalk.gray(`Searched in pack: ${options.pack}`));
            }
            process.exit(1);
          }

          const isActive = (config as any).scenarios?.default === scenario;

          console.log(chalk.blue(`📋 Scenario Information`));
          console.log();
          console.log(chalk.cyan('Basic Info:'));
          console.log(`  Name: ${chalk.white(foundScenario.name || scenario)}`);
          console.log(`  ID: ${chalk.white(scenario)}`);
          console.log(`  Pack: ${chalk.white(foundPack.id)}`);
          console.log(`  Status: ${isActive ? chalk.green('Active') : chalk.gray('Inactive')}`);
          
          if (foundScenario.description) {
            console.log(`  Description: ${chalk.white(foundScenario.description)}`);
          }

          if (foundScenario.config) {
            console.log();
            console.log(chalk.cyan('Configuration:'));
            
            if (foundScenario.config.seed) {
              console.log(`  Seed: ${chalk.white(foundScenario.config.seed)}`);
            }
            
            if (foundScenario.config.locale) {
              console.log(`  Locale: ${chalk.white(foundScenario.config.locale)}`);
            }
            
            if (foundScenario.config.dateRange) {
              console.log(`  Date Range: ${chalk.white(foundScenario.config.dateRange.start)} to ${chalk.white(foundScenario.config.dateRange.end)}`);
            }
            
            if (foundScenario.config.volume) {
              console.log(`  Data Volumes:`);
              for (const [key, value] of Object.entries(foundScenario.config.volume)) {
                console.log(`    ${key}: ${chalk.white(value)}`);
              }
            }
            
            if (foundScenario.config.relationships) {
              console.log(`  Relationships: ${chalk.white(JSON.stringify(foundScenario.config.relationships))}`);
            }
          }

          console.log();
          console.log(chalk.cyan('💡 Actions:'));
          if (!isActive) {
            console.log(chalk.gray(`  Activate: synthkit scenario activate ${scenario} --pack ${foundPack.id}`));
          }
          console.log(chalk.gray(`  Generate data: synthkit generate --category ${foundPack.id} --count 50`));
          console.log(chalk.gray(`  List all: synthkit scenario list --pack ${foundPack.id}`));

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  );