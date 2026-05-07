# Noor — Tech Stack

## Repo Structure
Monorepo at `D:\Code\ArabAI` with two Node projects:

```
ArabAI/
  arabai-backend/   Next.js 14 API + Prisma + PostgreSQL
  arabai-app/       React Native + Expo SDK 51 (Android-only)
  specs/            Product specs (this folder)
  arabai-brand.md   Visual/design source of truth
  arabai-phase1-sot-v2.md  Phase 1 product specification
```

---

## Backend (`arabai-backend/`)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14.2 | API Routes only — no pages, no SSR |
| ORM | Prisma 7.8 | `@prisma/adapter-pg` direct PG pooling, no Data Proxy |
| Database | PostgreSQL 16 | Docker locally on port 5432 |
| Auth | JWT (`jsonwebtoken`) | 7-day expiry; `lib/auth.ts` handles sign/verify/extract |
| Passwords | `bcryptjs` | |
| Validation | Zod 3.23 | |
| AI | `@anthropic-ai/sdk` 0.55 + `openai` 4.70 | Provider routing in `lib/anthropic.ts`; falls back to local tutor when keys absent or provider throws |
| Runtime | Node.js via Next.js | |

### API Response Envelope
- **Success:** `{ "data": { ... } }` — 200/201
- **Error:** `{ "error": "Human message", "code": "snake_case_code" }` — 4xx/5xx
- Error codes in use: `bad_request`, `unauthorized`, `conflict`, `too_many_requests`

### Key Backend Files
```
lib/auth.ts          JWT sign/verify/getUserIdFromRequest
lib/prisma.ts        Singleton PrismaClient (always import from here)
lib/anthropic.ts     AI provider routing + local fallback
lib/date.ts          getPKTStartOfDay() — streak calcs in Pakistan Time (UTC+5)
```

### API Routes
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/refresh         (stub — not implemented)

GET  /api/chapters
GET  /api/chapters/[id]/lessons
GET  /api/lessons/[id]
POST /api/lessons/[id]/complete

POST /api/placement/apply

GET  /api/progress
GET  /api/streak
POST /api/streak/sync

GET  /api/chat/history
POST /api/chat              (5 messages/day limit, enforced by counting ChatMessage rows)

GET  /api/health
```

---

## Mobile App (`arabai-app/`)

| Layer | Choice | Notes |
|---|---|---|
| Framework | React Native 0.74.5 | |
| Platform | Expo SDK 51 | Android-only currently |
| Navigation | Expo Router 3.5 (file-based) | |
| State | Zustand 4.5 | `stores/authStore.ts` — user + token |
| Persistence | Zustand persist + `@react-native-async-storage/async-storage` | NOT MMKV |
| HTTP | Axios 1.7 | `services/api.ts` auto-injects `Authorization: Bearer <token>` |
| Icons | `@expo/vector-icons` 14 | |
| Fonts | `expo-font` — Scheherazade New (Arabic) | Latin fonts pending |

### Navigation Structure
```
app/index.tsx                   Branded landing screen
app/(auth)/login.tsx
app/(auth)/register.tsx
app/(auth)/onboarding/welcome.tsx
app/(auth)/onboarding/name.tsx
app/(auth)/onboarding/goal.tsx
app/(auth)/onboarding/language.tsx
app/(auth)/onboarding/level.tsx
app/(auth)/onboarding/placement.tsx
app/(auth)/onboarding/ready.tsx
app/(app)/_layout.tsx           Stack wrapper
app/(app)/(tabs)/_layout.tsx    Bottom tabs
app/(app)/(tabs)/index.tsx      Learn tab — chapter list
app/(app)/(tabs)/chat.tsx       Noor tab — AI chat
app/(app)/(tabs)/profile.tsx    You tab — XP/streak/logout
app/(app)/lessons/[chapterId].tsx   Lesson list for a chapter
app/(app)/lessons/[lessonId]/play.tsx   Active lesson player
```

### Key Mobile Files
```
constants/theme.ts          Design tokens (WarshPalette, Colors, Fonts, FontSizes, Spacing, Radii, Shadows, Animation)
app/components/ArabicText.tsx   ALWAYS use this for Arabic strings (RTL, Scheherazade New, size variants: sm|md|lg|xl)
app/components/BrandButton.tsx  Branded CTA (variant: default|danger)
stores/authStore.ts         Zustand auth state
services/api.ts             Axios instance with JWT interceptor
app/hooks/useAuth.ts        logout helper
```

### Path Aliases (mobile only)
`@app/*`, `@components/*`, `@services/*`, `@stores/*`, `@types/*` — configured in `tsconfig.json`.

---

## Database Schema

### Models
- **User** — email, passwordHash, name, nativeLanguage, goal (QURAN|TRAVEL|STUDY|GENERAL), level (BEGINNER|ELEMENTARY|INTERMEDIATE), xp, gems, startingChapterOrder, placementType
- **Streak** — 1:1 with User; currentStreak, longestStreak, lastActiveDate, streakFreezes; PKT timezone-aware
- **Chapter** — order, title, titleAr, description, worldMapX/Y, isLocked
- **Lesson** — chapterId, order, title, titleAr, type (FLASHCARD|FILL_BLANK|MULTIPLE_CHOICE|MATCHING|LISTENING|VOCABULARY), xpReward, content (JSON), hook (JSON), discoverCards (JSON), exercises (JSON), revealText, revealAyah (JSON), fatihaProgressDelta
- **Progress** — unique on (userId, lessonId); status, score, attempts, xpEarned; use upsert when recording completions
- **ChatMessage** — userId, role (USER|ASSISTANT), content, tokens
- **Achievement** — key, title, description, icon, xpReward
- **UserAchievement** — unique on (userId, achievementId)

### Lesson Content Shape (VOCABULARY type)
```json
{
  "hook": { "ayahAr": "...", "ayahRef": "...", "question": "..." },
  "discoverCards": [{ "arabicText": "...", "translation": "...", "transliteration": "..." }],
  "exercises": [{ "type": "TRUE_FALSE|TAP_TRANSLATION|FILL_BLANK|BUILD_SENTENCE", "prompt": "...", "arabicText": "...", "options": [...], "correctAnswer": "..." }],
  "revealText": "...",
  "revealAyah": { "ayahAr": "...", "ayahRef": "...", "highlightedWord": "..." }
}
```

---

## Design Tokens (Warsh Palette)

| Token | Hex | Usage |
|---|---|---|
| ink | `#0F1117` | Primary text, dark backgrounds |
| deep | `#1A1F30` | Secondary dark bg |
| gold | `#9A8F6A` | Accents, Arabic highlights |
| parchment | `#D4C99A` | Muted gold |
| cream | `#E8E0CC` | Borders, surface |
| creamBg | `#F5F2EA` | Primary background |
| parchmentBg | `#EDE8D8` | Card background |
| sage | `#3A5030` | Success, streak, teal accent |

---

## Local Dev Setup

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Backend
cd arabai-backend
cp .env.example .env   # fill DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev            # port 3000

# 3. Mobile
cd arabai-app
npm install
# Set EXPO_PUBLIC_API_URL in .env:
#   Physical phone: http://192.168.x.x:3000
#   Android emulator: http://10.0.2.2:3000
npm start
```

---

## Not Yet Integrated
- Upstash Redis rate limiting
- Token refresh (`/api/auth/refresh` is a stub)
- Real splash/brand assets (still placeholder)
- iOS build
