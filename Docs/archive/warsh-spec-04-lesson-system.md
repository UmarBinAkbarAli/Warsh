# Warsh · وَرْش — App Specification
## File 04: Lesson System

**Status:** Locked
**Version:** 1.0
**Last updated:** 2026-05-19
**Depends on:** File 01 (Identity & Principles), File 02 (Information Architecture)

> This file specifies every type of lesson in Warsh, every exercise type, and the complete behavior of the lesson player. This is the largest file in the specification because the lesson experience is the heart of the product.

---

## Part 1 — The Lesson System Overview

### 1.1 What is a lesson

A **lesson** is a self-contained learning unit that:

- Takes the user 3–12 minutes to complete (varies by lesson type and exercise count)
- Has a clear beginning, middle, and end (structured as **beats**)
- Awards XP on completion
- Cannot be paused and resumed — it must be completed in one sitting
- Contributes to the user's daily goal and streak
- Belongs to exactly one chapter

A **chapter** is a thematic grouping of lessons that share a grammar focus or content theme. Chapters are sequenced and unlock progressively.

### 1.2 Lesson templates

Warsh has **four lesson templates** in v1. Each template defines a different sequence of **beats** (sections within the lesson).

| Template | Beats | Used for | Typical duration |
|---|---|---|---|
| **STANDARD** | Hook → Discover → Practice → Reveal → Close (5 beats) | Most chapters — grammar, vocabulary, sentence construction | 6–10 min |
| **SPOKEN_PHRASES** | Context → Phrase Practice (×N) → Mini-Dialogue → Close (4 beats) | Speaking practice lessons | 5–7 min |
| **REVIEW** | Recall → Mixed Practice → Surprise Quiz → Close (4 beats) | Periodic review every 4–5 chapters | 8–12 min |
| **VERB_PATTERN** | Hook → Pattern Discovery → Practice → Reveal → Close (5 beats) | Lessons introducing verbs and conjugation | 8–12 min |

Templates are non-extensible in v1. Every lesson uses one of these four. A 5th template can be added in v2 if curriculum needs demand it.

### 1.3 Beats — the unit of lesson structure

A **beat** is a phase within a lesson with a distinct purpose. Beats are the smallest unit the lesson player tracks. The user progresses through beats sequentially; they cannot skip beats or jump backward.

Each beat has:

- A purpose (what it accomplishes pedagogically)
- A UI screen (defined in File 02)
- A duration (variable per beat)
- A way to advance to the next beat
- Audio and animation choices specific to the beat

### 1.4 Lesson data structure (conceptual)

A lesson is fundamentally a JSON-like data object that the lesson player reads and renders. The structure looks roughly like this:

```
Lesson {
  id, chapterId, order,
  template: "STANDARD" | "SPOKEN_PHRASES" | "REVIEW" | "VERB_PATTERN",
  titleEn, titleAr, summaryEn, summaryAr,
  xpReward, estimatedMinutes,
  hook: { ayah, surahRef, audioUrl, ... },
  discoverCards: [ { word, image, audio, translation } ... ],
  exercises: [ { type, prompt, options, correctAnswer, explanation } ... ],
  reveal: { conceptName, ayah, highlightedWords, noorExplanation, audioUrl },
  close: { noorMessage, milestoneCheck }
}
```

Exact data model in File 12. This file specifies what each section means and how the player renders it.

### 1.5 Lesson is atomic

A user either **completes** a lesson or **abandons** it. There is no partial completion in v1.

- If the user finishes all beats of a lesson → marked `COMPLETED`, XP awarded, progress updated
- If the user exits mid-lesson → all progress in that lesson is discarded; they restart from beat 1 next time
- There is no "Resume where you left off" within a single lesson

This is intentional. Lessons are short. Partial-completion adds complexity (state tracking, partial XP, replay UX) for marginal benefit. A user who genuinely can't finish a lesson should be able to start over without penalty.

---

## Part 2 — The STANDARD Lesson Template

The default template. Most chapters use this. Five beats.

### 2.1 Beat 1: Hook (P1)

**Purpose:** Set emotional tone. Show the user a real ayah where the lesson's concept lives. Let them *hear* it before they learn anything.

**Duration:** 15–25 seconds.

**UI behavior:**

- Full-screen parchment background, subtle motif
- Ayah displayed center, Scheherazade New, large, with full harakat
- Surah and ayah reference shown small below
- Audio plays automatically once (high-quality scholar recitation)
- Subtle waveform animation under the ayah while audio plays
- No translation visible during the Hook
- After audio completes, "Continue →" button appears (Gold, bottom)
- Tapping replays the audio is allowed (small replay icon next to waveform)

**Why no translation:** The Hook is about emotional and sonic immersion, not comprehension. The translation comes in the Reveal beat. The user should *feel* the ayah first, learn it second.

**Pedagogical note:** This is what distinguishes Warsh from rote vocabulary apps. The user starts every lesson by being reminded *why they're here*.

### 2.2 Beat 2: Discover (P2)

**Purpose:** Introduce the lesson's vocabulary and concepts through visual and audio cards. No quizzing yet — just exposure.

**Duration:** 1–3 minutes (depends on card count).

**UI behavior:**

- Header with 5-beat progress dots (Discover dot highlighted)
- Horizontally swipeable cards (one card at a time, fills most of the screen)
- Each card shows:
  - Custom illustration at the top (512×512, parchment palette)
  - Arabic word large center (Scheherazade New, full harakat)
  - Audio play button (auto-plays on card mount; tap to replay)
  - Transliteration below the Arabic
  - Translation in user's UI language (English or Urdu)
- Swipe right/left to navigate between cards
- Card progress indicator: "3 of 12"
- "Continue →" button appears after all cards have been viewed at least once

**Card count:** 8–14 cards per lesson, based on lesson content. Lesson author specifies.

**Audio behavior:**

