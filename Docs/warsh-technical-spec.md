# Warsh Technical Specification

**Status:** Active engineering and operations source of truth
**Version:** 2.0 consolidated
**Last updated:** 2026-07-11

## Authority and maintenance

This document defines the current repository architecture, data boundaries, API conventions, local-development workflow, deployment shape, and operational rules. It consolidates the useful current material from the former technical specifications and implementation PRDs.

Use `Docs/warsh-product-spec.md` for product behavior and `Docs/warsh-status.md` for current verification and priorities. Exact schemas, routes, dependencies, and configuration are ultimately verified in code.

## 1. Repository structure

```text
Warsh/
├── warsh-app/                  Expo SDK 54 / React Native 0.81 client
├── warsh-backend/              Next.js 14 API backend
├── packages/lesson-schema/     Canonical Zod lesson-content package
├── Docs/                       Active documentation and protected privacy page
├── landing/                    Live public landing page source
├── start-warsh.ps1             Maintained local/prod launcher
├── AGENTS.md                   Short repository operating guide
└── CLAUDE.md                   Pointer to AGENTS.md
```

The backend and app are separate Node projects with separate lockfiles and commands.

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

### API configuration

`EXPO_PUBLIC_API_URL` is required and must be environment-appropriate:

- Local physical device through USB reverse: `http://127.0.0.1:3000`
- Staging: `https://api-staging.warsh.app`
- Production: `https://api.warsh.app`

Never commit a machine-specific LAN IP.

### Arabic and design

- Arabic uses the shared `ArabicText` component.
- Shared colors, spacing, typography, radii, shadows, and animation values live in `constants/theme.ts`.
- CTAs use `BrandButton`.
- Web uses the responsive `WebShell`.

## 6. Backend architecture

### Prisma

Import the singleton from `warsh-backend/lib/prisma.ts`. Do not instantiate `PrismaClient` in route files.

The current schema contains 12 models:

1. User
2. Streak
3. Chapter
4. Lesson
5. Progress
6. ChatMessage
7. Achievement
8. UserAchievement
9. VocabularyWord
10. TadabburSurah
11. UserSurahProgress
12. UserVocabularyWord

After schema changes:

```powershell
cd warsh-backend
npm run db:generate
npm run db:migrate
```

### Lesson content

`Lesson.content` is a JSON value validated by `@warsh/lesson-schema`. Admin writes and fixture validation must use the same package. Exercise IDs must remain stable and globally collision-safe according to the implemented validators.

### Course and completion

- `lib/course.ts` builds backend-authoritative chapter state.
- Previous-chapter completion controls unlocking.
- Placement can mark earlier progress `SKIPPED_BY_PLACEMENT`.
- `DEV_UNLOCK_ALL` is development-only and must not bypass production locking.
- Completion uses transactional updates for progress, XP, streak, achievements, and applicable paywall state.

### Time

PKT helpers live in `lib/date.ts`. Streak and daily-goal logic must use the defined Pakistan-time boundary consistently.

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

The repository currently contains 44 API route files. Major groups are:

- `/api/auth/*` — register, login, current user, refresh, forgot/reset/change password
- `/api/chapters*` — course state and chapter lesson lists
- `/api/lessons/*` — lesson retrieval and completion
- `/api/progress`, `/api/streak*`, `/api/achievements`
- `/api/vocabulary/*` — browse, word detail, user state, audio/image, SRS
- `/api/tadabbur/*`
- `/api/chat*`, `/api/noor/purchase-pack`
- `/api/subscription/*`
- `/api/audio/tts`
- `/api/users/me`
- `/api/admin/*`
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

### OpenAI

OpenAI supports Noor and on-demand TTS when configured. `lib/openai.ts` deliberately returns a local constrained tutor response if the provider is unavailable; production diagnostics must not mistake the fallback for provider health.

Quranic recitation must use human audio rather than synthesized speech.

### Google Play

Google Play verification uses service-account credentials and package `com.warsh.app`. The backend accepts only configured valid products and processes RTDN at `/api/webhooks/google`.

Store-console state is external. Always verify products, base plans, tester access, and Play-installed build availability before IAP QA.

### Email, monitoring, and analytics

- Resend: password-reset mail
- Sentry: backend/mobile errors and release diagnostics
- Mixpanel: product analytics
- Uptime monitoring: production health endpoint

Absence of optional configuration should disable or degrade the integration safely, except where the production launch checklist makes it mandatory.

## 10. Environment variables

The authoritative inventories are:

- `warsh-backend/.env.example`
- `warsh-app/.env.example`
- `warsh-app/eas.json`

Important groups:

- Database: `DATABASE_URL`, optional `DIRECT_DATABASE_URL`
- Auth/admin: `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_DASHBOARD_TOKEN`
- Development: `DEV_UNLOCK_ALL`, `ALLOW_UNAUTHENTICATED_ADMIN`
- AI/TTS: `OPENAI_API_KEY`, model/voice/limit settings
- R2: endpoint, credentials, bucket, public URL
- Store verification: Google/Apple package, secrets, and credentials
- Cron: `CRON_SECRET`
- Email: `RESEND_API_KEY`, sender
- Observability: Sentry and Mixpanel variables
- Client: `EXPO_PUBLIC_API_URL`, environment, Sentry DSN, Mixpanel token

Never duplicate secret values in documentation.

## 11. Local development

### Maintained launcher

When asked to start Warsh, use the root script:

```powershell
.\start-warsh.ps1
```

It verifies ADB, creates reverse tunnels for Metro/backend, starts the backend, waits for health, and starts Expo with `http://127.0.0.1:3000`.

For Metro against production:

```powershell
.\start-warsh.ps1 -prod
```

Do not improvise individual startup steps unless diagnosing the launcher itself.

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
- Database: Neon PostgreSQL
- Migrations and seed operations are explicit release actions; never run production seed casually.

### Android

EAS profiles:

- `development` — internal development client
- `preview` — staging APK using `api-staging.warsh.app`
- `previewProd` — production-API APK
- `production` — production channel/build submitted to the internal track

Android identity is `com.warsh.app`.

### Web app

From `warsh-app`:

```powershell
npm run deploy:web
```

The script builds against the production API, deploys through Vercel, targets `https://app.warsh.app`, and restores the developer's local `.env` afterward.

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

### Runtime validation

- Backend health returns 200.
- Register/login/refresh/password-reset flows work.
- Protected course and progress endpoints return expected envelopes.
- Android and web can load the same production API through their supported origins.
- Chapter lock and completion rules hold server-side.
- Trial access lasts seven full days regardless of chapter progress; after expiry, paid lesson retrieval/completion, Noor, Tadabbur, and general lesson TTS return `subscription_required` while vocabulary endpoints remain available.
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
