# Noor — Feature Requirements

> This document defines *what* needs to be built and *why*. It is the source of truth for scope decisions.
> For *how* (implementation steps), see `plan.md`. For *done criteria*, see `validation.md`.

---

## Priority 1 — Curriculum Expansion (Phase 1.5)

### REQ-01: Expand to 10+ Chapters with VOCABULARY Lessons

**Why:** The app runs out of content in ~10 minutes. Retention collapses without enough material.

**Requirements:**
- At least 10 chapters covering: Alphabet → Basic Pronouns → Verbs → Nouns → Quranic Vocabulary → Simple Sentences
- Each chapter must have at least 4–6 lessons
- New lessons must use the VOCABULARY lesson type (5-beat: Hook → Discover → Practice → Reveal → Close)
- Legacy types (FLASHCARD, FILL_BLANK) are acceptable only for chapters already written
- Every lesson must have: hook (Quranic ayah), 2–4 discover cards, 3–5 exercises, reveal ayah with highlighted word
- Exercise types to use: TRUE_FALSE, TAP_TRANSLATION, FILL_BLANK, BUILD_SENTENCE
- `fatihaProgressDelta` should be set on lessons that teach words from Al-Fatiha

**Out of scope:** Audio files, listening exercises, spaced repetition — these are Phase 2.

---

### REQ-02: Fatiha Progress Tracker

**Why:** Al-Fatiha is the most recited surah. Showing users they are learning *its* words is a strong motivational hook.

**Requirements:**
- Visual indicator showing how many unique words of Al-Fatiha the user now understands
- Derived from sum of `fatihaProgressDelta` across completed lessons
- Display on the Profile (You) tab near XP and streak
- Shows as a fraction or progress bar (e.g., "You understand 7 of 29 words in Al-Fatiha")

---

## Priority 2 — Gamification Completion

### REQ-03: Achievement Unlock UI

**Why:** The Achievement model and UserAchievement schema are complete. Without a UI the system is invisible to users.

**Requirements:**
- Toast/banner notification when an achievement is unlocked (triggered after lesson completion)
- Achievement list on the Profile tab showing: icon, title, description, unlock date
- Locked achievements should be visible but greyed out
- First achievements to seed: first lesson completed, 3-day streak, 7-day streak, first chapter completed

---

### REQ-04: Streak Freeze UI

**Why:** `streakFreezes` field exists on Streak model. Without UI, users have no way to use or earn them.

**Requirements:**
- Show freeze count on Profile tab next to streak number
- Allow applying a freeze when a streak is at risk (no activity today, has a freeze available)
- Way to earn freezes: completing bonus lessons or reaching XP milestones

---

## Priority 3 — App Quality

### REQ-05: Token Refresh

**Why:** `/api/auth/refresh` is a stub. Users get silently logged out after 7 days with no explanation.

**Requirements:**
- Backend: accepts valid (or recently expired) JWT, returns new 7-day JWT
- Mobile: Axios 401 interceptor attempts silent refresh, retries original request once
- On refresh failure: clear auth state, redirect to login with a message

---

### REQ-06: Real Splash Screen & App Icon

**Why:** Current assets are placeholder quality. First impression matters for Play Store.

**Requirements:**
- Splash: Noor wordmark (نُور) in Amiri Bold, cream background (#F5F2EA), no busy elements
- Icon: clean نُور on dark (#0F1117) with gold (#9A8F6A) text
- Must meet Android adaptive icon spec

---

## Priority 4 — Future (Phase 2, not current sprint)

| ID | Feature | Blocking on |
|---|---|---|
| REQ-07 | Push notifications (streaks, lesson reminders) | Expo Notifications setup |
| REQ-08 | World map screen (using worldMapX/Y on Chapter) | Enough chapters to feel like a map |
| REQ-09 | Upstash Redis rate limiting | Redis provisioning |
| REQ-10 | Audio / LISTENING lesson type | Audio recording pipeline |
| REQ-11 | Gems economy (spending, shop) | Design of spend/earn rules |
| REQ-12 | iOS build | Apple Developer account |
| REQ-13 | Play Store listing | REQ-06 + sufficient curriculum |
