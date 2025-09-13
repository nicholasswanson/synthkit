import { NextRequest, NextResponse } from 'next/server';
import { DescriptionAnalyzer, ScenarioGenerator } from '@synthkit/ai';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Helper functions for different export formats
function formatAsYAML(obj: any): string {
  // Simple YAML formatter (for basic objects)
  function yamlify(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent);
    if (typeof obj === 'string') {
      return obj.includes('\n') ? `|\n${spaces}  ${obj.replace(/\n/g, `\n${spaces}  `)}` : `"${obj}"`;
    }
    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return String(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => `${spaces}- ${yamlify(item, indent + 1).trim()}`).join('\n');
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj)
        .map(([key, value]) => `${spaces}${key}: ${yamlify(value, indent + 1)}`)
        .join('\n');
    }
    return String(obj);
  }
  return yamlify(obj);
}

function formatAsTypeScript(pack: any): string {
  const interfaceName = `${pack.name.replace(/\s+/g, '')}Pack`;
  
  return `// Generated TypeScript definitions for ${pack.name}
export interface ${interfaceName} {
  id: string;
  name: string;
  description: string;
  version: string;
  schemas: {
${Object.keys(pack.schemas).map(key => `    ${key}: any;`).join('\n')}
  };
  scenarios: {
${Object.keys(pack.scenarios).map(key => `    ${key}: Scenario;`).join('\n')}
  };
  personas: {
${Object.keys(pack.personas).map(key => `    ${key}: Persona;`).join('\n')}
  };
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  config: {
    seed: number;
    dateRange: {
      start: string;
      end: string;
    };
    volume: Record<string, number>;
    relationships: Record<string, number>;
  };
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  preferences?: Record<string, any>;
  overrides: Record<string, any>;
}

export const ${pack.id.replace(/-/g, '_').toUpperCase()}_PACK: ${interfaceName} = ${JSON.stringify(pack, null, 2)};
`;
}

export async function POST(request: NextRequest) {
  try {
    const { description, saveToFile = false, outputPath, exportFormat = 'json' } = await request.json();

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

    // Generate the scenario
    const generator = new ScenarioGenerator();
    const generationResult = await generator.generateScenario(analysis?.analysis!);

    // Save to file if requested
    let savedFiles: string[] = [];
    if (saveToFile && generationResult.success && generationResult.pack) {
      try {
        const baseDir = outputPath || join(process.cwd(), 'generated-packs');
        const packDir = join(baseDir, generationResult.pack.id);
        
        // Create directory
        await mkdir(packDir, { recursive: true });
        
        // Save pack file in requested format
        let packFilePath: string;
        let packContent: string;
        
        switch (exportFormat.toLowerCase()) {
          case 'yaml':
            packFilePath = join(packDir, 'pack.yaml');
            packContent = formatAsYAML(generationResult.pack);
            break;
          case 'typescript':
          case 'ts':
            packFilePath = join(packDir, 'pack.ts');
            packContent = formatAsTypeScript(generationResult.pack);
            break;
          default:
            packFilePath = join(packDir, 'pack.json');
            packContent = JSON.stringify(generationResult.pack, null, 2);
        }
        
        await writeFile(packFilePath, packContent);
        savedFiles.push(packFilePath);
        
        // Save individual schema files
        const schemasDir = join(packDir, 'schemas');
        await mkdir(schemasDir, { recursive: true });
        
        for (const [schemaName, schema] of Object.entries(generationResult.pack.schemas)) {
          const schemaPath = join(schemasDir, `${schemaName}.json`);
          await writeFile(schemaPath, JSON.stringify(schema, null, 2));
          savedFiles.push(schemaPath);
        }
        
        // Save scenarios.js file
        const scenariosPath = join(packDir, 'scenarios.js');
        const scenariosContent = `export const scenarios = ${JSON.stringify(generationResult.pack.scenarios, null, 2)};`;
        await writeFile(scenariosPath, scenariosContent);
        savedFiles.push(scenariosPath);
        
        // Save personas.js file
        const personasPath = join(packDir, 'personas.js');
        const personasContent = `export const personas = ${JSON.stringify(generationResult.pack.personas, null, 2)};`;
        await writeFile(personasPath, personasContent);
        savedFiles.push(personasPath);
        
      } catch (fileError) {
        console.error('Error saving files:', fileError);
        return NextResponse.json({
          analysis,
          generation: {
            ...generationResult,
            fileError: 'Failed to save files to disk'
          }
        });
      }
    }

    return NextResponse.json({
      analysis,
      generation: {
        ...generationResult,
        savedFiles: saveToFile ? savedFiles : undefined
      }
    });
  } catch (error) {
    console.error('AI Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate scenario' },
      { status: 500 }
    );
  }
}
