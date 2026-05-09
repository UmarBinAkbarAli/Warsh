# Warsh · وَرْش — Quran Comprehension Progression
## Product Idea Document

**Created:** 2026-05-08  
**Status:** Under discussion — not locked  
**Purpose:** Explore how the Al-Fatiha meter evolves as curriculum expands to hundreds of chapters and lessons

---

## The Problem This Solves

The current Al-Fatiha meter was designed for Phase 1 when the curriculum is small (5 chapters, 16 lessons). It works beautifully right now — but it has a scaling problem no one has addressed yet.

Three questions that need answers before expanding curriculum:

1. What happens when the user completes Al-Fatiha (100%)? The card becomes a static badge doing nothing.
2. If we add Surah Al-Baqarah content next, do we add a second meter card? Then a third? The Learn tab gets cluttered fast.
3. Is the Fatiha meter a *progress tracker* or a *destination*? The answer changes the entire architecture.

---

## The Core Idea

The comprehension card should **never become useless.** It always has a live target. The single question it answers should always be the same:

> "What am I working toward in the Quran right now?"

As the user advances through the curriculum, the card evolves — it does not multiply, disappear, or become a static trophy. The header changes, the word grid changes, but the card stays in the same place doing the same job.

---

## Proposed Progression Model

### Phase 1 — Al-Fatiha (now)
- 15 key words tracked
- Words unlock as chapters are completed
- Gold highlights unlocked words, gray = locked
- Card collapses to slim progress bar
- At 100%: one-time celebration modal fires, then card transitions to Phase 2

### Phase 2 — Juz Amma (short Surahs)
After Fatiha completes, the card transitions to the next Surah target. Progression through Juz Amma (Juz 30) in order:

| Surah | Arabic | Ayahs | Why |
|---|---|---|---|
| Al-Fatiha | الفاتحة | 7 | ✅ Phase 1 done |
| Al-Ikhlas | الإخلاص | 4 | Short, recited daily |
| Al-Falaq | الفلق | 5 | Mu'awwidhatayn pair |
| Al-Nas | الناس | 6 | Completes the pair |
| Al-Kawthar | الكوثر | 3 | Shortest Surah |
| Al-Asr | العصر | 3 | Imam Shafi'i called it summary of Islam |
| Al-Fil | الفيل | 5 | Familiar story |
| Al-Quraysh | قريش | 4 | Companion to Al-Fil |
| Continue through Juz 30... | | | |

Short Surahs first = fast wins, immediate salah relevance.

### Phase 3 — Juz Tabarak (Juz 29) and backwards
After completing Juz Amma, move backwards through the Quran:
- Juz 29 (Tabarak) — starts with Al-Mulk
- Juz 28
- Juz 27
- Continue backwards toward Al-Baqarah

This mirrors how children in madrasas learn — short Surahs first, long Surahs much later.

### Phase 4 — Ruku-by-Ruku for long Surahs
When reaching longer Surahs (Al-Baqarah, Al-Imran, An-Nisa etc.), tracking the entire Surah at once is too large a goal. Switch to Ruku-level tracking:

- Al-Baqarah has 40 Rukus
- One Ruku = one comprehension target
- Card shows: "Al-Baqarah · Ruku 3 of 40"
- 558 total Rukus in the Quran = lifetime progression
- Maps to how Islamic scholars have always divided the Quran for study

---

## What Happens at Each Milestone

### Fatiha 100% complete
- Celebration modal fires: *"You can now understand Al-Fatiha in every Salah."*
- Relevant hadith or scholar quote about the Fatiha
- Card header transitions to next target (Al-Ikhlas)
- Small row of completed Surah badges appears at bottom of expanded card
- User can tap any completed badge to revisit that Surah's words

### Juz Amma 100% complete
- Larger celebration: *"You understand every Surah in Juz Amma."*
- Card transitions to Juz 29 / Ruku mode
- Juz Amma badge permanently shown in expanded card

