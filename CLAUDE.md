# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Warsh is a gamified, AI-powered Arabic language learning mobile app targeting Muslim audiences. The repo is a monorepo with two separate Node projects:

- `warsh-backend/` - Next.js 14 (API Routes only, no pages/SSR) + Prisma 7 (`@prisma/adapter-pg`) + PostgreSQL (Neon)
- `warsh-app/` - React Native 0.81 + Expo SDK 54 (React 19). Primary target is Android; `web` is also listed in `app.json` platforms. The app name/slug in `app.json` is **"Warsh"**.
- `packages/lesson-schema/` - `@warsh/lesson-schema` Zod schema for lesson `content` JSON, built with `tsup`/`vitest`. It is vendored into the backend at `warsh-backend/vendor/lesson-schema` and imported as `@warsh/lesson-schema` (used by `lib/content-schema.ts` to validate lessons).

> **Note:** `AGENTS.md` at the repo root is a parallel copy of this guidance for Codex. Keep the two in sync when you change project-wide facts here.

## Source of Truth

**The complete source of truth is `Docs/warsh-spec-00-master-index.md` and the 13 spec files it references (spec-01 through spec-13).** Read `Docs/warsh-spec-00-master-index.md` before every task to orient yourself.

Do NOT reference these old files — they are superseded and may contradict the spec:
- `Docs/arabai-phase1-sot-v2.md`
- `Docs/arabai-brand.md`
- `Docs/arabai-curriculum.md`
- `Docs/warsh-brand-ui-sot.md`
- `Docs/warsh-ui-sot.md`
- `Docs/warsh-master-roadmap.md`
- `Docs/warsh-vocabulary-bank.md`
- `Docs/noor_app_mockup_screens.html`
- `Docs/warsh_wireframes.html`
- `Docs/warsh_chapter_flow_system.html`

Quick spec reference:
- Product identity & locked decisions → `warsh-spec-01`
- All screens & navigation → `warsh-spec-02`
- Onboarding & auth → `warsh-spec-03`
- Lesson system & exercise types → `warsh-spec-04`
- Curriculum (72 chapters, Madinah Reader) → `warsh-spec-05`
- Spoken Fus'ha → `warsh-spec-06`
- Vocabulary & Tadabbur → `warsh-spec-07`
- Engagement & streaks → `warsh-spec-08`
- Ustaad Noor (AI tutor) → `warsh-spec-09`
- Monetization & launch → `warsh-spec-10`
- Design system & copy → `warsh-spec-11`
- Data model & API → `warsh-spec-12`
- Technical & infrastructure → `warsh-spec-13`

## Current Phase Status

- **Phase 1 core app flow:** working end-to-end on device
- **Current focus:** Phase 1.5 content expansion and product polish
- **Biggest remaining gap:** curriculum depth, not app wiring
- **Recommended next milestone:** expand chapters/lessons before starting true Phase 2 scope

## "Start Warsh App" — Agent Protocol

When the user says **"start warsh app"** (or any close variant), always run the
PowerShell script at the repo root — never improvise individual steps:

```powershell
.\start-warsh.ps1        # local dev  — runs backend on localhost:3000
.\start-warsh.ps1 -prod  # production — points app at api.warsh.app
```

**Local dev** does (in order):
1. Verifies ADB + USB device is connected
2. Sets ADB reverse tunnels: `tcp:8081` (Metro) and `tcp:3000` (Backend)
3. Opens a terminal window running the Next.js backend (`npm run dev` in `warsh-backend/`)
4. Waits until `http://localhost:3000/api/health` returns 200
5. Opens a terminal window running Expo Metro with `EXPO_PUBLIC_API_URL=http://127.0.0.1:3000`

**Production (`-prod`)** does:
1. Verifies ADB + USB device is connected
2. Sets ADB reverse tunnel: `tcp:8081` (Metro only — no local backend)
3. Opens a terminal window running Expo Metro with `EXPO_PUBLIC_API_URL=https://api.warsh.app`

