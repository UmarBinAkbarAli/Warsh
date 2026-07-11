# PRD: Warsh Curriculum Lesson Builder (v3 - Approval Draft)

> **Status:** Approval Draft - Section 7 canonical starter objects filled from repo sources. Build is gated on Phase 0 (shared schema package) before form work begins.
> **Core change from v1:** the builder is built from one shared executable schema, not from prose field descriptions. The mobile player reads `Lesson.content` field names directly (`discover_cards`, `exercises`, `correct_index`, `correct_answer`, ...), so the builder must never invent or approximate shapes.

---

## 0. Locked Decisions (read first)

These are binding constraints for the build. They are not open for re-litigation during implementation.

1. **Shared Zod schema is Phase 0, not Phase 4, and it is the SOURCE.** A single schema package defines every lesson/card/exercise shape. The Zod schemas are authored as the source of truth; TypeScript types are inferred and exported from them via `z.infer`, so static types and runtime validation cannot drift. `content-schema.ts` is reduced to re-exporting those inferred types. Any other duplicate schema files in the repo (e.g. `warsh-backend/lib/content-schema.ts` and `Docs/warsh-content-schema.ts`) must be generated from or re-export the Zod-inferred types - never hand-maintained in parallel. Backend (`PATCH /api/admin/lessons/:id`), seed scripts, the dashboard builder, the fixture validator (`validate-curriculum.cjs`), and eventually the mobile player all import this one package.

2. **Canonical JSON examples are mandatory.** Section 7 ships exact starter objects for all 5 v1 exercise types and all 5 discover card types, using the real field names from `content-schema.ts`, `play.tsx`, and seeded fixtures.

3. **Round-trip preservation is mandatory.** The builder keeps the original `content` object in state and mutates only `discover_cards` and `exercises`. Every other key (`schema_version`, `template`, `hook`, `reveal`, `close`, `spoken_phrases`, `conjugation_table`, and any unrecognized keys) is preserved on save. The serialized object is the original object with two arrays swapped in - never reconstructed from scratch. Untouched keys must be structurally identical (deep-equal) after save, not byte-identical.

4. **Lenient parse, strict save.** Old or non-conforming lessons must still open (loose parse so an author is never locked out). Saving must pass the shared schema. If a legacy lesson cannot be structurally parsed, fall back to raw JSON edit mode for that lesson.

5. **One editor source of truth.** The structured editor is canonical. The raw JSON view is a separate edit mode that re-parses into structured state only when explicitly applied. There is never a two-way live merge.

6. **Tight v1 scope.** 5 exercise types first, move up/down reorder first, no drag-and-drop in v1.

**Repo-derived rules (consequences of the above):**

7. **Exercise IDs are stable, and the backend owns uniqueness.** An existing exercise's `id` is immutable across edit, reorder, and save. New exercises (Add) and duplicates get a fresh `id`. The client starter factory generates a candidate id (cuid/nanoid), but the **backend is the final authority**: on save it validates global uniqueness across the entire curriculum and rejects collisions. The uniqueness check must exclude the exercise's own existing id - an unchanged id re-submitted in the same lesson during a normal save is not a collision. Duplicate is always treated as a new exercise - never a copy of the source id.

8. **Optimistic concurrency via `updatedAt` is in v1.** Add `updatedAt DateTime @updatedAt` to the `Lesson` model (additive, low-risk migration). Save sends the client's last-known `updatedAt`; the backend returns `409` if it no longer matches. This is locked, not optional - JSON-blob editing is too easy to clobber.

9. **One validator, never mirrored.** The shared schema package is the single source. `validate-curriculum.cjs` must IMPORT the compiled schema package, not reimplement or "mirror" its rules. Because the validator is CommonJS, the package must ship a CommonJS-compatible build (dual ESM/CJS output) so the `.cjs` file can `require()` it without module-format friction, and CI must build the package before the validator runs. Mirroring is prohibited because it recreates the drift this feature exists to remove.

---

## 1. Summary

