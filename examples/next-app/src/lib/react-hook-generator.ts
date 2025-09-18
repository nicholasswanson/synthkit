// React Hook Generator for Synthkit Dataset Integration
// Generates ready-to-use React hooks and TypeScript interfaces

import type { DatasetInfo } from './ai-integrations';
import type { StripeCharge, StripeSubscription, StripeInvoice } from './stripe-data-generators';

interface StripeCustomer {
  id: string;
  name: string;
  email: string;
  created: number;
}

interface StripePlan {
  id: string;
  name: string;
  amount: number;
  interval: string;
  currency: string;
}

// Business context mapping for better AI understanding
const BUSINESS_CONTEXTS = {
  modaic: { name: 'Fashion E-commerce', domain: 'retail', complexity: 'medium' },
  stratus: { name: 'B2B SaaS Platform', domain: 'software', complexity: 'high' },
  forksy: { name: 'Food Delivery Marketplace', domain: 'marketplace', complexity: 'high' },
  fluxly: { name: 'Creator Economy Platform', domain: 'social', complexity: 'medium' },
  mindora: { name: 'Online Learning Platform', domain: 'education', complexity: 'medium' },
  pulseon: { name: 'Fitness & Wellness App', domain: 'health', complexity: 'medium' },
  procura: { name: 'Healthcare Supply Chain', domain: 'healthcare', complexity: 'high' },
  brightfund: { name: 'Impact Investment Platform', domain: 'finance', complexity: 'high' },
  keynest: { name: 'Real Estate Management', domain: 'real-estate', complexity: 'high' }
};

function getBusinessContext(category: string) {
  return BUSINESS_CONTEXTS[category as keyof typeof BUSINESS_CONTEXTS] || {
    name: category,
    domain: 'business',
    complexity: 'medium'
  };
}

function generateTypeScriptInterfaces(recordCounts: Record<string, number>): string {
  const interfaces = Object.keys(recordCounts).map(entityName => {
    const interfaceName = entityName.charAt(0).toUpperCase() + entityName.slice(1, -1); // Remove 's' and capitalize
    
    // Generate realistic interface based on entity type
    if (entityName === 'customers') {
      return `export interface ${interfaceName} {
  id: string;
  name: string;
  email: string;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold';
  createdAt: string;
}`;
    } else if (entityName === 'payments') {
      return `export interface ${interfaceName} {
  id: string;
  customerId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer';
  createdAt: string;
}`;
    } else {
      // Generic interface for AI-generated entities
      return `export interface ${interfaceName} {
  id: string;
  // Add properties based on your ${entityName} requirements
  createdAt: string;
}`;
    }
  }).join('\n\n');

  return `// Generated TypeScript interfaces for Synthkit dataset
${interfaces}

export interface BusinessMetrics {
  customerLifetimeValue: number;
  averageOrderValue: number;
  monthlyRecurringRevenue: number;
  dailyActiveUsers: number;
  conversionRate: number;
}

export interface Dataset {
${Object.keys(recordCounts).map(key => `  ${key}: ${key.charAt(0).toUpperCase() + key.slice(1, -1)}[];`).join('\n')}
  businessMetrics: BusinessMetrics;
  stripeData?: {
    customers?: StripeCustomer[];
    charges?: StripeCharge[];
    subscriptions?: StripeSubscription[];
    invoices?: StripeInvoice[];
    plans?: StripePlan[];
  };
}`;
}

