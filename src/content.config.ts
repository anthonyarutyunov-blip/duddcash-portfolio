import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    category: z.enum([
      'wedding',
      'commercial',
      'music-video',
      'documentary',
      'branded',
      'event',
    ]),
    date: z.coerce.date(),
    client: z.string().optional(),
    thumbnail: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    videoUrl: z.string().optional(),
    photos: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
        })
      )
      .default([]),
    description: z.string(),
    featured: z.boolean().default(false),
    order: z.number().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { projects };
