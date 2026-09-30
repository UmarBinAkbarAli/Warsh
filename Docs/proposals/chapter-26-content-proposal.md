# Chapter 26 — Layered Idafa and Describing Possession

**Status:** Proposed; not implemented or approved

**Scope:** Chapter 26 map, four existing lesson fixtures, one new teaching lesson, one cumulative review, and one distinct chapter test.

## 1. Decision and learning outcome

Replace the current broad “Demonstratives and Possession Spiral” framing with a focused chapter on reading **layered idafa** accurately. Demonstratives are used as a familiar tool for pointing to a whole possession phrase, not retaught as a new topic. The chapter's distinctive challenge is to track relationships across a longer noun chain and determine which noun a following adjective describes.

By the end, learners should be able to:

1. Read a three-noun chain from right to left and explain each possession relationship.
2. Recognize that a middle noun can be both the possessor of the noun before it and the possessed noun before the next noun.
3. Distinguish an adjective describing the final possessor from one describing the first noun, using agreement and case endings.
4. Read a layered chain in a complete authored sentence and identify the demonstrative's referent.
5. Recognize and explain one verified Quranic three-word chain in its verse context.

## 2. Curriculum fit and boundaries

| Prior learning | Chapter 26's new work | Boundary |
|---|---|---|
| Early chapters and Chapter 23 introduce basic idafa and connected reading. | Extend the two-noun relationship into a nested three-noun chain and track the middle noun's two roles. | Briefly retrieve basic idafa; do not spend a lesson reteaching it. |
| Chapter 14 teaches adjective agreement; Chapter 15 teaches demonstratives. | Use endings to resolve which noun an adjective describes, then point to a complete layered phrase. | Do not repeat adjective agreement tables or plural demonstrative rules. Preserve Chapter 15's treatment of non-human plurals. |
| Chapters 24–25 teach إِنَّ and لَيْسَ. | Optionally use one familiar particle in a final transfer example once the chain is secure. | No second introductory lesson on إِنَّ or لَيْسَ and no new particle rules. |
| Chapter 23 practices broader reading integration. | Make the main reading task the internal structure and adjective attachment of a longer idafa. | Avoid a general-purpose “spiral” review that restates Chapter 23. |

## 3. Current defects and required corrections

| Current lesson | Issue | Required correction |
|---|---|---|
| `ch26-l01` | Al-Kawthar 108:1 (**إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ**) does not demonstrate the advertised demonstrative/idafa target. The lesson spends time on basic demonstratives and two-noun idafa already taught. It says the possessor lacks tanwin “because genitive”; definiteness with **الـ**, not genitive case by itself, explains the lack of tanwin in **الطَّالِبِ**. The transliteration of **الطَّالِبِ** is also inaccurate. | Replace the hook with a verified target for this lesson or identify it only as a brief retrieval prompt. Teach the three-noun chain. Correct the tanwin explanation and transliteration throughout cards, prompts and feedback. Remove unsupported claims that an authored phrase is a Quranic name or quotation. |
| `ch26-l02` | Plural demonstratives are said to apply to human and non-human plurals without qualification, conflicting with the earlier Chapter 15 teaching. The Al-Falaq excerpt is incorrectly vocalized as **الْفَلْقِ**; the verse has **بِرَبِّ الْفَلَقِ**. A shortened phrase is presented without the preposition, changing the first noun's case. An exercise accepts only one of two equivalent English translations. | Retain demonstratives only as a short application to the whole possession phrase. Align plural guidance with Chapter 15. Quote the verse exactly and keep **بِـ** when using its case. Make distractors semantically distinct or accept both valid translations. |
| `ch26-l03` | The lesson teaches that **الْجَدِيدِ** in **كِتَابُ الطَّالِبِ الْجَدِيدِ** describes **كِتَابُ**. Its genitive ending instead agrees with and describes **الطَّالِبِ**. The same faulty rule appears in scored feedback. Other items include duplicate valid glosses, incomplete build-sentence keys, and an adjective example whose phrase/sentence status is unclear. | Rebuild the lesson around adjective attachment. Contrast **كِتَابُ الطَّالِبِ الْجَدِيدِ** (the new student's book) with **كِتَابُ الطَّالِبِ الْجَدِيدُ** (the student's new book, as a nominative phrase). Explain that the adjective agrees with the noun it describes. Ensure every scored item has one defensible key and all supplied tiles form the requested complete answer. |
| `ch26-l04` | Ayat al-Kursi 2:255 is said to contain **لَيْسَ**, but it does not. **هُوَ** is a personal pronoun, not a demonstrative (the verse has a separate demonstrative in **مَنْ ذَا**). The lesson also contradicts itself about the case of **خبر ليس**; options differentiated only by invisible case metadata and sentence-building items with incorrect endings make the assessment unreliable. | Replace the hook with an exact, short Quranic target for layered idafa, with its surrounding grammatical context supplied. Remove the false **لَيْسَ / هُوَ** claims. Keep any brief earlier-particle application separate from the chapter's new rule. Correct all case explanations, visible choices and answer keys. |
| Chapter map and chapter assessment | The map promises three-word chains but mixes in basic demonstratives and unrelated contrasts; it misglosses **كِتَابُ الطَّالِبِ الْجَدِيدِ** as though the book is new. Its parse does not note that **غُرْفَةِ** is both **مضاف إليه** to **بَابُ** and **مضاف** to **الأُسْتَاذِ**. Four seeded lessons are all `STANDARD`; there is no distinct cumulative `REVIEW` or chapter-test assessment. | Align the map, parse, examples, focus records, title and seed metadata to the new outcome. Add a real mixed review and a separate `REVIEW` chapter test, following the product's chapter-test model. |

