# Mixpanel complete journey — audit and proposed implementation

Status: **largely implemented and live (2026-10-31)** — see `Docs/warsh-status.md` for verification. Originally audited 2026-10-30; the audit below describes the code as it was then.

## Owner decisions that supersede parts of this plan

- Website visitors of unknown age **are** tracked (owner approved). No consent/age UI is needed, so the Pen step in the sequence below does not apply.
- Website-to-Android linking uses the **same signed-in account** on web and Android. The opaque Play attribution token below was not built; the Play referrer carries campaign values only and is never treated as identity.
- Nothing is sent before sign-in (age unknown), so `signup_started/failed`, `login_failed` and password-reset events are intentionally absent. The old preview/onboarding helpers were deleted with the screens that called them; `signup_completed` carries goal/level/placement.
- Website section/pricing/blog events are dropped; `website_link_clicked` with destination covers CTA, navigation and outbound clicks.

## Status: complete (2026-11-03)

Nothing remains open. Known limitations: website-to-Play visitors who never sign in on web stay unlinked; the real in-app update prompt awaits the next release; Android welcome slides were not checked signed-out.

1. ~~Release 1.0.21 (45)~~ — done: live 2026-11-02; Android events carry `schema_version` and a real paywall `source` (`manage_see_plans`).
2. ~~Billing, in-app update and Google sign-in on the Play-installed phone~~ — done 2026-11-03 on the Tecno KF8 (no false update prompt; the real update flow awaits a newer build). Same-account identity verified across android, backend, web_app and website.
3. ~~Lexicon descriptions and rollout annotation~~ — done 2026-11-02: all 83 app/website/server events have Lexicon descriptions (10 described before their first event: purchase_cancelled/failed, restore_failed, subscription_banner_shown/cta, subscription_revoked/refunded, quran_translation_changed, tadabbur_surah_viewed, srs_review_finished_with_errors), and a project annotation marks 2026-10-31 as the rollout.

Done: the scheduled outbox delivery is verified (2026-11-02) — the four rows queued 2026-10-31 were delivered unattended at 23:57 UTC that night.  the website, web app and backend changes are deployed (`8946ed8`, `b01ef78`). Mixpanel board **Warsh Journey** holds five saved reports — the free plan caps saved reports at five per user, so adoption and tracking health share one report:
Journey: website to first lesson (funnel); Lesson drop-off (funnel); Paywall to confirmed purchase (funnel, broken down by step-1 `source`; `subscription_plan_selected` is omitted because the annual plan is pre-selected); Retention after first lesson (lesson_completed → app_session_started, day 1/7/30); Feature adoption and tracking health (weekly uniques per feature by `surface`). Events from builds before `f17305b` have no `surface` and show as "(not set)".

Implemented after this audit: shared properties on every app, website and backend event (`schema_version`, `app_version`/`app_build` or `site_version`, `session_id` with 30-minute idle renewal, `ui_language`), and `notification_permission_result`, `share_sheet_opened`/`share_failed`, `help_opened`, `lesson_load_failed`, `streak_freeze_used`, `core500_set_opened`/`core500_set_load_failed`. A "meaning revealed" event was dropped: no such interaction exists in the app. `paywall_viewed` now carries a real `source` (`lesson`, `noor`, `tadabbur`, `learn_expired_banner`, `learn_trial_banner`, `manage_see_plans`, `manage_change_plan`, otherwise `direct`); before `b01ef78` every view was "unknown".

## Evidence and current integration

- `warsh-app/services/analytics.ts` uses `mixpanel-react-native`, with automatic events disabled. The web branch returns immediately, so existing tracking calls do nothing on web.
- There are 21 named event definitions. Definitions do not prove runtime delivery or even an active caller. Existing callers cover email/Google authentication, lessons, achievements, Noor message success, SRS review completion, paywalls, purchase/restore, subscription banners, commitment and Android restore credentials. Several preview/onboarding and Tadabbur definitions have no current callers in the inspected app/component/service sources.
- `app/_layout.tsx` starts asynchronous SDK initialization without awaiting it. Calls before readiness are dropped; initialization sets the singleton before `init()` resolves. Identity is attached in `app/(app)/_layout.tsx`, after auth handlers can already emit their success events.
- Authenticated identity uses the backend user ID, with goal, level and native-language profile properties. Events include environment. No consistent custom surface, session or tracking-schema version is attached.
- IP geolocation is disabled after native SDK initialization. Preserve disabled geolocation in all new adapters, from initialization onward.
- Minor suppression currently gates the private `track()` method and some identity/profile helpers. Signup, lesson completion, Noor, review and subscription helpers directly call `mp.getPeople()` outside that gate. This permits profile writes while suppression is active. Suppression defaults to false; the authenticated layout establishes it later. Login callers do not establish eligibility before tracking. Unknown-age profiles are treated as adult unless `isMinor === true`.
- No Mixpanel instrumentation found in `warsh-site/app` or `landing/index.html`. The backend has a `MIXPANEL_TOKEN` example variable, but no Mixpanel emitter was found in its API/lib code.
- No website attribution or Play Install Referrer handling found in the inspected app/services/native source. Public-site download and web-app links are distributed across pages, Button, navigation and footer components.
- Web build checks currently verify API URL/environment, but do not verify a Mixpanel token in the exported artifact.
- Git already contained the unrelated untracked `warsh-backend/lesson-image-delivery/` directory; preserve it.

