# Warsh Technical Specification

**Status:** Active engineering and operations source of truth
**Version:** 2.0 consolidated
**Last updated:** 2026-07-24

## Authority and maintenance

This document defines the current repository architecture, data boundaries, API conventions, local-development workflow, deployment shape, and operational rules. It consolidates the useful current material from the former technical specifications and implementation PRDs.

Use `Docs/warsh-product-spec.md` for product behavior and `Docs/warsh-status.md` for current verification and priorities. Exact schemas, routes, dependencies, and configuration are ultimately verified in code.

## 1. Repository structure

```text
Warsh/
├── warsh-app/                  Expo SDK 54 / React Native 0.81 client
├── warsh-backend/              Next.js 14 API backend
├── warsh-site/                 Next.js 16 public website and legal/help pages
├── packages/lesson-schema/     Canonical Zod lesson-content package
├── Docs/                       Active documentation and protected privacy page
├── landing/                    Live public landing page source
├── start-warsh.ps1             Maintained local/prod launcher
├── AGENTS.md                   Short repository operating guide
└── CLAUDE.md                   Pointer to AGENTS.md
```

The backend, app, and public website are separate Node projects with separate lockfiles and commands.

## 2. Current stack

### Client

- Expo SDK 54
- React Native 0.81
- React 19
- Expo Router 6
- TypeScript
- Zustand with AsyncStorage persistence
- Axios
- Expo AV and Expo Image
- React Native IAP 14
- Sentry and Mixpanel
- Android and web platforms

### Backend

- Next.js 14 API routes
- React 18 runtime dependencies
- Prisma 7 with `@prisma/adapter-pg`
- PostgreSQL/Neon
- Zod-backed shared lesson schema
- JWT authentication
- OpenAI integration with local tutor fallback
- Cloudflare R2 through the S3 SDK
- Resend email
- Google Play verification and RTDN
- Sentry

## 3. Request flow

```text
Expo Android/Web client
  -> Axios API client
  -> Authorization: Bearer JWT
  -> X-Warsh-Platform platform header
  -> Next.js API route
  -> auth/validation/business rules
  -> Prisma singleton
  -> PostgreSQL (Neon)
  -> optional OpenAI, R2, Resend, Google Play, Mixpanel/Sentry
```

Success responses use a `data` envelope. Expected failures use a human-readable `error` plus a stable snake-case `code`.

## 4. Canonical sources in code

- Lesson JSON schema: `packages/lesson-schema/src/`
- Backend-consumed lesson package: `warsh-backend/vendor/lesson-schema/`
- Database schema: `warsh-backend/prisma/schema.prisma`
- Curriculum fixtures: `warsh-backend/prisma/fixtures/`
- Seed assembly: `warsh-backend/prisma/seed.cjs`
- API routes: `warsh-backend/app/api/`
- Mobile routes/screens: `warsh-app/app/`
- API client: `warsh-app/services/api.ts`
- Theme tokens: `warsh-app/constants/theme.ts`
- Localization dictionaries: `warsh-app/i18n/en.ts`, `warsh-app/i18n/ur.ts`
- Auth state: `warsh-app/stores/authStore.ts`
- App/EAS identity: `warsh-app/app.json`, `warsh-app/eas.json`

Do not reintroduce a hand-maintained lesson schema under `Docs/`.

## 5. Client architecture

### Routing

- `(auth)` contains preview, authentication, recovery, and onboarding routes.
- `(app)` contains the authenticated stack.
- `(app)/(tabs)` contains Learn, Vocabulary, Noor, and You.
- Lessons, vocabulary detail/review, paywall, settings, milestones, streak, and Tadabbur are stack destinations.
- Root `app/index.tsx` is the branded client entry screen.

### Authentication state

`authStore.ts` persists the user and token. Route guards must wait for hydration before redirecting. The Axios interceptor attaches the latest token to protected requests.

Refresh tokens are implemented as rotated JWT sessions rather than a separate stored refresh-token model. Password hash fingerprinting invalidates sessions after password changes.

Google sign-in uses the official provider-issued ID token as an identity proof,
then issues the same Warsh JWT used by password sessions. The backend validates
the token audience against `GOOGLE_OAUTH_CLIENT_ID`, stores `googleSubject` as
the durable provider key, and never treats a matching email as sufficient to
link accounts. Existing password accounts confirm their Warsh password once;
new Google users receive a non-usable random password hash and
`hasPassword=false`. Android uses Google Credential Manager through
`react-native-nitro-google-signin`; web renders Google Identity Services.

