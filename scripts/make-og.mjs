/**
 * Regenerates the 1200x630 social cards in the Steel design language — one per
 * route, so a link to /side-projects doesn't preview as the homepage. Only needs
 * rerunning if a title or the palette changes.
 *
 *   npm install --no-save satori
 *   node scripts/make-og.mjs
 *   npm uninstall satori
 *
 * satori is deliberately not a dependency: it's a few MB, is used once in a
 * blue moon, and would otherwise be installed on every CI run for nothing.
 * It converts text to SVG paths, so the rasterised PNG needs no fonts present.
 * That also rules out generating these at build time — the cards are committed.
 */
import sharp from 'sharp';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let satori;
try {
  satori = (await import('satori')).default;
} catch {
  console.error(
    '\nsatori is not installed. Run:\n' +
      '  npm install --no-save satori && node scripts/make-og.mjs && npm uninstall satori\n'
  );
  process.exit(1);
}

// --- fonts -----------------------------------------------------------------
// satori needs ttf/otf/woff — not the woff2 the site itself serves. An old
// User-Agent makes the Google Fonts API hand back TTF instead of WOFF2.
const FONT_DIR = join(tmpdir(), 'arsenio-og-fonts');
mkdirSync(FONT_DIR, { recursive: true });

const FACES = [
  { file: 'bc700.ttf', family: 'Barlow+Condensed:700', name: 'Barlow Condensed', weight: 700 },
  { file: 'b400.ttf', family: 'Barlow:400', name: 'Barlow', weight: 400 },
  { file: 'plex500.ttf', family: 'IBM+Plex+Mono:500', name: 'IBM Plex Mono', weight: 500 },
];

for (const face of FACES) {
  const path = join(FONT_DIR, face.file);
  if (existsSync(path)) continue;
  const css = await fetch(`https://fonts.googleapis.com/css?family=${face.family}`, {
    headers: { 'User-Agent': 'Mozilla/4.0' },
  }).then((r) => r.text());
  const url = css.match(/https:\/\/[^)]*\.ttf/)?.[0];
  if (!url) throw new Error(`Could not resolve a TTF url for ${face.family}`);
  writeFileSync(path, Buffer.from(await fetch(url).then((r) => r.arrayBuffer())));
  console.log(`fetched ${face.file}`);
}

// --- card ------------------------------------------------------------------
// Values mirror src/styles/tokens.css (light theme). Keep them in step.
const STEEL = '#f1f3f4';
const INK = '#121a1e';
const MUTED = '#58656e';
const RULE = '#d2d8db';
const AMBER = '#a97400';

const el = (type, props) => ({ type, props });
const text = (t, style) => el('div', { style, children: t });

// One per route. `display` is sized to fit on one line at 1200px — keep it short.
const CARDS = [
  {
    out: 'public/og.png',
    eyebrow: 'BUFFALO, NY',
    display: 'ARSENIO COLÓN',
    rule: 620,
    sub: '.NET Engineer · Full Stack',
    url: 'arseniocolon.com',
  },
  {
    out: 'public/og-side-projects.png',
    eyebrow: 'ARSENIO COLÓN',
    display: 'SIDE PROJECTS',
    rule: 560,
    sub: 'Games, jams and client work',
    url: 'arseniocolon.com/side-projects',
  },
];

const card = (c) =>
  el('div', {
    style: {
      width: 1200,
      height: 630,
      display: 'flex',
      background: STEEL,
      fontFamily: 'Barlow',
      position: 'relative',
    },
    children: [
      // The date rail, echoed from the timeline.
      el('div', {
        style: { position: 'absolute', left: 96, top: 0, width: 3, height: 630, display: 'flex', background: RULE },
      }),
      el('div', {
        style: { position: 'absolute', left: 96, top: 232, width: 3, height: 168, display: 'flex', background: AMBER },
      }),
      el('div', {
        style: { position: 'absolute', left: 96, top: 232, width: 26, height: 3, display: 'flex', background: AMBER },
      }),

      el('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: 160,
          paddingRight: 96,
          height: 630,
        },
        children: [
          text(c.eyebrow, {
            fontFamily: 'IBM Plex Mono', fontSize: 21, letterSpacing: 4, color: MUTED, marginBottom: 26,
          }),
          text(c.display, {
            fontFamily: 'Barlow Condensed', fontSize: 148, fontWeight: 700,
            lineHeight: 0.9, letterSpacing: -1, color: INK,
          }),
          el('div', {
            style: { display: 'flex', width: c.rule, height: 3, background: INK, marginTop: 34, marginBottom: 26 },
          }),
          text(c.sub, {
            fontFamily: 'Barlow Condensed', fontSize: 48, fontWeight: 700, color: MUTED,
          }),
          text(c.url, {
            fontFamily: 'IBM Plex Mono', fontSize: 22, letterSpacing: 2, color: AMBER, marginTop: 40,
          }),
        ],
      }),
    ],
  });

const fonts = FACES.map((f) => ({
  name: f.name,
  data: readFileSync(join(FONT_DIR, f.file)),
  weight: f.weight,
  style: 'normal',
}));

// A single path argument overrides the first card's destination, which keeps the
// old `node scripts/make-og.mjs some/other.png` behaviour working.
const override = process.argv[2];

for (const [i, c] of CARDS.entries()) {
  const svg = await satori(card(c), { width: 1200, height: 630, fonts });
  const out = i === 0 && override ? override : c.out;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
  console.log(`wrote ${out}`);
}
