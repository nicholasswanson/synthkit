import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
// import { SchemaGenerator } from '@synthkit/sdk';
import { loadConfig } from '../utils/config-loader';
import { getPackLoader } from '../utils/pack-loader';
import { FileUtils } from '../utils/file-utils';
import { ValidationUtils } from '../utils/validation';

interface GenerateOptions {
  category?: string;
  role?: string;
  stage?: string;
  schema?: string;
  count?: number;
  id?: number;
  output?: string;
  format?: string;
  relationships?: boolean;
  pretty?: boolean;
}

export const generateCommand = new Command('generate')
  .description('Generate mock data based on schemas and scenarios')
  .option('-c, --category <category>', 'Business category (e.g., modaic, stratus, forksy)')
  .option('-r, --role <role>', 'Access role (admin, support, user, guest)', 'admin')
  .option('-s, --stage <stage>', 'Business stage (early, growth, enterprise)', 'growth')
  .option('--schema <schema>', 'Specific schema to generate (overrides category)')
  .option('-n, --count <count>', 'Number of records to generate', '10')
  .option('--id <id>', 'Deterministic generation ID/seed', '12345')
  .option('-o, --output <path>', 'Output file or directory', './generated-data')
  .option('-f, --format <format>', 'Output format (json, csv, sql)', 'json')
  .option('--relationships', 'Include related data generation')
  .option('--pretty', 'Pretty-print JSON output')
  .action(async (options: GenerateOptions) => {
    try {
      console.log(chalk.blue('🎲 Generating mock data...'));

      // Parse and validate options
      const parsedOptions = parseOptions(options);
      const validation = ValidationUtils.validateGenerateArgs(parsedOptions);
      
      if (!validation.valid) {
        validation.errors.forEach(error => console.error(chalk.red('Error:'), error));
        process.exit(1);
      }

      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => console.warn(chalk.yellow('Warning:'), warning));
      }

      // Load configuration and packs
      const config = await loadConfig();
      const packLoader = getPackLoader();
      await packLoader.loadConfiguredPacks();

      // Determine what to generate
      const generationPlan = await createGenerationPlan(parsedOptions, packLoader);
      
      if (generationPlan.length === 0) {
        console.error(chalk.red('Error: No schemas found to generate'));
        process.exit(1);
      }

      console.log(chalk.gray(`Generating ${parsedOptions.count} records with ID ${parsedOptions.id}`));
      
      // Generate data using basic faker (temporary implementation)
      const allGeneratedData: any[] = [];

      for (const plan of generationPlan) {
        console.log(chalk.gray(`- ${plan.packName}.${plan.schemaName}`));
        
        const data = await generateSchemaDataBasic(
          plan,
          parsedOptions
        );
        
        allGeneratedData.push(...data);
      }

      // Apply role-based masking if needed
      const maskedData = applyRoleBasedMasking(allGeneratedData, parsedOptions, generationPlan);

      // Export data
      const outputPath = await FileUtils.writeData(maskedData, {
        format: parsedOptions.format as 'json' | 'csv' | 'sql',
        output: parsedOptions.output,
        pretty: parsedOptions.pretty,
        relationships: parsedOptions.relationships
      });

      const fileSize = await FileUtils.getFileSize(outputPath);
      
      console.log(chalk.green('✅ Generation complete!'));
      console.log(chalk.cyan(`📁 Output: ${outputPath}`));
      console.log(chalk.gray(`📊 Records: ${maskedData.length}`));
      console.log(chalk.gray(`📦 Size: ${fileSize}`));

      // Show sample data
      if (maskedData.length > 0) {
        console.log(chalk.cyan('\n📋 Sample data:'));
        const sample = maskedData[0];
        const sampleKeys = Object.keys(sample).slice(0, 5);
        sampleKeys.forEach(key => {
          const value = typeof sample[key] === 'string' && sample[key].length > 50 
            ? sample[key].substring(0, 50) + '...'
            : sample[key];
          console.log(chalk.gray(`   ${key}: ${JSON.stringify(value)}`));
        });
        if (Object.keys(sample).length > 5) {
          console.log(chalk.gray(`   ... and ${Object.keys(sample).length - 5} more fields`));
        }
      }

    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

function parseOptions(options: GenerateOptions): Required<GenerateOptions> {
  return {
    category: options.category || '',
    role: options.role || 'admin',
    stage: options.stage || 'growth',
    schema: options.schema || '',
    count: parseInt(options.count?.toString() || '10', 10),
    id: parseInt(options.id?.toString() || '12345', 10),
    output: options.output || './generated-data',
    format: options.format || 'json',
    relationships: options.relationships || false,
    pretty: options.pretty || false
  };
}

interface GenerationPlan {
  packId: string;
  packName: string;
  schemaName: string;
  schema: any;
  count: number;
  personas?: Record<string, any>;
}

async function createGenerationPlan(
  options: Required<GenerateOptions>,
  packLoader: any
): Promise<GenerationPlan[]> {
  const plans: GenerationPlan[] = [];

  if (options.schema) {
    // Generate specific schema from all loaded packs
    const allPacks = packLoader.getAllPacks();
    
    for (const packInfo of allPacks) {
      const schemas = packInfo.pack.schemas;
      if (schemas && schemas[options.schema]) {
        plans.push({
          packId: packInfo.id,
          packName: packInfo.name,
          schemaName: options.schema,
          schema: schemas[options.schema],
          count: options.count,
          personas: packInfo.pack.personas
        });
        break; // Only use first matching schema
      }
    }
  } else if (options.category) {
    // Generate from specific category/pack
    const packInfo = packLoader.getPack(options.category);
    if (!packInfo) {
      throw new Error(`Category "${options.category}" not found. Available categories: ${
        packLoader.getBusinessCategories().map((c: any) => c.id).join(', ')
      }`);
    }

    const schemas = packInfo.pack.schemas;
    if (!schemas || Object.keys(schemas).length === 0) {
      throw new Error(`No schemas found in category "${options.category}"`);
    }

    // Generate all schemas in the pack
    Object.entries(schemas).forEach(([schemaName, schema]) => {
      plans.push({
        packId: packInfo.id,
        packName: packInfo.name,
        schemaName,
        schema,
        count: getSchemaCount(options.count, options.stage, schemaName),
        personas: packInfo.pack.personas
      });
    });
  } else {
    throw new Error('Either --category or --schema must be specified');
  }

  return plans;
}

function getSchemaCount(baseCount: number, stage: string, schemaName: string): number {
  // Adjust count based on stage and schema type
  let multiplier = 1;

  switch (stage) {
    case 'early':
      multiplier = 0.2; // 20% of base count
      break;
    case 'growth':
      multiplier = 1; // 100% of base count
      break;
    case 'enterprise':
      multiplier = 3; // 300% of base count
      break;
  }

  // Some schemas might need different ratios
  if (schemaName.includes('user') || schemaName.includes('customer')) {
    // Users/customers are typically the base entity
    return Math.max(1, Math.round(baseCount * multiplier));
  } else if (schemaName.includes('order') || schemaName.includes('transaction')) {
    // Orders/transactions are typically more numerous
    return Math.max(1, Math.round(baseCount * multiplier * 2));
  } else if (schemaName.includes('product') || schemaName.includes('item')) {
    // Products are typically fewer than users but more than categories
    return Math.max(1, Math.round(baseCount * multiplier * 0.5));
  }

  return Math.max(1, Math.round(baseCount * multiplier));
}

async function generateSchemaDataBasic(
  plan: GenerationPlan,
  options: Required<GenerateOptions>
): Promise<any[]> {
  const data: any[] = [];

  for (let i = 0; i < plan.count; i++) {
    // Create deterministic seed for each record
    const recordSeed = options.id + i;
    
    try {
      const record = generateBasicRecord(plan.schema, recordSeed, plan.schemaName);
      
      // Add metadata
      record._meta = {
        pack: plan.packId,
        schema: plan.schemaName,
        stage: options.stage,
        role: options.role,
        generatedAt: new Date().toISOString(),
        seed: recordSeed
      };

      data.push(record);
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Failed to generate record ${i} for ${plan.schemaName}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  return data;
}

function generateBasicRecord(schema: any, seed: number, schemaName: string): any {
  // Simple deterministic data generation based on seed
  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const record: any = {};
  
  if (schema.properties) {
    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      const fieldSeed = seed + key.charCodeAt(0);
      
      switch (prop.type) {
        case 'string':
          if (prop.format === 'uuid') {
            record[key] = `${schemaName}-${seed}-${key}`;
          } else if (prop.format === 'email') {
            record[key] = `user${seed}@example.com`;
          } else if (prop.format === 'date-time') {
            record[key] = new Date(Date.now() - random(fieldSeed) * 365 * 24 * 60 * 60 * 1000).toISOString();
          } else if (prop.enum) {
            record[key] = prop.enum[Math.floor(random(fieldSeed) * prop.enum.length)];
          } else {
            record[key] = `${key}_${seed}`;
          }
          break;
        case 'number':
          record[key] = Math.floor(random(fieldSeed) * 1000) + 1;
          break;
        case 'integer':
          record[key] = Math.floor(random(fieldSeed) * 1000) + 1;
          break;
        case 'boolean':
          record[key] = random(fieldSeed) > 0.5;
          break;
        default:
          record[key] = `${key}_${seed}`;
      }
    });
  }
  
  return record;
}

function applyRoleBasedMasking(
  data: any[],
  options: Required<GenerateOptions>,
  plans: GenerationPlan[]
): any[] {
  if (options.role === 'admin') {
    // Admin sees everything
    return data;
  }

  // Find masked fields for the role
  const maskedFields = new Set<string>();
  
  plans.forEach(plan => {
    if (plan.personas && plan.personas[options.role]) {
      const persona = plan.personas[options.role];
      if (persona.maskedFields) {
        persona.maskedFields.forEach((field: string) => maskedFields.add(field));
      }
    }
  });

  // Apply masking
  return data.map(record => {
    const maskedRecord = { ...record };
    
    maskedFields.forEach(field => {
      if (maskedRecord[field] !== undefined) {
        maskedRecord[field] = 'hidden';
      }
    });

    return maskedRecord;
  });
}
