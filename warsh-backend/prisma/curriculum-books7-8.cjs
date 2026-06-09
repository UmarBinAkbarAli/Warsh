const LABELS = ["مبتدأ", "خبر", "حرف جر", "مضاف", "مضاف إليه", "فعل", "فاعل", "مفعول"];

const { localizeMetadata } = require("./urdu-metadata.cjs");

function card(arabicText, translation, transliteration = "") {
  return { arabicText, translation, transliteration };
}

function pair(left, right) {
  return { left, right };
}

function token(word, label, gloss) {
  return { word, label, gloss };
}

function exerciseSet(spec, lessonIndex) {
  const [first, second, third] = spec.examples;
  const buildTiles = third.arabicText.split(" ").reverse();
  const buildOptions = buildTiles.length >= 2 ? buildTiles : [third.arabicText, second.arabicText, first.arabicText];
  const exercises = [
    {
      type: "TRUE_FALSE",
      prompt: `In this pattern, "${first.translation}" belongs to today's lesson focus.`,
      arabicText: first.arabicText,
      options: ["True", "False"],
      correctAnswer: "True",
    },
    {
      type: "TAP_TRANSLATION",
      prompt: "What does this Arabic mean?",
      arabicText: second.arabicText,
      options: [second.translation, first.translation, third.translation, spec.distractor],
      correctAnswer: second.translation,
    },
    {
      type: "FILL_BLANK",
      prompt: "Choose the missing Arabic word.",
      arabicText: `___ ${first.arabicText.split(" ").slice(1).join(" ")}`,
      options: [first.arabicText.split(" ")[0], second.arabicText.split(" ")[0], third.arabicText.split(" ")[0], spec.blankDistractor],
      correctAnswer: first.arabicText.split(" ")[0],
    },
    {
      type: "BUILD_SENTENCE",
      prompt: `Build: ${third.translation}`,
      arabicText: "",
      options: buildOptions,
      correctAnswer: third.arabicText,
    },
    {
      type: "GRAMMAR_PARSE",
      prompt: "Label the role of each word in a sentence you have already seen.",
      arabicText: spec.parseText,
      parseTokens: spec.parseTokens,
      labels: LABELS,
    },
  ];

  return exercises.map((exercise, index) => ({
    ...exercise,
    explanation: index === 0 ? "This quick check resets the pace before production." : "The answer follows the pattern you saw in Discover.",
    lessonBeat: lessonIndex,
  }));
}

function makeLesson(spec, lessonIndex, focus) {
  const rotatedExamples = [
    spec.examples[(lessonIndex - 1) % spec.examples.length],
    spec.examples[lessonIndex % spec.examples.length],
    spec.examples[(lessonIndex + 1) % spec.examples.length],
  ];
  const lessonSpec = { ...spec, examples: rotatedExamples };

  return {
    title: focus.title,
    titleUr: localizeMetadata(focus.title),
    titleAr: focus.titleAr,
    type: "VOCABULARY",
    xpReward: 10,
    content: {
      sourceFile: spec.sourceFile,
      lectureTitle: spec.title,
      focus: focus.title,
      ustadh_noor_tip_en: `${spec.noorTip} Look for ${spec.hook.highlightedWord} in ${spec.hook.ayahRef} tonight.`,
      ustadh_noor_tip_ur: spec.noorTipUr,
    },
    hook: {
      ayahAr: spec.hook.ayahAr,
      ayahRef: spec.hook.ayahRef,
      question: focus.hookQuestion,
    },
    discoverCards: rotatedExamples.map((item) => card(item.arabicText, item.translation, item.transliteration)),
    exercises: exerciseSet(lessonSpec, lessonIndex),
    revealText: `${focus.reveal} Classical scholars name this ${focus.grammarTerm}. You met the pattern first, then the label.`,
    revealAyah: {
      ayahAr: spec.hook.ayahAr,
      ayahRef: spec.hook.ayahRef,
      highlightedWord: spec.hook.highlightedWord,
    },
    fatihaProgressDelta: focus.fatihaProgressDelta ?? 1,
  };
}

function chapter(spec) {
  return {
    order: spec.order,
    title: spec.title,
    titleUr: localizeMetadata(spec.title),
    titleAr: spec.titleAr,
    description: spec.description,
    descriptionUr: localizeMetadata(spec.description),
    worldMapX: Number((0.08 + spec.order * 0.055).toFixed(2)),
    worldMapY: Number((0.12 + (spec.order % 5) * 0.14).toFixed(2)),
    isLocked: true,
    lessons: spec.focuses.map((focus, index) => makeLesson(spec, index + 1, focus)),
  };
}

