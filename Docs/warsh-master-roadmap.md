# Warsh · وَرْش — Master Product Roadmap
## Beta Build Plan

**Created:** 2026-05-10
**Last updated:** 2026-05-17
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
| Reading-and-understanding only | Reading, understanding, **and speaking** classical Arabic |

Everything from this point forward is built to beta quality — not throwaway scaffolding.

---

## What We Are Building

Warsh is an AI-powered classical Arabic learning app. It teaches Nahw (grammar), Sarf (morphology), and spoken Fus'ha through a structured curriculum sourced from Madinah Arabic Reader and Dr. Hafiz Muhammad Zubair's Quranic Grammar series. The experience is gamified, spiritually grounded, and built around the concept of Tadabbur — deep comprehension of the Quran.

**Warsh teaches Quranic Arabic as a living classical language — read it in the mushaf, hear it in khutbahs, speak it in halaqas, understand it in worship.**

**Target user:** A Muslim who prays, recites Quran, but does not understand what they are saying. They want to understand, read, and speak the classical Arabic that lives in revelation, scholarship, and worship.

**Core promise:** "Complete this app and you will understand Al-Fatiha, Juz Amma, and the most common structures in the Quran — and be able to read, hear, and speak the classical Arabic they were revealed in."

**What Warsh is honest about:**
Fus'ha is the language of the Quran, Hadith, khutbahs, Islamic lectures, news, formal writing, and scholarly discourse across all 22 Arab countries. It is **not** the casual dialect spoken in homes and streets — that varies by region (Khaleeji, Levantine, Egyptian, Maghrebi). Warsh teaches the register that matters for worship, scholarship, and religious life. A user who finishes Warsh can speak with imams, scholars, and teachers anywhere in the Arab world — and has a 10x stronger foundation for picking up any dialect later.

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
- 15 chapters, 60 lessons seeded (Warsh reader curriculum)

---

### 🎨 UI/UX Layer — In Progress
Documented in `warsh-ui-sot.md`

**21 screens / 28 states to design and animate.**
Every screen needs to be brought from functional scaffolding to beta-quality UI.

Critical screens (highest user impact):
- Learn tab — chapter cards, Al-Fatiha meter
- Lesson Discover cards — image upgrade from emoji, **audio play button**
- Practice exercises — feedback animations
- Exercise feedback overlay
- Lesson completion screen

Full screen list and animation specs → see `warsh-ui-sot.md`

**Estimated effort:** 22–24 working days

---

### 🔊 Audio — Promoted to Core UI Layer
**Status changed:** Audio is no longer a Stage 5 add-on. It is now part of the core lesson UX and ships with the UI/UX layer.

Every Arabic word, phrase, and ayah is heard, not just read. Audio is foundational — without it, the speaking dimension cannot exist.

**Implementation:**
- OpenAI TTS API for generated audio (vocabulary, phrases, exercise prompts)
- Pre-recorded audio for Quranic ayahs (scholar-recited, not TTS — non-negotiable for accuracy and respect)
- Visible 🔊 play button on every discover card
- Auto-play option in settings (default on for new users)
- Audio in exercise prompts (TAP_TRANSLATION, TRUE_FALSE, SHADOW_REPEAT)
- Audio for the Reveal beat ayah
- Cached locally on first play to keep replay snappy and offline-friendly

**Cost:** OpenAI TTS ~$0.015 per 1K characters — negligible at beta scale
**Impact:** Transforms the learning experience from reading-only to read + hear + speak
**Screens affected:** Discover card (C3), All exercise types (C4), Hook beat (C2), Reveal beat (C6)

---

### 🗣️ Spoken Fus'ha Practice — New for Beta
Not yet built. This is the new dimension that addresses the speaking question without changing the product category.

Warsh teaches users to *speak* the classical Arabic of revelation, scholarship, and worship — not casual dialect. Speaking is woven into the existing lesson structure, not bolted on as a separate mode.

**Two mechanisms:**

**1. New exercise type: SHADOW_REPEAT**
Added to the Practice beat alongside the existing 6 exercise types.
- User sees an Arabic word/phrase
- Taps to hear the correct Fus'ha pronunciation
- Taps the mic to record themselves saying it
- Hears their recording played back side-by-side with the original
- No AI scoring, no judgment — just listen-and-compare
- User taps "next" when they feel ready