### API configuration

`EXPO_PUBLIC_API_URL` is required and must be environment-appropriate:

- Local physical device through USB reverse: `http://127.0.0.1:3000`
- Staging: `https://warsh-git-staging-warshapp-projects.vercel.app`
- Production Android: `https://api.warsh.app`
- Production web export: `https://app.warsh.app`; Vercel rewrites
  `/api/*` server-side to `https://api.warsh.app/api/*`

Never commit a machine-specific LAN IP.

### Arabic and design

- Arabic uses the shared `ArabicText` component.
- Shared colors, spacing, typography, radii, shadows, and animation values live in `constants/theme.ts`.
- CTAs use `BrandButton`.
- Web uses the responsive `WebShell`.

### Android update awareness

- Google Play remains the source of truth for whether a Play-installed tester
  is eligible for a newer Closed-track version.
- The Android-only `WarshInAppUpdates` native bridge reads Play Core update
  availability and version-code information. The root app shell checks at
  launch and whenever the app returns to the foreground.
- When a higher eligible version exists, Warsh shows the localized
  `AppUpdateBanner` and opens the `com.warsh.app` Play listing from its primary
  action. Dismissing hides only that available version for the current app
  process, so a later cold launch reminds the tester again.
- Preview/sideloaded APKs are not Play-owned and therefore do not receive Play
  update availability. That expected state must remain silent; use the APK for
  direct QA and the Closed-track AAB for update-flow verification.
- The first release containing this feature still requires one external
  message to older testers. Once they install it through Play, later
  Closed-track releases are detected automatically without a backend version
  flag.

## 6. Backend architecture

### Prisma

Import the singleton from `warsh-backend/lib/prisma.ts`. Do not instantiate `PrismaClient` in route files.

The current schema contains 17 models:

1. User
2. StorePurchase
3. PromoCode
4. PromoRedemption
5. Streak
6. Chapter
7. Lesson
8. LessonContentReview
9. ContentReviewIssue
10. Progress
11. ChatMessage
12. Achievement
13. UserAchievement
14. VocabularyWord
15. TadabburSurah
16. UserSurahProgress
17. UserVocabularyWord

After schema changes:

```powershell
cd warsh-backend
npm run db:generate
npm run db:migrate
```

### Lesson content

`Lesson.content` is a JSON value validated by `@warsh/lesson-schema`. Admin writes and fixture validation must use the same package. Exercise IDs must remain stable and globally collision-safe according to the implemented validators.

Warsh Studio exposes a protected review-only view at
`/dashboard/content-review`. `LessonContentReview` stores the reviewer decision
and overall note, while `ContentReviewIssue` stores the exact JSON path, content
or media label, issue category, note, optional media URL, and resolution state.
These records must remain separate from `Lesson.content`; flagging a problem
must never edit the learner-facing lesson implicitly. Lessons cannot be marked
`APPROVED` while open review issues remain.

### Course and completion

- `lib/course.ts` builds backend-authoritative chapter state.
- Previous-chapter completion controls unlocking.
- Placement can mark earlier progress `SKIPPED_BY_PLACEMENT`.
- `DEV_UNLOCK_ALL` is development-only and must not bypass production locking.
- Completion uses transactional updates for progress, XP, streak, achievements, and applicable paywall state.

### Time

PKT helpers live in `lib/date.ts`. A Warsh streak day runs from 04:00 PKT
through 03:59:59 PKT the following calendar day so late-night study remains
part of the learner's preceding day. Lesson completion, daily-goal queries,
freeze handling, and the daily reset cron must use this same boundary. At
04:00, the cron evaluates the complete day that just ended; it must not reset
valid activity merely because a new streak day has opened.

## 7. Authentication and security

### JWT

- JWT secret must be at least 32 characters.
- Access sessions expire according to configured policy; current default is 30 days.
- Refresh is limited by maximum session age.
- Password-version fingerprinting invalidates old sessions after password changes.
- Protected routes derive user identity from the request token; they do not trust a client-provided user ID.

### Password flows

- Passwords are hashed with bcrypt.
- Register/login/forgot/reset routes are rate-limited.
- Forgot-password should not reveal whether an account exists.
- Reset tokens are purpose-bound and time-limited.
- Resend handles delivery when configured.

