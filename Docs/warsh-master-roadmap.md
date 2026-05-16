# Warsh · وَرْش — Master Product Roadmap
## Beta Build Plan

**Created:** 2026-05-10  
**Status:** Active — MVP validated, full beta build approved  
**Purpose:** Single source of truth for what we are building, in what order, and why

---

## Status Change

| Before | After |
|---|---|
| Build minimal MVP to test the idea | Idea validated — build full-fledge app for beta |
| Cut features aggressively | Include all planned features properly |
| Emojis as placeholder visuals | Custom illustrated imagery |
| Basic UI scaffolding | Complete polished UI/UX |
| 5 chapters, 16 lessons | Expanding curriculum — hundreds of chapters planned |
| Test with a small group | Beta release to real users |

Everything from this point forward is built to beta quality — not throwaway scaffolding.

---

## What We Are Building

Warsh is an AI-powered Quranic Arabic learning app. It teaches Nahw (grammar) and Sarf (morphology) through a structured curriculum sourced from Madinah Arabic Reader and Dr. Hafiz Muhammad Zubair's Quranic Grammar series. The experience is gamified, spiritually grounded, and built around the concept of Tadabbur — deep comprehension of the Quran.

**Target user:** A Muslim who prays, recites Quran, but does not understand what they are saying. They want to understand — not just recite.

**Core promise:** "Complete this app and you will understand Al-Fatiha, Juz Amma, and the most common structures in the Quran — in the language they were revealed in."

---

## The Four Pillars

Every feature decision should be measured against these four pillars:

1. **Pedagogically sound** — content and sequencing must be endorsed by Islamic scholarship. Reader leads, Grammar serves. No shortcuts.
2. **Emotionally resonant** — the app should feel like sitting with a patient teacher, not grinding through a language course.
3. **Spiritually connected** — every word, every grammar concept, every milestone ties back to the Quran. Never abstract.
4. **Delightful to use** — premium UI, rich animations, satisfying feedback. A user should feel good opening this app.

---

## Feature Inventory — Complete Beta Scope

### ✅ Already Built (Phase 1)
These exist in code. Need polish and animation layer — not a rebuild.

- Auth — register, login, JWT session
- Onboarding — 8-screen flow with placement
- Smart skip / placement system
- Chapter list (Learn tab)
- 5-beat lesson flow (Hook, Discover, Practice, Reveal, Close)
- 6 exercise types (TRUE_FALSE, TAP_TRANSLATION, FILL_BLANK, BUILD_SENTENCE, TRANSLATE, SPOT_MISTAKE)
- Ustaad Noor AI chat (GPT-4o-mini)
- Al-Fatiha comprehension meter
- Profile / You tab
- Streak tracking (PKT-aware)
- XP system
- Chapter locking / progression enforcement
- 5 chapters, 16 lessons seeded

---

### 🎨 UI/UX Layer — In Progress
Documented in `warsh-ui-sot.md`

**21 screens / 28 states to design and animate.**
Every screen needs to be brought from functional scaffolding to beta-quality UI.

Critical screens (highest user impact):
- Learn tab — chapter cards, Al-Fatiha meter
- Lesson Discover cards — image upgrade from emoji
- Practice exercises — feedback animations
- Exercise feedback overlay
- Lesson completion screen

Full screen list and animation specs → see `warsh-ui-sot.md`

**Estimated effort:** 22–24 working days

---

### 📖 Vocabulary Bank — Next Major Feature
Documented in `warsh-vocabulary-bank.md`

A dedicated مُفْرَدَات tab giving vocabulary a proper home separate from the learning path.

**Sub-features:**
- My Words — lesson-linked personal word bank
- Browse by Topic — 10 curated topic categories
- Word card detail — Arabic, transliteration, translation, Quranic example
- Search — English, Arabic, transliteration
- Word of the Day
- Spaced Repetition Review (SRS) — Phase 2 of this feature

**New screens:** 9 screens (E1–E9)  
**Database:** 2 new tables — VocabularyWord, UserVocabularyProgress  
**New endpoints:** 6  
**Content work:** 200+ curated words, Quranic example sentences, word type classification

Full spec → see `warsh-vocabulary-bank.md`

---

### 🕌 Tadabbur / Quran Comprehension Progression — Planned
Documented in `warsh-quran-comprehension-idea.md`

The Al-Fatiha meter evolves as the curriculum grows. The card always has a live target — what am I working toward in the Quran right now?

**Progression:**
- Phase 1: Al-Fatiha (15 words) ← current
- Phase 2: Juz Amma — short Surahs one by one
- Phase 3: Juz 29, 28 — backwards through the Quran
- Phase 4: Ruku-by-Ruku for long Surahs (Al-Baqarah etc.)

