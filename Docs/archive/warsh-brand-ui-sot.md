# Warsh · وَرْش — Brand & UI Single Source of Truth

> This document is the locked reference for all design, content, and development decisions on Warsh.
> Nothing in the app should contradict what is written here.
> Version: 1.0 — locked May 2026

---

## 1. Identity

### App name
**Warsh · وَرْش**

- English rendering: `Warsh`
- Arabic rendering: `وَرْش`
- Always shown together, side by side
- Warsh in Lora serif, وَرْش in Scheherazade New, gold color

### What Warsh means
Warsh (وَرْش) is one of the two most widely used modes of Quranic recitation transmission — the Warsh transmission from Nafi'. Choosing this name signals that the app is rooted in the classical Arabic of the Quran, not conversational or modern Arabic.

### Primary tagline
> Where Arabic is crafted.

### Secondary taglines (use contextually, never all at once)
- "Speak the language of the Quran — correctly."
- "Grammar is worship. Learn it like one."
- "Built for those who want to understand, not just recite."

---

## 2. Brand color palette

| Name | Hex | Role |
|---|---|---|
| Ink | `#0F1117` | Primary background, buttons, dark surfaces |
| Deep | `#1A1F30` | Secondary dark surfaces, nav bar |
| Gold | `#9A8F6A` | Accent, highlights, وَرْش wordmark, star icons |
| Parchment | `#D4C99A` | Button text on dark, light accent fills |
| Cream | `#E8E0CC` | Border color, dividers |
| Cream BG | `#F5F2EA` | Primary screen background |
| Parchment BG | `#EDE8D8` | Card backgrounds, secondary surfaces |
| Sage | `#3A5030` | Success states, streaks, XP/points, progress fills |
| Mint | `#8FC9A0` | Light success fills, correct answer background tint |

### Color usage rules
- **Core trio**: Ink + Gold + Parchment — dark, premium, Islamic manuscript aesthetic
- **Gamification accents**: Sage + Mint — for streaks, points, success states only
- Never use bright primaries (no pure blue, red, orange)
- Correct answer feedback: Mint/Sage tint background — never green from a generic palette
- Wrong answer feedback: `#F9EDED` background, `#B07070` border, `#7A3030` text — muted, never aggressive red
- Progress bars: Sage fill on Cream/Parchment BG track
- Quran card backgrounds: Parchment BG (`#EDE8D8`) with Cream border

---

## 3. Typography

### Fonts

| Font | Use |
|---|---|
| **Lora** (serif) | All UI text in English — headings, labels, buttons, body copy, Ustaad Noor bubbles |
| **Scheherazade New** | All Arabic text — Quran examples, vocabulary, lesson content |
| System sans-serif | Urdu UI text fallback only |

### Type scale

| Element | Size | Weight | Font |
|---|---|---|---|
| App name (Warsh) | 17px | 500 | Lora |
| Screen headings | 13–15px | 500 | Lora |
| Card body | 11–12px | 400 | Lora |
| Labels / chips | 9–10px | 500 | Lora |
| Arabic display (lesson) | 46–52px | 400 | Scheherazade New |
| Arabic sentence | 22–28px | 400 | Scheherazade New |
| Arabic inline | 18–20px | 400 | Scheherazade New |
| Transliteration | 10–11px | 400 italic | Lora |

### Typography rules
- Arabic is always right-aligned, direction RTL
- Never transliterate when Arabic script can be shown
- English translations sit below Arabic, left-aligned or right-aligned depending on card layout
- Classical Arabic terminology always shown in Arabic script first, English gloss below (e.g. جملہ اسمیہ / Nominal sentence)
- Lora italic is used for Quranic references, taglines, and Ustaad Noor's conversational moments

---

## 4. UI component system

### Screen background
`#F5F2EA` (Cream BG) — warm parchment, never pure white

### Cards

| Card type | Background | Border |
|---|---|---|
| Default (white card) | `#FFFFFF` | `0.5px solid #D8D0BE` |
| Parchment card | `#EDE8D8` | `0.5px solid #C8C0A8` |
| Sage card (success/goal) | `#EAF2E8` | `0.5px solid #B8CEAE` |
| Ink card (dark) | `#0F1117` | none |