### Google identity flow

- `POST /api/auth/google` verifies an ID token and signs in an already linked
  user, creates a new Warsh user, or returns a short-lived purpose-bound link
  token when a matching password account exists.
- `POST /api/auth/google/link` requires that link token and the existing Warsh
  password before storing the Google subject.
- Session JWTs issued through Google remain bound to the stored password-hash
  fingerprint, including the random hash used by social-only accounts.
- Google OAuth clients must be created only in Google Cloud project
  `warsh-production` (`Warsh Production`).

### Admin routes

- Production admin reads/writes require `ADMIN_DASHBOARD_TOKEN`.
- `ALLOW_UNAUTHENTICATED_ADMIN=true` is honored only in development.
- Never expose admin tokens to client bundles.

### General rules

- Validate input at route boundaries.
- Keep secrets in Vercel/EAS/local ignored environment files.
- Do not log credentials, JWTs, reset tokens, purchase tokens, or full external service keys.
- Use stable error codes without leaking database/provider internals.
- Treat CORS as browser access control, not authentication.

## 8. API surface

The repository currently contains 68 API route files. Major groups are:

- `/api/auth/*` — register, login, current user, refresh, forgot/reset/change password
- `/api/chapters*` — course state and chapter lesson lists
- `/api/lessons/*` — lesson retrieval and completion
- `/api/progress`, `/api/streak*`, `/api/achievements`
- `/api/vocabulary/*` — browse, word detail, user state, audio/image, SRS
- `/api/tadabbur/*`
- `/api/chat*`, `/api/noor/purchase-pack`
- `/api/subscription/*`
- `/api/audio/catalog` — authenticated lookup/redirect to prebuilt fixed-text R2 audio
- `/api/audio/tts` — backward-compatible lookup-only alias for distributed builds; never generates speech
- `/api/users/me`
- `/api/admin/*`
- `/api/admin/content-review*` — review index, full lesson documents, review
  decisions, and issue lifecycle
- `/api/webhooks/google`
- `/api/cron/*`
- `/api/health`

Inspect route files for exact request/response shapes. Do not maintain a second exhaustive endpoint table that can drift from code.

Noor stores chat messages. The history endpoint returns the latest 50 messages in chronological display order, and reply generation uses the latest 10 prior messages in chronological order. This transcript context is distinct from an inferred personal-memory profile.

## 9. External services

### PostgreSQL/Neon

`DATABASE_URL` supplies the runtime connection. `DIRECT_DATABASE_URL` is used only when a separate migration connection is required.

### Cloudflare R2

R2 stores lesson/vocabulary audio and images. Required configuration includes endpoint, access key, secret, bucket, and public URL. Public URL claims must be verified live; code/configuration history contains both custom-domain and `r2.dev` periods.

Fixed learner-facing Arabic audio uses deterministic keys under
`audio/catalog/v1/<sha256>.mp3`. Runtime routes may only redirect to these
objects. They must never call the speech provider. Vocabulary uses stable
`audio/words/<wordId>.mp3` objects and is also runtime lookup-only.

Materialize and audit audio before deployment:

```powershell
cd warsh-backend
npm run audio:prebuild-catalog -- --dry-run
npm run audio:prebuild-catalog
npm run audio:audit-catalog
```

`audio:prebuild-catalog` is an admin operation: it may call OpenAI, upload
missing R2 objects, and align vocabulary `audioUrl` rows. `audio:audit-catalog`
is read-only and must report zero missing. If a production object is absent,
playback fails closed; no learner request may generate a replacement.

### OpenAI

OpenAI supports Noor at runtime and the explicit admin audio-prebuild job.
Learner-facing routes do not perform on-demand TTS. `lib/openai.ts` deliberately
returns a local constrained tutor response if the Noor provider is unavailable;
production diagnostics must not mistake the fallback for provider health.

Quranic recitation must use human audio rather than synthesized speech.

### Google Play

Google Play verification uses service-account credentials and package `com.warsh.app`. The backend accepts only configured valid products and processes RTDN at `/api/webhooks/google`.

Store-console state is external. Always verify products, base plans, tester access, and Play-installed build availability before IAP QA.

### Email, monitoring, and analytics

