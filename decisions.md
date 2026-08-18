# Decisions

Choices made, and the alternatives rejected. The rejected column is the point of this file —
anything here that looks arbitrary was probably argued about.

Decisions Arsenio made himself are marked **[AC]**. Those don't get revisited without asking.

---

## 2026-08-18 — two-stop theme, and the 2026 resume

### The toggle is Dark/Light, with Dark as the default — **[AC]**

Arsenio asked for the `system` stop to go and for dark to be what a cold visitor sees.

**This supersedes two earlier [AC] decisions**, both from the rebuild, and they are recorded as
superseded rather than deleted:

- *"Light and dark are equally canonical"* — asked which theme a cold visitor saw, he had said
  genuinely both. He has now picked one. What survives is the working rule underneath it: dark is
  a designed palette, not an inversion, and light is still reviewed and contrast-checked at the
  same standard. `npm run axe` still scans both.
- *"Theme toggle: cycling, with the stop named"* — the cycle is now a two-way switch.

What that meant in the CSS: `prefers-color-scheme` is gone from `tokens.css` entirely and the
dark palette sits on bare `:root`. The OS is not consulted at all.

**Rejected:** keeping the media query so a light-OS visitor lands on light and only the toggle's
*stops* change. It is the smaller diff and it is not what "dark is the default" means — it would
leave the default depending on the visitor's machine, which is the thing being removed.

`data-theme` is now written for both stops, and `localStorage` stores `dark` as well as `light`.
**Rejected:** treating dark as the absence of the attribute, which would have been a two-line
change and is exactly the trap the old `system` stop set — a stored `dark` would silently follow
any future change of default.

The icon still names the stop you are **on**. Under three stops that was forced; under two it is
a genuine choice, and it stays because the visible word says the same thing and because inverting
a learned icon to save nothing is not an improvement. `aria-pressed` stays off for the same
reason: this control reports a state, it does not offer an action.

### The print block now outranks the theme blocks

Not a design call — a defect, measured and written up in `findings.md`. `@media print` set its
tokens on a bare `:root`, which loses to `:root[data-theme='…']` on specificity, so anyone with a
stored theme printed their screen palette. Now `:root, :root[data-theme]`.

**Rejected:** `!important` on the print tokens (works, and buries the reason); and moving the
print block below the theme blocks (it already is — source order does not beat specificity, which
is the whole point of the bug).

### 2D/3D badges, filled, amber for VR only — **[AC]**

Arsenio asked for 2D/3D tags alongside the existing VR one. Five schemes were built and rendered
in both themes on a throwaway `/compare` route — never described — and he chose in two passes:
first the filled treatment over the outlined one, then **C1** for colour.

| | VR | 3D | 2D |
|---|---|---|---|
| **C1 (shipped)** | `--accent-solid` | `--fg` | `--muted` |
| C2 | `--accent-solid` | teal `#0F5560` / `#7CD6E3` | `--fg` |
| C3 | `--accent-solid` | teal | violet `#4A3F7D` / `#BCB0F2` |

**Rejected:** the outlined 2D/3D chip, which kept solid exclusive to VR and read as a weaker
class of information rather than a different one. And C2/C3 — both cleared AA (ratios in
`findings.md`), and both introduce a hue the brief does not have. The brief's line is "machinery
amber as the single accent"; C3 would have put three hues on one grid and read as generic tag
colour rather than Steel. C1 needs **no new primitive at all** — amber, ink and steel were
already in the palette, so the scheme inverts with the theme for free.

**One badge per card, and VR carries no `dimension`.** The three VR entries are 3D by definition;
tagging them would double the chip on three cards and nowhere else. Recorded because the
frontmatter now *looks* incomplete on those three, and it is not.

`.ui-craft/tokens.md` gained the VR badge in its accent-placement list, with the note that it is
the one placement that can blow the 3–5 budget on its own.

### The hero subtitle is the resume headline — **[AC]**

`.NET Engineer · Full Stack` → `Software Engineer - Backend & .NET Systems`, Arsenio's own string
from the 2026 resume, hyphen and all. It is copy, so it went in as written; the only thing added
is `&nbsp;` binding, which changes where it breaks and not what it says.

