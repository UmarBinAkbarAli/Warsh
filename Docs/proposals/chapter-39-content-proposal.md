# Chapter 39 — Read Surah Quraysh: Journeys, Worship, and Provision

**Status:** Proposal only — not approved or implemented  
**Evidence reviewed:** Chapter 39 map and all five registered fixtures; Chapter 38 proposal and Chapter 40 map for continuity; source references, lesson templates, and exercise patterns; active curriculum/product specs; Quranic Arabic Corpus and Arabic lexicon references. Fixture schema validation passed for 452 fixtures, with 23 legacy reveal warnings in other chapters. A read-only `content:check` was started but did not complete; database/fixture parity is therefore **unverified**.  
**Scope:** Chapter 39’s identity, examples, lesson progression, map alignment, and assessment. No lesson, fixture, seed, or database changes are included.

## Recommendation

Keep Chapter 39 focused on a **careful learner’s reading of Surah Quraysh (106:1–4)**. The map already sets the right broad destination—Quraysh vocabulary—while the fixtures drift into unrelated Quran-like text, unsupported historical claims, and incorrect morphology. Rebuild around the four actual ayat, teaching their core words in context before guiding the learner through the surah as a whole.

Use **four focused verse lessons, one integrated reading, one `REVIEW`, and one separate `REVIEW` checkpoint (seven total)**. This is warranted even though the surah is short: the chapter currently combines six distinct verse-level aims, several grammatical claims, historical narration, and vocabulary beyond the surah in five undifferentiated `STANDARD` lessons. The proposed sequence provides depth without pretending to teach every word or every grammatical feature in four ayat.

Keep explanations linguistic and modest. Distinguish the Quranic text, a cited translation, a constructed practice sentence, and optional historical/tafsir context. In particular, the semantic range of **إِيلاف** is not reducible to a single uncontested gloss; do not state a specific historical account as what the Arabic form itself “means.”

## Current-state audit

The map title, hook, and examples center on Surah Quraysh, especially **لِإِيلَافِ قُرَيْشٍ**, the winter/summer journey phrase, and the paired blessings of food and safety. The five registered fixtures also use that surah as their nominal subject, but diverge from it substantially. The map itself has two text-fidelity problems: one example runs **لِإِيلَافِ قُرَيْشٍ إِيلَافِهِمْ** across the 106:1/106:2 boundary without marking the verse transition, and its isolated **رِحْلَةُ الشِّتَاءِ وَالصَّيْفِ** changes the Quranic **رِحْلَةَ** case ending in 106:2. The latter can be a valid standalone construct phrase, but must not be presented as the exact verse wording or parse.

- Lesson 1 calls **وَآوَاهُمْ إِنَّ اللَّهَ هُوَ الْوَهَّابُ** “key vocabulary from Surah Quraysh”; this is not an ayah in Surah Quraysh and must not be presented as Quranic text. Its introduction also lists words not in the surah.
- Lesson 2 adds several constructed phrases, invents a trade-history narrative (including that commerce spread Islam’s message), gives a dubious root for **قَافِلَة**, and treats **بِيعَ** as a verbal noun.
- Lesson 3 introduces **إِلَى مَكَّةَ** as a vocabulary item, then explains its final fatḥa as a pause mark rather than the genitive behavior of a diptote; its tips also switch from Quranic **آمَنَ** to a differently vocalized verb.
- Lesson 4 imports **سُوقًا** and **الَّذِي حَمَلَهُمْ فِي الْبَحْرِ**, neither of which is from Surah Quraysh, then teaches false labels (“accusative of purpose” for “to market”) and unsupported sea-travel claims.
- Lesson 5 calls its content “complete” while repeating non-surah vocabulary and labels **الْوَهَّابُ** a Form IV verbal-noun pattern.

All five fixtures are `STANDARD`, each has eight exercises, both translation exercises in every lesson place the correct answer at index 0, and none is a cumulative `REVIEW` or `CHAPTER_TEST`. The map has four focus records for five lessons. The map cites `reader_lecture_39_surah_quraysh_vocabulary.md`, while the fixtures cite `reader_lecture_39_quraysh_vocab.md`; neither file exists at the referenced path under `warsh-backend/prisma/`.

### Issues and fixes

