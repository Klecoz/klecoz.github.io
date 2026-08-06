# Token spine — "Steel"

Three layers: primitive → semantic → component. Implemented in `src/styles/tokens.css`.
Light is the default; dark is a designed peer, not an inversion.

## Layer 1 — primitives

**Steel neutrals** (cool, blue-biased grey — picked to sit under the amber, not inherited)

| Token | Value |
|---|---|
| `--steel-50` | `#F7F9F9` |
| `--steel-100` | `#F1F3F4` |
| `--steel-200` | `#E4E9EB` |
| `--steel-300` | `#D2D8DB` |
| `--steel-500` | `#8B98A1` |
| `--steel-600` | `#58656E` |
| `--steel-800` | `#1E262B` |
| `--steel-900` | `#141A1E` |
| `--steel-950` | `#0D1215` |
| `--ink` | `#121A1E` |
| `--chalk` | `#E2E8EB` |

**Amber** (machinery / safety signal — the single accent)

| Token | Value | Note |
|---|---|---|
| `--amber-600` | `#8A5E00` | hover on light |
| `--amber-500` | `#A97400` | accent on light, 4.6:1 on `--steel-100` |
| `--amber-400` | `#FFC53D` | accent on dark, 10.2:1 on `--steel-950` |
| `--amber-300` | `#FFD470` | hover on dark |

## Layer 2 — semantic

| Token | Light | Dark |
|---|---|---|
| `--bg` | `--steel-100` | `--steel-950` |
| `--surface` | `#FFFFFF` | `--steel-900` |
| `--surface-sunk` | `--steel-200` | `--steel-800` |
| `--fg` | `--ink` | `--chalk` |
| `--muted` | `--steel-600` | `--steel-500` |
| `--rule` | `--steel-300` | `--steel-800` |
| `--rule-heavy` | `--ink` | `--chalk` |
| `--accent` | `--amber-500` | `--amber-400` |
| `--accent-hover` | `--amber-600` | `--amber-300` |
| `--focus` | `--amber-500` | `--amber-400` |

**Accent budget: 3–5 placements per viewport.** Spent on: the current-role block on the date rail,
link underlines, the primary CTA, and focus rings. Nothing decorative.

## Layer 3 — type, space, motion

**Families** — three, each with one named role. This is a designed hierarchy, which is the
documented exception to "never mix three."

| Role | Family | Weights |
|---|---|---|
| Display | Barlow Condensed | 600, 700 |
| Body | Barlow | 400, 500, 600 |
| Data | IBM Plex Mono | 400, 500 |

Mono carries dates, eyebrows and tags, always with `font-variant-numeric: tabular-nums`.

**Scale** — 1.25 minor third, fluid via `clamp()`.

| Token | Size |
|---|---|
| `--t-xs` | 11px (tracked labels) |
| `--t-sm` | 13px |
| `--t-base` | 16.5px |
| `--t-lg` | 19px |
| `--t-xl` | `clamp(22px, 2.2vw, 26px)` |
| `--t-2xl` | `clamp(28px, 3.4vw, 38px)` |
| `--t-display` | `clamp(52px, 11vw, 104px)` |

**Space** — 4px base: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128.

**Radius** — `0` everywhere. Deliberate.

**Rules** — hairline `1px solid var(--rule)`; heavy `3px solid var(--rule-heavy)` under section
headings only.

**Motion** — `--dur-fast: 120ms`, `--dur: 200ms`, `--dur-slow: 280ms`;
`--ease: cubic-bezier(0.2, 0, 0, 1)`. Exits run at ~75% of entrance. All suppressed under
`prefers-reduced-motion: reduce`.

## Casing rule

Caps at exactly two levels, both defensible:

- **Name / wordmark** — a display lockup, not a heading.
- **Eyebrows, dates, tags** — 11–13px with positive tracking, the documented exception.

Section headings and job titles are **sentence case** in Barlow Condensed. Six caps job titles in
a row reads as a repeated template block, which is the thing this direction has to avoid.
