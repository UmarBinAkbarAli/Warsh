# Chapter 19 — Attached Pronouns in Context: content repair proposal

**Status:** Implemented 2026-09-23 (fixtures, seed, map, `scripts/promote-chapters-15-19.cjs`); staging-verified, production promotion pending. Deviations are recorded in `Docs/warsh-status.md` and the fixture `_meta._note`s.
**Scope:** Chapter 19 map, six existing fixtures/seed rows, and one proposed final test  
**Recommended structure:** Five teaching lessons, one review, one distinct final test

## 1. Purpose and chapter boundaries

Rename Chapter 19 from **“Attached Pronouns: Singular Possession”** to **“Attached Pronouns in Context: Reading Possession Accurately.”** Chapter 7 already introduces **ـِي، ـكَ / ـكِ، ـهُ / ـهَا** with nouns, plus simple possession questions. Four more introductory lessons on those same endings add little. Chapter 19 should answer the harder reading questions: *Is that final kasra a possessive? What is the pronoun attached to? Who is its referent? What happens to the noun when the ending attaches?*

Learners should finish able to:

1. distinguish **رَبِّ** in a genitive phrase from **رَبِّي** (“my Lord”); a kasra alone is not “my”;
2. find a singular pronoun attached to a noun and identify the owner/referent within a short sentence;
3. transfer Chapter 7's **ة → ت** observation from **مَدْرَسَةٌ → مَدْرَسَتُهَا** to a new feminine noun in context;
4. recognize, without deriving a new paradigm, that a familiar-looking ending can attach to a verb or a preposition with a *different function* from noun possession;
5. read a verified Quran occurrence, including the special written form **دِينِ** in Al-Kafirun 109:6 only with an explicit editorial explanation; and
6. pass a separate chapter test of those distinctions.

| Neighboring chapter | Boundary |
|---|---|
| 5 | **لِي كِتَابٌ** (“I have a book”) was a different possession expression. Retrieval may contrast it with **كِتَابِي**, not reteach the entire chapter. |
| 7 | The five singular noun-attached endings, basic owner/addressee contrast, and **ة → ت** in **مَدْرَسَتُهَا** are already taught. Reuse and transfer them, not another five-form flashcard list or first introduction to the spelling change. |
| 18 | Relative descriptions can occur as background reading; do not create a new relative-pronoun task here. Its proposed repair is not yet approved. |
| 20 | **ـنَا، ـكُمْ، ـهُمْ / ـهُنَّ** as plural noun-attached pronouns belong here. Chapter 19 can gloss one form encountered in a Quran quotation, but cannot teach or test the plural paradigm in advance. |

The title **“Al-Falaq — Tadabbur #3”** should not by itself imply that completing this chapter lesson unlocks the separate Tadabbur feature; verify the actual product flow before making that claim.

## 2. Findings that must be fixed

