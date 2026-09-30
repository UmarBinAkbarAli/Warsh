# Chapter 34 — Present-Imperfect Verbs: Core Forms and Meaning

**Status:** Proposal only — not approved or implemented
**Evidence reviewed:** Chapter 34 curriculum map and all seven registered lesson fixtures; nearby Chapters 33 and 35; seed/schema conventions; source-file references; and an attempted read-only `content:check` on 2026-09-30. The command did not complete because the Prisma/PostgreSQL connection terminated unexpectedly, so fixture/database parity is unverified. No database changes were made.
**Scope:** Chapter 34 lesson content, map alignment, practice, and handoff to Chapter 35. No fixture, seed, or database changes are included.

## Recommendation

Keep Chapter 34 focused on recognizing and using common **الفعل المضارع** forms in context. Rebuild the seven slots as five focused teaching lessons, a separate retrieval review, and a separate chapter test: meaning and context; core forms; agreement clues and transfer to familiar regular verbs; present-tense negation; then objects/time expressions. Repurpose the two repeated Al-Fatiha capstones as the review and test. Be precise that the imperfect is not restricted to “right now,” that prefixes work with endings and context, and that this chapter teaches selected common forms rather than a complete conjugation system.

The existing seven slots provide enough time if the repeated Al-Fatiha “mastery” content is replaced by purposeful practice, review, and a distinct checkpoint. Keep five teaching lessons, then use one slot for review and one for the chapter test; do not combine the two assessments into a single lesson or add lecture merely to increase lesson count. Reserve future marking with **سَـ / سَوْفَ** for Chapter 35.

## Current-state audit

The map calls Chapter 34 “المضارع: The Present Tense,” describes a four-prefix system, and hooks Al-Fatiha 1:5. Its four focus records do not cover all seven lessons. The seven fixtures range across an introduction, a purported “full” conjugation table, other verbs, negation, objects/adverbs, and **two** Al-Fatiha capstones. Several lessons repeat Al-Fatiha 1:5, although the preceding Chapter 33 already uses it. Chapter 35 follows with future markers.

The map cites `reader_lecture_34_present_tense_mudari.md` and the fixtures cite `book4_lesson1_present_tense.md`; neither file exists at the referenced `warsh-backend/prisma/` path. Treat this as a source-metadata/documentation gap. The failed parity check does not establish either drift or synchronization.

### Issues and fixes

