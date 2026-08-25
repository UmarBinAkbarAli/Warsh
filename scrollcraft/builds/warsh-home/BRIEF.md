# BRIEF — warsh-home

Interviewed 2026-08-25. Not self-authored.

Target: the homepage of `warsh-site` (`warsh.app`), Next 16 App Router + Tailwind.
Scope confirmed: **homepage only**. About / Features / Pricing / Blog / legal keep
the current layout.

---

## The eight interview answers

**1. Vibe, three to five words + references.**
"Illuminated manuscript, restrained." Gold leaf used sparingly, deep navy, cream
parchment, generous margins. Reverent and old, rendered with modern precision.
Existing brand palette already names these colours, so cream-and-gold is earned
here rather than defaulted (taste.md's premium-consumer palette trap does not
apply when the brand names the colours).

**2. The scroll journey.** Chaptered, in the user's chosen structure: distinct
chapters with hard cuts, "like turning pages in a well-set book." Matches the
subject — Warsh's curriculum is literally 72 chapters.

**3. The energy curve.** Quiet open (a title page), tension in chapter two,
the peak in chapter three, then steadily calmer through substance and range,
resolving at the colophon.

**4. Feeling, stage by stage, and the ONE moment.**
The moment: **Al-Fatiha decoding itself.** The Bismillah sits on screen as sound
only. Then, word by word, each Arabic word's meaning resolves beneath it until
the whole line is understood. The moment *is* the product promise, enacted
rather than claimed.

**5. One thing no other site does.**
**Scroll reads right-to-left.** At the Arabic chapters the page's motion axis
flips to RTL: content enters from the right, the folio rail fills right-to-left.
The site physically teaches the direction of the language.

**6. How far from premium-minimal.** Editorial. Print sensibility, strong
typographic hierarchy, generous whitespace, restrained but confident motion.
Explicitly not Apple-minimal (most-copied register), not cinematic.

**7. One unbroken world, or distinct scenes.** **Distinct chapters.**

**8. Existing assets.** No generation, no spend, no `KIE_AI_API_KEY`.
Build from what exists: `Mobile.png` (app onboarding render, supplied by the
user, now `public/images/app-onboarding.png`), the Warsh logo, the brand palette,
and CSS/SVG craft. Cormorant Garamond (display), Inter (text), Scheherazade New
(Arabic) are already self-hosted in `public/fonts`.

---

## The feeling curve

One line per chapter: the emotion, then what on screen causes it.

| Ch | Feeling | Caused by |
|----|---------|-----------|
| 1 | Stillness, invitation | A title page. Type on parchment, wide margins, no motion yet. The app plate sits quietly in its own column. |
| 2 | Recognition, then discomfort | "You have said this today." A real count of 17 lands, and the meaning column beside it stays empty. |
| 3 | **PEAK — quiet awe** | Bismillah alone, then each word's meaning resolving beneath it, right to left, under the reader's own hand. |
| 4 | Reassurance, competence | Four skills laid out as an asymmetric spread. The page becomes explanatory. |
| 5 | Confidence, scale | The shape of a lesson and the size of the curriculum, in running prose with real figures. |
| 6 | Resolution, quiet ask | A colophon plate. Smallest type on the page. The CTA set as a line of running text. |

No two adjacent chapters share a feeling. Chapter 2 is deliberately quieter than
chapter 3 so the peak has silence in front of it.

## The peak

**Chapter 3.** Largest span on the page by a visible margin (3.6 vh against a
1.1–2.0 range everywhere else). Authored silence: after the Bismillah appears
there is roughly half a viewport where nothing but the ambient rule moves. That
is intentional, not dead scroll.

The sentence a visitor would say to a friend:

> "There's this site where you scroll and the Bismillah literally translates
> itself in front of you, word by word, right to left."

## The tell-someone sentence

It's the site where **the Quran's opening line decodes itself under your hand,
in the direction Arabic is actually read.**

## Authored silence

1. Chapter 3, roughly p 0.28–0.42: after Bismillah lands and before the first
   word gloss resolves. Deliberate. Do not let the verification pass log this as
   dead scroll.
2. Chapter 6, after the CTA line: the colophon holds with no further motion.
   The page ends on a statement, not a fade.

---

## Grammar: chaptered editorial (uniqueness.md §2.2)

Why the other seven lost:

