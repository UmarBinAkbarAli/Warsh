# Warsh Feature Spec

## Placement and Smart Skip for Early Curriculum

### Name
Placement and Smart Skip for Early Curriculum

### Goal
Let learners who already know very basic Arabic skip the earliest beginner chapters without breaking progression, analytics, or motivation.

### Problem
Phase 1.5 starts very gently. That is good for true beginners, but users who already know the alphabet, harakat, or some common words may feel bored and drop off before reaching useful content.

### Success Criteria
- Experienced users can start at a more suitable chapter in under 2 minutes.
- Beginners still start normally with no confusion.
- Skipped chapters unlock later content safely.
- Skipped content is tracked differently from truly completed content.
- Users can still go back and study skipped chapters anytime.

### Non-Goals
- Full adaptive learning engine
- Deep grammar placement for later units
- Automatic AI-based skill diagnosis
- Rewriting all lesson progression logic beyond early skip support

### Scope

#### Phase 1
- Units 1 and 2 only
- Placement affects Chapters 1-10
- Support self-selection and quick placement check
- Support retake/reset later

#### Phase 2
- Extend into Units 3-4 if needed

### User Types
- True beginner
- Learner who knows the Arabic alphabet
- Learner who can read basic Arabic with harakat
- Learner who knows some Quranic and common vocabulary

## User Experience

### Onboarding Flow
Add a new step after language/goal/level or before final readiness.

Title:
`Choose your starting point`

Options:
- `I’m completely new`
- `I know the Arabic letters`
- `I can read basic Arabic`
- `Check my level`

Behavior:
- `I’m completely new` -> start from Chapter 1
- `I know the Arabic letters` -> recommend Chapter 4 or 5
- `I can read basic Arabic` -> recommend Chapter 6
- `Check my level` -> launch quick placement quiz

### Placement Quiz Flow
Length:
- 8-12 questions
- 60-90 seconds target

Content mix:
- Letter recognition
- Joined letter recognition
- Harakat reading
- Long vowels / tanwin
- Common Quranic words
- Common daily vocabulary

Question types:
- multiple choice
- fill blank style from current supported types

End state:
- show recommendation:
  - `Start from Chapter 1`
  - `Start from Chapter 4`
  - `Start from Chapter 6`
  - `Start from Chapter 8`
- user confirms:
  - `Use this starting point`
  - `Start from the beginning instead`

### Chapter UX
For skipped chapters:
- visible in course list
- marked with badge:
  - `Skipped by placement`
- openable for review
- not hidden

For current chapter:
- behaves as normal unlocked content

### Profile UX
Add setting:
- `Retake placement`
- `Start from the beginning`

Retake behavior:
- warns user that progression unlock state will be recalculated
- does not delete completed lessons
- only recalculates skipped/unlocked early chapters

## Functional Rules

### Starting Checkpoint Mapping
Conservative default mapping:

- Beginner:
  - start Chapter 1
  - skip nothing

- Knows letters:
  - mark Chapters 1-3 as skipped
  - unlock Chapter 4

- Can read basic Arabic:
  - mark Chapters 1-5 as skipped
  - unlock Chapter 6

- Strong Unit 1-2 learner:
  - mark Chapters 1-7 as skipped
  - unlock Chapter 8

Hard cap for phase 1:
- no placement skip beyond Chapter 8 without explicit future design approval

Reason:
- prevents dropping users into verbs/adjectives too aggressively

### Scoring Rules for Quiz
Example:
- 0-3 correct -> Chapter 1
- 4-6 correct -> Chapter 4
- 7-9 correct -> Chapter 6
- 10-12 correct -> Chapter 8

Use simple thresholds first. Tune later from analytics.

### Unlock Rules
Skipped chapters count as “satisfied for progression.”
Completed chapters still count as completed.
A chapter is considered progression-satisfied if:
- all lessons are completed, or
- chapter is marked skipped by placement

### XP Rules
Recommended:
- skipped lessons give 0 XP
- skipped chapters give 0 XP
- if user later studies a skipped lesson manually and completes it, they earn normal XP

Reason:
- keeps XP honest
- avoids inflated profiles

### Streak Rules
Skipping chapters does not affect streak.
Only actual lesson completions affect streak.

### Analytics Rules
Track separately:
- `placement_selected`
- `placement_quiz_started`
- `placement_quiz_completed`
- `placement_recommendation_given`
- `placement_confirmed`
- `chapter_skipped_by_placement`
- `skipped_lesson_later_completed`

This helps measure:
- how many users skip
- whether skip improves retention
- whether users revisit skipped content later

