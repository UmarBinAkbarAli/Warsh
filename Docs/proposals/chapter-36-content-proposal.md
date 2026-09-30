# Chapter 36 — The Maṣdar: Verbal Nouns in Context

**Status:** Proposal only — not approved or implemented
**Evidence reviewed:** Chapter 36 map and all six registered lesson fixtures; adjacent Chapters 35 and 37; cited source files and seed/schema conventions; product principles; and an attempted read-only `content:check` on 2026-09-30. The command did not complete because the Prisma/PostgreSQL connection terminated unexpectedly, so fixture/database parity is unverified. No database changes were made.
**Scope:** Chapter 36 lesson content, assessment, and continuity with Chapters 35 and 37. No fixture, seed, or database changes are included.

## Recommendation

Keep the chapter's useful core: recognize **المصدر** as a verbal noun, connect it to a verb without treating every form as mechanically predictable, and read it in phrases and Quranic passages. Rebuild the five teaching lessons around accurate word formation, the maṣdar's noun behavior, and contextual reading. Replace unsupported religious and linguistic claims with specific, cited examples. Turn the current broad “Peak 1 mastery” review into an integrated review of Chapters 34–36, then add a separate checkpoint.

The current six lessons are not enough as a reliable chapter outcome—not because the topic automatically requires many lectures, but because the current lessons make contradictory claims about patterns, roots and examples, repeat the same hook, and never check whether learners can identify or use the forms. Five focused teaching lessons, an integrated review, and a short chapter test (seven lessons total) provide a clearer and measurable progression. Do not expand into every maṣdar pattern: Form I verbal nouns are varied, and even productive derived-form patterns need qualification and qualified Arabic review.

## Current-state audit

The map names Chapter 36 **المصدر: The Verbal Noun**, hooks Al-Baqarah 2:43, and has four focus entries. The fixtures contain five `STANDARD` lessons plus one `REVIEW`, so the map does not account for all six. Four lessons reuse the same Al-A'la 87:1 hook; Lesson 5 switches to 87:2, which still does not contain the maṣdar its lesson says appears there. Lesson 6 claims to review Chapters 34–36, but it omits Chapter 35's future markers. It revisits Al-Fatiha rather than integrating the chapter's actual scope. No fixture contains a `CHAPTER_TEST`.

The map cites `reader_lecture_36_masdar_verbal_noun.md`, while all lesson fixtures cite `reader_lecture_36_verbs.md`; neither file exists at the referenced `warsh-backend/prisma/` path. These stale citations are a source-metadata issue. The attempted `content:check` did not complete, so it provides no evidence for or against fixture/database divergence.

### Issues and fixes

