# Chapter 35 — Future Meaning with سَـ and سَوْفَ

**Status:** Proposal only — not approved or implemented
**Evidence reviewed:** Chapter 35 map and all five registered fixtures; Chapter 34 proposal/current map and Chapters 36–37 map entries for continuity; fixture/source metadata; and an attempted read-only `content:check` on 2026-09-30. The command did not complete because the Prisma/PostgreSQL connection terminated unexpectedly, so fixture/database parity is unverified. No database changes were made.
**Scope:** Chapter 35 content, assessment, map alignment, and handoff to Chapter 36. No fixture, seed, or database changes are included.

## Recommendation

Keep the chapter's core outcome: learners use **سَـ** and **سَوْفَ** to recognize explicit future reference and read those forms in context. Rebuild the chapter around a clear progression: recall the imperfect from Chapter 34; learn both future markers without an absolute near/far or certainty rule; read verified Quranic examples; contrast present/habitual, future, and previously learned past/imperative forms; recognize future negation with **لَنْ**; then complete retrieval review and a chapter checkpoint. Because grammar references differ on whether **سَـ** and **سَوْفَ** reliably encode near versus remote future, teach the shared future function first. If the traditional near/far tendency is mentioned, label it as one description rather than a rule learners can infer mechanically or be tested on as an absolute.

Five 8-minute lessons are currently all presented as new instruction with no review or test. The topic can be understood at this level with **five focused teaching lessons plus a separate review and checkpoint**—seven lessons total. This is a purposeful addition, not extra content for its own sake: the existing sequence does not reliably teach the chapter's target, repeatedly drills the same exercise pattern, and never assesses the stated outcomes. Keep **لَنْ** at recognition level here; formally teach its subjunctive effect in mapped Chapter 45, the foundation lesson on the three states of **المضارع**.

## Current-state audit

The map calls the chapter “Future with سَ and سَوْفَ,” but its description promises “near and emphatic” future. Its hook is Al-Ma'idah 5:54, while the actual lesson hooks include Al-Kawthar 108:2 (an imperative with no future marker), Az-Zumar 39:10 and 39:11 (neither contains the target markers), and Al-Kawthar 108:1 (a past-tense verb). The map has four focus records for five fixture lessons. All five fixtures are `STANDARD`, each with the same seven-exercise sequence; each lesson's two `TAP_TRANSLATION` answers are both at choice index 0. None contains a `CHAPTER_TEST`.

The map refers to `reader_lecture_35_future_sa_sawfa.md`; all fixtures refer to `book4_lesson1_future_tense.md`. Neither source exists at the referenced `warsh-backend/prisma/` path. Treat these as source-metadata gaps. The failed parity check does not establish either drift or synchronization. The map's parse tokens also label **سَوْفَ** as **حرف جر** (a preposition), although it is a future particle (**حرف استقبال**).

### Issues and fixes