This is cheap to build (record + playback, no STT/ASR needed), it raises the "this app teaches me to speak" signal massively, and it builds the user's ear and mouth simultaneously.

**2. New lesson type: SPOKEN_PHRASES**
Inserted at strategic chapter points (every 3–5 chapters). Pure conversational Fus'ha tied to Islamic and scholarly contexts:

- **Greetings:** السلام عليكم ورحمة الله وبركاته · وعليكم السلام · صباح الخير · مساء النور
- **Polite phrases:** جزاك الله خيراً · بارك الله فيك · إن شاء الله · ما شاء الله · بإذن الله
- **Halaqa / classroom phrases:** أعد من فضلك · ما معنى هذه الكلمة؟ · لا أفهم · هل يمكنك الشرح مرة أخرى؟
- **Questions for a scholar:** ما حكم هذا؟ · كيف نفهم هذه الآية؟ · هل يجوز...؟ · ما الدليل على ذلك؟
- **Du'a-style speech:** اللهم اهدنا · اللهم اغفر لنا · ربنا تقبل منا
- **Masjid / travel scenarios:** أين القبلة؟ · متى صلاة المغرب؟ · أين المسجد الجامع؟

These are real spoken Fus'ha that a user will actually use the moment they meet a religious teacher, attend a halaqa, visit a masjid in any Arab country, or interact with any Arabic speaker in a religious or formal context.

**Why this works as the differentiator:**
- Kalam teaches Levantine dialect for casual chat
- Madinah Arabic teaches grammar and reading
- Quran apps teach memorization and tafsir
- **Warsh teaches Fus'ha for the spaces where Fus'ha actually lives — and lets the user speak it, not just read it**

**Speaking signal in UI (lightweight, not a separate mode):**
- Discover cards show a visible 🔊 audio button
- Chapter cards show a "🗣️ spoken phrases" badge when applicable
- Lesson completion screen includes "phrases learned to say" count
- Profile tab shows "words you can say" as a stat (any word the user has heard pronounced + practiced via SHADOW_REPEAT)

**Pronunciation scoring is parked for Phase 2.** Building automatic pronunciation feedback for classical Arabic is a 3-month engineering problem with no guarantee of accuracy. Build SHADOW_REPEAT first. If beta users actively request scoring, then invest.

**Database additions:**
- New `LessonType` enum value: `SPOKEN_PHRASES`
- New `ExerciseType` enum value: `SHADOW_REPEAT`
- `Lesson` model: optional `spokenPhrases` JSON field for SPOKEN_PHRASES lessons
- No new tables — uses existing lesson/exercise structure

**Screens affected:**
- New exercise UI state for SHADOW_REPEAT (mic button, record state, playback)
- New lesson type rendering for SPOKEN_PHRASES (phrase list with audio + record per phrase)
- Lesson completion screen — add phrase count
- Profile — add "phrases you can say" stat

---

### 📖 Vocabulary Bank — Next Major Feature
Documented in `warsh-vocabulary-bank.md`

A dedicated مُفْرَدَات tab giving vocabulary a proper home separate from the learning path.

**Sub-features:**
- My Words — lesson-linked personal word bank
- Browse by Topic — 10 curated topic categories
- Word card detail — Arabic, transliteration, translation, **audio playback**, Quranic example
- Search — English, Arabic, transliteration
- Word of the Day
- Spaced Repetition Review (SRS) — Phase 2 of this feature

**New screens:** 9 screens (E1–E9)
**Database:** 2 new tables — VocabularyWord, UserVocabularyProgress
**New endpoints:** 6
**Content work:** 200+ curated words, Quranic example sentences, word type classification, **audio for every word**

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

### 🏆 Milestone Celebrations — Planned
Not yet built.

Milestone modal fires when:
- A chapter is completed
- Streak reaches 3, 7, 14, 30 days
- XP crosses 100, 500, 1000, 5000
- A Surah comprehension hits 100%
- First lesson completed (Day 1 moment)
- First SHADOW_REPEAT exercise completed ("you said your first Arabic word")
- First SPOKEN_PHRASES lesson completed

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
- Lesson type badge (Standard / Spoken Phrases)
- XP available
- Estimated time (based on exercise count)
- "Begin" Gold button

Reduces friction. User knows what they are getting into before committing.

---

### 📴 Offline Support — Planned
Not yet built. Important for Pakistani and South Asian users on mobile networks.

