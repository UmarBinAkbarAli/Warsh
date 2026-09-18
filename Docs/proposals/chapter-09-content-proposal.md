# Chapter 9 — Complete Content Proposal

**Status:** Implemented in isolated staging 2026-09-18 from this proposal; production promotion pending owner approval  
**Chapter position:** Chapter 9  
**Working title:** **Plural Nouns and `هٰؤُلَاءِ`**  
**Urdu title:** **جمع کے اسماء اور `هٰؤُلَاءِ`**

## 1. Chapter purpose

Chapter 9 gives the learner a controlled beginner introduction to the three main plural families:

- sound masculine plural: `ـُونَ`
- sound feminine plural: `ـَات`
- common broken plurals whose internal shape changes

It then teaches `هٰؤُلَاءِ` for pointing to a nearby group of people.

The chapter is for recognition and basic usage. It must not attempt every plural rule, full case inflection, non-human plural agreement, number grammar, or complete verb conjugation.

### End-of-chapter outcome

After Chapter 9, the learner should be able to:

1. Recognise common sound masculine plurals in the nominative `ـُونَ` form.
2. Understand that this pattern commonly describes masculine human nouns or adjectives, and may represent a mixed group.
3. Form and recognise common sound feminine plurals by replacing `ة` with `ات`.
4. Recognise common broken-plural word families such as `كِتَابٌ / كُتُبٌ`.
5. Distinguish a sound plural ending from an internally changed broken plural.
6. Use `هٰؤُلَاءِ` for a nearby group of people.
7. Build simple plural sentences such as `هٰؤُلَاءِ مُسْلِمُونَ` and `هٰؤُلَاءِ طَالِبَاتٌ`.
8. Avoid confusing the noun `مُؤْمِنُونَ` (“believers”) with the verb `يُؤْمِنُونَ` (“they believe”).
9. Pass a 12-question final test with the existing 80% server-enforced pass rule.

## 2. Curriculum-boundary decisions

- Chapter 8 introduces the singular feminine past form. Chapter 9 must not expand that into a complete past-tense conjugation table.
- Chapter 10 introduces plural pronouns. Chapter 9 may use a plural noun but must not pre-teach the Chapter 10 pronoun system.
- Chapter 13 currently repeats sound masculine, sound feminine, and broken plurals. Chapter 9 remains the first introduction because Chapter 10 depends on plural recognition. Chapter 13 should later be reframed as expanded plural recognition and non-human-plural behavior rather than a second introduction.
- Chapter 14 teaches adjective agreement with human and non-human plurals. Chapter 9 may use one simple plural predicate, but must not teach the full agreement system.
- Chapter 15 expands demonstratives with `أُولَٰئِكَ`. Chapter 9 teaches only the nearby human plural `هٰؤُلَاءِ`.
- Number constructions such as `ثَلَاثَةُ كُتُبٍ` are out of scope and must be removed from Chapter 9.

## 3. Final chapter structure

| Display order | Stable lesson ID | Fixture file | Template | Title | Main outcome | Cards | Exercises |
|---:|---|---|---|---|---|---:|---:|
| 1 | `ch09-l01` | `chapter-09-lesson-01.json` | `STANDARD` | Sound Masculine Plural — `ـُونَ` | Recognise common masculine human plurals | 9 | 7 |
| 2 | `ch09-l02` | `chapter-09-lesson-02.json` | `STANDARD` | Sound Feminine Plural — `ـَات` | Recognise and form common feminine plurals | 9 | 7 |
| 3 | `ch09-l03` | `chapter-09-lesson-03.json` | `STANDARD` | Common Broken Plurals | Learn frequent singular/plural word families | 9 | 7 |
| 4 | `ch09-l04` | `chapter-09-lesson-04.json` | `STANDARD` | Nearby People — `هٰؤُلَاءِ` | Point to male, female, or mixed human groups | 9 | 7 |
| 5 | `ch09-l05` | `chapter-09-lesson-05-review.json` | `REVIEW` | Chapter 9 Review | Consolidate all plural families and `هٰؤُلَاءِ` | 8 | 10 |
| 6 | `ch09-test` | `chapter-09-lesson-06-final-test.json` | `REVIEW` | Chapter 9 Final Test | Prove mastery and unlock Chapter 10 | — | 12 |

