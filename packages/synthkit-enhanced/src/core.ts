// Core Synthkit Enhanced - Zero Dependencies
import type { SynthkitData, SynthkitOptions, SynthkitResult, SynthkitStatus, SynthkitDebug } from './types';

// Embedded fallback data - always available
const EMBEDDED_DATA: SynthkitData = {
  customers: [
    {
      id: 'cus_1',
      name: 'Sarah Chen',
      email: 'sarah.chen@techstartup.io',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      company: 'TechStartup Inc',
      location: 'San Francisco, CA',
      joinDate: '2023-03-15T00:00:00Z',
      totalSpent: 2847.50,
      lastActive: '2024-01-15T14:30:00Z'
    },
    {
      id: 'cus_2',
      name: 'Marcus Johnson',
      email: 'marcus.j@designstudio.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      company: 'Design Studio',
      location: 'New York, NY',
      joinDate: '2023-01-20T00:00:00Z',
      totalSpent: 1923.75,
      lastActive: '2024-01-14T09:15:00Z'
    },
    {
      id: 'cus_3',
      name: 'Elena Rodriguez',
      email: 'elena@consultingfirm.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      company: 'Consulting Firm',
      location: 'Austin, TX',
      joinDate: '2023-05-10T00:00:00Z',
      totalSpent: 4567.25,
      lastActive: '2024-01-15T16:45:00Z'
    }
  ],
  charges: [
    {
      id: 'ch_1',
      customerId: 'cus_1',
      amount: 2999,
      currency: 'usd',
      status: 'succeeded',
      description: 'Pro Plan - Monthly',
      date: '2024-01-15T00:00:00Z'
    },
    {
      id: 'ch_2',
      customerId: 'cus_2',
      amount: 1999,
      currency: 'usd',
      status: 'succeeded',
      description: 'Basic Plan - Monthly',
      date: '2024-01-14T00:00:00Z'
    },
    {
      id: 'ch_3',
      customerId: 'cus_3',
      amount: 4999,
      currency: 'usd',
      status: 'succeeded',
      description: 'Enterprise Plan - Monthly',
      date: '2024-01-15T00:00:00Z'
    }
  ],
  subscriptions: [
    {
      id: 'sub_1',
      customerId: 'cus_1',
      planId: 'plan_pro',
      status: 'active',
      currentPeriodStart: '2024-01-15T00:00:00Z',
      currentPeriodEnd: '2024-02-15T00:00:00Z'
    },
    {
      id: 'sub_2',
      customerId: 'cus_2',
      planId: 'plan_basic',
      status: 'active',
      currentPeriodStart: '2024-01-14T00:00:00Z',
      currentPeriodEnd: '2024-02-14T00:00:00Z'
    }
  ],
  invoices: [
    {
      id: 'in_1',
      customerId: 'cus_1',
      amount: 2999,
      currency: 'usd',
      status: 'paid',
      date: '2024-01-15T00:00:00Z'
    }
  ],
  plans: [
    {
      id: 'plan_basic',
      name: 'Basic Plan',
      amount: 1999,
      currency: 'usd',
      interval: 'month'
    },
    {
      id: 'plan_pro',
      name: 'Pro Plan',
      amount: 2999,
      currency: 'usd',
      interval: 'month'
    },
    {
      id: 'plan_enterprise',
      name: 'Enterprise Plan',
      amount: 4999,
      currency: 'usd',
      interval: 'month'
    }
  ],
  metadata: {
    source: 'embedded',
    generatedAt: new Date().toISOString(),
    count: {
      customers: 3,
      charges: 3,
      subscriptions: 2,
      invoices: 1,
      plans: 3
    }
  }
};

class SynthkitCore {
  private cache = new Map<string, { data: SynthkitData; timestamp: number }>();
  private cacheTimeout: number;

  constructor(options: SynthkitOptions = {}) {
    this.cacheTimeout = options.cacheTimeout || 5 * 60 * 1000; // 5 minutes
  }

  // Environment detection
  private detectEnvironment(): { platform: string; nodeVersion?: string; capabilities: string[] } {
    const platform = this.detectPlatform();
    const nodeVersion = this.detectNodeVersion();
    const capabilities = this.detectCapabilities();

    return { platform, nodeVersion, capabilities };
  }

  private detectPlatform(): string {
    if (typeof window !== 'undefined') return 'browser';
    if (typeof (globalThis as any).Deno !== 'undefined') return 'deno';
    if (typeof (globalThis as any).Bun !== 'undefined') return 'bun';
    return 'node';
  }

  private detectNodeVersion(): string | undefined {
    if (typeof process !== 'undefined' && process.version) {
      return process.version;
    }
    return undefined;
  }

