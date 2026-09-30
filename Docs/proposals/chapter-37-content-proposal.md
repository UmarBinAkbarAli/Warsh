# Chapter 37 — Feminine Imperfect Forms and Agreement

**Status:** Proposal only — not approved or implemented
**Evidence reviewed:** Chapter 37 map and all five registered fixtures; Chapter 36 proposal; Chapter 38 map/fixtures and Chapter 57 weak-verb map entry for continuity; source-file references and template usage; product principles; and an attempted read-only `content:check` on 2026-09-30. The command did not complete because the Prisma/PostgreSQL connection terminated unexpectedly, so fixture/database parity is unverified. No database changes were made.
**Scope:** Chapter 37 lesson content, assessment, map alignment, and handoff to Chapter 38. No fixture, seed, or database changes are included.

## Recommendation

Keep the chapter's goal—recognizing feminine imperfect forms and reading their agreement in context—but replace its current “final ت / final ي / root has or lacks ن” explanation. That system is grammatically false. Teach the forms learners actually need:

- **هِيَ تَفْعَلُ** (she does) and **أَنْتَ تَفْعَلُ** (you, masculine singular, do) share the same imperfect form; pronoun/context distinguishes them.
- **أَنْتِ تَفْعَلِينَ** (you, feminine singular, do) has the **ـِينَ** ending. This is feminine singular, not feminine plural.
- **هُنَّ يَفْعَلْنَ** and **أَنْتُنَّ تَفْعَلْنَ** use **نون النسوة** for feminine plural; that is a different ending from **ـِينَ**.
- A weak-final example such as **هِيَ تُصَلِّي / أَنْتِ تُصَلِّينَ** must be taught as a contrast of complete forms, not by claiming the written final **ي** is only a root letter or only a gender suffix. The initial **تـ** is not uniquely feminine, and **أَنْتِ** is identified by the whole agreement form and context. Keep this to recognition; Chapter 57 is already mapped for the systematic treatment of weak verbs and the five verbs.

The current five lessons introduce several distinct, error-prone forms but provide no `REVIEW` lesson or chapter test. Expand to **six focused lessons plus a retrieval review and a separate checkpoint** (eight total). The extra teaching slot gives weak-final verbs and Quranic transfer their own practice rather than folding them into a false shortcut. Keep sustained conversational fluency for Chapter 38; Chapter 37 can use short, subject-labeled utterances to prepare that transition.

## Current-state audit

The map title is “Feminine Verb Forms,” and its hook is Al-Ankabut 29:45 (**تَنْهَى**). Its description covers “she does, you (f.) do, they (f.) do,” but four focus records have to represent five lessons. All five fixtures instead use Al-Kawthar 108:1 (**أَعْطَيْنَاكَ**, a past-tense form) as their hook. All five lessons are `STANDARD`, repeat the same eight-exercise sequence, and put both translation answers at choice 0. None contains a `CHAPTER_TEST` or a separate review.

The map references `reader_lecture_37_feminine_verb_forms.md`; all five fixtures reference `reader_lecture_37_feminine_verbs.md`. Neither file exists at the referenced `warsh-backend/prisma/` path. Treat this as a source-metadata gap; the failed parity check does not establish either drift or synchronization.

### Issues and fixes

