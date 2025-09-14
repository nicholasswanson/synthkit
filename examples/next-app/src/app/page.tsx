'use client';

import { useState, useEffect, useRef } from 'react';
import { AnalysisResult } from './components/AIComponents';

interface Customer {
  id: string;
  name: string;
  email: string;
  loyaltyTier: string;
  createdAt: string;
}

interface Payment {
  id: string;
  customerId: string;
  amount: number | string;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

interface RealisticVolume {
  min: number;
  max: number;
  expected: number;
}

interface BusinessMetrics {
  customerLifetimeValue: number;
  averageOrderValue: number;
  monthlyRecurringRevenue: number;
  dailyActiveUsers: number;
  conversionRate: number;
}

// AI-related interfaces
interface AnalysisData {
  success: boolean;
  analysis?: {
    businessContext: {
      type: string;
      stage: string;
      primaryFeatures: string[];
      targetAudience: string[];
      monetizationModel: string;
    };
    entities: Array<{
      name: string;
      type: string;
      relationships: string[];
      estimatedVolume: string;
    }>;
    userRoles: string[];
    keyFeatures: string[];
    confidence: number;
    reasoning: string[];
  };
  processingTime: number;
}

// Enhanced seeded random with better distribution
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Realistic volume scaling with non-rounded values
function getRealisticVolume(stage: string, category: string): RealisticVolume {
  const baseVolumes = {
    early: { min: 47, max: 523 },
    growth: { min: 1247, max: 9876 },
    enterprise: { min: 12456, max: 987654 }
  };

  // Category-specific multipliers (non-rounded)
  const categoryMultipliers = {
    modaic: 1.0,      // Fashion - standard e-commerce
    stratus: 0.267,   // B2B SaaS - fewer but higher value customers
    forksy: 2.143,    // Food delivery - high volume, low value
    fluxly: 0.534,    // Creator economy - moderate volume
    mindora: 0.423,   // Online learning - moderate volume
    pulseon: 0.867,   // Fitness - moderate volume
    procura: 0.234,   // Healthcare - fewer, high value
    brightfund: 0.123, // Non-profit - very few, high value
    keynest: 0.056    // Real estate - very few, very high value
  };

  const base = baseVolumes[stage as keyof typeof baseVolumes];
  const multiplier = categoryMultipliers[category as keyof typeof categoryMultipliers];
  
  const min = Math.floor(base.min * multiplier);
  const max = Math.floor(base.max * multiplier);
  const expected = Math.floor(min + (max - min) * 0.63); // Realistic expected value
  
  return { min, max, expected };
}

// Generate realistic business metrics
function generateBusinessMetrics(stage: string, category: string, id: number): BusinessMetrics {
  const volume = getRealisticVolume(stage, category);
  const seed = id * 1000;
  
  // Base metrics by stage
  const stageMultipliers = {
    early: { clv: 1.0, aov: 1.0, mrr: 1.0, dau: 1.0, conversion: 1.0 },
    growth: { clv: 2.3, aov: 1.8, mrr: 3.2, dau: 4.1, conversion: 1.4 },
    enterprise: { clv: 5.7, aov: 3.4, mrr: 8.9, dau: 12.3, conversion: 2.1 }
  };
  
  const stageMultiplier = stageMultipliers[stage as keyof typeof stageMultipliers];
  
  return {
    customerLifetimeValue: Math.round(((85.47 + seededRandom(seed) * 234.56) * stageMultiplier.clv) * 100) / 100,
    averageOrderValue: Math.round(((67.23 + seededRandom(seed + 1) * 145.78) * stageMultiplier.aov) * 100) / 100,
    monthlyRecurringRevenue: Math.round(((1247.89 + seededRandom(seed + 2) * 5678.12) * stageMultiplier.mrr) * 100) / 100,
    dailyActiveUsers: Math.round((volume.expected * 0.087) * stageMultiplier.dau),
    conversionRate: Math.round(((2.34 + seededRandom(seed + 3) * 3.67) * stageMultiplier.conversion) * 100) / 100
  };
}

// Generate realistic non-rounded amounts
function generateRealisticAmount(baseAmount: number, category: string, stage: string, seed: number): number {
  // Apply category-specific pricing (non-rounded multipliers)
  const categoryMultipliers = {
    modaic: 1.247,    // Fashion items are pricier
    stratus: 2.534,   // SaaS subscriptions
    forksy: 0.634,    // Food orders are smaller
    fluxly: 0.823,    // Creator tips and subscriptions
    mindora: 1.756,   // Course purchases
    pulseon: 0.734,   // Fitness subscriptions
    procura: 4.967,   // Medical supplies are expensive
    brightfund: 1.456, // Donations vary widely
    keynest: 14.723   // Rent payments are large
  };
  
  // Apply stage multiplier (non-rounded)
  const stageMultipliers = {
    early: 1.0,
    growth: 1.567,
    enterprise: 2.234
  };
  
  const categoryMultiplier = categoryMultipliers[category as keyof typeof categoryMultipliers];
  const stageMultiplier = stageMultipliers[stage as keyof typeof stageMultipliers];
  
  // Add realistic variance (±15%)
  const variance = (seededRandom(seed) - 0.5) * 0.3;
  const finalAmount = baseAmount * categoryMultiplier * stageMultiplier * (1 + variance);
  
  // Round to cents (2 decimal places for currency)
  return Math.round(finalAmount * 100) / 100;
}

// Pagination hook for large datasets
function usePaginatedData<T>(data: T[], pageSize: number = 100) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);
  
  return {
    currentData,
    currentPage,
    totalPages,
    totalItems: data.length,
    setCurrentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}

