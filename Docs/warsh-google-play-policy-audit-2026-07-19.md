# Warsh Google Play Policy and Production-Readiness Audit

- **Audit date:** July 19, 2026
- **Package:** `com.warsh.app`
- **Current Play release reviewed:** `7 (1.0.6)` submitted to Closed testing - Alpha on July 20, 2026; Play review/automated checks pending
- **Production-access application:** Submitted July 11, 2026 at 4:56 PM; declined July 20 with a requirement for an additional 14-day Closed test

> [!IMPORTANT]
> This document is a dated review snapshot and implementation checklist. It is not a fourth active Warsh specification. The active sources of truth remain `warsh-status.md`, `warsh-product-spec.md`, `warsh-technical-spec.md`, and the current code/configuration. Re-check Google Play Console and the linked Google policies before the final production submission because console state and policies can change.

## 1. Executive summary

Warsh has no policy violations shown in Google Play Console, its required App content declarations are actioned, Android developer verification is registered, and its content rating is complete. On July 20, Google **did not grant production access** and required another 14 days of closed testing with real testers before reapplication. Fresh release `7 (1.0.6)` has now been uploaded to Closed testing - Alpha and sent for review; Play has accepted the bundle and is running its automated checks.

However, the app should not be treated as production-ready until the following confirmed issues are resolved:

1. **The Noor message-pack product/configuration is corrected, but the Play-installed purchase, retry, duplicate, cancellation, pending, and repurchase matrix is not yet complete.**
2. **The Play Data safety declaration and privacy disclosures do not fully match the app's data collection and processors.**
3. **The selected 13–17 target audience creates child/minor compliance obligations, but the app has no neutral age screen or age-specific handling.**
4. **Legal and API pages on `api.warsh.app` have intermittently encountered a Vercel Security Checkpoint, which could make required disclosures or native API calls inaccessible.**

The original 16 KB native-library blocker is closed: the rebuilt bundle passes local alignment checks, runtime smoke tests passed on a 16 KB emulator, and Play Console reports **“Memory page size: Supports 16 KB.”**

Production cannot be used until the additional closed-test requirement is completed and a new production-access application is approved. Continue the policy and engineering corrections during the test period so the reapplication can truthfully describe production readiness.

## 2. Severity and status legend

| Level | Meaning |
|---|---|
| **P0 — launch blocker** | Must be fixed or decisively resolved before uploading the production release. |
| **P1 — release quality** | Should be fixed or explicitly accepted before launch. |
| **P2 — hardening** | Recommended improvement; not currently a confirmed launch blocker. |
| **Compliant** | Verified as correctly configured at the time of this audit. |
| **Console check** | Requires confirmation in Play Console because source code alone cannot prove it. |

## 3. Production-access application status

### Current state

- Application submitted: **July 11, 2026 at 4:56 PM**.
- On July 20, the account owner received **“More testing required to access Google Play production.”**
- Google stated that tester engagement may have been insufficient and/or testing best practices were not demonstrated through gathering feedback and improving the app.
- Google explicitly requires **an additional 14 days of closed testing with real testers** before applying again.
- Production track remained inactive.
- The latest verified build is release `7 (1.0.6)`. It was uploaded to Closed testing - Alpha at 100% and sent for review on July 20; Publishing overview currently shows **Changes in review** while automated checks run.
- The previously serving Closed testing release was alpha release `4 (1.0.3)`, serving from July 15 at 11:40 AM. Do not start counting the new qualifying period until release 7 is available to the closed tester group and at least 12 real testers are continuously opted in.

### Required recovery plan

- [ ] Complete Play review for the already submitted release `7 (1.0.6)` and confirm it is available through the existing Closed testing - Alpha track. Do not rely on Internal testing or count review time toward the tester period.
- [ ] Enroll at least **12 real testers** and keep them continuously opted in for 14 full days. Recruit 15–20 reliable testers as a buffer because any tester who leaves or joins late may delay eligibility.
- [ ] Ensure each tester installs/updates Warsh through the Play closed-test opt-in/Store flow rather than a sideloaded APK.
- [ ] Give testers a feature checklist covering onboarding, account creation/login, lessons and audio, Vocabulary, Noor, trial/paywall, settings, legal links, logout, and account deletion where appropriate.
- [ ] Ask testers to use Warsh naturally in multiple sessions across the period. Do not fabricate activity, feedback, bugs, or reviews.
- [ ] Provide a clear feedback channel and retain private testing feedback from **Play Console → Ratings and reviews → Testing feedback**, email, or a tester group.
- [ ] Keep a private test log containing tester opt-in date, device/Android version, features exercised, feedback, issue severity, action taken, and build containing the resolution. Do not put tester email addresses in this repository.
- [ ] Publish at least one genuine closed-track improvement when feedback identifies a bug or usability/content issue, then document what changed and how it was verified. Do not create meaningless updates solely to influence review.
- [ ] Review and resolve all actionable Pre-launch report crashes, ANRs, accessibility issues, security warnings, and compatibility findings before reapplying.
- [ ] Keep the Closed testing track active and testers opted in through the production-access decision.
- [ ] Reapply only after Play Console shows eligibility following the additional period. If all qualifying testers start on July 20, the earliest 14-day boundary is approximately August 3 at the same time; use August 4 as a safer buffer and rely on the Console indicator rather than calendar counting alone.
- [ ] In the new application, give specific, truthful answers about tester engagement, features tested, feedback themes, changes shipped, verification performed, target users, app value, and why the current candidate is production-ready.

Google's published baseline is at least 12 testers continuously opted in for 14 days, but satisfying the numerical threshold alone does not guarantee approval. Google reviews engagement, the quality of the testing process, feedback, resulting improvements, and the detail and credibility of the reapplication answers.

