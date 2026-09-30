# Chapter 32 — إِذَا: When a Condition Occurs

**Status:** Proposal only — not approved or implemented
**Evidence reviewed:** Chapter 32 curriculum map and four lesson fixtures; Chapter 19, 29–31, and 33 fixtures; seed lesson registration; and Chapter 33–35 map entries. A read-only `content:check` was attempted on 2026-09-30 but could not complete: the Prisma/PostgreSQL connection terminated. Current fixture/database parity is therefore **unverified**; no database content was changed.
**Scope:** Chapter 32 content and sequencing. No fixture, seed, or database changes are included here.

## Recommendation

Rebuild Chapter 32 around the topic its curriculum-map entry actually promises: applied **إِذَا** clause structure. Treat it as the first focused instruction on the pattern, while deliberately retrieving the limited exposure in Chapter 19's review: two Al-Falaq examples, **إِذَا وَقَبَ** (113:3) and **إِذَا حَسَدَ** (113:5), with “when” glosses. Chapter 19 provides useful recognition/contextual exposure, but it does not teach an explicit clause-and-response analysis or establish mastery. Chapter 32 should briefly recall those examples, then teach how to follow an introduced event and its expressed response/result, and transfer that skill to a fresh example. Do not use it as another general review of nominal/verbal sentences, **إِنَّ**, **لَيْسَ**, and sentence parsing; Chapter 29 already teaches those. Do not use An-Nasr as Chapter 32's reading capstone: Chapter 33 Lesson 3 already has the An-Nasr reading slot, and Lesson 5 is explicitly the Book 3 capstone.

The topic deserves four focused teaching lessons plus a short retrieval review. The added depth is justified by the distinction between Chapter 31's question *when?* (**مَتَى**) and **إِذَا**, the new relationship between an **إِذَا** clause and its response, and transfer from familiar review examples to a fresh Quranic context. Begin by checking what Chapter 19's review actually taught; do not assume that seeing the two forms once means learners have mastered the contextual reading. Revisit the form/context distinction briefly, then devote most practice to the new clause relationship and transfer.

## Current-state audit

The map calls Chapter 32 **“Applied Grammar: إِذَا”** and uses An-Nasr 110:1 as its hook. The four registered fixtures instead have these titles:

1. Reviewing Nominal and Verbal Sentences
2. Analysis: **إِنَّ** and **لَيْسَ** Sentences
3. Sentence Analysis Practice
4. Integration: Full Passage Analysis

All four fixtures identify their chapter title as “Applied Grammar and Sentence Analysis” and cite the same source file, `book3_lessons9-10_grammar_reinforcement.md`. The map cites a different source, `reader_lecture_32_applied_grammar_idha.md`. Neither source file is present at the referenced path. The content and map therefore disagree about the chapter's subject, title, source, and intended progression.

### Issues and fixes