- Resend: password-reset mail
- Sentry: backend/mobile errors and release diagnostics. Default PII is disabled,
  user identity is reduced to the internal pseudonymous ID, request secrets are
  scrubbed, and browser session replay is disabled. Production source-map
  uploads require valid `SENTRY_ORG`, `SENTRY_PROJECT`, and
  `SENTRY_AUTH_TOKEN` values in the build environment. The production project
  mapping is `warsh-backend` for Vercel and `warsh-mobile` for EAS. Android
  releases use `com.warsh.app@<version>+<versionCode>` with the version code as
  the Sentry distribution.
- Mixpanel: product analytics
- Uptime monitoring: production health endpoint

Absence of optional configuration should disable or degrade the integration safely, except where the production launch checklist makes it mandatory.

### Production ownership and account transfer

Warsh production ownership is being transferred from the founder's personal
accounts to the dedicated project account `trywarshapp@gmail.com`. This is an
ownership and access-control requirement, not permission to share personal
credentials.

- `trywarshapp@gmail.com` must be the owner or organization administrator for
  production Google Cloud, Google Play Console, Vercel, Neon, Cloudflare/R2,
  Resend, Sentry, Mixpanel, Expo/EAS, domains/DNS, and any other service that
  can deploy, bill, publish, access production data, or recover the account.
- Personal accounts may retain named collaborator or emergency recovery access
  only when necessary, but must not remain the sole owner or sole recovery path.
- Each service transfer must preserve the existing project, package name,
  domains, OAuth clients, Play signing keys, databases, buckets, deployments,
  billing records, and audit history. Do not create replacement projects unless
  the migration is explicitly approved and verified.
- After each transfer, verify owner/admin access, billing, production
  environment variables, deployment access, domain/DNS control, OAuth and Play
  signing configuration, webhooks, and recovery methods. Record the service,
  previous owner, new owner, date, verifier, and any remaining personal access
  in the private operations record; never record passwords or secret values in
  this repository.
- Contributors must stop and report any service that still depends on a
  personal account before changing production configuration or accepting new
  terms. Do not accept provider terms or authorize a new business integration
  under a personal account on Warsh's behalf.

## 10. Environment variables

The authoritative inventories are:

- `warsh-backend/.env.example`
- `warsh-app/.env.example`
- `warsh-app/eas.json`

Important groups:

- Database: `DATABASE_URL`, optional `DIRECT_DATABASE_URL`
- Auth/admin: `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_DASHBOARD_TOKEN`,
  `GOOGLE_OAUTH_CLIENT_ID`
- Development: `DEV_UNLOCK_ALL`, `ALLOW_UNAUTHENTICATED_ADMIN`
- AI/admin audio build: `OPENAI_API_KEY`, model/voice settings
- R2: endpoint, credentials, bucket, public URL
- Store verification: Google/Apple package, secrets, and credentials
- Cron: `CRON_SECRET`
- Email: `RESEND_API_KEY`, sender
- Observability: Sentry and Mixpanel variables
- Client: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`,
  environment, Sentry DSN, Mixpanel token

Never duplicate secret values in documentation.

EAS creates its upload archive from the Git/monorepo root even when the command
is run from `warsh-app/`. Preserve the root `.easignore` as well as the app-local
file so environment files, native build caches, APK/AAB outputs, and keystores
cannot enter the ordinary source upload.

The production EAS profile deliberately uses `credentialsSource: local`.
`warsh-app/credentials.json` points EAS at the established Play upload
keystore, is ignored by Git, and must remain available only in the secure build
environment. Do not switch production back to Expo's remote credential unless
that remote key has first been replaced and its SHA-1 independently verified
against Play Console.

Local Gradle release builds require the explicit
`WARSH_UPLOAD_STORE_FILE`, `WARSH_UPLOAD_STORE_PASSWORD`,
`WARSH_UPLOAD_KEY_ALIAS`, and `WARSH_UPLOAD_KEY_PASSWORD` values. Before any
AAB is uploaded, run `npm run verify:play-signing -- <path-to-aab>` and
`npm run check:16kb -- <path-to-aab>`. The signing check must report the Play
upload certificate SHA-1 ending in `D2:6B`; never commit or disclose the
keystore or its passwords.

## 11. Local development

### Maintained launcher

When asked to start Warsh, use the root script:

```powershell
.\start-warsh.ps1
```

By default it checks whether the release APK is older than the current app source, rebuilds it with the production API and the production Google Web OAuth client ID from `warsh-app/eas.json` when necessary, starts the `Warsh_API_34` emulator when needed, installs or upgrades Warsh, and launches the app.

For local Metro/backend development:

```powershell
.\start-warsh.ps1 -dev
```

The development mode verifies ADB, creates reverse tunnels for Metro/backend, starts the backend, waits for health, and starts Expo with `http://127.0.0.1:3000`.

