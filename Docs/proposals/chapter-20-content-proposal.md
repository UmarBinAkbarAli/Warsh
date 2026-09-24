# Chapter 20 — Plural attached pronouns: content repair proposal

**Status:** Approved with the review amendments in section 7 and implemented 2026-09-24  
**Scope:** Chapter 20 map, five existing lesson fixtures/seed rows, and three proposed new items  
**Recommended structure:** Five focused form lessons, one application lesson, one review, one distinct final test (eight items)

## 1. Purpose and chapter boundary

Chapter 20 should teach learners to read **plural pronouns attached to nouns**: **ـنَا** (our), **ـكُمْ** (your, masculine/mixed plural), **ـهُمْ** (their, masculine/mixed plural), **ـكُنَّ** (your, feminine plural), and **ـهُنَّ** (their, feminine plural). The learner's question is: *What noun is being discussed, and who is its owner or associated group?* The endings describe the **referent**, not the gender or number of the possessed noun. A suffix on a verb may look similar but do a different job.

This is a focused continuation of Chapter 7's singular noun-attached forms. The **proposed but unapproved** Chapter 19 repair would make that chapter an applied singular-pronoun reading unit and defer the plural paradigm here. Coordinate the two proposals before implementation: remove Chapter 19's current premature plural drilling only as part of an approved, scoped Chapter 19 update. Do not assume that its proposal has already changed live content. A short singular-versus-plural retrieval in Chapter 20 is deliberate transfer, not a second full Chapter 7 or 19 lesson. Later chapters can revisit these endings in richer conversations and Quran reading without repeating this introductory paradigm.

The five forms deserve **five short, separate introductions**. Combining **ـهُمْ** and **ـهُنَّ** while leaving **ـكُنَّ** untaught, as the current chapter does, makes the addressee-versus-absent-group distinction unnecessarily hard. Give the two feminine-plural forms recognition and controlled use, without demanding an advanced case or verb-object paradigm.

## 2. Findings to repair

