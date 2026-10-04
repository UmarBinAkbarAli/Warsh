# Core 500: three ayah examples and five-word set tests

Status: Implemented; production API, migration, example content and web deployed on 2026-10-04. Google Play release pending; production browser test completion blocked by a Vercel Security Checkpoint during verification.
Date: 2026-10-04.

The owner authorized work on Core 500 only. On 2026-10-04, the owner explicitly
kept the Pen review requirement while restoring Pencil. After reviewing the
prepared design, the owner explicitly said "start implementation" on 2026-10-04.
That approval covers this Core 500 change only.

The design is now prepared in the open Warsh Pen canvas as section
`32 — Core 500 · Ayah Examples & Set Tests · Proposed` (header node `eju4S`).
Nine screens cover learning, expanded examples, test intro, test questions,
missed-word practice, completion, Urdu, resuming practice and desktop web.
Preview images are exported separately for review. The Pencil tool has no
document-save operation; save the open Pen document in Pencil before closing it.
The feature code, additive migration, content pipeline and Studio review screen
are implemented and deployed. The production rollout and verification limits
are recorded below; the full production seed was never run.

## Required Pen review

Add a separate Core 500 section to `warsh-app/warsh-app-UI-v2.pen`, preserving
all existing sections and uncommitted edits. Review these states together:

1. Word card: Arabic, existing word audio and English/Urdu meaning; one ayah
   example visible with two more expandable. Each example includes the actual
   occurrence highlighted in canonical Arabic, translation and Surah/ayah
   reference. Ayahs have no transliteration; any recitation uses human audio.
2. Last word: primary action starts the set test instead of completing the set.
3. Test: five meaning questions, one per word; shuffled, unambiguous choices;
   question progress; answer selection; submission loading and retryable errors.
4. Result requiring practice: show missed words with their correct meanings,
   review them and retry only those questions. Previously correct answers stay
   credited within the server-owned assessment session. Completion requires
   all five words to be answered correctly, possibly across retry rounds.
5. Passed result: confirmed set completion, coverage and the existing streak
   outcome. Next-set action respects server unlocking; the final set has a
   course-finished action rather than a nonexistent set 101.
6. Interrupted session: reopen the set with saved assessment progress, without
   losing existing completed sets or claiming success before server confirmation.
7. Existing completed set: examples and optional practice, preserving completion
   and providing no additional progress or repeated streak credit.
8. Narrow Android, desktop web and Urdu states, including expanded examples.

The owner approved the all-five-correct/retry flow and authorized implementation
after the Pen design review, as required by AGENTS.md.

## Diagnosis before this change

- Sets already contain five words, with 100 sets partitioning ranks 1-500.
- `GET /api/core500/sets/[setNumber]` returns word data without ayah examples.
- The Core 500 card screen submits `knownWordIds` after the final card. There
  is no assessment. Its summary ignores the backend's `completed` boolean.
- Legacy completion compares the submitted array length to set size without
  deduplicating accepted word IDs. Distinct IDs must decide completion.
- `VocabularyWord.quranicExample` is a single JSON object used by Vocabulary
  word detail, topics and review. It cannot be converted to an array safely.
- Vocabulary rows and `UserVocabularyWord` SRS state are shared with Tadabbur.
- Core 500 coverage currently uses vocabulary repetitions >= 1; Tadabbur
  mastery uses >= 3. Assessment retries must not increment repetitions.
- Core completion calls the existing shared streak helper. The feature remains
  free for signed-in users and separate from lesson/chapter progress.

## Proposed implementation boundaries

### Content

Add a `Core500AyahExample` model linked to the existing vocabulary ID. Store
Surah/ayah numbers, canonical Arabic, English/Urdu translations, display order,
the actual surface form and verified highlighting coordinates, source metadata,
and review state. Enforce unique verse references per word and example order.
Only reviewed examples may reach learners.

Use linguistic lemma/segment identity to find candidate occurrences. Simple
harakat-stripped substring matching cannot distinguish near-pairs or reliably
handle prefixes, plurals and conjugated verbs. Match the exact token/segment
against the canonical text used for display before saving highlighting offsets.

Build candidates through a dedicated Core 500 script with dry-run and explicit
apply modes. Validate three distinct reviewed examples for all 500 words: 1,500
word-to-ayah links. Multiple words may share a verse. Report unresolved words
or linguistic ambiguities for human review; never invent examples or silently
substitute a different word with the same root. Review translations together
with the meaning taught by the word card.

