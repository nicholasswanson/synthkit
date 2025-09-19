// Professional Stripe Data Generator with Realistic Business Rules
// Generates interconnected Stripe data that mirrors real business patterns with professional formatting

import { seededRandom, generateRealisticName, generateRealisticEmail } from './realistic-data-generator.ts';
import { generateMetrics, getIncludedMetrics } from './metrics-generator.ts';

// ============================================================================
// DATA GENERATION RULES & CONSTANTS
// ============================================================================

// Professional ID Generation Rules
const ID_PATTERNS = {
  customer: 'cus_',
  charge: 'ch_',
  subscription: 'sub_',
  invoice: 'in_',
  plan: 'plan_',
  payment_intent: 'pi_',
  payment_method: 'pm_'
};

// Generate realistic Stripe-style IDs (24 characters total)
function generateStripeId(prefix: string, seed: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = prefix;
  for (let i = 0; i < 20; i++) {
    id += chars[Math.floor(seededRandom(seed + i) * chars.length)];
  }
  return id;
}

// Professional amount ranges (in cents) for different business types
const AMOUNT_RANGES = {
  'checkout-ecommerce': {
    subscription: { min: 2000, max: 20000 }, // $20.00-$200.00/month
    oneTime: { min: 1000, max: 50000 }, // $10.00-$500.00
  },
  'b2b-saas-subscriptions': {
    subscription: { min: 1000, max: 50000 }, // $10.00-$500.00/month
    oneTime: { min: 500, max: 10000 }, // $5.00-$100.00
  },
  'food-delivery-platform': {
    subscription: { min: 500, max: 10000 }, // $5.00-$100.00/month
    oneTime: { min: 200, max: 20000 }, // $2.00-$200.00
  },
  'consumer-fitness-app': {
    subscription: { min: 2000, max: 20000 }, // $20.00-$200.00/month
    oneTime: { min: 1000, max: 30000 }, // $10.00-$300.00
  },
  'b2b-invoicing': {
    subscription: { min: 0, max: 0 }, // No subscriptions
    oneTime: { min: 5000, max: 100000 }, // $50.00-$1000.00
  },
  'property-management-platform': {
    subscription: { min: 0, max: 0 }, // No subscriptions
    oneTime: { min: 10000, max: 200000 }, // $100.00-$2000.00
  },
  'creator-platform': {
    subscription: { min: 500, max: 10000 }, // $5.00-$100.00/month
    oneTime: { min: 200, max: 20000 }, // $2.00-$200.00
  },
  'donation-marketplace': {
    subscription: { min: 0, max: 0 }, // No subscriptions
    oneTime: { min: 500, max: 50000 }, // $5.00-$500.00
  },
  // Legacy mappings for backward compatibility
  saas: { subscription: { min: 1000, max: 50000 }, oneTime: { min: 500, max: 10000 } },
  ecommerce: { subscription: { min: 2000, max: 20000 }, oneTime: { min: 1000, max: 50000 } },
  marketplace: { subscription: { min: 500, max: 10000 }, oneTime: { min: 200, max: 20000 } },
  default: { subscription: { min: 1000, max: 30000 }, oneTime: { min: 500, max: 30000 } }
};

// Professional date formatting utilities
function formatAmount(amountInCents: number): string {
  return `$${(amountInCents / 100).toFixed(2)}`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  };
  return date.toLocaleString('en-US', options);
}

function generateRealisticTimestamp(seed: number, daysBack: number = 365): number {
  const daysAgo = Math.floor(Math.pow(seededRandom(seed), 2) * daysBack);
  return Math.floor(Date.now() / 1000) - (daysAgo * 86400);
}

