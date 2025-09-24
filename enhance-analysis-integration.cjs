#!/usr/bin/env node

const fs = require('fs');

// Read the current HTML file
let content = fs.readFileSync('/Users/nicholasswanson/synthkit/index.html', 'utf8');

// 1. Enhance updateConfiguration to use custom analysis data
const enhancedUpdateConfiguration = `
        // Update display when configuration changes
        function updateConfiguration() {
            console.log('updateConfiguration called');
            const selectedScenario = document.getElementById('scenario-select').value;
            const stage = document.getElementById('stage-select').value;
            
            // Hide analysis reasoning when switching away from custom scenarios
            if (!selectedScenario.startsWith('custom-')) {
                hideAnalysisReasoning();
            }
            
            // Handle custom scenarios with analysis data
            let businessType = selectedScenario;
            let customAnalysis = null;
            
            if (selectedScenario.startsWith('custom-')) {
                // Use stored custom analysis if available
                customAnalysis = window.currentCustomAnalysis;
                
                if (customAnalysis) {
                    // Extract business type from analysis
                    businessType = customAnalysis.businessContext.type.toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace('b2b-saas-subscriptions', 'b2b-saas-subscriptions')
                        .replace('checkout-e-commerce', 'checkout-ecommerce')
                        .replace('food-delivery-platform', 'food-delivery-platform')
                        .replace('consumer-fitness-app', 'consumer-fitness-app')
                        .replace('b2b-invoicing', 'b2b-invoicing')
                        .replace('property-management-platform', 'property-management-platform')
                        .replace('creator-platform', 'creator-platform')
                        .replace('donation-marketplace', 'donation-marketplace');
                    
                    console.log('Using custom analysis:', customAnalysis);
                    console.log('Detected business type from analysis:', businessType);
                } else {
                    // Fallback to keyword detection
                    const customOption = document.querySelector(\`option[value="\${selectedScenario}"]\`);
                    if (customOption) {
                        const optionText = customOption.textContent.toLowerCase();
                        if (optionText.includes('saas') || optionText.includes('software') || optionText.includes('b2b')) {
                            businessType = 'b2b-saas-subscriptions';
                        } else if (optionText.includes('food') || optionText.includes('delivery') || optionText.includes('restaurant')) {
                            businessType = 'food-delivery-platform';
                        } else if (optionText.includes('fitness') || optionText.includes('workout') || optionText.includes('health')) {
                            businessType = 'consumer-fitness-app';
                        } else if (optionText.includes('invoice') || optionText.includes('billing') || optionText.includes('payment')) {
                            businessType = 'b2b-invoicing';
                        } else if (optionText.includes('property') || optionText.includes('rental') || optionText.includes('real estate')) {
                            businessType = 'property-management-platform';
                        } else if (optionText.includes('creator') || optionText.includes('content') || optionText.includes('influencer')) {
                            businessType = 'creator-platform';
                        } else if (optionText.includes('donation') || optionText.includes('charity') || optionText.includes('nonprofit')) {
                            businessType = 'donation-marketplace';
                        } else {
                            businessType = 'checkout-ecommerce'; // default
                        }
                    } else {
                        businessType = 'checkout-ecommerce'; // fallback
                    }
                }
            }
            
            console.log('Business type:', businessType, 'Stage:', stage);
            
            // Store custom analysis for use in other functions
            window.currentCustomAnalysis = customAnalysis;
            
            console.log('Calling updateStripeProducts');
            updateStripeProducts(businessType, stage, customAnalysis);
            console.log('Calling updateDatasetStructure');
            updateDatasetStructure(businessType, stage, customAnalysis);
            console.log('Calling updateIncludedMetrics');
            updateIncludedMetrics(businessType, stage, customAnalysis);
            
            // Update integration prompts with new scenario data
            console.log('Updating integration prompts');
            updateIntegrationPromptsForScenario(businessType, stage, customAnalysis);
            

            
            console.log('updateConfiguration completed');
        }`;

