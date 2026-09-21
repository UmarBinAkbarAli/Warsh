# Chapter 14 Content Proposal — Describing Plurals

**Status:** Implemented in the isolated staging database and verified on the emulator and through the API on 2026-09-21 on the owner's "implement chapter-14"; **production promotion pending** (`npm run content:promote-chapter-fourteen -- --apply`). Scholarly review of the grammar explanations has not been recorded. See "Implementation notes" at the end.  
**Scope:** Curriculum content only; no fixture, database, application, or media changes are authorized by this document  
**Chapter:** Book 1, Chapter 14  
**Proposed size:** Six lessons plus one final chapter test

## 1. Purpose

Chapter 14 should teach learners how plural nouns are described in Quranic Arabic without collapsing several different grammar ideas into one rule.

After completing the chapter, a learner should be able to:

1. describe human plurals with an appropriate plural adjective;
2. apply the beginner-level default that non-human plurals commonly take feminine-singular agreement;
3. distinguish a descriptive noun phrase from a complete nominal sentence;
4. classify a plural as grammatically human or non-human for the lesson's agreement task;
5. recognize both the default non-human pattern and a genuine Quranic variation; and
6. demonstrate these skills in a separate, graded chapter test.

The chapter should not promise that the learner can describe “any plural noun correctly.” Its goal is controlled beginner competence plus accurate recognition of one important Quranic variation.

## 2. Why revision is needed

The current five-lesson chapter has useful vocabulary and practice, but it is not ready for publication in its present form.

### Critical content issues

- The explanation of **مَطْوِيَّاتٌ** in Az-Zumar 39:67 is grammatically incorrect. It is a feminine-plural passive participle, not a feminine-singular adjective.
- The chapter does not clearly distinguish an attributive phrase such as **الْكُتُبُ الْجَدِيدَةُ** (“the new books”) from a nominal sentence such as **الْكُتُبُ جَدِيدَةٌ** (“the books are new”).
- Several Quran hooks contain no adjective agreement and therefore do not directly demonstrate the lesson objective.
- **الْأَرَضُونَ** is presented as Quran vocabulary although this form is not attested in the Quran.
- The Urdu term **کسرہ جمع** is incorrect in this context; it should be **جمع مکسر**.
- Some explanations reduce the human/non-human distinction to whether something “can think.” That is not precise enough for Quranic Arabic instruction.
- The statement that feminine **ة** always signals a non-human plural pattern is too broad.
- Transliteration repeatedly renders nominative **ـةٌ** as *-atan* instead of *-atun* and is inconsistent in its treatment of long vowels.
- Quran reveal targets are not consistently the words that carry the lesson's grammar point, and the reveals omit `highlighted_words`.
- The current review is too small for the chapter's conceptual load, and the chapter has no distinct final test.

### Structural issue

The current chapter tries to teach plural agreement, Quran examples, human/non-human classification, and review in five lessons. A six-lesson sequence plus a final test gives the phrase-versus-sentence distinction and Quranic variation their own instructional space.

## 3. Proposed chapter sequence

| Order | Stable content ID | Proposed title | Template | Primary outcome |
|---:|---|---|---|---|
| 1 | `ch14-l01` | Human Plurals and Plural Adjectives | `STANDARD` | Match human plural nouns with suitable plural adjectives. |
| 2 | `ch14-l02` | Non-Human Plurals: The Feminine-Singular Default | `STANDARD` | Apply the beginner default to common non-human plurals. |
| 3 | `ch14-l03` | Descriptive Phrase or Complete Sentence? | `STANDARD` | Distinguish adjective phrases from nominal sentences. |
| 4 | `ch14-l04` | Human or Non-Human? Choosing the Agreement | `STANDARD` | Classify the noun first, then choose the expected agreement. |
| 5 | `ch14-l06` | Quranic Agreement: Default Pattern and Variation | `STANDARD` | Recognize the default pattern and an attested feminine-plural variation. |
| 6 | `ch14-l05` | Chapter 14 Review | `REVIEW` | Integrate all taught skills without introducing new grammar. |
| 7 | `ch14-test` | Chapter 14 Test | `REVIEW` | Assess chapter mastery independently from the review lesson. |

The existing review keeps the stable ID `ch14-l05` but moves to display order 6. The new recognition lesson uses `ch14-l06`, avoiding unnecessary identity changes to existing lessons and learner progress.

## 4. Lesson proposals

### Lesson 1 — Human Plurals and Plural Adjectives

**Keep:** `ch14-l01`  
**Recommended size:** 8 teaching cards and 7 exercises

#### Learning objective

