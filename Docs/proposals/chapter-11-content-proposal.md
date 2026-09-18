# Chapter 11 Content Proposal

## Status

Owner-authored. Implemented in the isolated staging database on 2026-09-19 and
verified on the emulator; **promoted to production 2026-09-19** with
`npm run content:promote-chapter-eleven -- --apply` on the owner's go-ahead. See
"Implementation notes" at the end.

The current Chapter 11 fixture mirror is structurally valid and synchronized
with the database. This proposal corrects the content problems found in the
audit while preserving the existing lesson IDs and learner progress.

## Chapter goal

Teach family vocabulary and attached-pronoun recognition through a short,
Quran-connected progression:

- `أَبِي` / `أُمِّي` — my father / my mother
- `أَبٌ` / `أُمٌّ` / `أَخٌ` / `أُخْتٌ` — core family words
- `فِيهِ` — in it, referring to a masculine noun
- `فِيهَا` — in it, referring to a feminine noun
- `بُيُوتِكُمْ` — your homes: broken plural plus attached plural pronoun

By the end, a learner should be able to recognize these forms in Quranic
phrases, identify the noun an attached pronoun refers to, and distinguish
`فِيهِ` from `فِيهَا` in simple sentences.

## Current problems to correct

1. Lesson 4 teaches `فِيهَا` but its Quran reveal highlights `لَيْلَةُ` from
   Al-Qadr 97:3; the target word does not appear in that ayah.
2. Lesson 1's grammar exercise marks `الْبَيْتِ` as `POSSESSIVE`, although the
   possessive `ي` is inside `أَبِي`; the sentence role is the predicate or noun
   complement.
3. Lesson 1 and Lesson 5 reuse An-Nahl 16:80, while Lesson 1 highlights
   `بُيُوتِكُمْ` before that form is taught directly.
4. Lesson 2 highlights `إِخْوَةٌ` without teaching that it is the broken plural
   encountered with `أَخٌ`.
5. The chapter has five standard lessons but no review lesson or final test.
6. Lesson 5's Urdu matching choices render both “house” and “houses” as
   `گھر`, producing duplicate answer choices for Urdu learners.
7. The reveal blocks do not provide `highlighted_words`, so a valid index can
   still point to the wrong Arabic token without a semantic fixture check.

## Final lesson sequence

| Display order | Stable ID | Lesson | Target | Proposed coverage |
|---:|---|---|---|---:|
| 1 | `ch11-l01` | My Father and My Mother | `أَبِي` / `أُمِّي` | 8 cards, 7 exercises |
| 2 | `ch11-l02` | Family Vocabulary | family nouns and `إِخْوَةٌ` | 8 cards, 7 exercises |
| 3 | `ch11-l03` | In It — Masculine | `فِيهِ` | 8 cards, 7 exercises |
| 4 | `ch11-l04` | In It — Feminine | `فِيهَا` | 8 cards, 7 exercises |
| 5 | `ch11-l05` | Home in the Quran | `بُيُوتِكُمْ` | 8 cards, 7 exercises |
| 6 | `ch11-l06` | Chapter 11 Review | mixed retrieval | 8 cards, 10 exercises |
| 7 | `ch11-test` | Chapter 11 Final Test | chapter assessment | 12 questions |

Existing IDs `ch11-l01` through `ch11-l05` remain unchanged. The review and
test are new IDs only. Existing progress must remain attached to the five
existing lessons.

## Lesson specifications

### Lesson 1 — My Father and My Mother: `أَبِي` / `أُمِّي`

- Keep `ch11-l01`.
- Replace the current indirect An-Nahl 16:80 reveal with a Quran checkpoint
  containing `أَبِي`: Al-Qasas 28:25, excerpt `إِنَّ أَبِي يَدْعُوكَ`.
- Highlight the actual `أَبِي` token and add:

  ```json
  "highlighted_words": ["أَبِي"]
  ```

