#!/usr/bin/env node
/**
 * The print pass — the one pre-ship check that was still done by hand.
 *
 * README says to Cmd-P both pages after touching `.reveal`, layout or tokens,
 * because the print block in tokens.css is load-bearing: without it a page
 * printed before scrolling comes out with the timeline missing, which is the bug
 * that shipped once already.
 *
 * This does NOT diff pixels. Baselines rendered on a Mac disagree with the ones
 * `ubuntu-latest` renders on font rasterisation alone, so a pixel gate would
 * either need a threshold big enough to hide real regressions or would cry wolf
 * until it got ignored. Every failure mode the print block actually has is a
 * computed-style question, and those are identical on both platforms. The
 * screenshots are still written, as artifacts to look at — not as the gate.
 *
 * Run it against a preview server:
 *   npm run build && npm run preview      # then, in another shell:
 *   npm run snap
 */
import { chromium } from 'playwright-core';
import { appendFileSync, mkdirSync } from 'node:fs';

const BASE = process.env.AXE_BASE ?? 'http://127.0.0.1:4321';
const OUT = process.env.SNAP_OUT ?? 'print-shots';
const PATHS = ['/', '/side-projects'];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const failures = [];

for (const path of PATHS) {
  // Deliberately NOT `reducedMotion: 'reduce'` — the opposite of axe-scan.mjs,
  // and the whole point of this file. Base.astro adds `is-in` to every .reveal
  // immediately under reduced motion, which is exactly the state that hides the
  // bug: the regression only exists for elements the observer has not reached.
  // Loading with motion live and never scrolling reproduces a cold Cmd-P.
  const context = await browser.newContext();
  await context.route('**gc.zgo.at**', (route) => route.abort());

  const page = await context.newPage();
  await page.goto(BASE + path, { waitUntil: 'networkidle' });

  // Confirm the precondition: something below the fold is still un-revealed. If
  // this ever hits zero the test has stopped exercising anything and is lying.
  const pending = await page.evaluate(
    () => [...document.querySelectorAll('.reveal')].filter((el) => !el.classList.contains('is-in')).length
  );

  await page.emulateMedia({ media: 'print' });

  // Switching media starts the .reveal opacity transition rather than jumping;
  // getComputedStyle mid-flight reports the animated value and every element
  // looks like a regression. Wait it out, derived from the token so the two
  // can't drift apart.
  //
  // The unit matters: tokens.css authors `--dur-slow: 280ms` but Chrome hands it
  // back as `.28s`, so a bare parseFloat waits half a millisecond and every
  // check fails for a reason that has nothing to do with printing.
  const settle = await page.evaluate(() => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--dur-slow').trim();
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return 560;
    return (raw.endsWith('ms') ? n : n * 1000) * 2;
  });
  await page.waitForTimeout(settle);

  const checks = await page.evaluate(() => {
    const results = [];
    const add = (name, pass, detail) => results.push({ name, pass, detail });

    // 1. The regression itself.
    const reveals = [...document.querySelectorAll('.reveal')];
    const hidden = reveals.filter((el) => Number(getComputedStyle(el).opacity) < 1);
    add(
      'every .reveal prints at full opacity',
      hidden.length === 0,
      `${reveals.length} .reveal elements, ${hidden.length} still transparent`
    );

    // 2. Nothing below the fold collapsed to zero height.
    const empty = reveals.filter((el) => el.getBoundingClientRect().height === 0);
    add('no .reveal collapsed to zero height', empty.length === 0, `${empty.length} with no height`);

    // 3. Screen-only chrome stays off paper.
    const header = document.querySelector('header');
    const skip = document.querySelector('.skip');
    add('header hidden', getComputedStyle(header).display === 'none', getComputedStyle(header).display);
    add('skip link hidden', getComputedStyle(skip).display === 'none', getComputedStyle(skip).display);

    // 4. Hrefs get printed after external links, since paper has no hover.
    //
    // Four groups are deliberately exempt and documented where they're defined:
    // .links already prints its URL as the link text; buttons are navigation
    // rather than references (tokens.css); and .cite / .pull footer a carry
    // hrefs past 100 characters that swamp the quote, with a visible label that
    // already names the source (index.astro). Both halves are asserted, so
    // deleting either rule fails rather than silently changing the page.
    const printsUrl = (a) => {
      const c = getComputedStyle(a, '::after').content;
      return Boolean(c) && c !== 'none' && c.includes('http');
    };
    const EXEMPT = '.links a, a.btn-primary, a.btn-ghost, .cite, .pull footer a';
    const all = [...document.querySelectorAll('a[href^="http"]')];
    const ext = all.filter((a) => !a.matches(EXEMPT) && !a.closest('.links'));
    const withUrl = ext.filter(printsUrl);
    add(
      'external links print their href',
      ext.length > 0 && withUrl.length === ext.length,
      `${withUrl.length}/${ext.length} external links carry a printed URL`
    );

    const exempt = all.filter((a) => a.matches(EXEMPT) || a.closest('.links'));
    const doubled = exempt.filter(printsUrl);
    add(
      'exempt links stay unlabelled',
      doubled.length === 0,
      `${doubled.length}/${exempt.length} would print a redundant URL`
    );

    return results;
  });

  const label = path === '/' ? 'home' : path.replace(/\//g, '');
  console.log(`\n${path}  (${pending} .reveal still un-revealed at load — the cold Cmd-P state)`);
  if (pending === 0) {
    console.log('  WARN  nothing was left un-revealed; this run proved less than it looks like');
  }
  for (const c of checks) {
    console.log(`  ${c.pass ? 'ok  ' : 'FAIL'}  ${c.name} — ${c.detail}`);
    if (!c.pass) failures.push({ path, ...c });
  }

  await page.screenshot({ path: `${OUT}/print-${label}.png`, fullPage: true });
  console.log(`  wrote ${OUT}/print-${label}.png`);

  await context.close();
}

await browser.close();

if (process.env.GITHUB_STEP_SUMMARY) {
  const body = failures.length
    ? [
        '### print regressions\n',
        '| Page | Check | Detail |',
        '|---|---|---|',
        ...failures.map((f) => `| ${f.path} | ${f.name} | ${f.detail} |`),
      ]
    : [`### print: clean\n\n${PATHS.length} pages, print stylesheet intact.`];
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, body.join('\n') + '\n');
}

console.log(
  failures.length
    ? `\n${failures.length} print regression(s).`
    : `\nClean: ${PATHS.length} pages, print stylesheet intact.`
);

process.exit(failures.length ? 1 : 0);
