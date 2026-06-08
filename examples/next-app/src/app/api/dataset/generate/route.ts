import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const GITHUB_OWNER = 'nicholasswanson';
const GITHUB_REPO = 'synthkit';
const DATASET_BASE_URL = 'https://nicholasswanson.github.io/synthkit/datasets';

const ANIMALS = [
  'cheetah', 'lion', 'eagle', 'tiger', 'wolf', 'bear', 'shark', 'dolphin',
  'panther', 'leopard', 'jaguar', 'lynx', 'bobcat', 'cougar', 'puma',
  'falcon', 'hawk', 'owl', 'raven', 'crow', 'swan', 'heron', 'egret',
  'fox', 'coyote', 'jackal', 'hyena', 'mongoose', 'weasel', 'otter',
  'seal', 'walrus', 'whale', 'orca', 'narwhal', 'beluga', 'dolphin',
  'elephant', 'rhino', 'hippo', 'giraffe', 'zebra', 'antelope', 'gazelle',
  'buffalo', 'bison', 'yak', 'camel', 'llama', 'alpaca', 'deer',
];

function createDatasetFilename(scenarioId: number): string {
  const timestamp = Date.now().toString().slice(-6);
  const animal1 = ANIMALS[scenarioId % ANIMALS.length];
  const animal2 = ANIMALS[(scenarioId * 7) % ANIMALS.length];
  return `${animal1}-${animal2}-${scenarioId}-${timestamp}.json`;
}

export async function POST(request: NextRequest) {
  try {
    const token = process.env.SYNTHKIT_TOKEN || process.env.GITHUB_TOKEN;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Dataset publishing is missing SYNTHKIT_TOKEN or GITHUB_TOKEN.' },
        { status: 500 },
      );
    }

    const body = await request.json();
    const scenarioId = Number(body.scenarioId || 12345);
    const filename = createDatasetFilename(Number.isFinite(scenarioId) ? scenarioId : 12345);
    const url = `${DATASET_BASE_URL}/${filename}`;

    const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        event_type: 'generate-dataset',
        client_payload: {
          businessType: body.businessType || 'b2b-saas-subscriptions',
          stage: body.stage || 'growth',
          scenarioId,
          filename,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `GitHub dispatch failed: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      url,
      message: 'Dataset generation started. It will be available shortly.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to generate dataset' },
      { status: 500 },
    );
  }
}