## Data Model Changes

Recommended minimal additions:

### User
Add fields:
- `startingChapterOrder` nullable int
- `placementType` nullable enum
- `placementScore` nullable int
- `placementCompletedAt` nullable datetime

Example enum:
- `BEGINNER`
- `KNOWS_LETTERS`
- `CAN_READ_BASIC`
- `QUIZ_BASED`

### Progress
Current model is lesson-based and only has `completed`.
We need a distinct status.

Recommended change:
- add `status` enum to `Progress`

Values:
- `NOT_STARTED`
- `COMPLETED`
- `SKIPPED_BY_PLACEMENT`

If changing `Progress` feels risky, alternative:
- add `skipReason` nullable enum
- keep `completed=false`
- but this is weaker and messier than a proper status field

Recommended enum:
- `PLACEMENT`

### Optional Chapter-level Snapshot
Not required if unlock logic derives from lesson progress.
Keep it derived unless performance becomes an issue.

## API Changes

### POST /api/placement/submit
Input:
- answers or selected start option

Output:
- recommended chapter order
- chapters/lessons to mark skipped
- summary message

### POST /api/placement/apply
Input:
- confirmed recommended chapter order

Output:
- updated unlock state
- updated chapter list

Alternative:
- combine submit and apply if self-selection
- keep two-step flow only for quiz-based placement

### GET /api/placement
Returns:
- current placement result
- whether user has already taken placement
- whether retake is allowed

### Updated Existing Endpoints
`/api/chapters`
- include chapter badge state:
  - `isSkippedByPlacement`
  - or `chapterProgressState`

`/api/chapters/:id/lessons`
- include lesson state:
  - completed
  - skipped by placement
  - available

## Backend Logic

### Placement Apply Algorithm
1. Determine target starting chapter order
2. Find all chapters before that order
3. For every lesson in those chapters:
   - upsert progress row with status `SKIPPED_BY_PLACEMENT`
   - do not assign XP
   - do not set streak
4. Save placement result on user
5. Return refreshed course state

### Unlock Calculation
Current logic checks completed lesson IDs.
Update it to check progression-satisfied lesson IDs:
- completed
- skipped_by_placement

Then chapter state becomes:
- `locked`
- `available`
- `completed`
- `skipped`

Or keep current fields plus:
- `isSkippedByPlacement`

## UI State Model

### Lesson Cards
- `Completed`
- `Skipped`
- `Available`
- `Locked`

### Chapter Cards
- `Completed`
- `Skipped by placement`
- `In progress`
- `Locked`

## Content Requirements for Placement Quiz
Use existing curriculum content rather than inventing new data structure first.
Create a small curated placement bank.

Suggested 10-question bank:
1. identify `ا`
2. identify `خ`
3. choose joined form
4. read `بِ`
5. read `بُو`
6. identify tanwin
7. meaning of `اللّٰه`
8. meaning of `رَبّ`
9. meaning of `بَيْت`
10. meaning of `مَسْجِد`

This is enough for initial launch.

## Edge Cases
- User selects advanced option but later struggles:
  - they can reopen skipped chapters anytime
- User retakes placement after real progress:
  - completed lessons remain completed
  - only not-yet-completed early lessons may be re-marked skipped
- User starts at Chapter 6 and later completes Chapter 2:
  - award XP normally
  - chapter can transition from skipped to completed if all lessons are later completed
- Existing users:
  - default to no placement
  - optionally prompt once with “Want to skip beginner chapters?”

## Migration Strategy
For existing users:
- do not auto-skip anything
- keep current progress untouched
- optionally show a one-time modal:
  - `Already know the basics? Take a quick placement check`

## Rollout Plan
1. Add data model support for skipped-by-placement
2. update unlock logic
3. build simple onboarding self-selection
4. build quiz-based placement
5. add chapter/lesson skipped badges
6. add profile retake/reset
7. measure retention and chapter drop-off

## Acceptance Criteria
- New beginner user starts at Chapter 1 exactly as today
- User selecting `I know the Arabic letters` lands with Chapters 1-3 skipped and Chapter 4 unlocked
- User taking placement quiz can confirm recommended starting chapter
- Skipped chapters unlock later content
- Skipped chapters do not award XP
- Skipped chapters remain visible and reviewable
- Completed lessons still award XP normally even if previously skipped
- Existing users are unaffected unless they explicitly use placement

## Recommendation
Implement self-selection first, then placement quiz right after.
Self-selection gets the benefit quickly with lower complexity.
Quiz adds confidence and better personalization once the core skip status model is in place.
