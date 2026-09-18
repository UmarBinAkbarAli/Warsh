# Chapter 7 — Complete Content Proposal

**Status:** Implemented in isolated staging (2026-09-18); production promotion pending owner approval — see the implementation notes at the end  
**Chapter position:** Chapter 7  
**Working title:** **Attached Pronouns and Simple Possession**  
**Urdu title:** **جڑی ہوئی ضمیریں اور سادہ ملکیت**

## 1. Chapter purpose

Chapter 7 introduces the attached singular pronouns that learners meet constantly in Quranic Arabic:

- `ـِي` — my
- `ـُكَ / ـُكِ` — your (male/female addressee)
- `ـُهُ / ـُهَا` — his/her
- `عِنْدِي، عِنْدَكَ، عِنْدَكِ، عِنْدَهُ، عِنْدَهَا` — possession and availability

The chapter should teach recognition and useful beginner production without turning into a full morphology chapter. Chapter 19 remains the later detailed attached-pronoun and paradigm chapter.

### End-of-chapter outcome

After Chapter 7, the learner should be able to:

1. Recognise `ـِي` as “my” when attached to a noun.
2. Distinguish `ـُكَ` and `ـُكِ` as “your” for a male or female addressee.
3. Distinguish `ـُهُ` and `ـُهَا` as “his” and “her/its.”
4. Understand that an attached pronoun makes the noun definite: `كِتَابٌ` → `كِتَابِي`.
5. Read possession phrases with `عِنْدَ`: `عِنْدِي قَلَمٌ` — I have a pen.
6. Ask and answer a simple possession question: `أَعِنْدَكَ قَلَمٌ؟`.
7. Read the basic spoken questions `مَا هَذَا؟`, `مَنْ هَذَا؟`, and `أَيْنَ الْكِتَابُ؟`.
8. Pass a 12-question final test with the existing 80% server-enforced pass rule.

## 2. Later-curriculum overlap decision

- Chapter 5 teaches `لِي، لَكَ، لَكِ، لَهُ، لَهَا` as the `لِـ` possession pattern. Chapter 7 must explicitly contrast that pattern with noun-attached possession: `لِي كِتَابٌ` versus `كِتَابِي`.
- Chapter 19 teaches attached-pronoun morphology in depth, including full paradigms and plural pronouns. Chapter 7 is the first practical introduction; Chapter 19 remains the advanced consolidation chapter.
- Chapter 12 teaches personal-information questions such as “What is your name?” and “Where are you from?”. Chapter 7 may use `مَا اسْمُكَ؟` only as a recognition example, not as a personal-information unit.
- Chapter 22 expands basic questions into conversation. Chapter 7 should introduce only the short question patterns needed for the lesson scene.
- Chapter 23 later integrates attached pronouns with relative clauses. No Chapter 23 changes are included here.

## 3. Final chapter structure

| Display order | Stable lesson ID | Fixture file | Template | Title | Main outcome | Cards | Exercises |
|---:|---|---|---|---|---|---:|---:|
| 1 | `ch07-l01` | `chapter-07-lesson-01.json` | `STANDARD` | My — attached `ـِي` | Recognise and use “my” | 9 | 7 |
| 2 | `ch07-l02` | `chapter-07-lesson-02.json` | `STANDARD` | Your — attached `ـُكَ / ـُكِ` | Distinguish male/female addressee | 9 | 7 |
| 3 | `ch07-l03` | `chapter-07-lesson-03.json` | `STANDARD` | His and Her — attached `ـُهُ / ـُهَا` | Distinguish owner gender and attachment function | 9 | 7 |
| 4 | `ch07-l04` | `chapter-07-lesson-04.json` | `STANDARD` | Possession with `عِنْدَ` | Express “I/you/he/she have” | 9 | 8 |
| 5 | `ch07-l05` | `chapter-07-lesson-05-spoken-phrases.json` | `SPOKEN_PHRASES` | Simple questions | Ask and answer short questions | — | — |
| 6 | `ch07-l06` | `chapter-07-lesson-06-review.json` | `REVIEW` | Chapter 7 review | Consolidate the chapter | 8 | 10 |
| 7 | `ch07-test` | `chapter-07-lesson-07-final-test.json` | `REVIEW` | Chapter 7 final test | Prove mastery and unlock Chapter 8 | — | 12 |