Given a familiar human plural, the learner selects or builds an adjective that agrees appropriately in number, gender, and definiteness at the level taught in Book 1.

#### Teach

- Human masculine plural examples such as **الطُّلَّابُ الْمُجْتَهِدُونَ**.
- Human feminine plural examples such as **الطَّالِبَاتُ الْمُجْتَهِدَاتُ**.
- Definite nouns normally pair with definite attributive adjectives.
- A plural adjective is not limited to the sound endings **ـونَ / ـينَ** or **ـات**. A broken plural adjective such as **كِرَامٌ** can also describe human plurals.
- Use **جمع مكسر** consistently in Urdu.

#### Quran anchor

Use **بَلْ عِبَادٌ مُكْرَمُونَ** (Al-Anbiya 21:26) as the direct human-plural agreement example. The reveal should target **مُكْرَمُونَ**, not an unrelated word.

The exact Uthmani text, reference, audio segment, token index, and morphology must be reverified before implementation.

#### Do not teach here

- a full case-ending system;
- the claim that every human masculine plural adjective ends in **ـونَ / ـينَ**; or
- a Quran hook that contains a human plural but no descriptive relationship.

### Lesson 2 — Non-Human Plurals: The Feminine-Singular Default

**Keep:** `ch14-l02`  
**Recommended size:** 8 teaching cards and 7 exercises

#### Learning objective

Given a familiar non-human plural in a controlled beginner example, the learner applies the common feminine-singular adjective pattern.

#### Teach

- The beginner default through clear pairs such as:
  - **الْكُتُبُ الْجَدِيدَةُ** — the new books;
  - **الْبُيُوتُ الْكَبِيرَةُ** — the large houses;
  - **الْمَسَاجِدُ الْكَبِيرَةُ** — the large mosques.
- The noun is plural in meaning while the adjective commonly appears feminine singular.
- Present this as a strong default for beginner production, not an exceptionless claim about every Quranic construction.

#### Quran anchor

Use **فِيهَا سُرُرٌ مَرْفُوعَةٌ** (Al-Ghashiyah 88:13). The target word is **مَرْفُوعَةٌ**, with the noun-adjective relationship made explicit.

#### Required corrections

- Remove the Al-Ma'un 107:2 hook; it does not demonstrate non-human plural adjective agreement.
- Replace “Can it think?” with the grammatical classification “Does this plural refer to human beings in this construction?”
- Remove speculative explanations about collective or mass meaning unless separately sourced and necessary.
- Correct the Noor introduction wording so it does not contain the malformed comparison “not جديدة جديد.”
- Do not say that **ة** always proves the rule. It is evidence in a controlled example, not a universal diagnostic.

### Lesson 3 — Descriptive Phrase or Complete Sentence?

**Repurpose:** `ch14-l03`  
**Recommended size:** 8 teaching cards and 8 exercises

#### Learning objective

The learner distinguishes a noun-plus-adjective phrase from a subject-plus-predicate sentence by using definiteness and meaning.

#### Core contrasts

| Descriptive phrase | Complete sentence |
|---|---|
| **الْكُتُبُ الْجَدِيدَةُ** — the new books | **الْكُتُبُ جَدِيدَةٌ** — the books are new |
| **الطُّلَّابُ الْمُجْتَهِدُونَ** — the hardworking students | **الطُّلَّابُ مُجْتَهِدُونَ** — the students are hardworking |
| **الْمَسَاجِدُ الْكَبِيرَةُ** — the large mosques | **الْمَسَاجِدُ كَبِيرَةٌ** — the mosques are large |

The lesson should name the roles in plain language first: “describing word inside a phrase” versus “information stated about the noun.” Arabic grammar labels may appear as secondary terminology, not as the primary teaching burden.

#### Quran anchor

Use **وَأَكْوَابٌ مَوْضُوعَةٌ** (Al-Ghashiyah 88:14), targeting **مَوْضُوعَةٌ**. Explain the local noun-adjective relationship without falsely presenting the extracted phrase as the whole syntactic analysis of the verse.

#### Remove from this lesson

- The current incorrect explanation of **مَطْوِيَّاتٌ**.
- **جَنَّاتٌ تَجْرِي ...** as evidence for adjective agreement. Its prominent relation is verbal and belongs in a later verb-agreement lesson.
- **الْأَرَضُونَ** as Quran vocabulary.

### Lesson 4 — Human or Non-Human? Choosing the Agreement

**Keep:** `ch14-l04`  
**Recommended size:** 8 teaching cards and 9 exercises

#### Learning objective

The learner classifies a plural by its referent and then chooses the chapter's expected adjective pattern.

