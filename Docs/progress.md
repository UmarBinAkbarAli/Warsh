# ArabAI Phase 1 Progress Tracker

Last updated: 2026-05-21

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
- **Phase 1.5 Warsh reader curriculum:** implemented as a 15-chapter interactive seed
- **Current focus:** physical Android device testing, especially auth/signup/login against the local backend, then full lesson playback QA across the new Warsh exercise formats
- **Recommended next milestone:** stabilize local device networking/auth, then manually QA the early reader lesson, matching, grammar parse, conversation builder, and final lecture 15 lesson flows

## Build and Testing Status

- First APK build was generated through Expo Cloud earlier
- A fresh local Android debug APK was also built and installed on the connected physical Android device for current QA
- Backend build passed after the 15-chapter curriculum update
- App TypeScript check for the edited lesson player passed
- App TypeScript check passed after adding the Vocabulary tab and Warsh identity copy updates
- Backend TypeScript check passed after switching Noor to the OpenAI-only helper path
- Backend TypeScript check passed after making `DEV_UNLOCK_ALL` development-only
- App TypeScript check passed after adding an API timeout and clearer auth/network errors
- App TypeScript check passed after correcting the register screen Arabic brand mark
- App TypeScript check passed after adding `arabai-app/.env.example` and typing `EXPO_PUBLIC_ENVIRONMENT`
- Backend auth API smoke test passed locally against `http://127.0.0.1:3000`:
  - register returned a JWT
  - placement apply succeeded
  - wrong-password login returned `401`
  - correct login returned a JWT
  - `/api/auth/me` returned the logged-in user
- Physical Android device was authorized through ADB and USB reverse was restored for `3000` and `8081`
- Expo Go could not run the app because installed Expo Go targets SDK 54 while the project uses Expo SDK 51
- Native Android debug app was installed/launched via `expo run:android` after setting `JAVA_HOME`
- Login through the native Android app UI succeeded:
  - app accepted a backend-created test account
  - backend logged `POST /api/auth/login 200`
  - app routed to the Learn tab
- Signup/account creation through the native Android app UI succeeded:
  - app completed the onboarding path with `QURAN`, `BEGINNER`, `ur`, and Chapter 1 as the starting point
  - register form accepted a fresh test email and password
  - backend logged `POST /api/auth/register 201`
  - backend logged `POST /api/placement/apply 200`
  - app routed to the Learn tab after signup
  - Learn loaded the chapter list on-device after signup, including Chapter 1 with `0 / 4 lessons completed`
- Noor post-login loading through the native Android app UI succeeded:
  - app opened the Noor tab after login
  - Noor header, daily message counter, input, and Send button rendered
  - backend logged `GET /api/chat/history 200`
  - no Neon/Prisma post-login loading failure appeared during the Noor check
- Native keep-awake warning fix was implemented structurally:
  - `expo-keep-awake` is now a direct app dependency
  - app TypeScript check passed
  - Expo Android autolinking now resolves `expo.modules.keepawake.KeepAwakeModule`
  - final warning disappearance still needs confirmation after the next native Android rebuild
- Backend Neon connectivity was rechecked and the post-login data endpoints now pass locally against the configured Neon database:
  - direct PostgreSQL `select 1` succeeded
  - `POST /api/auth/register` returned a JWT using the app's real `QURAN` goal enum
  - `POST /api/placement/apply` completed
  - `GET /api/chapters` returned `15` chapters and `4` lessons in chapter 1
  - `GET /api/progress` returned an empty completed lesson list for a fresh test account
  - `GET /api/chat/history` returned an empty message list for a fresh test account
- App lint is not currently runnable because `arabai-app/` has no ESLint config file
- Curriculum validation passed:
  - `15` chapters
  - `60` lessons
  - every chapter has `4` lessons
  - every lesson has hook, discover cards, exercises, reveal content, reveal ayah, and Noor tip
  - every practice set uses at least 3 formats and includes `TRUE_FALSE`
- `npm run db:seed` completed successfully after replacing the old seed
- Local DB count was verified at:
  - `15` chapters
  - `60` lessons