// Professional description generation rules
const DESCRIPTION_PATTERNS = {
  'checkout-ecommerce': [
    'Premium cotton t-shirt with modern fit',
    'Designer denim jacket with vintage wash',
    'Elegant silk blouse for professional wear',
    'Comfortable sneakers with memory foam',
    'Classic leather handbag with gold hardware',
    'Seasonal collection dress with floral print',
    'Athletic performance shorts with moisture-wicking',
    'Business casual button-down shirt',
    'Winter coat with down insulation',
    'Summer sandals with arch support'
  ],
  'b2b-saas-subscriptions': [
    'Professional plan with advanced analytics',
    'Team collaboration tools and integrations',
    'Enterprise security and compliance features',
    'Custom API access and webhooks',
    'Priority support and dedicated account manager',
    'Advanced reporting and data export',
    'Multi-user workspace management',
    'Custom branding and white-label options',
    'Advanced workflow automation',
    'Dedicated infrastructure and SLA'
  ],
  'food-delivery-platform': [
    'Fresh Mediterranean bowl with quinoa',
    'Artisan pizza with local ingredients',
    'Gourmet burger with truffle fries',
    'Healthy smoothie bowl with acai',
    'Authentic Thai curry with jasmine rice',
    'Farm-to-table salad with seasonal vegetables',
    'Handcrafted pasta with house-made sauce',
    'Grilled salmon with roasted vegetables',
    'Vegetarian wrap with hummus and sprouts',
    'Decadent chocolate dessert with berries'
  ],
  'consumer-fitness-app': [
    'Monthly unlimited workout access',
    'Personal training session package',
    'Nutrition consultation and meal planning',
    'Group fitness class membership',
    'Recovery and wellness spa treatment',
    'Online yoga and meditation classes',
    'Strength training program with equipment',
    'Cardio HIIT workout sessions',
    'Flexibility and mobility training',
    'Sports-specific conditioning program'
  ],
  'b2b-invoicing': [
    'Medical supplies and equipment order',
    'Pharmaceutical inventory restock',
    'Laboratory testing and analysis',
    'Emergency medical equipment delivery',
    'Specialized healthcare consultation',
    'Diagnostic imaging services',
    'Surgical instrument sterilization',
    'Patient care monitoring systems',
    'Medical waste disposal services',
    'Healthcare facility maintenance'
  ],
  'property-management-platform': [
    'Monthly rent payment for 2-bedroom apartment',
    'Security deposit for commercial space',
    'Property management service fee',
    'Maintenance and repair service',
    'Lease renewal and processing fee',
    'Utility bill payment and management',
    'Property insurance premium',
    'Landscaping and groundskeeping',
    'Emergency repair and maintenance',
    'Tenant screening and background check'
  ],
  'creator-platform': [
    'Supply chain optimization consultation',
    'Inventory management software license',
    'Logistics and shipping coordination',
    'Supplier relationship management',
    'Demand forecasting and analytics',
    'Quality control and inspection services',
    'Packaging and labeling solutions',
    'Transportation and freight management',
    'Warehouse storage and fulfillment',
    'Vendor compliance and auditing'
  ],
  'donation-marketplace': [
    'General fund donation for community programs',
    'Emergency relief fund contribution',
    'Educational scholarship fund donation',
    'Environmental conservation project support',
    'Healthcare access initiative funding',
    'Food security and hunger relief',
    'Housing assistance and shelter support',
    'Youth development and mentorship',
    'Senior care and support services',
    'Disaster response and recovery'
  ]
};

// Generate realistic descriptions with null probability
function generateDescription(businessType: string, seed: number): string | null {
  const nullProbability = 0.25; // 25% chance of null description
  if (seededRandom(seed) < nullProbability) {
    return null;
  }
  
  const patterns = DESCRIPTION_PATTERNS[businessType as keyof typeof DESCRIPTION_PATTERNS] || 
                  DESCRIPTION_PATTERNS['checkout-ecommerce'];
  return patterns[Math.floor(seededRandom(seed + 1) * patterns.length)];
}

// Professional amount generation (in cents)
function generateRealisticAmount(businessType: string, type: 'subscription' | 'oneTime', seed: number): number {
  const ranges = AMOUNT_RANGES[businessType as keyof typeof AMOUNT_RANGES] || AMOUNT_RANGES.default;
  const range = ranges[type];
  if (range.max === 0) return 0;
  
  const amount = Math.floor(seededRandom(seed) * (range.max - range.min) + range.min);
  return amount;
}

// ============================================================================
// CORE DATA GENERATION FUNCTIONS
// ============================================================================

// Generate realistic customer data with professional formatting
function generateCustomer(seed: number, businessType: string): any {
  const nameData = generateRealisticName(seed);
  const created = generateRealisticTimestamp(seed + 1, 730); // Last 2 years
  
  return {
    id: generateStripeId(ID_PATTERNS.customer, seed),
    object: 'customer',
    email: generateRealisticEmail(nameData.firstName, nameData.lastName, seed + 2),
    name: nameData.fullName,
    created: created,
    livemode: false,
    metadata: {
      source: 'api',
      business_type: businessType
    }
  };
}