- Audio auto-plays once when card becomes visible
- User can replay by tapping the audio button
- If audio is set to off in settings, no auto-play; user must tap to hear

**Pedagogical note:** Discover is where the user gets familiar without pressure. By the time they reach Practice, the words are already partly known.

### 2.3 Beat 3: Practice (P3)

**Purpose:** Active recall and application. The user does exercises to internalize what they discovered.

**Duration:** 2–6 minutes (depends on exercise count and types).

**UI behavior:**

- Header with progress: "Exercise 4 of 10"
- One exercise visible at a time, full screen
- Exercise type-specific UI (see Part 4 of this file)
- Each exercise has a submit/check action
- After submission, feedback overlay appears:
  - **Correct:** Gentle Gold flash, subtle chime, short Noor encouragement ("Yes" or "Well done" or just a check mark), 1.5 second delay, auto-advance to next exercise
  - **Wrong:** Soft red glow (not harsh), gentle non-judgmental sound, Noor's explanation appears in a bottom sheet ("Not quite. هَذَا means 'this' for masculine. هَذِهِ is for feminine."), user taps "Got it" to continue, exercise is queued for repeat later in the same lesson
- Progress bar at top updates with each correct answer

**Exercise count per lesson:**

- Minimum: 8
- Maximum: 20
- Recommended: 10–15
- Lesson author specifies the exact count and the mix of exercise types

**Exercise order:**

- Order is randomized at lesson start (each play of the lesson has a different order)
- Exception: Exercise types that depend on others (e.g., a follow-up to an earlier prompt) stay in their dependency order

**Wrong answer handling:**

- User sees Noor's explanation
- The exercise is added to a "retry queue" — it will appear once more later in this same lesson, after at least 2 other exercises
- If the user gets it wrong on the retry, they see the explanation again but the question is NOT queued a third time (we move on)
- Wrong answers do not reduce XP — the user still gets full XP if they complete the lesson; getting things wrong is part of learning
- The lesson tracks `mistakeCount` per exercise for analytics, but does not surface this to the user

**Skipping exercises:**

- No skip option in v1
- Every exercise must be answered (correctly or incorrectly) to advance
- Exception: SHADOW_REPEAT can be skipped if microphone is denied (auto-skips with a note)

### 2.4 Beat 4: Reveal (P4)

**Purpose:** Name the grammar concept the user has been practicing. Show it living inside the Quranic ayah from the Hook. This is the "aha" moment of every lesson.

**Duration:** 30–60 seconds.

**UI behavior:**

- Header reads: "Now you can see it" / "اب آپ اسے دیکھ سکتے ہیں"
- The lesson's grammar concept named explicitly at the top:
  - Arabic name in Scheherazade New (e.g., اسم الإشارة)
  - English/Urdu translation underneath ("Demonstrative pronoun")
- The Hook's ayah shown again, but now:
  - The word(s) demonstrating the concept are highlighted in **Gold**
  - The rest of the ayah in Ink (regular text color)
- Audio of the ayah plays automatically (same recital as Hook)
- Below the ayah: short Noor explanation, 1–2 sentences max:
  > "هَذَا is a demonstrative pronoun — it points at something. In this ayah, Allah uses it to point at the Quran itself. *This* is the Book."
- "Continue →" button

**Why this beat matters most:** The Reveal is the spiritual payoff. The user has been practicing abstractly for 5 minutes — and now sees the concept *was always there*, in revelation. This is the emotional anchor.

**Animation note:** The Gold highlight on the word(s) animates in (subtle fade + scale up) when the user lands on the screen. Not flashy — gentle reveal.

### 2.5 Beat 5: Close (P5)

**Purpose:** Celebrate completion. Award XP. Update progress. Send the user off with warmth.

**Duration:** 10–20 seconds.

**UI behavior:**

- Gentle Gold particle animation in the background (slow drift, not confetti explosion)
- Centered Noor message:
  > "Barak Allahu feek.
  > You completed today's lesson."
- XP animated count-up: "+ 10 XP" growing to the user's total
- Stats updated visibly:
  - Daily goal progress bar fills
  - Streak status: "Streak: 7 days continuing" or similar
- "Continue →" button (returns to chapter detail L3)

**Triggered modals after Close:**

If, on completing this lesson, the user has also:
- **Completed the chapter** → Chapter completion celebration plays before returning to L3
- **Achieved 100% on a Surah in Tadabbur** → M6 (Surah Understood modal) plays
- **Hit a milestone (streak, XP, lesson count, etc.)** → M1 (Milestone celebration) plays
- **Completed their daily goal** → M5 (Daily goal complete toast) plays

Multiple modals can stack. Order:
1. Milestone modal (M1)
2. Surah Understood modal (M6)
3. Daily goal toast (M5)

Chapter completion celebration is part of the Close beat itself, not a separate modal.

### 2.6 Standard lesson — pedagogical flow summary

The five beats create an arc:

> **Hook** — *Feel the ayah.*
> **Discover** — *Meet the words.*
> **Practice** — *Use them.*
> **Reveal** — *See where they live.*
> **Close** — *Carry it with you.*

This arc is what makes Warsh emotionally distinct. Other apps drill. Warsh frames every drill inside a story of revelation.

---

## Part 3 — Other Lesson Templates

### 3.1 SPOKEN_PHRASES template

Used for lessons focused on conversational Fus'ha — greetings, halaqa phrases, du'a, scholar questions, etc. Inserted at strategic chapter milestones (every 4–6 chapters).

**Four beats:**

#### SP1: Context

**Purpose:** Set the scene. Where are these phrases used?

**UI:**
- Scene illustration (e.g., a halaqa with student and teacher, a masjid courtyard, a marketplace)
- Title: "Speaking at a halaqa" / في الحلقة
- Brief description (2 sentences): "These phrases are used when you sit with a teacher and want to ask, listen, or respond. Use them with respect and warmth."
- "Begin →" button

