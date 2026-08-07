# Findings

Measured facts about this site. Every number here was produced by running something, not by
reading code and reasoning about it — where that distinction matters, the method is given.

Read this before auditing anything. A good chunk of it is *"already correct, stop looking"*,
which is the part that saves the most time.

---

## 2026-08-07 — fourth session: provenance of the community and EquityOne claims

Prompted by "where does the *Tech Talks and Tech Academy mentoring* claim come from?". Traced
with `git log -S`, not by reasoning about it.

### The claim is Arsenio's own writing, carried over from v1

`git log -S "Tech Academy"` returns exactly two commits: `cbb9298` ("Update portfolio site",
authored by Arsenio) and `3b2ee92` (the Astro rebuild). In `cbb9298` it is one bullet under the
M&T job in `index.html:620`:

> Volunteered for Cybersecurity Champions and Touchdown for Teachers programs, presenting Tech
> Talks and mentoring through internal Tech Academy workshops.

The rebuild split that single bullet into two Community entries. Two things changed in the
split, neither recorded at the time:

- **`Cybersecurity Champions` was dropped** and stays dropped — Arsenio deleted it deliberately
  when v2 shipped. Do not restore it. See `decisions.md`.
- **`Tech Talks and Tech Academy mentoring` is the only Community entry with no `href`, `quote`
  or `cite`.** Buffalo Game Space carries the WGRZ quote, Touchdown for Teachers carries the
  LinkedIn cite. These are internal M&T programs, so there may be nothing public to point at —
  no web search was run, only the repo.

### EquityOne was already on the site

`git log -S "EquityOne"` gives the same two commits. It had survived the rebuild as the third
bullet of `src/content/experience/4-mtb.md`, reworded to "Picked for EquityOne, M&T's
sponsorship program for high-potential internal leaders." The question assumed it was missing;
it was not. It has since been replaced with Arsenio's fuller wording — see `decisions.md`.

### Markdown quotes are curled at build, not in source

Content markdown uses straight `'` and `"` throughout; `src/pages/index.astro` uses curly
characters directly. Both are correct: Astro's default SmartyPants runs over markdown bodies
only. Confirmed by grepping the built output — `M&amp;T's` in source renders as `M&amp;T’s` in
`dist/index.html`, and `"EquityOne"` renders as `“EquityOne”`. Write straight quotes in
`src/content/`, curly ones in `.astro`.

### The longer bullet renders clean, with one unavoidable widow

Screenshotted against the preview server at 1280px and 390px with the reveals forced in. Three
lines on desktop, six on mobile. `text-wrap: pretty` **is** applied to the bullet (computed
style read in Chrome, not assumed) and still leaves the single word "development." on the last
mobile line — `pretty` only reflows the tail of a paragraph and cannot fix a six-line one
without hyphenation. Not a regression, and not worth editing his copy over.

### Gates after the change

| Gate | Result |
|---|---|
| `npm run check` | 0 errors, 0 warnings, 0 hints |
| `npm run build` | `dist` 632 KB; prune removed 10 assets (1318 KB) |
| `npm run axe` | 12 scans, no WCAG A/AA violations |
| `npm run snap` | 2 pages, print stylesheet intact |
| `scripts/assert-cname.sh` | ok — `arseniocolon.com` |

---

## 2026-08-07 — mobile theme-toggle centring

Prompted by "the dark/light/system toggle icon on mobile is off centre". It was. Measured
against the running dev server with Playwright, reading `getBoundingClientRect()` on the button
and on whichever icon `data-state` had visible.

### The icon sat flush against the left border below 34rem

| Width | Button | Icon gap left / right | Icon gap top / bottom |
|---|---|---|---|
| 320px, before | 32×32 | **1px / 15px** | 8px / 8px |
| 320px, after | 32×32 | 8px / 8px | 8px / 8px |
| 390px, after | 32×32 | 8px / 8px | 8px / 8px |
| 430px, after | 32×32 | 8px / 8px | 8px / 8px |

Vertical centring was always correct, which is why this reads as a subtle lean rather than an
obviously broken control — `align-items: center` on the base `.toggle` rule was doing that job
the whole time.