| Priority | Issue | Proposed fix |
|---|---|---|
| Critical | **Lesson 7 misattributes a quotation.** It presents “when you have finished — turn to your Lord in hope” as Al-Fatiha 1:6. That wording belongs to Ash-Sharh 94:7–8; Al-Fatiha 1:6 is **اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ**. | Remove the misattribution. If the Ash-Sharh quotation is retained, cite 94:7–8 accurately and ensure it serves the lesson objective; otherwise keep the example within Al-Fatiha and identify its verse correctly. Have a qualified Quran-content reviewer verify every quotation and reference. |
| Critical | **The same wrong root for نَسْتَعِينُ recurs.** Lessons 1 and 7 give **س-ع-ن**; the word is from **ع-و-ن**, Form X. | Correct it wherever retained, and run a chapter-wide morphology/reference audit rather than fixing only one card. The Quranic Arabic Corpus lists the word under root ع-و-ن. |
| Critical | **The “full” conjugation system is not full, and its labels contradict one another.** Lesson 2's six-row table covers only selected pronouns; one plural form appears in an exercise but dual and several plural forms are not systematically taught. The grammar-note title says “six forms,” while its Arabic heading literally says “four and three,” and the lesson claims six forms unlock every present-tense verb. | Rename it as a selected core-form table. Repair the malformed Arabic heading and distinguish four common prefix letters from the six sample pronoun/form rows. Limit examples to the selected regular Form I pattern; explain that agreement may also involve endings and context. Do not claim completeness or universal coverage. |
| High | **The imperfect is presented as a present-only tense.** Lesson 1 equates it with actions happening now or habitually, which can mislead learners before Chapter 35. | Introduce **imperfect (المضارع)** as a form whose interpretation depends on context; demonstrate common present/habitual readings in this chapter. State that future markers are a later lesson and that “present” is a learner-friendly shorthand, not the entire meaning of the form. |
| High | **The prefix-only mnemonic hides agreement ambiguity.** **تَفْعَلُ** can mean “you (masculine singular) do” or “she does”; context/pronouns help identify the subject. Prefix alone is not the complete person/number/gender system. | Teach the ambiguity with two contrasting, contextualized sentences. Present **أَ / نَ / يَ / تَ** as useful clues, not a complete pronoun decoder; add the relevant ending where the lesson scope requires it. |
| High | **Lesson 3 overgeneralizes that four prefixes attach to “ANY” Arabic root and never change.** It also distracts with a past form (**خَلَقَكُمْ**) and a command (**اعْبُدُوا**) in a lesson ostensibly about present forms. | Use a small, controlled set of common sound Form I verbs and compare their imperfect forms. Identify past/imperative forms only as brief retrieval contrasts if needed; never label them as present examples or imply one pattern covers every verb/form. |
| High | **Negation lesson conflates distinct uses of لَا and repeats a Quranic example as if it were new.** The formula “لَا + present = negation” is too broad; **لَا النافية** negates, while prohibitive **لَا الناهية** expresses “do not” and is followed by a jussive imperfect. Chapter 33 already reads **لَا أَعْبُدُ مَا تَعْبُدُونَ** as a negated imperfect clause; Chapter 17 has earlier exposure to **لَا** with a past form. | Teach ordinary imperfect negation with fresh, neutral constructed examples; say explicitly that this is a grammatical extension of prior recognition, not the first encounter with **لَا**. Reuse a Quranic phrase only as labeled retrieval and quote it exactly. Add a brief recognition contrast with prohibition, without claiming learners have mastered jussive morphology. Avoid one blanket equation. |
| High | **The Al-Kafirun-linked example is misleading and needlessly sensitive.** **لَا نَعْبُدُ الْكُفَّارَ** is described as mirroring **لَا أَعْبُدُ مَا تَعْبُدُونَ** (109:2), but it changes the subject and object and is not an equivalent paraphrase. | Replace it with a neutral constructed example within the vocabulary scope (for example, a reviewed “I do not read the book” sentence), clearly marked as constructed. Keep Quranic quotation exact and do not use a verse as a loose paraphrase. |
| High | **The objects/adverbs lesson uses an imperative as if it supported the present-tense chapter.** Its Al-Fatiha 1:6 hook is **اهْدِنَا**, a command, yet the lesson claims it completes Al-Fatiha and demonstrates present-tense objects/adverbs. | Teach objects and time expressions with actual imperfect examples. If **اهْدِنَا** appears, label it as an imperative retrieval/contrast and do not count it as a present-tense example. Narrow the outcome to the structures actually taught. |
| High | **Lesson 5’s attached-pronoun examples do not provide coherent subject–object practice.** It groups **يَرَانِي، تَرَانِي، نَرَانِي** under a generic “person + action + object” pattern and glosses the last as “we see me,” which is confusing and does not give a natural contrast for learners. | Replace with reviewed examples whose subject and object are clear and pedagogically coherent (for example, **يَرَانِي** “he sees me” beside **نَرَاكَ** “we see you”), label the attached object pronoun, and avoid implying any suffix can be freely combined with any subject form. Have the vocalized forms reviewed, especially for the weak verb **رَأَى**. |
| Medium | **Lesson 5 has inconsistent Arabic article vocalization in teaching examples.** Strings such as **الْطَّالِبَ، الْدَّرْسَ، الْصِّرَاطَ** put a sukūn on **ل** before a sun letter, unlike the correctly assimilated learner-facing forms **الطَّالِبَ، الدَّرْسَ، الصِّرَاطَ**. | Correct Arabic and `ar_plain` across the lesson, then compare transliteration and translations field by field. Include sun-letter assimilation in the reviewer checklist without turning it into an unrelated new lesson objective. |
| High | **The two Al-Fatiha “mastery” lessons duplicate the hook and overclaim.** The chapter repeats 1:5 across multiple lessons, including one titled mastery, and claims complete or exhaustive understanding of Al-Fatiha after a narrow grammar sequence. The preceding Chapter 33 also uses 1:5. | Remove the duplicate mastery capstones. Reuse **نَعْبُدُ** once as deliberate retrieval/transfer from Chapter 33, explain the connection, and use other reviewed examples for new practice. Do not claim the chapter teaches or masters all of Al-Fatiha. |
| High | **Lesson 6 makes inaccurate scope and chapter-completion claims.** It calls itself a capstone although it is Chapter 34's opening chapter in Book 4, says it covers Al-Fatiha ayah by ayah, makes an unqualified claim that the basmala opens every surah, and mislocates **رَبِّ الْعَالَمِينَ** in its ayah map. | Remove “Book 4 capstone,” “ayah by ayah,” and premature “completed Book 4” language. Correct the verse mapping with a Quran reviewer. If discussing the basmala, qualify its placement accurately (At-Tawbah is not preceded by it) and include that fact only if relevant to the learning aim. |
| Critical | **Lesson 6’s fill-in exercise corrupts the Al-Fatiha 1:6 ending.** It marks **مُسْتَقِيمِ** (genitive-looking kasra) as the correct completion of **اهْدِنَا الصِّرَاطَ الْ___**, but the verse has **الْمُسْتَقِيمَ** with fatḥa, agreeing in accusative case with **الصِّرَاطَ**. | Correct the exercise’s Arabic, transliteration, answer key, and feedback to **الْمُسْتَقِيمَ**; review the entire exercise against the canonical verse and check that distractors do not teach incorrect case endings. |
| High | **Lesson 7 alters the Quranic text without labeling it.** Its fill-in sentence adds **إِنَّا** before **إِيَّاكَ**, and a translation/build task does not faithfully translate Al-Fatiha 1:5. | Use the exact Quranic wording for Quran exercises, with a precise verse reference and faithful, reviewed translation. If a constructed variation is pedagogically necessary, label it clearly as constructed and do not place it in quotation styling or attribute it to the Quran. |
| Medium | **The practice is mechanically predictable.** Every `TAP_TRANSLATION` correct answer is at index 0 across the seven fixtures, and lessons reuse a near-identical seven-exercise sequence. | Vary exercise types and correct-answer positions. Keep distractors plausible and feedback instructional; avoid making position a shortcut to the answer. |
| Medium | **Map, fixtures, and source metadata do not represent the actual progression.** The map has four focus items for seven lessons, while the fixtures include negation, objects/adverbs, and duplicate capstones. The cited lecture/source files are absent. | Align map title/description/hook/focus records with the approved sequence and actual exercises. Replace the missing source reference with an existing, approved source or remove the stale reference; do not invent a source path. |

