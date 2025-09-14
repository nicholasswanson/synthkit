import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import clipboardy from 'clipboardy';
import fs from 'fs-extra';
import path from 'path';
// Using built-in fetch (Node 18+)

interface DatasetCreateOptions {
  category?: string;
  role?: string;
  stage?: string;
  id?: number;
  output?: string;
  copy?: boolean;
  baseUrl?: string;
}

interface DatasetFetchOptions {
  output?: string;
  preview?: number;
  info?: boolean;
}

interface DatasetIntegrateOptions {
  tool?: string;
  framework?: string;
  output?: string;
  rules?: boolean;
}

// Default base URL - can be overridden
const DEFAULT_BASE_URL = process.env.SYNTHKIT_BASE_URL || 'https://nicholasswanson.github.io/synthkit';

export const datasetCommand = new Command('dataset')
  .description('Dataset URL generation and management')
  
  // Create dataset URL from scenario parameters
  .addCommand(
    new Command('url')
      .description('Generate a shareable dataset URL from scenario parameters')
      .option('-c, --category <category>', 'Business category (e.g., modaic, stratus, forksy)')
      .option('-r, --role <role>', 'Access role (admin, support)', 'admin')
      .option('-s, --stage <stage>', 'Business stage (early, growth, enterprise)', 'growth')
      .option('--id <id>', 'Deterministic generation ID', '12345')
      .option('--base-url <url>', 'Base URL for dataset API', DEFAULT_BASE_URL)
      .option('--copy', 'Copy URL to clipboard')
      .action(async (options: DatasetCreateOptions) => {
        try {
          console.log(chalk.blue('🔗 Generating dataset URL...'));

          // Interactive prompts if options not provided
          const answers = await promptForMissingOptions(options);
          const config = { ...options, ...answers };

          // Generate the dataset URL (deterministic for scenarios)
          const datasetId = `scenario-${config.category}-${config.role}-${config.stage}-${config.id}`;
          const datasetUrl = `${config.baseUrl}/datasets/${datasetId}.json`;
          
          console.log();
          console.log(chalk.green('✅ Dataset URL generated:'));
          console.log();
          console.log(chalk.cyan(datasetUrl));

          // Copy to clipboard if requested
          if (config.copy) {
            try {
              await clipboardy.write(datasetUrl);
              console.log(chalk.gray('📋 URL copied to clipboard'));
            } catch (error) {
              console.log(chalk.yellow('⚠️ Could not copy to clipboard'));
            }
          }

          // Show dataset preview
          console.log();
          console.log(chalk.blue('📊 Dataset Preview:'));
          console.log(chalk.gray(`  Category: ${config.category} (${getCategoryDescription(config.category)})`));
          console.log(chalk.gray(`  Role: ${config.role}`));
          console.log(chalk.gray(`  Stage: ${config.stage}`));
          console.log(chalk.gray(`  ID: ${config.id}`));
          
          // Estimate data volumes
          const volumes = estimateDataVolumes(config);
          console.log(chalk.gray(`  Expected: ~${volumes.customers.toLocaleString()} customers, ~${volumes.payments.toLocaleString()} payments`));

          console.log();
          console.log(chalk.cyan('💡 Next Steps:'));
          console.log(chalk.gray(`  Fetch data: synthkit dataset fetch "${datasetUrl}"`));
          console.log(chalk.gray(`  Get integration: synthkit dataset integrate "${datasetUrl}" --tool cursor`));
          console.log(chalk.gray(`  Use in browser: open "${datasetUrl}"`));

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  )
  
  // Fetch and preview dataset from URL
  .addCommand(
    new Command('fetch')
      .description('Fetch and preview dataset from URL')
      .argument('<url>', 'Dataset URL to fetch')
      .option('-o, --output <path>', 'Save dataset to file')
      .option('--preview <count>', 'Number of records to preview', '5')
      .option('--info', 'Show only metadata (no data preview)')
      .action(async (url: string, options: DatasetFetchOptions) => {
        try {
          console.log(chalk.blue('📥 Fetching dataset...'));
          
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const dataset = await response.json() as any;
          
          console.log(chalk.green('✅ Dataset fetched successfully'));
          console.log();

          // Show dataset info
          console.log(chalk.blue('📊 Dataset Info:'));
          console.log(chalk.gray(`  Type: ${dataset.type || 'Unknown'}`));
          console.log(chalk.gray(`  Created: ${dataset.metadata?.createdAt ? new Date(dataset.metadata.createdAt).toLocaleDateString() : 'Unknown'}`));
          
          if (dataset.metadata?.scenario) {
            const s = dataset.metadata.scenario;
            console.log(chalk.gray(`  Scenario: ${s.category} (${s.role}, ${s.stage}, ID: ${s.id})`));
          }
          
          if (dataset.metadata?.aiAnalysis) {
            console.log(chalk.gray(`  AI Generated: "${dataset.metadata.aiAnalysis.prompt?.substring(0, 60)}..."`));
          }

          // Show data counts
          if (dataset.data) {
            console.log();
            console.log(chalk.blue('📈 Data Summary:'));
            Object.entries(dataset.data).forEach(([key, value]: [string, any]) => {
              if (Array.isArray(value)) {
                console.log(chalk.gray(`  ${key}: ${value.length.toLocaleString()} records`));
              } else if (typeof value === 'object' && value !== null) {
                console.log(chalk.gray(`  ${key}: ${Object.keys(value).length} properties`));
              }
            });
          }

          // Preview data if not info-only
          if (!options.info && dataset.data) {
            const previewCount = parseInt(options.preview || '5');
            
            if (dataset.data.customers?.length > 0) {
              console.log();
              console.log(chalk.blue(`👥 Customer Preview (${Math.min(previewCount, dataset.data.customers.length)} of ${dataset.data.customers.length}):`));
              dataset.data.customers.slice(0, previewCount).forEach((customer: any, i: number) => {
                console.log(chalk.gray(`  ${i + 1}. ${customer.name || customer.id} (${customer.email || 'no email'}) - ${customer.loyaltyTier || 'no tier'}`));
              });
            }
            
            if (dataset.data.payments?.length > 0) {
              console.log();
              console.log(chalk.blue(`💳 Payment Preview (${Math.min(previewCount, dataset.data.payments.length)} of ${dataset.data.payments.length}):`));
              dataset.data.payments.slice(0, previewCount).forEach((payment: any, i: number) => {
                const amount = typeof payment.amount === 'number' ? `$${payment.amount.toFixed(2)}` : payment.amount;
                console.log(chalk.gray(`  ${i + 1}. ${amount} - ${payment.status} (${payment.paymentMethod})`));
              });
            }

            if (dataset.data.businessMetrics) {
              console.log();
              console.log(chalk.blue('📊 Business Metrics:'));
              const metrics = dataset.data.businessMetrics;
              if (metrics.customerLifetimeValue) console.log(chalk.gray(`  CLV: $${metrics.customerLifetimeValue.toFixed(2)}`));
              if (metrics.averageOrderValue) console.log(chalk.gray(`  AOV: $${metrics.averageOrderValue.toFixed(2)}`));
              if (metrics.monthlyRecurringRevenue) console.log(chalk.gray(`  MRR: $${metrics.monthlyRecurringRevenue.toFixed(2)}`));
              if (metrics.dailyActiveUsers) console.log(chalk.gray(`  DAU: ${metrics.dailyActiveUsers.toLocaleString()}`));
              if (metrics.conversionRate) console.log(chalk.gray(`  Conversion: ${metrics.conversionRate.toFixed(2)}%`));
            }
          }

          // Save to file if requested
          if (options.output) {
            await fs.ensureDir(path.dirname(options.output));
            await fs.writeFile(options.output, JSON.stringify(dataset, null, 2));
            console.log();
            console.log(chalk.green(`💾 Dataset saved to: ${options.output}`));
          }

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  )
  
  // Generate integration code for dataset
  .addCommand(
    new Command('integrate')
      .description('Generate integration code for a dataset')
      .argument('<url>', 'Dataset URL')
      .option('-t, --tool <tool>', 'Target tool (cursor, claude, chatgpt, v0, fetch)', 'cursor')
      .option('-f, --framework <framework>', 'Target framework (react, nextjs, vanilla)', 'react')
      .option('-o, --output <path>', 'Output file path')
      .option('--rules', 'Generate .cursorrules file (for cursor tool)')
      .action(async (url: string, options: DatasetIntegrateOptions) => {
        try {
          console.log(chalk.blue(`🔧 Generating ${options.tool} integration...`));
          
          // Extract dataset ID from URL
          const datasetId = extractDatasetId(url);
          if (!datasetId) {
            throw new Error('Could not extract dataset ID from URL');
          }

          // Get base URL from the dataset URL
          const baseUrl = url.replace(`/datasets/${datasetId}.json`, '');
          
          // Fetch integration code from API
          const integrationUrl = `${baseUrl}/api/dataset/${datasetId}/integrate?tool=${options.tool}${options.rules ? '&format=rules' : ''}`;
          
          const response = await fetch(integrationUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const integration = await response.json() as any;
          
          console.log(chalk.green(`✅ ${integration.tool} integration generated`));
          console.log();

          // Show integration info
          console.log(chalk.blue('📝 Integration Details:'));
          console.log(chalk.gray(`  Tool: ${integration.tool}`));
          console.log(chalk.gray(`  Description: ${integration.description}`));
          
          if (options.rules && integration.content) {
            // Handle .cursorrules content
            const content = integration.content;
            
            if (options.output) {
              await fs.writeFile(options.output, content);
              console.log(chalk.green(`✅ .cursorrules saved to: ${options.output}`));
            } else {
              // Save to current directory
              await fs.writeFile('.cursorrules', content);
              console.log(chalk.green('✅ .cursorrules saved to current directory'));
            }
            
            console.log();
            console.log(chalk.cyan('💡 Next Steps:'));
            console.log(chalk.gray('  1. The .cursorrules file has been added to your project'));
            console.log(chalk.gray('  2. Restart Cursor to load the new rules'));
            console.log(chalk.gray('  3. Ask Cursor to help integrate the dataset'));
            
          } else {
            // Handle regular integration code
            const code = integration.copyText || integration.code;
            
            if (options.output) {
              const ext = path.extname(options.output) || (options.tool === 'cursor' ? '.tsx' : '.txt');
              const outputPath = options.output.endsWith(ext) ? options.output : options.output + ext;
              
              await fs.ensureDir(path.dirname(outputPath));
              await fs.writeFile(outputPath, code);
              console.log(chalk.green(`✅ Integration code saved to: ${outputPath}`));
            } else {
              console.log();
              console.log(chalk.blue(`📋 ${integration.tool} Integration Code:`));
              console.log();
              console.log(code);
            }
            
            console.log();
            console.log(chalk.cyan('💡 Instructions:'));
            console.log(chalk.gray(`  ${integration.instructions}`));
          }

        } catch (error) {
          console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
          process.exit(1);
        }
      })
  )
  
  // List available tools and options
  .addCommand(
    new Command('tools')
      .description('List available integration tools and options')
      .action(async () => {
        console.log(chalk.blue('🛠️ Available Integration Tools:'));
        console.log();
        
        const tools = [
          { name: 'cursor', desc: 'AI-powered code editor with context-aware assistance', features: ['React hooks', 'TypeScript', '.cursorrules'] },
          { name: 'claude', desc: 'AI assistant for detailed development guidance', features: ['Comprehensive prompts', 'Business context', 'Best practices'] },
          { name: 'chatgpt', desc: 'AI assistant for quick coding solutions', features: ['Concise prompts', 'Practical solutions', 'Quick setup'] },
          { name: 'v0', desc: 'AI component generator by Vercel', features: ['Component prompts', 'Styling requirements', 'Modern design'] },
          { name: 'fetch', desc: 'Direct JavaScript integration', features: ['DataManager class', 'Caching', 'Utilities'] }
        ];
        
        tools.forEach(tool => {
          console.log(chalk.cyan(`${tool.name}:`));
          console.log(chalk.gray(`  ${tool.desc}`));
          console.log(chalk.gray(`  Features: ${tool.features.join(', ')}`));
          console.log();
        });
        
        console.log(chalk.blue('📋 Usage Examples:'));
        console.log(chalk.gray('  synthkit dataset integrate <url> --tool cursor --rules'));
        console.log(chalk.gray('  synthkit dataset integrate <url> --tool v0 --output component.txt'));
        console.log(chalk.gray('  synthkit dataset integrate <url> --tool fetch --output data-manager.js'));
        console.log();
        
        console.log(chalk.blue('🎯 Business Categories:'));
        const categories = [
          'modaic (Fashion E-commerce)', 'stratus (B2B SaaS)', 'forksy (Food Delivery)',
          'fluxly (Creator Economy)', 'mindora (Online Learning)', 'pulseon (Fitness)',
          'procura (Healthcare)', 'brightfund (Impact Investment)', 'keynest (Real Estate)'
        ];
        categories.forEach(cat => console.log(chalk.gray(`  ${cat}`)));
      })
  );

// Helper functions
async function promptForMissingOptions(options: DatasetCreateOptions) {
  const questions = [];
  
  if (!options.category) {
    questions.push({
      type: 'list',
      name: 'category',
      message: 'Select business category:',
      choices: [
        { name: 'Modaic (Fashion E-commerce)', value: 'modaic' },
        { name: 'Stratus (B2B SaaS)', value: 'stratus' },
        { name: 'Forksy (Food Marketplace)', value: 'forksy' },
        { name: 'Fluxly (Creator Economy)', value: 'fluxly' },
        { name: 'Mindora (Online Learning)', value: 'mindora' },
        { name: 'Pulseon (Fitness Platform)', value: 'pulseon' },
        { name: 'Procura (Healthcare Supply)', value: 'procura' },
        { name: 'Brightfund (Impact Platform)', value: 'brightfund' },
        { name: 'Keynest (Real Estate)', value: 'keynest' }
      ]
    });
  }
  
  if (!options.stage) {
    questions.push({
      type: 'list',
      name: 'stage',
      message: 'Select business stage:',
      choices: [
        { name: 'Early (47-523 records)', value: 'early' },
        { name: 'Growth (1.2K-9.9K records)', value: 'growth' },
        { name: 'Enterprise (12K-988K records)', value: 'enterprise' }
      ]
    });
  }
  
  if (!options.id) {
    questions.push({
      type: 'number',
      name: 'id',
      message: 'Enter deterministic ID (for reproducible data):',
      default: Math.floor(Math.random() * 100000)
    });
  }
  
  return questions.length > 0 ? await inquirer.prompt(questions) : {};
}

function getCategoryDescription(category?: string): string {
  const descriptions: Record<string, string> = {
    modaic: 'Fashion E-commerce',
    stratus: 'B2B SaaS Platform',
    forksy: 'Food Delivery Marketplace',
    fluxly: 'Creator Economy Platform',
    mindora: 'Online Learning Platform',
    pulseon: 'Fitness & Wellness App',
    procura: 'Healthcare Supply Chain',
    brightfund: 'Impact Investment Platform',
    keynest: 'Real Estate Management'
  };
  return descriptions[category || ''] || 'Business Application';
}

function estimateDataVolumes(config: any) {
  const baseVolumes = {
    early: { min: 47, max: 523 },
    growth: { min: 1247, max: 9876 },
    enterprise: { min: 12456, max: 987654 }
  };
  
  const categoryMultipliers: Record<string, number> = {
    modaic: 1.0, stratus: 0.267, forksy: 2.143, fluxly: 0.534, mindora: 0.423,
    pulseon: 0.867, procura: 0.234, brightfund: 0.123, keynest: 0.056
  };
  
  const base = baseVolumes[config.stage as keyof typeof baseVolumes] || baseVolumes.growth;
  const multiplier = categoryMultipliers[config.category] || 1.0;
  
  const customers = Math.floor((base.min + base.max) / 2 * multiplier);
  const payments = Math.floor(customers * 2.3); // Average payment multiplier
  
  return { customers, payments };
}

function extractDatasetId(url: string): string | null {
  const match = url.match(/\/datasets\/([^\/]+)\.json$/);
  return match ? match[1] : null;
}
