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

// Simple seeded random function
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate business metrics
function generateBusinessMetrics(category: string, stage: string, seed: number): BusinessMetrics {
  const stageMultipliers = {
    early: { clv: 0.6, aov: 0.8, mrr: 0.4, dau: 0.3, conversion: 0.7 },
    growth: { clv: 1.0, aov: 1.0, mrr: 1.0, dau: 1.0, conversion: 1.0 },
    enterprise: { clv: 2.1, aov: 1.4, mrr: 3.2, dau: 4.7, conversion: 1.3 }
  };
  
  const multiplier = stageMultipliers[stage as keyof typeof stageMultipliers] || stageMultipliers.growth;
  
  return {
    customerLifetimeValue: Math.round(((180.45 + seededRandom(seed) * 220.55) * multiplier.clv) * 100) / 100,
    averageOrderValue: Math.round(((85.23 + seededRandom(seed + 1) * 140.77) * multiplier.aov) * 100) / 100,
    monthlyRecurringRevenue: Math.round(((1200.34 + seededRandom(seed + 2) * 3800.66) * multiplier.mrr) * 100) / 100,
    dailyActiveUsers: Math.floor((45.67 + seededRandom(seed + 3) * 120.33) * multiplier.dau),
    conversionRate: Math.round(((2.89 + seededRandom(seed + 4) * 4.11) * multiplier.conversion) * 100) / 100
  };
}

export default function Home() {
  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>('modaic');
  const [role, setRole] = useState<'admin' | 'support'>('admin');
  const [stage, setStage] = useState<'early' | 'growth' | 'enterprise'>('growth');
  const [scenarioId, setScenarioId] = useState<number>(12345);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [metricsLoaded, setMetricsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentDatasetUrl, setCurrentDatasetUrl] = useState<string | null>(null);
  const [integrationLoading, setIntegrationLoading] = useState(false);

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

  // Generate sample data
  useEffect(() => {
    if (isClient) {
      // Generate sample customers
      const newCustomers: Customer[] = [];
      for (let i = 0; i < 10; i++) {
        newCustomers.push({
          id: `customer-${scenarioId}-${i}`,
          name: `Customer ${i + 1}`,
          email: `customer${i + 1}@example.com`,
          loyaltyTier: ['Bronze', 'Silver', 'Gold'][i % 3],
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
      setCustomers(newCustomers);

      // Generate sample payments
      const newPayments: Payment[] = [];
      for (let i = 0; i < 15; i++) {
        newPayments.push({
          id: `payment-${scenarioId}-${i}`,
          customerId: `customer-${scenarioId}-${i % 10}`,
          amount: Math.round((25 + Math.random() * 200) * 100) / 100,
          status: ['completed', 'pending', 'failed'][i % 3],
          paymentMethod: ['credit_card', 'paypal', 'bank_transfer'][i % 3],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
      setPayments(newPayments);
    }
  }, [isClient, scenarioId]);

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
                  <option value="modaic">Modaic (Fashion E-commerce)</option>
                  <option value="stratus">Stratus (B2B SaaS)</option>
                  <option value="forksy">Forksy (Food Delivery)</option>
                </select>
              </div>

              {/* Role Selection */}
              <div className="mb-4">
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
              <div className="mb-4">
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
              <div className="mb-4">
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
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
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
        <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
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