const specs = [

  // ── Ch60 ── Travel, Schedules, and Hajj Conversation ─────────────────────
  {
    order: 60,
    sourceFile: "reader_lecture_60_travel_hajj.md",
    title: "Travel, Schedules, and Hajj Conversation",
    titleAr: "السَّفَر وَالْمَوَاعِيد وَحِوَار الْحَجّ",
    description: "Practical travel and Hajj vocabulary with real conversation patterns.",
    hook: { ayahAr: "وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا", ayahRef: "Al-Hajj 22:27", highlightedWord: "بِالْحَجِّ" },
    examples: [
      card("مَتَى يُسَافِرُ الْحُجَّاجُ إِلَى مَكَّةَ؟", "When do the pilgrims travel to Makkah?", "mataa yusaafiru al-hujjaaju ilaa makkata"),
      card("سَنَذْهَبُ إِلَى الْحَجِّ هَذَا الْعَام إِنْ شَاءَ اللَّهُ", "We will go for Hajj this year, in shaa Allah", "sanadh-habu ilal-hajji haadhal-'aama in shaa'a allah"),
      card("الرِّحْلَةُ تَسْتَغْرِقُ عَشْرَ سَاعَاتٍ بِالطَّائِرَةِ", "The journey takes ten hours by plane", "ar-rihlatu tastaghriqua 'ashra saa'aatin bit-taa'ira"),
      card("وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا", "Proclaim to the people the Hajj — they will come to you on foot", "wa adhdhin fin-naasi bil-hajji ya'tooka rijaalan"),
    ],
    parseText: "سَنَذْهَبُ إِلَى الْحَجِّ هَذَا الْعَام",
    parseTokens: [token("سَنَذْهَبُ", "فعل", "we will go"), token("إِلَى", "حرف جر", "to"), token("الْحَجِّ", "مضاف إليه", "Hajj"), token("هَذَا", "مبتدأ", "this"), token("الْعَام", "مضاف إليه", "year")],
    conversation: ["هَلْ ذَهَبْتَ إِلَى الْحَجِّ؟", "لَا، لَمْ أَذْهَبْ بَعْدُ وَلٰكِنِّي أَتَمَنَّى ذَلِكَ"],
    conversationDistractor: "هُوَ الَّذِي أَرْسَلَ رَسُولَهُ بِالْهُدَى",
    distractor: "He sent His messenger with guidance",
    blankDistractor: "بِالسَّيَّارَة",
    noorTip: "يَأْتُوكَ is مجزوم — a response to the command أَذِّن (the grammar of جواب الطلب, coming in Chapter 69).",
    noorTipUr: "یَأْتُوکَ مجزوم ہے — امر کے جواب میں فعل مجزوم آتا ہے، یہ جواب الطلب ہے۔",
    focuses: [
      { title: "Hajj Vocabulary", titleAr: "مُفْرَدَات الْحَجّ", grammarTerm: "مفردات", reveal: "You built the essential vocabulary for every South Asian Muslim's greatest aspiration — the Hajj journey.", hookQuestion: "What is the Arabic for pilgrim, plane, journey, and Makkah?" },
      { title: "إِنْ شَاءَ اللَّهُ — If Allah Wills", titleAr: "إِنْ شَاءَ اللَّه", grammarTerm: "جملة شرطية", reveal: "You parsed إِنْ شَاءَ اللَّهُ as a conditional sentence: if (إِنْ) + Allah (اللَّهُ) wills (شَاءَ).", hookQuestion: "What is the grammar behind the phrase إِنْ شَاءَ اللَّه?" },
      { title: "Travel Time Expressions", titleAr: "تَعْبِيرَات وَقْت السَّفَر", grammarTerm: "ظرف زمان", reveal: "You expressed journey duration using a number + time unit + preposition of means.", hookQuestion: "How would you say 'The journey takes two days by bus'?" },
      { title: "The Divine Proclamation", titleAr: "النِّدَاء الإِلَهِيّ لِلْحَجّ", grammarTerm: "فعل أمر + جواب الطلب", reveal: "You read Allah's command to Ibrahim to call humanity to Hajj — and parsed the jussive response يَأْتُوكَ.", hookQuestion: "What does يَأْتُوكَ tell you about who responds to the call?" },
      { title: "Describing Arrival", titleAr: "وَصْف الْوُصُول", grammarTerm: "حال + ظرف", reveal: "You saw رِجَالًا as a descriptive accusative (حال) — they will come on foot (in the state of walking).", hookQuestion: "Why is رِجَالًا with fatḥa in يَأْتُوكَ رِجَالًا?" },
    ],
  },

  // ── Ch61 ── Trade, Weights, and Instrument Nouns ──────────────────────────
  {
    order: 61,
    sourceFile: "reader_lecture_61_trade_instrument_nouns.md",
    title: "Trade, Weights, and Instrument Nouns",
    titleAr: "التِّجَارَة وَالْمَوَازِين وَاسْم الْآلَة",
    description: "Honest trade vocabulary and the مِفْعَال/مِفْعَل morphology of instrument nouns.",
    hook: { ayahAr: "وَيْلٌ لِلْمُطَفِّفِينَ الَّذِينَ إِذَا اكْتَالُوا عَلَى النَّاسِ يَسْتَوْفُونَ", ayahRef: "Al-Mutaffifin 83:1-2", highlightedWord: "الْمُطَفِّفِينَ" },
    examples: [
      card("الْمِيزَانُ آلَةُ الْوَزْنِ وَالْمِكْيَالُ آلَةُ الْكَيْلِ", "The scale is for weighing and the measure is for measuring", "al-meezaanu aalatul-wazni wal-mikyaalu aalatul-kayl"),
      card("بَاعَ التَّاجِرُ الْبِضَاعَةَ بِسِعْرٍ عَادِلٍ", "The merchant sold the goods at a fair price", "baa'at-taajiru al-bidaa'ata bisir'in 'aadil"),
      card("مِفْتَاحٌ مِنْ فَتَحَ — وَمِصْبَاحٌ مِنْ صَبَحَ", "A key from 'opened' and a lamp from 'became morning'", "miftaahun min fataha — wa misbahun min sabaha"),
      card("وَيْلٌ لِلْمُطَفِّفِينَ الَّذِينَ يَبْخَسُونَ فِي الْكَيْلِ", "Woe to those who give short measure", "waylun lil-mutaffifeena alladheena yabkhisoona fil-kayl"),
    ],
    parseText: "الْمِيزَانُ آلَةُ الْوَزْنِ",
    parseTokens: [token("الْمِيزَانُ", "مبتدأ", "the scale"), token("آلَةُ", "خبر", "instrument of"), token("الْوَزْنِ", "مضاف إليه", "weighing")],
    conversation: ["مَا اسْمُ الآلَةِ مِنَ الْكِتَابَة؟", "الآلَةُ مِنَ الْكِتَابَةِ هِيَ الْمِكْتَبَة أَوِ الْمِقْلَمَة"],
    conversationDistractor: "سَنَذْهَبُ إِلَى الْحَجِّ هَذَا الْعَام",
    distractor: "We will go for Hajj this year",
    blankDistractor: "الْمِصْفَاة",
    noorTip: "مِيزَان is an instrument noun (مِفْعَال pattern) from وَزَنَ — the scales of justice weigh every deed.",
    noorTipUr: "مِیزَان مِفْعَال کے وزن پر ہے، وَزَنَ سے — انصاف کی ترازو ہر عمل تولتی ہے۔",
    focuses: [
      { title: "Trade Vocabulary", titleAr: "مُفْرَدَات التِّجَارَة", grammarTerm: "مفردات", reveal: "You built essential commercial vocabulary — الْبَيْع (selling), الشِّرَاء (buying), الثَّمَن (price), التَّاجِر (merchant).", hookQuestion: "What is the Arabic for price, goods, merchant, and fair?" },
      { title: "مِفْعَال — Instrument Pattern 1", titleAr: "وَزْن مِفْعَال", grammarTerm: "اسم الآلة", reveal: "You derived instrument nouns using the مِفْعَال pattern: مِيزَان (scale) from وَزَنَ, مِفْتَاح (key) from فَتَحَ.", hookQuestion: "What is the verb root of مِفْتَاح, and what does the noun mean?" },
      { title: "مِفْعَل — Instrument Pattern 2", titleAr: "وَزْن مِفْعَل", grammarTerm: "اسم الآلة", reveal: "You learned the shorter pattern مِفْعَل: مِبْرَد (file/rasp) from بَرَدَ, مِكْنَسَة (broom) from كَنَسَ.", hookQuestion: "Derive an instrument noun from the verb طَبَعَ (to print)." },
      { title: "مِصْبَاح — A Quranic Instrument Noun", titleAr: "مِصْبَاح فِي الْقُرْآن", grammarTerm: "اسم الآلة قرآني", reveal: "You saw مِصْبَاح (lamp) in Ayat al-Nur — وَجَعَلْنَا السِّرَاجَ وَهَّاجًا. Instrument nouns are everywhere in the Quran.", hookQuestion: "Find the verse where مِصْبَاح appears and name its grammatical role." },
      { title: "Woe to the Cheaters", titleAr: "الْمُطَفِّفُون", grammarTerm: "اسم فاعل + وَيْل", reveal: "You parsed وَيْلٌ لِلْمُطَفِّفِينَ — وَيْلٌ is the مبتدأ and لِلْمُطَفِّفِينَ is its خبر (a prepositional phrase predicate).", hookQuestion: "What grammatical role does وَيْلٌ play in the sentence?" },
      { title: "Honest Commerce", titleAr: "التِّجَارَة الْعَادِلَة", grammarTerm: "وصف القيمة", reveal: "You expressed fair pricing with an adjectival complement — بِسِعْرٍ عَادِلٍ, where عَادِلٍ agrees with سِعْرٍ in case and number.", hookQuestion: "How do you say 'at an unfair price' by changing one word?" },
    ],
  },

  // ── Ch62 ── Demonstratives and Description Spiral ─────────────────────────
  {
    order: 62,
    sourceFile: "reader_lecture_62_demonstratives_spiral.md",
    title: "Demonstratives and Description — Spiral Review",
    titleAr: "الإِشَارَة وَالْوَصْف — مُرَاجَعَة حَلَزُونِيَّة",
    description: "Demonstratives and descriptive structures revisited with full i'rab awareness.",
    hook: { ayahAr: "ذَلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِلْمُتَّقِينَ", ayahRef: "Al-Baqarah 2:2", highlightedWord: "ذَلِكَ" },
    examples: [
      card("ذَلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ", "That is the Book — there is no doubt in it", "dhaalikaal-kitaabu laa rayba feeh"),
      card("هَؤُلَاءِ هُمُ الصَّادِقُونَ", "These are the truthful ones", "haa'ulaa'i humu as-saadiqoon"),
      card("أُولَئِكَ عَلَى هُدًى مِن رَّبِّهِمْ", "Those are upon guidance from their Lord", "ulaa'ika 'alaa hudan min rabbihim"),
      card("هَذَا الْمَسْجِدُ بَنَاهُ الصَّحَابَةُ", "This mosque — the companions built it", "haadhal-masjidu banaahu as-sahaabatu"),
    ],
    parseText: "ذَلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ",
    parseTokens: [token("ذَلِكَ", "مبتدأ", "that"), token("الْكِتَابُ", "بدل", "the Book"), token("لَا", "نافية للجنس", "no"), token("رَيْبَ", "اسم لا", "doubt"), token("فِيهِ", "خبر", "in it")],
    conversation: ["أَيُّ كِتَابٍ هَذَا؟", "هَذَا هُوَ الْقُرْآنُ الْكَرِيمُ"],
    conversationDistractor: "الْمِيزَانُ آلَةُ الْوَزْن",
    distractor: "The scale is the instrument of weighing",
    blankDistractor: "هَذِهِ",
    noorTip: "ذَلِكَ الْكِتَابُ — the distant demonstrative for the Quran points to its elevated, transcendent nature.",
    noorTipUr: "ذَلِكَ دور کی اشارہ ہے — قرآن کے لیے استعمال اس کی بلندی اور عظمت کا اظہار ہے۔",
    focuses: [
      { title: "Near vs Far Demonstratives", titleAr: "الإِشَارَة الْقَرِيبَة وَالْبَعِيدَة", grammarTerm: "اسم إشارة", reveal: "You contrasted هَذَا (this — near) with ذَلِكَ (that — far) and saw that Arabic uses distance deliberately.", hookQuestion: "Why does Al-Baqarah 2:2 use ذَلِكَ (far) for a book being presented?" },
      { title: "لَا النَّافِيَة لِلْجِنْس", titleAr: "لَا لِنَفْيِ الْجِنْس", grammarTerm: "لا النافية للجنس", reveal: "You parsed لَا رَيْبَ — a special لَا that negates an entire category: 'no doubt of any kind'.", hookQuestion: "How is لَا رَيْبَ فِيهِ stronger than لَيْسَ فِيهِ رَيْبٌ?" },
      { title: "Plural Demonstratives", titleAr: "هَؤُلَاءِ وَأُولَئِكَ", grammarTerm: "اسم إشارة الجمع", reveal: "You revisited the plural demonstratives — هَؤُلَاءِ (these) and أُولَئِكَ (those) — now with full i'rab analysis.", hookQuestion: "What is the case of أُولَئِكَ in أُولَئِكَ هُمُ الْمُفْلِحُونَ?" },
      { title: "الْبَدَل — Appositive", titleAr: "الْبَدَل", grammarTerm: "بدل", reveal: "You parsed ذَلِكَ الْكِتَابُ — الْكِتَابُ is a بدل (appositive) that clarifies the demonstrative, matching its case.", hookQuestion: "What is a بدل and what is its grammatical rule?" },
    ],
  },

  // ── Ch63 ── إضافة Effects and حذف النون ──────────────────────────────────
  {
    order: 63,
    sourceFile: "reader_lecture_63_idafa_effects.md",
    title: "Idafa Effects and حذف النون",
    titleAr: "أَثَر الإِضَافَة وَحَذْف النُّون",
    description: "What happens to duals and sound masculine plurals when they enter an idafa construction.",
    hook: { ayahAr: "مُسْلِمِي هَذِهِ الأُمَّةِ وَمُؤْمِنِيهَا", ayahRef: "Classical phrase", highlightedWord: "مُسْلِمِي" },
    examples: [
      card("الْمُسْلِمُونَ ← مُسْلِمُو الْبَلَدِ (حُذِفَتِ النُّون)", "Muslims → Muslims of the country (ن drops in idafa)", "al-muslimoona ← muslimoo al-balad (hudhifat an-noon)"),
      card("الْمُؤْمِنَانِ ← مُؤْمِنَا الْقَرْيَةِ (حُذِفَتِ النُّون)", "Two believers → the two believers of the village (ن drops)", "al-mu'minaani ← mu'minaa al-qaryati (hudhifat an-noon)"),
      card("مُعَلِّمُو الْمَدْرَسَةِ كِرَامٌ", "The teachers of the school are honourable", "mu'allimu al-madrasati kiraam"),
      card("طَالِبَا الْعِلْمِ حَاضِرَانِ", "The two students of knowledge are present", "taalibaa al-'ilmi haadhiraani"),
    ],
    parseText: "مُعَلِّمُو الْمَدْرَسَةِ كِرَامٌ",
    parseTokens: [token("مُعَلِّمُو", "مبتدأ", "teachers of"), token("الْمَدْرَسَةِ", "مضاف إليه", "the school"), token("كِرَامٌ", "خبر", "honourable")],
    conversation: ["كَيْفَ تَقُول 'مُسْلِمُو مَكَّة'؟", "تَحْذِفُ النُّونَ وَتَضُمُّ مُسْلِمِي بِمَعْنَى مُسْلِمُو"],
    conversationDistractor: "هَؤُلَاءِ هُمُ الصَّادِقُونَ",
    distractor: "These are the truthful ones",
    blankDistractor: "الطُّلَّاب",
    noorTip: "حَذْف النُّون (dropping ن) in idafa is a rule that catches Quran readers by surprise — now you know it.",
    noorTipUr: "اضافے میں نون کا گرنا ایک مشہور قاعدہ ہے — جب جمع مذکر سالم مضاف بنے تو نون گرتا ہے۔",
    focuses: [
      { title: "Why ن Drops", titleAr: "سَبَب حَذْف النُّون", grammarTerm: "حذف النون في الإضافة", reveal: "You learned that ن at the end of a dual or sound masculine plural is dropped when that word becomes the first term (مضاف) of an idafa.", hookQuestion: "What triggers the dropping of ن in مُسْلِمُو الْبَلَدِ?" },
      { title: "Dual in Idafa", titleAr: "الْمُثَنَّى فِي الإِضَافَة", grammarTerm: "مثنى مضاف", reveal: "You saw the dual كِتَابَانِ become كِتَابَا in idafa — ن drops, and the vowel remains.", hookQuestion: "What is the idafa form of الطَّالِبَانِ المُجْتَهِدَانِ?" },
      { title: "Sound Masc Plural in Idafa", titleAr: "جَمْع الْمُذَكَّر السَّالِم فِي الإِضَافَة", grammarTerm: "جمع مضاف", reveal: "You practiced الْمُؤْمِنُونَ → مُؤْمِنُو الأَرْضِ — the ن drops and the spelling changes accordingly.", hookQuestion: "Write the idafa form of الصَّالِحُونَ if they are 'of the city'." },
      { title: "Finding These in Quran", titleAr: "هَذَا فِي الْقُرْآن", grammarTerm: "تطبيق قرآني", reveal: "You identified examples in Quranic text where this rule applies — recognising forms that would otherwise look strange.", hookQuestion: "Find an example of حذف النون in a Quranic dual or plural." },
      { title: "Honourable Teachers", titleAr: "مُعَلِّمُو الْمَدْرَسَةِ", grammarTerm: "إعراب تطبيقي", reveal: "You gave the full i'rab analysis of مُعَلِّمُو الْمَدْرَسَةِ كِرَامٌ — a nominal sentence with an idafa مبتدأ.", hookQuestion: "State the grammatical role and case of each word in مُعَلِّمُو الْمَدْرَسَةِ كِرَامٌ." },
    ],
  },

  // ── Ch64 ── Nominal vs Verbal Sentences (Formal Spiral) ──────────────────
  {
    order: 64,
    sourceFile: "reader_lecture_64_nominal_verbal_formal.md",
    title: "Nominal and Verbal Sentences — Formal Spiral",
    titleAr: "الْجُمْلَة الِاسْمِيَّة وَالْفِعْلِيَّة — التَّعْمِيق الرَّسْمِيّ",
    description: "The two sentence types revisited with full grammatical analysis and parsing.",
    hook: { ayahAr: "إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ كَانَتْ لَهُمْ جَنَّاتُ الْفِرْدَوْسِ", ayahRef: "Al-Kahf 18:107", highlightedWord: "آمَنُوا" },
    examples: [
      card("آمَنُوا — فِعْل مَاضٍ لِجَمَاعَةِ الذُّكُور", "They believed — past tense for masculine plural", "aamanoo — fi'l maadin lijamaa'atid-dhukoor"),
      card("إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ", "Indeed those who believed and did righteous deeds", "innal-ladheena aamanoo wa 'amilus-saalihaat"),
      card("الْجُمْلَةُ الِاسْمِيَّةُ تَبْدَأُ بِالِاسْمِ وَتُفِيدُ الثُّبُوت", "The nominal sentence begins with a noun and denotes permanence", "al-jumlatul-ismiyyatu tabda'u bil-ismi wa tufeeduth-thuboot"),
      card("الْجُمْلَةُ الْفِعْلِيَّةُ تَبْدَأُ بِالْفِعْلِ وَتُفِيدُ التَّجَدُّد", "The verbal sentence begins with a verb and denotes renewal", "al-jumlatul-fi'liyyatu tabda'u bil-fi'li wa tufeeditta-tajaddud"),
    ],
    parseText: "إِنَّ الَّذِينَ آمَنُوا لَهُمْ جَنَّاتٌ",
    parseTokens: [token("إِنَّ", "حرف توكيد", "indeed"), token("الَّذِينَ", "اسم إن", "those who"), token("آمَنُوا", "فعل", "believed"), token("لَهُمْ", "خبر إن", "for them"), token("جَنَّاتٌ", "مبتدأ مؤخر", "gardens")],
    conversation: ["مَا الْفَرْقُ بَيْنَ الْجُمْلَتَيْن؟", "الِاسْمِيَّةُ تُفِيدُ الثُّبُوتَ وَالْفِعْلِيَّةُ تُفِيدُ التَّجَدُّد"],
    conversationDistractor: "مُعَلِّمُو الْمَدْرَسَةِ كِرَامٌ",
    distractor: "The teachers of the school are honourable",
    blankDistractor: "تَقُولُ",
    noorTip: "آمَنُوا وَعَمِلُوا — belief and action together. The Quran pairs them dozens of times.",
    noorTipUr: "آمَنُوا وَعَمِلُوا — ایمان اور عمل قرآن میں ہمیشہ ساتھ آتے ہیں۔",
    focuses: [
      { title: "Nominal Sentence — Permanence", titleAr: "الْجُمْلَة الِاسْمِيَّة وَالثُّبُوت", grammarTerm: "جملة اسمية", reveal: "You understood that a nominal sentence expresses a permanent or lasting state — كَانَ غَفُورًا means He always is, not just once.", hookQuestion: "Why does Arabic use a nominal sentence to describe Allah's attributes?" },
      { title: "Verbal Sentence — Renewal", titleAr: "الْجُمْلَة الْفِعْلِيَّة وَالتَّجَدُّد", grammarTerm: "جملة فعلية", reveal: "You understood that a verbal sentence expresses a renewed or occurring action — يُسَبِّحُ describes ongoing glorification.", hookQuestion: "Choose: would you use nominal or verbal to say 'the sun rises every day'?" },
      { title: "إِنَّ + Nominal", titleAr: "إِنَّ وَالْجُمْلَة الِاسْمِيَّة", grammarTerm: "إن المؤكدة للجملة الاسمية", reveal: "You parsed how إِنَّ introduces a nominal sentence — the اسم إن takes accusative while the خبر إن stays nominative.", hookQuestion: "In إِنَّ الَّذِينَ آمَنُوا لَهُمْ جَنَّاتٌ, what is the اسم إن and what is the خبر?" },
      { title: "Parsing Al-Kahf 18:107", titleAr: "إِعْرَاب آيَة الْكَهْف", grammarTerm: "تطبيق كامل", reveal: "You gave a complete i'rab analysis of إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ — a multi-clause sentence with إِنَّ.", hookQuestion: "How many distinct clauses are there in this verse, and what type is each?" },
      { title: "And They Did Righteous Deeds", titleAr: "وَعَمِلُوا الصَّالِحَاتِ", grammarTerm: "عطف الجملة الفعلية", reveal: "You saw وَعَمِلُوا conjoined to آمَنُوا — two past-tense verbs joined by وَ, both in the same grammatical position.", hookQuestion: "What is the relationship between آمَنُوا and عَمِلُوا grammatically?" },
    ],
  },

  // ── Ch65 ── كان وأخواتها — Incomplete Verbs ───────────────────────────────
  {
    order: 65,
    sourceFile: "reader_lecture_65_kana_akhawaatuha.md",
    title: "كان وأخواتها — The Incomplete Verbs",
    titleAr: "كَانَ وَأَخَوَاتُهَا",
    description: "كَانَ and its sisters — verbs that take a nominative subject and accusative predicate.",
    hook: { ayahAr: "وَكَانَ اللَّهُ عَلِيمًا حَكِيمًا", ayahRef: "An-Nisa 4:17", highlightedWord: "كَانَ" },
    examples: [
      card("كَانَ اللَّهُ عَلِيمًا حَكِيمًا", "Allah has always been All-Knowing, All-Wise", "wa kaanallahu 'aleemanhaakeema"),
      card("أَصْبَحَ الطَّالِبُ عَالِمًا بَعْدَ سَنَوَاتٍ", "The student became a scholar after years", "asbaha at-taalibu 'aaliman ba'da sanawaat"),
      card("لَيْسَ الظُّلْمُ مِنْ أَخْلَاقِ الْمُسْلِمِ", "Injustice is not among the morals of a Muslim", "laysa az-zulmu min akhlaaqil-muslim"),
      card("كَانَ الرَّسُولُ أَكْثَرَ النَّاسِ كَرَمًا", "The Prophet was the most generous of people", "kaana ar-rasoolu aktharannaasi karaman"),
    ],
    parseText: "كَانَ اللَّهُ عَلِيمًا حَكِيمًا",
    parseTokens: [token("كَانَ", "فعل ناقص", "was/is"), token("اللَّهُ", "اسم كان", "Allah"), token("عَلِيمًا", "خبر كان", "All-Knowing"), token("حَكِيمًا", "نعت", "All-Wise")],
    conversation: ["مَا هُوَ اسْمُ كَانَ وَخَبَرُهَا فِي الآيَة؟", "الِاسْمُ هُوَ اللَّهُ وَالْخَبَرُ عَلِيمًا حَكِيمًا"],
    conversationDistractor: "إِنَّ الَّذِينَ آمَنُوا لَهُمْ جَنَّاتٌ",
    distractor: "Those who believed have gardens",
    blankDistractor: "صَارَ",
    noorTip: "كَانَ اللَّهُ — grammatically past, theologically eternal. Grammar serves meaning here.",
    noorTipUr: "کَانَ اللَّهُ — قواعد میں ماضی لیکن عقیدے میں ابدی — قواعد معنی کی خدمت کرتا ہے۔",
    focuses: [
      { title: "What Makes كَانَ 'Incomplete'?", titleAr: "لِمَاذَا كَانَ نَاقِصَة؟", grammarTerm: "فعل ناقص", reveal: "You learned that كَانَ is 'incomplete' because it needs both an اِسْم (subject) and a خَبَر (predicate) to give a full meaning — like a verb-enhanced nominal sentence.", hookQuestion: "What does كَانَ add to a simple nominal sentence like اللَّهُ عَلِيمٌ?" },
      { title: "اسم كَانَ — Nominative", titleAr: "اِسْم كَانَ مَرْفُوع", grammarTerm: "اسم كان", reveal: "You saw that كَانَ's subject stays nominative — اللَّهُ keeps its ضمة.", hookQuestion: "What case does the اسم (subject) of كَانَ take?" },
      { title: "خبر كَانَ — Accusative", titleAr: "خَبَر كَانَ مَنْصُوب", grammarTerm: "خبر كان منصوب", reveal: "You saw that كَانَ's predicate takes accusative (فتحة) — عَلِيمًا, not عَلِيمٌ.", hookQuestion: "Why does عَلِيمًا have fatḥa in كَانَ اللَّهُ عَلِيمًا?" },
      { title: "أَصْبَحَ and صَارَ", titleAr: "أَصْبَحَ وَصَارَ", grammarTerm: "أخوات كان", reveal: "You met two sisters of كَانَ: أَصْبَحَ (became/entered morning) and صَارَ (became/transformed) — both follow the same rules.", hookQuestion: "Form a sentence using أَصْبَحَ with a noun and an accusative predicate." },
      { title: "لَيْسَ — كَانَ's Negative Sister", titleAr: "لَيْسَ — الأُخْت النَّافِيَة", grammarTerm: "فعل ناقص ناف", reveal: "You revisited لَيْسَ formally as a member of كَانَ's sisters — it negates nominal sentences with the same case rules.", hookQuestion: "How is لَيْسَ الظُّلْمُ مِنَ الأَخْلَاقِ grammatically structured?" },
      { title: "كَانَ in the Quran — Frequency", titleAr: "كَانَ فِي الْقُرْآن", grammarTerm: "تطبيق قرآني", reveal: "You traced كَانَ across multiple Quranic verses, seeing how its accusative predicate appears in names of Allah, human states, and historical descriptions.", hookQuestion: "Find three different Quranic verses using كَانَ and identify the اِسْم and خَبَر in each." },
    ],
  },

  // ── Ch66 ── ظرف الزمان والمكان — Adverbs of Time and Place ────────────────
  {
    order: 66,
    sourceFile: "reader_lecture_66_zarf.md",
    title: "Adverbs of Time and Place",
    titleAr: "ظَرْف الزَّمَان وَالْمَكَان",
    description: "Arabic adverbs of time and place — their forms, cases, and Quranic usage.",
    hook: { ayahAr: "يَوْمَ لَا تَمْلِكُ نَفْسٌ لِنَفْسٍ شَيْئًا", ayahRef: "Al-Infitar 82:19", highlightedWord: "يَوْمَ" },
    examples: [
      card("صَلَّيْتُ عِنْدَ الْمَسْجِدِ أَمْسِ", "I prayed near the mosque yesterday", "sallaytu 'indal-masjidi amsi"),
      card("يَوْمَ الْقِيَامَةِ يَقُومُ النَّاسُ لِرَبِّ الْعَالَمِينَ", "On the Day of Resurrection people will stand for the Lord of the worlds", "yawmal-qiyaamati yaqoomun-naasu lirabbil-'aalameen"),
      card("فَوْقَ السَّمَاءِ وَتَحْتَ الأَرْضِ لَا يَخْفَى عَلَيْهِ شَيْءٌ", "Above the sky and beneath the earth — nothing is hidden from Him", "fawqas-samaa'i wa tahtal-ardi laa yakhfaa 'alayhi shay'"),
      card("يَوْمَ لَا تَمْلِكُ نَفْسٌ لِنَفْسٍ شَيْئًا", "The Day when no soul can do anything for another soul", "yawma laa tamliku nafsun linasin shay'an"),
    ],
    parseText: "يَوْمَ الْقِيَامَةِ يَقُومُ النَّاسُ",
    parseTokens: [token("يَوْمَ", "ظرف زمان", "on the Day of"), token("الْقِيَامَةِ", "مضاف إليه", "Resurrection"), token("يَقُومُ", "فعل", "will stand"), token("النَّاسُ", "فاعل", "people")],
    conversation: ["مَتَى يُحَاسَبُ النَّاسُ؟", "يُحَاسَبُونَ يَوْمَ الْقِيَامَةِ"],
    conversationDistractor: "كَانَ اللَّهُ عَلِيمًا حَكِيمًا",
    distractor: "Allah has always been All-Knowing, All-Wise",
    blankDistractor: "لَيْلَة",
    noorTip: "يَوْمَ is a ظرف — it gives the time frame for the whole sentence without being its main verb.",
    noorTipUr: "یَوْمَ ظرف ہے — یہ پورے جملے کا وقت بتاتا ہے بغیر فعل بنے۔",
    focuses: [
      { title: "What Is الظَّرف?", titleAr: "تَعْرِيف الظَّرف", grammarTerm: "ظرف", reveal: "You defined الظَّرف: a noun placed in an accusative position to express time or place — 'when' or 'where' an action occurs.", hookQuestion: "Give three examples of Arabic ظروف — one for time and two for place." },
      { title: "Time Adverbs — الظُّرُوف الزَّمَانِيَّة", titleAr: "ظُرُوف الزَّمَان", grammarTerm: "ظرف زمان", reveal: "You practised يَوْمَ، حِينَ، عِنْدَ (when/at) — accusative time expressions that frame the action.", hookQuestion: "How is يَوْمَ الْقِيَامَةِ grammatically connected to the rest of the sentence?" },
      { title: "Place Adverbs — الظُّرُوف الْمَكَانِيَّة", titleAr: "ظُرُوف الْمَكَان", grammarTerm: "ظرف مكان", reveal: "You used فَوْقَ (above), تَحْتَ (below), أَمَام (in front), خَلْف (behind) — all accusative place adverbs.", hookQuestion: "In فَوْقَ السَّمَاءِ, what case is السَّمَاء and why?" },
      { title: "الظَّرف as Predicate", titleAr: "الظَّرف خَبَرًا", grammarTerm: "شبه الجملة في الخبر", reveal: "You saw ظروف functioning as the predicate (خبر) of a nominal sentence — اللَّهُ فَوْقَ الْعَرْشِ.", hookQuestion: "In اللَّهُ فَوْقَ الْعَرْشِ, what is the grammatical role of فَوْقَ الْعَرْشِ?" },
      { title: "يَوْمَ in Al-Infitar", titleAr: "يَوْمَ فِي سُورَة الِانْفِطَار", grammarTerm: "ظرف قرآني", reveal: "You parsed يَوْمَ لَا تَمْلِكُ نَفْسٌ لِنَفْسٍ شَيْئًا — يَوْمَ is a ظرف, the rest is its attached clause describing that day.", hookQuestion: "What happens in the clause that follows يَوْمَ in Al-Infitar 82:19?" },
    ],
  },

  // ── Ch67 ── لو — Counterfactual Conditions ────────────────────────────────
  {
    order: 67,
    sourceFile: "reader_lecture_67_law_counterfactual.md",
    title: "لو — Counterfactual Conditions",
    titleAr: "لَوْ لِلشَّرْط الِامْتِنَاعِيّ",
    description: "The particle لَوْ for impossible or contrary-to-fact conditions.",
    hook: { ayahAr: "لَوْ كَانَ فِيهِمَا آلِهَةٌ إِلَّا اللَّهُ لَفَسَدَتَا", ayahRef: "Al-Anbiya 21:22", highlightedWord: "لَوْ" },
    examples: [
      card("لَوْ دَرَسْتَ لَنَجَحْتَ", "If you had studied, you would have passed", "law darasta la-najaht"),
      card("لَوْ كَانَ مَعَنَا لَسَاعَدَنَا", "If he had been with us, he would have helped us", "law kaana ma'anaa la-saa'adanaa"),
      card("لَوْ أَنفَقْتَ مَا فِي الأَرْضِ مَا أَلَّفْتَ بَيْنَ قُلُوبِهِمْ", "Even if you spent all that is on earth you could not have united their hearts", "law anfaqta maa fil-ardi maa allafta bayna quloobihim"),
      card("لَوْ كَانَ فِيهِمَا آلِهَةٌ إِلَّا اللَّهُ لَفَسَدَتَا", "If there were gods besides Allah in them both, they would be ruined", "law kaana feehimaa aalihatun illallaahu la-fasadata"),
    ],
    parseText: "لَوْ دَرَسْتَ لَنَجَحْتَ",
    parseTokens: [token("لَوْ", "حرف شرط", "if"), token("دَرَسْتَ", "فعل الشرط", "you had studied"), token("لَ", "جواب الشرط", "would have"), token("نَجَحْتَ", "فعل جواب", "passed")],
    conversation: ["لَمَاذَا لَمْ تَنْجَحْ؟", "لَوْ دَرَسْتُ أَكْثَرَ لَنَجَحْتُ"],
    conversationDistractor: "يَوْمَ الْقِيَامَةِ يَقُومُ النَّاسُ",
    distractor: "On the Day of Resurrection people will stand",
    blankDistractor: "إِنْ",
    noorTip: "لَوْ كَانَ فِيهِمَا آلِهَةٌ إِلَّا اللَّه — one of the most powerful logical arguments in the Quran.",
    noorTipUr: "یہ قرآن کا ایک عقلی دلیل ہے — اگر دو خدا ہوتے تو کائنات خراب ہو جاتی۔",
    focuses: [
      { title: "لَوْ vs إِنْ — Key Difference", titleAr: "الْفَرْق بَيْنَ لَوْ وَإِنْ", grammarTerm: "شرط امتناعي", reveal: "You understood the core distinction: إِنْ is for a real possible condition; لَوْ is for an impossible or unrealised condition.", hookQuestion: "Why does Al-Anbiya 21:22 use لَوْ and not إِنْ?" },
      { title: "Structure of a لَوْ Sentence", titleAr: "بِنَاء جُمْلَة لَوْ", grammarTerm: "شرط + جواب", reveal: "You parsed the two-part لَوْ sentence: the condition (لَوْ + past tense) and the response (لَـ + past tense).", hookQuestion: "What does the لَـ at the start of the response clause signal?" },
      { title: "Regret and Counterfactual", titleAr: "التَّأَسُّف وَالِافْتِرَاض", grammarTerm: "لو للتأسف", reveal: "You saw لَوْ expressing regret — looking back at what could have been different.", hookQuestion: "Compose a لَوْ sentence expressing regret about not praying on time." },
      { title: "Tawheed Through Grammar", titleAr: "التَّوْحِيد بِالدَّلِيل الْعَقْلِيّ", grammarTerm: "حجة منطقية", reveal: "You parsed the theological proof in Al-Anbiya 21:22: IF (لَوْ) there were multiple gods → THEN (لَـ) the universe would be ruined. The universe is not ruined. Therefore, there is one God.", hookQuestion: "What logical conclusion does the verse draw from the لَوْ condition?" },
      { title: "لَوْ With لَمَّا", titleAr: "لَوْ + لَمَّا", grammarTerm: "لولا", reveal: "You learned لَوْلَا (if not for / were it not for) — a contracted form meaning 'but for'.", hookQuestion: "What does لَوْلَا الإِيمَانُ لَهَلَكَ الْإِنسَانُ mean?" },
    ],
  },

  // ── Ch68 ── Jussive Particles Consolidated ────────────────────────────────
  {
    order: 68,
    sourceFile: "reader_lecture_68_jussive_consolidated.md",
    title: "Jussive Particles — Complete System",
    titleAr: "الْجَوَازِم — النِّظَام الْكَامِل",
    description: "The complete inventory of jussive particles and their effects on the present tense.",
    hook: { ayahAr: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ", ayahRef: "Yusuf 12:87", highlightedWord: "تَيْأَسُوا" },
    examples: [
      card("لَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ", "Do not despair of the mercy of Allah (لَا الناهية + مجزوم)", "laa tay'asoo min rawhillaah"),
      card("لِيُنفِقْ ذُو سَعَةٍ مِّن سَعَتِهِ", "Let the one of means spend from his means (لام الأمر + مجزوم)", "liyunfiq dhoo sa'atin min sa'atihi"),
      card("لَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", "There is nothing comparable to Him (لَمْ + مجزوم)", "lam yakun lahu kufuwan ahad"),
      card("لَمَّا يُؤَدِّ الزَّكَاةَ بَعْد", "He has not yet paid zakat (لَمَّا + مجزوم)", "lammaa yu'addiz-zakaata ba'd"),
    ],
    parseText: "لَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ",
    parseTokens: [token("لَا", "ناهية", "do not"), token("تَيْأَسُوا", "فعل مضارع مجزوم", "despair"), token("مِن", "حرف جر", "of"), token("رَّوْحِ", "مضاف", "mercy"), token("اللَّهِ", "مضاف إليه", "Allah")],
    conversation: ["كَيْفَ تَقُول 'لِيَدْرُسْ'؟", "تَقُول لَامُ الأَمْرِ ثُمَّ الْفِعْلَ الْمَجْزُومَ: لِيَدْرُسْ"],
    conversationDistractor: "لَوْ دَرَسْتَ لَنَجَحْتَ",
    distractor: "If you had studied you would have passed",
    blankDistractor: "لَنْ",
    noorTip: "لَا تَيْأَسُوا — this prohibition from Ya'qub to his sons is one of the most emotionally powerful verses in the Quran.",
    noorTipUr: "لَا تَیْأَسُوا — یعقوب علیہ السلام کا اپنے بیٹوں کو یہ حکم قرآن کے سب سے دلگداز جملوں میں سے ہے۔",
    focuses: [
      { title: "The Four Jussive Triggers", titleAr: "الأَدَوَات الأَرْبَع لِلْجَزْم", grammarTerm: "حروف الجزم", reveal: "You mapped the four main jussive triggers: لَمْ (did not), لَمَّا (not yet), لَا الناهية (do not!), لام الأمر (let him...).", hookQuestion: "Name the four jussive particles and give an example of each." },
      { title: "لَا النَّاهِيَة — Prohibition", titleAr: "لَا النَّاهِيَة", grammarTerm: "لا الناهية", reveal: "You used لَا + jussive for prohibition — لَا تَيْأَسُوا, لَا تَكْذِبْ — and recognised it as different from simple negation (لَا يَدْرُس).", hookQuestion: "How do you tell لَا النَّاهِيَة from لَا النَّافِيَة?" },
      { title: "لام الأمر — Third-Person Command", titleAr: "لَام الأَمْر", grammarTerm: "لام الأمر", reveal: "You formed third-person commands with لام الأمر + jussive: لِيَدْرُسْ (let him study), لِيَقُمْ (let him stand).", hookQuestion: "How would you say 'Let the teacher explain' using لام الأمر?" },
      { title: "Jussive of الأفعال الخمسة", titleAr: "مَجْزُوم الأَفْعَال الْخَمْسَة", grammarTerm: "جزم بحذف النون", reveal: "You practised the jussive of the five verb forms — لَا تَيْأَسُوا (not لَا تَيْأَسُونَ) — the ن drops rather than sukoon appearing.", hookQuestion: "What is the مجزوم form of يَذْهَبُونَ after لَا الناهية?" },
      { title: "The Complete Journey of المضارع", titleAr: "رِحْلَة الْمُضَارِع كَامِلَة", grammarTerm: "مراجعة شاملة", reveal: "You completed the journey that began in Chapter 34: مرفوع (default), منصوب (أَنْ، لَنْ، كَيْ), مجزوم (لَمْ، لَا، لام الأمر). The system is now yours.", hookQuestion: "What particle triggers each of the three states? Give one for each." },
      { title: "لَمَّا in Al-Ikhlas", titleAr: "لَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", grammarTerm: "تطبيق قرآني", reveal: "You parsed لَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ — a jussive sentence with an inverted structure (predicate before subject for emphasis).", hookQuestion: "What is the subject of لَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ?" },
    ],
  },

  // ── Ch69 ── جواب الطلب and Conditional Response ───────────────────────────
  {
    order: 69,
    sourceFile: "reader_lecture_69_jawab_al_talab.md",
    title: "جواب الطلب — Response to Command",
    titleAr: "جَوَاب الطَّلَب",
    description: "The jussive verb that responds to a command, request, or conditional statement.",
    hook: { ayahAr: "وَاتَّقُوا اللَّهَ وَيُعَلِّمُكُمُ اللَّهُ", ayahRef: "Al-Baqarah 2:282", highlightedWord: "وَيُعَلِّمُكُمُ" },
    examples: [
      card("ادْرُسْ تَنْجَحْ", "Study and you will succeed (command → jussive response)", "udrus tanjah"),
      card("اتَّقُوا اللَّهَ يُصْلِحْ لَكُمْ أَعْمَالَكُمْ", "Fear Allah — He will set right your deeds", "ittaqullaha yuslih lakum a'maalakum"),
      card("ادْخُلُوا الْجَنَّةَ بِمَا كُنتُمْ تَعْمَلُونَ", "Enter Paradise for what you used to do", "udkhulul-jannata bimaa kuntum ta'maloon"),
      card("وَاتَّقُوا اللَّهَ وَيُعَلِّمُكُمُ اللَّهُ", "Fear Allah and Allah will teach you", "wattaqullaha wa yu'allimukumullahu"),
    ],
    parseText: "اتَّقُوا اللَّهَ يُصْلِحْ لَكُمْ أَعْمَالَكُمْ",
    parseTokens: [token("اتَّقُوا", "فعل أمر", "fear"), token("اللَّهَ", "مفعول", "Allah"), token("يُصْلِحْ", "جواب الطلب مجزوم", "He will set right"), token("لَكُمْ", "متعلق", "for you"), token("أَعْمَالَكُمْ", "مفعول", "your deeds")],
    conversation: ["مَا جَوَاب الطَّلَب؟", "هُوَ فِعْلٌ مَجْزُومٌ يَأْتِي بَعْدَ طَلَبٍ لِيُبَيِّنَ نَتِيجَتَهُ"],
    conversationDistractor: "لَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ",
    distractor: "Do not despair of the mercy of Allah",
    blankDistractor: "يَذْهَبُ",
    noorTip: "وَيُعَلِّمُكُمُ — Allah's teaching is the reward promised for taqwa. Notice the subject is repeated for emphasis.",
    noorTipUr: "وَیُعَلِّمُکُمُ اللَّہُ — تقوی کا انعام علم ہے — اللہ سبحانہ خود سکھانے کا وعدہ کرتے ہیں۔",
    focuses: [
      { title: "What Is جواب الطلب?", titleAr: "تَعْرِيف جَوَاب الطَّلَب", grammarTerm: "جواب الطلب", reveal: "You defined جواب الطلب: a present-tense verb in مجزوم state that expresses what will happen if an implied or stated request/command is fulfilled.", hookQuestion: "What makes the verb in جواب الطلب go into مجزوم?" },
      { title: "Do → You Will Succeed", titleAr: "افْعَلْ → تَفْعَلْ", grammarTerm: "أمر + جواب مجزوم", reveal: "You practised the structure: command (فعل أمر) + response (مجزوم) — ادرس تنجح, اصبر تُكافأ.", hookQuestion: "Compose a جواب الطلب sentence: 'Make du'a (and) Allah will respond.'" },
      { title: "Taqwa → Teaching", titleAr: "التَّقْوَى وَالتَّعْلِيم", grammarTerm: "وَاو العطف للتعليق", reveal: "You parsed وَيُعَلِّمُكُمُ — the وَ here is not simple conjunction but a conditional وَ, making يُعَلِّمُكُمُ effectively مجزوم in meaning.", hookQuestion: "Why is يُعَلِّمُكُمُ considered a جواب الطلب in this verse?" },
      { title: "Three Ways to Make جواب الطلب", titleAr: "طُرُق جَوَاب الطَّلَب", grammarTerm: "أمر + استفهام + نفي", reveal: "You saw that جواب الطلب follows not just a command but also a question (أَلَا تَزُورُنَا نَزُرْكَ) and even a negation.", hookQuestion: "Can you form a جواب الطلب after a question? Give an example." },
    ],
  },

  // ── Ch70 ── الاستثناء — Exception with إِلَّا ────────────────────────────
  {
    order: 70,
    sourceFile: "reader_lecture_70_istithna.md",
    title: "الاستثناء — Exception with إِلَّا",
    titleAr: "الِاسْتِثْنَاء بِإِلَّا",
    description: "Exception structures with إِلَّا — the grammar of exclusion and the Shahada.",
    hook: { ayahAr: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", ayahRef: "Tahleel", highlightedWord: "إِلَّا" },
    examples: [
      card("جَاءَ الطُّلَّابُ إِلَّا طَالِبًا وَاحِدًا", "The students came except one student", "jaa'at-tullabu illaa taaliban waahidan"),
      card("لَا إِلَٰهَ إِلَّا اللَّهُ — نَفْيٌ ثُمَّ إِثْبَات", "No god — except Allah — negation then affirmation", "laa ilaaha illallahu — nafyun thumma ithbaat"),
      card("مَا فَعَلَ ذَلِكَ إِلَّا مُحَمَّدٌ", "None did that except Muhammad", "maa fa'ala dhaalika illaa muhammadun"),
      card("وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِلْعَالَمِينَ", "And We did not send you except as a mercy for the worlds", "wa maa arsalnaaka illaa rahmatan lil-'aalameen"),
    ],
    parseText: "جَاءَ الطُّلَّابُ إِلَّا طَالِبًا وَاحِدًا",
    parseTokens: [token("جَاءَ", "فعل", "came"), token("الطُّلَّابُ", "فاعل", "the students"), token("إِلَّا", "أداة استثناء", "except"), token("طَالِبًا", "مستثنى", "one student"), token("وَاحِدًا", "نعت", "one")],
    conversation: ["هَلْ جَاءَ الْجَمِيع؟", "جَاءَ الْجَمِيعُ إِلَّا وَاحِدًا"],
    conversationDistractor: "اتَّقُوا اللَّهَ يُصْلِحْ لَكُمْ أَعْمَالَكُمْ",
    distractor: "Fear Allah and He will set right your deeds",
    blankDistractor: "سِوَى",
    noorTip: "لَا إِلَٰهَ إِلَّا اللَّه — the grammar of Tawheed: negate all gods, then affirm the One.",
    noorTipUr: "لَا إِلَٰهَ إِلَّا اللَّه — پہلے نفی، پھر اثبات — توحید کی گرامر بھی کامل ہے۔",
    focuses: [
      { title: "إِلَّا — The Exception Particle", titleAr: "إِلَّا أَدَاة الِاسْتِثْنَاء", grammarTerm: "استثناء", reveal: "You defined إِلَّا as the particle that carves out an exception — 'all of X except Y'.", hookQuestion: "What two parts does every exception sentence require?" },
      { title: "الْمُسْتَثْنَى — The Excepted Noun", titleAr: "الْمُسْتَثْنَى", grammarTerm: "مستثنى منصوب", reveal: "You saw that the excepted noun (الْمُسْتَثْنَى) after إِلَّا in a positive sentence takes accusative case.", hookQuestion: "What case does طَالِبًا take in جَاءَ الطُّلَّابُ إِلَّا طَالِبًا?" },
      { title: "Exception in Negative Sentences", titleAr: "الِاسْتِثْنَاء فِي الْجُمْلَة الْمَنْفِيَّة", grammarTerm: "مستثنى بعد نفي", reveal: "You saw that after a negative sentence, the مستثنى can become the grammatical subject — مَا جَاءَ إِلَّا طَالِبٌ (none came except a student — طَالِبٌ is now the فاعل).", hookQuestion: "What case does the مستثنى take after a negative sentence?" },
      { title: "The Shahada — Grammar of Tawheed", titleAr: "الشَّهَادَة وَقَوَاعِدُهَا", grammarTerm: "لا النافية للجنس + استثناء", reveal: "You parsed لَا إِلَٰهَ إِلَّا اللَّهُ: لَا (negates the category), إِلَٰهَ (the negated noun — accusative), إِلَّا (exception), اللَّهُ (the exception — subject of an implied 'exists').", hookQuestion: "What is the full grammatical analysis of لَا إِلَٰهَ إِلَّا اللَّهُ?" },
      { title: "Mercy for the Worlds", titleAr: "رَحْمَةً لِلْعَالَمِينَ", grammarTerm: "مستثنى في حصر", reveal: "You read وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً — إِلَّا here restricts the purpose of sending: 'only as a mercy, for nothing else'.", hookQuestion: "What does إِلَّا رَحْمَةً restrict in the context of the Prophet's mission?" },
      { title: "Types of Exception", titleAr: "أَنْوَاع الِاسْتِثْنَاء", grammarTerm: "استثناء متصل ومنقطع", reveal: "You distinguished between متصل (the exception is from the same group) and منقطع (the exception is from a different group).", hookQuestion: "In 'The scholars came except the chairs' — is this متصل or منقطع exception?" },
    ],
  },

  // ── Ch71 ── الحال and التمييز — Descriptive Accusatives ──────────────────
  {
    order: 71,
    sourceFile: "reader_lecture_71_hal_tamyeez.md",
    title: "الحال and التمييز — Descriptive Accusatives",
    titleAr: "الْحَال وَالتَّمْيِيز",
    description: "Two types of accusative that describe state (الحال) and specify meaning (التمييز).",
    hook: { ayahAr: "وَجَاؤُوا أَبَاهُمْ عِشَاءً يَبْكُونَ", ayahRef: "Yusuf 12:16", highlightedWord: "يَبْكُونَ" },
    examples: [
      card("جَاءَ الرَّجُلُ ضَاحِكًا", "The man came laughing (حال: accusative state)", "jaa'ar-rajulu daahikan"),
      card("اِشْتَرَيْتُ عِشْرِينَ كِتَابًا", "I bought twenty books (تمييز: singular accusative)", "ishtaraytu 'ishreena kitaaban"),
      card("وَجَاؤُوا أَبَاهُمْ عِشَاءً يَبْكُونَ", "And they came to their father in the evening weeping", "wa jaa'oo abaahum 'ishaa'an yabkoon"),
      card("فَفَجَّرْنَاهَا عُيُونًا", "So We caused it to burst forth as springs", "fafajjarnaahaa 'uyoonan"),
    ],
    parseText: "جَاءَ الرَّجُلُ ضَاحِكًا",
    parseTokens: [token("جَاءَ", "فعل", "came"), token("الرَّجُلُ", "فاعل", "the man"), token("ضَاحِكًا", "حال", "laughing")],
    conversation: ["كَيْفَ جَاءَ الرَّجُلُ؟", "جَاءَ الرَّجُلُ ضَاحِكًا"],
    conversationDistractor: "جَاءَ الطُّلَّابُ إِلَّا طَالِبًا وَاحِدًا",
    distractor: "The students came except one",
    blankDistractor: "حَزِينًا",
    noorTip: "يَبْكُونَ is a حال — the brothers came in a state of weeping, hiding their crime.",
    noorTipUr: "یَبْکُونَ حال ہے — بھائی روتے ہوئے آئے، اپنا جرم چھپانے کے لیے۔",
    focuses: [
      { title: "What Is الْحَال?", titleAr: "تَعْرِيف الْحَال", grammarTerm: "حال", reveal: "You defined الْحَال: an accusative noun or clause that describes the state of the doer or object at the time of the action.", hookQuestion: "In جَاءَ رَاكِبًا (he came riding), what is the حال and what does it tell you?" },
      { title: "الحال as a Clause", titleAr: "الْحَال جُمْلَة", grammarTerm: "حال جملة فعلية", reveal: "You saw الحال as a full verbal clause — يَبْكُونَ in وَجَاؤُوا أَبَاهُمْ يَبْكُونَ. The weeping is the state, not a separate event.", hookQuestion: "Why is يَبْكُونَ a حال and not a separate sentence?" },
      { title: "What Is التَّمْيِيز?", titleAr: "تَعْرِيف التَّمْيِيز", grammarTerm: "تمييز", reveal: "You defined التَّمْيِيز: an accusative noun that clarifies ambiguous meaning — usually after numbers (عِشْرِينَ كِتَابًا) or expressions of quantity/quality.", hookQuestion: "In طَابَ زَيْدٌ نَفْسًا, what does نَفْسًا clarify about the sentence?" },
      { title: "Hal vs Tamyeez — The Test", titleAr: "الْفَرْق بَيْنَ الْحَال وَالتَّمْيِيز", grammarTerm: "تمييز الحال من التمييز", reveal: "You applied the test: الحال answers 'how/in what state?' — التمييز answers 'how much/what kind of?'.", hookQuestion: "Which is الحال and which is التمييز: جَاءَ مُسْرِعًا vs اشْتَرَيْتُ لِتْرًا حَلِيبًا?" },
      { title: "Quranic Applications", titleAr: "تَطْبِيقَات قُرْآنِيَّة", grammarTerm: "حال وتمييز في القرآن", reveal: "You parsed Quranic sentences and identified الحال and التمييز — seeing how they add vivid depth to the narrative.", hookQuestion: "In فَفَجَّرْنَاهَا عُيُونًا, is عُيُونًا a حال or تمييز? Explain why." },
      { title: "Two Accusatives in One Sentence", titleAr: "حَالَان فِي جُمْلَة وَاحِدَة", grammarTerm: "تعدد الحال", reveal: "You saw الْحَالُ المتعددة — a sentence can have more than one حال describing different aspects of the action.", hookQuestion: "In جَاءَ ضَاحِكًا مُسْرِعًا, what are the two حال and what do they each describe?" },
    ],
  },

  // ── Ch72 ── المنادى — The Vocative & Curriculum Capstone ─────────────────
  {
    order: 72,
    sourceFile: "reader_lecture_72_munada_capstone.md",
    title: "المنادى — The Vocative and Curriculum Capstone",
    titleAr: "الْمُنَادَى — خَاتِمَة الْمَنْهَج",
    description: "The grammar of calling and address — يَا, أَيُّهَا, and all vocative patterns.",
    hook: { ayahAr: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ", ayahRef: "At-Tawbah 9:119", highlightedWord: "يَا أَيُّهَا" },
    examples: [
      card("يَا رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ", "O my Lord, forgive me and accept my repentance", "yaa rabbi ighfir lee wa tub 'alayy"),
      card("يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ", "O mankind, fear your Lord who created you", "yaa ayyuhan-naasu ittaqoo rabbakum alladhee khalaqakum"),
      card("يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ", "O you who believe, fear Allah", "yaa ayyuhal-ladheena aamanoo ittaqullaha"),
      card("يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا مَعَ الصَّادِقِينَ", "O you who believe, be with the truthful", "yaa ayyuhal-ladheena aamanoo koonoo ma'as-saadiqeen"),
    ],
    parseText: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ",
    parseTokens: [token("يَا", "حرف نداء", "O"), token("أَيُّهَا", "منادى", "you"), token("الَّذِينَ", "بدل", "who"), token("آمَنُوا", "فعل", "believed"), token("اتَّقُوا", "فعل أمر", "fear"), token("اللَّهَ", "مفعول", "Allah")],
    conversation: ["كَيْفَ تُنَادِي شَخْصًا مُعَرَّفًا؟", "تَقُول يَا أَيُّهَا ثُمَّ الِاسْمَ بِالأَلِف وَاللَّام"],
    conversationDistractor: "جَاءَ الرَّجُلُ ضَاحِكًا",
    distractor: "The man came laughing",
    blankDistractor: "أَيَّتُهَا",
    noorTip: "يَا أَيُّهَا الَّذِينَ آمَنُوا — Allah directly addresses the believers. When you hear this, listen.",
    noorTipUr: "یَا أَیُّهَا الَّذِینَ آمَنُوا — اللہ مؤمنوں کو براہ راست مخاطب کرتا ہے، غور سے سنو۔",
    focuses: [
      { title: "يَا — The Call Particle", titleAr: "يَا حَرْف النِّدَاء", grammarTerm: "حرف نداء", reveal: "You learned that يَا is the most common particle of address — used for near and far, human and divine.", hookQuestion: "What is the grammatical name for the particle يَا?" },
      { title: "Vocative with Definite Noun", titleAr: "نِدَاء الِاسْمِ الْمَعْرِفَة", grammarTerm: "منادى معرفة بأل", reveal: "You learned that a definite noun (with ال) cannot follow يَا directly — you need يَا أَيُّهَا as a bridge.", hookQuestion: "Why can't you say يَا الطَّالِبُ? What do you say instead?" },
      { title: "يَا رَبِّ — Vocative with Attached Pronoun", titleAr: "الْمُنَادَى الْمُضَاف إِلَى يَاء الْمُتَكَلِّم", grammarTerm: "منادى مضاف", reveal: "You parsed يَا رَبِّ — when the vocative noun is in idafa with ي (my), the ي can be dropped or replaced with kasra.", hookQuestion: "What is the full form of يَا رَبِّ, and what has been shortened?" },
      { title: "يَا أَيُّهَا النَّاسُ", titleAr: "الْمُنَادَى بِأَيُّهَا", grammarTerm: "أيها للتنبيه", reveal: "You parsed the full structure: يَا (call) + أَيُّهَا (bridge, مبني على الضم) + النَّاسُ (بدل، مرفوع).", hookQuestion: "What is the grammatical role of النَّاسُ in يَا أَيُّهَا النَّاسُ?" },
      { title: "O You Who Believe!", titleAr: "يَا أَيُّهَا الَّذِينَ آمَنُوا", grammarTerm: "نداء الجماعة بموصول", reveal: "You parsed the most frequent direct address to believers in the Quran — يَا أَيُّهَا followed by a relative pronoun clause.", hookQuestion: "How many times does يَا أَيُّهَا الَّذِينَ آمَنُوا appear in the Quran, and what does its frequency tell you?" },
      { title: "Curriculum Complete — رِحْلَة الْعِلْم", titleAr: "اكْتِمَال الْمَنْهَج", grammarTerm: "خاتمة", reveal: "You have completed the Madinah Arabic Reader — all 8 books, 72 chapters. You began with هَذَا قَلَمٌ and you end with يَا أَيُّهَا الَّذِينَ آمَنُوا. The grammar of the Quran is now your grammar.", hookQuestion: "What was the first Arabic sentence you learned, and how much of the Quran can you now parse?" },
      { title: "What Comes Next — Phase 3", titleAr: "مَاذَا بَعْد؟ الْمَرْحَلَة الثَّالِثَة", grammarTerm: "مرحلة ثالثة", reveal: "Phase 3 begins with Al-Humazah, then works backwards through Juz 30, then Juz 29. Every Surah you encounter now has grammar you know. The journey of understanding the Quran continues.", hookQuestion: "Which Surah will you read first in Phase 3, and can you already name its grammatical structures?" },
    ],
  },

];

const chapters = specs.map(chapter);
module.exports = { chapters };
