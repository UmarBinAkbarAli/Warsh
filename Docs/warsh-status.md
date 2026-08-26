# Warsh Current Status

**Status:** Active current-state source of truth
**Last verified:** 2026-08-26
**Repository:** `D:\Code\Warsh`
**Current phase:** Beta hardening and launch preparation

## How to use this file

Read this file to answer:

- What is working now?
- What is being worked on next?
- What remains blocked or unverified?
- What was most recently verified?

Product decisions live in `Docs/warsh-product-spec.md`. Architecture and operating instructions live in `Docs/warsh-technical-spec.md`. When a statement here conflicts with the running code, verify the code and correct this file in the same change.

This file replaces the active use of the old `progress.md`, project tracker, beta progress report, and beta infrastructure checklist. Those documents are historical records in `Docs/archive/`.

## Protected live website files

The following are live website/Google Play assets. Do not rename, move, delete, or change their URL routing unless the owner explicitly requests it:

- `landing/index.html` — protected legacy Warsh landing-page source
- `Docs/privacy-policy.html` — protected legacy privacy-policy source previously used by Google Play

The canonical public implementation now lives in `warsh-site/`. The protected legacy files remain release evidence and must not be renamed or removed.

## Current product reality

- Warsh is a Quranic Arabic learning product for Android and web.
- The primary launch platform remains Android through Google Play.
- The Android app is live in full **Production** release on Google Play as of
  2026-08-26 (owner-confirmed in conversation; not independently verified via
  Play Console, which this session cannot log into) — not open/closed testing.
  It is publicly discoverable and installable by anyone. This changelog's
  historical entries below still narrate the closed/open-testing upload
  history that preceded this; treat the release-track state in those entries
  as historical, not current.
- The Expo application explicitly supports `android` and `web`.
- The mobile application uses four tabs: Learn, Vocabulary, Noor, and You.
- The backend is a Next.js API connected through Prisma to PostgreSQL.
- Production Android builds call `https://api.warsh.app` directly.
- The production web bundle calls same-origin `https://app.warsh.app/api/*`,
  which the `warsh-web` Vercel deployment rewrites to
  `https://api.warsh.app/api/*` before its SPA fallback. This prevents the API
  hostname's Security Checkpoint from breaking browser CORS preflights.
- The public website and legal/help routes are deployed through the dedicated Vercel `warsh-site` project at `https://warsh.app` and `https://www.warsh.app`.

## Production ownership transfer

- The target production owner and recovery account is `trywarshapp@gmail.com`.
- Production ownership must move from personal accounts to that dedicated
  account across Google Cloud/Google Play, Vercel, Neon, Cloudflare/R2,
  Resend, Sentry, Mixpanel, Expo/EAS, domains/DNS, and every other service that
  can deploy, publish, bill, access production data, or recover access.
- Personal accounts must not remain the sole owner or sole recovery path. They
  may remain named collaborators only where required and approved.
- Transfer completion is not claimed here until each service's owner/admin,
  billing, deployment, OAuth/Play signing, domain/DNS, webhook, environment,
  and recovery access has been independently verified. Do not put passwords,
  tokens, or private keys in repository documentation.

## Implemented in code

### Core product

- Account registration, login, logout, token refresh, password reset, password change, and persisted sessions
- Google sign-in for Android and web, including backend ID-token verification,
  new-account creation, secure password-confirmed linking for matching Warsh
  emails, and English/Urdu entry UI
- Preview/onboarding flow with English and Urdu support
- Chapter listing, lesson listing, backend-enforced locking, placement skipping, and progress tracking
- Lesson playback and completion with XP, streak, daily-goal, chapter-bonus, and achievement updates
- Four lesson templates: `STANDARD`, `SPOKEN_PHRASES`, `REVIEW`, and `VERB_PATTERN`
- Renderers for all 15 current exercise types
- Vocabulary browsing, search, word detail, favorites/hidden state, Word of the Day, and SM-2-style SRS review
- Tadabbur content and progression screens
- Ustaad Noor chat with daily limits and consumable overage credits
- Subscription/paywall, purchase verification, restore flow, and Google RTDN webhook code
- Notifications, Mixpanel analytics, and Sentry integrations
- English and Urdu UI modes with Arabic content retained in Arabic script
- Responsive Expo web shell and production web deployment workflow

### Curriculum and content

- 72 curriculum chapters are represented in the authored fixture set.
- `warsh-backend/prisma/fixtures/` contains 391 JSON lesson fixtures, and all 391 are referenced by the production seed assembly.
- The shared lesson contract is implemented in `packages/lesson-schema` and vendored into the backend.
- Vocabulary records, Urdu metadata, audio URLs, image fields, and R2 upload/playback infrastructure exist.
- Audit exports exist for 585 vocabulary images and 1,203 discover-card word appearances.
- The protected Warsh Studio Content Review Desk exposes all 72 chapters and
  391 lessons as complete review documents, including Arabic, English, Urdu,
  exercises, correct-answer data, images, and audio. Review status, notes, and
  exact content-path/media issues are stored separately from learner content.

### Backend and infrastructure represented in code

- 68 API route files under `warsh-backend/app/api/`
- 17 Prisma models in the current schema
- JWT sessions with expiry, refresh rotation, and password-version invalidation
- Production-only admin protection and explicit dashboard token support
- Cloudflare R2 integration for audio/images
- Resend password-reset email integration
- Google Play purchase verification and RTDN endpoint
- Cron endpoints for trial expiration and streak reset
- Backend CORS allow-list with stable web origins
- EAS profiles for development, staging APK, production-preview APK, and production Android builds

## Recent verified repository changes

### 2026-08-26 (IAP fix)

- Diagnosed and fixed a live production bug: `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY`
  in Vercel production was not valid JSON, so `storeVerification.ts` failed
  closed on every real purchase attempt (by design — it never grants
  unverified access; see `getGoogleAccessToken` in
  `warsh-backend/lib/storeVerification.ts`). This was confirmed live by
  registering a throwaway account and calling `POST /api/subscription/verify`
  on `https://api.warsh.app` with a bogus purchase token, which returned
  `{"error":"Google Play service account key is not valid JSON.","code":"store_not_configured"}`
  — the exact condition behind the in-app "Purchase needs attention" alert the
  owner had seen, confirmed unrelated to any test card.
