import { http, HttpResponse, HttpHandler, PathParams } from 'msw';
import type { Generator } from '@synthkit/sdk';

export interface MockHandlerOptions<T = any> {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  generator?: Generator<T>;
  response?: T | ((req: Request, params: PathParams) => T | Promise<T>);
  delay?: number | { min: number; max: number };
  status?: number;
}

export function createMockHandler<T extends Record<string, any> = any>(options: MockHandlerOptions<T>): HttpHandler {
  const method = options.method || 'GET';
  const handler = http[method.toLowerCase() as keyof typeof http];
  
  return handler(options.path, async ({ request, params }) => {
    // Apply delay if specified
    if (options.delay) {
      const delayMs = typeof options.delay === 'number' 
        ? options.delay 
        : Math.random() * (options.delay.max - options.delay.min) + options.delay.min;
      
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    let responseData: T;
    
    if (options.generator) {
      responseData = options.generator.generate();
    } else if (options.response !== undefined) {
      if (typeof options.response === 'function') {
        responseData = await (options.response as (req: Request, params: PathParams) => T | Promise<T>)(request, params);
      } else {
        responseData = options.response;
      }
    } else {
      responseData = {} as T;
    }

    return HttpResponse.json(responseData, { 
      status: options.status || 200 
    });
  });
}

export function createMockHandlers(handlerOptions: MockHandlerOptions[]): HttpHandler[] {
  return handlerOptions.map((options) => createMockHandler(options));
}

export function createRESTHandlers<T extends Record<string, any> = any>(options: {
  basePath: string;
  generator: Generator<T>;
  delay?: number | { min: number; max: number };
}): HttpHandler[] {
  const { basePath, generator, delay } = options;
  const store = new Map<string, T>();

  return [
    // GET all
    createMockHandler({
      path: basePath,
      method: 'GET',
      response: () => {
        const items = Array.from(store.values());
        return items.length > 0 ? items : generator.generateMany(5);
      },
      delay,
    }),

    // GET by ID
    createMockHandler({
      path: `${basePath}/:id`,
      method: 'GET',
      response: (req, params) => {
        const id = params.id as string;
        const item = store.get(id);
        return item || generator.generate({ overrides: { ...({} as Partial<T>), id } });
      },
      delay,
    }),

    // POST create
    createMockHandler({
      path: basePath,
      method: 'POST',
      response: async (req) => {
        const body = await req.json() as Partial<T>;
        const item = generator.generate({ overrides: body });
        const id = (item as any).id || String(Date.now());
        store.set(id, item);
        return item;
      },
      delay,
    }),

    // PUT update
    createMockHandler({
      path: `${basePath}/:id`,
      method: 'PUT',
      response: async (req, params) => {
        const id = params.id as string;
        const body = await req.json() as Partial<T>;
        const existing = store.get(id);
        const updated = existing 
          ? { ...existing, ...body }
          : generator.generate({ overrides: { ...body, id } });
        store.set(id, updated);
        return updated;
      },
      delay,
    }),

    // DELETE
    createMockHandler({
      path: `${basePath}/:id`,
      method: 'DELETE',
      response: (req, params) => {
        const id = params.id as string;
        const existed = store.has(id);
        store.delete(id);
        return { success: existed };
      },
      delay,
    }),
  ];
}
