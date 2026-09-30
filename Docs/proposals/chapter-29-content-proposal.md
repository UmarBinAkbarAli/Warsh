# Chapter 29 — Nominal and Verbal Sentences in Context

**Status:** Proposed; not implemented or approved

**Scope:** Correct the Chapter 29 map and six existing lesson fixtures; repurpose the duplicated Al-Kafirun lessons into focused teaching/review; add a cumulative review and a distinct chapter test. Preserve existing lesson IDs where possible. This document does not change learner-facing content.

## 1. Decision and learning outcome

Keep Chapter 29 as the learner's first explicit comparison of nominal and verbal sentence patterns. Reframe it as a practical reading skill, not a complete theory of Arabic clause syntax. Learners have already met simple nominal sentences, past verbs, subjects/doers, prepositions, attached pronouns, **إِنَّ**, and **لَيْسَ**. Chapter 29 should connect those skills and teach learners to identify a clause's core after recognizing introductory particles and conjunctions.

By the end, learners should be able to:

1. Recognize a simple nominal clause whose core begins with a noun or pronoun and a simple verbal clause whose core begins with a verb.
2. Distinguish a clause's core from a preceding conjunction or particle such as **وَ** or **لَا**. Treat “look at the first content word” as a beginner heuristic, not a universal definition.
3. Contrast the common patterns **مبتدأ + خبر** and **فعل + فاعل**, using familiar words and sentence-length examples.
4. Recognize that sentence type does not mean “contains no verb” versus “contains a verb”; a nominal clause can have a verbal clause as its predicate. Keep embedded-clause analysis recognition-only or defer it if it exceeds the intended level.
5. Retrieve the already-taught effect of **إِنَّ** accurately: **اسم إنّ منصوب، خبر إنّ مرفوع**. Do not reteach or contradict Chapter 24.
6. Classify a small number of verified Quranic examples without turning the unit into a full-surah parsing or tafsir lesson.
7. Prepare to apply both sentence patterns in Chapter 30's connected reading and comprehension work.

## 2. Course continuity and boundaries

| Prior or next learning | Chapter 29's role | Boundary |
|---|---|---|
| Early chapters already introduce simple noun/pronoun-led statements and **مبتدأ + خبر**. | Retrieve familiar examples briefly, then compare them with verb-led clauses. | Do not spend multiple lessons reintroducing simple nominal sentences. Check actual published content before relying on proposed earlier edits. |
| Chapter 17 introduces past actions and the doer; Chapter 28's proposed direction adds common verbs in sentence patterns. | Use familiar verb/doer examples to identify a verbal clause. | Do not reteach past-tense morphology or expand into conjugation. Verify Chapter 28's published version before treating its proposed outcomes as prerequisites. |
| Chapters 19–20 address attached pronouns; Chapter 27's proposal develops prepositions; Chapter 21 already uses movement/location patterns. | Retrieve only what is needed to understand particles, prepositions and attached forms in selected examples. | Do not reteach pronoun paradigms or the preposition inventory. A proposal is not a released prerequisite. |
| Chapter 24 teaches **إِنَّ**; Chapter 25 teaches **لَيْسَ**. | Use these as recognition/application examples of words that affect a nominal clause, with correct, previously taught analysis. | Do not introduce a new case rule. **إِنَّ** does not make both اسم and خبر accusative; **لَيْسَ** is not a sentence-type shortcut. |
| Chapter 30 is titled Reading Comprehension and Dialogue and is mapped to longer connected reading applying both patterns. | End with short, scaffolded classification and a handoff to connected reading. | Reserve the full Al-Kafirun integration, extended passage, dialogue and comprehension capstone for Chapter 30. Do not duplicate its Tadabbur unlock. |

## 3. Current issues and required corrections