Warsh has a backend dashboard that can edit chapter/lesson metadata and a lesson's `content` JSON directly. That is fine for maintenance but is not a practical authoring workflow for adding, editing, deleting, duplicating, or reordering teaching cards and practice cards inside a lesson.

This feature turns the dashboard into a structured **Warsh Curriculum Lesson Builder**. Authorized admins manage lesson content visually while the builder still saves to the existing `Lesson.content` JSON field - now governed by a shared, executable schema rather than raw-JSON convention.

The goal is safer, faster, non-engineer-friendly lesson authoring that cannot write content the mobile player cannot read.

## 2. Problem

Editing lesson content today means editing raw JSON, which risks:

- Broken JSON syntax.
- Valid JSON but invalid Warsh lesson structure.
- Needing to know the exact schema to add a discover card or exercise.
- Error-prone nested Arabic text, translations, options, and correct-index editing.
- Tedious manual delete/duplicate/reorder.
- Stakeholders unable to review lesson structure without reading JSON.

With hundreds of lessons and many exercise types, raw JSON does not scale as the primary authoring workflow.

## 3. Goals

- Add/edit/delete/duplicate/reorder discover cards and practice exercises without raw JSON.
- Type-specific forms for discover cards and practice exercises, driven by the shared schema plus a form-config registry.
- Validate lesson content against the shared schema before saving.
- Preserve raw JSON editing as an advanced fallback.
- Save into the current `Lesson.content` JSON field with no curriculum-model redesign.
- Reduce mobile lesson-player breakage caused by malformed content.
- Produce a content workflow reviewable by product, curriculum, and engineering.

## 4. Non-Goals

- No redesign of the student-facing lesson player (beyond it eventually importing the shared schema).
- No move away from `Lesson.content Json`.
- No AI auto-generation of full lessons.
- No immediate replacement of fixture-based seed files.
- No drag-and-drop in v1.
- No version history, approvals, or collaboration in v1 unless later-approved.

## 5. Current Warsh Context (repo facts)

- Dashboard: `warsh-backend/app/dashboard/DashboardClient.tsx`.
- Admin APIs: `GET /api/admin/content`, `PATCH /api/admin/chapters/:id`, `PATCH /api/admin/lessons/:id`.
- **Schema source of truth today:** TypeScript types in `content-schema.ts` (line 1). Phase 0 inverts this: Zod becomes the source and these types are inferred from it (Decision 1).
- **Mobile player consumes `Lesson.content` directly** in `play.tsx` (around line 247), reading raw field names (`discover_cards`, `exercises`, `correct_index`, `correct_answer`, ...). There is no shared validator/parser layer between content and player today.
- **Progress is tracked at lesson level, not per exercise**, in the completion route `route.ts` (line 1). Delete/reorder therefore does not break current learner progress - but IDs must still stay stable for validators and future analytics.
- **Fixture validation already checks exercise IDs, including global duplicates**, in `validate-curriculum.cjs` (around line 412). IDs must not be casually regenerated.
- **`Lesson` has no `updatedAt`.** Optimistic concurrency requires a small additive Prisma change (Decision 8).

Current `Lesson` model:

```prisma
model Lesson {
  id        String         @id @default(cuid())
  chapterId String
  order     Int
  title     String
  titleAr   String
  template  LessonTemplate
  xpReward  Int            @default(10)
  content   Json
  // v1 addition:
  updatedAt DateTime       @updatedAt
}
```

**Migration note:** existing rows have no `updatedAt`. Add the column with a `@default(now())` to backfill existing records safely in one migration, then keep `@updatedAt` so Prisma maintains it on every write. (A bare `@updatedAt` without a default would fail on a populated table.)

`Lesson.content` keys: `schema_version`, `template`, `hook`, `discover_cards`, `exercises`, `reveal`, `close`, `spoken_phrases`, `conjugation_table`. The two arrays this feature mutates: `discover_cards`, `exercises`. Everything else is preserved on save (Decision 3).

## 6. Architecture - Shared Schema Package (Phase 0)

Phase 0 is a prerequisite for any form work. The package (`@warsh/lesson-schema`) ships four artifacts:

