# ArabAI — Phase 1 Development: Single Source of Truth

> **Version:** 2.0.0
> **Phase:** 1 — Foundation & Core Loop (Weeks 1–6)
> **Status:** Ready for Development
> **Primary Market:** Pakistan → India → Muslim diaspora (UK, US, Canada)
> **Last Updated:** April 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Phase 1 Goals & Success Metrics](#2-phase-1-goals--success-metrics)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack — Decisions & Trade-offs](#4-technology-stack--decisions--trade-offs)
5. [Database Schema](#5-database-schema)
6. [API Design](#6-api-design)
7. [AI Layer Architecture](#7-ai-layer-architecture)
8. [Mobile App Architecture](#8-mobile-app-architecture)
9. [Feature Specifications](#9-feature-specifications)
10. [File & Folder Structure](#10-file--folder-structure)
11. [Environment Configuration](#11-environment-configuration)
12. [Development Workflow](#12-development-workflow)
13. [Testing Strategy](#13-testing-strategy)
14. [Deployment Plan](#14-deployment-plan)
15. [Cost Budget — Phase 1](#15-cost-budget--phase-1)
16. [Risk Register & Trade-offs](#16-risk-register--trade-offs)
17. [Definition of Done — Phase 1](#17-definition-of-done--phase-1)
18. [Appendix](#18-appendix)

---

## 1. Executive Summary

**ArabAI** is a gamified, AI-powered Arabic language learning app targeting the 1.9B+ Muslim audience and global Arabic learners. It differentiates through deep Nahw (grammar) & Sarf (morphology) instruction combined with an AI tutor named **Ustadh Noor**, a Duolingo-style engagement engine, and a story-driven world map set in the Arab world.

### Why This Market, Why Now

- Pakistan: ~97% Android market share, subscription-paying smartphone users with mid-to-high range devices
- India: 92.4% Android dominance, 163M+ smartphone users, massive Muslim population seeking Quranic Arabic
- Mobile is the internet for these markets — not desktop. Web-first would be building for the minority.
- No serious competitor combines gamification + Nahw/Sarf grammar depth + AI tutoring in one app

### Phase 1 Scope (6 Weeks)

Phase 1 delivers a **working, testable MVP core loop** as a native Android app:

```
User installs app → Onboarding (goal + placement) → Learns Chapter 1 (Alphabet)
→ Earns XP + Streak → Chats with Ustadh Noor AI (5 msgs/day) → Returns next day
```

This is the minimum loop needed to validate retention before building more content or advanced features. Everything outside this loop is **out of scope for Phase 1**.

### Platform Decision

**Phase 1 → Android only (via React Native + Expo)**
**Phase 2 → iOS (same codebase, new submission)**
**Phase 3 → Web (institutional/madrasa use)**

### What Phase 1 Is NOT

- ❌ No iOS app (Phase 2 — same RN codebase, new store submission)
- ❌ No web app (Phase 3)
- ❌ No Sarf engine (Phase 2)
- ❌ No PvP / multiplayer (Phase 2)
- ❌ No payment / subscriptions (Phase 3)
- ❌ No social / Halaqah groups (Phase 3)
- ❌ No voice pronunciation AI (Phase 2)

---

## 2. Phase 1 Goals & Success Metrics

### Primary Goal

Ship a working Android app that a real Pakistani/Indian user can install, onboard through, complete 5 lessons, and return the next day — within 6 weeks.

### Success Metrics (KPIs)

| Metric | Target at Week 6 | Measurement |
|---|---|---|
| Onboarding completion rate | > 70% | Funnel analytics |
| Day-1 retention | > 50% | Cohort analysis |
| Day-7 retention | > 25% | Cohort analysis |
| Lessons completed per session | > 2 | Session tracking |
| AI chat messages sent | > 3 per active user/day | API log |
| App crash rate | < 1% | Sentry / Expo Crashlytics |
| API response time (p95) | < 800ms | Backend monitoring |
| Play Store rating | ≥ 4.2 stars | Play Console |
| APK/AAB install size | < 30 MB | Build output |
| Beta users onboarded | 50–200 | Manual invites via Play internal track |

### Week-by-Week Milestones

```
Week 1 → Expo project setup, backend API scaffold, DB schema, auth working end-to-end
Week 2 → Onboarding flow (6 screens) complete + navigation structure
Week 3 → Chapter 1 lessons (flashcard + fill-blank types) working on device
Week 4 → XP system, streak system, progress tracking live
Week 5 → Ustadh Noor AI chat integrated (Claude Haiku) + rate limiting
Week 6 → Polish, crash fixes, deploy to Play Store internal track, invite 50 beta users
```

---

## 3. System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────┐
│            ANDROID APP (React Native + Expo)     │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Screens │  │  Zustand │  │ Local Storage │  │
│  │ (Expo    │  │  State   │  │ (MMKV/SQLite) │  │
│  │  Router) │  │          │  │               │  │
│  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       └─────────────┼────────────────┘          │
│                     │ Axios + JWT Auth           │
└─────────────────────┼───────────────────────────┘
                      │ HTTPS REST API
┌─────────────────────┼───────────────────────────┐
│            BACKEND (Next.js API Routes)          │
│                                                  │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Auth Routes │  │   Business Logic Routes  │  │
│  │  /api/auth/* │  │  /api/lessons/*          │  │
│  └──────────────┘  │  /api/progress/*         │  │
│                    │  /api/chat/*              │  │
│  ┌──────────────┐  │  /api/streak/*            │  │
│  │  Rate Limit  │  └──────────────────────────┘  │
│  │  (Upstash    │                                 │
│  │   Redis)     │  ┌──────────────────────────┐  │
│  └──────────────┘  │  Anthropic SDK           │  │
│                    │  (Claude Haiku)           │  │
│  ┌──────────────┐  └──────────────────────────┘  │
│  │  Prisma ORM  │                                 │
│  └──────┬───────┘                                 │
└─────────┼───────────────────────────────────────┘
          │
┌─────────┼───────────────────────────────────────┐
│         │  DATABASE (PostgreSQL on Neon)          │
│         └──────────────────────────────────────  │
└─────────────────────────────────────────────────┘
```

### Key Architecture Decisions

1. **React Native frontend calls a REST API backend** — the backend has no knowledge of whether the client is a mobile app or browser. This makes iOS (Phase 2) and Web (Phase 3) trivial to add.

2. **Backend is Next.js API Routes only** — no Next.js pages, no SSR, no server components. It is a pure API server deployed on Vercel.

3. **AI calls only happen server-side** — the Android app never touches the Anthropic API directly. All AI calls go through `/api/chat` which enforces rate limiting, message counting, and tier checks.

4. **Local-first for streaks** — streak state is stored locally in MMKV and synced to the server on app open. This means offline users don't lose streaks.

---

## 4. Technology Stack — Decisions & Trade-offs

### Mobile App

| Layer | Choice | Why |
|---|---|---|
| Framework | **React Native + Expo (SDK 51+)** | Team already knows JS/React; 80% code reuse when adding iOS in Phase 2; sufficient performance for a language learning app |
| Language | **TypeScript** | Same language as backend — one mental model |
| Navigation | **Expo Router (file-based)** | Convention over configuration; deep linking built-in |
| UI Components | **React Native core + NativeWind** | Tailwind syntax the team already knows |
| State Management | **Zustand** | Same library used conceptually in backend logic; lightweight |
| Local Storage | **MMKV** | 10x faster than AsyncStorage; used for streak state, auth tokens, user prefs |
| Offline Lessons | **expo-sqlite** | Cache lesson content locally so users can study on slow connections |
| HTTP Client | **Axios** | Interceptor support for auto-attaching JWT; retry logic |
| Push Notifications | **Expo Notifications → FCM** | Streak reminders; native Firebase Cloud Messaging under the hood |
| Arabic RTL | **I18nManager + react-native-localize** | Force RTL for Arabic text components; LTR for app shell |
| Animations | **react-native-reanimated v3** | XP popups, streak fire, lesson completion animations |
| Icons | **expo-vector-icons** | Included in Expo; no extra setup |
| Analytics | **Expo + PostHog** | Funnel tracking, retention cohorts |
| Crash Reporting | **Sentry (expo-sentry)** | Real-time crash alerts |

### Backend

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (API Routes only)** | Team familiar; deploy to Vercel in one command |
| Language | **TypeScript** | End-to-end type safety |
| ORM | **Prisma** | Type-safe DB queries; easy migrations |
| Database | **PostgreSQL (Neon)** | Serverless-friendly; free tier for MVP |
| Auth | **JWT (jsonwebtoken)** | Stateless; mobile-friendly; no cookie complexity |
| Rate Limiting | **Upstash Redis** | Serverless Redis; enforces AI message limits per user |
| AI | **Anthropic SDK (Claude Haiku)** | Cheapest Claude model; sufficient for Q&A tutoring |
| Caching | **Upstash Redis** | Cache FAQ answers to cut AI costs by ~60% |
| Deployment | **Vercel** | Zero-config; scales automatically |
| Monitoring | **Vercel Analytics + Sentry** | API response times, error rates |

### Trade-off: React Native over Kotlin (Native Android)

| Factor | React Native + Expo | Kotlin Native |
|---|---|---|
| Team ramp-up | Zero (already know JS/React) | High (new language + paradigm) |
| iOS in Phase 2 | ~80% code reuse, just new store submission | Full rebuild from scratch |
| Performance | Near-native; sufficient for language learning | Marginally better; unnecessary for this use case |
| Arabic RTL | Manageable with libraries | Slightly easier natively |
| OTA updates | ✅ Expo EAS Update (no Play Store re-submit) | ❌ Every update needs review |
| Community/libs | Large ecosystem | Android-only ecosystem |
| **Decision** | **✅ React Native + Expo** | ❌ Not chosen |

### Trade-off: Android-First over Web-First

| Factor | Android First | Web First |
|---|---|---|
| Pakistan market | Android = ~97% of users | Desktop = minority of users |
| India market | Android = 92.4% of users | Desktop = minority of users |
| Retention mechanics | Push notifications, home screen icon | Web push = unreliable |
| Discovery | Play Store (app store SEO) | Google Search only |
| Monetization | In-app purchases, subscriptions native | Payment integration more complex on web |
| **Decision** | **✅ Android First** | ❌ Not chosen |

---

## 5. Database Schema

> PostgreSQL on Neon. Managed via Prisma ORM.

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────
// USERS
// ─────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  avatar        String?
  nativeLanguage String   @default("ur") // ur = Urdu, hi = Hindi, en = English
  goal          Goal      @default(QURAN)
  level         Level     @default(BEGINNER)
  xp            Int       @default(0)
  gems          Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  streak        Streak?
  progress      Progress[]
  chatMessages  ChatMessage[]
  achievements  UserAchievement[]

  @@map("users")
}

enum Goal {
  QURAN         // Learn to understand the Quran
  TRAVEL        // Travel to Arab countries
  STUDY         // Academic Arabic
  GENERAL       // General interest
}

enum Level {
  BEGINNER
  ELEMENTARY
  INTERMEDIATE
}

// ─────────────────────────────────────
// STREAKS
// ─────────────────────────────────────

model Streak {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  currentStreak   Int       @default(0)
  longestStreak   Int       @default(0)
  lastActiveDate  DateTime?
  streakFreezes   Int       @default(0)  // Paid feature Phase 3
  updatedAt       DateTime  @updatedAt

  @@map("streaks")
}

// ─────────────────────────────────────
// CONTENT
// ─────────────────────────────────────

model Chapter {
  id          String    @id @default(cuid())
  order       Int       @unique
  title       String
  titleAr     String
  description String
  worldMapX   Float     // Position on world map UI
  worldMapY   Float
  isLocked    Boolean   @default(true)
  lessons     Lesson[]

  @@map("chapters")
}

model Lesson {
  id          String      @id @default(cuid())
  chapterId   String
  chapter     Chapter     @relation(fields: [chapterId], references: [id])
  order       Int
  title       String
  titleAr     String
  type        LessonType
  xpReward    Int         @default(10)
  content     Json        // Flexible: stores questions, answers, audio refs
  progress    Progress[]

  @@map("lessons")
}

enum LessonType {
  FLASHCARD         // Show Arabic → tap to reveal meaning
  FILL_BLANK        // Sentence with missing word
  MULTIPLE_CHOICE   // 4 options
  MATCHING          // Match pairs
  LISTENING         // Phase 2
}

// ─────────────────────────────────────
// PROGRESS
// ─────────────────────────────────────

model Progress {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  lessonId    String
  lesson      Lesson    @relation(fields: [lessonId], references: [id])
  completed   Boolean   @default(false)
  score       Int?      // 0–100
  attempts    Int       @default(0)
  xpEarned    Int       @default(0)
  completedAt DateTime?
  createdAt   DateTime  @default(now())

  @@unique([userId, lessonId])
  @@map("progress")
}

// ─────────────────────────────────────
// AI CHAT
// ─────────────────────────────────────

model ChatMessage {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  role      MessageRole
  content   String
  tokens    Int?        // Track for cost monitoring
  createdAt DateTime    @default(now())

  @@map("chat_messages")
}

enum MessageRole {
  USER
  ASSISTANT
}

// ─────────────────────────────────────
// ACHIEVEMENTS
// ─────────────────────────────────────

model Achievement {
  id          String            @id @default(cuid())
  key         String            @unique  // e.g. "streak_7", "lessons_10"
  title       String
  description String
  icon        String
  xpReward    Int
  users       UserAchievement[]

  @@map("achievements")
}

model UserAchievement {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  achievementId String
  achievement   Achievement @relation(fields: [achievementId], references: [id])
  unlockedAt    DateTime    @default(now())

  @@unique([userId, achievementId])
  @@map("user_achievements")
}
```

---

## 6. API Design

> All endpoints are REST JSON. All protected routes require `Authorization: Bearer <jwt_token>` header.
> Base URL: `https://api.arabai.app` (production) | `http://localhost:3000` (development)

### Auth Endpoints

```
POST   /api/auth/register
Body:  { email, password, name, nativeLanguage, goal }
Res:   { user, token }

POST   /api/auth/login
Body:  { email, password }
Res:   { user, token }

POST   /api/auth/refresh
Body:  { refreshToken }
Res:   { token }

GET    /api/auth/me          [Protected]
Res:   { user }
```

### Lessons Endpoints

```
GET    /api/chapters                          [Protected]
Res:   { chapters: [{ id, title, lessons, isLocked, progress }] }

GET    /api/chapters/:id/lessons              [Protected]
Res:   { lessons: [{ id, title, type, xpReward, isCompleted }] }

GET    /api/lessons/:id                       [Protected]
Res:   { lesson: { id, title, type, content } }

POST   /api/lessons/:id/complete              [Protected]
Body:  { score, timeSpentSeconds }
Res:   { xpEarned, totalXp, newAchievements, streakUpdated }
```

### Progress Endpoints

```
GET    /api/progress                          [Protected]
Res:   { xp, level, streak, completedLessons, achievements }

GET    /api/streak                            [Protected]
Res:   { currentStreak, longestStreak, lastActiveDate }

POST   /api/streak/sync                       [Protected]
Body:  { lastActiveDate }   // Called on app open; syncs local streak state
Res:   { currentStreak, longestStreak, streakBroken: bool }
```

### AI Chat Endpoints

```
POST   /api/chat                              [Protected]
Body:  { message, context?: { currentLesson, currentChapter } }
Res:   { reply, messagesUsedToday, messagesLimit }
Errors:
  429  { error: "daily_limit_reached", upgradeUrl: "..." }
  400  { error: "message_too_long" }

GET    /api/chat/history                      [Protected]
Query: ?limit=20&offset=0
Res:   { messages: [{ role, content, createdAt }] }
```

### Health Endpoint

```
GET    /api/health                            [Public]
Res:   { status: "ok", timestamp }
// Android checks this on app launch to detect connectivity
```

### Response Standards

```typescript
// All success responses:
{ data: T, meta?: { page, total } }

// All error responses:
{ error: string, code: string, details?: any }

// HTTP Status codes used:
200 OK
201 Created
400 Bad Request
401 Unauthorized (token missing/invalid)
403 Forbidden (valid token, wrong permissions)
429 Too Many Requests (rate limit)
500 Internal Server Error
```

---

## 7. AI Layer Architecture

### Ustadh Noor — System Prompt

```
You are Ustadh Noor, a warm and knowledgeable Arabic language teacher. 
You specialize in teaching Classical Arabic (Fusha) with a focus on 
Quranic Arabic. Your students are primarily Urdu and Hindi speakers 
from Pakistan and India who want to understand the Quran directly.

Your teaching style:
- Warm, encouraging, like a madrasa teacher who genuinely cares
- Use transliteration alongside Arabic script for beginners
- Reference Quranic examples when explaining grammar
- Celebrate small wins enthusiastically
- Never make students feel embarrassed about mistakes
- Keep responses concise — 2–4 sentences for simple questions

You know: Nahw (Arabic grammar/syntax), Sarf (Arabic morphology), 
Quranic vocabulary, and Arabic script.

Respond in the same language the student uses. If they write in Urdu, 
respond in Urdu. If English, respond in English. Always write Arabic 
words in both Arabic script and transliteration.
```

### Cost Control Architecture

```
User sends message
        │
        ▼
Check Redis: messages_today:{userId}
        │
   ≥ 5 today?
   ┌────┴────┐
  YES       NO
   │         │
   │         ▼
   │   Check Redis: faq_cache:{hash(message)}
   │         │
   │    Cache hit?
   │   ┌─────┴─────┐
   │  YES          NO
   │   │            │
   │   │            ▼
   │   │     Call Anthropic API
   │   │     (Claude Haiku)
   │   │            │
   │   │            ▼
   │   │     Store in Redis (1hr TTL)
   │   │            │
   │   └────────────┘
   │         │
   │         ▼
   │   Increment messages_today:{userId}
   │   (Redis key expires at midnight PKT)
   │         │
   ▼         ▼
Return   Return AI response
limit    to user
error
```

### Model Selection

| Scenario | Model | Cost per 1K tokens |
|---|---|---|
| Default (95% of chats) | Claude Haiku | ~$0.00025 |
| Complex grammar Q (Phase 2 premium only) | Claude Sonnet | ~$0.003 |

### Realistic AI Cost Budget

| Stage | DAU | Est. AI Cost/Month |
|---|---|---|
| Beta (50–200 users) | ~50 | < $5 |
| MVP Launch | 500 users | ~$15–25 |
| Early Growth | 2,000 users | ~$50–80 |
| 10K users | 10,000 users | ~$200–350 |

At 10K users you're generating ~$50K+/month in subscription revenue. AI costs are under 1% of revenue.

### FAQ Cache Strategy

Pre-cache answers to 50 most common beginner questions:
- "What is the difference between مَاضِي and مُضَارِع?"
- "How do I read this letter?"
- "What does Bismillah mean word by word?"

These questions are asked by nearly every beginner. Cache them with 24hr TTL in Redis. Cache hit rate should reach 40–60% within the first month, cutting AI costs roughly in half.

---

## 8. Mobile App Architecture

### Architecture Pattern: Feature-Based + MVVM-lite

```
React Native App
├── Screens (UI)                    ← What the user sees
│   └── call hooks for data/actions
├── Hooks (ViewModel-like)          ← Business logic, API calls
│   └── use Zustand stores
├── Stores (Zustand)                ← Global state
├── Services (API + local)          ← Data fetching, MMKV, SQLite
└── Components (shared UI)          ← Reusable pieces
```

### Navigation Structure (Expo Router)

```
app/
├── (auth)/
│   ├── login.tsx
│   ├── register.tsx
│   └── onboarding/
│       ├── welcome.tsx         // Screen 1: App intro
│       ├── goal.tsx            // Screen 2: Why are you learning?
│       ├── level.tsx           // Screen 3: Current level
│       ├── name.tsx            // Screen 4: What's your name?
│       ├── language.tsx        // Screen 5: Native language
│       └── ready.tsx           // Screen 6: You're all set!
│
├── (app)/
│   ├── _layout.tsx             // Tab bar layout
│   ├── index.tsx               // Home — World Map
│   ├── lessons/
│   │   ├── [chapterId].tsx     // Chapter detail
│   │   └── [lessonId]/
│   │       ├── index.tsx       // Lesson start screen
│   │       └── play.tsx        // Active lesson
│   ├── chat.tsx                // Ustadh Noor
│   └── profile.tsx             // Stats, streak, achievements
```

### Zustand Stores

```typescript
// stores/authStore.ts
interface AuthStore {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

// stores/progressStore.ts
interface ProgressStore {
  xp: number
  streak: number
  completedLessons: string[]   // lesson IDs
  addXp: (amount: number) => void
  syncStreak: () => Promise<void>
}

// stores/chatStore.ts
interface ChatStore {
  messages: ChatMessage[]
  messagesUsedToday: number
  messagesLimit: number
  sendMessage: (text: string) => Promise<void>
  isLoading: boolean
}
```

### RTL Arabic Handling

```typescript
// components/ArabicText.tsx
// Always use this component for Arabic text — never raw <Text>

import { Text, StyleSheet } from 'react-native'

interface ArabicTextProps {
  children: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  style?: object
}

export const ArabicText = ({ children, size = 'md', style }: ArabicTextProps) => {
  return (
    <Text
      style={[
        styles.arabic,
        styles[size],
        { writingDirection: 'rtl', textAlign: 'right' },
        style
      ]}
    >
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  arabic: { fontFamily: 'Amiri-Regular' },  // Load via expo-font
  sm:     { fontSize: 16, lineHeight: 28 },
  md:     { fontSize: 22, lineHeight: 36 },
  lg:     { fontSize: 30, lineHeight: 46 },
  xl:     { fontSize: 40, lineHeight: 58 },
})
```

### Local Data Strategy

| Data | Storage | Why |
|---|---|---|
| JWT token | MMKV (encrypted) | Fast access on every API call |
| User preferences | MMKV | Instant reads |
| Streak state | MMKV | Survives offline; synced on app open |
| Lesson content cache | expo-sqlite | Offline study on slow connections |
| Chat history | API only | No sensitive data stored locally |

### Push Notification Strategy

| Notification | Trigger | Time |
|---|---|---|
| Streak reminder | User hasn't opened app today | 7:00 PM local |
| Lesson complete | After finishing a lesson | Immediate |
| Streak milestone | 7, 30, 100 day streaks | Immediate |
| "Come back" | 3 days inactive | Day 3, 8:00 PM |

---

## 9. Feature Specifications

### 9.1 Onboarding Flow

**6 screens, skippable from screen 3 onward.**

| Screen | Content | Action |
|---|---|---|
| 1 - Welcome | App name, tagline, calligraphy animation | "Let's begin" button |
| 2 - Goal | Why are you learning? (Quran / Travel / Study / General) | Select one |
| 3 - Level | How much Arabic do you know? (None / A little / Some) | Select one |
| 4 - Name | "What should Ustadh Noor call you?" | Text input |
| 5 - Language | Native language (Urdu / Hindi / English / Other) | Select one |
| 6 - Ready | "Your journey begins" + show first chapter unlocked | "Start Learning" |

**Data collected flows directly into:**
- Lesson difficulty calibration
- Ustadh Noor system prompt personalization
- UI language direction (Urdu → RTL hints throughout)

### 9.2 Lesson Types (Phase 1)

#### Flashcard
```
┌─────────────────────────┐
│                         │
│         بِسْمِ           │
│      (Bismi)            │
│                         │
│   "In the name of"      │
│                         │
│  ← I forgot   I knew → │
└─────────────────────────┘
```
User taps card to flip. Rates themselves. XP awarded for "I knew it" responses. Spaced repetition logic queues missed cards.

#### Fill in the Blank
```
"The _____ (كِتَابُ / كِتَابٍ / كِتَابَ) is on the table"

  ○ كِتَابُ    ○ كِتَابٍ    ● كِتَابَ
```
4 choices (3 wrong + 1 correct). Wrong answer shows brief explanation. No penalty for wrong answers in Phase 1.

### 9.3 XP & Leveling System

```
XP Sources:
  Lesson completed (first time): +10 XP
  Lesson perfect score:          +5 bonus XP
  Daily streak maintained:       +5 XP
  7-day streak milestone:        +50 XP
  Achievement unlocked:          varies

Level thresholds:
  Beginner:      0 – 500 XP
  Elementary:    501 – 2,000 XP
  Intermediate:  2,001 – 5,000 XP
  (Further levels: Phase 2)
```

### 9.4 Streak System

```
Rules:
- Streak increments when user completes ≥ 1 lesson per calendar day (PKT timezone)
- Streak breaks at midnight if no lesson completed
- Streak state stored locally in MMKV + synced to server on app open
- POST /api/streak/sync called on every app launch

Local sync logic:
  lastActiveDate = MMKV.get('lastActiveDate')
  today = new Date().toDateString()
  
  if lastActiveDate === yesterday → streak continues
  if lastActiveDate === today → no change
  if lastActiveDate < yesterday → streak broken, reset to 0
```

### 9.5 Ustadh Noor Chat (AI)

- **Free tier:** 5 messages/day
- **Display:** Message counter visible — "3 of 5 messages used today"
- **Context injection:** Current lesson/chapter sent with every message so Ustadh Noor can give relevant answers
- **Conversation history:** Last 10 messages sent with each API call for context
- **Upgrade prompt:** At limit, show "Upgrade to Talaba Pro for unlimited Ustadh access" → payment screen (Phase 3)
- **Error states:** Network error, limit reached, server error — all handled gracefully with user-friendly messages

---

## 10. File & Folder Structure

### Mobile App (arabai-app/)

```
arabai-app/
├── app/                          # Expo Router screens
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── onboarding/
│   │       ├── _layout.tsx
│   │       ├── welcome.tsx
│   │       ├── goal.tsx
│   │       ├── level.tsx
│   │       ├── name.tsx
│   │       ├── language.tsx
│   │       └── ready.tsx
│   ├── (app)/
│   │   ├── _layout.tsx           # Tab bar
│   │   ├── index.tsx             # Home / World map
│   │   ├── lessons/
│   │   │   ├── [chapterId].tsx
│   │   │   └── [lessonId]/
│   │   │       ├── index.tsx
│   │   │       └── play.tsx
│   │   ├── chat.tsx
│   │   └── profile.tsx
│   └── _layout.tsx               # Root layout, font loading
│
├── components/
│   ├── ui/                       # Generic UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Badge.tsx
│   ├── ArabicText.tsx            # RTL Arabic text wrapper
│   ├── XpAnimation.tsx           # XP pop-up animation
│   ├── StreakBadge.tsx
│   └── LessonCard.tsx
│
├── stores/
│   ├── authStore.ts
│   ├── progressStore.ts
│   └── chatStore.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useLesson.ts
│   ├── useStreak.ts
│   └── useChat.ts
│
├── services/
│   ├── api.ts                    # Axios instance + interceptors
│   ├── storage.ts                # MMKV wrapper
│   └── db.ts                    # expo-sqlite for lesson cache
│
├── constants/
│   ├── colors.ts
│   ├── fonts.ts
│   └── config.ts                 # API base URL, limits
│
├── assets/
│   ├── fonts/
│   │   ├── Amiri-Regular.ttf     # Arabic font
│   │   └── Amiri-Bold.ttf
│   ├── images/
│   └── animations/               # Lottie files for XP, streak
│
├── types/
│   └── index.ts                  # Shared TypeScript interfaces
│
├── app.json                      # Expo config
├── eas.json                      # EAS Build config
├── babel.config.js
├── tsconfig.json
└── package.json
```

### Backend (arabai-backend/)

```
arabai-backend/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   └── me/route.ts
│       ├── chapters/
│       │   └── route.ts
│       ├── lessons/
│       │   ├── [id]/
│       │   │   ├── route.ts
│       │   │   └── complete/route.ts
│       ├── progress/
│       │   └── route.ts
│       ├── streak/
│       │   ├── route.ts
│       │   └── sync/route.ts
│       ├── chat/
│       │   ├── route.ts
│       │   └── history/route.ts
│       └── health/
│           └── route.ts
│
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── redis.ts                  # Upstash Redis client
│   ├── anthropic.ts              # Anthropic SDK client
│   ├── auth.ts                   # JWT helpers
│   └── middleware.ts             # Auth middleware
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                   # Seed Chapter 1 content
│
├── types/
│   └── index.ts
│
├── .env.local
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 11. Environment Configuration

### Mobile App (.env)

```bash
EXPO_PUBLIC_API_URL=https://api.arabai.app         # production
# EXPO_PUBLIC_API_URL=http://localhost:3000         # development
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### Backend (.env.local)

```bash
# Database
DATABASE_URL="postgresql://..."                    # Neon connection string

# Auth
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Anthropic
ANTHROPIC_API_KEY="sk-ant-..."

# App Config
AI_DAILY_MESSAGE_LIMIT=5
AI_MODEL_DEFAULT="claude-haiku-4-5-20251001"
NODE_ENV="production"
```

---

## 12. Development Workflow

### Initial Setup

```bash
# 1. Clone repos
git clone https://github.com/your-org/arabai-app
git clone https://github.com/your-org/arabai-backend

# 2. Backend setup
cd arabai-backend
npm install
cp .env.example .env.local    # Fill in your keys
npx prisma migrate dev
npx prisma db seed
npm run dev                   # Runs on localhost:3000

# 3. App setup
cd arabai-app
npm install
npx expo start                # Opens Expo dev tools

# 4. Run on Android
# Option A: Physical device — install Expo Go, scan QR
# Option B: Android emulator — press 'a' in Expo terminal
```

### Git Workflow

```
main                  ← Production only. Protected branch.
  └── develop         ← Integration branch
        ├── feat/onboarding-flow
        ├── feat/lesson-flashcard
        ├── feat/streak-system
        └── feat/ai-chat
```

**Commit convention:** `type(scope): message`
Examples:
- `feat(lessons): add flashcard lesson type`
- `fix(streak): handle timezone edge case`
- `chore(deps): update expo sdk to 51`

### PR Rules

- All PRs go into `develop`, never `main`
- At least 1 review before merge (if solo, review your own after 24hrs)
- No PR larger than 400 lines changed (break up large features)
- Must include: what changed, how to test, screenshots if UI change

---

## 13. Testing Strategy

### Phase 1 Testing (Pragmatic)

No heavy test infrastructure for Phase 1. Focus on:

| Type | Tool | Coverage |
|---|---|---|
| API endpoint testing | Thunder Client / Postman | All 12 endpoints manually tested |
| Backend unit tests | Jest | Auth helpers, streak logic, rate limiting |
| On-device testing | Real Android device | Full user journey end-to-end |
| Crash monitoring | Sentry | Real-time crash reports from beta users |

### Critical Paths to Test Manually

```
✅ Register → Login → Onboarding (all 6 screens) → Home
✅ Home → Chapter 1 → Lesson 1 → Complete → XP awarded
✅ Complete lesson → Streak updated → Back to home
✅ Chat with Ustadh Noor → Send 5 messages → Hit limit → See upgrade prompt
✅ Close app → Reopen next day → Streak intact
✅ Wrong network → App shows offline state gracefully
✅ JWT expires → App refreshes token or redirects to login
```

### Beta Testing Plan

- Week 6: Invite 50 users via Play Store internal testing track
- Collect: Sentry crash reports + PostHog funnel data + manual feedback via WhatsApp group
- Target: zero crashes on Samsung/Xiaomi/Vivo mid-range devices

---

## 14. Deployment Plan

### Backend (Vercel)

```bash
cd arabai-backend
vercel --prod          # Deploys to production

# Environment vars set in Vercel dashboard, not committed to git
# Custom domain: api.arabai.app → Vercel deployment
```

### Android App (EAS Build + Play Store)

```bash
# One-time setup
npm install -g eas-cli
eas login
eas build:configure

# Build Android App Bundle (.aab) for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### Play Store Submission Timeline

| Step | Time | Notes |
|---|---|---|
| Create Play Console account | Day 1 | $25 one-time fee |
| Set up app listing | Day 1–2 | Screenshots, description, privacy policy |
| Submit internal testing build | Day 3 | Available to invited testers immediately |
| Beta (50 users) testing period | Week 6, Days 1–5 | Collect feedback |
| First open testing submission | End of Week 6 | Google review: 3–7 business days for first submission |

**⚠️ Important:** First Play Store submissions take 3–7 business days for review. Plan Week 6 around this. Build and submit by Day 3 of Week 6 at the latest.

### OTA Updates (Without Play Store Review)

```bash
# For JS-only changes (no native code changed):
eas update --branch production --message "Fix streak timezone bug"

# This pushes instantly to all installed apps
# No Play Store review required for JS updates
# Use this for: bug fixes, content updates, UI tweaks
```

---

## 15. Cost Budget — Phase 1

### One-Time Costs

| Item | Cost |
|---|---|
| Google Play Developer Account | $25 |
| Domain (arabai.app) | ~$15/year |
| **Total one-time** | **~$40** |

### Monthly Running Costs (Beta Phase, ~50–200 users)

| Service | Plan | Cost |
|---|---|---|
| Vercel (backend) | Hobby (free) | $0 |
| Neon PostgreSQL | Free tier | $0 |
| Upstash Redis | Free tier (10K req/day) | $0 |
| Anthropic API (Claude Haiku) | Pay as you go | ~$5–15 |
| Sentry | Free tier | $0 |
| PostHog | Free tier (1M events) | $0 |
| Expo EAS Build | Free tier (30 builds/month) | $0 |
| **Total monthly (beta)** | | **~$5–15** |

### Cost at Scale

| Users | Monthly Revenue (est.) | Monthly AI Cost | Infrastructure |
|---|---|---|---|
| 500 | $1,500–$2,500 | ~$20 | ~$20 |
| 2,000 | $6,000–$10,000 | ~$60 | ~$50 |
| 10,000 | $30,000–$50,000 | ~$250 | ~$200 |

---

## 16. Risk Register & Trade-offs

### Trade-off 1: React Native + Expo over Kotlin Native

**We chose:** React Native + Expo
**We gave up:** Marginally better performance and slightly easier RTL handling
**We gained:** Zero learning curve (team already knows JS/React), ~80% code reuse for iOS in Phase 2, OTA updates without Play Store re-submission, faster development velocity
**Exit strategy:** If React Native becomes a bottleneck at scale, the backend API is untouched — only the frontend needs to be rewritten

### Trade-off 2: Android-First over Web-First

**We chose:** Android-first
**We gave up:** Faster initial shipping (web is faster to iterate), desktop users
**We gained:** Reaching 97% of Pakistan market and 92% of India market from Day 1, native push notifications for streak retention, Play Store distribution
**Exit strategy:** The Next.js backend is already a web server — adding a web frontend in Phase 3 requires only a new frontend repo, no backend changes

### Trade-off 3: Claude Haiku over GPT-4o mini

**We chose:** Claude Haiku
**We gave up:** Slightly larger GPT ecosystem
**We gained:** Better Arabic language understanding, better instruction-following for the teacher persona, lower cost than GPT-4o mini at comparable quality
**Exit strategy:** Model is a config variable — can switch in one line

### Trade-off 4: JWT over Session Cookies

**We chose:** JWT tokens
**We gave up:** Easy server-side session invalidation
**We gained:** Stateless auth that works perfectly for mobile clients (no cookie handling complexity), horizontal scaling without session store
**Mitigation:** Short expiry (7 days) + refresh token rotation

### Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Play Store first submission rejected | Medium | High | Read Play policies carefully; ensure privacy policy, content rating, screenshot requirements met before submission |
| Arabic font rendering issues on some Android devices | Medium | Medium | Test on Samsung + Xiaomi + Vivo; use Amiri font (well-tested for Arabic) |
| Anthropic API latency > 2s | Low | Medium | Show typing indicator; stream response if needed (Phase 2) |
| JWT token not persisting across app restarts | Low | High | Store in MMKV (not memory); test explicitly on real device |
| Streak timezone bugs | Medium | Medium | Always use server time for streak evaluation; client sends local date, server validates |
| EAS Build failures | Low | Medium | Test build process in Week 5, not Week 6 |

---

## 17. Definition of Done — Phase 1

Phase 1 is complete when **all** of the following are true:

### App Functionality
- [ ] User can register and log in
- [ ] Onboarding flow (all 6 screens) works end-to-end
- [ ] Chapter 1 is visible on the home screen / world map
- [ ] User can complete at least 5 lessons (mix of flashcard + fill-blank)
- [ ] XP is awarded after lesson completion and visible in profile
- [ ] Streak increments on daily lesson completion
- [ ] Streak persists after app is closed and reopened
- [ ] User can send 5 messages to Ustadh Noor per day
- [ ] Limit message (upgrade prompt) shows at message 5
- [ ] Chat history is visible when user returns to chat screen
- [ ] Profile screen shows XP, streak, completed lessons

### Technical
- [ ] All 12 API endpoints tested and working
- [ ] JWT auth working (login, protected routes, token refresh)
- [ ] Rate limiting working (5 messages/day enforced)
- [ ] App does not crash on Samsung Galaxy A-series or Xiaomi Redmi Note
- [ ] APK/AAB size is under 30 MB
- [ ] Sentry is capturing errors in production
- [ ] PostHog is tracking key events (onboarding complete, lesson complete, chat message sent)

### Deployment
- [ ] Backend deployed to Vercel production
- [ ] App submitted to Play Store internal testing track
- [ ] 50 beta users invited and can install the app
- [ ] At least 10 users have completed the full onboarding + 1 lesson

### Metrics (after 1 week of beta)
- [ ] Day-1 retention > 40% (slightly lower threshold for beta)
- [ ] Zero crashes reported by Sentry in 48 hours of beta

---

## 18. Appendix

### Appendix A — Arabic Grammar Glossary (for AI context injection)

```
Word Types:
  اِسْم  (Ism)         → Noun
  فِعْل  (Fi'l)        → Verb
  حَرْف  (Harf)        → Particle/Preposition

Verb Tenses:
  مَاضِي (Madi)        → Past tense
  مُضَارِع (Mudari')   → Present/Future tense
  أَمْر  (Amr)         → Imperative (command)

Sentence Roles:
  فَاعِل  (Fa'il)      → Subject (doer of the verb)
  مَفْعُول (Maf'ul)    → Object (receiver of action)
  مُبْتَدَأ (Mubtada)  → Topic of a nominal sentence
  خَبَر   (Khabar)     → Comment/predicate of nominal sentence

Case System (I'rab):
  مَرْفُوع (Marfu')    → Nominative (subject)
  مَنْصُوب (Mansub)    → Accusative (object)
  مَجْرُور (Majrur)    → Genitive (after preposition)
```

### Appendix B — Key Package Versions

```json
{
  "mobile": {
    "expo": "~51.0.0",
    "react-native": "0.74.x",
    "expo-router": "~3.5.0",
    "zustand": "^4.5.0",
    "axios": "^1.7.0",
    "react-native-mmkv": "^2.12.0",
    "expo-sqlite": "~13.4.0",
    "expo-notifications": "~0.28.0",
    "react-native-reanimated": "~3.10.0",
    "nativewind": "^4.0.0",
    "i18n-js": "^4.4.0",
    "@sentry/react-native": "^5.22.0"
  },
  "backend": {
    "next": "14.x",
    "typescript": "^5.x",
    "@prisma/client": "^5.x",
    "@anthropic-ai/sdk": "^0.x",
    "@upstash/redis": "^1.x",
    "jsonwebtoken": "^9.x",
    "bcryptjs": "^2.x",
    "zod": "^3.x"
  }
}
```

### Appendix C — Content Seed (Chapter 1 — Alphabet)

Chapter 1 has 28 lessons — one per Arabic letter. Each lesson has:
- 3 flashcards (letter → name, sound, example word)
- 2 fill-in-the-blank questions

Letters to cover in order:
ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي

Phase 1 ships with letters 1–10 (ا through خ) — enough for 6 weeks of beta content.

### Appendix D — Phase 2 Preview (Out of Scope for Phase 1)

- iOS app submission (same codebase)
- Sarf (morphology) engine — root-pattern system
- Voice pronunciation recording + AI feedback
- Spaced repetition algorithm (SM-2)
- Subscription payments (Stripe or local gateway for Pakistan)
- Social features (Halaqah study groups)
- Leaderboards

---

*This document is the single source of truth for ArabAI Phase 1. Any feature, decision, or architecture change must be reflected here before implementation begins.*

*Last updated: April 2026 | Version 2.0.0*

---

**End of Document — ArabAI Phase 1 SSoT v2.0.0**
