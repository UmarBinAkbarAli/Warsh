# Warsh Current Status

**Status:** Active current-state source of truth
**Last verified:** 2026-08-27
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
  2026-08-26 (owner-confirmed in conversation; independently confirmed live in
  Play Console via browser automation on 2026-08-27 — "Warsh · com.warsh.app ·
  Production") — not open/closed testing. It is publicly discoverable and
  installable by anyone. This changelog's historical entries below still
  narrate the closed/open-testing upload history that preceded this; treat
  the release-track state in those entries as historical, not current.
- The Expo application explicitly supports `android` and `web`.
- The mobile application uses four tabs: Learn, Vocabulary, Noor, and You.
- The backend is a Next.js API connected through Prisma to PostgreSQL.
- Production Android builds call `https://api.warsh.app` directly.
- The production web bundle calls same-origin `https://app.warsh.app/api/*`,
  which the `warsh-web` Vercel deployment rewrites to
  `https://api.warsh.app/api/*` before its SPA fallback. This prevents the API
  hostname's Security Checkpoint from breaking browser CORS preflights.
- The public website and legal/help routes are deployed through the dedicated Vercel `warsh-site` project at `https://warsh.app` and `https://www.warsh.app`.

### Noor/OpenAI incident — 2026-08-29

- Live authenticated Noor testing reached the production API successfully. The
  user message was saved and the usage counter changed from `0 of 5` to `1 of
  5`, but no assistant message was created; the UI showed `Unable to send
  message. Try again.` This rules out client connectivity, authentication,
  subscription enforcement, and the database write as the primary failure.
- The failure is in assistant-reply generation. The production OpenAI key is
  configured in Vercel, but its owning OpenAI organization cannot be identified
  from the encrypted Vercel value. The intended funded owner is
  `trywarshapp@gmail.com` / `Personal Organization`, which showed $3.43 API
  credit on the verification date. The local repository key returned OpenAI
  HTTP 401 and must not be promoted.
- Root cause fixed in source: `warsh-backend/lib/openai.ts` now awaits the
  provider promise, allowing the documented local fallback to catch OpenAI
  quota, billing, authentication, model, and outage errors instead of leaking
  a rejected promise into the generic 500-style UI error.
- **That fix is now live and observably working (2026-08-29, later the same
  day).** It had been left uncommitted in the working tree and went to
  production with that day's later deploys (Vercel ships the working directory,
  not `git HEAD`); it is now committed. Confirmed live on device: roughly thirty
  Noor requests across the QA run all returned the graceful
  "I am unavailable at the moment — please try again shortly" fallback, and none
  produced the previous `Unable to send message. Try again.` failure. The
  fallback firing on every request is also independent evidence that the
  provider call is still failing, consistent with the unfunded/incorrect key
  below.
- **New defect found during that run: a failed reply still consumes the user's
  daily Noor allowance.** The request is counted before the provider is called,
  so a user hitting an OpenAI outage or a billing failure burns their whole
  5-message day and receives no answers. Not yet fixed; it needs a decision on
  whether to refund the count on a fallback reply or to not count until a real
  assistant message is produced.
- Remaining production configuration action: an owner must set Vercel
  Production `OPENAI_API_KEY` to a newly created key from the funded official
  OpenAI project, redeploy, and verify one authenticated Noor message returns an
  assistant reply. Never record the secret in Git or this document.
- The live diagnostic message remains in the test account's chat history and
  used one Noor daily allowance; it was not deleted.

## Production ownership transfer

- **RESOLVED 2026-08-31 — the last three payment-module audit findings, fixed and
  deployed.** (a) **Plan changes were invisible to RTDN.** Google issues a NEW purchase
  token whenever a subscription is replaced (upgrade, downgrade, re-subscribe, restore)
  and the old token stops receiving notifications; the webhook looked users up by
  `lastPurchaseToken` only, so every notification for the live subscription missed and
  was dropped until the app happened to verify the new token, while
  `refreshLapsedStoreSubscription` kept polling the dead one. `lib/subscriptionNotification.ts`
  now follows the replacement's `linkedPurchaseToken` back to the superseded row and
  re-keys it onto the live token, so a miss self-heals. (b) **`/api/chat` was the only
  gated route** reading the stored subscription row directly, so a subscriber whose
  renewal notification never arrived got 402 there while every other screen let them in;
  it now refreshes a lapsed period first, as `/api/subscription/status` does. (c)
  **Subscription verification did not bind a purchase to an account**, unlike the
  consumable path beside it. New purchases send an obfuscated account id and the server
  rejects a token Google attributes to a different Warsh account — deliberately asymmetric
  with consumables in that an ABSENT id is accepted, because every subscription bought
  before this change has none and requiring it would lock out existing subscribers.
  **Evidence:** 7 new tests (92/92 backend pass), backend `build` and
  `db:validate-fixtures` green, app `tsc` clean and `lint` at 0 errors; deployed, and a
  synthetic replacement notification published to the live topic produced
  `[rtdn] snapshot fetch failed while resolving user: Google Play rejected the purchase
  token` — a string that exists only in the new resolver, proving the re-key path is live.
  **Client half pending a release:** the obfuscated account id is only sent by builds
  containing this change, so it takes effect for new Android purchases on the next APK/AAB.

