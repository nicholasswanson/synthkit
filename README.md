# 🎭 Synthkit

> **A comprehensive mocking and scenario generation toolkit for modern applications**

Synthkit provides deterministic, schema-driven mock data generation with realistic business patterns, role-based access controls, and seamless framework integrations. Inspired by [Stripe's synthetic-dataset](https://github.com/swanson-stripe/synthetic-dataset).

[![GitHub](https://img.shields.io/github/stars/nicholasswanson/synthkit?style=social)](https://github.com/nicholasswanson/synthkit)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat&logo=pnpm&logoColor=white)](https://pnpm.io/)

## ✨ **Features**

- 🎯 **Deterministic Generation** - Same ID = identical data across runs
- 📋 **Schema-Driven** - JSON Schema definitions ensure type safety
- 🏢 **Business Categories** - 9 realistic business contexts (Modaic, Stratus, Forksy, etc.)
- 👥 **Role-Based Access** - Admin/Support roles with data masking capabilities
- 📈 **Stage-Aware** - Early/Growth/Enterprise complexity levels
- 🤖 **AI-Powered Analysis** - Describe your business and get intelligent scenario recommendations
- 🔄 **MSW Integration** - Seamless API mocking with Mock Service Worker
- ⚡ **Framework Agnostic** - Works with React, Next.js, Vue, and more
- 📦 **Modular Packs** - Extensible library of domain-specific schemas
- 🛠️ **Developer Tools** - CLI, MCP server, and visual components

## 🚀 **Quick Start**

### **Installation**

```bash
# Clone and setup the monorepo
git clone https://github.com/nicholasswanson/synthkit.git
cd synthkit
pnpm install
pnpm build

# Run the Next.js example
cd examples/next-app
pnpm dev
```

**🎮 Interactive Demo**: The Next.js example now includes integrated AI analysis - describe your business idea directly in the demo to see intelligent scenario recommendations alongside the traditional manual configuration.

### **Basic Usage**

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

### **Scenario Configuration**

```typescript
// Define a complete business scenario
const scenario = {
  category: 'modaic',          // Business type (fashion e-commerce)
  role: 'admin',              // Access level (full financial data)
  stage: 'growth',            // Business maturity (scaling)
  id: 12345                   // Deterministic generation ID
};
```

### **React Integration**

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

### **Next.js Integration**

```javascript
// next.config.js
const { withSynth } = require('@synthkit/client');

module.exports = withSynth({
  // your Next.js config
}, {
  packs: ['packs/modaic', 'packs/stratus'],
  defaultCategory: 'modaic'
});
```

### **AI-Powered Business Analysis**

```typescript
import { DescriptionAnalyzer } from '@synthkit/ai';

const analyzer = new DescriptionAnalyzer();

// Analyze a business description
const analysis = await analyzer.analyzeDescription({
  description: "A fitness app for tracking workouts and meal planning with social features"
});

console.log(analysis.businessContext.type); // "fitness"
console.log(analysis.entities); // [{ name: "User", type: "person" }, ...]
console.log(analysis.keyFeatures); // ["workout tracking", "meal planning", ...]
```

**CLI Integration:**
```bash
# Analyze business description
synthkit ai analyze "A SaaS project management tool for remote teams"

# Find matching scenarios
synthkit ai match "An e-commerce marketplace for handmade crafts"

# Generate custom scenario
synthkit ai generate "A nonprofit platform for donations" --save-to-file
```

## 📦 **Package Structure**

| Package | Description | Status |
|---------|-------------|--------|
| `@synthkit/sdk` | Core generation engine | ✅ Implemented |
| `@synthkit/client` | React components & providers | ✅ Implemented |
| `@synthkit/ai` | AI-powered scenario analysis & generation | ✅ Implemented |
| `@synthkit/cli` | Command-line interface | ✅ Implemented |
| `@synthkit/mcp-synth` | MCP server for external tools | ✅ Implemented |

## 🏢 **Business Categories**

Inspired by [Stripe's synthetic-dataset](https://github.com/swanson-stripe/synthetic-dataset), Synthkit includes **9 comprehensive business models** with realistic data patterns:

### **E-commerce & Retail**
- **Modaic** - Fashion E-commerce with products, customers, orders, and payments
- **Keynest** - Real estate management with properties, tenants, leases, and rent payments

### **SaaS & Technology**  
- **Stratus** - B2B SaaS platform with subscriptions, billing, usage, and churn analytics
- **Mindora** - Online learning platform with courses, students, enrollments, and instructors

### **Marketplaces & Platforms**
- **Forksy** - Food delivery marketplace with restaurants, drivers, orders, and payouts
- **Fluxly** - Creator economy platform with creators, subscriptions, content, and earnings

### **Health & Wellness**
- **Pulseon** - Fitness streaming platform with members, trainers, workouts, and sessions
- **Procura** - Healthcare supply chain with providers, products, orders, and compliance

### **Social Impact**
- **Brightfund** - Impact platform with donors, campaigns, donations, and program metrics

Each category includes:
- **Realistic Schemas**: JSON Schema definitions with faker.js integration
- **Business Logic**: Industry-specific relationships and constraints  
- **Stage Progression**: Early → Growth → Enterprise complexity levels
- **Role-Based Access**: Admin vs Support data visibility controls

```json
// Example: Modaic Fashion E-commerce
{
  "categories": {
    "early": { "customers": 500, "products": 150, "orders": 800 },
    "growth": { "customers": 15000, "products": 2500, "orders": 45000 },
    "enterprise": { "customers": 500000, "products": 50000, "orders": 2000000 }
  },
  "roles": {
    "admin": { "dataVisibility": { "fullAccess": true } },
    "support": { "maskedFields": ["amount", "price", "revenue"] }
  }
}
```

## 👥 **Role-Based Access Control**

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

## 📈 **Business Maturity Stages**

Aligned with [synthetic-dataset](https://github.com/swanson-stripe/synthetic-dataset) complexity levels:

| Stage | Description | Data Volume | Complexity |
|-------|-------------|-------------|------------|
| **Early** | Startup scale | 5-500 records | Simple relationships |
| **Growth** | Scaling business | 1K-50K records | Moderate complexity |
| **Enterprise** | Large scale | 100K+ records | Complex relationships |

## 🎯 **Scenario Examples**

```typescript
// Early stage fashion startup with admin access
const earlyFashion = {
  category: 'modaic',
  role: 'admin', 
  stage: 'early',
  id: 12345
};

// Enterprise SaaS with support role (masked financials)
const enterpriseSaaS = {
  category: 'stratus',
  role: 'support',
  stage: 'enterprise', 
  id: 54321
};

// Growth marketplace with full admin visibility
const growthMarketplace = {
  category: 'forksy',
  role: 'admin',
  stage: 'growth',
  id: 98765
};
```

## 🛠️ **CLI Usage**

```bash
# Initialize new project
synthkit init my-project --template next-js

# AI-powered scenario building
synthkit ai analyze "A fitness app for tracking workouts"
synthkit ai match "An e-commerce marketplace"
synthkit ai generate "A SaaS project management tool" --save-to-file

# Generate mock data
synthkit generate --category modaic --role admin --stage growth --count 100

# Scenario management
synthkit scenario list
synthkit scenario activate modaic-growth-admin

# Create snapshots
synthkit snapshot create "pre-demo-state"
synthkit snapshot restore "pre-demo-state"
```

## 🔧 **Advanced Configuration**

### **Custom Role Definitions**

```typescript
const customRole = {
  id: 'analyst',
  name: 'Data Analyst',
  accessLevel: 'readonly',
  dataVisibility: {
    fullAccess: false,
    maskedFields: ['salary', 'revenue'],
    hiddenFields: ['ssn', 'bankAccount']
  }
};
```

### **MSW Integration with Role Masking**

```typescript
import { setupWorker } from 'msw/browser';
import { createPackHandlers } from '@synthkit/client';

const handlers = createPackHandlers(['modaic', 'stratus'], {
  category: 'modaic',
  role: 'support',    // Financial data will be masked
  stage: 'growth',
  id: 12345
});

const worker = setupWorker(...handlers);
worker.start();
```

### **State Management**

```typescript
import { synthStore } from '@synthkit/sdk';

// Set complete scenario
await synthStore.setScenario({
  category: 'stratus',
  role: 'admin',
  stage: 'enterprise',
  id: 12345
});

// Create snapshot
const snapshotId = synthStore.createSnapshot('demo-ready');

// Restore later
synthStore.restoreSnapshot(snapshotId);
```

## 📊 **Performance**

| Operation | Performance | Memory |
|-----------|-------------|---------|
| Generate 1K entities | <100ms | <10MB |
| Load pack schemas | <50ms | <5MB |
| MSW handler setup | <200ms | <15MB |
| Role-based masking | <5ms | <1MB |
| State snapshot | <10ms | <1MB |

## 🧪 **Testing**

```typescript
import { describe, it, expect } from 'vitest';
import { SchemaGenerator } from '@synthkit/sdk';

describe('Customer Generation', () => {
  it('generates consistent customers with same ID', () => {
    const generator = new SchemaGenerator();
    const schema = { /* customer schema */ };
    
    const customer1 = generator.generate(schema, 12345);
    const customer2 = generator.generate(schema, 12345);
    
    expect(customer1).toEqual(customer2);
  });

  it('masks financial data for support role', () => {
    const generator = new SchemaGenerator();
    const supportRole = { accessLevel: 'support', maskedFields: ['amount'] };
    
    const payment = generator.generateWithRole(schema, supportRole, 12345);
    
    expect(payment.amount).toBe('hidden');
  });
});
```

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Pack Schemas   │───▶│ Schema Generator │───▶│  MSW Handlers   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Validation    │    │  Deterministic  │    │  Role Masking   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Business Logic  │    │   Data Output   │    │  API Responses  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup**

```bash
git clone https://github.com/synthkit/synthkit
cd synthkit
pnpm install
pnpm build
pnpm test
```

### **Pack Development**

```bash
# Validate pack structure
pnpm validate:pack packs/my-pack

# Test pack generation
pnpm cli generate --category my-pack --role admin --stage growth --count 10
```

## 📚 **Documentation**

- [**Getting Started Guide**](docs/getting-started.md)
- [**Pack Development**](docs/pack-development.md)
- [**Role-Based Access Control**](docs/rbac.md)
- [**API Reference**](docs/api-reference.md)
- [**Framework Integrations**](docs/integrations.md)
- [**Governance & Standards**](GOVERNANCE.md)

## 🔗 **Ecosystem**

| Tool | Purpose | Status |
|------|---------|--------|
| [Synthkit Studio](https://studio.synthkit.dev) | Visual pack editor | 🚧 Coming Soon |
| [Pack Registry](https://packs.synthkit.dev) | Community pack library | 🚧 Coming Soon |
| [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=synthkit.synthkit) | IDE integration | 🚧 Coming Soon |

## 📈 **Roadmap**

- [x] **v1.0**: AI-powered scenario analysis and generation ✅
- [ ] **v1.1**: Visual scenario builder and pack registry
- [ ] **v1.2**: Advanced relationship modeling
- [ ] **v1.3**: Real-time collaboration features
- [ ] **v2.0**: Enhanced AI with custom persona generation

## 📄 **License**

MIT © [Synthkit Team](https://synthkit.dev)

---

## 🙏 **Acknowledgments**

Inspired by the excellent work of:
- [Stripe's synthetic-dataset](https://github.com/swanson-stripe/synthetic-dataset) for realistic business patterns
- [Mock Service Worker](https://mswjs.io/) for API mocking
- [Faker.js](https://fakerjs.dev/) for realistic data generation
- [JSON Schema](https://json-schema.org/) for schema validation

---

**Ready to generate realistic mock data with proper access controls in minutes, not hours.** 🚀

[Get Started](docs/getting-started.md) • [Examples](examples/) • [Community](https://discord.gg/synthkit)