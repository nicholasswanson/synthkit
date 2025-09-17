import { NextRequest, NextResponse } from 'next/server';
import { DescriptionAnalyzer } from '@synthkit/sdk';
import { ApiErrorResponse } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { aiRateLimit } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await aiRateLimit(request);
  if ('allowed' in rateLimitResult && !rateLimitResult.allowed) {
    // This shouldn't happen as allowed is always true when headers are returned
    return ApiErrorResponse.internalError('Rate limit check failed');
  }
  
  if (!('allowed' in rateLimitResult)) {
    // This is the rate limit response
    return rateLimitResult;
  }

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return ApiErrorResponse.badRequest('Invalid JSON in request body');
    }

    const { description } = body;

    // Validate input
    if (!description) {
      return ApiErrorResponse.badRequest('Description is required');
    }

    if (typeof description !== 'string') {
      return ApiErrorResponse.badRequest('Description must be a string');
    }

    if (description.length < 10) {
      return ApiErrorResponse.badRequest('Description must be at least 10 characters long');
    }

    if (description.length > 5000) {
      return ApiErrorResponse.badRequest('Description must not exceed 5000 characters');
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return ApiErrorResponse.serviceUnavailable('AI service is not configured');
    }

    const analyzer = new DescriptionAnalyzer();
    const result = await analyzer.analyze(description);

    logger.info('AI analysis completed successfully', {
      descriptionLength: description.length,
      processingTime: result.processingTime,
    });

    const response = NextResponse.json(result);
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });
    return response;
  } catch (error) {
    logger.error('AI Analysis failed', error);
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return ApiErrorResponse.unauthorized('Invalid API key');
      }
      if (error.message.includes('rate limit')) {
        return ApiErrorResponse.tooManyRequests('AI service rate limit exceeded');
      }
    }
    
    return ApiErrorResponse.internalError(
      'Failed to analyze description',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
