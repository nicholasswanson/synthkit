import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { MCPSynthServer } from './server-class.js';

export function createMCPServer() {
  const synthServer = new MCPSynthServer();
  const server = new Server(
    {
      name: 'mcp-synth',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Define available tools
  const tools: Tool[] = [
    {
      name: 'generate',
      description: 'Generate mock data using a specific generator',
      inputSchema: {
        type: 'object',
        properties: {
          generator: {
            type: 'string',
            description: 'Generator key in format "pack:generator"',
          },
          count: {
            type: 'number',
            description: 'Number of items to generate',
            default: 1,
          },
          seed: {
            type: 'number',
            description: 'Seed for deterministic generation',
          },
          overrides: {
            type: 'object',
            description: 'Field overrides for generated data',
          },
        },
        required: ['generator'],
      },
    },
    {
      name: 'activateScenario',
      description: 'Activate a scenario',
      inputSchema: {
        type: 'object',
        properties: {
          scenario: {
            type: 'string',
            description: 'Scenario key in format "pack:scenario"',
          },
        },
        required: ['scenario'],
      },
    },
    {
      name: 'deactivateScenario',
      description: 'Deactivate a scenario',
      inputSchema: {
        type: 'object',
        properties: {
          scenario: {
            type: 'string',
            description: 'Scenario key in format "pack:scenario"',
          },
        },
        required: ['scenario'],
      },
    },
    {
      name: 'listPacks',
      description: 'List all available packs',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'listGenerators',
      description: 'List all available generators',
      inputSchema: {
        type: 'object',
        properties: {
          pack: {
            type: 'string',
            description: 'Filter by pack ID',
          },
        },
      },
    },
    {
      name: 'listScenarios',
      description: 'List all available scenarios',
      inputSchema: {
        type: 'object',
        properties: {
          pack: {
            type: 'string',
            description: 'Filter by pack ID',
          },
        },
      },
    },
    {
      name: 'setSeed',
      description: 'Set global seed for deterministic generation',
      inputSchema: {
        type: 'object',
        properties: {
          seed: {
            type: 'number',
            description: 'Seed value',
          },
        },
        required: ['seed'],
      },
    },
  ];

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      switch (name) {
        case 'generate':
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  await synthServer.generate(
                    args.generator as string,
                    args.count as number,
                    args.seed as number | undefined,
                    args.overrides as any
                  ),
                  null,
                  2
                ),
              },
            ],
          };

        case 'activateScenario':
          await synthServer.activateScenario(args.scenario as string);
          return {
            content: [
              {
                type: 'text',
                text: `Scenario ${args.scenario} activated`,
              },
            ],
          };

        case 'deactivateScenario':
          await synthServer.deactivateScenario(args.scenario as string);
          return {
            content: [
              {
                type: 'text',
                text: `Scenario ${args.scenario} deactivated`,
              },
            ],
          };

        case 'listPacks':
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(synthServer.listPacks(), null, 2),
              },
            ],
          };

        case 'listGenerators':
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  synthServer.listGenerators(args.pack as string | undefined),
                  null,
                  2
                ),
              },
            ],
          };

        case 'listScenarios':
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  synthServer.listScenarios(args.pack as string | undefined),
                  null,
                  2
                ),
              },
            ],
          };

        case 'setSeed':
          synthServer.setSeed(args.seed as number);
          return {
            content: [
              {
                type: 'text',
                text: `Global seed set to ${args.seed}`,
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
