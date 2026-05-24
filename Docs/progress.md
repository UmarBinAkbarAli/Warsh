# ArabAI Phase 1 Progress Tracker

Last updated: 2026-05-24 (Chapter 3 fully authored — 4 lessons seeded)

## Purpose

This file is the source of truth for current app progress as reflected in the codebase.

It is intended to track:
- what is implemented in the repo
- what has been structurally integrated into the app/backend
- what still needs product, content, or engineering work

It should not be treated as a permanent record of:
- temporary LAN IPs
- one-off Expo session URLs
- whether a local server happened to be running on a specific machine
- whether a specific throwaway test account still exists after reseeding

## Current Phase

- **Phase 1 core app flow:** implemented
- **Content schema:** migrated to `warsh-content-schema v1.0` — single `content Json` blob per lesson, `LessonTemplate` enum (STANDARD / SPOKEN_PHRASES / REVIEW / VERB_PATTERN)
- **Chapter 1:** fully authored — 4 hand-authored lessons in `arabai-backend/prisma/fixtures/`
- **Chapters 2–72:** chapter metadata seeded, lessons pending authoring
- **Current focus:** content authoring — one chapter at a time, using the fixture pattern
- **Recommended next milestone:** author Chapter 2 (adjectives — جَدِيد، كَبِير، صَغِير, agreement rules), then test Chapter 1 end-to-end on device

## Build and Testing Status

- First APK build was generated through Expo Cloud earlier
- A fresh local Android debug APK was also built and installed on the connected physical Android device for current QA
- Backend build passed after the 15-chapter curriculum update
- App TypeScript check for the edited lesson player passed
- App TypeScript check passed after adding the Vocabulary tab and Warsh identity copy updates
- Backend TypeScript check passed after switching Noor to the OpenAI-only helper path
- Backend TypeScript check passed after making `DEV_UNLOCK_ALL` development-only
- App TypeScript check passed after adding an API timeout and clearer auth/network errors
- App TypeScript check passed after correcting the register screen Arabic brand mark
- App TypeScript check passed after adding `arabai-app/.env.example` and typing `EXPO_PUBLIC_ENVIRONMENT`
- Backend auth API smoke test passed locally against `http://127.0.0.1:3000`:
  - register returned a JWT
  - placement apply succeeded
  - wrong-password login returned `401`
  - correct login returned a JWT
  - `/api/auth/me` returned the logged-in user
- Physical Android device was authorized through ADB and USB reverse was restored for `3000` and `8081`
- Expo Go could not run the app because installed Expo Go targets SDK 54 while the project uses Expo SDK 51
- Native Android debug app was installed/launched via `expo run:android` after setting `JAVA_HOME`
- Login through the native Android app UI succeeded:
  - app accepted a backend-created test account
  - backend logged `POST /api/auth/login 200`
  - app routed to the Learn tab
- Signup/account creation through the native Android app UI succeeded:
  - app completed the onboarding path with `QURAN`, `BEGINNER`, `ur`, and Chapter 1 as the starting point
  - register form accepted a fresh test email and password
  - backend logged `POST /api/auth/register 201`
  - backend logged `POST /api/placement/apply 200`
  - app routed to the Learn tab after signup
  - Learn loaded the chapter list on-device after signup, including Chapter 1 with `0 / 4 lessons completed`
- Fixed the latest local signup setup failure:
  - regenerated Prisma Client after backend schema changes
  - applied the pending committed Prisma migrations to the configured Neon database
  - verified the backend register -> placement apply -> progress flow locally against `http://127.0.0.1:3000`
  - smoke result: register returned a JWT, `BEGINNER` placement applied to Chapter 1, 15 chapters returned, and progress loaded with `trial` subscription state
- Noor post-login loading through the native Android app UI succeeded:
  - app opened the Noor tab after login
  - Noor header, daily message counter, input, and Send button rendered
  - backend logged `GET /api/chat/history 200`
  - no Neon/Prisma post-login loading failure appeared during the Noor check
- Native keep-awake warning fix was implemented structurally:
  - `expo-keep-awake` is now a direct app dependency
  - app TypeScript check passed
  - Expo Android autolinking now resolves `expo.modules.keepawake.KeepAwakeModule`
  - native Android app was rebuilt/reinstalled on the physical device
  - fresh launch log search found no `Unable to activate keep awake`, `KeepAwake`, or missing native module warning
- App icon and splash polish was implemented:
  - generated a Warsh mark-only app icon using the spec's parchment, gold, ink, and subtle motif treatment
  - generated an adaptive icon foreground and Android launcher mipmaps from the polished icon
  - generated a parchment splash image with the full `Warsh · وَرْش` lockup and `Where Arabic is crafted.`
  - updated Expo config for the icon, adaptive icon, splash image, splash background, and v1 light-only UI style
  - updated native Android splash, status bar, navigation bar, and launcher resources to match the polished assets
  - app TypeScript check passed
  - Expo public config resolves the new icon/splash settings
  - Android debug assemble passed after rerunning outside the sandbox so the NDK compiler could execute
- Production config hardening was implemented:
  - removed the mobile API client's hardcoded `https://warsh-backend.vercel.app` fallback
  - mobile API config now requires `EXPO_PUBLIC_API_URL` and validates it as an absolute URL
  - staging/production mobile builds now require HTTPS and reject localhost-style API hosts
  - `arabai-app/.env.example` now documents development, staging, and production public environment values
  - `eas.json` now pins preview to staging env values and production to `https://api.warsh.app`
  - production EAS builds no longer force Android APK output; preview remains the internal APK profile
  - `bundle-test.out` was removed and ignored because it was a generated bundle artifact containing stale dev URLs
  - app TypeScript check passed
  - `eas.json` parses successfully
  - hardcoded URL scan found only intended env examples, validation logic, and debug-only cleartext configuration
- OpenAI TTS + local audio cache plumbing was implemented:
  - added backend TTS helper using OpenAI speech generation with `OPENAI_TTS_MODEL` and `OPENAI_TTS_VOICE`
  - added authenticated `GET /api/audio/tts?text=...` endpoint returning MP3 audio
  - endpoint validates text, caps generated input length, and returns `503 tts_unavailable` when TTS is not configured
  - documented backend TTS env vars in `arabai-backend/.env.example`
  - added `expo-file-system` as a direct app dependency
  - added mobile `audioCache` service using `FileSystem.cacheDirectory` with 30-day freshness
  - added vocabulary and lesson text audio lookup helpers for the next play-button slice
  - app TypeScript check passed
  - backend TypeScript check passed
  - backend production build passed and includes `/api/audio/tts`
- Backend Neon connectivity was rechecked and the post-login data endpoints now pass locally against the configured Neon database:
  - direct PostgreSQL `select 1` succeeded
  - `POST /api/auth/register` returned a JWT using the app's real `QURAN` goal enum
  - `POST /api/placement/apply` completed
  - `GET /api/chapters` returned `15` chapters and `4` lessons in chapter 1
  - `GET /api/progress` returned an empty completed lesson list for a fresh test account
  - `GET /api/chat/history` returned an empty message list for a fresh test account
- App lint is not currently runnable because `arabai-app/` has no ESLint config file
- Backend content dashboard build passed:
  - `/dashboard` is now available from the Next.js backend for Warsh content management
  - `GET /api/admin/content` returned `72` chapters and `323` lessons from the active database
  - backend production build passed after the dashboard work
- Curriculum validation now checks the active 72-chapter seed set instead of the old 15-chapter module:
  - `npm run db:validate-seed` passed with `72` chapters and `323` lessons
- Curriculum validation passed:
  - `15` chapters
  - `60` lessons
  - every chapter has `4` lessons
  - every lesson has hook, discover cards, exercises, reveal content, reveal ayah, and Noor tip
  - every practice set uses at least 3 formats and includes `TRUE_FALSE`
- `npm run db:seed` completed successfully after replacing the old seed
- Local DB count was verified at:
  - `15` chapters
  - `60` lessons
- Android physical device testing is in progress:
  - Android device is now authorized in ADB
  - native debug app is installed as `com.arabai.app`
  - native app launched on device
  - login screen accepted credentials and reached the Learn tab
  - backend health was verified locally on port `3000` during auth API smoke testing
  - USB reverse was configured for `8081` and `3000`
  - Expo Go is not usable for this project on the current device because Expo Go is SDK 54 and the project is SDK 51
  - signup/account-creation through the app UI now passes
  - Learn post-login loading now passes on-device after signup
  - Noor post-login loading now passes on-device
  - the dev warning overlay `Unable to activate keep awake` did not reappear after the native rebuild/reinstall

## Workspace Status

The workspace contains two active projects:
- `arabai-app/`: Expo SDK 51 / React Native mobile app
- `arabai-backend/`: Next.js 14 backend API with Prisma 7 and PostgreSQL

## Implemented In Code

### App foundation

- Expo Router entry is configured in `arabai-app/package.json`
- App uses Expo Go-compatible storage with `@react-native-async-storage/async-storage`
- Auth state is persisted in a Zustand store
- Axios injects JWT auth on protected requests
- Shared visual tokens are defined in `arabai-app/constants/theme.ts`
- Branded reusable UI components exist, including:
  - `ArabicText`
  - `BrandButton`

### Authentication

- `POST /api/auth/register` creates a user and returns:
  - user data
  - JWT token
- `POST /api/auth/login` returns:
  - user data
  - JWT token
- `GET /api/auth/me` returns the current authenticated user
- Session payloads include:
  - `nativeLanguage`
  - `goal`
  - `level`
  - `xp`
  - `placementType`
  - `startingChapterOrder`

### Onboarding and account creation

- The landing screen routes new users into onboarding before registration
- The login screen's register link routes into onboarding
- Onboarding route sequence exists in app code:
  1. `welcome`
  2. `goal`
  3. `level`
  4. `name`
  5. `language`
  6. `placement`
  7. `ready`
  8. `register`
- Onboarding state is persisted in a store
- Selection-based onboarding screens visibly show chosen state
- Register screen uses onboarding-collected data and then applies placement

### Placement and smart skip

- Placement data model exists on `User`:
  - `placementType`
  - `startingChapterOrder`
- Placement apply endpoint exists:
  - `POST /api/placement/apply`
- Placement mappings currently implemented:
  - `BEGINNER` -> Chapter 1
  - `KNOWS_LETTERS` -> Chapter 4
  - `STUDIED_BEFORE` -> Chapter 6
  - `CAN_READ_BASIC` -> Chapter 8
- Earlier lessons for advanced starting points are marked with progress status:
  - `SKIPPED_BY_PLACEMENT`
- Skipped lessons:
  - unlock later chapters
  - remain reviewable
  - do not award XP

### Curriculum and progression