## Proposed lesson sequence

Retain the seven lesson slots and stable existing IDs where possible; rewrite content and template assignments only after approval. Use the first five slots for instruction, convert the former Al-Fatiha capstone (`ch34-l06`) into the review, and convert the repeated Al-Fatiha lesson (`ch34-l07`) into a separate final checkpoint. Do not merge review practice and test scoring in one fixture.

| Order | Template | Proposed lesson | Scope and design |
|---|---|---|---|
| 1 | `STANDARD` | **What Does the Imperfect Verb Tell Us?** | Introduce **المضارع** through a few contextualized present/habitual examples. Explain that the form is not limited to “right now”; defer the future-marker lesson to Chapter 35. Use Al-Fatiha 1:5 only as a short, labeled retrieval bridge from Chapter 33. |
| 2 | `VERB_PATTERN` | **Core Forms: أَفْعَلُ، نَفْعَلُ، يَفْعَلُ، تَفْعَلُ** | Teach a carefully bounded set of common core forms using one regular Form I model. Distinguish the number of prefix patterns from the number of example forms. Show that **تَفْعَلُ** is ambiguous without context and that this is not a full paradigm. |
| 3 | `STANDARD` | **Who Is Doing It? Core Agreement and Transfer** | Apply the core pattern to familiar regular Form I verbs. Contrast pronoun, prefix, and context; show that **تَفْعَلُ** can be “she does” or “you (m.) do.” Treat additional agreement endings at recognition level only and defer fuller feminine forms to Chapter 37. Remove unrelated past/command examples or label them as brief retrieval; avoid “any root” claims. |
| 4 | `STANDARD` | **Negating an Imperfect Verb with لَا** | Build on Chapter 17's past-form recognition and Chapter 33's reading of **لَا أَعْبُدُ**. Use neutral constructed examples to teach ordinary imperfect negation as a rule; keep any Quranic phrase explicitly labeled as retrieval, not a new target. Include a concise recognition contrast with prohibitive **لَا الناهية**; defer full jussive morphology if it is not yet in scope. |
| 5 | `STANDARD` | **Add an Object and a Time Expression** | Practice a subject + imperfect verb + object/time expression in short sentences. Use actual imperfect examples; identify any imperative cited from Al-Fatiha as retrieval, not the target form. Replace confusing combinations such as **نَرَانِي** and proofread Arabic article spelling and case endings. Avoid a full-surah comprehension claim. |
| 6 — `ch34-l06` | `REVIEW` | **Present-Imperfect Retrieval Review** | Reuse earlier Al-Fatiha material only as labeled retrieval, then review meaning, selected core forms, agreement/context, ordinary negation, and object/time expressions. No new rules, “mastery” claims, or chapter-test payload. |
| 7 — `ch34-l07` | `REVIEW` with top-level `assessment.type = CHAPTER_TEST` | **Chapter 34 Checkpoint** | Use the schema-supported assessment payload and current seed conventions. Assess only taught outcomes with explanatory feedback. Do not test future markers, a complete paradigm, or tafsir. Keep this distinct from the review. |