- Border radius on all cards: `12px`
- Padding: `10px 12px`

### Buttons

| Type | Background | Text color | Border |
|---|---|---|---|
| Primary | `#0F1117` (Ink) | `#D4C99A` (Parchment) | none |
| Ghost/secondary | transparent | `#5A5240` | `0.5px solid #C8C0A8` |

- Border radius: `12px`
- Padding: `11px` full width
- Font: Lora 13px 500

### Progress bar
- Track: `#D8D0BE`
- Fill: `#3A5030` (Sage)
- Height: `4px`
- Border radius: `2px`

### Chips / badges
- Points chip: Parchment BG, Sage text, Parchment border
- Lesson chip: Parchment BG, `#5A5240` text, Cream border
- Font: Lora 10px 500

### Exercise options (MCQ)
- Default: white background, `1px solid #D8D0BE`, Ink text
- Correct: `#EAF2E8` background, Sage border, Sage text
- Wrong: `#F9EDED` background, `#B07070` border, `#7A3030` text
- Border radius: `8px`
- Layout: 2-column grid

### Bottom tab bar
- Background: Cream BG (`#F5F2EA`)
- Border top: `0.5px solid #D0C8B4`
- Active tab label: Ink (`#0F1117`)
- Inactive tab label: `#9A9080`
- Font: Lora 9px 500
- Three tabs only: **Learn / Ustaad Noor / You** (English) or **سیکھیں / اُستاد نور / آپ** (Urdu)

### Top bar
- Background: Cream BG
- App name: Warsh in Lora 17px + وَرْش in Scheherazade New 15px Gold
- Greeting: "As-salamu alaykum" in Lora 9px italic (English) or "السلام عليكم" in Arabic (Urdu)

### Phone frame (for mockups)
- Outer: `#0A0F14` with `6px solid #161C24`
- Border radius: `38px`
- Inner screen border radius: `28px`
- Notch: `76px × 18px`, same dark color

---

## 5. Gamification language

| Generic term | Warsh English | Warsh Urdu |
|---|---|---|
| XP / points | pts | نقاط |
| Streak | day streak | أيام / مداومت |
| Level up | — | ارتقاء |
| Complete | Complete ✓ | مکمل ✓ |
| Locked | — (shown as locked node) | — |
| Daily goal | Today's goal | ہدفِ روز |

### Rules
- The game feels like a madrasa, not a casino
- No hearts/lives system
- No leaderboards in v1
- Streak is framed around مداومت (consistency) — reference the hadith: the most beloved deed to Allah is the consistent one, even if small
- Points (نقاط) are earned only through genuine lesson completion — never inflated

---

## 6. Ustaad Noor — character profile

### Identity
- **Name**: Ustaad Noor
- **Role**: AI tutor character inside the app
- **Tab label**: Ustaad Noor (English) / اُستاد نور (Urdu)

### Personality
| Attribute | Definition |
|---|---|
| Archetype | The beloved teacher — strict about correctness, endlessly patient with the student |
| Age feel | 40s — experienced but not ancient. Has seen students struggle and knows how to help |
| Origin | Speaks with a quiet South Asian scholarly warmth — like a teacher from Lucknow or Lahore |
| Never | Sarcastic, impatient, robotic, or artificially cheerful |

### Speech style
| Moment | How Noor speaks |
|---|---|
| Opens every session | السلام عليكم — always, said with warmth not formality |
| Explains | Via story, analogy, and Quranic examples — never dry grammar rules alone |
| Celebrates correct answer | بارك الله فيك — not "Great job!" |
| Corrects wrong answer | "Almost — let's look at this again" / "Let's revisit this — the فعل pattern is tricky at first, but it clicks." Never "Wrong!" or "Oops!" |
| Gives daily tip | References the lesson just completed, connects to a specific ayah to look for tonight |

### Voice do's and don'ts