**Cause.** The `max-width: 34rem` block collapsed the control to a 2rem square with
`place-items: center`. `place-items` is shorthand for `align-items` + `justify-items`, and a
flex container ignores `justify-items` outright — so the horizontal half silently did nothing
and `justify-content` stayed at its `normal` initial value. Confirmed rather than assumed:
computed style on the button read `justify-content: normal` and `justify-items: center`
together, which is the fingerprint of exactly this mistake. The 16px icon in a 30px content box
left all 14px of slack on the right.

Fixed with `justify-content: center`. Checked in all three stops (`system` / `light` / `dark`),
since each is a separate SVG and only one is `display: block` at a time — all three now report
8/8 on both axes.

### Things this did not break, checked because they were at risk

- **Nav geometry below 34rem is byte-identical to what `decisions.md` pins.** `.mark` right
  edge at 124.3px, nav-links left edge at 140.3px, the same 16px gap recorded when the label was
  first dropped. The toggle still occupies 268–300px. `document.scrollWidth` equals
  `clientWidth` at 320 / 390 / 430px, so nothing gained a horizontal scrollbar.
- **The control is still a 32×32 target**, unchanged. Only the icon moved inside it.
- `npm run axe` clean across all 12 scans, `npm run snap` clean on both pages, `astro check`
  0/0/0, `dist` 632 KB.

### A measurement trap worth recording

A first pass checked centring at 560px too and reported three failures. Those were not real:
560px is above the 34rem (544px) breakpoint, so the label is visible and the icon is *supposed*
to sit left of the text with the pair centred as a unit. The square-button symmetry rule only
applies below the breakpoint. Any future geometry check on this control has to be
breakpoint-aware or it will cry wolf.

---

## 2026-08-07 — visual polish pass

Prompted by "anything we can do for some visual polish?". Everything below was measured
against a `npm run preview` server driven by Playwright, not read off the source.

### The hero had no accent on it at all

Walked every element whose box intersects the first 900px of `/` and compared its computed
`color`, `backgroundColor`, `borderTopColor`, `textDecorationColor` and `outlineColor`
against all four amber primitives (`#a97400`, `#8a5e00`, `#ffc53d`, `#ffd470`).

| Scope | Amber placements |
|---|---|
| First 900px, before | **0** |
| First 900px, after | 1 |
| Whole homepage | 16 |

All 16 were below the fold: the date rail, the `Current` chip, the citation arrows and their
borders, link underlines, and the pull-quote's left rule. `.ui-craft/tokens.md` budgets 3–5
per viewport, so the highest-traffic screen on the site was spending none of it. Fixed by the
rule inset — see `decisions.md`.

Worth keeping the method: `--accent` and `--accent-solid` resolve to *different* hex values on
light and the *same* one on dark, so a scan that only checks one theme's value under-counts.
Check all four primitives.

### The stack separator orphaned a dot at the end of wrapped lines

`.stack-items li:not(:last-child)::after` set a `·` on the preceding item, with a comment
saying this stopped a wrapped line opening with an orphan. It did, and produced the mirror
image instead. Measured item rects at 1280px:

```
PLATFORMS   .NET 10 · ASP.NET Core · Azure ·      ← dot ends the line
            Kubernetes · IIS
TOOLS       Azure DevOps · Datadog · Git ·        ← same
            Claude Code · Unity
```

Both wrapping groups showed it, in both themes, at 1280px and 390px. Rendered against a
leading-dot variant, which just moves the orphan to the front of line two. Fixed by removing
the character.

### Card link rows sat on three different baselines

`/side-projects`, first grid row. The cards were already equal height — the grid stretches
them — but `.card-body` was `align-content: start`, so the link row landed wherever the
description ended.

| Card | `.card-links` top, before | After |
|---|---|---|
| Make Game On Real Table | 897px | 893px |
| Repair the Shape | 825px | 893px |
| Office Mistakes | 825px | 893px |

Verified after the fix on all three rows: 893/893/893, 1370/1370/1370, 1822/1822.

### Button rules were duplicated and had already drifted

`.btn-primary` / `.btn-ghost` were defined in both `index.astro` and `404.astro`. The 404 copy
was missing `white-space: nowrap`, so a button label could wrap on that page and nowhere else.
Not a rendering defect at any width tested — a latent one. Both copies now removed in favour of
one set in `tokens.css`.

### `prefers-reduced-motion` zeroed duration but not delay

