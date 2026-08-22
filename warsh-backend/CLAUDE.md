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
```

Invariants:

- Import Prisma from `lib/prisma.ts`; never construct `PrismaClient` in a route.
- `Lesson.content` is JSON validated by `@warsh/lesson-schema` — the same package for admin writes and fixture validation. Never add a second schema (including in `Docs/`).
- `lib/course.ts` is authoritative for chapter unlocking/completion; locking, trial/subscription access, and admin checks are enforced server-side.
- Streak days run 04:00 PKT → 03:59:59 PKT via `lib/date.ts`; completion, daily goals, freezes, and the reset cron must all use that boundary.
- Content review (`LessonContentReview`, `ContentReviewIssue`) stays separate from `Lesson.content`; flagging never edits learner-facing lessons.
- Google sign-in: provider ID token is identity proof only, then Warsh issues its own JWT; `googleSubject` is the durable key — a matching email alone never links accounts.