| Priority | Issue | Proposed fix |
|---|---|---|
| Critical | **Non-Quranic text is labeled as Surah Quraysh content.** Lesson 1 says all listed vocabulary appears in the surah, then includes **الْوَهَّابُ** and **وَآوَاهُمْ إِنَّ اللَّهَ هُوَ الْوَهَّابُ**. This line is not in Surah Quraysh; it must not be passed off as an ayah. | Remove it from Quran text and surah-vocabulary lists. If a constructed sentence is pedagogically useful, label it explicitly as constructed, independently review its Arabic, and do not attach Quranic recitation/audio or imply a verse citation. Limit “Surah Quraysh vocabulary” claims to words actually present in 106:1–4. |
| Critical | **The material makes interpretive and historical claims as though they were direct vocabulary meanings.** Examples include “Allah grants Quraysh security due to their habit,” a definitive “caravan habit” paraphrase for **إِيلاف**, and claims about wealth, goods, trade routes, and Islam spreading through commerce. Lesson 2 assigns the route as summer-to-Yemen and winter-to-the-Levant, while the consulted traditional tafsir explains winter-to-Yemen and summer-to-Syria; in any case, the seasonal route is historical commentary, not a grammatical fact. **إِيلاف** has multiple translation traditions (including accustomed security, protection, taming, and familiarity); history belongs in a carefully attributed context note, not a lexical gloss. The “spreading Islam” claim is especially anachronistic/unsupported in this context. | Teach the attested form and a source-attributed, learner-friendly translation. State briefly that translations differ and keep detailed interpretation out of the core grammar. Remove the Islam-commerce assertion. If historical context is retained, mark it as optional tafsir/history, cite a reliable source, and correct the seasonal pairing to the selected source; do not imply it is encoded by a single word. |
| Critical | **Several morphology and case explanations are incorrect.** Lesson 2 calls **بِيعَ** the maṣdar and invents a **فِيعَلٌ** pattern; **بِيعَ** is the passive perfect “was sold,” while **بَيْعٌ** is the verbal noun “sale.” Lesson 3’s Noor tip writes **أَمَّنَ** (Form II) where the ayah has **آمَنَهُمْ** (Form IV); the text alternates between these forms. It also says the fatḥa in constructed **إِلَى مَكَّةَ** is a pause mark; if this non-surah example is retained, **مَكَّةَ** is genitive after **إِلَى** and takes fatḥa because it is diptote. Lesson 5 calls **الْوَهَّابُ** a Form IV maṣdar pattern. | Delete the fabricated pattern analyses, non-target **الْوَهَّابُ**, and (preferably) **إِلَى مَكَّةَ**. For 106:4, use the exact Quranic **أَطْعَمَهُمْ** and **آمَنَهُمْ**, explain each at the level already taught, and have a qualified Arabic reviewer verify every form/case label. Use **بَيْعٌ** only if an out-of-surah constructed vocabulary item is intentionally kept and clearly labeled; preferably remove it from this chapter. |
| Critical | **The Quranic grammar/context lesson contains imported, misparsed material.** Lesson 4 includes **الَّذِي حَمَلَهُمْ فِي الْبَحْرِ** as an example and claims it refers to Quraysh caravans traveling by sea; it is not part of the surah. It also calls **سُوقًا** “to the market” and an accusative of purpose despite providing no governing sentence, then treats **رِحْلَةً** the same way, although in 106:2 it is governed by the verbal noun construction **إِيلَافِهِمْ**. | Remove the non-surah lines and the sea-travel narrative. Teach **رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ** in its exact verse context. Keep detailed iʿrāb only where the corpus/reference has been checked and the chapter has taught the prerequisite; otherwise explain the phrase’s meaning and mark the finer parse as a note for later study. |
| High | **The map alters exact Quran wording and hides an ayah boundary.** Its example joins 106:1 to 106:2 without a verse separator/reference, and quotes **رِحْلَةُ الشِّتَاءِ وَالصَّيْفِ** with nominative **رِحْلَةُ**, whereas the verse has **رِحْلَةَ**. The isolated construct phrase may be grammatical, but its case differs in context. | Show each ayah with its own reference and boundary. For 106:2 retain the exact phrase **إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ**. If using the standalone nominative construct **رِحْلَةُ الشِّتَاءِ وَالصَّيْفِ** as a separate grammar example, label it as constructed/isolated and never as the verse’s vocalized wording. Align parse labels with the exact displayed form. |
| High | **The first lesson’s lexical set is not the surah’s lexical set.** Its opening lists **لَيْلَةٍ، صَلَّى، سَعْدًا، بَيْتِ، رِضْوَانِ** as words packed into Surah Quraysh, but most are absent from 106:1–4. | Replace the list with a small, exact set from the target verses (for example **إِيلاف، قُرَيْش، رِحْلَة، الشِّتَاء، الصَّيْف، الْبَيْت، أَطْعَمَ، جُوع، آمَنَ، خَوْف**) and introduce them in their verse, not as an undifferentiated inventory. |
| High | **Constructed Arabic and meaning are weak or misleading.** Lesson 2 uses **فِي الشِّتَاءِ يَسْخَنُ الْبَيْعُ** (“trade heats up in winter”) as though it were a natural phrase and attaches a historical claim to it; its **قَافِلَةٌ** card also gives the unsupported/incorrect root **ق-و-ف**. Lesson 4’s standalone **سُوقًا** is translated “to the market” without a sentence that licenses that meaning. Several Urdu explanations mix English (“summer”, “winter”, “provision”, “grammar”) or make inaccurate claims. | Prefer exact Quranic chunks for target words. Remove the root-analysis claim or have it checked against a reliable Arabic lexicon. If a constructed sentence is needed, make it idiomatic, fully vocalized, explicitly labeled as constructed, and reviewed in Arabic and Urdu. Avoid a bare inflected token as a translation exercise when learners need its sentence role to infer meaning. Proofread Urdu separately rather than translating English literally. |
| High | **The progression repeats content but omits real assessment.** Lessons 1, 3, and 5 repeat the same ayah-4 vocabulary; Lessons 1, 4, and 5 repeat ayah 3. Despite “Mastering” and “complete vocabulary” claims, five similar `STANDARD` lessons contain no dedicated retrieval review or chapter test. | Organize lessons by the four ayat, then integrate the entire surah once. Add a targeted `REVIEW` followed by a separate checkpoint using canonical schema-supported `CHAPTER_TEST`. Scope mastery claims to the exact words and relationships assessed. |
| High | **Chapter map/source metadata are incomplete or misleading.** Four focus records do not represent five current lessons, and the map and fixtures name different missing lecture files. | Align the map with the approved seven-lesson sequence and use one maintained source identifier. This source-pointer mismatch does not itself prove DB/fixture divergence. |
| Medium | **Practice patterns cue the answer and do not vary by objective.** Translation correct answers are always in slot 0; the same eight-exercise sequence appears in every lesson. | Vary exercise order and answer position. Use retrieval, phrase reconstruction, listening/recognition, and short contextual meaning checks aligned to that verse’s outcome. Feedback should distinguish vocabulary evidence from grammatical evidence. |