`tokens.css` set `transition-duration: 0.01ms !important` without touching `transition-delay`.
Harmless while nothing set a delay; the card stagger added one, and a delay left intact under
reduced motion is a held pause rather than a shortened animation. `transition-delay: 0s
!important` added to the same block.

### Gate after the changes — all clean

`npm run check` 0/0/0 · `npm run build` 632 KB, prune line present (10 assets, 1318 KB) ·
`npm run axe` 12 scans clean · `npm run snap` 2 pages clean · `assert-cname.sh` ok.

`npm run snap` matters more than usual this session: the hero rule is now painted as a
`background`, and browsers drop backgrounds when printing. Left alone it would have vanished
off the paper copy. The print block restates it as the border it used to be, and the print
render confirms it survives.

### Checked and found already correct

- **Sticky nav does not cover the hero eyebrow at 390px.** Nav bottom 57px, eyebrow top 105px.
  An element screenshot appears to show an overlap because taking one scrolls the element under
  the sticky header — an artifact of the method, not a defect. Measure rects at `scrollY === 0`.

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

### Confirmed in CI and production (commit `07fca04`)

The guardrails were designed against local measurements, so the first real run was the actual
test. Both passed without tuning:

- **`Deploy to GitHub Pages`** — success.
- **`Audit`** — success. Lighthouse checked 2 URLs over 6 runs with no assertion failures, so
  every gating budget cleared on the first try: the 350 KB total-weight ceiling, 120 KB fonts,
  25 KB script, third-party count, accessibility at 1.0, and the SEO sub-audits.
- **axe on the runner** — 6/6 clean. This also validated the `channel: 'chrome'` assumption in
  `scripts/axe-scan.mjs`; `ubuntu-latest` has Chrome preinstalled, so `playwright-core` needs no
  browser download.

I had expected `resource-summary:third-party:count` to be the likely first failure, on the
theory that a blocked request might still be counted. Capping it at 1 rather than 0 meant it
never mattered either way.

Production spot-check after the deploy: the `<noscript>` escape, `tabindex="-1"`,
`scroll-margin-top`, `--rule-control`, `og:site_name`, per-page `og:image:alt`, `ProfilePage`
and `rel="me"` are all live on `/`; the 4/3 ratio, the `ItemList` and the page-specific card
alt are live on `/side-projects/`. The pruned originals return **404** and their derivatives
return **200** — the prune is doing exactly what it claims on the real host.

One measurement gotcha worth recording: `curl` without `-L` against `/side-projects` returns a
162-byte redirect body, not the page. The site is `trailingSlash: 'ignore'` and Pages redirects
to `/side-projects/`. That briefly looked like a missing deploy.

---

## 2026-08-07 — second session

### Confirmed defect

| # | Finding | Evidence | Status |
|---|---|---|---|
| 9 | **The analytics tag posted to a GoatCounter site that does not exist.** Every pageview since the v2 launch was dropped | `Base.astro:176` read `arseniocolon.goatcounter.com/count`. `curl` to that host returns **400**; the real account, `klecoz.goatcounter.com`, returns **303** to login. Arsenio supplied the correct snippet — it was never going to be visible from inside the repo | fixed → `klecoz` |

This is the sharpest example so far of why this file exists. The bug was invisible to every check
the repo runs: `astro check` passes, the markup is valid, the byte budget is unaffected, and both
CI blocks match `gc.zgo.at` (the *script* host, which was always correct) rather than the account.
From the dashboard it is indistinguishable from a new site nobody has visited yet. Nothing short
of resolving the host would have caught it.

**Deployed and spot-checked** at `ddb48ac`. Live HTML carries the `klecoz` endpoint, and
`klecoz.goatcounter.com/count?p=/deploy-verify` returns **200**, so the account accepts hits.

### Arsenio's own Chrome blocks the analytics script — a measurement trap

Trying to confirm the fix end to end found a second, unrelated thing, and it is the more useful
finding of the two because it will mislead anyone who checks this later:

| Client, same machine and network | `https://gc.zgo.at/count.js` |
|---|---|
| `curl` | **200**, 9,213 bytes |
| Chrome, fresh profile, no extensions loaded by the harness | **204**, 0 bytes |

`window.goatcounter` is `undefined` after load, so the script never runs and no hit is sent.
`navigator.doNotTrack` is `null`, so that is not the cause; the network trace also shows requests
to random-looking first-party paths on `arseniocolon.com` that the site does not serve, which is
blocker machinery rather than anything in `dist/`.

