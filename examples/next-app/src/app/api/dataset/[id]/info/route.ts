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

    // Calculate data summary
    const dataSummary = Object.entries(dataset.data).reduce((summary, [key, value]) => {
      if (Array.isArray(value)) {
        summary[key] = {
          type: 'array',
          count: value.length,
          sample: value.length > 0 ? Object.keys(value[0] || {}) : []
        };
      } else if (typeof value === 'object' && value !== null) {
        summary[key] = {
          type: 'object',
          keys: Object.keys(value)
        };
      } else {
        summary[key] = {
          type: typeof value,
          value: value
        };
      }
      return summary;
    }, {} as Record<string, any>);

    logger.info('Dataset info accessed', {
      id: sanitizedId,
      type: dataset.type
    });

    // Return metadata and summary only (no actual data)
    const response = NextResponse.json({
      id: dataset.id,
      type: dataset.type,
      metadata: {
        createdAt: dataset.metadata.createdAt,
        scenario: dataset.metadata.scenario,
        aiAnalysis: dataset.metadata.aiAnalysis ? {
          prompt: dataset.metadata.aiAnalysis.prompt,
          // Include basic analysis info but not full details
          businessType: dataset.metadata.aiAnalysis.analysis?.businessContext?.type,
          entities: dataset.metadata.aiAnalysis.analysis?.entities?.map((e: any) => ({
            name: e.name,
            type: e.type,
            estimatedVolume: e.estimatedVolume
          }))
        } : undefined
      },
      dataSummary,
      totalRecords: Object.values(dataset.data).reduce((sum, value) => {
        return sum + (Array.isArray(value) ? value.length : 0);
      }, 0)
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    // Add caching headers
    response.headers.set('Cache-Control', 'public, max-age=3600'); // 1 hour
    response.headers.set('ETag', `"info-${dataset.metadata.checksum}"`);

    return response;

  } catch (error) {
    logger.error('Dataset info retrieval error', { id: params.id, error });
    return ApiErrorResponse.internalError(
      'Failed to retrieve dataset info',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
