# Noor — Roadmap

> Last updated: May 2026
> Current branch: `main`

---

## Status Legend
- ✅ Done — working on device
- 🔧 Partial — scaffolded or stubbed, not production-ready
- ❌ Not started

---

## Phase 1 — Core App Flow ✅
Goal: end-to-end working app on Android device.

| Feature | Status | Notes |
|---|---|---|
| Register / Login / Logout | ✅ | JWT 7-day expiry, bcrypt passwords |
| Persisted auth session | ✅ | Zustand + AsyncStorage |
| Onboarding flow (name, goal, language, level, placement) | ✅ | |
| Placement quiz → chapter skip | ✅ | `/api/placement/apply` sets `startingChapterOrder` |
| Chapter list with locking | ✅ | Chapters unlock sequentially |
| Lesson list per chapter | ✅ | |
| Legacy lesson player (FLASHCARD, FILL_BLANK, MULTIPLE_CHOICE) | ✅ | Single-screen flow |
| VOCABULARY lesson player (5-beat: Hook → Discover → Practice → Reveal → Close) | ✅ | |
| XP + streak updates on lesson completion | ✅ | PKT timezone-aware streak |
| AI chat with Ustaad Noor | ✅ | 5 messages/day limit |
| Chat history | ✅ | |
| Profile / progress screen | ✅ | XP, level, streak, completed lessons |
| Branded UI (Warsh palette, Scheherazade New font) | ✅ | |
| Achievement schema | ✅ | DB schema + model ready |

---

## Phase 1.5 — Content Expansion (Current Focus)
Goal: enough curriculum depth for real daily usage.

| Feature | Status | Notes |
|---|---|---|
| Curriculum: Phase 1.5 content script | 🔧 | `prisma/curriculum-phase15.cjs` exists, being expanded |
| More chapters (target: 10+) | 🔧 | Currently ~5 chapters / ~16 lessons in seed |
| VOCABULARY lesson type rollout across chapters | 🔧 | Flagship format, replacing legacy types |
| Achievement UI (unlock notifications, profile display) | ❌ | Schema ready, no UI |
| Fatiha progress tracker | ❌ | `fatihaProgressDelta` field exists in Lesson model |
| Splash screen / app icon (real assets) | ❌ | Placeholder quality currently |
| Token refresh (`/api/auth/refresh`) | ❌ | Route is stub |

---

## Phase 2 — Polish & Growth
Goal: production-grade quality, ready for public release on Play Store.

| Feature | Status | Notes |
|---|---|---|
| Upstash Redis rate limiting | ❌ | Replace in-memory daily count |
| Push notifications (lesson reminders, streak alerts) | ❌ | |
| Offline lesson caching | ❌ | |
| Audio / listening exercises | ❌ | LISTENING lesson type in schema, no player |
| Spaced repetition / review queue | ❌ | |
| World map UI (chapter map with worldMapX/Y) | ❌ | Fields exist in schema, no map screen |
| iOS build | ❌ | Expo setup exists, untested |
| Play Store listing | ❌ | |
| Real AI productionisation | ❌ | `lib/anthropic.ts` fallback can mask provider errors |
| Social / leaderboard features | ❌ | |
| Gems economy (spending, rewards) | ❌ | `gems` field on User, no spending flow |
| Streak freezes | ❌ | `streakFreezes` field on Streak, no UI |

---

## Guiding Principles for Sequencing
1. **Curriculum depth before Phase 2 features.** A shallow curriculum kills retention faster than any missing feature.
2. **VOCABULARY lesson type is the flagship.** Legacy types (FLASHCARD, FILL_BLANK) are acceptable scaffolding; new content should use VOCABULARY.
3. **No new infrastructure until content is solid.** Redis, push notifications, world map — these are polish. Chapters come first.
4. **The biggest gap today is content, not app wiring.** The full lesson flow, auth, and AI chat are working. The problem is running out of lessons after 10 minutes.
