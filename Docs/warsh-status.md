# Warsh Current Status

**Status:** Active current-state source of truth
**Last verified:** 2026-09-11
**Repository:** `D:\Code\Warsh`
**Current phase:** Post-launch hardening

## How to use this file

Read this file to answer: what works now, what is being worked on next, and what
remains blocked or unverified.

Product decisions live in `Docs/warsh-product-spec.md`. Architecture and operations
live in `Docs/warsh-technical-spec.md`. Commands, invariants, and the release gate
live in `AGENTS.md`. When a statement here conflicts with the running code, verify
the code and correct this file in the same change.

Implementation history is in Git, not here. `Docs/archive/` is historical and
`Docs/proposals/` is designed-but-unapproved work; neither is a current requirement.

## Protected live website files

Live website/Google Play assets. Do not rename, move, delete, or change their URL
routing unless the owner explicitly requests it:

- `landing/index.html` — protected legacy landing-page source
- `Docs/privacy-policy.html` — protected legacy privacy policy previously used by Play

The canonical public implementation now lives in `warsh-site/`. The protected legacy
files remain release evidence.

## Current product reality

- Warsh is a Quranic Arabic learning product for Android and web. Android through
  Google Play is the primary launch platform.
- The Android app is live in full **Production** on Google Play as of 2026-08-26
  (confirmed live in Play Console via browser automation on 2026-08-27). It is
  publicly discoverable and installable by anyone.
- **Version 1.0.8 (versionCode 32) was submitted to Production on 2026-09-10** at a
  100% staged rollout and is in Google review. The live build until it is approved
  is versionCode 30 (1.0.7) — versionCode 31 was built on 2026-09-02 but never
  published, so 1.0.8 carries everything since 30. Play reported zero devices lost
  and a 855 KB smaller install; its only warning is the missing R8 deobfuscation
  file, which is expected while Sentry upload is disabled during the release build.
- The Expo application supports `android` and `web`. Four tabs: Learn, Vocabulary,
  Noor, You.
- The backend is a Next.js API connected through Prisma to PostgreSQL (Neon).
- Production Android builds call `https://api.warsh.app` directly.
- The production web bundle calls same-origin `https://app.warsh.app/api/*`, which
  the `warsh-web` Vercel deployment rewrites to `https://api.warsh.app/api/*` before
  its SPA fallback. This prevents the API hostname's Security Checkpoint from
  breaking browser CORS preflights.
- The public website and legal/help routes deploy through the dedicated Vercel
  `warsh-site` project at `https://warsh.app` and `https://www.warsh.app`.

## Production ownership transfer

- The target production owner and recovery account is `trywarshapp@gmail.com`.
- Production ownership must move from personal accounts to that dedicated account
  across Google Cloud/Google Play, Vercel, Neon, Cloudflare/R2, Resend, Sentry,
  Mixpanel, Expo/EAS, OpenAI, domains/DNS, and every other service that can deploy,
  publish, bill, access production data, or recover access.
- Personal accounts must not remain the sole owner or sole recovery path. They may
  remain named collaborators only where required and approved.
- Transfer completion is not claimed here until each service's owner/admin,
  billing, deployment, OAuth/Play signing, domain/DNS, webhook, environment, and
  recovery access has been independently verified. Never put passwords, tokens, or
  private keys in repository documentation.
- **OpenAI is a deliberate exception (2026-09-10).** There is only one OpenAI
  account for Warsh and the owner confirmed it is the account to use, including in
  production. Its key reports `openai-organization: personal-kpx1ub`. This is not a
  pending transfer item; revisit only if a Warsh-owned OpenAI org is ever created.
- **Google side is consolidated (2026-08-31).** Every Warsh resource now lives in
  Cloud project `warsh-production` (`695435119958`), where both accounts are Owner.
  RTDN was migrated out of the personal `umar-tools-27994` project and nothing
  belonging to Warsh remains there. Direction was forced, not chosen: the Google
  Sign-In OAuth client is owned by `warsh-production`, and an OAuth client cannot
  move between projects without a new client ID that every installed APK would fail
  against.

## Implemented in code

### Core product

- Account registration, login, logout, token refresh, password reset, password
  change, and persisted sessions