- **RESOLVED 2026-08-31 — three ways a paid Noor message went missing, fixed and
  deployed.** (a) The pack credit was debited *before* the OpenAI call, so a failed
  or timed-out reply burned a message the user had paid for with no refund path; the
  claim is now returned when the reply fails, and the user's message is persisted only
  on success so a failure no longer consumes a daily quota slot either. (b) The balance
  was read and then decremented unconditionally — two concurrent sends against a balance
  of 1 both saw 1, both decremented, and the balance went to -1 permanently, making the
  next purchased pack worth one message less than it cost; the `gt: 0` guard now lives in
  the WHERE clause (`lib/noorCredits.ts`) so the claim is the check. (c) Google's
  `voidedPurchaseNotification` was never consumed, so a refunded Noor pack returned the
  money and kept the credits; `lib/voidedPurchase.ts` now claws them back, idempotently on
  `StorePurchase.voidedAt` (Play redelivers until acked), floored at zero, with partial
  refunds surfaced for review and voided subscriptions revoked. **Evidence:** 10 new unit
  tests covering the race, the refund-on-failure, double-delivery, the zero floor and the
  partial-refund hold (85/85 backend tests pass); migration
  `20260831120000_add_store_purchase_voided_at` applied to production *before* deploy; and a
  synthetic voided-purchase notification published to the live topic produced
  `[rtdn] notification type: voided_purchase` / `voided purchase does not match any recorded
  purchase` with `num_undelivered_messages` flat at 0 — proving the new branch is live, the
  new column exists in the database production actually uses, and the push was acked 200
  rather than retried.

- **RESOLVED 2026-08-31 — RTDN consolidated into `warsh-production`; the Google
  side is now a single project.** RTDN had been built in `umar-tools-27994`
  ("Umar Tools", project number 269972336658), a personal project whose only human
  principal was `umarakbar73456@gmail.com` as Owner — `trywarshapp@gmail.com` had
  no access to it whatsoever, so a personal account was the sole recovery path for
  every renewal, cancellation, refund and revocation notification. Verified live in
  IAM. Purchase verification meanwhile ran from `warsh-production` (695435119958),
  where BOTH accounts are already Owner. **Direction was forced, not chosen:** the
  Google Sign-In OAuth client is `695435119958-...`, i.e. owned by
  `warsh-production`, and an OAuth client cannot be moved between projects without
  issuing a new client ID that every installed APK would fail against.
  **Migration:** created topic `projects/warsh-production/topics/warsh-play-notifications`,
  granted `google-play-developer-notifications@system.gserviceaccount.com` the
  `pubsub.publisher` role on it, created key-less SA
  `warsh-rtdn-push@warsh-production.iam.gserviceaccount.com` with
  `serviceAccountTokenCreator` for the Pub/Sub service agent, and created push
  subscription `warsh-play-notifications-push` with the same four load-bearing
  settings as before (never expire, ack 60s, retry 10-600s, wrapper on) — all
  confirmed by `gcloud pubsub subscriptions describe`. To avoid a delivery gap the
  handler was first changed (`344475c`) to accept a comma-separated
  `GOOGLE_PLAY_PUBSUB_SERVICE_ACCOUNT`, mirroring `GOOGLE_OAUTH_CLIENT_IDS`, so both
  identities were valid across the cutover. **Evidence, three stages:** (a) a message
  published by hand to the new topic before Play was repointed produced
  `[rtdn] received message id: 21526047340766042`, proving the new
  topic->subscription->OIDC->handler chain independently; (b) after the Play Console
  topic was repointed, Play's own "Send test notification" produced
  `[rtdn] received message id: 21434977043674052`, proving the Play->topic half;
  (c) after the old identity was dropped from the env and production redeployed, a
  third test produced `[rtdn] received message id: 21628496291447995`, proving the
  final single-identity steady state. **Cleanup:** the old subscription was confirmed
  at `num_undelivered_messages: 0` via the Monitoring API before removal; the old
  subscription, topic and service account in `umar-tools-27994` are deleted. Nothing
  belonging to Warsh remains in that project.

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
- Chapter final-test flow with prerequisite locking, backend-authoritative
  grading, retry/pass results, and next-chapter unlocking; Chapter 1 is the
  implemented pilot
- Four lesson templates: `STANDARD`, `SPOKEN_PHRASES`, `REVIEW`, and `VERB_PATTERN`
- Renderers for all 15 current exercise types
- Vocabulary browsing, search, word detail, favorites/hidden state, Word of the Day, and SM-2-style SRS review
- Tadabbur content and progression screens
- Ustaad Noor chat with daily limits and consumable overage credits
- Subscription/paywall, purchase verification, restore flow, and Google RTDN webhook code (the webhook is now actually *reached*: a Pub/Sub push subscription was created 2026-08-29; before that the code existed but no notification had ever been delivered)
- Notifications, Mixpanel analytics, and Sentry integrations
- English and Urdu UI modes with Arabic content retained in Arabic script
- Responsive Expo web shell and production web deployment workflow

### Curriculum and content

- 72 curriculum chapters are represented in the authored fixture set.
- `warsh-backend/prisma/fixtures/` contains 392 JSON lesson fixtures, and all 392 are referenced by the seed assembly.
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

### 2026-09-01 (warsh.app SEO remediation, part 4)

Deployed and verified live.

- **Physical address published as "Karachi, Pakistan"** — owner's choice, city
  and country only. Rendered in the footer imprint as an hCard `adr` and as
  `PostalAddress{addressLocality, addressCountry}` on the Organization schema.
  It matches what the Facebook page already states, so the two agree. No street
  line was invented to satisfy the audit.
- **`/about` gained a closing "The record" section** — Our Story, Who We Are,
  What We Do, What You Can Rely On. Added *beneath* the typographic poster
  rather than replacing it: the poster acts make the argument, this section is
  the part a reader checks. Clears four of the About Us checks plus "Trusted
  Source Statement" without dismantling the page's design. Every claim is
  sourced from `content/faq.tsx` or `warsh-backend/lib/openai.ts`.
