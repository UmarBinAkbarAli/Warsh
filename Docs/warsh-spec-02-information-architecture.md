# Warsh · وَرْش — App Specification
## File 02: Information Architecture

**Status:** Locked
**Version:** 1.0
**Last updated:** 2026-05-19
**Depends on:** File 01 (Identity & Principles)

> This file defines every screen in the Warsh app, how screens are organized into tabs and flows, and how the user navigates between them. Every screen has a unique ID used throughout the specification.

---

## 1. Navigation philosophy

Warsh follows a **tabbed shell** pattern with **stack-based navigation** inside each tab. This is the standard iOS/Android pattern and matches user expectations from apps like Instagram, Duolingo, and Notion.

### Principles

- **No more than 4 bottom tabs.** Locked. More tabs dilute attention. Fewer feels incomplete.
- **The current tab is always visible.** A user never feels lost about where they are.
- **Lessons are full-screen modal experiences.** When a user enters a lesson, the tab bar disappears. The lesson is the world; everything else recedes.
- **Settings and account screens are stack pushes, not modals.** Modals are for short interactions (alerts, bottom sheets); settings is a real place the user goes.
- **Back navigation is always available** except when the user is in a critical state (mid-lesson, mid-onboarding, mid-payment). Critical states show a "Close" with confirmation, never a silent exit.
- **No deep nested navigation.** Maximum 3 levels deep from a tab root (Tab Root → Detail → Sub-detail). Going deeper means the IA is wrong.

---

## 2. The four tabs

The bottom tab bar has exactly four tabs, in this order from left to right (in LTR rendering):

```
┌────────────────────────────────────────────────────┐
│                                                    │
│                                                    │
│              [ Content Area ]                      │
│                                                    │
│                                                    │
├────────────────────────────────────────────────────┤
│   تَعَلَّم     مُفْرَدَات     نور     أنت              │
│   Learn    Vocabulary   Noor   You              │
└────────────────────────────────────────────────────┘
```

### Tab 1: Learn (تَعَلَّم)
**Default tab on app launch.** The primary learning surface — chapter list, current chapter focus, daily goal progress, Tadabbur card.

### Tab 2: Vocabulary (مُفْرَدَات)
The user's word bank. Words learned through lessons, browsable by topic, searchable. Free forever (does not lock behind paywall).

### Tab 3: Noor (نور)
Chat with Ustaad Noor. AI tutor available for Arabic learning questions. Daily message limits apply.

### Tab 4: You (أنت)
Profile, stats, settings, account management.

### Tab icons

Tab icons are custom-illustrated, parchment-toned, in line with the brand visual language. Each tab has two states: inactive (Sage color) and active (Gold color).

| Tab | Icon concept | Active state |
|---|---|---|
| Learn | Open book with subtle line decoration | Gold tint |
| Vocabulary | Stack of word cards / quill | Gold tint |
| Noor | A subtle illuminated lamp (the name *Noor* means light) | Gold tint |
| You | Simple person silhouette with classical contour | Gold tint |

Tab labels appear below icons in both UI language modes. Arabic labels (تَعَلَّم, etc.) appear in the Arabic font; English labels appear in Lora.

### Tab badge indicators

- **Learn:** Small Gold dot when a new chapter has been released
- **Vocabulary:** Small Gold dot when a new Word of the Day is available
- **Noor:** Small Gold dot when Noor has a proactive message (only happens if push notifications fire)
- **You:** Small Gold dot when a new milestone has been unlocked but not yet seen

Badges disappear when the user visits the tab.

---

## 3. Pre-app flows (before tabs are shown)

Some screens exist *before* the user reaches the tabbed shell. These are one-time or session-start flows.

### Flow A: First launch (preview experience)

User downloads and opens the app for the first time. They have never seen Warsh before. They get the preview experience before any signup.

