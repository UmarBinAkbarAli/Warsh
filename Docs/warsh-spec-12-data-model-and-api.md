# Warsh · وَرْش — App Specification
## File 12: Data Model & API

**Status:** Locked
**Version:** 1.0
**Last updated:** 2026-05-19
**Depends on:** Files 01–11

> This file specifies the complete database schema, every API endpoint between the mobile app and the backend, request/response shapes, error codes, and the data flow patterns used across the app.

---

## Part 1 — Architecture Overview

### 1.1 Stack (locked per File 01)

- **Mobile app:** React Native, Expo SDK 51, TypeScript
- **Backend:** Next.js 14, TypeScript
- **ORM:** Prisma 7
- **Database:** PostgreSQL on Neon (serverless)
- **Storage:** Cloudflare R2 (audio, images, illustrations)
- **Auth:** JWT-based sessions
- **Push notifications:** Expo Notifications + FCM for server-side push
- **AI:** OpenAI API (GPT-4o-mini for Noor chat, TTS for audio generation)
- **Hosting:** Vercel (backend)
- **Error tracking:** Sentry
- **Analytics:** Mixpanel

### 1.2 Communication pattern

Mobile app → HTTPS → Next.js API routes on Vercel → Prisma → PostgreSQL

Most endpoints are simple REST. WebSocket / SSE is reserved for streaming Noor responses (post-v1.1 enhancement). For v1, all requests are HTTP.

### 1.3 Authentication

- JWT tokens issued at login/registration
- Token stored on device using `expo-secure-store`
- Every authenticated request includes `Authorization: Bearer <token>` header
- Tokens have 30-day expiration; refresh tokens extend sessions
- Logout invalidates server-side session record

### 1.4 Base URL

- Production: `https://api.warsh.app`
- Staging: `https://api-staging.warsh.app`
- Development: configurable via `EXPO_PUBLIC_API_URL` environment variable

---

## Part 2 — Database Schema (Prisma)

### 2.1 User

The central entity. Represents one Warsh learner.

```prisma
model User {
  id                          String    @id @default(uuid())
  email                       String    @unique
  password_hash               String
  name                        String    // max 30 chars
  ui_language                 String    // "en" or "ur"
  goal                        String    // enum value from B2
  self_reported_level         String    // enum value from B3
  daily_commitment_minutes    Int       // 5, 10, 15, 30
  device_locale               String?
  device_timezone             String?

  // Trial and subscription
  trial_start_at              DateTime?
  trial_expires_at            DateTime?
  subscription_status         String    @default("none") // "none", "trial", "active", "expired", "canceled"
  subscription_product_id     String?   // "warsh_monthly" or "warsh_annual"
  subscription_active_until   DateTime?
  subscription_auto_renew     Boolean   @default(false)
  noor_overage_balance        Int       @default(0)
  last_receipt_verified_at    DateTime?

  // Permissions
  notifications_permission    String    @default("not_asked") // "granted", "denied", "denied_permanent", "not_asked"
  microphone_permission       String    @default("not_asked")
  has_seen_preview            Boolean   @default(false)

  // Stats (denormalized for fast reads)
  total_xp                    Int       @default(0)
  current_streak              Int       @default(0)
  longest_streak              Int       @default(0)
  streak_freezes              Int       @default(0)
  lessons_completed_count     Int       @default(0)
  chapters_completed_count    Int       @default(0)
  vocabulary_words_count      Int       @default(0)
  phrases_spoken_count        Int       @default(0)
  spoken_phrases_lessons_count Int      @default(0)
  surahs_understood_count     Int       @default(0)
  total_learning_seconds      Int       @default(0)
  last_active_at              DateTime?

  // Placement
  placement_quiz_results      Json?
  actual_starting_chapter     Int       @default(1)

  // Settings (preferences)
  daily_reminder_time         String    @default("20:00")
  notification_streak_risk    Boolean   @default(true)
  notification_new_content    Boolean   @default(true)
  notification_milestone      Boolean   @default(true)
  notification_word_of_day    Boolean   @default(true)
  audio_enabled               Boolean   @default(true)
  audio_autoplay              Boolean   @default(true)
  sfx_enabled                 Boolean   @default(true)
  haptics_enabled             Boolean   @default(true)
  srs_daily_limit             Int       @default(20)

  // Account lifecycle
  created_at                  DateTime  @default(now())
  updated_at                  DateTime  @updatedAt
  deletion_requested_at       DateTime?
  deleted_at                  DateTime?
  last_login_at               DateTime?

  // Relations
  lesson_progress             LessonProgress[]
  chapter_progress            ChapterProgress[]
  user_vocabulary             UserVocabulary[]
  user_surah_progress         UserSurahProgress[]
  noor_messages               NoorMessage[]
  noor_conversations          NoorConversation[]
  daily_activity              DailyActivity[]
  milestones_earned           UserMilestone[]
  iap_receipts                IAPReceipt[]
  device_tokens               DeviceToken[]
  share_events                ShareEvent[]
  current_focus_surah_id      String?   // Tadabbur current Surah
  tadabbur_current_focus      Surah?    @relation("CurrentFocus", fields: [current_focus_surah_id], references: [id])
}
```

### 2.2 Chapter

```prisma
model Chapter {
  id                 String    @id @default(uuid())
  order              Int       @unique // 1-72
  title_en           String
  title_ar           String
  description_en     String?
  description_ur     String?
  madinah_book       Int       // 1-8
  madinah_lesson     Int       // lesson number within Madinah book
  grammar_focus_en   String?
  grammar_focus_ar   String?
  tadabbur_focus_surah_ids String[] // array of Surah IDs this chapter primarily teaches
  is_published       Boolean   @default(false)
  created_at         DateTime  @default(now())
  updated_at         DateTime  @updatedAt

  lessons            Lesson[]
  chapter_progress   ChapterProgress[]
}
```

