import { logger } from './logger';

interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number; // in cents
  requestsByEndpoint: Record<string, number>;
  lastReset: string;
}

// In-memory usage tracking (in production, use a database)
let usageStats: UsageStats = {
  totalRequests: 0,
  totalTokens: 0,
  totalCost: 0,
  requestsByEndpoint: {},
  lastReset: new Date().toISOString(),
};

// Anthropic pricing (as of 2024) - in cents per 1K tokens
const PRICING = {
  'claude-3-5-sonnet-20241022': {
    input: 0.3,   // $0.003 per 1K input tokens
    output: 1.5,  // $0.015 per 1K output tokens
  },
  'claude-3-5-haiku-20241022': {
    input: 0.1,   // $0.001 per 1K input tokens
    output: 0.5,  // $0.005 per 1K output tokens
  },
  'claude-3-opus-20240229': {
    input: 1.5,   // $0.015 per 1K input tokens
    output: 7.5,  // $0.075 per 1K output tokens
  },
  'claude-3-sonnet-20240229': {
    input: 0.3,   // $0.003 per 1K input tokens
    output: 1.5,  // $0.015 per 1K output tokens
  },
  'claude-3-haiku-20240307': {
    input: 0.1,   // $0.001 per 1K input tokens
    output: 0.5,  // $0.005 per 1K output tokens
  },
};

export function trackAIUsage(
  endpoint: string,
  model: string = 'claude-3-5-sonnet-20241022',
  inputTokens: number = 0,
  outputTokens: number = 0
) {
  // Update usage stats
  usageStats.totalRequests++;
  usageStats.totalTokens += inputTokens + outputTokens;
  
  if (!usageStats.requestsByEndpoint[endpoint]) {
    usageStats.requestsByEndpoint[endpoint] = 0;
  }
  usageStats.requestsByEndpoint[endpoint]++;

  // Calculate cost
  const pricing = PRICING[model as keyof typeof PRICING] || PRICING['claude-3-5-sonnet-20241022'];
  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  const requestCost = inputCost + outputCost;
  
  usageStats.totalCost += requestCost;

  // Log usage for monitoring
  logger.info('AI Usage tracked', {
    endpoint,
    model,
    inputTokens,
    outputTokens,
    requestCost: Math.round(requestCost * 100) / 100, // Round to 2 decimal places
    totalCost: Math.round(usageStats.totalCost * 100) / 100,
    totalRequests: usageStats.totalRequests,
  });

  // Log warning if approaching cost limits
  if (usageStats.totalCost > 100) { // $1.00
    logger.warn('AI usage approaching cost limit', {
      totalCost: Math.round(usageStats.totalCost * 100) / 100,
      totalRequests: usageStats.totalRequests,
    });
  }

  if (usageStats.totalCost > 500) { // $5.00
    logger.error('AI usage exceeded cost limit', {
      totalCost: Math.round(usageStats.totalCost * 100) / 100,
      totalRequests: usageStats.totalRequests,
    });
  }
}

export function getUsageStats(): UsageStats {
  return { ...usageStats };
}

export function resetUsageStats() {
  usageStats = {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    requestsByEndpoint: {},
    lastReset: new Date().toISOString(),
  };
  logger.info('Usage stats reset');
}

// Reset usage stats daily at midnight
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    resetUsageStats();
  }
}, 60 * 1000); // Check every minute
