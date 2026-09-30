# Chapter 65 — كان وأخواتها: Content Proposal

**Status:** Proposal only; not approved or implemented  
**Scope:** Chapter 65 map and learner-facing fixtures; coordinate its handoff from Chapter 64 and its Book 7 close  
**Current sources:** `warsh-backend/prisma/curriculum-books7-8.cjs` and `warsh-backend/prisma/fixtures/chapter-65-lesson-01.json` through `chapter-65-lesson-06.json`

## Recommendation

Rebuild the unit around one accurate, repeated contrast: for **كَانَ الناقصة** and its sisters, the **اسم** is nominative and the **خبر** is accusative; for **إِنَّ** and its sisters, the **اسم** is accusative and the **خبر** is nominative. The current map states the correct **كان** rule, but multiple fixtures reverse it and reinforce the reversal in explanations, true/false items, summaries, and the end-of-book review. This is the chapter's release-blocking content issue.

Use Chapter 64 only as the prerequisite review of ordinary nominal sentences; do not reteach its premature **كان** lesson there. Build a scoped Chapter 65 sequence that moves from the core case pattern to a reviewed set of sisters, then to form/context and integrated Quran reading. Keep **إضافة** and **إِنَّ** as previously taught material for comparison and retrieval, not as a competing second unit. Preserve the existing Book 7 formative review if useful, but add a distinct Chapter 65 `CHAPTER_TEST` in line with the product contract.

