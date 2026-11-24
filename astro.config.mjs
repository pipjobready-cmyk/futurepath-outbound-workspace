import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Static output is the simplest Vercel deployment for this client workspace.
// Vercel detects Astro and publishes the generated dist/ directory.
export default defineConfig({
  output: 'static',
  integrations: [tailwind()],
});
