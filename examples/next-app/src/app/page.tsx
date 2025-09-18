'use client';

import { useState, useEffect, useRef } from 'react';
import { AnalysisResult } from '@/app/components/AIComponents';
import { DatasetShareModal } from '@/components/DatasetShareModal';
import { useDatasetCreation } from '@/hooks/useDatasetCreation';
import { Copy, Download, ExternalLink } from 'lucide-react';
import { generateAllIntegrations } from '@/lib/ai-integrations';
import { downloadCursorRules } from '@/lib/cursor-rules-generator';
import { downloadReactHook } from '@/lib/react-hook-generator';
import { 
  generateRealisticName, 
  generateRealisticEmail, 
  generateRealisticPhone, 
  generateRealisticAddress,
  generateRealisticAmount,
  generateProductDescription,
  seededRandom,
  type Customer,
  type Payment,
  type Address
} from '@/lib/realistic-data-generator';
import { analyzeStripeProducts, type StripeAnalysisResult } from '@/lib/stripe-products-analyzer';
import { generateStripeDataForPersona } from '@/lib/stripe-data-generators';

// Customer and Payment interfaces are now imported from realistic-data-generator

// Enhanced persona interface with Stripe data
interface EnhancedPersona {
  name: string;
  businessContext: any;
  entities: any[];
  keyFeatures: string[];
  userRoles: any[];
  stripeAnalysis?: StripeAnalysisResult;
  stripeData?: Record<string, any[]>;
}

// Function to enhance persona with Stripe data
function enhancePersonaWithStripeData(persona: any): EnhancedPersona {
  console.log('=== Enhancing persona with Stripe data ===');
  console.log('Persona name:', persona.name);
  console.log('Persona business context:', persona.businessContext);
  
  const stripeAnalysis = analyzeStripeProducts(persona);
  console.log('Stripe analysis:', stripeAnalysis);
  
  const stripeData = generateStripeDataForPersona(persona);
  console.log('Generated Stripe data keys:', Object.keys(stripeData));
  console.log('Stripe data counts:', Object.fromEntries(Object.entries(stripeData).map(([key, value]) => [key, (value as any[]).length])));
  
  // Add Stripe entities to the existing entities
  const stripeEntities = stripeAnalysis.allDataObjects.map(objectName => ({
    name: objectName,
    type: 'stripe_object',
    properties: [
      { name: 'id', type: 'string', description: `Stripe ${objectName} ID` },
      { name: 'created', type: 'number', description: 'Unix timestamp when created' },
      { name: 'amount', type: 'number', description: 'Amount in cents' },
      { name: 'status', type: 'string', description: 'Current status' }
    ]
  }));
  
  const enhanced = {
    ...persona,
    stripeAnalysis,
    stripeData,
    entities: [...persona.entities, ...stripeEntities]
  };
  
  console.log('Enhanced persona stripeData keys:', Object.keys(enhanced.stripeData));
  console.log('Enhanced persona stripeData counts:', Object.fromEntries(Object.entries(enhanced.stripeData).map(([key, value]) => [key, (value as any[]).length])));
  
  return enhanced;
}

interface RealisticVolume {
  min: number;
  max: number;
  expected: number;
}

interface BusinessMetrics {
  customerLifetimeValue: number;
  averageOrderValue: number;
  monthlyRecurringRevenue: number;
  dailyActiveUsers: number;
  conversionRate: number;
}

// AI-related interfaces
interface AnalysisData {
  success: boolean;
  analysis?: {
    businessContext: {
      type: string;
      stage: string;
      primaryFeatures: string[];
      targetAudience: string[];
      monetizationModel: string;
    };
    entities: Array<{
      name: string;
      type: string;
      properties: Array<{
        name: string;
        type: string;
        description: string;
      }>;
    }>;
    keyFeatures: string[];
    userRoles: Array<{
      name: string;
      permissions: string[];
      description: string;
    }>;
  };
}

// Custom category interface
interface CustomCategory {
  id: string; // "healthcare-b2b-saas-26feae01cee58029"
  displayName: string; // "Healthcare B2B SaaS"
  aiAnalysis: AnalysisData['analysis'];
  createdAt: Date;
}

