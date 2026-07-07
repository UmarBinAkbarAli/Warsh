# Warsh · وَرْش — App Specification
## File 11: Design System & Copy

**Status:** Locked
**Version:** 1.1 — Gold updated to A1-preview gilt `#C49B4D`; Navy `#071B44` added as brand token and primary-CTA surface
**Last updated:** 2026-07-08
**Depends on:** File 01 (Identity & Principles), File 02 (Information Architecture)

> This file locks every visual decision in Warsh — colors, typography, spacing, components, animations, illustrations — and provides the complete English copy for every UI string in the app. Urdu translation is a separate content task that produces an `ur.json` file paired with the `en.json` defined here.

---

## Part 1 — Design Principles

### 1.1 The visual language

Warsh's visual language is **classical, parchment-toned, scholarly, warm**. Not minimalist. Not maximalist. Not Material Design. Not iOS-default. It is its own visual identity, rooted in the aesthetic of:

- An open Quran with gilt edges
- A well-worn Madinah Reader textbook
- A halaqa at sunset
- The hand-illuminated manuscripts of Andalusian and Ottoman traditions

Modernized for mobile. Beautiful in motion. Unmistakably Warsh.

### 1.2 Design constraints (locked)

- **No bright reds, electric blues, neon greens, or any "tech app" colors**
- **No cartoon mascots, characters, or kawaii illustrations**
- **No emoji in product UI** (emojis only in user-typed Noor chat messages, and in some notification copy where culturally appropriate like 🌅)
- **No flat solid backgrounds without subtle texture** (everything sits on parchment with motif)
- **No harsh shadows, drop-shadows with high contrast, or glassmorphism**
- **No gradients used as primary surface colors** (gradient is for emphasis only, never as a default)
- **No iOS or Android-default components used as-is** (every component is custom-styled)
- **Generous white space** — text breathes; cards have room

### 1.3 What the user should feel

When the user opens Warsh, they should feel:

1. **Respected.** This is not a children's app.
2. **At ease.** Nothing feels cluttered, urgent, or noisy.
3. **In the presence of something beautiful.** The Quran is here. The language of revelation is treated with care.
4. **Capable.** They can do this. The app is on their side.

If a design choice contradicts any of these, it's wrong.

---

## Part 2 — Color System

### 2.1 The 6 brand tokens

Warsh uses **6 color tokens only**. Everything else is derived or restricted to specific micro-uses.

> **v1.1 (2026-07-08):** Gold updated to the richer A1-preview gilt (`#C49B4D`, was `#C8A047`) and **Navy** promoted from the preview screens into the brand palette as the high-emphasis CTA surface.

| Token | Hex | Name | Use |
|---|---|---|---|
| `--ink` | `#1A1A1A` | Ink | Primary text, headings, primary icons |
| `--gold` | `#C49B4D` | Gold | Accents, active states, highlights, milestones, completion |
| `--navy` | `#071B44` | Navy | Primary CTA surface, rare high-emphasis dark surfaces |
| `--parchment` | `#F4EBD0` | Parchment | Primary background, card backgrounds, container surfaces |
| `--sage` | `#7A8B70` | Sage | Secondary text, dimmed states, subtle UI, inactive tabs |
| `--cream` | `#FAF6E9` | Cream | Lighter surfaces, alternate cards, conversation bubbles |

### 2.2 Color derivatives (extended palette)

Only when needed:

| Derivative | Hex | Use |
|---|---|---|
| `--ink-soft` | `#3D3D3D` | Body text where pure Ink is too heavy |
| `--ink-muted` | `#5F5F5F` | Captions, helper text |
| `--gold-soft` | `#D4B06A` | Gold-light: lighter Gold accents, text/icons on Navy surfaces |
| `--gold-deep` | `#A88648` | Gold pressed state, gold text on light backgrounds |
| `--navy-deep` | `#04122E` | Navy pressed state |
| `--sage-soft` | `#9DAB94` | Lighter Sage (for "not yet learned" Tadabbur words) |
| `--sage-deep` | `#5A6953` | Darker Sage (for confirmation states) |
| `--parchment-soft` | `#FAF2DD` | Lighter parchment for emphasis cards |
| `--parchment-deep` | `#EDDFAF` | Slightly darker parchment for grouping |
| `--white-pure` | `#FFFFFF` | Used only for the very rare highest-contrast moment |
| `--black-pure` | `#000000` | Used only for system text on splash screen |

### 2.3 Functional colors (sparingly used)

| Token | Hex | Use |
|---|---|---|
| `--warning-soft` | `#C8744A` | Subtle "wrong answer" indication (warmer red, not harsh) |
| `--success-soft` | `#7B9461` | "Correct answer" subtle border (close to sage, slightly more vibrant) |
| `--info` | `#7A8B70` | Same as sage — informational notes |

**Critical:** No bright reds. Wrong answers use a warm terracotta (`--warning-soft`), not a panic red.

### 2.4 Color usage rules

| Element | Color |
|---|---|
| Default text | `--ink` |
| Body paragraphs | `--ink-soft` |
| Captions, helper text | `--ink-muted` |
| Headings | `--ink` |
| Arabic text | `--ink` (never colored except in Reveal beat highlights or Tadabbur word states) |
| Buttons — primary | Background: `--navy`, border: 2pt `--gold`, text: `--gold-soft` |
| Buttons — secondary | Background: transparent, border: `--sage`, text: `--ink` |
| Buttons — tertiary (text link) | Color: `--gold-deep` |
| Active tab | Icon and label: `--gold` |
| Inactive tab | Icon and label: `--sage` |
| Card background | `--parchment` or `--cream` (alternating for grouping) |
| Screen background | `--parchment` |
| Highlighted word (Reveal, Tadabbur mastered) | `--gold` |
| Dim word (Tadabbur not learned) | `--sage-soft` |
| Wrong answer feedback | `--warning-soft` (border or background glow) |
| Correct answer feedback | `--gold` (border or background glow) |
| Streak heatmap (low activity) | `--sage-soft` |
| Streak heatmap (high activity) | `--gold` |
| Dividers, borders | `--sage-soft` |

### 2.5 Dark mode

**Locked for v1: light mode only.**

The brand identity is parchment-toned. A "dark mode" inversion would feel like a different app. If users overwhelmingly request dark mode in beta feedback, we revisit in v1.1 with a *carefully* designed dark variant that maintains the brand feel (not just an inverted palette).

For v1: a small caption in Settings → Display: "Dark mode coming, in shaa Allah."

---

## Part 3 — Typography

### 3.1 Font families (locked)

Two fonts. That's it.

**Arabic font:** Scheherazade New
- A modern, scholarly Naskh-based font
- Excellent harakat (diacritical mark) rendering
- Open Font License, free to use
- Variations: Regular, Medium, SemiBold, Bold

**Latin font (English):** Lora
- A serif font with classical character
- Excellent readability at all sizes
- Open Font License, free to use
- Variations: Regular, Italic, Medium, SemiBold, Bold

**Urdu:** Reuse Scheherazade New for Urdu text. Scheherazade handles Urdu's Nastaliq-influenced shapes acceptably for UI purposes. (For deep Urdu typography in v2, consider Jameel Noori Nastaleeq.)

### 3.2 Font weights used

For each font, we use only 3 weights:

| Use | Lora | Scheherazade New |
|---|---|---|
| Regular text | Regular (400) | Regular (400) |
| Emphasis | SemiBold (600) | SemiBold (600) |
| Headings | Bold (700) | Bold (700) |

Italic Lora is used only for ayat translations and citations.

### 3.3 Type scale

A custom type scale, sized for mobile readability:

| Token | Size (pt) | Line height | Use |
|---|---|---|---|
| `--text-2xs` | 10 | 14 | Tiny captions (timestamps, footnotes) |
| `--text-xs` | 12 | 18 | Helper text, labels |
| `--text-sm` | 14 | 20 | Secondary body text |
| `--text-base` | 16 | 24 | Default body text |
| `--text-lg` | 18 | 28 | Sub-headings, large body |
| `--text-xl` | 22 | 32 | Section headings |
| `--text-2xl` | 28 | 38 | Screen titles |
| `--text-3xl` | 36 | 44 | Page-level Arabic text (vocabulary detail, etc.) |
| `--text-4xl` | 48 | 56 | Hero ayat in lesson Hooks |
| `--text-5xl` | 64 | 72 | Special celebrations (chapter completion, Surah understood) |

### 3.4 Arabic vs Latin sizing

Arabic typography needs **more vertical breathing room** for harakat (vowel marks) above and below letters. When mixing Arabic and Latin in the same view:

- Arabic line height should be 1.5x the same point size in Latin
- Example: 24pt Latin = 36-line-height Arabic for same point size
- Larger Arabic display sizes (32pt+) should use line heights of ~1.4x

