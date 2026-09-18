# Chapter 8 — Complete Content Proposal

**Status:** Proposed for product-owner review; not implemented  
**Chapter position:** Chapter 8  
**Working title:** **Feminine Past Verbs and `الَّتِي`**  
**Urdu title:** **مؤنث ماضی کے افعال اور `الَّتِي`**

## 1. Chapter purpose

Chapter 8 introduces the third-person feminine singular past-tense verb and the feminine relative pronoun `الَّتِي`. It then combines these with the attached pronouns learned in Chapter 7.

The chapter must teach a precise beginner rule:

- `ذَهَبَ` — he went
- `ذَهَبَتْ` — she went
- `الْبِنْتُ الَّتِي ذَهَبَتْ` — the girl who went

The chapter must not claim that every feminine past-tense form ends in `تْ`. The active rule here is specifically the third-person feminine singular form: “she did.”

### End-of-chapter outcome

After Chapter 8, the learner should be able to:

1. Recognise `تْ` as the third-person feminine singular past-tense marker.
2. Distinguish pairs such as `ذَهَبَ / ذَهَبَتْ` and `قَالَ / قَالَتْ`.
3. Transfer the same pattern to `رَجَعَتْ، جَلَسَتْ، دَخَلَتْ`.
4. Understand why `تْ` may be pronounced `تِ` during connected reading, as in `قَالَتِ اخْرُجْ`.
5. Recognise and use `الَّتِي` with a feminine singular noun.
6. Distinguish `الَّذِي` from `الَّتِي`.
7. Read a noun phrase such as `أُمِّي الَّتِي رَجَعَتْ` without confusing it with a complete sentence.
8. Build complete sentences such as `رَجَعَتْ أُمِّي إِلَى الْبَيْتِ`.
9. Pass a 12-question final test with the existing 80% server-enforced pass rule.

## 2. Later-curriculum overlap decision

- Chapter 6 introduces `الَّذِي`. Chapter 8 builds directly on it by introducing the feminine counterpart `الَّتِي`.
- Chapter 7 introduces attached pronouns such as `ـِي` and `ـُهُ`. Chapter 8 applies them in `أُمِّي` and `أُمُّهُ`; it must not reteach the entire attached-pronoun chapter.
- Chapter 9 introduces the wider past-tense conjugation table. Chapter 8 teaches only “he” versus “she” forms and must not introduce all persons or plural forms.
- Chapter 17 and Chapter 37 contain later feminine-verb practice. They should remain advanced reinforcement rather than a second beginner introduction.
- Chapter 18 provides deeper `الَّذِي / الَّتِي` practice. Chapter 8 establishes the beginner foundation only.
- No spoken-dialogue lesson is added here because conversational question-and-answer material belongs in the planned dedicated conversation chapter.

## 3. Final chapter structure

| Display order | Stable lesson ID | Fixture file | Template | Title | Main outcome | Cards | Exercises |
|---:|---|---|---|---|---|---:|---:|
| 1 | `ch08-l01` | `chapter-08-lesson-01.json` | `STANDARD` | She Went — `ذَهَبَتْ` | Recognise the feminine singular past marker | 9 | 7 |
| 2 | `ch08-l02` | `chapter-08-lesson-02.json` | `STANDARD` | The Same Marker Across Verbs | Apply the pattern and understand connected `تِ` | 9 | 7 |
| 3 | `ch08-l03` | `chapter-08-lesson-03.json` | `STANDARD` | `الَّتِي` — Feminine Relative | Connect feminine nouns to descriptions | 10 | 7 |
| 4 | `ch08-l04` | `chapter-08-lesson-04.json` | `STANDARD` | My Mother — Feminine Integration | Combine pronouns, `الَّتِي`, and feminine verbs | 9 | 8 |
| 5 | `ch08-l05` | `chapter-08-lesson-05-review.json` | `REVIEW` | Chapter 8 Review | Consolidate all four lessons | 8 | 10 |
| 6 | `ch08-test` | `chapter-08-lesson-06-final-test.json` | `REVIEW` | Chapter 8 Final Test | Prove mastery and unlock Chapter 9 | — | 12 |

Existing IDs `ch08-l01` through `ch08-l04` remain unchanged. Only `ch08-l05` and `ch08-test` are new. Existing learner progress must be preserved.

