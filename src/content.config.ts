import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const publications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    authors: z.array(z.string()),
    journal: z.string(),
    doi: z.string().optional(),
    paper_url: z.string().optional(),
    code_url: z.string().optional(),
    abstract: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    github: z.string().optional(),
    demo: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

export const collections = { publications, projects };