**Write like this:**
- "You're doing beautifully. This root alone unlocks 40 Quranic words."
- "Let's revisit this — the فعل pattern is tricky at first, but it clicks."

**Never write like this:**
- "Amazing job!! You're on fire! Keep that streak going!!!"
- "Oops! That's incorrect. Try again."
- "Wrong! The correct answer is…"

---

## 7. Brand voice

| Dimension | Rule |
|---|---|
| Tone | Warm scholarly — like a beloved teacher who makes hard things feel possible. Never cold, never condescending, never overly casual |
| Language (English UI) | English-first with Arabic terms introduced naturally. Never transliterate when Arabic script can be shown |
| Language (Urdu UI) | Clean Urdu/English mix is fine. Arabic script always shown for Arabic terms |
| Islamic tone | Bismillah is assumed, not performed. No over-use of "mashallah" as filler. Quranic references only when genuinely relevant — never decorative |
| Gamification copy | Classical Arabic terms — not "XP" but نقاط, not "level up" but ارتقاء |
| Error messages | "Almost — let's look at this again" — mistakes are part of the workshop. Ustaad Noor never shames |

---

## 8. Lesson structure

Every lesson follows this fixed loop — never deviate:

### 1. Hook (≈10 seconds)
One Quranic ayah or a relatable scene where today's concept appears.
Show it without explanation. Let the user feel the gap.
Example: show بِسْمِ اللهِ and ask "you've read this a thousand times — do you know what اسم means here?"

### 2. Discover (≈60 seconds)
Show 3–4 example cards. Arabic large, translation below.
No grammar terminology at this stage. Patterns only.
User taps through at their own pace.

### 3. Practice (≈2–3 minutes)
4–5 exercises of mixed types (see exercise types below).
One type per exercise — never mix formats within a single exercise.

### 4. Reveal (≈30 seconds)
Name the grammar concept they just learned — after they've already learned it.
Format: "Without realising it, you just learned what scholars call [Arabic term]. Madrasah students study this for months. You just did it in [N] minutes."
Then show a Quranic ayah where this exact concept appears, highlighted.

---

## 9. Exercise types

| Type | Description | When to use |
|---|---|---|
| **Tap the translation** | Arabic sentence shown, 4 translation options, tap correct one | Fast vocabulary + reading recognition |
| **Build the sentence** | Word tiles at bottom, empty slots at top. Drag/tap into order | Sentence structure, word order |
| **Fill the blank** | Sentence with one blank, 3–4 options to choose from | Specific word choice, case endings |
| **True or False** | Arabic sentence shown with image or translation, is this right? | Very fast, high dopamine, breaks up longer sessions |
| **Spot the mistake** | Broken sentence shown, user identifies error | Advanced — used after a concept is introduced and repeated |
| **Translate it** | Full sentence shown, user selects correct full translation | Reading comprehension check |

### Exercise rules
- Every lesson must use at least 3 different exercise types
- True/False is always the fastest — use it to break pacing when other exercises are heavy
- Spot the mistake only appears after the concept has been seen in at least 2 previous lessons
- Correct feedback: Sage card + بارك الله فيك or equivalent warm affirmation
- Wrong feedback: muted red card + "Almost — let's look at this again" + show correct answer

---

## 10. Hidden Nahw/Sarf reveal map

The user never sees grammar terminology until after they've already learned it.
The reveal is the reward, not the starting point.

| Lessons | What user thinks they're learning | What they're actually learning | Achievement reveal |
|---|---|---|---|
| 1–3 | "This" and "that" — pointing | اسمِ اشارہ, نکرہ, تنوین | "You just used نکرہ 50 times" |
| 4–6 | Describing things | جملہ اسمیہ, مبتدا, خبر | "You built Arabic sentences like a scholar" |
| 7–9 | Where things are | حروفِ جار, اعراب جر | "You learned I'rab without a single grammar table" |
| 10–12 | Whose things are | مُرَكَّب اِضَافِي, مضاف, مضاف الیہ | "مسجدِ رسول اللہ — you now know exactly why it's written this way" |
| 13–15 | Calling people | حرفِ ندا, ہمزۃ الوصل | "بِسْمِ اللهِ — you now understand every word" |

