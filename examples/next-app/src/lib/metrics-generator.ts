// Comprehensive Metrics Generator for Stripe Datasets
// Generates realistic metrics with proper categorization and time series data

import { seededRandom } from './realistic-data-generator';

// ============================================================================
// METRIC DEFINITIONS & CATEGORIZATION
// ============================================================================

export interface MetricData {
  name: string;
  category: string;
  type: 'calculated' | 'synthesized' | 'not_included';
  unit: 'Volume ($)' | 'Count (#)' | 'Rate (%)' | 'Rate (bps)';
  chartType: 'Line chart' | 'Bar chart' | 'List/Table' | 'Heat map' | 'Line chart with comparison' | 'Bar chart with comparison';
  timeSeries: {
    daily: number[];    // 365 values
    weekly: number[];   // 52 values  
    monthly: number[];  // 12 values
  };
  currentValue: number;
  exampleValue: number;
  available: boolean;
  description?: string;
}

// Business type specific metric availability
const METRIC_AVAILABILITY = {
  'checkout-ecommerce': {
    // Payment focused, no subscriptions
    subscriptions: false,
    radar: false,
    disputes: true,
    refunds: true,
    authentication: true
  },
  'b2b-saas-subscriptions': {
    // Subscription focused
    subscriptions: true,
    radar: true,
    disputes: true,
    refunds: true,
    authentication: true
  },
  'food-delivery-platform': {
    // High volume, low value
    subscriptions: false,
    radar: true,
    disputes: true,
    refunds: true,
    authentication: false
  },
  'consumer-fitness-app': {
    // Consumer subscriptions
    subscriptions: true,
    radar: false,
    disputes: true,
    refunds: true,
    authentication: false
  },
  'b2b-invoicing': {
    // Invoice focused
    subscriptions: false,
    radar: false,
    disputes: false,
    refunds: true,
    authentication: false
  },
  'property-management-platform': {
    // High value transactions
    subscriptions: false,
    radar: true,
    disputes: true,
    refunds: true,
    authentication: true
  },
  'creator-platform': {
    // Creator economy
    subscriptions: true,
    radar: false,
    disputes: true,
    refunds: true,
    authentication: false
  },
  'donation-marketplace': {
    // Donation focused
    subscriptions: false,
    radar: false,
    disputes: false,
    refunds: true,
    authentication: false
  }
};

// Seasonality patterns for different business types
const SEASONALITY_PATTERNS = {
  'checkout-ecommerce': {
    monthly: [0.8, 0.7, 0.9, 1.0, 1.1, 1.2, 1.0, 0.9, 1.1, 1.0, 1.3, 1.5], // Holiday spikes
    weekly: [0.9, 1.0, 1.1, 1.0, 1.2, 0.8, 0.7], // Mon-Sun
    daily: [0.8, 0.9, 1.0, 1.1, 1.2, 1.0, 0.7]   // Mon-Sun
  },
  'b2b-saas-subscriptions': {
    monthly: [1.1, 0.9, 1.2, 0.8, 0.9, 1.0, 0.7, 0.8, 1.1, 1.0, 1.2, 1.3], // End-of-quarter spikes
    weekly: [1.2, 1.1, 1.0, 1.0, 1.1, 0.8, 0.6], // Mon-Sun
    daily: [1.1, 1.0, 1.0, 1.0, 1.2, 0.9, 0.6]   // Mon-Sun
  },
  'food-delivery-platform': {
    monthly: [1.2, 1.0, 1.1, 1.0, 1.1, 1.0, 0.9, 0.9, 1.0, 1.0, 1.1, 1.2], // Steady with slight spikes
    weekly: [1.1, 1.0, 1.0, 1.0, 1.2, 1.3, 1.1], // Weekend spikes
    daily: [1.0, 1.0, 1.0, 1.0, 1.2, 1.3, 1.1]   // Weekend spikes
  },
  'consumer-fitness-app': {
    monthly: [1.3, 0.8, 0.9, 1.0, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 0.9, 1.2], // New Year spike
    weekly: [1.1, 1.0, 1.0, 1.0, 1.0, 1.2, 1.1], // Weekend activity
    daily: [1.0, 1.0, 1.0, 1.0, 1.0, 1.2, 1.1]   // Weekend activity
  },
  'b2b-invoicing': {
    monthly: [1.2, 0.9, 1.1, 0.8, 0.9, 1.0, 0.7, 0.8, 1.1, 1.0, 1.2, 1.3], // End-of-quarter
    weekly: [1.2, 1.1, 1.0, 1.0, 1.1, 0.8, 0.6], // Mon-Sun
    daily: [1.1, 1.0, 1.0, 1.0, 1.2, 0.9, 0.6]   // Mon-Sun
  },
  'property-management-platform': {
    monthly: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], // Steady
    weekly: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], // Mon-Sun
    daily: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]   // Mon-Sun
  },
  'creator-platform': {
    monthly: [1.1, 0.9, 1.0, 1.0, 1.0, 1.0, 0.9, 0.9, 1.0, 1.0, 1.1, 1.2], // Holiday content
    weekly: [1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.0], // Weekend content
    daily: [1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.0]   // Weekend content
  },
  'donation-marketplace': {
    monthly: [1.2, 0.8, 0.9, 1.0, 1.0, 1.0, 0.9, 0.9, 1.0, 1.0, 1.1, 1.3], // Holiday giving
    weekly: [1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.0], // Weekend giving
    daily: [1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.0]   // Weekend giving
  }
};