1. **A foundational false claim and a real highlight defect.** `ch19-l01` presents **رَبِّ الْعَالَمِينَ** in Al-Fatiha 1:2 as “my Lord.” [The Quranic Arabic Corpus](https://corpus.quran.com/wordbyword.jsp?chapter=1&verse=2) analyzes **رَبِّ** as a genitive noun in “Lord of the worlds,” not as a noun with first-person **ـي**. Its reveal uses zero-based highlight index `4` on a four-word ayah; fixture validation explicitly warns that the maximum is `3`. Lesson 6 correctly says **بِرَبِّ الْفَلَقِ** does *not* mean “my Lord” ([Al-Falaq 113:1](https://corpus.quran.com/wordbyword.jsp?chapter=113&verse=1)), contradicting Lesson 1.
2. **Invented word-in-verse claims.** Lessons 2–5 reuse the long Al-Baqarah 2:87 but discuss **بِأَنْفُسِهِمْ**, **أَنْفُسُهُمْ**, **بِهِ**, and **أَنْبِيَاءَ** as though they occur there. They do not. The verse does contain **مِن بَعْدِهِ**, **وَأَيَّدْنَاهُ**, and **أَنفُسُكُمُ**; the last is a *plural second-person* form, not “their selves” ([word-by-word verification](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=87)). Fix the hook, focus token, translation, highlight, reveal, and every related exercise together. Do not simply change the index while keeping the false explanation.
3. **Incorrect morphology explanations.** Lesson 1 labels the change before **ـِي** as **إِدْغَام** and claims **بَيْتٌ** drops a feminine **ة**; **بَيْتٌ** has none. It says the kasra of **اِسْمِي** is under the initial alif, rather than explaining the actual ending. Lesson 2 says **ـُكَ** has a damma *on ك*; **كَ** has fatha, while **كِ** has kasra. Lesson 3 treats the final alif of **ـهَا** alone as the feminine marker and says “the noun itself does not change,” contradicted by **مَدْرَسَتُهَا**. Remove “always” rules and have an Arabic editor correct the forms and terminology.
4. **Scope drift into Chapter 20.** `ch19-l05` openly teaches **ـهُمْ، ـكُمْ، ـنَا** and grades them, even though Chapter 20 has separate lessons for “our,” plural “your,” and “their.” Repurpose Lesson 5 for singular-pronoun transfer rather than simply dropping a lesson and renumbering progress.
5. **Al-Falaq integration tests many untaught words.** `ch19-l06` is more a ten-question vocabulary course on all five ayat than a singular-pronoun lesson. Its most relevant insight is the contrast between **بِرَبِّ الْفَلَقِ** and **رَبِّي**. The full-surah Tadabbur progression exists separately; the Chapter 19 review should not demand unintroduced **غَاسِقٍ، وَقَبَ، النَّفَّاثَاتِ، الْعُقَدِ، حَاسِدٍ، حَسَدَ** as prerequisites for completion.
6. **Language, metadata, and assessment.** Urdu includes **تمہاری نام**, **جیز** for “self/soul,” and English-shaped prose; the same error often propagates into options and feedback. The chapter map names `reader_lecture_19_attached_pronouns_singular.md`, while all six fixtures name `reader_lecture_19_attached_pronouns.md`; neither was found locally. The map has four focus records while the seed has six lessons, and its [109:6](https://corpus.quran.com/wordbyword.jsp?chapter=109&verse=6) hook needs a note on the omitted possessive *yāʾ* of **دِينِ**, not a rule that final kasra means “my.” No `REVIEW` or distinct `CHAPTER_TEST` exists. The schema and Urdu-presence validators pass, but they do not certify semantic or grammatical correctness.

## 3. Revised seven-item sequence

Preserve IDs `ch19-l01`–`ch19-l06`, their order, and existing progress rows. Repurpose `ch19-l06` as `REVIEW`; add only `ch19-test` at order 7. Each teaching lesson should have roughly 5–7 purposeful cards and 7–9 varied exercises; these are editorial targets, not schema rules. All authored Arabic examples below require an Arabic-editor pass before implementation.

| Order / ID | Working lesson | New job and Quran connection |
|---|---|---|
| 1 / `ch19-l01` | **Kasra or “my”?** | Contrast **رَبِّ الْعَالَمِينَ** ([1:2](https://corpus.quran.com/wordbyword.jsp?chapter=1&verse=2)) and **بِرَبِّ الْفَلَقِ** ([113:1](https://corpus.quran.com/wordbyword.jsp?chapter=113&verse=1)) with an actual **رَبِّي** occurrence, for example [Yusuf 12:100](https://corpus.quran.com/wordbyword.jsp?chapter=12&verse=100). Supply context glosses; do not require a full case-paradigm derivation. Key question: which form actually means “my Lord”? |
| 2 / `ch19-l02` | **Same shape, different attachment** | In [Al-Baqarah 2:87](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=87), identify **بَعْدِهِ** (“after him,” ending on a noun-like word) versus **وَأَيَّدْنَاهُ** (“and We supported him,” ending on a verb). Familiar **ـهُ/ـهِ** is a recognition bridge; its grammatical job is different. Do not turn this into verb-object pronoun conjugation. Prefer a short identified excerpt while retaining the verse reference and faithful context. |
| 3 / `ch19-l03` | **Recognize a familiar change in a new word** | Briefly retrieve Chapter 7's **مَدْرَسَةٌ → مَدْرَسَتُهَا**, then transfer the **ة → ت** observation to a new noun. Candidate Quran word [**وَامْرَأَتُهُ**, Al-Masad 111:4](https://corpus.quran.com/wordbyword.jsp?chapter=111&verse=4) shows the written **ت** before **ـهُ**; its serious context must be supplied and suitability approved by the scholarly reviewer. If unsuitable, use a different verified Quran hook and an authored transfer example; never force an unrelated ayah. Do not score a repeat translation of **مَدْرَسَتُهَا** as the new skill. |
| 4 / `ch19-l04` | **Who owns what in a sentence?** | Move beyond Chapter 7's isolated **كِتَابِي / كِتَابُكَ / كِتَابُهُ** table. In two short authored scenes, identify owner, owned noun, and sentence meaning, including a female addressee or owner. Compare **كِتَابِي عَلَى الْمَكْتَبِ** with **كِتَابُهَا عَلَى الْمَكْتَبِ**; use familiar location words. Introduce no plural suffix. |
| 5 / `ch19-l05` | **Possession in Quranic context** | Controlled comparison of **لِي / ـي** and a noun-attached owner in [Al-Kafirun 109:6](https://corpus.quran.com/wordbyword.jsp?chapter=109&verse=6): **وَلِيَ دِينِ** means “and for me is my religion.” Explain that the possessive *yāʾ* of **دِينِ** is omitted in this written Quranic form; learner only recognizes the meaning with context, not generalizes from the final vowel. **لَكُمْ / دِينُكُمْ** can be glossed as a preview for Chapter 20, not taught or graded here. |
| 6 / `ch19-l06` | **Chapter 19 review: Al-Falaq bridge** | Change template to `REVIEW`. Interleave three skills—case ending versus possessive, attachment site/function, and owner/referent in a sentence. Reuse Al-Falaq 113:1 to ask why **بِرَبِّ الْفَلَقِ** is “Lord of daybreak,” not “my Lord.” A brief guided surah reference is fine; do not require full five-ayah vocabulary mastery or claim a technical Tadabbur unlock. No new rule. |
| 7 / `ch19-test` | **Chapter 19 final test** | New `REVIEW` fixture with `assessment.type = CHAPTER_TEST`, 12 multiple-choice questions, `pass_score_percent: 80` (10/12), server grading, and the existing retry/reward behavior. No new material. |

If the owner wants a full Al-Falaq vocabulary milestone, design it within the Tadabbur progression or a later dedicated reading unit; it should not displace the Chapter 19 review. Likewise, Chapter 20 can revisit **أَنفُسُكُمُ** in 2:87 as a new *plural-suffix* task—deliberate reuse of the ayah, not redundant teaching.

### Exercise rules and final-test blueprint

Replace “translate the suffix again” loops with evidence-based prompts: select which displayed word means “my Lord”; match the *actual* underlined Quran word to a gloss; choose whether **ـه** attaches to a noun or a verb in the shown excerpt; identify the owner of an object in an authored sentence; choose the correctly formed feminine-noun attachment. All answer options must be grammatical and the wrong-answer explanation must explain the observed feature rather than repeat a slogan.

| Test outcome | Questions |
|---|---:|
| Distinguish final kasra from first-person possession | 3 |
| Identify a singular attached pronoun's referent/owner in a sentence | 2 |
| Transfer the already-known **ة → ت** noun shape to a new word | 2 |
| Distinguish noun-attached possession from a glossed verb-attached pronoun | 2 |
| Read the verified 109:6 or 113:1 target in context, including special orthography only as taught | 2 |
| Distinguish Quran quotation from an authored practice sentence | 1 |
| **Total** | **12** |

Do not test **ـنَا، ـكُمْ، ـهُمْ** as new paradigm forms, all five ayat of Al-Falaq, the whole grammar of genitive case, or a new verb-object pronoun paradigm. Verify that 9/12 fails and 10/12 passes and that retries do not duplicate rewards.

## 4. Editorial and release checks after approval

1. Confirm chosen Quran hooks and every highlighted *target* against exact text, verse reference, audio, and zero-based highlight indices. Lesson 1's invalid index must be corrected, not silenced. For 2:87, never say **أَنْفُسُهُمْ / بِأَنْفُسِهِمْ** is present. For 109:6, verify the omitted-*yāʾ* explanation and written form with the scholarly editor.
2. Rewrite the six fixtures under their stable IDs, add the separate test fixture/seed row, update chapter title/focus/source metadata, and align templates. Preserve learner progress; decide whether substantially corrected lessons need a revisit notice. Check the current lesson-notice/course-continuity implementation before production promotion rather than assuming it is already deployed.
3. Independently edit every Urdu string—hook, cards, exercise prompts, options, feedback, reveal, and test. Correct gender agreement and semantic glosses; use natural Urdu for self/soul, “my/your/his/her,” and case-ending contrast. Recheck `ar_plain`, transliteration, and every answer key after Arabic is locked.
4. Run lesson-schema tests, fixture validation, Quran text/reference audit, Urdu audit, and a human semantic pass of all six lessons plus test. Stage only Chapter 19 in the isolated local DB. Walk the seven items in English and Urdu on Android/web, including directionality, Quran highlights, human-recorded verse audio, lesson audio after text edits, review, test gating, and progress continuity.
5. Export Studio edits and require `content:check` before any scoped production update. **Never run the full production seed.** No content or production data is changed by this proposal.

## 5. Owner decisions requested

Approve or revise the applied-reading purpose, the candidate Al-Masad 111:4 example and its context, treatment of Al-Falaq as a limited review bridge rather than a full-surah quiz, the separate final test, and how existing completions should be marked for revisit. These decisions precede fixture editing and promotion.
