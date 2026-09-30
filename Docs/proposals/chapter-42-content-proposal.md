# Chapter 42 — Advanced Questioning and Vocabulary Growth

**Status:** Proposal only — not approved or implemented

**Evidence reviewed:** Chapter 42 map in `curriculum-books5-6.cjs`; all five registered Chapter 42 fixtures; Chapter 31 map and fixtures (where the core question words are already introduced); Chapter 41 proposal and Chapter 43 map / Conversation Labs roadmap for continuity; canonical lesson schema; active product specification; Quranic Arabic Corpus references linked below. `npm run db:validate-fixtures` passed for 452 fixtures, with 23 legacy reveal warnings in other chapters. A read-only `content:check` attempted during this audit sequence did not complete, so fixture/database parity remains **unverified**. No Chapter 42 fixture or database content was changed.

**Scope:** Chapter 42 lesson sequence, interrogative accuracy, examples, Quran hooks, vocabulary progression, bilingual quality, and assessment.

## Recommendation

Keep the chapter’s purpose—**turn familiar question words into accurate, meaningful question-and-answer use, while growing a small, reusable vocabulary**—but do not present **كَمْ، مَتَى، لِمَاذَا، كَيْفَ** as entirely new forms. Chapter 31 already introduces all four, including **كَمْ** and **لِمَاذَا** in Lesson 3. Chapter 42 should be a deliberate spiral: retrieve their basic meanings briefly, then deepen quantity phrasing, time answers, reason-giving, manner/condition answers, and selecting a complete answer that fits the question.

Recommend **four focused application lessons, one mixed Q&A lesson, one retrieval review, and one separate checkpoint (seven lessons total)**. This is not a quota: the four forms have distinct answer demands, and the current chapter neither teaches all four nor checks independent transfer. Grow vocabulary inside the lessons in small, recycled sets; do not add a disconnected word-list lesson. Keep the proposed Chapter 43 CL13 Food and Hospitality lab distinct: Chapter 42 can use short, controlled question/answer practice, but should not add another full spoken scenario or preteach its food/hospitality vocabulary.

## Current-state audit

The map describes **Advanced Questioning and Vocabulary Growth**, gives a question-related Al-Isra 17:85 hook, and includes examples with **كَمْ، مَتَى، لِمَاذَا، كَيْفَ**. Its four interrogative focuses cover quantity, time, reason, and manner; the fifth focus is a Quran/knowledge reflection. But registered Lessons 1–4 teach only **كَمْ، مَتَى، لِمَاذَا**, repeat these three in a mixed lesson, and never teach or practice the mapped **كَيْفَ**. The fifth lesson is a review of the same three words. Thus the map, actual scope, and chapter title do not align.

There is a critical internal contradiction in Lesson 1. One card says **كَمْ** is followed by a genitive noun “always,” while the examples **كَمْ كِتَابًا** and **كَمْ سَنَةً** are accusative. The lesson then calls **كِتَابًا** an indefinite object, although in this question pattern it is the singular accusative specification (تمييز), not the object of **كَمْ**. The exercise **كَمْ طُلَّابًا فِي الْمَدْرَسَةِ؟** also uses a plural count noun where the chapter’s own stated pattern calls for a singular specification; a suitable constructed beginner example is **كَمْ طَالِبًا فِي الْمَدْرَسَةِ؟**. The examples and exercises therefore teach mutually incompatible analyses.

Other substantive language problems appear in Lesson 2: it glosses **غَدًا** as “yesterday” in one card (it means “tomorrow”), then pairs **ذَهَبْتُ غَدًا** (“I went tomorrow”) with that incorrect gloss. Its word entry says **غَدٌ** can mean tomorrow/yesterday and gives an unsupported root explanation. The fixture also describes **تَقُومُ** as a future form of **قَامَ**, although it is an imperfect form whose time interpretation comes from context. Lesson 3 presents **لِ** by itself as “because”; the useful response frame is **لِأَنَّ** (“because”), while **لِ** alone commonly expresses “for/to” or purpose. Lesson 4 calls **تَعْلَمُ** (“you know”) a form meaning “you are learning,” and says it asks for a reason in the future. A more direct “you are learning/studying” example would use a reviewed verb such as **تَتَعَلَّمُ** or **تَدْرُسُ**, with the time description kept separate from the form label.