1. **Zod schemas (the source):**
   - `LessonContentSchema` (top-level object).
   - `DiscoverCardSchema` as a discriminated union over `WORD | CONCEPT | EXAMPLE | CONTRAST | AYAH_PREVIEW`.
   - `ExerciseSchema` as a discriminated union over all 15 exercise types (v1 implements forms for 5; the schema covers all 15 so validation is complete from day one). Note: schema-valid is not the same as player-renderable, and neither is the same as v1 authoring scope - see the `playerSupported` and `authoringScope` gates in artifact 4.
   - `ArabicTextSchema` - the reusable Arabic text object (per v1: `ar`, `ar_plain`, `translit`, `en`, `ur`; verify exact fields and required/optional status against `content-schema.ts`).

2. **Inferred TypeScript types:** all consumer types come from `z.infer<typeof ...>`. `content-schema.ts` re-exports these. No hand-written interface duplicates the schema.

3. **Starter-object factory:** `createStarterCard(type)` / `createStarterExercise(type)` return a schema-valid default for each type. The Add flow (Section 8.6) uses this. No hand-written "approximate" object exists anywhere.

4. **Form-config registry:** Zod validates shape but does not describe a UI. A parallel `formConfig` registry (in this package or a sibling `@warsh/lesson-forms`) maps each type and field to UI metadata: label (EN, plus UR where relevant), input kind (`text` / `arabic` / `number` / `boolean` / `select` / `options` / `matching_pairs` / `tiles`), text direction (RTL/LTR), required flag, and the editor component for complex fields (option lists, matching pairs, sentence tiles). It also tracks two distinct, independent gates per type:
   - `authoringScope` - whether the structured Add picker offers the type (the approved v1 set is the 5 types in Section 8.5; a subset of what the player can render).
   - `playerSupported` - whether the current mobile player can render the type at all (a larger set than the v1 authoring scope).

   The builder renders forms from schema + formConfig. The Add picker only offers `authoringScope` types, but because raw JSON mode (Section 8.10) can bypass the picker, the real safety net is backend enforcement of `playerSupported` on save (Section 9).

**Consumers** import the package: backend save route, seeds, dashboard builder, and `validate-curriculum.cjs` (which imports the compiled output - Decision 9; build the package before the CJS validator runs). The mobile player import is tracked as a later migration.

**Definition of done for Phase 0:** every existing fixture lesson either parses against the schema or is explicitly listed as a known legacy exception handled by lenient parse (Decision 4).

## 7. Canonical Starter Objects

This section is filled from the repo, not from prose. Sources:

- Type contract: `Docs/warsh-content-schema.ts`
- Player field reads: `warsh-app/app/(app)/lessons/[lessonId]/play.tsx`
- Seeded fixture examples:
  - `WORD`, `CONCEPT`, and all five v1 exercises: `warsh-backend/prisma/fixtures/chapter-01-lesson-01.json`
  - `EXAMPLE`: `warsh-backend/prisma/fixtures/chapter-09-lesson-01.json`
  - `CONTRAST`: `warsh-backend/prisma/fixtures/chapter-01-lesson-02.json`
  - `AYAH_PREVIEW`: `warsh-backend/prisma/fixtures/chapter-09-lesson-02.json`

These objects define the canonical field names and nesting that `createStarterCard(type)` and `createStarterExercise(type)` must return. Exercise IDs shown as `ex_<generated>` are placeholders; the factory must generate a fresh candidate ID and the backend remains the final uniqueness authority.

