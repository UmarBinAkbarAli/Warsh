# Android Quality 2027 Implementation Plan

**Status:** Proposed implementation plan  
**Created:** 2026-08-28  
**Scope:** Google Play memory, DEX optimization, and Zero-Tap Sign-In requirements announced on 2026-08-26, plus the two related recommendations currently shown for Warsh release `30 (1.0.7)`  
**Current production package:** `com.warsh.app`

## 1. Objective

Bring Warsh into demonstrable compliance before Google Play enforcement begins:

- February 2027: memory and bitmap thresholds
- February 2027: minimum DEX optimization, shrinking, and obfuscation
- April 2027: Zero-Tap Sign-In restoration during Android device migration

Compliance must be proven against the uploaded Play artifact and production Android vitals. A successful local build, source change, or emulator test is necessary but is not sufficient evidence.

## 2. Verified starting point

| Area | Current evidence | Starting status |
| --- | --- | --- |
| DEX optimization | Play Console reports App optimization `Low`, obfuscation `1%`, no qualifying optimization or shrinking percentage, and no detected R8 configuration for release 30 | Non-compliant |
| DEX applicability | The local release 30 AAB contains four DEX files totalling approximately 34.7 MiB uncompressed; the app threshold applies above 10 MB | In scope |
| Zero-Tap Sign-In | Warsh supports password and Google sign-in, but has no Restore Credentials create, retrieve, verify, or revoke flow | Not implemented |
| Memory thresholds | Play Console does not yet expose sufficient 28-day P90 memory and bitmap data for Warsh | Unverified |
| 16 KB page size | Release 30 passes the existing 16 KB compatibility check | Already compliant; preserve |
| Edge-to-edge | Play Console detects deprecated edge-to-edge APIs | Recommendation open |
| Large screens | Play Console recommends removing portrait/resizability restrictions | Product decision open |

## 3. Delivery principles

1. Work in the order defined below; do not combine all changes into one release.
2. Preserve unrelated worktree changes.
3. Use the Warsh release path: local verification, staging/internal user testing, then production only after owner confirmation.
4. Verify the exact AAB that will be uploaded, including production API origin, signing, 16 KB compatibility, DEX optimization, and supported-device impact.
5. Treat Play Console acceptance, production publication, and real-device behavior as separate gates.
6. Do not change the portrait-only product decision without a Pen proposal and explicit product-owner approval.

## 4. Workstream A — Enable R8 and DEX optimization

**Priority:** P0  
**Target completion:** October 2026  
**Enforcement:** February 2027

### A1. Establish the baseline

- Preserve the current release 30 Play Console values and affected-bundle evidence.
- Record the current AAB size, DEX count and size, supported devices, signing certificate, API origin, and 16 KB result.
- List reflection-sensitive/native dependencies that require special attention:
  - React Native and Hermes
  - Expo modules
  - Nitro modules
  - Google sign-in
  - Google Play Billing/IAP
  - Sentry and Mixpanel
  - notifications and in-app updates

**Gate A1:** Baseline evidence is recorded before build configuration changes.

### A2. Configure release optimization

- Enable R8 code minification for release builds.
- Enable resource shrinking for release builds.
- Use the optimized default Android rules file recommended for the installed Android Gradle Plugin version.
- Review existing keep rules and add only rules justified by build warnings or verified runtime breakage.
- Preserve the generated mapping file and make it available to Google Play and Sentry for each release.
- Keep debug and development builds unminified unless a dedicated minified QA variant is useful.

Expected files include:

- `warsh-app/android/app/build.gradle`
- `warsh-app/android/gradle.properties`
- `warsh-app/android/app/proguard-rules.pro`

**Gate A2:** A signed release or release-equivalent build completes with no unresolved R8 warnings that could affect runtime behavior.

### A3. Local and staging regression matrix

Test the optimized artifact through the complete high-risk matrix:

- cold launch, warm launch, and background resume
- password registration, login, refresh, logout, password reset, and password change
- Google sign-in and account-linking behavior
- chapter and lesson loading, all lesson renderer types, audio, and images
- vocabulary search, detail, favorites, hidden state, and SRS
- Noor chat
- notifications and deep links
- subscription product loading, test purchase, acknowledgement, restore, and consumable flow
- in-app update availability behavior on a Play-owned build
- Sentry symbolication/deobfuscation check using a controlled non-production test event

**Gate A3:** No regression is found in authentication, native modules, billing, media, notifications, or navigation on the optimized staging artifact.

### A4. Play validation

- Upload the optimized AAB to a non-production Play track first.
- Confirm Play parses the bundle and reports no device-support loss or new 16 KB issue.
- Confirm the affected bundle reports at least:
  - optimization: 25% or higher
  - obfuscation: 25% or higher
  - shrinking: 25% or higher
- Confirm the mapping/deobfuscation artifact is available for the uploaded version.

**Definition of done for Workstream A:** All three Play optimization percentages meet or exceed 25% on the exact release candidate, and the staging regression matrix passes.