| Priority | Issue | Proposed fix |
|---|---|---|
| Critical | **The core feminine-imperfect explanation is wrong.** Lesson 1 says a feminine imperfect “takes a ت at the end,” gives **هِيَ تَذْهَبُ** as a verb ending in **تْ**, and claims “the nunation ن is dropped.” In **تَذْهَبُ**, **تـ** is at the beginning; the verb ends in **ـُ**. Verbs do not take nunation. | Teach initial imperfect prefixes and person/number/gender endings separately. For a feminine singular subject, **هِيَ تَذْهَبُ** has the **تـ** prefix; do not teach a final **تْ**. Reserve final **ـتْ** for an accurately labeled past-tense contrast such as **ذَهَبَتْ**. |
| Critical | **The second-person feminine singular ending is mislabeled.** Lesson 1 calls **ـِينَ** a feminine plural ending and says it replaces “the نْ of the masculine.” **أَنْتِ تَذْهَبِينَ** is second-person feminine singular; masculine **أَنْتَ تَذْهَبُ** does not end in nunation. | Teach **أَنْتَ تَفْعَلُ / أَنْتِ تَفْعَلِينَ** as distinct second-person singular forms. Name and segment the **ـِينَ** ending accurately, without calling it plural or nunation. Have an Arabic reviewer confirm vowelization throughout. |
| High | **A recurring second-feminine-singular example is incorrectly vocalized.** Multiple fixtures write **تَذْهَبُينَ** instead of the correct **تَذْهَبِينَ**; the ḍamma on **بُ** does not match the intended form. | Correct every occurrence in examples, options, feedback, transliteration, map focus/example, and Urdu explanation to **تَذْهَبِينَ**. Run a whole-chapter search for this malformed string and have all affected Arabic reviewed. |
| Critical | **Lesson 2 invents a “verb with/without ن in the root” rule.** It says feminine agreement changes depending on whether a root contains **ن**, and calls final **ي** in **تُصَلِّي** the feminine marker. The root-nūn distinction is irrelevant; in this weak-final verb, learners should not be asked to infer gender from a single final letter. | Delete the two-family rule and correct **صَلَّى / يُصَلِّي / تُصَلِّي** and **أَنْتِ تُصَلِّينَ** with a qualified morphology review. Teach the whole forms and context at recognition level; do not claim that the written final **ي** is solely the root radical or solely a feminine suffix. Defer full weak-final stem changes and mood paradigms to mapped Chapter 57. |
| Critical | **Past-tense feminine suffixes are presented as present-tense rules.** Lesson 2 introduces **بَلَغَتْ** and calls it the feminine form in this present-tense chapter. Lesson 4 also centers **جَاءَتْ**, explicitly a past form, although its title says Quranic feminine verbs without distinguishing tense. | Keep the chapter centered on feminine imperfect forms. If a past form appears, label it as retrieval/contrast and do not use its final **ـتْ** as the rule for feminine imperfects. |
| Critical | **The “Quranic verses” lesson includes an unreferenced, apparently constructed line as if it were Quranic.** It prints **إِنَّ الْمُؤْمِنَاتِ جَاءَتْ بِفَاحِمَةٍ مُّبْطِنَةٍ**, gives no surah/ayah, and claims “real Quranic ayat.” The line cannot be used as a Quran quotation without an exact source. Other items in the lesson are non-feminine/past contrasts, not target examples. | Remove or explicitly label constructed sentences. Replace the reading with exact, cited passages that actually contain the target: for example, **إِنَّ الصَّلَاةَ تَنْهَى** (Al-Ankabut 29:45) for a feminine singular imperfect and **وَالْوَالِدَاتُ يُرْضِعْنَ** (Al-Baqarah 2:233) for feminine plural. Preserve context and use a reviewed translation. |
| High | **Feminine singular, feminine plural, and agreement are conflated.** Lesson 3 says both **هُنَّ** and **أَنْتُنَّ** “always” take a verb ending in **نَّ**, but it does not name **نون النسوة** or contrast it with second-person singular **ـِينَ**. Lesson 5 then says endings tell person/gender/number without accounting for stem changes or context. | Teach **نون النسوة** explicitly for the second/third feminine plural forms and contrast it with **ـِينَ** for second feminine singular. Use full, accurate examples and identify the subject pronoun where needed. Remove unsupported claims about feminine-plural pronouns being “often abbreviated” in the Quran. |
| High | **A constructed example has a misleading meaning and another is misvocalized.** **هُنَّ يُسَابِقْنَ الْإِيمَانَ** reads as “they race/compete with faith”; it is not an identified Quranic phrase and is not a natural teaching example. Lesson 5 prints interrogative **مَنْ يُسَلِّمْ...؟** with a jussive-looking sukūn without explaining a conditional reading. | Use simple, clearly marked constructed practice such as a reviewed verb–object sentence; identify it as constructed. Use **مَنْ يُسَلِّمُ عَلَى الْمُؤْمِنَاتِ؟** only after an Arabic editor verifies its interrogative mood and vowelization. Never decorate a constructed line as an ayah. |
| High | **The agreement rule is overstated.** The lesson says the prefix alone identifies the subject, despite the map's own recognition that **تَفْعَلُ** can be “you” or “she.” It also says “grammatically feminine nouns take feminine verbs” as an absolute without explaining the examples' subject position, agreement pattern, or context. | Reconcile the lesson with Chapter 34: show **هِيَ تَفْعَلُ** vs. **أَنْتَ تَفْعَلُ** and resolve them through subject/context; show **أَنْتِ تَفْعَلِينَ** separately. Use explicit, short subjects and one carefully bounded grammatical-feminine example; avoid broad singular/plural agreement claims until the relevant rules are taught. |
| High | **The Quranic hook and lesson purpose are repeatedly disconnected.** All five hooks are Al-Kawthar 108:1, **إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ**, which contains a first-person plural past verb and no feminine imperfect. The map's actual hook **تَنْهَى** from 29:45 is not used as the fixture hook. | Give each lesson a hook that supports its aim. Use relevant Quranic imperfect examples where attested; for second-person feminine forms with no suitable beginner-level Quran example, use a clearly labeled constructed context rather than an unrelated verse. |
| High | **The chapter's last two lessons overclaim mastery and omit assessment.** Lesson 4's title promises Quranic feminine verbs but much of its sample is masculine, past, or first person. Lesson 5 says learners can read “any feminine verb in the Quran,” although it teaches only a handful of inaccurate patterns; its repeated exercises do not constitute a mastery test. | Rebuild the application lesson around exact, target-bearing Quranic examples. Replace “any verb/mastering” claims with the forms actually assessed, add a retrieval review, and add a separate `REVIEW`-template checkpoint with a top-level `assessment.type = CHAPTER_TEST` payload. |
| Medium | **Chapter metadata, fixtures, and assessment design are out of alignment.** The map has four focus records for five fixtures and names forms not systematically represented. Source paths differ and are missing. Every lesson reuses the same eight-exercise order with both translation correct answers at index 0. | Align map objectives with the corrected lessons and add review/test records as supported. Replace stale source references after approval. Vary exercise type/order and answer position, and add feedback that explains the prefix, ending, and context evidence. |