### Deployed staging environment

The `staging` git branch is the shared staging tier. Pushing to it makes Vercel
build a Preview deployment of every project from the `warshapp-projects` team:

| Project | Staging URL |
| --- | --- |
| `warsh` (API) | `https://warsh-git-staging-warshapp-projects.vercel.app` |
| `warsh-web` | `https://warsh-web-git-staging-warshapp-projects.vercel.app` |
| `warsh-site` | `https://warsh-site-git-staging-warshapp-projects.vercel.app` |

Staging runs against the Neon `staging` branch of project `late-fog-22959847`
(endpoint `ep-gentle-pine-ayycp3ad`), created from `production` by copy-on-write.
It holds a full copy of production data and is completely isolated: writes there
can never reach production. Refresh it by deleting and re-branching from
`production` when staging data drifts too far.

Staging environment variables live on the `warsh` project scoped to
**Preview + branch `staging`**. They must never be scoped to Production. Staging
carries its own `JWT_SECRET`, `ADMIN_DASHBOARD_TOKEN`, and `CRON_SECRET`, so a
staging session or admin token is worthless against production.

Promotion order is local → `staging` → `main`. Merging `staging` into `main`
deploys production.

Two known hazards:

- The personal `umarbinakbarali` Vercel account also holds projects named
  `warsh`/`warsh-web`/`warsh-site`. Production lives in **`warshapp-projects`**.
  Confirm the team before changing any Vercel setting; `.vercel/project.json`
  points at `warshapp-projects` but the CLI may authenticate as the personal
  account and silently write to the wrong project.
- `DIRECT_DATABASE_URL` remains scoped to Production *and* Preview at the
  environment level. The `staging`-branch value overrides it, but any other
  preview branch still resolves the production database. Narrow it to Production
  when convenient.

### Isolated local staging database

For content authoring that should not touch the shared staging tier, the local
workflow uses a persistent PostgreSQL container bound only to
`127.0.0.1:55432`; it never uses the production database URL.

```powershell
# Create/start staging, apply migrations, refresh authored content, then launch
# the local backend and Metro against that staging database.
.\start-warsh-staging.ps1 -RefreshContent

# Prepare or validate the staging database without launching the app.
.\start-warsh-staging.ps1 -RefreshContent -PrepareOnly
```

Run the debug client once when native app source has changed:

```powershell
cd warsh-app
$env:EXPO_PUBLIC_API_URL = 'http://127.0.0.1:3000'
npm run android -- --no-bundler
```

For curriculum changes, staging acceptance requires:

1. fixture/schema validators and focused coverage checks pass;
2. migrations and content refresh succeed only against the staging URL;
3. affected lessons are visually checked in the emulator in English and Urdu
   where localized copy changed;
4. lesson promises, discover cards, exercises, and completion summaries agree;
5. the product owner explicitly approves production promotion.

After approval, use a scoped production content update and verify the live
result. Do not run the full production seed as a shortcut. Keep
`DEV_UNLOCK_ALL=false` in production.

For the reviewed An-Nas and Al-Falaq release, use the maintained scoped
promotion command from `warsh-backend/`. It updates only the nine affected
lesson JSON records, the required vocabulary records, and the two Tadabbur
surahs in place, preserving learner lesson, vocabulary, and surah progress:

```powershell
npm run content:promote-tadabbur
npm run content:promote-tadabbur -- --apply
```

`warsh-app/eas.json`'s `preview` profile builds against the deployed staging API
at `https://warsh-git-staging-warshapp-projects.vercel.app`, which resolves to
the Neon `staging` branch. The older `api-staging.warsh.app` hostname was never
provisioned; do not reintroduce it without creating the DNS record and a domain
alias on the `warsh` project. Never point a preview build at the production
database.

For Metro against production:

```powershell
.\start-warsh.ps1 -prod
```

Do not improvise individual startup steps unless diagnosing the launcher itself.