- **Filmic one-shot** — carries a burden of proof and loses it here. The user
  explicitly chose distinct chapters over one continuous feel, and this grammar
  forbids visible sequence, which a 72-chapter curriculum actually wants.
- **Continuous world** — requires worldflight and real geography. There is none,
  and it is the expensive, fragile one. Also directly contradicts answer 7.
- **Typographic poster** — the closest runner-up, and it would suit "no generated
  assets" well. Lost because the user supplied a real app render and asked for it
  in the first fold; this grammar forbids photographic ground and would waste it.
- **Live surface** — Warsh's argument is not "watch what it does". The demo is a
  mobile app, not a web surface, and a div-built fake of it is banned outright.
- **Gallery / catalog** — the visitor's question is "should I believe this",
  not "what are the options". There is one product and one price.
- **Split stage** — no genuine two-sided comparison. "Reciting vs understanding"
  looked tempting for a beat but cannot carry a whole page.
- **Rhythmic cutlist** — bans `pin` and `dwell`, and the subject is reverent.
  A pulse is the wrong register for the Quran.

**Honoured forbids:** no fixed bar (folio in the margin instead), no full-bleed
scrub hero, no pinned crossfade type act, no `magnet`, no `spotlight`, no `drift`
as continuous gradient — each chapter paints its own opaque ground and the change
lands on a hard edge (devices.md §10 explicitly prefers this for chaptered pages).

**One deliberate deviation, and why.** The grammar says the hero is a title page
with no media above the fold. The user explicitly asked for `Mobile.png` in the
first fold. The user's instruction wins. It is reconciled with the grammar rather
than ignored: the plate sits in its own column with a caption, it does not bleed,
and no type is laid over it. That is the grammar's own rule for media ("it sits
in its own column with a caption") applied one chapter earlier than default.

## Signature move

**RTL scroll axis.** Bespoke, coded in the page, driven off `--sc-p` and the
page's own `data-warsh-*` attributes. The engine is untouched. On the Arabic
chapters, entrance transforms invert (content arrives from the right), and the
folio progress rail fills right-to-left. Not a parameter change to a kit device.

## Fingerprint gate

Registry `scrollcraft/FINGERPRINTS.md` is **empty** — this is the first build in
this workspace, so there is no row to clear. Gate passes trivially. The row is
appended after the build ships.

## The score

Six chapters, ~11.4 viewport-heights total. Deliberately outside the
6-to-7-acts-at-13.6–13.8vh band that the skill flags as a prior fingerprint.

| Ch | Beat | Device | Span | Why this one |
|----|------|--------|------|--------------|
| 1 | Recognition | `flow` + `in` | 1.4 | A title page should not move. Stagger on entry, nothing more. |
| 2 | Tension | `reveal` + `count` | 1.8 | A wipe is a change of state, and 17 is a real number, so the counter is honest. |
| 3 | **Turn (PEAK)** | `pin` + bespoke RTL resolve | 3.6 | The frame must hold while meaning arrives. Largest span on the page. |
| 4 | Substance | `flow` + `in` | 1.6 | The one chapter that reads like a document, which is where it belongs. |
| 5 | Range | `parallax` in a media column + `reveal` | 1.9 | Depth inside the column the grammar already gives media. |
| 6 | Commitment | `flow` close plate | 1.1 | Colophon. Resolves and holds; last element on the page. |

Checks: 5 device families (flow, reveal, count, pin, parallax) — over the
four-family floor. No family twice in a row. Zero `scrub` acts, so the
two-scrub cap is moot and nothing heavy ships. Peak has the largest span by 1.7vh
over the runner-up. Chapter 2 is quieter than chapter 3. Total 11.4vh, inside the
8–14 budget and outside the flagged band.

## Hard rules being honoured

No scroll cue. No `01 / 06` counters (the folio names chapters, it does not
number them as decoration). At most one eyebrow per three chapters. No em dash in
visible copy. No invented statistics — 17 daily Fatiha recitations and the
72-chapter curriculum are real; pricing figures come from `content/site.ts`. No
text baked into an image. No `transition: all`. No gradient text or neon glow.
No clay diorama. Copy anchor varies chapter to chapter rather than centred
throughout.

---

# Verification log

Three passes with `shoot.mjs` against `next start` on :4500 (desktop 1440, mobile
390x844, and reduced-motion). Zero console errors, zero contrast failures, zero
cue failures on all three.

## What the harness caught, and what was actually wrong

