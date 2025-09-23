#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// EMBEDDED GENERATION LOGIC - PRESERVES EXACT SAME DATA STRUCTURE
// ============================================================================

// Seeded random function for deterministic generation
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate realistic Stripe-style IDs
function generateStripeId(prefix, seed) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = prefix;
  for (let i = 0; i < 20; i++) {
    id += chars[Math.floor(seededRandom(seed + i) * chars.length)];
  }
  return id;
}

// Generate realistic timestamps
function generateRealisticTimestamp(seed, daysBack) {
  const now = Math.floor(Date.now() / 1000);
  const secondsBack = Math.floor(seededRandom(seed) * daysBack * 24 * 60 * 60);
  return now - secondsBack;
}

// Get realistic counts based on business type and stage (EXACT SAME LOGIC)
function getRealisticCounts(businessType, stage) {
  const baseCounts = {
    'checkout-ecommerce': { customers: 25000, subscriptions: 0, charges: 150000, invoices: 25000 },
    'b2b-saas-subscriptions': { customers: 5000, subscriptions: 12000, charges: 25000, invoices: 5000 },
    'food-delivery-platform': { customers: 50000, subscriptions: 0, charges: 300000, invoices: 50000 },
    'consumer-fitness-app': { customers: 15000, subscriptions: 25000, charges: 75000, invoices: 15000 },
    'b2b-invoicing': { customers: 3000, subscriptions: 0, charges: 15000, invoices: 12000 },
    'property-management-platform': { customers: 2000, subscriptions: 0, charges: 10000, invoices: 8000 },
    'creator-platform': { customers: 30000, subscriptions: 0, charges: 180000, invoices: 30000 },
    'donation-marketplace': { customers: 20000, subscriptions: 0, charges: 120000, invoices: 20000 },
    // Legacy mappings
    saas: { customers: 5000, subscriptions: 12000, charges: 25000, invoices: 5000 },
    ecommerce: { customers: 25000, subscriptions: 0, charges: 150000, invoices: 25000 },
    marketplace: { customers: 30000, subscriptions: 0, charges: 180000, invoices: 30000 }
  };
  
  const businessCounts = baseCounts[businessType.toLowerCase()] || baseCounts.saas;
  
  const stageMultipliers = {
    early: 0.1,
    growth: 1.0,
    enterprise: 20.0
  };
  
  const stageMultiplier = stageMultipliers[stage] || 1.0;
  const enterpriseVariation = stage === 'enterprise' ? (0.7 + Math.random() * 0.6) : 1.0;
  
  return {
    customers: Math.floor(businessCounts.customers * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation),
    subscriptions: Math.floor(businessCounts.subscriptions * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation),
    charges: Math.floor(businessCounts.charges * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation),
    invoices: Math.floor(businessCounts.invoices * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation),
    plans: 5
  };
}