**Screens:**
- `A0` — Splash screen (brand mark, brief animation)
- `A1` — Preview welcome ("Let me show you what Warsh is")
- `A2` — Preview Hook (ayah audio plays, user sees ayah)
- `A3` — Preview Discover (user taps to reveal meaning of a word)
- `A4` — Preview Grammar Reveal (a small "aha" moment)
- `A5` — Preview Noor intro (Noor says salaam)
- `A6` — Preview Tadabbur teaser ("This is where you're going")
- `A7` — Preview Close (CTA: Begin your journey)

After A7, user proceeds to onboarding (Flow B).

### Flow B: Onboarding

After preview, user goes through onboarding before signup is finalized.

**Screens:**
- `B0` — Language picker (user picks English or Urdu UI — locks the rest of onboarding in that language)
- `B1` — Welcome (in selected language)
- `B2` — Goal selection ("Why are you learning Arabic?")
- `B3` — Level selection ("What is your current level?")
- `B4` — Daily commitment ("How much time can you spend daily?")
- `B5` — Name input
- `B6` — Placement quiz (a few questions to confirm/refine level)
- `B7` — Ready screen ("Here is your path")
- `B8` — Account creation (email + password)
- `B9` — Permissions ask (notifications, microphone)

After B9, user enters the app at the Learn tab.

### Flow C: Returning user (already has account)

User who has logged out or installed on a new device.

**Screens:**
- `A0` — Splash screen
- `C1` — Login or signup choice ("Welcome back" or "New here?")
- `C2` — Login screen
- `C3` — Forgot password screen
- `C4` — Forgot password confirmation

After C2 success, user enters the app at the Learn tab.

### Flow D: Session start (already logged in)

User who is already logged in opens the app.

**Screens:**
- `A0` — Splash screen (briefer, just brand mark)
- Tab shell, defaulting to Learn tab

If the user's daily streak is at risk (hasn't done a lesson today and it's past their daily goal time), the Learn tab shows a gentle prompt at the top.

---

## 4. Tab 1: Learn (تَعَلَّم)

The primary tab. This is where the user spends most of their time.

### Screen inventory

#### `L1` — Learn home

The default screen of the Learn tab. The user lands here every time they open the tab.

**Contents (top to bottom):**

1. **Header bar** — Warsh logo (left), notifications bell (right). Subtle, doesn't dominate.
2. **Daily goal progress** — A horizontal bar showing today's progress toward the daily goal. Text shows "12 minutes left" or "Goal complete — Barak Allahu feek." Appears collapsed when goal is complete.
3. **Current chapter card** — The chapter the user is currently in. Shows: chapter Arabic + English name, lesson progress within chapter, "Continue learning" CTA. This is the largest card.
4. **Tadabbur card** — Currently active Surah in the user's Tadabbur progression. Shows: Surah name, comprehension percentage, color-coded ayah preview (words gold-tinted as understood, dim as not-yet-learned). Tap to enter Tadabbur detail.
5. **Streak card** — Current streak count, longest streak, calendar heatmap (last 30 days). Tap to enter streak detail.
6. **Word of the Day card** — Today's featured word with audio play button. Tap to enter word detail (same screen as in Vocabulary tab).
7. **Chapter list teaser** — "All chapters →" link. Tap to enter full chapter list.

The screen scrolls. Cards have generous spacing. No information density crammed in.

#### `L2` — All chapters

Full list of all chapters in the curriculum. Tapping a chapter opens its detail.

**Contents:**

- Header with back button
- Title: "Your path / مسارك"
- Each chapter shown as a card with:
  - Chapter number
  - Arabic title (large)
  - English title (smaller)
  - Lesson count
  - Progress indicator (number of lessons completed out of total)
  - Status badge (Locked / In progress / Completed)
  - Lock icon if not yet unlocked

Locked chapters are visible but un-tappable. The user can see the path ahead but can't skip.

#### `L3` — Chapter detail

When user taps a specific chapter from `L1` or `L2`.

**Contents:**