Existing IDs `ch07-l01` through `ch07-l05` remain unchanged. New IDs are only `ch07-l06` and `ch07-test`. Existing learner progress must not be reset.

### Fixture and display-order identity map

The fixture filename/order is a validator identity; the database `order` is the learner display order. For Chapter 7 they remain aligned:

| Fixture | Stable ID | `_meta.lesson_order` | Database order |
|---|---|---:|---:|
| `chapter-07-lesson-01.json` | `ch07-l01` | 1 | 1 |
| `chapter-07-lesson-02.json` | `ch07-l02` | 2 | 2 |
| `chapter-07-lesson-03.json` | `ch07-l03` | 3 | 3 |
| `chapter-07-lesson-04.json` | `ch07-l04` | 4 | 4 |
| `chapter-07-lesson-05-spoken-phrases.json` | `ch07-l05` | 5 | 5 |
| `chapter-07-lesson-06-review.json` | `ch07-l06` | 6 | 6 |
| `chapter-07-lesson-07-final-test.json` | `ch07-test` | 7 | 7 |

## 4. Shared implementation rules

- Keep all stable IDs, exercise IDs, Quran references, and existing audio URLs unless a content correction requires a new Arabic string.
- Any changed Arabic string requires audio regeneration because lesson audio is keyed by the Arabic-text hash.
- Urdu translations must preserve the grammatical distinction between the owner and the person being addressed. Use `مؤنث مخاطب` where a grammar label is needed; do not use a misleading “عورت” label as the grammar explanation.
- Every standard lesson must keep the existing schema shape: hook, `discover_cards`, `exercises`, reveal, and close.
- The spoken-phrase lesson intentionally has no `discover_cards` or `exercises`; its phrases and dialogue are the learning content.
- All illustrations must be generated with the approved image-generation workflow, not Pencil. Images must be text-free, culturally neutral, and exported as 768px WebP. Arabic/Urdu text is rendered by the app.
- Validate Quran text, Arabic indices, Urdu, and the lesson schema before staging seed. Do not run a production seed.

---

# Lesson 1 — My: Attached `ـِي`

**Stable ID:** `ch07-l01`  
**Template:** `STANDARD`  
**Estimated time:** 10 minutes  
**Objective:** Recognise `ـِي` as “my” and understand that it makes the noun definite.  
**Scope boundary:** Do not teach the full pronoun paradigm here.

## Quran hook

**Az-Zumar 39:53**  
`قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ`

- Keep the existing verse and highlight `عِبَادِيَ`.
- Explain that `ي` carries “my” in `عِبَادِيَ` (“My servants”). The final vowel belongs to the Quranic grammatical/vocative context; it is not a second new suffix.
- Do not claim that every final `ي` in Arabic automatically means “my”; the lesson is about attached pronoun usage in the taught examples.

## Discovery cards

1. `ـِي` attaches to a noun to mean “my”.
2. `كِتَابٌ` = a book; `كِتَابِي` = my book.
3. `قَلَمِي` = my pen.
4. `رَبِّي` = my Lord.
5. `دِينِي` = my religion.
6. `اِسْمِي` = my name.
7. `بَيْتِي` = my house.
8. An attached pronoun makes the noun definite: `كِتَابِي` means “my book,” not “a my book.”
9. Quran checkpoint: locate the attached `ي` in `عِبَادِيَ` and connect it to “my”.

## Vocabulary retained or added

Retain `كِتَابٌ، قَلَمٌ، رَبٌّ، دِينٌ`. Add/reinforce `اِسْمٌ` (name) and `بَيْتٌ` (house). Do not remove existing vocabulary.

## Illustration

Generate a text-free image of a learner identifying personal objects (book, pen, house/name-card motif) with a subtle “belongs to me” visual relationship. Do not place Arabic or Urdu lettering in the image.

