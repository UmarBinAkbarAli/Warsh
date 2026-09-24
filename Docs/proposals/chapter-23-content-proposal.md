# Chapter 23 — Book 2 Reading Consolidation: content repair proposal

**Status:** Approved with the review amendments in section 7 and implemented 2026-09-24  
**Scope:** Chapter 23 map, four existing fixtures/seed rows, one proposed review, and one proposed final test  
**Recommended structure:** Four applied-reading lessons, one mixed review, one distinct cumulative final test (six items)

## 1. Decision and learner outcome

Rename the chapter from **“Grammar Structures Consolidated”** to **“Book 2 Reading Consolidation.”** Its purpose is to **combine skills already taught** so learners can understand a short, connected Arabic text—not to introduce a new grammar table or claim that every structure occurs in one Quran verse.

By the end, a learner should be able to:

1. distinguish a demonstrative, the noun phrase it points to, and an idafa or noun-attached owner within a short sentence;
2. track the antecedent of a taught singular relative pronoun and the referent of a taught attached pronoun in a connected sentence;
3. identify action/doer, place or direction phrase, and a familiar plural noun within a short school/journey scene;
4. follow a brief question–answer exchange and identify who spoke and what answer addresses the question;
5. read **several short, verified Quran excerpts**, identifying only the structures actually present and separating independent pronouns from attached endings; and
6. pass a separate cumulative chapter assessment.

No new present/future paradigm, full case theory, untaught relative forms, step-by-step directions, or speculative tafsir belongs here. Book 1 forms can be deliberately retrieved when they are part of a Book 2 combination; the assessment must test the **combination**, not merely another isolated translation of an old word.

## 2. Curriculum dependency and coverage

| Earlier chapter(s) | Retrieval target in Chapter 23 | Guardrail |
|---|---|---|
| 3–5, 14–15 | Idafa, demonstratives, phrase versus complete sentence | Apply to a new sentence; do not restage their initial lessons. Chapter 15 revisions must be checked against the published state before release. |
| 16–17 | Familiar school/time words and an action with its doer | Use as scene context; do not test untaught tense or dual forms. |
| 18 | **الَّذِي / الَّتِي** and a supplied antecedent | Keep a relative-clause task distinct from pronoun-suffix recognition. |
| 19–20 | Noun-attached singular/plural pronouns and recognition-only noun-versus-verb attachment contrast | Do not treat **هُوَ** as attached or **ـنَا** as meaning “our” on every word. Chapter 20's proposed repairs are not yet an implemented prerequisite. |
| 21 | Origin/destination and movement verb in a supported scene | Avoid a second place-word list or new directions grammar. Chapter 21's proposal is not presumed live. |
| 22 | Speaker, question, relevant answer, understanding | One short comprehension task, not another standalone Conversation Lab. Chapter 22's proposal is not presumed live. |

**Release dependency:** This chapter can be designed and editorially reviewed now, but its final tasks and scoring must be rechecked against the **actually published** content of Chapters 18–22, especially proposed fixes in 20–22. Do not promote a Book 2 capstone that tests a form, phrase, or dialogue function that the preceding chapter has not reliably taught. If those repairs are deferred, narrow Chapter 23's graded blueprint accordingly or hold its release. Chapter 23 should not silently make an unapproved proposal a requirement.

## 3. Findings to repair

