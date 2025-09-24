import fs from 'fs';

// Read the current index.html
let content = fs.readFileSync('index.html', 'utf8');

// Add realistic name generation functions
const realisticNameFunctions = `
        // Generate realistic names and emails based on persona
        function generateRealisticName(seed, businessType) {
            const names = {
                'checkout-ecommerce': ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim', 'Lisa Wang'],
                'b2b-saas-subscriptions': ['TechCorp Solutions', 'DataFlow Inc', 'CloudSync Ltd', 'InnovateTech Corp', 'NextGen Systems'],
                'food-delivery-platform': ['John Smith', 'Maria Garcia', 'Alex Thompson', 'Jessica Lee', 'Robert Brown'],
                'consumer-fitness-app': ['FitLife User', 'GymBuddy Member', 'HealthTracker Pro', 'WorkoutWarrior', 'FitnessFanatic'],
                'b2b-invoicing': ['InvoicePro Client', 'BillMaster Corp', 'PayFlow Business', 'InvoiceTech Ltd', 'BillingSolutions Inc'],
                'property-management-platform': ['PropertyOwner LLC', 'RealEstate Group', 'RentalManager Corp', 'PropertyTech Inc', 'LandlordPro Ltd'],
                'creator-platform': ['ContentCreator Pro', 'InfluencerMax', 'CreatorStudio', 'DigitalArtist', 'MediaMaker'],
                'donation-marketplace': ['CharitySupporter', 'DonorHero', 'GivingHeart', 'CauseChampion', 'ImpactMaker']
            };
            const personaNames = names[businessType] || names['b2b-saas-subscriptions'];
            return personaNames[seed % personaNames.length];
        }
        
        function generateRealisticEmail(seed, businessType) {
            const domains = {
                'checkout-ecommerce': ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'],
                'b2b-saas-subscriptions': ['techcorp.com', 'dataflow.io', 'cloudsync.co', 'innovatetech.net'],
                'food-delivery-platform': ['gmail.com', 'yahoo.com', 'hotmail.com'],
                'consumer-fitness-app': ['fitlife.com', 'gymbuddy.app', 'healthtracker.io'],
                'b2b-invoicing': ['invoicepro.com', 'billmaster.co', 'payflow.biz'],
                'property-management-platform': ['propertyowner.com', 'realestate.group', 'rentalmanager.co'],
                'creator-platform': ['creatorpro.com', 'influencermax.io', 'creatorstudio.app'],
                'donation-marketplace': ['charitysupporter.org', 'donorhero.com', 'givingheart.net']
            };
            const personaDomains = domains[businessType] || domains['b2b-saas-subscriptions'];
            const domain = personaDomains[seed % personaDomains.length];
            const name = generateRealisticName(seed, businessType).toLowerCase().replace(/[^a-z]/g, '');
            return \`\${name}\${seed}@\${domain}\`;
        }`;

// Insert the functions before the updateDatasetStructure function
content = content.replace(
    '        // Update dataset structure display (EXACT SAME AS ORIGINAL NEXT-APP)',
    realisticNameFunctions + '\n        // Update dataset structure display (EXACT SAME AS ORIGINAL NEXT-APP)'
);

// Replace hardcoded customer names
content = content.replace(
    'name: `Customer ${i + 1}`,',
    'name: generateRealisticName(seed, businessType),'
);

// Replace hardcoded customer emails
content = content.replace(
    'email: `customer${i + 1}@example.com`,',
    'email: generateRealisticEmail(seed, businessType),'
);

// Replace hardcoded plan names
content = content.replace(
    'name: `Plan ${i + 1}`,',
    'name: `${PREDEFINED_PERSONAS[businessType].name} Plan ${i + 1}`,'
);

// Write the corrected file
fs.writeFileSync('index-simple-fix.html', content);

console.log('✅ Created index-simple-fix.html with realistic persona-specific sample data');
