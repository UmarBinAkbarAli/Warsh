# Warsh Product Specification

**Status:** Active product source of truth
**Version:** 2.0 consolidated
**Last updated:** 2026-07-11

## Authority and scope

This document defines what Warsh is, whom it serves, how the learner experience works, and the product decisions that should remain stable. It consolidates the former spec-00 through spec-11 set and the useful product decisions from older feature, screen-inventory, brand, and roadmap documents.

Use `Docs/warsh-technical-spec.md` for implementation and infrastructure. Use `Docs/warsh-status.md` for what is currently built, verified, blocked, or next. The lesson content structure is defined by code in `packages/lesson-schema`, not by a parallel documentation schema.

When changing a locked product decision, update this document and add a dated decision note at the bottom.

## 1. Product identity

### Name

- Product: **Warsh · وَرْش**
- AI tutor: **Ustaad Noor · اُستاد نور**
- Primary category: Quranic Arabic learning
- Initial audience and market: Muslim adult learners, initially focused on Pakistan
- UI languages: English and Urdu
- Teaching language: Fus'ha/Quranic Arabic; no dialect curriculum

The name honors Warsh, one of the canonical transmitters associated with Quranic recitation. It signals that the product is rooted in the Quran while remaining a modern learning application. The name must not be used to imply that the app teaches only the Warsh recitation or replaces qualified teachers and scholars.

### Core promise

> Complete Warsh and you will understand Al-Fatiha, Juz Amma, and the most common structures of the Quran.

Warsh teaches language comprehension. It is not a Quran memorization app, translation reader, formal madrasah, certification program, video library, or casual dialect-conversation app.

## 2. Product principles

### Reader leads, grammar serves

Learners encounter meaning and usage first. Grammar explains patterns they have already seen. Terminology is a tool, never the entry point.

### Quran connection is structural

Vocabulary, grammar, examples, reveals, and Tadabbur all connect to real Quranic language. Quranic ayat remain in Arabic script and are never shown in transliteration.

### Warm scholarly tone

The product should feel like sitting with a patient teacher. It is calm, respectful, encouraging, and honest.

- No shame mechanics
- No punitive hearts/lives
- No leaderboards or public comparison
- No exaggerated praise, fake urgency, or noisy celebration
- Errors receive useful, patient feedback
- Islamic phrases are used naturally and retained in Arabic script

### Delight without childishness

The interface is premium, parchment-toned, classical, and warm. Motion, sound, and haptics support comprehension and feedback. The product avoids neon palettes, cartoon mascots, casino mechanics, and excessive confetti.

### Honest product behavior

- No ads
- No selling user data
- No hidden tiers or surprise charges
- No cancellation dark patterns
- No automated religious claims about reward
- No AI claims beyond the system's actual capabilities

## 3. Platforms and product surfaces

### Supported now

- Android application through Expo/React Native
- Browser application through Expo Web
- Shared backend and production data model for Android and web learners
- Public landing, privacy, terms, help, and password-reset web pages

### Launch order

1. Internal testing
2. Closed Android beta
3. Open beta/soft launch
4. Public Android launch
5. iOS after Android stabilization

## 4. Navigation and major journeys

### Four-tab application shell

The bottom navigation is locked to:

1. **Learn** — daily goal, course progress, chapters, lessons, and Tadabbur entry points
2. **Vocabulary** — Word of the Day, topics, search, saved words, word detail, and SRS review
3. **Noor** — AI tutor chat and message-pack purchase flow
4. **You** — profile, achievements, streaks, settings, language, account, and subscription controls

Lesson play, paywall, celebrations, settings, chapter details, vocabulary details, and account flows are stack/modal destinations rather than additional tabs.

### First-time journey

The current essential journey is:

1. Branded preview experience
2. Name
3. UI language
4. Account registration
5. Permissions
6. Learn home

Goal, level, daily commitment, placement, and ready screens remain available concepts, but the current production flow may use safe defaults to reduce signup friction. Any reintroduction must be intentional and reflected in status and analytics.

### Returning learner journey

- Hydrate persisted authentication before redirecting.
- Valid sessions enter the app shell.
- Expired/invalid sessions return to authentication with a clear message.
- Password changes invalidate older sessions.
- Deep links must preserve authentication and return-path behavior.

## 5. Curriculum

### Sources