| Priority | Issue | Proposed fix |
|---|---|---|
| Critical | **The chapter teaches a different topic from its map.** The map promises **إِذَا**, but most lesson time revisits sentence classification, **إِنَّ / لَيْسَ**, commands, and broad parsing. | Make all lessons serve the **إِذَا** outcome. Use only brief retrieval of prerequisite grammar inside the relevant example; do not move this chapter's new **إِذَا** instruction into Chapter 33 or reteach prior chapters' full core explanations. |
| High | **There is direct duplication with Chapter 29.** Chapter 29 already teaches nominal and verbal sentences, introduces **إِنَّ**, and parses Al-Kafirun. The Chapter 32 L1–L2 core is largely repetition. | Remove the duplicate lessons. If a prior concept is needed to read an **إِذَا** example, retrieve it briefly in context without reteaching its full rule. |
| High | **The progression is not explicit across Chapters 19, 32, and 33.** Chapter 19's review offers two **إِذَا** examples and contextual glosses, but not a focused lesson on the clause/response relationship. Chapter 33 Lesson 3 already occupies the An-Nasr reading slot with **إِذَا جَاءَ**; Lesson 5 is a Book 3 capstone. | Make the spiral precise: retrieve the Chapter 19 examples without assuming mastery, teach clause-to-response structure as the new learning, and transfer it to a fresh reviewed example such as Al-Inshiqaq 84:1. Keep An-Nasr for Chapter 33's existing reading slot; do not duplicate its passage or make Chapter 32 claim course-stage completion. |
| High | **The transition to Chapter 33 is muddled.** Chapter 33's map calls it a “Book 3 Bridge”; its five fixture titles cover extended readings of Al-Kafirun, Al-Falaq, and An-Nasr, mixed-grammar reading, and a Book 3 capstone. Its L3 has the An-Nasr reading slot, and L5 is “Book 3 Capstone Integration.” Chapter 32 L4 already says Book 3 is complete. | Reserve the existing full-surah reading and course-stage capstone for Chapter 33. Chapter 32 should close only its applied **إِذَا** unit. Do not claim Book 3 mastery in Chapter 32. Chapter 33's separate Quranic and learning-outcome claims still need their own audit; this recommendation does not endorse them. |
| High | **Chapter 32 L2 teaches a false rule for لَيْسَ.** It says both the noun and predicate are nominative in **لَيْسَ الْكِتَابُ جَدِيدًا**. In the basic **لَيْسَ** construction, the noun is nominative and the predicate is accusative. | Remove **لَيْسَ** from this chapter. If it is retained as a brief retrieval example elsewhere, correct the rule and have an Arabic editor review the wording. The Cairo Arabic Language Academy describes **لَيْسَ** as raising its noun and assigning accusative to its predicate. |
| High | **The Chapter 32 L1 parsing labels إِذَا as حَرْفُ جَرّ (a preposition).** That is not an appropriate label here; in An-Nasr 110:1 the Quranic Arabic Corpus analyzes it as a time adverb. | Correct the map token label and teach a beginner-safe description such as “when; introduces a time/conditional clause.” Avoid presenting it as a preposition or claiming that it itself causes a particular verb mood. |
| High | **The reveal describes the verse's meaning as “a future event in the past.”** This confuses the perfect verb form **جَاءَ** with the time understood from **إِذَا** and the verse context. | Explain form and contextual time separately: **جَاءَ** is morphologically perfect; in this **إِذَا** construction it is translated with the future-oriented “when … comes/has come,” according to the reviewed translation. Do not call it a “future event in the past.” |
| High | **The description of لَيْسَ's predicate is contradicted by its own example.** **جَدِيدًا** is visibly accusative, yet the card says “both nominative” and its true/false exercise marks the correct statement as false. | Remove the contradiction and any quiz item that depends on it. Every false statement should be followed by feedback that gives the corrected form and reason. |
| High | **The Chapter 32 L3 calls فَ an “imperative particle.”** In **فَسَبِّحْ**, the verb is imperative; the prefixed **فَ** is a connector/result marker in the verse's context, not the command marker. | Teach the imperative ending/form on **سَبِّحْ**. Label **فَ** separately as a connector, with its relationship to surrounding context verified. The Quranic Arabic Corpus labels the prefixed **فَ** here as a result particle and identifies **سَبِّحْ** as an imperative. |
| Medium | **The An-Nasr 110:2 true/false item is correctly keyed false, but its corrective explanation is imprecise at the end.** In **فِي دِينِ اللَّهِ**, **دِينِ** is genitive because it follows **فِي**; **اللَّهِ** is genitive as the second term of the iḍāfa. The current feedback begins by distinguishing these causes, then describes **اللَّهِ** ambiguously as modifying **دِينِ** “as genitive after **فِي**.” | Keep the false statement and its `correct_answer: false` key. Rewrite feedback to state the two relationships separately: **دِينِ** is majrūr after **فِي**; **دِينُ اللَّهِ** is an iḍāfa phrase in which **اللَّهِ** is majrūr as **مضاف إليه**. Do not claim that **دِينِ** is genitive because it is the possessor. |
| Medium | **L1 contains damaged or mistyped content.** The English grammar note includes the literal corruption “وGFP الْفَتْحُ”; the `ar_plain` for the verse drops/misorders **نَصْرُ اللَّهِ**; and a true/false item contains malformed Arabic (“إذا جعاء”). | Rebuild each affected string from the reviewed Arabic source, then check Arabic, `ar_plain`, transliteration, English, and Urdu together. Run fixture validation after corrections. |
| Medium | **The An-Nasr hooks in L1 and L2 do not match the lesson objective.** L1 uses 110:1 to teach sentence types; L2 uses 110:2 to teach **إِنَّ / لَيْسَ**, neither of which appears in those hooks. The same 110:1–3 material is then repeated in Chapter 33. | Use a fresh, reviewed Quranic example for Chapter 32 (candidate: Al-Inshiqaq 84:1) and reserve An-Nasr 110:1–3 for Chapter 33's existing full-surah lesson. |
| Medium | **L3 adds unrelated and potentially misleading morphology.** It attributes **تَوَّاب** to the root **و-ت-ب**, calls it a plain active participle, and labels **فَ** as an imperative particle. | Remove nonessential morphology from an **إِذَا** chapter. If **تَوَّابًا** appears in a reading exercise, verify its root, pattern, gloss, and syntactic role with a qualified reviewer. |
| Medium | **L4 overclaims the outcome.** “This is Book 3 grammar fully integrated” and “You have now completed Book 3” are not established by one three-ayah reading and conflict with the Chapter 33 bridge. | Replace with a precise outcome: learners have practiced recognizing **إِذَا** in a short passage and relating the clause to its context. Defer any course-stage completion message to the actual stage checkpoint. |
| Medium | **The same seven-item exercise rhythm repeats across the four lessons, but the target skill receives limited deliberate practice.** Multiple items test translation or parse assertions while the core condition/result distinction is not progressively practiced. | Use varied, scaffolded practice: identify the **إِذَا** clause, find its contextual response where present, distinguish question **مَتَى** from **إِذَا**, interpret a reviewed passage, and complete a short listening/reading task. |
| Medium | **English and Urdu need a content pass.** Examples include “the future event in the past,” Urdu “بھیڑوں کے ساتھ” for “in crowds,” a malformed Urdu parse prompt, and mixed untranslated terminology. | Have an Urdu editor proofread paired learner-facing strings for meaning, register, spelling, terminology consistency, and bidirectional Arabic display. Keep grammatical terminology consistent with the product's learner level. |
| Medium | **Source/provenance metadata points to missing files.** | Use a verified, present source with exact provenance, or remove the dangling `sourceFile`/`source` reference. Never present an absent lecture file as the source of the lesson. |

