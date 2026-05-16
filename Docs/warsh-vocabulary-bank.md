# Warsh · وَرْش — Vocabulary Bank
## Feature Idea Document

**Created:** 2026-05-08  
**Status:** Under discussion — not yet built  
**Origin:** Discussed in build session (April 2026) — deferred until after MVP testing  
**Priority:** Next major feature after UI/UX polish is complete

---

## Why This Exists

During the build, the original curriculum had placeholder vocabulary chapters — household words, people, action words, descriptive words, Salah vocabulary. These were removed from the learning path because they broke the Reader-leads-Grammar-serves structure.

But the vocabulary itself is still needed. Users learning Quranic Arabic need both grammar (what the chapters teach) and vocabulary (the raw word bank to apply that grammar to). Right now Warsh teaches grammar but the vocabulary only appears incidentally through lesson discover cards. There is no way to browse, search, or review words outside of replaying a lesson.

The vocabulary bank solves this. It gives vocabulary a proper home — not mixed into the chapter list but as a dedicated section of the app.

---

## Core Concept

The vocabulary bank is **reference material, not a learning path.**

This is the critical distinction. The chapter list has a fixed sequence — you go through it lesson by lesson. The vocabulary bank has no sequence. It is a library. A user should be able to open it at any time, browse by topic, search for a specific word, or review words they have already encountered in lessons.

Two sources of words:

1. **Lesson-linked words** — every word that appears in a discover card automatically lands in the user's vocabulary bank after they complete that lesson. The user builds their bank as they progress.
2. **Topic-browsable words** — a curated set of vocabulary organised by theme (household, nature, people, Quran/Salah, body, food, etc.) available to browse regardless of lesson progress.

---

## Feature Breakdown

### E1 — The Vocabulary Tab

A new bottom tab added to the app alongside Learn, Noor, and You.

**Tab name:** مُفْرَدَات (Mufradat — vocabulary)  
**Tab icon:** An open book or single Arabic letter ع (Ayn — commonly associated with knowledge)

**Tab states:**
- Default: word bank with filter and search at top
- Empty (day 1, no lessons completed): shows topic browse only, with a prompt to complete lessons to unlock personal words

---

### E2 — My Words (Lesson-linked bank)

Words the user has personally encountered and unlocked through lessons.

**Layout:**
- Grid of word cards, 2 per row
- Each card shows: Arabic word (large, Scheherazade), transliteration, English translation, source chapter badge
- Sorted by most recently unlocked (newest first by default)
- Filter by chapter: show only words from Chapter 1, 2, etc.
- Search: tap search icon, type in English or Arabic to filter

**Word card detail (tap to expand):**
- Full Arabic word with diacritics
- Transliteration
- English translation
- Word type badge (Ism / Verb / Particle)
- Example sentence from the lesson it appeared in
- The ayah it connects to (if applicable)
- "Practice this word" button (future — generates a quick drill)

**Unlock logic:**
- Words unlock when the lesson containing that discover card is completed
- They do not unlock by just viewing the card — the lesson must be finished
- Skipped-by-placement lessons: their words are added to the bank but marked with a "skipped" badge

---

### E3 — Browse by Topic

A curated vocabulary library organised by theme. Available to all users regardless of lesson progress.

**Proposed topic categories:**

| Topic | Arabic | Example words |
|---|---|---|
| Household | البَيْت | كِتَاب، بَاب، مَسْجِد، غُرْفَة |
| People | النَّاس | رَجُل، مَرْأَة، وَلَد، بِنْت، أُسْتَاذ |
| Nature | الطَّبِيعَة | شَمْس، قَمَر، سَمَاء، أَرْض، مَاء |
| Quran & Salah | القُرْآن والصَّلَاة | رَبّ، رَحْمَة، صِرَاط، نِعْمَة |
| Body | الجِسْم | يَد، عَيْن، قَلْب، وَجْه |
| Food | الطَّعَام | خُبْز، مَاء، تَمْر، لَبَن |
| Action words | الأَفْعَال | ذَهَب، جَاء، قَرَأَ، كَتَب |
| Descriptive | الصِّفَات | كَبِير، صَغِير، جَدِيد، قَدِيم |
| Numbers | الأَعْدَاد | وَاحِد، اثْنَان، ثَلَاثَة |
| Time | الوَقْت | يَوْم، لَيْل، سَاعَة، أَسْبُوع |

Each topic is a browsable list of word cards (same card design as My Words section).

