import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../analyze/route';
import { NextRequest } from 'next/server';

// Mock the AI module
vi.mock('@synthkit/ai', () => ({
  DescriptionAnalyzer: vi.fn().mockImplementation(() => ({
    analyze: vi.fn().mockResolvedValue({
      success: true,
      analysis: {
        businessContext: {
          type: 'ecommerce',
          stage: 'growth',
          primaryFeatures: ['shopping', 'payments'],
          targetAudience: ['consumers'],
          monetizationModel: 'marketplace'
        },
        entities: [],
        userRoles: ['customer', 'admin'],
        keyFeatures: ['shopping', 'payments'],
        confidence: 0.85,
        reasoning: ['Test reasoning']
      },
      processingTime: 1000
    })
  }))
}));

describe('/api/ai/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should analyze description successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({
        description: 'An e-commerce platform for selling products online'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.analysis).toBeDefined();
    expect(data.analysis.businessContext.type).toBe('ecommerce');
  });

  it('should reject empty description', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({
        description: ''
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('BAD_REQUEST');
  });

  it('should reject missing description', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.error.message).toContain('Description is required');
  });

  it('should reject invalid JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/analyze', {
      method: 'POST',
      body: 'invalid json'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.error.message).toContain('Invalid JSON');
  });

  it('should enforce description length limits', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({
        description: 'short'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.message).toContain('at least 10 characters');
  });

  it('should include rate limit headers', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({
        description: 'An e-commerce platform for selling products online'
      })
    });

    const response = await POST(request);
    
    expect(response.headers.get('X-RateLimit-Limit')).toBeDefined();
    expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
    expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
  });
});