// Replace the existing updateConfiguration function
content = content.replace(
    /\/\/ Update display when configuration changes[\s\S]*?console\.log\('updateConfiguration completed'\);\s*\}/,
    enhancedUpdateConfiguration
);

// 2. Enhance updateStripeProducts to use custom analysis
const enhancedUpdateStripeProducts = `
        // Update Stripe products display (EXACT SAME AS ORIGINAL NEXT-APP)
        function updateStripeProducts(businessType, stage, customAnalysis = null) {
            console.log('updateStripeProducts called with businessType:', businessType, 'stage:', stage);
            
            let stripeAnalysis;
            
            if (customAnalysis) {
                // Generate Stripe analysis from custom analysis
                stripeAnalysis = generateStripeAnalysisFromCustom(customAnalysis, businessType);
            } else {
                // Use predefined persona analysis
                stripeAnalysis = analyzeStripeProducts(PREDEFINED_PERSONAS[businessType]);
            }
            
            console.log('Stripe analysis:', stripeAnalysis);
            const container = document.getElementById('stripe-products-section');
            
            container.innerHTML = \`
                <div class="mb-8">
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">Stripe products</h3>
                    <div class="space-y-3">
                        \${stripeAnalysis.recommendedProducts.map((product, i) => \`
                            <div class="border-l-4 pl-4" style="border-left-color: #DB4F0B;">
                                <div class="font-medium text-gray-900">
                                    \${product.name}
                                </div>
                                <div class="text-sm text-gray-600 mb-1">\${product.description}</div>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-xl text-xs">
                                        Priority: \${product.priority}
                                    </span>
                                    \${product.dataObjects.map((obj, j) => \`
                                        <span key="\${j}" class="px-2 py-1 bg-gray-100 text-gray-800 rounded-xl text-xs">
                                            \${obj}
                                        </span>
                                    \`).join('')}
                                </div>
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \`;
        }
        
        function generateStripeAnalysisFromCustom(customAnalysis, businessType) {
            // Generate Stripe products based on custom analysis
            const businessContext = customAnalysis.businessContext;
            const keyFeatures = customAnalysis.keyFeatures;
            
            // Determine relevant Stripe products based on analysis
            const relevantProducts = [];
            
            // Always include Payments for any business
            relevantProducts.push({
                name: 'Payments',
                description: 'Accept payments online and in person',
                priority: 'Essential',
                dataObjects: ['charges', 'payment_intents', 'payment_methods']
            });
            
            // Add products based on business context and features
            if (businessContext.monetizationModel.toLowerCase().includes('subscription') || 
                keyFeatures.some(f => f.toLowerCase().includes('subscription'))) {
                relevantProducts.push({
                    name: 'Billing',
                    description: 'Manage subscriptions and recurring billing',
                    priority: 'Essential',
                    dataObjects: ['subscriptions', 'plans', 'invoices']
                });
            }
            
            if (businessContext.type.toLowerCase().includes('b2b') || 
                businessContext.type.toLowerCase().includes('saas')) {
                relevantProducts.push({
                    name: 'Connect',
                    description: 'Enable marketplace and platform payments',
                    priority: 'Recommended',
                    dataObjects: ['accounts', 'transfers', 'application_fees']
                });
            }
            
            if (businessContext.type.toLowerCase().includes('marketplace') || 
                keyFeatures.some(f => f.toLowerCase().includes('marketplace'))) {
                relevantProducts.push({
                    name: 'Connect',
                    description: 'Enable marketplace and platform payments',
                    priority: 'Essential',
                    dataObjects: ['accounts', 'transfers', 'application_fees']
                });
            }
            
            // Add Radar for fraud protection
            relevantProducts.push({
                name: 'Radar',
                description: 'Fraud prevention and risk management',
                priority: 'Recommended',
                dataObjects: ['radar_early_fraud_warnings', 'disputes']
            });
            
            // Add Tax for businesses that need tax calculation
            if (businessContext.type.toLowerCase().includes('ecommerce') || 
                businessContext.type.toLowerCase().includes('retail')) {
                relevantProducts.push({
                    name: 'Tax',
                    description: 'Automated tax calculation and reporting',
                    priority: 'Recommended',
                    dataObjects: ['tax_rates', 'tax_transactions']
                });
            }
            
            return {
                recommendedProducts: relevantProducts,
                allDataObjects: relevantProducts.flatMap(p => p.dataObjects)
            };
        }`;

