# Chapter 45 — The Three States of the Imperfect Verb

**Status:** Proposal only — not approved or implemented  
**Evidence reviewed:** Chapter 45 map in `curriculum-books5-6.cjs`; all seven registered fixtures; Chapters 44, 46, and 57 maps/fixtures for continuity; canonical lesson schema and active product specification; Quranic Arabic Corpus references linked below. `npm run db:validate-fixtures` passed for 452 fixtures, with 23 legacy reveal warnings in other chapters. Database parity is **unverified**.  
**Scope:** Chapter 45’s introduction to **مرفوع، منصوب، مجزوم**, bounded trigger sets, verb-ending model, Quranic application, localization, and assessment. No lesson fixture or database changes are included.

## Recommendation

Keep Chapter 45 as the foundation for recognizing the three grammatical states of the imperfect verb (**الفعل المضارع**), but correct the misleading “present tense” framing. Mood is not tense: the imperfect can be present, habitual, or future according to context and particles. Teach a **bounded sound-verb pattern** first, where the final short vowel is visible, and defer weak-final and five-verb endings to their mapped later treatment in Chapter 57.

Use **six focused `STANDARD` lessons, one retrieval `REVIEW`, and a separate checkpoint (eight lessons total)**. Retain the seven existing lesson IDs, correct and refocus them, keep `ch45-l07` as the review, and add `ch45-l08` for the canonical chapter test. The six teaching jobs are distinct: each state, trigger-based recognition, a controlled same-verb comparison, and Quranic transfer. This adds a measurement step without discarding any current lesson slot.

The core ending rule must be stated accurately:

- With the regular sound-verb model **يَذْهَبُ**, the indicative example has final **ـُ**; the subjunctive example **أَنْ يَذْهَبَ** has final **ـَ**; and the jussive example **لَمْ يَذْهَبْ** has final **ـْ**.
- The change is at the **end of the imperfect verb**, not its initial **يَـ / تَـ / أَـ** prefix. **يَذْهَبَ** ends in fatḥa; there is no written “alif ending” in this example.
- These are teaching examples for a regular sound verb—not universal endings for every imperfect. The five verbs and weak verbs use other signs.

## Current-state audit

The map promises all three imperfect states and uses Āl ʿImrān 3:92. That verse does contain **لَنْ تَنَالُوا** and **حَتَّى تُنْفِقُوا**, but both verbs are from the five-verb forms; their subjunctive sign is deletion of **ن**, not the single-verb final fatḥa model this chapter is trying to teach. Use the verse as a carefully bounded recognition/application excerpt, not as proof of the basic sound-verb endings. Chapter 57 explicitly owns the five verbs.

All seven registered lessons instead reuse Al-Humazah 104:1 as their hook, an ayah with no imperfect verb. Lessons 1–5 repeat the same seven exercise types/order; Lessons 6–7 add Quran/Surah mastery claims, but still no lesson has a top-level `CHAPTER_TEST`. The source path in the map and the source metadata in the fixtures are inconsistent and absent under `warsh-backend/prisma/`.

The grammar explanations contain foundational errors:

- Lessons 1–5 repeatedly say the **first letter/prefix** loses its vowel under jazm. In **يَذْهَبُ → لَمْ يَذْهَبْ**, the initial **يَـ** remains; the final **بُ** becomes **بْ** in this sound-verb example.
- Lesson 1’s purported “rafʿ marker” list includes corrupted text (“Ustra/Zabra”), while lesson copy calls the imperfect a “present/past-continuous verb.”
- Lesson 2 repeatedly translates **لَنْ** as “will never,” calls it “future-absolute negation,” mislabels an ordinary fatha as an “Alif ending,” lists malformed **فَيْ**, and treats governing verbs such as **أَرَادَ** as though they directly trigger nasb. In **أُرِيدُ أَنْ أَذْهَبَ**, the particle **أَنْ** is the relevant trigger.
- Lesson 3 says a positive command is **ذَهَبْ** (“go”), confuses an imperative with a jussive imperfect, translates **لَا النَّاهِيَة** as “no longer,” and repeats the false claim that the prefix vowel is removed.
- Lesson 4 says rafʿ is also the default in conditional sentences, although conditional constructions can govern jussive forms; its trigger chart repeats misspelled **فَيْ** and overbroad lists.
- Lesson 6 says **لَا يُحِبُّ الْكَافِرِينَ** is prohibitive **لَا النَّاهِيَة** even though its intended meaning is ordinary negation; that phrase is not from Surah Al-Humazah. It also claims the surah demonstrates all three states, which its cited examples do not establish. The card **إِنَّهُ ظَنَّ أَنْ لَنْ يَحُورَ** is from Al-Inshiqaq 84:14, not Al-Humazah, and is not referenced there.
- Lesson 7 says the learner can parse every verb in Al-Masad after one review, although it does not teach the whole surah or every verb type.

