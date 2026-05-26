# Warsh — UI Screen Inventory

**Last updated:** 2026-05-26
**Source of truth:** `Docs/warsh-spec-02-information-architecture.md`
**Total spec screens:** ~62 | **Built:** ~36 | **Unbuilt:** ~20

---

## Built Screens (36)

### Auth / Pre-login (20)

| # | Screen | Spec ID | File |
|---|---|---|---|
| 1 | Landing / Root | — | `app/index.tsx` |
| 2 | Auth Options | C1 | `app/(auth)/auth-options.tsx` |
| 3 | Login | C2 | `app/(auth)/login.tsx` |
| 4 | Register / Account Creation | B8 | `app/(auth)/register.tsx` |
| 5 | Preview — Welcome | A1 | `app/(auth)/preview/a1-welcome.tsx` |
| 6 | Preview — Hook | A2 | `app/(auth)/preview/a2-hook.tsx` |
| 7 | Preview — Discover | A3 | `app/(auth)/preview/a3-discover.tsx` |
| 8 | Preview — Grammar | A4 | `app/(auth)/preview/a4-grammar.tsx` |
| 9 | Preview — Noor | A5 | `app/(auth)/preview/a5-noor.tsx` |
| 10 | Preview — Tadabbur | A6 | `app/(auth)/preview/a6-tadabbur.tsx` |
| 11 | Preview — CTA | A7 | `app/(auth)/preview/a7-cta.tsx` |
| 12 | Onboarding — Language | B0 | `app/(auth)/onboarding/language.tsx` |
| 13 | Onboarding — Welcome | B1 | `app/(auth)/onboarding/welcome.tsx` |
| 14 | Onboarding — Goal | B2 | `app/(auth)/onboarding/goal.tsx` |
| 15 | Onboarding — Level | B3 | `app/(auth)/onboarding/level.tsx` |
| 16 | Onboarding — Daily Commitment | B4 | `app/(auth)/onboarding/daily-commitment.tsx` |
| 17 | Onboarding — Name | B5 | `app/(auth)/onboarding/name.tsx` |
| 18 | Onboarding — Placement | B6 | `app/(auth)/onboarding/placement.tsx` |
| 19 | Onboarding — Ready | B7 | `app/(auth)/onboarding/ready.tsx` |
| 20 | Onboarding — Attribution | — | `app/(auth)/onboarding/attribution.tsx` |

> **Note:** Attribution screen is extra — not in the spec. B9 (Permissions ask) is missing.

---

### Main App Tabs (4)

| # | Screen | Spec ID | File |
|---|---|---|---|
| 21 | Learn (chapter list) | L1 / L2 | `app/(app)/(tabs)/index.tsx` |
| 22 | Vocabulary | V1 | `app/(app)/(tabs)/vocabulary.tsx` |
| 23 | Noor (AI chat) | N1 | `app/(app)/(tabs)/chat.tsx` |
| 24 | You (profile) | Y1 | `app/(app)/(tabs)/profile.tsx` |

> **Note:** L1 is partially built — missing daily goal progress bar, Tadabbur card, streak card, Word of the Day card, and "All chapters →" teaser. L2 (All chapters) is not a separate screen — currently merged into L1.

---

### App Detail / Modal Screens (12)

| # | Screen | Spec ID | File |
|---|---|---|---|
| 25 | Lesson List (by chapter) | L3 | `app/(app)/lessons/[chapterId].tsx` |
| 26 | Lesson Player (STANDARD + SP + REVIEW beats) | P1–P6, SP1–SP4, R1–R4 | `app/(app)/lessons/[lessonId]/play.tsx` |
| 27 | Vocabulary by Topic | V3 | `app/(app)/vocabulary/[topic].tsx` |
| 28 | Word Detail | V5 | `app/(app)/vocabulary/word/[wordId].tsx` |
| 29 | SRS Vocabulary Review | V6 | `app/(app)/vocabulary/review.tsx` |
| 30 | Tadabbur | L5 | `app/(app)/tadabbur.tsx` |
| 31 | Milestones | Y5 | `app/(app)/milestones.tsx` |
| 32 | Settings | Y3 | `app/(app)/settings.tsx` |
| 33 | Paywall / Subscription | Y4 | `app/(app)/paywall.tsx` |
| 34 | Streak Celebration | M1 (partial) | `app/(app)/streak-celebration.tsx` |
| 35 | Streak Commitment | M4 (partial) | `app/(app)/streak-commitment.tsx` |
| 36 | Trial Reminder | — | `app/(app)/trial-reminder.tsx` |

