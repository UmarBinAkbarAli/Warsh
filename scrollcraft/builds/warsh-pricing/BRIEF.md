# BRIEF — warsh-pricing

Interviewed 2026-08-25. Not self-authored. Third page of the warsh.app site.
Vibe, palette, type and design floor inherited from `../warsh-home` and not
re-asked. What was asked: the page shape, and the one moment to remember.

## The three answers

**1. Shape.** Split stage (uniqueness.md §2.7). The user picked it over rhythmic
cutlist and typographic poster.

**2. The peak.** "The free side never leaves." The divider tips toward the paid
side and the free column does not disappear.

**3. Facts.** All drawn from `Docs/warsh-product-spec.md` §12 and §11. Nothing
invented.

## Why the other seven grammars lost

- **Chaptered editorial** — warsh-home's. Reusing it is the re-skin the gate exists to stop.
- **Gallery / catalog** — warsh-features'. Same objection.
- **Filmic one-shot** — burden of proof, and needs video assets that do not exist.
- **Continuous world** — needs worldflight and real geography. Neither applies.
- **Typographic poster** — spent on `../warsh-about`, where there is genuinely nothing to show.
- **Live surface** — the honest demo is a mobile app; a div-built fake is banned.
- **Rhythmic cutlist** — bans `pin`, and a pulse is the wrong register here.

**Fits because** the page carries a genuine two-sided fact: the Vocabulary Bank
is free forever, everything else is one subscription. The comparison IS the
honesty pitch, and that is this grammar's exact brief.

## Signature move: type that rotates to survive the squeeze

`--wp-split` is a single page-level ratio driven from the peak act's published
`--sc-p`. Every act's stage and the fixed divider read the same value, so the
rule reads as one continuous divider running the whole page.

Through the peak it travels 50% > 14%. The free column does not zero out: at the
stop, its content **re-typesets into a vertical stamp** (`writing-mode:
vertical-rl`), still real selectable text, and holds there through the close.
The words physically turn on their side rather than disappear.

Tell-someone: *it's the site where they squeeze the free half down as they ask
you for money, and the words turn sideways rather than vanish.*

**One deliberate deviation.** The grammar's close is a full collapse to one edge.
Here the collapse happens (50% > 14%, the paid column takes the dominant width,
the CTA lives in it) but stops short of zero. The refusal is the argument.

## The feeling curve

| Act | Feeling | Caused by |
|---|---|---|
| 1 | Clarity | Both headlines readable at once at exactly 50/50. Nothing moves yet. |
| 2 | Confidence | The real figures wipe in per side, one wipe each way. |
| 3 | Curiosity | What each side actually holds, hairline rows, no cards. Deliberately the quietest act on the page. |
| 4 | **PEAK** tension then relief | The divider tips, the free column narrows, the words turn sideways and hold. |
| 5 | Reassurance | The questions, compressed. Administrative, so it is cheap scroll. |
| 6 | Resolve | Divider held at 14%. The ask in the paid column, the stamp beside it. |

## The score, as built

| # | Beat | Device | Span | Why |
|---|---|---|---|---|
| 1 | The two sides | `pin` + converge from both edges | 1.6 | The split must be understood before it can tip |
| 2 | The figures | `reveal` per side + `count` | flow | A wipe per side keeps the columns arguing separately; the numbers are real |
| 3 | What each holds | `flow` + `in` | flow | Deliberately the quietest act: the peak needs something to arrive from |
| 4 | **PEAK** | `pin` + bespoke split drive | 3.4 | The frame must hold while the ratio travels |
| 5 | Questions | `flow` + `in`, short stagger | flow | feel.md 5: compress the administrative parts |
| 6 | The ask | `pin` close, held at 14% | 1.2 | Resolves and holds; last element on the page |

The figures act and the inventory act swapped places against the plan, so the
quiet document-shaped act sits immediately before the peak rather than two acts
away from it. That is the silence the peak arrives from.

Four device families (pin, reveal, count, flow). No family twice in a row. Zero
`scrub`. Peak larger than the runner-up by 1.8vh. **Measured total 8.15
viewport-heights**, inside the 8 to 14 budget and outside the flagged 13.6-13.8
band. Under reduced motion the page relays to 3.47vh.

**Authored silence:** peak act, p 0 to 0.18. Only the divider moves, and
`PricingMotion` holds the tip at zero across it. Do not log as dead scroll.

## Honoured forbids

No fixed bar (the divider is the chrome; the site bar scrolls away). No
full-bleed anything before the resolve. No centred copy. No corner-anchored
hero. No symmetric close. Neither column decorative. Bans held: no `pan`, no
`spotlight`, no `magnet`, no second `scrub`, no `drift` (two grounds, one per
side, and they hold).

