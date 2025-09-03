import type { JSONSchema7 } from 'json-schema';

export interface ScenarioPack {
  id: string;
  name: string;
  description: string;
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
  schema: string;
  rest?: boolean;
  methods?: string[];
  middleware?: string[];
}
