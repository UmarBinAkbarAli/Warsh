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
| `ch14-honourable-muslims.png` | `ch14-l01` card 6 · `ch14-l05` card 3 | كِرَامٌ · مُسْلِمُونَ صَالِحُونَ / مُسْلِمُونَ كِرَامٌ | A group of men at an open door warmly welcoming guests with dates and tea: generosity and honour, not wealth |
| `ch14-three-checks.png` | `ch14-l01` card 7 | الطَّالِبَاتُ الْمُجْتَهِدَاتُ | Three small tiles in a row with a tick under each: a cluster of figures (many), a girl figure (feminine), a highlighted tag hanging on an object (definite) |
| `ch14-honored-servants-light.png` | `ch14-l01` card 8 | مُكْرَمُونَ | Soft light falling from above onto a calm horizon at dawn. The ayah speaks of angels, so no figures of any kind |
| `ch14-new-books.png` | `ch14-l02` cards 1, 2 · `ch14-l03` card 6 | الْكُتُبُ الْجَدِيدَةُ · جَدِيدَةٌ / الْجَدِيدَةُ | A neat stack of brand-new books with crisp covers, one standing open |
| `ch14-large-houses.png` | `ch14-l02` card 3 · `ch14-l03` card 5 · `ch14-l05` card 4 | الْبُيُوتُ الْكَبِيرَةُ · الْبُيُوتُ الْكَبِيرَةُ / الْبُيُوتُ كَبِيرَةٌ | A street of several large family houses side by side |
| `ch14-large-mosques.png` | `ch14-l02` card 4 · `ch14-l03` card 4 | الْمَسَاجِدُ الْكَبِيرَةُ · الْمَسَاجِدُ الْكَبِيرَةُ / الْمَسَاجِدُ كَبِيرَةٌ | Two or three large mosques with domes and minarets on one skyline |
| `ch14-students-and-books.png` | `ch14-l02` card 5 · `ch14-l04` card 2 · `ch15-l02` card 1 | الطُّلَّابُ الْمُجْتَهِدُونَ / الْكُتُبُ الْجَدِيدَةُ · طُلَّابٌ مُجْتَهِدُونَ / كُتُبٌ جَدِيدَةٌ | Two panels: left, a group of students; right, a stack of books. People on one side, things on the other |
| `ch14-people-or-things-sort.png` | `ch14-l02` card 6 · `ch14-l04` card 1 · `ch14-l05` card 1 | عَاقِلٌ أَمْ غَيْرُ عَاقِلٍ؟ | A sorting scene with two trays: one holds small figures of people, the other holds objects (a book, a house, a cup, a mosque) |
| `ch14-houses-mosques-skyline.png` | `ch14-l02` card 7 | قَاعِدَةٌ لِلْمُبْتَدِئِ | A town skyline where large houses and large mosques stand together |
| `ch14-raised-couches.png` | `ch14-l02` card 8 · `ch14-l06` card 2 · `ch14-l05` card 8 | مَرْفُوعَةٌ · سُرُرٌ مَرْفُوعَةٌ | A paradise garden terrace: couches set high on raised platforms among greenery and flowing water; no people |
| `ch14-phrase-or-sentence.png` | `ch14-l03` cards 1, 2 · `ch14-l05` card 5 · `ch15-l03` card 1 | تَرْكِيبٌ أَمْ جُمْلَةٌ؟ · الْكُتُبُ الْجَدِيدَةُ / الْكُتُبُ جَدِيدَةٌ | Two panels of the same new books: left, the books carry a small ribbon tag (naming them); right, an empty speech bubble beside them (saying something about them) |
| `ch14-cups-put-in-place.png` | `ch14-l03` cards 7, 8 · `ch14-l06` card 3 | أَكْوَابٌ مَوْضُوعَةٌ · مَوْضُوعَةٌ | Elegant cups set out in a neat row on a low table, ready for guests; no people |
| `ch14-believers-and-mosques.png` | `ch14-l04` card 3 | مُؤْمِنُونَ صَالِحُونَ / مَسَاجِدُ كَبِيرَةٌ | Two panels: left, worshippers seen from behind walking to prayer; right, large mosques |
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
| `ch15-pointing-set-recall.png` | `ch15-l01` card 1 | هٰذَا، ذٰلِكَ، هٰؤُلَاءِ | A learner in the foreground pointing at three things: a book nearby, a tree far away, and a small group of people nearby |
| `ch15-far-group.png` | `ch15-l01` card 2 | أُولٰئِكَ | A learner in the foreground pointing across a wide courtyard at a group of students standing far away |
| `ch15-near-far-group.png` | `ch15-l01` card 3 · `ch15-l05` card 2 | هٰؤُلَاءِ طُلَّابٌ / أُولٰئِكَ طُلَّابٌ | Two panels: left, a learner pointing at a group of students right beside them; right, pointing at the same group far away |
| `ch15-far-group-muslims.png` | `ch15-l01` card 4 | أُولٰئِكَ مُسْلِمُونَ | A group of worshippers far away, seen from behind, walking toward a distant mosque |
| `ch15-far-group-girls.png` | `ch15-l01` card 5 · `ch15-l03` card 6 | أُولٰئِكَ طَالِبَاتٌ · أُولٰئِكَ الطَّالِبَاتُ مُجْتَهِدَاتٌ | A group of girl students far away across a school courtyard |
| `ch15-far-or-earlier.png` | `ch15-l01` card 6 | أُولٰئِكَ | Two panels: left, a group of people far across a field; right, an open book with a ribbon marker pointing back to an earlier page |
| `ch15-guidance-path.png` | `ch15-l01` card 7 · `ch15-l04` card 4 · `ch15-l05` card 5 | أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ | A road at night lit ahead by a row of lanterns (those upon guidance); no figures |
| `ch15-successful-harvest.png` | `ch15-l01` card 8 | وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ | A flourishing field ready for harvest at sunrise: success that grows |
| `ch15-near-students-near-books.png` | `ch15-l02` card 2 | هٰؤُلَاءِ طُلَّابٌ / هٰذِهِ كُتُبٌ | Two panels, both close to the viewer: left, a group of students; right, a stack of books |
| `ch15-far-students-far-books.png` | `ch15-l02` card 3 | أُولٰئِكَ طُلَّابٌ / تِلْكَ كُتُبٌ | Two panels, both far from the viewer: left, a group of students; right, a stack of books on a distant shelf |
| `ch15-these-books-near.png` | `ch15-l02` card 4 | هٰذِهِ كُتُبٌ جَدِيدَةٌ | A hand pointing at a stack of new books right in front of the viewer |
| `ch15-those-houses-far.png` | `ch15-l02` card 5 | تِلْكَ بُيُوتٌ | A learner pointing at a row of houses on a far hillside |
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
| `ch16-went-to-school-yesterday.png` | `ch16-l03` card 5 | ذَهَبَ الطَّالِبُ إِلَى الْمَدْرَسَةِ أَمْسِ | A student walking to school, with a torn-off calendar page drifting behind to mark the past |
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
| `ch17-object-or-destination.png` | `ch17-l06` card 3 | قَرَأَ الطَّالِبُ الْكِتَابَ / ذَهَبَ الرَّجُلُ إِلَى الْمَسْجِدِ | Two panels: left, a student reading a book (an object); right, a man walking to a mosque (a destination) |
| `ch17-she-drank-she-prayed.png` | `ch17-l06` card 4 | شَرِبَتْ / صَلَّتْ | Two panels: left, a girl drinking water; right, a girl praying |
| `ch17-context-meanings.png` | `ch17-l06` card 5 | كَتَبَ / شَرِبَ / صَلَّى | Three panels: writing in a notebook, drinking water, praying |
| `ch17-balance-scale.png` | `ch17-l06` card 6 | لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ | A simple balance scale in soft light |

