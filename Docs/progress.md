# ArabAI Phase 1 Progress Tracker

Last updated: 2026-05-05

## Purpose

This file is the source of truth for current app progress as reflected in the codebase.

It is intended to track:
- what is implemented in the repo
- what has been structurally integrated into the app/backend
- what still needs product, content, or engineering work

It should not be treated as a permanent record of:
- temporary LAN IPs
- one-off Expo session URLs
- whether a local server happened to be running on a specific machine
- whether a specific throwaway test account still exists after reseeding

## Current Phase

- **Phase 1 core app flow:** implemented
- **Current focus:** stabilize the Phase 1.5 learning experience and improve the teaching loop before expanding more content
- **Recommended next milestone:** redesign the chapter/lesson progression UX based on stronger pedagogy, then continue curriculum rollout

## Workspace Status

The workspace contains two active projects:
- `arabai-app/`: Expo SDK 51 / React Native mobile app
- `arabai-backend/`: Next.js 14 backend API with Prisma 7 and PostgreSQL

## Implemented In Code

### App foundation

- Expo Router entry is configured in `arabai-app/package.json`
- App uses Expo Go-compatible storage with `@react-native-async-storage/async-storage`
- Auth state is persisted in a Zustand store
- Axios injects JWT auth on protected requests
- Shared visual tokens are defined in `arabai-app/constants/theme.ts`
- Branded reusable UI components exist, including:
  - `ArabicText`
  - `BrandButton`

### Authentication

- `POST /api/auth/register` creates a user and returns:
  - user data
  - JWT token
- `POST /api/auth/login` returns:
  - user data
  - JWT token
- `GET /api/auth/me` returns the current authenticated user
- Session payloads include:
  - `nativeLanguage`
  - `goal`
  - `level`
  - `xp`
  - `placementType`
  - `startingChapterOrder`

### Onboarding and account creation

- The landing screen routes new users into onboarding before registration
- The login screen's register link routes into onboarding
- Onboarding route sequence exists in app code:
  1. `welcome`
  2. `goal`
  3. `level`
  4. `name`
  5. `language`
  6. `placement`
  7. `ready`
  8. `register`
- Onboarding state is persisted in a store
- Selection-based onboarding screens visibly show chosen state
- Register screen uses onboarding-collected data and then applies placement

### Placement and smart skip

- Placement data model exists on `User`:
  - `placementType`
  - `startingChapterOrder`
- Placement apply endpoint exists:
  - `POST /api/placement/apply`
- Placement mappings currently implemented:
  - `BEGINNER` -> Chapter 1
  - `KNOWS_LETTERS` -> Chapter 4
  - `STUDIED_BEFORE` -> Chapter 6
  - `CAN_READ_BASIC` -> Chapter 8
- Earlier lessons for advanced starting points are marked with progress status:
  - `SKIPPED_BY_PLACEMENT`
- Skipped lessons:
  - unlock later chapters
  - remain reviewable
  - do not award XP

### Curriculum and progression

- Backend seed uses `arabai-backend/prisma/seed.cjs`
- Phase 1.5 curriculum source is `arabai-backend/prisma/curriculum-phase15.cjs`
- Seeded curriculum currently contains:
  - `10` chapters
  - `68` lessons
- Chapter progression is enforced on the backend
- A chapter unlocks only when all lessons in all previous chapters are either:
  - completed
  - skipped by placement
- Lesson and chapter APIs expose:
  - completion state
  - skipped-by-placement state
  - Arabic titles via `titleAr`

### Lesson experience

- Lesson screen is implemented in `arabai-app/app/(app)/lessons/[lessonId]/play.tsx`
- Lesson payload/rendering supports richer content fields including:
  - hook
  - explanation
  - Quranic example
  - conversation example
  - Ustadh Noor tip
  - transliteration
  - review words
- Lesson UI supports:
  - flashcard flow
  - multiple-choice style practice
  - bilingual display logic
  - completion feedback
- Lesson completion endpoint returns immediate progress data including:
  - `xpEarned`
  - `totalXp`
  - `currentStreak`
  - `longestStreak`

### Streak and progress

