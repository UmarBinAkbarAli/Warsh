# Chapter 33 — Book 3 Reading Bridge and Readiness Check

**Status:** Proposal only — not approved or implemented

**Evidence reviewed:** Chapter 33 map, all five registered lesson fixtures, seed order, relevant Chapter 19 and 29–32 fixtures, and Chapter 34's map entry. A read-only `content:check` attempt on 2026-09-30 could not complete because the Prisma/PostgreSQL connection terminated. Current fixture/database parity is therefore **unverified**; no database content was changed.

**Scope:** Chapter 33 content, assessment, and handoff to Chapter 34. No fixture, seed, or database changes are included here.

## Recommendation

Keep Chapter 33 as the bridge from Book 3 reading into Book 4, but make it a genuine **retrieval, transfer, and readiness checkpoint** rather than five lessons that each claim exhaustive comprehension. Chapters 29–32 already teach or read much of this chapter's material. Reuse those passages deliberately to measure fluency and transfer, clearly labeling retrieval as retrieval; do not call a passage the learner's “first complete surah” or say every word has been analyzed when it has already appeared or is not actually covered.

The chapter has five substantial Standard lessons, each with seven exercises. That is enough instructional time; the main need is to refocus the lessons, repair Arabic/content errors, and add a clear final review and checkpoint. The proposal restructures to four guided/application lessons, one `REVIEW`, and one `REVIEW` checkpoint with the canonical top-level `assessment.type = CHAPTER_TEST` payload. It does not add another new grammar topic.

## Current-state audit

The map names Chapter 33 **“Book 3 Bridge”** and describes a consolidation of Books 1–3. It uses Adh-Dhariyat 51:56 as its hook. The five lesson fixtures instead identify their chapter title as **“Reading Comprehension and Integration”** and sequence readings of Al-Kafirun, Al-Falaq, An-Nasr, a mixed passage, and Al-Fatiha 1:5. The map's hook and title, its four focus records, the fixture titles, and their lesson content are not aligned. The map source `reader_lecture_33_book3_bridge.md` and fixture source `book3_lesson10_closing.md` are both absent at the referenced paths.

The “full/extended reading” labels also overpromise the actual lesson bodies: Al-Kafirun L1 samples 109:1, 109:2, and 109:6 but omits 109:3–5; Al-Falaq L2 presents 113:1 and an excerpt through 113:2 but omits 113:3–5; and An-Nasr L3 uses 110:1 and selected material from 110:3 but omits 110:2. Either build a genuine connected reading with all verses in order or label each lesson as selected-excerpt retrieval.

### Issues and fixes