### Fixture and display-order identity map

| Fixture file | Stable ID | `_meta.lesson_order` | Database display order |
|---|---|---:|---:|
| `chapter-08-lesson-01.json` | `ch08-l01` | 1 | 1 |
| `chapter-08-lesson-02.json` | `ch08-l02` | 2 | 2 |
| `chapter-08-lesson-03.json` | `ch08-l03` | 3 | 3 |
| `chapter-08-lesson-04.json` | `ch08-l04` | 4 | 4 |
| `chapter-08-lesson-05-review.json` | `ch08-l05` | 5 | 5 |
| `chapter-08-lesson-06-final-test.json` | `ch08-test` | 6 | 6 |

Filename order and learner display order remain identical, so no order remapping is required.

## 4. Shared implementation rules

- Preserve all four existing stable lesson IDs and their learner progress.
- Keep the lesson schema as the only content schema. Do not add documentation-only fields to fixtures.
- Any changed Arabic string requires regenerated lesson audio because audio lookup is based on the Arabic-text hash.
- Use precise terminology: `تَاءُ التَّأْنِيثِ السَّاكِنَة` is the third-person feminine singular past marker in this chapter.
- Do not teach the temporary connected-reading vowel in `قَالَتِ` as a different pronoun or conjugation.
- Urdu must distinguish “she did” from general feminine grammar and must remain natural Urdu rather than literal English word order.
- Illustrations must be generated through the approved image-generation workflow, not Pencil. They must be text-free, culturally appropriate, and exported as 768px WebP. Arabic and Urdu text must be rendered by the app.
- Keep each standard lesson focused on one clear objective. New vocabulary may support the objective but must not introduce another grammar topic.
- Validate schema, Quran references, highlight indices, Urdu, audio, images, staging behavior, and test completion before production promotion.

---

# Lesson 1 — She Went: `ذَهَبَتْ`

**Stable ID:** `ch08-l01`  
**Template:** `STANDARD`  
**Estimated time:** 9–10 minutes  
**Objective:** Recognise the difference between third-person masculine and feminine singular past verbs.  
**Scope boundary:** Do not introduce the complete past-tense conjugation table.

## Quran hook

**Al-Qasas 28:25**  
`قَالَتْ إِنَّ أَبِي يَدْعُوكَ`

- Meaning: “She said, ‘Indeed, my father invites you.’”
- Highlight only `قَالَتْ`.
- Explain that the speaker is a woman and that final `تْ` changes `قَالَ` (“he said”) into `قَالَتْ` (“she said”).
- `أَبِي` can briefly reinforce Chapter 7’s attached `ـِي`, but `يَدْعُوكَ` must not become a new object-pronoun lesson.

## Discovery cards

1. **The precise beginner rule**  
   A third-person feminine singular past verb commonly ends in `تْ`: “she did.”

2. **He went**  
   `ذَهَبَ` = he went.

3. **She went**  
   `ذَهَبَتْ` = she went.

4. **Compare the pair**  
   `ذَهَبَ / ذَهَبَتْ` — the final `تْ` changes the doer from “he” to “she.”

5. **He said / she said**  
   `قَالَ / قَالَتْ`.

6. **The verb can come first**  
   `ذَهَبَتْ فَاطِمَةُ` = Fatimah went. The name after the verb tells who performed the action.

7. **Read the two parts**  
   `ذَهَبَتْ` = feminine verb; `فَاطِمَةُ` = doer.

8. **Do not overgeneralise**  
   This lesson teaches the singular “she” form. Other feminine persons and plural forms come later.

9. **Quran checkpoint**  
   Locate `تْ` in `قَالَتْ` and explain what it tells you about the speaker.

## Vocabulary retained or introduced

Retain `ذَهَبَ` from Chapter 5. Introduce/reinforce `ذَهَبَتْ، قَالَ، قَالَتْ، فَاطِمَةُ`. Do not remove previously learned vocabulary.

## Illustration

Replace the masculine-only `dhahaba.webp` coverage with a generated text-free comparison showing a male and female learner completing the same movement action. The app supplies `ذَهَبَ / ذَهَبَتْ`; the image must contain no generated writing.

## Exercises