| Priority | Issue | Proposed fix |
|---|---|---|
| Critical | **The Form II maṣdar rule is wrong and contradicted by the examples.** Lesson 2 states Form II uses **تَفْعَالٌ**, gives **كَتَّبَ → تَكْتَابٌ**, then says **تَفْعِيلٌ** in its examples/close. Its closing list also misfiles **تَسْبِيحٌ** (from Form II **سَبَّحَ**) under Form I, and **كِتَابَةٌ** (from Form I **كَتَبَ**) under Form II. | Teach **تَفْعِيلٌ** as a common Form II pattern with verified examples. Remove **تَكْتَابٌ** and the contradictory **تَفْعَالٌ** rule; classify each verb–maṣdar pair by the verb's actual form. State that templates are common patterns, not exception-free guarantees for every derived verb. |
| Critical | **إِقْرَارٌ is assigned to the wrong verb form.** Lesson 2 calls **أَقَرَّ** Form II and then identifies **إِقْرَارٌ** as a Form IV pattern. | Correct the morphology consistently: **أَقَرَّ** here is Form IV and **إِقْرَارٌ** is its maṣdar. Review every past/imperfect/maṣdar triplet in both languages with a morphology reference. |
| Critical | **إِيمَانٌ is mislabeled as Form I and confused with a finite verb.** Lesson 3 says **إِيمَانٌ** is the maṣdar of **آمَنَ (Form I)**, then says it appears on the Quran's first page as **يُؤْمِنُونَ بِالْغَيْبِ**. **آمَنَ** is Form IV; **يُؤْمِنُونَ** is an imperfect verb, not the noun **إِيمَانٌ**. | Correct the form classification. If teaching the maṣdar in Quranic context, use an exact occurrence such as **إِيمَانَهُمْ** in Al-An'am 6:82; otherwise label **يُؤْمِنُونَ** in Al-Baqarah 2:3 only as a related verb form. Remove the inaccurate first-page claim. |
| Critical | **The lesson says the Quran begins with an ayah from Surah Al-A'la.** Lesson 1 calls **سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى** “where the Quran begins.” It is Al-A'la 87:1, not the Quran's opening. | Say “Surah Al-A'la opens with…” and cite 87:1. Preserve the distinction between the isolated imperative **سَبِّحْ** and its connected Quranic form **سَبِّحِ اسْمَ** (the kasra is heard before hamzat al-waṣl); **تَسْبِيحٌ** is a related maṣdar supplied for morphology, not a word in that verse. |
| High | **The examples overstate how predictable maṣdars are.** Lesson 1 says “each verb form produces its own pattern,” and Lesson 2 closes with “the verb form tells you what pattern to expect.” This can lead learners to infer Form I maṣdars from a single template; Form I maṣdars have several patterns and are commonly learned lexically. | Teach common patterns as recognition aids only. Make the Form I objective “recognize and learn common verb–maṣdar pairs,” not “derive any maṣdar.” For derived forms, teach a small verified set of common templates and flag variation where it matters. |
| High | **The Arabic term card risks teaching a different technical term.** Lesson 1 labels **الْمَصْدَرُ** as **اسم مصدر**; in Arabic grammar, **اسم المصدر** is itself a distinct term, not simply the Arabic translation “verbal noun.” | Use **الْمَصْدَرُ** as the term and define it in clear Arabic as a noun denoting an action, process, or state. Have an Arabic editor check all terminology and avoid introducing **اسم المصدر** unless that separate category is intentionally taught. |
| High | **The Quran-focused lesson does not distinguish an attested word from a grammatical concept or constructed phrase.** Lesson 3 uses **تَوْحِيدٌ** and **إِخْلَاصٌ** in a lesson titled “The maṣdar in the Quran” without verse references; Lesson 6 claims five devotional words “fill” the Quran and appear on every page. Some terms may be useful Islamic vocabulary, but the lesson neither demonstrates that each exact surface form occurs in the Quran nor supports the frequency claim. | Select actual, cited Quranic maṣdars for Quran-reading objectives. Mark constructed or explanatory vocabulary clearly as such, not as Quran quotations. Remove “every page,” “hundreds,” “the Quran opens up,” and similar unsubstantiated claims. Separate language analysis from doctrinal exposition. |
| High | **Lesson 5 falsely says the command and its maṣdar occur together in Al-A'la and overgeneralizes the relation.** It says **سَبِّحْ** and **تَسْبِيحٌ** both appear in the ayat. Al-A'la 87:1 contains connected **سَبِّحِ اسْمَ**; it does not contain **تَسْبِيحٌ**. Its hook Al-A'la 87:2 (**الَّذِي خَلَقَ فَسَوَّىٰ**) contains neither target. The reveal also says every command has a maṣdar that Quranic text sometimes “uses in its place,” falsely suggesting a general grammatical substitution. | Present **سَبِّحْ → تَسْبِيحٌ** as a related command/maṣdar pair and identify which form is actually quoted. Do not imply that verbs and maṣdars are freely interchangeable. Align the lesson hook to a passage that actually contains the target maṣdar, such as a verified example with **الصَّلَاةَ** or **ذِكْرٌ**, and cite the exact verse. |
| High | **Lesson 5 does not match its title or its claimed passage.** The title promises **الذِّكْرُ وَالصَّلَاةُ**, but its primary hook is Al-A'la 87:2. It then cites a different passage, Al-Ankabut 29:45, without framing the switch; the Al-A'la line cannot support its discussion of prayer. | Choose one coherent, cited passage for the main reading. If comparing **الصَّلَاة** across Al-Baqarah 2:43 and Al-Ankabut 29:45, label them as separate examples and explain their distinct grammatical roles; do not imply that **أَقِيمُوا** and **الصَّلَاة** share a root or that the verse contains a matching maṣdar of **أَقَامَ**. |
| High | **The preposition lesson repeats rather than extends prior material and has an overbroad explanation.** The course has already taught prepositions/genitive relationships. Lesson 4 repeats **بِـ، مِنْ، فِي، لِـ**, gives isolated phrases not consistently labeled as Quranic or constructed, repeats **عَلَى** in its list, and says every item after any preposition simply “takes genitive case”—including pronouns, which are indeclinable but occupy a genitive position. | Make this a transfer lesson: learners identify a maṣdar after a preposition and explain its role, building on prior genitive knowledge. Label phrases as Quranic or constructed; trim and de-duplicate the list. Explain that nouns show genitive marking while attached pronouns are in a genitive syntactic position rather than taking visible case endings. |
| High | **The review is not an honest or complete review of its claimed scope.** Lesson 6 says “Everything from chapters 34–36” is included, but it does not assess Chapter 35's **سَـ / سَوْفَ** future markers or all Chapter 36 outcomes. It repeats a four-prefix mnemonic that Chapter 34 itself needs to qualify (**تَـ** can be ambiguous and endings/context matter), and it pulls Al-Fatiha into a maṣdar review without explaining the transfer. | Rebuild it as retrieval across the declared chapters: Chapter 34 imperfect recognition, Chapter 35 future marking, and Chapter 36 maṣdar recognition/use. Say what is retrieval versus newly taught. Preserve agreement context and endings in the prefix review; do not claim the prefix alone tells “who.” |
| Medium | **The chapter has no explicit checkpoint and its review is titled “Peak 1 Mastery” without measurable mastery criteria.** The six fixtures contain no `CHAPTER_TEST`, and “Peak 1” is not defined in the chapter map. The close uses absolute and promotional language (“earned the foundation of Quranic Arabic,” “words that open the Quran”). | Keep the existing review, clearly define or remove the “Peak 1” label, and add a short `REVIEW`-template checkpoint with the schema-supported top-level `assessment.type = CHAPTER_TEST` payload. State observable outcomes and replace inflated claims with a calm, accurate close. |
| Medium | **Metadata and teaching material are inconsistent.** The map has four focuses for six fixtures; five lessons reuse Al-A'la 87:1/87:2; several hook passages do not contain the lesson's target; map and fixture source paths differ and are both absent. | Align map title, description, hook, focus records, lesson sequence, Quran citations, and source metadata in one approved change. Use the proposal as the source only after approval; otherwise remove stale references instead of leaving nonexistent lecture paths. |
| High | **Several sentence-building items are malformed or semantically unnatural, so the exercises assess defective Arabic.** Examples include **هُوَ تَسْبِيحٌ فِعْلٌ** for “Glorification is an action,” **إِيمَانٌ بِاللَّهِ هُوَ** for “Faith in Allah is the foundation,” and **الْمُسْلِمُ فِي التَّوْحِيدِ اللَّهِ** for “The Muslim is in the oneness of Allah.” One Urdu target also contains the Russian word **благородный**. | Replace or remove each affected build-sentence prompt, answer order, distractor set, translation, and feedback as a unit. Have a qualified Arabic editor supply natural, fully vocalized sentences at the taught level, then verify the Urdu independently; do not just repair the English gloss while leaving broken Arabic tiles. |
| Medium | **The lessons need a language and exercise-quality pass.** Lesson 1 contains the typo “glorfiy,” unexplained Chinese text **张口** in English/Urdu copy, a mixed-language Arabic title (**الْمَصْدَرُ چیست؟**), and a closing Urdu sentence containing stray Cyrillic characters. Lesson 2 repeats **张口**. Translation questions also repeat the same ordering and make answer positions predictable. | Proofread every English, Urdu, Arabic, and transliteration field; replace the mixed-language title with reviewed Arabic; remove stray CJK/Cyrillic text; vary exercise order and answer position; use feedback that teaches the relevant form/pattern instead of echoing a gloss. |

