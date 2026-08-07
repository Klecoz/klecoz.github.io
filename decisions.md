# Decisions

Choices made, and the alternatives rejected. The rejected column is the point of this file —
anything here that looks arbitrary was probably argued about.

Decisions Arsenio made himself are marked **[AC]**. Those don't get revisited without asking.

---

## 2026-08-07

### Control borders: a new token, at the lightest value that passes **[AC]**

`.btn-ghost`, `.toggle` and `.copy` used `var(--rule)` at 1.29:1 — failing SC 1.4.11, and in
dark mode nearly invisible. Three options were rendered against the real controls in both
themes before choosing.

| | Value | Ratio | Verdict |
|---|---|---|---|
| A | keep `--rule` | 1.29 / 1.23 | fails |
| **B** | **new `--rule-control`: `#77848D` light, `#67747D` dark** | **3.45 / 3.92** | **chosen** |
| C | reuse `--muted` | 4.90 / 5.20 | rejected |

C needed no new primitive, which was its whole appeal. Rejected because the heavier outline
made ghost buttons read at nearly equal weight to the solid primary button — the hierarchy
between "See the work" and "LinkedIn" is doing real work in the hero.

B adds `--steel-540` and `--steel-560` to the ramp. Two values rather than one because both
themes were rendered and approved that way, even though a single mid-grey would technically
pass in both.

**Dividers keep `--rule`.** Card edges, section borders and the date rail are decoration; WCAG
doesn't govern them, and raising them would coarsen the whole look. The line is: is this
hairline the *only* boundary of something you can interact with?

### Card ratio: 4/3 **[AC]**

Source ratios are 1.0 (×6), 1.41 (×2), 1.84 and 2.32 — no box flatters all of them.

| Ratio | Mean kept | Squares | Widest source |
|---|---|---|---|
| 16/10 (was) | 71% | 63% | 69% |
| 3/2 | 73% | 67% | 65% |
| **4/3** | **77%** | **75%** | **57%** |
| 1/1 | 84% | 100% | 43% |

Chosen on rendered comparison, not the table. At 16/10 the Saimon Says menu lost its Play
button, Trance Mission's title art was cut through, and Bird the Squirrel lost the ground. 4/3
fixes all three. It costs a tighter crop on Office Mistakes, whose 2.32 source is the outlier.

1/1 wins on mean and was rejected anyway: it crushes the two panoramic shots to 43–54% and
makes the cards very tall.

### Screenshots stay as they are **[AC]**

Eight of ten sources are ≤400px, so cards upscale on retina. Re-exporting at 2× would be the
real fix. Arsenio declined — the games are 2016–2023 and re-capturing means rebuilding old
Unity projects. The ratio change above was the mitigation that needed no new art.

### Prune the build output rather than shrink the sources

1,318 KB of unreferenced originals shipped. Three ways out:

- **Chosen:** delete them post-build (`scripts/prune-assets.mjs`). Touches no image on disk,
  which is what "leave the screenshots alone" required.
- Rejected: convert sources to WebP. Shrinks the orphan rather than removing it, and modifies
  the source art.
- Rejected: live with it. It was ~70% of the artifact.

The prune **bails out entirely if it finds a JS chunk** in `_astro/`, because a chunk could
build an asset URL at runtime and escape a static scan. Today the site ships zero chunks, so
the scan is complete. If that changes, it warns and deletes nothing — the failure mode is
"stopped helping", never "deleted something in use".

### JSON-LD images go through `getImage()`, never `image.src`

`entry.data.image.src` is the *original* asset path. Naming it in structured data pins all ten
pruned files back into the build — which is exactly what happened on the first attempt, taking
`dist` back to 1.9 MB.

Requesting `getImage()` with an arbitrary width (640) also failed: it emitted a parallel set of
ten derivatives, 756 KB. Passing the *same* `widths`/`sizes` the cards pass reuses what already
ships. Final: 628 KB, about 8 KB above the theoretical floor.

### Scores don't gate CI; bytes do

Lighthouse performance scores swing 5–10 points from runner CPU contention. A hard assertion on
them is a false-alarm machine, and the first false alarm is how a workflow gets deleted.

- **Gate (error):** accessibility at 1.0, the deterministic SEO sub-audits, image-format audits,
  and byte budgets — total weight, fonts, script, third-party count.
- **Advise (warn):** performance, SEO category, best-practices.
- **Off, with reasons:** `canonical` (objects to a localhost page canonicalising to production),
  `errors-in-console` (the blocked analytics request), `uses-long-cache-ttl` (LHCI's server sets
  no headers; Pages does), `unused-css-rules` (inlining is the documented trade).

Accessibility was set to **error** rather than warn because `npm run axe` was verified clean
across both pages, the 404, and both themes first — so a failure is a regression, not a
starting condition. The original plan was warn-everything-first; having a local measurement
made that unnecessary for this one assertion.

`resource-summary:third-party:count` is capped at **1, not 0**, because a blocked request may
still be counted and the difference isn't worth a false failure. Anything genuinely new makes
it 2.