// Predefined personas with business context
const PREDEFINED_PERSONAS = {
  modaic: {
    name: 'Modaic (Fashion E-commerce)',
    businessContext: {
      type: 'Fashion E-commerce',
      stage: 'growth',
      primaryFeatures: ['Product Catalog', 'Shopping Cart', 'Payment Processing', 'User Reviews'],
      targetAudience: ['Fashion Enthusiasts', 'Online Shoppers', 'Trend Followers'],
      monetizationModel: 'E-commerce Sales'
    },
    entities: [
      { name: 'Customer', type: 'person', properties: [
        { name: 'name', type: 'string', description: 'Full customer name' },
        { name: 'email', type: 'string', description: 'Customer email address' },
        { name: 'loyaltyTier', type: 'string', description: 'Bronze, Silver, or Gold tier' }
      ]},
      { name: 'Payment', type: 'transaction', properties: [
        { name: 'amount', type: 'number', description: 'Payment amount in dollars' },
        { name: 'status', type: 'string', description: 'Payment status' },
        { name: 'paymentMethod', type: 'string', description: 'Payment method used' }
      ]}
    ],
    keyFeatures: ['Fashion Catalog', 'Size Guides', 'Style Recommendations', 'Seasonal Collections'],
    userRoles: [
      { name: 'Admin', permissions: ['Full Access', 'Financial Data', 'User Management'], description: 'Complete system access' },
      { name: 'Support', permissions: ['Customer Support', 'Order Management'], description: 'Customer service access' }
    ]
  },
  stratus: {
    name: 'Stratus (B2B SaaS Platform)',
    businessContext: {
      type: 'B2B SaaS Platform',
      stage: 'growth',
      primaryFeatures: ['Subscription Management', 'Usage Analytics', 'API Access', 'Team Collaboration'],
      targetAudience: ['Business Teams', 'Enterprise Clients', 'Technical Users'],
      monetizationModel: 'Subscription Revenue'
    },
    entities: [
      { name: 'Customer', type: 'organization', properties: [
        { name: 'companyName', type: 'string', description: 'Business customer name' },
        { name: 'subscriptionTier', type: 'string', description: 'Service tier level' },
        { name: 'monthlyRevenue', type: 'number', description: 'Monthly subscription value' }
      ]},
      { name: 'Payment', type: 'subscription', properties: [
        { name: 'amount', type: 'number', description: 'Subscription payment amount' },
        { name: 'billingCycle', type: 'string', description: 'Monthly or annual billing' },
        { name: 'status', type: 'string', description: 'Payment status' }
      ]}
    ],
    keyFeatures: ['Dashboard Analytics', 'API Management', 'Team Workspaces', 'Usage Monitoring'],
    userRoles: [
      { name: 'Admin', permissions: ['Full Access', 'Billing Management', 'User Administration'], description: 'Complete platform access' },
      { name: 'Support', permissions: ['Customer Support', 'Usage Monitoring'], description: 'Support team access' }
    ]
  },
  forksy: {
    name: 'Forksy (Food Delivery)',
    businessContext: {
      type: 'Food Delivery Marketplace',
      stage: 'growth',
      primaryFeatures: ['Restaurant Discovery', 'Order Management', 'Delivery Tracking', 'Payment Processing'],
      targetAudience: ['Food Lovers', 'Busy Professionals', 'Families'],
      monetizationModel: 'Commission + Delivery Fees'
    },
    entities: [
      { name: 'Customer', type: 'person', properties: [
        { name: 'name', type: 'string', description: 'Customer name' },
        { name: 'deliveryAddress', type: 'string', description: 'Primary delivery location' },
        { name: 'orderFrequency', type: 'string', description: 'How often they order' }
      ]},
      { name: 'Payment', type: 'transaction', properties: [
        { name: 'orderAmount', type: 'number', description: 'Food order total' },
        { name: 'deliveryFee', type: 'number', description: 'Delivery charge' },
        { name: 'restaurant', type: 'string', description: 'Restaurant name' }
      ]}
    ],
    keyFeatures: ['Real-time Tracking', 'Restaurant Ratings', 'Group Orders', 'Scheduled Delivery'],
    userRoles: [
      { name: 'Admin', permissions: ['Full Access', 'Restaurant Management', 'Driver Coordination'], description: 'Platform administration' },
      { name: 'Support', permissions: ['Order Support', 'Customer Service'], description: 'Customer support access' }
    ]
  },
  pulseon: {
    name: 'Pulseon (Fitness Platform)',
    businessContext: {
      type: 'Fitness Streaming Platform',
      stage: 'growth',
      primaryFeatures: ['Workout Streaming', 'Trainer Profiles', 'Health Tracking', 'Subscription Management'],
      targetAudience: ['Fitness Enthusiasts', 'Home Workout Users', 'Health-Conscious Individuals'],
      monetizationModel: 'Subscription + Premium Content'
    },
    entities: [
      { name: 'Customer', type: 'person', properties: [
        { name: 'name', type: 'string', description: 'Member full name' },
        { name: 'email', type: 'string', description: 'Member email address' },
        { name: 'fitnessLevel', type: 'string', description: 'Beginner, intermediate, advanced, expert' },
        { name: 'subscriptionTier', type: 'string', description: 'Free, basic, premium, elite' }
      ]},
      { name: 'Payment', type: 'subscription', properties: [
        { name: 'amount', type: 'number', description: 'Subscription payment amount' },
        { name: 'subscriptionTier', type: 'string', description: 'Subscription tier level' },
        { name: 'status', type: 'string', description: 'Payment status' }
      ]}
    ],
    keyFeatures: ['Live Workouts', 'On-Demand Classes', 'Progress Tracking', 'Community Features'],
    userRoles: [
      { name: 'Admin', permissions: ['Full Access', 'Content Management', 'Trainer Administration'], description: 'Platform administration' },
      { name: 'Support', permissions: ['Member Support', 'Subscription Management'], description: 'Member support access' }
    ]
  },
  procura: {
    name: 'Procura (Procurement Platform)',
    businessContext: {
      type: 'B2B Procurement Platform',
      stage: 'growth',
      primaryFeatures: ['Vendor Management', 'Purchase Orders', 'Invoice Processing', 'Spend Analytics'],
      targetAudience: ['Procurement Teams', 'Finance Departments', 'Suppliers'],
      monetizationModel: 'SaaS Subscription + Transaction Fees'
    },
    entities: [
      { name: 'Customer', type: 'organization', properties: [
        { name: 'companyName', type: 'string', description: 'Business customer name' },
        { name: 'industry', type: 'string', description: 'Industry sector' },
        { name: 'spendVolume', type: 'number', description: 'Annual procurement spend' }
      ]},
      { name: 'Payment', type: 'transaction', properties: [
        { name: 'amount', type: 'number', description: 'Purchase order amount' },
        { name: 'vendor', type: 'string', description: 'Supplier name' },
        { name: 'status', type: 'string', description: 'Payment status' }
      ]}
    ],
    keyFeatures: ['Supplier Network', 'Contract Management', 'Approval Workflows', 'Cost Optimization'],
    userRoles: [
      { name: 'Admin', permissions: ['Full Access', 'Vendor Management', 'Financial Oversight'], description: 'Platform administration' },
      { name: 'Support', permissions: ['User Support', 'Order Tracking'], description: 'Customer support access' }
    ]
  },
  mindora: {
    name: 'Mindora (Mental Health Platform)',
    businessContext: {
      type: 'Mental Health & Wellness Platform',
      stage: 'growth',
      primaryFeatures: ['Therapy Sessions', 'Wellness Programs', 'Progress Tracking', 'Resource Library'],
      targetAudience: ['Individuals Seeking Therapy', 'Mental Health Professionals', 'Wellness Coaches'],
      monetizationModel: 'Session Fees + Subscription Plans'
    },
    entities: [
      { name: 'Customer', type: 'person', properties: [
        { name: 'name', type: 'string', description: 'Client full name' },
        { name: 'email', type: 'string', description: 'Client email address' },
        { name: 'therapyType', type: 'string', description: 'Type of therapy or wellness program' },
        { name: 'sessionCount', type: 'number', description: 'Number of completed sessions' }
      ]},
      { name: 'Payment', type: 'session', properties: [
        { name: 'amount', type: 'number', description: 'Session or subscription fee' },
        { name: 'sessionType', type: 'string', description: 'Individual, group, or subscription' },
        { name: 'status', type: 'string', description: 'Payment status' }
      ]}
    ],
    keyFeatures: ['Video Therapy', 'Mood Tracking', 'Crisis Support', 'Therapist Matching'],
    userRoles: [
      { name: 'Admin', permissions: ['Full Access', 'Provider Management', 'Clinical Oversight'], description: 'Platform administration' },
      { name: 'Support', permissions: ['Client Support', 'Session Coordination'], description: 'Client support access' }
    ]
  },
  keynest: {
    name: 'Keynest (Property Management)',
    businessContext: {
      type: 'Real Estate Property Management',
      stage: 'growth',
      primaryFeatures: ['Property Listings', 'Tenant Management', 'Lease Tracking', 'Maintenance Requests'],
      targetAudience: ['Property Owners', 'Tenants', 'Property Managers'],
      monetizationModel: 'Property Management Fees + Service Charges'
    },
    entities: [
      { name: 'Customer', type: 'person', properties: [
        { name: 'name', type: 'string', description: 'Tenant full name' },
        { name: 'email', type: 'string', description: 'Tenant email address' },
        { name: 'propertyType', type: 'string', description: 'Apartment, house, condo, etc.' },
        { name: 'monthlyRent', type: 'number', description: 'Monthly rent amount' }
      ]},
      { name: 'Payment', type: 'rent', properties: [
        { name: 'amount', type: 'number', description: 'Rent payment amount' },
        { name: 'paymentType', type: 'string', description: 'Rent, deposit, or fee' },
        { name: 'status', type: 'string', description: 'Payment status' }
      ]}
    ],
    keyFeatures: ['Online Rent Collection', 'Maintenance Portal', 'Lease Management', 'Financial Reporting'],
    userRoles: [
      { name: 'Admin', permissions: ['Full Access', 'Property Management', 'Financial Reports'], description: 'Property management access' },
      { name: 'Support', permissions: ['Tenant Support', 'Maintenance Coordination'], description: 'Tenant support access' }
    ]
  },
  fluxly: {
    name: 'Fluxly (Supply Chain Platform)',
    businessContext: {
      type: 'Supply Chain Management Platform',
      stage: 'growth',
      primaryFeatures: ['Inventory Tracking', 'Supplier Management', 'Logistics Coordination', 'Demand Forecasting'],
      targetAudience: ['Supply Chain Managers', 'Procurement Teams', 'Logistics Coordinators'],
      monetizationModel: 'SaaS Subscription + Premium Analytics'
    },
    entities: [
      { name: 'Customer', type: 'organization', properties: [
        { name: 'companyName', type: 'string', description: 'Business customer name' },
        { name: 'industry', type: 'string', description: 'Manufacturing, retail, etc.' },
        { name: 'shipmentVolume', type: 'number', description: 'Monthly shipment volume' }
      ]},
      { name: 'Payment', type: 'logistics', properties: [
        { name: 'amount', type: 'number', description: 'Logistics and shipping costs' },
        { name: 'shipmentType', type: 'string', description: 'Express, standard, bulk' },
        { name: 'status', type: 'string', description: 'Payment status' }
      ]}
    ],
    keyFeatures: ['Real-time Tracking', 'Route Optimization', 'Warehouse Management', 'Supplier Portal'],
    userRoles: [
      { name: 'Admin', permissions: ['Full Access', 'Supplier Management', 'Analytics Dashboard'], description: 'Supply chain administration' },
      { name: 'Support', permissions: ['Shipment Support', 'Vendor Coordination'], description: 'Operations support access' }
    ]
  },
  brightfund: {
    name: 'Brightfund (Nonprofit Platform)',
    businessContext: {
      type: 'Nonprofit Impact Platform',
      stage: 'growth',
      primaryFeatures: ['Donor Management', 'Campaign Creation', 'Impact Tracking', 'Volunteer Coordination'],
      targetAudience: ['Nonprofit Organizations', 'Donors', 'Volunteers'],
      monetizationModel: 'Platform Fees + Premium Features'
    },
    entities: [
      { name: 'Customer', type: 'person', properties: [
        { name: 'name', type: 'string', description: 'Donor full name' },
        { name: 'email', type: 'string', description: 'Donor email address' },
        { name: 'donorType', type: 'string', description: 'Individual, corporation, foundation' },
        { name: 'totalDonated', type: 'number', description: 'Total lifetime donations' }
      ]},
      { name: 'Payment', type: 'donation', properties: [
        { name: 'amount', type: 'number', description: 'Donation amount' },
        { name: 'donationType', type: 'string', description: 'One-time, monthly, annual' },
        { name: 'status', type: 'string', description: 'Payment status' }
      ]}
    ],
    keyFeatures: ['Fundraising Campaigns', 'Donor Portal', 'Impact Reporting', 'Event Management'],
    userRoles: [
      { name: 'Admin', permissions: ['Full Access', 'Campaign Management', 'Financial Reports'], description: 'Nonprofit administration' },
      { name: 'Support', permissions: ['Donor Support', 'Campaign Assistance'], description: 'Donor support access' }
    ]
  }
};

