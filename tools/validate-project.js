#!/usr/bin/env node
import { readFileSync } from 'fs';
import { glob } from 'glob';

const REQUIRED_ENGINES = {
  node: '>=20.11.0',
  pnpm: '>=9.0.0'
};

const REQUIRED_SCRIPTS = [
  'build', 'test', 'typecheck', 'clean'
];

const CATALOG_DEPS = [
  '@faker-js/faker',
  '@anthropic-ai/sdk',
  'typescript',
  'tsup',
  'vitest',
  '@types/node'
];

function validatePackage(packagePath) {
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
  const errors = [];
  const warnings = [];
  
  // Skip root package
  if (pkg.name === 'synthkit') return { errors, warnings };
  
  // Check engines (for non-example packages)
  if (!packagePath.includes('examples/') && !pkg.engines) {
    warnings.push('Missing engines field');
  }
  
  // Check required scripts
  for (const script of REQUIRED_SCRIPTS) {
    if (!pkg.scripts?.[script]) {
      warnings.push(`Missing script: ${script}`);
    }
  }
  
  // Check for catalog usage in common deps
  for (const dep of CATALOG_DEPS) {
    if (pkg.dependencies?.[dep] && pkg.dependencies[dep] !== 'catalog:') {
      warnings.push(`${dep} should use catalog: version`);
    }
    if (pkg.devDependencies?.[dep] && pkg.devDependencies[dep] !== 'catalog:') {
      warnings.push(`${dep} should use catalog: version`);
    }
  }
  
  // Check for missing faker in SDK
  if (pkg.name === '@synthkit/sdk' && !pkg.dependencies?.['@faker-js/faker']) {
    errors.push('SDK package missing @faker-js/faker dependency');
  }
  
  return { errors, warnings };
}

// Validate all packages
const packageFiles = glob.sync('**/package.json', {
  ignore: ['node_modules/**', 'dist/**', 'build/**']
});

let hasErrors = false;
let totalWarnings = 0;

console.log('�� Validating project structure...\n');

for (const file of packageFiles) {
  try {
    const { errors, warnings } = validatePackage(file);
    
    if (errors.length > 0) {
      console.error(`❌ ${file}:`);
      errors.forEach(error => console.error(`  - ${error}`));
      hasErrors = true;
    }
    
    if (warnings.length > 0) {
      console.warn(`⚠️  ${file}:`);
      warnings.forEach(warning => console.warn(`  - ${warning}`));
      totalWarnings += warnings.length;
    }
  } catch (error) {
    console.error(`❌ Error reading ${file}:`, error.message);
    hasErrors = true;
  }
}

console.log('\n📊 Validation Summary:');
console.log(`   Packages checked: ${packageFiles.length}`);
console.log(`   Warnings: ${totalWarnings}`);
console.log(`   Errors: ${hasErrors ? 'Found' : 'None'}`);

if (!hasErrors) {
  console.log('\n✅ Project validation passed!');
  if (totalWarnings > 0) {
    console.log('💡 Consider addressing warnings for better consistency');
  }
} else {
  console.log('\n❌ Project validation failed!');
  process.exit(1);
}
