# Design brief — arseniocolon.com

## 1. What this is

Arsenio Colón's personal site. One page that makes the case for hiring him, plus a second page
holding the games and client work he's built. Static, no backend, served from GitHub Pages at
arseniocolon.com.

## 2. Audience

Primarily hiring managers and recruiters — .NET and platform roles in and around Buffalo. Secondly
engineers who might work with him. Both scan before they read, so the timeline has to be legible
in about eight seconds.

## 3. Design intent

**Direction: "Steel."** Buffalo industrial. Cold grey ground, condensed type, heavy horizontal
rules, machinery amber as the single accent. Chosen over five alternatives (monospace-ledger,
Swiss, editorial-didone, humanist-plated, dark-neon) because it's the only one with a sense of
place, and because a hard-edged spec-sheet look suits someone whose day job is enterprise .NET.

- **CRAFT_LEVEL 8** — run the polish pass.
- **MOTION_INTENSITY 4** — entrances and hover, one scroll reveal per section, everything ≤300ms.
- **VISUAL_DENSITY 4** — readable, not dashboard-dense.
- **DESIGN_VARIANCE 8** — portfolio default. Layout must not be a uniform vertical stack.

**Signature detail: the date rail.** A hairline running the length of the timeline with amber
ticks at each role boundary and a filled amber block spanning the current role. It encodes real
information (recency, tenure, where he is now), so it's structure rather than decoration.

**Radius is uniformly 0.** Normally uniform radius is a tell; here hard edges are the concept.
Deliberate, not inherited.

## 4. Voice

Write like Arsenio talks, not like a model. Evidence from his own messages:

> "Making games and VR stuff was part of my past, and while I play around with stuff here and
> there, it isn't really part of what I do outside of work anymore."
> "I think the linkedin and contact pages should do the heavy lifting here."
> "I don't want more spam."

Traits: plain verbs, `stuff` used as a real word, light hedges ("not really", "here and there"),
contractions throughout, short declaratives that land, no metaphor, no self-aggrandizement, very
few em dashes.

**Banned outright:**
`passionate` · `leverage` · `utilize` · `seamless` · `robust` · `cutting-edge` · `innovative` ·
`delve` · `dive deep` · `unlock` · `empower` · `elevate` · `journey` · `spearheaded` ·
`proven track record` · `results-driven` · `detail-oriented` · `best-in-class` · `game-changer` ·
"not just X, but Y" · "That's where X comes in" · "Here's the thing" · rule-of-three flourishes
("small, fast, finished") · appositive summaries ("X — the Y that Z") · generic CTAs
("Learn more", "Get in touch", "Click here").

**Hard limits:** max one em dash per paragraph. Max one CTA label per intent across the whole
site. No section over three sentences.

**Exception:** timeline bullets keep a resume register on purpose. The banned list still applies.

## 5. Constraints

- Content and URLs are preserved from v1; everything else was replaceable.
- No font CDN — all three families self-hosted as woff2.
- GoatCounter is the only external request the site is allowed to make.
- Email must not appear in the served HTML or in the DOM before a user click.
- `public/CNAME` must reach `dist/` or the custom domain breaks.

## 6. Learned constraints

Corrections from Arsenio, binding on all future work:

- **Games are past tense.** He built them 2016–2023 and still pokes at Unity occasionally, but
  it's not a current hobby. Never write "outside of work I make games" or any present-tense
  framing. *Why:* the v1 site said this and it stopped being true.
- **AI use gets stated, not sold.** He wants it known that Claude Code is part of his daily
  workflow, phrased as a fact about the toolchain rather than a pitch. *Why:* he asked for it
  explicitly but flagged he wasn't sure how to phrase it without it sounding bad.
- **Seneca is named in full in the bio too.** *Reversed 2026-08-06.* The bio used to stay
  high-altitude while the timeline carried the system names; he rewrote it to name the SharePoint
  IAM platform, the IT Reporting and Incident Dashboard, and Nintex/WEBCON directly, and chose to
  keep the overlap with the timeline. Don't re-generalize it.
- **The bio and How I work are his own words.** Both were supplied verbatim and go in unedited
  apart from proper-noun casing. *Why:* he wrote them himself; a rewrite pass would sand off the
  voice this brief exists to protect.
- **New bio copy gets chosen, not written for him.** *Added 2026-08-08.* When he asks to extend
  the prose, ask first — what the line has to mean, who it is aimed at, how long it runs — then
  put full rendered drafts in front of him and let him pick. *Why:* it keeps the verbatim rule
  intact while still letting the copy move; handing him a finished rewrite does not.
- **The bio never says what kind of engineer he is.** *Added 2026-08-08.* It names systems and
  lets those carry it. A drafted addition — "I'd rather find the problem before it gets reported
  … than close the same ticket again next month. Some of that is already how I work" — was built
  and then cut as cheesy. He named the three tells: the `I'd rather X than Y` contrast that costs
  nothing to claim, the `already how I work` self-assessment, and the ticket set-piece that reads
  like a LinkedIn post. Character claims, preferences and standards are the wrong shape for this
  paragraph however they're worded. See `decisions.md`.
- **No "open to work" banner and no resume PDF.** Contact links do that work, and `@media print`
  in `tokens.css` covers anyone who wants a paper copy. *Why:* a status line goes stale and a PDF
  drifts out of sync with the site — a print stylesheet can't.
