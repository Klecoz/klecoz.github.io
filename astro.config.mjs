// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://arseniocolon.com',
  trailingSlash: 'ignore',

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