| Priority | Issue | Proposed fix |
|---|---|---|
| Critical | **The bridge repeats content already taught, while presenting it as new or exhaustive.** Chapter 29 has nominal/verbal sentence lessons, **إِنَّ**, Al-Kafirun parsing, and a Tadabbur unlock; Chapter 30 has connected reading, dialogue, and Al-Kafirun integration. Chapter 19's review gives limited exposure to Al-Falaq 113:3 and 113:5; Chapter 32's current fixtures use An-Nasr 110:1–3, though its proposal recommends moving to a fresh example. | Recast Chapter 33 as deliberate retrieval and transfer. Select short excerpts from earlier passages to assess connected reading, clause relations, and meaning. Do not re-teach the same vocabulary/grammar as new. Coordinate with the Chapter 32 proposal: if approved, Chapter 33 can own the sole full An-Nasr reading; until then, treat the current duplicate as a sequencing defect. |
| Critical | **Chapter 33 L1 says Al-Kafirun is the learner's “first complete Surah,” although Chapters 29–30 already teach and integrate it; the fixture itself is not a complete reading.** It samples 109:1, 109:2, and 109:6 but omits 109:3–5, while promising “every word” and “every sentence type.” Its “we worship and we seek help” build exercise is from Al-Fatiha 1:5, not Al-Kafirun. | Remove first-time/exhaustive claims. Either include a reviewed connected reading of all six ayat, or label this lesson as selected-excerpt retrieval and align exercises with those excerpts. Do not place an Al-Fatiha exercise inside the Al-Kafirun lesson. |
| High | **L2 is titled an extended reading of Surah Al-Falaq, but only presents 113:1 and an excerpt extending into 113:2; verses 113:3–5 are absent.** The intro also calls the words new even though Chapter 19's review includes Al-Falaq 113:1, 113:3, and 113:5, after Chapters 18–19 have already worked with the surah's vocabulary. | Either include and guide a coherent reading of all five ayat, clearly labeling vocabulary/grammar as retrieval, or retitle the lesson as a selected-excerpt review. Focus its new value on connected meaning and reading fluency, not reintroducing familiar words as new. |
| High | **L1 imports an unrelated religious summary and overstates verse structure.** Its Al-Kafirun summary adds “No compulsion in religion,” wording from Al-Baqarah 2:256, and says each ayah is a distinct grammatical unit. | Keep the lesson's summary tied to the text actually read. Remove the cross-surah theological slogan and avoid claiming every ayah is exactly one grammatical unit; guide learners to follow clauses and links across ayah boundaries where needed. |
| High | **L1 imports Al-Fatiha 1:5 vocabulary and present-tense analysis into an Al-Kafirun reading before Chapter 34.** It teaches **نَعْبُدُ / نَسْتَعِينُ** as present tense and includes a “we worship and seek help” sentence-build task. | Remove those cross-surah cards/tasks from L1. If **نَعْبُدُ** and **نَسْتَعِينُ** are retained in the Al-Fatiha capstone, keep them as recognition-only forms until Chapter 34 teaches the present-tense system; correct the root of **نَسْتَعِينُ** everywhere. |
| Critical | **The Al-Fatiha capstone overclaims its coverage and tests material from another surah.** Lesson 5 centers on 1:5, yet says learners understand “ALL of Al-Fatiha,” “every word,” and all of Book 3; its final translation exercise is An-Nasr 110:3. | Limit the claim and exercises to Al-Fatiha 1:5. Treat its present-tense forms as a recognition-only preview because Chapter 34 formally begins the present-tense prefix system. Move Book 3 readiness assessment into its own review/test; never say one verse proves complete understanding of Al-Fatiha or Quranic Arabic. |
| Critical | **L3 says learners will read all of An-Nasr, but the lesson content omits 110:2.** Its hook/reveal and core practice cover 110:1; later exercises use selected language from 110:3. No exercise, card, or example includes **وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا** (110:2). | If An-Nasr is the one full-surah reading, include all three ayat in order in an actual connected-reading activity and assess verse 2; do not infer full coverage from the hook, title, or a verse-3 phrase. Otherwise retitle and label it as selected excerpts, and remove “read completely/full surah” claims. |
| High | **The lesson, map, and source metadata disagree.** Map title is “Book 3 Bridge”; every fixture uses “Reading Comprehension and Integration.” Map hook 51:56 does not match the lesson hooks. The map has four focus entries for five lessons, and all fixtures cite a missing source. | Set one chapter identity and progression across map and fixtures. Update hook, examples, focus records, chapter title, and source references together. Use a present, verified source—or the owner-approved proposal after implementation—instead of absent lecture files. |
| High | **Lesson 4 gives a false sentence-boundary rule.** It says first find boundaries by looking for **وَ** or pause marks. **وَ** can join words or phrases as well as clauses; it is not a reliable sentence-boundary detector by itself. | Teach a layered reading method: use meaning and syntax to locate clauses; treat **وَ** as a connector whose scope must be read in context. Use punctuation/pauses as aids, not as the grammar rule. |
| High | **Lesson 4 misclassifies الْطَّالِبُ يَقْرَأُ الْكِتَابَ.** It begins with a noun, so this is a nominal sentence whose predicate is a verbal clause, not a verbal sentence merely because its predicate contains a verb. | Correct the parse and use this as a purposeful example of a clause embedded as predicate only if that construction has been taught. Otherwise choose an example within the learner's assessed level. |
| High | **Lesson 4 promises questions but supplies no question in its mixed passage.** Its hook is Al-Kafirun 109:5, but its reveal switches to 109:6, and a translation exercise on 109:6 repeats a Chapter 33 L1 item. | Either include a real, previously taught question in the reading and assess it, or remove “questions” from the objective. Align hook, passage, exercises, and reveal to one coherent text; remove duplicate testing of the same translation. |
| High | **Lesson 2's analysis of قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ collapses two clauses into one.** It calls the whole phrase a single verbal sentence with a present-tense verb, even though **قُلْ** is an imperative clause and **أَعُوذُ** begins the quoted/specified utterance. | Teach it as two linked pieces: the command “Say” and the utterance “I seek refuge …”. Do not suggest the full construction contains only a present-tense verb. Label **يَا** as the vocative particle and explain **أَيُّهَا** as part of the address formula where relevant. |
| High | **Lesson 3 turns a historical report into an unqualified fact and infers that the Prophet knew his mission was complete.** Sahih Muslim 3024a reports Ibn Abbas naming An-Nasr as the last surah revealed “as a whole,” while Sahih Muslim 1618c reports al-Bara naming At-Tawbah as the last complete surah. The fixture neither attributes nor acknowledges the differing reports; the “mission complete” claim does not follow from the grammar. | Remove revelation chronology and the inference about the Prophet's knowledge from this language lesson. If a separate optional source note is ever retained, cite the report accurately, acknowledge differing reports, and obtain qualified review; do not present one narration as an uncontested historical conclusion. |
| High | **L3 overstates the grammar/rhetoric of إِذَا.** It says Quranic **إِذَا** “often introduces a future event described in past tense,” then claims this creates certainty about the future. That collapses a particular contextual translation into a universal grammatical/rhetorical rule. | Teach only the reviewed example: **جَاءَ** is morphologically perfect and, in this construction/context, is translated with a future-oriented “comes/has come.” Remove the generalized certainty claim; defer broader rhetoric to a qualified source and a lesson designed for it. |
| High | **The same lesson states categorically that إِذَا means “when, not if.”** The map calls the construction conditional, while the English gloss and Noor exercise set up an absolute time-versus-condition contrast; translations vary with context. | Teach the target reading in its own verse (“when … comes/has come”) without claiming **إِذَا** can never be translated or understood conditionally. Keep terminology and example translations consistent with the Chapter 32 proposal and have an Arabic reviewer verify the learner-level wording. |
| Medium | **L3's explanation for كَانَ says “was/became (linking verb connecting to present sense),” which is not a clear or supported learner rule.** | Keep the verse's reviewed translation and identify **كَانَ** only at the level already taught; remove “connecting to present sense” unless an Arabic reviewer supplies a precise explanation appropriate to the course. |
| High | **Lesson 5 gives the wrong root for نَسْتَعِينُ.** It lists **س-ع-ن**; the Quranic Arabic Corpus identifies the root as **ع-و-ن** and the form as Form X. The same error appears in Lesson 1's unrelated word card. | Correct the root and derived form everywhere, or remove that word analysis from Lesson 1. Verify root, pattern, and gloss against a trusted morphology source. |
| High | **Lesson 5 says إِيَّاكَ is “always the object.”** The lesson's verse uses the pronoun in an object role, but the absolute statement exceeds the example and the learning objective. | Bound the explanation to Al-Fatiha 1:5: here **إِيَّاكَ** is the fronted object in the two clauses. Avoid “always” and explain the focus/emphasis cautiously, with an Arabic reviewer. |
| High | **The map's parsing labels and “Preposition Chains” focus are wrong for their examples.** In **إِنَّ الإِنْسَانَ لَفِي خُسْرٍ**, **إِنَّ** is mislabeled a preposition, **الإِنْسَانَ** an object, and **خُسْرٍ** a genitive complement of an iḍāfa. The third map example (**رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا**) does not contain the multiple prepositions its focus question implies. | Correct the parsing labels and split **لَفِي** into its relevant parts if the schema/map allows. Replace the focus/example pair with an actually taught, level-appropriate preposition chain—or change the focus to what the example really teaches. |
| Medium | **The fixtures use the same seven-item exercise pattern, and every `TAP_TRANSLATION` answer is at option index 0 across all five lessons.** Repeated format and answer position make the capstone guessable. | Keep familiar interaction types but vary the exercise sequence and correct-answer positions. Give wrong-answer feedback that explains the relevant clause or word, not only the full translation. |
| Medium | **Learner-facing strings contain corruption and language drift.** Examples include “worshipps,” the unrelated Cyrillic “особенность,” German “gebraucht” inside Urdu, misspelled **بِاللَّاهِ**, and malformed/plain-text transliterations. | Proofread every Arabic, `ar_plain`, transliteration, English, and Urdu field as a linked set. Correct the Arabic spelling and remove stray foreign-language fragments; use qualified Arabic and Urdu review for learner-facing content. |
| Medium | **Every lesson's final “Parse:” exercise is only a true/false recognition item marked `true`; it does not ask the learner to parse or provide meaningful correction.** The repeated exercise rhythm also places every `TAP_TRANSLATION` answer at option 0. | Replace pseudo-parsing with a supported task that tests a small, taught parsing target and gives explanatory feedback, or remove the parse claim. Vary exercise formats and answer positions to prevent pattern guessing. |
| Medium | **The chapter presents “understand every word,” “read a page without pausing,” and “ALL of Al-Fatiha” as outcomes.** These are unmeasured, absolute fluency claims. | State observable outcomes: read a short, level-appropriate connected passage; identify taught structures; answer meaning questions with textual evidence; and note which forms are a preview of Chapter 34. |