- Fix: generated a new JSON key for the existing
  `warsh-play-verifier@warsh-production.iam.gserviceaccount.com` service
  account in Google Cloud Console (additive — the prior key, `44108fcd27ac...`,
  was left active and untouched), replaced the Vercel production
  `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY` value via `vercel env rm` /
  `vercel env add` (piped from a local file so the raw key never appeared in
  any visible command output), deployed production (`dpl_9e5uk2QxWSkfP6N1FDmRLuMnGeb6`,
  aliased to `https://api.warsh.app`), and deleted every local copy of the
  downloaded key file immediately after use.
- Re-verified live with the same throwaway-account method: the same bogus
  purchase token now returns
  `{"error":"Google Play rejected the purchase token.","code":"invalid_purchase"}`
  — proof the backend now authenticates with Google's Android Publisher API
  and gets a real per-token rejection, rather than failing at the
  configuration stage. The diagnostic account was deleted via
  `DELETE /api/users/me` immediately after each check.
- Not yet done: deciding whether to revoke/delete the old, still-active
  `44108fcd27ac...` key for hygiene now that a working replacement exists.
  Left in place pending an explicit decision, since it isn't causing harm.

### 2026-08-26 (admin)

- Added a delete-account action to Warsh Studio's user pages: a
  confirm-by-typing-email gate on the user detail page, plus a quick Delete
  link on the users list for clearing out expired/dead accounts in bulk.
  Mirrors the learner's own `DELETE /api/users/me` and relies on the existing
  `onDelete: Cascade` in `schema.prisma`. This sits alongside the existing
  revoke-access action rather than replacing it.

### 2026-08-26 (later)

- The Chapter 1 restructure and `discover_cards[].image_url` fixes described
  below were published to production. Verified live: `content:check` reports
  391/391 lessons in sync (0 differences) against the production database, all
  391 `Lesson.updatedAt` values now read ~01:42 UTC today, and
  `audio:prebuild-catalog -- --from-db --audit` reports 3327/3327 R2 audio
  clips present (0 missing) — the 7 previously-missing clips for the new
  Chapter 1 text are generated. Learners are now served the restructured
  Chapter 1 and corrected image URLs.

### 2026-08-26

- Warsh Studio is now the designated authoring surface for chapter/lesson
  content, so the database is the source of truth for `Lesson.content` and
  `warsh-backend/prisma/fixtures/` is its versioned mirror. Added
  `content:export` (database to fixtures), `content:check` (release-gate drift
  report), and `content:baseline`, backed by
  `warsh-backend/prisma/lesson-sync-baseline.json`, which records the hash of
  each lesson at the last point the two sides agreed. That baseline is what
  lets the tooling distinguish a Studio edit (export required) from a Git edit
  (safe to publish) from both sides moving at once (a conflict). `content:sync`
  now refuses to push fixtures over the database while unexported database-side
  work exists, and `--all` requires `--force`.
- Measured against the production database on this date: 391 lessons across 72
  chapters, of which **233 differ from the fixture mirror, with Git ahead of
  production, not the reverse**. The maximum `Lesson.updatedAt` in production is
  2026-08-03, so no Studio edit has touched lesson content since then, while the
  fixtures were committed later in `68e365a` (2026-08-13 R2 repoint) and
  `0962a70` (2026-08-24 Chapter 1 restructure). Sampled diffs match those two
  commits: 218 `discover_cards[].image_url` changes plus wholesale Chapter 1
  rewrites. Live learners are therefore still served the pre-restructure
  Chapter 1 and the old image URLs. Publishing it is
  `npm run content:sync -- --content --git-changed`; this has **not** been run,
  because it changes what live users see and needs owner approval.
- Content Health now reports lessons whose Arabic text has no recorded audio.
  Audio is keyed by a sha256 of the text and runtime lookup has no generation
  fallback, so editing Arabic silently orphans its clip. The rule for which
  strings need audio moved to `warsh-backend/lib/audioTargets.ts` and is shared
  by the generator and the dashboard scan; the refactor was confirmed
  behaviour-preserving (2,616 clips / 69,874 characters, identical before and
  after). A live R2 audit found 2,609/2,616 present and 7 missing, all of them
  new text from the unshipped Chapter 1 restructure. Regenerate with
  `npm run audio:prebuild-catalog -- --from-db`.
- Verification: 50 backend tests pass (21 new), 391 fixture validations, backend
  production build, and TypeScript clean. Note for future runs: pulling all 391
  `Lesson.content` rows from Neon takes roughly 195 seconds from this machine
  (4.2 MB), so `content:check` and `content:export` are slow by nature, not hung.

### 2026-08-26 (security)

- Fixed a reflected XSS on `api.warsh.app/reset-password` (HIGH): the `?token=`
  parameter reached an inline `<script>` through a bare `JSON.stringify`, which
  escapes for JS-string context but not for the HTML parser, so a crafted
  token could inject markup. That origin also serves Warsh Studio and its
  admin cookie, so an admin clicking a crafted link would have handed over
  every `/api/admin/*` route. Fixed via `lib/inlineScript.ts`
  (`toInlineScriptJson` + `asSafeJwtParam`, JWT-shape gated, `< > U+2028
  U+2029` escaped, covered by `tests/inline-script.test.ts`), plus
  `Referrer-Policy: no-referrer` and `Cache-Control: no-store` on the page.
- Untracked `.codex/config.toml` and added `.codex/` to `.gitignore`. It held
  a MiniMax API token committed 2026-06-05 and still present at `origin/main`
  HEAD 82 days later on this **public** repository. The owner confirmed the
  MiniMax account/key was already revoked/closed, so the exposure is not
  live; the file remains retrievable from that old commit in git history if
  it is ever worth a history rewrite for hygiene, but this is not a launch
  blocker.
- Added security headers (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, HSTS, `Permissions-Policy`) to both `warsh-backend` and
  `warsh-site`, plus a full CSP on `warsh-site` (which renders Studio-authored
  HTML via `dangerouslySetInnerHTML`); `script-src` keeps `'unsafe-inline'`
  because the App Router emits inline hydration scripts. Live-reverified today:
  `curl` against `https://api.warsh.app/api/health` and `https://warsh.app/`
  both return the full header set, and the CSP is present on `warsh.app`.
