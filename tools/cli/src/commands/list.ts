import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig } from '../utils/config-loader';
import { getPackLoader } from '../utils/pack-loader';

export const listCommand = new Command('list')
  .description('List available resources (categories, packs, schemas)')
  .addCommand(
    new Command('categories')
      .alias('cat')
      .description('List all available business categories')
      .option('-v, --verbose', 'Show detailed information')
      .action(async (options) => {
        try {
          console.log(chalk.blue('📋 Available Business Categories:'));
          console.log();

          const config = await loadConfig();
          const packLoader = getPackLoader();
          await packLoader.loadConfiguredPacks();

          const categories = packLoader.getBusinessCategories();

          if (categories.length === 0) {
            console.log(chalk.yellow('No categories found. Make sure packs are configured in synth.config.json'));
            return;
          }

          categories.forEach((category, index) => {
            const prefix = index === categories.length - 1 ? '└─' : '├─';
            console.log(chalk.cyan(`${prefix} ${category.id}`));
            console.log(chalk.gray(`   ${category.name}`));
            
            if (options.verbose && category.description) {
              console.log(chalk.gray(`   ${category.description}`));
            }
            
            if (index < categories.length - 1) {
              console.log();
            }
          });

          console.log();
          console.log(chalk.gray(`Total: ${categories.length} categories`));
          console.log(chalk.gray('Use "synthkit generate --category <id>" to generate data'));

        } catch (error) {
          console.error(chalk.red('Error:'), error.message);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('packs')
      .description('List all loaded packs')
      .option('-v, --verbose', 'Show detailed information')
      .option('-a, --all', 'Show all discovered packs (not just configured ones)')
      .action(async (options) => {
        try {
          console.log(chalk.blue('📦 Available Packs:'));
          console.log();

          const config = await loadConfig();
          const packLoader = getPackLoader();

          let packs;
          if (options.all) {
            packs = await packLoader.discoverPacks();
            console.log(chalk.gray('Showing all discovered packs:'));
          } else {
            await packLoader.loadConfiguredPacks();
            packs = packLoader.getAllPacks();
            console.log(chalk.gray('Showing configured packs:'));
          }

          if (packs.length === 0) {
            console.log(chalk.yellow('No packs found.'));
            if (!options.all) {
              console.log(chalk.gray('Try --all to discover packs in the project'));
            }
            return;
          }

          packs.forEach((pack, index) => {
            const prefix = index === packs.length - 1 ? '└─' : '├─';
            const status = config.packs.includes(pack.id) ? chalk.green('✓') : chalk.gray('○');
            
            console.log(`${prefix} ${status} ${chalk.cyan(pack.id)} ${chalk.gray(`(v${pack.version})`)}`);
            console.log(chalk.gray(`   ${pack.name}`));
            
            if (options.verbose) {
              if (pack.description) {
                console.log(chalk.gray(`   ${pack.description}`));
              }
              console.log(chalk.gray(`   Path: ${pack.path}`));
              
              const schemas = Object.keys(pack.pack.schemas || {});
              if (schemas.length > 0) {
                console.log(chalk.gray(`   Schemas: ${schemas.join(', ')}`));
              }
            }
            
            if (index < packs.length - 1) {
              console.log();
            }
          });

          console.log();
          console.log(chalk.gray(`Total: ${packs.length} packs`));
          if (!options.all) {
            console.log(chalk.gray(`Configured: ${config.packs.length} packs`));
          }

        } catch (error) {
          console.error(chalk.red('Error:'), error.message);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('schemas')
      .description('List schemas in a specific pack')
      .argument('<pack>', 'Pack ID to list schemas from')
      .option('-v, --verbose', 'Show detailed schema information')
      .action(async (packId: string, options) => {
        try {
          console.log(chalk.blue(`📋 Schemas in pack "${packId}":`));
          console.log();

          const config = await loadConfig();
          const packLoader = getPackLoader();
          await packLoader.loadConfiguredPacks();

          const packInfo = packLoader.getPack(packId);
          if (!packInfo) {
            console.error(chalk.red(`Pack "${packId}" not found.`));
            console.log(chalk.gray('Available packs:'));
            const categories = packLoader.getBusinessCategories();
            categories.forEach(cat => {
              console.log(chalk.gray(`  - ${cat.id}`));
            });
            process.exit(1);
          }

          const schemas = packInfo.pack.schemas || {};
          const schemaNames = Object.keys(schemas);

          if (schemaNames.length === 0) {
            console.log(chalk.yellow(`No schemas found in pack "${packId}"`));
            return;
          }

          schemaNames.forEach((schemaName, index) => {
            const schema = schemas[schemaName];
            const prefix = index === schemaNames.length - 1 ? '└─' : '├─';
            
            console.log(chalk.cyan(`${prefix} ${schemaName}`));
            
            if (options.verbose && schema) {
              // Show schema properties
              if (schema.properties) {
                const properties = Object.keys(schema.properties);
                console.log(chalk.gray(`   Properties: ${properties.join(', ')}`));
              }
              
              if (schema.description) {
                console.log(chalk.gray(`   Description: ${schema.description}`));
              }
              
              // Show required fields
              if (schema.required && schema.required.length > 0) {
                console.log(chalk.gray(`   Required: ${schema.required.join(', ')}`));
              }
            }
            
            if (index < schemaNames.length - 1) {
              console.log();
            }
          });

          console.log();
          console.log(chalk.gray(`Total: ${schemaNames.length} schemas`));
          console.log(chalk.gray(`Use "synthkit generate --category ${packId} --schema <name>" to generate specific schema`));

        } catch (error) {
          console.error(chalk.red('Error:'), error.message);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('roles')
      .description('List available roles/personas')
      .argument('[pack]', 'Pack ID to list roles from (optional)')
      .option('-v, --verbose', 'Show detailed role information')
      .action(async (packId?: string, options) => {
        try {
          const config = await loadConfig();
          const packLoader = getPackLoader();
          await packLoader.loadConfiguredPacks();

          if (packId) {
            // List roles from specific pack
            console.log(chalk.blue(`👥 Roles in pack "${packId}":`));
            console.log();

            const packInfo = packLoader.getPack(packId);
            if (!packInfo) {
              console.error(chalk.red(`Pack "${packId}" not found.`));
              process.exit(1);
            }

            const personas = packInfo.pack.personas || {};
            const roleNames = Object.keys(personas);

            if (roleNames.length === 0) {
              console.log(chalk.yellow(`No roles found in pack "${packId}"`));
              return;
            }

            roleNames.forEach((roleName, index) => {
              const role = personas[roleName];
              const prefix = index === roleNames.length - 1 ? '└─' : '├─';
              
              console.log(chalk.cyan(`${prefix} ${roleName}`));
              
              if (options.verbose && role) {
                if (role.name) {
                  console.log(chalk.gray(`   Name: ${role.name}`));
                }
                if (role.description) {
                  console.log(chalk.gray(`   Description: ${role.description}`));
                }
                if (role.maskedFields && role.maskedFields.length > 0) {
                  console.log(chalk.gray(`   Masked Fields: ${role.maskedFields.join(', ')}`));
                }
              }
              
              if (index < roleNames.length - 1) {
                console.log();
              }
            });

            console.log();
            console.log(chalk.gray(`Total: ${roleNames.length} roles`));

          } else {
            // List all roles from all packs
            console.log(chalk.blue('👥 Available Roles (All Packs):'));
            console.log();

            const allPacks = packLoader.getAllPacks();
            const allRoles = new Set<string>();

            allPacks.forEach(packInfo => {
              const personas = packInfo.pack.personas || {};
              Object.keys(personas).forEach(roleName => {
                allRoles.add(roleName);
              });
            });

            if (allRoles.size === 0) {
              console.log(chalk.yellow('No roles found in any pack'));
              return;
            }

            const roleArray = Array.from(allRoles).sort();
            roleArray.forEach((roleName, index) => {
              const prefix = index === roleArray.length - 1 ? '└─' : '├─';
              console.log(chalk.cyan(`${prefix} ${roleName}`));

              if (options.verbose) {
                // Show which packs have this role
                const packsWithRole = allPacks.filter(pack => 
                  pack.pack.personas && pack.pack.personas[roleName]
                );
                const packNames = packsWithRole.map(pack => pack.id);
                console.log(chalk.gray(`   Available in: ${packNames.join(', ')}`));
              }
            });

            console.log();
            console.log(chalk.gray(`Total: ${allRoles.size} unique roles`));
            console.log(chalk.gray('Use "synthkit generate --role <name>" to generate with specific role'));
          }

        } catch (error) {
          console.error(chalk.red('Error:'), error.message);
          process.exit(1);
        }
      })
  );
