import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    order: z.number(),
    role: z.string(),
    org: z.string(),
    /** Legal name, when it differs from the name people know. */
    orgFull: z.string().optional(),
    location: z.string(),
    employment: z.string(),
    /** Display strings, e.g. "Mar 2026" / "Present". */
    start: z.string(),
    end: z.string(),
    /** Machine dates for <time> and for sizing the rail. */
    startISO: z.string(),
    endISO: z.string().nullable(),
    current: z.boolean().default(false),
  }),
});

const games = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/games' }),
  schema: ({ image }) =>
    z.object({
      order: z.number(),
      title: z.string(),
      tag: z.string(),
      year: z.string(),
      vr: z.boolean().default(false),
      image: image(),
      links: z
        .array(z.object({ label: z.string(), href: z.string().url() }))
        .default([]),
    }),
});

const clients = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/clients' }),
  schema: ({ image }) =>
    z.object({
      order: z.number(),
      title: z.string(),
      year: z.string(),
      image: image(),
      href: z.string().url().optional(),
      /** false renders a plain "not online anymore" note instead of a link. */
      live: z.boolean().default(true),
    }),
});

export const collections = { experience, games, clients };