- Teach the parallel forms carefully:
  - `أَبٌ` → `أَبِي`
  - `أُمٌّ` → `أُمِّي`
  - the attached `ي` expresses “my” in these examples
- Keep the everyday sentence examples `أَبِي فِي الْبَيْتِ` and
  `أُمِّي فِي الْمَطْبَخِ`.
- Correct the grammar exercise answer to:

  ```json
  "correct_roles": ["SUBJECT", "PREPOSITION", "PREDICATE"]
  ```

- Exercise coverage: translation of both target words, possessive-form
  selection, fill-in-the-blank, sentence building, grammar parsing, and Quran
  recognition.
- Do not introduce `كُمْ` or `بُيُوتِكُمْ` as a taught target in this lesson.

### Lesson 2 — Family Vocabulary

- Keep `ch11-l02` and the Al-Hujurat 49:10 hook.
- Keep the Quran target `إِخْوَةٌ`, but add a discovery card explaining:

  ```text
  أَخٌ → إِخْوَةٌ
  brother → brothers; an encountered broken plural
  ```

- Teach and compare:
  - `أَبٌ` — father
  - `أُمٌّ` — mother
  - `أَخٌ` — brother
  - `أُخْتٌ` — sister
  - `أَخِي` / `أُخْتِي` as recognition links to Lesson 1's possessive pattern
- Add an exercise that distinguishes singular `أَخٌ` from Quranic plural
  `إِخْوَةٌ`.
- Add a sister possessive retrieval item for `أُخْتِي`; it should not be
  presented as a new full paradigm.
- Add:

  ```json
  "highlighted_words": ["إِخْوَةٌ"]
  ```

- Keep the Quran explanation focused on reading and vocabulary; do not claim
  that the ayah itself teaches all four family words.

### Lesson 3 — In It, Masculine: `فِيهِ`

- Keep `ch11-l03` and Al-Baqarah 2:2.
- Add:

  ```json
  "highlighted_words": ["فِيهِ"]
  ```

- Teach the construction `فِي + هِ → فِيهِ` and make the masculine antecedent
  explicit through `الْكِتَابُ` and `الدُّرْجِ`.
- Retain the contextual sequence about the pen and drawer, but make the
  English and Urdu copy state what “it” refers to rather than relying on an
  isolated `هُوَ فِيهِ` translation.
- Exercise coverage: meaning, masculine antecedent recognition, fill-in,
  sentence building, grammar parsing, Quran recognition, and one short
  context-choice item.

### Lesson 4 — In It, Feminine: `فِيهَا`

- Keep `ch11-l04`.
- Replace Al-Qadr 97:3 as the hook/reveal. Use a verified Quran excerpt that
  contains the actual target and an explicit feminine antecedent, preferably
  Al-Baqarah 2:30 around `الْأَرْضِ ... أَتَجْعَلُ فِيهَا`.
- Highlight only the actual `فِيهَا` token and add its semantic assertion:

  ```json
  "highlighted_words": ["فِيهَا"]
  ```

- Keep the bag example, but explicitly contrast:
  - `الدُّرْجِ` → `فِيهِ`
  - `الْحَقِيبَةِ` → `فِيهَا`
- Add a direct mixed exercise where the learner chooses between `فِيهِ` and
  `فِيهَا` from the antecedent, not only from English labels.
- Use clearer Urdu labels such as `اس میں (مذکر)` and `اس میں (مؤنث)` where the
  choice needs grammatical disambiguation.

### Lesson 5 — Home in the Quran: `بُيُوتِكُمْ`

- Keep `ch11-l05` and An-Nahl 16:80.
- Add:

  ```json
  "highlighted_words": ["بُيُوتِكُمْ"]
  ```

- Teach the sequence explicitly:
  - `بَيْتٌ` — a house
  - `بُيُوتٌ` — houses, broken plural
  - `كُمْ` — your, when addressing a group
  - `بُيُوتِكُمْ` — your homes
  - `فِي بُيُوتِكُمْ` — in your homes
- Replace the English concept label “Your plural” with “Your — addressing a
  group.”
