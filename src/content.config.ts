import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const common = z.object({
  title: z.string(),
  description: z.string(),
  published: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  discussionId: z.string().optional(),
});
const loader = (name: string) => glob({ base: './src/content/' + name, pattern: '**/*.{md,mdx}' });

export const collections = {
  articles: defineCollection({ loader: loader('articles'), schema: common.extend({
    featured: z.boolean().default(false),
    kind: z.enum(['article', 'experiment', 'note']).default('article'),
  }) }),
  projects: defineCollection({ loader: loader('projects'), schema: common }),
  fieldnotes: defineCollection({ loader: loader('fieldnotes'), schema: common.extend({
    issue: z.string(),
    week_start: z.string(),
    week_end: z.string(),
  }) }),
};
