# Proposal Harvest — Chapters 26–72

**Owner instruction (2026-10-02):** work through the chapter proposals five
chapters at a time, in order. For each chapter, keep only what is **unique and
important** and add it to the live app; discard the rest. After each batch of
five, stop and report results — the owner clears the chat between batches, so
this file is the hand-off. Owner's words: "pick 5 chapters in a sequence from
proposals and see if anything they have unique and important so grab that and
add them in our app's chapters otherwise discard them."

Chapters 1–25 already had their proposals built and promoted, so the harvest
starts at Chapter 26. The interim correctness pass (2026-10-02) already fixed
every *wrong* thing in the existing Ch 26–72 lessons; this harvest is about what
the proposals would **add**.

## How to run one batch (read this after every /clear)

1. Find the next batch in the table below (first row not marked done).
2. Per chapter, read the proposal's **Review amendments** section (it overrides
   the body) and the shared rules in `chapters-26-68-review.md` (S1–S13,
   Conversation Lab placements, owner decisions D1–D7). Compare with the current
   fixtures in `warsh-backend/prisma/fixtures/chapter-NN-*`.
3. Sort each proposal item into:
   - **Grab** — teaches or tests something the chapter lacks and the learner
     needs: a chapter test (`chNN-test`, 12 Q at 80 %, S1/S2) when the chapter
     has none; a missing grammar point that later chapters depend on; a
     roadmap Conversation Lab placed in this chapter; a new lesson that owns a
     topic no other chapter teaches.
   - **Already done** — fixed by the correctness pass or already in the fixtures.
   - **Discard** — repeats an earlier chapter, process/bureaucracy text
     ("separate approval required", authoring budgets), reading-budget
     expansions, re-wording of correct content, or anything needing new UI
     (UI would need the Pen-first gate).
4. Build the grabbed items: fixtures (file names by display order, S4), keep
   existing IDs in place, new rows get new IDs (S2/S3), curriculum map title/
   description if the chapter changes (S10), illustrations mapped (reuse or add
   to `Docs/lesson-illustrations-needed.md` / `.csv`, S8 — no faces), Urdu
   throughout, Quran text exact (S7), no present tense taught before Ch 34 (S11).
5. Verify: `npm run db:validate-fixtures`, `npm run db:audit-urdu`,
   `npm run quran:audit-fixtures`, `npm test`.
6. Publish: a scoped promote script for the batch (model:
   `scripts/promote-chapters-20-23.cjs`), dry run, then `--apply` against
   production after `content:check` is clean; then `npm run content:baseline`,
   `npm run audio:prebuild-catalog:db` for new Arabic. Never the full seed.
7. Record results in the table and in `Docs/warsh-status.md`, commit, stop and
   report to the owner in short plain language.

Do not touch Codex's uncommitted edits to the proposal files themselves.

## Progress