## Curriculum continuity and non-duplication

- **Chapter 19 Lesson 6** includes Al-Falaq 113:1, 113:3, and 113:5 in a review; the last two receive short meaning matches (“when it settles,” “when he envies”), not a dedicated **إِذَا** lesson. Chapter 33 can retrieve Al-Falaq as connected reading, but should not present its already-seen vocabulary or two **إِذَا** forms as first exposure.
- **Chapter 29** covers nominal/verbal sentence patterns, **إِنَّ**, and Al-Kafirun parsing/unlock. **Chapter 30** then has an Al-Kafirun reading-integration lesson. Chapter 33 must not call Al-Kafirun a first complete surah or teach the same parsing again; if it appears, the new objective must be fluent transfer with little scaffolding.
- **Chapter 31** teaches questions; the **Chapter 32 proposal** makes its current first focused treatment of **إِذَا** clause structure. Chapter 33 can retrieve both in a mixed passage, but should not claim them as new grammar.
- **Chapter 33's current An-Nasr lesson** repeats Chapter 32's current full-surah work. The Chapter 32 proposal moves its reading to a fresh example; if approved, make Chapter 33 the single An-Nasr reading and use it for retrieval/application of the newly taught conditional reading rather than re-teaching it.
- **Chapter 34** formally teaches the present-tense prefix system. Chapter 33's Al-Fatiha 1:5 preview should be recognition-only and should not be scored as mastery of a pattern not yet taught.
- Keep the chapter as a **bridge/checkpoint**, not a new grammar unit or the claim that learners can parse any Quranic page. Later chapters should extend reading fluency and grammar into new structures rather than restaging these same three surahs as introductory lessons.

