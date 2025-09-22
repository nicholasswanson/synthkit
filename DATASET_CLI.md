# Dataset CLI Commands

Complete command-line interface for Synthkit dataset management and sharing.

## Overview

The `synthkit dataset` commands provide a comprehensive CLI for:
- Generating shareable dataset URLs from scenario parameters
- Fetching and previewing datasets from URLs
- Generating AI tool integration code
- Managing dataset workflows

## Commands

### `synthkit dataset url`

Generate a shareable dataset URL from scenario parameters.

```bash
# Interactive mode (prompts for missing options)
synthkit dataset url

# Specify all parameters
synthkit dataset url \
  --category modaic \
  --role admin \
  --stage growth \
  --id 12345 \
  --copy

# Use custom base URL
synthkit dataset url \
  --category stratus \
  --base-url https://your-domain.com
```

**Options:**
- `-c, --category <category>` - Business category (modaic, stratus, forksy, etc.)
- `-r, --role <role>` - Access role (admin, support) [default: admin]
- `-s, --stage <stage>` - Business stage (early, growth, enterprise) [default: growth]
- `--id <id>` - Deterministic generation ID [default: 12345]
- `--base-url <url>` - Base URL for dataset API [default: nicholasswanson.github.io/synthkit]
- `--copy` - Copy URL to clipboard

**Example Output:**
```
✅ Dataset URL generated:
http://localhost:3001/datasets/scenario-modaic-admin-growth-12345.json

📊 Dataset Preview:
  Category: modaic (Fashion E-commerce)
  Role: admin
  Stage: growth
  ID: 12345
  Expected: ~5,561 customers, ~12,790 payments
```

### `synthkit dataset fetch`

Fetch and preview dataset from URL.

```bash
# Basic fetch with preview
synthkit dataset fetch "https://nicholasswanson.github.io/synthkit/datasets/scenario-modaic-admin-growth-12345.json"

# Save to file
synthkit dataset fetch \
  "https://nicholasswanson.github.io/synthkit/datasets/scenario-modaic-admin-growth-12345.json" \
  --output my-dataset.json

# Show only metadata
synthkit dataset fetch \
  "https://nicholasswanson.github.io/synthkit/datasets/scenario-modaic-admin-growth-12345.json" \
  --info

# Custom preview count
synthkit dataset fetch \
  "https://nicholasswanson.github.io/synthkit/datasets/scenario-modaic-admin-growth-12345.json" \
  --preview 10
```

**Options:**
- `-o, --output <path>` - Save dataset to file
- `--preview <count>` - Number of records to preview [default: 5]
- `--info` - Show only metadata (no data preview)

**Example Output:**
```
📊 Dataset Info:
  Type: scenario
  Created: 1/20/2024
  Scenario: modaic (admin, growth, ID: 12345)

📈 Data Summary:
  customers: 3 records
  payments: 4 records
  businessMetrics: 5 properties

👥 Customer Preview (2 of 3):
  1. Alice Johnson (alice.johnson@example.com) - Gold
  2. Bob Smith (bob.smith@example.com) - Silver

📊 Business Metrics:
  CLV: $201.14
  AOV: $128.98
  MRR: $4358.11
```

### `synthkit dataset integrate`

Generate Enhanced integration code for AI development tools.

```bash
# Generate Cursor integration with Enhanced approach
synthkit dataset integrate \
  "https://nicholasswanson.github.io/synthkit/datasets/scenario-modaic-admin-growth-12345.json" \
  --tool cursor \
  --rules

# Generate v0 component prompt with Enhanced
synthkit dataset integrate \
  "https://nicholasswanson.github.io/synthkit/datasets/scenario-modaic-admin-growth-12345.json" \
  --tool v0 \
  --output component-prompt.txt

# Generate Enhanced JavaScript integration
synthkit dataset integrate \
  "https://nicholasswanson.github.io/synthkit/datasets/scenario-modaic-admin-growth-12345.json" \
  --tool fetch \
  --output useDataset.js
```

