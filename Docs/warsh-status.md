# Warsh Current Status

**Status:** Active current-state source of truth
**Last verified:** 2026-09-23
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
- **Version 1.0.10 (versionCode 34) is live in Production (published by Google
  on 2026-09-15, same day as submission).** Confirmed in the Play Console via
  browser automation: "Latest release: 34 (1.0.10)", Active, 177 countries, 24
  installs within the first hour. Sentry `warsh-mobile` shows release
  `com.warsh.app@1.0.10+34` receiving events from a Play-delivered install
  (`Split APKs: true`; the device is Google's pre-launch crawler, a virtual
  OnePlus8Pro on Android 11 that backed out of the Google sign-in sheet — the one
  issue, `google_sign_in_incomplete:cancelled`, is that cancellation captured as a
  handled error, so a user dismissing the Google sheet now files a High-priority
  Sentry issue; downgrade it to a breadcrumb or drop it). Mixpanel
  `warsh - production` shows `login_completed` → `lesson_started` from the
  owner's Tecno KF8 on 1.0.10 (34), `environment: production`, so analytics reach
  Mixpanel from a real production device for the first time. Play's release
  dashboard still lists the edge-to-edge recommendation on 34 with the same five
  library APIs — expected, it cannot clear at app level (P0 #6 below) — and adds
  a new "DEX code optimization is below our threshold (Obfuscation 1%), fix by
  Feb 2027" issue: `minifyEnabled` is off in the release build
  (`android.enableProguardInReleaseBuilds` unset), so R8 never runs; enabling it
  needs a keep-rules pass and a Sentry source-map upload before it ships.
  Verified on the Tecno 2026-09-15: the delete-account dialog copy and the
  inset fixes (status-icon contrast, tab-bar clearance, sheet scrims). The named
  "Reminders" channel is **not** in this build (committed after the bundle was
  cut) and ships with 1.0.11. Still to check on the Tecno: the Speak mic
  re-prompt after Android revokes `RECORD_AUDIO`.
- **Version 1.0.12 (versionCode 36) released to Production on 2026-09-17,
  full rollout, all countries (owner treats the Play review as done).** A
  JS-only release carrying the two app fixes queued since 1.0.11: streak /
  freeze AsyncStorage keys scoped per account (`971b720`) and the Noor
  burst-limit "too quickly" error copy (`068508b`). Gate: fixtures, Urdu
  audit, `content:check`, backend build, app lint + tsc,
  `verify:release-api-url` (AAB and APK: `https://api.warsh.app`, Sentry DSN
  and Mixpanel token present, R8 mapping + Sentry ProGuard UUID `ac0d0ac6-…`,
  identical to 1.0.11 because no native code changed) and
  `verify:play-signing` all passed. Smoke-tested the matching APK on the
  API 34 AVD against production with a throwaway account (deleted after):
  login, Learn tab without the spurious streak modal, lesson intro with
  ayah audio, Vocabulary with the word-of-day illustration rendering, Noor.
  Play's device diff: 12,454 → 12,454, no device changes. Release notes
  (en-US): streak reminders stay with your own account on a shared phone;
  clearer message when Noor is asked too many questions at once; small
  fixes.
- **Version 1.0.11 (versionCode 35) is live in Production (published by Google
  on 2026-09-16, the day of submission — Play Console: "App update published",
  bundle 35 Active, 18.4 MB new-install size, 5.26 MB update size).** Submitted
  2026-09-16 14:53 UTC, full rollout, all 177 countries; no device-support
  change: 12,454 phones, 6,657 tablets, 0 dropped. The owner's Tecno KF8
  received it from Play the same evening (`installerPackageName=
  com.android.vending`, `versionCode=35`, updated 21:42 PKT). It is the first
  release built with R8 (Play's "DEX code optimization" requirement) and the
  first with Android Restore Credentials (Zero-Tap Sign-In); it also carries
  the named `Reminders` notification channel and stops filing a dismissed
  Google account sheet as a Sentry issue. The backend for it
  (`/api/auth/restore/*`, the `RestoreCredential` migration) is already live in
  production and `app.warsh.app` is redeployed. Artifacts:
  `warsh-app/android/app/build/outputs/bundle/release/app-release.aab` (43.7 MB)
  and the matching APK; `verify:release-api-url` (now also asserting the R8
  mapping and the Sentry ProGuard UUID `ac0d0ac6-…`), `verify:play-signing`,
  the 16 KB check, backend build/validators and `content:check` all pass.
  Play's App bundle explorer for 35: App optimization **Medium**, Obfuscation
  **75 %** (was 1 % on 34), total uncompressed DEX **10.6 MB** (was 34.7 MB), R8
  "Full Mode" with resource shrinking, "ReTrace mapping file" attached.
  Optimization and Shrinking percentages still read "–" an hour after upload;
  the bundle does embed `BUNDLE-METADATA/com.android.tools/r8.json` (AGP
  8.11.0) whose own stats are 58.4 % obfuscated / 58.0 % optimized / 58.2 %
  shrunk, all above the 25 % floor, and Play's panel suggests "Upgrade to AGP
  version 9.0" and "Repackage Classes" as the next steps. The dashes persisted
  after review; accepted as-is on 2026-09-17 (see Open items #1).
- Submitted to Production on 2026-09-15 at a 100% rollout (`4f9eaf2`). It carries every
  app change since 1.0.9: the Sentry DSN and Mixpanel token baked into the release
  bundle (`verify:release-api-url` confirmed both in the AAB and the APK), the mic
  permission re-prompt for Speak, audio-recognition clips, per-paragraph direction
  in Noor replies, the working monthly/yearly plan switch, and the honest "payment
  declined" message. Release gate passed in full; the APK was smoke-tested on the
  emulator against production. Play reported zero devices lost and only the
  expected missing-deobfuscation-file warning.
- **Version 1.0.9 (versionCode 33) was live in Production** — submitted 2026-09-12
  at a 100% rollout and published by Google the same day (submission #20,
  confirmed in the Console on 2026-09-14: "Latest release: 33 (1.0.9)", 177
  countries). It replaced versionCode 32 (1.0.8, live 2026-09-10). 1.0.9 carries
  every app change since 1.0.8: the neutral age check, the 70% lesson pass mark, the merged
  daily/streak goal, subscription health banners, Android 15 edge-to-edge insets,
  fold/split-screen survival, and the dropped overlay/storage permissions. Play
  reported zero devices lost and 34 → 32 permissions (`SYSTEM_ALERT_WINDOW` and
  the external-storage pair gone; `com.android.vending.CHECK_LICENSE` is injected
  by Play's own integrity protection, not by the app). Its only warning is the
  missing R8 deobfuscation file, expected while Sentry upload is disabled during
  the release build. The APK was smoke-tested on the emulator against the
  production API before upload.
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
- **Non-Google services verified in each console (2026-09-14):**
  - Vercel — team `warshapp-projects`, Hobby: `trywarshapp@gmail.com` is the sole
    member and Owner. `warsh.app` is listed there as "Third Party" (registered
    elsewhere).
  - Neon — org "Warsh" (Free): `trywarshapp` Admin, personal account Editor.
  - Cloudflare — the only R2 bucket is in the Warsh account (`f1a41ae5…`); the
    personal account's bucket was deleted the same day.
  - Sentry — org `umar-bin-akbar-ali` (a display slug only): `trywarshapp` is the
    sole member and Owner; projects `warsh-backend` and `warsh-mobile`. 2FA
    enabled by the owner 2026-09-14.
  - Resend — team `trywarshapp`: sole member, Admin, MFA on; `warsh.app` verified.
  - Mixpanel — org "Warsh" (renamed from the leftover "Camera Lens World" on
    2026-09-14): `trywarshapp` sole Owner; projects `warsh - production`
    (4026851) and `warsh - Dev`, plus an unrelated `CLW-Project`. 2FA enabled by
    the owner 2026-09-14.
  - Expo — org `warshapp`: `trywarshapp` Owner, personal Admin; project "Warsh"
    lives there. 2FA enabled by the owner 2026-09-14. Android signing is local
    (`WARSH_UPLOAD_*`), not in EAS.
  - Domain `warsh.app` — nameservers are `registrar-servers.com`, i.e. Namecheap
    holds registration and DNS. **Owner decision 2026-09-14: it stays in the
    personal Namecheap account, a deliberate exception like OpenAI.** Not a
    pending transfer item; revisit only if a Warsh-owned registrar account is
    ever created.
  - Personal-only by design: OpenAI (see above) and Namecheap.
  **The ownership-transfer verification is complete**, and its follow-ups (2FA
  at Sentry, Mixpanel and Expo; Mixpanel org renamed) are done.
- **Found during the sweep: the Play build reports nothing to Sentry or Mixpanel.**
  `warsh - production` in Mixpanel has 0 events lifetime, and `warsh-mobile` in
  Sentry last heard from release 1.0.7 (29) on 2026-08-22. Inspecting the built
  artifacts proved it: neither the Sep 12 AAB (1.0.9) nor the Sep 14 APK contains
  a Sentry DSN or the Mixpanel token. `eas.json`, `start-warsh.ps1` and the
  AGENTS.md recipe export API URL, environment and the Google client ID — never
  `EXPO_PUBLIC_SENTRY_DSN` or `EXPO_PUBLIC_MIXPANEL_TOKEN` — and `warsh-app/.env`
  holds both blank (an interrupted Jul 24 build left the only copy in
  `.env.warsh-release-backup-38232`). So the app's crash reporting and analytics
  have been silently off in production; the backend's Sentry is unaffected.
  Fixed for the next build: the two client keys now live in the gitignored
  `warsh-app/.env.release`, `start-warsh.ps1` exports them (and refuses to build
  without the file), the AGENTS.md recipe does the same, and
  `verify:release-api-url` fails any bundle that does not contain the exact
  values — it fails on the 1.0.9 AAB, as it should. Shipped in 1.0.10 (34) and
  confirmed live on 2026-09-15: Sentry has the release's first events from a
  Play install and Mixpanel has the owner's Tecno KF8 session on 1.0.10.

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
- Quran reader (Pen section 27), free for every signed-in learner with no lesson
  or subscription gate: a Quran card on the Learn tab opens the last page read,
  and `/(app)/quran` lists surahs, juz and bookmarked pages. Pages follow the King
  Fahd Complex 15-line Madani layout line for line (604 pages; line and page
  numbers per word from the Quran.com v4 API). The text, layout and word-level
  tajweed markup are bundled in `warsh-app/data/quran/` (≈2.5 MB, loaded on first
  open), so reading needs no network. Rebuild with
  `node scripts/build-quran-data.mjs`; it measures every line with HarfBuzz
  against the bundled Amiri Quran font so each page gets the largest font size
  whose widest line fits. Optional tajweed colours (nasal rules, qalqalah, madd by
  length, silent letters; natural madd is left uncoloured) with a tap-a-word rule
  explanation in English and Urdu. Last page, bookmarks, tajweed and keep-awake
  are stored on the device only (`stores/quranStore.ts`). Not built yet: the 13-
  line IndoPak layout (shown as "coming soon"), recitation audio and tap-a-word
  meanings.
  Verified 2026-09-23 on a release APK on the `Warsh_API_34` emulator (list,
  page 2, the widest page 591, page 300, tajweed on/off, rule sheet, settings,
  bookmark, swipe direction, Learn card resume). Not yet checked on web.
- Indo-Pak 15-line Mushaf (Pen section 28), the reader's default since
  2026-09-23; Madani stays selectable in Reading settings. 610 pages from the
  Qudratullah (Lahore) 15-line layout, which the owner confirmed matches the Taj
  Company 15-line print, with the QUL Indo-Pak word-by-word text and its Indo-Pak
  Nastaleeq font (`assets/fonts/IndoPakNastaleeq-Regular.ttf`). The QUL files
  need a free qul.tarteel.ai account and live in the
  gitignored `.quran-cache/qul/`; rebuild with
  `node scripts/build-quran-indopak-data.mjs`. Parahs use the Indo-Pak
  boundaries (4 at 3:92, 7 at 5:83, 11 at 9:94, 14 at 15:2, 20 at 27:60, 21 at
  29:45, 23 at 36:22), each checked by the build to open a page, and the Juz tab
  reads "Juz (Parah)" / "پارہ" with the parah names. A "Surah · Parah" button on
  every page opens the list. The place and bookmarks are stored as ayahs, so
  switching layout reopens at the same ayah. The owner holds no separate licence
  for the QUL layout or the Indo-Pak font (2026-09-23); both are the free QUL
  downloads and ship as they are.
- Indo-Pak 16-line Mushaf, selectable in Reading settings since 2026-09-23 (not
  yet device-tested by the owner): 548 pages from the QUL Taj Company 16-line
  layout (`taj-indopak-16-lines.db` in `.quran-cache/qul/`), built by the same
  script into `data/quran/indopak16/`, same text, font and parah checks. The
  print sets the basmala inside the surah header band, so those headers draw
  name and basmala on one line; on pages 529–530 the basmala takes its own line.
- Tajweed on the Indo-Pak pages (2026-09-23): `build-quran-indopak-data.mjs`
  fetches Quran.com's word-level Uthmani tajweed (cached in
  `.quran-cache/tajweed/`) and carries each rule onto the Indo-Pak spelling
  letter by letter (`scripts/quran-indopak-tajweed.mjs`: letter clusters aligned
  on a folded consonant skeleton). 46,035 of 46,036 coloured words map; three
  ayahs whose Indo-Pak text splits a word differently (2:181, 8:6, 13:37) stay
  plain. Colour runs are re-cut and sized with HarfBuzz against the Indo-Pak
  font exactly as on Madani pages. Tajweed is now available on every layout.
- Translation under the page (Pen section 30, 2026-09-23): Reading settings →
  "Translation under the page" = Off (default) / Urdu, Maulana Muhammad
  Junagarhi (owner's choice) / English, M. M. Pickthall. Both public domain,
  from Quran.com resources 54 and 19, with Junagarhi's tafsir footnote markers
  stripped; bundled by `scripts/build-quran-translations.mjs` (1.4 MB + 0.8 MB,
  loaded only when turned on). With a translation on, a strip peeks under the
  page and the page scrolls down to the ayahs that begin on it (plus the one it
  continues). Verified on web against staging (page 562 = Al-Mulk 1–10).
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
  `media:prune-orphans`. All 920 carry an illustration (2026-09-16).
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

### Open items (2026-09-18)

Everything below this list is either done and verified, or one of these:

1. ~~**R8 "–" percentages in Play Console**~~ — settled 2026-09-17: accept
   "App optimization: Medium" until the Expo SDK 55 / RN 0.82 upgrade happens
   for its own reasons. Bundle explorer for 35 shows Optimization and
   Shrinking as "–" with a warning, Obfuscation 75 %, R8 Full Mode + Resource
   Shrinking ticked, and "Upgrade to AGP version 9.0". The bundle's own
   `BUNDLE-METADATA/com.android.tools/r8.json` reports 58 % optimized / 58 %
   shrunk and the DEX went 34.7 → 10.6 MB, so the work is done and Play simply
   cannot read AGP 8.11 metadata for those two figures. "Medium" is a
   recommendation with no deadline; the DEX size requirement itself is met.
   AGP 9 is pinned out by React Native 0.81's Gradle plugin
   (`@react-native/gradle-plugin/gradle/libs.versions.toml`), so the fix is the
   SDK 55 / RN 0.82 upgrade — a multi-day workstream with regression risk
   across the R8 keep rules, native modules and the illustration pipeline —
   not worth it for a dashboard label. Do not list this as open again; take
   the upgrade when a feature needs it or SDK 54 loses support.
2. **Curriculum rebuild, Chapters 8 onward.** **Chapters 6 and 7 are live in
   production (promoted 2026-09-18** with `content:promote-chapter-six` and
   `content:promote-chapter-seven`, in that order; the promote scripts update
   `ch06-l01..l04` / `ch07-l01..l05` in place so learner progress stays
   attached, and only the review + final-test lessons are new ids). R2 audio
   audit after promotion: 3702/3702, missing 0. `content:check` clean. The
   only learner who had finished either chapter was the owner's test account,
   backfilled with `progress:backfill-skipped`. Deviations are listed at the
   end of each proposal. **Chapter 8 (`Docs/proposals/chapter-08-content-proposal.md`,
   feminine past verbs + `الَّتِي`) is live in production (promoted 2026-09-18**
   with `content:promote-chapter-eight -- --apply`; `ch08-l01..l04` rewritten in
   place so learner progress stays attached, `ch08-l05` review and `ch08-test`
   (12 MC, 80 %) new). Post-promotion: `content:backfill-new-lessons --
   --lesson-ids ch08-l05,ch08-test --apply` inserted 2 rows for the one learner
   who had finished the chapter (the owner's test account, which
   `progress:backfill-skipped` then reported at 420/420); R2 audio audit
   3721/3721, missing 0; `content:check` clean. Two player-driven content rules
   learned during the staging build are recorded in the proposal's
   implementation notes: any EN string the player renders without a forced
   direction (`MATCH_AYAH` options, hook `noor_intro`, reveal
   `noor_explanation`) must begin with English, and a `CONTRAST` card needs
   `concept.ar` or it renders blank.
   **Chapter 9 (`Docs/proposals/chapter-09-content-proposal.md`, plural nouns
   + `هٰؤُلَاءِ`) is live in production (promoted 2026-09-18** with
   `content:promote-chapter-nine -- --apply`; `ch09-l01..l04` rewritten in
   place, `ch09-l05` keeps its ID but is now the review — the `VERB_PATTERN`
   past-tense table is dropped — and `ch09-test` (12 MC, 80 %) is new).
   Post-promotion: `content:backfill-new-lessons -- --lesson-ids ch09-test
   --apply` inserted 1 row (the owner's test account, now 421/421);
   `content:baseline` re-recorded (it had not been refreshed after the
   Chapter 8 promotion, so `content:check` showed Chapter 8 as a false
   conflict — production matched Git byte for byte); R2 audio audit
   3737/3737, missing 0; `content:check` clean. The 22 Chapter 8
   `explanation_on_wrong` / `TRUE_FALSE` strings that opened with Arabic were
   rewritten and re-promoted with `content:promote-chapter-eight -- --apply`
   in the same session. The same Arabic-leading pattern remained in roughly
   1,400 strings across Chapters 1–72 (every chapter, counted 2026-09-18), so
   the durable fix went into the player the same day rather than into content:
   the exercise prompt (`TRUE_FALSE` statement, `FILL_BLANK` hint,
   `BUILD_SENTENCE` translation), wrong-answer explanation, hook `noor_intro`,
   close `noor_message`, spoken-phrases context body and every option label are
   now wrapped in `withDirectionMark`, the Unicode LRM/RLM prefix the Discover
   card already used (`writingDirection` is iOS-only, so a style alone does
   nothing on Android). Options that merely contain Arabic inside English
   prose render as left-to-right `Text`; only Arabic-only options keep the
   `ArabicText` font and right-to-left layout (`isArabicOnly`). Verified on
   the API 34 emulator with Chapter 1 Lesson 2: "ذَٰلِكَ points to something
   near you." and the Arabic-leading wrong-answer explanation both read
   left-to-right with the full stop on the right. Ships with the next Play
   build; the "start with English" authoring rule is now a style preference,
   not a rendering requirement. `reveal.noor_explanation` is not rendered by
   the player at all (283 Arabic-leading strings there are moot).
   **Chapter 10 (`Docs/proposals/chapter-10-content-proposal.md`, plural
   pronouns + `قَبْلَ / بَعْدَ`) is built, staging-verified (2026-09-18) and
   promoted to production 2026-09-19** on the owner's go-ahead:
   `content:promote-chapter-ten -- --apply` (4 in-place updates, 3 creates,
   chapter retitled, post-promotion verification passed);
   `content:backfill-new-lessons -- --lesson-ids ch10-l05,ch10-l06,ch10-test
   --apply` inserted 3 rows for the one learner who had finished the chapter
   (the owner's account, now 424/424; `progress:backfill-skipped` found
   nothing further); `content:baseline` re-recorded for 424 lessons;
   `content:check` clean (0 orphans); R2 audio audit 3762/3762, missing 0;
   production health 200 and the chapter lists all seven lessons in display
   order. `ch10-l01..l04` are rewritten in
   place (9 cards / 7 exercises each); `ch10-l05` (you all, display order 3),
   `ch10-l06` (review, 8 cards / 10 exercises) and `ch10-test` (12 MC, 80 %)
   are new. Fixture file numbers follow display order, as in Chapter 5, so
   `ch10-l03` (before) is file 04 and `ch10-l04` (after) is file 05 — the
   proposal's "keep file 03/04 for l03/l04" rule cannot coexist with the
   mirror's `(chapter, order)` keying and is recorded as a deviation in the
   proposal's implementation notes. Fixture/Quran/Urdu audits pass; 31
   catalogue clips generated (R2 3762/3762); `salah`, `dars`, `shams`,
   `rajaa` discover images copied from the dictionary set; five composite
   scenes tracked for the owner in `lesson-illustrations-needed.md`.
   Verified on the API 34 emulator against staging: lesson list order and
   titles, every card of all five lessons and the review (images + audio),
   Lesson 1 end to end with all seven exercise types, test intro and first
   question; through the API: test locked until the six lessons are
   complete, answer key stripped from the payload, 0/12 and 9/12 fail, 10/12
   and 12/12 pass, a repeated pass earns 0 XP, chapter completes, and a
   fresh second account sees 0/7 with the test locked. Note: deep-linking
   `warsh://lessons/{id}/play` while another lesson screen is mounted
   red-boxes the dev build (`ReactShadowNode.addChildAt` on null) and leaves
   a corrupted view tree — navigate through the list instead. After every
   chapter promotion that adds lesson ids, re-run `progress:backfill-skipped`
   for the owner's test account and `content:backfill-new-lessons` for
   everyone else.
   **Chapter 11 (`Docs/proposals/chapter-11-content-proposal.md`, family
   words, the ي of 'my', فِيهِ / فِيهَا and بُيُوتِكُمْ) is built,
   staging-verified and promoted to production 2026-09-19** on the owner's
   go-ahead: `content:promote-chapter-eleven -- --apply` (5 in-place updates,
   2 creates, post-promotion verification passed);
   `content:backfill-new-lessons -- --lesson-ids ch11-l06,ch11-test --apply`
   inserted 2 rows for the one learner who had finished the chapter (the
   owner's account, now 426/426; `progress:backfill-skipped` found nothing
   further); `content:baseline` re-recorded for 426 lessons; `content:check`
   clean (0 orphans); R2 audio audit 3778/3778; Urdu audit clean; production
   health 200 and the chapter lists all seven lessons in display order.
   `ch11-l01..l05` are rewritten in place (8 cards / 7
   exercises each, IDs and display orders unchanged); `ch11-l06` (review,
   8 cards / 10 exercises) and `ch11-test` (12 MC, 80 %) are new. Lesson 1
   now hooks on Al-Qasas 28:25 (contains أَبِي) and Lesson 4 on Al-Baqarah
   2:30 (فِيهَا with the feminine الْأَرْضِ on screen); the Lesson 1 parse is
   SUBJECT / PREPOSITION / PREDICATE; Urdu matching choices are distinct;
   every reveal declares `highlighted_words`. Fixture/Quran/Urdu audits
   pass; 19 catalogue clips generated (R2 3778/3778); `akh`, `ukht`,
   `matbakh`, `ard`, `aila` discover images copied from the dictionary set;
   no open illustration scenes. Verified on the API 34 emulator against
   staging: chapter card and lesson list, every card of all six lessons
   (images + audio), Lesson 1 end to end with all seven exercise types,
   test intro and first question; through the API on a fresh account: test
   locked until the six lessons are complete, answer key stripped, 0/12 and
   9/12 fail, 10/12 passes and completes the chapter, 12/12 repeat earns
   0 XP. `media:check-fixtures` reports three pre-existing Chapter 4
   relative-path image URLs (`/images/discover/ch04-*-v1.png`) that it cannot
   HEAD; they are not part of this work.
   **Chapter 12 (`Docs/proposals/chapter-12-content-proposal.md`,
   introductions: مَا اسْمُكَ؟, مِنْ أَيْنَ أَنْتَ؟, مَا مِهْنَتُكَ؟, past-tense
   recognition, classroom phrases) is built, staging-verified and promoted to
   production 2026-09-19** on the owner's go-ahead:
   `content:promote-chapter-twelve -- --apply` (5 in-place updates, 2 creates,
   post-promotion verification passed);
   `content:backfill-new-lessons -- --lesson-ids ch12-l06,ch12-test --apply`
   inserted 2 rows for the one learner who had finished the chapter (the
   owner's account, now 428/428; `progress:backfill-skipped` found nothing
   further); `content:baseline` re-recorded for 428 lessons; `content:check`
   clean (0 orphans); R2 audio audit 3802/3802; production health 200 and the
   chapter lists all seven lessons in display order. The first `content:check`
   and promote dry run died with `P1017 "Server has closed the connection"` —
   Neon's compute waking, not a data problem; the retry went through.
   `ch12-l01..l04` are rewritten in place (8 cards / 7–8
   exercises, IDs and display orders unchanged); `ch12-l05` keeps its phrases
   and audio and only gains the recognition-only scope note, plain phrase
   contexts, a natural dialogue order and a clean title; `ch12-l06` (review,
   8 cards / 10 exercises) and `ch12-test` (12 MC, 80 %) are new. Quran
   checkpoints now carry declared targets: 49:13 at لِتَعَارَفُوا (Lesson 1,
   review, test), Abasa 80:18 at مِنْ (Lesson 2), At-Tawbah 9:105 at
   عَمَلَكُمْ (Lesson 3), Al-Alaq 96:2 at the exact خَلَقَ (Lesson 4); the
   خَلَقْنَاكُم fill-in is gone and the bridge is one recognition-only CONTRAST
   card. Feminine address and profession forms are recognition only. The stale
   `reader_lecture_12_ta'aruf.md` source field was dropped. Fixture/Quran/Urdu
   audits pass; 16 catalogue clips generated; `tabib` and `tajir` discover
   images copied from the dictionary set (the dictionary asset under مُعَلِّم is
   a shop scene — flagged for the owner; teacher and engineer scenes listed in
   `lesson-illustrations-needed.md`). Verified on the API 34 emulator against
   staging: chapter card and lesson list, every card of Lessons 1–4 and the
   review with images and audio, Lesson 1 end to end with all seven exercise
   types (wrong-answer explanation included), the spoken lesson's scope note;
   through the API on a fresh account: test locked until the six lessons are
   complete, answer key stripped, 0/12 and 9/12 fail, 10/12 passes with the
   chapter bonus and unlocks Chapter 13, two repeat passes earn 0 XP, dialogue
   order A:p01 A:p02 A:p09 B:p08 B:p10 B:p12.
   **Found and fixed on the way (app):** `CONVERSATION_BUILDER` was never
   implemented for the schema-v1.0 shape — the player read only a legacy
   `conversation` field, so the exercise rendered blank with no options and
   no way forward. This is live today in production Chapter 12 Lesson 3
   (`ex06`) and Chapters 22, 60, 61, 71, 72. `play.tsx` now renders the
   opening line as the Arabic prompt with audio and the replies as an Arabic
   option grid (BUILD mode uses the tile builder); `lib/audioTargets.ts` counts
   the opening line as a catalogue clip (10 opening-line clips for Chapters
   22/60/61/71/72 generated so content-health stays clean); new i18n key
   `player.prompt.conversationReply` in en/ur. Verified on the emulator. Ships
   with the next Android release; the web export needs a redeploy.
   Fixed 2026-09-18 alongside the promotion: (a) `GET /api/lessons/{id}` no
   longer returns `assessment.questions[].correct_index` — the server graded
   already and the app never read it, but the answer key was visible to anyone
   inspecting the response (`stripChapterTestAnswers` in `lib/chapterTests.ts`,
   covered by `tests/chapterTests.test.ts`); (b) the chapter-test pass screen's
   "Continue to next chapter" navigated to `/chapters/{id}`, a route that does
   not exist, so every learner who passed a test and tapped Continue landed on
   expo-router's unmatched-route error — it now goes to `/lessons/{chapterId}`
   (owner hit this on the Chapter 1 test); (c) the chapter-test intro hero now
   prints the chapter's own `Chapter.titleAr` (served as `chapterTitleAr` on the
   lesson response) instead of the hard-coded `هَذَا • ذَٰلِكَ • هَذِهِ • تِلْكَ`
   strip — Pen frame 24, approved 2026-09-18. (b) and (c) ship with the next
   Android release; the web export was redeployed. Chapter 5's
   six composite-scene illustrations are owner deliverables tracked in
   `Docs/lesson-illustrations-needed.md` (+ `.csv` manifest; delivery lands via
   `npm run images:upload-lessons`, added 2026-09-17). From now on every chapter
   rebuild adds its missing card scenes to that file. The `لِمَنْ هَذَا؟` note at
   the end of the Chapter 5 proposal is settled 2026-09-17: stays as written.
   **Chapter 13 (`Docs/proposals/chapter-13-content-proposal.md`, renamed
   "Reading Plurals in the Quran": the three plural families applied to
   Quranic forms) is built, staging-verified and promoted to production
   2026-09-20** on the owner's "implement and promote, don't wait":
   `content:promote-chapter-thirteen -- --apply` (4 in-place updates, 2 creates,
   chapter renamed, post-promotion verification passed);
   `content:backfill-new-lessons -- --lesson-ids ch13-l05,ch13-test --apply`
   inserted 2 rows for the one learner who had finished the chapter (the
   owner's account, now 430/430; the first attempt died on a Neon connection
   drop and was re-run); `content:baseline` re-recorded for 430 lessons;
   `content:check` clean (0 orphans); R2 catalogue audit 3819/3819 (38 new
   clips); Quran audit 851/0; Urdu audit clean; legacy validator clean;
   production health 200. `ch13-l01..l04` are rewritten in place (8/8/9/8
   cards, 7/7/7/8 exercises, IDs and display orders unchanged): Lesson 1
   bridges from Chapter 9 instead of reteaching, keeps Al-Kafirun 109:1 with
   الْكَافِرُونَ declared, and presents مُتَّقِينَ as the encountered ـِينَ shape
   of the same family; Lesson 2 moves to an Al-Ahzab 33:35 excerpt whose
   declared token is وَالْمُؤْمِنَاتِ (index generated from the canonical
   text, وَ included) with long-ā transliterations; Lesson 3 moves to An-Nas
   114:5 at صُدُورِ (the old reveal index 4 on a four-token ayah highlighted
   nothing), drops ثَلَاثَةُ كُتُبٍ, keeps `ch13-l03-ex07` for the An-Nas
   Tadabbur coverage and uses unambiguous Urdu plurals; Lesson 4 is a new
   Plural Reading Lab on an Al-Baqarah 2:5 excerpt at الْمُفْلِحُونَ with the
   adjective-agreement objective removed entirely (Chapter 14 owns it).
   `ch13-l05` (review, 8 cards / 10 exercises) and `ch13-test` (12 MC, 80 %)
   are new. The stale `reader_lecture_13_jama_introduction.md` source is
   replaced by the proposal path in the chapter spec. No new images (existing
   dictionary scenes reused where a word had one).
   **Validator correction shipped with it:** `validate-curriculum.cjs` now
   bounds-checks `reveal.highlighted_word_indices` for every reveal, not only
   when `highlighted_words` is declared, and accepts an empty list (Chapter 2
   reading lessons highlight nothing on purpose). That surfaced 18 legacy
   reveals in Chapters 19–70 whose index points past the ayah (several also
   explain a word that is not in the excerpt); they are listed in
   `LEGACY_REVEAL_INDEX_DEFECTS` and reported as warnings so the gate stays
   green, and belong to the owner's Chapter 9–72 review — the list only
   shrinks, and any new out-of-range index anywhere is an error.
   `tests/reveal-validation.test.ts` proves index 4 fails a four-token ayah.
   **Player fact learned:** a discover card shows only `text.ar ?? concept.ar`
   as its hero and never renders `examples`, so every CONCEPT / CONTRAST card
   must carry its comparison in `concept.ar` (the first cut rendered a blank
   hero on the emulator; fixed before promotion). Verified on the API 34
   emulator against staging: chapter card, Lesson 1 hook, all eight cards with
   audio, and the exercise flow; through the API on a fresh account: test
   locked (fetch and submit) until the five lessons are complete, answer key
   stripped, every lesson serves its cards/exercises/declared reveal, 0/12 and
   9/12 fail, 10/12 passes with the chapter bonus and unlocks Chapter 14, a
   repeat pass earns 0 XP.
   **Chapter 14 (`Docs/proposals/chapter-14-content-proposal.md`, "Describing
   Plurals": adjective agreement with plural nouns) is built, staging-verified
   and promoted to production 2026-09-21** on the owner's "yes promote":
   `content:promote-chapter-fourteen -- --apply` (4 in-place updates, review
   moved to order 6, 2 creates, post-promotion verification passed);
   `content:backfill-new-lessons -- --lesson-ids ch14-l06,ch14-test --apply`
   inserted 2 rows for the one learner who had finished the chapter;
   `content:baseline` re-recorded for 432 lessons; `content:check` clean
   (0 orphans); R2 catalogue audit against production 3832/3832 (0 missing);
   production health 200; a fresh production account lists all seven lessons
   in display order 1–4, l06, l05, test and gets `chapter_locked` on lesson
   fetch. The owner's scholarly review of the grammar explanations and the
   Studio Urdu content-review pass were deferred past promotion at the
   owner's decision. Seven items: `ch14-l01..l04`
   rewritten in place (8/8/8/8 cards, 7/7/8/9 exercises, IDs and orders kept),
   `ch14-l06` is the new order-5 recognition lesson (7 cards / 6 exercises),
   the review `ch14-l05` keeps its ID and moves to order 6 (8 cards / 10
   exercises), `ch14-test` (12 MC, 80 % = 10/12) is order 7. Because fixtures
   map to rows by position, the order-5 file is
   `chapter-14-lesson-05-quranic-agreement.json` (row `ch14-l06`) and the
   review is `chapter-14-lesson-06-review.json` (row `ch14-l05`); both notes
   say so. Reveals are all declared: Al-Anbiya 21:26 excerpt at مُكْرَمُونَ
   (Lesson 1, test), Al-Ghashiyah 88:13 at مَرْفُوعَةٌ (Lesson 2, review),
   88:14 at مَوْضُوعَةٌ (Lesson 3), 88:15 at مَصْفُوفَةٌ (Lesson 4), Az-Zumar
   39:67 excerpt at مَطْوِيَّاتٌ (Lesson 5) — taught correctly as feminine
   plural, an attested variation to recognise while the feminine-singular
   default stays for production. Every proposal correction landed: the Al-Ma'un
   107:2/107:4 hooks (no agreement) are gone, phrase-versus-sentence has its own
   lesson bridging Chapter 4 Lesson 3, classification asks "does this plural
   refer to human beings?" (never "can it think?"), ة and noun shape are
   explicitly not decisive, الْأَرَضُونَ and جَنَّاتٌ تَجْرِي are out, Urdu uses
   جمع مکسر / عاقل جمع / غیر عاقل جمع / وصفی ترکیب, transliteration is one
   convention with -atun. Chapter spec, seed rows and
   `scripts/promote-chapter-fourteen.cjs` mirror Chapter 13; the stale
   `reader_lecture_14_wasf_jama.md` source is replaced by the proposal path.
   Verified: fixture/legacy/Urdu/Quran audits clean (855 ayah entries, 0
   issues), 175 tests, 36 new catalogue clips generated (fixtures 2806/2806;
   the `--from-db` audit against staging lists 640 `audio/words` gaps that are
   only staging's re-seeded vocabulary ids); API on fresh accounts: test
   locked (fetch and submit) until the six lessons complete, answer key
   stripped, 0/12 and 9/12 fail, 10/12 passes with +20 XP and the 50 XP
   chapter bonus and unlocks Chapter 15 (locked before, checked with
   `DEV_UNLOCK_ALL=false`), repeat pass earns 0; emulator (API 34, staging):
   Lesson 1 hook with recitation, all eight cards with catalogue audio, all
   seven exercise types answered, reveal highlights مُكْرَمُونَ, lesson
   complete +15. Not done: scholarly review of the grammar explanations (the
   proposal requires it before promotion), and Warsh Studio content-review
   pass in Urdu.
   **Chapters 15–19 (`Docs/proposals/chapter-15..19-content-proposal.md`) are
   built and staging-verified 2026-09-23; production promotion is pending the
   owner's go-ahead** (`npm run content:promote-chapter-fifteen -- --apply`,
   likewise `-sixteen` … `-nineteen`, all one script,
   `scripts/promote-chapters-15-19.cjs`, then `content:baseline`; no
   `content:backfill-new-lessons` — the `addedAt` trigger keeps finished
   learners unlocked). 15 "These and Those in Quranic Context" and 16 "School
   Life in Quranic Arabic" have four lessons, a review and a new `chNN-test`
   (order 6); 17 "Past Actions in Quranic Arabic", 18 "Reading Connected
   Descriptions" and 19 "Attached Pronouns in Context" have five lessons, the
   old order-6 lesson rebuilt as the REVIEW and a new `chNN-test` (order 7).
   Every existing ID and display order is kept; the old review/l06 files were
   renamed `-review.json`. Deviations from the proposals, all recorded in the
   fixture notes: Ch15 review — none; Ch16 L4 adds قُلْ (Tadabbur key قل);
   Ch17 uses Al-Mujadilah 58:21 كَتَبَ اللَّهُ instead of 2:187, teaches 2:249
   شَرِبَ honestly as "whoever drinks", keeps نَامَ / جَلَسَ as unassessed
   exposure and drops نَظَرَ; Ch18 authored examples use past verbs, not
   يَقْرَأُ / تَقْرَأُ (present tense not yet taught); Ch19 uses Hud 11:71
   وَامْرَأَتُهُ (Ibrahim's wife) instead of Al-Masad 111:4 and Maryam 19:16
   أَهْلِهَا for owner-in-context. Tadabbur coverage (enforced by
   `db:validate-fixtures`) was kept rather than weakened: the An-Nas words sit
   in Ch18 L1 and the Ch18 review, and the Ch19 review carries a labelled
   "Al-Falaq word bridge" (8 glossed words, 4 recognition items, none in the
   chapter test) — the Ch19 proposal wanted those words out of the review, so
   this is the one owner decision to confirm. `chapter-19-lesson-01.json`
   left the legacy reveal-defect list (its index is fixed). Verified:
   fixture/legacy/Urdu/Quran audits clean (869 ayah entries, 0 issues), 183
   tests, 172 new catalogue clips (fixtures 3817/3817, no Quran text
   synthesised); staging promote dry-run then apply for all five; API on a
   fresh account with `DEV_UNLOCK_ALL=false`: each chapter lists its items in
   order, the test is locked until the lessons are done, answer key stripped,
   every reveal highlight matches its word, 0/12 and 9/12 fail, 10/12 passes
   (+20 XP) and unlocks the next chapter, repeat pass 0 XP; a learner who
   finished the old Chapter 15 keeps Chapter 16 open and gets "Updated"
   notices; web player (staging): Ch15 L1 hook with recitation, cards, the
   new ayah card (Arabic + meaning, no transliteration, human recitation),
   tap/true-false/fill exercises. Not done: scholarly review of the grammar
   and Quran-context wording the proposals ask for, and an Android emulator
   pass.
   **Conversation Labs CL1–CL6 are live in production (2026-09-23, owner's
   go-ahead).** CL6 (Chapter 11) went first; the owner then asked for the
   Mission to use a new photo and new people instead of repeating Answer it,
   and for CL1–CL5 to follow the same pattern. CL1 rebuilds `ch03-l05`
   (Chapter 3, position 6) and CL3 rebuilds `ch07-l05` in place, keeping their
   IDs, SP1/SP2 phrase ids and recordings; CL2 `ch05-cl07`, CL4 `ch09-cl05` and
   CL5 `ch10-cl06` are new rows before each chapter's review and test (those
   keep their IDs and move down one; fixtures renamed to match position).
   Each lab: 7–11 phrases (unscored forms `heard_only`), a 4–6 line dialogue,
   6 scored exercises, 3 Answer it turns that mirror the dialogue, and 3
   Mission turns with new people, objects or places. Deviations from the
   proposal, all to keep scored answers inside taught material:
   CL2 uses الْكُرْسِيّ instead of الْمَكْتَب (Chapter 6) and drops هَلْ / هُوَ;
   CL3 uses هَذَا الْأُسْتَاذُ instead of الْمُعَلِّمُ (Chapter 9); CL1 drops
   أَنَا طَالِبٌ and treats مَا اسْمُكَ؟ / مَا اسْمُكِ؟ as heard only (ـكَ is
   Chapter 7). Production steps run: `content:check` clean →
   `content:promote-chapter-{five,nine,ten} -- --apply` → `content:sync`
   (CL1, CL3) → titles → `content:backfill-new-lessons` (6 rows) →
   `content:check` 436/436 → `content:baseline`; 29 phrase clips
   (`audio:prebuild-fixtures`) + 12 catalogue clips (audit 3850/3850).
   Verified through the live API with the owner's test account. Still open:
   scholarly review of the Arabic in CL1–CL5; the Open items #7 notice for
   learners who had already finished those chapters (6 backfilled rows keep
   them unlocked); native Android needs 1.0.13 for the lab screens.
   Original pilot note: **CL6 Home and Family (Chapter 11 pilot) was built and
   staging-verified 2026-09-23.** Design: Pen section 25 (approved). Proposal:
   `Docs/proposals/conversation-labs-curriculum-proposal.md`. A lab is a
   `SPOKEN_PHRASES` lesson with a `spoken_phrases.lab` block
   (`@warsh/lesson-schema`: mission, goals, pattern note, speaking lines,
   mission turns, can-do list; phrases may be `heard_only`, and the schema
   rejects a heard-only form as a learner line, speaking target, mission
   answer or scored exercise answer). Player beats: scene → listen first +
   phrases → scored practice (existing exercise renderer, 70 % pass) → speak
   (`ShadowRepeatExercise`) + mission (retry, never scored) → close with the
   can-do card (`components/ConversationLab.tsx`). `ch11-cl06` sits at order
   6; the review `ch11-l06` and `ch11-test` keep their IDs and move to 7 and 8
   (fixtures renamed to `-lesson-07-review` / `-lesson-08-final-test` because
   fixtures map to rows by position). Chapter list shows a "New" badge and
   the Conversation Lab label instead of "Skipped by placement" for a
   backfilled lab. Fixed on the way: completing a lesson that was
   `SKIPPED_BY_PLACEMENT` re-paid the 50 XP chapter bonus and claimed "Next
   chapter unlocked" — it now only fires when that completion is what
   finishes the chapter. Audio: 10 phrase clips + 4 catalogue clips in R2
   (catalogue audit 3836/3836). Staging: `content:promote-conversation-lab-ch11
   -- --apply` + `content:backfill-new-lessons -- --lesson-ids ch11-cl06
   --apply` (9 learners); emulator walk-through of every step on the test
   account. Production steps when approved: `content:check`, the promotion
   script `--apply`, the backfill `--apply`, `content:baseline`, then
   commit and deploy the backend and `deploy:web`; the Android client needs a
   release before native learners see lab screens. Open: telling
   already-finished learners — settled as Open items #7;
   scene illustration (owner-supplied); scholarly review of the Arabic.
   **Answer it — the speech recognition part of the hold above — is built and
   staging-verified 2026-09-23.** Design: Pen section 26 (approved). Proposal:
   `Docs/proposals/spoken-answer-checking-proposal.md`. A lab may carry
   `spoken_phrases.lab.answer_it` (turns: a lesson phrase as the question,
   WORD/OPEN answer slots, a model answer, a tip); when present, lab step 5 is
   a chat (`components/AnswerItConversation.tsx`) instead of the Say-it lines.
   The device recogniser (`expo-speech-recognition`, `ar-SA`, Google on
   Android) turns speech into text; `services/answerMatch.ts` folds harakat
   and hamza/taa-marbuta spellings and checks words only — never
   pronunciation, never scored, Try again / Show answer / Skip always there,
   free pass after 3 misses. No recogniser → record-and-compare with the model
   answer in the same chat. OpenAI is deliberately not used. CL6 has 3 turns.
   Verified: schema tests (reject heard-only model answers, unknown phrases,
   turns with nothing to check), 11 matcher tests, Google's recogniser on the
   API 34 emulator fed the CL6 clips scored 8/8 (network; the emulator has no
   offline Arabic pack), and a walk-through of wrong → show answer → correct →
   all three turns → mission, Urdu mirroring and the fallback. The native
   module needs an app release (manifest `<queries>` for the speech service
   added by hand — the android/ folder is tracked). Both pre-release items are
   closed (2026-09-23): the privacy policy (`Docs/privacy-policy.html` and
   warsh.app/privacy) now says spoken answers go to the device's speech service
   (Google on Android) and never to Warsh, and the owner tested real-voice
   answers on a phone.
3. ~~**Speak mic re-prompt on the Tecno**~~ — **verified on hardware
   2026-09-17** on the Play-installed 1.0.11. The owner's account is on
   Chapter 2, so the check used a throwaway production account placed at
   `KNOWS_LETTERS` (Chapters 1-3 skipped by placement, which leaves Ch 3
   lessons openable as "Review lesson"), deep-linked via
   `warsh://lessons/ch03-l05/play`. With `RECORD_AUDIO` revoked by `pm
   revoke`, Listen first -> Speak showed the "Speaking practice - Enable
   microphone" sheet, then the system "Allow Warsh to record audio?" prompt,
   and after "While using the app" recording started at once with the live
   level meter - the phrase was never skipped. The throwaway was deleted
   (`DELETE /api/users/me` -> 200, its token 401 afterwards) and the app
   dropped cleanly to the login screen. The `Reminders` channel and both
   reminder alarms were already confirmed on 2026-09-16. Two side findings
   from the run, both fixed in `971b720` the same day: a brand-new account
   was greeted with the "Your streak ended" modal on first Learn-tab load
   because `warsh_last_streak` / `warsh_streak_ended_shown` /
   `warsh_freeze_banner_shown` were device-global (now suffixed with the
   user id like the onboarding keys; ships with the next Android build, live
   on app.warsh.app); and `/api/auth/register` let an unknown `goal` reach
   the Prisma enum insert and 500 (now 400 `bad_request`, verified on
   production after deploy).
4. **Restore Credentials on real hardware — cloud-backed key confirmed
   (2026-09-16):** the Tecno registered a production `RestoreCredential` at
   21:43 PKT (one minute after the Play install) with `cloudBackup: true`
   and transports `internal, hybrid` — the E2EE path Credential Manager
   documents, not the device-only fallback the emulator took. The owner's
   sign-out at 22:07 set `revokedAt` and the re-sign-in registered a fresh
   key, so revocation holds on hardware too. Still open: a real
   device-to-device transfer - needs a second phone, nothing else can close
   it (re-confirmed 2026-09-17) - see P0 #10.
5. ~~**Memory thresholds (Workstream B)**~~ — **done 2026-09-23** (owner:
   mark it done if nothing is wrong). Android vitals for 36 (1.0.12) still has
   no measured memory, crash or ANR data at 25 installs, so nothing is over any
   threshold; the two "Memory usage" cards are static-scan recommendations
   (bitmap downsampling inside a library, and the R8/AGP 9 item settled in #1).
   The local profile (P0 #11) sits at about 6 % of Google's thresholds.
6. Discussion items — all three settled with the owner on 2026-09-16:
   - ~~Play's edge-to-edge recommendation~~ — accepted as permanent noise.
     The inset defects were fixed in 1.0.10 and verified on the Tecno; the
     remaining Play warning names APIs called only inside React Native,
     react-native-screens, Expo and AndroidX (see P0 #6), which cannot be
     cleared at app level while those libraries support Android < 15. No
     deadline, does not block releases. Revisit only if Play attaches one.
   - ~~Refunded *subscriptions* keep entitlement until the next lazy refresh~~
     — settled 2026-09-16, no code change. The device caches no entitlement:
     every gated route checks the row per request and the Learn tab re-reads
     status on each load, so a refund is enforced on the next tap once the
     RTDN lands (~1 s, verified 2026-09-14). The only remaining window is a
     push Pub/Sub never delivers, bounded by the daily reconcile at ≤24 h.
     Closing that needs either hourly crons (Vercel Pro; the team is on
     Hobby, which caps crons at once a day) or a `subscriptionVerifiedAt`
     column with per-subscriber Google polling — both judged more than the
     exposure is worth. Revisit only if a refund abuse case actually appears.
   - ~~Noor rate limits rely on database message counting~~ — settled
     2026-09-16: `/api/chat` now has a burst limit (`068508b`, see the
     rate-limiting paragraph below). A global spend ceiling is deliberately
     not added until real traffic shows it is needed.
7. ~~**"New or updated lesson" notice for finished chapters**~~ — **built
   2026-09-23** (Pen section 20 revised; owner waived the approval gate).
   Server: a lesson published into a chapter after the learner finished it no
   longer blocks progression (`findLessonsAddedAfterFinish` in `lib/course.ts`:
   every lesson still outstanding went live after their last finish in that
   chapter); the chapter reads honestly incomplete (8/9), the lesson stays open,
   later chapters stay unlocked, and completing it pays no second chapter bonus.
   `Lesson.addedAt` / `Lesson.contentUpdatedAt` are stamped by a database trigger
   (migration `20260923120000`), so Studio, promote scripts and sync all set
   them; lessons live before the migration keep `addedAt` NULL and behave
   exactly as before. `GET /api/chapters` returns `lessonNotices` (new lessons
   in finished chapters, content changes to completed lessons, since
   `User.lessonNoticesSeenAt`) and per-lesson `isNew` / `isUpdated`;
   `POST /api/progress/lesson-notices` marks them seen. App: one non-blocking
   sheet on the Learn tab (Take a look / Later), New and Updated badges in the
   lesson list. `content:backfill-new-lessons` is no longer needed for new
   lessons. The CL labs of 2026-09-23 are seeded as new (ch05-cl07, ch09-cl05,
   ch10-cl06, ch11-cl06) and updated (ch03-l05, ch07-l05). Verified on staging
   (API walk-through + web UI).
8. ~~**Owner device test of 1.0.13 before any Play build**~~ — the owner tested
   the labs and Answer it on a real phone (2026-09-23) and asked for the Play
   build to follow the work above automatically. **1.0.13 (37) submitted to Production
   2026-09-23**: release gate passed (fixtures, Urdu audit, backend build, app
   lint + tsc, `verify:release-api-url`, `verify:play-signing`); the matching
   APK was smoke-tested on the API 34 emulator against production (Learn tab,
   Indo-Pak tajweed, Urdu translation under the page, page swipe, a Chapter 72
   lesson). Play: full rollout, 12,309 phones supported (no device loss),
   22.6 MB for new installs; in review.

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
   a Sentry error. **Exercised with real voids on 2026-09-14 (license-tester
   account, production API):** (a) a yearly renewal order refunded from Order
   management with "Remove entitlement" — Google sent a `subscription` RTDN
   that expired the row within ~1 s of the refund and then a `voided_purchase`
   RTDN that the handler treated as an idempotent no-op ("already expired");
   (b) a Noor pack bought with the "Test card, approves then charges back"
   instrument — the chargeback arrived ~8 min later as a `voided_purchase` and
   the handler clawed back `balanceFrom: 18 → balanceTo: 0` (floored, the two
   spent credits were not charged against the next pack); (c) the reconcile
   cron run by hand afterwards reported `found: 1, applied: 1` and the replay
   was a no-op on the already-expired row. Both push and pull paths hold.
   Cosmetic: the cron request shows at `error` level in Vercel logs only
   because `pg` prints its SSL-mode deprecation warning to stderr; the
   response is 200.
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
4. **Age check shipped: ages 13–17 and adults (owner decision 2026-09-11,
   implemented and deployed the same day).** Pen section 21 was approved and
   built. Backend (`api.warsh.app`, migration applied to production):
   `User.dateOfBirth`, `lib/age.ts` (13 minimum, minor under 18, PKT calendar
   day), `/api/auth/register` and `/api/auth/google` refuse under-13 with
   `403 age_not_permitted` before writing a row, a new Google identity without
   a date gets `400 age_check_required` and the client retries with the same
   token, `PATCH /api/users/me` accepts the date once for legacy accounts, and
   Noor's system prompt carries a teen-safety line for minors. App: neutral
   `(auth)/age-check` (day/month/year, no defaults, threshold never shown),
   refusal state, in-app prompt for accounts with no date on next launch,
   Mixpanel fully suppressed for minors; every request now sends
   `X-Warsh-App-Version`. Verified on the emulator against the staging DB:
   under-13 refusal, 15-year-old sign-up with `isMinor: true`, legacy account
   prompted (Urdu RTL), backend rules by curl. Privacy and Terms carry a
   younger-learners section (live on warsh.app). Not exercised live: the
   Google-sign-up retry (needs a Google account on a device); it shares the
   register code path. Fixed 2026-09-11 (`e51801d`): a session whose persisted
   user still had `dateOfBirth: null` after the date was set from another device
   got `409 date_of_birth_locked` and bounced between the tabs and the age check
   forever; the screen now refreshes the profile before leaving. **Legacy window closed (2026-09-14):** while 1.0.8 was the live
   build, requests without the version header could sign up without a date.
   1.0.9 went live on 2026-09-12, so `ALLOW_LEGACY_SIGNUP_WITHOUT_DOB` in
   `lib/age.ts` is now `false` — every sign-up without a date is refused with
   `400 age_check_required`; existing dateless accounts are still prompted on
   next launch. Play distribution stays worldwide (177 countries); revisit
   EU/EEA, South Korea and Vietnam exclusion if EU sign-ups become meaningful.
5. **Physical-device QA run (2026-09-14) on a Tecno KF8, Android 11, 720×1600
   at 320 dpi, the Play-installed 1.0.9, production API, owner account.**
   `VERB_PATTERN` (ch09-l05) and `AUDIO_RECOGNITION` (ch04-l01) render, grade
   and complete server-side; `WRITE_ARABIC` and `HARAKAH_PLACEMENT` exist in the
   schema only — no published lesson uses either, so there is nothing to test
   until content does. Defects found, all fixed in `17abf0c`: (a) both
   `AUDIO_RECOGNITION` clips 404 — `lib/audioTargets.ts` had no case for the
   type, so the generator never made them and content-health never missed them;
   (b) back-to-back `MATCHING` exercises opened scrolled down with the first card
   hidden (native ScrollView reused across exercises); (c) the completion screen
   showed "+10 points" when the server awarded 0, and a lesson skipped by
   placement earned nothing when completed later; (d) on a 360 dp phone the goal
   card broke "Complete" mid-word and the streak pill read "1 days". Content
   observations (ch09-l05 Urdu gloss inconsistencies and unplayed per-row
   `audio_url`s; SP1's empty context screen) are folded into the owner's
   curriculum rebuild (P1 #2) and will be handled when it reaches Chapter 9.
   The share card's "511 words learned" after one lesson is
   fixed (2026-09-14, `cc0900a`, deployed): every Core 500 word carries
   `chapterIntroduced = 1` because the column is not nullable, and lesson
   completion seeded the whole chapter's words into the bank, so the first
   Chapter 1 lesson banked all 500 Core words plus the 11 curriculum ones.
   Seeding now excludes Core words (they enter through their set-complete route,
   whose upsert would otherwise have found a pre-seeded row and never marked
   them known). The 1,000 placeholder rows on the two affected accounts — none
   ever reviewed or favourited — were deleted from production; the owner's bank
   now reads 11. The word-detail screen still says "Introduced in Chapter 1" for
   a Core word; cosmetic, untouched.
6. **R2 consolidated onto the Warsh bucket (2026-09-14).** Production
   `R2_PUBLIC_URL` had pointed at the Warsh-owned bucket (`pub-66b79e…r2.dev`)
   since the 2026-08-13 repoint (`68e365a`), but `warsh-backend/.env` still held
   the personal bucket (`pub-3da71e…`), so every local upload since — the
   2026-09-10 word-media restore, the discover-image compression, today's clip —
   had landed in the old bucket: 34 lesson clips 404ed in production and all
   word media URLs pointed at the personal bucket. Fixed the same day with the
   owner's Warsh-bucket credentials: `scripts/r2-consolidate.ts` copied the
   1,561 referenced objects old → Warsh (local copy kept in
   `warsh-backend/exports/r2-personal-backup-2026-09-14/`, 53 MB, gitignored),
   re-pointed 920 word audio + 582 word image URLs, 17 lessons and 17 fixtures,
   and a HEAD sweep of all 4,440 media URLs production now references — every
   database reference plus every catalogue clip — returned 200 on the Warsh
   host. `content:check` passes. Local `.env` now targets the Warsh bucket, so
   future uploads land where production reads. Nothing was deleted from the
   personal bucket; it is no longer referenced and can be retired whenever the
   owner chooses (its API token was replaced, so this machine can no longer list
   it — a full listing needs the owner's old token or the dashboard).
   **Retired 2026-09-14.** Before deletion: zero production rows in any text/json
   column and no repo file (other than `scripts/r2-consolidate.ts`'s own
   constant) referenced `pub-3da71e`. The owner signed into the personal
   Cloudflare account (`e408f8cd…`) and the bucket was deleted there; the
   account's R2 overview now lists no buckets and 0 B, and the old public host
   answers 401 while the Warsh host still serves the same key 200. Cloudflare's
   own overview text confirms the free tier: 10 GB storage, 1M Class A and 10M
   Class B operations per month; both accounts show "$0.00 — no billable usage".
7. **Warsh bucket pruned to 170 MB (2026-09-14, owner target: stay well under
   the R2 free tier).** Before: 8,665 objects, 1,325 MB, of which only 4,440
   objects / 168 MB were referenced by any DB column, fixture, or catalogue key.
   Deleted 4,082 objects (1,154 MB): 1,237 stale-id word images (824 MB, from
   pre-seed generations), 595 raw 1–2 MB `images/discover/*.png` mirrors (268 MB)
   that `images:upload` wrote but nothing read — the live Discover refs are the
   23 `.webp` — 475 May-2026 beta octagon cards (36 MB), and 1,775 stale-id word
   clips (26 MB). Every deleted image was first proven byte-identical (MD5 =
   R2 ETag) to a file under `warsh-backend/exports/image-tests/` (the 738
   transparent PNG originals, 944 MB, plus `card-calligraphy-upload-ready/`),
   except 180 small re-encoded word JPGs that were downloaded to
   `exports/r2-words-orphans-2026-09-14/` (15 MB) before deletion. After: 4,583
   objects, 170.5 MB; all 4,440 referenced keys still listed and every word
   image/audio URL (1,164) HEADs 200. Left alone on purpose: 125 catalogue
   clips + 17 vocab clips (2.4 MB) no current lesson text hashes to, because
   `/api/audio/catalog` serves any text by hash. `images:upload` no longer
   mirrors to `images/discover/` and refuses a source over 200 KB, so re-running
   it against the raw originals cannot re-inflate the bucket.
   The high-quality originals live only on this machine (`exports/` is
   gitignored) — they are the source for any future re-upload, and must never go
   into R2 uncompressed.

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

1. **Over-declared Android permissions removed (2026-09-11, shipped in 1.0.9).**
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
2. **Raw audio never leaves the device — proven on the wire (2026-09-11); the
   Data safety form has three discrepancies to fix.** Emulator run with the
   emulator's own packet capture (`-tcpdump`, Wi-Fi disabled so traffic crossed
   the captured `eth0` path), debug APK against the local staging backend over
   `10.0.2.2:3000` (plain HTTP, so request bodies are readable), Chapter 3
   `SPOKEN_PHRASES` lesson `ch03-l05`, all six phrases recorded. Findings:
   - Each recording is an AAC file in app-private `cache/Audio/` (60–122 KB),
     played back locally and deleted on "Done"; the directory is empty
     afterwards. Between Speak and Done the only flows were an R2 *download* of
     the original clip (841 B out) and the Metro dev websocket (absent in
     release). Nothing outbound approached the recording's size.
   - `POST /api/lessons/ch03-l05/complete` body on the wire was 43 bytes:
     `{"exerciseResults":[],"phrasesCompleted":6}`.
   - Code agrees: `ShadowRepeatExercise.tsx` makes no network call, and no
     backend route accepts client audio (`/api/audio/catalog` is GET-only; the
     admin upload routes are Studio-only).
   - The in-app mic prompt already states "Your recording stays on this device.
     We don't upload, store, or analyse it." — now backed by measurement.

   Published form (read from the Console the same day): collects Email, User
   IDs, Purchase history, Other in-app messages, Voice or sound recordings, Crash
   logs, Diagnostics, App interactions, Device or other IDs; no data shared;
   encrypted in transit; account creation "Username and password"; delete URL
   `https://warsh.app/delete-account`. Discrepancies against measured behaviour:
   - **Name is collected but not declared** — `/api/auth/register` stores
     `name`; add "Name" (App functionality, Account management).
   - **Date of birth is collected but not declared** — the age check (P0 #4)
     stores `dateOfBirth`; add "Other info" (App functionality, Fraud
     prevention/security/compliance).
   - **Voice or sound recordings is declared but never transmitted** — Play's
     "collected" means sent off the device; on-device-only processing is exempt.
     Remove it, or keep as a deliberate over-declaration.
   - **Account creation should also tick "OAuth"** — Google sign-in exists.
   - Mixpanel was geolocating events from the IP (its default), which is
     "approximate location". Disabled in `services/analytics.ts`
     (`setUseIpAddressForGeolocation(false)`, `f42a0e5`); until that build ships,
     the live 1.0.8 build still does it. Mixpanel, Sentry and OpenAI are
     processors acting on Warsh's behalf, so "no data shared" stands.
   All four applied in the Console and submitted for review on 2026-09-11
   (owner-approved): Name added (App functionality, Account management), Other
   info added for date of birth (App functionality, Fraud prevention/security/
   compliance), Voice or sound recordings removed, OAuth ticked. **Published**
   (submission #19 "App Content", status Published — confirmed in Submission
   activity on 2026-09-14). The Data safety form now matches measured behaviour.
3. **Retention: nothing to enforce (checked 2026-09-12).** The published
   policy (`Docs/privacy-policy.html` §6) commits to no fixed period — records
   are "retained while your account is active" and deleted with the account,
   which the verified deletion path (#4) already honours. No retention job is
   owed until the policy publishes a period.
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
   and `ur.ts` (shipped in 1.0.10; dialog text confirmed on the Tecno
   2026-09-15). Not covered: whether OpenAI, Mixpanel
   or Sentry retain anything server-side after deletion; that is a policy
   disclosure, not a Warsh deletion step.
5. **Physical-device mic, notifications and sharing verified (2026-09-14, same
   Tecno KF8 run as P0 #5 above).** Mic: the SP1 record → level meter → playback
   → compare → done loop works on real hardware. One defect fixed (`17abf0c`):
   Android 11 had auto-revoked `RECORD_AUDIO`, the app trusted its cached
   "granted" flag, `startRecording()` threw and Speak skipped the phrase with no
   prompt; it now asks the OS first and re-prompts. Notifications: no runtime
   permission on Android 11; `dumpsys alarm` shows the 20:00 daily reminder and
   09:00 word-of-day alarms scheduled, the expo alarm fired at 09:00 today and
   yesterday, and `dumpsys notification` records one Warsh post on each day —
   delivery works. Polish fixed 2026-09-15 (ships with the next build): the
   channel was only created inside the permission prompt, so any device that had
   already granted skipped it and Android filed the reminders under
   "Miscellaneous"; `services/notifications.ts` now (re)creates the named
   `Reminders` channel on every scheduling path and every alarm targets it, and
   all reminder/milestone copy goes through `notifications.*` i18n keys (rebuilt
   on an interface-language change). **Not in 1.0.10** — the bundle was built
   at 11:33 on 2026-09-15 and the fix (`8d3b5e1`) landed at 12:04; confirmed on
   the Tecno the same evening, where the Play-installed 1.0.10 still registers
   only the `Miscellaneous` fallback channel while both alarms (09:00, 20:00)
   are scheduled. Ships with 1.0.11; verify the `Reminders` channel on the Tecno
   then (`expo-device` skips the whole path on the emulator). **Mic re-prompt
   verified on the emulator 2026-09-16** (debug build against staging, SP1
   `ch03-l05`): with `RECORD_AUDIO` granted, Speak records; after
   `pm revoke`, reopening the lesson and tapping Speak shows the "Speaking
   practice - Enable microphone" sheet, then the system prompt, then recording
   resumes - the phrase is never skipped. Sharing: the system chooser opened with the rendered stats
   card previewed (the FileProvider URI resolves from another process); not sent
   to any contact.
6. **Android 15 edge-to-edge: Play warning traced to dependencies; three real
   inset defects fixed (2026-09-11, shipped in 1.0.10; verified on the Tecno
   KF8 2026-09-15 — dark status icons on cream, light on the You tab, tab bar
   clear of the gesture area, sheet scrim reaching the status bar).** Play's
   "deprecated APIs or parameters for edge-to-edge" recommendation on release 32
   lists `Window.get/setStatusBarColor`, `Window.get/setNavigationBarColor` and
   `LAYOUT_IN_DISPLAY_CUTOUT_MODE_{DEFAULT,SHORT_EDGES}`. Disassembling the
   release APK's DEX shows every caller is a library — React Native 0.81
   (`WindowUtilKt`, `StatusBarModule`), react-native-screens
   (`ScreenWindowTraits`), expo-modules-core, AndroidX `activity`/`core`/
   `splashscreen` (Google's own `EdgeToEdge` helpers) and Material — all behind
   `SDK_INT` guards that Play's static scan cannot see; zero references under
   `com.warsh.app`. It is a recommendation with no deadline and cannot be cleared
   at app level while these libraries support Android < 15, so it is accepted.
   Running the release APK on the Android 15 AVD (`Warsh_API_35_16KB`) did find
   real defects, now fixed: (a) `StatusBar style="light"` painted white icons on
   the cream screens — invisible clock/battery everywhere except the You tab;
   root is now `dark` and the You tab flips to `light` while focused; (b) the tab
   bar's fixed `height: 64` discarded React Navigation's bottom inset, so labels
   sat under the gesture pill and, with 3-button navigation, the system buttons
   covered the tabs entirely — `insets.bottom` is added back; (c) none of the 16
   transparent `Modal`s set `navigationBarTranslucent`, so scrims stopped short
   of the status and navigation bars — all now set both, and the three bottom
   sheets that lacked it pad by `insets.bottom`. Verified on the Android 15 AVD in
   gesture and 3-button modes via Metro against production. **Large-screen and
   scaling pass done on emulators (2026-09-12)** — 7.6" fold-in foldable and
   Pixel Tablet AVDs on Android 15, plus the Pixel 7 AVD at "largest" display
   size (540 dpi) and 130 %/200 % font scale, debug build against the local
   staging DB. Three real defects, all fixed and verified in the same run:
   (a) folding, unfolding or entering split screen changed `smallestScreenSize`,
   which was not in the activity's `configChanges`, so Android recreated the
   activity, React Native mounted a fresh root and the learner was thrown out of
   a running lesson onto the Learn tab — `smallestScreenSize` is now handled
   in-process (`AndroidManifest.xml`) and the lesson survives fold → unfold →
   split screen with the layout reflowing; (b) the preview screen's hero art
   kept its full height and the horizontal slide list, the only shrinkable
   child, swallowed the slide title and body on short windows (large display
   size, small phones) — the art now yields the height the copy needs
   (`auth-options.tsx`); (c) an English discover explanation that opens with the
   Arabic word ("هَذَا means 'this'…") was laid out right-to-left by Android's
   first-strong rule, stranding the full stop on the left — the paragraph
   direction now follows the meaning language via a Unicode direction mark
   (`writingDirection` is iOS-only). Observed and accepted: on tablets and in
   split screen the portrait lock letterboxes the app in a centred column with
   Android's own "See and do more" tip (plan §D2, product decision); a font-scale
   or display-size change still recreates the activity, which resets navigation
   (rare mid-lesson, left as is); at 200 % on the folded 884-px width the
   discover beat needs a scroll to reach Next. Not reproduced: one SIGSEGV in
   ART on the first launch after switching to 200 %, gone on every relaunch.
   Emulator notes: fresh AVDs on the Android 17 (API 37) image never reach `adb`
   on this host, so the pass ran on API 35; Metro's file watcher misses edits
   under `app/(app)/lessons/[lessonId]/` and needs a restart per change. Landscape
   remains locked (plan §D2). The fuller plan is
   `Docs/proposals/android-quality-2027-implementation-plan.md`; DEX-optimization
   enforcement begins February 2027. All three fixes ship with the next Play
   upload.
7. **Play Console privacy and deletion URLs confirmed (2026-09-12).** App content →
   Privacy policy holds `https://warsh.app/privacy` (last edited 2026-08-19) and the
   Data safety form's "Delete account URL" holds `https://warsh.app/delete-account`;
   account-creation methods are declared as username+password and OAuth, which
   matches the app. All four public legal routes returned 200 on 2026-09-09. The
   account-level notice "Ensure your apps are registered for Android developer
   verification by Sep 30, 2026" needs no action: the Android developer
   verification page shows `com.warsh.app` **Registered** (2 keys, since
   2026-05-29) and the Identity tab populated from the developer account
   (checked 2026-09-14). The notice is Google's blanket reminder to every
   account.
8. **IAP lifecycle: grace period, account hold and pause are handled in code
   (reviewed 2026-09-12); only the live Play exercise remains.** Backend:
   `mapGoogleSubscriptionState` covers every `subscriptionsv2` state, access is
   `active`/`canceled`/`in_grace` inside the paid period only (Google extends
   `expiryTime` through the grace window), and `on_hold`/`paused`/`pending`
   never grant access. Every RTDN type other than `REVOKED` re-reads the
   snapshot, so `RECOVERED`, `RESTARTED` and `IN_GRACE_PERIOD` need no special
   casing. Gap closed the same day: `refreshLapsedStoreSubscription` only
   re-read rows that still claimed access, so a recovery whose push was dropped
   left an on-hold/paused subscriber locked out until they happened to reach the
   paywall's auto-restore. `/api/subscription/status` now also re-reads
   suspended rows (`includeSuspended`, bounded to that one read), and
   `/api/progress` — which the Learn tab takes its lock banner from — now runs
   the lapsed refresh too, so a missed renewal no longer shows "expired" on the
   Learn tab. Unit-tested in `tests/subscription-refresh.test.ts`. **Learn-tab
   subscription health banners shipped (Pen section 23 approved and built
   2026-09-12).** `components/SubscriptionBanner.tsx` shows one banner for
   `in_grace` (warm, with the date Google stops retrying), `on_hold` (dark
   lock), `paused` (sage) and `pending` (quiet, no CTA); the CTA opens Play's
   subscription page via the deep link shared with Manage subscription
   (`constants/subscription.ts`). On hold/paused the Continue card, journey
   row and Tadabbur card lock and route to Manage subscription, and every
   402 handler (lesson, Tadabbur, Noor) now asks `subscriptionRequiredRoute()`
   so a suspended paying subscriber lands on Manage subscription, not the
   paywall. "expired" is unchanged. Verified on the emulator against the
   staging DB in Urdu RTL for all four states plus the hold → Manage
   subscription routing from the hero and from Noor's 402. Shipped in 1.0.9.
   **Full lifecycle driven from a Play license-tester account on 2026-09-14**
   (emulator `Warsh_API_34`, release APK, production API, tester
   `trywarshapp@gmail.com`, throwaway Warsh account deleted afterwards; every
   state confirmed against Google via `play-diagnostics` and against the Vercel
   RTDN log, not read off the phone):
   - *Grace → hold → recovery.* Buying with "Test card, always approves" and
     then switching the subscription's payment method in the Play Store to
     "always declines" made the 5-minute test renewal fail: `in_grace` RTDN at
     +5 min, `on_hold` at +10 min, each landing within ~5 s and each written to
     the row by push alone (no `refresh=1`). Fixing the card in Play produced
     `RECOVERED` → `active` within a minute, including from a row the admin
     "revoke" action had set to `expired` (the paywall's auto-restore cannot do
     that one: Play's `queryPurchases` never returns an on-hold subscription).
     Server gating on hold: lesson, chat, Tadabbur and audio catalogue 402,
     vocabulary 200. App: grace banner with the retry date, hold banner with
     the hero locked, Noor's 402 lands on Manage subscription showing ON HOLD.
   - *Pause.* "Pause payments" in Play → `paused` at the next renewal, sage
     banner, "Resume in Google Play" deep link → resumed early → `active`.
   - *Plan switch — was broken, fixed.* "Change plan" → "Switch to Yearly"
     failed with `DEVELOPER_ERROR` "Invalid arguments provided to the API"
     before the Play sheet opened. Google only accepts `CHARGE_FULL_PRICE` and
     `WITHOUT_PRORATION` for a base-plan switch *within one subscription*;
     the app sent `WITH_TIME_PRORATION`, so plan switching had never worked.
     `services/iap.ts` now uses `WITHOUT_PRORATION` (3), which is also the
     base plans' Console default. Verified on the rebuilt APK: Play sheet shows
     "first charge will occur on <next billing date>", new token acknowledged,
     row re-keyed to `yearly`, `supersededToken` = the monthly token.
   - *Declined card — wrong copy, fixed.* Play returns `BILLING_UNAVAILABLE`
     for a declined payment; both purchase handlers folded it into "In-app
     purchases are not available on this build". They now say the payment did
     not go through and point at the Play Store payment method.
   - *Cancel* → `canceled`, `willCancel: true`; *expiry* (Google's test-renewal
     cap) → `expired` by RTDN.
   - Observed, by design: while the seven-day trial window is still open a
     suspended store state is masked — `subscriptionStatus` reports `trial`,
     access stays, no banner (`lib/subscription.ts`: nothing cuts the trial
     short). It cannot happen with real 30-day renewals; it only showed here
     because test renewals are five minutes.
   - Observed trap: bursts of API polling from one IP trip Vercel's System
     Mitigations (Security Checkpoint 403) for ~14 min; the app on that IP
     shows "Could not load your subscription" meanwhile.
   Still open: none of the lifecycle. Purchase (monthly and yearly), restore
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

9. **R8 release optimisation shipped in the 1.0.11 build (Workstream A,
   2026-09-16).** `android.enableProguardInReleaseBuilds=true` +
   `enableShrinkResourcesInReleaseBuilds=true` with
   `proguard-android-optimize.txt`. Keep rules (`app/proguard-rules.pro`) are
   limited to what broke or cannot be traced: the whole Expo Kotlin runtime
   (`expo.modules.**` - records are built through kotlin-reflect, and the
   first R8 build rendered every expo-image prop as "Cannot create a record of
   the type 'expo.modules.image.records.ImageTransition?'", so no illustration
   drew), Nitro core (`com.margelo.nitro.**`, JNI-instantiated), Sentry and
   `com.warsh.app.**`; everything else relies on the libraries' consumer rules
   (React Native, Hermes, expo-image/Glide, react-native-iap,
   nitro-google-signin, Play Core, kotlin-reflect). Gradle needed
   `-Xmx4096m -XX:MaxMetaspaceSize=1024m` (R8 + lint-vital exhausted 512 m).
   The Sentry Android Gradle plugin (5.8.0, auto-installation off) uploads the
   mapping to `warsh-mobile`; it needs `SENTRY_AUTH_TOKEN` in the shell (an
   org token created 2026-09-16, stored as a user environment variable on the
   build machine, never in Git), and `verify:release-api-url` now fails any
   bundle without the R8 mapping in `BUNDLE-METADATA/` or without the ProGuard
   UUID in `assets/sentry-debug-meta.properties`. Regression matrix on the
   optimized APK against production (emulator, 2026-09-16): cold/warm launch,
   password login, Google account sheet (Nitro), lesson with illustrations and
   ayah/word audio, exercises, Vocabulary, Noor reply + milestone, Settings,
   subscription screen with live Play prices (react-native-iap), sign-out - no
   `ClassNotFound`/`NoSuchMethod`, no Expo record errors. `start-warsh.ps1` now
   rebuilds when `build.gradle`, `proguard-rules.pro` or `gradle.properties`
   change. Play's report for the uploaded bundle: Obfuscation 75 %, DEX 10.6 MB,
   Optimization/Shrinking not yet computed (open item #1).
10. **Restore Credentials / Zero-Tap Sign-In implemented (Workstream C,
   2026-09-16; Play enforcement April 2027).** Design: a restore key is a FIDO2
   credential the device creates silently after sign-in; Google Backup or a
   device-to-device transfer carries it to the next phone, where the app signs
   the server's challenge on the splash, before routing, and receives an
   ordinary Warsh JWT - nothing about the token is backed up (it stays in
   SecureStore, which does not transfer). Backend: `RestoreCredential` (one row
   per device, `revokedAt` kept for audit) and `RestoreChallenge` (one-time,
   5-minute) tables; `lib/restoreCredential.ts` on `@simplewebauthn/server`
   with rpId `warsh.app` and the calling app as origin
   (`android:apk-key-hash:` of the Play app-signing, upload and debug
   certificates - no Digital Asset Links needed for restore keys);
   `POST /api/auth/restore/register/options` + `/register` (authenticated),
   `POST /api/auth/restore/options` + `/verify` (unauthenticated, rate-limited
   20/10 per minute), `DELETE /api/auth/restore` (sign-out revocation);
   password change and reset revoke every device's key alongside the JWTs;
   account deletion cascades. Unit tests (`tests/restore-credential.test.ts`, a
   software ES256 authenticator): success, challenge replay, expiry, wrong
   purpose/user, unknown key, revoked key, deleted account, wrong challenge,
   unknown signing certificate, cloned-key counter replay, cross-account claim.
   Android: `RestoreCredentialsModule.kt` over Credential Manager 1.6.0
   (cloud key first, documented `E2eeUnavailableException` fallback to a
   device-only key, `NoCredentialException` -> "none");
   `services/restoreCredentials.ts` registers once per device from the app
   layout, attempts the silent restore from `app/index.tsx` with an 8 s cap,
   and `clearSession` revokes server-side then clears the local key (every
   sign-out path - You tab, Settings delete, age-check, dead session - goes
   through it). Verified on staging (debug build, emulator): sign in -> key
   registered (device-only, the AVD has no E2EE backup); wipe SecureStore +
   AsyncStorage, relaunch -> signed in silently on the Learn tab
   (`/api/auth/restore/verify 200`); sign out -> `DELETE` revokes, Block Store
   cleared, next launch stays on onboarding. On production the release APK
   registered a key for the QA account and the account's deletion cascaded it.
   Migration applied to staging and production (`20260916120000`). Still owner
   hardware only: a cloud-backed key and a real device transfer (open item #4).
   Digital Asset Links, a BackupAgent tier and any new screen were not needed
   (silent flow, existing login as fallback), so the Pen gate was not triggered.
11. **Memory thresholds (Workstream B) - local baseline taken, Play data still
   absent (2026-09-16).** Play Console -> Android vitals -> Memory shows "-" for
   anonymous RSS + swap and bitmap P50/P90 (install base too small), so the
   official status stays unverified per the plan. Local profile of the 1.0.11
   optimized APK against production on the API 34 AVD (`/proc/<pid>/status`
   RssAnon + VmSwap, `dumpsys meminfo`): cold launch signed out 106 MB; Learn
   tab 119; Vocabulary 134 (115 after scrolling the list); Noor with a reply
   124; subscription and plans screens 129-130; backgrounded 126; cached after
   `am kill-all` 125. Java heap never exceeded 24 MB and native heap 50 MB, so
   bitmap memory is trivially under 200 MB. Google's thresholds are 2 GB
   foreground / 1 GB background on the 4 GB tier and 200 MB / 400 MB for
   bitmaps in background / cached - Warsh sits at roughly 6 % of them. A
   `Warsh_API_34_4GB` AVD (Pixel 7, 4096 MB, Play Store image) was created for
   repeat runs. Large-screen (D2): the owner's decision to keep portrait locked
   stands and is recorded as final; Play's "remove resizability and orientation
   restrictions" line remains a recommendation with no deadline.

### P1 — content quality and launch polish

1. **Illustration coverage is complete: 920 of 920 published words (2026-09-16).**
   History of how the gap closed, kept for the record. Word images were
   restored on 2026-09-10 by re-running `images:upload` against
   `exports/image-tests-compressed`; it matches a source file to a word by
   `transliteration` and covered 582 words. The remaining 338 have no source file at
   all and render without one, and 47 source files match no word. Decide whether the
   gap is filled, and with what. Checked again 2026-09-14 after the R2 prune: all 582
   links resolve; no earlier bucket generation held an image for any of the 338
   (every old object was a re-encode of a local source). Twelve of the 338 share an
   ASCII slug with a source file for a *different* word (nahar day/river, shay
   tea/thing, alim scholar/painful, …) and are correctly left blank. Three are
   duplicate entries of a word that does have an image — `jā'a` (he came) vs
   `jāʾa` (to come), `qāma` ×2, `ātā` (to give) vs `a'ṭā` (he gave) — and could
   reuse the twin's illustration — done 2026-09-14 on the owner's instruction
   (object copied to the word's own key, all three HEAD 200), so coverage is
   585 of 920. **Owner is drawing the rest (2026-09-14):** the full list — 335
   words, 16 curriculum + 319 Core 500, with an exact filename per word and the
   database id — is `Docs/vocabulary-illustrations-needed.md` (+ `.csv`). When
   the PNGs arrive: compress with `scripts/compress-images.cjs` to the ≤100 KB
   set, upload keyed by the CSV's `word_id` (not by slug matching — two pairs
   share a slug and meaning), HEAD every new URL, then update this count.
   **2026-09-15: the 16 curriculum PNGs arrived** in
   `exports/image-tests/curriculum-chapters-1-5/` and shipped via
   `images:upload --manifest=../Docs/vocabulary-illustrations-needed.csv`
   (the new flag keys on `word_id`; slug matching hit rajā/rajā' three ways).
   All 16 URLs HEAD 200; coverage was then 601 of 920.
   **2026-09-16: Core 500 Sets 1–70 arrived** (201 PNGs, 1254 px, in
   `exports/image-tests/core-500-sets-*/`, gathered into
   `core-500-sets-1-70-src/`), compressed to
   `exports/image-tests-compressed/core-500-sets-1-70/` (all ≤100 KB) and
   shipped the same way. All 201 URLs HEAD 200; coverage was then 802 of 920.
   **2026-09-16 (later): Core 500 Sets 71–100 arrived** (118 PNGs, 1254 px, in
   `exports/image-tests/core-500-sets-71-100/`), compressed to
   `exports/image-tests-compressed/core-500-sets-71-100/` (203 MB → 9 MB, all
   ≤100 KB) and shipped the same way. All 118 URLs HEAD 200; every published
   word now has an illustration — 920 of 920. Nothing remains on this item.
2. **Curriculum rebuild in progress (owner, in Studio).** The owner is
   rebuilding the curriculum chapter by chapter from Chapter 1; Chapters 1–4 are
   done. **Chapter 5 is implemented in isolated staging (2026-09-16)** from
   `Docs/proposals/chapter-05-content-proposal.md`: eight items in the approved
   order (`ch05-l01/l02/l03`, new `ch05-l06`, `ch05-l04`, new `ch05-l07`,
   `ch05-l05`, new `ch05-test`), fixtures validated, Quran/Urdu audits clean,
   36 new catalogue clips generated, every lesson and the 12-question test
   completed on the emulator in English and spot-checked in Urdu. **Promoted to
   production on 2026-09-16** (`content:promote-chapter-five -- --apply`: 4 updates,
   4 creates, learner progress untouched), `content:check` shows 414/414 in sync,
   baseline recorded, and the R2 audio audit reports 3677/3677 clips present, 0
   missing. Chapter 5 is live. Deviations from the
   proposal (file numbering = display order, STANDARD instead of VERB_PATTERN,
   PLACE_ZARF for "destination", six illustrations still owner-owned) are listed
   at the end of the proposal. The same pass fixed `seed.cjs`, which still loaded
   Chapters 3–4 by their pre-rebuild filenames and would have scrambled titles
   against content on any seeded (staging) database. The Chapter 9–72 review
   and the QA content observations above are absorbed into this pass. After each
   Studio session: `content:check` → `content:export` → commit, and regenerate
   audio for any edited Arabic (`audio:prebuild-catalog -- --from-db`).
3. **Token reconciliation done (2026-09-12).** Every colour literal outside
   `constants/theme.ts` is gone: 30 `rgba()`/hex values across 20 files now route
   through a new role-named `WarshAlpha` set (scrims, gold washes, on-navy tints,
   sage/warning tints) or the palette. Modal scrims are unified at ink 60% (spec-11
   §5.6) and bottom sheets at ink 45%. Six styles used `fontFamily: "Inter"`, a
   name that is not registered with `expo-font` (only `Inter-Regular/SemiBold/Bold`
   are), so they were silently falling back to the system font on Android — the
   Learn stat labels, the desktop-web greeting and the web sidebar; all font
   families now come from `Fonts`. Only the crash screen's `monospace` remains, by
   design.
4. **One commitment moment — shipped 2026-09-12 (Pen section 22, Option A,
   owner-approved).** The onboarding checklist's "Set a daily goal" (minutes/day)
   and the post-streak "Choose your streak goal" (days) were two commitments to two
   numbers, and the first was hollow: `dailyGoalMet` is `todayProgress >= 1`
   whatever the minutes said. Now there is one screen, `streak-commitment.tsx`
   ("Make your commitment"): the daily unit is shown as fixed information ("One
   lesson · about 10 minutes", `constants/commitment.ts`) and the learner picks
   only `streakGoalDays` (3/7/14/30). Reached from checklist step 3 (renamed,
   opens the screen directly; done = server `streakGoalDays != null`, replacing
   the local "goal touched" flag) and, as a fallback, once after a streak
   celebration for anyone with no goal on the server, with "Maybe later"
   (`warsh_commitment_prompt_shown_<userId>` guarantees it is never shown twice).
   Settings collapsed to one "Commitment" section (informational daily-unit row +
   streak-days picker); the Today card reads "1 lesson · about 10 min".
   `updateUserProfile` no longer accepts `dailyGoalMinutes`; the column and the
   `/api/progress` field stay so 1.0.8 clients keep working, and `PATCH
   /api/users/me` still validates it for them. Analytics: `commitment_set`
   `{days, source: checklist|celebration|settings}`. Streak-risk reminder copy is
   unchanged. Verified on the emulator against the local staging DB in English and
   Urdu: checklist → screen → step done; Today card; Settings; celebration →
   "Maybe later" → no second prompt.
5. **Lesson pass/fail is enforced server-side; pass mark is 70% (owner decision
   2026-09-11).** The client sends one boolean per answerable exercise in
   `exerciseResults`; `lib/lessonScoring.ts` computes score and pass/fail
   (`LESSON_PASS_PERCENT = 70`, `requiredCorrect = ceil(0.7 × totalScored)` —
   the same shape `lib/chapterTests.ts` already used), so a client-sent score is
   never trusted. Originally shipped 2026-08-26 (`3979af2`) with a fixed 3-wrong
   cutoff; switched to a percentage so 5- and 15-exercise lessons are held to the
   same standard. `SHADOW_REPEAT` / `SPOKEN_PHRASES` are excluded, and a lesson
   with no scored exercises cannot fail. On fail the route returns
   `passed: false` with `correctCount`, `totalScored`, `requiredCorrect`; no
   progress row, XP, streak or daily-goal credit is written (chapter tests
   additionally record `attempts`), so the chapter stays locked via
   `lib/course.ts`. XP stays at zero until the lesson is actually passed — a failed
   attempt banks nothing. The app shows the retry screen (Pen "Lesson Retry ·
   Proposed Redesign") with the server's `requiredCorrect` and restarts the lesson
   from the beginning. Unit-tested in `tests/lessonScoring.test.ts`.

### Later

- iOS/App Store release
- Automatic pronunciation scoring
- Persistent Noor memory
- Social profiles, leaderboards, or family accounts

Redis-backed rate limiting is **live in production (2026-09-15)**. `lib/rateLimit.ts`
(`f260be5`, 2026-08-26) uses Upstash Redis when credentials are present and falls
back to the in-process limiter otherwise. The Upstash database `warsh-rate-limit`
(Vercel Marketplace, free plan, `iad1`, eviction off, auto-upgrade off) was created
in the `warshapp-projects` team on 2026-09-15 and connected to the `warsh` project
for Production and Preview. The marketplace injects the credentials as
`KV_REST_API_URL` / `KV_REST_API_TOKEN`, so `41dc4a8` made the limiter accept
those names alongside `UPSTASH_REDIS_REST_*`. Verified after deploy: 13 bad
logins from one browser returned `401 ×10` then `429` with `Retry-After: 45`, and
the `warsh-rl:10:60000:login:<ip>` sliding-window key was present in the Upstash
database — the count is global, not per serverless instance. Login, register,
forgot/reset-password, Google sign-in/link and the admin session route all share
it. Redis being unreachable logs an error and degrades to the in-process limiter
rather than failing open.

`/api/chat` joined it on 2026-09-16 (`068508b`) with a burst limit distinct
from the daily quota: 15 messages/min per user and 60/min per IP, checked
before body parsing and any database or OpenAI work. The daily quota bounds
how many calls one account sends to OpenAI per day; nothing had bounded how
fast they arrived, so a credit-pack holder or a script minting throwaway
accounts could saturate the OpenAI concurrency for everyone. The per-IP
ceiling is loose on purpose because Pakistani carriers put many users behind
one CGNAT address. The response is `429` with code `rate_limited`, not the
quota's `too_many_requests`, and the chat screen shows a "too quickly" error
for it instead of the buy-credits modal (an app-side change, so installed
builds before the next release show the modal on a burst — rare, since the
client awaits each reply). Verified on production after deploy with a
throwaway account (deleted afterwards): 15 × `400` then `429 rate_limited`
with `Retry-After: 10`. `tests/noor-burst-limit.test.ts` covers both keys.

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
  exercised on device on 2026-08-29. **Numeric parsing audited 2026-09-12:** the
  backend reads exactly two numeric variables, `AI_DAILY_MESSAGE_LIMIT` and
  `DATABASE_POOL_MAX`; both now go through `lib/env.ts` `readIntEnv`, which
  rejects anything that is not an integer inside a documented range, falls back
  to the default and logs the variable name (never its value). The same NaN
  path in three query-param parses (`/api/vocabulary/words` page,
  `/api/vocabulary/my-words` limit/offset) is closed by `parseIntParam`. Every
  boolean flag (`ALLOW_UNAUTHENTICATED_ADMIN`, `ALLOW_UNVERIFIED_PURCHASES`,
  `ALLOW_UNAUTHENTICATED_WEBHOOK`, `DEV_UNLOCK_ALL`) compares strictly against
  `"true"` and fails closed. What remains unvalidated is string values (model
  ids, URLs, keys), which only the production probe can catch. The Noor outage
  found on 2026-09-10 was the same class of fault: production `OPENAI_MODEL` held a
  model id OpenAI answers with `400 invalid model ID`, and because a bad model is
  indistinguishable from a bad key from outside, it read for a month as a key
  problem. Every Vercel production variable is sensitivity-flagged and cannot be
  read back, so a wrong value can only be found by exercising the path.
- **Local-environment risk:** `warsh-backend/.env` `DATABASE_URL` points at the
  **production** Neon database, not a local or staging one. Any command run from
  that directory that writes — `npm run db:seed` above all — writes to production.
  Verify what a script targets before running it.
- **Duplicate deployment removed (2026-09-12).** The personal `umarbinakbarali`
  Vercel account used to hold a second `warsh` project building this repository
  with Cron Jobs enabled; its nightly runs failed `P1000` on stale database
  credentials, reached Sentry, and checked in under the shared
  `apicronreset-streaks` monitor slug, so the canonical job's health was
  unreadable there. The owner deleted that project. Verified in Sentry the same
  day: the last event tagged `-umarbinakbarali.vercel.app` is from 2026-09-08,
  the monitor has three consecutive `Okay` check-ins from `api.warsh.app`
  (2026-09-09 to 2026-09-11) and its "Cron failure" issue auto-resolved; the
  three duplicate-origin `PrismaClientKnownRequestError` issues were resolved by
  hand. The monitor now reflects production alone. Production is
  `warshapp-projects`; the Vercel CLI and browser session both authenticate as
  `warshapp`, which cannot see the personal account.
- **Deploy-drift risk:** `vercel --prod` ships the working tree, not `git HEAD`, so
  any uncommitted local edit reaches production silently. This happened on
  2026-08-29 with the `lib/openai.ts` fix.
- **Cron reliability risk:** Neon suspends its compute overnight, so the 04:00/05:00
  PKT crons can hit a sleeping database and die with `P1000`. Half of August's
  streak resets never ran.
- **Asset risk (closed 2026-09-16):** illustration coverage is 920 of 920
  published words. The owner drew the remaining 335 (16 curriculum + 319 Core
  500) across 2026-09-15/16; each batch was compressed and uploaded keyed by
  `word_id` from `Docs/vocabulary-illustrations-needed.csv`.
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