## Proposed lesson sequence

Keep the current five teaching slots and the integrated review, but rewrite them for a controlled scope. Add a separate checkpoint. This gives learners a complete cycle—understand, recognize, apply, retrieve, demonstrate—without trying to teach the entire Arabic maṣdar system in one chapter.

| Order / ID | Template | Proposed lesson | Scope and design |
|---|---|---|---|
| 1 — `ch36-l01` | `STANDARD` | **What Is a Maṣdar?** | Pair a known finite verb with its maṣdar and contrast their functions: the verb carries tense/person; the maṣdar names an action, process, state, or result as a noun. Use **سَبِّحْ → تَسْبِيحٌ** as a related pair. Explain that the isolated imperative is **سَبِّحْ**, while Al-A'la 87:1 reads **سَبِّحِ اسْمَ** in connected recitation; **تَسْبِيحٌ** is not in that ayah. Remove “The Quran begins with.” |
| 2 — `ch36-l02` | `STANDARD` | **Learn Common Form I Verb–Maṣdar Pairs** | Teach a small set such as **عَلِمَ → عِلْمٌ**, **قَرَأَ → قِرَاءَةٌ**, and **كَتَبَ → كِتَابَةٌ** as lexical pairs. Show that Form I has multiple maṣdar patterns; practice recognizing/recalling the taught pairs instead of deriving unseen ones. |
| 3 — `ch36-l03` | `STANDARD` | **Recognize Common Derived-Form Maṣdars** | Teach a bounded set with reliable examples: Form II **عَلَّمَ → تَعْلِيمٌ**, **حَلَّلَ → تَحْلِيلٌ**, and Form IV **أَرْسَلَ → إِرْسَالٌ**, **أَقَرَّ → إِقْرَارٌ**. Explain that a pattern is a helpful clue, not a guarantee for every verb. Correct **آمَنَ → إِيمَانٌ** as Form IV if retained. |
| 4 — `ch36-l04` | `STANDARD` | **Use the Maṣdar as a Noun** | Apply earlier noun skills to identify a maṣdar in a sentence or phrase—as subject, object, or in an iḍāfa. Make case depend on its role; do not suggest that “maṣdar” itself assigns a case. Use well-vocalized, reviewed examples. |
| 5 — `ch36-l05` | `STANDARD` | **Read Maṣdars in Quranic Context** | Read a small number of exact, cited examples. Distinguish the surface word present in the ayah from a related root/verb or a supplied maṣdar. Examples may include **الصَّلَاةَ** in Al-Baqarah 2:43 or **الصَّلَاةَ / ذِكْرُ اللَّهِ** in Al-Ankabut 29:45; contextualize each and keep theological explanation outside the grammar claim. |
| 6 — `ch36-l06` | `REVIEW` | **Integrated Review: Verbs and Maṣdars** | Revise the current Peak 1 review into a true retrieval lesson for Chapters 34–36: imperfect clues, future marking from Chapter 35, and Chapter 36 maṣdar form/function. Include preposition/genitive and iḍāfa only as retrieval if previously taught. Do not claim full mastery of all three chapters unless the tasks actually assess it. |
| 7 — `ch36-l07` | `REVIEW` | **Chapter 36 Checkpoint** | Add the top-level `assessment` payload with `type: CHAPTER_TEST` in the existing supported format. Test maṣdar-versus-finite-verb recognition, taught lexical pairs, the limited Form II/IV patterns, maṣdar noun roles, and interpretation of one exact cited verse. Keep Chapter 34/35 retrieval to one or two clearly labeled integrative items; do not grade a complete conjugation or unseen Form I maṣdar derivation. |