This rule is baked into the typography components below.

### 3.5 Typography components

Predefined React components that encapsulate type styles:

```
<ScreenTitle>      — text-2xl, Bold, --ink, used for screen headers
<SectionHeading>   — text-xl, SemiBold, --ink, used for section dividers within screens
<BodyText>         — text-base, Regular, --ink-soft, default paragraph text
<HelperText>       — text-sm, Regular, --ink-muted, captions and helpers
<Caption>          — text-xs, Regular, --ink-muted, smallest text
<ButtonText>       — text-base, SemiBold, --ink, button labels
<ArabicDisplay>    — text-4xl Scheherazade, --ink, large Arabic display text
<ArabicBody>       — text-lg Scheherazade, --ink, Arabic body text (discover cards, vocab lists)
<Transliteration>  — text-sm Lora Italic, --ink-muted, transliterated pronunciations
<Translation>      — text-base Lora, --ink-soft, translations of Arabic to user's language
```

---

## Part 4 — Spacing System

### 4.1 The 8-point grid

All spacing is in multiples of 4. The base unit is 4pt.

| Token | Value | Use |
|---|---|---|
| `--space-1` | 4pt | Tightest spacing (icon-to-text within a chip) |
| `--space-2` | 8pt | Tight spacing (within a card, related elements) |
| `--space-3` | 12pt | Standard spacing (between related elements) |
| `--space-4` | 16pt | Comfortable spacing (default gap) |
| `--space-5` | 20pt | Section padding |
| `--space-6` | 24pt | Card padding (default) |
| `--space-7` | 32pt | Between sections within a screen |
| `--space-8` | 48pt | Major section separation |
| `--space-9` | 64pt | Top-of-screen padding from notch |

### 4.2 Layout rules

- **Screen horizontal padding:** 20pt (`--space-5`) on both sides
- **Card padding:** 24pt (`--space-6`) inside cards
- **Card-to-card vertical gap:** 16pt (`--space-4`)
- **Between sections:** 32pt (`--space-7`)
- **Below screen title (top padding):** 24pt
- **Above bottom tab bar:** 16pt (last card has this margin-bottom)

### 4.3 Touch targets

- **Minimum touch target:** 44pt × 44pt (per Apple HIG and accessibility standards)
- **Icon buttons:** 44pt × 44pt hit area, even if visual icon is smaller (12–24pt)
- **Text buttons:** Minimum 44pt height
- **List rows:** Minimum 56pt height for comfortable tapping

---

## Part 5 — Components Library

### 5.1 Buttons

#### Primary Button

The A1 hero-CTA treatment (v1.1): a navy surface framed in gold.

- Background: `--navy`
- Border: 2pt `--gold`
- Text: `--gold-soft`, SemiBold
- Height: 56pt
- Padding: 16pt horizontal, vertical centered
- Border radius: 12pt
- Subtle pressed state: background darkens to `--navy-deep`
- Disabled state: `--navy` at 40% opacity

#### Secondary Button

- Background: transparent
- Border: 1pt `--sage`
- Text: `--ink`, SemiBold
- Same dimensions as Primary
- Pressed state: background fades to `--sage-soft` at 20% opacity

#### Text Button (link)

- Color: `--gold-deep`
- Underline on hover/press
- No background

#### Destructive Button

- Background: transparent
- Text: `--warning-soft`, SemiBold
- Used for Delete actions only
- Always paired with confirmation modal

### 5.2 Cards

#### Default Card

- Background: `--parchment` (or `--cream` for alternating layouts)
- Border: none, but subtle 1pt `--sage-soft` for emphasis cards
- Border radius: 16pt
- Padding: 24pt internal
- Subtle elevation (very soft shadow if any, mostly visual through color):
  ```
  box-shadow: 0 2px 8px rgba(26, 26, 26, 0.04);
  ```

#### Emphasis Card (with border)

- Same as Default but with `--gold-soft` border at 1pt
- Used for Daily Goal, current chapter, and other "what to do next" cards

#### Tappable Card

- All Default + a slight scale-down animation on press (0.98 scale)
- Haptic feedback on tap (iOS)

### 5.3 Inputs

#### Text Input

- Background: `--cream`
- Border: 1pt `--sage-soft` (default), 1pt `--gold` (focused)
- Border radius: 12pt
- Height: 48pt (single line), 96pt+ (multi-line)
- Padding: 16pt horizontal, 12pt vertical
- Text: `--ink`, Lora Regular
- Placeholder: `--ink-muted`, Lora Italic Regular
- Error state: border becomes `--warning-soft`
- Helper text below: 12pt, `--ink-muted`
- Error message below: 12pt, `--warning-soft`

#### Search Input

- Same as Text Input + a left-aligned search icon
- Clear button on the right when text is present

### 5.4 Chips (selection)

- Background: `--cream`
- Border: 1pt `--sage-soft`
- Border radius: 24pt (fully rounded)
- Padding: 10pt horizontal, 6pt vertical
- Text: `--ink`, Lora SemiBold, 14pt
- Selected state: background `--gold-soft`, border `--gold`
- Pressed state: subtle scale-down (0.97)

### 5.5 Tabs (bottom navigation)

- Background: `--parchment` with a subtle 1pt top border in `--sage-soft`
- Height: 64pt (plus iOS safe area)
- Icons: 24pt at center of each tab
- Labels: 12pt Lora, `--sage` (inactive) or `--gold` (active)
- Active tab has a small `--gold` dot indicator above the icon
- Tap feedback: subtle haptic + 0.98 scale animation

### 5.6 Modals

#### Bottom Sheet Modal

- Slides up from bottom
- Background: `--cream`
- Border radius: 24pt top corners only
- A subtle 4pt × 32pt rounded handle at the top center, in `--sage-soft`
- Backdrop: `--ink` at 40% opacity
- Dismissible by tapping backdrop or pulling down

#### Full-screen Modal

- Background: `--parchment`
- Slides up from bottom with subtle ease-out
- Close icon (X) in top-right, in `--ink-muted`
- Backdrop fades in/out

#### Confirmation Modal

- Centered, smaller than full-screen
- Background: `--parchment`
- Border radius: 20pt
- Width: 80% of screen
- Has title, body, two buttons (cancel + confirm/destructive)
- Backdrop: `--ink` at 60% opacity

### 5.7 Toasts

- Bottom-aligned, 16pt from bottom
- Background: `--ink` at 90% opacity
- Text: `--parchment`, 14pt SemiBold
- Border radius: 16pt
- Auto-dismiss after 3 seconds
- Subtle slide-up entry, slide-down exit

### 5.8 Loading states

- Skeleton screens, not spinners
- Skeleton uses `--cream` with a subtle shimmer animation across it
- Shimmer color: `--parchment-soft`
- Skeleton matches the shape of the content it's replacing
- No "Loading..." text — the skeleton implies it

### 5.9 Empty states

- Centered, with a subtle illustration (parchment-tones, single figure or object)
- A 2-line empathetic message in Lora Regular, `--ink-soft`
- Often paired with a single CTA button
- See Part 12 for specific empty state copy

### 5.10 Dividers

- 1pt horizontal line, `--sage-soft`
- 24pt vertical margin (`--space-6`) above and below

### 5.11 Avatars

- Default user avatar: a stylized monogram in `--gold` on `--parchment-soft`
- 32pt × 32pt for list items, 80pt × 80pt for profile
- If user uploaded a photo, photo replaces monogram
- Always circular

### 5.12 Badges

- Small circular indicators on tabs and icons
- 8pt × 8pt, `--gold` background
- Used for new content, new milestones, etc.

---

## Part 6 — Iconography

### 6.1 Icon library

**Locked:** Use **Lucide React Native** for system icons (search, close, settings gear, microphone, audio play, etc.).

