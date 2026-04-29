# ArabAI Phase 1 Progress Tracker

Last updated: 2026-04-29

## Phase Status

- **Phase 1 core app flow:** working end-to-end on device
- **Current focus:** Phase 1.5 content expansion, onboarding placement, and learning-flow evaluation
- **Recommended next milestone:** rethink chapter/pedagogy UX before expanding more curriculum blocks

## Current Status

- Workspace contains two active projects:
  - `arabai-app/`: Expo SDK 51 / React Native mobile app.
  - `arabai-backend/`: Next.js 14 backend API with Prisma 7 and PostgreSQL.
- Local PostgreSQL is running in Docker:
  - Container: `arabai-postgres`
  - Host: `localhost:5432`
  - Database: `arabai`
- Backend dev server is running on the local network:
  - Local: `http://localhost:3000`
  - Phone/LAN: `http://192.168.100.135:3000`
- Expo Metro is running for Expo Go on Android:
  - Manual Expo URL: `exp://192.168.100.135:8082`
  - Android bundle endpoint has been verified with HTTP 200.
- Android Studio emulator flow has also been validated with host mapping:
  - Backend from emulator: `http://10.0.2.2:3000`
  - Expo session used for emulator testing: `exp://127.0.0.1:8085`
- Expo is being started with:

```powershell
$env:EXPO_PUBLIC_API_URL='http://192.168.100.135:3000'
npx.cmd expo start --lan --port 8082
```

## What Was Fixed

- Installed app and backend dependencies.
- Fixed Prisma 7 configuration:
  - Removed duplicated `url = env("DATABASE_URL")` from `arabai-backend/prisma/schema.prisma`.
  - Kept datasource URL in `arabai-backend/prisma.config.ts`.
- Created `arabai-backend/.env` from `.env.example`.
- Updated backend `DATABASE_URL` to match Docker Compose:

```env
DATABASE_URL="postgresql://arabai:arabai_dev_password@localhost:5432/arabai"
```

- Started the Postgres Docker database from `arabai-backend/docker-compose.yml`.
- Applied Prisma migration and generated Prisma Client.
- Seeded the database.
- Fixed Expo app startup:
  - Changed `arabai-app/package.json` `main` to `expo-router/entry`.
  - Removed unused NativeWind Babel plugin and dependency because it pulled incompatible Metro packages.
  - Aligned Expo SDK 51 package versions for Metro, Expo Router, Linking, Constants, Status Bar, Font, Safe Area, Screens, Babel preset, TypeScript, and React types.
  - Added `scheme: "arabai"` to silence Expo Linking scheme warning.
- Replaced `react-native-mmkv` with `@react-native-async-storage/async-storage` because MMKV requires a custom native build and does not work in Expo Go.
- Updated auth/API storage code for async storage.
- Fixed complete JWT auth flow:
  - `POST /api/auth/register` now returns a JWT token as well as user data.
  - Login and register both persist the authenticated session in a persisted Zustand auth store.
  - Axios now injects `Authorization: Bearer <token>` on requests and defaults to the LAN backend URL when `EXPO_PUBLIC_API_URL` is not set.
- Fixed Create Account flow:
  - Register screen now includes a `Name` field.
  - Users can register directly without first completing onboarding.
  - Successful account creation now lands directly on the home screen as an authenticated user.
- Expanded Phase 1.5 curriculum content:
  - Database now seeds `10` chapters and `68` lessons for Units 1 and 2.
  - Added a dedicated curriculum seed module at `arabai-backend/prisma/curriculum-phase15.cjs`.
  - Replaced the shallow starter seed path with the Phase 1.5 beginner curriculum from `arabai-curriculum.md`.
  - Fixed corrupted Arabic seed text using valid Arabic strings.
- Added app icon configuration and generated:
  - `arabai-app/assets/icon.png`
  - `arabai-app/assets/adaptive-icon.png`
- Made Ustadh Noor usable without external AI keys:
  - Added a local fallback tutor response when `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` are not set.
- Fixed the main learning flow:
  - Chapter unlock logic now requires all lessons in all previous chapters to be completed before the next chapter unlocks.
  - Locked chapters and lessons are now enforced on the backend, not just visually in the app.
  - Lesson completion returns XP and streak data so the UI can show what changed immediately.
  - Chapter, home, chat, and profile screens refresh on focus so progress/streak/chat state stays up to date after navigation.
- Fixed streak date handling:
  - Corrected PKT day boundary logic so completing a lesson updates the daily streak correctly.
- Added Arabic typography support:
  - Downloaded `Amiri-Regular.ttf` and `Amiri-Bold.ttf` into `arabai-app/assets/fonts/`.
  - Loaded both fonts in `arabai-app/app/_layout.tsx` with `useFonts()`.
  - Upgraded `arabai-app/app/components/ArabicText.tsx` to enforce RTL Amiri styling and standardized Arabic sizing.
  - Replaced runtime raw Arabic lesson text renders with `ArabicText`.
