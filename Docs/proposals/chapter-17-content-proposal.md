# Chapter 17 — Past Actions in Quranic Arabic: content repair proposal

**Status:** Implemented 2026-09-23 (fixtures, seed, map, `scripts/promote-chapters-15-19.cjs`); staging-verified, production promotion pending. Deviations are recorded in `Docs/warsh-status.md` and the fixture `_meta._note`s.
**Scope:** Chapter 17 curriculum metadata, six existing lessons, and one proposed final test  
**Recommended size:** Five teaching lessons, one review, one distinct final test

## 1. Purpose and boundaries

Chapter 17 should move learners from recognizing isolated past-tense words to reading **who did what** in a short Arabic sentence and finding a genuine past action in a Quran excerpt. This is a recognition/application chapter, not full conjugation. By the end, learners should be able to (a) recognize a small set of third-person singular past verbs, (b) identify a doer and, where present, an object or destination, (c) reuse the already-taught feminine **ـتْ** cue without treating it as a universal rule, and (d) distinguish a Quran quotation from an authored practice sentence.

The proposed title, “Past Actions in Quranic Arabic,” is clearer than “Daily Actions and Verbs”: not every useful Quran example describes a daily routine, and the current chapter promises Quranic recognition without delivering it. Keep the chapter number and stable lesson IDs.

### Cross-chapter placement

| Existing/nearby chapter | Already taught or planned | Chapter 17's distinct job |
|---|---|---|
| 5 | **ذَهَبَ** as a first past action word | Retrieve it in a complete action sentence; do not reteach it as new vocabulary. |
| 8 | Feminine singular past **ـتْ** with **ذَهَبَتْ / قَالَتْ** | Use that clue in context; avoid another stand-alone “add ت” lesson. |
| 12 | A few past words and classroom/halaqa phrases | Apply sentence roles, not another introductory dialogue or generic verb list. |
| 16 | Proposed school scenes and command comprehension | An imperative such as **اِقْرَأْ** is *not* the past **قَرَأَ**. Do not rely on Chapter 16's unapproved proposal having shipped. |
| Later verb chapters | Broader tense/conjugation patterns | Defer person/number paradigms, present/future formation, weak-verb rules, and full case analysis. |

Repetition is justified only when the task changes: **ذَهَبَ** moves from word recognition to identifying the doer and destination; **ـتْ** moves from form comparison to reading its subject in a sentence and a Quran excerpt. A second identical translation drill is not justified.

## 2. Findings in the current material

1. **Quran hooks are disconnected or misdescribed.** The six fixtures use only Al-Ma'un 107:5/6 and Yusuf 12:36. Those verses do not contain the taught past forms **أَكَلَ، شَرِبَ، قَرَأَ، كَتَبَ، نَامَ، قَامَ، صَلَّى، ذَهَبَ، جَلَسَ، سَمِعَ**. Lesson 4 invents **أَصَلَّى** as a question “in Al-Ma'un”; 107:5 instead has **صَلَاتِهِمْ**, a noun. Lesson 3 says Yusuf's prison account tells of people sleeping, and Lesson 5 says a man sat and listened; 12:36 says neither. A verse can be thematic, but that relationship must be labelled honestly and should not replace direct word-finding practice.
2. **The gender rule is false as written.** Lesson 6 repeatedly says “no final ت = masculine; final ت = feminine” for *all* Arabic verbs and calls this the *only* difference. This collapses other persons, numbers, tenses, and attached endings into one false binary. Even for the scoped forms, weak verbs change before the ending (**صَلَّى → صَلَّتْ**), so “just add ت” is not a reliable spelling instruction. Lesson 2's true/false item rewards “always”; replace it. Say only: “In these paired third-person singular past examples, **ـتْ** is a useful feminine-subject clue.” Do not infer gender from every word ending in ت.
3. **Overload and repetition.** Lessons 1–5 teach ten new verbs in pairs, each repeatedly gives masculine/feminine forms, then Lesson 6 introduces an eleventh (**نَظَرَ**) while repeating the same rule. All six are `STANDARD` with six discover cards and eight exercises; there is no integrated `REVIEW` or distinct `CHAPTER_TEST`. Narrow the assessed core and make Lesson 6 retrieval and transfer, not another lecture.
4. **Incorrect grammar/semantic claims.** Lesson 4 says **ذَهَبَ** is *always* followed by **إِلَى**; an explicit destination can use **إِلَى**, but the verb does not require one. Lesson 5 says **جَلَسَ** uses **فِي** and the prepositions are “fixed” and “never interchangeable” as verb attachments; teach location versus direction in those sample sentences, not an absolute selection rule. Its claim that **مَوْعِظَة** belongs to root **س-م-ع** is wrong. Lesson 3's **قَامَ يَصُومُ** explanation introduces an unexplained present verb and an odd “stood to fast” meaning. Remove or have an editor replace it. Lesson 2's “stories of prophets who read and write” is an unsupported curricular generalization.
5. **Urdu needs a full semantic edit.** Examples include **ذَهَبَ = اس نے گیا**, **ذَهَبَتْ = اس نے گئی**, **قَامَ = اس نے کھڑا ہوا**, **گَر/گر** for **گھر**, and mixed English such as “root,” “fix,” and “pattern” inside Urdu teaching prose. Past Urdu sentences often need a natural overt subject (**وہ گیا / وہ گئی**, **وہ کھڑا ہوا**) or an idiomatic transitive construction, not an English-gloss-shaped **اس نے** template. Check every card, option, statement, explanation, reveal, and answer key, not only field presence.
6. **Metadata is inconsistent.** `curriculum-books2-4.cjs` names a Chapter 17 reader lecture and a [2:286](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=286) hook with **كَسَبَتْ**, while all six fixture `_meta.source` entries name a different reader file and none of the six lessons uses that ayah. Neither named source file was found in the repository. The curriculum map has four focus records, whereas the seed registers six lessons. Its `noorTipUr` asks learners to ponder a distinction between **كَسَبَتْ** and **اكْتَسَبَتْ** that this chapter does not teach. Restore a real source or mark the approved proposal as provenance; align metadata with the delivered lessons.

