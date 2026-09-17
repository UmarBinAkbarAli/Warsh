# Chapter 6 — Complete Content Proposal

**Status:** Proposed for product-owner review; not implemented  
**Chapter position:** Chapter 6  
**Working title:** **Relative Descriptions — الَّذِي**  
**Urdu title:** **متعلقہ وضاحتیں — الَّذِي**

## 1. Chapter purpose

Chapter 6 is the learner's first focused introduction to `الَّذِي`, the masculine-singular relative pronoun. It must build on, not repeat, the foundations already learned:

- Chapter 4: definite nouns and adjective agreement
- Chapter 5: `ذَهَبَ`, `إِلَى`, and simple verbal sentences
- Chapter 2: `فِي` and `عَلَى`

The chapter should teach the learner to keep a noun in mind while reading the description that follows it:

`الرَّجُلُ الَّذِي ذَهَبَ` — the man who went

## End-of-chapter outcome

After Chapter 6, the learner should be able to:

1. Recognize a complete described noun phrase before the sentence ends.
2. Identify `الَّذِي` as the masculine-singular relative pronoun: “who / that / which.”
3. Read `noun + الَّذِي + verbal clause`.
4. Read `الَّذِي` with place and tool phrases such as `فِي الْبَيْتِ`, `عَلَى الْمَكْتَبِ`, and `بِالْقَلَمِ`.
5. Recognize a short Quranic chain such as `الَّذِي خَلَقَ فَسَوَّىٰ`.
6. Distinguish the first `الَّذِي` pattern from the later feminine `الَّتِي` and plural forms.
7. Pass a 12-question final test with the existing 70% server-enforced pass rule.

## Later-curriculum overlap decision

- Chapter 8 teaches `الَّتِي`, the feminine-singular relative pronoun. Chapter 6 must teach only `الَّذِي` with masculine-singular nouns.
- Chapter 15 teaches `الَّذِينَ` in `أُولَٰئِكَ الَّذِينَ`; Chapter 6 must not teach plural relative pronouns.
- Chapter 18 currently calls itself an introduction to `الَّذِي`. It should later be reframed as advanced practice and Quranic application, not treated as a second first introduction. No Chapter 18 changes are included in this Chapter 6 implementation.
- Chapters 16 and 18 contain later `الَّذِي` applications. Chapter 6 establishes the first learner-facing foundation for those later chapters.

## 2. Final chapter structure

| Display order | Stable lesson ID | Fixture file | Title | Main outcome | Cards | Exercises |
|---:|---|---|---|---|---:|---:|
| 1 | `ch06-l01` | `chapter-06-lesson-01.json` | A described subject | Connect an adjective phrase to a known action | 9 | 7 |
| 2 | `ch06-l02` | `chapter-06-lesson-02.json` | `الَّذِي` — who, that, which | Use the masculine-singular relative pronoun | 10 | 7 |
| 3 | `ch06-l03` | `chapter-06-lesson-03.json` | `الَّذِي` with place and tool phrases | Read prepositional descriptions | 10 | 7 |
| 4 | `ch06-l04` | `chapter-06-lesson-04.json` | `الَّذِي` in a Quranic action chain | Follow connected Quranic actions | 10 | 8 |
| 5 | `ch06-l05` | `chapter-06-lesson-05.json` | Chapter 6 review | Consolidate all four lessons | 8 | 10 |
| 6 | `ch06-test` | `chapter-06-lesson-06-final-test.json` | Chapter 6 final test | Prove mastery and unlock Chapter 7 | — | 12 |

Existing IDs `ch06-l01` through `ch06-l04` remain unchanged. Only `ch06-l05` and `ch06-test` are new. Filename order and display order are identical in Chapter 6, so no order remapping is required.

---

# Lesson 1 — A Described Subject

**Stable ID:** `ch06-l01`  
**Template:** `STANDARD`  
**Estimated time:** 9–10 minutes  
**Objective:** Strengthen adjective agreement and show that a described noun can be followed by a known action.  
**Scope boundary:** Do not introduce `الَّذِي` yet; it begins in Lesson 2.

## Quran hook

**Al-Fatihah 1:6**  
`اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ`

