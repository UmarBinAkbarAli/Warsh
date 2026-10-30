# Studio: a simpler lesson review screen

Status: proposal, not approved. Needs a design review (Pen or Claude Design)
before any code.

## The job

The owner is reviewing every lesson in Chapters 2–72 (about 430 lessons) in
Warsh Studio and fixing what is wrong. The screen has to make three things
fast: see the lesson as a learner sees it, spot what is wrong, fix it and move
on. It must also show how far the review has got.

## What makes the current screen hard

- **Too many modes.** The lesson editor has Builder, Show preview and JSON, plus
  Lesson details, Validate, Save lesson and Publish lesson. Builder shows only a
  list of one-line rows; the preview is hidden by default, so you edit a lesson
  without seeing it.
- **Developer language.** Card and exercise rows are labelled `WORD`, `CONCEPT`,
  `TAP_TRANSLATION`, `FILL_BLANK`. Forms ask for "Arabic (plain)",
  "Transliteration", "Exercise ID", "Correct option index" and "Template".
- **Problems are invisible.** Only missing Urdu is flagged. A card without an
  image, a word from a later lesson, an opening ayah that does not contain the
  lesson's word, a duplicate test, or ال with tanween all look the same as a
  correct card. These are exactly the mistakes found in Chapter 2.
- **No review progress.** The curriculum table shows cards, exercises and
  "updated", but not which lessons the owner has already checked. Review status
  exists in the database (`LessonContentReview`) but lives on a separate
  Content Review page.
- **Images are URL fields.** Reusing an existing picture (house, book, mosque)
  means knowing and pasting its R2 address.

## Proposal

### 1. Review home: a checklist, not a table

Chapters as rows with a progress bar: "Chapter 2 — 3 of 17 approved". Opening a
chapter lists its lessons, and each one shows a single status:

- **Not reviewed** (grey)
- **Needs fixing** (amber, with the number of problems found)
- **Approved** (green)

A "Continue reviewing" button at the top opens the next lesson that is not
approved. This uses the existing `LessonContentReview.status`, so it needs no
new table.

### 2. The lesson as a storyboard

Replace Builder, Preview and JSON with one view: the lesson's screens laid out
top to bottom in the order the learner meets them, each drawn like the phone
screen:

Opening ayah → Discover cards → Practice → Reveal ayah → Wrap-up

Each screen shows its image thumbnail, Arabic, English and Urdu at a glance.
Clicking a screen opens an edit drawer on the right; the storyboard stays
visible and updates as you type. JSON moves under an "Advanced" menu.

### 3. Problems flagged on the card itself

Each screen gets a red or amber marker with a plain sentence, for example:

- "No image" (every card needs one)
- "Urdu missing"
- "No audio for this Arabic yet"
- "فِي is taught in Lesson 5" — a word the learner has not met by this lesson
- "This ayah does not contain أَيْنَ" — opening/reveal ayah missing the lesson word
- "Same question as Practice 3" — duplicate exercise
- "ال and tanween together" — and other harakat checks the validators can already run
- "Answer options include an untaught word"

The lesson's status chip counts them ("4 problems"), and "Approve" is only
offered when none are left, or after the owner dismisses one on purpose.

### 4. Plain words everywhere

| Now | Proposed |
| --- | --- |
| WORD / CONCEPT / EXAMPLE | Word card / Rule card / Example card |
| TAP_TRANSLATION | Pick the meaning |
| FILL_BLANK | Fill the gap |
| BUILD_SENTENCE | Build the sentence |
| TRUE_FALSE | True or false |
| Hook / Reveal / Close | Opening ayah / Closing ayah / Noor's goodbye |
| Arabic (plain), Transliteration | Filled in automatically from the Arabic; editable under "More" |
| Exercise ID, XP, Template | Hidden under "More" |
| Correct option index | Tap the right answer to mark it |

### 5. One way to save

- Changes save as a draft while typing (no lost work).
- One button, **Save and go live**, replaces Validate + Save lesson. Validation
  runs on save and points at the exact field.
- **Approve and next lesson** marks the lesson approved and opens the next one.
- Keyboard: `Ctrl+S` save, `↑/↓` move between screens, `Ctrl+Enter` approve and
  next.

### 6. Image picker

The image field opens a searchable grid of the pictures already in R2 ("house",
"book", "mosque"), with Upload as the second option. Picking one shows it on
the storyboard immediately.

## Suggested order

1. Review checklist + "Approve and next" (biggest time saver, small change).
2. Problem markers (no image, Urdu, untaught word, duplicate, ayah check).
3. Storyboard view with the edit drawer.
4. Plain labels, auto-filled plain Arabic and transliteration.
5. Image picker.

Steps 1–2 can sit on the current editor, so the review can start before the
storyboard is built.
