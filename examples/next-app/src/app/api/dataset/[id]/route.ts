import { NextRequest, NextResponse } from 'next/server';
import { loadDataset } from '@/lib/dataset-storage';
import { ApiErrorResponse } from '@/lib/api-errors';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate dataset ID format
    if (!id || typeof id !== 'string') {
      return ApiErrorResponse.badRequest('Invalid dataset ID');
    }

    // Sanitize ID (prevent path traversal)
    const sanitizedId = id.replace(/[^a-zA-Z0-9\-_]/g, '');
    if (sanitizedId !== id) {
      return ApiErrorResponse.badRequest('Invalid characters in dataset ID');
    }

    // Load dataset
    const dataset = await loadDataset(sanitizedId);
    
    if (!dataset) {
      return ApiErrorResponse.notFound('Dataset not found');
    }

    logger.info('Dataset accessed', {
      id: sanitizedId,
      type: dataset.type,
      userAgent: request.headers.get('user-agent')?.substring(0, 100)
    });

    // Return the complete dataset
    const response = NextResponse.json({
      id: dataset.id,
      type: dataset.type,
      data: dataset.data,
      metadata: {
        createdAt: dataset.metadata.createdAt,
        scenario: dataset.metadata.scenario,
        aiAnalysis: dataset.metadata.aiAnalysis
        // Don't expose checksum to clients
      }
    });

    // Add CORS headers for cross-origin access
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    // Add caching headers (datasets are immutable)
    response.headers.set('Cache-Control', 'public, max-age=86400, immutable'); // 24 hours
    response.headers.set('ETag', `"${dataset.metadata.checksum}"`);

    return response;

  } catch (error) {
    logger.error('Dataset retrieval error', { id: params.id, error });
    return ApiErrorResponse.internalError(
      'Failed to retrieve dataset',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
