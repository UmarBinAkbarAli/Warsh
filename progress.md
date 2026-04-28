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
- Fixed Create Account flow:
  - Register screen now includes a `Name` field.
  - Users can register directly without first completing onboarding.
- Expanded seed content:
  - Database now seeds `5` chapters and `16` lessons.
  - Fixed corrupted Arabic seed text using valid Arabic strings.
- Added app icon configuration and generated:
  - `arabai-app/assets/icon.png`
  - `arabai-app/assets/adaptive-icon.png`
- Made Ustadh Noor usable without external AI keys:
  - Added a local fallback tutor response when `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` are not set.

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
- Ustadh Noor chat endpoint works with local fallback response.
- App TypeScript check passes:

```powershell
cd D:\Code\ArabAI\arabai-app
npx.cmd tsc --noEmit
```

- Android Expo bundle returns HTTP 200.
- App opens in Expo Go and reaches the login screen.

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
   - Login
   - View all chapters
   - Open first chapter
   - Complete lessons
   - Check progress/streak updates
   - Use Ustadh Noor chat
2. Improve chapter unlocking logic:
   - Current chapter locking is basic and should require all previous chapter lessons to be completed.
3. Improve lesson UI and Arabic rendering:
   - Better RTL layout.
   - Better Arabic font support.
   - More polished exercise interactions.
4. Add real app assets:
   - Current icon is a simple generated placeholder.
   - Add splash screen branding.
5. Add real AI configuration when ready:
   - Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`.
   - Decide the default AI provider/model.
6. Clean temporary files before commit:
   - `arabai-app/bundle-test.out`
   - `arabai-app/expo-lan.log`
   - `arabai-app/expo-lan.err.log`
   - `arabai-app/expo-start.log`
   - `arabai-app/expo-start.err.log`
   - `arabai-backend/backend-dev.log`
   - `arabai-backend/backend-dev.err.log`
   - API test output files if present
7. Review and commit the stable working baseline.
