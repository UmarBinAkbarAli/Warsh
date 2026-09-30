# Chapter 55 — Iʿrāb: Why Word Endings Change

**Status:** Proposal only — not approved or implemented  
**Evidence reviewed:** Active product and technical specifications; the Chapter 55 curriculum-map entry; all eight Chapter 55 lesson fixtures; the Chapter 54 proposal for transition alignment; and the Chapter 56–59 map entries for forward scope. Quran excerpts and selected grammar claims were checked against the Quranic Arabic Corpus and verse-specific references linked below. No fixture, database, or curriculum-map content has been changed.

## Recommendation

Rebuild Chapter 55 as a careful first encounter with **iʿrāb**: learners should understand that endings can signal grammatical relationships, distinguish nominal case from verb mood, recognize **muʿrab** versus **mabnī**, and apply a small set of common roles and structures in supported examples. Do not present a first chapter as a complete parsing manual.

The current eight lessons have substantial content accuracy problems, not just wording issues. The opening lesson confuses noun case with verb mood and misreads its Quran example; the next calls Ādam indeclinable despite using it as declinable elsewhere; Lesson 3 parses an **إِنَّ** clause as a basic nominal sentence; and later lessons misidentify genitive, accusative, iḍāfa, and Quranic constructions. The map lists six focuses while the fixtures contain eight teaching lessons, with no formative retrieval review or distinct final test.

Use **seven focused instructional lessons, one formative REVIEW, and one separate CHAPTER_TEST REVIEW**. Consolidate foundational material and defer **mafʿūl muṭlaq** to the later advanced-syntax unit (Chapter 58), subject to confirming its prerequisite sequence when that chapter is proposed. Leave alternate/irregular case signs to Chapter 56, weak verbs and the five verbs to Chapter 57, and broader syntax to Chapter 58. This gives the learner enough guided depth without loading every Book 6 concept into its opening chapter.

## Continuity and boundaries

- Chapter 54 closes Book 5 and previews the new question of why forms and endings vary. Chapter 55 should answer that question at an introductory level, not repeat the prior book’s full grammar survey.
- Chapter 55 owns the three nominal cases, a beginner-safe account of **muʿrab/mabnī**, selected common roles, true prepositions, and basic iḍāfa.
- Chapter 56 is mapped to special noun types (including maqṣūr, manqūṣ, the five nouns, and dual forms). Chapter 55 may preview that signs can vary, but should not teach its full exception/sign inventory.
- Chapter 57 owns weak verbs and **al-afʿāl al-khamsa**. Keep the distinction between noun case and imperfect-verb mood visible in Chapter 55, but defer the detailed verb systems.
- Chapter 58 is mapped to higher-level syntax. Place **mafʿūl muṭlaq** and other advanced complements there only after confirming explicit prerequisites and the final map.
- Chapter 59 is the Book 6 capstone; Chapter 55 should establish a limited, assessable foundation rather than promise independent parsing of any Quranic passage.

## Current-state audit

The map gives Chapter 55 six focuses: what iʿrāb is, what bina is, the three cases, their signs, Quranic examples, and why Arabic has iʿrāb. The fixtures instead provide eight `STANDARD` lessons: iʿrāb; muʿrab/mabnī; subject and predicate; direct object; prepositions; accusative in depth; prepositional phrases and iḍāfa; and a full ayah parse. Each currently has eight exercises, but there is no separate retrieval review or `CHAPTER_TEST` assessment. The product spec requires the chapter test to be a distinct `REVIEW` lesson with the canonical assessment payload.

### Critical and high-priority issues