### Local production-APK testing

The Windows development machine has a dedicated Google Play-enabled Pixel 7 AVD named `Warsh_API_34`. Build an installable APK with the `previewProd` EAS profile; the `production` profile creates the Play Store AAB and cannot be installed directly on an emulator.

After downloading the APK, run from the repository root:

```powershell
.\install-warsh-apk.ps1 C:\path\to\warsh.apk
```

The APK path is optional. The helper first checks `warsh-app\android\app\build\outputs\apk\release`, then EAS build folders and `Downloads`. It starts the AVD when necessary, waits for Android to boot, upgrades the installed `com.warsh.app` package, and launches Warsh. Pass `-ResetAppData` only when a clean first-install state is required.

Use this workflow for UI, UX, navigation, API, and general regression checks. It does not replace Play-installed subscription/consumable QA or physical-device checks for microphone, notifications, and device-specific behavior.

When investigating a startup crash on an older physical Android device, capture
the native crash buffer before assuming a JavaScript failure. A RenderThread
`SIGSEGV` in a vendor Mali/OpenGL library should first be isolated to the
smallest screen-specific layer. Prefer simplifying that screen's dense
transforms, texture-like repeated elements, and overlapping elevation before
considering an app-wide compatibility mode or software renderer. Verify the
candidate on the affected device with a clean install and repeated
force-stop/data-clear/launch cycles. Do not add a global rendering fallback
without evidence that the fault is broader than the isolated screen.

### Manual project commands

Backend:

```powershell
cd warsh-backend
npm run dev
npm run build
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:validate-fixtures
npm run db:audit-urdu
```

App:

```powershell
cd warsh-app
npm start
npm run android
npm run web
npm run lint
npx tsc --noEmit
```

## 12. Deployment

### Backend

- Production backend: Vercel
- Production API: `https://api.warsh.app`
- Vercel project: `warsh`
- The root response is API service metadata. Legacy `/privacy`, `/terms`, `/delete-account`, and `/help` paths permanently redirect through `PUBLIC_SITE_URL`. The current production value temporarily remains the stable `warsh-site` Vercel alias; set it to `https://warsh.app` at the next authenticated Vercel configuration update. Both destinations serve the same dedicated site deployment.
- Database: Neon PostgreSQL
- Migrations and seed operations are explicit release actions; never run production seed casually.

### Public website

- Source: `warsh-site/`
- Vercel project: `warsh-site`
- Canonical domains: `https://warsh.app` and `https://www.warsh.app`
- Canonical public routes: `/`, `/privacy`, `/terms`, `/delete-account`, and `/help`
- DNS remains at Namecheap. The authoritative production records are apex `A 216.198.79.1` and `www CNAME 2eac99eaa82c15f3.vercel-dns-017.com`; preserve the `api`, `app`, email, verification, and other DNS records.
- `landing/index.html` and `Docs/privacy-policy.html` remain protected legacy release sources. They are retained for traceability and must not be renamed or removed.

### Android

EAS profiles:

- `development` — internal development client
- `preview` — staging APK using the `staging` branch preview API
- `previewProd` — production-API APK
- `production` — production channel/build submitted to the Closed testing `alpha` track

Android identity is `com.warsh.app`.

Direct local Gradle release builds must export the production values before
Gradle runs. Expo resolves `EXPO_PUBLIC_*` from the shell first and otherwise
falls back to `warsh-app/.env`, which targets the local dev backend
(`http://127.0.0.1:3000`, `EXPO_PUBLIC_ENVIRONMENT=development`). A release
built without them ships the localhost URL inside the JS bundle: every request
fails on a real device with "Warsh could not reach the backend", while the
emulator still works because `start-warsh.ps1` sets up ADB reverse. The same
fallback sets the environment to `development`, which disarms the localhost
guard in `warsh-app/services/api.ts`, so nothing fails at build time by default.
This reached production twice (2026-07-26, 2026-08-19).

```powershell
cd warsh-app\android
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$env:EXPO_PUBLIC_API_URL = "https://api.warsh.app"
$env:EXPO_PUBLIC_ENVIRONMENT = "production"
$env:SENTRY_DISABLE_AUTO_UPLOAD = "true"
$env:SENTRY_DISABLE_NATIVE_DEBUG_UPLOAD = "true"
.\gradlew bundleRelease --console=plain
```

