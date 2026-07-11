# Warsh · وَرْش — App Specification
## File 03: Onboarding & Authentication

**Status:** Locked
**Version:** 1.0
**Last updated:** 2026-05-19
**Depends on:** File 01 (Identity & Principles), File 02 (Information Architecture)

> This file specifies every screen the user sees before they reach the main app — the preview experience, onboarding flow, authentication, and permission asks. Every screen has complete copy in English (Urdu translations handled as a separate content task — see File 11).

---

## 1. Entry points

A user reaches one of three states on app open:

1. **First-ever launch** — They've never installed Warsh before. They go through the preview experience, then onboarding, then account creation.
2. **Returning user with no session** — They've installed before but are logged out (new device, cleared data, manually logged out). They see the login screen.
3. **Returning user with active session** — They've logged in before and their session is still valid. They go directly to the Learn tab.

The app determines which state on launch:
- Check for an existing JWT token in secure storage
- If present and valid → state 3
- If present but expired → state 2 (with "Welcome back" framing)
- If absent and `has_seen_preview` flag set → state 2 (without "welcome back")
- If absent and `has_seen_preview` flag not set → state 1

---

## 2. Splash screen (A0)

**Appears:** On every app launch, briefly.

**Duration:** Maximum 2 seconds. If the app is ready sooner, the splash dismisses immediately.

**Contents:**

- Centered Warsh logo (`Warsh · وَرْش` lockup in Gold on Parchment background)
- Subtle fade-in animation on the Arabic text (the dot of وَرْش illuminates last)
- No spinner, no progress bar
- No text below the logo

**Background:** Solid Parchment with a subtle, almost imperceptible geometric motif (the Warsh seal pattern from the brand SOT).

**Transitions to:**
- First-time user → A1
- Returning user (logged out) → C1
- Returning user (logged in) → L1 (Learn home)

**Implementation note:** Use Expo SplashScreen with a static image asset. Hide it programmatically once auth state and language preference are loaded.

---

## 3. Preview experience (A1–A7)

The preview replaces the old "first lesson free" idea. It's a 3-minute guided demonstration of what Warsh is, designed to make the user *feel* the product's promise — not just learn what it does.

### Design principles for the preview

- **Emotional, not informational.** Show, don't tell.
- **Use a familiar ayah.** The user has likely heard it before.
- **No friction.** No taps required to advance unless necessary. Auto-advance with gentle pacing.
- **Skippable, but skipping is rare.** A small "Skip preview" link in the top-right of every preview screen for users who already know what they want.
- **Estimated runtime: 2–3 minutes.**

### Why the preview matters

The preview is the single most important conversion moment in Warsh. A user who finishes the preview should think:

> "I have to see what this is like for real."

If the preview is forgettable, the entire funnel collapses. So this gets disproportionate design attention.

### A1 — Preview welcome

**Layout:** Full-screen parchment background. Centered content.

**Contents:**

- Warsh logo (small, top)
- Headline: "Let me show you what Warsh is."
- Sub-line (smaller): "Three minutes. No signup yet."
- Single button: "Begin →"
- "Skip preview" link in top right (small, easy to ignore)

**Copy variations:** None for v1. Same copy in English mode and Urdu mode (with translation).

**Auto-advance:** None. User taps "Begin →".

**Transitions to:** A2

---

### A2 — Preview Hook

**Layout:** Full-bleed parchment background with subtle motif.

**Contents:**

- Top: small caption — "First, listen."
- Center: the ayah `إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ` (Surah Al-Kawthar, ayah 1)
  - Displayed in large Scheherazade New, Gold harakat
  - Audio plays automatically (high-quality recitation, not TTS)
  - Subtle audio waveform animation under the ayah
- Reference below: "Surah Al-Kawthar · 108:1"
- No translation visible yet
- Bottom: caption fades in after audio completes — "You've heard this many times."
- "Continue →" button appears after audio completes

**Auto-advance:** Manual tap after audio completes.

**Transitions to:** A3

---