- Header with back button
- Chapter Arabic title (huge, prominent)
- Chapter English title (subtitle)
- Chapter description (2–3 lines explaining what this chapter teaches)
- Grammar focus badge (e.g., "Possessive constructions · الإضافة")
- List of lessons within the chapter:
  - Lesson number
  - Lesson Arabic + English title
  - Lesson type badge (Standard / Spoken Phrases / Review / Verb Pattern)
  - Status (locked / available / completed)
  - XP value
  - Tap to enter `L4` lesson preview

If the chapter contains a SPOKEN_PHRASES lesson or REVIEW lesson, those are clearly distinguished by their badge color and icon.

#### `L4` — Lesson preview bottom sheet

Tapped from `L3`. Appears as a bottom sheet, not full screen.

**Contents:**

- Lesson Arabic title (large)
- Lesson English title
- 2-line summary: "What you'll learn"
- Lesson type
- XP available
- Estimated time (computed from exercise count)
- Two buttons:
  - "Begin" (Gold, primary)
  - "Cancel" (text button, dismiss the sheet)

Tapping "Begin" enters the lesson player (`P1` screens).

#### `L5` — Tadabbur detail

Tapped from the Tadabbur card on `L1`.

**Contents:**

- Header with back button
- Currently active Surah:
  - Surah Arabic name (huge)
  - Surah English transliteration (subtitle)
  - Comprehension percentage
  - Color-coded ayah view: every word in the Surah, with mastered words in Ink (full color) and unmastered words dimmed in Sage. Tap any word to see its detail (same as Vocabulary word card).
- Audio playback button: play the full Surah recital
- Below: list of all Surahs in the Tadabbur progression (completed, current, upcoming)

When user achieves 100% on a Surah, this screen plays a celebration the first time they visit it after completion (one-time, modal celebration, then returns to normal view).

#### `L6` — Streak detail

Tapped from streak card on `L1`.

**Contents:**

- Current streak count (huge number)
- Longest streak count
- Calendar heatmap (GitHub-style) showing the last 12 months of activity
- Streak freezes remaining (and explanation of how to earn more)
- Streak history milestones (3 days, 7, 14, 30, 100)

---

## 5. Tab 2: Vocabulary (مُفْرَدَات)

The user's word bank. Free forever — doesn't lock behind paywall.

### Screen inventory

#### `V1` — Vocabulary home

Default screen of the Vocabulary tab.

**Contents (top to bottom):**

1. **Header bar** — Tab title, search icon (right)
2. **Word of the Day card** — Same as on Learn tab `L1`, but here it's a full feature. Audio button, tap for detail.
3. **My Words section** — User's personal word bank (words learned through lessons). Shows recent words plus link to full list.
4. **Browse by Topic section** — 16 topic categories shown as a grid of cards. Each card shows: topic Arabic + English name, word count in that topic, and a small thematic illustration.
5. **SRS Review card** — If user has words due for review, this card prompts: "X words ready for review". Tap to enter review session.

#### `V2` — My Words

All words the user has unlocked through lessons.

**Contents:**

- Header with back button
- Filter chips (All / Newly learned / Mastered / Recently reviewed)
- Sort options (Alphabetical Arabic / Date learned / By chapter)
- Word list — each row shows: Arabic word, transliteration, brief translation, audio play button
- Tap a row to enter word detail (`V5`)

#### `V3` — Browse by Topic detail

Tapped from a topic card on `V1`.

**Contents:**

- Header with back button and topic Arabic + English name
- Topic illustration (large)
- Word list within this topic — same row format as `V2`
- Words may be locked if the user hasn't reached the relevant chapter; locked words show with a subtle lock indicator but are still browsable for preview

#### `V4` — Search

Tapped from search icon on `V1`.

**Contents:**

- Search input at top (supports English, Arabic, transliteration)
- Recent searches below input
- As-you-type results — words matching the query in any of the three scripts
- Tap result to enter word detail

#### `V5` — Word detail

The complete view of a single word. Tapped from anywhere in the app where a word appears.

**Contents (scrolling page):**

- Header with back button
- Arabic word (huge, Scheherazade New, with full harakat)
- Audio play button (prominent)
- Transliteration
- Translation (in selected UI language)
- Word type badge (Noun / Verb / Preposition / etc.)
- Grammar info section (collapsible):
  - Gender (if applicable)
  - Number / plural form (if applicable)
  - Grammatical case info
  - Root letters (3-letter جذر)