| Priority | Issue | Proposed fix |
|---|---|---|
| Critical | **The chapter teaches a rigid semantic rule that is not reliable.** Lessons and the map say **سَـ** means near/immediate future while **سَوْفَ** means distant or emphatic future; the Noor tip further claims **سَوْفَ** itself adds certainty to every divine promise. The markers both express future reference, and a near/far contrast is at most a contextual tendency—not a dependable rule learners should use to date an event or infer certainty. | Teach the shared future function first. Explain that the two forms are often interchangeable and that context, genre, and surrounding time expressions matter; if an introductory tradition notes a tendency, qualify it explicitly as non-absolute. Remove “سَوْفَ adds certainty,” “always,” and fixed promise/warning readings from the particle definition. |
| Critical | **Several lesson hooks do not contain the target form.** Al-Kawthar 108:2 is **فَصَلِّ لِرَبِّكَ وَانْحَرْ** (“so pray to your Lord and sacrifice”), a command, not a future-marked verb. Az-Zumar 39:10 and 39:11 contain no **سَـ / سَوْفَ** example. Al-Kawthar 108:1 **إِنَّا أَعْطَيْنَاكَ** uses a past/perfect verb. | Select hooks that actually contain the lesson's target and reference them precisely. Al-Ma'idah 5:54 contains **فَسَوْفَ يَأْتِي**; At-Takathur 102:3–4 contains **سَوْفَ تَعْلَمُونَ**. Keep any command/past contrast clearly labeled as retrieval, not evidence for the future marker. |
| Critical | **One plural form is misanalyzed.** Lesson 3 says **يَـ** in **يَحْزَنُونَ** means “they.” The prefix identifies a third-person masculine imperfect pattern; the plural is signaled by the ending **ـُونَ**. | Correct the segmentation: identify the imperfect stem/prefix and the plural ending together. Coordinate with Chapter 34's proposed scope, which also cautions against treating a prefix as a complete person/number/gender label. |
| Critical | **Lesson 1 teaches an invalid imperfect form for the weak verb قَالَ.** Its feedback says the present form is **قُولُ** (“he says”), then adds **سَـ** to explain **سَيَقُولُ**. **قُولُ** is not the standard third-person masculine singular imperfect; the correct form is **يَقُولُ**. | Correct all paradigms, transliterations, segmentations, and feedback to **يَقُولُ → سَيَقُولُ**. Explain that the weak root's imperfect stem is not obtained by simply writing its consonants as قُولُ; have the weak-verb form reviewed. |
| High | **Quranic Arabic is quoted or presented without adequate source labeling.** Lesson 3 displays **وَلَكُمْ مَا كَسَبْتُمْ وَلَنَا مَا اكْتَسَبْنَا** as an example in “Quranic passages,” although this exact wording is not identified with a verse and appears to combine/recast language from elsewhere. Lesson 4 combines “Indeed, Allah does not fail His promise” with “but most people do not know,” without marking the clauses as coming from different contexts. | For every Quranic excerpt, include exact text, surah/ayah, and faithful reviewed translation. For constructed practice, label it as constructed and do not use Quran-like quotation styling. Do not splice separated verses into a purported quotation; if a composite is needed pedagogically, identify it as a constructed sentence and source its vocabulary/clauses. |
| High | **The hook/exercise/reveal chain is not aligned.** Lesson 2 hooks Az-Zumar 39:10 but teaches **سَوْفَ تَعْلَمُونَ** and ends with “no fear … nor grieve.” Lesson 3 hooks 39:11 but mixes in **سَوْفَ تَعْلَمُونَ**, past **كَسَبْتُمْ**, passive **أُمِرْتُ**, and subjunctive **أَعْبُدَ**. Lesson 4 hooks 39:10 but teaches **لَا يُخْلِفُ اللَّهَ الْمِيعَادَ** and another unreferenced clause. | Give each lesson one coherent passage or a transparently labeled constructed comparison. Tie the hook, target examples, practice, and reveal to the same objective; introduce past, imperative, or subjunctive forms only as brief, accurately labeled retrieval contrasts. |
| High | **Quranic context is turned into unsupported grammatical/theological meaning.** The map says **سَوْفَ** makes Allah's promise “always certain” and adds certainty; Lesson 3's gloss says **سَوْفَ تَعْلَمُونَ** entails a warning about believers' reward and disbelievers' consequences. Neither claim follows from the particle alone, and the latter does not describe the context of the cited phrase accurately. | Separate grammar from interpretation. Explain what the marker contributes linguistically, then paraphrase the verse's context carefully with a qualified Quran reviewer. Do not make doctrinal claims or assign promise/warning solely from **سَـ / سَوْفَ**. |
| High | **Future negation is surfaced but not taught.** **لَنْ** appears as a distractor, and future negation is mentioned in the fixtures' future-tense explanation but never practiced. Simply saying “future = سَـ / سَوْفَ + imperfect” leaves a common Quranic/Arabic construction unexplained. | Add a focused, bounded lesson introducing **لَنْ + imperfect** as a common way to negate a future action. At this stage, teach recognition and a few reviewed examples; tell learners the following imperfect changes state, but do not teach or assess the ending rule yet. Chapter 45 is already mapped to formally teach **لَنْ** under **منصوب**; use that as the deliberate revisit, after correcting Chapter 45's current map errors (it glosses **لَنْ** as “will never” and mislabels it **حرف جر**). Remove **لَنْ** as an unexplained distractor elsewhere. |
| High | **Lesson 2's “no fear” card is an incomplete and oversimplified fragment.** It isolates **لَا خَوْفٌ** as a complete nominal sentence and glosses **لَا** as generic negation plus **خَوْفٌ** as “the subject,” omitting **عَلَيْهِمْ** and the particular construction used in the verse. | Present the complete, referenced phrase **لَا خَوْفٌ عَلَيْهِمْ** and explain it only to the level previously taught. The Quranic Arabic Corpus analyzes this **لَا** as a negator functioning like **لَيْسَ** in the cited construction; do not conflate it with the **لَا النافية** lesson from Chapter 34 or with prohibitive **لَا**. |
| High | **The final lesson's capstone does not assess future forms and its bridge is premature/unclear.** Lesson 5 uses Al-Kawthar 108:1–2 to review a past form and imperatives, yet its title/reveal call it a future/past capstone and the chapter close claims present/future mastery. It then previews Book 5 as conjugation, while the next mapped chapter (36) is the verbal noun and Chapter 37 is feminine verb forms. | Replace the lesson's new instruction with a genuine mixed review of the actual Chapter 35 outcomes. Add a separate checkpoint. Make the next-step preview accurate to the approved course map: Chapter 36 is **المصدر**, followed by Chapter 37 feminine verb forms. Remove “mastery” claims and avoid stating chapter/book completion beyond verified course boundaries. |
| Medium | **Map/fixture objectives and progression disagree.** The map has four focus records, while five lesson fixtures include additional past/present contrasts and a Book 5 bridge; the map title does not mention negation. | After approval, align the map's title, description, Quran hook, focus records, lesson objectives, and final checkpoint to the same five outcomes: formation, use in context, comparison, limited negation recognition, and transfer. |
| High | **The map mislabels سَوْفَ in its parsing data.** It assigns **حرف جر** (“preposition”), a part-of-speech error that could teach learners to confuse future marking with a prepositional phrase. | Change the token label to a level-appropriate future-particle label such as **حرف استقبال** and verify the English gloss and segmentation. Keep the map parse consistent with the lesson explanation. |
| Medium | **Lesson 1's explanation overstates the interpretation of Al-Kawthar 108:2.** It calls the commands **فَصَلِّ** and **وَانْحَرْ** “instructions for the ritual of Hajj,” narrowing the verse's language to a specific interpretive frame while the lesson only needs to identify imperatives. | Say only that these are imperative forms in the quoted verse. If a ritual-specific interpretation is desired, cite and review an appropriate tafsir source in a separate context note; it is not needed to teach future marking. |
| Medium | **Practice is formulaic and guessable.** All five lessons contain the same seven-item sequence, with two translation items each and both correct answers at choice 0. | Vary exercise types and ordering; balance correct-answer positions; use distractors that diagnose real confusions (future marker vs. imperfect alone, attached vs. separate marker, past/imperative contrast). Give explanatory feedback rather than repeating the translation. |