## Proposed lesson sequence

Keep `ch39-l01` through `ch39-l05` as revised teaching slots and add `ch39-l06` and `ch39-l07`. The first four lessons follow the four-ayah structure; the fifth integrates the surah rather than adding another unrelated vocabulary list.

| Order / ID | Template | Proposed lesson | Scope and design |
|---|---|---|---|
| 1 — `ch39-l01` | `STANDARD` | **Ayah 1: Quraysh and إِيلاف** | Read **لِإِيلَافِ قُرَيْشٍ** with its verse reference. Teach **قريش** and **إِيلاف** as the phrase’s key vocabulary. Offer one selected translation with attribution/source and note that English renderings vary; do not declare “security,” “habituation,” or one historical explanation the only lexical meaning. Do not append words from outside the surah. |
| 2 — `ch39-l02` | `STANDARD` | **Ayah 2: The Winter and Summer Journeys** | Read **إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ** in the verse. Teach **رحلة، الشتاء، الصيف**, the attached **ـهم** only if it is within the learner’s known scope, and the phrase as a whole. Reuse Chapter 38’s coordination insight briefly: winter and summer are two coordinated nouns, not a dual inflection. Do not call **رِحْلَةَ** an accusative of purpose: the Quranic corpus marks it accusative, while detailed dependency analysis should be included only if checked and appropriate to the learner’s stage. Any Yemen/Syria caravan context must be labeled as a traditional explanatory account and sourced; it is not a grammar gloss. |
| 3 — `ch39-l03` | `STANDARD` | **Ayah 3: Worship the Lord of This House** | Read **فَلْيَعْبُدُوا رَبَّ هَذَا الْبَيْتِ**. Teach **يعبدوا، رب، هذا، البيت** as phrase-level vocabulary. Present **فَلْيَعْبُدُوا** as a learned phrase and convey its command in translation; do not teach **لام الأمر** or jussive morphology here unless those prerequisites have already been taught. Explain that **البيت** refers to the Sacred House/Kaʿbah with an appropriate source/context note. Do not insert unrelated roots or extra claims. |
| 4 — `ch39-l04` | `STANDARD` | **Ayah 4: Food and Safety** | Read the complete ayah-4 phrase **الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَآمَنَهُمْ مِنْ خَوْفٍ**. Teach the paired blessings, the two verbs with **ـهم**, and the paired phrases **مِنْ جُوعٍ / مِنْ خَوْفٍ**. If Form IV has not been established earlier, identify the two as learned verb forms without a broad “أ prefix always causes” rule. Keep the meanings contextual and source-aligned. |
| 5 — `ch39-l05` | `STANDARD` | **Read the Whole Surah: From Journey to Worship** | Add an integrated listen/read of all four exact ayat, with verse boundaries and reviewed translation. Retrieve a few known features (idafa, conjunction, preposition, object pronoun, familiar verb pattern) only as recognition supports; do not re-teach Chapter 38’s dual lesson or claim every word/grammar point has been mastered. Clearly label any optional tafsir/context outside the quoted Quran. |
| 6 — `ch39-l06` | `REVIEW` | **Surah Quraysh Vocabulary Retrieval** | Mix the chapter’s target vocabulary and phrase-level comprehension. Learners match words to meaning, restore phrase order, identify which of the four ayat contains a target, and explain the winter/summer and hunger/fear pairings. No imported “Quranic” lines or new grammar. |
| 7 — `ch39-l07` | `REVIEW` | **Chapter 39 Checkpoint** | Use a separate review-template lesson with the schema's top-level `assessment: { type: "CHAPTER_TEST", ... }` object. Assess the four-ayah vocabulary and phrase comprehension, one short full-surah listening/reading task, and at most a small amount of previously taught grammar retrieval. Do not test disputed tafsir, historical detail, new patterns, or every word in the surah. |

