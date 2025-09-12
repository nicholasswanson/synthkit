#!/bin/bash
set -e

echo "🚀 Setting up Synthkit development environment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to ensure Node 20+ is available
ensure_node_20() {
    # Check current Node version
    NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
    
    if [[ "$NODE_VERSION" != "not found" ]]; then
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -ge "20" ]; then
            echo "✅ Node.js version: $NODE_VERSION"
            return 0
        else
            echo "⚠️  Current Node.js version: $NODE_VERSION (too old)"
        fi
    fi
    
    # Try to use nvm if available
    if [ -f "$HOME/.nvm/nvm.sh" ]; then
        echo "📌 Loading nvm..."
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        
        # Check if we have Node 20 installed
        if nvm list | grep -q "v20"; then
            echo "🔄 Switching to Node.js 20..."
            nvm use 20
        else
            echo "📦 Installing Node.js 20.11.0 via nvm..."
            nvm install 20.11.0
            nvm use 20.11.0
        fi
        
        NODE_VERSION=$(node --version)
        echo "✅ Node.js version: $NODE_VERSION"
        return 0
    fi
    
    # Try fnm if available
    if command_exists fnm; then
        echo "📌 Using fnm..."
        eval "$(fnm env)"
        
        if ! fnm list | grep -q "v20"; then
            echo "📦 Installing Node.js 20.11.0 via fnm..."
            fnm install 20.11.0
        fi
        
        fnm use 20.11.0
        NODE_VERSION=$(node --version)
        echo "✅ Node.js version: $NODE_VERSION"
        return 0
    fi
    
    # Try volta if available
    if command_exists volta; then
        echo "📌 Using volta..."
        echo "📦 Installing Node.js 20.11.0 via volta..."
        volta install node@20.11.0
        NODE_VERSION=$(node --version)
        echo "✅ Node.js version: $NODE_VERSION"
        return 0
    fi
    
    # Try to install nvm automatically
    echo "🔧 No Node version manager found. Installing nvm..."
    echo ""
    
    # Download and install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    
    # Load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # Install Node 20.11.0
    echo "📦 Installing Node.js 20.11.0..."
    nvm install 20.11.0
    nvm use 20.11.0
    
    NODE_VERSION=$(node --version)
    echo "✅ Node.js version: $NODE_VERSION"
    
    echo ""
    echo "📝 Note: nvm has been installed. You may need to restart your terminal or run:"
    echo "   source ~/.bashrc  (or ~/.zshrc for zsh)"
    echo ""
}

# Ensure Node 20+ is available
ensure_node_20

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
pnpm build || {
    echo "⚠️  Build had some warnings/errors but continuing..."
    echo "   You can run 'pnpm build' later to see details"
}

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

# Check if we're in the correct Node version for future runs
if [ -f ".nvmrc" ] && [ -f "$HOME/.nvm/nvm.sh" ]; then
    echo "💡 Tip: Run 'nvm use' in this directory to use the correct Node version"
fi
