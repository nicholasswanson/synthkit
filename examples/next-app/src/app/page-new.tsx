'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  userId: string;
  amount: number;
  status: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
}

// Global config reference that MSW handlers can access
let currentConfig = {
  scenario: 'development',
  persona: '',
  stage: 'development',
  seed: 12345
};

// Simple seeded random number generator
function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate users based on current config
function generateUsers(): User[] {
  const { scenario, persona, seed } = currentConfig;
  const count = scenario === 'demo' ? 10 : 5;
  
  const users: User[] = [];
  const names = [
    'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eve Brown', 
    'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Ivy Chen', 'Jack Anderson'
  ];
  const domains = ['example.com', 'test.org', 'demo.net', 'sample.io'];
  
  for (let i = 0; i < count; i++) {
    const userSeed = seed + i * 1000;
    const rand1 = seededRandom(userSeed);
    const rand2 = seededRandom(userSeed + 1);
    const rand3 = seededRandom(userSeed + 2);
    
    const name = names[Math.floor(rand1 * names.length)];
    const domain = domains[Math.floor(rand2 * domains.length)];
    const email = `${name.toLowerCase().replace(' ', '.')}@${domain}`;
    
    // Persona affects role distribution
    let role = 'user';
    if (persona === 'alice' && i === 0) {
      role = 'admin'; // First user is admin for Alice persona
    } else if (persona === 'bob') {
      role = 'user'; // All users for Bob persona
    } else {
      role = rand3 > 0.7 ? 'admin' : 'user'; // Random distribution
    }
    
    users.push({
      id: `user-${i + 1}`,
      name,
      email,
      role,
      createdAt: new Date(Date.now() - Math.floor(rand1 * 365 * 24 * 60 * 60 * 1000)).toISOString()
    });
  }
  
  return users;
}