```jsonc
// Shared ArabicText object
{
  "ar": "هَذَا",
  "ar_plain": "هذا",
  "translit": "hadha",
  "en": "this",
  "ur": "یہ"
}

// Discover card: WORD
{
  "type": "WORD",
  "text": {
    "ar": "هَذَا",
    "ar_plain": "هذا",
    "translit": "hadha",
    "en": "this",
    "ur": "یہ"
  },
  "image_url": "",
  "audio_url": "",
  "explanation": {
    "en": "Short explanation of the word.",
    "ur": "لفظ کی مختصر وضاحت۔"
  },
  "introduces_vocab": {
    "ar_plain": "هذا"
  }
}

// Discover card: CONCEPT
{
  "type": "CONCEPT",
  "concept": {
    "en": "Arabic concept name",
    "ar": "مَفْهُوم",
    "ur": "عربی تصور"
  },
  "explanation": {
    "en": "Short explanation of the concept.",
    "ur": "تصور کی مختصر وضاحت۔"
  },
  "examples": [
    {
      "ar": "هَذَا كِتَابٌ",
      "ar_plain": "هذا كتاب",
      "translit": "hadha kitabun",
      "en": "This is a book.",
      "ur": "یہ ایک کتاب ہے۔"
    }
  ]
}

// Discover card: EXAMPLE
{
  "type": "EXAMPLE",
  "text": {
    "ar": "هَذَا كِتَابٌ",
    "ar_plain": "هذا كتاب",
    "translit": "hadha kitabun",
    "en": "This is a book.",
    "ur": "یہ ایک کتاب ہے۔"
  },
  "explanation": {
    "en": "Short explanation of what this example demonstrates.",
    "ur": "یہ مثال کیا دکھاتی ہے اس کی مختصر وضاحت۔"
  }
}

// Discover card: CONTRAST
{
  "type": "CONTRAST",
  "concept": {
    "en": "Near vs far",
    "ar": "قَرِيب وَبَعِيد",
    "ur": "قریب اور دور"
  },
  "explanation": {
    "en": "Short explanation of the contrast.",
    "ur": "فرق کی مختصر وضاحت۔"
  },
  "examples": [
    {
      "ar": "هَذَا كِتَابٌ",
      "ar_plain": "هذا كتاب",
      "translit": "hadha kitabun",
      "en": "This is a book.",
      "ur": "یہ ایک کتاب ہے۔"
    },
    {
      "ar": "ذٰلِكَ كِتَابٌ",
      "ar_plain": "ذلك كتاب",
      "translit": "dhalika kitabun",
      "en": "That is a book.",
      "ur": "وہ ایک کتاب ہے۔"
    }
  ]
}

// Discover card: AYAH_PREVIEW
{
  "type": "AYAH_PREVIEW",
  "concept": {
    "en": "Concept in the Quran",
    "ar": "المفهوم في القرآن",
    "ur": "قرآن میں تصور"
  },
  "explanation": {
    "en": "Short explanation of how the concept appears in the ayah.",
    "ur": "آیت میں یہ تصور کیسے آتا ہے اس کی مختصر وضاحت۔"
  },
  "examples": [
    {
      "ar": "وَالْمُؤْمِنَاتُ",
      "ar_plain": "والمؤمنات",
      "translit": "wal-mu'minat",
      "en": "and the believing women",
      "ur": "اور ایمان والی عورتیں"
    }
  ]
}

// Practice exercise: TRUE_FALSE
{
  "id": "ex_<generated>",
  "type": "TRUE_FALSE",
  "xp_value": 1,
  "statement": {
    "en": "The word مَسْجِد means 'pen'.",
    "ur": "لفظ مسجد کا مطلب 'قلم' ہے۔",
    "ar_example": {
      "ar": "مَسْجِد",
      "ar_plain": "مسجد",
      "translit": "masjid",
      "en": "mosque"
    }
  },
  "correct_answer": false,
  "explanation_on_wrong": {
    "en": "مَسْجِد means 'mosque'. The word for 'pen' is قَلَم.",
    "ur": "مسجد کا مطلب مسجد ہے۔ قلم کے لیے لفظ قَلَم ہے۔"
  }
}

// Practice exercise: TAP_TRANSLATION
{
  "id": "ex_<generated>",
  "type": "TAP_TRANSLATION",
  "xp_value": 1,
  "prompt": {
    "ar": "هَذَا",
    "ar_plain": "هذا",
    "translit": "hadha",
    "en": "this"
  },
  "audio_url": "",
  "options": [
    { "en": "that", "ur": "وہ" },
    { "en": "this", "ur": "یہ" },
    { "en": "here", "ur": "یہاں" },
    { "en": "where", "ur": "کہاں" }
  ],
  "correct_index": 1,
  "explanation_on_wrong": {
    "en": "هَذَا points at something near.",
    "ur": "هَذَا کسی قریب چیز کی طرف اشارہ ہے۔"
  }
}

// Practice exercise: FILL_BLANK
{
  "id": "ex_<generated>",
  "type": "FILL_BLANK",
  "xp_value": 1,
  "mode": "TAP",
  "sentence_ar": "___ بَيْتٌ",
  "hint": {
    "en": "This is a house.",
    "ur": "یہ ایک گھر ہے۔"
  },
  "options": [
    {
      "ar": "كِتَابٌ",
      "ar_plain": "كتاب",
      "translit": "kitabun",
      "en": "book"
    },
    {
      "ar": "هَذَا",
      "ar_plain": "هذا",
      "translit": "hadha",
      "en": "this"
    },
    {
      "ar": "قَلَمٌ",
      "ar_plain": "قلم",
      "translit": "qalamun",
      "en": "pen"
    },
    {
      "ar": "مَسْجِدٌ",
      "ar_plain": "مسجد",
      "translit": "masjidun",
      "en": "mosque"
    }
  ],
  "correct_answer": {
    "ar": "هَذَا",
    "ar_plain": "هذا",
    "translit": "hadha",
    "en": "this"
  }
}

// Practice exercise: MATCHING
{
  "id": "ex_<generated>",
  "type": "MATCHING",
  "xp_value": 1,
  "left_column": [
    {
      "ar": "كِتَاب",
      "ar_plain": "كتاب",
      "translit": "kitab",
      "en": "book"
    },
    {
      "ar": "قَلَم",
      "ar_plain": "قلم",
      "translit": "qalam",
      "en": "pen"
    }
  ],
  "right_column": [
    { "en": "book", "ur": "کتاب" },
    { "en": "pen", "ur": "قلم" }
  ],
  "correct_pairs": [
    [0, 0],
    [1, 1]
  ]
}

// Practice exercise: BUILD_SENTENCE
{
  "id": "ex_<generated>",
  "type": "BUILD_SENTENCE",
  "xp_value": 1,
  "target_translation": {
    "en": "This is a book.",
    "ur": "یہ ایک کتاب ہے۔"
  },
  "tiles": [
    {
      "ar": "كِتَابٌ",
      "ar_plain": "كتاب",
      "translit": "kitabun",
      "en": "book"
    },
    {
      "ar": "هَذَا",
      "ar_plain": "هذا",
      "translit": "hadha",
      "en": "this"
    }
  ],
  "correct_order": [1, 0],
  "explanation_on_wrong": {
    "en": "In Arabic, هَذَا comes first, then the noun.",
    "ur": "عربی میں پہلے هَذَا آتا ہے، پھر اسم۔"
  }
}
```

