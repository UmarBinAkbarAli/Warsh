# Chapter 16 Content Proposal — School Life in Quranic Arabic

**Status:** Implemented 2026-09-23 (fixtures, seed, map, `scripts/promote-chapters-15-19.cjs`); staging-verified, production promotion pending. Deviations are recorded in `Docs/warsh-status.md` and the fixture `_meta._note`s.
**Scope:** Curriculum content only. This proposal does not authorize fixture, database, app, audio, or production changes.  
**Chapter:** Book 2, Chapter 16  
**Recommended size:** Four teaching lessons, one review, and one distinct final test

## 1. Decision and learner outcome

Chapter 16 should be a coherent **school-life application chapter**, not a second course in adjective agreement or an early lesson on present/future conjugation. Learners already know basic nouns, demonstratives, location phrases, a few past-tense words, plural recognition, and some classroom/halaqa phrases. Here they should use those foundations to understand a simple school scene and connect a small number of its words to authentic Quranic language.

By the end, a learner can:

1. identify common school places, objects, people, and lesson words in short, level-appropriate sentences;
2. answer a familiar **أَيْنَ؟** question about a teacher, student, book, or pen using an already-taught location phrase;
3. distinguish **أَمْسِ، الْيَوْمَ، غَدًا** by meaning in a supplied context, without learning the full case system or future tense;
4. hear or read a small set of classroom instructions and select the appropriate action or response, without deriving imperative forms from verbs;
5. distinguish an actual Quran quotation from an authored classroom sentence and identify the word that is truly present in the cited ayah; and
6. pass a separate chapter final test.

The purpose is Quran-first formal Arabic comprehension. It is **not** to claim that the Quran describes a modern school, that a specific verse teaches every school word, or that listening to commands is the same as mastering imperative morphology.

## 2. Curriculum boundaries and intentional repetition

| Source chapter or later destination | Existing or planned skill | Chapter 16 treatment |
|---|---|---|
| Chapters 1–5 | **كِتَابٌ، قَلَمٌ، هَذَا / هَذِهِ، أَيْنَ، فِي، عَلَى، إِلَى**, basic adjective and nominal sentences | Reuse in a new school setting; do not call them new grammar. |
| Chapters 9 and 13 | **طَالِبٌ / طُلَّابٌ**, plural recognition including broken plurals | Use familiar people and lesson nouns; do not repeat plural-family instruction. |
| Chapter 12 | Personal introduction and classroom/halaqa phrases, including **اِفْتَحُوا الْكُتُبَ** as spoken recognition | Lesson 4 should add **action selection in a single-learner classroom scene**, not replay the entire Chapter 12 phrase list or claim to teach the plural imperative paradigm. |
| Chapter 14 | Singular and plural adjective agreement, human/non-human classification, phrase versus sentence | Apply familiar descriptions incidentally. Do not assess a new “all non-human nouns take feminine adjectives” rule. |
| Chapter 15 proposal | Demonstratives for groups and Quranic reference | Use only if approved and published; Chapter 16 must not silently depend on unimplemented Chapter 15 content. |
| Chapter 17 | Daily actions and past-tense verb recognition | Keep **قَرَأَ / كَتَبَ** production out of Chapter 16 unless already explicitly taught; **ذَهَبَ** is prior knowledge. |
| Later present/future chapters | Present-tense prefix system and future **سَـ / سَوْفَ** | No scored **يَقْرَأُ، أَذْهَبُ، سَأَذْهَبُ** formation here. If heard in an authentic context, gloss only. |
| Later time/grammar chapters | Time units, adverbial case, detailed morphology | Teach the meanings of three practical time words only; defer case theory and full time-expression grammar. |

**Repetition test:** A reused word, phrase, or ayah must have a new task. For example, **قَلَمٌ** can move from early object vocabulary to identifying **بِالْقَلَمِ** in a Quran excerpt; **أَيْنَ؟** can move from a generic location question to locating a person in a short school scene. If an activity merely repeats an earlier translation question, remove it.

## 3. Why the current five-item chapter needs revision

The current fixtures have four `STANDARD` lessons and one `REVIEW` lesson (`ch16-l01`–`ch16-l05`). Their schemas, Urdu-presence audit, and Quran-text/reference audit pass, but these checks do not validate the teaching claims.

### Errors that must be removed, not merely polished