## Proposed chapter outcomes

**Title:** **Book 3 Reading Bridge: Review, Transfer, and Readiness**

**Arabic title:** **مُرَاجَعَةُ الْقِرَاءَةِ وَالتَّطْبِيقِ** (Arabic editor to confirm)

**Description:** Retrieve the Arabic structures learned in Books 1–3, apply them to short connected passages, and check readiness for the present-tense lessons in Book 4.

By the end of the chapter, a learner should be able to:

1. read a short familiar and a short new passage for overall meaning;
2. use taught sentence, phrase, and connector knowledge to follow who did what and how ideas relate;
3. recognize previously learned **إِذَا** and question forms in context without treating them as new content;
4. distinguish what has been taught from a preview of the Chapter 34 present-tense system; and
5. show readiness through a mixed review and a chapter checkpoint with useful corrective feedback.

Do not use “every word,” “all sentence types,” “all of Al-Fatiha,” or “read a page without pausing” as acceptance criteria.

## Proposed lesson sequence

Keep existing IDs `ch33-l01` through `ch33-l05`; rewrite them to fit this sequence. Convert `ch33-l05` into a `REVIEW`, then add `ch33-l06` as a final `REVIEW`-template checkpoint with the canonical top-level `assessment.type = CHAPTER_TEST` payload, following schema and seed conventions. This creates a measurable bridge without another new grammar topic.

