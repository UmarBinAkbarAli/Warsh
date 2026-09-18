# Chapter 12 Content Proposal

## Status

Owner-authored. Implemented in the isolated staging database on 2026-09-19 and
verified on the emulator; **production promotion pending the owner's go-ahead**
(`npm run content:promote-chapter-twelve -- --apply`). See "Implementation
notes" at the end.

The current Chapter 12 fixture mirror is structurally valid and synchronized
with the database. This proposal resolves the lesson-to-reveal mismatches,
clarifies the grammar scope, adds the missing review and final test, and keeps
the existing lesson IDs and learner progress stable.

## Chapter goal

Teach a learner to handle a simple formal-Arabic introduction:

- `مَا اسْمُكَ؟` / `اسْمِي ...` — What is your name? / My name is ...
- `مِنْ أَيْنَ أَنْتَ؟` / `أَنَا مِنْ ...` — Where are you from? / I am from ...
- `مَا مِهْنَتُكَ؟` / `أَنَا ...` — What is your profession? / I am a ...
- recognition of `ذَهَبَ`, `رَجَعَ`, and one exact Quranic occurrence of `خَلَقَ`
- classroom and halaqa phrases as recognition-only spoken practice

By the end, the learner should be able to ask and answer basic identity
questions, recognize the taught masculine forms, understand the intended
feminine variants when shown, and distinguish a taught past-tense word from a
different conjugated form.

## Problems to correct

1. The chapter has five lessons but no `REVIEW` lesson or final test, despite
   the product requirement for a distinct chapter assessment.
2. Lesson 4 says it teaches past-tense vocabulary only, but assesses
   `خَلَقْنَاكُم` after teaching `خَلَقَ`; this introduces a new conjugated form
   without explaining it.
3. Lessons 1–4 reuse the same Al-Hujurat 49:13 passage, and several reveals
   highlight a valid Quran token that is not the lesson target.
4. Standard reveal blocks do not declare `highlighted_words`, so an index can
   be syntactically valid while pointing to the wrong word.
5. Names, origin, and profession practice uses masculine forms only without
   making that scope explicit or providing recognition-level feminine forms.
6. The spoken lesson contains valid but higher-scope plural agreement examples,
   and its dialogue order does not form a natural classroom exchange.
7. The spoken lesson metadata says “after Chapter 12” even though it is seeded
   as Chapter 12 Lesson 5.
8. The four standard lessons refer to `reader_lecture_12_ta'aruf.md`, but that
   source document is not present in the repository; provenance should be
   restored or the stale field removed.

## Final lesson sequence

| Display order | Stable ID | Lesson | Target | Proposed coverage |
|---:|---|---|---|---:|
| 1 | `ch12-l01` | What Is Your Name? | `مَا اسْمُكَ؟` / `اسْمِي` | 7–8 cards, 7 exercises |
| 2 | `ch12-l02` | Where Are You From? | `مِنْ أَيْنَ؟` / `أَنَا مِنْ` | 7–8 cards, 7 exercises |
| 3 | `ch12-l03` | Professions | `مَا مِهْنَتُكَ؟` / `أَنَا ...` | 8 cards, 7 exercises |
| 4 | `ch12-l04` | Past-Tense Recognition | `ذَهَبَ`, `رَجَعَ`, `خَلَقَ` | 7–8 cards, 7 exercises |
| 5 | `ch12-l05` | Classroom and Halaqa Phrases | spoken recognition | 12 phrases, 6 dialogue lines |
| 6 | `ch12-l06` | Chapter 12 Review | mixed retrieval | 10–12 exercises |
| 7 | `ch12-test` | Chapter 12 Final Test | chapter assessment | 12 questions |

Existing IDs `ch12-l01` through `ch12-l05` remain unchanged. The review and
test are new IDs only. Existing progress must remain attached to the five
existing lessons.

## Lesson specifications

### Lesson 1 — What Is Your Name?: `مَا اسْمُكَ؟`

- Keep `ch12-l01` and the existing name-question progression.
- Keep Al-Hujurat 49:13 only as a relationship/introduction theme. Expand the
  excerpt or explanation to include the purpose of knowing one another,
  `لِتَعَارَفُوا`, instead of presenting `النَّاسُ` as the vocabulary source for
  names.
