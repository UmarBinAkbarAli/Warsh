# ArabAI Phase 1 Progress Tracker

Last updated: 2026-04-27

## Current Status

- Workspace contains two scaffolded projects:
  - `arabai-app/`: Expo / React Native mobile app.
  - `arabai-backend/`: Next.js backend API project with Prisma.
- Mobile app dependencies are installed and Metro is currently reachable at `http://localhost:8081`.
- Backend dependencies are installed, but the backend is **not currently listening** on `http://localhost:3000`.
- `arabai-app/.env` currently points API calls to:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APP_VERSION=1.0.0
```

- For Android Emulator testing, this API URL should be changed to `http://10.0.2.2:3000` because emulator `localhost` points to the emulator, not the Windows host.

## What Has Been Implemented So Far

- Initial app and backend scaffolds exist.
- `arabai-app` includes app routes and folders for:
  - app shell
  - auth flow
  - components
  - hooks
  - services
  - stores
- `arabai-backend` includes:
  - Next.js API folder structure
  - Prisma schema and migrations folder
  - seed scripts
  - auth, Prisma, date, and Anthropic helper modules
- Environment files exist for both projects.
- Dependencies have been installed for both projects.

## Startup / Testing Work Completed

- Started investigating how to run the app locally.
- Confirmed backend script:

```powershell
cd arabai-backend
npm run dev
```

- Confirmed mobile script:

```powershell
cd arabai-app
npm start
```

- Backend initially started on `localhost:3000`, but later checks show it is no longer running.
- Expo initially failed because the wrong Metro version was hoisted into the app root.
- Fixed Expo startup by pinning Expo SDK 51-compatible Metro packages in `arabai-app/package.json` and `package-lock.json`:
  - `metro@^0.80.12`
  - `metro-config@^0.80.12`
  - `metro-core@^0.80.12`
  - `metro-transform-worker@^0.80.12`
- Confirmed Metro is currently responding with HTTP 200 at `http://localhost:8081`.
- Confirmed current port status:
  - `8081`: listening, Expo Metro.
  - `3000`: not listening, backend needs to be restarted.

## How To Test Now

### Android Emulator

1. Start an Android Virtual Device from Android Studio Device Manager.
2. Update `arabai-app/.env` for emulator backend access:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
EXPO_PUBLIC_APP_VERSION=1.0.0
```

3. Start the backend:

```powershell
cd D:\OneDrive\Documents\ArabAI\arabai-backend
npm run dev
```

4. Start or restart the mobile app:

```powershell
cd D:\OneDrive\Documents\ArabAI\arabai-app
npm start
```

5. Open the app in the emulator from Expo / Metro.

### Physical Android Device

For a real phone on the same Wi-Fi, use the computer LAN IP instead of `localhost`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:3000
```

## Issues / Blockers

- Backend is not currently running on port `3000`; it must be restarted before API-backed app testing.
- Windows sandboxing caused `EPERM` errors when Next.js and Metro attempted to spawn worker processes. Running dev servers outside the sandbox worked better.
- Expo dependency health is not perfect. Expo CLI reported several package version warnings:
  - `expo-font`
  - `expo-status-bar`
  - `react-native-safe-area-context`
  - `react-native-screens`
  - `@types/react`
  - `babel-preset-expo`
  - `typescript`
- `npm audit` reports vulnerabilities in the current dependency tree. These were not addressed yet because forced audit fixes may introduce breaking changes.
- The app still needs real end-to-end validation through the Android Emulator after the backend is restarted and the emulator API URL is set.

## Next Steps

1. Change `arabai-app/.env` to `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000` for Android Emulator testing.
2. Restart the backend on `localhost:3000`.
3. Restart Expo Metro after the `.env` change.
4. Launch the Android Emulator and run the app.
5. Test the main Phase 1 flows:
   - registration / login
   - onboarding
   - lesson screens
   - progress / XP / streak behavior
   - chat flow
6. Align Expo package versions with SDK 51 recommendations.
7. Add or run automated checks once the runtime path is stable.
