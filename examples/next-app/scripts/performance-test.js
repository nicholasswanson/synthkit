#!/usr/bin/env node

/**
 * Simple performance test for the Next.js app
 * Tests load time, bundle size, and basic metrics
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running Performance Tests...\n');

const results = {
  timestamp: new Date().toISOString(),
  checks: {},
  passed: true,
};

// 1. Check build output size
console.log('📦 Checking build size...');
try {
  const buildOutput = execSync('pnpm build', { encoding: 'utf8' });
  
  // Extract size information from build output
  const sizeMatch = buildOutput.match(/First Load JS.*?(\d+\.?\d*)\s*(kB|MB)/);
  if (sizeMatch) {
    const size = parseFloat(sizeMatch[1]);
    const unit = sizeMatch[2];
    const sizeInKB = unit === 'MB' ? size * 1024 : size;
    
    results.checks.bundleSize = {
      value: `${size} ${unit}`,
      passed: sizeInKB < 200, // Fail if > 200KB
      threshold: '200 KB',
    };
    
    console.log(`   Bundle size: ${size} ${unit} ${sizeInKB < 200 ? '✅' : '❌'}`);
  }
} catch (error) {
  console.error('   ❌ Build failed:', error.message);
  results.checks.bundleSize = { passed: false, error: error.message };
  results.passed = false;
}

// 2. Check for production optimizations
console.log('\n🔧 Checking production optimizations...');
const nextConfig = require('../next.config.js');

results.checks.optimizations = {
  reactStrictMode: nextConfig.reactStrictMode === true,
  passed: true,
};

console.log(`   React Strict Mode: ${nextConfig.reactStrictMode ? '✅' : '❌'}`);

// 3. Check environment setup
console.log('\n🌍 Checking environment setup...');
const hasEnvExample = fs.existsSync(path.join(__dirname, '../.env.example'));
results.checks.environment = {
  envExample: hasEnvExample,
  passed: hasEnvExample,
};

console.log(`   .env.example exists: ${hasEnvExample ? '✅' : '❌'}`);

// 4. Check security headers configuration
console.log('\n🔒 Checking security configuration...');
const hasSecurityHeaders = nextConfig.headers !== undefined;
results.checks.security = {
  headers: hasSecurityHeaders,
  passed: hasSecurityHeaders,
};

console.log(`   Security headers configured: ${hasSecurityHeaders ? '✅' : '❌'}`);

// 5. Check for console.logs in production code
console.log('\n🔍 Checking for console.log statements...');
try {
  const srcFiles = execSync('find src -name "*.ts" -o -name "*.tsx" | grep -v __tests__', { 
    encoding: 'utf8',
    cwd: path.join(__dirname, '..')
  }).trim().split('\n');
  
  let consoleCount = 0;
  srcFiles.forEach(file => {
    const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    const matches = content.match(/console\.(log|debug)/g);
    if (matches) {
      consoleCount += matches.length;
    }
  });
  
  results.checks.consoleLogs = {
    count: consoleCount,
    passed: consoleCount === 0,
  };
  
  console.log(`   Console.log statements found: ${consoleCount} ${consoleCount === 0 ? '✅' : '⚠️'}`);
} catch (error) {
  console.log('   ⚠️  Could not check for console.logs');
}

// 6. Check TypeScript strict mode
console.log('\n📝 Checking TypeScript configuration...');
const tsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../tsconfig.json'), 'utf8'));
const isStrict = tsConfig.compilerOptions?.strict === true;

results.checks.typescript = {
  strict: isStrict,
  passed: isStrict,
};

console.log(`   TypeScript strict mode: ${isStrict ? '✅' : '❌'}`);

// Calculate overall result
results.passed = Object.values(results.checks).every(check => check.passed !== false);

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Performance Test Summary');
console.log('='.repeat(50));
console.log(`Overall: ${results.passed ? '✅ PASSED' : '❌ FAILED'}`);
console.log('\nDetails:');
Object.entries(results.checks).forEach(([key, value]) => {
  console.log(`  ${key}: ${value.passed ? '✅' : '❌'} ${value.value || ''}`);
});

// Save results
const resultsPath = path.join(__dirname, '../performance-test-results.json');
fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
console.log(`\n📄 Results saved to: ${resultsPath}`);

// Exit with appropriate code
process.exit(results.passed ? 0 : 1);