1. Translate `ذَهَبَتْ` → “she went.”
2. Translate `قَالَتْ` → “she said.”
3. True/false: final `تْ` in `ذَهَبَتْ` identifies a third-person feminine singular doer. → True.
4. Fill `___ فَاطِمَةُ` → `ذَهَبَتْ`.
5. Match `ذَهَبَ، ذَهَبَتْ، قَالَ، قَالَتْ` with exact meanings.
6. Grammar parse `ذَهَبَتْ فَاطِمَةُ` → VERB / SUBJECT.
7. Quran recognition: select `قَالَتْ` and identify the feminine marker.

## Completion message

You can now distinguish “he went” from “she went” and recognise the same feminine ending in `قَالَتْ`.

---

# Lesson 2 — The Same Feminine Marker Across Verbs

**Stable ID:** `ch08-l02`  
**Template:** `STANDARD`  
**Estimated time:** 10 minutes  
**Objective:** Apply the third-person feminine singular pattern to several verbs and recognise its connected-reading form.

## Quran hook

**Yusuf 12:31**  
`وَقَالَتِ اخْرُجْ عَلَيْهِنَّ`

- Meaning: “And she said, ‘Come out before them.’”
- Highlight `وَقَالَتِ`.
- Explain that the feminine marker is still the same `ت`. During connected reading, `تْ` receives a temporary kasrah before the following silent consonant, producing `قَالَتِ اخْرُجْ`.
- This is pronunciation support only; do not present `تِ` here as a different person ending.

## Discovery cards

1. **One marker, different verbs**  
   The verb root changes, but the singular “she” pattern remains recognisable.

2. **She returned**  
   `رَجَعَتْ`.

3. **She sat**  
   `جَلَسَتْ`.

4. **She entered**  
   `دَخَلَتْ`.

5. **Masculine versus feminine pairs**  
   `رَجَعَ / رَجَعَتْ`, `جَلَسَ / جَلَسَتْ`, `دَخَلَ / دَخَلَتْ`.

6. **A complete example**  
   `رَجَعَتْ فَاطِمَةُ` = Fatimah returned.

7. **Connected pronunciation**  
   `قَالَتْ` remains the learned form; `قَالَتِ اخْرُجْ` is how it is connected in recitation.

8. **Quran checkpoint**  
   Split `وَقَالَتِ` into `وَ + قَالَتِ`, then identify the feminine marker.

9. **Scope reminder**  
   The learner is recognising “she returned/sat/entered,” not learning all past-tense persons.

## Vocabulary

Introduce `رَجَعَتْ` (she returned), `جَلَسَتْ` (she sat), and `دَخَلَتْ` (she entered). Their masculine forms may appear only as comparison forms.

## Illustration

Generate a text-free three-panel image showing the same female learner returning, sitting, and entering. Use one consistent character and clear actions. No labels or generated lettering.

## Exercises

1. Translate `رَجَعَتْ` → “she returned.”
2. Translate `دَخَلَتْ` → “she entered.”
3. True/false: `جَلَسَتْ` and `دَخَلَتْ` use the same singular feminine marker. → True.
4. Fill `___ فَاطِمَةُ` for “Fatimah returned” → `رَجَعَتْ`.
5. Match the three masculine/feminine verb pairs.
6. Build “The female student entered” → `دَخَلَتِ الطَّالِبَةُ`, with connected pronunciation explained.
7. Quran recognition: identify why `قَالَتِ` still belongs to the `قَالَتْ` pattern.

## Completion message

The verb can change, but the singular feminine pattern remains recognisable. You can also understand the connected `تِ` without mistaking it for a new form.

---

# Lesson 3 — `الَّتِي`: Feminine Who, That, Which

**Stable ID:** `ch08-l03`  
**Template:** `STANDARD`  
**Estimated time:** 10–11 minutes  
**Objective:** Connect a feminine singular noun to a describing clause with `الَّتِي`.

## Quran hook

**Al-Fajr 89:8**  
`الَّتِي لَمْ يُخْلَقْ مِثْلُهَا فِي الْبِلَادِ`

- Explain that `الَّتِي` refers back to `إِرَمَ ذَاتِ الْعِمَادِ` in the previous ayah.
- The hook must not leave the learner wondering which feminine noun `الَّتِي` describes.
- Recommended Urdu: `وہ ارم، جس جیسی کوئی بستی ملکوں میں پیدا نہیں کی گئی تھی۔`
- Highlight `الَّتِي`; the attached `هَا` in `مِثْلُهَا` may reinforce Chapter 7 but is not the active objective.

