import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Kept at the requested path. src/content.config.ts re-exports this collection
// from Astro's current collection-config entry point.
const updates = defineCollection({
  loader: glob({ base: './src/content/updates', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    status: z.enum(['On Track', 'In Progress', 'Needs Input', 'Completed']),
    phase: z.string(),
    summary: z.string(),
  }),
});

export const collections = { updates };