- Focus: `الصِّرَاطَ الْمُسْتَقِيمَ`
- Meaning: “Guide us to the straight path.”
- Purpose: spiral review of definite noun + definite adjective before the new relative-pronoun lesson.
- Highlight only `الصِّرَاطَ` and `الْمُسْتَقِيمَ`; do not highlight or explain `الَّذِي` in this lesson.

## Discovery cards

1. **Recall the described noun**  
   `الصِّرَاطَ الْمُسْتَقِيمَ` = the straight path. Both words are definite and masculine.

2. **A complete noun phrase**  
   `الرَّجُلُ الْكَرِيمُ` = the generous man. `الْكَرِيمُ` describes `الرَّجُلُ`.

3. **Another masculine description**  
   `الطَّالِبُ الْمُجْتَهِدُ` = the hardworking student.

4. **Add the known action**  
   `ذَهَبَ الرَّجُلُ الْكَرِيمُ` = the generous man went.

5. **Read the parts**  
   `ذَهَبَ` = went; `الرَّجُلُ الْكَرِيمُ` = the generous man.

6. **A second action sentence**  
   `ذَهَبَ الطَّالِبُ الْمُجْتَهِدُ` = the hardworking student went.

7. **Agreement reminder**  
   `الطَّالِبُ` and `الْمُجْتَهِدُ` are both masculine and definite. The adjective follows the noun.

8. **Do not stop at the adjective**  
   A noun phrase can be part of a longer sentence. `الرَّجُلُ الْكَرِيمُ` identifies who; `ذَهَبَ` tells what happened.

9. **Checkpoint**  
   First identify the noun and its adjective; then identify the action. `الَّذِي` is not required for this simple description.

## Vocabulary retained or reinforced

`صِرَاطٌ` path, `مُسْتَقِيمٌ` straight, `رَجُلٌ` man, `كَرِيمٌ` generous, `طَالِبٌ` student, `مُجْتَهِدٌ` hardworking, `ذَهَبَ` he went.

## Illustration

One text-free generated scene showing a man and student, each visually associated with a descriptive quality and moving forward. Arabic text must be rendered by the app, not generated inside the image.

## Exercises

1. **Tap translation:** `الصِّرَاطَ الْمُسْتَقِيمَ` → “the straight path.”
2. **Tap translation:** `ذَهَبَ الرَّجُلُ الْكَرِيمُ` → “the generous man went.”
3. **True/false:** In `الرَّجُلُ الْكَرِيمُ`, `الْكَرِيمُ` describes `الرَّجُلُ`. → True.
4. **Fill blank:** `الطَّالِبُ ___ ذَهَبَ` with “the hardworking student went” → `الْمُجْتَهِدُ`.
5. **Matching:** `الرَّجُلُ الْكَرِيمُ`, `الطَّالِبُ الْمُجْتَهِدُ`, and `الصِّرَاطَ الْمُسْتَقِيمَ` with exact meanings.
6. **Grammar parse:** `ذَهَبَ / الرَّجُلُ / الْكَرِيمُ` → VERB / SUBJECT / ADJECTIVE.
7. **Build sentence:** “the hardworking student went” → `ذَهَبَ الطَّالِبُ الْمُجْتَهِدُ`.

## Completion message

You can now hold a complete noun phrase in your mind and connect it to a known action. Next, Arabic will show how `الَّذِي` opens an even longer description.

---

# Lesson 2 — `الَّذِي`: Who, That, Which

**Stable ID:** `ch06-l02`  
**Template:** `STANDARD`  
**Estimated time:** 10–11 minutes  
**Objective:** Introduce `الَّذِي` as the masculine-singular relative pronoun.

## Quran hook

**Al-A‘la 87:2**  
`الَّذِي خَلَقَ فَسَوَّىٰ`

- Meaning: “Who created and proportioned.”
- Focus: `الَّذِي خَلَقَ`.
- Highlight `الَّذِي` for the word introduction; the full phrase is explained after the cards.

## Discovery cards

1. **The new connector**  
   `الَّذِي` = who / that / which for a masculine-singular noun.

2. **Connect a noun to an action**  
   `الْوَلَدُ الَّذِي ذَهَبَ` = the boy who went.

3. **Read the three parts**  
   `الْوَلَدُ` = the boy; `الَّذِي` = who; `ذَهَبَ` = went.

4. **Another person**  
   `الرَّجُلُ الَّذِي ذَهَبَ` = the man who went.