// ============================================================================
// CALCULATED METRICS (Direct from Dataset)
// ============================================================================

function calculatePaymentMetrics(dataset: any, businessType: string, stage: string): MetricData[] {
  const charges = dataset.charges || [];
  const successfulCharges = charges.filter((c: any) => c.status === 'succeeded');
  const failedCharges = charges.filter((c: any) => c.status === 'failed');
  
  const totalVolume = charges.reduce((sum: number, c: any) => sum + c.amount, 0);
  const successfulVolume = successfulCharges.reduce((sum: number, c: any) => sum + c.amount, 0);
  const failedVolume = failedCharges.reduce((sum: number, c: any) => sum + c.amount, 0);
  
  const successRate = charges.length > 0 ? (successfulCharges.length / charges.length) * 100 : 0;
  const failureRate = charges.length > 0 ? (failedCharges.length / charges.length) * 100 : 0;
  
  return [
    {
      name: 'Gross Payment Volume',
      category: 'Payments',
      type: 'calculated',
      unit: 'Volume ($)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(totalVolume, businessType, 'volume'),
      currentValue: totalVolume / 100,
      exampleValue: 1016.90,
      available: true
    },
    {
      name: 'Payment Success Rate',
      category: 'Payments',
      type: 'calculated',
      unit: 'Rate (%)',
      chartType: 'Line chart with period comparison',
      timeSeries: generateTimeSeries(successRate, businessType, 'rate'),
      currentValue: successRate,
      exampleValue: 75.93,
      available: true
    },
    {
      name: 'Successful Payments',
      category: 'Payments',
      type: 'calculated',
      unit: 'Count (#)',
      chartType: 'Line chart with comparison',
      timeSeries: generateTimeSeries(successfulCharges.length, businessType, 'count'),
      currentValue: successfulCharges.length,
      exampleValue: 147,
      available: true
    },
    {
      name: 'Accepted Volume',
      category: 'Payments',
      type: 'calculated',
      unit: 'Volume ($)',
      chartType: 'Line chart/Bar chart',
      timeSeries: generateTimeSeries(successfulVolume, businessType, 'volume'),
      currentValue: successfulVolume / 100,
      exampleValue: 480.20,
      available: true
    },
    {
      name: 'Accepted Payments',
      category: 'Payments',
      type: 'calculated',
      unit: 'Count (#)',
      chartType: 'Bar chart with stacked segments',
      timeSeries: generateTimeSeries(successfulCharges.length, businessType, 'count'),
      currentValue: successfulCharges.length,
      exampleValue: 41,
      available: true
    },
    {
      name: 'Failed Card Payments - Failed Volume',
      category: 'Payments',
      type: 'calculated',
      unit: 'Volume ($)',
      chartType: 'Bar chart',
      timeSeries: generateTimeSeries(failedVolume, businessType, 'volume'),
      currentValue: failedVolume / 100,
      exampleValue: 451.01,
      available: true
    },
    {
      name: 'Failed Card Payments - Failed Count',
      category: 'Payments',
      type: 'calculated',
      unit: 'Count (#)',
      chartType: 'Bar chart',
      timeSeries: generateTimeSeries(failedCharges.length, businessType, 'count'),
      currentValue: failedCharges.length,
      exampleValue: 13,
      available: true
    },
    {
      name: 'Failed Card Payments - Failure Rate',
      category: 'Payments',
      type: 'calculated',
      unit: 'Rate (%)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(failureRate, businessType, 'rate'),
      currentValue: failureRate,
      exampleValue: 24.07,
      available: true
    }
  ];
}

