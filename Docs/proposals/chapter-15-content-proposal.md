# Chapter 15 Content Proposal — These and Those in Quranic Context

**Status:** Implemented 2026-09-23 (fixtures, seed, map, `scripts/promote-chapters-15-19.cjs`); staging-verified, production promotion pending. Deviations are recorded in `Docs/warsh-status.md` and the fixture `_meta._note`s.
**Scope:** Curriculum design only. This document does not authorize fixture, database, application, audio, or production changes.  
**Chapter:** Book 1, Chapter 15  
**Proposed size:** Four teaching lessons, one review, and one distinct final chapter test

**Release dependency:** Chapter 14's revised fixtures are in isolated staging but its production promotion and scholarly review are still pending as recorded in its proposal. Chapter 15 may be drafted and reviewed now, but its phrase/sentence and human/non-human transfer tasks must not be released ahead of the Chapter 14 foundations they assume.

## 1. Decision and learner outcome

Keep Chapter 15 about choosing and reading demonstratives for groups. **هَٰؤُلَاءِ / هَؤُلَاءِ** (“these”) is prior knowledge from Chapter 9; **أُولَٰئِكَ** (“those”) is the principal new form. The chapter should not become a second location-vocabulary unit or a repeat of plural morphology and adjective agreement.

At the end, a learner should be able to:

1. choose the appropriate taught pointer for a familiar single person/object, group of people, or group of things in a controlled near/far context;
2. understand and use **أُولَٰئِكَ** for a contextually distant group of people, contrasting it with previously taught **هَؤُلَاءِ**;
3. apply the beginner default of **هَذِهِ / تِلْكَ** with non-human plurals, without treating that default as an exceptionless law;
4. distinguish **هَؤُلَاءِ مُسْلِمُونَ** (“these are Muslims”) from **هَؤُلَاءِ الْمُسْلِمُونَ** (“these Muslims”) in controlled examples, building on Chapter 14's phrase/sentence distinction;
5. locate the demonstrative in short, authentic Quran excerpts and explain its referent from the supplied context; and
6. pass a separate chapter assessment without being tested on untaught case theory, dual forms, or advanced rhetoric.

**Editorial rule:** A Quranic demonstrative can carry discourse or rhetorical force; do not teach that **أُولَٰئِكَ** always indicates physical distance or that its form alone proves praise, blame, or honor. Give the immediate referent and context before interpreting it.

## 2. Cross-chapter audit: what Chapters 1–14 already teach

This map was checked against the current fixture mirror, `prisma/curriculum-book1.cjs`, the implemented/reviewed chapter proposals, and the Conversation Labs proposal. It is a scope map, not a claim that every earlier lesson is free of errors or that a staging-only chapter is already live in production.

| Earlier chapters | Already taught or planned in current content | Chapter 15 decision |
|---|---|---|
| 1 and 5 | **هَذَا، ذَٰلِكَ، هَذِهِ، تِلْكَ**; Chapter 5 applies feminine pointing in phrases | Retrieve these forms briefly for comparison. Do not present them as new vocabulary. |
| 2 and 5 | **أَيْنَ** and basic place expressions; Chapter 2 explicitly teaches **أَمَامَ، خَلْفَ، فَوْقَ، تَحْتَ**; CL2 applies location in a conversation | Remove the current position-words lesson. Do not rebrand these four words as new Chapter 15 content. |
| 3–4 and 6 | Definite/indefinite nouns, idafa, basic nominal sentences, adjective agreement, and phrase versus sentence | Reuse only to distinguish a demonstrative phrase from a complete statement; do not reteach general noun/adjective theory. |
| 7–8 | Attached singular pronouns and selected feminine past/relative forms | Familiar material may appear incidentally; do not add new pronoun or verb paradigms. |
| 9 | Plural families and **هَٰؤُلَاءِ** for a nearby human group; CL4 asks who these people are | Retrieve **هَؤُلَاءِ** only as the comparison that makes the new **أُولَٰئِكَ** intelligible. No standalone reteaching lesson. |
| 10–12 | Standalone plural pronouns; family/home; introductions and classroom phrases; CL5–CL7 | Use known people/scene nouns where helpful. Do not add a new Conversation Lab merely to repeat these dialogues. |
| 13 | Recognising plurals in Quranic text; Al-Baqarah 2:5 was used to identify **الْمُفْلِحُونَ** | Revisit 2:5 deliberately, but now highlight **أُولَٰئِكَ** and resolve its referent. The assessment target must differ from Chapter 13. |
| 14 | Human/non-human plural adjective default; descriptive phrase versus sentence; Quranic variation | Transfer the *meaning-based classification* to demonstrative choice and maintain the phrase/sentence distinction. Do not retest adjective endings or variation as Chapter 15 objectives. |

