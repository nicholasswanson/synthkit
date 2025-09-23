#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the generation functions (we'll need to adapt these for Node.js)
import { generateRealisticStripeData } from '../examples/next-app/src/lib/realistic-stripe-generator.js';
import { generateMetrics } from '../examples/next-app/src/lib/metrics-generator.js';
import { calculateBusinessMetricsFromStripeData } from '../examples/next-app/src/lib/business-metrics-calculator.js';

// Animal names for URL generation
const ANIMALS = [
  'cheetah', 'lion', 'eagle', 'tiger', 'wolf', 'bear', 'shark', 'dolphin',
  'panther', 'leopard', 'jaguar', 'lynx', 'bobcat', 'cougar', 'puma',
  'falcon', 'hawk', 'owl', 'raven', 'crow', 'swan', 'heron', 'egret',
  'fox', 'coyote', 'jackal', 'hyena', 'mongoose', 'weasel', 'otter',
  'seal', 'walrus', 'whale', 'orca', 'narwhal', 'beluga', 'dolphin',
  'elephant', 'rhino', 'hippo', 'giraffe', 'zebra', 'antelope', 'gazelle',
  'buffalo', 'bison', 'yak', 'camel', 'llama', 'alpaca', 'deer'
];

function generateDatasetUrl(scenarioId) {
  const timestamp = Date.now().toString().slice(-6);
  const animal1 = ANIMALS[scenarioId % ANIMALS.length];
  const animal2 = ANIMALS[(scenarioId * 7) % ANIMALS.length];
  const filename = `${animal1}-${animal2}-${scenarioId}-${timestamp}.json`;
  return `https://raw.githubusercontent.com/nicholasswanson/synthkit/main/datasets/${filename}`;
}

async function generateDataset(businessType, stage, scenarioId) {
  console.log(`Generating dataset for ${businessType} (${stage}) with ID ${scenarioId}`);
  
  try {
    // Generate the full realistic dataset
    const fullRealisticData = generateRealisticStripeData(businessType, stage);
    
    // Add business metrics and comprehensive metrics
    const comprehensiveMetrics = generateMetrics(fullRealisticData, businessType, stage);
    const businessMetrics = calculateBusinessMetricsFromStripeData(fullRealisticData, stage, scenarioId);
    
    const dataset = {
      ...fullRealisticData,
      businessMetrics,
      metrics: comprehensiveMetrics
    };
    
    // Generate URL
    const url = generateDatasetUrl(scenarioId);
    const filename = url.split('/').pop();
    
    // Save dataset to file
    const datasetsDir = path.join(__dirname, '../examples/next-app/public/datasets');
    if (!fs.existsSync(datasetsDir)) {
      fs.mkdirSync(datasetsDir, { recursive: true });
    }
    
    const filePath = path.join(datasetsDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(dataset, null, 2));
    
    console.log(`Dataset saved to: ${filePath}`);
    console.log(`Dataset URL: ${url}`);
    
    return {
      success: true,
      url,
      filename,
      filePath
    };
  } catch (error) {
    console.error('Dataset generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node generate-dataset.js <businessType> <stage> <scenarioId>');
    process.exit(1);
  }
  
  const [businessType, stage, scenarioId] = args;
  const result = await generateDataset(businessType, stage, parseInt(scenarioId));
  
  if (result.success) {
    console.log('✅ Dataset generation completed successfully');
    console.log(`📁 File: ${result.filename}`);
    console.log(`🔗 URL: ${result.url}`);
  } else {
    console.error('❌ Dataset generation failed:', result.error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateDataset };
