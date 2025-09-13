'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

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
            <div className="text-sm px-3 py-1 rounded text-green-600 bg-green-50">
              ✅ Ready
            </div>
          </div>
          
          <div className="p-6 border rounded-lg bg-white dark:bg-gray-900">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category (Business Type):</label>
                <select className="w-full px-3 py-2 border rounded-md text-black bg-white">
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
                <select className="w-full px-3 py-2 border rounded-md text-black bg-white">
                  <option value="admin">Admin (Full financial access)</option>
                  <option value="support">Support (Financial data masked)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Stage (Business Maturity):</label>
                <select className="w-full px-3 py-2 border rounded-md text-black bg-white">
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
                    defaultValue="12345"
                  />
                  <button 
                    className="px-3 py-2 border rounded-md hover:bg-gray-50"
                    title="Randomize ID"
                  >
                    🎲
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Apply Scenario
              </button>
              <button className="px-4 py-2 border rounded hover:bg-gray-50">
                Reset
              </button>
              <button className="px-4 py-2 border rounded hover:bg-gray-50">
                Save Snapshot
              </button>
            </div>
          </div>
        </div>

        {/* Current Scenario Display */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">Current Scenario:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="font-medium">Category:</span> modaic</div>
            <div><span className="font-medium">Role:</span> admin</div>
            <div><span className="font-medium">Stage:</span> early</div>
            <div><span className="font-medium">ID:</span> 12345</div>
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
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Refresh Customers
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Refresh Payments
            </button>
          </div>
        </div>

        {/* Data Display */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
            <h3 className="text-xl font-semibold mb-4">Customers (0)</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <p className="text-gray-500">No customers found. Click refresh to load.</p>
            </div>
          </div>
          
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
            <h3 className="text-xl font-semibold mb-4">Payments (0)</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <p className="text-gray-500">No payments found. Click refresh to load.</p>
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
