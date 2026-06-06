# Warsh Project Tracker

**Purpose:** Single source of truth for daily project management.
**Last updated:** 2026-06-06
**Daily capacity:** 1-2 hours

Use this file to avoid rediscovering priorities from all docs every day. Daily Codex check-ins should read this tracker first, then use `progress.md` only when extra detail is needed.

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
1. Wait for Google Play closed testing approval.
2. Continue on-device QA for remaining lesson renderers and paywall behavior.
3. Arrange scholar/content review before public launch.
4. Prepare website/marketing/social layer while store review is blocked.

## Active Priority Queue

| ID | Area | Task | Status | Priority | Next action | Blocker / note | Source |
|---|---|---|---|---|---|---|---|
| W-STORE-001 | Google Play | Track closed testing approval status | IN_PROGRESS | P0 | Check Play Console status during daily review | Closed testing track submitted; waiting on Google's review window | `progress.md` |
| W-QA-003 | Beta QA | Verify VERB_PATTERN on device using `ch09-l01` or `ch34-l02` | QA | P0 | Open target lesson on latest APK and confirm conjugation table renders correctly | No longer blocked if dev unlock/test account is available; otherwise progress naturally | `progress.md` |
| W-QA-005 | Beta QA | Verify AUDIO_RECOGNITION on device | QA | P0 | Test Ch4-L1 ex9/ex10; confirm audio plays and options tap correctly | Renderer now auto-plays via TTS from `arabic_text` | `progress.md` |
| W-QA-006 | Beta QA | Verify WRITE_ARABIC and HARAKAH_PLACEMENT on device | QA | P0 | Confirm keyboard, RTL input, and feedback behavior | New renderers need physical-device verification | `progress.md` |
| W-QA-007 | Beta QA | Verify paywall after Chapter 1 completion | QA | P0 | Complete/check post-Ch1 flow and confirm paywall appears correctly | Last unconfirmed beta gate item from `progress.md` | `progress.md` |
| W-QA-008 | Beta QA | Spot-check Chapters 9-72 | NEXT | P1 | Browse a few lessons per book to catch schema/render issues | Focus on unusual exercise types and locked/progression behavior | `progress.md` |
| W-STORE-005 | Monetization QA | Run sandbox purchase and restore tests | BLOCKED | P0 | Test monthly/yearly purchase, Noor pack purchase, and restore after approval | Blocked on Google closed testing approval | `progress.md` |
| W-CONTENT-001 | Content Review | Find scholar/content reviewer for Quranic Arabic accuracy | NEXT | P0 | Make shortlist of reviewers and review process | Non-negotiable before public launch; highest non-blocked launch-readiness task | `warsh-master-roadmap.md` |
| W-CONTENT-002 | Content Review | Review generated lesson content for pedagogy and ayah relevance | QA | P0 | Start with Chapters 1-8, then expand | Needs reviewer or structured self-review pass | `progress.md` |
| W-WEB-001 | Website | Create simple landing page/waitlist for Warsh | NEXT | P1 | Define landing page copy and CTA | Domain exists; can proceed when prioritized | `warsh-spec-10` |
| W-MKT-001 | Marketing | Reserve social media handles for Warsh | NEXT | P1 | Check Instagram, TikTok, YouTube, X, Facebook | User account access needed | User goal |
| W-MKT-002 | Marketing | Build first 2-week content plan | LATER | P2 | Create posts from app promise, character, learning clips | Best after handles are reserved | User goal |
| W-LEGAL-001 | Legal | Review privacy policy for beta/public launch | QA | P1 | Check app data, analytics, Sentry, Mixpanel, account deletion, Resend emails, and IAP data | Existing policy file present | `privacy-policy.html` |

## Done / Stable Enough