// Enhanced personas with Stripe data
const ENHANCED_PERSONAS = Object.fromEntries(
  Object.entries(PREDEFINED_PERSONAS).map(([key, persona]) => [
    key,
    enhancePersonaWithStripeData(persona)
  ])
);

// seededRandom is now imported from realistic-data-generator

// Generate short hash for custom categories
function generateShortHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 8);
}

// Generate custom category ID from title and hash
function generateCustomCategoryId(title: string, prompt: string): string {
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const hash = generateShortHash(prompt + Date.now());
  return `${cleanTitle}-${hash}`;
}

// Generate short business title from AI analysis
function generateBusinessTitle(analysis: AnalysisData['analysis']): string {
  if (!analysis) return 'Custom Business';
  
  const { type, stage } = analysis.businessContext;
  const words = type.split(' ').filter(word => word.length > 2);
  const shortType = words.slice(0, 2).join(' ');
  
  // Capitalize and limit to ~20 characters
  const title = `${shortType}`;
  return title.length > 18 ? title.substring(0, 15) + '...' : title;
}

// Map AI business types to our category system (from previous implementation)
function mapAIBusinessTypeToCategory(businessType: string): string {
  const typeMapping: Record<string, string> = {
    'ecommerce': 'modaic', 'fashion': 'modaic', 'retail': 'modaic',
    'saas': 'stratus', 'software': 'stratus', 'b2b': 'stratus',
    'food': 'forksy', 'delivery': 'forksy', 'restaurant': 'forksy',
  };
  
  const businessTypeLower = businessType.toLowerCase();
  for (const [key, category] of Object.entries(typeMapping)) {
    if (businessTypeLower.includes(key)) return category;
  }
  return 'modaic';
}

// Map AI stages to our stage system
function mapAIStageToScenarioStage(aiStage: string): 'early' | 'growth' | 'enterprise' {
  const stageMapping: Record<string, 'early' | 'growth' | 'enterprise'> = {
    'startup': 'early', 'early': 'early', 'mvp': 'early',
    'growth': 'growth', 'scaling': 'growth', 
    'mature': 'enterprise', 'enterprise': 'enterprise'
  };
  return stageMapping[aiStage.toLowerCase()] || 'growth';
}

// Realistic volume generation (from existing implementation)
function getRealisticVolume(scenario: { category: string; stage: string; id: number }): RealisticVolume {
  const baseVolumes = {
    early: { min: 47, max: 523 },
    growth: { min: 1247, max: 9876 },
    enterprise: { min: 12456, max: 987654 }
  };
  
  const categoryMultipliers: Record<string, number> = {
    modaic: 1.0,      // Standard e-commerce
    stratus: 0.267,   // B2B SaaS (fewer customers)
    forksy: 2.143,    // Food delivery (high volume)
    pulseon: 0.867,   // Fitness (moderate volume)
    procura: 0.234,   // Healthcare (fewer, high-value)
    mindora: 0.423,   // Online learning (moderate volume)
    keynest: 0.056,   // Real estate (very few, very high-value)
    fluxly: 0.534,    // Creator economy (moderate volume)
    brightfund: 0.123 // Non-profit (very few, high-value donors)
  };
  
  const base = baseVolumes[scenario.stage as keyof typeof baseVolumes] || baseVolumes.growth;
  const multiplier = categoryMultipliers[scenario.category] || 1.0;
  const seed = scenario.id;
  
  const range = base.max - base.min;
  const randomOffset = seededRandom(seed) * range;
  const baseExpected = Math.floor(base.min + randomOffset);
  const expected = Math.floor(baseExpected * multiplier);
  
  return {
    min: Math.floor(base.min * multiplier),
    max: Math.floor(base.max * multiplier),
    expected
  };
}

// Calculate realistic business metrics from actual data
function calculateBusinessMetricsFromData(customers: Customer[], payments: Payment[], stage: string, seed: number): BusinessMetrics {
  if (customers.length === 0 || payments.length === 0) {
    // Fallback to generated metrics if no data
    return generateFallbackMetrics(stage, seed);
  }

  // Calculate metrics from actual data
  const succeededPayments = payments.filter(p => p.status === 'succeeded');
  const totalRevenue = succeededPayments.reduce((sum, p) => sum + (p.amount / 100), 0); // Convert from cents
  const averageOrderValue = succeededPayments.length > 0 ? totalRevenue / succeededPayments.length : 0;
  
  // Calculate customer lifetime value (simplified: total revenue / total customers)
  const customerLifetimeValue = customers.length > 0 ? totalRevenue / customers.length : 0;
  
  // Estimate monthly recurring revenue based on category and stage
  const monthlyMultipliers = { early: 0.15, growth: 0.25, enterprise: 0.35 };
  const monthlyRecurringRevenue = totalRevenue * (monthlyMultipliers[stage as keyof typeof monthlyMultipliers] || 0.25);
  
  // Estimate daily active users (percentage of total customers)
  const dauPercentages = { early: 0.12, growth: 0.18, enterprise: 0.25 };
  const dailyActiveUsers = Math.floor(customers.length * (dauPercentages[stage as keyof typeof dauPercentages] || 0.18));
  
  // Estimate conversion rate based on payment success rate and stage
  const baseConversionRates = { early: 2.5, growth: 4.2, enterprise: 6.8 };
  const conversionRate = baseConversionRates[stage as keyof typeof baseConversionRates] || 4.2;
  
  return {
    customerLifetimeValue: Math.round(customerLifetimeValue * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue * 100) / 100,
    dailyActiveUsers,
    conversionRate: Math.round(conversionRate * 100) / 100
  };
}