| Current location | Issue | Required correction |
|---|---|---|
| Chapter map (`curriculum-books2-4.cjs`, Chapter 29 block) | The map's four focus records omit the **إِنَّ** lesson and the current Al-Kafirun parse/Tadabbur lessons. It says the opening word decides type without qualifying particles. It uses **يَذْكُرُ** examples before the later present-tense unit. | Rewrite title/description, examples, hook, parse, conversation, focuses and source metadata to match the proposed learning outcomes and actual lesson sequence. Either replace not-yet-taught present-tense examples with familiar forms or explicitly label them as recognition-only and verify learner readiness. |
| `ch29-l01` | Teaches that nominal sentences do not contain verbs and that the first word is never a verb. That is too broad: sentence type is not determined by whether any verb occurs anywhere in a larger clause structure. It also spends substantial space repeating simple patterns learners have seen. | Shorten retrieval; define only the introductory core pattern. State that a nominal clause can contain a verbal predicate clause, but defer parsing that construction if not yet taught. Avoid “never/no verb” absolutes. |
| `ch29-l02` | Says a verbal sentence **always** begins with a verb, without accounting for a preceding conjunction or particle. | Define the clause core and show one simple verb-first example, then contrast a particle-prefixed example only after learners have been taught how to identify the clause boundary/core. Avoid presenting an unqualified universal. |
| `ch29-l03` | Calls **أَعْبُدُ** the “first real word” in **لَا أَعْبُدُ...**, while earlier lessons say “first word.” It treats **مَا تَعْبُدُونَ** as a token-level object in parsing, though the object is the whole relative clause and **مَا** is a relative pronoun. The available roles cannot express that distinction. | Explain that **لَا** is a negation particle preceding the verbal clause. For the object, either label **مَا تَعْبُدُونَ** as a whole phrase/clause or keep the exercise to classifying the core; do not force an inaccurate token role. Add role choices only if the canonical lesson schema supports a clear, level-appropriate parse. |
| `ch29-l04` | Reverses Chapter 24's correct **إِنَّ** rule. It marks خبر إنّ accusative, uses **كَبِيرًا** instead of **كَبِيرٌ**, mislabels **غَفُورٌ**, misstates the case of **مُجْتَهِدُونَ**, and keys **الْمُسْلِمِ** instead of the required **الْمُسْلِمَ** in a fill-in. | Replace this lesson with a short retrieval/application lesson. Use the exact Chapter 24 rule: **اسم إنّ منصوب، خبر إنّ مرفوع**. Re-audit all Arabic text, transliteration, English/Urdu explanations, choices, and answer keys. Do not score the incorrect rule. |
| `ch29-l05` | Parses **عَابِدُونَ** in **وَلَا أَنْتُمْ عَابِدُونَ...** as a verb and calls the clause verbal. Here it is an active participle functioning as the predicate of a nominal clause; it is not a finite verb. Its Al-Kafirun parse roles also conflict with other lesson role taxonomies. | Correct the sentence classification and word role. Use a qualified Arabic review for every parse. Only assess distinctions actually taught, and keep word-level roles consistent across all examples. |
| `ch29-l01`, `l05`, `l06` | Several explanations analyze **وَلَكُمْ دِينُكُمْ** as though **وَلَكُمْ** were a noun/pronoun subject. It is **وَ** plus the prepositional phrase **لَكُمْ**; in the familiar analysis, the prepositional phrase is fronted and **دِينُكُمْ** is the delayed subject/topic. | If retaining the example, describe the prefix/preposition/pronoun accurately and keep the syntactic explanation within learner scope. Do not label **وَلَكُمْ** as the subject. Otherwise use a simpler nominal example for graded parsing. |
| `ch29-l05` and `ch29-l06` | Both lessons repeatedly parse the same short Al-Kafirun excerpts. Lesson 6 labels itself Tadabbur unlock #5 and makes broad claims about the surah's rhetorical design; Chapter 30 already owns a mapped Al-Kafirun reading integration and connected-reading capstone. | Retain at most one short Al-Kafirun example in Chapter 29 as a bridge. Remove duplicate full-parse/Tadabbur content and unreviewed claims about authorial or rhetorical intent. Give Chapter 30 the full-surah reading and comprehension work. |
| Seed and assessment structure | Six seeded lessons are all `STANDARD`; there is no distinct Chapter 29 cumulative review or chapter test. | Align fixture templates and seed rows. Add a real `REVIEW` and a distinct `CHAPTER_TEST` assessment using existing canonical mechanisms and thresholds. |

