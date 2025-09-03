import { z } from 'zod';
import type { Generator, GeneratorOptions } from '../types';

export function createGenerator<T>(options: {
  name: string;
  generate: (opts?: GeneratorOptions<T>) => T;
  schema?: z.ZodType<T>;
}): Generator<T> {
  return {
    name: options.name,
    generate: options.generate,
    generateMany: (count: number, opts?: GeneratorOptions<T>) => {
      return Array.from({ length: count }, (_, index) => 
        options.generate({
          ...opts,
          context: {
            ...opts?.context,
            seed: opts?.context?.seed ? opts.context.seed + index : undefined,
          },
        })
      );
    },
    schema: options.schema,
  };
}
