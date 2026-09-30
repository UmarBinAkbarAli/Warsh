# Chapter 47 — Sound Masculine Plural: Case and Idafa

**Status:** Proposal only — not approved or implemented  
**Evidence reviewed:** Active product specification and technical specification; current Chapter 13 fixtures and its implemented proposal; Chapter 47 curriculum map in `warsh-backend/prisma/curriculum-books5-6.cjs`; all six Chapter 47 fixtures; canonical lesson schema; Quranic Arabic Corpus checks for At-Tawbah 9:71 and Aal ʿImran 3:28; current fixture-validator, Urdu-audit, and Quran-ayah-audit output.  
**Scope:** Sound masculine plural noun case endings, its construct (iḍāfa) form, noun-versus-verb distinction, Quranic application, bilingual accuracy, review, and assessment. No fixture or database content has been changed.

## Recommendation

Keep Chapter 47 as the full treatment of the sound masculine plural noun (**جمع المذكر السالم**). Chapter 13 now has a distinct, implemented role: it teaches learners to recognize **ـُونَ** and **ـِينَ** as two shapes in this noun family but explicitly defers the reason for the change. Chapter 47 is therefore the right place to teach **رفع** with **ـُونَ**, **نصب / جرّ** with **ـِينَ**, and the loss of **ن** in iḍāfa.

The current Chapter 47 needs substantial correction. It repeatedly treats **جزم** as a case of nouns, confuses noun endings with plural verb forms, and gives a false rule that **ن** drops in نصب and جزم. Preserve the five existing `STANDARD` lesson slots and the existing review slot, but refocus them on the noun. Add one separate final-test `REVIEW` lesson with the canonical `CHAPTER_TEST` assessment. That produces a focused seven-lesson sequence: five teaching lessons, retrieval review, final test.

The essential distinction is:

- A sound masculine plural **noun** is **مرفوع** with **ـُونَ**, and **منصوب** or **مجرور** with **ـِينَ**.
- It is not “مجزوم”: jazm is a state of the imperfect verb, not a case of a noun.
- The **ن** remains in ordinary case forms **مُسْلِمُونَ / مُسْلِمِينَ**. It is omitted when the noun is the first term (**مضاف**) in an iḍāfa. Even then, the case still matters: **مُسْلِمُو الْمَدِينَةِ** (nominative) versus **مُسْلِمِي الْمَدِينَةِ** (accusative/genitive).
- A verb ending in **ـُونَ** or **ـُوا** is not thereby a sound masculine plural noun. **يَعْمَلُونَ** is an imperfect verb (one of the five verbs); **آمَنُوا** is a perfect verb with **واو الجماعة**; **أَطِيعُوا** is a plural imperative. These forms have distinct morphology and are outside the noun-declension outcome.

## Continuity check

Chapter 13’s current lessons and approved proposal teach recognition, not noun case grammar. They deliberately say the learner does not yet need to know why the same sound masculine plural family appears as **ـُونَ** or **ـِينَ**. Chapter 47 should retrieve that recognition briefly, then supply the missing rule—this is deliberate progression, not repetition.

Chapter 14 is responsible for adjective agreement. Chapter 47 may contain a short retrieval example if useful, but should not spend a lesson re-teaching agreement. Chapter 46 concerns imperfect-verb states; its review should not be blended into the Chapter 47 noun review as though a noun could be مجزوم. Chapter 48 moves on to time, numbers, and measurements; do not pull number agreement into this chapter through unrelated examples such as **ثَلَاثٌ**.

## Current-state audit

The map labels Chapter 47 “Sound Masculine Plural — Full Treatment” and correctly signals the progression from Chapter 13. It describes nominative, accusative, and genitive forms, but its examples/parse also contain **يُصَلُّونَ**, an imperfect verb. In the map parse, **يُصَلُّونَ** is treated as if its ending were the same noun-case marker as **الْمُسْلِمُونَ**, **خَمْسَ** is over-simplified, and **مَرَّاتٍ** is labeled as an iḍāfa complement. This invites learners to apply the noun rule to verbs.

The fixtures contain five `STANDARD` lessons and one `REVIEW`; there is no Chapter 47 final-test assessment. Errors are substantial and repeated across lesson cards, exercises, wrong-answer feedback, Quran examples, and the R10 review:

- Lesson 2 calls the topic “منصوب والمجزوم,” says the sound masculine plural is مجزوم, and says **ن** is dropped in نصب and جزم. The correct marker for an ordinary non-construct accusative/genitive form is **ـِينَ**, with **ن** still present; nouns do not take jazm.
- The item **لَنْ يَنْصَرَ الْمُؤْمِنُونَ** is incorrectly vocalized and parsed. Its explanation says both the imperfect and noun become منصوب after **لَنْ**. A governor of the verb does not automatically govern a separate noun; case must be determined by that noun’s syntactic role. Do not use this malformed example.
- Lesson 2’s **لَا تَذْهَبِ الْمُسْلِمُونَ** mismatches the second-person singular verb with a third-person plural subject. Its translation says “The Muslims should not go,” while its explanation calls **لَا** “no longer.” It is unsuitable for assessing this noun lesson and brings in five-verb/jussive content from elsewhere.
- Lessons 1, 4, 5, and the review equate the ending of a sound masculine noun with **ـُونَ** on imperfect verbs. They claim the noun and verb are both in the same “rafʿ case state” or agree in case. For example **الْمُسْلِمُونَ** is a noun; **يَقْرَأُونَ / يَعْبُدُونَ** are verbs whose retained **ن** marks indicative inflection in the five-verb paradigm. They do not share the noun’s case ending.
- **الَّذِينَ آمَنُوا** is repeatedly offered as a sound masculine plural noun example. **الَّذِينَ** is a relative pronoun and **آمَنُوا** a perfect verb with plural subject marking; neither word illustrates the sound masculine plural noun’s case ending. **أَطِيعُوا** is an imperative, not a jussive noun or a sound masculine plural noun.
- **يُحَابُّونَ** is repeatedly called passive and is compared with **يُحِبُّونَ** as though it were its passive form. This is not a valid noun example; remove it from this chapter unless a qualified reviewer verifies the intended form and analysis.
- Lesson 1’s reveal highlights token indices **2** and **3** in the three-token hook **إِنَّهَا عَلَيْهِمْ مُؤْصَدَةٌ**, so index 3 is out of range; its explanation instead refers to **يُحَابُّونَ / الَّذِينَ**, neither of which appears in that hook. The Quran audit passes the hook text/reference, but not this detached reveal explanation/highlight mapping. Replace the hook with a directly relevant, exact example and declare/validate the actual highlighted token.
- Lesson 3 correctly notices that **ن** drops in iḍāfa but presents only the **ـُو** form, which may falsely imply iḍāfa always selects nominative. It also says the second element is simply **هَذِهِ الْأُمَّةِ**, but its example’s case behavior should be explained with care. Teach nun deletion separately from case choice and give at least one **ـِي** construct example.
- Lesson 3’s **كُنْتُمْ خَيْرَ أُمَّةٍ** adds **كان**, predicate analysis, and another iḍāfa unrelated to sound masculine plural. Its explanation calls the construction a nominal sentence and does not handle **خبر كان** consistently. Lesson 5’s **عَلَى قُلُوبِهَا ثَلَاثٌ** adds broken plural, pronouns, **على**, and the number three; the exact phrase is unreferenced and could not be verified as a Quran quotation. Remove both from the target sequence.
- Quran hooks are often unrelated to the lesson target: Al-Humazah 104:8 in Lesson 1 and 104:9 in Lesson 5 do not show a sound masculine plural noun; Muhammad 47:33 in Lesson 4 mainly supplies **الَّذِينَ آمَنُوا** and imperative verbs, not the noun declension being taught. Prefer the mapped At-Tawbah 9:71 hook with its direct **الْمُؤْمِنُونَ** target, or another verified example that actually demonstrates the case at issue.
- The R10 review mixes Chapter 46 imperfect states with Chapter 47 noun forms, repeats false verb-state explanations, uses malformed **فَيْ**, and claims sound masculine plural nouns are مجزوم. Rename/refocus it as Chapter 47 retrieval, with at most a deliberate Chapter 13 recognition item. Do not assess the Chapter 46 verb paradigm here.
- Automated checks currently pass for 452 fixture lessons and Urdu content; the Quran-ayah audit checks 889 declared ayah entries and reports no text/reference mismatches. Those checks do not catch the semantic grammar defects above, arbitrary Arabic in card/exercise text, or the out-of-range legacy reveal index in Chapter 47 Lesson 1; manual review remains necessary.
- The source metadata differs among the map (`reader_lecture_47_sound_masc_plural.md`), fixtures (`book5_lesson3_sound_masculine_plural.md`), and review (`review_r10.md`). Those named source files are not present in the repository. Urdu and Arabic ending labels also need proofreading; for example, Lesson 4 glosses **آمَنُوا** as “انہوں نے ایمان لیا” rather than idiomatic Urdu “وہ ایمان لائے,” and the review segments **ـِينَ** inaccurately as **يَنَ**. Reconcile sources and proofread all locales after approval.