Signing additionally requires `WARSH_UPLOAD_STORE_PASSWORD`,
`WARSH_UPLOAD_KEY_PASSWORD`, and `WARSH_UPLOAD_KEY_ALIAS`. The Sentry flags are
required locally because no org/project is configured for `sentry-cli`; EAS sets
them through `eas.json`. `warsh-app/android/app/build.gradle` rejects a release
task whose `EXPO_PUBLIC_API_URL` is missing or non-HTTPS, or whose
`EXPO_PUBLIC_ENVIRONMENT` is not `production`/`staging`, but the artifact is
still verified explicitly before upload — see §13.

Bump `versionCode` in both `warsh-app/android/app/build.gradle` and
`warsh-app/app.json`; Play rejects a repeated version code.

For update-aware Closed testing, publish a higher version code to the same
Closed track and wait until Play marks it available to testers. Existing
Play-installed builds containing `AppUpdateBanner` will discover that eligible
version on launch/foreground. Do not use a sideloaded APK to certify this flow.

### Web app

From `warsh-app`:

```powershell
npm run deploy:web
```

The script builds the web client with `https://app.warsh.app` as its API origin,
writes an `/api/*` rewrite to `https://api.warsh.app/api/*` before the SPA
fallback, deploys through Vercel, and restores the developer's local `.env`
afterward. Keeping browser API traffic same-origin avoids cross-origin
preflights being intercepted by Vercel's Security Checkpoint. Android
production builds continue to call `https://api.warsh.app` directly.

Expo exports dependency assets under `dist/assets/node_modules`, which Vercel
CLI excludes from uploads. The deployment script relocates that directory to
`dist/assets/vendor` and adds a server-side rewrite from the original generated
URL. Do not rewrite Expo's hashed JavaScript after export: changing its content
without changing its filename can leave browsers running a stale cached bundle.

Backend CORS always permits the canonical web origin and stable Vercel alias, plus explicitly configured origins.

### Protected live pages

Do not rename, move, or delete:

- `landing/index.html`
- `Docs/privacy-policy.html`

Their public URLs are required website/store contracts. Any routing change requires explicit approval and live verification.

## 13. Validation and release gates

### Code validation

```powershell
cd warsh-backend
npm run db:generate
npm run db:validate-fixtures
npm run db:audit-urdu
npm run build

cd ..\warsh-app
npm run lint -- --quiet
npx tsc --noEmit
```

### Android artifact validation

Run against the built AAB/APK before any Play upload. Source checks cannot catch
a bundle built with the wrong environment, so the artifact itself is inspected:

```powershell
cd warsh-app
npm run verify:release-api-url    # asserts https://api.warsh.app is baked in
                                  # and no localhost/LAN URL survives
npm run verify:play-signing       # asserts the Play upload certificate
```

Both must pass. `verify:release-api-url` accepts an optional path and defaults to
`android/app/build/outputs/bundle/release/app-release.aab`.

### Runtime validation

- Backend health returns 200.
- Register/login/refresh/password-reset flows work.
- Protected course and progress endpoints return expected envelopes.
- Android and web can load the same production API through their supported origins.
- Chapter lock and completion rules hold server-side.
- Trial access lasts seven full days regardless of chapter progress; after expiry, paid lesson retrieval/completion, Noor, Tadabbur, and catalogue audio return `subscription_required` while vocabulary endpoints remain available.
- Media URLs load from the configured public R2 host.
- IAP is tested from a Play-installed tester build, not a sideload-only build.
- Purchase, restore, acknowledgement, cancellation, and Noor consumable flows are checked.
- Latest Android build covers uncommon lesson renderers.
- Privacy, terms, support, and account-deletion paths are reachable.

## 14. Scaling and deferred infrastructure

- Current Noor rate limiting uses database message counting. Measure before adding Redis.
- Prisma uses direct PostgreSQL pooling through the adapter; observe connection/load behavior before changing architecture.
- Media should remain CDN-backed and cached on clients.
- Avoid speculative queues, microservices, or data replicas before production evidence warrants them.

## Decision log

- **2026-07-11:** Consolidated current engineering and operations documentation; code is authoritative for route/schema inventories.
- **2026-07-08:** Expo web responsive shell and backend auth hardening added.
- **2026-07-07:** Production web deployment workflow and durable web CORS origins added.
