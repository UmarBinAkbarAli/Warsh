# Warsh Release & Deployment Runbook

Moved out of `AGENTS.md` to keep the always-loaded agent guide small. Read this
**before** any Android release build, Play upload, release gate, or Vercel/production
deployment. It is as binding as `AGENTS.md`.

## Android release builds

Any Android release build **must** have the production values exported in the shell
before Gradle runs. Expo reads `EXPO_PUBLIC_*` from the shell first and otherwise
falls back to `warsh-app/.env`, which points at the local dev backend
(`http://127.0.0.1:3000`, `ENVIRONMENT=development`). A release built without them
bakes the localhost URL into the shipped bundle, and every request fails on a real
device with "Warsh could not reach the backend" — while still working on the
emulator, where `start-warsh.ps1` sets up ADB reverse. The fallback also sets
`ENVIRONMENT=development`, which disarms the localhost guard in
`warsh-app/services/api.ts`. **This shipped to Play twice (2026-07-26, 2026-08-19.)**

```powershell
cd warsh-app\android
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$env:EXPO_PUBLIC_API_URL = "https://api.warsh.app"
$env:EXPO_PUBLIC_ENVIRONMENT = "production"
# Sentry DSN + Mixpanel token come from the gitignored warsh-app/.env.release
# (client keys, not secrets). 1.0.9 shipped with neither, so no crash report or
# analytics event ever left a production device; the verifier below now fails a
# bundle that lacks them.
Get-Content ..\.env.release | Where-Object { $_ -match "^(EXPO_PUBLIC_[A-Z_]+)=(.+)$" } |
  ForEach-Object { Set-Item -Path "env:$($Matches[1])" -Value $Matches[2] }
$env:SENTRY_DISABLE_AUTO_UPLOAD = "true"
$env:SENTRY_DISABLE_NATIVE_DEBUG_UPLOAD = "true"
# R8 runs on every release build (gradle.properties). The Sentry Android Gradle
# plugin uploads the mapping only when this org token is present; it lives in
# the build machine's user environment, never in the repo or .env files.
$env:SENTRY_AUTH_TOKEN = [Environment]::GetEnvironmentVariable('SENTRY_AUTH_TOKEN', 'User')
.\gradlew bundleRelease --console=plain   # then assembleRelease for the APK —
                                          # separate invocations; one Gradle run
                                          # doing both exhausted the JVM metaspace
```

R8 keep rules live in `warsh-app/android/app/proguard-rules.pro`. Expo's Kotlin
runtime (`expo.modules.**`) must stay unminified: it builds records through
kotlin-reflect, and the first optimised build drew no illustrations. Any new
native module that is reached by reflection or JNI needs a rule there, and the
release APK must be walked through the regression matrix in
`Docs/proposals/android-quality-2027-implementation-plan.md` §A3 before upload.
`verify:release-api-url` fails a bundle whose R8 mapping or Sentry ProGuard UUID
is missing.

Release signing additionally requires `WARSH_UPLOAD_STORE_PASSWORD`,
`WARSH_UPLOAD_KEY_PASSWORD`, and `WARSH_UPLOAD_KEY_ALIAS` in the environment.
`warsh-app/android/app/build.gradle` fails the build if any of the above is missing
or non-HTTPS, but never ship on that guard alone — verify the artifact itself.

Bump `versionCode` in **both** `warsh-app/android/app/build.gradle` and
`warsh-app/app.json` before uploading; Play rejects a repeated version code.

Never re-pin the NDK to 26.x — it breaks Play's 16 KB page-size requirement. Keep
it at 27.x.

Whenever you build a production `.aab` for Play, also build the matching `.apk` and
smoke-test it on the emulator before handing the bundle over.

## Release gate

Run all of this before any release. Source checks alone cannot catch a bundle built
with the wrong environment, so the artifact itself is inspected.

```powershell
cd warsh-backend
npm run db:generate
npm run db:validate-fixtures
npm run db:audit-urdu
npm run build

cd ..\warsh-app
npm run lint -- --quiet
npx tsc --noEmit

npm run verify:release-api-url    # asserts https://api.warsh.app is baked in,
                                  # no localhost/LAN URL survives, and the Sentry
                                  # DSN + Mixpanel token from .env.release are present
npm run verify:play-signing       # asserts the Play upload certificate
```

`verify:release-api-url` accepts an optional path and defaults to
`android/app/build/outputs/bundle/release/app-release.aab`.

Before any release that carries content, and after any Studio editing session:

```powershell
cd warsh-backend
npm run content:check      # exits 1 while Studio edits are missing from Git
npm run content:export     # pull them into prisma/fixtures, then commit
```

`npm run content:sync` refuses to run while the database holds unexported work.

### Runtime validation

- Backend health returns 200.
- Register/login/refresh/password-reset flows work.
- Protected course and progress endpoints return the expected envelopes.
- Android and web load the same production API through their supported origins.
- Chapter lock and completion rules hold server-side.
- Trial access lasts 30 full days regardless of chapter progress; after expiry,
  paid lesson retrieval/completion, Noor, Tadabbur, and catalogue audio return
  `subscription_required` while vocabulary endpoints remain available.
- Media URLs load from the configured public R2 host.
- IAP is tested from a Play-installed tester build, not a sideload-only build, and
  covers purchase, restore, acknowledgement, cancellation, and the Noor consumable.

## Deployment traps

- `vercel --prod` ships the **working tree, not `git HEAD`**, so any uncommitted
  local edit reaches production silently. Commit before deploying, and check
  `git status` when production behavior does not match the committed code.
- Every Google-side Warsh resource belongs in Cloud project `warsh-production`
  (`695435119958`) — never a personal project. An OAuth client can never be moved
  between projects without issuing a new client ID that every installed APK would
  fail against.
- Neon suspends its compute overnight, so the 04:00/05:00 PKT crons can hit a
  sleeping database and die with `P1000 "Authentication failed"`. That error is a
  suspended compute, not bad credentials.
- Vercel can transiently 403 `api.warsh.app` with a Security Checkpoint HTML page,
  breaking the native app and the CLI. It is IP-level and clears on its own.
- The Sentry org has **one** cron monitor seat. Do not auto-upsert both Vercel crons
  into monitors; it drops check-ins and produces false "Cron failure" alerts.
- Noor fails silently on a bad OpenAI key — the fallback reply is a 200, so a dead
  key produces no error, no Sentry event, and no 5xx anywhere.
- Discover images must stay WebP at 768px; the upload route enforces it. Oversized
  PNGs were the cause of the slow first Discovery card.