// Replace the existing updateStripeProducts function
content = content.replace(
    /\/\/ Update Stripe products display \(EXACT SAME AS ORIGINAL NEXT-APP\)[\s\S]*?console\.log\('updateStripeProducts completed'\);\s*\}/,
    enhancedUpdateStripeProducts
);

// 3. Enhance updateIntegrationPromptsForScenario to use custom analysis
const enhancedUpdateIntegrationPrompts = `
        // Update integration prompts when scenario changes
        function updateIntegrationPromptsForScenario(businessType, stage, customAnalysis = null) {
            // Generate new counts and metrics for the current scenario
            const counts = getRealisticCounts(businessType, stage);
            const patterns = getPersonaPatterns(businessType);
            const comprehensiveDataset = generateComprehensiveDataset(businessType, stage, counts, patterns);
            const includedMetrics = getIncludedMetrics(comprehensiveDataset, businessType, stage);
            
            // Generate new filename for the updated scenario
            const scenarioId = document.getElementById('scenario-id').value;
            const animals = ['cheetah', 'lion', 'eagle', 'tiger', 'wolf', 'bear', 'shark', 'dolphin', 'panther', 'leopard', 'jaguar', 'lynx', 'bobcat', 'cougar', 'puma', 'falcon', 'hawk', 'owl', 'raven', 'crow', 'swan', 'heron', 'egret', 'fox', 'coyote', 'jackal', 'hyena', 'mongoose', 'weasel', 'otter', 'seal', 'walrus', 'whale', 'orca', 'narwhal', 'beluga', 'elephant', 'rhino', 'hippo', 'giraffe', 'zebra', 'antelope', 'gazelle', 'buffalo', 'bison', 'yak', 'camel', 'llama', 'alpaca', 'deer'];
            const timestamp = Date.now().toString().slice(-6);
            const animal1 = animals[scenarioId % animals.length];
            const animal2 = animals[(scenarioId * 7) % animals.length];
            const filename = \`\${animal1}-\${animal2}-\${scenarioId}-\${timestamp}.json\`;
            
            // Create new dataset URL
            const datasetJson = JSON.stringify(comprehensiveDataset, null, 2);
            const blob = new Blob([datasetJson], { type: 'application/json' });
            currentDatasetUrl = URL.createObjectURL(blob);
            
            // Update currentDatasetInfo with new scenario data
            currentDatasetInfo = {
                recordCounts: counts,
                includedMetrics: includedMetrics,
                businessType: businessType,
                stage: stage,
                filename: filename,
                customAnalysis: customAnalysis // Include custom analysis in dataset info
            };
            
            // Update the URL input field
            const urlInput = document.getElementById('url-input');
            if (urlInput) {
                urlInput.value = currentDatasetUrl;
            }
            
            // Update the integration content with the new data
            updateIntegrationContent('cursor');
        }`;

// Replace the existing updateIntegrationPromptsForScenario function
content = content.replace(
    /\/\/ Update integration prompts when scenario changes[\s\S]*?updateIntegrationContent\('cursor'\);\s*\}/,
    enhancedUpdateIntegrationPrompts
);

// Write the enhanced file
fs.writeFileSync('/Users/nicholasswanson/synthkit/index.html', content);

console.log('✅ Enhanced analysis integration successfully!');
console.log('🔧 Added features:');
console.log('  - Custom analysis data integration with dataset generation');
console.log('  - Dynamic Stripe products based on analysis');
console.log('  - Custom business type detection from analysis');
console.log('  - Enhanced integration prompts with analysis data');
console.log('  - Seamless connection between analysis and left panel updates');