#### Teach

1. Identify what the plural refers to.
2. If it refers to human beings, expect a suitable plural adjective in the controlled examples.
3. If it is non-human, apply the feminine-singular default learned in Lesson 2.
4. Check definiteness to decide whether the result is a matching descriptive phrase or a sentence.

Exercises should mix human and non-human nouns rather than presenting them in predictable blocks. At least two items should require the learner to explain the choice, not merely select an ending.

#### Quran anchor

Contrast a verified human example from Al-Anbiya 21:26 with a verified non-human example from Al-Ghashiyah 88:13–16. The final implementation may reuse previously learned verses because this lesson tests classification, but every reveal must target the adjective carrying the agreement.

#### Required correction

Do not state or imply that the adjective form alone always identifies whether the noun is human or non-human. Meaning and construction must be considered first.

### Lesson 5 — Quranic Agreement: Default Pattern and Variation

**New stable ID:** `ch14-l06`  
**Display order:** 5  
**Recommended size:** 7 teaching cards and 6 recognition exercises

#### Learning objective

The learner recognizes the productive beginner default in Quranic examples and correctly identifies a verified Quranic example that uses full feminine-plural agreement.

#### Default-pattern set

Use the connected examples in Al-Ghashiyah 88:13–16:

- **سُرُرٌ مَرْفُوعَةٌ**
- **أَكْوَابٌ مَوْضُوعَةٌ**
- **نَمَارِقُ مَصْفُوفَةٌ**
- **زَرَابِيُّ مَبْثُوثَةٌ**

These provide repeated Quranic recognition of non-human plural nouns with feminine-singular descriptors.

#### Variation

Use **وَالسَّمَاوَاتُ مَطْوِيَّاتٌ بِيَمِينِهِ** (Az-Zumar 39:67). Teach accurately that **مَطْوِيَّاتٌ** is feminine plural.

The instructional message should be:

> The feminine-singular form is the productive beginner default for describing non-human plurals. Quranic and Classical Arabic can also contain other attested agreement patterns. Here, **مَطْوِيَّاتٌ** is feminine plural, so recognize the form as it appears in the verse.

This is a recognition lesson. Learners should continue to use the beginner default in ordinary production exercises unless a learned Quranic phrase is being recalled.

#### Guardrails

- Do not call **مَطْوِيَّاتٌ** feminine singular.
- Do not present one verse as a complete taxonomy of Classical Arabic agreement.
- Do not ask beginners to generate unseen exceptions.
- Scholarly review is required for the final explanation and any additional variation examples.

### Lesson 6 — Chapter 14 Review

**Keep stable ID:** `ch14-l05`  
**Move to display order:** 6  
**Template:** `REVIEW`  
**Recommended size:** 8 review cards and 10 exercises

#### Review coverage

- human masculine plural agreement;
- human feminine plural agreement;
- a broken plural adjective such as **كِرَامٌ**;
- non-human feminine-singular default;
- definite descriptive phrase versus indefinite predicate;
- human/non-human classification;
- direct Quran target recognition; and
- recognition of **مَطْوِيَّاتٌ** as a feminine-plural Quranic variation.

The review must not introduce a new rule. Its close should say that the learner can handle the chapter's taught patterns, not “any plural noun.”

### Final item — Chapter 14 Test

**New stable ID:** `ch14-test`  
**Display order:** 7  
**Template:** `REVIEW` with a valid `assessment` payload  
**Assessment type:** `CHAPTER_TEST`

#### Proposed assessment design

- 12 graded questions;
- passing threshold: 80%, operationalized as 10 correct answers out of 12;
- server-graded completion;
- retries allowed under the existing product rules;
- no duplicate completion or reward grant on retry.

#### Question blueprint

| Skill | Questions |
|---|---:|
| Human masculine plural adjective | 1 |
| Human feminine plural adjective | 1 |
| Human broken-plural adjective recognition | 1 |
| Definiteness matching | 1 |
| Non-human feminine-singular default | 2 |
| Descriptive phrase versus nominal sentence | 2 |
| Human/non-human classification | 1 |
| Al-Ghashiyah 88:13 target recognition | 1 |
| Az-Zumar 39:67 variation recognition | 1 |
| Mixed Quran reading/build-or-parse task | 1 |
| **Total** | **12** |

The test should exclude full case theory, verb agreement, number grammar, and unseen Classical Arabic exceptions.

## 5. Quran reveal plan