Words that the user has already unlocked through lessons are marked with a Gold dot — they appear in both My Words and Browse.

---

### E4 — Search

Global search across the entire vocabulary bank.

- Search in English: type "book" → returns كِتَاب
- Search in Arabic: type ك → filters all words starting with ك
- Search in transliteration: type "kitab" → returns كِتَاب
- Results show both My Words and Browse results, separated by section header

---

### E5 — Word of the Day

A small card shown at the top of the vocabulary tab each day. One new word, even if the user has not done any lessons that day.

- Arabic word large and centered
- Translation, transliteration, example sentence
- Refreshes at midnight PKT (using the existing PKT date logic)
- Words rotate through the curated topic library
- Tapping it opens the full word card detail

This gives users a reason to open the app even on days they do not have time for a full lesson. Low-effort engagement hook.

---

### E6 — Spaced Repetition Review (medium-term)

Once the word bank is populated, add a daily review mode.

- User taps "Review today's words"
- App shows 5–10 words that are due for review based on spaced repetition schedule
- Simple flashcard format: Arabic shown, user taps to reveal translation
- User marks: "Knew it" or "Didn't know"
- "Didn't know" words come back sooner, "Knew it" words get pushed further out
- SRS schedule: 1 day → 3 days → 7 days → 21 days → 60 days

This is the most powerful long-term retention mechanic available. Duolingo and Anki both use variants of this. For Quranic Arabic specifically, spaced repetition is how scholars recommend vocabulary acquisition.

Not required for Phase 2 — but the data model should be designed to support it from day one.

---

## Bottom Tab Navigation Change

Currently the app has 3 tabs:
- تَعَلَّم (Learn)
- نور (Noor)
- أنت (You)

Adding vocabulary means 4 tabs:
- تَعَلَّم (Learn)
- مُفْرَدَات (Vocab)
- نور (Noor)
- أنت (You)

Four tabs is the comfortable maximum on mobile before the tab bar feels cramped. This is the right time to add it — not later when there might be pressure to add a 5th.

---

## Database Changes Required

### New table: VocabularyWord

```prisma
model VocabularyWord {
  id              String   @id @default(cuid())
  arabicWord      String
  transliteration String
  englishMeaning  String
  wordType        WordType // ISM, VERB, PARTICLE, ADJECTIVE, NUMBER
  topic           String   // household, people, nature, quran_salah, etc.
  exampleSentenceAr String?
  exampleSentenceEn String?
  relatedAyahAr   String?
  relatedAyahRef  String?
  sourceChapterId String?  // null for topic-browse words not tied to a chapter
  imageUrl        String?  // future — illustration
  createdAt       DateTime @default(now())
}

enum WordType {
  ISM
  VERB
  PARTICLE
  ADJECTIVE
  NUMBER
}
```

### New table: UserVocabularyProgress

```prisma
model UserVocabularyProgress {
  id            String       @id @default(cuid())
  userId        String
  wordId        String
  status        VocabStatus  @default(SEEN)
  seenCount     Int          @default(0)
  lastSeenAt    DateTime?
  nextReviewAt  DateTime?    // for SRS — null until review mode is activated
  srsInterval   Int          @default(1) // days until next review
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  user          User         @relation(fields: [userId], references: [id])
  word          VocabularyWord @relation(fields: [wordId], references: [id])
  @@unique([userId, wordId])
}

enum VocabStatus {
  SEEN         // appeared in a lesson the user completed
  REVIEWING    // user has entered review mode for this word
  KNOWN        // user marked as known in SRS review
}
```

### Change to existing Lesson/DiscoverCard model

Each discover card needs a `vocabularyWordId` field linking it to a `VocabularyWord` record. When a lesson is completed, the backend iterates all discover cards in that lesson and creates `UserVocabularyProgress` rows for each linked word.

---