## Exercises

1. Translate `كِتَابِي` → “my book”.
2. Translate `رَبِّي` → “my Lord”.
3. True/false: the final `ي` in `قَلَمِي` means “my”. → True.
4. Fill `___ جَدِيدٌ` for “my book is new” → `كِتَابِي`.
5. Match `كِتَابِي، قَلَمِي، اِسْمِي، بَيْتِي` with exact English and Urdu meanings.
6. Build “my pen is new” → `قَلَمِي جَدِيدٌ`.
7. Quran recognition: select `عِبَادِيَ` and identify the attached `ي`.

## Completion message

You can now recognise the speaker’s “my” ending on familiar nouns. Next you will learn the two forms of “your”.

---

# Lesson 2 — Your: Attached `ـُكَ / ـُكِ`

**Stable ID:** `ch07-l02`  
**Template:** `STANDARD`  
**Estimated time:** 10 minutes  
**Objective:** Distinguish `ـُكَ` when addressing a male and `ـُكِ` when addressing a female.

## Quran hook

**Al-‘Alaq 96:1**  
`اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ`

- Keep the existing verse and highlight `رَبِّكَ`.
- Explain `رَبِّكَ` as “your Lord” addressed to a male listener in this lesson’s form.

## Discovery cards

1. `ـُكَ` = your, addressed to a male.
2. `ـُكِ` = your, addressed to a female.
3. `كِتَابُكَ` = your book (male addressee).
4. `كِتَابُكِ` = your book (female addressee).
5. `اِسْمُكَ` and `اِسْمُكِ` = your name, with the addressee distinguished by the ending.
6. `رَبُّكَ` = your Lord (male addressee).
7. Contrast `كِتَابِي` (my book) with `كِتَابُكَ / كِتَابُكِ` (your book).
8. The noun remains definite after the attached pronoun.
9. Quran checkpoint: find `كَ` in `رَبِّكَ` and read the surrounding phrase.

## Urdu wording rule

Use `تمہاری کتاب (مذکر مخاطب)` and `تمہاری کتاب (مؤنث مخاطب)` where the distinction must be shown. Do not label the grammatical form merely as “عورت سے”.

## Vocabulary

Retain `كِتَابٌ، رَبٌّ، اِسْمٌ` and add/reinforce `كِتَابُكِ` and `اِسْمُكِ` as separate audio/transliteration entries even though their unvocalized `ar_plain` may match the masculine form.

## Illustration

Generate a text-free visual with two distinct listeners receiving the same object, showing that the ending changes according to whom the speaker addresses. No generated writing.

## Exercises

1. Translate `كِتَابُكَ` → “your book (male addressee)”.
2. Translate `كِتَابُكِ` → “your book (female addressee)”.
3. True/false: `كِتَابُكَ` and `كِتَابُكِ` have the same basic meaning but address different listeners. → True.
4. Fill `مَا ___؟` for “What is your name?” with a male addressee → `اِسْمُكَ`.
5. Fill the same pattern for a female addressee → `اِسْمُكِ`.
6. Match `كِتَابِي، كِتَابُكَ، كِتَابُكِ، رَبُّكَ` with exact meanings.
7. Build “your book is new” for a female addressee → `كِتَابُكِ جَدِيدٌ`.

## Completion message

The ending tells you whether the noun belongs to the speaker or to the person being addressed, and whether that addressee is male or female.

---

# Lesson 3 — His and Her: Attached `ـُهُ / ـُهَا`

**Stable ID:** `ch07-l03`  
**Template:** `STANDARD`  
**Estimated time:** 11 minutes  
**Objective:** Recognise `ـُهُ` as “his” and `ـُهَا` as “her/its” when attached to a noun.

## Quran hook

**Ash-Shams 91:8**  
`فَأَلْهَمَهَا فُجُورَهَا وَتَقْوَاهَا`

- Keep the existing verse and highlight the three relevant words.
- Teach the function difference explicitly:
  - `أَلْهَمَهَا` contains an attached object pronoun: “inspired it/her”.
  - `فُجُورَهَا` and `تَقْوَاهَا` contain attached possessive pronouns: “its wickedness” and “its righteousness”.