---

## 11. Quran comprehension meter

Every user has a live progress bar for **Surah Al-Fatiha comprehension**.

- Shown on Home screen and Profile screen
- Increases as lessons unlock understanding of words/structures in Al-Fatiha
- The full ayah `اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ` is shown in the progress card
- Onboarding promise: "15 minutes a day — understand Surah Al-Fatiha in 7 days"
- This is the single most emotionally powerful feature for the target audience

---

## 12. Curriculum source

### Primary sources
| Series | Author | Role in app |
|---|---|---|
| Madinah Arabic Reader (مدینہ عربی ریڈر) | Dr. Abdur Rahim | **Spine** — sets the learning sequence and pace |
| Easy Arabic / Quranic Grammar (آسان قرآنی عربی گرامر) | Dr. Hafiz Muhammad Zubair | **Engine** — provides grammar depth behind Reader content |

### Usage rules
- The Reader leads, Grammar serves
- Reader content determines what the user sees and does
- Grammar content provides the hidden engine and the reveal
- Both series used with explicit permission of Dr. Hafiz Muhammad Zubair
- All lesson content is written originally — transcripts are research, not copy-paste

### Curriculum philosophy
- Reader pace = app pace
- Grammar terminology is introduced only via achievement reveals — never as lesson content
- Every lesson connects to at least one Quranic ayah where the concept appears
- Urdu explanation style mirrors Dr. Zubair's voice: warm, example-first, never dry

---

## 13. Target audience

### Primary
Pakistani and South Asian Muslims learning Arabic to understand the Quran and Salah.

### Secondary
English-speaking Muslims globally (converts, diaspora) seeking Quranic Arabic.

### User insight
The target user has already watched 5–10 YouTube videos from teachers like Dr. Zubair, felt motivated, then stopped — because passive watching doesn't stick.
Warsh is what happens after the video. It is where the user actually practices what the teacher taught.

---

## 14. Language modes

The app supports two UI language modes. Arabic content is identical in both.

| Element | English mode | Urdu mode |
|---|---|---|
| Navigation labels | Learn / Ustaad Noor / You | سیکھیں / اُستاد نور / آپ |
| Lesson instructions | English | Urdu |
| Feedback text | English (Noor's voice) | Urdu (Noor's voice) |
| Arabic terms | Arabic script + English gloss | Arabic script + Urdu gloss |
| Greeting | As-salamu alaykum | السلام عليكم |
| Islamic phrases (بارك الله فيك etc.) | Stay in Arabic in both modes | Stay in Arabic in both modes |
| Quran ayat | Arabic script only — never transliterated | Arabic script only — never transliterated |

---

## 15. What Warsh is NOT

- Not a conversational Arabic app (that is Kalam's lane)
- Not a phonics/alphabet app (that is Alifbee's lane)
- Not a shallow gamified app (that is Duolingo Arabic's lane)
- Not a madrasah (no rote memorisation, no shame, no dry rules)
- Not a video course (active practice, not passive watching)

Warsh is the only app that teaches **Quranic Arabic grammar through usage**, in a way that feels like a beloved teacher — not a textbook, not a game show.

---

## 16. Locked decisions (do not revisit without a strong reason)

| Decision | Status |
|---|---|
| App name: Warsh · وَرْش | Locked |
| Tutor name: Ustaad Noor | Locked |
| Color palette (7 colors above) | Locked |
| Fonts: Lora + Scheherazade New | Locked |
| Lesson loop: Hook → Discover → Practice → Reveal | Locked |
| No leaderboards in v1 | Locked |
| No hearts/lives system | Locked |
| Reader leads, Grammar serves | Locked |
| Surah Al-Fatiha as the comprehension milestone | Locked |
| Two UI language modes (English + Urdu) | Locked |
| Arabic script never replaced by transliteration | Locked |
| Ustaad Noor never shames or uses hollow praise | Locked |

---

*End of document — Warsh Brand & UI Single Source of Truth v1.0*