| ID | Area | Done item | Status | Source |
|---|---|---|---|---|
| W-DONE-001 | Product | Core Phase 1 app loop implemented | DONE | `progress.md` |
| W-DONE-002 | Content | Chapters 1-72 fixture-authored and validated | DONE | `progress.md` |
| W-DONE-003 | Content | 391 lesson fixtures pass validation with 0 errors | DONE | `progress.md` |
| W-DONE-004 | Backend | Vercel backend operational | DONE | `progress.md` |
| W-DONE-005 | Database | Neon PostgreSQL production connection and migrations verified | DONE | `progress.md` |
| W-DONE-006 | Auth | Register/login/protected routes verified | DONE | `progress.md` |
| W-DONE-007 | Mobile | Expo app connects to production backend | DONE | `progress.md` |
| W-DONE-008 | Storage | Cloudflare R2 bucket configured with temporary public URL | DONE | `progress.md` |
| W-DONE-009 | Build | Local Android release APK built and signed | DONE | `progress.md` |
| W-DONE-010 | Package | Android package verified as `com.warsh.app` | DONE | `progress.md` |
| W-DONE-011 | Backend QA | Backend and app TypeScript checks pass | DONE | `progress.md` |
| W-DONE-012 | Early Device QA | Physical route-load sweep passed for Chapter 1-8 lessons | DONE | `progress.md` |
| W-DONE-013 | Beta QA | Latest APK installed on physical Android device | DONE | User QA report 2026-06-01 |
| W-DONE-014 | Beta QA | Basic Android smoke test passed through Chapter 1 completion and Chapter 2 unlock | DONE | User QA report 2026-06-01 |
| W-DONE-015 | Observability | Mixpanel mobile events received from physical APK session | DONE | User screenshot 2026-06-01 |
| W-DONE-016 | Observability | Sentry backend performance traces received | DONE | Sentry account check 2026-06-01 |
| W-DONE-017 | Observability | Sentry mobile event received from physical Android APK | DONE | User screenshot 2026-06-01 |
| W-DONE-018 | Observability | Sentry email notifications confirmed working | DONE | `progress.md` 2026-06-06 |
| W-DONE-019 | Operations | UptimeRobot monitors `https://api.warsh.app/api/health` every 5 minutes | DONE | `progress.md` 2026-06-06 |
| W-DONE-020 | Domain | `api.warsh.app` live on Vercel | DONE | `progress.md` 2026-06-06 |
| W-DONE-021 | Email | Resend configured and password reset email delivery confirmed | DONE | `progress.md` 2026-06-06 |
| W-DONE-022 | Store | Play products `warsh_monthly`, `warsh_yearly`, and `warsh_noor_pack` created | DONE | `progress.md` 2026-06-06 |
| W-DONE-023 | Store | RTDN webhook live and Play test notification received | DONE | `progress.md` 2026-06-06 |
| W-DONE-024 | Build | Release AAB rebuilt with `api.warsh.app` and Sentry DSN | DONE | `progress.md` 2026-06-06 |
| W-DONE-025 | Production | `DATABASE_URL` restored and backend deploys self-contained with vendored lesson schema | DONE | `progress.md` 2026-06-06 |
| W-DONE-026 | Production Data | Production seed refreshed while preserving 12 users | DONE | `progress.md` 2026-06-06 |
| W-DONE-027 | Noor IAP | Noor overage pack purchase flow wired end-to-end | DONE | `progress.md` 2026-06-06 |
| W-DONE-028 | Lesson Player | All 15 spec exercise types have renderers | DONE | `progress.md` 2026-06-06 |
| W-DONE-029 | Audio | Auto-play TTS wired for Discover and AUDIO_RECOGNITION | DONE | `progress.md` 2026-06-05 |

## QA Log

| Date | Area | Result | Follow-up |
|---|---|---|---|
| 2026-06-01 | Android APK smoke test | APK installed on physical device. Login works. Chapter list opens. Lesson opens. User completed two lessons in Chapter 1. Other chapters are locked. | Finish all Chapter 1 lessons, then verify Chapter 2 unlocks. |
| 2026-06-01 | Progression QA | After completing Chapter 1, Chapter 2 unlocked. Basic progression behavior passed. | Continue renderer QA and monetization QA. |
| 2026-06-01 | Mixpanel QA | Mixpanel is receiving physical APK events: identify, signup/onboarding events, lesson_started, lesson_completed, and milestone_unlocked. | Later create funnel/dashboard. |
| 2026-06-01 | Sentry QA | Physical Android APK sent `Warsh mobile Sentry smoke test` to Sentry `warsh-mobile`; event shows Android 11, release `1.0.1 (2)`, environment `production`. | Mobile Sentry ingestion done. |
| 2026-06-06 | Tracker reconciliation | `progress.md` shows all manual YOU-items complete: domain, Resend, Noor pack, RTDN, production seed, and Sentry alerts. Closed testing remains blocked on Google's review window. | Daily focus should move to on-device QA and scholar/content review, not infrastructure setup. |

## Skipped / Deferred

| ID | Area | Item | Status | Reason |
|---|---|---|---|---|
| W-LATER-001 | iOS | Apple App Store Connect setup | LATER | Android-first beta strategy |
| W-LATER-002 | Pronunciation AI | Automatic pronunciation scoring | LATER | Phase 2; high complexity and uncertain accuracy |
| W-LATER-003 | Scaling | Upstash Redis for chat rate limiting | LATER | Only needed if DB-count latency appears under load |

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
