# Findings

Measured facts about this site. Every number here was produced by running something, not by
reading code and reasoning about it — where that distinction matters, the method is given.

Read this before auditing anything. A good chunk of it is *"already correct, stop looking"*,
which is the part that saves the most time.

---

## 2026-08-07

### Confirmed defects (all fixed this session)

| # | Finding | Evidence | Status |
|---|---|---|---|
| 1 | With JS disabled, everything below the hero rendered invisible | `grep -rn noscript src/` found one, in `EmailReveal.astro`. `.reveal{opacity:0}` had no non-JS escape. Rendered the transform a scripting-disabled browser applies (scripts inert, `<noscript>` promoted) — hero, then ~4,000px of blank page | fixed |
| 2 | All three anchor targets landed under the sticky header | `grep -rn scroll-margin src/` → zero hits. Measured in-browser: `#work`, `#contact`, `#main` each ~56px behind a nav whose bottom is at 57px | fixed |
| 3 | `.cite .weight` ("· PDF 12MB") at **1.88:1** light / **1.94:1** dark | Computed from `tokens.css` hex values, confirmed in-browser via `getComputedStyle` | fixed → 5.39 / 6.37 |
| 4 | `.btn-ghost`, `.toggle`, `.copy` borders at **1.29:1** / **1.23:1** | Same method. These borders are the controls' only visual boundary, so SC 1.4.11 applies (3:1) | fixed → 3.45 / 3.92 |
| 5 | `.offline` ("Not online anymore") ~**3.4:1** | `--muted` at `opacity: 0.75` over `--surface` | fixed → 6.00 / 5.94 |
| 6 | `<main>` had no `tabindex="-1"` | Safari/older Firefox scroll but don't move focus, so the skip link didn't skip | fixed |
| 7 | **1,318 KB of a 1.9 MB `dist/` was unreferenced** — 10 files, ~70% of the artifact | Cross-referenced every `dist/_astro/*` basename against all built HTML/XML. 9 PNGs plus `make-game-on-real-table….webp`. The figure is the build log's own, so it reconciles with the prune line | fixed → 628 KB |
| 8 | Card crop discarded 37.5% of six of ten screenshots | `aspect-ratio: 16/10` + `object-fit: cover` against 400×400 sources. Visible damage: Saimon Says lost its Play button, Trance Mission's title art was sliced, Bird the Squirrel lost the ground | fixed → 4/3, 25% loss |

### Root cause worth remembering (finding 7)

`image()` in a content-collection schema resolves each entry's `image` to real `ImageMetadata`
at build time. Astro can't know whether a consumer will read `.src`, so it emits the original
file *as well as* the `<Image>` derivatives.

The headshot is the control case: it's a plain ESM import in `Nav.astro` rather than a
collection field, and it is the only image with no orphan. That contrast is what identified
the mechanism.

**Corollary, learned the hard way:** referencing `entry.data.image.src` anywhere — including
in JSON-LD — names the original and pins all ten back into the build. I did exactly this while
adding structured data and re-inflated `dist` to 1.9 MB before catching it. Use `getImage()`
with the same widths the cards request instead; that reuses a derivative that already ships.

### Documentation drift

| Claim in `.ui-craft/tokens.md` | Measured | Note |
|---|---|---|
| `--amber-500` is 4.6:1 on `--steel-100` | **3.64:1** | Matters: `--focus` is this token, so the focus ring clears the 3:1 bar by 0.64, and only **3.31:1** against `--surface-sunk` |
| `--amber-400` is 10.2:1 on `--steel-950` | **11.94:1** | Understated, harmless |
| `--steel-50: #F7F9F9` exists | **It doesn't** | Not in `tokens.css`, never referenced anywhere |

Also corrected: `Base.astro` justified having no font preloads on the grounds that inlining the
stylesheet made them "redundant". Inlining puts `@font-face` in the first parse but does **not**
start the fetch — a browser waits until layout proves a face is used. The conclusion (no
preloads) still stands; the stated reason was wrong.

### Outbound link probe

All 22 external URLs, probed with a browser user-agent from a residential IP — the friendliest
case a checker ever gets. An Actions runner does strictly worse.

| Host | Count | Result |
|---|---|---|
| `github.com` | 8 | 206 |
| `klecoz.itch.io` + `tigershark8980.itch.io` | 8 | 200 |
| `undergraduateresearch.buffalostate.edu` (12 MB PDF) | 1 | 206 — alive |
| `buffalogamespace.com`, `www.sightline.biz` | 2 | 206 |
| `www.linkedin.com` | 2 | **999** on the profile; 200 on the post permalink |
| `www.wgrz.com` | 1 | **403** |

`999` is LinkedIn's own block code. The WGRZ 403 is bot protection — and that link is the press
citation, so excluding it is the one exclusion that genuinely costs coverage.

### Page weight

Measured against a local preview, fully scrolled so every lazy image commits.