Each filled object becomes the return value of the corresponding starter-object factory (Section 6, artifact 3) and the fixture used in schema unit tests.

## 8. Builder Behavior

### 8.1 Layout

**Lesson Stepper (within-chapter navigation):**
Above the Lesson Builder, a horizontal lesson tab bar shows all lessons in the selected chapter. Each tab displays: lesson number, English title, Arabic title. Tabs are clickable — clicking a tab loads that lesson's content into the builder. The active tab is visually distinct (highlighted background/border). When switching lessons with unsaved changes, a confirmation prompt appears.

**Add lesson:** "+ Lesson" button at the end of the tab bar. Opens a dialog to enter English title, Arabic title, and template type. On confirm, calls `POST /api/admin/chapters/:chapterId/lessons` and inserts the new lesson after the last position, then selects it. If the call fails, shows the error.

**Delete lesson:** "×" button on each tab (visible on hover or always visible for clarity). Requires confirmation showing lesson title and order number. On confirm, calls `DELETE /api/admin/lessons/:id` and removes the tab. If the lesson is the last one in the chapter, the delete is blocked with a warning ("A chapter must have at least one lesson"). After successful deletion, the previous (or next) lesson is auto-selected.

**Layout order:** Chapter selector → Lesson stepper → Lesson Metadata → Hook → Discover Cards → Practice Exercises → Reveal → Close → Advanced JSON. Raw JSON textarea remains available but is no longer the only editing method.