Live-project verification is blocked: the selected Mixpanel connector rejects organization/business-context calls for missing `business_context` scope; its project listing returns `{}`. Project ID, region, identity-merge mode, actual event volumes, ingestion and existing boards remain unverified. Do not infer them from historical status notes.

## Proposed journey

```text
Campaign / search / referral
  -> website page -> content / pricing -> CTA
       -> web app -> signup/login -> first lesson -> retained learner -> paid
       -> Google Play -> install referrer -> first eligible app session
                         -> signup/login -> first lesson -> retained learner -> paid
```

Use one confirmed production Mixpanel project for the website, Android, web app and backend. Keep development/test traffic in a separate project. All authenticated surfaces identify with the same immutable backend user ID. Verify the project's identity-merge mode before choosing the exact merge calls; do not change that mode casually.

Website and app.warsh.app should share the appropriate first-party anonymous browser identity across Warsh subdomains, subject to the approved eligibility/consent policy. Preserve first-touch campaign attribution and separately record latest non-direct touch. Sanitize referrer and page data; do not send arbitrary query strings.

For Play handoff, generate an opaque, expiring attribution token and associate it with the eligible website visit/campaign server-side. Put only that token and allowlisted campaign values in the Play `referrer` parameter. Retrieve it through Play Install Referrer on Android. Resolve it server-side with validation and bounded retention. This is attribution evidence, not authentication: never authorize an account or blindly merge two authenticated users from a client-supplied token. Establish the anonymous-to-account association only after eligibility and trusted session checks, following the confirmed Mixpanel identity mode. Retain separate website/device identities until that association can safely be made.

An outbound click is not an install; first app execution is not a download counter. Record referrer availability/status and first execution separately. Sideloads, missing referrers, blocked analytics, cross-device visits and unlaunched installs leave gaps. Display unknown attribution honestly; do not use fingerprinting to fill it.

## Event coverage proposal

Instrument every meaningful screen, action, result and failure with semantic events. Do not capture keystrokes, raw input, every render or unbounded network payloads. The following is a coverage contract; confirm each event against actual UI flows before implementing it. Existing names remain compatible unless deliberately versioned.

| Area | Events / coverage |
| --- | --- |
| Website | `website_page_viewed`, `website_section_viewed` (once per section per visit), `website_cta_clicked`, `website_navigation_clicked`, `pricing_plan_selected`, `faq_expanded`, `blog_post_viewed`, `outbound_link_clicked` |
| Acquisition | `play_store_opened`, `web_app_opened`, `install_referrer_resolved`, `app_first_open` (once per installation, eligibility permitting) |
| Navigation/lifecycle | `screen_viewed`, `app_session_started`, `app_foregrounded`, `tab_selected`, `back_pressed` where materially useful |
| Auth/recovery | `auth_method_selected`, `signup_started`, existing `signup_completed`, `signup_failed`, `login_started`, existing `login_completed`, `login_failed`, `password_reset_requested`, `password_reset_completed`, `password_reset_failed`, `logout_completed`, account deletion request/success/failure |
| Onboarding | Screen views, language selection, age eligibility gate, commitment and completion; track only the onboarding steps currently in use. Never send date of birth or a rejected/minor learner's events. |
| Learn | `chapter_opened`, `lesson_selected`, `locked_content_viewed`, existing `lesson_started`/`lesson_completed`, `lesson_step_viewed`, `lesson_step_completed`, `answer_submitted`, `hint_opened`, `lesson_exited`, `lesson_load_failed`, `chapter_test_started`/`chapter_test_completed` |
| Audio/speaking | `audio_play_requested`, `audio_play_started`, `audio_play_completed`, `audio_play_failed`, `speaking_practice_started`/`speaking_practice_completed`; content IDs, media category and safe error codes only |
| Vocabulary/Core 500 | `vocabulary_topic_opened`, `vocabulary_search_submitted` (query length/results count only), `word_viewed`, `word_saved`, `word_unsaved`, `word_meaning_revealed`, `srs_review_started`, `srs_rating_submitted`, existing `srs_review_completed`, `srs_review_exited`, `core500_set_opened` |
| Quran/Tadabbur | `quran_surah_opened`, `quran_page_viewed`, `ayah_selected`, `translation_toggled`, `quran_bookmark_changed`, existing `tadabbur_surah_viewed` wired to its actual surface, `surah_completed` |
| Noor | `noor_conversation_started`, `noor_message_submitted`, existing `noor_message_sent` with documented success semantics, `noor_response_received`, `noor_response_failed`, `noor_limit_reached`, `noor_credits_cta_clicked`; never message/response text |
| Monetization | Existing paywall view plus entry source; `subscription_plan_selected`, `purchase_started`, `purchase_cancelled`, `purchase_failed`, `purchase_pending`, backend-confirmed grant event, restore started/succeeded/failed, credit grant/refund/revocation, subscription renewal/expiry/state transitions |
| Profile/retention | `setting_changed` with allowlisted setting/value, language/goal/commitment changes, notification permission result, notification opened, streak detail/freeze actions, milestone view, share started/completed/cancelled, help opened |
| Failures | Domain-specific failure events with stable error code and operation, connectivity and duration. No raw errors, bearer tokens, email, credentials or request/response bodies. |

