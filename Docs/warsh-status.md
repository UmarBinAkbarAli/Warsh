# Warsh Current Status

**Status:** Active current-state source of truth
**Last verified:** 2026-07-24
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
- The Expo application explicitly supports `android` and `web`.
- The mobile application uses four tabs: Learn, Vocabulary, Noor, and You.
- The backend is a Next.js API connected through Prisma to PostgreSQL.
- Production Android builds call `https://api.warsh.app` directly.
- The production web bundle calls same-origin `https://app.warsh.app/api/*`,
  which the `warsh-web` Vercel deployment rewrites to
  `https://api.warsh.app/api/*` before its SPA fallback. This prevents the API
  hostname's Security Checkpoint from breaking browser CORS preflights.
- The public website and legal/help routes are deployed through the dedicated Vercel `warsh-site` project at `https://warsh.app` and `https://www.warsh.app`.

## Implemented in code

### Core product

- Account registration, login, logout, token refresh, password reset, password change, and persisted sessions
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

### Backend and infrastructure represented in code

- 44 API route files under `warsh-backend/app/api/`
- 12 Prisma models in the current schema
- JWT sessions with expiry, refresh rotation, and password-version invalidation
- Production-only admin protection and explicit dashboard token support
- Cloudflare R2 integration for audio/images
- Resend password-reset email integration
- Google Play purchase verification and RTDN endpoint
- Cron endpoints for trial expiration and streak reset
- Backend CORS allow-list with stable web origins
- EAS profiles for development, staging APK, production-preview APK, and production Android builds

## Recent verified repository changes

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
- Paid lesson retrieval/completion, Noor, Tadabbur, and general lesson TTS now share backend subscription enforcement; Vocabulary remains free.
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

1. **Production-access recovery** — release `7 (1.0.6)` has been submitted to Closed testing - Alpha and is awaiting Play review/automated checks. Once it is available, keep at least 12 real testers continuously opted in for a fresh 14 full days, obtain meaningful feature usage and feedback, ship verified improvements based on that feedback, clear Pre-launch report issues, and reapply with specific evidence. Internal testing does not replace this required closed test.
2. **Live IAP sandbox QA** — verify monthly and yearly subscription purchase, restore, acknowledgement, and Noor consumable behavior on a Play-installed build.
3. **Privacy/Data safety alignment** — publish the corrected static privacy file through Namecheap cPanel, clear the Vercel system challenge and verify all legal/deletion URLs from clean networks, capture a microphone exercise network trace, and update the Play Data safety form so Name, analytics/diagnostics, Noor messages, purchases, identifiers, and local-only voice behavior match the verified inventory.
4. **Target-audience decision** — either select adults only for the simplest launch or implement the required age/minor handling before keeping ages 13–17.
5. **Latest-build device QA** — verify `VERB_PATTERN`, `AUDIO_RECOGNITION`, `WRITE_ARABIC`, and `HARAKAH_PLACEMENT` on a physical Android device.
6. **Paywall QA** — use an expired-trial test account and verify paid lesson, Noor, Tadabbur, product loading, cancellation, restore, and vocabulary-free behavior. Chapter progress must not end a trial early.
7. **Scholar/content review** — establish a review process for Quranic Arabic accuracy, ayah relevance, pedagogy, repetition, and pacing before public launch.
8. **Production security/configuration check** — Sentry runtime delivery, privacy hardening, backend/mobile project mapping, production source-map upload, and symbolication are verified. Sentry is complete; separately confirm the remaining live secrets, cron configuration, monitoring alerts, and `DEV_UNLOCK_ALL=false` without exposing secret values.

### P1 — content quality and launch polish

1. Review representative lessons across Chapters 9-72, emphasizing uncommon exercise types and book transitions.
2. Source and upload priority vocabulary images, beginning with Quranic terms and high-frequency concrete nouns.
3. Populate high-traffic discover-card images, beginning with Chapters 1-10.
4. Verify the live website, privacy policy, terms, support, and account-deletion paths from the production user journey.
5. Reconcile any remaining visual differences against the current gold/navy design tokens.

### Later

- iOS/App Store release
- Automatic pronunciation scoring
- Persistent Noor memory
- Social profiles, leaderboards, or family accounts
- Redis-backed rate limiting unless production load demonstrates the need

## Current risks

- **Content risk:** fixture validation proves structure, not scholarly or pedagogical correctness.
- **Store risk:** repository code cannot establish current Google Play approval or sandbox-product availability.
- **IAP risk:** billing code has changed since the last device report and still requires end-to-end Play-installed verification. The trial is seven days of full access; Chapter 1 completion is not a paywall trigger.
- **Tracker drift risk:** historical documents contain outdated product IDs, platform assumptions, SDK versions, URLs, and completed tasks.
- **Asset risk:** image infrastructure exists, but illustration coverage remains incomplete.
- **Rate-limit risk:** Noor limits rely on database message counting; this is acceptable for current scale but should be measured under load.

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