### Issues and proposed fixes

| Priority | Issue | Proposed fix |
|---|---|---|
| Critical | Noun case is conflated with imperfect-verb mood; “jazm” is taught for a noun. | Teach only **رفع / نصب / جرّ** for the noun. Keep Chapter 46’s **رفع / نصب / جزم** for imperfect verbs out of the case chart. |
| Critical | Incorrect **ن** deletion rule. | Teach **ـُونَ → ـِينَ** for the change from rafʿ to naṣb/jarr, with **ن** retained. Teach **حذف النون** only for iḍāfa, independently of case. |
| Critical | Noun and verb plurals with a visible wāw/yāʾ/nūn are treated as one morphology. | Compare one noun (**الْمُؤْمِنُونَ**) with one imperfect (**يُؤْمِنُونَ**) and one perfect (**آمَنُوا**) only to classify their grammatical category; explicitly say only the noun forms are assessed in this chapter. Remove imperative/jussive claims. |
| Critical | The Chapter 47 Quran parsing lessons use verses that do not evidence the stated noun rule. | Use exact, referenced examples that contain an actual sound masculine plural noun in the intended case. The Corpus identifies **الْمُؤْمِنُونَ** in 9:71 as a nominative masculine plural active participle; 3:28 includes **الْمُؤْمِنُونَ**, **الْكَافِرِينَ**, and **الْمُؤْمِنِينَ** in distinct syntactic roles/cases. |
| High | Idafa teaching conflates construct status and case. | Show nun deletion in iḍāfa while keeping the case contrast: **مُسْلِمُو الْمَدِينَةِ** (rafʿ), **رَأَيْتُ مُسْلِمِي الْمَدِينَةِ** (naṣb), **مَرَرْتُ بِمُسْلِمِي الْمَدِينَةِ** (jarr). Explain only what has been taught about the surrounding syntax. |
| High | Lesson 4 expands into sound plurals on verbs, imperatives, adjective agreement, and Quranic interpretation. | Make it a bounded application lab for the noun family. Use verb forms only as contrast labels; keep adjective agreement as Chapter 14 retrieval, and do not promise full Quran/surah mastery. |
| High | R10 review tests two chapters’ material and restates errors. | Preserve the review position but make it a Chapter 47 review, reusing Chapter 13’s recognition as spaced retrieval and assessing only the current noun case/iḍāfa outcomes. |
| High | No distinct Chapter 47 `CHAPTER_TEST` assessment. | Add a canonical final `REVIEW` lesson with a top-level `assessment.type: "CHAPTER_TEST"`; assess only sound masculine plural noun forms and taught cases/iḍāfa. |
| High | Lesson 1’s reveal points to words absent from the hook and includes an out-of-range index. | Replace the mismatched reveal explanation and correct its token indices/declared highlighted word against the approved excerpt. Do not rely on the passing Quran-hook audit to validate non-hook card text. |
| Medium | Hooks, lesson aims, transliteration, Urdu, and source references are inconsistent. | Align map/fixture metadata and use reviewed Arabic, English, Urdu, and transliteration. Validate hook target against exact verse tokens; do not label unverified text as Quran. |

## Proposed lesson plan

Retain `ch47-l01` through `ch47-l05` as the five teaching positions. Refocus `ch47-l06-review` and add `ch47-test` (or the project’s approved final-test ID/file convention) as a distinct final assessment.

