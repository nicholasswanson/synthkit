import { NextResponse } from 'next/server';

export async function GET() {
  // Simple liveness check - if we can respond, we're alive
  return NextResponse.json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
}