All five fixtures reuse Al-Baqarah 2:222 as the hook, while the map points to Al-Isra 17:85. The repeated hook is not tailored to quantity, time, reason, or manner; its menstruation context is unrelated to the constructed practice and should not be used as a generic hook for every lesson. The map’s fifth focus, “Knowledge Is Limited,” is a Quranic reflection rather than a fifth question-language outcome; the current review fixture does not deliver that reflection either. Every lesson repeats the same seven exercise types in the same order, every tap-translation and fill-blank key is at option index 0, and every matching task preserves identity order. None has a top-level chapter-test assessment. This makes the sequence predictable and overweights short translation/recognition rather than appropriate answers, follow-up meaning, and transfer.

The Urdu and data fields also need repair. Lesson 1 contains a Korean character sequence in `ar_plain` (**كم 책با لدبك**) instead of Arabic; its construction tiles include **فُي** instead of **فِي**. Lesson 2’s Arabic label renders “مَتَى — كَب؟”; Lesson 3’s renders “لِمَاذَا — كَيْوَن؟”. Urdu cards contain Latin transliteration or English fragments, use **غَدًا** incorrectly, and Lesson 4’s Urdu gloss for **لِمَاذَا قَرَأْتَ؟** does not mean “Why did you read?”. The source metadata points to `madina_reader_grammar_qa.md`, while the map names `reader_lecture_42_advanced_questioning.md`; both paths were absent under the checked `warsh-backend/prisma/` directory.

### Issues and proposed fixes

| Priority | Issue | Proposed fix |
|---|---|---|
| Critical | **The quantity rule contradicts its own examples and mislabels the noun role.** The fixture says genitive “always,” shows accusative **كِتَابًا / سَنَةً**, and calls **كِتَابًا** an object. | Rebuild the explanation around one explicitly bounded, common learner pattern: **كَمْ + singular accusative specification** (e.g. **كَمْ كِتَابًا قَرَأْتَ؟**). Call the following noun تمييز / “quantity specification,” not a direct object of **كَمْ**. Do not claim that every **كَمْ** construction uses the same case; put other patterns outside scope unless separately reviewed. Correct the plural **طُلَّابًا** item to a singular count noun such as **طَالِبًا**. |
| Critical | **Mapped كَيْفَ is absent from all current Chapter 42 lessons.** The chapter claims advanced questioning but only teaches three forms already introduced in Chapter 31. | Add a focused application lesson for **كَيْفَ**, distinguishing manner (“how is an action done?”) from condition/state (“how is someone/thing?”), using level-appropriate answer phrases. Label this as deeper use after Chapter 31 recall, not first introduction. |
| Critical | **Time, tense, and vocabulary are taught inaccurately.** **غَدًا** is mislabeled as yesterday, the paired past-tense sentence is incoherent, and **تَقُومُ** is called future. | Replace with verified contrasts such as **ذَهَبْتُ أَمْسِ** (“I went yesterday”) and **سَأَذْهَبُ غَدًا** (“I will go tomorrow”). Teach **غَدًا** as “tomorrow” and avoid an unverified root claim. Describe **تَقُومُ** as an imperfect form; let the time expression/context establish whether the intended reading is habitual or future. |
| High | **Reason question and answer forms are conflated.** The fixture says **لِ** means “because,” then uses **لِأَنَّ** in examples; these are not interchangeable explanations. | Teach **لِمَاذَا** as the familiar “why?” prompt and **لِأَنَّ** as one common “because…” response frame. Clarify that a reason answer need not always use this frame. Keep its grammar explanation at the level already supported by prerequisites; do not imply **لِ** alone means “because.” |
| High | **The mixed lesson has incorrect examples and overclaims.** **كَمْ عَلَّمْتَ؟** is context-poor for the intended object count; **لِمَاذَا تَعْلَمُ؟** is glossed “why are you learning?” despite using a form normally read as “you know”; the lesson also labels it future. | Replace with complete, unambiguous examples (for example **كَمْ طَالِبًا عَلَّمْتَ؟** for a bounded constructed count pattern and **لِمَاذَا تَدْرُسُ؟** for “Why do you study?”). Have Arabic, transliteration, translation, and Urdu checked as a single set. Avoid using a verb form as a tense lesson unless tense is the objective. |
| High | **Vocabulary growth is asserted rather than designed.** A few word cards appear, but they do not form a checked, recycled progression and one supports an unsourced religious-language claim. | Set a small target of 2–3 useful items per focus lesson, grouped by answer function (quantity, time, reasons, manner) and checked against existing curriculum vocabulary before adding new entries. Recycle each item in later examples. Remove **طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ** as an unsupported “well-known” claim unless an exact source and qualified review are provided; it is unnecessary for this language objective. |
| High | **The Quran reference and pedagogical examples do not align.** The map’s Al-Isra 17:85 hook and the fixtures’ repeated Al-Baqarah 2:222 hook do not model the target question words directly, and the latter is not an appropriate generic hook for every constructed example. The map’s fifth focus is reflection, not a distinct language outcome. | Select one accurately cited Quran excerpt as a reading observation, not as evidence for every constructed question pattern. Al-Kahf 18:19 includes **كَمْ لَبِثْتُمْ** (“How long have you remained?”), a useful authentic question-and-answer example, but its temporal use differs from the constructed **كَمْ + singular accusative specification** pattern; make that distinction explicit. Alternatively, retain the map’s Al-Isra 17:85 only as a contextual reflection on asking/knowledge, not as a model for all four interrogatives. Integrate the fifth focus as a small, contextual Quran observation or remove it from the assessed focus list. |
| High | **No learning check measures independent question-and-answer selection.** Every lesson repeats the same seven-item sequence; all multiple-choice keys are placed first, matching pairs stay in original order, the review has no assessment, and no checkpoint tests all mapped outcomes. | Vary exercise modes and shuffle answer/pair order while preserving the answer key. Add a separate `REVIEW` checkpoint with the canonical top-level `assessment: { type: "CHAPTER_TEST", ... }` payload, testing all four question intents, a supported response, and a mixed context. Inspect the current schema and existing validated assessments before authoring item payloads. |
| High | **Localization and source metadata are corrupted or stale.** The `ar_plain` Korean intrusion, malformed Arabic labels/tiles, romanized Urdu, bad Urdu meaning, repeated unrelated hooks, and nonexistent/mismatched source paths undermine learner trust and search/audio consistency. | Repair Arabic plain-text fields from the reviewed Arabic (do not mechanically strip damaged text), restore **فِي** and correct Arabic labels, proofread Urdu without English/transliteration leakage, align hooks, and reconcile map/source/fixture metadata. Run the content validator and Urdu audit after approved edits. |

