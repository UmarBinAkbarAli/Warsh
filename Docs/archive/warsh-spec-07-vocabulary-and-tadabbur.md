# Warsh · وَرْش — App Specification
## File 07: Vocabulary & Tadabbur

**Status:** Locked
**Version:** 1.0
**Last updated:** 2026-05-19
**Depends on:** File 01 (Identity & Principles), File 02 (Information Architecture), File 04 (Lesson System), File 05 (Curriculum & Content)

> This file specifies two interconnected systems: the Vocabulary Bank (مُفْرَدَات) — where every word the user has learned lives, browsable and searchable, free forever — and the Tadabbur progression (تَدَبُّر) — the user's growing comprehension of the Quran's words, Surah by Surah.

---

## Part 1 — Vocabulary Bank Overview

### 1.1 What the Vocabulary Bank is

The Vocabulary Bank (Arabic: **مُفْرَدَات**, *mufradāt*) is the second of Warsh's four tabs. It is the user's living, growing word collection — every Arabic word they have encountered in lessons, organized for browsing, searching, reviewing, and deepening understanding.

**The Vocabulary Bank is free forever.** Per File 01's locked monetization decisions, when a user's trial ends and the paywall activates, lessons and Noor lock — but the Vocabulary Bank remains fully accessible. This is a deliberate choice: even non-paying users should retain access to the words they've already learned, and have an ongoing reason to return to the app.

### 1.2 What the Vocabulary Bank contains

The Vocabulary Bank holds **600+ words** at launch, sourced from:

1. **Auto-populated** from lesson Discover cards (every word the user encounters in lessons is automatically added to their bank)
2. **Curated additions** from Quranic corpus — high-frequency Quranic words that may not all appear in lessons but the user benefits from knowing
3. **Topic-based curated sets** — words grouped by 16 topic categories

### 1.3 What the Vocabulary Bank is NOT

To prevent scope drift:

- It is **not a Quran translation tool** (use Quran.com for that)
- It is **not a comprehensive Arabic dictionary** (use Lane's Lexicon, Hans Wehr, or Almaany for that)
- It is **not a tafsir resource** (use Tafsir.com or Quran Tafsir Ibn Kathir)
- It is **not a flashcard deck** like Anki (it includes SRS but isn't designed for that primarily)
- It is **not socially shareable** (no public word lists, no community vocab sets)

The Vocabulary Bank is **a personal living dictionary** — the user's accumulated Arabic vocabulary, contextualized in the Quran, anchored to the lessons that introduced each word.

---

## Part 2 — Vocabulary Word Data Model

### 2.1 Word fields

Every word in the Vocabulary Bank has:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | UUID | yes | Internal unique identifier |
| `arabic` | string | yes | The word in Arabic with full harakat (e.g., كِتَاب) |
| `arabic_plain` | string | yes | The word stripped of harakat for search (e.g., كتاب) |
| `transliteration` | string | yes | Latin-script pronunciation (e.g., kitāb) |
| `translation_en` | string | yes | English translation (e.g., "book") |
| `translation_ur` | string | yes | Urdu translation (e.g., کتاب) |
| `word_type` | enum | yes | Noun, verb, particle, preposition, adjective, etc. (see 2.2) |
| `gender` | enum | conditional | Masculine, feminine, or N/A (for non-gendered word types) |
| `number` | enum | conditional | Singular, dual, plural, or N/A |
| `plural_form` | string | conditional | The plural form, if applicable (e.g., كُتُب for كِتَاب) |
| `case_info` | string | optional | Notes on common grammatical case usage |
| `root_letters` | string | conditional | The 3-letter root (e.g., ك-ت-ب for كِتَاب) |
| `audio_url` | string | yes | URL to MP3 in Cloudflare R2 |
| `image_url` | string | optional | URL to custom illustration |
| `quranic_example` | object | optional | One Quranic ayah featuring this word (see 2.3) |
| `lessons_where_appears` | array | yes | List of lesson IDs that introduce this word |
| `chapter_introduced` | int | yes | The chapter number where this word first appears |
| `topic_category` | array | yes | Topic categories this word belongs to (can be in multiple) |
| `frequency_in_quran` | int | optional | How many times this word's root appears in the Quran (for sorting / display) |

### 2.2 Word types (enum values)

```
NOUN              — اسم — a name or thing (most common)
VERB_PAST         — فعل ماضٍ — past tense verb (e.g., ذَهَبَ)
VERB_PRESENT      — فعل مضارع — present tense verb (e.g., يَذْهَبُ)
VERB_IMPERATIVE   — فعل أمر — imperative (e.g., قُل)
ADJECTIVE         — صفة — descriptive word (e.g., كَبِير)
PRONOUN           — ضمير — personal pronouns (e.g., هُوَ)
DEMONSTRATIVE     — اسم إشارة — pointing pronouns (e.g., هَذَا)
PREPOSITION       — حرف جر — prepositions (e.g., فِي)
PARTICLE          — حرف — other particles (e.g., إِنَّ)
INTERROGATIVE     — اسم استفهام — question words (e.g., مَا، أَيْنَ)
ADVERB            — ظرف — adverbs of time/place (e.g., الْآن)
PROPER_NOUN       — اسم علم — proper names (e.g., اللَّه, مُحَمَّد)
NUMBER            — عدد — numerals (e.g., وَاحِد, اِثْنَان)
CONJUNCTION       — حرف عطف — connectors (e.g., وَ, أَوْ)
```

### 2.3 Quranic example structure

For words that have a Quranic example, the example field contains:

```
{
  surah_number: 108,
  surah_name_ar: "الْكَوْثَر",
  surah_name_en: "Al-Kawthar",
  ayah_number: 1,
  ayah_arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
  word_position: 0,  // index of the word in the ayah for highlighting
  translation_en: "Indeed, We have granted you Al-Kawthar",
  translation_ur: "(ا‌ے نبی) ہم نے آپ کو کوثر عطا فرمائی ہے"
}
```

Some words may have multiple Quranic examples; in v1, we show only one (the most representative or most-recited usage). Multiple examples can be added in v2.

---

## Part 3 — Topic Categories

Per File 01 and File 02, the Vocabulary Bank has **16 topic categories**. Each word belongs to one or more categories.

### 3.1 The 16 categories

| Arabic | English | Approx. word count at launch |
|---|---|---|
| النَّاس | People | 40 |
| العَائِلَة | Family | 25 |
| الجِسْم | Body | 35 |
| البَيْت | Home | 30 |
| الطَّعَام | Food | 25 |
| الزَّمَن | Time | 30 |
| الطَّبِيعَة | Nature | 45 |
| العِبَادَة | Worship | 60 |
| مُصْطَلَحَات قُرْآنِيَّة | Quranic Terms | 80 |
| الأَفْعَال | Verbs | 60 |
| السَّفَر | Travel | 25 |
| المَسْجِد | Masjid | 30 |
| السُّوق | Marketplace | 25 |
| المَدْرَسَة | School / Classroom | 30 |
| الأَعْدَاد | Numbers | 30 |
| الأَلْوَان | Colors | 15 |
| **Total** | | **~585 (target: 600+)** |

Some words belong to multiple categories (e.g., اللَّه belongs to People + Worship + Quranic Terms). The category assignment is curated, not auto-detected.

### 3.2 Category illustrations

Each category has a custom illustration (per File 02 V1):

- People: A row of stylized human silhouettes
- Family: Multi-generational figures
- Body: Anatomical line illustration
- Home: A traditional Pakistani / Arab house
- Food: A spread of items on a tablecloth
- Time: A clock face with arabesque embellishment
- Nature: Mountains, palm trees, river
- Worship: A masjid silhouette with a praying figure
- Quranic Terms: An open mushaf
- Verbs: A figure in motion (walking, writing)
- Travel: A pilgrim with a satchel
- Masjid: A masjid courtyard from inside
- Marketplace: Stalls with goods
- School / Classroom: Books and a chalkboard
- Numbers: Arabic numerals stylized
- Colors: A palette / color spectrum

All illustrations follow the brand visual language: parchment palette, single composition centered, no text, warm tones.

---

## Part 4 — Vocabulary Tab Screens

Per File 02, the Vocabulary tab has 6 screens (V1–V6).

### 4.1 V1 — Vocabulary home

The default screen of the Vocabulary tab.

**Layout (top to bottom):**

1. **Header bar:**
   - Tab title: "Vocabulary / مُفْرَدَات"
   - Search icon (right)

2. **Word of the Day card** (prominent, top):
   - Today's featured word
   - Audio play button
   - Translation
   - Tap to enter V5 (word detail)
   - "Today's Word" label

3. **My Words section:**
   - Subtitle: "Your words"
   - Stat: "[N] words learned"
   - Three most recent words shown horizontally (with audio buttons)
   - "See all →" link to V2

4. **SRS Review card** (if applicable):
   - Subtitle: "Review"
   - Stat: "[N] words ready for review"
   - "Begin review →" button to V6
   - Hides if no words are due

5. **Browse by Topic section:**
   - Subtitle: "Browse by topic"
   - 16 topic cards in a 2-column grid
   - Each card: illustration + Arabic name + English name + word count
   - Tap to enter V3

6. **Footer note:**
   - Small text: "Vocabulary stays with you, always."

### 4.2 V2 — My Words

All words the user has unlocked through lessons.

**Layout:**

- Header: back button + "Your words / كَلِمَاتُك"
- Filter chips (horizontal scroll):
  - All
  - Newly learned (added in last 7 days)
  - Mastered (SRS-mastered)
  - Needs review (SRS-due or overdue)
- Sort options (icon button to toggle):
  - Date learned (newest first) — default
  - Alphabetical (Arabic)
  - By chapter
  - By topic
- Word list — each row:
  - Arabic word (Scheherazade New, medium size)
  - Transliteration (small)
  - Translation (smaller, in user's UI language)
  - Audio play button (right side)
  - Tap row → V5 (word detail)
- Bottom: pagination or infinite scroll
- Empty state: "Words you learn will gather here. Like seeds, planted."

### 4.3 V3 — Browse by Topic

After tapping a topic card on V1.

**Layout:**

- Header: back button + topic name (Arabic + English)
- Topic illustration (large, top of scroll area)
- Brief description (1 sentence): "Words related to family — relationships, members, kinship."
- Word list — same row format as V2
- Locked words (words the user hasn't reached in their curriculum yet) show with a subtle lock icon on the right
  - These are still browsable: tap → V5 (preview mode)
  - In preview mode, the word detail shows everything except "lessons where appears" and "added to your bank"
- Bottom: pagination

### 4.4 V4 — Search

Activated by tapping the search icon on V1.

**Layout:**

- Top: search input (auto-focused with keyboard open)
- Placeholder: "Search Arabic, English, or transliteration"
- Below input: recent searches (last 5)
- As-you-type results:
  - Results appear after 2+ characters typed
  - Each result: same row format as V2
  - Tap → V5
- Search matches across:
  - `arabic` field (with or without harakat)
  - `arabic_plain` field (no harakat)
  - `transliteration` field
  - `translation_en` field
  - `translation_ur` field
  - `root_letters` field (e.g., "ك ت ب" finds كِتَاب)
- Empty state (no results): "No words match. Try a different spelling."
- Cancel button (top right): returns to V1

### 4.5 V5 — Word detail

The complete view of a single word. The hub of vocabulary learning.

**Layout (scrolling):**

1. **Header:** back button, share icon (right — shares the word as an image)

2. **Arabic word section:**
   - Word in huge Scheherazade New, full harakat, centered
   - Large audio play button below the word
   - Transliteration below audio
   - Translation in user's UI language below transliteration

3. **Type badge:**
   - Small chip: word type (e.g., "Noun (masculine)")
   - For verbs: tense indicator (e.g., "Verb — past tense")

4. **Grammar info section (collapsible, expanded by default):**
   - Sub-fields displayed only if data exists:
     - Gender: e.g., "Masculine"
     - Number: e.g., "Singular"
     - Plural form: e.g., "كُتُب (kutub)"
     - Root letters: e.g., "ك-ت-ب" (tappable — shows other words from this root)
     - Case info: e.g., "Commonly used as subject (مرفوع) or in idafa"

5. **Quranic example section:**
   - Subtitle: "From the Quran"
   - Ayah in Arabic, with the target word highlighted in Gold
   - Audio play button for the ayah
   - Surah and ayah reference (e.g., "Surah Al-Baqarah · 2:2")
   - Translation of the ayah in user's UI language

6. **Frequency info (if available):**
   - "Appears [N] times in the Quran"
   - Small text, gentle context

7. **Lessons section:**
   - Subtitle: "Where you learned this"
   - List of lessons that introduce this word, with chapter context
   - Tap a lesson → navigates to L3 (chapter detail) for that lesson's chapter

8. **Actions:**
   - "Add to favorites" toggle (heart icon)
   - "Mark for review" (adds to SRS queue immediately)
   - "Hide from review" (excludes from SRS — for words user fully knows)

9. **Related words section (optional):**
   - If `root_letters` is set: list of other words from the same root
   - Tap any related word → V5 for that word

**Visual style:** Generous white space, parchment background, Ink text, Gold accents on the highlighted ayah word.

### 4.6 V6 — SRS Review session

A focused review experience using spaced repetition.

#### Pre-review screen

When user taps "Begin review" on V1:

- Header: "Review your words" / "مُرَاجَعَة الكَلِمَات"
- Sub-line: "[N] words to review today"
- Brief explanation: "Words you learned a while ago — let's see if they've stuck."
- Single button: "Begin →"
- Settings access: small gear icon top-right (lets user adjust review preferences)

#### Per-word review flow

For each word in the review queue:

**Step 1: Card front**
- Arabic word displayed large
- Optional: audio plays automatically (configurable in settings)
- Below: "Tap to reveal meaning" prompt
- User taps anywhere on the card

**Step 2: Card back**
- Arabic word at top (smaller now)
- Translation revealed
- Transliteration shown
- Brief context (Quranic example, if exists, in collapsed form)
- Three response buttons at bottom:
  - **Hard** (left, subtle red) — "I struggled with this"
  - **Good** (center, neutral Ink) — "I remembered with effort"
  - **Easy** (right, subtle green) — "I knew it immediately"

User taps one. The card advances to the next word.

#### Review session end

After all words reviewed:

- Summary screen:
  - "Review complete"
  - "[N] words reviewed"
  - "[Hard count] hard / [Good count] good / [Easy count] easy"
- XP earned: 5 XP (small bonus for review session)
- "Done →" button returns to V1

#### Review queue management

The SRS algorithm determines:
- Which words appear in today's review
- When each word should next appear

Per File 04 locked decisions, we use a simplified SM-2 algorithm (see Part 5).

---

## Part 5 — SRS (Spaced Repetition System)

### 5.1 Why SRS

Spaced repetition is the most-studied learning technique in cognitive psychology. Without periodic review, retention drops sharply (the "forgetting curve"). Reviewing a word at the moment you're about to forget it solidifies it long-term.

Warsh uses SRS to ensure that vocabulary learned in Chapter 3 doesn't fade by Chapter 30.

### 5.2 The SM-2 algorithm (simplified)

Each word in the user's Vocabulary Bank has SRS metadata:

```
{
  word_id,
  ease_factor: float (default 2.5),
  interval_days: int (default 1),
  repetitions: int (default 0),
  next_review_date: date,
  last_review_quality: int (0-5)
}
```

After each review, the algorithm updates these fields based on the user's response:

| User response | Quality value | Effect |
|---|---|---|
| Hard | 2 | Reset repetitions to 0, decrease ease_factor, short interval |
| Good | 4 | Increment repetitions, slight ease_factor adjustment, normal interval growth |
| Easy | 5 | Increment repetitions, increase ease_factor, longer interval |

**Interval formula:**
- First review: 1 day
- Second review: 6 days
- Third+ review: `previous_interval × ease_factor`

**Ease factor formula (after review):**
- `new_ease = old_ease + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))`
- Minimum ease factor: 1.3

This is the standard SM-2 algorithm used by Anki. Well-established, well-understood.

### 5.3 When a word enters the SRS queue

A word enters the SRS queue when:
- The lesson introducing the word is completed
- The word is automatically added with `interval_days = 1`, `next_review_date = tomorrow`

A user-initiated "Mark for review" on V5 also adds a word to the queue immediately.

### 5.4 Daily review queue

Each day, the SRS system queries all words where `next_review_date <= today`.

Limit: maximum **20 words per day** in the review queue (to prevent overload). If more are due, the most-overdue words come first.

If no words are due today: V1's SRS Review card is hidden (per Part 4.1).

### 5.5 Mastery

A word is considered "mastered" when:
- `repetitions >= 5` AND `ease_factor >= 2.5`

Mastered words still re-enter the queue periodically (their `next_review_date` is far in the future), just less often. Mastery is a soft state, not a permanent one.

The "Mastered" filter on V2 shows all mastered words.

### 5.6 Hidden words

If a user marks a word as "Hide from review" on V5:
- The word's `next_review_date` is set to infinity (never reviewed)
- The word still appears in the user's bank and lists
- The user can un-hide via the same toggle

This handles cases like: "I'm a Hafiz, I already know this word, don't make me review it."

### 5.7 SRS configuration in Settings

Settings screen (Y3) includes SRS preferences:

- "Daily review limit" — 5, 10, 20, or 30 words per day (default: 20)
- "Audio in reviews" — auto-play, on tap, off (default: auto-play)
- "Reset SRS" — danger zone option, clears all SRS metadata, all words go back to fresh state

---

## Part 6 — Word of the Day

### 6.1 What it is

A featured word presented daily on the Vocabulary home (V1) and as a small card on the Learn tab home (L1).

### 6.2 Selection logic

Per File 01 / File 04 decisions:

**Same word for all users globally per day.** This is simpler, encourages community discussion ("did you see today's word?"), and enables future shareability features.

**Selection rules:**
- The word is chosen from the master vocabulary set
- Quranic words are preferred (those with `quranic_example` set)
- Selection rotates to ensure variety across categories
- The same word doesn't repeat for at least 6 months
- For v1, this is a predetermined sequence (curated in advance, stored as a `word_of_the_day` table with date + word_id)

**Determining "today":**
- The user's local time zone is used
- "Today" begins at 4 AM (per File 08's day boundary for streaks)

### 6.3 Word of the Day card UI

On V1:

- Large card at the top of the screen
- Top label: "Today's Word" / "كَلِمَة الْيَوْم"
- Arabic word in huge Scheherazade New
- Audio play button (prominent)
- Translation (medium)
- Transliteration (small)
- One-line "did you know" fact about the word (optional, curated per word):
  - "كِتَاب appears 230 times in the Quran"
  - "The root ك-ت-ب means writing, and gives us 'book' and 'scribe'"
- Tap → V5 (word detail)

On L1 (Learn tab home), a smaller version:
- Compact card with just the Arabic word, audio button, and translation
- Tap → V5

### 6.4 Word of the Day in Push Notifications

If user has notifications enabled, a daily push notification can include the Word of the Day:

> 🌅 Today's Word: كِتَاب
> The word for "book" — and where the entire Quran begins.

This is optional and configurable in Settings (per File 02 Y3).

---

## Part 7 — Tadabbur Overview

### 7.1 What Tadabbur is

**Tadabbur (Arabic: تَدَبُّر)** — to reflect deeply. In Quranic context, it refers to the contemplation of revelation through understanding.

In Warsh, Tadabbur is the feature that **visually tracks the user's growing comprehension of the Quran**. It is the spiritual heart of the app — the proof that the lessons are working not just academically but in connection to the user's actual practice.

### 7.2 What the user experiences

A user opens the Learn tab (L1) and sees a Tadabbur card showing:

- The Surah they are currently building understanding of
- A visual: the Surah's text, with each word color-coded by comprehension state:
  - **Sage (dim):** Word not yet learned
  - **Ink (normal):** Word has been introduced in lessons (basic understanding)
  - **Gold (highlighted):** Word is fully mastered (SRS-mastered or completed multiple lessons featuring it)
- A percentage: "73% of An-Nas understood"
- Tap the card → L5 (Tadabbur detail)

As the user completes lessons, more words light up. Surahs progress visibly toward 100% comprehension. When a Surah reaches 100%, the user gets the M6 celebration (per File 04).

### 7.3 The Tadabbur progression (locked)

Per File 01:

1. **Al-Fatiha** (already there — 25 unique words)
2. **An-Nas** (114)
3. **Al-Falaq** (113)
4. **Al-Ikhlas** (112)
5. **Al-Masad** (111)
6. **An-Nasr** (110)
7. **Al-Kafirun** (109)
8. **Al-Kawthar** (108)
9. **Al-Ma'un** (107)
10. **Quraysh** (106)
11. **Al-Fil** (105)

These are the 11 Surahs the user understands by the time they complete the Madinah curriculum. **Phase 3** (post-launch) extends through the rest of Juz 30.

### 7.4 The "current focus" Surah

At any given time, the user has one **current focus** Surah — the one displayed prominently in the Tadabbur card on L1.

**How current focus is determined:**

1. Start: Al-Fatiha (every user begins here)
2. When user hits 100% on the current focus: it moves to the next Surah in the progression
3. The previous focus stays in their "Completed Surahs" collection
4. The user does not manually change focus — the system handles it

**Exception:** Once a user has completed all 11 Surahs, the Tadabbur card shows "All Surahs of Phase 2 understood. Phase 3 coming soon." Until Phase 3 launches, the card shows a celebration of their journey.

---

## Part 8 — Tadabbur Data Model

### 8.1 Surah model

Each Surah in the progression has:

```
{
  id,
  surah_number,
  name_ar,             // الْفَاتِحَة
  name_en,             // Al-Fatiha
  name_ur,             // الفاتحہ
  meaning_en,          // "The Opening"
  meaning_ur,
  total_ayat,          // 7
  total_words,         // 25 (unique words)
  total_unique_roots,  // 23
  full_text_ayat: [
    {
      ayah_number,
      arabic,
      transliteration,
      translation_en,
      translation_ur,
      audio_url,
      words: [
        {
          position,
          word_id,         // links to Vocabulary Bank
          word_arabic,
          is_quranic_only  // true if this word only appears in Quran
        },
        ...
      ]
    },
    ...
  ],
  full_audio_url       // full Surah recitation
}
```

### 8.2 User Surah progress model

For each user, each Surah has a progress record:

```
{
  user_id,
  surah_id,
  words_mastered_count,
  words_introduced_count,
  total_words,
  comprehension_percent: int (0-100),
  completed_at: date | null,
  current_focus: boolean
}
```

This is computed and cached, recomputed when the user completes a lesson that introduces or masters words from this Surah.

### 8.3 Comprehension calculation

**For a single Surah:**

```
comprehension_percent = (words_mastered_count / total_words) × 100
```

Where:
- `words_mastered_count` = number of unique words in this Surah where the user has reached SRS mastery (repetitions ≥ 5, ease_factor ≥ 2.5) — OR — has completed ≥ 3 lessons featuring this word
- `total_words` = total unique words in the Surah

A word is counted toward Surah comprehension only **once** per Surah — even if it appears multiple times in different ayat.

### 8.4 Completion check

A Surah is "completed" (100%) when `words_mastered_count == total_words`. The check runs after every lesson completion (in the lesson Close beat, before any celebration modals).

---

## Part 9 — Tadabbur UI

### 9.1 Tadabbur card on L1 (Learn home)

Prominent card on the Learn tab home:

**Layout:**

```
┌────────────────────────────────────────┐
│ Tadabbur · تَدَبُّر                      │
│                                        │
│ سُورَة النَّاس                            │
│                                        │
│  ┌─────────────────────────────────┐  │
│  │ قُلْ أَعُوذُ بِرَبِّ النَّاسِ      │  │  ← color-coded words
│  │  مَلِكِ النَّاسِ                  │  │
│  │  إِلَٰهِ النَّاسِ                  │  │
│  └─────────────────────────────────┘  │
│                                        │
│ 73% understood                         │
│ ▓▓▓▓▓▓▓░░░ (progress bar)              │
│                                        │
│ Tap to explore →                       │
└────────────────────────────────────────┘
```

**Details:**

- Card has parchment background, subtle Gold border
- The Surah's preview text uses smaller Scheherazade New
- Each word is colored per its state:
  - Sage (light gray-green) for un-introduced
  - Ink (full color) for introduced
  - Gold for mastered
- The first 3 ayat are shown as a preview (or however much fits)
- Progress bar shows percentage
- Tap anywhere → L5 (Tadabbur detail)

### 9.2 L5 — Tadabbur detail

Full Tadabbur view, accessed by tapping the L1 card or via the You tab's stats card.

**Layout (scrolling):**

1. **Header:** back button + title "Tadabbur"

2. **Current focus Surah header:**
   - Surah name (huge, Arabic)
   - Transliteration and meaning
   - "Currently exploring"
   - Progress percentage and bar
   - "Play full Surah" audio button

3. **Full Surah view:**
   - All ayat displayed
   - Each word color-coded by state
   - Each ayah has its own audio play button
   - Tap any word → small bottom sheet with the word's detail (mini V5)
   - The ayah reference (X:Y) shown after each ayah

4. **Completed Surahs section:**
   - Subtitle: "Surahs you've understood"
   - List of completed Surahs with completion dates
   - Each is tappable → opens that Surah's view (similar to current focus view, just for browsing)

5. **Upcoming Surahs section:**
   - Subtitle: "Coming up"
   - List of remaining Surahs in the progression
   - Each shows: name, total words, "[N] words to learn"
   - These are not tappable (no preview before reaching them)

6. **Footer note:**
   - "When you complete all 11 Surahs of Phase 2, Phase 3 begins, in shaa Allah."

### 9.3 Word interaction in L5

Tapping any colored word in the Surah view:

- A bottom sheet slides up
- Shows: Arabic word, audio button, translation, transliteration, "View full details →" link
- "View full details" navigates to V5
- Dismiss bottom sheet to return to Tadabbur view

### 9.4 Color transitions

When a user completes a lesson that masters a word in their current focus Surah:

- On returning to L1 / L5, the word's color transitions from Sage/Ink to Gold
- The transition is **subtle animation** (color fade over 600ms)
- This is one of the most emotionally meaningful animations in the app — handle with care
- A subtle sparkle effect can play on the transitioning word (optional, gentle)

### 9.5 Surah completion (M6) revisited

Per File 04, when a user reaches 100% on a Surah:

**M6 modal fires:**

- Full-screen parchment with Gold radiance from center
- Surah Arabic name (huge, Scheherazade New)
- The complete Surah text displayed with **all words now in Gold**
- A "play full Surah" button — auto-plays on modal open
- Caption below:
  > "You now understand this Surah, alhamdulillah.
  > Carry it with you in your salah."
- XP bonus: +100 for first Surah, +50 for each subsequent (per File 04)
- "Share this moment" button → generates a share image
- "Continue →" button — dismisses modal, user returns to wherever they were

**After dismissal:**
- The Tadabbur card on L1 advances to the next Surah in the progression
- A small toast appears: "Your next focus: [Next Surah]"
- The completed Surah moves to the "Completed Surahs" collection in L5

### 9.6 Visual when all 11 Surahs complete

When the user finishes Surah Al-Fil (the last in Phase 2):

- M6 fires for Al-Fil completion
- After dismissal, the Tadabbur card on L1 shows:

```
┌────────────────────────────────────────┐
│ Tadabbur · تَدَبُّر                      │
│                                        │
│ All 11 Surahs of Phase 2 understood.   │
│                                        │
│ سُورَة الْفَاتِحَة ✓                      │
│ سُورَة النَّاس ✓                          │
│ سُورَة الْفَلَق ✓                          │
│ ... (all 11 listed) ...                │
│                                        │
│ Phase 3 will begin with the rest of   │
│ Juz 30, in shaa Allah.                │
│                                        │
│ Tap to revisit any Surah →             │
└────────────────────────────────────────┘
```

This is a "resting" state for v1 launch. Phase 3 content will be added in a post-launch update.

---

## Part 10 — Vocabulary Bank ↔ Tadabbur Integration

### 10.1 Where they connect

The Vocabulary Bank and Tadabbur are deeply integrated:

- Every word in a Surah's text is **a link to that word's V5 detail**
- Every word in V5 has a "Where it appears" section that references Quranic ayat
- Words mastered in the Vocabulary Bank automatically update Surah comprehension
- The Tadabbur card on L1 is a window into the user's vocabulary progress, viewed through the Quranic lens

### 10.2 Curating Surah-vocabulary mapping

Each Surah has a curated word list (per Part 8.1). Building this list requires:

1. **Extract every unique word** from the Surah (across all ayat)
2. **Link each word to a Vocabulary Bank entry** (creating new entries as needed for words that don't appear in lessons)
3. **Mark words that are "Quranic only"** (rarely used outside Quran — these get special treatment in V5 to add Quranic context)

This is **content production work** that happens during curriculum authoring. Each Surah's mapping is part of the launch content checklist.

### 10.3 Words shared across Surahs

A word like اللَّه appears in many Surahs. In the data model:
- The word has a single entry in the Vocabulary Bank
- Each Surah's word list references this word (by ID)
- Mastering the word once contributes to comprehension of every Surah it appears in

This means: if a user masters اللَّه (an early word), they instantly get partial comprehension credit for every Surah featuring it. This is good — it shows the user that their early learning continues to compound.

---

## Part 11 — Share Features

### 11.1 Share a word

From V5, the user can share a single word.

**Generated image (PNG, 1080x1080 for Instagram-style):**

- Parchment background with subtle motif
- Arabic word in huge Scheherazade New
- Transliteration
- Translation
- Quranic example ayah (if exists)
- Small Warsh logo bottom corner
- Light text bottom: "Learn Arabic of the Quran with Warsh"

Tapping share opens the native share sheet.

### 11.2 Share a Surah completion

After M6, the "Share this moment" button generates:

**Generated image:**

- Parchment background, more elaborate motif
- Top: "I now understand"
- Surah name in huge Arabic
- Full Surah text in smaller Arabic, all in Gold
- Translation below in user's UI language
- "Completed [date]"
- Warsh logo + tagline

### 11.3 Share stats (Y6)

Per File 02, the user can share their stats card. This includes:

- Vocabulary stats: "X words learned"
- Speaking stats: "X phrases you can say" (from File 06)
- Streak: "X day streak"
- Tadabbur: "X Surahs understood"

Image format: 1080x1920 (Instagram Story-friendly).

### 11.4 Share image generation

Implementation:
- Use `react-native-view-shot` or similar to render a hidden React component to PNG
- The component has the share design built in React Native with the brand assets
- PNG generated on-device, no server roundtrip
- Saved to device gallery (with permission) OR direct to share sheet

---

## Part 12 — Content Inventory for Launch

### 12.1 Vocabulary Bank — content production targets

For v1 launch:

| Content | Count | Notes |
|---|---|---|
| Total unique vocabulary words | 600+ | Auto-populated from lessons + curated additions |
| Words with full data (audio, translation_en, translation_ur, type) | 600+ | All words need this |
| Words with Quranic example | 400+ | Especially the Quranic terms category |
| Words with illustration | 600+ | Per File 05 |
| Words with root letters identified | 400+ | Especially nouns and verbs from Arabic roots |
| Words assigned to topics | 600+ | At least one topic each |

### 12.2 Tadabbur — content production targets

For v1 launch:

| Content | Count | Notes |
|---|---|---|
| Surahs fully mapped | 11 | Al-Fatiha + the 10 Surahs in progression |
| Surah audio (full recitation) | 11 | Hafiz Umar records, or licensed reciter |
| Per-ayah audio | ~50 ayat | Same source |
| Surah word lists | 11 | Each word linked to Vocabulary Bank entry |
| Surah translations (English) | 11 | Verified, scholar-reviewed |
| Surah translations (Urdu) | 11 | Verified, scholar-reviewed |

### 12.3 Total content production

This is significant ongoing work. Per File 05, total content production for v1 is 6–9 months solo. The vocabulary and Tadabbur content is a substantial portion of that.

---

## Part 13 — Edge Cases

### 13.1 User completes all 11 Surahs before completing all chapters

- Possible if user practices the Vocabulary Bank heavily and masters words via SRS without going through every lesson
- Tadabbur card on L1 shows "All Phase 2 Surahs understood. Continue with lessons to deepen your knowledge."
- User can still progress through chapters; the chapter completion experience remains intact
- This is a positive outcome, not a bug

### 13.2 User unmasters a word (SRS rating "Hard" multiple times)

- Word's SRS state degrades
- If the word was previously counted as mastered, it's now uncounted
- Surah comprehension percentage drops
- If a previously-completed Surah drops below 100%, **we do not retroactively undo the completion**
- The Surah stays in "Completed Surahs" — once earned, the milestone is permanent

### 13.3 User changes UI language mid-use

- All vocabulary translations switch to the new language immediately (data is dual-language already)
- Audio doesn't change (Arabic audio is universal)
- No data loss

### 13.4 User has zero vocabulary at start

- This is the default state for new users
- V1's "My Words" section shows the empty state: "Words you learn will gather here. Like seeds, planted."
- The Browse by Topic and Word of the Day sections are still available
- Browse by Topic shows all words with locked indicators for words not yet reached
- User can preview words even before unlocking them in lessons

### 13.5 Curation update post-launch

- A vocabulary word's translation or example might be improved post-launch (typo fix, better translation, etc.)
- These updates flow to all users automatically on next vocabulary load
- User's SRS state is preserved (updates don't reset progress)

### 13.6 User clears app data

- All local SRS state is lost
- Backend has the user's vocabulary list and lesson progress, but SRS scheduling is local
- On next app open: SRS resets to "all words due for review" — could be overwhelming
- Mitigation: SRS reset spreads words across the next 7 days instead of dumping all at once

### 13.7 Browse by Topic shows a word the user hasn't reached

- Locked words show with a subtle lock icon
- Tap → V5 in preview mode (limited info, no SRS interaction, no "Where you learned this")
- A small caption: "You'll learn this in Chapter [N]"

---

## Part 14 — Future Considerations (Not in v1)

- **User-created word lists** (custom collections like "words I find hard")
- **Sharing custom word lists** with friends
- **Vocabulary games** (matching games, time-based challenges)
- **Audio pronunciation drills** outside lessons (just for vocab review)
- **Image-only flashcard mode** (user sees only the illustration, recalls the word)
- **Voice-based recall** (user says the word out loud — currently no audio recording in SRS)
- **Vocabulary export** (download your bank as PDF or CSV)
- **Family-shared vocabulary** (parents seeing children's progress) — privacy concerns, deferred
- **Phase 3 Tadabbur** (rest of Juz 30, then Juz 29, etc.) — post-launch content
- **Tafsir integration** (tap a word, see brief tafsir notes) — content licensing required

---

## Part 15 — Test Plan

Before launch, manually verify:

- [ ] Vocabulary home (V1) renders with all sections
- [ ] Word of the Day appears and updates daily
- [ ] My Words section shows the user's actual learned words
- [ ] Browse by Topic shows all 16 categories
- [ ] Each topic card has its illustration
- [ ] Topic detail (V3) shows correct words for that topic
- [ ] Locked words in V3 show with lock indicator and tap to preview
- [ ] Search (V4) works for Arabic input
- [ ] Search (V4) works for English input
- [ ] Search (V4) works for transliteration input
- [ ] Search (V4) works for root letters input (e.g., "ك ت ب")
- [ ] Word detail (V5) shows all expected fields
- [ ] V5 audio playback works
- [ ] V5 Quranic example displays correctly with highlighting
- [ ] V5 root letters link works (shows related words)
- [ ] V5 favorite toggle works
- [ ] V5 "Mark for review" adds word to SRS queue immediately
- [ ] SRS Review session (V6) functions end-to-end
- [ ] Hard / Good / Easy responses correctly update next_review_date
- [ ] Review session XP awarded
- [ ] Daily review queue respects 20-word limit
- [ ] Word of the Day on L1 (Learn tab) renders correctly
- [ ] Tadabbur card on L1 shows current focus Surah
- [ ] Word color coding (Sage / Ink / Gold) is correct
- [ ] Tadabbur detail (L5) shows current focus and completed Surahs
- [ ] Tap a colored word in L5 shows the bottom sheet detail
- [ ] Completing a lesson updates Tadabbur comprehension percentage
- [ ] Reaching 100% on a Surah fires M6 modal
- [ ] After M6, Tadabbur card advances to next Surah in progression
- [ ] Completed Surahs appear in the completed collection
- [ ] All 11 Surahs completion shows the "Phase 3 coming" message
- [ ] Share a word from V5 generates correct image
- [ ] Share a Surah completion generates correct image
- [ ] Switch UI language — vocabulary translations switch instantly
- [ ] Vocabulary works fully offline
- [ ] SRS works fully offline (review queue uses cached data)

---

## Part 16 — Changelog

**2026-05-19 — v1.0**
- Complete Vocabulary Bank specification
- All 6 vocabulary tab screens defined in detail
- Word data model with all 16 word types
- 16 topic categories defined with target word counts
- SRS algorithm (simplified SM-2) locked
- Word of the Day mechanic specified
- Complete Tadabbur progression and UI defined
- Tadabbur ↔ Vocabulary Bank integration documented
- Share features specified
- Content inventory targets set
- Edge cases enumerated
- 30-item test plan

---

*End of File 07.*
*Next: File 08 — Engagement Features.*