## Proposed lesson sequence

Keep `ch37-l01` through `ch37-l05` as the five revised teaching slots; add `ch37-l06` for Quranic/context transfer, `ch37-l07` for review, and `ch37-l08` for the checkpoint. Assign templates according to the approved schema; all teaching lessons below may remain `STANDARD`, with the final two using `REVIEW`.

| Order / ID | Template | Proposed lesson | Scope and design |
|---|---|---|---|
| 1 — `ch37-l01` | `STANDARD` | **She or You? Read the تَـ Form in Context** | Contrast **هِيَ تَفْعَلُ** with **أَنْتَ تَفْعَلُ**. Explain that the same imperfect form can refer to “she” or “you (masculine singular)”; a pronoun or clear subject resolves it. Contrast **تَذْهَبُ** with past **ذَهَبَتْ** only as a tense contrast. |
| 2 — `ch37-l02` | `STANDARD` | **You (Feminine Singular): أَنْتِ تَفْعَلِينَ** | Teach the second-person feminine singular form and its **ـِينَ** ending; distinguish it from **أَنْتَ تَفْعَلُ**, **هِيَ تَفْعَلُ**, and feminine plural **تَفْعَلْنَ**. Use fully vocalized examples with a clear second-person addressee. |
| 3 — `ch37-l03` | `STANDARD` | **Feminine Plural: نون النسوة** | Teach **هُنَّ يَفْعَلْنَ** and **أَنْتُنَّ تَفْعَلْنَ** with a regular verb. Contrast **ـْنَ** (feminine plural) with **ـِينَ** (second feminine singular). A Quranic example may be **وَالْوَالِدَاتُ يُرْضِعْنَ أَوْلَادَهُنَّ** (2:233); explain only the grammar in scope and cite it exactly. |
| 4 — `ch37-l04` | `STANDARD` | **A First Look at Weak-Final Forms** | Replace the false “without ن” lesson with a bounded recognition contrast using **هِيَ تُصَلِّي / أَنْتِ تُصَلِّينَ** and, if needed, one regular-verb comparator such as **هِيَ تَكْتُبُ / أَنْتِ تَكْتُبِينَ**. Teach the whole forms and identify the subject from pronoun/context; explain only that weak-final verbs can alter their visible stem. Do not segment the **ي** in **تُصَلِّينَ** as exclusively root or suffix material without expert review, and do not teach the full defective-verb/mood paradigm here; that belongs to Chapter 57. |
| 5 — `ch37-l05` | `STANDARD` | **Match the Verb to a Named Feminine Subject** | Use explicit subjects, including a natural feminine noun (**الْمُعَلِّمَةُ**) and one grammatical-feminine noun in a reviewer-approved constructed sentence. Build on the ambiguity lesson rather than saying **تـ** is uniquely feminine. Keep claims about plural/nonhuman agreement out unless fully taught; reserve the cited Quran passages for Lesson 6. |
| 6 — `ch37-l06` | `STANDARD` | **Read Feminine Forms in Quranic Context** | Add a new application lesson using two exact, cited passages such as **تَنْهَى** in Al-Ankabut 29:45 and **يُرْضِعْنَ** in Al-Baqarah 2:233. Have learners locate subject and verb, distinguish imperfect from past/imperative contrasts, and explain what evidence supports the reading. No fabricated/composite text. |
| 7 — `ch37-l07` | `REVIEW` | **Feminine Agreement Retrieval Review** | Mix the six taught distinctions with short constructed sentences and the two cited Quranic examples. Label retrieval from Chapter 34 (shared **تَفْعَلُ**) and Chapter 36 only if useful; avoid adding unrelated masdar/future objectives. Do not claim “any Quranic feminine verb” mastery. |
| 8 — `ch37-l08` | `REVIEW` | **Chapter 37 Checkpoint** | Add the canonical top-level `assessment` payload with `type: CHAPTER_TEST`. Assess **تَفْعَلُ** ambiguity, second feminine singular **ـِينَ**, feminine plural **نون النسوة**, weak-final recognition, and one accurately cited feminine-subject example. Give corrective feedback; do not test unintroduced past paradigms, every feminine agreement exception, or tafsir. |