He also chose to carry it into the three places that repeated the old line: the `<title>`, the
meta description, the card alt text, and the generated `og.png` (regenerated through the
documented `npm install --no-save satori` flow — `package.json` and the lockfile verified
byte-identical afterwards).

**The cost, named:** the `<title>` no longer contains "Buffalo, NY". It read
`Arsenio Colón — .NET Engineer in Buffalo, NY` and now reads
`Arsenio Colón — Software Engineer, Backend & .NET Systems`, because the location on the end of
the resume headline pushed it past any useful length. Buffalo is still in the meta description,
the hero eyebrow, the JSON-LD `address` and the card itself. If local search ever matters more
than the headline, that is the trade to reverse.

**Rejected:** changing only the visible subtitle and leaving the title, description and card
saying `.NET Engineer · Full Stack`. Offered explicitly; he took all of them.

### The side-projects teaser: heading, and `See all` — **[AC]**

`Eight games and a couple of client sites` → `Side Projects`. He said the old heading "seems like
a lot of explaining". The eyebrow label above it was deleted in the same move — it already said
`Side projects`, and keeping both would have put the same two words on consecutive lines.

The button under it became `See all`, which **supersedes the [AC] decision "CTA labels are the
destination's name"** for this one button. That decision recorded the teaser stutter as raised
and overruled, with the note *"if the teaser ever reads as stuttering, that's why"*. With the
heading now carrying the section name, it stuttered, and he changed it. The 404's CTAs are
untouched and still name their destinations.

**Rejected:** `All projects`, and leaving it as `Side projects`.

### The rail's end cap stays, now that it lands on the rail — **[AC]**

Arsenio called it "this random dash". It was random: 40px off, for the reason in `findings.md`.
Shown aligned, he kept it. **Rejected:** deleting `.rail::after`, which was the other option put
to him.

### `ol` joined the reset

Not a design call. `ul` was reset and `ol` was not, so the timeline — the only `<ol>` on the
site — carried the UA's 40px `padding-inline-start` and sat 40px right of every heading above it.
Measured both ways in `findings.md`.

**Rejected:** zeroing the padding on `.rail` alone. It would have fixed the visible symptom and
left the next `<ol>` anyone adds with the same 40px, in a file whose whole job is to make the
defaults predictable.

### The 2024 contract row is M&T Bank, not Acara — **[AC]**

The 2026 resume frames it as "M&T Bank — Contract through Acara Solutions", so the timeline does
too: `org: M&T Bank`, with `Contract through Acara Solutions · Hybrid` in the meta line. The
client is the recognisable name and it makes the two M&T stints read as related.

`orgFull` was dropped from that entry — it held "Acara Solutions, An Aleron Company", and the
holding company is noise once the agency is a contracting detail rather than the employer.

**Rejected:** adding a `via:` field to the collection schema. `employment` is already the
engagement line; a second field for the same sentence is a schema change earning nothing.

### `Assistant Vice President` stays off the M&T title — **[AC]**

Offered with the resume in hand. He declined: it is a bank-internal grade that reads oddly beside
`Software Developer II`. **Rejected alternatives, both offered:** the full
`Software Engineer I · Assistant Vice President` role line, and demoting it to a bullet.

### Community gains the Code.org teaching and the Buffalo Game Space detail — **[AC]**

Both come from the resume's Leadership & Community block. The teaching entry has no `href` — the
resume names no venue, and a link to code.org would assert an affiliation with the curriculum's
publisher rather than a place he taught.

`Ran workshops` was reworded to `Organized workshops` after rendering it: the M&T entry directly
below already opens "Ran internal workshops and mentored…", and the two read as a copy-paste.

**Not added, and still not to be added:** `Cybersecurity Champions`, which the resume lists. That
remains the **[AC]** cut from 2026-08-07.

### Education reads SUNY Buffalo State University — **[AC]**

The visible line and the `alumniOf` in the JSON-LD both move to the current name, matching the
resume. **Rejected:** keeping "State University of New York College at Buffalo", the name it
carried when he graduated in 2017 — accurate to the era, but it makes the site and the resume
disagree on the school, and the JSON-LD claim is about the institution, not about 2017.

### Hero stack chips: `C` out, `EF Core` and `SQLite` in — **[AC]**

