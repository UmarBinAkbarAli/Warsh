# Chapter 46 — Applying the States of the Imperfect Verb

**Status:** Proposal only — not approved or implemented  
**Evidence reviewed:** Active product specification; Chapter 46 map in `warsh-backend/prisma/curriculum-books5-6.cjs`; all six registered Chapter 46 fixtures; Chapter 45 proposal and fixtures; Chapter 47 map/fixture for sequence context; lesson schema’s assessment definition.  
**Scope:** Correct and refocus Chapter 46’s application of **مرفوع، منصوب، مجزوم**, Quranic examples, negation/prohibition contrasts, English/Urdu content, and assessment. No lesson fixture or database changes are included.

## Recommendation

Keep Chapter 46 as an **application and parsing chapter**, not another introduction to the three states and not a three-lesson Tadabbur of Al-Masad. Chapter 45 is mapped as the foundation; Chapter 46 should require learners to apply that foundation in phrases and short, accurately sourced Quranic excerpts. The present Chapter 46 repeats the Chapter 45 paradigm almost verbatim, while its “application” examples contain errors that could teach the wrong rules.

Retain and refocus the six existing lesson positions, then add a genuine retrieval review and a separate canonical chapter-test lesson (**eight lessons total**). This gives learners a progression from guided retrieval to independent parsing, repairs misconceptions before assessment, and keeps the existing content IDs available for careful revision. Do not add another Conversation Lab: the chapter’s outcome is grammatical reading and analysis, not a new spoken interaction function.

This plan assumes the Chapter 45 proposal’s bounded, regular sound-verb paradigm is accepted. If that proposal changes, reconcile both chapters together: until then, the current published fixtures still overlap, so this is a proposal for the intended sequence, not a claim that the overlap has already been fixed.

## Current-state audit

The map calls Chapter 46 **“The Three States — Recognition and Parsing”**, but describes “present-tense verbs” and maps Al-Masad 111:1 as the hook. That verse contains **تَبَّتْ** and **تَبَّ**, both perfect verbs, not examples of the three imperfect states. The map’s parse labels also classify **لَنْ** and **أَنْ** as **حرف جر** (“preposition”); in these constructions they are not prepositions. Its hook, examples, parse text, and focus outcomes do not agree on whether this is mood practice, general verb parsing, or a surah study.

The six fixtures are all `STANDARD` lessons. Lessons 1–3 restate the Chapter 45 moods/particles and re-teach trigger charts, rather than progressing to parsing. Lessons 4 and 6 turn into broad Al-Masad/tafsir-style lessons; Lesson 5 claims mixed-state parsing but uses a fabricated phrase and mislabels the particle. The fixture set has no distinct `REVIEW` chapter test with the canonical `CHAPTER_TEST` assessment described in the product specification.

### Issues and proposed fixes

