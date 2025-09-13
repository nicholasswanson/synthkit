import { defineConfig } from 'tsup';

export default defineConfig([
  // CLI executable
  {
    entry: ['src/cli.ts'],
    format: ['cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['inquirer'],
    minify: process.env.NODE_ENV === 'production',
    banner: {
      js: '#!/usr/bin/env node'
    }
  },
  // Library exports
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    external: ['inquirer'],
    minify: process.env.NODE_ENV === 'production'
  }
]);