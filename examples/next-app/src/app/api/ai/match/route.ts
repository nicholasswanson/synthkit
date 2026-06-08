import { NextRequest, NextResponse } from 'next/server';
import { DescriptionAnalyzer, ScenarioMatcher } from '@synthkit/sdk';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const description = typeof body.description === 'string' ? body.description : '';
    const analyzer = new DescriptionAnalyzer(process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL);
    const analysis = await analyzer.analyze(description);

    if (!analysis.success || !analysis.analysis) {
      return NextResponse.json({ analysis, matches: { success: false, matches: [], recommendNewScenario: true, reasoning: [analysis.error || 'Analysis failed'] } }, { status: 400 });
    }

    const matcher = new ScenarioMatcher();
    const matches = await matcher.findMatches(analysis.analysis);

    return NextResponse.json({ analysis, matches });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to match scenario' },
      { status: 500 },
    );
  }
}