The idafa case relationship is described in the [Quranic Arabic Corpus guide](https://corpus.quran.com/documentation/possessiveconstruction.jsp). For a verified three-word Quranic chain, **مَالِكِ يَوْمِ الدِّينِ** occurs in [Al-Fatihah 1:4](https://corpus.quran.com/wordbyword.jsp?chapter=1&verse=4). Its first word is genitive in the verse context; teach the chain's possession links separately from that contextual case. The full verse context and exact recitation text must be checked by the Quran editor before use.

## 4. Proposed seven-item chapter

Keep `ch26-l01` through `ch26-l04` as stable IDs, rewrite their content and purposes, add `ch26-l05` as a teaching lesson, `ch26-l06` as a cumulative review, and `ch26-test` as a distinct chapter assessment. Existing learner progress and revisit behavior require an owner decision before promotion.

| Order / ID | Template | Proposed lesson | Evidence of understanding |
|---|---|---|---|
| 1 / `ch26-l01` | `STANDARD` | **Unpack a three-noun chain.** Use **بَابُ غُرْفَةِ الْأُسْتَاذِ** (“the door of the teacher's room”). Show the two linked relationships and the middle noun's dual role. | Label who owns what and reconstruct the meaning from a fresh chain. |
| 2 / `ch26-l02` | `STANDARD` | **Keep the chain intact in a sentence.** Apply familiar demonstratives to examples such as **هٰذَا بَابُ غُرْفَةِ الْأُسْتَاذِ**. Emphasize what the pointer refers to and where the chain begins and ends. | Identify the referent and parse the nested possession without repeating a demonstrative lesson. |
| 3 / `ch26-l03` | `STANDARD` | **Find the noun an adjective describes.** Contrast the two readings of **كِتَابُ الطَّالِبِ الْجَدِيدِ / كِتَابُ الطَّالِبِ الْجَدِيدُ**. Use distinct, reviewed contexts so learners do not rely on translation alone. | Choose the correct referent from agreement and explain why the alternative ending changes the meaning. |
| 4 / `ch26-l04` | `STANDARD` | **Read a Quranic three-word chain.** Guide learners through **مَالِكِ يَوْمِ الدِّينِ** in Al-Fatihah 1:4, identify each link, and supply the surrounding context for the first word's case. | Match each word to its relationship and distinguish chain-internal genitive marking from the first word's verse role. |
| 5 / `ch26-l05` | `STANDARD` | **Transfer to a longer sentence.** Combine a nested chain, a familiar demonstrative, and one adjective-attachment decision. A brief **إِنَّ** or **لَيْسَ** example may appear only if it tests the chain, not the particle rule. | Read a new authored sentence, identify the referent and adjective target, and give its meaning. |
| 6 / `ch26-l06` | `REVIEW` | **Mixed review.** Interleave fresh two- and three-noun chains, adjective attachment, one demonstrative application and one Quran excerpt. Include corrective feedback for likely confusions. | Demonstrate the chapter outcomes across unseen examples without introducing new grammar. |
| 7 / `ch26-test` | `REVIEW` with `CHAPTER_TEST` assessment | **Cumulative chapter test.** Assess chain relationships, middle-noun dual roles, adjective target, sentence meaning and bounded Quran recognition. | Use new examples, unique answer keys and the product-standard pass threshold configured in the assessment. |

Five teaching lessons are recommended because learners must coordinate nested relationships, adjective agreement, context-sensitive case and Quran reading. Four regular lessons currently leave no space for deliberate practice and transfer alongside a separate review and assessment.

## 5. Assessment blueprint

Use 12 questions initially, with a pass mark consistent with the product's configured chapter-test standard. Adjust the total only if the assessment schema or authoring review shows that the outcomes cannot be sampled fairly.

| Outcome | Questions |
|---|---:|
| Resolve the links and overall meaning in a nested chain | 3 |
| Identify the middle noun's two roles | 2 |
| Determine which noun an adjective describes | 3 |
| Read a demonstrative pointing to a complete chain | 2 |
| Recognize the taught Quran chain with context | 2 |
| **Total** | **12** |

Every item must have one defensible scored answer. Equivalent English renderings must be accepted or avoided as competing options. Sentence-building tiles must contain all required words and the correct vocalization. Do not grade case labels that are hidden from the learner or require grammar not taught in this chapter.

## 6. Editorial and implementation checks after approval

1. Verify Chapter 15, Chapter 23, and Chapters 24–25 against the actual published content before finalizing the lesson wording and test prerequisites. Do not treat unapproved proposals as already taught.
2. Have a qualified Arabic editor verify all authored sentences, idafa relationships, adjective agreement, case endings, transliteration, English and Urdu translations, and every answer key.
3. Have a qualified Quran editor verify the selected verse text, vocalization, reference, context, excerpt boundaries, meaning and audio alignment. Keep authored examples visibly distinct from Quran quotations.
4. Rewrite all lesson cards, hooks, highlights, exercises, feedback, Urdu content and map records. Ensure each card and exercise advances its lesson's stated outcome.
5. Add the review and assessment using the canonical lesson schema and existing chapter-test behavior; do not create a parallel schema. Resolve the map's missing/legacy source metadata.
6. Before any promotion, validate fixtures, audit Urdu and Quran excerpts, check Studio-versus-fixture state, stage only this chapter, and inspect each lesson, review and test in English and Urdu on Android and web. Follow the repository's content workflow; never use the full production seed for content changes.
7. Decide whether learners who completed the materially incorrect existing lessons should receive an update notice or revisit path before publishing rewritten content.

## 7. Owner decisions

Review the revised chapter purpose, five teaching lessons plus review and test, the Al-Fatihah 1:4 anchor, the 12-question blueprint, and the policy for learners who completed the current content. This document is a proposal only; it makes no fixture, database or learner-facing change.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–4 | `ch26-l01`–`ch26-l04` | `STANDARD` | `chapter-26-lesson-01.json`–`-04.json` |
| 5 | `ch26-l05` (new) | `STANDARD` | `chapter-26-lesson-05.json` |
| 6 | `ch26-l06` (new) | `REVIEW` | `chapter-26-lesson-06-review.json` |
| 7 | `ch26-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-26-lesson-07-final-test.json` |

**Corrections**

1. Basic iḍāfa was introduced in **Chapter 3** (Possession and the Basmalah), not Chapter 23; retrieve it from there.
2. Al-Fatihah 1:4 is not used by any built lesson (1:1, 1:2, 1:5 and 1:6 are), so it is a fresh anchor. Explain the genitive **مَالِكِ** only as "it follows **اللَّهِ** in the verses before"; do not name نعت or بدل.
3. Chapter 40 later puts a demonstrative *inside* the possessor phrase (**كِتَابُ هَذَا الرَّجُلِ**). Keep Lesson 2 to a demonstrative pointing at the whole chain (**هَذَا بَابُ غُرْفَةِ الْأُسْتَاذِ**) so the two chapters do not overlap.
4. Section 6 items 2, 3 and 7 and the revisit question in section 7 are settled by S5–S6.
