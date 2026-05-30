# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Warsh is a gamified, AI-powered Arabic language learning mobile app targeting Muslim audiences. The repo is a monorepo with two separate Node projects:

- `warsh-backend/` - Next.js 14 (API Routes only, no pages/SSR) + Prisma + PostgreSQL
- `warsh-app/` - React Native + Expo (Android-only, SDK 51). The app name in `app.json` is **"Warsh"**, not "Warsh".

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
.\start-warsh.ps1 -prod  # production — points app at warsh-backend.vercel.app
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
3. Opens a terminal window running Expo Metro with `EXPO_PUBLIC_API_URL=https://warsh-backend.vercel.app`

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
npm run db:seed       # Seed initial chapters/lessons/achievements
npm run db:studio     # Open Prisma Studio GUI
```

### Mobile App (`warsh-app/`)

```bash
npm start             # Start Expo dev server
npm run android       # Build and run on Android emulator/device
npm run lint          # ESLint
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

Error codes in use: `bad_request`, `unauthorized`, `conflict`, `too_many_requests`, `not_found`, `chapter_locked`.

**JWT auth** - `lib/auth.ts` provides `signToken(userId)`, `verifyToken(token)`, and `getUserIdFromRequest(request)`. Protected routes call `getUserIdFromRequest` and return 401 if null. Tokens expire in 7 days.

**Prisma singleton** - `lib/prisma.ts` exports a single `prisma` instance using `@prisma/adapter-pg` (direct PG pooling, no Data Proxy). Import from here — never instantiate `PrismaClient` in route files.

**AI integration** - `lib/openai.ts` uses OpenAI when `OPENAI_API_KEY` is set and falls back to a hardcoded local tutor (`getLocalTutorReply()`) when the key is absent **or when the provider call throws** — this can mask provider failures during debugging. The AI persona is "Ustaad Noor." The `/api/chat` route enforces a daily message limit by counting `ChatMessage` rows for the current PKT day.

**Timezone** - `lib/date.ts` contains `getPKTStartOfDay()` and related helpers for streak calculations (Pakistan Time = UTC+5).

**Course locking** - `lib/course.ts` provides `buildChapterStates()` and `getUserCourseState(userId)`. Chapters are locked until the previous chapter is fully completed. `DEV_UNLOCK_ALL` only bypasses locking outside production when `DEV_UNLOCK_ALL=true`.

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

**API client:** `services/api.ts` — Axios instance that auto-injects `Authorization: Bearer <token>` from auth store on every request. Configure the base URL with `EXPO_PUBLIC_API_URL`; local physical-device testing should prefer USB reverse with `http://127.0.0.1:3000`.

**Navigation:** Expo Router file-based.
- `(auth)` group — login, register, onboarding (welcome → goal → language → level → name → placement → ready)
- `(app)` — stack wrapper with auth guard
- `(app)/(tabs)` — 4 bottom-tab destinations: Learn (`index.tsx`), Vocabulary (`vocabulary.tsx`), Noor (`chat.tsx`), You (`profile.tsx`)
- `(app)/lessons/[lessonId]/` — stack detail screens, not tabs
- Root `app/index.tsx` — branded landing screen

**Arabic text:** Always use `app/components/ArabicText.tsx` for Arabic strings — it enforces RTL and uses Scheherazade New font. Size variants: `sm | md | lg | xl`. English text uses Amiri font.

**Brand/theme:** Shared UI tokens in `warsh-app/constants/theme.ts` (WarshPalette, Colors, FontSizes, Spacing, Radii, Shadows). Use `app/components/BrandButton.tsx` for CTAs — it has `variant` (`primary | secondary | danger`) and `selected`/`loading`/`disabled` states, min height 52px. All new UI work must follow `Docs/warsh-spec-11-design-system-and-copy.md`.

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
  - Curriculum: 15 chapters / 60 lessons seeded; content still needs manual pedagogy and mobile QA
  - Splash/brand assets are placeholder quality
  - Upstash Redis rate limiting not integrated (currently counts DB rows)
  - Token refresh (`/api/auth/refresh`) is a stub
  - Achievement system: schema exists, not fully wired to lesson completion