5. **A different action**  
   `الطَّالِبُ الَّذِي قَرَأَ` = the student who read.

6. **The phrase is not finished at `الَّذِي`**  
   When you hear `الَّذِي`, wait for the describing clause.

7. **Masculine singular scope**  
   `الَّذِي` is used here with `الْوَلَدُ، الرَّجُلُ، الطَّالِبُ`. The feminine `الَّتِي` and plural forms are later lessons.

8. **The clause can contain a known past verb**  
   `ذَهَبَ` and `قَرَأَ` both complete the description.

9. **Quran recognition**  
   In `الَّذِي خَلَقَ فَسَوَّىٰ`, `الَّذِي` opens the description and `خَلَقَ` supplies the action.

10. **Checkpoint**  
    Find the noun, the connector, and the describing action.

## Vocabulary retained or added

`الَّذِي` who/that/which, `قَرَأَ` he read, `خَلَقَ` he created, `وَلَدٌ` boy, `رَجُلٌ` man, `طَالِبٌ` student.

## Illustration

One text-free generated visual bridge: a named masculine person connected by a visible path to an action scene. The image must communicate “person connected to action,” without Arabic lettering.

## Exercises

1. **Tap translation:** `الْوَلَدُ الَّذِي ذَهَبَ` → “the boy who went.”
2. **Tap translation:** `الرَّجُلُ الَّذِي ذَهَبَ` → “the man who went.”
3. **True/false:** `الَّذِي` connects a masculine noun to its describing clause. → True.
4. **Fill blank:** `الطَّالِبُ ___ قَرَأَ` → `الَّذِي`.
5. **Matching:** three complete `noun + الَّذِي + verb` phrases with exact English and Urdu meanings. The Urdu for `قَرَأَ` must be “جس نے پڑھا,” not “جو پڑھتا ہے.”
6. **Build sentence:** “the boy who went” → `الْوَلَدُ الَّذِي ذَهَبَ`.
7. **Grammar parse:** `الْوَلَدُ / الَّذِي / ذَهَبَ` → NOUN / RELATIVE PRONOUN / VERB.

## Completion message

`الَّذِي` tells you that a description is coming. You can now read “the boy who went” as one connected Arabic phrase.

---

# Lesson 3 — `الَّذِي` with Place and Tool Phrases

**Stable ID:** `ch06-l03`  
**Template:** `STANDARD`  
**Estimated time:** 10–11 minutes  
**Objective:** Read `الَّذِي` with prepositional descriptions, including place and tool phrases.  
**Prerequisite:** `فِي` and `عَلَى` were introduced earlier; `بِـ` is used here as recognition in a Quranic phrase.

## Quran hook

**Al-‘Alaq 96:4**  
`الَّذِي عَلَّمَ بِالْقَلَمِ`

- Meaning: “Who taught by the pen.”
- Focus: `بِالْقَلَمِ`, a tool phrase after the action.
- The lesson title must say “place and tool phrases,” not only “place phrases.”

## Discovery cards

1. **A place description**  
   `الْقَلَمُ الَّذِي عَلَى الْمَكْتَبِ` = the pen that is on the desk.

2. **`فِي` inside the description**  
   `الْكِتَابُ الَّذِي فِي الْبَيْتِ` = the book that is in the house.

3. **A place with a known noun**  
   `الْمَسْجِدُ الَّذِي فِي الْمَدِينَةِ` = the mosque that is in the city.

4. **Read the chunks**  
   `الْكِتَابُ | الَّذِي | فِي الْبَيْتِ` = the book | that | in the house.

5. **Prepositions keep their meaning**  
   `فِي` = in; `عَلَى` = on; `بِـ` = by/with.

6. **Quranic tool phrase**  
   `الَّذِي عَلَّمَ بِالْقَلَمِ` = who taught by the pen.

7. **The phrase after `الَّذِي` describes the noun**  
   It may be an action plus a place/tool phrase; the learner should not stop after `الَّذِي`.

8. **Case-ending recognition only**  
   `الْمَكْتَبِ، الْبَيْتِ، الْمَدِينَةِ، الْقَلَمِ` follow prepositions. Do not introduce a new full case lesson here.

9. **Masculine singular scope remains**  
   `الْقَلَمُ، الْكِتَابُ، الْمَسْجِدُ` are masculine singular nouns, so `الَّذِي` is used.