- Add the exact reveal assertion:

  ```json
  "highlighted_words": ["لِتَعَارَفُوا"]
  ```

  If the excerpt is not expanded, remove the Quran highlight and label the
  passage as thematic.
- Teach the conversation clearly:
  - `مَا اسْمُكَ؟` — masculine address
  - `اسْمِي ...` — my name is ...
  - `مَا اسْمُكِ؟` — feminine address, recognition only
- Retain `مَا`, `اسْمٌ`, `اسْمُكَ`, and `اسْمِي` as the core discovery cards.
- Add a contrast exercise for `كَ` versus `كِ`, without beginning a full
  attached-pronoun paradigm.
- Keep `مَا اسْمُكَ؟` as the main production target; make `مَا اسْمُكِ؟` a
  recognition item unless the product owner wants full gendered production.

### Lesson 2 — Where Are You From?: `مِنْ أَيْنَ؟`

- Keep `ch12-l02` and the distinction between `أَيْنَ` and `مِنْ أَيْنَ`.
- Replace the current direct-reveal implication that `مِّن` in `مِنْ ذَكَرٍ`
  teaches the complete question `مِنْ أَيْنَ`. Explain it as a language bridge:
  the Quran token contributes the meaning “from,” while the everyday question
  adds `أَيْنَ`.
- Use a distinct, verified identity/origin-themed Quran excerpt where
  possible. If 49:13 remains, use a different excerpt and clearly label it
  thematic rather than repeating the same vocabulary reveal.
- Add the exact target assertion for the conversational phrase if it is used
  in a reveal:

  ```json
  "highlighted_words": ["مِنْ"]
  ```

- Teach the gender contrast at recognition level:
  - `مِنْ أَيْنَ أَنْتَ؟`
  - `مِنْ أَيْنَ أَنْتِ؟`
- Keep `أَنَا مِنْ بَاكِسْتَانَ` as the production answer, and add one neutral
  country/place substitution exercise so the learner understands the pattern.
- Exercise coverage should include `أَيْنَ` versus `مِنْ أَيْنَ`, word order,
  `أَنْتَ` versus `أَنْتِ`, and sentence building.

### Lesson 3 — Professions: `مَا مِهْنَتُكَ؟`

- Keep `ch12-l03`, `مِهْنَة`, and the profession vocabulary.
- Do not claim that `النَّاسُ` in Al-Hujurat 49:13 teaches profession words.
  Replace it with a work-themed, verified Quran hook or label the existing
  passage as thematic only and remove the misleading highlight.
- If a reveal remains, declare the actual token explicitly:

  ```json
  "highlighted_words": ["النَّاسُ"]
  ```

  This is acceptable only when the copy says it is a thematic reading target,
  not a profession vocabulary target. A better option is a work-themed verse
  with a separate target word.
- Keep the four core words:
  - `طَبِيبٌ` — doctor
  - `مُعَلِّمٌ` — teacher
  - `مُهَنْدِسٌ` — engineer
  - `تَاجِرٌ` — merchant
- Add recognition-level feminine forms: `طَبِيبَةٌ`, `مُعَلِّمَةٌ`,
  `مُهَنْدِسَةٌ`, and `تَاجِرَةٌ`. Do not require full feminine production
  unless the lesson is expanded accordingly.
- Add `مَا مِهْنَتُكِ؟` as a recognition contrast to `مَا مِهْنَتُكَ؟`.
- Retain the conversation builder, but ensure the answer is tested as a
  complete sentence, for example `أَنَا طَبِيبٌ`.

### Lesson 4 — Past-Tense Recognition: `ذَهَبَ`, `رَجَعَ`, `خَلَقَ`

- Keep `ch12-l04` and the recognition-only scope.
- Replace the current reveal target `خَلَقْنَاكُم` with a verified Quran
  excerpt containing the exact taught form `خَلَقَ`, such as a checked excerpt
  containing `خَلَقَ الْإِنسَانَ`.
- Declare the target explicitly:

  ```json
  "highlighted_words": ["خَلَقَ"]
  ```