The resume dropped C and added Entity Framework Core and SQLite. Rendered at 1280 and 390 in both
themes before shipping, per the standing rule: Platforms is a seven-item column that wraps to two
lines against Languages' one, which the strip already did for Tools.

**Rejected:** spelling it `Entity Framework Core` in the chip. Every other chip is at most two
short words; the full name would be the longest item in the strip by half again.

**Rejected:** rebalancing the three columns by moving Azure/Kubernetes/IIS into Tools to even out
the wrap. It would put a cloud platform under a heading that otherwise means "things he opens",
for a visual gain the render did not show.

---

## 2026-08-08 — the Work heading's role count

### `Six roles` was removed; `2018 to now` stands alone — **[AC]**

Arsenio asked for the count to go. It was a hardcoded literal that duplicated a number the
content collection already knows, so removing it also removed a drift risk (see `findings.md`,
sixth session).

Rejected:

- **Deriving the count from the collection** (`{roles.length} roles · 2018 to now`) — would have
  fixed the drift while keeping the number. Not what was asked for; the ask was for the span to
  stand on its own, not for a more correct count.
- **Keeping the middot as a leading mark** (`· 2018 to now`) — a separator with nothing on its
  left is decoration. Cut.

---

## 2026-08-08 — the bio's last sentence

### The line was reworded, and nothing was added to it — **[AC]**

The bio used to end "My vision is to be more proactive and less reactive." Arsenio asked to
extend it and to be walked through the copy by question rather than handed a rewrite. Two
sentences were drafted, chosen, built, screenshotted — and then cut. What shipped is his own
sentence with two changes he picked:

> …and help out with Nintex/WEBCON workflows. **I want to be more proactive and less reactive
> with day-to-day engineering.**

`day to day` → `day-to-day` (standard as a compound adjective) and `My vision is` → `I want`
("vision" was the one corporate word in a paragraph that otherwise has none). Both were offered
against an explicit "keep everything as written" option. He took them; they are not edits made
on his behalf.

### The addition was cut for sounding cheesy — **[AC]**

The drafted pair was: *"I'd rather find the problem before it gets reported and fix what's
underneath it than close the same ticket again next month. Some of that is already how I work,
and I want to be more proactive and less reactive with day-to-day engineering."* He rendered it
and called it cheesy. Asked which part, he named three:

| Named as cheesy | Why it reads that way |
|---|---|
| `I'd rather X than Y` | Announces a virtue at no cost. Nobody claims the opposite, so the contrast is free. |
| `already how I work` | Self-assessment. Tells the reader he's good at it instead of letting the named systems show it. |
| `close the same ticket again next month` | A set-piece. Reads like a LinkedIn post, not like him. |

**The binding rule:** the bio does not make claims about what kind of engineer he is. It names
systems and lets those carry it. Any future addition that describes his character, his
preferences, or his standards is the wrong shape for this paragraph no matter how it's worded.

Three alternative rewrites were on the table and all were declined in favour of cutting: pointing
back at the IAM platform and dashboard as the proof, defining "proactive" in a subordinate clause,
and reverting outright so he could write the rest himself.

### The seven questions, recorded so the ground isn't re-covered

He asked to be guided by Q&A. His answers still stand even though the copy they produced was cut,
and they constrain whatever gets written next:

| Question | His answer |
|---|---|
| What does *proactive* mean concretely? | Catching it before it's reported · building so it doesn't come back · lowering the interrupt load. Not "getting into decisions earlier". |
| Already true, or a direction? | Both. |
| What should a hiring manager take away? | "He thinks in systems, not tickets" — over "cuts our firefighting", "brings things unasked", "owns it end to end". |
| How long? | Two sentences — *later reversed to none.* |
| Which draft? | A, the root-cause contrast — *later cut.* |
| Keep the "already doing it" half? | Keep but flip — *later cut.* |
| Mechanical calls | Hyphenate; drop "My vision is". **Both shipped.** |

Consequence worth knowing: the page now reads `day-to-day engineering` in paragraph one and `in
my day to day` in paragraph two. Both are standard (hyphenated as an adjective, open as a noun)
and the second is his original v1 wording, so it was left alone rather than harmonised. Flagged
to him; no instruction to change it.

---

## 2026-08-07 — the EquityOne line