- Cache lesson content in AsyncStorage after first load
- Cache lesson audio locally after first play
- Allow full offline lesson play (including SHADOW_REPEAT and audio playback)
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
- Microphone permission status (for SHADOW_REPEAT)
- Daily goal adjustment
- Native language change
- Account management (change name, email, password)
- Delete account

---

### 👤 Enhanced Profile Tab — Planned
Current profile is rebuilt with brand. For beta it needs:

- Vocabulary stats — total words unlocked, words reviewed today
- **Speaking stats — phrases you can say, SHADOW_REPEAT exercises completed**
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
- Manage SPOKEN_PHRASES library
- View user analytics (lesson completion rates, drop-off points, common wrong answers, SHADOW_REPEAT completion rates)
- Flag exercises with high error rates for review

This is internal tooling — not part of the beta app but needed before content team can scale.

---

## Curriculum Roadmap

### Current State
- 15 chapters, 60 lessons (Warsh reader curriculum, seeded)
- Sourced from Madinah Arabic Reader (Dr. Abdur Rahim) + Quranic Grammar (Dr. Hafiz Muhammad Zubair)
- DEV_UNLOCK_ALL = true (must be set false before beta)

### Beta Target
- 20–25 chapters
- 80–100 lessons (including 4–6 SPOKEN_PHRASES lessons sprinkled at chapter milestones)
- Covers: complete Madinah Book 1, grammar concepts through basic sentence structures, verb introduction
- Every lesson has audio for every word and every example
- Spoken phrases library: 60–80 conversational Fus'ha phrases across all categories

### Long-term Vision
- Hundreds of chapters
- Covers: Madinah Books 1, 2, 3 + Quranic Grammar series fully
- Integrated vocabulary bank growing alongside curriculum
- Tadabbur progression through Juz Amma and beyond
- Speaking dimension deepens — SHADOW_REPEAT for ayahs, halaqa scenarios, du'a recitation practice

### Content Production Standard (locked)
Every standard lesson follows the 5-beat structure:
1. Hook — Quranic ayah, no explanation, **audio playback**
2. Discover — 10-12 cards, illustration + Arabic + transliteration + translation + **audio**
3. Practice — 10 exercises across 6 standard types + occasional SHADOW_REPEAT
4. Reveal — grammar term named, ayah with highlighted word, **audio playback**
5. Close — XP, بارك الله فيك, Ustaad Noor tip

SPOKEN_PHRASES lessons follow a simpler structure:
1. Context — when do you use these phrases?
2. Phrases — 5–8 phrases with audio + SHADOW_REPEAT practice on each
3. Mini-scenario — listen to a short dialogue using the phrases
4. Close — XP, encouragement

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

For SPOKEN_PHRASES lessons, illustrations show context scenes (masjid courtyard, classroom/halaqa, scholar with student, traveler at a mosque) — adds the "living language" visual signal without breaking the parchment aesthetic.

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
| `OPENAI_API_KEY` in production | **Critical** | Must be set for Noor chat and TTS to work for real users |
| `ANTHROPIC_API_KEY` | High | Confirm provider decision |
| Microphone permission flow | High | Required for SHADOW_REPEAT — iOS + Android permission UX |
| Audio cache strategy | High | Needed for offline play and replay performance |

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

Speaking is **not** a separate tab. It lives inside the lesson flow (SHADOW_REPEAT exercises, SPOKEN_PHRASES lessons) so users encounter speaking naturally as part of every chapter — not as a mode they have to remember to switch to.

---

## Build Order — Recommended Sequence

### Stage 1 — Foundation (do this first, everything depends on it)
1. Set `DEV_UNLOCK_ALL = false`
2. Configure production API URL
3. Set production API keys (OpenAI for chat + TTS)
4. Polish app icon + splash screen
5. Clean all technical debt items listed above

### Stage 2 — UI/UX Layer + Core Audio (highest user impact)
**Audio is now part of this stage, not a separate later stage.**

6. Integrate OpenAI TTS service + local audio cache
7. Lesson completion screen (C7) — celebration, XP count-up, confetti
8. Exercise feedback overlay (C5) — shake, flash, sheet slide-up
9. Practice exercise animations (C4) — correct/wrong states
10. Discover card redesign (C3) — image-ready layout, **audio play button**
11. Learn tab redesign (B1) — chapter cards, stagger animation
12. Chapter detail screen (C1)
13. Hook beat visual treatment (C2) — **with ayah audio playback**
14. Reveal beat polish (C6) — **with ayah audio playback**
15. Profile tab animations (B3)
16. Noor chat polish (B2)
17. Onboarding redesign (A1–A8)
18. Login screen (A9)

