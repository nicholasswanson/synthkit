import { NextRequest, NextResponse } from 'next/server';
import { DescriptionAnalyzer } from '@synthkit/sdk';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const description = typeof body.description === 'string' ? body.description : '';

    const analyzer = new DescriptionAnalyzer(process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL);
    const result = await analyzer.analyze(description);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unable to analyze scenario',
        processingTime: 0,
      },
      { status: 500 },
    );
  }
}