**v1 editability:** Discover Cards and Practice Exercises are fully editable. Hook / Reveal / Close are display-only in v1 (rendered read-only from the parsed content) and become editable in a later phase. They are still preserved on save regardless.

### 8.2 Round-trip and state model (Decisions 3, 5)

- On open: deep-clone `content` into `originalContent` (immutable reference) and `draftContent` (editable).
- The structured editor mutates only `draftContent.discover_cards` and `draftContent.exercises`.
- On save: `originalContent` with those two arrays replaced, then validate against the shared schema, then persist. No key is ever dropped; untouched keys remain deep-equal to the original.
- Raw JSON mode edits a text buffer; "Apply" re-parses it into `draftContent` (schema-validated) and warns if structured edits would be overwritten.

### 8.3 Parse behavior (Decision 4)

- Loose parse on open so legacy lessons render.
- If structural parse fails, that lesson opens directly in raw JSON mode with a banner.
- Strict schema validation only gates save, never open.

### 8.4 Discover Cards

List shows: card number, type, main Arabic/concept title, English summary, missing-required-field indicator. Per-card: Edit / Delete / Duplicate / Move up / Move down. Section: Add Discover Card, collapse/expand all. Types: `WORD`, `CONCEPT`, `EXAMPLE`, `CONTRAST`, `AYAH_PREVIEW`. Forms render from schema + formConfig (Section 6, artifact 4).

**Arabic text editor (reusable):** RTL input; enforces character-set guards - Arabic block for `ar` / `ar_plain`, Latin for `translit` - to catch the known Cyrillic-in-transliteration class of bug at input time.

### 8.5 Practice Exercises

List shows: number, exercise ID, type, prompt summary, XP, missing-field indicator. Per-exercise: Edit / Delete / Duplicate / Move up / Move down. Section: Add Practice Card, filter by type.

**v1 forms (5):** `TRUE_FALSE`, `TAP_TRANSLATION`, `FILL_BLANK`, `MATCHING`, `BUILD_SENTENCE`. These five come first because they are the approved v1 authoring scope, not because they are the only player-renderable types - the current player also has explicit handling for several others (e.g. `SHADOW_REPEAT`, `GRAMMAR_PARSE`, `CONVERSATION_BUILDER`) plus a fallback option-grid for some option-based exercises. The schema covers all 15 types so validation is complete; the remaining forms ship in later phases. Forms render from schema + formConfig.

### 8.6 Add flow

1. Type picker - lists only `authoringScope` types (the approved v1 set, Section 6 artifact 4). 2. Select type. 3. `createStarter*(type)` produces a schema-valid object. 4. For exercises, the factory generates a candidate `id` (cuid/nanoid); the backend confirms global uniqueness on save (Decision 7). 5. Form opens. 6. Save into `draftContent`. 7. Save lesson to persist.

### 8.7 Delete flow

Confirmation showing type + summary, remove from `draftContent`, final lesson save persists. (Undo-before-save: later phase.)

### 8.8 Duplicate flow

Copy, insert directly after original, assign a fresh candidate `id` for exercises (never copy the source id), mark unsaved, editable before save. Backend confirms uniqueness on save.

### 8.9 Reorder flow

Move up/down only in v1. Updates array order in `draftContent.discover_cards` / `draftContent.exercises`. Exercise `id`s are unchanged by reorder.

### 8.10 Advanced JSON view

Formatted JSON, direct edit, JSON-syntax + schema validation on Apply, unsaved-structured-changes warning (Decision 5).

## 9. Validation (shared schema)

All validation runs against `@warsh/lesson-schema`. There is no separately hand-maintained ruleset.