| Order / ID | Template | Proposed lesson | Scope and design |
|---|---|---|---|
| 1 — `ch33-l01` | `STANDARD` | **Read Familiar Arabic with Less Scaffolding** | Use short, labeled retrieval excerpts from Al-Kafirun, previously parsed in Chapters 29–30. Say which earlier work learners are retrieving. Remove “first surah/every word” claims; do not re-teach vocabulary unless a specific new retrieval need is demonstrated. |
| 2 — `ch33-l02` | `STANDARD` | **Read All of Al-Falaq as Connected Meaning** | Present all five ayat in order as one connected reading. Build on Chapter 19's selected vocabulary as retrieval; focus on flow, repeated structure, and whole-passage meaning rather than redefining familiar words. Include questions about the complete passage, not only 113:1–2. Proofread the **قُلْ أَعُوذُ** two-clause explanation. If the lesson is intentionally shortened to excerpts, retitle it and clearly name the verses included instead of calling it a full-surah reading. |
| 3 — `ch33-l03` | `STANDARD` | **An-Nasr: Apply What You Know** | If the Chapter 32 proposal is approved, make this the single full An-Nasr reading. Present all three ayat in order, including 110:2, in a connected reading. Have learners retrieve the **إِذَا** structure taught in Chapter 32, track the passage, and answer context questions. Keep historical chronology, tafsir, and claims about what the Prophet knew out of this language lesson; focus on the Arabic and reviewed translation. |
| 4 — `ch33-l04` | `STANDARD` | **Mixed Grammar: Track Meaning Across Clauses** | Replace the current sample with a coherent, reviewed passage. Include only structures already taught; correctly classify a nominal sentence with a verbal predicate; use **وَ** as a connector, not a guaranteed boundary; include an actual question only if the objective says questions are practiced. Align the hook and reveal to this passage. |
| 5 — `ch33-l05` | `REVIEW` | **Book 3 Retrieval Review** | Mix short retrieval from Chapters 19, 29–32 with one new, level-appropriate constructed passage. Assess meaning and transfer, not unfamiliar morphology or religious interpretation. Provide targeted feedback. |
| 6 — `ch33-l06` | `REVIEW` | **Book 3 Readiness Check** | Add the canonical top-level `assessment` payload with `type: CHAPTER_TEST` and configured scoring. Cover the stated Book 3 outcomes; do not test Chapter 34's present-tense endings/prefix paradigm before that lesson. |

This is intentionally six lessons, not an attempt to make every chapter the same length. The current five lessons already devote about 43 estimated minutes; the proposed sixth item is a short, separate checkpoint. Keep individual reading lessons focused and remove duplicated word-by-word explanations so the increase is assessment, not more lecture.

## Checkpoint blueprint

A balanced 12-item test could include:

- 3 short-passage comprehension items (include a familiar excerpt and a new, level-appropriate constructed passage);
- 2 items on sentence/clause relationships and connector scope;
- 2 items retrieving nominal/verbal sentence, **إِنَّ / لَيْسَ**, and iḍāfa/preposition distinctions actually taught earlier;
- 2 items recognizing prior question forms in context;
- 2 items retrieving **إِذَا** and identifying an expressed response where present; and
- 1 item distinguishing a taught form from the Chapter 34 preview without scoring present-tense conjugation.

Use varied exercise types and answer positions. Do not assess theological claims, full tafsir, Quranic memorization, an unintroduced present-tense paradigm, or “every word” coverage. Use only vocabulary and grammar supported by earlier lessons or clearly taught in this bridge. Follow existing course pass/retry behavior; do not create chapter-specific scoring rules.

## Quran, Arabic, and source review