- Fixed session-refresh trust: `/api/auth/refresh` now re-derives the
  password-version fingerprint from the live user row instead of inheriting
  `pv` from the presented token, closing a gap where a session predating the
  fingerprint feature stayed exempt from password-change invalidation for the
  rest of its 90-day window. Also rejects tokens whose user no longer exists.
- The Play RTDN webhook now verifies Pub/Sub's OIDC identity token when
  `GOOGLE_PLAY_PUBSUB_{AUDIENCE,SERVICE_ACCOUNT}` are set; the `?token=`
  shared-secret fallback is now compared in constant time.
- Rate limiting can now be backed by Upstash Redis when
  `UPSTASH_REDIS_REST_*` are set, replacing the previous per-instance memory
  buckets — on Vercel the real ceiling had been limit × instance count, reset
  on every deploy, including for `POST /api/admin/session`. That endpoint is
  now also explicitly rate-limited (5 per 15 min) and the rate-limit client
  key is derived from `x-real-ip` / the rightmost `x-forwarded-for` hop
  instead of the caller-supplied leftmost entry, which previously let an
  attacker mint a fresh bucket per request and bypass every limit in the
  codebase.
- Lower severity: bounded `POST /api/chat` message length to 2000 chars via
  Zod; admin image upload now checks `Content-Length` before buffering and
  decodes/re-encodes with `sharp` instead of trusting client `Content-Type`
  (strips EXIF, rejects polyglots); lesson-completion score is now
  Zod-validated (previously accepted `NaN`/`Infinity`/out-of-range); admin
  clients no longer see raw R2/Resend error messages; both cron routes are
  marked `force-dynamic`; the Noor offline fallback no longer names
  `OPENAI_API_KEY` or the `.env` deployment model to end users; Sentry
  sourcemaps are stripped from the deployed bundle after upload.
- Dependency fixes: `warsh-site` Next 16.2.10 → 16.3.3 plus a `nanoid`
  override (4 high advisories → 0); `warsh-backend` `npm audit fix` plus
  glob/esbuild overrides (20 findings, 15 high → 9, 8 high; the remainder
  needs a Next 14 → 16 major bump, deferred as its own change); the vendored
  `lesson-schema` manifest was synced to vitest `^4.1.9` to match the source
  package, closing the critical `GHSA-5xrq-8626-4rwp` advisory that the stale
  `^2.0.0` pin had left open.
- Verification: 39/39 backend tests, `db:validate-fixtures` (391 lessons),
  `db:audit-urdu` (72 chapters), backend build, `tsc --noEmit` over `app/` and
  `lib/` (0 errors), `warsh-site` build. The XSS fix was confirmed end to end
  against a running server with the live payload, and re-confirmed live today:
  a crafted `<script>` payload in `?token=` on the production
  `/reset-password` route is not reflected.

### 2026-08-21

- Product owner confirmed the following P0/P1 items as done and they were
  cleared from the active priority queue: production-access recovery (the app
  is live on the Google Play Store), production security/configuration check,
  paywall QA, privacy/Data safety alignment, live website verification, and
  the P1 vocabulary-image and discover-card-image sourcing items. This status
  is recorded on the owner's word in this conversation; no independent
  repository or live-environment evidence was gathered in this change, so
  re-verify from code/live state if these are ever load-bearing for a release
  decision.

### 2026-08-10

- Replaced learner-triggered OpenAI speech generation with a deterministic,
  prebuilt R2 audio catalogue. The admin materialization job inventoried 2,724
  unique fixed curriculum/Tadabbur clips plus 603 vocabulary clips and wrote or
  verified all expected objects. The paginated R2 audit passed at 3,327/3,327
  objects with zero missing.
- Production API code is now lookup-only for both `/api/audio/catalog` and the
  backward-compatible `/api/audio/tts` route. Vocabulary audio is also
  lookup-only. An automated test scans all production API source files and
  fails if any route imports the speech generator.
- Corrected app audio routing: all 82 Spoken Phrase recordings now use their
  existing R2 URLs; Tadabbur ayahs and vocabulary Quran examples use human
  EveryAyah recitation; Tadabbur vocabulary words use shared word audio; fixed
  discovery/practice text resolves through the R2 catalogue; Quran fragments
  without an exact human clip no longer synthesize recitation.
- Verification passed: 24 backend tests, 391 fixture validations, backend
  production build, app TypeScript, app quiet lint, runtime import scan, and R2
  coverage audit. Diagnosed the prior Vercel CLI deployment failures (timeouts
  and a `Response Error`): the archive uploaded from the repository root
  included `artifacts/` (504 MB), `warsh-site/` (341 MB), and `Warsh-images/`
  (87 MB), none of which belong in the `warsh-backend` deployment. An expanded
  `.vercelignore` now excludes those paths plus `landing`, `tests`, `ds-bundle`,
  `.codex`, and `.design-sync`. Deployed successfully as `dpl_2eGezdt5JS2sUemjHi5Bs3CE3Goe`,
  aliased to `https://api.warsh.app`.
