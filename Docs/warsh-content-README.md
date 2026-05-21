# Warsh Content Schema — How to Use

This bundle contains two files that let you build the Warsh app **without authoring real lesson content first**.

| File | Purpose |
|---|---|
| `warsh-content-schema.ts` | The TypeScript contract every lesson's JSON content must follow. Import these types into both your backend and your Expo app. |
| `chapter-01-lesson-01.json` | One fully-authored mock lesson (Chapter 1, Lesson 1 — هَذَا). Use as development fixture and as the authoring reference for future lessons. |

---

## How this fits into the Warsh architecture

Per File 12 (Data Model & API), your `Lesson` table has these JSON fields:

```prisma
hook                Json?
discover_cards      Json?
exercises           Json?
reveal              Json?
close               Json?
spoken_phrases      Json?
conjugation_table   Json?
```

The schema in `warsh-content-schema.ts` defines exactly what shape goes into those fields. The full `LessonContent` interface bundles them all together.

**There are two valid storage approaches and you should pick one upfront:**

### Approach A — Store the whole `LessonContent` blob in one column

Add a single column to `Lesson`:

```prisma
content  Json  // type: LessonContent
```

…and ignore (or remove) the individual `hook`, `discover_cards`, etc. columns.

**Pros:** Simpler. One round-trip to read a lesson. JSON schema validation in one place.
**Cons:** Diverges from the v1.0 spec slightly.

### Approach B — Keep individual columns as the spec defines

Split `LessonContent` across the existing columns at write time, reassemble at read time.

**Pros:** Matches File 12 v1.0 exactly. Allows querying individual beats (e.g. "all hooks that reference Surah 1").
**Cons:** More moving parts. More care needed in seeding.

**Recommendation:** Approach A. Cleaner. Re-reading is the only common operation; querying individual beats isn't in any user-facing flow. If File 12 needs updating, that's a minor migration.

---

## How to use during app development

### 1. Drop both files into your Next.js backend

```
/apps/api/src/content/
  warsh-content-schema.ts
  fixtures/
    chapter-01-lesson-01.json
```

### 2. Use the schema everywhere

```ts
// In your API route
import type { LessonContent } from '@/content/warsh-content-schema';
import lesson_ch01_l01 from '@/content/fixtures/chapter-01-lesson-01.json';

const lesson: LessonContent = lesson_ch01_l01 as LessonContent;
```

### 3. Add Zod validation (highly recommended)

The TypeScript types catch errors at compile time but won't validate JSON at runtime. Generate a Zod schema from the types (or hand-write one) and validate every lesson at seed time:

```ts
import { lessonContentSchema } from './validators';

const parsed = lessonContentSchema.parse(rawJson);
// If invalid, you'll get a clear error message naming the field
```

This catches bad content authoring before it hits the database.

### 4. Seed it into PostgreSQL

```ts
// prisma/seed.ts (excerpt)
import lesson_ch01_l01 from './fixtures/chapter-01-lesson-01.json';

await prisma.lesson.create({
  data: {
    chapter_id: chapter1.id,
    order: 1,
    template: 'STANDARD',
    title_en: 'First Encounter with هَذَا',
    title_ar: 'اللقاء الأول مع هَذَا',
    xp_reward: 10,
    estimated_minutes: 7,
    hook: lesson_ch01_l01.hook,
    discover_cards: lesson_ch01_l01.discover_cards,
    exercises: lesson_ch01_l01.exercises,
    reveal: lesson_ch01_l01.reveal,
    close: lesson_ch01_l01.close,
    is_published: true,
  },
});
```

### 5. Build the Expo lesson player against this one lesson

The mock lesson exercises 6 of the 15 exercise types intentionally:

- `TAP_TRANSLATION` (×2) — most common, build first
- `MATCHING` — pair UI
- `BUILD_SENTENCE` — tile UI
- `FILL_BLANK` (TAP mode) — option-pick UI
- `TRUE_FALSE` — simplest

Build the player to handle these six first. Add the other nine (`SHADOW_REPEAT`, `WRITE_ARABIC`, `GRAMMAR_PARSE`, etc.) as you author lessons that need them.