### It stays in the M&T timeline entry; it does not move to Community — **[AC]**

Arsenio supplied fuller wording for the EquityOne bullet and asked whether it belonged under
Community. It does not, and the reason is what Community is *for*.

| Option | Verdict |
|---|---|
| Expand the existing M&T timeline bullet | **chosen** |
| Move it to Community as a fourth entry | rejected — Community is service *to others*: the Buffalo Game Space board seat, mentoring engineers, getting supplies into classrooms. EquityOne is something he was selected *for*. Mixing recognition into that list makes the section stop meaning one thing. |
| Both places | rejected — reads as double-counting, and the two "mentoring"s are opposites: in EquityOne he was mentored; in Tech Academy he mentored. |

### The racial-equity framing stays off the site — **[AC]**

Arsenio also supplied context that EquityOne is a two-year, enterprise-wide initiative launched
in fall 2020 to raise representation of Black, Brown and Latinx employees in senior leadership.
Offered as an explicit framing option and declined; the bullet keeps "high-potential internal
leaders".

Worth asking rather than assuming, for two reasons: it discloses something about him the site
says nowhere else, and it is the kind of claim that would need a public source — every other
substantiated line on that page has one.

A middle option (programme scale — two-year, enterprise-wide — without the demographics) was
offered and also rejected: it adds facts without adding meaning.

### The wording is his, restored verbatim

The 2026 rebuild had paraphrased his v1 sentence into "Picked for EquityOne, M&T's sponsorship
program for high-potential internal leaders." His supplied sentence now stands unedited, in
straight quotes so SmartyPants curls them at build. This is the standing copy rule applied to a
timeline bullet rather than to the bio — the rule is not scoped to the two prose blocks.

---

## 2026-08-07 — visual polish pass

### Hero accent: the rule under the role line leads in amber — **[AC]**

The hero had zero amber in it (measured; see `findings.md`). Four options were built on a
throwaway `/compare` route and screenshotted in both themes at 1280px.

| | Option | Placements | Verdict |
|---|---|---|---|
| A | Baseline, no amber | 0 | rejected |
| B | Amber tick before the `Buffalo, NY` eyebrow | 1 | rejected |
| **C** | **3px rule leads with a 4rem amber segment, then ink** | **1** | **chosen** |
| D | Primary CTA fills amber at rest, hover inverts to ink | 1 | rejected |

C wins because it is the rail's own grammar — a hairline that thickens into amber to mark the
one you're in now — rather than a new gesture. That makes it structure, which is the test the
accent budget sets ("nothing decorative").

**Rejected:** B reads as the same idea but quieter, and at 20px it is easy to miss entirely.
D is the one worth recording, because it looks like the obvious answer and renders badly: amber
is deliberately two different colours across the themes, so a filled 44px button is dark mustard
on light and takes over the screen on dark. Fine as a 10px chip, not as the largest solid on the
page. Its contrast was never the problem — 5.12:1 and 11.94:1, the same as the `Current` chip.

**Implementation note.** Drawn as a `linear-gradient` background with hard stops, not a border,
because a border takes one colour. The consequence is that it does not print — browsers drop
backgrounds — so the `@media print` block in `index.astro` restates it as the border it used to
be. `npm run snap` does not check this; the print render was looked at.

### Stack separators: no character — **[AC]**

The `·` between stack items rode the preceding item, which stopped a wrapped line *opening*
with an orphan dot and left one hanging off the end instead. Three options rendered:

| | Option | Verdict |
|---|---|---|
| S1 | Dot on the preceding item (shipped) | rejected — trailing orphan |
| **S2** | **No character, column gap 12px → 24px** | **chosen** |
| S3 | Dot on the following item | rejected — leading orphan |

S2 is the only one that cannot orphan at any width, because there is no dot to orphan. It also
reads more like a spec sheet, which is what the strip is meant to be.

**Rejected:** S3 is what the original comment was written to avoid, and confirms the instinct —
`· Kubernetes` opening line two is worse than `Azure ·` closing line one. S1 was kept in the
comparison rather than assumed wrong; seeing the three together is what settled it.

