# warsh-backend

Commands (run from inside this directory):

```powershell
npm run dev
npm run build                  # prisma generate && next build
npm test                       # tsx --test tests/**/*.test.ts
npx tsx --test tests/streak.test.ts     # single test file
npm run db:generate; npm run db:migrate; npm run db:seed
npm run db:validate-fixtures   # validate prisma/fixtures against @warsh/lesson-schema
npm run db:audit-urdu

npm run content:check          # is the fixture mirror behind the database?
npm run content:export         # pull Studio edits back into prisma/fixtures
npm run content:sync           # publish fixture edits to the database
npm run content:baseline       # adopt the current DB state as the agreed baseline
```

Invariants:

- Import Prisma from `lib/prisma.ts`; never construct `PrismaClient` in a route.
- `Lesson.content` is JSON validated by `@warsh/lesson-schema` — the same package for admin writes and fixture validation. Never add a second schema (including in `Docs/`).
- `lib/course.ts` is authoritative for chapter unlocking/completion; locking, trial/subscription access, and admin checks are enforced server-side.
- Streak days run 04:00 PKT → 03:59:59 PKT via `lib/date.ts`; completion, daily goals, freezes, and the reset cron must all use that boundary.
- Content review (`LessonContentReview`, `ContentReviewIssue`) stays separate from `Lesson.content`; flagging never edits learner-facing lessons.
- Warsh Studio is the authoring surface, so the database is the source of truth for `Lesson.content` and `prisma/fixtures/` is its versioned mirror. `prisma/lesson-sync-baseline.json` records the hash at the last point the two agreed, which is what lets `content:export` and `content:sync` tell a Studio edit from a Git edit. Never push fixtures over the database without `content:check` passing first.
- Lesson audio is keyed by a sha256 of the Arabic text and runtime lookup has no generation fallback, so editing Arabic text orphans its clip. `lib/audioTargets.ts` defines which strings need audio for both the generator and the content-health scan; regenerate with `npm run audio:prebuild-catalog -- --from-db`.
- Google sign-in: provider ID token is identity proof only, then Warsh issues its own JWT; `googleSubject` is the durable key — a matching email alone never links accounts.