**Future boundary:** The Conversation Labs roadmap provisionally reserves expanded directions for Chapter 21. Basic position words have already been taught in Chapter 2, so the removed Chapter 15 lesson need not be copied verbatim anywhere. If a later locations unit revisits them, its new outcome should be directions, movement, or attached-pronoun construction—not the same four glosses. Dual demonstratives, full case behavior, detailed **ضَمِير الْفَصْل**, and rhetorical interpretation belong to later instruction or scholarly notes.

## 3. Problems in the current Chapter 15

1. **Mismatched Quran hooks:** Lesson 1's Al-Kawthar 108:1 lacks **هَؤُلَاءِ**; Lessons 2 and 5's Al-Baqarah 2:256 lacks **أُولَٰئِكَ**; Lessons 3 and 4's Al-Ma'un 107:4 lacks the demonstratives and location terms being discussed. An in-range highlighted index is not proof of semantic alignment.
2. **False attribution and invented wording:** The current Lessons 3–5 associate **فَوْقَهُمْ**, angels, and eight with Al-Ma'un. The actual occurrence to inspect is Al-Haqqah 69:17. Remove the fabricated paraphrase and attribution; do not retain it in the review.
3. **Prior-chapter repetition:** Lesson 1 presents **هَؤُلَاءِ** as new despite Chapter 9, and Lesson 4 presents the four position words as new despite Chapter 2.
4. **Incorrect beginner generalization:** The current material applies **هَؤُلَاءِ / أُولَٰئِكَ** indiscriminately to people and things, including **هَؤُلَاءِ كُتُبٌ** as a correct answer. Teach the controlled human-group pattern and the non-human feminine-singular default instead, with a scholarly check for exceptions.
5. **Phrase/sentence and grammar errors:** Definite phrases such as **هَؤُلَاءِ الْمُسْلِمُونَ** are translated as unambiguous sentences. English and Urdu disagree about noun case. The location lesson calls place adverbs/nouns prepositions. These should be rewritten, not lightly copyedited.
6. **Unanswerable or misleading exercises:** The review's **فَوْقَ ___** item asks for an attached suffix but supplies independent pronouns; some explanations and transliterations do not match their Arabic. Exercise distractors also import advanced forms or charged contrasts without helping the target skill.
7. **Production and provenance gaps:** Arabic fields contain Urdu/English and a corrupted character; spellings vary; source metadata points to absent lecture files; the review is small; and there is no distinct `assessment` final test.

The fixture validator, Quran-text/reference audit, and Urdu-presence audit passed on 2026-09-23. They do **not** establish that the selected ayah contains the claimed word, that a grammar explanation is right, or that an exercise can be answered as intended. Add human semantic review to the release gate.

## 4. Proposed sequence and stable identities

| Display order | Stable ID | Working title | Template | Distinct outcome | Suggested size |
|---:|---|---|---|---|---:|
| 1 | `ch15-l01` | These and Those People | `STANDARD` | Introduce **أُولَٰئِكَ** immediately by contrasting it with known **هَؤُلَاءِ** | 8 cards, 7–8 exercises |
| 2 | `ch15-l02` | People or Things? Choosing the Pointer | `STANDARD` | Select the beginner-default pointer by referent and distance | 8 cards, 8 exercises |
| 3 | `ch15-l03` | Pointing Phrase or Complete Statement? | `STANDARD` | Apply the Chapter 14 phrase/sentence distinction to demonstrative constructions | 8 cards, 8 exercises |
| 4 | `ch15-l04` | Quran Reading Lab: Who Are “Those”? | `STANDARD` | Identify the pointer and referent in short Quran passages, not by mere English gloss | 7–8 cards, 7–8 exercises |
| 5 | `ch15-l05` | Chapter 15 Review | `REVIEW` | Mixed retrieval with no new grammar | 7–8 cards, 10 exercises |
| 6 | `ch15-test` | Chapter 15 Final Test | `REVIEW` + `assessment` | Independently demonstrate chapter mastery | 12 graded questions |

