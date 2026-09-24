# Chapter 24 — إِنَّ and إِنَّا: corrected content proposal

**Status:** Approved with the amendments in section 8; built and promoted to production 2026-09-24

**Scope:** Chapter 24 map, six existing lesson fixtures and seed rows, plus one new final test

**Recommended structure:** Five teaching lessons, one cumulative review, one distinct final test (seven items)

## 1. Chapter decision and learning outcome

Rename the chapter **“إِنَّ and إِنَّا: Emphasis in Quranic Sentences”** (Arabic: **إِنَّ وَإِنَّا فِي الْجُمَلِ الْقُرْآنِيَّةِ**). Teach **إِنَّ** and its attached first-person plural form **إِنَّا**, not the whole family of “إِنَّ and its sisters.” Do not introduce a number table, a new adjective inventory, full verb morphology, or extended tafsir here.

By the end, a learner should be able to:

1. Recognize **إِنَّ** as an emphasis particle and read it as “indeed/truly” according to context, without claiming that it logically proves a sentence.
2. Contrast a simple nominal statement with an **إِنَّ** statement: **الْبَيْتُ كَبِيرٌ → إِنَّ الْبَيْتَ كَبِيرٌ**. Identify **الْبَيْتَ** as **اسم إنّ منصوب** and **كَبِيرٌ** as **خبر إنّ مرفوع**.
3. Recognize **إِنَّا** as **إِنَّ + نَا** (“indeed We”), with **نَا** serving as the particle's **اسم إنّ**; do not confuse this with **نَا** attached to a verb or noun.
4. Read the taught feature in at least two *different*, accurately attributed Quran passages, and transfer it to a fresh authored sentence.
5. Pass a separate assessment that tests meaning, form, roles, and transfer rather than memorized verse translation.

