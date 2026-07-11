# Warsh · وَرْش — App Specification
## File 08: Engagement Features

**Status:** Locked
**Version:** 1.0
**Last updated:** 2026-05-19
**Depends on:** File 01 (Identity & Principles), File 02 (Information Architecture), File 04 (Lesson System)

> This file specifies the systems that keep users coming back: XP, streaks, daily goals, milestones, share mechanics, and push notifications. Every engagement mechanic in Warsh is carefully calibrated to motivate without manipulating — to support consistent practice without inducing anxiety, shame, or addictive patterns.

---

## Part 1 — Engagement Philosophy

### 1.1 What we are not doing

Per File 01, Warsh explicitly avoids the manipulative engagement patterns common in language and gamification apps:

- **No hearts/lives system.** Users are never locked out for getting things wrong.
- **No leaderboards.** No comparison with other users.
- **No public profiles.** No social shame or pressure.
- **No "Limited time offers"** for missing a streak.
- **No countdown timers** creating false urgency.
- **No daily shame messages** ("You haven't visited in 3 days — your owl is sad!").
- **No XP loss for missed days.** XP is monotonically increasing.
- **No notification spam.** Push notifications are gentle and limited.
- **No FOMO mechanics** in any form.

### 1.2 What we are doing

Warsh's engagement system is designed around three principles:

1. **Steady wins.** The user is rewarded for consistency, not intensity. A 7-day streak of 10-minute sessions beats one 90-minute binge.

2. **Empathetic, not punitive.** When the user falters (misses a day, gets answers wrong, takes a break), the app responds with grace. The Warmth Principle (File 01) is enforced everywhere.

3. **The reward is the learning.** XP, streaks, and milestones are visual confirmations of real progress — not abstract points designed to addict. The goal is for the user to feel proud of *what they learned*, not how many points they accumulated.

### 1.3 The 4 AM rule

A "day" in Warsh begins at **4 AM local time**. This is intentional:

- Users who pray Fajr and study after may complete a lesson at 5 AM
- That lesson should count for the new day, not the previous
- Users who study late at night (10 PM, 11 PM, even 1 AM) — those lessons count for the day they began
- The 4 AM cutoff is generous enough for late-night learners while being early enough for early risers

All daily counters (streak, daily goal, daily Noor messages, Word of the Day) reset at 4 AM in the user's local time zone.

---

## Part 2 — XP System

### 2.1 The XP economy (from File 04)

Per File 04, the full XP economy is:

| Action | XP |
|---|---|
| Standard lesson completion | 10 |
| SPOKEN_PHRASES lesson completion | 15 |
| REVIEW lesson completion | 20 |
| VERB_PATTERN lesson completion | 12 |
| Chapter completion bonus | 50 |
| First lesson ever (one-time bonus) | 25 |
| Daily goal hit | 5 |
| 7-day streak milestone | 25 |
| 30-day streak milestone | 100 |
| 100-day streak milestone | 500 |
| Surah understood (first) | 100 |
| Surah understood (each subsequent) | 50 |
| Perfect lesson (all correct) | 5 |
| SRS daily review completion | 5 |
| First SHADOW_REPEAT completed | 10 |
| First SPOKEN_PHRASES lesson completed | 25 |
| Various speaking phrase milestones | 15–200 |

### 2.2 XP display

XP appears in the following places in the app:

- **Profile (Y1):** Total XP shown as a quick stat tile
- **Lesson Close beat (P5):** XP earned this lesson, animated count-up
- **Milestone celebrations (M1):** XP bonus from the milestone
- **Daily goal completion (M5):** Daily goal bonus XP
- **SRS review summary:** XP earned from the review session

### 2.3 XP count-up animation

When XP is awarded:

- The XP number animates from old value → new value over 1.5 seconds
- Uses an ease-out curve (fast start, gentle end)
- The "+X XP" appears as a small badge that fades in, then drifts up and fades out
- Audio: subtle ascending chime (if SFX enabled)

### 2.4 What XP unlocks

In v1, XP unlocks:

- **Milestones** based on total XP thresholds (100, 500, 1000, 5000, 10000, 25000)
- **Nothing else.** XP does not unlock content, buy items, or activate special features.

The XP-based milestones are achievement markers, not gates. Content access is controlled by chapter progression (per File 04), not XP.

### 2.5 No XP level system

Per File 04, **there is no "XP level"** in Warsh. The user sees their total XP as a clean number. No "Level 7 → Level 8" progression. No "you need 200 more XP to level up."