## Assessment blueprint

The review lesson provides unscored retrieval and corrective teaching feedback. A separate 10–12 item checkpoint can cover:

- 2 items identifying imperfect forms in context and distinguishing “now” from habitual meaning where context supports it;
- 2 items on core prefix clues, including the **تَفْعَلُ** ambiguity;
- 2 items transferring the taught pattern to familiar regular Form I verbs;
- 2 items distinguishing ordinary negation from a prohibitive use of **لَا** at recognition level;
- 2 items reading an object and a time expression in a short sentence; and
- 0–2 integrated retrieval items, including **نَعْبُدُ** only if its connection to Chapter 33 is explicitly stated.

Use a balanced mix of exercise types and answer positions. Give feedback that explains the relevant clue or meaning. Do not assess unintroduced future markers, the entire imperfect paradigm, disputed Quranic interpretation, memorization, or “mastery” of a surah.

## Continuity with surrounding chapters

- **Chapter 33 → 34:** Chapter 33 already uses Al-Fatiha 1:5, including **نَعْبُدُ** and **نَسْتَعِينُ**. Chapter 34 should retrieve that familiar example briefly, then develop the imperfect system; it should not teach the same verse repeatedly under multiple capstone titles.
- **Chapter 34 → 35:** Establish that the imperfect is not simply a “right now” form. Chapter 35 can then teach how **سَـ** and **سَوْفَ** mark future reference, without Chapter 34 pre-teaching their full usage or overstating their semantic distinction.
- **Negation spiral:** Chapter 17 presents **وَلَا صَلَّىٰ** as contextual negation of a past form; Chapter 33 reads **لَا أَعْبُدُ** as negated imperfect in Al-Kafirun. Chapter 34 should retrieve these briefly, then add neutral imperfect examples and distinguish ordinary negation from prohibition. Do not reuse the same Quran quotation as new content or expand into a full lesson on past negation.
- **Later Book 4:** Chapter 37 explicitly teaches feminine verb forms, including **تَفْعَلِينَ** and feminine plural patterns. Chapter 34 should point forward to that dedicated expansion rather than attempt to teach it twice. Other later expansion into dual forms, weak verbs, derived forms, mood endings, or broader Quranic parsing should likewise be sequenced explicitly rather than implied by this chapter's “full table” language.

## Arabic and Quran-content review

