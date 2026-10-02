# Hotfix proposal — Ch 46 Lesson 5 and Ch 69 Lesson 2

**Status:** proposal, 2026-10-02. Not approved, not implemented.

The 2026-10-02 content hotfix cleaned the corrupted Urdu in both lessons, but the
Arabic they teach is still wrong. Both are listed as **Critical** in their chapter
proposals ([Ch 46](chapter-46-content-proposal.md) rows 35–36,
[Ch 69](chapter-69-content-proposal.md) rows 30–32). This file is the **interim**
fix: it keeps each lesson's ID, place, template and exercise count, and swaps the
wrong material for verified material. The full chapter rebuilds still supersede it.

Constructed (non-Quran) examples are labelled *constructed* and carry no Quran
citation or recitation audio. Urdu is written to match the English at
implementation and goes through `db:audit-urdu`. New Arabic is added to
[`lesson-audio-needed.md`](../lesson-audio-needed.md), not generated now.

---

## Ch 46 L5 — "Parsing Mixed-State Ayat"

### What is wrong

1. **It quotes an ayah that does not exist.** It teaches **لَا تُفْنِي مَالَهُ وَمَا كَسَبَ**
   as Al-Masad 111:2. The real verse — shown in the same lesson's own hook — is
   **مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ**.
2. **It teaches the grammar backwards.** It calls this **لَا** the *prohibition* لا
   (لَا النَّاهِيَة) that makes the verb jussive, then translates it as "does not use up"
   — a plain negation. A prohibition is "do not …", and its verb would end in
   sukūn; **تُفْنِي** ends in a long ī, which is not a jussive form at all.
3. **مَالَهُ** is labelled the object; in the real verse **مَالُهُ** is the subject.

A learner who finishes it believes a fabricated verse and the wrong rule.

### Fix

Keep the real 111:2 as the anchor and teach the actual point: **mood belongs to
the imperfect only**. The two verbs in 111:2 are perfect, so they have no state;
the three states are shown with clearly constructed examples.

| # | Now | Replace with |
|---|---|---|
| Hook intro | "introduces لَا تُفْنِي … jussive" | "Verse 2 has two verbs, **أَغْنَىٰ** and **كَسَبَ** — both perfect (past). The three states belong only to the present-tense verb. This lesson sorts verbs one at a time." Ayah and audio unchanged. |
| Card 1 CONCEPT | keep | Keep; reword the last line to "No governor → **مَرْفُوع**." |
| Card 2 EXAMPLE | لَا تُفْنِي | **لَا تَذْهَبْ** — "Don't go." *(constructed)* Prohibition **لَا** → **مَجْزُوم**, sukūn on the last letter. |
| Card 3 EXAMPLE | مَالَهُ | **هُوَ لَا يَذْهَبُ** — "He does not go." *(constructed)* Plain negation **لَا** → verb stays **مَرْفُوع** (ḍamma). Same **لَا**, different job. |
| Card 4 EXAMPLE | وَمَا كَسَبَ | **أُرِيدُ أَنْ أَذْهَبَ** — "I want to go." *(constructed)* **أَنْ** → **مَنْصُوب** (fatḥa). |
| Card 5 GRAMMAR_NOTE | parse of the fake phrase | Parse the real 111:2: **مَا** (negation) → **أَغْنَىٰ** (perfect verb, "availed") → **عَنْهُ** ("him") → **مَالُهُ** (subject, "his wealth") → **وَمَا كَسَبَ** ("and what he earned", **كَسَبَ** perfect). No present-tense verb, so no state to find. |
| Card 6 WORD | تُفْنِي | **أَغْنَىٰ** — "availed, was of use", root غ-ن-ي, perfect verb. |
| Card 7 AYAH_PREVIEW | 111:3 | Keep **سَيَصْلَى**; change the note to "**سَـ** marks the future; it is not a governor, so the verb stays **مَرْفُوع**." |

| Exercise | Now | Replace with |
|---|---|---|
| ex01 GRAMMAR_PARSE | لَا تُفْنِي مَالَهُ | **لَا يَكْتُبُ الطَّالِبُ الدَّرْسَ** *(constructed)* → PARTICLE · VERB · SUBJECT · OBJECT |
| ex02 TAP_TRANSLATION | fake phrase | Prompt **مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ** → ✓ "His wealth will not avail him, nor what he gained." ✗ "His wealth used up what he earned." ✗ "He did not use up his wealth." ✗ "His wealth and earnings will save him." |
| ex03 TRUE_FALSE | "لَا النَّاهِيَة … is a negation" (true) | "In **هُوَ لَا يَذْهَبُ**, **لَا** is the prohibition لا and the verb is **مَجْزُوم**." → **False** — it is a negation; the verb is **مَرْفُوع**. |
| ex04 MATCHING | fake-phrase glosses | **لَا تَذْهَبْ** → prohibition, مَجْزُوم · **لَا يَذْهَبُ** → negation, مَرْفُوع · **أَنْ يَذْهَبَ** → after أَنْ, مَنْصُوب · **كَسَبَ** → perfect verb, no state |
| ex05 FILL_BLANK | ذَاتَ ___ | Keep |
| ex06 BUILD_SENTENCE | سَيَصْلَى … | Keep |
| ex07 TAP_TRANSLATION | نَارًا ذَاتَ لَهَبٍ | Keep; fix the note: "**ذَاتَ لَهَبٍ** describes **نَارًا**; **ذَاتَ** is in iḍāfa with **لَهَبٍ**" (not "an idafa chain"). |
| Reveal / Close | "النَّاهِيَة triggers jazm on تُفْنِي" | Highlight **أَغْنَىٰ** and **كَسَبَ** (indices 1, 5). "Both verbs in 111:2 are past, so they have no state. Find the present-tense verb first; then look for its governor." |