Existing IDs `ch09-l01` through `ch09-l05` remain stable. The current `ch09-l05` verb-pattern lesson is replaced by the Chapter 9 review while preserving its ID and learner progress. Only `ch09-test` is a new stable ID.

### Fixture and display-order identity map

| Fixture file | Stable ID | `_meta.lesson_order` | Database display order |
|---|---|---:|---:|
| `chapter-09-lesson-01.json` | `ch09-l01` | 1 | 1 |
| `chapter-09-lesson-02.json` | `ch09-l02` | 2 | 2 |
| `chapter-09-lesson-03.json` | `ch09-l03` | 3 | 3 |
| `chapter-09-lesson-04.json` | `ch09-l04` | 4 | 4 |
| `chapter-09-lesson-05-review.json` | `ch09-l05` | 5 | 5 |
| `chapter-09-lesson-06-final-test.json` | `ch09-test` | 6 | 6 |

The obsolete filename `chapter-09-lesson-05-verb-pattern.json` should be replaced by `chapter-09-lesson-05-review.json` only during approved implementation. Update the seed import and verify that no active code references the old filename before removing it.

## 4. Shared implementation rules

- Preserve all five existing stable lesson IDs and every existing learner-progress record.
- Keep `Lesson.content` inside the canonical lesson schema. Do not create a second schema in documentation or code.
- Do not say that every masculine noun takes `ـُونَ`; teach it as a common sound plural for masculine human nouns and adjectives.
- Teach `ـُونَ` as the nominative recognition form used in this chapter. `ـِينَ` and full case behavior are later material.
- Do not say that every feminine noun becomes plural by replacing `ة` with `ات`; teach this as a common regular pattern.
- Broken plurals are learned as vocabulary families here, not generated through advanced patterns.
- Teach `هٰؤُلَاءِ` for nearby rational/human groups. Do not generalise it to every non-human plural.
- Any changed Arabic string requires audio regeneration because lesson audio is keyed by Arabic text.
- Illustrations must be generated through the approved image-generation workflow, not Pencil. Images must be text-free, culturally appropriate, and exported as 768px WebP.
- Every matching exercise must contain exactly the forms being asked about; no required answer may be absent from its answer column.
- Quran text, reference, translation, audio, and highlighted indices must be verified after editing.

---

# Lesson 1 — Sound Masculine Plural: `ـُونَ`

**Stable ID:** `ch09-l01`  
**Template:** `STANDARD`  
**Estimated time:** 10 minutes  
**Objective:** Recognise common sound masculine human plurals in the nominative `ـُونَ` form.  
**Scope boundary:** Do not teach `ـِينَ` or full case inflection.

## Quran hook

**Al-Hujurat 49:10**  
`إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ`

- Meaning: “The believers are but brothers.”
- Highlight `الْمُؤْمِنُونَ`.
- This replaces the current verb hook `يُؤْمِنُونَ` so the lesson begins with an actual plural noun.
- `إِخْوَةٌ` may be translated in the verse but is not introduced as another active plural pattern.

## Discovery cards

1. **One person and a group**  
   `مُسْلِمٌ` = one Muslim man; `مُسْلِمُونَ` = Muslim men / Muslims.

2. **The visible ending**  
   `ـُونَ` is the sound masculine plural ending actively recognised in this lesson.

3. **Believer and believers**  
   `مُؤْمِنٌ / مُؤْمِنُونَ`.

4. **Teacher and teachers**  
   `مُعَلِّمٌ / مُعَلِّمُونَ`.

5. **Why it is called sound**  
   The main word remains recognisable and a regular ending is added.

6. **Human scope**  
   This pattern commonly applies to masculine human nouns and adjectives; it is not the plural of every masculine word.

7. **Mixed groups**  
   Arabic may use the masculine plural form for a group containing men and women. Keep this as recognition, not social commentary.

8. **Nominative form only**  
   The learner recognises `ـُونَ` here. Other case endings are introduced later.

9. **Quran checkpoint**  
   Identify the singular base inside `الْمُؤْمِنُونَ` and locate the plural ending.

## Vocabulary retained or introduced

Retain `مُسْلِمٌ` and `مُؤْمِنٌ`. Introduce/reinforce `مُسْلِمُونَ، مُؤْمِنُونَ، مُعَلِّمٌ، مُعَلِّمُونَ`. `هٰؤُلَاءِ` must not appear yet because Lesson 4 teaches it.

