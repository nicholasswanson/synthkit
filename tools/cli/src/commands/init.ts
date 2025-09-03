import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';

export const initCommand = new Command('init')
  .description('Initialize a new Synthkit project')
  .option('-d, --dir <directory>', 'Target directory', '.')
  .option('-t, --template <template>', 'Project template', 'basic')
  .option('-f, --force', 'Overwrite existing files')
  .action(async (options) => {
    console.log(chalk.blue('🚀 Initializing Synthkit project...'));

    const targetDir = path.resolve(options.dir);
    const configPath = path.join(targetDir, 'synth.config.json');
    const packsDir = path.join(targetDir, 'packs');

    // Check if config already exists
    if (await fs.pathExists(configPath) && !options.force) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'Synthkit config already exists. Overwrite?',
          default: false
        }
      ]);

      if (!overwrite) {
        console.log(chalk.yellow('⚠️ Initialization cancelled'));
        return;
      }
    }

    // Gather project information
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: path.basename(targetDir)
      },
      {
        type: 'list',
        name: 'framework',
        message: 'Framework:',
        choices: ['Next.js', 'React', 'Vue', 'Vanilla JS'],
        default: 'Next.js'
      },
      {
        type: 'checkbox',
        name: 'packs',
        message: 'Select starter packs:',
        choices: [
          { name: 'Core (users, auth)', value: 'core' },
          { name: 'SaaS (subscriptions, billing)', value: 'saas' },
          { name: 'E-commerce (products, orders)', value: 'ecomm' }
        ],
        default: ['core']
      }
    ]);

    // Create directory structure
    await fs.ensureDir(targetDir);
    await fs.ensureDir(packsDir);

    // Create synth.config.json
    const config = {
      name: answers.projectName,
      framework: answers.framework.toLowerCase().replace('.js', ''),
      packs: answers.packs,
      scenarios: {
        default: {
          pack: answers.packs[0] || 'core',
          scenario: 'development'
        }
      },
      generators: {
        locale: 'en-US',
        dateFormat: 'ISO'
      },
      msw: {
        enabled: true,
        handlers: {
          delay: 100
        }
      }
    };

    await fs.writeJSON(configPath, config, { spaces: 2 });

    // Create starter packs
    for (const packName of answers.packs) {
      await createStarterPack(packsDir, packName);
    }

    // Framework-specific setup
    if (answers.framework === 'Next.js') {
      await setupNextJS(targetDir);
    }

    console.log(chalk.green('✅ Synthkit project initialized!'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log(chalk.gray('1. Install dependencies: npm install'));
    console.log(chalk.gray('2. Start development: npm run dev'));
    console.log(chalk.gray('3. Open browser and test mock data'));
  });

async function createStarterPack(packsDir: string, packName: string) {
  const packDir = path.join(packsDir, packName);
  await fs.ensureDir(packDir);

  let packConfig;
  
  switch (packName) {
    case 'core':
      packConfig = {
        name: 'Core Pack',
        version: '1.0.0',
        description: 'Basic user and authentication schemas',
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
          development: {
            name: 'Development',
            description: 'Small dataset for development',
            generators: {
              user: { count: 5 }
            }
          }
        },
        personas: {
          admin: {
            name: 'Admin User',
            overrides: {
              user: { role: 'admin' }
            }
          }
        },
        routes: {
          '/api/users': {
            schema: 'user',
            rest: true
          }
        }
      };
      break;

    case 'saas':
      packConfig = {
        name: 'SaaS Pack',
        version: '1.0.0',
        description: 'SaaS application schemas',
        schemas: {
          subscription: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              userId: { type: 'string', format: 'uuid' },
              plan: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
              status: { type: 'string', enum: ['active', 'cancelled', 'expired'] },
              amount: { type: 'number', minimum: 0 },
              billingCycle: { type: 'string', enum: ['monthly', 'yearly'] }
            }
          }
        },
        routes: {
          '/api/subscriptions': {
            schema: 'subscription',
            rest: true
          }
        }
      };
      break;

    case 'ecomm':
      packConfig = {
        name: 'E-commerce Pack',
        version: '1.0.0',
        description: 'E-commerce schemas',
        schemas: {
          product: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', faker: 'commerce.productName' },
              price: { type: 'number', faker: 'commerce.price' },
              category: { type: 'string', faker: 'commerce.department' },
              inStock: { type: 'boolean' }
            }
          }
        },
        routes: {
          '/api/products': {
            schema: 'product',
            rest: true
          }
        }
      };
      break;

    default:
      packConfig = { name: packName, schemas: {}, routes: {} };
  }

  await fs.writeJSON(path.join(packDir, 'pack.json'), packConfig, { spaces: 2 });
}

async function setupNextJS(targetDir: string) {
  const nextConfigPath = path.join(targetDir, 'next.config.js');
  
  if (await fs.pathExists(nextConfigPath)) {
    console.log(chalk.yellow('⚠️ next.config.js exists - please add withSynth manually'));
    return;
  }

  const nextConfig = `const { withSynth } = require('@synthkit/client');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withSynth(nextConfig, {
  enabled: process.env.NODE_ENV === 'development',
  packs: ['packs/core'],
  defaultScenario: 'development'
});
`;

  await fs.writeFile(nextConfigPath, nextConfig);
}