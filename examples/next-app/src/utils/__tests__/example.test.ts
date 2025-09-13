import { describe, it, expect } from 'vitest';

// Simple utility function to test
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

describe('formatCurrency', () => {
  it('should format positive numbers', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format negative numbers', () => {
    expect(formatCurrency(-100)).toBe('-$100.00');
  });

  it('should round to 2 decimal places', () => {
    expect(formatCurrency(99.999)).toBe('$100.00');
  });
});