1. Lesson 1 states that **all non-human nouns** take feminine-singular adjectives, although the Chapter 14 rule is a beginner default for many **non-human plurals**. Its own **الْمَكْتَبُ جَدِيدٌ** contradicts the claim. The true/false exercise marking that rule true must be replaced. The explanation also gives the wrong case story for **دَفْتَرٌ** in **عَلَى الْمَكْتَبِ دَفْتَرٌ**: **الْمَكْتَبِ** follows the preposition; **دَفْتَرٌ** does not.
2. Lesson 2 calls **دَرْسٌ** a human noun, claims the object **الدَّرْسَ** should have kasra, and says the present verb **يَقْرَأُ** has damma on its initial **ي**. The sentence **الْأُسْتَاذُ يَعْلِمُ الدَّرْسَ** is glossed “the teacher teaches the lesson,” but **يَعْلِمُ** means “knows”; **يُعَلِّمُ** would be a different form that requires its own teaching decision.
3. Lesson 3 introduces **سَأَذْهَبُ** before the future chapter; explains **أَمْسِ** as genitive after an implied preposition; alternates **الْيَوْمُ / الْيَوْمَ** without a controlled distinction; and translates **غَدًا** (“tomorrow”) as Urdu **پرسوں** (“the day after tomorrow”) in teaching and answer options. It also uses **إِلَى** (“to”) but sometimes translates it as **میں** (“in”).
4. Lesson 4 says the vowels of **اِفْتَحْ** and **اُكْتُبْ** encode politeness or familiarity; an exercise marks the claim true. This is false. The note says imperative formation is simply prefix removal, and its word list includes malformed **اُجْلِسْ** and **اُقُمْ**; the controlled singular forms should be checked as **اِجْلِسْ** and **قُمْ** if used. The lesson also mixes cited Quranic commands with invented classroom lines without enough distinction.
5. The hooks and reveals are poorly aligned: Lesson 1's Al-A'la 87:1 is not about school objects; Lesson 2's Al-A'la 87:2 highlights **الَّذِي** while the explanation discusses **خَلَقَ**; Lesson 3's Al-Ma'un 107:1 contains none of its time words. Lessons 4–5 reuse Al-A'la 87:1 mostly as a thematic bridge. All five reveals omit a declared `highlighted_words` target.
6. Lesson 5 is a short review that repeats several mistakes, including the Urdu **غَدًا = پرسوں** mapping and a statement implying a singular school's adjective follows a “non-human noun” rule. There is no distinct chapter assessment with an `assessment` payload.
7. Arabic-only fields contain English labels; some Urdu translations are reversed or unnatural; transliteration and vocalization vary. The curriculum map and fixture `_meta.source` point to two differently named `reader_lecture_16...md` files, neither present in the repository.

## 4. Proposed lesson sequence and stable identities

| Order | Stable ID | Working title | Template | Primary outcome | Suggested coverage |
|---:|---|---|---|---|---:|
| 1 | `ch16-l01` | In the Learning Space | `STANDARD` | Identify school objects and locate them with known phrases | 8 cards, 7–8 exercises |
| 2 | `ch16-l02` | Teacher, Student, and Lesson | `STANDARD` | Identify people and roles in a simple school scene | 8 cards, 7–8 exercises |
| 3 | `ch16-l03` | Yesterday, Today, Tomorrow | `STANDARD` | Understand three time words with familiar sentence shapes | 7–8 cards, 7 exercises |
| 4 | `ch16-l04` | Listen and Respond in Class | `STANDARD` or a scoped `SPOKEN_PHRASES` conversion after owner review | Understand known classroom commands and choose a relevant action/reply | 8–10 phrases, 7–8 exercises |
| 5 | `ch16-l05` | Chapter 16 Review | `REVIEW` | Integrate school scene, time, and instruction comprehension | 7–8 cards, 10 exercises |
| 6 | `ch16-test` | Chapter 16 Final Test | `REVIEW` with `assessment` | Test the chapter independently and gate completion | 12 graded questions |

Preserve all five existing stable IDs and their progress records. Add only `ch16-test`. Repurposing a completed lesson—especially the erroneous command lesson—requires an explicit learner-notice/revisit decision before production promotion; do not silently erase completions. The existing `SPOKEN_PHRASES` template may fit Lesson 4 if its current schema and player can deliver the intended listening flow, but the template choice is an implementation check, not permission to build a new screen. No extra standalone Conversation Lab is necessary: Chapter 12 already introduced classroom phrases, and a short interaction inside Lesson 4 is sufficient for this chapter.

## 5. Lesson designs

### Lesson 1 — In the Learning Space

**Keep ID:** `ch16-l01`.

