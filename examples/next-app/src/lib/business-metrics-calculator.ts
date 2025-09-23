import { generateMetrics } from './metrics-generator';

export interface BusinessMetrics {
  grossPaymentVolume: number;
  paymentSuccessRate: number;
  successfulPayments: number;
  acceptedVolume: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  monthlyRecurringRevenue: number;
  conversionRate: number;
}

function generateFallbackMetrics(stage: string, seed: number): BusinessMetrics {
  // Simple fallback metrics based on stage
  const baseValues = {
    'startup': { volume: 50000, success: 0.85, aov: 150, clv: 1200, mrr: 8000 },
    'growth': { volume: 200000, success: 0.90, aov: 250, clv: 2000, mrr: 25000 },
    'enterprise': { volume: 500000, success: 0.95, aov: 500, clv: 5000, mrr: 75000 }
  };
  
  const values = baseValues[stage as keyof typeof baseValues] || baseValues.startup;
  
  return {
    grossPaymentVolume: values.volume,
    paymentSuccessRate: values.success,
    successfulPayments: Math.floor(values.volume * values.success),
    acceptedVolume: values.volume * values.success,
    averageOrderValue: values.aov,
    customerLifetimeValue: values.clv,
    monthlyRecurringRevenue: values.mrr,
    conversionRate: 0.12 + (seed % 10) * 0.01
  };
}

export function calculateBusinessMetricsFromStripeData(stripeData: Record<string, any[]>, stage: string, seed: number): BusinessMetrics {
  const customers = stripeData.customers || [];
  const charges = stripeData.charges || [];
  
  if (customers.length === 0 || charges.length === 0) {
    // Fallback to generated metrics if no data
    return generateFallbackMetrics(stage, seed);
  }

  // Determine business type from the data or use a default
  const businessType = 'b2b-saas-subscriptions'; // Default, could be enhanced to detect from data
  
  // Generate comprehensive metrics using the metrics generator
  const comprehensiveMetrics = generateMetrics(stripeData, businessType, stage);
  
  // Extract key metrics for the simple BusinessMetrics interface
  const grossPaymentVolume = comprehensiveMetrics.find(m => m.name === 'Gross Payment Volume');
  const paymentSuccessRate = comprehensiveMetrics.find(m => m.name === 'Payment Success Rate');
  const successfulPayments = comprehensiveMetrics.find(m => m.name === 'Successful Payments');
  const acceptedVolume = comprehensiveMetrics.find(m => m.name === 'Accepted Volume');
  const averageOrderValue = comprehensiveMetrics.find(m => m.name === 'Average Order Value');
  const customerLifetimeValue = comprehensiveMetrics.find(m => m.name === 'Customer Lifetime Value');
  const monthlyRecurringRevenue = comprehensiveMetrics.find(m => m.name === 'Monthly Recurring Revenue');
  const conversionRate = comprehensiveMetrics.find(m => m.name === 'Conversion Rate');

  return {
    grossPaymentVolume: grossPaymentVolume?.currentValue || 0,
    paymentSuccessRate: paymentSuccessRate?.currentValue || 0,
    successfulPayments: successfulPayments?.currentValue || 0,
    acceptedVolume: acceptedVolume?.currentValue || 0,
    averageOrderValue: averageOrderValue?.currentValue || 0,
    customerLifetimeValue: customerLifetimeValue?.currentValue || 0,
    monthlyRecurringRevenue: monthlyRecurringRevenue?.currentValue || 0,
    conversionRate: conversionRate?.currentValue || 0
  };
}
