# Content editing safety

How to change chapters, lessons, and discover cards without destroying learner
progress or silently breaking media.

Written for the curriculum upgrade pass: adding and removing lessons across
existing chapters, and adding/removing discover cards inside lessons.

## The one rule that explains everything

`Progress` is **lesson-level only** (`warsh-backend/prisma/schema.prisma:221`).
One row per `(userId, lessonId)` holding `completed`, `status`, `score`,
`attempts`, `xpEarned`. There is no per-card, per-exercise, or per-block state
anywhere.

Two consequences:

- Anything **inside** `Lesson.content` is free to change. No progress row
  references it.
- Anything that **changes the set of lesson rows** is dangerous, because
  progress is keyed on `lessonId` and chapter completion is counted against the
  number of published lessons.

## Risk table

| Change | Progress impact | What else to do |
| --- | --- | --- |
| Edit card/exercise text, translations, images | None | Nothing |
| Add discover cards | None | Generate audio for new Arabic |
| Delete discover cards | None | Prune orphaned audio later |
| Change Arabic text anywhere | None | **Must** regenerate audio |
| Add a lesson to a chapter | **Re-locks the next chapter** for users who had completed it | Draft → publish → backfill |
| Unpublish a lesson (status → DRAFT) | None | Preferred way to "delete" |
| Delete a lesson row | **Progress rows deleted** | Never do this |
| Reorder / renumber lessons | Can orphan progress via seed cleanup | Avoid; unpublish + add instead |
| `npm run db:seed` | Wipes vocabulary + Tadabbur progress | Never on production |

## Discover cards — safe, edit freely

Discover cards live in the `discover_cards` array inside `Lesson.content` JSON
(`packages/lesson-schema/src/schemas/lesson.ts:29`). Adding six cards to one
lesson and deleting four from another changes a single JSON column. No progress
row is touched, no chapter count changes, nobody is re-locked.

The only follow-up is media:

```powershell
cd warsh-backend
npm run audio:audit-catalog:db      # which Arabic strings have no audio
npm run audio:prebuild-catalog:db   # generate the missing clips
```

Lesson audio is keyed by a sha256 of the Arabic text with **no generation
fallback at runtime**. A new card, or one edited harakah in an existing card,
means that clip does not exist — the play button does nothing, with no error in
the app, no Sentry event, and no failed request. Always run the audit after an
editing session.

Discover images must be WebP at 768px; the upload route enforces it.

## Adding lessons to an existing chapter

This is the change that cost progress before. The mechanism, in
`warsh-backend/lib/course.ts:56`:

```
isCompleted               = completedLessonCount === chapter.lessons.length
isSatisfiedForProgression = completed + skipped === chapter.lessons.length
isLocked                  = !allPreviousChaptersSatisfied
```

A user who completed all 8 lessons of Chapter 3 has 8 completed of 8. Publish a
9th and they are 8 of 9 — Chapter 3 stops being satisfied, and **every chapter
after it re-locks**. Their rows were never deleted, but the app looks like their
progress vanished.

`getUserCourseState` only counts `status: "PUBLISHED"` lessons
(`warsh-backend/lib/course.ts:80`), which is what makes a safe rollout possible.

### Procedure

**1. Author as DRAFT.** New lessons start `DRAFT` and are invisible to the
learner app and excluded from `lessons.length`. Nothing is re-locked while you
work, so you can take as long as you need.

**2. Verify on staging.**

```powershell
.\start-warsh-staging.ps1      # without -RefreshContent — see the landmine below
```

**3. Publish the whole chapter's new lessons in one batch**, not one at a time.
Each publish shifts the denominator, so a trickle of publishes means repeated
lock/unlock churn for live users.

**4. Backfill immediately after publishing.** For every user who had already
completed the chapter, insert `SKIPPED_BY_PLACEMENT` progress rows for the newly
published lessons. That status counts toward `isSatisfiedForProgression` but not
toward `isCompleted`, so the chapter stays unlocked and the new lessons stay
available to anyone who wants them.

`warsh-backend/scripts/backfill-skipped-progress.cjs` does exactly this — but
**one account at a time** (`--email` / `--user-id`), which is fine for your own
test accounts and not for a live rollout. See "Known gap" below.

Steps 3 and 4 must be close together. The window between them is the window in
which real users see their map re-locked.

## Removing lessons — unpublish, never delete

Set `status` to `DRAFT` instead of deleting the row.

- Progress rows survive untouched.
- The lesson disappears from the learner app.
- `lessons.length` drops, so a user who completed the remaining lessons is now
  complete again — chapters unlock rather than lock.

Deleting the row instead takes its progress with it, and the XP and completion
history are unrecoverable.

## The seed landmine

`cleanupObsoleteAuthoredLessons` (`warsh-backend/prisma/seed.cjs:491`) deletes
**every lesson row in a seeded chapter whose id is not in the hardcoded array in
`seed.cjs`** — which includes every lesson you author in Warsh Studio.

It tries to migrate progress first, but only when a stable lesson occupies the
same `chapterId:order`. Otherwise the progress rows are simply deleted
(`warsh-backend/prisma/seed.cjs:557`).

So during this upgrade:

- **Never run `npm run db:seed` against production.** Already a standing rule;
  this makes it sharper, because now you have Studio-authored lessons to lose.
- **`.\start-warsh-staging.ps1 -RefreshContent` runs the seed**
  (`start-warsh-staging.ps1:72`). Use it to reset staging to the seeded
  baseline, never after authoring new lessons in staging Studio.
- If a new lesson is meant to be permanent, add it to `seed.cjs` with a stable
  id (`ch03-l09`) as well as to the fixtures. Stable ids are what make progress
  survive.

The full seed also unconditionally runs `vocabularyWord.deleteMany()`,
`userVocabularyWord.deleteMany()`, `tadabburSurah.deleteMany()` and
`userSurahProgress.deleteMany()` even when users exist
(`warsh-backend/prisma/seed.cjs:602`). Vocabulary and Tadabbur progress are
destroyed and every word gets a new id, stranding its R2 audio and images.
Recovery path is in `AGENTS.md`.

## After any editing session

```powershell
cd warsh-backend
npm run content:check             # exits 1 while Studio edits are missing from Git
npm run content:export            # pull them into prisma/fixtures
npm run db:validate-fixtures
npm run audio:audit-catalog:db
npm run audio:prebuild-catalog:db
npm run media:prune-orphans       # only once the edits are settled
git add -A && git commit
```

`content:sync` updates lessons in place by id
(`warsh-backend/scripts/sync-lesson-content.ts:202`), so publishing fixture
edits is safe for progress. It refuses to run while the database holds
unexported Studio work — let it refuse rather than forcing it.

## Client-side cache note

`warsh-app/services/chapterPrefetch.ts` writes a per-chapter "already
prefetched" marker with no TTL and no content version. A device that prefetched
a chapter before your edit will not re-warm its media. Content still renders
correctly — media is fetched live on miss — but the first play of a new card may
be slow on existing installs. Not a correctness bug, and not worth blocking a
release.

## Known gap

There is no all-users backfill. `backfill-skipped-progress.cjs` handles one
account, and a naive "mark every missing lesson skipped for everyone" would
wrongly unlock content for users mid-chapter. The correct rule is per chapter:
only backfill users who had completed **every previously published lesson in
that chapter**, and only for the lessons published in this batch.

Until that script exists, adding lessons to chapters that live users have
already completed will re-lock their map.
