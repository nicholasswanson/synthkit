import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts', 'src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['inquirer'],
  minify: process.env.NODE_ENV === 'production',
  banner: {
    js: '#!/usr/bin/env node'
  }
});