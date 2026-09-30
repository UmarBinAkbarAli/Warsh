# Chapters 26–68 — Proposal Review and Shared Build Rules

**Status:** Review of the 43 chapter proposals (`chapter-26-content-proposal.md` … `chapter-68-content-proposal.md`), 2026-10-01. Proposals only — nothing here changes a fixture, the map or the database.

Every proposal now ends with a **Review amendments (2026-10-01)** section. That section holds the final lesson plan (order, ID, template, fixture file) and the chapter-specific corrections found in this review. **Where the amendments and the body of a proposal disagree, the amendments win.** The rules below apply to all 43 chapters and are not repeated in each file.

## 1. How the review was done

- Every proposal was read in full against the current fixtures, the curriculum map (`curriculum-books2-4.cjs`, `-books5-6.cjs`, `-books7-8.cjs`), the built Chapters 1–25, the Conversation Labs roadmap and the neighbouring proposals.
- Every Quran reference in the 43 files (214 verses) was fetched from the quran.com API (Uthmani text) and checked against the Arabic quoted beside it. Wrong wording, wrong references and misattributed phrases found this way are fixed in the amendments.
- The proposals' descriptions of *current* fixture defects were spot-checked, not re-verified line by line; the rebuild replaces those lessons anyway.

## 2. Shared rules for every chapter (S1–S13)

These settle the questions most proposals left open ("confirm the threshold", "decide the revisit policy", "have an editor sign off first"). They follow the precedent of the built Chapters 20–25.

**S1 — Chapter test.** Every chapter ends with a distinct `REVIEW` lesson carrying `assessment: { type: "CHAPTER_TEST", chapter_order: N, pass_score_percent: 80, questions: [...] }` (see `chapter-24-lesson-07-final-test.json`). Default length **12 questions, 10/12 to pass**; a capstone may use 16 (13/16), as Chapter 23 does. Question IDs `chNN-test-q01…`. Answer positions are shuffled per item in the fixture (the player never shuffles). Where a proposal says "10–12 items", "8–10 items" or "do not invent a threshold", read **12 at 80 %**.

**S2 — Test ID.** The test row is always the new ID **`chNN-test`**. Never convert an existing lesson ID into the test: learners who completed that row would already count as having passed. Where a proposal names the test `chNN-l07`, `chNN-l08` etc., the amendments rename it.

**S3 — Existing IDs and surplus rows.** Keep existing lesson IDs and update them in place so progress stays attached (promote scripts for Ch24/25 are the model). IDs need not match display order (Ch21 precedent). When a plan has fewer non-test slots than existing rows, the surplus row is set to `DRAFT` by the promote script — never deleted (deleting cascades `Progress`).

**S4 — Fixture file names follow display order**, not the ID: `chapter-NN-lesson-0X.json`, `-review.json` for the review, `-final-test.json` for the test, `-conversation-lab.json` / `-spoken-phrases.json` for labs and phrase lessons. Rename files when order changes (fixtures map to rows by position).

**S5 — Learners who finished the old content.** Settled by the owner for Chapter 24 and applied since: progress is not reset; the database trigger stamps `contentUpdatedAt` / `addedAt`, so learners who completed a rewritten lesson get the automatic "Updated" notice and a newly added lesson never locks a finished chapter. Every proposal's "decide the revisit policy" item is answered by this rule.

**S6 — Arabic/Quran review is not a build gate.** The owner does the scholarly and pedagogical review of Chapters 9–72 personally. Proposals that say "have a qualified Arabic/Quran/Urdu editor approve before implementation" mean: build to the corrected proposal, record "Not done: scholarly review of the Arabic, Quran context and Urdu wording" in `Docs/warsh-status.md`, and let the owner review in Studio. Fatwa-like or ritual statements (Ch60, Ch62) are still removed rather than written.

**S7 — Quran text.** Every Quran string anywhere in a fixture (hook, reveal, cards, exercises, test prompts) is copied from the canonical text, carries surah:ayah, and passes `npm run quran:audit-fixtures` plus the stricter excerpt check used for Ch20–23. Excerpts that start mid-verse drop nothing inside the quoted span; a dropped leading **فَ / وَ** is written as an excerpt (e.g. 94:5 is **فَإِنَّ مَعَ الْعُسْرِ يُسْرًا**; **إِنَّ مَعَ الْعُسْرِ يُسْرًا** is 94:6). Constructed Arabic never uses ayah styling, recitation audio or a verse label. Quran cards are illustrated symbolically — never Allah, prophets, Maryam, angels, jinn or the devil.

**S8 — Illustrations.** Every discover card, grammar cards included, is mapped to a reused image or a new scene in `Docs/lesson-illustrations-needed.md` / `.csv` (the owner draws). No human facial features in any scene.