// Generate realistic Stripe data with exact same structure
function generateRealisticStripeData(businessType = 'b2b-saas-subscriptions', stage = 'growth') {
  const counts = getRealisticCounts(businessType, stage);
  
  // Generate customers
  const customers = [];
  for (let i = 0; i < counts.customers; i++) {
    const seed = i * 1000;
    customers.push({
      id: generateStripeId('cus_', seed),
      object: 'customer',
      email: `customer${i + 1}@example.com`,
      name: `Customer ${i + 1}`,
      created: generateRealisticTimestamp(seed + 1, 730),
      livemode: false,
      metadata: {
        source: 'api',
        business_type: businessType
      }
    });
  }

  // Generate plans
  const plans = [];
  for (let i = 0; i < counts.plans; i++) {
    const seed = i * 2000;
    const planNames = ['Basic', 'Professional', 'Business', 'Enterprise', 'Team'];
    const name = planNames[i % planNames.length];
    const interval = seededRandom(seed + 1) < 0.8 ? 'month' : 'year';
    const amount = Math.floor(seededRandom(seed + 2) * 5000) + 1000;
    
    plans.push({
      id: generateStripeId('plan_', seed),
      object: 'plan',
      name,
      amount,
      interval,
      currency: 'usd',
      created: generateRealisticTimestamp(seed + 3, 365),
      livemode: false,
      metadata: {
        business_type: businessType
      }
    });
  }

  // Generate subscriptions
  const subscriptions = [];
  for (let i = 0; i < counts.subscriptions; i++) {
    const seed = i * 3000;
    const customer = customers[Math.floor(seededRandom(seed) * customers.length)];
    const plan = plans[Math.floor(seededRandom(seed + 1) * plans.length)];
    const created = Math.max(customer.created, generateRealisticTimestamp(seed, 180));
    const statuses = ['active', 'trialing', 'past_due', 'canceled'];
    const status = statuses[Math.floor(seededRandom(seed + 1) * statuses.length)];
    
    subscriptions.push({
      id: generateStripeId('sub_', seed),
      object: 'subscription',
      customer: customer.id,
      status,
      created,
      current_period_start: created + Math.floor(seededRandom(seed + 2) * 86400 * 30),
      current_period_end: created + Math.floor(seededRandom(seed + 3) * 86400 * 60),
      plan: plan,
      amount: plan.amount,
      interval: plan.interval,
      currency: 'usd',
      billing_cycle_anchor: created,
      cancel_at_period_end: false,
      collection_method: 'charge_automatically',
      livemode: false,
      metadata: {
        business_type: businessType
      }
    });
  }

  // Generate invoices
  const invoices = [];
  for (let i = 0; i < counts.invoices; i++) {
    const seed = i * 4000;
    let subscription, customer;
    
    if (subscriptions.length > 0) {
      subscription = subscriptions[Math.floor(seededRandom(seed) * subscriptions.length)];
      customer = customers.find(c => c.id === subscription.customer);
    } else {
      customer = customers[Math.floor(seededRandom(seed) * customers.length)];
      subscription = null;
    }
    
    const created = subscription ? Math.max(subscription.created, generateRealisticTimestamp(seed, 90)) : generateRealisticTimestamp(seed, 90);
    const amount_due = subscription ? subscription.amount : Math.floor(seededRandom(seed + 1) * 5000) + 100;
    const statuses = ['paid', 'open', 'void', 'uncollectible'];
    const status = statuses[Math.floor(seededRandom(seed + 2) * statuses.length)];
    
    invoices.push({
      id: generateStripeId('in_', seed),
      object: 'invoice',
      customer: customer.id,
      subscription: subscription ? subscription.id : null,
      amount_due,
      currency: 'usd',
      status,
      created,
      paid: status === 'paid',
      livemode: false,
      metadata: {
        business_type: businessType,
        invoice_type: subscription ? 'subscription' : 'one_time'
      }
    });
  }

  // Generate charges
  const charges = [];
  const usedInvoices = new Set();
  
  // First, generate charges for all invoices (1:1 relationship)
  for (let i = 0; i < Math.min(counts.charges, invoices.length); i++) {
    const seed = i * 5000;
    const invoice = invoices[i];
    const customer = customers.find(c => c.id === invoice.customer);
    usedInvoices.add(invoice.id);
    
    const statuses = ['succeeded', 'failed', 'pending'];
    const status = statuses[Math.floor(seededRandom(seed + 1) * statuses.length)];
    
    charges.push({
      id: generateStripeId('ch_', seed),
      object: 'charge',
      customer: customer.id,
      invoice: invoice.id,
      amount: invoice.amount_due,
      currency: 'usd',
      status,
      created: invoice.created + Math.floor(seededRandom(seed + 2) * 86400),
      paid: status === 'succeeded',
      refunded: seededRandom(seed + 3) < 0.05,
      livemode: false,
      metadata: {
        business_type: businessType,
        charge_type: 'invoice'
      }
    });
  }
  
  // Generate additional one-time charges if needed
  for (let i = invoices.length; i < counts.charges; i++) {
    const seed = i * 5000;
    const customer = customers[Math.floor(seededRandom(seed) * customers.length)];
    const amount = Math.floor(seededRandom(seed + 1) * 10000) + 100;
    const statuses = ['succeeded', 'failed', 'pending'];
    const status = statuses[Math.floor(seededRandom(seed + 2) * statuses.length)];
    
    charges.push({
      id: generateStripeId('ch_', seed),
      object: 'charge',
      customer: customer.id,
      invoice: null,
      amount,
      currency: 'usd',
      status,
      created: generateRealisticTimestamp(seed + 3, 365),
      paid: status === 'succeeded',
      refunded: seededRandom(seed + 4) < 0.05,
      livemode: false,
      metadata: {
        business_type: businessType,
        charge_type: 'one_time'
      }
    });
  }

  return {
    customers,
    subscriptions,
    invoices,
    charges,
    plans,
    _metadata: {
      generatedAt: new Date().toISOString(),
      businessType,
      stage,
      counts: {
        customers: customers.length,
        subscriptions: subscriptions.length,
        invoices: invoices.length,
        charges: charges.length,
        plans: plans.length
      },
      includedMetrics: ['Gross Payment Volume', 'Payment Success Rate', 'Monthly Recurring Revenue', 'Customer Lifetime Value'],
      source: 'synthkit-standalone'
    }
  };
}