| Order / ID | Template | Proposed lesson | Learning job and boundary |
|---|---|---|---|
| 1 — `ch47-l01` | `STANDARD` | **مرفوع: The ـُونَ Form** | Retrieve Chapter 13’s recognition briefly. Teach **ـُونَ** as the sound masculine plural noun’s sign of rafʿ in a clear nominative role, such as **جَاءَ الْمُسْلِمُونَ** or the verified noun **الْمُؤْمِنُونَ** in 9:71. Remove present-tense verb comparisons and adjective-agreement teaching; do not say all subjects share a “case ending” with verbs. |
| 2 — `ch47-l02` | `STANDARD` | **منصوب and مجرور: The ـِينَ Form** | Contrast a direct object, e.g. **رَأَيْتُ الْمُسْلِمِينَ**, with a noun after a preposition, e.g. **سَلَّمْتُ عَلَى الْمُؤْمِنِينَ**. Teach that **ـِينَ** serves both naṣb and jarr; the surrounding syntactic role determines which. Delete all “sound masculine plural in jazm” content and **ن**-drops-after-لَنْ claims. |
| 3 — `ch47-l03` | `STANDARD` | **Iḍāfa: Drop ن, Preserve the Case** | Teach **مُسْلِمُو الْمَدِينَةِ** and **مُسْلِمِي الْمَدِينَةِ** as construct forms: the **ن** is omitted because the plural is muḍāf; waw/yāʾ still indicate the noun’s case. Give controlled examples for rafʿ, naṣb, and jarr, with case-role explanation kept within prerequisites. Remove **كُنْتُمْ خَيْرَ أُمَّةٍ** from this lesson. |
| 4 — `ch47-l04` | `STANDARD` | **Noun or Verb? Similar Endings, Different Rules** | Classify **الْمُؤْمِنُونَ** as a sound masculine plural noun, **يُؤْمِنُونَ** as an imperfect verb, **آمَنُوا** as a perfect verb, and **أَطِيعُوا** as an imperative. Explain that similar plural letters do not make them the same grammatical category. Keep verb endings, mood, imperative formation, and five-verb inflection out of production/assessment. |
| 5 — `ch47-l05` | `STANDARD` | **Quran Application: Read the Noun in Its Sentence** | Use At-Tawbah 9:71 to identify **الْمُؤْمِنُونَ** in the nominative, and a carefully selected clause from Aal ʿImran 3:28 to compare **الْمُؤْمِنُونَ / الْكَافِرِينَ / الْمُؤْمِنِينَ** by their syntactic roles. Gloss surrounding verbs/particles without teaching their morphology. Remove the unreferenced **عَلَى قُلُوبِهَا ثَلَاثٌ**, unrelated number content, unsupported tafsir, and irrelevant Al-Humazah hooks. |
| 6 — `ch47-l06-review` | `REVIEW` | **Retrieval Review: Three Noun Forms and Iḍāfa** | Keep the stable review identity/order, but remove the Chapter 46 verb-state recap. Review Chapter 13 recognition deliberately, then mix nominative, accusative, genitive, and iḍāfa noun examples. One noun/verb classification contrast may be included; no unrelated verb-state grading. |
| 7 — `ch47-test` *(new)* | `REVIEW` | **Chapter 47 Final Test** | Add a separate canonical top-level `CHAPTER_TEST` assessment. Test family recognition, **ـُونَ** versus **ـِينَ** from noun role, nun omission in iḍāfa while retaining case choice, and one short Quranic identification item. Do not test verb mood, imperative formation, adjective agreement, or numbers. |

Five focused teaching lessons are enough here because each has a distinct job—rafʿ, naṣb/jarr, construct state, noun/verb discrimination, and contextual transfer. The retrieval review and test verify them without inflating the chapter with unrelated grammar.

## Quran and grammar review

