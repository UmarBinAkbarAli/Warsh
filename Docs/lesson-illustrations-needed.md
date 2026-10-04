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
   **No facial features, ever** (owner rule, 2026-09-24; see product spec §13).
   Faces are smooth and blank — no eyes, eyebrows, nose, mouth or expression —
   or turned away from the viewer. A visible eye, mouth or smile, even in
   profile, fails. Every prompt states *"faceless figures: blank featureless
   faces, no eyes, no mouth"*, and Claude opens every file and rejects any with
   a face **before** uploading.
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
   fine.
5. **Replacing a picture that is already live** (e.g. a faceless redraw): R2
   serves `images/discover/` as `immutable` for a year, so overwriting the same
   key leaves every phone that saw the old picture showing it. Put only the
   redrawn files in a folder and add `--replace`, which uploads to
   `{slug}-{sha8}.webp` and changes the card URL. Then open the live URL and
   confirm it shows the new picture. A delivered scene is moved to the "Delivered" section below.

## ✅ Faceless redraws — all 73 published 2026-09-25

These pictures broke the no-faces rule (product spec §13) and were redrawn with
blank, featureless faces or figures turned away. All 73 redraws were checked for
faces and published with `--replace` (step 5 above) on 2026-09-25, in the same
delivery as 35 new scenes (Chapter 1: 3, Chapter 20: the last 6, Chapter 21: 26):
108 files, 149 cards, 56 lessons. As with the 2026-09-24 delivery, the lessons'
previous `contentUpdatedAt` values were written back after the sync, so no learner
sees an "Updated" notice for a picture change.

- **Chapter 5** (3): `ch05-action-doer-destination.png`, `ch05-lahu-laha-lakum-owners.png`, `ch05-li-laka-contrast.png`
- **Chapter 6** (3): `ch06-described-person-action.png`, `ch06-person-connected-action.png`, `ch06-place-tool-panels.png`
- **Chapter 7** (4): `ch07-classroom-questions.png`, `ch07-four-people-have.png`, `ch07-my-objects.png`, `ch07-two-listeners.png`
- **Chapter 8** (3): `ch08-allati-connector-panels.png`, `ch08-mother-returning-home.png`, `ch08-she-returned-sat-entered.png`
- **Chapter 9** (3): `ch09-one-man-group.png`, `ch09-one-woman-group.png`, `ch09-pointing-at-group.png`
- **Chapter 10** (5): `ch10-after-timeline.png`, `ch10-before-timeline.png`, `ch10-they-two-groups.png`, `ch10-we-group-speaking.png`, `ch10-you-all-facing-group.png`
- **Chapter 12** (2): `ch12-muallim-teacher.png`, `ch12-muhandis-engineer.png`
- **Chapter 14** (3): `ch14-believers-and-mosques.png`, `ch14-honourable-muslims.png`, `ch14-people-or-things-sort.png`
- **Chapter 15** (4): `ch15-far-group.png`, `ch15-far-students-far-books.png`, `ch15-pointing-set-recall.png`, `ch15-those-houses-far.png`
- **Chapter 16** (1): `ch16-went-to-school-yesterday.png`
- **Chapter 17** (1): `ch17-object-or-destination.png`
- **Chapter 18** (6): `ch18-four-lines-summary.png`, `ch18-man-stood-teacher.png`, `ch18-the-girl-who-read.png`, `ch18-the-man-who-went.png`, `ch18-the-vs-a-man.png`, `ch18-who-stood-question.png`
- **Chapter 19** (11): `ch19-fatimah-new-book.png`, `ch19-fatimah-pen-on-desk.png`, `ch19-his-book-heard-him.png`, `ch19-her-village-big.png`, `ch19-i-have-vs-my.png`, `ch19-my-book-her-book.png`, `ch19-my-her-book-on-desk.png`, `ch19-my-your-his-school.png`, `ch19-teachers-house-my-house.png`, `ch19-woman-his-wife.png`, `ch19-you-have-vs-your.png`
- **Chapter 20** (24): `ch20-book-owners-change.png`, `ch20-four-groups-grid.png`, `ch20-group-listeners.png`, `ch20-houses-two-groups.png`, `ch20-mothers-first.png`, `ch20-my-book-our-book.png`, `ch20-noun-or-action-na.png`, `ch20-one-woman-group-women.png`, `ch20-our-big-school.png`, `ch20-our-house.png`, `ch20-review-speaking-about.png`, `ch20-review-speaking-to.png`, `ch20-speaking-to-group.png`, `ch20-students-books-desk.png`, `ch20-students-their-teacher.png`, `ch20-students-your-teacher.png`, `ch20-their-book-women.png`, `ch20-their-house.png`, `ch20-their-houses-women.png`, `ch20-they-their-book.png`, `ch20-three-questions.png`, `ch20-we-our-group.png`, `ch20-where-your-book-group.png`, `ch20-women-students-books.png`

Total: 73. Only this folder was checked; vocabulary pictures have not been checked yet.

## ✅ Delivered — Chapters 14–19 (uploaded and published 2026-09-24)

Chapters 14–19 were rebuilt without a single image (255 discover cards, none
with a picture). **Owner rule from 2026-09-24: every card gets a picture,
grammar cards included.** A grammar card gets a scene that shows what the rule
is about (near/far, one/many, people/things, a label versus a statement), not
decoration.

- **155 new scenes generated locally, covering 219 cards** (tables below; the
  CSV has one row per card). Several cards share one scene, so each file is
  present once in `Warsh-images/lesson-illustrations/` as a 1024×1024
  transparent PNG. **Done 2026-09-24:** all 155 uploaded with
  `images:upload-lessons` to `images/discover/{slug}.webp` and published to
  production with `content:sync`.
- **36 cards reuse a picture we already have**: the word's approved
  vocabulary illustration or an existing discover scene. Nothing to draw;
  they are listed at the end and in `lesson-illustrations-reuse.csv`, and get
  wired in with the same delivery.

**Quran cards (`AYAH_PREVIEW`) never show Allah, a prophet, Maryam, an angel,
a jinn or the devil.** Their briefs are deliberately symbolic (light, a path,
a doorway, dawn, a scroll); keep them that way. People elsewhere wear modest
dress and are shown respectfully; prayer is seen from behind.

On delivery Claude also copies each reused vocabulary picture to
`images/discover/{slug}.webp` rather than pointing a card at
`images/words/{id}`, whose id changes if the vocabulary is ever re-created.

### Chapter 14

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch14-one-to-group-hardworking.png` | `ch14-l01` card 1 | طَالِبٌ مُجْتَهِدٌ / طُلَّابٌ مُجْتَهِدُونَ | Two panels: left, one boy bent over a notebook studying hard at a desk; right, a group of boys studying hard together at one long table |
| `ch14-hardworking-boys.png` | `ch14-l01` cards 2, 3 · `ch14-l03` card 3 · `ch15-l03` card 5 | مُجْتَهِدُونَ · الطُّلَّابُ الْمُجْتَهِدُونَ | A group of boys at a long table, heads down over open books and notebooks, clearly working hard |
| `ch14-hardworking-girls.png` | `ch14-l01` card 4 | مُجْتَهِدَاتٌ | A group of girls in modest dress at a long table, heads down over open books and notebooks, clearly working hard |
| `ch14-boys-girls-hardworking.png` | `ch14-l01` card 5 · `ch14-l05` card 2 | مُجْتَهِدُونَ / مُجْتَهِدَاتٌ · الطُّلَّابُ الْمُجْتَهِدُونَ / الطَّالِبَاتُ الْمُجْتَهِدَاتُ | Two panels: left, the hardworking group of boys; right, the hardworking group of girls (same setting and pose, so only the group changes) |
| ✅ `ch14-honourable-muslims.png` | `ch14-l01` card 6 · `ch14-l05` card 3 | كِرَامٌ · مُسْلِمُونَ صَالِحُونَ / مُسْلِمُونَ كِرَامٌ | A group of men at an open door warmly welcoming guests with dates and tea: generosity and honour, not wealth |
| `ch14-three-checks.png` | `ch14-l01` card 7 | الطَّالِبَاتُ الْمُجْتَهِدَاتُ | Three small tiles in a row with a tick under each: a cluster of figures (many), a girl figure (feminine), a highlighted tag hanging on an object (definite) |
| `ch14-honored-servants-light.png` | `ch14-l01` card 8 | مُكْرَمُونَ | Soft light falling from above onto a calm horizon at dawn. The ayah speaks of angels, so no figures of any kind |
| `ch14-new-books.png` | `ch14-l02` cards 1, 2 · `ch14-l03` card 6 | الْكُتُبُ الْجَدِيدَةُ · جَدِيدَةٌ / الْجَدِيدَةُ | A neat stack of brand-new books with crisp covers, one standing open |
| `ch14-large-houses.png` | `ch14-l02` card 3 · `ch14-l03` card 5 · `ch14-l05` card 4 | الْبُيُوتُ الْكَبِيرَةُ · الْبُيُوتُ الْكَبِيرَةُ / الْبُيُوتُ كَبِيرَةٌ | A street of several large family houses side by side |
| `ch14-large-mosques.png` | `ch14-l02` card 4 · `ch14-l03` card 4 | الْمَسَاجِدُ الْكَبِيرَةُ · الْمَسَاجِدُ الْكَبِيرَةُ / الْمَسَاجِدُ كَبِيرَةٌ | Two or three large mosques with domes and minarets on one skyline |
| `ch14-students-and-books.png` | `ch14-l02` card 5 · `ch14-l04` card 2 · `ch15-l02` card 1 | الطُّلَّابُ الْمُجْتَهِدُونَ / الْكُتُبُ الْجَدِيدَةُ · طُلَّابٌ مُجْتَهِدُونَ / كُتُبٌ جَدِيدَةٌ | Two panels: left, a group of students; right, a stack of books. People on one side, things on the other |
| ✅ `ch14-people-or-things-sort.png` | `ch14-l02` card 6 · `ch14-l04` card 1 · `ch14-l05` card 1 | عَاقِلٌ أَمْ غَيْرُ عَاقِلٍ؟ | A sorting scene with two trays: one holds small figures of people, the other holds objects (a book, a house, a cup, a mosque) |
| `ch14-houses-mosques-skyline.png` | `ch14-l02` card 7 | قَاعِدَةٌ لِلْمُبْتَدِئِ | A town skyline where large houses and large mosques stand together |
| `ch14-raised-couches.png` | `ch14-l02` card 8 · `ch14-l06` card 2 · `ch14-l05` card 8 | مَرْفُوعَةٌ · سُرُرٌ مَرْفُوعَةٌ | A paradise garden terrace: couches set high on raised platforms among greenery and flowing water; no people |
| `ch14-phrase-or-sentence.png` | `ch14-l03` cards 1, 2 · `ch14-l05` card 5 · `ch15-l03` card 1 | تَرْكِيبٌ أَمْ جُمْلَةٌ؟ · الْكُتُبُ الْجَدِيدَةُ / الْكُتُبُ جَدِيدَةٌ | Two panels of the same new books: left, the books carry a small ribbon tag (naming them); right, an empty speech bubble beside them (saying something about them) |
| `ch14-cups-put-in-place.png` | `ch14-l03` cards 7, 8 · `ch14-l06` card 3 | أَكْوَابٌ مَوْضُوعَةٌ · مَوْضُوعَةٌ | Elegant cups set out in a neat row on a low table, ready for guests; no people |
| ✅ `ch14-believers-and-mosques.png` | `ch14-l04` card 3 | مُؤْمِنُونَ صَالِحُونَ / مَسَاجِدُ كَبِيرَةٌ | Two panels: left, worshippers seen from behind walking to prayer; right, large mosques |
| `ch14-light-and-couches.png` | `ch14-l04` card 4 · `ch14-l05` card 6 | عِبَادٌ مُكْرَمُونَ / سُرُرٌ مَرْفُوعَةٌ | Two panels: left, soft light from above with no figures (angels are never drawn); right, the raised couches |
| `ch14-meaning-first.png` | `ch14-l04` card 5 | الْمَعْنَى أَوَّلًا | One hardworking girl at a desk beside a stack of new books: one person, several things |
| `ch14-girls-and-houses.png` | `ch14-l04` card 6 | الطَّالِبَاتُ الْمُجْتَهِدَاتُ / الْبُيُوتُ الْكَبِيرَةُ | Two panels: left, the hardworking girls; right, the large houses |
| `ch14-cushions-lined-up.png` | `ch14-l04` cards 7, 8 | نَمَارِقُ · مَصْفُوفَةٌ | Cushions lined up neatly in a row along a low seat |
| `ch14-paradise-four-furnishings.png` | `ch14-l06` card 1 | سُرُرٌ مَرْفُوعَةٌ · أَكْوَابٌ مَوْضُوعَةٌ | One garden terrace showing all four together: raised couches, cups set in place, cushions lined up, carpets spread around; no people |
| `ch14-carpets-spread.png` | `ch14-l06` card 4 | زَرَابِيُّ مَبْثُوثَةٌ | Richly patterned carpets spread out across a garden terrace floor |
| `ch14-heavens-folded.png` | `ch14-l06` cards 5, 6, 7 · `ch14-l05` card 7 | السَّمَاوَاتُ مَطْوِيَّاتٌ · سُرُرٌ مَرْفُوعَةٌ / السَّمَاوَاتُ مَطْوِيَّاتٌ | A starry night sky whose edges roll inward like a scroll. No hand, no figure, nothing that pictures Allah |

### Chapter 15

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| ✅ `ch15-pointing-set-recall.png` | `ch15-l01` card 1 | هٰذَا، ذٰلِكَ، هٰؤُلَاءِ | A learner in the foreground pointing at three things: a book nearby, a tree far away, and a small group of people nearby |
| ✅ `ch15-far-group.png` | `ch15-l01` card 2 | أُولٰئِكَ | A learner in the foreground pointing across a wide courtyard at a group of students standing far away |
| `ch15-near-far-group.png` | `ch15-l01` card 3 · `ch15-l05` card 2 | هٰؤُلَاءِ طُلَّابٌ / أُولٰئِكَ طُلَّابٌ | Two panels: left, a learner pointing at a group of students right beside them; right, pointing at the same group far away |
| `ch15-far-group-muslims.png` | `ch15-l01` card 4 | أُولٰئِكَ مُسْلِمُونَ | A group of worshippers far away, seen from behind, walking toward a distant mosque |
| `ch15-far-group-girls.png` | `ch15-l01` card 5 · `ch15-l03` card 6 | أُولٰئِكَ طَالِبَاتٌ · أُولٰئِكَ الطَّالِبَاتُ مُجْتَهِدَاتٌ | A group of girl students far away across a school courtyard |
| `ch15-far-or-earlier.png` | `ch15-l01` card 6 | أُولٰئِكَ | Two panels: left, a group of people far across a field; right, an open book with a ribbon marker pointing back to an earlier page |
| `ch15-guidance-path.png` | `ch15-l01` card 7 · `ch15-l04` card 4 · `ch15-l05` card 5 | أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ | A road at night lit ahead by a row of lanterns (those upon guidance); no figures |
| `ch15-successful-harvest.png` | `ch15-l01` card 8 | وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ | A flourishing field ready for harvest at sunrise: success that grows |
| `ch15-near-students-near-books.png` | `ch15-l02` card 2 | هٰؤُلَاءِ طُلَّابٌ / هٰذِهِ كُتُبٌ | Two panels, both close to the viewer: left, a group of students; right, a stack of books |
| ✅ `ch15-far-students-far-books.png` | `ch15-l02` card 3 | أُولٰئِكَ طُلَّابٌ / تِلْكَ كُتُبٌ | Two panels, both far from the viewer: left, a group of students; right, a stack of books on a distant shelf |
| `ch15-these-books-near.png` | `ch15-l02` card 4 | هٰذِهِ كُتُبٌ جَدِيدَةٌ | A hand pointing at a stack of new books right in front of the viewer |
| ✅ `ch15-those-houses-far.png` | `ch15-l02` card 5 | تِلْكَ بُيُوتٌ | A learner pointing at a row of houses on a far hillside |
| `ch15-near-girls-near-books.png` | `ch15-l02` card 6 | هٰؤُلَاءِ طَالِبَاتٌ / هٰذِهِ كُتُبٌ | Two panels, both close by: left, a group of girl students; right, a stack of books |
| `ch15-guests-doorway.png` | `ch15-l02` card 7 · `ch15-l04` card 3 · `ch15-l05` card 6 | قَالَ إِنَّ هَٰؤُلَاءِ ضَيْفِي | A welcoming doorway at dusk with lantern light and a tray of hospitality. The guests were angels, so no figures |
| `ch15-four-pointers-grid.png` | `ch15-l02` card 8 · `ch15-l05` cards 1, 7 | هٰؤُلَاءِ، أُولٰئِكَ، هٰذِهِ، تِلْكَ · هٰذَا، هٰذِهِ، ذٰلِكَ، تِلْكَ، هٰؤُلَاءِ، أُولٰئِكَ | A 2x2 grid: people near, people far, things near, things far (the same students and the same books in each) |
| `ch15-these-muslims.png` | `ch15-l03` cards 2, 3, 4, 7 · `ch15-l05` card 4 | هٰؤُلَاءِ مُسْلِمُونَ · هٰؤُلَاءِ الْمُسْلِمُونَ | A near group of worshippers seen from behind in a mosque courtyard |
| `ch15-inheritors-garden.png` | `ch15-l03` card 8 · `ch15-l04` card 5 | أُولَٰئِكَ هُمُ الْوَارِثُونَ | An open garden gate onto a lush garden with rivers (the inheritors of Firdaws); no figures |
| `ch15-three-questions.png` | `ch15-l04` card 1 | هٰؤُلَاءِ / أُولٰئِكَ | A magnifying glass over an open Mushaf on a wooden stand, with three small marker tabs on the page; no readable lettering |
| `ch15-kahf-cave.png` | `ch15-l04` card 2 | هَٰؤُلَاءِ قَوْمُنَا | A cave mouth in rocky mountains at dawn; no figures |
| `ch15-quran-or-practice.png` | `ch15-l04` card 6 | هٰؤُلَاءِ طُلَّابٌ | Two panels: left, an open Mushaf on a rahl; right, a student's practice notebook |
| `ch15-near-far-teachers.png` | `ch15-l04` card 7 | هٰؤُلَاءِ مُعَلِّمُونَ / أُولٰئِكَ مُعَلِّمُونَ | Two panels: left, a group of teachers close to the viewer; right, the same group far away |
| `ch15-near-far-books.png` | `ch15-l05` card 3 | هٰذِهِ كُتُبٌ / تِلْكَ كُتُبٌ | Two panels: left, a stack of books right in front; right, the same stack on a far shelf |

### Chapter 16

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch16-known-school-things.png` | `ch16-l01` card 1 | مَدْرَسَةٌ، كِتَابٌ، قَلَمٌ | A school building with a book and a pen in the foreground (the three words already known) |
| `ch16-classroom.png` | `ch16-l01` card 2 · `ch16-l05` card 1 | فَصْلٌ · فَصْلٌ، مَكْتَبٌ، دَفْتَرٌ | An empty, tidy classroom: desks in rows, a board at the front, a window with daylight |
| `ch16-book-on-desk.png` | `ch16-l01` card 5 | الْكِتَابُ عَلَى الْمَكْتَبِ | A book lying on a wooden desk |
| `ch16-pen-on-notebook.png` | `ch16-l01` card 6 | أَيْنَ الْقَلَمُ؟ | A pen lying on a closed notebook on a desk |
| `ch16-room-and-lesson.png` | `ch16-l01` card 7 | فَصْلٌ / دَرْسٌ | Two panels: left, the empty classroom (the room); right, a board with simple diagram shapes and an open book (what is taught) |
| `ch16-one-many-students.png` | `ch16-l02` card 2 | طَالِبٌ / طُلَّابٌ | Two panels: left, one student with a school bag; right, several students together |
| `ch16-teacher-in-classroom.png` | `ch16-l02` card 4 | الْأُسْتَاذُ فِي الْفَصْلِ | A teacher standing at the front of the classroom beside the board |
| `ch16-students-at-school.png` | `ch16-l02` card 5 | الطُّلَّابُ فِي الْمَدْرَسَةِ | Students walking through the gate of a school building |
| `ch16-new-lesson.png` | `ch16-l02` card 6 | الدَّرْسُ جَدِيدٌ | A notebook opened to a fresh page beside a book opened at a new chapter |
| `ch16-teacher-and-students.png` | `ch16-l02` card 7 · `ch16-l05` cards 2, 3 | الْأُسْتَاذُ وَالطُّلَّابُ فِي الْفَصْلِ · أُسْتَاذٌ، طَالِبٌ، دَرْسٌ | A teacher at the front and students at their desks, all in one classroom |
| `ch16-learning-light.png` | `ch16-l02` card 8 | عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ | An open book with soft light rising from its pages (knowledge given); no figures |
| `ch16-yesterday-tomorrow.png` | `ch16-l03` card 4 | أَمْسِ / غَدًا | Two panels: left, a calendar page turned back under a setting sun (yesterday); right, the next page under a rising sun (tomorrow) |
| ✅ `ch16-went-to-school-yesterday.png` | `ch16-l03` card 5 | ذَهَبَ الطَّالِبُ إِلَى الْمَدْرَسَةِ أَمْسِ | A student walking to school, with a torn-off calendar page drifting behind to mark the past |
| `ch16-lesson-today.png` | `ch16-l03` card 6 | الدَّرْسُ الْيَوْمَ | The classroom in full daylight with today's calendar square highlighted on the wall |
| `ch16-lesson-tomorrow.png` | `ch16-l03` card 7 | الدَّرْسُ غَدًا | A school bag and books packed by the door at night, sunrise just showing in the window |
| `ch16-tomorrow-plans.png` | `ch16-l03` card 8 | وَلَا تَقُولَنَّ لِشَيْءٍ إِنِّي فَاعِلٌ ذَٰلِكَ غَدًا | An open planner at night turned to tomorrow's page, the first light of dawn on the horizon |
| `ch16-four-instructions.png` | `ch16-l04` card 1 · `ch16-l05` card 5 | اِفْتَحْ، اِقْرَأْ، اُكْتُبْ، اُنْظُرْ | Four panels: opening a book, reading, writing in a notebook, looking up at the teacher |
| `ch16-open-the-book.png` | `ch16-l04` card 2 | اِفْتَحِ الْكِتَابَ | A student's hands opening a book |
| `ch16-read.png` | `ch16-l04` card 3 | اِقْرَأْ | A student reading an open book aloud |
| `ch16-write-in-notebook.png` | `ch16-l04` card 4 | اُكْتُبْ فِي الدَّفْتَرِ | A student's hand writing in a notebook |
| `ch16-look-at-teacher.png` | `ch16-l04` card 5 | اُنْظُرْ إِلَى الْأُسْتَاذِ | A student looking up from the desk toward the teacher at the board |
| `ch16-open-vs-write.png` | `ch16-l04` card 7 | اِفْتَحْ / اُكْتُبْ | Two panels: left, hands opening a book; right, a hand writing in a notebook |
| `ch16-yes-teacher.png` | `ch16-l04` card 8 | نَعَمْ يَا أُسْتَاذُ | A student raising a hand and answering the teacher |
| `ch16-iqra-cave-light.png` | `ch16-l04` card 9 | اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ | A cave high on a mountain at night with gentle light at its mouth (Hira); no figures |
| `ch16-three-days.png` | `ch16-l05` card 4 | أَمْسِ، الْيَوْمَ، غَدًا | Three panels in a row: sunset (yesterday), midday sun (today), sunrise (tomorrow) |

### Chapter 17

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch17-boy-ate-bread.png` | `ch17-l01` card 3 | أَكَلَ الْوَلَدُ الْخُبْزَ | A boy eating a round flatbread at a table |
| `ch17-boy-drank-water.png` | `ch17-l01` card 5 | شَرِبَ الْوَلَدُ الْمَاءَ | A boy drinking a glass of water |
| `ch17-girl-drank-water.png` | `ch17-l01` card 6 | شَرِبَتِ الْبِنْتُ الْمَاءَ | A girl drinking a glass of water |
| `ch17-wolf-and-shirt.png` | `ch17-l01` card 7 | فَأَكَلَهُ الذِّئْبُ | A wolf in the distance near a desert well at dusk, a torn shirt on the ground. No people (the story is of a prophet) |
| `ch17-river-test.png` | `ch17-l01` card 8 | فَمَن شَرِبَ مِنْهُ فَلَيْسَ مِنِّي | A clear river crossing a dry plain; no people |
| `ch17-student-read-book.png` | `ch17-l02` card 2 | قَرَأَ الطَّالِبُ الْكِتَابَ | A student closing a book they have just finished reading |
| `ch17-instruction-or-report.png` | `ch17-l02` card 3 | اِقْرَأْ / قَرَأَ | Two panels: left, a teacher's open hand gesturing toward a book (an instruction); right, a student closing a finished book (a report of what happened) |
| `ch17-student-wrote-lesson.png` | `ch17-l02` card 5 | كَتَبَ الطَّالِبُ الدَّرْسَ | A student with a notebook full of neat writing, pen set down |
| `ch17-girl-wrote-lesson.png` | `ch17-l02` card 6 | كَتَبَتِ الطَّالِبَةُ الدَّرْسَ | A girl student with a notebook full of neat writing, pen set down |
| `ch17-decreed-scroll.png` | `ch17-l02` card 7 | كَتَبَ اللَّهُ لَأَغْلِبَنَّ أَنَا وَرُسُلِي | A sealed scroll with a ribbon under soft light; no figures |
| `ch17-student-stood-up.png` | `ch17-l03` card 2 | قَامَ الطَّالِبُ | A student standing up from a desk in class |
| `ch17-stood-vs-read.png` | `ch17-l03` card 3 | قَامَ الطَّالِبُ / قَرَأَ الطَّالِبُ الْكِتَابَ | Two panels: left, a student standing up (no object); right, a student reading a book (with an object) |
| `ch17-girl-stood-up.png` | `ch17-l03` card 4 | قَامَتِ الطَّالِبَةُ | A girl student standing up from her desk in class |
| `ch17-boy-stood-went-mosque.png` | `ch17-l03` card 6 | قَامَ الْوَلَدُ وَذَهَبَ إِلَى الْمَسْجِدِ | Two steps in one scene: a boy rising from a floor cushion, then the same boy walking toward a mosque |
| `ch17-standing-in-prayer-night.png` | `ch17-l03` card 7 | وَأَنَّهُ لَمَّا قَامَ عَبْدُ اللَّهِ يَدْعُوهُ | A prayer mat at night under stars with a small lamp's glow. The ayah is about the Prophet (peace be upon him), so no figure |
| `ch17-man-prayed-mosque.png` | `ch17-l04` card 2 | صَلَّى الرَّجُلُ فِي الْمَسْجِدِ | A man praying in a mosque, seen from behind |
| `ch17-he-she-prayed.png` | `ch17-l04` card 3 | صَلَّى / صَلَّتْ | Two panels: left, a man praying; right, a woman in modest dress praying. Both seen from behind |
| `ch17-girl-prayed.png` | `ch17-l04` card 4 | صَلَّتِ الْبِنْتُ | A girl in modest dress praying on a prayer mat, seen from behind |
| `ch17-man-went-vs-to-mosque.png` | `ch17-l04` card 5 | ذَهَبَ الرَّجُلُ / ذَهَبَ الرَّجُلُ إِلَى الْمَسْجِدِ | Two panels: left, a man walking along a road (no destination shown); right, the same man walking up to a mosque |
| `ch17-empty-prayer-mat.png` | `ch17-l04` card 6 | فَلَا صَدَّقَ وَلَا صَلَّىٰ | A rolled prayer mat left unused in a dusty corner |
| `ch17-went-to-family.png` | `ch17-l04` card 7 | ثُمَّ ذَهَبَ إِلَىٰ أَهْلِهِ يَتَمَطَّىٰ | A path leading to a house with lit windows at dusk; no figures |
| `ch17-student-heard-teacher.png` | `ch17-l05` cards 2, 3 · `ch17-l06` card 2 · `ch19-l02` card 6 | سَمِعَ الطَّالِبُ الْأُسْتَاذَ · سَمِعَهُ الطَّالِبُ | A student listening closely while the teacher speaks at the front, small sound-wave lines from teacher to student |
| `ch17-girl-heard-teacher.png` | `ch17-l05` card 4 | سَمِعَتِ الْبِنْتُ الْأُسْتَاذَ | A girl student listening closely while the teacher speaks, small sound-wave lines from teacher to her |
| `ch17-what-did-he-do.png` | `ch17-l05` card 6 | مَاذَا فَعَلَ الطَّالِبُ؟ | A student beside a just-closed book, an empty question bubble above |
| `ch17-heard-plea.png` | `ch17-l05` card 7 · `ch18-l04` card 5 | قَدْ سَمِعَ اللَّهُ قَوْلَ الَّتِي تُجَادِلُكَ فِي زَوْجِهَا | A quiet courtyard doorway with soft sound-wave lines rising upward to the sky; no figures |
| `ch17-seven-actions.png` | `ch17-l06` card 1 | أَكَلَ، شَرِبَ، قَرَأَ، كَتَبَ، قَامَ، صَلَّى، سَمِعَ | Seven small icons in a grid: eating, drinking, reading, writing, standing, praying, hearing |
| ✅ `ch17-object-or-destination.png` | `ch17-l06` card 3 | قَرَأَ الطَّالِبُ الْكِتَابَ / ذَهَبَ الرَّجُلُ إِلَى الْمَسْجِدِ | Two panels: left, a student reading a book (an object); right, a man walking to a mosque (a destination) |
| `ch17-she-drank-she-prayed.png` | `ch17-l06` card 4 | شَرِبَتْ / صَلَّتْ | Two panels: left, a girl drinking water; right, a girl praying |
| `ch17-context-meanings.png` | `ch17-l06` card 5 | كَتَبَ / شَرِبَ / صَلَّى | Three panels: writing in a notebook, drinking water, praying |
| `ch17-balance-scale.png` | `ch17-l06` card 6 | لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ | A simple balance scale in soft light |

### Chapter 18

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch18-whisper-shadow.png` | `ch18-l01` card 2 · `ch18-l02` card 7 · `ch18-l03` card 7 | مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ | A dark wisp of smoke-like shadow slipping back from the light of a lamp. Never draw a devil or creature |
| `ch18-whisper-hearts.png` | `ch18-l01` card 6 · `ch18-l03` card 8 · `ch18-l05` card 7 · `ch18-l06` card 5 | الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ | A lamp-lit room at night with faint drifting wisps; no figures and no creature |
| `ch18-four-jobs.png` | `ch18-l01` card 8 | اسْمٌ، صِفَةٌ، اسْمٌ مَوْصُولٌ، فِعْلٌ | Four tiles: an object (a name), a colour swatch (a describing word), a chain link (a connector), a motion arrow (an action) |
| ✅ `ch18-the-man-who-went.png` | `ch18-l02` card 1 | الرَّجُلُ الَّذِي ذَهَبَ إِلَى الْمَسْجِدِ | Among several men standing in a street, one specific man is highlighted by a soft glow as he walks into a mosque |
| `ch18-a-man-who-went.png` | `ch18-l02` cards 2, 6 | رَجُلٌ ذَهَبَ إِلَى الْمَسْجِدِ · هٰذَا رَجُلٌ ذَهَبَ إِلَى الْمَسْجِدِ | A plain, unhighlighted man walking into a mosque (any man) |
| ✅ `ch18-the-vs-a-man.png` | `ch18-l02` card 3 | الرَّجُلُ الَّذِي ذَهَبَ / رَجُلٌ ذَهَبَ | Two panels: left, the highlighted man walking into the mosque (the man who went); right, the plain man (a man who went) |
| ✅ `ch18-the-girl-who-read.png` | `ch18-l02` card 4 · `ch18-l04` card 1 | الْبِنْتُ الَّتِي قَرَأَتِ الْكِتَابَ | Among several girls, one specific girl is highlighted, holding a book she has finished |
| `ch18-a-girl-who-read.png` | `ch18-l02` card 5 | بِنْتٌ قَرَأَتِ الْكِتَابَ | A plain, unhighlighted girl holding a book she has finished |
| `ch18-big-mosque.png` | `ch18-l03` cards 1, 6 | الْمَسْجِدُ الْكَبِيرُ · الْمَسْجِدُ الْكَبِيرُ / الْمَسْجِدُ كَبِيرٌ | One big mosque with a large dome and a tall minaret |
| `ch18-mosque-in-village.png` | `ch18-l03` card 2 | الْمَسْجِدُ الَّذِي فِي الْقَرْيَةِ | A small mosque set inside a village among houses and trees |
| `ch18-big-vs-village-mosque.png` | `ch18-l03` card 3 | الْمَسْجِدُ الْكَبِيرُ / الْمَسْجِدُ الَّذِي فِي الْقَرْيَةِ | Two panels: left, the big mosque; right, the mosque in the village |
| `ch18-action-or-place.png` | `ch18-l03` card 4 | الَّذِي ذَهَبَ / الَّذِي فِي الْقَرْيَةِ | Two panels: left, a man walking away down a road (an action); right, a mosque inside a village (a place) |
| `ch18-new-book-vs-book-on-desk.png` | `ch18-l03` card 5 | الْكِتَابُ الْجَدِيدُ / الْكِتَابُ الَّذِي عَلَى الْمَكْتَبِ | Two panels: left, a brand-new book; right, an ordinary book lying on a desk |
| `ch18-evil-of-creation.png` | `ch18-l03` card 9 | مِن شَرِّ مَا خَلَقَ | A lantern glowing at the edge of a dark forest at night (refuge from harm); no creatures |
| `ch18-school-in-village.png` | `ch18-l04` card 2 | الْمَدْرَسَةُ الَّتِي فِي الْقَرْيَةِ | A school building inside a village among houses and trees |
| `ch18-mosque-and-school-village.png` | `ch18-l04` card 3 | الْمَسْجِدُ الَّذِي / الْمَدْرَسَةُ الَّتِي | Two panels: left, the mosque in the village; right, the school in the village |
| `ch18-he-who-she-who-went.png` | `ch18-l04` card 4 | الَّذِي ذَهَبَ / الَّتِي ذَهَبَتْ | Two panels: left, a man walking out through a door; right, a woman in modest dress walking out through a door |
| `ch18-girl-stood-hardworking.png` | `ch18-l04` card 6 | الطَّالِبَةُ الَّتِي قَامَتْ مُجْتَهِدَةٌ | In a class of girls, one stands up holding a notebook full of work |
| `ch18-knots-rope.png` | `ch18-l04` cards 7, 8 | وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ · الْعُقَدُ | A rope with several tight knots tied along it; no people |
| `ch18-book-on-desk-new.png` | `ch18-l05` cards 1, 2 | الْكِتَابُ جَدِيدٌ / الْكِتَابُ الَّذِي عَلَى الْمَكْتَبِ جَدِيدٌ · الْكِتَابُ الَّذِي عَلَى الْمَكْتَبِ جَدِيدٌ | A brand-new book lying on a desk, older books nearby |
| ✅ `ch18-man-stood-teacher.png` | `ch18-l05` cards 3, 5 | الرَّجُلُ الَّذِي قَامَ أُسْتَاذٌ · الرَّجُلُ الَّذِي قَامَ | In a room of seated people, one man stands up; he is the teacher, with a book in hand |
| `ch18-girl-went-school-student.png` | `ch18-l05` card 4 | الْبِنْتُ الَّتِي ذَهَبَتْ إِلَى الْمَدْرَسَةِ طَالِبَةٌ | A girl with a school bag walking through a school gate |
| ✅ `ch18-who-stood-question.png` | `ch18-l05` card 6 | مَنِ الرَّجُلُ الَّذِي قَامَ؟ | A seated class with one man standing, an empty question bubble above the room |
| `ch18-refuge-shelter.png` | `ch18-l06` card 1 | قُلْ أَعُوذُ بِرَبِّ النَّاسِ | A sturdy, lit stone shelter at night amid strong wind and blowing leaves; no figures |
| `ch18-king-of-mankind.png` | `ch18-l06` card 4 | مَلِكِ النَّاسِ | A vast, diverse crowd of people seen from behind under a wide dawn sky. Nothing that pictures Allah |
| `ch18-jinn-and-mankind.png` | `ch18-l06` card 6 | مِنَ الْجِنَّةِ وَالنَّاسِ | A flame of smokeless fire on one side and a crowd of people seen from behind on the other; no creature drawn in the flame |
| ✅ `ch18-four-lines-summary.png` | `ch18-l06` card 8 | الرَّجُلُ الَّذِي / رَجُلٌ / الَّتِي / الْكَبِيرُ | Four stacked strips: the highlighted man who went, a plain man, the highlighted girl who went, the big mosque |

### Chapter 19

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch19-lord-of-worlds.png` | `ch19-l01` card 2 | الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ | Earth, planets and stars under a vast sky; no figures |
| `ch19-daybreak.png` | `ch19-l01` card 3 · `ch19-l06` card 4 | قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ | Dawn light splitting the night over dark hills |
| `ch19-subtle-kindness.png` | `ch19-l01` card 5 | إِنَّ رَبِّي لَطِيفٌ لِّمَا يَشَاءُ | A small green seedling growing through a crack in stone, touched by gentle light |
| `ch19-two-checks.png` | `ch19-l01` card 6 · `ch19-l06` card 1 | رَبِّ … / رَبِّي · رَبِّ / رَبِّي / أَيَّدْنَاهُ | A magnifying glass over two cards side by side, one with a small highlighted mark at its end |
| ✅ `ch19-teachers-house-my-house.png` | `ch19-l01` card 7 | بَيْتُ الْأُسْتَاذِ / بَيْتِي | Two panels: left, a teacher standing at the door of his house; right, a learner at the door of their own house, hand on chest (mine) |
| `ch19-after-him.png` | `ch19-l02` card 2 | بَعْدَهُ | Two sets of footprints along a sandy path, the second set following the first |
| `ch19-messengers-succession.png` | `ch19-l02` card 3 | وَقَفَّيْنَا مِن بَعْدِهِ بِالرُّسُلِ | A long road with lanterns lit one after another into the distance. No figures (the ayah is about prophets) |
| `ch19-supported-light.png` | `ch19-l02` card 4 | وَأَيَّدْنَاهُ بِرُوحِ الْقُدُسِ | A beam of soft light descending from above onto an open book; no figures |
| ✅ `ch19-his-book-heard-him.png` | `ch19-l02` card 5 · `ch19-l06` card 2 | كِتَابُهُ / سَمِعَهُ | Two panels: left, a man holding his book; right, a student listening to that man speak |
| `ch19-attached-to.png` | `ch19-l02` card 7 | بَعْدِهِ / أَيَّدْنَاهُ | Two panels: left, a small tag clipped onto a book (attached to a thing); right, the same tag clipped onto a motion arrow (attached to an action) |
| `ch19-darkness-settles.png` | `ch19-l02` card 8 | وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ | Night darkness spreading over a quiet village, the last light fading |
| ✅ `ch19-my-your-his-school.png` | `ch19-l03` card 2 | مَدْرَسَتِي، مَدْرَسَتُكَ، مَدْرَسَتُهُ | Three people each standing proudly at the gate of their own school |
| `ch19-his-village.png` | `ch19-l03` card 3 · `ch19-l06` card 3 | قَرْيَةٌ / قَرْيَتُهُ | A man standing at the gate of his village, looking in |
| ✅ `ch19-woman-his-wife.png` | `ch19-l03` card 4 | امْرَأَةٌ / امْرَأَتُهُ | Two panels: left, a woman in modest dress; right, a husband and wife side by side in modest dress |
| ✅ `ch19-her-village-big.png` | `ch19-l03` card 5 | قَرْيَتُهَا كَبِيرَةٌ | A woman in modest dress on a hill overlooking a large village |
| `ch19-tent-doorway.png` | `ch19-l03` card 6 | وَامْرَأَتُهُ قَائِمَةٌ | A tent doorway in the desert at dusk. The ayah is about Ibrahim's household, so no figures |
| `ch19-envy-wind.png` | `ch19-l03` card 7 | وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ | A lamp shielded from a dark gust of wind (refuge from envy); no figures |
| ✅ `ch19-my-book-her-book.png` | `ch19-l04` card 1 | كِتَابِي / كِتَابُهَا | Two panels: left, a learner holding their own book, hand on chest; right, a girl holding her book |
| ✅ `ch19-my-her-book-on-desk.png` | `ch19-l04` card 2 | كِتَابِي عَلَى الْمَكْتَبِ / كِتَابُهَا عَلَى الْمَكْتَبِ | A desk with two books side by side, one belonging to the learner and one to a girl beside it |
| ✅ `ch19-fatimah-new-book.png` | `ch19-l04` card 3 | فَاطِمَةُ طَالِبَةٌ، كِتَابُهَا جَدِيدٌ | A girl student (Fatimah) proudly holding a brand-new book |
| ✅ `ch19-fatimah-pen-on-desk.png` | `ch19-l04` card 4 | أَيْنَ قَلَمُكِ يَا فَاطِمَةُ؟ | A teacher asking; a girl student pointing to her pen lying on the desk |
| `ch19-maryam-east-place.png` | `ch19-l04` card 6 | وَاذْكُرْ فِي الْكِتَابِ مَرْيَمَ إِذِ انتَبَذَتْ مِنْ أَهْلِهَا | A quiet palm grove to the east at dawn. The ayah is about Maryam, so no figures |
| ✅ `ch19-i-have-vs-my.png` | `ch19-l05` card 1 | لِي كِتَابٌ / كِتَابِي | Two panels: left, a book being handed to the learner (I have); right, the book held close with a blank name label (my book) |
| `ch19-my-religion.png` | `ch19-l05` cards 2, 4 | دِينِي · دِينِي / دِينِ | A prayer mat, an open Mushaf and a tasbih arranged together |
| `ch19-two-paths.png` | `ch19-l05` cards 3, 5 | لَكُمْ دِينُكُمْ وَلِيَ دِينِ · لَكُمْ / دِينُكُمْ | Two separate paths leading in different directions from one point |
| ✅ `ch19-you-have-vs-your.png` | `ch19-l05` card 6 | لَكَ كِتَابٌ / كِتَابُكَ | Two panels: left, a book being handed to a boy (you have); right, the boy holding it with a blank name label (your book) |
| `ch19-falaq-five.png` | `ch19-l06` card 5 | سُورَةُ الْفَلَقِ | Five-panel strip for Al-Falaq: daybreak, a dark forest (what He created), darkness settling, a knotted rope, a lamp shielded from wind |

### ✅ Reused — nothing to draw (wired 2026-09-24)

| Card | Arabic | Existing picture |
|---|---|---|
| `ch16-l01` card 3 | مَكْتَبٌ | `images/words/cmtvrdagw0007585kmi0n032f.jpg` (vocabulary مَكْتَب) |
| `ch16-l01` card 4 | دَفْتَرٌ | `images/words/cmtvrdagz00b3585kpjwkhefn.jpg` (vocabulary دَفْتَر) |
| `ch16-l01` card 8 | الَّذِي عَلَّمَ بِالْقَلَمِ | `images/discover/qalam.webp` |
| `ch16-l02` card 1 | أُسْتَاذٌ | `images/discover/ch12-muallim-teacher.webp` |
| `ch16-l02` card 3 | دَرْسٌ | `images/discover/dars.webp` |
| `ch16-l03` card 1 | أَمْسِ | `images/words/cmtvrdagy004r585kg72v9rgk.jpg` (vocabulary أَمْس) |
| `ch16-l03` card 2 | الْيَوْمَ | `images/words/cmtvrdagy004z585k7v745z75.jpg` (vocabulary الْيَوْم) |
| `ch16-l03` card 3 | غَدًا | `images/discover/ghadan.webp` |
| `ch16-l04` card 6 | قُلْ | `images/words/cmtvrdagz00c9585kg70aqc43.jpg` (vocabulary قُلْ) |
| `ch16-l05` card 6 | الَّذِي عَلَّمَ بِالْقَلَمِ | `images/discover/qalam.webp` |
| `ch17-l01` card 1 | ذَهَبَ الطَّالِبُ | `images/discover/ch05-dhahaba-movement.webp` |
| `ch17-l01` card 2 | أَكَلَ | `images/discover/akala.webp` |
| `ch17-l01` card 4 | شَرِبَ | `images/words/cmtvrdagy008d585kv2qcmzeb.jpg` (vocabulary شَرِبَ) |
| `ch17-l02` card 1 | قَرَأَ | `images/words/cmtvrdagw000o585kf8b0cqo2.jpg` (vocabulary قَرَأَ) |
| `ch17-l02` card 4 | كَتَبَ | `images/words/cmtrh9qrt006g9k5kz05gv8ea.jpg` (vocabulary كَتَبَ) |
| `ch17-l03` card 1 | قَامَ | `images/words/cmtvrdagy008f585kuhahlxr3.jpg` (vocabulary قَامَ) |
| `ch17-l03` card 5 | نَامَ | `images/words/cmtvrdagy008g585kmlozs8xi.jpg` (vocabulary نَامَ) |
| `ch17-l04` card 1 | صَلَّى | `images/discover/salah.webp` |
| `ch17-l05` card 1 | سَمِعَ | `images/words/cmtrh9p46003t9k5k945s39d2.jpg` (vocabulary سَمِعَ) |
| `ch17-l05` card 5 | جَلَسَ | `images/words/cmtvrdagy008e585knua8w153.jpg` (vocabulary جَلَسَ) |
| `ch18-l01` card 1 | الرَّجُلُ الَّذِي ذَهَبَ | `images/discover/ch06-person-connected-action.webp` |
| `ch18-l01` card 3 | الْوَسْوَاسُ | `images/words/cmtvrdagz00cc585kijvkf74m.jpg` (vocabulary وَسْوَاس) |
| `ch18-l01` card 4 | الْخَنَّاسُ | `images/words/cmtvrdagz00cd585kjffbr7ri.jpg` (vocabulary خَنَّاس) |
| `ch18-l01` card 5 | شَرٌّ | `images/words/cmtrh9r45009x9k5k84kkcgx7.jpg` (vocabulary شَرّ) |
| `ch18-l01` card 7 | يُوَسْوِسُ | `images/words/cmtvrdagz00ce585kiwe3usa6.jpg` (vocabulary يُوَسْوِسُ) |
| `ch18-l06` card 2 | أَعُوذُ | `images/words/cmtvrdagy007z585kytk8s5me.jpg` (vocabulary أَعُوذُ) |
| `ch18-l06` card 3 | النَّاسُ | `images/words/cmtrh9nn5001e9k5k66fo226g.jpg` (vocabulary ناس) |
| `ch18-l06` card 7 | الْجِنَّةُ | `images/words/cmtvrdagz00cf585k9ybml61o.jpg` (vocabulary جِنَّة) |
| `ch19-l01` card 1 | كِتَابِي، رَبِّي | `images/discover/ch07-my-objects.webp` |
| `ch19-l01` card 4 | الْفَلَقُ | `images/words/cmtvrdah000cg585k8tafgh6e.jpg` (vocabulary الْفَلَق) |
| `ch19-l02` card 1 | كِتَابُهُ | `images/discover/ch07-his-her-owners.webp` |
| `ch19-l02` card 9 | إِذَا | `images/words/cmtrh9nn4000o9k5kv3iz760g.jpg` (vocabulary إِذا) |
| `ch19-l02` card 10 | وَقَبَ | `images/words/cmtvrdah000ck585k1xplaz0k.jpg` (vocabulary وَقَبَ) |
| `ch19-l03` card 1 | مَدْرَسَةٌ / مَدْرَسَتُهَا | `images/discover/ch07-his-her-owners.webp` |
| `ch19-l03` card 8 | حَسَدَ | `images/words/cmtvrdah000cn585ktylu46kg.jpg` (vocabulary حَسَدَ) |
| `ch19-l04` card 5 | كِتَابُكَ / كِتَابُكِ | `images/discover/ch07-two-listeners.webp` |

## Open — Chapters 20–23 (requested 2026-09-24)

The Chapter 20–23 rebuild adds 158 discover cards. **133 new scenes cover 154 cards**; 4 cards reuse a picture we already have (end of this section). The same rules apply: Quran cards stay symbolic and never show Allah, a prophet, Maryam or an angel; people wear modest dress.

### Chapter 20

**All 42 scenes delivered (marked ✅):** 36 published 2026-09-24, the last six on 2026-09-25.

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| ✅ `ch20-we-our-group.png` | `ch20-l01` card 1 | نَحْنُ / ـنَا | A small group of students standing together, one of them gesturing to the whole group while holding up a shared book: we, and something that is ours |
| ✅ `ch20-my-book-our-book.png` | `ch20-l01` card 2 · `ch20-l07` card 1 | كِتَابِي / كِتَابُنَا | Two panels: left, one learner holding a book to their chest (my book); right, the same book held up together by a group of three learners (our book) |
| ✅ `ch20-our-house.png` | `ch20-l01` card 3 | بَيْتُنَا | A family of four standing together in front of their own house, the father's hand on the gate |
| ✅ `ch20-our-big-school.png` | `ch20-l01` card 4 | مَدْرَسَتُنَا كَبِيرَةٌ | A class of students in front of a large school building, pointing to it proudly: our school |
| ✅ `ch20-forgiveness-dua.png` | `ch20-l01` card 5 | رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا | Several pairs of open hands raised together in supplication under a soft dawn sky; no faces |
| ✅ `ch20-owner-tag.png` | `ch20-l01` card 6 | رَبَّنَا / ذُنُوبَنَا / كِتَابُنَا | A book with a small hanging name tag reading nothing, a magnifying glass over the tag rather than over the book's cover |
| ✅ `ch20-noun-or-action-na.png` | `ch20-l01` card 7 · `ch20-l07` card 5 | رَبَّنَا / سَمِعْنَا | Two panels: left, a group standing around a shared object with a small owner tag (our); right, the same group with a sound wave next to their ears (we heard) |
| ✅ `ch20-group-listeners.png` | `ch20-l02` card 2 | كِتَابُكُمْ | A teacher speaking to a whole seated class of boys and girls, one open book held up towards the group |
| ✅ `ch20-your-houses.png` | `ch20-l02` card 3 | بُيُوتُكُمْ | A row of family houses on a street, a speaker at the front addressing the families standing in their doorways |
| ✅ `ch20-mankind-lord.png` | `ch20-l02` card 4 | يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ | A vast, diverse crowd of people seen from behind under a wide sky at dawn; nothing that pictures Allah |
| ✅ `ch20-created-you.png` | `ch20-l02` card 5 · `ch20-l06` card 7 | رَبَّكُمُ / خَلَقَكُم · اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُم | Two panels: left, a crowd seen from behind under the sky (your Lord); right, a seed growing into a small tree beside the crowd (who created you) |
| ✅ `ch20-your-school-group.png` | `ch20-l02` card 6 | مَدْرَسَتُكُمْ كَبِيرَةٌ | A teacher at a school gate speaking to a class gathered in front of the building |
| ✅ `ch20-speaking-to-group.png` | `ch20-l02` card 7 | أَنْتُمْ / ـكُمْ | A speaker facing a group directly, speech lines pointing towards the whole group |
| ✅ `ch20-they-their-book.png` | `ch20-l03` card 1 | هُمْ / كِتَابُهُمْ | Two panels: left, a group of boys seen at a distance (they); right, the same group sharing one book (their book) |
| ✅ `ch20-their-house.png` | `ch20-l03` card 2 | بَيْتُهُمْ | A viewer pointing out a house across the street where a group of men lives |
| ✅ `ch20-your-vs-their-group.png` | `ch20-l03` card 3 | كِتَابُكُمْ / كِتَابُهُمْ | Two panels: left, a speaker facing a group and handing them a book (your book); right, the speaker pointing at a distant group holding a book (their book) |
| ✅ `ch20-sound-after-kasra.png` | `ch20-l03` card 4 · `ch20-l07` card 4 | رَبُّهُمْ / رَبِّهِمْ · رَبِّهِمْ / بُيُوتِهِنَّ | Two matching tiles with a small curved arrow between them, the second tile marked with a tiny dot below: the same ending, softened |
| ✅ `ch20-reward-believers.png` | `ch20-l03` card 5 · `ch20-l06` card 8 | لَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ | A group of worshippers seen from behind in rows at prayer, a warm light ahead of them; symbolic reward, no angels or faces |
| ✅ `ch20-who-are-they.png` | `ch20-l03` card 6 | أَجْرُهُمْ | A list of good deeds (prayer mat, charity box, open Quran) on the left, with an arrow pointing to a group seen from behind on the right |
| ✅ `ch20-owners-not-thing.png` | `ch20-l03` card 7 · `ch20-l07` card 6 | كِتَابُهُمْ / مَدْرَسَتُهُمْ · مَدْرَسَتُهُمْ / بُيُوتُكُنَّ | A book and a school building, both with the same small group-of-people tag hanging from them |
| ✅ `ch20-students-books-desk.png` | `ch20-l03` card 8 | الطُّلَّابُ فِي الْفَصْلِ، وَكُتُبُهُمْ عَلَى الْمَكْتَبِ | Boys sitting in a classroom, their books piled together on the teacher's desk at the front |
| ✅ `ch20-your-book-women.png` | `ch20-l04` card 2 | كِتَابُكُنَّ | A female teacher handing one book to a group of women students |
| ✅ `ch20-houses-two-groups.png` | `ch20-l04` card 3 | بُيُوتُكُمْ / بُيُوتُكُنَّ | Two panels: the same row of houses; left, a speaker addressing a mixed group; right, addressing a group of women |
| ✅ `ch20-recitation-home.png` | `ch20-l04` card 4 | وَاذْكُرْنَ مَا يُتْلَىٰ فِي بُيُوتِكُنَّ | An open Mushaf on a stand in a quiet family home, soft light through a window; no figures |
| ✅ `ch20-listeners-decide.png` | `ch20-l04` card 5 | بُيُوتُكُنَّ | A house with two speech bubbles in front of it, one directed at a mixed group and one at a group of women |
| ✅ `ch20-women-students-books.png` | `ch20-l04` card 6 | يَا طَالِبَاتُ، أَيْنَ كُتُبُكُنَّ؟ | A female teacher asking a group of women students where their books are; the students pointing at a shelf |
| ✅ `ch20-one-woman-group-women.png` | `ch20-l04` card 7 | كِتَابُكِ / كِتَابُكُنَّ | Two panels: left, a teacher handing a book to one woman; right, handing a book to a group of women |
| ✅ `ch20-their-book-women.png` | `ch20-l05` card 2 | كِتَابُهُنَّ | A group of women students seen from a distance, sharing one book |
| ✅ `ch20-book-owners-change.png` | `ch20-l05` card 3 | كِتَابُهُمْ / كِتَابُهُنَّ | Two panels: the same book held by a group of boys (left) and by a group of women (right) |
| ✅ `ch20-mothers-provision.png` | `ch20-l05` card 4 | وَعَلَى الْمَوْلُودِ لَهُ رِزْقُهُنَّ وَكِسْوَتُهُنَّ بِالْمَعْرُوفِ | A mother nursing a baby wrapped in a blanket beside a basket of food and folded clothes; modest, warm, face turned away |
| ✅ `ch20-mothers-first.png` | `ch20-l05` card 5 | وَالْوَالِدَاتُ … رِزْقُهُنَّ | Three mothers holding babies in modest dress, an arrow pointing from them to a basket of food and folded clothes |
| ✅ `ch20-their-houses-women.png` | `ch20-l05` card 6 | بُيُوتُهُنَّ / فِي بُيُوتِهِنَّ | A row of houses with women in modest dress standing at their doors |
| ✅ `ch20-women-students-new-books.png` | `ch20-l05` card 7 | الطَّالِبَاتُ فِي الْمَدْرَسَةِ، وَكُتُبُهُنَّ جَدِيدَةٌ | Girls in modest dress in a school courtyard holding brand-new books |
| ✅ `ch20-four-groups-grid.png` | `ch20-l05` card 8 | كُتُبُكُمْ / كُتُبُكُنَّ / كُتُبُهُمْ / كُتُبُهُنَّ | A 2×2 grid of groups: a mixed group facing the viewer, a women's group facing the viewer, a mixed group far away, a women's group far away, each with a book |
| ✅ `ch20-three-questions.png` | `ch20-l06` card 1 | بَيْتُهُمْ | Three small tiles in a row: a house (the noun), a group (the owner), a speech arrow pointing toward or away from the group |
| ✅ `ch20-students-their-teacher.png` | `ch20-l06` card 2 | هٰؤُلَاءِ طُلَّابٌ، وَهٰذَا أُسْتَاذُهُمْ | A teacher standing with his class of boys, the viewer pointing at them from a distance |
| ✅ `ch20-students-your-teacher.png` | `ch20-l06` card 3 | يَا طُلَّابُ، هٰذَا أُسْتَاذُكُمْ | A headmaster introducing a teacher to a class, gesturing from the teacher to the students |
| ✅ `ch20-where-your-book-group.png` | `ch20-l06` card 4 | أَيْنَ كِتَابُكُمْ؟ — كِتَابُنَا عَلَى الْمَكْتَبِ | A teacher asking a small group of students; one of the group points to a book on the desk |
| ✅ `ch20-straight-path.png` | `ch20-l06` card 5 | اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ | A straight bright path running through open land toward the horizon at dawn; no figures |
| ✅ `ch20-our-lord-guide-us.png` | `ch20-l06` card 6 | رَبَّنَا / اهْدِنَا | Two panels: left, raised hands in supplication (our Lord); right, the same hands with a straight path ahead (guide us) |
| ✅ `ch20-review-speaking-to.png` | `ch20-l07` card 2 | كِتَابُكَ / كِتَابُكِ / كِتَابُكُمْ / كِتَابُكُنَّ | Four small panels: speaking to one man, one woman, a mixed group, a group of women, a book handed to each |
| ✅ `ch20-review-speaking-about.png` | `ch20-l07` card 3 | كِتَابُهُ / كِتَابُهَا / كِتَابُهُمْ / كِتَابُهُنَّ | Four small panels: pointing at one man, one woman, a mixed group, a group of women in the distance, each with a book |

### Chapter 21

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| ✅ `ch21-journey-start-end.png` | `ch21-l01` card 1 · `ch21-l05` card 1 | مِنْ … إِلَى … | A path drawn from a house on the left to a mosque on the right, a flag at the start and a flag at the end |
| ✅ `ch21-kharaja-leaving.png` | `ch21-l01` card 2 | خَرَجَ | A boy stepping out of the front door of a house onto the street |
| ✅ `ch21-ahmad-leaves-home.png` | `ch21-l01` card 3 | خَرَجَ أَحْمَدُ مِنَ الْبَيْتِ | Ahmad, a boy with a school bag, stepping out of his house door |
| ✅ `ch21-house-to-mosque.png` | `ch21-l01` card 4 | خَرَجَ أَحْمَدُ مِنَ الْبَيْتِ وَذَهَبَ إِلَى الْمَسْجِدِ | A boy walking along a street from his house toward a mosque, footprints behind him |
| ✅ `ch21-from-where.png` | `ch21-l01` card 5 | مِنْ أَيْنَ خَرَجَ أَحْمَدُ؟ | A question mark hovering over the house at the start of a footpath |
| ✅ `ch21-to-where.png` | `ch21-l01` card 6 | إِلَى أَيْنَ ذَهَبَ؟ | A question mark hovering over the mosque at the end of a footpath |
| ✅ `ch21-night-journey.png` | `ch21-l01` card 7 | مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى | Two mosques far apart under a starry night sky — the Kaaba's mosque on one side, the Dome of the Rock on the other — joined by a soft arc of light; no figures |
| ✅ `ch21-fatimah-school-home.png` | `ch21-l01` card 8 | خَرَجَتْ فَاطِمَةُ مِنَ الْمَدْرَسَةِ وَذَهَبَتْ إِلَى الْبَيْتِ | A girl in modest dress walking out of a school gate toward her house |
| ✅ `ch21-four-movements.png` | `ch21-l02` card 1 · `ch21-l05` card 2 | ذَهَبَ، خَرَجَ، دَخَلَ، رَجَعَ | Four panels with the same boy: walking away, stepping out of a door, stepping into a door, walking back home |
| ✅ `ch21-in-or-out.png` | `ch21-l02` card 2 · `ch21-l05` card 3 | دَخَلَ الْمَسْجِدَ / خَرَجَ مِنَ الْمَسْجِدِ | Two panels at the same mosque door: left, a man entering; right, the man leaving |
| ✅ `ch21-went-or-returned.png` | `ch21-l02` card 3 | ذَهَبَ إِلَى الْمَدْرَسَةِ / رَجَعَ إِلَى الْبَيْتِ | Two panels: left, a boy walking toward a school; right, the boy walking back into his own house |
| ✅ `ch21-destination-optional.png` | `ch21-l02` card 4 | ذَهَبَ أَحْمَدُ / ذَهَبَ أَحْمَدُ إِلَى الْمَسْجِدِ | Two panels: left, a boy walking off along a road; right, the same boy walking along the road to a mosque at its end |
| ✅ `ch21-three-movement-story.png` | `ch21-l02` card 5 | خَرَجَ أَحْمَدُ مِنَ الْبَيْتِ وَدَخَلَ الْمَسْجِدَ وَرَجَعَ إِلَى الْبَيْتِ | A three-step strip: boy leaves his house, enters a mosque, walks back home |
| ✅ `ch21-return-to-people.png` | `ch21-l02` card 6 · `ch21-l04` card 7 | فَرَجَعَ مُوسَىٰ إِلَىٰ قَوْمِهِ | A mountain path leading down to a distant tent encampment at dusk; no figures |
| ✅ `ch21-verb-then-place.png` | `ch21-l02` card 7 | مِنْ؟ إِلَى؟ | Three small tiles: an arrow leaving a box, an arrow entering a box, an arrow arriving at a box (no lettering) |
| ✅ `ch21-front-behind.png` | `ch21-l03` card 1 | أَمَامَ / خَلْفَ | Two panels: a mosque in front of a school; the same mosque behind the school |
| ✅ `ch21-between.png` | `ch21-l03` card 2 · `ch21-l03` card 3 · `ch21-l03` card 4 · `ch21-l03` card 5 | بَيْنَ · بَيْنَ الْمَدْرَسَةِ وَالسُّوقِ · الْمَسْجِدُ بَيْنَ الْمَدْرَسَةِ وَالسُّوقِ · أَيْنَ الْمَسْجِدُ؟ | A mosque standing between a school on its left and a market on its right, seen from the street |
| ✅ `ch21-clouds-between.png` | `ch21-l03` card 6 | وَالسَّحَابِ الْمُسَخَّرِ بَيْنَ السَّمَاءِ وَالْأَرْضِ | Clouds floating between a wide sky above and green earth below |
| ✅ `ch21-in-or-between.png` | `ch21-l03` card 7 | فِي الْحَقِيبَةِ / بَيْنَ الْقَلَمِ وَالدَّفْتَرِ | Two panels on a desk: a book inside a school bag; a book lying between a pen and a notebook |
| ✅ `ch21-city-story.png` | `ch21-l04` card 1 | دَخَلَ … خَرَجَ … | An ancient walled city gate in the morning; one path leading in and another leading out; no figures |
| ✅ `ch21-city.png` | `ch21-l04` card 2 | الْمَدِينَةُ | An old city with walls, houses and a busy gate, seen from a hill |
| ✅ `ch21-entered-city.png` | `ch21-l04` card 3 | وَدَخَلَ الْمَدِينَةَ عَلَىٰ حِينِ غَفْلَةٍ مِّنْ أَهْلِهَا | The open gate of an ancient city at midday, a quiet street beyond; no figures |
| ✅ `ch21-left-city.png` | `ch21-l04` card 4 · `ch21-l04` card 5 | فَخَرَجَ مِنْهَا خَائِفًا يَتَرَقَّبُ · مِنْهَا / الْمَدِينَةِ | A lone road leading away from an ancient city at dawn, the gate behind; no figures |
| ✅ `ch21-in-out-city.png` | `ch21-l04` card 6 | دَخَلَ الْمَدِينَةَ / خَرَجَ مِنْهَا | Two panels at the same city gate: arrow going in, arrow going out |
| ✅ `ch21-quran-or-practice.png` | `ch21-l04` card 8 · `ch21-l05` card 6 | فَخَرَجَ مِنْهَا / خَرَجَ أَحْمَدُ مِنَ الْبَيْتِ · فَخَرَجَ مِنْهَا / خَرَجَتْ فَاطِمَةُ | Two panels: left, an open Mushaf with a verse marker; right, a school notebook with a practice sentence written in it |
| ✅ `ch21-market-between.png` | `ch21-l05` card 4 | السُّوقُ بَيْنَ الْمَسْجِدِ وَالْمَدْرَسَةِ | A market with stalls standing between a mosque and a school |
| `ch21-fatimah-house-market.png` | `ch21-l05` card 5 | خَرَجَتْ فَاطِمَةُ مِنَ الْبَيْتِ وَذَهَبَتْ إِلَى السُّوقِ | A girl in modest dress walking from her house toward a busy market |

### Chapter 22

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch22-he-she-said.png` | `ch22-l01` card 1 | قَالَ / قَالَتْ | Two panels: a man speaking with a speech bubble; a woman in modest dress speaking with a speech bubble |
| `ch22-teacher-said.png` | `ch22-l01` card 2 | قَالَ الْأُسْتَاذُ: الْكِتَابُ جَدِيدٌ | A teacher holding up a new book and speaking to the class |
| `ch22-fatimah-student.png` | `ch22-l01` card 3 | قَالَتْ فَاطِمَةُ: أَنَا طَالِبَةٌ | A girl in modest dress introducing herself in a classroom, hand on her chest |
| `ch22-speaker-first.png` | `ch22-l01` card 4 · `ch22-l05` card 2 | قَالَ الطَّالِبُ · قَالَتْ فَاطِمَةُ: … | A speech bubble with an arrow pointing back to the student who is speaking |
| `ch22-prison-two-men.png` | `ch22-l01` card 5 | وَدَخَلَ مَعَهُ السِّجْنَ فَتَيَانِ قَالَ أَحَدُهُمَا | A stone prison corridor with two small lit windows; no figures |
| `ch22-narration-quote.png` | `ch22-l01` card 6 | قَالَ أَحَدُهُمَا إِنِّي أَرَانِي | An open book with a narrator's line on top and a speech bubble opening below it |
| `ch22-two-speakers.png` | `ch22-l01` card 7 | قَالَ أَحَدُهُمَا / وَقَالَ الْآخَرُ | Two separate speech bubbles coming from two sides of a stone room; no figures |
| `ch22-ahmad-my-book.png` | `ch22-l01` card 8 | قَالَ أَحْمَدُ: كِتَابِي عَلَى الْمَكْتَبِ | A boy pointing at his own book on a desk while speaking |
| `ch22-asked.png` | `ch22-l02` card 1 | سَأَلَ | A student raising his hand to ask the teacher a question |
| `ch22-question-words.png` | `ch22-l02` card 2 | هَلْ / أَيْنَ / مَا / مَنْ | Four question-mark cards on a table: a yes/no card, a map pin (where), a box (what), a person silhouette (who) |
| `ch22-student-asks-where-book.png` | `ch22-l02` card 3 | سَأَلَ الطَّالِبُ: أَيْنَ الْكِتَابُ؟ | A student looking around the classroom and asking where the book is |
| `ch22-girl-asks-what.png` | `ch22-l02` card 4 | سَأَلَتِ الطَّالِبَةُ: مَا هٰذَا؟ | A girl in modest dress holding up an object and asking what it is |
| `ch22-said-a-question.png` | `ch22-l02` card 5 · `ch22-l05` card 3 | قَالَ … أَيْنَ …؟ · قَالَ يَا مَرْيَمُ أَنَّىٰ لَكِ هَٰذَا | A speech bubble that contains a large question mark |
| `ch22-provision-in-sanctuary.png` | `ch22-l02` card 6 | قَالَ يَا مَرْيَمُ أَنَّىٰ لَكِ هَٰذَا | A quiet prayer chamber with a small basket of fruit in soft light; no figures |
| `ch22-asking-about-allah.png` | `ch22-l02` card 7 | وَإِذَا سَأَلَكَ عِبَادِي عَنِّي | Open hands raised under a clear night sky full of stars; no figures |
| `ch22-who-asked-what.png` | `ch22-l02` card 8 | مَنْ سَأَلَ؟ مَاذَا سَأَلَ؟ | Two small tiles: a person silhouette with a raised hand, and a question mark |
| `ch22-answered.png` | `ch22-l03` card 1 | أَجَابَ | A student standing to answer the teacher's question |
| `ch22-question-answer-book.png` | `ch22-l03` card 2 | سَأَلَ الْأُسْتَاذُ: أَيْنَ الْكِتَابُ؟ وَأَجَابَ أَحْمَدُ: الْكِتَابُ عَلَى الْمَكْتَبِ | Two panels: a teacher asking; a student pointing to the book on the desk |
| `ch22-answer-fits.png` | `ch22-l03` card 3 · `ch22-l05` card 4 | أَيْنَ؟ مَا؟ مَنْ؟ هَلْ؟ · أَيْنَ؟ مَكَانٌ | Four pairs of cards, each question card matched to the right answer: a map pin to a place, a box to an object, a silhouette to a person, a yes/no card to a tick |
| `ch22-yes-from-facts.png` | `ch22-l03` card 4 | الْكِتَابُ جَدِيدٌ. هَلِ الْكِتَابُ جَدِيدٌ؟ نَعَمْ | A new book on a table with a tick next to it |
| `ch22-maryam-answer.png` | `ch22-l03` card 5 | قَالَ يَا مَرْيَمُ أَنَّىٰ لَكِ هَٰذَا قَالَتْ هُوَ مِنْ عِندِ اللَّهِ | A quiet prayer chamber with a basket of fruit and a light falling on it from above; no figures |
| `ch22-did-you-understand.png` | `ch22-l03` card 6 | هَلْ فَهِمْتَ الدَّرْسَ؟ | A teacher kindly asking a student whether he understood |
| `ch22-yes-understood.png` | `ch22-l03` card 7 | نَعَمْ، فَهِمْتُ الدَّرْسَ | A student nodding with a small light bulb above his head |
| `ch22-once-again-please.png` | `ch22-l03` card 8 | مَرَّةً أُخْرَى، لَوْ سَمَحْتَ | A student politely raising a hand, the teacher pointing back at the board |
| `ch22-did-not-understand.png` | `ch22-l03` card 9 | لَا، لَمْ أَفْهَمْ | A student looking puzzled at the board, a small question mark above him |
| `ch22-four-questions.png` | `ch22-l04` card 1 | مَنْ قَالَ؟ مَاذَا قَالَ؟ | Four icons in a row: speaker, speech bubble, question mark, tick |
| `ch22-teacher-asks-ahmad-book.png` | `ch22-l04` card 2 | سَأَلَ الْأُسْتَاذُ: أَيْنَ كِتَابُكَ يَا أَحْمَدُ؟ | A teacher asking Ahmad about his book; Ahmad's desk is empty |
| `ch22-ahmad-book-home.png` | `ch22-l04` card 3 | أَجَابَ أَحْمَدُ: كِتَابِي فِي الْبَيْتِ | Ahmad answering, with a small thought bubble of his book on a table at home |
| `ch22-teacher-checks.png` | `ch22-l04` card 4 | قَالَ الْأُسْتَاذُ: هَلْ فَهِمْتَ الدَّرْسَ؟ | A teacher checking in with Ahmad at his desk |
| `ch22-ahmad-confirms.png` | `ch22-l04` card 5 | قَالَ أَحْمَدُ: نَعَمْ، فَهِمْتُ الدَّرْسَ | Ahmad smiling and nodding to the teacher |
| `ch22-answer-no-repeat.png` | `ch22-l04` card 6 · `ch22-l05` card 5 | لَا، لَمْ أَفْهَمْ — مَرَّةً أُخْرَى، لَوْ سَمَحْتَ · نَعَمْ، فَهِمْتُ الدَّرْسَ / مَرَّةً أُخْرَى، لَوْ سَمَحْتَ | Two panels: a puzzled student; the same student politely raising a hand |
| `ch22-brothers-recognise.png` | `ch22-l04` card 7 | قَالُوا أَإِنَّكَ لَأَنتَ يُوسُفُ قَالَ أَنَا يُوسُفُ وَهَٰذَا أَخِي | A palace hall with a long carpet leading to an open doorway full of light; no figures |
| `ch22-quran-or-practice.png` | `ch22-l04` card 8 | قَالَ أَنَا يُوسُفُ / قَالَ أَحْمَدُ: نَعَمْ | Two panels: an open Mushaf; a classroom scene drawn in a notebook |
| `ch22-said-asked-answered.png` | `ch22-l05` card 1 | قَالَ / سَأَلَ / أَجَابَ | Three panels: a speech bubble, a question-mark bubble, a reply bubble |
| `ch22-fatimah-asks-mosque.png` | `ch22-l05` card 6 | سَأَلَتْ فَاطِمَةُ: أَيْنَ الْمَسْجِدُ؟ | A girl in modest dress asking a boy on the street where the mosque is; the boy points |

### Chapter 23

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch23-phrase-or-sentence.png` | `ch23-l01` card 1 | هٰذَا الْكِتَابُ / هٰذَا كِتَابُ الطَّالِبِ | Two panels: a finger pointing at a book (this book); the same book with a name label showing whose it is (this is the student's book) |
| `ch23-student-book.png` | `ch23-l01` card 2 | هٰذَا كِتَابُ الطَّالِبِ | A student's book with the student standing beside it |
| `ch23-his-book.png` | `ch23-l01` card 3 | هٰذَا كِتَابُهُ | A man holding up his own book |
| `ch23-what-in-hand.png` | `ch23-l01` card 4 | وَمَا تِلْكَ بِيَمِينِكَ يَا مُوسَىٰ | A shepherd's wooden staff resting in the sand of a quiet valley, soft light from above; no figures |
| `ch23-staff.png` | `ch23-l01` card 5 | قَالَ هِيَ عَصَايَ أَتَوَكَّأُ عَلَيْهَا | A wooden staff leaning against a rock beside a small flock of sheep; no figures |
| `ch23-separate-or-ending.png` | `ch23-l01` card 6 | هِيَ / عَصَايَ | Two tiles: one standing alone; one clipped onto a word card |
| `ch23-whole-exchange.png` | `ch23-l01` card 7 | مَا تِلْكَ؟ — هِيَ عَصَايَ | A question card and an answer card joined by an arrow, a wooden staff drawn on the answer card |
| `ch23-two-links.png` | `ch23-l02` card 1 | الَّذِي / ـهُ | A sentence strip with two arrows: one from 'who' back to a person, one from a small tag to its owner |
| `ch23-brother-went-mosque.png` | `ch23-l02` card 2 | الطَّالِبُ الَّذِي ذَهَبَ إِلَى الْمَسْجِدِ أَخِي | A boy walking into a mosque while his brother points at him from the street |
| `ch23-student-returned-new-book.png` | `ch23-l02` card 3 | هٰذِهِ الطَّالِبَةُ الَّتِي رَجَعَتْ. كِتَابُهَا جَدِيدٌ. | A girl returning to class and showing a brand-new book |
| `ch23-worship-lord.png` | `ch23-l02` card 4 | يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ | A crowd seen from behind praying in rows under an open sky; nothing that pictures Allah |
| `ch23-he-his.png` | `ch23-l02` card 5 · `ch23-l04` card 6 · `ch23-l05` card 5 | هُوَ طَالِبٌ / كِتَابُهُ · هُوَ / ـهُ | Two panels: a boy standing alone (he); the boy holding his book (his book) |
| `ch23-which-link.png` | `ch23-l02` card 6 | مَنِ الْمَوْصُوفُ؟ لِمَنْ هٰذَا؟ | A magnifying glass over two separate arrows in a sentence strip |
| `ch23-scene-questions.png` | `ch23-l03` card 1 | مَنْ؟ مِنْ أَيْنَ؟ إِلَى أَيْنَ؟ | A comic strip frame with small icons around it: a person, a start flag, an end flag, a clock |
| `ch23-yesterday-school-mosque.png` | `ch23-l03` card 2 | أَمْسِ خَرَجَ أَحْمَدُ مِنَ الْمَدْرَسَةِ وَذَهَبَ إِلَى الْمَسْجِدِ | Yesterday's calendar page, and a boy walking from school to a mosque |
| `ch23-mosque-between.png` | `ch23-l03` card 3 | الْمَسْجِدُ بَيْنَ الْمَدْرَسَةِ وَالسُّوقِ | A mosque between a school and a market, drawn as a small map |
| `ch23-teacher-asks-students.png` | `ch23-l03` card 4 | فِي الْمَسْجِدِ سَأَلَ الْأُسْتَاذُ الطُّلَّابَ: هَلْ فَهِمْتُمُ الدَّرْسَ؟ | Inside a mosque, a teacher sitting with a circle of students, asking them a question |
| `ch23-ahmad-understood.png` | `ch23-l03` card 5 | قَالَ أَحْمَدُ: نَعَمْ، فَهِمْتُ الدَّرْسَ | Ahmad in the study circle nodding to the teacher |
| `ch23-after-prayer-home.png` | `ch23-l03` card 6 | وَبَعْدَ الصَّلَاةِ رَجَعَ أَحْمَدُ إِلَى بَيْتِهِ | After prayer, Ahmad walking home from the mosque at sunset |
| `ch23-left-then-said.png` | `ch23-l03` card 7 | فَخَرَجَ مِنْهَا خَائِفًا يَتَرَقَّبُ قَالَ رَبِّ نَجِّنِي | An ancient city gate at dawn with a road leading away, a small light in the sky; no figures |
| `ch23-ayah-one-question.png` | `ch23-l04` card 1 | آيَةٌ وَسُؤَالٌ | An open Mushaf with one small question card placed beside a single verse |
| `ch23-good-in-this-world.png` | `ch23-l04` card 2 | رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً | Open hands in supplication in front of a green, fruitful landscape; no faces |
| `ch23-our-or-us.png` | `ch23-l04` card 3 | رَبَّنَا / آتِنَا | Two panels: raised hands (our Lord); open hands receiving (give us) |
| `ch23-oneness.png` | `ch23-l04` card 5 | قُلْ هُوَ اللَّهُ أَحَدٌ | A single bright point of light in a vast, clear sky; no figures |
| `ch23-book2-page.png` | `ch23-l05` card 1 | هٰذَا كِتَابُهُ · الَّذِي · مِنْ … إِلَى … · قَالَ | A single page with four small icons: a pointing hand, a name tag, a path with two flags, a speech bubble |
| `ch23-our-school-mosque-front.png` | `ch23-l05` card 2 | هٰذِهِ مَدْرَسَتُنَا، وَالْمَسْجِدُ أَمَامَهَا | A school building with a mosque standing in front of it |
| `ch23-fatimah-her-house-market.png` | `ch23-l05` card 3 | خَرَجَتْ فَاطِمَةُ مِنْ بَيْتِهَا وَذَهَبَتْ إِلَى السُّوقِ | A girl in modest dress stepping out of her house toward a market |
| `ch23-where-my-book-sister.png` | `ch23-l05` card 4 | سَأَلَ أَحْمَدُ: أَيْنَ كِتَابِي؟ قَالَتْ أُخْتُهُ: كِتَابُكَ عَلَى الْمَكْتَبِ | A boy searching for his book; his sister points to it on the desk |
| `ch23-our-or-us-review.png` | `ch23-l05` card 6 | رَبَّنَا / آتِنَا | Raised hands in supplication with two small tiles beside them: an owner tag and an arrow pointing to the hands |

### Chapter 24

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch24-house-big-emphasis.png` | `ch24-l01` card 1 · `ch24-l02` card 1 | الْبَيْتُ كَبِيرٌ / إِنَّ الْبَيْتَ كَبِيرٌ | Two panels of the same large house: plain; then the same house with a bold underline and an exclamation mark |
| `ch24-emphasis-underline.png` | `ch24-l01` card 2 | إِنَّ | A single statement card with a bold underline beneath it, nothing else changed |
| `ch24-mosque-near.png` | `ch24-l01` card 3 | إِنَّ الْمَسْجِدَ قَرِيبٌ | A mosque just across the road from a family home, a short path between them |
| `ch24-student-hardworking.png` | `ch24-l01` card 4 | إِنَّ الطَّالِبَ مُجْتَهِدٌ | A boy at his desk working hard on his lesson, books open |
| `ch24-forgiving-merciful.png` | `ch24-l01` card 5 · `ch24-l02` card 5 · `ch24-l06` card 4 | إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ | An open Mushaf on a wooden stand in soft morning light beside a prayer mat; no figures |
| `ch24-inna-word-order.png` | `ch24-l01` card 6 | إِنَّ + الْبَيْتَ + كَبِيرٌ | Three word cards in a row, the first highlighted, arrows showing the order |
| `ch24-noun-fatha.png` | `ch24-l02` card 2 | اسْمُ إِنَّ مَنْصُوبٌ | A word card with a small fatḥa mark glowing above its last letter |
| `ch24-news-damma.png` | `ch24-l02` card 3 | خَبَرُ إِنَّ مَرْفُوعٌ | A word card with a small ḍamma mark on its last letter, unchanged, a check beside it |
| `ch24-teacher-hardworking.png` | `ch24-l02` card 4 | إِنَّ الْمُعَلِّمَ مُجْتَهِدٌ | A teacher busy marking notebooks at a desk after class |
| `ch24-rule-right-way.png` | `ch24-l02` card 6 · `ch24-l06` card 2 | إِنَّ + اسْمٌ مَنْصُوبٌ + خَبَرٌ مَرْفُوعٌ · اسْمُ إِنَّ مَنْصُوبٌ، خَبَرُهَا مَرْفُوعٌ | Two arrows on a board: one pointing to a fatḥa (noun), one to a ḍamma (news); a crossed-out reversed pair below |
| `ch24-inna-plus-na.png` | `ch24-l03` card 1 · `ch24-l05` card 2 | إِنَّ + نَا = إِنَّا · إِنَّا | Two puzzle pieces clicking together into one word tile |
| `ch24-na-three-hosts.png` | `ch24-l03` card 2 | كِتَابُنَا / سَمِعْنَا / إِنَّا | One small ending tile attached to three different cards: a book, an ear (hearing), and an emphasis mark |
| `ch24-arabic-quran.png` | `ch24-l03` card 3 · `ch24-l06` card 5 | إِنَّا جَعَلْنَاهُ قُرْآنًا عَرَبِيًّا | An open Mushaf with Arabic script, soft light across the page; no figures |
| `ch24-who-is-we.png` | `ch24-l03` card 4 | إِنَّا | A vast starry sky over quiet desert dunes; no figures |
| `ch24-we-have-heard.png` | `ch24-l03` card 5 | رَبَّنَا إِنَّنَا سَمِعْنَا | A group of worshippers seen from behind, hands raised in dua under an open sky |
| `ch24-one-question.png` | `ch24-l03` card 6 | إِنَّا أَمْ فِعْلٌ؟ | A magnifying glass over a small ending tile, showing what it is attached to |
| `ch24-three-steps.png` | `ch24-l04` card 1 | إِنَّ ← اسْمٌ ← خَبَرٌ | Three numbered steps on a card: find, mark, read |
| `ch24-school-far.png` | `ch24-l04` card 2 | إِنَّ الْمَدْرَسَةَ بَعِيدَةٌ | A school building far away on a hill, a long road leading to it |
| `ch24-girl-hardworking.png` | `ch24-l04` card 3 | إِنَّ الطَّالِبَةَ مُجْتَهِدَةٌ | A girl in modest dress studying hard at her desk |
| `ch24-book-on-desk.png` | `ch24-l04` card 4 | إِنَّ الْكِتَابَ عَلَى الْمَكْتَبِ | A single book lying on a school desk |
| `ch24-mosque-beautiful.png` | `ch24-l04` card 5 | الْمَسْجِدُ جَمِيلٌ / إِنَّ الْمَسْجِدَ جَمِيلٌ | A beautiful mosque with a dome and minaret; two panels, the second framed with a bold underline |
| `ch24-wrong-answer.png` | `ch24-l04` card 6 | اسْمُ إِنَّ مَنْصُوبٌ، خَبَرُهَا مَرْفُوعٌ | An answer card with its marks swapped, a red cross beside it and the corrected card with a tick |
| `ch24-kawthar-mushaf.png` | `ch24-l05` card 1 | إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ | An open Mushaf at Surah Al-Kawthar, the short surah framed on the page; no figures |
| `ch24-given-you.png` | `ch24-l05` card 3 | أَعْطَيْنَا + كَ | A wrapped gift with a small label tag addressed to you; no figures |
| `ch24-na-two-hosts.png` | `ch24-l05` card 4 · `ch24-l06` card 6 | إِنَّا / أَعْطَيْنَا | One ending tile shown twice: attached to an emphasis card and to an action card |
| `ch24-what-was-given.png` | `ch24-l05` card 5 | الْكَوْثَرَ | A glowing gift parcel with an arrow pointing to it |
| `ch24-who-gives-receives.png` | `ch24-l05` card 6 | مَنْ أَعْطَى؟ مَنْ أَخَذَ؟ | Three labelled boxes linked by arrows: giver, receiver, gift |
| `ch24-pen-new.png` | `ch24-l06` card 1 | الْقَلَمُ جَدِيدٌ / إِنَّ الْقَلَمَ جَدِيدٌ | A brand-new pen; two panels, the second with a bold underline |
| `ch24-pen-small.png` | `ch24-l06` card 3 | إِنَّ الْقَلَمَ صَغِيرٌ | A small pen beside a large ruler for scale |

### Chapter 25

Chapter 25 (لَيْسَ) was corrected and promoted 2026-09-24: 36 discover cards, **24 new scenes**. Same rules: Quran cards stay symbolic, with no figures.

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch25-house-big-not-big.png` | `ch25-l01` card 1 | الْبَيْتُ كَبِيرٌ / لَيْسَ الْبَيْتُ كَبِيرًا | Two panels of one street: left, a big family house; right, the same plot with a small, modest house and a faint outline where the big one stood |
| `ch25-yes-to-no.png` | `ch25-l01` card 2 | لَيْسَ | A simple tick-mark card turning over to show a cross on its back: the same card, now saying no |
| `ch25-mosque-not-far.png` | `ch25-l01` card 3 · `ch25-l05` card 4 | لَيْسَ الْمَسْجِدُ بَعِيدًا · لَيْسَ الْمَسْجِدُ بَعِيدًا، إِنَّ الْمَسْجِدَ قَرِيبٌ | A mosque just across a quiet street from a family home; a short, direct path between them |
| `ch25-book-not-new.png` | `ch25-l01` card 4 · `ch25-l02` card 1 | لَيْسَ الْكِتَابُ جَدِيدًا · الْكِتَابُ جَدِيدٌ / لَيْسَ الْكِتَابُ جَدِيدًا | A well-used old book with worn corners and a faded cover, resting on a desk |
| `ch25-nothing-like-him.png` | `ch25-l01` card 5 · `ch25-l05` card 6 · `ch25-l06` card 5 | لَيْسَ كَمِثْلِهِ شَيْءٌ | A vast clear night sky over an empty desert horizon, with a single soft band of light; no figures, nothing that pictures Allah |
| `ch25-three-tiles-order.png` | `ch25-l01` card 6 | لَيْسَ + الْبَيْتُ + كَبِيرًا | Three blank tiles in a row with arrows between them: a small red 'no' tile, then a house tile, then a size tile |
| `ch25-noun-tag.png` | `ch25-l02` card 2 | اسْمُ لَيْسَ مَرْفُوعٌ | A book with a small ribbon tag on it, the tag marked with a single ḍamma-shaped curl; no letters |
| `ch25-news-bubble.png` | `ch25-l02` card 3 | خَبَرُ لَيْسَ مَنْصُوبٌ | An empty speech bubble beside an old book, the bubble outlined with a slanted fatḥa-shaped stroke; no letters |
| `ch25-pen-not-small.png` | `ch25-l02` card 4 | لَيْسَ الْقَلَمُ صَغِيرًا | A long, full-size pen lying beside a short pencil stub for scale |
| `ch25-two-orders.png` | `ch25-l02` card 5 | لَيْسَ الْبَيْتُ كَبِيرًا / الْبَيْتُ لَيْسَ كَبِيرًا | Two rows of the same three blank tiles (a red 'no' tile, a house tile, a size tile): in the top row the 'no' tile is first, in the bottom row the house tile is first |
| `ch25-three-checks.png` | `ch25-l02` card 6 · `ch25-l06` card 1 | لَيْسَ ← اسْمٌ ← خَبَرٌ · لَيْسَ · لَيْسَتْ · لَيْسُوا | Three small tiles in a row with a tick under each: a red 'no' tile, a tagged book, a speech bubble |
| `ch25-school-not-far.png` | `ch25-l03` cards 1, 3 | الْمَدْرَسَةُ بَعِيدَةٌ / الْمَدْرَسَةُ لَيْسَتْ بَعِيدَةً · بَعِيدَةً | A school building just a short walk from a family home, a child's backpack on the path between them |
| `ch25-feminine-tile.png` | `ch25-l03` card 2 | لَيْسَ ← لَيْسَتْ | Two identical red 'no' tiles side by side; the second has one small extra bead attached to its end |
| `ch25-she-not-teacher.png` | `ch25-l03` card 4 | هِيَ لَيْسَتْ مُعَلِّمَةً | A young girl in modest dress sitting at a classroom desk as a pupil, while the teacher's desk at the front stands empty |
| `ch25-book-not-small.png` | `ch25-l03` card 5 | الْكِتَابُ لَيْسَ صَغِيرًا | A thick, large book standing upright, clearly not small |
| `ch25-joining-link.png` | `ch25-l03` card 6 | لَيْسَتِ الْمَدْرَسَةُ بَعِيدَةً | Two tiles joined by a small curved link, like two train carriages coupled together |
| `ch25-not-teachers.png` | `ch25-l04` cards 1, 3 · `ch25-l06` card 3 | هُمْ مُعَلِّمُونَ / هُمْ لَيْسُوا مُعَلِّمِينَ · مُعَلِّمُونَ ← مُعَلِّمِينَ · هُمْ لَيْسُوا مُعَلِّمِينَ | A group of boys in a classroom sitting at pupils' desks with notebooks, while the teacher's desk at the front stands empty |
| `ch25-group-tile.png` | `ch25-l04` cards 2, 6 · `ch25-l05` card 3 | لَيْسَ ← لَيْسُوا · لَيْسَ · لَيْسَتْ · لَيْسُوا · لَيْسَ · لَيْسَتْ · لَيْسُوا / إِنَّ | Three identical red 'no' tiles: plain, with one small bead, and with a small cluster of beads at the end |
| `ch25-not-students.png` | `ch25-l04` card 4 | هُمْ لَيْسُوا طُلَّابًا | A group of men standing at the front of a classroom beside a board, facing empty pupils' desks |
| `ch25-not-all-alike.png` | `ch25-l04` card 5 · `ch25-l06` card 6 | لَيْسُوا سَوَاءً | A row of oil lamps on a stone ledge, each burning at a different brightness; no figures |
| `ch25-emphasis-or-negation.png` | `ch25-l05` card 1 · `ch25-l06` card 4 | إِنَّ الْبَيْتَ كَبِيرٌ / لَيْسَ الْبَيْتُ كَبِيرًا | Two panels of one big house: left, underlined with a bold stroke; right, the same house behind a soft red 'no' circle |
| `ch25-mirror-endings.png` | `ch25-l05` card 2 | الْبَيْتَ … كَبِيرٌ / الْبَيْتُ … كَبِيرًا | Two rows of blank tiles facing each other across a mirror line: the marks on the second and third tiles swap places between the rows |
| `ch25-forgiving-dawn.png` | `ch25-l05` card 5 | إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ | Soft dawn light spreading over a calm landscape after rain; no figures |
| `ch25-teacher-not-far.png` | `ch25-l06` card 2 | الْمُعَلِّمَةُ لَيْسَتْ بَعِيدَةً | A woman teacher in modest dress standing just beside a pupil's desk, close enough to help |

### Chapters 26–30

Chapters 26–30 were rebuilt in the proposal harvest and promoted 2026-10-02: 133 discover cards, **106 new scenes**. Same rules: Quran cards stay symbolic, no figures; every person is faceless or seen from behind.

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch26-three-chain-links.png` | `ch26-l01` card 1 · `ch26-l01` card 4 · `ch26-l04` card 2 · `ch26-l04` card 3 · `ch26-l04` card 5 · `ch26-l06` card 1 | كِتَابُ الطَّالِبِ · غُرْفَةِ | Three large metal chain links in a row, the middle one lit from both sides; plain parchment background |
| `ch26-teachers-room.png` | `ch26-l01` card 2 | غُرْفَةُ الْأُسْتَاذِ | A tidy teacher's room: desk, bookshelf, a framed certificate; empty chair; no figures |
| `ch26-door-of-teachers-room.png` | `ch26-l01` card 3 | بَابُ غُرْفَةِ الْأُسْتَاذِ | A school corridor: a teacher's room with its wooden door, a small sign-plate on the room and a matching plate on the door, linked by a thin dotted line; no figures |
| `ch26-door-of-imams-house.png` | `ch26-l01` card 5 · `ch27-l01` card 5 | بَابُ بَيْتِ الْإِمَامِ · فِي بَيْتِ الْإِمَامِ | A modest house beside a mosque: the house's front door highlighted, a faceless imam figure in white walking towards it, seen from behind |
| `ch26-school-teacher-name.png` | `ch26-l01` card 6 | اسْمُ مُدَرِّسِ الْمَدْرَسَةِ | A school noticeboard with a teacher's name card pinned to it (blank lines, no letters), school building behind |
| `ch26-pointing-at-door.png` | `ch26-l02` card 1 · `ch26-l02` card 2 · `ch26-l06` card 3 | هَذَا + بَابُ غُرْفَةِ الْأُسْتَاذِ · هَذَا بَابُ … / هَذِهِ غُرْفَةُ … | A hand pointing (index finger only, no face) at a classroom door at the end of a corridor |
| `ch26-imam-house-far.png` | `ch26-l02` card 3 | ذَلِكَ بَيْتُ إِمَامِ الْمَسْجِدِ | Far view across a street: a house next to a mosque minaret, an arrow-like path pointing to the house |
| `ch26-teachers-car-far.png` | `ch26-l02` card 4 | تِلْكَ سَيَّارَةُ مُدَرِّسِ الْمَدْرَسَةِ | A small car parked far away in a school car park, school building behind |
| `ch26-open-mushaf-verses.png` | `ch26-l02` card 5 · `ch26-l03` card 6 · `ch27-l04` card 5 | تِلْكَ آيَاتُ الْكِتَابِ الْحَكِيمِ · تِلْكَ آيَاتُ الْكِتَابِ الْمُبِينِ | An open Mushaf on a wooden stand, a row of softly glowing verse markers across the page; no figures |
| `ch26-door-open.png` | `ch26-l02` card 6 | بَابُ غُرْفَةِ الْأُسْتَاذِ / مَفْتُوحٌ | The teacher's room door standing open, light coming through; no figures |
| `ch26-matching-tags.png` | `ch26-l03` card 1 · `ch26-l03` card 2 | كِتَابُ الطَّالِبِ + الْجَدِيدُ · الصِّفَةُ تَتْبَعُ مَوْصُوفَهَا | Two cards with identical coloured corner tags lying side by side, a thin line joining the matching tags |
| `ch26-new-book-or-new-student.png` | `ch26-l03` card 3 · `ch26-l06` card 2 | الْجَدِيدُ / الْجَدِيدِ | Split panel: left, a shiny brand-new book in the hands of a student seen from behind; right, a new student just arriving at the classroom door, from behind, holding an old book |
| `ch26-big-door-or-big-room.png` | `ch26-l03` card 4 | الْكَبِيرُ / الْكَبِيرَةِ | Split panel: left, a small room with an oversized grand door; right, a vast hall with an ordinary small door |
| `ch26-imams-beautiful-house.png` | `ch26-l03` card 5 | بَيْتُ الْإِمَامِ الْجَمِيلُ | A beautiful small house with a garden and arched windows, a mosque dome behind it |
| `ch26-day-of-judgement-symbolic.png` | `ch26-l04` card 1 | مَالِكِ يَوْمِ الدِّينِ | Symbolic: a vast horizon at dawn with a balanced scale silhouetted against the light; no figures, nothing depicting Allah |
| `ch26-fatiha-opening-page.png` | `ch26-l04` card 4 | لِلَّهِ … مَالِكِ | The opening page of a Mushaf with its ornamented frame, closed lines of text as soft blurred bands; no figures |
| `ch26-book-of-school-teacher.png` | `ch26-l04` card 6 | كِتَابُ أُسْتَاذِ الْمَدْرَسَةِ | A teacher's book lying on a desk in front of a school whiteboard; no figures |
| `ch27-four-prepositions.png` | `ch27-l01` card 1 | فِي · عَلَى · مِنْ · إِلَى | Four small panels: a ball in a box, a ball on a box, a ball rolling away from a box, a ball rolling towards a box |
| `ch27-book-in-bag-on-desk.png` | `ch27-l01` card 2 | فِي / عَلَى | Split panel: a book inside an open school bag; the same book on top of a desk |
| `ch27-out-of-and-to-mosque.png` | `ch27-l01` card 3 | مِنَ / إِلَى | Split panel: a faceless figure, seen from behind, walking out of a mosque door; the same figure walking towards a mosque |
| `ch27-house-kasra.png` | `ch27-l01` card 4 · `ch27-l05` card 2 | فِي الْبَيْتِ · فِي بَيْتٍ · فِي الْبَيْتِ · كَالْأَسَدِ | A small house with a tiny ribbon hanging below its doorstep, the ribbon curled like a kasra; no letters |
| `ch27-isra-two-mosques.png` | `ch27-l01` card 6 | مِنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى | Symbolic night journey: a starry night sky with a line of light arching from the Kaaba's silhouette to the Dome of the Rock's silhouette; no figures |
| `ch27-one-letter-joins.png` | `ch27-l02` card 1 | بِـ · لِـ · كَـ | Three single letter-tiles each snapping onto a longer word-tile like puzzle pieces; no actual letters, plain shapes |
| `ch27-writing-with-pen.png` | `ch27-l02` card 2 | بِالْقَلَمِ | A hand writing with a pen in a notebook; no face |
| `ch27-gift-for-student.png` | `ch27-l02` card 3 | لِلطَّالِبِ · لِلَّهِ | A wrapped book with a gift tag on a student's desk; no figures |
| `ch27-for-student-vs-students-book.png` | `ch27-l02` card 4 | الْكِتَابُ لِلطَّالِبِ / كِتَابُ الطَّالِبِ | Split panel: a book with a gift tag being handed over; the same book already on its owner's desk |
| `ch27-praise-symbolic.png` | `ch27-l02` card 5 | الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ | Symbolic: an open Mushaf at the first page under soft light, prayer beads beside it; no figures |
| `ch27-teacher-by-car.png` | `ch27-l02` card 6 | ذَهَبَ الْأُسْتَاذُ بِالسَّيَّارَةِ | A small car driving along a road towards a school, seen from behind |
| `ch27-asking-about-lesson.png` | `ch27-l03` card 1 | سَأَلَ عَنِ الدَّرْسِ | A raised hand in a classroom, seen from behind the student, the whiteboard full of lesson notes |
| `ch27-girl-asking-about-mosque.png` | `ch27-l03` card 2 | سَأَلَتِ الْبِنْتُ عَنِ الْمَسْجِدِ | A girl in hijab seen from behind pointing towards a mosque in the distance |
| `ch27-brave-like-lion.png` | `ch27-l03` card 3 | كَالْأَسَدِ | A young boy seen from behind standing tall on a hill, his shadow on the ground shaped like a lion |
| `ch27-separate-vs-joined-tiles.png` | `ch27-l03` card 4 · `ch27-l05` card 1 | عَنِ الدَّرْسِ / كَالدَّرْسِ · فِي · عَلَى · مِنْ · إِلَى · عَنْ / بِـ · لِـ · كَـ | Two word-tiles with a gap between them, beside two tiles fused into one |
| `ch27-scattered-moths.png` | `ch27-l03` card 5 | يَوْمَ يَكُونُ النَّاسُ كَالْفَرَاشِ الْمَبْثُوثِ | Symbolic: countless small moths scattered across a dim evening sky; no human figures |
| `ch27-fluffed-wool-mountains.png` | `ch27-l03` card 6 | وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنْفُوشِ | Symbolic: mountain peaks dissolving into soft tufts of coloured wool drifting in the air |
| `ch27-in-it-box.png` | `ch27-l04` card 1 | لَهُ · فِيهِ | An open wooden box with a pen inside it |
| `ch27-his-book-from-him.png` | `ch27-l04` card 2 | كِتَابُهُ / مِنْهُ | Split panel: a book resting by its owner's hand (no face); the same book being handed from that hand to another |
| `ch27-five-directions.png` | `ch27-l04` card 3 | بِهِ · مِنْهُ · إِلَيْهِ · عَلَيْهِ · عَنْهُ | A small cube with five arrows: one pointing into it, one away, one towards, one resting on top, one curving around it |
| `ch27-student-goes-to-teacher.png` | `ch27-l04` card 4 | هَذَا الْأُسْتَاذُ، وَذَهَبَ الطَّالِبُ إِلَيْهِ | A student seen from behind walking towards a teacher standing at the front of a classroom, both faceless |
| `ch27-hands-held-back-symbolic.png` | `ch27-l04` card 6 | فَكَفَّ أَيْدِيَهُمْ عَنْكُمْ | Symbolic: a protective dome of light over a small tent camp in a desert at dusk; no figures |
| `ch28-knew-the-news.png` | `ch28-l01` card 1 | عَلِمَ | A father seen from behind reading a letter by a window |
| `ch28-understood-lesson.png` | `ch28-l01` card 2 | فَهِمَ | A student seen from behind at a desk, a lit light-bulb icon floating over the open notebook |
| `ch28-knew-vs-understood.png` | `ch28-l01` card 3 | عَلِمَ / فَهِمَ | Split panel: a rule written on a card pinned to a board; the same card with its gears visible, turning |
| `ch28-verb-doer-object.png` | `ch28-l01` card 4 · `ch28-l05` card 2 | فَهِمَ + الطَّالِبُ + الدَّرْسَ · حَفِظَ الدَّرْسَ · رَضِيَ عَنْهُ · أَعْطَاهُ كِتَابًا | Three blank tiles in a row: an action arrow tile, a person-silhouette tile, a book tile |
| `ch28-girl-understood.png` | `ch28-l01` card 5 | عَلِمَتْ · فَهِمَتْ | A girl in hijab seen from behind raising her hand happily at a whiteboard |
| `ch28-twelve-springs-symbolic.png` | `ch28-l01` card 6 | قَدْ عَلِمَ كُلُّ أُنَاسٍ مَشْرَبَهُمْ | Symbolic: a large rock in the desert with twelve small streams of water flowing from it; no figures |
| `ch28-memorising-surah.png` | `ch28-l02` card 1 | حَفِظَ | A boy seen from behind sitting cross-legged with a small Mushaf on a wooden stand |
| `ch28-teacher-pleased.png` | `ch28-l02` card 2 | رَضِيَ عَنْ | A teacher seen from behind placing a gold star sticker on a student's notebook |
| `ch28-object-vs-preposition.png` | `ch28-l02` card 3 | حَفِظَ الدَّرْسَ / رَضِيَ عَنِ الدَّرْسِ | Two tiles linked directly vs two tiles linked through a small bridge tile |
| `ch28-girl-memorised.png` | `ch28-l02` card 4 | حَفِظَتْ · رَضِيَتْ | A girl in hijab seen from behind holding a small Mushaf against her chest |
| `ch28-pleased-symbolic.png` | `ch28-l02` card 5 | رَضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ | Symbolic: a green garden with flowing streams under a calm sky; no figures |
| `ch28-guest-came.png` | `ch28-l03` card 1 | أَتَى | A guest seen from behind arriving at an open front door with a small gift box |
| `ch28-command-came-symbolic.png` | `ch28-l03` card 2 · `ch29-l05` card 3 | أَتَى أَمْرُ اللَّهِ | Symbolic: dark clouds parting with a single beam of light reaching the earth; no figures |
| `ch28-giver-receiver-gift.png` | `ch28-l03` card 3 | أَعْطَى + مُعْطٍ + آخِذٌ + عَطِيَّةٌ | Two hands (no faces): one handing a book to the other, a soft arrow showing the direction |
| `ch28-kawthar-river-symbolic.png` | `ch28-l03` card 4 | إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ | Symbolic: a radiant river winding through a garden of light; no figures |
| `ch28-mother-gives-pen.png` | `ch28-l03` card 5 | أَتَتْ · أَعْطَتْ | A mother in hijab seen from behind handing a pen to her daughter |
| `ch28-gathered-books.png` | `ch28-l04` card 1 | جَمَعَ | A neat stack of books being gathered together by two hands on a table |
| `ch28-counting-coins-symbolic.png` | `ch28-l04` card 2 | الَّذِي جَمَعَ مَالًا وَعَدَّدَهُ | A pile of coins and a ledger on a table, one stack being counted; hands only, no faces |
| `ch28-lesson-begins.png` | `ch28-l04` card 3 | بَدَأَ | A whiteboard with the first line just written and a teacher's hand still holding the marker |
| `ch28-clay-symbolic.png` | `ch28-l04` card 4 | وَبَدَأَ خَلْقَ الْإِنْسَانِ مِنْ طِينٍ | Symbolic: a mound of wet clay on the earth under soft morning light; no figures |
| `ch28-girl-gathers-pens.png` | `ch28-l04` card 5 | جَمَعَتْ · بَدَأَتْ | A girl in hijab seen from behind gathering colourful pens into a pencil case |
| `ch28-classroom-sequence.png` | `ch28-l05` card 1 | بَدَأَ الْأُسْتَاذُ الدَّرْسَ، وَفَهِمَ الطُّلَّابُ الْقَاعِدَةَ، وَأَعْطَى الْأُسْتَاذُ الطَّالِبَ الْمُجْتَهِدَ كِتَابًا | Three small panels: a teacher at the whiteboard starting, students raising hands, a teacher handing a book to a student — all faceless or from behind |
| `ch29-noun-first-tile.png` | `ch29-l01` card 1 | الْجُمْلَةُ الِاسْمِيَّةُ | A sentence strip whose first tile is a book icon, followed by a speech-bubble tile |
| `ch29-topic-comment.png` | `ch29-l01` card 2 | مُبْتَدَأٌ + خَبَرٌ | A book with a spotlight on it and a speech bubble beside it describing it (empty bubble) |
| `ch29-he-is-teacher.png` | `ch29-l01` card 3 | هُوَ مُدَرِّسٌ | A teacher seen from behind standing at a whiteboard |
| `ch29-student-in-classroom.png` | `ch29-l01` card 4 | الطَّالِبُ فِي الْفَصْلِ | A student seen from behind sitting in a classroom |
| `ch29-praise-symbolic.png` | `ch29-l01` card 5 | الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ | Symbolic: an open Mushaf at the first page under soft light; no figures |
| `ch29-verb-first-tile.png` | `ch29-l02` card 1 | الْجُمْلَةُ الْفِعْلِيَّةُ | A sentence strip whose first tile is a motion-arrow icon, followed by a person-silhouette tile |
| `ch29-verb-doer-object.png` | `ch29-l02` card 2 | فِعْلٌ + فَاعِلٌ + مَفْعُولٌ | Three tiles: an action arrow, a person silhouette, a notebook |
| `ch29-girl-enters-classroom.png` | `ch29-l02` card 3 | دَخَلَتِ الْبِنْتُ الْفَصْلَ | A girl in hijab seen from behind stepping through a classroom doorway |
| `ch29-joining-wa.png` | `ch29-l02` card 4 · `ch30-l02` card 4 | وَ + جَاءَ · وَ / فَ | A small connector clip joining two sentence strips |
| `ch29-magicians-symbolic.png` | `ch29-l02` card 5 | وَجَاءَ السَّحَرَةُ فِرْعَوْنَ | Symbolic: an ancient Egyptian palace hall with tall columns and scattered staffs and ropes on the floor; no figures |
| `ch29-two-orders.png` | `ch29-l03` card 1 · `ch29-l06` card 1 | ذَهَبَ الطَّالِبُ / الطَّالِبُ ذَهَبَ · اسْمِيَّةٌ · فِعْلِيَّةٌ | Two sentence strips with the same two tiles swapped: action-arrow first vs person first |
| `ch29-sentence-inside-sentence.png` | `ch29-l03` card 2 | الطَّالِبُ / ذَهَبَ إِلَى الْمَدْرَسَةِ | A large speech bubble containing a smaller sentence strip |
| `ch29-skip-opening-word.png` | `ch29-l03` card 3 | قُلْ · وَ · لَا | A sentence strip whose first small tile is greyed out and lifted aside |
| `ch29-oneness-symbolic.png` | `ch29-l03` card 4 | قُلْ هُوَ اللَّهُ أَحَدٌ | Symbolic: a single bright star above a calm, empty desert at night; no figures |
| `ch29-kafirun-symbolic.png` | `ch29-l03` card 5 · `ch29-l05` card 4 · `ch30-l04` card 4 · `ch30-l05` card 2 · `ch33-l01` card 1 · `ch33-l01` card 2 · `ch34-l04` card 5 | لَا أَعْبُدُ مَا تَعْبُدُونَ · وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ | Symbolic: two separate paths diverging across an open plain at sunrise; no figures |
| `ch29-big-house-emphasis.png` | `ch29-l04` card 1 | الْبَيْتُ كَبِيرٌ / إِنَّ الْبَيْتَ كَبِيرٌ | A big house with a bold underline beneath it, as if stressed |
| `ch29-big-house-crossed.png` | `ch29-l04` card 2 | الْبَيْتُ كَبِيرٌ / لَيْسَ الْبَيْتُ كَبِيرًا | A modest house with a faint outline of a bigger house crossed out above it |
| `ch29-which-part-changes.png` | `ch29-l04` card 3 · `ch29-l06` card 2 | إِنَّ: الِاسْمُ ـَ · لَيْسَ: الْخَبَرُ ـً · إِنَّ الْبَيْتَ كَبِيرٌ · لَيْسَ الْبَيْتُ كَبِيرًا | Two sentence strips: in the first the first tile is highlighted, in the second the last tile is highlighted |
| `ch29-forgiving-symbolic.png` | `ch29-l04` card 4 | إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ | Symbolic: gentle rain falling on green fields under a soft sky; no figures |
| `ch29-nothing-like-him-symbolic.png` | `ch29-l04` card 5 | لَيْسَ كَمِثْلِهِ شَيْءٌ | Symbolic: a vast clear night sky over an empty desert horizon with one soft band of light; no figures |
| `ch29-three-steps.png` | `ch29-l05` card 1 | ١ تَجَاوَزْ ٢ انْظُرْ ٣ احْكُمْ | Three numbered blank cards in a row with arrows between them: an eraser, a magnifying glass, a tick |
| `ch29-book-symbolic.png` | `ch29-l05` card 2 · `ch30-l01` card 5 | ذَلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ | An open Mushaf on a wooden stand under soft light; no figures |
| `ch29-doer-noun-vs-verb.png` | `ch29-l05` card 5 | عَابِدُونَ / عَبَدَ | Split panel: an action arrow tile; a name-badge tile on a person silhouette (no face) |
| `ch30-ahmad-family-text.png` | `ch30-l01` card 1 | هَذَا أَحْمَدُ. هُوَ طَالِبٌ. بَيْتُهُ قَرِيبٌ مِنَ الْمَدْرَسَةِ، وَأُخْتُهُ فَاطِمَةُ مُدَرِّسَةٌ فِيهَا. | A school next to a small house; a boy and his older sister in hijab seen from behind walking towards the school |
| `ch30-sentence-breaks.png` | `ch30-l01` card 2 | هَذَا أَحْمَدُ. / هُوَ طَالِبٌ. | A paragraph strip cut into four separate pieces with small scissors |
| `ch30-pronoun-arrows.png` | `ch30-l01` card 3 · `ch30-l07` card 2 · `ch33-l06` card 8 | هُوَ · بَيْتُهُ · أُخْتُهُ ← أَحْمَدُ · مَنْ؟ مَاذَا؟ ثُمَّ مَاذَا؟ | Small tiles with curved arrows all pointing back to one name-badge tile |
| `ch30-teacher-in-school.png` | `ch30-l01` card 4 | فِيهَا ← الْمَدْرَسَةِ | A female teacher in hijab seen from behind at the front of a classroom |
| `ch30-ahmad-day-story.png` | `ch30-l02` card 1 | خَرَجَ أَحْمَدُ مِنَ الْبَيْتِ وَذَهَبَ إِلَى الْمَدْرَسَةِ، فَدَخَلَ الْفَصْلَ وَبَدَأَ الْأُسْتَاذُ الدَّرْسَ. فَهِمَ أَحْمَدُ الدَّرْسَ فَرَجَعَ إِلَى الْبَيْتِ. | Five small comic panels, all faceless/from behind: leaving a house, walking to school, entering a classroom, teacher starting a lesson, walking home |
| `ch30-five-steps.png` | `ch30-l02` card 2 | ١ خَرَجَ ٢ ذَهَبَ ٣ دَخَلَ ٤ بَدَأَ ٥ فَهِمَ … رَجَعَ | Five numbered stepping stones across a stream |
| `ch30-new-doer.png` | `ch30-l02` card 3 | وَبَدَأَ الْأُسْتَاذُ | A relay baton passing from a student's hand to a teacher's hand (hands only) |
| `ch30-dialogue-question.png` | `ch30-l03` card 1 · `ch30-l03` card 5 | أَحْمَدُ: أَيْنَ الْأُسْتَاذُ؟ · أَحْمَدُ: هَلْ خَرَجَ مِنْهُ؟ | Two speech bubbles: one with a question mark, a boy seen from behind beside it |
| `ch30-dialogue-answer-mosque.png` | `ch30-l03` card 2 | زَيْنَبُ: هُوَ فِي الْمَسْجِدِ. | A girl in hijab seen from behind pointing towards a mosque |
| `ch30-dialogue-sorry-where.png` | `ch30-l03` card 3 | أَحْمَدُ: عَفْوًا، أَيْنَ؟ | A boy seen from behind cupping a hand behind his ear |
| `ch30-mosque-near-school.png` | `ch30-l03` card 4 | زَيْنَبُ: فِي الْمَسْجِدِ، قَرِيبٌ مِنَ الْمَدْرَسَةِ. | A mosque next to a school on the same street |
| `ch30-teacher-inside-mosque.png` | `ch30-l03` card 6 | زَيْنَبُ: لَا، هُوَ فِيهِ الْآنَ. | View through an open mosque door: a faceless teacher seated on the carpet inside |
| `ch30-said-asked-answered.png` | `ch30-l03` card 7 | قَالَ · سَأَلَ · أَجَابَ | Three speech bubbles: plain, with a question mark, with a tick |
| `ch30-what-is-this.png` | `ch30-l04` card 1 | مَا هَذَا؟ | A hand (no face) holding up an unfamiliar object with a question-mark tag |
| `ch30-understood-what-said.png` | `ch30-l04` card 2 | فَهِمْتُ مَا قَالَ الْأُسْتَاذُ | A student seen from behind nodding, with a speech bubble from the teacher flowing into the student's notebook |
| `ch30-wrote-what-said.png` | `ch30-l04` card 3 | كَتَبَ الطَّالِبُ مَا قَالَ الْأُسْتَاذُ | A notebook page being filled as a teacher's speech bubble flows into it; hands only |
| `ch30-two-ma.png` | `ch30-l04` card 5 | مَا هَذَا؟ / مَا تَعْبُدُونَ | Split panel: a question-mark tag; a frame around a group of tiles |
| `ch30-kafirun-1.png` | `ch30-l05` card 1 | قُلْ يَا أَيُّهَا الْكَافِرُونَ | Symbolic: an open Mushaf at Surah Al-Kafirun's page under lamp light; no figures |
| `ch30-kafirun-two-sides.png` | `ch30-l05` card 3 · `ch30-l05` card 4 · `ch30-l05` card 5 | وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ · وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ | Symbolic: two separate lamps lit on two sides of a dividing line; no figures |
| `ch30-kafirun-6.png` | `ch30-l05` card 6 · `ch33-l01` card 3 | لَكُمْ دِينُكُمْ وَلِيَ دِينِ | Symbolic: two separate paths across an open plain, each ending at its own lit doorway; no figures |
| `ch30-for-you-your.png` | `ch30-l05` card 7 | لَكُمْ / دِينُكُمْ | Split panel: a gift box with an arrow towards a group; a name tag on a book |
| `ch30-maryam-market.png` | `ch30-l07` card 1 | ذَهَبَتْ مَرْيَمُ إِلَى السُّوقِ مَعَ أُمِّهَا، فَأَعْطَتْهَا أُمُّهَا قَلَمًا جَدِيدًا. وَرَجَعَتْ مَرْيَمُ إِلَى الْبَيْتِ، فَكَتَبَتْ بِهِ الدَّرْسَ. | A girl in hijab and her mother, both seen from behind, at a market stall; then the girl writing with a new pen at home |

### ✅ Chapters 20–23 — reused, nothing to draw (wired 2026-09-24)

| Card | Arabic | Existing picture |
|---|---|---|
| `ch20-l02` card 1 | كِتَابُكَ / كِتَابُكِ | `images/discover/ch07-two-listeners.webp` |
| `ch20-l04` card 1 | أَنْتُمْ / أَنْتُنَّ | `images/discover/ch10-you-all-facing-group.webp` |
| `ch20-l05` card 1 | هُمْ / هُنَّ | `images/discover/ch10-they-two-groups.webp` |
| `ch23-l04` card 4 | قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ | `images/discover/ch19-daybreak.webp` |

### Chapters 31–35

Chapters 31–35 were rebuilt in the proposal harvest (batch 2) and promoted 2026-10-02: 177 discover cards, **128 new scenes**; the rest reuse a scene requested here or for Chapters 29–31. Same rules: Quran cards stay symbolic, no figures — never Allah, prophets, angels, jinn or the devil; every person is faceless or seen from behind.

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch31-statement-or-question.png` | `ch31-l01` card 1 | الْكِتَابُ جَدِيدٌ / هَلِ الْكِتَابُ جَدِيدٌ؟ | Two identical new books side by side; a small question-mark tag hangs over the second one only |
| `ch31-did-ahmad-go.png` | `ch31-l01` card 2 · `ch31-l01` card 7 | هَلْ ذَهَبَ أَحْمَدُ إِلَى الْمَسْجِدِ؟ · أَذَهَبَ الطَّالِبُ؟ | A boy seen from behind walking up the steps of a mosque, a small question-mark bubble above the path |
| `ch31-yes-mosque.png` | `ch31-l01` card 3 | نَعَمْ، ذَهَبَ إِلَى الْمَسْجِدِ. | The same boy, seen from behind, now inside the mosque courtyard; a green tick beside him |
| `ch31-no-market.png` | `ch31-l01` card 4 · `ch34-l03` card 5 | لَا، ذَهَبَ إِلَى السُّوقِ. · تَذْهَبُ فَاطِمَةُ إِلَى السُّوقِ. | A boy seen from behind walking into a market street with fruit stalls; a small cross over a mosque sign-post |
| `ch31-do-you-have-pen.png` | `ch31-l01` card 5 | أَعِنْدَكَ قَلَمٌ؟ | A hand (no face) holding out an empty palm towards a pen lying on a desk, a question-mark tag on the pen |
| `ch31-two-question-keys.png` | `ch31-l01` card 6 | هَلْ عِنْدَكَ قَلَمٌ؟ / أَعِنْدَكَ قَلَمٌ؟ | Two different keys, one long and one tiny, both opening the same small box |
| `ch31-ghashiyah-symbolic.png` | `ch31-l01` card 8 | هَلْ أَتَاكَ حَدِيثُ الْغَاشِيَةِ | Symbolic: a vast dark cloud bank rolling over a wide plain at dusk; no figures |
| `ch31-who-is-this.png` | `ch31-l02` card 1 | مَنْ هَذَا؟ | A man in a white thobe seen from behind at a classroom door; a hand points at him, question-mark tag above |
| `ch31-who-in-class.png` | `ch31-l02` card 2 | مَنْ فِي الْفَصْلِ؟ | A classroom seen through an open door: a teacher's back at the board, empty desks |
| `ch31-what-is-this.png` | `ch31-l02` card 3 | مَا هَذَا؟ | A hand (no face) pointing at a single pen lying on a desk, question-mark tag above it |
| `ch31-person-or-thing.png` | `ch31-l02` card 4 | مَنْ هَذَا؟ / مَا هَذَا؟ | Split panel: a hand pointing at a man seen from behind; a hand pointing at a pen |
| `ch31-what-did-he-do.png` | `ch31-l02` card 5 · `ch33-l04` card 7 | مَاذَا فَعَلَ الطَّالِبُ؟ · الطَّالِبُ كَتَبَ الدَّرْسَ / كَتَبَ الطَّالِبُ الدَّرْسَ | A student seen from behind writing in a notebook at a desk |
| `ch31-zaynab-reading.png` | `ch31-l02` card 6 · `ch34-l05` card 2 | مَاذَا قَرَأَتْ زَيْنَبُ؟ · تَقْرَأُ زَيْنَبُ الْكِتَابَ. | A girl in hijab seen from behind reading a book at a window seat |
| `ch31-two-kinds-of-ma.png` | `ch31-l02` card 7 | مَا هَذَا؟ / قَرَأْتُ مَا كَتَبْتَ | Split panel: a question-mark tag on a closed box; an open notebook passed from one hand to another |
| `ch31-qariah-symbolic.png` | `ch31-l02` card 8 | مَا الْقَارِعَةُ | Symbolic: a great bronze bell struck once, sound rings spreading over an empty plain; no figures |
| `ch31-where-is-book.png` | `ch31-l03` card 1 | أَيْنَ الْكِتَابُ؟ | A book on a shelf inside a small house, a dotted path leading to it from the door |
| `ch31-where-and-from-where.png` | `ch31-l03` card 2 | أَيْنَ أَنْتَ؟ / مِنْ أَيْنَ أَنْتَ؟ | Split panel: a pin on a house; an arrow starting from a distant country outline on a map |
| `ch31-how-are-you.png` | `ch31-l03` card 3 · `ch31-l03` card 4 | كَيْفَ حَالُكَ؟ · كَيْفَ حَالُكَ؟ — بِخَيْرٍ، الْحَمْدُ لِلَّهِ. | Two men seen from behind shaking hands at a mosque gate |
| `ch31-easy-lesson.png` | `ch31-l03` card 5 · `ch34-l05` card 4 | كَيْفَ الدَّرْسُ؟ — الدَّرْسُ سَهْلٌ. · نَفْهَمُهُ الْآنَ. | An open notebook with three short neat lines and a green tick; a light feather resting on it |
| `ch31-by-car-to-school.png` | `ch31-l03` card 6 | كَيْفَ ذَهَبْتَ إِلَى الْمَدْرَسَةِ؟ — بِالسَّيَّارَةِ. | A small car pulling up at a school gate; no figures visible |
| `ch31-place-or-state.png` | `ch31-l03` card 7 | أَيْنَ أَحْمَدُ؟ / كَيْفَ أَحْمَدُ؟ | Split panel: a map pin on a mosque; a small sun-and-smile weather icon (no human face) |
| `ch31-crossroads-symbolic.png` | `ch31-l03` card 8 | فَأَيْنَ تَذْهَبُونَ | Symbolic: an empty crossroads in open country at sunrise, signposts without lettering; no figures |
| `ch31-when-calendar.png` | `ch31-l04` card 1 | مَتَى الدَّرْسُ؟ | A three-page desk calendar: yesterday's page torn off, today's page lit, tomorrow's page peeking |
| `ch31-market-yesterday.png` | `ch31-l04` card 2 | مَتَى ذَهَبَ أَحْمَدُ إِلَى السُّوقِ؟ — أَمْسِ. | A market street at evening light; a calendar page marked with a backward arrow pinned to a stall |
| `ch31-exam-friday.png` | `ch31-l04` card 3 | مَتَى الِامْتِحَانُ؟ — يَوْمَ الْجُمُعَةِ. | An exam paper and a pencil on a desk beside a weekly calendar with one day highlighted |
| `ch31-why-reason.png` | `ch31-l04` card 4 | لِمَاذَا؟ | A question-mark tag tied by a string to a small lit lamp: the reason |
| `ch31-ill-at-home.png` | `ch31-l04` card 5 | لِمَاذَا رَجَعَ أَحْمَدُ إِلَى الْبَيْتِ؟ — لِأَنَّهُ مَرِيضٌ. | A boy seen from behind lying under a blanket on a sofa, a glass of water on the table |
| `ch31-lesson-in-mosque.png` | `ch31-l04` card 6 · `ch33-l04` card 6 | لِمَاذَا ذَهَبْتَ إِلَى الْمَسْجِدِ؟ — لِأَنَّ الدَّرْسَ فِيهِ. · إِذَا جَاءَ الْإِمَامُ بَدَأَ الدَّرْسُ. | Inside a mosque: a low wooden rehal with an open book and a circle of floor cushions; no figures |
| `ch31-time-or-reason.png` | `ch31-l04` card 7 | مَتَى رَجَعَ؟ / لِمَاذَا رَجَعَ؟ | Split panel: a clock; a small lit lamp |
| `ch31-help-near-symbolic.png` | `ch31-l04` card 8 | مَتَىٰ نَصْرُ اللَّهِ | Symbolic: first light breaking over a long dark valley; no figures |
| `ch31-how-many-books.png` | `ch31-l05` card 1 | كَمْ كِتَابًا؟ | A short stack of books on a desk with a small blank counter tag beside it |
| `ch31-three-books.png` | `ch31-l05` card 2 | كَمْ كِتَابًا عِنْدَكَ؟ — ٣. | Exactly three books standing upright on a shelf |
| `ch31-full-classroom.png` | `ch31-l05` card 3 · `ch35-l03` card 2 | كَمْ طَالِبًا فِي الْفَصْلِ؟ — ٢٠. · نَجْلِسُ فِي الْفَصْلِ كُلَّ يَوْمٍ. | A classroom from the back row: many students' backs at their desks, the board ahead |
| `ch31-one-to-count.png` | `ch31-l05` card 4 | كِتَابٌ / كَمْ كِتَابًا؟ | Split panel: one book alone; the same book with a small blank counter tag |
| `ch31-five-pens.png` | `ch31-l05` card 5 | كَمْ قَلَمًا عِنْدَ زَيْنَبَ؟ — ٥. | Five pens fanned out in a girl's hand (hand and sleeve only) |
| `ch31-number-or-time.png` | `ch31-l05` card 6 | كَمْ دَرْسًا؟ / مَتَى الدَّرْسُ؟ | Split panel: two numbered counters; a clock |
| `ch31-years-symbolic.png` | `ch31-l05` card 7 | قَالَ كَمْ لَبِثْتُمْ فِي الْأَرْضِ عَدَدَ سِنِينَ | Symbolic: an hourglass on bare earth with a long line of sunsets fading behind it; no figures |
| `ch31-cave-symbolic.png` | `ch31-l05` card 8 | قَالَ قَائِلٌ مِّنْهُمْ كَمْ لَبِثْتُمْ ۖ قَالُوا لَبِثْنَا يَوْمًا أَوْ بَعْضَ يَوْمٍ | Symbolic: the mouth of a quiet cave with morning light falling across its floor; no figures |
| `ch31-question-answer-cards.png` | `ch31-l07` card 1 | سُؤَالٌ وَجَوَابٌ | Two speech-bubble cards on a table, a dotted line joining a question card to one of three answer cards |
| `ch31-two-boys-mosque-door.png` | `ch31-l07` card 2 · `ch33-l04` card 5 | يُوسُفُ: هَلْ جَاءَ الْأُسْتَاذُ؟ — عُمَرُ: نَعَمْ، جَاءَ قَبْلَ الصَّلَاةِ. · سَأَلَ يُوسُفُ: مَتَى الدَّرْسُ؟ فَقَالَ أَحْمَدُ: بَعْدَ الصَّلَاةِ. | Two boys seen from behind talking at a mosque door |
| `ch31-teacher-in-library.png` | `ch31-l07` card 3 · `ch31-l07` card 4 | يُوسُفُ: أَيْنَ هُوَ الْآنَ؟ — عُمَرُ: فِي الْمَكْتَبَةِ مَعَ الطُّلَّابِ. · يُوسُفُ: كَمْ طَالِبًا مَعَهُ؟ — عُمَرُ: ١٠. | A library with tall shelves: a teacher and a group of students seen from behind at a long table |
| `ch31-friend-visits-ill.png` | `ch31-l07` card 5 | مَرْيَمُ: كَيْفَ حَالُكِ يَا زَيْنَبُ؟ — زَيْنَبُ: أَنَا مَرِيضَةٌ الْيَوْمَ. | A girl in hijab seen from behind bringing a cup of tea to a friend wrapped in a blanket, also seen from behind |
| `ch31-doctor-yesterday.png` | `ch31-l07` card 6 | مَرْيَمُ: مَتَى ذَهَبْتِ إِلَى الطَّبِيبِ؟ — زَيْنَبُ: أَمْسِ. | A clinic door with a stethoscope symbol; a calendar page with a backward arrow pinned beside it |
| `ch31-staff-symbolic.png` | `ch31-l07` card 7 · `ch31-l07` card 8 | وَمَا تِلْكَ بِيَمِينِكَ يَا مُوسَىٰ · قَالَ هِيَ عَصَايَ | Symbolic: a plain wooden shepherd's staff leaning against a rock in a quiet valley; no figures |
| `ch31-question-keys-board.png` | `ch31-l08` card 1 | هَلْ · مَنْ · مَا · مَاذَا · أَيْنَ · كَيْفَ · مَتَى · لِمَاذَا · كَمْ | A wooden board with nine hooks, each holding a different small key; nine small locked boxes below |
| `ch31-two-friends-library.png` | `ch31-l08` card 2 | خَالِدٌ: إِلَى أَيْنَ ذَهَبْتَ أَمْسِ؟ — بِلَالٌ: ذَهَبْتُ إِلَى الْمَكْتَبَةِ. — خَالِدٌ: لِمَاذَا؟ — بِلَالٌ: لِأَنَّ الِامْتِحَانَ غَدًا. | Two young men seen from behind walking past library shelves, one carrying an exam timetable |
| `ch32-darkness-settles-symbolic.png` | `ch32-l01` card 1 · `ch33-l02` card 4 | وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ | Symbolic: night darkness spreading over a quiet village of flat roofs; no figures |
| `ch32-envy-symbolic.png` | `ch32-l01` card 2 · `ch33-l02` card 6 | وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ | Symbolic: a single dark thundercloud casting a shadow across a sunlit garden; no figures |
| `ch32-question-or-event.png` | `ch32-l01` card 3 | مَتَى جَاءَ الْأُسْتَاذُ؟ / إِذَا جَاءَ الْأُسْتَاذُ | Split panel: a question-mark tag on a clock; a door opening onto a classroom with an arrow continuing past it |
| `ch32-teacher-arrives.png` | `ch32-l01` card 4 | إِذَا جَاءَ الْأُسْتَاذُ | A classroom door opening, a teacher seen from behind stepping in |
| `ch32-students-stand.png` | `ch32-l01` card 5 | إِذَا جَاءَ الْأُسْتَاذُ قُمْنَا. | Students seen from behind rising from their desks as a door opens at the front |
| `ch32-mother-yesterday.png` | `ch32-l01` card 6 | مَتَى رَجَعَتْ أُمُّكَ؟ — رَجَعَتْ أَمْسِ. | A woman in an abaya seen from behind at a front door with a suitcase; a calendar page with a backward arrow |
| `ch32-family-dinner.png` | `ch32-l01` card 7 · `ch32-l02` card 2 | مَتَى الدَّرْسُ؟ / إِذَا رَجَعَتْ أُمِّي أَكَلْنَا · إِذَا رَجَعَتْ أُمِّي أَكَلْنَا. | A family dinner table seen from the doorway, a woman in hijab (from behind) putting her bag down as the others sit |
| `ch32-two-dominoes.png` | `ch32-l02` card 1 · `ch32-l02` card 5 · `ch33-l03` card 3 | إِذَا جَاءَ الْأُسْتَاذُ | قُمْنَا · جَوَابُ الشَّرْطِ · إِذَا جَاءَ … وَرَأَيْتَ … | Two dominoes: the first tipping, the second about to fall because of it |
| `ch32-quiet-classroom.png` | `ch32-l02` card 3 | إِذَا جَاءَ الْأُسْتَاذُ سَكَتَ الطُّلَّابُ. | A classroom from the back: students' backs, all still, as a teacher enters at the front door |
| `ch32-rain.png` | `ch32-l02` card 4 | الْمَطَرُ | Rain falling on a street of low houses, puddles forming; no figures |
| `ch32-domino-alone.png` | `ch32-l02` card 6 · `ch32-l04` card 3 | إِذَا جَاءَ الْأُسْتَاذُ قُمْنَا / إِذَا جَاءَ الْأُسْتَاذُ … · إِذَا السَّمَاءُ انْشَقَّتْ … | Split panel: two dominoes, one knocking the other; a single domino standing alone |
| `ch32-sharh-symbolic.png` | `ch32-l02` card 7 · `ch32-l03` card 1 | فَإِذَا فَرَغْتَ فَانصَبْ | Symbolic: a finished day's work — a closed ledger and a lamp being lit for the night's prayer mat; no figures |
| `ch32-first-link.png` | `ch32-l03` card 2 | فَإِذَا | A chain: a new link being clipped onto the end of an existing chain |
| `ch32-second-link.png` | `ch32-l03` card 3 | فَانْصَبْ | A signpost reading only an arrow, placed at the start of a second path segment |
| `ch32-happy-student.png` | `ch32-l03` card 4 | إِذَا فَهِمَ الطَّالِبُ الدَّرْسَ فَهُوَ سَعِيدٌ. | A student seen from behind raising both arms over a finished notebook with a green tick |
| `ch32-ready-class.png` | `ch32-l03` card 5 · `ch32-l03` card 6 | إِذَا جَاءَ الْأُسْتَاذُ قُمْنَا / إِذَا جَاءَ الْأُسْتَاذُ فَنَحْنُ جَاهِزُونَ · فَإِذَا جَاءَ الْأُسْتَاذُ فَنَحْنُ جَاهِزُونَ. | Split panel: students rising from desks; the same students seated with books open and pens ready |
| `ch32-path-to-light-symbolic.png` | `ch32-l03` card 7 | وَإِلَىٰ رَبِّكَ فَارْغَب | Symbolic: a single path climbing a hill towards a bright horizon; no figures |
| `ch32-sky-splits-symbolic.png` | `ch32-l04` card 1 | إِذَا السَّمَاءُ انشَقَّتْ | Symbolic: a vast sky with a single bright seam of light opening across the clouds; no figures |
| `ch32-noun-then-action.png` | `ch32-l04` card 2 | إِذَا السَّمَاءُ انْشَقَّتْ | Two tiles in a row: a sky tile, then a lightning-crack tile |
| `ch32-sun-wrapped-symbolic.png` | `ch32-l04` card 4 | إِذَا الشَّمْسُ كُوِّرَتْ | Symbolic: the sun dimming behind a slowly closing veil of dark cloud; no figures |
| `ch32-sunrise-school.png` | `ch32-l04` card 5 · `ch32-l04` card 6 | إِذَا طَلَعَتِ الشَّمْسُ خَرَجْنَا / إِذَا طَلَعَتِ الشَّمْسُ … · إِذَا طَلَعَتِ الشَّمْسُ خَرَجْنَا إِلَى الْمَدْرَسَةِ. | Split panel: sunrise over houses with a school bag by the door; the same sunrise with the door still closed |
| `ch32-three-step-check.png` | `ch32-l05` card 1 · `ch33-l05` card 1 | إِذَا … | … · سُورَةٌ · جُمْلَةٌ · سُؤَالٌ · إِذَا | A small checklist card with three empty boxes and a pencil; no lettering |
| `ch32-ramadan-crescent.png` | `ch32-l05` card 2 | إِذَا جَاءَ رَمَضَانُ فَرِحَ النَّاسُ. | A thin crescent moon over a street hung with lanterns; no figures |
| `ch32-children-rain.png` | `ch32-l05` card 3 | الْأَوْلَادُ | Children seen from behind running home under umbrellas in the rain |
| `ch33-reading-lamp.png` | `ch33-l01` card 4 | مَنْ؟ مَاذَا؟ لِمَنْ؟ | An open book under a reading lamp, a pencil resting beside three short underlined lines |
| `ch33-imam-books.png` | `ch33-l01` card 5 | قَالَ الْإِمَامُ لِلطُّلَّابِ: لَكُمْ كُتُبُكُمْ، وَلِي كِتَابِي. | An imam in white seen from behind handing a stack of books to students, keeping one book under his arm |
| `ch33-falaq-daybreak-symbolic.png` | `ch33-l02` card 1 · `ch33-l02` card 2 | قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ | Symbolic: the first thin line of dawn breaking over dark hills; no figures |
| `ch33-shelter-symbolic.png` | `ch33-l02` card 3 · `ch33-l02` card 7 | مِن شَرِّ مَا خَلَقَ · مِنْ شَرِّ … وَمِنْ شَرِّ … وَمِنْ شَرِّ … | Symbolic: a strong stone shelter with a lit doorway on a stormy plain; no figures |
| `ch33-knots-symbolic.png` | `ch33-l02` card 5 | وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ | Symbolic: a length of rough cord tied in several knots, lying on a dark cloth; no figures |
| `ch33-nasr-gates-symbolic.png` | `ch33-l03` card 1 · `ch33-l03` card 5 | إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ · إِذَا جَاءَ … فَسَبِّحْ | Symbolic: great city gates standing open at sunrise, banners of light above them; no figures |
| `ch33-nasr-crowds-symbolic.png` | `ch33-l03` card 2 | وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا | Symbolic: many paths from every direction converging on one lit gateway; no figures |
| `ch33-nasr-prayer-mat-symbolic.png` | `ch33-l03` card 4 | فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا | Symbolic: a prayer mat laid out on a rooftop at dusk with prayer beads beside it; no figures |
| `ch33-nas-dawn-city-symbolic.png` | `ch33-l06` card 1 · `ch33-l06` card 2 · `ch33-l06` card 3 | قُلْ أَعُوذُ بِرَبِّ النَّاسِ · مَلِكِ النَّاسِ · إِلَٰهِ النَّاسِ | Symbolic: a sleeping city under a wide sky just before dawn, a single lamp lit in a window; no figures |
| `ch33-three-lamps-one-flame.png` | `ch33-l06` card 4 | رَبِّ النَّاسِ · مَلِكِ النَّاسِ · إِلَٰهِ النَّاسِ | Three lamps in a row lit from one single flame passed along a taper; no figures |
| `ch33-whisper-shadow-symbolic.png` | `ch33-l06` card 5 · `ch33-l06` card 6 · `ch33-l06` card 7 | مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ · الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ · مِنَ الْجِنَّةِ وَالنَّاسِ | Symbolic: a thin wisp of shadow slipping back behind a lit doorway; no figure, no creature |
| `ch33-two-boys-to-mosque.png` | `ch33-l04` card 1 | ذَهَبَ أَحْمَدُ وَيُوسُفُ إِلَى الْمَسْجِدِ. إِنَّ الْمَسْجِدَ قَرِيبٌ، وَلَيْسَ الطَّرِيقُ طَوِيلًا. سَأَلَ يُوسُفُ: مَتَى الدَّرْسُ؟ فَقَالَ أَحْمَدُ: بَعْدَ الصَّلَاةِ. إِذَا جَاءَ الْإِمَامُ بَدَأَ الدَّرْسُ. | Two boys seen from behind walking a short road to a nearby mosque; an imam in white approaching from the other side |
| `ch33-what-wa-joins.png` | `ch33-l04` card 2 | أَحْمَدُ وَيُوسُفُ / قَرِيبٌ، وَلَيْسَ الطَّرِيقُ طَوِيلًا | Split panel: a clip joining two name badges; a clip joining two full sentence strips |
| `ch33-mosque-near.png` | `ch33-l04` card 3 | إِنَّ الْمَسْجِدَ قَرِيبٌ | A small mosque just across a quiet lane from a row of houses |
| `ch33-short-road.png` | `ch33-l04` card 4 | لَيْسَ الطَّرِيقُ طَوِيلًا | A short straight lane, only a few steps long, ending at a mosque door |
| `ch33-asr-hourglass-symbolic.png` | `ch33-l04` card 8 | إِنَّ الْإِنسَانَ لَفِي خُسْرٍ | Symbolic: an hourglass with its sand nearly run out, late afternoon light; no figures |
| `ch33-friday-mosque.png` | `ch33-l05` card 2 · `ch34-l05` card 6 | إِذَا جَاءَ يَوْمُ الْجُمُعَةِ ذَهَبْنَا إِلَى الْمَسْجِدِ. إِنَّ الْمَسْجِدَ كَبِيرٌ، وَلَيْسَ بَعِيدًا. سَأَلَنِي أَخِي: كَمْ رَجُلًا فِيهِ؟ قُلْتُ: ١٠٠. · نَجْلِسُ فِي الْمَسْجِدِ يَوْمَ الْجُمُعَةِ. | A large mosque a short walk from a row of houses on a Friday morning, two brothers seen from behind on the path |
| `ch34-done-or-doing.png` | `ch34-l01` card 1 | كَتَبَ / يَكْتُبُ | Split panel: a closed notebook with a finished page and a capped pen; an open notebook with a pen mid-line (hand only) |
| `ch34-writing-now.png` | `ch34-l01` card 2 · `ch34-l05` card 1 | يَكْتُبُ أَحْمَدُ الدَّرْسَ الْآنَ. · يَكْتُبُ أَحْمَدُ الدَّرْسَ | A boy seen from behind writing at a desk, a wall clock above him |
| `ch34-every-day-mosque.png` | `ch34-l01` card 3 | يَذْهَبُ أَحْمَدُ إِلَى الْمَسْجِدِ كُلَّ يَوْمٍ. | A row of seven small panels of the same path to a mosque at the same hour; a boy seen from behind on each |
| `ch34-reading-pair.png` | `ch34-l01` card 4 | قَرَأَ / يَقْرَأُ | Split panel: a closed book on a shelf; the same book open in a reader's hands (hands only) |
| `ch34-clock-and-calendar.png` | `ch34-l01` card 5 · `ch34-l05` card 5 | الْمُضَارِعُ · يَقْرَأُ الْقُرْآنَ الْآنَ / يَقْرَأُ الْقُرْآنَ كُلَّ يَوْمٍ | A clock beside a weekly calendar with every day ticked |
| `ch34-fatiha-symbolic.png` | `ch34-l01` card 6 | إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ | Symbolic: an open Mushaf on a stand beside a prayer mat in soft morning light; no figures |
| `ch34-hear-see-symbolic.png` | `ch34-l01` card 7 | إِنَّنِي مَعَكُمَا أَسْمَعُ وَأَرَىٰ | Symbolic: a wide desert at night under a sky full of stars, a single path lit; no figures |
| `ch34-went-goes.png` | `ch34-l03` card 1 | ذَهَبَ ← يَذْهَبُ | Split panel: footprints leading away from a door; the same feet mid-step on a path (feet only) |
| `ch34-four-prefix-tiles.png` | `ch34-l03` card 2 · `ch34-l03` card 4 · `ch34-l06` card 1 · `ch35-l01` card 3 | أَذْهَبُ · نَذْهَبُ · يَذْهَبُ · تَذْهَبُ · أَجْلِسُ · نَجْلِسُ · يَجْلِسُ · تَجْلِسُ · أَكْتُبُ · نَكْتُبُ · يَكْتُبُ · تَكْتُبُ · سَأَكْتُبُ · سَنَكْتُبُ · سَيَكْتُبُ · سَتَكْتُبُ | Four small square tiles in a row, each a different colour, in front of the same verb strip |
| `ch34-sat-sits.png` | `ch34-l03` card 3 | جَلَسَ ← يَجْلِسُ | Split panel: an empty chair with a cushion still pressed; a student seen from behind sitting down |
| `ch34-where-do-you-sit.png` | `ch34-l03` card 6 | يَا عُمَرُ، أَيْنَ تَجْلِسُ؟ | A classroom with one empty desk highlighted; a boy seen from behind standing beside it |
| `ch34-knowledge-symbolic.png` | `ch34-l03` card 7 · `ch34-l05` card 7 | وَاللَّهُ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ · يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ | Symbolic: a lamp shining over a closed book, light spreading beyond it into the dark; no figures |
| `ch34-not-going.png` | `ch34-l04` card 1 | لَا أَذْهَبُ | A pair of shoes left neatly at a doorstep, the door closed |
| `ch34-pen-capped.png` | `ch34-l04` card 2 | يَكْتُبُ أَحْمَدُ / لَا يَكْتُبُ أَحْمَدُ | Split panel: a pen writing on paper (hand only); the same pen capped and set aside |
| `ch34-empty-bench.png` | `ch34-l04` card 3 · `ch35-l05` card 4 | لَا نَجْلِسُ هُنَا. · لَنْ نَجْلِسَ هُنَا. | An empty bench beside a path, a group seen from behind walking past it |
| `ch34-zaynab-home.png` | `ch34-l04` card 4 | لَا تَذْهَبُ زَيْنَبُ إِلَى السُّوقِ. | A girl in hijab seen from behind reading at home by a window, the market visible far off |
| `ch34-do-not-sit.png` | `ch34-l04` card 6 · `ch34-l04` card 7 | لَا تَجْلِسْ هُنَا! · لَا تَجْلِسُ زَيْنَبُ هُنَا / لَا تَجْلِسْ هُنَا! | A chair with a small 'reserved' ribbon across its seat (no lettering) |
| `ch34-cave-calm-symbolic.png` | `ch34-l04` card 8 | لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا | Symbolic: the calm interior of a mountain cave at night with moonlight at its mouth; no figures |
| `ch34-listening.png` | `ch34-l05` card 3 | يَسْمَعُهُ | A student seen from behind turned towards a teacher (also from behind) speaking at the front |
| `ch34-teacher-at-school.png` | `ch34-l06` card 2 | يَا خَالِدُ، أَيْنَ تَعْمَلُ؟ — أَعْمَلُ فِي الْمَدْرَسَةِ، وَلَا أَعْمَلُ يَوْمَ الْجُمُعَةِ. | A man seen from behind unlocking a school gate in the morning; a weekly calendar with Friday marked off |
| `ch35-path-ahead.png` | `ch35-l01` card 1 | يَذْهَبُ / سَيَذْهَبُ | A path seen from behind a walker's feet, the road ahead lit by morning sun |
| `ch35-tomorrow-mosque.png` | `ch35-l01` card 2 · `ch35-l06` card 2 | سَيَذْهَبُ أَحْمَدُ إِلَى الْمَسْجِدِ غَدًا. · غَدًا سَنَذْهَبُ إِلَى الْمَسْجِدِ، وَسَوْفَ نَجْلِسُ مَعَ الْإِمَامِ. لَنْ نَذْهَبَ إِلَى السُّوقِ. | A calendar page with a forward arrow pinned beside a mosque door; no figures |
| `ch35-sit-with-imam.png` | `ch35-l01` card 4 · `ch35-l03` card 3 | سَنَجْلِسُ مَعَ الْإِمَامِ. · سَنَجْلِسُ فِي الْمَسْجِدِ يَوْمَ الْجُمُعَةِ. | A circle of floor cushions around an empty spot where an imam's cushion waits, in a quiet mosque |
| `ch35-speech-bubble-arrow.png` | `ch35-l01` card 5 | يَقُولُ / سَيَقُولُ | A blank speech bubble with a small forward arrow beside it |
| `ch35-qiblah-symbolic.png` | `ch35-l01` card 6 · `ch35-l03` card 5 | سَيَقُولُ السُّفَهَاءُ مِنَ النَّاسِ | Symbolic: a compass rose on an old map turning towards a single lit point; no figures |
| `ch35-joined-or-separate.png` | `ch35-l02` card 1 | سَيَذْهَبُ / سَوْفَ يَذْهَبُ | Split panel: a small tag clipped onto a box; the same tag standing on its own just in front of the box |
| `ch35-book-tomorrow.png` | `ch35-l02` card 2 · `ch35-l04` card 3 | سَوْفَ نَقْرَأُ الْكِتَابَ. · سَيَقْرَأُ أَحْمَدُ الْكِتَابَ غَدًا. | A closed book on a desk with a bookmark, a calendar showing the next day |
| `ch35-letter-and-pen.png` | `ch35-l02` card 3 | سَوْفَ تَكْتُبُ زَيْنَبُ الرِّسَالَةَ. | A blank letter sheet and an envelope beside a pen, waiting on a desk |
| `ch35-road-markers.png` | `ch35-l02` card 4 | سَـ / سَوْفَ | A long straight road with several mile-stones fading into the distance; no lettering |
| `ch35-takathur-symbolic.png` | `ch35-l02` card 5 | كَلَّا سَوْفَ تَعْلَمُونَ | Symbolic: an hourglass beside a pile of coins with the sand nearly run out; no figures |
| `ch35-new-dawn-symbolic.png` | `ch35-l02` card 6 | فَسَوْفَ يَأْتِي اللَّهُ بِقَوْمٍ يُحِبُّهُمْ وَيُحِبُّونَهُ | Symbolic: many small lamps lighting up one by one across a dark valley; no figures |
| `ch35-now-later.png` | `ch35-l03` card 1 | يَقْرَأُ أَحْمَدُ الْآنَ / سَيَقْرَأُ أَحْمَدُ غَدًا | Split panel: a boy seen from behind reading at a desk under a clock; the same desk empty with a calendar page for the next day |
| `ch35-duha-symbolic.png` | `ch35-l03` card 4 | وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ | Symbolic: bright late-morning sunlight pouring over a green valley; no figures |
| `ch35-four-times.png` | `ch35-l04` card 1 · `ch35-l06` card 1 | قَرَأَ · يَقْرَأُ · سَيَقْرَأُ · اقْرَأْ · سَـ · سَوْفَ · لَنْ | Four panels of the same book: closed on a shelf, open in hands, waiting with a calendar arrow, and handed over by a pointing hand |
| `ch35-book-on-shelf.png` | `ch35-l04` card 2 | قَرَأَ أَحْمَدُ الْكِتَابَ أَمْسِ. | A finished book back on a shelf, bookmark at the last page |
| `ch35-hand-offers-book.png` | `ch35-l04` card 4 · `ch35-l04` card 5 | اقْرَأِ الْكِتَابَ يَا أَحْمَدُ! · سَتَقْرَأُ الْكِتَابَ / اقْرَأِ الْكِتَابَ! | A hand (no face) holding out an open book towards the viewer |
| `ch35-alaq-symbolic.png` | `ch35-l04` card 6 | اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ | Symbolic: a mountain cave mouth at night with a single beam of light falling on an open page; no figures |
| `ch35-closed-gate.png` | `ch35-l05` card 1 · `ch35-l05` card 3 | لَنْ يَذْهَبَ · لَا يَذْهَبُ / لَنْ يَذْهَبَ | A closed garden gate at the end of a path, with a calendar page and a forward arrow hung on it |
| `ch35-open-or-closed-gate.png` | `ch35-l05` card 2 | سَيَذْهَبُ / لَنْ يَذْهَبَ | Split panel: the same garden gate standing open; and closed |
| `ch35-mountain-symbolic.png` | `ch35-l05` card 5 | قَالَ لَن تَرَانِي | Symbolic: a great mountain under a vast sky, light breaking behind its peak; no figures |
| `ch35-giving-symbolic.png` | `ch35-l05` card 6 | لَن تَنَالُوا الْبِرَّ حَتَّىٰ تُنفِقُوا مِمَّا تُحِبُّونَ | Symbolic: an open hand-woven basket of fruit set down at a doorstep in morning light; hands only, no faces |

### Chapters 36–40

Requested 2026-10-03 with the batch-3 rebuild (Docs/proposals/proposal-harvest-tracker.md): every discover card of the new or rebuilt lessons — all of Chapter 36, the reviews of Chapters 37–40 and the two new Chapter 40 lessons (`ch40-l09`, `ch40-l08`). 58 new scenes cover 69 cards; 3 cards reuse `ch33-nasr-gates-symbolic.png` (An-Nasr 110:1). Not yet mapped: the cards of the older Chapter 37–40 lessons that were kept as they were (Ch 37 l01–l05, Ch 38 l01–l05, Ch 39 l01–l05, Ch 40 l01, l02, l03, l04, l05) — a later pass.

| Filename | Cards | Arabic | Brief |
|---|---|---|---|
| `ch36-action-name-tag.png` | `ch36-l01` card 1 | الْمَصْدَرُ | A pen gliding across a clean sheet with a plain blank label tag riding on its motion trail: the action itself, named. No hands, no figures |
| `ch36-wrote-vs-writing.png` | `ch36-l01` card 2 · `ch36-l02` card 2 | كَتَبَ / كِتَابَةٌ · كَتَبَ ← كِتَابَةٌ | Split panel: left, a finished letter with a pen laid beside it (he wrote); right, the same pen mid-stroke with soft motion lines (writing as an activity). No figures |
| `ch36-helped-vs-help.png` | `ch36-l01` card 3 · `ch36-l02` card 3 | نَصَرَ / نَصْرٌ · نَصَرَ ← نَصْرٌ | Split panel: left, a hand (no face) lifting another hand up a step (he helped); right, a pair of clasped hands alone (help as a thing) |
| `ch36-ahmad-wrote-letter.png` | `ch36-l01` card 4 | كَتَبَ أَحْمَدُ الرِّسَالَةَ. | A boy seen from behind at a desk, a sealed envelope in front of him; faceless figures: blank featureless faces or turned away |
| `ch36-easy-writing.png` | `ch36-l01` card 5 · `ch36-l02` card 4 · `ch36-l09` card 3 | الْكِتَابَةُ سَهْلَةٌ. · كِتَابَةُ الدَّرْسِ | An open notebook with a smooth flowing line being drawn by a pen, a gentle green downhill arrow beside it. No figures |
| `ch36-form-one-tree.png` | `ch36-l02` card 1 | الْفِعْلُ الثُّلَاثِيُّ | A root tree with one trunk and two branches that end in leaves of two different shapes: one verb type, different noun shapes. No lettering, no figures |
| `ch36-helping-friend.png` | `ch36-l02` card 5 | نَصَرَ أَحْمَدُ صَدِيقَهُ. | Two boys seen from behind at the foot of mosque steps, one steadying the other's bag strap; faceless figures: blank featureless faces or turned away |
| `ch36-root-extra-letter.png` | `ch36-l03` card 1 | الْفِعْلُ الْمَزِيدُ | A plain wooden block beside the same block with a small gold peg added in the middle: a letter added to the root. No lettering, no figures |
| `ch36-glorify-prayer-beads.png` | `ch36-l03` card 2 | سَبَّحَ ← تَسْبِيحٌ | A string of prayer beads resting on a folded cloth in soft light. No figures |
| `ch36-teaching-board.png` | `ch36-l03` card 3 | عَلَّمَ ← تَعْلِيمٌ | An empty classroom with a board, a pointer resting on its ledge and rows of desks. No figures |
| `ch36-sending-letter.png` | `ch36-l03` card 4 | أَرْسَلَ ← إِرْسَالٌ | A sealed letter leaving a hand (no face) towards a distant doorway along a dotted path |
| `ch36-faith-lantern.png` | `ch36-l03` card 5 | آمَنَ ← إِيمَانٌ | A lit lantern held in an open palm at dusk; symbolic, no face |
| `ch36-signpost-not-law.png` | `ch36-l03` card 6 | نَمَطٌ لَا قَاعِدَةٌ | A wooden signpost pointing along a path, with a small gap in the fence beside it: a clue, not a guarantee. No lettering, no figures |
| `ch36-quraysh-preview-symbolic.png` | `ch36-l03` card 7 | لِإِيلَافِ قُرَيْشٍ | Symbolic: a long road through two seasons, snow-dusted dunes on the left and sun-baked dunes on the right, a distant gate. No figures |
| `ch36-noun-takes-role.png` | `ch36-l04` card 1 | الْمَصْدَرُ اسْمٌ | Three small identical tiles placed in three different slots of a wooden rack: one word, three roles. No lettering, no figures |
| `ch36-subject-or-after-preposition.png` | `ch36-l04` card 2 | الْكِتَابَةُ / فِي الْكِتَابَةِ | Split panel: a pen alone at the centre of a table; the same pen inside a small box with an arrow pointing into it. No figures |
| `ch36-sits-for-writing.png` | `ch36-l04` card 3 | يَجْلِسُ أَحْمَدُ لِلْكِتَابَةِ. | A boy seen from behind sitting down at a desk with a notebook and pen; faceless figures: blank featureless faces or turned away |
| `ch36-chain-link.png` | `ch36-l04` card 4 | كِتَابَةُ الدَّرْسِ / نَصْرُ اللَّهِ | Two chain links joined, the left one larger than the right. No lettering, no figures |
| `ch36-his-handwriting.png` | `ch36-l04` card 5 | كِتَابَتُهُ جَمِيلَةٌ. | A neat page of handwriting beside a pen, a small tag pointing back to a boy seen from behind; faceless figures: blank featureless faces or turned away |
| `ch36-hasten-to-dhikr-symbolic.png` | `ch36-l04` card 6 | فَاسْعَوْا إِلَى ذِكْرِ اللَّهِ | Symbolic: an open mosque doorway at midday with a clear path of light across a courtyard. No figures |
| `ch36-verb-action-doer.png` | `ch36-l07` card 1 | كَتَبَ / كِتَابَةٌ / كَاتِبٌ | Three panels: a pen resting on a desk; the pen mid-stroke; a boy seen from behind holding the pen; faceless figures: blank featureless faces or turned away |
| `ch36-doer-shape.png` | `ch36-l07` card 2 | اسْمُ الْفَاعِلِ | Two identical silhouettes from behind, each holding a different tool (a pen, a rope), the same blank name-tag shape above both; faceless figures: blank featureless faces or turned away |
| `ch36-helper-hand.png` | `ch36-l07` card 3 | نَصَرَ / نَاصِرٌ | A hand (no face) steadying a ladder while someone climbs, seen from behind; faceless figures: blank featureless faces or turned away |
| `ch36-ahmad-writer.png` | `ch36-l07` card 4 · `ch36-l09` card 4 | أَحْمَدُ كَاتِبٌ. | A boy seen from behind at a desk, shelves of notebooks behind him, a plain name tag in the corner; faceless figures: blank featureless faces or turned away |
| `ch36-word-type-or-role.png` | `ch36-l07` card 5 | اسْمُ الْفَاعِلِ / فَاعِلٌ | Two panels: left, a boy entering a classroom door (the one who acts); right, a boy seated with a plain name card (only a description); faceless figures: blank featureless faces or turned away |
| `ch36-noble-recorders-symbolic.png` | `ch36-l07` card 6 | كِرَامًا كَاتِبِينَ | Symbolic: two soft columns of light beside an open ledger floating above a quiet field. No figures |
| `ch36-writer-and-written.png` | `ch36-l08` card 1 | كَاتِبٌ / مَكْتُوبٌ | Two panels: a pen writing; a page already written, pen laid beside it. No figures |
| `ch36-helper-and-helped.png` | `ch36-l08` card 2 | نَاصِرٌ / مَنْصُورٌ | Two panels: a hand (no face) lifting; a person standing on the top step seen from behind; faceless figures: blank featureless faces or turned away |
| `ch36-receiver-pattern.png` | `ch36-l08` card 3 | اسْمُ الْمَفْعُولِ | A seal pressing a blank shape into warm wax, the wax carrying the shape: the receiver of the action. No lettering, no figures |
| `ch36-door-open.png` | `ch36-l08` card 4 | الْبَابُ مَفْتُوحٌ. | A wooden door standing open onto a bright courtyard, a key still in the lock. No figures |
| `ch36-lesson-written.png` | `ch36-l08` card 5 · `ch36-l09` card 5 | الدَّرْسُ مَكْتُوبٌ. | A notebook page filled with neat lines, a pen laid beside it. No figures |
| `ch36-participle-not-object.png` | `ch36-l08` card 6 | اسْمُ الْمَفْعُولِ / مَفْعُولٌ بِهِ | Split panel: left, a hand (no face) holding a book out to someone (an object of an action); right, a finished page lying still on a table (a described thing) |
| `ch36-dhikr-greater-symbolic.png` | `ch36-l05` card 1 | وَلَذِكْرُ اللَّهِ أَكْبَرُ | Symbolic: a small lamp glowing in a vast starry sky. No figures |
| `ch36-faith-unmixed-symbolic.png` | `ch36-l05` card 3 | وَلَمْ يَلْبِسُوا إِيمَانَهُمْ بِظُلْمٍ | Symbolic: a clear glass of water beside a muddy one, light falling only on the clear glass. No figures |
| `ch36-quoted-or-related.png` | `ch36-l05` card 4 | سَبِّحِ / تَسْبِيحٌ | Two panels: an open Mushaf with a highlighter line under one word; beside it a loose note card that is not part of the book. No figures |
| `ch36-find-the-action-noun.png` | `ch36-l05` card 5 | كَيْفَ نَقْرَأُ؟ | A magnifying glass over a row of plain wooden word-blocks, one block glowing. No lettering, no figures |
| `ch36-three-nouns-one-root.png` | `ch36-l09` card 1 · `ch36-l06` card 1 · `ch36-l06` card 2 | كِتَابَةٌ / كَاتِبٌ / مَكْتُوبٌ · الْمَصْدَرُ · الْفَاعِلُ · الْمَفْعُولُ · الْكِتَابَةُ سَهْلَةٌ، وَأَحْمَدُ كَاتِبٌ، وَالدَّرْسُ مَكْتُوبٌ. | One tree trunk splitting into three branches that end in a pen, a boy's silhouette from behind and a written page; faceless figures: blank featureless faces or turned away |
| `ch36-help-trio.png` | `ch36-l09` card 2 | نَصْرٌ / نَاصِرٌ / مَنْصُورٌ | Three panels: clasped hands alone; a hand (no face) lifting; a person on the top step seen from behind; faceless figures: blank featureless faces or turned away |
| `ch36-noun-no-clock.png` | `ch36-l09` card 6 | لَا زَمَنَ فِي الِاسْمِ | A clock face with no hands beside a notebook on a desk. No figures |
| `ch37-feminine-forms-grid.png` | `ch37-l06` card 1 | هِيَ · أَنْتِ · هُنَّ · أَنْتُنَّ | Four small panels of silhouettes from behind: one woman walking, one woman reading, a small group of women, one woman praying; faceless figures: blank featureless faces or turned away |
| `ch37-believing-woman-prays.png` | `ch37-l06` card 2 | الْمُؤْمِنَةُ تُصَلِّي الْفَجْرَ. | A woman in a long garment seen from behind on a prayer mat at dawn; faceless figures: blank featureless faces or turned away |
| `ch38-dual-glance.png` | `ch38-l06` card 1 | الْمُثَنَّى | Two identical books, two identical pens and two doors side by side. No figures |
| `ch38-two-students-write.png` | `ch38-l06` card 2 | الطَّالِبَانِ الْمُجْتَهِدَانِ يَكْتُبَانِ. | Two students seen from behind sharing one bench, each writing in a notebook; faceless figures: blank featureless faces or turned away |
| `ch39-surah-four-ayat-symbolic.png` | `ch39-l06` card 1 | سُورَةُ قُرَيْشٍ | Symbolic: four lanterns in a row along a road at dusk. No figures |
| `ch39-lord-of-this-house-symbolic.png` | `ch39-l06` card 2 | رَبَّ هَٰذَا الْبَيْتِ | Symbolic: the Kaʿbah seen from far across an open plain at dawn; no figures, no crowd |
| `ch40-prep-phrase-tag.png` | `ch40-l09` card 1 | الْجَارُّ وَالْمَجْرُورُ | A small blank tag hung on a pen that rests in a box: a phrase attached to a thing. No lettering, no figures |
| `ch40-mosque-statement-or-description.png` | `ch40-l09` card 2 | الْمَسْجِدُ فِي الْمَدِينَةِ / مَسْجِدٌ فِي الْمَدِينَةِ | Split panel: left, one particular mosque in a city with a green tick (the mosque is in the city); right, a nameless mosque among rooftops with a small question tag (a mosque in the city). No figures |
| `ch40-book-on-desk-statement.png` | `ch40-l09` card 3 | الْكِتَابُ عَلَى الْمَكْتَبِ / كِتَابٌ عَلَى الْمَكْتَبِ | Split panel: one specific book clearly set apart on a desk with a green tick; a plain unnamed book on a desk. No figures |
| `ch40-teacher-knows-quran.png` | `ch40-l09` card 4 | الْمُعَلِّمُ عَالِمٌ بِالْقُرْآنِ. | A teacher seen from behind at a lectern with an open Mushaf and full shelves, a thought-bubble holding the same Mushaf; faceless figures: blank featureless faces or turned away |
| `ch40-knows-everything-symbolic.png` | `ch40-l09` card 5 | وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ | Symbolic: a vast open ledger of stars under a night sky with soft light across all of it. No figures |
| `ch40-student-book-on-desk.png` | `ch40-l09` card 6 · `ch40-l07` card 1 | كِتَابُ هَذَا الطَّالِبِ الْمُجْتَهِدِ عَلَى الْمَكْتَبِ. · الْأَوْصَافُ | A student's desk with a notebook and a pen, a school bag on the chair beside it. No figures |
| `ch40-one-to-group.png` | `ch40-l08` card 1 · `ch40-l08` card 2 | الَّذِي → الَّذِينَ · الَّذِي / الَّذِينَ | Left, one man seen from behind; right, a row of men seen from behind; faceless figures: blank featureless faces or turned away |
| `ch40-students-write-lesson.png` | `ch40-l08` card 3 · `ch40-l07` card 2 | الطُّلَّابُ الَّذِينَ يَكْتُبُونَ الدَّرْسَ · الطُّلَّابُ الَّذِينَ يَكْتُبُونَ فِي الْفَصْلِ | A row of students seen from behind writing at their desks; faceless figures: blank featureless faces or turned away |
| `ch40-women-in-classroom.png` | `ch40-l08` card 4 | اللَّاتِي | A group of women students seen from behind in a bright classroom; faceless figures: blank featureless faces or turned away |
| `ch40-women-writing.png` | `ch40-l08` card 5 | الطَّالِبَاتُ اللَّاتِي يَكْتُبْنَ الدَّرْسَ | A group of women students seen from behind, all writing in notebooks; faceless figures: blank featureless faces or turned away |
| `ch40-books-on-desk.png` | `ch40-l08` card 6 | الَّتِي | A neat stack of three books on a desk. No figures |
| `ch40-path-of-the-favoured-symbolic.png` | `ch40-l08` card 7 | صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ | Symbolic: a straight sunlit path across a green plain with many footprints along it. No figures |
| `ch40-three-groups-sort.png` | `ch40-l08` card 8 | مَنْ هُمْ؟ | Three baskets: one holding silhouettes of men from behind, one holding silhouettes of women from behind, one holding a stack of books; faceless figures: blank featureless faces or turned away |

### Chapters 41–45

Requested 2026-10-03 with the batch-4 rebuild (Docs/proposals/proposal-harvest-tracker.md): every discover card of the new or rebuilt lessons — all of Chapters 41 and 42, all of Chapter 43 (including the new reading lessons; the CL13 lab has no cards) and the two new Chapter 45 lessons (`ch45-l08`, `ch45-l09`). 86 new scenes cover 150 cards. Not yet mapped: the cards of the older Chapter 44 lessons and Chapter 45 lessons 1–7 that were kept as they were — a later pass.

| Filename | Cards | Arabic | Brief |
|---|---|---|---|
| `ch45-aim-arrow-and-target.png` | `ch45-l08` cards 1, 2, 3, 5 | الْغَرَضُ: كَيْ وَلِـ · أَدْرُسُ كَيْ أَنْجَحَ. · أَدْرُسُ لِأَنْجَحَ. | A bow-less arrow resting beside a target board with a path leading from a desk to it; no figures |
| `ch45-two-lam-jobs-book-and-desk.png` | `ch45-l08` card 4 | لِـ لِلِاسْمِ وَلِلْفِعْلِ | Split scene: a book resting on a student's desk on the left (for the student), a chair pulled out in front of a notebook and pen on the right (so that I write); no figures |
| `ch45-exalt-night-sky-stars.png` | `ch45-l08` card 6 | كَيْ نُسَبِّحَكَ كَثِيرًا | A wide quiet night sky with stars above a still desert; no figures |
| `ch45-out-of-dark-into-light-door.png` | `ch45-l08` card 7 | لِتُخْرِجَ النَّاسَ مِنَ الظُّلُمَاتِ إِلَى النُّورِ | A doorway between a dark room on the left and sunlight on the right; no figures |
| `ch45-wait-bench-until-arrival.png` | `ch45-l09` cards 1, 2, 3, 5 | حَتَّى لِلْغَايَةِ · أَجْلِسُ هُنَا حَتَّى يَحْضُرَ الْمُعَلِّمُ. · أَدْرُسُ حَتَّى أَنْجَحَ. | A bench at a school gate with a closed bag on it, a long road empty in the distance and a rising sun; no figures |
| `ch45-aim-or-endpoint-two-paths.png` | `ch45-l09` card 4 |  | Two panels: on the left an arrow flying to a target (the aim), on the right a path running to a finish line marked by a flag (the endpoint); no figures |
| `ch45-waiting-camp-for-return.png` | `ch45-l09` cards 6, 7 | حَتَّىٰ يَرْجِعَ إِلَيْنَا مُوسَىٰ · لَنْ نَبْرَحَ … حَتَّىٰ يَرْجِعَ | A quiet desert camp at dusk with a lit lamp and an empty path toward the horizon; no figures, no animals |
| `ch41-reading-lamp-open-book.png` | `ch41-l01` cards 1, 6 | الْفِكْرَةُ الْعَامَّةُ · الْفِكْرَةُ أَمِ التَّرْتِيبُ؟ | An open book on a wooden desk under a warm reading lamp, a pen beside it. No figures |
| `ch41-masjid-house-book-three-steps.png` | `ch41-l01` cards 2, 5 | ذَهَبَ يُوسُفُ إِلَى الْمَسْجِدِ صَبَاحًا. ثُمَّ رَجَعَ إِلَى الْبَيْتِ. بَعْدَ ذَلِكَ قَرَأَ كِتَابًا. · قَبْلَ الْفَصْلِ قَرَأَتْ فَاطِمَةُ كِتَابًا فِي الْبَيْتِ. ثُمَّ ذَهَبَتْ إِلَى الْمَدْرَسَةِ. | Three panels left to right: a masjid in morning light, a house with an open door, a book on a table; faceless figures: blank featureless faces or turned away if any figure appears (prefer none) |
| `ch41-order-arrows-timeline.png` | `ch41-l01` cards 3, 4 | ثُمَّ، بَعْدَ ذَلِكَ، قَبْلَ · وَ does not give the order | A simple horizontal path with three stones numbered by dots (one, two, three) and a small arrow between each, no lettering |
| `ch41-two-desks-one-pen-one-book.png` | `ch41-l02` cards 1, 2, 3, 6 | الْوَصْفُ · فِي الْفَصْلِ طَالِبٌ مُجْتَهِدٌ وَطَالِبَةٌ مُجْتَهِدَةٌ. هُوَ كَتَبَ الدَّرْسَ، وَهِيَ قَرَأَتْ كِتَابًا. · هُوَ، هِيَ | A classroom with two separate desks seen from the back: one holds a pen and a notebook, the other an open book; no faces visible |
| `ch41-two-markers-he-she.png` | `ch41-l02` cards 4, 5 | الطَّالِبُ الَّذِي كَتَبَ الدَّرْسَ · الطَّالِبَةُ الَّتِي قَرَأَتْ كِتَابًا | Two simple wooden name markers on a table, one tall blue, one short green, each beside a different object (a book, a notebook). No figures |
| `ch41-pointer-arrow-back-to-noun.png` | `ch41-l02` card 7 | الَّذِي خَلَقَ فَسَوَّىٰ | A curved arrow from a lantern on the right back to a large lamp on the left, no lettering |
| `ch41-masjid-interior-empty-mat.png` | `ch41-l03` cards 1, 2 | أَيْنَ؟ مَتَى؟ مَعَ مَنْ؟ · جَلَسَ أَحْمَدُ فِي الْمَسْجِدِ. | The inside of a masjid with a prayer mat on carpet and soft light through a window. No figures |
| `ch41-school-gate-after-prayer.png` | `ch41-l03` card 3 | ذَهَبَ أَحْمَدُ إِلَى الْمَدْرَسَةِ بَعْدَ الصَّلَاةِ. | A school gate in afternoon light with a path from a distant masjid dome. No figures |
| `ch41-two-books-two-seats-bench.png` | `ch41-l03` cards 4, 5 | قَرَأَ أَحْمَدُ كِتَابًا مَعَ أَخِيهِ. · جَلَسَ أَحْمَدُ فِي الْمَسْجِدِ بَعْدَ الصَّلَاةِ مَعَ أَخِيهِ. | A bench with two open books side by side, one slightly larger, as if shared. No figures |
| `ch41-three-labels-where-when-whom.png` | `ch41-l03` card 6 | Read the phrase with its event | Three objects in a row — a house, a sun-clock, two cups — with a small thread joining them, no lettering |
| `ch41-dark-to-light-path.png` | `ch41-l03` card 7 | مِنَ الظُّلُمَاتِ إِلَى النُّورِ | A path from a dark cave mouth on the left to a bright open field on the right. No figures |
| `ch41-pointing-to-words-magnifier.png` | `ch41-l04` card 1 | الدَّلِيلُ مِنَ النَّصِّ | A magnifying glass resting over a blank line of text on an open page, no readable writing. No figures |
| `ch41-ayah-three-actions-symbols.png` | `ch41-l04` cards 2, 3, 4 | الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ · الَّذِينَ · Supplied forms | Three symbolic objects in a row — a closed sealed box (the unseen), a prayer mat, an open hand with coins — no figures |
| `ch41-fatima-home-evidence-desk.png` | `ch41-l04` cards 5, 6, 7 | دَخَلَتْ فَاطِمَةُ الْفَصْلَ وَجَلَسَتْ. هِيَ كَتَبَتِ الدَّرْسَ. ثُمَّ ذَهَبَتْ إِلَى الْبَيْتِ مَعَ أَخِيهَا. · Stated or not stated? · ذَهَبَتْ سَلْمَى إِلَى الْمَسْجِدِ مَعَ أَبِيهَا. هِيَ قَرَأَتْ كِتَابًا بَعْدَ الصَّلَاةِ. | A desk with a notebook and a pen, two chairs, a school bag by the door; faceless figures: blank featureless faces or turned away if any figures appear (prefer none) |
| `ch41-fil-surah-steps.png` | `ch41-l06` card 1 | سُورَةُ الْفِيلِ | A stone path with two low steps and then a wider platform, calm light; symbolic, no figures |
| `ch41-elephant-silhouette-far-hill.png` | `ch41-l06` cards 2, 4 | أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ · أَلَمْ — a form you will study later | A large elephant silhouette on a distant hill at dusk beside a tangled net-like plan drawn as a faded rope pattern; no people |
| `ch41-birds-flock-sky-clay.png` | `ch41-l06` card 3 | وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍ | A wide sky with a great flock of small birds, and a few small clay-colored stones falling below; no people |
| `ch41-them-arrow-pointing-back.png` | `ch41-l06` card 5 | هُمْ | Three arrows from three small stones all curving back to the silhouette of one large elephant, no lettering |
| `ch41-order-four-stones-path.png` | `ch41-l06` card 6 | Read the events in the order stated | A winding path with four numbered-by-dots stones leading to a heap of straw, no lettering |
| `ch41-qariah-question-gate.png` | `ch41-l07` cards 1, 4 | سُورَةُ الْقَارِعَةِ · A question and its answer | A large closed gate under a dim sky with a single question-mark-shaped lantern hanging in front; no figures |
| `ch41-qariah-big-door-knocking.png` | `ch41-l07` card 2 | الْقَارِعَةُ مَا الْقَارِعَةُ وَمَا أَدْرَاكَ مَا الْقَارِعَةُ | A heavy wooden door with a large iron knocker mid-swing, shadow trembling on the wall; no figures |
| `ch41-moths-scattered-night.png` | `ch41-l07` cards 3, 5 | يَوْمَ يَكُونُ النَّاسُ كَالْفَرَاشِ الْمَبْثُوثِ وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنفُوشِ · كَـ | Hundreds of moths scattered in all directions around a faint lamp in the night sky; no figures |
| `ch41-mountains-like-wool.png` | `ch41-l07` cards 3, 5 | يَوْمَ يَكُونُ النَّاسُ كَالْفَرَاشِ الْمَبْثُوثِ وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنفُوشِ · كَـ | Mountain shapes drawn as soft fluffed tufts of colored wool drifting apart; no figures |
| `ch41-stay-with-given-meaning-ruler.png` | `ch41-l07` card 6 | Keep to the meaning given | A ruler laid under a line on a blank page, keeping to the line; no figures |
| `ch41-scales-heavy-light-balance.png` | `ch41-l08` cards 1, 2, 3 | سُورَةُ الْقَارِعَةِ · فَأَمَّا مَن ثَقُلَتْ مَوَازِينُهُ فَهُوَ فِي عِيشَةٍ رَّاضِيَةٍ · وَأَمَّا مَنْ خَفَّتْ مَوَازِينُهُ فَأُمُّهُ هَاوِيَةٌ | A brass balance scale: one pan low with many stones, one pan high and nearly empty; no figures |
| `ch41-pleasant-garden-spring.png` | `ch41-l08` card 2 | فَأَمَّا مَن ثَقُلَتْ مَوَازِينُهُ فَهُوَ فِي عِيشَةٍ رَّاضِيَةٍ | A calm green garden with a spring and soft morning light; no figures |
| `ch41-deep-hollow-abyss.png` | `ch41-l08` card 3 | وَأَمَّا مَنْ خَفَّتْ مَوَازِينُهُ فَأُمُّهُ هَاوِيَةٌ | A deep dark hollow in the ground seen from above, edges of rock; no figures |
| `ch41-blazing-fire-embers.png` | `ch41-l08` card 4 | وَمَا أَدْرَاكَ مَا هِيَهْ نَارٌ حَامِيَةٌ | A large bed of glowing embers and flames in a dark pit; no figures |
| `ch41-two-roads-split.png` | `ch41-l08` cards 5, 6, 7 |  · أَمَّا is supplied · Read all eleven ayat as one surah | A path splitting into two roads at a fork, one toward a green garden, one toward a dark hollow; no figures |
| `ch41-reading-checklist-desk.png` | `ch41-l05` card 1 | الْقِرَاءَةُ الْمُتَّصِلَةُ | A desk with an open book, a magnifying glass, a small clock and a notebook arranged in a row. No figures |
| `ch41-market-and-home-path.png` | `ch41-l05` card 2 | ذَهَبَتْ سَلْمَى إِلَى السُّوقِ صَبَاحًا. بَعْدَ ذَلِكَ رَجَعَتْ إِلَى الْبَيْتِ وَجَلَسَتْ مَعَ أُمِّهَا. | A path from a market stall at sunrise to a house with a lit doorway. No figures |
| `ch41-village-masjid-books-lesson.png` | `ch41-l05` card 3 | فِي الْقَرْيَةِ مُعَلِّمٌ كَرِيمٌ وَمُعَلِّمَةٌ كَرِيمَةٌ. هِيَ قَرَأَتْ كِتَابًا، وَهُوَ كَتَبَ الدَّرْسَ فِي الْمَسْجِدِ. | A village lane with a small masjid and a house; two desks with books seen through a window. No figures |
| `ch42-counting-books-on-shelf.png` | `ch42-l01` cards 1, 2, 3, 6 | كَمْ؟ · كَمْ كِتَابًا قَرَأْتَ؟ · كَمْ كِتَابًا قَرَأْتَ؟ — ٣ | A shelf holding a small stack of books, a row of pens in a cup and a few notebooks, each group clearly separate and countable. No figures |
| `ch42-class-of-students-from-behind.png` | `ch42-l01` card 4 | كَمْ طَالِبًا فِي الْفَصْلِ؟ | A classroom seen from the back: rows of desks with students sitting at them; faceless figures: blank featureless faces or turned away |
| `ch42-cave-sleepers-sunlight.png` | `ch42-l01` card 5 | كَمْ لَبِثْتُمْ؟ | A quiet cave mouth with morning sunlight falling on the floor; no figures; nothing symbolic of people |
| `ch42-books-or-place-split.png` | `ch42-l01` card 7 | كَمْ أَمْ أَيْنَ؟ | Split scene: on one side a short stack of books, on the other a bookcase in a different room across a doorway. No figures |
| `ch42-three-day-calendar-strip.png` | `ch42-l02` cards 1, 2, 3, 4, 6 | مَتَى؟ · مَتَى ذَهَبْتَ إِلَى الْمَدْرَسَةِ؟ · ذَهَبْتُ أَمْسِ. | A simple strip of three day cards: a past day with a check mark, today highlighted, tomorrow with an empty circle; a small bag and a school building beside each. No figures |
| `ch42-morning-routine-sun.png` | `ch42-l02` card 5 | مَتَى تَذْهَبُ إِلَى الْمَدْرَسَةِ؟ — أَذْهَبُ كُلَّ صَبَاحٍ. | A rising sun over a quiet street leading to a school gate, with a repeating arrow suggesting every morning. No figures |
| `ch42-dawn-horizon-hope.png` | `ch42-l02` card 7 | مَتَىٰ نَصْرُ اللَّهِ ۗ أَلَا إِنَّ نَصْرَ اللَّهِ قَرِيبٌ | A wide horizon at first light with a soft path leading toward it, calm and symbolic. No figures |
| `ch42-near-masjid-street.png` | `ch42-l03` cards 1, 2, 3 | لِمَاذَا؟ · لِمَاذَا ذَهَبْتَ إِلَى الْمَسْجِدِ؟ · لِأَنَّ الْمَسْجِدَ قَرِيبٌ. | A short street ending at a nearby masjid with a dome and a minaret, the building clearly close. No figures |
| `ch42-arabic-quran-book-pair.png` | `ch42-l03` card 4 | لِمَاذَا تَدْرُسُ الْعَرَبِيَّةَ؟ — لِأَنَّ الْعَرَبِيَّةَ لُغَةُ الْقُرْآنِ. | An open Arabic book beside a closed Quran on a wooden desk with a reading lamp. No figures |
| `ch42-why-vs-when-panels.png` | `ch42-l03` cards 5, 6 | لِمَاذَا أَمْ مَتَى؟ · A reason is a statement | Two panels: a lit lightbulb beside a door on the left, a wall clock beside the same door on the right. No figures |
| `ch42-pause-and-think-path.png` | `ch42-l03` card 7 | لِمَ تَقُولُونَ مَا لَا تَفْعَلُونَ | A quiet path with a single signpost shaped like a question mark made of wood, no lettering. No figures |
| `ch42-how-state-and-manner.png` | `ch42-l04` cards 1, 2, 3, 4 | كَيْفَ؟ · كَيْفَ حَالُكَ؟ — بِخَيْرٍ. · كَيْفَ تَذْهَبُ إِلَى الْمَدْرَسَةِ؟ — بِالسَّيَّارَةِ. | Split scene: on the left a calm open hand-drawn sunrise (well-being), on the right a small car on a road to a school. No figures |
| `ch42-wonder-night-sky.png` | `ch42-l04` card 5 | كَيْفَ تَكْفُرُونَ بِاللَّهِ | A wide night sky with stars over a quiet desert, symbolic of wonder. No figures |
| `ch42-four-signposts.png` | `ch42-l04` card 6 | كَمْ، مَتَى، لِمَاذَا، كَيْفَ | Four wooden signposts at a crossroads, each pointing to a different object: a pile of books, a clock, a lightbulb, a road. No lettering |
| `ch42-takathur-reading-in-steps.png` | `ch42-l07` card 1 | سُورَةُ التَّكَاثُرِ | A quiet stone path with four low steps leading toward a calm gate, the steps lit one by one; symbolic and without figures |
| `ch42-busy-piles-of-goods.png` | `ch42-l07` card 2 | أَلْهَاكُمُ التَّكَاثُرُ حَتَّىٰ زُرْتُمُ الْمَقَابِرَ | A heap of bags, boxes and coins piled high in a dim room beside a narrow doorway. No figures |
| `ch42-two-gentle-warnings.png` | `ch42-l07` card 3 | كَلَّا سَوْفَ تَعْلَمُونَ ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ | Two identical lanterns side by side lighting a dark path, the second a little brighter. No figures |
| `ch42-if-you-only-knew-horizon.png` | `ch42-l07` card 4 | كَلَّا لَوْ تَعْلَمُونَ عِلْمَ الْيَقِينِ لَتَرَوُنَّ الْجَحِيمَ | A hazy horizon seen through a window, clearing slightly toward the right. No figures |
| `ch42-eye-of-certainty-clear-sky.png` | `ch42-l07` card 5 | ثُمَّ لَتَرَوُنَّهَا عَيْنَ الْيَقِينِ ثُمَّ لَتُسْأَلُنَّ يَوْمَئِذٍ عَنِ النَّعِيمِ | A clear sky with a single bright star over a still lake, symbolic of certainty. No figures |
| `ch42-chunk-reading-markers.png` | `ch42-l07` cards 6, 7 | Emphatic endings are not the ordinary present · Say what the text says | A long scroll shown from the side with colored ribbon markers on it separating it into chunks, no writing visible |
| `ch42-four-question-tools.png` | `ch42-l05` card 1 | الْأَسْئِلَةُ | Four simple objects on a desk — a stack of books, a clock, a lightbulb and a small toy car — each next to a blank speech bubble shape. No figures |
| `ch42-village-houses-count.png` | `ch42-l05` card 2 | كَمْ بَيْتًا فِي الْقَرْيَةِ؟ — ٢٠ | A small village of clearly separated houses seen from above on a hillside. No figures |
| `ch42-open-quran-reading-lamp.png` | `ch42-l05` card 3 | لِمَاذَا تَقْرَأُ الْقُرْآنَ؟ — لِأَنَّ الْقُرْآنَ كِتَابُ اللَّهِ. | An open Quran on a stand beside a reading lamp, soft evening light. No figures |
| `ch43-three-day-record-cards.png` | `ch43-l01` cards 1, 2, 3, 4, 5, 6 | الزَّمَنُ فِي الْجُمْلَةِ · أَمْسِ كَتَبَ أَحْمَدُ الدَّرْسَ. · الْيَوْمَ يَقْرَأُ أَحْمَدُ كِتَابًا. | Three cards in a row on a desk — a faded one, a bright one, an empty one — each beside a small object (a closed book, an open book, a blank notebook). No figures |
| `ch43-sentence-parts-blocks.png` | `ch43-l02` cards 1, 2, 3, 6, 7 | أَجْزَاءُ الْجُمْلَةِ · قَرَأَ الطَّالِبُ الْمُجْتَهِدُ كِتَابَ الْمُعَلِّمِ فِي الْفَصْلِ. · A describing word matches its own noun | Four colored wooden blocks (action, doer, object, place) joined on a rail like a train, no lettering. No figures |
| `ch43-desk-with-book-and-pen.png` | `ch43-l02` cards 4, 5 | فَاطِمَةُ طَالِبَةٌ. كِتَابُهَا عَلَى الْمَكْتَبِ. · ـهَا | A school desk with a book and pen on top, a chair pushed in. No figures |
| `ch43-kawthar-flowing-river-garden.png` | `ch43-l06` cards 1, 2 | سُورَةُ الْكَوْثَرِ · إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ | A wide clear river flowing through a green garden with many trees, abundant and calm; no figures |
| `ch43-pray-and-sacrifice-symbols.png` | `ch43-l06` card 3 | فَصَلِّ لِرَبِّكَ وَانْحَرْ | A prayer mat beside a small field gate, soft morning light; no figures, no animals |
| `ch43-the-hater-cut-branch.png` | `ch43-l06` card 4 | إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ | A tree branch snapped off and lying on dry ground beside a living tree; no figures |
| `ch43-one-arrow-three-ayat.png` | `ch43-l06` cards 5, 6 | One ـكَ, three ayat · Three parts of the surah | Three small lanterns on a shelf all pointed at by one long arrow; no lettering; no figures |
| `ch43-humazah-treasure-counted.png` | `ch43-l07` cards 1, 2, 4 | سُورَةُ الْهُمَزَةِ · وَيْلٌ لِّكُلِّ هُمَزَةٍ لُّمَزَةٍ الَّذِي جَمَعَ مَالًا وَعَدَّدَهُ يَحْسَبُ أَنَّ مَالَهُ أَخْلَدَهُ · الَّذِي | A heap of coins and sacks with a hand-held abacus counting them in a dim room; no figures |
| `ch43-humazah-no-barrier-crusher.png` | `ch43-l07` card 3 | كَلَّا ۖ لَيُنبَذَنَّ فِي الْحُطَمَةِ وَمَا أَدْرَاكَ مَا الْحُطَمَةُ | A heavy stone gateway shaped like a crusher with rough rock teeth, dark and far; no figures |
| `ch43-description-then-answer-bridge.png` | `ch43-l07` cards 5, 6 | Supplied forms and emphasis · Link the two sections | A short bridge connecting two cliffs, the first with a lantern, the second with a closed door; no figures |
| `ch43-recall-first-section-scroll.png` | `ch43-l08` cards 1, 5 | سُورَةُ الْهُمَزَةِ · Read it as one surah | A scroll with its first third unrolled and glowing, the rest rolled up; no writing visible; no figures |
| `ch43-kindled-fire-rising-hearts.png` | `ch43-l08` card 2 | نَارُ اللَّهِ الْمُوقَدَةُ الَّتِي تَطَّلِعُ عَلَى الْأَفْئِدَةِ | A tall fire in a dark hall rising toward the ceiling; no figures |
| `ch43-sealed-door-long-columns.png` | `ch43-l08` cards 3, 4 | إِنَّهَا عَلَيْهِم مُّؤْصَدَةٌ فِي عَمَدٍ مُّمَدَّدَةٍ · هَا، هِمْ | A long hall of tall stone columns with a heavy door closing at the far end; no figures |
| `ch43-maun-question-open-door.png` | `ch43-l03` cards 1, 2 | سُورَةُ الْمَاعُونِ · أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ | An open doorway with a single lantern hanging at its threshold, a question-shaped shadow on the floor; no figures |
| `ch43-orphan-empty-bowl-door.png` | `ch43-l03` cards 3, 5 | فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ · The verse boundary is not the sentence boundary | A small empty wooden bowl set beside a closed door on a stone step; no figures |
| `ch43-one-person-two-footprints.png` | `ch43-l03` card 4 | فَذَلِكَ الَّذِي | One set of footprints in sand leading away from a house, with two forks in the trail; no figures |
| `ch43-supplied-meanings-cards.png` | `ch43-l03` card 6 | Supplied forms | Four small cards laid out in a row on a table, each with a plain icon (eye, hand, push, call) and no writing; no figures |
| `ch43-recall-first-three-ayat-lantern.png` | `ch43-l09` card 1 | سُورَةُ الْمَاعُونِ | A lantern with three small lit windows, the rest of its panes dark; no figures |
| `ch43-prayer-mat-turned-away.png` | `ch43-l09` cards 2, 4 | فَوَيْلٌ لِّلْمُصَلِّينَ الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ · Not a claim about everyone who prays | A prayer mat on a floor with a small clock and a distant window, the mat slightly turned from the direction of the window; no figures |
| `ch43-show-and-hidden-pot.png` | `ch43-l09` cards 3, 5 | الَّذِينَ هُمْ يُرَاءُونَ وَيَمْنَعُونَ الْمَاعُونَ · الَّذِينَ هُمْ | A decorated lantern lit for show beside a plain pot kept under a cloth, never lent out; no figures |
| `ch43-question-person-group-steps.png` | `ch43-l09` cards 6, 7 | Read all seven ayat · Supplied forms | A path with three markers: a question-mark lantern, a single stone, a group of many stones; no figures |
| `ch43-review-desk-three-surahs.png` | `ch43-l05` card 1 | الْفَصْلُ الثَّالِثُ وَالْأَرْبَعُونَ | A desk with three small open books side by side, a clock, and a cup of water; no figures |
| `ch43-yusuf-two-day-books.png` | `ch43-l05` card 2 | أَمْسِ قَرَأَ يُوسُفُ كِتَابًا. غَدًا سَيَكْتُبُ الدَّرْسَ. | Two panels: a closed book with a small tick (yesterday) and a blank notebook with a pen (tomorrow); no figures |
| `ch43-salma-pen-in-class.png` | `ch43-l05` card 3 | سَلْمَى مُعَلِّمَةٌ. قَلَمُهَا فِي الْفَصْلِ. | A classroom desk with a pen resting on it, a chalkboard behind; no figures |

### Chapters 46–50

Requested 2026-10-03 with the batch-5 rebuild (Docs/proposals/proposal-harvest-tracker.md): every discover card of the new or rebuilt lessons — the review `ch46-l07`, the new ordinal-hours card of `ch48-l04`, `ch48-l06`, `ch48-l07` and the review `ch48-l08`, all of the rebuilt or new `ch49-l01`…`l04`, `ch49-l07` and review `ch49-l06`, and `ch50-l02`, `ch50-l03`, `ch50-l07`…`l09` and review `ch50-l06`. The CL14 and CL15 labs have no cards. 28 scenes cover 85 cards. Quran scenes are symbolic and faceless (no human figure, no face). Not yet mapped: the cards of the kept lessons — Chapter 46 lessons 1–6, Chapter 47, Chapter 48 lessons 1–3 (rest of the clock lesson, numbers 1–10, measures), `ch49-l05` and Chapter 50 lessons 1 and 5 — a later pass.

| Filename | Cards | Arabic | Brief |
|---|---|---|---|
| `ch46-verb-governor-state-cards.png` | `ch46-l07` card 1 | خُطُوَاتُ التَّحْلِيلِ | A desk with an open notebook, a small magnifying glass and four index cards in a row (verb, governor, state, ending); no figures |
| `ch46-three-signs-statement-ban-command.png` | `ch46-l07` card 2 | Statement, prohibition, command | Three small road signs standing in a row: a plain forward arrow, a round sign with a bar across it, and an arrow pointing up; no figures |
| `ch48-hours-one-to-twelve.png` | `ch48-l04` card 2 | سَاعَاتُ الْيَوْمِ | A wall clock showing seven o’clock above a row of twelve small numbered hour plates; no figures |
| `ch48-eleven-to-twenty-stones.png` | `ch48-l06` cards 1, 6 | الْأَعْدَادُ مِنْ ١١ إِلَى ٢٠ · عِشْرُونَ | Two rows of smooth stones: a row of ten with one more beside it, and a longer line of twenty; no figures |
| `ch48-eleven-stars-sun-moon.png` | `ch48-l06` card 2 | رَأَيْتُ أَحَدَ عَشَرَ كَوْكَبًا | A quiet night sky with eleven stars, a sun and a moon; symbolic, no figures |
| `ch48-twelve-months-moon-wheel.png` | `ch48-l06` card 3 | اثْنَا عَشَرَ شَهْرًا | A circular calendar wheel with twelve small moons around it; no figures |
| `ch48-twelve-springs-from-rock.png` | `ch48-l06` card 4 | اثْنَتَا عَشْرَةَ عَيْنًا | A large rock with twelve thin streams of water running down it into a dry bed; no figures |
| `ch48-thirteen-to-nineteen-days.png` | `ch48-l06` cards 5, 7 | ثَلَاثَةَ عَشَرَ / ثَلَاثَ عَشْرَةَ · 3–10 versus 11–99 | A calendar page with thirteen day-boxes ticked, next to a stack of three books and a stack of thirteen; no figures |
| `ch48-tens-row-of-boards.png` | `ch48-l07` cards 1, 7 | الْعُقُودُ مِنْ ٢٠ إِلَى ٩٠ · Two noun shapes | Eight rods in a row, each carrying a different number of notches from twenty to ninety; no figures |
| `ch48-long-years-calendar.png` | `ch48-l07` card 2 | أَلْفَ سَنَةٍ إِلَّا خَمْسِينَ عَامًا | A tall stack of calendar pages with a few torn off at the bottom, showing the idea of many years less a few; no figures |
| `ch48-ninety-nine-and-one-flock.png` | `ch48-l07` cards 3, 4 | الْأَعْدَادُ الْمُرَكَّبَةُ بِالْوَاوِ · لَهُۥ تِسْعٌ وَتِسْعُونَ نَعْجَةً | A hillside with a large flock of sheep seen from behind and one sheep set apart near a fence; no figures |
| `ch48-hundred-years-sleeping-donkey-bones.png` | `ch48-l07` cards 5, 6 | مِائَةٌ · فَأَمَاتَهُ اللَّهُ مِائَةَ عَامٍ | A quiet hillside with a donkey standing at a distance, a small heap of bones and a clay jug; symbolic, no figures |
| `ch48-review-clock-numbers-scale.png` | `ch48-l08` cards 1, 2 | خُلَاصَةُ الْبَابِ · Instrument or unit? | A desk with a small clock, a row of numbered tiles and a balance scale; no figures |
| `ch49-said-and-known-two-speech-bubbles.png` | `ch49-l01` cards 1, 2, 3, 4 | جُمْلَةٌ دَاخِلَ جُمْلَةٍ · قَالَ الْمُعَلِّمُ إِنَّ الدَّرْسَ سَهْلٌ · عَلِمَ الطَّالِبُ أَنَّ الدَّرْسَ سَهْلٌ · قَالَ إِنِّي أَعْلَمُ مَا لَا تَعْلَمُونَ | Two clean speech-bubble shapes on a desk, the second tucked inside the first, next to a closed book; no figures |
| `ch49-clause-as-predicate-bracket.png` | `ch49-l01` card 5 | A short reminder: a clause as predicate | A notebook page with a curly bracket drawn around the second half of a short line; no figures |
| `ch49-that-and-as-if-lantern-and-lion.png` | `ch49-l02` cards 1, 2, 3, 4, 5 | إِنَّ وَأَنَّ · أَلَمْ تَعْلَمْ أَنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ · كَأَنَّ لِلتَّشْبِيهِ · كَأَنَّهُمْ لَا يَعْلَمُونَ · Short أَنْ is a different word | Split scene: a lit lantern beside an open book (that) and a small statue of a lion next to a sleeping cat’s basket (as if); no figures |
| `ch49-three-sisters-signposts.png` | `ch49-l07` cards 1, 2, 3, 4, 5, 6, 7 | أَخَوَاتُ إِنَّ · الدَّرْسُ طَوِيلٌ لَكِنَّهُ سَهْلٌ · وَلَٰكِنَّ أَكْثَرَ النَّاسِ لَا يَعْلَمُونَ · لَعَلَّ الطَّالِبَ فِي الْمَسْجِدِ · لَعَلَّكُمْ تَتَّقُونَ · يَا لَيْتَنِي كُنْتُ مَعَهُمْ · لَيْتَ الدَّرْسَ سَهْلٌ | Three signposts at a crossing: one pointing two ways (but), one with a rising sun (perhaps), one with a star above a closed door (if only); no figures |
| `ch49-which-word-phrase-links.png` | `ch49-l03` cards 1, 2, 3, 4, 5 | ثَلَاثَةُ أَنْوَاعٍ · رَبِّ الْعَالَمِينَ · الصِّرَاطَ الْمُسْتَقِيمَ · حِينٌ مِنَ الدَّهْرِ · When the case settles it | A desk with three books connected by coloured threads to a lamp, a pen and a bookshelf, showing which item goes with which; no figures |
| `ch49-relative-clause-thread-to-book.png` | `ch49-l04` cards 1, 2, 3, 4, 5, 6 | الْجُمْلَةُ الْوَاصِفَةُ · الْكِتَابُ الَّذِي قَرَأْتُهُ جَدِيدٌ · الطَّالِبُ الَّذِي كَتَبَ الدَّرْسَ مُجْتَهِدٌ · صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ · الَّذِي بِيَدِهِ الْمُلْكُ · A selected pattern, not a rule for every clause | An open book with a single thread running from its cover back to a small card that reads like a note; no figures |
| `ch49-review-layers-stack.png` | `ch49-l06` cards 1, 2 | خُلَاصَةُ الْبَابِ · Short أَنْ is different | Three stacked transparent trays on a desk, each holding a small card; no figures |
| `ch50-reading-clues-pointing-arrows.png` | `ch50-l02` cards 1, 4 | الْقِرَاءَةُ بِالْقَرَائِنِ · Two ayat, one sentence | A page of text with three small arrows pointing from three words to objects beside the page; no figures |
| `ch50-promise-and-exception-gate.png` | `ch50-l02` cards 2, 3 | وَلَا تَقُولَنَّ لِشَا۟ىْءٍ إِنِّى فَاعِلٌ ذَٰلِكَ غَدًا · إِلَّآ أَن يَشَآءَ اللَّهُ ۚ وَاذْكُر رَّبَّكَ إِذَا نَسِيتَ وَقُلْ عَسَىٰٓ أَن يَهْدِيَنِ رَبِّى لِأَقْرَبَ مِنْ هَٰذَا رَشَدًا | A path to a distant hill that passes through a gate standing slightly open, with a calendar page showing tomorrow; no figures |
| `ch50-ayah-cut-in-three-chunks.png` | `ch50-l03` cards 1, 2, 3, 4, 5 | قِطَعُ الْآيَةِ · يَوْمَئِذٍ · يُوَفِّيهِمُ اللَّهُ دِينَهُمُ الْحَقَّ · وَيَعْلَمُونَ أَنَّ اللَّهَ هُوَ الْحَقُّ الْمُبِينُ · الْحَقُّ الْمُبِينُ | A long ribbon of paper cut into three parts laid side by side on a desk; no figures |
| `ch50-adiyat-racers-dawn-dust.png` | `ch50-l07` cards 1, 2, 3, 4, 5, 6, 7 | قِرَاءَةُ السُّورَةِ بِالتَّسَلْسُلِ · وَالْعَٰدِيَٰتِ ضَبْحًا · فَالْمُورِيَٰتِ قَدْحًا · فَالْمُغِيرَٰتِ صُبْحًا · فَأَثَرْنَ بِهِۦ نَقْعًا · فَوَسَطْنَ بِهِۦ جَمْعًا · One order, five pictures | A wide dawn landscape: a trail of dust and sparks across rocky ground, hoof-marks and a line of riderless silhouettes seen from far away; no figures, no faces |
| `ch50-adiyat-turn-ungrateful-wealth-and-graves.png` | `ch50-l08` cards 1, 2, 3, 4, 5, 6, 7, 8 | السُّورَةُ تَنْتَقِلُ · إِنَّ الْإِنسَٰنَ لِرَبِّهِۦ لَكَنُودٌ · وَإِنَّهُۥ عَلَىٰ ذَٰلِكَ لَشَهِيدٌ · وَإِنَّهُۥ لِحُبِّ الْخَيْرِ لَشَدِيدٌ · ۞ أَفَلَا يَعْلَمُ إِذَا بُعْثِرَ مَا فِى الْقُبُورِ · وَحُصِّلَ مَا فِى الصُّدُورِ · إِنَّ رَبَّهُم بِهِمْ يَوْمَئِذٍ لَّخَبِيرٌۢ · وَالْعَٰدِيَٰتِ ضَبْحًا فَالْمُورِيَٰتِ قَدْحًا فَالْمُغِيرَٰتِ صُبْحًا فَأَثَرْنَ بِهِۦ نَقْعًا فَوَسَطْنَ بِهِۦ جَمْعًا إِنَّ الْإِنسَٰنَ لِرَبِّهِۦ لَكَنُودٌ وَإِنَّهُۥ عَلَىٰ ذَٰلِكَ لَشَهِيدٌ وَإِنَّهُۥ لِحُبِّ الْخَيْرِ لَشَدِيدٌ أَفَلَا يَعْلَمُ إِذَا بُعْثِرَ مَا فِى الْقُبُورِ وَحُصِّلَ مَا فِى الصُّدُورِ إِنَّ رَبَّهُم بِهِمْ يَوْمَئِذٍ لَّخَبِيرٌۢ | Split scene: a heap of coins and a locked chest on one side, an open field of small earth mounds on the other; no figures |
| `ch50-zalzalah-shaking-earth-burdens.png` | `ch50-l09` cards 1, 2, 3, 4, 5, 6 | الْأَحْدَاثُ ثُمَّ النَّتَائِجُ · إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا · وَأَخْرَجَتِ الْأَرْضُ أَثْقَالَهَا · وَقَالَ الْإِنسَٰنُ مَا لَهَا · يَوْمَئِذٍ تُحَدِّثُ أَخْبَارَهَا · بِأَنَّ رَبَّكَ أَوْحَىٰ لَهَا | A wide plain with cracks in the earth, loose stones and chests rising to the surface and a distant crowd of tiny silhouettes seen from far above; no faces |
| `ch50-zalzalah-atom-weight-scales.png` | `ch50-l09` cards 7, 8, 9, 10 | يَوْمَئِذٍ يَصْدُرُ النَّاسُ أَشْتَاتًا لِّيُرَوْا۟ أَعْمَٰلَهُمْ · فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُۥ · وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُۥ · إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا وَأَخْرَجَتِ الْأَرْضُ أَثْقَالَهَا وَقَالَ الْإِنسَٰنُ مَا لَهَا يَوْمَئِذٍ تُحَدِّثُ أَخْبَارَهَا بِأَنَّ رَبَّكَ أَوْحَىٰ لَهَا يَوْمَئِذٍ يَصْدُرُ النَّاسُ أَشْتَاتًا لِّيُرَوْا۟ أَعْمَٰلَهُمْ فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُۥ وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُۥ | A balance scale holding one tiny grain on each pan, with a small light on one side and a small dark cloud on the other; no figures |
| `ch50-review-reading-desk.png` | `ch50-l06` cards 1, 2 | خُلَاصَةُ الْبَابِ · Evidence first | A reading desk with an open book, a ribbon bookmark and a small notepad with three ticks; no figures |

### Chapters 51–55

Requested 2026-10-04 with the batch-6 harvest (Docs/proposals/proposal-harvest-tracker.md): every discover card of the new or rewritten lessons — Chapter 51's `ch51-l09`, `l10`, `l07`, `l08` and review `ch51-l06`; Chapter 52's `ch52-l09`, `l07`, `l08` and review `ch52-l06`; Chapter 53's `ch53-l05`, `l08`, `l06`, `l07`; Chapter 54's `ch54-l08`, `l07`, `l05`, `l06` and the rewritten `ch54-l03`; Chapter 55's `ch55-l12`, `l09`, `l10`, `l11` and review `ch55-l13`. 99 scenes cover 145 cards. Quran scenes are symbolic and faceless (no human figure, no face, nothing that depicts Allah, a prophet or an angel); the At-Takwir scenes, especially for 81:8–9, are quiet and show no graphic content. Not yet mapped: the cards of the kept lessons of Chapters 51–55 — a later pass.

| Filename | Cards | Arabic | Brief |
|---|---|---|---|
| `ch51-teacher-teaching-board.png` | `ch51-l09` cards 1, 2, 3, 4 | الْوَزْنُ الثَّانِي: عَلَّمَ / يُعَلِّمُ · عَلَّمَ أَبِي الْوَلَدَ. · يُعَلِّمُ أَبِي الْوَلَدَ. · عَلَّمَتْ أُمِّي الْبِنْتَ. · تُعَلِّمُ أُمِّي الْبِنْتَ. | An empty classroom with a board and a pointer resting on its ledge, rows of desks; no figures |
| `ch51-knew-vs-taught-panels.png` | `ch51-l09` cards 5, 6 | Same root, different stem · Read the whole stem | Split panel: left, a notebook open to a filled page with a small lit lamp (knowing); right, a hand (no face) passing a book across a desk (teaching) |
| `ch51-adam-names-symbolic.png` | `ch51-l09` card 7 | وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا | Symbolic: a long table of plain unlabelled objects under soft light; no figures |
| `ch51-sealed-letter-on-path.png` | `ch51-l10` cards 1, 2, 3, 5 | الْوَزْنُ الرَّابِعُ: أَرْسَلَ / يُرْسِلُ · أَرْسَلَ أَبِي الْكِتَابَ. · يُرْسِلُ أَبِي الْكِتَابَ. · تُرْسِلُ أُمِّي الْكِتَابَ. · لَنْ يُرْسِلَ أَبِي الْكِتَابَ. · لَمْ يُرْسِلْ أَبِي الْكِتَابَ. | A sealed letter leaving a hand (no face) towards a distant doorway along a dotted path |
| `ch51-hamza-two-jobs-panels.png` | `ch51-l10` card 4 | Is the أَ a person marker? | Split panel: left, a notebook with a pen mid-stroke (I write); right, a parcel set on a doorstep (it was sent); no figures |
| `ch51-one-family-only-signpost.png` | `ch51-l10` card 6 | One verb family only | A wooden signpost with one path marked and other paths fading into mist. No lettering, no figures |
| `ch51-sent-guidance-symbolic.png` | `ch51-l10` card 7 | هُوَ الَّذِي أَرْسَلَ رَسُولَهُ | Symbolic: a lamp placed on a hilltop sending a line of light across a dark plain. No figures |
| `ch51-lesson-written-notebook.png` | `ch51-l07` cards 1, 4 | الْمَاضِي الْمَجْهُولُ: فُعِلَ · Doer named or not | A notebook page filled with neat lines, a pen laid beside it. No figures |
| `ch51-door-open-courtyard.png` | `ch51-l07` card 2 | فَتَحَ الْوَلَدُ الْبَابَ. ← فُتِحَ الْبَابُ. | A wooden door standing open onto a bright courtyard, a key still in the lock. No figures |
| `ch51-window-opened-morning.png` | `ch51-l07` card 3 | فُتِحَتِ النَّافِذَةُ. | A window thrown open onto a morning garden, the curtain moving. No figures |
| `ch51-doer-left-out-panel.png` | `ch51-l07` card 5 | Not named does not mean unknown | Two panels: a hand (no face) opening a door; the same door open with the hand gone. No figures |
| `ch51-fasting-prescribed-symbolic.png` | `ch51-l07` card 6 | كُتِبَ عَلَيْكُمُ الصِّيَامُ | Symbolic: a crescent moon over a quiet street with a lantern lit at a doorway; no figures |
| `ch51-created-weak-symbolic.png` | `ch51-l07` card 7 | وَخُلِقَ الْإِنسَانُ ضَعِيفًا | Symbolic: a single small seedling growing through cracked earth, soft light on it; no figures |
| `ch51-written-every-day-notebook.png` | `ch51-l08` card 1 | الْمُضَارِعُ الْمَجْهُولُ: يُفْعَلُ | A notebook page being filled line by line with a pen that is lifted off the page, no hand visible. No figures |
| `ch51-door-and-window-opened.png` | `ch51-l08` card 2 | يُفْتَحُ الْبَابُ. · تُفْتَحُ النَّافِذَةُ. | A courtyard with a wooden door and a window both standing open in the morning. No figures |
| `ch51-same-stem-two-ends.png` | `ch51-l08` card 3 | Voice changes the stem, mood changes the end | Two identical wooden blocks, one with a small gold peg on its left end, one on its right: same shape, different end. No lettering, no figures |
| `ch51-three-yu-doors.png` | `ch51-l08` card 4 | Three verbs that all start with يُـ | Three identical doorways side by side with three different keys hanging beside them. No lettering, no figures |
| `ch51-verb-vs-noun-panels.png` | `ch51-l08` card 5 | A verb, not a noun form | Split panel: left, a pen mid-stroke (an action); right, a page already written (a described thing). No figures |
| `ch51-scales-nothing-taken-symbolic.png` | `ch51-l08` card 6 | يُؤْخَذُ مِنْهَا عَدْلٌ | Symbolic: an empty balance scale with both pans level under a plain sky. No figures |
| `ch51-review-verb-desk.png` | `ch51-l06` cards 1, 2 | خُلَاصَةُ الْبَابِ · Whole word, not first letter | A reading desk with an open book, a ribbon bookmark and a notepad with three ticks; no figures |
| `ch53-signs-sky-and-earth.png` | `ch53-l05` cards 1, 2, 3 | الْقِرَاءَةُ بِالْأَجْزَاءِ · إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ · الَّذِينَ يَذْكُرُونَ اللَّهَ | A wide view of a night sky turning to dawn over a plain with a lone tree and a river, light on both halves; no figures |
| `ch53-three-postures-rug.png` | `ch53-l05` card 4 | قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ | Three prayer rugs side by side seen from above, each with a different set of footprints marks: standing, seated, resting on one side; no figures |
| `ch53-reflect-lamp-window.png` | `ch53-l05` cards 5, 6 | وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ · رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا | A lit lamp on a sill beside an open window looking out at the stars; no figures |
| `ch53-ask-protection-hands.png` | `ch53-l05` card 7 | فَقِنَا عَذَابَ النَّارِ | Two open hands raised together in dua seen from a low angle against the sky; no faces |
| `ch53-chunk-markers-path.png` | `ch53-l05` card 8 | Chunk, then connect | A winding path cut by small wooden markers into five sections; no lettering, no figures |
| `ch53-open-window-wide-sky.png` | `ch53-l08` cards 1, 2 | الشَّرْحُ: أَرْبَعُ نِعَمٍ وَوَعْدٌ وَطَلَبَانِ · أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ | A wide window thrown open onto an expanse of sky and hills at dawn; no figures |
| `ch53-burden-set-down-road.png` | `ch53-l08` card 3 | وَوَضَعْنَا عَنكَ وِزْرَكَ الَّذِي أَنقَضَ ظَهْرَكَ | A heavy bundle set down beside a road with a pack-strap lying loose; no figures |
| `ch53-raised-banner-symbolic.png` | `ch53-l08` card 4 | وَرَفَعْنَا لَكَ ذِكْرَكَ | Symbolic: a plain unmarked banner flying high above rooftops against a clear sky; no figures |
| `ch53-two-doors-one-key.png` | `ch53-l08` card 5 | فَإِنَّ مَعَ الْعُسْرِ يُسْرًا | Two doors side by side, one dark and one lit, with the same key hanging between them; no figures |
| `ch53-finished-then-rise-mat.png` | `ch53-l08` cards 6, 7, 8 | فَإِذَا فَرَغْتَ فَانصَبْ · وَإِلَىٰ رَبِّكَ فَارْغَب · أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ وَوَضَعْنَا عَنكَ وِزْرَكَ الَّذِي أَنقَضَ ظَهْرَكَ وَرَفَعْنَا لَكَ ذِكْرَكَ فَإِنَّ مَعَ الْعُسْرِ يُسْرًا إِنَّ مَعَ الْعُسْرِ يُسْرًا فَإِذَا فَرَغْتَ فَانصَبْ وَإِلَىٰ رَبِّكَ فَارْغَب | A folded work apron beside a prayer rug laid out and ready; no figures |
| `ch53-morning-light-over-dunes.png` | `ch53-l06` cards 1, 2 | الضُّحَى: الِافْتِتَاحُ · وَالضُّحَىٰ | Bright mid-morning light across a wide plain, long soft shadows, a distant ridge; no figures |
| `ch53-night-settling-still-sky.png` | `ch53-l06` card 3 | وَاللَّيْلِ إِذَا سَجَىٰ | A still dark sky settling over a quiet town with one lit window; no figures |
| `ch53-not-abandoned-open-door.png` | `ch53-l06` card 4 | مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ | A door left open with a lamp lit just inside; no figures |
| `ch53-better-ahead-road-two-lights.png` | `ch53-l06` card 5 | وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ | A road that climbs towards a distant brighter horizon, a small lamp nearer the start; no figures |
| `ch53-promise-full-cup.png` | `ch53-l06` card 6 | وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ | A cup being filled steadily from a pitcher until it is full, no hands or faces; soft morning light |
| `ch53-two-oaths-denials-promises.png` | `ch53-l06` card 7 | وَالضُّحَىٰ وَاللَّيْلِ إِذَا سَجَىٰ مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ | Three lanterns of different sizes in a row on a low wall at dawn; no figures |
| `ch53-memory-to-request-bridge.png` | `ch53-l07` cards 1, 8 | الضُّحَى: مِنَ التَّذْكِيرِ إِلَى الْأَمْرِ · وَالضُّحَىٰ وَاللَّيْلِ إِذَا سَجَىٰ مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ وَوَجَدَكَ ضَالًّا فَهَدَىٰ وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ | A short stone bridge between two lit courtyards over a quiet stream; no figures |
| `ch53-refuge-small-house-lamp.png` | `ch53-l07` card 2 | أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ | A small house with a warm lit window on a quiet street at dusk; no figures |
| `ch53-guided-path-signpost.png` | `ch53-l07` card 3 | وَوَجَدَكَ ضَالًّا فَهَدَىٰ | A winding path through hills marked by a single wooden signpost and a lamp; no figures |
| `ch53-enriched-full-granary.png` | `ch53-l07` card 4 | وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ | A modest granary with its door open on filled sacks; no figures |
| `ch53-orphan-small-shoes-bench.png` | `ch53-l07` card 5 | فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ | A pair of small shoes set beside a bench in a courtyard with a cup of water and a plate of bread; no figures |
| `ch53-petitioner-open-gate-bread.png` | `ch53-l07` card 6 | وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ | A gate left open with a loaf of bread set on the wall beside it; no figures |
| `ch53-favor-spoken-lamp-window.png` | `ch53-l07` card 7 | وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ | A lit lamp in a window open toward the street, a ribbon of light falling outside; no figures |
| `ch54-wisdom-lantern-open-book.png` | `ch54-l08` cards 1, 2 | حِكْمَةُ لُقْمَانَ فِي ثَلَاثَةِ أَجْزَاءٍ · وَلَقَدْ آتَيْنَا لُقْمَانَ الْحِكْمَةَ أَنِ اشْكُرْ لِلَّهِ | A lit lantern beside an open plain book on a low table in a quiet room; no figures |
| `ch54-thanks-returns-bowl.png` | `ch54-l08` cards 3, 6 | وَمَن يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ · Find where the response begins | A shallow bowl catching water from a spout and overflowing back into the same basin; no figures |
| `ch54-free-of-need-still-lake.png` | `ch54-l08` card 4 | وَمَن كَفَرَ فَإِنَّ اللَّهَ غَنِيٌّ حَمِيدٌ | A still mountain lake at dawn with nothing disturbing its surface; no figures |
| `ch54-only-one-door-open.png` | `ch54-l08` card 5 | إِنَّ or إِنَّمَا? | A long wall with many doors, only one standing open with a light behind it; no figures |
| `ch54-forms-toolbox-open.png` | `ch54-l07` cards 1, 5 | صُوَرٌ مُخْتَارَةٌ، وَاحِدَةً وَاحِدَةً · Command, active, passive | An open wooden toolbox with differently shaped tools laid in separate compartments; no lettering, no figures |
| `ch54-certainly-finished-tick.png` | `ch54-l07` card 2 | قَدْ أَفْلَحَ الْمُؤْمِنُونَ | A completed task board with a single large tick over a finished row; no lettering, no figures |
| `ch54-particle-then-end-panels.png` | `ch54-l07` card 3 | Particle and ending | Three identical rope ends, each tied with a different knot: nothing, a loop, a flat tie; no figures |
| `ch54-noun-ending-verb-ending-panels.png` | `ch54-l07` card 4 | A noun ending or a verb form? | Split panel: left, a row of buildings ending in a shared wall (a joined pair); right, two walkers' footprints in sand going the same way; no faces, no figures |
| `ch54-numbers-eleven-stars.png` | `ch54-l03` cards 1, 2 | الْمَقَادِيرُ وَالْعِبَارَاتُ وَالْجُمَلُ · ثَلَاثَةُ أَيَّامٍ · أَحَدَ عَشَرَ كَوْكَبًا | A night sky with eleven distinct stars in two gentle clusters above a quiet hillside; no figures |
| `ch54-time-wall-clock-plain.png` | `ch54-l03` card 3 | مَا هِيَ السَّاعَةُ؟ | A plain round wall clock with no numerals, reading three o'clock, on a bare wall; no figures |
| `ch54-three-openers-three-windows.png` | `ch54-l03` card 4 | Three small sentence openers | Three windows in a row: one with a tentative light, one with a closed shutter half-open, one with a lamp set wide for a wish; no figures |
| `ch54-sit-in-mosque-and-condition.png` | `ch54-l03` card 5 | أُرِيدُ أَنْ أَجْلِسَ فِي الْمَسْجِدِ. | A prayer rug in a mosque courtyard with an open door and a lit path beyond; no figures |
| `ch54-fatiha-open-book-light.png` | `ch54-l05` cards 1, 6 | الْفَاتِحَةُ: الْحَمْدُ وَالْوَصْفُ · بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ الرَّحْمَٰنِ الرَّحِيمِ مَالِكِ يَوْمِ الدِّينِ | An open Mushaf on a rehal in soft morning light, nothing else in the frame; no figures |
| `ch54-name-over-doorway-arch.png` | `ch54-l05` card 2 | بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ | A plain arched doorway with an unlettered keystone, light behind it; no figures |
| `ch54-praise-worlds-sky-sea.png` | `ch54-l05` card 3 | الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ | A wide view of sea, land and sky meeting at one horizon; no figures |
| `ch54-mercy-rain-over-fields.png` | `ch54-l05` card 4 | الرَّحْمَٰنِ الرَّحِيمِ | Gentle rain falling over green fields from a lit grey sky; no figures |
| `ch54-sovereignty-scale-and-hourglass.png` | `ch54-l05` card 5 | مَالِكِ يَوْمِ الدِّينِ | A balance scale beside a large hourglass on a plain table; no figures |
| `ch54-one-path-toward-horizon.png` | `ch54-l06` cards 1, 2, 6 | الْفَاتِحَةُ: الدُّعَاءُ · إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ · The request and its description | A single straight path across an open plain towards a bright horizon; no figures |
| `ch54-two-hands-cupped-ask.png` | `ch54-l06` card 3 | اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ | Two cupped hands held open at chest height against a soft sky; no faces |
| `ch54-path-with-fenced-sides.png` | `ch54-l06` card 4 | صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ | A straight path with a plain fence on each side and open fields beyond the fence; no figures |
| `ch54-fatiha-seven-lamps.png` | `ch54-l06` card 5 | بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ الرَّحْمَٰنِ الرَّحِيمِ مَالِكِ يَوْمِ الدِّينِ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ | Seven small lamps in a row along a low wall at dawn; no figures |
| `ch55-three-signs-one-kasra.png` | `ch55-l12` cards 1, 5, 6 | كَسْرَةٌ وَاحِدَةٌ، حَالَتَانِ · The same kasra, two roles · Other plurals have their own signs | Three small wooden signs on posts, two painted identically and one different, beside a path; no lettering, no figures |
| `ch55-teachers-in-school-seen-behind.png` | `ch55-l12` card 2 | الْمُعَلِّمَاتُ فِي الْمَدْرَسَةِ. | A classroom seen from the back of the room with rows of desks and a board; no figures |
| `ch55-seen-teachers-from-gate.png` | `ch55-l12` card 3 | رَأَيْتُ الْمُعَلِّمَاتِ. | A school gate looking onto a courtyard with benches, light on the benches; no figures |
| `ch55-went-to-teachers-path.png` | `ch55-l12` card 4 | ذَهَبْتُ إِلَى الْمُعَلِّمَاتِ. · كِتَابُ الْمُعَلِّمَاتِ. | A short path leading from a gate across a courtyard to a lit doorway; no figures |
| `ch55-heavens-and-earth-created.png` | `ch55-l12` cards 7, 8 | خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ · فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ | Sky above and land below meeting at a quiet horizon, a thin line of light between them; no figures |
| `ch55-believing-women-men-symbolic.png` | `ch55-l12` card 9 | وَالْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ | Symbolic: two rows of folded prayer rugs side by side in a quiet mosque; no figures |
| `ch55-staircase-of-events-light.png` | `ch55-l09` cards 1, 7, 8 | إِذَا كَثِيرَةٌ وَجَوَابٌ وَاحِدٌ · إِذَا الشَّمْسُ كُوِّرَتْ وَإِذَا النُّجُومُ انكَدَرَتْ وَإِذَا الْجِبَالُ سُيِّرَتْ وَإِذَا الْعِشَارُ عُطِّلَتْ وَإِذَا الْوُحُوشُ حُشِرَتْ وَإِذَا الْبِحَارُ سُجِّرَتْ وَإِذَا النُّفُوسُ زُوِّجَتْ وَإِذَا الْمَوْءُودَةُ سُئِلَتْ بِأَيِّ ذَنبٍ قُتِلَتْ وَإِذَا الصُّحُفُ نُشِرَتْ وَإِذَا السَّمَاءُ كُشِطَتْ وَإِذَا الْجَحِيمُ سُعِّرَتْ وَإِذَا الْجَنَّةُ أُزْلِفَتْ عَلِمَتْ نَفْسٌ مَّا أَحْضَرَتْ · Events wait for the conclusion | A long stone staircase of twelve steps rising towards a single lit doorway at the top; no figures |
| `ch55-sun-stars-mountains-dim-sky.png` | `ch55-l09` card 2 | إِذَا الشَّمْسُ كُوِّرَتْ وَإِذَا النُّجُومُ انكَدَرَتْ وَإِذَا الْجِبَالُ سُيِّرَتْ | A darkening sky with a dimmed sun, scattered stars and distant mountains on the horizon; no figures |
| `ch55-camels-beasts-seas-souls.png` | `ch55-l09` card 3 | وَإِذَا الْعِشَارُ عُطِّلَتْ وَإِذَا الْوُحُوشُ حُشِرَتْ وَإِذَا الْبِحَارُ سُجِّرَتْ وَإِذَا النُّفُوسُ زُوِّجَتْ | A wide plain with empty camel pens, wild animals gathered at a distance and a sea glowing at the horizon; no figures |
| `ch55-question-quiet-field-sober.png` | `ch55-l09` card 4 | وَإِذَا الْمَوْءُودَةُ سُئِلَتْ بِأَيِّ ذَنبٍ قُتِلَتْ | A quiet empty field under a pale sky with one small stone marker; no figures, no graphic content |
| `ch55-pages-sky-fire-garden.png` | `ch55-l09` card 5 | وَإِذَا الصُّحُفُ نُشِرَتْ وَإِذَا السَّمَاءُ كُشِطَتْ وَإِذَا الْجَحِيمُ سُعِّرَتْ وَإِذَا الْجَنَّةُ أُزْلِفَتْ | Four panels: open pages in a ledger, a peeled-back sky, a distant fire glow, a green garden drawn near; no figures |
| `ch55-soul-knows-brought-bundle.png` | `ch55-l09` card 6 | عَلِمَتْ نَفْسٌ مَّا أَحْضَرَتْ | A small bundle set down on a table in a still room with a lamp beside it; no figures |
| `ch55-oaths-sky-stars-dawn.png` | `ch55-l10` cards 1, 2, 3, 4, 8 | قَسَمٌ وَوَصْفٌ · فَلَا أُقْسِمُ بِالْخُنَّسِ الْجَوَارِ الْكُنَّسِ · وَاللَّيْلِ إِذَا عَسْعَسَ · وَالصُّبْحِ إِذَا تَنَفَّسَ · فَلَا أُقْسِمُ بِالْخُنَّسِ الْجَوَارِ الْكُنَّسِ وَاللَّيْلِ إِذَا عَسْعَسَ وَالصُّبْحِ إِذَا تَنَفَّسَ إِنَّهُ لَقَوْلُ رَسُولٍ كَرِيمٍ ذِي قُوَّةٍ عِندَ ذِي الْعَرْشِ مَكِينٍ مُّطَاعٍ ثَمَّ أَمِينٍ | A night sky with a few stars sinking toward the horizon as the first thin dawn light appears; no figures |
| `ch55-noble-messenger-symbolic-light.png` | `ch55-l10` card 5 | إِنَّهُ لَقَوْلُ رَسُولٍ كَرِيمٍ | Symbolic: a single column of soft light reaching down onto a quiet plain, no shape within it; no figures |
| `ch55-throne-secure-gate-symbolic.png` | `ch55-l10` cards 6, 7 | ذِي قُوَّةٍ عِندَ ذِي الْعَرْشِ مَكِينٍ · مُّطَاعٍ ثَمَّ أَمِينٍ | Symbolic: a tall gate of pale stone standing open on a bright space, nothing visible beyond the threshold; no figures |
| `ch55-denials-open-doors-daylight.png` | `ch55-l11` cards 1, 2 | نَفْيٌ وَسُؤَالٌ وَتَذْكِيرٌ · وَمَا صَاحِبُكُم بِمَجْنُونٍ وَلَقَدْ رَآهُ بِالْأُفُقِ الْمُبِينِ وَمَا هُوَ عَلَى الْغَيْبِ بِضَنِينٍ وَمَا هُوَ بِقَوْلِ شَيْطَانٍ رَّجِيمٍ | A long hall of open doors in daylight, each opening onto the same bright courtyard; no figures |
| `ch55-where-going-crossroads.png` | `ch55-l11` card 3 | فَأَيْنَ تَذْهَبُونَ | A crossroads with four paths, one of them straight and lit by a lamp; no figures |
| `ch55-reminder-lamp-on-sill.png` | `ch55-l11` cards 4, 5, 6 | إِنْ هُوَ إِلَّا ذِكْرٌ لِّلْعَالَمِينَ · لِمَن شَاءَ مِنكُمْ أَن يَسْتَقِيمَ · وَمَا تَشَاءُونَ إِلَّا أَن يَشَاءَ اللَّهُ رَبُّ الْعَالَمِينَ | A small lamp on a window sill facing a dark street; no figures |
| `ch55-whole-surah-three-lamps.png` | `ch55-l11` cards 7, 8 | إِذَا الشَّمْسُ كُوِّرَتْ وَإِذَا النُّجُومُ انكَدَرَتْ وَإِذَا الْجِبَالُ سُيِّرَتْ وَإِذَا الْعِشَارُ عُطِّلَتْ وَإِذَا الْوُحُوشُ حُشِرَتْ وَإِذَا الْبِحَارُ سُجِّرَتْ وَإِذَا النُّفُوسُ زُوِّجَتْ وَإِذَا الْمَوْءُودَةُ سُئِلَتْ بِأَيِّ ذَنبٍ قُتِلَتْ وَإِذَا الصُّحُفُ نُشِرَتْ وَإِذَا السَّمَاءُ كُشِطَتْ وَإِذَا الْجَحِيمُ سُعِّرَتْ وَإِذَا الْجَنَّةُ أُزْلِفَتْ عَلِمَتْ نَفْسٌ مَّا أَحْضَرَتْ فَلَا أُقْسِمُ بِالْخُنَّسِ الْجَوَارِ الْكُنَّسِ وَاللَّيْلِ إِذَا عَسْعَسَ وَالصُّبْحِ إِذَا تَنَفَّسَ إِنَّهُ لَقَوْلُ رَسُولٍ كَرِيمٍ ذِي قُوَّةٍ عِندَ ذِي الْعَرْشِ مَكِينٍ مُّطَاعٍ ثَمَّ أَمِينٍ وَمَا صَاحِبُكُم بِمَجْنُونٍ وَلَقَدْ رَآهُ بِالْأُفُقِ الْمُبِينِ وَمَا هُوَ عَلَى الْغَيْبِ بِضَنِينٍ وَمَا هُوَ بِقَوْلِ شَيْطَانٍ رَّجِيمٍ فَأَيْنَ تَذْهَبُونَ إِنْ هُوَ إِلَّا ذِكْرٌ لِّلْعَالَمِينَ لِمَن شَاءَ مِنكُمْ أَن يَسْتَقِيمَ وَمَا تَشَاءُونَ إِلَّا أَن يَشَاءَ اللَّهُ رَبُّ الْعَالَمِينَ · Read the whole surah | Three lamps of different sizes on a low wall at the edge of a field; no figures |
| `ch55-review-reading-desk.png` | `ch55-l13` cards 1, 2 | خُلَاصَةُ الْبَابِ · Role first, then sign | A reading desk with an open book, a ribbon bookmark and a small notepad with three ticks; no figures |
| `ch52-if-then-two-doors.png` | `ch52-l09` cards 1, 2, 4 | الشَّرْطُ وَالْجَوَابُ بِـ مَنْ · مَنْ يَدْرُسْ فَهُوَ نَاجِحٌ. · Where the condition stops | Two doors in a line, the first standing open onto a short path that leads to the second, which is lit from within; no figures |
| `ch52-who-or-whoever-panels.png` | `ch52-l09` card 3 | Question or condition? | Split panel: left, an empty chair with a question-mark-shaped lamp above it; right, a path that continues past a signpost to a lit doorway. No lettering, no figures |
| `ch52-reliance-lantern-symbolic.png` | `ch52-l09` card 5 | وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ | Symbolic: a lit lantern resting on an open palm held up at dusk, no face |
| `ch52-night-desert-stars-calm.png` | `ch52-l07` cards 1, 2, 7 | لَيْلَةٌ وَاحِدَةٌ تُوصَفُ · إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ · إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ | A wide still desert under a field of stars, a low crescent moon and a faint line of light along the horizon; no figures |
| `ch52-night-question-open-sky.png` | `ch52-l07` card 3 | وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ | A single lantern on a dune looking out over a dark open sky; no figures |
| `ch52-night-scale-thousand-months.png` | `ch52-l07` card 4 | لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ | A long row of small crescent moons in a line across a plain next to one large glowing one; no figures |
| `ch52-columns-of-light-descend.png` | `ch52-l07` card 5 | تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ | Symbolic: soft columns of light descending from a night sky onto a quiet courtyard; no figures |
| `ch52-peace-until-dawn-horizon.png` | `ch52-l07` card 6 | سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ | A quiet courtyard just before sunrise with a thin line of dawn light on the horizon; no figures |
| `ch52-four-parts-signposts.png` | `ch52-l08` cards 1, 8 | سُورَةٌ فِي أَرْبَعَةِ أَجْزَاءٍ · وَالتِّينِ وَالزَّيْتُونِ وَطُورِ سِينِينَ وَهَٰذَا الْبَلَدِ الْأَمِينِ لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ ثُمَّ رَدَدْنَاهُ أَسْفَلَ سَافِلِينَ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ فَلَهُمْ أَجْرٌ غَيْرُ مَمْنُونٍ فَمَا يُكَذِّبُكَ بَعْدُ بِالدِّينِ أَلَيْسَ اللَّهُ بِأَحْكَمِ الْحَاكِمِينَ | Four wooden signposts in a row along a path, each pointing in a slightly different direction; no lettering, no figures |
| `ch52-fig-olive-sinai-city.png` | `ch52-l08` card 2 | وَالتِّينِ وَالزَّيْتُونِ وَطُورِ سِينِينَ وَهَٰذَا الْبَلَدِ الْأَمِينِ | A fig tree and an olive tree in the foreground, a rocky mountain behind them and a calm walled city in the far distance; no figures |
| `ch52-best-form-vessel.png` | `ch52-l08` card 3 | لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ | A finely balanced clay vessel with an even shape standing on a flat table in morning light; no figures |
| `ch52-lowest-of-low-stairs-down.png` | `ch52-l08` card 4 | ثُمَّ رَدَدْنَاهُ أَسْفَلَ سَافِلِينَ | A long stone staircase descending into shadow, one lit step at the top; no figures |
| `ch52-exception-open-gate.png` | `ch52-l08` card 5 | إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ فَلَهُمْ أَجْرٌ غَيْرُ مَمْنُونٍ | A closed row of gates with one gate standing open onto a lit garden path; no figures |
| `ch52-questions-empty-desk.png` | `ch52-l08` cards 6, 7 | فَمَا يُكَذِّبُكَ بَعْدُ بِالدِّينِ · أَلَيْسَ اللَّهُ بِأَحْكَمِ الْحَاكِمِينَ | An empty desk with an open notebook and two small lamps, each throwing a pool of light; no figures |
| `ch52-review-reading-desk.png` | `ch52-l06` cards 1, 2 | خُلَاصَةُ الْبَابِ · Boundaries first | A reading desk with an open book, a ribbon bookmark and a small notepad with three ticks; no figures |

### Chapters 61–65

Requested 2026-10-04 with the batch-8 harvest (Docs/proposals/proposal-harvest-tracker.md): every discover card of the new or rewritten lessons — Chapter 61's `ch61-l01`, `l02`, `l04`, `l05`, `l08`–`l10` and review `ch61-l07`; Chapter 62's `ch62-l02`, `l04`, `l06`, `l07` and review `ch62-l05`; Chapter 63's `ch63-l06`, `l07` and review `ch63-l05`; Chapter 64's `ch64-l03`, `l04`, `l06`–`l10` and review `ch64-l05`; Chapter 65's `ch65-l01`, `l05`, `l02`, `l07`, `l03`, `l04`, review `ch65-l06` and `ch65-l09`. 80 scenes cover 173 cards. Quran scenes are symbolic and faceless (no human figure, no face, nothing that depicts Allah, a prophet or an angel); the Al-Mutaffifin, Al-Balad and Al-Ghashiyah scenes show only scales, scrolls, doors, couches, fire, paths and landscapes, and the Thamud scenes show a valley, a watering place and a dust cloud, never a person or an animal's face. The CL17 lab `ch61-l03` has no discover cards. Not yet mapped: the cards of the kept lessons of Chapters 62–64 — a later pass.

| Filename | Cards | Arabic | Brief |
|---|---|---|---|
| `ch61-l01-market-stall.png` | `ch61-l01` cards 1, 2, 3, 8 | أَلْفَاظُ الصَّفْقَةِ · تِجَارَةٌ · بَاعَ · Two verbs, two directions | A market stall with crates of fruit and a hanging scale; no figures |
| `ch61-l01-buying.png` | `ch61-l01` cards 4, 5, 7 | اشْتَرَى · ثَمَنٌ · ۖ وَلَا تَشْتَرُوا بِآيَاتِي ثَمَنًا | A hand-drawn coin pile beside a bag of goods on a counter; no figures |
| `ch61-l01-profit-loss.png` | `ch61-l01` card 6 | الرِّبْحُ وَالْخَسَارَةُ | Two small trays, one with a tall stack of coins and one with a single coin |
| `ch61-l02-scale.png` | `ch61-l02` cards 1, 2, 4, 8 | الْوَزْنُ وَالْكَيْلُ · مِيزَانٌ · وَزْنٌ أَمْ كَيْلٌ؟ · Roots, not tables | A balance scale with gold coins on one pan; no figures |
| `ch61-l02-measure.png` | `ch61-l02` cards 3, 7 | مِكْيَالٌ · وَأَوْفُوا الْكَيْلَ إِذَا كِلْتُمْ وَزِنُوا بِالْقِسْطَاسِ الْمُسْتَقِيمِ ۚ ذَٰلِكَ خَيْرٌ وَأَحْسَنُ تَأْوِيلًا | A wooden measure heaped with wheat grains beside a sack; no figures |
| `ch61-l02-price-tag.png` | `ch61-l02` cards 5, 6 | ثَمَنُ ثَلَاثَةِ أَرْطَالٍ عَشَرَةُ رِيَالَاتٍ · وَإِذَا كَالُوهُمْ أَو وَّزَنُوهُمْ يُخْسِرُونَ | A hand-written price card next to three weights; no figures |
| `ch61-l04-tools-row.png` | `ch61-l04` cards 1, 2, 3, 4, 7 | كَلِمَاتُ الْآلَةِ تَبْدَأُ بِمِـ · مِفْتَاحٌ · مِقَصٌّ · مِكْنَسَةٌ · Recognise, do not generate | A shelf with a key, scissors and a broom side by side; no figures |
| `ch61-l04-scale-measure.png` | `ch61-l04` card 5 | الْمِيزَانُ وَالْمِكْيَالُ مَرَّةً أُخْرَى | A small balance scale beside a wooden measure; no figures |
| `ch61-l04-lamp-glass.png` | `ch61-l04` card 6 | فِيهَا مِصْبَاحٌ ۖ الْمِصْبَاحُ فِي زُجَاجَةٍ | An oil lamp inside a glass cover, glowing; no figures |
| `ch61-l05-tilted-scale.png` | `ch61-l05` cards 1, 2, 4, 5 | الْمُطَفِّفُ وَالسُّؤَالُ · وَيْلٌ لِّلْمُطَفِّفِينَ الَّذِينَ إِذَا اكْتَالُوا عَلَى النَّاسِ يَسْتَوْفُونَ وَإِذَا كَالُوهُمْ أَو وَّزَنُوهُمْ يُخْسِرُونَ · وَيْلٌ لِّلْمُطَفِّفِينَ الَّذِينَ إِذَا اكْتَالُوا عَلَى النَّاسِ يَسْتَوْفُونَ وَإِذَا كَالُوهُمْ أَو وَّزَنُوهُمْ يُخْسِرُونَ أَلَا يَظُنُّ أُولَٰئِكَ أَنَّهُم مَّبْعُوثُونَ لِيَوْمٍ عَظِيمٍ يَوْمَ يَقُومُ النَّاسُ لِرَبِّ الْعَالَمِينَ · Three words given whole | A balance scale tipped to one side with grain heaped on the lower pan; no figures |
| `ch61-l05-great-day.png` | `ch61-l05` card 3 | أَلَا يَظُنُّ أُولَٰئِكَ أَنَّهُم مَّبْعُوثُونَ لِيَوْمٍ عَظِيمٍ يَوْمَ يَقُومُ النَّاسُ لِرَبِّ الْعَالَمِينَ | A wide empty plain at dawn with a long row of footprints leading to the horizon; no figures |
| `ch61-l08-register.png` | `ch61-l08` cards 1, 2 | كَلَّا — كِتَابُ الْفُجَّارِ وَالْمُكَذِّبُونَ · كَلَّا إِنَّ كِتَابَ الْفُجَّارِ لَفِي سِجِّينٍ وَمَا أَدْرَاكَ مَا سِجِّينٌ كِتَابٌ مَّرْقُومٌ | A long scroll unrolled across a stone table, lines of script running along it; no figures |
| `ch61-l08-rusted-lock.png` | `ch61-l08` cards 3, 4 | وَيْلٌ يَوْمَئِذٍ لِّلْمُكَذِّبِينَ الَّذِينَ يُكَذِّبُونَ بِيَوْمِ الدِّينِ وَمَا يُكَذِّبُ بِهِ إِلَّا كُلُّ مُعْتَدٍ أَثِيمٍ · إِذَا تُتْلَىٰ عَلَيْهِ آيَاتُنَا قَالَ أَسَاطِيرُ الْأَوَّلِينَ كَلَّا ۖ بَلْ ۜ رَانَ عَلَىٰ قُلُوبِهِم مَّا كَانُوا يَكْسِبُونَ | A heavy lock covered in rust on a closed wooden door; no figures |
| `ch61-l08-no-sign.png` | `ch61-l08` cards 5, 6 | كَلَّا إِنَّهُمْ عَن رَّبِّهِمْ يَوْمَئِذٍ لَّمَحْجُوبُونَ ثُمَّ إِنَّهُمْ لَصَالُو الْجَحِيمِ ثُمَّ يُقَالُ هَٰذَا الَّذِي كُنتُم بِهِ تُكَذِّبُونَ · Whole meanings | A road sign with a crossed-out arrow at a fork in the path; no figures |
| `ch61-l09-bright-scroll.png` | `ch61-l09` cards 1, 2 | كِتَابُ الْأَبْرَارِ · كَلَّا إِنَّ كِتَابَ الْأَبْرَارِ لَفِي عِلِّيِّينَ وَمَا أَدْرَاكَ مَا عِلِّيُّونَ كِتَابٌ مَّرْقُومٌ يَشْهَدُهُ الْمُقَرَّبُونَ | A bright scroll resting on a high shelf with light falling on it; no figures |
| `ch61-l09-couches.png` | `ch61-l09` card 3 | إِنَّ الْأَبْرَارَ لَفِي نَعِيمٍ عَلَى الْأَرَائِكِ يَنظُرُونَ تَعْرِفُ فِي وُجُوهِهِمْ نَضْرَةَ النَّعِيمِ | Embroidered couches with cushions in a garden terrace, nobody sitting; no figures |
| `ch61-l09-sealed-cup.png` | `ch61-l09` cards 4, 5, 6 | يُسْقَوْنَ مِن رَّحِيقٍ مَّخْتُومٍ خِتَامُهُ مِسْكٌ ۚ وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ · وَمِزَاجُهُ مِن تَسْنِيمٍ عَيْنًا يَشْرَبُ بِهَا الْمُقَرَّبُونَ · Two registers, one phrase | A sealed jar with a wax seal beside a small spring; no figures |
| `ch61-l10-street-corner.png` | `ch61-l10` cards 1, 2 | انْقَلَبَ الضَّحِكُ · إِنَّ الَّذِينَ أَجْرَمُوا كَانُوا مِنَ الَّذِينَ آمَنُوا يَضْحَكُونَ وَإِذَا مَرُّوا بِهِمْ يَتَغَامَزُونَ وَإِذَا انقَلَبُوا إِلَىٰ أَهْلِهِمُ انقَلَبُوا فَكِهِينَ وَإِذَا رَأَوْهُمْ قَالُوا إِنَّ هَٰؤُلَاءِ لَضَالُّونَ | A narrow street corner with two empty doorways facing each other; no figures |
| `ch61-l10-turned-hourglass.png` | `ch61-l10` cards 3, 4 | وَمَا أُرْسِلُوا عَلَيْهِمْ حَافِظِينَ فَالْيَوْمَ الَّذِينَ آمَنُوا مِنَ الْكُفَّارِ يَضْحَكُونَ · عَلَى الْأَرَائِكِ يَنظُرُونَ هَلْ ثُوِّبَ الْكُفَّارُ مَا كَانُوا يَفْعَلُونَ | An hourglass turned on its side on a wooden table; no figures |
| `ch61-l10-scale-again.png` | `ch61-l10` cards 5, 6 | وَيْلٌ لِّلْمُطَفِّفِينَ الَّذِينَ إِذَا اكْتَالُوا عَلَى النَّاسِ يَسْتَوْفُونَ وَإِذَا كَالُوهُمْ أَو وَّزَنُوهُمْ يُخْسِرُونَ · Words given whole | A level balance scale, both pans even, in soft light; no figures |
| `ch62-l02-open-book.png` | `ch62-l02` cards 1, 2, 5, 8 | لَا رَيْبَ فِيهِ · لَا رَيْبَ ۛ فِيهِ · Read it, do not choose it · لَا إِلَٰهَ إِلَّا هُوَ | A closed book on a lectern with a soft light around it; no figures |
| `ch62-l02-empty-room.png` | `ch62-l02` cards 3, 4, 6, 7 | لَا أَحَدَ فِي الْبَيْتِ · لَا طَالِبَ فِي الْمَكْتَبَةِ · لَا رَيْبَ فِيهِ أَمْ لَيْسَ فِيهِ رَيْبٌ · ثَلَاثَةُ أَعْمَالٍ لِـ لَا | An empty room with a door ajar and a bare chair; no figures |
| `ch62-l04-classroom.png` | `ch62-l04` cards 1, 2, 7 | الْإِشَارَةُ فِي الصَّفِّ · مَا هَذَا؟ — هَذَا دَفْتَرٌ جَدِيدٌ. · Near, far and back | A classroom with desks, a notebook and pens on a table, and a bookshelf; no figures |
| `ch62-l04-library.png` | `ch62-l04` cards 3, 4 | هَؤُلَاءِ الطُّلَّابُ فِي الْمَكْتَبَةِ، وَأُولَئِكَ الْمُعَلِّمُونَ فِي الْمَدْرَسَةِ. · تِلْكَ الْمَكْتَبَةُ كَبِيرَةٌ | A large library hall with tall shelves seen from a distance; no figures |
| `ch62-l04-books-stack.png` | `ch62-l04` cards 5, 6 | هَذِهِ الْكُتُبُ جَدِيدَةٌ · وَكَذَٰلِكَ جَعَلْنَاكُمْ أُمَّةً | A neat stack of new books next to a shelf; no figures |
| `ch62-l06-waiting-road.png` | `ch62-l06` cards 1, 2 | الْبَيِّنَةُ · لَمْ يَكُنِ الَّذِينَ كَفَرُوا مِنْ أَهْلِ الْكِتَابِ وَالْمُشْرِكِينَ مُنفَكِّينَ حَتَّىٰ تَأْتِيَهُمُ الْبَيِّنَةُ | A long road toward a gate at the horizon with nobody on it; no figures |
| `ch62-l06-open-pages.png` | `ch62-l06` cards 3, 6 | رَسُولٌ مِّنَ اللَّهِ يَتْلُو صُحُفًا مُّطَهَّرَةً فِيهَا كُتُبٌ قَيِّمَةٌ · Given whole | A stack of clean pages on a wooden stand with a pen beside them; no figures |
| `ch62-l06-split-path.png` | `ch62-l06` cards 4, 5 | وَمَا تَفَرَّقَ الَّذِينَ أُوتُوا الْكِتَابَ إِلَّا مِن بَعْدِ مَا جَاءَتْهُمُ الْبَيِّنَةُ · وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ حُنَفَاءَ وَيُقِيمُوا الصَّلَاةَ وَيُؤْتُوا الزَّكَاةَ ۚ وَذَٰلِكَ دِينُ الْقَيِّمَةِ | A path splitting into several smaller paths in a meadow; no figures |
| `ch62-l07-two-doors.png` | `ch62-l07` cards 1, 2, 3 | نِهَايَتَانِ وَجَزَاءٌ · إِنَّ الَّذِينَ كَفَرُوا مِنْ أَهْلِ الْكِتَابِ وَالْمُشْرِكِينَ فِي نَارِ جَهَنَّمَ خَالِدِينَ فِيهَا ۚ أُولَٰئِكَ هُمْ شَرُّ الْبَرِيَّةِ · إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ أُولَٰئِكَ هُمْ خَيْرُ الْبَرِيَّةِ | Two doors side by side, one dark and one lit, in a long wall; no figures |
| `ch62-l07-garden-river.png` | `ch62-l07` cards 4, 5 | جَزَاؤُهُمْ عِندَ رَبِّهِمْ جَنَّاتُ عَدْنٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ خَالِدِينَ فِيهَا أَبَدًا ۖ رَّضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ ۚ ذَٰلِكَ لِمَنْ خَشِيَ رَبَّهُ · Who is who in 98:8 | A garden with a river running through it under trees; no figures |
| `ch62-review-signpost.png` | `ch62-l05` cards 1, 2 | خُلَاصَةُ الْبَابِ · Twelve tasks | A signpost with blank arms pointing in several directions; no figures |
| `ch61-review-market-board.png` | `ch61-l07` cards 1, 2 | خُلَاصَةُ الْبَابِ · Review the whole chapter | A market noticeboard with blank price cards and a hanging scale; no figures |
| `ch63-l06-sun-moon.png` | `ch63-l06` cards 1, 2, 5 | الْأَقْسَامُ ثُمَّ النَّفْسُ · وَالشَّمْسِ وَضُحَاهَا وَالْقَمَرِ إِذَا تَلَاهَا وَالنَّهَارِ إِذَا جَلَّاهَا وَاللَّيْلِ إِذَا يَغْشَاهَا · وَالشَّمْسِ وَضُحَاهَا وَالْقَمَرِ إِذَا تَلَاهَا وَالنَّهَارِ إِذَا جَلَّاهَا وَاللَّيْلِ إِذَا يَغْشَاهَا وَالسَّمَاءِ وَمَا بَنَاهَا وَالْأَرْضِ وَمَا طَحَاهَا وَنَفْسٍ وَمَا سَوَّاهَا فَأَلْهَمَهَا فُجُورَهَا وَتَقْوَاهَا قَدْ أَفْلَحَ مَن زَكَّاهَا وَقَدْ خَابَ مَن دَسَّاهَا | A bright sun low over hills with a pale moon in the same sky; no figures |
| `ch63-l06-sky-earth.png` | `ch63-l06` card 3 | وَالسَّمَاءِ وَمَا بَنَاهَا وَالْأَرْضِ وَمَا طَحَاهَا وَنَفْسٍ وَمَا سَوَّاهَا | A wide sky above a plain, the earth stretched out to the horizon; no figures |
| `ch63-l06-two-gardens.png` | `ch63-l06` cards 4, 6 | فَأَلْهَمَهَا فُجُورَهَا وَتَقْوَاهَا قَدْ أَفْلَحَ مَن زَكَّاهَا وَقَدْ خَابَ مَن دَسَّاهَا · Noun plus pronoun, given whole | Two small plots, one green and tended, one buried under sand; no figures |
| `ch63-l07-rocky-valley.png` | `ch63-l07` cards 1, 2 | ثَمُودُ مَثَلًا · كَذَّبَتْ ثَمُودُ بِطَغْوَاهَا إِذِ انبَعَثَ أَشْقَاهَا | A rocky valley at dusk with stone dwellings carved into the cliffs; no figures |
| `ch63-l07-watering-place.png` | `ch63-l07` cards 3, 5 | فَقَالَ لَهُمْ رَسُولُ اللَّهِ نَاقَةَ اللَّهِ وَسُقْيَاهَا · Pronouns and iḍāfa here | A stone water trough beside a well in a dry valley, tracks leading to it; no figures |
| `ch63-l07-dust-cloud.png` | `ch63-l07` card 4 | فَكَذَّبُوهُ فَعَقَرُوهَا فَدَمْدَمَ عَلَيْهِمْ رَبُّهُم بِذَنبِهِمْ فَسَوَّاهَا وَلَا يَخَافُ عُقْبَاهَا | A dust cloud settling over a silent valley; no figures |
| `ch63-review-linked-boxes.png` | `ch63-l05` cards 1, 2 | خُلَاصَةُ الْبَابِ · Twelve tasks | Three wooden boxes joined end to end by a rope, each with a blank label; no figures |
| `ch64-l03-nested-boxes.png` | `ch64-l03` cards 1, 2, 6 | جُمْلَةٌ دَاخِلَ الْخَبَرِ · وَاللَّهُ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ · Take the whole clause | A large wooden box with a smaller box inside it, both open; no figures |
| `ch64-l03-writing-desk.png` | `ch64-l03` cards 3, 5 | الطَّالِبُ يَكْتُبُ الدَّرْسَ · الْمُبْتَدَأُ وَالْفَاعِلُ | A desk with an open notebook and a pen mid-line; no figures |
| `ch64-l03-two-books.png` | `ch64-l03` card 4 | الطَّالِبُ أَخُوهُ مُجْتَهِدٌ | Two books on a shelf, one pulled out slightly; no figures |
| `ch64-l04-three-passes.png` | `ch64-l04` cards 1, 6 | قِرَاءَةُ الْجُمْلَةِ الْمُرَكَّبَةِ · Quran and practice sentences | A page with three bookmarks of different colours sticking out; no figures |
| `ch64-l04-heavens-earth.png` | `ch64-l04` cards 2, 3 | اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ · لِّلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ | A wide landscape of sky above and fields below, split by the horizon; no figures |
| `ch64-l04-library-school.png` | `ch64-l04` cards 4, 5 | الْمَكْتَبَةُ أَمَامَ الْمَدْرَسَةِ · الْمَدْرَسَةُ طُلَّابُهَا كَثِيرُونَ | A library building standing in front of a school building across a courtyard; no figures |
| `ch64-l06-old-city.png` | `ch64-l06` cards 1, 2 | قَسَمٌ وَكَبَدٌ وَأَسْئِلَةٌ · لَا أُقْسِمُ بِهَٰذَا الْبَلَدِ وَأَنتَ حِلٌّ بِهَٰذَا الْبَلَدِ وَوَالِدٍ وَمَا وَلَدَ | A walled city seen from a hill at dawn, rooftops and a gate; no figures |
| `ch64-l06-steep-climb.png` | `ch64-l06` cards 3, 6 | لَقَدْ خَلَقْنَا الْإِنسَانَ فِي كَبَدٍ · Predicates in these ayat | A man-sized stone staircase climbing a hill, empty, in warm light; no figures |
| `ch64-l06-two-eyes-tools.png` | `ch64-l06` cards 4, 5 | أَيَحْسَبُ أَن لَّن يَقْدِرَ عَلَيْهِ أَحَدٌ يَقُولُ أَهْلَكْتُ مَالًا لُّبَدًا أَيَحْسَبُ أَن لَّمْ يَرَهُ أَحَدٌ · أَلَمْ نَجْعَل لَّهُ عَيْنَيْنِ وَلِسَانًا وَشَفَتَيْنِ وَهَدَيْنَاهُ النَّجْدَيْنِ | A pair of open eyeglasses and a small bell on a table; no figures |
| `ch64-l07-steep-pass.png` | `ch64-l07` cards 1, 2 | الْعَقَبَةُ وَالْفَرِيقَانِ · فَلَا اقْتَحَمَ الْعَقَبَةَ وَمَا أَدْرَاكَ مَا الْعَقَبَةُ | A narrow mountain pass rising between two cliffs in morning light; no figures |
| `ch64-l07-bread-bowl.png` | `ch64-l07` cards 3, 6 | فَكُّ رَقَبَةٍ أَوْ إِطْعَامٌ فِي يَوْمٍ ذِي مَسْغَبَةٍ يَتِيمًا ذَا مَقْرَبَةٍ أَوْ مِسْكِينًا ذَا مَتْرَبَةٍ · Nominal sentences here | A bowl of bread and dates set on a mat at a doorway; no figures |
| `ch64-l07-two-paths.png` | `ch64-l07` cards 4, 5 | ثُمَّ كَانَ مِنَ الَّذِينَ آمَنُوا وَتَوَاصَوْا بِالصَّبْرِ وَتَوَاصَوْا بِالْمَرْحَمَةِ · أُولَٰئِكَ أَصْحَابُ الْمَيْمَنَةِ وَالَّذِينَ كَفَرُوا بِآيَاتِنَا هُمْ أَصْحَابُ الْمَشْأَمَةِ عَلَيْهِمْ نَارٌ مُّؤْصَدَةٌ | A fork in a path, one branch leading to light and the other to a dark closed gate; no figures |
| `ch64-l08-dark-horizon.png` | `ch64-l08` cards 1, 2 | الْخَبَرُ وَالْوُجُوهُ الْأُولَى · هَلْ أَتَاكَ حَدِيثُ الْغَاشِيَةِ | A heavy dark cloud covering a plain at the horizon; no figures |
| `ch64-l08-blazing-fire.png` | `ch64-l08` cards 3, 4 | وُجُوهٌ يَوْمَئِذٍ خَاشِعَةٌ عَامِلَةٌ نَّاصِبَةٌ · تَصْلَىٰ نَارًا حَامِيَةً تُسْقَىٰ مِنْ عَيْنٍ آنِيَةٍ | A large fire in a stone pit with no one near it; no figures |
| `ch64-l08-thorn-bush.png` | `ch64-l08` cards 5, 6 | لَّيْسَ لَهُمْ طَعَامٌ إِلَّا مِن ضَرِيعٍ لَّا يُسْمِنُ وَلَا يُغْنِي مِن جُوعٍ · Given whole | A dry thorny bush on cracked ground; no figures |
| `ch64-l09-high-garden.png` | `ch64-l09` cards 1, 2, 3 | الْوُجُوهُ الثَّانِيَةُ وَالْجَنَّةُ · وُجُوهٌ يَوْمَئِذٍ نَّاعِمَةٌ لِّسَعْيِهَا رَاضِيَةٌ · فِي جَنَّةٍ عَالِيَةٍ لَّا تَسْمَعُ فِيهَا لَاغِيَةً فِيهَا عَيْنٌ جَارِيَةٌ | A garden on a high terrace with trees and a stone wall; no figures |
| `ch64-l09-garden-furnishings.png` | `ch64-l09` cards 4, 5 | فِيهَا سُرُرٌ مَّرْفُوعَةٌ وَأَكْوَابٌ مَّوْضُوعَةٌ وَنَمَارِقُ مَصْفُوفَةٌ وَزَرَابِيُّ مَبْثُوثَةٌ · Same shape, new meaning | Raised couches, cups, lined-up cushions and carpets in a shaded garden room; no figures |
| `ch64-l10-camels-sky.png` | `ch64-l10` cards 1, 2 | انْظُرْ وَذَكِّرْ وَالرُّجُوعُ · أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ وَإِلَى السَّمَاءِ كَيْفَ رُفِعَتْ وَإِلَى الْجِبَالِ كَيْفَ نُصِبَتْ وَإِلَى الْأَرْضِ كَيْفَ سُطِحَتْ | A line of camels standing under a wide empty sky; no figures |
| `ch64-l10-mountains-earth.png` | `ch64-l10` cards 3, 6 | فَذَكِّرْ إِنَّمَا أَنتَ مُذَكِّرٌ لَّسْتَ عَلَيْهِم بِمُصَيْطِرٍ · The whole surah | A range of mountains rising over a flat plain; no figures |
| `ch64-l10-road-home.png` | `ch64-l10` cards 4, 5 | إِلَّا مَن تَوَلَّىٰ وَكَفَرَ فَيُعَذِّبُهُ اللَّهُ الْعَذَابَ الْأَكْبَرَ · إِنَّ إِلَيْنَا إِيَابَهُمْ ثُمَّ إِنَّ عَلَيْنَا حِسَابَهُم | A long road winding back toward a single door at the end; no figures |
| `ch64-review-nested-frames.png` | `ch64-l05` cards 1, 2 | خُلَاصَةُ الْبَابِ · Twelve tasks | Three picture frames of different sizes set inside one another on a wall; no figures |
| `ch65-l01-three-doors.png` | `ch65-l01` cards 1, 2, 3, 4, 6 | ثَلَاثَةُ أَنْوَاعٍ مِنَ الْجُمْلَةِ · الْجَوُّ بَارِدٌ · كَانَ الْجَوُّ بَارِدًا · إِنَّ الْجَوَّ بَارِدٌ · Only what you know | Three doors in a row, each with a different coloured lintel; no figures |
| `ch65-l01-open-book.png` | `ch65-l01` card 5 | وَكَانَ اللَّهُ عَلِيمًا حَكِيمًا | An open book with a plain bookmark on a lectern; no figures |
| `ch65-l05-boxes-in-row.png` | `ch65-l05` cards 1, 6 | الْخَبَرُ بَعْدَ كَانَ · Position and inside | Four boxes of different sizes in a row: one tiny, one small, one with a lid, one with a box inside; no figures |
| `ch65-l05-house-door.png` | `ch65-l05` cards 2, 3, 4, 5 | كَانَ الْكِتَابُ فِي الْبَيْتِ · كَانَ الطَّالِبُ يَكْتُبُ · كَانَ الْبَيْتُ بَابُهُ كَبِيرٌ · كُنْتُ طَالِبًا | A house with a big door, seen from outside; no figures |
| `ch65-l02-dawn-dusk.png` | `ch65-l02` cards 1, 2, 3, 6 | أَصْبَحَ وَأَمْسَى وَصَارَ · أَصْبَحَ · أَمْسَى · A shade, not a rule | A hill at dawn on the left and the same hill at dusk on the right; no figures |
| `ch65-l02-water-ice.png` | `ch65-l02` card 4 | صَارَ | A bowl of water on the left and a block of ice on the right; no figures |
| `ch65-l02-brothers-hands.png` | `ch65-l02` card 5 | فَأَصْبَحْتُم بِنِعْمَتِهِ إِخْوَانًا | Several clasped hands drawn as outlines without faces, arranged in a ring; no faces |
| `ch65-l07-forenoon-sun.png` | `ch65-l07` cards 1, 2 | أَضْحَى وَبَاتَ وَظَلَّ · أَضْحَى | A sun high over rooftops in the forenoon, bright sky; no figures |
| `ch65-l07-night-lamp.png` | `ch65-l07` card 3 | بَاتَ | A small lamp burning beside a made bed at night; no figures |
| `ch65-l07-cold-jug.png` | `ch65-l07` cards 4, 6 | ظَلَّ · لَيْسَ يَعْمَلُ كَذَلِكَ | A clay jug of water that still has condensation on it, in a cool room; no figures |
| `ch65-l07-dark-cloth.png` | `ch65-l07` cards 5, 7 | ظَلَّ وَجْهُهُ مُسْوَدًّا · Six now — no more | A dark cloth hanging over a doorway; no figures |
| `ch65-l03-two-doors-word.png` | `ch65-l03` cards 1, 5, 6 | هَلْ يَحْتَاجُ إِلَى خَبَرٍ؟ · صَارَ — نَاقِصٌ أَمْ تَامٌّ؟ · Given whole | Two doors side by side: one leads to a room with a table set, one opens on an empty sky; no figures |
| `ch65-l03-empty-sky.png` | `ch65-l03` cards 3, 4 | كُن فَيَكُونُ · أَلَا إِلَى اللَّهِ تَصِيرُ الْأُمُورُ | An open sky with light breaking through, no objects; no figures |
| `ch65-l03-set-table.png` | `ch65-l03` card 2 | وَكَانَ اللَّهُ عَلِيمًا حَكِيمًا | A table with a full set of cups and bowls; no figures |
| `ch65-l04-three-passes-bookmarks.png` | `ch65-l04` cards 1, 6 | الْأَخَوَاتُ فِي الْقُرْآنِ وَفِي جُمَلٍ جَدِيدَةٍ · Label the source | A book with three coloured bookmarks sticking out; no figures |
| `ch65-l04-dark-curtain.png` | `ch65-l04` cards 2, 4 | ظَلَّ وَجْهُهُ مُسْوَدًّا · أَصْبَحَ وَجْهُ الْوَلَدِ سَعِيدًا | A dark curtain hanging in a doorway; no figures |
| `ch65-l04-dry-field.png` | `ch65-l04` card 3 | فَأَصْبَحَ هَشِيمًا | A field of dry plant remnants scattered by the wind; no figures |
| `ch65-l04-school-night.png` | `ch65-l04` card 5 | بَاتَ طُلَّابُ الْمَدْرَسَةِ مُجْتَهِدِينَ | A school window with a lamp burning late at night; no figures |
| `ch65-review-book-end.png` | `ch65-l06` cards 1, 2 | ر14 — نِهَايَةُ الْكِتَابِ 7 · Twelve tasks | A closed book with a ribbon on a shelf next to an empty book stand; no figures |
| `ch65-review2-six-doors.png` | `ch65-l09` cards 1, 2 | كُلُّ أُخْتٍ وَكُلُّ نَوْعٍ مَرَّةً · One look at each | Six small doors in a row, each with a different coloured knob; no figures |

### Chapters 56–60

Requested 2026-10-04 with the batch-7 harvest (Docs/proposals/proposal-harvest-tracker.md): every discover card of the new or rewritten lessons — Chapter 56's `ch56-l04`, `l05`, `l10`–`l13` and review `ch56-l08`; Chapter 57's `ch57-l11`, `l12`, `l04` and review `ch57-l09`; Chapter 58's `ch58-l09`, `l04` and review `ch58-l06`; Chapter 59's `ch59-l07`, `l08` and review `ch59-l05`; Chapter 60's review `ch60-l07`. 67 scenes cover 94 cards. Quran scenes are symbolic and faceless (no human figure, no face, nothing that depicts Allah, a prophet or an angel); the Abasa scenes for the blind man and the faces of 80:38–41 show only doorways, lamps, light and dust, never a face. The CL16 lab `ch60-l04` has no discover cards. Not yet mapped: the cards of the kept lessons of Chapters 56–60 — a later pass.

| Filename | Cards | Arabic | Brief |
|---|---|---|---|
| `ch56-dual-construct-two-books-desk.png` | `ch56-l04` cards 1, 2, 5 | الْمُثَنَّى الْمُضَافُ · Ordinary dual / dual as first term · رَأَيْتُ طَالِبَيِ الْمَدْرَسَةِ | Two closed books side by side on a school desk next to a small pencil case; no figures |
| `ch56-dual-hands-open-symbolic.png` | `ch56-l04` card 3 | يَدَا أَبِي لَهَبٍ | Symbolic: two open empty palms made of pale stone resting on a cloth; no faces, no figure |
| `ch56-dual-two-gate-posts.png` | `ch56-l04` card 4 | نَبَأَ ابْنَيْ آدَمَ | Two matching gate posts of a school courtyard in morning light; no figures |
| `ch56-dual-two-gardens-walled.png` | `ch56-l04` card 6 | وَلِمَنْ خَافَ مَقَامَ رَبِّهِ جَنَّتَانِ | Two small walled gardens side by side, each with a single tree; no figures |
| `ch56-dual-rule-two-keys-note.png` | `ch56-l04` card 7 | The head's role decides its ending | Two small brass keys on a notebook page beside a short pencil; no figures |
| `ch56-dual-relative-two-lamps.png` | `ch56-l05` cards 1, 2 | الْأَسْمَاءُ الْمَوْصُولَةُ لِلْمُثَنَّى · One, two, many | Two lamps of the same shape on a table, one slightly taller, lit together; no figures |
| `ch56-dual-relative-two-paths.png` | `ch56-l05` cards 3, 4 | وَاللَّذَانِ يَأْتِيَانِهَا مِنكُمْ · رَبَّنَا أَرِنَا اللَّذَيْنِ أَضَلَّانَا | Two parallel footpaths crossing a field toward a mosque gate; no figures |
| `ch56-dual-relative-two-notebooks.png` | `ch56-l05` cards 5, 6 | الطَّالِبَتَانِ اللَّتَانِ كَتَبَتَا الدَّرْسَ · سَلَّمْتُ عَلَى الطَّالِبَتَيْنِ اللَّتَيْنِ كَتَبَتَا الدَّرْسَ | Two exercise notebooks with pencils laid across them on a desk; no figures |
| `ch56-relative-keeps-form-stamp.png` | `ch56-l05` card 7 | The relative keeps its full form | A small rubber stamp with a complete word impression beside an ink pad, nothing cut off; no figures |
| `ch56-abasa-two-arrivals-doorway.png` | `ch56-l10` cards 1, 2 | عَبَسَ — شَخْصَانِ وَتَذْكِرَةٌ وَاحِدَةٌ · عَبَسَ وَتَوَلَّىٰ أَن جَاءَهُ الْأَعْمَىٰ وَمَا يُدْرِيكَ لَعَلَّهُ يَزَّكَّىٰ أَوْ يَذَّكَّرُ فَتَنفَعَهُ الذِّكْرَىٰ | A pale doorway with two sets of footprints approaching it across a dusty floor, one hurried and one slow; no figures |
| `ch56-abasa-contrast-two-lamps.png` | `ch56-l10` card 3 | أَمَّا مَنِ اسْتَغْنَىٰ فَأَنتَ لَهُ تَصَدَّىٰ وَمَا عَلَيْكَ أَلَّا يَزَّكَّىٰ وَأَمَّا مَن جَاءَكَ يَسْعَىٰ وَهُوَ يَخْشَىٰ فَأَنتَ عَنْهُ تَلَهَّىٰ | Two lamps on a table, one dimmed with a cloth over it and one burning brightly; no figures |
| `ch56-abasa-honoured-pages-shelf.png` | `ch56-l10` card 4 | كَلَّا إِنَّهَا تَذْكِرَةٌ فَمَن شَاءَ ذَكَرَهُ فِي صُحُفٍ مُّكَرَّمَةٍ مَّرْفُوعَةٍ مُّطَهَّرَةٍ بِأَيْدِي سَفَرَةٍ كِرَامٍ بَرَرَةٍ | A high wooden shelf with a few clean stacked pages bound in cloth, light falling on them; no figures |
| `ch56-abasa-first-sixteen-scroll.png` | `ch56-l10` card 5 | عَبَسَ وَتَوَلَّىٰ أَن جَاءَهُ الْأَعْمَىٰ وَمَا يُدْرِيكَ لَعَلَّهُ يَزَّكَّىٰ أَوْ يَذَّكَّرُ فَتَنفَعَهُ الذِّكْرَىٰ أَمَّا مَنِ اسْتَغْنَىٰ فَأَنتَ لَهُ تَصَدَّىٰ وَمَا عَلَيْكَ أَلَّا يَزَّكَّىٰ وَأَمَّا مَن جَاءَكَ يَسْعَىٰ وَهُوَ يَخْشَىٰ فَأَنتَ عَنْهُ تَلَهَّىٰ كَلَّا إِنَّهَا تَذْكِرَةٌ فَمَن شَاءَ ذَكَرَهُ فِي صُحُفٍ مُّكَرَّمَةٍ مَّرْفُوعَةٍ مُّطَهَّرَةٍ بِأَيْدِي سَفَرَةٍ كِرَامٍ بَرَرَةٍ | A long scroll laid flat on a low table, partly unrolled, with a stone paperweight on one end; no figures |
| `ch56-abasa-he-you-signposts.png` | `ch56-l10` card 6 | Read the pronouns | Two simple signposts on a path, one pointing left and one pointing right, with a bare tree between them; no figures |
| `ch56-abasa-cursed-question-empty-chair.png` | `ch56-l11` card 1 | مِنْ نُطْفَةٍ إِلَى الْبَعْثِ | An empty wooden chair in a bare room with a single window; no figures |
| `ch56-abasa-drop-on-leaf.png` | `ch56-l11` card 2 | قُتِلَ الْإِنسَانُ مَا أَكْفَرَهُ مِنْ أَيِّ شَيْءٍ خَلَقَهُ مِن نُّطْفَةٍ خَلَقَهُ فَقَدَّرَهُ | A single water drop resting on a green leaf in soft light; no figures |
| `ch56-abasa-way-eased-path-to-grave-to-sky.png` | `ch56-l11` card 3 | ثُمَّ السَّبِيلَ يَسَّرَهُ ثُمَّ أَمَاتَهُ فَأَقْبَرَهُ ثُمَّ إِذَا شَاءَ أَنشَرَهُ | A smooth stone path leading up a gentle slope toward an open sky with scattered clouds; no figures |
| `ch56-abasa-not-yet-unfinished-task.png` | `ch56-l11` cards 4, 5 | كَلَّا لَمَّا يَقْضِ مَا أَمَرَهُ · قُتِلَ الْإِنسَانُ مَا أَكْفَرَهُ مِنْ أَيِّ شَيْءٍ خَلَقَهُ مِن نُّطْفَةٍ خَلَقَهُ فَقَدَّرَهُ ثُمَّ السَّبِيلَ يَسَّرَهُ ثُمَّ أَمَاتَهُ فَأَقْبَرَهُ ثُمَّ إِذَا شَاءَ أَنشَرَهُ كَلَّا لَمَّا يَقْضِ مَا أَمَرَهُ | A half-finished row of stones on a table beside an open hand-drawn plan; no figures |
| `ch56-abasa-then-stepping-stones.png` | `ch56-l11` card 6 | ثُمَّ keeps the order | A line of stepping stones across a shallow stream, each marked with a small scratch; no figures |
| `ch56-abasa-look-at-food-table.png` | `ch56-l12` card 1 | فَلْيَنظُرِ الْإِنسَانُ إِلَى طَعَامِهِ | A simple wooden table with a loaf, a bowl of olives and a bunch of grapes, seen from above; no figures |
| `ch56-abasa-rain-and-split-earth.png` | `ch56-l12` card 2 | فَلْيَنظُرِ الْإِنسَانُ إِلَىٰ طَعَامِهِ أَنَّا صَبَبْنَا الْمَاءَ صَبًّا ثُمَّ شَقَقْنَا الْأَرْضَ شَقًّا فَأَنبَتْنَا فِيهَا حَبًّا | Rain falling on dry ploughed earth with a long furrow opening across it; no figures |
| `ch56-abasa-harvest-list-orchard.png` | `ch56-l12` card 3 | وَعِنَبًا وَقَضْبًا وَزَيْتُونًا وَنَخْلًا وَحَدَائِقَ غُلْبًا وَفَاكِهَةً وَأَبًّا | An orchard edge with a vine, an olive tree and date palms, a haystack nearby; no figures |
| `ch56-abasa-provision-meadow-flock.png` | `ch56-l12` cards 4, 5 | مَّتَاعًا لَّكُمْ وَلِأَنْعَامِكُمْ · فَلْيَنظُرِ الْإِنسَانُ إِلَىٰ طَعَامِهِ أَنَّا صَبَبْنَا الْمَاءَ صَبًّا ثُمَّ شَقَقْنَا الْأَرْضَ شَقًّا فَأَنبَتْنَا فِيهَا حَبًّا وَعِنَبًا وَقَضْبًا وَزَيْتُونًا وَنَخْلًا وَحَدَائِقَ غُلْبًا وَفَاكِهَةً وَأَبًّا مَّتَاعًا لَّكُمْ وَلِأَنْعَامِكُمْ | A green meadow edge with a few grazing sheep seen from behind and a basket of fruit by the fence; no faces |
| `ch56-abasa-own-verbal-noun-note.png` | `ch56-l12` card 6 | A word and its own verbal noun | A page with two short underlined words side by side and a pencil lying across it; no figures |
| `ch56-abasa-the-blast-open-sky-dust.png` | `ch56-l13` cards 1, 2 | الصَّاخَّةُ وَالْوُجُوهُ · فَإِذَا جَاءَتِ الصَّاخَّةُ يَوْمَ يَفِرُّ الْمَرْءُ مِنْ أَخِيهِ وَأُمِّهِ وَأَبِيهِ وَصَاحِبَتِهِ وَبَنِيهِ | A wide empty plain under a pale sky with a faint line of dust rising on the horizon; no figures |
| `ch56-abasa-every-path-its-own.png` | `ch56-l13` card 3 | لِكُلِّ امْرِئٍ مِّنْهُمْ يَوْمَئِذٍ شَأْنٌ يُغْنِيهِ | Several separate footpaths leaving a single crossing in different directions, each lit differently; no figures |
| `ch56-abasa-bright-lamplit-window.png` | `ch56-l13` card 4 | وُجُوهٌ يَوْمَئِذٍ مُّسْفِرَةٌ ضَاحِكَةٌ مُّسْتَبْشِرَةٌ | A bright, open window with warm light spilling out onto a clean step; no faces |
| `ch56-abasa-dust-and-dark-wall.png` | `ch56-l13` card 5 | وَوُجُوهٌ يَوْمَئِذٍ عَلَيْهَا غَبَرَةٌ تَرْهَقُهَا قَتَرَةٌ أُولَٰئِكَ هُمُ الْكَفَرَةُ الْفَجَرَةُ | A grey wall streaked with dust and a heavy dark cloth hanging over a doorway; no faces |
| `ch56-abasa-whole-surah-three-roads.png` | `ch56-l13` card 6 | عَبَسَ وَتَوَلَّىٰ أَن جَاءَهُ الْأَعْمَىٰ وَمَا يُدْرِيكَ لَعَلَّهُ يَزَّكَّىٰ أَوْ يَذَّكَّرُ فَتَنفَعَهُ الذِّكْرَىٰ أَمَّا مَنِ اسْتَغْنَىٰ فَأَنتَ لَهُ تَصَدَّىٰ وَمَا عَلَيْكَ أَلَّا يَزَّكَّىٰ وَأَمَّا مَن جَاءَكَ يَسْعَىٰ وَهُوَ يَخْشَىٰ فَأَنتَ عَنْهُ تَلَهَّىٰ كَلَّا إِنَّهَا تَذْكِرَةٌ فَمَن شَاءَ ذَكَرَهُ فِي صُحُفٍ مُّكَرَّمَةٍ مَّرْفُوعَةٍ مُّطَهَّرَةٍ بِأَيْدِي سَفَرَةٍ كِرَامٍ بَرَرَةٍ قُتِلَ الْإِنسَانُ مَا أَكْفَرَهُ مِنْ أَيِّ شَيْءٍ خَلَقَهُ مِن نُّطْفَةٍ خَلَقَهُ فَقَدَّرَهُ ثُمَّ السَّبِيلَ يَسَّرَهُ ثُمَّ أَمَاتَهُ فَأَقْبَرَهُ ثُمَّ إِذَا شَاءَ أَنشَرَهُ كَلَّا لَمَّا يَقْضِ مَا أَمَرَهُ فَلْيَنظُرِ الْإِنسَانُ إِلَىٰ طَعَامِهِ أَنَّا صَبَبْنَا الْمَاءَ صَبًّا ثُمَّ شَقَقْنَا الْأَرْضَ شَقًّا فَأَنبَتْنَا فِيهَا حَبًّا وَعِنَبًا وَقَضْبًا وَزَيْتُونًا وَنَخْلًا وَحَدَائِقَ غُلْبًا وَفَاكِهَةً وَأَبًّا مَّتَاعًا لَّكُمْ وَلِأَنْعَامِكُمْ فَإِذَا جَاءَتِ الصَّاخَّةُ يَوْمَ يَفِرُّ الْمَرْءُ مِنْ أَخِيهِ وَأُمِّهِ وَأَبِيهِ وَصَاحِبَتِهِ وَبَنِيهِ لِكُلِّ امْرِئٍ مِّنْهُمْ يَوْمَئِذٍ شَأْنٌ يُغْنِيهِ وُجُوهٌ يَوْمَئِذٍ مُّسْفِرَةٌ ضَاحِكَةٌ مُّسْتَبْشِرَةٌ وَوُجُوهٌ يَوْمَئِذٍ عَلَيْهَا غَبَرَةٌ تَرْهَقُهَا قَتَرَةٌ أُولَٰئِكَ هُمُ الْكَفَرَةُ الْفَجَرَةُ | Three roads of different widths meeting at one tall stone marker, each beginning at the bottom edge; no figures |
| `ch56-abasa-five-nouns-genitive-note.png` | `ch56-l13` card 7 | Five nouns, in context | A short wooden ruler lying across two small cards, one with a ي mark drawn on it; no figures |
| `ch56-review-special-nouns-desk.png` | `ch56-l08` cards 1, 2 | خُلَاصَةُ الْبَابِ · Check the sentence, then the ending | A reading desk with an open notebook, four small cards labelled with different final letters and a pencil; no figures |
| `ch57-hollow-rope-short-and-long.png` | `ch57-l11` cards 1, 2, 3 | الْأَجْوَفُ بَيْنَ الرَّفْعِ وَالنَّصْبِ وَالْجَزْمِ · قَالَ — three states · كَانَ — three states | A long rope and a shorter cut piece of the same rope lying side by side on a wooden floor; no figures |
| `ch57-hollow-lamp-always-lit.png` | `ch57-l11` cards 4, 5 | وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ · وَأَنَّا ظَنَنَّا أَن لَّن تَقُولَ الْإِنسُ وَالْجِنُّ عَلَى اللَّهِ كَذِبًا | A small lamp burning steadily on a bare shelf beside an empty niche; no figures |
| `ch57-hollow-nothing-said-page.png` | `ch57-l11` card 6 | لَمْ يَقُلْ شَيْئًا | A blank page with a pen resting across it and an empty inkwell; no figures |
| `ch57-hollow-governor-signpost.png` | `ch57-l11` card 7 | The governor decides, not the stem | A signpost with three plain arms pointing different ways at a quiet crossing; no figures |
| `ch57-final-weak-three-states-thread.png` | `ch57-l12` card 1 | النَّاقِصُ بَيْنَ الرَّفْعِ وَالنَّصْبِ وَالْجَزْمِ | Three lengths of the same thread laid out in a row: whole, with a knot, and cut short; no figures |
| `ch57-final-weak-thrown-stone-ripples.png` | `ch57-l12` cards 2, 4 | رَمَى · رَمَى — three states | A small stone resting on the edge of a still pond with faint ripples; no figures |
| `ch57-final-weak-calling-across-valley.png` | `ch57-l12` cards 3, 5, 6 | دَعَا · دَعَا — three states · يَدْعُو مِن دُونِ اللَّهِ مَا لَا يَضُرُّهُ وَمَا لَا يَنفَعُهُ ۚ ذَٰلِكَ هُوَ الضَّلَالُ الْبَعِيدُ | An empty valley at dusk with a single lantern on a far ridge; no figures |
| `ch57-final-weak-jussive-gap.png` | `ch57-l12` card 7 | كَلَّا لَمَّا يَقْضِ مَا أَمَرَهُ | A row of five small stones with a gap where the last stone has been taken away; no figures |
| `ch57-final-weak-scope-note.png` | `ch57-l12` card 8 | Scope and a warning | A narrow shelf holding exactly two clay pots with room for no others; no figures |
| `ch57-kana-then-and-now-clock.png` | `ch57-l04` cards 1, 2 | كَانَ — اسْمُهَا مَرْفُوعٌ وَخَبَرُهَا مَنْصُوبٌ · Plain sentence / sentence with كَانَ | A plain wall clock beside an older wall clock that has stopped, on a shelf; no figures |
| `ch57-kana-ever-lamp-steady.png` | `ch57-l04` cards 3, 4 | وَكَانَ اللَّهُ غَفُورًا رَّحِيمًا · وَكَانَ اللَّهُ عَلَىٰ كُلِّ شَيْءٍ قَدِيرًا | A lamp burning on a table in an unchanging, quiet room; no figures |
| `ch57-kana-before-it-door.png` | `ch57-l04` cards 5, 6 | إِنَّا كُنَّا مِن قَبْلِهِ مُسْلِمِينَ · كُنَّا مُسْلِمِينَ | A school doorway seen from the courtyard with the day's first light on the steps; no figures |
| `ch57-kana-only-one-key.png` | `ch57-l04` card 7 | Only كَانَ here | A single brass key lying alone on a clean cloth; no figures |
| `ch57-review-governor-desk.png` | `ch57-l09` cards 1, 2 | خُلَاصَةُ الْبَابِ · Governor first | A desk with an open notebook, three small cards in a row and a pencil; no figures |
| `ch58-participle-writing-lesson-desk.png` | `ch58-l09` cards 1, 2 | اسْمُ الْفَاعِلِ يَعْمَلُ عَمَلَ فِعْلِهِ · Plain noun / acting participle | An open exercise book with a pencil mid-line on a school desk in afternoon light; no figures |
| `ch58-participle-founding-earth-seed.png` | `ch58-l09` card 3 | إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً | A newly turned patch of earth with a small spade standing in it and a seedling in the foreground; no figures |
| `ch58-participle-dog-threshold-paws.png` | `ch58-l09` card 4 | وَكَلْبُهُم بَاسِطٌ ذِرَاعَيْهِ بِالْوَصِيدِ | A cave mouth with two stone paws laid out across the threshold in symbolic carving; no animal face |
| `ch58-participle-not-iyafa-two-cards.png` | `ch58-l09` card 5 | Not the same as an iḍāfa | Two plain cards side by side on a table, one with a short line drawn under it; no figures |
| `ch58-reported-speech-two-speech-bubbles-frames.png` | `ch58-l04` card 1 | الْمَقُولُ وَالْمُخَاطَبُ | Two empty rounded frames, a small one inside a larger one, hanging on a plain wall; no figures |
| `ch58-reported-angels-light-above-earth.png` | `ch58-l04` card 2 | وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً ۖ قَالُوا أَتَجْعَلُ فِيهَا مَن يُفْسِدُ فِيهَا وَيَسْفِكُ الدِّمَاءَ وَنَحْنُ نُسَبِّحُ بِحَمْدِكَ وَنُقَدِّسُ لَكَ ۖ قَالَ إِنِّي أَعْلَمُ مَا لَا تَعْلَمُونَ | A soft column of light above a quiet green earth, nothing inside it; no figures |
| `ch58-reported-servant-lamp-and-book.png` | `ch58-l04` card 3 | قَالَ إِنِّي عَبْدُ اللَّهِ | A small oil lamp beside a closed book on a wooden stool; no figures |
| `ch58-reported-teacher-board-chalk.png` | `ch58-l04` card 4 | قَالَ الْمُعَلِّمُ لِلطَّالِبِ إِنَّكَ مُجْتَهِدٌ | A classroom blackboard with a single short chalk line and a duster on the ledge; no figures |
| `ch58-reported-quote-vs-objects.png` | `ch58-l04` cards 5, 6 | A quotation / two noun objects · Read in layers | A bracket drawn in chalk around part of a line of writing on a slate; no figures |
| `ch58-review-layers-desk.png` | `ch58-l06` cards 1, 2 | خُلَاصَةُ الْبَابِ · Complete clause, then the layers | A desk with three transparent sheets laid over each other beside a notebook; no figures |
| `ch59-alaa-highest-clear-sky-dawn.png` | `ch59-l07` card 1 | الَّذِي خَلَقَ … وَالَّذِي قَدَّرَ … وَالَّذِي أَخْرَجَ | A wide empty sky at first light above a quiet horizon; no figures |
| `ch59-alaa-created-measured-guided-path.png` | `ch59-l07` card 2 | سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى الَّذِي خَلَقَ فَسَوَّىٰ وَالَّذِي قَدَّرَ فَهَدَىٰ وَالَّذِي أَخْرَجَ الْمَرْعَىٰ | A level stone path leading away across a plain with small measuring stakes beside it; no figures |
| `ch59-alaa-pasture-turned-dry-straw.png` | `ch59-l07` card 3 | فَجَعَلَهُ غُثَاءً أَحْوَىٰ | A green field edge beside a patch of dried dark straw; no figures |
| `ch59-alaa-promise-open-book-lamp.png` | `ch59-l07` cards 4, 5 | سَنُقْرِئُكَ فَلَا تَنسَىٰ إِلَّا مَا شَاءَ اللَّهُ ۚ إِنَّهُ يَعْلَمُ الْجَهْرَ وَمَا يَخْفَىٰ وَنُيَسِّرُكَ لِلْيُسْرَىٰ فَذَكِّرْ إِن نَّفَعَتِ الذِّكْرَىٰ · سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى الَّذِي خَلَقَ فَسَوَّىٰ وَالَّذِي قَدَّرَ فَهَدَىٰ وَالَّذِي أَخْرَجَ الْمَرْعَىٰ فَجَعَلَهُ غُثَاءً أَحْوَىٰ سَنُقْرِئُكَ فَلَا تَنسَىٰ إِلَّا مَا شَاءَ اللَّهُ ۚ إِنَّهُ يَعْلَمُ الْجَهْرَ وَمَا يَخْفَىٰ وَنُيَسِّرُكَ لِلْيُسْرَىٰ فَذَكِّرْ إِن نَّفَعَتِ الذِّكْرَىٰ | An open book on a stand with a lit lamp beside it and a window behind; no figures |
| `ch59-alaa-who-is-you-pointing-signpost.png` | `ch59-l07` card 6 | Who is 'you'? | A simple wooden signpost on a path with one arm pointing forward; no figures |
| `ch59-alaa-two-paths-fork-in-the-road.png` | `ch59-l08` card 1 | سَيَذَّكَّرُ مَن يَخْشَىٰ | A fork in a dusty road, one branch dark and stony, the other pale and level; no figures |
| `ch59-alaa-wretched-avoids-dark-turn.png` | `ch59-l08` card 2 | سَيَذَّكَّرُ مَن يَخْشَىٰ وَيَتَجَنَّبُهَا الْأَشْقَى الَّذِي يَصْلَى النَّارَ الْكُبْرَىٰ ثُمَّ لَا يَمُوتُ فِيهَا وَلَا يَحْيَىٰ | A road turning away into a shadowed gap between two rocks; no figures |
| `ch59-alaa-purified-prays-prayer-mat-rising-sun.png` | `ch59-l08` card 3 | قَدْ أَفْلَحَ مَن تَزَكَّىٰ وَذَكَرَ اسْمَ رَبِّهِ فَصَلَّىٰ | A bare prayer mat laid on clean ground in morning sun; no figures |
| `ch59-alaa-prefer-world-hereafter-better-two-lamps.png` | `ch59-l08` cards 4, 6 | بَلْ تُؤْثِرُونَ الْحَيَاةَ الدُّنْيَا وَالْآخِرَةُ خَيْرٌ وَأَبْقَىٰ إِنَّ هَٰذَا لَفِي الصُّحُفِ الْأُولَىٰ صُحُفِ إِبْرَاهِيمَ وَمُوسَىٰ · A verb you know | A small bright lamp beside a larger steady one on a table; no figures |
| `ch59-alaa-earlier-scrolls-stack.png` | `ch59-l08` card 5 | سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى الَّذِي خَلَقَ فَسَوَّىٰ وَالَّذِي قَدَّرَ فَهَدَىٰ وَالَّذِي أَخْرَجَ الْمَرْعَىٰ فَجَعَلَهُ غُثَاءً أَحْوَىٰ سَنُقْرِئُكَ فَلَا تَنسَىٰ إِلَّا مَا شَاءَ اللَّهُ ۚ إِنَّهُ يَعْلَمُ الْجَهْرَ وَمَا يَخْفَىٰ وَنُيَسِّرُكَ لِلْيُسْرَىٰ فَذَكِّرْ إِن نَّفَعَتِ الذِّكْرَىٰ سَيَذَّكَّرُ مَن يَخْشَىٰ وَيَتَجَنَّبُهَا الْأَشْقَى الَّذِي يَصْلَى النَّارَ الْكُبْرَىٰ ثُمَّ لَا يَمُوتُ فِيهَا وَلَا يَحْيَىٰ قَدْ أَفْلَحَ مَن تَزَكَّىٰ وَذَكَرَ اسْمَ رَبِّهِ فَصَلَّىٰ بَلْ تُؤْثِرُونَ الْحَيَاةَ الدُّنْيَا وَالْآخِرَةُ خَيْرٌ وَأَبْقَىٰ إِنَّ هَٰذَا لَفِي الصُّحُفِ الْأُولَىٰ صُحُفِ إِبْرَاهِيمَ وَمُوسَىٰ | A stack of old rolled scrolls tied with cord on a stone shelf; no figures |
| `ch59-review-book-six-shelf.png` | `ch59-l05` cards 1, 2 | خُلَاصَةُ الْكِتَابِ السَّادِسِ · Order of questions | A shelf with six books of the same size standing in a row and a small lamp beside them; no figures |
| `ch60-review-station-board.png` | `ch60-l07` cards 1, 2 | خُلَاصَةُ الْبَابِ · Words, not rulings | A station noticeboard with a few blank labels and a clock above it; no figures |

## Open — Chapters 1–11 (requested 2026-09-24)

An audit of every Chapter 1–11 discover card found **377 of 564 without a picture**. Each card was matched against the live discover scenes and the approved vocabulary pictures:

- **219 cards wired now** to a picture we already have (list at the end of this section): live discover scenes, 20 vocabulary pictures copied to `images/discover/{slug}.webp`, and 12 of the Chapter 14–20 scenes uploaded today. Fixtures and production are both updated.
- **3 cards wait on a Chapter 24/25 scene already requested.** Their CSV rows reuse that filename, so they are wired in the same delivery.
- **86 new scenes cover 155 cards** (tables below).

Seventeen vocabulary pictures are only the Arabic word printed on a tile (نَبِيّ، رَسُول، آيَة، اللَّه، رَبّ، الرَّحْمٰن، دِين، عَمَل، خَلَقَ…). Discover cards carry no lettering, so those words get scenes instead. The vocabulary picture for عَبْد shows shackles and is not used for "servant of Allah". Quran cards stay symbolic: no Allah, prophet (Musa, Yunus), Maryam or angel, no figures where the ayah is about one.

**Published 2026-09-24, without "Updated" notices (owner decision).** Since the 2026-09-23 trigger, any content change to a live lesson stamps `contentUpdatedAt`, which shows an "Updated" notice to every learner who finished it. For this picture-only change, the 63 lessons were synced with `content:sync -- --git-changed`, then their previous `contentUpdatedAt` values were written back. Do the same when the remaining scenes are delivered.

### Chapter 1

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| ✅ `ch01-near-book-far-mosque.png` | `ch01-l02` card 2 | هَذَا وَذَٰلِكَ | Two panels from the learner's viewpoint: left, a book on the desk right in front of the viewer; right, a mosque small in the distance across open ground |
| ✅ `ch01-far-pen-far-path.png` | `ch01-l02` card 4 | ذَٰلِكَ قَبْلَ الِاسْم | Seen from a doorway: a pen lying on a table at the far end of a long room, and through the far window a path winding away into the distance |
| ✅ `ch01-muslim-prayer.png` | `ch01-l02` card 7 | مُسْلِم | A man in modest dress standing on a prayer mat, hands raised to begin the prayer, seen from behind |
| `ch01-message-lamp-scroll.png` | `ch01-l02` cards 8, 11 · `ch04-l01` card 9 · `ch04-l06` card 6 | نَبِيّ · رَسُول · نَبِيٌّ عَظِيمٌ | A sealed scroll resting beside a lit oil lamp in a quiet room: a message brought from afar. No figures |
| `ch01-gender-book-tree.png` | `ch01-l03` card 1 | التَّذْكِير وَالتَّأْنِيث | Two panels: a book with a small navy tag hanging from it; a tree with a small gold tag hanging from it. Two kinds of noun, marked only by the tag colour |
| `ch01-surah-heading.png` | `ch01-l03` card 7 · `ch04-l03` card 10 | سُورَة · سُورَةٌ كَرِيمَةٌ | An open Mushaf on a wooden stand, a decorated surah heading band across the top of the page (ornament only, nothing readable) |
| `ch01-tree-near-far.png` | `ch01-l04` card 1 · `ch05-l02` card 1 | تِلْكَ | Two panels of one landscape: a tree close to the viewer; the same kind of tree small and far away on a hill |
| `ch01-three-feminine-nouns.png` | `ch01-l04` card 3 · `ch05-l01` card 3 | التَّاء الْمَرْبُوطَة | Three things in a row, a tree, a walled garden and a school building, each with the same small gold tag hanging from it (the shared feminine sign) |

### Chapter 2

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch02-a-book-any.png` | `ch02-l01` card 1 | التَّنْوِين — عَلَامَة النَّكِرَة | A hand taking one ordinary book from a shelf of many similar books: a book, any one of them |
| `ch02-indefinite-definite.png` | `ch02-l02` cards 1, 3 · `ch02-l04` card 1 | التَّعْرِيف بِالْ · بَيْتٌ → الْبَيْتُ · النَّكِرَة وَالْمَعْرِفَة | Two panels: left, a row of similar houses, any one of them; right, one of those houses singled out and lit warmly, that particular house |
| `ch02-book-is-new.png` | `ch02-l02` card 2 · `ch02-l16` cards 1, 2 · `ch04-l01` card 3 · `ch04-l02` card 4 · `ch04-l05` card 3 | الْمُبْتَدَأُ وَالْخَبَرُ · الْجُمْلَةُ الاسْمِيَّةُ · جَدِيدٌ · كِتَابٌ جَدِيدٌ · الْكِتَابُ الْجَدِيدُ · الْكِتَابُ الْجَدِيدُ / الْكِتَابُ جَدِيدٌ | A single brand-new book with a crisp, bright cover, a faint shine on it |
| `ch02-where-book.png` | `ch02-l03` card 4 | أَيْنَ الْكِتَابُ؟ | A child in a room lifting a cushion and looking around, searching for a missing book |
| `ch02-house-is-big.png` | `ch02-l16` card 3 · `ch04-l01` card 4 · `ch04-l02` card 2 · `ch04-l05` card 2 · `ch05-l05` card 4 | الْبَيْتُ كَبِيرٌ · بَيْتٌ كَبِيرٌ · الْبَيْتُ الْكَبِيرُ · الْبَيْتُ الْكَبِيرُ / الْبَيْتُ كَبِيرٌ | A big family house, with a small garden shed beside it for scale |
| `ch02-road-is-long.png` | `ch02-l16` card 4 | الطَّرِيقُ طَوِيلٌ | A long straight road stretching away to the horizon |
| `ch02-in-the-house.png` | `ch02-l05` card 4 | فِي الْبَيْتِ | A family seated together inside a house, seen through a wide-open doorway |
| `ch02-on-the-house.png` | `ch02-l06` card 4 | عَلَى الْبَيْتِ | A bird sitting on the roof of a house |
| `ch02-from-the-house.png` | `ch02-l07` card 4 | مِنْ الْبَيْتِ | A boy stepping out of a house's front door and walking away from it |
| `ch02-to-the-house.png` | `ch02-l08` card 4 | إِلَى الْبَيْتِ | A boy walking along a garden path toward a house's front door |
| `ch02-in-front-of.png` | `ch02-l09` cards 1, 2, 3 | أَمَامَ | A child standing directly in front of a closed wooden door, facing the viewer |
| `ch02-in-front-of-the-house.png` | `ch02-l09` card 4 | أَمَامَ الْبَيْتِ | A tree standing in front of a house, between the house and the viewer |
| `ch02-behind-the-house.png` | `ch02-l10` card 4 | خَلْفَ الْبَيْتِ | A tall tree partly hidden behind a house, its crown showing above the roof |
| `ch02-above-the-house.png` | `ch02-l11` card 4 | فَوْقَ الْبَيْتِ | A crescent moon high above a house at night |
| `ch02-under-the-house.png` | `ch02-l12` card 4 | تَحْتَ الْبَيْتِ | A cat curled up in the space under a raised wooden house |
| `ch02-with-the-house.png` | `ch02-l13` card 4 | مَعَ الْبَيْتِ | A house together with its own garden, the two forming one home |
| `ch02-writing-with-pen.png` | `ch02-l14` cards 1, 2, 3 | بِ | A hand writing in a notebook with a pen: done by means of the pen |
| `ch02-by-the-house.png` | `ch02-l14` card 4 | بِ الْبَيْتِ | A wooden bench standing right by the wall of a house |
| `ch02-and-the-house.png` | `ch02-l15` card 4 | وَ الْبَيْتِ | A house and a tree side by side, the two things together |
| `ch02-three-descriptions.png` | `ch02-l04` card 2 | الْمُبْتَدَأُ وَالْخَبَرُ | Three panels: a brand-new book, a big house, an old weathered mosque |

### Chapter 3

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch03-idafa-two-joined.png` | `ch03-l01` cards 1, 10 · `ch03-l06` cards 1, 11 · `ch03-l04` cards 1, 2 | الإِضَافَة · قاعدة الإضافة · الإِضَافَة فِي العِبَارَات · الفصل الثالث — القواعد الأساسية · الإضافة — مرجع سريع | Two blank tiles snapping together like puzzle pieces: the first loses a small round knob as it joins, the second carries a small curl beneath it. Two nouns become one phrase |
| `ch03-students-book.png` | `ch03-l01` card 2 · `ch03-l02` card 3 · `ch05-l05` card 3 | كِتَابُ الطَّالِبِ · هٰذَا كِتَابُ الطَّالِبِ | A student holding up his own book, a blank name label on its cover |
| `ch03-mans-house.png` | `ch03-l01` card 3 | بَيْتُ الرَّجُلِ | A man standing at the door of his own house, key in hand |
| `ch03-mosque-door.png` | `ch03-l01` card 4 | بَابُ الْمَسْجِدِ | The large carved wooden door of a mosque, close up |
| `ch03-teachers-pen.png` | `ch03-l01` card 5 | قَلَمُ الأُسْتَاذِ | A teacher at his desk holding his pen over an open register |
| `ch03-open-mushaf.png` | `ch03-l01` card 6 · `ch11-l03` card 7 | كَلَامُ اللَّهِ · ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ | An open Mushaf on a wooden stand in soft light (nothing readable on the page) |
| `ch03-kaaba.png` | `ch03-l01` card 9 · `ch03-l06` card 10 | بَيْتُ اللَّهِ | The Kaaba in the courtyard of Masjid al-Haram, seen from a respectful distance |
| `ch03-light-of-sky.png` | `ch03-l06` card 4 | نُورُ السَّمَاءِ | Soft light streaming down through clouds across a wide sky |
| `ch03-servant-prostration.png` | `ch03-l06` card 8 · `ch03-l03` card 10 · `ch07-l01` card 9 | عَبْدُ اللَّهِ · يَا عِبَادِيَ | A man in sujood on a prayer mat, seen from behind in soft light |
| `ch03-whose-book.png` | `ch03-l02` cards 1, 2 | لِمَنْ — للسؤال عن الملكية · لِمَنْ هٰذَا؟ | A book lying alone on a table while two children look at it and at each other with open, questioning hands: whose is it? |
| `ch03-today-sun.png` | `ch03-l02` card 5 | الْيَوْمُ | The sun high over a quiet town in the middle of the day |
| `ch03-day-of-resurrection.png` | `ch03-l02` card 6 | يَوْمُ الْقِيَامَةِ | A vast empty plain under an overwhelming dawn light. No figures |
| `ch03-calling-boy.png` | `ch03-l07` cards 1, 4 | يَا — حرف النداء · يَا وَلَدُ | A man calling out to a boy across a courtyard; the boy turns round |
| `ch03-dua-hands.png` | `ch03-l07` card 2 · `ch07-l01` card 4 · `ch07-l02` card 6 | يَا رَبِّ · رَبِّي · رَبُّكَ | Two hands raised in dua against a soft dawn sky, seen from behind; no face |
| `ch03-calling-teacher.png` | `ch03-l07` cards 3, 7, 8 | يَا أُسْتَاذُ · قَبْلَ يَا وَبَعْدَهَا · قَاعِدَةٌ مُبَسَّطَةٌ | A pupil raising a hand and calling to the teacher at the front of the classroom |
| `ch03-calling-father.png` | `ch03-l07` card 5 | يَا أَبِي | A child running toward his father, one arm raised, calling to him |
| `ch03-calling-mother.png` | `ch03-l07` card 6 | يَا أُمِّي | A girl in modest dress calling to her mother across the kitchen doorway |
| `ch03-bismillah-start.png` | `ch03-l03` cards 1, 3, 11 | بِسْمِ — ثلاثة طبقات نحوية · اللَّهُ · بِاسْمِ اللَّهِ | Hands opening a Mushaf at its first page, gentle light rising from it: beginning in the name of Allah (nothing readable) |
| `ch03-praise-dawn.png` | `ch03-l03` card 6 | بِحَمْدِهِ | Birds in flight over trees at dawn, the whole landscape glowing. No figures |

### Chapter 4

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch04-righteous-boy.png` | `ch04-l01` card 5 · `ch04-l02` card 6 | وَلَدٌ صَالِحٌ · الْوَلَدُ الصَّالِحُ | A boy helping an elderly man carry his bag across a street |
| `ch04-kind-words.png` | `ch04-l01` card 12 · `ch04-l02` card 9 | كَلَامٌ حَسَنٌ · الْقَوْلُ الْكَرِيمُ | Two men talking warmly, one speaking kindly to the other with an open hand |
| `ch04-righteous-deed.png` | `ch04-l02` card 10 · `ch04-l06` card 4 | الْعَمَلُ الصَّالِحُ | A young man carrying a jug of water to an elderly neighbour's doorstep |
| `ch04-three-checks.png` | `ch04-l06` card 1 | ثَلَاثَةُ مَفَاتِيحَ | Three small tiles in a row with a tick under each: an arrow from a noun block to an adjective block (order), two matching highlighted tags (definiteness), two matching gold beads (gender) |

### Chapter 5

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch05-school-near-far.png` | `ch05-l02` cards 9, 10 · `ch05-l05` card 2 | هَٰذِهِ / تِلْكَ · تِلْكَ | Two panels: a school right in front of the viewer; the same school small in the distance |
| `ch05-idafa-vs-has.png` | `ch05-l03` card 9 | كِتَابُ الطَّالِبِ / لِلطَّالِبِ كِتَابٌ | Two panels: left, a student's own book with a blank name label on the cover; right, the same student holding a book out to show he has one |
| `ch05-left-in-anger.png` | `ch05-l04` card 9 | — | A lone path leading away from a town toward the sea at dusk. No figures |
| `ch05-one-went-group-went.png` | `ch05-l07` card 9 | ذَهَبَ / ذَهَبُوا | Two panels: one man walking away down a road; a group of men walking away down the same road |
| `ch05-four-pointers.png` | `ch05-l05` card 1 | هَٰذَا، ذَٰلِكَ، هَٰذِهِ، تِلْكَ | Four-panel grid from the learner's viewpoint: a book near, a book far, a tree near, a tree far |

### Chapter 6

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch06-three-connectors.png` | `ch06-l02` card 7 · `ch06-l04` card 9 · `ch06-l05` card 8 | الَّذِي / الَّتِي / الَّذِينَ | Three panels, each with a small pointing arrow: one man, one woman, a group of men |
| `ch06-went-read.png` | `ch06-l02` card 8 | ذَهَبَ / قَرَأَ | Two panels: a boy walking out through a door; the same boy sitting and reading a book |
| `ch06-measured-guided.png` | `ch06-l04` cards 5, 6, 7, 10 | وَالَّذِي قَدَّرَ فَهَدَىٰ · وَ + الَّذِي · فَ + هَدَىٰ | A seed, then a sapling growing up along a guiding trellis toward the light: measured, then guided. No figures |

### Chapter 7

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch07-asking-him-pen.png` | `ch07-l04` card 7 | أَعِنْدَكَ قَلَمٌ؟ | One boy asking another boy with an open hand; the other boy holds up a pen: yes, I have one |
| `ch07-asking-her-pen.png` | `ch07-l04` card 8 | أَعِنْدَكِ قَلَمٌ؟ | One girl in modest dress asking another girl with an open hand; the other girl holds up a pen |
| `ch07-five-owners-books.png` | `ch07-l06` card 1 | الضَّمَائِرُ الْمُتَّصِلَةُ الْمُفْرَدَة | Five identical books, each held by a different owner: the viewer's own hands, a boy facing us, a girl facing us, a boy seen from the side, a girl seen from the side |

### Chapter 8

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch08-he-said-she-said.png` | `ch08-l01` card 5 · `ch08-l05` card 2 | قَالَ / قَالَتْ | Two panels: a man speaking with an open hand; a woman in modest dress speaking with the same gesture |
| `ch11-invitation-well.png` | `ch08-l01` card 9 · `ch11-l01` card 8 · `ch11-l06` card 8 | قَالَتْ · إِنَّ أَبِي يَدْعُوكَ | A desert well beside a path that leads toward a distant tent. No figures |
| `ch08-come-out-door.png` | `ch08-l02` cards 7, 8 · `ch08-l05` card 4 | قَالَتِ اخْرُجْ · وَقَالَتِ · قَالَتْ / قَالَتِ | An inner doorway with a curtain drawn aside and light spilling from the room beyond. No figures |
| `ch08-ancient-city-pillars.png` | `ch08-l03` card 9 | الَّتِي | Ruins of a great ancient city of tall stone pillars in the desert. No figures |
| `ch08-truthful-lamp.png` | `ch08-l04` card 4 | أُمُّهُ صِدِّيقَةٌ | A single lamp burning steadily in a quiet prayer niche. No figures |

### Chapter 9

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch09-teacher-teachers.png` | `ch09-l01` card 4 | مُعَلِّمٌ / مُعَلِّمُونَ | Two panels: one male teacher at a board; a group of male teachers standing together |
| `ch09-mixed-group.png` | `ch09-l01` card 7 | جَمَاعَةٌ مِنْ رِجَالٍ وَنِسَاء | A congregation of men and women (separate groups, modest dress) walking out of a mosque together |
| `ch09-men-women-groups.png` | `ch09-l02` card 7 | مُؤْمِنُونَ / مُؤْمِنَاتٌ | Two panels: a group of men walking to the mosque; a group of women in modest dress walking to the mosque |
| `ch09-who-are-these.png` | `ch09-l04` card 7 | مَنْ هٰؤُلَاءِ؟ | A child tugging a parent's sleeve and looking at a group of visitors standing at the door |
| `ch09-three-plurals.png` | `ch09-l05` card 1 | أَنْوَاعُ الْجَمْعِ الثَّلَاثَة | Three panels: a group of men, a group of women, a stack of books |
| `ch09-believers-believe.png` | `ch09-l05` card 8 | مُؤْمِنُونَ / يُؤْمِنُونَ | Two panels: a group of men standing calmly (who they are); the same group raising their hands in dua (what they do) |

### Chapter 10

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch10-upon-them.png` | `ch10-l01` card 6 · `ch10-l06` card 6 | هُمْ / ـهِمْ · هُمْ / عَلَيْهِمْ | Soft light falling from above onto a small group seen from behind, walking a straight path |
| `ch10-unaware.png` | `ch10-l01` card 8 | وَهُمْ لَا يَشْعُرُونَ | A group walking on at dusk with their backs to a bright lamp they do not notice |
| `ch10-congregation-rows.png` | `ch10-l02` cards 5, 6, 9 | نَعْبُدُ · نَعْبُدُ / نَسْتَعِينُ · إِيَّاكَ نَعْبُدُ | Rows of worshippers standing shoulder to shoulder in prayer, seen from behind |
| `ch10-you-all-women.png` | `ch10-l05` cards 2, 4 | أَنْتُنَّ · أَنْتُنَّ طَالِبَاتٌ | A woman teacher in modest dress facing a group of women students and speaking to them |
| `ch10-you-all-two-groups.png` | `ch10-l05` card 9 · `ch10-l06` card 3 | أَنْتُمْ / أَنْتُنَّ | Two panels: a speaker facing a group of men; a speaker facing a group of women |
| `ch10-five-pronouns.png` | `ch10-l06` card 1 | هُمْ، هُنَّ، نَحْنُ، أَنْتُمْ، أَنْتُنَّ | Five small panels: a group of men, a group of women, a group that includes the viewer, a speaker facing men, a speaker facing women |

### Chapter 11

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch11-my-father-my-mother.png` | `ch11-l01` card 3 | يَاءُ الْمُتَكَلِّمِ | A child standing between father and mother, holding both their hands |
| `ch11-brother-sister.png` | `ch11-l02` card 6 | أَخِي / أُخْتِي | A boy and his sister in modest dress standing side by side |
| `ch11-brothers-believers.png` | `ch11-l02` card 8 | إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ | Men of different ages greeting each other warmly outside a mosque |
| `ch11-pen-in-drawer.png` | `ch11-l03` cards 2, 5, 6, 8 | فِيهِ · هُوَ فِيهِ · فِي الدُّرْجِ / فِيهِ | An open desk drawer with a pen lying inside it |
| `ch11-book-in-bag.png` | `ch11-l04` cards 2, 4 | فِيهَا · هُوَ فِيهَا | An open school bag with a book inside it |
| `ch11-drawer-and-bag.png` | `ch11-l04` cards 5, 8 · `ch11-l05` card 7 · `ch11-l06` card 5 | فِيهِ / فِيهَا · ـهِ، ـهَا، ـكُمْ · الدُّرْجِ / الْحَقِيبَةِ | Two panels: a pen in an open desk drawer; a book in an open school bag |
| `ch11-your-homes.png` | `ch11-l05` cards 4, 5, 8 | بُيُوتِكُمْ · فِي بُيُوتِكُمْ · وَاللَّهُ جَعَلَ لَكُم مِّن بُيُوتِكُمْ سَكَنًا | A quiet street of family homes at evening, lamps lit in every window |

### Chapters 1–11 — waiting on a scene already requested

| Card | Arabic | Scene |
|---|---|---|
| `ch04-l01` card 7 | قَلَمٌ صَغِيرٌ | `ch24-pen-small.png` |
| `ch04-l01` card 8 | مَسْجِدٌ قَرِيبٌ | `ch25-mosque-not-far.png` |
| `ch04-l05` card 5 | اِخْتِبَارٌ سَرِيعٌ | `ch25-mosque-not-far.png` |

### Chapters 1–11 — wired 2026-09-24 to an existing picture

| Picture | Cards |
|---|---|
| `images/discover/ch19-lord-of-worlds.webp` | `ch03-l06` 2 |
| `images/discover/ch18-king-of-mankind.webp` | `ch03-l06` 3 · `ch03-l02` 10 |
| `images/discover/ch20-mankind-lord.webp` | `ch03-l02` 9, 11 |
| `images/discover/ch19-my-religion.webp` | `ch04-l01` 10 · `ch04-l02` 7 · `ch04-l06` 7 · `ch07-l01` 5 |
| `images/discover/ch14-phrase-or-sentence.webp` | `ch04-l02` 12 · `ch04-l05` 1 |
| `images/discover/ch16-iqra-cave-light.webp` | `ch07-l02` 9 |
| `images/discover/ch19-two-paths.webp` | `ch07-l03` 8 · `ch10-l05` 8 |
| `images/discover/ch19-i-have-vs-my.webp` | `ch07-l06` 6 |
| `images/discover/ch18-he-who-she-who-went.webp` | `ch08-l03` 2, 7 · `ch08-l05` 5 |
| `images/discover/ch14-people-or-things-sort.webp` | `ch09-l01` 6 · `ch09-l03` 6 |
| `images/discover/ch20-our-lord-guide-us.webp` | `ch10-l04` 8 |
| `images/discover/ch14-large-houses.webp` | `ch11-l05` 2, 6 |
| `images/discover/sirat.webp` | `ch01-l01` 7 |
| `images/discover/dhalika-v2.webp` | `ch01-l02` 3 |
| `images/discover/ch12-muallim-teacher.webp` | `ch01-l02` 5 · `ch02-l01` 9 |
| `images/discover/talib.webp` | `ch01-l02` 6 · `ch02-l01` 8 · `ch04-l01` 6 · `ch04-l02` 5 · `ch06-l01` 7 |
| `images/discover/ch05-near-feminine-scene.webp` | `ch01-l03` 2 |
| `images/discover/shajara.webp` | `ch01-l03` 3 · `ch05-l01` 10 · `ch05-l02` 3 |
| `images/discover/ch05-tilka-ayat-allah.webp` | `ch01-l03` 8 · `ch05-l02` 7, 8 · `ch05-l06` 8 |
| `images/discover/nima.webp` | `ch01-l03` 10 · `ch03-l06` 6 · `ch03-l03` 8 · `ch04-l03` 9 · `ch04-l06` 5 |
| `images/discover/umma.webp` | `ch01-l03` 11 |
| `images/discover/madrasa.webp` | `ch01-l04` 2 · `ch04-l03` 3 · `ch05-l01` 8 · `ch05-l02` 4 |
| `images/discover/kitab.webp` | `ch02-l01` 2 · `ch02-l02` 4 |
| `images/discover/qalam.webp` | `ch02-l01` 3 · `ch06-l03` 9 |
| `images/discover/bayt.webp` | `ch02-l01` 4 |
| `images/discover/masjid.webp` | `ch02-l01` 5 · `ch06-l03` 10 |
| `images/discover/rajul.webp` | `ch02-l01` 6 · `ch04-l01` 2 · `ch04-l02` 3 · `ch04-l05` 4 · `ch06-l02` 10 |
| `images/discover/walad.webp` | `ch02-l01` 7 |
| `images/discover/bab.webp` | `ch02-l01` 10 |
| `images/discover/kursi.webp` | `ch02-l01` 11 |
| `images/discover/suq.webp` | `ch02-l01` 12 |
| `images/discover/tariq.webp` | `ch02-l01` 13 |
| `images/discover/ayna.webp` | `ch02-l03` 3 |
| `images/discover/fi.webp` | `ch02-l05` 1, 2, 3 |
| `images/discover/ala.webp` | `ch02-l06` 2, 3 |
| `images/discover/min.webp` | `ch02-l07` 2, 3 |
| `images/discover/ila.webp` | `ch02-l08` 2, 3 · `ch05-l07` 10 |
| `images/discover/khalfa.webp` | `ch02-l10` 1, 2, 3 |
| `images/discover/fawqa.webp` | `ch02-l11` 1, 2, 3 |
| `images/discover/tahta.webp` | `ch02-l12` 1, 2, 3 |
| `images/discover/maa.webp` | `ch02-l13` 1, 2, 3 |
| `images/discover/wa.webp` | `ch02-l15` 1, 2, 3 |
| `images/discover/umm.webp` | `ch03-l01` 7 · `ch08-l04` 3 · `ch11-l01` 5 |
| `images/discover/madina.webp` | `ch03-l01` 8 · `ch03-l06` 9 · `ch04-l03` 2 |
| `images/discover/rahma.webp` | `ch03-l06` 5 · `ch03-l03` 4, 5, 7 · `ch04-l03` 8 |
| `images/discover/fadl.webp` | `ch03-l06` 7 · `ch03-l03` 9 |
| `images/discover/mulk.webp` | `ch03-l02` 4 · `ch03-l04` 3 |
| `images/discover/janna-v2.webp` | `ch03-l02` 7 · `ch04-l03` 6 |
| `images/discover/sabil.webp` | `ch03-l02` 8 |
| `images/discover/ism.webp` | `ch03-l03` 2 |
| `images/discover/ilm.webp` | `ch04-l01` 11 · `ch04-l02` 8 · `ch04-l06` 8 |
| `images/discover/ch04-adjective-after-noun-v1.png` | `ch04-l01` 13 · `ch04-l04` 1 |
| `images/discover/sirat-mustaqim.webp` | `ch04-l02` 11 · `ch04-l06` 2, 9 |
| `images/discover/ghurfa.webp` | `ch04-l03` 4 |
| `images/discover/imraa.webp` | `ch04-l03` 5 |
| `images/discover/kalima.webp` | `ch04-l03` 7 · `ch04-l06` 3 · `ch05-l01` 5 · `ch05-l05` 5 |
| `images/discover/salah.webp` | `ch04-l03` 11 · `ch10-l03` 5, 6, 7 |
| `images/discover/ch04-feminine-agreement-v1.png` | `ch04-l03` 12 · `ch04-l04` 3 |
| `images/discover/ch04-definite-agreement-v1.png` | `ch04-l04` 2 |
| `images/discover/ch05-naqat-allah.webp` | `ch05-l01` 9 |
| `images/discover/ch05-lahu-laha-lakum-owners.webp` | `ch05-l03` 1 · `ch05-l06` 2, 4, 6, 7, 11 · `ch05-l05` 6 |
| `images/discover/ch05-li-laka-contrast.webp` | `ch05-l03` 2, 5, 8, 10 · `ch05-l06` 1 |
| `images/discover/ch07-two-listeners.webp` | `ch05-l03` 6 · `ch07-l02` 8 · `ch07-l06` 3 |
| `images/discover/samaa.webp` | `ch05-l06` 9 |
| `images/discover/dhahaba.webp` | `ch05-l04` 1, 3, 4, 10 |
| `images/discover/ch05-dhahaba-movement.webp` | `ch05-l04` 6, 8 · `ch05-l07` 2 · `ch06-l01` 6, 9 |
| `images/discover/ch05-action-doer-destination.webp` | `ch05-l07` 11 |
| `images/discover/ch06-described-person-action.webp` | `ch06-l01` 5 |
| `images/discover/ch06-person-connected-action.webp` | `ch06-l02` 1 · `ch06-l04` 1 · `ch06-l05` 4 |
| `images/discover/ch06-creation-chain.webp` | `ch06-l02` 9 · `ch06-l04` 2, 3 |
| `images/discover/ch06-place-tool-panels.webp` | `ch06-l03` 7, 8 |
| `images/discover/ch07-his-her-owners.webp` | `ch07-l03` 9 · `ch07-l06` 4 |
| `images/discover/ch07-my-objects.webp` | `ch07-l06` 5 · `ch11-l06` 7 |
| `images/discover/ch08-he-she-movement.webp` | `ch08-l01` 1, 3, 7, 8 · `ch08-l02` 5 |
| `images/discover/ch08-she-returned-sat-entered.webp` | `ch08-l02` 2, 3, 4, 9 · `ch08-l05` 3 |
| `images/discover/bint.webp` | `ch08-l03` 10 |
| `images/discover/ch08-mother-returning-home.webp` | `ch08-l04` 8, 9 |
| `images/discover/ch09-one-man-group.webp` | `ch09-l01` 2, 5, 8, 9 |
| `images/discover/ch09-one-woman-group.webp` | `ch09-l02` 1, 6, 8 |
| `images/discover/mumina.webp` | `ch09-l02` 5, 9 |
| `images/discover/ch09-one-many-four-panels.webp` | `ch09-l03` 8 |
| `images/discover/ch09-pointing-at-group.webp` | `ch09-l04` 6, 8 · `ch09-l05` 7 |
| `images/discover/ch10-they-two-groups.webp` | `ch10-l01` 3, 4, 7, 9 · `ch10-l06` 2 |
| `images/discover/ch10-we-group-speaking.webp` | `ch10-l02` 1, 4, 8 · `ch10-l06` 5 |
| `images/discover/ch10-you-all-facing-group.webp` | `ch10-l05` 1, 3, 7 |
| `images/discover/ch10-before-timeline.webp` | `ch10-l03` 1 |
| `images/discover/ch10-after-timeline.webp` | `ch10-l04` 1 |
| `images/discover/dars.webp` | `ch10-l04` 6, 7 |
| `images/discover/ab.webp` | `ch11-l01` 4 |
| `images/discover/ard.webp` | `ch11-l04` 7 |
| `images/discover/aila.webp` | `ch11-l06` 2, 3 |

## Delivered — 2026-09-21

31 scenes for Chapters 5–10 and 12, delivered as 1024×1024 transparent PNG
cutouts in `Warsh-images/lesson-illustrations/` (committed originals). Uploaded
via `images:upload-lessons` to R2 as `images/discover/{slug}.webp` (768 px,
~3.8 MB total), written into 63 discover cards across 32 fixtures, and
published to production with `content:sync` (media-URL diffs only; mirror
430/430 in sync afterwards). The photographic batch in
`generated/lesson-illustrations/` is a separate higher-quality set the owner
keeps for other uses (marketing, print); it is not the card asset and must not
be deleted.

| Filename | Cards | Arabic on the card |
|---|---|---|
| `ch05-near-feminine-scene.png` | `ch05-l01` card 1 | هَٰذِهِ |
| `ch05-tilka-ayat-allah.png` | `ch05-l02` cards 5, 6 | تِلْكَ آيَاتُ اللَّهِ |
| ✅ `ch05-li-laka-contrast.png` | `ch05-l03` card 7 | لِي / لَكَ / لَكِ |
| ✅ `ch05-lahu-laha-lakum-owners.png` | `ch05-l06` card 10 | لَهُ / لَهَا / لَكُمْ |
| `ch05-dhahaba-movement.png` | `ch05-l04` cards 5, 7 · `ch05-l07` card 1 · `ch05-l05` card 7 | ذَهَبَ الطَّالِبُ |
| ✅ `ch05-action-doer-destination.png` | `ch05-l07` cards 5, 8 · `ch05-l05` card 8 | ذَهَبَ الطَّالِبُ إِلَى الْمَدْرَسَةِ |
| `ch05-naqat-allah.png` | `ch05-l01` cards 6, 7 | نَاقَةُ اللَّهِ |
| ✅ `ch06-described-person-action.png` | `ch06-l01` card 8 | الرَّجُلُ الْكَرِيمُ + ذَهَبَ |
| ✅ `ch06-person-connected-action.png` | `ch06-l02` cards 3, 6 | الْوَلَدُ الَّذِي ذَهَبَ |
| ✅ `ch06-place-tool-panels.png` | `ch06-l03` cards 4, 6 | الْكِتَابُ الَّذِي فِي الْبَيْتِ · بِالْقَلَمِ |
| `ch06-creation-chain.png` | `ch06-l04` cards 4, 8 · `ch06-l05` card 7 | الَّذِي خَلَقَ فَسَوَّىٰ |
| ✅ `ch07-my-objects.png` | `ch07-l01` cards 1, 8 | كِتَابِي / قَلَمِي / بَيْتِي |
| ✅ `ch07-two-listeners.png` | `ch07-l02` cards 1, 2, 7 | كِتَابُكَ / كِتَابُكِ |
| `ch07-his-her-owners.png` | `ch07-l03` cards 1, 2, 7 | كِتَابُهُ / مَدْرَسَتُهَا |
| ✅ `ch07-four-people-have.png` | `ch07-l04` cards 1, 9 · `ch07-l06` card 7 | عِنْدِي / عِنْدَكَ / عِنْدَكِ / عِنْدَهُ / عِنْدَهَا |
| ✅ `ch07-classroom-questions.png` | `ch07-l06` card 8 | مَا، مَنْ، أَيْنَ / أَعِنْدَكَ قَلَمٌ؟ |
| `ch08-he-she-movement.png` | `ch08-l01` cards 4, 6 | ذَهَبَ / ذَهَبَتْ · ذَهَبَتْ فَاطِمَةُ |
| ✅ `ch08-she-returned-sat-entered.png` | `ch08-l02` cards 1, 6 | رَجَعَتْ · جَلَسَتْ · دَخَلَتْ |
| ✅ `ch08-allati-connector-panels.png` | `ch08-l03` cards 4, 8 | الْبِنْتُ الَّتِي ذَهَبَتْ · الْمَدْرَسَةُ الَّتِي فِي الْقَرْيَةِ |
| ✅ `ch08-mother-returning-home.png` | `ch08-l04` cards 6, 7 | رَجَعَتْ أُمِّي إِلَى الْبَيْتِ · أُمِّي الَّتِي رَجَعَتْ |
| ✅ `ch09-one-man-group.png` | `ch09-l01` cards 1, 3 · `ch09-l05` card 2 | مُسْلِمٌ / مُسْلِمُونَ · مُؤْمِنٌ / مُؤْمِنُونَ |
| ✅ `ch09-one-woman-group.png` | `ch09-l02` cards 2, 3 | طَالِبَةٌ / طَالِبَاتٌ · مُعَلِّمَةٌ / مُعَلِّمَاتٌ |
| `ch09-one-many-four-panels.png` | `ch09-l03` cards 1, 7 | الْجَمْعُ الْمُكَسَّر · عَائِلَاتُ الْكَلِمَات |
| ✅ `ch09-pointing-at-group.png` | `ch09-l04` cards 3, 4 | هٰؤُلَاءِ مُسْلِمُونَ · هٰؤُلَاءِ طَالِبَاتٌ |
| ✅ `ch10-they-two-groups.png` | `ch10-l01` cards 2, 5 | هُنَّ · هُمْ / هُنَّ |
| ✅ `ch10-we-group-speaking.png` | `ch10-l02` cards 2, 7 | نَحْنُ · نَحْنُ / هُمْ |
| ✅ `ch10-you-all-facing-group.png` | `ch10-l05` (file 03) cards 5, 6 | الْمُخَاطَبُونَ · هُمْ / أَنْتُمْ |
| ✅ `ch10-before-timeline.png` | `ch10-l03` (file 04) cards 4, 9 | قَبْلَ وَبَعْدَ · قَبْلَ |
| ✅ `ch10-after-timeline.png` | `ch10-l04` (file 05) cards 4, 9 | قَبْلَ / بَعْدَ · قَبْلَ وَبَعْدَ |
| ✅ `ch12-muallim-teacher.png` | `ch12-l03` card 3 | مُعَلِّمٌ |
| ✅ `ch12-muhandis-engineer.png` | `ch12-l03` card 4 | مُهَنْدِسٌ |