## New API Endpoints Needed

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/vocabulary/my-words` | GET | Returns user's unlocked word list with progress |
| `/api/vocabulary/browse` | GET | Returns full topic-browsable word list (query: topic) |
| `/api/vocabulary/search` | GET | Search across all words (query: q) |
| `/api/vocabulary/word-of-the-day` | GET | Returns today's word (PKT-aware) |
| `/api/vocabulary/review` | GET | Returns words due for SRS review |
| `/api/vocabulary/review` | POST | Submits review result (knew/didn't know), updates SRS schedule |

---

## UI Screens to Design

| ID | Screen | Priority |
|---|---|---|
| E1 | Vocabulary tab — main view (My Words + Browse toggle) | High |
| E2 | My Words grid | High |
| E3 | Browse by topic — topic list | High |
| E4 | Browse by topic — word list within a topic | High |
| E5 | Word card detail (expanded) | High |
| E6 | Search screen | Medium |
| E7 | Word of the Day card | Medium |
| E8 | SRS Review mode — flashcard | Future |
| E9 | SRS Review complete screen | Future |

---

## Animations for Vocabulary Tab

- **Word card entrance:** stagger-in grid (60ms delay per card)
- **Topic browse entrance:** topic tiles stagger in on load
- **Word card tap (expand):** card scales up into full detail view (shared element transition if possible in React Native)
- **New word unlock (after lesson complete):** toast at bottom — "3 new words added to your vocabulary" with مُفْرَدَات tab icon pulsing once
- **Word of the Day:** card drops in from above on tab open (once per day)
- **SRS review — knew it:** card flips and flies up-right off screen (satisfying)
- **SRS review — didn't know:** card shakes then returns to bottom of stack

---

## Competitive Analysis

How Warsh's vocabulary bank should differ from competitors:

| Feature | Duolingo | Kalam | Warsh (proposed) |
|---|---|---|---|
| Word bank | Yes — basic list | No dedicated feature | Yes — rich card format |
| Topic browse | No | Yes | Yes |
| Lesson-linked unlock | Partial | No | Yes — explicit unlock moment |
| SRS review | Yes | No | Yes (Phase 2) |
| Quranic connection | No | Partial | Yes — every word tied to ayah where possible |
| Arabic script quality | Poor | Good | Scheherazade New — best available |
| Word of the Day | No | No | Yes |

The Quranic connection is the differentiator. Every word in the bank should have a Quranic example where one exists. A user should be able to see "I learned كِتَاب — and here is where Allah uses this word in the Quran." No competitor does this properly.

---

## Content Work Required

Before building this feature, the following content needs to be prepared:

1. **Curated word list per topic** — minimum 20 words per topic, 10 topics = 200 words minimum to launch with. These can be sourced from the existing lecture transcripts and supplemented with the original placeholder chapter content that was removed.

2. **Quranic example sentences** — for each word, find at least one Quranic ayah containing that word or its root. This requires a scholar's review for accuracy.

3. **Link discover cards to vocabulary words** — every discover card in the existing 5 chapters (204 cards) needs to be linked to a `VocabularyWord` record. This is a one-time data mapping job, can be done programmatically then reviewed manually.

4. **Word type classification** — each word needs to be classified as Ism, Verb, Particle, Adjective, or Number. This supports future grammar-focused filtering.

---

## Priority Order for Building

1. Database migration — add `VocabularyWord` and `UserVocabularyProgress` tables
2. Link existing 204 discover cards to vocabulary word records
3. Backend endpoints — my-words, browse, search
4. Frontend — vocabulary tab UI (My Words + Browse)
5. Word card detail screen
6. Lesson completion hook — auto-add words to bank on lesson complete
7. Word of the Day
8. Search
9. SRS review mode (Phase 3)

---

## Open Questions

1. **Tab label** — مُفْرَدَات is technically correct but long for a tab. Alternatives: كَلِمَات (Kalimat — words), لُغَة (Lugha — language), just the book icon with no label.

2. **Topic word sourcing** — do we use only words from the 5 lecture transcripts or do we pull from a wider Quranic Arabic vocabulary reference? Using only the transcripts keeps it academically consistent but limits the word count significantly at launch.

3. **Illustration per word** — the image generation plan (204 cards, GPT Image) should extend to vocabulary words. But browse-only words (not tied to lessons) also need images eventually. Total image count could reach 400+. Phasing this is important.

4. **Word of the Day source** — should it pull only from the user's unlocked words (personalised) or from the full curated list (same for all users)? Personalised is more relevant. Same-for-all is simpler to build.

5. **Grammar integration** — should word cards show the grammatical case (Marfu, Mansub, Majrur) for Isms? This would make the vocabulary bank genuinely educational rather than just a reference list, but adds complexity to the data model.

---

*This document is for discussion only. No code changes until decisions are locked.*  
*Cross-reference: `warsh-ui-sot.md` for app-wide UI/animation standards.*  
*Cross-reference: `warsh-quran-comprehension-idea.md` for Tadabbur/Fatiha meter context.*