## Curriculum continuity

- **Chapter 29** already teaches nominal/verbal sentences, **إِنَّ**, and Quranic sentence parsing through Al-Kafirun. Chapter 32 should not re-teach those as its main content.
- **Chapter 30** develops connected reading and dialogue. Chapter 32 can use a short comprehension exchange as application, but should not repeat the general dialogue lesson.
- **Chapter 19** includes **إِذَا وَقَبَ** and **إِذَا حَسَدَ** in its Lesson 6 review of Al-Falaq, with answer feedback glossing them as “when it settles” and “when he envies.” That is genuine prior exposure, but it is a brief review exercise—not a dedicated **إِذَا** lesson or an explicit treatment of the response clause. Retrieve it without presuming mastery; the new Chapter 32 learning is systematic clause reading, the expressed response/result, and transfer.
- **Chapter 31** introduces question words, including **مَتَى**. Contrasting **مَتَى** (“When?”) with **إِذَا** (“when this event occurs…”) creates a useful forward step: one asks for a time; the other introduces a time/conditional clause. Keep the contrast narrow and example-led.
- **Chapter 33** is named “Book 3 Bridge” in the map; its actual fixtures include Al-Kafirun and Al-Falaq extended readings, a full An-Nasr reading in L3, mixed-grammar reading, and a Book 3 Al-Fatiha capstone in L5. Do not duplicate its An-Nasr passage in Chapter 32. Chapter 32's review should retrieve **إِذَا** and assess the new clause relationship, not act as another general Book 3 capstone.
- **Chapter 34** begins the present-tense system. Chapter 32 can prepare learners to distinguish a verb's displayed form from how an **إِذَا** construction is translated, but should not preview or teach the full **مُضَارِع** paradigm ahead of Chapter 34.

## Proposed chapter identity and outcomes

**Title:** **إِذَا: When a Condition Occurs**
**Arabic title:** **إِذَا وَمَا يَتْبَعُهَا** (Arabic editor to confirm)
**Description:** Build on earlier encounters with **إِذَا** to follow an introduced event and its expressed response, then transfer that reading skill to a new Quranic example.

By the end, a learner should be able to:

1. recall the two **إِذَا** examples and their context glosses encountered in Chapter 19's review, without assuming prior mastery or presenting them as a complete grammar lesson;
2. distinguish **إِذَا**'s clause-introducing function from Chapter 31's question word **مَتَى**;
3. identify the event/clause introduced by **إِذَا** and, when expressed, the following response or result;
4. recognize **فَ** as a connector in a reviewed example without calling it the imperative marker; and
5. transfer the clause-reading skill to a new, short Quranic example without duplicating Chapter 33's full An-Nasr reading.

## Proposed lesson sequence

Keep `ch32-l01` through `ch32-l04` stable, but rewrite their content to match their order. Add one targeted `REVIEW` as lesson ID `ch32-l05` (for example, fixture file `chapter-32-lesson-05-review.json`, consistent with existing review-file conventions). The existing schema and course already use the `REVIEW` template; add the new row to Chapter 32's seed registration only after checking the ordering conventions. Do not add a new template or force a generic chapter test solely to make this chapter resemble another chapter.

