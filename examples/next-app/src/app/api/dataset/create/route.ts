import { NextRequest, NextResponse } from 'next/server';
import { createDataset, type DatasetCreateRequest } from '@/lib/dataset-storage';
import { ApiErrorResponse } from '@/lib/api-errors';
import { logger } from '@/lib/logger';

// Simple rate limiting
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < 60000); // 1 minute window
  
  if (recentRequests.length >= 10) { // 10 requests per minute
    return false;
  }
  
  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);
  return true;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return ApiErrorResponse.tooManyRequests('Rate limit exceeded. Please try again later.');
    }

    // Parse request body
    let body: DatasetCreateRequest;
    try {
      body = await request.json();
    } catch (e) {
      return ApiErrorResponse.badRequest('Invalid JSON in request body');
    }

    // Validate request
    const validation = validateCreateRequest(body);
    if (!validation.valid) {
      logger.error('Dataset validation failed', { 
        error: validation.error, 
        type: body.type,
        dataKeys: Object.keys(body.data || {}),
        recordCounts: Object.fromEntries(
          Object.entries(body.data || {}).map(([key, value]) => [
            key, 
            Array.isArray(value) ? value.length : typeof value
          ])
        ),
        hasMetadata: !!body.metadata,
        clientIP
      });
      return ApiErrorResponse.badRequest(validation.error || 'Invalid request data');
    }

    // Create dataset
    const result = await createDataset(body);
    
    if (!result.success) {
      logger.error('Dataset creation failed', { error: result.error, type: body.type });
      return ApiErrorResponse.internalError(result.error || 'Failed to create dataset');
    }

    logger.info('Dataset created successfully', {
      id: result.id,
      type: body.type,
      dataSize: Object.keys(body.data).length,
      clientIP
    });

    return NextResponse.json({
      success: true,
      id: result.id,
      url: result.url,
      type: body.type
    });

  } catch (error) {
    logger.error('Dataset creation error', error);
    return ApiErrorResponse.internalError(
      'Failed to create dataset',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

function validateCreateRequest(body: any): { valid: boolean; error?: string } {
  // Check required fields
  if (!body.type || !body.data) {
    return { valid: false, error: 'Missing required fields: type, data' };
  }

  // Validate type
  if (!['scenario', 'ai-generated'].includes(body.type)) {
    return { valid: false, error: 'Invalid type. Must be "scenario" or "ai-generated"' };
  }

  // Validate data structure
  if (typeof body.data !== 'object' || Array.isArray(body.data)) {
    return { valid: false, error: 'Data must be an object' };
  }

  // For scenario datasets, validate required metadata
  if (body.type === 'scenario') {
    if (!body.metadata?.scenario) {
      return { valid: false, error: 'Scenario datasets require scenario metadata' };
    }
    
    const { category, role, stage, id } = body.metadata.scenario;
    if (!category || !role || !stage || typeof id !== 'number') {
      return { valid: false, error: 'Invalid scenario metadata. Required: category, role, stage, id' };
    }
  }

  // For AI datasets, validate required metadata
  if (body.type === 'ai-generated') {
    if (!body.metadata?.aiAnalysis?.prompt) {
      return { valid: false, error: 'AI datasets require prompt in aiAnalysis metadata' };
    }
  }

  // Validate data size (prevent abuse) - increased for enterprise scenarios
  const dataString = JSON.stringify(body.data);
  if (dataString.length > 50 * 1024 * 1024) { // 50MB limit (enterprise scenarios can be large)
    return { valid: false, error: 'Dataset too large. Maximum size is 50MB' };
  }

  // Validate record counts (align with realistic enterprise limits)
  const totalRecords = Object.values(body.data).reduce((sum: number, value) => {
    return sum + (Array.isArray(value) ? value.length : 0);
  }, 0);

  if (totalRecords > 10000000) { // 10M records max (realistic enterprise level)
    return { valid: false, error: 'Too many records. Maximum is 10,000,000 total records' };
  }

  return { valid: true };
}