function calculateSubscriptionMetrics(dataset: any, businessType: string, stage: string): MetricData[] {
  const subscriptions = dataset.subscriptions || [];
  const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'active');
  const trialingSubscriptions = subscriptions.filter((s: any) => s.status === 'trialing');
  const canceledSubscriptions = subscriptions.filter((s: any) => s.status === 'canceled');
  
  const mrr = activeSubscriptions.reduce((sum: number, s: any) => sum + s.amount, 0);
  
  return [
    {
      name: 'Active Subscribers',
      category: 'Subscriptions',
      type: 'calculated',
      unit: 'Count (#)',
      chartType: 'Line chart with comparison',
      timeSeries: generateTimeSeries(activeSubscriptions.length, businessType, 'count'),
      currentValue: activeSubscriptions.length,
      exampleValue: 42,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.subscriptions || false
    },
    {
      name: 'New Subscribers',
      category: 'Subscriptions',
      type: 'calculated',
      unit: 'Count (#)',
      chartType: 'Line chart with comparison',
      timeSeries: generateTimeSeries(subscriptions.length, businessType, 'count'),
      currentValue: subscriptions.length,
      exampleValue: 94,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.subscriptions || false
    },
    {
      name: 'Churned Subscribers',
      category: 'Subscriptions',
      type: 'calculated',
      unit: 'Count (#)',
      chartType: 'Line chart with comparison',
      timeSeries: generateTimeSeries(canceledSubscriptions.length, businessType, 'count'),
      currentValue: canceledSubscriptions.length,
      exampleValue: 119,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.subscriptions || false
    },
    {
      name: 'New Trials',
      category: 'Subscriptions',
      type: 'calculated',
      unit: 'Count (#)',
      chartType: 'Line chart with comparison',
      timeSeries: generateTimeSeries(trialingSubscriptions.length, businessType, 'count'),
      currentValue: trialingSubscriptions.length,
      exampleValue: 16,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.subscriptions || false
    },
    {
      name: 'Active Trials',
      category: 'Subscriptions',
      type: 'calculated',
      unit: 'Count (#)',
      chartType: 'Line chart with comparison',
      timeSeries: generateTimeSeries(trialingSubscriptions.length, businessType, 'count'),
      currentValue: trialingSubscriptions.length,
      exampleValue: 1,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.subscriptions || false
    },
    {
      name: 'Monthly Recurring Revenue (MRR)',
      category: 'Revenue',
      type: 'calculated',
      unit: 'Volume ($)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(mrr, businessType, 'volume'),
      currentValue: mrr / 100,
      exampleValue: 2213178.67,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.subscriptions || false
    }
  ];
}

function calculateCustomerMetrics(dataset: any, businessType: string, stage: string): MetricData[] {
  const customers = dataset.customers || [];
  const charges = dataset.charges || [];
  const successfulCharges = charges.filter((c: any) => c.status === 'succeeded');
  
  const totalSpend = successfulCharges.reduce((sum: number, c: any) => sum + c.amount, 0);
  const spendPerCustomer = customers.length > 0 ? totalSpend / customers.length : 0;
  
  return [
    {
      name: 'New Customers',
      category: 'Customers',
      type: 'calculated',
      unit: 'Count (#)',
      chartType: 'Line chart with comparison',
      timeSeries: generateTimeSeries(customers.length, businessType, 'count'),
      currentValue: customers.length,
      exampleValue: 779,
      available: true
    },
    {
      name: 'Spend per Customer',
      category: 'Customers',
      type: 'calculated',
      unit: 'Volume ($)',
      chartType: 'Line chart with comparison',
      timeSeries: generateTimeSeries(spendPerCustomer, businessType, 'volume'),
      currentValue: spendPerCustomer / 100,
      exampleValue: 15.17,
      available: true
    },
    {
      name: 'Account Growth - New Accounts',
      category: 'Customers',
      type: 'calculated',
      unit: 'Count (#)',
      chartType: 'Line chart with comparison',
      timeSeries: generateTimeSeries(customers.length, businessType, 'count'),
      currentValue: customers.length,
      exampleValue: 375,
      available: true
    }
  ];
}