## Illustration

Generate a text-free visual comparing one male learner with a nearby group of male or mixed learners. The app supplies the Arabic singular/plural labels.

## Exercises

1. Translate `مُسْلِمُونَ` → “Muslims / Muslim men.”
2. Translate `مُؤْمِنُونَ` → “believers / believing men.”
3. True/false: `مُؤْمِنُونَ` keeps the base word recognisable and adds `ـُونَ`. → True.
4. Fill `مُسْلِمٌ → ___` → `مُسْلِمُونَ`.
5. Match three singular forms with their sound masculine plurals.
6. Classify `مُؤْمِنُونَ` as a sound masculine plural noun, not the verb `يُؤْمِنُونَ`.
7. Quran recognition: select `الْمُؤْمِنُونَ` in Al-Hujurat 49:10.

## Completion message

You can now recognise a common Quranic human-plural pattern through `ـُونَ`, while knowing that it is not the plural rule for every masculine noun.

---

# Lesson 2 — Sound Feminine Plural: `ـَات`

**Stable ID:** `ch09-l02`  
**Template:** `STANDARD`  
**Estimated time:** 10 minutes  
**Objective:** Recognise and form common sound feminine plurals by replacing singular `ة` with `ات`.

## Quran hook

**At-Tawbah 9:71**  
`وَالْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ بَعْضُهُمْ أَوْلِيَاءُ بَعْضٍ`

- Keep the existing verse.
- Highlight `الْمُؤْمِنَاتُ` for the active lesson objective.
- Briefly contrast it with the already learned `الْمُؤْمِنُونَ` without teaching plural agreement beyond the two nouns.

## Discovery cards

1. **The common feminine pattern**  
   Many feminine nouns ending in `ة` replace it with `ات` in the sound plural.

2. **Female student / female students**  
   `طَالِبَةٌ / طَالِبَاتٌ`.

3. **Female teacher / female teachers**  
   `مُعَلِّمَةٌ / مُعَلِّمَاتٌ`.

4. **Believing woman / believing women**  
   `مُؤْمِنَةٌ / مُؤْمِنَاتٌ`.

5. **Muslim woman / Muslim women**  
   `مُسْلِمَةٌ / مُسْلِمَاتٌ`.

6. **Why it is sound**  
   The word remains recognisable while the ending changes regularly.

7. **Masculine/feminine contrast**  
   `مُؤْمِنُونَ` identifies a masculine or mixed group; `مُؤْمِنَاتٌ` identifies a female group.

8. **Do not overgeneralise**  
   This is a common pattern, not a promise that every feminine noun forms its plural this way.

9. **Quran checkpoint**  
   Locate `ات` in `الْمُؤْمِنَاتُ` and compare it with `ون` in `الْمُؤْمِنُونَ`.

## Vocabulary

Retain the existing `طَالِبَةٌ، مُعَلِّمَةٌ، مُؤْمِنَةٌ` families. Add `مُسْلِمَةٌ / مُسْلِمَاتٌ` only if the vocabulary catalogue already supports or intentionally adds them.

## Illustration

Generate a text-free comparison between one female learner and a group of female learners/teachers. Avoid stereotypical clothing or professions; the purpose is singular versus plural.

## Exercises

1. Translate `طَالِبَاتٌ` → “female students.”
2. Translate `مُؤْمِنَاتٌ` → “believing women.”
3. True/false: in this common pattern, singular `ة` is replaced by plural `ات`. → True.
4. Fill `طَالِبَةٌ → ___` → `طَالِبَاتٌ`.
5. Match four feminine singular/plural pairs.
6. Build `الطَّالِبَاتُ مُجْتَهِدَاتٌ`, with the plural predicate explained only at recognition level.
7. Quran recognition: select `الْمُؤْمِنَاتُ` in At-Tawbah 9:71.

## Completion message

You can now recognise the common `ات` feminine plural pattern and distinguish it from the masculine `ون` pattern.

---

# Lesson 3 — Common Broken Plurals

**Stable ID:** `ch09-l03`  
**Template:** `STANDARD`  
**Estimated time:** 10–11 minutes  
**Objective:** Recognise frequent broken-plural word families without introducing advanced plural patterns or number grammar.

## Quran hook

