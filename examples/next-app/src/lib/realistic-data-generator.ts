// Realistic Data Generation Utilities
// Based on Stripe data schema and persona-specific business models

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address: Address;
  created: number;
  metadata: Record<string, string>;
  // Persona-specific fields
  loyaltyTier?: string;
  subscriptionTier?: string;
  industry?: string;
  companySize?: string;
  fitnessLevel?: string;
  therapyType?: string;
  propertyType?: string;
  monthlyRent?: number;
  donorType?: string;
  totalDonated?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  type: string;
  metadata: Record<string, string>;
  basePrice: number;
  category: string;
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  created: number;
  description: string;
  metadata: Record<string, string>;
  // Persona-specific fields
  productType?: string;
  category?: string;
  subscriptionTier?: string;
  sessionType?: string;
  paymentType?: string;
  donationType?: string;
}

// Realistic name generation
const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia', 'James', 'Isabella', 'Benjamin',
  'Charlotte', 'Lucas', 'Amelia', 'Henry', 'Mia', 'Alexander', 'Harper', 'Mason', 'Evelyn', 'Michael',
  'Abigail', 'Ethan', 'Emily', 'Daniel', 'Elizabeth', 'Jacob', 'Sofia', 'Logan', 'Avery', 'Jackson',
  'Ella', 'Levi', 'Madison', 'Sebastian', 'Scarlett', 'Mateo', 'Victoria', 'Jack', 'Aria', 'Owen',
  'Grace', 'Theodore', 'Chloe', 'Aiden', 'Camila', 'Samuel', 'Penelope', 'Joseph', 'Riley', 'John',
  'Layla', 'David', 'Lillian', 'Wyatt', 'Nora', 'Matthew', 'Zoey', 'Luke', 'Mila', 'Asher',
  'Aubrey', 'Carter', 'Hannah', 'Julian', 'Lily', 'Grayson', 'Addison', 'Leo', 'Eleanor', 'Jayden',
  'Natalie', 'Gabriel', 'Luna', 'Isaac', 'Savannah', 'Oliver', 'Brooklyn', 'Jonathan', 'Leah', 'Nicholas',
  'Zoe', 'Christopher', 'Stella', 'Andrew', 'Hazel', 'Joshua', 'Ellie', 'Caleb', 'Paisley', 'Ryan'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
  'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson'
];

// Realistic address data
const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego',
  'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco',
  'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit',
  'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque'
];

const STATES = [
  'NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA', 'TX', 'FL', 'TX', 'OH', 'NC', 'CA',
  'IN', 'WA', 'CO', 'DC', 'MA', 'TX', 'TN', 'MI', 'OK', 'OR', 'NV', 'TN', 'KY', 'MD', 'WI', 'NM'
];

// Seeded random number generator
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate realistic names
export function generateRealisticName(seed: number): { firstName: string; lastName: string; fullName: string } {
  const firstName = FIRST_NAMES[Math.floor(seededRandom(seed) * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(seededRandom(seed + 1) * LAST_NAMES.length)];
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`
  };
}

// Generate realistic email
export function generateRealisticEmail(firstName: string, lastName: string, seed: number): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'protonmail.com'];
  const domain = domains[Math.floor(seededRandom(seed) * domains.length)];
  const variations = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${Math.floor(seededRandom(seed + 1) * 99) + 1}`
  ];
  const email = variations[Math.floor(seededRandom(seed + 2) * variations.length)];
  return `${email}@${domain}`;
}

// Generate realistic phone number
export function generateRealisticPhone(seed: number): string {
  const areaCode = Math.floor(200 + seededRandom(seed) * 800); // 200-999
  const exchange = Math.floor(200 + seededRandom(seed + 1) * 800); // 200-999
  const number = Math.floor(seededRandom(seed + 2) * 10000); // 0000-9999
  return `(${areaCode}) ${exchange}-${number.toString().padStart(4, '0')}`;
}