| Priority | Issue | Proposed fix |
|---|---|---|
| Critical | **The chapter duplicates the Chapter 45 foundation.** L1 reteaches all three basic states, L2 reteaches **لَنْ**, and L3 re-explains **لَا النَّاهِيَة** and the imperative. | Retain only a short retrieval at the start. Spend the chapter on applying already-taught triggers to complete clauses, independently locating the governor, and explaining the evidence for a state. Do not introduce a broader particle catalogue. |
| Critical | **Mood and tense are again conflated.** Fixtures call **المضارع** “present tense,” equate **لَمْ** with past tense and **لَنْ** with absolute/eternal future negation, and imply that state determines time. | Use “imperfect verb” for **المضارع** and “grammatical state/mood” for **مرفوع، منصوب، مجزوم**. Explain that particles affect grammar and contribute meaning, but tense/time translation is not identical to mood. Translate **لَنْ** as future negation (“will not”), not a guaranteed “never.” |
| Critical | **The word-ending rules and examples are false or out of scope.** The fixtures call fatḥa an “Alif ending,” say the first letter/prefix changes under jazm, and use weak-final **أَنْسَى** and five-verb **تَفُوزُوا** as if they displayed the regular sound-verb rule. | Use the same regular sound-verb model as Chapter 45, such as **يَذْهَبُ / أَنْ يَذْهَبَ / لَمْ يَذْهَبْ**. Point to the final position, not the prefix. Do not teach the final-weak or five-verb inflection in this chapter; label a sighting as preview only and defer its rule to Chapter 57. |
| Critical | **The positive imperative is taught as a jussive imperfect.** **ذَهَبْ** is not the positive command “go”; **اتَّقُوا** is a built imperative, not an imperfect in the jussive state. The fixtures claim commands generally work “through the jussive mood.” | Keep the categories distinct: for a positive command, use the correct imperative **اِذْهَبْ**; for a prohibition, use **لَا تَذْهَبْ** (jussive imperfect). Say only that the prohibitive construction governs the imperfect; do not classify the positive imperative as a jussive imperfect or derive it by mechanically dropping any prefix. |
| Critical | **Simple negation and prohibition are confused.** L5 calls **لَا تُفْنِي** prohibitive, then glosses it as “does not use up” and says it is not a command. The surface form shown is not the alleged Quranic phrase and does not demonstrate the claimed jussive sign. | Teach the contrast with reviewed, fully vocalized examples: ordinary **لَا النافية** + marfūʿ imperfect for a statement (e.g. constructed **هُوَ لَا يَذْهَبُ**) versus **لَا الناهية** + a jussive imperfect for a prohibition (**لَا تَذْهَبْ**). Label constructed examples; never infer prohibition from **لَا** alone. |
| Critical | **Invented/misattributed Quran examples are taught as ayat.** **لَا تُفْنِي مَالَهُ وَمَا كَسَبَ** is not Al-Masad 111:2; the verse is **مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ**. **لَنْ نَّبْرَأَ أَنفُسَنَا** is not Qaf 50:16; the verse begins **وَلَقَدْ خَلَقْنَا الْإِنسَانَ**. | Replace them with exact, referenced Quran text, and use only the grammar the passage actually demonstrates. If a phrase is composed for an exercise, label it “constructed Arabic,” do not attach a Quran citation/audio, and have Arabic reviewed before publication. |
| High | **Al-Masad 111:1 and its grammar are misanalysed.** The fixtures call **تَبَّتْ** a jussive-related “prayer verb,” describe its supposed effect on nouns, and label **يَدَا** a مبتدأ. The Corpus identifies **تَبَّتْ** as a perfect verb and **يَدَا** as a nominative dual noun; **وَتَبَّ** is also perfect. | If 111:1 is retained, use it for a carefully bounded perfect-versus-imperfect contrast or basic word recognition—not as proof of the three imperfect states. Do not call the perfect verb jussive; describe the translation/rhetorical force cautiously and leave tafsir claims to a qualified reviewer. |
| High | **The Al-Masad unit makes unsupported interpretive claims and overpromises mastery.** It declares the rope worthless/quick-burning, attributes particular conduct and motives to the wife, and claims learners can parse the whole surah despite errors in its verse analyses. L6’s Arabic `ar_plain` includes the typo **وامرأةه**; several Urdu lines have mistranslations or encoding/mixed-language corruption (including “کھوجل” and stray non-Urdu text). | Remove interpretive assertions that are not needed for the language outcome. Use a reviewed translation and exact verse references. Limit the objective to the specific grammar taught; do not claim “full surah completion/mastery.” Rebuild Arabic-plain from reviewed Arabic and proofread English/Urdu for accuracy and parity. |
| High | **The map implies learners can identify any trigger by looking only immediately before the verb.** Its rule ignores multiword clauses, governing words, and particles that govern a noun rather than a verb. It even highlights **إِنَّ** correctly in one example but the sequence does not teach the distinction systematically. | Teach a bounded parse routine: find the target imperfect; inspect the clause for a governor within the taught scope; decide whether that word governs this verb; then name the state and point to its sign. Explicitly contrast **أُرِيدُ أَنْ أَفْهَمَ** (the particle **أَنْ** governs **أَفْهَمَ**, not **أُرِيدُ**) with a nearby particle such as **إِنَّ** affecting a noun. Mark complex dependencies out of scope. |
| High | **Al-Masad’s actual imperfect is mishandled or left unexplained.** Verse 111:3 has **سَيَصْلَى**: a future marker **سَـ** attached to an imperfect; the lesson says it will be studied later, then calls the whole surah a state-parsing lab. | Use 111:3 for a focused application: **سَـ** marks future time but is not the nasb/jazm governor in the basic paradigm; identify the imperfect and its state only within the taught sound/ending boundary. Contrast with perfect verbs in 111:1–2. Avoid making broad tense or surah-mastery claims. |
| High | **No practice progression or final measurement.** Repeated exercises test isolated recall; no lesson gradually moves from scaffolded to independent parsing, and no separate chapter test is registered. | Refocus the existing six teaching slots, add one varied retrieval `REVIEW`, and add one distinct `REVIEW` carrying the schema-supported top-level `assessment.type: "CHAPTER_TEST"`. Assess only outcomes taught here; do not test weak/five-verb endings or detailed tafsir. |
| Medium | **Source and learning metadata are inconsistent.** The map points to `reader_lecture_46_mudaari_application.md`; fixtures cite two other absent paths, and the sixth lesson title says full surah completion while its focus is supposed to be mood application. | After approval, align source identifier, map title/description/hook/examples/focuses, lesson titles, exercise content, and actual lesson count. Treat this as metadata cleanup, not evidence of database parity. |

