import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const entrySchema = z.object({
  title: z.string(),
  description: z.string(),
  published: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

const collection = (base: string) =>
  defineCollection({
    loader: glob({ base, pattern: '**/*.{md,mdx}' }),
    schema: entrySchema,
  });

export const collections = {
  projects: collection('./src/content/projects'),
  articles: collection('./src/content/articles'),
  labs: collection('./src/content/labs'),
  notes: collection('./src/content/notes'),
  stars: collection('./src/content/stars'),
};
