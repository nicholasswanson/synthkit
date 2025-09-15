import { NextRequest, NextResponse } from 'next/server';
import { ApiErrorResponse } from '@/lib/api-errors';
import { logger } from '@/lib/logger';

// Simple in-memory storage for current dataset (for demo purposes)
// In production, this could be Redis, database, or file-based
let currentDataset: any = null;

export async function GET(request: NextRequest) {
  try {
    if (!currentDataset) {
      return ApiErrorResponse.notFound('No current dataset available. Generate data in the demo app first.');
    }
    
    // Return dataset in same format as static datasets
    return NextResponse.json({
      id: currentDataset.id || '_current',
      type: currentDataset.type || 'live',
      data: currentDataset.data,
      metadata: {
        ...currentDataset.metadata,
        source: 'live-demo',
        updatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('Error loading current dataset:', error);
    return ApiErrorResponse.internalError('Failed to load current dataset');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Allow demo app to update current dataset
    const body = await request.json();
    
    currentDataset = {
      id: '_current',
      type: body.type || 'live',
      data: body.data,
      metadata: {
        ...body.metadata,
        updatedAt: new Date().toISOString(),
        source: 'live-demo'
      }
    };
    
    return NextResponse.json({ 
      success: true, 
      message: 'Current dataset updated',
      updatedAt: currentDataset.metadata.updatedAt
    });
    
  } catch (error) {
    logger.error('Error updating current dataset:', error);
    return ApiErrorResponse.badRequest('Invalid dataset data');
  }
}
