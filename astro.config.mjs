// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://duddcash.com',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['motion/react', 'cobe', 'lucide-react', 'embla-carousel-react', 'embla-carousel-auto-scroll'],
    },
  },
});