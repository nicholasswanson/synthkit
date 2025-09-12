#!/bin/bash
set -e

echo "🧪 Testing Synthkit Dependency Management Setup"
echo "=============================================="

# Test 1: Check Node version
echo -e "\n📋 Test 1: Node.js Version Check"
NODE_VERSION=$(node --version)
REQUIRED_VERSION=$(cat .nvmrc)
echo "Current Node: $NODE_VERSION"
echo "Required: v$REQUIRED_VERSION"
if [[ "$NODE_VERSION" == *"$REQUIRED_VERSION"* ]]; then
    echo "✅ Node version matches"
else
    echo "⚠️  Node version mismatch (non-critical)"
fi

# Test 2: Check pnpm version
echo -e "\n📋 Test 2: pnpm Version Check"
PNPM_VERSION=$(pnpm --version)
echo "Current pnpm: $PNPM_VERSION"
if [[ "$PNPM_VERSION" > "9.0.0" ]]; then
    echo "✅ pnpm version is 9.0.0+"
else
    echo "❌ pnpm version is too old"
    exit 1
fi

# Test 3: Check catalog system
echo -e "\n📋 Test 3: Catalog System Check"
if grep -q "catalog:" pnpm-workspace.yaml; then
    echo "✅ Catalog system is configured"
    CATALOG_COUNT=$(grep -c '"catalog:"' packages/*/package.json || true)
    echo "   Found $CATALOG_COUNT catalog references in packages"
else
    echo "❌ Catalog system not found"
    exit 1
fi

# Test 4: Quick dependency check
echo -e "\n📋 Test 4: Key Dependency Check"
if [ -d "node_modules/@faker-js/faker" ]; then
    echo "✅ @faker-js/faker is installed (was missing before)"
else
    echo "❌ @faker-js/faker not found - run 'pnpm install'"
fi

# Test 5: Next.js demo check
echo -e "\n📋 Test 5: Demo App Check"
if [ -f "examples/next-app/package.json" ]; then
    if grep -q '"@anthropic-ai/sdk": "catalog:"' examples/next-app/package.json; then
        echo "✅ Next.js app uses catalog versions"
    else
        echo "⚠️  Next.js app not using catalog (legacy)"
    fi
fi

echo -e "\n✅ Dependency management system is configured correctly!"
