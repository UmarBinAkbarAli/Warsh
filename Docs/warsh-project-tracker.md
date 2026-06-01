# Warsh Project Tracker

**Purpose:** Single source of truth for daily project management.
**Last updated:** 2026-06-01
**Daily capacity:** 1-2 hours

Use this file to avoid rediscovering priorities from all docs every day. The daily Codex check-ins should read this tracker first, then use the larger docs only when extra detail is needed.

## Status Values

| Status | Meaning |
|---|---|
| NEXT | Highest-leverage upcoming task |
| IN_PROGRESS | Currently being worked on |
| QA | Built/configured but needs verification |
| BLOCKED | Cannot move until an external action happens |
| DONE | Completed and verified enough for now |
| SKIPPED | Intentionally not doing |
| LATER | Real task, but not needed for current beta gate |

## Current Project Phase

Warsh is in **beta hardening and launch preparation**, not raw MVP development.

Main goal right now:
1. Get the Android beta build stable on a real device.
2. Finish beta observability and operational checks.
3. Complete Play Console setup and closed testing flow.
4. Prepare the website/domain/marketing layer.
5. Arrange scholar/content review before public launch.

## Active Priority Queue

| ID | Area | Task | Status | Priority | Next action | Blocker / note | Source |
|---|---|---|---|---|---|---|---|
| W-QA-001 | Beta QA | Install latest release APK on physical Android device | DONE | P0 | None | Installed on physical device 2026-06-01 | `progress.md` |
| W-QA-002 | Beta QA | Smoke-test launch, login, chapter list, lesson open, lesson complete | DONE | P0 | None | Login, chapter list, lesson open, Chapter 1 completion, and Chapter 2 unlock verified 2026-06-01 | `progress.md` |
| W-QA-004 | Beta QA | Verify Chapter 2 unlocks after Chapter 1 completion | DONE | P0 | None | Chapter 2 unlocked after Chapter 1 completion | User QA report |
| W-QA-003 | Beta QA | Verify VERB_PATTERN on device using `ch09-l01` or `ch34-l02` | BLOCKED | P0 | Use dev unlock helper on a test account or progress naturally to target lesson | User has not unlocked target chapters yet; helper exists: `npm run dev:unlock-through -- --email <test-email> --chapter 8` from `warsh-backend` | `progress.md` |
| W-OBS-001 | Observability | Confirm one mobile Sentry event from installed APK | DONE | P0 | None | Physical Android APK sent `Warsh mobile Sentry smoke test` to `warsh-mobile` production on 2026-06-01 | `warsh-beta-progress-report.md` |
| W-OBS-002 | Observability | Validate Mixpanel mobile events and create basic funnel | DONE | P1 | Create activation funnel if not already created | Events received: identify, signup_completed, onboarding, lesson_started, lesson_completed, milestone_unlocked | User screenshot 2026-06-01 |
| W-OBS-003 | Observability | Create Sentry alert rule | NEXT | P1 | Add alert for new/high-volume errors | After Sentry project validation | `progress.md` |
| W-OPS-001 | Operations | Configure uptime monitoring for backend health endpoint | DONE | P1 | Verify monitor remains UP after next scheduled checks | UptimeRobot monitor created 2026-06-01 for `https://warsh-backend.vercel.app/api/health` | `warsh-beta-progress-report.md` |
| W-OPS-002 | Operations | Deploy no-cache health route fix | DONE | P1 | None | Deployed to Vercel production 2026-06-01; live endpoint returns `Cache-Control: no-store, max-age=0` and fresh timestamps | Local code change |
| W-STORE-001 | Google Play | Track closed testing approval status | IN_PROGRESS | P0 | Check Play Console status during daily review | Waiting on Google review window | `progress.md` |
| W-STORE-002 | Google Play | Build/upload AAB if Play Console requires bundle format | NEXT | P0 | Confirm required artifact type, then build AAB | Depends on Play Console flow | `progress.md` |
| W-STORE-003 | Google Play | Configure IAP products: `warsh_monthly`, `warsh_annual` | BLOCKED | P0 | Set products once console allows | Blocked until Play setup approval/unlock | `warsh-spec-10` |
| W-STORE-004 | Google Play | Configure RTDN webhook | BLOCKED | P1 | Point RTDN to `POST /api/webhooks/google` | Blocked until Play Console setup | `progress.md` |
| W-STORE-005 | Monetization QA | Run sandbox purchase and restore tests | BLOCKED | P0 | Test monthly/annual purchase and restore | Depends on IAP products and credentials | `progress.md` |
| W-DOM-001 | Domain | Purchase production domain, ideally `warsh.app` if available | NEXT | P1 | Check availability and buy chosen domain | User decision/payment needed | `warsh-beta-progress-report.md` |
| W-DOM-002 | Domain | Configure backend and asset domains | BLOCKED | P1 | Set `api.warsh.app` and `assets.warsh.app` DNS/SSL | Depends on W-DOM-001 | `warsh-beta-progress-report.md` |
| W-WEB-001 | Website | Create simple landing page/waitlist for Warsh | NEXT | P1 | Define landing page copy and CTA | Domain can be temporary at first | `warsh-spec-10` |
| W-MKT-001 | Marketing | Reserve social media handles for Warsh | NEXT | P1 | Check Instagram, TikTok, YouTube, X, Facebook | User account access needed | User goal |
| W-MKT-002 | Marketing | Build first 2-week content plan | LATER | P2 | Create posts from app promise, character, learning clips | Best after handles are reserved | User goal |
| W-CONTENT-001 | Content Review | Find scholar/content reviewer for Quranic Arabic accuracy | NEXT | P0 | Make shortlist of reviewers and review process | Non-negotiable before public launch | `warsh-master-roadmap.md` |
| W-CONTENT-002 | Content Review | Review generated lesson content for pedagogy and ayah relevance | QA | P0 | Start with Chapters 1-8, then expand | Needs reviewer or structured self-review pass | `progress.md` |
| W-LEGAL-001 | Legal | Review privacy policy for beta/public launch | QA | P1 | Check app data, analytics, Sentry, Mixpanel, account deletion | Existing policy file present | `privacy-policy.html` |

