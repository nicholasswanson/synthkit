#!/usr/bin/env node

const fs = require('fs');

// Read the current HTML file
let content = fs.readFileSync('/Users/nicholasswanson/synthkit/index.html', 'utf8');

// Fix the business type extraction logic in updateConfiguration
const fixedUpdateConfiguration = `
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
                    // The business type is already stored correctly in the custom scenario
                    // We just need to get it from the stored analysis or use the stored business type
                    console.log('Using custom analysis:', customAnalysis);
                    
                    // Try to get the business type from the stored custom scenario data
                    // The business type should be stored when the custom scenario was created
                    const customOption = document.querySelector(\`option[value="\${selectedScenario}"]\`);
                    if (customOption) {
                        // Extract business type from the stored custom scenario
                        // We need to get this from the original custom scenario generation
                        const storedCustomScenario = window.currentCustomScenario;
                        if (storedCustomScenario && storedCustomScenario.businessType) {
                            businessType = storedCustomScenario.businessType;
                            console.log('Using stored business type from custom scenario:', businessType);
                        } else {
                            // Fallback: try to extract from analysis business context
                            const analysisType = customAnalysis.businessContext.type.toLowerCase();
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
                    }
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
    fixedUpdateConfiguration
);

// Also need to store the custom scenario data when it's created
const enhancedClickHandler = `
            generateCustomBtn.addEventListener('click', async () => {
                const customPrompt = customScenarioInput.value.trim();
                if (!customPrompt) return;
                
                // Show loading state
                generateCustomBtn.disabled = true;
                generateCustomBtn.textContent = 'Analyzing...';
                
                try {
                    // Simulate processing time
                    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
                    
                    // Generate a custom scenario based on the prompt
                    const customScenario = generateCustomScenarioFromPrompt(customPrompt);
                    
                    // Store the custom scenario data globally for later use
                    window.currentCustomScenario = customScenario;
                    
                    // Display the analysis reasoning
                    displayAnalysisReasoning(customScenario.analysis, customPrompt);
                    
                    // Update the scenario select to show the custom option
                    updateScenarioSelectWithCustom(customScenario);
                    
                    // Update the configuration with the custom scenario
                    updateConfigurationWithCustom(customScenario);
                    
                    // Store the custom scenario analysis for later use
                    window.currentCustomAnalysis = customScenario.analysis;
                    
                    // Clear the input
                    customScenarioInput.value = '';
                    generateCustomBtn.disabled = true;
                    
                } catch (error) {
                    console.error('Custom scenario generation failed:', error);
                    alert('Failed to generate custom scenario. Please try again.');
                } finally {
                    generateCustomBtn.textContent = 'Generate';
                }
            });`;

// Replace the existing click handler
content = content.replace(
    /generateCustomBtn\.addEventListener\('click', async \(\) => \{[\s\S]*?\}\);/,
    enhancedClickHandler
);

// Write the enhanced file
fs.writeFileSync('/Users/nicholasswanson/synthkit/index.html', content);

console.log('✅ Fixed business type extraction for custom scenarios!');
console.log('🔧 Fixed issues:');
console.log('  - Store custom scenario data globally when created');
console.log('  - Use stored business type directly instead of converting display name');
console.log('  - Added fallback extraction from analysis business context');
console.log('  - Enhanced logging to debug business type detection');
console.log('  - Custom scenarios now properly use their detected business type');
