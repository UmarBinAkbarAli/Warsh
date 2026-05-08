# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ArabAI is a gamified, AI-powered Arabic language learning mobile app targeting Muslim audiences. The repo is a monorepo with two separate Node projects:

- `arabai-backend/` - Next.js 14 (API Routes only, no pages/SSR) + Prisma + PostgreSQL
- `arabai-app/` - React Native + Expo (Android-only, SDK 51). The app name in `app.json` is **"Warsh"**, not "ArabAI".

The Phase 1 product specification lives in `arabai-phase1-sot-v2.md`.
The active visual/design source of truth lives in `Docs/warsh-brand-ui-sot.md`.

## Current Phase Status

- **Phase 1 core app flow:** working end-to-end on device
- **Current focus:** Phase 1.5 content expansion and product polish
- **Biggest remaining gap:** curriculum depth, not app wiring
- **Recommended next milestone:** expand chapters/lessons before starting true Phase 2 scope

## Commands

### Backend (`arabai-backend/`)

```bash
npm run dev           # Start dev server on port 3000
npm run build         # Production build
npm run lint          # ESLint

npm run db:generate   # Regenerate Prisma Client after schema changes
npm run db:migrate    # Apply pending migrations
npm run db:seed       # Seed initial chapters/lessons/achievements
npm run db:studio     # Open Prisma Studio GUI
```

Local PostgreSQL via Docker:

```bash
docker-compose up -d  # Start PostgreSQL 16 on port 5432
```

### Mobile App (`arabai-app/`)

```bash
npm start             # Start Expo dev server
npm run android       # Build and run on Android emulator/device
npm run lint          # ESLint
```

## Environment Setup

**Backend** - copy `.env.example` to `.env`:

```text
DATABASE_URL="postgresql://arabai:arabai_dev_password@localhost:5432/arabai"
JWT_SECRET="min-32-char-secret"
ANTHROPIC_API_KEY=""
AI_PROVIDER=""                        # auto-detected: "openai" if OPENAI_API_KEY set, else "anthropic"
AI_DAILY_MESSAGE_LIMIT=5
AI_MODEL_DEFAULT="claude-haiku-4-5-20251001"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
```

**Mobile** - `.env` in `arabai-app/`:

```text
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

Only `EXPO_PUBLIC_*` variables are exposed to the React Native runtime.

For real device usage:
- **Physical phone / Expo Go:** use the Windows LAN IP, e.g. `http://192.168.x.x:3000`
- **Android Studio emulator:** use `http://10.0.2.2:3000`

## Architecture

### Request Flow

```text
Expo App (Android)
  -> Axios (auto-attaches JWT via interceptor)
  -> Next.js API Routes (arabai-backend/app/api/)
  -> Prisma -> PostgreSQL (Docker locally)
             -> Anthropic/OpenAI/local fallback (chat endpoint only)
```

### Backend Patterns

All API routes follow a consistent envelope:

- **Success:** `{ "data": { ... } }` with 200/201
- **Error:** `{ "error": "Human message", "code": "snake_case_code" }` with 4xx/5xx

Error codes in use: `bad_request`, `unauthorized`, `conflict`, `too_many_requests`, `not_found`, `chapter_locked`.

**JWT auth** - `lib/auth.ts` provides `signToken(userId)`, `verifyToken(token)`, and `getUserIdFromRequest(request)`. Protected routes call `getUserIdFromRequest` and return 401 if null. Tokens expire in 7 days.

**Prisma singleton** - `lib/prisma.ts` exports a single `prisma` instance using `@prisma/adapter-pg` (direct PG pooling, no Data Proxy). Import from here — never instantiate `PrismaClient` in route files.

**AI integration** - `lib/anthropic.ts` routes to OpenAI if `OPENAI_API_KEY` is set, otherwise Anthropic, and falls back to a hardcoded local tutor (`getLocalTutorReply()`) when keys are absent **or when the provider call throws** — this can mask provider failures during debugging. The AI persona is "Ustadh Noor." The `/api/chat` route enforces a daily message limit by counting `ChatMessage` rows for the current PKT day.

**Timezone** - `lib/date.ts` contains `getPKTStartOfDay()` and related helpers for streak calculations (Pakistan Time = UTC+5).

**Course locking** - `lib/course.ts` provides `buildChapterStates()` and `getUserCourseState(userId)`. Chapters are locked until the previous chapter is fully completed. `DEV_UNLOCK_ALL = true` in this file bypasses locking — **set to `false` before production**.