### 2.3 Lesson

```prisma
model Lesson {
  id                  String    @id @default(uuid())
  chapter_id          String
  order               Int       // lesson order within chapter (1-7)
  template            String    // "STANDARD", "SPOKEN_PHRASES", "REVIEW", "VERB_PATTERN"
  title_en            String
  title_ar            String
  title_ur            String?
  summary_en          String?
  summary_ur          String?
  xp_reward           Int       @default(10)
  estimated_minutes   Int       @default(7)

  // Beat content (JSON for flexibility per template)
  hook                Json?     // ayah, audio_url, surah_ref, etc.
  discover_cards      Json?     // array of card objects
  exercises           Json?     // array of exercise objects
  reveal              Json?     // concept_name, ayah, highlighted_words, noor_explanation
  close               Json?     // noor_message (template selects from pool)
  spoken_phrases      Json?     // for SPOKEN_PHRASES template
  conjugation_table   Json?     // for VERB_PATTERN template

  is_published        Boolean   @default(false)
  version             String    @default("1.0.0") // for curriculum updates
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt

  chapter             Chapter   @relation(fields: [chapter_id], references: [id])
  lesson_progress     LessonProgress[]

  @@index([chapter_id, order])
}
```

### 2.4 LessonProgress

Tracks each user's progress per lesson.

```prisma
model LessonProgress {
  id                String    @id @default(uuid())
  user_id           String
  lesson_id         String
  status            String    // "NOT_STARTED", "COMPLETED", "SKIPPED_BY_PLACEMENT"
  completed_at      DateTime?
  total_time_seconds Int?
  xp_earned         Int       @default(0)
  was_perfect       Boolean   @default(false)
  mistakes_count    Int       @default(0)

  user              User      @relation(fields: [user_id], references: [id])
  lesson            Lesson    @relation(fields: [lesson_id], references: [id])

  @@unique([user_id, lesson_id])
  @@index([user_id, status])
}
```

### 2.5 ChapterProgress

```prisma
model ChapterProgress {
  id                String    @id @default(uuid())
  user_id           String
  chapter_id        String
  status            String    // "LOCKED", "AVAILABLE", "IN_PROGRESS", "COMPLETED", "SKIPPED_BY_PLACEMENT"
  completed_at      DateTime?
  lessons_completed Int       @default(0)
  lessons_total     Int

  user              User      @relation(fields: [user_id], references: [id])
  chapter           Chapter   @relation(fields: [chapter_id], references: [id])

  @@unique([user_id, chapter_id])
  @@index([user_id, status])
}
```

### 2.6 VocabularyWord (master vocabulary)

```prisma
model VocabularyWord {
  id                String    @id @default(uuid())
  arabic            String
  arabic_plain      String    // no harakat, for search
  transliteration   String
  translation_en    String
  translation_ur    String
  word_type         String    // enum from File 07
  gender            String?   // "M", "F", null
  number_form       String?   // "SINGULAR", "DUAL", "PLURAL", null
  plural_form       String?
  case_info         String?
  root_letters      String?   // e.g., "ك-ت-ب"
  audio_url         String
  image_url         String?
  topic_categories  String[]  // array of topic slugs
  frequency_in_quran Int?
  chapter_introduced Int      @default(1)
  is_quranic_only   Boolean   @default(false)
  quranic_example   Json?     // ayah object: surah, ayah_num, arabic, translation, word_position
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt

  user_vocabulary   UserVocabulary[]
  lesson_references LessonVocabularyMap[]

  @@index([arabic_plain])
  @@index([root_letters])
  @@index([chapter_introduced])
}
```

### 2.7 UserVocabulary

The user's personal word bank with SRS state.

```prisma
model UserVocabulary {
  id                String    @id @default(uuid())
  user_id           String
  vocabulary_word_id String
  added_at          DateTime  @default(now())
  is_favorite       Boolean   @default(false)
  is_hidden_from_review Boolean @default(false)

  // SRS metadata (per File 07)
  ease_factor       Float     @default(2.5)
  interval_days     Int       @default(1)
  repetitions       Int       @default(0)
  next_review_date  DateTime
  last_review_quality Int?    // 0-5
  last_reviewed_at  DateTime?
  is_mastered       Boolean   @default(false)

  user              User      @relation(fields: [user_id], references: [id])
  vocabulary_word   VocabularyWord @relation(fields: [vocabulary_word_id], references: [id])

  @@unique([user_id, vocabulary_word_id])
  @@index([user_id, next_review_date])
  @@index([user_id, is_mastered])
}
```

### 2.8 LessonVocabularyMap

Junction table connecting lessons to vocabulary words.

```prisma
model LessonVocabularyMap {
  id                 String  @id @default(uuid())
  lesson_id          String
  vocabulary_word_id String
  introduces         Boolean @default(true) // true if this lesson first introduces the word

  vocabulary_word    VocabularyWord @relation(fields: [vocabulary_word_id], references: [id])

  @@unique([lesson_id, vocabulary_word_id])
}
```

### 2.9 Surah

Quran chapters tracked for Tadabbur.

```prisma
model Surah {
  id                  String    @id @default(uuid())
  surah_number        Int       @unique // 1-114
  name_ar             String
  name_en             String
  name_ur             String?
  meaning_en          String
  meaning_ur          String?
  total_ayat          Int
  full_audio_url      String
  ayat                Json      // array of ayah objects per File 07
  total_words_unique  Int       // count of unique words for comprehension calc
  tadabbur_phase      Int       // 1, 2, 3 — current phase
  tadabbur_order      Int?      // order in Tadabbur progression (1-11 for Phase 2)
  is_published        Boolean   @default(false)

  user_surah_progress UserSurahProgress[]
  current_focus_users User[]    @relation("CurrentFocus")
}
```

### 2.10 SurahWord

Many-to-many between Surahs and VocabularyWords (a word can appear in multiple Surahs).