1. Madinah Arabic Reader, Books 1-8, by Dr. V. Abdur Rahim
2. Dr. Hafiz Muhammad Zubair's teaching material, used with permission
3. The Quran
4. Curated dictionaries and Quranic linguistic references

### Structure

- 72 Warsh chapters
- Fixture-authored lesson sequence with standard, review, spoken-phrase, and verb-pattern lessons
- Increasing coverage from foundational demonstratives and nominal sentences through the later Madinah Reader progression
- Quranic reveals and vocabulary prioritized where they fit the pedagogical sequence

Structured validation does not equal scholarly approval. Public launch requires review for Arabic correctness, ayah relevance, pedagogy, repetition, and pacing.

## 6. Lesson system

### Templates

- `STANDARD`: Hook → Discover → Practice → Reveal → Close
- `SPOKEN_PHRASES`: listening, phrase discovery, shadow practice, and completion
- `REVIEW`: recall and mixed practice over previous material
- `VERB_PATTERN`: pattern discovery, conjugation support, practice, Quranic reveal, and close

### Discover-card types

The shared schema supports:

- `WORD`
- `CONCEPT`
- `EXAMPLE`
- `CONTRAST`
- `AYAH_PREVIEW`
- `GRAMMAR_NOTE`
- `SENTENCE`

### Exercise types

The current shared schema defines 15 exercise types:

1. `TRUE_FALSE`
2. `TAP_TRANSLATION`
3. `FILL_BLANK`
4. `BUILD_SENTENCE`
5. `MATCHING`
6. `GRAMMAR_PARSE`
7. `CONVERSATION_BUILDER`
8. `SHADOW_REPEAT`
9. `AUDIO_RECOGNITION`
10. `WRITE_ARABIC`
11. `HARAKAH_PLACEMENT`
12. `WORD_ORDER`
13. `TRANSLATE_TO_ARABIC`
14. `IDENTIFY_ROOT`
15. `MATCH_AYAH`

### Interaction rules

- Arabic strings use the shared Arabic text component and Scheherazade New.
- Correctness should tolerate appropriate Arabic normalization without erasing meaningful distinctions.
- Wrong-answer feedback should explain rather than punish.
- Replaying completed lessons must not create repeat completion rewards.
- Chapter locking is enforced by the backend, not only by the interface.
- Audio is a core content dimension.
- Quran recitation uses human-recorded audio, not TTS.

## 7. Spoken Fus'ha

- Speaking practice lives inside lessons; there is no fifth “Speak” tab.
- `SHADOW_REPEAT` is listen, record locally, compare, and retry.
- Voice recordings remain on the learner's device and are not uploaded for scoring.
- V1 does not provide automated pronunciation scoring.
- Microphone denial must have a respectful fallback and a way to retry permission.

## 8. Vocabulary

### Free-forever commitment

The Vocabulary Bank remains available without a paid subscription, including:

- Browse by topic
- Search
- Word of the Day
- Word detail
- Audio playback
- Saved/review state
- SRS review

### Word experience

Where available, a word includes Arabic, transliteration, English and Urdu meaning, word type, root, gender/plural information, frequency, Quranic example, audio, image, related words, and learner-specific SRS state.

### SRS

The current system uses an SM-2-style review model with Hard, Good, and Easy outcomes. Hidden words are excluded from the due queue. The experience is Arabic-first with answer reveal; image-only flashcards are not a launch requirement.

## 9. Tadabbur

Tadabbur is comprehension progression, not tafsir authority. The learner gradually recognizes every word and structure in selected Surahs.

Initial progression begins with Al-Fatiha and the final Surahs of the Quran, moving backward through Juz Amma. Unlocks should be tied to learned vocabulary/grammar rather than arbitrary viewing gates.

## 10. Engagement

### XP and goals

- Lessons award XP according to content and completion rules.
- First completion controls one-time rewards.
- Daily-goal and chapter-completion bonuses may be awarded.
- Daily boundaries and streak calculations use Pakistan Time with the defined 4 AM boundary where applicable.

### Streaks and freezes

Streaks encourage return without shame. Missed days use gentle restart language. Freeze mechanics must be understandable and must not imply moral failure.

### Achievements and celebrations

Milestones recognize meaningful learning progress. Celebrations should feel like a teacher's smile rather than a game-show event. Sharing is optional and never exposes private learner data by default.

## 11. Ustaad Noor

### Character

