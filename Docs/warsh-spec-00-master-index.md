# Warsh · وَرْش — App Specification
## File 00: Master Index

**Status:** Active — Source of Truth
**Version:** 1.0
**Last updated:** 2026-06-05

> This is the master index for the Warsh App Specification. The specification consists of 14 files (this index + 13 specification files) that together define every feature, every screen, every word of copy, every line of the data model, and every operational concern for the Warsh app.

---

## How to use this specification

This specification is the **source of truth** for building Warsh. It is structured to be:

- **Complete** — every product, design, and engineering decision is captured
- **Consistent** — files reference each other; no contradictions
- **Buildable** — the developer (you, future Umar) can execute against it without making product decisions during the build

**Reading order for first-time review:**

1. File 01 (Identity & Principles) — understand what Warsh is
2. File 02 (Information Architecture) — see the full map of screens
3. Files 03–10 in order — feature areas
4. File 11 (Design System & Copy) — visual and copy reference
5. File 12 (Data Model & API) — backend reference
6. File 13 (Technical & Infrastructure) — operations and deployment

**Reading order for build execution:**

1. File 13 first — set up the environment
2. File 12 — implement the data model and API endpoints
3. File 01, 02 — understand the design vision
4. File 11 — implement design tokens and components
5. Then work through screens by area:
   - Files 03 (Onboarding) → 04 (Lessons) → 06 (Speaking) → 07 (Vocabulary & Tadabbur) → 08 (Engagement) → 09 (Noor) → 10 (Monetization)
6. File 05 — produce content in parallel

---

## File catalog

### Foundation

**[File 01: Identity & Principles](./warsh-spec-01-identity-and-principles.md)**
What Warsh is, who it's for, the four pillars, the Warmth Principle, every locked decision, what Warsh is NOT, Ustaad Noor's character. This is the file every other file references. *If something in another file contradicts File 01, File 01 wins.*

### Architecture

**[File 02: Information Architecture](./warsh-spec-02-information-architecture.md)**
The 4 tabs, all 62 screens identified and numbered, the complete navigation graph, screen ID conventions, empty states, loading states, error states.

### Feature areas

**[File 03: Onboarding & Auth](./warsh-spec-03-onboarding-and-auth.md)**
Splash, the 7-screen preview experience, 10-screen onboarding flow, returning user flow, password reset. Includes full copy for every screen.

**[File 04: Lesson System](./warsh-spec-04-lesson-system.md)**
The 4 lesson templates (Standard, Spoken Phrases, Review, Verb Pattern), all 15 exercise types with full specifications, the lesson player engine, XP economy, chapter unlocking logic. The largest file in the spec.

**[File 05: Curriculum & Content](./warsh-spec-05-curriculum-and-content.md)**
The 72-chapter mapping from Madinah Reader, Book 1 fully detailed (Chapters 1–10), Books 2–8 placeholder structure, Tadabbur Surah mapping, REVIEW and SPOKEN_PHRASES insertion points, content production standards.

