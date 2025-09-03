#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from './mcp-server.js';

async function main() {
  const transport = new StdioServerTransport();
  const server = createMCPServer();
  
  await server.connect(transport);
  
  console.error('MCP Synth Server started');
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