## Discovery cards

1. **The feminine connector**  
   `الَّتِي` = who / that / which for a feminine singular noun.

2. **Recall the masculine connector**  
   `الَّذِي` is masculine singular; `الَّتِي` is feminine singular.

3. **A feminine person**  
   `الْبِنْتُ الَّتِي ذَهَبَتْ` = the girl who went.

4. **Read the three parts**  
   `الْبِنْتُ | الَّتِي | ذَهَبَتْ`.

5. **A feminine place**  
   `الْمَدْرَسَةُ الَّتِي فِي الْقَرْيَةِ` = the school that is in the village.

6. **The description must continue**  
   `الَّتِي` opens a relative description; the learner must wait for the clause that follows.

7. **Agreement**  
   A feminine singular noun takes `الَّتِي`, not `الَّذِي`.

8. **Person or object/place**  
   English may use “who” for a person and “that/which” for a thing; Arabic keeps `الَّتِي` for both when the antecedent is feminine singular.

9. **Quran context**  
   `الَّتِي` in Al-Fajr refers back to `إِرَمَ` from the previous ayah.

10. **Checkpoint**  
    Find the feminine noun, the connector, and the clause that describes it.

## Vocabulary

Retain `بِنْتٌ، مَدْرَسَةٌ، قَرْيَةٌ، ذَهَبَتْ`. Introduce `الَّتِي` as the only active new grammar word.

## Illustration

Generate a text-free two-panel visual: a girl connected to an action and a school connected to a village/location. The visual relationship should suggest “the one that/who…” without written labels.

## Exercises

1. Translate `الَّتِي` in a feminine phrase.
2. True/false: `الَّتِي` matches a feminine singular noun. → True.
3. Fill `الْبِنْتُ ___ ذَهَبَتْ` → `الَّتِي`.
4. Match masculine `الَّذِي` phrases and feminine `الَّتِي` phrases.
5. Translate `الْمَدْرَسَةُ الَّتِي فِي الْقَرْيَةِ`.
6. Build `الْبِنْتُ الَّتِي ذَهَبَتْ`.
7. Quran recognition: identify the antecedent context for `الَّتِي` and select the feminine relative pronoun.

## Completion message

You can now match a feminine noun with `الَّتِي` and follow the description that comes after it.

---

# Lesson 4 — My Mother: Feminine Integration

**Stable ID:** `ch08-l04`  
**Template:** `STANDARD`  
**Estimated time:** 11 minutes  
**Objective:** Combine attached pronouns, feminine verbs, and `الَّتِي` while distinguishing noun phrases from complete sentences.

## Quran hook

**Al-Ma’idah 5:75**  
`وَأُمُّهُ صِدِّيقَةٌ`

- Meaning: “And his mother was a woman of great truth.”
- Highlight `أُمُّهُ` and explain `أُمّ + هُ` = his mother.
- Teach `صِدِّيقَةٌ` at recognition level as “a deeply truthful woman / نہایت سچی خاتون.”
- The verse reinforces Chapter 7’s attached `ـُهُ` while keeping the active Chapter 8 focus on feminine integration.

## Discovery cards

1. **Mother**  
   `أُمٌّ` = a mother.

2. **My mother**  
   `أُمِّي` = my mother; `ـِي` is the Chapter 7 attached pronoun.

3. **His mother**  
   `أُمُّهُ` = his mother.

4. **The Quranic description**  
   `أُمُّهُ صِدِّيقَةٌ` = his mother was a deeply truthful woman.

5. **A complete nominal sentence**  
   `أُمِّي فِي الْبَيْتِ` = my mother is in the house.

6. **A complete verbal sentence**  
   `رَجَعَتْ أُمِّي إِلَى الْبَيْتِ` = my mother returned home.

7. **A described noun phrase**  
   `أُمِّي الَّتِي رَجَعَتْ` = my mother who returned.

8. **Phrase versus sentence**  
   `أُمِّي الَّتِي رَجَعَتْ` identifies a person but remains a noun phrase in this lesson; `رَجَعَتْ أُمِّي إِلَى الْبَيْتِ` makes a complete statement.

