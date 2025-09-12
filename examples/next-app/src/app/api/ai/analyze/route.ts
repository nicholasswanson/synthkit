import { NextRequest, NextResponse } from 'next/server';
import { DescriptionAnalyzer } from '@synthkit/ai';

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required and must be a string' },
        { status: 400 }
      );
    }

    const analyzer = new DescriptionAnalyzer();
    const result = await analyzer.analyze(description);

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze description' },
      { status: 500 }
    );
  }
}
