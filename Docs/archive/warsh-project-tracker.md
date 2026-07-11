# Warsh Project Tracker

**Purpose:** Single source of truth for daily project management.
**Last updated:** 2026-06-30
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
2. Run on-device QA against the latest APK for remaining renderer, paywall, and IAP flows.
3. Fill high-priority vocabulary/discover images now that R2 image infrastructure exists.
4. Arrange scholar/content review before public launch.
5. Prepare website/marketing/social layer while store review is blocked.

## Active Priority Queue

| ID | Area | Task | Status | Priority | Next action | Blocker / note | Source |
|---|---|---|---|---|---|---|---|
| W-STORE-001 | Google Play | Track closed testing approval status | IN_PROGRESS | P0 | Check Play Console status during daily review | Closed testing track submitted; waiting on Google's review window | `progress.md` |
| W-QA-003 | Beta QA | Verify VERB_PATTERN on device using `ch09-l01` or `ch34-l02` | QA | P0 | Open target lesson on latest APK and confirm conjugation table renders correctly | Code-reviewed; needs physical-device verification | `progress.md` |
| W-QA-005 | Beta QA | Verify AUDIO_RECOGNITION on device | QA | P0 | Test Ch4-L1 ex9/ex10; confirm R2 audio plays, replay works, options tap correctly | R2-backed audio URLs are populated; OpenAI TTS no longer required | `progress.md` |
| W-QA-006 | Beta QA | Verify WRITE_ARABIC and HARAKAH_PLACEMENT on device | QA | P0 | Confirm keyboard, RTL input, Scheherazade New rendering, and feedback behavior | Code-reviewed; needs physical-device verification | `progress.md` |
| W-QA-007 | Beta QA | Verify paywall after Chapter 1 completion | QA | P0 | Complete/check post-Ch1 flow and confirm paywall appears and loads products | Fixed in code; needs latest APK device confirmation | `progress.md` |
| W-QA-009 | Monetization QA | Verify IAP v14 event-based purchase flow on device | QA | P0 | Test monthly/yearly flow when Play approval allows; confirm no post-purchase error popup | Code fixed 2026-06-11; sandbox testing depends on Play approval | `progress.md` |
| W-QA-010 | Monetization QA | Verify Noor pack product/base-plan mismatch | BLOCKED | P0 | Confirm `warsh-noor-pack` vs `warsh_noor_pack` behavior once IAP is live | Blocked on Google closed testing approval | `progress.md` |
| W-QA-008 | Beta QA | Spot-check Chapters 9-72 | NEXT | P1 | Browse a few lessons per book to catch schema/render issues | Focus on unusual exercise types and locked/progression behavior | `progress.md` |
| W-ASSET-001 | Assets | Upload priority vocabulary word images | NEXT | P1 | Use `exports/vocabulary-image-needed.csv`; start with Quranic terms + high-frequency concrete nouns | 585 vocab words need illustrations | `progress.md` |
| W-ASSET-002 | Assets | Fill high-traffic discover card images | NEXT | P1 | Use `exports/discover-card-vocab-audit.csv`; start Chapters 1-10 | 1,203 discover-card word appearances audited | `progress.md` |
| W-CONTENT-001 | Content Review | Find scholar/content reviewer for Quranic Arabic accuracy | NEXT | P0 | Make shortlist of reviewers and review process | Non-negotiable before public launch | `warsh-master-roadmap.md` |
| W-CONTENT-002 | Content Review | Review generated lesson content for pedagogy and ayah relevance | QA | P0 | Start with Chapters 1-8, then expand | Needs reviewer or structured self-review pass | `progress.md` |
| W-WEB-001 | Website | Create simple landing page/waitlist for Warsh | NEXT | P1 | Define landing page copy and CTA | Domain exists; can proceed when prioritized | `warsh-spec-10` |
| W-MKT-001 | Marketing | Reserve social media handles for Warsh | NEXT | P1 | Check Instagram, TikTok, YouTube, X, Facebook | User account access needed | User goal |
| W-MKT-002 | Marketing | Build first 2-week content plan | LATER | P2 | Create posts from app promise, character, learning clips | Best after handles are reserved | User goal |
| W-LEGAL-001 | Legal | Review privacy policy for beta/public launch | QA | P1 | Check app data, analytics, Sentry, Mixpanel, account deletion, Resend emails, IAP data, R2 audio/images | Existing policy file present | `privacy-policy.html` |