9. **Integration checkpoint**  
   Identify `ـِي`, `الَّتِي`, and `تْ` and state what each contributes.

## Vocabulary

Retain `أُمٌّ، بَيْتٌ، رَجَعَتْ، إِلَى`. Add `صِدِّيقَةٌ` for Quran recognition. Do not expand into a larger family-vocabulary lesson.

## Illustration

Generate a text-free family/home scene showing a mother returning to a house. It must support both `رَجَعَتْ أُمِّي` and `أُمِّي فِي الْبَيْتِ` without speech bubbles or writing.

## Exercises

1. Translate `أُمِّي` → “my mother.”
2. Translate `أُمُّهُ` → “his mother.”
3. True/false: `أُمِّي` contains the same attached `ـِي` as `كِتَابِي`. → True.
4. Fill `أُمِّي ___ رَجَعَتْ` → `الَّتِي`.
5. Translate `أُمِّي فِي الْبَيْتِ`.
6. Build `رَجَعَتْ أُمِّي إِلَى الْبَيْتِ`.
7. Grammar parse `أُمِّي الَّتِي رَجَعَتْ` → NOUN WITH ATTACHED PRONOUN / RELATIVE PRONOUN / VERB.
8. Choose which example is a complete sentence and which is a described noun phrase.

## Completion message

You can now combine “my,” the feminine relative pronoun, and a feminine past verb while recognising whether the result is a phrase or a complete sentence.

---

# Lesson 5 — Chapter 8 Review

**Stable ID:** `ch08-l05`  
**Fixture:** `chapter-08-lesson-05-review.json`  
**Template:** `REVIEW`  
**Estimated time:** 9–10 minutes  
**Objective:** Consolidate the feminine past marker, connected pronunciation, `الَّتِي`, and integrated feminine phrases before the test.

## Review hook

Reuse **Al-Qasas 28:25**: `قَالَتْ إِنَّ أَبِي يَدْعُوكَ`.

The review should identify `قَالَتْ` from Chapter 8 and `أَبِي` from Chapter 7. It must not teach `يَدْعُوكَ` as a new grammar pattern.

## Discovery cards

1. `ذَهَبَ / ذَهَبَتْ` — he went / she went.
2. `قَالَ / قَالَتْ` — he said / she said.
3. The same singular feminine marker in `رَجَعَتْ، جَلَسَتْ، دَخَلَتْ`.
4. Connected `قَالَتِ` is still the same feminine form.
5. `الَّذِي / الَّتِي` — masculine versus feminine relative pronoun.
6. `الْبِنْتُ الَّتِي ذَهَبَتْ` — feminine noun + connector + feminine verb.
7. `أُمِّي / أُمُّهُ` — attached-pronoun reinforcement.
8. Phrase versus sentence: `أُمِّي الَّتِي رَجَعَتْ` versus `رَجَعَتْ أُمِّي إِلَى الْبَيْتِ`.

## Exercises

1. Identify the feminine marker in `ذَهَبَتْ`.
2. Translate `قَالَتْ`.
3. Match three masculine/feminine verb pairs.
4. Explain why `قَالَتِ` still belongs to the `قَالَتْ` pattern.
5. Select `الَّتِي` for a feminine singular noun.
6. Fill `الْبِنْتُ ___ ذَهَبَتْ`.
7. Translate `الْمَدْرَسَةُ الَّتِي فِي الْقَرْيَةِ`.
8. Build `رَجَعَتْ أُمِّي إِلَى الْبَيْتِ`.
9. Parse `أُمِّي الَّتِي رَجَعَتْ`.
10. Identify a complete sentence versus a noun phrase.

## Completion message

You have reviewed the complete Chapter 8 pattern: feminine past verbs, `الَّتِي`, attached pronouns, and complete feminine sentences.

---

# Lesson 6 — Chapter 8 Final Test

**Stable ID:** `ch08-test`  
**Fixture:** `chapter-08-lesson-06-final-test.json`  
**Template:** `REVIEW`  
**Assessment type:** `CHAPTER_TEST`  
**Questions:** 12  
**Pass mark:** 80% (10 correct answers required)  
**Purpose:** Prove Chapter 8 mastery and unlock Chapter 9.

## Test coverage