10. **Checkpoint**  
    Identify the noun, `الَّذِي`, and the place/tool phrase that completes the description.

## Vocabulary retained or added

`فِي` in, `عَلَى` on, `بِـ` by/with, `قَلَمٌ` pen, `مَكْتَبٌ` desk, `كِتَابٌ` book, `بَيْتٌ` house, `مَسْجِدٌ` mosque, `مَدِينَةٌ` city.

## Illustration

One text-free generated scene showing a pen on a desk, a book inside a house, and an abstract “by the pen” teaching scene. Use separate visual panels; do not generate Arabic or Urdu text inside the image.

## Exercises

1. **Tap translation:** `الْقَلَمُ الَّذِي عَلَى الْمَكْتَبِ` → “the pen that is on the desk.”
2. **Tap translation:** `الْكِتَابُ الَّذِي فِي الْبَيْتِ` → “the book that is in the house.”
3. **True/false:** In `الْقَلَمُ الَّذِي عَلَى الْمَكْتَبِ`, `عَلَى الْمَكْتَبِ` completes the description. → True.
4. **Fill blank:** `الْمَسْجِدُ الَّذِي ___ الْمَدِينَةِ` → `فِي`.
5. **Matching:** exact phrases and meanings, preserving “that is” in English and `جو ... ہے` in Urdu.
6. **Build sentence:** “the pen that is on the desk” → `الْقَلَمُ الَّذِي عَلَى الْمَكْتَبِ`.
7. **Quran recognition:** select `بِالْقَلَمِ` in `الَّذِي عَلَّمَ بِالْقَلَمِ` and identify it as a tool phrase.

## Completion message

The description after `الَّذِي` can include a place or a tool. You can now read longer phrases such as “the book that is in the house.”

---

# Lesson 4 — `الَّذِي` in a Quranic Action Chain

**Stable ID:** `ch06-l04`  
**Template:** `STANDARD`  
**Estimated time:** 10–12 minutes  
**Objective:** Follow one relative pronoun through connected Quranic actions.  
**Scope boundary:** `وَ` and `فَ` are taught only as simple connectors (“and” and “then”), not as a full conjunction lesson.

## Quran hook

**Al-A‘la 87:2**  
`الَّذِي خَلَقَ فَسَوَّىٰ`

- Meaning: “Who created and proportioned.”
- Highlight all three words in the reveal.

## Discovery cards

1. **Return to the connector**  
   `الَّذِي` opens the description.

2. **First action**  
   `خَلَقَ` = he created.

3. **Then**  
   `فَسَوَّىٰ` = then he proportioned / made balanced.

4. **Read the chain**  
   `الَّذِي | خَلَقَ | فَسَوَّىٰ` = who | created | then proportioned.

5. **The next Quranic line**  
   Al-A‘la 87:3 contains `وَالَّذِي قَدَّرَ فَهَدَىٰ` — and Who measured/decreed, then guided.

6. **`وَالَّذِي`**  
   `وَ` adds “and”; `الَّذِي` remains the same masculine-singular relative pronoun.

7. **`فَهَدَىٰ`**  
   `فَ` adds “then”; `هَدَىٰ` = he guided.

8. **One connector, several actions**  
   A relative description can contain more than one connected action.

9. **Do not confuse the forms**  
   `الَّذِي` = who/that/which, `الَّتِي` = feminine singular form, `الَّذِينَ` = masculine plural form. Only `الَّذِي` is active here.

10. **Checkpoint**  
    Find the connector, each action, and the simple “and/then” links.

## Vocabulary retained or added

`خَلَقَ` created, `سَوَّىٰ` proportioned/made balanced, `قَدَّرَ` measured/decreed, `هَدَىٰ` guided, `وَ` and, `فَ` then.

## Illustration

One text-free generated sequence showing creation, balance, measurement, and guidance as four connected stages. The app supplies the Arabic words and connectors.

## Exercises