## Done / Stable Enough

| ID | Area | Done item | Status | Source |
|---|---|---|---|---|
| W-DONE-001 | Product | Core Phase 1 app loop implemented | DONE | `progress.md` |
| W-DONE-002 | Content | Chapters 1-72 fixture-authored and validated | DONE | `progress.md` |
| W-DONE-003 | Content | 391 lesson fixtures pass validation with 0 errors | DONE | `progress.md` |
| W-DONE-004 | Backend | Vercel backend operational | DONE | `warsh-beta-progress-report.md` |
| W-DONE-005 | Database | Neon PostgreSQL production connection and migrations verified | DONE | `warsh-beta-progress-report.md` |
| W-DONE-006 | Auth | Register/login/protected routes verified | DONE | `warsh-beta-progress-report.md` |
| W-DONE-007 | Mobile | Expo app connects to production backend | DONE | `warsh-beta-progress-report.md` |
| W-DONE-008 | Storage | Cloudflare R2 bucket configured with temporary public URL | DONE | `warsh-beta-progress-report.md` |
| W-DONE-009 | Build | Local Android release APK built and signed | DONE | `progress.md` |
| W-DONE-010 | Package | Android package verified as `com.warsh.app` | DONE | `progress.md` |
| W-DONE-011 | Backend QA | Backend and app TypeScript checks pass | DONE | `progress.md` |
| W-DONE-012 | Early Device QA | Physical route-load sweep passed for Chapter 1-8 lessons | DONE | `progress.md` |
| W-DONE-013 | Beta QA | Latest APK installed on physical Android device | DONE | User QA report 2026-06-01 |
| W-DONE-014 | Beta QA | Basic Android smoke test passed through Chapter 1 completion and Chapter 2 unlock | DONE | User QA report 2026-06-01 |
| W-DONE-015 | Observability | Mixpanel mobile events received from physical APK session | DONE | User screenshot 2026-06-01 |
| W-DONE-016 | Observability | Sentry backend performance traces received | DONE | Sentry account check 2026-06-01 |
| W-DONE-017 | Observability | Sentry mobile event received from physical Android APK | DONE | User screenshot 2026-06-01 |

## QA Log