## Checkpoint blueprint

A concise 10–12-item checkpoint can cover:

- 2 items on **إِيلاف / قريش** in 106:1, with the selected translation’s source and no claim that one gloss exhausts the interpretive range;
- 2 items recognizing **رِحْلَة، الشِّتَاء، الصَّيْف** in 106:2 and the meaning of the whole phrase;
- 2 items on **فَلْيَعْبُدُوا رَبَّ هَذَا الْبَيْتِ** in 106:3;
- 2 items on the food/security parallel in 106:4, including the taught verb meanings and **مِنْ** phrases;
- 1–2 items identifying the ayah/verse boundary for a listened or read phrase; and
- 0–2 retrieval items using previously taught grammar in context.

Balance correct-answer positions, vary exercise types, and give concise evidence-based feedback. The checkpoint tests language learning—not tafsir, historical recall, or religious belief.

## Continuity with nearby chapters

- **Chapter 38 → Chapter 39:** Chapter 38's proposed dual unit explicitly distinguishes dual morphology from two nouns joined by **وَ**. Chapter 39 may reuse that insight briefly in **الشِّتَاءِ وَالصَّيْفِ**, but its objective is Quraysh vocabulary and reading, not another dual lesson.
- **Chapter 39 → Chapter 40:** Chapter 40 is mapped to sentence expansion with idafa, adjective, and prepositional phrases. Chapter 39 should give learners a sound Quranic example of a compact idafa/phrase in context, then leave systematic layering and adjective stacking to Chapter 40. Avoid trying to teach advanced parsing of every word here.
- **Reader leads, grammar serves:** Each lesson begins with the actual phrase in its ayah, teaches a small number of useful words, and uses grammar only to clarify that phrase. This keeps the chapter a Quranic Arabic reading lesson rather than an unsourced history lesson or generic grammar survey.
- **Quran integrity:** Preserve exact Quran text, surah/ayah labels, and reviewed translations. Any constructed practice is clearly distinguished from revelation and must not reuse Quran audio as if it were the constructed line.

## Arabic and Quran-content review