- The active beginner production target remains noun possession, not verb-object morphology.

## Discovery cards

1. `ـُهُ` = his when attached to a noun.
2. `ـُهَا` = her/its when attached to a noun.
3. `كِتَابُهُ` = his book.
4. `قَلَمُهُ` = his pen.
5. `مَدْرَسَتُهَا` = her school.
6. `أُمُّهَا` = her mother.
7. The owner’s gender is shown by the suffix, not by the grammatical gender of the owned noun.
8. In the Quran hook, the same `هَا` letters can be an object pronoun or a possessive pronoun; the surrounding word and meaning determine the function.
9. Checkpoint: identify the noun and then ask “whose?”

## Urdu wording rule

Use owner-focused wording such as `اس کی کتاب (مذکر مالک)` and `اس کی کتاب (مؤنث مالک)` when a contrast is necessary. Do not imply that `مَدْرَسَتُهَا` has a feminine school; the feminine distinction belongs to the owner.

## Illustration

Generate a text-free visual showing two personal ownership relationships (a man with a book and a woman with a school/home symbol). Add a separate visual cue for “object attached to an action” only if it remains clearly recognition-only. No Arabic or Urdu text.

## Exercises

1. Translate `كِتَابُهُ` → “his book”.
2. Translate `مَدْرَسَتُهَا` → “her school”.
3. True/false: the suffix in `أُمُّهَا` identifies the owner as feminine. → True.
4. Fill `___ جَدِيدٌ` for “his book is new” → `كِتَابُهُ`.
5. Match `كِتَابُهُ، قَلَمُهُ، مَدْرَسَتُهَا، أُمُّهَا` with exact meanings.
6. Build “his book is new” → `كِتَابُهُ جَدِيدٌ`.
7. Quran recognition: distinguish possessive `فُجُورَهَا / تَقْوَاهَا` from object `أَلْهَمَهَا` without requiring production of the object-pronoun rule.

## Completion message

You can now follow “his” and “her/its” through noun phrases and notice that a small ending can show who owns something.

---

# Lesson 4 — Possession with `عِنْدَ`

**Stable ID:** `ch07-l04`  
**Template:** `STANDARD`  
**Estimated time:** 11 minutes  
**Objective:** Use `عِنْدَ` with attached pronouns to express possession and availability.

## Quran hook

**Al-An‘am 6:59**  
`وَعِندَهُ مَفَاتِحُ الْغَيْبِ`

- Keep the existing verse and highlight `وَعِندَهُ`.
- Explain `عِنْدَ` at beginner level as a place/possession expression: “with/at someone,” often translated “has” in a possession sentence.
- Do not present `عِنْدَ` as a simple preposition. The attached pronoun carries the person reference.

## Discovery cards

1. `عِنْدَ` can mean “with/at” and can express possession.
2. `عِنْدِي قَلَمٌ` = I have a pen.
3. `عِنْدَكَ كِتَابٌ` = you have a book (male addressee).
4. `عِنْدَكِ كِتَابٌ` = you have a book (female addressee).
5. `عِنْدَهُ بَيْتٌ` = he has a house.
6. `عِنْدَهَا مَدْرَسَةٌ` = she has a school.
7. Question to a male: `أَعِنْدَكَ قَلَمٌ؟`.
8. Question to a female: `أَعِنْدَكِ قَلَمٌ؟`.
9. Contrast Chapter 5 `لِي كِتَابٌ` with Chapter 7 `كِتَابِي`: both relate to possession, but the structure is different.

## Vocabulary

Retain `قَلَمٌ، كِتَابٌ، بَيْتٌ، مَدْرَسَةٌ`. Add `عِنْدَكِ` as a fully practised form, not merely a hidden variant.

## Illustration

Generate a text-free visual of four people with or without an object, communicating “I have / you have / he has / she has.” Avoid text labels and stereotypes.

## Exercises