Author and review this collection through a dedicated Core 500 Studio surface
and routes. Preserve the existing vocabulary editor and `quranicExample` object.
The content-readiness check must be separate from the existing 500-word readiness
check so unfinished enrichment cannot hide the currently working feature.

### Assessment

Add a Core 500 assessment-session model with a cascading relation to User. Keep
it separate from lesson assessment content and SRS. Persist question IDs, word
IDs, localized options, private correct-option keys, credited words, attempt
rounds and completion timestamps. Snapshot options so later Studio edits do
not invalidate an in-progress assessment. Prevent ambiguous answer options in
either teaching language; prefixes need suitable meaning choices.

Add dedicated start/resume and submit endpoints under the Core 500 set route.
Authenticate and enforce set unlocking on every operation. Return public question
data only; never expose private keys in the question response. Validate session
ownership, set membership, distinct question IDs, required answers and option
bounds. Reject out-of-set IDs and forged scores. Submit selected option IDs only.

Grade on the server and retain credited words for missed-question retry rounds.
Atomically claim an ungraded round before recording answers; duplicate requests
return its stored outcome. On the first confirmed pass, complete the Core set
and apply the existing streak rule in the same transaction. Concurrent sessions
must not double-credit completion or rewrite its original timestamp. Existing
completed sets remain complete regardless of practice results.

Initialize missing vocabulary-review rows using the existing first-exposure
policy. Never overwrite an existing ease factor, interval, next-review date,
favorite/hidden state or mature repetition history. Do not silently change the
shared coverage/mastery definitions. Validate how pre-existing zero-repetition
rows are represented before finalizing Core assessment coverage behavior.

### Client

Keep learning, assessment, remediation and completion within the Core 500 routes.
Use feature-specific API/types/components where practical. Add only Core 500
translation keys to the existing English and Urdu dictionaries. Reuse theme
tokens, ArabicText, BrandButton, WebShell and existing audio utilities without
changing their shared implementations. New learner prose must follow the app's
direction-mark convention on Android.

Successful card browsing does not invoke the legacy completion endpoint in the
new flow. Render completion only from the server-confirmed assessment result.
Retain recoverable session state on network failure and fetch current progress
after successful submission before showing the next-set action.

## Scope of file changes after approval

- `warsh-app/app/(app)/core-500/` only for learner screens.
- New Core 500-specific client services/types/components as needed.
- `warsh-app/i18n/en.ts` and `ur.ts`: additive Core 500 keys only.
- `warsh-backend/app/api/core500/` for content and assessment APIs.
- New Core 500-specific backend domain helpers and tests.
- New Core 500 Studio page/admin endpoints for example review.
- `warsh-backend/prisma/schema.prisma`: additive Core relations/models only,
  with a new migration; no rewrite of existing vocabulary or progress rows.
- New Core 500 content preparation/import/validation scripts and data mirror.

Do not edit chapter fixtures, curriculum proposals, lessons, Tadabbur, SRS,
auth, subscriptions, public pages, shared theme/components, release versions,
or other developers' work. Inspect current diffs again immediately before edits;
apply narrow patches rather than replacing shared files. Do not stage or commit
another developer's changes. Avoid production deployment from the mixed working
tree, because Vercel deploys every working-tree change.

## Compatibility and rollout

1. Generate and migrate additive models on an isolated loopback database. Do not
   reset an existing staging database or run the seed while others are using it.
2. Review pilot content for ordinary particles/nouns, verbs and attached prefixes.
3. Deploy compatible new backend endpoints before enabling the updated clients.
4. Keep the existing response shape and legacy completion endpoint available
   for installed APKs during the transition. Its distinct-ID validation can be
   fixed within Core 500 without changing its supported request contract.
5. Enable the new client flow only when the backend reports supported assessment
   and reviewed example readiness. Define the old-server behavior explicitly.
6. Preserve all historical completion and unlocking. Retire legacy completion
   separately through the supported-client version policy; do not strand APKs.
7. Promote reviewed example content through the scoped Core 500 importer. Never
   run the full production seed, reload word IDs or replace existing media keys.

## Verification before release