Keep all five existing lesson IDs and preserve completed-progress records. `ch15-l04` is repurposed, not moved to a new ID; changing its learning outcome for already-completed learners requires a product-owner progress decision before promotion. `ch15-test` is the only proposed new stable ID. Keep `_meta.lesson_order`, fixture filename, and database display order consistent. Do not silently insert a Conversation Lab: the forward roadmap places the next expanded-directions lab provisionally at Chapter 21, and Chapter 15's primary job is Quranic reading transfer.

## 5. Lesson specifications

### Lesson 1 — These and Those People

**Repurpose:** `ch15-l01`. **New work:** introduce **أُولَٰئِكَ** immediately; **هَؤُلَاءِ** is a one-card Chapter 9 reminder.

- Begin with two familiar groups in a clearly described near/far scene: **هَؤُلَاءِ طُلَّابٌ** / **أُولَٰئِكَ طُلَّابٌ**. Keep the noun fixed so the new contrast is the pointer, not plural morphology.
- Use Al-Baqarah 2:5, which actually has **أُولَٰئِكَ** twice. Start with the short first clause **أُولَٰئِكَ عَلَىٰ هُدًى مِنْ رَبِّهِمْ**; supply enough of 2:2–4 in translation for “those” to have a real referent. Do not imply the immediately preceding noun occurs in the excerpt itself.
- This is a deliberate second reading of a verse used in Chapter 13: Chapter 13 targeted **الْمُفْلِحُونَ** as a plural form; Chapter 15 targets **أُولَٰئِكَ** as a pointer. Its question and highlighted word must change.
- Include one short reminder of **هَذَا / ذَٰلِكَ** as singular near/far words, but do not reteach the four-word singular table or Chapter 9's full near-plural lesson.
- Exercises: identify **أُولَٰئِكَ** in the Quran excerpt; choose near/far for familiar human groups; build one short statement; select the demonstrative's referent from supplied context.
- Remove unsupported frequency counts and claims that the form itself always honors or condemns the referent. No new case-ending rule or detailed **هُمُ** analysis.

### Lesson 2 — People or Things? Choosing the Pointer

**Repurpose:** `ch15-l02`. **New work:** combine known singular pointers with the new plural-group contrast to make a correct selection.

- Build on Chapter 14's human/non-human classification: for straightforward beginner examples, choose **هَؤُلَاءِ / أُولَٰئِكَ** for people and **هَذِهِ / تِلْكَ** for non-human plural things. Present a common beginner default, not an exhaustive Classical Arabic rule.
- Use authored, clearly labelled examples: **هَؤُلَاءِ طُلَّابٌ** / **أُولَٰئِكَ طُلَّابٌ**; **هَذِهِ كُتُبٌ** / **تِلْكَ كُتُبٌ**. A scholar should approve final vocalization and contextual glosses before publication.
- Quran anchor: Al-Hijr 15:68 contains **هَٰؤُلَاءِ** with **ضَيْفِي** (“my guests”). It supplies another human-group occurrence; teach only the local pointing relationship and enough context to avoid misrepresenting the verse. The surrounding **إِنَّ** is recognition-only.
- Exercises must vary both dimensions—near/far and person/thing—so a learner cannot answer by location alone. Corrective feedback should explain why **هَؤُلَاءِ كُتُبٌ** is not the expected beginner construction.
- Do not reteach adjective endings, full non-human agreement theory, or advanced exceptions. Do not call **هَؤُلَاءِ** a general replacement for **هَذَا** whenever there are multiple objects.

