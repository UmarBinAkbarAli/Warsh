# Chapter 59 — Book 6 Capstone: Content Proposal

**Status:** Proposal only; not approved or implemented  
**Scope:** Chapter 59 lesson map and fixtures only after owner approval  
**Current source:** `warsh-backend/prisma/curriculum-books5-6.cjs` and `warsh-backend/prisma/fixtures/chapter-59-lesson-01.json` through `chapter-59-lesson-05.json`

## Recommendation

Rebuild Chapter 59 as a retrieval-and-integration capstone, not as a place to introduce new grammar or to assert that the learner has mastered all of Book 6. Preserve the useful idea of analyzing connected Qur'anic text, but replace the inaccurate examples and explanations, make the sequence depend on the learner-facing content actually approved in Chapters 55–58, and add a distinct `REVIEW` lesson carrying the canonical `CHAPTER_TEST` assessment payload. Keep a separate formative review before that test.

The existing five lessons are not a sound basis for assessment: four `STANDARD` lessons reteach material with serious errors and the fifth `REVIEW` has no assessment payload. A test written against current claims would grade misconceptions. The Chapter 55–58 proposals are not approved requirements; consequently this proposal treats them as pending dependencies, not as settled curriculum.

## Audit findings

| Severity | Finding | Proposed correction |
|---|---|---|
| Critical | Lesson 1 misidentifies the syntax of Al-Mulk 67:1. It calls **الْمُلْكُ** the subject of a nominal sentence and assigns the wrong case explanation; it also gives the misspelled **بِيَدِيهِ** and an invalid account of the preposition. The verse has **بِيَدِهِ**. The phrase **بِيَدِهِ** is جار ومجرور; the genitive noun is **يَدِ**, and its attached pronoun is genitive by iḍāfa. The corpus describes **تَبَارَكَ الَّذِي** as a past verb with its subject, not a “verb of wonder.” | Remove or rebuild the example from a verified word-by-word parse. Teach only the roles needed for the capstone and mark any debated higher-level analysis for reviewer confirmation. Do not make **قَدِيرٌ** part of a supposed 67:1 parse: it belongs to the continuation **وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ** and is not an adjective of **الْمُلْكُ**. |
| Critical | Lesson 2 claims **جَبَلٍ** is a maqṣūr noun, invents case forms involving a final yāʾ, and prints **مُتَصَدِّرًا** instead of Qur'anic **مُتَصَدِّعًا**. It gives a false root/meaning for the misspelling, misparses **هَذَا الْقُرْآنَ**, and claims the verse assembles concepts it does not contain. | Correct the verse and parse **الْقُرْآنَ** as the object of **أَنْزَلْنَا**, with **هَذَا** as a demonstrative associated with it; **عَلَىٰ جَبَلٍ** is a prepositional phrase and **جَبَلٍ** is an ordinary genitive noun, not maqṣūr. In **لَرَأَيْتَهُ خَاشِعًا مُتَصَدِّعًا**, teach the two accusative حال forms only after verifying the antecedent and scope with a qualified reviewer. |
| Critical | Lesson 3 conflates lexical weak-verb classes with the syntactic label **فعل ناقص**, misclassifies **قَالَ** and other roots, confuses noun case/tanwīn with verb mood, and makes unsupported frequency and “every page/majority of verbs” claims. The map calls **إِبْرَاهِيمُ** either a mubtada or a subject in a verbal clause and treats **رَبِّ** as a simple vocative without enough context. | Remove frequency and universal claims. If weak morphology is in capstone scope, retrieve only verified roots and forms already taught. Distinguish **أجوف/ناقص** (morphological weak classes) from **كان وأخواتها** as syntactically ناقصة. Use a verified excerpt and parse each item consistently; do not imply this capstone teaches weak-verb morphology from scratch. |
| Critical | Lesson 4 says the five verbs end only in **ـُونَ / ـِينَ**, are fixed/mabnī, and omits the two dual forms. It contains **تَنعَوْنَ** instead of **تَنْهَوْنَ** and mismatches the five-form rule with its own Qur'anic example. | Teach the complete five forms—**يَفْعَلَانِ، تَفْعَلَانِ، يَفْعَلُونَ، تَفْعَلُونَ، تَفْعَلِينَ**—only as retrieval of prior instruction. They are muʿrab: nūn retention marks rafʿ, and nūn deletion marks naṣb/jazm. Parse the exact form in its context; note that **تَأْمُرُونَ** and **تَنْهَوْنَ** occur in 3:110. |
| Critical | Lesson 5's Al-Baqarah 2:164 hook calls **خَلْقِ** a muḍāf ilayh, labels **السَّمَاوَاتِ** maqṣūr, mistakes the emphatic lām in **لَآيَاتٍ** for purpose lām, and says the noun is accusative. | Replace the hook or rebuild its parse. In 3:190 the emphatic lām prefixes **آيَاتٍ**; **آيَاتٍ** is the delayed ism of **إِنَّ**, منصوب with kasra as the sound feminine plural's case sign, while the prepositional phrase **فِي خَلْقِ...** is the fronted khabar. In 2:164, **خَلْقِ** is genitive after **فِي** and is itself a muḍāf to **السَّمَاوَاتِ**. Do not merge two verses or lām functions into one rule. |
| High | Chapter map says the learner parsed every word of 9:33 but labels **هُوَ**/**الَّذِي** as mubtada/khabar, calls **بِالْهُدَى** a single preposition, and overgeneralizes Form IV's prefix as uniformly causative. The verse map and fixtures do not agree on the exact excerpt or parse. | Reconcile map, focus cards, hook, token highlights, and lesson content from one source-checked excerpt. For the excerpt **هُوَ الَّذِي أَرْسَلَ رَسُولَهُ بِالْهُدَى وَدِينِ الْحَقِّ**, identify **الَّذِي** as a relative pronoun, **أَرْسَلَ** as Form IV perfect, **رَسُولَهُ** as its object, and **بِالْهُدَى** as جار ومجرور. Have the full clause relationship reviewed before naming **هُوَ**'s exact role. Describe Form IV pattern and the contextual meaning, not a universal causative formula. |
| High | No distinct chapter completion test exists. Lesson 5 is typed `REVIEW` but has no `assessment` payload; it cannot fulfill the product's chapter-test contract. | Keep formative retrieval distinct from a final `REVIEW` lesson with `assessment.type: "CHAPTER_TEST"`, `chapter_order: 59`, mapped questions, backend grading, retries, and completion behavior. Derive question coverage only from corrected and approved prerequisite outcomes. |
| High | “Full framework,” “all grammar concepts,” “Book 6 complete/mastered,” “the grammar science apex,” and “on every page” promise more coverage than five flawed lessons can establish. | Use bounded language: “integrate selected Book 6 patterns from Chapters 55–58.” Completion indicates passing this chapter's mapped assessment, not mastery of all Arabic grammar or every Qur'anic construction. |
| Medium | Current chapter is four re-teaching lessons plus a review, with a proposed Book 7 preview that asserts a specific spiral/topics without verifying the next chapter. | Make the instructional work guided synthesis of material actually taught, not four new full grammar lectures. If a preview remains, align it to Chapter 60's approved map when that chapter is audited; otherwise remove it. |

### Evidence references

- Quranic Arabic Corpus, Al-Mulk 67:1: [verse grammar](https://corpus.quran.com/grammar.jsp?chapter=67&verse=1), [word morphology of **بِيَدِهِ**](https://corpus.quran.com/wordmorphology.jsp?location=%2867%3A1%3A3%29).
- Quranic Arabic Corpus, Al-Hashr 59:21: [word-by-word morphology](https://corpus.quran.com/wordbyword.jsp?chapter=59&verse=21), [verse grammar](https://corpus.quran.com/grammar.jsp?chapter=59&verse=21). These identify **جَبَلٍ** as a genitive noun and **خَاشِعًا، مُتَصَدِّعًا** as the two حال forms in the referenced analysis.
- Quranic Arabic Corpus, At-Tawbah 9:33: [word-by-word morphology](https://corpus.quran.com/wordbyword.jsp?chapter=9&verse=33). This distinguishes **الَّذِي** as a relative pronoun and **بِالْهُدَى** as preposition plus genitive noun.
- Quranic Arabic Corpus, Aal ʿImran 3:190: [word-by-word analysis](https://corpus.quran.com/wordbyword.jsp?chapter=3&verse=190), [verse grammar](https://corpus.quran.com/grammar.jsp?chapter=3&verse=190), [word morphology of **خَلْقِ**](https://corpus.quran.com/wordmorphology.jsp?location=%283%3A190%3A3%29). The Corpus analyzes the lām on **لَآيَاتٍ** as emphatic, **آيَاتٍ** as accusative (the delayed ism of **إِنَّ**, with kasra as the sound feminine plural's case sign), and the fronted **فِي خَلْقِ...** phrase as khabar. A reviewer should preserve this distinction between syntactic case and surface marker.
- Quranic Arabic Corpus, Aal ʿImran 3:110: [verse grammar](https://corpus.quran.com/grammar.jsp?chapter=3&verse=110). Consult the actual excerpt and its surrounding **كَانَ** clause before writing a simplified exercise explanation.
- Product contract: `Docs/warsh-product-spec.md` §6, “Interaction rules”: a chapter final test is a distinct `REVIEW` lesson with an `assessment` payload; the backend grades it and it controls chapter completion.

## Prerequisites and sequencing gate

1. Review and obtain approval for the relevant Chapter 55–58 corrections before authoring a scored Chapter 59 test. Their current proposals are not implemented requirements.
2. Make a short, explicit outcome list from the approved, learner-facing versions of Chapters 55–58. Exclude any concept that has not been taught accurately and practiced sufficiently. A proposal or chapter map alone is not proof of learner readiness.
3. Keep Chapter 59 within that outcome list. A capstone may connect existing skills; it should not be the first instruction for a grammar rule.
4. If prerequisite scope remains unsettled, publish no assessment claims and defer the final test until the sequence is reconciled.

## Proposed lesson sequence

Seven lessons are recommended: five guided capstone lessons, one formative review, and one distinct final assessment. This is deliberate practice depth for a capstone, not seven new grammar topics.

1. **Capstone orientation: retrieve before parsing** (`STANDARD`, revise). Use a short diagnostic to retrieve the approved distinction between form and syntactic role (including muʿrab/mabnī only if taught accurately). Model a repeatable parse routine: identify the clause boundary, identify the word/form, determine its role from context, then justify its case/mood marker. Avoid the claim that a learner must classify every word as the universal first step.
2. **Nominal patterns in connected text** (`STANDARD`, rebuild). Apply only approved noun outcomes (e.g. case, special noun forms, iḍāfa) to one short, verified excerpt. Contrast syntactic role with the surface sign, especially sound feminine plural. Use either 3:190 or 67:1 as a carefully bounded passage, not a mash-up of both.
3. **Verbal morphology and clause roles** (`STANDARD`, rebuild). Integrate accurately taught verb form, weak-root pattern, subject/object, and mood outcomes as applicable. Use a source-checked passage; present **أَرْسَلَ** as Form IV perfect in 9:33 or use approved earlier examples. Do not claim that a weak verb is necessarily syntactically ناقص.
4. **Governors and changing endings** (`STANDARD`, revise). Integrate only previously taught governing particles and forms (such as the five verbs if their forms and endings are repaired upstream). Use contrastive minimal pairs showing the actual governor, form, and ending change; do not make a single lām do two different jobs. Keep the purpose-lām in 9:33 separate from emphatic **لَـ** in 3:190.
5. **A supported multi-clause Quranic parse** (`STANDARD`, rebuild). Walk through a single short excerpt in layers: clause boundary, phrase grouping, word roles, then endings. Use 59:21 only if its terms are in approved scope; **جَبَلٍ** must not be used as a maqṣūr example. Clearly mark advanced or disputed analysis as outside the lesson rather than guessing.
6. **Book 6 retrieval review** (`REVIEW`, revise). Formative mixed practice across the final approved outcomes. Include explanation-rich feedback, balanced item difficulty, and at least one connected-text task. Ensure distractors diagnose specific errors without teaching a false rule. This lesson does not unlock chapter completion.
7. **Chapter 59 final test** (`REVIEW`, new). A distinct `CHAPTER_TEST` mapped to approved outcomes and valid for backend grading/completion. Include a passage-based parse plus focused items, but do not require unsupported full-verse parsing or unintroduced labels. Set the passing score and retry behavior in line with the product contract and a documented assessment blueprint; do not infer them from the current broken review.

If prerequisite revisions leave fewer than four distinct, well-practiced outcomes, reduce/recombine the teaching lessons rather than padding the capstone. If they establish a broader approved outcome set, add practice only where it improves demonstrated coverage—not simply to normalize the chapter to a fixed lesson count.

## Assessment blueprint requirements

Before writing the test, create a table mapping each item to: approved source lesson/outcome, skill tested, expected response, accepted Arabic normalization (where relevant), rationale for each distractor, and scoring weight. Balance the test across retrieval and transfer; include no item whose answer depends on the defective current Chapter 59 text. Do not test every concept appearing in a verse merely because it is visible there.

The final fixture must:

- use `template: "REVIEW"` and include `assessment.type: "CHAPTER_TEST"` and `assessment.chapter_order: 59`;
- follow the canonical schema and completion rules, with unique question IDs and fully populated English/Urdu learner text;
- test only outcomes taught in corrected, approved lessons and in the prerequisites;
- provide concise, accurate explanations after answers and avoid absolute claims of total mastery;
- use a Quran-verified Arabic excerpt/reference/translation and separately review each grammatical parse and highlight;
- remain the distinct final lesson, after all regular Chapter 59 lessons; the formative review remains a separate preceding lesson.

## Editorial and acceptance criteria

Before approval/implementation, have a qualified Arabic grammar reviewer check the morphology, clause roles, governors, case/mood signs, and every answer key. Have a Quran-text reviewer verify exact orthography, verse references, excerpt boundaries, translation, and recitation/audio alignment. Use the Quranic Arabic Corpus as a cross-check, not as the sole authority for disputed iʿrāb. Audit English, Urdu, Arabic, transliteration, concept cards, quiz feedback, answer choices, and reveal highlights together.

Chapter 59 is ready to implement only when:

- every tested outcome can be traced to accurate, approved prerequisite instruction and prior practice;
- all five current lessons' false claims and corrupted Qur'anic forms are removed or reconstructed from verified sources;
- the `تَبَارَكَ`/67:1, 59:21, 9:33, 3:110, and 2:164/3:190 examples are not conflated and each appears only with a reviewed parse;
- Form IV, weak-root classes, syntactic **ناقص**, the five verbs, case, and mood are distinguished accurately;
- a formative `REVIEW` and a separate final `REVIEW`/`CHAPTER_TEST` both exist and perform different jobs;
- completion messaging describes the measured scope, not universal Quran-parsing mastery or all Arabic grammar;
- the chapter map, fixture count/order, focus cards, hooks, audio, assessment, and source metadata agree.

After approval and implementation, validate with the lesson schema, Quran-text audit, Urdu audit, and the assessment/backend completion tests. Run `npm run content:check` before any fixture sync. This proposal does not authorize fixture edits, database writes, content synchronization, or publication.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–4 | `ch59-l01`–`ch59-l04` | `STANDARD` | `chapter-59-lesson-01.json`–`-04.json` |
| 5 | `ch59-l06` (new) | `STANDARD` | `chapter-59-lesson-05.json` |
| 6 | `ch59-l05` | `REVIEW` | `chapter-59-lesson-06-review.json` |
| 7 | `ch59-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-59-lesson-07-final-test.json` |

**Corrections**

1. The "defer the final test if prerequisites are unsettled" gate is satisfied by approving Chapters 55–58 in the same pass (D1); build the test.
2. As the Book 6 capstone the test may use 16 questions (13/16); otherwise 12 (S1).
3. **خَاشِعًا مُتَصَدِّعًا** (59:21) and the purpose **لِـ** in 9:33 (**لِيُظْهِرَهُ**) are read for meaning only: **حال** is Chapter 71 (S12) and purpose **لِـ** as a naṣb trigger has not been taught.
4. 3:190's **لَآيَاتٍ** uses the same analysis as Chapters 52–53 (delayed **اسم إنَّ**, fronted predicate).
