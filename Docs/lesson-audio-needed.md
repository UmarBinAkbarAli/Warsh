# Lesson audio needed

The running list of Arabic strings that a live lesson plays but that have no clip
in R2 yet. Lesson audio is keyed by a sha256 of the Arabic text and there is no
generation fallback at runtime, so until a clip exists the speaker button on that
card or exercise plays nothing.

**Owner decision, 2026-10-02:** audio is not generated during the content
hotfixes. Strings are collected here and generated in one pass once the Chapter
26–72 rewrite has settled, so no clip is paid for twice.

**Owner decision, 2026-10-03:** Claude does not generate or upload TTS clips at
all. Whenever a lesson needs a clip that does not exist, Claude lists it here
(lesson, card or exercise, Arabic, key) and stops. Generation is a separate step
the owner asks for.

## How to generate (when the owner says go)

```powershell
cd warsh-backend
npm run audio:audit-catalog:db          # refresh this list; each line names its lesson
npm run audio:prebuild-catalog:db       # generate + upload every missing clip
npm run audio:audit-catalog:db          # must end "missing: 0"
```

Then empty the table below.

## Missing (197) — production audit 2026-10-03, after the Chapter 41–45 batch, R2 coverage 3851/4048

Card and exercise numbers are 1-based, as the learner sees them. A key lists the
first 8 hex characters of its `audio/catalog/v1/<sha256>.mp3` object; the same
Arabic string used in several places is one row.