**Feature name:** تَدَبُّر (Tadabbur)  
**Decisions still open** → see `warsh-quran-comprehension-idea.md`

---

### 🔊 Audio — High Priority for Beta
Not yet built. Largest gap versus Duolingo and Kalam.

Every Arabic word needs audio. Every exercise prompt needs audio. The lesson hook ayah needs audio.

**Implementation:**
- OpenAI TTS API for generated audio
- Pre-recorded audio for Quranic ayahs (scholar-recited, not TTS — this is non-negotiable for accuracy and respect)
- Play button on every discover card
- Auto-play option in settings
- Audio in exercise prompts (TAP_TRANSLATION, TRUE_FALSE)

**Cost:** OpenAI TTS ~$0.015 per 1K characters — negligible at beta scale  
**Impact:** Transforms the learning experience. Without audio, Arabic learning is severely limited.  
**Screens affected:** Discover card (C3), All exercise types (C4), Hook beat (C2)

---

### 🏆 Milestone Celebrations — Planned
Not yet built.

Milestone modal fires when:
- A chapter is completed
- Streak reaches 3, 7, 14, 30 days
- XP crosses 100, 500, 1000, 5000
- A Surah comprehension hits 100%
- First lesson completed (Day 1 moment)

Modal shows:
- Achievement title in Arabic
- Relevant hadith or Quranic ayah
- Gold badge animation
- Share button (generate a shareable image — viral growth mechanic)

---

### 📅 Daily Goal System — Planned
Not yet built.

User sets a daily goal during onboarding or from settings:
- 1 lesson per day
- 2 lessons per day
- 5 minutes per day
- 10 minutes per day

Learn tab shows today's goal progress bar. When complete:
- Satisfying completion animation at top of Learn tab
- Streak protection confirmed for the day

---

### 🔁 Streak System Improvements — Planned
Current streak system is basic. For beta it needs:

- **Streak freeze** — earned through XP, one use, prevents streak reset on missed day
- **Grace period** — 1-day grace period where streak shows as "at risk" (amber) before resetting
- **Streak lost screen** — empathetic Noor message, not shame. "Even the great scholars had days of rest."
- **Streak milestones** — celebration at 3, 7, 14, 30, 100 days

---

### 🔍 Lesson Preview — Planned
Not yet built.

Tapping a lesson shows a bottom sheet preview before starting:
- Lesson title + Arabic title
- What you will learn (2-line summary)
- XP available
- Estimated time (based on exercise count)
- "Begin" Gold button

Reduces friction. User knows what they are getting into before committing.

---

### 📴 Offline Support — Planned
Not yet built. Important for Pakistani and South Asian users on mobile networks.

- Cache lesson content in AsyncStorage after first load
- Allow full offline lesson play
- Queue completion data and sync when back online
- Show offline indicator subtly

---

### 🔔 Push Notifications — Planned
Not yet built. Essential for daily habit formation.

- Daily reminder at user-set time
- Streak at risk reminder (if no lesson by evening)
- New content available notification
- Milestone achieved notification

Implementation: Expo Notifications + backend scheduling

---

### ⚙️ Settings Screen — Planned
Not yet built.

- Notification preferences (time, on/off)
- Audio on/off, auto-play on/off
- Daily goal adjustment
- Native language change
- Account management (change name, email, password)
- Delete account

---

### 👤 Enhanced Profile Tab — Planned
Current profile is rebuilt with brand. For beta it needs:

- Vocabulary stats — total words unlocked, words reviewed today
- Learning time — total minutes spent learning (tracked on backend)
- Chapter completion badges (visual trophy row)
- Streak history calendar (GitHub contribution-style heatmap)
- Share profile / stats card

---

### 📊 Admin / Content Dashboard — Internal
Not user-facing. Needed to manage content at scale.

As curriculum grows to hundreds of chapters, manually editing seed files becomes unsustainable.

- Web-based admin panel
- Add/edit chapters, lessons, discover cards, exercises
- Manage vocabulary word bank
- View user analytics (lesson completion rates, drop-off points, common wrong answers)
- Flag exercises with high error rates for review

This is internal tooling — not part of the beta app but needed before content team can scale.

---

## Curriculum Roadmap

### Current State
- 5 chapters, 16 lessons
- Sourced from Madinah Arabic Reader (Dr. Abdur Rahim) + Quranic Grammar (Dr. Hafiz Muhammad Zubair)
- DEV_UNLOCK_ALL = true (must be set false before beta)

### Beta Target
- 20–25 chapters
- 80–100 lessons
- Covers: complete Madinah Book 1, grammar concepts through basic sentence structures, verb introduction

