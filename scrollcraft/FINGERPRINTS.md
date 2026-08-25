# Fingerprints

Every site you build with **scrollcraft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|

*(empty: your first build has nothing to clear, so build whatever the interview
points at. From the second onwards, this table is the constraint.)*

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- **Four of the eight grammars are gone**: chaptered editorial (warsh-home),
  gallery / catalog (warsh-features), split stage (warsh-pricing), typographic
  poster (warsh-about). A fifth page picks from filmic one-shot, live surface,
  continuous world or rhythmic cutlist, or names a new grammar.
- **The warm-parchment-and-gold floor is the site's, not a build's.** It is
  shared by all four and is not available as a point of difference.
- **"One long pinned peak among shorter flow acts" is taken twice**, by
  warsh-pricing and warsh-about, and both land at roughly 8.2 to 8.5vh. The
  next build should move its peak off that shape: a different act count, a
  peak that is not the longest act, or a peak held in fixed chrome rather than
  in an act.
- **The close-carries-the-footer pattern is taken three times** (home, pricing,
  about all suppress the shared `Footer` and end on their own plate). A fourth
  page doing it would make it the site's default rather than a grammar's
  consequence.
- **Scroll-driven typography is well used**: word-by-word gloss (home), a line
  rotating upright (pricing), scattered words gathering into a sentence
  (about). A new signature move should not be a fourth variation on "type moves
  as you scroll".

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scrollcraft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.

---

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move |
|---|---|---|---|---|---|---|
| **warsh-home** (2026-08-25) | Chaptered editorial | Folio rail in the margin, non-sticky bar, no fixed CTA island | Title page: `flow` + stagger, media in its own column, no bleed | flow > flow > **pin (peak)** > flow > flow > flow, 8.3vh, one dark peak among paper chapters | Colophon plate, CTA as a line of running text, site footer suppressed | RTL scroll axis: content arrives from the right and the peak's rule fills right to left |
| **warsh-features** (2026-08-25) | Gallery / catalog | Jumping index of objects, fixed in the left margin | Object one already in view; the h1 rides inside the rail as the opening plate | One `pan` spine, 10 rail items, 10.5vh | Inquiry plate typeset exactly like an object label | An index that jumps into LATERAL space: object centre resolved to the scroll position that produces it |
| **warsh-pricing** (2026-08-25) | Split stage | The divider is the chrome: a fixed full-height rule at the live split ratio, carrying both side labels and the argument's progress; site bar scrolls away | Both columns at exactly 50/50 on the first screen, two headlines readable at once, each travelling in from its own outer edge | pin > reveal+count > flow > **pin (peak)** > flow > pin, 6 acts, 8.15vh, one 3.4vh peak among 1.2-1.6vh acts | Refused collapse: the divider stops at 14% instead of an edge, the CTA lives in the winning column, and the losing column is still on screen | A squeezed column whose line ROTATES upright rather than disappearing, interpolated on the same value that narrows it |
| **warsh-about** (2026-08-25) | Typographic poster | None. The wordmark is set into the hero composition at ~5rem rather than as a bar item; site bar scrolls away | One line, "One gap.", at up to 17rem filling the viewport, with a 16px paragraph directly beneath it | kinetic > reveal > **pin (peak)** > reveal > flow, 5 acts, 8.49vh, one 4.4vh peak | The page inverts to its smallest type: one continuous line of running text carrying mark, ask, contact and site links, CTA as a plain underlined link | The measure closes: the thesis sentence is on screen throughout, scattered at poster scale, and gathers into one readable line on scroll. Nothing appears or disappears; only the setting changes |
