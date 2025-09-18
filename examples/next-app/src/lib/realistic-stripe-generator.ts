// Realistic Stripe Data Generator with Proper Relationships
// Generates interconnected Stripe data that mirrors real business patterns

import { seededRandom } from './realistic-data-generator.ts';

// Realistic amount ranges for different business types
const AMOUNT_RANGES = {
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
  const names = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'David Wilson', 'Lisa Brown', 'Chris Taylor', 'Amy Garcia'];
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'startup.io'];
  
  const name = names[Math.floor(seededRandom(seed) * names.length)];
  const domain = domains[Math.floor(seededRandom(seed + 1) * domains.length)];
  const email = `${name.toLowerCase().replace(' ', '.')}@${domain}`;
  
  return {
    id: `cus_${seededRandom(seed + 2).toString(36).substring(2, 15)}`,
    name,
    email,
    created: Math.floor(Date.now() / 1000) - Math.floor(seededRandom(seed + 3) * 86400 * 365) // Last year
  };
}

// Generate realistic subscription plans
function generatePlan(seed: number, businessType: string): any {
  const planNames = ['Basic', 'Pro', 'Enterprise', 'Starter', 'Growth', 'Premium'];
  const intervals = ['month', 'year'];
  
  const name = planNames[Math.floor(seededRandom(seed) * planNames.length)];
  const interval = intervals[Math.floor(seededRandom(seed + 1) * intervals.length)];
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
  options: {
    customers?: number;
    subscriptions?: number;
    charges?: number;
    invoices?: number;
  } = {}
): Record<string, any[]> {
  const counts = {
    customers: 25,
    subscriptions: 15,
    charges: 40,
    invoices: 20,
    ...options
  };

  // Generate customers first
  const customers = [];
  for (let i = 0; i < counts.customers; i++) {
    customers.push(generateCustomer(i * 1000));
  }

  // Generate subscription plans
  const plans = [];
  for (let i = 0; i < 5; i++) {
    plans.push(generatePlan(i * 2000, businessType));
  }

  // Generate subscriptions linked to customers and plans
  const subscriptions = [];
  const subscriptionIds = [];
  
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

  // Generate invoices linked to subscriptions
  const invoices = [];
  const invoiceIds = [];
  
  for (let i = 0; i < counts.invoices; i++) {
    const seed = i * 4000;
    const subscription = subscriptions[Math.floor(seededRandom(seed) * subscriptions.length)];
    const customer = customers.find(c => c.id === subscription.customer);
    
    const invoiceId = `in_${seededRandom(seed + 1).toString(36).substring(2, 15)}`;
    invoiceIds.push(invoiceId);
    
    const amount = subscription.amount;
    const created = subscription.current_period_start + Math.floor(seededRandom(seed + 2) * 86400 * 30);
    const statuses = ['paid', 'open', 'draft'];
    const status = statuses[Math.floor(seededRandom(seed + 3) * statuses.length)];
    
    invoices.push({
      id: invoiceId,
      object: 'invoice',
      customer: customer!.id,
      subscription: subscription.id,
      amount_due: status === 'paid' ? 0 : amount,
      amount_paid: status === 'paid' ? amount : 0,
      amount_remaining: status === 'paid' ? 0 : amount,
      total: amount,
      subtotal: amount,
      currency: 'usd',
      status,
      created,
      period_start: subscription.current_period_start,
      period_end: subscription.current_period_end,
      paid: status === 'paid',
      attempt_count: status === 'paid' ? 1 : 0,
      attempted: status === 'paid',
      collection_method: 'charge_automatically',
      automatic_tax: { enabled: false },
      default_tax_rates: [],
      livemode: false,
      metadata: {
        subscription_id: subscription.id,
        customer_name: customer!.name
      }
    });
  }

  // Generate charges linked to invoices and customers
  const charges = [];
  
  for (let i = 0; i < counts.charges; i++) {
    const seed = i * 5000;
    const invoice = invoices[Math.floor(seededRandom(seed) * invoices.length)];
    const customer = customers.find(c => c.id === invoice.customer);
    
    const chargeId = `ch_${seededRandom(seed + 1).toString(36).substring(2, 15)}`;
    const amount = invoice.amount;
    const created = invoice.created + Math.floor(seededRandom(seed + 2) * 86400 * 7); // Within a week of invoice
    
    const statuses = ['succeeded', 'pending', 'failed'];
    const status = statuses[Math.floor(seededRandom(seed + 3) * statuses.length)];
    
    // Some charges are one-time payments (not from subscriptions)
    const isOneTime = Math.random() < 0.3; // 30% one-time payments
    const oneTimeAmount = isOneTime ? generateRealisticAmount(businessType, 'oneTime', seed + 4) : amount;
    
    charges.push({
      id: chargeId,
      object: 'charge',
      amount: isOneTime ? oneTimeAmount : amount,
      amount_captured: status === 'succeeded' ? (isOneTime ? oneTimeAmount : amount) : 0,
      amount_refunded: 0,
      currency: 'usd',
      customer: customer!.id,
      invoice: isOneTime ? undefined : invoice.id,
      description: isOneTime ? `One-time payment from ${customer!.name}` : `Payment for ${invoice.id}`,
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

  return {
    customers,
    subscriptions,
    invoices,
    charges,
    plans
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
