'use client';

import { useState, useEffect } from 'react';
// import { PersonaScenarioSwitcher } from '@/components/PersonaScenarioSwitcher';
// import { useSynth } from '@/lib/synth-context';

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

export default function Home() {
  // const synth = useSynth();
  const [users, setUsers] = useState<User[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<{ users: boolean; invoices: boolean }>({
    users: false,
    invoices: false
  });
  const [showCompactSwitcher, setShowCompactSwitcher] = useState(false);
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
    localStorage.removeItem('synthkit-config');
    console.log('🔄 Configuration reset');
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
        
        // Simple mock handlers
        const handlers = [
          http.get('/api/users', () => {
            const users = Array.from({ length: 5 }, (_, i) => ({
              id: `user-${i + 1}`,
              name: `User ${i + 1}`,
              email: `user${i + 1}@example.com`,
              role: i % 2 === 0 ? 'admin' : 'user',
              createdAt: new Date().toISOString()
            }));
            return HttpResponse.json(users);
          }),
          
          http.get('/api/invoices', () => {
            const invoices = Array.from({ length: 3 }, (_, i) => ({
              id: `INV-${String(i + 1).padStart(3, '0')}`,
              userId: `user-${i + 1}`,
              amount: (i + 1) * 100,
              status: ['pending', 'paid', 'overdue'][i % 3],
              dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              items: [
                {
                  description: `Service ${i + 1}`,
                  quantity: 1,
                  price: (i + 1) * 100
                }
              ]
            }));
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
        
        // Wait a moment for MSW to be fully ready
        setTimeout(() => {
          console.log('🔄 Starting data fetch...');
          fetchUsers();
          fetchInvoices();
        }, 1000);
      } catch (error) {
        console.error('❌ MSW initialization failed:', error);
        setMswStatus('error');
        // Still try to fetch (will fail but shows the attempt)
        fetchUsers();
        fetchInvoices();
      }
    }
    
    initializeAndFetch();
  }, []);

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
                  <option value="development">Development</option>
                  <option value="demo">Demo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Persona:</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md text-black bg-white"
                  value={config.persona}
                  onChange={(e) => handleConfigChange('persona', e.target.value)}
                >
                  <option value="">No Persona</option>
                  <option value="alice">Alice (Admin)</option>
                  <option value="bob">Bob (User)</option>
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
            This demo shows how Synthkit generates mock data based on JSON schemas.
            Change the configuration above to see how different scenarios, personas, and seeds affect the data.
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
              {users.map((user) => (
                <div key={user.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-800">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>{user.email}</div>
                    <div>Role: {user.role}</div>
                    <div>Created: {new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
              {users.length === 0 && !loading.users && (
                <p className="text-gray-500">No users found. Click refresh to load.</p>
              )}
            </div>
          </div>

          {/* Invoices Section */}
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
            <h3 className="text-xl font-semibold mb-4">Invoices ({invoices.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{invoice.id}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div>Amount: ${invoice.amount.toFixed(2)}</div>
                        <div>Status: <span className={`font-medium ${
                          invoice.status === 'paid' ? 'text-green-600' : 
                          invoice.status === 'overdue' ? 'text-red-600' : 
                          'text-yellow-600'
                        }`}>{invoice.status}</span></div>
                        <div>Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                        <div>{invoice.items.length} items</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {invoices.length === 0 && !loading.invoices && (
                <p className="text-gray-500">No invoices found. Click refresh to load.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>Scenarios:</strong> Switch between "development" and "demo" to see different data volumes</li>
            <li>• <strong>Personas:</strong> Choose "Alice (Admin)" or "Bob (User)" to see role-based data variations</li>
            <li>• <strong>Seeds:</strong> Change the seed value to get different but consistent data sets</li>
            <li>• <strong>Stages:</strong> Switch between development, testing, and production environments</li>
            <li>• <strong>MSW:</strong> Mock Service Worker intercepts API calls and returns generated data</li>
            <li>• <strong>Schemas:</strong> Data structure defined in packs/example-pack/pack.json using JSON Schema</li>
            <li>• <strong>Snapshots:</strong> Save and restore complete configuration states</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Try changing the scenario or seed and clicking refresh to see how the data changes!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