- Android physical device testing is in progress:
  - Android device is now authorized in ADB
  - native debug app is installed as `com.arabai.app`
  - native app launched on device
  - login screen accepted credentials and reached the Learn tab
  - backend health was verified locally on port `3000` during auth API smoke testing
  - USB reverse was configured for `8081` and `3000`
  - Expo Go is not usable for this project on the current device because Expo Go is SDK 54 and the project is SDK 51
  - signup/account-creation through the app UI now passes
  - Learn post-login loading now passes on-device after signup
  - Noor post-login loading now passes on-device
  - the dev warning overlay `Unable to activate keep awake` has a structural fix in place and needs confirmation after a native rebuild

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
  - `15` chapters
  - `60` lessons
- The current seed replaces the earlier starter curriculum rather than appending to it
- Chapter order follows reader lecture filename order, not lecture frontmatter
- The new seed is authored as interactive lessons based on `Docs/warsh_chapter_flow_system.html`, not as raw markdown dumps
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
- Lesson payload/rendering supports the Warsh 5-beat lesson anatomy:
  - hook
  - discover
  - practice
  - reveal
  - close
- Lesson payload/rendering supports richer content fields including:
  - Quranic hook
  - discover pattern cards
  - reveal grammar concept
  - reveal ayah
  - Ustadh Noor tip
  - XP close step
- Lesson UI supports:
  - flashcard flow
  - true/false practice
  - tap translation
  - fill blank
  - build sentence
  - matching
  - grammar parse
  - conversation builder
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
- Bottom tab bar now matches the Warsh spec tab structure:
  - `Learn`
  - `Vocabulary`
  - `Noor`
  - `You`
- Lesson routes remain stack/detail screens rather than tab screens
- Implemented mobile surfaces include:
  - landing
  - login
  - register
  - onboarding flow
  - home/chapters
  - vocabulary bank starter screen
  - lesson play
  - chat
  - profile

### Branding and Arabic support

- Arabic fonts are included:
  - `Amiri-Regular.ttf` / `Amiri-Bold.ttf` (used for English body text)
  - `Scheherazade New` / `Scheherazade New Bold` / `Scheherazade New SemiBold` / `Scheherazade New Medium` (used for Arabic text)
- Fonts are loaded in the app layout
- `ArabicText` is used to standardize Arabic rendering and RTL presentation (uses Scheherazade New)
- Noor-style branding is implemented across major app screens
- Entry and onboarding welcome surfaces now present `Warsh / وَرْش` instead of using Noor as the app brand mark
- Register screen now also presents `وَرْش` as the Arabic app brand mark

## Important Code Reality

The repo is in a stronger state than the old tracker wording suggested, but a few details still matter:

- The app name in `arabai-app/app.json` is **"Warsh"** (package: `com.arabai.app`, scheme: `arabai`)
- The mobile API client uses `EXPO_PUBLIC_API_URL` and falls back to `https://warsh-backend.vercel.app` in `arabai-app/app/services/api.ts`
- `arabai-app/.env.example` documents the preferred local mobile environment:
  - `EXPO_PUBLIC_API_URL=http://127.0.0.1:3000`
  - `EXPO_PUBLIC_ENVIRONMENT=development`
- For physical-device local testing, USB reverse is currently more reliable than Wi-Fi:
  - `adb reverse tcp:8081 tcp:8081`
  - `adb reverse tcp:3000 tcp:3000`
  - Metro should be started with `EXPO_PUBLIC_API_URL=http://127.0.0.1:3000`
