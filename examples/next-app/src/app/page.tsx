'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AnalysisResult } from '@/app/components/AIComponents';
import { DatasetShareModal } from '@/components/DatasetShareModal';
// Dataset creation is now automatic - no hook needed
import { Copy, Download, ExternalLink, Info } from 'lucide-react';
import { generateAllIntegrations } from '@/lib/ai-integrations';
import { downloadCursorRules } from '@/lib/cursor-rules-generator';
import { downloadReactHook } from '@/lib/react-hook-generator';
import { generateAndPublishDataset, storeDatasetUrl, getStoredDatasetUrl } from '@/lib/client-dataset-generator';
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
import { generateStripeDataForPersona, generateStripeMetadataForPersona } from '@/lib/stripe-data-generators';
import { generateRealisticStripeData } from '@/lib/realistic-stripe-generator';
import { generateMetrics } from '@/lib/metrics-generator';

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
function enhancePersonaWithStripeData(persona: any, stage: string = 'growth'): EnhancedPersona {
  const stripeAnalysis = analyzeStripeProducts(persona);
  const stripeData = generateStripeDataForPersona(persona, stage);
  
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
  
  return {
    ...persona,
    stripeAnalysis,
    stripeData,
    entities: [...persona.entities, ...stripeEntities]
  };
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
  'checkout-ecommerce': {
    name: 'Checkout e-commerce',
    businessContext: {
      type: 'Checkout e-commerce',
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
  'b2b-saas-subscriptions': {
    name: 'B2B SaaS subscriptions',
    businessContext: {
      type: 'B2B SaaS subscriptions',
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
  'food-delivery-platform': {
    name: 'Food delivery platform',
    businessContext: {
      type: 'Food delivery platform',
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
  'consumer-fitness-app': {
    name: 'Consumer fitness app',
    businessContext: {
      type: 'Consumer fitness app',
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
  'b2b-invoicing': {
    name: 'B2B invoicing',
    businessContext: {
      type: 'B2B invoicing',
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
  'property-management-platform': {
    name: 'Property management platform',
    businessContext: {
      type: 'Property management platform',
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
  'creator-platform': {
    name: 'Creator platform',
    businessContext: {
      type: 'Creator platform',
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
  'donation-marketplace': {
    name: 'Donation marketplace',
    businessContext: {
      type: 'Donation marketplace',
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

// Base personas without Stripe data (generated dynamically)
const ENHANCED_PERSONAS = Object.fromEntries(
  Object.entries(PREDEFINED_PERSONAS).map(([key, persona]) => [
    key,
    {
      ...persona,
      stripeAnalysis: analyzeStripeProducts(persona),
      // Stripe data will be generated dynamically based on stage
    }
  ])
);

// Persona file mapping for backward compatibility
const PERSONA_FILE_MAPPING: Record<string, string> = {
  'checkout-ecommerce': 'modaic',
  'b2b-saas-subscriptions': 'stratus',
  'food-delivery-platform': 'forksy',
  'consumer-fitness-app': 'pulseon',
  'b2b-invoicing': 'procura',
  'property-management-platform': 'keynest',
  'creator-platform': 'fluxly',
  'donation-marketplace': 'brightfund'
};

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
    'ecommerce': 'checkout-ecommerce', 'fashion': 'checkout-ecommerce', 'retail': 'checkout-ecommerce',
    'saas': 'b2b-saas-subscriptions', 'software': 'b2b-saas-subscriptions', 'b2b': 'b2b-saas-subscriptions',
    'food': 'food-delivery-platform', 'delivery': 'food-delivery-platform', 'restaurant': 'food-delivery-platform',
  };
  
  const businessTypeLower = businessType.toLowerCase();
  for (const [key, category] of Object.entries(typeMapping)) {
    if (businessTypeLower.includes(key)) return category;
  }
  return 'checkout-ecommerce';
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
    'checkout-ecommerce': 1.0,      // Standard e-commerce
    'b2b-saas-subscriptions': 0.267,   // B2B SaaS (fewer customers)
    'food-delivery-platform': 2.143,    // Food delivery (high volume)
    'consumer-fitness-app': 0.867,   // Fitness (moderate volume)
    'b2b-invoicing': 0.234,   // Healthcare (fewer, high-value)
    'property-management-platform': 0.056,   // Real estate (very few, very high-value)
    'creator-platform': 0.534,    // Creator economy (moderate volume)
    'donation-marketplace': 0.123 // Non-profit (very few, high-value donors)
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

// Calculate comprehensive business metrics using the metrics generator
function calculateBusinessMetricsFromStripeData(stripeData: Record<string, any[]>, stage: string, seed: number): BusinessMetrics {
  const customers = stripeData.customers || [];
  const charges = stripeData.charges || [];
  
  if (customers.length === 0 || charges.length === 0) {
    // Fallback to generated metrics if no data
    return generateFallbackMetrics(stage, seed);
  }

  // Determine business type from the data or use a default
  const businessType = 'b2b-saas-subscriptions'; // Default, could be enhanced to detect from data
  
  // Generate comprehensive metrics using the metrics generator
  const comprehensiveMetrics = generateMetrics(stripeData, businessType, stage);
  
  // Extract key metrics for the simple BusinessMetrics interface
  const grossPaymentVolume = comprehensiveMetrics.find(m => m.name === 'Gross Payment Volume');
  const paymentSuccessRate = comprehensiveMetrics.find(m => m.name === 'Payment Success Rate');
  const successfulPayments = comprehensiveMetrics.find(m => m.name === 'Successful Payments');
  const acceptedVolume = comprehensiveMetrics.find(m => m.name === 'Accepted Volume');
  const acceptedPayments = comprehensiveMetrics.find(m => m.name === 'Accepted Payments');
  const failedVolume = comprehensiveMetrics.find(m => m.name === 'Failed Card Payments - Failed Volume');
  const failedCount = comprehensiveMetrics.find(m => m.name === 'Failed Card Payments - Failed Count');
  const failureRate = comprehensiveMetrics.find(m => m.name === 'Failed Card Payments - Failure Rate');
  const activeSubscribers = comprehensiveMetrics.find(m => m.name === 'Active Subscribers');
  
  // Calculate derived metrics
  const totalRevenue = acceptedVolume?.currentValue || 0;
  const averageOrderValue = (successfulPayments?.currentValue && successfulPayments.currentValue > 0) ? totalRevenue / successfulPayments.currentValue : 0;
  const customerLifetimeValue = customers.length > 0 ? totalRevenue / customers.length : 0;
  
  // Get MRR from subscriptions if available
  const subscriptions = stripeData.subscriptions || [];
  const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'active');
  const monthlyRecurringRevenue = activeSubscriptions.reduce((sum: number, s: any) => {
    const plan = stripeData.plans?.find((p: any) => p.id === s.plan?.id);
    return sum + (plan?.amount || 0) / 100; // Convert from cents
  }, 0);
  
  // Estimate daily active users (percentage of total customers)
  const dauPercentages = { early: 0.12, growth: 0.18, enterprise: 0.25 };
  const dailyActiveUsers = Math.floor(customers.length * (dauPercentages[stage as keyof typeof dauPercentages] || 0.18));
  
  // Use the actual conversion rate from metrics or fallback
  const conversionRate = paymentSuccessRate?.currentValue || 4.2;
  
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

// Generate dataset in chunks to keep UI responsive
async function generateDatasetInChunks(businessType: string, stage: string, onProgress?: (message: string) => void): Promise<Record<string, any[]>> {
  return new Promise((resolve) => {
    const generateWithProgress = async () => {
      try {
        onProgress?.('Generating full realistic dataset...');
        
        // Generate the FULL realistic dataset using the existing function
        // This will generate hundreds of thousands of records as intended
        const result = generateRealisticStripeData(businessType, stage);
        
        onProgress?.('Dataset generation complete!');
        resolve(result);
      } catch (error) {
        console.error('Error generating dataset:', error);
        resolve({});
      }
    };
    
    // Use a combination of techniques to keep UI responsive
    // First, yield control to the browser
    setTimeout(() => {
      // Then use requestIdleCallback if available for better scheduling
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          generateWithProgress();
        }, { timeout: 10000 });
      } else {
        // Fallback: use setTimeout with a longer delay to allow UI updates
        setTimeout(generateWithProgress, 100);
      }
    }, 0);
  });
}


export default function Home() {
  // Helper function to check if category is custom
  const isCustomCategory = (category: string) => {
    return customCategories.some(cat => cat.id === category);
  };

  // Helper function to get custom category
  const getCustomCategory = (category: string) => {
    return customCategories.find(cat => cat.id === category);
  };

  // Helper function to get business type from persona
  const getBusinessTypeFromPersona = (persona: any) => {
    const businessTypeMap: Record<string, string> = {
      'Checkout e-commerce': 'checkout-ecommerce',
      'B2B SaaS subscriptions': 'b2b-saas-subscriptions',
      'Food delivery platform': 'food-delivery-platform',
      'Consumer fitness app': 'consumer-fitness-app',
      'B2B invoicing': 'b2b-invoicing',
      'Property management platform': 'property-management-platform',
      'Creator platform': 'creator-platform',
      'Donation marketplace': 'donation-marketplace'
    };
    
    return businessTypeMap[persona.name] || 'b2b-saas-subscriptions';
  };

  // Unified state management
  const [selectedCategory, setSelectedCategory] = useState<string>('checkout-ecommerce');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisData['analysis'] | null>(null);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  
  // Scenario configuration
  const [role, setRole] = useState<'admin' | 'support'>('admin');
  const [stage, setStage] = useState<'early' | 'growth' | 'enterprise'>('growth');
  const [scenarioId, setScenarioId] = useState<number>(12345);
  
  // Generated data
  const [dynamicEntities, setDynamicEntities] = useState<Record<string, any[]>>({});
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [metricsLoaded, setMetricsLoaded] = useState(false);
  
  // Stripe data
  const [stripeData, setStripeData] = useState<Record<string, any[]>>({});
  
  // Full dataset for integration URLs
  const [fullDataset, setFullDataset] = useState<Record<string, any>>({});
  
  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharedDatasetUrl, setSharedDatasetUrl] = useState<string | null>(null);
  const [activeIntegrationTab, setActiveIntegrationTab] = useState<string>('cursor');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingDataset, setIsGeneratingDataset] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  
  // Dataset creation is now automatic - no hook needed

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

  // Memoize business metrics calculation to prevent unnecessary recalculations
  const memoizedBusinessMetrics = useMemo(() => {
    if (selectedCategory && stage && Object.keys(stripeData).length > 0) {
      return calculateBusinessMetricsFromStripeData(stripeData, stage, scenarioId);
    } else if (selectedCategory && stage) {
      return generateFallbackMetrics(stage, scenarioId);
    }
    return null;
  }, [selectedCategory, stage, scenarioId, stripeData]);

  // Update business metrics when memoized value changes
  useEffect(() => {
    if (memoizedBusinessMetrics) {
      setBusinessMetrics(memoizedBusinessMetrics);
      setMetricsLoaded(true);
    }
  }, [memoizedBusinessMetrics]);

  // Generate Stripe data when persona or stage changes (optimized for performance)
  useEffect(() => {
    const generateDataset = async () => {
      if (!isCustomCategory(selectedCategory)) {
        const persona = ENHANCED_PERSONAS[selectedCategory as keyof typeof ENHANCED_PERSONAS];
        
        try {
          setIsGeneratingDataset(true);
          // Generate realistic dataset with proper volumes for the scenario
          const generatedStripeData = generateStripeMetadataForPersona(persona, stage);
          setStripeData(generatedStripeData);
        } catch (error) {
          console.error('Error generating Stripe data:', error);
          setStripeData({});
        } finally {
          setIsGeneratingDataset(false);
        }
      } else {
        setStripeData({});
      }
    };
    
    generateDataset();
  }, [selectedCategory, stage]);

  // Save current dataset metadata to sessionStorage and API for live integration
  useEffect(() => {
    if (metricsLoaded && (Object.keys(stripeData).length > 0 || Object.keys(dynamicEntities).length > 0)) {
      // Only store metadata, not the full dataset to avoid storage quota issues
      const datasetMetadata = {
          type: isCustomCategory(selectedCategory) ? 'ai-generated' : 'scenario',
          scenario: isCustomCategory(selectedCategory) ? undefined : { category: selectedCategory, role, stage, id: scenarioId },
          aiAnalysis: isCustomCategory(selectedCategory) ? { prompt: aiPrompt, analysis: getCustomCategory(selectedCategory)?.aiAnalysis } : undefined,
        recordCounts: isCustomCategory(selectedCategory) && Object.keys(dynamicEntities).length > 0
          ? Object.fromEntries(Object.entries(dynamicEntities).map(([key, value]) => [key, value.length]).filter(([key, count]) => (count as number) > 0))
          : (stripeData._metadata as any)?.counts 
            ? Object.fromEntries(Object.entries((stripeData._metadata as any).counts).filter(([key, count]) => (count as number) > 0))
            : Object.fromEntries(Object.entries(stripeData).filter(([key]) => key !== '_metadata').map(([key, value]) => [key, (value as any[]).length]).filter(([key, count]) => (count as number) > 0)),
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
  }, [stripeData, dynamicEntities, businessMetrics, metricsLoaded, selectedCategory, role, stage, scenarioId, aiPrompt]);

  // Helper functions are defined at the top of the component

  // Memoize comprehensive metrics generation to prevent expensive recalculations
  const memoizedComprehensiveMetrics = useMemo(() => {
    if (!metricsLoaded || Object.keys(stripeData).length === 0) return null;
    
    if (isCustomCategory(selectedCategory) && Object.keys(dynamicEntities).length > 0) {
      const businessType = 'b2b-saas-subscriptions';
      return generateMetrics(dynamicEntities, businessType, stage);
    } else {
      const businessType = selectedCategory;
      return generateMetrics(stripeData, businessType, stage);
    }
  }, [selectedCategory, stage, stripeData, dynamicEntities, metricsLoaded]);

  // Memoize full dataset generation to prevent expensive recalculations
  const memoizedFullDataset = useMemo(() => {
    if (!metricsLoaded || Object.keys(stripeData).length === 0) return null;
    
    console.log('=== Generating Full Dataset (Memoized) ===');
    
    let datasetData;
    if (isCustomCategory(selectedCategory) && Object.keys(dynamicEntities).length > 0) {
      datasetData = { 
        ...dynamicEntities, 
        businessMetrics: businessMetrics || {},
        metrics: memoizedComprehensiveMetrics || []
      };
    } else {
      const persona = ENHANCED_PERSONAS[selectedCategory as keyof typeof ENHANCED_PERSONAS];
      if (persona) {
        // Use existing stripeData instead of regenerating
        datasetData = { 
          ...stripeData, 
          businessMetrics: businessMetrics || {},
          metrics: memoizedComprehensiveMetrics || []
        };
      } else {
        datasetData = { 
          ...stripeData, 
          businessMetrics: businessMetrics || {},
          metrics: memoizedComprehensiveMetrics || []
        };
      }
    }
    
    console.log('Full dataset generated with keys:', Object.keys(datasetData));
    console.log('Comprehensive metrics count:', datasetData.metrics?.length || 0);
    
    return datasetData;
  }, [selectedCategory, stage, stripeData, dynamicEntities, businessMetrics, metricsLoaded, memoizedComprehensiveMetrics]);

  // Update full dataset when memoized value changes
  useEffect(() => {
    if (memoizedFullDataset) {
      setFullDataset(memoizedFullDataset);
      
      // Debounce API calls to prevent excessive requests
      const timeoutId = setTimeout(() => {
        // Send full dataset to API for integration URLs
        fetch('/api/dataset/current', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataset: memoizedFullDataset })
        }).catch(err => {
          console.log('Failed to update current dataset API:', err.message);
        });

        // Send metrics data to API
        if (memoizedFullDataset.metrics && (memoizedFullDataset as any)._metadata) {
          fetch('/api/metrics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              dataset: memoizedFullDataset,
              businessType: (memoizedFullDataset as any)._metadata.businessType,
              stage: (memoizedFullDataset as any)._metadata.stage
            })
          }).then(response => {
            if (response.ok) {
              console.log('Metrics sent to API successfully');
            } else {
              console.error('Failed to send metrics to API:', response.status);
            }
          }).catch(err => {
            console.error('Error sending metrics to API:', err);
          });
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [memoizedFullDataset]);

  // Helper functions (moved up to avoid hoisting issues)

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
    } else {
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

  // Handle dataset publishing with client-side generation
  const handlePublishDataset = useCallback(async () => {
    setIsPublishing(true);
    setIsGeneratingDataset(true);
    setGenerationProgress('Generating dataset...');
    try {
      // Generate dataset client-side and upload to GitHub
      const result = await generateAndPublishDataset({
        businessType: getBusinessTypeFromPersona(ENHANCED_PERSONAS[selectedCategory as keyof typeof ENHANCED_PERSONAS]),
        stage,
        scenarioId
      });
      
      if (result.success && result.url) {
        setSharedDatasetUrl(result.url);
        storeDatasetUrl(result.url);
        setGenerationProgress('Dataset generation started! It will be available shortly at the URL above.');
      } else {
        setGenerationProgress('Failed to start dataset generation.');
      }
    } catch (error) {
      console.error('Failed to publish dataset:', error);
      setGenerationProgress('Error during dataset generation.');
    } finally {
      setIsPublishing(false);
      setIsGeneratingDataset(false);
    }
  }, [selectedCategory, stage, scenarioId]);

  const handleUpdateDataset = useCallback(async () => {
    setIsPublishing(true);
    try {
      // Generate new dataset client-side and upload to GitHub
      const result = await generateAndPublishDataset({
        businessType: getBusinessTypeFromPersona(ENHANCED_PERSONAS[selectedCategory as keyof typeof ENHANCED_PERSONAS]),
        stage,
        scenarioId
      });
      
      if (result.success && result.url) {
        setSharedDatasetUrl(result.url);
        storeDatasetUrl(result.url);
      }
    } catch (error) {
      console.error('Failed to update dataset:', error);
    } finally {
      setIsPublishing(false);
    }
  }, [selectedCategory, stage, scenarioId]);

  // Copy to clipboard utility
  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if needed
    } catch (error) {
      console.error('Failed to copy:', error);
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
  // Dataset creation is now handled automatically by the useEffect above
  // No manual creation needed - full datasets are always available via /api/dataset/current

  const getDatasetInfo = () => {
    let recordCounts: Record<string, number> = {};
    
    if (isCustomCategory(selectedCategory) && Object.keys(dynamicEntities).length > 0) {
      // Use dynamic entities for custom categories
      recordCounts = Object.fromEntries(
        Object.entries(dynamicEntities)
          .map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])
          .filter(([key, count]) => typeof count === 'number' && count > 0)
      );
    } else if ((stripeData as any)._metadata?.counts) {
      // Use metadata counts if available (these are the realistic volumes)
      const metadataCounts = (stripeData as any)._metadata.counts as Record<string, number>;
      recordCounts = Object.fromEntries(
        Object.entries(metadataCounts)
          .filter(([key, count]) => typeof count === 'number' && count > 0)
      );
    } else {
      // Fallback: count actual data arrays (this should rarely be used)
      recordCounts = Object.fromEntries(
        Object.entries(stripeData)
          .filter(([key]) => key !== '_metadata' && key !== 'businessMetrics' && key !== 'metrics')
          .map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])
          .filter(([key, count]) => typeof count === 'number' && count > 0)
      );
    }
    
    // Debug logging
    console.log('Dataset Info Debug:', {
      selectedCategory,
      isCustom: isCustomCategory(selectedCategory),
      dynamicEntitiesKeys: Object.keys(dynamicEntities),
      stripeDataKeys: Object.keys(stripeData),
      hasMetadata: !!(stripeData as any)._metadata,
      metadataCounts: (stripeData as any)._metadata?.counts,
      calculatedRecordCounts: recordCounts,
      stripeDataLengths: Object.fromEntries(
        Object.entries(stripeData)
          .filter(([key]) => key !== '_metadata' && key !== 'businessMetrics' && key !== 'metrics')
          .map(([key, value]) => [key, Array.isArray(value) ? value.length : 'not array'])
      ),
      metadataStructure: (stripeData as any)._metadata
    });
    
    // Get included metrics from metadata
    const includedMetrics = (stripeData as any)._metadata?.includedMetrics || [];

    if (isCustomCategory(selectedCategory)) {
      return {
        type: 'ai-generated' as const,
        recordCounts,
        includedMetrics,
        aiAnalysis: {
          prompt: aiPrompt,
          businessType: getCurrentBusinessContext()?.type
        }
      };
    } else {
      return {
        type: 'scenario' as const,
        recordCounts,
        includedMetrics,
        scenario: {
          category: selectedCategory,
          role,
          stage,
          id: scenarioId
        }
      };
    }
  };

  const getCurrentDatasetUrl = () => {
    if (sharedDatasetUrl) {
      return sharedDatasetUrl;
    }
    
    // Return null if no dataset URL has been generated yet
    return null;
  };

  const getCurrentDatasetUrlForDisplay = () => {
    if (sharedDatasetUrl) {
      return sharedDatasetUrl;
    }
    
    // Use paginated endpoint for browser display to prevent crashes
    return '/api/dataset/current?limit=1000';
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
                Prototype with realistic, synthetic datasets
              </p>
            </div>

        {/* Configuration Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Configuration
          </h3>
          
          {/* Category Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pre-built scenarios
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
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
                      className="ml-1" style={{ color: '#DB4F0B' }} onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#B83D08'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#DB4F0B'}
                      title="Delete custom category"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Custom Scenario Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom scenario
            </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. birdwatching app with subscriptions"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-gray-900 mb-2"
                rows={3}
              />
              <button
                onClick={handleAnalyzeBusiness}
                disabled={!aiPrompt.trim() || isAnalyzing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: '#FFCCB4', color: '#DB4F0B' }} onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#FFB896'} onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#FFCCB4'}
              >
              {isAnalyzing ? 'Generating...' : 'Generate'}
              </button>
          </div>

          {/* AI Analysis Reasoning (only for AI-generated) */}
          {isCustomCategory(selectedCategory) && aiAnalysis && (
            <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#FFF4F0' }}>
              <h4 className="text-sm font-medium mb-2" style={{ color: '#DB4F0B' }}>
                Analysis Reasoning
              </h4>
              <p className="text-sm" style={{ color: '#B83D08' }}>
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
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'support')}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
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
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
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
              <p className="text-xs text-gray-500 mb-2">
                Change this number to generate different datasets with unique URLs
              </p>
              <input
                type="number"
                value={scenarioId}
                onChange={(e) => setScenarioId(parseInt(e.target.value) || 12345)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>


        {/* Stripe Products */}
        {getCurrentStripeAnalysis() && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Stripe products
            </h3>
            <div className="space-y-3">
              {getCurrentStripeAnalysis()?.recommendedProducts.map((product, i) => (
                <div key={i} className="border-l-4 pl-4" style={{ borderLeftColor: '#DB4F0B' }}>
                  <div className="font-medium text-gray-900">
                    {product.name}
                      </div>
                  <div className="text-sm text-gray-600 mb-1">{product.description}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-xl text-xs">
                      Priority: {product.priority}
                    </span>
                    {product.dataObjects.map((obj: string, j: number) => (
                      <span key={j} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-xl text-xs">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Object Lists */}
        <div className="mb-8">
          {isCustomCategory(selectedCategory) && Object.keys(dynamicEntities).length > 0 && (
            // Dynamic entities for AI scenarios
            Object.entries(dynamicEntities).map(([entityName, entityData]) => (
              <div key={entityName} className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {entityName.charAt(0).toUpperCase() + entityName.slice(1)} ({entityData?.length?.toLocaleString() || 0})
                </h3>
                <div className="space-y-2">
                  {(entityData || []).slice(0, 3).map((item: any) => (
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
                      ... and {((entityData?.length || 0) - 3).toLocaleString()} more
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>


        {/* Dataset Structure */}
        {Object.keys(stripeData).length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Dataset structure
                </h3>
            <div className="mb-6">
              <a 
                href="https://docs.stripe.com/stripe-data/schema" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm underline flex items-center gap-1" style={{ color: '#DB4F0B' }} onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#B83D08'} onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#DB4F0B'}
              >
                Open data schema
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="space-y-6">
              {/* All Data Types */}
              {Object.entries(stripeData)
                .filter(([dataType, dataArray]) => 
                  dataType !== '_metadata' && 
                  Array.isArray(dataArray) && 
                  dataArray.length > 0
                )
                .map(([dataType, dataArray]) => (
                <div key={dataType} className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {dataType.charAt(0).toUpperCase() + dataType.slice(1)} ({((stripeData._metadata as any)?.counts?.[dataType] || dataArray?.length || 0).toLocaleString()})
                  </h4>
                  <div className="space-y-0">
                    {Array.isArray(dataArray) ? dataArray.slice(0, 3).map((item: any, index: number) => (
                      <div key={item.id || index} className="py-3 border-b border-gray-200 last:border-b-0">
                        {dataType === 'customers' ? (
                          // Special layout for customers
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-600">{item.email}</div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(item.created * 1000).toLocaleDateString()}
                        </div>
                          </div>
                        ) : (
                          // Generic layout for other data types
                          <div className="space-y-1">
                            {Object.entries(item).slice(0, 6).map(([key, value]) => (
                              <div key={key} className="flex items-center">
                                <span className="text-sm font-medium text-gray-600 capitalize">
                                  {key}:
                            </span>
                                <span className="text-sm text-gray-900 ml-2">
                                  {typeof value === 'number' && key.includes('amount') 
                                    ? `$${(value / 100).toFixed(2)}`
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
                  )}
                </div>
                    )) : (
                      <div className="text-sm text-gray-500 text-center py-2">
                        No data available
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                    </div>
                </div>
        )}

        {/* Included Metrics */}
        {(stripeData._metadata as any)?.includedMetrics && (stripeData._metadata as any).includedMetrics.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Included metrics
            </h3>
            <div className="space-y-3">
              {(stripeData._metadata as any).includedMetrics.map((metric: string, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-900">{metric}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-lg">
                    Available
                  </span>
        </div>
              ))}
      </div>
        </div>
        )}

        {/* User Roles */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            User roles
            </h3>
          <div className="space-y-3">
            {getCurrentUserRoles().map((role, i) => (
              <div key={i} className="border-l-4 pl-4" style={{ borderLeftColor: '#DB4F0B' }}>
                <div className="font-medium text-gray-900">{role.name}</div>
                <div className="text-sm text-gray-600">{role.description}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(role.permissions || []).map((permission: string, j: number) => (
                    <span key={j} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-xl text-xs">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            ))}
                  </div>
                </div>

            </div>
          </div>

      {/* Right Panel - Integration & Sharing */}
      <div className="w-7/10 overflow-y-auto bg-gray-50" style={{ padding: '40px', width: '70%' }}>
          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
              {['cursor', 'v0', 'claude', 'codex', 'javascript'].map((tab) => (
                  <button
                  key={tab}
                  onClick={() => setActiveIntegrationTab(tab)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
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

          {/* Dataset Publishing Section */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              🌐 Dataset Publishing
            </h3>
            
            {isGeneratingDataset && (
              <div className="mb-4 p-3 bg-yellow-100 rounded-xl">
                <p className="text-sm text-yellow-700">
                  ⏳ {generationProgress || 'Generating dataset...'} This may take a moment for large datasets.
                </p>
                <div className="mt-2">
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {!sharedDatasetUrl ? (
              <button
                onClick={handlePublishDataset}
                disabled={isPublishing || isGeneratingDataset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
              >
                {isPublishing ? 'Publishing...' : isGeneratingDataset ? 'Generating Dataset...' : 'Generate Dataset URL'}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <p className="text-sm text-green-700 mb-2">Dataset URL Generated:</p>
                  <code className="text-xs font-mono text-green-800 break-all">{sharedDatasetUrl}</code>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(sharedDatasetUrl, 'dataset-url')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    <Copy className="w-4 h-4" />
                    Copy URL
                  </button>
                  
                  <button
                    onClick={handleUpdateDataset}
                    disabled={isPublishing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                  >
                    {isPublishing ? 'Updating...' : 'Update Dataset'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Setup Files - Only for Cursor tab */}
          {activeIntegrationTab === 'cursor' && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Add this React Hook to your project root directory
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const url = getCurrentDatasetUrl();
                    if (url) downloadReactHook(url, getDatasetInfo());
                  }}
                  disabled={!getCurrentDatasetUrl()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium disabled:opacity-50" style={{ backgroundColor: '#FFCCB4', color: '#DB4F0B' }} onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#FFB896'} onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#FFCCB4'}
                >
                  <Download className="w-4 h-4" />
                  useSynthkitDataset.ts
                </button>
              </div>
            </div>
          )}

          {/* Integration Examples */}
          <div>

            {/* Tab Content */}
            <div className="space-y-4">
              {(() => {
                const datasetUrl = getCurrentDatasetUrl();
                const datasetInfo = getDatasetInfo();
                
                // Show message if no dataset URL is available
                if (!datasetUrl) {
                  return (
                    <div className="p-4 bg-yellow-100 rounded-xl">
                      <p className="text-sm text-yellow-700">
                        ⚠️ Please generate a dataset URL first by clicking "Generate Dataset URL" above to get integration code with the actual dataset.
                      </p>
                    </div>
                  );
                }
                
                const examples = generateAllIntegrations(datasetUrl!, datasetInfo);
                const filteredExamples = examples.filter(example => {
                  const toolName = example.tool.toLowerCase();
                  if (activeIntegrationTab === 'cursor') {
                    return toolName === 'cursor';
                  } else if (activeIntegrationTab === 'claude') {
                    return toolName === 'claude';
                  } else if (activeIntegrationTab === 'codex') {
                    return toolName === 'chatgpt';
                  } else if (activeIntegrationTab === 'javascript') {
                    return toolName === 'fetch api';
                  } else if (activeIntegrationTab === 'v0') {
                    return toolName === 'v0';
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
                              className="underline"
                              style={{ color: '#DB4F0B' }}
                              onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#B83D08'}
                              onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#DB4F0B'}
                            >
                              project rules
                            </a>{' '}
                            or ask Cursor to do it
                          </h3>
                          <pre className="bg-gray-100 p-5 rounded-xl text-sm overflow-x-auto">
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
                          <pre className="bg-gray-100 p-5 rounded-xl text-sm overflow-x-auto">
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
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {activeIntegrationTab === 'javascript' ? 'JavaScript Class for Vanilla JS Projects' : 
                       activeIntegrationTab === 'cursor' ? 'Cursor Integration Rules' : 'Integration prompt'}
                    </h3>
                    {activeIntegrationTab === 'javascript' && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-800 mb-2">
                          <strong>How to use this code:</strong>
                        </p>
                        <ul className="text-sm text-blue-700 space-y-1 ml-4">
                          <li>• Copy the entire class code below</li>
                          <li>• Save it as a JavaScript file (e.g., <code className="bg-blue-100 px-1 rounded">synthkit.js</code>)</li>
                          <li>• Import and use in your vanilla JS project</li>
                          <li>• Includes caching, error handling, and utility methods</li>
                          <li>• Works with any framework or vanilla JavaScript</li>
                        </ul>
                </div>
              )}
                    <pre className="bg-gray-100 p-5 rounded-xl text-sm overflow-x-auto">
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
