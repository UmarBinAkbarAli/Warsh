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

## Chapter 7 — open (5 scenes)

Briefs from `proposals/chapter-07-content-proposal.md` (one per lesson). Cards
whose word has an approved asset already show one (`kitab`, `qalam`, `bayt`,
`madrasa`, `umm`, and `ism` — the last copied from the dictionary set on
2026-09-18). The spoken-phrase template has no card slot for an image, so the
Lesson 5 classroom scene lands on the review card that recaps the question set.

| # | Filename | Cards | Arabic on the card | Brief |
|---|---|---|---|---|
| 1 | `ch07-my-objects.png` | `ch07-l01` cards 1, 8 | كِتَابِي / قَلَمِي / بَيْتِي | A learner identifying their own objects (book, pen, house, name-card motif) with a subtle "belongs to me" visual link from each object back to the learner. |
| 2 | `ch07-two-listeners.png` | `ch07-l02` cards 1, 2, 7 | كِتَابُكَ / كِتَابُكِ | One speaker handing the same book toward two distinct listeners, a man and a woman, so the ending visibly depends on whom the speaker addresses. |
| 3 | `ch07-his-her-owners.png` | `ch07-l03` cards 1, 2, 7 | كِتَابُهُ / مَدْرَسَتُهَا | Two ownership relationships side by side: a man with a book, a woman with a school/home symbol — each object clearly tied to its owner. |
| 4 | `ch07-four-people-have.png` | `ch07-l04` cards 1, 9 · `ch07-l06` card 7 | عِنْدِي / عِنْدَكَ / عِنْدَكِ / عِنْدَهُ / عِنْدَهَا | Four people in a row, each with or without a pen/book, communicating "I have / you have / he has / she has"; neutral, no stereotypes. |
| 5 | `ch07-classroom-questions.png` | `ch07-l06` card 8 | مَا، مَنْ، أَيْنَ / أَعِنْدَكَ قَلَمٌ؟ | Two learners in a lesson, one gesturing at an object as if asking about it, the other checking whether a pen is available; no speech bubbles. |

## Chapter 8 — open (4 scenes)

Briefs from `proposals/chapter-08-content-proposal.md` §5 (one per lesson).
Cards whose word has an approved asset already show one (`dhahaba`, `madrasa`,
`umm`, `bayt`, and `bint` + `qarya` — the last two copied from the dictionary
set on 2026-09-18). The review reuses the Chapter 8 assets, as the proposal
asks. The rejected `qāla` dictionary badge (generated Arabic lettering) was not
used.

| # | Filename | Cards | Arabic on the card | Brief |
|---|---|---|---|---|
| 1 | `ch08-he-she-movement.png` | `ch08-l01` cards 4, 6 | ذَهَبَ / ذَهَبَتْ · ذَهَبَتْ فَاطِمَةُ | A man and a woman each completing the same walking-away action, side by side, so the only difference is who is going; no lettering. |
| 2 | `ch08-she-returned-sat-entered.png` | `ch08-l02` cards 1, 6 | رَجَعَتْ · جَلَسَتْ · دَخَلَتْ | Three panels, one consistent female character: returning along a path, sitting, and stepping through a doorway; no labels. |
| 3 | `ch08-allati-connector-panels.png` | `ch08-l03` cards 4, 8 | الْبِنْتُ الَّتِي ذَهَبَتْ · الْمَدْرَسَةُ الَّتِي فِي الْقَرْيَةِ | Two panels: a girl visibly linked (path or thread) to a going-away scene; a school visibly linked to a village — "the one who / that …" without words. |
| 4 | `ch08-mother-returning-home.png` | `ch08-l04` cards 6, 7 | رَجَعَتْ أُمِّي إِلَى الْبَيْتِ · أُمِّي الَّتِي رَجَعَتْ | A mother arriving back at a family house, supporting both "my mother returned home" and "my mother who returned"; no speech bubbles. |


## Chapter 9 — open (4 scenes)

Briefs from `proposals/chapter-09-content-proposal.md` §5 (one per lesson).
Cards whose word has an approved asset already show one (`kitab`, `bayt`,
`talib`, `masjid`, `hadha-v2`, and `mumina` + `qawm` — the last two copied
from the dictionary set on 2026-09-18). The review reuses the Chapter 9
assets, as the proposal asks. The `muslim` and `mu'min` dictionary badges
(generated lettering) and the `mu'allim` one (reads as a shopkeeper) were not
used.