  private detectCapabilities(): string[] {
    const capabilities: string[] = [];
    
    if (typeof fetch !== 'undefined') capabilities.push('fetch');
    if (typeof caches !== 'undefined') capabilities.push('cache');
    if (typeof CompressionStream !== 'undefined') capabilities.push('compression');
    if (typeof localStorage !== 'undefined') capabilities.push('localStorage');
    if (typeof sessionStorage !== 'undefined') capabilities.push('sessionStorage');
    
    return capabilities;
  }

  // Smart URL detection
  private getBaseUrl(options: SynthkitOptions = {}): string {
    if (options.baseUrl) return options.baseUrl;
    
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/dataset/current`;
    }
    
    return process.env.SYNTHKIT_URL || 'http://localhost:3001/api/dataset/current';
  }

  // Data fetching with fallbacks
  async getData(options: SynthkitOptions = {}): Promise<SynthkitResult> {
    const startTime = Date.now();
    
    // Check cache first
    const cached = this.cache.get('data');
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return {
        data: cached.data,
        status: options.showStatus ? {
          source: cached.data.metadata.source,
          message: `⚡ Using cached data`,
          connected: true
        } : undefined,
        debug: options.debug ? {
          environment: this.detectEnvironment().platform as 'browser' | 'node' | 'deno' | 'bun',
          nodeVersion: this.detectEnvironment().nodeVersion,
          capabilities: this.detectEnvironment().capabilities,
          dataFlow: ['cache'],
          performance: {
            fetchTime: Date.now() - startTime,
            cacheHit: true
          }
        } : undefined
      };
    }

    // Try data sources in order
    const dataFlow: string[] = [];
    
    try {
      // 1. Try sessionStorage (live demo)
      const sessionData = await this.trySessionStorage();
      if (sessionData) {
        dataFlow.push('sessionStorage');
        this.cache.set('data', { data: sessionData, timestamp: Date.now() });
        return this.createResult(sessionData, 'live', dataFlow, startTime, options);
      }
    } catch (error) {
      // Continue to next source
    }

    try {
      // 2. Try API endpoint
      const apiData = await this.tryApi(options);
      if (apiData) {
        dataFlow.push('api');
        this.cache.set('data', { data: apiData, timestamp: Date.now() });
        return this.createResult(apiData, 'demo', dataFlow, startTime, options);
      }
    } catch (error) {
      // Continue to fallback
    }

    // 3. Use embedded data (always works)
    dataFlow.push('embedded');
    this.cache.set('data', { data: EMBEDDED_DATA, timestamp: Date.now() });
    return this.createResult(EMBEDDED_DATA, 'embedded', dataFlow, startTime, options);
  }

  private async trySessionStorage(): Promise<SynthkitData | null> {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return null;
    }

    const liveData = sessionStorage.getItem('synthkit-current-dataset');
    if (!liveData) return null;

    const parsed = JSON.parse(liveData);
    return this.normalizeData(parsed.data || parsed);
  }

  private async tryApi(options: SynthkitOptions): Promise<SynthkitData | null> {
    const baseUrl = this.getBaseUrl(options);
    
    try {
      const response = await fetch(baseUrl);
      if (!response.ok) return null;
      
      const dataset = await response.json();
      return this.normalizeData(dataset.data || dataset);
    } catch (error) {
      return null;
    }
  }

  // Normalize data from different sources to consistent structure
  private normalizeData(rawData: any): SynthkitData {
    // Handle different data structures
    const data = rawData.data || rawData;
    
    return {
      customers: data.customers || [],
      charges: data.charges || [],
      subscriptions: data.subscriptions || [],
      invoices: data.invoices || [],
      plans: data.plans || [],
      metadata: {
        source: 'live',
        generatedAt: new Date().toISOString(),
        count: {
          customers: (data.customers || []).length,
          charges: (data.charges || []).length,
          subscriptions: (data.subscriptions || []).length,
          invoices: (data.invoices || []).length,
          plans: (data.plans || []).length
        }
      }
    };
  }

  private createResult(
    data: SynthkitData, 
    source: 'live' | 'demo' | 'embedded', 
    dataFlow: string[], 
    startTime: number, 
    options: SynthkitOptions
  ): SynthkitResult {
    const result: SynthkitResult = { data };

    if (options.showStatus) {
      const messages = {
        live: '📊 Connected to live Synthkit demo!',
        demo: '📡 Connected to live Synthkit API!',
        embedded: '⚡ Using embedded data'
      };
      
      result.status = {
        source,
        message: messages[source],
        connected: true
      };
    }

    if (options.debug) {
      const env = this.detectEnvironment();
      result.debug = {
        environment: env.platform as 'browser' | 'node' | 'deno' | 'bun',
        nodeVersion: env.nodeVersion,
        capabilities: env.capabilities,
        dataFlow,
        performance: {
          fetchTime: Date.now() - startTime,
          cacheHit: false
        }
      };
    }

    return result;
  }
}

// Export singleton instance
export const synthkit = new SynthkitCore();

// Export class for custom instances
export { SynthkitCore };
