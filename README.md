<div style="display: flex; align-items: center;">
<img src="https://github.com/nicholasswanson/synthkit/raw/main/docs/synthkit-logo-md.png" alt="Synthkit" width="48" height="48" style="margin-right: 12px;">
<h1 style="margin: 0;">Synthkit</h1>
</div>

**A comprehensive mocking and scenario generation toolkit for modern applications**

Synthkit provides deterministic, schema-driven mock data generation with realistic business patterns, role-based access controls, and seamless framework integrations.

[![GitHub](https://img.shields.io/github/stars/nicholasswanson/synthkit?style=social)](https://github.com/nicholasswanson/synthkit)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat&logo=pnpm&logoColor=white)](https://pnpm.io/)

## How to Get Started

```bash
# Clone and setup
git clone https://github.com/nicholasswanson/synthkit.git
cd synthkit
./scripts/setup-dev-auto.sh

# Start the demo app
cd examples/next-app
pnpm dev
# Opens at http://localhost:3001
```

Configure your business scenario, generate realistic data, and click "Share Dataset" to get integration code for your preferred tool (Cursor, React, v0, Claude, ChatGPT, or Vanilla JS).


## Features

- **Deterministic Generation** - Same ID = identical data across runs
- **Schema-Driven** - JSON Schema definitions ensure type safety
- **Business Categories** - 9 realistic business contexts (Checkout e-commerce, B2B SaaS, Food delivery, etc.)
- **Role-Based Access** - Admin/Support roles with data masking capabilities
- **Stage-Aware** - Early/Growth/Enterprise complexity levels
- **AI-Powered Analysis** - Describe your business and get intelligent scenario recommendations
- **Dataset Sharing** - Generate shareable URLs with AI tool integration code
- **AI Tool Integration** - Optimized for Cursor, Claude, ChatGPT, v0, and vanilla JS
- **Synthkit Enhanced** - Zero-configuration data integration with `getData()`
- **Universal Compatibility** - Works everywhere (browser, Node, Deno, Bun)
- **MSW Integration** - Seamless API mocking with Mock Service Worker
- **Framework Agnostic** - Works with React, Next.js, Vue, and more
- **Modular Packs** - Extensible library of domain-specific schemas
- **Developer Tools** - CLI, MCP server, and visual components

## Package Structure

| Package | Description | Status |
|---------|-------------|--------|
| `@synthkit/enhanced` | **Zero-config data integration** | ✅ **New!** |
| `@synthkit/sdk` | Core generation engine | ✅ Implemented |
| `@synthkit/client` | React components & providers | ✅ Implemented |
| `@synthkit/ai` | AI-powered scenario analysis & generation | ✅ Implemented |
| `@synthkit/cli` | Command-line interface | ✅ Implemented |
| `@synthkit/mcp-synth` | MCP server for external tools | ✅ Implemented |

## Business Categories

Inspired by [Stripe's synthetic-dataset](https://github.com/swanson-stripe/synthetic-dataset), Synthkit includes **9 comprehensive business models** with realistic data patterns:

### E-commerce & Retail
- **Checkout e-commerce** - Fashion E-commerce with products, customers, orders, and payments
- **Real estate** - Real estate management with properties, tenants, leases, and rent payments

### SaaS & Technology  
- **B2B SaaS** - B2B SaaS platform with subscriptions, billing, usage, and churn analytics
- **Online learning** - Online learning platform with courses, students, enrollments, and instructors

### Marketplaces & Platforms
- **Food delivery** - Food delivery marketplace with restaurants, drivers, orders, and payouts
- **Creator economy** - Creator economy platform with creators, subscriptions, content, and earnings

### Health & Wellness
- **Fitness streaming** - Fitness streaming platform with members, trainers, workouts, and sessions
- **Healthcare supply** - Healthcare supply chain with providers, products, orders, and compliance

### Social Impact
- **Impact platform** - Impact platform with donors, campaigns, donations, and program metrics

Each category includes:
- **Realistic Schemas**: JSON Schema definitions with faker.js integration
- **Business Logic**: Industry-specific relationships and constraints  
- **Stage Progression**: Early → Growth → Enterprise complexity levels
- **Role-Based Access**: Admin vs Support data visibility controls

## Role-Based Access Control

Define access levels with automatic data masking:

```json
{
  "roles": {
    "admin": {
      "name": "Administrator",
      "accessLevel": "admin",
      "dataVisibility": { "fullAccess": true }
    },
    "support": {
      "name": "Support Agent", 
      "accessLevel": "support",
      "dataVisibility": {
        "fullAccess": false,
        "maskedFields": ["amount", "revenue", "salary", "price"],
        "hiddenFields": []
      }
    }
  }
}
```

**Admin Role**: Sees all financial data
```json
{ "amount": 1250, "revenue": 45000, "price": 89.99 }
```

**Support Role**: Financial data masked as "hidden"
```json
{ "amount": "hidden", "revenue": "hidden", "price": "hidden" }
```

## Business Maturity Stages

Aligned with [synthetic-dataset](https://github.com/swanson-stripe/synthetic-dataset) complexity levels:

| Stage | Description | Data Volume | Complexity |
|-------|-------------|-------------|------------|
| **Early** | Startup scale | 5-500 records | Simple relationships |
| **Growth** | Scaling business | 1K-50K records | Moderate complexity |
| **Enterprise** | Large scale | 100K+ records | Complex relationships |

## AI Tool Integrations

Synthkit generates optimized integration code for popular AI development tools. Each integration includes complete "use in your project" instructions:

### Cursor Integration
```bash
synthkit dataset integrate "<url>" --tool cursor --rules
```
- **Complete setup instructions** - Install `@synthkit/enhanced` and copy code
- **`.cursorrules` file** - Context-aware AI assistance with business domain knowledge
- **Zero-configuration** - Works with `getData()` and `useSynthkit()` out of the box

### Claude Integration  
```bash
synthkit dataset integrate "<url>" --tool claude --output claude-prompt.txt
```
- **Step-by-step integration guide** - Detailed requirements and best practices
- **Domain-specific guidance** - Industry patterns (e.g., fashion e-commerce)
- **Complete code examples** - Ready-to-use `getData()` implementations

### ChatGPT Integration
```bash
synthkit dataset integrate "<url>" --tool chatgpt --output chatgpt-prompt.txt  
```
- **Quick setup prompts** - Concise, practical integration requests
- **Copy-paste ready** - Complete code with installation instructions
- **Simple examples** - `getData()` and `useSynthkit()` usage patterns

### v0 Integration
```bash
synthkit dataset integrate "<url>" --tool v0 --output component-prompt.txt
```
- **Component generation** - Modern dashboard templates with styling
- **Data integration** - Zero-configuration data access built-in
- **Complete implementation** - Ready-to-use React components

### Vanilla JavaScript
```bash
synthkit dataset integrate "<url>" --tool fetch --output data-manager.js
```
- **Universal compatibility** - Works in browser, Node, Deno, Bun
- **Zero dependencies** - Smart caching and environment detection
- **Complete setup** - Installation and usage instructions included

## Prerequisites

- **Node.js**: 20.11.0 or higher (see `.nvmrc`)
- **pnpm**: 9.0.0 or higher (will be auto-installed if missing)

### Using Specific Node Version

```bash
# If using nvm
nvm install    # Reads .nvmrc and installs correct version
nvm use        # Switches to project's Node version

# If using volta
volta install node@20.11.0
```

## Advanced Usage

For more control over data generation:

```typescript
import { SchemaGenerator } from '@synthkit/sdk';

const generator = new SchemaGenerator();

// Generate a customer
const customer = generator.generate({
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string', faker: 'person.fullName' },
    email: { type: 'string', format: 'email' }
  }
}, 12345); // deterministic ID

console.log(customer);
// { id: '...', name: 'Alice Johnson', email: 'alice.johnson@example.com' }
```

### Scenario Configuration

```typescript
// Define a complete business scenario
const scenario = {
  category: 'checkout-ecommerce',  // Business type (fashion e-commerce)
  role: 'admin',                  // Access level (full financial data)
  stage: 'growth',                // Business maturity (scaling)
  id: 12345                       // Deterministic generation ID
};
```

### React Integration

**Enhanced Approach (Recommended):**
```tsx
import { useSynthkit } from '@synthkit/enhanced/react';

function App() {
  const { data, loading, error, customers, charges } = useSynthkit();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>My App</h1>
      <p>Customers: {customers.length}</p>
      <p>Charges: {charges.length}</p>
    </div>
  );
}
```

**Advanced Approach (Full Control):**
```tsx
import { SynthProvider, PersonaScenarioSwitcher } from '@synthkit/client';

function App() {
  return (
    <SynthProvider>
      <PersonaScenarioSwitcher />
      <YourComponents />
    </SynthProvider>
  );
}
```

### Next.js Integration

```javascript
// next.config.js
const { withSynth } = require('@synthkit/client');

module.exports = withSynth({
  // your Next.js config
}, {
  packs: ['packs/checkout-ecommerce', 'packs/b2b-saas'],
  defaultCategory: 'checkout-ecommerce'
});
```

## CLI Usage

```bash
# Initialize new project
synthkit init my-project --template next-js

# AI-powered scenario building
synthkit ai analyze "A fitness app for tracking workouts"
synthkit ai match "An e-commerce marketplace"
synthkit ai generate "A SaaS project management tool" --save-to-file

# Generate mock data
synthkit generate --category checkout-ecommerce --role admin --stage growth --count 100

# Dataset sharing and integration
synthkit dataset url --category checkout-ecommerce --stage growth --copy
synthkit dataset fetch "https://nicholasswanson.github.io/synthkit/datasets/scenario-checkout-ecommerce-admin-growth-12345.json"
synthkit dataset integrate "<url>" --tool cursor --rules

# Scenario management
synthkit scenario list
synthkit scenario activate checkout-ecommerce-growth-admin

# Create snapshots
synthkit snapshot create "pre-demo-state"
synthkit snapshot restore "pre-demo-state"
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/synthkit/synthkit
cd synthkit
pnpm install
pnpm build
pnpm test
```

### Pack Development

```bash
# Validate pack structure
pnpm validate:pack packs/my-pack

# Test pack generation
pnpm cli generate --category my-pack --role admin --stage growth --count 10
```

## Documentation

- [**Getting Started Guide**](docs/getting-started.md)
- [**Dataset CLI Commands**](DATASET_CLI.md) - Complete CLI reference for dataset sharing
- [**Pack Development**](docs/pack-development.md)
- [**Role-Based Access Control**](docs/rbac.md)
- [**API Reference**](docs/api-reference.md)
- [**Framework Integrations**](docs/integrations.md)
- [**Governance & Standards**](GOVERNANCE.md)

## License

MIT © [Synthkit Team](https://synthkit.dev)

---