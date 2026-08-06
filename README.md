# arseniocolon.com

Personal site. [Astro](https://astro.build), static output, no backend. Lives at
**arseniocolon.com** (and `klecoz.github.io`, which redirects there).

```
npm install
npm run dev        # http://localhost:4321, hot reload
npm run check      # astro check — typechecks .astro files and content collections
npm run build      # → dist/
npm run preview    # serve dist/ exactly as production will
```

`npm run check` is currently clean at zero errors, warnings and hints, and CI runs it before
the build — so anything it reports is a real regression, not pre-existing noise.

---

## How deploys work

```bash
npm run deploy      # push + start the build
gh run watch        # follow it (~50s)
```

Use `npm run deploy`, not a bare `git push`. A push alone does **not** currently start a
build — see below.

```
.github/workflows/deploy.yml
   ├─ npm ci
   ├─ npm run check           ← typecheck; fails the build on a real regression
   ├─ npm run build           → dist/
   ├─ assert dist/CNAME       ← fails the build if the domain would break
   ├─ upload-pages-artifact
   └─ deploy-pages            → https://arseniocolon.com
```

Also visible at **Actions → Deploy to GitHub Pages**.

### Why a plain `git push` does not deploy

**Push events do not start workflow runs on this repository.** GitHub receives and records
the push; no run is ever created. `workflow_dispatch` works fine, which is why
`npm run deploy` dispatches explicitly.

This was isolated on 2026-08-06. What was ruled out:

| Tried | Result |
|---|---|
| HTTPS push (via `gh` credential helper) | `PushEvent` recorded, no run |
| SSH push (registered key, `ssh -T` greets by name) | `PushEvent` recorded, no run |
| `branches: [master]` filter | no run |
| No branch filter at all (bare `push:`) | no run |
| A second, minimal workflow (`echo`, bare `push:`) | no run |
| `workflow_dispatch` on both workflows | runs immediately, succeeds |

Also confirmed healthy: Actions enabled with `allowed_actions: all`, default workflow
permissions `write`, both workflows `state: active`, no repository rulesets, repo not a
fork, not archived, not disabled, `default_branch: master`, and the recorded `PushEvent`
carries the correct `ref=refs/heads/master`.

So everything in this repo is configured correctly and the cause is on GitHub's side. If
you want to chase it, **Settings → Actions → General** in the web UI can expose policy that
the REST API does not, and this is a reasonable thing to hand to GitHub Support — the
minimal `echo`-only workflow is a clean reproduction.

Until then `npm run deploy` is the deploy command, and `on: push` stays in the workflow so
it resumes working by itself if this ever clears.

> The SSH remote is worth keeping regardless — it just wasn't the cause.

### One-time setup (already done)

Settings → Pages → Source is set to **GitHub Actions**, not "Deploy from a branch."
If that ever gets reset, every deploy fails until it's set back. Confirm with:

```bash
gh api repos/Klecoz/klecoz.github.io/pages --jq '.build_type'   # → "workflow"
```

### Rolling back

The build is deterministic, so reverting the commit and pushing is a full rollback:

```bash
git revert <bad-sha> && git push
```

To see the pre-Astro site, it's tagged: `git show v1-legacy`.

### If the custom domain breaks

`public/CNAME` is the single source of truth and must reach `dist/CNAME`. CI asserts this,
so a green build means the domain is intact. If the site starts serving from
`klecoz.github.io` instead, check that file first — and check that Pages → Custom domain
still reads `arseniocolon.com`.

---

## Editing content

Content is Markdown in `src/content/`, typed by `src/content.config.ts`. Adding an entry
means adding a file — no templates to touch.

### A new job

Create `src/content/experience/0-thing.md`. Lower `order` sorts nearer the top, and
`current: true` is what draws the amber block on the date rail — **move it to the new
entry and remove it from the old one.**

```markdown
---
order: 0
role: Principal Engineer
org: Some Company
location: Buffalo, NY
employment: Full-time · Hybrid
start: Jan 2027
end: Present
startISO: 2027-01
endISO: null
current: true
---

- What you built, in one sentence that leads with the outcome.
- Another one.
```

The body is a plain Markdown list. That's the bullets.

### A new game or client project

Same idea in `src/content/games/` or `src/content/clients/`. Put the screenshot in
`src/assets/games/` — **not** `public/`. Anything under `src/assets/` goes through Astro's
image pipeline and comes out as sized, lazy-loaded WebP; a 354 KB PNG ships as about 3 KB.
Files in `public/` are copied byte-for-byte and stay huge.

```markdown
---
order: 0
title: Some Game
tag: Global Game Jam
year: "2027"
vr: true
image: ../../assets/games/some-game.png
links:
  - label: itch.io
    href: https://klecoz.itch.io/some-game
  - label: Source
    href: https://github.com/Klecoz/some-game
---

A sentence or two about it.
```

### Everything else

Bio, skills, education, community and contact are inline in `src/pages/index.astro`,
near the top of the file.

---

## Design

Two documents are the source of truth, and they're worth reading before changing anything
visual:

- **`.ui-craft/brief.md`** — the direction, the voice rules, the banned-phrase list, and
  the constraints that came from Arsenio directly.
- **`.ui-craft/tokens.md`** — the token spine and why each value is what it is.

`src/styles/tokens.css` implements them. Change colours there, not in components.

Two rules that are easy to break by accident:

1. **Uppercase is limited to the wordmark and 11–13px tracked labels.** Caps on headings
   and job titles is the single fastest way to make a page read as machine-generated.
2. **Amber gets 3–5 placements per screen**, and `--accent-solid` (not `--accent`) is the
   one to use when amber is a *background* — the lighter step doesn't clear 4.5:1 contrast
   behind light text.

### The social cards

`public/og.png` and `public/og-side-projects.png` are generated, not hand-drawn — one card per
route, so a link to `/side-projects` doesn't preview as the homepage:

```bash
npm install --no-save satori && node scripts/make-og.mjs && npm uninstall satori
```

Only needed if a title or the palette changes. satori stays out of `dependencies` deliberately,
which is also why the cards are committed rather than built — see the header comment in
`scripts/make-og.mjs`. Pages pick their card with the `ogImage` prop on `Base.astro`.

### Icons

`public/logo.svg` is the mark: Barlow Condensed "A" on the ink ground with the amber rail the
timeline uses. `favicon-32.png` covers engines that ignore an SVG icon, and
`apple-touch-icon.png` is flattened to 180×180 because iOS drops transparency and masks the
result into a squircle. Regenerate the PNGs from the SVG with `sharp` if the mark changes.

---

## Things that will look like bugs but aren't

**The email address isn't in the HTML.** It's base64'd, reversed, split across two `data-`
attributes and assembled only on click, so scrapers that execute JS on page load still
come away with nothing. `src/components/EmailReveal.astro`. There's a `<noscript>` fallback
pointing at LinkedIn.

**Old `#projects` / `#games` links are caught in JavaScript.** Hash fragments never reach
the server, so this can't be a redirect — it's a small inline script in `src/pages/index.astro`.
The `/games` and `/projects` *paths* are handled properly in `astro.config.mjs`.

**Stylesheets are inlined** (`inlineStylesheets: 'always'`). About 20 KB, which buys back
two render-blocking round trips and means fonts start loading during the first parse. That's
also why there are no `<link rel="preload">` font hints — they'd be redundant and Chrome
would warn about them.

**Fonts are self-hosted** in `public/fonts/` (104 KB, seven faces, Latin subset). No Google
Fonts request at runtime, by design.

**There is a print stylesheet, and it is load-bearing.** `.reveal` elements sit at `opacity: 0`
until IntersectionObserver fires, so without the `@media print` block in `tokens.css` anyone who
hit Cmd-P before scrolling got a page with no timeline on it at all. The block also forces the
light tokens, drops the nav and the CTAs, restates the amber `Current` chip as an outline
(backgrounds don't print), and suppresses the citation URLs, which run past 100 characters.
The brief rules out a resume PDF; this is the paper copy instead.

**The sitemap is generated**, by `@astrojs/sitemap`. `public/sitemap.xml` used to be
hand-written with a frozen `lastmod` and was deleted. `robots.txt` points at
`/sitemap-index.xml`. A `serialize` hook strips the trailing slash so the sitemap and the
canonical tags agree on one URL per page.

---

## Health check

Both pages score 100 on Lighthouse performance, accessibility and SEO. Worth re-running
after any significant change:

```bash
npm run build && npm run preview          # then, in another shell:
npx lighthouse http://localhost:4321/ --view
npx astro preview stop
```

Best Practices sits at 81 on localhost purely because it isn't HTTPS. In production it's 100.
