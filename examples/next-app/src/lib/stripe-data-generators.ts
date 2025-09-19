// Stripe Data Generators for Synthkit
// Generates realistic Stripe data objects based on Stripe Data Schema

import { seededRandom } from './realistic-data-generator.ts';

// Base Stripe data interfaces
export interface StripeCharge {
  id: string;
  object: 'charge';
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  application_fee_amount?: number;
  balance_transaction: string;
  billing_details: {
    address: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
    email?: string;
    name?: string;
    phone?: string;
  };
  calculated_statement_descriptor?: string;
  captured: boolean;
  created: number;
  currency: string;
  customer?: string;
  description?: string;
  destination?: string;
  dispute?: string;
  disputed: boolean;
  failure_code?: string;
  failure_message?: string;
  fraud_details: {
    user_report?: string;
    stripe_report?: string;
  };
  invoice?: string;
  livemode: boolean;
  metadata: Record<string, string>;
  on_behalf_of?: string;
  order?: string;
  outcome?: {
    network_status: string;
    reason?: string;
    risk_level: string;
    risk_score: number;
    seller_message: string;
    type: string;
  };
  paid: boolean;
  payment_intent?: string;
  payment_method?: string;
  payment_method_details: {
    type: string;
    card?: {
      brand: string;
      checks: {
        address_line1_check?: string;
        address_postal_code_check?: string;
        cvc_check?: string;
      };
      country: string;
      exp_month: number;
      exp_year: number;
      fingerprint: string;
      funding: string;
      installments?: {
        plan: {
          count: number;
          interval: string;
          type: string;
        };
      };
      last4: string;
      mandate?: string;
      network: string;
      three_d_secure_authentication?: {
        authentication_flow?: string;
        result?: string;
        result_reason?: string;
        version?: string;
      };
      wallet?: {
        type: string;
        dynamic_last4?: string;
        apple_pay?: Record<string, any>;
        google_pay?: Record<string, any>;
      };
    };
  };
  receipt_email?: string;
  receipt_number?: string;
  receipt_url?: string;
  refunded: boolean;
  refunds: {
    object: 'list';
    data: StripeRefund[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  review?: string;
  shipping?: {
    address: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
    carrier?: string;
    name?: string;
    phone?: string;
    tracking_number?: string;
  };
  source?: any;
  source_transfer?: string;
  statement_descriptor?: string;
  statement_descriptor_suffix?: string;
  status: 'succeeded' | 'pending' | 'failed';
  transfer_data?: {
    amount?: number;
    destination: string;
  };
  transfer_group?: string;
}

export interface StripeRefund {
  id: string;
  object: 'refund';
  amount: number;
  charge: string;
  created: number;
  currency: string;
  metadata: Record<string, string>;
  payment_intent?: string;
  reason?: string;
  receipt_number?: string;
  status: 'succeeded' | 'pending' | 'failed' | 'canceled';
}

export interface StripeSubscription {
  id: string;
  object: 'subscription';
  application_fee_percent?: number;
  automatic_tax: {
    enabled: boolean;
  };
  billing_cycle_anchor: number;
  billing_thresholds?: {
    amount_gte?: number;
    reset_billing_cycle_anchor?: boolean;
  };
  cancel_at?: number;
  cancel_at_period_end: boolean;
  canceled_at?: number;
  cancellation_details?: {
    comment?: string;
    feedback?: string;
    reason?: string;
  };
  collection_method: 'charge_automatically' | 'send_invoice';
  created: number;
  currency: string;
  current_period_end: number;
  current_period_start: number;
  customer: string;
  default_payment_method?: string;
  default_source?: string;
  default_tax_rates: any[];
  description?: string;
  discount?: any;
  ended_at?: number;
  items: {
    object: 'list';
    data: StripeSubscriptionItem[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  latest_invoice?: string;
  livemode: boolean;
  metadata: Record<string, string>;
  next_pending_invoice_item_invoice?: string;
  on_behalf_of?: string;
  pause_collection?: {
    behavior: string;
    resumes_at?: number;
  };
  payment_settings?: {
    payment_method_options?: any;
    payment_method_types?: string[];
    save_default_payment_method?: string;
  };
  pending_invoice_item_interval?: {
    interval: string;
    interval_count: number;
  };
  pending_setup_intent?: string;
  pending_update?: any;
  schedule?: string;
  start_date: number;
  status: 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
  test_clock?: string;
  transfer_data?: {
    amount_percent?: number;
    destination: string;
  };
  trial_end?: number;
  trial_start?: number;
}

export interface StripeSubscriptionItem {
  id: string;
  object: 'subscription_item';
  billing_thresholds?: {
    usage_gte: number;
  };
  created: number;
  metadata: Record<string, string>;
  plan: StripePlan;
  price: StripePrice;
  quantity: number;
  subscription: string;
  tax_rates: any[];
}

export interface StripePlan {
  id: string;
  object: 'plan';
  active: boolean;
  aggregate_usage?: string;
  amount: number;
  amount_decimal: string;
  billing_scheme: 'per_unit' | 'tiered';
  created: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  interval_count: number;
  livemode: boolean;
  metadata: Record<string, string>;
  nickname?: string;
  product: string;
  tiers?: any[];
  tiers_mode?: string;
  transform_usage?: any;
  trial_period_days?: number;
  usage_type: 'licensed' | 'metered';
}

export interface StripePrice {
  id: string;
  object: 'price';
  active: boolean;
  billing_scheme: 'per_unit' | 'tiered';
  created: number;
  currency: string;
  custom_unit_amount?: any;
  livemode: boolean;
  lookup_key?: string;
  metadata: Record<string, string>;
  nickname?: string;
  product: string;
  recurring?: {
    aggregate_usage?: string;
    interval: string;
    interval_count: number;
    trial_period_days?: number;
    usage_type: string;
  };
  tax_behavior: 'inclusive' | 'exclusive' | 'unspecified';
  tiers?: any[];
  tiers_mode?: string;
  transform_quantity?: any;
  type: 'one_time' | 'recurring';
  unit_amount?: number;
  unit_amount_decimal?: string;
}

export interface StripeInvoice {
  id: string;
  object: 'invoice';
  account_country?: string;
  account_name?: string;
  account_tax_ids?: any[];
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  amount_shipping?: number;
  application?: string;
  application_fee_amount?: number;
  attempt_count: number;
  attempted: boolean;
  auto_advance?: boolean;
  automatic_tax: {
    enabled: boolean;
    status?: string;
  };
  billing_reason?: string;
  charge?: string;
  collection_method: 'charge_automatically' | 'send_invoice';
  created: number;
  currency: string;
  custom_fields?: any[];
  customer: string;
  customer_address?: any;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_shipping?: any;
  customer_tax_exempt?: string;
  default_payment_method?: string;
  default_source?: string;
  default_tax_rates: any[];
  description?: string;
  discount?: any;
  due_date?: number;
  ending_balance?: number;
  footer?: string;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  last_finalization_invoice?: string;
  last_payment_intent?: string;
  lines: {
    object: 'list';
    data: any[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  livemode: boolean;
  metadata: Record<string, string>;
  next_payment_attempt?: number;
  number?: string;
  on_behalf_of?: string;
  paid: boolean;
  paid_out_of_band: boolean;
  payment_intent?: string;
  period_end: number;
  period_start: number;
  post_payment_credit_notes_amount: number;
  pre_payment_credit_notes_amount: number;
  quote?: string;
  receipt_number?: string;
  rendering_options?: any;
  shipping?: any;
  starting_balance: number;
  statement_descriptor?: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  status_transitions: any;
  subscription?: string;
  subtotal: number;
  subtotal_excluding_tax: number;
  tax?: number;
  total: number;
  total_discount_amounts: any[];
  total_tax_amounts: any[];
  transfer_data?: any;
  webhooks_delivered_at?: number;
}

// Utility functions
function generateStripeId(prefix: string): string {
  const seed1 = Math.random() * 1000000;
  const seed2 = Math.random() * 1000000;
  return `${prefix}_${seededRandom(seed1).toString(36).substring(2, 15)}${seededRandom(seed2).toString(36).substring(2, 15)}`;
}

function generateCardBrand(): string {
  const brands = ['visa', 'mastercard', 'amex', 'discover'];
  return brands[Math.floor(seededRandom(Math.random() * 1000000) * brands.length)];
}

function generateCardLast4(): string {
  return Math.floor(seededRandom(Math.random() * 1000000) * 9000 + 1000).toString();
}

// Data generators
export function generateCharges(count: number, customerIds: string[] = []): StripeCharge[] {
  const charges: StripeCharge[] = [];
  const statuses = ['succeeded', 'pending', 'failed'];
  const currencies = ['usd', 'eur', 'gbp'];
  
  for (let i = 0; i < count; i++) {
    const seed = i * 1000;
    const amount = Math.floor(seededRandom(seed) * 10000 + 100); // $1.00 to $100.00
    const status = statuses[Math.floor(seededRandom(seed + 1) * statuses.length)];
    const currency = currencies[Math.floor(seededRandom(seed + 2) * currencies.length)];
    const brand = generateCardBrand();
    const last4 = generateCardLast4();
    
    charges.push({
      id: generateStripeId('ch'),
      object: 'charge',
      amount,
      amount_captured: status === 'succeeded' ? amount : 0,
      amount_refunded: 0,
      balance_transaction: generateStripeId('txn'),
      billing_details: {
        address: {
          city: 'San Francisco',
          country: 'US',
          line1: '123 Main St',
          postal_code: '94105',
          state: 'CA'
        },
        email: `customer${i}@example.com`,
        name: `Customer ${i + 1}`
      },
      captured: status === 'succeeded',
      created: Math.floor(Date.now() / 1000) - Math.floor(seededRandom(seed + 5) * 86400 * 30), // Last 30 days
      currency,
      customer: customerIds[Math.floor(seededRandom(seed + 3) * customerIds.length)] || generateStripeId('cus'),
      description: `Payment for order #${Math.floor(seededRandom(seed + 4) * 10000)}`,
      disputed: false,
      failure_code: status === 'failed' ? 'card_declined' : undefined,
      failure_message: status === 'failed' ? 'Your card was declined.' : undefined,
      fraud_details: {},
      livemode: false,
      metadata: {
        order_id: `order_${i + 1}`,
        source: 'web'
      },
      paid: status === 'succeeded',
      payment_method: generateStripeId('pm'),
      payment_method_details: {
        type: 'card',
        card: {
          brand,
          checks: {
            address_line1_check: 'pass',
            address_postal_code_check: 'pass',
            cvc_check: 'pass'
          },
          country: 'US',
          exp_month: Math.floor(seededRandom(seed + 6) * 12) + 1,
          exp_year: new Date().getFullYear() + Math.floor(seededRandom(seed + 7) * 5),
          fingerprint: generateStripeId('fp'),
          funding: 'credit',
          last4,
          network: brand === 'amex' ? 'amex' : 'visa'
        }
      },
      refunded: false,
      refunds: {
        object: 'list',
        data: [],
        has_more: false,
        total_count: 0,
        url: ''
      },
      status: status as 'succeeded' | 'pending' | 'failed',
      transfer_data: undefined
    });
  }
  
  return charges;
}

export function generateSubscriptions(count: number, customerIds: string[] = []): StripeSubscription[] {
  const subscriptions: StripeSubscription[] = [];
  const statuses = ['active', 'trialing', 'past_due', 'canceled'];
  const intervals = ['month', 'year'];
  
  for (let i = 0; i < count; i++) {
    const seed = i * 2000;
    const status = statuses[Math.floor(seededRandom(seed) * statuses.length)];
    const interval = intervals[Math.floor(seededRandom(seed + 1) * intervals.length)];
    const created = Math.floor(Date.now() / 1000) - Math.floor(seededRandom(seed + 2) * 86400 * 365); // Last year
    const currentPeriodStart = created + Math.floor(seededRandom(seed + 3) * 86400 * 30);
    const currentPeriodEnd = currentPeriodStart + (interval === 'month' ? 86400 * 30 : 86400 * 365);
    
    subscriptions.push({
      id: generateStripeId('sub'),
      object: 'subscription',
      automatic_tax: {
        enabled: false
      },
      billing_cycle_anchor: currentPeriodStart,
      cancel_at_period_end: false,
      collection_method: 'charge_automatically',
      created,
      currency: 'usd',
      current_period_end: currentPeriodEnd,
      current_period_start: currentPeriodStart,
      customer: customerIds[Math.floor(seededRandom(seed + 4) * customerIds.length)] || generateStripeId('cus'),
      default_tax_rates: [],
      items: {
        object: 'list',
        data: [{
          id: generateStripeId('si'),
          object: 'subscription_item',
          created,
          metadata: {},
          plan: {
            id: generateStripeId('plan'),
            object: 'plan',
            active: true,
            amount: Math.floor(seededRandom(seed + 5) * 5000 + 1000), // $10 to $50
            amount_decimal: (Math.floor(seededRandom(seed + 6) * 5000 + 1000)).toString(),
            billing_scheme: 'per_unit',
            created,
            currency: 'usd',
            interval: interval as 'day' | 'week' | 'month' | 'year',
            interval_count: 1,
            livemode: false,
            metadata: {},
            product: generateStripeId('prod'),
            usage_type: 'licensed'
          },
          price: {
            id: generateStripeId('price'),
            object: 'price',
            active: true,
            billing_scheme: 'per_unit',
            created,
            currency: 'usd',
            livemode: false,
            metadata: {},
            product: generateStripeId('prod'),
            recurring: {
              interval,
              interval_count: 1,
              usage_type: 'licensed'
            },
            tax_behavior: 'unspecified',
            type: 'recurring',
            unit_amount: Math.floor(seededRandom(seed + 7) * 5000 + 1000)
          },
          quantity: 1,
          subscription: generateStripeId('sub'),
          tax_rates: []
        }],
        has_more: false,
        total_count: 1,
        url: ''
      },
      livemode: false,
      metadata: {
        plan_name: `Plan ${i + 1}`,
        source: 'web'
      },
      start_date: created,
      status: status as 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused'
    });
  }
  
  return subscriptions;
}

export function generateInvoices(count: number, customerIds: string[] = [], subscriptionIds: string[] = []): StripeInvoice[] {
  const invoices: StripeInvoice[] = [];
  const statuses = ['paid', 'open', 'draft', 'void'];
  
  for (let i = 0; i < count; i++) {
    const seed = i * 3000;
    const status = statuses[Math.floor(seededRandom(seed) * statuses.length)];
    const amount = Math.floor(seededRandom(seed + 1) * 10000 + 1000); // $10 to $100
    const created = Math.floor(Date.now() / 1000) - Math.floor(seededRandom(seed + 2) * 86400 * 30);
    const periodStart = created - 86400 * 30;
    const periodEnd = created;
    
    invoices.push({
      id: generateStripeId('in'),
      object: 'invoice',
      amount_due: status === 'paid' ? 0 : amount,
      amount_paid: status === 'paid' ? amount : 0,
      amount_remaining: status === 'paid' ? 0 : amount,
      attempt_count: status === 'paid' ? 1 : 0,
      attempted: status === 'paid',
      automatic_tax: {
        enabled: false
      },
      collection_method: 'charge_automatically',
      created,
      currency: 'usd',
      customer: customerIds[Math.floor(seededRandom(seed + 3) * customerIds.length)] || generateStripeId('cus'),
      default_tax_rates: [],
      description: `Invoice for subscription ${i + 1}`,
      lines: {
        object: 'list',
        data: [],
        has_more: false,
        total_count: 0,
        url: ''
      },
      livemode: false,
      metadata: {
        invoice_number: `INV-${i + 1}`,
        source: 'subscription'
      },
      paid: status === 'paid',
      paid_out_of_band: false,
      period_end: periodEnd,
      period_start: periodStart,
      post_payment_credit_notes_amount: 0,
      pre_payment_credit_notes_amount: 0,
      starting_balance: 0,
      status: status as 'draft' | 'open' | 'paid' | 'uncollectible' | 'void',
      status_transitions: {},
      subscription: subscriptionIds[Math.floor(seededRandom(seed + 4) * subscriptionIds.length)] || generateStripeId('sub'),
      subtotal: amount,
      subtotal_excluding_tax: amount,
      total: amount,
      total_discount_amounts: [],
      total_tax_amounts: []
    });
  }
  
  return invoices;
}

// Import the realistic generators
import { generateRealisticStripeData, generateStripeMetadata } from './realistic-stripe-generator.ts';

// Main function to generate all Stripe data for a persona
export function generateStripeDataForPersona(
  persona: any, 
  stage: string = 'growth',
  counts: { charges?: number; subscriptions?: number; invoices?: number } = {}
): Record<string, any[]> {
  // Map persona name to business type key
  const personaName = persona.name || '';
  const businessTypeMap: Record<string, string> = {
    'Checkout e-commerce': 'checkout-ecommerce',
    'B2B SaaS subscriptions': 'b2b-saas-subscriptions',
    'Food delivery platform': 'food-delivery-platform',
    'Consumer fitness app': 'consumer-fitness-app',
    'B2B invoicing': 'b2b-invoicing',
    'Property management platform': 'property-management-platform',
    'Creator platform': 'creator-platform',
    'Donation marketplace': 'donation-marketplace'
  };
  
  const businessType = businessTypeMap[personaName] || 'b2b-saas-subscriptions';
  
  return generateRealisticStripeData(businessType, stage, counts);
}

// Function to generate metadata and sample data for UI display (performance optimized)
export function generateStripeMetadataForPersona(
  persona: any, 
  stage: string = 'growth',
  counts: { charges?: number; subscriptions?: number; invoices?: number } = {}
): Record<string, any[]> {
  // Map persona name to business type key
  const personaName = persona.name || '';
  const businessTypeMap: Record<string, string> = {
    'Checkout e-commerce': 'checkout-ecommerce',
    'B2B SaaS subscriptions': 'b2b-saas-subscriptions',
    'Food delivery platform': 'food-delivery-platform',
    'Consumer fitness app': 'consumer-fitness-app',
    'B2B invoicing': 'b2b-invoicing',
    'Property management platform': 'property-management-platform',
    'Creator platform': 'creator-platform',
    'Donation marketplace': 'donation-marketplace'
  };
  
  const businessType = businessTypeMap[personaName] || 'b2b-saas-subscriptions';
  
  return generateStripeMetadata(businessType, stage, counts);
}