**Consequence worth remembering: Arsenio does not appear in his own analytics.** Loading the site
himself and seeing no hit is *not* evidence the tag is broken — which is exactly the wrong
conclusion to draw twice about the same feature. Verify from a different browser, or look for the
`/deploy-verify` hit fired by hand during this session.

**Dashboard confirmed 2026-08-07.** The `/deploy-verify` hit is on `klecoz.goatcounter.com`, and
the account's total for 2026-07-31 → 2026-08-07 is **1 visit** — that one. Independent
confirmation of finding 9 from the other end: the site was live for a day and recorded nothing.

One link is still unproven and should not be written up as though it were. That hit was fired by
`curl` straight at `/count`, so what is verified is the account and the endpoint. The *script*
path — `count.js` executing in a browser and calling `/count` itself — could not be exercised
from here, because the only browser available blocks it (above). The first real visitor settles
it; so does loading the site from a phone.

### WCAG 2.2 — measured, all four pass

Method: `scripts/axe-scan.mjs` for the automated rules, plus one-off Playwright scripts driving
real keyboard focus and geometry. Preview server on `127.0.0.1:4321` against a fresh `dist`.

- **SC 2.4.11 Focus Not Obscured (Minimum) — pass.** Tabbed every focusable on both pages at
  1280, 390 and 320px and compared each focused element's rect against the sticky nav's. **Zero
  entirely covered.** The first pass flagged the skip link at 90% overlap, which is a **false
  positive**: it compares geometry and ignores stacking. `.skip` is `z-index: 100` against the
  nav's `20`, so it paints on top. Confirmed two ways — `document.elementFromPoint` at three
  corners returns the skip link itself, and a screenshot shows it fully legible with its focus
  ring. Geometry alone is not enough to judge this criterion.
- **SC 2.5.8 Target Size (Minimum) — pass, via the spacing exception.** 18 of 24 targets on
  `/side-projects` are under 24px (the `itch.io` / `Source` pairs are 56×17 and 48×17). They
  qualify because a 24px-diameter circle on each touches nothing: the tightest pair is **60px**
  centre to centre, and most are 68px. Checked at desktop and 390px. Naive size-only checking
  reports this page as 18 failures; it is not.
- **Mobile viewport — clean.** `axe-scan.mjs` gained a width axis (390×844 alongside 1280×720),
  taking it from 6 scans to **12**. All 12 clean, so no reflow or contrast rule fails at narrow
  width that passes at wide. A "found already correct" result: the responsive work holds up.
- **`forced-colors: active` — pass, both themes, both pages.** Text legible, links keep their
  affordance, the theme toggle and buttons keep visible boundaries. The date rail loses its amber
  (expected — forced-colors overrides author backgrounds), but the information it encodes is not
  rail-only: the current role is still tagged `CURRENT` in text, so nothing is conveyed by the
  removed decoration alone.

### The print check is automated now

`scripts/snap.mjs` (`npm run snap`) replaces the manual Cmd-P step, wired into `audit.yml`.

**It deliberately does not diff pixels.** macOS and `ubuntu-latest` disagree on font
rasterisation, so a baseline gate would need a threshold wide enough to hide real regressions.
Every failure mode the print block actually has is a computed-style question, and those are
identical on both platforms. The renders are still uploaded, as artifacts to look at.

Validated the way the axe `incomplete` trap was: the print rule at `tokens.css:379` was deleted
on purpose, and the check went red (9/11 and 7/10 `.reveal` still transparent). Restored, green.

Two traps found while writing it, both worth knowing before touching this file:

- The script must **not** set `reducedMotion: 'reduce'` — the opposite of `axe-scan.mjs`.
  `Base.astro` reveals every `.reveal` immediately under reduced motion, which is precisely the
  state that hides the bug. Loading with motion live and never scrolling is what reproduces a
  cold Cmd-P.
- `emulateMedia({ media: 'print' })` *starts the 280ms opacity transition* rather than jumping,
  so reading `getComputedStyle` immediately reports mid-flight values and every element looks
  like a regression. Worse, `--dur-slow` is authored as `280ms` but Chrome hands it back as
  `.28s`; a bare `parseFloat` waits 0.56 **milliseconds** and the whole suite fails for a reason
  unrelated to printing.