| Lesson | Reference | Intended target | Teaching purpose |
|---|---|---|---|
| `ch14-l01` | Al-Anbiya 21:26 | **مُكْرَمُونَ** | Human plural with plural descriptor |
| `ch14-l02` | Al-Ghashiyah 88:13 | **مَرْفُوعَةٌ** | Non-human plural with feminine-singular descriptor |
| `ch14-l03` | Al-Ghashiyah 88:14 | **مَوْضُوعَةٌ** | Noun-adjective relationship and phrase analysis |
| `ch14-l04` | Verified examples from 21:26 and 88:13–16 | Descriptor in each example | Human/non-human contrast |
| `ch14-l06` | Az-Zumar 39:67 | **مَطْوِيَّاتٌ** | Attested feminine-plural variation |
| `ch14-l05` | One previously taught direct example | Previously taught descriptor | Retrieval practice only |

Before publication, each reveal must have:

- exact verified Quran text and reference;
- a verified audio segment;
- a valid zero-based `highlightWordIndex`;
- `highlighted_words` containing the same semantic target;
- an explanation that discusses the highlighted word rather than a nearby token; and
- a check that the example directly supports the stated lesson objective.

Index validation should run for every reveal, not only when a truthy index happens to be present.

## 6. Language and editorial standards

### Arabic

- Preserve verified Quran text exactly.
- Use consistent harakat in examples within the same activity.
- Do not use an unattested form as “Quran vocabulary.”
- Keep the distinction between plural meaning and adjective form explicit.

### English

- Use “human plural” and “non-human plural” as grammatical teaching labels.
- Prefer “the common beginner default” over “always.”
- Distinguish “the new books” from “the books are new” in every explanation and translation.

### Urdu

- Replace **کسرہ جمع** with **جمع مکسر**.
- Preserve the same grammatical distinction as English; do not translate both phrase types as if they were identical.
- Use stable terminology for adjective, described noun, phrase, sentence, human plural, and non-human plural after Urdu editorial review.

### Transliteration

- Render nominative **ـةٌ** consistently as *-atun*, not *-atan*.
- Apply one documented convention for long vowels, emphatic consonants, hamzah, and final case vowels throughout the chapter.
- Re-audit every transliterated example after the Arabic wording is locked.

## 7. Content and schema requirements

- Every lesson must validate against the canonical `@warsh/lesson-schema` package.
- Every interactive teaching target must have enough preceding instruction to answer it fairly.
- Every answer explanation must state why the correct answer works and, where useful, why the likely distractor fails.
- Exercise options must not contain duplicate meanings or ambiguous answers.
- The review and final test must remain separate items.
- The final test must contain the assessment payload required by the product specification.
- Existing stable IDs should be retained as proposed above to minimize learner-progress disruption.

## 8. Source and provenance repair

The curriculum map and lesson fixtures currently point to inconsistent source filenames, and neither referenced source file is present. Implementation should not preserve a placeholder provenance trail.

Before content promotion:

1. restore the actual source note if one exists;
2. choose one canonical source identifier and use it consistently; or
3. if this proposal becomes the approved source of the revision, record that decision explicitly in the curriculum metadata using the repository's accepted provenance convention.

The Quran text, translation wording, morphology claims, and grammar explanation must still be checked against authoritative sources; approval of this proposal is not itself scholarly verification.

## 9. Implementation plan after approval

### Stage 1 — Content drafting

- Rewrite the five existing fixtures.
- Add `ch14-l06` and `ch14-test`.
- Update Chapter 14 ordering and titles in the curriculum map.
- Preserve stable IDs exactly as listed in this proposal.
- Repair Quran targets, Urdu terminology, and transliteration.

### Stage 2 — Local validation

- Build and test the canonical lesson schema.
- Validate all fixtures.
- run the Urdu audit;
- run the Quran text/reference audit;
- run semantic checks for reveal target alignment;
- validate every highlight index and `highlighted_words` entry; and
- verify that the final test's assessment payload and passing threshold are valid.

### Stage 3 — Isolated staging review

- Sync only to the isolated local staging database.
- Review all seven Chapter 14 items in Warsh Studio/content review.
- Walk the complete chapter in English and Urdu.
- Verify directionality, Arabic rendering, answer feedback, progress, completion, and chapter unlocking.
- Confirm the final test fails below 10/12 and passes at 10/12 or above.

### Stage 4 — Media verification

- Regenerate any audio whose Arabic source text changed.
- Verify Quran recitation target alignment and playback.
- Re-run the media audit when the external media host is reachable.
- Treat a broad external fetch failure as inconclusive until URLs are retested individually or from a known-good environment.

### Stage 5 — Approval and scoped promotion

