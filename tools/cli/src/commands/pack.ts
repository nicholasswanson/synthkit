import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { loadConfig } from '../utils/config-loader';
import { getPackLoader } from '../utils/pack-loader';
import { ValidationUtils } from '../utils/validation';

export const packCommand = new Command('pack')
  .description('Pack management operations')
  .addCommand(
    new Command('validate')
      .description('Validate pack structure and schemas')
      .argument('[pack-path]', 'Path to pack directory (optional, validates all if not specified)')
      .option('-v, --verbose', 'Show detailed validation information')
      .option('-f, --fix', 'Attempt to fix common issues automatically')
      .option('--strict', 'Use strict validation rules')
      .action(async (packPath?: string, options = {}) => {
        try {
          console.log(chalk.blue('🔍 Validating pack structure...'));
          console.log();

          let packsToValidate: string[] = [];

          if (packPath) {
            // Validate specific pack
            const resolvedPath = path.resolve(packPath);
            if (!await fs.pathExists(resolvedPath)) {
              console.error(chalk.red(`Pack directory not found: ${resolvedPath}`));
              process.exit(1);
            }
            packsToValidate = [resolvedPath];
          } else {
            // Validate all packs in project
            try {
              await loadConfig();
            } catch (error) {
              // If no config, try to discover packs anyway
            }
            
            const packLoader = getPackLoader();
            try {
              const discoveredPacks = await packLoader.discoverPacks(['packs/*', '../packs/*']);
              packsToValidate = discoveredPacks.map(pack => pack.path);
              
              if (packsToValidate.length === 0) {
                console.log(chalk.yellow('No packs found to validate.'));
                console.log(chalk.gray('Make sure you\'re in a Synthkit project directory.'));
                return;
              }
            } catch (error) {
              console.error(chalk.red('Failed to discover packs:'), error.message);
              process.exit(1);
            }
          }

          let totalErrors = 0;
          let totalWarnings = 0;
          const results: ValidationResult[] = [];

          for (const packDir of packsToValidate) {
            const result = await validateSinglePack(packDir, options);
            results.push(result);
            totalErrors += result.errors.length;
            totalWarnings += result.warnings.length;

            // Display results for this pack
            displayPackValidationResult(result, options.verbose);
          }

          // Summary
          console.log();
          console.log(chalk.blue('📊 Validation Summary'));
          console.log('─'.repeat(50));
          
          if (totalErrors === 0 && totalWarnings === 0) {
            console.log(chalk.green('✅ All packs are valid!'));
          } else {
            if (totalErrors > 0) {
              console.log(chalk.red(`❌ ${totalErrors} error(s) found`));
            }
            if (totalWarnings > 0) {
              console.log(chalk.yellow(`⚠️  ${totalWarnings} warning(s) found`));
            }
          }

          console.log(chalk.gray(`📦 Validated ${results.length} pack(s)`));

          // Exit with error code if validation failed
          if (totalErrors > 0) {
            process.exit(1);
          }

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('create')
      .description('Create a new pack from template')
      .argument('<pack-name>', 'Name of the new pack')
      .option('-t, --template <template>', 'Pack template (basic, saas, ecommerce)', 'basic')
      .option('-d, --dir <directory>', 'Target directory', './packs')
      .action(async (packName: string, options = {}) => {
        try {
          console.log(chalk.blue(`🎭 Creating new pack: ${packName}`));
          
          const packDir = path.resolve(options.dir, packName);
          
          if (await fs.pathExists(packDir)) {
            console.error(chalk.red(`Pack directory already exists: ${packDir}`));
            process.exit(1);
          }

          await createPackFromTemplate(packName, packDir, options.template);
          
          console.log(chalk.green('✅ Pack created successfully!'));
          console.log(chalk.cyan('Next steps:'));
          console.log(chalk.gray(`   cd ${path.relative(process.cwd(), packDir)}`));
          console.log(chalk.gray('   synthkit pack validate'));
          console.log(chalk.gray('   Edit pack.json to customize schemas'));

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('info')
      .description('Show detailed information about a pack')
      .argument('<pack-path>', 'Path to pack directory')
      .action(async (packPath: string) => {
        try {
          const resolvedPath = path.resolve(packPath);
          const packJsonPath = path.join(resolvedPath, 'pack.json');
          
          if (!await fs.pathExists(packJsonPath)) {
            console.error(chalk.red(`Pack not found: ${packJsonPath}`));
            process.exit(1);
          }

          const packData = await fs.readJSON(packJsonPath);
          
          console.log(chalk.blue('📦 Pack Information'));
          console.log('─'.repeat(50));
          console.log(chalk.cyan('Name:'), packData.name || 'Unknown');
          console.log(chalk.cyan('ID:'), packData.id || 'Unknown');
          console.log(chalk.cyan('Version:'), packData.version || 'Unknown');
          console.log(chalk.cyan('Description:'), packData.description || 'No description');
          console.log(chalk.cyan('Path:'), resolvedPath);
          
          if (packData.schemas) {
            const schemaCount = Object.keys(packData.schemas).length;
            console.log(chalk.cyan('Schemas:'), `${schemaCount} defined`);
            if (schemaCount > 0) {
              Object.keys(packData.schemas).forEach(schema => {
                console.log(chalk.gray(`  - ${schema}`));
              });
            }
          }

          if (packData.scenarios) {
            const scenarioCount = Object.keys(packData.scenarios).length;
            console.log(chalk.cyan('Scenarios:'), `${scenarioCount} defined`);
            if (scenarioCount > 0) {
              Object.keys(packData.scenarios).forEach(scenario => {
                console.log(chalk.gray(`  - ${scenario}`));
              });
            }
          }

          if (packData.personas) {
            const personaCount = Object.keys(packData.personas).length;
            console.log(chalk.cyan('Roles:'), `${personaCount} defined`);
            if (personaCount > 0) {
              Object.keys(packData.personas).forEach(persona => {
                console.log(chalk.gray(`  - ${persona}`));
              });
            }
          }

          if (packData.routes) {
            const routeCount = Object.keys(packData.routes).length;
            console.log(chalk.cyan('Routes:'), `${routeCount} defined`);
            if (routeCount > 0) {
              Object.keys(packData.routes).forEach(route => {
                console.log(chalk.gray(`  - ${route}`));
              });
            }
          }

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  );

interface ValidationResult {
  packPath: string;
  packName: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

async function validateSinglePack(packPath: string, options: any): Promise<ValidationResult> {
  const result: ValidationResult = {
    packPath,
    packName: path.basename(packPath),
    valid: true,
    errors: [],
    warnings: [],
    info: []
  };

  try {
    // Check if pack.json exists
    const packJsonPath = path.join(packPath, 'pack.json');
    if (!await fs.pathExists(packJsonPath)) {
      result.errors.push('pack.json file not found');
      result.valid = false;
      return result;
    }

    // Load and validate pack.json
    let packData;
    try {
      packData = await fs.readJSON(packJsonPath);
    } catch (error) {
      result.errors.push('pack.json is not valid JSON');
      result.valid = false;
      return result;
    }

    // Validate pack structure using existing validation
    const structureValidation = ValidationUtils.validatePackStructure(packData);
    result.errors.push(...structureValidation.errors);
    result.warnings.push(...structureValidation.warnings);

    // Additional pack-specific validations
    await validatePackGovernance(packData, result, options);
    await validatePackSchemas(packData, result, options);
    await validatePackScenarios(packData, result, options);
    await validatePackPersonas(packData, result, options);
    await validatePackRoutes(packData, result, options);

    // Check file structure
    await validatePackFileStructure(packPath, result);

    result.valid = result.errors.length === 0;

  } catch (error) {
    result.errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.valid = false;
  }

  return result;
}

async function validatePackGovernance(packData: any, result: ValidationResult, options: any) {
  // Check required fields
  const requiredFields = ['id', 'name', 'version', 'schemas'];
  requiredFields.forEach(field => {
    if (!packData[field]) {
      result.errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate ID format (lowercase, alphanumeric, hyphens)
  if (packData.id && !/^[a-z0-9-]+$/.test(packData.id)) {
    result.errors.push('Pack ID must contain only lowercase letters, numbers, and hyphens');
  }

  // Validate version format
  if (packData.version && !/^\d+\.\d+\.\d+/.test(packData.version)) {
    result.warnings.push('Version should follow semantic versioning (e.g., 1.0.0)');
  }

  // Check description length
  if (packData.description && packData.description.length > 200) {
    result.warnings.push('Description is quite long (>200 chars), consider shortening');
  }

  if (!packData.description) {
    result.warnings.push('Pack description is missing');
  }
}

async function validatePackSchemas(packData: any, result: ValidationResult, options: any) {
  if (!packData.schemas || typeof packData.schemas !== 'object') {
    result.errors.push('Schemas object is missing or invalid');
    return;
  }

  const schemaNames = Object.keys(packData.schemas);
  if (schemaNames.length === 0) {
    result.warnings.push('No schemas defined in pack');
    return;
  }

  schemaNames.forEach(schemaName => {
    const schema = packData.schemas[schemaName];
    
    // Validate schema name format
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(schemaName)) {
      result.errors.push(`Invalid schema name "${schemaName}": must start with letter and contain only letters, numbers, underscores`);
    }

    // Validate schema structure
    if (!schema || typeof schema !== 'object') {
      result.errors.push(`Schema "${schemaName}" is not a valid object`);
      return;
    }

    // Check for required JSON Schema fields
    if (!schema.type) {
      result.errors.push(`Schema "${schemaName}" missing type field`);
    }

    if (schema.type === 'object' && !schema.properties) {
      result.warnings.push(`Schema "${schemaName}" has no properties defined`);
    }

    // Validate properties
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([propName, prop]: [string, any]) => {
        if (!prop || typeof prop !== 'object') {
          result.errors.push(`Property "${propName}" in schema "${schemaName}" is invalid`);
          return;
        }

        if (!prop.type) {
          result.warnings.push(`Property "${propName}" in schema "${schemaName}" missing type`);
        }

        // Check for faker integration
        if (prop.faker) {
          result.info.push(`Schema "${schemaName}.${propName}" uses faker: ${prop.faker}`);
        }
      });
    }

    // Check for required fields
    if (schema.required && Array.isArray(schema.required)) {
      schema.required.forEach((field: string) => {
        if (!schema.properties || !schema.properties[field]) {
          result.errors.push(`Required field "${field}" in schema "${schemaName}" is not defined in properties`);
        }
      });
    }
  });
}

async function validatePackScenarios(packData: any, result: ValidationResult, options: any) {
  if (!packData.scenarios) {
    result.warnings.push('No scenarios defined in pack');
    return;
  }

  if (typeof packData.scenarios !== 'object') {
    result.errors.push('Scenarios must be an object');
    return;
  }

  const scenarioNames = Object.keys(packData.scenarios);
  const expectedScenarios = ['early', 'growth', 'enterprise'];
  
  expectedScenarios.forEach(expected => {
    if (!scenarioNames.includes(expected)) {
      result.warnings.push(`Missing recommended scenario: ${expected}`);
    }
  });

  scenarioNames.forEach(scenarioName => {
    const scenario = packData.scenarios[scenarioName];
    
    if (!scenario || typeof scenario !== 'object') {
      result.errors.push(`Scenario "${scenarioName}" is not a valid object`);
      return;
    }

    if (!scenario.id) {
      result.errors.push(`Scenario "${scenarioName}" missing id field`);
    }

    if (!scenario.name) {
      result.warnings.push(`Scenario "${scenarioName}" missing name field`);
    }

    if (scenario.config && scenario.config.volume) {
      const volume = scenario.config.volume;
      Object.entries(volume).forEach(([key, value]) => {
        if (typeof value !== 'number' || value < 0) {
          result.errors.push(`Invalid volume "${key}" in scenario "${scenarioName}": must be a positive number`);
        }
      });
    }
  });
}

async function validatePackPersonas(packData: any, result: ValidationResult, options: any) {
  if (!packData.personas) {
    result.warnings.push('No personas/roles defined in pack');
    return;
  }

  if (typeof packData.personas !== 'object') {
    result.errors.push('Personas must be an object');
    return;
  }

  const personaNames = Object.keys(packData.personas);
  const recommendedPersonas = ['admin', 'support'];
  
  recommendedPersonas.forEach(recommended => {
    if (!personaNames.includes(recommended)) {
      result.warnings.push(`Missing recommended persona: ${recommended}`);
    }
  });

  personaNames.forEach(personaName => {
    const persona = packData.personas[personaName];
    
    if (!persona || typeof persona !== 'object') {
      result.errors.push(`Persona "${personaName}" is not a valid object`);
      return;
    }

    if (!persona.id) {
      result.errors.push(`Persona "${personaName}" missing id field`);
    }

    if (!persona.name) {
      result.warnings.push(`Persona "${personaName}" missing name field`);
    }

    // Validate maskedFields if present
    if (persona.maskedFields && !Array.isArray(persona.maskedFields)) {
      result.errors.push(`Persona "${personaName}" maskedFields must be an array`);
    }
  });
}

async function validatePackRoutes(packData: any, result: ValidationResult, options: any) {
  if (!packData.routes) {
    result.warnings.push('No routes defined in pack');
    return;
  }

  if (typeof packData.routes !== 'object') {
    result.errors.push('Routes must be an object');
    return;
  }

  Object.entries(packData.routes).forEach(([routePath, route]: [string, any]) => {
    if (!route || typeof route !== 'object') {
      result.errors.push(`Route "${routePath}" is not a valid object`);
      return;
    }

    if (!route.schema) {
      result.errors.push(`Route "${routePath}" missing schema field`);
    } else if (!packData.schemas || !packData.schemas[route.schema]) {
      result.errors.push(`Route "${routePath}" references unknown schema: ${route.schema}`);
    }

    // Validate route path format
    if (!routePath.startsWith('/')) {
      result.warnings.push(`Route "${routePath}" should start with /`);
    }
  });
}

async function validatePackFileStructure(packPath: string, result: ValidationResult) {
  // Check for common files
  const optionalFiles = ['README.md', 'CHANGELOG.md', '.gitignore'];
  
  for (const file of optionalFiles) {
    const filePath = path.join(packPath, file);
    if (await fs.pathExists(filePath)) {
      result.info.push(`Found optional file: ${file}`);
    }
  }

  // Check for package.json if it's a JavaScript pack
  const packageJsonPath = path.join(packPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    result.info.push('Pack includes package.json (JavaScript pack)');
  }
}

function displayPackValidationResult(result: ValidationResult, verbose: boolean) {
  const status = result.valid 
    ? chalk.green('✅ VALID') 
    : chalk.red('❌ INVALID');
  
  console.log(`${status} ${chalk.cyan(result.packName)} ${chalk.gray(`(${result.packPath})`)}`);

  if (result.errors.length > 0) {
    result.errors.forEach(error => {
      console.log(chalk.red(`  ❌ ${error}`));
    });
  }

  if (result.warnings.length > 0) {
    result.warnings.forEach(warning => {
      console.log(chalk.yellow(`  ⚠️  ${warning}`));
    });
  }

  if (verbose && result.info.length > 0) {
    result.info.forEach(info => {
      console.log(chalk.blue(`  ℹ️  ${info}`));
    });
  }

  console.log();
}

async function createPackFromTemplate(packName: string, packDir: string, template: string) {
  await fs.ensureDir(packDir);

  let packConfig;
  
  switch (template) {
    case 'saas':
      packConfig = {
        id: packName,
        name: `${packName.charAt(0).toUpperCase() + packName.slice(1)} SaaS Pack`,
        version: '1.0.0',
        description: 'SaaS business model with subscriptions and billing',
        schemas: {
          subscription: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              userId: { type: 'string', format: 'uuid' },
              plan: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
              status: { type: 'string', enum: ['active', 'cancelled', 'expired'] },
              amount: { type: 'number', minimum: 0 },
              billingCycle: { type: 'string', enum: ['monthly', 'yearly'] },
              createdAt: { type: 'string', format: 'date-time' }
            },
            required: ['id', 'userId', 'plan', 'status', 'createdAt']
          }
        },
        scenarios: {
          early: {
            id: 'early',
            name: 'Early Stage',
            description: 'Startup with basic subscriptions',
            config: { id: 123, volume: { subscription: 50 } }
          },
          growth: {
            id: 'growth', 
            name: 'Growth Stage',
            description: 'Scaling SaaS business',
            config: { id: 456, volume: { subscription: 500 } }
          },
          enterprise: {
            id: 'enterprise',
            name: 'Enterprise Stage', 
            description: 'Large-scale SaaS platform',
            config: { id: 789, volume: { subscription: 5000 } }
          }
        },
        personas: {
          admin: {
            id: 'admin',
            name: 'Administrator',
            description: 'Full access to all data',
            maskedFields: []
          },
          support: {
            id: 'support',
            name: 'Support Agent',
            description: 'Customer support with masked financial data',
            maskedFields: ['amount']
          }
        },
        routes: {
          '/api/subscriptions': { schema: 'subscription', rest: true }
        }
      };
      break;

    case 'ecommerce':
      packConfig = {
        id: packName,
        name: `${packName.charAt(0).toUpperCase() + packName.slice(1)} E-commerce Pack`,
        version: '1.0.0',
        description: 'E-commerce platform with products and orders',
        schemas: {
          product: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', faker: 'commerce.productName' },
              price: { type: 'number', faker: 'commerce.price' },
              category: { type: 'string', faker: 'commerce.department' },
              inStock: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' }
            },
            required: ['id', 'name', 'price', 'createdAt']
          }
        },
        scenarios: {
          early: {
            id: 'early',
            name: 'Early Stage',
            description: 'Small product catalog',
            config: { id: 123, volume: { product: 100 } }
          },
          growth: {
            id: 'growth',
            name: 'Growth Stage', 
            description: 'Expanding product range',
            config: { id: 456, volume: { product: 1000 } }
          },
          enterprise: {
            id: 'enterprise',
            name: 'Enterprise Stage',
            description: 'Large marketplace',
            config: { id: 789, volume: { product: 10000 } }
          }
        },
        personas: {
          admin: {
            id: 'admin',
            name: 'Administrator',
            description: 'Full access to all data',
            maskedFields: []
          },
          support: {
            id: 'support',
            name: 'Support Agent', 
            description: 'Customer support with masked pricing',
            maskedFields: ['price']
          }
        },
        routes: {
          '/api/products': { schema: 'product', rest: true }
        }
      };
      break;

    default: // basic
      packConfig = {
        id: packName,
        name: `${packName.charAt(0).toUpperCase() + packName.slice(1)} Pack`,
        version: '1.0.0',
        description: 'Basic pack with user management',
        schemas: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', faker: 'person.fullName' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string', enum: ['admin', 'user'] },
              createdAt: { type: 'string', format: 'date-time' }
            },
            required: ['id', 'name', 'email', 'role', 'createdAt']
          }
        },
        scenarios: {
          early: {
            id: 'early',
            name: 'Early Stage',
            description: 'Small user base',
            config: { id: 123, volume: { user: 25 } }
          },
          growth: {
            id: 'growth',
            name: 'Growth Stage',
            description: 'Growing user base', 
            config: { id: 456, volume: { user: 250 } }
          },
          enterprise: {
            id: 'enterprise',
            name: 'Enterprise Stage',
            description: 'Large user base',
            config: { id: 789, volume: { user: 2500 } }
          }
        },
        personas: {
          admin: {
            id: 'admin',
            name: 'Administrator',
            description: 'Full administrative access',
            maskedFields: []
          },
          support: {
            id: 'support',
            name: 'Support Agent',
            description: 'Customer support access',
            maskedFields: []
          }
        },
        routes: {
          '/api/users': { schema: 'user', rest: true }
        }
      };
  }

  await fs.writeJSON(path.join(packDir, 'pack.json'), packConfig, { spaces: 2 });

  // Create README
  const readme = `# ${packConfig.name}

${packConfig.description}

## Schemas

${Object.keys(packConfig.schemas).map(schema => `- **${schema}**: ${packConfig.schemas[schema].description || 'No description'}`).join('\n')}

## Usage

\`\`\`bash
# Generate data from this pack
synthkit generate --category ${packName} --count 50

# List schemas in this pack  
synthkit list schemas ${packName}

# Validate this pack
synthkit pack validate ${packDir}
\`\`\`

## Scenarios

${Object.keys(packConfig.scenarios).map(scenario => `- **${scenario}**: ${packConfig.scenarios[scenario].description}`).join('\n')}

## Roles

${Object.keys(packConfig.personas).map(persona => `- **${persona}**: ${packConfig.personas[persona].description}`).join('\n')}
`;

  await fs.writeFile(path.join(packDir, 'README.md'), readme);
}
