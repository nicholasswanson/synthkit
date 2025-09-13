'use client';

import { useEffect, useState } from 'react';
import { SynthContextProvider } from '@/lib/synth-context';
import { logger } from '@/lib/logger';

// Import the pack directly for the demo
import examplePack from '../../packs/example-pack/pack.json';

// Lazy load MSW only in development
const loadMSW = async () => {
  if (process.env.NODE_ENV !== 'development') {
    logger.info('MSW disabled in production');
    return { start: async () => {}, updateHandlers: () => {} };
  }

  const { startMSW, updateHandlers } = await import('@/lib/mock-service-worker');
  return { start: startMSW, updateHandlers };
};

// Create MSW handlers from pack routes with simple mock data
async function createHandlersFromPack(pack: any, seed: number) {
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }

  const { http, HttpResponse } = await import('msw');
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
              return HttpResponse.json({ ...generateUser(), ...(body as any) }, { status: 201 });
            })
          );
        }
        
        if (path === '/api/invoices') {
          // Invoices endpoints
          handlers.push(
            http.get(path, () => {
              const invoices = Array.from({ length: 15 }, () => generateInvoice());
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
              return HttpResponse.json({ ...generateInvoice(), ...(body as any) }, { status: 201 });
            })
          );
        }
        
        // Generic DELETE for all endpoints
        handlers.push(
          http.delete(`${path}/:id`, () => {
            return HttpResponse.json({ success: true }, { status: 200 });
          })
        );
      }
    });
  }

  return handlers;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    const initMSW = async () => {
      if (process.env.NODE_ENV !== 'development') {
        setMswReady(true);
        return;
      }

      try {
        const { start, updateHandlers } = await loadMSW();
        await start();
        
        // Initial handlers setup
        const handlers = await createHandlersFromPack(examplePack, 12345);
        updateHandlers(handlers);
        
        setMswReady(true);
        logger.info('MSW initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize MSW', error);
        // Continue without MSW in case of error
        setMswReady(true);
      }
    };

    initMSW();
  }, []);

  // Don't render children until MSW is ready (or skipped in production)
  if (!mswReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // Create a simple store for the demo
  const demoStore = {
    activeCategory: typeof window !== 'undefined' ? localStorage.getItem('synthkit-category') || undefined : undefined,
    activeRole: typeof window !== 'undefined' ? localStorage.getItem('synthkit-role') || undefined : undefined,
    activeStage: (typeof window !== 'undefined' ? localStorage.getItem('synthkit-stage') : 'development') as 'development' | 'testing' | 'production',
    currentGenerationId: typeof window !== 'undefined' ? parseInt(localStorage.getItem('synthkit-generation-id') || '12345', 10) : 12345,
    packs: [examplePack]
  };

  return (
    <SynthContextProvider initialStore={demoStore}>
      {children}
    </SynthContextProvider>
  );
}