| Batch | Chapters | Status | Grabbed | Discarded |
|---|---|---|---|---|
| 1 | 26–30 | **done, live 2026-10-02** | Full rebuild of every lesson (Ch 26–29 had never had the per-chapter correctness rebuild — only a hotfix); a REVIEW + 12-question test per chapter; Ch 26 layered iḍāfa + 1:4; Ch 27 eight prepositions, real لِـ/بِـ spelling, pronoun after preposition; Ch 28 verb complements + feminine forms; Ch 29 sentence cores, correct إِنَّ/لَيْسَ; Ch 30 story/dialogue/relative مَا + complete Al-Kafirun | Extra transfer lessons (Ch 26 l05, Ch 30 l06), separate Quran-reading lesson (Ch 27), separate feminine-forms lesson (Ch 28 l07) — folded into reviews/lessons; process text |
| 2 | 31–35 | **done, live 2026-10-02** | Full rebuild of every lesson + REVIEW + 12-question test per chapter; Ch 31 كَيْفَ/مَتَى/لِمَاذَا/كَمْ taught, new context lesson `ch31-l07`, CL10 Asking a Teacher (`ch31-l06`); Ch 32 the إِذَا event/response/فَ topic its map promised (was a Ch 29 re-run); Ch 33 complete Al-Falaq + An-Nasr + new An-Nas reading (`ch33-l06`); Ch 34 five core imperfect readings, supplied stems, لَا vs 'Do not!'; Ch 35 سَـ/سَوْفَ without near/far, لَنْ recognition | Splitting when/why into two lessons, the listening-task authoring process, reading-budget text, the CL10 roadmap edit (proposal file has Codex's uncommitted edits) |
| 3 | 36–40 | **done, live 2026-10-03** | Ch 36 rebuilt in full to its ten-item plan (maṣdar vs verb, Form I pairs, selected Form II/IV pairs, the maṣdar as a noun, two new participle lessons `ch36-l07`/`l08`, Quran context with exact 29:45/110:1/6:82, new integration lesson `ch36-l09`, review, test) — the old Form II 'تَكْتَابٌ' rule, misfiled إِقْرَارٌ/آمَنَ and the stray Chinese/Cyrillic text are gone; Ch 37 kept lessons 1–5 and gained a REVIEW and `ch37-test`; Ch 38 kept 1–5 (patched the 'always ـانِ' line and the unsubmittable multi-word build tile), gained **CL11 Daily Routine for Two** (`ch38-cl11`, 8 phrase clips), a REVIEW and `ch38-test`; Ch 39 kept 1–5 (the lām-of-command lines softened — Chapter 68's) and gained a REVIEW and `ch39-test`; Ch 40 kept its lessons, gained the missing prepositional-phrase lesson (`ch40-l09`, 2:29) and the group-relative lesson الَّذِينَ / اللَّاتِي / الَّتِي (`ch40-l08`, 1:7), `ch40-l06` rebuilt in place as **CL12 At the Mosque** (8 clips), a REVIEW and `ch40-test`; the Ch 40 hook/reveal of lesson 1 now fits adjectives (1:6) | The proposals' separate Ch 37 Quran lesson (`ch37-l04` already reads 29:45, 2:233, 99:4 and 50:30), the split of Ch 37 into She/You and أنتِ lessons, a separate Ch 40 الَّذِينَ lesson (folded into `ch40-l03` and `ch40-l08`), 55:13/55:17 as Ch 38 teaching items (55:13 is the lab hook), the dual relatives (Ch 56), process and budget text |
| 4 | 41–45 | | | |
| 5 | 46–50 | | | |
| 6 | 51–55 | | | |
| 7 | 56–60 | | | |
| 8 | 61–65 | | | |
| 9 | 66–70 | | | |
| 10 | 71–72 | | | |

**Batch 1 notes for later batches.** Builder scripts live in the session
scratchpad only; the reusable pieces are `scripts/promote-chapters-26-30.cjs`
(copy it for the next range) and this recipe: write fixtures → `db:validate-fixtures`
→ `db:audit-urdu` → `quran:audit-fixtures` (plus a check that every MATCH_AYAH
fragment and AYAH_PREVIEW is a canonical excerpt) → `npm test` → staging dry run +
apply + API walk (staging user `warsh-dev-test@example.com`; its Ch 1–30 progress
was filled in directly for the walk) → production `content:check` → dry run →
apply → `content:baseline` → `audio:prebuild-catalog:db` → illustration rows.
Open item found on the way: `quran:audit-fixtures` flags `chapter-50-lesson-05.json`
hook/reveal 55:1 — fix it in batch 5.

**Batch 2 notes for later batches.** Builders in the scratchpad again; reusable: `scripts/promote-chapters-31-35.cjs` now supports a surplus row as `[id, order, null, null, null, fixture, "DRAFT"]` (moves it, unpublishes it, keeps progress — used for `ch34-l07`). Gotchas met: the test `no chapter-test topic repeats one of its question's options` (a topic of 'إِنَّ' with an option 'إِنَّ' fails); a lab's scored answer may not be a `heard_only` phrase; any card whose `concept.ar` is Quran text needs `audio_url` (otherwise it would be synthesised); `audio:prebuild-fixtures` (non-dry) only uploads missing phrase clips. The staging user now also has Ch 31–35 progress, so batch 3's walk can start at Ch 36. `seed.cjs` still `require`s fixture files deleted in batches 1–2 (e.g. `chapter-27-lesson-05.json`, `chapter-34-lesson-07.json`) — the full seed is never run, but it would crash; not touched.

**Batch 3 notes for later batches.** Builders live in the session scratchpad only; reusable: `scripts/promote-chapters-36-40.cjs` (plan rows are `[id, order, fixture]`; titles come from each fixture's `_meta`; a row whose content is identical is skipped and a row that only moved gets just its order, so a pure reorder raises no "Updated" notice — keep `_meta._note` untouched on a moved lesson; transaction timeout 120 s because Neon was slow). Decision this batch: when the existing lessons were already correct (Ch 37–40 had had the 2026-10-02 critical fixes), keep their IDs and content and add only what is missing (review, test, a missing grammar lesson, the lab) rather than rebuilding for its own sake. **CL11 was an owner decision (D3, recommended yes) and was built anyway under the harvest instruction — the owner can unpublish `ch38-cl11` without touching the core chapter.** Gotchas met: a REVIEW needs at least two discover cards; the Quran excerpt check must use the *imlaei* text (the Uthmani text spells الصلوة); seed.cjs still `require`s `chapter-36-lesson-0N.json`, `chapter-40-lesson-06-spoken-phrases.json` etc. by their old names (never run). Staging: Docker Desktop must be running; `start-warsh-staging.ps1` stops on the harmless Prisma "Loaded config" stderr line, so start the backend by hand with `DATABASE_URL`/`DIRECT_DATABASE_URL` set to `postgresql://postgres@127.0.0.1:55432/warsh_staging` and `DEV_UNLOCK_ALL=true`. The staging user now has Ch 36–40 progress. Illustrations: 58 new scenes requested for Ch 36 (all of it), the new reviews and the two new Ch 40 lessons; the cards of the older kept Ch 37–40 lessons were never mapped and are listed as a later pass.