- Keep `ذَهَبَ`, `رَجَعَ`, and `خَلَقَ` as whole-word vocabulary. Do not assess
  subject/person changes, attached object pronouns, or full conjugation.
- Remove the fill-in answer `خَلَقْنَاكُم` from this lesson unless a separate
  discovery card teaches the bridge:

  ```text
  خَلَقَ — He created
  خَلَقْنَاكُمْ — We created you; a different conjugated form
  ```

  The preferred scope is to remove that bridge and keep the lesson recognition
  only.
- Replace the current `ذَهَبَ وَرَجَعَ` build item with a meaningful sentence
  or keep it as a phrase-order recognition item; do not imply that the learner
  has learned past-tense conjugation generally.

### Lesson 5 — Classroom and Halaqa Phrases

- Keep `ch12-l05` as a spoken extension and preserve its verified media.
- Rename the metadata to “Chapter 12 Lesson 5 — Classroom and Halaqa Phrases.”
  If it is intended as optional content, mark that explicitly in the lesson
  metadata and product copy instead of saying “after Chapter 12.”
- State at the start: “These are recognition and listening phrases. This
  lesson does not assess plural agreement or verb conjugation.”
- Keep the valid phrases, including `هَذِهِ كُتُبٌ جَدِيدَةٌ` and
  `الطُّلَّابُ حَاضِرُونَ`, but do not introduce them as new grammar rules.
- Reorder the dialogue into a natural classroom sequence:
  1. `اِفْتَحُوا الْكُتُبَ`
  2. `اِقْرَؤُوا الدَّرْسَ`
  3. `هَلْ عِنْدَكُمْ أَسْئِلَةٌ؟`
  4. `لَوْ سَمَحْتَ يَا أُسْتَاذُ`
  5. `نَعَمْ، عِنْدَنَا سُؤَالٌ`
  6. `جَزَاكَ اللهُ خَيْرًا يَا أُسْتَاذُ`
- Keep the masculine dialogue as the audio target, but add a short note that
  feminine forms are not being assessed in this extension. Add variants only
  if the audio and answer model are prepared for them.

## Lesson 6 — Chapter review

- New stable ID: `ch12-l06`.
- Template: `REVIEW`.
- Introduce no new vocabulary or grammar.
- Review:
  - `مَا`, `اسْمُكَ`, `اسْمِي`
  - `أَيْنَ` versus `مِنْ أَيْنَ`
  - `أَنَا مِنْ ...`
  - `مَا مِهْنَتُكَ؟` and profession answers
  - `ذَهَبَ`, `رَجَعَ`, `خَلَقَ` as recognition-only vocabulary
  - the classroom phrases as listening recognition
- Include mixed retrieval, not isolated translation only:
  - choose the correct response to `مَا اسْمُكَ؟`;
  - distinguish `أَيْنَ` from `مِنْ أَيْنَ`;
  - choose a profession answer;
  - identify the exact taught past-tense form in a Quranic phrase;
  - order a short introduction dialogue;
  - listen and identify one classroom phrase.

## Lesson 7 — Chapter final test

- New stable ID: `ch12-test`.
- Template: `REVIEW` with `assessment.type = "CHAPTER_TEST"`.
- Twelve server-validated questions.
- Pass threshold: 80% — 10 of 12 correct.
- Proposed coverage:

  1. Interpret `مَا` in `مَا اسْمُكَ؟`.
  2. Select the correct answer to `مَا اسْمُكَ؟`.
  3. Distinguish `اسْمُكَ` from `اسْمِي`.
  4. Distinguish `أَيْنَ` from `مِنْ أَيْنَ`.
  5. Build or identify `أَنَا مِنْ بَاكِسْتَانَ`.
  6. Recognize `مِنْ أَيْنَ أَنْتِ؟` as the feminine-address form.
  7. Interpret `مَا مِهْنَتُكَ؟`.
  8. Select a correct profession response.
  9. Recognize one feminine profession form.
  10. Match `ذَهَبَ`, `رَجَعَ`, and `خَلَقَ` to their meanings.
  11. Identify exact `خَلَقَ` rather than `خَلَقْنَاكُمْ`.
  12. Identify one taught classroom phrase from audio or text.

