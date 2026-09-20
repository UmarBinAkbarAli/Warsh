# Chapter 13 Content Proposal

## Status

Owner-authored. Implemented in the isolated staging database, verified on the
emulator and through the API, and **promoted to production on 2026-09-20** on
the owner's instruction to implement and promote without waiting
(`npm run content:promote-chapter-thirteen -- --apply`). See "Implementation
notes" at the end.

The current Chapter 13 fixtures are structurally valid and synchronized with
the database, but the chapter should not be implemented as a simple correction
of its current four lessons. Lessons 1–3 repeat Chapter 9, and Lesson 4 teaches
material assigned to Chapter 14. This proposal gives Chapter 13 a distinct role
while preserving its four existing lesson IDs and learner progress.

## Decision proposed

Rename the chapter from **Plural Forms — An Introduction** to **Reading Plurals
in the Quran**.

Chapter 9 remains the introduction to the three plural families. Chapter 13
becomes the application chapter: learners recognize those families in new
Quranic forms and short sentences, including the encountered `ـِينَ` form of
the sound masculine plural. Chapter 14 remains responsible for adjective
agreement with human and non-human plurals.

## Chapter goal

By the end of Chapter 13, a learner should be able to:

- classify an encountered word as sound masculine, sound feminine, or broken
  plural;
- recognize both `ـُونَ` and `ـِينَ` as forms encountered in the sound
  masculine plural family, without learning full case grammar yet;
- recognize the sound feminine plural through `ـَات` in Quranic context;
- connect common broken plurals to their singular forms;
- read short Quranic excerpts and identify the plural target correctly; and
- avoid applying Chapter 14's adjective-agreement rules before they are taught.

## Current problems to correct

1. Chapter 9 already teaches sound masculine, sound feminine, and broken
   plurals, then assesses them through a review and final test. Chapter 13
   currently repeats those same first three lessons with less depth.
2. Chapter 13 Lesson 4 teaches non-human plural adjective agreement. Chapter 14
   is explicitly dedicated to plural adjective agreement and repeats the same
   rule and examples.
3. All four current lessons reuse Al-Kafirun 109:1, even when its target
   `الْكَافِرُونَ` does not demonstrate the lesson's plural family.
4. Lesson 3 sets `highlighted_word_indices` to `[4]` for a four-token ayah, so
   the learner sees no highlighted word in the reveal.
5. All four reveals omit `highlighted_words`, allowing an incorrect or
   out-of-range index to escape semantic validation.
6. Lesson 2 gives identical transliterations to singular and plural forms,
   hiding the long `aa` in forms such as `مُؤْمِنَاتٌ`.
7. Lesson 3 introduces `ثَلَاثَةُ كُتُبٍ`, which adds number construction and
   case marking without teaching either topic.
8. Some Urdu plural labels are ambiguous, especially `طُلَّابٌ` rendered as
   `طالب علم` rather than an explicitly plural form such as `طلبہ`.
9. The chapter has no mixed review or final chapter test.
10. The metadata refers to `reader_lecture_13_jama_introduction.md`, which is
    not present in the repository.

## Final lesson sequence

| Display order | Stable ID | Proposed lesson | Main target | Coverage |
|---:|---|---|---|---:|
| 1 | `ch13-l01` | Sound Masculine Plurals in Quranic Context | `ـُونَ` and recognition-only `ـِينَ` | 8 cards, 7 exercises |
| 2 | `ch13-l02` | Sound Feminine Plurals in Quranic Context | `ـَات` | 8 cards, 7 exercises |
| 3 | `ch13-l03` | Broken Plurals in the Quran | singular–plural word families | 9 cards, 7 exercises |
| 4 | `ch13-l04` | Plural Reading Lab | mixed classification and reading | 8 cards, 8 exercises |
| 5 | `ch13-l05` | Chapter 13 Review | mixed retrieval | 8 cards, 10 exercises |
| 6 | `ch13-test` | Chapter 13 Final Test | chapter assessment | 12 questions |

Existing IDs `ch13-l01` through `ch13-l04` remain unchanged. Only `ch13-l05`
and `ch13-test` are new IDs. Existing completion records for the first four
lessons must not be rewritten.

## Scope boundaries

Chapter 13 may teach recognition and classification, but it must not teach:

- nominative, accusative, or genitive terminology;
- rules governing when `ـُونَ` changes to `ـِينَ`;
- number agreement or the grammar of three through ten;
- adjective agreement with human plurals;
- feminine-singular adjective treatment of non-human plurals; or
- complete plural-generation rules for unfamiliar nouns.

Those topics belong to later grammar chapters. Chapter 13 can say that a form
is “another shape encountered in Quranic sentences” without explaining case.

## Lesson specifications