| Lesson | Where | Arabic | Key (prefix) |
|---|---|---|---|
| Ch 41 L1 | Discover card 1 | الْفِكْرَةُ الْعَامَّةُ | `47f4ad15` |
| Ch 41 L1 | Discover card 2 | ذَهَبَ يُوسُفُ إِلَى الْمَسْجِدِ صَبَاحًا. ثُمَّ رَجَعَ إِلَى الْبَيْتِ. بَعْدَ ذَلِكَ قَرَأَ كِتَابًا. | `ebfbc174` |
| Ch 41 L1 | Discover card 3 | ثُمَّ، بَعْدَ ذَلِكَ، قَبْلَ | `5d970a4d` |
| Ch 41 L1 | Discover card 5 | قَبْلَ الْفَصْلِ قَرَأَتْ فَاطِمَةُ كِتَابًا فِي الْبَيْتِ. ثُمَّ ذَهَبَتْ إِلَى الْمَدْرَسَةِ. | `0e515dfc` |
| Ch 41 L1 | Discover card 6 | الْفِكْرَةُ أَمِ التَّرْتِيبُ؟ | `76c7123f` |
| Ch 41 L1 | Exercise 4 | بَعْدَ ذَلِكَ قَرَأَ كِتَابًا | `b19e9680` |
| Ch 41 L2 | Discover card 1 | الْوَصْفُ | `573b7c30` |
| Ch 41 L2 | Discover card 2 | فِي الْفَصْلِ طَالِبٌ مُجْتَهِدٌ وَطَالِبَةٌ مُجْتَهِدَةٌ. هُوَ كَتَبَ الدَّرْسَ، وَهِيَ قَرَأَتْ كِتَابًا. | `80da21d2` |
| Ch 41 L2 | Discover card 3 | هُوَ، هِيَ | `3fbd5e00` |
| Ch 41 L2 | Discover card 4 | الطَّالِبُ الَّذِي كَتَبَ الدَّرْسَ | `0f8ae7e8` |
| Ch 41 L2 | Discover card 5 | الطَّالِبَةُ الَّتِي قَرَأَتْ كِتَابًا | `9d294f07` |
| Ch 41 L2 | Exercise 1 | طَالِبٌ مُجْتَهِدٌ وَطَالِبَةٌ مُجْتَهِدَةٌ | `0578292d` |
| Ch 41 L2 | Exercise 2 | طَالِبَةٌ ___ | `c9526502` |
| Ch 41 L2 | Exercise 6 | جَلَسَتْ فَاطِمَةُ مَعَ أَخِيهَا فِي الْبَيْتِ. هِيَ قَرَأَتْ كِتَابًا، وَهُوَ كَتَبَ الدَّرْسَ. | `26489938` |
| Ch 41 L3 | Discover card 1 | أَيْنَ؟ مَتَى؟ مَعَ مَنْ؟ | `af35c3a8` |
| Ch 41 L3 | Discover card 2 | جَلَسَ أَحْمَدُ فِي الْمَسْجِدِ. | `4a211f4c` |
| Ch 41 L3 | Discover card 3 | ذَهَبَ أَحْمَدُ إِلَى الْمَدْرَسَةِ بَعْدَ الصَّلَاةِ. | `70a70e52` |
| Ch 41 L3 | Discover card 4 | قَرَأَ أَحْمَدُ كِتَابًا مَعَ أَخِيهِ. | `ae4f3879` |
| Ch 41 L3 | Discover card 5 | جَلَسَ أَحْمَدُ فِي الْمَسْجِدِ بَعْدَ الصَّلَاةِ مَعَ أَخِيهِ. | `434f4f45` |
| Ch 41 L3 | Discover card 7 | مِنَ الظُّلُمَاتِ إِلَى النُّورِ | `e553805f` |
| Ch 41 L3 | Exercise 1 | جَلَسَ أَحْمَدُ ___ الْمَسْجِدِ. | `ab23feef` |
| Ch 41 L3 | Exercise 2 | ذَهَبَ أَحْمَدُ إِلَى الْمَدْرَسَةِ ___ الصَّلَاةِ. | `7a5d004a` |
| Ch 41 L3 | Exercise 3 | قَرَأَ أَحْمَدُ كِتَابًا ___ أَخِيهِ. | `fa53466d` |
| Ch 41 L3 | Exercise 5 | رَجَعَتْ فَاطِمَةُ إِلَى الْبَيْتِ قَبْلَ الْفَصْلِ مَعَ أُمِّهَا. | `a9fd228d` |
| Ch 41 L4 | Discover card 1 | الدَّلِيلُ مِنَ النَّصِّ | `72198b6f` |
| Ch 41 L4 | Discover card 2 | الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ | `819e29a5` |
| Ch 41 L4 | Discover card 5 | دَخَلَتْ فَاطِمَةُ الْفَصْلَ وَجَلَسَتْ. هِيَ كَتَبَتِ الدَّرْسَ. ثُمَّ ذَهَبَتْ إِلَى الْبَيْتِ مَعَ أَخِيهَا. | `b3b6f47a` |
| Ch 41 L4 | Discover card 7 | ذَهَبَتْ سَلْمَى إِلَى الْمَسْجِدِ مَعَ أَبِيهَا. هِيَ قَرَأَتْ كِتَابًا بَعْدَ الصَّلَاةِ. | `d14f3034` |
| Ch 41 L4 | Exercise 2 | وَيُقِيمُونَ الصَّلَاةَ | `c8a42748` |
| Ch 41 L4 | Exercise 3 | الَّذِينَ يُؤْمِنُونَ … وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ | `a34ef8f0` |
| Ch 41 L5, Ch 41 L8 | Ch 41 L5: Discover card 3; Ch 41 L8: Exercise 11 | وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍ | `15ed5ebb` |
| Ch 41 L5 | Discover card 1 | سُورَةُ الْفِيلِ | `614a7fc7` |
| Ch 41 L5 | Discover card 2 | أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ | `67c79ac1` |
| Ch 41 L5 | Exercise 1 | أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ | `a77742b4` |
| Ch 41 L5 | Exercise 2 | أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ | `49bfb166` |
| Ch 41 L5 | Exercise 3 | وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ | `28fc4a80` |
| Ch 41 L5 | Exercise 4 | تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ | `3b4399b6` |
| Ch 41 L5 | Exercise 5 | فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍ | `9f1e9227` |
| Ch 41 L5 | Exercise 7 | أَلَمْ تَرَ … فَجَعَلَهُمْ كَعَصْفٍ مَأْكُولٍ | `e183e7fc` |
| Ch 41 L6, Ch 41 L7 | Ch 41 L6: Discover card 1; Ch 41 L7: Discover card 1 | سُورَةُ الْقَارِعَةِ | `66a6e971` |
| Ch 41 L6 | Discover card 2 | الْقَارِعَةُ مَا الْقَارِعَةُ وَمَا أَدْرَاكَ مَا الْقَارِعَةُ | `8c9832b9` |
| Ch 41 L6 | Discover card 3 | يَوْمَ يَكُونُ النَّاسُ كَالْفَرَاشِ الْمَبْثُوثِ وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنفُوشِ | `eb25b5e9` |
| Ch 41 L6 | Discover card 5 | كَـ | `8461e946` |
| Ch 41 L6 | Exercise 1 | الْقَارِعَةُ | `910a0fd8` |
| Ch 41 L6 | Exercise 2 | مَا الْقَارِعَةُ | `eeda4a23` |
| Ch 41 L6 | Exercise 3 | وَمَا أَدْرَاكَ مَا الْقَارِعَةُ | `3223e004` |
| Ch 41 L6 | Exercise 4 | يَوْمَ يَكُونُ النَّاسُ كَالْفَرَاشِ الْمَبْثُوثِ | `86675ef5` |
| Ch 41 L6 | Exercise 5 | وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنفُوشِ | `04a47be9` |
| Ch 41 L6 | Exercise 7 | مَا الْقَارِعَةُ … وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنفُوشِ | `48609798` |
| Ch 41 L7 | Discover card 2 | فَأَمَّا مَن ثَقُلَتْ مَوَازِينُهُ فَهُوَ فِي عِيشَةٍ رَّاضِيَةٍ | `0bd8bc4c` |
| Ch 41 L7 | Discover card 3 | وَأَمَّا مَنْ خَفَّتْ مَوَازِينُهُ فَأُمُّهُ هَاوِيَةٌ | `79153bac` |
| Ch 41 L7 | Discover card 4 | وَمَا أَدْرَاكَ مَا هِيَهْ نَارٌ حَامِيَةٌ | `4aaecb2e` |
| Ch 41 L7 | Discover card 5 | فَأَمَّا مَنْ ثَقُلَتْ مَوَازِينُهُ فَهُوَ فِي عِيشَةٍ رَاضِيَةٍ | `ef824f2a` |
| Ch 41 L7 | Exercise 1 | فَأَمَّا مَن ثَقُلَتْ مَوَازِينُهُ | `8a032861` |
| Ch 41 L7 | Exercise 2 | فَهُوَ فِي عِيشَةٍ رَّاضِيَةٍ | `6414ea21` |
| Ch 41 L7 | Exercise 3 | وَأَمَّا مَنْ خَفَّتْ مَوَازِينُهُ | `912ae79a` |
| Ch 41 L7 | Exercise 4 | فَأُمُّهُ هَاوِيَةٌ | `7429d293` |
| Ch 41 L7 | Exercise 7 | فَأَمَّا مَنْ ثَقُلَتْ مَوَازِينُهُ … وَأَمَّا مَنْ خَفَّتْ مَوَازِينُهُ | `b907311c` |
| Ch 41 L7 | Exercise 8 | الْقَارِعَةُ … نَارٌ حَامِيَةٌ | `af581dbe` |
| Ch 41 L8 | Discover card 2 | ذَهَبَتْ سَلْمَى إِلَى السُّوقِ صَبَاحًا. بَعْدَ ذَلِكَ رَجَعَتْ إِلَى الْبَيْتِ وَجَلَسَتْ مَعَ أُمِّهَا. | `abdb8c90` |
| Ch 41 L8 | Discover card 3 | فِي الْقَرْيَةِ مُعَلِّمٌ كَرِيمٌ وَمُعَلِّمَةٌ كَرِيمَةٌ. هِيَ قَرَأَتْ كِتَابًا، وَهُوَ كَتَبَ الدَّرْسَ فِي الْمَسْجِدِ. | `acd255a1` |
| Ch 41 L8 | Exercise 7 | ذَهَبَتْ سَلْمَى إِلَى السُّوقِ ___. | `a35783fb` |
| Ch 41 L8 | Exercise 12 | فَأَمَّا مَنْ ثَقُلَتْ مَوَازِينُهُ فَهُوَ فِي عِيشَةٍ رَاضِيَةٍ … وَأَمَّا مَنْ خَفَّتْ مَوَازِينُهُ فَأُمُّهُ هَاوِيَةٌ | `2517e826` |
| Ch 42 L1 | Discover card 1 | كَمْ؟ | `b1ecd06e` |
| Ch 42 L1 | Discover card 3 | كَمْ كِتَابًا قَرَأْتَ؟ — ٣ | `0b29ffc8` |
| Ch 42 L1 | Discover card 5 | كَمْ لَبِثْتُمْ؟ | `83367f39` |
| Ch 42 L1 | Discover card 7 | كَمْ أَمْ أَيْنَ؟ | `7238f04c` |
| Ch 42 L1 | Exercise 2 | كَمْ ___ قَرَأْتَ؟ | `4ec91cc3` |
| Ch 42 L1 | Exercise 3 | عِنْدِي كُتُبٌ فِي الْبَيْتِ. | `64ecb736` |
| Ch 42 L2 | Discover card 1 | مَتَى؟ | `374d34e2` |
| Ch 42 L2 | Discover card 2 | مَتَى ذَهَبْتَ إِلَى الْمَدْرَسَةِ؟ | `f0c365aa` |
| Ch 42 L2 | Discover card 3 | ذَهَبْتُ أَمْسِ. | `c72d5fd1` |
| Ch 42 L2 | Discover card 4 | مَتَى سَتَذْهَبُ إِلَى الْمَدْرَسَةِ؟ — سَأَذْهَبُ غَدًا. | `9ef88707` |
| Ch 42 L2 | Discover card 5 | مَتَى تَذْهَبُ إِلَى الْمَدْرَسَةِ؟ — أَذْهَبُ كُلَّ صَبَاحٍ. | `14894006` |
| Ch 42 L2 | Discover card 7 | مَتَىٰ نَصْرُ اللَّهِ ۗ أَلَا إِنَّ نَصْرَ اللَّهِ قَرِيبٌ | `6a5dde23` |
| Ch 42 L2 | Exercise 2 | ___ سَتَذْهَبُ إِلَى الْمَسْجِدِ؟ | `8cab15f5` |
| Ch 42 L2 | Exercise 3 | مَتَى ذَهَبْتَ إِلَى السُّوقِ؟ | `7c0d0f35` |
| Ch 42 L2 | Exercise 5 | مَتَى ذَهَبْتَ؟ — أَمْسِ. | `b23ccab3` |
| Ch 42 L3 | Discover card 3 | لِأَنَّ الْمَسْجِدَ قَرِيبٌ. | `9c9004bb` |
| Ch 42 L3 | Discover card 4 | لِمَاذَا تَدْرُسُ الْعَرَبِيَّةَ؟ — لِأَنَّ الْعَرَبِيَّةَ لُغَةُ الْقُرْآنِ. | `01910efe` |
| Ch 42 L3 | Discover card 5 | لِمَاذَا أَمْ مَتَى؟ | `d29fa6ff` |
| Ch 42 L3 | Discover card 7 | لِمَ تَقُولُونَ مَا لَا تَفْعَلُونَ | `afb1aac9` |
| Ch 42 L3 | Exercise 4 | لِمَاذَا تَدْرُسُ الْعَرَبِيَّةَ؟ — ___ الْعَرَبِيَّةَ لُغَةُ الْقُرْآنِ. | `d4a4760b` |
| Ch 42 L3 | Exercise 5 | لِمَاذَا تَقْرَأُ هَذَا الْكِتَابَ؟ | `51d11947` |
| Ch 42 L3 | Exercise 8 | لِمَ تَقُولُونَ مَا لَا تَفْعَلُونَ؟ | `544d8bf1` |
| Ch 42 L4 | Discover card 1 | كَيْفَ؟ | `2491ab8f` |
| Ch 42 L4 | Discover card 2 | كَيْفَ حَالُكَ؟ — بِخَيْرٍ. | `ffebf3a0` |
| Ch 42 L4 | Discover card 3 | كَيْفَ تَذْهَبُ إِلَى الْمَدْرَسَةِ؟ — بِالسَّيَّارَةِ. | `ee5a88a7` |
| Ch 42 L4 | Discover card 6 | كَمْ، مَتَى، لِمَاذَا، كَيْفَ | `d5077bee` |
| Ch 42 L4 | Exercise 1 | كَيْفَ تَذْهَبُ إِلَى الْمَدْرَسَةِ؟ | `7ed1afc2` |
| Ch 42 L4 | Exercise 3 | كَيْفَ تَذْهَبُ إِلَى السُّوقِ؟ | `5d457d6e` |
| Ch 42 L4 | Exercise 4 | ___ تَذْهَبُ إِلَى الْمَدْرَسَةِ؟ — بِالسَّيَّارَةِ. | `f5757fd0` |
| Ch 42 L4 | Exercise 5 | ___ تَذْهَبُ إِلَى الْمَدْرَسَةِ؟ — أَذْهَبُ كُلَّ صَبَاحٍ. | `7bed73de` |
| Ch 42 L5, Ch 42 L6 | Ch 42 L5: Discover card 2; Ch 42 L6: Exercise 12 | أَلْهَاكُمُ التَّكَاثُرُ حَتَّىٰ زُرْتُمُ الْمَقَابِرَ | `36774c33` |
| Ch 42 L5 | Discover card 1 | سُورَةُ التَّكَاثُرِ | `102baf09` |
| Ch 42 L5 | Discover card 3 | كَلَّا سَوْفَ تَعْلَمُونَ ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ | `4dde263d` |
| Ch 42 L5 | Discover card 4 | كَلَّا لَوْ تَعْلَمُونَ عِلْمَ الْيَقِينِ لَتَرَوُنَّ الْجَحِيمَ | `f7144941` |
| Ch 42 L5 | Discover card 5 | ثُمَّ لَتَرَوُنَّهَا عَيْنَ الْيَقِينِ ثُمَّ لَتُسْأَلُنَّ يَوْمَئِذٍ عَنِ النَّعِيمِ | `886bc053` |
| Ch 42 L5 | Exercise 2 | حَتَّىٰ زُرْتُمُ الْمَقَابِرَ | `696f74cd` |
| Ch 42 L5 | Exercise 3 | كَلَّا سَوْفَ تَعْلَمُونَ | `2f87b2a3` |
| Ch 42 L5 | Exercise 4 | كَلَّا لَوْ تَعْلَمُونَ عِلْمَ الْيَقِينِ | `d81f84cc` |
| Ch 42 L5 | Exercise 5 | لَتَرَوُنَّ الْجَحِيمَ | `019e11ee` |
| Ch 42 L5 | Exercise 6 | ثُمَّ لَتُسْأَلُنَّ يَوْمَئِذٍ عَنِ النَّعِيمِ | `06fc201e` |
| Ch 42 L5 | Exercise 7 | أَلْهَاكُمُ التَّكَاثُرُ … ثُمَّ لَتُسْأَلُنَّ يَوْمَئِذٍ عَنِ النَّعِيمِ | `371a5f3b` |
| Ch 42 L5 | Exercise 8 | كَلَّا سَوْفَ تَعْلَمُونَ … ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ | `19364acf` |
| Ch 42 L6 | Discover card 1 | الْأَسْئِلَةُ | `4a4c34c7` |
| Ch 42 L6 | Discover card 2 | كَمْ بَيْتًا فِي الْقَرْيَةِ؟ — ٢٠ | `c40ef8b1` |
| Ch 42 L6 | Discover card 3 | لِمَاذَا تَقْرَأُ الْقُرْآنَ؟ — لِأَنَّ الْقُرْآنَ كِتَابُ اللَّهِ. | `453abde5` |
| Ch 42 L6 | Exercise 1 | كَمْ بَيْتًا فِي الْقَرْيَةِ؟ | `d168cb2c` |
| Ch 42 L6 | Exercise 2 | كَمْ ___ رَأَيْتَ؟ | `be0df4c3` |
| Ch 42 L6 | Exercise 3 | مَتَى قَرَأْتَ الْكِتَابَ؟ | `810f84c2` |
| Ch 42 L6 | Exercise 4 | مَتَى سَتَقْرَأُ الْكِتَابَ؟ | `b627c226` |
| Ch 42 L6 | Exercise 5 | لِمَاذَا تَقْرَأُ الْقُرْآنَ؟ | `4348c087` |
| Ch 42 L6 | Exercise 7 | ___ الْكِتَابَ جَمِيلٌ. | `de5c3a61` |
| Ch 42 L6 | Exercise 9 | كَيْفَ حَالُكَ الْيَوْمَ؟ | `29129bee` |
| Ch 42 L6 | Exercise 10 | كَيْفَ تَذْهَبُ إِلَى الْمَسْجِدِ؟ | `ecbb231d` |
| Ch 42 L6 | Exercise 11 | ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ | `fcb6e3f7` |
| Ch 43 L1 | Discover card 1 | الزَّمَنُ فِي الْجُمْلَةِ | `6b88f6f8` |
| Ch 43 L1 | Discover card 2 | أَمْسِ كَتَبَ أَحْمَدُ الدَّرْسَ. | `db4bce3c` |
| Ch 43 L1 | Discover card 3 | الْيَوْمَ يَقْرَأُ أَحْمَدُ كِتَابًا. | `f681a472` |
| Ch 43 L1 | Discover card 4 | غَدًا سَيَذْهَبُ أَحْمَدُ إِلَى الْمَدْرَسَةِ. | `43079db5` |
| Ch 43 L1 | Discover card 6 | أَمْسِ ذَهَبَ أَحْمَدُ إِلَى الْمَسْجِدِ. الْيَوْمَ هُوَ فِي الْمَدْرَسَةِ. غَدًا سَيَذْهَبُ إِلَى الْبَيْتِ. | `e196196a` |
| Ch 43 L1 | Exercise 2 | غَدًا ___ أَحْمَدُ إِلَى الْمَدْرَسَةِ. | `cddc969d` |
| Ch 43 L1 | Exercise 5 | أَمْسِ قَرَأَتْ سَلْمَى كِتَابًا. الْيَوْمَ هِيَ تَكْتُبُ الدَّرْسَ. غَدًا سَتَذْهَبُ إِلَى السُّوقِ. | `d2203a08` |
| Ch 43 L2 | Discover card 1 | أَجْزَاءُ الْجُمْلَةِ | `d653b568` |
| Ch 43 L2 | Discover card 2 | قَرَأَ الطَّالِبُ الْمُجْتَهِدُ كِتَابَ الْمُعَلِّمِ فِي الْفَصْلِ. | `96615824` |
| Ch 43 L2 | Discover card 4 | فَاطِمَةُ طَالِبَةٌ. كِتَابُهَا عَلَى الْمَكْتَبِ. | `f3aa6b93` |
| Ch 43 L2 | Discover card 5 | ـهَا | `f94ce2fd` |
| Ch 43 L2 | Discover card 7 | كَتَبَ الْمُعَلِّمُ الْكَرِيمُ دَرْسَ الطَّالِبَةِ فِي الْبَيْتِ. | `6c43dfb5` |
| Ch 43 L3 | Discover card 1 | سُورَةُ الْكَوْثَرِ | `14b137a6` |
| Ch 43 L3 | Discover card 4 | إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ | `ebd73f8e` |
| Ch 43 L3 | Exercise 4 | إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ فَصَلِّ لِرَبِّكَ وَانْحَرْ إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ | `537d824a` |
| Ch 43 L3 | Exercise 6 | إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ … إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ | `308c2186` |
| Ch 43 L3 | Exercise 7 | إِنَّا أَعْطَيْنَاكَ ___ | `ce8fc401` |
| Ch 43 L4, Ch 43 L5 | Ch 43 L4: Exercise 6; Ch 43 L5: Exercise 5 | وَيْلٌ لِّكُلِّ هُمَزَةٍ لُّمَزَةٍ الَّذِي جَمَعَ مَالًا وَعَدَّدَهُ | `63458087` |
| Ch 43 L4 | Discover card 2 | وَيْلٌ لِّكُلِّ هُمَزَةٍ لُّمَزَةٍ الَّذِي جَمَعَ مَالًا وَعَدَّدَهُ يَحْسَبُ أَنَّ مَالَهُ أَخْلَدَهُ | `ce3d27b9` |
| Ch 43 L4 | Discover card 3 | كَلَّا ۖ لَيُنبَذَنَّ فِي الْحُطَمَةِ وَمَا أَدْرَاكَ مَا الْحُطَمَةُ | `40553873` |
| Ch 43 L4 | Exercise 1 | وَيْلٌ لِّكُلِّ هُمَزَةٍ لُّمَزَةٍ | `ab1548eb` |
| Ch 43 L4 | Exercise 2 | الَّذِي جَمَعَ مَالًا وَعَدَّدَهُ | `cf5bc6c6` |
| Ch 43 L4 | Exercise 4 | كَلَّا ۖ لَيُنبَذَنَّ فِي الْحُطَمَةِ | `81dca51a` |
| Ch 43 L4 | Exercise 5 | وَمَا أَدْرَاكَ مَا الْحُطَمَةُ | `4a713b5f` |
| Ch 43 L5, Ch 43 L9 | Ch 43 L5: Exercise 6; Ch 43 L9: Exercise 6 | نَارُ اللَّهِ الْمُوقَدَةُ الَّتِي تَطَّلِعُ عَلَى الْأَفْئِدَةِ إِنَّهَا عَلَيْهِم مُّؤْصَدَةٌ | `ffbe48d9` |
| Ch 43 L5 | Discover card 2 | نَارُ اللَّهِ الْمُوقَدَةُ الَّتِي تَطَّلِعُ عَلَى الْأَفْئِدَةِ | `4b0ed1e3` |
| Ch 43 L5 | Discover card 3 | إِنَّهَا عَلَيْهِم مُّؤْصَدَةٌ فِي عَمَدٍ مُّمَدَّدَةٍ | `7ecd6f61` |
| Ch 43 L5 | Discover card 4 | هَا، هِمْ | `303afc37` |
| Ch 43 L5 | Exercise 1 | نَارُ اللَّهِ الْمُوقَدَةُ | `cd0cb466` |
| Ch 43 L5 | Exercise 2 | الَّتِي تَطَّلِعُ عَلَى الْأَفْئِدَةِ | `68395682` |
| Ch 43 L5 | Exercise 3 | إِنَّهَا عَلَيْهِم مُّؤْصَدَةٌ | `715693a0` |
| Ch 43 L5 | Exercise 4 | فِي عَمَدٍ مُّمَدَّدَةٍ | `177f02a9` |
| Ch 43 L5 | Exercise 7 | وَمَا أَدْرَاكَ مَا الْحُطَمَةُ … فِي عَمَدٍ مُّمَدَّدَةٍ | `4db941ca` |
| Ch 43 L5 | Exercise 8 | الَّذِي جَمَعَ مَالًا … فِي عَمَدٍ مُّمَدَّدَةٍ | `fb844b46` |
| Ch 43 L6 | Discover card 3 | فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ | `ed8dd804` |
| Ch 43 L6 | Discover card 4 | فَذَلِكَ الَّذِي | `7aeea1f7` |
| Ch 43 L6 | Exercise 2 | فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ | `13bf0402` |
| Ch 43 L6 | Exercise 3 | وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ | `29deebbe` |
| Ch 43 L6 | Exercise 4 | أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ | `45f755aa` |
| Ch 43 L6 | Exercise 7 | أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ … عَلَى طَعَامِ الْمِسْكِينِ | `ef510cc1` |
| Ch 43 L6 | Exercise 8 | وَلَا يَحُضُّ عَلَى طَعَامِ الْمِسْكِينِ | `5614c4c5` |
| Ch 43 L7, Ch 43 L6 | Ch 43 L7: Discover card 1; Ch 43 L6: Discover card 1 | سُورَةُ الْمَاعُونِ | `d4697da9` |
| Ch 43 L7 | Discover card 2 | فَوَيْلٌ لِّلْمُصَلِّينَ الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ | `cdee2805` |
| Ch 43 L7 | Discover card 3 | الَّذِينَ هُمْ يُرَاءُونَ وَيَمْنَعُونَ الْمَاعُونَ | `5994fdb9` |
| Ch 43 L7 | Discover card 5 | الَّذِينَ هُمْ | `5a99dc02` |
| Ch 43 L7 | Exercise 2 | الَّذِينَ هُمْ يُرَاءُونَ | `8cf7bbb1` |
| Ch 43 L7 | Exercise 3 | وَيَمْنَعُونَ الْمَاعُونَ | `cf71f868` |
| Ch 43 L7 | Exercise 4 | فَوَيْلٌ لِّلْمُصَلِّينَ | `943516ba` |
| Ch 43 L7 | Exercise 5 | فَوَيْلٌ لِّلْمُصَلِّينَ الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ الَّذِينَ هُمْ يُرَاءُونَ | `8d6b21d6` |
| Ch 43 L7 | Exercise 7 | وَلَا يَحُضُّ عَلَى طَعَامِ الْمِسْكِينِ … وَيَمْنَعُونَ الْمَاعُونَ | `ee91adc2` |
| Ch 43 L7 | Exercise 8 | أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ … وَيَمْنَعُونَ الْمَاعُونَ | `2e856d57` |
| Ch 43 L8, Ch 43 L9 | Ch 43 L8: Exercise 1; Ch 43 L9: Exercise 9 | هَلْ تُرِيدُ مَاءً؟ | `aa5755d8` |
| Ch 43 L8, Ch 43 L9 | Ch 43 L8: Exercise 2; Ch 43 L9: Exercise 8 | تَفَضَّلْ. هَلْ تُرِيدُ طَعَامًا؟ | `3a5518d8` |
| Ch 43 L8 | Exercise 4 | لَا، شُكْرًا. | `d02304c9` |
| Ch 43 L8 | Exercise 5 | كَمَا تُرِيدُ. | `b7028813` |
| Ch 43 L9 | Discover card 1 | الْفَصْلُ الثَّالِثُ وَالْأَرْبَعُونَ | `962822b7` |
| Ch 43 L9 | Discover card 2 | أَمْسِ قَرَأَ يُوسُفُ كِتَابًا. غَدًا سَيَكْتُبُ الدَّرْسَ. | `ba60e360` |
| Ch 43 L9 | Discover card 3 | سَلْمَى مُعَلِّمَةٌ. قَلَمُهَا فِي الْفَصْلِ. | `f259eccc` |
| Ch 43 L9 | Exercise 2 | أَمْسِ ___ يُوسُفُ الدَّرْسَ. | `be9ab446` |
| Ch 43 L9 | Exercise 3 | جَلَسَتِ الطَّالِبَةُ الْمُجْتَهِدَةُ فِي الْفَصْلِ. | `4c898ac3` |
| Ch 43 L9 | Exercise 7 | أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ | `59001d1c` |
| Ch 45 L3, Ch 45 L4 | Ch 45 L3: Discover card 2; Ch 45 L4: Discover card 4 | أَدْرُسُ كَيْ أَنْجَحَ. | `dded427b` |
| Ch 45 L3 | Discover card 1 | الْغَرَضُ: كَيْ وَلِـ | `ea89ee0b` |
| Ch 45 L3 | Discover card 3 | أَدْرُسُ لِأَنْجَحَ. | `ecdc2547` |
| Ch 45 L3 | Discover card 4 | لِـ لِلِاسْمِ وَلِلْفِعْلِ | `a1fa7f05` |
| Ch 45 L3 | Discover card 6 | كَيْ نُسَبِّحَكَ كَثِيرًا | `c574c635` |
| Ch 45 L3 | Discover card 7 | لِتُخْرِجَ النَّاسَ مِنَ الظُّلُمَاتِ إِلَى النُّورِ | `808092fd` |
| Ch 45 L3 | Exercise 2 | أَدْرُسُ كَيْ ___. | `1126e9ed` |
| Ch 45 L3 | Exercise 3 | أَجْلِسُ لِأَكْتُبَ الدَّرْسَ. | `20d820ed` |
| Ch 45 L3 | Exercise 4 | أَجْلِسُ ___ الدَّرْسَ. | `559c57c7` |
| Ch 45 L3 | Exercise 5 | أَذْهَبُ إِلَى الْمَدْرَسَةِ كَيْ ___. | `d97ee878` |
| Ch 45 L3 | Exercise 6 | الْكِتَابُ لِلطَّالِبِ. | `411627c3` |
| Ch 45 L4 | Discover card 1 | حَتَّى لِلْغَايَةِ | `11a872b9` |
| Ch 45 L4 | Discover card 2 | أَجْلِسُ هُنَا حَتَّى يَحْضُرَ الْمُعَلِّمُ. | `e40fa786` |
| Ch 45 L4 | Discover card 3 | أَدْرُسُ حَتَّى أَنْجَحَ. | `7393b858` |
| Ch 45 L4 | Discover card 6 | حَتَّىٰ يَرْجِعَ إِلَيْنَا مُوسَىٰ | `2806e31a` |
| Ch 45 L4 | Discover card 7 | لَنْ نَبْرَحَ … حَتَّىٰ يَرْجِعَ | `8fb1e193` |
| Ch 45 L4 | Exercise 3 | أَجْلِسُ هُنَا حَتَّى ___ أَخِي. | `ac5781c7` |
| Ch 45 L4 | Exercise 4 | أَدْرُسُ حَتَّى ___. | `ab650c6b` |
| Ch 45 L4 | Exercise 7 | قَالُوا لَن نَّبْرَحَ عَلَيْهِ عَاكِفِينَ حَتَّىٰ يَرْجِعَ إِلَيْنَا مُوسَىٰ | `7f44198d` |

