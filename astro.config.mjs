// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://duddcash.com',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'motion/react', 'cobe', 'lucide-react', 'embla-carousel-react', 'embla-carousel-auto-scroll', '@paper-design/shaders-react', '@paper-design/shaders'],
    },
  },
});