## Checkpoint blueprint

A concise 10–12 item checkpoint can include:

- 2 items distinguishing **هِيَ تَفْعَلُ** from **أَنْتَ تَفْعَلُ** using an explicit subject or pronoun;
- 2 items identifying **أَنْتِ تَفْعَلِينَ** and distinguishing it from plural **تَفْعَلْنَ**;
- 2 items recognizing **نون النسوة** in **هُنَّ يَفْعَلْنَ / أَنْتُنَّ تَفْعَلْنَ**;
- 1–2 items distinguishing weak-final **تُصَلِّي** from the second-feminine-singular **تُصَلِّينَ** form;
- 2 items reading a target form in a cited Quranic phrase and identifying the subject; and
- 0–2 transfer items on previously learned imperfect context, explicitly labeled as retrieval.

Use varied exercise types and answer positions. Feedback should say what the subject, prefix, ending, or weak-final stem contributes. Avoid “the final letter tells you everything” shortcuts.

## Continuity with nearby chapters

- **Chapter 34 → Chapter 37:** Chapter 34 introduces the imperfect's core forms. Chapter 37 should build directly on its **تَـ** ambiguity, not contradict it by saying **تـ** always means feminine or that a final **تْ** marks feminine imperfect.
- **Chapter 36 → Chapter 37:** Chapter 36 focuses on verbal nouns. Keep the transition clear: Chapter 37 returns to finite imperfect verbs and agreement; do not intermingle maṣdar patterns with feminine endings except as one brief noun/verb contrast if needed.
- **Chapter 37 → Chapter 38:** Chapter 37 should establish accurate form recognition and subject agreement. Chapter 38 can then carry those forms into multi-turn dialogue and connected speech. Use brief contextual prompts here, not an early duplicate of the full communication lesson.
- **Chapter 37 → Chapter 57:** The current map gives Chapter 57 a systematic weak-verbs unit, including defective verbs and the five verbs. Chapter 37 Lesson 4 should therefore repair the immediate recognition gap only; defer full weak-final stem alternations, mood-sensitive endings, and paradigms to Chapter 57.
- **Quran reading:** Prefer exact, cited passages and distinguish a real ayah from a constructed sentence, a past-tense example, or an imperative. Do not use an unrelated Al-Kawthar past-tense hook for every feminine imperfect lesson.

## Arabic and Quran-content review