- Exclude full past-tense conjugation, case terminology, and any feminine
  production task not taught in the revised lessons.
- Verify that retries do not duplicate XP, completion, or chapter-unlock
  rewards.

## Highlight and Quran validation

Every standard Chapter 12 reveal must include `highlighted_words` alongside
`highlighted_word_indices`. Expected targets should be explicit:

| Lesson | Expected reveal target |
|---|---|
| `ch12-l01` | `لِتَعَارَفُوا`, or no direct target if the passage is thematic |
| `ch12-l02` | `مِنْ`, or a distinct verified origin-related target |
| `ch12-l03` | a declared thematic/work-related token |
| `ch12-l04` | `خَلَقَ` |

The Quran audit must verify the final Arabic text, reference, token index, and
translation after every excerpt change. Canonicalize equivalent Unicode forms
across the chapter rather than maintaining multiple copies of 49:13 with
different diacritic encodings.

## Source metadata

Before implementation, resolve `reader_lecture_12_ta'aruf.md` by doing one of
the following:

1. restore the source document under the expected path;
2. replace the field with the actual source identifier; or
3. remove the stale repository path and record the provenance in the approved
   content-review record.

Do not invent a source file merely to make the metadata pass validation.

## Media and audio requirements

- Preserve the currently verified Chapter 12 audio and images unless Arabic
  learner-facing text changes.
- Any changed Quran excerpt requires the correct human recitation and verified
  public media URL.
- Any changed phrase with a play button must be included in the audio catalog.
- New spoken variants require separate audio and answer handling; do not add
  them as silent text-only choices.

## Implementation constraints

- Update canonical fixtures first; do not edit production lesson JSON directly.
- Preserve `ch12-l01` through `ch12-l05` and existing exercise IDs where
  possible.
- Add only `ch12-l06` and `ch12-test` as new lesson IDs.
- Update `seed.cjs` only after fixture approval and validation.
- Do not run the full production seed. Use the scoped content sync/promotion
  path that preserves learner progress.
- Do not modify Chapters 1–11, navigation, unlocking rules, or unrelated
  working-tree changes.

## Validation and acceptance gates

1. Approve this proposal before implementation.
2. Update the five canonical Chapter 12 fixtures and add the review/test
   fixtures.
3. Update the seed assembly without changing the existing lesson IDs.
4. Run from `warsh-backend`:

   ```powershell
   npm run db:validate-fixtures
   npm run quran:audit-fixtures
   npm run db:audit-urdu
   npm run media:check-fixtures
   npm run content:check
   ```

5. Refresh the isolated local staging database only.
6. Complete Chapter 12 in English and Urdu on the debug emulator, checking:
   - Quran text, translation, audio, and reveal position;
   - masculine and recognition-level feminine forms;
   - every exercise answer and wrong-answer explanation;
   - spoken phrase audio and dialogue order;
   - review completion and final-test grading;
   - retry behavior and Chapter 13 unlock;
   - no duplicate XP or progress records.
7. Obtain explicit product-owner approval before production promotion.
8. If production already contains Chapter 12 progress, add only the new review
   and test rows after approval; do not rewrite existing progress rows.

## Definition of done

Chapter 12 has seven items: five corrected lessons, one mixed review, and one
12-question final test. Every assessed form is taught before assessment;
Quran reveals point to declared targets or are clearly labeled thematic;
gender scope is explicit; spoken phrases are sequenced naturally; media and
Urdu rendering are verified; English and Urdu emulator completion passes;
existing learner progress is preserved; and no production change occurs before
explicit approval.

## Implementation notes (2026-09-19)