- Every Core rank maps to the same existing word ID and five-word set.
- Each word has exactly three distinct reviewed ayah references; text,
  translations, occurrences and highlighting agree.
- Incorrect, incomplete, duplicate and out-of-set answers cannot complete a set.
- Retry rounds test missed words; resume survives restart and language handling
  is consistent with the saved question snapshot.
- Duplicate/concurrent submissions do not repeat completion or streak credit.
- Existing completed sets, coverage and next-set unlocking remain available.
- SRS schedules and Tadabbur mastery remain unchanged by quiz retries.
- No chapter/lesson progress, XP, subscription or media behavior changes.
- Account deletion cascades to the new assessment records.
- Legacy requests remain compatible, including after failed optional practice.
- Pilot runtime checks on Android and web in both English and Urdu.
- Backend relevant tests/build; app lint and TypeScript; content validation.

Baseline checked during diagnosis: 14 Core 500/streak tests passed.

## Implementation record — 2026-10-04

The learner now studies five cards with expandable ayah examples, then takes
a five-question meaning test. The server stores the shuffled questions, private
answer key, language, answers and retry round. Incorrect answers lead to review
and a test of only missed words. Closing/reopening resumes saved progress.
Practice of a completed set preserves the original completion timestamp and
does not earn another streak credit. The new client never uses self-reported
known-word IDs to finish a set.

The additive models are `Core500AyahExample` and `Core500Assessment`. Shared
changes are limited to their Prisma relations and additional English/Urdu
Core 500 keys. No shared vocabulary example object, SRS route, lesson content,
chapter fixture, auth route, subscription logic, public page or media key changed.
The compatible legacy Core 500 endpoint remains available; it now deduplicates
word IDs and preserves completion timestamps under concurrent requests.

`warsh-backend/content/core500-ayah-examples.json` contains 1,500 links for
500 words, covering 1,183 distinct ayahs. Arabic and translations use Quran
Foundation resources 20 (Saheeh International) and 234 (Jalandhari). Links are
selected by Quranic Arabic Corpus lemma/prefix identity rather than roots.
The whole corpus surface is aligned to Imlaei Arabic; corpus and display word
positions are separate because vocatives and orthographic forms can tokenize
differently. The records were prepared as DRAFT. After the owner explicitly
requested production promotion on 2026-10-04, the release mirror was marked
PUBLISHED for the scoped rollout.

The dedicated Studio page is `/dashboard/core500`. It displays the highlighted
occurrence, both translations and the corpus source, supports draft/publish
review, verifies canonical text on save, and rejects stale concurrent edits.
Learners receive three published examples together or none. A new test is
enabled only when the backend advertises assessment support and all five words
have three published examples. On an older backend the cards remain reviewable
and the new test stays disabled. Backend/content rollout must precede the client.

Scoped content commands, run inside `warsh-backend`:

```powershell
npx tsx scripts/core500-example-content.ts             # validation; no DB writes
# Export/reconcile Studio edits before any import. Set DATABASE_URL explicitly.
npx tsx scripts/core500-example-content.ts --export --set=1
npx tsx scripts/core500-example-content.ts --apply --set=1
```

The importer never creates/replaces vocabulary rows and refuses to overwrite
different Studio records. Preparation/enrichment scripts write candidates and
canonical snapshots without database writes. Re-enrichment refuses to overwrite
a mirror containing published decisions. The original corpus download must
retain its copyright header; corpus attribution/link is visible in the learner UI.

Verification: 23 Core 500/streak/domain/HTTP integration tests pass. Tests cover
private keys, tampering, ownership, locking, draft filtering, partial publishing,
saved language, retries, resume, duplicate/concurrent completion, historical
timestamps and exact preservation of an existing SRS row. The migration passes
from an empty dedicated loopback database; Core 500 tables match the schema.
Backend production build, app TypeScript and app lint pass. Standalone backend
TypeScript still reports existing errors in `google-auth.test.ts` and
`restore-credential.test.ts`; those files were not changed. Studio list/read/draft
save returned 200 in the browser. The styled Studio page was also rechecked.

After the owner's request to run the remaining checks and show the emulator,
the maintained `start-warsh.ps1 -dev` launcher started the local backend and
Metro. The dedicated loopback `warsh_core500_test` database holds the preview
account and locally published examples; that preview's content mirror remains
DRAFT. This preview phase changed no shared staging database or production
content; the production release mirror was published in the later scoped rollout.

