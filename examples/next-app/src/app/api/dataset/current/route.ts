import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for the current dataset
let currentDataset: any = null;

export async function GET() {
  if (!currentDataset) {
    return NextResponse.json(
      { error: 'No dataset available' },
      { status: 404 }
    );
  }

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