## Done / Stable Enough

| ID | Area | Done item | Status | Source |
|---|---|---|---|---|
| W-DONE-001 | Product | Core Phase 1 app loop implemented | DONE | `progress.md` |
| W-DONE-002 | Content | Chapters 1-72 fixture-authored and validated | DONE | `progress.md` |
| W-DONE-003 | Content | 391 lesson fixtures pass validation with 0 errors | DONE | `progress.md` |
| W-DONE-004 | Backend | Vercel backend operational at `api.warsh.app` | DONE | `progress.md` |
| W-DONE-005 | Database | Neon PostgreSQL production connection, migrations, and production seed verified | DONE | `progress.md` |
| W-DONE-006 | Auth | Register/login/protected routes and password reset email verified | DONE | `progress.md` |
| W-DONE-007 | Mobile | Expo app connects to production backend | DONE | `progress.md` |
| W-DONE-008 | Storage | Cloudflare R2 audio/image infrastructure live | DONE | `progress.md` |
| W-DONE-009 | Build | Release APK/AAB built with `api.warsh.app`; AAB includes Sentry DSN | DONE | `progress.md` |
| W-DONE-010 | Package | Android package verified as `com.warsh.app` | DONE | `progress.md` |
| W-DONE-011 | QA | Backend/app TypeScript, lint, fixture validation, and Urdu audit pass | DONE | `progress.md` |
| W-DONE-012 | Early Device QA | Physical route-load sweep passed for Chapter 1-8 lessons | DONE | `progress.md` |
| W-DONE-013 | Beta QA | Basic Android smoke test passed through Chapter 1 completion and Chapter 2 unlock | DONE | User QA report 2026-06-01 |
| W-DONE-014 | Observability | Mixpanel, mobile/backend Sentry, Sentry email alerts, and UptimeRobot confirmed | DONE | `progress.md` |
| W-DONE-015 | Store | Play products/RTDN configured; RTDN test notification received | DONE | `progress.md` |
| W-DONE-016 | Noor IAP | Noor overage pack backend/mobile flow wired | DONE | `progress.md` |
| W-DONE-017 | Lesson Player | All 15 spec exercise types have renderers | DONE | `progress.md` |
| W-DONE-018 | Urdu | Urdu mode completed end-to-end and audited | DONE | `progress.md` 2026-06-09 |
| W-DONE-019 | Audio | R2-backed lesson/vocabulary audio storage live; `audio_url` populated | DONE | `progress.md` 2026-06-10 |
| W-DONE-020 | IAP | IAP v14 event-based flow, yearly price bug, and restore acknowledgment fixed in code | DONE | `progress.md` 2026-06-11 |
| W-DONE-021 | Images | Dead `assets.warsh.app` image hosting moved to R2 public URL; known missing PNGs need upload | DONE | `progress.md` 2026-06-11 |
| W-DONE-022 | Onboarding | Onboarding simplified to Preview, Name, Language, Register, Permissions, Learn | DONE | `progress.md` 2026-06-10 |

## QA Log

| Date | Area | Result | Follow-up |
|---|---|---|---|
| 2026-06-01 | Android APK smoke test | APK installed on physical device. Login works. Chapter list opens. Lesson opens. User completed two lessons in Chapter 1. Other chapters are locked. | Continue focused renderer/paywall/IAP QA. |
| 2026-06-01 | Progression QA | After completing Chapter 1, Chapter 2 unlocked. Basic progression behavior passed. | Continue advanced QA. |
| 2026-06-01 | Mixpanel/Sentry QA | Mixpanel received mobile events; Sentry received mobile smoke event in production. | Done. |
| 2026-06-30 | Tracker reconciliation | Tracker updated from `progress.md` through 2026-06-11: Urdu, R2 audio/images, IAP v14 flow, paywall trigger, and image-hosting fixes included. | Daily focus should now move to latest-APK on-device QA, Google approval, image uploads, and scholar review. |

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