// Generate realistic subscription plans
function generatePlan(seed: number, businessType: string): any {
  const planNames = {
    'checkout-ecommerce': ['Basic', 'Standard', 'Premium', 'Pro', 'Growth', 'Scale'],
    'b2b-saas-subscriptions': ['Starter', 'Professional', 'Business', 'Enterprise', 'Team', 'Individual'],
    'food-delivery-platform': ['Basic', 'Plus', 'Premium', 'Family', 'Corporate'],
    'consumer-fitness-app': ['Basic', 'Premium', 'Elite', 'Family', 'Student'],
    'b2b-invoicing': ['Basic', 'Professional', 'Enterprise'],
    'property-management-platform': ['Basic', 'Professional', 'Enterprise'],
    'creator-platform': ['Creator', 'Pro', 'Business', 'Enterprise'],
    'donation-marketplace': ['Basic', 'Plus', 'Premium']
  };
  
  const businessPlans = planNames[businessType as keyof typeof planNames] || planNames['b2b-saas-subscriptions'];
  const name = businessPlans[Math.floor(seededRandom(seed) * businessPlans.length)];
  
  const interval = seededRandom(seed + 1) < 0.8 ? 'month' : 'year';
  const amount = generateRealisticAmount(businessType, 'subscription', seed + 2);
  
  return {
    id: generateStripeId(ID_PATTERNS.plan, seed),
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
  };
}

// Generate realistic subscription data
function generateSubscription(seed: number, customer: any, plan: any, businessType: string): any {
  const created = Math.max(customer.created, generateRealisticTimestamp(seed, 180)); // Last 6 months
  const statuses = ['active', 'trialing', 'past_due', 'canceled'];
  const status = statuses[Math.floor(seededRandom(seed + 1) * statuses.length)];
  
  const currentPeriodStart = created + Math.floor(seededRandom(seed + 2) * 86400 * 30);
  const currentPeriodEnd = currentPeriodStart + (plan.interval === 'month' ? 86400 * 30 : 86400 * 365);
  
  return {
    id: generateStripeId(ID_PATTERNS.subscription, seed),
    object: 'subscription',
    customer: customer.id,
    status,
    created,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    plan: plan,
    amount: plan.amount,
    interval: plan.interval,
    currency: 'usd',
    billing_cycle_anchor: currentPeriodStart,
    cancel_at_period_end: false,
    collection_method: 'charge_automatically',
    automatic_tax: { enabled: false },
    default_tax_rates: [],
    livemode: false,
    metadata: {
      plan_name: plan.name,
      customer_name: customer.name,
      business_type: businessType
    }
  };
}

// Generate realistic invoice data
function generateInvoice(seed: number, customer: any, subscription: any | null, businessType: string): any {
  const amount = subscription?.amount || generateRealisticAmount(businessType, 'oneTime', seed + 1);
  const created = subscription ? 
    subscription.current_period_start + Math.floor(seededRandom(seed + 2) * 86400 * 30) :
    generateRealisticTimestamp(seed + 2, 30);
  
  const statuses = ['paid', 'open', 'draft'];
  const status = statuses[Math.floor(seededRandom(seed + 3) * statuses.length)];
  
  return {
    id: generateStripeId(ID_PATTERNS.invoice, seed),
    object: 'invoice',
    customer: customer.id,
    subscription: subscription?.id || null,
    amount_due: status === 'paid' ? 0 : amount,
    amount_paid: status === 'paid' ? amount : 0,
    amount_remaining: status === 'paid' ? 0 : amount,
    total: amount,
    subtotal: amount,
    currency: 'usd',
    status,
    created,
    period_start: subscription?.current_period_start || created,
    period_end: subscription?.current_period_end || created + 86400 * 30,
    paid: status === 'paid',
    attempt_count: status === 'paid' ? 1 : 0,
    attempted: status === 'paid',
    collection_method: 'charge_automatically',
    automatic_tax: { enabled: false },
    default_tax_rates: [],
    livemode: false,
    metadata: {
      subscription_id: subscription?.id || null,
      customer_name: customer.name,
      business_type: businessType
    }
  };
}

// Generate realistic charge data
function generateCharge(seed: number, customer: any, invoice: any | null, businessType: string): any {
  const amount = invoice?.total || generateRealisticAmount(businessType, 'oneTime', seed + 1);
  const created = invoice?.created || generateRealisticTimestamp(seed + 2, 30);
  
  const statuses = ['succeeded', 'pending', 'failed'];
  const status = statuses[Math.floor(seededRandom(seed + 3) * statuses.length)];
  
  const isOneTime = !invoice;
  const description = generateDescription(businessType, seed + 4);
  
  const cardBrands = ['visa', 'mastercard', 'amex', 'discover'];
  const cardBrand = cardBrands[Math.floor(seededRandom(seed + 5) * cardBrands.length)];
  
  return {
    id: generateStripeId(ID_PATTERNS.charge, seed),
    object: 'charge',
    amount,
    amount_captured: status === 'succeeded' ? amount : 0,
    amount_refunded: 0,
    currency: 'usd',
    customer: customer.id,
    invoice: invoice?.id || null,
    description,
    status,
    created,
    paid: status === 'succeeded',
    captured: status === 'succeeded',
    livemode: false,
    metadata: {
      customer_name: customer.name,
      payment_type: isOneTime ? 'one_time' : 'subscription',
      business_type: businessType
    },
    payment_method_details: {
      type: 'card',
      card: {
        brand: cardBrand,
        last4: Math.floor(seededRandom(seed + 6) * 9000 + 1000).toString(),
        exp_month: Math.floor(seededRandom(seed + 7) * 12) + 1,
        exp_year: new Date().getFullYear() + Math.floor(seededRandom(seed + 8) * 3)
      }
    }
  };
}

