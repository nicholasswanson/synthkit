import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for the current dataset
let currentDataset: any = null;

export async function GET(request: NextRequest) {
  if (!currentDataset) {
    return NextResponse.json(
      { error: 'No dataset available' },
      { status: 404 }
    );
  }

  // Get query parameters for pagination
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '1000');
  const offset = parseInt(searchParams.get('offset') || '0');
  const full = searchParams.get('full') === 'true';

  // If full dataset is requested, return everything
  if (full) {
    return NextResponse.json(currentDataset, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Create a browser-friendly version with limited records
  const browserFriendlyDataset = { ...currentDataset };
  
  // Limit each array to prevent browser crashes
  Object.keys(browserFriendlyDataset).forEach(key => {
    if (Array.isArray(browserFriendlyDataset[key]) && key !== '_metadata') {
      browserFriendlyDataset[key] = browserFriendlyDataset[key].slice(offset, offset + limit);
    }
  });

  // Add pagination info
  browserFriendlyDataset._pagination = {
    limit,
    offset,
    total: Object.keys(currentDataset).reduce((acc, key) => {
      if (Array.isArray(currentDataset[key]) && key !== '_metadata') {
        return Math.max(acc, currentDataset[key].length);
      }
      return acc;
    }, 0),
    hasMore: Object.keys(currentDataset).some(key => {
      if (Array.isArray(currentDataset[key]) && key !== '_metadata') {
        return currentDataset[key].length > offset + limit;
      }
      return false;
    })
  };

  return NextResponse.json(browserFriendlyDataset, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.dataset) {
      // Store the full dataset
      currentDataset = body.dataset;
      return NextResponse.json({ success: true });
    } else if (body.metadata) {
      // Just store metadata (legacy support)
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}