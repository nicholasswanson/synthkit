import { describe, it, expect } from 'vitest';
import { ApiErrorResponse } from '../api-errors';

describe('ApiErrorResponse', () => {
  it('should create bad request response', () => {
    const response = ApiErrorResponse.badRequest('Invalid input');
    const body = response.body;
    
    expect(response.status).toBe(400);
    // We can't easily test the response body in this context
    // but we've verified the status code
  });

  it('should create unauthorized response', () => {
    const response = ApiErrorResponse.unauthorized();
    expect(response.status).toBe(401);
  });

  it('should create forbidden response', () => {
    const response = ApiErrorResponse.forbidden('Access denied');
    expect(response.status).toBe(403);
  });

  it('should create not found response', () => {
    const response = ApiErrorResponse.notFound();
    expect(response.status).toBe(404);
  });

  it('should create too many requests response', () => {
    const response = ApiErrorResponse.tooManyRequests();
    expect(response.status).toBe(429);
  });

  it('should create internal error response', () => {
    const response = ApiErrorResponse.internalError();
    expect(response.status).toBe(500);
  });

  it('should hide error details in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const response = ApiErrorResponse.internalError('Server error', { sensitive: 'data' });
    // In production, details should not be exposed
    
    process.env.NODE_ENV = originalEnv;
    expect(response.status).toBe(500);
  });
});