## 4. Proposed seven-item chapter

Keep the current `ch29-l01` through `ch29-l06` IDs to protect references/progress; rewrite and reorder their purposes as shown. Add `ch29-test` as the separate assessment. If the content update is substantial, decide learner revisit/notice handling before promotion; do not silently alter completed content.

| Order / ID | Template | Proposed lesson | Evidence of understanding |
|---|---|---|---|
| 1 / `ch29-l01` | `STANDARD` | **A statement about someone or something.** Briefly retrieve a familiar nominal example such as **الْكِتَابُ كَبِيرٌ**. Identify the noun/pronoun-led core and **مبتدأ + خبر** in plain language. Add one carefully worded note that a sentence may contain a verb elsewhere without changing this basic classification. | Classify a fresh simple example and identify its topic and comment without relying only on memorized translation. |
| 2 / `ch29-l02` | `STANDARD` | **An action-led clause.** Contrast a known past-tense pattern such as **ذَهَبَ الرَّجُلُ** or another verified, already-taught verb. Identify the verb and doer. Clarify that this lesson introduces clause recognition, not a new tense. | Find the verb and doer in unseen, familiar-vocabulary examples. |
| 3 / `ch29-l03` | `STANDARD` | **Compare the two cores.** Use matched, simple examples where the meaning stays as similar as natural Arabic permits and word order changes. Explicitly introduce the limited heuristic: identify the core after any introductory particle/conjunction. Use **لَا أَعْبُدُ...** only to demonstrate **لَا** plus a verbal core, not to parse the relative clause in depth. | Correctly classify paired examples and explain what clue was used; do not treat the particle as the verb or noun that determines the core. |
| 4 / `ch29-l04` | `STANDARD` | **Previously learned particles in nominal statements.** Retrieve **إِنَّ** and **لَيْسَ** only as already-taught structures. Rehearse **إِنَّ الْبَيْتَ كَبِيرٌ**: اسم منصوب, خبر مرفوع. Do not teach a new rule or overload this lesson with two new paradigms. | Correct a deliberately mistyped familiar example and identify which part changes after **إِنَّ**. |
| 5 / `ch29-l05` | `STANDARD` | **Guided Quranic classification.** Use a small, editor-verified set of short excerpts, including no more than one Al-Kafirun example. Prefer contrast between a simple verbal core and a simple nominal core. If using **وَلَا أَنْتُمْ عَابِدُونَ...**, teach it as a nominal clause with an active participle predicate and particle prefix, and assess only after expert review. | Classify excerpts and justify with a taught clue. Do not require full iʿrāb or tafsir. |
| 6 / `ch29-l06` | `REVIEW` | **Mixed sentence-pattern review.** Interleave fresh simple nominal and verbal examples, particle-prefixed examples, and one retrieval item for the correct **إِنَّ** pattern. Avoid repeating the same verse/item from teaching. | Transfer classification and the Chapter 24 retrieval rule across balanced, varied practice. |
| 7 / `ch29-test` | `REVIEW` with `CHAPTER_TEST` assessment | **Chapter test.** Assess sentence-core classification, verb/doer recognition, particles preceding a core, accurate recognition of **إِنَّ**'s previously taught case effect, and bounded Quran transfer. | Unambiguous items, varied answer positions, no unsupported parsing labels, and the configured passing threshold. |