1. **Tap translation:** `الَّذِي خَلَقَ` → “Who created.”
2. **Tap translation:** `فَسَوَّىٰ` → “then proportioned.”
3. **True/false:** In Al-A‘la 87:2, `الَّذِي` is followed by actions. → True.
4. **Fill blank:** `الَّذِي ___ فَسَوَّىٰ` → `خَلَقَ`.
5. **Matching:** `خَلَقَ، فَسَوَّىٰ، قَدَّرَ، فَهَدَىٰ` with exact meanings.
6. **Build sentence:** `الَّذِي خَلَقَ فَسَوَّىٰ`.
7. **Grammar parse:** `الَّذِي / خَلَقَ / فَسَوَّىٰ` → RELATIVE PRONOUN / VERB / VERB.
8. **Connector choice:** identify `وَ` as “and” and `فَ` as “then.”

## Completion message

You can now follow `الَّذِي` through a Quranic chain: the connector opens the description, and the verbs show the connected actions.

---

# Lesson 5 — Chapter 6 Review

**Stable ID:** `ch06-l05`  
**Template:** `REVIEW`  
**Estimated time:** 11–13 minutes  
**Objective:** Consolidate described nouns, `الَّذِي`, place/tool phrases, and Quranic action chains without adding new grammar.

## Quran hook

**Al-A‘la 87:2**  
`الَّذِي خَلَقَ فَسَوَّىٰ`

Review focus:

- `الَّذِي` — masculine-singular relative pronoun
- `خَلَقَ، فَسَوَّىٰ` — connected actions
- `فِي، عَلَى، بِـ` — prepositional phrases used inside descriptions

## Discovery cards

1. Definite noun + adjective: `الرَّجُلُ الْكَرِيمُ`.
2. Noun + action: `ذَهَبَ الرَّجُلُ الْكَرِيمُ`.
3. Relative pattern: `الْوَلَدُ الَّذِي ذَهَبَ`.
4. Meaning of `الَّذِي`: who / that / which for masculine singular.
5. Place phrase: `الْكِتَابُ الَّذِي فِي الْبَيْتِ`.
6. Tool phrase: `الَّذِي عَلَّمَ بِالْقَلَمِ`.
7. Quranic chain: `الَّذِي خَلَقَ فَسَوَّىٰ`.
8. Scope boundary: `الَّتِي` and plural forms belong to later chapters.

## Exercises

1. Translate `الرَّجُلُ الْكَرِيمُ`.
2. Build `ذَهَبَ الطَّالِبُ الْمُجْتَهِدُ`.
3. Select `الَّذِي` for a masculine-singular noun.
4. Translate `الْوَلَدُ الَّذِي ذَهَبَ`.
5. Fill `فِي` in `الْكِتَابُ الَّذِي ___ الْبَيْتِ`.
6. Fill `عَلَى` in `الْقَلَمُ الَّذِي ___ الْمَكْتَبِ`.
7. Identify `بِالْقَلَمِ` as a tool phrase.
8. Build `الَّذِي خَلَقَ فَسَوَّىٰ`.
9. Parse `الَّذِي / خَلَقَ / فَسَوَّىٰ`.
10. Choose the correct form for a feminine noun: `الَّتِي` (recognition only; active teaching begins in Chapter 8).

## Completion message

Review complete. You can now connect a masculine noun to an action, a place, a tool, or a short Quranic chain using `الَّذِي`.

---

# Lesson 6 — Chapter 6 Final Test

**Stable ID:** `ch06-test`  
**Template:** `REVIEW`  
**Assessment type:** `CHAPTER_TEST`  
**Questions:** 12  
**Pass mark:** 70% (server-authoritative existing course rule)  
**Prerequisite:** Lessons 1–5 completed  
**Behavior:** Retry is allowed; Chapter 7 unlocks only after passing.

## Test blueprint