## Proposed lesson sequence

Keep `ch35-l01` through `ch35-l04` for the four existing instructional themes, but rewrite them. Convert the current `ch35-l05` Book 5 bridge slot into the fifth teaching lesson on future negation; replace its premature bridge/capstone claims. Add `ch35-l06` for retrieval review and `ch35-l07` for the final checkpoint. This produces **seven** focused lessons and keeps template use within the current schema.

| Order / ID | Template | Proposed lesson | Scope and design |
|---|---|---|---|
| 1 — `ch35-l01` | `STANDARD` | **How Arabic Marks Future Meaning** | Bridge from Chapter 34: the verb remains an imperfect form, and **سَـ** attaches directly before it. Teach a few common subject forms in short, clear examples; preserve the **تَـ** ambiguity from Chapter 34 and do not call the imperfect a standalone “present tense” in every context. Use a hook that contains a verified future marker. Correct weak-verb exemplars such as **يَقُولُ → سَيَقُولُ**. |
| 2 — `ch35-l02` | `STANDARD` | **سَـ and سَوْفَ in Context** | Introduce **سَوْفَ** as a separate word before the imperfect and compare it with attached **سَـ**. Learners classify explicit future reference, but are not asked to infer exact distance, certainty, or promise/warning from the marker alone. Contrast contextually supported translations, not absolute rules. |
| 3 — `ch35-l03` | `STANDARD` | **Read Future Forms in Quranic Excerpts** | Use one or two exact, cited excerpts that contain the target (for example, Al-Ma'idah 5:54 and/or At-Takathur 102:3–4). Keep passages short, analyze marker + verb, and distinguish the linguistic observation from contextual interpretation. Avoid unreferenced or synthetically merged Arabic. |
| 4 — `ch35-l04` | `STANDARD` | **Present, Future, and Earlier Verb Forms** | Contrast an imperfect used for present/habitual meaning, a future-marked imperfect, and familiar past/imperative retrieval. Use context and time expressions as well as morphology; label each form precisely. Correct **يَحْزَنُونَ** by teaching **يَـ** together with its **ـُونَ** plural ending. |
| 5 — `ch35-l05` | `STANDARD` | **Recognize Future Negation with لَنْ** | Teach **لَنْ + imperfect** as a common future-negative construction at recognition level. Show a small set of reviewed examples and note that **لَنْ** changes the grammatical state of the following imperfect; do not teach or assess its ending here. Chapter 45 formally revisits **لَنْ** as a trigger for **منصوب**; correct that chapter's existing “will never” gloss and **حرف جر** label before relying on it as the follow-up. Remove the unexplained **لَنْ** distractor. |
| 6 — `ch35-l06` | `REVIEW` | **Retrieve and Apply Future Meaning** | Add a review lesson drawing on the chapter's newly taught forms and Chapter 34 imperfect recognition, with previously learned past/imperative forms as retrieval. Use short, accurately labeled contexts; one task should require learners to explain what evidence signals future rather than simply translate. End with a modest preview of Chapter 36, **المصدر**, and mention Chapter 37 only as a later expansion. |
| 7 — `ch35-l07` | `REVIEW` | **Chapter 35 Checkpoint** | Add the schema-supported top-level `assessment` payload with `type: CHAPTER_TEST`. Assess form, context, **سَـ / سَوْفَ** recognition, a past/present/future distinction, and introductory **لَنْ** recognition. Include feedback and varied formats; do not test detailed subjunctive endings, tafsir, or precise near/far predictions. |

## Checkpoint blueprint

A 10–12 item test can assess:

- 2 items identifying the imperfect verb and attached **سَـ**;
- 2 items recognizing **سَوْفَ** as a separate future marker and comparing the two without imposing an absolute temporal distinction;
- 2 short-context items distinguishing a present/habitual imperfect from an explicitly future-marked form;
- 2 retrieval items distinguishing future forms from familiar past or imperative forms;
- 1–2 recognition items for **لَنْ + imperfect**, without detailed mood parsing; and
- 1–2 short reading/comprehension items from exact, verified Quranic excerpts.

Vary exercise types and answer positions. Distractors should represent plausible confusions and feedback should identify the form/context clue. Do not assess interpretive doctrine, detailed subjunctive morphology, or unsupported meanings such as “this particle always guarantees certainty.”

## Continuity and placement

- **Chapter 34 → Chapter 35:** Chapter 34 should establish the imperfect as context-sensitive and teach only a bounded set of forms. Chapter 35 then adds **سَـ / سَوْفَ** to those imperfect forms; it should not re-teach all present forms or claim mastery of the complete conjugation system.
- **Chapter 35 → Chapter 36:** Current map sequence moves to **المصدر (the verbal noun)**. The review should name this as the next topic rather than claiming Chapter 35 has already taught all Book 4/5 verb material.
- **Chapter 37:** The map then introduces feminine verb forms. Chapter 35 should not imply that learners already command masculine/feminine, singular/plural/dual agreement; foreshadow that this later chapter expands agreement patterns.
- **Negation and planned revisit:** Chapter 34's proposal focuses on **لَا النافية**; Chapter 35 introduces **لَنْ** only as a future-negation cue, not as a taught paradigm. Chapter 45 is mapped to teach **لَنْ** again as a منصوب trigger, which is a deliberate spiral from recognition to form. Its current map calls **لَنْ** a preposition and glosses it “will never”; fix these before publication. Do not use **لَا، لَنْ، لَمْ،** and prohibitive **لَا** interchangeably.

## Arabic and Quran-content review

- The future marker examples at Al-Ma'idah 5:54 include **فَسَوْفَ يَأْتِي**. [QAC, Al-Ma'idah 5:54](https://corpus.quran.com/grammar.jsp?chapter=5&verse=54)
- **سَوْفَ تَعْلَمُونَ** appears in At-Takathur 102:3–4. Preserve the passage and its context when quoting or interpreting it. [QAC, At-Takathur 102:3](https://corpus.quran.com/grammar.jsp?chapter=102&verse=3)
- Al-Kawthar 108:2 contains imperative forms and no **سَـ / سَوْفَ** marker; Al-Kawthar 108:1 contains **أَعْطَيْنَاكَ**, not a future form. [QAC, Al-Kawthar 108:2](https://corpus.quran.com/grammar.jsp?chapter=108&verse=2), [QAC, Al-Kawthar 108:1](https://corpus.quran.com/grammar.jsp?chapter=108&verse=1)
- In Al-Baqarah 2:38, **يَحْزَنُونَ** is a third-person masculine plural imperfect form; the plural ending must not be attributed to **يَـ** alone. [QAC, Al-Baqarah 2:38 morphology](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=38)
- The phrase **لَا خَوْفٌ عَلَيْهِمْ** requires its complete context; the QAC grammar analysis identifies **لَا** there as negating like **لَيْسَ** with **خَوْفٌ** as its noun, not as a generic rule for every **لَا**. [QAC, Yunus 10:62 grammar](https://corpus.quran.com/grammar.jsp?chapter=10&verse=62)
- The fixture's line **وَلَكُمْ مَا كَسَبْتُمْ** occurs in Al-Baqarah 2:134 and 2:141; do not extend it into **وَلَنَا مَا اكْتَسَبْنَا** and present the result as Quranic text. [QAC, root ك-س-ب](https://corpus.quran.com/qurandictionary.jsp?q=ksb)
- **لَنْ** is a نصب particle before an imperfect verb; Chapter 35 should flag the construction at recognition level, while mapped Chapter 45 owns the formal mood/ending lesson. The current Chapter 45 map must be corrected before implementation: its example/description says “will never” and labels **لَنْ** **حرف جر**. [QAC, subjunctive and jussive moods](https://corpus.quran.com/documentation/mood.jsp); [Chapter 45 curriculum map](../../warsh-backend/prisma/curriculum-books5-6.cjs)
- Arabic grammar literature does not support teaching one unqualified near/far rule: a research discussion documents both analyses (no meaningful difference versus a near/remote tendency). Teach both as future markers and, if useful, note the traditional tendency as non-absolute. [Abdel-Hafiz, “The Development of Future Markers in Arabic and the Nile Nubian Languages,” *Journal of Arabic and Islamic Studies*](https://www.lancaster.ac.uk/jais/volume/docs/vol6/v6_3_Sokarno.htm)
- The Quranic Arabic Corpus labels **سَوْفَ** a future particle (**حرف استقبال**), not a preposition. [QAC, At-Takathur 102:3](https://corpus.quran.com/treebank.jsp?chapter=102&verse=3)

These references support the specific linguistic corrections, but an Arabic and Quran-content reviewer should verify every quotation, vocalization, translation, grammatical claim, and interpretive explanation before publication.

## Implementation checklist after approval

1. Update Chapter 35 map and fixtures together. Add a fifth map focus or otherwise ensure each instructional lesson has a matching objective; add checkpoint focus/metadata if the map schema supports it.
2. Replace hooks that do not contain the target future form; verify every Quran excerpt against its exact verse and label constructed examples.
3. Correct the semantic overclaims, **يَحْزَنُونَ** segmentation, the incomplete **لَا خَوْفٌ** explanation, and the Book 5/next-chapter preview.
4. Rewrite `ch35-l05` as the bounded future-negation lesson; add `ch35-l06` review and `ch35-l07` checkpoint in the schema-supported form and seed order.
5. Have qualified reviewers verify Arabic, Quranic citations, translation, Urdu, and the placement of **لَنْ** and its mood explanation.
6. Run `npm run db:validate-fixtures` and `npm run content:check` from `warsh-backend` after approved edits. Do not overwrite Studio content when `content:check` reports divergence; do not run the production seed for this content work.
7. Account for the learner “Updated” notices that can follow edits to published lessons.

## Acceptance criteria

- Every lesson hook, Quranic example, exercise, and reveal matches the stated objective and cites exact scripture where applicable.
- Learners understand the shared future function of **سَـ** and **سَوْفَ** without learning a false fixed distance/certainty contrast.
- The plural morphology of forms such as **يَحْزَنُونَ** is correctly explained as prefix plus ending.
- Quranic excerpts are exact, contextualized, and distinguished from constructed examples; no verse fragments are silently merged.
- **لَنْ** is taught to the stated recognition depth in Chapter 35 and formally revisited as a منصوب trigger in Chapter 45 after that chapter's map errors are corrected; neither chapter assumes the learner has mastered more than its stated scope.
- The five instructional lessons, review, and checkpoint form a coherent sequence from Chapter 34 and lead accurately into Chapters 36–37.
- Practice varies in type and answer position; the final assessment measures the taught outcomes and gives useful feedback.
- Approved fixtures pass validation and database parity checks before publication.

## Review amendments (2026-10-01)

Applies the shared rules S1–S13 in [chapters-26-68-review.md](chapters-26-68-review.md): test ID and length, fixture naming, learner progress, illustrations, provenance and scholarly review. Where this section and the text above disagree, this section wins.

**Final plan**

| Order | ID | Template | Fixture file |
|---|---|---|---|
| 1–5 | `ch35-l01`–`ch35-l05` | `STANDARD` | `chapter-35-lesson-01.json`–`-05.json` |
| 6 | `ch35-l06` (new) | `REVIEW` | `chapter-35-lesson-06-review.json` |
| 7 | `ch35-test` (new) | `REVIEW` + `CHAPTER_TEST` | `chapter-35-lesson-07-final-test.json` |

**Corrections**

1. The checkpoint is `ch35-test`, not `ch35-l07` (S2).
2. The proposal names no verified **سَـ** example. Use **سَيَقُولُ السُّفَهَاءُ مِنَ النَّاسِ** (Al-Baqarah 2:142, verified) for Lesson 1 — it models exactly the corrected **يَقُولُ → سَيَقُولُ**. Chapter 62 currently hooks 2:142 too; the Chapter 62 amendments move it off.
3. The Abdel-Hafiz reference in the source list has not been checked; keep the teaching point (no fixed near/far rule) and drop the citation if it cannot be confirmed.
4. **لَا خَوْفٌ عَلَيْهِمْ** occurs in both 2:38 and 10:62; cite whichever verse the card quotes.