- Quranic example section:
  - The ayah where the word appears (Arabic with the word highlighted in Gold)
  - Ayah audio play button
  - Surah name + ayah number
  - Translation of the ayah
- Lessons where this word appears (linked)
- Add to / remove from "Favorites" toggle

#### `V6` — SRS Review session

A focused review experience.

**Contents:**

- Each card shows one word for review
- User taps to reveal meaning
- Three response buttons: "Hard" / "Good" / "Easy" (SM-2 style)
- Progress indicator at top showing X of Y cards
- On complete: summary screen with XP earned and "Done" CTA

---

## 6. Tab 3: Noor (نور)

The AI tutor chat surface.

### Screen inventory

#### `N1` — Noor home (chat)

Default and only screen in this tab.

**Contents:**

- Header with: "Ustaad Noor" title, three-dot menu (right) with options: Clear conversation, About Noor
- Message thread (Noor's messages on the left, user's messages on the right)
- Suggested prompts above the input when the conversation is new or empty:
  - "Explain the lesson I just finished"
  - "Why do we say هَذَا and not هَذِهِ?"
  - "Can you give me an example with this word?"
  - "I don't understand this grammar concept"
- Input bar at bottom with text field and send button
- Below input bar: small subtle counter showing "3 of 5 messages today"
- When user reaches limit: input bar disables and shows: "Daily limit reached. Try again tomorrow, or get more messages."
  - "Get more messages" button opens overage purchase modal (`N2`)

#### `N2` — Overage purchase modal

Bottom sheet modal.

**Contents:**

- "Continue learning with Noor" title
- Description: "Get 20 additional messages with Noor for $0.99. Messages do not expire."
- Purchase button (triggers IAP)
- "Cancel" button (dismiss)

After successful purchase, modal closes and user can immediately continue chatting.

---

## 7. Tab 4: You (أنت)

Profile, stats, settings, account.

### Screen inventory

#### `Y1` — You home

Default screen of the You tab.

**Contents (top to bottom):**

1. **Header bar** — Settings gear icon (right)
2. **Profile section:**
   - Avatar (default initials, or uploaded photo)
   - Name
   - Member since date
   - Edit profile button
3. **Quick stats grid (4 tiles):**
   - Total XP
   - Current streak
   - Lessons completed
   - Chapters completed
4. **Speaking stats card:**
   - Phrases you can say
   - SHADOW_REPEAT exercises completed
5. **Vocabulary stats card:**
   - Words learned
   - Words reviewed today
6. **Tadabbur progress card:**
   - Current Surah focus
   - Surahs fully understood (count)
   - Tap to see full Tadabbur progress in `L5`
7. **Learning time card:**
   - Total time spent learning (formatted as hours and minutes)
   - This week's time
8. **Milestones / Badges row:**
   - Horizontal scroll of earned badges
   - Tap to see all milestones (`Y5`)
9. **Streak heatmap:**
   - GitHub-style 12-month heatmap
   - Tap to expand to `L6`
10. **Share profile card button** — generates a shareable image of stats
11. **Sign out button**

#### `Y2` — Edit profile

Tapped from profile section on `Y1`.

**Contents:**

- Header with back button and "Save" button (right)
- Avatar with "Change photo" button (uploads to R2)
- Name field
- Email field (read-only — change via account settings if needed)
- Native language selector (English / Urdu)
- Save changes

#### `Y3` — Settings

Tapped from gear icon on `Y1`.

**Contents (sectioned):**

**Notifications:**
- Daily reminder time picker
- Streak at risk reminder toggle
- New content notification toggle
- Milestone notification toggle

**Audio:**
- Audio on/off
- Auto-play on lesson cards toggle
- Sound effects on/off

**Speaking:**
- Microphone permission status (with link to system settings if denied)

**Display:**
- Daily goal adjustment
- App language (English / Urdu)
- Haptics on/off