## Proposed lesson plan

Retain the existing lesson IDs. Repurpose current `ch42-l04` from mixed practice into the missing **كَيْفَ** lesson, and `ch42-l05` from review into mixed application. Add new `ch42-l06` and `ch42-l07` for retrieval review and the distinct checkpoint.

| Order / ID | Template | Proposed title | Learning job and continuity boundary |
|---|---|---|---|
| 1 — `ch42-l01` | `STANDARD` | **How Much? Ask for a Quantity with كَمْ** | Briefly retrieve Chapter 31’s question-word meaning, then deepen the bounded count pattern **كَمْ + singular accusative specification**. Contrast “how many” with “how much” through natural count/mass-noun translations, without teaching every classical **كَمْ** construction. Distinguish the specification noun from a verb’s object. |
| 2 — `ch42-l02` | `STANDARD` | **When? Match مَتَى to a Time Answer** | Reuse **مَتَى** from Chapter 31 and practice interpreting answers with known day/time expressions. Contrast past, habitual, and future readings only through clear contextual examples; explicitly repair the **أَمْسِ / غَدًا** contrast. Do not introduce a tense paradigm here. |
| 3 — `ch42-l03` | `STANDARD` | **Why? Ask for a Reason with لِمَاذَا** | Retrieve the known question form and choose a context-supported reason. Model **لِأَنَّ** as a common answer starter, clearly distinct from **لِ** alone; mark any genuinely new grammar as recognition-only unless its prerequisites are verified. |
| 4 — `ch42-l04` | `STANDARD` | **How? Describe Manner and State with كَيْفَ** | Repurpose the current mixed-practice slot. Extend Chapter 31’s introductory **كَيْفَ حَالُكَ؟** beyond memorized greeting use: distinguish a question about how an action is done from a question about a person or thing’s state. Use answer phrases learners can understand from known adjectives/adverbs; do not claim every answer has one grammatical form. |
| 5 — `ch42-l05` | `STANDARD` | **Choose the Question and Complete the Answer** | Repurpose the current review slot for mixed application. Mix all four forms in short, controlled written/listening exchanges. Learners infer what information is missing, choose the matching question, and select or build a contextually complete answer. Include a small recycled vocabulary set; stop short of a full `SPOKEN_PHRASES` dialogue so CL13 in Chapter 43 remains distinct. |
| 6 — `ch42-l06` *(new)* | `REVIEW` | **Four Question Intents: Retrieval Review** | Interleave fresh examples for quantity, time, reason, and manner/state. Diagnose confusion between question meaning and answer meaning, **لِ** and **لِأَنَّ**, time words and verb forms, and count specification versus object. Introduce no new question word or grammar rule. |
| 7 — `ch42-l07` *(new)* | `REVIEW` | **Chapter 42 Question-and-Answer Checkpoint** | Add a top-level canonical `CHAPTER_TEST` assessment. Use a fresh mini-context with one item per question intent, at least one response-completion item, and a transfer item that requires choosing the right question from an answer. Test only taught constructions and vocabulary. |