Why: levels create artificial plateaus and stress. Total XP is a more honest representation of accumulated effort. The user knows what they've earned.

---

## Part 3 — Streak System

### 3.1 What a streak is

A **streak** is the number of consecutive days the user has completed at least their daily goal. It is one of the most visible numbers in the app — shown on Profile (Y1), Streak detail (L6), and home (L1).

### 3.2 What counts as "maintaining" a streak

A day is counted toward the streak when:

- The user completes their daily goal (per their selected commitment level — 5/10/15/30 minutes OR equivalent in lessons)
- Completion happens between 4 AM today and 4 AM tomorrow (their local time zone)

**Lessons completed count toward both:**
- Daily goal progress
- Streak maintenance (once daily goal is met)

### 3.3 Daily goal completion threshold

The streak doesn't require a full lesson — it requires meeting the daily goal:

| Daily commitment | Minimum to maintain streak |
|---|---|
| 5 min | Either 1 full lesson OR 5 minutes total time on app (any lesson activity counts) |
| 10 min | Either 1 full lesson OR 10 minutes |
| 15 min | Either 1 full lesson OR 15 minutes |
| 30 min | At least 1 full lesson (30 min is hard to track passively) |

**For all commitment levels:** Completing at least 1 full lesson always counts as meeting daily goal, regardless of time spent.

This is intentional. A user who completes a lesson in 3 minutes still maintains streak. A user who browses vocabulary for 20 minutes but doesn't finish a lesson maintains streak only if their commitment is ≤ 10 min (where time alone counts).

### 3.4 Streak start

A user's streak starts the first day they meet their daily goal:

- Day 1: User completes first lesson → streak = 1
- Day 2: User completes lesson → streak = 2
- Day 3: User missed → streak resets to 0 next day (unless streak freeze used)

### 3.5 Streak loss

A streak resets to 0 when:

- The user fails to meet daily goal between 4 AM yesterday and 4 AM today
- AND has no streak freezes available (or chooses not to use one)

**When the streak resets:**

- The next day's first app open shows a streak loss screen (`M4`-style modal, but specifically for streak loss)
- The user is greeted gently:
  > "As-salamu alaykum, [Name].
  >
  > Your streak ended. Even the great scholars had days of rest.
  >
  > Begin again today, in shaa Allah."

- Two buttons:
  - "Begin a lesson" (primary, Gold) → routes to current chapter
  - "Maybe tomorrow" (text link) → dismisses modal

- The longest streak count is preserved. The current streak resets to 0.

### 3.6 Streak freezes (locked decision)

Per File 04 Section I3:

- **Streak freezes** automatically save a missed day from breaking the streak
- One freeze is earned at the 7-day streak milestone
- One additional freeze is earned every 30 days of total app usage (cumulative, not by streak)
- **Streak freezes cannot be purchased.** They are earned only.
- Maximum 2 freezes held at any time
- When a user misses a day and has a freeze: the freeze is used automatically (no user action required)

**Why no purchase option:** Buying freezes turns the streak into a gambling/casino mechanic. Warsh's streak is about real consistency. If you missed, you missed — and that's okay.

### 3.7 Streak freeze usage notification

When a streak freeze is automatically applied:

- The next day's app open shows a brief, gentle confirmation:
  > "🛡️ Your streak freeze was used.
  > Yesterday is forgiven. Continue today, in shaa Allah."
- "Continue →" button dismisses

This is informational, not celebratory. We're not making it feel rewarding to miss days.

### 3.8 Streak history visualization

On the Streak detail screen (L6), the user sees:

**Calendar heatmap:**

- GitHub-contributions-style grid
- Each square = one day
- Color intensity = lesson activity that day:
  - Sage (light): no activity
  - Sage (medium): some activity but didn't meet goal
  - Gold (light): met daily goal
  - Gold (medium): exceeded goal (completed 2+ lessons)
  - Gold (dark): completed 3+ lessons
- Streak freeze days marked with a small shield icon
- Tap a day → tooltip shows: date, lessons completed, XP earned, daily goal status

**Stats:**

- Current streak
- Longest streak (lifetime)
- Total active days (lifetime)
- Total lessons completed

**Streak milestones visible:**

A small horizontal row showing streak milestone progress:
- 3 days · 7 days · 14 days · 30 days · 100 days
- Reached milestones are Gold; upcoming are Sage; current target glows subtly

### 3.9 Streak protection at risk

If the user has NOT met their daily goal by 8 PM local time:

