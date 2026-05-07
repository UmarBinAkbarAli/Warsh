# Noor — Implementation Plan

> This document defines *how* each feature will be built, step by step.
> For *what and why*, see `requirements.md`. For *done criteria*, see `validation.md`.

---

## Active Sprint — Phase 1.5

---

### PLAN-01: Curriculum Expansion (REQ-01)

**File:** `arabai-backend/prisma/curriculum-phase15.cjs`

All content is written as a seed script using the helper functions already defined in that file (`flashcardLesson`, `quizLesson`, VOCABULARY lesson builders). Run with `npm run db:seed` from `arabai-backend/`.

**Steps:**
1. Define chapter data (title, titleAr, description, worldMapX/Y, isLocked)
2. For each chapter, write lessons using VOCABULARY format:
   - `hook`: pick a relevant Quranic ayah where the target word appears
   - `discoverCards`: 2–4 cards introducing the vocabulary
   - `exercises`: mix of TRUE_FALSE, TAP_TRANSLATION, FILL_BLANK, BUILD_SENTENCE
   - `revealText` + `revealAyah`: close the loop by showing the full ayah again
   - Set `fatihaProgressDelta: 1` on any lesson teaching an Al-Fatiha word
3. Add chapters in order — the first chapter (order: 1) should always be `isLocked: false`
4. Run `npm run db:seed` and smoke-test each chapter on device

**Chapter plan:**
| Order | Title | Focus |
|---|---|---|
| 1 | Alphabet | Letters ا–ر (already seeded) |
| 2 | The Names of Allah | الله، رحمن، رحيم (Al-Fatiha words) |
| 3 | Pronouns | هو، هي، أنا، أنتَ |
| 4 | This & That | هذا، ذلك، هذه |
| 5 | The Quran's Language | كتاب، قرآن، آية، سورة |
| 6 | People & Family | رجل، امرأة، ولد، بنت |
| 7 | Simple Nouns | بيت، مسجد، كتاب، قلم |
| 8 | Verbs Intro | قال، كان، جاء، ذهب |
| 9 | Al-Fatiha Deep Dive | All 29 words, verse by verse |
| 10 | Simple Sentences | Subject–Predicate (جملة اسمية) |

---

### PLAN-02: Fatiha Progress Tracker (REQ-02)

**Backend:**
- `GET /api/progress` already returns completed lessons
- Add `fatihaWordsLearned` to the response: sum of `fatihaProgressDelta` across completed lessons (join Progress → Lesson, filter `completed: true`, sum `fatihaProgressDelta`)
- Total words in Al-Fatiha: 29 (hardcode as constant)

**Mobile (`arabai-app/app/(app)/(tabs)/profile.tsx`):**
- Read `fatihaWordsLearned` from the progress API response
- Add a new card between XP and the logout button:
  ```
  Al-Fatiha Progress
  [████████░░░░░░░░░] 7 / 29 words
  "You now understand 7 words of Al-Fatiha"
  ```
- Use `Colors.accent.gold` for the progress bar fill, `Colors.bg.surface` for the track

---

### PLAN-03: Achievement Unlock UI (REQ-03)

**Backend (`/api/lessons/[id]/complete`):**
- After recording Progress, check achievement unlock conditions:
  - `first_lesson`: user has exactly 1 completed lesson now
  - `streak_3`: currentStreak >= 3
  - `streak_7`: currentStreak >= 7
  - `first_chapter`: all lessons in a chapter are completed
- For each unlocked achievement, upsert a UserAchievement row
- Return `unlockedAchievements: Achievement[]` in the completion response

**Mobile:**
- On lesson close screen (`renderClose`), if `completionResult.unlockedAchievements` is non-empty, show a badge/toast above the XP text
- Profile tab: add an "Achievements" section listing all UserAchievements; locked achievements greyed out

---

### PLAN-04: Streak Freeze UI (REQ-04)

**Backend (`/api/streak`):**
- Extend GET response to include `streakFreezes`
- Add `POST /api/streak/freeze` — decrements streakFreezes by 1 if > 0 and user missed yesterday; updates lastActiveDate to today

**Mobile (profile.tsx):**
- Show freeze count as an icon (e.g., ❄ ×2) next to the streak number
- If streak is at risk (lastActiveDate is yesterday) and freezes > 0, show "Use Freeze" button

---

### PLAN-05: Token Refresh (REQ-05)

**Backend (`/api/auth/refresh/route.ts`):**
- Accept `Authorization: Bearer <token>` — verify with `ignoreExpiration: true`
- If token was valid (just expired), sign and return a new 7-day token
- If token is invalid (tampered, wrong secret), return 401

**Mobile (`services/api.ts`):**
- Add Axios response interceptor:
  1. On 401, call `POST /api/auth/refresh` with current token
  2. On success: update token in Zustand store + AsyncStorage, retry original request
  3. On failure: call `logout()`, redirect to `/(auth)/login`
- Guard against infinite retry loops (flag `_retried` on request config)

---

### PLAN-06: Splash Screen & App Icon (REQ-06)

**Files to edit:**
- `arabai-app/app.json` — `splash.image`, `icon`, `android.adaptiveIcon`
- `arabai-app/assets/` — place new PNG assets here

**Steps:**
1. Create splash image: 1242×2688px, #F5F2EA background, نُور centred in Amiri Bold at ~200px
2. Create icon: 1024×1024px, #0F1117 background, نُور in gold (#9A8F6A)
3. Create adaptive icon foreground: same as icon but on transparent background
4. Update `app.json` paths
5. Run `expo start` and verify splash + icon on device

---

## Dependency Order

```
PLAN-01 (curriculum)  ← no dependencies, start immediately
PLAN-02 (fatiha)      ← needs PLAN-01 (fatihaProgressDelta values in lessons)
PLAN-03 (achievements)← needs backend lesson complete route change
PLAN-04 (freezes)     ← independent, can run alongside PLAN-03
PLAN-05 (token refresh) ← independent, can run any time
PLAN-06 (assets)      ← independent, design work
```
