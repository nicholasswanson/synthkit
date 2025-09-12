# 🛠️ Synthkit Development Guide

## 📋 Prerequisites

- **Node.js** 20.11.0 or higher
- **pnpm** 9.0.0 or higher

## 🚀 Getting Started

### Automated Setup

```bash
# Clone and run setup script
git clone https://github.com/nicholasswanson/synthkit.git
cd synthkit
./scripts/setup-dev.sh
```

This script will:
- ✅ Check Node.js version
- ✅ Install/update pnpm if needed
- ✅ Install all dependencies
- ✅ Build all packages
- ✅ Run validation checks

### Manual Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start development
pnpm dev
```

## 📦 Dependency Management

### Catalog System

We use pnpm's catalog feature for consistent dependency versions:

1. **Common dependencies** are defined in `pnpm-workspace.yaml`
2. **Packages reference** them using `"catalog:"` versions
3. **Single source of truth** for dependency versions

### Adding Dependencies

```bash
# Add to a specific package
cd packages/synthkit-sdk
pnpm add lodash

# Add to catalog (for shared deps)
# 1. Add to pnpm-workspace.yaml catalog
# 2. Update package.json to use "catalog:"
# 3. Run pnpm install
```

### Updating Dependencies

```bash
# Update catalog version
# 1. Edit pnpm-workspace.yaml
# 2. Run:
pnpm install

# Convert packages to catalog
node tools/update-deps.js
```

## 🏗️ Project Structure

```
synthkit/
├── .nvmrc                    # Node.js version lock
├── pnpm-workspace.yaml       # Workspace config & catalog
├── packages/                 # Core packages
│   ├── synthkit-sdk/        # Core SDK
│   ├── synthkit-client/     # React components
│   ├── synthkit-ai/         # AI features
│   └── mcp-synth/           # MCP server
├── examples/                 # Example apps
│   └── next-app/            # Next.js demo
├── tools/                    # Build tools
│   ├── cli/                 # CLI tool
│   └── validate-project.js  # Validation
└── scripts/                  # Dev scripts
    └── setup-dev.sh         # Setup script
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:ci

# Test specific package
cd packages/synthkit-sdk
pnpm test

# Validate project setup
pnpm validate
```

## 🔍 Validation

The project includes automated validation:

```bash
# Run validation
node tools/validate-project.js

# Checks for:
# - Engine requirements
# - Required scripts
# - Catalog usage
# - Package structure
```

## 🚨 Common Issues

### "command not found" errors
```bash
# Dependencies not installed
pnpm install
```

### Node version warnings
```bash
# Use correct Node version
nvm use    # or: nvm install
```

### Build failures
```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### Hanging installs
```bash
# Clear pnpm cache
pnpm store prune
rm -rf node_modules
pnpm install
```

## 📝 Contributing

1. Create a feature branch
2. Make changes
3. Run validation: `pnpm validate`
4. Run tests: `pnpm test`
5. Submit PR

## 🔗 Useful Commands

```bash
# Development
pnpm dev          # Start demo
pnpm build        # Build all packages
pnpm test         # Run tests
pnpm lint         # Lint code
pnpm typecheck    # Type checking

# Maintenance
pnpm clean        # Clean build artifacts
pnpm validate     # Validate project
pnpm update-deps  # Update to catalog versions

# CLI
pnpm cli          # Run Synthkit CLI
```