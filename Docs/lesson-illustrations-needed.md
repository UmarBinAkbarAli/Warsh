# Lesson illustrations needed

The running list of discover-card scenes that a curriculum chapter calls for but
has no image yet. Vocabulary words are fully covered
(`vocabulary-illustrations-needed.md`, 920/920); this file tracks the **lesson
cards** — composite scenes that belong to one lesson rather than one word.

**Rule from 2026-09-17:** every chapter rebuild adds its missing scenes here.
Where a card's word already has an approved vocabulary illustration
(`madrasa`, `shajara`, `kitab`, …) that asset is reused and the card is not
listed. The owner draws the scenes; Claude uploads them and updates this file.

The companion `lesson-illustrations-needed.csv` carries the same rows plus the
fixture file, lesson id and card number, which is what the upload step keys on.

## How to deliver

1. **One PNG per scene, named exactly as the `Filename` column**, e.g.
   `ch05-dhahaba-movement.png`. Several cards share one scene; deliver the
   file once.
2. **Style:** the approved discover-card style — Warsh navy, parchment, olive
   and restrained gold; realistic soft 3D educational objects; transparent or
   clean neutral background; **no Arabic or Urdu lettering inside the image**
   (the card supplies the text); nothing decorative that competes with the
   learning word. Square, any size — the upload step downscales to 768 px WebP,
   so send the full-quality original.
3. Drop them in **one folder** (sub-folders are fine) and say where it is.
4. Claude runs the upload, which resizes, uploads to R2
   (`images/discover/{slug}.webp`), writes the URL into each card, and then
   publishes the fixture change to production through the normal mirror flow:
   ```powershell
   cd warsh-backend
   npm run images:upload-lessons -- --input <folder> --dry-run
   npm run images:upload-lessons -- --input <folder>
   npm run db:validate-fixtures
   npm run content:check
   npm run content:sync -- --dry-run     # media-URL diffs only
   npm run content:sync
   ```
   Files not yet in the folder are skipped and listed, so a partial delivery is
   fine. A delivered scene is moved to the "Delivered" section below.

## Chapter 5 — open (6 scenes + 1 optional)

Briefs are the ones approved in `proposals/chapter-05-content-proposal.md`
(media plan). Card numbers are 1-based positions in the lesson's Discover beat.

| # | Filename | Cards | Arabic on the card | Brief |
|---|---|---|---|---|
| 1 | `ch05-near-feminine-scene.png` | `ch05-l01` card 1 | هَٰذِهِ | Near feminine application scene: a nearby school, tree and open Quran arranged close to the learner's viewpoint. |
| 2 | `ch05-tilka-ayat-allah.png` | `ch05-l02` cards 5, 6 | تِلْكَ آيَاتُ اللَّهِ | Open Quran with a sequence of illuminated verse markers seen at a distance. |
| 3 | `ch05-li-laka-contrast.png` | `ch05-l03` card 7 | لِي / لَكَ / لَكِ | Split scene: a learner holding a book on the "me" side; a male and a female addressed learner on the "you" side. |
| 4 | `ch05-lahu-laha-lakum-owners.png` | `ch05-l06` card 10 | لَهُ / لَهَا / لَكُمْ | Possession diagram: a man, a woman and a third person each with clearly separated personal objects, plus a small group panel for "you all". |
| 5 | `ch05-dhahaba-movement.png` | `ch05-l04` cards 5, 7 · `ch05-l07` card 1 · `ch05-l05` card 7 | ذَهَبَ الطَّالِبُ | Movement sequence: a male learner leaving one location and moving away with clear directional motion. |
| 6 | `ch05-action-doer-destination.png` | `ch05-l07` cards 5, 8 · `ch05-l05` card 8 | ذَهَبَ الطَّالِبُ إِلَى الْمَدْرَسَةِ | Three-stage visual: movement, the learner as doer, and a mosque/school as destination, grouped visually left to right. |
| 7 | `ch05-naqat-allah.png` | `ch05-l01` cards 6, 7 | نَاقَةُ اللَّهِ | **Optional, not in the approved media plan:** a single she-camel standing on open ground, no rider. Skip if you prefer the card without an image. |

`ch05-l06` and `ch05-l07` are the two new lessons (display positions 4 and 6);
`ch05-l05` is the R1 review at display position 7.

## Chapter 6 — open (4 scenes)

Briefs from `proposals/chapter-06-content-proposal.md` (media plan). Cards whose
word has an approved asset already show one (`rajul`, `walad`, `talib`,
`qalam`, `kitab`, `masjid`, `dhahaba`, `fi`, `alladhi`, `khalaqa`,
`sirat-mustaqim` — the last six copied from the dictionary set on 2026-09-17).

| # | Filename | Cards | Arabic on the card | Brief |
|---|---|---|---|---|
| 1 | `ch06-described-person-action.png` | `ch06-l01` card 8 | الرَّجُلُ الْكَرِيمُ + ذَهَبَ | A man and a student, each visually tied to a quality (generous / hardworking), both moving forward. |
| 2 | `ch06-person-connected-action.png` | `ch06-l02` cards 3, 6 | الْوَلَدُ الَّذِي ذَهَبَ | Visual bridge: a boy connected by a visible path to a going-away scene — person linked to action. |
| 3 | `ch06-place-tool-panels.png` | `ch06-l03` cards 4, 6 | الْكِتَابُ الَّذِي فِي الْبَيْتِ · بِالْقَلَمِ | Three separate panels: a pen on a desk; a book inside a house; an abstract "taught by the pen" teaching scene. |
| 4 | `ch06-creation-chain.png` | `ch06-l04` cards 4, 8 · `ch06-l05` card 7 | الَّذِي خَلَقَ فَسَوَّىٰ | Four connected stages left to right: creation, balance, measure, guidance — abstract objects only, no depiction of the Divine. |

## Delivered

_Nothing yet._
