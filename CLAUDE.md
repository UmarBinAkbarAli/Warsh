# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ArabAI is a gamified, AI-powered Arabic language learning mobile app targeting Muslim audiences. The repo is a monorepo with two separate Node projects:

- `arabai-backend/` - Next.js 14 (API Routes only, no pages/SSR) + Prisma + PostgreSQL
- `arabai-app/` - React Native + Expo (Android-only, SDK 51)

The Phase 1 product specification lives in `arabai-phase1-sot-v2.md`.
The active visual/design source of truth lives in `arabai-brand.md`.

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
AI_DAILY_MESSAGE_LIMIT=5
AI_MODEL_DEFAULT="claude-haiku-4-5-20251001"
```

**Mobile** - `.env` in `arabai-app/`:

```text
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

Only `EXPO_PUBLIC_*` variables are exposed to the React Native runtime.

For real usage:

- **Physical phone / Expo Go:** use the Windows LAN IP, e.g. `http://192.168.x.x:3000`
- **Android Studio emulator:** use `http://10.0.2.2:3000`
- `localhost` only works when the runtime is on the same machine as the backend

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

Error codes in use: `bad_request`, `unauthorized`, `conflict`, `too_many_requests`.

**JWT auth** - `lib/auth.ts` provides `signToken(userId)`, `verifyToken(token)`, and `getUserIdFromRequest(request)`. Protected routes call `getUserIdFromRequest` and return 401 if null. Tokens expire in 7 days.

**Prisma singleton** - `lib/prisma.ts` exports a single `prisma` instance using `@prisma/adapter-pg` (direct PG pooling, no Data Proxy). Import from here - never instantiate `PrismaClient` in route files.

**AI integration** - `lib/anthropic.ts` contains provider routing for Anthropic/OpenAI plus a local tutor fallback when AI keys are absent. The `/api/chat` route enforces a daily 5-message limit by counting `ChatMessage` rows for the current day.

**Timezone** - `lib/date.ts` contains `getPKTStartOfDay()` and related helpers for streak calculations (Pakistan Time = UTC+5).

### Mobile Patterns

**State:** Zustand (`stores/authStore.ts`) holds `user`, `token`, and hydration state. Persistence uses Zustand `persist` + `@react-native-async-storage/async-storage`, not MMKV.

**API client:** `services/api.ts` - Axios instance that auto-injects `Authorization: Bearer <token>` from persisted auth state on every request.

**Navigation:** Expo Router file-based.

- `(auth)` group contains login/register/onboarding
- `(app)` is a **stack wrapper**
- `(app)/(tabs)` contains the 3 real bottom-tab destinations:
  - `Learn`
  - `Noor`
  - `You`
- lesson routes under `(app)/lessons/...` are stack detail screens, not tabs
- Root `app/index.tsx` is a branded landing screen

**Arabic text:** Always use `app/components/ArabicText.tsx` for Arabic strings - it enforces RTL rendering and exposes `size` variants (`sm | md | lg | xl`).

**Brand/theme:** Shared UI tokens live in `arabai-app/constants/theme.ts`. Reusable branded CTA styling lives in `app/components/BrandButton.tsx`. All new UI work should follow `arabai-brand.md`.

**Path aliases (mobile only):** `@app/*`, `@components/*`, `@services/*`, `@stores/*`, `@types/*` - configured in `tsconfig.json`.

### Database Schema Key Points

- `Lesson.content` is a JSON blob - lesson structure varies by `type` (`FLASHCARD | FILL_BLANK | MULTIPLE_CHOICE | MATCHING | LISTENING`)
- `Progress` has a unique constraint on `(userId, lessonId)` - use upsert when recording completions
- `Streak` is 1:1 with `User`; streak logic is timezone-aware (PKT)
- `Chapter.worldMapX/Y` positions chapters on the in-app world map
- After any schema change: `npm run db:generate` + `npm run db:migrate`

## Current Implementation Status

The route structure, DB schema, auth flow, and basic learning flow are complete enough for device testing. Current state:

- **Implemented and working**
  - register/login/logout flow
  - persisted auth session
  - chapter list and chapter locking
  - lesson play flow
  - lesson completion with XP/streak updates
  - profile progress screen
  - chat history and chat send flow
  - branded onboarding/auth/app shell
  - tabs + detail-route navigation structure

- **Still limited / incomplete**
  - curriculum is still shallow (`5` chapters / `16` lessons)
  - splash/brand assets are still placeholder quality
  - real AI configuration is optional and not fully productionized
  - Upstash Redis rate limiting is not integrated
  - token refresh (`/api/auth/refresh`) is still a stub

- **Important known caveat**
  - `lib/anthropic.ts` currently falls back to the local tutor not only when keys are missing, but also when provider calls throw; this can mask provider failures during debugging
