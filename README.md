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
npm run deploy      # push, then confirm a run actually started
gh run watch        # follow it (~50s)
```

A bare `git push` starts a build too. Prefer `npm run deploy` anyway: it refuses to publish
from a dirty tree or a non-master branch, and it confirms a run actually started instead of
leaving you to notice later that nothing happened.

```
scripts/deploy.sh  ← npm run deploy
   ├─ refuse a dirty tree or a non-master branch
   ├─ git push origin master
   └─ wait for the push-triggered run; dispatch only if none appears

.github/workflows/deploy.yml
   ├─ assert github.sha == tip of master  ← refuses to publish a stale commit
   ├─ npm ci
   ├─ npm run check                       ← typecheck; fails on a real regression
   ├─ npm run build                       → dist/
   ├─ assert dist/CNAME                   ← fails if the domain would break
   ├─ upload-pages-artifact
   └─ deploy-pages                        → https://arseniocolon.com
```

Also visible at **Actions → Deploy to GitHub Pages**.

### Push triggers: broken 2026-08-06, working since

**A plain `git push` deploys again.** Push events stopped creating runs on this repository,
which is why `npm run deploy` used to dispatch explicitly. They started working again the
same evening — first push-triggered run was `e64e788` at 22:19 UTC on 2026-08-06 — with no
change on this side. Every commit since has produced one.

The dispatch is now a fallback rather than the default, because doing it unconditionally
turned out to be [actively dangerous](#the-stale-deploy-race).

The original diagnosis is kept because the failure could recur. What was ruled out:

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

Everything in this repo was configured correctly and the cause was on GitHub's side, which
is consistent with it clearing on its own. If it recurs, **Settings → Actions → General** in
the web UI can expose policy the REST API does not, and it's a reasonable thing to hand to
GitHub Support.

> The SSH remote is worth keeping regardless — it just wasn't the cause.

### The stale-deploy race

On 2026-08-07 the site kept serving the previous build while Actions showed every check
green. Two runs had been created a second apart:

| Run | Commit | Trigger |
|---|---|---|
| `31133906085` | `90370ca` (new) | `push` |
| `31133906050` | `9e931e7` (old) | `workflow_dispatch` |

`npm run deploy` ran `git push && gh workflow run deploy.yml --ref master`. The push landed,
but `--ref master` is resolved server-side, and it resolved before GitHub registered the
push — so the dispatch built the *previous* commit. Both runs succeeded, and the stale one
finished last, so its artifact is what Pages published.

Two things prevent a repeat:

- **`npm run deploy` no longer dispatches blindly** (`scripts/deploy.sh`). It pushes, waits
  for the push-triggered run, and dispatches only if none appears — which can't race,
  because by then the push has definitely landed.
- **The workflow refuses to publish a non-tip commit.** Its first step compares `github.sha`
  against the live tip of `master` and fails the run if they differ. Runs are not ordered by
  commit and `concurrency` cannot order them, so this check — not cancellation — is what
  guarantees the site matches `master`.

`cancel-in-progress` is deliberately left `false`: interrupting `deploy-pages` mid-publish
is worse than letting a superseded run finish and get rejected by the guard.

If you ever see that guard fail, it is working. Check that a newer run is publishing the
commit you expect.

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

**Stylesheets are inlined** (`inlineStylesheets: 'always'`). About 22 KB, which buys back
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

**There are `&nbsp;` entities scattered through the content Markdown**, and one literal
U+00A0 inside `'.NET 10'` in `index.astro`. They are deliberate. Body prose gets
`text-wrap: pretty` in `tokens.css`, which stops a sentence ending with one word stranded
on its own line — but Firefox doesn't support it, so the non-breaking spaces hold together
the pairs that read wrong when split on any engine: `Meta Quest 2`, `M&T Bank`,
`2,000 transactions`, `HTC Vive`, `Game Jam 2020`, the `·` separators, and the timeline
dates (bound by a `bind()` helper in `Timeline.astro` rather than by editing frontmatter).
Headings deliberately keep `text-wrap: balance` instead; the two are competing values and
`balance` measures better on two or three short lines. When adding copy, a plain space is
fine — `pretty` handles ordinary widows on its own.

**The sitemap is generated**, by `@astrojs/sitemap`. `public/sitemap.xml` used to be
hand-written with a frozen `lastmod` and was deleted. `robots.txt` points at
`/sitemap-index.xml`. A `serialize` hook strips the trailing slash so the sitemap and the
canonical tags agree on one URL per page.

---

## Health check

Both pages score 100 on Lighthouse performance, accessibility and SEO. Worth re-running
after any significant change:

```bash
npm run build
npx astro preview --background            # `npm run preview` runs in the foreground,
npx lighthouse http://localhost:4321/ --view   # which `preview stop` can't reach
npx astro preview stop
```

Best Practices sits at 81 on localhost purely because it isn't HTTPS. In production it's 100.