1. Translate `عِنْدِي قَلَمٌ` → “I have a pen.”
2. Translate `عِنْدَكَ كِتَابٌ` → “You have a book” (male addressee).
3. True/false: `عِنْدِي` literally contains a place expression but can mean “I have”. → True.
4. Fill `___ قَلَمٌ` for “I have a pen” → `عِنْدِي`.
5. Match all four possession phrases: `عِنْدِي، عِنْدَكَ، عِنْدَكِ، عِنْدَهُ / عِنْدَهَا`.
6. Build `نَعَمْ، عِنْدِي قَلَمٌ`.
7. Choose the correct question for a female addressee → `أَعِنْدَكِ قَلَمٌ؟`.
8. Grammar recognition: label `عِنْدِي` as the possession/location expression and `قَلَمٌ` as the possessed subject; do not offer `PREPOSITION` as the only correct role.

## Completion message

Arabic can express possession either with `لِـ`, an attached noun ending, or `عِنْدَ` plus a pronoun. You can now recognise the difference and use the most useful beginner pattern.

---

# Lesson 5 — Spoken Questions

**Stable ID:** `ch07-l05`  
**Template:** `SPOKEN_PHRASES`  
**Estimated time:** 8–9 minutes  
**Objective:** Use a small set of high-frequency classroom questions and answers.

## Quran hook

**Ta-Ha 20:17**  
`وَمَا تِلْكَ بِيَمِينِكَ يَا مُوسَى`

Keep the current hook. It naturally models “What is that in your hand?” and connects to the already learned demonstrative and attached-pronoun ideas.

## Spoken phrase set

Retain the existing stable phrase IDs and add only the missing feminine question:

1. `sp2-01` — `مَا هَذَا؟` — What is this?
2. `sp2-02` — `مَنْ هَذَا؟` — Who is this?
3. `sp2-03` — `أَيْنَ الْكِتَابُ؟` — Where is the book?
4. `sp2-04` — `أَعِنْدَكَ قَلَمٌ؟` — Do you have a pen? (male addressee)
5. `sp2-05` — `نَعَمْ، عِنْدِي قَلَمٌ` — Yes, I have a pen.
6. `sp2-06` — `لَا، لَيْسَ عِنْدِي` — No, I do not have it.
7. `sp2-07` — `أَعِنْدَكِ قَلَمٌ؟` — Do you have a pen? (female addressee)

`لَيْسَ` is recognition-only in this lesson. Do not teach its full conjugation; Chapter 22 or a dedicated later lesson can do that.

## Dialogue

Use the existing male dialogue and add a short female-address variation:

- A: `sp2-04`
- B: `sp2-05`
- A: `sp2-03`

Optional second pass:

- A: `sp2-07`
- B: `sp2-05`

There are no discovery cards or standard exercises for this template. Audio, phrase order, speaker labels, and replay must be verified in the app.

## Illustration

Generate a text-free classroom scene with two learners asking about an object and checking whether a pen is available. Do not generate speech bubbles or Arabic/Urdu writing.

## Completion message

You can now ask what, who, where, and whether someone has an object in simple Fus’ha classroom conversation.

---

# Lesson 6 — Chapter 7 Review

**Stable ID:** `ch07-l06`  
**Fixture:** `chapter-07-lesson-06-review.json`  
**Template:** `REVIEW`  
**Estimated time:** 9–10 minutes  
**Objective:** Consolidate the four attached-pronoun patterns and the spoken questions before the test.

## Review hook

Reuse **Al-An‘am 6:59**: `وَعِندَهُ مَفَاتِحُ الْغَيْبِ`. The review reveal should connect `عِنْدَهُ` with the earlier `ـُهُ` possession idea without introducing new grammar.

## Discovery cards

1. The four owner endings: `ـِي، ـُكَ / ـُكِ، ـُهُ / ـُهَا`.
2. `كِتَابِي` versus `كِتَابُكَ`.
3. `كِتَابُكَ` versus `كِتَابُكِ`.
4. `كِتَابُهُ` versus `كِتَابُهَا`.
5. Attached pronouns make nouns definite.
6. `لِي كِتَابٌ` versus `كِتَابِي`.
7. `عِنْدِي قَلَمٌ` and the male/female question forms.
8. Spoken question set: `مَا، مَنْ، أَيْنَ، أَعِنْدَكَ / أَعِنْدَكِ`.