- Backend seed uses `arabai-backend/prisma/seed.cjs`
- Phase 1.5 curriculum source is `arabai-backend/prisma/curriculum-phase15.cjs`
- Seeded curriculum currently contains:
  - `15` chapters
  - `60` lessons
- The current seed replaces the earlier starter curriculum rather than appending to it
- Chapter order follows reader lecture filename order, not lecture frontmatter
- The new seed is authored as interactive lessons based on `Docs/warsh_chapter_flow_system.html`, not as raw markdown dumps
- Chapter progression is enforced on the backend
- A chapter unlocks only when all lessons in all previous chapters are either:
  - completed
  - skipped by placement
- Lesson and chapter APIs expose:
  - completion state
  - skipped-by-placement state
  - Arabic titles via `titleAr`

### Lesson experience

- Lesson screen is implemented in `arabai-app/app/(app)/lessons/[lessonId]/play.tsx`
- Lesson payload/rendering supports the Warsh 5-beat lesson anatomy:
  - hook
  - discover
  - practice
  - reveal
  - close
- Lesson payload/rendering supports richer content fields including:
  - Quranic hook
  - discover pattern cards
  - reveal grammar concept
  - reveal ayah
  - Ustadh Noor tip
  - XP close step
- Lesson UI supports:
  - flashcard flow
  - true/false practice
  - tap translation
  - fill blank
  - build sentence
  - matching
  - grammar parse
  - conversation builder
  - bilingual display logic
  - completion feedback
- Lesson completion endpoint returns immediate progress data including:
  - `xpEarned`
  - `totalXp`
  - `currentStreak`
  - `longestStreak`

### Streak and progress

- Progress rows store a `status` field with explicit values such as:
  - `NOT_STARTED`
  - `COMPLETED`
  - `SKIPPED_BY_PLACEMENT`
- Lesson completion updates user XP
- Streak tracking exists in backend code
- PKT-aware streak date logic exists in `arabai-backend/lib/date.ts`

### Navigation and screen structure

- The real bottom tabs live in `arabai-app/app/(app)/(tabs)/`
- Bottom tab bar now matches the Warsh spec tab structure:
  - `Learn`
  - `Vocabulary`
  - `Noor`
  - `You`
- Lesson routes remain stack/detail screens rather than tab screens
- Implemented mobile surfaces include:
  - landing
  - login
  - register
  - onboarding flow
  - home/chapters
  - vocabulary bank starter screen
  - lesson play
  - chat
  - profile

### Branding and Arabic support

- Arabic fonts are included:
  - `Amiri-Regular.ttf` / `Amiri-Bold.ttf` (used for English body text)
  - `Scheherazade New` / `Scheherazade New Bold` / `Scheherazade New SemiBold` / `Scheherazade New Medium` (used for Arabic text)
- Fonts are loaded in the app layout
- `ArabicText` is used to standardize Arabic rendering and RTL presentation (uses Scheherazade New)
- Noor-style branding is implemented across major app screens
- Entry and onboarding welcome surfaces now present `Warsh / وَرْش` instead of using Noor as the app brand mark
- Register screen now also presents `وَرْش` as the Arabic app brand mark

## Important Code Reality

The repo is in a stronger state than the old tracker wording suggested, but a few details still matter:

- The app name in `arabai-app/app.json` is **"Warsh"** (package: `com.arabai.app`, scheme: `arabai`)
- The mobile API client requires `EXPO_PUBLIC_API_URL`; it no longer has a hardcoded production fallback URL
- Outside development, the mobile API client requires HTTPS and rejects localhost-style API hosts
- `arabai-app/.env.example` documents local, staging, and production mobile public environment values:
  - `EXPO_PUBLIC_API_URL=http://127.0.0.1:3000`
  - `EXPO_PUBLIC_ENVIRONMENT=development`
- `arabai-app/eas.json` pins preview builds to `https://api-staging.warsh.app` and production builds to `https://api.warsh.app`
- For physical-device local testing, USB reverse is currently more reliable than Wi-Fi:
  - `adb reverse tcp:8081 tcp:8081`
  - `adb reverse tcp:3000 tcp:3000`
  - Metro should be started with `EXPO_PUBLIC_API_URL=http://127.0.0.1:3000`
- The Android debug manifest allows cleartext HTTP for local development; the main manifest does not set cleartext traffic
- `npm run db:seed` is destructive for local data: it clears users, progress, chat messages, achievements, lessons, and chapters before reseeding
- `DEV_UNLOCK_ALL` in `arabai-backend/lib/course.ts` is now development-only; it only bypasses locking when `NODE_ENV !== "production"` and `DEV_UNLOCK_ALL=true`
- The mobile API client now times out after 10 seconds and exposes clearer backend/network/auth error messages through `getApiErrorMessage`
- `GET /api/audio/tts?text=...` now generates authenticated MP3 TTS through OpenAI when `OPENAI_API_KEY` is configured
- Mobile TTS audio caching now lives in `arabai-app/app/services/audioCache.ts` and uses `expo-file-system`
- Noor backend generation now uses `arabai-backend/lib/openai.ts` with `OPENAI_MODEL` defaulting to `gpt-4o-mini`
- Noor still falls back to the local tutor response when `OPENAI_API_KEY` is missing or the provider call throws - this can mask real provider errors during debugging
- Runtime health claims such as "server is running" or "Expo bundle returned 200" are environment checks, not source-of-truth code facts
- The visual/design source of truth is `Docs/warsh-spec-11-design-system-and-copy.md` (not `warsh-brand-ui-sot.md` — that file is obsolete)
- The complete product/engineering SOT is `Docs/warsh-spec-00-master-index.md` + spec-01 through spec-13; old files (`arabai-phase1-sot-v2.md`, `arabai-brand.md`, `warsh-brand-ui-sot.md`, etc.) are superseded and must not be referenced
- Lesson content lives in `arabai-backend/prisma/fixtures/` as JSON files (warsh-content-schema v1.0); add new lessons there and wire into `seed.cjs`
- The lesson API transformer in `GET /api/lessons/[id]` converts new content schema → legacy lesson player shape; updating the lesson player to read the new schema directly is future work
- `npm run db:seed` is fully destructive: wipes all users, progress, chat, achievements, lessons, chapters before reseeding

## Recent Changes (since 2026-05-24) — latest

### Chapter 3 lesson-loading bug fixed (2026-05-24)

- **Root cause:** Chapter 3 fixture files (`chapter-03-lesson-01.json` through `chapter-03-lesson-04.json`) were authored with a different exercise schema than Chapters 1/2 — using `choices`/`answer` instead of `options`/`correct_index`, `pairs: [{ar, en}]` instead of `left_column`/`right_column`/`correct_pairs`, `word_bank`/`answer[]` instead of `tiles`/`correct_order`, `template`/`blank_label`/`answer` instead of `hint`/`sentence_ar`/`correct_answer`, `answer` (boolean) instead of `correct_answer`, and `noor_comment` instead of `noor_explanation` in `reveal`. Also added `GRAMMAR_NOTE` and `SENTENCE` discover card types not handled by the transformer.
- **Fix:** Updated `transformContent()` in `arabai-backend/app/api/lessons/[id]/route.ts` to detect and handle both schemas in every exercise type branch:
  - `TAP_TRANSLATION`: falls back to `choices` (string[]) + `answer` if `options`/`correct_index` absent
  - `MATCHING`: falls back to `pairs: [{ar, en}]` format if `left_column`/`right_column`/`correct_pairs` absent
  - `BUILD_SENTENCE`: falls back to `word_bank`/`answer[]` + `instruction` if `tiles`/`correct_order`/`target_translation` absent
  - `FILL_BLANK`: falls back to `template`/`blank_label`/`choices`/`answer` format; extracts Arabic part before ` = ` from `template.en`
  - `TRUE_FALSE`: now checks `ex.answer` if `ex.correct_answer` is undefined; checks `ex.explanation.en` if `ex.explanation_on_wrong` absent
  - Reveal: checks `reveal.noor_comment` as fallback if `reveal.noor_explanation` absent
  - Discover cards: added `GRAMMAR_NOTE` (title/body) and `SENTENCE` (text) card type handlers (no crash)
- Backend TypeScript check passed (0 errors)

### Chapter 3 fully authored — 4 lessons seeded (2026-05-24)

- Authored 4 fixture JSON files in `arabai-backend/prisma/fixtures/`:

| File | Template | Title | Hook | Reveal | Key vocabulary (10–12 words each) |
|---|---|---|---|---|---|
| `chapter-03-lesson-01.json` | STANDARD | The Idafa Construction | Al-Fatiha 1:1 | Al-Fatiha 1:1 (بِسْمِ parse) | كِتَابُ الطَّالِبِ, بَيْتُ اللَّهِ, رَبُّ الْعَالَمِينَ, مَلِكُ النَّاسِ, كَلَامُ اللَّهِ, + 7 more |
| `chapter-03-lesson-02.json` | STANDARD | Whose? and O! — لِمَنْ and يَا | Ghafir 40:16 | Ghafir 40:16 (full parse) | لِمَنْ هٰذَا, يَا رَبِّ, يَا أُسْتَاذُ, الْمُلْكُ, الْيَوْمُ, يَوْمُ الْقِيَامَةِ, أَهْلُ الْجَنَّةِ, + 4 more |
| `chapter-03-lesson-03.json` | STANDARD | Basmalah Unlocked | An-Naml 27:30 | Al-Fatiha 1:1 (5-token parse) | اسْمٌ, اللَّهُ, الرَّحْمٰنُ, الرَّحِيمُ, رَحْمَةُ اللَّهِ, نِعْمَةُ اللَّهِ, فَضْلُ اللَّهِ, عَبْدُ اللَّهِ, + 3 more |
| `chapter-03-lesson-04.json` | REVIEW | Chapter 3 Review | Al-Fatiha 1:1 | Al-Fatiha 1:2 (رَبِّ الْعَالَمِينَ parse) | Review of all Ch3 vocabulary |

- Wired all 4 lessons into `seed.cjs` (requires + `prisma.lesson.create` blocks after Ch2)
- `npm run db:seed` passed: no errors, "Seed data created successfully."