- Google sign-in for Android and web, including backend ID-token verification,
  new-account creation, secure password-confirmed linking for matching Warsh
  emails, and English/Urdu entry UI
- Preview/onboarding flow with English and Urdu support
- Chapter listing, lesson listing, backend-enforced locking, placement skipping,
  and progress tracking
- Lesson playback and completion with XP, streak, daily-goal, chapter-bonus, and
  achievement updates
- Chapter final-test flow with prerequisite locking, backend-authoritative grading,
  retry/pass results, and next-chapter unlocking; Chapter 1 is the implemented pilot
- Four lesson templates: `STANDARD`, `SPOKEN_PHRASES`, `REVIEW`, `VERB_PATTERN`
- Renderers for all 15 current exercise types
- Vocabulary browsing, search, word detail, favorites/hidden state, Word of the Day,
  and SM-2-style SRS review
- Tadabbur content and progression screens. The 11 Surahs were restored to
  production on 2026-09-10 with `content:restore-tadabbur`: `TadabburSurah` held
  zero rows, so `/api/tadabbur` returned an empty list with a null `focusSurahId`
  and the Learn tab's Tadabbur card silently stopped rendering. Same cause as the
  vocabulary loss below — `prisma/seed.cjs` deletes `tadabburSurah` early and
  re-seeds at the very end, and `content:restore-curriculum` does not cover it.
  All 68 declared word links now resolve. Seven had been dead since before the
  wipe because the seed spelled the key differently from the column it is looked
  up against — `الرحمن`/`الرحيم` carried the definite article where the rows are
  `رحمن`/`رحيم`, and `اله`/`اذا` dropped the hamza of `إله`/`إذا`. Stripping
  harakat folds neither, so each one silently resolved to null. Keys corrected in
  `prisma/tadabbur-seed.cjs` and the live rows repaired with
  `content:restore-tadabbur -- --relink --apply`, which rewrites `vocabId` on
  existing Surahs and leaves their text, order and publish state untouched.
- Ustaad Noor chat with daily limits and consumable overage credits
- Subscription/paywall, purchase verification, restore flow, and the Google RTDN
  webhook, which has been reached by live notifications since 2026-08-29
- Quranic Core 500 — shipped 2026-09-07, published live 2026-09-10 (all 500 words
  `PUBLISHED`, each with generated audio in R2)
- Vocabulary in production is 920 published words: the Core 500 plus 420 curriculum
  words restored on 2026-09-10. Every one carries generated audio. The curriculum set
  had been absent — `prisma/seed.cjs` calls `vocabularyWord.deleteMany()` before
  re-seeding and re-creates every row with a new id, and all 500 Core rows share a
  single `createdAt` of 2026-09-07 16:51, meaning the table was empty when
  `load-core-500.ts` ran. Recovery path, in order: `content:restore-curriculum`,
  `audio:prebuild-catalog:db`, `images:upload`, `content:publish-vocabulary`,
  `media:prune-orphans`. 582 of the 920 carry an illustration.
- R2 vocabulary media was pruned on 2026-09-10: 3,634 objects stranded by earlier
  seed cycles were deleted, leaving `audio/words/` at exactly 920 reachable objects
  and `images/words/` at 582. Word illustrations are now 768px and under 100 KB.
- Noor was restored on 2026-09-10. It had served only its offline fallback since
  2026-08-11 because production `OPENAI_MODEL` held an id OpenAI answers with
  `400 invalid model ID`. A fallback reply no longer costs the user a daily message
  or a purchased credit — `getAssistantReply` throws instead of returning canned
  text, so `/api/chat` refunds and persists nothing.
- Chapter prefetch: chapters warm images and audio on WiFi, 12 MB cap
- Notifications, Mixpanel analytics, and Sentry integrations
- English and Urdu UI modes with Arabic content retained in Arabic script
- Responsive Expo web shell and production web deployment workflow

### Curriculum and content

- 72 curriculum chapters are represented in the authored fixture set.
- `warsh-backend/prisma/fixtures/` contains 392 JSON lesson fixtures, all referenced
  by the seed assembly.
- The shared lesson contract is implemented in `packages/lesson-schema` and vendored
  into the backend.
- Vocabulary records, Urdu metadata, audio URLs, image fields, and R2 upload/playback
  infrastructure exist.