Use stable IDs for screens, components and actions rather than localized button text. Use existing `BrandButton` only where explicit analytics metadata is supplied; avoid generic auto-click tracking that leaks text or duplicates a domain event. Instrument non-button controls explicitly. Route templates, not arbitrary URLs, identify dynamic screens; content IDs are separate properties.

## Shared event contract and reliability

Every event: event-schema version, `surface` (`website`, `android`, `web_app`, `backend`), environment, app/site version, session ID, timestamp, event ID/`$insert_id`, UI language and relevant stable screen/action/content IDs. Anonymous device identity and authenticated user identity follow the verified SDK/project identity model.

Campaign fields: allowlisted UTM source/medium/campaign/content/term, first/last touch, landing route, sanitized referrer hostname, attribution status and originating surface. Bound field lengths and cardinality. Session IDs are for grouping, never user identity.

Centralize initialization, eligibility, identity and profile writes behind one adapter per platform. Serialize initialization and identify before eligible authenticated events. Define a bounded queue for eligible events waiting on SDK readiness; do not queue minor/unknown-age personal activity for later replay. Reset identity, profile context and attribution scope safely on logout/account switches; clear pending events for the prior user. Re-check eligibility before draining anything.

Preserve the existing under-18 analytics exclusion. Anonymous marketing analytics require an explicit policy decision because age is not known on the website. Proposed default: aggregate acquisition reporting until eligibility/consent permits individual-level attribution; personal website-to-account stitching is conditional on that decision. Do not quietly claim complete individual funnels while this remains unresolved. If an age/consent UI is needed, design it in Pen before implementation.

Backend business outcomes are authoritative: emit grants, renewals, refunds and revocations only after their database transaction commits, with durable outbox/retry and deterministic event IDs. Enforce eligibility server-side. Keep client purchase attempts distinct from server grants to avoid double-counted revenue. Never include purchase receipts/tokens in analytics.

## Proposed reports

1. Website -> CTA -> eligible first app/web session -> signup -> first completed lesson.
2. Signup -> lesson start -> step/answer drop-off -> lesson completion.
3. Paywall -> plan -> purchase attempt -> backend-confirmed grant.
4. First lesson -> day 1/day 7/day 30 return, using a documented activity event and timezone.
5. Vocabulary, Noor and Quran/Tadabbur adoption and repeat usage.
6. Tracking health: counts by surface/version/environment, unknown campaign rates, missing properties, failures and duplicate business outcomes.

Break down acquisition by campaign, originating page/CTA and destination surface. Annotate the rollout date: missing historical events cannot be backfilled from instrumentation that did not exist.

## Implementation sequence and acceptance

1. Restore Mixpanel connector access. Confirm production project, ingestion region, merge mode, event inventory/volumes, test project and existing reports.
2. Open the Warsh Pen file and add the acquisition/journey proposal and any eligibility UI. Obtain owner design approval, then agree implementation scope, as required by the repository guide. Pencil currently cannot connect to its desktop app, so the Pen step is outstanding.
3. Fix centralized eligibility/profile protection and initialization/identity ordering. Add the browser SDK adapter and safe screen/event contract. Preserve current event names and add coverage in domain slices.
4. Integrate website/landing entry points and subdomain attribution; implement and validate native Play referrer handoff. Add authoritative backend outcome delivery.
5. Validate in a test project: eligible adult, minor/unknown age with zero analytics/profile traffic, cold launch readiness, logout/account switch, web reload/subdomain navigation, denied storage, offline retry, safe payloads and duplicate prevention. Test actual Play-install attribution through an internal tester build; a sideload cannot establish it.
6. Verify browser ingestion and all primary route/action paths, build artifact environment/token presence and Android release gates. Update event descriptions/property definitions in Mixpanel and build reports using observed events. Commit before deployment; deploy the web app after committed web-affecting changes, and release native changes through the normal tested APK/AAB process.

No implementation or deployment has been performed. No tests were run because this change adds only this proposal.

## Primary references

- Mixpanel identity management: https://docs.mixpanel.com/docs/tracking-methods/id-management/identifying-users-simplified
- Mixpanel JavaScript API/configuration: https://github.com/mixpanel/mixpanel-js/blob/master/doc/readme.io/javascript-full-api-reference.md
- Google Play Install Referrer: https://developer.android.com/google/play/installreferrer
