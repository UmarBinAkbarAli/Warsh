# BRIEF — warsh-about

Interviewed 2026-08-25. Not self-authored. Fourth page of the warsh.app site.
Vibe, palette, type and design floor inherited from `../warsh-home`.

## The three answers

**1. Shape.** Typographic poster (uniqueness.md §2.5). Chosen over filmic
one-shot and split stage.

**2. Facts.** Keep the existing About copy's facts verbatim: the one gap, 72
chapters, four skills, Al-Fatiha first, the what-it-is-not boundaries, Made in
Pakistan, support@warsh.app. Nothing invented, no founder story.

**3. Assets.** None. That is why this grammar fits: the asset here is a
sentence, and generating eight plausible forgettable frames would weaken it.

## Why the other seven grammars lost

- **Chaptered editorial** — warsh-home's.
- **Gallery / catalog** — warsh-features'.
- **Split stage** — warsh-pricing's, and About has no genuine two-sided comparison.
- **Filmic one-shot** — burden of proof, and needs footage that does not exist.
- **Continuous world** — worldflight, real geography. Neither applies.
- **Live surface** — the demo is a mobile app; a div-built fake is banned.
- **Rhythmic cutlist** — a pulse is the wrong register for this subject.

## Signature move: the measure closes

The page's thesis sentence is present on screen the whole time. It is never
revealed and never hidden. Only its **setting** changes.

At p = 0 each word is a separately positioned span, scattered across the
viewport at poster scale, far apart, unreadable as a sentence: all the parts,
no meaning. Scroll interpolates every word from its scatter offset to its
natural inline position and from poster scale to reading scale, transform only,
until the words lock into one tight readable line. Comprehension arrives purely
from typographic compression.

Sentence: **"You know how the words sound. Warsh is about what they mean."**

Tell-someone: *it's the site where a page of scattered words pulls itself into
one sentence as you scroll, and you realise you were looking at the sentence the
whole time.*

Distinct from warsh-home's peak, which glosses Arabic words one at a time
right-to-left. Nothing here appears, resolves or translates; the same text is on
screen throughout.

## The feeling curve

| Act | Feeling | Caused by |
|---|---|---|
| 1 | Recognition | "One gap." at extreme scale, and a 16px paragraph under it naming the gap plainly. |
| 2 | Doubt | The two options that already exist, wiped away across their own letterforms. |
| 3 | **PEAK** clarity | The scattered words gather into one line. The page's one near-white ground. |
| 4 | Trust | The boundaries. What Warsh is not, set large, each wiped out, the affirmative left standing. |
| 5 | Quiet resolve | The page inverts to its smallest type. One line of running text carries everything. |

## The score, as built

| # | Beat | Device | Span | Why |
|---|---|---|---|---|
| 1 | Recognition | `pin` + `kinetic` (lines) on the h1 | 1.8 | Scale contrast is the whole grammar; the hero is one line at extreme scale |
| 2 | Doubt | `reveal` wipe across letterforms | flow | A wipe is a change of state, and these are the options being struck out |
| 3 | **PEAK** | `pin` + bespoke word gather | 4.4 | The frame must hold while the setting compresses. Largest span by 2.6vh |
| 4 | Trust | `reveal` | flow | Same device, non-adjacent; the boundaries deserve the same weight as the claims |
| 5 | Resolve | `flow` + `in` close | flow | The quietest setting on the site. Holds. |

Four device families (kinetic, reveal, pin, flow). No family twice in a row.
Zero `scrub`. **Measured total 8.49 viewport-heights**, inside the 8 to 14
budget, and a different act count and length from warsh-pricing's 6 acts at
8.15vh. Under reduced motion the page relays to 3.31vh.

The hero and the peak were both lengthened after the first verification pass:
the page measured 7.59vh, which is under the skill's floor, so the two acts that
wanted more room got it rather than padding being added anywhere else.

**Authored silence:** act 1's lower third is empty parchment by design, and the
peak's first 12% before any word moves. Neither is dead scroll.

## Honoured forbids

No photographic ground. No `scrub`. No scrims (nothing to scrim). No cards of
any kind. No decorative motion. Bans held: no `pan` rail of cards, no `tilt`, no
`parallax` on text. The display cap lifts because the page is one continuous
hero moment, so tracking tightens as size grows rather than staying at default.

**Nav:** no persistent nav. The wordmark is set into the hero composition at
~8vw, not as a 14px bar item; the site bar scrolls away. The shared footer is
suppressed, because a footer after this close would overwrite it.

