#!/usr/bin/env node

const fs = require('fs');

// Read the current HTML file
let content = fs.readFileSync('/Users/nicholasswanson/synthkit/index.html', 'utf8');

// 1. Add analysis display section after line 89 (after custom scenario div)
const analysisDisplayHTML = `
                    <!-- AI Analysis Reasoning (only for custom scenarios) -->
                    <div id="analysis-reasoning" class="hidden mt-4 p-4 rounded-xl" style="background-color: #FFF4F0;">
                        <h4 class="text-sm font-medium mb-2" style="color: #DB4F0B;">
                            ✅ Analysis Complete
                        </h4>
                        <div id="analysis-content" class="text-sm" style="color: #B83D08;">
                            <!-- Analysis content will be populated here -->
                        </div>
                    </div>
`;

// Insert the analysis display section after the custom scenario div
content = content.replace(
    '                    </div>\n                </div>\n\n                <!-- Settings -->',
    `                    </div>${analysisDisplayHTML}
                </div>

                <!-- Settings -->`
);

// 2. Replace the generateCustomScenarioFromPrompt function with enhanced version
const enhancedGenerateFunction = `
        // Custom scenario generation functions with comprehensive analysis
        function generateCustomScenarioFromPrompt(prompt) {
            // Comprehensive AI-like analysis based on prompt
            const promptLower = prompt.toLowerCase();
            
            // Determine business type from keywords with confidence scoring
            let businessType = 'checkout-ecommerce';
            let confidence = 0.7;
            let reasoning = [];
            
            if (promptLower.includes('saas') || promptLower.includes('software') || promptLower.includes('b2b') || promptLower.includes('subscription')) {
                businessType = 'b2b-saas-subscriptions';
                confidence = 0.9;
                reasoning.push('Detected SaaS/subscription business model from keywords');
            } else if (promptLower.includes('food') || promptLower.includes('delivery') || promptLower.includes('restaurant') || promptLower.includes('meal')) {
                businessType = 'food-delivery-platform';
                confidence = 0.9;
                reasoning.push('Identified food delivery business from context');
            } else if (promptLower.includes('fitness') || promptLower.includes('workout') || promptLower.includes('health') || promptLower.includes('gym')) {
                businessType = 'consumer-fitness-app';
                confidence = 0.9;
                reasoning.push('Recognized fitness/health application pattern');
            } else if (promptLower.includes('invoice') || promptLower.includes('billing') || promptLower.includes('payment') || promptLower.includes('finance')) {
                businessType = 'b2b-invoicing';
                confidence = 0.8;
                reasoning.push('Detected invoicing/billing business focus');
            } else if (promptLower.includes('property') || promptLower.includes('rental') || promptLower.includes('real estate') || promptLower.includes('landlord')) {
                businessType = 'property-management-platform';
                confidence = 0.9;
                reasoning.push('Identified property management business model');
            } else if (promptLower.includes('creator') || promptLower.includes('content') || promptLower.includes('influencer') || promptLower.includes('media')) {
                businessType = 'creator-platform';
                confidence = 0.8;
                reasoning.push('Recognized creator economy platform');
            } else if (promptLower.includes('donation') || promptLower.includes('charity') || promptLower.includes('nonprofit') || promptLower.includes('fundraising')) {
                businessType = 'donation-marketplace';
                confidence = 0.9;
                reasoning.push('Detected donation/charity business model');
            } else {
                reasoning.push('Using default e-commerce model for general business');
            }
            
            // Determine stage from keywords
            let stage = 'growth';
            if (promptLower.includes('startup') || promptLower.includes('early') || promptLower.includes('mvp') || promptLower.includes('new')) {
                stage = 'early';
                reasoning.push('Identified early-stage business from context');
            } else if (promptLower.includes('enterprise') || promptLower.includes('large') || promptLower.includes('corporate') || promptLower.includes('established')) {
                stage = 'enterprise';
                reasoning.push('Detected enterprise-level business scale');
            } else {
                reasoning.push('Assuming growth-stage business');
            }
            
            // Generate comprehensive analysis
            const analysis = generateComprehensiveAnalysis(prompt, businessType, stage, confidence, reasoning);
            
            // Generate a custom scenario ID
            const scenarioId = Math.floor(Math.random() * 900000) + 100000;
            
            return {
                id: \`custom-\${scenarioId}\`,
                name: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
                businessType,
                stage,
                prompt,
                scenarioId,
                analysis
            };
        }
        
        function generateComprehensiveAnalysis(prompt, businessType, stage, confidence, reasoning) {
            const persona = PREDEFINED_PERSONAS[businessType];
            
            // Generate realistic business context
            const businessContext = {
                type: persona.name,
                stage: stage,
                primaryFeatures: persona.keyFeatures.slice(0, 4),
                targetAudience: persona.businessContext.targetAudience || ['General Users'],
                monetizationModel: persona.businessContext.monetizationModel || 'Subscription'
            };
            
            // Generate entities based on business type
            const entities = persona.entities.map(entity => ({
                name: entity.name,
                type: entity.type,
                relationships: entity.properties ? entity.properties.map(p => p.name) : [],
                estimatedVolume: generateVolumeEstimate(businessType, stage)
            }));
            
            // Generate user roles
            const userRoles = persona.userRoles.map(role => role.name);
            
            // Generate key features
            const keyFeatures = persona.keyFeatures;
            
            return {
                businessContext,
                entities,
                userRoles,
                keyFeatures,
                confidence,
                reasoning,
                processingTime: Math.floor(Math.random() * 500) + 200
            };
        }
        
        function generateVolumeEstimate(businessType, stage) {
            const stageMultipliers = { early: 0.1, growth: 1.0, enterprise: 20.0 };
            const baseVolumes = {
                'checkout-ecommerce': 25000,
                'b2b-saas-subscriptions': 5000,
                'food-delivery-platform': 15000,
                'consumer-fitness-app': 8000,
                'b2b-invoicing': 3000,
                'property-management-platform': 2000,
                'creator-platform': 12000,
                'donation-marketplace': 1500
            };
            
            const baseVolume = baseVolumes[businessType] || 10000;
            const multiplier = stageMultipliers[stage] || 1.0;
            const estimatedVolume = Math.floor(baseVolume * multiplier);
            
            return \`\${estimatedVolume.toLocaleString()} records\`;
        }
        
        function displayAnalysisReasoning(analysis, prompt) {
            const analysisSection = document.getElementById('analysis-reasoning');
            const analysisContent = document.getElementById('analysis-content');
            
            if (!analysisSection || !analysisContent) return;
            
            // Show the analysis section
            analysisSection.classList.remove('hidden');
            
            // Populate analysis content
            analysisContent.innerHTML = \`
                <p class="mb-2">
                    This appears to be a <strong>\${analysis.businessContext.type}</strong> in the <strong>\${analysis.businessContext.stage}</strong> stage. Key features include \${analysis.keyFeatures.slice(0, 3).join(', ')}, targeting \${analysis.businessContext.targetAudience.slice(0, 2).join(' and ')}.
                </p>
                <div class="mt-2 text-xs">
                    <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        Confidence: \${Math.round(analysis.confidence * 100)}%
                    </span>
                    <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded ml-2">
                        Processing: \${analysis.processingTime}ms
                    </span>
                </div>
                <div class="mt-2">
                    <strong>Reasoning:</strong>
                    <ul class="mt-1 space-y-1">
                        \${analysis.reasoning.map(reason => \`<li class="text-xs">• \${reason}</li>\`).join('')}
                    </ul>
                </div>
                <div class="mt-2">
                    <strong>Data Entities:</strong>
                    <ul class="mt-1 space-y-1">
                        \${analysis.entities.map(entity => \`<li class="text-xs">• \${entity.name} (\${entity.type}) - \${entity.estimatedVolume}</li>\`).join('')}
                    </ul>
                </div>
            \`;
        }
        
        function hideAnalysisReasoning() {
            const analysisSection = document.getElementById('analysis-reasoning');
            if (analysisSection) {
                analysisSection.classList.add('hidden');
            }
        }
`;