- Make the Urdu matching choices distinct:
  - house → `ایک گھر`
  - houses → `گھر (جمع)` or `مکانات`
  - your, addressing a group → `تمہارا/تمہارے — جمع سے خطاب`
  - your homes → `تمہارے گھر`
- Add one retrieval item connecting this lesson to the earlier `فِيهِ` and
  `فِيهَا` lessons, without adding a new grammar rule.

## Lesson 6 — Chapter review

- New stable ID: `ch11-l06`.
- Template: `REVIEW`.
- No new grammar.
- Review:
  - `أَبِي`, `أُمِّي`, `أَخِي`, `أُخْتِي`
  - `أَبٌ`, `أُمٌّ`, `أَخٌ`, `أُخْتٌ`, `إِخْوَةٌ`
  - `فِيهِ` versus `فِيهَا`
  - `بَيْتٌ` → `بُيُوتٌ` → `بُيُوتِكُمْ`
- Include mixed context exercises, not isolated translation only:
  - choose the correct attached pronoun from the antecedent;
  - distinguish singular and broken plural forms;
  - identify the Quran target word;
  - build `أَبِي فِي الْبَيْتِ`, `هُوَ فِيهِ`, and `هُوَ فِيهَا` with context;
  - parse `فِي بُيُوتِكُمْ`.
- The review close should state that the final test checks these existing
  skills; it must not promise new content.

## Lesson 7 — Chapter final test

- New stable ID: `ch11-test`.
- Template: `REVIEW` with `assessment.type = "CHAPTER_TEST"`.
- Twelve server-validated questions.
- Pass threshold: 80% — 10 of 12 correct.
- Proposed coverage:

  1. Translate `أَبِي`.
  2. Translate `أُمِّي`.
  3. Select the correct possessive form for “my brother.”
  4. Match `أَبٌ`, `أُمٌّ`, `أَخٌ`, and `أُخْتٌ`.
  5. Recognize `إِخْوَةٌ` as the Quranic plural encountered with `أَخٌ`.
  6. Build or identify `أَبِي فِي الْبَيْتِ`.
  7. Identify `فِيهِ` after a masculine antecedent.
  8. Identify `فِيهَا` after a feminine antecedent.
  9. Choose between `فِيهِ` and `فِيهَا` in a mixed context.
  10. Recognize `بَيْتٌ` versus `بُيُوتٌ`.
  11. Interpret `كُمْ` in `بُيُوتِكُمْ`.
  12. Locate one taught target in a Quranic phrase.

- Exclude advanced case terminology, full pronoun paradigms, and any form not
  taught in the five standard lessons or review.
- Verify the question payload renders before test start and that retries do
  not duplicate XP or completion rewards.

## Highlight validation requirement

Every Chapter 11 `reveal` must include `highlighted_words` alongside
`highlighted_word_indices`. The semantic validator should normalize both sides
and fail when the selected token does not match the declared word. Expected
targets after this proposal:

| Lesson | Highlighted target |
|---|---|
| `ch11-l01` | `أَبِي` |
| `ch11-l02` | `إِخْوَةٌ` |
| `ch11-l03` | `فِيهِ` |
| `ch11-l04` | `فِيهَا` |
| `ch11-l05` | `بُيُوتِكُمْ` |

## Media and audio requirements

- Quran recitation remains human-recorded; do not use TTS for ayahs.
- Keep the verified audio for Al-Hujurat 49:10, Al-Baqarah 2:2, and
  An-Nahl 16:80 where those references remain.
- Add and verify the recitation for Al-Qasas 28:25 and the selected
  `فِيهَا` ayah.
- Any changed learner-facing Arabic phrase that exposes a play button must be
  included in the audio catalog and verified after staging refresh.
- Images are not required for every card, but any new illustration must be
  text-free, 768px WebP, and checked through the public media URL.

## Implementation constraints

- Update the canonical fixtures, not production database JSON directly.
- Preserve `ch11-l01` through `ch11-l05` and all existing exercise IDs where
  possible.