- Implemented Noor brand system from `arabai-brand.md`:
  - Added shared brand tokens in `arabai-app/constants/theme.ts`.
  - Added reusable branded CTA component in `arabai-app/app/components/BrandButton.tsx`.
  - Restyled landing, login, register, onboarding, home, chat, profile, chapter, and lesson screens to the Noor dark lapis / gold visual system.
  - Updated copy and naming from scaffold-like `ArabAI` UI language to branded `Noor` user-facing language where appropriate.
- Fixed the tab/navigation structure:
  - Moved the real bottom navigation into `arabai-app/app/(app)/(tabs)/`.
  - Kept lesson routes as stack detail screens instead of exposing them as bottom tabs.
  - Removed the invalid extra tab entries caused by dynamic lesson routes living directly inside the tab group.
- Completed missing mobile screens that were previously scaffold-level:
  - Onboarding route files now render real branded screens.
  - Lesson play screen is implemented and connected to completion/progress APIs.
  - Profile screen is implemented and shows XP/streak/completed lesson information.
- Upgraded lesson data and lesson rendering for Phase 1.5:
  - Lesson payloads now include richer curriculum metadata such as hook, explanation, Quranic example, conversation example, Ustadh Noor tip, transliteration, and review words.
  - Lesson and chapter API responses now include `titleAr` so Arabic subtitles can be shown in the app.
  - Lesson play screen now renders bilingual learning sections instead of only a bare prompt/answer card.
  - Home and chapter screens now display Arabic chapter and lesson subtitles.
- Implemented Placement & Smart Skip (self-selection only, no quiz yet):
  - Added placement state to onboarding and auth/session payloads.
  - Added backend support for `startingChapterOrder`, `placementType`, and progress `status`.
  - Added `POST /api/placement/apply`.
  - Placement mappings currently behave as:
    - `BEGINNER` -> start Chapter 1
    - `KNOWS_LETTERS` -> skip Chapters 1-3
    - `STUDIED_BEFORE` -> skip Chapters 1-5
    - `CAN_READ_BASIC` -> skip Chapters 1-7
  - Skipped lessons are marked `SKIPPED_BY_PLACEMENT`, unlock later chapters, and do not award XP.
  - Home and chapter APIs now expose skipped state so the mobile app can show reviewable skipped chapters.
- Fixed the new-user onboarding path so placement is actually reachable:
  - The landing `Create Account` button and login `Register` link originally bypassed onboarding and jumped straight to the register screen.
  - Both entry points now route into onboarding first.
- Fixed onboarding selection UX:
  - Choice buttons now show a selected/highlighted state.
  - Goal, level, language, and placement screens now use a clearer `select then continue` pattern instead of silent state changes.
- Improved auth session payloads:
  - Login and register responses now include `nativeLanguage`, `goal`, `level`, and `xp` in the returned user object so the app can adapt lesson presentation to the learner.
- Added placement metadata to auth session payloads:
  - Login, register, and `/api/auth/me` now include `placementType` and `startingChapterOrder`.
- Reseeded the database directly with `node prisma/seed.cjs`:
  - `prisma db seed` still attempts a Prisma network checksum fetch in this environment, so the direct seed script is the reliable local fallback.
- Applied the new Prisma migration once Docker/Postgres was confirmed healthy:
  - `20260429120000_placement_smart_skip`

## Current Seed Data

Verified database counts:

```json
{"chapters":10,"lessons":68}
```

Seeded chapter path:

1. The Arabic Alphabet: Part 1
2. The Arabic Alphabet: Part 2
3. The Arabic Alphabet: Part 3 + Special Letters
4. Short Vowels (Harakat)
5. Long Vowels & Tanwin
6. Bismillah & Salah Vocabulary
7. People & Pronouns
8. The World Around Us
9. Action Words (Basic Verbs)
10. Descriptive Words (Adjectives)

## Verified Working

- PostgreSQL container is healthy.
- Prisma migration applied successfully.
- Prisma Client generation works.
- Backend `/api/health` responds.
- Register endpoint works.
- Login endpoint works.
- Placement apply endpoint works with an authenticated user.
- Protected chapter endpoint works with JWT auth wiring in code.
- Ustadh Noor chat endpoint works with local fallback response.
- Phase 1.5 curriculum seed loads successfully through `node prisma/seed.cjs`.
- Verified seeded curriculum counts are `10` chapters and `68` lessons.
- App TypeScript check passes:

```powershell
cd D:\Code\ArabAI\arabai-app
npx.cmd tsc --noEmit
```