### Corrections to claims made earlier in this file

- **"44px touch targets" was too broad.** Measured: only `.btn-primary` / `.btn-ghost` reach 44
  (`min-height: 2.75rem`). The wordmark is 28px, the theme toggle **32×32**, contact links 27px,
  and inline citation links 14–21px. Nothing is a defect — everything clears SC 2.5.8 by size or
  spacing, as above — but the blanket claim was not accurate and would mislead the next audit.
- **`--rule-control`'s documented grounds were mislabelled.** `.ui-craft/tokens.md` gave 3.14:1
  light / 3.20:1 dark as the figures against `--bg`. Recomputed from `tokens.css`: those are the
  **`--surface-sunk`** figures. Against `--bg` it is **3.45 / 3.92** — which is what this file
  recorded for finding 4, so the two documents disagreed and `findings.md` was right. Fixed in
  `tokens.md` (now a per-ground table) and in the three `tokens.css` comments.

Everything else in the token docs re-derived exactly: `--amber-600` 5.12, `--amber-500` 3.64,
`--amber-400` 11.94, `--focus` on `--surface-sunk` 3.31, rail 1.88 light / 1.94 dark, `--rule`
1.29 / 1.23. **`--focus` clears 3:1 on every ground in both themes** (worst 3.31), so no token
value changed.

### Open — needs a decision, not a fix

- **The canonical and the sitemap both advertise a URL that 301s.** Measured in production:
  `/side-projects` → **301** → `/side-projects/` → 200. But `sitemap-0.xml` says
  `https://arseniocolon.com/side-projects` and the page's own canonical says the same. So the URL
  that returns 200 declares its canonical to be a URL that redirects back to it. This is the
  "two URLs for one page, and the crawler picks" problem the `serialize` hook in
  `astro.config.mjs:23` was written to prevent — the hook strips the slash, and Pages wants it.
  Crawlers generally resolve this, so it is low urgency, but the hook currently points both
  signals at the side the server does not serve. Reversing it would undo documented reasoning,
  so it is Arsenio's call.
- **A v1 resume PDF is still indexed.** `site:arseniocolon.com` surfaces
  `arseniocolon.com/Arsenio_Colon_resume.pdf` with a snippet describing 2017-era content. The URL
  is **404** in production, so nothing is being served — but a search result still points at it,
  and the brief rules out a resume PDF entirely. It will age out of the index on its own; removing
  it sooner needs a Search Console request, which needs Arsenio's Google login.
- Indexing otherwise: `/` 200, `sitemap-index.xml` 200, `robots.txt` 200, `/no-such-page` 404,
  and the `/games` and `/projects` stubs 301 to their slashed forms and then serve their redirect
  pages. No dead v1 path other than the PDF surfaced.

---

## 2026-08-07 — third session

### Font hosting: verified local at runtime, not just in source

Asked to confirm no font is fetched from a third party. Nothing was wrong and nothing changed;
what this section adds is the *method*, because "no CDN" had only ever been asserted from
reading `tokens.css`.

Three independent checks, all clean:

- **Source.** All seven `@font-face` rules (`src/styles/tokens.css:7-40`) use
  `url('/fonts/*.woff2')`. A repo-wide grep for `fonts.googleapis`, `fonts.gstatic`, `typekit`,
  `fontshare` and `@import` returns nothing. `Base.astro` has no `preconnect`, `dns-prefetch` or
  stylesheet `<link>` to any font host — its only `<link>`s are canonical, three `rel="me"`, and
  the three icons.
- **Build output.** Every `url()` in the emitted HTML across all three pages resolves to
  `/fonts/…woff2`; the seven files land in `dist/fonts/` and `file(1)` confirms each is a real
  WOFF2 binary (10–16 KB), not a placeholder or an LFS pointer.
- **Runtime.** Loaded `/`, `/side-projects` and `/no-such-page` in Chrome against
  `npm run preview`, recorded every request, and forced all declared faces via
  `document.fonts` so lazily-fetched weights would also appear. All 7 font requests went to
  `127.0.0.1:4321/fonts/`; all 7 `FontFace` entries reported `loaded`; computed first-choice
  families on rendered text were Barlow, Barlow Condensed and IBM Plex Mono — the local faces,
  so nothing silently fell through to `system-ui`.