- Obtain product-owner approval of the staged chapter.
- Obtain scholarly approval of the grammar and Quranic variation explanation.
- Export the approved database content back to fixtures if Studio edits were made.
- Confirm `content:check` passes.
- Promote only the approved Chapter 14 scope; do not run the full production seed.

## 10. Acceptance criteria

Chapter 14 is ready for promotion only when all of the following are true:

- [ ] Six lessons and one distinct final test appear in the approved order.
- [ ] **مَطْوِيَّاتٌ** is correctly identified as feminine plural.
- [ ] The chapter explicitly distinguishes descriptive phrases from nominal sentences.
- [ ] Every Quran hook directly supports its lesson or is clearly labeled as contextual rather than grammatical evidence.
- [ ] No unattested word is labeled Quran vocabulary.
- [ ] **جمع مکسر** is used correctly in Urdu.
- [ ] No lesson states that **ة**, adjective form, or the “can think” test is universally decisive.
- [ ] Transliteration follows one consistent convention, including *-atun* for nominative **ـةٌ**.
- [ ] Every Quran reveal has verified text, reference, audio, target index, and `highlighted_words`.
- [ ] The review introduces no new grammar and contains the agreed mixed practice.
- [ ] The 12-question final test has a valid `CHAPTER_TEST` assessment payload and a 10/12 pass threshold.
- [ ] Fixture validation, Urdu audit, Quran audit, schema tests, and Chapter 14-specific content checks pass.
- [ ] English and Urdu staging walkthroughs pass on the learner surface.
- [ ] Changed lesson audio and Quran reveal playback are verified.
- [ ] Product-owner and scholarly approvals are recorded before any production promotion.

## 11. Decisions requested

Approval is requested for:

1. the seven-item chapter structure;
2. repurposing `ch14-l03` for the phrase-versus-sentence distinction;
3. adding `ch14-l06` for Quranic default and variation recognition;
4. moving the existing `ch14-l05` review to order 6 while retaining its ID;
5. adding the separate 12-question `ch14-test` at order 7;
6. using Al-Ghashiyah 88:13–16 as the main non-human agreement set;
7. using Az-Zumar 39:67 as a carefully bounded recognition example of feminine-plural variation; and
8. requiring scholarly review before implementation is promoted beyond isolated staging.

No learner-facing content should be changed until these decisions are approved.

## Implementation notes (2026-09-21)

- Every lesson specification above was implemented as written. Fixtures are
  matched to database rows by `(chapter_order, lesson_order)`, so the new
  order-5 lesson `ch14-l06` lives in `chapter-14-lesson-05-quranic-agreement.json`
  and the retained review `ch14-l05` (now order 6) in
  `chapter-14-lesson-06-review.json` (renamed with `git mv` from
  `chapter-14-lesson-05.json`); each `_meta._note` records its database id.
- Reveal targets and declared tokens (indices generated from the canonical
  Imlaei text of api.quran.com, shadda from tanween assimilation kept):
  `بَلْ عِبَادٌ مُّكْرَمُونَ` index 2; `فِيهَا سُرُرٌ مَّرْفُوعَةٌ` index 2;
  `وَأَكْوَابٌ مَّوْضُوعَةٌ` index 1; `وَنَمَارِقُ مَصْفُوفَةٌ` index 1;
  `وَالسَّمَاوَاتُ مَطْوِيَّاتٌ بِيَمِينِهِ` index 1. Lesson 4's hook and reveal
  use 88:15 and its exercises contrast 21:26 with it, so one lesson keeps one
  ayah as elsewhere in the course.
- Transliteration convention: macrons for long vowels, ʾ / ʿ, ṣ ḍ ṭ ẓ ḥ,
  assimilated article (`aṭ-ṭullābu l-mujtahidūna`), final case vowels shown,
  nominative ـةٌ as `-atun`.
- The player reads TAP_TRANSLATION as "What does this Arabic mean?", so the
  two explain-the-choice items are TRUE_FALSE statements carrying the reason
  (`ch14-l04-ex03`, `ch14-l04-ex05`) and two MATCH_AYAH items whose options are
  classifications (`ch14-l04-ex08`, `ch14-l04-ex09`). Definite and indefinite
  forms of one phrase never share an option set, because Urdu has no article
  to tell them apart; FILL_BLANK and test options label them by ال instead.
- Two card heroes that first used `+ = ←` were replaced with plain Arabic so
  the catalogue TTS does not read symbols aloud.
- The stale `reader_lecture_14_wasf_jama.md` / `reader_lecture_14_describing_plurals.md`
  source references were replaced by this proposal's path.
- No new illustrations; no card in this chapter had one before either.

