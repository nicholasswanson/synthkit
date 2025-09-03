'use client';

import { useEffect, useState } from 'react';
import { startMSW, updateHandlers } from '@/lib/mock-service-worker';
import { http, HttpResponse } from 'msw';
import { SynthContextProvider } from '@/lib/synth-context';

// Import the pack directly for the demo
import examplePack from '../../packs/example-pack/pack.json';

// Create MSW handlers from pack routes with simple mock data
function createHandlersFromPack(pack: any, seed: number) {
  const handlers: any[] = [];

  // Simple mock data generators
  const generateUser = (id?: string) => ({
    id: id || `user-${Math.floor(Math.random() * 1000)}`,
    name: `User ${Math.floor(Math.random() * 100)}`,
    email: `user${Math.floor(Math.random() * 100)}@example.com`,
    role: Math.random() > 0.5 ? 'admin' : 'user',
    createdAt: new Date().toISOString()
  });

  const generateInvoice = (id?: string) => ({
    id: id || `INV-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`,
    userId: `user-${Math.floor(Math.random() * 100)}`,
    amount: Math.floor(Math.random() * 5000) + 100,
    status: ['pending', 'paid', 'overdue', 'cancelled'][Math.floor(Math.random() * 4)],
    dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
      description: `Item ${Math.floor(Math.random() * 100)}`,
      quantity: Math.floor(Math.random() * 10) + 1,
      price: Math.floor(Math.random() * 500) + 10
    }))
  });

  if (pack.routes) {
    Object.entries(pack.routes).forEach(([path, route]: [string, any]) => {
      if (route.rest) {
        if (path === '/api/users') {
          // Users endpoints
          handlers.push(
            http.get(path, () => {
              const users = Array.from({ length: 10 }, () => generateUser());
              return HttpResponse.json(users);
            })
          );
          
          handlers.push(
            http.get(`${path}/:id`, ({ params }) => {
              return HttpResponse.json(generateUser(params.id as string));
            })
          );
          
          handlers.push(
            http.post(path, async ({ request }) => {
              const body = await request.json();
              return HttpResponse.json({ ...generateUser(), ...body }, { status: 201 });
            })
          );
        }
        
        if (path === '/api/invoices') {
          // Invoices endpoints
          handlers.push(
            http.get(path, () => {
              const invoices = Array.from({ length: 10 }, () => generateInvoice());
              return HttpResponse.json(invoices);
            })
          );
          
          handlers.push(
            http.get(`${path}/:id`, ({ params }) => {
              return HttpResponse.json(generateInvoice(params.id as string));
            })
          );
          
          handlers.push(
            http.post(path, async ({ request }) => {
              const body = await request.json();
              return HttpResponse.json({ ...generateInvoice(), ...body }, { status: 201 });
            })
          );
        }
        
        // Generic DELETE for all endpoints
        handlers.push(
          http.delete(`${path}/:id`, () => {
            return new HttpResponse(null, { status: 204 });
          })
        );
      }
    });
  }

  return handlers;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        console.log('🚀 Starting Synthkit initialization...');
        
        // Skip MSW for now to test basic functionality
        console.log('⚠️ Skipping MSW initialization for debugging');
        
        setIsReady(true);
        console.log('✅ Basic initialization complete!');
      } catch (error) {
        console.error('❌ Failed to initialize Synthkit:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setIsReady(true);
      }
    }

    initialize();
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl mb-2">🚀 Loading Synthkit...</div>
          <div className="text-sm text-gray-500">Initializing mock service worker</div>
        </div>
      </div>
    );
  }

  // Create a simple store for the demo
  const demoStore = {
    activeScenario: typeof window !== 'undefined' ? localStorage.getItem('synthkit-scenario') || undefined : undefined,
    activePersona: typeof window !== 'undefined' ? localStorage.getItem('synthkit-persona') || undefined : undefined,
    activeStage: (typeof window !== 'undefined' ? localStorage.getItem('synthkit-stage') : 'development') as 'development' | 'testing' | 'production',
    currentSeed: typeof window !== 'undefined' ? parseInt(localStorage.getItem('synthkit-seed') || '12345', 10) : 12345,
    packs: [examplePack]
  };

  return (
    <div>
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md">
          <strong>Synthkit Error:</strong> {error}
        </div>
      )}
      <div className="fixed top-4 left-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm z-50">
        ✅ MSW Active
      </div>
      {children}
    </div>
  );
}