## Checkpoint blueprint

A 10–12 item chapter test can cover:

- 2 items distinguishing a verbal noun from a finite verb in a short context;
- 2 items retrieving the taught Form I verb–maṣdar pairs without inviting an unsupported general rule;
- 2 items recognizing the taught Form II/IV patterns, including one contrast between **تَفْعِيلٌ** and **إِفْعَالٌ**;
- 2 items identifying a maṣdar's noun role/case in a phrase or sentence;
- 2 items locating and interpreting a maṣdar in an exact, cited Quranic excerpt; and
- 0–2 integrative retrieval items on imperfect/future forms from Chapters 34–35.

Use mixed exercise types and balanced answer positions. Distractors should expose likely confusions—maṣdar versus verb, root versus pattern, and exact Quran wording versus a related form. Do not assess unseen Form I maṣdars as if they were rule-generated, broad tafsir, or claims about frequency across every Quran page.

## Continuity with surrounding chapters

- **Chapter 35 → Chapter 36:** Chapter 35 introduces future marking on imperfect forms; Chapter 36 should not silently claim to review the preceding sequence while omitting it. Include brief labeled retrieval in the integrated review, not a second full future lesson.
- **Chapter 34 → Chapter 36:** Chapter 34 introduces the imperfect and common agreement clues. Review only what that chapter actually teaches, with its prefix/ending/context qualifications; do not reduce it to “one prefix always identifies who.”
- **Chapter 36 → Chapter 37:** Chapter 37 begins feminine verb forms. Chapter 36 should establish the distinction between a finite verb and a verbal noun, but not pre-teach a full agreement paradigm. Its integrated review can help learners carry forward the verb/noun distinction without delaying Chapter 37's new target.
- **Earlier Quran reading:** Quranic word roots and verse excerpts can provide meaningful review, but repeated use of Al-Fatiha or Al-A'la must be deliberate retrieval. It cannot be presented as newly analyzed or as proof of complete Quran comprehension when the earlier chapters have already used those passages.