// Generate invoices based on current config
function generateInvoices(): Invoice[] {
  const { scenario, persona, seed } = currentConfig;
  const count = scenario === 'demo' ? 8 : 3;
  
  const invoices: Invoice[] = [];
  const statuses = ['paid', 'pending', 'overdue'];
  const services = ['Web Development', 'Design Services', 'Consulting', 'Maintenance', 'Support', 'Training'];
  
  for (let i = 0; i < count; i++) {
    const invoiceSeed = seed + i * 2000;
    const rand1 = seededRandom(invoiceSeed);
    const rand2 = seededRandom(invoiceSeed + 1);
    const rand3 = seededRandom(invoiceSeed + 2);
    
    // Base amount varies with seed
    let amount = Math.floor(rand1 * 2000) + 500;
    
    // Persona affects amounts
    if (persona === 'alice') {
      amount = Math.floor(amount * 1.5); // 50% higher amounts for admin
    } else if (persona === 'bob') {
      amount = Math.floor(amount * 0.8); // 20% lower amounts for regular user
    }
    
    const service = services[Math.floor(rand2 * services.length)];
    const status = statuses[Math.floor(rand3 * statuses.length)];
    
    invoices.push({
      id: `INV-${String(i + 1).padStart(3, '0')}`,
      userId: `user-${Math.floor(rand2 * 5) + 1}`,
      amount,
      status,
      dueDate: new Date(Date.now() + Math.floor(rand1 * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      items: [{
        description: service,
        quantity: 1,
        price: amount
      }]
    });
  }
  
  return invoices;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<{ users: boolean; invoices: boolean }>({
    users: false,
    invoices: false
  });
  const [mswStatus, setMswStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  
  // Configuration state
  const [config, setConfig] = useState({
    scenario: 'development',
    persona: '',
    stage: 'development',
    seed: 12345
  });

  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchInvoices = async () => {
    setLoading(prev => ({ ...prev, invoices: true }));
    try {
      const response = await fetch('/api/invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(prev => ({ ...prev, invoices: false }));
    }
  };

  // Configuration handlers
  const handleConfigChange = (field: string, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyConfiguration = () => {
    console.log('🔧 Applying configuration:', config);
    
    // Update the global config reference that MSW handlers use
    currentConfig = { ...config };
    console.log('📝 Updated currentConfig:', currentConfig);
    
    // Save to localStorage for persistence
    localStorage.setItem('synthkit-config', JSON.stringify(config));
    
    // Refresh data with new configuration
    fetchUsers();
    fetchInvoices();
  };

  const handleReset = () => {
    const defaultConfig = {
      scenario: 'development',
      persona: '',
      stage: 'development',
      seed: 12345
    };
    setConfig(defaultConfig);
    currentConfig = { ...defaultConfig };
    localStorage.removeItem('synthkit-config');
    console.log('🔄 Configuration reset');
    
    // Refresh data
    fetchUsers();
    fetchInvoices();
  };

  const handleRandomizeSeed = () => {
    const newSeed = Math.floor(Math.random() * 100000);
    handleConfigChange('seed', newSeed);
  };

  const handleSaveSnapshot = () => {
    const snapshotName = prompt('Enter snapshot name:');
    if (snapshotName) {
      const snapshots = JSON.parse(localStorage.getItem('synthkit-snapshots') || '[]');
      const snapshot = {
        id: Date.now().toString(),
        name: snapshotName,
        config: { ...config },
        timestamp: new Date().toISOString()
      };
      snapshots.push(snapshot);
      localStorage.setItem('synthkit-snapshots', JSON.stringify(snapshots));
      console.log('📸 Snapshot saved:', snapshotName);
    }
  };

  useEffect(() => {
    // Load saved configuration
    const savedConfig = localStorage.getItem('synthkit-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        currentConfig = { ...parsedConfig }; // Sync global config
        console.log('📋 Loaded saved configuration:', parsedConfig);
      } catch (error) {
        console.error('Failed to parse saved configuration:', error);
      }
    }

    // Initialize MSW and then fetch data
    async function initializeAndFetch() {
      try {
        console.log('🚀 Initializing MSW...');
        
        // Dynamic import to avoid SSR issues
        const { setupWorker } = await import('msw/browser');
        const { http, HttpResponse } = await import('msw');
        
        // Dynamic mock handlers that use currentConfig
        const handlers = [
          http.get('/api/users', () => {
            console.log('🔄 Generating users with config:', currentConfig);
            const users = generateUsers();
            console.log('👥 Generated users:', users.length, 'users');
            return HttpResponse.json(users);
          }),
          
          http.get('/api/invoices', () => {
            console.log('🔄 Generating invoices with config:', currentConfig);
            const invoices = generateInvoices();
            console.log('📄 Generated invoices:', invoices.length, 'invoices');
            return HttpResponse.json(invoices);
          })
        ];
        
        const worker = setupWorker(...handlers);
        await worker.start({
          onUnhandledRequest: 'bypass',
          serviceWorker: { 
            url: '/mockServiceWorker.js',
            options: {
              scope: '/'
            }
          },
          quiet: false
        });
        
        console.log('✅ MSW initialized successfully with', handlers.length, 'handlers');
        console.log('📡 Registered routes:', handlers.map(h => h.info?.header || 'unknown'));
        setMswStatus('ready');
        
        // Initial data fetch
        setTimeout(() => {
          console.log('🔄 Starting initial data fetch...');
          fetchUsers();
          fetchInvoices();
        }, 1000);
        
      } catch (error) {
        console.error('❌ MSW initialization failed:', error);
        setMswStatus('error');
        // Fallback: try to fetch anyway
        fetchUsers();
        fetchInvoices();
      }
    }
    
    initializeAndFetch();
  }, []); // Only run once on mount

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8">
      <div className="z-10 max-w-6xl w-full">
        <h1 className="text-4xl font-bold mb-8">Synthkit Next.js Example</h1>
        
        {/* Configuration Controls */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Configuration</h2>
            <div className={`text-sm px-3 py-1 rounded ${
              mswStatus === 'ready' ? 'text-green-600 bg-green-50' :
              mswStatus === 'error' ? 'text-red-600 bg-red-50' :
              'text-yellow-600 bg-yellow-50'
            }`}>
              {mswStatus === 'ready' ? '✅ MSW Active' :
               mswStatus === 'error' ? '❌ MSW Error' :
               '⏳ MSW Loading'}
            </div>
          </div>
          
          <div className="p-6 border rounded-lg bg-white dark:bg-gray-900">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Scenario:</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md text-black bg-white"
                  value={config.scenario}
                  onChange={(e) => handleConfigChange('scenario', e.target.value)}
                >
                  <option value="development">Development (5 users, 3 invoices)</option>
                  <option value="demo">Demo (10 users, 8 invoices)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Persona:</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md text-black bg-white"
                  value={config.persona}
                  onChange={(e) => handleConfigChange('persona', e.target.value)}
                >
                  <option value="">No Persona (random roles)</option>
                  <option value="alice">Alice (Admin - higher amounts)</option>
                  <option value="bob">Bob (User - lower amounts)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stage:</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md text-black bg-white"
                  value={config.stage}
                  onChange={(e) => handleConfigChange('stage', e.target.value)}
                >
                  <option value="development">Development</option>
                  <option value="testing">Testing</option>
                  <option value="production">Production</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Seed:</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={config.seed}
                    onChange={(e) => handleConfigChange('seed', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border rounded-md text-black bg-white"
                  />
                  <button 
                    onClick={handleRandomizeSeed}
                    className="px-3 py-2 border rounded-md hover:bg-gray-50"
                    title="Randomize seed"
                  >
                    🎲
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleApplyConfiguration}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Apply Configuration
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

        {/* Current State Display */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">Current Configuration:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Scenario:</span> {config.scenario}
            </div>
            <div>
              <span className="font-medium">Persona:</span> {config.persona || 'None'}
            </div>
            <div>
              <span className="font-medium">Stage:</span> {config.stage}
            </div>
            <div>
              <span className="font-medium">Seed:</span> {config.seed}
            </div>
          </div>
        </div>

        {/* Data Demo */}
        <div className="mb-8 p-6 border rounded-lg bg-white dark:bg-gray-900">
          <h2 className="text-2xl font-semibold mb-4">Mock Data Generation Demo</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This demo shows how Synthkit generates mock data based on configuration.
            <strong> Change the configuration above and click "Apply Configuration" to see how different scenarios, personas, and seeds affect the data.</strong>
          </p>
          <div className="flex gap-4">
            <button 
              onClick={fetchUsers} 
              disabled={loading.users}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading.users ? 'Loading...' : 'Refresh Users'}
            </button>
            <button 
              onClick={fetchInvoices} 
              disabled={loading.invoices}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading.invoices ? 'Loading...' : 'Refresh Invoices'}
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Users Section */}
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
            <h3 className="text-xl font-semibold mb-4">Users ({users.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-gray-500">No users found. Click refresh to load.</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Invoices Section */}
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
            <h3 className="text-xl font-semibold mb-4">Invoices ({invoices.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {invoices.length === 0 ? (
                <p className="text-gray-500">No invoices found. Click refresh to load.</p>
              ) : (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{invoice.id}</h4>
                        <p className="text-sm text-gray-600">User: {invoice.userId}</p>
                        <p className="text-sm text-gray-600">{invoice.items[0]?.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${invoice.amount}</p>
                        <span className={`px-2 py-1 text-xs rounded ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>Scenarios:</strong> "development" shows 5 users/3 invoices, "demo" shows 10 users/8 invoices</li>
            <li>• <strong>Personas:</strong> "Alice" shows admin role and 50% higher invoice amounts, "Bob" shows 20% lower amounts</li>
            <li>• <strong>Seeds:</strong> Change the seed value to get different but consistent data sets</li>
            <li>• <strong>Deterministic:</strong> Same configuration always generates the same data</li>
            <li>• <strong>MSW:</strong> Mock Service Worker intercepts API calls and returns generated data</li>
            <li>• <strong>Dynamic:</strong> Handlers use live configuration when generating data</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Try changing the scenario to "demo", persona to "alice", or seed to a different number and click "Apply Configuration"!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
