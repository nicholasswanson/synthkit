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

// Simple seeded random number generator
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateCustomers(scenario: { category: string; role: string; stage: string; id: number }): Customer[] {
  const { category, stage, role, id } = scenario;
  
  // Volume based on stage
  const count = stage === 'early' ? 8 : stage === 'growth' ? 15 : 30;
  
  const customers: Customer[] = [];
  const loyaltyTiers = ['bronze', 'silver', 'gold', 'platinum'];
  const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Quinn', 'Sage', 'River'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

  for (let i = 0; i < count; i++) {
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
  
  // Volume based on stage
  const count = stage === 'early' ? 8 : stage === 'growth' ? 15 : 30;
  
  const payments: Payment[] = [];
  const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'];
  const statuses = ['completed', 'pending', 'failed'];

  for (let i = 0; i < count; i++) {
    const paymentSeed = id + i * 2000;
    let amount: number | string = Math.floor(seededRandom(paymentSeed) * 500) + 50;
    
    // Apply category-specific pricing
    if (category === 'modaic') {
      amount *= 1.2; // Fashion items are pricier
    } else if (category === 'stratus') {
      amount *= 2.5; // SaaS subscriptions
    } else if (category === 'forksy') {
      amount *= 0.6; // Food orders are smaller
    } else if (category === 'fluxly') {
      amount *= 0.8; // Creator tips and subscriptions
    } else if (category === 'mindora') {
      amount *= 1.8; // Course purchases
    } else if (category === 'pulseon') {
      amount *= 0.7; // Fitness subscriptions
    } else if (category === 'procura') {
      amount *= 5.0; // Medical supplies are expensive
    } else if (category === 'brightfund') {
      amount *= 1.5; // Donations vary widely
    } else if (category === 'keynest') {
      amount *= 15.0; // Rent payments are large
    }
    
    // Apply stage multiplier
    if (stage === 'growth') amount *= 1.5;
    if (stage === 'enterprise') amount *= 2.2;
    
    // Apply role-based masking
    if (role === 'support') {
      amount = 'hidden';
    } else {
      amount = Math.floor(amount as number);
    }

    payments.push({
      id: `payment-${i + 1}`,
      customerId: `customer-${Math.floor(seededRandom(paymentSeed + 1) * 5) + 1}`,
      amount,
      status: statuses[Math.floor(seededRandom(paymentSeed + 2) * statuses.length)],
      paymentMethod: paymentMethods[Math.floor(seededRandom(paymentSeed + 3) * paymentMethods.length)],
      createdAt: new Date(Date.now() - Math.floor(seededRandom(paymentSeed + 4) * 30 * 24 * 60 * 60 * 1000)).toISOString()
    });
  }

  return payments;
}

export default function Home() {
  const [scenario, setScenario] = useState({
    category: 'modaic',
    role: 'admin',
    stage: 'early' as const,
    id: 12345
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [mswStatus, setMswStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  
  // Use a ref to share scenario with MSW handlers
  const scenarioRef = useRef(scenario);
  useEffect(() => {
    scenarioRef.current = scenario;
  }, [scenario]);
  
  // AI-related state
  const [aiDescription, setAiDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [showAiResults, setShowAiResults] = useState(false);

  // Initialize MSW and set up handlers - with proper browser check
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
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      // Fallback: generate data directly
      setCustomers(generateCustomers(scenarioRef.current));
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      // Fallback: generate data directly
      setPayments(generatePayments(scenarioRef.current));
    }
  };

  const handleApplyScenario = () => {
    console.log('🔧 Applying scenario:', scenario);

    // Save to localStorage for persistence
    localStorage.setItem('synthkit-scenario', JSON.stringify(scenario));

    // Refresh data with new scenario
    fetchCustomers();
    fetchPayments();
  };

  const handleReset = () => {
    const defaultScenario = {
      category: 'modaic',
      role: 'admin',
      stage: 'early' as const,
      id: 12345
    };
    setScenario(defaultScenario);
    localStorage.removeItem('synthkit-scenario');
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
          <h1 className="text-4xl font-bold">Synthkit Next.js Example</h1>
        </div>

        {/* Scenario Configuration */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Scenario Configuration</h2>
            <div className="text-sm px-3 py-1 rounded text-yellow-600 bg-yellow-50">
              {mswStatus === 'loading' && '⏳ MSW Loading'}
              {mswStatus === 'ready' && '✅ MSW Ready'}
              {mswStatus === 'error' && '❌ MSW Error'}
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
                  <option value="stratus">Stratus (B2B SaaS)</option>
                  <option value="forksy">Forksy (Food Marketplace)</option>
                  <option value="fluxly">Fluxly (Creator Economy)</option>
                  <option value="mindora">Mindora (Online Learning)</option>
                  <option value="pulseon">Pulseon (Fitness Platform)</option>
                  <option value="procura">Procura (Healthcare Supply)</option>
                  <option value="brightfund">Brightfund (Impact Platform)</option>
                  <option value="keynest">Keynest (Real Estate)</option>
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
                  <option value="early">Early (Startup scale)</option>
                  <option value="growth">Growth (Scaling business)</option>
                  <option value="enterprise">Enterprise (Large scale)</option>
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
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleApplyScenario}
              >
                Apply Scenario
              </button>
              <button 
                className="px-4 py-2 border rounded hover:bg-gray-50"
                onClick={handleReset}
              >
                Reset
              </button>
              <button 
                className="px-4 py-2 border rounded hover:bg-gray-50"
                onClick={() => console.log('Save snapshot clicked')}
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
            This demo shows how Synthkit generates mock data based on scenario configuration.
            <strong> Change the scenario above and click "Apply Scenario" to see how different categories, roles, stages, and IDs affect the data.</strong>
          </p>
          
          <div className="flex gap-4">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              onClick={fetchCustomers}
              disabled={mswStatus === 'loading'}
            >
              Refresh Customers
            </button>
            <button 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              onClick={fetchPayments}
              disabled={mswStatus === 'loading'}
            >
              Refresh Payments
            </button>
          </div>
        </div>

        {/* Data Display */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
            <h3 className="text-xl font-semibold mb-4">Customers ({customers.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {customers.length === 0 ? (
                <p className="text-gray-500">No customers found. Click refresh to load.</p>
              ) : (
                customers.map((customer) => (
                  <div key={customer.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-800">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</div>
                    <div className="text-xs text-gray-500">Tier: {customer.loyaltyTier}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
            <h3 className="text-xl font-semibold mb-4">Payments ({payments.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {payments.length === 0 ? (
                <p className="text-gray-500">No payments found. Click refresh to load.</p>
              ) : (
                payments.map((payment) => (
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
                          {typeof payment.amount === 'string' ? payment.amount : `$${payment.amount}`}
                        </div>
                        <div className="text-xs text-gray-500">{payment.status}</div>
                      </div>
                    </div>
                  </div>
                ))
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
          <h3 className="font-semibold mb-2">How it works:</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>Categories:</strong> 9 business types from synthetic-dataset (Modaic, Stratus, Forksy, Fluxly, Mindora, Pulseon, Procura, Brightfund, Keynest)</li>
            <li>• <strong>Roles:</strong> "admin" sees all financial data, "support" sees masked amounts as "hidden"</li>
            <li>• <strong>Stages:</strong> "early" (5-8 records), "growth" (12-15 records), "enterprise" (25-30 records)</li>
            <li>• <strong>ID:</strong> Deterministic generation - same ID always produces identical data</li>
            <li>• <strong>MSW:</strong> Mock Service Worker intercepts API calls and returns generated data</li>
            <li>• <strong>Dynamic:</strong> Handlers use live scenario configuration when generating data</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Try changing the category to "fluxly", "mindora", or "stratus", role to "support", or ID to a different number and click "Apply Scenario"!
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