**No Docker needed** — the database is Neon (cloud Postgres). The backend connects
to Neon directly via `DATABASE_URL` in `warsh-backend/.env`.

**Never hardcode a LAN IP.** Always use `http://127.0.0.1:3000` — the ADB tunnel
forwards traffic from the phone to the PC's localhost.

To run the script from the Claude Code terminal:
```
! .\start-warsh.ps1
```

## Commands

### Backend (`warsh-backend/`)

```bash
npm run dev           # Start dev server on port 3000
npm run build         # Production build
npm run lint          # ESLint

npm run db:generate   # Regenerate Prisma Client after schema changes
npm run db:migrate    # Apply pending migrations
npm run db:seed       # Seed chapters/lessons/vocabulary/tadabbur/achievements
npm run db:studio     # Open Prisma Studio GUI

npm run db:validate-seed      # Validate legacy curriculum data
npm run db:validate-fixtures  # Validate lesson fixtures against @warsh/lesson-schema
npm run db:audit-urdu         # Audit Urdu translation content

npm run images:upload         # Upload vocab images to R2 (tsx script); :skip / :dry variants
npm run images:patch-fixtures # Patch discover-card image URLs into fixtures; :dry variant
npm run sentry:smoke          # Sentry smoke test
node scripts/dev-unlock-through.cjs   # Dev-only: unlock chapters up to N
```

### Mobile App (`warsh-app/`)

```bash
npm start             # Start Expo dev server
npm run android       # Build and run on Android emulator/device
npm run lint          # ESLint
```

### Lesson Schema (`packages/lesson-schema/`)

This package holds the repo's **only automated test suite** (Vitest); the backend and app have lint but no test runner.

```bash
npm test              # Run Vitest once (validates the lesson content schema)
npm run test:watch    # Vitest watch mode
npm run test -- <pattern>   # Run a single test file/name by pattern
npm run build         # tsup build (re-vendor into warsh-backend/vendor/lesson-schema after schema changes)
```

## Environment Setup

**Backend** - copy `.env.example` to `.env`:

```text
DATABASE_URL="postgresql://warsh:warsh_dev_password@localhost:5432/warsh_dev"
JWT_SECRET="min-32-char-secret"
DEV_UNLOCK_ALL=false
AI_DAILY_MESSAGE_LIMIT=5
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
```

Additional integrations read their own env vars (all optional/feature-gated; absence disables that feature, often with a fallback):
- **Cloudflare R2 / S3** (vocab images, TTS audio) — `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, bucket/public-URL vars (`lib/r2.ts`)
- **Resend** (transactional email: password reset) — `RESEND_API_KEY` (`lib/email.ts`)
- **Sentry** — `SENTRY_DSN` / `SENTRY_AUTH_TOKEN`
- **Store verification** (Google Play IAP) — service-account credentials used by `lib/storeVerification.ts` / `lib/subscription.ts`

**Mobile** - copy `warsh-app/.env.example` to `warsh-app/.env`:

```text
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000
EXPO_PUBLIC_ENVIRONMENT=development
```

Only `EXPO_PUBLIC_*` variables are exposed to the React Native runtime.

Preferred local physical-device testing path:
- Start backend on port `3000`
- Configure USB reverse:
  - `adb reverse tcp:8081 tcp:8081`
  - `adb reverse tcp:3000 tcp:3000`
- Start Metro with `EXPO_PUBLIC_API_URL=http://127.0.0.1:3000`

Avoid committing machine-specific LAN IPs. Use `EXPO_PUBLIC_API_URL` for any per-developer override.

## Architecture

### Request Flow

```text
Expo App (Android)
  -> Axios (auto-attaches JWT via interceptor)
  -> Next.js API Routes (warsh-backend/app/api/)
  -> Prisma -> PostgreSQL (Neon cloud)
             -> OpenAI/local fallback (chat endpoint only)
```