function calculateInvoiceMetrics(dataset: any, businessType: string, stage: string): MetricData[] {
  const invoices = dataset.invoices || [];
  const paidInvoices = invoices.filter((i: any) => i.status === 'paid');
  const openInvoices = invoices.filter((i: any) => i.status === 'open');
  const draftInvoices = invoices.filter((i: any) => i.status === 'draft');
  
  const totalInvoiceAmount = invoices.reduce((sum: number, i: any) => sum + i.total, 0);
  const paidAmount = paidInvoices.reduce((sum: number, i: any) => sum + i.total, 0);
  const openAmount = openInvoices.reduce((sum: number, i: any) => sum + i.total, 0);
  const draftAmount = draftInvoices.reduce((sum: number, i: any) => sum + i.total, 0);
  
  return [
    {
      name: 'Invoices List',
      category: 'Invoices',
      type: 'calculated',
      unit: 'Volume ($)',
      chartType: 'List/Table',
      timeSeries: generateTimeSeries(totalInvoiceAmount, businessType, 'volume'),
      currentValue: totalInvoiceAmount / 100,
      exampleValue: 1200.00,
      available: true
    },
    {
      name: 'Past Due Invoices',
      category: 'Invoices',
      type: 'calculated',
      unit: 'Volume ($)',
      chartType: 'Chart/List',
      timeSeries: generateTimeSeries(openAmount, businessType, 'volume'),
      currentValue: openAmount / 100,
      exampleValue: 7218.75,
      available: true
    }
  ];
}

// ============================================================================
// SYNTHESIZED METRICS (Realistic but Generated)
// ============================================================================