- A push notification can fire (if notifications enabled): "Your streak is at risk — one lesson keeps it going."
- On app open, L1 shows a gentle banner at the top:
  > "Your streak is at risk. Complete one lesson before [today's end] to keep it going."
- "Begin a lesson" CTA in the banner

This is the only "risk" framing we use. No countdown timers, no panic colors.

### 3.10 Streak Lost screen

When a user opens the app the day after losing their streak (and they haven't started a lesson yet):

`M4`-style modal:

- Centered illustration: a parchment scroll with a gentle ember at the bottom (suggesting "you can rekindle")
- Title: "Your streak ended"
- Body:
  > "[N] days — that's a real journey.
  > Even the great scholars had days of rest.
  > Begin again today, in shaa Allah."
- Primary button: "Begin a lesson →"
- Secondary: "Later"

No shame, no countdown to "Get it back NOW", no negative emotional cue. Just acknowledgment + invitation to continue.

---

## Part 4 — Daily Goal System

### 4.1 What it is

The daily goal is the user's stated commitment — how much time or how many lessons they want to do per day. It is set during onboarding (B4) and adjustable in Settings (Y3).

### 4.2 Goal options (from File 03)

- **5 minutes** (casual)
- **10 minutes** (comfortable)
- **15 minutes** (committed)
- **30 minutes or more** (serious)

### 4.3 Time tracking

For users with time-based goals (5/10/15 minutes):

- Time is tracked when the user is **actively in a lesson** (not just app open)
- Time counted from lesson start (P0/P1 mounted) to lesson exit
- Paused/backgrounded time does NOT count
- Vocabulary Bank browsing, Noor chat — these do NOT count toward daily goal time
- Exception: Time spent in SRS Review (V6) counts as it's an active learning session

For users with 30+ min goal:

- Time is tracked but the goal is "complete at least 1 full lesson" — simpler than tracking 30 actual minutes
- If they complete 1 lesson, goal is met regardless of time

### 4.4 Daily goal progress display

On L1 (Learn home) at the top:

```
┌────────────────────────────────┐
│ Today's goal: 10 min           │
│ ▓▓▓▓▓░░░░░  5 / 10 min        │
│                                │
└────────────────────────────────┘
```

**States:**

- 0% (not started): "Today's goal: [X] min · Begin a lesson →"
- Partial (1–99%): Shown above
- 100% (complete): "Today's goal complete · Barak Allahu feek 🌿"
- After goal complete + at least 1 more lesson: "Today: [N] lessons completed · Above your goal, alhamdulillah"

When goal is hit, this card collapses to a smaller success state (top of L1).

### 4.5 Daily goal completion celebration (M5)

When the user hits their daily goal:

`M5` modal-toast appears at the top of the screen (smaller than full-screen modal):

- Subtle Gold border
- Center text:
  > "Today's goal complete. Barak Allahu feek."
- Auto-dismisses after 3 seconds OR tap to dismiss
- XP bonus +5 awarded
- Subtle particle animation

The user can continue using the app — this doesn't interrupt their flow.

### 4.6 Goal adjustment

Users can adjust their daily goal anytime in Settings (Y3):

- Setting page shows current goal
- Tap "Change" → bottom sheet with the 4 options
- Selecting a new option updates immediately
- The new goal applies starting today (not retroactively)
- Confirmation toast: "Daily goal updated to [X] minutes"

### 4.7 Goal completion vs streak completion

These are distinct:

- **Daily goal complete** = today's goal met (any amount in app)
- **Streak day complete** = daily goal met AND streak maintained

They coincide most of the time. But:
- A user with a 5-min goal who completes 5 minutes: daily goal complete + streak day complete (same thing)
- A user with a 30-min goal who completes 1 short 4-minute lesson: daily goal complete (because 1 full lesson counts) + streak day complete
- A user who opened the app and browsed for 10 minutes but completed no lesson and has a 30-min goal: NOT daily goal complete, NOT streak day

---

## Part 5 — Milestones

### 5.1 What milestones are

**Milestones are unlockable achievements** that mark meaningful moments in the user's journey. They are not just rewards — they are markers of real accomplishment.

Each milestone has:
- A name (Arabic + English)
- A trigger condition
- A badge image (custom illustration)
- An XP bonus
- A celebration modal (M1)
- A description shown in the all-milestones list (Y5)
- A share-able image

### 5.2 Complete milestone catalog

#### First-time milestones

| Milestone | Arabic | Trigger | XP |
|---|---|---|---|
| First step | الخُطْوَة الأُولَى | First lesson completed | 25 |
| First chapter complete | إِكْمَال الفَصْل الأَوَّل | Complete Chapter 1 | 50 |
| First Noor message | أَوَّل دَرْس | First message sent to Noor | 10 |
| First spoken phrase | أَوَّل عِبَارَة مَنْطُوقَة | First SHADOW_REPEAT completed | 10 |
| First SPOKEN_PHRASES lesson | أَوَّل دَرْس تَحَدُّث | First SP4 reached | 25 |
| First word in vocabulary bank | كَلِمَتُك الأُولَى | First word auto-added to bank | 5 |
| First SRS review session | أَوَّل مُرَاجَعَة | First V6 session completed | 10 |
| First daily goal hit | أَوَّل هَدَف يَوْمِيّ | First M5 fired | 5 |
| First Surah understood | فَهْم سُورَة | First M6 fired (Al-Fatiha typically) | 100 |
| First share | أَوَّل مُشَارَكَة | First share image sent | 5 |

#### Streak milestones

| Milestone | Arabic | Trigger | XP |
|---|---|---|---|
| Three days of light | ثَلَاثَة أَيَّام | 3-day streak | 15 |
| One week's path | أُسْبُوع | 7-day streak | 25 |
| A fortnight's journey | أُسْبُوعَان | 14-day streak | 50 |
| One month of devotion | شَهْر كَامِل | 30-day streak | 100 |
| Two months of devotion | شَهْرَان | 60-day streak | 200 |
| One hundred days | مِائَة يَوْم | 100-day streak | 500 |
| A year of seeking | سَنَة كَامِلَة | 365-day streak | 1000 |
| Returned after a break | العَوْدَة | First lesson after losing a streak of 7+ days | 15 |

#### XP milestones

| Milestone | Trigger | XP bonus |
|---|---|---|
| Bronze scholar | 100 XP | 10 |
| Silver scholar | 500 XP | 25 |
| Gold scholar | 1,000 XP | 50 |
| Distinguished scholar | 5,000 XP | 100 |
| Master scholar | 10,000 XP | 200 |
| Grand master | 25,000 XP | 500 |

#### Chapter milestones

| Milestone | Arabic | Trigger | XP |
|---|---|---|---|
| Book 1 complete | إِكْمَال الكِتَاب الأَوَّل | Complete Chapter 10 + final REVIEW | 100 |
| Book 2 complete | إِكْمَال الكِتَاب الثَّانِي | Complete Chapter 23 + final REVIEW | 100 |
| Book 3 complete | الثَّالِث | Chapter 33 | 100 |
| Book 4 complete | الرَّابِع | Chapter 43 | 100 |
| Book 5 complete | الخَامِس | Chapter 54 | 100 |
| Book 6 complete | السَّادِس | Chapter 59 | 100 |
| Book 7 complete | السَّابِع | Chapter 65 | 100 |
| Book 8 / Madinah complete | إِكْمَال المَدِينَة | Chapter 72 + capstone REVIEW | 500 |

#### Vocabulary milestones

| Milestone | Trigger | XP |
|---|---|---|
| 10 words learned | 10 unique words in bank | 10 |
| 50 words learned | 50 unique words | 25 |
| 100 words learned | 100 unique words | 50 |
| 250 words learned | 250 unique words | 100 |
| 500 words learned | 500 unique words | 200 |
| Master of vocabulary | All 600+ words learned | 500 |

#### Tadabbur milestones

| Milestone | Trigger | XP |
|---|---|---|
| Al-Fatiha understood | First Surah completed | 100 |
| 3 Surahs understood | 3 Surahs complete | 50 |
| 5 Surahs understood | 5 Surahs complete | 100 |
| All 11 Surahs of Phase 2 | All 11 Surahs in progression complete | 500 |

#### Speaking milestones (also covered in File 06)

| Milestone | Trigger | XP |
|---|---|---|
| 10 phrases learned to say | Speaking stat hits 10 | 15 |
| 50 phrases learned to say | Stat hits 50 | 25 |
| 100 phrases learned to say | Stat hits 100 | 50 |
| 250 phrases learned to say | Stat hits 250 | 100 |
| 500 phrases learned to say | Stat hits 500 | 200 |
| All SPOKEN_PHRASES lessons complete | All 11 SPOKEN_PHRASES done | 100 |

#### Special / hidden milestones

| Milestone | Trigger | XP |
|---|---|---|
| Night owl | Complete a lesson between 10 PM and 4 AM | 5 (one-time) |
| Early bird | Complete a lesson before 7 AM | 5 (one-time) |
| Ramadan visitor | Use the app at least 10 days in Ramadan | 50 |
| Friday consistency | Complete a lesson 4 Fridays in a row | 25 |
| Perfect chapter | Complete a chapter with 100% accuracy on every lesson | 50 |

**Total milestones at launch: ~50**

### 5.3 Milestone celebration (M1)

When a milestone is unlocked, M1 fires (per File 04 / File 02):

**Layout:**

- Full-screen parchment background
- Subtle Gold radiance from center
- Custom badge illustration (animated reveal — scales in, slight bounce)
- Milestone title in Arabic (huge, Scheherazade New)
- English/Urdu translation below
- Relevant ayah or hadith (optional, smaller, italic)
- XP bonus shown: "+X XP earned"
- Two buttons:
  - "Share this moment" (Gold, primary)
  - "Continue" (text link)

**Audio:** A gentle, ascending chime that crescendos slightly. Distinct from regular feedback sounds — milestones feel sacred.

**Haptic:** Strong success haptic (iOS).

**Duration:** User-controlled. Auto-dismisses after 30 seconds if the user is inactive.

### 5.4 Milestone share image

For each milestone, a share image template generates a beautiful, brand-aligned PNG:

- Parchment background, brand colors
- The badge illustration prominently
- Milestone title (Arabic + English)
- Brief Arabic ayah/hadith if applicable
- User's name (e.g., "[Name] — earned [Date]")
- Warsh logo + small tagline at bottom

User can share via native share sheet to WhatsApp, Instagram, Twitter, etc.

### 5.5 All Milestones screen (Y5)

Per File 02, the You tab has Y5 which shows all milestones in a sectioned list:

- **Sections:** Streak / XP / Chapters / Vocabulary / Tadabbur / Speaking / First-time / Special
- **Each milestone shows:**
  - Badge image (in color if earned, grayscale if not)
  - Title (Arabic + English)
  - Date earned (or "Not yet earned" if locked)
  - Brief description: "Complete 30 consecutive days of practice"
  - XP value
- Tappable → opens M1-style modal for that milestone (so user can re-share)

Earned milestones appear at the top of each section. Unearned at the bottom.

---

## Part 6 — Push Notifications

### 6.1 Notification philosophy

Notifications must:

- Be **gentle**, not nagging
- Be **infrequent** — never more than 2 per day
- Be **helpful**, not anxiety-inducing
- **Respect user-set times**
- Use **Noor's voice** (per File 01)
- Use **Islamic phrases** appropriately, never as decoration

### 6.2 Notification types

#### Type 1: Daily lesson reminder

**When:** At the user's set reminder time (default: 8 PM local). User can adjust in Settings.

**Content (example):**
> 📖 *Time for today's lesson, [Name].*
>
> Even 5 minutes brings you closer.

Tapping → opens app to current chapter.

**Frequency:** Once daily, at user-set time. Skipped if user has already met daily goal.

#### Type 2: Streak at risk

**When:** At 8 PM local time, if daily goal has NOT been met yet today.

**Content:**
> 🌿 Your streak of [N] days is at risk.
>
> One lesson keeps it going. In shaa Allah.

Tapping → opens app to current chapter.

**Frequency:** Once per streak-at-risk day, only if user has an active streak (≥3 days).

#### Type 3: New content available

**When:** Sent at 9 AM local time when new content is published (e.g., new chapter added).

**Content:**
> ✨ New chapter available.
>
> [Chapter title] — begin when you're ready.

Tapping → opens app to L2 (all chapters).

**Frequency:** Rare. Only when new content actually ships.

#### Type 4: Milestone achieved

**When:** Immediately when a milestone is unlocked (in addition to M1 modal).

**Content (example):**
> 🏆 Milestone unlocked: One month of devotion.

Tapping → opens app to Y5 (all milestones).

**Frequency:** As often as milestones are unlocked.

#### Type 5: Word of the Day

**When:** At 9 AM local time, daily.

**Content (example):**
> 🌅 Today's Word: كِتَاب
>
> The word for "book" — where the Quran begins.

Tapping → opens app to V5 (word detail for today's word).

**Frequency:** Once daily, configurable in Settings.

### 6.3 Notification copy (Noor's voice)

All notification copy follows the Warmth Principle. Examples of GOOD vs BAD copy:

| BAD | GOOD |
|---|---|
| "Don't forget your lesson! 🔥" | "Time for today's lesson, [Name]. In shaa Allah." |
| "URGENT: Your streak is in danger!!!" | "Your streak of [N] days is at risk. One lesson keeps it going." |
| "You earned 25 XP!!!" | "Milestone unlocked: One month of devotion." |
| "Come back, we miss you 😢" | "As-salamu alaykum, [Name]. Whenever you're ready." |

### 6.4 Notification timing — defaults and customization

Defaults (set during onboarding):

- Daily lesson reminder: 8 PM local
- Word of the Day: 9 AM local
- Streak at risk: 8 PM local (only if daily goal not met)

User can customize each in Settings (Y3):

- Reminder time picker (8 PM default)
- Word of the Day on/off
- Streak at risk on/off
- New content on/off
- Milestone on/off

### 6.5 Quiet hours

Notifications respect **quiet hours** (10 PM – 6 AM local time). No notifications fire during these hours unless they're urgent (none in v1 are urgent).

The Daily Lesson Reminder defaults to 8 PM — before quiet hours. If a user sets their reminder time inside quiet hours (e.g., 11 PM), the notification will still fire — user choice overrides defaults.

### 6.6 Implementation notes

- Library: `expo-notifications`
- Notifications are scheduled locally on the device (no server push needed for daily reminders)
- For new content notifications, server-side push is used (FCM via Expo)
- User's notification preferences and times are stored in user profile (synced to backend)

### 6.7 Permission handling

Per File 03, notification permission is requested during onboarding (B9). If denied:

- App functions normally
- Settings shows "Notifications: Off — enable in system settings"
- No re-prompts during normal use
- An in-context re-ask is possible if user explicitly enables a notification type that's off at the OS level (e.g., they toggle "Daily reminder" on in Settings while OS-level notifications are denied)

### 6.8 Notification badge count

On iOS and Android, the app icon can show a badge count:

- Badge increments when an unread notification is delivered
- Badge clears when the user opens the app

Per File 02, certain in-app indicators (tab badges, etc.) are also gated on unread state.

---

## Part 7 — Share Mechanics

### 7.1 Share entry points

Users can share from multiple places:

| Source | What gets shared |
|---|---|
| Milestone modal (M1) | Milestone badge + name + brief description image |
| Surah completion modal (M6) | Surah completion ceremony image |
| Word detail (V5) | Single word image with Quranic context |
| Profile (Y1 → Y6) | Stats card with overall progress |
| Chapter completion celebration | Chapter completion image |

### 7.2 Share image generation

All share images are generated on-device:

- Library: `react-native-view-shot`
- Hidden React Native components render the share design
- Captured as PNG
- Saved temporarily to device cache
- Passed to native share sheet

### 7.3 Share image design principles

Every share image follows these rules:

- **Parchment background** with subtle brand motif
- **Warsh logo** present, but not dominant
- **No URLs or QR codes** — keep it clean and beautiful
- **Brand colors only:** Ink, Gold, Parchment, Sage
- **Aspect ratio:** 1080×1080 for general shares, 1080×1920 for Stories format
- **No user PII** beyond the user's name (no email, no chapter numbers that reveal exact progress unless that's the share content)

### 7.4 Share copy

When the user shares, the native share sheet pre-fills suggested text:

| Share type | Suggested text |
|---|---|
| Milestone | "Just unlocked: [Milestone name]. Learning Arabic of the Quran with Warsh." |
| Surah understood | "I now understand Surah [Name], alhamdulillah. Warsh app." |
| Word | "Today's Arabic word: [Word]. Beautiful, isn't it? Learning with Warsh." |
| Stats | "My Warsh journey: [N] words, [N] day streak, [N] Surahs understood." |

### 7.5 Share analytics

When a user shares:

- Event fires to Mixpanel: `share_completed`
- Properties: `share_type`, `platform` (if detectable — varies by OS)
- Privacy: no content of the share is tracked, just the type

---

## Part 8 — Engagement Display on Profile

### 8.1 Profile stats (Y1, from File 02)

The You tab home shows engagement stats prominently:

```
┌────────────────────────────────┐
│ [Avatar]  [Name]               │
│           Member since [date]  │
│                                │
│ ┌──────┐  ┌──────┐             │
│ │  XP  │  │Streak│             │
│ │ 2540 │  │ 23   │             │
│ └──────┘  └──────┘             │
│                                │
│ ┌──────┐  ┌──────┐             │
│ │Lesson│  │Chptr │             │
│ │ 156  │  │ 19   │             │
│ └──────┘  └──────┘             │
└────────────────────────────────┘
```

Plus additional sections per File 02:
- Speaking stats card
- Vocabulary stats card
- Tadabbur stats card
- Learning time card
- Milestones row
- Streak heatmap

### 8.2 Streak heatmap

GitHub-style contributions calendar:

- 12 months visible (scrollable to see more)
- Each day is a small square
- Color intensity based on activity (per Part 3.8 of this file)
- Tooltip on tap shows: date, lessons completed, XP earned

### 8.3 Learning time tracking

Total time spent learning is tracked per session:

- Time counted from lesson start to lesson exit
- Time counted in SRS review sessions
- Time counted in V5 word detail viewing (if >5 seconds — user is reading the word)
- Time NOT counted in Noor chat, browsing chapter list, settings, etc.

Display formats:
- "23 hours, 45 minutes total"
- "8 hours this week"
- "1 hour, 12 minutes today"

This appears on Y1 as a stat card.

---

## Part 9 — Edge Cases

### 9.1 User changes time zones

- User profile stores `device_locale` and `timezone`
- When timezone changes (detected on app open), the app:
  - Updates the stored timezone
  - Recalculates "today" using the new timezone
  - Streak check uses the new timezone going forward
- A user traveling east → west may get a "bonus day" in their streak (the day stretches)
- A user traveling west → east may "lose" some hours but not lose their streak (the 4 AM rule is generous)
- No special UI shown for timezone changes — they happen silently

### 9.2 User completes daily goal across multiple sessions

- E.g., 5 minutes in the morning + 5 minutes in the evening with a 10-minute goal
- Total daily time is the sum
- Goal hit when sum ≥ goal
- M5 fires once per day (the moment the goal is hit)

### 9.3 User completes multiple lessons in one day

- All count toward daily goal time
- Streak day is maintained
- XP accumulates from each lesson
- Multiple milestones can fire in sequence (e.g., 7-day streak + chapter complete + 100 XP threshold)
- Modal stacking order:
  1. Chapter completion sequence (Close beat continuation)
  2. Milestone modals (M1) — stacked if multiple
  3. Surah understood modal (M6) — if applicable
  4. Daily goal toast (M5) — if applicable, last

### 9.4 User unlocks a milestone on Day 1

- All "first-time" milestones can fire on Day 1
- They fire in sequence as their conditions are met
- After a long onboarding+first-lesson, a user might unlock:
  - First lesson
  - First word in vocabulary bank
  - First SHADOW_REPEAT (if Chapter 1 has one)
  - First daily goal hit
  - First chapter (if user is very fast)
- This is intentionally celebratory — Day 1 should feel rewarding

### 9.5 Notification permissions toggled OFF mid-streak

- App detects on next open
- Streak system continues to function (it's local)
- User sees in-app "Streak at risk" banner (per Part 3.9) instead of relying on push
- No degradation of experience

### 9.6 User's device clock is incorrect

- Streak calculations may be off
- Mitigation: server-side timestamp verification
- Server checks `last_active_at` against client-reported timestamps
- If clock skew is detected, server uses server time
- This prevents users from "cheating" streaks by changing device clock

### 9.7 Milestone retroactive triggering

If we add a new milestone post-launch and existing users have already met its trigger condition:

- Backend script identifies users who already meet the condition
- The milestone is awarded to those users automatically
- M1 modal fires the next time those users open the app
- XP bonus is awarded
- This is how all post-launch milestone additions work

### 9.8 Milestone duplicates

A milestone fires **exactly once per user** for its lifetime:
- Once unlocked, it cannot be re-unlocked
- The system stores `unlocked_at` timestamp per user per milestone
- If conditions are met again, no celebration; no additional XP
- Exception: speaking phrases milestones at 10/50/100/250/500 are tiered — each is a separate milestone

---

## Part 10 — Engagement Metrics

These metrics tell us if the engagement system is working:

### 10.1 Health metrics

| Metric | Target | Why |
|---|---|---|
| Day 1 → Day 2 retention | 50%+ | Did the user come back the next day? |
| Day 1 → Day 7 retention | 30%+ | Did the user complete a week? |
| Day 1 → Day 30 retention | 15%+ | Did the user become a regular? |
| Streak ≥ 7 days achievement rate | 40% of active users | Real consistency proxy |
| Streak ≥ 30 days achievement rate | 15% of active users | Deep commitment proxy |
| Daily goal completion rate (among active users) | 70% | Are goals being hit consistently? |
| First Surah understood within 60 days | 30% of users | The promise of the app being delivered |

### 10.2 Warning signs

If we see these patterns, the engagement system needs review:

- High Day 1 → Day 2 retention but rapid drop after Day 7 → daily goal too aggressive
- Many users hitting 7-day streak then losing it immediately → streak freezes too rare or daily life too disruptive
- Few users completing daily goal even when active → goal setting in onboarding is wrong
- Many users disable notifications → notification copy is annoying

### 10.3 Mixpanel events for engagement

| Event | Fired when | Properties |
|---|---|---|
| `daily_goal_set` | B4 or Settings change | goal_minutes |
| `daily_goal_completed` | M5 fires | day_of_streak |
| `streak_milestone` | 3/7/14/30/100/365 day streak hit | streak_value |
| `streak_lost` | Streak resets to 0 | previous_streak_length |
| `streak_freeze_used` | Auto-freeze applied | streaks_remaining_after |
| `milestone_unlocked` | M1 fires | milestone_id, category |
| `share_initiated` | User taps share | share_type |
| `share_completed` | Native share completes | share_type, platform |
| `notification_received` | Push delivered to device | notification_type |
| `notification_opened` | User taps notification | notification_type |

---

## Part 11 — Future Considerations (Not in v1)

- **Friend system / private leaderboards** — opt-in only, with privacy controls. Out of v1.
- **Family accounts** — parents tracking children's progress. Privacy-sensitive, deferred.
- **Custom milestones** — user-created achievements. Out.
- **Mid-day check-ins** — small in-app prompts ("Quick word review?"). Could feel nagging. Out.
- **Adaptive daily goal** — auto-adjusts based on user behavior. Risk of feeling judgmental. Out.
- **Streak insurance** — paid streak protection. Out (would violate gambling-mechanic policy).
- **XP boost periods** — "Earn 2x XP this weekend!" — too gamified. Out.
- **Daily streak reminders via SMS or email** — privacy/permission complexity. Out.
- **Public profiles** — fundamentally against Warsh's "personal journey" principle. Out indefinitely.

---

## Part 12 — Test Plan

Before launch, manually verify:

- [ ] XP awarded correctly for each lesson type
- [ ] XP count-up animation plays smoothly on Close beat
- [ ] Total XP displayed correctly on Y1
- [ ] Streak starts at 1 after first lesson
- [ ] Streak increments to 2 the next day after another lesson
- [ ] Streak resets to 0 after missing a day (no freezes available)
- [ ] Streak freeze automatically applies when available
- [ ] Earning a streak freeze fires its milestone correctly
- [ ] Streak heatmap renders correctly with various activity patterns
- [ ] Daily goal progress updates in real-time during lesson play
- [ ] Daily goal completion fires M5 toast
- [ ] Goal adjustment in Settings takes effect immediately
- [ ] Streak lost modal appears with empathetic message
- [ ] Returning user after streak loss gets "Returned after a break" milestone
- [ ] Each first-time milestone fires once and only once
- [ ] M1 modal renders correctly for each milestone type
- [ ] Milestone share image generates correctly
- [ ] All milestones screen (Y5) shows earned and unearned correctly
- [ ] Notification permission granted → notifications schedule correctly
- [ ] Daily lesson reminder fires at user-set time
- [ ] Streak at risk notification only fires when streak ≥ 3 and goal not met
- [ ] Word of the Day notification fires once daily
- [ ] Notification copy in user's UI language (English/Urdu)
- [ ] Quiet hours respected (no notifications 10 PM – 6 AM unless user-set)
- [ ] User changes timezone — streak continues correctly
- [ ] Share generates correct image for each entry point
- [ ] Profile stats card accurate
- [ ] Streak heatmap tooltip shows correct day's data
- [ ] Multiple modals stack in correct order (chapter → milestones → Surah → goal)
- [ ] Mixpanel events fire with correct properties

---

## Part 13 — Changelog

**2026-05-19 — v1.0**
- Complete engagement system specified
- XP economy locked
- Streak system with 4 AM day boundary, freezes, and empathetic loss handling
- Daily goal system with 4 commitment levels
- 50+ milestones cataloged across 8 categories
- Push notification types, timing, and Noor-voice copy
- Share mechanics for all entry points
- Profile engagement display
- Edge cases enumerated
- Target engagement metrics defined

---

*End of File 08.*
*Next: File 09 — Ustaad Noor.*
