# Warsh Repository Guide

Warsh is a Quranic Arabic learning product with an Expo Android/web client and a
Next.js/PostgreSQL backend. This file is the single operating guide for the whole
repository — backend, app, lesson schema, and site. There is no other rule file to
consult.

## Read first

Use only these active information sources:

1. `Docs/warsh-status.md` — what is built, verified, blocked, and next
2. `Docs/warsh-product-spec.md` — product behavior and locked decisions
3. `Docs/warsh-technical-spec.md` — architecture, deployment, and operations
4. Current code/configuration — final evidence for implementation reality

`Docs/archive/` is historical and must never be used as a current requirement.
`Docs/proposals/` holds work that is designed but not yet implemented; it is not a
requirement until the owner approves it.

## Protected live pages

These files back live public pages and Google Play requirements. Do not rename,
move, delete, or change their URL routing without explicit user approval:

- `landing/index.html`
- `Docs/privacy-policy.html`

`warsh-site/AGENTS.md` is generated and re-added by `next dev`
(`node_modules/next/dist/server/lib/generate-agent-files.js`). Do not merge or
delete it — it will simply reappear. Commit it with your work to keep the tree clean.

## Repository map

Each workspace is a separate npm project with its own `node_modules`; there is no
monorepo tool. Run commands from inside the workspace directory.

- `warsh-backend/` — Next.js 14 App Router API (`app/api/`), Prisma 7,
  PostgreSQL/Neon, plus the token-gated admin dashboard (Warsh Studio) at `/dashboard`
- `warsh-app/` — Expo SDK 54, React Native 0.81, expo-router, Android and web
- `packages/lesson-schema/` — canonical Zod schema for lesson `content` JSON
- `warsh-backend/vendor/lesson-schema/` — backend-vendored build of that package,
  installed via `file:`
- `warsh-site/` — Next 16 public site (`warsh.app`: privacy, terms, help, delete-account)
- `landing/index.html` — static landing page, deployed separately

## Start Warsh

When the user says "start Warsh app" or a close variant, use the maintained root
script. Do not improvise the startup sequence.

```powershell
.\start-warsh.ps1              # release APK on the Warsh_API_34 emulator, production API
.\start-warsh.ps1 -dev         # local backend + Metro via ADB reverse to http://127.0.0.1:3000
.\start-warsh.ps1 -prod        # Metro against the production API
.\start-warsh-staging.ps1 -RefreshContent   # isolated local staging DB (127.0.0.1:55432)
.\install-warsh-apk.ps1 [path] # install/upgrade an already-built APK on the AVD
```

The default command checks whether the release APK is older than the current app
source, rebuilds it with the production API when necessary, starts the
`Warsh_API_34` emulator when needed, installs or upgrades the APK, and launches
Warsh. Local Android development uses ADB reverse and `http://127.0.0.1:3000`;
never hardcode a LAN IP.

Windows can reserve port `55432`, which makes `start-warsh-staging.ps1` fail. The
workaround is to run the Postgres container on another loopback port against the
same volume.

## Commands

### Backend (`cd warsh-backend`)

```powershell
npm run dev
npm run build                  # prisma generate && next build
npm test                       # tsx --test tests/**/*.test.ts
npx tsx --test tests/streak.test.ts     # single test file

npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:validate-fixtures   # validate prisma/fixtures against @warsh/lesson-schema
npm run db:audit-urdu

npm run content:check          # is the fixture mirror behind the database?
npm run content:export         # pull Studio edits back into prisma/fixtures
npm run content:sync           # publish fixture edits to the database
npm run content:baseline       # adopt the current DB state as the agreed baseline

npm run content:restore-curriculum          # re-insert missing curriculum vocabulary
npm run content:publish-vocabulary -- --scope=core500|curriculum|all
npm run media:prune-orphans                 # delete R2 word media no row can reach
```

### App (`cd warsh-app`)

```powershell
npm start
npm run android
npm run web
npm run lint -- --quiet
npx tsc --noEmit
npm run deploy:web             # Expo web export -> app.warsh.app (Vercel)
```

### Lesson schema (`cd packages/lesson-schema`)

```powershell
npm run build                  # tsup
npm test                       # vitest run
npx vitest run <file>
```

## Implementation rules

- Inspect `git status` before editing and preserve unrelated changes.
- Use a Pen-first product workflow for every new feature, screen, flow, component,
  or meaningful UI/UX change:
  1. Create or update the proposed design in the Warsh Pen file first.
  2. Review the Pen design with the product owner and obtain explicit approval.
  3. Only after approval, decide together whether to implement it in code.

  Do not begin implementation before this design-review gate unless the product
  owner explicitly asks to bypass it for that specific task.
- For diagnosis-only requests, report the cause before changing code.
- Verify status against code, validators, builds, and runtime behavior; do not
  trust historical tracker claims blindly.
- Never expose or commit real secrets. **The GitHub repository is public**, so
  anything committed — including in history — is world-readable. Treat any
  credential ever committed as compromised on discovery, even after the file is
  untracked.
- Do not run the production seed casually. Content changes go to the local staging
  DB first, then a scoped production update (e.g.
  `npm run content:promote-tadabbur -- --apply`) — never the full production seed.
  `prisma/seed.cjs` opens with `vocabularyWord.deleteMany()` and re-creates every
  row with a **new id**, so a seed run against production drops the curriculum
  vocabulary and strands every `audio/words/{id}` and `images/words/{id}` object in
  R2. This has already happened at least twice: recover with
  `content:restore-curriculum`, `audio:prebuild-catalog:db`, `images:upload`, then
  `media:prune-orphans`.

