// Realistic Stripe Data Generator with Proper Relationships
// Generates interconnected Stripe data that mirrors real business patterns

import { seededRandom } from './realistic-data-generator.ts';

// Realistic amount ranges for different business types
const AMOUNT_RANGES = {
  'checkout e-commerce': {
    subscription: { min: 2000, max: 20000 }, // $20-$200/month
    oneTime: { min: 1000, max: 50000 }, // $10-$500
  },
  'b2b saas subscriptions': {
    subscription: { min: 1000, max: 50000 }, // $10-$500/month
    oneTime: { min: 500, max: 10000 }, // $5-$100
  },
  'food delivery platform': {
    subscription: { min: 500, max: 10000 }, // $5-$100/month
    oneTime: { min: 200, max: 20000 }, // $2-$200
  },
  'consumer fitness app': {
    subscription: { min: 2000, max: 20000 }, // $20-$200/month
    oneTime: { min: 1000, max: 30000 }, // $10-$300
  },
  'b2b invoicing': {
    subscription: { min: 0, max: 0 }, // No subscriptions
    oneTime: { min: 5000, max: 100000 }, // $50-$1000
  },
  'property management platform': {
    subscription: { min: 0, max: 0 }, // No subscriptions
    oneTime: { min: 10000, max: 200000 }, // $100-$2000
  },
  'creator platform': {
    subscription: { min: 500, max: 10000 }, // $5-$100/month
    oneTime: { min: 200, max: 20000 }, // $2-$200
  },
  'donation marketplace': {
    subscription: { min: 0, max: 0 }, // No subscriptions
    oneTime: { min: 500, max: 50000 }, // $5-$500
  },
  // Legacy mappings for backward compatibility
  saas: {
    subscription: { min: 1000, max: 50000 }, // $10-$500/month
    oneTime: { min: 500, max: 10000 }, // $5-$100
  },
  ecommerce: {
    subscription: { min: 2000, max: 20000 }, // $20-$200/month
    oneTime: { min: 1000, max: 50000 }, // $10-$500
  },
  marketplace: {
    subscription: { min: 500, max: 10000 }, // $5-$100/month
    oneTime: { min: 200, max: 20000 }, // $2-$200
  },
  default: {
    subscription: { min: 1000, max: 30000 }, // $10-$300/month
    oneTime: { min: 500, max: 30000 }, // $5-$300
  }
};

// Round amount to nearest dollar
function roundAmount(amount: number): number {
  return Math.round(amount / 100) * 100;
}

// Generate realistic amounts based on business type
function generateRealisticAmount(businessType: string, type: 'subscription' | 'oneTime', seed: number): number {
  const ranges = AMOUNT_RANGES[businessType as keyof typeof AMOUNT_RANGES] || AMOUNT_RANGES.default;
  const range = ranges[type];
  const amount = Math.floor(seededRandom(seed) * (range.max - range.min) + range.min);
  return roundAmount(amount);
}