- The Quranic Arabic Corpus lists **نَسْتَعِينُ** under root **ع-و-ن** (Form X). [QAC, root ع-و-ن](https://corpus.quran.com/qurandictionary.jsp?q=Ewn)
- Al-Fatiha 1:5 contains **نَعْبُدُ** and **نَسْتَعِينُ**; Al-Fatiha 1:6 begins **اهْدِنَا**. Verify the exact wording and verse division before using these as examples. [QAC, Al-Fatiha 1:5](https://corpus.quran.com/treebank.jsp?chapter=1&verse=5), [QAC, Al-Fatiha 1:6](https://corpus.quran.com/grammar.jsp?chapter=1&verse=6)
- In Al-Fatiha 1:6, **الصِّرَاطَ** is accusative; the verse reads **الْمُسْتَقِيمَ**, not **الْمُسْتَقِيمِ**. [QAC, Al-Fatiha 1:6 grammar](https://corpus.quran.com/grammar.jsp?chapter=1&verse=6), [QAC, morphology of الصِّرَاطَ](https://corpus.quran.com/wordmorphology.jsp?location=%281%3A6%3A2%29)
- The quoted “when you have finished…” wording is Ash-Sharh 94:7–8, not Al-Fatiha 1:6. [QAC, Ash-Sharh 94:7](https://corpus.quran.com/translation.jsp?chapter=94&verse=7), [QAC, Ash-Sharh 94:8](https://corpus.quran.com/translation.jsp?chapter=94&verse=8)
- Arabic imperfect verbs can use subject prefixes and suffixes; their English rendering depends on context. Treat the chapter's selected forms as a pedagogical subset. [UC Davis, Arabic Without Walls: Present Tense](https://arabicwithoutwalls.ucdavis.edu/alifbaa_unit2/ab6-7-8_present_tense.html)
- A prohibitive **لَا** is followed by an imperfect in the jussive; it should not be collapsed into the ordinary-negation rule. [QAC, imperative and prohibition](https://corpus.quran.com/documentation/imperative.jsp)

These references verify the specific corrections, but a qualified Arabic and Quran-content reviewer should approve vocalization, morphology, translation, verse attribution, and interpretive wording before publication.

## Implementation checklist after approval

1. Update the Chapter 34 map and all seven lesson fixtures together; align title, objective, hook, focus records, examples, review, and distinct chapter-test payload.
2. Correct or remove inaccurate root/verse claims, the constructed Quran-like wording, exhaustive claims, and the Al-Kafirun paraphrase.
3. Keep stable lesson IDs when feasible. Use a `REVIEW` template with `CHAPTER_TEST` only in the schema-supported form and follow established seed ordering.
4. Review exact Arabic, vocalization, translation, roots, and verse references with qualified reviewers; proofread English and Urdu counterparts.
5. Run `npm run db:validate-fixtures` and `npm run content:check` from `warsh-backend` after approved fixture edits. Do not publish fixtures over Studio edits unless `content:check` passes; do not use the production seed for this content work.
6. Expect that changing published lesson content can trigger learner “Updated” notices under the repository's content-update rules.

## Acceptance criteria

- Chapter 34 teaches a clearly bounded, useful imperfect-verb foundation and never claims its selected table is complete.
- Every verb, root, Quran quotation, verse reference, translation, and grammatical label is correct and reviewed.
- **تَفْعَلُ** ambiguity, context dependence, and the distinction between **لَا النافية** and prohibitive **لَا الناهية** are accurately represented at the stated depth.
- No past or imperative form is presented as an imperfect example; no Quranic text is altered or misattributed.
- Duplicate Al-Fatiha capstones are replaced by purposeful retrieval, a separate review, and a separate assessable checkpoint.
- Chapter 34's map and lesson fixtures agree, and the handoff to Chapter 35's future markers is clear.
- Practice varies in exercise type and answer position, with useful corrective feedback.
- Approved fixtures pass validation and are in parity with the database before publication.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1 | `ch34-l01` | `STANDARD` | `chapter-34-lesson-01.json` |
| 2 | `ch34-l02` | `VERB_PATTERN` | `chapter-34-lesson-02.json` |
| 3–5 | `ch34-l03`–`ch34-l05` | `STANDARD` | `chapter-34-lesson-03.json`–`-05.json` |
| 6 | `ch34-l06` | `REVIEW` | `chapter-34-lesson-06-review.json` |
| 7 | `ch34-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-34-lesson-07-final-test.json` |
| — | `ch34-l07` | set to `DRAFT` (S3) | file removed |

**Corrections**

1. **Do not turn `ch34-l07` into the test** — learners who completed the old Al-Fatiha lesson would count as having passed it (S2). The test is the new `ch34-test`; the old row is unpublished.
2. **Al-Fatiha 1:5 retrieval comes from Chapter 10**, which taught **نَعْبُدُ** as a "we" form. The Chapter 33 proposal removes 1:5 from that chapter, so every "retrieve from Chapter 33" reference here reads "from Chapter 10", and Lesson 4's **لَا أَعْبُدُ** is retrieved from Chapters 29–30.
3. Lesson 4 introduces prohibitive **لَا** only as a one-card recognition contrast; Chapter 45 teaches it.
4. Checkpoint length is 12 (S1).
