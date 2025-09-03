import { z } from 'zod';

export const configSchema = z.object({
  packs: z.array(z.string()).default([]),
  scenarios: z.object({
    default: z.string().optional(),
    active: z.array(z.string()).optional(),
  }).default({}),
  generators: z.object({
    seed: z.number().optional(),
    locale: z.string().optional(),
    timeZone: z.string().optional(),
  }).default({}),
  msw: z.object({
    enabled: z.boolean().default(true),
    delay: z.union([
      z.number(),
      z.object({
        min: z.number(),
        max: z.number(),
      }),
    ]).optional(),
  }).optional(),
});
