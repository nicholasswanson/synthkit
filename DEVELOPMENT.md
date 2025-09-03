# Synthkit Development Guide

This guide outlines the development practices, patterns, and rules for contributing to Synthkit.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Validate project structure
pnpm validate

# Build all packages
pnpm build

# Run pre-commit checks
pnpm pre-commit

# Test CLI functionality
tools/cli/dist/cli.js --help
```

## 📋 Development Rules

### Code Style & Standards
- **TypeScript**: Use strict mode with explicit types
- **Naming**: camelCase for variables, PascalCase for types/interfaces
- **Error Handling**: Always use `error instanceof Error ? error.message : 'Unknown error'`
- **No `any`**: Use proper interfaces from `@synthkit/sdk`

### Architecture Patterns
- **CLI Commands**: Extend Commander.js Command class
- **Utilities**: Use existing ConfigLoader and PackLoader
- **Pack Structure**: Follow established patterns in `/packs`
- **Separation**: Keep CLI tools and SDK packages separate

### File Organization
```
tools/cli/src/commands/     # CLI command implementations
tools/cli/src/utils/        # CLI utilities
tools/cli/templates/        # Project templates
packs/<pack-name>/          # Pack definitions
packages/                   # SDK packages
```

## 🎯 CLI Command Patterns

### Standard Structure
```typescript
export const myCommand = new Command('my-command')
  .description('Clear description of what this does')
  .argument('[optional]', 'Optional argument description')
  .option('-p, --pack <pack>', 'Pack name')
  .option('-f, --force', 'Force operation')
  .action(async (args, options) => {
    try {
      console.log(chalk.blue('🚀 Starting operation...'));
      
      // Load configuration
      const config = await loadConfig();
      const packLoader = getPackLoader();
      
      // Validate inputs
      if (!options.pack) {
        console.error(chalk.red('Error: --pack option is required'));
        process.exit(1);
      }
      
      // Perform operation
      // ...
      
      console.log(chalk.green('✅ Operation completed successfully'));
      console.log();
      console.log(chalk.cyan('💡 Next steps:'));
      console.log(chalk.gray('  - Run: synthkit <related-command>'));
      
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });
```

### Output Formatting
- **Colors**: Use chalk consistently
  - `chalk.blue()` for info/progress
  - `chalk.green()` for success
  - `chalk.red()` for errors
  - `chalk.yellow()` for warnings
  - `chalk.gray()` for supplementary info
  - `chalk.cyan()` for section headers
- **Emojis**: Use consistently (🚀 init, 📋 lists, ✅ success, ⚠️ warnings, 🎯 activation)
- **Structure**: Clear sections with proper indentation (2 spaces)
- **Next Steps**: Always provide actionable guidance

## 📦 Pack Development

### Required Structure
```json
{
  "id": "pack-name",
  "name": "Display Name",
  "description": "Clear description",
  "version": "1.0.0",
  "schemas": {
    "entity": { /* JSON Schema v7 */ }
  },
  "scenarios": {
    "scenario-id": {
      "id": "scenario-id",
      "name": "Scenario Name",
      "description": "Description",
      "config": {
        "seed": 12345,
        "locale": "en-US",
        "volume": { "entity": 100 }
      }
    }
  }
}
```

### Validation
- Pack IDs: lowercase, hyphenated
- Schemas: Valid JSON Schema v7
- Scenarios: Follow Scenario interface
- Required fields: id, name, description, version, schemas

## 🔧 Configuration Management

### Loading Configuration
```typescript
import { loadConfig, ConfigLoader } from '../utils/config-loader';

// Load config
const config = await loadConfig();

// Get config loader instance
const configLoader = ConfigLoader.getInstance();

// Save changes
await configLoader.saveConfig(updatedConfig);

// Get project root
const projectRoot = configLoader.getProjectRoot();
```

### Type Safety
```typescript
// Cast when accessing extended properties
const scenarios = (config as any).scenarios;
const packs = (config as any).packs;
```

## 🧪 Testing & Validation

### Before Committing
```bash
# Validate project structure
pnpm validate

# Build CLI
cd tools/cli && pnpm build

# Test commands
tools/cli/dist/cli.js pack validate
tools/cli/dist/cli.js scenario list
tools/cli/dist/cli.js --help

# Run type checking
pnpm typecheck
```

### Manual Testing
```bash
# Test from synthkit root
cd /Users/nicholasswanson/synthkit

# Test CLI commands
tools/cli/dist/cli.js <command> --help
tools/cli/dist/cli.js <command> <args>

# Validate no regressions
tools/cli/dist/cli.js pack validate
```

## 🚫 Forbidden Actions

- ❌ Don't modify package.json dependencies without approval
- ❌ Don't change core SDK type definitions
- ❌ Don't create new top-level directories
- ❌ Don't modify existing pack schemas without migration
- ❌ Don't use `console.log` - use chalk for output
- ❌ Don't use relative imports across package boundaries
- ❌ Don't hardcode file paths - use ConfigLoader.getProjectRoot()

## 📝 Commit Guidelines

### Message Format
```
feat(cli): add new scenario management command
fix(pack): resolve validation issue with schemas
docs(readme): update CLI usage examples
refactor(utils): improve error handling consistency
```

### Pre-commit Checklist
- [ ] `pnpm validate` passes
- [ ] `pnpm build` succeeds
- [ ] `pnpm typecheck` passes
- [ ] CLI commands tested manually
- [ ] No breaking changes to public APIs
- [ ] Proper error handling implemented
- [ ] Help text and examples included

## 🎯 Common Patterns

### Error Handling
```typescript
try {
  // Operation
} catch (error) {
  console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
}
```

### Interactive Prompts
```typescript
const answers = await inquirer.prompt([
  {
    type: 'input',
    name: 'name',
    message: 'Enter name:',
    validate: (input) => input.length > 0 || 'Name is required'
  },
  {
    type: 'confirm',
    name: 'confirm',
    message: 'Continue?',
    default: false
  }
]);
```

### File Operations
```typescript
import fs from 'fs-extra';
import path from 'path';

// Check existence
if (await fs.pathExists(filePath)) {
  // File exists
}

// Read JSON
const data = await fs.readJSON(filePath);

// Write JSON
await fs.writeJSON(filePath, data, { spaces: 2 });

// Ensure directory
await fs.ensureDir(dirPath);
```

## 🔍 Validation Tools

### Project Validation
```bash
# Run full validation
node tools/validate-project.js

# Or via npm script
pnpm validate
```

### Pack Validation
```bash
# Validate all packs
tools/cli/dist/cli.js pack validate

# Validate specific pack
tools/cli/dist/cli.js pack validate --pack core
```

## 📚 Resources

- [Commander.js Documentation](https://github.com/tj/commander.js)
- [Chalk Documentation](https://github.com/chalk/chalk)
- [Inquirer Documentation](https://github.com/SBoudrias/Inquirer.js)
- [JSON Schema Specification](https://json-schema.org/)

## 🆘 Troubleshooting

### Common Issues

**CLI not building:**
```bash
cd tools/cli
rm -rf dist node_modules
pnpm install
pnpm build
```

**TypeScript errors:**
```bash
pnpm typecheck
# Fix errors, then rebuild
```

**Pack validation failing:**
```bash
tools/cli/dist/cli.js pack validate --pack <pack-name>
# Check pack.json structure
```

**Template path issues:**
```bash
# Ensure templates exist
ls tools/cli/templates/
# Check path resolution in init command
```

---

For questions or issues, refer to the `.cursorrules` file or create an issue in the repository.
