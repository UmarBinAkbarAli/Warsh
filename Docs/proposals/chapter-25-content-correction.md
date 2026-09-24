# Chapter 25 — لَيْسَ content correction

**Status:** Implemented and promoted to production on 2026-09-24 (second pass below; `content:promote-chapter-twenty-five -- --apply`, then `content:baseline`)

Chapter 25 now teaches one coherent sequence: negation with **لَيْسَ**; **اسم ليس مرفوع / خبر ليس منصوب** in simple noun-predicate sentences; feminine **لَيْسَتْ**; plural **لَيْسُوا** with a bounded sound-masculine-plural pattern; then a contrast with the corrected Chapter 24 **إِنَّ** rule. The sixth existing ID is a mixed `REVIEW`; `ch25-test` is a separate 12-question, 80%-pass chapter assessment.

The corrected Quran anchors are the [42:11 excerpt](https://corpus.quran.com/wordbyword.jsp?chapter=42&verse=11), **لَيْسَ كَمِثْلِهِ شَيْءٌ**, and the [3:113 excerpt](https://corpus.quran.com/wordbyword.jsp?chapter=3&verse=113), **لَيْسُوا سَوَاءً**. The former is taught for meaning and recognition; its prepositional phrase is *not* used as proof that لَيْسَ governs a genitive predicate. The latter shows that not every plural predicate ends in **ـِينَ**. The core role rule follows the [Quranic Arabic Corpus grammar of كان and its sisters](https://corpus.quran.com/documentation/verbkaana.jsp).

Removed: mispronunciations “layla/laytat/laysoo,” wrong gender agreement, the fabricated 42:11 quotation with prefixed **اللَّهُ**, false 49:11 attribution, untaught **لَمْ** grammar, inappropriate theological contrast sentences, misleading tanwīn shortcuts, and always-true scored items. The teaching verses are excerpts of longer ayat; full-ayah audio should be reviewed in the player.

Before publication: complete qualified Arabic/Quran and Urdu editorial review; confirm the Chapter 24 correction has actually been published; check Studio-versus-fixture state and `content:check`; stage Chapter 25 alone and verify all seven items, including the 9/12 versus 10/12 test boundary, on Android/web. Agree on a revisit policy for learners who completed the incorrect old lessons. Use a scoped promotion, never the full production seed.

## Second pass (2026-09-24, owner-approved)

A review of the first rewrite found it below the Chapter 24 bar. Fixed before promotion:

- The two MATCH_AYAH items whose options were word labels (the player always asks "What does this ayah fragment mean?") became a role MATCHING exercise (ch25-l02) and a "which word is the noun of لَيْسَ" TRUE_FALSE (ch25-l06); the test asks for the noun and the news directly.
- Untaught words (غَائِب، بَارِد، الشَّمْس، الْبَاب، مَفْتُوح، الدَّرْس، صَعْب، السَّاعَة، طَوِيل) replaced with taught ones: قَرِيب، كَبِير، جَدِيد، بَعِيد، صَغِير, with house, book, pen, mosque, school, teacher and student.
- Every lesson now has 6 cards and 8 exercises (the REVIEW 10), adding MATCHING, BUILD_SENTENCE and CONVERSATION_BUILDER.
- One card teaches the two word orders (لَيْسَ الْبَيْتُ كَبِيرًا / الْبَيْتُ لَيْسَ كَبِيرًا). The noun and news of لَيْسَ are named and graded only in لَيْسَ-first sentences.
- Removed: the incorrect-Arabic example (هٰذَا الْكِتَابُ لَيْسَتْ صَغِيرًا) and the "layla" pronunciation line.
- The test gained its closing ayah screen (42:11); the review file is now `chapter-25-lesson-06-review.json`; all 36 cards are listed for illustration (24 scenes).

Verified: fixture validation, Urdu and Quran audits, exact-excerpt check against quran.com (42:11, 3:113, 2:173), 183 backend tests, staging promotion and a 22-check API walk (test lock, key stripped, 9/12 fails, 10/12 passes, replay 0 XP), then a clean `content:check` before production.
