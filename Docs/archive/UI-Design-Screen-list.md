# Warsh — UI Screen Inventory

**Last updated:** 2026-05-27
**Source of truth:** `Docs/warsh-spec-02-information-architecture.md`
**Total spec screens:** ~62 | **Built:** ~57 | **Unbuilt:** 1 (A0 splash animation)

---

## Built Screens (57)

### Auth / Pre-login (22)

| # | Screen | Spec ID | File |
|---|---|---|---|
| 1 | Landing / Root | — | `app/index.tsx` |
| 2 | Auth Options | C1 | `app/(auth)/auth-options.tsx` |
| 3 | Login | C2 | `app/(auth)/login.tsx` |
| 4 | Register / Account Creation | B8 | `app/(auth)/register.tsx` |
| 5 | Forgot Password | C3 | `app/(auth)/forgot-password.tsx` |
| 6 | Forgot Password Confirmation | C4 | `app/(auth)/forgot-password-confirm.tsx` |
| 7 | Reset Password (deep-link target) | — | `app/(auth)/reset-password.tsx` |
| 8 | Preview — Welcome | A1 | `app/(auth)/preview/a1-welcome.tsx` |
| 9 | Preview — Hook | A2 | `app/(auth)/preview/a2-hook.tsx` |
| 10 | Preview — Discover | A3 | `app/(auth)/preview/a3-discover.tsx` |
| 11 | Preview — Grammar | A4 | `app/(auth)/preview/a4-grammar.tsx` |
| 12 | Preview — Noor | A5 | `app/(auth)/preview/a5-noor.tsx` |
| 13 | Preview — Tadabbur | A6 | `app/(auth)/preview/a6-tadabbur.tsx` |
| 14 | Preview — CTA | A7 | `app/(auth)/preview/a7-cta.tsx` |
| 15 | Onboarding — Language | B0 | `app/(auth)/onboarding/language.tsx` |
| 16 | Onboarding — Welcome | B1 | `app/(auth)/onboarding/welcome.tsx` |
| 17 | Onboarding — Goal | B2 | `app/(auth)/onboarding/goal.tsx` |
| 18 | Onboarding — Level | B3 | `app/(auth)/onboarding/level.tsx` |
| 19 | Onboarding — Daily Commitment | B4 | `app/(auth)/onboarding/daily-commitment.tsx` |
| 20 | Onboarding — Name | B5 | `app/(auth)/onboarding/name.tsx` |
| 21 | Onboarding — Placement | B6 | `app/(auth)/onboarding/placement.tsx` |
| 22 | Onboarding — Ready | B7 | `app/(auth)/onboarding/ready.tsx` |
| 23 | Onboarding — Permissions | B9 | `app/(auth)/onboarding/permissions.tsx` |
| 24 | Onboarding — Attribution | — | `app/(auth)/onboarding/attribution.tsx` |

---

### Main App Tabs (4)

| # | Screen | Spec ID | File |
|---|---|---|---|
| 25 | Learn (chapter list + home widgets) | L1 | `app/(app)/(tabs)/index.tsx` |
| 26 | Vocabulary (topic browse) | V1 | `app/(app)/(tabs)/vocabulary.tsx` |
| 27 | Noor (AI chat) | N1 | `app/(app)/(tabs)/chat.tsx` |
| 28 | You (profile) | Y1 | `app/(app)/(tabs)/profile.tsx` |

---

### App Detail / Stack Screens (17)

| # | Screen | Spec ID | File |
|---|---|---|---|
| 29 | All Chapters | L2 | `app/(app)/chapters.tsx` |
| 30 | Lesson List (by chapter, with preview bottom sheet) | L3 / L4 | `app/(app)/lessons/[chapterId].tsx` |
| 31 | Lesson Player (STANDARD + SP + REVIEW + VERB_PATTERN) | P1–P6, SP1–SP4, R1–R4, VP1–VP5 | `app/(app)/lessons/[lessonId]/play.tsx` |
| 32 | Streak Detail (12-month heatmap) | L6 | `app/(app)/streak-detail.tsx` |
| 33 | Tadabbur | L5 | `app/(app)/tadabbur.tsx` |
| 34 | My Words (personal word list) | V2 | `app/(app)/vocabulary/my-words.tsx` |
| 35 | Vocabulary by Topic | V3 | `app/(app)/vocabulary/[topic].tsx` |
| 36 | Vocabulary Search | V4 | `app/(app)/vocabulary/search.tsx` |
| 37 | Word Detail | V5 | `app/(app)/vocabulary/word/[wordId].tsx` |
| 38 | SRS Vocabulary Review | V6 | `app/(app)/vocabulary/review.tsx` |
| 39 | Edit Profile | Y2 | `app/(app)/edit-profile.tsx` |
| 40 | Settings | Y3 | `app/(app)/settings.tsx` |
| 41 | Change Password | — | `app/(app)/change-password.tsx` |
| 42 | Paywall / Subscription | Y4 | `app/(app)/paywall.tsx` |
| 43 | Milestones | Y5 | `app/(app)/milestones.tsx` |
| 44 | Share Stats Card | Y6 | `app/(app)/share-stats.tsx` |
| 45 | Trial Reminder | — | `app/(app)/trial-reminder.tsx` |

---

### Full-screen Celebration / Overlay Screens (5)

| # | Screen | Spec ID | File |
|---|---|---|---|
| 46 | Milestone Celebration | M1 | `app/(app)/milestone-celebration.tsx` |
| 47 | Surah Celebration | M6 | `app/(app)/surah-celebration.tsx` |
| 48 | Streak Celebration | — | `app/(app)/streak-celebration.tsx` |
| 49 | Streak Commitment | M4 (partial) | `app/(app)/streak-commitment.tsx` |
| 50 | Streak at Risk / Daily Goal Toast | M4 / M5 | integrated in `app/(app)/(tabs)/index.tsx` |

---

### Global Components / Modals (7)

| # | Component | Spec ID | File |
|---|---|---|---|
| 51 | Notification Permission Modal | M2 | `app/components/NotificationPermissionModal.tsx` |
| 52 | Error / Retry Modal | M7 | `app/components/ErrorModal.tsx` |
| 53 | Offline Indicator Bar | M8 | `app/components/OfflineBar.tsx` |
| 54 | Noor Overage Purchase Modal | N2 | integrated in `app/(app)/(tabs)/chat.tsx` |
| 55 | ArabicText | — | `app/components/ArabicText.tsx` |
| 56 | BrandButton | — | `app/components/BrandButton.tsx` |
| 57 | (other shared components) | — | `app/components/` |

---

## Unbuilt Screens (1)

| Spec ID | Screen | Notes |
|---|---|---|
| A0 | Animated splash screen | App uses Expo's static splash config — no dedicated animated brand mark screen |

---

## Summary Table

| Category | Built | Unbuilt |
|---|---|---|
| Pre-app / Auth / Onboarding | 24 | 0 |
| Learn tab | 5 (L1, L2, L3/L4, L5, L6) | 0 |
| Vocabulary tab | 5 (V1, V2, V3, V4, V5, V6) | 0 |
| Noor tab | 1 + N2 modal | 0 |
| You tab | 6 (Y1, Y2, Y3, Y4, Y5, Y6) + change-password | 0 |
| Lesson player | STANDARD + SP + REVIEW + VERB_PATTERN | 0 |
| Modal overlays / celebrations | M1, M2, M4, M5, M6, M7, M8 all built | 0 |
| Animated splash | — | 1 (A0) |
| **Total** | **~57** | **1** |
