import { HttpHandler } from 'msw';

let worker: any = null;
let server: any = null;

export async function setupMSW(handlers: HttpHandler[] = []) {
  if (typeof window !== 'undefined') {
    // Browser environment - dynamic import to avoid bundling issues
    const { setupWorker } = await import('msw/browser');
    
    if (!worker) {
      worker = setupWorker(...handlers);
    } else {
      worker.use(...handlers);
    }
    
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    
    return worker;
  } else {
    // Node environment - dynamic import to avoid bundling issues
    const { setupServer } = await import('msw/node');
    
    if (!server) {
      server = setupServer(...handlers);
    } else {
      server.use(...handlers);
    }
    
    server.listen({
      onUnhandledRequest: 'bypass',
    });
    
    return server;
  }
}

export async function startMSW(handlers?: HttpHandler[]) {
  return setupMSW(handlers);
}

export function stopMSW() {
  if (worker) {
    worker.stop();
    worker = null;
  }
  
  if (server) {
    server.close();
    server = null;
  }
}

export function resetMSWHandlers() {
  if (worker) {
    worker.resetHandlers();
  }
  
  if (server) {
    server.resetHandlers();
  }
}

export function useMSWHandlers(handlers: HttpHandler[]) {
  if (worker) {
    worker.use(...handlers);
  }
  
  if (server) {
    server.use(...handlers);
  }
}