| Page | Document (gzip) | Images | Fonts | Total |
|---|---|---|---|---|
| `/side-projects` | 8.4 KB | 134 KB | 50.6 KB | **194 KB** |
| `/` | 11.2 KB | — | — | — |
| `/404` | 5.2 KB | — | — | — |

Fonts are 104 KB across seven faces on disk, but `/side-projects` fetches only **four** —
`barlow-400`, `barlow-condensed-600`, `plex-mono-400`, `plex-mono-500`, totalling 50.6 KB. The
three it never requests are `barlow-500`, `barlow-600` and `barlow-condensed-700`; whether the
homepage pulls those depends on which weights its hero and headings actually resolve to.

The CI budget is 350 KB total and 120 KB for fonts — the latter sized against the 104 KB on
disk rather than the ~51 KB observed, so it catches an eighth face or a Google Fonts link
without tripping on normal variation between pages.

### A testing trap specific to this site

axe reports `color-contrast` as **incomplete** — not pass, not fail — on an element at
`opacity: 0`. Because `.reveal` starts transparent, a naive axe run over this site reports zero
violations while checking almost nothing.

`scripts/axe-scan.mjs` sets Playwright's `reducedMotion: 'reduce'`, which makes `Base.astro`
add `is-in` to every `.reveal` immediately. Verified by reintroducing finding #3 and confirming
the scan failed on both themes; restoring it returned 6/6 clean.

---

## Already correct — do not re-suggest

Checked this session and found properly handled. Several of these look like obvious
improvements from the outside.

**Build and delivery** — CSS inlined (`inlineStylesheets: 'always'`, no render-blocking
stylesheet); zero JS chunks, ~2 KB of inline module script; images through the Astro pipeline
as WebP with explicit `widths`/`sizes`, `loading="lazy"`, and `width`/`height` set so there is
no CLS; `aspect-ratio` reserved on card images; fonts self-hosted with `font-display: swap`,
no CDN.

**Design system** — a real three-layer token spine, documented separately; dark mode as a
designed palette rather than an inversion, with `[data-theme]` correctly beating the media
query *in both directions*; no-flash inline theme script; dual `theme-color` metas kept in sync
by JS; fluid type via `clamp()`; intrinsic grids that don't side-scroll at 320px.

**Accessibility** — semantic landmarks throughout; `<ol>` for the timeline; `<time datetime>`
on every date; skip link; `:focus-visible` rings; `prefers-reduced-motion` handled in both CSS
and JS; decorative images correctly `alt=""`, content images described; ARIA used sparingly and
correctly; 44px touch targets; heading hierarchy gapless on all three pages.

**SEO** — per-page title and description; canonical with trailing slash normalised; full
OG/Twitter cards; per-route OG images; `Person` JSON-LD; generated sitemap with a `serialize`
hook so it agrees with the canonicals; `robots.txt`; legacy `/games` and `/projects` rescued via
config redirects, and the `#projects` / `#games` hash equivalents by an inline script.

**Print** — a genuinely serious `@media print` block: `@page` margins, token overrides to
black/white, retuned scale, forced `.reveal` visibility, printed URLs with specificity carve-
outs, `break-inside: avoid`, orphans/widows. The brief rules out a resume PDF; this is the
paper copy.

**Deploy** — stale-commit guard (from a real 2026-08-07 incident), CNAME assertion,
least-privilege permissions, deliberate `cancel-in-progress: false` on the Pages group.

**Deliberate choices that look like omissions** — GoatCounter instead of Google Analytics; the
email obfuscation; no resume PDF; no "open to work" banner. See `decisions.md` and
`.ui-craft/brief.md`.

---

## Known and accepted

Not defects, but worth knowing before someone rediscovers them.

- **Eight of ten screenshots are ≤400px on the long edge**, so cards are upscaled on retina.
  Fixing this needs new source art, which Arsenio decided against on 2026-08-07. The 4/3 ratio
  change mitigated the framing damage without new art.
- **Fonts in `public/fonts/` have unhashed filenames**, so GitHub Pages re-validates them every
  10 minutes forever instead of caching immutably. Pages cannot set cache headers. Fixing it
  means either moving hosts or routing fonts through `src/assets/` for content hashes.
- **`scripts/make-og.mjs` fetches fonts from Google at runtime** with a spoofed UA to force TTF.
  It's the most fragile script here, but it's run by hand and the cards are committed, so the
  blast radius is one person, once.
- **`:focus-visible` uses `:where()`**, giving it zero specificity. Nothing overrides it today,
  but any future `.btn:focus { outline: none }` would win trivially.
- **`<h1>Arsenio<br>Colón</h1>`** extracts as `ArsenioColón`. Screen-reader handling of `<br>`
  in an accessible name is inconsistent.
- **The theme toggle uses `aria-pressed` on a tri-state concept** (light / dark / follow-OS).
  Once toggled there's no way back to "system".