function synthesizeAdvancedMetrics(dataset: any, businessType: string, stage: string): MetricData[] {
  const charges = dataset.charges || [];
  const subscriptions = dataset.subscriptions || [];
  const customers = dataset.customers || [];
  
  const successfulCharges = charges.filter((c: any) => c.status === 'succeeded');
  const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'active');
  const canceledSubscriptions = subscriptions.filter((s: any) => s.status === 'canceled');
  
  const totalVolume = charges.reduce((sum: number, c: any) => sum + c.amount, 0);
  const mrr = activeSubscriptions.reduce((sum: number, s: any) => sum + s.amount, 0);
  
  // Calculate base metrics for synthesis
  const churnRate = activeSubscriptions.length > 0 ? (canceledSubscriptions.length / activeSubscriptions.length) * 100 : 0;
  const arpu = activeSubscriptions.length > 0 ? mrr / activeSubscriptions.length : 0;
  const ltv = churnRate > 0 ? arpu / (churnRate / 100) : arpu * 12; // Annual LTV
  
  return [
    // Advanced Subscription Metrics
    {
      name: 'Average Revenue Per User (ARPU)',
      category: 'Subscriptions',
      type: 'synthesized',
      unit: 'Volume ($)',
      chartType: 'Line chart with comparison',
      timeSeries: generateTimeSeries(arpu, businessType, 'volume'),
      currentValue: arpu / 100,
      exampleValue: 52694.73,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.subscriptions || false
    },
    {
      name: 'Subscriber Lifetime Value',
      category: 'Subscriptions',
      type: 'synthesized',
      unit: 'Volume ($)',
      chartType: 'Line chart with comparison',
      timeSeries: generateTimeSeries(ltv, businessType, 'volume'),
      currentValue: ltv / 100,
      exampleValue: 163000,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.subscriptions || false
    },
    {
      name: 'Subscriber Churn Rate',
      category: 'Subscriptions',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Line chart with comparison',
      timeSeries: generateTimeSeries(churnRate, businessType, 'rate'),
      currentValue: churnRate,
      exampleValue: 32.26,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.subscriptions || false
    },
    {
      name: 'Churned Revenue',
      category: 'Subscriptions',
      type: 'synthesized',
      unit: 'Volume ($)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(mrr * (churnRate / 100), businessType, 'volume'),
      currentValue: (mrr * (churnRate / 100)) / 100,
      exampleValue: 2210000,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.subscriptions || false
    },
    {
      name: 'Gross MRR Churn Rate',
      category: 'Subscriptions',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Line chart with comparison',
      timeSeries: generateTimeSeries(churnRate, businessType, 'rate'),
      currentValue: churnRate,
      exampleValue: 3.5,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.subscriptions || false
    },
    {
      name: 'Net MRR Churn Rate',
      category: 'Subscriptions',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Line chart with comparison',
      timeSeries: generateTimeSeries(churnRate * 0.8, businessType, 'rate'), // Slightly lower due to expansion
      currentValue: churnRate * 0.8,
      exampleValue: 3.5,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.subscriptions || false
    },
    
    // Advanced Payment Metrics
    {
      name: 'Net Volume',
      category: 'Payments',
      type: 'synthesized',
      unit: 'Volume ($)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(totalVolume * 0.85, businessType, 'volume'), // After fees and refunds
      currentValue: (totalVolume * 0.85) / 100,
      exampleValue: -1293.53,
      available: true
    },
    {
      name: 'Net Volume from Sales',
      category: 'Payments',
      type: 'synthesized',
      unit: 'Volume ($)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(totalVolume * 0.82, businessType, 'volume'), // After all costs
      currentValue: (totalVolume * 0.82) / 100,
      exampleValue: -2660.40,
      available: true
    },
    {
      name: 'Margin',
      category: 'Revenue',
      type: 'synthesized',
      unit: 'Volume ($)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(totalVolume * 0.15, businessType, 'volume'), // 15% margin
      currentValue: (totalVolume * 0.15) / 100,
      exampleValue: -38.80,
      available: true
    },
    {
      name: 'Payment Take Rate',
      category: 'Revenue',
      type: 'synthesized',
      unit: 'Rate (bps)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(290, businessType, 'rate'), // 2.9% + 30¢
      currentValue: 290,
      exampleValue: -119384.6,
      available: true
    },
    
    // Fraud & Risk Metrics (synthesized)
    {
      name: 'High Risk Blocks',
      category: 'Fraud & risk',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Bar chart',
      timeSeries: generateTimeSeries(0.5, businessType, 'rate'),
      currentValue: 0.5,
      exampleValue: 0.00,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.radar || false
    },
    {
      name: 'Rule Blocks',
      category: 'Fraud & risk',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Bar chart',
      timeSeries: generateTimeSeries(0.1, businessType, 'rate'),
      currentValue: 0.1,
      exampleValue: 0.01,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.radar || false
    },
    {
      name: 'Total Radar Block Rate',
      category: 'Fraud & risk',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(0.6, businessType, 'rate'),
      currentValue: 0.6,
      exampleValue: 0.01,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.radar || false
    },
    {
      name: 'Fraudulent Disputes',
      category: 'Fraud & risk',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(0.1, businessType, 'rate'),
      currentValue: 0.1,
      exampleValue: 0.00,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.disputes || false
    },
    {
      name: 'Early Fraud Warnings',
      category: 'Fraud & risk',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(0.2, businessType, 'rate'),
      currentValue: 0.2,
      exampleValue: 0.00,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.disputes || false
    },
    {
      name: 'Other Disputes',
      category: 'Fraud & risk',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(0.3, businessType, 'rate'),
      currentValue: 0.3,
      exampleValue: 0.00,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.disputes || false
    },
    {
      name: 'Total Dispute Rate',
      category: 'Fraud & risk',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(0.6, businessType, 'rate'),
      currentValue: 0.6,
      exampleValue: 0.00,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.disputes || false
    },
    
    // 3D Secure Authentication (synthesized)
    {
      name: 'Authentication Rate',
      category: 'Authentication',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(2.0, businessType, 'rate'),
      currentValue: 2.0,
      exampleValue: 1.85,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.authentication || false
    },
    {
      name: 'Authentication Success Rate',
      category: 'Authentication',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(95.0, businessType, 'rate'),
      currentValue: 95.0,
      exampleValue: 0.00,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.authentication || false
    },
    {
      name: 'Challenge Rate',
      category: 'Authentication',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(1.5, businessType, 'rate'),
      currentValue: 1.5,
      exampleValue: 0.00,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.authentication || false
    },
    {
      name: 'Challenge Success Rate',
      category: 'Authentication',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(90.0, businessType, 'rate'),
      currentValue: 90.0,
      exampleValue: 0.00,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.authentication || false
    },
    {
      name: '3DS Requests',
      category: 'Authentication',
      type: 'synthesized',
      unit: 'Count (#)',
      chartType: 'Bar chart',
      timeSeries: generateTimeSeries(Math.floor(charges.length * 0.02), businessType, 'count'),
      currentValue: Math.floor(charges.length * 0.02),
      exampleValue: 1,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.authentication || false
    },
    {
      name: 'Successful 3DS Requests',
      category: 'Authentication',
      type: 'synthesized',
      unit: 'Count (#)',
      chartType: 'Bar chart',
      timeSeries: generateTimeSeries(Math.floor(charges.length * 0.019), businessType, 'count'),
      currentValue: Math.floor(charges.length * 0.019),
      exampleValue: 0,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.authentication || false
    },
    {
      name: '3DS Failures',
      category: 'Authentication',
      type: 'synthesized',
      unit: 'Count (#)',
      chartType: 'Bar chart',
      timeSeries: generateTimeSeries(Math.floor(charges.length * 0.001), businessType, 'count'),
      currentValue: Math.floor(charges.length * 0.001),
      exampleValue: 1,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.authentication || false
    },
    
    // Refunds & Disputes (synthesized)
    {
      name: 'Refund Activity',
      category: 'Payments',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(5.0, businessType, 'rate'),
      currentValue: 5.0,
      exampleValue: 257.9,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.refunds || false
    },
    {
      name: 'Refund Volume',
      category: 'Payments',
      type: 'synthesized',
      unit: 'Volume ($)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(totalVolume * 0.05, businessType, 'volume'),
      currentValue: (totalVolume * 0.05) / 100,
      exampleValue: 4169.91,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.refunds || false
    },
    {
      name: 'Dispute Activity',
      category: 'Payments',
      type: 'synthesized',
      unit: 'Rate (%)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(0.5, businessType, 'rate'),
      currentValue: 0.5,
      exampleValue: 0.0,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.disputes || false
    },
    {
      name: 'Dispute Count',
      category: 'Payments',
      type: 'synthesized',
      unit: 'Count (#)',
      chartType: 'Line chart',
      timeSeries: generateTimeSeries(Math.floor(charges.length * 0.005), businessType, 'count'),
      currentValue: Math.floor(charges.length * 0.005),
      exampleValue: 0,
      available: METRIC_AVAILABILITY[businessType as keyof typeof METRIC_AVAILABILITY]?.disputes || false
    }
  ];
}

