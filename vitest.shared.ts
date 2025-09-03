import { defineConfig } from 'vitest/config';

/**
 * Create a Node.js test configuration
 * Used for server-side packages (SDK, MCP, CLI)
 */
export const createNodeTestConfig = () => defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});

/**
 * Create a browser/React test configuration
 * Used for frontend packages that need DOM/React support
 */
export const createBrowserTestConfig = () => defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