## 5. Workstream B — Memory and bitmap compliance

**Priority:** P0 verification, P1 remediation if required  
**Target baseline:** November 2026  
**Enforcement:** February 2027

### B1. Establish repeatable local profiling

- Create 4 GB and 6 GB Android emulator/device test profiles.
- Profile a production-equivalent optimized build rather than relying only on a debug build.
- Capture memory in these states:
  - cold launch and idle home
  - chapter and lesson navigation
  - image-heavy lesson and vocabulary flows
  - audio playback and cleanup
  - Noor conversation with a long visible transcript
  - foreground to background
  - background to cached state
  - repeated navigation cycles intended to expose retained screens or resources
- Use Android Studio Memory Profiler, heap dumps, Perfetto where needed, and `dumpsys meminfo` for reproducible snapshots.
- Record Java/Kotlin heap, native memory, graphics/bitmap memory, anonymous RSS, and swap where available.

**Gate B1:** A repeatable test script and baseline report exist for the highest-memory Warsh journeys.

### B2. Inspect likely retention points

- Verify that image components request display-appropriate sizes and do not retain full-resolution bitmaps unnecessarily.
- Verify image cache behavior after screens become hidden or the app enters the background.
- Verify Expo AV sound objects and recording resources are unloaded on completion, navigation, and error paths.
- Check long lists for virtualization and bounded rendering.
- Check subscriptions, timers, event listeners, and navigation closures for retained screen references.
- Check background notification and analytics work for unnecessary long-running activity.
- Add custom `onTrimMemory` handling only if profiling proves the framework/library defaults are insufficient.

**Gate B2:** Every material retention finding has a reproduction, owner, remediation, and before/after measurement.

### B3. Validate with production Android vitals

- Monitor the rolling 28-day P90 values in Play Console by:
  - foreground, user-perceived service, background, and cached state
  - device RAM tier
  - Android version
  - app release
- Monitor the out-of-memory crash filter and memory-related ANRs.
- Do not mark this requirement compliant while Play shows insufficient data.
- If production population remains too small, use local profiling as risk evidence but retain the official status as unverified until Play provides qualifying data or Google documents an alternative certification path.

**Definition of done for Workstream B:** Play Console shows Warsh below every applicable Anonymous RSS + Swap and bitmap P90 threshold for a full evaluation window, with no unresolved memory warning.

## 6. Workstream C — Restore Credentials and Zero-Tap Sign-In

**Priority:** P0 architecture and security work  
**Target staging completion:** January 2027  
**Target production completion:** February 2027  
**Enforcement:** April 2027

### C1. Architecture and threat-model decision

- Confirm Warsh remains a single-active-account-per-app experience for restoration.
- Define the relying-party identity and server-side WebAuthn/FIDO library.
- Define credential records separately from password and Google identities.
- Define challenge expiry, one-time use, replay prevention, credential revocation, audit logging, and rate limits.
- Define behavior for:
  - password users
  - Google users
  - linked password and Google accounts
  - signed-out users
  - deleted or suspended accounts
  - password changes and security resets
  - expired Warsh JWT sessions
- Confirm that a restore credential produces a new normal Warsh session; do not transfer or back up a raw Warsh JWT as the compliance mechanism.

**Gate C1:** The security design and API contract are reviewed before database or client implementation.

### C2. Backend implementation

- Add a dedicated credential model linked to the Warsh user, with credential type and lifecycle state.
- Add authenticated creation-options and registration-verification endpoints.
- Add unauthenticated retrieval-options and authentication-verification endpoints with strict challenge and rate-limit controls.
- Issue the existing Warsh session only after successful server-side cryptographic verification.
- Add authenticated credential deletion/revocation behavior.
- Integrate credential cleanup with logout where required to preserve signed-out state, account deletion, and security-sensitive session invalidation.
- Follow existing API response conventions and the Prisma singleton rule.
- Generate and apply the database migration in local/staging before runtime verification.

**Gate C2:** Unit and integration tests cover success, replay, expired challenge, unknown credential, revoked credential, deleted user, and rate-limited abuse paths.

### C3. Android client implementation

- Add an Android integration using Credential Manager Restore Credentials on supported Android/GMS versions.
- Create a restore key after successful registration or sign-in and for already-signed-in users who do not yet have one.
- Track successful key creation locally without treating the local flag as server authority.
- Handle cloud-backup unavailability and the documented device-only fallback.
- Request the restore credential on first launch after restoration.
- If app-data restoration is used, integrate the recommended backup lifecycle callback without delaying normal startup indefinitely.
- Exchange the restored credential with the backend, then hydrate the existing Warsh auth store with the newly issued session.
- Preserve the current login screen as a safe fallback when restore is unavailable, unsupported, revoked, or invalid.
- Delete the restore key when the user intentionally signs out or deletes the account, according to the approved lifecycle design.