- Audit exports exist for 585 vocabulary images and 1,203 discover-card word
  appearances.
- The protected Warsh Studio Content Review Desk exposes all 72 chapters and 391
  lessons as complete review documents, including Arabic, English, Urdu, exercises,
  correct-answer data, images, and audio. Review status, notes, and exact
  content-path/media issues are stored separately from learner content.

### Backend and infrastructure

- 68 API route files under `warsh-backend/app/api/`
- 17 Prisma models in the current schema
- JWT sessions with expiry, refresh rotation, and password-version invalidation
- Production-only admin protection and explicit dashboard token support
- Cloudflare R2 integration for audio/images
- Resend password-reset email integration
- Google Play purchase verification and RTDN endpoint
- Cron endpoints for trial expiration and streak reset
- Daily voided-purchase reconciliation (`/api/cron/reconcile-voided-purchases`,
  03:30 UTC, 2026-09-11): replays Google's last seven days of refunds through
  `applyVoidedPurchase` in case the RTDN void was dropped.
- Daily production probe (`/api/cron/production-probe`, 03:00 UTC, 2026-09-11):
  asserts published-word, Core 500, Tadabbur and lesson counts stay above floors,
  HEADs one real R2 media URL, and round-trips a prompt through the real Noor path.
  Any failure emits a Sentry error event tagged `subsystem: probe` and answers 500,
  so Vercel's cron log records a failed run too. Logic lives in
  `lib/productionProbe.ts` and is covered by `tests/production-probe.test.ts`.
- Backend CORS allow-list with stable web origins
- EAS profiles for development, staging APK, production-preview APK, and production
  Android builds

## Active priority queue

### P0 — required verification and open gaps

1. **Refund handling is implemented for both packs and subscriptions, with a
   daily pull-side backstop (2026-09-11).** `lib/voidedPurchase.ts` (2026-08-31)
   already expired a voided subscription and clawed back voided Noor credits on
   the RTDN `voidedPurchaseNotification`; the earlier note that subscriptions
   were unhandled was stale. What remained was the push itself being droppable.
   `/api/cron/reconcile-voided-purchases` (03:30 UTC) now lists the last seven
   days of Google's `purchases.voidedpurchases` and replays each through the
   same idempotent handler; a manual run from the Vercel dashboard authenticated
   against Play and returned `found: 0` (no refunds in the window). Failures raise
   a Sentry error. Not yet exercised with a real refund — the next test-track
   refund should be watched through both paths.
2. **Hard lockout after trial expiry: verified on staging (2026-09-11).** The
   staging account's trial had lapsed naturally on 2026-08-30 with the row still
   `trial`. Against the current backend: `/api/subscription/status` reported
   `expired`, `hasAccess: false`; lesson GET, lesson complete, `/api/chat`,
   `/api/chat/history`, `/api/tadabbur` and `/api/audio/catalog` all returned
   `402 subscription_required` (the gate runs before parameter validation), while
   `/api/vocabulary/words`, `/api/core500`, `/api/vocabulary/word-of-day` and the
   chapter map stayed 200. Running `expire-trials` flipped the row to `expired`
   with identical results, and moving `trialExpiresAt` one hour ahead restored
   access immediately — the window is decided by the timestamp, not the status.
3. **Silent-outage detection is live and verified (2026-09-11).** Three outages
   found by hand on 2026-09-10 (Noor on its offline fallback since 2026-08-11, all
   500 words `DRAFT`, Tadabbur Surahs missing) produced no 5xx, no Sentry event and
   no alert. `/api/cron/production-probe` now checks all three surfaces plus media
   and lesson counts daily and raises a Sentry error on failure. Verified in the
   consoles: the cron is registered in Vercel and a manual Run from the dashboard
   returned 200 in 4.6 s with outbound calls to R2 and OpenAI; Sentry's
   `warsh-backend` project alert "Send a notification for high priority issues"
   emails on every new high-priority issue (last fired 2026-09-05), which an
   error-level probe event creates. Caveat: an identical failure repeating daily
   reuses one issue and emails only on the first day and on regression.
4. **Target-audience decision** — either select adults only for the simplest launch,
   or implement the required age/minor handling before keeping ages 13–17.