**1. The peak was completely dead.** Reported as dead scroll across 28% to 59%
of the page. Cause was in this build's own code, not the engine: `--sc-p` is
published on the **act element**, and `HomeMotion` was reading it off the
`data-sc-stage` div inside it. `getPropertyValue` returned an empty string, so
the Bismillah never resolved and a third of the page held one still frame.
Fixed by resolving `closest('[data-sc-act]')`.

**2. The glosses collided with the Arabic.** Only visible in a render. Arabic
kasra and other marks sit below the em box, so a 0.1em gap put "IN THE NAME"
straight through the descenders of بِسْمِ. Raised to 0.42em, which is clearance
for the ink rather than for the line box.

**3. The engine's tokens leaked to global surfaces.** `scrollcraft.css` styles
`body`, `::selection`, `:focus-visible` and the scrollbar from `:root` tokens
whose defaults are a near-black ground and a lime accent. The Warsh overrides
were scoped to `#warsh-home`, so those surfaces kept the engine's defaults: a
black band showed under the colophon on mobile, and selection and focus rings
would have been lime. Worse, the injected stylesheet survived client-side
navigation and would have restyled every other route. Fixed with a
`warsh-home-active` class on `<html>` that carries the token override and is
removed, along with the stylesheet, when the route unmounts. Verified by
driving a real client-side navigation from `/` to `/pricing`: the class, the
stylesheet and the tokens are all gone, and `body` returns to the site cream.

**4. The peak had too much genuine silence and too small a visual delta.**
Retuned the reveal window from 0.42-0.86 to 0.16-0.90, shortened the span from
3.6 to 3.0, and added two continuous `--sc-p`-driven elements so the frame is
alive between word reveals: a gold illumination that grows behind the line, and
the underline rule filling right to left. The illumination doubles as the
chapter's argument made visual.

## The remaining flag, stated plainly

The harness still reports dead scroll across the pinned peak, and **this was not
resolved.** It was verified instead: instrumenting the act at the exact scroll
positions the harness samples shows `--sc-p` moving 0.14 > 0.35 > 0.56 > 0.76 >
1.00, words lighting in sequence, and the glosses and the whole-line translation
resolving on cue. The frames in `lab/shots` confirm it by eye.

The judgement is that the harness's threshold is calibrated for full-frame video
scrubs, where consecutive frames differ enormously, and it cannot see this act's
real but modest deltas: one small gloss appearing, a 2px rule extending, a soft
glow growing. One part of the flag is genuine, though: the act reaches `p = 1`
slightly before the pin releases, so the final stretch of its travel is honestly
static while the stage slides off. That is inherent to a pinned act and was
reduced, not eliminated, by moving the last reveal to 0.90.

Under reduced motion the same flag is correct and intended: everything is shown
resolved, so nothing moves.

## Feel check, intended against felt

Scrolled cold, one word per chapter, before re-reading the curve above.

| Ch | Intended | Felt | Verdict |
|----|----------|------|---------|
| 1 | Stillness, invitation | Calm, composed | Matches |
| 2 | Recognition, discomfort | Recognition, then a small sting at the empty column | Matches |
| 3 | Quiet awe | Awe, but flat on the first pass | **Diverged, and fixed.** This was defect 1: the peak was static. After the fix it lands. |
| 4 | Reassurance, competence | Competent, explanatory | Matches |
| 5 | Confidence, scale | Confident | Matches |
| 6 | Resolution, quiet ask | Resolves, holds | Matches |

The peak is the largest visual change on the page and holds the most scroll room
by a wide margin, and it is the only dark chapter before the colophon, so it
also wins the squint test. The last screen resolves on the colophon rather than
fading out.

## What was NOT verified

- **A real phone.** Headless Chrome at 390x844 is not an iPhone. There is no
  video on this page, so the usual iOS clip-lifecycle failures do not apply, but
  touch scrolling and Low Power Mode were not exercised on hardware.
- **Keyboard focus order** was checked programmatically (14 stops, reading
  order, single `h1`, all images carry alt, `sr-only` computes to 1px) but not
  driven by hand with a screen reader.
- **The engine has no teardown API.** Its rAF loop and scroll listeners survive
  a client-side navigation away from the homepage. Its writes target a detached
  tree so nothing renders wrong, and the CSS leak (the part that did render
  wrong) is fixed, but returning to the homepage in the same session mounts a
  second instance. Editing the engine to add a destroy hook is forbidden by the
  skill, so this is accepted and recorded rather than fixed.