Schema validation or a Quran-text/reference audit alone will not catch these semantic faults: the cited verse can be spelled correctly while the lesson's claim about it is false.

## 3. Proposed sequence

Preserve `ch17-l01`–`ch17-l06`; repurpose `ch17-l06` as `REVIEW`, and add only `ch17-test` as a new stable ID. Teaching lessons should aim for about five focused cards and 7–9 varied exercises each; the review can be longer if every task integrates a distinct skill. Treat this as an editorial target, not a schema constraint.

| Order / ID | Working title | New assessed content | Distinct task and Quran anchor |
|---|---|---|---|
| 1 / `ch17-l01` | Eating and drinking | **أَكَلَ، شَرِبَ** | Identify action and doer in authored mini-sentences; find **شَرِبَ** in [2:249](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=249). If [12:17](https://corpus.quran.com/wordbyword.jsp?chapter=12&verse=17) is used for **فَأَكَلَهُ**, say the brothers *claimed* the wolf ate Yusuf; the attached **ـهُ** is a supported preview, not assessed grammar. |
| 2 / `ch17-l02` | Reading and writing | **قَرَأَ، كَتَبَ** in authored sentences | Distinguish past **قَرَأَ** from a possible prior command **اِقْرَأْ** without assessing imperative formation. A Quran hook may use **كَتَبَ** in [2:187](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=187), but there it means “ordained/decreed,” *not* “wrote”; use a gloss and editorial note, or select another verified form. Do not falsely translate the ayah as school writing. |
| 3 / `ch17-l03` | Standing and an action sentence | **قَامَ**; **نَامَ** only as authored contrast, optional/not assessed | Find **قَامَ** in [72:19](https://corpus.quran.com/wordbyword.jsp?chapter=72&verse=19) and identify **عَبْدُ اللَّهِ** as the doer with a supplied gloss. Avoid attributing a prison sleeping story to the Quran. The focus is verb + doer, not weak-root morphology. |
| 4 / `ch17-l04` | Prayer and movement | **صَلَّى**; **ذَهَبَ** as prior knowledge | In [75:31–33](https://corpus.quran.com/wordbyword.jsp?chapter=75&verse=31), **وَلَا صَلَّىٰ** is negated (“nor did he pray”), and **ذَهَبَ إِلَىٰ أَهْلِهِ** supplies a real movement example. Preserve the serious Quran context and teach the *whole phrase's* meaning; do not present **صَلَّى** there as affirmative or make **إِلَى** obligatory after every **ذَهَبَ**. |
| 5 / `ch17-l05` | Hearing and who did what | **سَمِعَ**; **جَلَسَ** optional authored vocabulary | Find **سَمِعَ** in [58:1](https://corpus.quran.com/wordbyword.jsp?chapter=58&verse=1), then parse a controlled authored **verb–doer–object** sentence. Do not imply **جَلَسَ** occurs in that ayah. Include one short **مَاذَا فَعَلَ …؟** exchange only if its question and answer have been introduced and can be understood without new conjugation. |
| 6 / `ch17-l06` | Chapter 17 review | No new verb or rule | Interleave actions, doers, one object/destination, a scoped feminine **ـتْ** recognition item, and Quran-token retrieval from at least two earlier lessons. `REVIEW`, not another gender lecture. |
| 7 / `ch17-test` | Chapter 17 final test | No new content | `REVIEW` with `assessment.type = CHAPTER_TEST`; 12 server-graded questions at the existing 80% threshold (10/12), standard retries and reward behavior. |

**Core load:** seven new actively assessed verbs (**أَكَلَ، شَرِبَ، قَرَأَ، كَتَبَ، قَامَ، صَلَّى، سَمِعَ**), plus deliberate retrieval of **ذَهَبَ**. **نَامَ، جَلَسَ، نَظَرَ** need not be in the Chapter 17 test; keep at most the first two as clearly labelled authored exposure if the owner wants the “daily actions” theme. The strongest Quran-first version omits **نَظَرَ** entirely and does not force a Quran hook for a form that is not present. This reduces rote pairs while preserving useful daily-language breadth.

### Exercise design

- Begin each lesson with one exact, highlighted Quran target where available; give the full ayah or a clearly identified excerpt and a faithful context gloss. Learners select the *actual* verb rather than a thematically related noun.
- Use authored sentences for simple pairings: **شَرِبَ الْوَلَدُ الْمَاءَ**; **كَتَبَ الطَّالِبُ الدَّرْسَ**; **سَمِعَتِ الْبِنْتُ الْقِصَّةَ**. These are practice sentences, never Quran quotations. Arabic editor to approve vowel marks and naturalness.
- Vary task direction: verb → action, sentence → doer, action + doer → short sentence, Quran token → supplied meaning, and one contrast between an action and an object/destination. Do not make every correct/incorrect decision a **ـتْ** question or allow recurring all-`True` answers.
- Keep **مَاذَا فَعَلَ …؟ / … فَعَلَ …** as an optional micro-dialogue in Lesson 5, with one answer from learned vocabulary; it is not a new Conversation Lab and should not crowd out Quran reading.
- Reveal should state exactly what the learner found in the displayed verse or authored sentence. Do not say a word “appears everywhere” or generalize a single occurrence into an unsupported frequency claim.

### Final-test blueprint

| Outcome | Questions |
|---|---:|
| Identify the meaning of a taught past action, including one root with a different contextual gloss | 3 |
| Find the doer in a simple action sentence | 2 |
| Distinguish action, object, and destination in controlled sentences | 2 |
| Apply the previously taught feminine singular cue in its scoped context | 1 |
| Retrieve a real highlighted target in a Quran excerpt and respect negation/context | 2 |
| Understand or complete one short, taught question–answer exchange | 1 |
| Distinguish an authored practice sentence from a Quran quotation | 1 |
| **Total** | **12** |

The questions must match the actual chapter content after editorial approval. Do not assess optional **نَامَ / جَلَسَ**, root theory, present tense, imperative derivation, full conjugation, or a verse's untaught surrounding grammar. Review and test should use different instances of a skill, not copied questions. Verify the app renders the test and that 9/12 fails while 10/12 passes.

## 4. Editorial and release gates after approval

1. Settle the seven-verb core, optional exposure words, and the two contextual complexities (**كَتَبَ** = “decreed” in 2:187; negated **صَلَّى** in 75:31). Have a qualified Quranic-Arabic reviewer approve every selected excerpt and its English/Urdu gloss. If either is too hard for this level, replace its Quran task with a simpler **verified** target, or label the hook thematic; never invent a matching occurrence.
2. Align `curriculum-books2-4.cjs`, seed titles/order/templates, fixture `_meta`, hook reference/audio, word highlights, and source attribution. For 2:286, either retain it as a deliberately labelled **cross-chapter retrieval of the feminine cue** in Lesson 6 or remove it from the Chapter 17 map; do not pretend **كَسَبَتْ / اكْتَسَبَتْ** are taught here. Verify exact Uthmani text and zero-based highlight indices/words.
3. Rebuild the six existing fixtures under their IDs, add a separate final-test fixture and seed registration, and decide how already-completed lessons will be marked for revisit. Do not silently reset learner progress. The current code has in-flight lesson-notice/course-continuity edits; review their final behavior before promotion rather than assuming a particular notice workflow.
4. Edit Urdu independently for idiom and agreement; check every correct answer, distractor, and feedback. Run lesson-schema tests, fixture validation, Quran audit, and Urdu audit, then conduct a human semantic audit of all Quran claims and morphology statements. Automated field-presence checks are insufficient.
5. Promote only to isolated local staging first. Walk all seven items on Android/web in both languages, including audio, right-to-left rendering, answer feedback, review completion, test gating, retries, and progress continuity. Regenerate audio for changed Arabic text. Export Studio edits and require `content:check` before a scoped Chapter 17 production update. **Never run the full production seed.**

## 5. Owner decisions requested

Approve or revise the narrower Quran-first sequence, whether **نَامَ / جَلَسَ** remain as optional authored exposure, the treatment of contextual Quran meanings, the separate final test, and the learner-revisit notice policy for substantially rewritten lessons. No fixture or production content has been changed by this proposal.
