// Core types for Synthkit Enhanced

export interface SynthkitData {
  customers: Customer[];
  charges: Charge[];
  subscriptions?: Subscription[];
  invoices?: Invoice[];
  plans?: Plan[];
  metadata: {
    source: 'live' | 'demo' | 'embedded';
    generatedAt: string;
    count: {
      customers: number;
      charges: number;
      subscriptions?: number;
      invoices?: number;
      plans?: number;
    };
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  company?: string;
  location?: string;
  joinDate: string;
  totalSpent: number;
  lastActive: string;
  [key: string]: any;
}

export interface Charge {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  date: string;
  [key: string]: any;
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  [key: string]: any;
}

export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  [key: string]: any;
}

export interface Plan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: string;
  [key: string]: any;
}

export interface SynthkitStatus {
  source: 'live' | 'demo' | 'embedded';
  message: string;
  connected: boolean;
}

export interface SynthkitDebug {
  environment: 'browser' | 'node' | 'deno' | 'bun';
  nodeVersion?: string;
  capabilities: string[];
  dataFlow: string[];
  performance: {
    fetchTime?: number;
    cacheHit: boolean;
  };
}

export interface SynthkitOptions {
  showStatus?: boolean;
  debug?: boolean;
  cacheTimeout?: number;
  baseUrl?: string;
}

export interface SynthkitResult {
  data: SynthkitData;
  status?: SynthkitStatus;
  debug?: SynthkitDebug;
}