**[File 06: Spoken Fus'ha](./warsh-spec-06-spoken-fusha.md)**
SHADOW_REPEAT exercise specification, SPOKEN_PHRASES lesson structure, audio capture and comparison playback, microphone permission flow, speaking stats system.

**[File 07: Vocabulary & Tadabbur](./warsh-spec-07-vocabulary-and-tadabbur.md)**
The Vocabulary Bank (600+ words, free forever), all 6 vocabulary tab screens, word data model, 16 topic categories, SRS algorithm (SM-2), Word of the Day, the complete Tadabbur progression UI and logic, integration between vocabulary and Tadabbur.

**[File 08: Engagement Features](./warsh-spec-08-engagement-features.md)**
XP system, streak with 4 AM boundary, streak freezes, daily goal, 50+ milestones across 8 categories, push notifications with Noor-voiced copy, share mechanics, engagement metrics targets.

**[File 09: Ustaad Noor](./warsh-spec-09-ustaad-noor.md)**
Noor's character and scope, the complete system prompt, chat interface, message limits (5/day), overage pack pricing ($0.99 for 20), safety guardrails, cost economics.

**[File 10: Monetization & Launch](./warsh-spec-10-monetization-and-launch.md)**
$1/month and $10/year pricing, 7-day trial mechanics, the "Chapter 1 OR 7 days" rule, paywall design, IAP integration, restore purchases, cancellation, account deletion, phased launch strategy, App Store listing copy, unit economics.

### Reference

**[File 11: Design System & Copy](./warsh-spec-11-design-system-and-copy.md)**
The 5 brand color tokens, Lora + Scheherazade New typography, 8-point spacing grid, complete component library, animation timings, sound and haptic inventories, illustration style and AI generation prompt, ~600 UI strings drafted in English.

**[File 12: Data Model & API](./warsh-spec-12-data-model-and-api.md)**
Complete Prisma database schema (22 models), ~50 API endpoints with request/response shapes, error code catalog, data flow patterns, caching strategy, performance targets, security model.

**[File 13: Technical & Infrastructure](./warsh-spec-13-technical-and-infrastructure.md)**
Stack confirmation, repository structure, environment variables, deployment pipeline (Vercel, EAS Build, OTA), monitoring (Sentry, Mixpanel), 70-item pre-launch checklist, operations playbook, cost projections.

---

## Critical locked decisions (cross-cutting summary)

For quick reference, these decisions span multiple files and define the product:

### Product positioning

- **What it teaches:** Classical Fus'ha — read, understand, speak the Arabic of the Quran, scholarship, and worship
- **What it's not:** Conversational dialect (Khaleeji, Egyptian, Levantine)
- **Target user:** Pakistani / South Asian Muslim who prays, recites Quran, doesn't yet understand it
- **Core promise:** "Complete Warsh and you will understand Al-Fatiha, Juz Amma, and the most common structures of the Quran"

### Curriculum

- **Source:** Madinah Arabic Reader (8 books, 72 lessons) + Dr. Hafiz Muhammad Zubair's YouTube lectures + Quran
- **Philosophy:** Reader leads, Grammar serves
- **Structure:** 72 Warsh chapters, ~380 lessons, 15 REVIEW lessons, 11 SPOKEN_PHRASES lessons
- **Tadabbur progression:** Al-Fatiha → An-Nas → Al-Falaq → Al-Ikhlas → ... → Al-Fil (11 Surahs in Phase 2)

### App structure

- **4 tabs only:** Learn · Vocabulary · Noor · You
- **62 unique screens** including modals
- **Lesson templates:** Standard (5-beat), Spoken Phrases (4-beat), Review (4-beat), Verb Pattern (5-beat)
- **15 exercise types** including SHADOW_REPEAT and AUDIO_RECOGNITION
- **No hearts, no leaderboards, no public profiles, no shame mechanics**

### AI

- **Noor:** GPT-4o-mini, 5 messages/day, no persistent memory
- **Overage:** $0.99 for 20 extra messages
- **Audio TTS:** OpenAI TTS for vocabulary; human recital for Quranic ayat
- **Pronunciation scoring:** None in v1

### Monetization

- **Pricing:** $1/month or $10/year
- **Trial:** 7 days OR completion of Chapter 1, whichever first
- **Vocabulary Bank:** Free forever, even post-trial
- **Payment:** Apple IAP / Google Play Billing only

### Design

- **Colors:** Ink, Gold, Parchment, Sage, Cream (5-token palette)
- **Typography:** Lora (Latin) + Scheherazade New (Arabic)
- **Language modes:** English and Urdu UI; Arabic content identical in both
- **Visual language:** Parchment-toned, classical, scholarly, warm — never cartoonish

### Technical

- **Mobile:** Expo SDK 51, React Native, TypeScript
- **Backend:** Next.js 14, Prisma 7, PostgreSQL on Neon
- **Storage:** Cloudflare R2 for audio/images
- **Auth:** JWT (HS256)
- **Hosting:** Vercel
- **Push:** Expo Notifications + FCM
- **Errors:** Sentry · Analytics: Mixpanel

### Launch

- **Initial market:** Pakistan
- **Platforms:** Google Play (Android) first, App Store (iOS) follow-up
- **Strategy:** Phased — Internal alpha → Closed beta → Open beta → Soft launch → Public launch
- **Year 1 target:** 50,000 MAU, 10,000 paid subscribers, $6,000+ MRR

---

## What's NOT in this specification

Things explicitly out of v1 scope (documented in their relevant files):

- Automated pronunciation scoring (File 01, File 06)
- Recurring world environments / character returns (File 01)
- Multi-dialect support (File 01)
- Social features / public profiles / leaderboards (File 01)
- Live tutor sessions (File 01)
- Certificates and credentials (File 01)
- Family / group accounts (File 01)
- Children's mode (File 01)
- iPad-optimized layouts (File 01)
- Web app (File 01, File 13)
- Persistent cross-session Noor memory (File 09)
- Voice input for Noor chat (File 09)
- Dark mode (File 11)
- Lifetime purchase tier (File 10)
- Per-region pricing optimization (File 10)
- Referral program (File 10)
- B2B / institutional licensing (File 10)

These may appear in v1.1, v2, or v3+, with prioritization based on actual user feedback from beta and v1 launch.

---

## How to update the specification

When a decision changes:

1. **Identify the affected files** — most changes touch multiple files
2. **Update File 01 first** if the change affects locked decisions
3. **Update each affected file** with the new specification
4. **Update each file's changelog** with version increment and date
5. **Update this Master Index** if the file structure changes
6. **Communicate the change** if a team is involved

If you're tempted to change something that's listed as **locked**: pause. Ask whether the change is truly necessary, or whether you're scope-creeping. Locked decisions exist to prevent the spec from becoming a moving target.

---

## Spec file size summary

| File | Approx. pages | Approx. word count |
|---|---|---|
| 00 Master Index | 5 | 1,800 |
| 01 Identity & Principles | 20 | 7,500 |
| 02 Information Architecture | 22 | 8,200 |
| 03 Onboarding & Auth | 25 | 9,100 |
| 04 Lesson System | 38 | 14,000 |
| 05 Curriculum & Content | 32 | 11,500 |
| 06 Spoken Fus'ha | 22 | 8,300 |
| 07 Vocabulary & Tadabbur | 28 | 10,400 |
| 08 Engagement Features | 30 | 11,200 |
| 09 Ustaad Noor | 22 | 8,500 |
| 10 Monetization & Launch | 30 | 11,000 |
| 11 Design System & Copy | 40 | 14,500 |
| 12 Data Model & API | 32 | 12,000 |
| 13 Technical & Infrastructure | 30 | 11,000 |
| **Total** | **~356 pages** | **~139,000 words** |

This is a substantial specification. It is intentionally comprehensive — the goal is that **no product decision needs to be made during the build phase**. Every question has an answer in these files.

---

## Acknowledgments

This specification was developed collaboratively between Umar (founder, product lead, sole engineer) and Claude (specification co-author).

Source materials:
- Madinah Arabic Reader by Dr. V. Abdur Rahim
- Dr. Hafiz Muhammad Zubair's Quranic Grammar lecture series (used with permission)
- The Holy Quran

May this app serve the Muslim community well, in shaa Allah.

---

## Changelog

**2026-06-05 — v1.1**
- `api.warsh.app` custom domain live on Vercel; all `warsh-backend.vercel.app` references replaced throughout codebase and docs

**2026-05-19 — v1.0**
- Initial complete specification (Files 00–13) drafted and locked
- All 13 specification files cross-referenced
- Critical decisions documented
- Out-of-scope features explicitly listed

---

*End of File 00 (Master Index).*
*Begin building.*