Why Lucide:
- Open source
- Clean, balanced visual style
- Stroke-based (matches the brand's restrained aesthetic)
- React Native bindings available
- Consistent across all icons

### 6.2 Icon sizing

- **Small (in chips, inline):** 16pt
- **Default (buttons, list rows):** 20pt
- **Large (modal headlines, tabs):** 24pt
- **Hero (empty states, illustrations):** 64pt+

### 6.3 Icon colors

All icons inherit the color of their context:

- In a Primary Button: `--ink`
- In a tab (active): `--gold`
- In a tab (inactive): `--sage`
- Inline in text: matches surrounding text color
- Decorative on cards: `--gold` (for emphasis) or `--sage` (for neutral)

### 6.4 Custom icons (illustrations)

Some Warsh icons are not from Lucide but custom-illustrated:

- Tab icons (per File 02 Section 2.3)
- Milestone badges (each milestone has its own custom illustration)
- Empty state illustrations
- Topic illustrations for Vocabulary Bank (16 of them, per File 07)
- Scene illustrations for SPOKEN_PHRASES lessons (per File 06)

These are produced via the illustration pipeline (per File 05 Section 7).

---

## Part 7 — Illustrations

### 7.1 Illustration style (locked)

Per File 01 and File 05:

- **Color palette:** Parchment, Ink, Gold, Sage, Cream — and limited warm earth tones (terracotta, deep ochre, soft brown) for variation
- **Style:** Flat illustration, minimal detail, single object or scene centered
- **No text** in illustrations
- **No high contrast** — soft edges, subtle gradients
- **Inspired by:** Islamic geometric sensibility, Ottoman/Andalusian manuscript art, modern flat illustration
- **Dimensions:** 512×512px primary, 128×128px thumbnail derived

### 7.2 Locked illustration prompt (for AI generation)

For DALL-E / Midjourney / GPT Image batch generation:

> Flat illustration, minimal detail, warm earth tones (parchment cream background, terracotta, sage green, gold accents), single object centered on off-white parchment background, no text, no harsh shadows, clean vector-like aesthetic, inspired by Islamic geometric sensibility and Ottoman manuscript art, 512×512px

Each generation includes the specific object/scene as additional context (e.g., "showing a book," "showing a halaqa with student and teacher").

### 7.3 Illustration categories and quantities

Per File 05 Section 7.1:

| Category | Approx. count | Notes |
|---|---|---|
| Vocabulary word illustrations | ~600 | One per vocab word |
| Discover card illustrations | Reuses vocab images + ~200 chapter-specific | Most reuse from vocab; some need contextual variants |
| Onboarding scene illustrations | ~10 | For A2–A6, M3 (mic permission), etc. |
| Milestone badges | ~50 | Custom per milestone |
| Topic illustrations (Vocabulary Bank) | 16 | Per File 07 |
| SPOKEN_PHRASES scene illustrations | 11 | Per File 06 |
| Empty state illustrations | ~10 | Various screens |
| Chapter card illustrations | 72 (optional) | Could be auto-generated thematic for each chapter |
| Profile / share decorative | ~20 | Small decorative elements |
| **Estimated total unique:** | **~1,000–1,500** | With reuse, ~2,700 placements |

### 7.4 Manual review and curation

AI-generated illustrations need human curation:

- Generate 3–5 variations per word/scene
- Curate manually for quality and consistency
- Reject and regenerate if any illustration:
  - Includes text (we don't want text in illustrations)
  - Has unintended cultural inappropriateness
  - Has religious imagery that crosses scholarly boundaries (no depictions of prophets, etc.)
  - Strays from the parchment palette
- Final approved set is uploaded to Cloudflare R2 with consistent naming (per File 06 Section 4.4)

---

## Part 8 — Animation Principles

### 8.1 Animation philosophy

Animation in Warsh should:

- **Feel warm and gentle,** not snappy or bouncy
- **Reinforce the brand** (parchment, gold light, subtle motion)
- **Communicate state changes,** never decoration for its own sake
- **Never delay the user** unnecessarily

### 8.2 Standard timing

| Animation type | Duration | Easing |
|---|---|---|
| Screen transitions | 300ms | ease-out |
| Modal slide-up | 350ms | ease-out |
| Modal slide-down (dismiss) | 250ms | ease-in |
| Button press | 100ms | ease |
| Tab change | 200ms | ease-out |
| Card tap (scale) | 150ms | ease-out |
| XP count-up | 1500ms | ease-out |
| Gold particle effects (Close beat) | 2000ms | linear |
| Tadabbur word color transition (Sage → Gold) | 600ms | ease-in-out |
| Streak heatmap reveal | 400ms | ease-out |
| Waveform animation (audio playback) | continuous | linear |

### 8.3 Specific animations

#### Splash screen (A0)

- Warsh logo fades in from 0 → 100% opacity over 600ms
- The Arabic dot on وَرْش illuminates last (1000ms total)
- Holds for ~500ms, then transitions to first screen

#### Lesson Close beat (P5)

- Soft Gold particle effect, gentle drift upward
- Particles spawn at random positions, fade in, slowly rise, fade out
- Maximum 12 particles on screen at once
- Total animation: ~2 seconds, then settles

#### Chapter completion celebration

- Parchment background fades to a Gold-tinted parchment over 1 second
- Chapter title animates in from below, with subtle scale-up
- "Chapter complete" text fades in below
- Ayah/hadith fades in below that

#### Milestone celebration (M1)

- Backdrop fades in (--ink at 60% opacity)
- Modal appears with subtle scale-up (0.95 → 1.0) + fade-in
- Badge illustration fades in + slight bounce (subtle, not childish)
- Audio plays an ascending chime

#### Tadabbur word transition (Sage → Gold)

- The most important animation in the app
- Single word in the Surah view transitions from Sage to Gold over 600ms
- Optional subtle sparkle particle on the word at the moment of transition
- Audio: very subtle chime (if SFX on)
- This is the "you now understand this word" moment — handle with care

#### Exercise feedback

- **Correct:** Card border pulses Gold over 300ms; subtle scale-up (1.0 → 1.03 → 1.0); chime sound
- **Wrong:** Card border pulses `--warning-soft` over 200ms; very subtle shake (3pt left, 3pt right, return); soft tone

### 8.4 Animation library

**Locked:**

- **Primary:** React Native Reanimated 3 — used for most animations (transitions, scales, fades)
- **Secondary:** Moti — used for declarative animations that are simpler in Moti's syntax
- **For complex celebrations:** Lottie (for Gold particle effects, badge reveals)

### 8.5 Reduce motion accessibility

Users with reduced motion enabled (system setting):

- All scale animations are skipped (immediate, no transition)
- Fade animations are reduced to 100ms (much faster)
- Particle effects are disabled entirely (replaced with a single subtle Gold glow)
- Tadabbur word transition uses fade only (no sparkle)
- Lesson Close beat uses static celebration (no animated particles)

This is detected via `AccessibilityInfo.isReduceMotionEnabled()`.

---

## Part 9 — Sound Design

### 9.1 Sound philosophy

All sounds in Warsh are:
- **Brief** — under 500ms
- **Gentle** — never sharp or jarring
- **Acoustically natural** — bell, chime, soft tone (not synthesizer beeps)
- **Optional** — toggleable in Settings

### 9.2 Sound inventory

| Sound | When played | File | Duration |
|---|---|---|---|
| `correct_answer.mp3` | Correct exercise answer | Sourced | 400ms |
| `wrong_answer.mp3` | Wrong exercise answer | Sourced | 300ms |
| `lesson_complete.mp3` | Close beat starts | Sourced | 800ms |
| `chapter_complete.mp3` | Chapter completion | Sourced | 1200ms |
| `milestone_unlock.mp3` | M1 modal opens | Sourced | 1000ms |
| `surah_understood.mp3` | M6 modal opens | Custom (Quranic recitation snippet) | 2000ms |
| `tadabbur_word_lit.mp3` | Tadabbur word transitions to Gold | Sourced | 200ms (very subtle) |
| `daily_goal_complete.mp3` | M5 toast | Sourced | 600ms |
| `noor_message.mp3` | New Noor chat message arrives | Sourced (subtle) | 200ms |

### 9.3 Sound sourcing

For v1, sound effects are sourced from:
- **Freesound.org** (Creative Commons licensed sounds)
- Specifically curate sounds that match the brand:
  - Soft bell chimes
  - Wooden box hits (for completion)
  - Light brass tones
- Process them through Audacity to:
  - Trim to under 500ms
  - Normalize volume to -16 LUFS
  - Export as MP3 at 96 kbps

No procedurally generated sounds. No "video game" SFX.

### 9.4 Sound volume

- Sound effects play at a moderate volume relative to the device's media volume
- App audio (lesson audio, Quranic recitation) plays at full media volume
- Sound effects are slightly quieter (~70%) so they don't dominate

### 9.5 Audio in silent mode

- iOS: Sounds respect silent mode by default
- For lesson audio (which IS the lesson, not decoration), the app sets `playsInSilentModeIOS: true` (per File 06 audio specs)
- Sound effects do NOT play in silent mode (respect the user's setting)

---

## Part 10 — Haptic Feedback

### 10.1 Haptic philosophy

Haptics are supplementary, never the primary signal.

### 10.2 Haptic inventory (iOS-only, locked)

Per File 04 Section 5.4:

| Event | Haptic |
|---|---|
| Correct answer | Light Success haptic (`Haptics.NotificationFeedbackType.Success`) |
| Wrong answer | Light Warning haptic (`Haptics.NotificationFeedbackType.Warning`) |
| Lesson complete | Medium Success haptic |
| Chapter complete | Heavy Success haptic + brief vibration pattern |
| Milestone unlock | Heavy Success haptic |
| Tab change | Selection haptic (subtle) |
| Card tap | Light impact (subtle) |
| Modal open | Selection haptic |
| Button press (primary) | Light impact |

### 10.3 Android haptics

Android haptics are inconsistent across devices. For v1:
- Lesson completion haptic: enabled (using `Vibration.vibrate(50)`)
- All other haptics: disabled on Android (would feel inconsistent)
- Setting toggle is available but defaults to off on Android

### 10.4 Settings toggle

In Settings (Y3):
- "Haptics" with on/off toggle
- Default: on (iOS), off (Android)

---

## Part 11 — Layout Patterns

### 11.1 Screen structure

Standard screen structure:

```
┌────────────────────────────────────────┐
│ Status bar (system)                    │
├────────────────────────────────────────┤
│ Safe area top (notch padding)          │
├────────────────────────────────────────┤
│ Header bar (if any)                    │
│  - Back button (optional, left)        │
│  - Screen title (center or left)       │
│  - Action icons (right)                │
├────────────────────────────────────────┤
│                                        │
│ Scrollable content area                │
│  - Padding: 20pt horizontal            │
│  - Padding: 24pt top                   │
│                                        │
│  - Sections separated by 32pt vertical │
│                                        │
├────────────────────────────────────────┤
│ Bottom tab bar (if applicable)         │
├────────────────────────────────────────┤
│ Safe area bottom (home indicator)      │
└────────────────────────────────────────┘
```

### 11.2 RTL handling

Arabic and Urdu text is right-to-left. UI elements containing them must:

- Use `flexDirection: 'row-reverse'` for layouts that wrap RTL text
- Be careful with icons paired with RTL text (icons should mirror or be positioned appropriately)
- Use the `I18nManager` API for global RTL detection (if user selects Urdu)

**However:** Warsh's UI **does NOT fully flip to RTL** when in Urdu mode. The app uses LTR layout for UI elements (cards, navigation, buttons) but RTL text within those elements. This is a deliberate choice — fully RTL UI is more complex and adds development risk.

Discover cards and other Arabic-displaying elements always display Arabic text RTL within their card (text flows naturally from right to left).

### 11.3 Safe area handling

Use React Native Safe Area Context for handling:
- Notch (iOS)
- Status bar
- Home indicator (iOS)
- Display cutouts (Android)

All screens have the appropriate safe area padding applied to top and bottom.

---

## Part 12 — Complete UI Copy Library (English)

This section drafts every piece of UI text in the app. Urdu translations are produced separately as `ur.json`.

### 12.1 General / Common

```json
{
  "common.continue": "Continue →",
  "common.back": "Back",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.confirm": "Confirm",
  "common.delete": "Delete",
  "common.next": "Next →",
  "common.previous": "← Previous",
  "common.done": "Done",
  "common.skip": "Skip",
  "common.retry": "Try again",
  "common.loading": "Loading…",
  "common.error_generic": "Something didn't work. Try again?",
  "common.no_internet": "No connection. Your progress is saved — we'll sync when you're back.",
  "common.now": "now",
  "common.yes": "Yes",
  "common.no": "No",
  "common.maybe_later": "Maybe later"
}
```

### 12.2 Splash & Preview (A0–A7)

```json
{
  "splash.tagline": "Where Arabic is crafted.",

  "preview.welcome.title": "Let me show you what Warsh is.",
  "preview.welcome.subtitle": "Three minutes. No signup yet.",
  "preview.welcome.cta": "Begin →",
  "preview.welcome.skip": "Skip preview",

  "preview.hook.prompt": "First, listen.",
  "preview.hook.reference": "Surah Al-Kawthar · 108:1",
  "preview.hook.caption_after_audio": "You've heard this many times.",

  "preview.discover.prompt": "Now, the first word.",
  "preview.discover.reveal_hint": "Tap to reveal meaning",
  "preview.discover.translation": "Indeed, We",

  "preview.grammar_reveal.prompt": "And here's something hidden in plain sight.",
  "preview.grammar_reveal.teaching": "إِنَّا is إِنَّ (a particle of emphasis) + نَا (we). Allah is emphasizing — *truly*, We have given.",
  "preview.grammar_reveal.note": "This is what Warsh does. It shows you what's already there.",

  "preview.noor_intro.greeting": "As-salamu alaykum.",
  "preview.noor_intro.body": "I am Ustaad Noor. I will be your teacher. We will go word by word, ayah by ayah, until what you recite becomes what you understand.\n\nIn shaa Allah.",

  "preview.tadabbur_teaser.caption": "And here's where you're going.",
  "preview.tadabbur_teaser.description": "Word by word, Surah by Surah, the Quran becomes yours.",

  "preview.cta.title": "Begin your journey.",
  "preview.cta.subtitle": "Seven days free. Then $1/month, or $10/year. Less than a cup of chai.",
  "preview.cta.primary": "Begin →",
  "preview.cta.secondary": "I already have an account"
}
```

### 12.3 Onboarding (B0–B9)

```json
{
  "onboarding.language.heading": "Choose your language / اپنی زبان منتخب کریں",
  "onboarding.language.english_card_title": "English",
  "onboarding.language.english_card_subtitle": "I prefer English",
  "onboarding.language.urdu_card_title": "اردو",
  "onboarding.language.urdu_card_subtitle": "میں اردو ترجیح دیتا/دیتی ہوں",
  "onboarding.language.note": "You can change this later in settings.",

  "onboarding.welcome.heading": "As-salamu alaykum",
  "onboarding.welcome.subtitle": "Welcome to Warsh.",
  "onboarding.welcome.body": "You're about to begin a journey that changes how you experience the Quran, salah, and the language of revelation.\n\nLet's get to know you first.",

  "onboarding.goal.heading": "Why are you learning Arabic?",
  "onboarding.goal.subtitle": "Pick what's closest. No wrong answer.",
  "onboarding.goal.understand_quran": "To understand the Quran",
  "onboarding.goal.understand_quran_sub": "I recite but don't yet understand.",
  "onboarding.goal.deepen_salah": "To deepen my Salah",
  "onboarding.goal.deepen_salah_sub": "I want to know what I'm saying when I pray.",
  "onboarding.goal.study_scholarship": "To study Islamic scholarship",
  "onboarding.goal.study_scholarship_sub": "Hadith, tafsir, classical texts.",
  "onboarding.goal.speak_arabic": "To speak with Arabic speakers",
  "onboarding.goal.speak_arabic_sub": "In religious or scholarly settings.",
  "onboarding.goal.all_above": "All of the above",
  "onboarding.goal.all_above_sub": "Every reason matters.",

  "onboarding.level.heading": "What's your current level?",
  "onboarding.level.subtitle": "Be honest. We'll adjust if needed.",
  "onboarding.level.new": "New to Arabic",
  "onboarding.level.new_sub": "I don't know the alphabet yet.",
  "onboarding.level.alphabet": "I know the alphabet",
  "onboarding.level.alphabet_sub": "I can recognize letters but can't read words fluently.",
  "onboarding.level.read_quran": "I can read the Quran",
  "onboarding.level.read_quran_sub": "I read Quran in Arabic but don't understand most of it.",
  "onboarding.level.studied_grammar": "I've studied grammar before",
  "onboarding.level.studied_grammar_sub": "I've taken Arabic courses but want to deepen or refresh.",

  "onboarding.commitment.heading": "How much time can you spend daily?",
  "onboarding.commitment.subtitle": "Steady wins. Even 5 minutes a day adds up.",
  "onboarding.commitment.5min": "5 minutes",
  "onboarding.commitment.5min_sub": "Casual — I'll squeeze it in.",
  "onboarding.commitment.10min": "10 minutes",
  "onboarding.commitment.10min_sub": "Comfortable — I have a real window.",
  "onboarding.commitment.15min": "15 minutes",
  "onboarding.commitment.15min_sub": "Committed — this is a priority.",
  "onboarding.commitment.30plus": "30 minutes or more",
  "onboarding.commitment.30plus_sub": "Serious — I'm here to finish this.",

  "onboarding.name.heading": "What should we call you?",
  "onboarding.name.subtitle": "Noor will use this from time to time.",
  "onboarding.name.placeholder": "Your name",
  "onboarding.name.privacy": "Only you and Noor see this.",
  "onboarding.name.error_empty": "Please enter your name.",

  "onboarding.placement.heading": "Quick check — let's see where to begin.",
  "onboarding.placement.subtitle": "Three or four questions. No grades, just placement.",
  "onboarding.placement.recommend_title": "Based on your answers, we recommend starting at {chapter}.",
  "onboarding.placement.recommend_accept": "Yes, start there",
  "onboarding.placement.recommend_reject": "I'll start where I chose",

  "onboarding.ready.heading": "Here is your path.",
  "onboarding.ready.subtitle": "{name}, you'll begin at Chapter {chapter}. You've chosen {commitment}.",
  "onboarding.ready.starting_at": "Starting chapter",
  "onboarding.ready.total_chapters": "{count} chapters in your path",
  "onboarding.ready.estimated_completion": "Estimated completion: {time}",
  "onboarding.ready.daily_goal": "Daily goal: {minutes} minutes",
  "onboarding.ready.encouragement": "Take your time. Steady steps make scholars.",
  "onboarding.ready.cta": "Create my account →",

  "onboarding.account.heading": "Almost there.",
  "onboarding.account.subtitle": "Create your account to begin.",
  "onboarding.account.email_label": "Email",
  "onboarding.account.email_placeholder": "your@email.com",
  "onboarding.account.password_label": "Password",
  "onboarding.account.password_placeholder": "At least 8 characters",
  "onboarding.account.confirm_password_label": "Confirm password",
  "onboarding.account.terms": "By creating an account you agree to our [Terms](#terms) and [Privacy Policy](#privacy).",
  "onboarding.account.cta": "Create account →",
  "onboarding.account.error_email_exists": "This email is already registered. [Log in instead]?",
  "onboarding.account.error_password_weak": "Use at least 8 characters.",
  "onboarding.account.error_passwords_dont_match": "Passwords don't match.",
  "onboarding.account.error_network": "Couldn't reach the server. Try again?",

  "onboarding.permissions.heading": "One more thing.",
  "onboarding.permissions.subtitle": "These help Warsh work better for you.",
  "onboarding.permissions.notif_title": "Daily reminders",
  "onboarding.permissions.notif_body": "We'll remind you when it's time for today's lesson. You can change this anytime.",
  "onboarding.permissions.notif_cta": "Allow notifications",
  "onboarding.permissions.notif_skip": "Not now",
  "onboarding.permissions.notif_on": "On",
  "onboarding.permissions.notif_off": "Off — change in settings",
  "onboarding.permissions.mic_title": "Speaking practice",
  "onboarding.permissions.mic_body": "Some lessons let you practice speaking. Your recordings stay on your device — we don't store them.",
  "onboarding.permissions.mic_cta": "Allow microphone",
  "onboarding.permissions.mic_skip": "Not now",
  "onboarding.permissions.cta": "Begin →",

  "onboarding.welcome_toast": "Welcome to Warsh, {name}"
}
```

### 12.4 Auth (C1–C4)

```json
{
  "auth.welcome_back.heading": "Welcome back",
  "auth.welcome_back.login_cta": "Log in",
  "auth.welcome_back.new_cta": "I'm new — show me Warsh",

  "auth.login.heading": "Log in to continue.",
  "auth.login.email_label": "Email",
  "auth.login.password_label": "Password",
  "auth.login.forgot_link": "Forgot password?",
  "auth.login.cta": "Log in →",
  "auth.login.signup_link": "Don't have an account? Sign up",
  "auth.login.error_no_match": "Email and password don't match",
  "auth.login.error_no_account": "No account found with that email",

  "auth.forgot.heading": "Reset your password",
  "auth.forgot.subtitle": "Enter your email. We'll send you a link.",
  "auth.forgot.email_label": "Email",
  "auth.forgot.cta": "Send reset link →",

  "auth.reset_sent.heading": "Check your email.",
  "auth.reset_sent.subtitle": "We sent a reset link to {email}. Tap the link to set a new password.",
  "auth.reset_sent.back_cta": "Back to login →",
  "auth.reset_sent.resend_link": "Didn't receive it? Resend"
}
```

### 12.5 Learn tab (L1, L2, L3, L4, L5, L6)

```json
{
  "learn.tab_label": "Learn",
  "learn.tab_label_ar": "تَعَلَّم",

  "learn.home.daily_goal_label": "Today's goal: {minutes} min",
  "learn.home.daily_goal_progress": "{progress} / {total} min",
  "learn.home.daily_goal_complete": "Today's goal complete · Barak Allahu feek",
  "learn.home.daily_goal_above": "Today: {count} lessons completed · Above your goal, alhamdulillah",
  "learn.home.daily_goal_begin": "Begin a lesson →",

  "learn.home.current_chapter_label": "Currently learning",
  "learn.home.current_chapter_cta": "Continue learning →",
  "learn.home.lesson_progress": "Lesson {current} of {total}",

  "learn.home.tadabbur_label": "Tadabbur · تَدَبُّر",
  "learn.home.tadabbur_progress": "{percent}% understood",
  "learn.home.tadabbur_cta": "Tap to explore →",

  "learn.home.streak_label": "Streak",
  "learn.home.streak_value": "{days} days",
  "learn.home.streak_at_risk": "Your streak is at risk. Complete one lesson before [today's end] to keep it going.",

  "learn.home.word_of_day_label": "Today's Word",
  "learn.home.word_of_day_cta": "Tap to explore →",

  "learn.home.all_chapters_cta": "All chapters →",

  "learn.chapters.heading": "Your path / مَسَارُك",
  "learn.chapters.locked": "Locked",
  "learn.chapters.in_progress": "In progress",
  "learn.chapters.completed": "Completed",
  "learn.chapters.lesson_count": "{count} lessons",
  "learn.chapters.progress": "{completed} of {total} complete",

  "learn.chapter_detail.lesson_type_standard": "Lesson",
  "learn.chapter_detail.lesson_type_spoken": "Spoken Phrases",
  "learn.chapter_detail.lesson_type_review": "Review",
  "learn.chapter_detail.lesson_type_verb": "Verb Pattern",
  "learn.chapter_detail.xp_label": "{xp} XP",

  "learn.lesson_preview.what_youll_learn": "What you'll learn",
  "learn.lesson_preview.estimated_time": "~{minutes} min",
  "learn.lesson_preview.begin": "Begin →",
  "learn.lesson_preview.cancel": "Cancel",

  "learn.tadabbur_detail.heading": "Tadabbur",
  "learn.tadabbur_detail.current_focus_label": "Currently exploring",
  "learn.tadabbur_detail.play_full_surah": "Play full Surah",
  "learn.tadabbur_detail.completed_section": "Surahs you've understood",
  "learn.tadabbur_detail.upcoming_section": "Coming up",
  "learn.tadabbur_detail.words_to_learn": "{count} words to learn",
  "learn.tadabbur_detail.all_phase2_complete": "All 11 Surahs of Phase 2 understood.",
  "learn.tadabbur_detail.phase3_coming": "Phase 3 will begin with the rest of Juz 30, in shaa Allah.",

  "learn.streak_detail.heading": "Your streak",
  "learn.streak_detail.current_label": "Current streak",
  "learn.streak_detail.longest_label": "Longest streak",
  "learn.streak_detail.total_days_label": "Total active days",
  "learn.streak_detail.total_lessons_label": "Total lessons completed",
  "learn.streak_detail.milestones_label": "Streak milestones",
  "learn.streak_detail.freezes_remaining": "{count} streak freezes available"
}
```

### 12.6 Vocabulary tab (V1–V6)

```json
{
  "vocab.tab_label": "Vocabulary",
  "vocab.tab_label_ar": "مُفْرَدَات",

  "vocab.home.heading": "Vocabulary / مُفْرَدَات",
  "vocab.home.word_of_day_label": "Today's Word",
  "vocab.home.my_words_section_title": "Your words",
  "vocab.home.my_words_count": "{count} words learned",
  "vocab.home.my_words_see_all": "See all →",
  "vocab.home.srs_section_title": "Review",
  "vocab.home.srs_count": "{count} words ready for review",
  "vocab.home.srs_begin_cta": "Begin review →",
  "vocab.home.browse_section_title": "Browse by topic",
  "vocab.home.footer_note": "Vocabulary stays with you, always.",

  "vocab.my_words.heading": "Your words / كَلِمَاتُك",
  "vocab.my_words.empty": "Words you learn will gather here. Like seeds, planted.",
  "vocab.my_words.filter_all": "All",
  "vocab.my_words.filter_new": "Newly learned",
  "vocab.my_words.filter_mastered": "Mastered",
  "vocab.my_words.filter_review": "Needs review",
  "vocab.my_words.sort_recent": "Date learned",
  "vocab.my_words.sort_alpha": "Alphabetical (Arabic)",
  "vocab.my_words.sort_chapter": "By chapter",
  "vocab.my_words.sort_topic": "By topic",

  "vocab.topic.locked_indicator": "You'll learn this in Chapter {chapter}",

  "vocab.search.placeholder": "Search Arabic, English, or transliteration",
  "vocab.search.recent_label": "Recent searches",
  "vocab.search.empty": "No words match. Try a different spelling.",
  "vocab.search.cancel": "Cancel",

  "vocab.word_detail.heading": "Word",
  "vocab.word_detail.type_noun_m": "Noun (masculine)",
  "vocab.word_detail.type_noun_f": "Noun (feminine)",
  "vocab.word_detail.type_verb_past": "Verb — past tense",
  "vocab.word_detail.type_verb_present": "Verb — present tense",
  "vocab.word_detail.type_verb_imperative": "Verb — imperative",
  "vocab.word_detail.type_adjective": "Adjective",
  "vocab.word_detail.type_preposition": "Preposition",
  "vocab.word_detail.type_particle": "Particle",
  "vocab.word_detail.type_demonstrative": "Demonstrative pronoun",
  "vocab.word_detail.grammar_section": "Grammar",
  "vocab.word_detail.gender": "Gender",
  "vocab.word_detail.plural": "Plural",
  "vocab.word_detail.root": "Root",
  "vocab.word_detail.case_info": "Common usage",
  "vocab.word_detail.quranic_example": "From the Quran",
  "vocab.word_detail.frequency": "Appears {count} times in the Quran",
  "vocab.word_detail.lessons_section": "Where you learned this",
  "vocab.word_detail.favorite_add": "Add to favorites",
  "vocab.word_detail.favorite_remove": "Remove from favorites",
  "vocab.word_detail.mark_review": "Mark for review",
  "vocab.word_detail.hide_review": "Hide from review",
  "vocab.word_detail.related_words": "Related words (same root)",

  "vocab.srs.intro.heading": "Review your words",
  "vocab.srs.intro.subtitle": "{count} words to review today",
  "vocab.srs.intro.body": "Words you learned a while ago — let's see if they've stuck.",
  "vocab.srs.intro.cta": "Begin →",
  "vocab.srs.intro.empty": "Nothing to review today. Come back tomorrow, in shaa Allah.",
  "vocab.srs.card.reveal_prompt": "Tap to reveal meaning",
  "vocab.srs.card.hard": "Hard",
  "vocab.srs.card.good": "Good",
  "vocab.srs.card.easy": "Easy",
  "vocab.srs.summary.heading": "Review complete",
  "vocab.srs.summary.count": "{count} words reviewed",
  "vocab.srs.summary.breakdown": "{hard} hard · {good} good · {easy} easy",
  "vocab.srs.summary.xp": "+{xp} XP"
}
```

### 12.7 Noor tab (N1, N2)

```json
{
  "noor.tab_label": "Noor",
  "noor.tab_label_ar": "نُور",

  "noor.header_title": "Ustaad Noor",
  "noor.input_placeholder": "Ask Noor anything about Arabic...",
  "noor.send_button": "Send",
  "noor.daily_count": "{used} of 5 messages today",
  "noor.daily_count_with_extra": "{used} of 5 daily + {extra} extra remaining",
  "noor.limit_reached": "Daily limit reached",
  "noor.limit_reached_cta": "Get more →",

  "noor.suggested.lesson": "Explain my last lesson",
  "noor.suggested.demo": "Why do we say هَذَا and not هَذِهِ?",
  "noor.suggested.example": "Give me an example with this word",
  "noor.suggested.dont_understand": "I don't understand this grammar concept",

  "noor.menu.clear": "Clear conversation",
  "noor.menu.about": "About Noor",

  "noor.clear.title": "Clear this conversation?",
  "noor.clear.body": "Your messages and Noor's responses will be removed. This cannot be undone.",
  "noor.clear.cta": "Clear",

  "noor.about.title": "Ustaad Noor",
  "noor.about.body": "Ustaad Noor is the AI tutor in Warsh, designed to help you learn Arabic. Noor is powered by language AI but trained to behave as a warm, focused teacher.\n\nWhat Noor can help with:\n• Arabic grammar and vocabulary\n• Lesson clarification\n• Examples and explanations\n\nWhat Noor cannot help with:\n• Religious rulings or fatwa (ask a scholar)\n• General knowledge questions\n• Personal advice\n\nNoor does not remember previous conversations. Each chat starts fresh.",
  "noor.about.cta": "Got it",

  "noor.overage.title": "Continue learning with Noor",
  "noor.overage.body": "You've used today's 5 messages with Ustaad Noor.\n\nGet 20 additional messages for $0.99. They don't expire — use them whenever.",
  "noor.overage.cta": "Get more messages →",
  "noor.overage.cancel": "Maybe tomorrow",

  "noor.error.unavailable": "Noor is unavailable just now. Try again in a moment.",
  "noor.error.flagged": "Let me try that again. Could you rephrase your question?",
  "noor.report.title": "Report response",
  "noor.report.subtitle": "What's wrong with this response?",
  "noor.report.inaccurate": "Inaccurate Arabic",
  "noor.report.off_topic": "Off-topic",
  "noor.report.inappropriate": "Inappropriate tone",
  "noor.report.other": "Other",
  "noor.report.submit": "Submit"
}
```

### 12.8 You tab (Y1–Y6)

```json
{
  "you.tab_label": "You",
  "you.tab_label_ar": "أَنْت",

  "you.member_since": "Member since {date}",
  "you.stat_xp": "XP",
  "you.stat_streak": "Streak",
  "you.stat_lessons": "Lessons",
  "you.stat_chapters": "Chapters",

  "you.speaking_section": "Speaking",
  "you.speaking_phrases": "phrases you can say",
  "you.speaking_lessons": "speaking lessons completed",

  "you.vocab_section": "Vocabulary",
  "you.vocab_words": "words learned",
  "you.vocab_today": "{count} reviewed today",

  "you.tadabbur_section": "Tadabbur",
  "you.tadabbur_current_focus": "Currently exploring: {surah}",
  "you.tadabbur_surahs_understood": "{count} Surahs understood",

  "you.learning_time_section": "Learning time",
  "you.learning_time_total": "{time} total",
  "you.learning_time_week": "{time} this week",

  "you.milestones_section": "Milestones",
  "you.milestones_see_all": "See all →",

  "you.share_card_cta": "Share my progress",
  "you.sign_out": "Sign out",

  "you.edit_profile.heading": "Edit profile",
  "you.edit_profile.change_photo": "Change photo",
  "you.edit_profile.name_label": "Name",
  "you.edit_profile.email_label": "Email",
  "you.edit_profile.language_label": "Native language",
  "you.edit_profile.save_cta": "Save",

  "you.milestones_all.heading": "Milestones",
  "you.milestones_all.not_yet_earned": "Not yet earned",
  "you.milestones_all.earned_on": "Earned {date}"
}
```

### 12.9 Settings (Y3)

```json
{
  "settings.heading": "Settings",

  "settings.notifications_section": "Notifications",
  "settings.notif_reminder_time": "Reminder time",
  "settings.notif_streak_risk": "Streak at risk reminder",
  "settings.notif_new_content": "New content notifications",
  "settings.notif_milestone": "Milestone notifications",
  "settings.notif_word_of_day": "Word of the Day",

  "settings.audio_section": "Audio",
  "settings.audio_on": "Audio on/off",
  "settings.audio_autoplay": "Auto-play on lesson cards",
  "settings.audio_sfx": "Sound effects",

  "settings.speaking_section": "Speaking",
  "settings.mic_status": "Microphone",
  "settings.mic_open_settings": "Open System Settings →",
  "settings.mic_status_granted": "Granted",
  "settings.mic_status_denied": "Denied",
  "settings.mic_status_not_asked": "Not yet asked",

  "settings.display_section": "Display",
  "settings.daily_goal": "Daily goal",
  "settings.app_language": "App language",
  "settings.haptics": "Haptics",
  "settings.dark_mode_coming": "Dark mode coming, in shaa Allah.",

  "settings.account_section": "Account",
  "settings.account_change_email": "Change email",
  "settings.account_change_password": "Change password",
  "settings.account_manage_subscription": "Manage subscription",
  "settings.account_delete": "Delete account",

  "settings.support_section": "Support",
  "settings.support_help": "Help / FAQ",
  "settings.support_contact": "Contact us",
  "settings.support_feedback": "Send feedback",

  "settings.legal_section": "Legal",
  "settings.legal_privacy": "Privacy Policy",
  "settings.legal_terms": "Terms of Service",
  "settings.legal_acknowledgments": "Open source acknowledgments",

  "settings.about_section": "About",
  "settings.about_version": "App version {version}",
  "settings.about_build": "Build {build}",
  "settings.about_made_with": "Made with love in Pakistan"
}
```

### 12.10 Subscription / Paywall (Y4)

```json
{
  "paywall.heading": "Continue your journey.",
  "paywall.subtitle": "{name}, you've taken the first steps. Now let's go further.",

  "paywall.annual_label": "$10 / year",
  "paywall.annual_badge": "Save 17% — most popular",
  "paywall.monthly_label": "$1 / month",

  "paywall.features.title": "What's included",
  "paywall.features.chapters": "All 72 chapters and lessons",
  "paywall.features.noor": "Ustaad Noor — your AI tutor",
  "paywall.features.tadabbur": "Tadabbur — understand the Quran word by word",
  "paywall.features.streak": "Streak protection + freezes",
  "paywall.features.audio": "Audio for every word and ayah",
  "paywall.features.speaking": "Speaking practice — SHADOW_REPEAT and spoken phrases",
  "paywall.features.updates": "All future content and updates",

  "paywall.cta": "Start subscription →",
  "paywall.cancel_note": "Cancel anytime in your device settings.",
  "paywall.restore_link": "Restore purchases",
  "paywall.vocab_free_note": "Vocabulary Bank remains free, whether you subscribe or not.",

  "paywall.terms": "Subscription auto-renews unless canceled at least 24 hours before the end of the current period. Payment will be charged to your {store} account. Manage or cancel in Settings.\n\nSee our [Terms](#terms) and [Privacy Policy](#privacy).",

  "paywall.trial_banner.day_1_4": "Your free trial · 7 days · Subscribe →",
  "paywall.trial_banner.day_5": "Your trial ends in 2 days. Continue learning?",
  "paywall.trial_banner.day_6": "Your trial ends tomorrow.",
  "paywall.trial_banner.day_7": "Your trial ends today. Don't lose your streak.",
  "paywall.post_trial_banner": "Your trial has ended. Continue your journey from $1/month — [See plans →]",

  "paywall.chapter1_complete.title": "You've finished Chapter 1.",
  "paywall.chapter1_complete.body": "Mashallah, {name}. Foundation built.\n\nYour trial ends {when}. To keep going through Chapter 2 and beyond, choose a plan.",
  "paywall.chapter1_complete.cta": "See plans →",
  "paywall.chapter1_complete.later": "Maybe later",

  "paywall.welcome_after_subscribe": "Welcome to Warsh.",
  "paywall.restore.success": "Subscription restored. Welcome back.",
  "paywall.restore.no_subscription": "No active subscription found.",

  "paywall.cancel.title": "Cancel your subscription?",
  "paywall.cancel.body": "You'll keep access until {date}. After that, lessons and Noor will lock until you subscribe again. Vocabulary Bank stays free always.",
  "paywall.cancel.confirm": "Cancel anyway",
  "paywall.cancel.keep": "Keep subscription"
}
```

### 12.11 Lesson player (P1–P6, SP, R, VP)

```json
{
  "lesson.loading": "Preparing your lesson…",
  "lesson.hook.tap_continue": "Tap to continue",

  "lesson.discover.progress": "{current} of {total}",
  "lesson.discover.tap_reveal": "Tap to reveal meaning",
  "lesson.discover.continue": "Continue →",

  "lesson.practice.progress": "Exercise {current} of {total}",
  "lesson.practice.check": "Check",
  "lesson.practice.submit": "Submit",
  "lesson.practice.correct": "Yes",
  "lesson.practice.wrong": "Not quite. Let's look at this again.",
  "lesson.practice.got_it": "Got it →",
  "lesson.practice.next": "Next →",

  "lesson.reveal.heading": "Now you can see it",
  "lesson.reveal.ar_heading": "الآن یمکنک رؤیتها",
  "lesson.reveal.continue": "Continue →",

  "lesson.close.heading": "Barak Allahu feek.",
  "lesson.close.body": "You completed today's lesson.",
  "lesson.close.xp_earned": "+{xp} XP",
  "lesson.close.continue": "Continue →",

  "lesson.exit.title": "Pause this lesson?",
  "lesson.exit.body": "Your progress in this lesson will not be saved. You'll need to start it again.",
  "lesson.exit.continue": "Continue lesson",
  "lesson.exit.exit": "Exit anyway",

  "lesson.chapter_complete.heading": "Chapter complete",
  "lesson.chapter_complete.subtitle": "اکمل الفصل",
  "lesson.chapter_complete.continue": "Continue →",

  "lesson.spoken.context.cta": "Begin →",
  "lesson.spoken.phrase.listen": "Listen first",
  "lesson.spoken.phrase.listen_again": "Listen again",
  "lesson.spoken.phrase.now_you": "Now you try",
  "lesson.spoken.phrase.speak": "Speak",
  "lesson.spoken.phrase.recording": "Recording…",
  "lesson.spoken.phrase.stop_recording": "Stop recording",
  "lesson.spoken.phrase.original": "Original",
  "lesson.spoken.phrase.you": "You",
  "lesson.spoken.phrase.compare": "Compare",
  "lesson.spoken.phrase.record_again": "Record again",
  "lesson.spoken.phrase.well_spoken": "Well spoken",
  "lesson.spoken.phrase.keep_going": "Keep going",
  "lesson.spoken.phrase.done": "Done",
  "lesson.spoken.phrase.recognition_prompt": "What does this mean?",
  "lesson.spoken.phrase.count": "{current} of 10 phrases learned",
  "lesson.spoken.dialogue.play_full": "Play full dialogue",
  "lesson.spoken.close.body": "You can now say {count} new phrases. Speak them when you can, in shaa Allah.",
  "lesson.spoken.mic_denied_note": "You can record yourself once you enable microphone access.",
  "lesson.spoken.skipped_note": "Skipped — microphone access needed for speaking practice",

  "lesson.review.recall.heading": "Let's review what you've learned",
  "lesson.review.recall.subtitle": "From the last few chapters.",
  "lesson.review.recall.ready": "Ready?",
  "lesson.review.recall.cta": "Begin review →",
  "lesson.review.surprise.intro": "A few challenge questions. Take your time.",
  "lesson.review.close.body": "You've solidified what you've learned. Onward, in shaa Allah.",

  "lesson.verb_pattern.heading": "Verb pattern",
  "lesson.verb_pattern.tap_to_hear": "Tap any row to hear it"
}
```

### 12.12 Modals (M1–M8)

```json
{
  "modal.milestone.share_cta": "Share this moment",
  "modal.milestone.continue": "Continue",

  "modal.permission_notif.title": "Get gentle reminders",
  "modal.permission_notif.body": "Daily reminders help you keep your streak going. You can turn these off anytime.",
  "modal.permission_notif.cta": "Allow notifications",
  "modal.permission_notif.skip": "Maybe later",

  "modal.permission_mic.title": "Speaking practice",
  "modal.permission_mic.body": "To record yourself saying this phrase, Warsh needs access to your microphone.\n\nYour recording stays on this device. We don't upload, store, or analyze it.",
  "modal.permission_mic.cta": "Enable microphone",
  "modal.permission_mic.skip": "Skip this exercise",
  "modal.permission_mic.denied_again": "Microphone is currently disabled in your settings.",
  "modal.permission_mic.open_settings": "Open Settings",

  "modal.streak_risk.title": "Your streak is at risk",
  "modal.streak_risk.body": "Complete one lesson before midnight to keep it going.",
  "modal.streak_risk.cta": "Begin a lesson",
  "modal.streak_risk.later": "Later",

  "modal.streak_lost.title": "Your streak ended",
  "modal.streak_lost.body": "{days} days — that's a real journey.\nEven the great scholars had days of rest.\nBegin again today, in shaa Allah.",
  "modal.streak_lost.cta": "Begin a lesson →",
  "modal.streak_lost.later": "Later",

  "modal.streak_freeze_used.title": "Your streak freeze was used.",
  "modal.streak_freeze_used.body": "Yesterday is forgiven. Continue today, in shaa Allah.",
  "modal.streak_freeze_used.continue": "Continue →",

  "modal.daily_goal.message": "Today's goal complete. Barak Allahu feek.",

  "modal.surah_understood.body": "You now understand this Surah, alhamdulillah.\nCarry it with you in your salah.",
  "modal.surah_understood.share": "Share this moment",
  "modal.surah_understood.continue": "Continue →",
  "modal.surah_understood.next_focus_toast": "Your next focus: {surah}",

  "modal.error_generic.title": "Something didn't load.",
  "modal.error_generic.body": "Try again?",
  "modal.error_generic.retry": "Retry",
  "modal.error_generic.cancel": "Cancel",

  "modal.offline.body": "Offline — your progress is being saved"
}
```

### 12.13 Notifications

```json
{
  "notif.daily_reminder.title": "Time for today's lesson, {name}.",
  "notif.daily_reminder.body": "Even 5 minutes brings you closer.",

  "notif.streak_risk.title": "Your streak of {days} days is at risk.",
  "notif.streak_risk.body": "One lesson keeps it going. In shaa Allah.",

  "notif.new_content.title": "✨ New chapter available.",
  "notif.new_content.body": "{chapter_title} — begin when you're ready.",

  "notif.milestone.title": "🏆 Milestone unlocked: {milestone_name}.",
  "notif.milestone.body": "Tap to celebrate.",

  "notif.word_of_day.title": "🌅 Today's Word: {word_arabic}",
  "notif.word_of_day.body": "{word_meaning_hint}"
}
```

### 12.14 Empty states

```json
{
  "empty.daily_goal": "Begin your first lesson today, in shaa Allah.",
  "empty.tadabbur": "Complete lessons to begin understanding the Quran, word by word.",
  "empty.streak": "Begin your first day. Every great journey starts with one step.",
  "empty.my_words": "Words you learn will gather here. Like seeds, planted.",
  "empty.srs_review": "Nothing to review today. Come back tomorrow, in shaa Allah.",
  "empty.search": "No words match. Try a different spelling.",
  "empty.milestones": "Your first milestone awaits. Begin a lesson to start."
}
```

### 12.15 Sharing

```json
{
  "share.word.suggestion": "Today's Arabic word: {word}. Beautiful, isn't it? Learning with Warsh.",
  "share.surah.suggestion": "I now understand Surah {surah}, alhamdulillah. Warsh app.",
  "share.stats.suggestion": "My Warsh journey: {words} words, {streak} day streak, {surahs} Surahs understood.",
  "share.milestone.suggestion": "Just unlocked: {milestone}. Learning Arabic of the Quran with Warsh.",
  "share.image.cta": "Share",
  "share.image.save": "Save image",
  "share.image.cancel": "Cancel"
}
```

---

## Part 13 — Tone Audit Checklist

When writing or reviewing any UI copy, check it against this:

- [ ] Could a respected scholar say this without embarrassment?
- [ ] Does it use Noor's voice, not a generic app voice?
- [ ] Does it avoid exclamation points (except for genuine celebration)?
- [ ] Does it avoid effusive praise ("AMAZING!", "WOW!")?
- [ ] Are Islamic phrases in Arabic script (بَارَكَ اللَّهُ فِيكَ, not "Baraka Allahu feek")?
- [ ] Is it brief — 1–2 sentences for most strings?
- [ ] Does it avoid emojis (except gentle ones in specific notification contexts)?
- [ ] Does it treat the user with respect, never condescension?
- [ ] Does it avoid manipulative urgency or shame?
- [ ] If error-related, does it explain without blaming?
- [ ] Does it use "in shaa Allah" naturally for future-tense expressions, not as decoration?

If any answer is "no," the copy needs revision.

---

## Part 14 — Localization Workflow

### 14.1 The translation flow

1. **English copy is locked here** (in this file's Part 12)
2. Strings are exported to `en.json` (the source of truth)
3. Native Urdu translator reviews `en.json` and produces `ur.json`
4. Translator notes:
   - Islamic phrases stay in Arabic (don't translate)
   - Names stay in their original script (Noor stays "Noor", not "Light")
   - Tone matches the Warmth Principle in Urdu's cultural context
   - Urdu uses formal you (آپ) throughout (not informal تو)
5. Both files ship with the app

### 14.2 Loading translations

- App reads user's selected language preference
- Loads matching JSON file at app start
- All strings rendered through a translation key lookup function
- If a key is missing in the user's language, fallback to English
- Bug log: missing translations alerted to development team

### 14.3 Translator credentials

The Urdu translator should be:
- Native Urdu speaker (Pakistani preferred)
- Familiar with Islamic phrasing and tone
- Familiar with mobile UI conventions

Suggested rates: $200–500 for full translation of ~2,000 strings.

### 14.4 Translation review

After Urdu translation is delivered:
- Build a debug version of the app with Urdu UI
- A second native speaker (different from translator) reviews each screen in context
- Specific checks: tone, accuracy, fitness for the UI context (some translations look right standalone but wrong in UI)
- Translator revises based on review feedback

---

## Part 15 — Brand Mark and Logo

### 15.1 The Warsh logo

The logo is the lockup `Warsh · وَرْش` — both scripts together.

- **Latin "Warsh":** Lora Bold, Ink color
- **Separator "·":** Slightly smaller, Sage color
- **Arabic "وَرْش":** Scheherazade New Bold, Gold color, with full harakat
- **Alignment:** Baseline-aligned, with the Arabic slightly larger to balance visual weight

Variants:
- **Primary:** Both scripts (default)
- **Arabic only:** `وَرْش` (for spaces where Latin is redundant, e.g., loading screen)
- **Mark only:** A stylized seal incorporating the شـ letter as the focal point (for app icon, favicons)

### 15.2 App icon

The app icon is the mark-only variant in a parchment-Gold gradient circle:
- Background: Parchment with subtle motif
- Centered: stylized شـ (the most recognizable letter in وَرْش) in Gold
- Border: 1pt Ink at very subtle thickness
- Required formats: iOS (1024×1024), Android (512×512), with all standard sizes derived

### 15.3 Splash screen image

The splash screen displays:
- Centered: full Warsh lockup (Latin + Arabic)
- Background: Parchment with the subtle Warsh seal motif
- A barely-perceptible fade-in animation per File 11 Section 8.3

### 15.4 Marketing and app store assets

For App Store / Play Store:
- Use the primary Warsh lockup in all marketing
- Background should match the brand (parchment-toned, not generic white or black)
- Screenshots include the lockup as a watermark in subtle places (per File 10 Section 11.2)

---

## Part 16 — Component Examples (Pseudo-code)

### 16.1 Primary Button (React Native)

```tsx
<PrimaryButton onPress={handlePress}>
  <ButtonText>Begin →</ButtonText>
</PrimaryButton>

// Styles:
// backgroundColor: '#071B44' (--navy)
// borderWidth: 2, borderColor: '#C49B4D' (--gold)
// color: '#D4B06A' (--gold-soft)
// height: 56
// borderRadius: 12
// paddingHorizontal: 16
// fontFamily: 'Lora-SemiBold'
// fontSize: 16
```

### 16.2 Discover Card (React Native)

```tsx
<DiscoverCard>
  <CardImage source={{ uri: word.imageUrl }} />
  <ArabicDisplay>{word.arabic}</ArabicDisplay>
  <AudioPlayButton audioUrl={word.audioUrl} />
  <Transliteration>{word.transliteration}</Transliteration>
  <Translation>{word.translation}</Translation>
</DiscoverCard>

// Styles:
// backgroundColor: '#F4EBD0' (--parchment)
// borderRadius: 16
// padding: 24
// alignItems: 'center'
// shadowOffset: { width: 0, height: 2 }
// shadowOpacity: 0.04
// shadowRadius: 8
```

### 16.3 Lesson Progress Dots

```tsx
<ProgressDots
  current={2}  // 0-indexed: hook=0, discover=1, practice=2, reveal=3, close=4
  total={5}
/>

// Each dot: 8x8 circle
// Current: Gold
// Completed: Sage
// Upcoming: Cream
// Gap between dots: 12pt
```

---

## Part 17 — Test Plan

- [ ] Every color token used has the correct hex value
- [ ] All fonts (Lora, Scheherazade New) load correctly on iOS and Android
- [ ] Type scale renders consistently across screen sizes (small phone, tablet)
- [ ] Buttons meet 44pt minimum touch target
- [ ] Cards have correct padding and spacing
- [ ] Tabs render with correct icons and colors (active = Gold, inactive = Sage)
- [ ] Modals slide up correctly (300ms ease-out)
- [ ] All Discover cards render the same dimensions across devices
- [ ] Animations respect reduced motion accessibility setting
- [ ] Sound effects play at correct volume
- [ ] Haptics fire correctly on iOS, are disabled on Android by default
- [ ] RTL Arabic text renders correctly (right-to-left within elements)
- [ ] Urdu UI mode loads `ur.json` and all strings translate
- [ ] Missing translation keys fall back to English without crashing
- [ ] Empty states render with their illustrations and copy
- [ ] Streak heatmap colors graduate from Sage to Gold correctly
- [ ] Tadabbur word transition (Sage → Gold) animates smoothly
- [ ] Lesson exit confirmation modal renders correctly
- [ ] Milestone celebration (M1) has correct backdrop opacity and modal layout
- [ ] Splash screen shows for max 2 seconds, dismisses immediately when ready
- [ ] All 16 vocabulary topic illustrations load and display correctly
- [ ] All 50+ milestone badges render correctly

---

## Part 18 — Changelog

**2026-05-19 — v1.0**
- Complete design system locked
- 5-token color palette finalized with extended derivatives
- Typography system locked (Lora + Scheherazade New, full type scale)
- 8-point spacing grid established
- Component library specified with all major UI patterns
- Iconography (Lucide React Native + custom illustrations) locked
- Illustration style guide and AI generation prompt finalized
- Animation timings and easings specified
- Sound and haptic inventories complete
- Complete English UI copy library drafted (~600 strings)
- Urdu translation workflow defined
- Brand mark and logo specifications locked
- 23-item test plan

---

*End of File 11.*
*Next: File 12 — Data Model & API.*
