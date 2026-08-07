#!/usr/bin/env node
/**
 * The dark-theme accessibility pass.
 *
 * Lighthouse's accessibility category is axe-core already, so most of this is
 * duplication — except for the one thing Lighthouse structurally cannot do,
 * which is measure a second colour scheme. The token spine has a contrast trap
 * documented in .ui-craft/tokens.md (`--accent` is the wrong step behind light
 * text, `--accent-solid` is the right one), so dark mode is exactly where a
 * contrast regression would sit unnoticed.
 *
 * Run it against a preview server:
 *   npm run build && npm run preview      # then, in another shell:
 *   npm run axe
 */
import { chromium } from 'playwright-core';
import { AxeBuilder } from '@axe-core/playwright';
import { appendFileSync } from 'node:fs';

const BASE = process.env.AXE_BASE ?? 'http://127.0.0.1:4321';

// The 404 is included because it's the page nobody looks at, which is where rot
// goes unnoticed. `astro preview` serves 404.html for any unmatched path, so
// this exercises the real behaviour rather than the file.
const PATHS = ['/', '/side-projects', '/no-such-page'];
const THEMES = ['light', 'dark'];

const browser = await chromium.launch({
  // Chrome is preinstalled on ubuntu-latest and on most dev machines, so
  // playwright-core needs no browser download. If a runner image ever drops it:
  //   npx playwright install --with-deps chromium
  channel: 'chrome',
});

const failures = [];

for (const path of PATHS) {
  for (const theme of THEMES) {
    const context = await browser.newContext({
      colorScheme: theme,
      // Load-bearing, and the least obvious line in this file.
      //
      // .reveal elements sit at opacity 0 until IntersectionObserver fires, and
      // axe reports colour-contrast on a transparent element as "incomplete"
      // rather than checking it — so without this the scan would pass while
      // silently skipping the rule it exists for. Base.astro already adds
      // `is-in` to every .reveal immediately under reduced motion, so this uses
      // the site's own documented behaviour rather than injecting CSS.
      reducedMotion: 'reduce',
    });

    // The no-flash script in Base.astro reads localStorage before first paint.
    await context.addInitScript((t) => {
      try {
        localStorage.setItem('theme', t);
      } catch {}
    }, theme);

    // No network dependency on a third party, and no waiting on one to decide
    // when the page is idle. Mirrors blockedUrlPatterns in .lighthouserc.yml.
    await context.route('**gc.zgo.at**', (route) => route.abort());

    const page = await context.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle' });

    const { violations } = await new AxeBuilder({ page })
      // WCAG A and AA only. The `best-practice` tag flags opinionated things
      // like landmark uniqueness that are not defects here, and is the fastest
      // way to make this report unreadable and then ignored.
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const label = `${path} (${theme})`;
    if (violations.length === 0) {
      console.log(`ok    ${label}`);
    } else {
      console.log(`FAIL  ${label} — ${violations.length} violation(s)`);
      for (const v of violations) {
        console.log(`        ${v.id} (${v.impact}) — ${v.help}`);
        for (const node of v.nodes) console.log(`          ${node.target.join(' ')}`);
        failures.push({ label, id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length });
      }
    }

    await context.close();
  }
}

await browser.close();

if (process.env.GITHUB_STEP_SUMMARY) {
  const body = failures.length
    ? [
        '### axe violations\n',
        '| Page | Rule | Impact | Nodes | Help |',
        '|---|---|---|---|---|',
        ...failures.map((f) => `| ${f.label} | \`${f.id}\` | ${f.impact} | ${f.nodes} | ${f.help} |`),
      ]
    : [`### axe: clean\n\n${PATHS.length * THEMES.length} scans, no WCAG A/AA violations.`];
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, body.join('\n') + '\n');
}

console.log(
  failures.length
    ? `\n${failures.length} violation(s) across ${PATHS.length * THEMES.length} scans.`
    : `\nClean: ${PATHS.length * THEMES.length} scans, no WCAG A/AA violations.`
);

process.exit(failures.length ? 1 : 0);
