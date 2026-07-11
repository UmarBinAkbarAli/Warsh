# Warsh Current Status

**Status:** Active current-state source of truth
**Last verified:** 2026-07-11
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

- `landing/index.html` — live Warsh website landing page
- `Docs/privacy-policy.html` — live privacy-policy page required by Google Play

The landing page currently links to `/privacy`. Preserving the public landing and privacy URLs is a release requirement.

## Current product reality

- Warsh is a Quranic Arabic learning product for Android and web.
- The primary launch platform remains Android through Google Play.
- The Expo application explicitly supports `android` and `web`.
- The mobile application uses four tabs: Learn, Vocabulary, Noor, and You.
- The backend is a Next.js API connected through Prisma to PostgreSQL.
- The production API configuration points to `https://api.warsh.app`.
- The web deployment script targets `https://app.warsh.app`; `https://warsh-web.vercel.app` is also allowed by backend CORS.
- The public landing page and privacy policy are already live; creating them is not an outstanding task.

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

1. **Google Play status** — check the current closed/internal testing status in Play Console. The last repository tracker is stale and cannot prove the present external state.
2. **Live IAP sandbox QA** — verify monthly and yearly subscription purchase, restore, acknowledgement, and Noor consumable behavior on a Play-installed build.
3. **Latest-build device QA** — verify `VERB_PATTERN`, `AUDIO_RECOGNITION`, `WRITE_ARABIC`, and `HARAKAH_PLACEMENT` on a physical Android device.
4. **Paywall QA** — use an expired-trial test account and verify paid lesson, Noor, Tadabbur, product loading, cancellation, restore, and vocabulary-free behavior. Chapter progress must not end a trial early.
5. **Scholar/content review** — establish a review process for Quranic Arabic accuracy, ayah relevance, pedagogy, repetition, and pacing before public launch.
6. **Production security/configuration check** — confirm live secrets, cron configuration, monitoring alerts, and `DEV_UNLOCK_ALL=false` without exposing secret values.

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