export function generateReactHook(url: string, datasetInfo: DatasetInfo): string {
  const businessContext = datasetInfo.scenario 
    ? getBusinessContext(datasetInfo.scenario.category)
    : { name: datasetInfo.aiAnalysis?.businessType || 'Business App', domain: 'business', complexity: 'medium' };

  const recordSummary = Object.entries(datasetInfo.recordCounts)
    .map(([key, count]) => `${count.toLocaleString()} ${key}`)
    .join(', ');

  return `// Synthkit Dataset Integration for ${businessContext.name}
import { useState, useEffect } from 'react';

${generateTypeScriptInterfaces(datasetInfo.recordCounts)}

export function useSynthkitDataset() {
  const [data, setData] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<'live' | 'api' | 'static'>('live');

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Try live demo connection (sessionStorage - same browser)
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          const liveData = sessionStorage.getItem('synthkit-current-dataset');
          if (liveData) {
            const parsed = JSON.parse(liveData);
            setData(parsed.data);
            setSource('live');
            setLoading(false);
            console.log('📊 Connected to live Synthkit demo!');
            return;
          }
        }

        // 2. Try live API endpoint (cross-port - different localhost ports)
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          try {
            const response = await fetch('http://localhost:3001/api/dataset/current');
            if (response.ok) {
              const dataset = await response.json();
              setData(dataset.data);
              setSource('api');
              setLoading(false);
              console.log('📡 Connected to live Synthkit API!');
              return;
            }
          } catch (e) {
            // Demo not running, continue to fallback
          }
        }

        // 3. Fallback to static dataset URL (deployed prototypes)
        const response = await fetch('${url}');
        if (!response.ok) {
          throw new Error(\`Failed to load dataset: HTTP \${response.status}\`);
        }
        const dataset = await response.json();
        setData(dataset.data);
        setSource('static');
        setLoading(false);
        console.log('📄 Using static Synthkit dataset');
        
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
        console.error('❌ Dataset loading failed:', err);
      }
    }

    loadData();
  }, []); // Empty dependency array - fetch only once

  // Stripe data access helpers
  const stripeData = data?.stripeData;
  const customers = stripeData?.customers || [];
  const charges = stripeData?.charges || [];
  const subscriptions = stripeData?.subscriptions || [];
  const invoices = stripeData?.invoices || [];
  const plans = stripeData?.plans || [];

  return { 
    data, 
    loading, 
    error, 
    source,
    // Stripe data access
    stripeData,
    customers,
    charges,
    subscriptions,
    invoices,
    plans
  };
}

// Usage in your component:
export function MyPrototype() {
  const { data, loading, error, source, customers, charges, subscriptions, invoices, plans } = useSynthkitDataset();

  if (loading) return <div>Loading ${recordSummary}...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div>
      <h1>${businessContext.name} Prototype</h1>
      <p className="text-sm text-gray-500">
        Data source: {source === 'live' ? '📊 Live Demo' : source === 'api' ? '📡 Live API' : '📄 Static Dataset'}
      </p>
      ${Object.keys(datasetInfo.recordCounts).map(key => 
        `<p>{data.${key}?.length || 0} ${key}</p>`
      ).join('\n      ')}
      <p>CLV: \${data.businessMetrics.customerLifetimeValue.toFixed(2)}</p>
      
      {/* Stripe Data Display */}
      {customers.length > 0 && (
        <div>
          <h2>Stripe Customers</h2>
          <p>{customers.length} customers available</p>
        </div>
      )}
      {charges.length > 0 && (
        <div>
          <h2>Recent Charges</h2>
          <p>{charges.length} charges available</p>
        </div>
      )}
      {subscriptions.length > 0 && (
        <div>
          <h2>Active Subscriptions</h2>
          <p>{subscriptions.length} subscriptions available</p>
        </div>
      )}
      {invoices.length > 0 && (
        <div>
          <h2>Recent Invoices</h2>
          <p>{invoices.length} invoices available</p>
        </div>
      )}
      {plans.length > 0 && (
        <div>
          <h2>Subscription Plans</h2>
          <p>{plans.length} plans available</p>
        </div>
      )}
    </div>
  );
}`;
}

export function downloadReactHook(url: string, datasetInfo: DatasetInfo): void {
  const content = generateReactHook(url, datasetInfo);
  const blob = new Blob([content], { type: 'text/typescript' });
  const downloadUrl = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'useSynthkitDataset.ts';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
