import { z } from 'zod';
import type { JSONSchema7 } from 'json-schema';

// Core types for data generation aligned with synthetic-dataset structure
export interface GenerationContext {
  id?: number;
  locale?: string;
  timeZone?: string;
  baseDate?: Date;
}

export interface GeneratorOptions<T = any> {
  context?: GenerationContext;
  overrides?: Partial<T>;
  count?: number;
}

export interface DataPack {
  id: string;
  name: string;
  description: string;
  version: string;
  schemas: Record<string, JSONSchema7>;
  categories: Record<string, Category>;
  roles: Record<string, Role>;
  routes?: Record<string, RouteConfig>;
}

export interface Generator<T = any> {
  name: string;
  generate: (options?: GeneratorOptions<T>) => T;
  generateMany: (count: number, options?: GeneratorOptions<T>) => T[];
  schema?: z.ZodType<T>;
}

// Categories represent business contexts (e.g., techstyle, saas, marketplace)
export interface Category {
  id: string;
  name: string;
  description?: string;
  businessType: 'ecommerce' | 'saas' | 'marketplace' | 'fintech' | 'healthcare' | 'education' | 'nonprofit';
  config: {
    id?: number;
    locale?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    volume?: {
      users?: number;
      products?: number;
      orders?: number;
      subscriptions?: number;
      transactions?: number;
      [key: string]: number | undefined;
    };
    relationships?: Record<string, any>;
    complexity?: 'early' | 'growth' | 'enterprise';
  };
}

// Roles define access levels and data visibility (admin, support, etc.)
export interface Role {
  id: string;
  name: string;
  description?: string;
  accessLevel: 'admin' | 'support' | 'readonly';
  dataVisibility: {
    // Fields that should be hidden for this role
    hiddenFields?: string[];
    // Fields that should be replaced with "hidden" value
    maskedFields?: string[];
    // Full access to all data
    fullAccess?: boolean;
  };
  overrides?: Record<string, any>;
}

export interface RouteConfig {
  schema: string;
  rest?: boolean;
  methods?: string[];
  middleware?: string[];
}

// Scenarios are now the top-level configuration combining category + role + stage + id
export interface Scenario {
  category: string;  // Business context (techstyle, saas, etc.)
  role: string;      // Access role (admin, support)
  stage: 'early' | 'growth' | 'enterprise';  // Business maturity stage
  id: number;        // Deterministic ID for generation
}

export interface SynthConfig {
  packs: string[];
  scenario: Scenario;
  generators: {
    id?: number;
    locale?: string;
    timeZone?: string;
  };
  msw?: {
    enabled?: boolean;
    delay?: number | { min: number; max: number };
  };
}

// Legacy type aliases for backward compatibility
/** @deprecated Use DataPack instead */
export type ScenarioPack = DataPack;

/** @deprecated Use Category instead */
export type Scenario = Category;

/** @deprecated Use Role instead */
export type Persona = Role;

/** @deprecated Use GenerationContext instead */
export type ScenarioContext = GenerationContext;