### Lesson 1 — Sound Masculine Plurals in Quranic Context

- Keep stable ID `ch13-l01`.
- Keep Al-Kafirun 109:1 and use `الْكَافِرُونَ` as the direct reveal target.
- Add the semantic highlight declaration:

  ```json
  "highlighted_word_indices": [3],
  "highlighted_words": ["الْكَافِرُونَ"]
  ```

- Begin with a short Chapter 9 bridge rather than reteaching the construction:

  ```text
  You already know that ـُونَ can mark a sound masculine plural. Now you will
  recognize this family in Quranic sentences and meet its ـِينَ form.
  ```

- Teach these recognition pairs:
  - `كَافِرٌ → كَافِرُونَ`
  - `مُؤْمِنٌ → مُؤْمِنُونَ`
  - `مُتَّقٍ → مُتَّقِينَ` as an encountered Quranic form
- Explicitly state that `ـُونَ` and `ـِينَ` belong to the same plural family,
  while the reason for the ending change comes later.
- Do not say that every masculine noun forms its plural by adding `ـُونَ`.
- Exercise coverage:
  - identify the plural target in Al-Kafirun 109:1;
  - distinguish singular from plural;
  - classify `مُؤْمِنُونَ` and `مُتَّقِينَ` in the same family;
  - build one short already-supported nominal sentence;
  - reject a broken plural distractor; and
  - match the Quranic form to its meaning.

### Lesson 2 — Sound Feminine Plurals in Quranic Context

- Keep stable ID `ch13-l02`.
- Replace Al-Kafirun 109:1 with a verified excerpt from Al-Ahzab 33:35 that
  directly contains `الْمُسْلِمَاتِ` and `الْمُؤْمِنَاتِ`.
- Highlight only the selected direct target and declare the expected word. For
  example, if `الْمُؤْمِنَاتِ` is selected:

  ```json
  "highlighted_words": ["الْمُؤْمِنَاتِ"]
  ```

  The final index must be generated from the exact approved Quran text rather
  than copied manually.
- Frame `ة → ات` as a useful recognition pattern, not a universal production
  rule for every feminine noun.
- Teach and compare:
  - `مُؤْمِنَةٌ → مُؤْمِنَاتٌ`
  - `مُسْلِمَةٌ → مُسْلِمَاتٌ`
  - `طَالِبَةٌ → طَالِبَاتٌ`
  - Quranic `الْمُؤْمِنَاتِ` as the same plural family in context
- Correct transliterations throughout:
  - `mu'minatun → mu'minaatun`
  - `muslimatun → muslimaatun`
  - `taalibatun → taalibaatun`
  - use the appropriate ending for the exact definite Quranic form
- Exercise coverage:
  - singular versus plural recognition;
  - sound masculine versus sound feminine classification;
  - direct Quran target recognition;
  - one matching task with unambiguous English and Urdu labels;
  - one sentence-reading task; and
  - one form-selection task that does not require case terminology.

### Lesson 3 — Broken Plurals in the Quran

- Keep stable ID `ch13-l03`.
- Replace Al-Kafirun 109:1 with An-Nas 114:5, using the excerpt
  `فِي صُدُورِ النَّاسِ` and highlighting `صُدُورِ`.
- Add semantic highlight validation against the exact approved token.
- Retain these useful word families:
  - `صَدْرٌ → صُدُورٌ`
  - `كِتَابٌ → كُتُبٌ`
  - `بَيْتٌ → بُيُوتٌ`
  - `وَلَدٌ → أَوْلَادٌ`
  - `طَالِبٌ → طُلَّابٌ`
- Present the pairs as vocabulary that must be learned together. Do not imply
  that the learner can reliably generate every broken plural from a pattern.
- Replace `عِنْدِي ثَلَاثَةُ كُتُبٍ` with a task that assesses only the taught
  plural distinction, such as selecting `كُتُبٌ` for “books” or identifying
  the plural in a short familiar sentence.
- Use unambiguous Urdu plurals:
  - `طُلَّابٌ` → `طلبہ`
  - `بُيُوتٌ` → `گھر — جمع` when an isolated answer needs number clarity
  - `كُتُبٌ` → `کتابیں`
  - `أَوْلَادٌ` → `بچے`
- Exercise coverage:
  - five singular–plural matches;
  - Quran target recognition;
  - distinguish broken from sound plurals;
  - meaning retrieval in English and Urdu; and
  - one short context exercise without untaught number grammar.

### Lesson 4 — Plural Reading Lab

- Keep stable ID `ch13-l04` but replace its current objective entirely.
- Remove all instruction and assessment about feminine-singular adjective
  agreement. That rule remains in Chapter 14.