| Q | Skill | Exercise | Exact answer |
|---:|---|---|---|
| 1 | Adjective phrase | Translate `الرَّجُلُ الْكَرِيمُ` | the generous man |
| 2 | Described subject + action | Build “the hardworking student went” | `ذَهَبَ الطَّالِبُ الْمُجْتَهِدُ` |
| 3 | Relative-pronoun meaning | Translate `الَّذِي` | who / that / which, masculine singular |
| 4 | Basic relative phrase | Translate `الْوَلَدُ الَّذِي ذَهَبَ` | the boy who went |
| 5 | Relative-pronoun selection | Fill `الطَّالِبُ ___ قَرَأَ` | `الَّذِي` |
| 6 | Relative phrase parsing | Parse `الْوَلَدُ / الَّذِي / ذَهَبَ` | NOUN / RELATIVE PRONOUN / VERB |
| 7 | Place phrase | Fill `الْمَسْجِدُ الَّذِي ___ الْمَدِينَةِ` | `فِي` |
| 8 | Place phrase translation | Translate `الْقَلَمُ الَّذِي عَلَى الْمَكْتَبِ` | the pen that is on the desk |
| 9 | Tool phrase | Identify the meaning of `بِالْقَلَمِ` | by/with the pen |
| 10 | Quranic action | Fill `الَّذِي ___ فَسَوَّىٰ` | `خَلَقَ` |
| 11 | Connectors | Identify `فَ` in `فَسَوَّىٰ` | then |
| 12 | Cumulative production | Build “the book that is in the house” | `الْكِتَابُ الَّذِي فِي الْبَيْتِ` |

## Test-quality rules

- Every answer must be explicitly taught in Lessons 1–5.
- Do not test `الَّتِي، الَّذِينَ، الَّلاتِي`, or full relative-pronoun case analysis.
- Matching columns must contain every required answer exactly once.
- English and Urdu translations must preserve “who/that/which” and `جو / جس نے` distinctions.
- `قَرَأَ` must translate as past “read,” not present “reads.”
- The final test must render with visible questions and answers; it must never open blank.
- Grading must use the existing backend-authoritative chapter-test flow and 70% rule.

---

# Chapter-wide vocabulary

| Arabic | English | Urdu | Role |
|---|---|---|---|
| `الَّذِي` | who / that / which, masculine singular | جو / جس نے، مذکر واحد | main grammar |
| `خَلَقَ` | he created | اس نے پیدا کیا | Quranic action |
| `قَرَأَ` | he read | اس نے پڑھا | practice action |
| `فَسَوَّىٰ` | then proportioned | پھر درست بنایا | Quranic action |
| `قَدَّرَ` | he measured/decreed | اس نے اندازہ مقرر کیا | recognition |
| `هَدَىٰ` | he guided | اس نے ہدایت دی | recognition |
| `فِي` | in | میں | place phrase |
| `عَلَى` | on | پر | place phrase |
| `بِـ` | by/with | سے / کے ذریعے | tool phrase |
| `قَلَمٌ` | pen | قلم | object |
| `مَكْتَبٌ` | desk | میز | place/object |
| `كِتَابٌ` | book | کتاب | object |
| `بَيْتٌ` | house | گھر | place |
| `مَسْجِدٌ` | mosque | مسجد | place |
| `مَدِينَةٌ` | city | شہر | place |
| `رَجُلٌ` | man | آدمی | masculine noun |
| `وَلَدٌ` | boy | لڑکا | masculine noun |
| `طَالِبٌ` | student | طالب علم | masculine noun |
| `كَرِيمٌ` | generous | سخی | adjective |
| `مُجْتَهِدٌ` | hardworking | محنتی | adjective |

# Media plan

All new illustrations must use the approved image-generation workflow and be delivered as WebP at the repository’s enforced dimensions. Do not generate Arabic or Urdu lettering inside the bitmap.

1. Described person + action scene for Lesson 1.
2. Person connected to action for Lesson 2.
3. Place/tool panels for Lesson 3.
4. Four-stage creation/balance/measurement/guidance sequence for Lesson 4.
5. One review illustration may reuse an approved asset; do not create unnecessary duplicates.

# Implementation safeguards

1. Preserve `ch06-l01` through `ch06-l04` and every existing exercise ID.
2. Add only `ch06-l05`, `ch06-test`, and their new exercise IDs.
3. Update `prisma/seed.cjs` only for Chapter 6 rows and imports; all six display orders must be 1–6.
4. Use `STANDARD` for Lessons 1–4, `REVIEW` for Lesson 5 and the final test.
5. Do not modify Chapter 8 or Chapter 18 in this Chapter 6 scope.
6. If Arabic text changes, regenerate the corresponding catalogue audio because audio is keyed by the Arabic-text hash.
7. Do not run the full production seed. Use isolated staging and the scoped content-sync path.

# Acceptance criteria

Implementation is complete only when:

- [ ] Six Chapter 6 items appear in the exact display order.
- [ ] Existing learner progress remains attached to `ch06-l01` through `ch06-l04`.
- [ ] All cards and exercises match this proposal.
- [ ] Quran text, references, audio, and highlights are correct.
- [ ] English and Urdu wording passes review; `قَرَأَ` is consistently past tense.
- [ ] Images render and contain no generated Arabic/Urdu text.
- [ ] Fixture/schema validation passes.
- [ ] Quran audit passes.
- [ ] Urdu audit passes.
- [ ] Backend tests and build pass.
- [ ] Isolated staging is refreshed only for the reviewed Chapter 6 scope.
- [ ] A debug build connects through ADB reverse to isolated staging.
- [ ] Every lesson and the final test are opened and completed in English.
- [ ] Urdu layouts and changed media are spot-checked in the emulator.
- [ ] Production remains unchanged until explicit owner approval.

# Product-owner approval checklist

- [ ] Approve the six-item chapter structure.
- [ ] Approve the `الَّذِي` scope and later-chapter boundaries.
- [ ] Approve Quran hooks and highlighted words.
- [ ] Approve discovery-card content and vocabulary.
- [ ] Approve review and final-test blueprint.
- [ ] Approve image briefs.
- [ ] Authorize isolated-staging implementation.


# Implementation notes (2026-09-17)

Built as `warsh-backend/prisma/fixtures/chapter-06-lesson-0[1-6]*.json`, promoted
to the isolated staging DB with `npm run content:promote-chapter-six -- --apply`
(4 in-place updates, 2 creates, learner progress untouched), and verified on the
`Warsh_API_34` emulator against staging: Lesson 1 completed end to end in Urdu
(hook, 9 cards, all 7 exercise types, reveal, completion); Lessons 2–5 and the
test intro/first question opened in English with every Discover card checked;
all six items plus the test completed through the API (test locked until the
five lessons are done, 12/12 → passed, chapter completed, Chapter 7 unlocked).
Fixture, Urdu and Quran audits pass; 29 new catalogue audio clips generated.
Deviations from the text above, each forced by the runtime or the pipeline:

1. **Test blueprint rows that are build/fill/parse tasks** render as the
   chapter-test multiple-choice format (the only format `assessment.questions`
   supports), with the exact blueprint answer as the correct option.
2. **Pass mark is 80 % (10 of 12), not 70 %.** The 70 % rule is the per-lesson
   `LESSON_PASS_PERCENT`; every existing chapter test (3, 4, 5) carries
   `pass_score_percent: 80`, so Chapter 6 matches them. One-line change if the
   owner prefers 70.
3. **No `VocabularyWord` rows** were added: `قَرَأَ`, `مُجْتَهِدٌ`, `سَوَّىٰ`,
   `قَدَّرَ` (form II) are carried by the cards. `بَيْت` is not vocab-linked
   because `arabicPlain: بيت` resolves to `بَيَّتَ` ("he spent the night").
4. **Illustrations.** The four media-plan briefs are tracked card by card in
   `Docs/lesson-illustrations-needed.md`. Existing discover assets are reused
   where the word matches (`qalam`, `kitab`, `masjid`, `dhahaba`, `fi`), and
   the dictionary illustrations for `رَجُل`, `وَلَد`, `طَالِب`, `صِرَاط` were
   copied into `images/discover/` at 768 px WebP. The dictionary badges for
   `الَّذِي` and `خَلَقَ` were tried and rejected: they carry generated Arabic
   lettering, which the media plan forbids on cards.
5. **Lesson 1 word order** is verb-first (`ذَهَبَ الرَّجُلُ الْكَرِيمُ`) as
   written here; the previous fixture was noun-first. `curriculum-book1.cjs`
   (chapter card + parse tokens) follows the same order.
6. **Review exercise 10** (`الَّتِي` for a feminine noun) is a FILL_BLANK whose
   hint states "recognition only"; it is answerable from the scope cards in
   Lessons 2, 4 and 5.
7. **Rendering-safety wording.** English strings the player does not wrap in a
   direction mark (statements, hints, feedback, test prompts) begin with a
   Latin word, and the three titles that open with `الَّذِي` carry a leading
   LTR mark. One concept label that mixed Urdu into its Arabic line was
   rewritten in Arabic because concept lines are audio targets.
8. **Chapter row.** Title → "Relative Descriptions — الَّذِي"; description and
   Urdu description updated in `curriculum-book1.cjs` and the promote script.
