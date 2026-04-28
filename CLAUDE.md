# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ArabAI is a gamified, AI-powered Arabic language learning mobile app targeting Muslim audiences. The repo is a monorepo with two separate Node projects:

- `arabai-backend/` — Next.js 14 (API Routes only, no pages/SSR) + Prisma + PostgreSQL
- `arabai-app/` — React Native + Expo (Android-only, SDK 51)

The Phase 1 product specification lives in `arabai-phase1-sot-v2.md`.

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
npm start             # Start Expo dev server (press 'a' for Android)
npm run android       # Build and run on Android emulator/device
npm run lint          # ESLint
```

## Environment Setup

**Backend** — copy `.env.example` to `.env`:
```
DATABASE_URL="postgresql://arabai:arabai_dev_password@localhost:5432/arabai"
JWT_SECRET="min-32-char-secret"
ANTHROPIC_API_KEY=""
AI_DAILY_MESSAGE_LIMIT=5
AI_MODEL_DEFAULT="claude-haiku-4-5-20251001"
```

**Mobile** — `.env` in `arabai-app/`:
```
EXPO_PUBLIC_API_URL="http://localhost:3000"
```
Only `EXPO_PUBLIC_*` variables are exposed to the React Native runtime.

## Architecture

### Request Flow
```
Expo App (Android)
  → Axios (auto-attaches JWT via interceptor)
  → Next.js API Routes (arabai-backend/app/api/)
  → Prisma → PostgreSQL (Neon in prod, Docker locally)
             ↳ Anthropic Claude Haiku (AI chat endpoint only)
```

### Backend Patterns

All API routes follow a consistent envelope:
- **Success:** `{ "data": { ... } }` with 200/201
- **Error:** `{ "error": "Human message", "code": "snake_case_code" }` with 4xx/5xx

Error codes in use: `bad_request`, `unauthorized`, `conflict`, `too_many_requests`.

**JWT auth** — `lib/auth.ts` provides `signToken(userId)`, `verifyToken(token)`, and `getUserIdFromRequest(request)`. Protected routes call `getUserIdFromRequest` and return 401 if null. Tokens expire in 7 days.

**Prisma singleton** — `lib/prisma.ts` exports a single `prisma` instance using `@prisma/adapter-pg` (direct PG pooling, no Data Proxy). Import from here — never instantiate `PrismaClient` in route files.

**AI integration** — `lib/anthropic.ts` currently returns stub responses. Real Claude API calls go here; the `/api/chat` route enforces a daily 5-message limit by counting `ChatMessage` rows for the current day.

**Timezone** — `lib/date.ts` contains `getPKTStartOfDay()` for streak calculations (Pakistan Time = UTC+5).

### Mobile Patterns

**State:** Zustand (`stores/authStore.ts`) holds in-memory `user` and `token`. MMKV (`services/storage.ts`) persists them across restarts. On boot the app reads MMKV → hydrates Zustand.

**API client:** `services/api.ts` — Axios instance that auto-injects `Authorization: Bearer <token>` from MMKV on every request.

**Navigation:** Expo Router file-based. `(auth)` group (login/register/onboarding) and `(app)` group (tab bar with Home, Chat, Profile). Root `app/index.tsx` redirects based on auth state.

**Arabic text:** Always use `app/components/ArabicText.tsx` for Arabic strings — it enforces RTL rendering and exposes `size` variants (`sm | md | lg | xl`).

**Path aliases (mobile only):** `@app/*`, `@components/*`, `@services/*`, `@stores/*`, `@types/*` — configured in `tsconfig.json`.

### Database Schema Key Points

- `Lesson.content` is a JSON blob — lesson structure varies by `type` (`FLASHCARD | FILL_BLANK | MULTIPLE_CHOICE | MATCHING | LISTENING`).
- `Progress` has a unique constraint on `(userId, lessonId)` — use upsert when recording completions.
- `Streak` is 1:1 with `User`; streak logic is timezone-aware (PKT).
- `Chapter.worldMapX/Y` positions chapters on the in-app world map.
- After any schema change: `npm run db:generate` + `npm run db:migrate`.

## Current Implementation Status

The route structure and DB schema are complete. Stubs/not-yet-implemented:
- AI responses in `lib/anthropic.ts` (returns hardcoded string)
- Upstash Redis rate limiting (wired in env but not integrated)
- Onboarding screens (`app/(auth)/onboarding/` — route files exist, screens empty)
- Lesson playback UI (`app/(app)/lessons/[lessonId]/play.tsx` — empty)
- Profile screen (`app/(app)/profile.tsx` — empty)
- Token refresh (`/api/auth/refresh` — stub)