**An-Nur 24:36**  
`فِي بُيُوتٍ أَذِنَ اللَّهُ أَنْ تُرْفَعَ`

- Meaning: “In houses which Allah has permitted to be raised.”
- Highlight `بُيُوتٍ`.
- This replaces `بُيُوتِكُمْ` so the learner is not distracted by the untaught plural attached pronoun `كُمْ`.
- The case ending on `بُيُوتٍ` is recognition only; do not turn the lesson into a case lesson.

## Discovery cards

1. **What is a broken plural?**  
   The inside shape changes instead of simply receiving one regular plural ending.

2. **Book / books**  
   `كِتَابٌ / كُتُبٌ`.

3. **House / houses**  
   `بَيْتٌ / بُيُوتٌ`.

4. **Student / students**  
   `طَالِبٌ / طُلَّابٌ`.

5. **Masjid / masjids**  
   `مَسْجِدٌ / مَسَاجِدُ`.

6. **Sound versus broken**  
   `مُسْلِمُونَ` adds a visible ending; `كُتُبٌ` changes inside.

7. **Learn word families**  
   Broken plurals cannot all be calculated from one beginner rule; learn each frequent pair together.

8. **Recognition before agreement**  
   The special feminine-singular agreement of non-human plurals belongs to Chapter 13/14, not this lesson.

9. **Quran checkpoint**  
   Locate `بُيُوتٍ` and connect it to the singular `بَيْتٌ`.

## Vocabulary

Retain `كِتَابٌ / كُتُبٌ، بَيْتٌ / بُيُوتٌ، طَالِبٌ / طُلَّابٌ، مَسْجِدٌ / مَسَاجِدُ`. Do not introduce `ثَلَاثَةُ` or any number construction.

## Illustration

Generate one text-free four-panel image showing one/many books, houses, students, and masjids. The image should communicate singular versus plural without labels.

## Exercises

1. Translate `كُتُبٌ` → “books.”
2. Translate `بُيُوتٌ` → “houses.”
3. True/false: a broken plural changes the internal shape of the word. → True.
4. Match the four singular nouns with their broken plurals.
5. Fill `كِتَابٌ → ___` → `كُتُبٌ`.
6. Classify `مُسْلِمُونَ` as sound and `طُلَّابٌ` as broken.
7. Quran recognition: select `بُيُوتٍ` and identify its singular family.

## Completion message

You can now recognise four high-frequency broken-plural families without guessing a rule that does not exist for every word.

---

# Lesson 4 — Nearby People: `هٰؤُلَاءِ`

**Stable ID:** `ch09-l04`  
**Template:** `STANDARD`  
**Estimated time:** 10 minutes  
**Objective:** Use `هٰؤُلَاءِ` to point to a nearby group of people.  
**Scope boundary:** Non-human plural demonstratives and far plural `أُولَٰئِكَ` are later topics.

## Quran hook

**Al-Kahf 18:15**  
`هَٰؤُلَاءِ قَوْمُنَا اتَّخَذُوا مِن دُونِهِ آلِهَةً`

- Keep the existing verse.
- Highlight `هَٰؤُلَاءِ`.
- Explain only the opening phrase `هَٰؤُلَاءِ قَوْمُنَا` — “These are our people.” The remaining verbal clause is context, not active grammar.

## Discovery cards

1. **Recall nearby singular pointing**  
   `هٰذَا` = this masculine; `هٰذِهِ` = this feminine.

2. **Nearby human plural**  
   `هٰؤُلَاءِ` = these people / these.

3. **A masculine or mixed group**  
   `هٰؤُلَاءِ مُسْلِمُونَ` = These are Muslims.

4. **A female group**  
   `هٰؤُلَاءِ طَالِبَاتٌ` = These are female students.

5. **A broken human plural**  
   `هٰؤُلَاءِ طُلَّابٌ` = These are students.

6. **Arabic needs no separate “are”**  
   `هٰؤُلَاءِ + plural noun/predicate` forms the simple sentence.

7. **Ask who**  
   `مَنْ هٰؤُلَاءِ؟` = Who are these people?

8. **Human/rational scope**  
   At this stage, use `هٰؤُلَاءِ` for people. Non-human plural agreement is intentionally deferred.

9. **Quran checkpoint**  
   Read `هَٰؤُلَاءِ قَوْمُنَا` as one pointing phrase.