1. **Lesson 1 invents idafa in Al-Kawthar.** `ch23-l01` describes **الْكَوْثَرَ** in [Al-Kawthar 108:1](https://corpus.quran.com/wordbyword.jsp?chapter=108&verse=1) as an idafa whose **ال** is a possessor, and even calls the word nominative. It is a definite accusative noun there, not idafa. The same lesson claims the first noun of every idafa is nominative; its case depends on the larger sentence. The example **هَذَا بَيْتُ الطَّالِبِ** is a complete demonstrative sentence: **هَذَا** is the subject and **بَيْتُ الطَّالِبِ** the predicate. The scored `GRAMMAR_PARSE` instead marks **بَيْتُ** as `SUBJECT`. Replace the Quran hook, general rule, and answer key together.
2. **Lesson 2 conflates independent and attached pronouns.** `ch23-l02` calls **هُوَ** in [Al-Ikhlas 112:1](https://corpus.quran.com/wordbyword.jsp?chapter=112&verse=1) an attached pronoun. It is an independent word; **ـي** in **كِتَابِي** and **ـنَا** in **رَبَّنَا** are attached endings. Its label *al-asmāʾ al-badaliyyah* is not an appropriate name for these pronouns. The lesson also introduces relative forms afresh rather than asking learners to track an antecedent in a meaningful sentence. Its **رَبُّ الْعَالَمِينَ** parse assigns a sentence `SUBJECT` to an isolated phrase with no supplied syntactic context; avoid scoring invented sentence roles.
3. **Lesson 3 contains a fabricated Quran quote and a false verb rule.** `ch23-l03` claims [Al-Falaq 113:5](https://corpus.quran.com/wordbyword.jsp?chapter=113&verse=5) says **مِنْ شَرِّ النَّوْمَةِ** (“from the evil of the sleepless night”); the verse actually contains **وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ**. It claims Form I past verbs can be recognized by a **فَـ** prefix; that is not the Form I marker. It adds new **أَكَلَ، شَرِبَ، مَطْعَمٌ** vocabulary and another four-preposition list instead of integrating prior Book 2 skills. The `GRAMMAR_PARSE` labels **أَخِيهِ** after **إِلَى** as `OBJECT` without a role for “noun governed by a preposition,” making the item misleading.
4. **Lesson 4 claims one ayah contains patterns that are not there.** In [Al-Falaq 113:1](https://corpus.quran.com/wordbyword.jsp?chapter=113&verse=1), **رَبِّ الْفَلَقِ** is idafa and **رَبِّ** is genitive after **بِـ**; there is no demonstrative, taught relative pronoun, or attached possessive ending in that ayah. The lesson calls **رَبِّ** nominative and marks it `SUBJECT` in a scored parse. It presents authored **الَّذِي خَلَقَ الْفَلَقَ** as though it appears in Al-Falaq. Its **الَّتِي خَلَقَ الْإِنسَانَ وَالْجَانَّ** exercise is not a valid model for the intended “the one who created” meaning and has no supplied antecedent. Its [Al-Ikhlas 112:1](https://corpus.quran.com/wordbyword.jsp?chapter=112&verse=1) reveal calls **اللَّهُ أَحَدٌ** an idafa; it is not.
5. **The chapter map overpromises and misparses.** The [Al-Baqarah 2:201](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=201) hook is useful, but **رَبَّنَا** has noun-attached “our,” whereas **آتِنَا** has verb-attached “us.” The map calls this a traveller's supplication and says it uses *everything* from Book 2; neither is an appropriate learning claim. In **ذَهَبَتْ إِلَى مَدْرَسَتِهَا**, **مَدْرَسَتِهَا** is governed by **إِلَى**, not an `مضاف إليه` after that preposition. Correct every map example, parse, focus, and tip against the new objectives.
6. **The product progression is incomplete.** All four seeded Chapter 23 items are `STANDARD`; there is no `REVIEW` or distinct `CHAPTER_TEST`. Several exercises score single-word glosses or the false parses above instead of connected reading. The map source `reader_lecture_23_book2_consolidation.md` and fixture source `reader_lessons_11-13_integration.md` differ, and neither was found locally. Confirm provenance. All Urdu and transliteration must be edited after the Arabic and Quran targets are corrected.

**Assessment-design rule:** A token in a real sentence may have *more than one description* (e.g., a demonstrative can serve as subject; a noun can be first in idafa and also governed by a preposition). If the current `GRAMMAR_PARSE` role set cannot represent the distinction fairly, replace that item with a narrower question rather than forcing an incorrect `SUBJECT`, `OBJECT`, or `POSSESSIVE` label. Do not invent a second lesson schema.

## 4. Proposed six-item sequence and stable IDs

Keep `ch23-l01`–`ch23-l04` at orders 1–4 but rewrite their jobs. Add `ch23-l05` as `REVIEW` at order 5 and `ch23-test` as a distinct `REVIEW` assessment at order 6. This avoids changing existing IDs while making the fourth lesson a genuine Quran-reading application rather than a mislabeled “full review.” Substantially changed completed lessons require an owner decision on revisits.

| Order / ID | Working lesson | Integration target and evidence |
|---|---|---|
| 1 / `ch23-l01` | **Pointing, ownership, and sentence meaning** | Apply known demonstratives to a complete authored idafa sentence such as **هَذَا كِتَابُ الطَّالِبِ** and distinguish it from a pointing *phrase*. In [Al-Baqarah 2:5](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=5), identify **أُولَٰئِكَ** and **رَبِّهِمْ** and infer the referent only with 2:2–4 context supplied. This is a deliberate new reading of a familiar ayah: the task is the relationship between pointer, referent, and attached owner—not the Chapter 13 plural or Chapter 15 pointer gloss in isolation. Do not call **الْكَوْثَرَ** idafa. |
| 2 / `ch23-l02` | **Who is described, and whose is it?** | In two short *authored* sentences, link **الَّذِي / الَّتِي** to an explicit antecedent and identify one noun-attached singular or plural owner. Contrast an independent pronoun such as **هُوَ** with a suffix only as recognition. Keep the relative-clause and suffix tasks separate enough that a wrong answer reveals which link the learner missed. Use familiar verbs and nouns; do not require a new relative plural, Form I paradigm, or full case parse. |
| 3 / `ch23-l03` | **Read the small scene** | Read a connected school/journey scene using a familiar time word, a movement or speech verb, source/destination or location phrase, and a familiar plural noun. Ask **who did what, where/from where/to where, and when**, then connect a relevant reply if spoken. This revisits Chapters 16–17 and 21–22 with a new *whole-scene comprehension* task rather than four word lists. Every authored Arabic sentence needs editorial review before use. |
| 4 / `ch23-l04` | **Quran reading across real excerpts** | Compare *separate* verified excerpts: [2:201](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=201) for **رَبَّنَا / آتِنَا** (“our” on noun versus “us” on verb) and **فِي الدُّنْيَا**; [113:1](https://corpus.quran.com/wordbyword.jsp?chapter=113&verse=1) for **بِرَبِّ الْفَلَقِ** (preposition plus idafa); optionally [112:1](https://corpus.quran.com/wordbyword.jsp?chapter=112&verse=1) for independent **هُوَ**. Ask one or two bounded questions per excerpt; do not claim any excerpt contains all Book 2 forms. Quran context, attribution, exact vocalization, and interpretation need scholarly review. |
| 5 / `ch23-l05` | **Book 2 mixed review** | New `REVIEW` lesson. Interleave three *fresh* mini-scenes and two verified Quran targets. Include one reflect-and-correct item for a common confusion (e.g., independent **هُوَ** versus suffix **ـهُ**, or **رَبَّنَا** versus **آتِنَا**). No new grammar or verse assertion. |
| 6 / `ch23-test` | **Chapter 23 cumulative final test** | New `REVIEW` lesson with `assessment.type = CHAPTER_TEST`, 16 server-graded questions and `pass_score_percent: 80` (13/16). This is intentionally longer than a single-form chapter test because it samples several prior chapters. Apply the existing unlimited-retry, unlock, completion, and reward rules. |

There is **no new Conversation Lab in Chapter 23**: Chapters 21 and 22 have provisional labs for their own purposes. This capstone measures whether learners can *read and connect* those skills. A lab here would mostly replay earlier exchanges unless a distinct conversational outcome were justified.

### Cumulative final-test blueprint

| Outcome | Questions |
|---|---:|
| Demonstrative/idafa or noun-attached owner in a complete sentence | 3 |
| Relative antecedent and pronoun referent in connected reading | 3 |
| Action/doer, familiar plural, time and place/direction in a mini-scene | 3 |
| Speaker, question and relevant answer in a short exchange | 2 |
| Bounded recognition of verified Quran targets from the teaching lessons | 3 |
| Independent versus attached pronoun, or noun- versus verb-attached **ـنَا** | 2 |
| **Total** | **16** |

At 80%, 12/16 must fail and 13/16 must pass. Final-test questions must use new sentences or excerpts with supplied context, not memorized card wording. Do not test a proposed Chapter 20 feminine-plural form, Chapter 21 landmark construction, or Chapter 22 repair phrase unless that prerequisite has actually been taught and released. Avoid verse-number trivia, fabricated quotation, ambiguous pronoun referents, and answer keys that require untaught theology or case theory.

## 5. Editorial and release checks after approval

1. Lock the **actual published prerequisite set** before authoring the final test. Reconcile any differences between current Chapter 20–22 fixtures and their unapproved proposals. If a prerequisite changes after Chapter 23 is authored, repeat the coverage audit and adjust the test, not just its explanatory text.
2. Have an Arabic editor and Quran reviewer verify every authored example, Quran excerpt, source reference, morphology, translation, immediate referent, and zero-based highlighted token. Keep exact Quran quotation separate from authored practice in metadata and UI. Fix the fabricated 113:5 line and false 108:1, 112:1, and 113:1 analyses; do not merely replace their indices.
3. Rewrite all four fixtures under stable IDs, add review and test fixtures/seed rows, and align chapter title, map, `_meta.lesson_order`, template, source metadata, and canonical `@warsh/lesson-schema` structures. Decide how previously completed Chapter 23 lessons will be marked for revisit, if at all, before promotion.
4. Independently edit Urdu cards, prompts, options, feedback, reveals, review, and test after the Arabic is locked. Recheck transliteration, `ar_plain`, answer uniqueness, complete-sentence versus fragment glosses, and every graded parse. Prefer concrete reader questions when one-label grammar parsing cannot express the truth.
5. Run schema tests, fixture validation, Urdu audit, exact Quran-target audit, and a human semantic pass. Stage only Chapter 23 in the isolated local database. Walk six items on Android/web in English and Urdu, including Quran highlight/audio, lesson audio regenerated after Arabic edits, directionality, review/test gating, 12/16 versus 13/16 score threshold, retries, and progress continuity.
6. Export any Studio edits and require `content:check` before a scoped production content update. **Never run the full production seed.** This proposal itself changes no learner-facing fixture, application code, or database row.

## 6. Owner decisions requested

Approve or revise the six-item capstone structure, the proposed Quran excerpt set, the 16-question cumulative assessment, the dependency on published Chapter 20–22 fixes, and the revisit policy for learners who completed the old four lessons. These decisions precede fixture authoring and promotion.

## 7. Review amendments (owner-approved 2026-09-24) and implementation

1. **Lesson 1 anchor:** Al-Baqarah 2:5's "who are أُولَٰئِكَ? look back at 2:2–4" task is Chapter 15 L4's exercise almost verbatim. Lesson 1 uses Ta-Ha 20:17–18 instead — وَمَا تِلْكَ بِيَمِينِكَ يَا مُوسَىٰ / قَالَ هِيَ عَصَايَ: a pointer, an owner ending, a question and an answer with قَالَ, and the separate هِيَ beside ـيَ.
2. **Other anchors:** Al-Baqarah 2:21 رَبَّكُمُ الَّذِي خَلَقَكُمْ (Lesson 2) and Al-Qasas 28:21 (Lesson 3, a movement then speech).
3. **Release dependency:** Chapters 20–22 were rebuilt and released together with this chapter, so every combined skill tested is taught. The promote script checks the 16-question test.

**Status:** Implemented 2026-09-24 — `ch23-l01`–`l04` rewritten, `ch23-l05` review and `ch23-test` (16 questions, 13/16 to pass) new; staging-verified and promoted to production the same day.