Several English, Urdu, transliteration, and Arabic-plain fields contain corrupted or mixed-language text, including strings such as **يذہب**, **فَيْفْعَلَ**, “cursor jazm,” “the candidates,” and non-Arabic characters in grammar explanations. These are learner-facing data-quality defects, not harmless formatting.

### Issues and fixes

| Priority | Issue | Proposed fix |
|---|---|---|
| Critical | **Mood, tense, and “present” are conflated.** The fixtures label **المضارع** as “present/past-continuous” and use “present tense” as if it were one of the three moods. | Call **المضارع** the imperfect verb form. Explain **مرفوع / منصوب / مجزوم** as grammatical states of that verb; use context to translate time. Do not teach mood as a tense system. |
| Critical | **The ending change is assigned to the wrong part of the verb.** Lessons say the initial prefix loses its vowel; their own example **يَذْهَبُ → يَذْهَبْ** shows the prefix remains unchanged. | Model only the final ending on regular sound verbs: **يَذْهَبُ → أَنْ يَذْهَبَ → لَمْ يَذْهَبْ**. Explicitly distinguish final-vowel changes from later five-verb/weak-verb signs. |
| Critical | **Nasb is taught with false terminology and an unbounded trigger list.** Fatha is called an “Alif ending”; **لَنْ** is “never/absolute”; **فَيْ** is malformed; **أَرَادَ** is listed as a particle. | Teach the common forms **أَنْ / لَنْ + sound imperfect** and the final fatḥa in the displayed example. Translate **لَنْ** as future negation (“will not”); avoid asserting absolute/permanent denial. Correct **أَنْ** versus the governing verb **أَرَادَ**. Add other triggers only after qualified review; identify forms such as five verbs as recognition-only here. |
| Critical | **Jazm and command forms are conflated.** The initial prefix is said to lose its vowel; positive **ذَهَبْ** is incorrectly offered as “go”; and the jussive is said to follow “commands” generally. | Teach the final sukūn on the regular sound imperfect after the scoped triggers (**لَمْ**, negative **لَمَّا**, and **لَا النَّاهِيَة** if its prerequisite is approved). Teach **لَا تَذْهَبْ** as a prohibition. State that a positive command is a distinct imperative form (**اِذْهَبْ**), not an imperfect mood example. Do not add conditional or **لَام الأمر** paradigms unless sequenced and reviewed. |
| Critical | **Trigger charts include inaccurate or overgeneralized rules.** Lesson 4 calls rafʿ the default even in conditional sentences and includes malformed/ambiguous particles. | Bound “default rafʿ” to a basic independent imperfect clause with no governor. Teach only the common triggers in scope; mark the chart “selected examples, not a complete list.” Keep conditional clauses and debated/complex **حتى / لِـ** analyses out of the beginner rule unless reviewed. |
| High | **The map’s Quran hook uses a different morphological class from the basic paradigm.** In Āl ʿImrān 3:92, **تَنَالُوا** and **تُنْفِقُوا** are five-verb forms whose subjunctive sign is deletion of **ن**. | Keep 3:92 as a Quranic recognition example and label the morphology explicitly as a later five-verb pattern. Do not test it as the same final-fatḥa model as **يَذْهَبَ**; Chapter 57 owns the five verbs. Cite the verse exactly and use a reviewed translation. |
| High | **Quran claims, examples, and hooks are inaccurate or unreferenced.** Every lesson uses 104:1 as hook; the hook does not show a mood. Lesson 6 attributes non-Al-Humazah text to the surah and mislabels ordinary negation as prohibition. | Give each example an exact reference and use it only for a structure actually present. Suitable bounded observations include **يَحْسَبُ** in 104:3 (ordinary imperfect), **لَمْ يَلِدْ / وَلَمْ يُولَدْ** in 112:3 (jussive retrieval), and 3:92 for recognition-only five-verb subjunctives. Label constructed Arabic as constructed; remove the incorrect **لَا يُحِبُّ الْكَافِرِينَ** claim. |
| High | **The “three states” table overclaims universality.** The chart says all regular verbs take **ـُ / ـَ / ـْ**, then includes plural/weak forms without teaching their distinct signs. | Keep the productive chart to one regular sound verb and one subject form. Add a prominent boundary note: weak-final verbs and the five verbs use different signs and are taught later. In Quran practice, accept recognition without requiring production of those endings. |
| High | **Chapter 44 and Chapter 46 roles are blurred.** Chapter 44 introduces **لَمْ / لَمَّا** with a bounded jussive pattern; Chapter 46 is the mapped recognition/parsing application chapter. Chapter 45 currently repeats particle-specific lessons, expands into unrelated Quran claims, and still lacks a test. | Start with brief Chapter 44 retrieval, then establish the full three-state contrast. Keep Chapter 45 on foundation and controlled comparison; let Chapter 46 own wider trigger recognition and Quranic parsing. Do not re-teach Chapter 44’s meanings as new material. |
| High | **No chapter test measures independent state recognition.** There are six `STANDARD` lessons and a `REVIEW`, but no top-level assessment. | Retain `ch45-l07` as a true retrieval review and add `ch45-l08` as a separate `REVIEW` with canonical top-level `assessment: { type: "CHAPTER_TEST", ... }`. Assess only the regular sound-verb model and explicitly taught triggers; do not test the five-verb or weak-verb rules. |
| Medium | **Exercise patterns cue answers, and the bilingual data is corrupted.** Lessons 1–5 reuse the same exercise order; many answer keys are first-position; Urdu/Arabic fields contain typos or injected foreign text. | Vary exercises by objective (identify the governor, select the correct ending, contrast one verb across states, repair an invalid form, Quran recognition). Shuffle options/pairs. Recreate **ar_plain** only from reviewed Arabic; proofread English and Urdu for meaning parity and remove stray Latin/foreign fragments. |
| Medium | **Source, hook, and focus metadata disagree.** The map has six focus records, all seven fixtures use a different hook, and map/fixture source paths differ or are absent. | Reconcile map title/description, focus outcomes, lesson count, per-lesson hooks, fixture metadata, and one maintained source identifier after approval. Do not treat source metadata mismatch as proof of database parity failure. |

