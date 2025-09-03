import { http, HttpResponse } from 'msw';

// This will be populated by Synthkit
export const handlers: any[] = [];

// Create the worker instance only in browser
export const worker = typeof window !== 'undefined' ? null : null;

// Function to update handlers
export function updateHandlers(newHandlers: any[]) {
  handlers.length = 0;
  handlers.push(...newHandlers);
  // Note: In this simplified version, we'll just store the handlers
  // The actual worker will be created and updated in startMSW
}

// Function to start MSW
export async function startMSW() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Dynamic import to avoid SSR issues
    const { setupWorker } = await import('msw/browser');
    const worker = setupWorker(...handlers);
    
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    console.log('[MSW] Mock Service Worker started with', handlers.length, 'handlers');
    return worker;
  } catch (error) {
    console.error('[MSW] Failed to start:', error);
    throw error;
  }
}
