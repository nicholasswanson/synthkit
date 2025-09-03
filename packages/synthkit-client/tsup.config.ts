import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'msw', 'msw/browser', 'msw/node'],
  minify: process.env.NODE_ENV === 'production',
  esbuildOptions(options) {
    // Replace node-specific imports with empty modules in browser builds
    options.platform = 'browser';
  },
});