### Chapter 18

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch18-whisper-shadow.png` | `ch18-l01` card 2 · `ch18-l02` card 7 · `ch18-l03` card 7 | مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ | A dark wisp of smoke-like shadow slipping back from the light of a lamp. Never draw a devil or creature |
| `ch18-whisper-hearts.png` | `ch18-l01` card 6 · `ch18-l03` card 8 · `ch18-l05` card 7 · `ch18-l06` card 5 | الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ | A lamp-lit room at night with faint drifting wisps; no figures and no creature |
| `ch18-four-jobs.png` | `ch18-l01` card 8 | اسْمٌ، صِفَةٌ، اسْمٌ مَوْصُولٌ، فِعْلٌ | Four tiles: an object (a name), a colour swatch (a describing word), a chain link (a connector), a motion arrow (an action) |
| `ch18-the-man-who-went.png` | `ch18-l02` card 1 | الرَّجُلُ الَّذِي ذَهَبَ إِلَى الْمَسْجِدِ | Among several men standing in a street, one specific man is highlighted by a soft glow as he walks into a mosque |
| `ch18-a-man-who-went.png` | `ch18-l02` cards 2, 6 | رَجُلٌ ذَهَبَ إِلَى الْمَسْجِدِ · هٰذَا رَجُلٌ ذَهَبَ إِلَى الْمَسْجِدِ | A plain, unhighlighted man walking into a mosque (any man) |
| `ch18-the-vs-a-man.png` | `ch18-l02` card 3 | الرَّجُلُ الَّذِي ذَهَبَ / رَجُلٌ ذَهَبَ | Two panels: left, the highlighted man walking into the mosque (the man who went); right, the plain man (a man who went) |
| `ch18-the-girl-who-read.png` | `ch18-l02` card 4 · `ch18-l04` card 1 | الْبِنْتُ الَّتِي قَرَأَتِ الْكِتَابَ | Among several girls, one specific girl is highlighted, holding a book she has finished |
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
| `ch18-man-stood-teacher.png` | `ch18-l05` cards 3, 5 | الرَّجُلُ الَّذِي قَامَ أُسْتَاذٌ · الرَّجُلُ الَّذِي قَامَ | In a room of seated people, one man stands up; he is the teacher, with a book in hand |
| `ch18-girl-went-school-student.png` | `ch18-l05` card 4 | الْبِنْتُ الَّتِي ذَهَبَتْ إِلَى الْمَدْرَسَةِ طَالِبَةٌ | A girl with a school bag walking through a school gate |
| `ch18-who-stood-question.png` | `ch18-l05` card 6 | مَنِ الرَّجُلُ الَّذِي قَامَ؟ | A seated class with one man standing, an empty question bubble above the room |
| `ch18-refuge-shelter.png` | `ch18-l06` card 1 | قُلْ أَعُوذُ بِرَبِّ النَّاسِ | A sturdy, lit stone shelter at night amid strong wind and blowing leaves; no figures |
| `ch18-king-of-mankind.png` | `ch18-l06` card 4 | مَلِكِ النَّاسِ | A vast, diverse crowd of people seen from behind under a wide dawn sky. Nothing that pictures Allah |
| `ch18-jinn-and-mankind.png` | `ch18-l06` card 6 | مِنَ الْجِنَّةِ وَالنَّاسِ | A flame of smokeless fire on one side and a crowd of people seen from behind on the other; no creature drawn in the flame |
| `ch18-four-lines-summary.png` | `ch18-l06` card 8 | الرَّجُلُ الَّذِي / رَجُلٌ / الَّتِي / الْكَبِيرُ | Four stacked strips: the highlighted man who went, a plain man, the highlighted girl who went, the big mosque |

### Chapter 19

| Filename | Cards | Arabic on the card | Scene |
|---|---|---|---|
| `ch19-lord-of-worlds.png` | `ch19-l01` card 2 | الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ | Earth, planets and stars under a vast sky; no figures |
| `ch19-daybreak.png` | `ch19-l01` card 3 · `ch19-l06` card 4 | قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ | Dawn light splitting the night over dark hills |
| `ch19-subtle-kindness.png` | `ch19-l01` card 5 | إِنَّ رَبِّي لَطِيفٌ لِّمَا يَشَاءُ | A small green seedling growing through a crack in stone, touched by gentle light |
| `ch19-two-checks.png` | `ch19-l01` card 6 · `ch19-l06` card 1 | رَبِّ … / رَبِّي · رَبِّ / رَبِّي / أَيَّدْنَاهُ | A magnifying glass over two cards side by side, one with a small highlighted mark at its end |
| `ch19-teachers-house-my-house.png` | `ch19-l01` card 7 | بَيْتُ الْأُسْتَاذِ / بَيْتِي | Two panels: left, a teacher standing at the door of his house; right, a learner at the door of their own house, hand on chest (mine) |
| `ch19-after-him.png` | `ch19-l02` card 2 | بَعْدَهُ | Two sets of footprints along a sandy path, the second set following the first |
| `ch19-messengers-succession.png` | `ch19-l02` card 3 | وَقَفَّيْنَا مِن بَعْدِهِ بِالرُّسُلِ | A long road with lanterns lit one after another into the distance. No figures (the ayah is about prophets) |
| `ch19-supported-light.png` | `ch19-l02` card 4 | وَأَيَّدْنَاهُ بِرُوحِ الْقُدُسِ | A beam of soft light descending from above onto an open book; no figures |
| `ch19-his-book-heard-him.png` | `ch19-l02` card 5 · `ch19-l06` card 2 | كِتَابُهُ / سَمِعَهُ | Two panels: left, a man holding his book; right, a student listening to that man speak |
| `ch19-attached-to.png` | `ch19-l02` card 7 | بَعْدِهِ / أَيَّدْنَاهُ | Two panels: left, a small tag clipped onto a book (attached to a thing); right, the same tag clipped onto a motion arrow (attached to an action) |
| `ch19-darkness-settles.png` | `ch19-l02` card 8 | وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ | Night darkness spreading over a quiet village, the last light fading |
| `ch19-my-your-his-school.png` | `ch19-l03` card 2 | مَدْرَسَتِي، مَدْرَسَتُكَ، مَدْرَسَتُهُ | Three people each standing proudly at the gate of their own school |
| `ch19-his-village.png` | `ch19-l03` card 3 · `ch19-l06` card 3 | قَرْيَةٌ / قَرْيَتُهُ | A man standing at the gate of his village, looking in |
| `ch19-woman-his-wife.png` | `ch19-l03` card 4 | امْرَأَةٌ / امْرَأَتُهُ | Two panels: left, a woman in modest dress; right, a husband and wife side by side in modest dress |
| `ch19-her-village-big.png` | `ch19-l03` card 5 | قَرْيَتُهَا كَبِيرَةٌ | A woman in modest dress on a hill overlooking a large village |
| `ch19-tent-doorway.png` | `ch19-l03` card 6 | وَامْرَأَتُهُ قَائِمَةٌ | A tent doorway in the desert at dusk. The ayah is about Ibrahim's household, so no figures |
| `ch19-envy-wind.png` | `ch19-l03` card 7 | وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ | A lamp shielded from a dark gust of wind (refuge from envy); no figures |
| `ch19-my-book-her-book.png` | `ch19-l04` card 1 | كِتَابِي / كِتَابُهَا | Two panels: left, a learner holding their own book, hand on chest; right, a girl holding her book |
| `ch19-my-her-book-on-desk.png` | `ch19-l04` card 2 | كِتَابِي عَلَى الْمَكْتَبِ / كِتَابُهَا عَلَى الْمَكْتَبِ | A desk with two books side by side, one belonging to the learner and one to a girl beside it |
| `ch19-fatimah-new-book.png` | `ch19-l04` card 3 | فَاطِمَةُ طَالِبَةٌ، كِتَابُهَا جَدِيدٌ | A girl student (Fatimah) proudly holding a brand-new book |
| `ch19-fatimah-pen-on-desk.png` | `ch19-l04` card 4 | أَيْنَ قَلَمُكِ يَا فَاطِمَةُ؟ | A teacher asking; a girl student pointing to her pen lying on the desk |
| `ch19-maryam-east-place.png` | `ch19-l04` card 6 | وَاذْكُرْ فِي الْكِتَابِ مَرْيَمَ إِذِ انتَبَذَتْ مِنْ أَهْلِهَا | A quiet palm grove to the east at dawn. The ayah is about Maryam, so no figures |
| `ch19-i-have-vs-my.png` | `ch19-l05` card 1 | لِي كِتَابٌ / كِتَابِي | Two panels: left, a book being handed to the learner (I have); right, the book held close with a blank name label (my book) |
| `ch19-my-religion.png` | `ch19-l05` cards 2, 4 | دِينِي · دِينِي / دِينِ | A prayer mat, an open Mushaf and a tasbih arranged together |
| `ch19-two-paths.png` | `ch19-l05` cards 3, 5 | لَكُمْ دِينُكُمْ وَلِيَ دِينِ · لَكُمْ / دِينُكُمْ | Two separate paths leading in different directions from one point |
| `ch19-you-have-vs-your.png` | `ch19-l05` card 6 | لَكَ كِتَابٌ / كِتَابُكَ | Two panels: left, a book being handed to a boy (you have); right, the boy holding it with a blank name label (your book) |
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

**36 of 42 scenes delivered and published 2026-09-24 (marked ✅).** Still open: `ch20-your-houses.png`, `ch20-your-school-group.png`, `ch20-your-vs-their-group.png`, `ch20-your-book-women.png`, `ch20-mothers-provision.png`, `ch20-women-students-new-books.png`.

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
| `ch20-your-houses.png` | `ch20-l02` card 3 | بُيُوتُكُمْ | A row of family houses on a street, a speaker at the front addressing the families standing in their doorways |
| ✅ `ch20-mankind-lord.png` | `ch20-l02` card 4 | يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ | A vast, diverse crowd of people seen from behind under a wide sky at dawn; nothing that pictures Allah |
| ✅ `ch20-created-you.png` | `ch20-l02` card 5 · `ch20-l06` card 7 | رَبَّكُمُ / خَلَقَكُم · اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُم | Two panels: left, a crowd seen from behind under the sky (your Lord); right, a seed growing into a small tree beside the crowd (who created you) |
| `ch20-your-school-group.png` | `ch20-l02` card 6 | مَدْرَسَتُكُمْ كَبِيرَةٌ | A teacher at a school gate speaking to a class gathered in front of the building |
| ✅ `ch20-speaking-to-group.png` | `ch20-l02` card 7 | أَنْتُمْ / ـكُمْ | A speaker facing a group directly, speech lines pointing towards the whole group |
| ✅ `ch20-they-their-book.png` | `ch20-l03` card 1 | هُمْ / كِتَابُهُمْ | Two panels: left, a group of boys seen at a distance (they); right, the same group sharing one book (their book) |
| ✅ `ch20-their-house.png` | `ch20-l03` card 2 | بَيْتُهُمْ | A viewer pointing out a house across the street where a group of men lives |
| `ch20-your-vs-their-group.png` | `ch20-l03` card 3 | كِتَابُكُمْ / كِتَابُهُمْ | Two panels: left, a speaker facing a group and handing them a book (your book); right, the speaker pointing at a distant group holding a book (their book) |
| ✅ `ch20-sound-after-kasra.png` | `ch20-l03` card 4 · `ch20-l07` card 4 | رَبُّهُمْ / رَبِّهِمْ · رَبِّهِمْ / بُيُوتِهِنَّ | Two matching tiles with a small curved arrow between them, the second tile marked with a tiny dot below: the same ending, softened |
| ✅ `ch20-reward-believers.png` | `ch20-l03` card 5 · `ch20-l06` card 8 | لَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ | A group of worshippers seen from behind in rows at prayer, a warm light ahead of them; symbolic reward, no angels or faces |
| ✅ `ch20-who-are-they.png` | `ch20-l03` card 6 | أَجْرُهُمْ | A list of good deeds (prayer mat, charity box, open Quran) on the left, with an arrow pointing to a group seen from behind on the right |
| ✅ `ch20-owners-not-thing.png` | `ch20-l03` card 7 · `ch20-l07` card 6 | كِتَابُهُمْ / مَدْرَسَتُهُمْ · مَدْرَسَتُهُمْ / بُيُوتُكُنَّ | A book and a school building, both with the same small group-of-people tag hanging from them |
| ✅ `ch20-students-books-desk.png` | `ch20-l03` card 8 | الطُّلَّابُ فِي الْفَصْلِ، وَكُتُبُهُمْ عَلَى الْمَكْتَبِ | Boys sitting in a classroom, their books piled together on the teacher's desk at the front |
| `ch20-your-book-women.png` | `ch20-l04` card 2 | كِتَابُكُنَّ | A female teacher handing one book to a group of women students |
| ✅ `ch20-houses-two-groups.png` | `ch20-l04` card 3 | بُيُوتُكُمْ / بُيُوتُكُنَّ | Two panels: the same row of houses; left, a speaker addressing a mixed group; right, addressing a group of women |
| ✅ `ch20-recitation-home.png` | `ch20-l04` card 4 | وَاذْكُرْنَ مَا يُتْلَىٰ فِي بُيُوتِكُنَّ | An open Mushaf on a stand in a quiet family home, soft light through a window; no figures |
| ✅ `ch20-listeners-decide.png` | `ch20-l04` card 5 | بُيُوتُكُنَّ | A house with two speech bubbles in front of it, one directed at a mixed group and one at a group of women |
| ✅ `ch20-women-students-books.png` | `ch20-l04` card 6 | يَا طَالِبَاتُ، أَيْنَ كُتُبُكُنَّ؟ | A female teacher asking a group of women students where their books are; the students pointing at a shelf |
| ✅ `ch20-one-woman-group-women.png` | `ch20-l04` card 7 | كِتَابُكِ / كِتَابُكُنَّ | Two panels: left, a teacher handing a book to one woman; right, handing a book to a group of women |
| ✅ `ch20-their-book-women.png` | `ch20-l05` card 2 | كِتَابُهُنَّ | A group of women students seen from a distance, sharing one book |
| ✅ `ch20-book-owners-change.png` | `ch20-l05` card 3 | كِتَابُهُمْ / كِتَابُهُنَّ | Two panels: the same book held by a group of boys (left) and by a group of women (right) |
| `ch20-mothers-provision.png` | `ch20-l05` card 4 | وَعَلَى الْمَوْلُودِ لَهُ رِزْقُهُنَّ وَكِسْوَتُهُنَّ بِالْمَعْرُوفِ | A mother nursing a baby wrapped in a blanket beside a basket of food and folded clothes; modest, warm, face turned away |
| ✅ `ch20-mothers-first.png` | `ch20-l05` card 5 | وَالْوَالِدَاتُ … رِزْقُهُنَّ | Three mothers holding babies in modest dress, an arrow pointing from them to a basket of food and folded clothes |
| ✅ `ch20-their-houses-women.png` | `ch20-l05` card 6 | بُيُوتُهُنَّ / فِي بُيُوتِهِنَّ | A row of houses with women in modest dress standing at their doors |
| `ch20-women-students-new-books.png` | `ch20-l05` card 7 | الطَّالِبَاتُ فِي الْمَدْرَسَةِ، وَكُتُبُهُنَّ جَدِيدَةٌ | Girls in modest dress in a school courtyard holding brand-new books |
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
| `ch21-journey-start-end.png` | `ch21-l01` card 1 · `ch21-l05` card 1 | مِنْ … إِلَى … | A path drawn from a house on the left to a mosque on the right, a flag at the start and a flag at the end |
| `ch21-kharaja-leaving.png` | `ch21-l01` card 2 | خَرَجَ | A boy stepping out of the front door of a house onto the street |
| `ch21-ahmad-leaves-home.png` | `ch21-l01` card 3 | خَرَجَ أَحْمَدُ مِنَ الْبَيْتِ | Ahmad, a boy with a school bag, stepping out of his house door |
| `ch21-house-to-mosque.png` | `ch21-l01` card 4 | خَرَجَ أَحْمَدُ مِنَ الْبَيْتِ وَذَهَبَ إِلَى الْمَسْجِدِ | A boy walking along a street from his house toward a mosque, footprints behind him |
| `ch21-from-where.png` | `ch21-l01` card 5 | مِنْ أَيْنَ خَرَجَ أَحْمَدُ؟ | A question mark hovering over the house at the start of a footpath |
| `ch21-to-where.png` | `ch21-l01` card 6 | إِلَى أَيْنَ ذَهَبَ؟ | A question mark hovering over the mosque at the end of a footpath |
| `ch21-night-journey.png` | `ch21-l01` card 7 | مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى | Two mosques far apart under a starry night sky — the Kaaba's mosque on one side, the Dome of the Rock on the other — joined by a soft arc of light; no figures |
| `ch21-fatimah-school-home.png` | `ch21-l01` card 8 | خَرَجَتْ فَاطِمَةُ مِنَ الْمَدْرَسَةِ وَذَهَبَتْ إِلَى الْبَيْتِ | A girl in modest dress walking out of a school gate toward her house |
| `ch21-four-movements.png` | `ch21-l02` card 1 · `ch21-l05` card 2 | ذَهَبَ، خَرَجَ، دَخَلَ، رَجَعَ | Four panels with the same boy: walking away, stepping out of a door, stepping into a door, walking back home |
| `ch21-in-or-out.png` | `ch21-l02` card 2 · `ch21-l05` card 3 | دَخَلَ الْمَسْجِدَ / خَرَجَ مِنَ الْمَسْجِدِ | Two panels at the same mosque door: left, a man entering; right, the man leaving |
| `ch21-went-or-returned.png` | `ch21-l02` card 3 | ذَهَبَ إِلَى الْمَدْرَسَةِ / رَجَعَ إِلَى الْبَيْتِ | Two panels: left, a boy walking toward a school; right, the boy walking back into his own house |
| `ch21-destination-optional.png` | `ch21-l02` card 4 | ذَهَبَ أَحْمَدُ / ذَهَبَ أَحْمَدُ إِلَى الْمَسْجِدِ | Two panels: left, a boy walking off along a road; right, the same boy walking along the road to a mosque at its end |
| `ch21-three-movement-story.png` | `ch21-l02` card 5 | خَرَجَ أَحْمَدُ مِنَ الْبَيْتِ وَدَخَلَ الْمَسْجِدَ وَرَجَعَ إِلَى الْبَيْتِ | A three-step strip: boy leaves his house, enters a mosque, walks back home |
| `ch21-return-to-people.png` | `ch21-l02` card 6 · `ch21-l04` card 7 | فَرَجَعَ مُوسَىٰ إِلَىٰ قَوْمِهِ | A mountain path leading down to a distant tent encampment at dusk; no figures |
| `ch21-verb-then-place.png` | `ch21-l02` card 7 | مِنْ؟ إِلَى؟ | Three small tiles: an arrow leaving a box, an arrow entering a box, an arrow arriving at a box (no lettering) |
| `ch21-front-behind.png` | `ch21-l03` card 1 | أَمَامَ / خَلْفَ | Two panels: a mosque in front of a school; the same mosque behind the school |
| `ch21-between.png` | `ch21-l03` card 2 · `ch21-l03` card 3 · `ch21-l03` card 4 · `ch21-l03` card 5 | بَيْنَ · بَيْنَ الْمَدْرَسَةِ وَالسُّوقِ · الْمَسْجِدُ بَيْنَ الْمَدْرَسَةِ وَالسُّوقِ · أَيْنَ الْمَسْجِدُ؟ | A mosque standing between a school on its left and a market on its right, seen from the street |
| `ch21-clouds-between.png` | `ch21-l03` card 6 | وَالسَّحَابِ الْمُسَخَّرِ بَيْنَ السَّمَاءِ وَالْأَرْضِ | Clouds floating between a wide sky above and green earth below |
| `ch21-in-or-between.png` | `ch21-l03` card 7 | فِي الْحَقِيبَةِ / بَيْنَ الْقَلَمِ وَالدَّفْتَرِ | Two panels on a desk: a book inside a school bag; a book lying between a pen and a notebook |
| `ch21-city-story.png` | `ch21-l04` card 1 | دَخَلَ … خَرَجَ … | An ancient walled city gate in the morning; one path leading in and another leading out; no figures |
| `ch21-city.png` | `ch21-l04` card 2 | الْمَدِينَةُ | An old city with walls, houses and a busy gate, seen from a hill |
| `ch21-entered-city.png` | `ch21-l04` card 3 | وَدَخَلَ الْمَدِينَةَ عَلَىٰ حِينِ غَفْلَةٍ مِّنْ أَهْلِهَا | The open gate of an ancient city at midday, a quiet street beyond; no figures |
| `ch21-left-city.png` | `ch21-l04` card 4 · `ch21-l04` card 5 | فَخَرَجَ مِنْهَا خَائِفًا يَتَرَقَّبُ · مِنْهَا / الْمَدِينَةِ | A lone road leading away from an ancient city at dawn, the gate behind; no figures |
| `ch21-in-out-city.png` | `ch21-l04` card 6 | دَخَلَ الْمَدِينَةَ / خَرَجَ مِنْهَا | Two panels at the same city gate: arrow going in, arrow going out |
| `ch21-quran-or-practice.png` | `ch21-l04` card 8 · `ch21-l05` card 6 | فَخَرَجَ مِنْهَا / خَرَجَ أَحْمَدُ مِنَ الْبَيْتِ · فَخَرَجَ مِنْهَا / خَرَجَتْ فَاطِمَةُ | Two panels: left, an open Mushaf with a verse marker; right, a school notebook with a practice sentence written in it |
| `ch21-market-between.png` | `ch21-l05` card 4 | السُّوقُ بَيْنَ الْمَسْجِدِ وَالْمَدْرَسَةِ | A market with stalls standing between a mosque and a school |
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

### ✅ Chapters 20–23 — reused, nothing to draw (wired 2026-09-24)

| Card | Arabic | Existing picture |
|---|---|---|
| `ch20-l02` card 1 | كِتَابُكَ / كِتَابُكِ | `images/discover/ch07-two-listeners.webp` |
| `ch20-l04` card 1 | أَنْتُمْ / أَنْتُنَّ | `images/discover/ch10-you-all-facing-group.webp` |
| `ch20-l05` card 1 | هُمْ / هُنَّ | `images/discover/ch10-they-two-groups.webp` |
| `ch23-l04` card 4 | قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ | `images/discover/ch19-daybreak.webp` |

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
| `ch01-near-book-far-mosque.png` | `ch01-l02` card 2 | هَذَا وَذَٰلِكَ | Two panels from the learner's viewpoint: left, a book on the desk right in front of the viewer; right, a mosque small in the distance across open ground |
| `ch01-far-pen-far-path.png` | `ch01-l02` card 4 | ذَٰلِكَ قَبْلَ الِاسْم | Seen from a doorway: a pen lying on a table at the far end of a long room, and through the far window a path winding away into the distance |
| `ch01-muslim-prayer.png` | `ch01-l02` card 7 | مُسْلِم | A man in modest dress standing on a prayer mat, hands raised to begin the prayer, seen from behind |
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
| `ch05-li-laka-contrast.png` | `ch05-l03` card 7 | لِي / لَكَ / لَكِ |
| `ch05-lahu-laha-lakum-owners.png` | `ch05-l06` card 10 | لَهُ / لَهَا / لَكُمْ |
| `ch05-dhahaba-movement.png` | `ch05-l04` cards 5, 7 · `ch05-l07` card 1 · `ch05-l05` card 7 | ذَهَبَ الطَّالِبُ |
| `ch05-action-doer-destination.png` | `ch05-l07` cards 5, 8 · `ch05-l05` card 8 | ذَهَبَ الطَّالِبُ إِلَى الْمَدْرَسَةِ |
| `ch05-naqat-allah.png` | `ch05-l01` cards 6, 7 | نَاقَةُ اللَّهِ |
| `ch06-described-person-action.png` | `ch06-l01` card 8 | الرَّجُلُ الْكَرِيمُ + ذَهَبَ |
| `ch06-person-connected-action.png` | `ch06-l02` cards 3, 6 | الْوَلَدُ الَّذِي ذَهَبَ |
| `ch06-place-tool-panels.png` | `ch06-l03` cards 4, 6 | الْكِتَابُ الَّذِي فِي الْبَيْتِ · بِالْقَلَمِ |
| `ch06-creation-chain.png` | `ch06-l04` cards 4, 8 · `ch06-l05` card 7 | الَّذِي خَلَقَ فَسَوَّىٰ |
| `ch07-my-objects.png` | `ch07-l01` cards 1, 8 | كِتَابِي / قَلَمِي / بَيْتِي |
| `ch07-two-listeners.png` | `ch07-l02` cards 1, 2, 7 | كِتَابُكَ / كِتَابُكِ |
| `ch07-his-her-owners.png` | `ch07-l03` cards 1, 2, 7 | كِتَابُهُ / مَدْرَسَتُهَا |
| `ch07-four-people-have.png` | `ch07-l04` cards 1, 9 · `ch07-l06` card 7 | عِنْدِي / عِنْدَكَ / عِنْدَكِ / عِنْدَهُ / عِنْدَهَا |
| `ch07-classroom-questions.png` | `ch07-l06` card 8 | مَا، مَنْ، أَيْنَ / أَعِنْدَكَ قَلَمٌ؟ |
| `ch08-he-she-movement.png` | `ch08-l01` cards 4, 6 | ذَهَبَ / ذَهَبَتْ · ذَهَبَتْ فَاطِمَةُ |
| `ch08-she-returned-sat-entered.png` | `ch08-l02` cards 1, 6 | رَجَعَتْ · جَلَسَتْ · دَخَلَتْ |
| `ch08-allati-connector-panels.png` | `ch08-l03` cards 4, 8 | الْبِنْتُ الَّتِي ذَهَبَتْ · الْمَدْرَسَةُ الَّتِي فِي الْقَرْيَةِ |
| `ch08-mother-returning-home.png` | `ch08-l04` cards 6, 7 | رَجَعَتْ أُمِّي إِلَى الْبَيْتِ · أُمِّي الَّتِي رَجَعَتْ |
| `ch09-one-man-group.png` | `ch09-l01` cards 1, 3 · `ch09-l05` card 2 | مُسْلِمٌ / مُسْلِمُونَ · مُؤْمِنٌ / مُؤْمِنُونَ |
| `ch09-one-woman-group.png` | `ch09-l02` cards 2, 3 | طَالِبَةٌ / طَالِبَاتٌ · مُعَلِّمَةٌ / مُعَلِّمَاتٌ |
| `ch09-one-many-four-panels.png` | `ch09-l03` cards 1, 7 | الْجَمْعُ الْمُكَسَّر · عَائِلَاتُ الْكَلِمَات |
| `ch09-pointing-at-group.png` | `ch09-l04` cards 3, 4 | هٰؤُلَاءِ مُسْلِمُونَ · هٰؤُلَاءِ طَالِبَاتٌ |
| `ch10-they-two-groups.png` | `ch10-l01` cards 2, 5 | هُنَّ · هُمْ / هُنَّ |
| `ch10-we-group-speaking.png` | `ch10-l02` cards 2, 7 | نَحْنُ · نَحْنُ / هُمْ |
| `ch10-you-all-facing-group.png` | `ch10-l05` (file 03) cards 5, 6 | الْمُخَاطَبُونَ · هُمْ / أَنْتُمْ |
| `ch10-before-timeline.png` | `ch10-l03` (file 04) cards 4, 9 | قَبْلَ وَبَعْدَ · قَبْلَ |
| `ch10-after-timeline.png` | `ch10-l04` (file 05) cards 4, 9 | قَبْلَ / بَعْدَ · قَبْلَ وَبَعْدَ |
| `ch12-muallim-teacher.png` | `ch12-l03` card 3 | مُعَلِّمٌ |
| `ch12-muhandis-engineer.png` | `ch12-l03` card 4 | مُهَنْدِسٌ |
