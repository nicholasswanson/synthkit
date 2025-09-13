import { z } from 'zod';

export const scenarioConfigSchema = z.object({
  category: z.string(),
  role: z.string(),
  stage: z.enum(['early', 'growth', 'enterprise']),
  id: z.number(),
  locale: z.string().optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  volume: z.record(z.number()).optional(),
  relationships: z.record(z.any()).optional(),
});

export const configSchema = z.object({
  version: z.string().default('1.0.0'),
  packs: z.array(z.string()).default([]),
  scenarios: z.record(scenarioConfigSchema).default({}),
});

// Type exports derived from schemas
export type ScenarioConfig = z.infer<typeof scenarioConfigSchema>;
export type SynthConfig = z.infer<typeof configSchema>;