```prisma
model SurahWord {
  id                 String  @id @default(uuid())
  surah_id           String
  vocabulary_word_id String
  ayah_number        Int
  word_position      Int     // index in ayah
  occurrence_count   Int     @default(1) // how many times this word appears in this Surah

  @@unique([surah_id, vocabulary_word_id, ayah_number, word_position])
  @@index([surah_id])
}
```

### 2.11 UserSurahProgress

```prisma
model UserSurahProgress {
  id                       String    @id @default(uuid())
  user_id                  String
  surah_id                 String
  words_mastered_count     Int       @default(0)
  words_introduced_count   Int       @default(0)
  total_words              Int
  comprehension_percent    Int       @default(0)
  completed_at             DateTime?
  is_current_focus         Boolean   @default(false)

  user                     User      @relation(fields: [user_id], references: [id])
  surah                    Surah     @relation(fields: [surah_id], references: [id])

  @@unique([user_id, surah_id])
}
```

### 2.12 NoorConversation

```prisma
model NoorConversation {
  id              String    @id @default(uuid())
  user_id         String
  started_at      DateTime  @default(now())
  last_message_at DateTime  @default(now())

  user            User      @relation(fields: [user_id], references: [id])
  messages        NoorMessage[]

  @@index([user_id, last_message_at])
}
```

### 2.13 NoorMessage

```prisma
model NoorMessage {
  id                String    @id @default(uuid())
  conversation_id   String
  user_id           String
  role              String    // "user" or "assistant"
  content           String
  created_at        DateTime  @default(now())
  // For Noor responses:
  prompt_version    String?
  response_time_ms  Int?
  was_fallback      Boolean   @default(false)
  was_flagged       Boolean   @default(false)
  flag_category     String?
  user_context_snapshot Json? // what context was injected

  conversation      NoorConversation @relation(fields: [conversation_id], references: [id])
  user              User      @relation(fields: [user_id], references: [id])

  @@index([conversation_id, created_at])
}
```

### 2.14 DailyActivity

Tracks daily user activity for streak calculation.

```prisma
model DailyActivity {
  id                  String    @id @default(uuid())
  user_id             String
  date                DateTime  // truncated to day boundary (4 AM local)
  lessons_completed   Int       @default(0)
  xp_earned           Int       @default(0)
  time_spent_seconds  Int       @default(0)
  daily_goal_met      Boolean   @default(false)
  streak_count_at_end Int       @default(0)
  streak_freeze_used  Boolean   @default(false)

  user                User      @relation(fields: [user_id], references: [id])

  @@unique([user_id, date])
  @@index([user_id, date])
}
```

### 2.15 Milestone

```prisma
model Milestone {
  id                String    @id @default(uuid())
  slug              String    @unique // machine name e.g. "first_lesson"
  name_en           String
  name_ar           String
  name_ur           String?
  description_en    String
  description_ur    String?
  badge_image_url   String
  category          String    // "first_time", "streak", "xp", "chapter", "vocabulary", "tadabbur", "speaking", "special"
  xp_bonus          Int       @default(0)
  trigger_condition Json      // e.g., { "type": "streak", "value": 7 }
  is_active         Boolean   @default(true)
  related_ayah      Json?     // optional ayah/hadith to display
  created_at        DateTime  @default(now())

  earned_by         UserMilestone[]
}
```

### 2.16 UserMilestone

```prisma
model UserMilestone {
  id              String    @id @default(uuid())
  user_id         String
  milestone_id    String
  unlocked_at     DateTime  @default(now())
  was_shared      Boolean   @default(false)

  user            User      @relation(fields: [user_id], references: [id])
  milestone       Milestone @relation(fields: [milestone_id], references: [id])

  @@unique([user_id, milestone_id])
}
```

### 2.17 IAPReceipt

```prisma
model IAPReceipt {
  id                String    @id @default(uuid())
  user_id           String
  platform          String    // "ios" or "android"
  product_id        String    // "warsh_monthly", "warsh_annual", "warsh_noor_overage_pack"
  transaction_id    String    @unique // from Apple/Google
  original_transaction_id String? // for renewals
  purchased_at      DateTime
  expires_at        DateTime?
  is_trial          Boolean   @default(false)
  raw_receipt       Json
  verification_status String  // "verified", "failed", "pending"
  verified_at       DateTime?

  user              User      @relation(fields: [user_id], references: [id])

  @@index([user_id])
}
```

### 2.18 WordOfTheDay

```prisma
model WordOfTheDay {
  id                  String    @id @default(uuid())
  date                DateTime  @unique
  vocabulary_word_id  String
  fun_fact_en         String?
  fun_fact_ur         String?

  vocabulary_word     VocabularyWord @relation(fields: [vocabulary_word_id], references: [id])
}
```

### 2.19 DeviceToken

For push notifications.

```prisma
model DeviceToken {
  id              String    @id @default(uuid())
  user_id         String
  token           String    @unique
  platform        String    // "ios" or "android"
  created_at      DateTime  @default(now())
  last_seen_at    DateTime  @default(now())
  is_active       Boolean   @default(true)

  user            User      @relation(fields: [user_id], references: [id])

  @@index([user_id])
}
```

### 2.20 PasswordResetToken

```prisma
model PasswordResetToken {
  id          String    @id @default(uuid())
  user_id     String
  token       String    @unique
  created_at  DateTime  @default(now())
  expires_at  DateTime
  used_at     DateTime?
}
```

### 2.21 ShareEvent

```prisma
model ShareEvent {
  id              String    @id @default(uuid())
  user_id         String
  share_type      String    // "milestone", "word", "surah", "stats"
  share_target_id String?   // milestone_id, word_id, surah_id
  platform        String?   // detected if possible
  created_at      DateTime  @default(now())

  user            User      @relation(fields: [user_id], references: [id])
}
```