Noor is warm, patient, scholarly, concise, honest, and focused on Arabic learning. Noor is neither a religious authority nor a general-purpose assistant.

### Scope and safety

- Arabic learning questions are in scope.
- Off-topic or religious-ruling questions are gently redirected to a trusted scholar or suitable source.
- Noor must not fabricate Quranic text, hadith, rulings, or scholarly consensus.
- User context may include profile and learning progress.
- Chat messages are stored and the latest messages may be used as conversational context across app sessions. V1 does not build a separate inferred personal-memory profile, retain hidden personal facts, or claim human-like memory beyond that visible transcript.

### Limits

- Default model: OpenAI model configured by the backend; current default is `gpt-4o-mini`.
- Standard allowance: 5 messages per day.
- Overage: a consumable pack of 20 messages at the configured store price, historically $0.99.
- Provider failure may return a constrained local fallback; operational debugging must distinguish fallback responses from successful provider calls.

## 12. Monetization

### Tier

Warsh has one subscription tier. Launch positioning is approximately $1/month or $10/year, subject to the actual Google Play/App Store localized price shown to the user.

### Trial and paywall

- Trial begins at account creation.
- Trial duration: seven full days from account creation.
- The trial provides complete access to all 72 chapters, Noor, Tadabbur, speaking practice, and paid media for those seven days. Curriculum progress never ends the trial early.
- A learner may complete as much of the course as they can during the trial, including all 72 chapters if they are able to do so.
- Paid lessons, Noor, and Tadabbur are gated after trial/subscription expiry.
- Vocabulary remains free forever.
- Entitlement is checked when paid content is retrieved and when lesson completion is submitted. A request made after the seven-day expiry may redirect to the paywall even if the screen was opened shortly before expiry.
- Restore purchases and clear subscription-management instructions are mandatory.

### Store products

The current Google implementation uses subscription product `warsh_premium` with monthly/yearly base plans. Consumable Noor credits are handled through the implemented store flow. Exact console identifiers and availability must be verified live before release.

## 13. Design system

### Visual direction

- Warm parchment and cream surfaces
- Ink text
- Selected A1 gold and deep navy for brand/high-emphasis surfaces
- Sage for calm success/supporting states
- Terracotta rather than harsh red for errors
- Restrained shadows and animation

The code tokens in `warsh-app/constants/theme.ts` are the exact implementation values. Do not create parallel hardcoded palettes.

### Typography

- English/UI body: Lora
- Display/headings: Cormorant Garamond where currently used
- Arabic and Urdu fallback: Scheherazade New
- Arabic always renders right-to-left through the shared Arabic component

### Components and accessibility

- Primary CTAs use `BrandButton`.
- Touch targets should be at least 56 pt for primary buttons.
- Text contrast, dynamic layout, keyboard behavior, focus, screen-reader labeling, loading, empty, offline, and error states are part of completion—not optional polish.
- Browser layouts use the responsive web shell rather than stretching phone content across the viewport.

## 14. Localization and copy

- English and Urdu are supported UI modes.
- Arabic learning content stays identical in Arabic across modes.
- Shared dictionaries are the implementation source for app strings.
- Missing translations should fall back safely to English rather than showing keys or crashing.
- Copy follows the Warmth Principle and avoids excessive punctuation and emojis.

## 15. Privacy and legal commitments

- User recordings for shadow comparison stay on-device.
- Authentication, learner progress, chat history, analytics, crash data, and purchase data must be disclosed accurately.
- Account deletion and data-rights paths must remain available.
- The public privacy URL must remain stable for Google Play.
- `landing/index.html` and `Docs/privacy-policy.html` are protected live files and cannot be moved or renamed casually.

## 16. Explicitly out of scope for the current launch

- Automated pronunciation scoring
- Dialect courses
- Public profiles, leaderboards, or social feeds
- Family/group accounts
- Live tutor marketplace
- Certificates
- Children's mode
- Persistent Noor personal memory
- Dark mode
- Lifetime purchase tier
- Referral or institutional-sales systems

## Decision log

- **2026-07-11:** Consolidated the active product specification; Android and web are recognized as current supported surfaces.
- **2026-07-08:** A1 gold and navy selected for the active brand direction and applied to shared design tokens.
- **2026-06:** English/Urdu localization, full fixture-authored curriculum, R2 media, and simplified onboarding became current product reality.
