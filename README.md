# arseniocolon.com

Personal site. [Astro](https://astro.build), static output, no backend. Lives at
**arseniocolon.com** (and `klecoz.github.io`, which redirects there).

```
npm install
npm run dev        # http://localhost:4321, hot reload
npm run build      # → dist/
npm run preview    # serve dist/ exactly as production will
```

---

## How deploys work

```bash
npm run deploy      # push to master + kick off the build
gh run watch        # follow it (~50s)
```

That's it. `npm run deploy` pushes and then explicitly dispatches the workflow — the
explicit dispatch is deliberate, see the gotcha below.

```
.github/workflows/deploy.yml
   ├─ npm ci
   ├─ npm run build           → dist/
   ├─ assert dist/CNAME       ← fails the build if the domain would break
   ├─ upload-pages-artifact
   └─ deploy-pages            → https://arseniocolon.com
```

Also visible at **Actions → Deploy to GitHub Pages**.

### Gotcha: a plain `git push` does not deploy

On this machine, git authenticates through the `gh` CLI credential helper
(`git config --global credential.https://github.com.helper` → `gh auth git-credential`).
GitHub records the push, but **suppresses workflow runs triggered by that token**, so
`on: push` never fires. Verified: three pushes, three `PushEvent`s, zero workflow runs.

This is why `npm run deploy` dispatches the workflow explicitly. The `on: push` trigger is
still in the workflow and costs nothing — it will simply start working on its own if the
auth ever changes.

**To get real push-to-deploy back**, register the SSH key that already exists at
`~/.ssh/id_ed25519.pub` and switch the remote over:

```bash
gh ssh-key add ~/.ssh/id_ed25519.pub --title "$(hostname)"   # needs admin:public_key scope:
                                                             # gh auth refresh -s admin:public_key
git remote set-url origin git@github.com:Klecoz/klecoz.github.io.git
ssh -T git@github.com                                        # should greet you by name
```

After that a plain `git push` deploys, and `npm run deploy` still works fine either way.

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

### The social card

`public/og.png` is generated, not hand-drawn:

```bash
npm install --no-save satori && node scripts/make-og.mjs && npm uninstall satori
```

Only needed if the name, title or palette changes.

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
