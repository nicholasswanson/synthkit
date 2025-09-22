# Synthkit Next.js Demo

## Quick Start

```bash
# From repository root
./scripts/setup-dev.sh
cd examples/next-app
pnpm dev
```

## Prerequisites

- Node.js 20.11.0+ (see `.nvmrc` in root)
- pnpm 9.0.0+
- Anthropic API key (for AI features)

## Environment Setup

Copy the example environment file:
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Anthropic API key:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
```

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Yes (for AI features) | Your Anthropic API key for AI-powered features | - |
| `NEXT_PUBLIC_API_URL` | No | Override the API URL | `http://localhost:3001` |
| `NEXT_PUBLIC_DEBUG` | No | Enable debug logging | `false` |
| `NEXT_PUBLIC_MSW_ENABLED` | No | Enable/disable MSW | `true` |

## Development

```bash
# Install dependencies (from root)
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm typecheck
```

## Features

- 🎮 Interactive scenario configuration
- 🤖 AI-powered business analysis
- 📊 Real-time mock data generation
- 🚀 **Synthkit Enhanced** - Zero-config data integration
- ⚡ One-line integration: `const result = await getData();`
- 🌐 Universal compatibility - works everywhere
- 🔄 Smart caching and fallbacks

## Troubleshooting

### "next: command not found"
```bash
# Dependencies not installed
cd ../.. # Go to root
pnpm install
cd examples/next-app
pnpm dev
```

### Port already in use
The demo runs on port 3001 by default. To change:
```bash
pnpm dev -- --port 3002
```

### API Key Issues
Ensure your `.env.local` file contains a valid Anthropic API key:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
```

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   └── ai/          # AI endpoints
│   ├── components/       # React components
│   ├── page.tsx         # Main demo page
│   └── layout.tsx       # App layout
├── components/          # Legacy components
└── lib/                # Utilities and MSW setup
```

## Available Scripts

- `pnpm dev` - Start development server (port 3001)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript checks

## Using the Demo

1. **Manual Configuration**: Use the dropdowns to select business category, role, and stage
2. **AI Analysis**: Enter a business description and click "Analyze Business"
3. **Data Generation**: Click refresh buttons to see mock data based on your scenario
4. **Share Dataset**: Click "Share Dataset" to get integration code for your prototype
5. **Scenario Persistence**: Settings are saved to localStorage

## 🚀 For Vibe Coders

### Quick Integration
1. **Generate Dataset** - Select your business scenario
2. **Click "Share Dataset"** - Opens integration panel
3. **Choose Your Tool** - React, Cursor, v0, Claude, etc.
4. **Copy & Paste** - Get working code instantly
5. **Install Enhanced** - `npm install @synthkit/enhanced`

### What's New
- **Zero Configuration** - Works out of the box
- **One Line Integration** - `const result = await getData();`
- **Never Breaks** - Always returns data
- **Works Everywhere** - Browser, Node, Deno, Bun
- **Smart Caching** - Fast, efficient data loading

## Integration Example

```typescript
// Using Synthkit Enhanced in your own Next.js app
import { getData } from '@synthkit/enhanced';

// Simple one-line data fetching
export async function MyComponent() {
  const result = await getData();
  console.log(`Got ${result.data.customers.length} customers!`);
  return <div>Customers: {result.data.customers.length}</div>;
}

// Or use the React hook
import { useSynthkit } from '@synthkit/enhanced/react';

export function MyComponent() {
  const { data, loading, error, customers, charges } = useSynthkit();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Customers: {customers?.length || 0}</p>
      <p>Charges: {charges?.length || 0}</p>
    </div>
  );
}
```