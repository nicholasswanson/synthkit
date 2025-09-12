#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

console.log('🔄 Updating packages to use catalog versions...');

// Dependencies that should use catalog versions
const catalogDeps = [
  '@faker-js/faker',
  '@anthropic-ai/sdk', 
  'zod',
  'zustand',
  'json-schema-faker',
  'msw',
  'tsup',
  'typescript',
  'vitest',
  '@types/node',
  '@types/json-schema',
  '@types/react',
  '@types/react-dom',
  'eslint',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'prettier',
  'react',
  'react-dom',
  'next',
  'tailwindcss',
  'autoprefixer',
  'postcss'
];

// Find all package.json files
const packageFiles = glob.sync('**/package.json', { 
  ignore: ['node_modules/**', 'dist/**', 'build/**'] 
});

let updatedCount = 0;

for (const file of packageFiles) {
  try {
    const pkg = JSON.parse(readFileSync(file, 'utf8'));
    let hasChanges = false;
    
    // Update dependencies to use catalog
    for (const dep of catalogDeps) {
      if (pkg.dependencies?.[dep] && pkg.dependencies[dep] !== 'catalog:') {
        pkg.dependencies[dep] = 'catalog:';
        hasChanges = true;
      }
      if (pkg.devDependencies?.[dep] && pkg.devDependencies[dep] !== 'catalog:') {
        pkg.devDependencies[dep] = 'catalog:';
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
      console.log(`✅ Updated ${file}`);
      updatedCount++;
    }
  } catch (error) {
    console.error(`❌ Error updating ${file}:`, error.message);
  }
}

console.log(`\n🎉 Updated ${updatedCount} packages to use catalog versions`);
console.log('Run "pnpm install" to apply changes');