## Proposed lesson plan

Keep six focused `STANDARD` lessons, one retrieval `REVIEW`, then the separate checkpoint. Retain `ch46-l01`–`ch46-l06` for continuity, but replace their content substantially; add `ch46-l07` and `ch46-l08`.

| Order / ID | Template | Proposed lesson | Learning job and boundary |
|---|---|---|---|
| 1 — `ch46-l01` | `STANDARD` | **Retrieve the Three-State Parsing Routine** | Briefly retrieve Chapter 45’s regular sound-verb forms, then teach a repeatable clause-level process: locate the imperfect, identify a taught governor, classify its state, and justify the ending. Replace “first letter” and “always look immediately before it” claims. Do not reteach the three paradigms. |
| 2 — `ch46-l02` | `STANDARD` | **Apply Governors in Complete Clauses** | Apply already-taught **أَنْ / لَنْ / لَمْ** to short, fully vowelled regular sound-verb clauses; distinguish the governing particle from the main verb and other nearby words. Replace absolute “never,” weak-final and five-verb examples. Do not add new particle lists or repeat a basic lesson on **لَنْ**. |
| 3 — `ch46-l03` | `STANDARD` | **Negation, Prohibition, and a Positive Command** | Contrast a statement with **لَا النافية**, a prohibition with **لَا الناهية + imperfect مجزوم**, and one correctly formed positive imperative (**اِذْهَبْ**). Learners identify what each form is doing before parsing; imperatives are not counted as one of the imperfect’s three states. |
| 4 — `ch46-l04` | `STANDARD` | **Quran Parsing Lab: Al-Masad 111:1–3** | With exact references and a reviewed translation, compare perfect verbs **تَبَّتْ، وَتَبَّ، أَغْنَىٰ، كَسَبَ** with **سَيَصْلَى** in 111:3. Focus on verb identification, the future prefix **سَـ**, and what Chapter 45’s state rule can/cannot establish. Avoid unsupported tafsir, false jussive claims, and pretending 111:1 contains all three states. |
| 5 — `ch46-l05` | `STANDARD` | **Parse a Short Passage One Verb at a Time** | Apply the routine to a carefully selected and reviewed passage/extract containing only forms and triggers within the taught scope. Reuse one prior example deliberately for spaced retrieval, but make the main task a new context. Each Quran quotation must be exact, referenced, and distinguished from constructed practice. |
| 6 — `ch46-l06` | `STANDARD` | **Error Clinic: Find and Repair a Misparse** | Learners correct planted errors: confusing tense with state, calling **لَنْ** “never,” treating **إِنَّ** as an imperfect governor, confusing **لَا النافية / لَا الناهية**, changing a prefix instead of checking the ending, or calling an imperative a jussive imperfect. Weak/five-verb signs are recognition-only previews owned by Chapter 57. |
| 7 — `ch46-l07` *(new)* | `REVIEW` | **Retrieval Review: From Clause to Explanation** | Mixed, varied retrieval without new grammar: locate the verb, identify a taught governor, label the state, explain the sign, and distinguish statement/prohibition/command. Include at least one novel constructed clause and one exact short Quranic excerpt. |
| 8 — `ch46-l08` *(new)* | `REVIEW` | **Chapter 46 Checkpoint** | Add the canonical top-level `CHAPTER_TEST` payload. Assess clause-level identification, governor-to-verb relation, correct regular sound-verb ending, **لَا** contrast, and the limited Al-Masad 111:3 application. Do not test detailed verse interpretation or the inflection of five verbs/weak verbs. |

The added lessons are justified because a review and a chapter test serve different jobs: retrieval builds fluency; the test independently verifies the stated outcomes. The extra lesson slots should not be filled with unrelated surah commentary.

## Continuity and course boundaries

- **Chapter 45 → Chapter 46:** Chapter 45 owns the explicit introduction and controlled three-form paradigm. Chapter 46 starts with retrieval and applies it in context. If the Chapter 45 proposal is not approved, reconcile the two chapters before implementation rather than silently relying on a future rewrite.
- **Chapter 46 → Chapter 47:** Chapter 47 moves on to sound masculine plural. Do not drift into a second plural paradigm or over-teach suffix-based imperfect endings here; five-verb morphology remains with Chapter 57.
- **Chapter 46 → Chapter 57:** Weak-final and five-verb forms may be pointed out as “this example uses a different sign; we will learn it later.” Do not grade their morphological production in Chapter 46.
- **Quran and Tadabbur:** Quranic language provides accurate, bounded examples, not a license to make unsupported tafsir claims. Keep any surah-level reflection distinct from grammatical parsing and do not promise mastery of an entire surah from this chapter.
- **Conversation Labs:** No new `SPOKEN_PHRASES` lesson is proposed. A short spoken prompt may reinforce an application, but this chapter’s distinct job is reading/parsing, not communicative conversation.