// Fallback metrics generation for when no data is available
function generateFallbackMetrics(stage: string, seed: number): BusinessMetrics {
  const stageMultipliers = {
    early: { clv: 0.6, aov: 0.8, mrr: 0.4, dau: 0.3, conversion: 0.7 },
    growth: { clv: 1.0, aov: 1.0, mrr: 1.0, dau: 1.0, conversion: 1.0 },
    enterprise: { clv: 2.1, aov: 1.4, mrr: 3.2, dau: 4.7, conversion: 1.3 }
  };
  
  const multiplier = stageMultipliers[stage as keyof typeof stageMultipliers] || stageMultipliers.growth;
  
  return {
    customerLifetimeValue: Math.round(((150.34 + seededRandom(seed) * 200.41) * multiplier.clv) * 100) / 100,
    averageOrderValue: Math.round(((75.67 + seededRandom(seed + 1) * 124.33) * multiplier.aov) * 100) / 100,
    monthlyRecurringRevenue: Math.round(((2000.89 + seededRandom(seed + 2) * 6357.11) * multiplier.mrr) * 100) / 100,
    dailyActiveUsers: Math.floor((25.45 + seededRandom(seed + 3) * 74.55) * multiplier.dau),
    conversionRate: Math.round(((2.34 + seededRandom(seed + 4) * 3.67) * multiplier.conversion) * 100) / 100
  };
}

// generateRealisticAmount is now imported from realistic-data-generator

