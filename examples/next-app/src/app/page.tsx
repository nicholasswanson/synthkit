'use client';

import { useState, useEffect, useRef } from 'react';
import { AnalysisResult } from '@/app/components/AIComponents';
import { DatasetShareModal } from '@/components/DatasetShareModal';
import { useDatasetCreation } from '@/hooks/useDatasetCreation';

interface Customer {
  id: string;
  name: string;
  email: string;
  loyaltyTier: string;
  createdAt: string;
}

interface Payment {
  id: string;
  customerId: string;
  amount: number | string;
  status: string;
  paymentMethod: string;
  createdAt: string;
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
  }
,
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

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

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
    enterprise: { min: 12456, max: 50000 } // Capped for demo memory efficiency (realistic: up to 1M+)
  };
  
  const categoryMultipliers: Record<string, number> = {
    modaic: 1.0, stratus: 0.267, forksy: 2.143,
    pulseon: 1.8, procura: 0.9, mindora: 0.6,
    keynest: 0.4, fluxly: 1.5, brightfund: 0.8
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

// Generate realistic business metrics
function generateBusinessMetrics(category: string, stage: string, seed: number): BusinessMetrics {
  const stageMultipliers = {
    early: { clv: 0.6, aov: 0.8, mrr: 0.4, dau: 0.3, conversion: 0.7 },
    growth: { clv: 1.0, aov: 1.0, mrr: 1.0, dau: 1.0, conversion: 1.0 },
    enterprise: { clv: 2.1, aov: 1.4, mrr: 3.2, dau: 4.7, conversion: 1.3 }
  };
  
  const multiplier = stageMultipliers[stage as keyof typeof stageMultipliers] || stageMultipliers.growth;
  
    // Persona-specific base metrics (industry-appropriate ranges)
  const personaMetrics: Record<string, {
    clvBase: number, clvRange: number,
    aovBase: number, aovRange: number, 
    mrrBase: number, mrrRange: number,
    dauBase: number, dauRange: number,
    conversionBase: number, conversionRange: number
  }> = {
    modaic: { // Fashion E-commerce
      clvBase: 180.45, clvRange: 220.55, aovBase: 85.23, aovRange: 140.77,
      mrrBase: 1200.34, mrrRange: 3800.66, dauBase: 45.67, dauRange: 120.33,
      conversionBase: 2.89, conversionRange: 4.11
    },
    stratus: { // B2B SaaS Platform  
      clvBase: 2400.67, clvRange: 4200.33, aovBase: 450.89, aovRange: 850.11,
      mrrBase: 8500.45, mrrRange: 15000.55, dauBase: 15.23, dauRange: 35.77,
      conversionBase: 1.45, conversionRange: 2.55
    },
    forksy: { // Food Delivery
      clvBase: 95.34, clvRange: 180.66, aovBase: 28.45, aovRange: 65.55,
      mrrBase: 800.23, mrrRange: 2200.77, dauBase: 85.67, dauRange: 200.33,
      conversionBase: 4.56, conversionRange: 7.44
    },
    pulseon: { // Fitness Platform
      clvBase: 220.78, clvRange: 380.22, aovBase: 35.67, aovRange: 75.33,
      mrrBase: 3200.45, mrrRange: 7800.55, dauBase: 65.34, dauRange: 150.66,
      conversionBase: 3.23, conversionRange: 5.77
    },
    procura: { // Procurement Platform
      clvBase: 8500.34, clvRange: 18000.66, aovBase: 2800.45, aovRange: 12000.55,
      mrrBase: 12000.67, mrrRange: 35000.33, dauBase: 8.23, dauRange: 25.77,
      conversionBase: 0.89, conversionRange: 1.67
    },
    mindora: { // Mental Health Platform
      clvBase: 450.67, clvRange: 850.33, aovBase: 125.34, aovRange: 185.66,
      mrrBase: 2800.45, mrrRange: 6500.55, dauBase: 25.67, dauRange: 65.33,
      conversionBase: 2.67, conversionRange: 4.33
    },
    keynest: { // Property Management
      clvBase: 3200.45, clvRange: 8500.55, aovBase: 1850.67, aovRange: 3200.33,
      mrrBase: 15000.34, mrrRange: 45000.66, dauBase: 12.45, dauRange: 35.55,
      conversionBase: 1.23, conversionRange: 2.77
    },
    fluxly: { // Supply Chain Platform
      clvBase: 5500.78, clvRange: 12000.22, aovBase: 850.34, aovRange: 4200.66,
      mrrBase: 8500.45, mrrRange: 25000.55, dauBase: 18.67, dauRange: 45.33,
      conversionBase: 1.67, conversionRange: 3.33
    },
    brightfund: { // Nonprofit Platform
      clvBase: 125.45, clvRange: 450.55, aovBase: 45.67, aovRange: 185.33,
      mrrBase: 1500.34, mrrRange: 4500.66, dauBase: 35.23, dauRange: 85.77,
      conversionBase: 3.45, conversionRange: 6.55
    }
  };
  
  const persona = personaMetrics[category] || personaMetrics.modaic;
  
  return {
    customerLifetimeValue: Math.round(((persona.clvBase + seededRandom(seed) * persona.clvRange) * multiplier.clv) * 100) / 100,
    averageOrderValue: Math.round(((persona.aovBase + seededRandom(seed + 1) * persona.aovRange) * multiplier.aov) * 100) / 100,
    monthlyRecurringRevenue: Math.round(((persona.mrrBase + seededRandom(seed + 2) * persona.mrrRange) * multiplier.mrr) * 100) / 100,
    dailyActiveUsers: Math.floor((persona.dauBase + seededRandom(seed + 3) * persona.dauRange) * multiplier.dau),
    conversionRate: Math.round(((persona.conversionBase + seededRandom(seed + 4) * persona.conversionRange) * multiplier.conversion) * 100) / 100
  };
}

// Generate realistic payment amount
function generateRealisticAmount(seed: number, category: string, stage: string): number {
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
  
  return Math.round(baseAmount * 100) / 100;
}

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
  
  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharedDatasetUrl, setSharedDatasetUrl] = useState<string | null>(null);
  
  // Dataset creation hook
  const { createDataset, isCreating, error, clearError } = useDatasetCreation();

  // Load custom categories from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('synthkit-custom-categories');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCustomCategories(parsed.map((cat: any) => ({
          ...cat,
          createdAt: new Date(cat.createdAt)
        })));
      } catch (error) {
        console.error('Failed to load custom categories:', error);
      }
    }
  }, []);

  // Save custom categories to localStorage
  useEffect(() => {
    localStorage.setItem('synthkit-custom-categories', JSON.stringify(customCategories));
  }, [customCategories]);

  // Generate data when scenario configuration changes
  useEffect(() => {
    generateScenarioData();
  }, [selectedCategory, role, stage, scenarioId]);

  // Generate business metrics on client side to avoid hydration mismatch
  useEffect(() => {
    if (selectedCategory && stage) {
      const mappedCategory = isCustomCategory(selectedCategory) 
        ? mapAIBusinessTypeToCategory(getCustomCategory(selectedCategory)?.aiAnalysis?.businessContext?.type || '')
        : selectedCategory;
      
      const metrics = generateBusinessMetrics(mappedCategory, stage, scenarioId);
      setBusinessMetrics(metrics);
      setMetricsLoaded(true);
    }
  }, [selectedCategory, stage, scenarioId]);

  // Save current dataset to sessionStorage and API for live integration
  useEffect(() => {
    if (metricsLoaded && (customers.length > 0 || Object.keys(dynamicEntities).length > 0)) {
      const currentDataset = {
        data: isCustomCategory(selectedCategory) && Object.keys(dynamicEntities).length > 0
          ? { ...dynamicEntities, customers: dynamicEntities.customers || [], payments: dynamicEntities.payments || [], businessMetrics: businessMetrics || {} }
          : { customers, payments, businessMetrics: businessMetrics || {} },
        metadata: {
          type: isCustomCategory(selectedCategory) ? 'ai-generated' : 'scenario',
          scenario: isCustomCategory(selectedCategory) ? undefined : { category: selectedCategory, role, stage, id: scenarioId },
          aiAnalysis: isCustomCategory(selectedCategory) ? { prompt: aiPrompt, analysis: getCustomCategory(selectedCategory)?.aiAnalysis } : undefined,
          updatedAt: new Date().toISOString()
        }
      };
      
      // Save full dataset to Live API (primary method - unlimited size)
      fetch('/api/dataset/current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentDataset)
      }).then(() => {
        console.log('📡 Full dataset saved to Live API (unlimited size)');
      }).catch(err => {
        console.warn('Live API update failed:', err.message);
      });
      
      // Optionally cache to sessionStorage for speed (if small enough)
      try {
        const dataString = JSON.stringify(currentDataset);
        const sizeInMB = new Blob([dataString]).size / (1024 * 1024);
        
        if (sizeInMB <= 4) {
          sessionStorage.setItem('synthkit-current-dataset', dataString);
          console.log(`📊 Cached dataset to sessionStorage (${sizeInMB.toFixed(2)}MB)`);
        } else {
          console.log(`📊 Dataset too large for sessionStorage cache (${sizeInMB.toFixed(1)}MB) - using API only`);
        }
      } catch (error) {
        // SessionStorage is optional - API is the primary method
        console.log('SessionStorage cache unavailable - using API only');
      }
    }
  }, [customers, payments, dynamicEntities, businessMetrics, metricsLoaded, selectedCategory, role, stage, scenarioId]);

  // Helper functions
  const isCustomCategory = (categoryId: string): boolean => {
    return !PREDEFINED_PERSONAS.hasOwnProperty(categoryId);
  };

  const getCustomCategory = (categoryId: string): CustomCategory | undefined => {
    return customCategories.find(cat => cat.id === categoryId);
  };

  const getCurrentBusinessContext = () => {
    if (isCustomCategory(selectedCategory)) {
      const customCat = getCustomCategory(selectedCategory);
      return customCat?.aiAnalysis?.businessContext;
    }
    return PREDEFINED_PERSONAS[selectedCategory as keyof typeof PREDEFINED_PERSONAS]?.businessContext;
  };

  const getCurrentEntities = () => {
    if (isCustomCategory(selectedCategory)) {
      const customCat = getCustomCategory(selectedCategory);
      return customCat?.aiAnalysis?.entities || [];
    }
    return PREDEFINED_PERSONAS[selectedCategory as keyof typeof PREDEFINED_PERSONAS]?.entities || [];
  };

  const getCurrentKeyFeatures = () => {
    if (isCustomCategory(selectedCategory)) {
      const customCat = getCustomCategory(selectedCategory);
      return customCat?.aiAnalysis?.keyFeatures || [];
    }
    return PREDEFINED_PERSONAS[selectedCategory as keyof typeof PREDEFINED_PERSONAS]?.keyFeatures || [];
  };

  const getCurrentUserRoles = () => {
    if (isCustomCategory(selectedCategory)) {
      const customCat = getCustomCategory(selectedCategory);
      return customCat?.aiAnalysis?.userRoles || [];
    }
    return PREDEFINED_PERSONAS[selectedCategory as keyof typeof PREDEFINED_PERSONAS]?.userRoles || [];
  };

  // Generate dynamic entity data based on AI analysis or predefined entities
  const generateEntityData = (entityInfo: any, volume: number, seedOffset: number) => {
    const entityData = [];
    const entityName = entityInfo.name.toLowerCase();
    
    for (let i = 0; i < volume; i++) {
      const seed = scenarioId + seedOffset + i;
      const item: any = { id: `${entityName}-${seed}` };
      
      // Generate data based on entity properties
      if (entityInfo.properties && entityInfo.properties.length > 0) {
        entityInfo.properties.forEach((prop: any) => {
          switch (prop.type) {
            case 'string':
              if (prop.name.includes('email')) {
                item[prop.name] = `${entityName}${i + 1}@example.com`;
              } else if (prop.name.includes('name') || prop.name.includes('title')) {
                item[prop.name] = `${entityInfo.name} ${i + 1}`;
              } else {
                item[prop.name] = `Sample ${prop.name}`;
              }
              break;
            case 'number':
              if (prop.name.includes('amount') || prop.name.includes('price')) {
                item[prop.name] = generateRealisticAmount(seed, 'modaic', stage);
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
        // Default properties if none specified
        item.name = `${entityInfo.name} ${i + 1}`;
        item.createdAt = new Date(Date.now() - seededRandom(seed) * 365 * 24 * 60 * 60 * 1000).toISOString();
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
      // Generate legacy customers/payments for predefined personas
      const newCustomers: Customer[] = [];
      for (let i = 0; i < volume.expected; i++) {
        const seed = scenarioId + i;
        newCustomers.push({
          id: `customer-${seed}`,
          name: `Customer ${i + 1}`,
          email: `customer${i + 1}@example.com`,
          loyaltyTier: ['Bronze', 'Silver', 'Gold'][Math.floor(seededRandom(seed) * 3)],
          createdAt: new Date(Date.now() - seededRandom(seed + 1) * 365 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
      
      // Generate payments with category-specific multipliers
      const paymentMultipliers: Record<string, number> = {
        modaic: 2.3, stratus: 0.8, forksy: 4.7,
        pulseon: 1.2, procura: 3.1, mindora: 0.9,
        keynest: 12.5, fluxly: 2.8, brightfund: 4.2
      };
      const paymentMultiplier = paymentMultipliers[mappedCategory] || 2.3;
      const paymentCount = Math.floor(volume.expected * paymentMultiplier);
      
      const newPayments: Payment[] = [];
      for (let i = 0; i < paymentCount; i++) {
        const seed = scenarioId + 10000 + i;
        const customerIndex = Math.floor(seededRandom(seed) * newCustomers.length);
        const amount = generateRealisticAmount(seed, mappedCategory, stage);
        
        newPayments.push({
          id: `payment-${seed}`,
          customerId: newCustomers[customerIndex]?.id || `customer-${seed}`,
          amount: amount,
          status: seededRandom(seed + 1) > 0.1 ? 'completed' : 'pending',
          paymentMethod: ['credit_card', 'paypal', 'bank_transfer'][Math.floor(seededRandom(seed + 2) * 3)],
          createdAt: new Date(Date.now() - seededRandom(seed + 3) * 30 * 24 * 60 * 60 * 1000).toISOString()
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
        
        // Trigger dataset generation and saving after AI analysis completes
        // This will be handled by the existing useEffect that watches for data changes
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Synthkit
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Generate realistic synthetic data for your applications
          </p>
        </div>

        {/* Business Configuration Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Business Configuration
          </h2>
          
          {/* Category Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {/* Predefined personas */}
              {Object.entries(PREDEFINED_PERSONAS).map(([key, persona]) => (
                <option key={key} value={key}>
                  {persona.name}
                </option>
              ))}
              
              {/* Custom AI categories */}
              {customCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.displayName} ✨
                </option>
              ))}
            </select>
            
            {/* Custom category management */}
            {customCategories.length > 0 && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Custom categories:
                {customCategories.map((category) => (
                  <span key={category.id} className="inline-flex items-center ml-2">
                    {category.displayName}
                    <button
                      onClick={() => handleDeleteCustomCategory(category.id)}
                      className="ml-1 text-red-500 hover:text-red-700"
                      title="Delete custom category"
                    >
                      🗑️
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI Prompt Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Business Prompt
            </label>
            <div className="flex gap-2">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your business idea (e.g., 'A growth stage platform for food delivery with real-time tracking and restaurant partnerships')"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                rows={3}
              />
              <button
                onClick={handleAnalyzeBusiness}
                disabled={!aiPrompt.trim() || isAnalyzing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? '🤖 Analyzing...' : '🤖 Analyze Business'}
              </button>
            </div>
          </div>

          {/* AI Analysis Reasoning (only for AI-generated) */}
          {isCustomCategory(selectedCategory) && aiAnalysis && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                💡 Analysis Reasoning
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This appears to be a <strong>{aiAnalysis.businessContext.type}</strong> in the{' '}
                <strong>{aiAnalysis.businessContext.stage}</strong> stage. Key features include{' '}
                {aiAnalysis.keyFeatures.slice(0, 3).join(', ')}, targeting{' '}
                {aiAnalysis.businessContext.targetAudience.slice(0, 2).join(' and ')}.
              </p>
            </div>
          )}
        </div>

        {/* Scenario Configuration Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Scenario Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'support')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="admin">Admin</option>
                <option value="support">Support</option>
              </select>
            </div>

            {/* Stage Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as 'early' | 'growth' | 'enterprise')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="early">Early</option>
                <option value="growth">Growth</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID
              </label>
              <input
                type="number"
                value={scenarioId}
                onChange={(e) => setScenarioId(parseInt(e.target.value) || 12345)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Share Dataset Button */}
          <div className="flex justify-end">
            <button
              onClick={handleCreateDataset}
              disabled={isCreating}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? '📤 Creating...' : '📤 Share Dataset'}
            </button>
          </div>
        </div>

        {/* Business Context, Key Features, User Roles, Data Entities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Business Context */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📊 Business Context
            </h3>
            {getCurrentBusinessContext() && (
              <div className="space-y-3">
                <div><span className="font-medium">Type:</span> <span className="capitalize">{getCurrentBusinessContext()?.type}</span></div>
                <div><span className="font-medium">Stage:</span> <span className="capitalize">{getCurrentBusinessContext()?.stage}</span></div>
                <div><span className="font-medium">Monetization:</span> <span className="capitalize">{getCurrentBusinessContext()?.monetizationModel}</span></div>
                <div>
                  <span className="font-medium">Target Audience:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(getCurrentBusinessContext()?.targetAudience || []).map((audience, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              ⚡ Key Features
            </h3>
            <div className="flex flex-wrap gap-2">
              {getCurrentKeyFeatures().map((feature, i) => (
                <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* User Roles */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              👥 User Roles
            </h3>
            <div className="space-y-3">
              {getCurrentUserRoles().map((role, i) => (
                <div key={i} className="border-l-4 border-purple-500 pl-4">
                  <div className="font-medium text-purple-800 dark:text-purple-200">{role.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{role.description}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(role.permissions || []).map((permission, j) => (
                      <span key={j} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Entities */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🗃️ Data Entities
            </h3>
            <div className="space-y-4">
              {getCurrentEntities().map((entity, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-600 rounded p-3">
                  <div className="font-medium text-gray-900 dark:text-white">{entity.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-2">{entity.type}</div>
                  <div className="space-y-1">
                    {(entity.properties || []).map((prop, j) => (
                      <div key={j} className="text-sm">
                        <span className="font-medium">{prop.name}</span>
                        <span className="text-gray-500 dark:text-gray-400"> ({prop.type})</span>
                        {prop.description && (
                          <span className="text-gray-600 dark:text-gray-300"> - {prop.description}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Object Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {isCustomCategory(selectedCategory) && Object.keys(dynamicEntities).length > 0 ? (
            // Dynamic entities for AI scenarios
            Object.entries(dynamicEntities).map(([entityName, entityData]) => (
              <div key={entityName} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  📊 {entityName.charAt(0).toUpperCase() + entityName.slice(1)} ({entityData.length.toLocaleString()})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {entityData.slice(0, 10).map((item: any) => (
                    <div key={item.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="space-y-1">
                        {Object.entries(item).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                              {key}:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white">
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
                  {entityData.length > 10 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                      ... and {(entityData.length - 10).toLocaleString()} more
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Legacy customers/payments for predefined personas
            <>
              {/* Customers */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  👥 Customers ({customers.length.toLocaleString()})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {customers.slice(0, 10).map((customer) => (
                    <div key={customer.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                        {customer.loyaltyTier}
                      </span>
                    </div>
                  ))}
                  {customers.length > 10 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                      ... and {(customers.length - 10).toLocaleString()} more
                    </div>
                  )}
                </div>
              </div>

              {/* Payments */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  💳 Payments ({payments.length.toLocaleString()})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {payments.slice(0, 10).map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          ${typeof payment.amount === 'number' ? payment.amount.toFixed(2) : payment.amount}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{payment.paymentMethod}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        payment.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                  {payments.length > 10 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                      ... and {(payments.length - 10).toLocaleString()} more
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Realistic Business Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📊 Realistic Business Metrics
          </h3>
          {metricsLoaded && businessMetrics ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${businessMetrics.customerLifetimeValue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Customer Lifetime Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${businessMetrics.averageOrderValue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Order Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ${businessMetrics.monthlyRecurringRevenue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Recurring Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {businessMetrics.dailyActiveUsers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Daily Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {businessMetrics.conversionRate.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">Loading metrics...</div>
          )}
        </div>
      </div>

      {/* Dataset Share Modal */}
      {shareModalOpen && sharedDatasetUrl && (
        <DatasetShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          url={sharedDatasetUrl}
          datasetInfo={getDatasetInfo()}
        />
      )}
    </div>
  );
}
