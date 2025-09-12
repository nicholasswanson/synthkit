import { http, HttpResponse, type HttpHandler } from 'msw';
import type { DataPack, RouteConfig } from '@synthkit/sdk';
import { SchemaGenerator } from '@synthkit/sdk';
import type { JSONSchema7 } from 'json-schema';

export interface RouteHandlerOptions {
  pack: DataPack;
  routePath: string;
  routeConfig: RouteConfig;
  seed?: number;
  locale?: string;
}

/**
 * Create MSW handlers for a single route
 */
export function createRouteHandlers(options: RouteHandlerOptions): HttpHandler[] {
  const { pack, routePath, routeConfig, seed, locale } = options;
  const handlers: HttpHandler[] = [];
  
  // Get the schema for this route
  if (!routeConfig.schema) {
    console.warn(`No schema defined for route '${routePath}' in pack '${pack.id}'`);
    return handlers;
  }
  
  const schema = pack.schemas[routeConfig.schema];
  if (!schema) {
    console.warn(`Schema '${routeConfig.schema}' not found in pack '${pack.id}'`);
    return handlers;
  }
  
  // Create generator with context
  const generator = new SchemaGenerator({ seed, locale });
  
  // For now, just create a simple handler for the specified method
  const method = routeConfig.method || 'GET';
  
  handlers.push(createSingleHandler({
    path: routePath,
    method: method as any,
    schema,
    generator,
  }));
  
  return handlers;
}

interface RESTHandlerOptions {
  basePath: string;
  schema: JSONSchema7;
  generator: SchemaGenerator;
}

/**
 * Create REST handlers (GET, POST, PUT, DELETE) for a resource
 */
function createRESTHandlers(options: RESTHandlerOptions): HttpHandler[] {
  const { basePath, schema, generator } = options;
  const store = new Map<string, any>();
  
  return [
    // GET /resource - List all
    http.get(basePath, () => {
      const items = Array.from(store.values());
      return HttpResponse.json(items);
    }),
    
    // GET /resource/:id - Get one
    http.get(`${basePath}/:id`, ({ params }) => {
      const id = params.id as string;
      const item = store.get(id);
      
      if (!item) {
        return HttpResponse.json(
          { error: 'Not found' },
          { status: 404 }
        );
      }
      
      return HttpResponse.json(item);
    }),
    
    // POST /resource - Create new
    http.post(basePath, async ({ request }) => {
      const body = await request.json() as any;
      const generated = generator.generate({ 
        schema,
        overrides: body 
      });
      
      // Ensure ID exists
      if (!generated.id) {
        generated.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      store.set(generated.id, generated);
      return HttpResponse.json(generated, { status: 201 });
    }),
    
    // PUT /resource/:id - Update
    http.put(`${basePath}/:id`, async ({ request, params }) => {
      const id = params.id as string;
      const body = await request.json() as any;
      
      const existing = store.get(id);
      if (!existing) {
        return HttpResponse.json(
          { error: 'Not found' },
          { status: 404 }
        );
      }
      
      const updated = { ...existing, ...body, id };
      store.set(id, updated);
      return HttpResponse.json(updated);
    }),
    
    // DELETE /resource/:id - Delete
    http.delete(`${basePath}/:id`, ({ params }) => {
      const id = params.id as string;
      
      if (!store.has(id)) {
        return HttpResponse.json(
          { error: 'Not found' },
          { status: 404 }
        );
      }
      
      store.delete(id);
      return HttpResponse.json(null, { status: 204 });
    }),
  ];
}

interface SingleHandlerOptions {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  schema: JSONSchema7;
  generator: SchemaGenerator;
}

/**
 * Create a single endpoint handler
 */
function createSingleHandler(options: SingleHandlerOptions): HttpHandler {
  const { path, method, schema, generator } = options;
  const handler = http[method.toLowerCase() as keyof typeof http];
  
  return handler(path, async ({ request }) => {
    let overrides = {};
    
    // Get overrides from request body if applicable
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        overrides = await request.json() as any;
      } catch {
        // Ignore JSON parsing errors
      }
    }
    
    const generated = generator.generate({ schema, overrides });
    return HttpResponse.json(generated);
  });
}

/**
 * Create MSW handlers for all routes in a pack
 */
export function createPackHandlers(
  pack: DataPack, 
  options?: { seed?: number; locale?: string }
): HttpHandler[] {
  const handlers: HttpHandler[] = [];
  
  if (!pack.routes) {
    return handlers;
  }
  
  for (const [routePath, routeConfig] of Object.entries(pack.routes)) {
    handlers.push(...createRouteHandlers({
      pack,
      routePath,
      routeConfig: routeConfig as RouteConfig,
      seed: options?.seed,
      locale: options?.locale,
    }));
  }
  
  return handlers;
}
