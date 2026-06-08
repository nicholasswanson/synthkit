import { NextRequest, NextResponse } from 'next/server';
import { DescriptionAnalyzer, ScenarioGenerator } from '@synthkit/sdk';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const description = typeof body.description === 'string' ? body.description : '';
    const analyzer = new DescriptionAnalyzer(process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL);
    const analysis = await analyzer.analyze(description);

    if (!analysis.success || !analysis.analysis) {
      return NextResponse.json({ analysis, generation: { success: false, reasoning: [], suggestions: [], error: analysis.error || 'Analysis failed' } }, { status: 400 });
    }

    const generator = new ScenarioGenerator();
    const generation = await generator.generateScenario(analysis.analysis);

    return NextResponse.json({ analysis, generation });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to generate scenario' },
      { status: 500 },
    );
  }
}
