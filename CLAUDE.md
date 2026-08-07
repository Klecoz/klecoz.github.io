# CLAUDE.md

Working instructions for this repo. Read `findings.md` and `decisions.md` before proposing
changes — between them they hold most of what has already been checked and already been argued
about.

## The site

Astro 7, static output, no backend, no CSS framework, no UI framework. Two real pages (`/`,
`/side-projects`) plus a 404 and two redirect stubs. Deploys to GitHub Pages via
`.github/workflows/deploy.yml`. Prose lives inline in `index.astro`; projects and jobs live in
content collections under `src/content/`.

`README.md` is the operational manual — commands, deploys, editing content, and a "things that
will look like bugs but aren't" section that pre-empts most well-meaning changes.

## End of every session — required

Before finishing a working session, update all three of these. Not optional, and not only when
something big happened:

1. **`README.md`** — if behaviour, commands, or setup changed. This is what someone reads to
   *operate* the site.
2. **`findings.md`** — anything measured or verified this session. Add a dated section. Include
   the method, not just the conclusion, and record things found *already correct* as well as
   defects — the "do not re-suggest" list is the highest-value part of that file.
3. **`decisions.md`** — anything chosen this session, with the alternatives rejected and why.
   Mark choices Arsenio made himself with **[AC]**; those don't get revisited without asking.

If a session genuinely changed nothing in one of them, say so explicitly in the summary rather
than skipping silently.

Keep them honest. A number that wasn't measured doesn't belong in `findings.md` — say what was
reasoned versus what was run.

## How to work here

- **Verify, don't assert.** This repo's history is full of things that looked obvious and were
  wrong (see the push-trigger and stale-deploy post-mortems in the README). Measure it, render
  it, or run it. Contrast ratios get computed. Layout claims get screenshotted.
- **Comments carry reasoning, not description.** The existing code explains *why* a value is
  what it is. Match that. A comment restating the line below it is noise here.
- **Check `README.md`'s "looks like a bug but isn't" section** before fixing something odd. The
  email obfuscation, the deliberate `&nbsp;` entities, the load-bearing print stylesheet, the
  `<noscript>` reveal escape and the asset prune are all intentional.
- **Design decisions get rendered, not described.** Arsenio has rejected text-described options
  before. Build the comparison, screenshot it, then ask.

## Copy

**Site prose is Arsenio's own writing.** The bio and "How I work" were supplied verbatim. Do
not improve the wording, tighten it, or fix its rhythm — only proper-noun casing. The voice
rules and banned-phrase list are in `.ui-craft/brief.md`; the banned list includes `passionate`,
`leverage`, `seamless`, `robust`, "not just X but Y", and rule-of-three flourishes.

## Before calling anything done

```bash
npm run check                       # must be 0 errors, 0 warnings, 0 hints
npm run build                       # watch the prune line; dist should be ~630 KB
npm run preview -- --host 127.0.0.1 --port 4321 &
npm run axe                         # 6 scans, must be clean
bash scripts/assert-cname.sh
```

Cmd-P both pages too if anything touched `.reveal`, layout, or tokens — the print stylesheet is
load-bearing and easy to break without noticing.