The Quranic Arabic Corpus states that **اسم كان** is nominative and **خبر كان** accusative; when the predicate is a full sentence, it occupies the accusative position even though its internal words are not individually all accusative. [QAC: the verb kāna and its sisters](https://corpus.quran.com/documentation/verbkaana.jsp)

## Audit findings

| Severity | Finding | Proposed correction |
|---|---|---|
| Critical | **The central case rule is reversed throughout the fixtures.** Lesson 1 says **خبر كان** is “nominative after كان” and marks “Both اسم كان and خبر كان are nominative” true. Lesson 2 says every sister keeps both **اسم** and **خبر** nominative, and repeats that in its close. Lesson 4's checklist and exercise do the same. Lesson 5 explicitly contrasts **كان = رفع + رفع** with **إنّ = نصب + رفع**; Lesson 6 repeats **رفع + رفع** for the **كان** family. These errors contradict both the Chapter 65 map and the canonical rule. | Correct every occurrence, including cards, exercises, explanations, parse keys, close messages, review and map: **اسم كان مرفوع، خبر كان منصوب**; **اسم إنّ منصوب، خبر إنّ مرفوع**. If **خبر كان** is a sentence or phrase, explain its syntactic position as **في محل نصب**, rather than falsely assigning an accusative ending to every word within it. Recheck every answer key and distractor after the correction. [QAC: kāna and its sisters](https://corpus.quran.com/documentation/verbkaana.jsp) |
| Critical | **A Quran citation is wrong.** Lesson 3 labels **كُنْ فَيَكُونُ** as coming “From Ta-Ha 20:29.” The Quranic Arabic Corpus shows 20:29 is Moses' request **وَاجْعَل لِّي وَزِيرًا مِّنْ أَهْلِي** (“appoint for me a minister from my family”), not **كُنْ فَيَكُونُ**. The phrase occurs, for example, in 36:82. | Correct the verse reference or remove it. More importantly, don't use 36:82 to claim every form of **كان** is ناقص: the corpus parses **كُنْ** there as **فعل أمر تام** (a complete verb) in that construction. Teach the form with that distinction, or keep the chapter limited to verified **كان الناقصة** uses. [QAC, Taha 20:29](https://corpus.quran.com/wordbyword.jsp?chapter=20&verse=29), [QAC, Ya-Sin 36:82](https://corpus.quran.com/grammar.jsp?chapter=36&verse=82) |
| Critical | **The materials equate every use/form of كان with the incomplete-verb construction.** Lessons say **كان** “cannot stand alone,” calls **كان، يكون، كن** all ناقص, and the review treats **كان زيدٌ** as necessarily incomplete. Arabic distinguishes ناقص and تام uses; the Quranic example **كُنْ** in 36:82 is parsed as complete. The current wording turns a useful chapter focus into a universal lexical rule. | Name the target explicitly as **كان الناقصة** and teach that the same verb can have other constructions/meanings. Keep **كان التامة** and forms such as imperative **كُنْ** out of scored learning outcomes unless they are taught with enough context to distinguish their syntax. Avoid teaching an unfinished fragment such as **كان الطالب...** as proof that the verb itself can never be complete. |
| High | **Sister lists and lesson scope are inconsistent.** Lesson 2 calls its set “six verbs,” its cards introduce only a subset, and its close counts seven incomplete verbs including **كان**. Lesson 4 calls six verbs “all six sisters” but presents another partial list; traditional references include additional verbs and their membership/usage is broader than this lesson's fixed list. | Define the unit's curated set explicitly—for example, “the six sisters practiced in this chapter”—and label it a selected set, not the complete universal list. Make the map, titles, cards, examples, review, and test use the same selection. Verify each verb's meaning and whether its example is a **كان**-type ناقص construction. |
| High | **Lesson 5's “incomplete iḍāfa” scope duplicates earlier material and contradicts the preceding error.** The lesson pairs **كان** with **إِنَّ وأخواتها**, gives a short iḍāfa example, and uses **إِنَّ** items that were already taught in Chapters 29 and 32. Its “opposite” comparison is currently wrong because it first taught the **كان** cases incorrectly. | Keep one brief contrast table with the corrected case changes, using **إِنَّ** as retrieval from earlier chapters. Let **كِتَابُ اللَّهِ**-type constructs function only as a previously learned **اسم كان** constituent after Chapter 63; don't reteach iḍāfa here. Make the new instructional weight fall on identifying and parsing **كان** correctly. |
| High | **Some Quran hooks are decorative rather than instructional.** Lesson 1 opens with Al-Baqarah 2:30, which does not contain **كان**; Lesson 2's Aal-Imran 3:26 hook does not show the listed sisters; Lesson 4's Al-Kahf 18:32 hook contains no **كان** sister although the lesson presents authored examples; and Lesson 6's Al-Hashr 59:22 hook does not display the two “incomplete families” being reviewed. Lesson 5's An-Nisa 4:1 excerpt stops before the verse's later **إِنَّ اللَّهَ كَانَ...** phrase. | Choose a Quran excerpt that contains the target and show the exact portion being taught. If an ayah is only contextual, say so; do not imply it demonstrates a form it does not contain. For the Book 7 review, use a short, verified set of actual examples, with full references and accurate parses. |
| High | **The map's main Quran example invites a theological gloss as grammar.** It says **كَانَ اللَّهُ** is “grammatically past, theologically eternal” and translates the construction “has always been.” Grammar should not be presented as proving the theological reading. In Al-Nisa 4:17, the Quranic Arabic Corpus analyzes **كَانَ** as “is,” **اللَّهُ** as nominative, **عَلِيمًا** as accusative, and **حَكِيمًا** as an accusative adjective—not as a second predicate. | Separate grammar, translation choice, and tafsīr. Teach the observable case/role pattern; present any context-sensitive English rendering or religious reflection with an appropriate source and review, not as a consequence of the past-tense label. Use the corpus's analysis where this verse is chosen. [QAC, An-Nisa 4:17](https://corpus.quran.com/wordbyword.jsp?chapter=4&verse=17) |
| High | **Some examples need Arabic and meaning review.** Lesson 4's checklist says the **خبر** is always nominative; its example **أَصْبَحَتِ الْجَنَّةُ مُزْرَعًا** (“the garden became farmland”) is unusual and requires lexical/naturalness review. Some exercises use translations such as **كَانَ اللَّهُ غَفُورًا** without clear context. The map mixes parsing roles and semantic claims. | Have an Arabic reviewer check case endings, verb agreement, the exact role of each word, collocations, and transliteration. Replace awkward examples with natural authored sentences; give Quranic translations in context and identify which part is literal grammar versus translation choice. |
| High | **There is a formative end-of-book review but no chapter-final test.** Lesson 6 is a `REVIEW` titled “End-of-Book 7 Review,” but none of the six fixtures has an `assessment` payload. Product specification requires a separate final `REVIEW` lesson with `CHAPTER_TEST`, which controls chapter completion. A book-level formative review is not that test. | Retain Lesson 6 as an integrated low-stakes Book 7 review if desired, after repairing its case rules. Add a distinct final `REVIEW` with the canonical `CHAPTER_TEST` payload and `chapter_order: 65`, assessing only the corrected Chapter 65 outcomes. |
| Medium | **The chapter begins at the wrong instructional point and overloads the book close.** It mixes incomplete verbs, selected sister meanings, verb forms (past/imperfect/imperative), Quran phrase search, iḍāfa, the **إِنَّ** family, and a combined review. Chapter 64 is proposed to end with a nominal/verbal capstone and Chapter 63 establishes iḍāfa; repeating these as new topics makes the final chapter feel like a new bundle instead of an organized culmination. | Use the sequence below: prerequisite retrieval; accurate core pattern; a curated sisters set; form/context and Quran reading; a final integration that retrieves **إِنَّ** and iḍāfa without reteaching them; review and test. Add time only to support observed learner difficulty, not to preserve every current topic. |

## Continuity and placement

1. **Chapter 64 → Chapter 65:** Chapter 64 should consolidate ordinary nominal/verbal sentence analysis and predicate types. Chapter 65 then shows how **كان الناقصة** operates on a nominal structure. Remove Chapter 64's current dedicated **كان** lesson and untaught **كان** review items when those chapters are implemented together.
2. **Chapters 29 and 32:** **إِنَّ** and basic sentence parsing have already been taught. Chapter 65 may compare the two families to support recall, but the **إِنَّ** family should not become a second new unit here.
3. **Chapter 63:** Iḍāfa is the preceding unit. Use a construct phrase as a constituent inside **اسم كان** only after the iḍāfa lesson is repaired and approved; do not re-explain its head/dependent rules.
4. **Book 7 → Chapter 66:** Chapter 65 is the Book 7 close; preserve the distinction between a formative cumulative review and the required chapter test. Do not use the chapter-test slot to introduce Book 8's adverb (**ظرف**) material.

## Proposed lesson sequence

Recommend five instructional lessons, one formative review, and one distinct final test. The current six lessons are not “too few”; the need is to give the core case contrast its own clear progression, remove duplicate **إِنَّ**/**إضافة** instruction, and separate review from assessment.

1. **كَانَ الناقصة: what changes in a nominal sentence?** (`STANDARD`, rebuild). Retrieve a simple nominal sentence and show how **كان** changes the roles: **اسم كان مرفوع، خبر كان منصوب**. Use a fully vocalized, natural example and a sentence context; distinguish the target **كان الناقصة** from a brief note that **كان** also has other uses.
2. **Find the اسم and خبر—including phrases and clauses** (`STANDARD`, rebuild). Practice identifying an explicit or pronoun **اسم كان** and a nominal khabar, prepositional khabar, or clause khabar. Teach that a phrase/clause occupies **محل نصب** even though its internal words do not all take accusative endings. Include exceptions such as **ليس ... بِـ** only as a labeled extension, not as the first model.
3. **A selected set of أخوات كان** (`STANDARD`, rebuild). Teach the approved sister verbs (such as **أَصْبَحَ، أَمْسَى، صَارَ، أَضْحَى، بَاتَ، ظَلَّ، لَيْسَ**) with reviewed meanings, agreement, and the same case behavior. Use examples that distinguish lexical meaning from grammatical function; label the set as selected if it is not exhaustive.
4. **Forms of كان in context: recognize before you parse** (`STANDARD`, rebuild). Review **كان / يكون** only to the degree learners need for Quranic reading. Explicitly distinguish an incomplete use from a complete use; do not say every imperative **كُنْ** is ناقص. Correct the false Taha 20:29 citation; if using **كُنْ فَيَكُونُ**, cite 36:82 and treat it according to the reviewed analysis rather than as a default **اسم + خبر** example.
5. **Quranic reading and the case contrast** (`STANDARD`, rebuild). Read short, verified Quranic examples containing **كان** or a selected sister, identify only the grammar taught, and compare once with a previously learned **إِنَّ** example (اسم إنّ منصوب / خبر إنّ مرفوع). Include one iḍāfa head inside **اسم كان** only as retrieval. Keep translation and religious interpretation distinct from parsing.
6. **R14 — Book 7 formative review** (`REVIEW`, rebuild). Integrate **كان** and selected sisters with **إِنَّ**/iḍāfa as prior knowledge. Correct every role and case; include explanatory feedback and no claims that case markings mean both parts are nominative.
7. **Chapter 65 final assessment** (`REVIEW`, add). Add a separate canonical `CHAPTER_TEST` with `chapter_order: 65`. Assess role identification, correct case behavior, a selected sister, and an in-context Quran reading item. Use explicit contexts for any parse with phrase/clause predicates and don't grade theological interpretation as grammar.

## Assessment and acceptance criteria

Before authoring the test, record each item's learning outcome, lesson source, exact Arabic context, accepted answer(s), case/position rationale, distractor rationale, and point value. Have a qualified Arabic reviewer inspect every case label and inflection, the selected sister list, the distinction between **كان الناقصة** and **كان التامة**, the forms used in Quranic examples, and the sentence/phrase khabar treatment. Independently verify every Quran quotation and reference. Review English and Urdu translations separately; specifically scan for reversed nominative/accusative labels and mixed-script corruption.

Chapter 65 is ready to implement only when:

- every learner-facing occurrence and answer key correctly distinguishes **كان: رفع + نصب** from **إنّ: نصب + رفع**;
- phrase/clause predicates are explained by grammatical position, not assigned false visible case endings;
- complete and incomplete uses are distinguished rather than treating every form/use of **كان** as ناقص;
- the false **Ta-Ha 20:29** citation is corrected and all other references verified;
- grammar explanations make no unsupported theological claims;
- selected sister verbs, meanings, examples, and counts are consistent across map and fixtures;
- Chapters 63–65 have distinct, non-duplicative scopes;
- the Book 7 formative review and separate canonical Chapter 65 `CHAPTER_TEST` both exist; and
- Arabic, case endings, transliteration, English, Urdu, audio, answer keys, and feedback receive qualified review.

After approval and implementation, run lesson-schema validation, Quran-text/reference audits, Urdu audit, and assessment/backend completion tests. Check `npm run content:check` before any fixture sync. This proposal authorizes no fixture edits, database writes, content synchronization, or publication.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–5 | `ch65-l01`–`ch65-l05` | `STANDARD` | `chapter-65-lesson-01.json`–`-05.json` |
| 6 | `ch65-l06` | `REVIEW` | `chapter-65-lesson-06-review.json` |
| 7 | `ch65-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-65-lesson-07-final-test.json` |

**Corrections**

1. **Prerequisites are Chapter 25 (لَيْسَ) and Chapter 57 Lesson 4 (كَانَ with its case effect)**, not Chapter 64. Lesson 1 retrieves **كَانَ** from Chapter 57 in one card and moves straight to Lesson 2; the chapter's new weight is the sisters and phrase/clause predicates.
2. **لَيْسَ** in Lesson 3's set is retrieval from Chapter 25.
3. **Fix the Book 7 close:** the current Lesson 6 close promises that Book 8 begins with **اسم الآلة**. Chapter 66 is adverbs, and instrument nouns are taught in Chapter 61 (D4). The close previews **ظرف** (Chapter 66) instead.
4. Verified: 4:17 ends **وَكَانَ اللَّهُ عَلِيمًا حَكِيمًا**; 36:82 **كُن فَيَكُونُ**.
5. Test: 12 questions at 80 % (S1).