## Fingerprint gate

- vs **warsh-home**: 6/6 — grammar, nav (folio rail > divider chrome), hero
  (title page > 50/50 split), act sequence, close (colophon > refused collapse),
  signature move.
- vs **warsh-features**: 6/6 — grammar, nav (jumping object index > divider
  chrome), hero (object one in view > 50/50 split), act sequence (one pan spine
  > six acts with a pinned peak), close (inquiry label > refused collapse),
  signature move.

Requirement is 4 of 6 against each row individually. Passes.

## Facts used, and their source

`Docs/warsh-product-spec.md`: seven full days of trial from account creation;
complete access during it; one subscription tier at approximately $1/month or
$10/year, localized by Google Play; Vocabulary Bank free forever (browse,
search, Word of the Day, audio, saved state, SM-2 review); Ustaad Noor 5
messages a day with a 20-message overage pack; 72 chapters. One label per
intent: the CTA reads **Download on Google Play**, matching the nav, with the
trial stated as running text beside it.

---

# Verification log

Six passes with `shoot.mjs` against `next start`: desktop 1440x900, phone
390x844, and reduced-motion, on both this page and `../warsh-about`. **No dead
scroll, no contrast failures, no console errors on any pass.** One `h1`,
headings in order, 18 focus stops, every image carries alt.

## What verification caught

**1. The peak's copy was laid out as a row of fragments.** `.wp-turn > p` was
`position: absolute; display: flex` so the four states could stack. A flex
container promotes every text run and every `<em>` to a separate flex item, so
"One subscription. About $1 a month..." rendered as six shrinking columns of
stacked words. Fixed by stacking the four states in ONE grid cell
(`grid-area: 1 / 1`) and leaving each `<p>` a normal block.

**2. The page had no reachable ending.** The close act was never sampled by the
harness and never reached by scrolling, and the harness reported no dead scroll
throughout, because nothing was dead: the document was *growing*. `--wp-tip`
was applied page-wide, so tipping the divider narrowed the free column of every
act, including the two whose free columns hold real prose. They re-wrapped into
tall strips and the document went from 7336px to 8619px while the reader
scrolled, pushing the close down faster than they could reach it. Fixed by
scoping the tip: the three acts that argue at 50/50 pin it locally, so only the
peak and the two acts after it resolve. Measured constant at 7336px at top, mid
peak and bottom.

**3. Scoping it needed the split redeclared, not just the tip.** The first fix
set `--wp-tip: 0` on those acts and changed nothing at all. A custom property's
`var()` references are substituted at the element that DECLARES it, so
`--wp-split` arrives from the root already carrying the root's tip, and
re-pointing the tip further down the tree cannot reach it. Both properties are
now restated together, here and in the reduced-motion block.

**4. Counters told the truth only once JavaScript ran.** The three `data-sc-count`
spans were authored with `0` as their text, so a reader with the engine not yet
live saw "0 chapters, in order" and "0 full days of complete access". The engine
does not write on init, only on tick, so the real value is now the authored
fallback and the count still animates over it.

## Feel check, intended against felt

Scrolled cold, one word per act, before re-reading the curve above.

| # | Intended | Felt | Verdict |
|---|----------|------|---------|
| 1 | Clarity | Clear, formal | Matches |
| 2 | Confidence | Confident, and the 0 lands | Matches |
| 3 | Curiosity | Plain, document-like | Matches, and quieter than planned, which the peak wants |
| 4 | Tension then relief | Tension, then the rotation, then relief | Matches |
| 5 | Reassurance | Reassured | Matches |
| 6 | Resolve | Resolves and holds | Matches |

The peak is the largest visual change on the sheet and holds the most scroll
room by 1.8vh. The act before it is the quietest on the page. The last screen
stands still with the CTA, the colophon and the standing free column on it, so
the page finishes rather than ends.

## What was NOT verified

- **A real phone.** Headless Chrome at 390x844 is not an iPhone. There is no
  video on this page, so the usual iOS clip-lifecycle failures do not apply,
  but touch scrolling and Low Power Mode were not exercised on hardware.
- **A hand-driven screen reader pass.** Heading order, `h1` count, focus-stop
  count and alt text were checked programmatically.
- **The engine still has no teardown API**, so its rAF loop survives a
  client-side navigation away. `useScrollCraft` removes the stylesheet and the
  token class, which is the part that rendered wrong; editing the engine is
  forbidden, so this stays recorded rather than fixed.