**Authoring notes:**
- Ch3 topic: الإضافة (possessive construction) — two nouns, first loses tanween, second takes kasra
- L1 teaches the idafa rule with 12 Quranic and everyday idafa phrases (بَيْتُ اللَّهِ, مَدِينَةُ النَّبِيِّ, etc.)
- L2 teaches لِمَنْ (whose?) and يَا (vocative), including Ghafir 40:16 — Allah's question on Yawm al-Qiyamah
- L3 fully unpacks بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ (بِ + اسْمِ مضاف + اللَّهِ مضاف إليه + adjectives in kasra); hook is An-Naml 27:30 (Sulayman's letter to the Queen of Sheba)
- L4 REVIEW closes with رَبِّ الْعَالَمِينَ parsed as idafa — connecting back to Fatiha knowledge from Ch1/Ch2
- All STANDARD lessons follow the 10+ vocabulary words standard established in Ch2 rewrite

### Chapter 2 fully authored — 4 lessons seeded (2026-05-24)

- Authored 4 fixture JSON files in `arabai-backend/prisma/fixtures/`:

| File | Template | Title | Hook | Reveal | Key vocabulary |
|---|---|---|---|---|---|
| `chapter-02-lesson-01.json` | STANDARD | Tanween — The Sound of 'A' | Al-Fatiha 1:2 | Al-Fatiha 1:2 (الْحَمْدُ) | كِتَابٌ، قَلَمٌ، بَيْتٌ، مَسْجِدٌ with tanween explained |
| `chapter-02-lesson-02.json` | STANDARD | ال — The Definite Article | Al-Fatiha 1:2 | Al-Baqarah 2:2 (الْكِتَابُ) | الْكِتَابُ، جَدِيدٌ، كَبِيرٌ، قَدِيمٌ — first adjectives |
| `chapter-02-lesson-03.json` | STANDARD | أَيْنَ — Where? | Al-Baqarah 2:255 (Ayat al-Kursi) | Al-Baqarah 2:255 (فِي السَّمَاوَاتِ) | أَيْنَ، فِي، عَلَى، الْمَكْتَبُ |
| `chapter-02-lesson-04.json` | REVIEW | Chapter 2 Review | Al-Fatiha 1:2 | Al-Fatiha 1:2 (full parse) | Review of all Ch2 vocabulary |

- Wired all 4 lessons into `seed.cjs` (requires + `prisma.lesson.create` blocks after Ch1)
- `npm run db:seed` passed: no errors, "Seed data created successfully."
- Backend TypeScript check passed (0 errors)

**Authoring notes:**
- Chapter 2 aligns to curriculum-book1.cjs: "Definite, Indefinite, and Where" (مَعْرِفَة وَنَكِرَة وَأَيْنَ) — NOT adjectives (those are Ch4 in Book 1)
- L1 builds the نَكِرَة (tanween) concept before introducing ال, so the contrast lands in L2
- L2 introduces the first 3 adjectives (جَدِيدٌ، كَبِيرٌ، قَدِيمٌ) as predicates in definite-subject sentences
- L3 grounds أَيْنَ in Ayat al-Kursi (فِي السَّمَاوَاتِ وَالأَرْضِ) — the lesson payoff
- L4 REVIEW closes with a full parse of الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ — the ayah that opened L1

### Lesson player MATCHING / GRAMMAR_PARSE Check button fix (2026-05-24)

- Fixed `play.tsx`: MATCHING and GRAMMAR_PARSE exercises had the "Check" BrandButton rendered **inside** the ScrollView, causing it to scroll off-screen on small devices when there are several pairs/tokens
- Wrapped both exercise renderers in a `<>` fragment — ScrollView contains only the scrollable content; Check button sits below at fixed position outside the scroller
- Change is in `arabai-app/app/(app)/lessons/[lessonId]/play.tsx` (uncommitted, git status: M)

## Recent Changes (since 2026-05-22) — latest (previous)

### Vocabulary bank expanded to 585 words (2026-05-22)

- Expanded `arabai-backend/prisma/vocabulary-seed.cjs` from 80 words to **585 words** across all 16 topic categories
- New words added in 4 separate addition files (`vocab-additions-1.cjs` through `vocab-additions-4.cjs`) imported and merged in `vocabulary-seed.cjs`
- Word counts by category (approximate):
  - People (النَّاس): ~40 | Family (العَائِلَة): ~25 | Body (الجِسْم): ~35 | Home (البَيْت): ~30
  - Food (الطَّعَام): ~25 | Time (الزَّمَن): ~30 | Nature (الطَّبِيعَة): ~45 | Worship (العِبَادَة): ~60
  - Quranic Terms (مُصْطَلَحَات): ~80 | Verbs (الأَفْعَال): ~60 | Travel (السَّفَر): ~25 | Masjid (المَسْجِد): ~30
  - Marketplace (السُّوق): ~25 | School (المَدْرَسَة): ~30 | Numbers (الأَعْدَاد): ~30 | Colors (الأَلْوَان): ~15
- All words have: full harakat, transliteration, English + Urdu translations, word type, gender, root letters (where applicable)
- ~150+ words include Quranic examples referencing real ayat (Al-Fatiha, Al-Ikhlas, An-Nas, Al-Alaq, Al-Baqarah, etc.)
- sortOrder range: 1–585 with no duplicates
- Backend TypeScript check passed (0 errors)
- **To activate:** run `npm run db:seed` in `arabai-backend/`

## Recent Changes (since 2026-05-22) — latest (previous)

### Content schema v2 migration + Chapter 1 authored (2026-05-22)

**Content schema migration:**
- Replaced old split lesson columns (`hook`, `discoverCards`, `exercises`, `revealText`, `revealAyah`, `fatihaProgressDelta`) with a single `content Json` column holding a full `LessonContent` blob (per `Docs/warsh-content-schema.ts`)
- Replaced `LessonType` enum (7 old values) with `LessonTemplate` enum: `STANDARD | SPOKEN_PHRASES | REVIEW | VERB_PATTERN`
- Migration `20260522500000_content_schema_v2` applied to Neon — existing 323 rows migrated cleanly (old `type` mapped; unused columns dropped)
- Prisma client regenerated; TypeScript check passed across all backend files
- API route `GET /api/lessons/[id]` now includes a `transformContent()` adapter — reads new schema, outputs the legacy field shape the lesson player already reads (zero app changes needed)
- Exercise type transformers implemented for: `TAP_TRANSLATION`, `MATCHING`, `BUILD_SENTENCE`, `FILL_BLANK`, `TRUE_FALSE`, `GRAMMAR_PARSE`
- `LessonTemplate` replaces `LessonType` in all affected routes: `chapters/[id]/lessons`, `lessons/[id]/complete`, `chapters` (via `getUserCourseState`), `admin/content`, `admin/lessons`, `progress`, `dashboard` page + client
- `fatihaProgressDelta` removed from schema and all routes; `fatihaPercent` in `GET /api/progress` now returns 0 (Tadabbur system tracks this via `UserSurahProgress` instead)
- Content schema types copied to `arabai-backend/lib/content-schema.ts` for backend type imports
- Seed updated: old curriculum lessons dropped; chapters seeded from metadata only (72 chapters, 0 lessons by default); lessons added via fixture files

**Chapter 1 — fully authored (4 lessons):**

All lessons in `arabai-backend/prisma/fixtures/` and wired into `seed.cjs`:

| File | Template | Title | Hook | Reveal | New words |
|---|---|---|---|---|---|
| `chapter-01-lesson-01.json` | STANDARD | First Encounter with هَذَا | Al-Fatiha 1:1 | Al-Baqarah 2:2 | هَذَا، كِتَاب، قَلَم، بَيْت، مَسْجِد |
| `chapter-01-lesson-02.json` | STANDARD | ذٰلِكَ وَمَا وَمَنْ | Al-Baqarah 2:2 | Al-Baqarah 2:26 | ذٰلِكَ، مَا، مَنْ |
| `chapter-01-lesson-03.json` | STANDARD | هَذِهِ وَتِلْكَ | Yusuf 12:108 | Az-Zukhruf 43:72 | هَذِهِ، تِلْكَ، شَجَرَة، جَنَّة |
| `chapter-01-lesson-04.json` | REVIEW | Chapter 1 Review | Al-Imran 3:138 | Al-Baqarah 2:35 | (review of L1–L3) |

Each lesson has: 5–6 discover cards, 6–8 exercises (xp_value 1 for STANDARD, 5 for REVIEW), Quranic hook + reveal, bilingual Noor messages (English + Urdu).

L4 (REVIEW) reveal is Al-Baqarah 2:35 — Adam and Eve in الْجَنَّةَ — highlights هَٰذِهِ الشَّجَرَةَ, both words from L3.

**Authoring workflow established:**
1. Copy an existing fixture JSON from `arabai-backend/prisma/fixtures/`
2. Author content (follows `Docs/warsh-content-schema.ts` v1.0)
3. Add `require()` and `prisma.lesson.create()` to `seed.cjs`
4. Run `npm run db:seed` (destructive — wipes all users/progress)

**SOT documentation updated:**
- `CLAUDE.md` rewritten: warsh-spec-00 through spec-13 declared as the only SOT; 10 old doc files listed as obsolete and must not be referenced; per-spec-file topic index added; `warsh-spec-11` replaces `warsh-brand-ui-sot.md` as design SOT
- Memory file `project_brand_sot.md` updated to reflect new SOT

**Device testing (2026-05-22):**
- Fresh Android debug APK built via `expo run:android` with `JAVA_HOME` set to Android Studio bundled JDK (`C:\Program Files\Android\Android Studio\jbr`)
- ADB reverse tunnels set up: `tcp:8081` and `tcp:3000`
- App registered new account, completed onboarding, loaded Learn tab
- Chapter 1 lesson tap confirmed: `GET /api/chapters/{id}/lessons 200` and `GET /api/lessons/{id} 200` both logged on backend
- Lesson player launched for Ch1 L1 on physical device

**Verification:**
- Backend TypeScript check passed (0 errors)
- `npm run db:seed` passed: 72 chapters, 4 Ch1 lessons, 80 vocab words, 11 Tadabbur Surahs
- API smoke tests passed:
  - `GET /api/chapters` → 72 chapters, Ch1 with 4 lessons
  - `GET /api/chapters/{ch1_id}/lessons` → 200, 4 lessons listed
  - `GET /api/lessons/{l1_id}` → 200, transformed content with hook/discoverCards/exercises/reveal

## Recent Changes (since 2026-05-22) — previous (was latest)

### Content dashboard starter (2026-05-22)

- Rechecked `Docs/warsh-spec-00-master-index.md`:
  - still marked Active / Source of Truth
  - confirms File 12 as the backend API/data reference and File 05 as the curriculum/content reference
- Added the first backend-hosted Warsh content dashboard at `arabai-backend/app/dashboard/`:
  - `/dashboard` lists curriculum chapters and lessons from the active Prisma database
  - chapter search works across English titles, Arabic titles, and lesson titles
  - dashboard counters show chapter, lesson, and exercise totals
  - chapter editor supports title, Arabic title, description, map coordinates, and default lock state
  - lesson editor supports title, Arabic title, lesson type, XP reward, Fatiha progress delta, reveal text, and JSON editing for `content`, `hook`, `discoverCards`, `exercises`, and `revealAyah`
  - JSON fields are parsed before save so malformed JSON is rejected client-side
- Added admin content APIs:
  - `GET /api/admin/content` returns all chapters and editable lesson content fields
  - `PATCH /api/admin/chapters/:id` updates chapter metadata
  - `PATCH /api/admin/lessons/:id` updates lesson metadata and JSON beat fields
  - write routes accept `x-admin-token` when `ADMIN_DASHBOARD_TOKEN` is configured
  - production write routes are disabled if `ADMIN_DASHBOARD_TOKEN` is missing
- Marked `GET /api/admin/content` as dynamic so Next.js does not prerender a database-backed admin endpoint
- Marked the existing `GET /api/vocabulary/word-of-day` route as dynamic because the production build was also trying to prerender that database-backed endpoint
- Updated `arabai-backend/prisma/validate-curriculum.cjs` to validate the active seed set:
  - `curriculum-book1.cjs`
  - `curriculum-books2-4.cjs`
  - `curriculum-books5-6.cjs`
  - `curriculum-books7-8.cjs`
  - expected count is now `72` chapters
  - lesson count range now allows `4-9` lessons per chapter per the full Warsh mapping
- Verification:
  - `npm run build` passed in `arabai-backend/`
  - `npm run db:validate-seed` passed with `72` chapters and `323` lessons
  - local `GET http://127.0.0.1:3000/dashboard` returned `200` and rendered "Manage Warsh curriculum"
  - local `GET http://127.0.0.1:3000/api/admin/content` returned `200`, `72` chapters, and `323` lessons

**Dashboard next steps:**
- Add create/delete/reorder actions for chapters and lessons
- Add content-shape validation matching `Docs/warsh-content-schema.ts`
- Add preview mode for the mobile lesson beats
- Add explicit review/publish status fields when the Prisma schema is ready for content workflow state
- Configure `ADMIN_DASHBOARD_TOKEN` before using dashboard writes outside local development

## Recent Changes (since 2026-05-22) — previous

### Mixpanel analytics integration (2026-05-22)

- Installed `mixpanel-react-native` as an app dependency
- Created `arabai-app/app/services/analytics.ts`:
  - `initAnalytics()` — initializes Mixpanel when `EXPO_PUBLIC_MIXPANEL_TOKEN` is set; no-op otherwise
  - `identifyUser(userId, peopleProps)` — sets Mixpanel distinct_id and people properties on login
  - `resetAnalytics()` — calls `mp.reset()` on logout to clear identity
  - `setPeopleProps(props)` — updates Mixpanel people profile
- Named event functions: `trackPreviewCompleted`, `trackOnboardingGoalSelected`, `trackOnboardingLevelSelected`, `trackOnboardingPlacementSelected`, `trackOnboardingDailyCommitmentSelected`, `trackSignupCompleted`, `trackLoginCompleted`, `trackLessonStarted`, `trackLessonCompleted`, `trackMilestoneUnlocked`, `trackNoorMessageSent`, `trackSRSReviewCompleted`, `trackTadabburSurahViewed`, `trackPaywallViewed`, `trackSubscriptionStarted`, `trackSubscriptionRestored`, `trackAccountDeleted`
- Updated `app/_layout.tsx`: calls `initAnalytics()` at module level alongside Sentry
- Updated `app/(app)/_layout.tsx`: calls `identifyUser` on login, `resetAnalytics` on logout
- Wired events into:
  - `(auth)/preview/a7-cta.tsx` → `preview_completed` on Begin tap
  - `(auth)/onboarding/goal.tsx` → `onboarding_goal_selected` on Continue
  - `(auth)/onboarding/level.tsx` → `onboarding_level_selected` on Continue
  - `(auth)/onboarding/daily-commitment.tsx` → `onboarding_daily_commitment_selected` on Continue
  - `(auth)/onboarding/placement.tsx` → `onboarding_placement_selected` on Continue
  - `(auth)/register.tsx` → `signup_completed` after register + placement; sets `signup_date` people property once
  - `(auth)/login.tsx` → `login_completed` on success
  - `(app)/lessons/[lessonId]/play.tsx` → `lesson_started` on lesson load; `lesson_completed` with xp/streak/daily_goal_met; `milestone_unlocked` per new achievement
  - `(app)/(tabs)/chat.tsx` → `noor_message_sent` with daily count
  - `(app)/paywall.tsx` → `paywall_viewed` on focus; `subscription_started` with plan; `subscription_restored` with productId
  - `(app)/vocabulary/review.tsx` → `srs_review_completed` with hard/good/easy counts when last card reviewed
- Added `EXPO_PUBLIC_MIXPANEL_TOKEN` to `arabai-app/.env.example`
- App TypeScript check passed
- **To activate:** add `EXPO_PUBLIC_MIXPANEL_TOKEN=<token>` to EAS secrets (preview + production). Token is left blank in development to avoid polluting analytics data. A fresh native build is required for Mixpanel native module autolinking.

**Recommended Mixpanel dashboards to build:**
1. Funnel: install → preview_completed → signup_completed → lesson_started → lesson_completed (7d)
2. Onboarding drop-off: track which step loses users (goal/level/placement/daily-commitment)
3. Engagement: daily active users, lesson_completed per day, noor_message_sent per day
4. Monetization: paywall_viewed → subscription_started conversion rate
5. Retention: lesson_completed cohort by signup week

## Recent Changes (since 2026-05-22) — previous (was latest)

### Curriculum rewrite: chapters 1–15 replaced with spec-aligned content (2026-05-22)

- Created `arabai-backend/prisma/curriculum-book1.cjs` — replaces old `curriculum-phase15.cjs`
- Updated `seed.cjs` to import from `curriculum-book1.cjs` instead of `curriculum-phase15.cjs`
- **Ch1–10 (Book 1):** Fully rewritten — richer Quranic hooks, precise Arabic grammar terms (اسم إشارة، نعت، مضاف إليه etc.), stronger hook questions and reveals matching spec quality
- **Ch11–15 (Book 2):** Completely replaced — old content (numbers, colors, إِنَّ, لَيْسَ, comparison) was wrong for these positions; those topics belong in Ch24–48. New content:
  - Ch11: Home and Family — أُمّ، أَب، أَخ، أُخْت، فِيهِ/فِيهَا, family idafa
  - Ch12: Introductions and Personal Questions — name, nationality, profession, past verbs as recognition
  - Ch13: Plural Forms Introduction — sound masculine (ونَ), sound feminine (ات), broken plural as recognition
  - Ch14: Describing Plurals — adjective agreement, non-human plural + feminine singular adjective rule
  - Ch15: Demonstratives Expanded — هَؤُلَاءِ، أُولَئِكَ, ضمير الفصل, complete pointing system
- DB verified: 72 chapters, 323 lessons
- `npm run db:seed` passed

## Recent Changes (since 2026-05-22) — previous (was latest)

### Sentry error tracking integration (2026-05-22)

**Backend:**
- Installed `@sentry/nextjs@^10.x`
- Created `sentry.server.config.ts`, `sentry.client.config.ts`, `sentry.edge.config.ts` — init Sentry with DSN, environment, and `tracesSampleRate` (10% in production, 100% in dev)
- `sentry.server.config.ts` strips `password` and `email` fields from request bodies before sending events
- Created `instrumentation.ts` — Next.js 14 App Router hook; imports server or edge config based on `NEXT_RUNTIME`
- Updated `next.config.js` to use `withSentryConfig` wrapper (enables source maps, build-time Sentry webpack plugin)
- Added `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` to `.env.example` (empty = disabled in dev)
- Backend TypeScript check passed; production build passed

**Mobile:**
- Installed `@sentry/react-native@^8.x`
- Created `arabai-app/app/services/sentry.ts`:
  - `initSentry()` — initializes Sentry when `EXPO_PUBLIC_SENTRY_DSN` is set; no-op otherwise
  - `setSentryUser(userId)` / `clearSentryUser()` — attach/detach user ID (no email) to error context
  - `captureError(error, context?)` — callable from anywhere to log handled exceptions
  - `beforeSend` hook strips all user fields except `id` (privacy rule: no email/name in error reports)
- Updated `app/_layout.tsx`: calls `initSentry()` at module level, wraps default export with `Sentry.wrap(RootLayout)` for unhandled error capture
- Updated `app/(app)/_layout.tsx`: `useEffect` on `[token, user]` calls `setSentryUser` on login and `clearSentryUser` on logout/unauthenticated state
- Added `@sentry/react-native/expo` plugin to `app.json` plugins array (required for native module autolinking)
- Added `EXPO_PUBLIC_SENTRY_DSN` to `arabai-app/.env.example` and `env.d.ts`
- Also pre-typed `EXPO_PUBLIC_MIXPANEL_TOKEN` in `env.d.ts` for future Mixpanel integration
- App TypeScript check passed

**To activate:**
1. Create a Sentry project at sentry.io (type: React Native for mobile, Next.js for backend)
2. Copy the DSN from project settings
3. Backend: add `SENTRY_DSN=<dsn>` to Vercel environment variables
4. Mobile: add `EXPO_PUBLIC_SENTRY_DSN=<dsn>` to EAS secrets for preview/production profiles
5. A fresh native Android build (`expo run:android` or `eas build`) is required for the native Sentry module to link

## Recent Changes (since 2026-05-22) — previous

### Curriculum expansion: 40 → 72 chapters (2026-05-22)

- Created `arabai-backend/prisma/curriculum-books5-6.cjs` — 19 new chapters (41–59), 81 new lessons
- Created `arabai-backend/prisma/curriculum-books7-8.cjs` — 13 new chapters (60–72), 81 new lessons
- Updated `seed.cjs` to import and spread all four chapter arrays (chapters1–4)
- Covers:
  - Ch41–43: Book 4 tail — reading comprehension, advanced Q&A (كَمْ/مَتَى/لِمَاذَا), Book 4 integration
  - Ch44: لَمْ and لَمَّا — Al-Ikhlas fully unlocked (لَمْ يَلِدْ وَلَمْ يُولَدْ)
  - Ch45–46: The three states of المضارع (مرفوع/منصوب/مجزوم) — Al-Masad unlocked
  - Ch47: Sound masculine plural full treatment (ون↔ين, حذف النون in idafa)
  - Ch48: Time, numbers, measurements (اثْنَا عَشَرَ, تمييز)
  - Ch49–54: Advanced sentences, dialogue, verb pattern reinforcement, Book 5 capstone
  - Ch55: الإعراب والبناء — declinable vs indeclinable nouns, the three cases
  - Ch56: Special noun types — المقصور، المنقوص، الأسماء الخمسة، المثنى — Al-Humazah unlocked
  - Ch57: الأفعال الخمسة and weak verbs (أجوف، ناقص) — كَانَ fully treated
  - Ch58–59: Higher syntax (transitive/intransitive, fronted predicate), Book 6 capstone
  - Ch60: Travel and Hajj conversation vocabulary
  - Ch61: Trade ethics, weights, and اسم الآلة morphology (مِفْعَال/مِفْعَل/مِفْعَلَة)
  - Ch62: Demonstratives spiral — لَا النافية للجنس, البدل
  - Ch63: إضافة effects — حذف النون for duals and sound masculine plurals
  - Ch64–65: Formal nominal/verbal sentence distinction, كان وأخواتها complete
  - Ch66: ظرف الزمان والمكان — adverbs of time and place with full i'rab
  - Ch67: لو — counterfactual conditions, Tawheed proof (Al-Anbiya 21:22)
  - Ch68: Complete jussive inventory — لَمْ، لَا الناهية، لام الأمر, الأفعال الخمسة in مجزوم
  - Ch69: جواب الطلب — jussive response to commands (اتَّقُوا اللَّهَ وَيُعَلِّمُكُمُ)
  - Ch70: الاستثناء with إِلَّا — including full grammar of لَا إِلَٰهَ إِلَّا اللَّهُ
  - Ch71: الحال and التمييز — descriptive accusatives (يَبْكُونَ in Yusuf 12:16)
  - Ch72: المنادى capstone — يَا أَيُّهَا الَّذِينَ آمَنُوا, full curriculum completion
- Validated: 32 new chapters, 162 new lessons, orders 41–72 sequential, no syntax errors
- Grand total: 72 chapters, 322 lessons (15 ch1 seed + 100 books2-4 + 45 books5-6 Ch41–59 + 117 books7-8 Ch60–72)
- **To activate:** run `npm run db:seed` in `arabai-backend/`

## Recent Changes (since 2026-05-22) — previous (was latest)

### Curriculum expansion: 15 → 40 chapters (2026-05-22)

- Created `arabai-backend/prisma/curriculum-books2-4.cjs` — 25 new chapters (16–40), 100 new lessons
- Covers Madinah Reader Book 2 (Chapters 16–23), Book 3 (Chapters 24–33), Book 4 intro (Chapters 34–40)
- Key topics added:
  - Ch16–17: Classroom vocab, past-tense verbs as recognition vocabulary
  - Ch18: Relative pronouns (الَّذِي/الَّتِي) — grammatical core of Surah An-Nas
  - Ch19–20: Singular and plural attached pronouns — enables parsing رَبَّنَا، كِتَابِي
  - Ch21–23: Places/movement, dialogue verbs, Book 2 consolidation
  - Ch24: إِنَّ — emphasis particle (Al-Kawthar hook)
  - Ch25: لَيْسَ — nominal sentence negation
  - Ch26–28: Complex idafa, prepositions in depth, action verbs
  - Ch29: Formal nominal vs verbal sentence distinction (Al-Kafirun hook)
  - Ch30–33: Reading comprehension, full interrogative paradigm, إِذَا conditionals, Book 3 bridge
  - Ch34: Present tense المضارع — prefix system يَـ/نَـ/أَـ/تَـ (Al-Fatiha 1:5 hook — إِيَّاكَ نَعْبُدُ)
  - Ch35: Future with سَ and سَوْفَ
  - Ch36: Verbal noun المصدر (ذِكْر، صَلَاة، حَمْد، عِبَادَة)
  - Ch37: Feminine verb forms
  - Ch38–40: Expanded verb usage, Surah Quraysh vocabulary, layered sentence descriptions
- Updated `seed.cjs` to import and spread both chapter arrays + added Neon cold-start retry (8 attempts × 3s)
- DB verified: 40 chapters, 160 lessons, 15 achievements, 80 vocab words, 11 Tadabbur surahs
- Node validation test passed: `Total chapters: 40 | Last order: 40`

### Email validation — register screen (2026-05-22)

- Added `isValidEmail()` regex check in `handleSubmit` — blocks API call on malformed email
- Added minimum password length check (8 chars) before API call
- Added `emailTouched` / `passwordTouched` state — inline field hints appear on blur:
  - Email field border turns red + "Enter a valid email address." hint when invalid format
  - Password field shows "Password must be at least 8 characters." when too short
- Password placeholder updated to "Password (min 8 characters)"
- Register call now uses `email.trim()` to strip accidental leading/trailing spaces
- App TypeScript check passed

## Recent Changes (since 2026-05-22) — previous

### Spoken Fus'ha — File 06 (2026-05-22)

**Backend:**
- Added `phrasesSpoken Int @default(0)` to `User` schema
- Added `SPOKEN_PHRASES` to `LessonType` enum
- Migration `20260522400000_add_spoken_fusha`
- `POST /api/lessons/[id]/complete` now accepts optional `phrasesCompleted` — increments `user.phrasesSpoken`, only on first completion, capped at 100
- `GET /api/progress` now returns `phrasesSpoken`
- Added 5 speaking milestones to `lib/achievements.ts` and `prisma/seed.cjs`:
  - `first_shadow_repeat` (10 XP) — first SHADOW_REPEAT with recording
  - `first_spoken_lesson` (25 XP) — first SPOKEN_PHRASES lesson SP4
  - `phrases_10` (15 XP), `phrases_50` (25 XP), `phrases_100` (50 XP)
- `checkAndAwardAchievements` extended with `phrasesSpoken`, `firstShadowRepeat`, `firstSpokenLesson` context fields
- Backend TypeScript check passed; production build passed
- **To activate:** run `npm run db:migrate && npm run db:generate && npm run db:seed` in `arabai-backend/`

**Mobile:**
- Created `arabai-app/app/services/micPermission.ts` — microphone permission helper using `Audio.requestPermissionsAsync()` + AsyncStorage key `warsh_mic_permission`; tracks `not_asked | granted | denied | denied_permanent` states
- Created `arabai-app/app/components/WaveformBars.tsx` — View-based waveform visualization (no SVG needed); uses static decorative pattern for original audio, accepts live level array for recording display
- Created `arabai-app/app/components/ShadowRepeatExercise.tsx` — full 6-state SHADOW_REPEAT component:
  - States: `prepare → listening → ready → recording → comparison → done`
  - Plays original audio with `expo-av` Sound; records with `Audio.Recording` at 16 kHz mono
  - Live waveform during recording via `setProgressUpdateInterval(150)` + metering
  - Compare mode plays original → 500ms pause → user recording back-to-back
  - "Re-record" discards and resets to ready state
  - "Done" deletes recording file (privacy guarantee)
  - M3 permission modal appears inline when microphone not granted; supports Skip path
  - Auto-stops recording at 15 seconds
  - Records are deleted on component unmount (cleanup)
- Updated `arabai-app/app/(app)/lessons/[lessonId]/play.tsx`:
  - Added `SHADOW_REPEAT` to `ExerciseType` union
  - `phrasesCompletedRef` (useRef) tracks phrase count; passed to complete API
  - `SHADOW_REPEAT` in `renderPractice` renders `ShadowRepeatExercise`; increments ref on completion with recording
  - `SPOKEN_PHRASES` lesson type now routes to a 4-beat SP template:
    - SP1 (beat 1): Context screen — title, description, "Begin" CTA
    - SP2 (beat 2): Phrase Practice loop — per-phrase `intro → shadow → recognition → phraseComplete` mini-state-machine; uses `ShadowRepeatExercise` + 4-option AUDIO_RECOGNITION check
    - SP3 (beat 3): Mini-Dialogue — scrollable dialogue with per-line Arabic + translation
    - SP4 (beat 5): reuses standard close with speaking-specific Noor message and phrase count display
- Updated `arabai-app/app/(app)/(tabs)/profile.tsx`: speaking stats card shows `phrasesSpoken` count (only visible after user completes their first SHADOW_REPEAT exercise)
- App TypeScript check passed

**Notes:**
- SPOKEN_PHRASES lessons need content seeded (`content.phrases[]`, `content.dialogue[]`, `content.contextTitle`) — curriculum expansion (File 05) task covers this
- Audio URLs for phrase playback (in `ShadowRepeatExercise` and SP2 phrase intro) are not yet wired — the component gracefully handles missing audio (marks as listened immediately, shows play icon)
- The speaking card on profile is hidden until `phrasesSpoken > 0` — appears after first SHADOW_REPEAT exercise

## Recent Changes (since 2026-05-22) — previous

### QA bug fixes (2026-05-22)

- Fixed seed failure: added `userSurahProgress.deleteMany()` and `userVocabularyWord.deleteMany()` before `progress.deleteMany()` in `seed.cjs` (FK-safe delete order); also added `vocabularyWord.deleteMany()` and `tadabburSurah.deleteMany()` after user delete
- Fixed button/back-arrow glyphs rendering as garbage characters on Android: replaced all `→`/`←` Unicode arrows (not in Lora/Amiri fonts) throughout the app — BrandButton titles drop the arrow entirely; `← Back` text becomes `‹ Back`; inline text arrows become plain text or `›`
- Fixed A3 discover underline: switched from `width: "0%"→"100%"` percentage animation (broken on Android in shrink-wrapped `alignItems: center` container) to fixed-pixel `0→160` animation; also increased height from 2px to 3px for visibility
- Fixed B7 placement ambiguity: removed the "Skip this - I'll start from the beginning" button that was a duplicate of "I'm completely new" (both mapped to BEGINNER, both highlighted simultaneously)
- Added email format validation to `POST /api/auth/register` (regex check before DB lookup, returns `400 bad_request` on malformed email)
- Increased lesson exercise feedback delay from 1200ms to 1800ms so correct/wrong state is readable before auto-advance
- Fixed Noor chat header subtitle horizontal clipping: added `flex: 1` to the text container View and `numberOfLines={1}` on subtitle
- Fixed paywall crash (`E_IAP_NOT_AVAILABLE` from react-native-iap when Play Store not configured in dev): wrapped `initConnection()` in an async IIFE with try/catch instead of `.catch(() => {})` which didn't catch synchronous native throws
- Registered `milestones` screen in `(app)/_layout.tsx` Stack for consistency
- Backend TypeScript check passed
- App TypeScript check passed
- **To activate seed fix:** run `npm run db:seed` in `arabai-backend/`

## Recent Changes (since 2026-05-21) — previous

### Vocabulary Bank v1

- Added `VocabularyWord` model to Prisma schema with full linguistic fields: `arabic`, `arabicPlain`, `transliteration`, `translationEn`, `translationUr`, `wordType`, `gender`, `pluralForm`, `rootLetters`, `topicCategories[]`, `chapterIntroduced`, `frequencyInQuran`, `quranicExample` (JSON), `sortOrder`
- Created migration `20260521130000_add_vocabulary_word`
- Created `arabai-backend/prisma/vocabulary-seed.cjs` — 80 curated words covering all 16 topic categories (5 per topic), with full harakat, transliteration, Urdu translations, root letters, and Quranic examples for key words (رَبّ, رَحْمَن, رَحِيم, كِتَاب, صَلَاة, نُور, نَاس, قَلْب, كُرْسِيّ, قَلَم, مَاء, سَمَاء, أَرْض, يَوْم, قَرَأَ)
- Wired `seedVocabulary(prisma)` into `seed.cjs` — runs after achievements and curriculum
- Created `GET /api/vocabulary/words` — returns words with optional `?topic=` and `?search=` filters; search matches arabic, arabicPlain, transliteration, translationEn, translationUr, and rootLetters
- Created `GET /api/vocabulary/word-of-day` — deterministic daily rotation by `daysSinceEpoch % wordCount`, preferring words with Quranic examples
- Added `getVocabularyWords()` and `getWordOfDay()` helpers to `arabai-app/app/services/api.ts`
- Rebuilt `arabai-app/app/(app)/(tabs)/vocabulary.tsx` as a real V1 home screen:
  - Header with "Vocabulary · مُفْرَدَات" brand lockup and "Free forever" eyebrow
  - Word of the Day card with Arabic display, PlayButton, translation, transliteration, and Quranic ayah preview where available
  - Stats row (word count, topic count)
  - Browse by Topic: 2-column grid of all 16 topic cards, each showing Arabic name, English name, and word count from real API data
  - Inline search (activates at 2+ characters): live query against backend, shows word rows with PlayButton
- Created `arabai-app/app/(app)/vocabulary/[topic].tsx` — topic detail screen (V3):
  - Header with back navigation and topic name (Arabic + English)
  - Full word list for the topic from API
  - In-screen search filter (client-side)
  - Each card shows Arabic, PlayButton, English meaning, transliteration, and Quranic ayah if available
  - Word count footer
- Ran `npx prisma generate` to regenerate Prisma client with the new model
- Backend TypeScript check passed
- App TypeScript check passed
- **To activate:** run `npm run db:migrate && npm run db:seed` in `arabai-backend/`

### Preview experience A1–A7 (implemented)

- Created `arabai-app/app/(auth)/preview/` with 7 screens matching spec File 03 §3:
  - `a1-welcome.tsx` — Warsh logo + "Let me show you what Warsh is." + Begin → button
  - `a2-hook.tsx` — Large Ayah (إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ) with animated waveform bars; caption + Continue appear after 3 s
  - `a3-discover.tsx` — Single word إِنَّا, transliteration, "Tap to reveal" → fades in "Indeed, We" with gold underline animation
  - `a4-grammar.tsx` — Full ayah + bordered teaching note breaking down إِنَّ + نَا
  - `a5-noor.tsx` — Noor avatar + chat bubble with full intro message
  - `a6-tadabbur.tsx` — Animated An-Nas word-grid: words light up sequentially from dim (opacity 0.35) → learning (ink) → mastered (gold) over ~5 s; Continue appears after animation
  - `a7-cta.tsx` — "Begin your journey." CTA; sets `warsh_preview_seen=1` in AsyncStorage on mount; routes to onboarding or login
- All A1–A6 screens have a "Skip preview" link (top-right) that jumps directly to A7
- Converted `app/index.tsx` from static landing screen to smart routing gate:
  - Reads `isHydrated` (auth store) + `warsh_preview_seen` (AsyncStorage) in parallel
  - Has token → `/(app)/(tabs)` (returning logged-in user)
  - Seen preview, no token → `/(auth)/login` (returning logged-out user)
  - First launch → `/(auth)/preview/a1-welcome`
- App TypeScript check passed

### Token refresh (implemented)

- Extended JWT expiry from 7 days to 30 days (`arabai-backend/lib/auth.ts`)
- Added `verifyTokenAllowExpired()` — extracts userId from an expired-but-otherwise-valid token; used only by the refresh endpoint
- Rewrote `POST /api/auth/refresh` — accepts an expired Bearer token, issues a fresh 30-day token; returns 401 only if the token is completely invalid (tampered/missing), never just because it expired
- Added `setToken(token)` action to `authStore.ts` — updates the stored token without touching the user object
- Added Axios response interceptor to `arabai-app/app/services/api.ts`:
  - Catches 401 from any non-auth endpoint
  - Calls `POST /api/auth/refresh` with the current (possibly expired) token
  - On success: saves new token via `setToken`, retries original request transparently
  - On failure (token unrecoverable): calls `clearSession()` so the auth guard redirects to login
  - Uses a `_retried` flag to prevent infinite retry loops
- Backend TypeScript check passed
- App TypeScript check passed

### Tadabbur system (implemented)

**Backend:**
- Added `TadabburSurah` model — stores Surah metadata + full `ayatData` JSON (ayat with word-level `arabic`, `arabicPlain`, `vocabId` links to VocabularyWord)
- Added `UserSurahProgress` model — tracks completion per user per Surah; added relation to User
- Migration `20260522300000_add_tadabbur`
- Created `prisma/tadabbur-seed.cjs` — all 11 Surahs in Phase 2 progression (Al-Fatiha → Al-Fil), with full Arabic text, word tokenisation, and manual `vocabKey` overrides for words that match the VocabularyWord seed (رَبّ, اللَّه, رَحْمَن, رَحِيم, يَوْم, دِين, نَاس, صَلَاة, etc.); vocabIds resolved against VocabularyWord.arabicPlain at seed time
- Wired `seedTadabbur(prisma)` into `seed.cjs` — runs after vocabulary seed
- Created `lib/tadabbur.ts` — `computeWordStates()` assigns `sage | ink | gold` per word (gold = has vocabId + user has `UserVocabularyWord.repetitions ≥ 3`; ink = has vocabId; sage = no vocabId); `computeSurahState()` computes `comprehensionPercent` from mastered/vocab-linked words
- Created `GET /api/tadabbur` — returns `focusSurahId` (lowest-order incomplete Surah) + all Surah statuses with `comprehensionPercent`
- Created `GET /api/tadabbur/[surahId]` — returns full ayat with word states for the authenticated user
- Backend TypeScript check passed (after `npm run db:generate`)

**Mobile:**
- Created `app/(app)/tadabbur.tsx` (L5):
  - Focus Surah header: Arabic name, English/meaning, progress bar, comprehension %
  - Word-state legend (gold/ink/sage)
  - Color-coded Surah ayat — each word rendered in its state color; ink/gold words tappable
  - Per-ayah audio play button + reference (surah:ayah)
  - Ayah translation in italic below each block
  - Word bottom sheet on tap: Arabic word, audio, state badge, "View full details →" navigates to V5
  - Completed Surahs section with completion date and checkmark
  - Upcoming locked Surahs list
  - Footer: "Phase 3 begins, in shaa Allah"
- Added `getTadabbur()` and `getTadabburSurah()` to `api.ts`
- Registered `tadabbur` stack screen in `(app)/_layout.tsx`
- Updated Learn home (`index.tsx`):
  - Replaced old static Fatiha progress card with real Tadabbur card fetching `GET /api/tadabbur`
  - Shows current focus Surah name, progress bar, comprehension %, tap → L5
  - Removed dead FATIHA_WORDS constant and unused fatiha state vars
- App TypeScript check passed
- **To activate:** run `npm run db:migrate && npm run db:generate && npm run db:seed` in `arabai-backend/`

### Paywall / monetization (implemented)

**Backend:**
- Added subscription fields to `User` schema: `trialStartAt`, `trialExpiresAt` (defaults to `now + 7 days`), `subscriptionStatus` (trial/active/expired/canceled), `subscriptionProductId`, `subscriptionActiveUntil`, `noorOverageBalance`
- Migration `20260522200000_add_subscription`
- Created `lib/subscription.ts` — `getSubscriptionState()` computes `trialDaysRemaining`, `trialActive`, `subscriptionActive`, `hasAccess`; `requiresSubscription()` helper
- Created `GET /api/subscription/status` — returns full subscription state for authenticated user
- Created `POST /api/subscription/verify` — records subscription after purchase (v1 trusts client receipt; full Apple/Google verification noted as pre-launch requirement)
- Updated `GET /api/lessons/[id]` — returns `402 subscription_required` when trial is expired and no active subscription
- Updated `GET /api/progress` — now returns `userName`, `subscription` object (trialDaysRemaining, subscriptionStatus, hasAccess etc.)

**Mobile:**
- Installed `react-native-iap@^13.0.4` (RN 0.73 / SDK 51 compatible)
- Created `app/(app)/paywall.tsx` (Y4):
  - Hero section with book icon, "Continue your journey." title, personalised trial copy
  - Pricing tiles: annual ($10/yr, Save 17%, pre-selected) + monthly ($1/mo) with radio selection
  - Localized prices from store when available, fallback labels in dev
  - "Start subscription →" CTA triggers `IAP.requestSubscription()` → `verifyPurchase()` backend call → `acknowledgePurchaseAndroid()` → success alert
  - "Restore purchases" flow via `getAvailablePurchases()` → verify → restore
  - Feature list (7 bullet points matching spec)
  - "Vocabulary Bank remains free" callout
  - Full legal disclosure text
  - Dismissable (back button) when accessed from Settings; no back button when forced by paywall gate
- Added `verifyPurchase()` and `getSubscriptionStatus()` helpers to `api.ts`
- Added `402` interceptor to Axios — any `subscription_required` response navigates to paywall automatically
- Registered `paywall` stack screen in `(app)/_layout.tsx`
- **Trial banners on L1** (Learn home, `index.tsx`):
  - Trial expired: persistent dark ink banner with lock icon → paywall (not dismissable)
  - Trial countdown (days ≤ 5): dismissable banner — urgency colour escalates at ≤2 days and day 0
- **Settings screen**: added "Manage subscription" row in Account section → paywall
- Backend TypeScript check passed
- App TypeScript check passed
- **To activate:** run `npm run db:migrate && npm run db:generate` in `arabai-backend/`
- **Before launch:** add real product IDs (`warsh_monthly`, `warsh_annual`) to Google Play Console and replace client-trust receipt with server-side Google Play API verification in `POST /api/subscription/verify`

### Push notifications (implemented)

- Installed `expo-notifications ~0.28.19` and `expo-device ~6.0.2` (SDK 51 compatible)
- Added `expo-notifications` plugin to `app.json` with brand gold color (`#9A8F6A`) for Android notification icon
- Created `arabai-app/app/services/notifications.ts`:
  - `requestNotificationPermission()` — requests OS permission, sets up Android notification channel
  - `getNotificationPermissionStatus()` — returns `granted | denied | undetermined`
  - `setupNotificationSchedules(prefs, userName, streak)` — schedules/cancels based on user prefs:
    - **Daily reminder:** repeating daily at 8 PM — "Time for today's lesson, [Name]."
    - **Streak at risk:** daily at 8 PM (only if streak ≥ 3) — "Your streak of [N] days is at risk."
    - **Word of the Day:** repeating daily at 9 AM
  - `cancelTodayReminders()` — cancels daily reminder + today's streak-risk notification; called when daily goal is met
  - `fireMilestoneNotification(title)` — fires immediate notification when milestone unlocked
  - `cancelAllNotifications()` — cancels all scheduled notifications (used on logout/delete)
- `Notifications.setNotificationHandler` configured at module level so foreground notifications show alerts
- Updated `(app)/_layout.tsx`:
  - On login (`token` becomes non-null): calls `initNotifications()` — requests permission, fetches progress, calls `setupNotificationSchedules`
  - Clears badge count on app open via `setBadgeCountAsync(0)`
  - `addNotificationResponseReceivedListener` handles notification taps: routes to Learn/Vocabulary/Milestones based on `data.screen`
  - Cleans up listeners on unmount
- Updated `lessons/[lessonId]/play.tsx`:
  - Calls `cancelTodayReminders()` when `data.dailyGoalXp > 0` (first lesson of day)
  - Calls `fireMilestoneNotification(achievement.title)` for each new achievement in completion response
- Updated `settings.tsx`:
  - Notification toggle changes call `requestNotificationPermission()` then `setupNotificationSchedules()` immediately
  - Account delete calls `cancelAllNotifications()` before clearing session
- Updated `hooks/useAuth.ts`: logout calls `cancelAllNotifications()` before clearing session
- Backend TypeScript check passed
- App TypeScript check passed
- **Note:** A fresh native Android build (`expo run:android`) is required for `expo-notifications` and `expo-device` autolinking to take effect

### Settings screen Y3 (implemented)

- Created `PATCH /api/users/me` — updates `dailyGoalMinutes` (validated: 5/10/15/30) and `nativeLanguage` (en/ur)
- Created `DELETE /api/users/me` — deletes all user data in dependency order within a transaction (UserVocabularyWord → UserAchievement → ChatMessage → Progress → Streak → User)
- Added `updateUserProfile()` and `deleteAccount()` helpers to `api.ts`
- Created `arabai-app/app/(app)/settings.tsx` — full Y3 settings screen:
  - **Notifications section:** daily reminder, streak at risk, milestone toggles (stored in AsyncStorage `warsh_settings`)
  - **Audio section:** audio playback, auto-play in reviews, haptics toggles (AsyncStorage)
  - **Vocabulary review section:** SRS daily limit picker (5/10/20/30) — stored in AsyncStorage, applied in V6
  - **Daily goal section:** commitment picker (5/10/15/30 min) — calls `PATCH /api/users/me` immediately on change
  - **Support section:** Help & FAQ, Send feedback (stubs with chevron)
  - **Legal section:** Privacy Policy, Terms of Service (stubs)
  - **About section:** app version + "Made with love in Pakistan"
  - **Account section:** Delete account with two-step `Alert.alert` confirmation
- Added gear icon (settings-outline) to profile screen header → navigates to `/(app)/settings`
- Registered `settings` stack screen in `(app)/_layout.tsx`
- Backend TypeScript check passed
- App TypeScript check passed

### Streak freeze system (implemented)

- Added `lastFreezeUsedAt DateTime?` to `Streak` schema; migration `20260522100000_add_streak_freeze_tracking`
- Updated `POST /api/lessons/[id]/complete` streak logic:
  - **Missed day + freeze available** → consume one freeze, keep streak intact, record `lastFreezeUsedAt`
  - **Missed day + no freezes** → reset streak to 1 (existing behaviour)
  - **Consecutive day** → increment streak; if new streak hits 7 or a multiple of 30, award 1 freeze (max 2)
- `shouldAwardFreeze(newStreak, currentFreezes)` helper in lesson complete route
- `GET /api/progress` now returns `streakFreezes` and `freezeUsedYesterday` (computed from `lastFreezeUsedAt` via `isYesterdayPKT`)
- Profile streak card (`profile.tsx`): shows shield icons (one per freeze held), freeze count note
- Learn tab home (`index.tsx`): on focus, reads `freezeUsedYesterday` from progress + checks AsyncStorage key `warsh_freeze_banner_shown`; if freeze was used and banner not yet shown today, displays a green dismissable banner — "Yesterday is forgiven. Continue today, in shaa Allah."
- Backend TypeScript check passed (after `npm run db:generate`)
- App TypeScript check passed
- **To activate:** run `npm run db:migrate && npm run db:generate` in `arabai-backend/`

### Vocabulary Bank v2 (implemented)

- Added `UserVocabularyWord` model to Prisma schema — tracks SRS state (SM-2) per user per word: `easeFactor`, `intervalDays`, `repetitions`, `nextReviewDate`, `lastReviewQuality`, `isFavorite`, `isHidden`
- Created migration `20260522000000_add_user_vocabulary_word`
- Created `GET /api/vocabulary/words/[id]` — word detail + user SRS state + related words by root
- Created `PATCH /api/vocabulary/words/[id]/user` — toggle favorite, toggle hidden, mark for review
- Created `GET /api/vocabulary/srs/due` — today's review queue (≤20 most-overdue words, `isHidden=false`)
- Created `POST /api/vocabulary/srs/review` — SM-2 update (Hard=2 / Good=4 / Easy=5); returns updated SRS state
- Created V5 word detail screen at `arabai-app/app/(app)/vocabulary/word/[wordId].tsx`:
  - Large Arabic display, audio play button, transliteration, English + Urdu translation
  - Word type badge + mastered badge (if repetitions≥5, ease≥2.5)
  - Grammar card: gender, plural form, root letters
  - Quranic example with gold-highlighted target word, ayah audio button, reference, translation
  - Frequency count if available
  - Actions: Mark for review, Hide/Unhide from review, Favorite toggle (heart icon in header)
  - Related words by root (tappable → V5 for that word)
- Created V6 SRS review session at `arabai-app/app/(app)/vocabulary/review.tsx`:
  - Pre-review screen: count + Begin button
  - Card front: large Arabic + "Tap to reveal" + audio play
  - Card back: translation, transliteration, Quranic snippet, Hard/Good/Easy response buttons
  - Progress bar across top
  - Done screen: بَارَكَ اللّٰهُ فِيكَ + Hard/Good/Easy counts
- Updated V1 (`vocabulary.tsx`): Word of Day card and search result rows are now tappable → V5; SRS review card appears when words are due, routes to V6
- Updated V3 (`[topic].tsx`): word rows are now tappable → V5
- Added new API helpers to `api.ts`: `getVocabularyWordDetail`, `updateUserVocabularyWord`, `getSRSDueWords`, `submitSRSReview`
- Registered new stack screens in `(app)/_layout.tsx`: `vocabulary/word/[wordId]`, `vocabulary/review`
- Backend TypeScript check passed (after `npm run db:generate`)
- App TypeScript check passed
- **To activate:** run `npm run db:migrate && npm run db:generate` in `arabai-backend/`

### Tier 1 + Tier 2 XP + Onboarding fixes

- Extracted `get4amPKTBoundary()` into `arabai-backend/lib/date.ts` and replaced the inline duplicate in `progress/route.ts`
- Updated `POST /api/lessons/[id]/complete` with three new XP awards:
  - **Daily goal XP** — 5 XP on the first lesson completed each 4 AM-bounded PKT day
  - **Chapter completion bonus** — 50 XP when all lessons in a chapter are COMPLETED or SKIPPED_BY_PLACEMENT
  - Both bonuses are only awarded on `firstCompletion` (replaying a done lesson awards nothing extra)
  - `chapterBonusXp` and `dailyGoalXp` are now returned in the completion response alongside `xpEarned`
- Wired the `FIRST_CHAPTER` achievement — it was defined in the catalog and seed but never checked; added it to `checkAndAwardAchievements` using the new `chapterJustCompleted` context flag
- Added `dailyGoalMinutes` to `arabai-backend/app/api/auth/register/route.ts` — whitelist-validated against [5, 10, 15, 30], defaults to 10
- Added `dailyGoalMinutes` field (default 10) to `onboardingStore.ts` with `setDailyGoalMinutes` action
- Updated `useAuth.register()` to accept and forward `dailyGoalMinutes`
- Updated `register.tsx` to read `dailyGoalMinutes` from onboarding store and pass it through
- Created `arabai-app/app/(auth)/onboarding/daily-commitment.tsx` — new B4 screen:
  - 4 tappable options: 5 / 10 / 15 / 30 min with subtitle copy from spec
  - Selection reflected immediately via `selected` prop on BrandButton
  - Routes to `name` on Continue
- Updated `level.tsx` to route to `daily-commitment` instead of `name` (inserting B4 into the flow)
- Backend TypeScript check passed
- App TypeScript check passed

## Recent Changes (since 2026-05-21)

- Added `dailyGoalMinutes Int @default(10)` to User schema + migration `20260521100000_add_daily_goal`
- Seeded 10 achievements: first_lesson, first_chapter, streak_3/7/30, xp_100/500/1000, lessons_10, first_noor
- Created `arabai-backend/lib/achievements.ts` — SM-2-style achievement checker, runs inside lesson-complete transaction
- Updated `POST /api/lessons/[id]/complete` — checks + awards achievements after each lesson, returns `newAchievements[]`
- Updated `GET /api/progress` — now returns `dailyGoalMinutes`, `lessonsCompletedToday`, `dailyGoalMet`, and `achievements[]` (earned)
- Created `GET /api/achievements` — full list of achievements with earned/locked state and unlock dates
- Added daily goal progress card to Learn home (L1) — shows "goal met" state with بَارَكَ اللّٰهُ فِيكَ when complete
- Added achievements section to Profile (Y1) — horizontal badge row, taps through to milestones screen
- Created `arabai-app/app/(app)/milestones.tsx` — lists all earned + locked achievements with icons, dates, XP values
- App TypeScript check passed
- Backend TypeScript check passed
- `npm run db:seed` passed with 10 achievements seeded

## Recent Changes (since 2026-05-21)

- Installed `expo-av` (SDK 51 compatible) for native audio playback
- Created `arabai-app/app/components/PlayButton.tsx`:
  - gold speaker icon (Ionicons `volume-medium-outline`) using `@expo/vector-icons`
  - on press: downloads MP3 via `getCachedTtsAudioUri`, plays with `expo-av`
  - shows `ActivityIndicator` while loading, stop icon while playing, error icon (2s) on failure
  - tap again while playing stops playback
  - sound unloaded automatically when playback finishes or component unmounts
- Added `PlayButton` to lesson discover cards in `play.tsx` (below Arabic text)
- Added `PlayButton` to exercise Arabic prompt card in `play.tsx` (below Arabic text)
- Added `PlayButton` to each word card in `vocabulary.tsx` (next to Arabic text)
- App TypeScript check passed after all audio play button changes

## Recent Changes (since 2026-05-05)

- Replaced the earlier curriculum seed with the compiled 15-reader-lecture Warsh sequence
- Rewrote `arabai-backend/prisma/curriculum-phase15.cjs` as the canonical 15-chapter interactive curriculum
- Added `arabai-backend/prisma/validate-curriculum.cjs`
- Added backend script:
  - `npm run db:validate-seed`
- Extended mobile lesson playback to support Warsh interaction formats:
  - `MATCHING`
  - `GRAMMAR_PARSE`
  - `CONVERSATION_BUILDER`
- Kept existing practice formats:
  - `TRUE_FALSE`
  - `TAP_TRANSLATION`
  - `FILL_BLANK`
  - `BUILD_SENTENCE`
- Kept `FLASHCARD` behavior as part of lesson/discover flow
- Updated Ustadh Noor backend curriculum prompt from the old 5-chapter framing to the 15-chapter reader sequence
- Added the fourth bottom tab, `Vocabulary`, with a starter free vocabulary bank surface and local search
- Updated tab labels/order to match spec 01: `Learn | Vocabulary | Noor | You`
- Updated entry/onboarding brand presentation from Noor-facing copy to `Warsh / وَرْش`
- Switched Noor backend provider wiring to OpenAI-only and removed Anthropic config/dependency
- Renamed the backend AI helper from `lib/anthropic.ts` to `lib/openai.ts`
- Verified app and backend TypeScript checks after the spec 01 implementation slices
- Made `DEV_UNLOCK_ALL` development-only so production cannot accidentally ship with chapter locking bypassed
- Added a 10-second axios timeout and clearer login/register error messages for unreachable backend, timeout, and invalid credentials cases
- Corrected the register screen Arabic brand mark from Noor to Warsh and verified there are no remaining `نُور` app-brand marks
- Added `arabai-app/.env.example`, typed `EXPO_PUBLIC_ENVIRONMENT`, and updated developer setup docs to prefer USB reverse instead of machine-specific LAN IPs
- Verified backend auth endpoints locally: register, placement apply, wrong-password rejection, login, and `/api/auth/me`
- Rechecked configured Neon connectivity and verified the backend-side post-login data endpoints locally: `/api/chapters`, `/api/progress`, and `/api/chat/history`
- Reconnected/authorized the Android device through ADB
- Verified native Android app login through the app UI using a backend-created test account
- Verified native Android signup/account creation through the app UI using a fresh test account, including placement apply and Learn tab loading
- Verified native Android Noor tab loading after login, including a successful `/api/chat/history` backend call
- Added `expo-keep-awake` as a direct app dependency so Android autolinking includes the native keep-awake module
- Rebuilt/reinstalled the native Android app on the connected physical device and confirmed a fresh launch no longer logs the keep-awake warning
- Replaced placeholder app icon assets with polished Warsh parchment/gold brand assets, added a splash asset, and refreshed Android native launcher/splash resources
- Hardened production mobile configuration by removing the hardcoded API fallback, validating `EXPO_PUBLIC_API_URL`, pinning EAS preview/production env values, and deleting the stale generated bundle artifact
- Added OpenAI TTS backend plumbing and mobile local audio cache helpers for future vocabulary/lesson play buttons
- Earlier post-login backend failures from Prisma Neon reachability errors (`P1001/P1017`) were not reproduced in the latest backend-side check
- Ran seed validation, backend build, TypeScript check for the app lesson player, and database seed successfully
- Started physical Android device QA through ADB using a connected TECNO device
- Installed a fresh local debug APK on the device after deleting the old app
- Confirmed backend health locally and identified that direct phone-to-PC Wi-Fi access to port `3000` times out
- Configured ADB reverse for local device testing over USB
- Earlier Phase 1 work completed before the 15-chapter replacement:
  - first Expo Cloud APK build completed and downloaded for testing
  - chapter list API (`GET /api/chapters`) was enriched with completion/skip state and lesson counts
  - chapter lessons API (`GET /api/chapters/[id]/lessons`) was enriched and returns `403 chapter_locked` for locked chapters
  - `lib/course.ts` was refactored to derive chapter lock state from completed and skipped lessons
  - `CLAUDE.md` was updated with brand SOT path, env vars, error codes, lesson types, `DEV_UNLOCK_ALL`, and API endpoint reference

## What Was Fixed / Added So Far

- Prisma 7 configuration was aligned to use datasource configuration without the old duplicated schema URL field
- Backend env/example and local PostgreSQL workflow were set up for Prisma + Postgres development
- Expo Router entry configuration was fixed
- Expo Go compatibility issues were resolved by replacing MMKV with AsyncStorage
- JWT login/register flow was completed
- Register flow was extended to include name and onboarding-linked setup
- Phase 1.5 curriculum seed replaced the shallow starter curriculum
- Corrupted Arabic seed text was replaced with valid strings
- App icon, adaptive icon, and splash assets now use the polished Warsh parchment/gold brand treatment
- Local tutor fallback was added so chat can still respond without external AI keys
- Locked chapter/lesson rules were moved into backend enforcement
- Screens refresh on focus to keep chapter/progress/chat/profile state fresh after navigation
- PKT streak logic was fixed
- Arabic typography support was added
- Noor brand styling was rolled out through the app
- Warsh identity copy was corrected on the app entry and onboarding welcome screens
- Warsh identity copy was corrected on the register screen
- Vocabulary starter tab was added
- Noor provider wiring was aligned to OpenAI `gpt-4o-mini`
- `DEV_UNLOCK_ALL` was guarded so it cannot bypass locking in production
- API timeout and auth/network error messaging were added to reduce hanging login/signup states
- Mobile local networking setup was documented through `arabai-app/.env.example` and updated developer guidance
- Mobile production API configuration now fails closed instead of silently falling back to a legacy backend URL
- OpenAI TTS and local MP3 caching plumbing was added for vocabulary words and lesson text
- Invalid tab exposure from lesson routes was removed
- Missing scaffold-level screens were replaced with implemented screens
- Placement and smart skip were added
- Auth session payloads were expanded with learner metadata
- Placement metadata was added to auth payloads and `/api/auth/me`
- Placement migration was added:
  - `20260429120000_placement_smart_skip`
- Prisma seed script is configured to use:
  - `node prisma/seed.cjs`
- Warsh curriculum validation script is configured to use:
  - `node prisma/validate-curriculum.cjs`

## Product Assessment

- The app is no longer at a scaffold-only stage
- Core app wiring for Phase 1 is implemented across mobile + backend
- The major curriculum quantity gap has been addressed by replacing the starter seed with 15 Warsh reader chapters
- The main current risk is runtime QA, especially auth on a physical device and playback of the new exercise formats

Current product concern:
- the Warsh flow system is implemented in the seed and lesson player, but it has not yet had enough manual mobile QA
- generated lesson content should still be reviewed for pedagogy, ayah relevance, repetition quality, and learner pacing
- progression and placement behavior still need device-level verification after the new seed

## Remaining Work

### Content authoring (highest priority)
1. ✅ Chapter 2 authored — 4 lessons (tanween / ال / adjectives / أَيْنَ) seeded (2026-05-24)
2. ✅ Chapter 3 authored — 4 lessons (الإضافة, لِمَنْ, يَا, Basmalah) seeded (2026-05-24); lesson-loading bug fixed (2026-05-24)
3. Author Chapter 4: Adjectives and Gender Agreement (الصِّفَة والموصوف — رَجُلٌ كَرِيمٌ, الصِّرَاطَ الْمُسْتَقِيمَ) — 4–5 lessons
4. Author Chapter 5: Feminine Demonstratives + First Verb (هٰذِهِ، تِلْكَ، ذَهَبَ) — 4–5 lessons
5. Insert SP1 SPOKEN_PHRASES lesson after Ch3 (basic greetings — per spec-05 Part C)
6. Insert R1 REVIEW lesson after Ch5 (mid-Book 1 milestone per spec-05 Part B)
7. Continue through Chapters 6–72 following the chapter mapping in `warsh-spec-05`

### Lesson player (engineering)
6. Update the lesson player (`play.tsx`) to read the new content schema directly (currently using the API transformer as an adapter — acceptable for now but should be replaced)
7. Wire `explanation_on_wrong` from exercises into the feedback bar (currently shows generic feedback)
8. Support multiple `highlighted_word_indices` in the Reveal beat (transformer only uses index 0)

### Infrastructure
9. Configure `OPENAI_API_KEY` in backend `.env` for real AI + TTS
10. Configure `EXPO_PUBLIC_MIXPANEL_TOKEN` and `EXPO_PUBLIC_SENTRY_DSN` in EAS secrets before beta
11. Set `ADMIN_DASHBOARD_TOKEN` before using dashboard writes outside local development
12. Update `validate-curriculum.cjs` to validate fixture-based lessons (currently validates old .cjs curriculum files)

### QA still needed
13. Full lesson player QA on device for all 4 Ch1 lessons (5-beat flow, all exercise types)
14. Verify REVIEW template (xp_value: 5) XP display in lesson player close screen
15. Verify chapter completion logic with new schema (Ch1 completes when all 4 lessons done)

## Current Source-Of-Truth Summary

As of 2026-05-22:
- the codebase implements the full Phase 1 app loop
- the native Android app is installed and launching on the authorized physical device
- onboarding, auth, placement, progression, lesson play, chat, and profile flows exist in code
- **lesson content schema has been migrated to warsh-content-schema v1.0** — single `content Json` blob, `LessonTemplate` enum, API transformer in place
- **Chapter 1 is fully authored** — 4 lessons (3 STANDARD + 1 REVIEW) in `arabai-backend/prisma/fixtures/`, seeded and verified on-device
- the SOT is `Docs/warsh-spec-00-master-index.md` + spec-01 through spec-13; `CLAUDE.md` updated to reflect this
- 72 chapters seeded with metadata; Chapters 2–72 have 0 lessons (content authoring in progress)
- backend enforces locked progression and placement skipping; `DEV_UNLOCK_ALL=true` in local `.env` for development
- backend TypeScript check passes with 0 errors after the schema migration
- bottom tab shell matches spec: `Learn | Vocabulary | Noor | You`
- Noor backend wiring is OpenAI-only with `gpt-4o-mini` as the default model
- mobile local networking: USB reverse (`tcp:8081`, `tcp:3000`) + `http://127.0.0.1:3000` is the reliable path
- the biggest immediate gap is **content depth** — only Chapter 1 has authored lessons; authoring Chapters 2–72 is the primary workstream
