import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { apiRateLimit } from '@/lib/rate-limiter';
import { logApiRequest, logApiError, logDatasetServed } from '@/lib/monitoring';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const startTime = Date.now();
  
  // Apply rate limiting
  const rateLimitResult = await apiRateLimit(request);
  if (!('allowed' in rateLimitResult)) {
    return rateLimitResult; // This is already a NextResponse
  }
  
  // Extract headers if rate limit passed
  const rateLimitHeaders = rateLimitResult.headers;
  
  try {
    // Remove .json extension if present (API route receives full filename)
    const datasetId = params.id.endsWith('.json') ? params.id.slice(0, -5) : params.id;
    const staticPath = path.join(process.cwd(), 'public', 'datasets', `${datasetId}.json`);
    
    if (fs.existsSync(staticPath)) {
      const dataset = JSON.parse(fs.readFileSync(staticPath, 'utf8'));
      
      // Log success for monitoring
      const responseTime = Date.now() - startTime;
      console.log(`Dataset served: ${datasetId} (${responseTime}ms)`);
      
      // Log to monitoring service
      logDatasetServed(
        datasetId,
        responseTime,
        request.headers.get('user-agent') || undefined,
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
      );
      
              return NextResponse.json(dataset, {
                headers: {
                  'Cache-Control': 'public, max-age=3600',
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Methods': 'GET, OPTIONS',
                  'Access-Control-Allow-Headers': 'Content-Type',
                  ...rateLimitHeaders
                }
              });
    }
    
    // Log 404 for monitoring
    logApiError(
      `/api/datasets/${params.id}`,
      'Dataset not found',
      404,
      request.headers.get('user-agent') || undefined,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    );
    
    return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
  } catch (error) {
    // Log error for monitoring
    const responseTime = Date.now() - startTime;
    console.error(`Dataset error: ${params.id}`, error);
    
    logApiError(
      `/api/datasets/${params.id}`,
      error instanceof Error ? error.message : String(error),
      500,
      request.headers.get('user-agent') || undefined,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    );
    
    return NextResponse.json({ 
      error: 'Dataset temporarily unavailable',
      fallback: `/datasets/${params.id}.json` // Static fallback
    }, { status: 503 });
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