### Long-term Vision
- Hundreds of chapters
- Covers: Madinah Books 1, 2, 3 + Quranic Grammar series fully
- Integrated vocabulary bank growing alongside curriculum
- Tadabbur progression through Juz Amma and beyond

### Content Production Standard (locked)
Every lesson follows the 5-beat structure:
1. Hook — Quranic ayah, no explanation
2. Discover — 10-12 cards, illustration + Arabic + transliteration + translation
3. Practice — 10 exercises across 6 types
4. Reveal — grammar term named, ayah with highlighted word
5. Close — XP, بارك الله فيك, Ustaad Noor tip

Reader leads, Grammar serves — this curriculum philosophy is locked.

---

## Image / Illustration Plan

Current: 204 discover cards using emoji (Phase 1).  
Beta target: Custom flat illustrations for all cards.

**Style:** Flat illustration, minimal detail, warm earth tones (parchment, terracotta, sage, gold), single object centered, no text, Islamic geometric sensibility, 512×512px

**Locked GPT Image prompt:**
> Flat illustration, minimal detail, warm earth tones (parchment, terracotta, sage green, gold), single object centered on off-white background, no text, no shadows, clean vector-like aesthetic, inspired by Islamic geometric sensibility, 512×512px

**Workflow:**
1. Node.js batch script reads all discover card words from database
2. Calls GPT Image API with locked prompt + object name per card
3. Saves to Supabase Storage / Cloudflare R2
4. Updates database image URL field
5. Review for quality and consistency before publishing

**Volume:** 204 current cards + ~400 vocabulary bank words = ~600 images total for beta  
**Cost estimate:** ~$24–48 at DALL-E 3 pricing for 600 images  
**Storage:** CDN-hosted, not bundled in app

---

## Technical Debt to Clear Before Beta

These are known issues from Phase 1 that must be resolved:

| Item | Priority | Note |
|---|---|---|
| `DEV_UNLOCK_ALL = false` | **Critical** | Must be off before any real user touches the app |
| Hardcoded LAN URL in `api.ts` | **Critical** | Production API URL must be configured |
| AI provider error masking in `lib/anthropic.ts` | High | Local fallback masks real errors silently |
| Temporary logs and test artifacts | Medium | Clean before beta commit |
| Missing polished app icon | High | Current icon is placeholder |
| Missing splash screen | High | Not designed yet |
| `OPENAI_API_KEY` in production | **Critical** | Must be set for Noor chat to work for real users |
| `ANTHROPIC_API_KEY` | High | Confirm provider decision |

---

## Navigation Structure — Beta

Current (Phase 1):
```
Bottom tabs: تَعَلَّم | نور | أنت
```

Beta:
```
Bottom tabs: تَعَلَّم | مُفْرَدَات | نور | أنت
```

4 tabs maximum. Vocabulary tab added as second tab. This is the final navigation structure — no more tabs after this.

---

## Build Order — Recommended Sequence

### Stage 1 — Foundation (do this first, everything depends on it)
1. Set `DEV_UNLOCK_ALL = false`
2. Configure production API URL
3. Set production API keys (OpenAI)
4. Polish app icon + splash screen
5. Clean all technical debt items listed above

### Stage 2 — UI/UX Layer (highest user impact)
6. Lesson completion screen (C7) — celebration, XP count-up, confetti
7. Exercise feedback overlay (C5) — shake, flash, sheet slide-up
8. Practice exercise animations (C4) — correct/wrong states
9. Discover card redesign (C3) — image-ready layout, better card
10. Learn tab redesign (B1) — chapter cards, stagger animation
11. Chapter detail screen (C1)
12. Hook beat visual treatment (C2)
13. Reveal beat polish (C6)
14. Profile tab animations (B3)
15. Noor chat polish (B2)
16. Onboarding redesign (A1–A8)
17. Login screen (A9)

### Stage 3 — Image Generation
18. Write batch image generation script
19. Generate Chapter 1 images (40 cards) — review quality
20. Generate all remaining chapter images (164 cards)
21. Generate vocabulary bank images (200+ words)
22. Upload to CDN, update database

### Stage 4 — Vocabulary Bank
23. Database migration — VocabularyWord + UserVocabularyProgress tables
24. Link 204 discover cards to vocabulary word records
25. Backend endpoints — my-words, browse, search, word-of-the-day
26. Vocabulary tab UI — main view, My Words, Browse
27. Word card detail screen
28. Lesson completion hook — auto-add words to bank
29. Search screen
30. Word of the Day card
31. 4-tab navigation update