## Exercises

1. Identify “my” in `كِتَابِي`.
2. Identify the male addressee in `كِتَابُكَ`.
3. Identify the female addressee in `كِتَابُكِ`.
4. Identify “his” in `قَلَمُهُ`.
5. Identify “her/its” in `مَدْرَسَتُهَا`.
6. Translate `عِنْدِي قَلَمٌ`.
7. Select the female question `أَعِنْدَكِ قَلَمٌ؟`.
8. Match `لِي كِتَابٌ` and `كِتَابِي` with their structures and meanings.
9. Build `نَعَمْ، عِنْدِي قَلَمٌ`.
10. Read one Quran phrase and identify the attached pronoun without requiring new morphology.

## Completion message

You have reviewed who owns something, who is being addressed, and how Arabic expresses “I have.” The final test checks these skills in mixed order.

---

# Lesson 7 — Chapter 7 Final Test

**Stable ID:** `ch07-test`  
**Fixture:** `chapter-07-lesson-07-final-test.json`  
**Template:** `REVIEW`  
**Assessment type:** `CHAPTER_TEST`  
**Questions:** 12  
**Pass mark:** 80% (10 correct answers required)  
**Purpose:** Unlock Chapter 8 after the learner demonstrates the chapter outcomes.

## Test coverage

1. Recognise `ـِي` as “my”.
2. Translate `كِتَابِي`.
3. Distinguish `ـُكَ` from `ـُكِ`.
4. Select the correct female-addressee form `كِتَابُكِ`.
5. Distinguish `ـُهُ` from `ـُهَا`.
6. Translate `مَدْرَسَتُهَا`.
7. Recognise that an attached pronoun makes the noun definite.
8. Translate `عِنْدِي قَلَمٌ`.
9. Select `أَعِنْدَكِ قَلَمٌ؟` for a female addressee.
10. Distinguish `لِي كِتَابٌ` from `كِتَابِي`.
11. Translate or identify one of `مَا هَذَا؟`, `مَنْ هَذَا؟`, or `أَيْنَ الْكِتَابُ؟`.
12. Identify an attached pronoun in a Quranic phrase, including `عِبَادِيَ` or `وَعِندَهُ`.

## Test construction rules

- Use stable question IDs such as `ch07-test-q01` through `ch07-test-q12`.
- Each question must have one unambiguous correct answer and plausible distractors from already taught forms.
- Include English and Urdu for every prompt and option; Arabic options must use the exact vocalized form.
- Do not test `لَيْسَ` conjugation, plural pronouns, `الَّذِي`, or advanced case terminology.
- Keep pass/fail authoritative on the server. The client may display the result but must not unlock Chapter 8 independently.

## Completion behavior

- On pass, mark the chapter test complete and unlock Chapter 8 according to the existing course rules.
- On failure, allow retry without deleting prior lesson progress.
- Preserve all existing XP and completion records.

---

## 5. Validation and implementation gate

Implementation may begin only after this proposal is approved.

### Content checks

1. Update the five existing fixtures without changing their stable IDs.
2. Add the review and final-test fixtures with the new IDs.
3. Update `seed.cjs` only for the two new lesson rows and approved content edits.
4. Run `npm run db:validate-fixtures`.
5. Run `npm run quran:audit-fixtures`.
6. Run `npm run db:audit-urdu`.
7. Run `npm run content:check` before any sync.

### Media checks

1. Generate the five approved discovery/review illustrations with the image-generation workflow.
2. Confirm each image is text-free, 768px WebP, and attached to the correct card.
3. Regenerate audio for every changed Arabic string and confirm playback.
4. Confirm Quran audio and highlight indices match the referenced verse.

### Runtime checks