### 2.22 AnalyticsEvent (optional — Mixpanel handles most)

For events we want to retain server-side for debugging:

```prisma
model AnalyticsEvent {
  id          String    @id @default(uuid())
  user_id     String?
  event_name  String
  properties  Json?
  created_at  DateTime  @default(now())

  @@index([user_id, created_at])
  @@index([event_name, created_at])
}
```

---

## Part 3 — API Endpoints

### 3.1 Authentication endpoints

#### POST /api/auth/register

Create a new user account.

**Request:**
```json
{
  "email": "umar@example.com",
  "password": "...",
  "name": "Umar",
  "ui_language": "en",
  "goal": "understand_quran",
  "self_reported_level": "knows_alphabet",
  "daily_commitment_minutes": 10,
  "placement_quiz_results": { ... },
  "device_locale": "en_PK",
  "device_timezone": "Asia/Karachi"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "...",
    "name": "Umar",
    "trial_expires_at": "2026-05-26T...",
    "subscription_status": "trial",
    "starting_chapter": 4,
    ...
  },
  "token": "jwt_token"
}
```

**Errors:**
- 400: `email_already_exists`, `password_too_weak`, `invalid_input`
- 500: `server_error`

#### POST /api/auth/login

**Request:**
```json
{
  "email": "umar@example.com",
  "password": "..."
}
```

**Response (200):**
```json
{
  "user": { ... },
  "token": "jwt_token"
}
```

**Errors:**
- 401: `invalid_credentials`, `no_account_found`
- 500: `server_error`

#### POST /api/auth/logout

**Headers:** `Authorization: Bearer <token>`

**Response (200):** `{}`

#### POST /api/auth/forgot-password

**Request:**
```json
{
  "email": "umar@example.com"
}
```

**Response (200):** `{ "sent": true }` (always 200, even if email doesn't exist — security)

#### POST /api/auth/reset-password

**Request:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "..."
}
```

**Response (200):** `{ "success": true }`
**Errors:** 400: `invalid_token`, `expired_token`, `password_too_weak`

#### GET /api/auth/me

Returns the current authenticated user with full profile and stats.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "ui_language": "en",
    "total_xp": 245,
    "current_streak": 7,
    "current_focus_surah": { "id": "...", "name_en": "An-Nas", ... },
    "subscription_status": "active",
    ...
  }
}
```