- Live verification (via browser automation, since direct `curl` triggers
  Vercel's bot-mitigation checkpoint from this network): `/api/health` returns
  200. `/api/audio/catalog` and `/api/audio/tts` both return 401 without a
  token. With a fresh throwaway test account (created and deleted via the
  self-service endpoints during this check), `/api/vocabulary/words/[id]/audio`
  returned a real R2 URL that resolves 200; `/api/audio/catalog` for a real
  fixture exercise text (`الْمَسْجِدُ`) issued a redirect to the matching
  deterministic `audio/catalog/v1/<sha256>.mp3` object, confirmed to exist on
  R2; the same text through the legacy `/api/audio/tts` alias redirected
  identically; and a fabricated, never-cataloged string redirected to a
  `audio/catalog/v1/<sha256>.mp3` key that returned 404 with no generated
  fallback. `grep` across `warsh-backend/app` and `warsh-backend/lib` confirms
  no call site references `generateTtsMp3` outside its own unused definition
  in `lib/tts.ts`. Runtime TTS cost is eliminated in production.
- The app-side routing changes (Quran ayahs playing human EveryAyah audio
  instead of no-op/synthesis, `MATCH_AYAH` exercises no longer attempting
  Quran TTS, Tadabbur word audio using the stable per-word R2 key) are not
  yet in the published Android build; the backend's `/api/audio/tts` alias
  keeps the currently published build cost-safe in the meantime. Built a new
  signed local release APK from version `1.0.7 (23)` targeting only
  `https://api.warsh.app`, confirmed by extracting and grepping the bundled
  JS; app TypeScript and quiet lint both passed. Not uploaded to Google Play —
  publishing requires explicit approval.
- Diagnosed a live, unrelated production bug found while pre-upload-checking
  Google sign-in: `warsh-app/.env` (local, gitignored) was completely empty,
  so `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` was unset in every artifact built from
  it. `npm run deploy:web` only forces `EXPO_PUBLIC_API_URL`/
  `EXPO_PUBLIC_ENVIRONMENT` and inherits everything else from `.env`, so the
  live `https://app.warsh.app` Google button had been throwing
  `ensureGoogleSignInConfigured()`'s "not configured" error immediately on
  every page load, before ever requesting Google's script. The local release
  APK built earlier in this same session inherited the identical empty value.
  `eas.json` was unaffected — it hardcodes the client ID per build profile, so
  EAS-built app/Play releases were never affected.
- Restored `warsh-app/.env` with the standard local-dev defaults from
  `.env.example` plus the known public Google Web OAuth client ID (the same
  one already used across all `eas.json` profiles), redeployed
  `https://app.warsh.app` (`dpl_Bo1U365Hi8vpYTsMeqNPb8DkPjno`), and rebuilt the
  local release APK (SHA-256
  `3ffe6d042dbf97d23ef03ad7245649c0ab72b822e6fc52aa6167cb33a11b6431`) — the
  hash above is now stale. Verified live: on web, the Google button now
  renders and receives focus/click instead of failing instantly (full OAuth
  completion couldn't be automated further — Google's Identity Services
  resists non-human-triggered credential flows). On the `Warsh_API_34`
  emulator (no Google account configured, so a real credential exchange
  couldn't be completed either), logcat confirmed the button tap now correctly
  reaches Android Credential Manager and Google Play Services
  (`GetGoogleIdOperation`), which cleanly reports no available credential —
  the expected outcome for an account-less device, and proof the client ID is
  now wired correctly. A real end-to-end Google sign-in test on a
  Google-account-signed-in device remains required before Play upload.

### 2026-07-30

- Diagnosed the Google sign-in failure in Play release `1.0.6 (21)`. The
  Play-installed app certificate matches the registered Play App Signing OAuth
  client, so the failure is not a Google Cloud fingerprint mismatch. The native
  Nitro-hosted Google button rendered but its press callback did not reach the
  app on either the physical Play device or the emulator.
- Preserved the official Google button appearance while routing interaction
  through a standard React Native press target. The press now invokes Credential
  Manager directly, falls back to account creation when no saved credential is
  available, handles cancellation without a false error, and reports provider
  failures to Sentry. TypeScript, lint, release APK compilation, installation,
  and invocation of Android Credential Manager pass. A Google-account
  end-to-end test on the next Play-signed build remains required.
- Updated the maintained release launcher to load the production Google Web
  OAuth client ID from `warsh-app/eas.json`, preventing local release APK tests
  from silently omitting Google authentication configuration.
- Built Android release `1.0.6 (22)` with EAS build
  `529c1769-804e-440f-ac97-4d2049098a9a` and uploaded it to Google Play
  **Closed testing - Alpha** at a 100% rollout. The signed AAB passed signing,
  production API/OAuth configuration, 16 KB native-library alignment, TypeScript,
  lint, backend tests/build, and all 391 lesson-fixture checks. Play reported no
  supported-device loss and only the optional missing deobfuscation-file warning.
  The release was sent for review on July 30, 2026; Publishing overview currently
  shows `Changes in review` while Play runs automated checks. A real Google-account
  sign-in test is still required after Play makes version 22 available.

### 2026-07-29

- Added an isolated staging-first content workflow. A localhost-only PostgreSQL
  17 staging database now applies all 26 migrations and refreshes the authored
  curriculum without touching production. `start-warsh-staging.ps1` preserves
  this database in Docker, validates its loopback-only port binding, and passes
  explicit staging database variables to the backend launcher.
- Completed the first staging QA pass for An-Nas curriculum coverage. All 391
  fixtures validate, the staging seed contains 595 vocabulary words and all 11
  Tadabbur surahs, and focused An-Nas coverage checks link every token to taught
  lesson content and an assessment. Emulator checks confirmed the affected
  Chapter 2, 3, 13, 16, and 18 lesson integrations. The standalone `بِ` display
  was corrected after staging exposed clipping.
- Completed the staging implementation for Al-Falaq. All 23 rendered tokens now
  link to vocabulary, shared words reuse verified earlier lessons, and the
  remaining surah-specific words are taught and assessed in Chapter 19 Lesson 6.
  The former lesson incorrectly treated `رَبِّ` as the possessive `رَبِّي`,
  called the Quranic speaker a poet, introduced wording absent from the surah,
  and covered only ayah 1; the replacement accurately covers all five ayat.
  Emulator QA also caught and corrected an unreadable mixed-direction paragraph,
  a sentence-builder tile-count failure, and an oversized final exercise.
- Promoted the reviewed An-Nas and Al-Falaq release to production through
  merged PR #5 and backend deployment `dpl_9fBQofLxYsQj53f46ujKSAS7UcDk`.
  The scoped transaction updated nine lesson records, inserted 18 vocabulary
  records, and updated both Tadabbur surahs in place without resetting learner
  progress. Production verification passed at 20/20 linked An-Nas tokens,
  23/23 linked Al-Falaq tokens, and HTTP 200 on `https://api.warsh.app/api/health`.
- Production promotion is now an explicit gate: validators, isolated staging
  migration/content refresh, affected-lesson visual QA, and product-owner
  approval must all pass before a scoped production content update. The
  configured `api-staging.warsh.app` preview hostname is not currently
  operational and must not be treated as a live staging service.

### 2026-07-28

- Implemented the approved Google sign-in flow in code. The backend verifies
  Google ID tokens against one Web OAuth client audience, stores Google's
  durable subject identifier, creates social-only users without exposing a
  usable password, and requires one Warsh-password confirmation before linking
  an existing matching email. Android uses Credential Manager through
  `react-native-nitro-google-signin`; web uses the official Google Identity
  Services control. English/Urdu auth-option states, TypeScript, lint, the
  backend production build, and 22 backend tests pass.
- Completed Google Auth Platform setup in Google Cloud project
  `warsh-production` (`Warsh Production`): the User Data Policy is accepted,
  the external audience is in production, and separate Web, Play App Signing
  Android, and upload-key Android OAuth clients are active. The production
  database migration, Vercel API environment, backend deployment, and Expo web
  deployment are live; `app.warsh.app` renders the official Google Identity
  Services button and its API proxy is healthy. Google branding verification
  remains pending because `warsh.app` is not yet registered to the project
  owner in Google Search Console. A signed production Android APK now compiles
  with the Google native module, production API, Web client ID, and the
  registered upload-key signature; a real-device Google account test remains
  required.
- Built and uploaded Android release `1.0.6 (19)` with Google sign-in to Google
  Play **Closed testing - Alpha** at a 100% rollout. The 46,216,384-byte AAB has
  SHA-256
  `BA02EFC6B26A023589448C7DBC21C9F3C5E2C36A719B3DF3C9AB6442FB0D4665`,
  embeds `https://api.warsh.app` and the production Google Web OAuth client,
  contains no localhost API, and is signed by the registered upload
  certificate with SHA-1 ending in `D2:6B`. All 63 packaged native libraries
  passed the 16 KB compatibility gate. Play accepted version code 19 with
  target SDK 36 and no supported-device loss; its only validation warning is
  the optional missing R8/ProGuard deobfuscation file. Publishing overview
  reports **Changes in review** while Play runs its quick checks, so tester
  availability for version 19 remains pending Google processing.
- Diagnosed the clean-install crash reported on a physical TECNO KF8 running
  Android 11. Logcat captured a native RenderThread `SIGSEGV` in the vendor
  Mali OpenGL stack (`libGLES_mali`/`libGLES_meow`) while the A1 welcome screen
  rendered its dense rotated grain/corner decoration and elevated layers. The
  approved A1 simplification removes those risky decorative and shadow layers
  without adding global compatibility mode or a software-rendering fallback.
  A signed production APK then passed the first clean launch plus five repeated
  force-stop/data-clear/launch cycles on the same device with no native crash.
  Live `app.warsh.app` also loaded the authenticated Learn home and lesson
  content, confirming the production lesson API path remains healthy.
- Built signed Android release `1.0.6 (20)` from the verified fix and uploaded
  it to Google Play **Closed testing - Alpha** for a 100% rollout. The
  46,218,349-byte AAB has SHA-256
  `BBD822B78598BC6D1C6DA008D001021BDE39252BBFDFAD3632E0040116FE333B`,
  targets SDK 36, supports API 24+, and embeds only the production API origin.
  Play accepted the bundle with no device-support loss; its only warning is the
  optional R8/ProGuard deobfuscation file. Publishing overview reports
  **Changes in review** while Play runs automated checks, so version 20 is not
  yet confirmed available to testers.
- Deployed the matching backend and web client to production. Backend deployment
  `dpl_Hhcj7CgwejXkATtk9iDxVbKLwCTi` is READY and aliased to
  `https://api.warsh.app`; its health endpoint returns HTTP 200 and the Google
  auth route is live. Web deployment `dpl_ociBy7zga6qTYvpJc9zvztYuYewq` is
  READY and aliased to `https://app.warsh.app`.

### 2026-07-26

- Added and deployed the protected Warsh Studio Content Review Desk at
  `https://api.warsh.app/dashboard/content-review`. It provides search and
  status filters across all 72 chapters and 391 lessons, recursively renders
  every authored content field, previews images, exposes audio controls and
  media sources, records exact-path issue categories/notes, and prevents
  approval while issues remain open. Review data is isolated in
  `LessonContentReview` and `ContentReviewIssue`; migration
  `20260726150000_add_content_review` was applied without modifying lesson
  JSON. Backend build, 19/19 tests, desktop and 390 px browser workflows, live
  admin authentication, production curriculum/media rendering, and API health
  passed. Production deployment `dpl_HkeGJZGn5xgYqB6gdgp3aCJh13Kd` is READY
  and aliased to `https://api.warsh.app`.
- Diagnosed the Closed-testing login outage in Play version `1.0.6 (15)`.
  The uploaded AAB embedded `http://127.0.0.1:3000` and did not contain
  `https://api.warsh.app`, so Play-installed devices could not reach the
  production backend. The failure occurred because that local AAB was built
  before the release-build API selection fix in commit `ac3f01e`.
- Built the signed replacement production AAB as `1.0.6 (18)` through the EAS
  production profile. The finished artifact contains exactly one
  `https://api.warsh.app` reference and no localhost or staging API reference.
  Its SHA-256 is
  `989BFE37B19CC2A8D3A6F2046CA0FF069B58A74819BAA36A1FF5F30D30453B9D`,
  its upload certificate SHA-1 ends in `D2:6B`, and all 60 native libraries
  pass the 16 KB alignment gate. The bundle was uploaded to the Play Console
  Closed testing Alpha track at a 100% rollout and submitted for review on
  July 26, 2026. Google Play currently reports `Changes in review`; tester
  availability remains pending Play approval and processing.

### 2026-07-24

- Corrected the Android production signing path after EAS produced version 12
  with a certificate that did not match the upload certificate registered in
  Play Console. Production EAS builds now use the established local Play
  upload keystore through ignored `credentials.json` configuration. Added
  `npm run verify:play-signing` as a release gate; it rejects the bad version
  12 AAB and accepts only the registered upload certificate ending in
  `D2:6B`.
- Built replacement Android release `1.0.6` (`versionCode` 14) from the current
  tree with the correct upload key. The release build passed, its embedded
  certificate exactly matches Play Console, and all 60 native libraries passed
  the 16 KB alignment audit.
- Corrected the production streak-day implementation to use one consistent
  04:00 PKT boundary. Lesson completion now restarts a cron-reset zero streak
  at one, compares consecutive activity by 04:00-to-04:00 day buckets, and
  preserves the existing milestone/freeze behavior. The daily cron now waits
  until a complete streak day has actually been missed instead of resetting
  valid activity when a new day opens.
- Added four focused streak boundary/transition tests; the complete backend
  suite passes 19/19 and the production build passes. Deployed the correction
  to Vercel production as `dpl_Gfuf7Ssc4uGoiEowG5VppTwoXuJR`, aliased to
  `https://api.warsh.app`; health returned HTTP 200 and the immediate
  production error-log query was empty.
- Repaired the single production streak record that had completed lessons in
  the current 04:00 PKT window but remained at zero. The conditional repair
  updated one record, left no recently active zero-streak records, and restored
  the production active-streak count to one.

### 2026-07-23

- Added a Google Play-aware Android update banner. A small native bridge asks
  Play whether the current tester account is eligible for a higher version
  code; Warsh checks at launch and whenever it returns to the foreground,
  presents localized English/Urdu update copy, and opens the Play listing.
  Sideloaded APKs and unavailable Play services fail quietly without creating
  false Sentry errors. App TypeScript, quiet lint, diff checks, and the Android
  `:app:compileDebugKotlin` native compilation pass.
- Completed matching `1.0.6 (12)` EAS jobs from source fingerprint
  `b185431c73ec24feef248eef3daf7b1bfe0210ec`: production AAB
  `bc5e8584-8da6-4c34-ac21-88e043e886db` and production-API APK
  `dc00c010-a725-4dcb-a043-6abc44d7fe09`. Bundletool validates the AAB as
  `com.warsh.app`, version `1.0.6 (12)`, min SDK 24, target SDK 36. The
  44,311,085-byte AAB has SHA-256
  `4152888EDC785CA0AC6981EAA37EB2A7794C92AA22EB20278F16478C056D15D5`; the
  77,012,722-byte APK has SHA-256
  `58C30AEF47F23F0B266BCE3AE2A5CF1447455FE3ADE9E7658E1DE64104C3DDEC`.
  Both artifacts contain 60 native libraries and pass the 16 KB alignment
  gate. The signed APK installed cleanly on `Warsh_API_34`, survived a cold
  relaunch with no crash or ANR, and rendered onboarding. Play-owned update
  availability remains an external verification gate after the AAB is
  published to Closed testing.

### 2026-07-22

- Completed production Sentry configuration for both services. The authenticated Sentry projects are `warsh-backend` for `api.warsh.app` and `warsh-mobile` for the Expo/Android client; the matching Vercel and EAS production variables are configured without documenting secret values.
- Deployed the privacy-hardened backend to Vercel production as deployment `dpl_CwZcKiNiCNvfq7WQM6Hconrjad26`, aliased to `https://api.warsh.app`. The remote build uploaded backend server, edge, and client artifact bundles to `warsh-backend`; `/api/health` returned HTTP 200 and the immediate production error-log scan was empty.
- Enabled Android production source-map upload and completed EAS build `d3f027fb-2e36-48d6-9741-6a62b4a4a490` as `1.0.6 (11)` without submitting it to Google Play. Sentry accepted the two-file artifact bundle for release `com.warsh.app@1.0.6+11`, distribution `11`, upload ID `5c668955-9f4d-5c0c-a327-ee9f64f5b07a`, and debug ID `a11901a0-ab16-4a9d-93e1-d25ec0175c16`.
- Verified mobile symbolication end to end with synthetic production event `34d08e336c144b44a1ece5dbe6bc7676`: Sentry issue `WARSH-MOBILE-4` resolved the generated Android frame to `/services/sentry.ts:109:2` and displayed the original TypeScript source context. The verification AAB is 44,287,908 bytes with SHA-256 `AB2F6EDA748E54EF40D512C6482D18AC846033A1215AC0AAB495F0110B7CA991`; all 60 native libraries passed the 16 KB alignment gate.
- Added repository-level EAS archive exclusions after proving that app-local exclusions alone caused the whole monorepo and native caches to be archived. The verified upload fell from about 1.08 GB to 77.5 MB and contained no environment files, APK/AAB outputs, native build caches, or keystores. EAS remote credential injection is supported while local release builds continue to require explicit `WARSH_UPLOAD_*` signing values.
- Re-ran backend tests (15/15), app TypeScript, quiet lint, and `git diff --check`; all passed.

### 2026-07-21

- Hardened Sentry data minimization on mobile and backend: default PII transmission is explicitly disabled, request cookies/query strings are removed, URL query/fragment data and authorization/cookie headers are scrubbed, and breadcrumb data is sanitized. Browser session replay was removed because Warsh only needs crash and performance diagnostics. The backend Sentry smoke event was accepted, all 15 backend tests passed, app TypeScript/quiet lint passed, and the backend production build passed.
- The Sentry source-map upload was externally blocked on July 21 because the configured project slug did not exist. This blocker was resolved and fully verified on July 22 as recorded above.

### 2026-07-20

- Corrected the public deployment architecture: `api.warsh.app` is again API-only on Vercel project `warsh`; `app.warsh.app` remains the Expo web client on `warsh-web`; and the landing, privacy, Terms, deletion, and help pages are deployed from `warsh-site/` on the dedicated `warsh-site` project. Vercel now assigns `warsh.app` and `www.warsh.app` only to `warsh-site`.
- Published final website deployment `dpl_HyEhEGebzEFLZkfGF4yMfuc32NCn` and compatibility-safe backend deployment `dpl_6SB9evAoYP9sZgwHzX1sfoQshAbV`. Local production builds, responsive Playwright tests, legal-page tests, app TypeScript/lint, backend tests, and the API surface smoke test all passed.
- Updated new app builds to open legal/help content at `https://warsh.app` instead of the API origin. The backend retains permanent redirects from its former legal/help paths for already-distributed builds. Production `PUBLIC_SITE_URL` temporarily points those redirects to the stable `warsh-site` Vercel alias; both destinations serve the same dedicated site and external clean-network checks verified privacy, deletion, and API health through `api.warsh.app`. Switch this variable to `https://warsh.app` after refreshing the expired Vercel CLI session.
- Explicitly disabled Vercel Attack Challenge Mode for both `warsh-site` and `warsh`. Clean no-cookie probes returned the expected site HTML and API JSON with no mitigation header, but a burst of parallel automated browser requests caused Vercel's platform-wide system mitigation to challenge this shared test source again. A separate external clean-network fetch then returned HTTP 200 for the landing, privacy, Terms, deletion, and Help pages and returned the documented JSON from `/api/health`. Play-installed verification remains required; there are no project WAF/custom/IP rules causing the challenged response.
- Completed the Namecheap cutover without changing nameservers or unrelated records. The authoritative records are apex `A 216.198.79.1` and `www CNAME 2eac99eaa82c15f3.vercel-dns-017.com`. Google and Cloudflare resolvers and an external clean-network fetch resolve both hosts to the new site; the remaining Console action is updating the privacy-policy and account-deletion URLs to `https://warsh.app/privacy` and `https://warsh.app/delete-account`.
- Google did not grant the July 11 production-access application. The account-owner email requires an additional 14 days of closed testing with real testers and identifies insufficient tester engagement and/or insufficient evidence of feedback-driven testing as possible reasons. Production access is therefore blocked until a new qualifying closed-test period is completed and a stronger application is submitted.
- Built and signed the fresh production candidate `1.0.6` with Android version code `7`, targeting the production API. The 44,288,103-byte AAB has SHA-256 `82CAEC9B5EC99822880D63475345509511B0F48C497866B65FA9769D524AA525`; bundletool confirmed package `com.warsh.app`, min SDK 24, target SDK 36, and `PAGE_ALIGNMENT_16K`, and all 60 packaged native libraries passed the 16 KB alignment gate.
- Uploaded release `7 (1.0.6)` to Google Play **Closed testing - Alpha** at 100% and sent it for review. Play accepted the bundle and showed no 16 KB error; the only release-review warnings were one newly unsupported phone model and the optional missing R8/ProGuard deobfuscation file. Publishing overview currently shows the change in review while Play runs automated checks, so the new 14-day test period must not be counted until the release is available to the closed tester group and at least 12 real testers are continuously opted in.
- Completed the P0-3 backend legal-page implementation: `/privacy` and `/terms` now use the corrected disclosures, and a public `/delete-account` resource documents in-app deletion, the email-request path, deletion scope, and the separate Google Play subscription-cancellation requirement.
- Passed a fresh backend production build and automated Chrome verification at 390 x 844 and 1280 x 900 for the backend privacy, Terms, deletion page, and protected static privacy file. The checks cover required text, links, absence of the removed 180-day promise, console/HTTP errors, and horizontal overflow.
- Deployed the verified backend to Vercel production as deployment `dpl_H6pBUsMxjZcA4wG5KWo9HXmSvpM4`, aliased to `https://api.warsh.app`. The Vercel build completed, but Sentry source-map upload reported an invalid organization/project configuration and must be corrected separately.
- The earlier backend-hosted legal deployment and static cPanel upload plan are superseded by the dedicated `warsh-site` deployment above. The protected files remain in place, and the canonical `warsh.app` Play URLs are now ready to be entered in Play Console.

### 2026-07-19

- Built signed Android release `1.0.4` with version code `5` for the production API. The final AAB contains only `armeabi-v7a`, `arm64-v8a`, and `x86_64`; all 60 packaged native libraries passed the permanent 16 KB alignment check, and bundletool reported 16 KB page alignment.
- Installed an AAB-derived APK set on the Android 15 `Warsh_API_35_16KB` emulator and verified `PAGE_SIZE=16384`. Cold launch, onboarding, audio playback, navigation, registration, settings, subscription/paywall rendering, IAP-unavailable handling, and account deletion completed without native crashes or ANRs.
- Published release `5 (1.0.4)` to Google Play Internal testing. Play reports the release as Active and Available to internal testers, and App bundle details report `Memory page size: Supports 16 KB` with no page-size warning.
- Corrected the Noor one-time purchase flow end to end: activated `warsh_noor_pack`, deactivated the accidental prepaid base plan, added the durable idempotent purchase ledger, deployed the production migration/backend, and published release `6 (1.0.5)` to Internal testing at 4:32 PM. The authenticated tester account accepted the invitation; Play reports build 6 as available to internal testers.
- The Play-installed billing matrix is waiting on a one-time Google account sign-in on the Android test emulator. The emulator currently has no signed-in Play Store account, and the desktop remote installer correctly stopped at Google password reauthentication; no credentials were accessed.
- Began Google Play audit item P0-3. Consolidated the public and in-app privacy policies without changing either URL, added accurate Mixpanel/Sentry/OpenAI/purchase/microphone disclosures, standardized `support@warsh.app`, removed the unenforced 180-day chat-retention promise from the privacy policy and Terms, and passed the backend production build. Play Console Data safety edits and clean-network live URL verification remain pending.
- The separate live Play Billing purchase/restore matrix remains a launch gate because successful billing must be tested from the Play-distributed build with a licensed tester.

### 2026-07-15

- Rebuilt the Android paywall as one shared English/Urdu layout with a full-width benefits card, vertically stacked monthly/yearly plans, RTL-safe Urdu pricing, localized copy, and the existing purchase/restore/plan-switch behavior preserved.
- Verified both paywall languages on the `Warsh_API_34` emulator from a production release APK; both fit the phone viewport without clipping, and plan selection updates the selected card and CTA correctly. No live purchase was initiated.
- Prepared signed production artifacts for release `1.0.3` with Android version code `4`: an emulator-installable APK and a Play Store AAB. Both bundles target `https://api.warsh.app`; live Play-installed IAP sandbox QA remains a launch gate.

### 2026-07-11

- Trial policy clarified and enforced as seven full days of complete access; chapter progress never ends access early.
- Paid lesson retrieval/completion, Noor, Tadabbur, and catalogue audio share backend subscription enforcement; Vocabulary remains free.
- Noor updated for the 72-chapter curriculum with explicit role/safety boundaries and latest-message context.
- All 391 validated lesson fixtures are now wired into `seed.cjs`.
- The live Neon database was seeded and verified at 72 chapters, 391 lessons, 585 vocabulary words, and 36 preserved user accounts.
- Settings Help, Feedback, Privacy, and Terms actions are wired to the existing live destinations.

### 2026-07-08

- Backend authentication hardening for registration, login, forgot-password, reset-password, and admin access
- Spec-11 design update to the selected A1 gold-and-navy direction
- Responsive web shell added
- Shared brand palette, type scale, button, and tab-bar alignment completed
- Hardcoded color sweep moved UI colors into shared tokens

### 2026-07-07

- Reliable `npm run deploy:web` production deployment workflow added
- Backend CORS updated for the deployed web application
- Vercel Git auto-deploy connection rechecked

### Earlier beta foundation

- Production API/domain, Neon database, R2 media, Sentry, Mixpanel, email, Google Play products, and RTDN were previously reported configured.
- Physical Android route-load QA previously passed for all Chapter 1-8 lesson routes.
- Focused device checks previously passed for spoken phrases, matching, and grammar parsing.
- These external/live results are retained as prior evidence, but should be rechecked when they become a launch gate.

## Active priority queue

### P0 — launch blockers and required verification

1. **Live IAP sandbox QA** — verify monthly and yearly subscription purchase, restore, acknowledgement, and Noor consumable behavior on a Play-installed build. The server-side verification blocker that previously made this impossible (below) is now fixed. No real charge is required: add the test Gmail account under Play Console → Monetize setup → License testing, sign into that account on the test device, and purchases against the (now-production) listing are served as no-charge test transactions with accelerated renewal/expiry for testing that behavior too.
2. **Target-audience decision** — either select adults only for the simplest launch or implement the required age/minor handling before keeping ages 13–17.
3. **Latest-build device QA** — verify `VERB_PATTERN`, `AUDIO_RECOGNITION`, `WRITE_ARABIC`, and `HARAKAH_PLACEMENT` on a physical Android device.
4. **Scholar/content review** — establish a review process for Quranic Arabic accuracy, ayah relevance, pedagogy, repetition, and pacing before public launch.
5. **Confirm Play Console Payments profile (merchant account) is fully verified.** Owner reports a non-tester phone was served a test-card-only checkout against the live production listing; the most likely cause is an incomplete Payments profile, which Google gates to test-purchase-only for all users regardless of License Testing settings. Not independently verified — this session has no Play Console access.

### P1 — content quality and launch polish

1. Review representative lessons across Chapters 9-72, emphasizing uncommon exercise types and book transitions.
2. Reconcile any remaining visual differences against the current gold/navy design tokens.
3. **Streak-commitment screen has no real backend effect (not yet designed or built)** — `warsh-app/app/(app)/streak-commitment.tsx` (shown once after first lesson completion, via `streak-celebration.tsx`) lets a user pick a 3/7/14/30-day streak goal, but the selection is only ever written to a local AsyncStorage flag (`warsh_streak_commitment_set`) and never sent to the backend or read anywhere else — it currently exists only to gate "don't ask again." Comparable apps (Duolingo) persist this server-side and use it to drive reminder/streak-risk copy. As of 2026-08-24, `streak-celebration.tsx` was changed to skip straight to the tabs when the user already set a daily goal via the "Getting started" onboarding checklist's `warsh_onboarding_goal_set_${userId}` flag (avoids asking twice), but this is still a client-only patch, not the real fix. Full version needs its own plan:
   - A real Prisma field (e.g. `streakGoalDays` on `User`) plus migration, and a write path from `streak-commitment.tsx` via `updateUserProfile`.
   - Wiring the committed value into the existing `streakRiskEnabled` notification logic (`warsh-app/services/notifications.ts` / settings) so it actually drives reminder copy and urgency, not just a one-time click.
   - A decision on whether the checklist's daily-goal step (minutes/day) and this streak-day-count commitment stay two separate concepts, or get merged into one onboarding "commitment" moment (Duolingo asks both together, once, during signup).
4. **Lesson pass/fail requirement (not yet designed or built)** — today `warsh-app/app/(app)/lessons/[lessonId]/play.tsx` auto-advances past every exercise regardless of correctness and `POST /api/lessons/[lessonId]/complete` always sends a hardcoded `score: 100`, so a learner can miss every exercise in a lesson and still complete it with full XP/streak/chapter-unlock credit. Requirement: missing a minimum number of exercises (proposed threshold: 3 wrong) should force a lesson retry instead of completing it. Open decisions before implementation:
   - Is the threshold an absolute wrong-count or a percentage, given lessons vary in exercise count (5-15+)?
   - Enforcement must move server-side — the client should send per-exercise results and `complete` should compute score/pass-fail itself, not trust a client-sent score (matches this repo's "never trust client-supplied business data" pattern).
   - On fail: does the chapter stay locked (via `lib/course.ts`), does XP/streak/daily-goal credit get withheld or still banked for the attempt, and what does the learner see (retry screen vs. normal completion screen)?
   - Does the rule apply to every lesson template, or only answerable exercise types — `SHADOW_REPEAT`/`SPOKEN_PHRASES` are recording-completion based (`phrasesCompletedRef`), not right/wrong scored, and may need to stay exempt or get their own rule.

### Later

- iOS/App Store release
- Automatic pronunciation scoring
- Persistent Noor memory
- Social profiles, leaderboards, or family accounts

Redis-backed rate limiting is no longer purely deferred: as of 2026-08-26
(`f260be5`), `lib/rateLimit.ts` uses Upstash Redis when
`UPSTASH_REDIS_REST_*` are configured, falling back to the in-process limiter
otherwise. Confirming `UPSTASH_REDIS_REST_*` is actually set in production
remains unverified.

## Current risks

- **Content risk:** fixture validation proves structure, not scholarly or pedagogical correctness.
- **Store risk:** repository code cannot establish current Google Play approval or sandbox-product availability.
- **IAP risk:** billing code has changed since the last device report and still requires end-to-end Play-installed verification. The trial is seven days of full access; Chapter 1 completion is not a paywall trigger.
- **Tracker drift risk:** historical documents contain outdated product IDs, platform assumptions, SDK versions, URLs, and completed tasks.
- **Asset risk:** image infrastructure exists, but illustration coverage remains incomplete.
- **Rate-limit risk:** Noor limits rely on database message counting; this is acceptable for current scale but should be measured under load.
- **Secret-exposure risk:** the repo is public, and this has surfaced at least two real leaked secrets over the project's history that were found this way — treat any credential ever committed as compromised on discovery, even after the file is untracked.

## Verification commands

Run from the indicated project directory.

### Backend

```powershell
cd warsh-backend
npm run db:generate
npm run db:validate-fixtures
npm run db:audit-urdu
npm run build
```

### App

```powershell
cd warsh-app
npm run lint -- --quiet
npx tsc --noEmit
```

### Local physical-device flow

From the repository root, use the maintained launcher:

```powershell
.\start-warsh.ps1
```

For Metro against the production API:

```powershell
.\start-warsh.ps1 -prod
```

### Web deployment

```powershell
cd warsh-app
npm run deploy:web
```

## Update rule

Keep this document short and current:

1. Move completed active items into a compact dated entry; do not append long implementation diaries.
2. Record only evidence-backed status.
3. Label external service state as needing live verification when it has not been checked in the current work.
4. Update this file in the same change whenever an active priority is completed or materially changed.
5. Use Git history for detailed implementation history.