### Link rot files an issue; it never turns Actions red

A scheduled job that fails and *stays* failing makes a red Actions tab normal — and the deploy
lives in that tab. Learning to ignore a red X there is how the stale-deploy race goes unnoticed
a second time. So: `fail: false`, one `link-rot` issue re-commented rather than duplicated, and
auto-closed when the links recover.

Weekly, not daily: these URLs change on a scale of months, so daily is 7× the runs and 7× the
transient-5xx exposure for the same signal.

**`--accept 429` but never a global `--accept 403`.** A 429 means the host answered and
throttled us — not rot. Accepting 403 globally would mask the status code that most often
*is* rot. The one host that always 403s is named in `.lycheeignore` instead.

**LinkedIn and WGRZ excluded**, based on probing rather than assumption (see `findings.md`).
The WGRZ exclusion is the one that costs something — it's the press citation, and nothing will
now notice if the article moves.

### `audit.yml` is separate from `deploy.yml`

A score must never be able to block publishing. Keeping them apart also means the audit stays
deletable in isolation if it ever starts crying wolf — that should cost one file, not the
deploy.

It runs on **master as well as PRs**, because `npm run deploy` pushes straight to master. Most
changes here never see a pull request, so a PR-only audit would guard almost nothing. On master
it's detection rather than prevention, which is the right trade.

### Concurrency groups are deliberately not shared

`deploy.yml` owns `group: pages` with `cancel-in-progress: false` — publishing is genuinely
exclusive, and interrupting it mid-flight is worse than letting it finish.

`pr.yml` and `audit.yml` use `${{ github.workflow }}-${{ github.ref }}` with
`cancel-in-progress: true`. Opposite policy on purpose: only the newest commit is worth
building, and there's no half-finished publish to protect. The `github.workflow` prefix is what
keeps those two in different groups despite the identical `github.ref`.

Joining `pages` would let a draft PR queue in front of a deploy, or cancel one mid-publish.

### `--nav-h` is a token, not a local value

The sticky header's height and the `scroll-margin-top` on `#main` / `#work` / `#contact` have to
agree. Two copies of `3.5rem` in two files is a drift bug waiting to happen, and its symptom —
every in-page jump landing slightly under the nav — is subtle enough to survive for months.

### `ProfilePage` wrapping `Person`, and an `ItemList` for projects

`Person` alone describes Arsenio but says nothing about the page. `ProfilePage` with
`mainEntity` is schema.org's documented shape for a personal site, and it's what lets a consumer
tell "a page mentioning someone" from "that person's own page".

The projects `ItemList` is built from the same collections the cards render from, so markup and
structured data can't drift. `VideoGame` for games, `WebSite` for the two client sites.

## 2026-08-07 — second session

### The print check asserts computed styles, not pixels

`scripts/snap.mjs` replaces the manual Cmd-P step. The obvious implementation — screenshot both
pages and diff against committed baselines — was written and then rejected before it shipped.

Baselines rendered on a Mac disagree with `ubuntu-latest` on font rasterisation alone. That
leaves two bad options: a threshold wide enough to absorb the difference, which is also wide
enough to hide a real regression, or a gate that fails on every run until someone deletes it.
Neither is worth having, and this repo already has a rule about checks that cry wolf.

Every failure mode the print block actually has is a computed-style question — is `.reveal`
opaque, is the header hidden, do external links carry their href, do the exempt ones stay
exempt — and those answers are byte-identical on both platforms. The renders are still produced
and uploaded as artifacts, because looking at them is useful; they just aren't the gate.

**Rejected alternatives:** pixel diff with a threshold (hides regressions); generating baselines
on the runner and committing them (a rebaseline on every intentional visual change, and the
baseline is only as trustworthy as whoever eyeballed it); dropping the check and leaving Cmd-P
manual (it is the only pre-ship step a human can silently skip).

### Light and dark are equally canonical — **[AC]**

Asked which theme a cold visitor sees, Arsenio said genuinely both, neither is primary.

The cost is real and worth naming rather than discovering later: every visual comparison now gets
built and reviewed twice, so hero variants, toggle mockups and any polish pass roughly double
their screenshot surface. Accepted deliberately — the dark palette is a designed peer, not an
inversion, and reviewing it second-class is how it would rot.

### Hero: full-width name, stack as a spec strip — **[AC]**

Arsenio said something about the hero was nagging without saying what, so four variants were
built on a throwaway route and rendered light and dark at 1280 and 390 — describing them was not
an option, per the standing rule. He picked **B**: the name sets on one line at its own
`clamp(2.75rem, 8.5vw, 5.25rem)`, the bio keeps a single `--measure`, and the three stack groups
drop below a hairline as a three-column strip.

**Rejected:** A (the shipped asymmetric 1.65fr / 1fr rail); C, which carried the timeline's date
rail up into the hero and scored highest on variance; D, which demoted the AR/VR sentence below
the CTAs.

