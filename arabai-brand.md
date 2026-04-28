# ArabAI — Brand Identity System

> **Version:** 1.0.0
> **Status:** Active — Use for all design decisions
> **Last Updated:** April 2026

---

## Table of Contents

1. [Brand Foundation](#1-brand-foundation)
2. [Naming & Wordmark](#2-naming--wordmark)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Iconography & Symbols](#5-iconography--symbols)
6. [Ustadh Noor — Character Design](#6-ustadh-noor--character-design)
7. [UI Component Styles](#7-ui-component-styles)
8. [Motion & Animation Language](#8-motion--animation-language)
9. [Voice & Tone](#9-voice--tone)
10. [Do's & Don'ts](#10-dos--donts)
11. [React Native Tokens (Code-Ready)](#11-react-native-tokens-code-ready)

---

## 1. Brand Foundation

### Mission
Make Quranic Arabic accessible to every Muslim — regardless of their background, budget, or how busy their life is.

### Vision
A world where every Muslim can hear the Quran and understand every word directly, without translation.

### Core Values

| Value | What It Means in Practice |
|---|---|
| **Warmth** | We feel like a teacher who believes in you, not a productivity tool |
| **Clarity** | Arabic is hard. We make it feel manageable, one step at a time |
| **Depth** | We don't dumb it down — we build real understanding |
| **Belonging** | This was made for you — Pakistani, Indian, Muslim, learner |
| **Progress** | Every day you open the app, you are closer than yesterday |

### Brand Personality

If ArabAI were a person, they would be:
- A 35-year-old scholar who studied in Madinah but grew up in Lahore
- Warm, patient, never condescending
- Gets genuinely excited when you understand something
- Uses a WhatsApp voice note the same way they quote Ibn Kathir — naturally
- Wears a subtle kufi, drinks chai, makes you feel like you can do this

**Not:** A Silicon Valley productivity app. Not a cold AI chatbot. Not a madrasa that makes you feel guilty.

### Positioning Statement
> *For Muslims who want to understand the Quran directly, ArabAI is the only Arabic learning app that combines structured grammar teaching with an AI tutor who feels like a real Ustadh — available at 2am, endlessly patient, built for us.*

---

## 2. Naming & Wordmark

### App Name
**Noor** *(نُور)*

Meaning: Light. Guidance. Clarity.

The same word used in the Quran 33 times. The word every Muslim knows. Short, beautiful, works in Urdu, Hindi, Arabic, and English.

Full brand name: **Noor — Learn Arabic** (Play Store listing)
Short name: **Noor** (app icon, verbal reference)
Internal/dev name: ArabAI (keep for repo names, internal docs)

### Arabic Wordmark
The app name in Arabic script:

```
نُور
```

Always rendered in Amiri Bold, with full diacritics (the damma above ن and the و).

### Tagline
**English:** *Light on every word*
**Urdu:** *ہر لفظ میں روشنی*
**Hindi:** *हर शब्द में रोशनी*

Use the tagline in: onboarding screens, Play Store description, marketing materials.
Do not use in: UI navigation, lesson screens, chat interface.

---

## 3. Color System

### Design Philosophy
The palette is inspired by three things:
1. **The night sky over Makkah** — deep, rich, full of depth
2. **Illuminated manuscripts** — gold on dark, the aesthetic of classical Islamic scholarship
3. **Dawn light** — the warm moment of Fajr, clarity emerging from darkness

This is NOT a bright, gamified green palette (Duolingo). It is rich, warm, and serious — yet approachable.

---

### Primary Palette

| Name | Hex | RGB | Usage |
|---|---|---|---|
| **Deep Lapis** | `#1B2A4A` | 27, 42, 74 | Primary background, nav bars |
| **Warm Gold** | `#D4A847` | 212, 168, 71 | Primary accent, CTAs, XP, streak |
| **Ivory White** | `#F5F0E8` | 245, 240, 232 | Primary text on dark, card backgrounds |
| **Jade Teal** | `#2A7F6F` | 42, 127, 111 | Success states, correct answers, progress |
| **Crimson Clay** | `#C0392B` | 192, 57, 43 | Error states, wrong answers |

### Secondary Palette

| Name | Hex | Usage |
|---|---|---|
| **Midnight** | `#0F1923` | Deepest backgrounds, overlays |
| **Slate Blue** | `#2C3E6B` | Cards, elevated surfaces |
| **Muted Gold** | `#A07830` | Gold on lighter backgrounds |
| **Soft Mint** | `#E8F5F2` | Light mode success backgrounds |
| **Warm Cream** | `#FBF7EE` | Light mode card backgrounds |
| **Sand** | `#E8DCC8` | Borders, dividers on light mode |

### Semantic Colors (Always Use These Names in Code)

```
background.primary     → #1B2A4A  (deep lapis)
background.secondary   → #0F1923  (midnight)
background.card        → #2C3E6B  (slate blue)
background.surface     → #243352  (between lapis and slate)

text.primary           → #F5F0E8  (ivory white)
text.secondary         → #B8C4D4  (muted, for subtitles)
text.muted             → #7A8BA0  (disabled, placeholder)
text.arabic            → #F5F0E8  (always ivory on dark)

accent.gold            → #D4A847  (primary CTA, XP, streak)
accent.goldMuted       → #A07830  (secondary gold usage)
accent.teal            → #2A7F6F  (success, correct)
accent.crimson         → #C0392B  (error, wrong)

border.default         → #2C3E6B  (card borders)
border.subtle          → #1F3055  (dividers)

streak.fire            → #FF6B35  (streak flame color)
xp.bar                 → #D4A847  (XP progress bar)
```

### Dark Mode / Light Mode

**Phase 1 ships dark mode only.** This is a deliberate brand decision — the deep lapis/gold palette IS the brand. Light mode is Phase 2.

Rationale: Dark mode is preferred by Pakistani/Indian users for night-time reading (Tahajjud, late-night study). It also makes Arabic calligraphy look dramatically more beautiful.

---

## 4. Typography

### Font Stack

| Role | Font | Weight | Usage |
|---|---|---|---|
| **Arabic text** | Amiri | Regular (400), Bold (700) | All Arabic script — letters, words, sentences |
| **Display / Headings** | Scheherazade New | Bold (700) | Chapter titles, large headings with Arabic feel |
| **UI / Body** | Nunito | Regular (400), SemiBold (600), Bold (700) | All English/Urdu UI text, buttons, labels |
| **Numbers / XP** | Nunito | ExtraBold (800) | XP counts, streak numbers, scores |

**Why these fonts:**
- **Amiri** — The gold standard for Arabic typesetting. Designed for Quranic text. Full diacritics support. Used by major Islamic publishers.
- **Scheherazade New** — Has an Arabic calligraphic influence even for Latin characters. Creates visual coherence between Arabic and English display text.
- **Nunito** — Rounded, friendly, reads beautifully at small sizes. Works in Urdu transliteration. Not Inter (too cold), not Roboto (too Android-generic).

### Type Scale

```
Display XL:   40px / line-height 48px / Scheherazade New Bold
Display L:    32px / line-height 40px / Scheherazade New Bold
Heading 1:    26px / line-height 34px / Nunito Bold
Heading 2:    22px / line-height 30px / Nunito Bold
Heading 3:    18px / line-height 26px / Nunito SemiBold
Body L:       16px / line-height 24px / Nunito Regular
Body M:       14px / line-height 22px / Nunito Regular
Caption:      12px / line-height 18px / Nunito Regular
Label:        12px / line-height 16px / Nunito SemiBold UPPERCASE

Arabic XL:    40px / line-height 58px / Amiri Regular
Arabic L:     30px / line-height 46px / Amiri Regular
Arabic M:     22px / line-height 36px / Amiri Regular
Arabic S:     16px / line-height 28px / Amiri Regular
```

### Typography Rules

1. **Never render Arabic text without Amiri loaded.** System fallback fonts break Arabic ligatures. Show a skeleton loader until fonts are ready.
2. **Always set `writingDirection: 'rtl'` and `textAlign: 'right'` on Arabic text.**
3. **Arabic needs more line height than Latin.** Arabic with diacritics (tashkeel) needs at least 1.5x line height or the vowel marks clip.
4. **Don't mix Arabic and English in the same Text component.** Use two separate components side by side.
5. **Transliteration** (Bismi, Alhamdulillah) uses Nunito Italic.

---

## 5. Iconography & Symbols

### Icon Style
- **Stroke icons only** — 2px stroke weight, rounded line caps
- Source: **Lucide Icons** (already available in your Expo stack via lucide-react-native)
- Never use filled icons and stroke icons together in the same screen
- Icon size standard: 20px (nav), 24px (actions), 32px (feature icons)

### Brand Symbols
These symbols are part of ArabAI's visual language. Use them as decorative elements, backgrounds, and accents:

| Symbol | Arabic | Usage |
|---|---|---|
| **Bismillah** | بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ | Splash screen, onboarding header |
| **Star & Crescent** | ☪ | Achievement badges only — not overused |
| **Geometric arabesque** | (SVG pattern) | Card backgrounds, subtle watermarks |
| **Qalam (pen)** | (illustrated) | Ustadh Noor chat icon, writing exercises |
| **Open book** | (illustrated) | Chapter/lesson icons |

### Decorative Pattern
Use Islamic geometric patterns (8-point star, arabesque) as **very subtle** background textures — 5–8% opacity on card backgrounds. Never as a foreground element.

```
Pattern color: #D4A847 (gold) at 6% opacity on #2C3E6B (slate blue) cards
```

---

## 6. Ustadh Noor — Character Design

### Concept
Ustadh Noor is ArabAI's AI tutor. He is not a cartoon mascot. He is a **calm, wise illustrated figure** — think of him as a profile picture, not an owl.

### Visual Description
- **Style:** Flat illustration, minimal detail, warm palette
- **Appearance:** Mature face, short beard, small white kufi
- **Expression:** Default — gentle smile, eyes that communicate patience
- **Colors:** Deep teal robe, ivory kufi, warm skin tone
- **Background:** Soft circular gradient (gold to teal)

### Usage Rules
- Show Ustadh Noor avatar in: chat screen header, onboarding screen 6, achievement unlocks
- Size: 48px (chat header), 80px (onboarding), 64px (achievement)
- Never stretch or distort the avatar
- Never show Ustadh Noor with a negative/sad expression

### Chat Bubble Style
```
Ustadh Noor messages:
  Background: #2C3E6B (slate blue)
  Border: 1px solid #D4A847 (gold) — left side only (like a quote mark)
  Text: Ivory White, Nunito Regular 15px
  Avatar: 36px circle, top-left of bubble

User messages:
  Background: #D4A847 (gold) at 15% opacity
  Border: none
  Text: Ivory White, Nunito Regular 15px
  Alignment: right side of screen
```

---

## 7. UI Component Styles

### Buttons

```
Primary Button (CTA — "Continue", "Start Lesson"):
  Background:     #D4A847 (Warm Gold)
  Text:           #1B2A4A (Deep Lapis) — dark text on gold
  Font:           Nunito Bold 16px
  Border Radius:  14px
  Height:         52px
  Shadow:         0 4px 16px rgba(212, 168, 71, 0.35)
  Active state:   scale(0.97) + brightness(0.9)

Secondary Button ("Skip", "Later"):
  Background:     transparent
  Border:         1.5px solid #2C3E6B
  Text:           #B8C4D4
  Font:           Nunito SemiBold 15px
  Border Radius:  14px
  Height:         48px

Danger Button ("Wrong answer" feedback):
  Background:     #C0392B at 15% opacity
  Border:         1.5px solid #C0392B
  Text:           #E8A09A
  Border Radius:  14px
  Height:         48px
```

### Cards

```
Lesson Card:
  Background:     #2C3E6B (Slate Blue)
  Border Radius:  16px
  Padding:        16px
  Shadow:         0 2px 12px rgba(0,0,0,0.3)
  Border:         1px solid #1F3055 (subtle border)
  Locked state:   opacity 0.5 + lock icon overlay

Chapter Card (World Map node):
  Shape:          Circle, 72px diameter
  Background:     #D4A847 (gold) for unlocked
  Background:     #2C3E6B for locked
  Border:         3px solid #D4A847 for current chapter
  Shadow:         0 4px 20px rgba(212, 168, 71, 0.4) for active
```

### Progress Bar (XP / Lesson)

```
Track:          #1F3055 (dark, recessed)
Fill:           Linear gradient → #D4A847 to #F0C060 (gold shimmer)
Height:         8px
Border Radius:  4px
Animated:       Smooth width transition 600ms ease-out
```

### Streak Badge

```
Container:      Horizontal pill — #FF6B35 at 20% opacity
Border:         1px solid #FF6B35
Icon:           🔥 or custom flame SVG, 18px
Number:         Nunito ExtraBold 18px, #FF6B35
Label:          Nunito Regular 11px, #FF6B35 — "day streak"
```

### Bottom Tab Bar

```
Background:     #0F1923 (Midnight) with top border 1px #1F3055
Height:         60px + safe area inset
Active icon:    #D4A847 (gold)
Inactive icon:  #7A8BA0 (muted)
Active label:   Nunito SemiBold 11px, #D4A847
Inactive label: Nunito Regular 11px, #7A8BA0
Active indicator: Small gold dot (4px) below active icon
```

### Flashcard

```
Front (Arabic word):
  Background:   #2C3E6B
  Border:       1px solid #D4A847 at 40% opacity
  Border Radius: 20px
  Shadow:       0 8px 32px rgba(0,0,0,0.4)
  Arabic text:  Amiri Regular, 40px, centered, Ivory White
  Transliteration: Nunito Italic, 16px, #B8C4D4, below Arabic

Back (meaning):
  Background:   #1B2A4A (slightly different to signal flip)
  Same border/radius/shadow
  Meaning text: Nunito SemiBold, 22px, Ivory White
  Example sentence: Nunito Regular, 14px, #B8C4D4

Flip animation: rotateY 180° over 350ms ease-in-out
```

---

## 8. Motion & Animation Language

### Principles
1. **Purposeful** — every animation communicates something (correct, wrong, progress, reward)
2. **Fast** — never longer than 500ms for feedback animations
3. **Celebratory but not excessive** — XP animations are satisfying, not obnoxious
4. **Consistent easing** — use `ease-out` for entrances, `ease-in` for exits

### Animation Definitions

```
Page transitions:
  Type:     Slide from right (forward), slide to right (back)
  Duration: 300ms ease-out

Correct answer:
  Card border flashes #2A7F6F (jade teal)
  Checkmark scales from 0 → 1.2 → 1.0
  Duration: 200ms + 150ms bounce
  Optional: subtle confetti (5–8 particles max)

Wrong answer:
  Card shakes horizontally (±6px, 3 times)
  Border flashes #C0392B (crimson)
  Duration: 300ms

XP reward popup:
  "+10 XP" text appears above lesson card
  Floats upward 30px while fading out
  Duration: 800ms ease-out
  Font: Nunito ExtraBold, #D4A847

Streak fire:
  Flame icon pulses scale 1.0 → 1.15 → 1.0
  Duration: 1.5s loop (while streak screen is visible)

Lesson completion:
  Full screen gold radial burst (opacity 0 → 0.15 → 0)
  Star/achievement badge scales in
  Duration: 600ms total

Button press:
  scale(0.96) on press-in
  scale(1.0) on press-out
  Duration: 100ms each
```

---

## 9. Voice & Tone

### Core Tone
**Warm. Encouraging. Knowledgeable. Never preachy.**

### By Context

| Context | Tone | Example |
|---|---|---|
| Onboarding | Welcoming, excited for them | "Your journey to understanding the Quran starts here." |
| Lesson instructions | Clear, direct, simple | "Tap the card to see the meaning." |
| Correct answer | Genuinely happy | "Mashallah! That's exactly right." |
| Wrong answer | Gentle, no shame | "Not quite — let's look at this again." |
| Streak reminder | Warm urgency | "Your 7-day streak is waiting for you." |
| Ustadh Noor | Scholarly but warm | "Great question. In Arabic grammar, this is called..." |
| Empty states | Encouraging | "No lessons yet — your first one is just one tap away." |
| Error states | Calm, helpful | "Something went wrong. Let's try that again." |

### Words to Use
- Mashallah, Alhamdulillah (naturally, not performatively)
- "Ustadh Noor says..."
- "You've learned..."
- "One step closer..."
- "Keep going"

### Words to Avoid
- "Oops!" (too Silicon Valley)
- "Awesome!" (hollow)
- "Error 404" or any technical language shown to users
- Guilt language: "You broke your streak" → instead: "Start a new streak today"

---

## 10. Do's & Don'ts

### Visual Do's
- ✅ Use gold sparingly — it should feel precious, not cheap
- ✅ Give Arabic text generous space and line height
- ✅ Use the deep lapis background consistently — it IS the brand
- ✅ Keep screens focused — one primary action per screen
- ✅ Use the Bismillah as a decorative opener on key screens
- ✅ Celebrate progress visually — XP, streaks, achievements deserve moments

### Visual Don'ts
- ❌ Don't use pure white (#FFFFFF) backgrounds — use Ivory (#F5F0E8) or Warm Cream
- ❌ Don't use green as a primary color — it reads as Duolingo
- ❌ Don't crowd Arabic text — it needs breathing room more than Latin text
- ❌ Don't use more than 2 font families on any single screen
- ❌ Don't show Arabic without diacritics (tashkeel) in beginner lessons — learners need the vowel marks
- ❌ Don't make error states aggressive — wrong answers are learning moments

### Copy Do's
- ✅ Use Islamic expressions naturally (not performatively)
- ✅ Write UI copy in the same warm tone as Ustadh Noor
- ✅ Keep button labels to 1–2 words max
- ✅ Use second person: "Your progress", "Your streak"

### Copy Don'ts
- ❌ Don't use all caps except Labels (12px, navigation)
- ❌ Don't write error messages that blame the user
- ❌ Don't use placeholder copy like "Lorem ipsum" anywhere in the app — write real copy from Day 1

---

## 11. React Native Tokens (Code-Ready)

Copy this directly into `constants/theme.ts` in your Expo project:

```typescript
// constants/theme.ts
// ArabAI Brand Tokens v1.0.0

export const Colors = {
  // Backgrounds
  bg: {
    primary:   '#1B2A4A',
    secondary: '#0F1923',
    card:      '#2C3E6B',
    surface:   '#243352',
  },

  // Text
  text: {
    primary:   '#F5F0E8',
    secondary: '#B8C4D4',
    muted:     '#7A8BA0',
    arabic:    '#F5F0E8',
  },

  // Accents
  accent: {
    gold:       '#D4A847',
    goldMuted:  '#A07830',
    goldLight:  '#F0C060',
    teal:       '#2A7F6F',
    crimson:    '#C0392B',
    streak:     '#FF6B35',
  },

  // Borders
  border: {
    default: '#2C3E6B',
    subtle:  '#1F3055',
    gold:    '#D4A847',
  },

  // Semantic
  success:  '#2A7F6F',
  error:    '#C0392B',
  warning:  '#D4A847',
} as const

export const Fonts = {
  arabic:    'Amiri-Regular',
  arabicBold:'Amiri-Bold',
  display:   'ScheherazadeNew-Bold',
  regular:   'Nunito-Regular',
  semiBold:  'Nunito-SemiBold',
  bold:      'Nunito-Bold',
  extraBold: 'Nunito-ExtraBold',
} as const

export const FontSizes = {
  displayXL: 40,
  displayL:  32,
  h1:        26,
  h2:        22,
  h3:        18,
  bodyL:     16,
  bodyM:     14,
  caption:   12,
  label:     12,
  arabicXL:  40,
  arabicL:   30,
  arabicM:   22,
  arabicS:   16,
} as const

export const LineHeights = {
  displayXL: 48,
  displayL:  40,
  h1:        34,
  h2:        30,
  h3:        26,
  bodyL:     24,
  bodyM:     22,
  caption:   18,
  arabicXL:  58,
  arabicL:   46,
  arabicM:   36,
  arabicS:   28,
} as const

export const Radii = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 9999,
} as const

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
  xxxl:48,
} as const

export const Shadows = {
  card: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius:  12,
    elevation:     4,
  },
  goldGlow: {
    shadowColor:   '#D4A847',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius:  16,
    elevation:     8,
  },
} as const

export const Animation = {
  fast:    150,
  normal:  300,
  slow:    500,
  xpFloat: 800,
} as const
```

---

*This document is the single source of truth for all ArabAI (Noor) brand decisions.*
*Any design — screen, component, icon, animation — must be traceable back to a token or rule in this document.*

*Brand Version 1.0.0 — April 2026*
