#!/usr/bin/env node

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple chalk-like coloring
const chalk = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`
};

// Helper functions
async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJSON(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function readdir(dirPath) {
  return fs.readdir(dirPath);
}

async function stat(filePath) {
  return fs.stat(filePath);
}

// Project structure validation
const requiredFiles = [
  'tools/cli/src/commands/',
  'packages/synthkit-sdk/src/',
  'packs/core/pack.json',
  'synth.config.json',
  'tools/cli/templates/',
  '.cursorrules'
];

const requiredDirectories = [
  'tools/cli/src/commands',
  'tools/cli/src/utils',
  'packages/synthkit-sdk/src',
  'packs/core',
  'packs/saas',
  'packs/ecomm'
];

// Patterns to discourage or forbid
const forbiddenPatterns = [
  {
    pattern: /console\.log(?!\s*\(chalk\.)/,
    message: 'Use chalk for colored output instead of console.log',
    severity: 'warning'
  },
  {
    pattern: /:\s*any(?!\[\]|\s*\|)/,
    message: 'Avoid using "any" type - use proper interfaces',
    severity: 'warning'
  },
  {
    pattern: /\.d\.ts$/,
    message: 'Avoid editing TypeScript declaration files directly',
    severity: 'error',
    filePattern: true
  },
  {
    pattern: /process\.exit\(\d+\)/,
    message: 'Use proper error handling instead of process.exit in non-CLI code',
    severity: 'warning'
  }
];

// CLI command patterns to enforce
const cliPatterns = [
  {
    pattern: /new Command\(/,
    requiredPatterns: [
      /\.description\(/,
      /\.action\(/
    ],
    message: 'CLI commands should have description and action',
    severity: 'error'
  }
];

async function validateProjectStructure() {
  console.log(chalk.blue('🔍 Validating Synthkit project structure...'));
  console.log();

  let errors = 0;
  let warnings = 0;

  // Check required files and directories
  for (const required of requiredFiles) {
    const fullPath = path.join(process.cwd(), required);
    if (!await pathExists(fullPath)) {
      console.log(chalk.red(`❌ Missing required: ${required}`));
      errors++;
    } else {
      console.log(chalk.green(`✅ Found: ${required}`));
    }
  }

  console.log();

  // Check directory structure
  for (const dir of requiredDirectories) {
    const fullPath = path.join(process.cwd(), dir);
    if (!await pathExists(fullPath)) {
      console.log(chalk.red(`❌ Missing directory: ${dir}`));
      errors++;
    } else {
      const statInfo = await stat(fullPath);
      if (!statInfo.isDirectory()) {
        console.log(chalk.red(`❌ Not a directory: ${dir}`));
        errors++;
      } else {
        console.log(chalk.green(`✅ Directory: ${dir}`));
      }
    }
  }

  return { errors, warnings };
}

async function validateCodePatterns() {
  console.log();
  console.log(chalk.blue('🔍 Validating code patterns...'));
  console.log();

  let errors = 0;
  let warnings = 0;

  // Get all TypeScript files
  const tsFiles = await getTypeScriptFiles();

  for (const file of tsFiles) {
    const content = await fs.readFile(file, 'utf8');
    const relativePath = path.relative(process.cwd(), file);

    // Check forbidden patterns
    for (const { pattern, message, severity, filePattern } of forbiddenPatterns) {
      if (filePattern && pattern.test(relativePath)) {
        console.log(chalk[severity === 'error' ? 'red' : 'yellow'](`${severity === 'error' ? '❌' : '⚠️'} ${relativePath}: ${message}`));
        if (severity === 'error') errors++;
        else warnings++;
        continue;
      }

      if (!filePattern) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            console.log(chalk[severity === 'error' ? 'red' : 'yellow'](`${severity === 'error' ? '❌' : '⚠️'} ${relativePath}:${index + 1} - ${message}`));
            console.log(chalk.gray(`    ${line.trim()}`));
            if (severity === 'error') errors++;
            else warnings++;
          }
        });
      }
    }

    // Check CLI command patterns
    if (file.includes('tools/cli/src/commands/')) {
      for (const { pattern, requiredPatterns, message, severity } of cliPatterns) {
        if (pattern.test(content)) {
          for (const requiredPattern of requiredPatterns) {
            if (!requiredPattern.test(content)) {
              console.log(chalk[severity === 'error' ? 'red' : 'yellow'](`${severity === 'error' ? '❌' : '⚠️'} ${relativePath}: ${message}`));
              if (severity === 'error') errors++;
              else warnings++;
            }
          }
        }
      }
    }
  }

  return { errors, warnings };
}

async function validatePackStructure() {
  console.log();
  console.log(chalk.blue('🔍 Validating pack structure...'));
  console.log();

  let errors = 0;
  let warnings = 0;

  const packsDir = path.join(process.cwd(), 'packs');
  if (!await pathExists(packsDir)) {
    console.log(chalk.red('❌ Packs directory not found'));
    return { errors: 1, warnings: 0 };
  }

  const packs = await readdir(packsDir);
  
  for (const packName of packs) {
    const packDir = path.join(packsDir, packName);
    const statInfo = await stat(packDir);
    
    if (!statInfo.isDirectory()) continue;

    console.log(chalk.cyan(`📦 Validating pack: ${packName}`));

    // Check required pack files
    const packJsonPath = path.join(packDir, 'pack.json');
    if (!await pathExists(packJsonPath)) {
      console.log(chalk.red(`  ❌ Missing pack.json`));
      errors++;
      continue;
    }

    try {
      const packJson = await readJSON(packJsonPath);
      
      // Validate required fields
      const requiredFields = ['id', 'name', 'description', 'version', 'schemas'];
      for (const field of requiredFields) {
        if (!packJson[field]) {
          console.log(chalk.red(`  ❌ Missing required field: ${field}`));
          errors++;
        }
      }

      // Validate pack ID matches directory name
      if (packJson.id !== packName) {
        console.log(chalk.red(`  ❌ Pack ID "${packJson.id}" doesn't match directory name "${packName}"`));
        errors++;
      }

      // Check for scenarios
      if (!packJson.scenarios || Object.keys(packJson.scenarios).length === 0) {
        console.log(chalk.yellow(`  ⚠️ No scenarios defined`));
        warnings++;
      }

      console.log(chalk.green(`  ✅ Pack structure valid`));

    } catch (error) {
      console.log(chalk.red(`  ❌ Invalid pack.json: ${error.message}`));
      errors++;
    }
  }

  return { errors, warnings };
}