#### POST /api/auth/delete-account

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "password": "..."
}
```

**Response (200):** `{ "deletion_scheduled": true }`

### 3.2 Onboarding & Placement

#### POST /api/placement/apply

After placement quiz, determines starting chapter.

**Request:**
```json
{
  "self_reported_level": "knows_alphabet",
  "quiz_results": { ... }
}
```

**Response (200):**
```json
{
  "starting_chapter": 4,
  "skipped_chapters": [1, 2, 3]
}
```

### 3.3 Curriculum endpoints

#### GET /api/chapters

Returns all chapters with the user's progress.

**Response (200):**
```json
{
  "chapters": [
    {
      "id": "...",
      "order": 1,
      "title_en": "The Demonstrative Pronoun — هَذَا",
      "title_ar": "اِسْمُ الإِشَارَة — هَذَا",
      "description_en": "...",
      "lessons_count": 5,
      "lessons_completed": 5,
      "status": "COMPLETED",
      "is_locked": false,
      "xp_available": 50
    },
    ...
  ]
}
```

#### GET /api/chapters/:chapter_id/lessons

Returns lessons in a chapter.

**Response (200):**
```json
{
  "chapter": { ... },
  "lessons": [
    {
      "id": "...",
      "order": 1,
      "template": "STANDARD",
      "title_en": "First Encounter with هَذَا",
      "title_ar": "...",
      "summary_en": "...",
      "xp_reward": 10,
      "estimated_minutes": 6,
      "status": "COMPLETED",
      "completed_at": "...",
      "was_perfect": false
    },
    ...
  ]
}
```

**Errors:** 403: `chapter_locked`, 404: `chapter_not_found`

#### GET /api/lessons/:lesson_id

Returns full lesson data including all beats.

**Response (200):**
```json
{
  "id": "...",
  "chapter_id": "...",
  "template": "STANDARD",
  "title_en": "...",
  "title_ar": "...",
  "xp_reward": 10,
  "hook": {
    "ayah_arabic": "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
    "audio_url": "https://r2.../ayat/108_1.mp3",
    "surah_name_en": "Al-Kawthar",
    "surah_number": 108,
    "ayah_number": 1
  },
  "discover_cards": [
    {
      "id": "...",
      "word_arabic": "هَذَا",
      "transliteration": "hādhā",
      "translation_en": "this",
      "translation_ur": "...",
      "audio_url": "...",
      "image_url": "..."
    },
    ...
  ],
  "exercises": [
    {
      "id": "...",
      "type": "TAP_TRANSLATION",
      "prompt_arabic": "كِتَاب",
      "audio_url": "...",
      "options": [
        { "id": "a", "text_en": "book" },
        ...
      ],
      "correct_answer": "a",
      "explanation_en": "...",
      "explanation_ur": "..."
    },
    ...
  ],
  "reveal": {
    "concept_name_en": "Demonstrative pronoun",
    "concept_name_ar": "اِسْمُ الإِشَارَة",
    "ayah_arabic": "...",
    "highlighted_words": [0],
    "audio_url": "...",
    "noor_explanation_en": "..."
  },
  "close": {
    "noor_message_en": "Barak Allahu feek. You completed today's lesson.",
    "noor_message_ur": "..."
  }
}
```

**Errors:** 403: `chapter_locked`, 404: `lesson_not_found`, 403: `requires_subscription`

#### POST /api/lessons/:lesson_id/complete

Submit lesson completion.

**Request:**
```json
{
  "total_time_seconds": 412,
  "exercises_results": [
    {
      "exercise_id": "...",
      "correct": true,
      "time_seconds": 14,
      "attempts": 1
    },
    ...
  ],
  "was_perfect": true,
  "completed_at": "2026-05-19T14:23:45Z"
}
```

**Response (200):**
```json
{
  "lesson_progress": { ... },
  "xp_earned": 10,
  "total_xp": 255,
  "current_streak": 8,
  "longest_streak": 8,
  "daily_goal_progress": {
    "current_seconds": 600,
    "target_seconds": 600,
    "complete": true
  },
  "milestones_unlocked": [
    {
      "id": "...",
      "name_en": "One week's path",
      "name_ar": "أُسْبُوع",
      "badge_image_url": "...",
      "xp_bonus": 25
    }
  ],
  "chapter_completed": false,
  "surah_understood": null,
  "phrases_added": 0,
  "words_added_to_vocabulary": ["word_id_1", "word_id_2", ...]
}
```

### 3.4 Vocabulary endpoints

#### GET /api/vocabulary/my-words

Returns the user's vocabulary bank (paginated).

**Query params:**
- `filter`: `all` | `new` | `mastered` | `review`
- `sort`: `recent` | `alpha` | `chapter` | `topic`
- `page`: 1-based
- `per_page`: default 50

**Response (200):**
```json
{
  "words": [
    {
      "id": "...",
      "arabic": "كِتَاب",
      "transliteration": "kitāb",
      "translation_en": "book",
      "translation_ur": "...",
      "audio_url": "...",
      "image_url": "...",
      "word_type": "NOUN",
      "is_favorite": false,
      "is_mastered": false,
      "next_review_date": "...",
      "added_at": "..."
    },
    ...
  ],
  "total_count": 245,
  "page": 1,
  "per_page": 50
}
```

#### GET /api/vocabulary/by-topic/:topic_slug

**Response (200):**
```json
{
  "topic": {
    "slug": "people",
    "name_en": "People",
    "name_ar": "النَّاس",
    "illustration_url": "..."
  },
  "words": [
    {
      "id": "...",
      "arabic": "...",
      "is_unlocked": true,
      ...
    },
    ...
  ]
}
```

#### GET /api/vocabulary/search

**Query params:**
- `q`: search query string

**Response (200):**
```json
{
  "results": [ ... ],
  "total_count": 5
}
```

#### GET /api/vocabulary/words/:word_id

Returns full detail for a single word.

**Response (200):**
```json
{
  "id": "...",
  "arabic": "كِتَاب",
  "arabic_plain": "كتاب",
  "transliteration": "...",
  "translation_en": "book",
  "translation_ur": "...",
  "audio_url": "...",
  "image_url": "...",
  "word_type": "NOUN",
  "gender": "M",
  "plural_form": "كُتُب",
  "root_letters": "ك-ت-ب",
  "frequency_in_quran": 230,
  "quranic_example": {
    "surah_number": 2,
    "surah_name_ar": "البَقَرَة",
    "ayah_number": 2,
    "ayah_arabic": "...",
    "word_position": 1,
    "translation_en": "..."
  },
  "lessons_where_appears": [
    { "id": "...", "title_en": "...", "chapter_order": 1 }
  ],
  "related_words": [
    { "id": "...", "arabic": "كَاتِب" },
    ...
  ],
  "is_favorite": false,
  "is_mastered": false,
  "is_hidden_from_review": false,
  "is_unlocked": true
}
```

#### POST /api/vocabulary/words/:word_id/favorite

Toggle favorite status.

**Response (200):**
```json
{ "is_favorite": true }
```

#### POST /api/vocabulary/words/:word_id/mark-for-review

Add to SRS queue immediately.

**Response (200):**
```json
{ "next_review_date": "..." }
```

#### POST /api/vocabulary/words/:word_id/hide-from-review

**Response (200):**
```json
{ "is_hidden_from_review": true }
```

### 3.5 SRS endpoints

#### GET /api/srs/today

Returns today's review queue.

**Response (200):**
```json
{
  "due_count": 12,
  "words": [
    {
      "id": "...",
      "word": { ... },
      "next_review_date": "..."
    },
    ...
  ]
}
```

#### POST /api/srs/review

Submit a single review response.

**Request:**
```json
{
  "user_vocabulary_id": "...",
  "quality": 4
}
```

**Response (200):**
```json
{
  "new_interval_days": 6,
  "new_ease_factor": 2.5,
  "new_next_review_date": "..."
}
```

#### POST /api/srs/session-complete

Mark a review session as complete.

**Request:**
```json
{
  "words_reviewed": 12,
  "session_time_seconds": 240
}
```

**Response (200):**
```json
{
  "xp_earned": 5,
  "total_xp": 260
}
```

#### GET /api/vocabulary/word-of-the-day

Returns today's featured word.

**Response (200):**
```json
{
  "word": { ... full vocabulary word ... },
  "fun_fact_en": "كِتَاب appears 230 times in the Quran",
  "fun_fact_ur": "..."
}
```

### 3.6 Tadabbur endpoints

#### GET /api/tadabbur

Returns the user's full Tadabbur state.

**Response (200):**
```json
{
  "current_focus": {
    "surah": { "id": "...", "name_en": "An-Nas", "name_ar": "...", ... },
    "comprehension_percent": 73,
    "words_mastered": 9,
    "total_words": 12,
    "ayat_with_word_states": [
      {
        "ayah_number": 1,
        "ayah_arabic": "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        "audio_url": "...",
        "words": [
          { "position": 0, "arabic": "قُلْ", "state": "mastered", "vocabulary_word_id": "..." },
          { "position": 1, "arabic": "أَعُوذُ", "state": "introduced", "vocabulary_word_id": "..." },
          { "position": 2, "arabic": "بِرَبِّ", "state": "not_learned", "vocabulary_word_id": null },
          ...
        ]
      },
      ...
    ]
  },
  "completed_surahs": [
    { "id": "...", "name_en": "Al-Fatiha", "completed_at": "..." }
  ],
  "upcoming_surahs": [
    { "id": "...", "name_en": "Al-Falaq", "total_words": 13, "tadabbur_order": 3 },
    ...
  ]
}
```

#### GET /api/tadabbur/surah/:surah_id

Returns full state for a specific Surah (current or completed).

**Response (200):** Same shape as `current_focus` above.

### 3.7 Noor endpoints

#### POST /api/noor/chat

Send a message to Noor.

**Request:**
```json
{
  "message": "Why is كِتَاب masculine?",
  "conversation_id": "..." 
}
```

**Response (200):**
```json
{
  "response": "كِتَاب is masculine because it doesn't end in ة (taa marbuta), which marks feminine nouns. Most Arabic nouns without ة are masculine.",
  "conversation_id": "...",
  "message_id": "...",
  "messages_remaining_today": 4,
  "extra_messages_remaining": 0
}
```

**Errors:**
- 429: `daily_limit_reached`, response includes prompt to buy overage
- 503: `unavailable` (OpenAI down)

#### GET /api/noor/conversations/:conversation_id

Returns conversation history (paginated).

**Query params:**
- `before`: timestamp for pagination

**Response (200):**
```json
{
  "messages": [
    { "id": "...", "role": "user", "content": "...", "created_at": "..." },
    { "id": "...", "role": "assistant", "content": "...", "created_at": "..." }
  ],
  "has_more": false
}
```

#### POST /api/noor/conversations/:conversation_id/clear

**Response (200):** `{ "cleared": true }`

#### POST /api/noor/messages/:message_id/flag

**Request:**
```json
{
  "category": "inaccurate"
}
```

**Response (200):** `{ "flagged": true }`

### 3.8 Engagement endpoints

#### GET /api/profile/stats

Returns all stats for the You tab.

**Response (200):**
```json
{
  "total_xp": 1247,
  "current_streak": 23,
  "longest_streak": 45,
  "lessons_completed": 87,
  "chapters_completed": 11,
  "vocabulary_words": 145,
  "phrases_spoken": 32,
  "spoken_phrases_lessons": 3,
  "surahs_understood": 4,
  "total_learning_seconds": 18430,
  "weekly_learning_seconds": 1240,
  "daily_goal_today_complete": true,
  "milestones_earned_count": 12,
  "streak_freezes": 1,
  "tadabbur_current_focus": { "id": "...", "name_en": "Al-Falaq" }
}
```

#### GET /api/profile/streak-history

For the heatmap visualization.

**Query params:**
- `from`: ISO date
- `to`: ISO date

**Response (200):**
```json
{
  "days": [
    {
      "date": "2026-05-19",
      "lessons_completed": 2,
      "xp_earned": 25,
      "daily_goal_met": true,
      "streak_freeze_used": false
    },
    ...
  ]
}
```

#### GET /api/milestones

Returns all milestones with user's earn status.

**Response (200):**
```json
{
  "milestones": [
    {
      "id": "...",
      "slug": "first_lesson",
      "name_en": "First step",
      "name_ar": "الخُطْوَة الأُولَى",
      "description_en": "Complete your first lesson",
      "badge_image_url": "...",
      "category": "first_time",
      "xp_bonus": 25,
      "earned_at": "2026-04-12T...",
      "was_shared": false
    },
    ...
  ]
}
```

#### POST /api/milestones/:milestone_id/mark-shared

**Response (200):** `{ "was_shared": true }`

### 3.9 Settings endpoints

#### PATCH /api/users/me

Update user preferences.

**Request:**
```json
{
  "ui_language": "ur",
  "daily_commitment_minutes": 15,
  "daily_reminder_time": "21:00",
  "notification_streak_risk": true,
  "audio_enabled": true,
  "sfx_enabled": false,
  ...
}
```

**Response (200):** `{ "user": { ... updated ... } }`

#### POST /api/users/me/upload-avatar

Multipart upload for user avatar.

**Response (200):**
```json
{ "avatar_url": "..." }
```

#### POST /api/users/me/change-password

**Request:**
```json
{
  "current_password": "...",
  "new_password": "..."
}
```

**Response (200):** `{ "changed": true }`

#### POST /api/users/me/change-email

**Request:**
```json
{
  "current_password": "...",
  "new_email": "..."
}
```

**Response (200):** `{ "email": "..." }`

### 3.10 Subscription endpoints

#### POST /api/iap/verify-receipt

Verify an Apple or Google IAP receipt.

**Request:**
```json
{
  "platform": "ios",
  "receipt_data": "base64_receipt",
  "product_id": "warsh_monthly",
  "transaction_id": "..."
}
```

**Response (200):**
```json
{
  "verified": true,
  "subscription_status": "active",
  "active_until": "...",
  "is_trial": false
}
```

#### POST /api/iap/restore

Restore previous purchases.

**Request:**
```json
{
  "platform": "ios",
  "receipts": [ ... ]
}
```

**Response (200):**
```json
{
  "restored": true,
  "subscription_status": "active",
  "active_until": "..."
}
```

#### POST /api/iap/apple-notification

Webhook endpoint for Apple subscription notifications.

#### POST /api/iap/google-notification

Webhook endpoint for Google subscription notifications.

### 3.11 Push notification endpoints

#### POST /api/notifications/register-device

Register a device token for push.

**Request:**
```json
{
  "token": "expo_push_token",
  "platform": "ios"
}
```

**Response (200):** `{ "registered": true }`

#### POST /api/notifications/unregister-device

**Request:**
```json
{
  "token": "..."
}
```

**Response (200):** `{ "unregistered": true }`

### 3.12 Misc endpoints

#### GET /api/health

Health check.

**Response (200):** `{ "status": "ok", "version": "..." }`

#### POST /api/analytics/event

Optional server-side event logging (most analytics goes to Mixpanel client-side).

**Request:**
```json
{
  "event_name": "lesson_started",
  "properties": { ... }
}
```

**Response (200):** `{ "logged": true }`

---

## Part 4 — Error Codes

Standard error response shape:

```json
{
  "error": {
    "code": "lesson_not_found",
    "message": "Lesson not found.",
    "details": { ... }
  }
}
```

### Standard error codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `invalid_input` | 400 | Request body validation failed |
| `email_already_exists` | 400 | Email is registered |
| `password_too_weak` | 400 | Password doesn't meet requirements |
| `invalid_credentials` | 401 | Wrong email/password |
| `no_account_found` | 401 | Email not registered |
| `unauthorized` | 401 | Missing or invalid auth token |
| `token_expired` | 401 | JWT expired |
| `forbidden` | 403 | Authenticated but lacks permission |
| `chapter_locked` | 403 | Chapter not yet unlocked |
| `requires_subscription` | 403 | Feature requires paid subscription |
| `daily_limit_reached` | 429 | Noor daily message limit hit |
| `rate_limited` | 429 | Too many requests too fast |
| `lesson_not_found` | 404 | Lesson ID doesn't exist |
| `chapter_not_found` | 404 | Chapter ID doesn't exist |
| `word_not_found` | 404 | Vocabulary word ID doesn't exist |
| `conversation_not_found` | 404 | Noor conversation ID doesn't exist |
| `surah_not_found` | 404 | Surah ID doesn't exist |
| `invalid_token` | 400 | Reset token invalid |
| `expired_token` | 400 | Reset token expired |
| `receipt_verification_failed` | 400 | IAP receipt couldn't be verified |
| `unavailable` | 503 | Service temporarily unavailable (OpenAI down, etc.) |
| `server_error` | 500 | Internal server error |

---

## Part 5 — Data Flow Patterns

### 5.1 Lesson completion flow

```
1. User completes lesson in app
2. App calls POST /api/lessons/:id/complete with results
3. Backend validates and updates:
   - LessonProgress (status, xp_earned, time, mistakes)
   - ChapterProgress (lessons_completed++)
   - User stats (total_xp, lessons_completed_count, etc.)
   - DailyActivity (today's record updated)
   - Streak calculation
   - Vocabulary words added to UserVocabulary
   - Surah comprehension recalculated for affected Surahs
   - Milestone check (which milestones unlocked?)
4. Backend returns response with all updates
5. App updates local state and shows celebrations
```

### 5.2 Streak calculation

Each day at 4 AM local time (per File 08):

```
1. Cron job runs daily for each timezone
2. For each user in that timezone:
   - Check yesterday's DailyActivity
   - If daily_goal_met: streak continues (handled by lesson completion)
   - If NOT daily_goal_met:
     - If streak_freezes > 0: auto-use freeze, mark today as freezed
     - If streak_freezes == 0: streak resets to 0
3. Update user.current_streak
4. Trigger streak loss notification if applicable
```

### 5.3 Surah comprehension recalculation

```
When a UserVocabulary changes (is_mastered toggles):
1. Identify all Surahs containing this word
2. For each Surah, recalculate UserSurahProgress:
   - Count user's mastered words in this Surah
   - Compute comprehension_percent
3. If any Surah hits 100%: trigger Surah Understood milestone (M6)
4. Update current_focus_surah if completed (advance to next in progression)
```

### 5.4 Daily goal completion

```
Every lesson completion:
1. Add lesson time to DailyActivity.time_spent_seconds
2. Check if daily goal threshold reached
3. If just hit threshold for the first time today:
   - daily_goal_met = true
   - +5 XP bonus
   - Trigger M5 (daily goal toast)
4. Streak continues if maintained
```

### 5.5 SRS word added to bank

```
When lesson completion includes new vocabulary:
1. For each word introduced:
   - Check if UserVocabulary exists for this user+word
   - If not, create with:
     - interval_days: 1
     - next_review_date: tomorrow
     - ease_factor: 2.5
     - repetitions: 0
2. Increment user.vocabulary_words_count
3. Check for vocabulary milestones (10, 50, 100, etc.)
```

---

## Part 6 — Caching Strategy

### 6.1 Backend caches

- **Lesson data:** Cached with `stale-while-revalidate` strategy. New lesson versions invalidate cache.
- **Word of the Day:** Cached daily — generated once, served all day.
- **Vocabulary search results:** Cached per query for 1 hour.
- **User stats:** Computed on demand from database (no caching — always fresh).

### 6.2 Client caches (Expo)

- **Lesson JSON:** Cached locally after first fetch (`AsyncStorage`)
- **Audio files:** Cached in `FileSystem.cacheDirectory`, 30-day expiration
- **Images:** Cached via Expo Image library
- **User profile:** Cached locally, refreshed on app open and major state changes

### 6.3 Cache invalidation

- New app version: clears lesson and curriculum caches
- New chapter published: triggered via push notification, invalidates chapter list
- Settings change: immediately reflects in cache

---

## Part 7 — Security

### 7.1 Authentication security

- Passwords hashed with bcrypt (cost factor 12)
- JWTs signed with HS256, secret rotated every 6 months
- JWT contains: `user_id`, `email`, `iat`, `exp`
- Token expiration: 30 days
- Refresh token mechanism: refresh tokens stored in database, can be revoked

### 7.2 Input validation

- All endpoints validate input via Zod schemas
- Reject extra fields not in schema
- Sanitize text inputs (escape HTML, etc.)
- Validate enums against allowed values

### 7.3 Rate limiting

- General: 100 requests per minute per user
- Noor chat: 1 request per 2 seconds per user
- Login: 5 attempts per 15 minutes per IP
- Password reset: 3 attempts per hour per email

### 7.4 Data encryption

- All HTTPS traffic (TLS 1.3)
- Database encrypted at rest (Neon default)
- Cloudflare R2 encrypted at rest
- Passwords never logged
- IAP receipts stored encrypted

### 7.5 PII protection

- Email is the only true PII collected
- Name is user-provided, may be anonymous nickname
- No phone numbers, addresses, DOB collected
- Voice recordings stay on device (per File 06)
- Chat messages stored 180 days then deleted (per File 09)

---

## Part 8 — Performance Targets

| Endpoint | Target P50 latency | Target P95 latency |
|---|---|---|
| GET /api/auth/me | <100ms | <300ms |
| GET /api/chapters | <200ms | <500ms |
| GET /api/lessons/:id | <300ms | <800ms |
| POST /api/lessons/:id/complete | <500ms | <1500ms |
| POST /api/noor/chat | <2000ms | <5000ms |
| GET /api/vocabulary/my-words | <200ms | <500ms |
| GET /api/tadabbur | <300ms | <800ms |

Lesson completion is more expensive (recalculates Surah comprehension, checks all milestone triggers).

---

## Part 9 — Database Indexes

Critical indexes for performance:

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);

-- Lesson progress queries
CREATE INDEX idx_lesson_progress_user_status ON lesson_progress(user_id, status);
CREATE INDEX idx_lesson_progress_completed_at ON lesson_progress(completed_at);

-- Chapter progress
CREATE INDEX idx_chapter_progress_user ON chapter_progress(user_id, status);

-- Vocabulary
CREATE INDEX idx_vocab_arabic_plain ON vocabulary_words(arabic_plain);
CREATE INDEX idx_vocab_root ON vocabulary_words(root_letters);
CREATE INDEX idx_vocab_chapter ON vocabulary_words(chapter_introduced);
CREATE INDEX idx_user_vocab_review ON user_vocabulary(user_id, next_review_date);
CREATE INDEX idx_user_vocab_mastered ON user_vocabulary(user_id, is_mastered);

-- Daily activity (for streak calc)
CREATE INDEX idx_daily_activity_user_date ON daily_activity(user_id, date);

-- Noor messages
CREATE INDEX idx_noor_conv_user ON noor_conversations(user_id, last_message_at);
CREATE INDEX idx_noor_msg_conv ON noor_messages(conversation_id, created_at);

-- Surah words
CREATE INDEX idx_surah_words_surah ON surah_words(surah_id);

-- IAP receipts
CREATE INDEX idx_iap_receipts_user ON iap_receipts(user_id);
CREATE INDEX idx_iap_receipts_txn ON iap_receipts(transaction_id);
```

---

## Part 10 — Migration Strategy

### 10.1 Initial setup

```bash
npx prisma migrate dev --name init
```

Creates all tables defined in Part 2.

### 10.2 Seed data

Required seed scripts:

1. **Chapters** (72) and **Lessons** (~380) — from curriculum data
2. **Surahs** (11 for Phase 2 + Al-Fatiha = 12) with word breakdowns
3. **VocabularyWords** (600+) with translations and Quranic examples
4. **SurahWord** mappings (word-in-surah relationships)
5. **LessonVocabularyMap** (lesson-introduces-word relationships)
6. **Milestones** (~50) with triggers and badge URLs
7. **WordOfTheDay** entries for the first 60 days

Seed script: `npm run db:seed`

### 10.3 Migrations going forward

- Each new feature gets a migration via Prisma
- Migrations are versioned and committed to repo
- Production migrations run via deploy pipeline
- Rollback strategy: keep last 3 migrations easily revertible

---

## Part 11 — Backend Cron Jobs

Scheduled tasks running on Vercel Cron:

| Task | Schedule | Purpose |
|---|---|---|
| Streak calculation | Hourly (4 AM in each timezone) | Update streaks, apply freezes |
| Trial expiration check | Every 6 hours | Mark trials as expired |
| Subscription expiration check | Every 6 hours | Mark expired subscriptions |
| Word of the Day rotation | Daily at 4 AM UTC | Rotate to next word |
| Old data cleanup | Daily | Delete >180-day-old Noor messages |
| Account deletion finalization | Daily | Actually delete deletion_requested accounts after 30 days |
| Push notification scheduling | Daily | Schedule daily reminders for all users |

---

## Part 12 — Test Plan

- [ ] User registration creates User record with correct defaults
- [ ] Login returns valid JWT with 30-day expiration
- [ ] GET /api/auth/me returns full user profile
- [ ] Password reset flow end-to-end works
- [ ] GET /api/chapters returns chapters with correct progress per user
- [ ] Locked chapters return 403 on lesson access
- [ ] Lesson completion correctly updates all denormalized stats
- [ ] Streak calculation handles 4 AM boundary correctly
- [ ] Streak freezes are applied automatically
- [ ] Surah comprehension recalculates when vocabulary changes
- [ ] M6 (Surah Understood) triggers correctly at 100%
- [ ] SRS algorithm produces correct intervals
- [ ] Noor message limit enforced (429 on 6th message)
- [ ] Overage pack purchase increments balance correctly
- [ ] IAP receipt verification works for iOS and Android sandbox
- [ ] Webhook endpoints handle Apple and Google notifications correctly
- [ ] Rate limiting blocks excessive requests
- [ ] All endpoints reject unauthorized requests
- [ ] All endpoints validate input via Zod
- [ ] Database indexes are present and used (verify with EXPLAIN ANALYZE)
- [ ] Cron jobs execute on schedule
- [ ] Account deletion completes within 30 days
- [ ] All error codes return correct HTTP status codes

---

## Part 13 — Changelog

**2026-05-19 — v1.0**
- Complete database schema (22 models)
- All API endpoints specified with request/response shapes
- Authentication, authorization, and security defined
- Caching strategy locked
- Data flow patterns documented
- Error code catalog
- Database indexes specified
- Cron job schedule
- 23-item test plan

---

*End of File 12.*
*Next: File 13 — Technical & Infrastructure.*