Android runtime checks verified all five cards, three-reference display,
highlighting, the meaning test, wrong-answer feedback, resume after force-stop,
one-word retry, completion and Set 2 unlocking. English and Urdu cards and tests
rendered on Android; the web preview also passed an Urdu practice test. Practice
preserved the original completion time and streak count. Desktop and mobile web
layouts were inspected. The sample EveryAyah recitation URL returned 200.
Two small English count labels were corrected during the walkthrough.

The preview debug APK uses `com.warsh.core500preview`, applied through a temporary
Gradle init file outside the repository. It is installed alongside the existing
release on `Warsh_API_34`, preserving that app and its data. Native build files
were not edited. The backend and Metro remain running for owner review.

The preview phase performed no production migration, publish or deployment.
The subsequent owner-authorized rollout used a clean checkout containing only
the reviewed Core 500 changes. No full seed or production release APK was built.

## Production promotion — 2026-10-04

The owner requested: "push only this core500's feature work to production".
The release checkout starts at production/origin main `6291e67`, excluding the
shared checkout's five unpublished curriculum commits and all unrelated edits.
Only the feature code, new content, additive migration, tests and this record are
included; the mixed Pen file is excluded from the production commit.

Core 500's 23 tests, complete 1,500-reference validation, backend build, app
TypeScript/lint and the production Urdu audit pass. Existing fixture metadata
errors in chapter-51-lesson-09 and chapter-52-lesson-06 are outside this rollout.
No lesson fixtures were synced or seeded. Production had exactly one pending
migration before deployment: the new Core 500 tables. The old shared Neon staging
branch lacks several unrelated migrations; it is left untouched. The scoped import was
verified twice against a separate local staging copy, including idempotency.

The importer uses one ordered vocabulary-row lock and a bulk insert, preserving
Studio conflict checks while avoiding hundreds of remote database round trips.
Production vocabulary, chapter, lesson and Tadabbur hashes were captured before
rollout; all 500 ranked headwords, publication states and set assignments match.

### Completed production rollout and live verification

- Commit `bf806231a0f8cac2b81ee2cc1a431575b6b7db2b` contains 26 scoped files
  and was pushed to `origin/main`. Other developers' local edits and five
  unpublished curriculum commits were excluded.
- Migration `20261004120000_core500_examples_assessments` applied successfully;
  the scoped importer published exactly 1,500 examples for the 500 existing words.
  No word IDs were recreated and no lesson fixture sync or full seed ran.
- Backend deployment `dpl_57oL8AdXbDXNAqgZFBEaAEzgoDYm` reached READY at
  `https://api.warsh.app`, with Git metadata matching the feature commit. Web
  deployment `dpl_evF9uvP21doPVbd8C8frP8N13bor` reached READY at
  `https://app.warsh.app` through the maintained `npm run deploy:web` script.
  These identify the feature rollout; subsequent deployments can advance aliases.
- Protected table fingerprints matched exactly before/after: VocabularyWord
  (920), Chapter (72), Lesson (607) and TadabburSurah (11). Historical progress,
  lesson content and media IDs were preserved.
- Live API checks passed authentication, locked-set enforcement, three examples
  per word, private answer keys, missed-word review/retry/resume, completion and
  next-set unlocking, duplicate answer idempotency and Urdu practice. Practice
  left the test account's SRS, completion and streak rows exactly unchanged.
  The temporary live account and all dependent test data were deleted and verified.
- The production browser rendered the example cards. Start-test POST requests
  returned HTML 403 Vercel Security Checkpoint responses on both attempts, before
  reaching the feature API. Direct API verification passed, but production browser
  test completion remains unverified. Shared firewall/routing was not changed.
- Unrelated release checks remain separate: fixture metadata validation errors
  in chapter-51-lesson-09 and chapter-52-lesson-06; `content:check` reported 99
  database-ahead and 93 missing lesson mirrors. No curriculum export or publication
  was included to resolve those checks.
- No Google Play release was submitted. Existing Android installations need a
  separate release to receive the new learner screens. The isolated emulator
  preview demonstrated the Android implementation without replacing the installed
  production app or its data.

Current implementation/deployment status is also recorded in
[`Docs/warsh-status.md`](../warsh-status.md).