### Backend Patterns

All API routes follow a consistent envelope:

- **Success:** `{ "data": { ... } }` with 200/201
- **Error:** `{ "error": "Human message", "code": "snake_case_code" }` with 4xx/5xx

Error codes in use: `bad_request`, `invalid_input`, `unauthorized`, `conflict`, `too_many_requests`, `not_found`, `chapter_locked`, `last_lesson`, `subscription_required`, `schema_error`, `duplicate_exercise_id`, `exercise_id_collision`, `tts_unavailable`, `audio_unavailable`.

**JWT auth** - `lib/auth.ts` provides `signToken(userId)`, `verifyToken(token)`, and `getUserIdFromRequest(request)`. Protected routes call `getUserIdFromRequest` and return 401 if null. Tokens expire in 30 days; `/api/auth/refresh` rotates them with a 90-day max session, and a password-hash fingerprint (`pv`) in the token invalidates all sessions on password change.

**Prisma singleton** - `lib/prisma.ts` exports a single `prisma` instance using `@prisma/adapter-pg` (direct PG pooling, no Data Proxy). Import from here — never instantiate `PrismaClient` in route files.

**AI integration** - `lib/openai.ts` uses OpenAI when `OPENAI_API_KEY` is set and falls back to a hardcoded local tutor (`getLocalTutorReply()`) when the key is absent **or when the provider call throws** — this can mask provider failures during debugging. The AI persona is "Ustaad Noor." The `/api/chat` route enforces a daily message limit by counting `ChatMessage` rows for the current PKT day.

**Timezone** - `lib/date.ts` contains `getPKTStartOfDay()` and related helpers for streak calculations (Pakistan Time = UTC+5).

**Course locking** - `lib/course.ts` provides `buildChapterStates()` and `getUserCourseState(userId)`. Chapters are locked until the previous chapter is fully completed. `DEV_UNLOCK_ALL` only bypasses locking outside production when `DEV_UNLOCK_ALL=true`.

**Placement logic** - `lib/placement.ts` maps placement test results to starting chapters:
- `BEGINNER` → ch1, `KNOWS_LETTERS` → ch4, `STUDIED_BEFORE` → ch6, `CAN_READ_BASIC` → ch8
- Earlier lessons are given `SKIPPED_BY_PLACEMENT` progress status.

**Lesson content validation** - `lib/content-schema.ts` validates `Lesson.content` JSON against `@warsh/lesson-schema` (the vendored Zod package). Admin lesson endpoints reject invalid content with `schema_error` / `invalid_input` / `duplicate_exercise_id`.

**Storage & media** - `lib/r2.ts` (Cloudflare R2 via the S3 SDK) stores vocab images and generated audio. `lib/tts.ts` generates/serves TTS audio (returns `tts_unavailable` / `audio_unavailable` when not configured).

**Subscription / IAP** - `lib/subscription.ts` + `lib/storeVerification.ts` verify Google Play purchases and manage trial/subscription state. Premium-gated routes return `subscription_required`. `/api/webhooks/google` handles Real-time Developer Notifications; the `cron/expire-trials` and `cron/reset-streaks` routes are invoked on a schedule.

**Other libs** - `lib/achievements.ts` (achievement evaluation), `lib/admin.ts` (admin auth/guards), `lib/tadabbur.ts` (Quran reflection content), `lib/email.ts` (Resend).