**The cost, named:** without a glyph, multi-word items lean entirely on 24px of gap to separate
—`Azure DevOps   Datadog` rather than `Azure DevOps · Datadog`. Judged on the render and
accepted. If it ever reads as ambiguous, S1 is the built alternative and the trailing dot is the
price.

### CTA labels are the destination's name — **[AC]** *(partly superseded 2026-08-18)*

**Superseded for the teaser button only:** it is now `See all`, because the teaser heading became
`Side Projects` and the stutter predicted below actually happened. The 404's CTAs still name
their destinations.

`See the work` → `Work`, and `Browse them` → `Side projects`. Arsenio's call, unprompted:
"See the work" sounds lame. All three CTAs across the site now name where they go, which
matches what the 404 already did (`Main page`, `Side projects`).

**Named because it was raised and overruled:** the teaser's eyebrow already reads
`Side projects` three lines above the button, so the words now appear twice in one block. The
alternative offered was keeping `Browse them` as the one CTA with any warmth in it. He chose
consistency. Not to be relitigated — but if the teaser ever reads as stuttering, that's why.

### Card link rows are bottom-anchored, not top-packed

`.card-body` became a flex column with `margin-top: auto` on `.card-links`. The grid already
stretched cards in a row to equal height; only the content placement was uneven.

**Rejected:** setting a `min-height` on `.card-desc` to even the descriptions out — it would
fix the symptom at one viewport and reintroduce it at every other, and it puts a magic number
where a layout rule belongs.

### Project cards stagger on a cycle of three, not a running index

40ms per step, capped at 80ms, via `.card:nth-child(3n + 2)` / `:nth-child(3n)`.

**Rejected:** a running index (`--i` per card, delay = i × 40ms). It reads correctly at three
columns and badly everywhere else — at one column the eighth card would carry a 280ms delay
while entering the viewport alone, which is a visible stall, not a stagger. Cycling on three
sweeps left-to-right at the wide layout and is short enough to be invisible at the narrow ones.
The grid is `auto-fill`, so no CSS can know the real column count; a delay that is wrong at
some widths should at least be wrong by a small amount.

### Buttons live in `tokens.css`

`.btn-primary` / `.btn-ghost` were duplicated in `index.astro` and `404.astro`, and had already
drifted — the 404 copy lost `white-space: nowrap`. One definition now, in the shared primitives.
Page-scoped rules still own layout and the narrow-width overrides; Astro's scoping gives those
higher specificity, so they still win.

**Rejected:** leaving them duplicated and just syncing the missing property. The drift already
happened once with nobody noticing, which is the argument against doing it again.

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

### Light and dark are equally canonical — **[AC]** *(superseded 2026-08-18)*

**Superseded:** dark is now the default and `prefers-color-scheme` is gone from `tokens.css`. See
the 2026-08-18 entry. The half of this that still holds is the review standard: dark is designed,
not inverted, and light is checked just as hard.

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

### Theme toggle: cycling, with the stop named — **[AC]** *(superseded 2026-08-18)*

**Superseded:** the `system` stop is gone and the control is a two-way switch. See the
2026-08-18 entry. The icon-names-the-current-stop reading survives; so does the `aria-pressed`
ban, for a different reason.

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

### Centring the collapsed toggle with `justify-content`, not `place-items`

The 2rem square below 34rem centred its icon vertically and not horizontally, because the rule
used `place-items: center` on a flex container. Flexbox ignores the `justify-items` half of that
shorthand, so only `align-items` landed.

**Rejected:** switching `.toggle` to `display: grid` under the media query, which would have made
the original `place-items` line work as written. It changes the box model of the control at one
breakpoint only, for no gain — the desktop layout genuinely is a flex row of icon-then-label, and
having the same element be flex at one width and grid at another is a trap for the next person
editing it. `justify-content: center` is one property, works with the existing display mode, and
leaves the two widths structurally identical.

Also rejected: padding the square by hand. It would have centred the icon at exactly one border
width and gone wrong the moment `--rule-control` or the icon size changed.

The comment on the fix names the flexbox/`justify-items` interaction, because the broken version
looked correct and would be rewritten back to `place-items` by anyone who did not know that rule.

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
| Restoring `Cybersecurity Champions` to Community | **[AC]** Not an oversight of the rebuild — he cut it deliberately. Surfaced once on 2026-08-07 and declined. |
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