## Proposed lesson plan

Retain `ch45-l01` through `ch45-l07`, refocus each slot, and add only one new lesson for the required checkpoint.

| Order / ID | Template | Proposed lesson | Learning job and boundary |
|---|---|---|---|
| 1 — `ch45-l01` | `STANDARD` | **The Default: مرفوع on a Sound Imperfect** | Model a basic declarative **الطَّالِبُ يَذْهَبُ**. Show the final **ـُ** for this sound verb and identify the imperfect form; do not call the mood “present tense” or imply that every no-particle context is automatically uncomplicated. |
| 2 — `ch45-l02` | `STANDARD` | **منصوب: أَنْ / لَنْ with the Final Fatḥa** | Contrast **أَنْ يَذْهَبَ** and **لَنْ يَذْهَبَ**. Teach the final fatḥa, not “adding an alif.” Translate **لَنْ** as future negation, not an eternal/absolute “never.” Keep **حَتَّى** in the Quran example as recognition-only until its detailed syntax is reviewed. |
| 3 — `ch45-l03` | `STANDARD` | **مجزوم: The Final Sukūn** | Retrieve Chapter 44’s **لَمْ / لَمَّا** patterns, then add the prohibitive **لَا تَذْهَبْ** only if correctly introduced. In **يَذْهَبُ → لَمْ يَذْهَبْ**, mark the final consonant; do not change the initial prefix. Contrast prohibition with a separate positive imperative only as a form distinction, using **اِذْهَبْ** accurately. |
| 4 — `ch45-l04` | `STANDARD` | **Find the Trigger, Identify the State** | Present short, unambiguous sound-verb clauses. Learners first locate a taught governor, then classify the verb’s state. Replace the false “conditionals are rafʿ by default” chart and limit the chart to selected triggers actually taught. |
| 5 — `ch45-l05` | `STANDARD` | **One Sound Verb, Three States** | Keep the subject constant and compare **هُوَ يَذْهَبُ / أَنْ يَذْهَبَ / لَمْ يَذْهَبْ**. Learners choose/build the appropriate ending from the trigger. Do not call the forms “goes / will go / did not go” without the words that license those readings. Remove claims of a “complete picture” for all imperfect forms. |
| 6 — `ch45-l06` | `STANDARD` | **Recognize the States in Quranic Context** | Replace the unsourced “all states in Al-Humazah” lesson with exact, bounded examples: **يَحْسَبُ** (104:3) as an ordinary imperfect observation; **لَمْ يَلِدْ** (112:3) as Chapter 44 retrieval; and **لَنْ تَنَالُوا … حَتَّى تُنْفِقُوا** (3:92) as recognition-only subjunctive in five-verb forms. Make clear that 3:92 does not demonstrate the basic single-verb fatḥa ending. Separate language observation from tafsir. |
| 7 — `ch45-l07` | `REVIEW` | **Three States: Retrieval Review** | Replace the current “fully parse Al-Masad” claims with varied review of the sound-verb paradigm, trigger recognition, and correction of prefix-versus-ending misconceptions. Use Quran excerpts only as previously taught recognition; do not claim every verb in Al-Masad is parseable. |
| 8 — `ch45-l08` *(new)* | `REVIEW` | **Chapter 45 Checkpoint** | Add the canonical top-level `CHAPTER_TEST` assessment. Test the three displayed sound-verb forms, identify a taught trigger, select the matching form in context, and include at most one Quran-recognition item. Keep five-verb and weak-verb endings out of scope. |