function generateCustomers(scenario: { category: string; role: string; stage: string; id: number }): Customer[] {
  const { category, stage, role, id } = scenario;
  const volume = getRealisticVolume(stage, category);
  
  // Customers typically represent unique users, so use the base volume
  const customerCount = volume.expected;
  
  console.log(`📊 Generating ${customerCount.toLocaleString()} customers for ${category} ${stage} stage`);
  
  const customers: Customer[] = [];
  const loyaltyTiers = ['bronze', 'silver', 'gold', 'platinum'];
  const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Quinn', 'Sage', 'River'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

  for (let i = 0; i < customerCount; i++) {
    const customerSeed = id + i * 1000;
    const firstName = firstNames[Math.floor(seededRandom(customerSeed) * firstNames.length)];
    const lastName = lastNames[Math.floor(seededRandom(customerSeed + 1) * lastNames.length)];
    
    customers.push({
      id: `customer-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${category}.com`,
      loyaltyTier: loyaltyTiers[Math.floor(seededRandom(customerSeed + 2) * loyaltyTiers.length)],
      createdAt: new Date(Date.now() - Math.floor(seededRandom(customerSeed + 3) * 365 * 24 * 60 * 60 * 1000)).toISOString()
    });
  }

  return customers;
}

function generatePayments(scenario: { category: string; role: string; stage: string; id: number }): Payment[] {
  const { category, stage, role, id } = scenario;
  const volume = getRealisticVolume(stage, category);
  
  // Payments should be more numerous than customers (multiple payments per customer)
  // Business type affects payment frequency
  const paymentMultipliers = {
    modaic: 2.3,      // Fashion - moderate repeat purchases
    stratus: 1.8,     // SaaS - monthly subscriptions
    forksy: 4.7,      // Food delivery - frequent orders
    fluxly: 1.2,      // Creator economy - occasional tips
    mindora: 1.5,     // Online learning - course purchases
    pulseon: 2.1,     // Fitness - monthly subscriptions
    procura: 1.1,     // Healthcare - infrequent large purchases
    brightfund: 0.8,  // Non-profit - occasional donations
    keynest: 0.3      // Real estate - very infrequent large payments
  };
  
  const multiplier = paymentMultipliers[category as keyof typeof paymentMultipliers];
  const paymentCount = Math.floor(volume.expected * multiplier);
  
  console.log(`💰 Generating ${paymentCount.toLocaleString()} payments for ${category} ${stage} stage (${multiplier}x multiplier)`);
  
  const payments: Payment[] = [];
  const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'];
  const statuses = ['completed', 'pending', 'failed'];

  for (let i = 0; i < paymentCount; i++) {
    const paymentSeed = id + i * 2000;
    const baseAmount = 47.23 + seededRandom(paymentSeed) * 453.78;
    let amount: number | string;
    
    if (role === 'support') {
      amount = 'hidden';
    } else {
      amount = generateRealisticAmount(baseAmount, category, stage, paymentSeed);
    }

    payments.push({
      id: `payment-${i + 1}`,
      customerId: `customer-${Math.floor(seededRandom(paymentSeed + 1) * Math.min(100, volume.expected)) + 1}`,
      amount,
      status: statuses[Math.floor(seededRandom(paymentSeed + 2) * statuses.length)],
      paymentMethod: paymentMethods[Math.floor(seededRandom(paymentSeed + 3) * paymentMethods.length)],
      createdAt: new Date(Date.now() - Math.floor(seededRandom(paymentSeed + 4) * 30 * 24 * 60 * 60 * 1000)).toISOString()
    });
  }

  return payments;
}