| Order / ID | Template | Proposed lesson | Scope and practice |
|---|---|---|---|
| 1 — `ch32-l01` | `STANDARD` | **إِذَا: Recall the Pattern, Find the Clause** | Start by checking recall of **إِذَا وَقَبَ** and **إِذَا حَسَدَ** from Chapter 19's review; treat this as retrieval of prior exposure, not proof of mastery. Contrast **مَتَى** from Chapter 31 (a question asking when) with **إِذَا** introducing a time/conditional clause. Clarify the contextual reading of the following verb briefly, then move on to the new clause relationship. |
| 2 — `ch32-l02` | `STANDARD` | **The Event and Its Response** | Add the new skill: locate the event introduced by **إِذَا** and the following response/result when one is stated. Use clear everyday examples first; identify the roles by meaning before introducing **جَوَابُ الشَّرْط**. Do not imply every occurrence has an explicit response in the same verse or sentence. |
| 3 — `ch32-l03` | `STANDARD` | **How the Response Connects: فَ** | Practice a reviewed response clause with **فَ**. Label **فَ** as a connector/result marker and distinguish it from any imperative verb in the example. Explain the response relationship only where the syntax/context supports it. Do not introduce **إِنْ** or a broad conditional-particle taxonomy. |
| 4 — `ch32-l04` | `STANDARD` | **Transfer to a New Quranic Example** | Use Al-Inshiqaq 84:1 (**إِذَا السَّمَاءُ انْشَقَّتْ**) as a candidate fresh example, subject to Arabic/Quran review. Learners retrieve the known function, identify the introduced clause, and interpret it in context. This verse is a transfer example; do not claim it alone contains an explicit response clause. Keep the full An-Nasr reading for Chapter 33. |
| 5 — `ch32-l05` | `REVIEW` | **إِذَا: Retrieval and Clause-to-Response Practice** | Retrieve the Chapter 19 examples, contrast **مَتَى** and **إِذَا**, identify an event and an expressed response, distinguish **فَ** from an imperative verb, and transfer to the new Quranic example. Give corrective feedback. No new grammar. |

If the database already contains Studio edits not represented by the fixtures, preserve them and reconcile this proposal with the database version before changing any lesson. Do not overwrite newer Studio work with fixture content.

## Assessment and content-quality criteria

The review can use approximately 8–10 varied items, adjusted to the supported lesson format:

- 2: recognize **إِذَا** and distinguish it from **مَتَى**;
- 2: identify the introduced event and a clearly expressed response/result;
- 2: interpret a perfect-form verb in context without treating morphology as a literal tense translation;
- 1: identify the role of **فَ** versus the imperative verb in a reviewed phrase;
- 1–3: read or hear a short example and select its contextual meaning.

Use the existing canonical schema, exercise types, scoring behavior, and fixture conventions. Provide correction feedback for deliberately false statements; vary answer positions; avoid duplicate drills that only reward recognition of the same translation.

Before approval, a qualified Arabic/Quran-content reviewer should verify every vocalized example, iʿrāb claim, translation, and cross-verse explanation. An Urdu editor should verify the Urdu strings against the Arabic and English. The lesson should remain a language-comprehension activity, not a theological interpretation or a claim that the learner now understands all of An-Nasr.

## Quranic and grammar references