- The Quranic Arabic Corpus identifies the target **وَالْمُؤْمِنُونَ** in At-Tawbah 9:71 as a nominative masculine plural active participle (noun), making it a direct, well-matched hook for the rafʿ lesson. [Quranic Arabic Corpus, At-Tawbah 9:71](https://corpus.quran.com/wordbyword.jsp?chapter=9&verse=71)
- Aal ʿImran 3:28 contains distinct noun cases in a single excerpt: **الْمُؤْمِنُونَ** nominative, **الْكَافِرِينَ** accusative, and **الْمُؤْمِنِينَ** genitive after **مِنْ دُونِ**. The same verse also contains a jussive imperfect after prohibitive **لَا**, which is useful only to illustrate that the verb’s mood and the nouns’ cases are independent; do not turn that verb parsing into Chapter 47 instruction. [Quranic Arabic Corpus, Aal ʿImran 3:28](https://corpus.quran.com/wordbyword.jsp?chapter=3&verse=28)
- Quranic references support the text and Corpus morphology; they do not replace a qualified Arabic/Quran review or reviewed translations. Do not add interpretation that exceeds the language objective.

## Implementation checklist after approval

1. Preserve Chapter 13’s current recognition-only scope and teach the deferred case rules here; avoid rewriting the already-promoted Chapter 13 content.
2. Replace every nominal “jazm” label with the correct noun case or remove the item; remove the false claim that **ن** drops in naṣb/jazm.
3. Correct the sound masculine plural table: **ـُونَ** rafʿ, **ـِينَ** naṣb/jarr, and **ن** omitted in iḍāfa while case still determines waw/yāʾ.
4. Separate noun morphology from five-verb, perfect verb, and imperative morphology. Remove erroneous verb parsing and “same case state” explanations.
5. Replace irrelevant/unverified hooks and examples with exact, referenced Quran text and reviewed translations; label constructed Arabic; remove unrelated number/adjective/tafsir material.
6. Refocus the five `STANDARD` lessons and Chapter 47 review; add a final `REVIEW` fixture with the canonical `CHAPTER_TEST` payload.
7. Reconcile curriculum map, fixture titles/focus outcomes, source IDs, and Quran hook target; proofread English, Urdu, Arabic, transliteration, and `ar_plain`.
8. After approved fixture edits, run `npm run db:validate-fixtures`, `npm run db:audit-urdu`, `npm run quran:audit-fixtures`, and `npm run content:check` from `warsh-backend`. Content parity has **not** been checked in this proposal review; do not sync over Studio changes unless `content:check` passes. Never run the production seed for curriculum edits.
9. Account for learner “Updated” notices if published lesson content changes.

## Acceptance criteria

- Chapter 47 teaches the deferred sound masculine plural **noun** rule promised by Chapter 13, with no unnecessary re-teaching of the Chapter 13 recognition lesson.
- Noun cases are consistently named **مرفوع، منصوب، مجرور**; **مجزوم** is reserved for imperfect verbs.
- **ـُونَ / ـِينَ** are taught as case-conditioned endings; the **ن** remains in ordinary forms and drops only in iḍāfa.
- Idafa is not taught as a fourth case; its nun-drop rule is shown with both waw and yāʾ forms as case requires.
- Noun suffixes are not confused with the five verbs, perfect plural verbs, or plural imperatives; no false agreement in “case state” is asserted between nouns and verbs.
- Quran examples are exact, cited, and directly demonstrate the lesson target; uncertain or constructed text is not labeled as Quran.
- Chapter 14 adjective agreement, Chapter 46 imperfect moods, and Chapter 48 number material remain distinct; cross-chapter review is intentional and accurate.
- A true retrieval review and separate canonical checkpoint measure only taught outcomes.
- Approved fixtures pass schema, Urdu, Quran-text, and content-parity checks before publication.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–5 | `ch47-l01`–`ch47-l05` | `STANDARD` | `chapter-47-lesson-01.json`–`-05.json` |
| 6 | `ch47-l06` | `REVIEW` | `chapter-47-lesson-06-review.json` |
| 7 | `ch47-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-47-lesson-07-final-test.json` |

**Corrections**

1. The review's ID is `ch47-l06`; `ch47-l06-review` in the table above is its file stem, not an ID.
2. Chapter 63 is also titled "Idafa Effects and حذف النون". This chapter owns nūn deletion for the sound masculine plural; Chapter 63 consolidates it together with the dual (Chapter 56) and must retrieve, not re-introduce, it.
3. 3:28 opens with prohibitive **لَا يَتَّخِذِ**; Chapter 45 has taught that, so a one-line retrieval note is enough.