**Recorded because it was argued and lost:** B leaves the right half of the bio row empty and
reads as a more uniform vertical stack, which is the shape `brief.md` sets DESIGN_VARIANCE 8 to
avoid. That objection was put to Arsenio with the render in front of him and he chose B anyway.
It is his call and it is not to be relitigated — but if the hero ever feels flat, this is the
reason, and C is the built alternative.

Two things fell out of it: the `<br>` in the name is gone, which incidentally fixed the
`ArsenioColón` accessible-name issue in `findings.md`; and `.hero-grid` no longer exists, so the
print and narrow media queries now size `.stack` directly.

### Theme toggle: cycling, with the stop named — **[AC]**

Three treatments were rendered in all three states, light and dark, and Arsenio picked the
cycling button: one control stepping system → light → dark → system, the current stop spelled out
beside the icon.

**Rejected:** the segmented three-stop control, which hides nothing but costs ~230px in a sticky
nav already carrying a wordmark and three links; and the icon-only three-stop, which keeps the
current 32px footprint but puts three states behind one unlabelled square.

The icon now names the stop you are **on**, not the one you would move to. The old two-state
control did the opposite, which stops making sense once "next" is no longer the only other
option.

**`aria-pressed` is gone and is not to be added back.** It can only say pressed or not-pressed
about something with three answers. The accessible name carries the state instead, and includes
the visible word so SC 2.5.3 still holds.

### Dropping the toggle's label below 34rem

The label costs about 66px. At 320px the nav does not have it — the wordmark and links already
fill the row — so under 34rem the control returns to the 2rem square it used to be, keeping all
three stops and its accessible name.

Worth recording because of how it was found. The first attempt fixed the resulting collision by
adding `white-space: nowrap` to the nav links, which looked obviously right and was wrong: the
original nav *relies* on "Side projects" wrapping to two lines to fit at 320px. Measured before
and after — `.mark` right edge at 124px, links left edge at 140px, a 16px gap — and `nowrap`
turned that gap into an overlap. The geometry now matches the pre-change nav exactly.

### Two pages, permanently — **[AC]**

No notes section, no blog, no RSS, no `@astrojs/rss`. Asked directly whether the two-page shape
was permanent or an unfilled gap, Arsenio said permanent. Not to be raised again.

### Deliberately not doing

| Rejected | Why |
|---|---|
| Prettier / ESLint / Stylelint | Two pages, one author. `astro check` covers the type surface. A formatter's first commit is a repo-wide reformat diff; its steady state is CI failures that are never bugs. |
| A test runner | Nothing to unit-test. Build + `astro check` + CNAME assertion + audit cover every failure mode this site has actually had. |
| HTML validation (`vnu` / `html-validate`) | Astro emits valid HTML. Near-zero yield. |
| npm Dependabot | Five direct dependencies; it would open PRs faster than they'd be reviewed. `github-actions` monthly is a defensible later addition. |
| Lighthouse on a schedule | Static site — bytes cannot change without a commit. Would burn minutes re-confirming the last result. |
| `temporaryPublicStorage` on the Lighthouse action | Publishes every report to a public Google-hosted URL that then expires. |
| Moving off GitHub Pages for cache headers | Real problem (unhashed fonts re-validate every 10 min), but not worth redoing infra that was just hardened. If it bites, route fonts through `src/assets/` for content hashes instead. |
| Font preloads | Would genuinely save ~1 round trip. Left off because `font-display: swap` means fonts never block render. The *reasoning* previously recorded for this was wrong and has been corrected. |
| Checking link fragments | `#page=39` is a PDF viewer directive; `#projects` / `#games` are handled at runtime. None exist in the HTML. |
| axe `best-practice` / `experimental` tags | Flag opinionated non-defects (landmark uniqueness, region coverage) and would bury the WCAG failures that matter. |
| A notes / blog section and an RSS feed | **[AC]** Two pages is the permanent shape, not a stage on the way to more. |
| Pixel-diff baselines for the print check | See above — platform font rasterisation makes the threshold either useless or hostile. |
| Testing the "legible in eight seconds" claim | **[AC]** It's a design intent, not an assertion. Treating it as testable over-formalises a two-page site. |
| Verifying the analytics tag fires | Superseded, and the reason is instructive: this was declined as unnecessary, then the tag turned out to be pointing at a site that returns 400. Finding 9 in `findings.md`. |
| An inbound-link audit (LinkedIn, GitHub profiles) | **[AC]** Already handled by Arsenio when v2 shipped. |
| Search Console verification and sitemap submission | **[AC]** Scoped to a read-only indexing check. Submission needs his Google login. |

---

## Standing constraints

From `.ui-craft/brief.md`, repeated here because they're the ones most likely to be broken by
accident:

- **Games are past tense.** Never present-tense framing.
- **AI use gets stated, not sold.**
- **The bio and "How I work" are Arsenio's own words**, verbatim, apart from proper-noun casing.
  A rewrite pass sands off the voice the brief exists to protect.
- **No "open to work" banner and no resume PDF.** A status line goes stale and a PDF drifts out
  of sync; the print stylesheet can't.
- **Radius is 0 everywhere.** Deliberate, not inherited.
- **Accent budget: 3–5 amber placements per viewport.**