- Add only `ch11-l06` and `ch11-test` as new lesson IDs.
- Update `seed.cjs` only after the fixture content is approved and validated.
- Do not run the full production seed. Use the scoped content sync/promotion
  path that preserves learner progress.
- Do not modify Chapters 1–10, navigation, unlocking rules, or unrelated
  working-tree changes.

## Validation and acceptance gates

1. Review and approve this proposal before implementation.
2. Update the canonical fixtures and seed assembly.
3. Run from `warsh-backend`:

   ```powershell
   npm run db:validate-fixtures
   npm run quran:audit-fixtures
   npm run db:audit-urdu
   npm run media:check-fixtures
   npm run content:check
   ```

4. Refresh the isolated local staging database only.
5. Open Chapter 11 in the debug emulator through the local backend.
6. Complete all seven items in English and Urdu, checking:
   - Quran text, translation, audio, and highlight position;
   - discovery cards and directionality;
   - every exercise answer and wrong-answer explanation;
   - review completion and final-test grading;
   - retry behavior and Chapter 12 unlock;
   - no duplicate XP or progress records.
7. Run the audio catalog audit for the refreshed staging database.
8. Obtain explicit product-owner approval before any production promotion.
9. If production already contains Chapter 11 progress, backfill only the new
   review/test rows for eligible accounts after approval; do not rewrite the
   five existing progress rows.

## Definition of done

Chapter 11 has a seven-item sequence with five corrected lessons, one mixed
review, and one 12-question final test. Every target is taught before it is
assessed; Quran highlights point to the declared target words; Urdu choices are
unambiguous; media is verified; English and Urdu emulator completion passes;
the final test controls Chapter 11 completion; existing learner progress is
preserved; and no production change occurs before explicit approval.

## Implementation notes (2026-09-19)

- `ch11-l01..l05` rewritten in place (8 cards / 7 exercises each), keeping
  their IDs and display orders; `ch11-l06` (review, 8 cards / 10 exercises)
  and `ch11-test` (12 MC, 80 %) added. Existing exercise IDs `ex01..ex05` are
  kept in every lesson; `ex06`/`ex07` are new. Lesson 2's `ex05` stays a
  `TRUE_FALSE` but now checks إِخْوَةٌ as the plural of أَخٌ; its `ex06` is the
  Quran-recognition item that also separates singular from plural.
- Lesson 1 hook/reveal: Al-Qasas 28:25, excerpt `إِنَّ أَبِي يَدْعُوكَ`,
  highlight index 1. Lesson 4 hook/reveal: Al-Baqarah 2:30, excerpt
  `إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً قَالُوا أَتَجْعَلُ فِيهَا`, highlight
  index 7, so the feminine antecedent الْأَرْضِ is on screen with فِيهَا. Both
  pass `quran:audit-fixtures`; recitation is the existing EveryAyah Alafasy
  file for each full ayah.
- Every reveal declares `highlighted_words` (validated by
  `db:validate-fixtures`).
- Drawer is spelled الدُّرْجِ (durj) throughout, as in the proposal; the old
  fixtures had الدَّرْجِ.
- Chapter title unchanged ("The Home and Family"); description and Urdu
  metadata updated in `curriculum-book1.cjs` and the promote script.
- Images: `ab`, `umm`, `bayt`, `kitab`, `qalam`, `fi`, `qawm` reused from the
  discover set; `akh`, `ukht`, `matbakh`, `ard`, `aila` copied from the
  dictionary word images as 768px WebP (`images/discover/*.webp`). The
  dictionary إِخْوَة asset is a calligraphy badge and was not used. No new
  composite scenes are required.
- 19 new catalogue audio clips generated (R2 3778/3778).
- Seed rows and `content:promote-chapter-eleven` mirror Chapter 10. Backfill
  after promotion: `content:backfill-new-lessons -- --lesson-ids ch11-l06,ch11-test --apply`.

