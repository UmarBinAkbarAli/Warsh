# Warsh · وَرْش — UI/UX & Animation Source of Truth

**Version:** 1.0  
**Created:** 2026-05-08  
**Purpose:** Single source of truth for every screen, UI component, animation, and UX improvement needed to bring Warsh to a complete, polished user experience before content expansion.

---

## 1. Brand Tokens (Reference)

These are locked. All screen designs must use these values only.

| Token | Value | Usage |
|---|---|---|
| Ink | `#1A1A2E` | Primary dark background, headers |
| Gold | `#D4AF37` | Accents, highlights, correct state, CTA |
| Parchment | `#F5F0E8` | Card backgrounds, light surfaces |
| Sage | `#7A9E7E` | Correct feedback, progress indicators |
| Cream | `#FFF8F0` | Screen backgrounds |
| Muted Red | `#C0392B` | Wrong feedback |
| Arabic Font | Scheherazade New | All Arabic text |
| English Font | Lora | UI labels, body text |

---

## 2. Full Screen Inventory

Total screens to design: **21 screens / 28 states**

Grouped by user journey:

---

### GROUP A — Auth & Onboarding (9 screens)

These are the first impression. Must feel premium and intentional.

---

#### A1 — Splash Screen
**What it is:** The very first frame on app open, ~2 seconds.  
**Current state:** Basic / not designed.  
**Elements needed:**
- Warsh wordmark in Arabic + English centered on Ink background
- Gold crescent or geometric motif (subtle, not kitschy)
- Fade-in animation then transition to landing

**Animation:**
- Wordmark fades in from 0 opacity over 600ms
- After 1.5s, screen fades out to Landing

---

#### A2 — Landing Screen
**What it is:** First interactive screen. New user entry point.  
**Current state:** Basic scaffolding.  
**Elements needed:**
- Hero illustration area (Arabic calligraphy motif or geometric pattern on Ink)
- Tagline: "Learn the language of the Quran"
- Arabic subtitle: تَعَلَّمْ لُغَةَ الْقُرْآنِ
- Primary CTA: "Begin your journey" (Gold button)
- Secondary link: "I already have an account" (text link)

**Animation:**
- Tagline slides up from below on load
- CTA button pulses softly (scale 1.0 → 1.02 → 1.0, 2s loop) to draw attention

---

#### A3 — Onboarding: Goal Screen
**What it is:** Why are you learning Arabic?  
**Current state:** Basic selection UI.  
**Elements needed:**
- Step indicator (dot row, 6 steps, current = Gold)
- Heading: "What is your goal?"
- 4 selectable cards with icon + label:
  - 📖 Understand the Quran
  - 🕌 Improve Salah
  - 📚 Study Islamic texts
  - 🌍 Speak Arabic
- Selected card: Gold border + Ink background
- Unselected card: Parchment background, subtle border

**Animation:**
- Cards stagger-animate in (each 80ms delay from previous)
- Selected card: quick scale pop (0.97 → 1.03 → 1.0, 150ms)

---

#### A4 — Onboarding: Level Screen
**What it is:** Current Arabic level self-assessment.  
**Current state:** Basic selection UI.  
**Elements needed:**
- Same step indicator
- 4 level cards with short descriptor text beneath label
- Visual: small Arabic sample text that gets more complex per level

**Animation:** Same stagger as Goal screen.

---

#### A5 — Onboarding: Name Screen
**What it is:** Personal name entry.  
**Current state:** Basic text input.  
**Elements needed:**
- Warm copy: "What should Ustaad Noor call you?"
- Single large text input, Lora font
- Soft input focus glow (Gold border on focus)
- Continue button activates only when name is non-empty

---

#### A6 — Onboarding: Language Screen
**What it is:** Native language selection.  
**Current state:** Basic.  
**Elements needed:**
- Language list with flag icons
- Search input at top to filter
- Selected language: Gold checkmark

---

#### A7 — Onboarding: Placement Screen
**What it is:** Smart skip placement quiz.  
**Current state:** Implemented but visually basic.  
**Elements needed:**
- Brief explanation: "We'll find the right starting point for you"
- 4 placement option cards (same card style as Goal screen)
- Each card describes what the user can currently do

---