**Account:**
- Change email
- Change password
- Manage subscription (links to system subscription management)
- Delete account (with strong confirmation)

**Support:**
- Help / FAQ
- Contact us
- Send feedback

**Legal:**
- Privacy policy
- Terms of service
- Open source acknowledgments

**About:**
- App version
- Build number
- Made with love in Pakistan

#### `Y4` — Subscription / Paywall

Reached from "Manage subscription" in settings, or triggered automatically when a paywalled feature is accessed during/after trial.

**Contents:**

- Hero illustration (parchment, scholarly aesthetic)
- Title: "Continue your journey"
- Two pricing tiles:
  - $1 / month
  - $10 / year (with "Save 17%" badge)
- Feature list:
  - All chapters and lessons
  - Ustaad Noor chat (5 daily messages)
  - Tadabbur Quran progression
  - Streak protection
  - Future updates
- "Start subscription" button (triggers IAP)
- "Restore purchases" link
- "Vocabulary Bank remains free" note at bottom
- "Maybe later" text button (dismiss — only if accessed from manage, not from forced paywall)

#### `Y5` — All milestones

Tapped from milestones row on `Y1`.

**Contents:**

- Header with back button and title "Milestones"
- Sectioned by category:
  - Streak milestones
  - XP milestones
  - Chapter milestones
  - Tadabbur milestones
  - Vocabulary milestones
  - Speaking milestones
  - First-time milestones
- Each milestone shown as: badge image, title, date earned (or grayed out if not yet earned), brief description

#### `Y6` — Share stats card

Tapped from "Share profile card" on `Y1`.

**Contents:**

- Generated image preview showing user's stats in parchment-styled card
- "Share" button (opens native share sheet)
- "Save image" button (saves to device)
- "Cancel" button

---

## 8. Lesson player (full-screen, modal over tabs)

When the user enters a lesson, the tab bar disappears and the lesson takes over the entire screen. This is a focused, immersive experience.

The lesson player has its own internal navigation across the 5 beats.

### Screen inventory

#### `P0` — Lesson loading

Brief loading state while lesson content + audio prefetch.

#### `P1` — Hook beat

**Contents:**

- Full-bleed background (Parchment with subtle motif)
- Ayah displayed center (Arabic, Scheherazade New, large)
- Audio plays automatically (with visual waveform animation)
- No translation visible yet
- Below ayah: ayah reference (Surah name + ayah number)
- Tap-to-continue affordance at bottom

#### `P2` — Discover beat

**Contents:**

- Header with progress dots (5 beats, current highlighted)
- Discover cards (10–12 per lesson, swipeable horizontally)
- Each card shows:
  - Custom illustration (top)
  - Arabic word (huge, with harakat)
  - Audio play button
  - Transliteration
  - Translation
- Tap to reveal translation if hidden by default
- Swipe to next card
- "Continue" button after all cards seen

#### `P3` — Practice beat

**Contents:**

- Header with progress (current exercise / total exercises)
- One exercise displayed at a time (full screen)
- Exercise type-specific UI (see File 04 for all exercise types)
- "Check" or "Submit" button
- After answer:
  - Correct: feedback overlay (gentle chime, gold flash, "Yes" or short Noor encouragement)
  - Wrong: feedback overlay (gentle non-judgmental tone, "Let's look at this again" — explanation from Noor)
- Next exercise auto-advances after feedback

#### `P4` — Reveal beat

**Contents:**

- Title: "Now you can see it / الآن یمکنک رؤیتها"
- The grammar concept the user just practiced, named explicitly
- A real Quranic ayah displayed, with the concept's word(s) highlighted in Gold
- Audio of the ayah plays
- Brief explanation from Noor (1–2 sentences max)
- "Continue" button

#### `P5` — Close beat

**Contents:**

- Celebration animation (gentle gold particles, not overwhelming)
- XP earned (animated count-up)
- Noor's closing message ("Barak Allahu feek. You completed today's lesson.")
- Stats updated:
  - Today's daily goal progress
  - Streak status
