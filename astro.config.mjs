// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://arseniocolon.com',
  trailingSlash: 'ignore',

  integrations: [
    sitemap({
      // The two redirect stubs below exist to rescue old v1 URLs. They aren't
      // destinations, so they don't belong in the index.
      filter: (page) => !/\/(games|projects)\/?$/.test(page),
      // Stamped at build time. The hand-written sitemap this replaced carried a
      // hardcoded date that went stale the moment any content changed.
      lastmod: new Date(),
      // `trailingSlash: 'ignore'` makes the integration emit `/side-projects/`
      // while Base.astro's canonical says `/side-projects` — two URLs for one
      // page, and the crawler picks. The root is exempt in practice: the
      // integration re-parses through `new URL()`, which restores the slash, and
      // an empty path is equivalent to "/" anyway.
      serialize: (item) => ({ ...item, url: item.url.replace(/\/$/, '') }),
    }),
  ],

  // Old v1 paths. The hash-fragment equivalents (#projects, #games) can't be
  // handled here — the server never sees a fragment — so those are caught by a
  // small script in Base.astro.
  redirects: {
    '/games': '/side-projects',
    '/projects': '/side-projects',
  },

  build: {
    // ~20KB total across two pages. Inlining removes two render-blocking
    // round trips and puts @font-face in the initial parse, so the fonts start
    // loading without a separate preload hint.
    inlineStylesheets: 'always',
  },

  image: {
    // Screenshots are decorative-adjacent and never huge on screen.
    responsiveStyles: true,
  },
});