**S9 — Source provenance.** The map and fixtures cite this chapter's proposal path as the source (Ch24 precedent). Missing `reader_lecture_*.md` / `book*_lesson*.md` paths are removed, not recreated.

**S10 — Map alignment.** Title, `titleAr`, description, hook, examples, parse tokens, conversation and focus records in the curriculum map are rewritten to the final plan in the same change as the fixtures.

**S11 — Present tense before Chapter 34.** Chapters 26–33 may show imperfect verbs from the Quran (Al-Kafirun's **أَعْبُدُ / تَعْبُدُونَ**, 81:26 **تَذْهَبُونَ**, 2:151 **تَعْلَمُونَ**) only as glossed chunks. Their tense or form is never taught or scored before Chapter 34.

**S12 — Terms not yet taught.** Grammar labels that belong to a later chapter (**حال**, **تمييز** — Ch71; **جواب الطلب** — Ch69; **المفعول المطلق** — Ch58) may appear only as a meaning gloss or a "you will meet this later" note before their chapter, and are never scored.

**S13 — Build and promotion.** One scoped promote script per chapter or chapter group (`scripts/promote-chapter-NN.cjs`, modelled on `promote-chapter-25.cjs`), staging first, `content:check` clean before production, never the full seed. Verification per chapter: fixture validation, Urdu and Quran audits, backend tests, a staging API walk (test locked until regular lessons are done, key stripped, 9/12 fails, 10/12 passes, replay 0 XP), catalogue audio for new Arabic.

## 3. Conversation Labs

The CL1–CL9 labs are built; the roadmap (`conversation-labs-curriculum-proposal.md`) lists CL10–CL18 as provisional anchors to be decided per host chapter. This review places them as follows. A lab is a `SPOKEN_PHRASES` lesson with a `spoken_phrases.lab` block (Pen sections 25–26); update the roadmap's CL table in the same change as each host chapter, as was done for CL8/CL9.

| Lab | Host | Row | Decision |
|---|---|---|---|
| CL10 Asking a Scholar → **Asking a Teacher** | Ch31 | `ch31-l06` rebuilt in place | Adopt; rename to "Asking a Teacher" (language questions only) |
| CL11 Daily Routine → **Daily Routine for Two** | Ch38 | new `ch38-cl11` | **Owner decision D3** — recommended yes |
| CL12 At the Mosque | Ch40 | `ch40-l06` rebuilt in place | Adopt |
| CL13 Food and Hospitality | Ch43 | `ch43-l04` converted | Adopt |
| CL14 Time and Travel Planning | Ch48 | `ch48-l05` rebuilt in place | Adopt; the Ch48 "ask the time and arrange a meeting" lab **is** CL14 |
| CL15 Asking for Help | Ch50 | `ch50-l04` converted | Adopt; the Ch50 dialogue lesson **is** CL15 |
| CL16 Travel and Hajj | Ch60 | `ch60-l04` converted | Adopt; transport and places, not scheduling (CL14 owns time) |
| CL17 At the Market | Ch61 | `ch61-l03` converted | Adopt; the Ch61 shopping dialogue **is** CL17 |

Ch52's proposed "Conversation Lab" is **not** on the roadmap and would sit two chapters after CL15; it becomes a `STANDARD` dialogue-reading lesson (see Ch52 amendments). Ch57's khutbah lesson stays a listening/shadowing `SPOKEN_PHRASES` lesson, not a lab.

## 4. Topic ownership across Chapters 26–68

The proposals repeatedly teach the same topic as new in several chapters. Each topic below has one owning chapter; every other chapter retrieves it briefly and names the owner.

| Topic | Introduced / owned | Later chapters = retrieval only |
|---|---|---|
| Basic iḍāfa | Ch3 | Ch26 layered chains + adjective attachment; Ch40 L2 demonstrative inside the possessor; Ch47 L3 SMP nūn deletion; Ch49/52 phrase boundaries; Ch55 L6 formal iʿrāb terms; Ch63 consolidation |
| Demonstratives, plural and non-human agreement | Ch1, Ch9, Ch14, Ch15 | Ch26, Ch40, Ch62 |
| Phrase vs sentence (**هَذَا الْكِتَابُ / هَذَا كِتَابٌ**) | Ch4 L5 | Ch62 L2 |
| Relative pronouns **الَّذِي / الَّتِي / الَّذِينَ** | Ch6, Ch8, Ch18 | Ch40 L4 adds the descriptive clause after an indefinite noun; Ch49 L4 adds the resumptive pronoun |
| Prepositions | Ch16, Ch21; Ch27 owns meanings and attached forms | Ch36 L4, Ch55 L5 |
| Feminine past **ـتْ** | Ch8 | Ch17, Ch28, Ch37 |
| **إِنَّ** / **لَيْسَ** | Ch24 / Ch25 | Ch29 L4, Ch52, Ch53, Ch58 L5, Ch65 L5 |
| Sisters of **إِنَّ** (**أَنَّ، كَأَنَّ، لَكِنَّ، لَعَلَّ، لَيْتَ**) | Ch49 L2 (meaning + shared case pattern, recognition) | Ch58 L5 |
| Imperfect core forms | Ch34 | Ch37 feminine forms, Ch38 dual forms, Ch51 L2 |
| **سَـ / سَوْفَ**, **لَنْ** recognition | Ch35 | Ch45 L2 (**لَنْ** as naṣb trigger) |
| Maṣdar | Ch36 | Ch39 (**إِيلَاف**), Ch58 L4 (**المفعول المطلق**) |
| Dual nouns, pronouns, indicative verbs | Ch38 | Ch51 L1 (past dual), Ch56 L6 (+ nūn deletion in iḍāfa), Ch63 L3 |
| Question words (**كَمْ + singular accusative noun**) | Ch31 | Ch42 |
| **إِذَا** clause and response | Ch32 | Ch33 L3, Ch53 |
| Numbers, clock time, measures | Ch48 (owner decision for Ch24) | Ch43, Ch60 |
| **لَمْ / لَمَّا** | Ch44 | Ch45 L3, Ch68 L2 |
| Three states of the imperfect; **لَا النَّاهِيَة** introduced formally | Ch45 | Ch46 (application), Ch51 L3, Ch68 L3 |
| Forming the positive imperative (**اِذْهَبْ، اُكْتُبْ**) | **Ch51 L4** | Ch45/46 contrast only, Ch57 L7, Ch68 L4 |
| Sound masculine plural case and nūn deletion | Ch13 recognition, Ch47 | Ch55, Ch63 L3 |
| **كَانَ**: **اسم مرفوع، خبر منصوب** | **Ch57 L4 (كَانَ only)** | Ch59, Ch64 |
| Sisters of **كَانَ** | **Ch65** | — |
| Conditional **مَنْ** + jussive | Ch52 L4 (recognition) | Ch54 L1, Ch68 L5 |
| Two-verb jussive conditionals **إِنْ / مَنْ** | **Ch68 L5 (owner decision D6)** | — |
| **لَوْ** | Ch67 | — |
| **لَا النَّافِيَة لِلْجِنْس** | **Ch62 L2 (owner decision D5)** | Ch52/54 (**لَا إِلَهَ إِلَّا هُوَ**, meaning only) |
| **اسم الآلة** | **Ch61 L4, bounded (owner decision D4)** | — |
| Weak verbs, five imperfect forms | Ch57 | Ch59, Ch68 L1 |
| Five nouns, maqṣūr, manqūṣ | Ch56 | Ch59 |
| **ظرف** | Ch66 | — |
| **حال**, **تمييز** | Ch71 (not in this set) | Ch53, Ch58, Ch59, Ch66: meaning only (S12) |

## 5. Owner decisions

All other open questions in the 43 proposals are answered by S1–S13 or by the amendments. These six remain the owner's; each proposal already follows the recommendation, so saying "yes to all" is enough to start building.

| # | Decision | Recommendation |
|---|---|---|
| D1 | Approve the 43 proposals with their amendments as the build specification | Yes |
| D2 | Build order | In chapter order, in groups of 3–5 chapters per promote script (26–29, 30–33, …), each group staging-verified before production |
| D3 | CL11 "Daily Routine for Two" in Chapter 38 | Yes — new row `ch38-cl11` at order 6 |
| D4 | **اسم الآلة**: keep one bounded lesson in Ch61 (**مِيزَان، مِكْيَال، مِفْتَاح، مِقَصّ، مِكْنَسَة** on مِفْعَال / مِفْعَل / مِفْعَلَة, recognition only) and fix Ch65's close so it no longer promises the topic for Book 8 | Yes — otherwise the topic disappears from the course, since Ch66 is adverbs |
| D5 | Keep **لَا النَّافِيَة لِلْجِنْس** in Ch62 as one lesson anchored on **ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ** (2:2) | Yes — it is on the map, nothing later teaches it, and the chapter otherwise has almost no new content |
| D6 | Add a two-verb conditional lesson (**إِنْ / مَنْ** + jussive condition and answer) to Ch68, using 49:14 **وَإِنْ تُطِيعُوا … لَا يَلِتْكُمْ** and 65:2 **وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا** | Yes — Ch67 promises it to Ch68 and the Ch68 proposal deferred it to no chapter |

## 6. Not covered

Chapters 69–72: proposals for 69 and 70 appeared while this review was in progress (still being written) and are not reviewed here; the Ch69 (**جواب الطلب**) and Ch71 (**الحال / التمييز**) hand-offs above assume those chapters keep their mapped topics.
