# Chapter 18 — Reading Connected Descriptions: content proposal

**Status:** Implemented 2026-09-23 (fixtures, seed, map, `scripts/promote-chapters-15-19.cjs`); staging-verified, production promotion pending. Deviations are recorded in `Docs/warsh-status.md` and the fixture `_meta._note`s.
**Scope:** Chapter 18 map and fixtures; six existing lesson IDs plus one proposed final test  
**Recommended structure:** Five teaching lessons, one integration review, one distinct final test

## 1. Decision and learner outcome

Rename the chapter from an apparent first introduction to **“Reading Connected Descriptions: الَّذِي / الَّتِي in Context.”** Chapter 6 already introduces masculine **الَّذِي** in a Quranic action chain and Chapter 8 already introduces feminine **الَّتِي** and contrasts the two. Chapter 18 must therefore advance comprehension, not repeat two introductory pronoun lessons and three near-identical gender drills.

At the end, the learner should be able to:

1. follow **الْوَسْوَاسِ الْخَنَّاسِ** in An-Nas 114:4 into **الَّذِي يُوَسْوِسُ** in 114:5, identifying what **الَّذِي** refers back to;
2. distinguish a simple adjective (**الْمَسْجِدُ الْكَبِيرُ**) from a description containing a clause (**الْمَسْجِدُ الَّذِي فِي الْقَرْيَةِ**);
3. choose between a definite antecedent plus **الَّذِي / الَّتِي** and an indefinite noun followed directly by a describing clause, within controlled examples;
4. read a short authored sentence containing a relative description without confusing the whole noun phrase with a complete main sentence;
5. recognize **الَّتِي** in a second, explicitly contextualized Quran example and distinguish it from **الَّذِي**; and
6. pass a distinct chapter test covering only those taught skills.

This is Quran-first reading comprehension, not a new tense chapter, full **صِلَةُ الْمَوْصُول** syntax course, or tafsir authority. Do not introduce a paradigm for dual/plural relatives, case parsing, resumptive pronouns, or present-tense conjugation merely to make examples seem advanced.

### Prior and later chapter boundaries

| Source | Already established / current status | Chapter 18 treatment |
|---|---|---|
| Chapter 4 | Definite nouns and adjective phrases | Retrieve the known adjective pattern to contrast it with a clause; no new adjective-agreement module. |
| Chapter 6 | **الَّذِي**, verbal descriptions, place/tool phrases, Quranic **الَّذِي خَلَقَ فَسَوَّىٰ** | No “introducing الَّذِي” lesson. New task: follow an antecedent across *two ayat* of An-Nas and distinguish clause from adjective. |
| Chapter 8 | **الَّتِي**, **الَّذِي / الَّتِي** contrast, feminine past forms, phrase vs sentence | No reintroduction or a full lesson of masculine/feminine sorting. New task: read relative descriptions in a longer context. |
| Chapter 17 | Daily past-action recognition is the current content; its repair is only proposed | Use already secure forms only; do not assume the Chapter 17 proposal has shipped or assess its new words. |
| Chapter 15 | Current seed focuses on demonstratives and position words; an unapproved proposal discusses later relative-form placement | Do **not** claim learners have mastered **الَّذِينَ**. Avoid plural-relative assessment here. |

Reusing An-Nas or a previously learned pronoun is deliberate only when the cognitive task is new: Chapter 6 identified a relative pronoun; Chapter 18 tracks its referent from the preceding ayah. Chapter 8 chose a feminine form; Chapter 18 reads its role in a whole clause.

## 2. Evidence and repairs required

The six existing `chapter-18-lesson-*.json` fixtures are all `STANDARD`. Lessons 1–5 contain six cards and eight exercises each; Lesson 6 has twelve cards and ten exercises. There is no `REVIEW` lesson or `assessment` payload/final test. The fixture validator and Urdu-presence audit currently pass, but neither verifies the grammatical correctness of a sentence or the idiom of its translation.