5. **Latest-build device QA** — verify `VERB_PATTERN`, `AUDIO_RECOGNITION`,
   `WRITE_ARABIC`, and `HARAKAH_PLACEMENT` on a physical Android device.
6. **Scholar/content review** — establish a review process for Quranic Arabic
   accuracy, ayah relevance, pedagogy, repetition, and pacing.
7. **Register-then-login through the soft keyboard: verified, no mismatch
   (2026-09-11).** The 2026-08-29 suspicion (an account registered via synthetic
   ADB keystrokes later rejecting its password) was retested on the current release
   APK against production with the password entered key by key on Gboard — shift,
   letters and digits, masked field — for both register and login. Registration
   succeeded, `POST /api/auth/login` with the same string returned 200, the app's
   login screen signed in, and a one-character variation returned 401. The earlier
   failure was the synthetic text injection, not the app. QA account deleted.

### P0 — carried over from the retired Play policy and QA audits

These are the items that survived from `warsh-google-play-policy-audit-2026-07-19.md`
and `warsh-qa-issues-2026-07-16.md`. Both documents were retired on 2026-09-09: they
were written to win Production access, which was granted 2026-08-26, and their
remaining checkboxes were either achieved, superseded, or reduced to the list below.

1. **Over-declared Android permissions removed (2026-09-11, not yet shipped).**
   `SYSTEM_ALERT_WINDOW` came only from Warsh's own manifest (an Expo dev-overlay
   leftover); `READ_/WRITE_EXTERNAL_STORAGE` came from ours plus `expo-file-system`
   and `expo-image`. Nothing in the app touches shared storage — the audio cache and
   recordings live in `FileSystem.cacheDirectory`, sharing goes through
   `react-native-view-shot` → cache → `expo-sharing` FileProvider, and there is no
   picker or media library. All three are now stripped with `tools:node="remove"`
   and mirrored in `app.json` `android.blockedPermissions`. Verified on a fresh
   production release build: the merged manifest and `aapt dump permissions` on the
   APK carry none of them; lesson audio played and the share sheet rendered the
   captured card on the emulator with no storage errors. Ships with the next Play
   upload (bump `versionCode`). Mic recording could not be exercised: no lesson in
   the current content uses `SHADOW_REPEAT`, and `SPOKEN_PHRASES` starts at
   Chapter 3 — it records to the same app-private cache dir, so no permission
   dependency exists, but it stays on the physical-device list below.
2. **Play Data safety answers are not proven against runtime behavior.** Determine
   through runtime/network verification whether raw audio ever leaves the device,
   then reconcile the Console form with measured behavior for Name, Voice recording,
   Mixpanel, Sentry, OpenAI, identifiers, and retention. Re-review after every SDK
   change.
3. **Published retention periods are not automatically enforced.**
4. **Account deletion verified end to end on staging (2026-09-11).** A test
   account was given rows in every user-linked table (streak, progress, chat,
   achievements, 361 vocabulary rows, Core 500 set, Surah progress, a
   `StorePurchase`, a `PromoRedemption`, a linked subscription token).
   `DELETE /api/users/me` left zero rows in all nine tables plus the `User` row
   (password-reset fields live on it); the old JWT then returned 401 on every
   protected route, login returned 401, and the email could be re-registered.
   Client: `clearSession` wipes the SecureStore token and AsyncStorage auth blob,
   and the authenticated layout clears the Sentry user and resets Mixpanel when
   the token disappears. The external path `warsh.app/delete-account` is a
   `mailto:support@warsh.app` request and states that deletion does not cancel a
   Play subscription; the in-app confirmation dialog did not — added to `en.ts`
   and `ur.ts` (ships with the next build). Not covered: whether OpenAI, Mixpanel
   or Sentry retain anything server-side after deletion; that is a policy
   disclosure, not a Warsh deletion step.
5. **Physical-device QA never run for:** microphone/speaking exercises, notification
   permission + scheduling + delivery, and Android sharing to a controlled test
   destination.
6. **Android 15/16 and large-screen compatibility.** Resolve edge-to-edge/inset
   warnings (identify whether they originate in Warsh code or Expo/RN dependencies),
   and test tablet, foldable, split screen, landscape, and font/display scaling. The
   fuller plan is `Docs/proposals/android-quality-2027-implementation-plan.md`;
   Play enforcement begins February 2027.