// ============================================================================
// MAIN GENERATION FUNCTIONS
// ============================================================================

// Generate metadata and sample data only (for UI display)
export function generateStripeMetadata(
  businessType: string = 'b2b-saas-subscriptions',
  stage: string = 'growth',
  options: {
    customers?: number;
    subscriptions?: number;
    charges?: number;
    invoices?: number;
  } = {}
): Record<string, any[]> {
  // Generate realistic volumes based on business type and stage
  const getRealisticCounts = (type: string) => {
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
    
    const businessCounts = baseCounts[type.toLowerCase() as keyof typeof baseCounts] || baseCounts.saas;
    
    const stageMultipliers = {
      early: 0.1,
      growth: 1.0,
      enterprise: 20.0
    };
    
    const stageMultiplier = stageMultipliers[stage as keyof typeof stageMultipliers] || 1.0;
    const enterpriseVariation = stage === 'enterprise' ? (0.7 + Math.random() * 0.6) : 1.0;
    
    return {
      customers: Math.floor(businessCounts.customers * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation),
      subscriptions: Math.floor(businessCounts.subscriptions * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation),
      charges: Math.floor(businessCounts.charges * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation),
      invoices: Math.floor(businessCounts.invoices * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation)
    };
  };
  
  const realisticCounts = getRealisticCounts(businessType);
  const counts = { ...realisticCounts, ...options };

  // Generate sample data (3-5 records) for UI display
  const generateSampleData = (type: string, count: number) => {
    if (count === 0) return [];
    
    const sampleSize = Math.min(3, count);
    const samples = [];
    
    for (let i = 0; i < sampleSize; i++) {
      const seed = i + 1000;
      
      if (type === 'customers') {
        samples.push(generateCustomer(seed, businessType));
      } else if (type === 'charges') {
        const customer = generateCustomer(seed, businessType);
        samples.push(generateCharge(seed, customer, null, businessType));
      } else if (type === 'subscriptions') {
        const customer = generateCustomer(seed, businessType);
        const plan = generatePlan(seed, businessType);
        samples.push(generateSubscription(seed, customer, plan, businessType));
      } else if (type === 'invoices') {
        const customer = generateCustomer(seed, businessType);
        samples.push(generateInvoice(seed, customer, null, businessType));
      } else {
        samples.push({
          id: generateStripeId(`${type}_`, seed),
          name: `Sample ${type} ${i + 1}`,
          created: generateRealisticTimestamp(seed, 30)
        });
      }
    }
    
    return samples;
  };

  // Generate sample data for each type
  const customers = generateSampleData('customers', counts.customers);
  const subscriptions = generateSampleData('subscriptions', counts.subscriptions);
  const charges = generateSampleData('charges', counts.charges);
  const invoices = generateSampleData('invoices', counts.invoices);
  const plans = [];
  for (let i = 0; i < 5; i++) {
    plans.push(generatePlan(i * 2000, businessType));
  }

  // Generate metrics for the sample data
  const sampleDataset = { customers, subscriptions, charges, invoices, plans };
  const metrics = generateMetrics(sampleDataset, businessType, stage);

  return {
    customers,
    subscriptions,
    charges,
    invoices,
    plans,
    _metadata: {
      generatedAt: Date.now(),
      businessType,
      stage,
      counts: {
        customers: counts.customers,
        subscriptions: counts.subscriptions,
        charges: counts.charges,
        invoices: counts.invoices,
        plans: 5
      },
      includedMetrics: getIncludedMetrics(sampleDataset, businessType, stage)
    }
  };
}

