# Noor — Validation Criteria

> This document defines *when a feature is done*. A feature is not complete until all its checks pass.
> For *what to build*, see `requirements.md`. For *how to build it*, see `plan.md`.

---

## VAL-01: Curriculum Expansion

**Seed & data checks:**
- [ ] `npm run db:seed` completes without error
- [ ] `npm run db:studio` shows 10+ chapters, each with 4–6 lessons
- [ ] All new lessons have `type: VOCABULARY`
- [ ] Every VOCABULARY lesson has non-null: `hook`, `discoverCards` (2+ entries), `exercises` (3+ entries), `revealText`, `revealAyah`
- [ ] Al-Fatiha word lessons have `fatihaProgressDelta >= 1`
- [ ] Chapter order 1 is `isLocked: false`; all others default `isLocked: true`

**On-device checks:**
- [ ] Learn tab shows all 10+ chapters
- [ ] Completing all lessons in chapter N unlocks chapter N+1
- [ ] Each VOCABULARY lesson plays through all 5 beats without crashing
- [ ] BUILD_SENTENCE exercises accept correct answers and reject wrong ones
- [ ] XP is awarded on lesson completion
- [ ] Streak increments on first lesson of the day

---

## VAL-02: Fatiha Progress Tracker

**Backend:**
- [ ] `GET /api/progress` response includes `fatihaWordsLearned` (integer, 0 when no lessons completed)
- [ ] After completing a lesson with `fatihaProgressDelta: 1`, `fatihaWordsLearned` increments by 1
- [ ] Replaying a completed lesson does not double-count (upsert, not insert)

**On-device:**
- [ ] Profile tab shows Al-Fatiha progress card
- [ ] Progress bar fills correctly relative to 29 total words
- [ ] Shows "0 / 29" for a brand new user
- [ ] Text updates correctly after completing a Fatiha-linked lesson

---

## VAL-03: Achievement Unlock UI

**Backend:**
- [ ] Completing the first lesson returns `unlockedAchievements` with the `first_lesson` achievement
- [ ] Reaching a 3-day streak returns `unlockedAchievements` with `streak_3`
- [ ] Completing all lessons in a chapter returns `first_chapter` achievement
- [ ] Replaying a completed lesson does NOT re-trigger already-unlocked achievements

**On-device:**
- [ ] Achievement badge/toast appears on the lesson close screen when one is earned
- [ ] Profile tab shows an Achievements section
- [ ] Locked achievements are visible but greyed out
- [ ] Unlocked achievements show the unlock date

---

## VAL-04: Streak Freeze UI

**Backend:**
- [ ] `GET /api/streak` returns `streakFreezes` count
- [ ] `POST /api/streak/freeze` with 0 freezes returns 400
- [ ] `POST /api/streak/freeze` when not at risk (activity today) returns 400
- [ ] `POST /api/streak/freeze` with valid freeze decrements count by 1 and preserves streak

**On-device:**
- [ ] Profile tab shows freeze count next to streak
- [ ] "Use Freeze" button appears only when streak is at risk and freezes > 0
- [ ] After using a freeze, count decrements and button disappears

---

## VAL-05: Token Refresh

**Backend:**
- [ ] `POST /api/auth/refresh` with a valid, non-expired token returns a new token
- [ ] `POST /api/auth/refresh` with an expired-but-valid token returns a new token
- [ ] `POST /api/auth/refresh` with a tampered token returns 401

**Mobile:**
- [ ] Making an authenticated request 8 days after login succeeds silently (refresh happens in background)
- [ ] After refresh, all subsequent requests use the new token
- [ ] If refresh fails, user lands on login screen with a session-expired message
- [ ] No infinite retry loop: a single 401 on the refresh itself does not trigger another refresh

---

## VAL-06: Splash Screen & App Icon

- [ ] Splash screen appears on cold start with نُور centred on cream background
- [ ] No layout shift or white flash before splash loads
- [ ] App icon shows on home screen with correct design (not generic Expo icon)
- [ ] Android adaptive icon displays correctly (no clipping of text)
- [ ] `expo start` does not produce asset-related warnings

---

## Regression Checks (run after every sprint)

These must pass after any change:

| Check | How to verify |
|---|---|
| Register → Login → Onboarding flow works | Fresh install, create account, complete onboarding |
| Chapter list loads and locks correctly | Learn tab, confirm chapter 1 unlocked, chapter 2 locked until chapter 1 done |
| VOCABULARY lesson plays all 5 beats | Pick any VOCABULARY lesson, tap through to close screen |
| XP and streak update after lesson | Check Profile tab immediately after completing a lesson |
| AI chat sends and receives | Chat tab, send a message, confirm reply appears |
| Chat history persists | Leave chat tab and return, confirm messages still shown |
| Logout works | Profile tab → Log Out, lands on landing screen, auth cleared |
