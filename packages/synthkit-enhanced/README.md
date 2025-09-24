# Synthkit Enhanced

> Zero-dependency, universal data integration for vibe coders building prototypes

## 🚀 Quick Start

```bash
npm install @synthkit/enhanced
```

```javascript
import { getData } from '@synthkit/enhanced';

// One line to get realistic data
const result = await getData();
console.log(`Got ${result.data.customers.length} customers!`);
```

## ✨ Features

- **Zero Dependencies** - Works everywhere, no Node version conflicts
- **Universal Compatibility** - Browser, Node.js, Deno, Bun, Edge Runtime
- **Bulletproof Fallbacks** - Always returns data, never breaks
- **Smart Environment Detection** - Auto-detects URLs and capabilities
- **Framework Integrations** - React, Vue, and vanilla JS support
- **Realistic Data** - Beautiful, engaging datasets for prototypes

## 📦 Installation

```bash
npm install @synthkit/enhanced
# or
yarn add @synthkit/enhanced
# or
pnpm add @synthkit/enhanced
```

## 🎯 Usage

### Basic Usage

```javascript
import { getData } from '@synthkit/enhanced';

async function myPrototype() {
  const result = await getData();
  
  console.log('Customers:', result.data.customers.length);
  console.log('Charges:', result.data.charges.length);
  console.log('Source:', result.data.metadata.source);
}
```

### With Status & Debug Info

```javascript
const result = await getData({ 
  showStatus: true, 
  debug: true 
});

console.log('Status:', result.status?.message);
console.log('Environment:', result.debug?.environment);
console.log('Performance:', result.debug?.performance);
```

### React Integration

```jsx
import { useSynthkit } from '@synthkit/enhanced/react';

function Dashboard() {
  const { data, loading, error, customers, charges } = useSynthkit();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Customers: {customers.length}</p>
      <p>Charges: {charges.length}</p>
      <p>Source: {data?.metadata.source}</p>
    </div>
  );
}
```

### Vue Integration

```javascript
import { useSynthkit } from '@synthkit/enhanced/vue';

export default {
  setup() {
    const { data, loading, error, customers, charges } = useSynthkit();
    
    return { data, loading, error, customers, charges };
  }
}
```

## 🔧 API Reference

### `getData(options?)`

Returns realistic data with automatic fallbacks.

**Options:**
- `showStatus?: boolean` - Show connection status
- `debug?: boolean` - Show debug information
- `cacheTimeout?: number` - Cache timeout in milliseconds (default: 5 minutes)
- `baseUrl?: string` - Custom API URL

**Returns:**
```typescript
{
  data: {
    customers: Customer[];
    charges: Charge[];
    subscriptions?: Subscription[];
    invoices?: Invoice[];
    plans?: Plan[];
    metadata: {
      source: 'live' | 'demo' | 'embedded';
      generatedAt: string;
      count: {
        customers: number;
        charges: number;
        // ... other counts
      };
    };
  };
  status?: {
    source: string;
    message: string;
    connected: boolean;
  };
  debug?: {
    environment: 'browser' | 'node' | 'deno' | 'bun';
    nodeVersion?: string;
    capabilities: string[];
    dataFlow: string[];
    performance: {
      fetchTime?: number;
      cacheHit: boolean;
    };
  };
}
```

### React Hooks

- `useSynthkit(options?)` - Full hook with all features
- `useSynthkitData(options?)` - Simple data-only hook
- `useSynthkitCustomers(options?)` - Customers only
- `useSynthkitCharges(options?)` - Charges only

### Vue Composables

- `useSynthkit(options?)` - Full composable with all features
- `useSynthkitData(options?)` - Simple data-only composable
- `useSynthkitCustomers(options?)` - Customers only
- `useSynthkitCharges(options?)` - Charges only

## 🌍 Environment Support

- **Node.js** 12+ (any version)
- **Browser** (any modern browser)
- **Deno** (native support)
- **Bun** (native support)
- **Edge Runtime** (Vercel, Netlify, Cloudflare)

## 🔄 Data Sources

1. **Live Demo** - Connects to running Synthkit demo
2. **API Endpoint** - Direct API calls to localhost:3001
3. **Embedded Data** - Always-available fallback data

## 🎨 Data Structure

The enhanced client normalizes all data sources to a consistent structure:

```typescript
interface SynthkitData {
  customers: Customer[];
  charges: Charge[];
  subscriptions?: Subscription[];
  invoices?: Invoice[];
  plans?: Plan[];
  metadata: {
    source: 'live' | 'demo' | 'embedded';
    generatedAt: string;
    count: {
      customers: number;
      charges: number;
      subscriptions?: number;
      invoices?: number;
      plans?: number;
    };
  };
}
```

## 🚀 Performance

- **Bundle Size**: < 10KB (zero dependencies)
- **Cache**: 5-minute intelligent caching
- **Fallbacks**: < 50ms to embedded data
- **API Calls**: < 100ms to live data

## 🔧 Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test

# Type check
pnpm typecheck
```

## 📄 License

MIT

## 🤝 Contributing

This package is part of the Synthkit ecosystem. See the main repository for contribution guidelines.

---

**Built for vibe coders who want to prototype fast with beautiful, realistic data.**