- **DMCA badge** — skipped, confirmed by the owner.

**Still open:**

- **Authors/Team page — not built.** This was named in the first triage, then
  silently dropped when the seven-item batch-2 plan was written, and the gap
  was only caught on a later verification pass. `/team` 404s. It needs real
  names, roles, and in particular who reviews the Arabic; for a Quranic Arabic
  product this is the page where invented content would be worst.
- **Twitter/X, YouTube, TikTok** — the owner says these accounts exist but has
  not supplied URLs. `SOCIAL_LINKS` in `content/site.ts` takes them in one edit
  and they flow to both the footer and Organization `sameAs`.
- **Social proof** — the owner twice asked for invented reviews. Declined both
  times: publishing fabricated testimonials as genuine Google Play feedback is
  deceptive and a Play policy risk. The real listing shows **10+ downloads and
  no ratings-and-reviews section at all**. The "Trusted Source Statement" need
  is met instead by the factual "What you can rely on" block on `/about`.

### 2026-09-01 (warsh.app SEO audit remediation, part 3 — close-out)

Commit `bea7feb`, deployed and verified live.

- `/editorial-guidelines` published, clearing the last EEAT Pages check. The
  owner approved publishing it as-is after the accuracy concern was raised.
  The Ustaad Noor section is taken from the guardrails actually enforced in
  `warsh-backend/lib/openai.ts`, so it describes real behaviour rather than
  aspiration. One sentence from the reviewed design was deliberately dropped:
  "a lesson does not ship until that check is recorded" described an internal
  control that was invented during drafting and never confirmed. If a recorded
  review gate does exist, that stronger wording can go back in.
- Registered in `content/routes.ts`, so it reaches `sitemap.xml`, `/sitemap`,
  `robots.txt` and the footer from the one route table. sitemap.xml now carries
  15 URLs.

**Social proof (audit item "Social Proof Displayed") is closed as not
actionable.** The owner asked for invented reviews; that was declined, and the
real Play Store listing was checked instead: `com.warsh.app` currently shows
**10+ downloads and no ratings-and-reviews section at all** — there are zero
reviews to display. Nothing was built. Revisit once real reviews exist; the
design for the section is in the review artifact and can be filled in then.
Note the mockup's placeholder figures (4.8, "1,000+ installs") were never real
and bear no relation to the actual listing.

### 2026-09-01 (warsh.app SEO audit remediation, part 2)

Commit `f550fee`, deployed to the `warsh-site` Vercel project and verified
against live `https://warsh.app` through a browser (see the note on the Vercel
challenge below).

**Shipped and verified live:**

- `/contact` — three routes (product support, content corrections, account and
  data), each with what to include and its response time, plus the "who we are"
  section. Carries `ContactPage` schema using schema.org's controlled
  `contactType` vocabulary.
- `/sitemap` — the HTML sitemap. `content/routes.ts` is now the single route
  table behind both it and `sitemap.xml`, so the human- and machine-readable
  sitemaps cannot drift.
- Client-side search over the blog and the 19 help answers, on `/blog` and
  `/help`, grouped by source. No index, no third-party service, no network call
  (the CSP allows `connect-src` to nothing but the Warsh API). The FAQ moved to
  `content/faq.tsx` so `/blog` can index it without importing a route module.
- `SearchAction` added to the WebSite node, held back deliberately in `578a90c`
  until a search route existed. It targets `/help?q=` and `SiteSearch` reads
  that param, so the sitelinks-searchbox URL genuinely searches.
- Back-to-top button, appearing after one viewport and retiring over the footer.
- Footer social row, plus Organization `sameAs` and `telephone`.

**Business values supplied by the owner and verified before publishing:**

- Phone `+92 318 104 6756`, published on `/contact` and as Organization
  `telephone`.
- Instagram `warsh.app`, Facebook `trywarshapp`, LinkedIn `warshapp`. All three
  were opened in a browser and confirmed live and owned before being linked.
  **Two are empty** (Instagram 0 posts, LinkedIn 0 posts) and the Instagram bio
  says "learn Arabic through playful acts", which contradicts the site's
  positioning; Facebook lists `info@warsh.app` where the site uses
  `support@warsh.app`. Google reads `sameAs` profiles for entity consistency, so
  both are worth correcting on the profiles themselves.

**Two bugs found by observing the running page, not by reading the code:**

- The back-to-top button originally read the footer's
  `data-warsh-footer-in-view` attribute. That attribute never reached the
  component and the disc sat on the colophon at full scroll — navy on navy, so
  only a floating arrow showed. It now measures the footer's own rect.
- `scrollTo` used `behavior: 'auto'` as its fallback. `'auto'` does not mean
  "jump"; it means "defer to CSS", and `globals.css` sets
  `scroll-behavior: smooth` on `html`. On a browser with smooth scrolling
  disabled the control was completely dead. Now `'instant'`, with a 120 ms
  guard that jumps if the smooth scroll never starts.

**Still outstanding (not built, awaiting the owner):**

