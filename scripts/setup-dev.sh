#!/bin/bash
set -e

echo "🚀 Setting up Synthkit development environment..."

# Check Node version
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
if [[ "$NODE_VERSION" == "not found" ]]; then
    echo "❌ Node.js not found. Please install Node.js 20.11.0+"
    echo "   You can use nvm: nvm install 20.11.0 && nvm use 20.11.0"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Check pnpm version
PNPM_VERSION=$(pnpm --version 2>/dev/null || echo "not found")
if [[ "$PNPM_VERSION" == "not found" ]]; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@latest
    PNPM_VERSION=$(pnpm --version)
fi

echo "✅ pnpm version: $PNPM_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build packages
echo "🏗️ Building packages..."
pnpm build

# Run validation
echo "✅ Running validation..."
pnpm validate || echo "⚠️ Validation warnings (continuing...)"

echo ""
echo "🎉 Development environment ready!"
echo ""
echo "Available commands:"
echo "  pnpm dev          - Start Next.js demo"
echo "  pnpm build        - Build all packages"
echo "  pnpm test         - Run tests"
echo "  pnpm typecheck    - Type checking"
echo "  pnpm lint         - Lint code"
echo "  pnpm cli          - Run Synthkit CLI"
echo ""