### Stage 3 — Spoken Fus'ha Layer (new — comes right after core UI)
19. Database additions — SPOKEN_PHRASES lesson type, SHADOW_REPEAT exercise type, spokenPhrases JSON field
20. Microphone permission flow (iOS + Android)
21. SHADOW_REPEAT exercise UI — record button, recording state, playback comparison
22. SPOKEN_PHRASES lesson renderer — phrase list with audio + record per phrase
23. Source/license scholar-recited audio for Quranic ayahs in Hook and Reveal beats
24. Author first 3 SPOKEN_PHRASES lessons (greetings, polite phrases, halaqa phrases)
25. Sprinkle SHADOW_REPEAT into existing Practice beats (1–2 per lesson where natural)
26. Profile + completion screen stats — "phrases you can say"

### Stage 4 — Image Generation
27. Write batch image generation script
28. Generate Chapter 1 images (40 cards) — review quality
29. Generate all remaining chapter images (164 cards)
30. Generate vocabulary bank images (200+ words)
31. Generate SPOKEN_PHRASES scene illustrations (~10 scenes)
32. Upload to CDN, update database

### Stage 5 — Vocabulary Bank
33. Database migration — VocabularyWord + UserVocabularyProgress tables
34. Link 204 discover cards to vocabulary word records
35. Backend endpoints — my-words, browse, search, word-of-the-day
36. Vocabulary tab UI — main view, My Words, Browse
37. Word card detail screen — with audio playback
38. Lesson completion hook — auto-add words to bank
39. Search screen
40. Word of the Day card
41. 4-tab navigation update

### Stage 6 — Engagement Features
42. Daily goal system
43. Streak improvements (freeze, grace period, streak lost screen)
44. Lesson preview bottom sheet
45. Milestone celebration system (includes new speaking milestones)
46. Push notifications

### Stage 7 — Curriculum Expansion
47. Chapters 16–20 with audio for all content
48. Chapters 21–25
49. Author 3 more SPOKEN_PHRASES lessons (du'a phrases, scholar questions, travel/masjid scenarios)
50. Vocabulary bank populated to 200+ curated words with Quranic examples and audio
51. SHADOW_REPEAT sprinkled across all new chapters

### Stage 8 — Beta Prep
52. Settings screen
53. Enhanced profile tab (badges, heatmap, learning time, speaking stats)
54. Tadabbur progression — Surah transition logic (post-Fatiha)
55. Offline support (including cached audio)
56. Full QA pass on all screens and flows
57. Performance testing
58. Admin content dashboard (internal)
59. Beta release

---

## Effort Estimate — Full Beta

| Stage | Scope | Estimated Effort |
|---|---|---|
| Stage 1 — Foundation | Technical debt, config | 2–3 days |
| Stage 2 — UI/UX + Audio | 21 screens, animations, TTS integration | 26–30 days |
| Stage 3 — Spoken Fus'ha | SHADOW_REPEAT + SPOKEN_PHRASES | 12–16 days |
| Stage 4 — Images | 610 illustrations, CDN | 3–4 days |
| Stage 5 — Vocabulary Bank | Full feature build | 10–14 days |
| Stage 6 — Engagement | Goals, streaks, milestones | 8–10 days |
| Stage 7 — Curriculum | 10 more chapters + spoken phrases content | 22–32 days |
| Stage 8 — Beta Prep | QA, settings, polish, offline | 8–12 days |
| **Total** | | **91–121 working days** |

**One person, full days: 5–6 months**
**With a team of 2 (one frontend, one content): 3–3.5 months**
**With a team of 3 (frontend, backend, content): ~2.5 months**

The speaking dimension adds roughly 12–16 days of build work and 5–10 days of content production. This is a reasonable cost for what it unlocks: a clear differentiator versus every other Quranic Arabic app on the market.

---

## Team / Resource Gaps

To hit beta in 3 months, these roles are needed:

| Role | What they do | Current status |
|---|---|---|
| App developer | React Native, UI implementation, animations, audio integration | You |
| Backend developer | API endpoints, database, SRS logic | You (or hire) |
| Content / curriculum | Lesson writing, vocabulary sourcing, Quranic examples, **spoken phrase scripting** | Needed |
| Islamic scholar reviewer | Validate all Arabic content for accuracy **including spoken phrase usage** | Needed — non-negotiable |
| **Native Fus'ha voice** | Record SPOKEN_PHRASES phrases (where TTS quality is insufficient) and Quranic ayahs for Hook/Reveal beats | Needed |
| UI/UX designer | Take wireframes to Figma, design system | Needed (or AI-assisted) |
| Illustrator / AI image editor | Generate + QA 600 custom illustrations | Part-time / batch work |

The Islamic scholar reviewer is non-negotiable. Warsh is teaching Quranic Arabic — every word, every ayah reference, every grammar explanation, and now every spoken phrase must be reviewed for accuracy. An error in a Quranic context is not a bug, it is a religious mistake.

The native Fus'ha voice is new for beta. OpenAI TTS handles vocabulary words and short phrases acceptably, but Quranic ayahs and longer spoken phrases benefit from a trained reciter or fluent Fus'ha speaker. Budget for: a verified reciter for ayahs (Mishary Rashid Alafasy-grade quality), and a fluent Fus'ha speaker for conversational phrases (could be a Pakistani Arabic teacher with strong Fus'ha — does not need to be a native Arab).

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
- **Speaking dimension is Fus'ha only — never dialect. Honest with users about what this gets them.**
- **Speaking lives inside the lesson flow — not a separate tab or mode.**
- **No automated pronunciation scoring for beta. SHADOW_REPEAT is listen-and-compare only.**

