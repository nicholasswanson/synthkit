#!/usr/bin/env node

const fs = require('fs');

// Read the current HTML file
let content = fs.readFileSync('/Users/nicholasswanson/synthkit/index.html', 'utf8');

// 1. Fix updateDatasetStructure function signature
content = content.replace(
    'function updateDatasetStructure(businessType, stage) {',
    'function updateDatasetStructure(businessType, stage, customAnalysis = null) {'
);

// 2. Fix updateIncludedMetrics function signature
content = content.replace(
    'function updateIncludedMetrics(businessType, stage) {',
    'function updateIncludedMetrics(businessType, stage, customAnalysis = null) {'
);

// 3. Add custom analysis usage in updateDatasetStructure
const enhancedUpdateDatasetStructure = `
        // Update dataset structure display (EXACT SAME AS ORIGINAL NEXT-APP)
        function updateDatasetStructure(businessType, stage, customAnalysis = null) {
            console.log('updateDatasetStructure called with businessType:', businessType, 'stage:', stage, 'customAnalysis:', customAnalysis);
            
            const counts = getRealisticCounts(businessType, stage);
            const patterns = getPersonaPatterns(businessType);
            const container = document.getElementById('dataset-structure-section');
            
            // Use custom analysis if available
            let displayBusinessType = businessType;
            if (customAnalysis) {
                displayBusinessType = customAnalysis.businessContext.type.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace('b2b-saas-subscriptions', 'b2b-saas-subscriptions')
                    .replace('checkout-e-commerce', 'checkout-ecommerce')
                    .replace('food-delivery-platform', 'food-delivery-platform')
                    .replace('consumer-fitness-app', 'consumer-fitness-app')
                    .replace('b2b-invoicing', 'b2b-invoicing')
                    .replace('property-management-platform', 'property-management-platform')
                    .replace('creator-platform', 'creator-platform')
                    .replace('donation-marketplace', 'donation-marketplace');
                
                console.log('Using custom analysis for dataset structure, displayBusinessType:', displayBusinessType);
            }
            
            // Generate realistic Stripe data structure (sample only for display)
            const sampleSize = 3; // Only generate 3 examples of each type
            const stripeData = {
                customers: Array.from({length: Math.min(sampleSize, counts.customers)}, (_, i) => {
                    const seed = i * 1000;
                    return {
                        id: generateStripeId('cus_', seed),
                        name: generateRealisticName(seed, displayBusinessType),
                        email: generateRealisticEmail(seed, displayBusinessType),
                        created: generateRealisticTimestamp(seed, 365),
                        status: 'active'
                    };
                }),
                charges: Array.from({length: Math.min(sampleSize, counts.charges)}, (_, i) => {
                    const seed = i * 2000;
                    const amountRange = patterns.chargeAmountMax - patterns.chargeAmountMin;
                    return {
                        id: generateStripeId('ch_', seed),
                        amount: Math.floor(seededRandom(seed) * amountRange) + patterns.chargeAmountMin,
                        currency: 'usd',
                        status: seededRandom(seed + 1) < patterns.successRate ? 'succeeded' : 'failed',
                        created: generateRealisticTimestamp(seed + 2, 90),
                        customer: generateStripeId('cus_', Math.floor(seededRandom(seed + 3) * counts.customers))
                    };
                }),
                subscriptions: Array.from({length: Math.min(sampleSize, counts.subscriptions)}, (_, i) => {
                    const seed = i * 3000;
                    const subAmountRange = patterns.subscriptionAmountMax - patterns.subscriptionAmountMin;
                    const amount = patterns.subscriptionAmountMax > 0 
                        ? Math.floor(seededRandom(seed + 2) * subAmountRange) + patterns.subscriptionAmountMin
                        : Math.floor(seededRandom(seed + 2) * 5000) + 1000;
                    return {
                        id: generateStripeId('sub_', seed),
                        customer: generateStripeId('cus_', Math.floor(seededRandom(seed) * counts.customers)),
                        status: seededRandom(seed + 1) < 0.8 ? 'active' : 'canceled',
                        amount: amount,
                        interval: 'month',
                        created: generateRealisticTimestamp(seed + 3, 180)
                    };
                }),
                invoices: Array.from({length: Math.min(sampleSize, counts.invoices)}, (_, i) => {
                    const seed = i * 4000;
                    return {
                        id: generateStripeId('in_', seed),
                        customer: generateStripeId('cus_', Math.floor(seededRandom(seed) * counts.customers)),
                        amount_due: Math.floor(seededRandom(seed + 1) * 8000) + 2000,
                        currency: 'usd',
                        status: seededRandom(seed + 2) < 0.85 ? 'paid' : 'open',
                        created: generateRealisticTimestamp(seed + 3, 60)
                    };
                }),
                plans: Array.from({length: Math.min(sampleSize, counts.plans)}, (_, i) => {
                    const seed = i * 5000;
                    const planNames = ['Basic', 'Professional', 'Business', 'Enterprise', 'Team'];
                    return {
                        id: generateStripeId('plan_', seed),
                        name: planNames[i % planNames.length],
                        amount: Math.floor(seededRandom(seed) * 5000) + 1000,
                        interval: seededRandom(seed + 1) < 0.8 ? 'month' : 'year',
                        currency: 'usd',
                        created: generateRealisticTimestamp(seed + 2, 365)
                    };
                }),`;