## Source review

- The Quranic Arabic Corpus identifies **تَبَّتْ** in Al-Masad 111:1 as a perfect verb, **يَدَا** as a nominative dual noun, and **وَتَبَّ** as a perfect verb. Its word-by-word page for 111:2–5 shows **مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ**, **سَيَصْلَى**, and **حَمَّالَةَ الْحَطَبِ**—not the fixtures’ **لَا تُفْنِي** phrase. [Quranic Arabic Corpus, Al-Masad 111:1–5](https://corpus.quran.com/wordbyword.jsp?chapter=111&verse=1)
- The Corpus’s Qaf 50:16 text begins **وَلَقَدْ خَلَقْنَا الْإِنسَانَ وَنَعْلَمُ** and contains no **لَنْ نَّبْرَأَ أَنفُسَنَا** phrase. [Quranic Arabic Corpus, Qaf 50:16](https://corpus.quran.com/wordbyword.jsp?chapter=50&verse=16)
- The corpus references support text and morphology checks; they are not a substitute for a qualified Arabic/Quran reviewer or a reviewed translation. Keep the interpretation separate from grammar claims.

## Implementation checklist after approval

1. Align the Chapter 45 and 46 objectives so 45 introduces the regular model and 46 applies it; ensure no fixture treats a proposal as already implemented.
2. Correct all Arabic grammar labels, translations, verb signs, and imperative/prohibition distinctions; move weak-final and five-verb teaching to its mapped later chapter.
3. Replace fabricated or misattributed ayat with exact Quran text, references, and reviewed translations; label all constructed examples.
4. Rebuild corrupt `ar_plain`, transliteration, English, and Urdu strings from the reviewed Arabic; proofread language parity and avoid unsupported theological/interpretive claims.
5. Refocus L4–L6 on application, retrieval, and correction; keep Al-Masad examples narrowly grammatical and sourced.
6. Add `ch46-l07` retrieval review and `ch46-l08` with the canonical top-level `CHAPTER_TEST` payload supported by `packages/lesson-schema`.
7. Reconcile curriculum-map metadata, lesson sources, titles, hook, focus outcomes, and fixture IDs/count after approval.
8. Validate approved edits with `npm run db:validate-fixtures` and `npm run db:audit-urdu`; verify `npm run content:check` before considering any database sync. Database parity is **unverified** in this proposal review. Never run the production seed for this work.
9. Account for learner “Updated” notices if published lesson content changes.

## Acceptance criteria

- Chapter 46 applies, rather than re-teaches, Chapter 45’s three-state foundation.
- No mood/tense conflation, “absolute never” rule, false “Alif ending,” prefix-change rule, or universal trigger claim remains.
- Positive imperative, prohibitive **لَا**, and simple negative **لَا** are distinct and accurately formed.
- No weak-final/five-verb ending is assessed before its mapped instruction in Chapter 57.
- Quran text, verse references, morphology, and translations are accurate; constructed examples are labelled; grammar is not presented as tafsir.
- The Al-Masad examples are used only for bounded outcomes supported by the actual verses, without a whole-surah mastery claim.
- A retrieval review and distinct canonical checkpoint assess only taught outcomes.
- English, Urdu, Arabic, transliteration, and `ar_plain` fields are proofread and mutually consistent; source/map metadata agrees with the final sequence.
- Approved fixtures pass schema and Urdu audits, and content parity is checked before any publication/sync.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–6 | `ch46-l01`–`ch46-l06` | `STANDARD` | `chapter-46-lesson-01.json`–`-06.json` |
| 7 | `ch46-l07` (new) | `REVIEW` | `chapter-46-lesson-07-review.json` |
| 8 | `ch46-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-46-lesson-08-final-test.json` |

**Corrections**

1. The checkpoint is `ch46-test`, not `ch46-l08` (S2).
2. **سَيَصْلَى** (111:3) is weak-final: its rafʿ is estimated on the alif and shows no ḍamma. Lesson 4 identifies it as an imperfect marked for the future by **سَـ** and says its ending is "hidden — Chapter 57 explains why"; it cannot be used to practise the visible ending.
3. Lesson 3 (negation / prohibition / command) is application of Chapter 45 Lesson 3; keep the explanation to one retrieval card.