---

## Decisions Still Open

These need to be decided before the relevant feature is built:

1. **Vocabulary tab label** — مُفْرَدَات vs كَلِمَات vs icon only
2. **Tadabbur feature name** — confirm تَدَبُّر as the permanent name
3. **TTS voice selection** — which OpenAI TTS voice for Fus'ha (Alloy / Echo / Onyx — needs A/B testing for Arabic clarity)
4. **Quranic ayah audio source** — which reciter / which license (Mishary Alafasy via verified license? Madinah Quran Project? In-house recording?)
5. **Spoken phrase voice** — TTS or human-recorded? Probably hybrid: TTS for vocabulary, human-recorded for SPOKEN_PHRASES lessons where naturalness matters
6. **Image style final approval** — review Chapter 1 batch before committing to all 610
7. **SRS algorithm** — SM-2 (standard Anki algorithm) or custom simplified version
8. **Beta distribution** — TestFlight (iOS) + APK sideload (Android) or Play Store / App Store beta track
9. **Scholar reviewer** — who and what is the review process
10. **SHADOW_REPEAT frequency** — how often does it appear in standard lessons? Every lesson (1–2 exercises) or only certain lessons?
11. **Lesson type indicator on chapter card** — how do users know which lessons include SPOKEN_PHRASES before opening?
12. **Tagline finalization** — current locked tagline is "Where Arabic is crafted." Consider updating sub-line to: "Speak, read, and understand the language of the Quran."

---

## Changelog

**2026-05-17 — v1.1**
- Added speaking dimension to product positioning (still classical Fus'ha, not dialect)
- Promoted Audio from Stage 5 to Stage 2 (now part of core UI layer)
- Added new Stage 3: Spoken Fus'ha Layer (SHADOW_REPEAT + SPOKEN_PHRASES)
- Added SHADOW_REPEAT as a 7th exercise type
- Added SPOKEN_PHRASES as a new lesson type
- Updated curriculum target to include 4–6 SPOKEN_PHRASES lessons in beta
- Updated profile and milestone celebrations to include speaking stats
- Added native Fus'ha voice as a new resource gap
- Re-estimated total effort: 91–121 days (up from 77–102)
- Updated current state: 15 chapters / 60 lessons (was 5/16 — reflects Warsh reader seed)
- Added 3 new locked decisions about how speaking is implemented
- Added 3 new open decisions about audio voices and SHADOW_REPEAT frequency

**2026-05-10 — v1.0**
- Initial master roadmap created after MVP validation

---

*This is the master document. All other Warsh docs cross-reference this.*
*Update version and date when scope changes.*
*Cross-reference: `warsh-ui-sot.md` · `warsh-vocabulary-bank.md` · `warsh-quran-comprehension-idea.md`*