## Vocabulary

Reuse `مُسْلِمُونَ، طَالِبَاتٌ، طُلَّابٌ` from Lessons 1–3. `قَوْمٌ` appears for Quran recognition as “people/community.”

## Illustration

Generate a text-free scene showing one speaker indicating a nearby group containing male, female, or mixed learners. The app supplies the demonstrative and sentence text.

## Exercises

1. Translate `هٰؤُلَاءِ` → “these people / these.”
2. True/false: this lesson uses `هٰؤُلَاءِ` for a nearby group of people. → True.
3. Match `هٰذَا، هٰذِهِ، هٰؤُلَاءِ، مَنْ` with exact meanings.
4. Fill `___ مُسْلِمُونَ` → `هٰؤُلَاءِ`.
5. Build `هٰؤُلَاءِ مُسْلِمُونَ`.
6. Translate `مَنْ هٰؤُلَاءِ؟`.
7. Grammar parse `هٰؤُلَاءِ طُلَّابٌ` → DEMONSTRATIVE/SUBJECT FUNCTION + PREDICATE.

## Completion message

You can now point to nearby groups of people and combine `هٰؤُلَاءِ` with each plural family learned in this chapter.

---

# Lesson 5 — Chapter 9 Review

**Stable ID:** `ch09-l05`  
**Fixture:** `chapter-09-lesson-05-review.json`  
**Template:** `REVIEW`  
**Estimated time:** 9–10 minutes  
**Objective:** Consolidate the three plural families and `هٰؤُلَاءِ` before the final test.

## Replacement decision

This review replaces the current `VERB_PATTERN` lesson. The following current claims/content must be removed from Chapter 9:

- “full past tense” with only six forms
- the incomplete `ذَهَبَ` conjugation table
- the claim that every Quranic past verb follows exactly the same three-letter pattern
- incorrect Urdu such as `ذَهَبَتْ = وہ چلا گیا`
- Chapter 10 pronouns introduced before their planned lesson

The past-tense paradigm should be taught later in its proper verb-conjugation sequence.

## Review hook

Reuse **At-Tawbah 9:71** and focus on the paired plural nouns:

`وَالْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ`

This allows the learner to compare `ون` and `ات` before reviewing broken plurals and `هٰؤُلَاءِ`.

## Discovery cards

1. The three plural families: sound masculine, sound feminine, and broken.
2. `مُسْلِمٌ / مُسْلِمُونَ`.
3. `مُؤْمِنَةٌ / مُؤْمِنَاتٌ`.
4. `كِتَابٌ / كُتُبٌ` and `بَيْتٌ / بُيُوتٌ`.
5. Sound ending versus changed internal shape.
6. `هٰؤُلَاءِ` with masculine/mixed human groups.
7. `هٰؤُلَاءِ` with female human groups.
8. Noun `مُؤْمِنُونَ` versus verb `يُؤْمِنُونَ` as recognition only.

## Exercises

1. Identify `ـُونَ` in `مُسْلِمُونَ`.
2. Identify `ـَات` in `مُؤْمِنَاتٌ`.
3. Match sound masculine singular/plural pairs.
4. Match sound feminine singular/plural pairs.
5. Match four broken-plural word families.
6. Classify examples as sound masculine, sound feminine, or broken.
7. Select `هٰؤُلَاءِ` for a nearby human group.
8. Build `هٰؤُلَاءِ طَالِبَاتٌ`.
9. Distinguish `مُؤْمِنُونَ` from `يُؤْمِنُونَ`.
10. Recognise the plural form inside one taught Quran phrase.

## Completion message

You have reviewed how Arabic marks regular human plurals, changes common words into broken plurals, and points to nearby groups of people.

---

# Lesson 6 — Chapter 9 Final Test

**Stable ID:** `ch09-test`  
**Fixture:** `chapter-09-lesson-06-final-test.json`  
**Template:** `REVIEW`  
**Assessment type:** `CHAPTER_TEST`  
**Questions:** 12  
**Pass mark:** 80% (10 correct answers required)  
**Purpose:** Prove Chapter 9 mastery and unlock Chapter 10.

## Test coverage