// ============================================================================
// TIME SERIES GENERATION
// ============================================================================

function generateTimeSeries(baseValue: number, businessType: string, dataType: 'volume' | 'count' | 'rate'): { daily: number[], weekly: number[], monthly: number[] } {
  const pattern = SEASONALITY_PATTERNS[businessType as keyof typeof SEASONALITY_PATTERNS] || SEASONALITY_PATTERNS['b2b-saas-subscriptions'];
  
  // Generate daily data (365 days)
  const daily = [];
  for (let i = 0; i < 365; i++) {
    const dayOfWeek = i % 7;
    const monthOfYear = Math.floor(i / 30.44) % 12; // Approximate months
    const seasonalFactor = pattern.monthly[monthOfYear] * pattern.daily[dayOfWeek];
    const randomFactor = 0.8 + seededRandom(i) * 0.4; // 80-120% variation
    daily.push(Math.max(0, baseValue * seasonalFactor * randomFactor));
  }
  
  // Generate weekly data (52 weeks)
  const weekly = [];
  for (let i = 0; i < 52; i++) {
    const weekStart = i * 7;
    const weekData = daily.slice(weekStart, weekStart + 7);
    const weekSum = dataType === 'rate' ? 
      weekData.reduce((sum, val) => sum + val, 0) / 7 : // Average for rates
      weekData.reduce((sum, val) => sum + val, 0); // Sum for volumes/counts
    weekly.push(weekSum);
  }
  
  // Generate monthly data (12 months)
  const monthly = [];
  for (let i = 0; i < 12; i++) {
    const monthStart = i * 30.44;
    const monthData = daily.slice(Math.floor(monthStart), Math.floor(monthStart + 30.44));
    const monthSum = dataType === 'rate' ? 
      monthData.reduce((sum, val) => sum + val, 0) / monthData.length : // Average for rates
      monthData.reduce((sum, val) => sum + val, 0); // Sum for volumes/counts
    monthly.push(monthSum);
  }
  
  return { daily, weekly, monthly };
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export function generateMetrics(dataset: any, businessType: string, stage: string): MetricData[] {
  const calculatedMetrics = [
    ...calculatePaymentMetrics(dataset, businessType, stage),
    ...calculateSubscriptionMetrics(dataset, businessType, stage),
    ...calculateCustomerMetrics(dataset, businessType, stage),
    ...calculateInvoiceMetrics(dataset, businessType, stage)
  ];
  
  const synthesizedMetrics = synthesizeAdvancedMetrics(dataset, businessType, stage);
  
  // Filter out unavailable metrics
  const allMetrics = [...calculatedMetrics, ...synthesizedMetrics];
  const availableMetrics = allMetrics.filter(metric => metric.available);
  
  return availableMetrics;
}

export function getIncludedMetrics(dataset: any, businessType: string, stage: string): string[] {
  const metrics = generateMetrics(dataset, businessType, stage);
  return metrics.map(metric => metric.name);
}