Also drop the dead `_meta.source` file reference (shared rule S9).

---

## Ch 69 L2 — "جواب الطلب in the Quran"

### What is wrong

1. **The Arabic is invented.** Its central example **فَاقْهَمْ عِبَادَتِي** ("then
   understand My worship") and **وَإِنْ عَصَيْتَ فَاقْهَمْ عِبَادَتِي** appear nowhere in
   the Quran — and **اقْهَمْ** is not even a real word (the command of فَهِمَ is
   **اِفْهَمْ**). The lesson presents them as Quranic beside Al-Aʿrāf 7:199, which
   says something else entirely. The root exercise asks for the root of this
   non-word.
2. **The rule is wrong.** جواب الطلب is a *present-tense* verb that answers a
   command and so becomes **مَجْزُوم** — e.g. **ادْعُونِي أَسْتَجِبْ لَكُمْ**, "Call on
   Me; I will answer you." The lesson instead calls a **command after فَـ** the
   jussive answer. A command is a **فعل أمر**; it is not a jussive answer.
3. It lists **زِدْنِي** and **ادْعُوا** (direct commands) as جواب الطلب.

### Fix

Rebuild around real, verified Quran pairs where a command is answered by a
jussive present-tense verb, and contrast with commands that are *not* answered.

**Hook / reveal:** replace 7:199 with **Ghāfir 40:60** —
**وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ** ("Your Lord said: call on Me; I will
answer you"), audio `everyayah …/040060.mp3`. Reveal highlights **ادْعُونِي** and
**أَسْتَجِبْ** (indices 2, 3).

| # | Replace with |
|---|---|
| Card 1 CONCEPT | **جواب الطلب.** When a command is followed — with no **فَـ** — by a present-tense verb that tells its result, that verb is **مَجْزُوم**. "Do X; you will get Y" means "if you do X, Y". |
| Card 2 EXAMPLE | **ادْعُونِي أَسْتَجِبْ لَكُمْ** (40:60). **ادْعُونِي** = the command; **أَسْتَجِبْ** = the answer, present tense, **مَجْزُوم** — see the sukūn on **ب**. |
| Card 3 EXAMPLE | **فَاذْكُرُونِي أَذْكُرْكُمْ** (Al-Baqarah 2:152), "So remember Me; I will remember you." **أَذْكُرْ** is the jussive answer. |
| Card 4 CONCEPT (contrast) | Not every verb after a command is an answer. **خُذِ الْعَفْوَ وَأْمُرْ بِالْعُرْفِ** (7:199) is a chain of commands — each is **فعل أمر**, none is جواب الطلب. |

| Exercise | Replace with |
|---|---|
| ex01 TAP_TRANSLATION | **ادْعُونِي أَسْتَجِبْ لَكُمْ** → ✓ "Call on Me; I will answer you." ✗ "They called on Me and I answered." ✗ "Do not call on Me." ✗ "I called you and you answered." |
| ex02 TRUE_FALSE | "In **فَاذْكُرُونِي أَذْكُرْكُمْ**, **أَذْكُرْكُمْ** is جواب الطلب and is **مَجْزُوم**." → **True** |
| ex03 FILL_BLANK (TAP) | **اِجْتَهِدْ ___** *(constructed)*, hint "Make an effort; you will succeed." ✓ **تَنْجَحْ** ✗ **تَنْجَحُ** ✗ **تَنْجَحَ** ✗ **نَجَحْتَ** |
| ex04 MATCHING | **ادْعُونِي** → the command · **أَسْتَجِبْ** → the answer, مَجْزُوم · **اِجْتَهِدْ تَنْجَحْ** → same pattern, constructed · **خُذِ الْعَفْوَ وَأْمُرْ بِالْعُرْفِ** → commands only, no answer |
| ex05 BUILD_SENTENCE | **فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ** (Āl ʿImrān 3:31), "So follow me; Allah will love you." Tiles in order. |
| ex06 GRAMMAR_PARSE | **اُدْرُسِ الدَّرْسَ تَنْجَحْ** *(constructed)* → VERB · OBJECT · VERB |
| ex07 IDENTIFY_ROOT | **أَذْكُرْكُمْ** → ✓ ذ ك ر ✗ ش ك ر ✗ ك ر م ✗ ذ ك و |
| Close | "جواب الطلب: a command, then a present-tense verb with no **فَـ**, and that verb is **مَجْزُوم** — **ادْعُونِي أَسْتَجِبْ**, **فَاذْكُرُونِي أَذْكُرْكُمْ**. A command followed by another command is just two commands." |

**Knock-on:** Ch 69 **L1** still calls **ادْعُوا** and **زِدْنِي** جواب الطلب (same
Critical row). This fix stops L2 repeating that error, but L1 needs the same
correction — either here or in the chapter rebuild.

---

## Verification before publishing

- Each Quran quote checked word-for-word against the Quranic Arabic Corpus
  (40:60, 2:152, 3:31, 7:199, 111:2, 111:3) and its audio URL against the ayah.
- `db:validate-fixtures`, `db:audit-urdu`, `content:check`, then
  `content:sync -- --content --git-changed`.
- Open both lessons on the web app and play them through.
- New Arabic added to `lesson-audio-needed.md`.
