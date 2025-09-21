<h1 style="display: flex; align-items: center;"><img src="https://github.com/nicholasswanson/synthkit/raw/main/docs/synthkit-logo-md.png" alt="Synthkit" width="48" height="48" style="margin-right: 12px;"> <span style="transform: translateY(-2px);">Synthkit</span></h1>

> **A comprehensive mocking and scenario generation toolkit for modern applications**

Synthkit provides deterministic, schema-driven mock data generation with realistic business patterns, role-based access controls, and seamless framework integrations. Inspired by [Stripe's synthetic-dataset](https://github.com/swanson-stripe/synthetic-dataset).

[![GitHub](https://img.shields.io/github/stars/nicholasswanson/synthkit?style=social)](https://github.com/nicholasswanson/synthkit)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat&logo=pnpm&logoColor=white)](https://pnpm.io/)

## ✨ **Features**

- 🎯 **Deterministic Generation** - Same ID = identical data across runs
- 📋 **Schema-Driven** - JSON Schema definitions ensure type safety
- 🏢 **Business Categories** - 9 realistic business contexts (Checkout e-commerce, B2B SaaS, Food delivery, etc.)
- 👥 **Role-Based Access** - Admin/Support roles with data masking capabilities
- 📈 **Stage-Aware** - Early/Growth/Enterprise complexity levels
- 🤖 **AI-Powered Analysis** - Describe your business and get intelligent scenario recommendations
- 📤 **Dataset Sharing** - Generate shareable URLs with AI tool integration code
- 🔗 **AI Tool Integration** - Optimized for Cursor, Claude, ChatGPT, v0, and vanilla JS
- 🔄 **MSW Integration** - Seamless API mocking with Mock Service Worker
- ⚡ **Framework Agnostic** - Works with React, Next.js, Vue, and more
- 📦 **Modular Packs** - Extensible library of domain-specific schemas
- 🛠️ **Developer Tools** - CLI, MCP server, and visual components

## 🚀 **Quick Start**

### **Up and running in <30s**

While in your project directory, open a fresh terminal and paste the following.

```bash
# Step 1
git clone https://github.com/nicholasswanson/synthkit.git      # Clones the repo locally
cd synthkit

# Step 2
./scripts/setup-dev-auto.sh      # Runs the setup script

# Step 3
cd examples/next-app
pnpm dev      # Starts Synthkit at http://localhost:3001
```

### **More installation paths**

```bash
# Clone the repository
git clone https://github.com/nicholasswanson/synthkit.git
cd synthkit

# Option 1: Fully automated setup (recommended)
# Automatically installs Node 20+ if needed
./scripts/setup-dev-auto.sh

# Option 2: Basic setup (requires Node 20+ pre-installed)
./scripts/setup-dev.sh

# Option 3: Manual setup
pnpm install   # Installs all dependencies
pnpm build     # Builds all packages

# Run the Next.js demo
cd examples/next-app
pnpm dev       # Opens at http://localhost:3001
```

### **Using Specific Node Version**

```bash
# If using nvm
nvm install    # Reads .nvmrc and installs correct version
nvm use        # Switches to project's Node version

# If using volta
volta install node@20.11.0
```

### **Prerequisites**

- **Node.js**: 20.11.0 or higher (see `.nvmrc`)
- **pnpm**: 9.0.0 or higher (will be auto-installed if missing)

### **Interactive Demo**

The Next.js example includes integrated AI analysis with zero configuration - describe your business idea directly in the demo to see intelligent scenario recommendations. AI features work out-of-the-box with no API key setup required!

![Synthkit Demo Interface](https://github.com/nicholasswanson/synthkit/raw/main/docs/synthkit-demo-screenshot.png)

### **🤖 Zero-Config AI Features**

Synthkit includes AI-powered scenario generation that works immediately without any setup:

- **No API Key Required**: AI features use a server-side proxy with pre-configured credentials
- **Instant Analysis**: Describe your business idea and get intelligent recommendations
- **Smart Data Generation**: AI automatically creates realistic entities and relationships
- **Cost Monitored**: Usage is tracked and rate-limited to prevent abuse
- **Perfect for Prototyping**: Designed for rapid iteration and experimentation

```bash
# AI features work immediately in the demo
cd examples/next-app
pnpm dev  # AI analysis available at http://localhost:3001
```
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
  category: 'checkout-ecommerce',  // Business type (fashion e-commerce)
  role: 'admin',                  // Access level (full financial data)
  stage: 'growth',                // Business maturity (scaling)
  id: 12345                       // Deterministic generation ID
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
  packs: ['packs/checkout-ecommerce', 'packs/b2b-saas'],
  defaultCategory: 'checkout-ecommerce'
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
- **Checkout e-commerce** - Fashion E-commerce with products, customers, orders, and payments
- **Real estate** - Real estate management with properties, tenants, leases, and rent payments

### **SaaS & Technology**  
- **B2B SaaS** - B2B SaaS platform with subscriptions, billing, usage, and churn analytics
- **Online learning** - Online learning platform with courses, students, enrollments, and instructors

### **Marketplaces & Platforms**
- **Food delivery** - Food delivery marketplace with restaurants, drivers, orders, and payouts
- **Creator economy** - Creator economy platform with creators, subscriptions, content, and earnings

### **Health & Wellness**
- **Fitness streaming** - Fitness streaming platform with members, trainers, workouts, and sessions
- **Healthcare supply** - Healthcare supply chain with providers, products, orders, and compliance

### **Social Impact**
- **Impact platform** - Impact platform with donors, campaigns, donations, and program metrics

Each category includes:
- **Realistic Schemas**: JSON Schema definitions with faker.js integration
- **Business Logic**: Industry-specific relationships and constraints  
- **Stage Progression**: Early → Growth → Enterprise complexity levels
- **Role-Based Access**: Admin vs Support data visibility controls

```json
// Example: Checkout e-commerce Fashion E-commerce
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
  category: 'checkout-ecommerce',
  role: 'admin', 
  stage: 'early',
  id: 12345
};

// Enterprise SaaS with support role (masked financials)
const enterpriseSaaS = {
  category: 'b2b-saas',
  role: 'support',
  stage: 'enterprise', 
  id: 54321
};

// Growth marketplace with full admin visibility
const growthMarketplace = {
  category: 'food-delivery',
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

## 📤 **Dataset Sharing & Integration**

Synthkit provides a complete ecosystem for sharing realistic datasets with AI development tools. Generate datasets in the demo app or CLI, then seamlessly integrate them into your development workflow.

### **🎯 Quick Workflow**

```bash
# 1. Generate a shareable dataset URL
synthkit dataset url --category checkout-ecommerce --stage growth --copy
# ✅ Dataset URL generated: https://nicholasswanson.github.io/synthkit/datasets/scenario-checkout-ecommerce-admin-growth-12345.json
# 📋 URL copied to clipboard

# 2. Preview the dataset
synthkit dataset fetch "https://nicholasswanson.github.io/synthkit/datasets/scenario-checkout-ecommerce-admin-growth-12345.json" --preview 5
# 📊 Shows: 5,561 customers, 12,790 payments, business metrics

# 3. Generate AI tool integration
synthkit dataset integrate "https://nicholasswanson.github.io/synthkit/datasets/scenario-checkout-ecommerce-admin-growth-12345.json" --tool cursor --rules
# ✅ .cursorrules saved to current directory
# 💡 Restart Cursor for optimized AI assistance
```

### **🌐 Demo App Integration**

The [Next.js demo app](https://nicholasswanson.github.io/synthkit) provides a visual interface for dataset configuration:

1. **Configure Scenario**: Select business category, stage, and role
2. **AI Analysis**: Describe your business idea for intelligent recommendations  
3. **Generate Data**: Create realistic datasets with proper relationships
4. **Share Dataset**: Get shareable URLs with one-click integration code

```typescript
// Generated datasets include realistic business metrics
{
  "customers": [...],           // 5,561 realistic customer records
  "payments": [...],           // 12,790 payment transactions  
  "businessMetrics": {
    "customerLifetimeValue": 350.75,
    "averageOrderValue": 199.99,
    "monthlyRecurringRevenue": 4358.11,
    "dailyActiveUsers": 2847,
    "conversionRate": 7.25
  }
}
```

### **🤖 AI Tool Integrations**

Synthkit generates optimized integration code for popular AI development tools:

#### **Cursor Integration**
```bash
synthkit dataset integrate "<url>" --tool cursor --rules
```
- Generates complete React hooks with TypeScript interfaces
- Creates `.cursorrules` file for context-aware AI assistance
- Includes business domain knowledge for better suggestions

#### **Claude Integration**  
```bash
synthkit dataset integrate "<url>" --tool claude --output claude-prompt.txt
```
- Comprehensive prompts with business context
- Detailed integration requirements and best practices
- Domain-specific guidance (e.g., fashion e-commerce patterns)

#### **ChatGPT Integration**
```bash
synthkit dataset integrate "<url>" --tool chatgpt --output chatgpt-prompt.txt  
```
- Concise, practical prompts for quick solutions
- Ready-to-paste integration requests

#### **v0 Integration**
```bash
synthkit dataset integrate "<url>" --tool v0 --output component-prompt.txt
```
- Component-focused prompts with styling requirements
- Modern dashboard templates with proper data display

#### **Vanilla JavaScript**
```bash
synthkit dataset integrate "<url>" --tool fetch --output data-manager.js
```
- Complete DatasetManager class with caching
- Utility methods for common operations
- Framework-agnostic implementation

### **📊 Business Context Awareness**

All integrations include business domain intelligence:

| Category | Business Type | Domain | AI Assistance Focus |
|----------|---------------|---------|-------------------|
| checkout-ecommerce | Fashion E-commerce | retail | Product catalogs, customer segments |
| b2b-saas | B2B SaaS Platform | software | Subscriptions, usage analytics |
| food-delivery | Food Delivery | marketplace | Orders, driver logistics |
| creator-economy | Creator Economy | social | Content, creator earnings |
| online-learning | Online Learning | education | Courses, student progress |
| fitness-streaming | Fitness Platform | health | Workouts, member tracking |
| healthcare-supply | Healthcare Supply | healthcare | Compliance, supply chain |
| impact-platform | Impact Investment | finance | Donations, impact metrics |
| real-estate | Real Estate | real-estate | Properties, lease management |

### **🔗 API Endpoints**

All dataset functionality is available via RESTful APIs:

```bash
# Create dataset
POST /api/dataset/create
{
  "type": "scenario",
  "data": { "customers": [...], "payments": [...] },
  "metadata": { "scenario": {...} }
}

# Fetch dataset
GET /api/dataset/[id]

# Get dataset info
GET /api/dataset/[id]/info

# Fetch metrics
GET /api/metrics?granularity=monthly

# Generate integration code
GET /api/dataset/[id]/integrate?tool=cursor&format=rules
```

### **📈 Realistic Data Volumes**

Datasets include realistic record counts based on business stage:

| Stage | Customer Range | Payment Multiplier | Business Metrics |
|-------|----------------|-------------------|------------------|
| **Early** | 47-523 | 1.2x customers | Startup-appropriate |
| **Growth** | 1.2K-9.9K | 2.3x customers | Scaling business |
| **Enterprise** | 12K-988K | 4.7x customers | Large-scale operations |

All values use realistic, non-rounded numbers (e.g., 5,561 customers, $350.75 CLV) and proper formatting:
- **Currency**: Displayed in cents ($123.45)
- **Percentages**: To hundredths (7.25%)
- **Relationships**: Realistic ratios between entities

### **🔄 Deterministic Generation**

Same parameters always generate identical datasets:
```bash
# These will always produce the same data
synthkit dataset url --category checkout-ecommerce --stage growth --id 12345
synthkit dataset url --category checkout-ecommerce --stage growth --id 12345
```

Perfect for:
- **Team Collaboration**: Share exact datasets across team members
- **Documentation**: Include stable dataset URLs in README files
- **Testing**: Consistent test data across environments
- **Demos**: Reliable data for presentations and tutorials

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

const handlers = createPackHandlers(['checkout-ecommerce', 'b2b-saas'], {
  category: 'checkout-ecommerce',
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
  category: 'b2b-saas',
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

## 🔧 **Dependency Management**

Synthkit uses a modern monorepo setup with centralized dependency management:

### **Catalog System**
All common dependencies are managed through pnpm's catalog feature in `pnpm-workspace.yaml`:

```yaml
catalog:
  # Core dependencies
  "@faker-js/faker": "^10.0.0"
  "typescript": "^5.6.3"
  "vitest": "^2.1.5"
  # ... and more
```

Packages reference catalog versions:
```json
{
  "devDependencies": {
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```

### **Updating Dependencies**
```bash
# Update a catalog dependency version
# 1. Edit version in pnpm-workspace.yaml
# 2. Run:
pnpm install

# Update all packages to use catalog
node tools/update-deps.js
```

### **Version Requirements**
- **Node.js**: Locked to 20.11.0 via `.nvmrc`
- **pnpm**: Minimum 9.0.0 for catalog support
- **Package Manager**: Enforced via `packageManager` field

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
- [**Dataset CLI Commands**](DATASET_CLI.md) - Complete CLI reference for dataset sharing
- [**Pack Development**](docs/pack-development.md)
- [**Role-Based Access Control**](docs/rbac.md)
- [**API Reference**](docs/api-reference.md)
- [**Framework Integrations**](docs/integrations.md)
- [**Governance & Standards**](GOVERNANCE.md)


## 📄 **License**

MIT © [Synthkit Team](https://synthkit.dev)

---