1. Recognise `ذَهَبَتْ` as “she went.”
2. Distinguish `ذَهَبَ` from `ذَهَبَتْ`.
3. Recognise `قَالَتْ` as “she said.”
4. Apply the pattern to `رَجَعَتْ، جَلَسَتْ، دَخَلَتْ`.
5. Understand that connected `قَالَتِ` is not a new person ending.
6. Select `الَّتِي` for a feminine singular noun.
7. Distinguish `الَّذِي` from `الَّتِي`.
8. Translate `الْبِنْتُ الَّتِي ذَهَبَتْ`.
9. Translate `أُمِّي` or `أُمُّهُ`.
10. Build `رَجَعَتْ أُمِّي إِلَى الْبَيْتِ`.
11. Distinguish a noun phrase from a complete sentence.
12. Identify the taught feminine feature in one Quranic phrase.

## Test construction rules

- Use stable question IDs `ch08-test-q01` through `ch08-test-q12`.
- Every question must have one unambiguous answer and plausible distractors drawn only from taught material.
- Every prompt and option must contain correct English and natural Urdu.
- Arabic options must preserve the exact vocalisation needed to distinguish `تْ` and connected `تِ`.
- Do not test full past-tense conjugation, plural feminine forms, present-tense agreement, or advanced relative-clause terminology.
- Keep test scoring and chapter unlocking authoritative on the server.

## Completion behavior

- Passing the test marks it complete and unlocks Chapter 9 according to existing server rules.
- Failing does not unlock Chapter 9 and allows a retry.
- Retrying must not remove completed lesson progress or previously earned XP.

---

## 5. Illustration plan

| Lesson | Required generated visual | Purpose |
|---|---|---|
| 1 | Male/female movement comparison | Show `ذَهَبَ / ذَهَبَتْ` visually |
| 2 | Same female character returning, sitting, and entering | Demonstrate one ending across several verbs |
| 3 | Feminine person and school connected to descriptions | Visualise `الَّتِي` as a connector |
| 4 | Mother returning to a home | Support the integrated family sentences |
| Review | Reuse approved Chapter 8 illustrations | Avoid unnecessary new media |

All new images must be generated through image generation, reviewed visually, converted to 768px WebP, uploaded to the approved media host, and verified inside the emulator.

## 6. Validation and implementation gate

Implementation may begin only after this proposal is approved.

### Content implementation

1. Update the four existing fixtures without changing stable IDs.
2. Add the review and final-test fixtures with the new IDs.
3. Add the two new lesson rows to `seed.cjs` using display orders 5 and 6.
4. Update Chapter 8 metadata only if required by the approved wording.
5. Preserve unrelated Chapter 7 and other working-tree changes.

### Automated checks

1. Run `npm run db:validate-fixtures`.
2. Run `npm run quran:audit-fixtures`.
3. Run `npm run db:audit-urdu`.
4. Run `npm run content:check` before any fixture-to-database sync.
5. Build the backend and type-check/lint the app if implementation changes touch shared behavior.

### Media checks

1. Generate and approve the four planned illustrations.
2. Confirm each image is text-free, 768px WebP, correctly cropped, and attached to the intended discovery card.
3. Regenerate audio for every changed Arabic string.
4. Confirm Quran audio, ayah labels, text, translations, and highlight indices.

### Staging and emulator checks

1. Publish only to the isolated local staging database.
2. Open Chapter 8 with a clean test account.
3. Complete every discovery card and exercise in Lessons 1–5.
4. Verify all images, Arabic rendering, Urdu, audio, answer options, and matching pairs.
5. Pass the final test with all answers correct and confirm Chapter 9 unlocks.
6. Fail the test intentionally and confirm Chapter 9 stays locked and retry remains available.
7. Verify learner progress remains account-specific when two accounts use the same device.
8. Report staging and emulator evidence before requesting production promotion.

## 7. Out of scope

- No changes to Chapters 1–7 or Chapter 9 onward.
- No complete past-tense conjugation table in Chapter 8.
- No feminine plural, dual, or present-tense lessons.
- No new conversation lesson; that remains part of the dedicated conversation chapter.
- No lesson-player, test-engine, progress-system, or unlocking changes unless testing proves a separate defect.
- No production seed or production promotion without separate approval after staging verification.