export default function Home() {
  const [scenario, setScenario] = useState<{
    category: string;
    role: string;
    stage: 'early' | 'growth' | 'enterprise';
    id: number;
  }>({
    category: 'modaic',
    role: 'admin',
    stage: 'early',
    id: 12345
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [mswStatus, setMswStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // AI-related state
  const [aiDescription, setAiDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [showAiResults, setShowAiResults] = useState(false);
  
  // Use a ref to share scenario with MSW handlers
  const scenarioRef = useRef(scenario);
  useEffect(() => {
    scenarioRef.current = scenario;
  }, [scenario]);

  // State for business metrics to avoid hydration mismatch
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({
    customerLifetimeValue: 0,
    averageOrderValue: 0,
    monthlyRecurringRevenue: 0,
    dailyActiveUsers: 0,
    conversionRate: 0
  });
  const [expectedVolume, setExpectedVolume] = useState<RealisticVolume>({ min: 0, max: 0, expected: 0 });
  const [expectedPaymentCount, setExpectedPaymentCount] = useState(0);
  const [metricsLoaded, setMetricsLoaded] = useState(false);

  // Calculate business metrics on client side to avoid hydration mismatch
  useEffect(() => {
    const volume = getRealisticVolume(scenario.stage, scenario.category);
    const metrics = generateBusinessMetrics(scenario.stage, scenario.category, scenario.id);
    
    const paymentMultipliers = {
      modaic: 2.3, stratus: 1.8, forksy: 4.7, fluxly: 1.2, mindora: 1.5,
      pulseon: 2.1, procura: 1.1, brightfund: 0.8, keynest: 0.3
    };
    const paymentCount = Math.floor(volume.expected * paymentMultipliers[scenario.category as keyof typeof paymentMultipliers]);
    
    setExpectedVolume(volume);
    setBusinessMetrics(metrics);
    setExpectedPaymentCount(paymentCount);
    setMetricsLoaded(true);
  }, [scenario.stage, scenario.category, scenario.id]);

  // Pagination for customers and payments
  const customerPagination = usePaginatedData(customers, 50);
  const paymentPagination = usePaginatedData(payments, 50);

  // Initialize MSW and set up handlers
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    const initializeMSW = async () => {
      try {
        console.log('🔄 Starting MSW initialization...');
        
        const { setupWorker } = await import('msw/browser');
        const { http, HttpResponse } = await import('msw');

        // Dynamic mock handlers that use scenarioRef
        const handlers = [
          http.get('/api/customers', () => {
            console.log('🔄 Generating customers with scenario:', scenarioRef.current);
            const customers = generateCustomers(scenarioRef.current);
            return HttpResponse.json(customers);
          }),

          http.get('/api/payments', () => {
            console.log('🔄 Generating payments with scenario:', scenarioRef.current);
            const payments = generatePayments(scenarioRef.current);
            return HttpResponse.json(payments);
          })
        ];

        const worker = setupWorker(...handlers);
        
        await worker.start({
          onUnhandledRequest: 'bypass',
          quiet: false
        });
        
        console.log('✅ MSW initialized successfully');
        setMswStatus('ready');
        
        // Initial data fetch after a short delay
        setTimeout(() => {
          fetchCustomers();
          fetchPayments();
        }, 100);
        
      } catch (error) {
        console.error('❌ MSW initialization failed:', error);
        setMswStatus('error');
        // Fallback: generate data directly
        setCustomers(generateCustomers(scenarioRef.current));
        setPayments(generatePayments(scenarioRef.current));
      }
    };

    initializeMSW();
  }, []);

  const fetchCustomers = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      // Fallback: generate data directly
      setCustomers(generateCustomers(scenarioRef.current));
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchPayments = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/payments');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      // Fallback: generate data directly
      setPayments(generatePayments(scenarioRef.current));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyScenario = () => {
    console.log('🔧 Applying scenario:', scenario);

    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('synthkit-scenario', JSON.stringify(scenario));
    }

    // Refresh data with new scenario
    fetchCustomers();
    fetchPayments();
  };

  const handleReset = () => {
    const defaultScenario = {
      category: 'modaic',
      role: 'admin',
      stage: 'early' as 'early' | 'growth' | 'enterprise',
      id: 12345
    };
    setScenario(defaultScenario);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('synthkit-scenario');
    }
    fetchCustomers();
    fetchPayments();
  };

  const handleRandomizeId = () => {
    const newId = Math.floor(Math.random() * 100000);
    setScenario(prev => ({ ...prev, id: newId }));
  };

  const handleAiAnalyze = async () => {
    if (!aiDescription.trim()) {
      setAiError('Please enter a business description');
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: aiDescription }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      setShowAiResults(true);
      
      // Update URL to show AI results
      const url = new URL(window.location.href);
      url.searchParams.set('ai', 'true');
      window.history.pushState({}, '', url);
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAiError('AI analysis failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiExample = (example: string) => {
    setAiDescription(example);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8">
      <div className="z-10 max-w-6xl w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Synthkit Realistic Data Demo</h1>
        </div>

        {/* Realistic Volume & Metrics Display */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-4">📊 Realistic Business Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Data Volume</h4>
              <div className="text-sm space-y-1">
                {metricsLoaded ? (
                  <>
                    <div>Customers: <span className="font-mono text-blue-600">{expectedVolume.expected.toLocaleString()}</span></div>
                    <div>Payments: <span className="font-mono text-blue-600">{expectedPaymentCount.toLocaleString()}</span></div>
                    <div>Range: <span className="font-mono text-gray-600">{expectedVolume.min.toLocaleString()} - {expectedVolume.max.toLocaleString()}</span></div>
                  </>
                ) : (
                  <div className="text-gray-500">Loading metrics...</div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Business Metrics</h4>
              <div className="text-sm space-y-1">
                {metricsLoaded ? (
                  <>
                    <div>CLV: <span className="font-mono text-green-600">${businessMetrics.customerLifetimeValue.toFixed(2)}</span></div>
                    <div>AOV: <span className="font-mono text-green-600">${businessMetrics.averageOrderValue.toFixed(2)}</span></div>
                    <div>MRR: <span className="font-mono text-green-600">${businessMetrics.monthlyRecurringRevenue.toFixed(2)}</span></div>
                  </>
                ) : (
                  <div className="text-gray-500">Loading metrics...</div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Engagement</h4>
              <div className="text-sm space-y-1">
                {metricsLoaded ? (
                  <>
                    <div>DAU: <span className="font-mono text-purple-600">{businessMetrics.dailyActiveUsers.toLocaleString()}</span></div>
                    <div>Conversion: <span className="font-mono text-purple-600">{businessMetrics.conversionRate.toFixed(2)}%</span></div>
                  </>
                ) : (
                  <div className="text-gray-500">Loading metrics...</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Configuration */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Scenario Configuration</h2>
            <div className="text-sm px-3 py-1 rounded text-yellow-600 bg-yellow-50">
              {mswStatus === 'loading' && '⏳ MSW Loading'}
              {mswStatus === 'ready' && '✅ MSW Ready'}
              {mswStatus === 'error' && '❌ MSW Error'}
              {isGenerating && '🔄 Generating...'}
            </div>
          </div>
          
          <div className="p-6 border rounded-lg bg-white dark:bg-gray-900">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category (Business Type):</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md text-black bg-white"
                  value={scenario.category}
                  onChange={(e) => setScenario(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="modaic">Modaic (Fashion E-commerce)</option>
                  <option value="stratus">Stratus (B2B SaaS) - Low Volume</option>
                  <option value="forksy">Forksy (Food Marketplace) - High Volume</option>
                  <option value="fluxly">Fluxly (Creator Economy)</option>
                  <option value="mindora">Mindora (Online Learning)</option>
                  <option value="pulseon">Pulseon (Fitness Platform)</option>
                  <option value="procura">Procura (Healthcare Supply) - Low Volume</option>
                  <option value="brightfund">Brightfund (Impact Platform) - Very Low Volume</option>
                  <option value="keynest">Keynest (Real Estate) - Very Low Volume</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Role (Access Level):</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md text-black bg-white"
                  value={scenario.role}
                  onChange={(e) => setScenario(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="admin">Admin (Full financial access)</option>
                  <option value="support">Support (Financial data masked)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Stage (Business Maturity):</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md text-black bg-white"
                  value={scenario.stage}
                  onChange={(e) => setScenario(prev => ({ ...prev, stage: e.target.value as 'early' | 'growth' | 'enterprise' }))}
                >
                  <option value="early">Early (47-523 records)</option>
                  <option value="growth">Growth (1.2K-9.9K records)</option>
                  <option value="enterprise">Enterprise (12K-988K records)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">ID (Deterministic Generation):</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    className="flex-1 px-3 py-2 border rounded-md text-black bg-white"
                    value={scenario.id}
                    onChange={(e) => setScenario(prev => ({ ...prev, id: parseInt(e.target.value) || 0 }))}
                  />
                  <button 
                    className="px-3 py-2 border rounded-md hover:bg-gray-50"
                    onClick={handleRandomizeId}
                    title="Randomize ID"
                  >
                    🎲
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                onClick={handleApplyScenario}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Apply Scenario'}
              </button>
              <button 
                className="px-4 py-2 border rounded hover:bg-gray-50"
                onClick={handleReset}
                disabled={isGenerating}
              >
                Reset
              </button>
              <button 
                className="px-4 py-2 border rounded hover:bg-gray-50"
                onClick={() => console.log('Save snapshot clicked')}
                disabled={isGenerating}
              >
                Save Snapshot
              </button>
            </div>
          </div>
        </div>

        {/* Current Scenario Display */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">Current Scenario:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="font-medium">Category:</span> {scenario.category}</div>
            <div><span className="font-medium">Role:</span> {scenario.role}</div>
            <div><span className="font-medium">Stage:</span> {scenario.stage}</div>
            <div><span className="font-medium">ID:</span> {scenario.id}</div>
          </div>
        </div>

        {/* Mock Data Generation Demo */}
        <div className="mb-8 p-6 border rounded-lg bg-white dark:bg-gray-900">
          <h2 className="text-2xl font-semibold mb-4">Mock Data Generation Demo</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This demo shows how Synthkit generates realistic mock data based on scenario configuration.
            <strong> Change the scenario above and click "Apply Scenario" to see how different categories, roles, stages, and IDs affect the data.</strong>
          </p>
          
          <div className="flex gap-4">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              onClick={fetchCustomers}
              disabled={mswStatus === 'loading' || isGenerating}
            >
              Refresh Customers
            </button>
            <button 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              onClick={fetchPayments}
              disabled={mswStatus === 'loading' || isGenerating}
            >
              Refresh Payments
            </button>
          </div>
        </div>

        {/* Data Display with Pagination */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
            <h3 className="text-xl font-semibold mb-4">
              Customers ({customerPagination.totalItems.toLocaleString()})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {customers.length === 0 ? (
                <p className="text-gray-500">No customers found. Click refresh to load.</p>
              ) : (
                <>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Showing {customerPagination.currentPage} of {customerPagination.totalPages} pages
                  </div>
                  {customerPagination.currentData.map((customer) => (
                    <div key={customer.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-800">
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</div>
                      <div className="text-xs text-gray-500">Tier: {customer.loyaltyTier}</div>
                    </div>
                  ))}
                  {customerPagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <button 
                        onClick={() => customerPagination.setCurrentPage(customerPagination.currentPage - 1)}
                        disabled={!customerPagination.hasPrevPage}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        ←
                      </button>
                      <span className="px-3 py-1 text-sm">
                        {customerPagination.currentPage} / {customerPagination.totalPages}
                      </span>
                      <button 
                        onClick={() => customerPagination.setCurrentPage(customerPagination.currentPage + 1)}
                        disabled={!customerPagination.hasNextPage}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
            <h3 className="text-xl font-semibold mb-4">
              Payments ({paymentPagination.totalItems.toLocaleString()})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {payments.length === 0 ? (
                <p className="text-gray-500">No payments found. Click refresh to load.</p>
              ) : (
                <>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Showing {paymentPagination.currentPage} of {paymentPagination.totalPages} pages
                  </div>
                  {paymentPagination.currentData.map((payment) => (
                    <div key={payment.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">Payment {payment.id}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Customer: {payment.customerId}
                          </div>
                          <div className="text-xs text-gray-500">
                            Method: {payment.paymentMethod}
                          </div>
                        </div>
                        <div className="text-right">
                        <div className="font-medium">
                          {typeof payment.amount === 'string' ? payment.amount : `$${payment.amount.toFixed(2)}`}
                        </div>
                          <div className="text-xs text-gray-500">{payment.status}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {paymentPagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <button 
                        onClick={() => paymentPagination.setCurrentPage(paymentPagination.currentPage - 1)}
                        disabled={!paymentPagination.hasPrevPage}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        ←
                      </button>
                      <span className="px-3 py-1 text-sm">
                        {paymentPagination.currentPage} / {paymentPagination.totalPages}
                      </span>
                      <button 
                        onClick={() => paymentPagination.setCurrentPage(paymentPagination.currentPage + 1)}
                        disabled={!paymentPagination.hasNextPage}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* AI Business Analysis */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold">🤖 AI Business Analysis</h2>
          <div className="border dark:border-gray-700 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Describe your business idea</label>
                <textarea
                  placeholder="E.g., A fitness app for tracking workouts and meal planning with social features..."
                  className="w-full h-24 p-3 border dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                />
              </div>
              
              <div className="flex gap-4 flex-wrap">
                <button 
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                  onClick={() => handleAiExample('A fitness app for tracking workouts and meal planning with social features')}
                >
                  Try: Fitness App
                </button>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                  onClick={() => handleAiExample('An online marketplace for handmade crafts and artisanal products')}
                >
                  Try: Craft Marketplace
                </button>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                  onClick={() => handleAiExample('A project management tool for remote teams with time tracking')}
                >
                  Try: Project Management
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  disabled={aiLoading || !aiDescription.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  onClick={handleAiAnalyze}
                >
                  {aiLoading ? 'Analyzing...' : 'Analyze Business'}
                </button>
                {aiError && (
                  <span className="text-red-600 text-sm">{aiError}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Results */}
        {showAiResults && analysisResult && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Analysis Results</h2>
              <button
                onClick={() => {
                  setShowAiResults(false);
                  const url = new URL(window.location.href);
                  url.searchParams.delete('ai');
                  window.history.pushState({}, '', url);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕ Hide Results
              </button>
            </div>
            <AnalysisResult result={analysisResult} />
          </div>
        )}

        {/* How it works */}
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">Realistic Data Generation:</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>Volumes:</strong> Early (47-523), Growth (1.2K-9.9K), Enterprise (12K-988K) customers</li>
            <li>• <strong>Payment Multipliers:</strong> Food Delivery (4.7x), Fashion (2.3x), SaaS (1.8x), Real Estate (0.3x)</li>
            <li>• <strong>Non-Rounded Values:</strong> 96,546 customers, 221,456 payments, $1,247.89 AOV, 9.56% conversion</li>
            <li>• <strong>Business Metrics:</strong> CLV, AOV, MRR, DAU, conversion rates scale realistically</li>
            <li>• <strong>Pagination:</strong> Large datasets paginated for performance (50 items/page)</li>
            <li>• <strong>Deterministic:</strong> Same scenario always produces identical data</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Try changing to "enterprise" + "forksy" for 20K+ records, or "stratus" + "growth" for realistic B2B SaaS data!
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">📖 Documentation</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• <a href="https://github.com/nicholasswanson/synthkit#-quick-start" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Quick Start Guide</a></li>
                <li>• <a href="https://github.com/nicholasswanson/synthkit#react-integration" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">React Integration</a></li>
                <li>• <a href="https://github.com/nicholasswanson/synthkit#nextjs-integration" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Next.js Integration</a></li>
                <li>• <a href="https://github.com/nicholasswanson/synthkit#-cli-usage" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CLI Commands</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">🚀 Quick Actions</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Install: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">npm install @synthkit/sdk</code></li>
                <li>• Init project: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">synthkit init my-app</code></li>
                <li>• <a href="https://github.com/nicholasswanson/synthkit" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View on GitHub</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}