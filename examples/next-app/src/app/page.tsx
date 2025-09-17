'use client';

import { useState, useEffect } from 'react';
import { DynamicRightPanel } from '@/components/DynamicRightPanel';
import { useDatasetCreation } from '@/hooks/useDatasetCreation';
import { TestIntegration } from '@/components/TestIntegration';

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
  id: string;
  displayName: string;
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

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate realistic payment amounts based on category and stage
function generateRealisticAmount(seed: number, category: string, stage: string): number {
  const categoryRanges: Record<string, { min: number; max: number }> = {
    modaic: { min: 25.00, max: 300.00 },     // Fashion e-commerce
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

// Generate business metrics with realistic ranges (from documentation)
function generateBusinessMetrics(category: string, stage: string, seed: number): BusinessMetrics {
  // Stage-specific ranges from documentation
  const stageRanges = {
    early: {
      clv: { min: 85, max: 320 },
      aov: { min: 67, max: 213 },
      mrr: { min: 1248, max: 6926 },
      dau: { min: 4, max: 45 },
      conversion: { min: 2.3, max: 6.0 }
    },
    growth: {
      clv: { min: 196, max: 736 },
      aov: { min: 121, max: 383 },
      mrr: { min: 3993, max: 22163 },
      dau: { min: 16, max: 185 },
      conversion: { min: 3.2, max: 8.4 }
    },
    enterprise: {
      clv: { min: 488, max: 1824 },
      aov: { min: 229, max: 725 },
      mrr: { min: 11106, max: 61643 },
      dau: { min: 49, max: 570 },
      conversion: { min: 4.9, max: 15.4 }
    }
  };
  
  const ranges = stageRanges[stage as keyof typeof stageRanges] || stageRanges.growth;
  
  return {
    customerLifetimeValue: Math.round((ranges.clv.min + seededRandom(seed) * (ranges.clv.max - ranges.clv.min)) * 100) / 100,
    averageOrderValue: Math.round((ranges.aov.min + seededRandom(seed + 1) * (ranges.aov.max - ranges.aov.min)) * 100) / 100,
    monthlyRecurringRevenue: Math.round((ranges.mrr.min + seededRandom(seed + 2) * (ranges.mrr.max - ranges.mrr.min)) * 100) / 100,
    dailyActiveUsers: Math.floor(ranges.dau.min + seededRandom(seed + 3) * (ranges.dau.max - ranges.dau.min)),
    conversionRate: Math.round((ranges.conversion.min + seededRandom(seed + 4) * (ranges.conversion.max - ranges.conversion.min)) * 100) / 100
  };
}

export default function Home() {
  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>('modaic');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisData['analysis'] | null>(null);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [role, setRole] = useState<'admin' | 'support'>('admin');
  const [stage, setStage] = useState<'early' | 'growth' | 'enterprise'>('growth');
  const [scenarioId, setScenarioId] = useState<number>(12345);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [metricsLoaded, setMetricsLoaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentDatasetUrl, setCurrentDatasetUrl] = useState<string | null>(null);
  const [integrationLoading, setIntegrationLoading] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

  // Dataset creation hook
  const { createDataset } = useDatasetCreation();

  // Set client flag to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate business metrics on client side to avoid hydration mismatch
  useEffect(() => {
    if (isClient && selectedCategory && stage) {
      const metrics = generateBusinessMetrics(selectedCategory, stage, scenarioId);
      setBusinessMetrics(metrics);
      setMetricsLoaded(true);
    }
  }, [isClient, selectedCategory, stage, scenarioId]);

  // Generate realistic data based on stage and category
  useEffect(() => {
    if (isClient && selectedCategory && stage) {
      // Get realistic volume based on stage (from documentation)
      const baseVolumes = {
        early: { min: 47, max: 523 },
        growth: { min: 1247, max: 9876 },
        enterprise: { min: 12456, max: 987654 }
      };
      
      const volume = baseVolumes[stage] || baseVolumes.growth;
      const customerCount = Math.floor(volume.min + seededRandom(scenarioId) * (volume.max - volume.min));
      
      // Apply category-specific multipliers (from documentation)
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
      
      const categoryMultiplier = categoryMultipliers[selectedCategory] || 1.0;
      const finalCustomerCount = Math.floor(customerCount * categoryMultiplier);
      
      // Generate customers
      const newCustomers: Customer[] = [];
      for (let i = 0; i < finalCustomerCount; i++) {
        const seed = scenarioId + i;
        newCustomers.push({
          id: `customer-${scenarioId}-${i}`,
          name: `Customer ${i + 1}`,
          email: `customer${i + 1}@example.com`,
          loyaltyTier: ['Bronze', 'Silver', 'Gold'][Math.floor(seededRandom(seed) * 3)],
          createdAt: new Date(Date.now() - seededRandom(seed + 1) * 365 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
      setCustomers(newCustomers);

      // Generate payments with realistic multipliers
      const paymentMultipliers: Record<string, number> = {
        modaic: 1.0,      // Standard e-commerce
        stratus: 0.8,     // B2B SaaS (fewer transactions)
        forksy: 4.7,      // Food delivery (high frequency)
        pulseon: 1.2,     // Fitness (monthly subscriptions)
        procura: 3.1,     // Healthcare (regular supplies)
        mindora: 0.9,     // Online learning (course purchases)
        keynest: 12.5,    // Real estate (rent payments)
        fluxly: 2.8,      // Creator economy (content purchases)
        brightfund: 4.2   // Non-profit (donations)
      };
      
      const paymentMultiplier = paymentMultipliers[selectedCategory] || 1.0;
      const paymentCount = Math.floor(finalCustomerCount * paymentMultiplier);
      
      const newPayments: Payment[] = [];
      for (let i = 0; i < paymentCount; i++) {
        const seed = scenarioId + 10000 + i;
        const customerIndex = Math.floor(seededRandom(seed) * newCustomers.length);
        const amount = generateRealisticAmount(seed, selectedCategory, stage);
        
        newPayments.push({
          id: `payment-${scenarioId}-${i}`,
          customerId: newCustomers[customerIndex]?.id || `customer-${scenarioId}-${i % finalCustomerCount}`,
          amount: amount,
          status: seededRandom(seed + 1) > 0.1 ? 'completed' : 'pending',
          paymentMethod: ['credit_card', 'paypal', 'bank_transfer'][Math.floor(seededRandom(seed + 2) * 3)],
          createdAt: new Date(Date.now() - seededRandom(seed + 3) * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
      setPayments(newPayments);
    }
  }, [isClient, selectedCategory, stage, scenarioId]);

  // Auto-create dataset when data is ready
  useEffect(() => {
    if (isClient && customers.length > 0 && payments.length > 0 && businessMetrics && !currentDatasetUrl) {
      handleCreateDataset();
    }
  }, [isClient, customers, payments, businessMetrics, currentDatasetUrl]);

  // Handle dataset creation
  const handleCreateDataset = async () => {
    if (currentDatasetUrl) return;
    
    setIntegrationLoading(true);
    try {
      const url = await createDataset({
        type: 'scenario',
        data: { customers, payments, businessMetrics: businessMetrics || {} },
        metadata: {
          scenario: {
            category: selectedCategory,
            role,
            stage,
            id: scenarioId
          }
        }
      });
      
      if (url) {
        setCurrentDatasetUrl(url);
      }
    } catch (error) {
      console.error('Failed to create dataset:', error);
    } finally {
      setIntegrationLoading(false);
    }
  };

  // Handle AI analysis
  const handleAnalyzeAI = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAnalyzingAI(true);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiPrompt })
      });
      
      const data: AnalysisData = await response.json();
      
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
        // In a real implementation, you would create a custom category here
        console.log('AI Analysis completed:', data.analysis);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const getDatasetInfo = () => {
    return {
      type: 'scenario' as const,
      recordCounts: { customers: customers.length, payments: payments.length },
      scenario: {
        category: selectedCategory,
        role,
        stage,
        id: scenarioId
      }
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Left Panel - Configuration and Data */}
        <div className="w-1/2 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Synthkit
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Generate realistic synthetic data for your applications
              </p>
            </div>

            {/* Test Integration Component */}
            <TestIntegration />

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
                  {Object.entries(PREDEFINED_PERSONAS).map(([key, persona]) => (
                    <option key={key} value={key}>
                      {persona.name}
                    </option>
                  ))}
                </select>
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
                    onClick={handleAnalyzeAI}
                    disabled={!aiPrompt.trim() || isAnalyzingAI}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzingAI ? '🤖 Analyzing...' : '🤖 Analyze Business'}
                  </button>
                </div>
              </div>

              {/* Scenario Configuration */}
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
                    <option value="early">Early Stage</option>
                    <option value="growth">Growth Stage</option>
                    <option value="enterprise">Enterprise Stage</option>
                  </select>
                </div>

                {/* Scenario ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Scenario ID
                  </label>
                  <input
                    type="number"
                    value={scenarioId}
                    onChange={(e) => setScenarioId(parseInt(e.target.value) || 12345)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Realistic Business Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                📊 Realistic Business Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {metricsLoaded && businessMetrics ? `$${businessMetrics.customerLifetimeValue.toFixed(2)}` : 'Loading...'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Customer Lifetime Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark.text-green-400">
                    {metricsLoaded && businessMetrics ? `$${businessMetrics.averageOrderValue.toFixed(2)}` : 'Loading...'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Order Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {metricsLoaded && businessMetrics ? `$${businessMetrics.monthlyRecurringRevenue.toFixed(2)}` : 'Loading...'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Recurring Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {metricsLoaded && businessMetrics ? businessMetrics.dailyActiveUsers.toLocaleString() : 'Loading...'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Daily Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {metricsLoaded && businessMetrics ? `${businessMetrics.conversionRate.toFixed(2)}%` : 'Loading...'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</div>
                </div>
              </div>
            </div>

            {/* Object Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Customers */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  👥 Customers ({customers.length.toLocaleString()})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {customers.slice(0, 10).map((customer) => (
                    <div key={customer.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">{customer.loyaltyTier}</div>
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
                    <div key={payment.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${typeof payment.amount === 'number' ? payment.amount.toFixed(2) : payment.amount}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">{payment.status}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{payment.paymentMethod}</div>
                    </div>
                  ))}
                  {payments.length > 10 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                      ... and {(payments.length - 10).toLocaleString()} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Integration Examples */}
        <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 overflow-y-auto max-h-screen">
          <DynamicRightPanel
            currentDatasetUrl={currentDatasetUrl}
            datasetInfo={getDatasetInfo()}
            integrationLoading={integrationLoading}
          />
        </div>
      </div>
    </div>
  );
}
