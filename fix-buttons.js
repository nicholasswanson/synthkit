import fs from 'fs';

// Read the current index.html
let content = fs.readFileSync('index.html', 'utf8');

console.log('🔧 Starting button modifications...');

// 1. Replace Update Dataset button with Copy URL button
console.log('📝 Replacing Update Dataset button with Copy URL button...');
content = content.replace(
    '<button id="update-dataset" class="px-3 py-2 text-sm font-medium rounded-xl transition-colors bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50" disabled>Update Dataset</button>',
    '<button id="copy-url" class="px-3 py-2 text-sm font-medium rounded-xl transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200">Copy URL</button>'
);

// 2. Remove change tracking logic from updateConfiguration function
console.log('🗑️ Removing change tracking logic from updateConfiguration...');
content = content.replace(
    `            // Check if changes have been made and enable/disable Update Dataset button
            const updateButton = document.getElementById('update-dataset');
            if (updateButton) {
                const hasChanges = (initialScenario !== null && initialStage !== null) && 
                                 (businessType !== initialScenario || stage !== initialStage);
                updateButton.disabled = !hasChanges;
            }`,
    ''
);

// 3. Remove change tracking variables
console.log('🗑️ Removing change tracking variables...');
content = content.replace(
    `        let currentDatasetUrl = null;
        let currentDatasetInfo = null;
        let initialScenario = null;
        let initialStage = null;`,
    `        let currentDatasetUrl = null;
        let currentDatasetInfo = null;`
);

// 4. Remove Update Dataset event listener
console.log('🗑️ Removing Update Dataset event listener...');
const updateDatasetListenerRegex = /\/\/ Update Dataset button[\s\S]*?updateIntegrationContent\('cursor'\);\s*\}\);/;
content = content.replace(updateDatasetListenerRegex, '');

// 5. Remove initial scenario/stage setting
console.log('🗑️ Removing initial scenario/stage setting...');
content = content.replace(
    `            // Set initial scenario and stage for change tracking
            initialScenario = defaultScenario;
            initialStage = defaultStage;`,
    ''
);

// 6. Add Copy URL event listener
console.log('➕ Adding Copy URL event listener with inline confirmation...');
const copyUrlListener = `
        // Copy URL with inline confirmation
        document.getElementById('copy-url').addEventListener('click', () => {
            navigator.clipboard.writeText(currentDatasetUrl).then(() => {
                const button = document.getElementById('copy-url');
                const originalText = button.textContent;
                
                // Show inline confirmation
                button.textContent = '✓ Copied!';
                button.className = button.className.replace('bg-blue-100 text-blue-700 hover:bg-blue-200', 'bg-green-100 text-green-700');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    button.textContent = originalText;
                    button.className = button.className.replace('bg-green-100 text-green-700', 'bg-blue-100 text-blue-700 hover:bg-blue-200');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                // Fallback for older browsers
                const button = document.getElementById('copy-url');
                button.textContent = '✗ Failed';
                setTimeout(() => {
                    button.textContent = 'Copy URL';
                }, 2000);
            });
        });`;

// Insert the Copy URL listener after the tab switching code
content = content.replace(
    '        });\n        \n        \n        \n        // Download dataset functionality removed - no longer needed',
    `        });\n        \n        ${copyUrlListener}\n        \n        // Download dataset functionality removed - no longer needed`
);

// Write the modified content back to index.html
fs.writeFileSync('index.html', content);

console.log('✅ All button modifications completed successfully!');
console.log('📋 Changes made:');
console.log('   • Replaced Update Dataset button with Copy URL button');
console.log('   • Removed change tracking logic and variables');
console.log('   • Removed Update Dataset event listener');
console.log('   • Added Copy URL event listener with inline confirmation');
console.log('   • Cleaned up unused code');
console.log('');
console.log('🎯 The Copy URL button will now:');
console.log('   • Copy the blob URL to clipboard');
console.log('   • Show "✓ Copied!" confirmation inline');
console.log('   • Turn green temporarily to indicate success');
console.log('   • Reset after 2 seconds back to normal state');
console.log('   • Handle errors gracefully with fallback messaging');
