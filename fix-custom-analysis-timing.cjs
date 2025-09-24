#!/usr/bin/env node

const fs = require('fs');

// Read the current HTML file
let content = fs.readFileSync('/Users/nicholasswanson/synthkit/index.html', 'utf8');

// Fix the timing issue in the custom scenario click handler
const fixedClickHandler = `
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
                    
                    // Store the custom scenario analysis for later use FIRST
                    window.currentCustomAnalysis = customScenario.analysis;
                    
                    console.log('Stored custom analysis:', window.currentCustomAnalysis);
                    console.log('Stored custom scenario:', window.currentCustomScenario);
                    
                    // Display the analysis reasoning
                    displayAnalysisReasoning(customScenario.analysis, customPrompt);
                    
                    // Update the scenario select to show the custom option
                    updateScenarioSelectWithCustom(customScenario);
                    
                    // Update the configuration with the custom scenario
                    updateConfigurationWithCustom(customScenario);
                    
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
    fixedClickHandler
);

// Write the enhanced file
fs.writeFileSync('/Users/nicholasswanson/synthkit/index.html', content);

console.log('✅ Fixed custom analysis timing issue!');
console.log('🔧 Fix applied:');
console.log('  - Store window.currentCustomAnalysis BEFORE calling updateConfigurationWithCustom');
console.log('  - Added logging to verify data storage');
console.log('  - Ensures custom analysis is available when updateConfiguration runs');
console.log('  - Should resolve the "customAnalysis: null" issue');
