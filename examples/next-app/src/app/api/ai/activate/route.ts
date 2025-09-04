import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { packId, scenarioId } = await request.json();

    if (!packId || !scenarioId) {
      return NextResponse.json(
        { error: 'Pack ID and Scenario ID are required' },
        { status: 400 }
      );
    }

    // Check if the generated pack exists
    const packPath = join(process.cwd(), 'generated-packs', packId, 'pack.json');
    
    try {
      const packContent = await readFile(packPath, 'utf-8');
      const pack = JSON.parse(packContent);
      
      // Verify the scenario exists in the pack
      if (!pack.scenarios || !pack.scenarios[scenarioId]) {
        return NextResponse.json(
          { error: `Scenario '${scenarioId}' not found in pack '${packId}'` },
          { status: 404 }
        );
      }

      // Update the synth.config.json to activate this scenario
      const configPath = join(process.cwd(), 'synth.config.json');
      let config: any = {};
      
      try {
        const configContent = await readFile(configPath, 'utf-8');
        config = JSON.parse(configContent);
      } catch (error) {
        // Config file doesn't exist, create a new one
        config = {
          packs: [],
          scenarios: {}
        };
      }

      // Add the pack if it's not already included
      if (!config.packs.includes(packId)) {
        config.packs.push(packId);
      }

      // Set the active scenario
      config.scenarios[packId] = scenarioId;

      // Save the updated config
      await writeFile(configPath, JSON.stringify(config, null, 2));

      return NextResponse.json({
        success: true,
        message: `Successfully activated scenario '${scenarioId}' from pack '${packId}'`,
        config: {
          activePack: packId,
          activeScenario: scenarioId,
          scenario: pack.scenarios[scenarioId]
        }
      });

    } catch (fileError) {
      return NextResponse.json(
        { error: `Generated pack '${packId}' not found. Make sure to generate and save the pack first.` },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Scenario activation error:', error);
    return NextResponse.json(
      { error: 'Failed to activate scenario' },
      { status: 500 }
    );
  }
}