// Replace the beginning of updateDatasetStructure function
content = content.replace(
    /\/\/ Update dataset structure display \(EXACT SAME AS ORIGINAL NEXT-APP\)[\s\S]*?plans: Array\.from\(\{length: Math\.min\(sampleSize, counts\.plans\)\}, \(_, i\) => \{[\s\S]*?\}\),/,
    enhancedUpdateDatasetStructure
);

// 4. Add custom analysis usage in updateIncludedMetrics
const enhancedUpdateIncludedMetrics = `
        // Update included metrics display (EXACT SAME AS ORIGINAL NEXT-APP)
        function updateIncludedMetrics(businessType, stage, customAnalysis = null) {
            console.log('updateIncludedMetrics called with businessType:', businessType, 'stage:', stage, 'customAnalysis:', customAnalysis);
            
            const sampleData = generateSampleData(businessType, stage);
            console.log('Sample data generated:', sampleData);
            
            // Use custom analysis if available
            let displayBusinessType = businessType;
            if (customAnalysis) {
                displayBusinessType = customAnalysis.businessContext.type.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace('b2b-saas-subscriptions', 'b2b-saas-subscriptions')
                    .replace('checkout-e-commerce', 'checkout-ecommerce')
                    .replace('food-delivery-platform', 'food-delivery-platform')
                    .replace('consumer-fitness-app', 'consumer-fitness-app')
                    .replace('b2b-invoicing', 'b2b-invoicing')
                    .replace('property-management-platform', 'property-management-platform')
                    .replace('creator-platform', 'creator-platform')
                    .replace('donation-marketplace', 'donation-marketplace');
                
                console.log('Using custom analysis for metrics, displayBusinessType:', displayBusinessType);
            }
            
            const includedMetrics = getIncludedMetrics(sampleData, displayBusinessType, stage);
            console.log('Included metrics:', includedMetrics);
            const container = document.getElementById('included-metrics-section');
            
            container.innerHTML = \`
                <div class="mb-8">
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">Included metrics</h3>
                    <div class="space-y-3">
                        \${includedMetrics.map(metric => \`
                            <div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                                <span class="text-sm font-medium text-gray-900">\${metric}</span>
                                <span class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-lg">
                                    Available
                                </span>
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \`;
        }`;

// Replace the existing updateIncludedMetrics function
content = content.replace(
    /\/\/ Update included metrics display \(EXACT SAME AS ORIGINAL NEXT-APP\)[\s\S]*?console\.log\('updateIncludedMetrics completed'\);\s*\}/,
    enhancedUpdateIncludedMetrics
);

// Write the enhanced file
fs.writeFileSync('/Users/nicholasswanson/synthkit/index.html', content);

console.log('✅ Fixed function signatures and added custom analysis integration!');
console.log('🔧 Fixed issues:');
console.log('  - updateDatasetStructure now accepts customAnalysis parameter');
console.log('  - updateIncludedMetrics now accepts customAnalysis parameter');
console.log('  - Both functions now use custom analysis for business type detection');
console.log('  - Added logging to debug the integration');
console.log('  - Custom analysis now drives dataset structure and metrics');
