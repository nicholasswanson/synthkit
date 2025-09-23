# 🚀 Synthkit Dataset Generation Guide

## Overview

Synthkit now provides **server-side dataset generation** through GitHub Actions, making it easy to create realistic datasets for external tools like v0, Claude, ChatGPT, and more.

## 🎯 What You Get

- **Realistic Data**: Thousands of customers, charges, subscriptions, invoices
- **Public URLs**: Accessible from anywhere (v0, Claude, ChatGPT, etc.)
- **Zero Configuration**: No local setup required
- **Automatic Updates**: Datasets update when you change configuration

## 🚀 Quick Start

### 1. Generate a Dataset

1. Go to your Synthkit next-app: `http://localhost:3001`
2. Configure your business scenario:
   - **Category**: Choose from predefined options (SaaS, E-commerce, etc.)
   - **Stage**: Early, Growth, or Enterprise
   - **ID**: Change this number to generate different datasets
3. Click **"Generate Dataset URL"**
4. Wait for the GitHub Actions workflow to complete (1-2 minutes)
5. Copy the generated URL

### 2. Use in External Tools

**For v0.dev:**
```
Paste this URL into v0: https://nicholasswanson.github.io/synthkit/datasets/[your-dataset].json

Then ask v0 to:
1. Install @synthkit/enhanced: npm install @synthkit/enhanced
2. Replace mock data with: const result = await getData();
3. Use the data: const { customers, charges } = result.data;
```

**For Claude/ChatGPT:**
```
Dataset URL: https://nicholasswanson.github.io/synthkit/datasets/[your-dataset].json

Integration steps:
1. Install: npm install @synthkit/enhanced
2. Import: import { getData } from '@synthkit/enhanced'
3. Use: const result = await getData();
4. Access: const { customers, charges, subscriptions } = result.data;
```

## 📊 Dataset Structure

Each dataset includes:

```json
{
  "customers": [...],      // Array of customer objects
  "charges": [...],        // Array of charge objects  
  "subscriptions": [...],  // Array of subscription objects
  "invoices": [...],       // Array of invoice objects
  "plans": [...],          // Array of plan objects
  "businessMetrics": {...}, // Key business metrics
  "metrics": [...],        // Comprehensive metrics array
  "_metadata": {
    "generatedAt": "2024-01-01T00:00:00.000Z",
    "businessType": "b2b-saas-subscriptions",
    "stage": "growth",
    "counts": {
      "customers": 5000,
      "charges": 25000,
      "subscriptions": 12000,
      "invoices": 5000,
      "plans": 5
    },
    "includedMetrics": ["Gross Payment Volume", "Payment Success Rate", ...]
  }
}
```

## 🔧 Technical Details

### GitHub Actions Workflow

The dataset generation uses a GitHub Actions workflow that:

1. **Triggers**: When you click "Generate Dataset URL" in the next-app
2. **Generates**: Realistic Stripe data using the standalone script
3. **Commits**: The dataset to the repository
4. **Serves**: Via GitHub Pages at `https://nicholasswanson.github.io/synthkit/datasets/`

### URL Format

Datasets are accessible at:
```
https://nicholasswanson.github.io/synthkit/datasets/{animal1}-{animal2}-{id}-{timestamp}.json
```

Example: `https://nicholasswanson.github.io/synthkit/datasets/tiger-heron-12345-674634.json`

### Business Types Supported

- `b2b-saas-subscriptions` - B2B SaaS with recurring subscriptions
- `checkout-ecommerce` - E-commerce with one-time payments
- `food-delivery-platform` - Marketplace with high transaction volume
- `consumer-fitness-app` - Consumer app with subscriptions
- `b2b-invoicing` - B2B invoicing platform
- `property-management-platform` - Property management with recurring billing
- `creator-platform` - Creator economy platform
- `donation-marketplace` - Donation and fundraising platform

### Stage Scaling

- **Early**: ~10% of base volume (startup phase)
- **Growth**: 100% of base volume (scaling phase)  
- **Enterprise**: ~2000% of base volume (enterprise phase)

## 🛠️ Troubleshooting

### Dataset Not Accessible

1. **Check GitHub Pages**: Ensure GitHub Pages is enabled in repository settings
2. **Check Workflow**: Go to Actions tab to see if the workflow completed successfully
3. **Check URL**: Verify the URL format matches the expected pattern

### Workflow Fails

1. **Check Secrets**: Ensure `SYNTHKIT_TOKEN` and `NEXT_PUBLIC_SYNTHKIT_TOKEN` are set
2. **Check Permissions**: Token needs `repo` and `workflow` permissions
3. **Check Logs**: Review the Actions logs for specific error messages

### Integration Issues

1. **CORS**: GitHub Pages serves datasets with proper CORS headers
2. **Size**: Large datasets (25MB+) may take time to load
3. **Caching**: Browsers may cache old datasets - try hard refresh

## 📈 Performance

- **Generation Time**: 1-2 minutes for realistic datasets
- **File Size**: 5-25MB depending on business type and stage
- **Record Counts**: 1K-50K customers, 5K-300K charges
- **Accessibility**: Available immediately after generation

## 🔄 Updating Datasets

To update an existing dataset:

1. Change the configuration in the next-app
2. Click **"Update Dataset"** 
3. The same URL will be updated with new data
4. External tools will automatically get the updated data

## 🎨 Integration Examples

### React Component

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
    </div>
  );
}
```

### Vanilla JavaScript

```javascript
import { getData } from '@synthkit/enhanced';

async function loadData() {
  const result = await getData();
  const { customers, charges, subscriptions } = result.data;
  
  console.log(`Loaded ${customers.length} customers`);
  console.log(`Loaded ${charges.length} charges`);
}
```

## 🎯 Best Practices

1. **Use Realistic IDs**: Change the scenario ID to generate different datasets
2. **Test Integration**: Always test the dataset URL in your target tool
3. **Monitor Workflows**: Check the Actions tab if generation seems slow
4. **Cache Strategically**: Datasets are large, consider caching in your app
5. **Handle Errors**: Always check for loading states and errors

## 🚀 Next Steps

1. **Generate your first dataset** using the next-app
2. **Test the URL** in v0, Claude, or ChatGPT
3. **Integrate** using `@synthkit/enhanced`
4. **Share** your prototypes with realistic data!

---

**Need help?** Check the [GitHub Actions logs](https://github.com/nicholasswanson/synthkit/actions) or [create an issue](https://github.com/nicholasswanson/synthkit/issues).