### 6. Fake more content with TypeScript

For testing the lesson player end-to-end, copy `chapter-01-lesson-01.json` and tweak it to make 3–5 variations. You don't need real curriculum content to test that:

- The 5-beat flow plays correctly
- Retry queue works
- XP accumulates
- Lesson completion fires
- All exercise types render

---

## Field-by-field reference (quick)

### Every lesson has:

- **`schema_version`** — `"1.0"` always for now. Bump on breaking changes.
- **`template`** — one of `STANDARD`, `SPOKEN_PHRASES`, `REVIEW`, `VERB_PATTERN`.
- **`hook`** — opening ayah + optional Noor intro.
- **`close`** — closing Noor message.

### STANDARD / REVIEW / VERB_PATTERN lessons also have:

- **`discover_cards`** — 4–8 cards. Each is a `WORD`, `CONCEPT`, `EXAMPLE`, `CONTRAST`, or `AYAH_PREVIEW` card.
- **`exercises`** — 5–10 exercises. Each is one of the 15 types, discriminated by `type`.
- **`reveal`** — the Quranic ayah demonstrating the concept, with word highlights and Noor's explanation.

### VERB_PATTERN lessons additionally have:

- **`conjugation_table`** — root, pattern name, conjugation rows.

### SPOKEN_PHRASES lessons instead have:

- **`spoken_phrases`** — scene, ~10 phrases, optional dialogue script. No `discover_cards`/`exercises`/`reveal`.

---

## What's NOT in this schema (intentionally)

These live in other tables in your Prisma schema, not in lesson content JSON:

- **VocabularyWord rows** — words live in their own table; lessons reference them via `introduces_vocab.word_id`.
- **Surah text and word-by-word breakdowns** — lives in `Surah` and `SurahWord` tables.
- **User progress, XP balances, streaks** — `LessonProgress`, `User`, etc.
- **Audio file URLs** — these point to R2 (Cloudflare), but the actual files aren't part of the schema.

Lesson content is just the **teaching content**. Everything else hangs off it.

---

## Authoring future lessons

When you're ready to author Chapters 2–72 (yourself or via hired authors), the process is:

1. Copy `chapter-01-lesson-01.json`
2. Fill in the new content
3. Run Zod validation
4. Commit
5. Re-run seed script

You can author lessons in batches. Each lesson is fully self-contained — no inter-lesson dependencies in the JSON (other than `introduces_vocab.word_id` references to the VocabularyWord table).

A rough authoring time per lesson: **45–90 minutes** for a skilled author who knows the curriculum. The total content workload for 72 chapters is real, but it can be done concurrently with app development, in parallel by multiple authors, or chapter-by-chapter as the app grows.

---

## Questions this schema doesn't answer (yet)

Things to decide before content authoring begins in earnest — none of them block app development:

1. **Audio file naming convention.** The mock uses `https://cdn.warsh.app/audio/vocab/{ar_plain}.mp3`. Lock the convention before generating 600 vocab audio files.
2. **Image generation pipeline.** Each `DiscoverCard` of type `WORD` references an `image_url`. Per File 11, these are illustrated in a specific parchment-tone style. Decide: AI-generated (Midjourney/your custom GPT) vs. hand-illustrated vs. mixed.
3. **Translation review.** Urdu translations in lessons should be reviewed by a native Urdu speaker before launch. The mock's Urdu is reasonable but not native-author-quality.
4. **Schema version bumps.** When you eventually need to add a 16th exercise type or change a beat's shape, bump `schema_version` from `"1.0"` to `"1.1"` and run a migration to update old content.

---

## Bottom line

You can build the entire Warsh app — every screen, every interaction, the full lesson player, the vocabulary bank, the Tadabbur UI, Noor chat — using only the schema in `warsh-content-schema.ts` and the one fixture in `chapter-01-lesson-01.json`.

Real content for Chapters 1–72 is a parallel workstream you can start any time after the app is functional. It does not block the build.

Build the engine. Content fills in over time.
