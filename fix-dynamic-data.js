import fs from 'fs';

// Read the current index.html
let content = fs.readFileSync('index.html', 'utf8');

// Fix the sample data generation to be persona-specific and realistic
const oldSampleDataGeneration = `            // Generate realistic Stripe data structure (sample only for display)
            const sampleSize = 3; // Only generate 3 examples of each type
            const stripeData = {
                customers: Array.from({length: Math.min(sampleSize, counts.customers)}, (_, i) => {
                    const seed = i * 1000;
                    return {
                        id: generateStripeId('cus_', seed),
                        name: \`Customer \${i + 1}\`,
                        email: \`customer\${i + 1}@example.com\`,
                        created: generateRealisticTimestamp(seed, 365),
                        status: 'active'
                    };
                }),
                charges: Array.from({length: Math.min(sampleSize, counts.charges)}, (_, i) => {
                    const seed = i * 2000;
                    return {
                        id: generateStripeId('ch_', seed),
                        amount: Math.floor(seededRandom(seed) * 10000) + 1000,
                        currency: 'usd',
                        status: seededRandom(seed + 1) < 0.9 ? 'succeeded' : 'failed',
                        created: generateRealisticTimestamp(seed + 2, 90),
                        customer: generateStripeId('cus_', Math.floor(seededRandom(seed + 3) * counts.customers))
                    };
                }),
                subscriptions: Array.from({length: Math.min(sampleSize, counts.subscriptions)}, (_, i) => {
                    const seed = i * 3000;
                    return {
                        id: generateStripeId('sub_', seed),
                        customer: generateStripeId('cus_', Math.floor(seededRandom(seed) * counts.customers)),
                        status: seededRandom(seed + 1) < 0.8 ? 'active' : 'canceled',
                        amount: Math.floor(seededRandom(seed + 2) * 5000) + 1000,
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
                        status: seededRandom(seed + 2) < 0.85 ? 'paid' : 'open',
                        currency: 'usd',
                        created: generateRealisticTimestamp(seed + 3, 60)
                    };
                }),
                plans: Array.from({length: Math.min(sampleSize, 5)}, (_, i) => {
                    const seed = i * 5000;
                    return {
                        id: generateStripeId('plan_', seed),
                        name: \`Plan \${i + 1}\`,
                        amount: Math.floor(seededRandom(seed) * 10000) + 1000,
                        currency: 'usd',
                        interval: seededRandom(seed + 1) < 0.7 ? 'month' : 'year',
                        created: generateRealisticTimestamp(seed + 2, 365)
                    };
                })
            };`;

const newSampleDataGeneration = `            // Generate realistic Stripe data structure (sample only for display)
            const sampleSize = 3; // Only generate 3 examples of each type
            const persona = PREDEFINED_PERSONAS[businessType];
            
            // Generate realistic names and emails based on persona
            const generateRealisticName = (seed, persona) => {
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
            };
            
            const generateRealisticEmail = (seed, persona) => {
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
                const name = generateRealisticName(seed, persona).toLowerCase().replace(/[^a-z]/g, '');
                return \`\${name}\${seed}@\${domain}\`;
            };
            
            const stripeData = {
                customers: Array.from({length: Math.min(sampleSize, counts.customers)}, (_, i) => {
                    const seed = i * 1000;
                    return {
                        id: generateStripeId('cus_', seed),
                        name: generateRealisticName(seed, persona),
                        email: generateRealisticEmail(seed, persona),
                        created: generateRealisticTimestamp(seed, 365),
                        status: 'active'
                    };
                }),
                charges: Array.from({length: Math.min(sampleSize, counts.charges)}, (_, i) => {
                    const seed = i * 2000;
                    const amount = Math.floor(seededRandom(seed) * 10000) + 1000;
                    return {
                        id: generateStripeId('ch_', seed),
                        amount: amount,
                        currency: 'usd',
                        status: seededRandom(seed + 1) < 0.9 ? 'succeeded' : 'failed',
                        created: generateRealisticTimestamp(seed + 2, 90),
                        customer: generateStripeId('cus_', Math.floor(seededRandom(seed + 3) * counts.customers))
                    };
                }),
                subscriptions: Array.from({length: Math.min(sampleSize, counts.subscriptions)}, (_, i) => {
                    const seed = i * 3000;
                    const amount = Math.floor(seededRandom(seed + 2) * 5000) + 1000;
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
                    const amount = Math.floor(seededRandom(seed + 1) * 8000) + 2000;
                    return {
                        id: generateStripeId('in_', seed),
                        customer: generateStripeId('cus_', Math.floor(seededRandom(seed) * counts.customers)),
                        amount_due: amount,
                        status: seededRandom(seed + 2) < 0.85 ? 'paid' : 'open',
                        currency: 'usd',
                        created: generateRealisticTimestamp(seed + 3, 60)
                    };
                }),
                plans: Array.from({length: Math.min(sampleSize, 5)}, (_, i) => {
                    const seed = i * 5000;
                    const amount = Math.floor(seededRandom(seed) * 10000) + 1000;
                    return {
                        id: generateStripeId('plan_', seed),
                        name: \`\${persona.name} Plan \${i + 1}\`,
                        amount: amount,
                        currency: 'usd',
                        interval: seededRandom(seed + 1) < 0.7 ? 'month' : 'year',
                        created: generateRealisticTimestamp(seed + 2, 365)
                    };
                })
            };`;

// Replace the old sample data generation with the new one
content = content.replace(oldSampleDataGeneration, newSampleDataGeneration);

// Write the corrected file
fs.writeFileSync('index-fixed.html', content);

console.log('✅ Created index-fixed.html with realistic persona-specific sample data');