// Generate full interconnected Stripe data (for actual dataset generation)
export function generateRealisticStripeData(
  businessType: string = 'b2b-saas-subscriptions',
  stage: string = 'growth',
  options: {
    customers?: number;
    subscriptions?: number;
    charges?: number;
    invoices?: number;
  } = {}
): Record<string, any[]> {
  // Use the same count generation logic as metadata
  const getRealisticCounts = (type: string) => {
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
    
    const businessCounts = baseCounts[type.toLowerCase() as keyof typeof baseCounts] || baseCounts.saas;
    
    const stageMultipliers = {
      early: 0.1,
      growth: 1.0,
      enterprise: 20.0
    };
    
    const stageMultiplier = stageMultipliers[stage as keyof typeof stageMultipliers] || 1.0;
    const enterpriseVariation = stage === 'enterprise' ? (0.7 + Math.random() * 0.6) : 1.0;
    
    return {
      customers: Math.floor(businessCounts.customers * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation),
      subscriptions: Math.floor(businessCounts.subscriptions * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation),
      charges: Math.floor(businessCounts.charges * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation),
      invoices: Math.floor(businessCounts.invoices * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation)
    };
  };
  
  const realisticCounts = getRealisticCounts(businessType);
  const counts = { ...realisticCounts, ...options };

  // Generate customers first
  const customers = [];
  for (let i = 0; i < counts.customers; i++) {
    customers.push(generateCustomer(i * 1000, businessType));
  }
  
  // Store customer IDs for easy lookup
  const customerIds = customers.map(c => c.id);

  // Generate subscription plans
  const plans = [];
  for (let i = 0; i < 5; i++) {
    plans.push(generatePlan(i * 2000, businessType));
  }

  // Generate subscriptions linked to customers and plans
  const subscriptions = [];
  const subscriptionIds = [];
  
  if (counts.subscriptions > 0 && customers.length > 0 && plans.length > 0) {
    for (let i = 0; i < counts.subscriptions; i++) {
      const seed = i * 3000;
      const customer = customers[Math.floor(seededRandom(seed) * customers.length)];
      const plan = plans[Math.floor(seededRandom(seed + 1) * plans.length)];
      
      const subscription = generateSubscription(seed, customer, plan, businessType);
      subscriptions.push(subscription);
      subscriptionIds.push(subscription.id);
    }
  }

  // Generate invoices linked to subscriptions
  const invoices = [];
  const invoiceIds = [];
  
  if (counts.invoices > 0 && customers.length > 0) {
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
    
      const invoice = generateInvoice(seed, customer, subscription, businessType);
      invoices.push(invoice);
      invoiceIds.push(invoice.id);
    }
  }

  // Generate charges linked to invoices and customers
  const charges = [];
  const usedInvoices = new Set();
  
  // First, generate charges for all invoices (1:1 relationship)
  for (let i = 0; i < Math.min(counts.charges, invoices.length); i++) {
    const seed = i * 5000;
    const invoice = invoices[i];
    const customer = customers.find(c => c.id === invoice.customer);
    usedInvoices.add(invoice.id);
    
    const charge = generateCharge(seed, customer, invoice, businessType);
    charges.push(charge);
  }
  
  // Generate additional one-time charges if needed
  if (customers.length > 0) {
    for (let i = invoices.length; i < counts.charges; i++) {
      const seed = i * 5000;
      const customer = customers[Math.floor(seededRandom(seed) * customers.length)];
      
      const charge = generateCharge(seed, customer, null, businessType);
      charges.push(charge);
    }
  }

  // Generate metrics for the dataset
  const metrics = generateMetrics({
    customers,
    subscriptions,
    invoices,
    charges,
    plans
  }, businessType, stage);

  return {
    customers,
    subscriptions,
    invoices,
    charges,
    plans,
    metrics,
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
      includedMetrics: getIncludedMetrics({
        customers,
        subscriptions,
        invoices,
        charges,
        plans
      }, businessType, stage)
    }
  };
}

// Generate realistic business metrics based on Stripe data
export function generateBusinessMetrics(stripeData: Record<string, any[]>): any {
  const { customers, subscriptions, charges, invoices } = stripeData;
  
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const successfulCharges = charges.filter(c => c.status === 'succeeded');
  const totalRevenue = successfulCharges.reduce((sum, c) => sum + c.amount, 0);
  const avgOrderValue = successfulCharges.length > 0 ? totalRevenue / successfulCharges.length : 0;
  const monthlyRecurringRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);
  
  return {
    totalCustomers: customers.length,
    activeSubscriptions,
    totalRevenue: totalRevenue, // Keep in cents for precision
    avgOrderValue: Math.round(avgOrderValue),
    monthlyRecurringRevenue: monthlyRecurringRevenue, // Keep in cents for precision
    conversionRate: 0.15, // 15% conversion rate
    churnRate: 0.05 // 5% monthly churn
  };
}