- Chapter 19's Lesson 6 review includes Al-Falaq 113:3 and 113:5, with answer feedback glossing **إِذَا وَقَبَ** as “when it settles” and **إِذَا حَسَدَ** as “when he envies.” This confirms prior exposure, not a dedicated grammar lesson. [QAC, Al-Falaq 113:3](https://corpus.quran.com/translation.jsp?chapter=113&verse=3), [QAC, Al-Falaq 113:5](https://corpus.quran.com/translation.jsp?chapter=113&verse=5)
- Al-Inshiqaq 84:1 offers a possible *new transfer example*: the corpus analyzes **إِذَا** as a time adverb, **السَّمَاءُ** as nominative, and **انْشَقَّتْ** as a perfect verb. Use it to identify the clause; do not claim this single ayah displays an explicit response. [QAC, Al-Inshiqaq 84:1](https://corpus.quran.com/treebank.jsp?chapter=84&verse=1)
- The Quranic Arabic Corpus analyzes **إِذَا** in An-Nasr 110:1 as a time adverb and **جَاءَ** as a perfect verb; its translations render the clause as “When … comes/has come.” This is useful for auditing the current material, but Chapter 32 should not repeat it as its reading capstone because Chapter 33 already teaches the full surah. [QAC, An-Nasr 110:1](https://corpus.quran.com/translation.jsp?chapter=110&verse=1)
- In 110:2, the corpus identifies **فِي** as a preposition and **دِينِ** as genitive; the following **اللَّهِ** is genitive as the second term of the iḍāfa. [QAC, An-Nasr 110:2 syntax](https://corpus.quran.com/treebank.jsp?chapter=110&token=2&verse=2)
- In 110:3, the corpus identifies the **فَ** prefixed to **سَبِّحْ** as a result particle and **سَبِّحْ** as an imperative verb. [QAC, An-Nasr 110:3 syntax](https://corpus.quran.com/treebank.jsp?chapter=110&verse=3)
- The Cairo Arabic Language Academy defines **لَيْسَ** as a defective verb that raises its noun and assigns accusative to its predicate. [Cairo Arabic Language Academy, لَيْسَ](https://www.arabicacademy.gov.eg/ar/%D9%85%D8%AD%D8%B1%D9%83-%D8%A7%D9%84%D8%A8%D8%AD%D8%AB/%D9%84%Dَ%D9%8A%D8%B3%D9%8E)

These references help validate the concrete audit findings; they are not a substitute for scholarly content review.

## Implementation checklist

1. The latest `content:check` attempt could not complete because the database connection terminated. Do not infer parity from the fixtures alone. Retry `content:check` before any future publication; if Studio edits create a divergence, inspect the database-authoritative Chapter 32 content before reconciling fixtures.
2. Compare Chapter 32 map, fixtures, and seed order. Update the map title, description, hook (candidate **Al-Inshiqaq 84:1**), examples, parser tokens, focuses, and source metadata together. Preserve Chapter 33's existing An-Nasr reading rather than duplicating it.
3. Correct/rewrite the existing four lessons under the sequence above; add the targeted review only after checking Chapter 32's current database row order and `REVIEW` fixture conventions.
4. Keep learner-facing Arabic, `ar_plain`, transliteration, English, and Urdu synchronized. Remove corrupt strings and inaccurate morphology.
5. Have Arabic/Quran and Urdu reviewers sign off before publishing.
6. Validate the final fixtures with `npm run db:validate-fixtures` from `warsh-backend`, and use the approved content workflow only after `content:check` is clean. Do not use the production seed for curriculum publication.
7. Plan for the normal learner “Updated” notice behavior when editing lessons already completed by learners.

## Acceptance criteria

- Chapter 32's map and every lesson consistently teach applied **إِذَا** clause structure rather than presenting a second general sentence-grammar bridge.
- Chapter 19's two **إِذَا** examples are used as retrieval, without treating brief prior exposure as established mastery; clause-to-response analysis and transfer are clearly the new Chapter 32 learning.
- No false **لَيْسَ** rule, incorrect **إِذَا**/preposition label, false **فَ** analysis, iḍāfa-role error, corrupt strings, or “future in the past” explanation remains.
- Quran quotations, references, translations, and grammar explanations have qualified review.
- The chapter makes a clear progression from Chapters 19 and 31, applies prior reading skills, and leaves the existing full An-Nasr reading and Book 3 capstone intact in Chapter 33.
- The review checks the stated outcomes, corrects misconceptions, and introduces no new grammar.
- Fixture/database parity is confirmed before any publication, and the canonical validator passes after approved edits.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–4 | `ch32-l01`–`ch32-l04` | `STANDARD` | `chapter-32-lesson-01.json`–`-04.json` |
| 5 | `ch32-l05` (new) | `REVIEW` | `chapter-32-lesson-05-review.json` |
| 6 | `ch32-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-32-lesson-06-final-test.json` |

**Corrections**

1. **Add the chapter test.** The proposal said not to "force a generic chapter test", but Chapters 1–25 and every other proposal in 26–68 end in one, and the product spec makes the test what completes a chapter; without it Chapter 32 would be the only chapter completed by lessons alone. Use 12 questions built from the "Assessment and content-quality criteria" list.
2. **Lessons 2–3 need an example whose response is written out** — 84:1 has none. Use **فَإِذَا فَرَغْتَ فَانْصَبْ** (Ash-Sharh 94:7): **إِذَا** + event + **فَ** + response. Gloss the imperative as "then strive"; imperative formation is Chapter 51. Chapter 53 later reads 94:5–8 as retrieval.
3. **إِنَّ** was introduced in Chapter 24 and **لَيْسَ** in Chapter 25, not Chapter 29.
4. **جَوَابُ الشَّرْط** may be named as a label; do not introduce **إِنْ** or jussive conditionals (Chapter 68).