7. **Confirm Play Console privacy and deletion URLs** are `https://warsh.app/privacy`
   and `https://warsh.app/delete-account`. All four public legal routes returned 200
   on 2026-09-09.
8. **Remaining IAP lifecycle gaps:** plan switching and proration/replacement
   behavior, grace period and account hold. Purchase (monthly and yearly), restore
   after reinstall, acknowledgement, the Noor consumable, cancellation, and expiry
   are all verified on a Play-installed build (2026-08-29). Duplicate-token and
   token-owned-by-another-account protection verified 2026-09-11 against the
   staging DB: a subscription token already linked to account A returns
   `409 conflict` for account B (`lastPurchaseToken` is unique) while A's own retry
   is idempotent; a Noor pack token already in `StorePurchase` returns
   `409 purchase_token_in_use` for another account before any Google call; and a
   token Google attributes to a different obfuscated account id is refused with
   `403 purchase_account_mismatch` (unit-tested for both product types). The pack
   route has no unverified opt-in and fails closed (503) without a service key.

### P1 — content quality and launch polish

1. **338 of the 920 published words have no illustration.** Word images were
   restored on 2026-09-10 by re-running `images:upload` against
   `exports/image-tests-compressed`; it matches a source file to a word by
   `transliteration` and covered 582 words. The remaining 338 have no source file at
   all and render without one, and 47 source files match no word. Decide whether the
   gap is filled, and with what.
2. Review representative lessons across Chapters 9–72, emphasizing uncommon exercise
   types and book transitions.
3. Reconcile any remaining visual differences against the current gold/navy design
   tokens.
4. **Streak-commitment screen has no real backend effect (not designed or built).**
   `warsh-app/app/(app)/streak-commitment.tsx` (shown once after first lesson
   completion, via `streak-celebration.tsx`) lets a user pick a 3/7/14/30-day streak
   goal, but the selection is only written to a local AsyncStorage flag
   (`warsh_streak_commitment_set`) and never sent to the backend or read anywhere
   else — it exists only to gate "don't ask again." As of 2026-08-24
   `streak-celebration.tsx` skips straight to the tabs when the user already set a
   daily goal via the onboarding checklist's `warsh_onboarding_goal_set_${userId}`
   flag, but that is a client-only patch. The real fix needs its own plan:
   - A real Prisma field (e.g. `streakGoalDays` on `User`) plus migration, and a
     write path from `streak-commitment.tsx` via `updateUserProfile`.
   - Wiring the committed value into the existing `streakRiskEnabled` notification
     logic (`warsh-app/services/notifications.ts` / settings) so it drives reminder
     copy and urgency.
   - A decision on whether the checklist's daily-goal step (minutes/day) and this
     streak-day-count commitment stay two separate concepts or merge into one
     onboarding commitment moment.
5. **Lesson pass/fail requirement (not designed or built).** Today
   `warsh-app/app/(app)/lessons/[lessonId]/play.tsx` auto-advances past every
   exercise regardless of correctness and `POST /api/lessons/[lessonId]/complete`
   always sends a hardcoded `score: 100`, so a learner can miss every exercise and
   still complete the lesson with full XP/streak/chapter-unlock credit. Requirement:
   missing a minimum number of exercises (proposed threshold: 3 wrong) should force a
   retry. Open decisions:
   - Is the threshold an absolute wrong-count or a percentage, given lessons vary
     from 5 to 15+ exercises?
   - Enforcement must move server-side — the client sends per-exercise results and
     `complete` computes score and pass/fail itself, never trusting a client-sent
     score.
   - On fail: does the chapter stay locked (via `lib/course.ts`), is XP/streak/
     daily-goal credit withheld or still banked for the attempt, and does the learner
     see a retry screen or the normal completion screen?
   - Does the rule apply to every template, or only to answerable exercise types?
     `SHADOW_REPEAT`/`SPOKEN_PHRASES` are recording-completion based
     (`phrasesCompletedRef`), not right/wrong scored, and may need to stay exempt.

### Later

- iOS/App Store release
- Automatic pronunciation scoring
- Persistent Noor memory
- Social profiles, leaderboards, or family accounts