### Vocabulary-growth rule

Choose a few words for each answer family only after checking the existing vocabulary bank and earlier chapters: familiar countable items and quantities; day/time expressions; common reason language; and known qualities or ways of acting. Prefer recycling existing curriculum words over adding synonyms. Any new word must appear again in a later example or mixed practice and have accurate Arabic, `ar_plain`, transliteration, English, and Urdu. Do not turn a one-chapter interrogative unit into a general vocabulary dump.

## Checkpoint blueprint

A focused 8–10 item test should include:

- one or two **كَمْ** items on the explicitly taught construction and the role/form of its noun;
- one **مَتَى** item that matches a clear time answer with a contextually coherent verb;
- one **لِمَاذَا** item and one reason-response item using **لِأَنَّ** where taught;
- one **كَيْفَ** item distinguishing manner from state/condition;
- one mixed-context choice or response-completion item; and
- optionally, one recognition-only Quran excerpt item if the excerpt was taught and its language reviewed.

Vary exercise types and correct-answer positions. Avoid broad true/false claims such as “always” when a construction has exceptions or variants. The final test should not require memorizing the order of question words, Quran verse numbers, or a religious ruling.

## Continuity with nearby chapters

- **Chapter 31 → Chapter 42:** Chapter 31’s current map and fixtures already introduce **هَلْ، مَا، مَنْ، أَيْنَ، كَيْفَ، مَتَى، لِمَاذَا، كَمْ** at introductory level. Both the current Chapter 31 Lesson 3 and Chapter 42 Lesson 1 fixtures contain the same **كَمْ** case contradiction; the Chapter 31 proposal already flags it. Correct both chapters to one qualified, reviewed beginner pattern in the same content revision, then let Chapter 42 deliberately revisit it for answer-building and mixed transfer. Do not repeat first-exposure definitions as Chapter 42’s main achievement; reconcile the two proposals so the prerequisite and spiral targets stay explicit.
- **Chapter 41 → Chapter 42:** Chapter 41 is proposed as reading comprehension using familiar structures. Use its reading habit as a short bridge—read the whole answer/context before choosing a question word—but do not repeat Chapter 41’s passage-comprehension lesson sequence.
- **Chapter 42 → Chapter 43:** Chapter 43 is an integrated bridge and the Conversation Labs roadmap provisionally assigns CL13 “Food and Hospitality” there. Keep Chapter 42’s Q&A activity as a bounded grammar/application exercise, not a second hospitality dialogue; do not preteach CL13’s food-offer/accept/decline vocabulary.
- **Chapter 42 → Chapter 48:** The roadmap places CL14 “Time and Travel Planning” at Chapter 48. Chapter 42 must still teach **مَتَى** because it is in the mapped interrogative set, but keep it to choosing/interpreting time answers; leave planning a journey, departure negotiation, and extended time dialogue for the later lab.

## Quran and language review

