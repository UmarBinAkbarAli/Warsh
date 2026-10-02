# Lesson audio needed

The running list of Arabic strings that a live lesson plays but that have no clip
in R2 yet. Lesson audio is keyed by a sha256 of the Arabic text and there is no
generation fallback at runtime, so until a clip exists the speaker button on that
card or exercise plays nothing.

**Owner decision, 2026-10-02:** audio is not generated during the content
hotfixes. Strings are collected here and generated in one pass once the Chapter
26–72 rewrite has settled, so no clip is paid for twice.

## How to generate (when the owner says go)

```powershell
cd warsh-backend
npm run audio:audit-catalog:db          # refresh this list; each line names its lesson
npm run audio:prebuild-catalog:db       # generate + upload every missing clip
npm run audio:audit-catalog:db          # must end "missing: 0"
```

Then empty the table below.

## Missing (20) — production audit 2026-10-02, R2 coverage 3834/3854

Card and exercise numbers are 1-based, as the learner sees them.

| Lesson | Where | Arabic | Key (prefix) |
|---|---|---|---|
| Ch 36 L2 | Discover card 1 | مَصْدَرُ فَعَّلَ: تَفْعِيلٌ | `1780770d` |
| Ch 46 L5 | Discover card 3 | هُوَ لَا يَذْهَبُ | `974a2e73` |
| Ch 46 L5 | Discover card 4 | أُرِيدُ أَنْ أَذْهَبَ | `602480a0` |
| Ch 46 L5 | Exercise 2 | مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ | `40911728` |
| Ch 59 L2 | Discover card 4 | مُتَصَدِّعًا | `4008d749` |
| Ch 59 L2 | Exercise 4 | لَوْ أَنزَلْنَا هَٰذَا الْقُرْآنَ عَلَىٰ جَبَلٍ لَّرَأَيْتَهُ خَاشِعًا مُتَصَدِّعًا | `2cd4fdd3` |
| Ch 61 L4 | Discover card 7 | بَابُ اسْمِ الْآلَةِ — مِفْعَل، مِفْعَال، مِفْعَلَة | `398224ca` |
| Ch 67 L2 | Discover card 2 | لَوْ أَنْفَقْتَ مَا فِي الْأَرْضِ جَمِيعًا مَا أَلَّفْتَ بَيْنَ قُلُوبِهِمْ | `983f0fb2` |
| Ch 67 L2 | Discover card 6 | لَوْ لَمْ تَذْهَبْ لَنَدِمْتَ | `a49ec731` |
| Ch 67 L2 | Exercise 1 | لَوْ أَنْفَقْتَ مَا فِي الْأَرْضِ جَمِيعًا | `412913ec` |
| Ch 67 L4 | Discover card 4 | وَلَوْ أَنَّ قُرْآنًا سُيِّرَتْ بِهِ الْجِبَالُ أَوْ قُطِّعَتْ بِهِ الْأَرْضُ أَوْ كُلِّمَ بِهِ الْمَوْتَىٰ | `c7f5c07d` |
| Ch 67 L4, L5 | L4 exercise 1, L5 exercise 7 | وَلَوْ أَنَّ قُرْآنًا سُيِّرَتْ بِهِ الْجِبَالُ | `7d303b2a` |
| Ch 67 L4 | Exercise 8 | سُيِّرَتْ | `66865656` |
| Ch 69 L2 | Discover card 2 | ادْعُونِي أَسْتَجِبْ لَكُمْ | `a03bd765` |
| Ch 69 L2 | Discover card 3 | فَاذْكُرُونِي أَذْكُرْكُمْ | `4d914160` |
| Ch 69 L2 | Discover card 4 | أَمْرٌ بَعْدَ أَمْرٍ | `4c731563` |
| Ch 69 L2 | Exercise 3 | اِجْتَهِدْ ___ | `8ffdce7b` |
| Ch 69 L2 | Exercise 7 | أَذْكُرْكُمْ | `d8c38f4f` |
| Ch 70 L6 | Discover card 1 | مراجعة: أنواع الاستثناء بـ إِلَّا | `83bd1a88` |
| Ch 72 L6 | Discover card 3 | أَيُّهَا لا يتغير | `e3a60405` |

## Spoken-phrase recordings to re-record

These phrases had their wording corrected, so their existing recordings
(`audio/spoken/<id>.mp3`) no longer match the text. Re-record them when the
rest of the audio is generated.

| Lesson | Phrase id | Corrected text |
|---|---|---|
| Ch 48 L5 (SP8) | sp8-p1 | بِسْمِ اللَّهِ |
| Ch 48 L5 (SP8) | sp8-p4 | اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ |
| Ch 48 L5 (SP8) | sp8-p7 | إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ |
| Ch 48 L5 (SP8) | sp8-p10 | اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى |

### Fix the text before generating these two

- **Ch 70 L6 card 1** and **Ch 72 L6 card 3** are unvoweled heading/label text,
  not learning Arabic. Voicing them as they stand would read a bare label aloud
  with guessed vowels. Either vowel them fully or move them out of the audio
  field during the rewrite; then re-run the audit, since the key changes with the
  text.