Redis-backed rate limiting is no longer purely deferred: as of 2026-08-26
(`f260be5`), `lib/rateLimit.ts` uses Upstash Redis when `UPSTASH_REDIS_REST_*` are
configured, falling back to the in-process limiter otherwise. Whether
`UPSTASH_REDIS_REST_*` is actually set in production remains unverified.

## Current risks

- **Content risk:** fixture validation proves structure, not scholarly or
  pedagogical correctness.
- **Store risk:** repository code cannot establish current Google Play approval or
  sandbox-product availability.
- **IAP risk:** purchase, restore, acknowledgement, consumable and
  cancellation/expiry are verified end to end on a Play-installed build
  (2026-08-29). What remains is refunded *subscriptions*, which keep entitlement
  until the next lazy refresh. The trial is seven days of full access; Chapter 1
  completion is not a paywall trigger.
- **Config-value risk:** production environment variables are consumed with no
  validation in several places, and a bad value can disable a control silently
  rather than fail loudly. `AI_DAILY_MESSAGE_LIMIT` held a non-numeric value and
  removed the daily Noor cap entirely for every user, undetected, until it was
  exercised on device on 2026-08-29. Only that one variable has been hardened; the
  same bare-`Number()` pattern elsewhere has not been audited. The Noor outage
  found on 2026-09-10 was the same class of fault: production `OPENAI_MODEL` held a
  model id OpenAI answers with `400 invalid model ID`, and because a bad model is
  indistinguishable from a bad key from outside, it read for a month as a key
  problem. Every Vercel production variable is sensitivity-flagged and cannot be
  read back, so a wrong value can only be found by exercising the path.
- **Local-environment risk:** `warsh-backend/.env` `DATABASE_URL` points at the
  **production** Neon database, not a local or staging one. Any command run from
  that directory that writes — `npm run db:seed` above all — writes to production.
  Verify what a script targets before running it.
- **Duplicate-deployment risk:** the personal `umarbinakbarali` Vercel account holds
  a second `warsh` project that builds this same repository with its Cron Jobs
  enabled. It serves no users (Deployment Protection answers 302) but its nightly
  cron runs still reach Sentry, still fail `P1000` on stale database credentials, and
  still check in under the shared `apicronreset-streaks` monitor slug — so the
  canonical job's health is unreadable from that monitor. Confirmed live on
  2026-09-09: all fourteen cron error events over seven days came from that account,
  none from `api.warsh.app`. Production is `warshapp-projects`; treat any alert whose
  `url` tag ends in `-umarbinakbarali.vercel.app` as coming from the duplicate.
- **Deploy-drift risk:** `vercel --prod` ships the working tree, not `git HEAD`, so
  any uncommitted local edit reaches production silently. This happened on
  2026-08-29 with the `lib/openai.ts` fix.
- **Cron reliability risk:** Neon suspends its compute overnight, so the 04:00/05:00
  PKT crons can hit a sleeping database and die with `P1000`. Half of August's
  streak resets never ran.
- **Asset risk:** illustration coverage is 582 of 920 published words (2026-09-10).
  The gap is concentrated in the Core 500 — 179 of 500 — because the artwork was
  drawn for the curriculum vocabulary, and particles like `مِن` and `أَنَّ` have no
  natural illustration.
- **Media-key risk:** `audio/words/{id}` and `images/words/{id}` are keyed by
  `VocabularyWord.id`, which `prisma/seed.cjs` changes on every run. A seed against
  production therefore silently unlinks every word's audio and image even when the
  objects themselves survive, and strands them in R2. 3,634 such objects were pruned
  on 2026-09-10. Re-link with `images:upload` and `audio:prebuild-catalog:db`.
- **Rate-limit risk:** Noor limits rely on database message counting; acceptable at
  current scale but should be measured under load.
- **Secret-exposure risk:** the repo is public, and this has surfaced at least two
  real leaked secrets over the project's history — treat any credential ever
  committed as compromised on discovery, even after the file is untracked.

## Update rule

Keep this document short and current:

1. Record only evidence-backed status.
2. Do not append implementation diaries. A completed item is removed from the queue,
   not narrated — Git history holds the detail.
3. Label external service state as needing live verification when it has not been
   checked in the current work.
4. Update this file in the same change whenever an active priority is completed or
   materially changed.