| Date | Area | Result | Follow-up |
|---|---|---|---|
| 2026-06-01 | Android APK smoke test | APK installed on physical device. Login works. Chapter list opens. Lesson opens. User completed two lessons in Chapter 1. Other chapters are locked. | Finish all Chapter 1 lessons, then verify Chapter 2 unlocks. |
| 2026-06-01 | Progression QA | After completing Chapter 1, Chapter 2 unlocked. Basic progression behavior passed. | Continue with VERB_PATTERN QA, mobile Sentry event, and Mixpanel validation. |
| 2026-06-01 | Mixpanel QA | Mixpanel is receiving physical APK events: identify, signup/onboarding events, lesson_started, lesson_completed, and milestone_unlocked. | Mark Mixpanel event ingestion done; later create funnel/dashboard. |
| 2026-06-01 | Sentry QA | No mobile Sentry event visible yet. This does not prove failure unless a known Sentry test event or crash was triggered. | Add or trigger a safe mobile Sentry smoke event and verify delivery. |
| 2026-06-01 | VERB_PATTERN QA | Not tested yet because target lessons are locked behind progression. | Use dev unlock helper for a test account or keep natural progression. |
| 2026-06-01 | Sentry account check | Sentry has `warsh-backend` and `warsh-mobile` projects. `warsh-backend` is receiving trace samples for API routes. Issues page shows no unresolved issues across all projects. | Still need explicit mobile smoke event in `warsh-mobile`. |
| 2026-06-01 | Mobile Sentry smoke path | Added opt-in Settings row gated by `EXPO_PUBLIC_ENABLE_SENTRY_SMOKE=true`. TypeScript check passes. | Rebuild APK with the flag, install, send test event, verify in `warsh-mobile`. |
| 2026-06-01 | Backend health monitor prep | `/api/health` route updated locally to force dynamic/no-store response; backend build passes. | Deploy backend, then create UptimeRobot HTTPS monitor for `/api/health`. |
| 2026-06-01 | UptimeRobot setup | Created first HTTP(s) monitor for `https://warsh-backend.vercel.app/api/health`; onboarding reached "Your monitor is ready now." | Deploy health-route no-cache fix and verify the monitor remains UP. |
| 2026-06-01 | Backend deploy | Deployed backend production to Vercel. Added root `.vercelignore` after first upload attempt tried to upload local artifacts. Verified `https://warsh-backend.vercel.app/api/health` returns 200, `Cache-Control: no-store, max-age=0`, and changing timestamps. | Watch UptimeRobot for UP status. Separately fix Sentry source map project config if source map uploads are required. |
| 2026-06-01 | Mobile Sentry smoke APK | Built release APK with Sentry smoke-test flag enabled. Verified bundle contains backend URL, Sentry DSN, Mixpanel token, and smoke-test code. | Install APK, send Settings smoke event, then confirm event appears in Sentry `warsh-mobile`. |
| 2026-06-01 | Mobile Sentry QA | Physical Android APK sent `Warsh mobile Sentry smoke test` to Sentry `warsh-mobile`; event shows Android 11, release `1.0.1 (2)`, environment `production`. | Mark mobile Sentry ingestion done; next create Sentry alert rule. |

## Skipped / Deferred

| ID | Area | Item | Status | Reason |
|---|---|---|---|---|
| W-LATER-001 | iOS | Apple App Store Connect setup | LATER | Android-first beta strategy |
| W-LATER-002 | Domain | Custom domains before domain purchase | BLOCKED | `warsh.app` or alternative domain not purchased yet |
| W-LATER-003 | Pronunciation AI | Automatic pronunciation scoring | LATER | Phase 2; high complexity and uncertain accuracy |
| W-LATER-004 | Scaling | Upstash Redis for chat rate limiting | LATER | Only needed if DB-count latency appears under load |

## Daily Check-In Template

### Morning

- Yesterday's state:
- Today's one P0/P1 task:
- Backup task if time remains:
- Expected proof of progress:

### Evening

- Done:
- Blocked:
- New bug/risk:
- Tracker updates needed:
- Tomorrow's likely next task:

## Weekly Review Template

- Biggest progress this week:
- Biggest blocker:
- Beta readiness change:
- Tasks moved to DONE:
- Tasks added:
- Tasks skipped/deferred:
- Next week's top 3:
