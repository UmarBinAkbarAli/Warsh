# Chapter 10 Content Proposal

## Status

Owner-authored. Implemented in the isolated staging database on 2026-09-18 and
verified on the emulator; **production promotion is a separate, explicitly
approved step** (`npm run content:promote-chapter-ten -- --apply`). See
"Implementation notes" at the end for the one deviation from the fixture
identity rule below.

## Chapter goal

Teach standalone plural pronouns and the basic time pair **before/after**:

- They: `هُمْ` and `هُنَّ`
- We: `نَحْنُ`
- You all: `أَنْتُمْ` and `أَنْتُنَّ`
- Before: `قَبْلَ`
- After: `بَعْدَ`

By the end, a learner should be able to identify the speaker/listener group, use the pronoun in a simple nominal sentence, and place `قَبْلَ` or `بَعْدَ` in a short time phrase.

## Current problems to correct

1. The chapter metadata promises “you all,” but the current four lessons do not teach `أَنْتُمْ / أَنْتُنَّ`.
2. The current `قَبْلَ` and `بَعْدَ` lesson hooks do not contain the target words.
3. The current `هُمْ / هُنَّ` hook contains attached `ـهِمْ` inside `عَلَيْهِمْ`, which is not the standalone form being introduced.
4. The current lessons have only four discovery cards and five exercises each; this is not enough practice for five distinct ideas.
5. `جَاءُوا` appears before plural past-tense verbs are taught.
6. The current copy overstates the grammar by saying the following noun after `قَبْلَ / بَعْدَ` is “always” kasrah. The proposal teaches only the construct phrases used in this chapter.
7. There is no chapter review lesson or final test.
8. The current chapter order must be changed without renaming existing stable lesson IDs or breaking saved learner progress.

## Final lesson sequence

| Display order | Stable ID | Lesson | Discovery cards | Exercises |
|---:|---|---|---:|---:|
| 1 | `ch10-l01` | They — `هُمْ / هُنَّ` | 9 | 7 |
| 2 | `ch10-l02` | We — `نَحْنُ` | 9 | 7 |
| 3 | `ch10-l05` | You all — `أَنْتُمْ / أَنْتُنَّ` | 9 | 7 |
| 4 | `ch10-l03` | Before — `قَبْلَ` | 9 | 7 |
| 5 | `ch10-l04` | After — `بَعْدَ` | 9 | 7 |
| 6 | `ch10-l06` | Chapter 10 review | 8 | 10 |
| 7 | `ch10-test` | Chapter 10 final test | — | 12 questions |

### Fixture/seed identity rule

Keep the existing fixture filenames and IDs for lessons 1–4. The database display order is independent of the filename order:

| Stable ID | Existing/current fixture | `_meta.lesson_order` | New display order |
|---|---|---:|---:|
| `ch10-l01` | `chapter-10-lesson-01.json` | 1 | 1 |
| `ch10-l02` | `chapter-10-lesson-02.json` | 2 | 2 |
| `ch10-l05` | `chapter-10-lesson-05-you-all.json` | 5 | 3 |
| `ch10-l03` | `chapter-10-lesson-03.json` | 3 | 4 |
| `ch10-l04` | `chapter-10-lesson-04.json` | 4 | 5 |
| `ch10-l06` | `chapter-10-lesson-06-review.json` | 6 | 6 |
| `ch10-test` | `chapter-10-lesson-07-final-test.json` | 7 | 7 |

Do not rename `chapter-10-lesson-03.json` or `chapter-10-lesson-04.json`. Update the curriculum seed/order explicitly so the learner sees the sequence above. Existing IDs remain unchanged; new lessons receive new IDs.

## Lesson specifications

### Lesson 1 — They: `هُمْ / هُنَّ`

- **Quran hook:** Yusuf 12:15 partial: `وَهُمْ لَا يَشْعُرُونَ`; highlight standalone `هُمْ`.
- **Cards:**
  1. `هُمْ` = they (male or mixed group)
  2. `هُنَّ` = they (female-only group)
  3. `هُمْ طُلَّابٌ`
  4. `هُنَّ طَالِبَاتٌ`
  5. Male/mixed versus female-only choice
  6. Standalone pronoun versus attached `ـهِمْ` recognition only
  7. A pronoun can be the subject of a nominal sentence
  8. Quran checkpoint: locate `هُمْ`
  9. Summary and usage boundary
- **Exercises:** translation, true/false, fill the pronoun, matching, sentence building, standalone/attached recognition, Quran recognition.
- **Illustration:** separate nearby male/mixed and female groups; no text inside the image.

### Lesson 2 — We: `نَحْنُ`

- **Quran hook:** Al-Fatihah 1:5: `إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ`.
- Explain that the verse uses first-person plural verbs (“we worship/we ask for help”), while this lesson introduces the standalone pronoun `نَحْنُ`.
- **Cards:** meaning, speaker-plus-others, `نَحْنُ مُسْلِمُونَ`, `نَحْنُ طُلَّابٌ`, community voice, recognition of `نَعْبُدُ / نَسْتَعِينُ`, comparison with `هُمْ / هُنَّ`, nominal sentence pattern, checkpoint.
- **Exercises:** translation, pronoun selection, matching, fill, sentence ordering, speaker-group identification, Quran recognition.
- **Illustration:** a group speaking as “we”; no text inside the image.

### Lesson 3 — You all: `أَنْتُمْ / أَنْتُنَّ`

- **New stable ID:** `ch10-l05`.
- **Quran hook:** Al-Kafirun 109:3 partial: `وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ`; highlight `أَنْتُمْ`.
- **Cards:**
  1. `أَنْتُمْ` = you all (male or mixed group)
  2. `أَنْتُنَّ` = you all (female-only group)
  3. `أَنْتُمْ طُلَّابٌ`
  4. `أَنْتُنَّ طَالِبَاتٌ`
  5. Second-person meaning: speaking directly to the group
  6. Compare `هُمْ / هُنَّ` (they) with `أَنْتُمْ / أَنْتُنَّ` (you all)
  7. Nominal sentence use without adding a new verb-conjugation lesson
  8. Quran checkpoint: locate `أَنْتُمْ`
  9. Summary and usage boundary
- **Exercises:** translation, choose the audience, fill, matching, sentence building, they-versus-you-all distinction, Quran recognition.
- **Illustration:** a learner facing a group; male/mixed and female-only variants; no text inside the image.

### Lesson 4 — Before: `قَبْلَ`

- **Existing stable ID:** `ch10-l03`.
- **Quran hook:** Ta-Ha 20:130 partial: `قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ غُرُوبِهَا`; highlight `قَبْلَ`.
- **Cards:** meaning, `قَبْلَ الصَّلَاةِ`, `قَبْلَ الدَّرْسِ`, before/after timeline, a known simple sentence such as `ذَهَبَ قَبْلَ الصَّلَاةِ`, construct-phrase explanation, limited case note (“in this phrase, the following noun is genitive”), Quran checkpoint, summary.
- Replace `جَاءُوا` with vocabulary and verb forms already taught.
- Do not claim that every possible noun after `قَبْلَ` is always kasrah; explain only the examples used here.
- **Exercises:** meaning, ordering events, phrase matching, fill, sentence building, before-versus-after discrimination, Quran recognition.
- **Illustration:** a simple two-step timeline with an earlier event highlighted; no text inside the image.

### Lesson 5 — After: `بَعْدَ`

- **Existing stable ID:** `ch10-l04`.
- **Quran hook:** Ali ‘Imran 3:8 partial: `بَعْدَ إِذْ هَدَيْتَنَا`; highlight `بَعْدَ`.
- **Cards:** meaning, `بَعْدَ الدَّرْسِ`, comparison with `قَبْلَ`, a known simple sentence such as `رَجَعَ بَعْدَ الدَّرْسِ`, construct-phrase explanation, limited genitive note, Quran checkpoint, summary.
- Avoid advanced case terminology beyond the short phrase pattern shown.
- **Exercises:** meaning, ordering events, phrase matching, fill, sentence building, before-versus-after discrimination, Quran recognition.
- **Illustration:** the same timeline language as Lesson 4, with a later event highlighted; no text inside the image.

### Lesson 6 — Chapter review

- **New stable ID:** `ch10-l06`.
- Eight cards and ten exercises.
- Review all five targets: `هُمْ`, `هُنَّ`, `نَحْنُ`, `أَنْتُمْ`, `أَنْتُنَّ`, `قَبْلَ`, `بَعْدَ`.
- Include mixed nominal sentences, pronoun perspective, male/mixed versus female-only groups, and before/after sequencing.
- Include one standalone-versus-attached recognition item, but do not teach attached plural possession here; that belongs to later chapters.
- No new grammar is introduced.

### Lesson 7 — Chapter final test

- **New stable ID:** `ch10-test`.
- Twelve server-validated questions; pass threshold: 10/12 (80%).
- Coverage: all five lesson topics, Quran phrase recognition, perspective, group gender/number, and basic `قَبْلَ / بَعْدَ` phrase use.
- Exclude: attached plural possessive paradigms, full plural verb conjugation, dual pronouns, and advanced case terminology.
- The test must render its question payload before the learner can start, show a clear empty/error state if content is missing, and preserve retry behavior without duplicating completion points.

## Media and audio requirements

- Generate one text-free illustration per discovery card that needs visual support; do not use Pencil.
- Export discover images as WebP at 768px and verify the public media URL loads.
- Add or regenerate audio for every changed Arabic string. Audio identity is based on the Arabic-text hash, so changed text requires a fresh audio asset.
- Run the content-health/media scan before staging promotion.

## Implementation constraints

- Use the existing `STANDARD` lesson template and canonical lesson schema.
- Match the fixture structure, exercise types, Urdu style, Quran reference shape, and completion behavior used by Chapters 3 and 4.
- Preserve all existing stable lesson IDs and learner progress.
- Do not move attached pronoun teaching from its later chapter into Chapter 10.
- Do not modify Chapters 1–9, app navigation, unlocking rules, points rules, or unrelated working-tree changes.

## Validation and acceptance gates

1. Validate fixture/schema shape: `npm run db:validate-fixtures`.
2. Run Quran-reference and Arabic/Urdu audits: `npm run quran:audit-fixtures` and `npm run db:audit-urdu`.
3. Confirm the fixture mirror/database boundary with `npm run content:check`.
4. Confirm every changed Arabic string has audio and every referenced image is a valid 768px WebP.
5. Seed the isolated staging database only; never run the full production seed.
6. Test the chapter on the emulator: lesson order, card rendering, exercise correctness, review completion, final-test rendering/submission, retry, and chapter unlock.
7. Test two accounts on one device and confirm progress, points, and completion are isolated by authenticated account—not device storage alone.
8. Promote only after staging and emulator acceptance; production deployment is a separate, explicitly approved step.

## Definition of done

Chapter 10 displays the seven-item sequence above, teaches each promised target with sufficient discovery and retrieval practice, uses relevant Quran hooks and illustrations, passes all fixture/content/media checks, completes its review and final test, preserves existing learner progress, and does not change unrelated chapters or app functionality.

## Implementation notes (2026-09-18)

- **Fixture filenames follow display order, not stable-ID number.** The
  content mirror (`content:check` / `content:export` / `content:sync`) matches a
  fixture to its database row by `_meta.chapter_order` + `_meta.lesson_order`,
  and `db:validate-fixtures` requires `lesson_order` to equal the number in the
  filename. Keeping `chapter-10-lesson-03.json` = `ch10-l03` at display order 4
  is therefore impossible without breaking the mirror, so Chapter 10 uses the
  same convention as Chapter 5 (which also reordered lessons): file number ==
  display order, stable ID recorded in `_meta._note` and in `seed.cjs` /
  `promote-chapter-ten.cjs`.

  | Display order | Stable ID | Fixture file |
  |---:|---|---|
  | 1 | `ch10-l01` | `chapter-10-lesson-01.json` |
  | 2 | `ch10-l02` | `chapter-10-lesson-02.json` |
  | 3 | `ch10-l05` (new) | `chapter-10-lesson-03.json` |
  | 4 | `ch10-l03` | `chapter-10-lesson-04.json` |
  | 5 | `ch10-l04` | `chapter-10-lesson-05.json` |
  | 6 | `ch10-l06` (new) | `chapter-10-lesson-06-review.json` |
  | 7 | `ch10-test` (new) | `chapter-10-lesson-07-final-test.json` |

  Every stable ID is preserved and updated in place, so learner progress on
  `ch10-l01..l04` is untouched; only `ch10-l05`, `ch10-l06` and `ch10-test` are
  inserted.
- **Illustrations.** Group cards reuse the approved `qawm` asset; the prayer,
  lesson, sun and returning-learner cards reuse the dictionary illustrations
  (`salah`, `dars`, `shams`, `rajaa`, copied to `images/discover/` as 768 px
  WebP on 2026-09-18). The five composite scenes the proposal asks for
  (two groups, group speaking as we, learner facing a group, before-timeline,
  after-timeline) are owner deliverables tracked in
  `Docs/lesson-illustrations-needed.md`; no image was generated by a tool.
- **Quran hooks** as specified: Yusuf 12:15 (`وَهُمْ لَا يَشْعُرُونَ`),
  Al-Fatihah 1:5, Al-Kafirun 109:3, Ta-Ha 20:130 (`قَبْلَ طُلُوعِ الشَّمْسِ
  وَقَبْلَ غُرُوبِهَا`), Ali 'Imran 3:8 (`رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ
  هَدَيْتَنَا` — the excerpt carries two more words than the proposal's
  `بَعْدَ إِذْ هَدَيْتَنَا` so it reads as a phrase; the highlighted word is the
  same). All pass `quran:audit-fixtures`.
- **Attached pronouns** appear only as recognition (`عَلَيْهِمْ` next to `هُمْ`,
  one card in Lessons 1 and 6, one item in the review and the test), as the
  proposal allows; no attached paradigm is taught.