### Individual Ruku complete (Phase 4)
- Smaller, inline celebration — not a full modal
- Card counter advances: "Ruku 3 → Ruku 4 of 40"
- Running total: "You understand X% of Al-Baqarah"

---

## Card UI Evolution

The card stays in the same position and has the same collapse/expand behaviour throughout all phases. Only the content inside changes.

| Phase | Card header | Word grid content | Progress label |
|---|---|---|---|
| Phase 1 | "Al-Fatiha comprehension" | 15 Fatiha words | "8 of 15 words" |
| Phase 2 | "Surah Al-Ikhlas" | Al-Ikhlas words + ✓ Fatiha badge | "3 of 4 words" |
| Phase 3 | "Surah Al-Mulk · Juz 29" | Al-Mulk words | "12 of 30 words" |
| Phase 4 | "Al-Baqarah · Ruku 3 of 40" | Ruku 3 words | "6 of 18 words" |

Completed Surahs shown as small Gold badges in the expanded state — not a new card, just a history row.

---

## Backend Changes Required (when ready)

Two new fields on the User model:

```prisma
currentSurahSlug   String  @default("al-fatiha")
currentRukuIndex   Int     @default(0)
```

A new `SurahWord` table linking curriculum lessons to specific Quran words:

```prisma
model SurahWord {
  id              String  @id
  surahSlug       String
  rukuIndex       Int
  arabicWord      String
  wordIndex       Int
  unlockLessonId  String  // which lesson unlocks this word
}
```

The comprehension card then queries: *"for the user's current Surah/Ruku, which words have been unlocked by completed lessons?"*

No changes needed to the existing lesson or chapter model.

---

## Questions Still Open

These need answers before building Phase 2:

1. **Word selection per Surah** — which words do we track? All of them or only the grammatically significant ones? Al-Baqarah has 286 ayahs — tracking every single word may be too granular. Do we track root words or surface forms?

2. **Unlock mapping** — how do we decide which lesson unlocks which Quranic word? Right now it is manually set via `fatihaProgressDelta`. Does this scale to hundreds of Surahs or do we need a smarter mapping system?

3. **Multiple Surahs in parallel** — a user in Salah recites Fatiha + one other Surah. Should the card show two active Surahs at once (Fatiha as permanent + current target)? Or just the current target?

4. **Non-Fatiha Surahs in Salah** — some users already know short Surahs by heart but don't understand them. Should there be a way to mark a Surah as "I recite this but don't understand it yet" to prioritise it?

5. **Ruku boundary data** — we need a database of Ruku boundaries for all 114 Surahs. This exists in Islamic scholarship — needs to be sourced accurately and verified by a scholar before use.

6. **The card name** — "Al-Fatiha meter" only works for Phase 1. What is the permanent name for this feature? Options: "Quran comprehension", "What you understand", "فَهْم" (Fahm — understanding), "تَدَبُّر" (Tadabbur — reflection/contemplation). Tadabbur is the most spiritually resonant term.

---

## Recommended Name for the Feature

**تَدَبُّر · Tadabbur**

Tadabbur means deep reflection and contemplation of the Quran — which is exactly what this feature tracks. It is a Quranic concept itself (the word appears in the Quran: أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ). Naming the feature Tadabbur gives it spiritual weight and sets Warsh apart from purely mechanical language apps.

Card header in final form: **"تَدَبُّرُكَ"** — "Your Tadabbur"

---

## What to Decide Next

Before this can be built:

1. Confirm the Surah progression order (proposed: Juz Amma backwards → Juz 29 → 28 → ...)
2. Decide on feature name (Tadabbur recommended)
3. Decide on word tracking granularity (all words vs. key words only)
4. Source Ruku boundary data from a verified Islamic reference
5. Decide whether Fatiha stays permanently visible or transitions out

---

*This document is for discussion only. No code changes should be made based on this until decisions are locked.*  
*Cross-reference: `warsh-ui-sot.md` for current Al-Fatiha meter UI specs (screen D1).*
