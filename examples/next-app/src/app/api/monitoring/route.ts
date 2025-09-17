import { NextRequest, NextResponse } from 'next/server';
import { monitoring } from '@/lib/monitoring';
import { apiRateLimit } from '@/lib/rate-limiter';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Apply rate limiting
  const rateLimitResult = await apiRateLimit(request);
  if (!('allowed' in rateLimitResult)) {
    return rateLimitResult; // This is already a NextResponse
  }
  
  // Extract headers if rate limit passed
  const rateLimitHeaders = rateLimitResult.headers;

  try {
    const stats = monitoring.getStats();
    const recentErrors = monitoring.getRecentErrors();

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      stats,
      recentErrors,
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        ...rateLimitResult.headers
      }
    });
  } catch (error) {
    console.error('Monitoring API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  // Apply rate limiting
  const rateLimitResult = await apiRateLimit(request);
  if (!('allowed' in rateLimitResult)) {
    return rateLimitResult; // This is already a NextResponse
  }
  
  // Extract headers if rate limit passed
  const rateLimitHeaders = rateLimitResult.headers;

  try {
    monitoring.clear();
    return NextResponse.json({ message: 'Monitoring data cleared' });
  } catch (error) {
    console.error('Monitoring Clear Error:', error);
    return NextResponse.json(
      { error: 'Failed to clear monitoring data' },
      { status: 500 }
    );
  }
}