#### A8 — Onboarding: Ready Screen
**What it is:** Summary / hype screen before account creation.  
**Current state:** Basic.  
**Elements needed:**
- Personalised message using name: "أَهْلاً، [Name]"
- Summary of goal + level selected
- Ustaad Noor avatar introduction (small illustrated avatar)
- "Let's begin" Gold CTA

**Animation:**
- Arabic greeting fades in first
- Summary details appear below with 200ms delay
- Noor avatar slides in from right

---

#### A9 — Login Screen
**What it is:** Returning user login.  
**Current state:** Basic form.  
**Elements needed:**
- Warsh wordmark at top
- Email + password inputs (Ink themed)
- Gold "Sign in" button
- "Forgot password" text link
- Link back to onboarding for new users

---

### GROUP B — Core App Tabs (3 screens + states)

---

#### B1 — Learn Tab (Chapter List)
**What it is:** The home screen of the app. Shows all chapters.  
**Current state:** Functional but visually weak.  
**Elements needed:**
- Al-Fatiha meter at top (collapsible, already implemented — needs visual polish)
- Each chapter as a large card with:
  - Arabic chapter title (Scheherazade, large)
  - English subtitle
  - Progress bar (lessons completed / total)
  - Locked state: blurred/dimmed with lock icon
  - Completed state: Gold checkmark
- Streak reminder banner (if streak is at risk today) — subtle, dismissable

**States to design:**
- Default (some chapters locked, some in progress)
- All chapters completed (celebratory state)
- First visit (no progress — intro state)

**Animation:**
- Chapter cards stagger in on screen load (60ms delay each)
- Progress bar fills with a smooth 400ms ease on mount
- Locked chapter: subtle pulse on lock icon to hint it can unlock

---

#### B2 — Ustaad Noor Chat Tab
**What it is:** AI tutor chat interface.  
**Current state:** Connected to GPT-4o-mini, basic chat UI.  
**Elements needed:**
- Noor avatar at top (illustrated, warm South Asian scholarly look)
- Chat bubbles:
  - Noor: Parchment bubble, left-aligned, Lora font
  - User: Ink bubble, right-aligned, Cream text
- Arabic text in Noor responses: Scheherazade, larger size, RTL
- Input bar: rounded, Gold send button
- Typing indicator: three animated dots in Noor's bubble style
- Suggested prompt chips when chat is empty (e.g. "Explain مُبتدا", "Quiz me on Chapter 1")

**Animation:**
- New message slides up from bottom with fade-in
- Typing indicator dots animate sequentially (bounce, 400ms loop)
- Suggested chips fade in when chat is empty

---

#### B3 — You / Profile Tab
**What it is:** User stats, streak, level, XP.  
**Current state:** Already rebuilt with Warsh brand — needs animation layer.  
**Elements needed:** (structure exists, polish needed)
- Streak number: animated count-up on mount
- XP bar: animates fill on mount
- Level badge: subtle glow pulse

**Animation:**
- XP bar fills with spring animation on tab focus
- Streak number counts up from 0 to current value (300ms)
- Stats cards fade in with 80ms stagger

---

### GROUP C — Lesson Flow (7 screens / states)

This is the core product. Highest priority for polish.

---

#### C1 — Chapter Detail / Lesson List
**What it is:** Tapping a chapter shows its lessons.  
**Current state:** Basic list.  
**Elements needed:**
- Chapter title header (large Arabic, Ink background)
- Chapter grammar concept subtitle
- Lesson rows with:
  - Lesson number + Arabic title
  - Completed: Gold checkmark + "Completed" label
  - Current: Gold highlighted row, subtle glow
  - Locked: dimmed, lock icon
- "Start Chapter" / "Continue" Gold CTA button at bottom

**Animation:**
- Header slides down from top on enter
- Lesson rows stagger in (50ms delay each)

---

#### C2 — Lesson Beat 1: Hook
**What it is:** Opening Quranic ayah. Creates curiosity gap.  
**Current state:** Implemented, needs visual treatment.  
**Elements needed:**
- Full screen, Ink background
- Ayah in large Scheherazade Arabic, centered, Gold color
- Subtle ayah number badge
- English translation below in Lora, Cream, smaller
- No explanation — just the ayah displayed beautifully
- "Tap to begin" prompt at bottom (pulsing softly)
- Progress bar at top (Beat 1 of 5)