---

## Unbuilt Screens (~20)

### Pre-app / Auth Flows (4)

| Spec ID | Screen | Notes |
|---|---|---|
| A0 | Splash screen (animated brand mark) | App uses Expo splash config — no real animated screen |
| B9 | Permissions ask (notifications + microphone) | No onboarding permissions screen exists |
| C3 | Forgot password | No file exists |
| C4 | Forgot password confirmation | No file exists |

---

### Learn Tab (2)

| Spec ID | Screen | Notes |
|---|---|---|
| L4 | Lesson preview bottom sheet | Lessons open directly — no bottom sheet preview before entering |
| L6 | Streak detail (full 12-month heatmap screen) | `streak-celebration.tsx` is different; no dedicated streak detail screen |

---

### Vocabulary Tab (2)

| Spec ID | Screen | Notes |
|---|---|---|
| V2 | My Words (full list with filters + sort) | Vocabulary tab only has topic browsing — no personal word list screen |
| V4 | Vocabulary search | No search screen exists |

---

### Noor Tab (1)

| Spec ID | Screen | Notes |
|---|---|---|
| N2 | Overage purchase modal (20 extra messages for $0.99) | No modal when daily message limit is hit |

---

### You Tab (2)

| Spec ID | Screen | Notes |
|---|---|---|
| Y2 | Edit profile | No edit profile screen exists |
| Y6 | Share stats card | No share/generate stats image screen |

---

### Lesson Player (1 template unbuilt)

| Spec ID | Screen | Notes |
|---|---|---|
| VP1–VP5 | VERB_PATTERN lesson template (5 beats) | `play.tsx` handles STANDARD, SPOKEN_PHRASES, REVIEW — VERB_PATTERN not implemented |

---

### Modal Overlays (7 unbuilt)

| Spec ID | Screen | Notes |
|---|---|---|
| M1 | Milestone celebration overlay (full-screen) | `streak-celebration.tsx` covers streaks only — no general milestone/badge overlay |
| M2 | Push notification permission ask (in-context) | Not implemented |
| M4 | Streak at risk warning modal | `streak-commitment.tsx` exists but spec's M4 is a distinct gentle modal |
| M5 | Daily goal complete celebration | No daily goal celebration overlay |
| M6 | Surah understood celebration (full-screen) | Not implemented |
| M7 | Generic error / network state modal | No global error modal |
| M8 | Offline indicator bar | No offline detection UI |

---

## Summary Table

| Category | Built | Unbuilt |
|---|---|---|
| Pre-app / Auth / Onboarding | 16 | 4 (A0, B9, C3, C4) |
| Learn tab | 3 full + 2 partial (L1, L2) | 2 (L4, L6) |
| Vocabulary tab | 4 | 2 (V2, V4) |
| Noor tab | 1 | 1 (N2) |
| You tab | 4 | 2 (Y2, Y6) |
| Lesson player | STANDARD + SP + REVIEW | 1 template (VP1–VP5) |
| Modal overlays | M3 only | 7 (M1, M2, M4, M5, M6, M7, M8) |
| **Total** | **~36** | **~20** |

---

## Priority for v1 Shipping

These unbuilt screens are most critical before public launch:

1. **C3 / C4** — Forgot password (users will forget passwords)
2. **L4** — Lesson preview bottom sheet (spec UX before entering a lesson)
3. **Y2** — Edit profile (name, language, avatar)
4. **VP1–VP5** — VERB_PATTERN lesson template (needed for verb-focused chapters)
5. **M1** — Milestone celebration overlay (core engagement hook)
6. **M4 / M5** — Streak at risk + daily goal modals (retention mechanics)
7. **B9** — Permissions ask at end of onboarding
8. **L6** — Streak detail screen
9. **V2 / V4** — My Words list + search
10. **N2** — Overage purchase modal