- Use this lesson as cumulative application with no new grammar.
- Use a verified Quranic hook containing a clear plural target not already used
  by Lessons 1–3. A suitable candidate is an excerpt containing
  `الْمُفْلِحُونَ`; the exact ayah, translation, audio, and token index must be
  verified during implementation.
- Discovery cards should compare the three families in context:
  - sound masculine: `الْكَافِرُونَ`, `الْمُؤْمِنُونَ`, `الْمُتَّقِينَ`
  - sound feminine: `الْمُسْلِمَاتِ`, `الْمُؤْمِنَاتِ`
  - broken: `صُدُورٌ`, `كُتُبٌ`, `بُيُوتٌ`, `أَوْلَادٌ`
- Exercises should ask the learner to:
  - classify a highlighted Quran word;
  - connect it to a known singular when appropriate;
  - distinguish `ـُونَ`/`ـِينَ`, `ـَات`, and internal-shape change;
  - choose the correct meaning;
  - complete a short reading sequence; and
  - explain why an unfamiliar broken plural must be learned as vocabulary.
- Do not assess adjective form, human/non-human agreement, or number phrases.

## Lesson 5 — Chapter 13 Review

- New stable ID: `ch13-l05`.
- Template: `REVIEW`.
- Introduce no new words or grammar.
- Review all three plural families across the four lessons.
- Include ten mixed exercises:
  1. classify a `ـُونَ` form;
  2. recognize a `ـِينَ` form as the same sound masculine family;
  3. classify a `ـَات` form;
  4. match a feminine singular with its plural;
  5. match two broken singular–plural pairs;
  6. identify `الْكَافِرُونَ` in Al-Kafirun 109:1;
  7. identify the selected feminine plural in Al-Ahzab 33:35;
  8. identify `صُدُورِ` in An-Nas 114:5;
  9. classify mixed Quranic forms; and
  10. complete a short meaning-based reading task.
- The close should prepare the learner for the final test without introducing
  Chapter 14's adjective rules.

## Lesson 6 — Chapter 13 Final Test

- New stable ID: `ch13-test`.
- Template: `REVIEW` with `assessment.type = "CHAPTER_TEST"`.
- Twelve server-validated questions.
- Pass threshold: 80% — 10 of 12 correct.
- Proposed coverage:
  1. Recognize `الْكَافِرُونَ` as plural.
  2. Connect `كَافِرٌ` with `كَافِرُونَ`.
  3. Recognize `مُتَّقِينَ` as belonging to the sound masculine family.
  4. Recognize `مُؤْمِنَاتٌ` as sound feminine plural.
  5. Connect `مُسْلِمَةٌ` with `مُسْلِمَاتٌ`.
  6. Distinguish a sound feminine form from a masculine form.
  7. Connect `صَدْرٌ` with `صُدُورٌ`.
  8. Connect `كِتَابٌ` with `كُتُبٌ`.
  9. Connect `بَيْتٌ` with `بُيُوتٌ`.
  10. Classify a broken plural by its changed internal shape.
  11. Identify a taught plural in a Quranic excerpt.
  12. Classify a mixed set across all three plural families.
- Exclude plural adjective agreement, number grammar, full case terminology,
  and generation of unseen broken plurals.
- Verify retry behavior and ensure completion, XP, and chapter bonuses cannot
  be duplicated.

## Quran reveal plan

| Lesson | Proposed reference | Direct target | Purpose |
|---|---|---|---|
| `ch13-l01` | Al-Kafirun 109:1 | `الْكَافِرُونَ` | sound masculine `ـُونَ` |
| `ch13-l02` | Al-Ahzab 33:35 excerpt | `الْمُؤْمِنَاتِ` or `الْمُسْلِمَاتِ` | sound feminine `ـَات` |
| `ch13-l03` | An-Nas 114:5 | `صُدُورِ` | broken plural in context |
| `ch13-l04` | verified distinct excerpt | declared plural target | mixed reading application |

Every reveal must include both `highlighted_word_indices` and
`highlighted_words`. Quran text, translation, reference, audio, and selected
token must pass the Quran audit after the final excerpts are approved.

## Validator correction

The fixture validator currently calls semantic reveal validation only when
`highlighted_words` exists. That allowed Lesson 3's out-of-range index to pass.

As part of implementation:

- always validate `highlighted_word_indices` bounds whenever a reveal exists;
- additionally compare the selected tokens with `highlighted_words` when that
  field is present; and
- require `highlighted_words` for all newly corrected Chapter 13 reveals.

Add a focused test proving that index `4` fails for a four-token ayah.

## Language and transliteration requirements

- Arabic forms must preserve meaningful differences between singular and
  plural endings.
- Transliteration must represent long vowels consistently, especially `aa` in
  `ـَات` forms.
