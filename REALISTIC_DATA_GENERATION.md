# Realistic Data Generation

This document explains the enhanced realistic data generation features implemented in Synthkit.

## Overview

The realistic data generation system addresses the need for production-ready mock data that accurately represents real-world business scenarios with appropriate volumes, non-rounded values, and realistic business metrics.

## Key Features

### 1. Realistic Volume Scaling

**Previous Implementation:**
- Early: 8 records
- Growth: 15 records  
- Enterprise: 30 records

**New Implementation:**
- Early: 47-523 records (realistic startup scale)
- Growth: 1,247-9,876 records (scaling business)
- Enterprise: 12,456-987,654 records (large enterprise)

### 2. Category-Specific Multipliers

Different business types have realistic volume characteristics:

| Category | Multiplier | Description |
|----------|------------|-------------|
| Modaic (Fashion) | 1.0x | Standard e-commerce volume |
| Stratus (B2B SaaS) | 0.267x | Fewer, higher-value customers |
| Forksy (Food Delivery) | 2.143x | High volume, low-value transactions |
| Fluxly (Creator Economy) | 0.534x | Moderate volume |
| Mindora (Online Learning) | 0.423x | Moderate volume |
| Pulseon (Fitness) | 0.867x | Moderate volume |
| Procura (Healthcare) | 0.234x | Fewer, high-value customers |
| Brightfund (Non-profit) | 0.123x | Very few, high-value donors |
| Keynest (Real Estate) | 0.056x | Very few, very high-value transactions |

### 3. Non-Rounded Values

All generated values use realistic, non-rounded numbers:

**Examples:**
- Customer count: 96,546 (not 100,000)
- Conversion rate: 9.56% (not 10%)
- Average order value: $1,247.89 (not $1,250)
- Monthly recurring revenue: $45,678.12 (not $50,000)

### 4. Business Metrics Generation

The system generates realistic business metrics that scale with company stage:

#### Early Stage
- Customer Lifetime Value: $85-320
- Average Order Value: $67-213
- Monthly Recurring Revenue: $1,248-6,926
- Daily Active Users: 4-45
- Conversion Rate: 2.3-6.0%

#### Growth Stage
- Customer Lifetime Value: $196-736
- Average Order Value: $121-383
- Monthly Recurring Revenue: $3,993-22,163
- Daily Active Users: 16-185
- Conversion Rate: 3.2-8.4%

#### Enterprise Stage
- Customer Lifetime Value: $488-1,824
- Average Order Value: $229-725
- Monthly Recurring Revenue: $11,106-61,643
- Daily Active Users: 49-570
- Conversion Rate: 4.9-15.4%

### 5. Performance Optimizations

#### Pagination
- Large datasets are paginated (50 items per page)
- Prevents UI freezing with massive datasets
- Includes navigation controls

#### Chunked Generation
- For datasets >10,000 records, generation is chunked
- Prevents browser blocking during generation
- Yields control between chunks

#### Memory Management
- Efficient data structures
- Lazy loading of paginated data
- Cleanup of unused data

### 6. Realistic Amount Generation

Payment amounts are generated with:
- Category-specific pricing multipliers
- Stage-based scaling
- Realistic variance (±15%)
- Proper currency formatting (2 decimal places)

**Example Amounts:**
- Fashion item: $124.67
- SaaS subscription: $253.40
- Food order: $63.40
- Medical supply: $496.70
- Rent payment: $1,472.30

## Usage Examples

### Basic Usage
```typescript
// Generate realistic data for a B2B SaaS company in growth stage
const scenario = {
  category: 'stratus',
  role: 'admin',
  stage: 'growth',
  id: 12345
};

const customers = generateCustomers(scenario);
// Generates ~2,600 customers (realistic for B2B SaaS growth stage)
```

### Volume Calculation
```typescript
const volume = getRealisticVolume('enterprise', 'forksy');
console.log(volume);
// { min: 26667, max: 2116667, expected: 1334167 }
// Food delivery enterprise with 1.3M+ customers
```

### Business Metrics
```typescript
const metrics = generateBusinessMetrics('growth', 'modaic', 12345);
console.log(metrics);
// {
//   customerLifetimeValue: 234,
//   averageOrderValue: 156,
//   monthlyRecurringRevenue: 4567,
//   dailyActiveUsers: 89,
//   conversionRate: 4.23
// }
```

## Configuration

### Volume Ranges
```typescript
const baseVolumes = {
  early: { min: 47, max: 523 },
  growth: { min: 1247, max: 9876 },
  enterprise: { min: 12456, max: 987654 }
};
```

### Category Multipliers
```typescript
const categoryMultipliers = {
  modaic: 1.0,      // Standard e-commerce
  stratus: 0.267,   // B2B SaaS (fewer customers)
  forksy: 2.143,    // Food delivery (high volume)
  // ... etc
};
```

## Benefits

1. **Realistic Testing**: Data volumes match real-world scenarios
2. **Performance Testing**: Large datasets test pagination and performance
3. **Business Intelligence**: Realistic metrics for dashboard development
4. **User Experience**: Non-rounded values feel more authentic
5. **Scalability**: Handles enterprise-level data volumes efficiently

## Implementation Notes

- All values are deterministic based on scenario ID
- Seeded random generation ensures reproducibility
- Memory-efficient for large datasets
- TypeScript support with proper typing
- React hooks for pagination management

## Future Enhancements

- [ ] Time-series data generation
- [ ] Geographic distribution
- [ ] Seasonal patterns
- [ ] Customer behavior modeling
- [ ] A/B testing scenarios