async function getTypeScriptFiles() {
  const files = [];
  
  async function walkDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !['node_modules', 'dist', 'build', '.git', '.next'].includes(entry.name)) {
        await walkDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }

  await walkDir(process.cwd());
  return files;
}

async function validateBuildSystem() {
  console.log();
  console.log(chalk.blue('🔍 Validating build system...'));
  console.log();

  let errors = 0;
  let warnings = 0;

  // Check if CLI builds successfully
  try {
    console.log(chalk.gray('Building CLI...'));
    
    execSync('cd tools/cli && pnpm build', { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    console.log(chalk.green('✅ CLI builds successfully'));
    
    // Check if CLI executable exists
    const cliPath = path.join(process.cwd(), 'tools/cli/dist/cli.js');
    if (await pathExists(cliPath)) {
      console.log(chalk.green('✅ CLI executable exists'));
    } else {
      console.log(chalk.red('❌ CLI executable not found after build'));
      errors++;
    }
    
  } catch (error) {
    console.log(chalk.red('❌ CLI build failed'));
    console.log(chalk.gray(error.message));
    errors++;
  }

  return { errors, warnings };
}

async function main() {
  console.log(chalk.blue('🚀 Synthkit Project Validation'));
  console.log(chalk.gray('Checking project structure, code patterns, and build system'));
  console.log();

  const results = await Promise.all([
    validateProjectStructure(),
    validateCodePatterns(),
    validatePackStructure(),
    validateBuildSystem()
  ]);

  const totalErrors = results.reduce((sum, { errors }) => sum + errors, 0);
  const totalWarnings = results.reduce((sum, { warnings }) => sum + warnings, 0);

  console.log();
  console.log(chalk.blue('📊 Validation Summary'));
  console.log('─'.repeat(50));

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(chalk.green('🎉 All validations passed!'));
  } else {
    if (totalErrors > 0) {
      console.log(chalk.red(`❌ ${totalErrors} error(s) found`));
    }
    if (totalWarnings > 0) {
      console.log(chalk.yellow(`⚠️ ${totalWarnings} warning(s) found`));
    }
  }

  console.log();
  console.log(chalk.cyan('💡 Next steps:'));
  if (totalErrors > 0) {
    console.log(chalk.gray('  - Fix errors before committing'));
    console.log(chalk.gray('  - Run validation again: node tools/validate-project.js'));
  }
  if (totalWarnings > 0) {
    console.log(chalk.gray('  - Consider addressing warnings for better code quality'));
  }
  console.log(chalk.gray('  - Review .cursorrules for development guidelines'));

  process.exit(totalErrors > 0 ? 1 : 0);
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  validateProjectStructure,
  validateCodePatterns,
  validatePackStructure,
  validateBuildSystem
};