// Generate business metrics (same logic as before)
function generateBusinessMetrics(stripeData, businessType, stage) {
  const { customers, charges, subscriptions } = stripeData;
  
  const successfulCharges = charges.filter(c => c.status === 'succeeded');
  const totalVolume = successfulCharges.reduce((sum, c) => sum + c.amount, 0);
  const avgOrderValue = successfulCharges.length > 0 ? totalVolume / successfulCharges.length : 0;
  
  return {
    grossPaymentVolume: totalVolume,
    paymentSuccessRate: successfulCharges.length / charges.length,
    successfulPayments: successfulCharges.length,
    acceptedVolume: totalVolume,
    averageOrderValue: avgOrderValue,
    customerLifetimeValue: avgOrderValue * 12,
    monthlyRecurringRevenue: subscriptions.filter(s => s.status === 'active').length * avgOrderValue,
    conversionRate: 0.15 + Math.random() * 0.1
  };
}

// Generate comprehensive metrics (same logic as before)
function generateComprehensiveMetrics(stripeData, businessType, stage) {
  const { customers, charges, subscriptions, invoices } = stripeData;
  
  const metrics = [
    {
      name: 'Gross Payment Volume',
      currentValue: charges.filter(c => c.status === 'succeeded').reduce((sum, c) => sum + c.amount, 0),
      previousValue: 0,
      change: 0,
      chartType: 'Bar chart',
      description: 'Total payment volume processed'
    },
    {
      name: 'Payment Success Rate',
      currentValue: charges.filter(c => c.status === 'succeeded').length / charges.length,
      previousValue: 0,
      change: 0,
      chartType: 'Line chart',
      description: 'Percentage of successful payments'
    },
    {
      name: 'Monthly Recurring Revenue',
      currentValue: subscriptions.filter(s => s.status === 'active').length * 5000,
      previousValue: 0,
      change: 0,
      chartType: 'Line chart',
      description: 'Recurring revenue from active subscriptions'
    },
    {
      name: 'Customer Lifetime Value',
      currentValue: 5000 * 12,
      previousValue: 0,
      change: 0,
      chartType: 'Bar chart',
      description: 'Average customer lifetime value'
    }
  ];
  
  return metrics;
}

// Animal names for URL generation
const ANIMALS = [
  'cheetah', 'lion', 'eagle', 'tiger', 'wolf', 'bear', 'shark', 'dolphin',
  'panther', 'leopard', 'jaguar', 'lynx', 'bobcat', 'cougar', 'puma',
  'falcon', 'hawk', 'owl', 'raven', 'crow', 'swan', 'heron', 'egret',
  'fox', 'coyote', 'jackal', 'hyena', 'mongoose', 'weasel', 'otter',
  'seal', 'walrus', 'whale', 'orca', 'narwhal', 'beluga', 'elephant',
  'rhino', 'hippo', 'giraffe', 'zebra', 'antelope', 'gazelle', 'buffalo',
  'bison', 'yak', 'camel', 'llama', 'alpaca', 'deer'
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
    // Generate the full realistic dataset using embedded logic
    const fullRealisticData = generateRealisticStripeData(businessType, stage);
    
    // Generate business metrics and comprehensive metrics using embedded logic
    const businessMetrics = generateBusinessMetrics(fullRealisticData, businessType, stage);
    const comprehensiveMetrics = generateComprehensiveMetrics(fullRealisticData, businessType, stage);
    
    const dataset = {
      ...fullRealisticData,
      businessMetrics,
      metrics: comprehensiveMetrics
    };
    
    // Generate URL
    const url = generateDatasetUrl(scenarioId);
    const filename = url.split('/').pop();
    
    // Save dataset to file (GitHub Actions will commit this)
    const datasetsDir = path.join(__dirname, '../datasets');
    if (!fs.existsSync(datasetsDir)) {
      fs.mkdirSync(datasetsDir, { recursive: true });
    }
    
    const filePath = path.join(datasetsDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(dataset, null, 2));
    
    console.log(`✅ Dataset generated: ${filename}`);
    console.log(`📊 Records: ${dataset.customers.length} customers, ${dataset.charges.length} charges, ${dataset.subscriptions.length} subscriptions`);
    console.log(`🔗 URL: https://nicholasswanson.github.io/synthkit/datasets/${filename}`);
    
    return {
      success: true,
      url: `https://nicholasswanson.github.io/synthkit/datasets/${filename}`,
      filename,
      filePath,
      recordCounts: dataset._metadata.counts
    };
  } catch (error) {
    console.error('❌ Dataset generation failed:', error);
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