1. Seed isolated staging only.
2. Open Chapter 7 in the emulator with a clean test account.
3. Complete Lessons 1–5 and verify every card, exercise, phrase, audio button, and image.
4. Complete the review and submit the final test with all answers correct; confirm it passes and Chapter 8 unlocks.
5. Submit a failing test; confirm it does not unlock Chapter 8 and can be retried.
6. Verify a second account on the same device has independent progress.
7. Report staging and emulator evidence before requesting production promotion.

## 6. Out of scope

- No changes to Chapters 1–6.
- No changes to Chapter 19’s advanced morphology content.
- No changes to the global lesson player or test engine unless a Chapter 7-specific defect is proven.
- No production seed or production content promotion until the owner separately approves the verified staging result.

---

# Implementation notes (2026-09-18)

Built as `warsh-backend/prisma/fixtures/chapter-07-lesson-0[1-7]*.json`:
`ch07-l01..l04` rewritten in place to the 9-card / 7–8-exercise shape above,
`ch07-l05` extended with `sp2-07` and the second dialogue pass, `ch07-l06`
(review, 8 cards / 10 exercises) and `ch07-test` (12 questions) added. Seed
rows, the chapter spec in `curriculum-book1.cjs`, and
`npm run content:promote-chapter-seven` mirror Chapter 6's scoped promotion
(five in-place updates, two creates, learner progress untouched). Fixture,
Quran and Urdu audits pass; one phrase clip (`audio/phrases/a-indaki-qalam.mp3`)
and the missing catalogue clips were generated. Deviations from the text
above, each forced by the runtime or the pipeline:

1. **Test blueprint rows** all render as the chapter-test multiple-choice
   format (the only format `assessment.questions` supports); the exact
   blueprint answer is the correct option.
2. **Pass mark is 80 % (10 of 12)** — the proposal's own test section already
   says 80 %; §1 outcome 8 mentions 70 %, which is the per-lesson
   `LESSON_PASS_PERCENT`, not the chapter-test rule. Chapters 3–6 use 80 %.
3. **Quran recognition exercises** (`ch07-l01-ex07`, `ch07-l03-ex07`,
   `ch07-l06-ex10`) use `MATCH_AYAH`, which shows the fragment without
   synthesized recitation. The "Quran checkpoint" discover cards point their
   audio at the everyayah recitation of the whole hook ayah rather than a TTS
   clip of the fragment.
4. **Lesson 4 exercise 8** keeps `POSSESSIVE` + `SUBJECT` as the correct roles
   for `عِنْدِي قَلَمٌ`; `PREPOSITION` is offered only as a distractor.
5. **Illustrations.** The five media-plan scenes are tracked card by card in
   `Docs/lesson-illustrations-needed.md` (+ `.csv`). Existing discover assets
   are reused where the word matches (`kitab`, `qalam`, `bayt`, `madrasa`,
   `umm`); the dictionary illustration for `اِسْم` was copied to
   `images/discover/ism.webp` (768 px WebP, text-free). The `رَبّ` and `دِين`
   dictionary badges carry generated Arabic lettering and were rejected. The
   `SPOKEN_PHRASES` template has no card slot for an image, so the Lesson 5
   classroom scene is attached to the review card that recaps the question set.
6. **No `VocabularyWord` rows** were added; `اِسْم` and `بَيْت` are carried by
   the cards (`بَيْت` is not vocab-linked because `arabicPlain: بيت` resolves to
   `بَيَّتَ`).
7. **Titles.** `ch07-l04` → "Possession with عِنْدَ", `ch07-l05` → "Simple
   Questions" (was "SP2 - Simple Questions"); Lessons 1–3 keep their existing
   titles. Chapter row → "Attached Pronouns and Simple Possession" with the
   Urdu title and description from §1.
8. **Lesson 3 reveal** highlights all three words of Ash-Shams 91:8 (the
   previous fixture pointed at an out-of-range fourth index).
9. **Urdu labels** follow §4: `(مذکر مخاطب)` / `(مؤنث مخاطب)` for the
   addressee and `(مذکر مالک)` / `(مؤنث مالک)` for the owner wherever the
   form alone would be ambiguous in Urdu.