1. Recognise a sound masculine plural ending in `ـُونَ`.
2. Match `مُسْلِمٌ` with `مُسْلِمُونَ`.
3. Recognise a sound feminine plural ending in `ـَات`.
4. Match `طَالِبَةٌ` with `طَالِبَاتٌ`.
5. Distinguish `مُؤْمِنُونَ` from `مُؤْمِنَاتٌ`.
6. Identify `كُتُبٌ` as the plural of `كِتَابٌ`.
7. Identify `بُيُوتٌ` as the plural of `بَيْتٌ`.
8. Distinguish a sound plural from a broken plural.
9. Select `هٰؤُلَاءِ` for a nearby group of people.
10. Translate `هٰؤُلَاءِ مُسْلِمُونَ`.
11. Translate or build `هٰؤُلَاءِ طَالِبَاتٌ`.
12. Identify one taught plural inside a Quranic phrase.

## Test construction rules

- Use stable question IDs `ch09-test-q01` through `ch09-test-q12`.
- Every question must have one unambiguous answer and distractors from taught material only.
- Include accurate English and natural Urdu for every prompt and option.
- Do not test `ـِينَ`, dual forms, plural pronouns, number grammar, non-human plural agreement, `أُولَٰئِكَ`, or past-tense conjugation.
- Keep test scoring and chapter unlocking authoritative on the server.

## Completion behavior

- Passing marks the test complete and unlocks Chapter 10 according to existing server rules.
- Failing leaves Chapter 10 locked and allows retry.
- Retrying must not remove completed lessons, XP, or earlier chapter progress.

---

## 5. Illustration plan

| Lesson | Required generated visual | Purpose |
|---|---|---|
| 1 | One male learner versus a male/mixed group | Show sound masculine singular/plural |
| 2 | One female learner versus a female group | Show sound feminine singular/plural |
| 3 | One/many books, houses, students, and masjids | Reinforce broken-plural word families |
| 4 | A speaker pointing to a nearby human group | Explain `هٰؤُلَاءِ` |
| Review | Reuse approved Chapter 9 illustrations | Avoid unnecessary duplicate media |

All illustrations must be generated through image generation, reviewed visually, converted to 768px WebP, uploaded to the approved media host, and verified inside the emulator.

## 6. Validation and implementation gate

Implementation may begin only after this proposal is approved.

### Content implementation

1. Update Lessons 1–4 without changing their stable IDs.
2. Replace the Lesson 5 verb-pattern fixture with the approved review fixture while retaining ID `ch09-l05`.
3. Add the final-test fixture with ID `ch09-test`.
4. Update the seed import and Lesson 5 template from `VERB_PATTERN` to `REVIEW`.
5. Add the final-test seed row at display order 6.
6. Preserve all unrelated working-tree changes.

### Automated checks

1. Run `npm run db:validate-fixtures`.
2. Run `npm run quran:audit-fixtures`.
3. Run `npm run db:audit-urdu`.
4. Run `npm run content:check` before any fixture-to-database sync.
5. Run backend tests/build and app type-check/lint if shared behavior changes.

### Media checks

1. Generate and approve the four planned illustrations.
2. Confirm each image is text-free, 768px WebP, correctly cropped, and linked to the correct discovery card.
3. Regenerate audio for every changed Arabic string.
4. Confirm Quran audio, text, reference, translation, and highlight indices.
5. Confirm removal of the old verb-pattern content leaves no learner-facing broken audio or media references.

### Staging and emulator checks

1. Publish Chapter 9 only to the isolated staging database.
2. Open the chapter with a clean test account.
3. Complete every discovery card and exercise in Lessons 1–5.
4. Verify images, Arabic, Urdu, audio, matching answers, and sentence-building order.
5. Confirm Lesson 4 is the first active introduction of `هٰؤُلَاءِ` in this chapter.
6. Pass the final test and confirm Chapter 10 unlocks.
7. Fail the final test and confirm Chapter 10 remains locked and retry works.
8. Verify progress remains account-specific across two accounts on one device.
9. Report staging and emulator evidence before production promotion.

## 7. Out of scope

- No full past-tense conjugation table.
- No plural pronoun lesson; Chapter 10 owns that topic.
- No number grammar such as `ثَلَاثَةُ كُتُبٍ`.
- No non-human plural agreement rule; Chapters 13–14 own the deeper treatment.
- No far plural demonstrative `أُولَٰئِكَ`; Chapter 15 owns that topic.
- No changes to Chapter 13 in this implementation, although its duplicated introduction should be corrected during the Chapter 13 audit.
- No production seed or production promotion without separate approval after staging verification.


