import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kiteAB112.github.io',
  trailingSlash: 'always',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    shikiConfig: { themes: { light: 'min-light', dark: 'night-owl' }, defaultColor: false, wrap: false },
  },
});