export default function Home() {
  // Unified state management
  const [selectedCategory, setSelectedCategory] = useState<string>('modaic');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisData['analysis'] | null>(null);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  
  // Scenario configuration
  const [role, setRole] = useState<'admin' | 'support'>('admin');
  const [stage, setStage] = useState<'early' | 'growth' | 'enterprise'>('growth');
  const [scenarioId, setScenarioId] = useState<number>(12345);
  
  // Generated data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dynamicEntities, setDynamicEntities] = useState<Record<string, any[]>>({});
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [metricsLoaded, setMetricsLoaded] = useState(false);
  
  // Stripe data
  const [stripeData, setStripeData] = useState<Record<string, any[]>>({});
  
  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharedDatasetUrl, setSharedDatasetUrl] = useState<string | null>(null);
  const [activeIntegrationTab, setActiveIntegrationTab] = useState<string>('cursor');
  
  // Dataset creation hook
  const { createDataset, isCreating, error, clearError } = useDatasetCreation();

  // Load custom categories from localStorage on mount
  useEffect(() => {
    try {
      // Clear old sessionStorage data to prevent quota issues
      sessionStorage.removeItem('synthkit-current-dataset');
      
      const stored = localStorage.getItem('synthkit-custom-categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomCategories(parsed.map((cat: any) => ({
          ...cat,
          createdAt: new Date(cat.createdAt)
        })));
      }
    } catch (error) {
      console.error('Failed to load custom categories:', error);
      // Clear corrupted data
      localStorage.removeItem('synthkit-custom-categories');
    }
  }, []);

  // Save custom categories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('synthkit-custom-categories', JSON.stringify(customCategories));
    } catch (error) {
      console.warn('Failed to save custom categories to localStorage:', error);
      // If storage is full, try to clear old data and save again
      try {
        localStorage.clear();
        localStorage.setItem('synthkit-custom-categories', JSON.stringify(customCategories));
      } catch (retryError) {
        console.error('Failed to save custom categories after clearing storage:', retryError);
      }
    }
  }, [customCategories]);

  // Generate data when scenario configuration changes
  useEffect(() => {
    generateScenarioData();
  }, [selectedCategory, role, stage, scenarioId]);

  // Calculate business metrics from actual data
  useEffect(() => {
    if (selectedCategory && stage && (customers.length > 0 || payments.length > 0)) {
      const metrics = calculateBusinessMetricsFromData(customers, payments, stage, scenarioId);
      setBusinessMetrics(metrics);
      setMetricsLoaded(true);
    } else if (selectedCategory && stage) {
      // Fallback for when data is not yet generated
      const metrics = generateFallbackMetrics(stage, scenarioId);
      setBusinessMetrics(metrics);
      setMetricsLoaded(true);
    }
  }, [selectedCategory, stage, scenarioId, customers, payments]);

  // Generate Stripe data when persona changes
  useEffect(() => {
    if (!isCustomCategory(selectedCategory)) {
      const persona = ENHANCED_PERSONAS[selectedCategory as keyof typeof ENHANCED_PERSONAS];
      if (persona?.stripeData) {
        setStripeData(persona.stripeData);
      } else {
        // Generate Stripe data for the persona
        const generatedStripeData = generateStripeDataForPersona(persona);
        setStripeData(generatedStripeData);
      }
    } else {
      setStripeData({});
    }
  }, [selectedCategory]);

  // Save current dataset metadata to sessionStorage and API for live integration
  useEffect(() => {
    if (metricsLoaded && (customers.length > 0 || Object.keys(dynamicEntities).length > 0)) {
      // Only store metadata, not the full dataset to avoid storage quota issues
      const datasetMetadata = {
        type: isCustomCategory(selectedCategory) ? 'ai-generated' : 'scenario',
        scenario: isCustomCategory(selectedCategory) ? undefined : { category: selectedCategory, role, stage, id: scenarioId },
        aiAnalysis: isCustomCategory(selectedCategory) ? { prompt: aiPrompt, analysis: getCustomCategory(selectedCategory)?.aiAnalysis } : undefined,
        recordCounts: isCustomCategory(selectedCategory) && Object.keys(dynamicEntities).length > 0
          ? Object.fromEntries(Object.entries(dynamicEntities).map(([key, value]) => [key, value.length]))
          : { customers: customers.length, payments: payments.length },
        updatedAt: new Date().toISOString()
      };
      
      try {
        // Save only metadata to sessionStorage (much smaller)
        sessionStorage.setItem('synthkit-current-dataset-metadata', JSON.stringify(datasetMetadata));
      } catch (error) {
        console.warn('Failed to save dataset metadata to sessionStorage:', error);
        // Clear old data and try again
        try {
          sessionStorage.removeItem('synthkit-current-dataset');
          sessionStorage.removeItem('synthkit-current-dataset-metadata');
          sessionStorage.setItem('synthkit-current-dataset-metadata', JSON.stringify(datasetMetadata));
        } catch (retryError) {
          console.warn('Failed to save dataset metadata after cleanup:', retryError);
        }
      }
      
      // Also save to API for cross-port live connection (only metadata)
      fetch('/api/dataset/current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: datasetMetadata })
      }).catch(err => {
        // Silently fail - API endpoint is optional for live features
        console.log('Live API update failed (this is normal if not testing live features):', err.message);
      });
    }
  }, [customers, payments, dynamicEntities, businessMetrics, metricsLoaded, selectedCategory, role, stage, scenarioId, aiPrompt]);

  // Helper functions
  const isCustomCategory = (categoryId: string): boolean => {
    return !ENHANCED_PERSONAS.hasOwnProperty(categoryId);
  };

  const getCustomCategory = (categoryId: string): CustomCategory | undefined => {
    return customCategories.find(cat => cat.id === categoryId);
  };

  const getCurrentBusinessContext = () => {
    if (isCustomCategory(selectedCategory)) {
      const customCat = getCustomCategory(selectedCategory);
      return customCat?.aiAnalysis?.businessContext;
    }
    return ENHANCED_PERSONAS[selectedCategory as keyof typeof ENHANCED_PERSONAS]?.businessContext;
  };

  const getCurrentEntities = () => {
    if (isCustomCategory(selectedCategory)) {
      const customCat = getCustomCategory(selectedCategory);
      return customCat?.aiAnalysis?.entities || [];
    }
    return ENHANCED_PERSONAS[selectedCategory as keyof typeof ENHANCED_PERSONAS]?.entities || [];
  };

  const getCurrentKeyFeatures = () => {
    if (isCustomCategory(selectedCategory)) {
      const customCat = getCustomCategory(selectedCategory);
      return customCat?.aiAnalysis?.keyFeatures || [];
    }
    return ENHANCED_PERSONAS[selectedCategory as keyof typeof ENHANCED_PERSONAS]?.keyFeatures || [];
  };

  const getCurrentUserRoles = () => {
    if (isCustomCategory(selectedCategory)) {
      const customCat = getCustomCategory(selectedCategory);
      return customCat?.aiAnalysis?.userRoles || [];
    }
    return ENHANCED_PERSONAS[selectedCategory as keyof typeof ENHANCED_PERSONAS]?.userRoles || [];
  };

  // New function to get Stripe analysis for current persona
  const getCurrentStripeAnalysis = () => {
    if (isCustomCategory(selectedCategory)) {
      // For custom categories, we'd need to analyze them too
      return null;
    }
    return ENHANCED_PERSONAS[selectedCategory as keyof typeof ENHANCED_PERSONAS]?.stripeAnalysis;
  };

  // Generate realistic dynamic entity data based on AI analysis
  const generateEntityData = (entityInfo: any, volume: number, seedOffset: number) => {
    const entityData = [];
    const entityName = entityInfo.name.toLowerCase();
    const mappedCategory = isCustomCategory(selectedCategory) 
      ? mapAIBusinessTypeToCategory(getCustomCategory(selectedCategory)?.aiAnalysis?.businessContext?.type || '')
      : selectedCategory;
    
    for (let i = 0; i < volume; i++) {
      const seed = scenarioId + seedOffset + i;
      const item: any = { id: `${entityName}_${scenarioId}_${i.toString().padStart(6, '0')}` };
      
      // Generate realistic data based on entity properties
      if (entityInfo.properties && entityInfo.properties.length > 0) {
        entityInfo.properties.forEach((prop: any) => {
          switch (prop.type) {
            case 'string':
              if (prop.name.includes('email')) {
                const nameData = generateRealisticName(seed + 100);
                item[prop.name] = generateRealisticEmail(nameData.firstName, nameData.lastName, seed);
              } else if (prop.name.includes('name') || prop.name.includes('title')) {
                const nameData = generateRealisticName(seed + 200);
                item[prop.name] = nameData.fullName;
              } else if (prop.name.includes('phone')) {
                item[prop.name] = generateRealisticPhone(seed + 300);
              } else if (prop.name.includes('address')) {
                const address = generateRealisticAddress(seed + 400);
                item[prop.name] = `${address.line1}, ${address.city}, ${address.state} ${address.postal_code}`;
              } else if (prop.name.includes('description')) {
                item[prop.name] = generateProductDescription(mappedCategory, seed + 500);
              } else {
                // Generate realistic values based on property name
                const sampleValues = {
                  status: ['active', 'inactive', 'pending', 'completed'],
                  type: ['premium', 'standard', 'basic'],
                  category: ['primary', 'secondary', 'tertiary'],
                  tier: ['bronze', 'silver', 'gold', 'platinum']
                };
                
                const matchedKey = Object.keys(sampleValues).find(key => prop.name.toLowerCase().includes(key));
                if (matchedKey) {
                  const values = sampleValues[matchedKey as keyof typeof sampleValues];
                  item[prop.name] = values[Math.floor(seededRandom(seed + 600) * values.length)];
                } else {
                  item[prop.name] = `Sample ${prop.name}`;
                }
              }
              break;
            case 'number':
              if (prop.name.includes('amount') || prop.name.includes('price') || prop.name.includes('cost')) {
                item[prop.name] = Math.round(generateRealisticAmount(seed, mappedCategory, stage) * 100); // In cents like Stripe
              } else if (prop.name.includes('count') || prop.name.includes('quantity')) {
                item[prop.name] = Math.floor(1 + seededRandom(seed) * 99); // 1-99
              } else if (prop.name.includes('rating') || prop.name.includes('score')) {
                item[prop.name] = Math.round((1 + seededRandom(seed) * 4) * 100) / 100; // 1.00-5.00
              } else {
                item[prop.name] = Math.floor(seededRandom(seed) * 1000) + 1;
              }
              break;
            case 'boolean':
              item[prop.name] = seededRandom(seed) > 0.5;
              break;
            default:
              item[prop.name] = `Sample ${prop.name}`;
          }
        });
      } else {
        // Default realistic properties if none specified
        const nameData = generateRealisticName(seed);
        item.name = nameData.fullName;
        item.email = generateRealisticEmail(nameData.firstName, nameData.lastName, seed);
        item.created = Math.floor((Date.now() - seededRandom(seed) * 365 * 24 * 60 * 60 * 1000) / 1000);
      }
      
      entityData.push(item);
    }
    
    return entityData;
  };

  // Generate scenario data based on current configuration
  const generateScenarioData = () => {
    const mappedCategory = isCustomCategory(selectedCategory) 
      ? mapAIBusinessTypeToCategory(getCustomCategory(selectedCategory)?.aiAnalysis?.businessContext?.type || '')
      : selectedCategory;

    const scenario = { category: mappedCategory, role, stage, id: scenarioId };
    const volume = getRealisticVolume(scenario);
    const entities = getCurrentEntities();
    
    if (isCustomCategory(selectedCategory) && entities.length > 0) {
      // Generate dynamic entities for AI scenarios
      const newDynamicEntities: Record<string, any[]> = {};
      
      entities.forEach((entity, index) => {
        const entityVolume = index === 0 ? volume.expected : Math.floor(volume.expected * (0.5 + seededRandom(scenarioId + index) * 1.5));
        const seedOffset = index * 10000;
        newDynamicEntities[entity.name.toLowerCase()] = generateEntityData(entity, entityVolume, seedOffset);
      });
      
      setDynamicEntities(newDynamicEntities);
      // Clear legacy data for AI scenarios
      setCustomers([]);
      setPayments([]);
    } else {
      // Generate realistic customers for predefined personas
      const newCustomers: Customer[] = [];
      for (let i = 0; i < volume.expected; i++) {
        const seed = scenarioId + i;
        const nameData = generateRealisticName(seed);
        const email = generateRealisticEmail(nameData.firstName, nameData.lastName, seed);
        const phone = generateRealisticPhone(seed + 1000);
        const address = generateRealisticAddress(seed + 2000);
        
        // Persona-specific metadata
        const loyaltyTiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
        const subscriptionTiers = ['Free', 'Basic', 'Premium', 'Elite'];
        const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing'];
        const companySizes = ['Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 'Large (201-1000)', 'Enterprise (1000+)'];
        
        newCustomers.push({
          id: `cus_${scenarioId}_${i.toString().padStart(6, '0')}`,
          email,
          name: nameData.fullName,
          phone,
          address,
          created: Math.floor((Date.now() - seededRandom(seed + 1) * 365 * 24 * 60 * 60 * 1000) / 1000),
          metadata: {
            loyaltyTier: loyaltyTiers[Math.floor(seededRandom(seed + 2) * loyaltyTiers.length)],
            subscriptionTier: subscriptionTiers[Math.floor(seededRandom(seed + 3) * subscriptionTiers.length)],
            industry: industries[Math.floor(seededRandom(seed + 4) * industries.length)],
            companySize: companySizes[Math.floor(seededRandom(seed + 5) * companySizes.length)]
          }
        });
      }
      
      // Generate payments with category-specific multipliers
      const paymentMultipliers: Record<string, number> = {
        modaic: 2.3,      // Fashion e-commerce (moderate frequency)
        stratus: 0.8,     // B2B SaaS (fewer transactions)
        forksy: 4.7,      // Food delivery (high frequency)
        pulseon: 1.2,     // Fitness (monthly subscriptions)
        procura: 3.1,     // Healthcare (regular supplies)
        mindora: 0.9,     // Online learning (course purchases)
        keynest: 12.5,    // Real estate (rent payments)
        fluxly: 2.8,      // Creator economy (content purchases)
        brightfund: 4.2   // Non-profit (donations)
      };
      const paymentMultiplier = paymentMultipliers[mappedCategory] || 2.3;
      const paymentCount = Math.floor(volume.expected * paymentMultiplier);
      
      const newPayments: Payment[] = [];
      for (let i = 0; i < paymentCount; i++) {
        const seed = scenarioId + 10000 + i;
        const customerIndex = Math.floor(seededRandom(seed) * newCustomers.length);
        const customer = newCustomers[customerIndex];
        const amount = generateRealisticAmount(seed, mappedCategory, stage);
        const description = generateProductDescription(mappedCategory, seed);
        
        // Realistic payment statuses with proper distribution
        const statusRandom = seededRandom(seed + 1);
        let status: string;
        if (statusRandom > 0.95) status = 'failed';
        else if (statusRandom > 0.85) status = 'pending';
        else status = 'succeeded';
        
        // Realistic payment methods based on category
        const paymentMethods = mappedCategory === 'stratus' 
          ? ['card', 'ach_debit', 'wire_transfer'] // B2B prefers bank transfers
          : mappedCategory === 'forksy'
          ? ['card', 'apple_pay', 'google_pay'] // Food delivery prefers mobile
          : ['card', 'paypal', 'bank_transfer']; // General mix
        
        newPayments.push({
          id: `ch_${scenarioId}_${i.toString().padStart(8, '0')}`,
          customerId: customer?.id || `cus_${scenarioId}_${customerIndex.toString().padStart(6, '0')}`,
          amount: Math.round(amount * 100), // Stripe amounts are in cents
          currency: 'usd',
          status,
          paymentMethod: paymentMethods[Math.floor(seededRandom(seed + 2) * paymentMethods.length)],
          created: Math.floor((Date.now() - seededRandom(seed + 3) * 30 * 24 * 60 * 60 * 1000) / 1000),
          description,
          metadata: {
            category: mappedCategory,
            productType: mappedCategory === 'stratus' ? 'subscription' : 'one_time',
            customerTier: customer?.metadata?.loyaltyTier || 'Bronze'
          }
        });
      }
      
      setCustomers(newCustomers);
      setPayments(newPayments);
      // Clear dynamic entities for predefined personas
      setDynamicEntities({});
    }
  };

  // Handle AI business analysis
  const handleAnalyzeBusiness = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiPrompt })
      });
      
      const data: AnalysisData = await response.json();
      
      if (data.success && data.analysis) {
        // Transform AI analysis to match expected structure
        const transformedAnalysis = {
          ...data.analysis,
          businessContext: {
            ...data.analysis.businessContext,
            primaryFeatures: data.analysis.businessContext?.primaryFeatures || [],
            targetAudience: data.analysis.businessContext?.targetAudience || []
          },
          entities: data.analysis.entities || [],
          keyFeatures: data.analysis.keyFeatures || [],
          userRoles: (data.analysis.userRoles || []).map((role: any) => {
            // Handle both string and object formats
            if (typeof role === 'string') {
              return {
                name: role,
                permissions: ['Standard Access'],
                description: `${role} access level`
              };
            } else {
              // Already an object, ensure it has required properties
              return {
                name: role.name || 'Unknown Role',
                permissions: role.permissions || ['Standard Access'],
                description: role.description || `${role.name || 'Unknown'} access level`
              };
            }
          })
        };
        
        setAiAnalysis(transformedAnalysis);
        
        // Create new custom category
        const title = generateBusinessTitle(data.analysis);
        const categoryId = generateCustomCategoryId(title, aiPrompt);
        
        const newCategory: CustomCategory = {
          id: categoryId,
          displayName: title,
          aiAnalysis: transformedAnalysis,
          createdAt: new Date()
        };
        
        // Add to custom categories (limit to 10)
        setCustomCategories(prev => {
          const filtered = prev.filter(cat => cat.id !== categoryId);
          const updated = [newCategory, ...filtered].slice(0, 10);
          return updated;
        });
        
        // Auto-select the new category
        setSelectedCategory(categoryId);
        
        // Update stage based on AI analysis
        const mappedStage = mapAIStageToScenarioStage(data.analysis.businessContext.stage);
        setStage(mappedStage);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle custom category deletion
  const handleDeleteCustomCategory = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this custom category?')) {
      const categoryIndex = customCategories.findIndex(cat => cat.id === categoryId);
      
      // Remove the category
      setCustomCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      // If deleting currently selected category, move to next item
      if (selectedCategory === categoryId) {
        const remainingCategories = customCategories.filter(cat => cat.id !== categoryId);
        const predefinedKeys = Object.keys(PREDEFINED_PERSONAS);
        
        if (remainingCategories.length > 0) {
          // Select next custom category
          const nextIndex = Math.min(categoryIndex, remainingCategories.length - 1);
          setSelectedCategory(remainingCategories[nextIndex].id);
        } else {
          // Fall back to first predefined persona
          setSelectedCategory(predefinedKeys[0]);
        }
      }
    }
  };

  // Handle dataset sharing
  const handleCreateDataset = async () => {
    console.log('handleCreateDataset called');
    const currentBusinessContext = getCurrentBusinessContext();
    
    const datasetData = isCustomCategory(selectedCategory) && Object.keys(dynamicEntities).length > 0
      ? { 
          ...dynamicEntities, 
          customers: dynamicEntities.customers || [],
          payments: dynamicEntities.payments || [],
          businessMetrics: businessMetrics || {} 
        }
      : { customers, payments, businessMetrics: businessMetrics || {} };
    
    console.log('Dataset data:', isCustomCategory(selectedCategory) 
      ? { dynamicEntities: Object.keys(dynamicEntities), entityCounts: Object.fromEntries(Object.entries(dynamicEntities).map(([key, value]) => [key, value.length])), hasBusinessMetrics: !!businessMetrics }
      : { customersCount: customers.length, paymentsCount: payments.length, hasBusinessMetrics: !!businessMetrics }
    );
    
    const recordCounts = isCustomCategory(selectedCategory) && Object.keys(dynamicEntities).length > 0
      ? Object.fromEntries(Object.entries(dynamicEntities).map(([key, value]) => [key, value.length]))
      : { customers: customers.length, payments: payments.length };
    
    let metadata;
    if (isCustomCategory(selectedCategory)) {
      metadata = {
        aiAnalysis: {
          prompt: aiPrompt,
          analysis: getCustomCategory(selectedCategory)?.aiAnalysis
        }
      };
    } else {
      metadata = {
        scenario: {
          category: selectedCategory,
          role,
          stage,
          id: scenarioId
        }
      };
    }
    
    try {
      const url = await createDataset({
        type: isCustomCategory(selectedCategory) ? 'ai-generated' : 'scenario',
        data: datasetData,
        metadata
      });
      
      if (url) {
        setSharedDatasetUrl(url);
        setShareModalOpen(true);
      } else {
        console.error('Dataset creation returned null URL');
        alert('Failed to create dataset. Please check the console for details.');
      }
    } catch (error) {
      console.error('Failed to create dataset:', error);
      alert(`Failed to create dataset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getDatasetInfo = () => {
    const recordCounts = isCustomCategory(selectedCategory) && Object.keys(dynamicEntities).length > 0
      ? Object.fromEntries(Object.entries(dynamicEntities).map(([key, value]) => [key, value.length]))
      : { customers: customers.length, payments: payments.length };
    
    if (isCustomCategory(selectedCategory)) {
      return {
        type: 'ai-generated' as const,
        recordCounts,
        aiAnalysis: {
          prompt: aiPrompt,
          businessType: getCurrentBusinessContext()?.type
        }
      };
    } else {
      return {
        type: 'scenario' as const,
        recordCounts,
        scenario: {
          category: selectedCategory,
          role,
          stage,
          id: scenarioId
        }
      };
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        {/* Left Panel - Configuration */}
        <div className="w-3/10 overflow-y-auto" style={{ padding: '40px', width: '30%' }}>
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/synthkitlogo.png" 
                  alt="Synthkit" 
                  className="w-16 h-16"
                  style={{ width: '64px', height: '64px' }}
                />
              </div>
              <p className="text-lg text-gray-600">
                Generate realistic synthetic data for your applications
              </p>
            </div>

        {/* Business Configuration Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Business Configuration
          </h2>
          
          {/* Category Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              {/* Predefined personas */}
              {Object.entries(ENHANCED_PERSONAS).map(([key, persona]) => (
                <option key={key} value={key}>
                  {persona.name}
                </option>
              ))}
              
              {/* Custom AI categories */}
              {customCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.displayName}
                </option>
              ))}
            </select>
            
            {/* Custom category management */}
            {customCategories.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Custom categories:
                {customCategories.map((category) => (
                  <span key={category.id} className="inline-flex items-center ml-2">
                    {category.displayName}
                    <button
                      onClick={() => handleDeleteCustomCategory(category.id)}
                      className="ml-1 text-red-500 hover:text-red-700"
                      title="Delete custom category"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI Prompt Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Business Prompt
            </label>
            <div className="flex gap-2">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your business idea (e.g., 'A growth stage platform for food delivery with real-time tracking and restaurant partnerships')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900"
                rows={3}
              />
              <button
                onClick={handleAnalyzeBusiness}
                disabled={!aiPrompt.trim() || isAnalyzing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Business'}
              </button>
            </div>
          </div>

          {/* AI Analysis Reasoning (only for AI-generated) */}
          {isCustomCategory(selectedCategory) && aiAnalysis && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Analysis Reasoning
              </h4>
              <p className="text-sm text-blue-800">
                This appears to be a <strong>{aiAnalysis.businessContext.type}</strong> in the{' '}
                <strong>{aiAnalysis.businessContext.stage}</strong> stage. Key features include{' '}
                {aiAnalysis.keyFeatures.slice(0, 3).join(', ')}, targeting{' '}
                {aiAnalysis.businessContext.targetAudience.slice(0, 2).join(' and ')}.
              </p>
            </div>
          )}
        </div>

        {/* Scenario Configuration Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Scenario Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'support')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="admin">Admin</option>
                <option value="support">Support</option>
              </select>
            </div>

            {/* Stage Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as 'early' | 'growth' | 'enterprise')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="early">Early</option>
                <option value="growth">Growth</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID
              </label>
              <input
                type="number"
                value={scenarioId}
                onChange={(e) => setScenarioId(parseInt(e.target.value) || 12345)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Key Features
          </h3>
          <div className="flex flex-wrap gap-2">
            {getCurrentKeyFeatures().map((feature, i) => (
              <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* User Roles */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            User Roles
          </h3>
          <div className="space-y-3">
            {getCurrentUserRoles().map((role, i) => (
              <div key={i} className="border-l-4 border-purple-500 pl-4">
                <div className="font-medium text-purple-800">{role.name}</div>
                <div className="text-sm text-gray-600">{role.description}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(role.permissions || []).map((permission: string, j: number) => (
                    <span key={j} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stripe Products Used */}
        {getCurrentStripeAnalysis() && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Stripe Products Used
            </h3>
            <div className="space-y-3">
              {getCurrentStripeAnalysis()?.recommendedProducts.map((product, i) => (
                <div key={i} className={`border-l-4 pl-4 ${
                  product.priority === 'essential' ? 'border-red-500' :
                  product.priority === 'recommended' ? 'border-yellow-500' :
                  'border-gray-400'
                }`}>
                  <div className={`font-medium ${
                    product.priority === 'essential' ? 'text-red-800' :
                    product.priority === 'recommended' ? 'text-yellow-800' :
                    'text-gray-800'
                  }`}>
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{product.description}</div>
                  <div className="text-xs text-gray-500">
                    Priority: {product.priority}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Data Objects: {product.dataObjects.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Entities */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Data Entities
          </h3>
          <div className="space-y-4">
            {getCurrentEntities().map((entity, i) => (
              <div key={i} className="border border-gray-200 rounded p-3">
                <div className="font-medium text-gray-900">{entity.name}</div>
                <div className="text-sm text-gray-500 capitalize mb-2">{entity.type}</div>
                <div className="space-y-2">
                  {(entity.properties || []).map((prop: any, j: number) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="font-medium text-gray-900 min-w-0 flex-shrink-0">{prop.name}</span>
                      <span className="text-gray-500 text-sm">({prop.type})</span>
                      {prop.description && (
                        <span className="text-gray-600 text-sm flex-1">- {prop.description}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Object Lists */}
        <div className="mb-8">
          {isCustomCategory(selectedCategory) && Object.keys(dynamicEntities).length > 0 ? (
            // Dynamic entities for AI scenarios
            Object.entries(dynamicEntities).map(([entityName, entityData]) => (
              <div key={entityName} className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {entityName.charAt(0).toUpperCase() + entityName.slice(1)} ({entityData.length.toLocaleString()})
                </h3>
                <div className="space-y-2">
                  {entityData.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="p-2 bg-gray-50 rounded">
                      <div className="space-y-1">
                        {Object.entries(item).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600 capitalize">
                              {key}:
                            </span>
                            <span className="text-sm text-gray-900">
                              {typeof value === 'number' && key.includes('amount') 
                                ? `$${value.toFixed(2)}`
                                : typeof value === 'string' && value.length > 30
                                ? `${value.substring(0, 30)}...`
                                : String(value)
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {entityData.length > 3 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      ... and {(entityData.length - 3).toLocaleString()} more
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Legacy customers/payments for predefined personas
            <>
              {/* Customers */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Customers ({customers.length.toLocaleString()})
                </h3>
                <div className="space-y-2">
                  {customers.slice(0, 3).map((customer) => (
                    <div key={customer.id} className="p-2 bg-gray-50 rounded">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-600">{customer.email}</div>
                          {customer.phone && (
                            <div className="text-xs text-gray-500">{customer.phone}</div>
                          )}
                          {customer.address && (
                            <div className="text-xs text-gray-500">
                              {customer.address.city}, {customer.address.state}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          {customer.metadata?.loyaltyTier && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {customer.metadata.loyaltyTier}
                            </span>
                          )}
                          {customer.metadata?.subscriptionTier && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                              {customer.metadata.subscriptionTier}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {customers.length > 3 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      ... and {(customers.length - 3).toLocaleString()} more
                    </div>
                  )}
                </div>
              </div>

              {/* Payments */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Payments ({payments.length.toLocaleString()})
                </h3>
                <div className="space-y-2">
                  {payments.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">
                          ${typeof payment.amount === 'number' ? (payment.amount / 100).toFixed(2) : payment.amount}
                        </div>
                        <div className="text-sm text-gray-600">{payment.paymentMethod}</div>
                        {payment.description && (
                          <div className="text-xs text-gray-500 truncate max-w-48">
                            {payment.description}
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        payment.status === 'succeeded' 
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                  {payments.length > 3 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      ... and {(payments.length - 3).toLocaleString()} more
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Stripe Data Lists */}
        {Object.keys(stripeData).length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Stripe Data
            </h3>
            <div className="space-y-6">
              {/* Customers */}
              {stripeData.customers && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Customers ({stripeData.customers.length.toLocaleString()})
                  </h4>
                  <div className="space-y-2">
                    {stripeData.customers.slice(0, 3).map((customer: any, index: number) => (
                      <div key={customer.id || index} className="p-2 bg-gray-50 rounded">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-600">{customer.email}</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(customer.created * 1000).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {stripeData.customers.length > 3 && (
                      <div className="text-sm text-gray-500 text-center py-2">
                        ... and {(stripeData.customers.length - 3).toLocaleString()} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Other Stripe Data */}
              {Object.entries(stripeData)
                .filter(([dataType]) => dataType !== 'customers' && dataType !== 'plans')
                .map(([dataType, dataArray]) => (
                <div key={dataType} className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {dataType.charAt(0).toUpperCase() + dataType.slice(1)} ({dataArray.length.toLocaleString()})
                  </h4>
                  <div className="space-y-2">
                    {dataArray.slice(0, 3).map((item: any, index: number) => (
                      <div key={item.id || index} className="p-2 bg-gray-50 rounded">
                        <div className="space-y-1">
                          {Object.entries(item).slice(0, 6).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600 capitalize">
                                {key}:
                              </span>
                              <span className="text-sm text-gray-900">
                                {typeof value === 'number' && key.includes('amount') 
                                  ? `$${(value / 100).toFixed(0)}`
                                  : typeof value === 'number' && key.includes('created')
                                  ? new Date(value * 1000).toLocaleDateString()
                                  : typeof value === 'string' && value.length > 30
                                  ? `${value.substring(0, 30)}...`
                                  : typeof value === 'object' && value !== null
                                  ? JSON.stringify(value).substring(0, 30) + '...'
                                  : String(value)
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {dataArray.length > 3 && (
                      <div className="text-sm text-gray-500 text-center py-2">
                        ... and {(dataArray.length - 3).toLocaleString()} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dataset URL Section */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-3">
            Dataset URL
          </h3>
          <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
            <code className="flex-1 text-sm font-mono text-gray-800 break-all">
              {sharedDatasetUrl || '/datasets/scenario-modaic-admin-growth-12345.json'}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(sharedDatasetUrl || '/datasets/scenario-modaic-admin-growth-12345.json')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <a
              href={sharedDatasetUrl || '/datasets/scenario-modaic-admin-growth-12345.json'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              View
            </a>
          </div>
        </div>

        </div>
      </div>

      {/* Right Panel - Integration & Sharing */}
      <div className="w-7/10 overflow-y-auto bg-gray-50" style={{ padding: '40px', width: '70%' }}>
          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {['cursor', 'claude', 'codex', 'react'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveIntegrationTab(tab)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeIntegrationTab === tab
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Setup Files - Dynamic based on selected tool */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Add this React Hook to your project root directory
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => downloadReactHook(sharedDatasetUrl || '/datasets/scenario-modaic-admin-growth-12345.json', getDatasetInfo())}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                useSynthkitDataset.ts
              </button>
            </div>
          </div>

          {/* Integration Examples */}
          <div>

            {/* Tab Content */}
            <div className="space-y-4">
              {(() => {
                const examples = generateAllIntegrations(
                  sharedDatasetUrl || '/datasets/scenario-modaic-admin-growth-12345.json', 
                  getDatasetInfo()
                );
                const filteredExamples = examples.filter(example => {
                  const toolName = example.tool.toLowerCase();
                  if (activeIntegrationTab === 'cursor') {
                    return toolName === 'cursor';
                  } else if (activeIntegrationTab === 'claude') {
                    return toolName === 'claude';
                  } else if (activeIntegrationTab === 'codex') {
                    return toolName === 'chatgpt';
                  } else if (activeIntegrationTab === 'react') {
                    return toolName === 'fetch api';
                  }
                  return false;
                });
                
                if (activeIntegrationTab === 'cursor') {
                  // For Cursor tab, show both cursor rules and prompt
                  const cursorPromptExample = examples.find(example => example.tool === 'Cursor' && example.instructions.includes('prompt'));
                  const cursorIntegrationExample = examples.find(example => example.tool === 'Cursor' && example.instructions.includes('React hook code'));
                  
                  return (
                    <>
                      {/* Cursor Rules Code Block */}
                      {cursorIntegrationExample && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">
                            Add this block to your{' '}
                            <a 
                              href="https://cursor.com/docs/context/rules" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              project rules
                            </a>{' '}
                            or ask Cursor to do it
                          </h3>
                          <pre className="bg-gray-100 p-5 rounded-lg text-sm overflow-x-auto">
                            <code className="text-gray-800">
                              {cursorIntegrationExample.copyText}
                            </code>
                          </pre>
                        </div>
                      )}
                      
                      {/* Cursor Prompt Code Block */}
                      {cursorPromptExample && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">Integration prompt</h3>
                          <pre className="bg-gray-100 p-5 rounded-lg text-sm overflow-x-auto">
                            <code className="text-gray-800">
                              {cursorPromptExample.copyText || cursorPromptExample.code}
                            </code>
                          </pre>
                        </div>
                      )}
                    </>
                  );
                }
                
                return filteredExamples.map((example, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-gray-900 mb-3">Integration prompt</h3>
                    <pre className="bg-gray-100 p-5 rounded-lg text-sm overflow-x-auto">
                      <code className="text-gray-800">
                        {example.code}
                      </code>
                    </pre>
                  </div>
                ));
              })()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