**Animation:**
- Ayah text fades in letter by letter (RTL, 800ms total)
- Translation fades in after ayah completes (300ms delay)
- Subtle shimmer pass over the Gold ayah text (once, on load)

---

#### C3 — Lesson Beat 2: Discover (Flashcard)
**What it is:** 10–12 vocabulary/concept cards, swipe through.  
**Current state:** Functional but emojis feel cheap.  
**Elements needed:**
- Card takes up 70% of screen height
- Top section: illustration (future: custom image; current: large emoji at 80px)
- Arabic word: Scheherazade, large, centered
- Transliteration: Lora italic, Sage color, smaller
- English translation: Lora, Cream, below
- Card counter: "3 / 10" at top right
- Left/right swipe OR arrow buttons at bottom
- Progress bar advances per card

**States:**
- Card front (default)
- Card back / detail (tap to flip — optional enhancement)

**Animation:**
- Card slides in from right on advance (200ms ease-out)
- Card slides out to left on advance
- Swipe gesture: card follows finger, snaps back if not committed
- On first card: card drops in from above (entrance animation)

---

#### C4 — Lesson Beat 3: Practice (Exercises)
**What it is:** 10 exercises across 6 types. The core learning mechanic.  
**Current state:** Working, needs strong visual feedback layer.

**Exercise types to design individually:**

**TRUE_FALSE**
- Statement displayed in large text
- Two large buttons: ✓ صَح (Sage) and ✗ خَطَأ (muted red)
- Full-width, easy tap targets

**TAP_TRANSLATION**
- Arabic word / phrase shown large
- 4 translation option buttons in a 2×2 grid
- Buttons: Parchment background, Ink text

**FILL_BLANK**
- Sentence with blank shown
- Text input field OR word bank chips to tap in

**BUILD_SENTENCE**
- Shuffled word tiles in a bank at bottom
- Answer area at top (drop zone)
- Tiles drag from bank to answer area

**TRANSLATE**
- Prompt sentence shown
- Free text input
- Loose matching (diacritics-stripped comparison)

**SPOT_MISTAKE**
- Sentence shown with one mistake
- User taps the incorrect word (word-level tap targets)

**Shared exercise UI elements:**
- Exercise type label at top (subtle, small)
- Progress indicator: dots row (10 dots, filled as exercises complete)
- Answer submitted state: highlight correct answer
- Continue button appears after answer locked in

**Animation (all exercise types):**
- Correct answer: button flashes Sage → holds for 800ms → next exercise slides in
- Wrong answer: button flashes muted red → shake animation (3 × 4px horizontal, 300ms) → correct answer revealed
- Exercise transition: current exercise slides left, next slides in from right (250ms)
- Progress dot fills with a pop (scale 0 → 1.2 → 1.0, 200ms)

---

#### C5 — Exercise Feedback Overlay
**What it is:** The moment after answering — correct or wrong.  
**Current state:** Basic color change only.  
**Elements needed:**
- Bottom sheet that slides up:
  - Correct: Sage background, large ✓, "صَحِيح — Well done!", XP chip "+5 XP"
  - Wrong: Muted red background, correct answer displayed, brief explanation
- "Continue" button inside the sheet

**Animation:**
- Sheet slides up from bottom (spring, 300ms)
- Correct: confetti burst (small, subtle — 8–10 particles, Gold + Sage)
- Wrong: soft shake on the wrong answer before sheet appears

---

#### C6 — Lesson Beat 4: Reveal
**What it is:** Grammar concept named after it was already felt.  
**Current state:** Implemented, needs visual richness.  
**Elements needed:**
- "You already know this" framing copy
- Grammar term in Arabic (large, Gold)
- Grammar term in English (Lora, Cream)
- Original hook ayah repeated with the target word highlighted in Gold
- Brief 2–3 line explanation

**Animation:**
- Grammar term fades in with a Gold glow pulse (once)
- Highlighted word in ayah: Gold underline draws in left-to-right (500ms)

---

#### C7 — Lesson Beat 5: Close / Completion
**What it is:** Lesson end. XP earned, celebration, Noor tip.  
**Current state:** Basic API call + simple screen.  
**Elements needed:**
- Full screen celebration moment:
  - "بارَكَ اللهُ فِيكَ" large, Gold, centered
  - "Lesson complete" below in Lora