Any new visible screen, prompt, or meaningful fallback UX must first pass the Pen design and product-owner approval gate. A silent integration that reuses the existing login fallback does not require redesigning onboarding.

**Gate C3:** Android 9+ supported devices can create, retrieve, use, and delete a restore credential without weakening the existing authentication model.

### C4. Migration testing

Test at least these scenarios using Android Studio's backup/restore tooling and real-device coverage where available:

- cloud backup from old device to new device
- device-to-device transfer
- password-authenticated account
- Google-authenticated account
- user signed out before transfer
- restore key revoked before transfer
- account deleted before transfer
- no screen lock or unavailable end-to-end encrypted cloud backup
- unsupported Android/GMS version
- backend unavailable during first launch, followed by retry

**Definition of done for Workstream C:** A production-signed release candidate restores an active Warsh account without taps after an eligible device transfer, keeps signed-out users signed out, and passes the security-negative test matrix.

## 7. Workstream D — Additional Play recommendations

These items are tracked separately because the August 2026 announcement does not give them the same February/April enforcement deadlines.

### D1. Deprecated edge-to-edge APIs

- Identify whether the warning originates from Warsh native code, Expo SDK 54, React Native 0.81, or another Android dependency.
- Prefer a supported framework/dependency upgrade over app-level suppression.
- Verify status/navigation bar layout, keyboard behavior, splash screen, modals, bottom tabs, and safe areas on supported Android versions.
- Upload a test bundle and confirm the Play recommendation clears.

**Done:** Play no longer reports deprecated edge-to-edge APIs and visual regression testing passes.

### D2. Portrait and large-screen restrictions

- Treat removal of portrait locking as a product and UX decision, not a mechanical manifest edit.
- Create a Pen proposal covering phone landscape, tablet, foldable, lesson playback, exercises, Noor, vocabulary, paywall, and authentication.
- Obtain explicit product-owner approval before changing orientation or resizability behavior.
- After approval, implement responsive layouts and test state preservation across configuration changes.

**Done:** Product decision is documented. If approved for implementation, Play no longer reports the restriction and the approved large-screen matrix passes.

## 8. Release sequence

### Release 1 — Optimization hardening

- R8, shrinking, keep rules, mapping handling
- local and staging regression matrix
- non-production Play upload and percentage verification

### Release 2 — Memory-informed remediation

- only evidence-backed memory or bitmap fixes
- repeat baseline measurements
- monitor new Play artifact separately from release 30

### Release 3 — Restore Credentials

- backend migration and endpoints deployed to staging
- Android client integration on staging/internal track
- device-transfer test matrix
- production promotion only after owner acceptance

Edge-to-edge and large-screen changes may be included only when their dependency and design gates are independently satisfied.

## 9. Production release gates

Before any production upload, confirm:

- [ ] Product owner approved production promotion.
- [ ] Exact version name and version code match the intended release.
- [ ] AAB embeds `https://api.warsh.app` and production environment values.
- [ ] Upload signing certificate matches Google Play.
- [ ] 16 KB compatibility passes.
- [ ] R8 optimization, obfuscation, and shrinking each meet or exceed 25% in Play for the candidate bundle.
- [ ] Supported-device impact is reviewed with no unexpected loss.
- [ ] Password and Google authentication pass on a Play-installed build.
- [ ] Billing and restore-purchase tests pass on a Play-installed build when affected.
- [ ] Restore Credentials migration tests pass when Workstream C is included.
- [ ] Sentry can symbolicate the optimized release.
- [ ] Rollout scope and monitoring window are explicitly agreed.

## 10. Post-release monitoring

- Check crashes, ANRs, out-of-memory terminations, startup, and user reports after publication.
- Compare memory and bitmap P90 by release rather than combining old and new artifacts.
- Confirm authentication restoration success/failure telemetry without logging credential material or sensitive authentication payloads.
- Confirm R8 mapping is retained for every released version.
- Stop or pause rollout on an unexpected authentication, billing, startup, device-support, or data-integrity regression.

## 11. Final program acceptance

The program is complete only when all of the following are true:

- [ ] Play reports no DEX optimization requirement issue for the current production artifact.
- [ ] Production Android vitals remain below every applicable memory and bitmap threshold for the evaluation window.
- [ ] Zero-Tap Sign-In works for eligible signed-in users during Android device migration.
- [ ] Signed-out, revoked, deleted, and unsupported cases fall back securely.
- [ ] Release authentication, billing, media, notifications, and navigation remain functional after optimization.
- [ ] Evidence is recorded in `Docs/warsh-status.md` with source, artifact, environment, date, limitations, and remaining risks.

## 12. Explicit non-goals

- Do not redesign the full onboarding flow as part of Restore Credentials.
- Do not replace password or Google sign-in; Restore Credentials supplements them.
- Do not claim memory compliance from a single emulator snapshot.
- Do not treat a passing build or accepted AAB as production runtime proof.
- Do not change live protected website or privacy-policy routes.
- Do not change orientation behavior without the required design and approval gate.