### Lesson 3 — Pointing Phrase or Complete Statement?

**Repurpose:** `ch15-l03`. **New work:** apply Chapter 14's phrase/sentence distinction to the newly useful demonstrative constructions.

- Contrast **هَؤُلَاءِ مُسْلِمُونَ** (“these are Muslims”) with **هَؤُلَاءِ الْمُسْلِمُونَ** (“these Muslims”) in a controlled context. The latter can be context-sensitive, so do not present it as an unambiguous complete sentence. If a definite full identification is needed, show **هَؤُلَاءِ هُمُ الْمُسْلِمُونَ** as a whole phrase but reserve detailed **هُمُ** analysis for later.
- Include parallel **أُولَٰئِكَ** examples so this is not merely a repeat of Chapter 14's noun-adjective lesson. Identify what information completes the statement.
- Quran anchor: Al-Mu'minun 23:10 has **أُولَٰئِكَ هُمُ الْوَارِثُونَ**, a complete statement. Gloss **الْوَارِثُونَ** and supply prior context; do not grade **هُمُ** as new grammar or infer a general rule from one verse.
- Exercises: translate phrase versus sentence differently, choose a complete statement when the prompt asks for one, and identify which Quran excerpt is complete without requiring formal parsing.
- Do not turn this into an adjective-agreement lesson or a general treatment of demonstrative syntax and case.

### Lesson 4 — Quran Reading Lab: Who Are “Those”?

**Repurpose:** `ch15-l04`; remove its current position-word content.

- Read Al-Kahf 18:15, **هَٰؤُلَاءِ قَوْمُنَا**, as a deliberate return to Chapter 9's verse: here the task is to identify the pointer and its real referent, not to learn **هَؤُلَاءِ** or a plural pattern for the first time.
- Re-read the Chapter 15 anchors Al-Hijr 15:68, Al-Baqarah 2:5, and Al-Mu'minun 23:10, but change the task: find the pointer, choose its referent, and decide whether a shown line is an actual Quran quotation or an authored practice sentence. Repetition is deliberate retrieval across contexts, not another explanation of the same form.
- Use one short authored pair to test transfer to a different familiar human noun. Keep Quran text visibly distinct from authored examples.
- A learner should be able to say **what word points**, **who it points to**, and **which context supports that answer**. Do not demand full verse parsing, rhetorical tafsir, or formal **ضَمِير الْفَصْل** terminology.
- Remove the false Al-Ma'un/angels passage completely. If a future location unit uses **فَوْقَهُمْ**, verify Al-Haqqah 69:17 and teach its grammar there, not here.

### Lesson 5 — Chapter 15 Review

**Keep:** `ch15-l05`, `REVIEW`; rebuild rather than recycling current location exercises.

- Ten mixed items: near/far human selection; human/non-human default; phrase versus complete sentence; Quran target recognition; Quran referent retrieval; and one transfer item involving a familiar singular pointer.
- No new vocabulary or grammar should be necessary to pass. Difficult words in Quran context are glossed. The answer feedback should explain the decision, especially when **هَذِهِ / تِلْكَ** is the appropriate beginner choice for things.
- Use a real direct-target Quran hook, preferably 23:10 or 2:5, and declare the intended word in `highlighted_words` as well as the index. Do not use 2:256.

### Chapter 15 Final Test

**New ID:** `ch15-test`, display order 6, `REVIEW` template with `assessment.type = CHAPTER_TEST`, 12 server-graded questions, and the existing 80% pass policy (10/12). Unlimited retries and completion/reward behavior follow the active product rules.

| Skill | Questions |
|---|---:|
| Known singular versus near-human plural selection | 1 |
| Near-human plural retrieval | 1 |
| Far-human plural **أُولَٰئِكَ** | 2 |
| Near/far choice in a described scene | 1 |
| Non-human near/far beginner default | 2 |
| Demonstrative phrase versus full sentence | 2 |
| Quran pointer and referent: 15:68, 2:5, 23:10 | 3 |
| **Total** | **12** |

No question should depend on a theological inference, an unintroduced plural form, location-word morphology, or an ambiguity between a pointing phrase and a predicative sentence.