### A3 — Preview Discover

**Layout:** Full-screen parchment.

**Contents:**

- Top: caption — "Now, the first word."
- Center: `إِنَّا` displayed huge (Scheherazade New, Gold)
- Audio play button (taps to replay this word's audio)
- Below: transliteration "innā"
- A small "Tap to reveal meaning" affordance
- User taps:
  - Animation reveals translation "Indeed, We" (animated fade with a gentle gold underline)
  - "Continue →" button appears

**Auto-advance:** Manual.

**Transitions to:** A4

---

### A4 — Preview Grammar Reveal

**Layout:** Full-screen parchment.

**Contents:**

- Top: caption — "And here's something hidden in plain sight."
- Center: the ayah `إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ` shown again
- Below the ayah, in smaller text: a teaching note
  > "إِنَّا is `إِنَّ` (a particle of emphasis) + `نَا` (we). Allah is emphasizing — *truly*, We have given."
- A small note: "This is what Warsh does. It shows you what's already there."
- "Continue →" button

**Auto-advance:** Manual.

**Transitions to:** A5

---

### A5 — Preview Noor intro

**Layout:** Full-screen parchment.

**Contents:**

- Top: Noor avatar/illustration (small, gentle)
- Center: chat-style message bubble from Noor:
  > "As-salamu alaykum.
  >
  > I am Ustaad Noor. I will be your teacher. We will go word by word, ayah by ayah, until what you recite becomes what you understand.
  >
  > In shaa Allah."
- Audio plays the message in Noor's voice (gentle, scholarly TTS or recorded)
- "Continue →" button

**Auto-advance:** Manual.

**Transitions to:** A6

---

### A6 — Preview Tadabbur teaser

**Layout:** Full-screen parchment.

**Contents:**

- Top: caption — "And here's where you're going."
- Center: an animated visualization of a Surah's words being illuminated one by one (a Tadabbur preview)
  - Show Surah An-Nas with words gradually turning from Sage (dim) to Ink and then Gold (mastered) one by one
  - Subtle audio in background — gentle bell or chime as each word lights up
- Below: caption — "Word by word, Surah by Surah, the Quran becomes yours."
- "Continue →" button

**Auto-advance:** Manual (after animation completes, ~5 seconds).

**Transitions to:** A7

---

### A7 — Preview Close (CTA)

**Layout:** Full-screen parchment with subtle Gold radiance from center.

**Contents:**

- Warsh logo (centered, slightly larger than splash)
- Headline: "Begin your journey."
- Sub-line: "Seven days free. Then $1/month, or $10/year. Less than a cup of chai."
- Primary button: "Begin →" (Gold, full width)
- Secondary text link: "I already have an account"

**Copy is honest and direct.** No pressure, no urgency tactics, no "Limited time offer."

**Transitions to:**
- "Begin →" → B0 (onboarding)
- "I already have an account" → C2 (login)

**Important:** The `has_seen_preview` flag is set to `true` at this point. Even if the user closes the app without continuing, the preview won't replay next launch.

---

## 4. Onboarding flow (B0–B9)

After the preview, the user goes through onboarding. The goal of onboarding is to:

1. Establish the user's language preference (English or Urdu UI)
2. Understand their goal and motivation
3. Place them at the right level in the curriculum
4. Set their daily commitment
5. Get basic info (name)
6. Run a quick placement quiz
7. Show them their personalized path
8. Create their account
9. Request necessary permissions

The flow is **linear** with **no back-skipping past completed steps**. Each step has a "Back" button to the previous step, but not all the way back to the preview.

### B0 — Language picker

**Layout:** Full-screen parchment.

**Contents:**

- Top: caption (bilingual) — "Choose your language / اپنی زبان منتخب کریں"
- Two large tappable cards stacked vertically:
  - Card 1: "English" with sub-line "I prefer English"
  - Card 2: "اردو" with sub-line "میں اردو ترجیح دیتا/دیتی ہوں"
- Below: small caption: "You can change this later in settings."

**No "Continue" button.** Tapping a card both selects and advances.

**Effect of selection:** Locks the rest of onboarding (and the rest of the app) in the chosen language. User can change later in settings.

**Transitions to:** B1

---

### B1 — Welcome

**Copy in English mode:**
> Headline: "As-salamu alaykum"
> Sub-line: "Welcome to Warsh."
> Body (smaller):
> *"You're about to begin a journey that changes how you experience the Quran, salah, and the language of revelation."*
> *"Let's get to know you first."*

**Copy in Urdu mode:** (full translation, locked in File 11)

**Single button:** "Continue →"

**Transitions to:** B2

---

### B2 — Goal selection

**Headline:** "Why are you learning Arabic?"

**Sub-line:** "Pick what's closest. No wrong answer."

**Options (tappable cards, single-select):**

1. **To understand the Quran**
   - "I recite but don't yet understand."
2. **To deepen my Salah**
   - "I want to know what I'm saying when I pray."
3. **To study Islamic scholarship**
   - "Hadith, tafsir, classical texts."
4. **To speak with Arabic speakers**
   - "In religious or scholarly settings."
5. **All of the above**
   - "Every reason matters."

**Selection behavior:** Single-select. Selected card gets a Gold border and check icon.

**Continue button:** Disabled until a selection is made. Once made, "Continue →" enables.

**This selection feeds:** the system prompt for Noor (so Noor knows the user's stated goal), and the user's profile.

**Transitions to:** B3

---

### B3 — Level selection

**Headline:** "What's your current level?"

**Sub-line:** "Be honest. We'll adjust if needed."

**Options (tappable cards, single-select):**

1. **New to Arabic** (`NEW_TO_ARABIC`)
   - "I don't know the alphabet yet."
2. **I know the alphabet** (`KNOWS_ALPHABET`)
   - "I can recognize letters but can't read words fluently."
3. **I can read the Quran** (`CAN_READ_QURAN`)
   - "I read Quran in Arabic but don't understand most of it."
4. **I've studied grammar before** (`STUDIED_GRAMMAR_BEFORE`)
   - "I've taken Arabic courses but want to deepen or refresh."

**Selection behavior:** Single-select. Each option corresponds to a starting point in the curriculum (defined in File 05).

**Continue button:** "Continue →"

**Transitions to:** B4

---

### B4 — Daily commitment

**Headline:** "How much time can you spend daily?"

**Sub-line:** "Steady wins. Even 5 minutes a day adds up."

**Options (tappable cards, single-select):**

1. **5 minutes** (`5_MIN`)
   - "Casual — I'll squeeze it in."
2. **10 minutes** (`10_MIN`)
   - "Comfortable — I have a real window."
3. **15 minutes** (`15_MIN`)
   - "Committed — this is a priority."
4. **30 minutes or more** (`30_MIN_PLUS`)
   - "Serious — I'm here to finish this."

**Continue button:** "Continue →"

**This selection determines:**
- Daily goal (used for daily goal progress bar)
- Streak protection logic
- Suggested reminder time (defaults to evening; user can adjust later)

**Transitions to:** B5

---

### B5 — Name input

**Headline:** "What should we call you?"

**Sub-line:** "Noor will use this from time to time."

**Field:** Text input, max 30 characters, accepts any Unicode (Arabic name input supported)

**Validation:** Cannot be empty. Cannot be just whitespace. No special character restrictions beyond that.

**Continue button:** "Continue →" (disabled until field has at least 1 character)

**Privacy note (small text below field):** "Only you and Noor see this."

**Transitions to:** B6

---

### B6 — Placement quiz

A short quiz (3–5 questions) that confirms the level the user selected in B3, or recommends adjustment if their actual ability differs from their self-report.

**Headline:** "Quick check — let's see where to begin."

**Sub-line:** "Three or four questions. No grades, just placement."

**Quiz structure:**

The quiz adapts based on the level selected in B3.

- **If `NEW_TO_ARABIC`:** Show 1 question to confirm ("Can you read this letter?"). If yes, user might be `KNOWS_ALPHABET`. If no, confirm starting fresh.
- **If `KNOWS_ALPHABET`:** Show 2–3 letter recognition questions. If user struggles, suggest starting earlier.
- **If `CAN_READ_QURAN`:** Show 2–3 word-reading questions. If user can read fluently, suggest moving to next level.
- **If `STUDIED_GRAMMAR_BEFORE`:** Show 3–4 grammar identification questions. If user breezes through, confirm advanced placement.

**Each question is a tap-based multiple choice** (no typing, no audio recording during placement). Simple, fast.

**Question UI:**
- Question text at top
- 4 options as tappable cards
- No "Submit" button — tap an option to immediately advance
- No feedback on correctness during the quiz (we just observe)

**After all questions:**
- If user's performance matches their selected level → confirm placement
- If performance suggests a different level → show a recommendation screen:
  > "Based on your answers, we recommend starting at [Level X]."
  > Buttons: "Yes, start there" / "I'll start where I chose"

**Transitions to:** B7

**Note:** Specific quiz questions are defined in File 05 (Curriculum) since they depend on chapter content.

---

### B7 — Ready screen

**Headline:** "Here is your path."

**Sub-line:** Personalized — uses the user's name.
> "[Name], you'll begin at Chapter [N]. You've chosen [daily commitment]."

**Visual:** A stylized illustration of a path winding through pages, with the user's starting chapter marked with a Gold dot.

**Below the visual:**
- Starting chapter Arabic + English title
- Total chapters in their path
- Estimated completion time at their daily commitment
- Daily goal: "[X] minutes per day"

**Encouragement message:**
> "Take your time. Steady steps make scholars."

**Single button:** "Create my account →"

**Transitions to:** B8

---

### B8 — Account creation

**Headline:** "Almost there."

**Sub-line:** "Create your account to begin."

**Fields:**

1. Email
   - Validation: valid email format, not already registered
2. Password
   - Validation: minimum 8 characters
   - Show/hide toggle
   - Strength indicator (simple: weak / good / strong)
3. Confirm password
   - Must match password

**Below fields:**
- Small text: "By creating an account you agree to our [Terms] and [Privacy Policy]."
- Links open as in-app webview to the legal pages

**Single button:** "Create account →"

**Behavior on tap:**
- Validation runs
- If valid: API call to create account
- On success: JWT received, stored securely, user proceeds to B9
- On failure: inline error message under the relevant field

**Error states:**
- Email already in use: "This email is already registered. [Log in instead]?"
- Network error: "Couldn't reach the server. Try again?"
- Password too weak: "Use at least 8 characters."

**Transitions to:** B9

**Note:** This is where the 7-day trial timer starts. Server records `trial_start_at = now()`.

---

### B9 — Permissions ask

**Layout:** Multi-step within a single screen, with two cards stacked.

**Headline:** "One more thing."

**Sub-line:** "These help Warsh work better for you."

**Card 1 — Notifications**

- Icon: a gentle bell
- Title: "Daily reminders"
- Body: "We'll remind you when it's time for today's lesson. You can change this anytime."
- Single button: "Allow notifications"
- Secondary text link: "Not now"
- On tap: trigger native OS notification permission prompt
- After response (allow or deny), card shows confirmation state ("On" / "Off — change in settings")

**Card 2 — Microphone**

- Icon: a gentle mic
- Title: "Speaking practice"
- Body: "Some lessons let you practice speaking. Your recordings stay on your device — we don't store them."
- Single button: "Allow microphone"
- Secondary text link: "Not now"
- On tap: trigger native OS microphone permission prompt
- After response, card shows confirmation state

**Below both cards:**
- Single button: "Begin →" (always enabled — permissions are optional, not required)

**Transitions to:** L1 (Learn home — the first time)

**Important on first entry to L1:** A subtle "Welcome to Warsh, [Name]" toast appears briefly, then dismisses. The user is now in the app.

---

## 5. Returning user flow (C1–C4)

For users who already have an account.

### C1 — Login or signup choice

This screen appears if the user opens the app having seen the preview before but isn't logged in.

**Layout:** Centered.

**Contents:**

- Warsh logo
- Headline: "Welcome back"
- Two buttons:
  - "Log in" (primary, Gold)
  - "I'm new — show me Warsh" (secondary text link → routes back to A1)

**Note:** If `has_seen_preview = true`, this screen is shown. If `false`, A1 is shown instead.

**Transitions to:**
- "Log in" → C2
- "I'm new" → A1

---

### C2 — Login

**Headline:** "Log in to continue."

**Fields:**

1. Email
2. Password (with show/hide toggle)

**Below fields:**
- "Forgot password?" link → C3

**Single button:** "Log in →"

**Behavior on tap:**
- Validation runs
- API call to authenticate
- On success: JWT received, stored, user proceeds to L1
- On failure: error message
  - "Email and password don't match"
  - "No account found with that email"
  - "Network error. Try again?"

**Below button:**
- Small text: "Don't have an account? [Sign up]" → routes to A1

**Transitions to:**
- Success → L1
- Forgot password → C3

---

### C3 — Forgot password

**Headline:** "Reset your password"

**Sub-line:** "Enter your email. We'll send you a link."

**Field:** Email

**Single button:** "Send reset link →"

**Behavior on tap:**
- Validation: valid email format
- API call to backend
- On success: routes to C4
- On failure: same patterns as login error states

**Transitions to:** C4

---

### C4 — Forgot password confirmation

**Headline:** "Check your email."

**Sub-line:** "We sent a reset link to [email]. Tap the link to set a new password."

**Single button:** "Back to login →" (routes to C2)

**Below button:**
- "Didn't receive it? [Resend]" link

**Note:** The actual password reset happens via a web-based deep link from the email. The user clicks the link, lands on a web page (hosted on the backend), sets new password, then returns to the app and logs in normally.

---

## 6. Subscription paywall flow

The paywall does not have its own dedicated entry point in onboarding — the user signs up free for the 7-day trial. The paywall (Y4) appears when:

1. The trial expires (7 days from account creation)
2. The user has completed Chapter 1 (whichever comes first)
3. The user manually navigates to "Manage subscription" from settings
4. The user taps a paywalled feature after trial expiration

In all cases, the user lands on screen `Y4` (defined in File 02). The full subscription specification is in File 10.

---

## 7. Permissions — handling denials

If the user denies a permission during B9 or at any later prompt:

### Notifications denied

- App functions normally
- Settings screen shows "Notifications: Off" with a link: "Enable in system settings"
- Tapping the link opens the OS settings app to Warsh's app settings page
- No nagging or repeated prompts

### Microphone denied

- App functions normally
- When user reaches a SHADOW_REPEAT exercise:
  - Show `M3` modal (microphone permission ask in-context)
  - If user denies again, that exercise auto-skips with a small note: "Skipped — microphone access needed for speaking practice"
  - Settings screen shows "Microphone: Off" with link to system settings

### What we never do

- Block the user from progressing if a permission is denied
- Show repeated permission prompts in the same session
- Reduce app functionality beyond what depends on that specific permission

---

## 8. Data captured during onboarding

By the time onboarding completes, the user record has:

| Field | Source | Type | Required |
|---|---|---|---|
| `ui_language` | B0 | enum: `en` / `ur` | yes |
| `goal` | B2 | enum: 5 options | yes |
| `self_reported_level` | B3 | enum: 4 levels | yes |
| `daily_commitment_minutes` | B4 | enum: 5 / 10 / 15 / 30 | yes |
| `name` | B5 | string (max 30 chars) | yes |
| `placement_quiz_results` | B6 | JSON object | yes |
| `actual_starting_chapter` | B6 (derived) | int | yes |
| `email` | B8 | string (unique) | yes |
| `password_hash` | B8 | string | yes |
| `trial_start_at` | B8 (auto) | timestamp | yes |
| `notifications_permission` | B9 | enum: `granted` / `denied` / `not_asked` | yes |
| `microphone_permission` | B9 | enum: `granted` / `denied` / `not_asked` | yes |
| `device_locale` | auto | string | yes |
| `created_at` | auto | timestamp | yes |
| `has_seen_preview` | flag | bool | yes |

These fields are referenced extensively in File 12 (Data Model).

---

## 9. Onboarding state persistence

The onboarding flow can be interrupted and resumed.

### What's persisted locally (AsyncStorage)

- Current onboarding step (B0–B9)
- All field values entered so far

### Resume behavior

If user closes the app mid-onboarding and reopens:
- App reads stored step
- Routes user back to that step
- Pre-fills any fields they'd already entered
- Continues from there

### Reset behavior

If user reaches B8 (account creation) and fails repeatedly, or explicitly taps "Start over":
- All onboarding state is cleared
- User returns to A1 (or B0 if they want to keep their preview-seen flag)

### Special case — preview completion

The `has_seen_preview` flag is set in A7. Once set, it persists permanently on the device unless the user clears app data. This prevents the preview from showing twice.

---

## 10. Edge cases

### Edge case 1: User taps "Skip preview" in A1–A6

- All preview-completion flags are skipped
- User goes directly to A7 (Close / CTA) — they still see the offer
- Tapping "Begin" from A7 proceeds normally to B0

### Edge case 2: User abandons onboarding at B6 (placement quiz)

- Their quiz results so far are saved
- On resume, they continue from the question they left off
- If they don't return for 7+ days, full reset (clear quiz, restart from B6 question 1)

### Edge case 3: User abandons at B8 (account creation) without submitting

- Their pre-account onboarding data is held locally
- No server-side record exists yet
- On resume, they return to B8 with previously entered data pre-filled (except passwords, never persisted in plain)

### Edge case 4: User successfully creates account but fails B9 (permissions)

- Account already exists
- They are routed forward to L1 anyway (permissions are optional)
- Settings later shows the denied permissions with options to enable

### Edge case 5: User installs on a new device

- They are not the "first launch" state because they've already seen preview on the old device — but the new device has no `has_seen_preview` flag
- They will see the preview again on the new device
- This is acceptable. The preview is short and serves as a brand refresher.

### Edge case 6: User signs up, then tries to sign up again with the same email

- B8 returns error "Email already in use. [Log in instead]?"
- Tapping "Log in instead" routes them to C2 with email pre-filled

### Edge case 7: User selects Urdu in B0 but device locale is something else entirely

- App functions in Urdu regardless of device locale
- All translated strings load from `ur.json`
- Date/time formatting uses device locale (unless explicitly overridden)

### Edge case 8: User's password reset link expires

- Web-based reset page shows error and offers to send a new link
- User can request resend, which generates a fresh token

### Edge case 9: User completes onboarding, then immediately loses internet

- They are routed to L1 anyway
- L1 shows offline indicator (`M8`)
- Their progress is saved locally and syncs when reconnected

---

## 11. Onboarding analytics events

These events fire and are sent to Mixpanel (when network is available):

| Event | When fired | Properties |
|---|---|---|
| `preview_started` | A1 mounted | — |
| `preview_skipped` | "Skip preview" tapped | step (A1–A6) |
| `preview_completed` | A7 mounted | — |
| `cta_begin_tapped` | A7 "Begin" tap | — |
| `cta_login_tapped` | A7 "I already have account" tap | — |
| `onboarding_step_completed` | Each B step completed | step (B0–B9), time on step |
| `onboarding_step_back` | Back tapped from any B step | from_step, to_step |
| `language_selected` | B0 selection | language (`en` / `ur`) |
| `goal_selected` | B2 selection | goal value |
| `level_selected` | B3 selection | level value |
| `daily_commitment_selected` | B4 selection | minutes value |
| `placement_completed` | B6 completed | self_reported_level, recommended_level, accepted_recommendation (bool) |
| `account_created` | B8 success | — |
| `account_creation_failed` | B8 error | error_type |
| `permission_granted` | B9 grant | permission (notif / mic) |
| `permission_denied` | B9 deny | permission (notif / mic) |
| `onboarding_completed` | L1 first mount | total_duration_seconds |

These give us a complete funnel view: how many users open the app → see the preview → start onboarding → complete each step → finish.

---

## 12. Critical metrics

The metrics that matter most from this flow:

| Metric | Target | What it measures |
|---|---|---|
| Splash to A1 completion | 95%+ | App loads correctly |
| Preview start to completion | 70%+ | Preview is engaging enough to watch |
| Preview completion to CTA tap | 80%+ | The preview converts at the end |
| CTA tap to account creation | 60%+ | Onboarding doesn't lose people |
| Account creation to L1 entry | 95%+ | Onboarding tail (permissions) doesn't break |

Overall **install → registered user** target: **40%**

This is consistent with the conversion targets in File 01 Section 14.

---

## 13. Copy in Urdu — translation note

Every English string in this file has an Urdu counterpart. The full Urdu translations are captured in File 11 (Design System & Copy).

A user who selects Urdu in B0:
- Sees Urdu copy on every subsequent screen (B1–B9 and beyond)
- Sees Urdu in the preview if they later re-encounter it (rare edge case)
- Has Arabic content (ayat, vocabulary words) shown identically in both UI modes

The preview (A1–A7) is shown in **English by default before B0** because language hasn't been selected yet. The preview is so short and primarily visual/audio that this is acceptable. Alternatively, we could detect device locale and show preview in the device language. **Locked default: English preview, switch to user-selected language post-B0.**

If user feedback shows this is a friction point for Urdu speakers, we can:
1. Add a tiny language toggle in the top corner of A1
2. Detect device locale and pre-localize the preview

This is a v1.1 improvement, not v1 blocker.

---

## 14. Accessibility for onboarding

All onboarding screens follow the baseline accessibility standards from File 02 Section 19, plus:

- All input fields have visible labels (not placeholder-only)
- Error messages are announced to screen readers
- Focus order is logical (top to bottom, left to right)
- Permission prompts are described in clear language, not technical jargon
- Skip-preview link is reachable via keyboard navigation (when applicable)
- Audio in preview has visual representation (waveform + caption)

---

## 15. Test plan for onboarding

Before launch, manually test:

- [ ] Complete first-time flow (A0 → A7 → B0 → B9 → L1)
- [ ] Complete flow with each level option in B3
- [ ] Complete flow with each daily commitment option in B4
- [ ] Complete flow with Arabic/Urdu name in B5
- [ ] Skip preview at each of A1–A6
- [ ] Quit app at every step, reopen, verify resume behavior
- [ ] Network failure during B8 — verify retry works
- [ ] Already-registered email at B8 — verify routing to C2 with prefill
- [ ] Deny notifications in B9 — verify settings shows correct status
- [ ] Deny microphone in B9 — verify SHADOW_REPEAT auto-skip behavior later
- [ ] Forgot password flow C3 → C4 → email → web → C2 login
- [ ] Login with wrong password — verify error
- [ ] Login with non-existent email — verify error
- [ ] Switch from English to Urdu in B0 — verify all subsequent screens translate
- [ ] Complete full flow in Urdu — verify no English strings appear
- [ ] First app open after install — verify preview shown
- [ ] Second app open after install — verify preview NOT shown
- [ ] Reinstall app — verify preview shown again
- [ ] Log out — verify routing to C1 not A1

---

## 16. Changelog

**2026-05-19 — v1.0**
- Complete onboarding flow specified
- Preview experience (A1–A7) defined with emotional design principles
- Onboarding sequence (B0–B9) with all field validation
- Returning user / auth flow (C1–C4) defined
- Permissions handling specified
- Edge cases enumerated
- Analytics events and critical metrics defined

---

*End of File 03.*
*Next: File 04 — Lesson System.*
