import { z } from 'zod';
import type { JSONSchema7 } from 'json-schema';
import type { ScenarioConfig, SynthConfig } from './config/schema';

// Core types for data generation aligned with synthetic-dataset structure
export interface GenerationContext {
  seed?: number;
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
  description?: string;
  version: string;
  schemas: Record<string, JSONSchema7>;
  scenarios: Record<string, Scenario>;
  personas: Record<string, Persona>;
  routes?: Record<string, RouteConfig>;
}

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  config: {
    seed?: number;
    locale?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    volume?: {
      users?: number;
      products?: number;
      orders?: number;
      [key: string]: number | undefined;
    };
    relationships?: Record<string, any>;
  };
}

export interface Persona {
  id: string;
  name: string;
  description?: string;
  preferences?: {
    locale?: string;
    timezone?: string;
    currency?: string;
    [key: string]: any;
  };
  overrides?: Record<string, any>;
}

export interface RouteConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  schema?: string;
  count?: number;
  delay?: number;
}

// Role and Category types
export interface Role {
  id: string;
  name: string;
  accessLevel: 'admin' | 'support' | 'readonly';
  dataVisibility?: {
    fullAccess?: boolean;
    maskedFields?: string[];
    hiddenFields?: string[];
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  stages?: {
    early?: Record<string, number>;
    growth?: Record<string, number>;
    enterprise?: Record<string, number>;
  };
}



// Zod schemas for validation
export const GenerationContextSchema = z.object({
  seed: z.number().optional(),
  id: z.number().optional(),
  locale: z.string().optional(),
  timeZone: z.string().optional(),
  baseDate: z.date().optional(),
});


// Legacy types for backward compatibility
/** @deprecated Use GenerationContext instead */
export type ScenarioContext = GenerationContext;

/** @deprecated Use ScenarioConfig instead */
export type LegacyScenario = ScenarioConfig;

// Generator interface
export interface Generator<T = any> {
  name: string;
  generate: (opts?: GeneratorOptions<T>) => T;
  generateMany: (count: number, opts?: GeneratorOptions<T>) => T[];
  schema?: any;
}

// ScenarioPack alias for backward compatibility
export type ScenarioPack = DataPack;