- "Continue" button — returns to chapter detail `L3`
- If user just completed a chapter, special chapter completion celebration before returning to `L3`
- If user just unlocked a milestone, milestone celebration modal appears

#### `P6` — Pause / exit confirmation

If user tries to exit a lesson mid-flow.

**Contents:**

- Modal: "Pause this lesson?"
- "Your progress in this lesson will not be saved. You'll need to start it again."
- "Continue lesson" button (resumes)
- "Exit anyway" button (returns to chapter detail, lesson reset)

---

## 9. SPOKEN_PHRASES lesson variant

SPOKEN_PHRASES lessons replace the standard 5-beat structure with a 4-beat structure.

### Screen inventory

#### `SP1` — Context beat

**Contents:**

- Scene illustration (e.g., halaqa, masjid courtyard, classroom)
- Title: e.g., "Speaking at a halaqa / في الحلقة"
- Brief context: "These phrases are used when..."
- "Begin" button

#### `SP2` — Phrase practice (repeats per phrase)

For each phrase (10 phrases per SPOKEN_PHRASES lesson):

- Phrase shown in Arabic (with harakat)
- Transliteration
- Translation
- Audio plays automatically
- Mic button — tap to record yourself
- After recording: playback of your voice + original side-by-side
- AUDIO_RECOGNITION mini-check: "What does this phrase mean?" with 4 options
- Continue to next phrase

#### `SP3` — Mini-dialogue beat

**Contents:**

- A short scripted dialogue using the phrases learned
- Audio plays the full dialogue (with two voices if possible)
- Translation displayed alongside
- User can replay, follow along
- "Continue" button

#### `SP4` — Close beat

Same as `P5` but adapted for SPOKEN_PHRASES — celebrates "phrases learned to say" count update.

---

## 10. REVIEW lesson variant

REVIEW lessons appear every 4–5 chapters and have a 4-beat structure focused on retention.

#### `R1` — Recall beat

**Contents:**

- Title: "Let's review what you've learned"
- Quick flash review of key vocabulary from past chapters (5–10 words shown briefly)
- "Begin review" button

#### `R2` — Mixed practice beat

**Contents:**

- 10–15 exercises mixed from all exercise types
- Pulled from past chapters' content
- Standard exercise UI

#### `R3` — Surprise quiz beat

**Contents:**

- 3 challenge questions that combine multiple grammar concepts
- Higher XP value per correct answer
- Encouraging Noor message regardless of performance

#### `R4` — Close beat

Same as `P5` but adapted.

---

## 11. VERB_PATTERN lesson variant

For chapters introducing verbs, a different lesson template is used to handle conjugation tables.

#### `VP1` — Hook beat

Same as `P1` — ayah with the verb in question.

#### `VP2` — Pattern Discovery beat

**Contents:**

- The verb shown in its base form (3rd person masculine singular past tense — the dictionary form)
- A simple conjugation chart appears, animated row by row:
  - هُوَ (he) — کَتَبَ (he wrote)
  - هِيَ (she) — کَتَبَتْ (she wrote)
  - أَنْتَ (you m) — کَتَبْتَ (you wrote)
  - etc.
- Each row has audio
- User taps to hear and absorb the pattern

#### `VP3` — Practice beat

Standard exercises, but biased toward exercises that involve verb conjugation (FILL_BLANK with conjugation, BUILD_SENTENCE with verbs, etc.)

#### `VP4` — Reveal beat

Same as `P4` but specifically shows the verb in a Quranic context.

#### `VP5` — Close beat

Same as `P5`.

---

## 12. Modal overlays (can appear from any screen)

These are not full screens — they overlay whatever the user is doing.

### `M1` — Milestone celebration

Fires when user hits any milestone.

**Contents:**

- Full-screen overlay with parchment background
- Custom badge illustration (animated reveal)
- Milestone title (e.g., "First chapter complete")
- Arabic title (e.g., "أول فصل")
- Relevant ayah or hadith (small, italic)
- XP bonus awarded
- Share button
- "Continue" button (dismiss)