## Backend invariants

- Import Prisma from `lib/prisma.ts`; never construct `PrismaClient` in a route.
- After Prisma schema changes, generate and migrate before verifying.
- `Lesson.content` is JSON validated by `@warsh/lesson-schema` — the same package
  for admin writes and fixture validation. Never add a second schema (including in
  `Docs/`).
- `lib/course.ts` is authoritative for chapter unlocking/completion. Locking,
  trial/subscription access, and admin checks are enforced server-side.
- Streak days run 04:00 PKT → 03:59:59 PKT via `lib/date.ts`; completion, daily
  goals, freezes, and the reset cron must all use that boundary.
- Content review (`LessonContentReview`, `ContentReviewIssue`) stays separate from
  `Lesson.content`; flagging never edits learner-facing lessons.
- Warsh Studio is the authoring surface, so the database is the source of truth for
  `Lesson.content` and `prisma/fixtures/` is its versioned mirror.
  `prisma/lesson-sync-baseline.json` records the hash at the last point the two
  agreed, which is what lets `content:export` and `content:sync` tell a Studio edit
  from a Git edit. Never push fixtures over the database without `content:check`
  passing first.
- Lesson audio is keyed by a sha256 of the Arabic text and runtime lookup has no
  generation fallback, so editing Arabic text orphans its clip.
  `lib/audioTargets.ts` defines which strings need audio for both the generator and
  the content-health scan; regenerate with
  `npm run audio:prebuild-catalog -- --from-db`.
- Google sign-in: the provider ID token is identity proof only, then Warsh issues
  its own JWT. `googleSubject` is the durable key — a matching email alone never
  links accounts.
- Never parse an environment variable with a bare `Number()`. A non-numeric
  `AI_DAILY_MESSAGE_LIMIT` produced `NaN`, every comparison against it was false,
  and the daily Noor cap silently vanished for every user in production. Parse
  defensively and fail closed on a documented default, logging that you did.
- Purchased-credit accounting: guard the balance in the `WHERE` clause so the claim
  is the check, refund the claim when the downstream call fails, and claw back
  voided purchases idempotently.
- Google Play purchases must be acknowledged and consumed **server-side**, after
  the grant commits. A client-only `finishTransaction` loses purchases to Google's
  three-day auto-refund, and an unconsumed one-time product stays owned, which
  permanently blocks that account from buying another.

## App invariants

- Routes: `app/(auth)` (preview, auth, recovery, onboarding), `app/(app)`
  (authenticated stack), `app/(app)/(tabs)` = Learn, Vocabulary, Noor, You.
- `stores/authStore.ts` persists user/token; guards must wait for hydration before
  redirecting.
- `EXPO_PUBLIC_API_URL` sets the API origin — never commit a LAN IP. The web export
  uses `https://app.warsh.app` with a Vercel rewrite of `/api/*` to `api.warsh.app`.
- Arabic renders through `components/ArabicText.tsx`; primary CTAs use
  `components/BrandButton.tsx`; all tokens come from `constants/theme.ts` (no
  hardcoded hex); web wraps in `WebShell`.
- Keep `i18n/en.ts` and `i18n/ur.ts` in sync; Arabic learning content stays Arabic
  in both languages.
- After committing web-affecting app changes, run `npm run deploy:web` so
  `app.warsh.app` does not fall behind.

## API conventions

- Success: `{ "data": { ... } }`
- Expected error: `{ "error": "Human message", "code": "snake_case_code" }`
- Protected routes derive user identity from the Bearer JWT, never from a
  client-supplied id.
- Browser requests use the supported CORS origins and `X-Warsh-Platform` behavior.

Request flow: Expo client → Axios (`warsh-app/services/api.ts`) with
`Authorization: Bearer <JWT>` and `X-Warsh-Platform` → Next.js route in
`warsh-backend/app/api/` → auth/validation/business rules → Prisma singleton → Neon
Postgres, with optional OpenAI, R2, Resend, Google Play, Mixpanel/Sentry.

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
$env:SENTRY_DISABLE_AUTO_UPLOAD = "true"
$env:SENTRY_DISABLE_NATIVE_DEBUG_UPLOAD = "true"
.\gradlew bundleRelease --console=plain   # or assembleRelease for an APK
```

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

npm run verify:release-api-url    # asserts https://api.warsh.app is baked in
                                  # and no localhost/LAN URL survives
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
- Trial access lasts seven full days regardless of chapter progress; after expiry,
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

## Canonical sources

- Tabs: Learn, Vocabulary, Noor, You
- Lesson templates: `STANDARD`, `SPOKEN_PHRASES`, `REVIEW`, `VERB_PATTERN`
- Lesson schema: `packages/lesson-schema/src/`
- Database schema: `warsh-backend/prisma/schema.prisma`
- Fixtures: `warsh-backend/prisma/fixtures/`
- Theme: `warsh-app/constants/theme.ts` — the spec-11 palette is the locked truth;
  `theme.ts` keeps legacy key names mapped to spec-11 values by role
- Current priorities: `Docs/warsh-status.md`