- `/editorial-guidelines` — drafted and designed, but it describes a review
  process ("reviewed before publication", "a lesson does not ship until that
  check is recorded") that has not been confirmed against what the curriculum
  team actually does. It is a public commitment about religious content and must
  not ship unverified.
- Play Store social proof — needs the real rating and three to five real
  reviews. No invented figures.

**Environment note:** `api.warsh.app` and `warsh.app` both served Vercel's
Security Checkpoint 403 to this machine's IP throughout this work, which makes
`curl` verification useless and caused a local build to prerender an empty blog
search index. It is per-IP and self-clearing; a real browser passes the
challenge, and production was unaffected. See [[vercel-transient-challenge-403]].

### 2026-09-01 (warsh.app SEO audit remediation, part 1)

Commits `578a90c`, `1338acb`. Both deployed to the `warsh-site` Vercel project
and verified against live `https://warsh.app`.

An external SEO scan of warsh.app returned ~30 failed checks. This is the first
of two batches: everything with no design surface, so it did not need the
Pen-first gate in `AGENTS.md`. The remaining items are new pages and UI
components (Contact, Editorial Guidelines, HTML sitemap, blog search,
back-to-top, footer social row, social proof) and are awaiting a Pen design.

**Shipped and verified live:**

- `www.warsh.app` now 308-redirects to the apex. Vercel served both hosts from
  the same deployment, so every page returned 200 with byte-identical HTML on
  two indexable origins while the canonical tag claimed only one.
- `/index.php`, `/index.html`, `/index.htm` redirect to `/` instead of
  returning Vercel's 403 to crawler probes.
- The lone `Organization` JSON-LD block is now an `@graph` with `Organization`,
  `WebSite` and `SiteNavigationElement` cross-referenced by `@id`.
- `FAQPage` markup on `/help`, 19 questions, generated from the same `sections`
  array the page renders so markup and page cannot diverge.
- A default social card at `/opengraph-image`, generated via `ImageResponse`
  from the site's own palette and fonts. The site previously declared
  `twitter:card: summary_large_image` and `og:title` but shipped **no image**,
  so every share rendered as a bare text row. Not flagged by the audit.
- `/favicon.ico` and `/apple-icon.png`, both previously 404.
- RSS feed at `/blog/rss.xml` off the Studio blog API, with autodiscovery.

**Deliberately not done:**

- No `SearchAction` on the `WebSite` node until a search route exists to answer
  it; claiming a sitelinks searchbox that 404s is worse than claiming none.
- `SOCIAL_LINKS` in `content/site.ts` is the single source for both the footer
  row and `sameAs`, and is intentionally **empty** — a dead social link is a
  worse trust signal than an absent one. Awaiting real profile URLs.
- The audit's "About Us Page 0 of 9" is not being treated as a defect. `/about`
  is a deliberate typographic poster (rationale in `app/about/page.tsx`), and
  the scanner's about-page detector simply failed to recognise it; the page
  returns 200 with 367 words. The `Our Story / Who We Are / What We Do` content
  the checklist wants is planned for the new Contact page instead.
- The audit's "2 broken images found" is a false positive: the crawler read the
  `&amp;`-escaped `/_next/image?...&amp;w=96` URLs literally, which 400s. Both
  images return 200 in a browser.

**Gotcha recorded:** `metadata.alternates.types` in the root layout emitted
nothing, because Next replaces the whole `alternates` object per route rather
than merging into it, and every page here sets its own `canonical`. The RSS
`<link>` is rendered directly into `<head>` instead. Fixed in `1338acb`.

### 2026-08-29 (RTDN delivery, Noor pack, IAP lifecycle close-out)

Commits `277476a`, `8c715bb`, `0fdb0a0`, `3d1cbdb`, plus one infrastructure
change in the owner's Google Cloud project and three Vercel production
environment changes. Full detail and evidence live under P0-1; this is the
index of what changed.

**Infrastructure (Google Cloud project `umar-tools-27994`):**

- Created push subscription `warsh-play-notifications-push` on topic
  `warsh-play-notifications`, delivering to
  `https://api.warsh.app/api/webhooks/google`. The topic previously had **no
  subscription at all**, so no Real-Time Developer Notification had ever been
  delivered since launch.
- Created the key-less service account `warsh-rtdn-push@umar-tools-27994.iam.gserviceaccount.com`
  as the OIDC push identity, rather than reusing the existing
  `firebase-adminsdk` account; the console granted
  `roles/iam.serviceAccountTokenCreator` on it to the Pub/Sub service agent.

**Vercel production environment:**

- Added `GOOGLE_PLAY_PUBSUB_AUDIENCE` and `GOOGLE_PLAY_PUBSUB_SERVICE_ACCOUNT`,
  switching the webhook from the `?token=` shared secret to OIDC (the mode the
  handler already preferred). `GOOGLE_PLAY_NOTIFICATION_WEBHOOK_SECRET` is
  retained but now unused.
- Reset `AI_DAILY_MESSAGE_LIMIT` to `5`. It held a non-numeric value; see the
  fix below and the exception recorded in the technical spec.

**Code:**

- `feat(admin)` `277476a` — `GET /api/admin/play-diagnostics?...&refresh=1`
  applies the same lapsed-subscription refresh the app triggers, so a stale row
  can be healed from support/QA without waiting for the user to open the app.
  Read-only without the flag. (This was written in the previous session but had
  been left uncommitted in the working tree.)
- `fix(iap)` `8c715bb` — Noor pack purchases are now consumed server-side via
  `purchases.products:consume`, after the ledger row and balance commit and
  never before. The already-granted and raced paths retry the consume.
- `fix(noor)` `0fdb0a0` — new `warsh-backend/lib/noorLimit.ts`; both chat routes
  now resolve the daily cap through it and fail closed on the documented default
  of 5 instead of evaluating to `NaN`.
- `docs` `3d1cbdb` — this file and the technical spec.

**Deployed and verified live on production**, not inferred: RTDN delivery
confirmed three independent ways, the daily cap confirmed enforcing at `429`,
and the Noor consumable and cancellation/expiry paths confirmed on device.

### 2026-08-27 (Chapter 1 final test pilot)

- Implemented the approved Chapter 1 final test as a separate fifth card after
  the four teaching lessons. The chapter lesson progress remains `4/4`; the test
  shows 12 questions and requires 10 correct answers (80%) to pass.
- The test assesses only `هَذَا`, `ذَٰلِكَ`, `هَذِهِ`, `تِلْكَ`, vocabulary and
  gender already taught in Lessons 1-4, plus their reviewed Quranic phrases.
  It introduces no new grammar or vocabulary.
- The backend locks the test until all four regular lessons are complete,
  validates one answer per question, calculates the score itself, records failed
  attempts without rewards, and awards lesson/chapter XP and unlocks Chapter 2
  only after a pass.
- Verified with the isolated staging database and Android development emulator:
  locked/unlocked test card, intro, question, 3/12 retry, and 12/12 pass screens;
  the passing response awarded the 50 XP chapter bonus and returned Chapter 2
  as the next unlocked chapter.
- Fixed ambiguous mobile submission failures: when the completion request times
  out after the backend has already saved a pass, the app now polls the lesson's
  server-authoritative completion state and shows a confirmed successful result
  instead of the generic submission error. Recovery is read-only, so it cannot
  duplicate XP or chapter rewards.
- Verification passed: 392 fixture validations, Quran audit of 775 entries with
  zero reference/text failures, 58 backend tests, backend production build,
  app TypeScript, and app lint. This is staged locally only; it has not been
  deployed to production.

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

1. **Live IAP sandbox QA — substantially CLEARED 2026-08-29.** Monthly, yearly, restore/re-entitlement after reinstall, acknowledgement, the Noor consumable path (including the crash window), and cancellation/expiry are all verified on a Play-installed build against production, each confirmed against live Google data rather than read off the phone. Real-Time Developer Notifications now reach the backend for the first time since launch. What is left has been split out as items 2 and 3 below: refund/voided-purchase handling, and hard lockout once the trial window also closes. The server-side verification blocker that previously made any of this impossible is fixed.
   - **Partially cleared 2026-08-29 — a real Play purchase now verifies end to end.** Owner completed a purchase from a license-tester account on a Play-installed build and the app accepted it. Independently confirmed live against production, not taken on report: `GET /api/admin/play-diagnostics` returns `healthy: true` (`packageName com.warsh.app`, `trimmedLength 13`, OAuth ok, `applicationResolves.ok true` with a token-specific `400 invalid` for the probe token), and `GET /api/admin/users?status=active` shows exactly one active subscriber — `saad@umarbinakbarali.com`, `subscriptionStatus active`, `subscriptionActiveUntil 2026-08-29T07:28:56Z`, i.e. a ~5-minute entitlement window, which is Google's accelerated **monthly** license-test duration. That proves the whole chain: Play purchase → `POST /api/subscription/verify` → Google `subscriptionsv2` accepted the real token → user row flipped to `active`. **Still unverified _at that point in the day_ (all five were cleared later on 2026-08-29; kept for history):** the yearly base plan, restore/re-entitlement on reinstall, acknowledgement behavior, the Noor consumable path, and expiry/downgrade when the accelerated test window lapses. No real charge is required: add the test Gmail account under Play Console → Monetize setup → License testing, sign into that account on the test device, and purchases against the (now-production) listing are served as no-charge test transactions with accelerated renewal/expiry for testing that behavior too.
   - **2026-08-29 — three further faults found and fixed while working P0-1 (commits `c879c37`, `35db241`).** All three were found in live Google data, not in review, and all are deployed to production:
     1. **The stored base plan was always `warsh_premium`.** `subscriptionsv2` `lineItems[].productId` is the SUBSCRIPTION id; the purchased plan is `lineItems[].offerDetails.basePlanId`. Because the wrong field was read, the paywall's monthly/yearly comparison never matched, so it could not mark a subscriber's current plan and offered "Subscribe" to people who already had a subscription instead of the upgrade/downgrade flow. Now verified live: the tester's subscription reports `basePlanId: yearly`.
     2. **Acknowledgement was client-only.** The app called `finishTransaction` after verification; any kill, crash or dropped connection in between left the purchase unacknowledged, and Google refunds and revokes an unacknowledged subscription after three days while our row still said active. The server now acknowledges during verification (`purchases.subscriptions:acknowledge`), reports `acknowledged` on the verify response, and the paywall no longer reports a failed acknowledgement as a failed verification — a path that told users with a working subscription that we "couldn't confirm" it.
     3. **Renewals were never reaching us.** Observed live: Google reported the subscription active until 08:08 while our row had expired at 07:38 — a paying subscriber locked out of an app still billing them. `refreshLapsedStoreSubscription` now treats the stored expiry as a cache: when a user holds a purchase token, still claims entitlement, and the stored period has elapsed, the store is re-read and persisted, through both `/api/subscription/status` and the shared access gate. Verified live: a stale row healed from `07:38:59 / warsh_premium` to `08:08:59 / yearly`, matching Google exactly. A silent re-entitlement was also added to the paywall so a reinstalled user's existing purchase is re-linked (and acknowledged) without having to find the "Restore purchases" button.
   - **RESOLVED 2026-08-29 — ROOT CAUSE of that third fault: Real-Time Developer Notifications had never been delivered, and now are.** Play Console → Monetization setup had RTDN enabled against topic `projects/umar-tools-27994/topics/warsh-play-notifications`, but the Pub/Sub Subscriptions list for project `umar-tools-27994` was **empty** — the topic had no subscription at all, so nothing had ever been pushed to `/api/webhooks/google`. Every renewal, cancellation, refund and revocation notification since launch was published and dropped. **Fix (applied in the owner's Google Cloud project):** created push subscription `projects/umar-tools-27994/subscriptions/warsh-play-notifications-push` → `https://api.warsh.app/api/webhooks/google`, authenticated with **OIDC** (the mode the handler already prefers over the `?token=` shared secret, which put a secret in the Pub/Sub config and proxy logs). A dedicated, key-less service account `warsh-rtdn-push@umar-tools-27994.iam.gserviceaccount.com` was created for the push identity rather than reusing the existing `firebase-adminsdk` account, and the console granted `roles/iam.serviceAccountTokenCreator` on it to the Pub/Sub service agent. Vercel production now carries `GOOGLE_PLAY_PUBSUB_AUDIENCE=https://api.warsh.app/api/webhooks/google` and `GOOGLE_PLAY_PUBSUB_SERVICE_ACCOUNT=warsh-rtdn-push@umar-tools-27994.iam.gserviceaccount.com`. Two non-obvious defaults were changed at creation: **expiration set to "never expire"** (the 31-day-inactivity default would have silently deleted the subscription during any quiet month and recreated this exact bug), and retry set to exponential backoff (10–600s) so a transient Vercel failure does not hard-drop a notification; payload unwrapping was deliberately left OFF because the handler expects the Pub/Sub envelope, and the ack deadline was raised 10s → 60s since the handler calls Google and writes to the DB before answering. **Evidence, three independent ways:** (a) a message published by hand to the topic produced `[rtdn] received message id: 21478669124196402` / `notification type: subscription` with HTTP 200; (b) Play Console's own **"Send test notification"** produced `[rtdn] received message id: 21603114672905291` / `notification type: unknown` (correct — Play's `testNotification` payload carries neither `subscriptionNotification` nor `oneTimeProductNotification`), proving the Play → topic half; (c) a **real** cancellation of the live test subscription flipped the stored row from `active` to `canceled` at a moment when `refreshLapsedStoreSubscription` provably could not have run — it returns early while `subscriptionActiveUntil` is still in the future, and the period had 6 minutes left — so only the webhook could have written it. Google's own Pub/Sub metrics for the subscription show `push_request_count` with a single series, **`ack_200`**, and `oldest_unacked_message_age: 0`: every push is being delivered and accepted.
   - **Device QA run 2026-08-29 (emulator `Warsh_API_34`, release APK built from `35db241`, license-tester account `trywarshapp@gmail.com`, production API).** Every result was confirmed against Google via `play-diagnostics`, not read off the phone:
     - **Yearly base plan — PASS.** Google's own sheet showed "Rs 2,800/30 min" with "Test card, always approves" (30 minutes is the accelerated yearly test period; monthly is 5). After verification the row read `plan=yearly` and Google `basePlanId=yearly`, and the paywall rendered the yearly card as **"Current plan"** — the UI behaviour the `offerDetails.basePlanId` fix restored, which was impossible while every subscriber's stored plan was `warsh_premium`.
     - **Acknowledgement — PASS, and tested the hard way.** The Play billing connection was killed between "Payment successful" and the app receiving the purchase, so the app's own `finishTransaction` never ran and the app showed "Purchase failed (service-error)" for a payment Google had taken. Google nevertheless reported `ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED` once the purchase was verified: the server-side acknowledgement carried it alone. Under the old client-only code this purchase would have been auto-refunded and revoked after three days.
     - **Restore / re-entitlement after reinstall — PASS.** The app was uninstalled and reinstalled, and a *different*, brand-new Warsh account (with no purchase token, no history, and Google's purchase linked to nothing after the first account was deleted) was signed in. Opening the paywall silently found the owned purchase, verified it, acknowledged it and linked it — "Subscription restored", with no "Restore purchases" tap. The same token digest `1f1392d7deec` then appeared on the new account with `active / yearly / 09:02:12Z`, matching Google exactly.
     - Test accounts `warsh-iap-qa@example.com` and `warsh-iap-qa2@example.com` were deleted afterwards (user total back to 47). The test subscription remains on the tester's Google account and expires by itself after Google's test-renewal limit; it is a no-charge test purchase.
   - **Unresolved side observation from that run:** an account registered through the app's own register screen (driven by synthetic ADB keystrokes) afterwards rejected the password that was typed into it, while an account created through `POST /api/auth/register` signed in normally on the same build. `register.tsx` and `login.tsx` both send the raw, untrimmed password, so nothing in the code explains a mismatch and the likely culprit is synthetic text entry into a `secureTextEntry` field. It was NOT proven either way — worth one manual register-then-login check typed by hand before launch, since a real mismatch here would lock out every new signup.
   - **2026-08-29 (second session) — two further faults found and fixed while clearing the last two P0-1 items (commits `277476a`, and the two below). Both were found by exercising the real path on device, not by review, and both are deployed.**
     1. **The daily Noor message cap did not exist in production, and that is what had made the Noor pack untestable.** Both chat routes computed the cap as `Number(process.env.AI_DAILY_MESSAGE_LIMIT ?? 5)`. Production held a non-numeric value, so the cap was `NaN` — and every comparison against `NaN` is false, so `messagesUsedToday >= DAILY_MESSAGE_LIMIT` never fired. Observed live on a fresh trial account against `api.warsh.app`: messages 6, 7 and 8 all returned `200` with `messagesLimit: null` (`NaN` serializes to `null`), and the app rendered **"6 of null messages used today"** immediately after rendering "5 of 5 messages used today". Two consequences: every Noor message was billed to us with no ceiling, for every user, since the value was set; and the Noor pack was **unsellable**, because the overage modal is only reached from the `429` the cap raises — which is precisely why the consumable path had stayed untested. `lib/noorLimit.ts` now fails closed on the documented default of 5 when the value is missing, non-numeric, infinite or negative, and logs that it did; the production env var was also reset to `5`. Verified live afterwards: the 9th message returned `429 daily_limit_reached` and `/api/chat/history` reported `limit 5`.
     2. **Noor pack purchases were never consumed server-side — the same fault the subscription path had before `c879c37`.** `verifyGooglePlayConsumable` verified the purchase but never called `purchases.products:consume`; consumption was left entirely to the client's `finishTransaction`. For a consumable this is worse than for a subscription: the buyer keeps the 20 granted messages, Google auto-refunds the unacknowledged purchase after three days, and because an unconsumed one-time product stays *owned*, Play refuses to sell that account another pack — permanently. The server now consumes once the ledger row and the balance are committed, never before (consuming first would release the entitlement for a purchase we might then fail to record, leaving the buyer with neither the money nor the messages), and the already-granted and raced paths retry the consume so a purchase Play keeps redelivering heals itself.
   - **Device QA run 2026-08-29 (second session; same emulator `Warsh_API_34` and release APK, license-tester account `trywarshapp@gmail.com`, production API). This clears both remaining P0-1 items.**
     - **Noor consumable path — PASS, including the crash window.** With the cap fixed, the overage modal appeared for the first time in production and rendered the real Play price ("Rs 280 for 20 messages"); Google's sheet showed "Test card, always approves" / "This is a test order, you will not be charged". After purchase the app reported "20 messages added!" and the server reported `noorOverageBalance: 20`. Draining the balance through real chat calls consumed **exactly** 20 credits, one per message, then returned `429`. **Server-side consume proven twice over:** first, Play offered "1-tap buy" for a *second* pack rather than "you already own this item", which is only possible if the first purchase was consumed; second, on that second purchase the app was force-stopped during `finishTransaction` (logcat shows `finishTransaction payload` at 14:51:33.531 with **no** `finishTransaction result` line), and the credits were still granted **and** the purchase still consumed — proven because relaunching produced no `purchaseUpdatedListener` redelivery, i.e. Play held no owned, unconsumed product. Under the old client-only code that purchase would have been auto-refunded after three days and would have blocked the account from ever buying another pack.
     - **Cancellation and expiry / downgrade — PASS, observed live across the boundary.** The paywall first re-linked the previous session's yearly test subscription to a brand-new account on its own ("Subscription restored"), independently re-confirming the restore path. The subscription was then cancelled in the Play Store. `/api/subscription/status` immediately reported `canceled` / `willCancel: true` / `subscriptionActive: true` / `hasAccess: true` — auto-renew off but access retained to the end of the paid period, which is correct. Polling across the expiry instant (Google's `10:02:12Z`, matching our stored `subscriptionActiveUntil` exactly): at `10:01:54Z` still `canceled / subActive true`; at `10:02:40Z` `storeState: expired`, `subscriptionActive: false`, `trialActive: true`, reported status `trial`, `hasAccess: true`. That is the specified behaviour — a lapsed purchase falls back to the remaining trial window rather than locking the user out, per "seven full days of access that nothing cuts short early".
     - Test account `warsh-noor-qa@example.com` was deleted afterwards. The test subscription is now cancelled and expired, so nothing is left running on the tester's Google account.
   - **Known gaps still open after that run (neither is a regression; both are pre-existing):**
     - **Hard lockout after the trial ALSO closes was not exercised.** It is the same `getSubscriptionState` branch with `trialWindowOpen` false, but it cannot be reached on an account whose 7-day trial started the same day, and there is no supported way to backdate `trialExpiresAt` in production. Worth one check against a staging account with an already-expired trial.
     - **Refunds and voided purchases are not clawed back.** The RTDN handler parses `subscriptionNotification` and `oneTimeProductNotification` but not `voidedPurchaseNotification`, and `handleOneTimeProductNotification` is deliberately a no-op. A refunded Noor pack therefore keeps its granted messages. Play Console's "Notification content" is set to "Subscriptions and voided purchases only", which *does* include voided one-time products, so the notifications will now arrive — nothing consumes them yet. Designing this needs a decision on what to do when the credits are already spent (negative balance vs. floor at zero).
     - **Noor's OpenAI fallback still consumes the user's daily quota.** Throughout this run every reply was the "I am unavailable at the moment" fallback, yet each request still counted against the 5/day cap. A user hitting an OpenAI outage burns their whole day's allowance for no answers. Not investigated further; the fallback itself may have its own cause worth checking.
   - **QA tooling added:** `GET /api/admin/play-diagnostics?email=<user>` reports what Google says about that user's token right now — base plan, expiry, state, acknowledgement, superseded token — beside what the database believes; `&refresh=1` applies the same lapsed-subscription refresh the app triggers. Purchase tokens are only ever returned as digests.
   - **Play Console change 2026-08-29 (approved by the owner):** `trywarshapp@gmail.com`, the Google account signed into the `Warsh_API_34` emulator, was added to the "License Testers" email list (now 2 addresses, alongside `umarakbar73456@gmail.com`) so device QA runs as no-charge test purchases. The "Early Testers" list (42 addresses) is still NOT selected for license testing.
2. **Refund / voided-purchase handling is not implemented.** The RTDN handler parses `subscriptionNotification` and `oneTimeProductNotification` but not `voidedPurchaseNotification`, and `handleOneTimeProductNotification` is deliberately a no-op. A refunded subscription keeps access until the stored period lapses and the lazy refresh notices; a refunded Noor pack keeps its 20 granted messages permanently. Play Console's "Notification content" is set to "Subscriptions and voided purchases only", which *does* include voided one-time products, so these notifications now arrive and are simply not consumed. Needs a decision before it can be built: when the refunded credits are already spent, does the balance go negative or floor at zero? `SUBSCRIPTION_REVOKED` (type 12) is already handled and cuts access immediately.
3. **Hard lockout after the trial window also closes has not been exercised.** Cancellation and expiry are verified, but the tested account fell back to its still-open 7-day trial, which is the specified behaviour. The genuine no-access branch is the same `getSubscriptionState` path with `trialWindowOpen` false; it cannot be reached on an account whose trial started the same day, and there is no supported way to backdate `trialExpiresAt` in production. Check it against a staging account with an already-expired trial.
4. **A failed Noor reply still consumes the user's daily allowance** (see the Noor/OpenAI incident above). Compounding this, production `OPENAI_API_KEY` still needs to be pointed at the funded project — until it is, every user burns 5 messages a day for fallback text.
5. **Target-audience decision** — either select adults only for the simplest launch or implement the required age/minor handling before keeping ages 13–17.
6. **Latest-build device QA** — verify `VERB_PATTERN`, `AUDIO_RECOGNITION`, `WRITE_ARABIC`, and `HARAKAH_PLACEMENT` on a physical Android device.
7. **Scholar/content review** — establish a review process for Quranic Arabic accuracy, ayah relevance, pedagogy, repetition, and pacing before public launch.
8. **RESOLVED 2026-08-27 — Google Play Payments profile is now set up.** Owner completed enrollment and Google confirmed the bank account by email. Independently reconfirmed live via Play Console → Settings → Payments profile on 2026-08-27: "How you get paid" now shows a verified bank account (PK•• •••• •••• •••• 0743, Umar Akbar) under "Manage payment methods." This closes out the 2026-08-26 finding below (kept for history): at that time the page showed no business/bank info, only a promotional "enroll" card, consistent with $0.00 lifetime revenue. Also reconfirmed live: License Testing is configured (an "Early Testers" email list, 42 addresses, active, `RESPOND_NORMALLY`), and the owner's own account (`umarakbar73456@gmail.com`) is on that list.
   - **RESOLVED 2026-08-29 — `applicationNotFound` root-caused and fixed.** The Vercel production env var `GOOGLE_PLAY_PACKAGE_NAME` held an 11-character value instead of the 13-character `com.warsh.app`. Google's Android Publisher API resolves the package *before* the purchase token, so every `subscriptionsv2` call returned `404 applicationNotFound` regardless of which token was presented — which is why the 2026-08-27 bogus-token probe failed identically to a real purchase. Everything previously suspected was healthy and verified this session: service account `warsh-play-verifier@warsh-production.iam.gserviceaccount.com` (Active, Admin), Google Cloud project `warsh-production`, Android Publisher API enabled, and the rotated key `cec5b7d8898403a6dc376bb3b94c3b6adf906deb` (created 2026-08-26) correctly deployed. The 2026-08-27 'transient propagation delay' hypothesis was wrong; the value had been incorrect for ~17 days and only surfaced when this path was exercised again. **Fix:** env var corrected in Vercel and redeployed. **Evidence:** the same bogus-token probe against `https://api.warsh.app` moved from `503 store_unavailable` (`reason: applicationNotFound`) to `400 invalid_purchase` (`reason: invalid`), and production logs now report `packageName.value = com.warsh.app`, `trimmedLength 13`. A token-specific rejection for a fake token is the correct response and proves package resolution works. The diagnostic account was deleted via `DELETE /api/users/me` immediately after. **Limitation:** this proves package resolution only — a real Play-installed purchase has NOT yet been verified end to end (still item 1 above). Test with `umarakbar73456@gmail.com`, now the only license tester; every other account is charged real money. **Hardening shipped in the same commit (`7f3abd5`):** Google API failures are now classified rather than collapsed into `invalid_purchase` (config/auth/5xx → `503 store_unavailable`, retryable and clearly our fault), applied to both the subscription and consumable paths; failures log Google's reason, the service-account identity and key id, and a non-secret package-name fingerprint (this is what found the wrong value); the paywall no longer tells a charged customer their purchase was invalid for our misconfiguration; and admin-gated `GET /api/admin/play-diagnostics` performs a live self-test of package resolution without touching a real purchase.

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
- **IAP risk:** the purchase, restore, acknowledgement, consumable and cancellation/expiry paths are now verified end to end on a Play-installed build (2026-08-29). What remains is **refund handling**: `voidedPurchaseNotification` is not parsed, so a refunded subscription or a refunded Noor pack keeps its entitlement until the next lazy refresh, and refunded pack credits are never clawed back. The trial is seven days of full access; Chapter 1 completion is not a paywall trigger.
- **Config-value risk:** production environment variables are consumed with no validation in several places, and a bad value can disable a control silently rather than fail loudly. `AI_DAILY_MESSAGE_LIMIT` held a non-numeric value and removed the daily Noor cap entirely for every user, undetected, until it was exercised on device on 2026-08-29. Only that one variable has been hardened; the same bare-`Number()`/bare-string pattern elsewhere has not been audited.
- **Deploy-drift risk:** `vercel --prod` ships the working tree, not `git HEAD`, so any uncommitted local edit reaches production silently. This actually happened on 2026-08-29 with the `lib/openai.ts` fix. Commit before deploying, and check `git status` when production behaviour does not match the committed code.
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