### `M2` — Push notification permission ask (in-context)

If user denied notifications during onboarding and we need to ask again at a relevant moment.

**Contents:**

- Modal explaining why notifications help
- "Allow notifications" button
- "Maybe later" button

### `M3` — Microphone permission ask (in-context)

When user first encounters SHADOW_REPEAT.

**Contents:**

- Modal explaining why mic is needed
- "Allow microphone" button
- "Skip this exercise" button

### `M4` — Streak at risk warning

Appears when user opens app late in the day and hasn't done a lesson.

**Contents:**

- Gentle modal (not red, not panicked)
- "Your streak is at risk"
- "Complete one lesson before midnight to keep it going"
- "Begin a lesson" button
- "Later" button (dismiss)

### `M5` — Daily goal complete celebration

Appears when user completes their daily goal.

**Contents:**

- Smaller overlay (not full screen)
- "Today's goal complete"
- Brief animation
- Auto-dismisses after 3 seconds OR tap to dismiss

### `M6` — Surah understood celebration

Appears when user achieves 100% on a Surah in Tadabbur.

**Contents:**

- Full-screen overlay
- Surah Arabic name (huge)
- Full Surah text with all words now in Gold (fully understood)
- Audio plays the Surah recital
- "You now understand this Surah" message
- "Continue" button

### `M7` — Error / network state

Generic error modal for network failures, audio load failures, etc.

**Contents:**

- Brief, kind message: "Something didn't load. Try again?"
- "Retry" button
- "Cancel" button

### `M8` — Offline indicator

Subtle persistent indicator at top of screen when offline.

**Contents:**

- Thin Sage-colored bar: "Offline — your progress is being saved"

---

## 13. Navigation graph (full)

The following shows how screens connect.

```
[Preview & Onboarding]
   A0 (splash)
      ↓
   A1 → A2 → A3 → A4 → A5 → A6 → A7
      ↓
   B0 → B1 → B2 → B3 → B4 → B5 → B6 → B7 → B8 → B9
      ↓
   [Tab Shell: L1]

[Returning user]
   A0 → C1 → C2 → [Tab Shell: L1]
            ↓ (if forgot pwd)
            C3 → C4 → C2

[Session start]
   A0 → [Tab Shell: L1]

[Learn tab]
   L1 ─→ L2 → L3 → L4 → [Lesson Player]
       ─→ L3 (direct from "Current chapter")
       ─→ L5 (Tadabbur)
       ─→ L6 (Streak)
       ─→ V5 (Word of the Day)

[Lesson Player — standard]
   P0 → P1 → P2 → P3 → P4 → P5 → [back to L3]
                          ↓
                      M1 (if milestone)
                      M6 (if Surah understood)
                      M5 (if daily goal hit)

[Lesson Player — Spoken Phrases]
   P0 → SP1 → SP2 (loop 10x) → SP3 → SP4 → [back to L3]

[Lesson Player — Review]
   P0 → R1 → R2 → R3 → R4 → [back to L3]

[Lesson Player — Verb Pattern]
   P0 → VP1 → VP2 → VP3 → VP4 → VP5 → [back to L3]

[Vocabulary tab]
   V1 ─→ V2 → V5
       ─→ V3 → V5
       ─→ V4 → V5
       ─→ V6 (SRS review)
       ─→ V5 (Word of the Day direct)

[Noor tab]
   N1 (only screen, persistent)
       ─→ N2 (overage purchase modal)

[You tab]
   Y1 ─→ Y2 (edit profile)
       ─→ Y3 (settings)
       ─→ Y4 (subscription)
       ─→ Y5 (all milestones)
       ─→ Y6 (share stats)
       ─→ L5 (Tadabbur — same screen as Learn tab)
       ─→ L6 (Streak detail — same screen as Learn tab)

[Modals — can appear from anywhere]
   M1, M2, M3, M4, M5, M6, M7, M8
```

---

## 14. Screen ID conventions

To prevent confusion across this large specification:

