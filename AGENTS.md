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
  The same run also deletes `tadabburSurah` (and `userSurahProgress`) up front and
  only re-seeds them at the very end, so an interrupted seed leaves the Tadabbur
  card missing from the Learn tab with no error anywhere. Recover with
  `content:restore-tadabbur`, and run it **after** any vocabulary restore — word
  links are resolved against the current `VocabularyWord` ids at insert time.
  For Surahs already in the database, `content:restore-tadabbur -- --relink`
  rewrites those ids in place. A `vocabKey` there must equal
  `VocabularyWord.arabicPlain` exactly — stripping harakat folds neither the
  definite article nor the hamza, so a near-miss key reads as an unlinked word
  rather than an error.

## Backend invariants

- Import Prisma from `lib/prisma.ts`; never construct `PrismaClient` in a route.
- After Prisma schema changes, generate and migrate before verifying.
- `Lesson.content` is JSON validated by `@warsh/lesson-schema` — the same package
  for admin writes and fixture validation. Never add a second schema (including in
  `Docs/`).
- `lib/course.ts` is authoritative for chapter unlocking/completion. Locking,
  trial/subscription access, and admin checks are enforced server-side.
- A lesson published into a chapter a learner already finished never locks them
  (owner rule): it is read from `Lesson.addedAt`, which a database trigger
  stamps on first publish, and the learner is told through `lessonNotices` on
  `GET /api/chapters`. Do not set `addedAt` by hand, and do not bulk-rewrite
  `Lesson.content` without expecting every learner who completed those lessons
  to see an "Updated" notice (`contentUpdatedAt`, same trigger).
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
- **Content is edited in Studio (owner rule, 2026-10-31).** The owner reviews and
  fixes Chapters 2–72 lesson by lesson in Warsh Studio (`api.warsh.app/dashboard`),
  not in code. Every Claude session follows this:
  1. Start any content work with `content:check`. If the database is ahead, run
     `content:export` and commit it ("content: export Studio edits") before
     touching anything else.
  2. Do not change lesson content in `prisma/fixtures/` unless the owner asked for
     that specific change. When they do, change only the named lessons, publish
     with `content:sync -- --content --git-changed`, and confirm `content:check`
     is clean afterwards.
  3. A Studio edit is the owner's decision. Never re-add a card or exercise they
     deleted, and never revert text they changed, even if it looks like a
     mistake — ask instead. Commit `f6862d8` ("restore ex05") silently undid an
     owner deletion this way and the deleted test card reappeared in the app.
  4. Never re-run a `content:promote-*` script or the seed for a chapter that is
     live: they rewrite whole lessons and erase Studio work.
- Studio's curriculum screen is the owner's review checklist. Its automatic
  problem checks live in `lib/lessonChecks.ts` (shared by the editor and the
  server; `npm run content:review-checks` runs them over the fixtures), and a
  lesson cannot be approved while one remains unfixed or undismissed. Approval
  and dismissed checks are stored in `LessonContentReview` / `ContentReviewIssue`
  (issue type `AUTO_CHECK`), never in `Lesson.content`.
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
- Android lays a paragraph out right-to-left when its first strong character
  is Arabic, so English content that opens with an Arabic word ("مُؤْمِنُونَ
  means …") read scrambled. The lesson player now prefixes every learner-facing
  prose string with a Unicode direction mark (`withDirectionMark` in
  `play.tsx`); `writingDirection` is iOS-only and does nothing on Android, so
  any new `<Text>` that shows lesson content must use the same wrapper. A
  `CONTRAST` card needs `concept.ar` or its headline renders blank.
- **No human facial features in any Warsh image** (owner rule, 2026-09-24):
  lesson cards, vocabulary, chapter art and store/marketing images draw faces
  blank and featureless (no eyes, nose, mouth or expression) or turned away; a
  visible eye or smile, even in profile, fails. Say so in every generation
  prompt and open every image before uploading. To replace a live
  lesson picture use `images:upload-lessons -- --replace`; R2 caches
  `images/discover/` as immutable, so overwriting the same key changes nothing
  on devices that already saw it.
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

## Releases and deployment

Before **any** Android release build, Play upload, release gate, or production
deploy, read `Docs/warsh-release-runbook.md` in full and follow it. The two traps
that have already shipped broken builds:

- Export the production `EXPO_PUBLIC_*` values (incl. `.env.release`) before Gradle
  runs, or the bundle bakes in `http://127.0.0.1:3000`.
- `vercel --prod` ships the working tree, not `git HEAD` — commit first.

## Canonical sources

- Tabs: Learn, Vocabulary, Noor, You
- Lesson templates: `STANDARD`, `SPOKEN_PHRASES`, `REVIEW`, `VERB_PATTERN`
- Lesson schema: `packages/lesson-schema/src/`
- Database schema: `warsh-backend/prisma/schema.prisma`
- Fixtures: `warsh-backend/prisma/fixtures/`
- Theme: `warsh-app/constants/theme.ts` — the spec-11 palette is the locked truth;
  `theme.ts` keeps legacy key names mapped to spec-11 values by role
- Current priorities: `Docs/warsh-status.md`