## 6. Quran source and reveal plan

| Lesson | Proposed anchor | Intended target | Why this is not needless repetition |
|---|---|---|---|
| 1 | [Al-Baqarah 2:5](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=5) | first **أُولَٰئِكَ** | Chapter 13 targeted plural morphology, not this pointer |
| 2 | [Al-Hijr 15:68](https://corpus.quran.com/wordbyword.jsp?chapter=15&verse=68) | **هَٰؤُلَاءِ** | New human-group context for the people/things decision |
| 3 | [Al-Mu'minun 23:10](https://corpus.quran.com/wordbyword.jsp?chapter=23&verse=10) | **أُولَٰئِكَ** | New statement versus pointing-phrase application |
| 4 | [Al-Kahf 18:15](https://corpus.quran.com/wordbyword.jsp?chapter=18&verse=15), plus the three anchors above | **هَٰؤُلَاءِ / أُولَٰئِكَ** | Prior Chapter 9 verse, now read for referent/transfer |
| 5/test | One or more of the verified anchors above | Previously taught pointer(s) | Retrieval only, no new Quran grammar |

These sources verify **occurrence and morphology**, not final pedagogical translations, audio alignment, or tafsir. Before implementation, verify exact Uthmani excerpt text against the Quran source used in the product; retain the full verse reference even when showing a short excerpt; confirm the selected recitation covers that verse; verify every zero-based highlight index and `highlighted_words` against the exact excerpt. Quran text must not be silently rewritten into the educational spelling. Do not show Quran ayat in transliteration.

## 7. Editorial and implementation requirements after approval

- **Arabic:** Use one consistent educational spelling for authored examples; preserve exact Quran orthography in ayat. Repair malformed Arabic fields, corrupted characters, transliteration, `ar_plain`, and mismatched case vowels. Do not say the learner now knows *all* Arabic demonstratives; dual and other forms remain.
- **English and Urdu:** Give equivalent, grammatically accurate explanations. Audit every noun-role and case statement rather than translating a mistaken rule twice. Keep `concept.ar` Arabic-only and reserve Urdu for `concept.ur`.
- **Exercise design:** For every question, confirm one correct answer, plausible but unambiguous distractors, prior teaching for every assessed form, and useful wrong-answer feedback. Never present an authored phrase as a Quran verse. Verify that attached pronoun exercises, if any remain as incidental review, actually offer attached forms.
- **Media:** Any changed Arabic string needs fresh keyed lesson audio; Quran recitation must remain human-recorded and aligned to its exact reference. Inspect playback and rendering in both UI languages.
- **Schema and source:** Validate against the canonical `@warsh/lesson-schema`; do not duplicate the schema in this document. The current `reader_lecture_15_haulai_ulaika.md` and `reader_lecture_15_demonstratives.md` provenance strings point to missing files. If the owner approves this proposal as source, record that explicitly in curriculum/fixture metadata during implementation; otherwise restore the genuine source.
- **Sync and promotion:** Inspect `git status` and preserve unrelated work. Draft fixtures locally, run fixture/Urdu/Quran audits plus semantic target checks, then review the chapter in the isolated staging database and on-device. Verify the test fails at 9/12 and passes at 10/12. Export any Studio edits and pass `content:check` before a **scoped Chapter 15** production promotion. Never run the full production seed for this change.

## 8. Approval questions and definition of done

The owner should approve the four-lesson scope, the Chapter 2/9 repetition boundaries, the non-human beginner default, and the repurposing of `ch15-l04` before implementation. A qualified Arabic/Quran reviewer should approve the final verse excerpts, translations, grammatical claims, and Urdu terminology. Decide explicitly whether already-completed `ch15-l04` learners need a visible update/revisit when its lesson meaning changes; preserve their data unless a separate progress policy is approved.

The chapter is ready to publish only when each hook contains its claimed target, each assessment item has an unambiguous supported answer, English and Urdu agree, Quran quotation and authored practice are clearly separated, audio is current, the final test gates completion correctly, and the isolated-staging walkthrough passes.