- English labels must distinguish one person from a group.
- Urdu answer choices must be unambiguously singular or plural when both appear
  in the same activity.
- Do not translate an isolated plural `طُلَّابٌ` as singular-looking
  `طالب علم`; use `طلبہ`.
- Keep learner-facing explanations concise and avoid unexplained case terms.

## Source metadata

Resolve the missing `reader_lecture_13_jama_introduction.md` reference before
approval:

1. restore the real source document;
2. replace it with the actual source identifier; or
3. replace the stale metadata after this proposal becomes the approved content
   specification.

Do not create an empty placeholder source file.

## Media requirements

- Preserve the verified Al-Kafirun recitation for Lesson 1.
- Add and verify the correct human recitations for the approved Lesson 2,
  Lesson 3, and Lesson 4 Quran references.
- Changed learner-facing Arabic with a play control must be added to the audio
  catalog and checked after staging refresh.
- Reuse existing verified vocabulary audio only when its Arabic text still
  matches exactly.
- New images are optional and must not be added merely to decorate grammar
  cards. Any approved illustration must follow the existing 768px WebP rule.

## Implementation constraints

- Update canonical fixtures, not production database JSON directly.
- Preserve `ch13-l01` through `ch13-l04` and existing exercise IDs where an
  exercise retains the same learning purpose.
- Add only `ch13-l05` and `ch13-test` as new lesson IDs.
- Update the chapter title and seed assembly only after proposal approval.
- Do not modify Chapter 9 while implementing this proposal.
- Do not move Chapter 14 adjective rules back into Chapter 13.
- Do not run the full production seed. Use the scoped, progress-preserving
  content promotion workflow.
- Preserve unrelated working-tree changes.

## Validation and acceptance gates

1. Obtain product-owner approval for this redesign.
2. Update the four canonical fixtures and add the review/test fixtures.
3. Update the seed assembly while preserving existing stable IDs.
4. Add the reveal-index validator regression test.
5. Run from `warsh-backend`:

   ```powershell
   npm run db:validate-fixtures
   npm run quran:audit-fixtures
   npm run db:audit-urdu
   npm run media:check-fixtures
   npm run content:check
   npm test
   ```

6. Refresh only the isolated local staging database.
7. Complete all six Chapter 13 items in English and Urdu on the debug emulator,
   checking:
   - every discovery card and explanation;
   - singular/plural meaning and transliteration;
   - Quran text, translation, audio, and highlighted word;
   - every correct answer and wrong-answer explanation;
   - review completion and final-test grading;
   - retry behavior and Chapter 14 unlock; and
   - absence of duplicate XP or progress records.
8. Confirm that Chapter 13 no longer reteaches Chapter 9 or pre-teaches Chapter
   14 adjective agreement.
9. Obtain explicit approval before any production promotion.
10. Add only the new review/test progress rows for eligible existing learners;
    do not rewrite their four existing lesson-progress rows.

## Definition of done

Chapter 13 has a distinct six-item progression: four applied Quranic plural
lessons, one mixed review, and one final test. It builds on Chapter 9 without
duplicating it, leaves adjective agreement to Chapter 14, teaches no untaught
number or case grammar, uses direct Quran targets with validated highlights,
has accurate English, Urdu, and transliteration, passes isolated staging QA in
both languages, preserves existing learner progress, and is not promoted to
production without explicit approval.

## Implementation notes (2026-09-20)

- Every lesson specification above was implemented as written, with these
  concrete choices: the Lesson 2 declared token is `وَالْمُؤْمِنَاتِ` (index 4
  of the canonical excerpt `إِنَّ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِينَ
  وَالْمُؤْمِنَاتِ`, وَ included because the validator compares whole tokens);
  Lesson 3 uses the excerpt `فِي صُدُورِ النَّاسِ` (index 1); Lesson 4 uses the
  Al-Baqarah 2:5 excerpt `وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ` (index 2) with
  `مُفْلِحٌ` introduced as its singular at recognition level.
- The reveal-index validator correction is unconditional, with the 18
  pre-existing out-of-range reveals in Chapters 19–70 allow-listed as warnings
  (`LEGACY_REVEAL_INDEX_DEFECTS` in `prisma/validate-curriculum.cjs`) so that
  content the owner has not yet reviewed does not block the release gate.
- The `reader_lecture_13_jama_introduction.md` reference was replaced by this
  proposal's path in `prisma/curriculum-book1.cjs`; no placeholder file exists.
- The player renders a card's hero from `text.ar ?? concept.ar` only and never
  lists `examples`; every CONCEPT / CONTRAST card therefore carries its
  comparison in `concept.ar`.
- No new illustrations were added; `kitab`, `bayt`, `walad`, `talib` and
  `mumina` dictionary scenes are reused on the WORD cards that have them.