**Close:** the page inverts. The smallest type on the site, one continuous line
of running text carrying the mark, the ask, the contact and the site links, with
the CTA as a plain underlined link reading **Download on Google Play** (one
label per intent, matching the nav).

**Content boundary:** the four skills, the lesson shape and the feature set stay
on warsh-home and warsh-features and are referenced here with a link. No page
repeats another.

## Fingerprint gate

- vs **warsh-home**: 6/6 — grammar, nav (folio rail > none), hero (title page >
  one word at extreme scale), act sequence (six acts, flow-led, one pinned peak
  at 8.3vh > five acts, kinetic > reveal > pin > reveal > flow at 8.49vh),
  close (colophon plate > one line of running text), signature move.
- vs **warsh-features**: 6/6 — grammar, nav, hero, act sequence, close,
  signature move.
- vs **warsh-pricing**: 6/6 — grammar (split stage > typographic poster), nav
  (divider chrome > none), hero (50/50 split > extreme-scale word), act sequence
  (six acts, pin > reveal > flow > pin > flow > pin > five acts, kinetic >
  reveal > pin > reveal > flow), close (refused collapse > inverted running
  line), signature move.

  Stated plainly, because the shared columns are what the next build inherits:
  these two land at almost the same total length, 8.49vh against 8.15vh, and
  both put a single long pinned peak in the middle of shorter flow acts. The
  act-sequence dimension separates them on count and device order, not on
  length, and a fifth page should not reach for that shape again.

Requirement is 4 of 6 against each row individually. Passes.

---

# Verification log

Six passes with `shoot.mjs` against `next start`: desktop 1440x900, phone
390x844, and reduced-motion. **No dead scroll, no contrast failures, no console
errors on any pass.** One `h1`, headings in order, 18 focus stops.

## What verification caught

**1. The gathered sentence had no spaces in it.** The peak settled on
`Youknowhowthewordssound.Warshisaboutwhattheymean.` Each word is an
`inline-block` so it can be transformed, and a trailing space INSIDE an
inline-block is trimmed, so the separator authored inside each span rendered as
nothing. The space is now a text node between the spans. Only a render catches
this: the markup and the DOM text content are both correct.

**2. Act 2's trailing line set one word per row.** `.wa-trail` carried
`max-width: 24ch`, and `ch` on that wrapper resolves against the inherited 16px
body font rather than against the 5rem display size of the line inside it, so
the cap was about 190px. The measure now lives on `.wa-line`, where `ch` means
what it looks like it means, and the wrapper is `width: fit-content`.

**3. The outermost scattered words were being cut in half by the frame.** The
stage clips its overflow, and a scattered word is displaced from its natural
position AND grown about its own centre, so the two combine at the edges: "You"
and "mean." were rendering as "ou" and "mea" at several scroll positions, on
desktop as well as on a phone. Horizontal and vertical spread are now separate
multipliers, since vertically there is a whole viewport of room and horizontally
the sentence already fills the measure. Measured across the whole peak at 1440,
1024 and 390: worst horizontal overflow **0px** at every width.

**4. The page was under the length floor**, at 7.59vh against a floor of 8.
Fixed by giving the hero and the peak the extra room rather than padding
anything.

## Feel check, intended against felt

Scrolled cold, one word per act, before re-reading the curve above.

| # | Intended | Felt | Verdict |
|---|----------|------|---------|
| 1 | Recognition | Arrested, then recognition | Matches |
| 2 | Doubt | Recognition of the two bad options | Matches |
| 3 | Clarity | Confusion, then the penny drops | Matches, and the confusion is the point |
| 4 | Trust | Trust, and relief at the plainness | Matches |
| 5 | Quiet resolve | Quiet | Matches |

The peak is by a wide margin the largest visual change on the sheet: it is the
only near-white ground on a page of parchment and it holds 4.4 of the page's 8.5
viewport-heights, so it also wins the squint test. The last screen resolves on
the running line rather than fading out.

## What was NOT verified

- **A real phone.** Headless Chrome at 390x844 is not an iPhone. There is no
  video on this page, but touch scrolling and Low Power Mode were not exercised
  on hardware.
- **A hand-driven screen reader pass.** Heading order, `h1` count and focus-stop
  count were checked programmatically.
- **The engine's rAF loop still survives a client-side navigation away**, since
  it has no teardown API and editing it is forbidden. `useScrollCraft` removes
  the stylesheet and the token class, which is the part that rendered wrong.