- Android Expo bundle returns HTTP 200.
- App opens in Expo Go and the full bottom-tab flow works.
- Register, login, home, chapter, lesson, profile, and chat flows are all working on device.
- New-account onboarding now routes correctly through:
  - `welcome`
  - `goal`
  - `level`
  - `name`
  - `language`
  - `placement`
  - `ready`
  - `register`
- Bottom tab bar now shows only the intended 3 destinations:
  - `Learn`
  - `Noor`
  - `You`
- Lesson screen now shows:
  - Hook
  - Learn
  - Quranic and conversation examples
  - Ustadh Noor tip
  - Review words
- Backend TypeScript check passes:

```powershell
cd D:\Code\ArabAI\arabai-backend
npx.cmd tsc --noEmit
```

## Product Feedback / Current Concern

- The app wiring is working, but the current chapter presentation is not yet satisfactory as a learning system.
- After testing against stronger language-learning apps such as Duolingo and other Play Store / App Store products, the current conclusion is:
  - the chapter experience still feels too weak pedagogically
  - simply expanding more chapters in the same format is not enough
  - the student may not learn Arabic as effectively with the current chapter structure and progression style
- Work is intentionally paused at this point on further chapter/content rollout until there is better research on:
  - how strong language apps present progression
  - how they structure repetition, pacing, and lesson variety
  - how ArabAI/Noor should teach more effectively rather than only listing chapters

## Test Account

Because reseeding clears users, the latest known test account is:

```text
Email: mobile-test4@example.com
Password: password123
```

You can also create a new account from the app because the register form now includes name, email, and password.

## How To Run The Current Setup

### Start Database

```powershell
cd D:\Code\ArabAI\arabai-backend
docker compose up -d postgres
```

### Start Backend

```powershell
cd D:\Code\ArabAI\arabai-backend
npx.cmd next dev -H 0.0.0.0
```

### Start Expo For Physical Android Phone

Use the Windows LAN IP, not `localhost`, so the phone can reach the backend:

```powershell
cd D:\Code\ArabAI\arabai-app
$env:EXPO_PUBLIC_API_URL='http://192.168.100.135:3000'
npx.cmd expo start --lan --port 8082
```

Then scan:

```text
exp://192.168.100.135:8082
```

### Start Expo For Android Studio Emulator

Use `10.0.2.2` so the emulator can reach the backend running on the Windows host:

```powershell
cd D:\Code\ArabAI\arabai-app
$env:EXPO_PUBLIC_API_URL='http://10.0.2.2:3000'
npx.cmd expo start --lan --port 8082
```

## Important Notes

- Expo Go will show Expo Go's own launcher icon. The custom app icon appears in standalone/dev builds, not necessarily inside Expo Go.
- The app currently uses Expo Go-compatible dependencies. If native modules like MMKV are needed later, switch to an Expo development build.
- `npm audit` still reports vulnerabilities in dependency trees. These have not been force-fixed because doing so may introduce breaking changes.
- Backend `.env` contains local development credentials only.
- AI keys are not required for basic chat testing because Ustadh Noor has a local fallback.
- The current app is stable enough for continued content production; the largest product gap is depth of curriculum, not app wiring.
- Next.js dev may need to be started outside the sandbox in this environment because `next dev` can fail with `spawn EPERM` under restricted process spawning.
- Expo Metro may also need to be started outside the sandbox in this environment so file watching and bundle serving work normally.

## Remaining Work / Next Steps

1. Continue Phase 1.5 lesson polish:
   - Review any remaining mixed Arabic/Latin layout edge cases.
   - Tune sizing/spacing for Arabic-heavy lesson screens.
   - Consider using `Amiri-Bold` for headings or emphasis where appropriate.
   - Improve feedback copy and completion moments.
2. Rework the learning-system design before expanding more chapters:
   - Research how strong language-learning apps structure early progression.
   - Revisit whether a chapter list is the right primary teaching surface.
   - Design a more effective teaching loop for Arabic before seeding Units 3 and 4.
   - Use the current curriculum as content input, but not necessarily as the final UX structure.
3. Add real app assets:
   - Current icon is still a placeholder-quality asset.
   - Add splash screen branding.
   - Add any missing Noor visual assets/illustrations.
4. Add real AI configuration when ready:
   - Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`.
   - Decide the default AI provider/model.
   - Revisit whether fallback behavior should only apply when keys are absent, not when provider calls fail.
5. Clean temporary files before commit:
   - `arabai-app/bundle-test.out`
   - `arabai-app/expo-dev.out.log`
   - `arabai-app/expo-dev.err.log`
   - `arabai-app/expo-lan.out.log`
   - `arabai-app/expo-lan.err.log`
   - `arabai-app/expo-lan-8082.out.log`
   - `arabai-app/expo-lan-8082.err.log`
   - `arabai-backend/backend-dev.out.log`
   - `arabai-backend/backend-dev.err.log`
   - API test output files if present
6. Review and commit the stable working Phase 1.5 + placement baseline.