- **Blocking (cannot save):** invalid JSON; `content` not an object; `schema_version`/`template` missing; `template` mismatch with lesson; required sections missing for template; unknown card/exercise type; required per-type fields missing; `correct_index` / correct-answer indexes out of range; duplicate exercise `id` within the lesson, or a new/changed `id` that collides with one elsewhere in the curriculum (an exercise's own unchanged id is not a collision); `MATCHING` pair indexes invalid; `BUILD_SENTENCE` / `WORD_ORDER` order indexes invalid; a **newly added or edited** exercise of a `playerSupported: false` type (this is the raw-JSON safety net - the Add picker already prevents it in the structured UI, but raw JSON mode could otherwise smuggle one in).
- **Warnings (do not block):** unusual discover-card or exercise counts; low exercise-type variety; audio-required exercise missing `audio_url`; discover-card vocabulary not appearing in practice; a `playerSupported: false` type that was **already present in the existing saved content** and is left unchanged (permitted with an explicit warning rather than blocked, so legacy content is never locked out - consistent with lenient parse / strict save).

Backend reuses the same schema (Section 10.2). `validate-curriculum.cjs` imports the compiled schema package so CI and the dashboard enforce identical rules (Decision 9).

## 10. Data and API

### 10.1 Database

One additive change: add `Lesson.updatedAt` via `@default(now())` to backfill existing rows in a single migration, then keep `@updatedAt` (Decision 8, see migration note in Section 5). Otherwise still saving to `Lesson.content Json`.

### 10.2 Backend API

- `PATCH /api/admin/lessons/:id`: validate `content` against the shared schema; return structured field-level errors; enforce existing admin write protection; validate exercise-id uniqueness across the curriculum while excluding the exercises' own unchanged ids; block newly added/edited `playerSupported: false` exercise types while permitting unchanged pre-existing ones with a warning; reject with `409` if client `updatedAt` does not match current.
- `POST /api/admin/lessons/validate`: validate a draft without saving (same schema), for the "Validate lesson" button.

### 10.3 Frontend state

Selected chapter/lesson, `originalContent`, `draftContent`, dirty flag, last-known `updatedAt`, validation errors, active card/exercise editor, raw JSON buffer + mode flag.

## 11. Permissions and Security

Existing admin write protection. Only authorized admins save; read-only viewing follows current dashboard behavior; admin-token behavior unchanged; validation errors expose no secrets; raw JSON view must not allow script execution in dashboard rendering.

## 12. UX

Dense and practical, not marketing-style. Author always knows which chapter and which lesson is open; lesson stepper clearly shows lesson number, English title, and Arabic title on each tab; unsaved changes are obvious; explicit add/edit/duplicate/delete/move buttons; forms show only fields for the selected type; Arabic inputs are RTL; long cards collapse; validation points to the exact card/exercise and field; save disabled or warned on blocking errors.

**Within-chapter lesson navigation:** The lesson stepper bar is the primary way to switch between lessons in the same chapter. It sits directly below the chapter selector, above the lesson builder. Clicking a tab loads that lesson immediately. Tabs display: `Lesson N — "Title" / "Arabic title"`. Active tab is highlighted. Hovering (or always showing) the "×" button on each tab allows deletion. "+ Lesson" button at the end appends a new lesson.

**Unsaved-changes guard:** Switching lessons with dirty state (unsaved discover cards or exercises) prompts the author to save or discard before switching.

**Add lesson UX:** Dialog with English title, Arabic title, template selector. Primary "Add" button, "Cancel" secondary. Dialog closes on success and auto-selects the new lesson.

**Delete lesson UX:** Confirmation dialog showing "Delete Lesson N: [title]? This cannot be undone." Blocked if it would leave the chapter empty. On confirm, API call, tab removed, adjacent lesson selected.

Layout: chapter selector → lesson stepper (tabs + add + delete) → main area (builder sections) → inline panel (selected card/exercise form) → status area (validation + save).

## 13. Revised Rollout

- **Phase 0 - Shared schema package (prerequisite):** author Zod schemas as the source; infer + export TS types and re-export them from the duplicate schema files (`warsh-backend/lib/content-schema.ts`, `Docs/warsh-content-schema.ts`) instead of hand-maintaining them; ship a dual ESM/CJS build; starter-object factory; formConfig registry with `playerSupported` flags; migrate `validate-curriculum.cjs` to require the compiled package (build it before the validator runs in CI); add `Lesson.updatedAt` with `@default(now())` backfill; fill Section 7 canonical objects; schema unit tests over existing fixtures.
- **Phase 1 - Builder foundation + lesson navigation:** parse content into structured state (lenient); show Hook/Discover/Exercises/Reveal/Close (Hook/Reveal/Close read-only); keep raw JSON; round-trip preservation; dirty tracking; JSON + schema validation; **lesson stepper (within-chapter tab navigation)**; add lesson via `POST /api/admin/chapters/:chapterId/lessons`; delete lesson via `DELETE /api/admin/lessons/:id` (blocked if last lesson in chapter); unsaved-changes guard when switching lessons.
- **Phase 2 - Discover card builder:** list + add/edit/delete/duplicate/move; all 5 card types; reusable Arabic editor with character-set guards.
- **Phase 3 - Practice exercise builder (5 core types):** `TRUE_FALSE`, `TAP_TRANSLATION`, `FILL_BLANK`, `MATCHING`, `BUILD_SENTENCE`; ID stability + backend-confirmed global uniqueness.
- **Phase 4 - Validation surfacing:** frontend + backend wired to shared schema; "Validate lesson" button; `409` concurrency handling; blocking vs warning UX.
- **Phase 5 - Remaining 10 exercise forms + template sections** (`SPOKEN_PHRASES`, `VERB_PATTERN`, `REVIEW`); make Hook/Reveal/Close editable.
- **Phase 6 - Preview and QA:** lesson preview, test link to player route, card-level QA checklist; optional drag-and-drop.

## 14. Acceptance Criteria (v1)

- `@warsh/lesson-schema` exists, is the source of types (TS inferred from Zod), and is imported by backend, seeds, dashboard, and the fixture validator.
- All existing fixture lessons either validate or are listed as known lenient-parse exceptions.
- Admin can open a lesson; discover cards and exercises show as structured lists.
- Admin can navigate between lessons within the same chapter via the lesson stepper; switching with unsaved changes prompts to save or discard.
- Admin can add a new lesson to a chapter ("+ Lesson" button); it appears in the stepper and is immediately selectable.
- Admin can delete a lesson ("×" on tab); deletion is blocked if it would leave the chapter with zero lessons; successful deletion selects the adjacent lesson.
- Admin can add/edit/delete/duplicate/reorder discover cards without raw JSON.
- Admin can add/edit/delete/duplicate/reorder the 5 v1 exercise types without raw JSON; duplicates get fresh IDs; existing IDs never change; the backend rejects id collisions while accepting an exercise's own unchanged id.
- The Add picker only offers the approved v1 authoring set; and a `playerSupported: false` type introduced via raw JSON is rejected by the backend on save (unchanged pre-existing ones pass with a warning).
- Saved data is structurally identical (deep-equal) for all untouched keys.
- Invalid JSON and critical schema errors cannot be saved.
- Concurrent-edit save is rejected with a clear "lesson changed since you opened it" message.
- Existing chapter/lesson metadata editing still works; raw JSON fallback still exists.

## 15. Risks

- Filling Section 7 wrong (fabricated fields) would reintroduce the core failure mode - mitigated by sourcing strictly from `content-schema.ts` / `play.tsx`.
- Legacy lesson shape variations - mitigated by lenient parse + a listed exception set.
- Over-strict schema blocking valid-but-imperfect legacy content - mitigated by the warnings vs blocking split and the exception list.
- Player not yet importing the schema means a transient window where player and builder can diverge - mitigated by tracking the player migration explicitly.

## 16. Open Questions (remaining)

Most v1 questions are resolved by Section 0. Still open for your call:

1. Should saves also update fixture JSON files, or DB-only in v1?
2. Can admins create brand-new lessons in v1, or edit-only?
3. Is lesson preview v1 or Phase 6?
4. Exercise `id` format - adopt the existing seed convention as-is, or standardize (e.g. `ex_<cuid>`) during Phase 0?

## 17. Recommended Approval

Approve as **Warsh Curriculum Lesson Builder v1**, gated on completing Phase 0 (shared schema package) before form work begins. Section 7 canonical starter objects are now filled from repo sources.