| # | Filename | Cards | Arabic on the card | Brief |
|---|---|---|---|---|
| 1 | `ch09-one-man-group.png` | `ch09-l01` cards 1, 3 · `ch09-l05` card 2 | مُسْلِمٌ / مُسْلِمُونَ · مُؤْمِنٌ / مُؤْمِنُونَ | One male learner beside a nearby group of male or mixed learners, so the only difference is one versus many; no lettering. |
| 2 | `ch09-one-woman-group.png` | `ch09-l02` cards 2, 3 | طَالِبَةٌ / طَالِبَاتٌ · مُعَلِّمَةٌ / مُعَلِّمَاتٌ | One female learner beside a group of female learners/teachers; neutral clothing and setting, singular versus plural only; no labels. |
| 3 | `ch09-one-many-four-panels.png` | `ch09-l03` cards 1, 7 | الْجَمْعُ الْمُكَسَّر · عَائِلَاتُ الْكَلِمَات | Four panels: one book / several books, one house / several houses, one student / several students, one masjid / several masjids; no words. |
| 4 | `ch09-pointing-at-group.png` | `ch09-l04` cards 3, 4 | هٰؤُلَاءِ مُسْلِمُونَ · هٰؤُلَاءِ طَالِبَاتٌ | A speaker indicating a nearby group of male, female or mixed learners; the card supplies the demonstrative; no speech bubbles. |

## Chapter 10 — open (5 scenes)

Briefs from `proposals/chapter-10-content-proposal.md` (one per lesson). Cards
whose word has an approved asset already show one: `qawm` for the group
cards, and `salah`, `dars`, `shams` and `rajaa`, copied from the dictionary set
on 2026-09-18 (the `qabl` / `ba'd` dictionary badges are abstract frames and
were not used). The review reuses the Chapter 10 assets. Fixture numbers
follow display order, so `ch10-l05` (you all) is file 03, `ch10-l03` (before)
is file 04 and `ch10-l04` (after) is file 05.

| # | Filename | Cards | Arabic on the card | Brief |
|---|---|---|---|---|
| 1 | `ch10-they-two-groups.png` | `ch10-l01` cards 2, 5 | هُنَّ · هُمْ / هُنَّ | Two separate nearby groups seen from outside: one male or mixed, one female-only, clearly apart so the only difference is who is in each group; no lettering. |
| 2 | `ch10-we-group-speaking.png` | `ch10-l02` cards 2, 7 | نَحْنُ · نَحْنُ / هُمْ | A group speaking as one, the viewer inside it (first-person viewpoint, the speaker's own shoulder or hand in frame is fine); men and women together; no speech bubbles or text. |
| 3 | `ch10-you-all-facing-group.png` | `ch10-l05` (file 03) cards 5, 6 | الْمُخَاطَبُونَ · هُمْ / أَنْتُمْ | One learner facing a group and addressing it directly; two panels or one scene with a male/mixed group and a female-only group; no text. |
| 4 | `ch10-before-timeline.png` | `ch10-l03` (file 04) cards 4, 9 | قَبْلَ وَبَعْدَ · قَبْلَ | A simple two-step timeline (two events on a line, e.g. a walking figure then a prayer mat); the earlier event highlighted, the later one muted; no words or arrows with lettering. |
| 5 | `ch10-after-timeline.png` | `ch10-l04` (file 05) cards 4, 9 | قَبْلَ / بَعْدَ · قَبْلَ وَبَعْدَ | The same timeline language as scene 4 with the later event highlighted and the earlier one muted; no text. |

## Chapter 11 — nothing open

Rebuilt 2026-09-19 from `proposals/chapter-11-content-proposal.md`. Every card
that carries an image uses an approved asset: `ab`, `umm`, `bayt`, `kitab`,
`qalam`, `fi` and `qawm` from the discover set, and `akh`, `ukht`, `matbakh`,
`ard` and `aila` copied from the dictionary word images on 2026-09-19. The
proposal does not require an illustration on every card, so no composite
scenes are requested.

## Chapter 12 — open (2 scenes)

Rebuilt 2026-09-19 from `proposals/chapter-12-content-proposal.md`. Cards
whose word has an approved asset show one: `ism`, `min`, `ayna`, `dhahaba`,
`rajaa`, `masjid` and `dars` from the discover set, and `tabib` and `tajir`
copied from the dictionary word images on 2026-09-19. Note for the owner: the
dictionary image filed under مُعَلِّم is a shop-counter scene, so it is used
here for تَاجِرٌ; the تَاجِر and خَلَقَ dictionary assets are calligraphy badges
and were not used. The review reuses no images.

| # | Filename | Cards | Arabic on the card | Brief |
|---|---|---|---|---|
| 1 | `ch12-muallim-teacher.png` | `ch12-l03` card 3 | مُعَلِّمٌ | A teacher at a low desk or lectern with an open book and a small class in front, seen from the side; realistic soft 3D; no lettering. |
| 2 | `ch12-muhandis-engineer.png` | `ch12-l03` card 4 | مُهَنْدِسٌ | An engineer's drawing board with a rolled plan, a set square and a small model of an arch or bridge; no lettering. |

## Delivered

_Nothing yet._