- The surah consists of four ayat; use the complete text and verse divisions as verified against the [Quranic Arabic Corpus — Surah Quraysh](https://corpus.quran.com/wordbyword.jsp?chapter=106&verse=1).
- The [Quranic Arabic Corpus syntax for 106:2](https://corpus.quran.com/treebank.jsp?chapter=106&verse=2) identifies **رِحْلَةَ** as accusative in the ayah. Keep that case ending and the ayah boundary exact; any separate standalone construct example should be labeled as such and its grammar reviewed independently.
- Translations of **إِيلاف** vary among “accustomed security,” “protection,” “taming,” and other renderings; the [Corpus translation page for 106:1](https://corpus.quran.com/translation.jsp?chapter=106&verse=1) displays parallel translations and supports careful wording rather than asserting a single uncontested gloss.
- The [Corpus morphology for 106:4](https://corpus.quran.com/treebank.jsp?chapter=106&token=2&verse=4) identifies **أَطْعَمَهُمْ** and **وَآمَنَهُمْ** as Form IV perfect verbs with attached third-person plural objects. Keep the actual **آمَنَ** form distinct from **أَمَّنَ**.
- For **بَيْع** as a verbal noun versus **بِيعَ** as a passive perfect, see the [Cairo Arabic Language Academy root entry for بيع](https://www.arabicacademy.gov.eg/ar/search_engine/roots/%D8%A8%D9%8A%D8%B9) and a [conjugation reference for بَاعَ](https://khatarabic.com/tools/conjugation/%D8%A8%D8%A7%D8%B9.html). This proposed chapter should remove that unrelated example rather than make learners absorb it.
- Traditional historical explanation appears in tafsir, e.g. [Al-Tabari on Surah Quraysh](https://quran.ksu.edu.sa/tafseer/tabary/sura106-aya1.html). If any route/context note is retained, attribute it as tafsir/historical explanation, not as the only meaning of a word or as Quranic wording.

These sources help verify Quran text, morphology, translation variation, and the distinction between grammar and interpretation. They do not replace qualified Arabic/Quran review, especially for learner-facing translations, Urdu copy, detailed case analysis, and contextual claims.

## Implementation checklist after approval

1. Align the Chapter 39 map’s title, description, hook, examples, parse, conversation, and focus records to the approved four-ayah progression and seven lessons. Preserve verse boundaries and the exact vocalization/case of Quran text; label any isolated or constructed grammar phrase as such.
2. Remove false/non-surah examples and any statement implying they are from Surah Quraysh; correct or remove **قَافِلَة**, **بِيعَ**, **آمَنَ / أَمَّنَ**, **سُوقًا**, **رِحْلَة**, and **الْوَهَّابُ** explanations as specified above.
3. Keep Quranic Arabic exact and verse-referenced. Review the translation choice, all Arabic vowelization, English claims, and Urdu copy with qualified reviewers. Label constructed examples and optional tafsir distinctly.
4. Add `ch39-l06` review and `ch39-l07` checkpoint using the canonical lesson schema/template; put the `CHAPTER_TEST` in the schema's top-level `assessment` field (not in the exercises array).
5. Reconcile stale map and fixture source references with the maintained content-source convention.
6. Run `npm run db:validate-fixtures` and `npm run content:check` from `warsh-backend` after approved edits. The current local validation passed, but the current parity check did not complete; do not claim parity or sync Git fixtures over Studio changes until a fresh check passes. Do not run the production seed for content work.
7. Account for learner “Updated” notices if published content changes.

## Acceptance criteria

- All quoted Quran text is exact, correctly attributed, and separated from constructed practice and commentary.
- Ayah boundaries are visible, and quoted forms preserve Quranic vocalization and case; any standalone grammatical recasting is explicitly labeled as non-ayah practice.
- No out-of-surah word or sentence is represented as Surah Quraysh vocabulary or text.
- **إِيلاف** is explained with an appropriately qualified gloss; a particular historical/tafsir interpretation is not presented as a direct lexical certainty.
- The lessons distinguish **آمَنَ** from **أَمَّنَ**, **بَيْعٌ** from **بِيعَ** if that form is retained, and remove false grammatical labels and fabricated patterns.
- Every teaching lesson has a distinct verse-linked objective; the integration lesson, retrieval review, and checkpoint are not redundant copies of one another.
- Chapter 39 reuses Chapter 38 and prepares Chapter 40 without re-teaching duals or overloading this short-surah unit with advanced iʿrāb.
- Map, fixtures, English, Urdu, and assessment agree; approved fixtures pass schema validation and database parity checks before publication.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–5 | `ch39-l01`–`ch39-l05` | `STANDARD` | `chapter-39-lesson-01.json`–`-05.json` |
| 6 | `ch39-l06` (new) | `REVIEW` | `chapter-39-lesson-06-review.json` |
| 7 | `ch39-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-39-lesson-07-final-test.json` |

**Corrections**

1. The checkpoint is `ch39-test`, not `ch39-l07` (S2).
2. **لِإِيلَافِ** is a Form IV maṣdar — Chapter 36 introduced the pattern; Lesson 1 names the link. **أَطْعَمَهُمْ / آمَنَهُمْ** are then the Form IV verbs (Lesson 4).
3. The text above had **إِيلافِهِمْ** without the fatḥa on the lām; corrected to **إِيلَافِهِمْ**.
4. **فَلْيَعْبُدُوا** stays a phrase; **لَام الأمر** is taught in Chapter 68.