- `ch12-l01..l04` rewritten in place (8 cards / 7 exercises each, Lesson 2 has
  8 exercises so the place-substitution item fits), keeping their IDs and
  display orders; existing exercise IDs `ex01..ex06` are kept in every lesson
  and `ex07` (and `ex08` in Lesson 2) are new. `ch12-l05` keeps its twelve
  phrases and their R2 audio untouched; only the metadata (title "Classroom and
  Halaqa Phrases", no "after Chapter 12"), the scope statement in the intro and
  scene, the phrase contexts and the dialogue order changed. `ch12-l06`
  (review, 8 cards / 10 exercises) and `ch12-test` (12 MC, 80 %) are new.
- Quran checkpoints, all verified by `quran:audit-fixtures`:
  Lesson 1 keeps Al-Hujurat 49:13 but excerpts
  `وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا` with `highlighted_words`
  `["لِتَعَارَفُوا"]` (index 3); Lesson 2 moves to Abasa 80:18
  `مِنْ أَيِّ شَيْءٍ خَلَقَهُ`, an origin question whose first word is the target
  `مِنْ` (index 0), presented as the "from" bridge the proposal asks for;
  Lesson 3 moves to At-Tawbah 9:105 `وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ`
  with the declared work-themed target `عَمَلَكُمْ` (index 4), whose noun +
  attached-pronoun shape mirrors `مِهْنَتُكَ`; Lesson 4 moves to Al-Alaq 96:2
  `خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ` with the exact form `خَلَقَ` (index 0). The
  review and test hook on the Lesson 1 excerpt. Recitation is the existing
  EveryAyah Alafasy file for each full ayah.
- Lesson 4 takes the proposal's card option rather than the "remove the bridge"
  option: one CONTRAST card shows `خَلَقَ` beside `خَلَقْنَاكُمْ` as "a different
  conjugated form, recognition only", because the chapter goal and test
  question 11 both require the learner to tell the taught form from a longer
  one. The `خَلَقْنَاكُم` fill-in is gone (now `___ إِلَى الْمَسْجِدِ`), and
  `ذَهَبَ وَرَجَعَ` became the meaningful `رَجَعَ بَعْدَ الدَّرْسِ` (بَعْدَ from
  Chapter 10).
- Feminine forms are recognition-level only: `مَا اسْمُكِ؟` (Lesson 1 card +
  true/false), `أَنْتَ / أَنْتِ` (Lesson 2 card + tap-translation),
  `طَبِيبَةٌ …` and `مَا مِهْنَتُكِ؟` (Lesson 3 card, true/false,
  tap-translation). No feminine production task anywhere, including the test.
- The stale `source: reader_lecture_12_ta'aruf.md` field was removed from the
  four standard lessons (option 3); provenance is recorded in each `_note`.
  The chapter-level `sourceFile` in `curriculum-book1.cjs` is untouched, as for
  Chapter 11.
- Player fix shipped alongside: `CONVERSATION_BUILDER` had never been
  implemented for the schema-v1.0 shape (`prompt_line` / `options` /
  `correct_option_index`) — the app read only a legacy `conversation` field, so
  the exercise rendered blank with no options and the learner could not
  proceed. This was already live in production Chapter 12 Lesson 3 (`ex06`)
  and in Chapters 22, 60, 61, 71 and 72. `play.tsx` now shows the opening line
  as the Arabic prompt with audio and the reply lines as an Arabic option grid
  (BUILD mode routes to the tile builder); `lib/audioTargets.ts` counts the
  opening line as a catalogue clip. The fix ships with the next Android
  release and the web export.
- Images: `ism`, `min`, `ayna`, `dhahaba`, `rajaa`, `masjid`, `dars` reused
  from the discover set; `tabib` (doctor's bag) and `tajir` copied from the
  dictionary word images as 768px WebP. The dictionary asset filed under
  `مُعَلِّم` is a shop-counter scene, so it serves `تَاجِرٌ` here and the
  `مُعَلِّم` / `مُهَنْدِس` cards have no image (listed in
  `lesson-illustrations-needed.md`); the `تَاجِر` and `خَلَقَ` dictionary assets
  are calligraphy badges and were not used.
- 16 new catalogue audio clips generated against the staging database with
  `--key=` selection (the staging seed re-creates vocabulary rows with new ids,
  so a full `--from-db` run there would orphan word audio in R2).
- Seed rows, chapter spec (`titleUr`, description, hook at لِتَعَارَفُوا, five
  focuses) and `content:promote-chapter-twelve` mirror Chapter 11. Backfill
  after promotion:
  `content:backfill-new-lessons -- --lesson-ids ch12-l06,ch12-test --apply`.