- The statement “There is no compulsion in religion” is from Al-Baqarah 2:256, not a quotation from Al-Kafirun 109. Keep it out of an Al-Kafirun grammatical summary. [QAC, Al-Baqarah 2:256](https://corpus.quran.com/translation.jsp?chapter=2&verse=256)
- The Quranic Arabic Corpus parses **أَيُّهَا الْكَافِرُونَ** as a vocative construction and identifies **قُلْ** as an imperative; distinguish the preceding vocative particle **يَا** from the **أَيُّهَا** address expression. [QAC, Al-Kafirun 109:1](https://corpus.quran.com/wordbyword.jsp?chapter=109&verse=1)
- For Al-Fatiha 1:5, QAC identifies **نَعْبُدُ** and **نَسْتَعِينُ** as first-person plural imperfect verbs. Its Quran dictionary places **نَسْتَعِينُ** under root **ع-و-ن**, Form X—not **س-ع-ن**. [QAC, Al-Fatiha 1:5 syntax](https://corpus.quran.com/treebank.jsp?chapter=1&verse=5), [QAC, root ع-و-ن](https://corpus.quran.com/qurandictionary.jsp?q=Ewn)
- Chapter 33 L3 currently has no Arabic or exercise content from An-Nasr 110:2 even though its copy promises a complete reading. If the sequence keeps the entire surah, include the verse's content and check the lesson against the source rather than relying on its title. [QAC, An-Nasr 110:2](https://corpus.quran.com/wordbyword.jsp?chapter=110&verse=2)
- QAC analyzes **كَانَ** as a perfect verb and **تَوَّابًا** as an accusative active participle; use a reviewed translation and avoid the fixture's unsupported “connecting to present sense” rule. [QAC, An-Nasr 110:3](https://corpus.quran.com/wordbyword.jsp?chapter=110&verse=3)
- The current unqualified chronology should be removed from this language curriculum. Sahih Muslim 3024a reports Ibn Abbas naming An-Nasr as the last surah revealed “as a whole,” while Sahih Muslim 1618c reports al-Bara naming At-Tawbah as the last complete surah. These are reports with differing answers, not a grammar conclusion; any separate treatment requires qualified hadith/Quran-content review. [Sahih Muslim 3024a](https://sunnah.com/muslim:3024a), [Sahih Muslim 1618c](https://sunnah.com/muslim:1618c)

These sources support the specific Arabic and attribution corrections; they do not replace qualified review of Quranic explanation and translation.

## Implementation checklist

1. The latest `content:check` attempt could not complete because the database connection terminated. Do not infer parity from fixtures alone. Retry `npm run content:check` before publication; if Studio edits create divergence, inspect the database-authoritative Chapter 33 content before reconciling fixtures.
2. Align the map and fixtures on chapter title, description, hook, lesson sequence, focus records, and source metadata. The Chapter 33 map's parse labels and preposition focus require correction.
3. Coordinate with the Chapter 32 proposal so An-Nasr has one primary full-surah lesson; proposals are not approved requirements until the owner approves them.
4. Keep stable existing lesson IDs. Add the review and checkpoint only in the form supported by `packages/lesson-schema` and the current seed ordering.
5. Have a qualified Arabic/Quran reviewer verify grammar, vocalization, morphology, translation, and historical/revelatory attribution. Have an Urdu editor review every Urdu counterpart.
6. Validate revised fixtures with `npm run db:validate-fixtures` from `warsh-backend`. Do not run the production seed for content publication.
7. Plan for the normal learner “Updated” notices if existing lessons are revised.

## Acceptance criteria

- The chapter's map, metadata, and lessons consistently describe a Book 3 reading bridge and readiness checkpoint.
- Every reuse of Al-Kafirun, Al-Falaq, or An-Nasr is explicitly purposeful retrieval/transfer; no “first-time” or exhaustive claims contradict earlier chapters or actual coverage. If L2 keeps its full-surah title, all five Al-Falaq ayat appear in order and the comprehension practice samples the whole reading; otherwise, the title and scope explicitly say selected excerpts.
- If L3 is described as a full An-Nasr reading, it actually presents and assesses all three ayat in order, including 110:2; otherwise, it is explicitly labeled as selected excerpts.
- No cross-surah exercise contamination, wrong root, false clause classification, unreliable **وَ** boundary rule, misidentified **أَيُّهَا**, malformed string, or unsupported historical assertion remains.
- The mixed lesson's hook, passage, exercises, reveal, and title agree.
- The review and checkpoint assess taught Book 3 outcomes and do not test Chapter 34's unintroduced conjugation system.
- Answer positions and practice types vary; incorrect answers receive explanatory feedback.
- Fixture/database parity is confirmed before publication, and the canonical validator passes after approved changes.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–4 | `ch33-l01`–`ch33-l04` | `STANDARD` | `chapter-33-lesson-01.json`–`-04.json` |
| 5 | `ch33-l05` | `REVIEW` (was `STANDARD`) | `chapter-33-lesson-05-review.json` |
| 6 | `ch33-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-33-lesson-06-final-test.json` |

**Corrections**

1. The checkpoint is the new row **`ch33-test`**, not `ch33-l06` (S2).
2. With Chapter 32's amendments, Chapter 32 no longer reads An-Nasr, so Lesson 3 is the single full An-Nasr reading unconditionally.
3. Al-Fatiha 1:5 leaves this chapter; Chapter 34 retrieves **نَعْبُدُ** from Chapter 10 instead.
4. Lesson 1 retrieves short Al-Kafirun excerpts only; Chapter 30 owns the full reading. Chapter 29's Tadabbur lesson is removed by its own proposal, so do not cite it as a prerequisite.