The case rule above is corroborated by the [Quranic Arabic Corpus grammar of إِنَّ](https://corpus.quran.com/documentation/particleinna.jsp). In [Al-Baqarah 2:173](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=173), **إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ** is a verified Quran *excerpt*: **اللَّهَ** is accusative, **غَفُورٌ** nominative, and **رَحِيمٌ** a nominative adjective describing it. It must not be presented as a complete ayah or an invented standalone Quran quotation.

## 2. Curriculum fit and deliberate retrieval

| Existing learning | Chapter 24's new work | Boundary |
|---|---|---|
| Earlier nominal statements and adjective agreement | Show what changes **when إِنَّ enters**; compare the same meaning before and after. | Do not reteach adjective lists or suggest **كَبِيرٌ** becomes accusative. |
| Chapters 19–20, 23: attached pronouns, including noun/verb attachment in context | Distinguish **نَا** attached to the particle **إِنَّ** from **نَا** on a familiar verb in **أَعْطَيْنَاكَ**. | This is a new attachment *host* and meaning, not a repeat of a possessive paradigm. Check the actually published prerequisite before scoring the distinction. |
| Chapter 23: connected reading | Read one short Quran line for a *new* target: the emphasis particle and its noun/predicate or attached pronoun. | Do not rerun Chapter 23's broad integration tasks. |
| Chapter 25: **لَيْسَ** | Leave negating nominal sentences and **خبر ليس منصوب** to Chapter 25. | A brief later comparison may help, but do not teach **لَيْسَ** here. |

Chapter 24 has no separate Conversation Lab. Earlier labs teach exchanges; here the measurable outcome is accurate reading and grammatical recognition. A short question-and-answer can be a contextual exercise, not another lab.

## 3. Repair matrix

| Current location | Defect | Required correction |
|---|---|---|
| Map and `ch24-l02` | Map calls **إِنَّ** `حرف جر` and **اللَّهَ** `مفعول`. Lesson 2 repeatedly says the noun remains nominative and **كَبِيرٌ** becomes accusative; some scored answers reward the false rule. Lesson 6 contradicts it. | Map: **إِنَّ = حرف توكيد ونصب**, **اللَّهَ = اسم إنّ منصوب**, **غَفُورٌ = خبر إنّ مرفوع**. Rewrite every explanation, prompt, answer key, feedback string and Urdu equivalent using **اسم إنّ منصوب، خبر إنّ مرفوع**. |
| `ch24-l01`, `ch24-l03` | **إِنَّا جَعَلْنَاهُ قُرْآنًا عَرَبِيًّا** is attributed to 6:12 or unrelated references. Other frequency/surah-placement claims are unsupported. | Attribute the excerpt to [Az-Zukhruf 43:3](https://corpus.quran.com/wordbyword.jsp?chapter=43&verse=3). Remove unsourced occurrence counts and false verse claims. Do not call the excerpt a whole ayah; the verse continues. |
| `ch24-l03`, map | The particle-plus-pronoun explanation is blurred with **نُون الوقاية**, and the lesson implies **إِنَّا نَحْنُ** cannot occur. | Teach the learner-facing segmentation **إِنَّ + نَا**; **نَا** is the attached **اسم إنّ**. Do not claim the independent pronoun **نَحْنُ** is impossible alongside it. |
| `ch24-l04` | Numbers 1–10 interrupt the topic; the number/gender rules and **إِنَّ الْكِتَابَ ثَلَاثَةٌ** model are wrong or unsuitable. | Replace this lesson with a focused transfer lesson. Preserve numbers as a **separate future curriculum decision**: a dedicated numbers unit should teach 1–2 versus 3–10 and counted-noun agreement correctly, with its own exercises. Do not silently drop the topic. See [Corpus gender rules](https://corpus.quran.com/documentation/gender.jsp). |
| `ch24-l05` | Replays 108:1 tasks from Lesson 3; contains corrupted **عَيِّ上图**, overconfident historical/tafsir claims, and misleading verb description. | Retain [Al-Kawthar 108:1](https://corpus.quran.com/wordbyword.jsp?chapter=108&verse=1) for one guided application. Remove corrupt text and unsupported claims. If interpretation is retained, obtain qualified Quran review and clearly separate it from grammatical observation. |
| `ch24-l06` | Repeats size/adjective vocabulary and gives the case rule opposite to Lesson 2; no real cumulative review follows. | Convert to `REVIEW` and interleave new examples. No new vocabulary inventory or numbers. |
| Chapter as a whole | No distinct chapter final test; four map focus records do not match six fixtures; metadata points to unavailable `reader_...` sources. | Add `ch24-test`, align map focus/seed/fixture metadata and provenance. Treat missing source files as unverified metadata, not proof of lesson content. |

## 4. Proposed seven-item chapter

Keep the six existing IDs and display positions. Reassign their purpose; add only `ch24-test` at order 7. This preserves stable identities but **does not** settle whether past completions should be marked for revisit after a major content repair.

| Order / ID | Template | Lesson and unique job | Evidence of understanding |
|---|---|---|---|
| 1 / `ch24-l01` | `STANDARD` | **What does إِنَّ add?** Start with a plain authored sentence such as **الْبَيْتُ كَبِيرٌ**, then **إِنَّ الْبَيْتَ كَبِيرٌ**. Learner identifies “indeed” and the unchanged core claim; briefly notice the changed noun ending without a case lecture yet. In the *ending excerpt* of 2:173, recognize **إِنَّ**. | Choose the accurate meaning and identify the emphasized statement in a fresh sentence. |
| 2 / `ch24-l02` | `STANDARD` | **The noun changes; the predicate does not.** Teach **اسم إنّ منصوب** / **خبر إنّ مرفوع** explicitly with the before/after pair and the verified 2:173 ending **إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ**. Keep **رَحِيمٌ** recognition-only as a second description; it is not a second **اسم إنّ**. | Mark the noun/predicate in an authored sentence; reject the deliberately reversed case rule; read the correct 2:173 forms. |
| 3 / `ch24-l03` | `STANDARD` | **إِنَّا = Indeed We.** Segment **إِنَّا** and read [Az-Zukhruf 43:3](https://corpus.quran.com/wordbyword.jsp?chapter=43&verse=3) as a bounded excerpt. Review **نَا** on a familiar verb only enough to show attachment changes function; do not teach the whole verb paradigm. | Identify what **نَا** is attached to and who it refers to, in a new two-option contrast. |
| 4 / `ch24-l04` | `STANDARD` | **Apply إِنَّ in a new sentence.** Replace numbers with two or three short, editor-approved authored contexts (home, book, teacher). One may use a familiar place phrase, e.g. **إِنَّ الْكِتَابَ عَلَى الْمَكْتَبِ**, for *meaning-level recognition only*; do not grade an invisible predicate case ending. Focus on deciding which statement is emphasized, which noun follows **إِنَّ**, and whether a claim about the noun's case is true. | Transfer to a sentence not seen on any earlier card; explain one wrong option using the taught rule. |
| 5 / `ch24-l05` | `STANDARD` | **Guided Quran reading: Al-Kawthar 108:1.** Read **إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ** once as a whole. Identify **إِنَّا**, the **نَا** on **أَعْطَيْنَاكَ** as the verb's doer, and **كَ** as “you” with supplied glosses. The same surface **نَا** has different roles because it attaches to different hosts; no full Form IV lesson. | Choose who gives, who receives, and which **نَا** is attached to **إِنَّ**. No verse-number trivia or unsupported tafsir. |
| 6 / `ch24-l06` | `REVIEW` | **Mixed review.** Mix two fresh authored examples with short, verified excerpts from 2:173, 43:3, and 108:1. Correct a deliberately reversed case statement and a particle-versus-verb **نَا** confusion. | Demonstrate the rule across different contexts; no new grammar. |
| 7 / `ch24-test` | `REVIEW` + `assessment` | **Chapter 24 final test.** Twelve server-graded questions, `assessment.type = CHAPTER_TEST`, `pass_score_percent: 80`. | 10/12 passes; 9/12 fails. Use fresh authored examples alongside bounded, verified Quran targets. |

### Sample learner-facing explanations

> **إِنَّ الْبَيْتَ كَبِيرٌ** — “Indeed, the house is big.” After **إِنَّ**, **الْبَيْتَ** is its noun (**اسم إنّ**) and is **منصوب**. **كَبِيرٌ** tells us about the house (**خبر إنّ**) and remains **مرفوع**.

> **إِنَّا** means “Indeed We.” Here **نَا** is attached to **إِنَّ**. In **أَعْطَيْنَاكَ**, **نَا** is attached to the verb and tells us who gave. Read the whole word before assigning a pronoun's job.

These are model explanations, not finalized Urdu copy or an authorization to publish. Arabic, English, Urdu, transliteration, and audio text need an editor pass together.

### Final-test blueprint

| Outcome | Questions |
|---|---:|
| Meaning of **إِنَّ** in a complete sentence | 2 |
| Identify **اسم إنّ** and **خبر إنّ** in simple sentences | 3 |
| Choose correct case/ending and reject the reversed rule | 2 |
| Read **إِنَّا** and distinguish particle-attached from verb-attached **نَا** | 2 |
| Apply the taught skill to a new authored sentence | 2 |
| Bounded comprehension of one verified Quran excerpt | 1 |
| **Total** | **12** |

The 12 questions need individually unambiguous keys, plausible distractors, and feedback explaining *why* a reversed-case response is wrong. Do not grade the case of a predicate that is a phrase rather than a visibly inflected noun, or ask the learner for full analysis of untaught words in a Quran verse. Existing retry, completion, unlock, and reward behavior should be used rather than special-cased.

## 5. Map and implementation specification after approval

- Set chapter description to the two taught forms only. Use **إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ** as the hook with **إِنَّا** highlighted, but do not repeat it as the answer to every exercise.
- Set `parseText` to **إِنَّ اللَّهَ غَفُورٌ** (a bounded excerpt of 2:173) with tokens **إِنَّ = حرف توكيد ونصب**, **اللَّهَ = اسم إنّ منصوب**, **غَفُورٌ = خبر إنّ مرفوع**. Alternatively use the clearly labeled authored **إِنَّ الْبَيْتَ كَبِيرٌ**. Never label **اللَّهَ** `مفعول` or **إِنَّ** `حرف جر`.
- Align five map focus records with the five teaching lessons; review/test are separate. Replace “removes all doubt” with “adds emphasis to a statement.” Remove **نون الوقاية** from the **إِنَّا** focus record.
- Rewrite `ch24-l01`–`l05`, change `ch24-l06` to `REVIEW`, and add `ch24-test` in the canonical lesson schema. Update `seed.cjs` lesson registration, title, order, template and XP consistently. Preserve existing IDs; do not manufacture a second schema.
- If a `GRAMMAR_PARSE` role set cannot accurately represent **اسم إنّ** and **خبر إنّ**, use a narrower tap/choice question rather than mapping the noun to `OBJECT` or `SUBJECT`. Quran excerpts, authored practice, and explanatory paraphrases must remain distinguishable.
- Remove the wrong number lesson from Chapter 24 while recording a separate proposed numbers unit in the curriculum roadmap. Its placement and lesson count need their own owner decision; do not renumber subsequent chapters in this change.

## 6. Validation and release gate

1. Check the *current Studio database* against the fixture mirror before authoring or promoting anything; existing fixture text may not equal live content. Export Studio changes before a fixture rewrite and preserve unrelated Chapter 20–23 work.
2. Have Arabic and Quran reviewers verify exact Quran orthography, excerpt boundary, reference, case analysis, speaker/referent, zero-based highlights, and transliteration. Recheck **2:173**, **43:3**, and **108:1** in the final lesson cards. Keep 108:1 tafsir claims out unless separately sourced and approved.
3. Edit English and Urdu independently after Arabic is locked. Remove corrupted characters, semantic mismatches, mixed-script placeholders, and false case feedback from *every* teaching, review, and scored question. Regenerate Arabic-text audio whose hash changed.
4. Validate canonical lesson schema/fixtures and Urdu audit; run a semantic answer-key audit beyond JSON validity. Stage Chapter 24 alone, walk all seven items in English and Urdu on Android/web, and check audio, RTL, highlights, 9/12 versus 10/12, retries, unlock, and learner progress.
5. Decide how to notify or reset progress for learners who completed the incorrect Lesson 2; the false scored rule makes a simple silent content replacement inadequate. Promote only through the scoped content workflow after `content:check`; **never run the full production seed**.

## 7. Owner decisions

Approve or amend the seven-item structure, the three Quran anchors, the twelve-question test, the separate future numbers unit, and the revisit policy for learners who completed the inaccurate chapter. This document is a proposal; it does not modify learner-facing fixtures, Studio content, or the database.

## 8. Owner-approved review amendments (2026-09-24)

A pre-build review confirmed the defects in section 3 against the old fixtures (reversed case rule in Lesson 2, 43:3 credited to 6:12, the Numbers lesson, the corrupted عَيِّ上图) and found five points to change. The owner approved all five:

1. **Numbers already have a home.** Chapter 48 teaches *Numbers 1–20*, so no separate numbers unit is proposed; Lesson 4 simply drops numbers.
2. **رَحِيمٌ in 2:173** is described as a second nominative description of Allah. Classical i‘rāb commonly reads it as a second خبر, so the lessons neither call it an adjective nor a second خبر; they only rule out a second اسم إنّ.
3. **Illustrations.** Every Chapter 24 discover card is listed in `Docs/lesson-illustrations-needed.md` / `.csv` (36 cards, 29 scenes).
4. **إِنَّنَا** is taught as recognition in Lesson 3: the fuller spelling of إِنَّا with the same meaning, from Ali 'Imran 3:193, which Chapter 20 already showed.
5. **Revisit policy.** No progress reset. Completed lessons show the automatic "Updated" notice (`contentUpdatedAt`), and the new `ch24-test` does not lock anyone who already finished the chapter (`addedAt`).

Built as: `ch24-l01`–`l05` rewritten, `ch24-l06` a `REVIEW` (fixture renamed `chapter-24-lesson-06-review.json`), `ch24-test` new at order 7 (12 questions, 10/12 to pass), map and seed aligned, promoted with `scripts/promote-chapter-24.cjs`.