The Quranic Arabic Corpus identifies **كَمْ لَبِثْتُمْ** in Al-Kahf 18:19 as “How long have you remained?” and analyzes **كَمْ** there as an interrogative expression of time, with the duration understood in context. This is a useful authentic Q&A recognition example, but it is not the same structure as the lesson’s constructed **كَمْ كِتَابًا** pattern. The Corpus analysis of Al-Mu’minun 23:112 likewise distinguishes interrogative **كَمْ**, an accusative specification, and **سِنِينَ** in a genitive construction—evidence against the fixture’s “always genitive” rule. See [Al-Kahf 18:19 grammar](https://corpus.quran.com/grammar.jsp?chapter=18&verse=19), [Al-Kahf 18:19 word-by-word analysis](https://corpus.quran.com/wordbyword.jsp?chapter=18&verse=19), and [Al-Mu’minun 23:112 grammar](https://corpus.quran.com/grammar.jsp?chapter=23&token=0&verse=112).

The map’s Al-Isra 17:85 reference is a question-and-answer context: the Quranic Arabic Corpus translates it as asking about the soul, followed by the response and the statement that people have been given little knowledge. If used, preserve the precise excerpt/reference and treat its larger meaning respectfully; do not claim it illustrates **كَمْ، مَتَى، لِمَاذَا، كَيْفَ**. See [Al-Isra 17:85 translations](https://corpus.quran.com/translation.jsp?chapter=17&verse=85) and [word-by-word analysis](https://corpus.quran.com/wordbyword.jsp?chapter=17&verse=85).

The Corpus supports the cited Quranic forms and contextual observations; it does not substitute for qualified Arabic/Quran review or scholarly sourcing of hadith/devotional claims. Do not use an unsourced religious quotation to decorate a vocabulary card.

## Implementation checklist after approval

1. Reconcile map, maintained source, fixture `_meta`, chapter title, lesson count, focus records, hook, and the four mapped question intents; integrate or remove “Knowledge Is Limited” as a non-assessed contextual Quran observation.
2. Correct **كَمْ** analysis and examples in both Chapters 31 and 42; remove the genitive-always claim, object mislabel, plural count specification, and damaged Arabic plain text. Keep the edits aligned with the existing Chapter 31 proposal and publish only after both chapter sequences use the same reviewed rule.
3. Correct **غَدًا / أَمْسِ**, the past/future examples, **تَقُومُ** and **تَعْلَمُ** descriptions, and all associated translations/transliterations.
4. Restore a focused **كَيْفَ** application lesson and make the Chapter 31-to-42 spiral explicit in learner-facing language.
5. Rebuild the mixed practice and review with varied tasks and a small, vocabulary-bank-checked lexical progression; keep CL13 and CL14 topics/lesson roles distinct.
6. Align Quran text, exact references, translations, and lesson purpose; obtain qualified Arabic/Quran review and review any retained religious wording separately.
7. Add the checkpoint using only the canonical schema’s supported top-level assessment fields. Then run `npm run db:validate-fixtures`, `npm run db:audit-urdu`, and `npm run content:check` from `warsh-backend`; do not sync fixtures while parity is failing or run the production seed for content work.
8. Account for learner “Updated” notices if published lesson content changes.

## Acceptance criteria

- Chapter 42 clearly spirals beyond Chapter 31’s introductory question-word recognition, without claiming to introduce the same forms for the first time.
- All four mapped forms are taught and practiced: **كَمْ، مَتَى، لِمَاذَا، كَيْفَ**.
- No learner-facing rule says **كَمْ** is always followed by a genitive noun or misidentifies the quantity specification as a direct object; each example’s Arabic, gloss, and analysis agree.
- Time and verb descriptions are accurate; **غَدًا** is not translated as yesterday, and context is distinguished from verb form.
- **لِ** is not glossed as “because” by itself; reason-answer teaching distinguishes it from **لِأَنَّ**.
- Vocabulary is selected, checked for duplication, recycled, and localized in English and Urdu; no corrupted Arabic plain-text values or mixed-language Urdu remain.
- The map, Quran hook, references, source metadata, and lessons agree; Quranic text is exact and not used to imply unsupported grammar.
- A canonical checkpoint assesses independent selection and response across all four question intents, and Chapter 43/48 Conversation Labs retain their distinct purposes.
- Approved fixtures pass schema validation, Urdu audit, and database parity before publication.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–5 | `ch42-l01`–`ch42-l05` | `STANDARD` | `chapter-42-lesson-01.json`–`-05.json` |
| 6 | `ch42-l06` (new) | `REVIEW` | `chapter-42-lesson-06-review.json` |
| 7 | `ch42-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-42-lesson-07-final-test.json` |

**Corrections**

1. The checkpoint is `ch42-test`, not `ch42-l07` (S2), with 12 questions (S1).
2. The **كَمْ** rule is fixed once in Chapter 31 (singular noun with **ـًا**); Lesson 1 retrieves that pattern and deepens it. Answers give the quantity as a digit (**كَمْ كِتَابًا قَرَأْتَ؟ — ٣**) or a short familiar phrase — number words and number–noun agreement belong to Chapter 48. The term تمييز stays for Chapter 71.
3. **لِأَنَّ** is taught as a fixed "because" starter; **أَنَّ** itself is Chapter 49's (sisters of **إِنَّ**).
4. Chapter 43 also opens with time words; keep Lesson 2 on matching question to answer, so Chapter 43 Lesson 1 can do verb-form-versus-time-cue work without repeating it.