The only off-origin request on any page is `gc.zgo.at/count.js`, the analytics script, which is
expected. Worth noting for the next person: on `/` it appeared **twice**, as `http://` then
`https://`. That is a scheme upgrade under a plain-HTTP preview server, not a duplicate tag —
`Base.astro` carries one script element and production is HTTPS-only.

The check script was scratch, not committed; it is ~50 lines of `playwright-core` and is cheap
to rewrite.

### Playwright's browsers were missing, and `npm run axe` was silently broken

Writing the runtime check above turned this up as a side effect. `chromium.launch()` failed:
the cache held build **1223**, while `playwright-core` 1.62 pins **1234**. The scratch check got
past it with `channel: 'chrome'` (the system Chrome), but `npm run axe` has no such escape and
was failing to launch at all — so the accessibility gate had been unrunnable locally, and would
read as a tooling error rather than a violation.

Fixed by `npx playwright install chromium` (~275 MB, Chrome for Testing 151 plus the headless
shell). `npm run axe` then ran **12 scans clean, no WCAG A/AA violations** — unchanged from the
last recorded run, so nothing regressed while the gate was down. CI was never affected; the
audit workflow installs browsers on a fresh runner every time.

Also corrected `CLAUDE.md`, which told the next session to expect **6 scans**. It has been 12
since the mobile viewport was added as a third axis (see the second 2026-08-07 section);
`README.md` already said 12 in both places. A checklist that under-reports its own coverage is
how a half-run gate passes for "clean".

---

## Already correct — do not re-suggest

Checked this session and found properly handled. Several of these look like obvious
improvements from the outside.

**Build and delivery** — CSS inlined (`inlineStylesheets: 'always'`, no render-blocking
stylesheet); zero JS chunks, ~2 KB of inline module script; images through the Astro pipeline
as WebP with explicit `widths`/`sizes`, `loading="lazy"`, and `width`/`height` set so there is
no CLS; `aspect-ratio` reserved on card images; fonts self-hosted with `font-display: swap`,
no CDN — confirmed at runtime on 2026-08-07, see the third session above for how.

**Design system** — a real three-layer token spine, documented separately; dark mode as a
designed palette rather than an inversion, with `[data-theme]` correctly beating the media
query *in both directions*; no-flash inline theme script; dual `theme-color` metas kept in sync
by JS; fluid type via `clamp()`; intrinsic grids that don't side-scroll at 320px.

**Accessibility** — semantic landmarks throughout; `<ol>` for the timeline; `<time datetime>`
on every date; skip link; `:focus-visible` rings; `prefers-reduced-motion` handled in both CSS
and JS; decorative images correctly `alt=""`, content images described; ARIA used sparingly and
correctly; target sizes clear SC 2.5.8 (by size on the controls, by spacing on the inline links —
see the second 2026-08-07 section for the measured figures, and note the CTAs are the only 44px
targets); heading hierarchy gapless on all three pages; clean under `forced-colors` and at a
390px viewport.

**SEO** — per-page title and description; canonical with trailing slash normalised; full
OG/Twitter cards; per-route OG images; `Person` JSON-LD; generated sitemap with a `serialize`
hook so it agrees with the canonicals — though both then disagree with what Pages serves, see
"Open" above; `robots.txt`; legacy `/games` and `/projects` rescued via config redirects, and the
`#projects` / `#games` hash equivalents by an inline script.

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
- ~~**`<h1>Arsenio<br>Colón</h1>`** extracts as `ArsenioColón`.~~ **Resolved 2026-08-07** as a
  side effect of the hero change: the full-width name sets on one line, so the `<br>` is gone and
  the accessible name is now plain text. It was never fixed on purpose — worth noting because the
  reverse is just as easy to reintroduce the next time the name needs to break.
- ~~**The theme toggle uses `aria-pressed` on a tri-state concept**~~ **Resolved 2026-08-07.**
  It now cycles system → light → dark → system with the current stop named, and `aria-pressed` is
  gone. Verified by driving the real control in both OS preferences: returning to `system` clears
  `localStorage` *and* `data-theme`, and restores each `theme-color` meta to its own per-media
  value, so browser chrome tracks the OS again rather than staying pinned to the last choice.
  Below 34rem the visible word is dropped and the control returns to its 2rem square — see
  `decisions.md` for why.
