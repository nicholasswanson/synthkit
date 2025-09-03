'use client';

import { useState, useEffect } from 'react';

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

// Global scenario reference that MSW handlers can access
let currentScenario = {
  category: 'modaic',
  role: 'admin',
  stage: 'early',
  id: 12345
};

// Simple seeded random number generator
function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate customers based on current scenario
function generateCustomers(): Customer[] {
  const { category, stage, id } = currentScenario;
  
  // Volume based on stage
  const count = stage === 'early' ? 5 : stage === 'growth' ? 12 : 25;
  
  const customers: Customer[] = [];
  const names = [
    'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eve Brown', 
    'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Ivy Chen', 'Jack Anderson',
    'Kelly Martinez', 'Liam O\'Connor', 'Maya Patel', 'Noah Kim', 'Olivia Zhang',
    'Parker Jones', 'Quinn Rodriguez', 'Riley Thompson', 'Sam Williams', 'Taylor Brown',
    'Uma Singh', 'Victor Chen', 'Willow Davis', 'Xavier Lopez', 'Yuki Tanaka'
  ];
  const domains = ['example.com', 'test.org', 'demo.net', 'sample.io'];

  for (let i = 0; i < count; i++) {
    const customerSeed = id + i * 1000;
    const rand = seededRandom(customerSeed);
    const name = names[Math.floor(rand * names.length)];
    const email = `${name.toLowerCase().replace(/[^a-z]/g, '.')}@${domains[Math.floor(seededRandom(customerSeed + 1) * domains.length)]}`;
    
    // Loyalty tier based on category and role
    let loyaltyTier = 'bronze';
    if (currentScenario.role === 'admin') {
      loyaltyTier = seededRandom(customerSeed + 2) > 0.7 ? 'gold' : 'silver';
    } else {
      loyaltyTier = seededRandom(customerSeed + 2) > 0.8 ? 'silver' : 'bronze';
    }

    customers.push({
      id: `customer-${i + 1}`,
      name,
      email,
      loyaltyTier,
      createdAt: new Date(Date.now() - Math.floor(seededRandom(customerSeed + 3) * 365 * 24 * 60 * 60 * 1000)).toISOString()
    });
  }

  return customers;
}

