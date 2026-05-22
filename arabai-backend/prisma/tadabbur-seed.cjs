// Tadabbur seed — 11 Surahs with full Arabic text and word-level VocabularyWord links.
// vocabKey entries are looked up against VocabularyWord.arabicPlain at seed time.
// Words without a vocabKey always render as Sage in the UI.

/** Strip harakat from Arabic text */
function stripHarakat(text) {
  return text.replace(/[ً-ٰٟ]/g, "").trim();
}

/** Split an ayah into word tokens */
function tokenize(arabic) {
  return arabic.trim().split(/\s+/).filter(Boolean);
}

/** Build word list for one ayah, supplying optional manual vocabKey overrides */
function words(arabic, overrides = {}) {
  return tokenize(arabic).map((w, pos) => ({
    pos,
    arabic: w,
    arabicPlain: stripHarakat(w),
    vocabKey: overrides[pos] ?? null,
  }));
}

// The 11 Surahs in progression order.
// vocabKey values map to VocabularyWord.arabicPlain (looked up at seed time).
const SURAHS = [
  {
    orderInProg: 1, surahNumber: 1,
    nameAr: "الْفَاتِحَة", nameEn: "Al-Fatiha", meaningEn: "The Opening",
    totalAyat: 7,
    ayat: [
      {
        n: 1, ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        en: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        ov: { 1: "الله", 2: "الرحمن", 3: "الرحيم" },
      },
      {
        n: 2, ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        en: "All praise is due to Allah, Lord of the worlds.",
        ov: { 1: "الله", 2: "رب" },
      },
      {
        n: 3, ar: "الرَّحْمَٰنِ الرَّحِيمِ",
        en: "The Entirely Merciful, the Especially Merciful.",
        ov: { 0: "الرحمن", 1: "الرحيم" },
      },
      {
        n: 4, ar: "مَالِكِ يَوْمِ الدِّينِ",
        en: "Sovereign of the Day of Recompense.",
        ov: { 1: "يوم", 2: "دين" },
      },
      {
        n: 5, ar: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        en: "It is You we worship and You we ask for help.",
        ov: {},
      },
      {
        n: 6, ar: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        en: "Guide us to the straight path.",
        ov: {},
      },
      {
        n: 7, ar: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        en: "The path of those upon whom You have bestowed favor, not of those who have earned anger or of those who are astray.",
        ov: {},
      },
    ],
  },
  {
    orderInProg: 2, surahNumber: 114,
    nameAr: "النَّاس", nameEn: "An-Nas", meaningEn: "Mankind",
    totalAyat: 6,
    ayat: [
      { n: 1, ar: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", en: "Say, I seek refuge in the Lord of mankind.", ov: { 3: "رب", 4: "ناس" } },
      { n: 2, ar: "مَلِكِ النَّاسِ", en: "The Sovereign of mankind.", ov: { 1: "ناس" } },
      { n: 3, ar: "إِلَٰهِ النَّاسِ", en: "The God of mankind.", ov: { 1: "ناس" } },
      { n: 4, ar: "مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", en: "From the evil of the retreating whisperer.", ov: {} },
      { n: 5, ar: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", en: "Who whispers into the breasts of mankind.", ov: { 5: "ناس" } },
      { n: 6, ar: "مِنَ الْجِنَّةِ وَالنَّاسِ", en: "From among the jinn and mankind.", ov: { 2: "ناس" } },
    ],
  },
  {
    orderInProg: 3, surahNumber: 113,
    nameAr: "الْفَلَق", nameEn: "Al-Falaq", meaningEn: "The Daybreak",
    totalAyat: 5,
    ayat: [
      { n: 1, ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", en: "Say, I seek refuge in the Lord of daybreak.", ov: { 3: "رب" } },
      { n: 2, ar: "مِنْ شَرِّ مَا خَلَقَ", en: "From the evil of that which He created.", ov: {} },
      { n: 3, ar: "وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ", en: "And from the evil of darkness when it settles.", ov: {} },
      { n: 4, ar: "وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", en: "And from the evil of those who blow on knots.", ov: {} },
      { n: 5, ar: "وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ", en: "And from the evil of an envier when he envies.", ov: {} },
    ],
  },
  {
    orderInProg: 4, surahNumber: 112,
    nameAr: "الْإِخْلَاص", nameEn: "Al-Ikhlas", meaningEn: "Sincerity",
    totalAyat: 4,
    ayat: [
      { n: 1, ar: "قُلْ هُوَ اللَّهُ أَحَدٌ", en: "Say, He is Allah, the One.", ov: { 2: "الله" } },
      { n: 2, ar: "اللَّهُ الصَّمَدُ", en: "Allah, the Eternal Refuge.", ov: { 0: "الله" } },
      { n: 3, ar: "لَمْ يَلِدْ وَلَمْ يُولَدْ", en: "He neither begets nor is born.", ov: {} },
      { n: 4, ar: "وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ", en: "Nor is there to Him any equivalent.", ov: {} },
    ],
  },
  {
    orderInProg: 5, surahNumber: 111,
    nameAr: "الْمَسَد", nameEn: "Al-Masad", meaningEn: "The Palm Fibre",
    totalAyat: 5,
    ayat: [
      { n: 1, ar: "تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ", en: "May the hands of Abu Lahab be ruined, and ruined is he.", ov: {} },
      { n: 2, ar: "مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ", en: "His wealth will not avail him or that which he gained.", ov: {} },
      { n: 3, ar: "سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ", en: "He will enter a fire of blazing flame.", ov: { 2: "نار" } },
      { n: 4, ar: "وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ", en: "And his wife, the carrier of firewood.", ov: {} },
      { n: 5, ar: "فِي جِيدِهَا حَبْلٌ مِنْ مَسَدٍ", en: "Around her neck is a rope of twisted fibre.", ov: {} },
    ],
  },
  {
    orderInProg: 6, surahNumber: 110,
    nameAr: "النَّصْر", nameEn: "An-Nasr", meaningEn: "The Divine Support",
    totalAyat: 3,
    ayat: [
      { n: 1, ar: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", en: "When the victory of Allah has come and the conquest.", ov: { 3: "الله" } },
      { n: 2, ar: "وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا", en: "And you see the people entering into the religion of Allah in multitudes.", ov: { 2: "ناس", 5: "دين", 6: "الله" } },
      { n: 3, ar: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ إِنَّهُ كَانَ تَوَّابًا", en: "Then exalt with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance.", ov: { 3: "رب" } },
    ],
  },
  {
    orderInProg: 7, surahNumber: 109,
    nameAr: "الْكَافِرُون", nameEn: "Al-Kafirun", meaningEn: "The Disbelievers",
    totalAyat: 6,
    ayat: [
      { n: 1, ar: "قُلْ يَا أَيُّهَا الْكَافِرُونَ", en: "Say, O disbelievers.", ov: {} },
      { n: 2, ar: "لَا أَعْبُدُ مَا تَعْبُدُونَ", en: "I do not worship what you worship.", ov: {} },
      { n: 3, ar: "وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ", en: "Nor are you worshippers of what I worship.", ov: {} },
      { n: 4, ar: "وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ", en: "Nor will I be a worshipper of what you worship.", ov: {} },
      { n: 5, ar: "وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ", en: "Nor will you be worshippers of what I worship.", ov: {} },
      { n: 6, ar: "لَكُمْ دِينُكُمْ وَلِيَ دِينِ", en: "For you is your religion, and for me is my religion.", ov: { 1: "دين", 3: "دين" } },
    ],
  },
  {
    orderInProg: 8, surahNumber: 108,
    nameAr: "الْكَوْثَر", nameEn: "Al-Kawthar", meaningEn: "Abundance",
    totalAyat: 3,
    ayat: [
      { n: 1, ar: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", en: "Indeed, We have granted you Al-Kawthar.", ov: {} },
      { n: 2, ar: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", en: "So pray to your Lord and sacrifice.", ov: { 2: "رب", 3: "صلاة" } },
      { n: 3, ar: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", en: "Indeed, your enemy is the one cut off.", ov: {} },
    ],
  },
  {
    orderInProg: 9, surahNumber: 107,
    nameAr: "الْمَاعُون", nameEn: "Al-Ma'un", meaningEn: "Small Kindnesses",
    totalAyat: 7,
    ayat: [
      { n: 1, ar: "أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ", en: "Have you seen the one who denies the Recompense?", ov: { 4: "دين" } },
      { n: 2, ar: "فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ", en: "For that is the one who drives away the orphan.", ov: {} },
      { n: 3, ar: "وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ", en: "And does not encourage the feeding of the poor.", ov: { 3: "طعام" } },
      { n: 4, ar: "فَوَيْلٌ لِلْمُصَلِّينَ", en: "So woe to those who pray.", ov: {} },
      { n: 5, ar: "الَّذِينَ هُمْ عَنْ صَلَاتِهِمْ سَاهُونَ", en: "Those who are heedless of their prayer.", ov: { 3: "صلاة" } },
      { n: 6, ar: "الَّذِينَ هُمْ يُرَاءُونَ", en: "Those who make show of their deeds.", ov: {} },
      { n: 7, ar: "وَيَمْنَعُونَ الْمَاعُونَ", en: "And withhold small kindnesses.", ov: {} },
    ],
  },
  {
    orderInProg: 10, surahNumber: 106,
    nameAr: "قُرَيْش", nameEn: "Quraysh", meaningEn: "Quraysh",
    totalAyat: 4,
    ayat: [
      { n: 1, ar: "لِإِيلَافِ قُرَيْشٍ", en: "For the accustomed security of the Quraysh.", ov: {} },
      { n: 2, ar: "إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ", en: "Their accustomed security in the journeys of winter and summer.", ov: {} },
      { n: 3, ar: "فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ", en: "Let them worship the Lord of this House.", ov: { 2: "رب", 4: "بيت" } },
      { n: 4, ar: "الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَآمَنَهُمْ مِنْ خَوْفٍ", en: "Who has fed them, saving them from hunger, and made them safe, saving them from fear.", ov: {} },
    ],
  },
  {
    orderInProg: 11, surahNumber: 105,
    nameAr: "الْفِيل", nameEn: "Al-Fil", meaningEn: "The Elephant",
    totalAyat: 5,
    ayat: [
      { n: 1, ar: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ", en: "Have you not considered how your Lord dealt with the companions of the elephant?", ov: { 4: "رب" } },
      { n: 2, ar: "أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ", en: "Did He not make their plot into misguidance?", ov: {} },
      { n: 3, ar: "وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ", en: "And He sent against them birds in flocks.", ov: { 3: "طير" } },
      { n: 4, ar: "تَرْمِيهِمْ بِحِجَارَةٍ مِنْ سِجِّيلٍ", en: "Striking them with stones of hard clay.", ov: {} },
      { n: 5, ar: "فَجَعَلَهُمْ كَعَصْفٍ مَأْكُولٍ", en: "And He made them like eaten straw.", ov: {} },
    ],
  },
];

async function seedTadabbur(prisma) {
  // Build a lookup map from arabicPlain → VocabularyWord.id
  const allVocab = await prisma.vocabularyWord.findMany({ select: { id: true, arabicPlain: true } });
  const vocabMap = {};
  for (const v of allVocab) {
    vocabMap[v.arabicPlain] = v.id;
  }

  // Delete existing Tadabbur data
  await prisma.userSurahProgress.deleteMany();
  await prisma.tadabburSurah.deleteMany();

  for (const s of SURAHS) {
    const ayatData = s.ayat.map((ayah) => {
      const wordList = tokenize(ayah.ar).map((w, pos) => {
        const plain = stripHarakat(w);
        const vocabKey = ayah.ov[pos] ?? null;
        const vocabId = vocabKey ? (vocabMap[vocabKey] ?? null) : null;
        return { pos, arabic: w, arabicPlain: plain, vocabId };
      });
      return {
        ayahNumber: ayah.n,
        arabic: ayah.ar,
        translationEn: ayah.en,
        words: wordList,
      };
    });

    await prisma.tadabburSurah.create({
      data: {
        orderInProg: s.orderInProg,
        surahNumber: s.surahNumber,
        nameAr: s.nameAr,
        nameEn: s.nameEn,
        meaningEn: s.meaningEn,
        totalAyat: s.totalAyat,
        ayatData,
      },
    });
  }

  console.log(`Seeded ${SURAHS.length} Tadabbur Surahs`);
}

module.exports = { seedTadabbur };
