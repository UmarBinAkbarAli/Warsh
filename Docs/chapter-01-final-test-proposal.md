# Chapter 1 Final Test — Review Material

**Status:** Approved, implemented, and verified in isolated staging on 2026-08-27; not deployed to production

**Purpose:** Confirm that the learner can use the four demonstratives and the vocabulary taught in Lessons 1–4.

**Format:** 12 questions, one point each

**Pass mark:** 10/12 (80%)
**Retries:** Unlimited; production can draw from an expanded question bank later.

## Questions

| # | Type | Prompt (English) | Prompt (Urdu) | Correct answer |
|---|---|---|---|---|
| 1 | Tap translation | What does هَذَا mean? | هَذَا کا مطلب کیا ہے؟ | this (masculine, near) / یہ (مذکر، قریب) |
| 2 | Tap translation | What does ذَٰلِكَ mean? | ذَٰلِكَ کا مطلب کیا ہے؟ | that (masculine, far) / وہ (مذکر، دور) |
| 3 | Tap translation | What does هَذِهِ mean? | هَذِهِ کا مطلب کیا ہے؟ | this (feminine, near) / یہ (مؤنث، قریب) |
| 4 | Tap translation | What does تِلْكَ mean? | تِلْكَ کا مطلب کیا ہے؟ | that (feminine, far) / وہ (مؤنث، دور) |
| 5 | Meaning | What does `هَذَا بَيْتٌ` mean? | `هَذَا بَيْتٌ` کا مطلب کیا ہے؟ | This is a house. / یہ ایک گھر ہے۔ |
| 6 | Meaning | What does `ذَٰلِكَ كِتَابٌ` mean? | `ذَٰلِكَ كِتَابٌ` کا مطلب کیا ہے؟ | That is a book. / وہ ایک کتاب ہے۔ |
| 7 | Meaning | What does `هَذِهِ شَجَرَةٌ` mean? | `هَذِهِ شَجَرَةٌ` کا مطلب کیا ہے؟ | This is a tree. / یہ ایک درخت ہے۔ |
| 8 | Meaning | What does `تِلْكَ جَنَّةٌ` mean? | `تِلْكَ جَنَّةٌ` کا مطلب کیا ہے؟ | That is a garden. / وہ ایک باغ ہے۔ |
| 9 | Gender | Which noun is feminine? | کون سا اسم مؤنث ہے؟ | `مَدْرَسَةٌ` — school / مدرسہ |
| 10 | Fill blank | `___ بَابٌ` — nearby door | `___ بَابٌ` — قریب دروازہ | هَذَا |
| 11 | Quran recognition | What does `هَذَا صِرَاطٌ` mean? | `هَذَا صِرَاطٌ` کا مطلب کیا ہے؟ | This is a path. / یہ ایک راستہ ہے۔ |
| 12 | Quran recognition | What does `تِلْكَ الْجَنَّةُ` mean? | `تِلْكَ الْجَنَّةُ` کا مطلب کیا ہے؟ | That is Paradise. / وہ جنت ہے۔ |

## Answer options

For Questions 1–4 and 5–8, use these four options in randomized order:

- هَذَا — this (masculine, near)
- ذَٰلِكَ — that (masculine, far)
- هَذِهِ — this (feminine, near)
- تِلْكَ — that (feminine, far)

## Rules

- The test introduces no new vocabulary or grammar.
- مَا and مَنْ are excluded; they belong to a later dedicated lesson.
- The learner may retry after a failing score.
- Chapter 1 completion and its bonus should be awarded only after passing.
- The canonical implemented material is
  `warsh-backend/prisma/fixtures/chapter-01-lesson-05-final-test.json`.
- A larger rotating question bank remains a later enhancement.
