import { NextRequest, NextResponse } from 'next/server';
import { ApiErrorResponse } from './api-errors';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting
// In production, use Redis or similar
const store: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max requests per window
  message?: string;  // Custom error message
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // 60 requests per minute
  message: 'Too many requests, please try again later',
};

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const options = { ...defaultConfig, ...config };

  return async function rateLimitMiddleware(request: NextRequest): Promise<{ headers: Record<string, string>; allowed: true } | NextResponse> {
    // Generate key (default: IP-based)
    const key = options.keyGenerator?.(request) || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'anonymous';

    const now = Date.now();
    const resetTime = now + options.windowMs;

    // Get or create rate limit entry
    if (!store[key] || now > store[key].resetTime) {
      store[key] = { count: 0, resetTime };
    }

    store[key].count++;

    // Check if limit exceeded
    if (store[key].count > options.max) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
      
      const response = ApiErrorResponse.tooManyRequests(options.message);
      response.headers.set('X-RateLimit-Limit', options.max.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());
      response.headers.set('Retry-After', retryAfter.toString());
      
      return response;
    }

    // Add rate limit headers to successful responses
    const remaining = options.max - store[key].count;
    const headers = {
      'X-RateLimit-Limit': options.max.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(store[key].resetTime).toISOString(),
    };

    return { headers, allowed: true as const };
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  }
}, 60 * 1000); // Clean up every minute

// Specific rate limiters for different endpoints
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,              // 10 AI requests per minute
  message: 'AI request limit exceeded. Please wait before trying again.',
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,             // 100 API requests per minute
});