| Finding | Existing examples | Required correction |
|---|---|---|
| **A. Wrong answer keys teach a broken definite/indefinite pattern.** | Lesson 1 scores **رَجُلٌ الَّذِي**; Lesson 2 scores **امْرَأَةٌ الَّتِي**; Lessons 3–5 repeat **كِتَابٌ الَّذِي**, **مَدْرَسَةٌ الَّتِي**, **حَديقَةٌ الَّتِي**, etc. | For the intended standard construction, use **الرَّجُلُ الَّذِي يَقْرَأُ** versus **رَجُلٌ يَقْرَأُ**; **الْمَرْأَةُ الَّتِي تَقْرَأُ** versus **امْرَأَةٌ تَقْرَأُ**. Audit every card, option, build-sentence token, fill answer, true/false statement, wrong-answer explanation, and reveal—not just the displayed examples. [Michigan State's Arabic grammar chapter](https://openbooks.lib.msu.edu/arb201/chapter/3-2-grammar-in-context/) illustrates the definite/indefinite distinction. |
| **B. Relative clause is confused with an adjective.** | **قَلَمٌ الَّذِي جَدِيدٌ**, **حَديقَةٌ الَّتِي جَمِيلَةٌ**, and **بَيْتٌ الَّذِي كَبِيرٌ** are presented or scored as normal descriptions. | If only “a new pen / a beautiful garden / a big house” is intended, use direct adjective phrases **قَلَمٌ جَدِيدٌ**, **حَديقَةٌ جَمِيلَةٌ**, **بَيْتٌ كَبِيرٌ**. If a relative clause is essential, use a complete editor-approved clause, e.g. **الْقَلَمُ الَّذِي عَلَى الْمَكْتَبِ جَدِيدٌ**. Do not treat an adjective by itself as a relative clause. |
| **C. False absolute rules and role labels.** | Lesson 1 says the clause after **الَّذِي** “must be a complete verb sentence,” yet the chapter uses location descriptions; it also says **الَّذِي** works after an indefinite noun and its case appears on the following word. The curriculum map labels **الَّذِي** as **مضاف إليه**. Lesson 5 says every verb after **الَّتِي** must have one feminine-present form. | Teach the scoped distinction between a verbal clause and an understood nominal/location description; do not equate every description with a verb or infer the entire clause from one verb prefix. Correct the map token to **اسم موصول** (and label the following unit as the relative clause if needed). Leave deeper inflection and agreement exceptions for later. |
| **D. Quran hooks barely serve the objective.** | Lessons 1–5 show Al-Kafirun 109:1 or An-Nas 114:1–4; none contains the target **الَّذِي / الَّتِي**. Lesson 4's `MATCH_AYAH` tests **مَلِكِ النَّاسِ**, not a relative clause. | Use [An-Nas 114:4–5](https://corpus.quran.com/wordbyword.jsp?chapter=114&verse=5) from Lesson 1 onward. Contrast the adjective **الْخَنَّاسِ** in 114:4 with the **الَّذِي يُوَسْوِسُ** clause in 114:5. Use a separate verified **الَّتِي** occurrence for the feminine application. Any thematic verse must be explicitly labelled thematic. |
| **E. Integration overclaims.** | Lesson 6 calls itself “Tadabbur Unlock #2” and says the learner now understands all six ayat; it adds **يَسْرِقُ** (“steals”) and speculative jinn wording to an invented whisperer sentence. | Keep a respectful guided An-Nas reading, but distinguish authored practice from Quran quotation; do not turn the whisperer into a thief for a grammar drill, imply complete surah mastery from one lesson, or promise a technical unlock until the actual Tadabbur access flow is verified. |
| **F. Metadata and Urdu quality.** | Seed Lesson 4/5 Arabic titles contain unrelated **مُزَلْزِلٌ**; Lesson 6 seed title contains **تَحَابُّ**. Lesson 2 Urdu contains Russian **очевид** and Lesson 6 mixes English “pattern/apply” into Urdu prose. Curriculum and fixture source filenames differ and neither source was found locally. | Give each lesson an accurate Arabic/English/Urdu title; professionally rewrite all Urdu, including answer options and feedback; reconcile provenance with a genuine source or owner-approved new source. |

The linked [Quranic Arabic Corpus analysis](https://corpus.quran.com/wordbyword.jsp?chapter=114&verse=5) identifies **الْوَسْوَاسِ** as a noun, **الْخَنَّاسِ** as its adjective, **الَّذِي** as a masculine-singular relative pronoun, and **يُوَسْوِسُ** as a verb. Those four distinct jobs should be visible to the learner. Avoid presenting an invented sentence as Quranic text or implying that **الَّذِي** itself names evil.

## 3. Revised lesson plan

Keep all existing IDs and order. The rewrite changes the *task* of each lesson, rather than merely its title. A working target is 5–7 purposeful cards and 7–9 varied exercises per teaching lesson; do not pad to a fixed count. The review may use more items. All sample Arabic below is a design example pending Arabic editorial checking.

| Order / stable ID | Working title and outcome | Quran use and primary activity |
|---|---|---|
| 1 / `ch18-l01` | **Who does الَّذِي describe?** Track the referent of **الَّذِي** across An-Nas 114:4–5. | Show both ayat with their boundary intact. Point from **الَّذِي يُوَسْوِسُ** back to **الْوَسْوَاسِ الْخَنَّاسِ**; distinguish the noun, its adjective, the relative word, and the action. Reuse prior **الَّذِي** knowledge; no new paradigm. |
| 2 / `ch18-l02` | **The noun or a noun?** Choose a relative construction after a definite noun versus a direct describing clause after an indefinite noun. | Authored paired examples **الرَّجُلُ الَّذِي يَقْرَأُ / رَجُلٌ يَقْرَأُ** and a feminine pair **الْمَرْأَةُ الَّتِي تَقْرَأُ / امْرَأَةٌ تَقْرَأُ**. Return briefly to the *definite* **الْوَسْوَاسِ** in An-Nas, not a disconnected hook. |
| 3 / `ch18-l03` | **Adjective or clause?** Distinguish **الْمَسْجِدُ الْكَبِيرُ** from **الْمَسْجِدُ الَّذِي فِي الْقَرْيَةِ** and simple main sentences. | Quran retrieval: **الْخَنَّاسِ** is the adjective in An-Nas 114:4; **الَّذِي يُوَسْوِسُ** supplies a longer description in 114:5. Ask what each adds, not whether a noun is merely masculine or feminine. |
| 4 / `ch18-l04` | **The feminine relative in context.** Apply **الَّتِي** to one controlled Quran occurrence without redoing Chapter 8's introduction. | Candidate [Al-Mujadilah 58:1](https://corpus.quran.com/wordbyword.jsp?chapter=58&verse=1): **قَوْلَ الَّتِي تُجَادِلُكَ**. Give a supplied gloss: “the speech of the woman who disputes with you”; explain that **الَّتِي** can mean “the one who” without an immediately preceding explicit woman noun. This is *more advanced* than Chapter 8's feminine agreement, so make it recognition-only and have the scholarly editor approve suitability. If too complex, choose another verified feminine occurrence and document the new task versus Chapter 8's 89:8. |
| 5 / `ch18-l05` | **Read the whole sentence.** Identify the described noun, the added clause, and the main statement; compare meaning with the same sentence minus the clause. | Authored controlled pair **الْكِتَابُ جَدِيدٌ / الْكِتَابُ الَّذِي عَلَى الْمَكْتَبِ جَدِيدٌ**. One short question–answer about *which* known book or person is meant may be used, but no separate Conversation Lab or new tense formation. Revisit An-Nas 114:4–5 as retrieval. |
| 6 / `ch18-l06` | **An-Nas integration and Chapter 18 review.** Integrate the chapter's reading skills and a limited, accurate surah vocabulary check. Change template to `REVIEW`. | Guided read of An-Nas 114:1–6 using authentic ayah boundaries; focus assessment on 114:4–5 and only vocabulary explicitly taught earlier. A few supporting glosses are acceptable. Do not claim total understanding or a Tadabbur “unlock” without verifying the real product behavior. No new rule or vocabulary list to memorize. |
| 7 / `ch18-test` | **Chapter 18 final test.** Separate `REVIEW` lesson with `assessment.type = CHAPTER_TEST`. | 12 server-graded multiple-choice questions, `pass_score_percent: 80` (10/12), using the app's existing retry/reward behavior. No new material. |

### Exercise and feedback standards

- For each lesson, identify the *new reasoning step* before writing questions. Avoid another eight exercises that only select **الَّذِي** for masculine and **الَّتِي** for feminine.
- A `FILL_BLANK` must have exactly one defensible answer given the whole Arabic sentence. A true/false item must not mark malformed Arabic “True.” Vary answer position and include meaningful false statements, not a stream of `True` facts.
- The key contrast is **definiteness plus clause**, not “any masculine/feminine noun takes a matching relative pronoun.” Where **الَّتِي** is used independently in 58:1, explain that this is not the same shape as a definite noun directly before the pronoun.
- For beginners, use **who/that/which** according to the noun and context, not “the one who” as an English gloss forced into every sentence. Maintain the distinction between a *noun phrase* and a full main sentence.
- Every Quran exercise highlights a word actually present in its cited ayah. Where 114:4 and 114:5 are displayed together, preserve the verse numbers/line break and do not insert commas into the Arabic as though they are Quran text. Use author-created Arabic only in clearly marked practice examples.
- If a task adds a clause where the antecedent is not its subject (e.g. “the book that I read”), it needs a returning/linker pronoun and a separate teaching step; leave this out of Chapter 18's assessed scope. [Michigan State's examples](https://openbooks.lib.msu.edu/arb201/chapter/3-2-grammar-in-context/) illustrate why a simple English translation can hide that Arabic requirement.

### Final-test blueprint

| Skill | Questions |
|---|---:|
| Follow **الَّذِي** back to **الْوَسْوَاسِ** across An-Nas 114:4–5 | 2 |
| Choose a sound definite/indefinite relative-description construction | 3 |
| Distinguish adjective from clause, using an authored pair or 114:4–5 | 2 |
| Recognize **الَّتِي** in the approved second Quran excerpt | 1 |
| Identify the described noun and main statement in a short complete sentence | 2 |
| Match a Quran fragment to its faithful meaning and distinguish Quran text from authored text | 2 |
| **Total** | **12** |

No test item should require memorizing all six ayat, a new present-verb paradigm, plurals/duals, formal case analysis, or the untaught morphology of **يُوَسْوِسُ / تُجَادِلُكَ**. Review and test should measure the same outcomes with different instances, not duplicate questions.

## 4. Quran, language, and implementation gates after approval

1. **Arabic and scholarly review:** verify 114:4–5 and the optional 58:1 excerpt against the canonical Quran text, audio, verse references, word boundaries, and contextual translation. Confirm precisely what **الَّذِي** refers to; avoid overspecifying the whisperer's identity beyond the excerpt. Check all authored examples for definiteness, clause structure, agreement, and naturalness. The curriculum map's **الَّذِي = مضاف إليه** must be corrected.
2. **Urdu review:** rewrite English-shaped or mixed-script prose as idiomatic Urdu. Remove **очевид**, “pattern/apply,” mistranslated “whisperer,” unnatural adjective/relative terminology, and any Urdu option that no longer matches its corrected Arabic/English key. Review fields beyond cards: hook intro, exercise prompt, distractors, feedback, and reveal.
3. **Metadata/content:** align curriculum map, seed titles/templates/order, six fixture `_meta` records, and the new test fixture. The map names `reader_lecture_18_relative_pronouns.md`; Lessons 1–5 name `reader_lecture_book2_lesson7.md`; Lesson 6 names `tadabbur_an_nas.md`; none was found locally. Restore actual provenance or record owner approval of this proposal as the source. Keep stable `ch18-l01`–`ch18-l06` IDs and decide how substantially rewritten completed lessons will be presented for revisit without erasing progress.
4. **Product check:** inspect the actual Tadabbur progression and lesson/course code before using “unlock” language. Surah An-Nas exists separately in Tadabbur data as progression item 2; a lesson title alone does not prove a technical unlock. Keep the lesson as a comprehension bridge even if access to the Tadabbur feature follows separate rules.
5. **Verification:** build/test canonical lesson schema; run fixture, Quran-text, and Urdu audits; then perform a manual *semantic* pass of every graded answer and wrong-answer explanation. Stage Chapter 18 only in the isolated local DB. Walk all seven items in English and Urdu on Android/web, checking Arabic rendering, verse highlights, audio after text edits, review, assessment gating, and progress continuity. Verify 9/12 fails and 10/12 passes. Export Studio edits and require `content:check` before any scoped production promotion. Never run the full production seed.

## 5. Decisions for the owner

Please review: (a) the new chapter purpose and six-lesson sequence, (b) whether the optional 58:1 feminine example is appropriately challenging, (c) the limited An-Nas integration rather than a promised Tadabbur unlock, (d) the separate final test, and (e) how existing completions should receive a revisit notice after major corrections. This document changes no learner-facing content or production data.
