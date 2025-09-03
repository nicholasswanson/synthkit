import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    // Remove environment from root - let packages decide
    // setupFiles: ['./test/setup.ts'], // COMMENTED OUT - causing issues
    include: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        'build/',
        '**/*.config.*',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@synthkit/client': path.resolve(__dirname, './packages/synthkit-client/src'),
      '@synthkit/sdk': path.resolve(__dirname, './packages/synthkit-sdk/src'),
      '@synthkit/mcp-synth': path.resolve(__dirname, './packages/mcp-synth/src'),
    },
  },
});