- Stats row: XP earned | Streak | Accuracy %
- Ustaad Noor tip bubble (dark card, Noor avatar, tip text)
- Two CTAs: "Next Lesson" (Gold) and "Back to Chapter" (ghost button)

**Animation:**
- بارَكَ اللهُ فِيكَ animates in with scale (0.8 → 1.0, spring, 400ms)
- Confetti burst on enter (Gold + Sage, medium density, 2 seconds)
- XP number counts up from 0 to earned amount (500ms)
- Stats row items stagger in (100ms each)
- Noor tip card slides up from bottom (400ms delay after stats)

---

### GROUP D — Supporting Screens (3 screens)

---

#### D1 — Al-Fatiha Meter (Expanded State)
**What it is:** Full Bismillah + Fatiha with Gold-highlighted unlocked words.  
**Current state:** Implemented, needs polish.  
**Elements needed:**
- Smooth expand/collapse animation (height animates, not jump)
- Each unlocked word glows Gold on first unlock (one-time animation stored in local state)
- Progress bar fill animates on data refresh

**Animation:**
- Expand: height spring-animates open (350ms)
- Newly unlocked word: Gold glow pulse (once, on first appearance)

---

#### D2 — Streak Lost Screen
**What it is:** Screen shown when streak is broken.  
**Current state:** Not designed.  
**Elements needed:**
- Empathetic, not shaming tone (Noor's voice)
- Copy: "Even the great scholars had days of rest." + Arabic quote
- Streak reset to 0 displayed
- "Begin again" CTA (Gold)
- Option to restore streak with Gems (future feature — placeholder only)

---

#### D3 — Empty / First Visit States
**What it is:** Screens when user has no data yet.  
**Current state:** Not specifically designed.  
**Screens needing empty states:**
- Learn tab (no progress yet): show Chapter 1 highlighted with "Start here" prompt
- Noor chat (no messages): show welcome message from Noor automatically
- Profile (day 1): show "Your journey begins today" with Day 1 streak

---

## 3. Animation System

A consistent motion language across the whole app.

### Timing Scale

| Name | Duration | Usage |
|---|---|---|
| Instant | 100ms | Button press feedback |
| Fast | 200ms | Card transitions, button states |
| Normal | 300ms | Sheet slide-ups, screen transitions |
| Slow | 500ms | Text reveals, count-ups |
| Ceremonial | 800ms+ | Lesson completion, ayah reveals |

### Easing Curves

| Name | Curve | Usage |
|---|---|---|
| Snap | ease-out | Cards sliding in, elements entering |
| Spring | spring(0.5, 0.8) | Celebrations, scale pops |
| Ease | ease-in-out | Progress bars, height animations |
| Linear | linear | Loops, rotating spinners |

### Core Animation Patterns

**Stagger entrance** — Used on any list of cards/items loading onto screen.  
Delay each item by 60–80ms. First item enters immediately.

**Scale pop** — Used for correct answer feedback, completion moments.  
Scale 0.95 → 1.05 → 1.0, spring, 200ms.

**Slide + fade** — Used for screen transitions and sheet slide-ups.  
Y offset +30px → 0, opacity 0 → 1, ease-out, 300ms.

**Shake** — Used for wrong answer feedback.  
X offset: 0 → -6 → +6 → -4 → +4 → 0, linear, 300ms.

**Count-up** — Used for XP, streak numbers on mount.  
Number animates from 0 to target value, ease-out, 500ms.

**Shimmer** — Used for loading states and Gold text highlights.  
White gradient sweeps across element, 1.5s, once.

**Confetti** — Used for lesson completion and correct streaks.  
8–15 particles, Gold + Sage colors, gravity fall, 2s duration.  
Keep subtle — not full-screen Duolingo-level. More restrained, scholarly tone.

---

## 4. Image Strategy

### Current State
204 discover cards using emoji. Emojis are functional but feel cheap on a premium app.

### Target State
Custom flat illustrations — consistent style, warm Islamic aesthetic, parchment/earth tones.

### Style Definition (for GPT Image / DALL-E prompt system)

**Locked style prompt to use for all image generation:**

> Flat illustration, minimal detail, warm earth tones (parchment, terracotta, sage green, gold), single object centered on transparent or off-white background, no text, no shadows, clean vector-like aesthetic, inspired by Islamic geometric sensibility, 512×512px

This prompt must be used unchanged for every card to ensure visual consistency across all 204 images.

### Image Inventory

| Chapter | Cards | Priority |
|---|---|---|
| Chapter 1 — هٰذَا وَذٰلِكَ | ~40 | ✅ Phase 1 (test) |
| Chapter 2 — اَلْمَعْرِفَةُ | ~40 | Phase 2 |
| Chapter 3 — اَلْجُمْلَةُ | ~40 | Phase 2 |
| Chapter 4 — أَيْنَ؟ | ~40 | Phase 2 |
| Chapter 5 — لِمَنْ | ~44 | Phase 2 |
| **Total** | **~204** | — |

### Recommended Workflow

1. Write a Node.js batch script that reads all discover card data from the database
2. For each card, calls DALL-E 3 or GPT Image API with the locked style prompt + object name
3. Saves images to `/public/images/cards/[lessonId]/[cardIndex].png`
4. Updates the database `discoverCards` field with the image URL
5. Run Chapter 1 only first — review quality before committing to all 204

### Storage
Use Supabase Storage or Cloudflare R2. Images served via CDN URL, not bundled in app.

### Cost Estimate (DALL-E 3)
~$0.04–0.08 per image × 204 = **~$8–16 total for all cards**

---

## 5. UX Improvements Recommended

These are improvements beyond visual polish — structural UX changes that will improve the learning loop.

### 5.1 Lesson Beat Pacing
**Problem:** All 10 exercise types back to back can feel like a grind.  
**Fix:** Break exercises into micro-sets of 3–4 with a brief "checkpoint" animation between sets (progress ring fills, small celebration). Feels like multiple small wins instead of one long slog.

### 5.2 Vocabulary Review Mode
**Problem:** No way to revisit words learned without replaying a lesson.  
**Fix:** Add a "Words I've learned" view accessible from profile tab. Shows all unlocked vocabulary as browsable flashcards. Low effort to build (all data already exists in the lesson schema).

### 5.3 Streak Freeze / Grace Period
**Problem:** Missing one day destroys streak. Harsh for intermittent learners.  
**Fix:** One-day grace period (streak shown as "at risk" in amber rather than immediately reset). Add optional streak freeze mechanic (earned through XP, one use). Common pattern in Duolingo and Kalam.

### 5.4 Daily Goal / Session Length
**Problem:** No concept of a "done for today" state.  
**Fix:** Let user set a daily goal (1 lesson / 2 lessons / 5 minutes). Learn tab shows today's goal progress. When complete: satisfying completion state appears at top of Learn tab.

### 5.5 Lesson Preview
**Problem:** User doesn't know what they're getting into before tapping a lesson.  
**Fix:** Tapping a lesson shows a small bottom sheet preview: lesson title, what they'll learn, XP available, estimated time. "Begin" button at bottom. Reduces friction and sets expectation.

### 5.6 Audio (Medium-term)
**Problem:** No audio for Arabic words. Critical for pronunciation learning.  
**Fix:** Add TTS audio using OpenAI TTS API or a pre-recorded audio library. Play button on each discover card and on exercise prompts. This is the single biggest gap vs Duolingo and Kalam. Budget: OpenAI TTS is ~$0.015 per 1K characters — extremely cheap to add.

### 5.7 Mistake Review
**Problem:** Wrong answers are forgotten after the lesson.  
**Fix:** After lesson completion, if accuracy < 80%, show a "Review your mistakes" option. Replays only the exercises that were answered wrong. 30 lines of backend logic, high learning value.

### 5.8 Haptic Feedback
**Problem:** Touch interactions feel flat on mobile.  
**Fix:** Add `expo-haptics` calls:
- Light impact on card swipe
- Medium impact on correct answer
- Error pattern on wrong answer
- Success notification on lesson complete

### 5.9 Progress Celebration Milestones
**Problem:** No acknowledgement of larger milestones (finish a chapter, 7-day streak, 100 XP).  
**Fix:** Add a milestone modal that fires when:
- A chapter is completed
- Streak reaches 3, 7, 30 days
- XP crosses 100, 500, 1000
Modal shows: achievement title, Arabic hadith or ayah relevant to learning, Gold badge animation.

### 5.10 Offline Support
**Problem:** Lesson content requires network. Dead on spotty connections.  
**Fix:** Cache lesson content in AsyncStorage after first load. Allow offline lesson play. Sync completion data when back online. Medium effort but significantly improves perceived quality on mobile.

---

## 6. Priority Order

For the test phase, work in this sequence:

**Phase 1 — High impact, test-ready (1–2 weeks)**
1. C2 Discover cards (image upgrade — Chapter 1 only)
2. C4 Practice exercises (feedback animations — shake, flash, confetti)
3. C7 Lesson completion screen (celebration moment)
4. B1 Learn tab (chapter cards, progress bars, stagger animation)
5. C2/C3 Lesson beat transitions (slide animations)

**Phase 2 — Polish before wider testing (2–3 weeks)**
6. A2 Landing + onboarding screens redesign
7. B2 Ustaad Noor chat polish
8. B3 Profile tab animations
9. All remaining images (Chapters 2–5)
10. UX improvement 5.1 (exercise micro-sets)
11. UX improvement 5.4 (daily goal)

**Phase 3 — Before production**
12. Audio (5.6) — this alone moves Warsh from good to great
13. Offline support (5.10)
14. Mistake review (5.7)
15. Streak freeze (5.3)
16. Milestone celebrations (5.9)

---

## 7. Screen Design Summary Table

| ID | Screen | Priority | Status | Effort |
|---|---|---|---|---|
| A1 | Splash | Medium | Not designed | 0.5 day |
| A2 | Landing | High | Basic | 1 day |
| A3 | Goal selection | Medium | Basic | 0.5 day |
| A4 | Level selection | Medium | Basic | 0.5 day |
| A5 | Name entry | Low | Basic | 0.25 day |
| A6 | Language selection | Low | Basic | 0.25 day |
| A7 | Placement | Medium | Basic | 0.5 day |
| A8 | Ready screen | High | Basic | 1 day |
| A9 | Login | Low | Basic | 0.5 day |
| B1 | Learn tab | **Critical** | Functional | 2 days |
| B2 | Noor chat | High | Functional | 1.5 days |
| B3 | Profile / You | Medium | Rebuilt | 1 day |
| C1 | Chapter detail | High | Basic | 1 day |
| C2 | Hook beat | High | Implemented | 1 day |
| C3 | Discover cards | **Critical** | Functional | 2 days |
| C4 | Practice exercises | **Critical** | Functional | 3 days |
| C5 | Exercise feedback | **Critical** | Basic | 1 day |
| C6 | Reveal beat | Medium | Implemented | 1 day |
| C7 | Completion screen | **Critical** | Basic | 1.5 days |
| D1 | Al-Fatiha meter | Medium | Implemented | 0.5 day |
| D2 | Streak lost | Low | Not designed | 0.5 day |
| D3 | Empty states (×3) | Medium | Not designed | 1 day |

**Total estimated effort: ~22–24 working days (one person, full days)**  
**Squeezed around other work: 5–6 weeks**

---

## 8. Component Library Needed

These reusable components should be built once and used everywhere:

| Component | Used In |
|---|---|
| `<WarshCard>` | Discover cards, chapter cards, onboarding option cards |
| `<GoldButton>` | All primary CTAs |
| `<GhostButton>` | Secondary actions |
| `<ProgressBar>` | Chapter progress, lesson progress, XP bar |
| `<ArabicText>` | Already exists — ensure consistent sizing scale |
| `<NoorBubble>` | Noor tip cards, chat messages |
| `<XPChip>` | XP earned display |
| `<StaggerList>` | Wrapper for any list that should stagger-animate in |
| `<BottomSheet>` | Exercise feedback, lesson preview, streak lost |
| `<ConfettiEmitter>` | Lesson completion, milestone celebrations |
| `<ShimmerLoader>` | Loading states for cards and screens |

---

*This document is the single source of truth for Warsh UI/UX.*  
*Update version number and Last Updated date when making significant changes.*  
*Cross-reference: `Docs/warsh-brand-ui-sot.md` for brand identity details.*
