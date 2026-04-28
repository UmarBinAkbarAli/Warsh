# ArabAI Phase 1 Progress Tracker

Last updated: 2026-04-28

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
  - Phone/LAN: `http://192.168.2.101:3000`
- Expo Metro is running for Expo Go on Android:
  - Manual Expo URL: `exp://192.168.2.101:8081`
  - Android bundle endpoint has been verified with HTTP 200.
- Expo is being started with:

```powershell
$env:EXPO_PUBLIC_API_URL='http://192.168.2.101:3000'
npx.cmd expo start --lan --clear
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
- Expanded seed content:
  - Database now seeds `5` chapters and `16` lessons.
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

## Current Seed Data

Verified database counts:

```json
{"chapters":5,"lessons":16,"users":1}
```

Seeded chapter path:

1. Alphabet
2. Joining Letters
3. Short Vowels
4. First Quran Words
5. Daily Phrases

## Verified Working

- PostgreSQL container is healthy.
- Prisma migration applied successfully.
- Prisma Client generation works.
- Backend `/api/health` responds.
- Register endpoint works.
- Login endpoint works.
- Protected chapter endpoint works with JWT auth wiring in code.
- Ustadh Noor chat endpoint works with local fallback response.
- App TypeScript check passes:

```powershell
cd D:\Code\ArabAI\arabai-app
npx.cmd tsc --noEmit
```

- Android Expo bundle returns HTTP 200.
- App opens in Expo Go and reaches the login screen.
- Backend TypeScript check passes:

```powershell
cd D:\Code\ArabAI\arabai-backend
npx.cmd tsc --noEmit
```

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
$env:EXPO_PUBLIC_API_URL='http://192.168.2.101:3000'
npx.cmd expo start --lan --clear
```

Then scan:

```text
exp://192.168.2.101:8081
```

## Important Notes

- Expo Go will show Expo Go's own launcher icon. The custom app icon appears in standalone/dev builds, not necessarily inside Expo Go.
- The app currently uses Expo Go-compatible dependencies. If native modules like MMKV are needed later, switch to an Expo development build.
- `npm audit` still reports vulnerabilities in dependency trees. These have not been force-fixed because doing so may introduce breaking changes.
- Backend `.env` contains local development credentials only.
- AI keys are not required for basic chat testing because Ustadh Noor has a local fallback.

## Remaining Work / Next Steps

1. Test the complete phone flow again:
   - Create account
   - Confirm direct landing on home after register
   - View chapter locking/unlocking on device
   - Open Chapter 1
   - Complete a lesson
   - Confirm XP/streak changes in profile
   - Use Ustadh Noor chat
2. Continue polishing lesson UI and Arabic rendering:
   - Review any remaining mixed Arabic/Latin layout edge cases.
   - Tune sizing/spacing for Arabic-heavy lesson screens.
   - Consider using `Amiri-Bold` for headings or emphasis where appropriate.
3. Add real app assets:
   - Current icon is a simple generated placeholder.
   - Add splash screen branding.
4. Add real AI configuration when ready:
   - Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`.
   - Decide the default AI provider/model.
5. Clean temporary files before commit:
   - `arabai-app/bundle-test.out`
   - `arabai-app/expo-lan.log`
   - `arabai-app/expo-lan.err.log`
   - `arabai-app/expo-start.log`
   - `arabai-app/expo-start.err.log`
   - `arabai-backend/backend-dev.log`
   - `arabai-backend/backend-dev.err.log`
   - API test output files if present
6. Review and commit the stable working baseline.