1. **The chapter hook has the wrong grammatical role.** The map treats **اهْدِنَا** in Al-Fatiha 1:6 as its headline example. Here **ـنَا** is the object “us” on a **verb** (“guide us”), not “our” on a noun. Retain it only as a carefully labeled contrast in the application lesson. Start the chapter with a verified noun-attached **رَبَّنَا** instead.
2. **The current five lessons leave a real form gap.** `ch20-l01`–`ch20-l03` cover **ـنَا، ـكُمْ، ـهُمْ/ـهُنَّ**; `ch20-l04` introduces **ـكُنَّ** in a crowded ten-form contrast; `ch20-l05` moves to unrelated surah claims. There is no focused **ـكُنَّ** lesson, no meaningful five-form application, no review, and no chapter final test. The chapter map's four focus records do not match even the current five seed lessons.
3. **Several explanations are false or overgeneralized.** A noun does not become genitive merely because a suffix attaches; its case depends on its role in the sentence. **رَبَّنَا** is not evidence that the noun must take damma, and the shadda in **رَبَّنَا/رَبِّي** is on **ب**, not **ر**. **ـكُمْ** has no “extra ك” versus singular **ـكَ/ـكِ**, and suffix length is not a reliable “more people” rule. The gender of **ـهُمْ/ـهُنَّ** follows the referred-to group, not **كِتَاب** or another possessed noun. Remove these claims from cards, feedback, and Urdu translation together.
4. **Quran attribution and lesson targeting need a full audit.** The current fifth lesson attributes **رَبَّنَا إِنَّنَا سَمِعْنَا مُنَادِيًا** to Ya-Sin 36:81; it occurs in [Āl ʿImrān 3:193](https://corpus.quran.com/wordbyword.jsp?chapter=3&verse=193). It attributes **رَبَّنَا أَخْرِجْنَا مِنْ هَذِهِ الْقَرْيَةِ** to Al-Mu'minun 23:109; it occurs in [An-Nisa 4:75](https://corpus.quran.com/wordbyword.jsp?chapter=4&verse=75). Al-Ikhlas is not the last surah and does contain an attached pronoun in **لَهُ** ([112:4](https://corpus.quran.com/wordbyword.jsp?chapter=112&verse=4)), so the current “no attached pronouns” answer is wrong. Remove its unsupported theological interpretation; this chapter needs accurate morphology, not a speculative explanation of divine naming. **نَعْبُدُ** marks first-person plural with a prefix, not a final **ن** suffix.
5. **The assessment often measures something else.** For example, the Lesson 1 fill-in answer **سَمِعْنَا** tests a verb form while teaching “our”; the Lesson 3 fill-in **لَهُمْ كِتَابٌ** tests an indefinite noun rather than noun-attached **ـهُمْ**. Several reveal/highlight positions point to words other than the stated target. Rewrite each prompt around a displayed, accurately glossed form; verify every zero-based target index against the exact ayah text rather than only checking that it is in range.
6. **Source and language hygiene are incomplete.** The named `reader_lecture_20_attached_pronouns_plural.md` was not found in the repository. Mark provenance for editorial confirmation instead of inventing a source. Natural Urdu needs a complete human pass; a validator that checks Urdu presence and schema shape cannot certify meaning. The fixture validator currently passes the five Chapter 20 fixtures, but not these semantic defects.

## 3. Proposed eight-item learning sequence

Keep existing IDs `ch20-l01`–`ch20-l05` in their current order, but rewrite their jobs. Add `ch20-l06`, `ch20-l07`, and `ch20-test` at orders 6–8. This preserves existing lesson identity while adding the missing steps; changed content and previously completed progress require an explicit revisit decision. Quran links below are **candidate anchor checks**, not permission to copy a long passage or skip scholarly/editorial review. Use short, accurately referenced excerpts and familiar authored practice sentences. Every authored Arabic line needs Arabic-editor approval.

| Order / ID | Working lesson | Specific new learning job and anchor |
|---|---|---|
| 1 / `ch20-l01` | **Our: ـنَا on a noun** | Identify **رَبَّنَا** and **ذُنُوبَنَا** in [3:193](https://corpus.quran.com/wordbyword.jsp?chapter=3&verse=193) as noun-attached “our.” Gloss nearby **سَمِعْنَا** as “we heard,” but do not drill it as possession. Ask for the noun and owner; do not derive case endings from the suffix. |
| 2 / `ch20-l02` | **Your group: ـكُمْ** | Read **رَبَّكُمُ** in [4:1](https://corpus.quran.com/wordbyword.jsp?chapter=4&verse=1) as a noun with a second-person plural ending; contrast the separately glossed verb **خَلَقَكُمْ** only to show why attachment site matters. Explain the contextual vocalization **ـكُمُ** without presenting **ـكُمْ** as a fixed vowel string in every context. Practice with a simple authored noun phrase addressed to a group. |
| 3 / `ch20-l03` | **Their group: ـهُمْ** | Use **رَبِّهِمْ** in [2:5](https://corpus.quran.com/wordbyword.jsp?chapter=2&verse=5) to identify an absent masculine/mixed group. Compare **كِتَابُكُمْ / كِتَابُهُمْ** in an authored scene so learners distinguish *your group* from *their group*. Do not infer owner gender from **كِتَاب**. |
| 4 / `ch20-l04` | **Your group of women: ـكُنَّ** | Give this form its own first encounter, using **بُيُوتِكُنَّ** in [33:33](https://corpus.quran.com/wordbyword.jsp?chapter=33&verse=33) with a respectful, accurate gloss of whom the passage addresses. Contrast **بُيُوتُكُمْ / بُيُوتُكُنَّ** in a neutral authored example. Require recognition and one controlled choice, not full analysis of the verse's surrounding commands. |
| 5 / `ch20-l05` | **Their group of women: ـهُنَّ** | Teach the last form separately. [60:12](https://corpus.quran.com/wordbyword.jsp?chapter=60&verse=12) contains **أَيْدِيهِنَّ**; supply appropriate context for the women's pledge and check the exact target with the scholarly editor. Then compare neutral authored **كِتَابُهُمْ / كِتَابُهُنَّ** to establish that **ـهُنَّ** refers to the *women*, not a feminine “book.” Replace the present Al-Fatiha/Al-Ikhlas lesson and its false claims completely. |
| 6 / `ch20-l06` | **Read who belongs to whom** | New `STANDARD` application lesson. In two short scenes and two verified Quran excerpts already encountered, identify the noun, owner/referent, and whether the group is being addressed or spoken about. Include a capped recognition-only contrast: **رَبَّنَا** (“our Lord”) versus **اهْدِنَا** (“guide us”), or **رَبَّكُمُ** versus **خَلَقَكُمْ**. Do not teach a complete object-pronoun or verb-conjugation table. |
| 7 / `ch20-l07` | **Chapter 20 review** | New `REVIEW` lesson. Interleave all five forms, singular-to-plural retrieval from Chapter 7, and one noun-versus-verb distinction. No new form or Quran claim. Feedback should explain *who* the pronoun refers to and *where* it attaches. |
| 8 / `ch20-test` | **Chapter 20 final test** | Distinct `REVIEW` lesson with `assessment.type = CHAPTER_TEST`, 12 server-graded questions and `pass_score_percent: 80` (10/12). No untaught morphology, verse-location trivia, or theological assertions. Preserve existing retry, reward, and chapter-completion rules. |

The lesson count is **eight**, one more than the initial seven-item recommendation: the added space is the separate **ـكُنَّ** and **ـهُنَّ** teaching needed before integration, not more repetitive flashcards. Aim for roughly five to seven purposeful teaching cards and seven to nine varied exercises per teaching lesson, adjustable after the editorial pass. For feminine-plural forms, prioritize *recognition in context* before unaided production.

### Practice and test blueprint

Use the chapter map's short **أَيْنَ كِتَابُكُمْ؟ / كِتَابُنَا عَلَى الطَّاوِلَةِ** exchange as a *controlled application* after both forms are taught, with the Arabic/editorial team checking the naturalness of the scene. It is not a separate Conversation Lab. Later labs can use the same forms in richer dialogue without repeating the five isolated introductions.

Practice should vary the cognitive task: find the suffix on a displayed noun; identify the owner or addressed group; choose **ـكُمْ** versus **ـكُنَّ** or **ـهُمْ** versus **ـهُنَّ** after explicit referent context; match a short Quran target to a faithful gloss; and tell whether a familiar **ـنَا/ـكُمْ** is on a noun or a verb. Never ask learners to guess group gender from the object owned, infer possession merely from a matching ending, or answer from an unrelated verse reveal.

| Final-test outcome | Questions |
|---|---:|
| Recognize **ـنَا، ـكُمْ، ـهُمْ** on nouns in short context | 3 |
| Distinguish **ـكُمْ/ـكُنَّ** and **ـهُمْ/ـهُنَّ** from explicit referents | 3 |
| Identify noun and owner/addressee in an authored sentence or controlled exchange | 2 |
| Read a verified Quran target already taught, with faithful context | 2 |
| Distinguish noun-attached possession from one glossed verb-attached lookalike | 2 |
| **Total** | **12** |

Verify that 9/12 fails and 10/12 passes. Distractors must be grammatically sound in their own contexts and not hinge on an unstated referent. A review can reuse the same forms, but the final test should use new sentences rather than memorized card wording.

## 4. Editorial and implementation checks after approval

1. Have an Arabic editor and Quran reviewer verify each anchor, transliteration, morphology, translation, referent, and verse reference. Cross-check exact ayah text, audio target, and zero-based highlight against the learner-facing excerpt. Separate Quran quotation visually and in metadata from authored examples. If [60:12](https://corpus.quran.com/wordbyword.jsp?chapter=60&verse=12) is judged too advanced or contextually unsuitable, choose another *verified* **ـهُنَّ** noun occurrence before writing that lesson; do not force a misleading hook.
2. Rewrite the chapter map's hook, four focus records, examples, parse tokens, conversation, and tips to match the eight-item sequence. In particular, label **لَنَا** accurately if retained: it is **لِـ** plus a pronoun, not simply an unanalyzed “preposition.” Remove the Al-Ikhlas claims and all incorrect case, shadda, gender, and prefix/suffix rules from both language versions.
3. Rewrite the five existing fixtures in place, add the three new items, and update seed registrations, templates, titles, and source metadata. Use the canonical `@warsh/lesson-schema`; do not create a second content schema. Before releasing changed lessons, decide how existing Chapter 20 completions are notified or revisited so an old completion does not masquerade as mastery of the new material.
4. Independently edit all Urdu hooks, cards, prompts, options, feedback, reveals, and assessment strings after the Arabic is locked. Check natural terms for “our,” plural “your,” masculine/mixed “their,” feminine-group address, and noun-versus-verb function. Recheck answer indices after translation and reordering.
5. Run schema tests and fixture/Urdu validation, then perform a human semantic pass. Test the eight-item path in isolated local staging in English and Urdu on Android/web: directionality, Quran reveals/highlights, audio after edited Arabic, review and test gating, server score threshold, retries, XP, and progress continuity. Export any Studio edits and require `content:check` before a scoped production content update. **Never run the full production seed.** This proposal itself changes no learner-facing content or database rows.

## 5. Owner decisions requested

Approve or revise the eight-item structure, the five Quran anchors (especially the sensitive context of 33:33 and 60:12), the limited noun-versus-verb contrast, the review/test blueprint, and the policy for learners who already completed the current five lessons. These decisions should precede fixture authoring and promotion.

## 7. Review amendments (owner-approved 2026-09-24) and implementation

A pre-build review found these gaps; the owner approved the fixes and they were built:

1. **ـهُمْ anchor:** Al-Baqarah 2:5 is already Chapter 15 L4's reading of أُولَٰئِكَ … رَبِّهِمْ (and Chapter 23 had planned it too). Lesson 3 uses Al-Baqarah 2:277 لَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ, which shows ـهُمْ and ـهِمْ side by side.
2. **Sound change after a kasra:** ـهُمْ is read ـهِمْ and ـهُنَّ ـهِنَّ after a kasra or ي, extending Chapter 19's ـهُ → ـهِ; Lessons 3 and 5 teach it, since their own anchors show it.
3. **Anchors with lighter context:** Al-Ahzab 33:34 (the same بُيُوتِكُنَّ, about what is recited in the homes of the Prophet's wives ﷺ) replaces 33:33; Al-Baqarah 2:233 رِزْقُهُنَّ وَكِسْوَتُهُنَّ (nursing mothers' provision) replaces أَيْدِيهِنَّ in 60:12.
4. **Bridge from what is already taught:** Chapter 10's standalone هُمْ / هُنَّ / نَحْنُ / أَنْتُمْ / أَنْتُنَّ and Chapter 11 L5's بُيُوتِكُمْ are the starting point of each lesson. Chapter 19 was already live and defers the plural endings, so no Chapter 19 change was needed.

**Status:** Implemented 2026-09-24 — eight items (`ch20-l01`–`l05` rewritten, `ch20-l06`, `ch20-l07` review and `ch20-test` new), `scripts/promote-chapters-20-23.cjs`, staging-verified and promoted to production the same day. Details are in the fixture `_meta._note`s and `Docs/warsh-status.md`.
