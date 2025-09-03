# Synthkit Next.js Example

This example demonstrates how to integrate Synthkit with a Next.js application.

## Features

- 🎭 **PersonaScenarioSwitcher** - Full UI for managing scenarios, personas, stages, and seeds
- 🔄 **Live Data Updates** - Data refreshes automatically when configuration changes
- 📡 **MSW Integration** - Mock Service Worker intercepts API calls
- 💾 **State Persistence** - Configuration persists across page reloads
- 🎨 **Responsive Design** - Works on desktop and mobile

## Getting Started

```bash
# From the root directory
pnpm install
pnpm build

# Run the example
cd examples/next-app
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **SynthProvider** wraps the app in `layout.tsx`, loading the configuration from `synth.config.json`
2. **MSW** is automatically initialized when the provider loads
3. **PersonaScenarioSwitcher** provides UI controls for:
   - Switching between scenarios (development, demo)
   - Selecting personas (Alice/Admin, Bob/User)
   - Changing stages (development, testing, production)
   - Setting custom seeds or randomizing
   - Creating and restoring snapshots
4. **DataFetcher** components make API calls to `/api/users` and `/api/invoices`
5. The mock data is generated based on the schemas defined in `packs/example-pack/pack.json`

## Project Structure

```
examples/next-app/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── layout.tsx    # Root layout with SynthProvider
│   │   ├── page.tsx      # Home page with demo UI
│   │   └── globals.css   # Global styles
│   └── components/       # React components
│       └── DataFetcher.tsx
├── packs/                # Synthkit packs
│   └── example-pack/
│       └── pack.json     # Schema definitions
├── public/               # Static files
│   └── mockServiceWorker.js
└── synth.config.json     # Synthkit configuration
```

## Key Files

- `src/app/layout.tsx` - Sets up the SynthProvider
- `src/app/page.tsx` - Main demo page with UI components
- `src/components/DataFetcher.tsx` - Reusable data fetching component
- `packs/example-pack/pack.json` - Schema and route definitions
- `synth.config.json` - Synthkit configuration