## Conversation Lab phrase clips (not in the catalogue audit)

CL13 (Chapter 43, `ch43-l04`) plays its phrases from `audio/phrases/<id>.mp3`.
`npm run audio:prebuild-fixtures` uploads a missing one, but it has not been run.
Until the owner asks, the speaker button on these ten phrases plays nothing.

| Phrase id | Arabic |
|---|---|
| `ch43-cl-p01` | السَّلَامُ عَلَيْكُمْ. |
| `ch43-cl-p02` | وَعَلَيْكُمُ السَّلَامُ. |
| `ch43-cl-p03` | هَلْ تُرِيدُ مَاءً؟ |
| `ch43-cl-p04` | نَعَمْ، شُكْرًا. |
| `ch43-cl-p05` | تَفَضَّلْ. هَلْ تُرِيدُ طَعَامًا؟ |
| `ch43-cl-p06` | لَا، شُكْرًا. |
| `ch43-cl-p07` | كَمَا تُرِيدُ. |
| `ch43-cl-p08` | جَزَاكَ اللَّهُ خَيْرًا. |
| `ch43-cl-p09` | وَإِيَّاكَ. |
| `ch43-cl-p10` | السَّلَامُ عَلَيْكُمْ، يَا أَخِي. |

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
| Ch 62 L5 (SP10) | sp10-ph07 (`audio/phrases/allahumma-tasallam.mp3`) | رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً |

### Fix the text before generating these two

- **Ch 70 L6 card 1** and **Ch 72 L6 card 3** are unvoweled heading/label text,
  not learning Arabic. Voicing them as they stand would read a bare label aloud
  with guessed vowels. Either vowel them fully or move them out of the audio
  field during the rewrite; then re-run the audit, since the key changes with the
  text.
