import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  uptime: number;
  environment: string;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail';
      message?: string;
      responseTime?: number;
    };
  };
}

// Get package version
let packageVersion = 'unknown';
try {
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
  );
  packageVersion = packageJson.version || 'unknown';
} catch (error) {
  // Ignore error, use default
}

const startTime = Date.now();

export async function GET() {
  const checks: HealthStatus['checks'] = {};
  let overallStatus: HealthStatus['status'] = 'healthy';

  // Check 1: Memory usage
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const heapPercentage = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

  checks.memory = {
    status: heapPercentage < 90 ? 'pass' : 'fail',
    message: `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB (${heapPercentage}%)`,
  };

  if (heapPercentage >= 90) {
    overallStatus = 'unhealthy';
  } else if (heapPercentage >= 80) {
    overallStatus = 'degraded';
  }

  // Check 2: API key configuration
  const apiKeyConfigured = !!process.env.ANTHROPIC_API_KEY;
  checks.aiService = {
    status: apiKeyConfigured ? 'pass' : 'fail',
    message: apiKeyConfigured ? 'AI service configured' : 'AI service not configured (missing API key)',
  };

  if (!apiKeyConfigured && overallStatus === 'healthy') {
    overallStatus = 'degraded';
  }

  // Check 3: Environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  checks.environment = {
    status: 'pass',
    message: `Running in ${process.env.NODE_ENV || 'unknown'} mode`,
  };

  const response: HealthStatus = {
    status: overallStatus,
    version: packageVersion,
    timestamp: new Date().toISOString(),
    uptime: Math.round((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV || 'unknown',
    checks,
  };

  return NextResponse.json(response, {
    status: overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503,
  });
}