## Continuity with nearby chapters

- **Chapter 44 → Chapter 45:** Chapter 44 teaches **لَمْ / لَمَّا + imperfect** with a bounded final-sukūn pattern. Retrieve that knowledge briefly; Chapter 45’s new value is comparing it with **مرفوع** and **منصوب**, not reteaching “did not / not yet.”
- **Chapter 45 → Chapter 46:** Chapter 45 establishes a controlled model and common triggers. Chapter 46 can then apply those ideas to more varied Quranic/textual contexts, provided its own examples and parses are corrected and reviewed. Do not claim the foundation lesson teaches every trigger.
- **Chapter 45 → Chapter 57:** Chapter 57 is mapped to weak verbs and the five verbs. Keep deletion of **ن**, weak-final deletion, and other exceptional signs as later instruction. Chapter 45 may point them out as a preview only.
- **No new Conversation Lab:** This is a grammatical foundation unit. Short question/answer prompts may be exercises, but no new `SPOKEN_PHRASES` lesson is needed.

## Quran and language review

- The Quranic Arabic Corpus classifies **يَحْسَبُ** in Al-Humazah 104:3 as an imperfect verb; the surrounding verse does not support the lesson’s claim that 104:1 demonstrates all three states. [Quranic Arabic Corpus, 104:3](https://corpus.quran.com/wordbyword.jsp?chapter=104&verse=3)
- The Corpus identifies **لَنْ تَنَالُوا** and **حَتَّى تُنْفِقُوا** in Āl ʿImrān 3:92 as subjunctive. These are second-person plural five-verb forms, so the visible sign is not the simple singular final fatḥa. [Quranic Arabic Corpus, 3:92](https://corpus.quran.com/wordbyword.jsp?chapter=3&verse=92) · [Morphology of تَنَالُوا](https://corpus.quran.com/wordmorphology.jsp?location=%283%3A92%3A2%29)
- In Al-Isrāʾ 17:22, **لَا تَجْعَلْ** is a jussive imperfect; the same verse later contains **فَتَقْعُدَ** in the subjunctive. Use this only as a reviewed recognition example; it contains syntax beyond the chapter’s simplest model. [Quranic Arabic Corpus, 17:22](https://corpus.quran.com/wordbyword.jsp?chapter=17&verse=22)
- In Al-Ikhlāṣ 112:3, **لَمْ** governs jussive **يَلِدْ**, and **يُولَدْ** is a passive jussive imperfect. This is useful retrieval from Chapter 44, not a new mood paradigm. [Quranic Arabic Corpus, 112:3](https://corpus.quran.com/wordbyword.jsp?chapter=112&verse=3)

These references support the cited forms; they do not replace qualified Arabic/Quran review or translation review. Keep Quran text exact and referenced, and do not present a grammar observation as tafsir.

## Implementation checklist after approval

1. Align the map title/description, hook, focus records, and source metadata with the bounded imperfect-mood objective.
2. Correct every ending explanation: final short vowel/sukūn for the regular sound-verb model; no prefix-vowel change and no “Alif ending” claim.
3. Replace false trigger/meaning lists (**لَنْ = never**, **لَا الناهية = no longer**, **فَيْ**, commands as an imperfect state, and default rafʿ in conditional clauses).
4. Correct all Quran references and analyses; remove the Al-Humazah attribution for unrelated text, label constructed examples, and keep five-verb/weak-form examples recognition-only.
5. Repair all English/Urdu/transliteration/Arabic-plain corruption and vary exercises/options.
6. Keep `ch45-l07` as a true review and add `ch45-l08` with the supported top-level `CHAPTER_TEST` assessment payload.
7. After approved fixture edits, run `npm run db:validate-fixtures`, `npm run db:audit-urdu`, and `npm run content:check` from `warsh-backend`. Do not sync fixtures over Studio edits unless parity passes; do not run the production seed for content work.
8. Account for learner “Updated” notices if published lesson content changes.

## Acceptance criteria

- The chapter teaches grammatical mood of the imperfect, not a false present/past-continuous tense category.
- The final ending is the focus: **يَذْهَبُ / أَنْ يَذْهَبَ / لَمْ يَذْهَبْ**; the prefix is not said to lose its vowel, and a fatha is not called an alif.
- **لَنْ** is not taught as intrinsically “never/eternal”; positive imperative is not mislabeled as an imperfect jussive form; prohibition and ordinary negation remain distinct.
- The trigger chart is bounded and accurate; conditional clauses, hidden governors, weak verbs, and five-verb endings are not overgeneralized.
- Quran text/references and mood analyses are accurate; Āl ʿImrān 3:92 is identified as a five-verb example rather than the basic singular paradigm.
- Chapters 44, 46, and 57 retain distinct roles, and no lesson claims whole-surah mastery from partial examples.
- A real retrieval review and separate canonical checkpoint assess only taught outcomes.
- Approved fixtures pass schema validation, Urdu audit, and database parity before publication.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–6 | `ch45-l01`–`ch45-l06` | `STANDARD` | `chapter-45-lesson-01.json`–`-06.json` |
| 7 | `ch45-l07` | `REVIEW` | `chapter-45-lesson-07-review.json` |
| 8 | `ch45-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-45-lesson-08-final-test.json` |

**Corrections**

1. The checkpoint is `ch45-test`, not `ch45-l08` (S2).
2. Lesson 3 **does** introduce prohibitive **لَا تَذْهَبْ** formally — this is its home (Chapters 31 and 34 only flagged it). Remove "only if correctly introduced".
3. The positive imperative appears only as a form contrast; how to form it is taught in Chapter 51 Lesson 4.
4. **أَنْ** (Lesson 2) is its first formal appearance as a naṣb trigger; **لَنْ** retrieves Chapter 35.
