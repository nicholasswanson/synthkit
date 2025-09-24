#!/usr/bin/env node

const fs = require('fs');

// Read the current HTML file
let content = fs.readFileSync('/Users/nicholasswanson/synthkit/index.html', 'utf8');

// Add comprehensive debugging to updateConfiguration
const debugUpdateConfiguration = `
        // Update display when configuration changes
        function updateConfiguration() {
            console.log('updateConfiguration called');
            const selectedScenario = document.getElementById('scenario-select').value;
            const stage = document.getElementById('stage-select').value;
            
            console.log('Selected scenario:', selectedScenario);
            console.log('Selected stage:', stage);
            console.log('Starts with custom-:', selectedScenario.startsWith('custom-'));
            console.log('window.currentCustomAnalysis:', window.currentCustomAnalysis);
            console.log('window.currentCustomScenario:', window.currentCustomScenario);
            
            // Hide analysis reasoning when switching away from custom scenarios
            if (!selectedScenario.startsWith('custom-')) {
                hideAnalysisReasoning();
            }
            
            // Handle custom scenarios with analysis data
            let businessType = selectedScenario;
            let customAnalysis = null;
            
            if (selectedScenario.startsWith('custom-')) {
                console.log('Processing custom scenario...');
                
                // Use stored custom analysis if available
                customAnalysis = window.currentCustomAnalysis;
                console.log('Retrieved customAnalysis:', customAnalysis);
                
                if (customAnalysis) {
                    console.log('Custom analysis found, extracting business type...');
                    
                    // Try to get the business type from the stored custom scenario data
                    const storedCustomScenario = window.currentCustomScenario;
                    console.log('Stored custom scenario:', storedCustomScenario);
                    
                    if (storedCustomScenario && storedCustomScenario.businessType) {
                        businessType = storedCustomScenario.businessType;
                        console.log('Using stored business type from custom scenario:', businessType);
                    } else {
                        console.log('No stored custom scenario found, using fallback extraction...');
                        
                        // Fallback: try to extract from analysis business context
                        const analysisType = customAnalysis.businessContext.type.toLowerCase();
                        console.log('Analysis business context type:', analysisType);
                        
                        if (analysisType.includes('b2b') && analysisType.includes('saas')) {
                            businessType = 'b2b-saas-subscriptions';
                        } else if (analysisType.includes('food') || analysisType.includes('delivery')) {
                            businessType = 'food-delivery-platform';
                        } else if (analysisType.includes('fitness') || analysisType.includes('health')) {
                            businessType = 'consumer-fitness-app';
                        } else if (analysisType.includes('invoice') || analysisType.includes('billing')) {
                            businessType = 'b2b-invoicing';
                        } else if (analysisType.includes('property') || analysisType.includes('rental')) {
                            businessType = 'property-management-platform';
                        } else if (analysisType.includes('creator') || analysisType.includes('content')) {
                            businessType = 'creator-platform';
                        } else if (analysisType.includes('donation') || analysisType.includes('charity')) {
                            businessType = 'donation-marketplace';
                        } else {
                            businessType = 'checkout-ecommerce'; // default
                        }
                        console.log('Extracted business type from analysis:', businessType);
                    }
                } else {
                    console.log('No custom analysis found, using fallback keyword detection...');
                    
                    // Fallback to keyword detection
                    const customOption = document.querySelector(\`option[value="\${selectedScenario}"]\`);
                    console.log('Custom option element:', customOption);
                    
                    if (customOption) {
                        const optionText = customOption.textContent.toLowerCase();
                        console.log('Option text:', optionText);
                        
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
                        console.log('Extracted business type from option text:', businessType);
                    } else {
                        businessType = 'checkout-ecommerce'; // fallback
                        console.log('No custom option found, using default:', businessType);
                    }
                }
            } else {
                console.log('Not a custom scenario, using selected scenario as business type:', businessType);
            }
            
            console.log('Final business type:', businessType, 'Stage:', stage);
            console.log('Final custom analysis:', customAnalysis);
            
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
    debugUpdateConfiguration
);

// Write the enhanced file
fs.writeFileSync('/Users/nicholasswanson/synthkit/index.html', content);

console.log('✅ Added comprehensive debugging to custom scenario detection!');
console.log('🔧 Debug features added:');
console.log('  - Logs selected scenario and stage');
console.log('  - Logs whether scenario starts with custom-');
console.log('  - Logs window.currentCustomAnalysis and window.currentCustomScenario');
console.log('  - Logs each step of business type extraction');
console.log('  - Logs final business type and custom analysis');
console.log('  - Helps identify where the custom scenario detection is failing');
