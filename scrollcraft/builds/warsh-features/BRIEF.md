# BRIEF — warsh-features

Interviewed 2026-08-25. Not self-authored. Second page of the warsh.app site;
the homepage build is `../warsh-home`.

Vibe, palette, type and design floor are inherited from warsh-home and were not
re-asked. What was asked was the structure, the overlap, and the feature set.

## The three answers

**1. Grammar.** Gallery / catalog. Chosen over reusing the homepage's chaptered
editorial, which the skill flags as a re-skin: two pages in one grammar feel
related no matter how far apart their palettes are.

**2. Overlap with the homepage.** Go wide on what home does not cover. The four
skills and the five-step lesson shape stay on the homepage and are referenced
here with a single link, so no page repeats another.

**3. Feature set.** All four missing features added: speaking practice with
on-device recordings, Urdu interface, spaced review, and streaks/achievements.

## Why the other seven grammars lost

- **Chaptered editorial** — the homepage's. Reusing it is the re-skin this file
  exists to prevent.
- **Filmic one-shot** — carries a burden of proof, and a features page is not a
  single emotional arc.
- **Continuous world** — needs real geography and worldflight. Neither applies.
- **Typographic poster** — a features page has to convey detail, and this
  grammar fights detail.
- **Live surface** — the honest demo is a mobile app, not a web surface, and a
  div-built fake of one is banned outright.
- **Split stage** — no genuine two-sided comparison, and the homepage already
  makes the argument.
- **Rhythmic cutlist** — a pulse is the wrong register, and it bans `pin`.

**Fits because** the visitor's real question here is "what do I actually get",
not "should I believe you". That is the gallery grammar's exact brief.

## The label schema

Identical for every object, no exceptions, because the schema is what makes this
a collection rather than a grid:

    NN · Name (+ Arabic term)
    One factual sentence about what it is.
    ACCESS · WHERE · DETAIL · NOT

The `NOT` row is as load-bearing as the rest. It states what each object does
not do, which is the product's own honesty principle and what keeps the labels
from drifting into a feature pitch. Every value is drawn from
`Docs/warsh-product-spec.md`; nothing is invented.

Catalog numbers are kept because sequence IS information in a catalog: the index
addresses objects by number. taste.md's ban on `01 / 06` counters is on
decorative section numbering, which this is not.

## Signature move: an index that jumps into lateral space

The grammar requires the nav to be an index of objects that jumps, "because a
collection you cannot skip around in is a video". The catch is that the objects
live in LATERAL space: their horizontal position is a function of vertical
scroll, so an anchor link cannot reach them.

The jump therefore resolves backwards. Given an object, compute the pan progress
at which it sits centred in the viewport, convert that progress into the
document scroll position which produces it, and go there. Verified: jumps to
objects 3, 7 and 8 all land at a centre offset of **0px**, with the index
highlight following.

## The score

One act. `pan` is the spine of this grammar rather than one act among many.

| Item | Role |
|---|---|
| 00 | Opening plate. Carries the h1 INSIDE the rail, because this grammar starts the collection at the top of the page rather than under a title stage. Also supplies the width the travel needs. |
| 01-08 | The objects, one label schema each |
| 09 | Inquiry plate, typeset exactly like a label so the ask reads as part of the collection |

Span 10. Page 10.5vh desktop, 11.1vh mobile: inside the 8-14 budget, and
distinct from warsh-home's 8.3vh across six acts.

## Fingerprint gate against warsh-home

Differs on **6 of 6**: grammar (chaptered editorial > gallery), nav (folio rail >
jumping object index), hero (title page > object one already in view), act
sequence (six acts with a pinned peak > one pan spine), close (colophon plate >
inquiry label), signature move (RTL axis > index jumping into lateral space).
Requirement is 4 of 6. Passes.

---

# Verification log

Three passes, desktop 1440, mobile 390x844, reduced-motion. **No dead scroll on
any pass.** No console errors, no contrast failures. One h1, headings in order.

## What verification caught

**1. The rail never panned.** The whole page was one still frame held for 10.5
viewport-heights. Cause: the rail was missing `data-sc-pan`. The engine does
`el.querySelector('[data-sc-pan]')` inside the act, and without that attribute
`act.rail` is null, so there is nothing to translate. Set to `0` rather than
omitted, so the closing plate lands flush instead of overshooting.

**2. Rail overflow measured, not assumed.** devices.md warns this is
width-dependent and the harness does NOT catch it. Measured at three widths:
2.1, 1.4 and 6.62 viewports of overflow, all well above the half-viewport floor.
A dev-only console warning now reports it if it ever regresses.

**3. The fixed index collided with the object labels.** Cards slid underneath it
and their text ghosted through the index entries, exactly when the reader is
using them. Fixed with a gutter plus a mask on the STAGE. The mask cannot go on
the rail: the rail is the element the engine transforms, so the fade would
travel with it instead of holding at the viewport edge. Objects now dissolve as
they leave the room.

**4. Labels bunched into a thin strip.** A dead band above and below read as
content failing to load. Given a min-height and the specs pushed to the foot, so
each label occupies its wall the way a real one does.

**5. Reduced motion was worse than the motion.** The engine converts the pan
stage to a native horizontal scroll region but keeps the act's height, so a
reduced-motion reader got ten viewport-heights of vertical scroll past a stage
that no longer moved. Two obstacles, neither beaten by a plain class rule:
`scrollcraft.css` is injected at runtime so it is LAST in the cascade and wins
every equal-specificity tie, and the act height is an inline `height: 1000vh`
that only an !important author rule can override. Fixed with
`html.warsh-sc-active` prefixes and targeted !important. The page now relays to
a readable grid and drops from 10.5vh to **1.9vh**.

## Refactor carried out alongside

Engine loading, the Warsh token override and teardown were extracted from
`HomeMotion` into `useScrollCraft` + `scrollcraft-theme.css`, shared by both
pages. The homepage's behaviour is unchanged; it was rebuilt and re-verified
after the move.

## What was NOT verified

- A real phone. Headless Chrome at 390x844 is not an iPhone.
- A hand-driven screen reader pass. Heading order, h1 count and the jump's
  aria-current were checked programmatically.
- The engine still has no teardown API, so its rAF loop survives a client-side
  navigation away. Its writes target a detached tree, and the CSS leak that did
  render wrong is fixed. Recorded rather than fixed, since editing the engine is
  forbidden.