- Progress rows store a `status` field with explicit values such as:
  - `NOT_STARTED`
  - `COMPLETED`
  - `SKIPPED_BY_PLACEMENT`
- Lesson completion updates user XP
- Streak tracking exists in backend code
- PKT-aware streak date logic exists in `arabai-backend/lib/date.ts`

### Navigation and screen structure

- The real bottom tabs live in `arabai-app/app/(app)/(tabs)/`
- Bottom tab bar currently exposes only:
  - `Learn`
  - `Noor`
  - `You`
- Lesson routes remain stack/detail screens rather than tab screens
- Implemented mobile surfaces include:
  - landing
  - login
  - register
  - onboarding flow
  - home/chapters
  - lesson play
  - chat
  - profile

### Branding and Arabic support

- Arabic fonts are included:
  - `Amiri-Regular.ttf`
  - `Amiri-Bold.ttf`
- Fonts are loaded in the app layout
- `ArabicText` is used to standardize Arabic rendering and RTL presentation
- Noor-style branding is implemented across major app screens

## Important Code Reality

The repo is in a stronger state than the old tracker wording suggested, but a few details still matter:

- The mobile UI brands the experience as `Noor`, but `arabai-app/app.json` still has the Expo app name set to `ArabAI`
- The mobile API client currently falls back to a hardcoded LAN URL in `arabai-app/app/services/api.ts`
- Runtime health claims such as "server is running" or "Expo bundle returned 200" are environment checks, not source-of-truth code facts

## What Was Fixed / Added So Far

- Prisma 7 configuration was aligned to use datasource configuration without the old duplicated schema URL field
- Backend env/example and local PostgreSQL workflow were set up for Prisma + Postgres development
- Expo Router entry configuration was fixed
- Expo Go compatibility issues were resolved by replacing MMKV with AsyncStorage
- JWT login/register flow was completed
- Register flow was extended to include name and onboarding-linked setup
- Phase 1.5 curriculum seed replaced the shallow starter curriculum
- Corrupted Arabic seed text was replaced with valid strings
- App icon and adaptive icon assets were added
- Local tutor fallback was added so chat can still respond without external AI keys
- Locked chapter/lesson rules were moved into backend enforcement
- Screens refresh on focus to keep chapter/progress/chat/profile state fresh after navigation
- PKT streak logic was fixed
- Arabic typography support was added
- Noor brand styling was rolled out through the app
- Invalid tab exposure from lesson routes was removed
- Missing scaffold-level screens were replaced with implemented screens
- Placement and smart skip were added
- Auth session payloads were expanded with learner metadata
- Placement metadata was added to auth payloads and `/api/auth/me`
- Placement migration was added:
  - `20260429120000_placement_smart_skip`
- Prisma seed script is configured to use:
  - `node prisma/seed.cjs`

## Product Assessment

- The app is no longer at a scaffold-only stage
- Core app wiring for Phase 1 is implemented across mobile + backend
- The main weakness is not plumbing; it is the quality of the learning system itself

Current product concern:
- the chapter experience is still too weak pedagogically
- simply adding more chapters in the same format is not enough
- the app needs a better early-learning loop, stronger repetition design, and clearer progression mechanics before large content expansion

## Remaining Work

1. Rework the learning-system design before expanding more curriculum.
2. Review and improve lesson pedagogy, not just lesson quantity.
3. Remove machine-specific assumptions from app networking.
4. Decide whether the app's official product name in Expo config should remain `ArabAI` or change to `Noor`.
5. Add stronger app assets:
   - polished icon
   - splash treatment
   - supporting branded visuals if desired
6. Add real AI provider configuration when ready:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
   - provider/model decision
7. Run fresh runtime verification when needed for local development:
   - database
   - backend dev server
   - Expo session
   - authenticated mobile flows
8. Clean temporary logs and local test artifacts before commit if they are not needed.

## Current Source-Of-Truth Summary

As of 2026-05-05:
- the codebase implements the full Phase 1 app loop
- onboarding, auth, placement, progression, lesson play, chat, and profile flows exist in code
- the backend enforces locked progression and placement skipping
- the curriculum seed is at 10 chapters / 68 lessons
- the biggest gap is product/pedagogy quality, not basic app wiring