### API Endpoints

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/health` | — | Returns `{ status, timestamp }` |
| POST | `/api/auth/register` | — | Returns token |
| POST | `/api/auth/login` | — | Returns token |
| GET | `/api/auth/me` | ✓ | Current user profile |
| POST | `/api/auth/refresh` | ✓ | Token rotation (90-day max session) |
| GET | `/api/chapters` | ✓ | With lock state and progress |
| GET | `/api/chapters/[id]/lessons` | ✓ | Lessons in chapter |
| GET | `/api/lessons/[id]` | ✓ | Single lesson; 403 if chapter locked |
| POST | `/api/lessons/[id]/complete` | ✓ | Updates XP/streak transactionally |
| GET | `/api/progress` | ✓ | XP, level, streak, achievements |
| GET | `/api/streak` | ✓ | Current, longest, last active |
| POST | `/api/chat` | ✓ | Rate-limited by daily limit |
| GET | `/api/chat/history` | ✓ | Last 50 messages |
| POST | `/api/noor/purchase-pack` | ✓ | Buy extra AI message pack |
| POST | `/api/placement/apply` | ✓ | Applies placement, skips lessons |
| GET | `/api/achievements` | ✓ | Achievement list + unlock state |
| GET/POST | `/api/streak`, `/api/streak/sync` | ✓ | Streak read + client sync |
| GET | `/api/vocabulary/words`, `/api/vocabulary/my-words`, `/api/vocabulary/word-of-day` | ✓ | Vocabulary browsing |
| GET/POST | `/api/vocabulary/srs/due`, `/api/vocabulary/srs/review` | ✓ | Spaced-repetition review |
| GET | `/api/vocabulary/words/[id]`, `.../audio`, `.../image`, `.../user` | ✓ | Word detail + media + user state |
| GET | `/api/tadabbur`, `/api/tadabbur/[surahId]` | ✓ | Quran reflection content |
| POST | `/api/audio/tts` | ✓ | On-demand TTS audio |
| GET/POST | `/api/subscription/status`, `/api/subscription/verify` | ✓ | IAP subscription state + receipt verify |
| GET/PUT | `/api/users/me` | ✓ | User profile read/update |
| POST | `/api/auth/forgot-password`, `/reset-password`, `/change-password` | mixed | Password flows (Resend email) |
| POST | `/api/webhooks/google` | — | Google Play RTDN webhook |
| GET | `/api/cron/reset-streaks`, `/api/cron/expire-trials` | CRON_SECRET | Scheduled jobs (Bearer secret) |
| * | `/api/admin/*` | admin | Chapter/lesson/content authoring + validation |

(Table is representative, not exhaustive — see `warsh-backend/app/api/` for the full set.)

### Mobile Patterns

**State:**
- `stores/authStore.ts` — Zustand + `@react-native-async-storage/async-storage` persist. Holds `user`, `token`, `isHydrated`. The `(app)/_layout.tsx` guard waits for `isHydrated` before redirecting.
- `stores/onboardingStore.ts` — Zustand (non-persisted). Holds `goal`, `level`, `name`, `language`, `placementType` for the onboarding flow.

**API client:** `services/api.ts` — Axios instance that auto-injects `Authorization: Bearer <token>` from auth store on every request. Configure the base URL with `EXPO_PUBLIC_API_URL`; local physical-device testing should prefer USB reverse with `http://127.0.0.1:3000`.

**Navigation:** Expo Router file-based.
- `(auth)` group — login, register, onboarding (welcome → goal → language → level → name → placement → ready)
- `(app)` — stack wrapper with auth guard
- `(app)/(tabs)` — 4 bottom-tab destinations: Learn (`index.tsx`), Vocabulary (`vocabulary.tsx`), Noor (`chat.tsx`), You (`profile.tsx`)
- `(app)/lessons/[lessonId]/play.tsx` and `(app)/lessons/[chapterId].tsx` — stack detail screens, not tabs
- `(app)/vocabulary/*` — vocab search, my-words, SRS review, topic + word detail screens
- `(app)/` also hosts cross-cutting screens: `paywall.tsx`, `settings.tsx`, `tadabbur.tsx`, `chapters.tsx`, `milestones.tsx`, plus streak/celebration/trial flows
- `(auth)/preview/*` — marketing/preview onboarding carousel screens
- Root `app/index.tsx` — branded landing screen

**Components:** Shared components live in `warsh-app/components/` (e.g. `ArabicText.tsx`, `BrandButton.tsx`, `PlayButton.tsx`, `WaveformBars.tsx`, `ShadowRepeatExercise.tsx`), imported via the `@components/*` alias. A few screen-local modals live under `warsh-app/app/components/` (`ErrorModal`, `OfflineBar`, `NotificationPermissionModal`).

**Arabic text:** Always use `components/ArabicText.tsx` for Arabic strings — it enforces RTL and uses the **Scheherazade New** font. Size variants: `sm | md | lg | xl`.

**Fonts:** Loaded in `app/_layout.tsx` via `useFonts`. English/UI body = **Lora** (Regular/SemiBold/Bold/Italic); display/headings = **Cormorant Garamond**; Arabic = **Scheherazade New**.

**Brand/theme:** Shared UI tokens in `warsh-app/constants/theme.ts` (WarshPalette, Colors, FontSizes, Spacing, Radii, Shadows). Use `components/BrandButton.tsx` for CTAs — it has `variant` (`primary | secondary | danger`) and `selected`/`loading`/`disabled` states, min height 56pt (spec-11 §5.1). All new UI work must follow `Docs/warsh-spec-11-design-system-and-copy.md`.

**Services:** `warsh-app/services/` — `api.ts` (Axios + JWT), `iap.ts` (react-native-iap subscriptions/paywall), `analytics.ts` (Mixpanel), `notifications.ts` (expo-notifications), `sentry.ts`, `audioCache.ts` (expo-av playback + caching), `language.ts`, `micPermission.ts`, `storage.ts`.

**Path aliases (mobile only):** `@app/*`, `@components/*`, `@services/*`, `@stores/*`, `@types/*` — configured in `tsconfig.json`.

### Database Schema Key Points

- `Lesson.content` is a JSON blob — structure varies by `type`: `FLASHCARD | FILL_BLANK | MULTIPLE_CHOICE | MATCHING | LISTENING | VOCABULARY`
- `Progress` has a unique constraint on `(userId, lessonId)` — use upsert when recording completions. Status enum: `NOT_STARTED | COMPLETED | SKIPPED_BY_PLACEMENT`
- `Streak` is 1:1 with `User`; streak logic is timezone-aware (PKT)
- `Chapter.worldMapX/Y` positions chapters on the in-app world map
- After any schema change: `npm run db:generate` + `npm run db:migrate`
- Curriculum is the **Madinah Arabic Reader, Books 1–8**, split across `prisma/curriculum-book1.cjs`, `curriculum-books2-4.cjs`, `curriculum-books5-6.cjs`, `curriculum-books7-8.cjs` (plus legacy `curriculum-phase15.cjs`). `prisma/seed.cjs` assembles these and also calls `vocabulary-seed.cjs` and `tadabbur-seed.cjs`. Newer lessons use JSON fixtures under `prisma/fixtures/` validated against `@warsh/lesson-schema`.

## Current Implementation Status

- **Implemented and working:** register/login/logout + password reset, persisted auth session, chapter list with locking, lesson play flow, lesson completion with XP/streak updates, profile progress screen, chat with AI tutor (+ purchasable message packs), placement test, branded onboarding flow, tabs + detail-route navigation, vocabulary browsing + SRS review, Tadabbur, TTS audio, Google Play IAP subscriptions + paywall/trial flow, push notifications, Mixpanel analytics, Sentry, admin content-authoring endpoints

- **Still limited / incomplete:**
  - Curriculum: Madinah Books 1–8 scaffolded; content still needs manual pedagogy and mobile QA
  - Splash/brand assets are placeholder quality
  - Rate limiting is in-memory per-instance (`lib/rateLimit.ts`) — best-effort on serverless; Upstash Redis still recommended for strict cross-instance limits