#### SP2: Phrase Practice (repeats 10 times)

**Purpose:** Learn each phrase individually with audio, comprehension check, and speaking practice.

**UI per phrase:**
- Phrase shown in Arabic (with harakat), large
- Transliteration
- Translation
- Audio button (auto-plays once on mount, tap to replay)
- "Now you try" prompt
- Mic button to record yourself
- After recording: playback of your voice + original audio (side-by-side playback control)
- After SHADOW_REPEAT: AUDIO_RECOGNITION mini-check: "What does this phrase mean?" with 4 options
- After correct answer: "Next phrase →"

**Phrases per lesson:** Exactly 10. Lesson author specifies.

**If mic is denied:** SHADOW_REPEAT step skips; user only does the AUDIO_RECOGNITION check. Small note: "You can record yourself once you enable microphone access."

#### SP3: Mini-Dialogue

**Purpose:** Show the phrases in use, as part of a real (scripted) conversation.

**UI:**
- A short dialogue (4–6 exchanges) displayed as chat bubbles
- Two voices, each labeled (e.g., "Student" and "Teacher")
- Audio plays the full dialogue automatically (each speaker's lines play in sequence)
- Translation shown below each Arabic line
- User can replay individual lines by tapping them
- "Continue →" button after audio completes

#### SP4: Close

Same as Standard Close (P5), but the celebration message acknowledges speaking:
> "Barak Allahu feek. You can now say 10 new phrases. Speak them when you can, in shaa Allah."

Profile stat "Phrases you can say" updates with this lesson's phrase count.

### 3.2 REVIEW template

Used periodically — every 4–5 chapters — to consolidate retention.

**Four beats:**

#### R1: Recall

**Purpose:** Refresh memory by flash-reviewing key vocabulary and concepts.

**UI:**
- Title: "Let's review what you've learned"
- Sub-line: "From the last few chapters."
- A series of vocabulary flashcards (5–10 cards) auto-advance every 3 seconds:
  - Arabic word large
  - Translation below
  - Brief audio
- User can tap a card to pause auto-advance and study longer
- Final card: "Ready?" with "Begin review →" button

#### R2: Mixed Practice

**Purpose:** Practice exercises pulled from past chapters, mixing exercise types.

**UI:**
- Same as Standard Practice (P3)
- 10–15 exercises
- Pulled from the last 4–5 chapters' content
- Mix of exercise types — at least 4 different types represented

#### R3: Surprise Quiz

**Purpose:** Test concept *combinations* — exercises that require synthesizing multiple grammar rules.

**UI:**
- Same exercise pattern as Practice
- 3 exercises only
- Each is a challenge: it combines 2+ grammar concepts the user has learned
- Higher XP value per correct answer (5 XP instead of 1 XP for a regular exercise)
- Noor's encouragement after each: "Excellent — that was a tricky one" or "Don't worry, this combination is hard. Let's see the explanation."

#### R4: Close

Same as Standard Close, but Noor's message emphasizes consolidation:
> "Subhan Allah. You've solidified what you've learned. Onward, in shaa Allah."

REVIEW lessons award **double XP** compared to a Standard lesson (20 XP vs 10 XP).

### 3.3 VERB_PATTERN template

Used for chapters introducing verbs and conjugation. Verbs are grammatically more complex than nouns (tense, person, gender, number) and need a dedicated approach.

**Five beats:**

#### VP1: Hook

Same as Standard Hook (P1) — an ayah where the verb appears.

#### VP2: Pattern Discovery

**Purpose:** Show the conjugation pattern of the verb.

**UI:**
- The verb's root letters shown at the top (large, Gold)
- The base form of the verb (3rd person masculine singular past tense) shown below
- A conjugation table appears, animated row by row:

| Pronoun | Past tense |
|---|---|
| هُوَ (he) | کَتَبَ (he wrote) |
| هِيَ (she) | کَتَبَتْ (she wrote) |
| أَنْتَ (you, m) | کَتَبْتَ (you wrote) |
| أَنْتِ (you, f) | کَتَبْتِ (you wrote) |
| أَنَا (I) | کَتَبْتُ (I wrote) |
| هُمْ (they, m) | کَتَبُوا (they wrote) |
| هُنَّ (they, f) | کَتَبْنَ (they wrote) |
| نَحْنُ (we) | کَتَبْنَا (we wrote) |

- Each row has its own audio button
- Rows animate in one at a time (slight delay between each)
- After all rows are shown, the user can tap any row to hear it again
- Below the table: brief explanation note about the pattern
- "Continue →" button

**Note:** Some verb lessons may also include present tense (المضارع) conjugation in a second table on the same beat, or split across two beats. Author decides.

#### VP3: Practice

Same as Standard Practice (P3), but exercises bias toward verb-related types:
- FILL_BLANK with conjugation
- BUILD_SENTENCE using the verb
- IDENTIFY_ROOT (the verb's root)
- TAP_TRANSLATION of verb forms
- MATCHING (pronoun ↔ verb form)

#### VP4: Reveal

Same as Standard Reveal (P4) — shows the verb in its Quranic context.

#### VP5: Close

Same as Standard Close (P5).

---

## Part 4 — Exercise Types (Complete List)

Warsh has **15 exercise types** in v1. These are the building blocks of every Practice beat.

Each exercise has:
- A **type** identifier (the enum value)
- A **prompt** (what the user sees)
- An **input mechanism** (how the user responds)
- A **correctness check** (how we evaluate the answer)
- A **default exercise body** (UI layout)

The 15 exercise types:

| # | Type | Category | Skill tested |
|---|---|---|---|
| 1 | `TRUE_FALSE` | Recognition | Comprehension check |
| 2 | `TAP_TRANSLATION` | Recognition | Word-meaning mapping |
| 3 | `FILL_BLANK` | Production | Active recall of vocab or grammar |
| 4 | `BUILD_SENTENCE` | Production | Word order and grammar synthesis |
| 5 | `MATCHING` | Recognition | Pairing related items |
| 6 | `GRAMMAR_PARSE` | Analysis | Identifying parts of speech |
| 7 | `CONVERSATION_BUILDER` | Production | Constructing appropriate responses |
| 8 | `SHADOW_REPEAT` | Speaking | Pronunciation through imitation |
| 9 | `AUDIO_RECOGNITION` | Listening | Hearing and understanding |
| 10 | `WRITE_ARABIC` | Production | Active typing of Arabic |
| 11 | `HARAKAH_PLACEMENT` | Production | Diacritical mark application |
| 12 | `WORD_ORDER` | Production | Drag-to-arrange words |
| 13 | `TRANSLATE_TO_ARABIC` | Production | Reverse translation |
| 14 | `IDENTIFY_ROOT` | Analysis | 3-letter root recognition |
| 15 | `MATCH_AYAH` | Analysis | Connecting grammar to revelation |

### 4.1 TRUE_FALSE

**Prompt:** A statement (in Arabic with translation, or about Arabic) is shown. User decides if it's true or false.

**UI:**
- Statement shown center
- Two buttons: "صحيح" (True) and "خطأ" (False) — or in user's language
- One tap to answer

**Example:**
> Statement: "The word كِتَاب means 'pen'."
> True / False
> (Answer: False — كِتَاب means 'book')

**Correctness check:** Direct binary match.

**Use case:** Quick comprehension checks, vocabulary verification.

### 4.2 TAP_TRANSLATION

**Prompt:** An Arabic word or phrase is shown. User taps the correct translation from 4 options.

**UI:**
- Arabic word large at top
- Audio play button next to the word
- 4 translation options shown as tappable cards below
- One tap to answer

**Example:**
> Word: مَسْجِد (with audio)
> Options: temple / mosque / school / library
> (Answer: mosque)

**Correctness check:** Direct match to correct option.

**Use case:** Vocabulary mastery, very common exercise type.

### 4.3 FILL_BLANK

**Prompt:** A sentence with one word missing. User picks the missing word from options, OR types it.

**UI:**
- Sentence shown with a blank: `هَذَا ___ جَدِيد`
- Translation hint at top: "This ___ is new."
- Two modes:
  - **Tap mode:** 4 options below as tappable cards
  - **Type mode:** Arabic keyboard input
- Lesson author specifies which mode per exercise

**Example:**
> Sentence: `هَذَا ___ جَدِيد`
> Options: کِتَاب / بَیْت / قَلَم / مَدْرَسَة
> (Answer: کِتَاب — "This book is new.")

**Correctness check:**
- Tap mode: direct match
- Type mode: case-insensitive match, normalizes harakat (so کِتَاب and کتاب both correct)

**Use case:** Grammar pattern recognition, vocabulary use in context.

### 4.4 BUILD_SENTENCE

**Prompt:** A jumbled set of Arabic word tiles. User taps tiles in order to construct the correct sentence.

**UI:**
- English/Urdu translation at top (the target)
- Bottom: scrambled word tiles (5–10 tiles)
- Middle: empty slot area where tiles assemble as tapped
- Tap a tile to move it from bottom to middle
- Tap a middle tile to send it back to bottom
- "Check" button enables when all tiles are placed

**Example:**
> Translation: "This is a new book."
> Tiles: کِتَاب / جَدِيد / هَذَا
> User taps in order to form: `هَذَا کِتَاب جَدِيد`

**Correctness check:** Exact word order match.

**Use case:** Sentence construction, word order intuition.

### 4.5 MATCHING

**Prompt:** Two columns of items. User connects pairs by tapping.

**UI:**
- Left column: 4 items (Arabic words)
- Right column: 4 items (translations, or related Arabic terms)
- Tap an item on left, then item on right to draw a connection
- Lines connect them
- After all 4 are connected, "Check" enables

**Example:**
> Left: کِتَاب / قَلَم / بَیْت / مَدْرَسَة
> Right: pen / book / school / house
> User pairs each correctly.

**Correctness check:** All pairs must match correctly. If any are wrong, all wrong pairs are reset (user re-pairs them).

**Use case:** Vocabulary review, related-concept connections, plural/singular pairs.

### 4.6 GRAMMAR_PARSE

**Prompt:** An Arabic phrase or sentence is shown. User identifies the grammatical role of each word.

**UI:**
- Sentence at top
- Below the sentence, each word is a chip
- User taps a chip and assigns it a grammatical role from a dropdown (e.g., "Subject", "Verb", "Object", "Particle")
- All words must be tagged before "Check"

**Example:**
> Sentence: `الْوَلَدُ ذَهَبَ`
> User tags: `الْوَلَدُ` → Subject, `ذَهَبَ` → Verb

**Correctness check:** All tags must match.

**Use case:** Grammatical analysis, especially in mid-to-advanced chapters.

### 4.7 CONVERSATION_BUILDER

**Prompt:** A conversational situation. User picks the correct Arabic response from options.

**UI:**
- Scene illustration small at top (e.g., a person greeting another)
- Context line: "Someone says to you: السلام عليكم"
- 4 response options below
- One tap to answer

**Example:**
> Context: "A teacher asks: ما اسمك؟"
> Options:
>   - أَنَا تَعَلَّمُ الْعَرَبِيَّة
>   - اِسْمِي عَلِي
>   - أَيْنَ الْمَسْجِد
>   - وَعَلَيْكُمُ السَّلَام
> (Answer: اِسْمِي عَلِي — "My name is Ali")

**Correctness check:** Direct match.

**Use case:** Contextually appropriate speaking responses; very useful in SPOKEN_PHRASES contexts.

### 4.8 SHADOW_REPEAT

**Prompt:** An Arabic word or phrase is played. User records themselves saying it. They hear playback comparison.

**UI:**
- Phrase shown in Arabic large
- Translation small below
- Audio play button (auto-plays once on mount)
- Mic button below: large, prominent
- User taps mic → recording starts (button changes to "Stop recording" with red pulse)
- User taps to stop → recording ends
- Playback panel appears with two play buttons:
  - "Original audio"
  - "Your recording"
- User can replay either as many times as they want
- "Done — next exercise" button

**No correctness check.** SHADOW_REPEAT has no right/wrong. It's listen-and-compare. Always counts as "completed" once the user records (or skips with mic denied).

**Use case:** Pronunciation practice without AI scoring overhead.

**If microphone denied:** Auto-skip with note. Exercise still counts as completed but no recording happens.

### 4.9 AUDIO_RECOGNITION

**Prompt:** An audio clip plays. User picks the correct translation or word from options.

**UI:**
- "Listen carefully" prompt at top
- Large audio play button center (auto-plays once on mount, tap to replay)
- 4 options below as tappable cards (each option is text — either Arabic, translation, or both)
- One tap to answer

**Example:**
> Audio plays: کِتَاب
> Options: book / pen / mosque / house
> (Answer: book)

**Correctness check:** Direct match.

**Use case:** Listening comprehension, ear training.

### 4.10 WRITE_ARABIC

**Prompt:** A word or short phrase is shown in English/translation. User types it in Arabic.

**UI:**
- Translation at top: "Write 'book' in Arabic"
- On-screen Arabic keyboard appears (system Arabic keyboard)
- Text field above keyboard
- Hint button: small "?" that reveals the first letter or shows a visual hint (uses up an XP point as cost — minor friction to encourage trying first)
- "Check" button

**Example:**
> Prompt: "Write 'book'"
> User types: کتاب
> (Correct — case and harakat-insensitive)

**Correctness check:** Normalized comparison — strips harakat, normalizes alef forms (ا, أ, إ, آ all match ا), accepts common spellings.

**Use case:** Active production of Arabic, deeper engagement.

**Note:** This exercise is more challenging. Used sparingly — maybe 1 per Practice beat in chapters that have introduced enough vocabulary to make typing meaningful.

### 4.11 HARAKAH_PLACEMENT

**Prompt:** A word is shown in Arabic without harakat. User taps to add the correct vowel marks.

**UI:**
- Word shown without harakat: کتاب
- Below each letter, three vowel options appear: ـَ (fatha) / ـِ (kasra) / ـُ (damma), and a sukun option
- User taps the correct vowel for each letter
- Audio button to hear the correct pronunciation
- "Check" button

**Example:**
> Word: کتاب
> User assigns: ك→fatha, ت→fatha (then alif, no harakat), ب→no harakat shown
> Result: کِتَاب
> (Correct: ki-taab, so first letter is kasra)

**Correctness check:** Each letter's harakat must match.

**Use case:** Reading precision, understanding the role of harakat. Used moderately — too many of these become tedious.

### 4.12 WORD_ORDER

**Prompt:** Similar to BUILD_SENTENCE but with constraints. User drags words to specific positions.

**UI:**
- Translation at top
- Below: 5–8 Arabic word chips on the left side
- Right side: numbered slots (1, 2, 3, ...) representing word positions
- User drags chips to slots
- "Check" button enables when all slots are filled

**Difference from BUILD_SENTENCE:** WORD_ORDER uses drag-and-drop with positional slots, useful when the grammar requires understanding *positional* importance (e.g., subject-verb-object ordering, definite-indefinite agreement).

**Correctness check:** Each slot must have the correct word.

**Use case:** Drilling word order, sentence structure.

### 4.13 TRANSLATE_TO_ARABIC

**Prompt:** A short English/Urdu sentence is shown. User picks the correct Arabic translation from options.

**UI:**
- Sentence at top in user's language: "This book is new."
- 4 Arabic options below as tappable cards
- One tap to answer

**Example:**
> Prompt: "This book is new."
> Options:
>   - هَذَا کِتَاب جَدِيد
>   - هَذَا قَلَم جَدِيد
>   - هَذِهِ مَدْرَسَة جَدِيدَة
>   - ذَلِكَ بَیْت کَبِير
> (Answer: هَذَا کِتَاب جَدِيد)

**Correctness check:** Direct match.

**Use case:** Reverse translation, testing active recall of Arabic constructions.

### 4.14 IDENTIFY_ROOT

**Prompt:** An Arabic word is shown. User identifies the 3-letter root (الجذر) from options.

**UI:**
- Word shown at top: کَاتِب
- "What is the root?" prompt
- 4 options shown as 3-letter combinations: ك-ت-ب / ك-ل-م / ع-ل-م / ع-م-ل
- One tap to answer

**Example:**
> Word: کَاتِب (writer)
> Options shown
> (Answer: ك-ت-ب)

**Correctness check:** Direct match.

**Use case:** Crucial for Quranic Arabic comprehension. Root recognition unlocks understanding of word families. Used heavily in mid-to-advanced chapters.

### 4.15 MATCH_AYAH

**Prompt:** A grammar concept is shown. User picks the ayah where this concept appears, from 4 ayah options.

**UI:**
- Concept stated at top: "Find an ayah using a demonstrative pronoun (هَذَا/هَذِهِ)"
- 4 ayah options below (each shown in Arabic with brief translation)
- One tap to answer

**Example:**
> Concept: "Demonstrative pronoun"
> Options:
>   - `هَذَا کِتَاب لَا رَيْبَ فِيه` (Al-Baqarah 2:2)
>   - `إِنَّ اللَّهَ غَفُورٌ رَحِيم`
>   - `قُلْ هُوَ اللَّهُ أَحَد`
>   - `اللَّهُ الصَّمَد`
> (Answer: First option)

**Correctness check:** Direct match.

**Use case:** Spiritual reinforcement — every concept lives in revelation. Cements the "Reader leads, Grammar serves" philosophy. Used heavily in REVIEW lessons.

---

## Part 5 — Exercise Mechanics

### 5.1 Time per exercise

- No timer is shown to the user
- Internally, time-on-exercise is tracked for analytics
- A user can take as long as they want on any exercise
- This is deliberate. Time pressure breaks the calm tone of the app.

### 5.2 Hints

- Most exercises do not have hints in v1
- Exception: WRITE_ARABIC has a hint button (reveals first letter; "costs" 1 XP from that exercise's reward)
- TAP_TRANSLATION optionally shows the audio of the word if the user has been on the exercise for >15 seconds (auto-hint, no XP cost)

### 5.3 Retry queue

When a user gets an exercise wrong:
- The exercise ID is added to the lesson's `retry_queue`
- After 2+ other exercises have been answered, the retry queue is checked
- Highest-priority retry is inserted next (or after the current exercise)
- An exercise can only be in the retry queue once per lesson play

If the user gets the retry wrong too:
- They see Noor's explanation again
- The exercise does NOT queue a third time
- We move on; the user will encounter the concept again in future lessons

### 5.4 Feedback animations

| Event | Visual | Audio | Haptic |
|---|---|---|---|
| Correct answer | Gold flash + check mark fade in (300ms) | Soft chime (if SFX on) | Light success haptic (iOS) |
| Wrong answer | Soft red glow (gentler than typical red), shake (subtle, 200ms) | Soft gentle tone (NOT harsh buzz) | Light warning haptic (iOS) |
| Streak (3 in a row correct) | Subtle Gold border pulse on the next exercise | None | None |
| All correct in lesson | Special Gold trail in Close beat | Gentle bell ascending | Light celebration haptic |

All sound effects can be disabled in settings. All haptics can be disabled in settings.

### 5.5 Exercise audio

Many exercises involve audio (TAP_TRANSLATION shows the word's audio, AUDIO_RECOGNITION plays an audio clip, etc.).

- Audio auto-plays once on exercise mount (if global audio is on)
- User can tap to replay
- Audio files are pre-cached when the lesson loads
- If audio fails to load: exercise still shows; audio button shows error icon; user can proceed without audio

### 5.6 Submission and advancement

- Most exercises have a "Check" or "Submit" button
- Exceptions: TRUE_FALSE, TAP_TRANSLATION, CONVERSATION_BUILDER, AUDIO_RECOGNITION, IDENTIFY_ROOT, MATCH_AYAH — these auto-submit on single tap (no Check button needed)
- After submission, the feedback overlay appears (Section 5.4)
- Auto-advance after feedback:
  - Correct → 1.5 second delay, then next exercise
  - Wrong → user must dismiss the explanation bottom sheet manually

### 5.7 Exercise data schema

Each exercise instance has the following data (simplified):

```
Exercise {
  id, lessonId, type,
  promptEn, promptUr, promptAr,
  audioUrl (optional),
  options: [ ... ] (for multiple choice),
  correctAnswer,
  explanationEn, explanationUr,
  imageUrl (optional),
  metadata: { ... } (type-specific fields)
}
```

Full data model in File 12.

---

## Part 6 — The Lesson Player (Engine)

### 6.1 Lesson player lifecycle

1. **Pre-load** — User taps "Begin" on lesson preview (L4)
2. **P0 Loading** — Lesson content + all audio prefetched in parallel
3. **Beat 1 starts** — Hook (or template-specific first beat)
4. **Beat-to-beat transition** — Smooth fade or slide (200ms)
5. **Final beat (Close)** — Stats updated, modals checked
6. **Exit** — Return to chapter detail (L3) with completion status

### 6.2 Pre-load behavior

When user taps "Begin":
- Show P0 loading screen
- Fetch lesson JSON from backend (cached if previously loaded)
- For each audio URL in the lesson, prefetch and cache
- For each image URL in the lesson, prefetch
- Once all critical assets are loaded, proceed to Beat 1
- Critical = Hook ayah audio, all Discover card audio, all exercise audio, Reveal ayah audio
- Non-critical (can lazy-load) = Reveal ayah image, Close animation assets

**Loading screen timeout:** If load takes >10 seconds, show a "Continuing without audio. Tap to retry." message. User can:
- Tap to retry the fetch
- Continue without audio (lesson proceeds; audio buttons show error states)

### 6.3 Caching strategy

- Lesson JSON is cached locally after first fetch
- Audio files are cached locally after first download (Cloudflare R2 → AsyncStorage cache)
- Images are cached using Expo's standard image cache
- Cache expiration: 30 days for audio, 30 days for images, never for JSON (unless explicitly invalidated by app update)

### 6.4 Exit handling

User can attempt to exit at any beat by:
- Tapping the system back button (Android)
- Swiping back gesture (iOS)
- Tapping a "Close" icon (top-right of player, visible at every beat)

When user attempts to exit:
- P6 confirmation modal appears: "Pause this lesson?"
- "Continue lesson" → resumes
- "Exit anyway" → discards all progress in this lesson, returns to L3

If user force-closes the app (kills the process):
- All lesson progress is discarded
- On reopen, they are at L1 (Learn home), not in the lesson

### 6.5 Lesson completion submission

When the user reaches the Close beat:
1. Lesson completion API call is fired with:
   - Lesson ID
   - Time taken (per beat and total)
   - Exercises summary (id, correct/wrong, time taken)
   - Local timestamp
2. If online: API call completes; server updates XP, streak, progress
3. If offline: completion is queued in AsyncStorage; will sync when online
4. Either way: local state is updated immediately so user sees their new stats

If sync fails repeatedly:
- A persistent indicator on Learn tab: "Some progress hasn't synced. We'll keep trying."
- Auto-retry every 5 minutes when network is available
- Once synced, indicator dismisses

### 6.6 Lesson player state management

The player holds in-memory state:

```
LessonPlayerState {
  currentBeat: number,
  beatProgress: { ... },
  exerciseResults: [ ... ],
  retryQueue: [ exerciseId, ... ],
  audioCache: { url: BufferRef, ... },
  startedAt: timestamp
}
```

This state is **not persisted** mid-lesson. If the user backgrounds the app and returns, the player resumes from the current beat (in memory). If the app is killed, state is lost.

### 6.7 Lesson player UI rules

- The 5-beat progress dots (or 4-beat for other templates) are always visible at the top
- The current beat dot is in Gold; completed beats are Sage; upcoming beats are Cream
- A subtle progress bar at the very top tracks overall lesson percent
- No tab bar visible
- A close icon (X) in top-right of every beat
- Brand colors: parchment background, Ink text, Gold accents

---

## Part 7 — Chapter Completion & Special Celebrations

### 7.1 Chapter completion

When a user completes the final lesson in a chapter:

- The standard Close beat plays
- Then, instead of returning directly to L3, a **chapter completion sequence** plays:
  - Parchment background fades to Gold-tinted
  - Chapter Arabic title appears huge, animated reveal
  - Sub-text: "Chapter complete" / "اکمل الفصل"
  - Relevant ayah or hadith appears below (chapter-specific, defined in curriculum)
  - XP bonus shown: "+ 50 XP" for chapter completion bonus
  - Share button (generates a share image of the achievement)
  - "Continue →" returns to L3 with the next chapter unlocked
- Streak status updates
- Milestone modal (M1) fires if applicable
- Push notification queued: "You finished Chapter X. Begin Chapter Y when you're ready, in shaa Allah." (sent at next scheduled reminder time)

### 7.2 Surah understood (Tadabbur milestone)

If, on completing a lesson, the user's progress causes them to fully understand a Surah:

- Lesson Close beat plays as normal
- Then M6 (Surah Understood modal) fires:
  - Full-screen parchment with subtle Gold radiance
  - Surah Arabic name (huge)
  - The complete Surah text displayed with all words in Gold (fully understood state)
  - Audio of the full Surah recitation plays
  - Caption below: "You now understand this Surah, alhamdulillah."
  - XP bonus: +100 XP for first-Surah-understood, +50 for each subsequent
  - Share button
  - "Continue →"

This is the **highest emotional moment** in the app outside of beta launch milestones. Treat it with the visual weight it deserves.

### 7.3 Daily goal complete

If the daily goal is reached during a lesson:

- Lesson continues normally
- At Close beat, daily goal toast (M5) appears briefly
- No interruption to lesson flow

---

## Part 8 — XP Economy

### 8.1 XP per action

| Action | XP |
|---|---|
| Standard lesson completion | 10 |
| SPOKEN_PHRASES lesson completion | 15 |
| REVIEW lesson completion | 20 |
| VERB_PATTERN lesson completion | 12 |
| Chapter completion bonus | 50 |
| First lesson ever | 10 (base) + 25 bonus |
| Daily goal hit | 5 (bonus) |
| 7-day streak milestone | 25 |
| 30-day streak milestone | 100 |
| 100-day streak milestone | 500 |
| Surah understood (first) | 100 |
| Surah understood (each subsequent) | 50 |
| All exercises correct in a lesson (perfect lesson) | 5 (bonus) |
| SRS daily review completion | 5 |

XP is monotonically increasing. There is no XP loss for wrong answers or missed days.

### 8.2 What XP does

In v1, XP is purely a **progress indicator and motivation tool**. It does not unlock content. It does not buy anything.

The user sees XP:
- On Profile screen (Y1)
- On milestone celebrations
- In animated count-ups after lessons

Total XP determines milestone unlocks (XP-based milestones at 100, 500, 1000, 5000, 10000).

In v2, XP may unlock streak freezes or other features. Not in v1.

### 8.3 Levels (not in v1)

Some learning apps have an "XP level" concept (Level 1, Level 2, etc.). Warsh does not. We avoid this because:
- It risks a Duolingo-like gamification feel
- Levels create plateau frustration ("I've been on Level 7 for weeks")
- The user's *real* progress is chapter-based, not XP-based

Total XP is shown as a clean number on Profile. That's it.

---

## Part 9 — Chapter Unlocking Logic

### 9.1 Unlock rules

- Chapter 1 is always unlocked (or whatever starting chapter the user's placement chose)
- Chapter N is unlocked when all lessons in Chapter N-1 are `COMPLETED` or `SKIPPED_BY_PLACEMENT`
- Locked chapters are visible in the list (with lock icon) but tapping does nothing
- During trial: only the user's starting chapter is unlocked (one chapter free during trial)
- After trial (paid): all chapters per unlock progression
- During trial, completing Chapter 1 ends the trial and routes to paywall (Y4)

### 9.2 Skip-by-placement behavior

If a user's placement quiz determined they should start at Chapter 8 (for example):
- Chapters 1–7 are marked `SKIPPED_BY_PLACEMENT`
- These chapters appear in the list with a "Skipped" badge
- User can tap to view and play these chapters (review-style) — they earn XP but don't affect their forward progression
- Locked chapters (ahead of Chapter 8) unlock normally as the user progresses

### 9.3 DEV_UNLOCK_ALL

A debug flag (`DEV_UNLOCK_ALL`) exists in code that bypasses all chapter locking. This is for development only. It must be set to `false` for any user-facing build. File 13 (Technical) covers the pre-launch checklist.

---

## Part 10 — Edge Cases & Special Handling

### 10.1 Network failure during lesson

- Audio: if not yet cached, falls back to "audio unavailable" state but lesson continues
- Exercises: pre-loaded with lesson JSON, so they work offline
- Completion submission: queued for sync (see 6.5)
- Noor explanation on wrong answers: pre-loaded with lesson JSON
- No mid-lesson server pings — once a lesson starts, it runs to completion without server dependency

### 10.2 User backgrounds app mid-exercise

- Lesson state preserved in memory
- On return: user resumes from current exercise
- Audio that was playing pauses; user must tap to replay

### 10.3 User kills app mid-lesson

- Lesson state lost
- On reopen: user is at Learn tab home (L1), not in the lesson
- Next time they enter the lesson, they start from Beat 1

### 10.4 Audio fails to load

- Exercise shows audio button with error state (red icon)
- User can tap to retry
- If retry fails, user can proceed without audio
- TAP_TRANSLATION and AUDIO_RECOGNITION exercises that require audio: if audio totally fails, exercise auto-skips with a small note

### 10.5 User on slow connection

- Loading screen (P0) may take longer
- Show progress: "Loading lesson… (1 of 12)"
- If user wants to bail, "Cancel" button returns to L3

### 10.6 Repeated wrong answers across the lesson

- The retry queue handles a single wrong answer per exercise
- If the user is getting many exercises wrong (>50% in a lesson):
  - No special intervention in v1
  - Noor's explanations after each wrong answer are the support mechanism
- Analytics tracks lessons with high wrong rates so curriculum team can review and improve

### 10.7 User completes a lesson very quickly

- Time-on-lesson tracked; if <30 seconds total, lesson completion may be flagged as suspicious (cheating attempt)
- For v1, we still award XP — no anti-cheat enforcement
- Future: rate-limit XP gain or flag suspicious patterns

---

## Part 11 — Lesson Authoring Standards

These are guidelines for the person writing lesson content (you and/or future contributors).

### 11.1 Hook authoring

- The ayah chosen for the Hook must contain the lesson's grammar concept or vocabulary
- Audio for the Hook must be high-quality scholar recitation (not TTS)
- If you can't find a perfect-fit ayah, choose one where the concept is clearly demonstrated — even partially

### 11.2 Discover authoring

- Card count: 8–14
- Each card teaches one word or short phrase
- Words on the cards should appear in subsequent exercises (don't introduce a word and then never use it again in the lesson)
- Translations should be the most common, useful meaning — not the literal one if literal is misleading

### 11.3 Exercise authoring

- Minimum 8 exercises, target 10–12 for standard lessons
- Use at least 4 different exercise types per Practice beat
- Always include at least one SHADOW_REPEAT and one AUDIO_RECOGNITION (after speaking/listening features are introduced in early chapters)
- Wrong-answer explanations are written in Noor's voice (short, kind, instructive)

### 11.4 Reveal authoring

- The Reveal ayah should be the same as the Hook ayah whenever possible (creates the "it was here all along" emotional payoff)
- If the Hook ayah doesn't perfectly demonstrate the named concept, you may use a different ayah in the Reveal — but explain the choice in lesson notes

### 11.5 Close authoring

- Noor's closing message is personalized — uses the lesson's content where relevant
- Avoid generic "good job" — say something specific about what they just learned
- Keep it short — 1–2 sentences

---

## Part 12 — Future Considerations (Not in v1)

Things we're explicitly not building in v1 but worth noting:

- **Adaptive difficulty** — exercises that get harder as the user demonstrates mastery
- **Personalized lesson recommendations** — Noor suggesting "Let's review X today"
- **Lesson scheduling** — booking specific lessons for specific times
- **Collaborative lessons** — multiple users in the same lesson session
- **Lesson rating / feedback** — users marking lessons as helpful or confusing
- **Custom lesson playback speed** — slower audio for difficult content
- **Multi-modal exercises** — combining audio + image + text in a single exercise type
- **Adaptive exercise generation** — AI generating new exercises on the fly based on user weaknesses

These are interesting but out of v1 scope. Note in product backlog.

---

## Part 13 — Test Plan

Before launch, manually verify:

- [ ] Complete a Standard lesson end-to-end (all 5 beats)
- [ ] Complete a SPOKEN_PHRASES lesson with mic granted
- [ ] Complete a SPOKEN_PHRASES lesson with mic denied (verify auto-skip)
- [ ] Complete a REVIEW lesson and verify it includes content from past chapters
- [ ] Complete a VERB_PATTERN lesson and verify conjugation table displays correctly
- [ ] Trigger a wrong answer and verify retry queue behavior
- [ ] Trigger 2 wrong answers on the same exercise (retry then wrong again) — verify no third retry
- [ ] Get a perfect lesson (all correct) and verify perfect lesson XP bonus
- [ ] Trigger every exercise type in some lesson — all 15 must render and work correctly
- [ ] Complete the final lesson of a chapter and verify chapter completion celebration
- [ ] Complete a lesson that triggers Surah understood (M6) — verify celebration
- [ ] Complete a lesson that triggers a milestone (M1) — verify celebration
- [ ] Complete the daily goal during a lesson — verify M5 toast
- [ ] Exit a lesson mid-flow and verify P6 confirmation
- [ ] Exit anyway and verify lesson resets next time
- [ ] Force-kill the app mid-lesson — verify clean state on reopen
- [ ] Go offline mid-lesson — verify lesson continues
- [ ] Go offline and complete a lesson — verify completion is queued and syncs later
- [ ] Replay a lesson and verify exercise order is randomized
- [ ] Test on slow network (3G simulation) — verify loading screen and timeout
- [ ] Test on iOS 14 (oldest supported) — verify no crashes
- [ ] Test on Android API 26 (oldest supported) — verify no crashes

---

## Part 14 — Changelog

**2026-05-19 — v1.0**
- Complete lesson system specified
- 4 lesson templates defined (STANDARD, SPOKEN_PHRASES, REVIEW, VERB_PATTERN)
- 15 exercise types specified with UI, prompts, and correctness checks
- Lesson player engine behavior specified
- XP economy locked
- Chapter unlocking logic defined
- Edge cases enumerated
- Authoring standards documented
- Test plan with 22 verification cases

---

*End of File 04.*
*Next: File 05 — Curriculum & Content (will be written after Madinah Reader TOC is available; placeholder created.)*