**Options:**
- `-t, --tool <tool>` - Target tool (cursor, claude, chatgpt, v0, fetch) [default: cursor]
- `-f, --framework <framework>` - Target framework (react, nextjs, vanilla) [default: react]
- `-o, --output <path>` - Output file path
- `--rules` - Generate .cursorrules file (for cursor tool)

**Available Tools (Enhanced):**
- **cursor**: Enhanced integration with `getData()` and `useSynthkit()` + .cursorrules file
- **claude**: Comprehensive prompts with Enhanced approach and business context
- **chatgpt**: Concise, practical prompts with `getData()` examples
- **v0**: Component-focused prompts with Enhanced data integration
- **fetch**: Enhanced JavaScript with `getData()` and universal compatibility

### `synthkit dataset tools`

List available integration tools and business categories.

```bash
synthkit dataset tools
```

**Example Output:**
```
🛠️ Available Integration Tools:

cursor:
  AI-powered code editor with context-aware assistance
  Features: React hooks, TypeScript, .cursorrules

claude:
  AI assistant for detailed development guidance
  Features: Comprehensive prompts, Business context, Best practices

🎯 Business Categories:
  modaic (Fashion E-commerce)
  stratus (B2B SaaS)
  forksy (Food Delivery)
  ...
```

## Business Categories

| Category | Description | Domain | Complexity |
|----------|-------------|---------|------------|
| modaic | Fashion E-commerce | retail | medium |
| stratus | B2B SaaS Platform | software | high |
| forksy | Food Delivery Marketplace | marketplace | high |
| fluxly | Creator Economy Platform | social | medium |
| mindora | Online Learning Platform | education | medium |
| pulseon | Fitness & Wellness App | health | medium |
| procura | Healthcare Supply Chain | healthcare | high |
| brightfund | Impact Investment Platform | finance | high |
| keynest | Real Estate Management | real-estate | high |

## Data Volume Estimates

| Stage | Range | Description |
|-------|-------|-------------|
| early | 47-523 records | Startup/MVP stage |
| growth | 1.2K-9.9K records | Scaling business |
| enterprise | 12K-988K records | Large-scale operations |

*Note: Actual volumes vary by category multipliers*

## Workflow Examples

### 1. Quick Dataset Generation

```bash
# Generate URL for fashion e-commerce growth stage
synthkit dataset url --category modaic --stage growth --copy

# Fetch and preview the data
synthkit dataset fetch "<generated-url>" --preview 3

# Generate Cursor integration
synthkit dataset integrate "<generated-url>" --tool cursor --rules
```

### 2. AI Tool Integration

```bash
# Generate Claude prompt for comprehensive help
synthkit dataset integrate "<url>" --tool claude --output claude-prompt.txt

# Generate v0 component
synthkit dataset integrate "<url>" --tool v0 --output v0-component.txt

# Generate vanilla JS integration
synthkit dataset integrate "<url>" --tool fetch --output data-manager.js
```

### 3. Dataset Analysis

```bash
# Get detailed dataset info
synthkit dataset fetch "<url>" --info

# Save full dataset locally
synthkit dataset fetch "<url>" --output local-dataset.json

# Preview specific number of records
synthkit dataset fetch "<url>" --preview 20
```

## Environment Variables

- `SYNTHKIT_BASE_URL` - Default base URL for dataset API (default: https://nicholasswanson.github.io/synthkit)

## Error Handling

The CLI provides comprehensive error handling:
- Network connectivity issues
- Invalid dataset URLs
- Missing dependencies
- File system permissions
- API rate limiting

## Integration with Demo App

The CLI works seamlessly with the Synthkit demo app:
1. Generate datasets in the demo app UI
2. Copy the shareable URL
3. Use CLI commands to fetch, analyze, and integrate
4. Generate tool-specific integration code

## API Compatibility

All CLI commands use the same API endpoints as the demo app:
- `/api/dataset/create` - Create new datasets
- `/api/dataset/[id]` - Fetch dataset data
- `/api/dataset/[id]/info` - Get dataset metadata
- `/api/dataset/[id]/integrate` - Generate integration code

This ensures consistency between UI and CLI workflows.