Five teaching lessons are appropriate here: the course needs to repair and clarify a foundational heuristic, not add more grammar breadth. The former fifth and sixth Al-Kafirun lessons should not survive as two separate near-duplicate lessons. The review and test are separate from the five teaching lessons, consistent with the adjacent chapter proposals.

## 5. Assessment blueprint

Use the current configured Chapter Test mechanism and verify its pass threshold at implementation time; do not invent a parallel test schema. A 12-item blueprint is recommended if that aligns with the active mechanism.

| Outcome | Questions |
|---|---:|
| Classify simple nominal and verbal cores | 4 |
| Identify verb and doer in verbal examples | 2 |
| Recognize a preceding conjunction/particle without misclassifying the core | 2 |
| Retrieve the correct **إِنَّ** pattern from Chapter 24 | 2 |
| Apply classification to short, verified Quranic examples | 2 |
| **Total** | **12** |

Do not test full iʿrāb, relative-pronoun parsing, unintroduced present tense, verse-number recall, or rhetorical/tafsir claims. Balance answer positions; vary true/false keys; verify that English and Urdu prompts ask the same thing and admit one defensible key.

## 6. Map, fixture and editorial requirements

1. Make the map's title, description, examples, hook, parse, conversation and focus records describe the same bounded sentence-core objective as the fixtures. Remove the stale **يَذْكُرُ** example unless it is explicitly a recognition-only preview and learner readiness is confirmed.
2. Preserve approved Chapter 24 content and wording. The canonical contrast is **الْبَيْتُ كَبِيرٌ → إِنَّ الْبَيْتَ كَبِيرٌ**; no Chapter 29 material may assert that خبر إنّ is accusative.
3. Have a qualified Arabic editor review clause classification, **عَابِدُونَ**'s role, the parsing of **وَلَكُمْ**, all particles, all case labels, and every answer key. The proposal does not substitute for scholarly review.
4. Have a qualified Quran editor verify exact Arabic, vocalization, verse reference, excerpt boundaries, translation and audio alignment. Separate grammar observation from tafsir or claims about divine or authorial intent.
5. Keep English and Urdu explanations aligned; update transliteration and plain Arabic along with vocalized Arabic. Check learner-facing strings for the same “always/never/no verb” overstatements in both languages.
6. Align each fixture's lesson order, template, IDs, metadata and assessment payload with `seed.cjs` and the curriculum map. Use only the canonical lesson schema and existing `CHAPTER_TEST` implementation.
7. Before promotion, validate fixtures, audit Urdu, check database/fixture sync, inspect the learner flow on Android and web, and stage only Chapter 29. Never run the full production seed. Decide how learners who completed materially incorrect content will receive an update notice or revisit opportunity.

## 7. Owner decisions

Review the bounded five-lesson teaching sequence plus review and test; the limited clause-core heuristic; the retrieval-only use of **إِنَّ**; the choice of Quran examples; the removal of the duplicate Al-Kafirun Tadabbur lesson from this chapter; and the completed-learner revisit approach. This proposal changes no map, fixture, database row or learner-facing content.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–5 | `ch29-l01`–`ch29-l05` | `STANDARD` | `chapter-29-lesson-01.json`–`-05.json` |
| 6 | `ch29-l06` | `REVIEW` (was `STANDARD`) | `chapter-29-lesson-06-review.json` |
| 7 | `ch29-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-29-lesson-07-final-test.json` |

**Corrections**

1. **لَا أَعْبُدُ** (Lesson 3) and **عَابِدُونَ / تَعْبُدُونَ** (Lesson 5) are glossed chunks. The imperfect is Chapter 34's topic (S11); here learners only classify the clause core.
2. **إِنَّ** is owned by Chapter 24 and **لَيْسَ** by Chapter 25; Lesson 4 names both as its retrieval sources.
3. Drop the current "Tadabbur unlock #5" wording when `ch29-l06` becomes the review.
