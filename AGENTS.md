# Warsh Repository Guide

Warsh is a Quranic Arabic learning product with an Expo Android/web client and a Next.js/PostgreSQL backend.

## Read first

Use only these active information sources:

1. `Docs/warsh-status.md` — what is built, verified, blocked, and next
2. `Docs/warsh-product-spec.md` — product behavior and locked decisions
3. `Docs/warsh-technical-spec.md` — architecture, commands, deployment, and operations
4. Current code/configuration — final evidence for implementation reality

Files under `Docs/archive/` are historical and must not be used as current requirements.

## Protected live pages

These files back live public pages and Google Play requirements. Do not rename, move, delete, or change their URL routing without explicit user approval:

- `landing/index.html`
- `Docs/privacy-policy.html`

## Repository map

- `warsh-backend/` — Next.js 14 API, Prisma 7, PostgreSQL/Neon
- `warsh-app/` — Expo SDK 54, React Native 0.81, Android and web
- `packages/lesson-schema/` — canonical Zod schema for lesson `content` JSON
- `warsh-backend/vendor/lesson-schema/` — backend-vendored build of that package

## Start Warsh

When the user says “start Warsh app” or a close variant, use the maintained root script:

```powershell
.\start-warsh.ps1
```

For Metro against the production API:

```powershell
.\start-warsh.ps1 -prod
```

Do not improvise the startup sequence. Local Android development uses ADB reverse and `http://127.0.0.1:3000`; never hardcode a LAN IP.

## Common commands

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
npm run lint -- --quiet
npx tsc --noEmit
npm run deploy:web
```

## Implementation rules

- Inspect `git status` before editing and preserve unrelated changes.
- For diagnosis-only requests, report the cause before changing code.
- Verify status against code, validators, builds, and runtime behavior; do not trust historical tracker claims blindly.
- Import the Prisma singleton from `warsh-backend/lib/prisma.ts`; never instantiate Prisma in routes.
- Validate lesson JSON through `@warsh/lesson-schema`; do not create another documentation schema.
- Use backend enforcement for authentication, chapter locking, completion, subscriptions, and admin access.
- Use `EXPO_PUBLIC_API_URL` for the app API origin.
- Use `components/ArabicText.tsx` for Arabic and shared tokens from `constants/theme.ts`.
- Use `components/BrandButton.tsx` for primary CTA behavior.
- Keep English/Urdu dictionaries synchronized; Arabic learning content remains Arabic in both modes.
- Never expose or commit real secrets.
- After Prisma schema changes, generate and migrate before verification.
- Do not run production seed casually.

## API conventions

- Success: `{ "data": { ... } }`
- Expected error: `{ "error": "Human message", "code": "snake_case_code" }`
- Protected routes derive user identity from the Bearer JWT.
- Browser requests use the supported CORS origins and `X-Warsh-Platform` behavior.

## Current product shell

- Tabs: Learn, Vocabulary, Noor, You
- Lesson templates: `STANDARD`, `SPOKEN_PHRASES`, `REVIEW`, `VERB_PATTERN`
- Canonical lesson schema: `packages/lesson-schema/src/`
- Canonical database schema: `warsh-backend/prisma/schema.prisma`
- Canonical fixtures: `warsh-backend/prisma/fixtures/`
- Canonical theme: `warsh-app/constants/theme.ts`
- Canonical current priorities: `Docs/warsh-status.md`