## Arabic and Quran-content review

- The maṣdar names an action/state without tense/person; English equivalents vary by context. Do not flatten every example to an English “-ing” form. [Michigan State University, Elementary Arabic II: Maṣdar and Verb](https://openbooks.lib.msu.edu/elemarabicll/chapter/grammar-5/)
- Form I maṣdars have many pattern variations; the reference also describes **تَفْعِيلٌ** as the most common, but not the only, Form II verbal-noun pattern. [Ryding, *A Reference Grammar of Modern Standard Arabic*, §§9–10 on Form I/II verbal nouns](https://mcoed.edu.ng/library/ebooks/resources/Modern_Standard_Arabic_Reference_Grammar.pdf)
- The root dictionary classifies **سَبَّحَ** as Form II and **تَسْبِيحٌ** as its Form II verbal noun; this pair must not be listed as a Form I example. [QAC, root س-ب-ح](https://corpus.quran.com/qurandictionary.jsp?q=sbH)
- **كِتَابَةٌ** is a verbal noun of Form I **كَتَبَ**, not Form II. [Lane's Arabic-English Lexicon, root ك-ت-ب](https://www.laneslexicon.com/word/%D9%83%D8%AA%D8%A8/n36626)
- Al-A'la 87:1 contains the imperative **سَبِّحِ** and the noun **اسْمَ**; it does not quote **تَسْبِيحٌ**. [QAC, Al-A'la 87:1](https://corpus.quran.com/wordbyword.jsp?chapter=87&verse=1)
- Al-Baqarah 2:3 contains **يُؤْمِنُونَ** (“they believe”), not the noun **إِيمَانٌ**. The QAC root entry classifies **إِيمَان** as a Form IV verbal noun and lists its occurrence in Al-An'am 6:82 (**إِيمَانَهُمْ**). [QAC, Al-Baqarah 2:3](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=3); [QAC, root أ-م-ن](https://corpus.quran.com/qurandictionary.jsp?q=Amn)
- **الصَّلَاةَ** in Al-Baqarah 2:43 follows the imperative **أَقِيمُوا** as its object. This is a useful syntax example, but the two words are not from the same root. [QAC, Al-Baqarah 2:43](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=43)
- Al-Ankabut 29:45 contains **الصَّلَاةَ تَنْهَى** and later **وَلَذِكْرُ اللَّهِ أَكْبَرُ**, making it a possible short comparison if both parts are cited and parsed correctly. [QAC, Al-Ankabut 29:45](https://corpus.quran.com/grammar.jsp?chapter=29&verse=45)

These sources support the specific corrections; a qualified Arabic/Quran-content reviewer should verify vocalization, verb form, maṣdar, case, translation, ayah boundaries, and interpretive wording before publication.

## Implementation checklist after approval

1. Align the Chapter 36 map, all seven fixtures, lesson titles, hooks, focus records, references, and checkpoint outcomes.
2. Correct every verb-form/maṣdar pair; remove unsupported templates, the Form I label on **آمَنَ**, and claims that an example occurs in a verse when only a related word does.
3. Rebuild Quran-reading content around exact ayat with surah/ayah references; distinguish quotations, constructed grammar examples, lexical relatives, and contextual interpretation.
4. Rewrite the current review to include Chapter 35 and the actual Chapter 36 outcomes; add the checkpoint in the schema-supported format and seed order.
5. Replace nonexistent source references with the approved proposal path after owner approval, or remove stale references. Do not treat this proposal as approved content before that decision.
6. Proofread all English and Urdu learner-facing fields, remove stray Chinese characters and typos, and vary exercise types/answer positions.
7. Run `npm run db:validate-fixtures` and `npm run content:check` from `warsh-backend` after approved fixture edits. Never push fixtures over divergent Studio content or run the production seed for this content work.
8. Plan for “Updated” notices if already-published lesson content changes.

## Acceptance criteria

- The learner can explain what a maṣdar does, recognize it as a noun, and distinguish it from a finite verb without being told that every English “-ing” word maps directly to one Arabic pattern.
- Every root, verb form, maṣdar, case label, vocalization, translation, and verse citation is accurate and reviewed.
- Form I variation is explicit; Form II/IV examples are correct and presented as a bounded pattern set, not an exception-free universal derivation rule.
- Quranic text is exact and cited; a related verb/root is not mislabeled as the maṣdar actually occurring in the verse.
- The review meaningfully retrieves Chapters 34–36, including Chapter 35, and the checkpoint measures Chapter 36's stated objectives.
- Chapter 36 hands off clearly to Chapter 37 feminine verb forms without claiming mastery that the lessons have not established.
- The map and fixtures agree, copy is clean in English and Urdu, and practice does not telegraph every answer through its position.
- Approved fixtures pass schema validation and database parity checks before publication.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–5 | `ch36-l01`–`ch36-l05` | `STANDARD` | `chapter-36-lesson-01.json`–`-05.json` |
| 6 | `ch36-l06` | `REVIEW` | `chapter-36-lesson-06-review.json` |
| 7 | `ch36-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-36-lesson-07-final-test.json` |

**Corrections**

1. The checkpoint is `ch36-test`, not `ch36-l07` (S2).
2. **الصَّلَاة is a poor maṣdar example.** It is usually classed as اسم مصدر (the maṣdar of **صَلَّى** is **تَصْلِيَة**) — exactly the term Lesson 1 is told to avoid. Lesson 5 uses clear Quranic maṣdars instead: **ذِكْرُ اللَّهِ** (29:45, verified, from **ذَكَرَ**), **نَصْرُ اللَّهِ وَالْفَتْحُ** (110:1, from **نَصَرَ / فَتَحَ**, already read in Chapter 33) and **إِيمَانَهُمْ** (6:82, verified, Form IV). Keep 2:43 **الصَّلَاةَ** only as the object of **أَقِيمُوا**, not as a maṣdar.
3. Chapter 39 will meet **لِإِيلَافِ** (106:1), a Form IV maṣdar; name it in Lesson 3's Form IV set as a preview.
