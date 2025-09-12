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

Create `.env.local`:
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

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
- 🔄 MSW integration for API mocking

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
4. **Scenario Persistence**: Settings are saved to localStorage

## Integration Example

```typescript
// Using Synthkit in your own Next.js app
import { SynthProvider } from '@synthkit/client';
import { setupMSW } from '@synthkit/client/msw';

// In your app layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SynthProvider>
          {children}
        </SynthProvider>
      </body>
    </html>
  );
}
```