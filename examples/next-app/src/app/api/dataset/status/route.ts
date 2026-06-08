import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DATASET_BASE_URL = 'https://nicholasswanson.github.io/synthkit/datasets/';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url || !url.startsWith(DATASET_BASE_URL) || !url.endsWith('.json')) {
    return NextResponse.json(
      { ready: false, error: 'Invalid dataset URL.' },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
    });

    return NextResponse.json({
      ready: response.ok,
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ready: false,
        error: error instanceof Error ? error.message : 'Unable to check dataset status.',
      },
      { status: 502 },
    );
  }
}