// Generate payments based on current scenario
function generatePayments(): Payment[] {
  const { category, stage, role, id } = currentScenario;
  
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
  const [scenario, setScenario] = useState(currentScenario);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [mswStatus, setMswStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Initialize MSW and set up handlers
  useEffect(() => {
    const initializeMSW = async () => {
      try {
        const { setupWorker } = await import('msw/browser');
        const { http, HttpResponse } = await import('msw');

        // Dynamic mock handlers that use currentScenario
        const handlers = [
          http.get('/api/customers', () => {
            console.log('🔄 Generating customers with scenario:', currentScenario);
            const customers = generateCustomers();
            return HttpResponse.json(customers);
          }),

          http.get('/api/payments', () => {
            console.log('🔄 Generating payments with scenario:', currentScenario);
            const payments = generatePayments();
            return HttpResponse.json(payments);
          })
        ];

        const worker = setupWorker(...handlers);
        
        await worker.start({
          onUnhandledRequest: 'bypass',
          scope: '/',
          quiet: false
        });
        
        console.log('✅ MSW initialized successfully');
        setMswStatus('ready');
        
        // Sync initial scenario state to global reference
        currentScenario = { ...scenario };
        
        // Initial data fetch after a short delay
        setTimeout(() => {
          fetchCustomers();
          fetchPayments();
        }, 100);
        
      } catch (error) {
        console.error('❌ MSW initialization failed:', error);
        setMswStatus('error');
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
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  const handleScenarioChange = (field: keyof typeof scenario, value: string | number) => {
    setScenario(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyScenario = () => {
    console.log('🔧 Applying scenario:', scenario);

    // Update the global scenario reference
    currentScenario = { ...scenario };

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
    currentScenario = { ...defaultScenario };
    localStorage.removeItem('synthkit-scenario');
    fetchCustomers();
    fetchPayments();
  };

  const handleRandomizeId = () => {
    const newId = Math.floor(Math.random() * 100000);
    handleScenarioChange('id', newId);
  };

  const handleSaveSnapshot = () => {
    const snapshot = {
      scenario: { ...scenario },
      timestamp: new Date().toISOString(),
      customers: [...customers],
      payments: [...payments]
    };
    localStorage.setItem('synthkit-snapshot', JSON.stringify(snapshot));
    alert('Snapshot saved to localStorage!');
  };

  // Load saved scenario on mount
  useEffect(() => {
    const saved = localStorage.getItem('synthkit-scenario');
    if (saved) {
      try {
        const parsedScenario = JSON.parse(saved);
        setScenario(parsedScenario);
        currentScenario = { ...parsedScenario };
      } catch (error) {
        console.error('Failed to parse saved scenario:', error);
      }
    }
  }, []);

  const getMswStatusDisplay = () => {
    switch (mswStatus) {
      case 'loading': return <div className="text-sm px-3 py-1 rounded text-yellow-600 bg-yellow-50">⏳ MSW Loading</div>;
      case 'ready': return <div className="text-sm px-3 py-1 rounded text-green-600 bg-green-50">✅ MSW Ready</div>;
      case 'error': return <div className="text-sm px-3 py-1 rounded text-red-600 bg-red-50">❌ MSW Error</div>;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8">
      <div className="z-10 max-w-6xl w-full">
        <h1 className="text-4xl font-bold mb-8">Synthkit Next.js Example</h1>
        
        {/* Scenario Configuration */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Scenario Configuration</h2>
            {getMswStatusDisplay()}
          </div>
          
          <div className="p-6 border rounded-lg bg-white dark:bg-gray-900">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category (Business Type):</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md text-black bg-white"
                  value={scenario.category}
                  onChange={(e) => handleScenarioChange('category', e.target.value)}
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
                  onChange={(e) => handleScenarioChange('role', e.target.value)}
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
                  onChange={(e) => handleScenarioChange('stage', e.target.value as 'early' | 'growth' | 'enterprise')}
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
                    onChange={(e) => handleScenarioChange('id', parseInt(e.target.value) || 0)}
                  />
                  <button 
                    onClick={handleRandomizeId}
                    className="px-3 py-2 border rounded-md hover:bg-gray-50"
                    title="Randomize ID"
                  >
                    🎲
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleApplyScenario}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Apply Scenario
              </button>
              <button 
                onClick={handleReset}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Reset
              </button>
              <button 
                onClick={handleSaveSnapshot}
                className="px-4 py-2 border rounded hover:bg-gray-50"
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

        {/* Demo Section */}
        <div className="mb-8 p-6 border rounded-lg bg-white dark:bg-gray-900">
          <h2 className="text-2xl font-semibold mb-4">Mock Data Generation Demo</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This demo shows how Synthkit generates mock data based on scenario configuration.
            <strong> Change the scenario above and click "Apply Scenario" to see how different categories, roles, stages, and IDs affect the data.</strong>
          </p>
          <div className="flex gap-4">
            <button 
              onClick={fetchCustomers}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={mswStatus !== 'ready'}
            >
              Refresh Customers
            </button>
            <button 
              onClick={fetchPayments}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              disabled={mswStatus !== 'ready'}
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
                    <div className="text-xs text-gray-500 mt-1">
                      Tier: {customer.loyaltyTier} • Created: {new Date(customer.createdAt).toLocaleDateString()}
                    </div>
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
                        <div className="font-medium">
                          {typeof payment.amount === 'string' ? payment.amount : `$${payment.amount}`}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {payment.paymentMethod} • {payment.status}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

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
      </div>
    </main>
  );
}