**Placement logic** - `lib/placement.ts` maps placement test results to starting chapters:
- `BEGINNER` → ch1, `KNOWS_LETTERS` → ch4, `STUDIED_BEFORE` → ch6, `CAN_READ_BASIC` → ch8
- Earlier lessons are given `SKIPPED_BY_PLACEMENT` progress status.

### API Endpoints

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/health` | — | Returns `{ status, timestamp }` |
| POST | `/api/auth/register` | — | Returns token |
| POST | `/api/auth/login` | — | Returns token |
| GET | `/api/auth/me` | ✓ | Stub |
| POST | `/api/auth/refresh` | ✓ | Stub |
| GET | `/api/chapters` | ✓ | With lock state and progress |
| GET | `/api/chapters/[id]/lessons` | ✓ | Lessons in chapter |
| GET | `/api/lessons/[id]` | ✓ | Single lesson; 403 if chapter locked |
| POST | `/api/lessons/[id]/complete` | ✓ | Updates XP/streak transactionally |
| GET | `/api/progress` | ✓ | XP, level, streak, achievements |
| GET | `/api/streak` | ✓ | Current, longest, last active |
| POST | `/api/chat` | ✓ | Rate-limited by daily limit |
| GET | `/api/chat/history` | ✓ | Last 50 messages |
| POST | `/api/placement/apply` | ✓ | Applies placement, skips lessons |

### Mobile Patterns

**State:**
- `stores/authStore.ts` — Zustand + `@react-native-async-storage/async-storage` persist. Holds `user`, `token`, `isHydrated`. The `(app)/_layout.tsx` guard waits for `isHydrated` before redirecting.
- `stores/onboardingStore.ts` — Zustand (non-persisted). Holds `goal`, `level`, `name`, `language`, `placementType` for the onboarding flow.

**API client:** `services/api.ts` — Axios instance that auto-injects `Authorization: Bearer <token>` from auth store on every request. Default base URL falls back to a hardcoded LAN IP when `EXPO_PUBLIC_API_URL` is unset.

**Navigation:** Expo Router file-based.
- `(auth)` group — login, register, onboarding (welcome → goal → language → level → name → placement → ready)
- `(app)` — stack wrapper with auth guard
- `(app)/(tabs)` — 3 bottom-tab destinations: Learn (`index.tsx`), Noor (`chat.tsx`), You (`profile.tsx`)
- `(app)/lessons/[lessonId]/` — stack detail screens, not tabs
- Root `app/index.tsx` — branded landing screen

**Arabic text:** Always use `app/components/ArabicText.tsx` for Arabic strings — it enforces RTL and uses Scheherazade New font. Size variants: `sm | md | lg | xl`. English text uses Amiri font.

**Brand/theme:** Shared UI tokens in `arabai-app/constants/theme.ts` (WarshPalette, Colors, FontSizes, Spacing, Radii, Shadows). Use `app/components/BrandButton.tsx` for CTAs — it has `variant` (`primary | secondary | danger`) and `selected`/`loading`/`disabled` states, min height 52px. All new UI work should follow `Docs/warsh-brand-ui-sot.md`.

**Path aliases (mobile only):** `@app/*`, `@components/*`, `@services/*`, `@stores/*`, `@types/*` — configured in `tsconfig.json`.

### Database Schema Key Points

- `Lesson.content` is a JSON blob — structure varies by `type`: `FLASHCARD | FILL_BLANK | MULTIPLE_CHOICE | MATCHING | LISTENING | VOCABULARY`
- `Progress` has a unique constraint on `(userId, lessonId)` — use upsert when recording completions. Status enum: `NOT_STARTED | COMPLETED | SKIPPED_BY_PLACEMENT`
- `Streak` is 1:1 with `User`; streak logic is timezone-aware (PKT)
- `Chapter.worldMapX/Y` positions chapters on the in-app world map
- After any schema change: `npm run db:generate` + `npm run db:migrate`
- Curriculum data lives in `prisma/curriculum-phase15.cjs`, loaded by `prisma/seed.cjs`

## Current Implementation Status

- **Implemented and working:** register/login/logout, persisted auth session, chapter list with locking, lesson play flow, lesson completion with XP/streak updates, profile progress screen, chat with AI tutor, placement test, branded onboarding flow, tabs + detail-route navigation

- **Still limited / incomplete:**
  - Curriculum: 5 chapters / ~16 lessons (Phase 1.5 in progress)
  - Splash/brand assets are placeholder quality
  - Upstash Redis rate limiting not integrated (currently counts DB rows)
  - Token refresh (`/api/auth/refresh`) is a stub
  - Achievement system: schema exists, not fully wired to lesson completion