| Priority | Issue | Proposed fix |
|---|---|---|
| Critical | Lesson 1 says verbs take nominative when they “do something,” blending noun case with imperfect-verb mood. Its Al-Mursalāt 77:1 hook repeatedly substitutes **عُقُبًا** for the actual **عُرْفًا**, then calls that word genitive and governed by **وَالْمُرْسَلَاتِ**. The cited grammar treats **الْمُرْسَلَاتِ** as genitive in an oath construction and **عُرْفًا** as a verbal noun functioning as ḥāl. [QAC 77:1](https://corpus.quran.com/grammar.jsp?chapter=77&verse=1) | Rewrite the first lesson around the basic question “what relationship does this ending mark?” Separate noun case from verb mood in a contrast box. Correct the verse text, translation, source label, parse, and highlight together; do not use it to introduce a role that has not been taught. State that word order is not freely interchangeable: endings can help identify roles, while order may affect emphasis and interpretation. |
| Critical | Lesson 2 uses **آدَمَ** as an example of a word that “never changes,” but elsewhere in the same chapter uses **ذَهَبَ آدَمُ**. The Quranic form in 2:31 is accusative; the chapter’s own nominative example also disproves the claim. [QAC 2:31 morphology](https://corpus.quran.com/wordmorphology.jsp?location=%282%3A31%3A2%29) | Replace the proof pair with a straightforward fixed word such as **هَذَا** and a regular declinable noun such as **كِتَابٌ / كِتَابًا / كِتَابٍ**. Explain **مَبْنِيّ** as fixed in form but still able to occupy a syntactic position. Bound verb claims: past and imperative verbs are generally built; the imperfect is generally declinable except in specified contexts. Do not claim “most verbs” without a defined scope. |
| Critical | Lesson 3 conflates **الفَاعِل** with **المبتدأ والخبر** and labels **لَآيَاتٍ** in Al-Baqara 2:164 as a mubtada. In the verse, it is the delayed **اسم إنّ**, accusative with kasra, and **إِنَّ** governs the clause. The hook also splices **لِأُولِي الْأَلْبَابِ** into 2:164, whose ending is **لَآيَاتٍ لِقَوْمٍ يَعْقِلُونَ**. [QAC 2:164](https://corpus.quran.com/grammar.jsp?chapter=2&verse=164) | Retitle and teach **mubtada/khabar in a plain nominal sentence versus fāʿil in a verbal sentence**. Use short, verified examples suited to those structures. Defer **إِنَّ** and its sisters unless explicitly taught as a later contrast, and never use the 2:164 excerpt to demonstrate the basic mubtada/khabar pattern. Correct the adjective-versus-predicate explanation and limit agreement claims to the construction actually shown. |
| High | Lesson 4’s Al-Baqara 2:102 preview says **عَلَىٰ مُوسَىٰ**, while the cited verse says **عَلَىٰ مُلْكِ سُلَيْمَانَ**. It also treats **مَا** as though its visible ending changes, rather than explaining an indeclinable relative pronoun’s syntactic position. [QAC 2:102](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=102) | Verify the full text against a canonical Quran source before reuse. Teach direct object as a syntactic role normally in **naṣb**, with visible signs varying; distinguish an indeclinable word “in محل نصب” from a word whose form visibly changes. Prefer a simple controlled sentence first, then one accurately sourced excerpt. |
| High | Lesson 5 classifies **خَلْفَ، أَمَامَ، فَوْقَ، تَحْتَ، بَيْنَ** as **حروف الجر**; these are nouns commonly used as adverbs/ظروف and may take an iḍāfa complement. It also says the pronoun in **بِيَدِهِ** is governed directly by **بِـ**; grammatically, **يَدِ** is genitive after the preposition and the attached pronoun is genitive as its mudāf ilayh. | Teach a short, vetted list of actual prepositions first. Distinguish prepositions from ظرف nouns in a later contrast. Explain the layers in **بِيَدِهِ** without flattening them; verify every Quran parse and translation with a qualified reviewer. Replace “object after a preposition” with **اسم مجرور بحرف الجر**. |
| Critical | Lesson 6 misparses **إِنَّ مَعَ الْعُسْرِ يُسْرًا**: **يُسْرًا** is the delayed **اسم إنّ**, while **مَعَ الْعُسْرِ** is the fronted predicate phrase—not a mafʿūl muṭlaq. [Verse-specific iʿrāb](https://surahquran.com/e3rab-aya-5-sora-94.html) | Remove the incorrect parse and defer mafʿūl muṭlaq. Correct the dual marker exercise: dual nouns use **ياء** in naṣb and jarr; **ألف** is the nominative marker. Avoid saying every fatḥa means naṣb; make the introductory rule explicitly about regular declinable singular nouns. |
| Critical | Lesson 7 reverses the iḍāfa rule: it says the mudāf ilayh cannot take **الـ**, although its own **كِتَابُ الطَّالِبِ** example has it. It says the mudāf “gives its case” to the complement. | Teach: the mudāf normally has no tanwīn and does not take **الـ** in the construct; the mudāf ilayh is genitive and may be definite or indefinite; the mudāf’s own case comes from its role in the larger sentence. Contrast **كِتَابُ الطَّالِبِ**, **كِتَابُ رَجُلٍ**, and **كِتَابٌ جَدِيدٌ**. Explain attached pronouns as possible mudāf ilayh. |
| Critical | Lesson 8’s Al-Hashr 59:21 analysis calls **جَبَلٍ** accusative because of **لَوْ**, although it is genitive after **عَلَىٰ**; it labels **خَاشِعًا** an adjective where the cited analysis treats it as a ḥāl; and it gives false morphology for **أَنْزَلْنَا**. [QAC 59:21](https://corpus.quran.com/grammar.jsp?chapter=59&token=7&verse=21) | Rebuild the cumulative parse from only previously taught roles and have every token reviewed. Do not call this a “full parsing” lesson unless every included construction has been taught and verified. Correct morphology from a reliable source; remove unsupported claims such as “every word is now known.” |
| High | Recurrent terminology/feedback errors appear across lessons: **الْبَيْتِ** is said to “end with yā” (it ends with kasra); a noun after a preposition is called **مفعول فيه**; **مِنْ** is treated as mabnī in the same sense as an inflected noun; **خَاشِعًا** is called an adjective; and an incomplete conditional fragment is presented as a complete model. | Run a line-by-line Arabic and English review across prompts, feedback, answer keys, hints, highlights, and transliterations. Teach surface mark versus final letter, word class, syntactic role, and built/declinable form as distinct labels. Avoid unsupported parse labels in learner-facing feedback. |
| High | Eight teaching lessons and eight exercises each create breadth without a learning/checkpoint structure; map and fixtures disagree, and neither review nor final test exists. | Reconcile map and fixtures around the proposed seven instructional objectives. Add one mixed formative retrieval `REVIEW` and a separate `REVIEW` with canonical `CHAPTER_TEST` assessment payload. Size exercise count and lesson minutes by piloting; do not add content merely to meet a fixed lesson count. |

## Proposed lesson plan

1. **What iʿrāb tells us** (`STANDARD`, revised): A first, accurate example of a changing noun ending. Introduce **رفع / نصب / جر** as nominal case labels; contrast these with imperfect-verb mood in a small “different system” note. Scope the initial signs to familiar regular singular nouns.
2. **Muʿrab and mabnī** (`STANDARD`, revised): Contrast a regular declinable noun with a clearly indeclinable demonstrative such as **هَذَا**. Explain fixed form versus syntactic position without using disputed proper-name classifications.
3. **Three common roles: fāʿil, mubtada, khabar** (`STANDARD`, revised): First distinguish verbal and plain nominal sentences; teach each role in an uncomplicated example. Keep **إِنَّ** constructions, embedded clauses, and complex agreement out of this introductory lesson.
4. **The direct object and naṣb** (`STANDARD`, revised): Teach **مفعول به** as a common accusative role and practice regular forms. Add one carefully explained **في محل نصب** example only if the prerequisite for indeclinable words is clear.
5. **True prepositions and jarr** (`STANDARD`, revised): Teach common **حروف الجر** and the genitive noun they govern. Show a controlled attached-pronoun example; distinguish the preposition, governed noun, and any pronoun attached to that noun.
6. **Iḍāfa: two linked nouns** (`STANDARD`, substantially revised): Teach mudāf/mudāf ilayh, construct form, definiteness, and genitive relation. Include contrastive examples and then a deliberately cumulative preposition + iḍāfa phrase.
7. **Supported cumulative reading** (`STANDARD`, rebuilt): Parse a short, source-checked passage or a sequence of controlled sentences using only the roles and structures taught in Lessons 1–6. Mark any not-yet-taught form as “not covered yet”; do not call it exhaustive parsing. Move **mafʿūl muṭlaq** and 59:21’s advanced analysis to a later chapter after confirming scope.
8. **Chapter 55 retrieval review** (`REVIEW`, revised/new): Mixed practice distinguishing case from mood, declinable from indeclinable, core roles, true prepositions, and iḍāfa. Provide explanatory feedback; formative review does not itself replace the final test.
9. **Chapter 55 checkpoint** (`REVIEW`, new): A separate schema-valid **CHAPTER_TEST** assessment mapped to the stated learning outcomes, using the canonical assessment contract and completion behavior. Do not invent a pass threshold or test length in this proposal; use the product/runtime definition.

## Editorial and validation requirements

Before implementation, reconcile the Chapter 55 map with the proposed lesson purposes, order, anchor, and assessment objectives. Audit every Arabic excerpt and every derivative preview, translation, audio script, token, highlight index, transliteration, answer, and feedback string—not only the primary ayah field. Have a qualified Arabic grammar reviewer verify all parse claims, particularly Al-Mursalāt 77:1, Al-Baqara 2:31 and 2:164, Al-Baqara 2:102, Al-Mulk 67:1, Ash-Sharḥ 94:5, and Al-Hashr 59:21. A Quran-text reviewer should confirm verse text and metadata against the canonical source. Where a verse depends on advanced syntax, replace it or label the relevant construction as not yet taught.

After approval and implementation, validate against `@warsh/lesson-schema`; ensure each assessment follows the canonical `REVIEW`/`CHAPTER_TEST` payload, and run the fixture validator, Urdu audit, and Quran-ayah audit. Automated validation does not prove grammatical accuracy: manually inspect generic Arabic strings and each exercise's prompt, keyed answer, distractors, feedback, and tile order. Check English/Urdu parity and learner-facing completion claims. Run `npm run content:check` before any fixture sync. This proposal does not authorize fixture edits, database writes, content sync, or publication.

## Acceptance criteria

- Chapter 55’s map and lesson sequence agree on a bounded set of introductory iʿrāb outcomes and accurate prerequisites.
- The first lesson consistently distinguishes nominal case from imperfect-verb mood; word order is not described as freely interchangeable.
- No lesson calls Ādam **mabnī** as the example of an unchanging form; chosen examples are reliable and correctly explained.
- **فاعل** is distinguished from **مبتدأ / خبر**; Al-Baqara 2:164 is not misused as a plain nominal-sentence example, and no excerpt is spliced or mislabeled.
- Prepositions, governed nouns, ظرف nouns, surface case signs, syntactic positions, and attached pronouns are not conflated.
- Iḍāfa rules are accurate: mudāf ilayh is genitive and may be definite; mudāf’s case comes from its sentence role.
- **يُسْرًا** in Ash-Sharḥ 94:5 is not called mafʿūl muṭlaq; **جَبَلٍ** in Al-Hashr 59:21 is not called accusative due to **لَوْ**; no unsupported morphology or parse labels remain.
- The full alternate-sign inventory and advanced complements remain in the appropriate later chapter; Chapter 55 does not claim exhaustive parsing.
- A formative retrieval review and a separate schema-valid `CHAPTER_TEST` assessment exist and test only taught, stated outcomes.
- English, Urdu, Arabic, transliteration, source metadata, audio, highlights, answer keys, and feedback have all been checked together.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–5 | `ch55-l01`–`ch55-l05` | `STANDARD` | `chapter-55-lesson-01.json`–`-05.json` |
| 6 | `ch55-l07` | `STANDARD` (iḍāfa) | `chapter-55-lesson-06.json` |
| 7 | `ch55-l08` | `STANDARD` (cumulative reading) | `chapter-55-lesson-07.json` |
| 8 | `ch55-l06` | `REVIEW` | `chapter-55-lesson-08-review.json` |
| 9 | `ch55-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-55-lesson-09-final-test.json` |

**Corrections**

1. The IDs keep each existing row on its closest topic: `ch55-l07` (prepositional phrases and iḍāfa) → iḍāfa, `ch55-l08` (full ayah parse) → supported reading, `ch55-l06` ("accusative in depth", whose content is deferred to Chapter 58) → review.
2. **Cases are not new here.** Learners met **مرفوع / منصوب / مجرور** with **إِنَّ** (Ch24), **لَيْسَ** (Ch25), prepositions (Ch27) and the sound masculine plural (Ch47). Chapter 55 is the first *systematic* treatment and the first use of the words iʿrāb, muʿrab and mabnī; Lesson 1 opens by retrieving those chapters.
3. Lesson 6 (iḍāfa) adds formal terminology (**مضاف / مضاف إليه**) to what Chapters 3, 26 and 47 taught; it does not re-teach the pattern.
4. Ash-Sharh: the wording without **فَ** is 94:6 (see Chapter 53).
5. Test: 12 questions at 80 % (S1).