// Replace the existing function
content = content.replace(
    /\/\/ Custom scenario generation functions[\s\S]*?function updateScenarioSelectWithCustom/,
    enhancedGenerateFunction + '\n        function updateScenarioSelectWithCustom'
);

// 3. Enhance the click handler to show analysis and generate comprehensive data
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

// 4. Enhance updateConfiguration to handle custom scenarios and hide analysis when switching
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
            
            // Handle custom scenarios
            let businessType = selectedScenario;
            if (selectedScenario.startsWith('custom-')) {
                // For custom scenarios, we need to determine the business type
                // This would be stored when the custom scenario was created
                // For now, we'll use a default mapping or try to extract from the option text
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
            
            console.log('Business type:', businessType, 'Stage:', stage);
            
            console.log('Calling updateStripeProducts');
            updateStripeProducts(businessType, stage);
            console.log('Calling updateDatasetStructure');
            updateDatasetStructure(businessType, stage);
            console.log('Calling updateIncludedMetrics');
            updateIncludedMetrics(businessType, stage);
            
            // Update integration prompts with new scenario data
            console.log('Updating integration prompts');
            updateIntegrationPromptsForScenario(businessType, stage);
            

            
            console.log('updateConfiguration completed');
        }`;

// Replace the existing updateConfiguration function
content = content.replace(
    /\/\/ Update display when configuration changes[\s\S]*?console\.log\('updateConfiguration completed'\);\s*\}/,
    enhancedUpdateConfiguration
);

// Write the enhanced file
fs.writeFileSync('/Users/nicholasswanson/synthkit/index.html', content);

console.log('✅ Enhanced custom scenario functionality added successfully!');
console.log('🔧 Added features:');
console.log('  - Analysis display section with confidence scores');
console.log('  - Comprehensive business analysis generation');
console.log('  - Visual feedback during analysis process');
console.log('  - Entity and volume estimation');
console.log('  - Reasoning display with processing time');
console.log('  - Integration with existing data generation system');