- Core scene: a learner finds a book, pen, notebook, and desk in a classroom. New or less familiar nouns may include **مَدْرَسَةٌ، فَصْلٌ، دَفْتَرٌ، مَكْتَبٌ**; **كِتَابٌ، قَلَمٌ، فِي، عَلَى** are retrieval, not new grammar.
- Model **أَيْنَ الْقَلَمُ؟** and a short answer with **عَلَى** or **فِي**. Contrast **فَصْلٌ** (classroom) with **دَرْسٌ** (lesson) using meaning, not a case lecture.
- Quran connection: [Al-‘Alaq 96:4](https://corpus.quran.com/wordbyword.jsp?chapter=96&verse=4) contains **بِالْقَلَمِ** (“by the pen”). Highlight that exact token. This is a genuine **pen** occurrence, not evidence that the verse contains **مَدْرَسَةٌ** or describes a modern classroom. Explain the attached **بِـ** only at the already-taught recognition level.
- Exercises: object-to-meaning match, choose the named object in a simple room scene, answer a familiar **أَيْنَ؟** question, and identify **الْقَلَمِ** within the Quran token. Avoid another non-human adjective-agreement test.

### Lesson 2 — Teacher, Student, and Lesson

**Keep ID:** `ch16-l02`.

- Focus on **أُسْتَاذٌ، طَالِبٌ، طُلَّابٌ، دَرْسٌ** and the role each plays in an authored school scene. Some terms are familiar from Chapters 9 and 12; the new skill is understanding a connected school description, not re-memorizing their isolated glosses.
- Use known nominal/location sentences such as **الْأُسْتَاذُ فِي الْفَصْلِ** and **الطَّالِبُ فِي الْمَدْرَسَةِ**. If a present verb is shown, make it fixed recognition vocabulary only and do not test person marking, case, or object endings.
- Quran connection: [Al-‘Alaq 96:5](https://corpus.quran.com/wordbyword.jsp?chapter=96&verse=5) has **عَلَّمَ الْإِنسَانَ** (“He taught humankind”). Label it a *thematic link to learning*, not a Quran occurrence of **أُسْتَاذٌ** or **طَالِبٌ**. The word **عَلَّمَ** may be recognized with a gloss; its conjugation is out of scope.
- Exercises: identify who is where, choose teacher versus student from context, match **دَرْسٌ / فَصْلٌ**, and construct one short known-pattern sentence. Remove **يَعْلِمُ الدَّرْسَ** and all false human/non-human noun claims.

### Lesson 3 — Yesterday, Today, Tomorrow

**Keep ID:** `ch16-l03`.

- Teach **أَمْسِ = yesterday; الْيَوْمَ = today; غَدًا = tomorrow** as meaning-bearing words in short, controlled examples. If a sentence needs a past action, use a past word already taught (for example **ذَهَبَ**); otherwise use simple nominal scheduling statements reviewed by an Arabic editor. Do not ask learners to generate **قَرَأَ** or future **سَـ** forms here.
- Quran connection: [Al-Kahf 18:23](https://corpus.quran.com/wordbyword.jsp?chapter=18&verse=23) contains **غَدًا**. Highlight it as the lexical target and supply the adjacent 18:24 context in a respectful short explanation. The surrounding verb forms and theology of saying *in shāʾ Allāh* are not scored grammar for this lesson.
- Exercises: yesterday/today/tomorrow timeline choice, match the Arabic word to a context, choose the correct word in a familiar sentence, and recognize **غَدًا** in the verse. English and Urdu options must differ unambiguously; Urdu **کل** needs context, while **پرسوں** must not be used for **غَدًا**.
- Remove the “implied preposition” explanation for **أَمْسِ** and the mixed **الْيَوْمُ / الْيَوْمَ** paradigms. If editors need a grammar note, say simply that these are time expressions whose endings are studied later.

### Lesson 4 — Listen and Respond in Class

**Keep ID:** `ch16-l04`. **Teaching level:** whole-phrase comprehension and limited response, not imperative derivation.

- Phrase set: **اِفْتَحْ** (open), **اِقْرَأْ** (read/recite), **اُكْتُبْ** (write), **اُنْظُرْ** (look), and optionally **قُلْ** (say). Use a small classroom scene: a teacher gives one instruction, the learner selects the correct action or object. Verify whether each line addresses one male learner; feminine/plural addressee forms remain out of assessed scope.
- Quran anchor: [Al-‘Alaq 96:1](https://corpus.quran.com/wordbyword.jsp?chapter=96&verse=1) starts with **اقْرَأْ**, an actual imperative. Distinguish the Quranic command and context from authored classroom instructions; do not imply they are equivalent speech acts.
- Exercises: listen and select action, match a command to an object, choose a sensible response in a four-turn mini exchange, and identify **اقْرَأْ** in the Quran excerpt. If microphone/shadow practice is added, follow the product's local-recording and permission-fallback rules; speaking performance must not be silently graded as pronunciation.
- Remove every politeness-vowel claim and the true/false item that rewards it. Do not teach imperative formation by “remove the prefix.” If **اِجْلِسْ / قُمْ** are included, first verify exact form, pronunciation, and why they are necessary for this scene.

### Lesson 5 — Chapter 16 Review

**Keep ID:** `ch16-l05`, `REVIEW`; rebuild around the four new outcomes.

- Ten mixed items, with at least two requiring meaning from a **school scene** rather than direct one-word translation. Mix person, object, place, time, and instruction comprehension without introducing new grammar.
- Include one distinction between authored example and Quran quotation and one direct-target verse retrieval. Reuse a verified anchor deliberately; do not introduce a fourth unrelated ayah just to make the review feel new.
- Remove the false singular-noun adjective rule, the Urdu **غَدًا = پرسوں** mapping, and the unassessed present-verb/case explanations.

### Chapter 16 Final Test

**New ID:** `ch16-test`, display order 6, `REVIEW` template with `assessment.type = CHAPTER_TEST`. Use 12 server-graded questions at the existing 80% threshold (10 correct out of 12), unlimited retries, and the standard no-duplicate-reward behavior.

| Skill | Questions |
|---|---:|
| School objects and setting | 2 |
| Teacher/student/lesson roles | 2 |
| Familiar location question and answer in school context | 2 |
| Yesterday/today/tomorrow meaning | 3 |
| Classroom instruction comprehension | 2 |
| Quran word recognition: **بِالْقَلَمِ** or **اقْرَأْ** | 1 |
| **Total** | **12** |

The test must not require future **سَـ**, present-tense conjugation, imperative derivation, nominative/accusative/genitive analysis, or a claim that a thematic Quran verse literally contains school vocabulary.

## 6. Quran, language, and editorial gates

| Lesson | Proposed reference | Direct target | Limit of the claim |
|---|---|---|---|
| 1 | [Al-‘Alaq 96:4](https://corpus.quran.com/wordbyword.jsp?chapter=96&verse=4) | **بِالْقَلَمِ** | Pen, not school/classroom |
| 2 | [Al-‘Alaq 96:5](https://corpus.quran.com/wordbyword.jsp?chapter=96&verse=5) | **عَلَّمَ** | Thematic teaching link, not an occurrence of teacher/student nouns |
| 3 | [Al-Kahf 18:23](https://corpus.quran.com/wordbyword.jsp?chapter=18&verse=23) | **غَدًا** | Tomorrow as lexical recognition; no future grammar assessment |
| 4 | [Al-‘Alaq 96:1](https://corpus.quran.com/wordbyword.jsp?chapter=96&verse=1) | **اقْرَأْ** | Quran command, not an invented classroom quote |

Before publishing, verify exact Uthmani text and reference, translation, human-recorded audio, zero-based highlight indices, declared `highlighted_words`, and the explanation of the *highlighted* token. Quran ayat remain Arabic-only, without transliteration. The ayah-text validator is necessary but insufficient: a correct reference can still be paired with the wrong lesson target.

Every English/Urdu pair must be independently edited for the same meaning. In particular: **غَدًا = آنے والا کل / کل** with context, never **پرسوں**; **أَمْسِ = گزرا ہوا کل / کل** with context; **إِلَى = کی طرف / کو**, not **میں**. Use natural Urdu for school, teacher, student, and lesson; remove inverted singular/plural explanations and typos. Arabic-only fields must not contain English prose. Re-audit `ar_plain`, vocalization, transliteration, and every correct answer after the Arabic is locked.

## 7. Implementation route after approval

1. Resolve provenance: `curriculum-books2-4.cjs` references `reader_lecture_16_school_students.md`, while fixtures reference `reader_lecture_16_school_and_students.md`; neither file exists. Restore a genuine source or, if the owner approves this proposal as the new source, record that decision consistently in curriculum and fixture metadata.
2. Rewrite the existing five fixtures under their stable IDs; add only the final-test fixture and seed registration; keep lesson order, title metadata, and backend chapter-completion behavior synchronized.
3. Build/test the canonical lesson schema, validate fixtures, run Quran and Urdu audits, then perform a **semantic** pass over target words, grammar claims, Urdu meanings, distractors, and every answer key. A qualified Arabic reviewer must approve the imperative and time explanations.
4. Stage only Chapter 16 in the isolated local database. Walk all six items in English and Urdu on the app, checking Arabic display, audio, directionality, wrong-answer feedback, review, final-test gating, and retries. Verify 9/12 fails and 10/12 passes.
5. Regenerate keyed audio for changed Arabic. Export any Studio edits to fixtures, require `content:check` to pass, and obtain owner approval before a **scoped Chapter 16** production promotion. Never run the full production seed.

## 8. Approval decisions

The owner should approve (a) the four-lesson scope and the separation of review/test, (b) Lesson 4's whole-phrase listening level rather than imperative formation, (c) use of a thematic—but explicitly labelled—Quran link for Lesson 2, and (d) the policy for informing learners who previously completed lessons that are being substantially corrected. A scholarly reviewer should approve final Quran-context wording, command forms, and Urdu grammar terminology before release.