- **A***N* — Preview / first-launch screens
- **B***N* — Onboarding screens
- **C***N* — Returning user / auth screens
- **L***N* — Learn tab screens
- **V***N* — Vocabulary tab screens
- **N***N* — Noor tab screens
- **Y***N* — You tab screens
- **P***N* — Standard lesson player screens (5-beat)
- **SP***N* — Spoken Phrases lesson screens (4-beat)
- **R***N* — Review lesson screens (4-beat)
- **VP***N* — Verb Pattern lesson screens (5-beat)
- **M***N* — Modal overlays

Total screen count: **~62 unique screens** in v1.

This is a non-trivial number but appropriate for the scope. A typical mid-complexity production app has 40–80 screens.

---

## 15. Tab persistence and state

- **Each tab maintains its own navigation stack.** If a user is on `Y3` (Settings) and switches to Learn tab, then back to You tab, they return to `Y3`. Not `Y1`.
- **Lesson player is exempt** — it always opens fresh. If a user abandons a lesson and re-enters, they start from `P1` again (lesson progress within a single play is not persisted).
- **The Learn tab's "Current chapter card"** always reflects the user's most recent active chapter, regardless of where they last were in the tab.
- **Noor conversation is preserved per session** — user can switch away and return without losing the conversation. New conversation starts fresh (per Section 9 of File 01: no persistent memory across sessions).

---

## 16. Deep linking and entry points

Future versions may support deep links. For v1, we plan but don't necessarily implement all of these:

- `warsh://learn` — Open Learn tab home
- `warsh://learn/chapter/123` — Open specific chapter detail
- `warsh://learn/lesson/456` — Open lesson preview, ready to begin
- `warsh://vocabulary/word/789` — Open word detail
- `warsh://noor` — Open Noor chat
- `warsh://settings` — Open settings

Push notifications use these deep links to send the user directly to the relevant screen when tapped.

---

## 17. Empty states

Every screen has a defined empty state. Empty states are warm, not blank.

| Screen | Empty state |
|---|---|
| `L1` Daily goal | "Begin your first lesson today, in shaa Allah." |
| `L1` Tadabbur card | "Complete lessons to begin understanding the Quran, word by word." |
| `L1` Streak | "Begin your first day. Every great journey starts with one step." |
| `V1` My Words | "Words you learn will gather here. Like seeds, planted." |
| `V1` Browse by Topic | (Always populated — never empty) |
| `V6` SRS Review | "Nothing to review today. Come back tomorrow, in shaa Allah." |
| `N1` Noor chat | (Suggested prompts always shown) |
| `Y1` Milestones | "Your first milestone awaits. Begin a lesson to start." |
| `Y5` All milestones | (Shows locked milestones with descriptions, never empty) |

---

## 18. Loading and error states

Every screen has a defined loading state and error state.

**Loading states:**
- Skeleton screens (gentle parchment-toned placeholders that match the layout)
- No spinners — they feel mechanical
- Words like "Loading" or "Please wait" appear only after 2+ seconds of loading

**Error states:**
- Always offer a retry action
- Always written in Noor's voice, not technical
- Examples:
  - "Couldn't load this lesson. Try again?"
  - "Noor is unavailable just now. Try again in a moment."
  - "No connection. Your progress is saved — we'll sync when you're back."

---

## 19. Accessibility considerations (v1 baseline)

The following are minimum baseline. More extensive accessibility work happens post-v1.

- All buttons have sufficient touch target size (44pt minimum)
- All text has sufficient contrast against background (WCAG AA)
- All images have alt text (in selected UI language)
- Arabic text uses proper RTL rendering
- Audio playback has visual indicators (waveform, not just sound) for hearing-impaired users
- Haptic feedback is supplementary, never the only signal
- No flashing animations or seizure-risk visual effects

---

## 20. Changelog

**2026-05-19 — v1.0**
- Complete information architecture defined
- All 62 screens identified and numbered
- Navigation graph documented
- Empty states, loading states, error states specified
- Cross-references to other spec files established

---

*End of File 02.*
*Next: File 03 — Onboarding & Auth.*
