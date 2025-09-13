import { NextResponse } from 'next/server';

interface ReadinessCheck {
  ready: boolean;
  checks: {
    [key: string]: boolean;
  };
  timestamp: string;
}

export async function GET() {
  const checks: ReadinessCheck['checks'] = {
    // Check if environment variables are loaded
    environment: !!process.env.NODE_ENV,
    // Check if we can handle requests (basic check)
    server: true,
    // Check if AI is available (if API key is present)
    aiAvailable: !!process.env.ANTHROPIC_API_KEY,
  };

  const ready = Object.values(checks).every(check => check !== false);

  const response: ReadinessCheck = {
    ready,
    checks,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, {
    status: ready ? 200 : 503,
  });
}
