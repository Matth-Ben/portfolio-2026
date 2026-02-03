// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  prefetch: false, // Disable prefetching to avoid conflicts with Barba.js
  vite: {
    plugins: [tailwindcss()]
  }
});