- Al-Ankabut 29:45 includes **إِنَّ الصَّلَاةَ تَنْهَى**; the target verb is an imperfect with a feminine singular subject. [QAC, Al-Ankabut 29:45 grammar](https://corpus.quran.com/grammar.jsp?chapter=29&verse=45)
- Al-Baqarah 2:233 includes **وَالْوَالِدَاتُ يُرْضِعْنَ**. The feminine plural ending is **نون النسوة**, not the second-feminine-singular **ـِينَ** ending. [QAC, Al-Baqarah 2:233 syntax](https://corpus.quran.com/treebank.jsp?chapter=2&verse=233)
- Al-Ahzab 33:32 includes **وَقُلْنَ قَوْلًا مَعْرُوفًا** in context. If included, quote the verse accurately and identify **قُلْنَ** as an imperative feminine plural form, not an imperfect example. [QAC, Al-Ahzab 33:32](https://corpus.quran.com/grammar.jsp?chapter=33&verse=32)
- Al-Kawthar 108:1 uses **أَعْطَيْنَاكَ**, a past/perfect form; it is not a feminine imperfect example. [QAC, Al-Kawthar 108:1](https://corpus.quran.com/wordbyword.jsp?chapter=108&verse=1)
- Arabic imperfect paradigms distinguish subject through the whole person/gender/number form; the second-person masculine and third-person feminine singular forms may be identical. Weak-final roots can change visibly across forms, so Chapter 37 should teach the selected forms in context and defer full alternations. [Samy & Samy, *Basic Arabic: A Grammar and Workbook*, “Conjugating the imperfect”](https://download.fimsschools.com/ebooks/Basic%20Arabic%20A%20Grammar%20and%20Workbook%20%28Waheed%20Samy%2C%20Leila%20Samy%29.pdf); [overview of weak Arabic verbs](https://www.settemilalingue.com/en/languages/ar/grammar/weak-verbs)

These references confirm the example forms and verse locations; qualified Arabic/Quran review is still required for full parsing, vocalization, agreement claims, translation, and religious/contextual wording.

## Implementation checklist after approval

1. Align Chapter 37 map title, description, hook, focus records, six teaching lessons, review, and checkpoint.
2. Correct the singular, second-feminine-singular, and feminine-plural forms in all Arabic/English/Urdu fields; remove the false root-nūn classification and the “final تْ / ي” rules. Keep weak-final content to whole-form recognition and preserve Chapter 57's systematic scope.
3. Replace the unreferenced “Quranic” sentence and unrelated hooks with exact, cited target-bearing examples; label constructed practice clearly.
4. Add `ch37-l06` through `ch37-l08` in the supported fixture/seed structure. Put the checkpoint's `CHAPTER_TEST` assessment in the top-level `assessment` field of the `REVIEW` checkpoint lesson, not in the exercises array; do not create a parallel lesson schema.
5. Have qualified reviewers validate Arabic morphology, vowelization, Quran quotation/reference, translations, and Urdu copy. Proofread the complete chapter, not only the changed strings.
6. Run `npm run db:validate-fixtures` and `npm run content:check` from `warsh-backend` after approved edits. Do not sync Git fixtures over Studio changes unless parity check passes; do not run the production seed for content work.
7. Account for learner “Updated” notices if published content changes.

## Acceptance criteria

- **هِيَ تَفْعَلُ**, **أَنْتَ تَفْعَلُ**, and **أَنْتِ تَفْعَلِينَ** are taught accurately and cannot be confused by a false “final feminine ت” rule.
- Feminine plural **ـْنَ / نون النسوة** is distinguished from second-feminine-singular **ـِينَ**.
- Weak-final verbs do not generate a fictitious “no-nūn root” feminine class; Chapter 37 teaches only reviewed whole-form recognition and hands the detailed paradigm to Chapter 57.
- Every Quranic quote is exact, cited, and relevant; constructed sentences are labeled as such; past and imperative forms are not taught as imperfect forms.
- The review retrieves the taught objectives and the checkpoint measures them; “mastery” language is limited to demonstrated outcomes.
- The map, fixtures, assessment, English, and Urdu agree, and Chapter 37 hands off naturally to Chapter 38's dialogue/connected-speech focus.
- Approved fixtures pass schema validation and database parity checks before publication.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–5 | `ch37-l01`–`ch37-l05` | `STANDARD` | `chapter-37-lesson-01.json`–`-05.json` |
| 6 | `ch37-l06` (new) | `STANDARD` | `chapter-37-lesson-06.json` |
| 7 | `ch37-l07` (new) | `REVIEW` | `chapter-37-lesson-07-review.json` |
| 8 | `ch37-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-37-lesson-08-final-test.json` |

**Corrections**

1. The checkpoint is `ch37-test`, not `ch37-l08` (S2).
2. 2:233 is already Chapter 20's anchor for **ـهُنَّ** in **أَوْلَادَهُنَّ**; Lessons 3 and 6 say so and add only the verb **يُرْضِعْنَ**.
3. 29:45's **تَنْهَى** is itself a weak-final verb; present it as a whole form (as Lesson 4 does for **تُصَلِّي**), not as a model of the sound ending.
4. The feminine past **ـتْ** contrast retrieves Chapter 8.