- The Android debug manifest currently allows cleartext HTTP for local development
- `npm run db:seed` is destructive for local data: it clears users, progress, chat messages, achievements, lessons, and chapters before reseeding
- `DEV_UNLOCK_ALL` in `arabai-backend/lib/course.ts` is now development-only; it only bypasses locking when `NODE_ENV !== "production"` and `DEV_UNLOCK_ALL=true`
- The mobile API client now times out after 10 seconds and exposes clearer backend/network/auth error messages through `getApiErrorMessage`
- Noor backend generation now uses `arabai-backend/lib/openai.ts` with `OPENAI_MODEL` defaulting to `gpt-4o-mini`
- Noor still falls back to the local tutor response when `OPENAI_API_KEY` is missing or the provider call throws - this can mask real provider errors during debugging
- Runtime health claims such as "server is running" or "Expo bundle returned 200" are environment checks, not source-of-truth code facts
- The visual/design source of truth is `Docs/warsh-brand-ui-sot.md`

## Recent Changes (since 2026-05-05)

- Replaced the earlier curriculum seed with the compiled 15-reader-lecture Warsh sequence
- Rewrote `arabai-backend/prisma/curriculum-phase15.cjs` as the canonical 15-chapter interactive curriculum
- Added `arabai-backend/prisma/validate-curriculum.cjs`
- Added backend script:
  - `npm run db:validate-seed`
- Extended mobile lesson playback to support Warsh interaction formats:
  - `MATCHING`
  - `GRAMMAR_PARSE`
  - `CONVERSATION_BUILDER`
- Kept existing practice formats:
  - `TRUE_FALSE`
  - `TAP_TRANSLATION`
  - `FILL_BLANK`
  - `BUILD_SENTENCE`
- Kept `FLASHCARD` behavior as part of lesson/discover flow
- Updated Ustadh Noor backend curriculum prompt from the old 5-chapter framing to the 15-chapter reader sequence
- Added the fourth bottom tab, `Vocabulary`, with a starter free vocabulary bank surface and local search
- Updated tab labels/order to match spec 01: `Learn | Vocabulary | Noor | You`
- Updated entry/onboarding brand presentation from Noor-facing copy to `Warsh / وَرْش`
- Switched Noor backend provider wiring to OpenAI-only and removed Anthropic config/dependency
- Renamed the backend AI helper from `lib/anthropic.ts` to `lib/openai.ts`
- Verified app and backend TypeScript checks after the spec 01 implementation slices
- Made `DEV_UNLOCK_ALL` development-only so production cannot accidentally ship with chapter locking bypassed
- Added a 10-second axios timeout and clearer login/register error messages for unreachable backend, timeout, and invalid credentials cases
- Corrected the register screen Arabic brand mark from Noor to Warsh and verified there are no remaining `نُور` app-brand marks
- Added `arabai-app/.env.example`, typed `EXPO_PUBLIC_ENVIRONMENT`, and updated developer setup docs to prefer USB reverse instead of machine-specific LAN IPs
- Verified backend auth endpoints locally: register, placement apply, wrong-password rejection, login, and `/api/auth/me`
- Rechecked configured Neon connectivity and verified the backend-side post-login data endpoints locally: `/api/chapters`, `/api/progress`, and `/api/chat/history`
- Reconnected/authorized the Android device through ADB
- Verified native Android app login through the app UI using a backend-created test account
- Verified native Android signup/account creation through the app UI using a fresh test account, including placement apply and Learn tab loading
- Verified native Android Noor tab loading after login, including a successful `/api/chat/history` backend call
- Added `expo-keep-awake` as a direct app dependency so Android autolinking includes the native keep-awake module
- Earlier post-login backend failures from Prisma Neon reachability errors (`P1001/P1017`) were not reproduced in the latest backend-side check
- Ran seed validation, backend build, TypeScript check for the app lesson player, and database seed successfully
- Started physical Android device QA through ADB using a connected TECNO device
- Installed a fresh local debug APK on the device after deleting the old app
- Confirmed backend health locally and identified that direct phone-to-PC Wi-Fi access to port `3000` times out
- Configured ADB reverse for local device testing over USB
- Earlier Phase 1 work completed before the 15-chapter replacement:
  - first Expo Cloud APK build completed and downloaded for testing
  - chapter list API (`GET /api/chapters`) was enriched with completion/skip state and lesson counts
  - chapter lessons API (`GET /api/chapters/[id]/lessons`) was enriched and returns `403 chapter_locked` for locked chapters
  - `lib/course.ts` was refactored to derive chapter lock state from completed and skipped lessons
  - `CLAUDE.md` was updated with brand SOT path, env vars, error codes, lesson types, `DEV_UNLOCK_ALL`, and API endpoint reference

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
- Warsh identity copy was corrected on the app entry and onboarding welcome screens
- Warsh identity copy was corrected on the register screen
- Vocabulary starter tab was added
- Noor provider wiring was aligned to OpenAI `gpt-4o-mini`
- `DEV_UNLOCK_ALL` was guarded so it cannot bypass locking in production
- API timeout and auth/network error messaging were added to reduce hanging login/signup states
- Mobile local networking setup was documented through `arabai-app/.env.example` and updated developer guidance
- Invalid tab exposure from lesson routes was removed
- Missing scaffold-level screens were replaced with implemented screens
- Placement and smart skip were added
- Auth session payloads were expanded with learner metadata
- Placement metadata was added to auth payloads and `/api/auth/me`
- Placement migration was added:
  - `20260429120000_placement_smart_skip`
