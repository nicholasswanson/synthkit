import { describe, it, expect, vi } from 'vitest';
import { GET } from '../route';

describe('/api/health', () => {
  it('should return healthy status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.version).toBeDefined();
    expect(data.timestamp).toBeDefined();
    expect(data.checks).toBeDefined();
  });

  it('should include memory check', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.checks.memory).toBeDefined();
    expect(data.checks.memory.status).toBe('pass');
    expect(data.checks.memory.message).toMatch(/Heap:/);
  });

  it('should check AI service configuration', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.checks.aiService).toBeDefined();
    expect(data.checks.aiService.status).toMatch(/pass|fail/);
  });

  it('should include environment information', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.environment).toBeDefined();
    expect(data.checks.environment).toBeDefined();
    expect(data.checks.environment.status).toBe('pass');
  });
});