### Stage 5 — Audio
32. Integrate OpenAI TTS for vocabulary words
33. Source/license scholar-recited audio for Quranic ayahs
34. Play button on discover cards
35. Audio in exercise prompts
36. Audio settings (auto-play toggle)

### Stage 6 — Engagement Features
37. Daily goal system
38. Streak improvements (freeze, grace period, streak lost screen)
39. Lesson preview bottom sheet
40. Milestone celebration system
41. Push notifications

### Stage 7 — Curriculum Expansion
42. Chapters 6–10 (target: complete Madinah Book 1 grammar concepts)
43. Chapters 11–15
44. Chapters 16–20
45. Chapters 21–25
46. Vocabulary bank populated to 200+ curated words with Quranic examples

### Stage 8 — Beta Prep
47. Settings screen
48. Enhanced profile tab (badges, heatmap, learning time)
49. Tadabbur progression — Surah transition logic (post-Fatiha)
50. Offline support
51. Full QA pass on all screens and flows
52. Performance testing
53. Admin content dashboard (internal)
54. Beta release

---

## Effort Estimate — Full Beta

| Stage | Scope | Estimated Effort |
|---|---|---|
| Stage 1 — Foundation | Technical debt, config | 2–3 days |
| Stage 2 — UI/UX | 21 screens, animations | 22–24 days |
| Stage 3 — Images | 600 illustrations, CDN | 3–4 days |
| Stage 4 — Vocabulary Bank | Full feature build | 10–14 days |
| Stage 5 — Audio | TTS + Quranic audio | 5–7 days |
| Stage 6 — Engagement | Goals, streaks, milestones | 8–10 days |
| Stage 7 — Curriculum | 20 more chapters | 20–30 days |
| Stage 8 — Beta Prep | QA, settings, polish | 7–10 days |
| **Total** | | **77–102 working days** |

**One person, full days: 4–5 months**  
**With a team of 2 (one frontend, one content): 2.5–3 months**  
**With a team of 3 (frontend, backend, content): ~2 months**

---

## Team / Resource Gaps

To hit beta in 2–3 months, these roles are needed:

| Role | What they do | Current status |
|---|---|---|
| App developer | React Native, UI implementation, animations | You |
| Backend developer | API endpoints, database, SRS logic | You (or hire) |
| Content / curriculum | Lesson writing, vocabulary sourcing, Quranic examples | Needed |
| Islamic scholar reviewer | Validate all Arabic content for accuracy | Needed — non-negotiable |
| UI/UX designer | Take wireframes to Figma, design system | Needed (or AI-assisted) |
| Illustrator / AI image editor | Generate + QA 600 custom illustrations | Part-time / batch work |

The Islamic scholar reviewer is non-negotiable. Warsh is teaching Quranic Arabic — every word, every ayah reference, every grammar explanation must be reviewed for accuracy. An error in a Quranic context is not a bug, it is a religious mistake. This should be budgeted for from day one.

---

## Decisions Locked

These decisions were made during Phase 1 and do not change:

- Reader leads, Grammar serves — curriculum philosophy
- Madinah Arabic Reader + Dr. Zubair Quranic Grammar — content sources
- Scheherazade New for Arabic, Lora for English — typography
- Ink, Gold, Parchment, Sage, Cream — brand palette
- No hearts, no leaderboards, no skip exams in core flow
- OpenAI GPT-4o-mini for Ustaad Noor chat
- Next.js + Prisma + PostgreSQL (Neon) — backend stack
- Expo SDK — mobile stack
- 5-beat lesson structure — Hook, Discover, Practice, Reveal, Close
- DEV_UNLOCK_ALL must be false before any real user

---

## Decisions Still Open

These need to be decided before the relevant feature is built:

1. **Vocabulary tab label** — مُفْرَدَات vs كَلِمَات vs icon only
2. **Tadabbur feature name** — confirm تَدَبُّر as the permanent name
3. **Audio provider** — OpenAI TTS vs pre-recorded vs hybrid (TTS for vocab, recorded for ayahs)
4. **Quranic ayah audio source** — which reciter / which license
5. **Image style final approval** — review Chapter 1 batch before committing to all 600
6. **SRS algorithm** — SM-2 (standard Anki algorithm) or custom simplified version
7. **Beta distribution** — TestFlight (iOS) + APK sideload (Android) or Play Store / App Store beta track
8. **Scholar reviewer** — who and what is the review process

---

*This is the master document. All other Warsh docs cross-reference this.*  
*Update version and date when scope changes.*  
*Cross-reference: `warsh-ui-sot.md` · `warsh-vocabulary-bank.md` · `warsh-quran-comprehension-idea.md`*