// Generate realistic address
export function generateRealisticAddress(seed: number): Address {
  const streetNumbers = [123, 456, 789, 1001, 2345, 3456, 4567, 5678, 6789, 7890];
  const streetNames = [
    'Main St', 'Oak Ave', 'Pine St', 'Elm St', 'Maple Ave', 'Cedar St', 'First St', 'Second Ave',
    'Park Ave', 'Washington St', 'Lincoln Ave', 'Jefferson St', 'Madison Ave', 'Franklin St'
  ];
  const streetTypes = ['St', 'Ave', 'Rd', 'Blvd', 'Dr', 'Ln', 'Way', 'Ct'];
  
  const streetNumber = streetNumbers[Math.floor(seededRandom(seed) * streetNumbers.length)];
  const streetName = streetNames[Math.floor(seededRandom(seed + 1) * streetNames.length)];
  const streetType = streetTypes[Math.floor(seededRandom(seed + 2) * streetTypes.length)];
  
  const cityIndex = Math.floor(seededRandom(seed + 3) * CITIES.length);
  const city = CITIES[cityIndex];
  const state = STATES[cityIndex];
  
  const postalCode = Math.floor(10000 + seededRandom(seed + 4) * 90000); // 10000-99999
  
  return {
    line1: `${streetNumber} ${streetName} ${streetType}`,
    city,
    state,
    postal_code: postalCode.toString(),
    country: 'US'
  };
}

// Generate realistic amount (non-rounded)
export function generateRealisticAmount(seed: number, category: string, stage: string): number {
  const categoryRanges: Record<string, { min: number; max: number }> = {
    modaic: { min: 25.99, max: 299.99 },     // Fashion e-commerce
    stratus: { min: 49.00, max: 999.00 },    // B2B SaaS subscriptions
    forksy: { min: 12.50, max: 89.99 },      // Food delivery orders
    pulseon: { min: 19.99, max: 79.99 },     // Fitness subscriptions
    procura: { min: 500.00, max: 25000.00 }, // B2B procurement orders
    mindora: { min: 75.00, max: 200.00 },    // Therapy sessions
    keynest: { min: 800.00, max: 3500.00 },  // Property rent payments
    fluxly: { min: 150.00, max: 5000.00 },   // Supply chain logistics
    brightfund: { min: 10.00, max: 500.00 }  // Nonprofit donations
  };
  
  const range = categoryRanges[category] || categoryRanges.modaic;
  const baseAmount = range.min + seededRandom(seed) * (range.max - range.min);
  
  // Apply stage multiplier for more realistic scaling
  const stageMultipliers = {
    early: 0.7,
    growth: 1.0,
    enterprise: 1.4
  };
  
  const multiplier = stageMultipliers[stage as keyof typeof stageMultipliers] || 1.0;
  const finalAmount = baseAmount * multiplier;
  
  return Math.round(finalAmount * 100) / 100; // Round to 2 decimal places
}

// Generate realistic product descriptions
export function generateProductDescription(category: string, seed: number): string {
  const descriptions: Record<string, string[]> = {
    modaic: [
      'Premium cotton t-shirt with modern fit',
      'Designer denim jacket with vintage wash',
      'Elegant silk blouse for professional wear',
      'Comfortable sneakers with memory foam',
      'Classic leather handbag with gold hardware'
    ],
    stratus: [
      'Professional plan with advanced analytics',
      'Team collaboration tools and integrations',
      'Enterprise security and compliance features',
      'Custom API access and webhooks',
      'Priority support and dedicated account manager'
    ],
    forksy: [
      'Fresh Mediterranean bowl with quinoa',
      'Artisan pizza with local ingredients',
      'Gourmet burger with truffle fries',
      'Healthy smoothie bowl with acai',
      'Authentic Thai curry with jasmine rice'
    ],
    pulseon: [
      'Monthly unlimited workout access',
      'Personal training session package',
      'Nutrition consultation and meal planning',
      'Group fitness class membership',
      'Recovery and wellness spa treatment'
    ],
    procura: [
      'Medical supplies and equipment order',
      'Pharmaceutical inventory restock',
      'Laboratory testing and analysis',
      'Emergency medical equipment delivery',
      'Specialized healthcare consultation'
    ],
    mindora: [
      'Individual therapy session with licensed counselor',
      'Group therapy workshop for anxiety management',
      'Couples counseling session package',
      'Mindfulness and meditation course',
      'Crisis intervention and support services'
    ],
    keynest: [
      'Monthly rent payment for 2-bedroom apartment',
      'Security deposit for commercial space',
      'Property management service fee',
      'Maintenance and repair service',
      'Lease renewal and processing fee'
    ],
    fluxly: [
      'Supply chain optimization consultation',
      'Inventory management software license',
      'Logistics and shipping coordination',
      'Supplier relationship management',
      'Demand forecasting and analytics'
    ],
    brightfund: [
      'General fund donation for community programs',
      'Emergency relief fund contribution',
      'Educational scholarship fund donation',
      'Environmental conservation project support',
      'Healthcare access initiative funding'
    ]
  };
  
  const categoryDescriptions = descriptions[category] || descriptions.modaic;
  return categoryDescriptions[Math.floor(seededRandom(seed) * categoryDescriptions.length)];
}
