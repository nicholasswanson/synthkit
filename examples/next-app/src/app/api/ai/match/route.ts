import { NextRequest, NextResponse } from 'next/server';
import { DescriptionAnalyzer, ScenarioMatcher } from '@synthkit/ai';

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required and must be a string' },
        { status: 400 }
      );
    }

    // First analyze the description
    const analyzer = new DescriptionAnalyzer();
    const analysis = await analyzer.analyze(description);

    if (!analysis.success) {
      return NextResponse.json(
        { error: 'Failed to analyze description' },
        { status: 500 }
      );
    }

    // Then find matches
    const matcher = new ScenarioMatcher();
    const matchResult = await matcher.findMatches(analysis?.analysis!);

    return NextResponse.json({
      analysis,
      matches: matchResult
    });
  } catch (error) {
    console.error('AI Matching error:', error);
    return NextResponse.json(
      { error: 'Failed to find matching scenarios' },
      { status: 500 }
    );
  }
}