## 4. Changes in the supplied Google documents

### 4.1 July 15, 2026 policy announcement

Source: [Policy announcement: July 15, 2026](https://support.google.com/googleplay/android-developer/answer/17134731)

| Change | Deadline | Impact on Warsh | Action |
|---|---:|---|---|
| Age-restricted content, Child Safety, and Families changes affecting anonymous/random chat | Enforcement begins August 26, 2026 | Noor is an AI tutor, not anonymous or random user-to-user chat, so the anonymous-chat restriction does not directly apply. Warsh's selected minor audience still creates broader child/minor obligations. | Keep Noor clearly AI-only; prevent user-to-user random chat unless a future policy review is completed. Resolve the target-audience issue in Finding P0-4. |
| Families policy prohibits anonymous chat experiences targeting children | August 26, 2026 | Not directly applicable to the current product, but relevant if social/chat functionality is ever added. | Treat any future community, matching, or user-to-user chat feature as requiring a new policy review. |
| `READ_CALL_LOG` cannot be used for phone-call account verification | Enforcement January 27, 2027 | Not applicable. Warsh has no call-log/SMS permissions and does not use phone-call verification. | Do not add call-log or SMS permissions for authentication. |
| Android developer verification registration | Registration deadline September 30, 2026 | Already satisfied in the Console: package `com.warsh.app` is registered and two signing keys are shown. | Re-check verification before launch and after any signing/package changes. |
| User Data requirements explicitly cover third-party AI services | Clarification effective with the announcement | Directly applicable to Noor/OpenAI. Warsh remains responsible for what chat content and identifiers are sent, the disclosure, consent, security, purpose limitation, and deletion behavior. | Reconcile privacy policy, Data safety, app notices, processor terms, and actual retention. |
| Apps must have a content rating | Clarification | Satisfied; Warsh has completed ratings. | Re-answer the rating questionnaire if content or interactive capabilities materially change. |
| Location disclosure guidance clarified | Clarification | Not currently applicable; no location permission or location collection was found. | Keep location out unless a real user-facing feature justifies it and all disclosures are updated. |
| Annual target API update | August 31, 2026 | Satisfied in source: compile SDK and target SDK are 36. | Ensure the final uploaded AAB still targets API 36 and has no Console target-API warning. |

### 4.2 Protected with Play

Source: [Protected with Play](https://support.google.com/googleplay/android-developer/answer/13857328)

Google replaced the former App integrity presentation with **Protected with Play**, centralizing automatic protection, Play Integrity, store protection, and billing protection.

Warsh's reviewed Console state:

- Overall protection: **High**
- Automatic protection: **1/1**
- Play Integrity API: **3/7**
- Store protection: **7/7**
- Play Billing protection: **4/4**

This is positive but does not prove that every backend billing verification or service-account permission works. Complete a real Play-installed purchase/restore test before production. Expanding the remaining Play Integrity integrations is recommended hardening, not a confirmed blocker.

### 4.3 Google Play service-fee changes

Source: [Google Play service-fee changes](https://support.google.com/googleplay/android-developer/answer/16954621)

Google is rolling out a new service-fee structure by region. For Pakistan/the rest-of-world group, the document lists **September 30, 2027**, so this is not an immediate requirement for Warsh's 2026 launch.

Important planning points:

- A service fee applies to transactions under the announced structure.
- An additional billing fee applies when Google Play Billing is used; the document currently specifies a 5% billing fee for certain initial regions, including the US, UK, and EEA.
- Do not assume or publish a Pakistan-specific rate until Google publishes the applicable regional terms.
- Treatment may differ for new versus existing installs, and participation in Google programs may affect rates.

Action: model subscription economics again before the September 2027 regional rollout and re-read the current fee terms at that time.

## 5. Confirmed Google Play Console state

### Policy and declarations

- **Policy status:** No issues found.
- **App content:** No item displayed “Need attention.”
- Actioned declarations included:
  - Advertising ID
  - Health apps
  - Financial features
  - Government apps
  - Data safety
  - Target audience and content
  - Content ratings
  - Ads
  - App access/sign-in details
  - Privacy policy
- Android developer verification showed `com.warsh.app` registered with two keys and verified identity details.
- Content rating completed: ESRB Everyone, PEGI 3, and equivalent all-ages/Rated 3+ results.

### Monetization

- Subscription product: `warsh_premium`
- Availability: active in 174 countries/regions
- Active base plans:
  - `monthly` — monthly auto-renewing
  - `yearly` — yearly auto-renewing
  - `warsh-noor-pack` — one-month prepaid
- One-time products: none configured

### Data safety categories observed

- Personal information: Email address, User IDs
- Financial information: Purchase history
- Messages: Other in-app messages
- Audio: Voice or sound recordings
- App information and performance: Crash logs, Diagnostics
- App activity: App interactions
- Device or other IDs

These declarations require correction/revalidation as described in Finding P0-3.

## 6. Detailed findings

### P0-1 — 16 KB native-library compatibility — CLOSED July 19, 2026

**Evidence**

- Play Console warned that release `4 (1.0.3)` uses native libraries that are not aligned for 16 KB devices and may fail to install, start, or run correctly.
- The local release AAB at `warsh-app/android/app/build/outputs/bundle/release/app-release.aab` contained 80 native libraries.
- An ELF `LOAD` segment scan found 36 libraries with `0x1000` alignment, below the required `0x4000` alignment.
- Confirmed non-compliant arm64 libraries included:
  - `libexpo-av.so`
  - `libexpo-modules-core.so`
  - `libNitroIap.so`
  - `libNitroModules.so`
  - `librnscreens.so`
- Additional non-compliant libraries were present in 32-bit ARM and x86/x86_64 variants.
- APK ZIP alignment passed `zipalign -c -P 16 -v 4`, but that checks APK packaging alignment; it does not correct non-compliant ELF `LOAD` segment alignment.
- At audit time, `warsh-app/android/gradle.properties` pinned `android.ndkVersion=26.1.10909125`. The project-level Gradle default was NDK 27.1, but the property overrode it. The adjacent comment reported that the installed NDK 27 was corrupted.

**Remediation update — engineering fix verified July 19, 2026**

- NDK r27b (`27.1.12297006`) was reinstalled and verified as a complete installation.
- The NDK 26 override was removed, restoring React Native 0.81.5's expected NDK.
- React Native 0.81 enables flexible page-size support in its ReactAndroid and Hermes CMake builds. NDK r27 does not guarantee 16 KB alignment by itself; the React Native configuration is the relevant mechanism in this project.
- The obsolete 32-bit `x86` ABI was removed while retaining `armeabi-v7a`, `arm64-v8a`, and `x86_64`.
- A fresh merged-native-libraries scan found zero alignment failures on `arm64-v8a` and `x86_64`; every enforced 64-bit library reported at least `0x4000` alignment.
- No Expo SDK, React Native, `expo-av`, `react-native-screens`, or IAP dependency upgrade was required for this correction.
- A permanent cross-platform checker is available through `npm run check:16kb`. Its `-- --merged` mode validates pre-bundle output without signing/Sentry credentials; its default mode validates the actual release AAB.

**Final artifact and Play verification — completed July 19, 2026**

- Built a clean production AAB as release `5 (1.0.4)` with the production API configuration and automatic Sentry uploads intentionally disabled by the existing production build profile.
- Final AAB: `warsh-app/android/app/build/outputs/bundle/release/app-release.aab`, 44,285,262 bytes, SHA-256 `883F8B400E8582B8225F481655648B4489A41F88D72DC46064784AB25320709B`.
- The packaged AAB contains 60 native libraries: 20 `armeabi-v7a`, 20 `arm64-v8a`, 20 `x86_64`, and zero obsolete `x86` libraries.
- `npm run check:16kb -- android/app/build/outputs/bundle/release/app-release.aab` passed every enforced 64-bit library with zero failures.
- Bundletool reported `PAGE_ALIGNMENT_16K`, package `com.warsh.app`, target SDK 36, version code 5, and version name 1.0.4.
- Installed the AAB-derived APK set on the Android 15 `Warsh_API_35_16KB` emulator and confirmed `PAGE_SIZE=16384`, API 35, and `x86_64` execution.
- Cold launch, onboarding, audio playback, navigation, registration, settings, subscription/paywall rendering, restore-failure handling, and account deletion completed without a fatal exception, ANR, missing native library, signal crash, or process death. Real billing success still requires a Play-installed licensed-tester build and remains covered by the separate IAP QA finding.
- Play Console accepted and published release `5 (1.0.4)` to Internal testing, where it is **Active** and **Available to internal testers**.
- Play Console's App bundle details explicitly report **“Memory page size: Supports 16 KB.”** The release review showed no 16 KB warning.
- The two remaining release-review warnings are unrelated to 16 KB: one x86-only phone is no longer supported after the approved x86 removal, and no deobfuscation file is attached while R8/ProGuard minification is disabled.

**Risk**

Google requires 16 KB support for relevant new apps/updates targeting Android 15 or higher. Release `4 (1.0.3)` remains historical evidence of the original problem, but the current Internal testing release `5 (1.0.4)` satisfies the technical and Play Console exit conditions. Preserve the alignment checker as a release gate so dependency, React Native, CMake, or NDK changes cannot silently reintroduce the issue.

**Required action**

- [x] Reinstall the complete NDK `27.1.12297006` expected by React Native 0.81.5.
- [x] Remove the NDK 26 override and preserve React Native's flexible page-size configuration.
- [x] Verify every enforced 64-bit library in merged native output with `npm run check:16kb -- --merged`.
- [x] Add a permanent release-gating alignment checker.
- [x] Build with the production API configuration and the production profile's intentional Sentry-upload disable flags; no Sentry credential is required when upload is disabled.
- [x] Run a clean production AAB build and prove that the removed `x86` ABI is absent.
- [x] Run `npm run check:16kb` against the actual release AAB, not only merged native output.
- [x] Upload and publish the rebuilt AAB to Internal testing and confirm Play reports 16 KB support without a page-size warning.
- [x] Test installation and the major native flows on a 16 KB Android emulator/device.

**Exit condition**

Every 64-bit native library reports compatible ELF alignment, the bundle passes Android's 16 KB checks, runtime smoke tests pass on a 16 KB environment, and Play Console no longer warns about page-size compatibility.

Reference: [Support 16 KB page sizes](https://developer.android.com/guide/practices/page-sizes)

### P0-2 — Noor message-pack product and exactly-once credit delivery — ENGINEERING COMPLETE; LIVE PLAY QA PENDING

**Evidence**

- The app requests a consumable purchase with ID `warsh_noor_pack` in `warsh-app/app/(app)/(tabs)/chat.tsx`.
- The backend purchase-pack route expects `warsh_noor_pack` in `warsh-backend/app/api/noor/purchase-pack/route.ts`.
- At audit time, Play Console had no one-time product and instead had `warsh-noor-pack` (hyphens) as a **one-month prepaid subscription base plan** under `warsh_premium`.

**Remediation completed July 19, 2026**

- Created and activated the one-time product `warsh_noor_pack` in Play Console.
- Deactivated the accidental prepaid base plan `warsh-noor-pack`; monthly and yearly subscription base plans remain active.
- Added a durable `StorePurchase` receipt ledger. Only a SHA-256 purchase-token digest is retained for one-time purchases, and the unique digest makes credit delivery idempotent.
- Updated the backend to verify one-time products through the Google Play products endpoint, grant 20 credits exactly once, and return a replay-safe result on retries.
- Updated the app to load the one-time product, show Play's localized price, submit the purchase for server verification, and finish/consume the transaction only after the server confirms the grant.
- Applied the production database migration, deployed the backend, passed the backend production build and Noor purchase tests, built release `6 (1.0.5)`, and verified all 60 packaged native libraries.
- Published release `6 (1.0.5)` to Internal testing and enrolled the authenticated developer/tester account. Play reports the release as Active and Available to internal testers.
- Remaining gate: install the Play-distributed build and execute the licensed-tester success/cancellation/pending/retry/repurchase matrix. The emulator currently requires a one-time Google Play account sign-in before that can run.

**Risk**

The identifiers differ and a prepaid subscription is not a consumable one-time product. The app's 20-message Noor pack cannot be reliably purchased, validated, granted, or consumed with the current Console configuration.

**Required action**

The intended Warsh behavior is a consumable Noor message pack, so the simplest correction is:

- [x] Create and activate a one-time consumable Play product with the exact ID `warsh_noor_pack`.
- [x] Configure its countries, price, tax/category details, and activation status.
- [x] Deactivate the accidental `warsh-noor-pack` prepaid base plan after confirming it was accidental.
- [ ] Confirm the app fetches the one-time product and displays the live localized Play price.
- [x] Confirm through automated tests that the backend validates the correct one-time-product purchase token and prevents duplicate grants.
- [x] Implement finish/consume after server verification so the same user can buy another pack later; live Play confirmation remains part of the matrix below.
- [ ] Test a successful purchase, cancellation, pending purchase, duplicate token, server failure/retry, and repurchase using a Play license tester.

**Exit condition**

The Console, Android client, and backend use the exact same product ID and product type, and a real Play-installed test purchase grants the correct number of Noor messages exactly once.

### P0-3 — Privacy policy and Data safety declarations do not fully match the app

**Evidence**

1. **Two different privacy-policy versions are public.**
   - Play Console lists `https://umarakbar.com/Warsh/privacy-policy.html`.
   - The app links to `${EXPO_PUBLIC_API_URL}/privacy`, which is `https://api.warsh.app/privacy` in production.
   - The Play-listed page and `Docs/privacy-policy.html` mention OpenAI, Sentry, Neon, and Google Play and show a May 29 update.
   - `warsh-backend/app/privacy/route.ts` mentions Neon/Vercel/OpenAI/Cloudflare, uses a different contact address, includes a 180-day chat-retention statement, and shows a May 30 update.
2. **Mixpanel is active but absent from the Play-listed privacy disclosure.**
   - The client initializes Mixpanel in `warsh-app/services/analytics.ts`.
3. **Name appears omitted from Data safety.**
   - Registration collects a user's name, while the reviewed Console declaration listed Email address and User IDs but not Name.
4. **Voice recording may be over-declared or the implementation/disclosure may be inconsistent.**
   - The onboarding permission copy says recordings remain on the device.
   - Data safety lists Voice or sound recordings as collected. If audio never leaves the device, Google generally does not treat it as collected; if it does leave, the app copy and privacy policy must explain that accurately.
5. **Noor/OpenAI processing needs exact disclosure.**
   - User chat messages are sent to a third-party AI processor. The declaration must accurately distinguish collection from sharing and apply the service-provider exception only if Google's conditions and the applicable contract are actually satisfied.
6. **The promised 180-day deletion is not implemented in the reviewed code.**
   - The API privacy route says chat messages are automatically deleted after 180 days.
   - No scheduled retention cleanup/job was found. Chat data is deleted during account deletion, but that is not the same as automatic age-based deletion.
7. **Different contact details are used across policy versions.**

**Implementation and verification update — July 20, 2026**

- The canonical public website and legal/help pages now live in the dedicated `warsh-site/` project. Final Vercel production deployment `dpl_HyEhEGebzEFLZkfGF4yMfuc32NCn` contains `/privacy`, `/terms`, `/delete-account`, and `/help`; responsive landing and legal-page browser tests passed locally and against the production artifact before the automated test source was challenged again.
- The backend was restored to API-only behavior. Existing `/privacy`, `/terms`, `/delete-account`, and `/help` URLs permanently redirect through `PUBLIC_SITE_URL`, preserving already-distributed builds. The production value temporarily remains the stable `warsh-site` Vercel alias; both it and `warsh.app` serve the same site, and external clean-network checks verified the old app URLs reach the correct privacy/deletion pages. Switch the variable to `https://warsh.app` after refreshing the expired Vercel CLI session.
- App source now uses `https://warsh.app` for privacy, Terms, and Help. App TypeScript and quiet lint passed.
- Vercel assigns `warsh.app` and `www.warsh.app` only to the `warsh-site` project. The Namecheap cutover is complete using authoritative apex `A 216.198.79.1` and `www CNAME 2eac99eaa82c15f3.vercel-dns-017.com` records. External clean-network checks returned HTTP 200 from both canonical hosts. The two Play Console URLs still need to be updated; the old `umarakbar.com` policy can remain as a legacy page after Play no longer references it.
- Attack Challenge Mode was explicitly disabled for both public-site and backend projects. Clean no-cookie checks returned expected HTML/JSON without a mitigation header; a later high-volume parallel test burst retriggered Vercel's system mitigation for this shared automation source. A separate clean external fetch returned HTTP 200 for the landing, privacy, Terms, deletion, and Help pages and the documented JSON for `/api/health`; P0-5 remains open for Play-installed/mobile-network verification and recurrence monitoring.
- The earlier Sentry source-map blocker is closed as of July 22. The authenticated projects are `warsh-backend` and `warsh-mobile`; Vercel/EAS production variables now point to those projects, default PII and browser replay are disabled, and request/breadcrumb secrets are scrubbed. The backend production deployment uploaded its server/edge/client artifact bundles successfully. EAS build `d3f027fb-2e36-48d6-9741-6a62b4a4a490` completed as `1.0.6 (11)` without Play submission, and the Sentry Source Map Uploads page shows the two-file bundle for release `1.0.6 (11)`, distribution `11`. Synthetic event `34d08e336c144b44a1ece5dbe6bc7676` was accepted and symbolicated from the generated Android bundle to `/services/sentry.ts:109:2` with original TypeScript source context. Sentry production configuration and symbolication are therefore verified; the separate audience/consent decision still governs the broader processor-policy checklist.

**Risk**

Google requires a clear privacy policy in Play Console and inside the app, an accurate Data safety form, prominent disclosure/consent where required, and actual behavior that matches the statements. A false retention claim or undisclosed analytics/AI processing can lead to rejection or enforcement even when the Console currently says “No issues found.”

**Verified data inventory — July 19, 2026**

| Data | Collection point and destination | Purpose | Retention and deletion | Play Data safety implication |
|---|---|---|---|---|
| Name, email, internal user ID, password hash, language and onboarding choices | Registration/profile API → Vercel/Neon; email sent through Resend when requested | Account, authentication, personalization, security email | Active account; database records deleted with account, subject to disclosed limited legal/security retention | Declare Name, Email address, User IDs, and relevant Other info |
| Lesson, quiz, streak, XP, achievement, vocabulary and Tadabbur state | App APIs → Vercel/Neon; selected events/properties → Mixpanel | Core learning features, progress sync, analytics | Active account in Warsh; provider retention applies to analytics | Declare App interactions and relevant User-generated/Other activity |
| Noor messages and responses | Chat API → Vercel/Neon; recent context → OpenAI | AI tutor response and visible cross-session transcript | Active account; deleted from Warsh database with account | Declare Messages; determine service-provider sharing answer from applicable provider terms |
| Subscription and Noor purchase verification | Google Play → app/backend → Vercel/Neon | Verify purchase, grant entitlement/credits, restore, stop duplicate grants | Active account; one-time raw token is hashed before ledger storage; Warsh records deleted with account | Declare Purchase history and User IDs; Google handles full payment-card data |
| Crash, performance and diagnostic context | App/backend → Sentry after scrubbing; hosting operational logs → Vercel | Reliability, debugging, security | Provider/configured retention; user ID is pseudonymous in Sentry | Declare Crash logs, Diagnostics, Device or other IDs as applicable |
| Product analytics events and properties | App → Mixpanel with pseudonymous user ID; automatic event tracking disabled | Feature measurement and product improvement | Provider/configured retention; analytics identity reset on logout | Declare App interactions and Device or other IDs; no advertising use |
| Speaking-practice recording | Microphone → temporary local app file only | On-device playback and shadow comparison | Deleted when discarded, restarted, advanced, or unmounted; no upload path found | Do not declare Voice or sound recordings as collected if runtime network capture confirms the code behavior |

**Required action**

- [x] Inventory each datum, collection point, destination, purpose, retention period, encryption behavior, deletion method, and processor.
- [x] Include account name, email, user ID, learning progress, purchase history/tokens, Noor messages, diagnostics/crash data, analytics/app interactions, device identifiers, and microphone/audio behavior.
- [ ] Determine through runtime/network verification whether raw audio ever leaves the device.
- [ ] Update the Play Data safety answers to match verified behavior, including Name and the correct Voice recording answer.
- [x] Disclose Mixpanel, Sentry, OpenAI, hosting/database providers, Google Play Billing, Resend, and their purposes in both policy implementations.
- [ ] Verify whether each transfer qualifies as service-provider processing before declaring that data is not shared.
- [x] Remove the unenforced 180-day promise and disclose actual active-account retention in both privacy policies and the Terms.
- [x] Use `support@warsh.app` consistently for privacy and support contact.
- [x] Consolidate the policy content in the protected legacy source and canonical `warsh-site` implementation.
- [x] Deploy the corrected privacy, Terms, deletion, and Help resources to the dedicated public-site project; preserve permanent backend redirects for older app builds.
- [x] Pass automated mobile/desktop browser checks against the corrected local implementation.
- [x] Complete the two-record Namecheap DNS cutover without changing nameservers or unrelated records.
- [ ] Update Play Console to `https://warsh.app/privacy` and `https://warsh.app/delete-account`.
- [ ] Ensure the app's Terms page, privacy page, store-listing policy link, and deletion page are publicly accessible without login, geoblocking, or browser challenges.
- [ ] Re-review disclosures after every analytics, AI, advertising, authentication, or crash-reporting SDK change.

**Protected-page warning**

`Docs/privacy-policy.html` backs a live Google Play requirement. Do not rename, move, delete it, or change its URL routing without explicit approval. Its content can be corrected through a separately reviewed implementation change.

**Exit condition**

A verified data inventory maps one-to-one to the Play Data safety form and both public/in-app policies; every stated retention rule is enforced; processor and purpose disclosures are complete; and all legal URLs return public HTTP 200 responses from a clean network.

References: [User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311), [Account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111)

### P0-4 — The selected minor audience lacks an age-compliance implementation

**Evidence**

- Play Console target-audience selections include ages **13–15**, **16–17**, and **18+**.
- The app has no neutral age screen, date-of-birth gate, or age-specific analytics/AI/data path.
- Noor sends user messages to a third-party AI service, while Sentry and Mixpanel process diagnostic/analytics data and identifiers.
- The active product direction describes adult learners as the primary audience.

**Risk**

Selecting 13–17 means Warsh must be appropriate and compliant for those users, including where local law treats them as children. Obligations can affect consent, personalized experiences, SDK eligibility, data use, retention, advertising, profiling, AI processing, privacy notices, and account handling. A simple “13+” statement does not resolve jurisdiction-dependent requirements.

**Owner decision required**

Choose and document one of these paths before production:

#### Option A — Target adults only (recommended for the simplest compliant launch)

- [ ] Change the Play target audience to **18+ only** if that accurately reflects the intended product and marketing.
- [ ] Update product copy, Terms, privacy notices, onboarding, store listing, website, and support answers consistently.
- [ ] Avoid imagery or marketing that clearly targets children.
- [ ] Decide whether an age confirmation is still needed based on legal review and the app's data processing.

#### Option B — Keep ages 13–17

- [ ] Add a neutral age screen and age-aware backend/account state.
- [ ] Determine parental/legal consent requirements for every launch country.
- [ ] Ensure every SDK and third-party processor is permitted for the selected ages and configured for child/minor treatment where necessary.
- [ ] Gate or adapt analytics, AI/chat, identifiers, profiling, communications, and retention according to age and jurisdiction.
- [ ] Provide age-appropriate disclosures and safety controls.
- [ ] Complete a formal Families/children and privacy review before launch.

**Clarification about the July 15 policy update**

Noor is an AI assistant, not anonymous or random user-to-user chat. Therefore, the new anonymous-chat prohibition is not itself the blocker. The blocker is the broader compliance burden created by deliberately selecting minor age groups without age-aware handling.

**Exit condition**

The Console audience, actual users, marketing, Terms/privacy disclosures, SDK configuration, and app/backend behavior all implement the same documented age strategy.

Reference: [Target audience and content](https://support.google.com/googleplay/android-developer/answer/9285070)

### P0-5 — Vercel Security Checkpoint can interfere with public legal/API access

**Evidence**

- `https://umarakbar.com/Warsh/privacy-policy.html` returned HTTP 200.
- `https://umarakbar.com/Warsh/account-deletion.html` returned HTTP 200.
- The app's in-app Privacy Policy and Terms links use `https://api.warsh.app/privacy` and `/terms`.
- During the original review, `api.warsh.app/privacy` and `/terms` initially returned a Vercel 403 Security Checkpoint (`X-Vercel-Mitigated: challenge`) and later returned 200 after the browser/IP challenge was resolved.
- After the July 20 production deployment, clean no-cookie requests to `/api/health`, `/privacy`, `/terms`, and `/delete-account` again returned HTTP 403 with `X-Vercel-Mitigated: challenge`; the challenge also appeared in a fresh Chrome tab.
- The project configuration was inspected directly: Bot Protection is off, Attack Mode is off, there are no custom or IP blocking rules, and Standard Deployment Protection explicitly excludes production custom domains. The response is therefore a Vercel system mitigation rather than an application response or configurable project challenge rule.
- Attack Challenge Mode was subsequently disabled explicitly through Vercel's security API for both the backend and dedicated public-site projects. Clean no-cookie requests then returned API JSON and website HTML without `X-Vercel-Mitigated`; a burst of parallel automated browser traffic later retriggered the platform-wide mitigation for this shared test source.
- A separate external clean-network fetch returned HTTP 200 for the website landing, privacy, Terms, deletion, and Help routes and returned `{"data":{"status":"ok",...}}` from `https://api.warsh.app/api/health`.
- Public legal/help content is no longer coupled to the native API project. `warsh.app`/`www` are assigned to `warsh-site`, while `api.warsh.app` remains assigned to `warsh`; the Namecheap apex/`www` DNS cutover is complete.

**Risk**

Google reviewers, crawlers, new users, and native clients may not share a previously challenged browser session. Required legal pages must be publicly available, and native API endpoints cannot depend on an interactive browser challenge.

**Required action**

- [x] Review Vercel Firewall, Bot Management, Attack Mode, custom/IP rules, and Deployment Protection for `api.warsh.app`.
- [x] Explicitly disable Attack Challenge Mode on both the public-site and backend projects and confirm clean requests can return the expected application responses.
- [ ] Open a Vercel support case if system mitigation recurs for normal mobile/tester traffic; project-level Bot/Attack/custom rules are off, and Hobby does not expose system-bypass rules.
- [ ] If Vercel provides a supported exemption, apply it to required public legal routes and native mobile API routes while retaining appropriate rate limiting and backend authentication.
- [ ] Complete the remaining clean browser-profile, mobile-network, and Play-installed checks; external no-cookie HTTP verification is complete.
- [ ] Confirm privacy, terms, account-deletion, health, authentication, lesson, Noor, billing verification, and subscription webhook flows do not receive an HTML challenge response.

**Exit condition**

Public legal endpoints reliably return the expected content and native API endpoints return their documented JSON responses without interactive challenges from clean clients.

### P0-6 — Complete real Play-installed billing and deletion QA

**Evidence**

- The app includes restore/manage-subscription functionality.
- The backend contains Play purchase-verification routes.
- Protected with Play reports Billing protection 4/4.
- A previous incident recorded a Google `subscriptionsv2` HTTP 401 while RTDN delivery succeeded, which pointed to Play Console/service-account authorization rather than missing client restore logic. That historical result must be re-verified; current Console protection scores do not prove that backend API authorization is now correct.
- In-app account deletion exists in Settings.
- `DELETE /api/users/me` hard-deletes user-linked database records.
- The external account-deletion URL is publicly accessible.

**Risk**

Static code and Console configuration do not prove that purchase tokens, subscription lifecycle events, restoration, or deletion work in the Play-distributed build with production credentials and permissions.

**Required billing tests**

- [ ] Purchase monthly plan.
- [ ] Purchase yearly plan.
- [ ] Confirm acknowledgement/transaction completion and backend entitlement.
- [ ] Restore an active purchase after reinstall/sign-in.
- [ ] Switch plans and verify proration/replacement behavior.
- [ ] Verify cancellation, grace period, account hold, expiration, and resubscription.
- [ ] Verify RTDN updates the correct user/entitlement.
- [ ] Verify duplicate token and token-owned-by-another-account protection.
- [ ] Confirm the backend Play service account can call the required Android Publisher subscription/product APIs.
- [ ] Test the Noor consumable after Finding P0-2 is corrected.

**Required deletion tests**

- [ ] Use a disposable QA account containing learning progress, chat history, analytics identity, and a test subscription.
- [ ] Delete it in-app and verify server records are actually removed/anonymized according to the policy.
- [ ] Confirm logout and local credential/cache cleanup.
- [ ] Verify the external deletion-request path works without installing the app.
- [ ] Explain clearly that deleting an account does not itself cancel a Google Play subscription, and provide a working cancellation route.
- [ ] Verify any legally retained billing/security records match the privacy policy.

**Exit condition**

The complete purchase, restore, lifecycle, consumable, and deletion matrix passes using a Play-installed release candidate and production-equivalent backend permissions.

### P1-1 — Remove unnecessary production permissions

**Evidence**

The release manifest includes:

- `READ_EXTERNAL_STORAGE` with `maxSdkVersion=32`
- `WRITE_EXTERNAL_STORAGE`
- `SYSTEM_ALERT_WINDOW`

These originate in `warsh-app/android/app/src/main/AndroidManifest.xml`. No core Warsh user feature reviewed in this audit requires an app-wide overlay permission. Legacy external-storage permissions may also be unnecessary under modern Android scoped storage.

The app does **not** declare call-log, SMS, location, contacts, camera, or Advertising ID permissions. Microphone and notification permissions have a user-facing product purpose.

**Required action**

- [ ] Trace each permission to a real production feature or dependency.
- [ ] Remove `SYSTEM_ALERT_WINDOW` unless a documented core user-facing feature truly requires it.
- [ ] Remove legacy storage permissions if media/file flows work through modern system APIs without them.
- [ ] Inspect the final merged release manifest, not only the source manifest.
- [ ] Test microphone, downloaded content, sharing, import/export, notifications, and media playback after removal.

### P1-2 — Resolve Android edge-to-edge and large-screen warnings

**Evidence**

Play Console reported:

- Deprecated edge-to-edge APIs/parameters on Android 15.
- Portrait/resizability restrictions that Android 16 may ignore on large screens.

**Required action**

- [ ] Identify whether warnings originate in Warsh code or Expo/React Native dependencies.
- [ ] Upgrade the responsible framework/module where available and use current edge-to-edge/inset APIs.
- [ ] Test all authentication, tab, lesson, Noor, subscription, modal, keyboard, and settings screens on Android 15/16.
- [ ] Test a tablet, foldable, split screen, landscape, and font/display scaling.
- [ ] Remove unnecessary orientation/resizability restrictions, or explicitly constrain supported devices only if product requirements and Play policy justify it.

### P2-1 — Expand Play Integrity for high-risk operations

Play Integrity currently shows 3 of 7 services active. This is not a confirmed launch blocker. After the P0 items are complete, consider using integrity verdicts and replay protection for high-risk actions such as purchase-token attachment, entitlement changes, Noor consumable grants, suspicious authentication, and abusive AI usage. Backend authorization and idempotency remain mandatory even when Play Integrity is used.

## 7. Items already compliant or positively verified

- [x] Package name is `com.warsh.app`.
- [x] Current source targets Android API 36 and compiles with API 36.
- [x] Current reviewed version is `1.0.4` with version code `5`; it is available to internal testers.
- [x] Play Console reports that release `5 (1.0.4)` supports 16 KB memory pages.
- [x] Android developer verification is registered and signing keys are shown.
- [x] Content-rating questionnaire is complete.
- [x] Play Console Policy status showed no issues.
- [x] App content declarations showed no item needing attention.
- [x] Protected with Play showed High protection.
- [x] A public privacy-policy URL is configured and returned HTTP 200.
- [x] A public account-deletion URL is configured and returned HTTP 200.
- [x] In-app account deletion and backend deletion logic exist.
- [x] The premium subscription product and monthly/yearly base plans are active.
- [x] The app contains restore/manage-subscription behavior.
- [x] No advertising SDK or Advertising ID permission was found during this review.
- [x] No SMS, call-log, location, contacts, or camera permission was found.
- [x] App lint passed with `npm run lint -- --quiet`.
- [x] App TypeScript checking passed with `npx tsc --noEmit`.
- [x] Backend fixture validation passed: 391 fixtures.
- [x] Urdu content audit passed: 72 chapters, 391 lessons, 585 words.
- [x] Backend production build passed.
- [x] `https://api.warsh.app/api/health` returned HTTP 200 with status `ok` after the Security Checkpoint was resolved.
- [x] Fresh release `7 (1.0.6)` was built for the production API, signed, and uploaded to Closed testing - Alpha. Its SHA-256 is `82CAEC9B5EC99822880D63475345509511B0F48C497866B65FA9769D524AA525`; Play accepted version code 7 and showed no 16 KB compatibility error during release review.

These results are evidence of current implementation quality, not a guarantee of Google approval. Fixing this report's findings does not replace Play Console declarations, device testing, or Google's review.

## 8. Recommended implementation order

Work through this order to reduce rework:

1. [x] **16 KB support:** clean AAB build, packaged-library scan, 16 KB runtime test, Play upload, and Console verification are complete.
2. [ ] **Noor purchase:** product/configuration and idempotent backend handling are corrected; complete the Play-installed live purchase matrix.
3. [ ] **Data inventory:** verify actual runtime data flows, especially audio, Mixpanel, Sentry, OpenAI, identifiers, and retention.
4. [ ] **Privacy/Data safety:** reconcile both public policy versions, the Console form, contact details, and actual behavior; implement retention cleanup.
5. [ ] **Audience decision:** choose 18+ or implement full minor-aware behavior.
6. [ ] **Vercel access:** remove interactive challenge behavior from public legal and native API routes.
7. [ ] **Play QA:** run purchase, restore, lifecycle, consumable, and deletion tests using the Play-installed candidate.
8. [ ] **Permissions:** remove overlay and legacy storage permissions if unused.
9. [ ] **Android UI compatibility:** resolve edge-to-edge and large-screen warnings.
10. [ ] **Hardening:** expand Play Integrity where it materially protects backend operations.
11. [ ] **Production-access recovery:** run the additional evidence-backed 14-day Closed test and reapply only when the Console restores eligibility.

## 9. Production-launch exit checklist

Do not promote the release until every applicable item is evidenced:

### Build and device compatibility

- [x] Final AAB targets API 36 or the then-current required target.
- [x] Final AAB has no 16 KB compatibility warning.
- [x] Every bundled 64-bit native library passes ELF alignment checks.
- [x] 16 KB emulator/device smoke test passes.
- [ ] Android 15/16, tablet, foldable, rotation/resizing, keyboard, and accessibility smoke tests pass.
- [ ] Final merged manifest contains only justified permissions.

### Policy and store listing

- [ ] Privacy policy, Terms, deletion page, and support contact are consistent and publicly reachable.
- [ ] Data safety matches measured runtime behavior and every SDK/processor.
- [ ] Target audience matches the implemented age strategy and marketing.
- [ ] Content rating is rechecked after final feature changes.
- [ ] App access instructions provide Google reviewers a working test account/path if authentication is required.
- [ ] Ads, financial, health, government, and Advertising ID answers remain accurate.
- [ ] Store screenshots and description do not promise features that differ from the release.

### Accounts, AI, and data

- [ ] Noor clearly identifies itself as AI and has appropriate safety/error handling.
- [ ] OpenAI input/output handling, retention, disclosure, and deletion are documented and accurate.
- [ ] Mixpanel/Sentry/other processor configuration matches consent and audience decisions.
- [ ] Published retention periods are enforced automatically.
- [ ] In-app and web account deletion are dynamically tested.
- [ ] Local credentials and cached private data are removed after deletion/logout.

### Billing

- [ ] Monthly and yearly products purchase and restore successfully from Play.
- [ ] Noor consumable uses exact matching ID/type and grants once per validated token.
- [ ] Backend service-account permissions and Play Developer API calls succeed.
- [ ] RTDN lifecycle states update entitlements correctly.
- [ ] Manage/cancel subscription flow opens the correct Play page.
- [ ] Subscription status remains independent from account deletion and is clearly explained.

### Console and review

- [ ] At least 12 real testers remain continuously opted in throughout the new 14-day Closed test and until the next production-access decision.
- [ ] Closed-test engagement, feedback, fixes, verification, devices, and release updates are documented truthfully for the reapplication.
- [ ] Latest release has no new pre-launch report crashes, ANRs, security warnings, or policy alerts.
- [ ] Policy status still says no issues immediately before rollout.
- [ ] Production access is approved.
- [ ] Begin with a staged production rollout and monitor crashes, ANRs, billing verification, authentication, and Noor errors.

## 10. Suggested verification commands

Run these after implementation changes; use the project's documented production build process and never expose secrets in logs.

```powershell
# Inspect repository state first
git status --short

# App static verification
Set-Location warsh-app
npm run lint -- --quiet
npx tsc --noEmit

# Backend validation
Set-Location ../warsh-backend
npm run db:validate-fixtures
npm run db:audit-urdu
npm run build

# Build the Play bundle using the maintained production configuration
Set-Location ../warsh-app/android
./gradlew clean bundleRelease
```

After the build:

- Use Android Studio APK Analyzer or Android's documented `check_elf_alignment.sh`/`llvm-readelf` method to inspect every bundled `.so`.
- Use `bundletool` to create/install an APK set that represents Play delivery.
- Run `zipalign -c -P 16 -v 4` on the generated APK, while remembering that ZIP alignment alone does not prove ELF segment compatibility.
- Upload the candidate to an internal or closed test and inspect the App bundle explorer, pre-launch report, 16 KB warning, device catalog, and policy status.
- Test purchases only through a Play-distributed build with configured license testers.

## 11. Authoritative references

- [Policy announcement: July 15, 2026](https://support.google.com/googleplay/android-developer/answer/17134731)
- [Protected with Play](https://support.google.com/googleplay/android-developer/answer/13857328)
- [Google Play service-fee changes](https://support.google.com/googleplay/android-developer/answer/16954621)
- [Production access requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878)
- [User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311)
- [Account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111)
- [Target audience and content](https://support.google.com/googleplay/android-developer/answer/9285070)
- [Policy deadlines](https://support.google.com/googleplay/android-developer/table/12921780)
- [Android 16 KB page-size guidance](https://developer.android.com/guide/practices/page-sizes)

## 12. Audit boundary

This audit combined the supplied Google policy documents, current Google Play Console state, current Warsh source/configuration, local release-bundle inspection, 16 KB emulator testing, public endpoint checks, and repository validation. During remediation, releases `5 (1.0.4)` and `6 (1.0.5)` were published to Internal testing, the Noor one-time product was corrected, supporting backend/legal changes were deployed, and release `7 (1.0.6)` was submitted to Closed testing - Alpha. No production rollout was made. Each remaining Console-only item must be rechecked immediately before production rollout.
