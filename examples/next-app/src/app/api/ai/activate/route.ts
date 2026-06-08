import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const scenarioId = typeof body.scenarioId === 'string' ? body.scenarioId : 'custom';

  return NextResponse.json({
    success: true,
    message: `Scenario ${scenarioId} is ready in this browser session.`,
  });
}