// Generate realistic customer data
function generateCustomer(seed: number): { id: string; name: string; email: string; created: number } {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Phoenix', 'Blake', 'Drew', 'Cameron', 'Hayden', 'Parker', 'Reese', 'Skyler', 'Finley', 'Rowan'];
  const lastNames = ['Anderson', 'Martinez', 'Thompson', 'Garcia', 'Wilson', 'Rodriguez', 'Lee', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen'];
  const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com', 'protonmail.com'];
  
  const firstName = firstNames[Math.floor(seededRandom(seed) * firstNames.length)];
  const lastName = lastNames[Math.floor(seededRandom(seed + 1) * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  const domain = domains[Math.floor(seededRandom(seed + 2) * domains.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
  
  // Generate realistic creation date (last 2 years, weighted towards recent)
  const daysAgo = Math.floor(Math.pow(seededRandom(seed + 3), 2) * 730); // Weighted towards recent
  const created = Math.floor(Date.now() / 1000) - (daysAgo * 86400);
  
  return {
    id: `cus_${seededRandom(seed + 4).toString(36).substring(2, 15)}`,
    name,
    email,
    created
  };
}

// Generate realistic subscription plans
function generatePlan(seed: number, businessType: string): any {
  const planNames = {
    saas: ['Starter', 'Professional', 'Business', 'Enterprise', 'Team', 'Individual'],
    ecommerce: ['Basic', 'Standard', 'Premium', 'Pro', 'Growth', 'Scale'],
    marketplace: ['Seller', 'Vendor', 'Merchant', 'Partner', 'Pro', 'Enterprise']
  };
  
  const businessPlans = planNames[businessType as keyof typeof planNames] || planNames.saas;
  const name = businessPlans[Math.floor(seededRandom(seed) * businessPlans.length)];
  
  // Most plans are monthly, with occasional yearly plans
  const interval = seededRandom(seed + 1) < 0.8 ? 'month' : 'year';
  const amount = generateRealisticAmount(businessType, 'subscription', seed + 2);
  
  return {
    id: `plan_${seededRandom(seed + 3).toString(36).substring(2, 15)}`,
    name,
    amount,
    interval,
    currency: 'usd'
  };
}

// Generate interconnected Stripe data
export function generateRealisticStripeData(
  businessType: string = 'saas',
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
      // E-commerce: high volume, mixed payments (growth stage = mid-market)
      'checkout e-commerce': { customers: 25000, subscriptions: 0, charges: 150000, invoices: 25000 },
      // B2B SaaS: moderate customers, high subscriptions (growth stage = mid-market)
      'b2b saas subscriptions': { customers: 5000, subscriptions: 12000, charges: 25000, invoices: 5000 },
      // Food delivery: very high volume, low subscriptions (growth stage = mid-market)
      'food delivery platform': { customers: 50000, subscriptions: 0, charges: 300000, invoices: 50000 },
      // Consumer fitness: moderate volume, mixed payments (growth stage = mid-market)
      'consumer fitness app': { customers: 15000, subscriptions: 25000, charges: 75000, invoices: 15000 },
      // B2B invoicing: moderate volume, high invoices (growth stage = mid-market)
      'b2b invoicing': { customers: 3000, subscriptions: 0, charges: 15000, invoices: 12000 },
      // Property management: low volume, high value (growth stage = mid-market)
      'property management platform': { customers: 2000, subscriptions: 0, charges: 10000, invoices: 8000 },
      // Creator platform: high volume, mixed payments (growth stage = mid-market)
      'creator platform': { customers: 30000, subscriptions: 0, charges: 180000, invoices: 30000 },
      // Donation marketplace: moderate volume, mixed payments (growth stage = mid-market)
      'donation marketplace': { customers: 20000, subscriptions: 0, charges: 120000, invoices: 20000 },
      // Legacy mappings for backward compatibility
      saas: { customers: 5000, subscriptions: 12000, charges: 25000, invoices: 5000 },
      ecommerce: { customers: 25000, subscriptions: 0, charges: 150000, invoices: 25000 },
      marketplace: { customers: 30000, subscriptions: 0, charges: 180000, invoices: 30000 }
    };
    
    const businessCounts = baseCounts[type.toLowerCase() as keyof typeof baseCounts] || baseCounts.saas;
    
    // Apply stage multipliers for realistic scaling
    const stageMultipliers = {
      early: 0.1,     // 10% of growth stage (startup phase)
      growth: 1.0,    // Base stage (mid-market)
      enterprise: 20.0 // 20x growth stage (enterprise scale)
    };
    
    const stageMultiplier = stageMultipliers[stage as keyof typeof stageMultipliers] || 1.0;
    
    // Add some randomness (±20%) to make it more realistic
    // For enterprise stage, add additional variation to simulate real-world complexity
    const enterpriseVariation = stage === 'enterprise' ? (0.7 + Math.random() * 0.6) : 1.0;
    
    return {
      customers: Math.floor(businessCounts.customers * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation),
      subscriptions: Math.floor(businessCounts.subscriptions * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation),
      charges: Math.floor(businessCounts.charges * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation),
      invoices: Math.floor(businessCounts.invoices * stageMultiplier * (0.8 + Math.random() * 0.4) * enterpriseVariation)
    };
  };
  
  const realisticCounts = getRealisticCounts(businessType);
  const counts = {
    ...realisticCounts,
    ...options
  };

  // Generate customers first
  const customers = [];
  for (let i = 0; i < counts.customers; i++) {
    customers.push(generateCustomer(i * 1000));
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
      const created = Math.max(customer.created, Math.floor(Date.now() / 1000) - Math.floor(seededRandom(seed + 2) * 86400 * 180)); // Last 6 months
      
      const subscriptionId = `sub_${seededRandom(seed + 3).toString(36).substring(2, 15)}`;
      subscriptionIds.push(subscriptionId);
      
      const statuses = ['active', 'trialing', 'past_due', 'canceled'];
      const status = statuses[Math.floor(seededRandom(seed + 4) * statuses.length)];
      
      const currentPeriodStart = created + Math.floor(seededRandom(seed + 5) * 86400 * 30);
      const currentPeriodEnd = currentPeriodStart + (plan.interval === 'month' ? 86400 * 30 : 86400 * 365);
      
      subscriptions.push({
        id: subscriptionId,
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
          customer_name: customer.name
        }
      });
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
        // For e-commerce, create invoices without subscriptions
        customer = customers[Math.floor(seededRandom(seed) * customers.length)];
        subscription = null;
      }
    
    const invoiceId = `in_${seededRandom(seed + 1).toString(36).substring(2, 15)}`;
    invoiceIds.push(invoiceId);
    
    const amount = subscription?.amount || 0;
    const created = subscription ? subscription.current_period_start + Math.floor(seededRandom(seed + 2) * 86400 * 30) : Math.floor(Date.now() / 1000) - Math.floor(seededRandom(seed + 2) * 86400 * 30);
    const statuses = ['paid', 'open', 'draft'];
    const status = statuses[Math.floor(seededRandom(seed + 3) * statuses.length)];
    
    // Ensure amount is valid
    const validAmount = isNaN(amount) || amount <= 0 ? generateRealisticAmount('ecommerce', 'subscription', seed + 4) : amount;
    
    invoices.push({
      id: invoiceId,
      object: 'invoice',
      customer: customer!.id,
      subscription: subscription?.id || null,
      amount_due: status === 'paid' ? 0 : validAmount,
      amount_paid: status === 'paid' ? validAmount : 0,
      amount_remaining: status === 'paid' ? 0 : validAmount,
      total: validAmount,
      subtotal: validAmount,
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
        customer_name: customer!.name
      }
    });
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
    
    const chargeId = `ch_${seededRandom(seed + 1).toString(36).substring(2, 15)}`;
    const invoiceAmount = invoice?.total || 0;
    const created = invoice?.created || Math.floor(Date.now() / 1000);
    
    const statuses = ['succeeded', 'pending', 'failed'];
    const status = statuses[Math.floor(seededRandom(seed + 3) * statuses.length)];
    
    // Some charges are one-time payments (not from subscriptions)
    const isOneTime = Math.random() < 0.3; // 30% one-time payments
    const oneTimeAmount = isOneTime ? generateRealisticAmount(businessType, 'oneTime', seed + 4) : 0;
    
    // Ensure amount is valid - charges should match invoice amounts
    const validAmount = isOneTime ? oneTimeAmount : (isNaN(invoiceAmount) || invoiceAmount <= 0 ? generateRealisticAmount(businessType, 'subscription', seed + 5) : invoiceAmount);
    
    charges.push({
      id: chargeId,
      object: 'charge',
      amount: validAmount,
      amount_captured: status === 'succeeded' ? validAmount : 0,
      amount_refunded: 0,
      currency: 'usd',
      customer: customer!.id,
      invoice: isOneTime ? undefined : invoice?.id,
      description: isOneTime ? `One-time payment from ${customer!.name}` : `Payment for ${invoice?.id || 'invoice'}`,
      status,
      created,
      paid: status === 'succeeded',
      captured: status === 'succeeded',
      livemode: false,
      metadata: {
        customer_name: customer!.name,
        payment_type: isOneTime ? 'one_time' : 'subscription'
      },
      payment_method_details: {
        type: 'card',
        card: {
          brand: ['visa', 'mastercard', 'amex'][Math.floor(seededRandom(seed + 5) * 3)],
          last4: Math.floor(seededRandom(seed + 6) * 9000 + 1000).toString(),
          exp_month: Math.floor(seededRandom(seed + 7) * 12) + 1,
          exp_year: new Date().getFullYear() + Math.floor(seededRandom(seed + 8) * 3)
        }
      }
    });
  }
  
  // Generate additional one-time charges if needed
  if (customers.length > 0) {
    for (let i = invoices.length; i < counts.charges; i++) {
      const seed = i * 5000;
      const customer = customers[Math.floor(seededRandom(seed) * customers.length)];
    
    const chargeId = `ch_${seededRandom(seed + 1).toString(36).substring(2, 15)}`;
    const oneTimeAmount = generateRealisticAmount(businessType, 'oneTime', seed + 4);
    const created = Math.floor(Date.now() / 1000) - Math.floor(seededRandom(seed + 2) * 86400 * 30); // Last month
    
    const statuses = ['succeeded', 'pending', 'failed'];
    const status = statuses[Math.floor(seededRandom(seed + 3) * statuses.length)];
    
    charges.push({
      id: chargeId,
      object: 'charge',
      amount: oneTimeAmount,
      amount_captured: status === 'succeeded' ? oneTimeAmount : 0,
      amount_refunded: 0,
      currency: 'usd',
      customer: customer.id,
      invoice: undefined, // One-time payment
      description: `One-time payment from ${customer.name}`,
      status,
      created,
      paid: status === 'succeeded',
      captured: status === 'succeeded',
      livemode: false,
      metadata: {
        customer_name: customer.name,
        payment_type: 'one_time'
      },
      payment_method_details: {
        type: 'card',
        card: {
          brand: ['visa', 'mastercard', 'amex'][Math.floor(seededRandom(seed + 5) * 3)],
          last4: Math.floor(seededRandom(seed + 6) * 9000 + 1000).toString(),
          exp_month: Math.floor(seededRandom(seed + 7) * 12) + 1,
          exp_year: new Date().getFullYear() + Math.floor(seededRandom(seed + 8) * 3)
        }
      }
    });
  }
  }

  return {
    customers,
    subscriptions,
    invoices,
    charges,
    plans,
    // Add metadata to help with debugging
    _metadata: {
      generatedAt: new Date().toISOString(),
      businessType,
      counts: {
        customers: customers.length,
        subscriptions: subscriptions.length,
        invoices: invoices.length,
        charges: charges.length,
        plans: plans.length
      }
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
    totalRevenue: roundAmount(totalRevenue),
    avgOrderValue: roundAmount(avgOrderValue),
    monthlyRecurringRevenue: roundAmount(monthlyRecurringRevenue),
    conversionRate: 0.15, // 15% conversion rate
    churnRate: 0.05 // 5% monthly churn
  };
}