# Implementation notes (2026-09-18)

Built as `warsh-backend/prisma/fixtures/chapter-09-lesson-0[1-6]*.json`:
`ch09-l01..l04` rewritten in place to the 9-card / 7-exercise shape above;
`ch09-l05` keeps its ID but becomes the review (8 cards / 10 exercises,
`REVIEW` template) and `chapter-09-lesson-05-verb-pattern.json` is removed;
`ch09-test` (12 questions, 80 %) added. Seed rows, the chapter spec in
`curriculum-book1.cjs` (title, Urdu title, Arabic title, description, hook) and
`npm run content:promote-chapter-nine` mirror Chapter 8's scoped promotion
(five in-place updates, one create, learner progress untouched). Fixture, Quran
(49:10 and 24:36 verified against the Imlaei text) and Urdu audits pass; the 26
new catalogue clips were generated (text-hash keyed, shared R2), 56/56 targets
present. Verified on the emulator against staging (Lesson 1 end to end — hook,
all cards, every exercise type including a wrong answer, reveal, close; every
card of Lessons 2–4 and the review with images and audio; Lesson 3 exercises
1–6; the test intro and first questions) and through the API on a fresh account
(test locked until the five lessons are done, 0/12 and 9/12 fail, 10/12 passes
and marks the chapter complete; the answer key is not in the lesson response).
Deviations from the text above:

1. **Test blueprint rows** render as the chapter-test multiple-choice format;
   Q11 ("translate or build") is recognition with the target sentence as an
   option, as in Chapter 8.
2. **Player direction rule, extended.** Beyond the fields Chapter 8 recorded,
   a `TRUE_FALSE` `statement.en` and every `explanation_on_wrong.en` are also
   rendered without a forced direction: one that opens with an Arabic word is
   laid out right-to-left and reads scrambled. All 23 such strings in this
   chapter were rewritten to open with English ("The word مُؤْمِنُونَ …"). The
   same defect exists in the live Chapter 8 fixtures (e.g. `ch08-l01-ex02`
   "قَالَ is 'he said'…") and is not fixed here.
3. **"Classify" rows** (L1 ex 6, L3 ex 6, review ex 6 and 9) use `TRUE_FALSE`
   or a `TAP_TRANSLATION` whose options name the family, since the schema has
   no classification exercise. **Matching** rows pair Arabic forms with
   English meanings (the right column is text-only), four pairs each.
4. **Fill-blank transformations** use `مُسْلِمٌ ← ___` (arrow pointing at the
   blank in the RTL layout), the form already used in `chapter-09-lesson-02`.
5. **`مُسْلِمَةٌ / مُسْلِمَاتٌ`** is kept as Lesson 2 card 5 for the
   masculine/feminine symmetry; no `VocabularyWord` row was added (same policy
   as Chapter 8, deviation 6). No vocabulary rows were added for any word.
6. **Illustrations.** Existing discover assets are reused where the word
   matches (`kitab`, `bayt`, `talib`, `masjid`, `hadha-v2`); the text-free
   dictionary illustrations for `مُؤْمِنَة` and `قَوْم` were copied to
   `images/discover/mumina.webp` and `qawm.webp` (768 px WebP). The `مُسْلِم`
   and `مُؤْمِن` dictionary badges carry generated lettering and the `مُعَلِّم`
   one reads as a shopkeeper, so they were not used. The four media-plan scenes
   are tracked in `Docs/lesson-illustrations-needed.md` (+ `.csv`) as owner
   deliverables.
7. **Titles.** `ch09-l01` → "Sound Masculine Plural — ـُونَ", `ch09-l02` →
   "Sound Feminine Plural — ـَات", `ch09-l03` → "Common Broken Plurals",
   `ch09-l04` → "Nearby People — هٰؤُلَاءِ". Chapter row → "Plural Nouns and
   هٰؤُلَاءِ" with the Urdu title from the header and a description in both
   languages.
8. **Chapter 10 unlocking** could not be observed on staging because that
   backend runs with `DEV_UNLOCK_ALL=true`; the chapter's `isCompleted` flag,
   which drives the unlock in `lib/course.ts`, flipped to true on the 10/12
   pass and stayed false after both failures.