- Prisma seed script is configured to use:
  - `node prisma/seed.cjs`
- Warsh curriculum validation script is configured to use:
  - `node prisma/validate-curriculum.cjs`

## Product Assessment

- The app is no longer at a scaffold-only stage
- Core app wiring for Phase 1 is implemented across mobile + backend
- The major curriculum quantity gap has been addressed by replacing the starter seed with 15 Warsh reader chapters
- The main current risk is runtime QA, especially auth on a physical device and playback of the new exercise formats

Current product concern:
- the Warsh flow system is implemented in the seed and lesson player, but it has not yet had enough manual mobile QA
- generated lesson content should still be reviewed for pedagogy, ayah relevance, repetition quality, and learner pacing
- progression and placement behavior still need device-level verification after the new seed

## Remaining Work

1. Manually QA the new lesson player formats:
   - early reader lesson
   - matching exercise
   - grammar parse exercise
   - conversation builder
   - lecture 15 final lesson
2. Verify runtime APIs after local seed:
   - `GET /api/chapters`
   - `GET /api/chapters/:id/lessons`
   - `GET /api/lessons/:id`
3. Rebuild the native Android app and confirm the keep-awake warning no longer appears:
   - `Unable to activate keep awake`
4. Add stronger app assets:
   - polished icon
   - splash treatment
   - supporting branded visuals if desired
5. Add real AI provider configuration when ready:
   - `OPENAI_API_KEY`
   - optional `OPENAI_MODEL` override if not using the default `gpt-4o-mini`
6. Run fresh runtime verification when needed for local development:
   - database
   - backend dev server
   - Expo session
   - authenticated mobile flows
7. Clean temporary logs and local test artifacts before commit if they are not needed.

## Current Source-Of-Truth Summary

As of 2026-05-21:
- the codebase implements the full Phase 1 app loop
- the native Android app is installed and launching on the authorized physical device
- onboarding, auth, placement, progression, lesson play, chat, and profile flows exist in code
- backend auth endpoints have passed a local API smoke test
- native Android app login and signup now succeed through the UI; backend-side Neon checks pass, Learn loads on-device after signup, and Noor history loads on-device after login
- the backend enforces locked progression and placement skipping, with `DEV_UNLOCK_ALL` guarded for development only
- the curriculum seed is now at 15 chapters / 60 lessons using the Warsh flow system
- the mobile lesson player supports the new Warsh practice formats required by the seed
- chapter and chapter-lessons APIs now return full enriched state (completion, skip flags, counts)
- the bottom tab shell now matches the Warsh spec structure: `Learn | Vocabulary | Noor | You`
- Noor backend wiring is OpenAI-only with `gpt-4o-mini` as the default model
- mobile local networking setup is documented with `.env.example` and USB reverse guidance
- `expo-keep-awake` is now directly declared so the native keep-awake module is included by Android autolinking on rebuild
- the biggest immediate gap is manual QA of the new lesson formats
