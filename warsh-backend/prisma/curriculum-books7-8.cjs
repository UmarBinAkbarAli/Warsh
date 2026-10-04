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

  // ── Ch60 ── Travel and Hajj Language ──────────
  {
    order: 60,
    sourceFile: "Docs/proposals/chapter-60-content-proposal.md",
    title: "Travel and Hajj Language",
    titleUr: "سفر اور حج کی زبان",
    titleAr: "لُغَةُ السَّفَرِ وَالْحَجِّ",
    description: "Name vehicles and places, read appointment and time words, learn the Hajj vocabulary, and practise the exchange of asking which bus goes to Makkah and correcting a wrong destination.",
    descriptionUr: "سواریوں اور جگہوں کے نام بتائیں، ملاقات اور وقت کے الفاظ پڑھیں، حج کے الفاظ سیکھیں، اور یہ پوچھنے کی گفتگو کی مشق کریں کہ کون سی بس مکہ جاتی ہے اور غلط منزل کی اصلاح کیسے کی جائے۔",
    hook: { ayahAr: "إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ", ayahRef: "Quraysh 106:2", highlightedWord: "رِحْلَةَ" },
    examples: [
      card("هَلْ هَذِهِ الْحَافِلَةُ إِلَى مَكَّةَ؟", "Is this bus going to Makkah?", "hal hadhihi al-ḥāfilatu ʾilā makkata"),
      card("أَمَامَ الْمَحَطَّةِ؟", "In front of the station?", "ʾamāma al-maḥaṭṭati"),
      card("لَا، إِلَى مَكَّةَ", "No, to Makkah", "lā ʾilā makkata"),
      card("وَأَذِّن فِي النَّاسِ بِالْحَجِّ", "And proclaim to the people the Hajj", "waʾaddhin fī an-nāsi bi-l-ḥajji"),
    ],
    parseText: "هَلْ هَذِهِ الْحَافِلَةُ إِلَى مَكَّةَ",
    parseTokens: [token("هَلْ", "حرف استفهام", "is"), token("هَذِهِ الْحَافِلَةُ", "مبتدأ", "this bus"), token("إِلَى مَكَّةَ", "جار ومجرور", "to Makkah")],
    conversation: ["هَلْ هَذِهِ الْحَافِلَةُ إِلَى مَكَّةَ؟","لَا، هَذِهِ الْحَافِلَةُ إِلَى الْمَدِينَةِ"],
    conversationDistractor: "نَعَمْ، شُكْرًا",
    distractor: "Yes, thank you",
    blankDistractor: "الْمَدِينَةِ",
    noorTip: "Read the label on the vehicle: the bus to Makkah is the one that says Makkah. If someone repeats your trip wrongly, say no and give the right destination.",
    noorTipUr: "گاڑی پر لگا لیبل پڑھیں: مکہ والی بس وہ ہے جس پر مکہ لکھا ہو۔ اگر کوئی آپ کا سفر غلط دہرائے تو نہیں کہیں اور درست منزل بتائیں۔",
    focuses: [
      { title: "Travel Essentials", titleAr: "أَسَاسِيَّاتُ السَّفَرِ", grammarTerm: "مفردات", reveal: "You named vehicles and boarding.", hookQuestion: "Which word means bus?" },
      { title: "Schedules and Time", titleAr: "الْمَوَاعِيدُ وَالْوَقْتُ", grammarTerm: "مفردات", reveal: "You read appointment and time words.", hookQuestion: "What does مَوْعِدٌ mean?" },
      { title: "Hajj Vocabulary", titleAr: "مُفْرَدَاتُ الْحَجِّ", grammarTerm: "مفردات", reveal: "You learned the Hajj and Umrah words.", hookQuestion: "Which word is the lesser pilgrimage?" },
      { title: "Travel and Hajj — Conversation Lab", titleAr: "السَّفَرُ وَالْحَجُّ", grammarTerm: "حوار", reveal: "You asked about the bus, found the place and corrected a mistake.", hookQuestion: "What do you say to a wrong destination?" },
      { title: "Hajj Ritual Places", titleAr: "أَمَاكِنُ الْحَجِّ", grammarTerm: "أسماء الأماكن", reveal: "You read the names of places.", hookQuestion: "Which place is مِنًى؟" },
      { title: "Hajj Du'a and Farewell", titleAr: "دُعَاءُ الْحَجِّ وَالْوَدَاعُ", grammarTerm: "مفردات", reveal: "You read the farewell words.", hookQuestion: "What does وَدَاعٌ mean?" },
    ],
  },

  // ── Ch61 ── Trade, Weights, and Instrument Nouns ──────────
  {
    order: 61,
    sourceFile: "Docs/proposals/chapter-61-content-proposal.md",
    title: "Trade, Weights, and Instrument Nouns",
    titleUr: "تجارت، وزن اور آلے کے اسم",
    titleAr: "التِّجَارَةُ وَالْمِيزَانُ وَأَسْمَاءُ الْآلَةِ",
    description: "Learn the words of an honest market deal, tell weighing from measuring, hold a market exchange, recognise six tool words on three patterns, and read all of Surat Al-Mutaffifin.",
    descriptionUr: "ایمان دار بازاری سودے کے الفاظ سیکھیں، تولنے اور ناپنے میں فرق کریں، بازار کی گفتگو کریں، تین وزنوں پر چھ آلاتی الفاظ پہچانیں، اور پوری سورۃ المطففین پڑھیں۔",
    hook: { ayahAr: "وَيْلٌ لِّلْمُطَفِّفِينَ", ayahRef: "Al-Mutaffifin 83:1", highlightedWord: "لِّلْمُطَفِّفِينَ" },
    examples: [
      card("كَمْ ثَمَنُ هَذَا الْكِتَابِ؟", "How much is the price of this book?", "kam thamanu hadhā al-kitābi"),
      card("وَزَنَ التَّاجِرُ الذَّهَبَ بِالْمِيزَانِ", "The merchant weighed the gold on the scale", "wazana at-tājiru adh-dhahaba bi-l-mīzāni"),
      card("مِفْتَاحٌ · مِقَصٌّ · مِكْنَسَةٌ", "a key · scissors · a broom", "miftāḥun · miqaṣṣun · miknasatun"),
      card("وَيْلٌ لِّلْمُطَفِّفِينَ", "Woe to those who give less than full", "waylun llilmuṭaffifīna"),
    ],
    parseText: "كَالَ التَّاجِرُ الْقَمْحَ",
    parseTokens: [token("كَالَ", "فعل", "measured"), token("التَّاجِرُ", "فاعل", "the merchant"), token("الْقَمْحَ", "مفعول", "the wheat")],
    conversation: ["كَمْ ثَمَنُ هَذَا الْكِتَابِ؟","ثَمَنُهُ عَشَرَةُ رِيَالَاتٍ"],
    conversationDistractor: "نَعَمْ، شُكْرًا",
    distractor: "Yes, thank you",
    blankDistractor: "الْمِيزَانِ",
    noorTip: "Weighing uses a scale (مِيزَانٌ); measuring by volume uses a measure (مِكْيَالٌ). In the market the label decides: if the seller repeats your order wrongly, say no and give your number.",
    noorTipUr: "تولنے میں ترازو (مِيزَانٌ) اور حجم ناپنے میں پیمانہ (مِكْيَالٌ) استعمال ہوتا ہے۔ بازار میں لیبل فیصلہ کرتا ہے: اگر بیچنے والا آپ کا آرڈر غلط دہرائے تو نہیں کہیں اور اپنی تعداد بتائیں۔",
    focuses: [
      { title: "Trade and Commerce", titleAr: "التِّجَارَةُ وَالْبَيْعُ", grammarTerm: "مفردات", reveal: "You named the seller, the buyer, the goods, the price, the profit and the loss.", hookQuestion: "Which word means the buyer?" },
      { title: "Weights and Measures", titleAr: "الْوَزْنُ وَالْكَيْلُ", grammarTerm: "مفردات", reveal: "You told weighing on a scale from measuring with a measure.", hookQuestion: "Which verb means he weighed?" },
      { title: "At the Market — Conversation Lab", titleAr: "فِي السُّوقِ", grammarTerm: "حوار", reveal: "You asked what it is and its price, said how many, corrected the order and closed politely.", hookQuestion: "What do you say when the seller repeats your order wrongly?" },
      { title: "Instrument Nouns — a Small Set", titleAr: "أَسْمَاءُ الْآلَةِ", grammarTerm: "اسم الآلة", reveal: "You recognised six tool words on three patterns, without making new ones.", hookQuestion: "Which pattern is مِكْنَسَةٌ on?" },
      { title: "Al-Mutaffifin I — 83:1–6", titleAr: "الْمُطَفِّفِينَ ١", grammarTerm: "نص كامل", reveal: "You read the cheat who takes in full and gives less, and the question about the Day.", hookQuestion: "What does يُخْسِرُونَ mean?" },
      { title: "Al-Mutaffifin II — 83:7–17", titleAr: "الْمُطَفِّفِينَ ٢", grammarTerm: "نص كامل", reveal: "You read the record in Sijjin, the deniers and the three times 'No!'.", hookQuestion: "What does كَلَّا do?" },
      { title: "Al-Mutaffifin III — 83:18–28", titleAr: "الْمُطَفِّفِينَ ٣", grammarTerm: "نص كامل", reveal: "You read the record in Illiyyun, the bliss of the righteous and the sealed drink.", hookQuestion: "Where is the record of the righteous?" },
      { title: "Al-Mutaffifin IV — 83:29–36", titleAr: "الْمُطَفِّفِينَ ٤", grammarTerm: "نص كامل", reveal: "You read the laughter turned round and the closing question.", hookQuestion: "Who laughs Today?" },
    ],
  },

  // ── Ch62 ── Pointing Words, لَا and Surat Al-Bayyinah ──────────
  {
    order: 62,
    sourceFile: "Docs/proposals/chapter-62-content-proposal.md",
    title: "Pointing Words, لَا and Surat Al-Bayyinah",
    titleUr: "اشارے کے الفاظ، لَا اور سورۃ البینہ",
    titleAr: "الْإِشَارَةُ وَلَا وَالْبَيِّنَةُ",
    description: "Use the pointing words near, far and back at what was said, read the shape لَا رَيْبَ, tell the jobs of لَا apart, and read all of Surat Al-Bayyinah.",
    descriptionUr: "اشارے کے الفاظ قریب، دور اور پہلے کہی گئی بات کی طرف استعمال کریں، شکل لَا رَيْبَ پڑھیں، لَا کے کام الگ پہچانیں، اور پوری سورۃ البینہ پڑھیں۔",
    hook: { ayahAr: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ", ayahRef: "Al-Baqarah 2:2", highlightedWord: "رَيْبَ" },
    examples: [
      card("هَؤُلَاءِ الطُّلَّابُ وَأُولَئِكَ الْمُعَلِّمُونَ", "These students and those teachers", "haʾulāʾi aṭ-ṭullābu waʾūlaʾika al-muʿallimūna"),
      card("هَذَا كِتَابٌ جَدِيدٌ · هَذَا الْكِتَابُ جَدِيدٌ", "This is a new book · This book is new", "hadhā kitābun jadīdun · hadhā al-kitābu jadīdun"),
      card("لَا رَيْبَ فِيهِ", "There is no doubt in it", "lā rayba fīhi"),
      card("رَسُولٌ مِّنَ اللَّهِ يَتْلُو صُحُفًا مُّطَهَّرَةً", "A Messenger from Allah reciting purified pages", "rasūlun mmina al-lahi yatlū ṣuḥufan mmuṭahharatan"),
    ],
    parseText: "هَذَا الْكِتَابُ جَدِيدٌ",
    parseTokens: [token("هَذَا الْكِتَابُ", "مبتدأ", "this book"), token("جَدِيدٌ", "خبر", "new")],
    conversation: ["مَا هَذَا؟","هَذَا دَفْتَرٌ"],
    conversationDistractor: "تِلْكَ مَكْتَبَةٌ",
    distractor: "That is a library",
    blankDistractor: "جَدِيدُونَ",
    noorTip: "A pointing word with a noun that has الْ is a phrase; without الْ it starts a sentence. After لَا, in the shape لَا رَيْبَ, the noun has a fatḥa and no tanwīn — read it, do not copy it onto every noun.",
    noorTipUr: "الْ والے اسم کے ساتھ اشارے کا لفظ مرکب ہے؛ الْ کے بغیر یہ جملہ شروع کرتا ہے۔ لَا کے بعد، شکل لَا رَيْبَ میں، اسم پر فتحہ ہوتا ہے اور تنوین نہیں — اسے پڑھیں، ہر اسم پر نہ لگائیں۔",
    focuses: [
      { title: "Demonstratives in Depth", titleAr: "الْإِشَارَةُ بِالتَّفْصِيلِ", grammarTerm: "أسماء الإشارة", reveal: "You pointed near and far, to one and to many.", hookQuestion: "Which word points to people far away?" },
      { title: "No … at All — لَا رَيْبَ فِيهِ", titleAr: "لَا النَّافِيَةُ لِلْجِنْسِ", grammarTerm: "لا النافية للجنس", reveal: "You read لَا with a fatḥa noun and told it from لَيْسَ and from لَا before a verb.", hookQuestion: "What ending does the noun carry in لَا رَيْبَ؟" },
      { title: "Adjective Agreement with Demonstratives", titleAr: "الْمُطَابَقَةُ بَيْنَ الصِّفَةِ وَالْمُشَارِ إِلَيْهِ", grammarTerm: "مطابقة", reveal: "You made the describing word agree with its noun.", hookQuestion: "Which describer fits هَذِهِ الْكُتُبُ؟" },
      { title: "In the Classroom and Back to What Was Said", titleAr: "فِي الصَّفِّ وَالْإِشَارَةُ إِلَى مَا سَبَقَ", grammarTerm: "تطبيق", reveal: "You used the pointing words in a classroom and pointed back with كَذَٰلِكَ.", hookQuestion: "What does كَذَٰلِكَ point at?" },
      { title: "Al-Bayyinah I — 98:1–5", titleAr: "الْبَيِّنَةُ ١", grammarTerm: "نص كامل", reveal: "You read the proof they waited for, the Messenger, the dividing and the command.", hookQuestion: "What does حَتَّىٰ join in 98:1?" },
      { title: "Al-Bayyinah II — 98:6–8", titleAr: "الْبَيِّنَةُ ٢", grammarTerm: "نص كامل", reveal: "You read the worst and the best of creatures and the reward.", hookQuestion: "Who is pleased with whom in 98:8?" },
    ],
  },

  // ── Ch63 ── Iḍāfa in Use and Surat Ash-Shams ──────────
  {
    order: 63,
    sourceFile: "Docs/proposals/chapter-63-content-proposal.md",
    title: "Iḍāfa in Use and Surat Ash-Shams",
    titleUr: "اضافت کا استعمال اور سورۃ الشمس",
    titleAr: "الْإِضَافَةُ فِي الِاسْتِعْمَالِ وَالشَّمْسُ",
    description: "Use iḍāfa in every case, drop the right ن from a dual or a sound plural, follow a chain of three, and read all of Surat Ash-Shams.",
    descriptionUr: "ہر حالت میں اضافت استعمال کریں، مثنیٰ یا جمع سالم سے صحیح ن گرائیں، تین کی زنجیر کو سمجھیں، اور پوری سورۃ الشمس پڑھیں۔",
    hook: { ayahAr: "فَقَالَ لَهُمْ رَسُولُ اللَّهِ نَاقَةَ اللَّهِ وَسُقْيَاهَا", ayahRef: "Ash-Shams 91:13", highlightedWord: "رَسُولُ" },
    examples: [
      card("كِتَابُ الطَّالِبِ", "the student's book", "kitābu aṭ-ṭālibi"),
      card("جَاءَ ابْنَا الْمُعَلِّمِ", "the teacher's two sons came", "jāʾa abnā al-muʿallimi"),
      card("مُعَلِّمُو الْمَدْرَسَةِ", "the school's teachers", "muʿallimū al-madrasati"),
      card("رَسُولُ اللَّهِ", "the Messenger of Allah", "rasūlu al-lahi"),
    ],
    parseText: "جَاءَ مُعَلِّمُو الْمَدْرَسَةِ",
    parseTokens: [token("جَاءَ", "فعل", "came"), token("مُعَلِّمُو", "فاعل", "the teachers of"), token("الْمَدْرَسَةِ", "مضاف إليه", "the school")],
    conversation: ["لِمَاذَا سَقَطَتِ النُّونُ مِنْ مُعَلِّمُو الْمَدْرَسَةِ؟","لِأَنَّهُ الْجُزْءُ الْأَوَّلُ مِنَ الْإِضَافَةِ"],
    conversationDistractor: "لِأَنَّ لَنْ دَخَلَتْ عَلَيْهِ",
    distractor: "Because لَنْ came before it",
    blankDistractor: "مُعَلِّمُونَ",
    noorTip: "A ن can go missing for two reasons: a noun loses it as the first term of an iḍāfa; a five verb loses it when لَنْ or لَمْ governs it. Name the reason before you name the word.",
    noorTipUr: "ن دو وجوہات سے گر سکتا ہے: اسم اضافت کا پہلا جزو ہو کر اسے گراتا ہے؛ پانچ افعال میں سے فعل لَنْ یا لَمْ کے عمل سے اسے گراتا ہے۔ لفظ کا نام لینے سے پہلے وجہ بتائیں۔",
    focuses: [
      { title: "Introduction to إضافة", titleAr: "مُقَدِّمَةٌ فِي الْإِضَافَةِ", grammarTerm: "الإضافة", reveal: "You joined two nouns in iḍāfa and kept the second one genitive.", hookQuestion: "Which case does the second term take?" },
      { title: "The نون Drop in إضافة", titleAr: "حَذْفُ النُّونِ فِي الْإِضَافَةِ", grammarTerm: "حذف النون", reveal: "You dropped the ن of a dual and a sound plural as a first term.", hookQuestion: "Why is it يَدَا and not يَدَانِ?" },
      { title: "Quranic Examples of حذف النون", titleAr: "أَمْثِلَةٌ قُرْآنِيَّةٌ", grammarTerm: "تطبيق", reveal: "You read iḍāfa in the Quran and told a broken plural from a sound one.", hookQuestion: "Which plural has no ن to drop?" },
      { title: "Complex إضافة Chains", titleAr: "إِضَافَةٌ مُرَكَّبَةٌ", grammarTerm: "الإضافة المركبة", reveal: "You followed a chain of three nouns.", hookQuestion: "Which noun is both second and first term?" },
      { title: "Ash-Shams I — 91:1–10", titleAr: "الشَّمْسُ ١", grammarTerm: "نص كامل", reveal: "You read seven oaths, what the soul was given and the two ends.", hookQuestion: "What does the ـهَا of فُجُورَهَا point to?" },
      { title: "Ash-Shams II — 91:11–15", titleAr: "الشَّمْسُ ٢", grammarTerm: "نص كامل", reveal: "You read Thamud as an example, with رَسُولُ اللَّهِ and نَاقَةَ اللَّهِ.", hookQuestion: "Which phrase means the Messenger of Allah?" },
    ],
  },

  // ── Ch64 ── Predicates, Al-Balad and Al-Ghashiyah ──────────
  {
    order: 64,
    sourceFile: "Docs/proposals/chapter-64-content-proposal.md",
    title: "Predicates, Al-Balad and Al-Ghashiyah",
    titleUr: "خبر، البلد اور الغاشیہ",
    titleAr: "الْخَبَرُ وَالْبَلَدُ وَالْغَاشِيَةُ",
    description: "Tell nominal from verbal sentences, name the three kinds of predicate, take a whole clause as the predicate, and read all of Surat Al-Balad and Surat Al-Ghashiyah.",
    descriptionUr: "اسمیہ اور فعلیہ جملے الگ کریں، خبر کی تین قسمیں بتائیں، پورے جملے کو خبر کے طور پر لیں، اور پوری سورۃ البلد اور سورۃ الغاشیہ پڑھیں۔",
    hook: { ayahAr: "وُجُوهٌ يَوْمَئِذٍ خَاشِعَةٌ", ayahRef: "Al-Ghashiyah 88:2", highlightedWord: "خَاشِعَةٌ" },
    examples: [
      card("اللَّهُ حَكِيمٌ", "Allah is Wise (a single-word predicate)", "al-lahu ḥakīmun"),
      card("الْكِتَابُ فِي الْبَيْتِ", "The book is in the house (a phrase predicate)", "al-kitābu fī al-bayti"),
      card("اللَّهُ يَعْلَمُ", "Allah knows (a sentence predicate)", "al-lahu yaʿlamu"),
      card("الْمَدْرَسَةُ طُلَّابُهَا كَثِيرُونَ", "The school — its students are many", "al-madrasatu ṭullābuhā kathīrūna"),
    ],
    parseText: "الطَّالِبُ يَكْتُبُ الدَّرْسَ",
    parseTokens: [token("الطَّالِبُ", "مبتدأ", "the student"), token("يَكْتُبُ", "فعل", "writes"), token("الدَّرْسَ", "مفعول", "the lesson")],
    conversation: ["مَا نَوْعُ الْخَبَرِ فِي: اللَّهُ يَعْلَمُ؟","جُمْلَةٌ فِعْلِيَّةٌ"],
    conversationDistractor: "مُفْرَدٌ",
    distractor: "A single word",
    blankDistractor: "كِتَابٌ",
    noorTip: "Take the whole predicate: يَكْتُبُ الدَّرْسَ, not just يَكْتُبُ; بَابُهُ كَبِيرٌ, not just كَبِيرٌ. Never call the same noun both the outer مبتدأ and the inner doer.",
    noorTipUr: "پوری خبر لیں: يَكْتُبُ الدَّرْسَ، صرف يَكْتُبُ نہیں؛ بَابُهُ كَبِيرٌ، صرف كَبِيرٌ نہیں۔ ایک ہی اسم کو باہر کا مبتدا اور اندر کا کرنے والا کبھی نہ کہیں۔",
    focuses: [
      { title: "The Formal Distinction — Nominal and Verbal Sentences", titleAr: "الْجُمْلَةُ الِاسْمِيَّةُ وَالْفِعْلِيَّةُ", grammarTerm: "اسمية وفعلية", reveal: "You told a sentence that starts with a noun from one that starts with a verb.", hookQuestion: "How can you tell a verbal sentence?" },
      { title: "Types of خَبَر — The Predicate", titleAr: "أَنْوَاعُ الْخَبَرِ", grammarTerm: "الخبر", reveal: "You met the single-word, sentence and phrase predicates.", hookQuestion: "What kind is فِي الْبَيْتِ?" },
      { title: "A Sentence Inside the Predicate", titleAr: "جُمْلَةٌ دَاخِلَ الْخَبَرِ", grammarTerm: "الجملة الخبرية", reveal: "You took the whole clause as the predicate and found what links it back.", hookQuestion: "Which words are the whole predicate?" },
      { title: "Reading Layered Sentences", titleAr: "قِرَاءَةُ الْجُمَلِ الْمُرَكَّبَةِ", grammarTerm: "تحليل", reveal: "You read three layers: the outer مبتدأ, the whole predicate and what is inside.", hookQuestion: "What comes first in لِّلَّهِ مَا فِي السَّمَاوَاتِ؟" },
      { title: "Al-Balad I — 90:1–10", titleAr: "الْبَلَدُ ١", grammarTerm: "نص كامل", reveal: "You read the oath, man in hardship and three questions.", hookQuestion: "What does 90:4 say man is created in?" },
      { title: "Al-Balad II — 90:11–20", titleAr: "الْبَلَدُ ٢", grammarTerm: "نص كامل", reveal: "You read the steep path and the two groups.", hookQuestion: "What is the steep path?" },
      { title: "Al-Ghashiyah I — 88:1–7", titleAr: "الْغَاشِيَةُ ١", grammarTerm: "نص كامل", reveal: "You read the report and the first set of faces.", hookQuestion: "What is their only food?" },
      { title: "Al-Ghashiyah II — 88:8–16", titleAr: "الْغَاشِيَةُ ٢", grammarTerm: "نص كامل", reveal: "You read the joyful faces and the high garden.", hookQuestion: "How do the two sets of faces differ?" },
      { title: "Al-Ghashiyah III — 88:17–26", titleAr: "الْغَاشِيَةُ ٣", grammarTerm: "نص كامل", reveal: "You read the call to look and remind, and the return.", hookQuestion: "What comes after 'do they not look'?" },
    ],
  },

  // ── Ch65 ── كَانَ and Its Sisters, and the End of Book 7 ──────────
  {
    order: 65,
    sourceFile: "Docs/proposals/chapter-65-content-proposal.md",
    title: "كَانَ and Its Sisters, and the End of Book 7",
    titleUr: "كَانَ اور اس کی بہنیں، اور کتاب 7 کا اختتام",
    titleAr: "كَانَ وَأَخَوَاتُهَا وَنِهَايَةُ الْكِتَابِ 7",
    description: "Check the three sentence cores, place the predicate, read six sisters of كَانَ with their nominative اسم and accusative خبر, tell complete from incomplete use, and close Book 7 with two reviews.",
    descriptionUr: "تین جملوں کی ساختیں جانچیں، خبر کی جگہ پہچانیں، كَانَ کی چھ بہنوں کو مرفوع اسم اور منصوب خبر کے ساتھ پڑھیں، تام اور ناقص استعمال الگ کریں، اور دو جائزوں کے ساتھ کتاب 7 کو ختم کریں۔",
    hook: { ayahAr: "وَكَانَ اللَّهُ عَلِيمًا حَكِيمًا", ayahRef: "An-Nisa 4:17", highlightedWord: "وَكَانَ" },
    examples: [
      card("كَانَ الطَّالِبُ مُجْتَهِدًا", "The student was diligent", "kāna aṭ-ṭālibu mujtahidan"),
      card("أَصْبَحَ الْجَوُّ بَارِدًا · ظَلَّ الْبَابُ مُغْلَقًا", "The weather became cold · The door stayed closed", "ʾaṣbaḥa al-jawwu bāridan · ẓalla al-bābu mughlaqan"),
      card("ظَلَّ وَجْهُهُ مُسْوَدًّا", "his face stays dark", "ẓalla wajhuhu muswaddan"),
      card("كُن فَيَكُونُ", "Be, and it is", "kun fayakūnu"),
    ],
    parseText: "كَانَ الطَّالِبُ مُجْتَهِدًا",
    parseTokens: [token("كَانَ", "فعل", "was"), token("الطَّالِبُ", "مبتدأ", "the student (its اسم)"), token("مُجْتَهِدًا", "خبر", "diligent (its خبر)")],
    conversation: ["مَا خَبَرُ كَانَ فِي: كَانَ الْكِتَابُ فِي الْبَيْتِ؟","فِي الْبَيْتِ"],
    conversationDistractor: "الْكِتَابُ",
    distractor: "The book",
    blankDistractor: "مُجْتَهِدٌ",
    noorTip: "After كَانَ and its six sisters the اسم stays nominative and a single-word خبر is accusative; a phrase or clause keeps its own endings. Read the whole sentence to tell a complete use from an incomplete one.",
    noorTipUr: "كَانَ اور اس کی چھ بہنوں کے بعد اسم مرفوع رہتا ہے اور اکیلے لفظ کی خبر منصوب ہوتی ہے؛ مرکب یا جملہ اپنی حرکتیں رکھتا ہے۔ تام اور ناقص استعمال الگ کرنے کے لیے پورا جملہ پڑھیں۔",
    focuses: [
      { title: "Three Sentence Cores — Checking What You Know", titleAr: "ثَلَاثَةُ أَنْوَاعٍ مِنَ الْجُمْلَةِ", grammarTerm: "مراجعة", reveal: "You checked the plain core, كَانَ and إِنَّ.", hookQuestion: "Which ending does the خبر of كَانَ take?" },
      { title: "Where the Predicate Stands", titleAr: "مَوْضِعُ الْخَبَرِ", grammarTerm: "موضع الخبر", reveal: "You placed a word, a phrase and a clause as the predicate.", hookQuestion: "Which ending does a phrase predicate keep?" },
      { title: "Three Sisters of كَانَ — أَصْبَحَ, أَمْسَى, صَارَ", titleAr: "أَصْبَحَ وَأَمْسَى وَصَارَ", grammarTerm: "أخوات كان", reveal: "You read three sisters with their nominative اسم and accusative خبر.", hookQuestion: "Which sister carries 'by evening'?" },
      { title: "Three More Sisters — أَضْحَى, بَاتَ, ظَلَّ", titleAr: "أَضْحَى وَبَاتَ وَظَلَّ", grammarTerm: "أخوات كان", reveal: "You read three more sisters and met لَيْسَ again.", hookQuestion: "Which sister says 'stayed'?" },
      { title: "Complete and Incomplete Use", titleAr: "النَّاقِصُ وَالتَّامُّ", grammarTerm: "تام وناقص", reveal: "You told كُن فَيَكُونُ from وَكَانَ اللَّهُ عَلِيمًا.", hookQuestion: "Does كُن فَيَكُونُ need a predicate?" },
      { title: "The Sisters in the Quran and in New Sentences", titleAr: "الْأَخَوَاتُ فِي الْقُرْآنِ", grammarTerm: "تطبيق", reveal: "You read ظَلَّ وَجْهُهُ مُسْوَدًّا and أَصْبَحْتُم إِخْوَانًا.", hookQuestion: "What is the اسم of ظَلَّ in 16:58?" },
    ],
  },

  // ── Ch66 ── Adverbs of Time and Place: Roles, Case, and Phrase Structure ──────────
  {
    order: 66,
    sourceFile: "Docs/proposals/chapter-66-content-proposal.md",
    title: "Adverbs of Time and Place: Roles, Case, and Phrase Structure",
    titleUr: "وقت اور مکان کے ظروف: کردار، اعراب اور فقرے کی ساخت",
    titleAr: "ظَرْفُ الزَّمَانِ وَالْمَكَانِ: الْوَظِيفَةُ وَالْإِعْرَابُ",
    description: "Tell a time or place adverb from a prepositional phrase and from a noun in another role, read the head and its dependent, see a changing ending against a fixed one, separate a predicate phrase from what is inside it, and read all of Surat Al-Infitar.",
    descriptionUr: "وقت یا جگہ کے ظرف کو جار مجرور اور دوسرے کام والے اسم سے الگ پہچانیں، پہلا حصہ اور اس کا متعلق پڑھیں، بدلتے اور ٹھہرے ہوئے ختم میں فرق دیکھیں، خبر کے فقرے کو اس کے اندر سے الگ کریں، اور پوری سورۃ الانفطار پڑھیں۔",
    hook: { ayahAr: "يَوْمَ لَا تَمْلِكُ نَفْسٌ لِّنَفْسٍ شَيْئًا", ayahRef: "Al-Infitar 82:19", highlightedWord: "يَوْمَ" },
    examples: [
      card("جَلَسَ الطَّالِبُ أَمَامَ الْمَكْتَبِ", "The student sat in front of the desk", "jalasa aṭ-ṭālibu ʾamāma al-maktabi"),
      card("سَافَرْتُ يَوْمَ الْجُمُعَةِ", "I travelled on Friday", "sāfartu yawma al-jumuʿati"),
      card("الْكِتَابُ فَوْقَ الْمَكْتَبِ", "The book is above the desk", "al-kitābu fawqa al-maktabi"),
      card("يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ", "He knows what is before them and what is behind them", "yaʿlamu mā bayna ʾaydīhim wamā khalfahum"),
    ],
    parseText: "جَلَسَ الطَّالِبُ أَمَامَ الْمَكْتَبِ",
    parseTokens: [token("جَلَسَ", "فعل", "sat"), token("الطَّالِبُ", "فاعل", "the student"), token("أَمَامَ", "ظرف مكان", "in front of"), token("الْمَكْتَبِ", "مضاف إليه", "the desk")],
    conversation: ["أَيْنَ جَلَسَ الطَّالِبُ؟","جَلَسَ أَمَامَ الْمَكْتَبِ"],
    conversationDistractor: "نَعَمْ، شُكْرًا",
    distractor: "Yes, thank you",
    blankDistractor: "لَيْلًا",
    noorTip: "A ظرف is a noun that tells when or where, usually in the accusative. The job decides the ending: the same word can be nominative as a subject, accusative as a ظرف and genitive after a preposition.",
    noorTipUr: "ظرف وقت یا جگہ بتانے والا اسم ہے، عموماً منصوب۔ ختم کام سے طے ہوتا ہے: وہی لفظ مبتدا ہو تو مرفوع، ظرف ہو تو منصوب اور حرفِ جر کے بعد مجرور ہو سکتا ہے۔",
    focuses: [
      { title: "What Makes a Noun a ظرف?", titleAr: "مَا الظَّرْفُ؟", grammarTerm: "ظرف", reveal: "You told a place or time ظرف from a preposition and from a time word used as a subject.", hookQuestion: "Is أَقْطَارِ after مِنْ a ظرف?" },
      { title: "Time Words in Context", titleAr: "ظُرُوفُ الزَّمَانِ", grammarTerm: "ظرف زمان", reveal: "You told a point in time from a length of time and a time word after a preposition from a ظرف.", hookQuestion: "What does حُقُبًا tell?" },
      { title: "Place Words and Their Dependents", titleAr: "ظُرُوفُ الْمَكَانِ", grammarTerm: "مضاف إليه", reveal: "You read a place word with its genitive dependent, a noun or a pronoun.", hookQuestion: "What is هُمْ in خَلْفَهُمْ?" },
      { title: "A Changing Ending and a Fixed One", titleAr: "الْمُعْرَبُ وَالْمَبْنِيُّ", grammarTerm: "معرب ومبني", reveal: "You compared يَوْمُ, يَوْمَ and يَوْمِ and met the fixed حَيْثُ.", hookQuestion: "Which word keeps its ḍamma wherever it stands?" },
      { title: "A Predicate Phrase and What Is Inside It", titleAr: "الْخَبَرُ شِبْهُ الْجُمْلَةِ", grammarTerm: "شبه الجملة", reveal: "You told a predicate phrase from the ظرف or preposition inside it.", hookQuestion: "What is the predicate of الْكِتَابُ فَوْقَ الْمَكْتَبِ?" },
      { title: "Al-Infitar I — 82:1–9", titleAr: "الِانْفِطَارُ ١", grammarTerm: "نص كامل", reveal: "You read four events, what a soul knows and the question to the human being.", hookQuestion: "What follows the four events?" },
      { title: "Al-Infitar II — 82:10–19", titleAr: "الِانْفِطَارُ ٢", grammarTerm: "نص كامل", reveal: "You read the keepers, the two ends and the Day.", hookQuestion: "In which ayah is يَوْمُ the thing asked about?" },
    ],
  },

  // ── Ch67 ── لَوْ: A Pictured Condition and Its Result ──────────
  {
    order: 67,
    sourceFile: "Docs/proposals/chapter-67-content-proposal.md",
    title: "لَوْ: A Pictured Condition and Its Result",
    titleUr: "لَوْ: ایک فرضی شرط اور اس کا نتیجہ",
    titleAr: "لَوْ: الشَّرْطُ الْمُتَخَيَّلُ وَجَوَابُهُ",
    description: "Read لَوْ as a pictured condition, find its condition and its result, read past and imperfect verbs by their sentence, meet لَوْ لَمْ and لَوْلَا, answer a 'why' with the other choice, and read all of Surat Al-Alaq.",
    descriptionUr: "لَوْ کو فرضی شرط کے طور پر پڑھیں، اس کی شرط اور نتیجہ تلاش کریں، ماضی اور مضارع افعال کو ان کے جملے سے پڑھیں، لَوْ لَمْ اور لَوْلَا سے ملیں، 'کیوں' کا جواب دوسرے انتخاب سے دیں، اور پوری سورۃ العلق پڑھیں۔",
    hook: { ayahAr: "لَوْ كَانَ فِيهِمَا آلِهَةٌ إِلَّا اللَّهُ لَفَسَدَتَا", ayahRef: "Al-Anbiya 21:22", highlightedWord: "لَوْ" },
    examples: [
      card("لَوْ دَرَسْتَ لَنَجَحْتَ", "Had you studied, you would have passed", "law darasta lanajaḥta"),
      card("لَوْ ذَهَبْتَ مَعَنَا لَفَرِحْنَا", "Had you gone with us, we would have been glad", "law dhahabta maʿanā lafariḥnā"),
      card("لَوْلَا الْمَاءُ لَهَلَكَ النَّاسُ", "Were it not for water, people would perish", "lawlā al-māʾu lahalaka an-nāsu"),
      card("لَوْ خَرَجْتُ مُبَكِّرًا لَوَصَلْتُ فِي الْوَقْتِ", "Had I left early, I would have arrived on time", "law kharajtu mubakkiran lawaṣaltu fī al-waqti"),
    ],
    parseText: "لَوْ دَرَسْتَ لَنَجَحْتَ",
    parseTokens: [token("لَوْ", "حرف", "had"), token("دَرَسْتَ", "فعل الشرط", "you studied"), token("لَنَجَحْتَ", "جواب", "you would have passed")],
    conversation: ["لِمَاذَا لَمْ تَنْجَحْ؟","لَوْ دَرَسْتُ لَنَجَحْتُ"],
    conversationDistractor: "نَجَحْتُ لِأَنِّي دَرَسْتُ",
    distractor: "I passed because I studied",
    blankDistractor: "إِذَا",
    noorTip: "لَوْ pictures a condition and what would have followed; it does not change the verb's ending. Find the condition after لَوْ and the result after it, and read the verb by its sentence.",
    noorTipUr: "لَوْ ایک شرط اور اس کے نتیجے کا تصور کراتا ہے؛ یہ فعل کا ختم نہیں بدلتا۔ لَوْ کے بعد شرط اور اس کے بعد نتیجہ تلاش کریں، اور فعل کو اس کے جملے سے پڑھیں۔",
    focuses: [
      { title: "Meet لَوْ: A Condition Pictured", titleAr: "لَوْ: الشَّرْطُ الْمُتَخَيَّلُ", grammarTerm: "لو", reveal: "You read لَوْ against إِذَا and saw that it does not change the verb.", hookQuestion: "Does لَوْ put the next verb in the jussive?" },
      { title: "Find the Condition and Its Result", titleAr: "الشَّرْطُ وَجَوَابُهُ", grammarTerm: "جواب لو", reveal: "You marked the condition and a result with لَـ and a negative result with مَا.", hookQuestion: "Which result begins with مَا in 8:63?" },
      { title: "Verb Form and Meaning in Context", titleAr: "صِيغَةُ الْفِعْلِ وَالْمَعْنَى", grammarTerm: "صيغة الفعل", reveal: "You read a past and an imperfect verb after لَوْ by their sentence.", hookQuestion: "What does لَوْ تَرَى mean in 32:12?" },
      { title: "Saying 'Not' After لَوْ, and لَوْلَا", titleAr: "لَوْ لَمْ وَلَوْلَا", grammarTerm: "لولا", reveal: "You read لَوْ لَمْ with لَمْ governing, and لَوْلَا + a noun as 'if it were not for'.", hookQuestion: "Which word governs the jussive in لَوْ لَمْ تَمْسَسْهُ؟" },
      { title: "A Short Exchange with لَوْ", titleAr: "حِوَارٌ قَصِيرٌ بِلَوْ", grammarTerm: "تطبيق", reveal: "You answered a 'why' with the other choice, keyed from the facts.", hookQuestion: "Which reply fits a boy who left late?" },
      { title: "Al-Alaq I — 96:1–8", titleAr: "الْعَلَقُ ١", grammarTerm: "نص كامل", reveal: "You read the command to read, the Lord who created and taught, and the warning.", hookQuestion: "What is اقْرَأْ?" },
      { title: "Al-Alaq II — 96:9–19", titleAr: "الْعَلَقُ ٢", grammarTerm: "نص كامل", reveal: "You read three questions, a warning and the closing commands.", hookQuestion: "How does the surah close?" },
    ],
  },

  // ── Ch68 ── Common Jussive Particles and Conditions ──────────
  {
    order: 68,
    sourceFile: "Docs/proposals/chapter-68-content-proposal.md",
    title: "Common Jussive Particles and Conditions",
    titleUr: "جزم کے عام حروف اور شرطیں",
    titleAr: "حُرُوفُ الْجَزْمِ وَالشَّرْطُ",
    description: "Put the three jussive signs side by side, tell لَمْ, لَمَّا and لَا apart, give a command with lām, read a two-verb condition with إِنْ or مَنْ, and read all of Surat Al-Layl.",
    descriptionUr: "جزم کی تین علامتیں ساتھ ساتھ رکھیں، لَمْ، لَمَّا اور لَا میں فرق کریں، لام سے حکم دیں، إِنْ یا مَنْ کے ساتھ دو فعل والی شرط پڑھیں، اور پوری سورۃ اللیل پڑھیں۔",
    hook: { ayahAr: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ", ayahRef: "Yusuf 12:87", highlightedWord: "تَيْأَسُوا" },
    examples: [
      card("لَمْ يَكْتُبْ · لَمْ يَرْمِ · لَمْ يَذْهَبُوا", "he did not write · he did not throw · they did not go", "lam yaktub · lam yarmi · lam yadhhabū"),
      card("لَا تَجْلِسْ · لَا تَجْلِسُ", "do not sit! · you do not sit", "lā tajlis · lā tajlisu"),
      card("لِيَكْتُبْ خَالِدٌ الدَّرْسَ", "let Khalid write the lesson", "liyaktub khālidun ad-darsa"),
      card("وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا", "and whoever fears Allah, He will make for him a way out", "waman yattaqi al-laha yajʿal llahu makhrajan"),
    ],
    parseText: "إِنْ تَدْرُسْ تَنْجَحْ",
    parseTokens: [token("إِنْ", "أداة شرط", "if"), token("تَدْرُسْ", "فعل الشرط مجزوم", "you study"), token("تَنْجَحْ", "جواب الشرط مجزوم", "you will pass")],
    conversation: ["هَلْ نَجَحَ خَالِدٌ؟","لَا، لَمَّا يَنْجَحْ خَالِدٌ"],
    conversationDistractor: "لَا، لَنْ يَنْجَحَ خَالِدٌ أَبَدًا",
    distractor: "No, Khalid will never pass",
    blankDistractor: "يَكْتُبُ",
    noorTip: "The jussive is a state of the verb with three signs: a sukūn, a dropped weak letter, a dropped ن. Name the particle first, then the sign: لَمْ 'did not', لَمَّا 'not yet', prohibitive لَا, command lām, and إِنْ or مَنْ with two jussive verbs.",
    noorTipUr: "مجزوم فعل کی ایک حالت ہے جس کی تین علامتیں ہیں: سکون، گرا ہوا کمزور حرف، گرا ہوا ن۔ پہلے حرف کا نام لیں، پھر علامت: لَمْ 'نہیں'، لَمَّا 'ابھی نہیں'، نہی والا لَا، امر کا لام، اور دو مجزوم افعال کے ساتھ إِنْ یا مَنْ۔",
    focuses: [
      { title: "Three Signs of the Jussive", titleAr: "عَلَامَاتُ الْجَزْمِ", grammarTerm: "علامات الجزم", reveal: "You put the sukūn, the dropped weak letter and the dropped ن side by side.", hookQuestion: "What happens to the ن of تَيْأَسُونَ after لَا?" },
      { title: "لَمْ, لَمَّا — 'Did Not' and 'Not Yet'", titleAr: "لَمْ وَلَمَّا", grammarTerm: "لم ولما", reveal: "You told 'did not', 'not yet' and 'when'.", hookQuestion: "What does لَمَّا mean before a past verb?" },
      { title: "لَا: 'Do Not' or 'Does Not'", titleAr: "لَا النَّاهِيَةُ وَلَا النَّافِيَةُ", grammarTerm: "لا الناهية", reveal: "You told a prohibition from a negative statement with the same letters.", hookQuestion: "Which of لَا تَجْلِسْ and لَا تَجْلِسُ forbids?" },
      { title: "Command لِـ and the Direct Command", titleAr: "لَامُ الْأَمْرِ وَفِعْلُ الْأَمْرِ", grammarTerm: "لام الأمر", reveal: "You told لِيَكْتُبْ, اُكْتُبْ and لِيَكْتُبَ apart.", hookQuestion: "Is اُكْتُبْ an imperfect verb with a hidden lām?" },
      { title: "Two Verbs, One Condition: إِنْ and مَنْ", titleAr: "إِنْ وَمَنْ", grammarTerm: "جملة الشرط", reveal: "You read a condition and an answer in the jussive, and told conditional مَنْ from a question.", hookQuestion: "Which مَنْ governs two verbs?" },
      { title: "Al-Layl I — 92:1–11", titleAr: "اللَّيْلُ ١", grammarTerm: "نص كامل", reveal: "You read the oaths and the two paths.", hookQuestion: "What follows أَمَّا مَنْ أَعْطَى؟" },
      { title: "Al-Layl II — 92:12–21", titleAr: "اللَّيْلُ ٢", grammarTerm: "نص كامل", reveal: "You read guidance, the warning and the two ends.", hookQuestion: "Who will be kept away from the Fire?" },
    ],
  },

  // ── Ch69 ── The Jussive Response to a Request, and Two Surahs ──────────
  {
    order: 69,
    sourceFile: "Docs/proposals/chapter-69-content-proposal.md",
    title: "The Jussive Response to a Request, and Two Surahs",
    titleUr: "درخواست کا مجزوم جواب، اور دو سورتیں",
    titleAr: "جَوَابُ الطَّلَبِ وَسُورَتَانِ",
    description: "Follow a command or prohibition and the jussive verb that says what follows from it, tell a response from a direct command and from a separate statement, read 33:70–71, and read all of At-Tariq and Al-Inshiqaq.",
    descriptionUr: "حکم یا نہی اور اس کے بعد وہ مجزوم فعل پڑھیں جو بتاتا ہے کہ اس سے کیا ہوگا، جواب کو براہِ راست حکم اور الگ بیان سے الگ پہچانیں، 33:70–71 پڑھیں، اور پوری الطارق اور الانشقاق پڑھیں۔",
    hook: { ayahAr: "يُصْلِحْ لَكُمْ أَعْمَالَكُمْ وَيَغْفِرْ لَكُمْ ذُنُوبَكُمْ", ayahRef: "Al-Ahzab 33:71", highlightedWord: "يُصْلِحْ" },
    examples: [
      card("اُدْرُسْ تَنْجَحْ", "Study, you will pass", "udrus tanjaḥ"),
      card("اُدْرُسُوا تَنْجَحُوا", "Study (all of you), you will pass", "udrusū tanjaḥū"),
      card("لَا تَنْسَ الدَّرْسَ تَنْجَحْ", "Do not forget the lesson, you will pass", "lā tansa ad-darsa tanjaḥ"),
      card("اُدْرُسْ، يَنْجَحُ خَالِدٌ", "Study! Khalid is passing", "udrus yanjaḥu khālidun"),
    ],
    parseText: "اُدْرُسْ تَنْجَحْ",
    parseTokens: [token("اُدْرُسْ", "فعل أمر", "study!"), token("تَنْجَحْ", "جواب الطلب مجزوم", "you will pass")],
    conversation: ["مَاذَا أَفْعَلُ لِأَنْجَحَ؟","اُدْرُسْ تَنْجَحْ"],
    conversationDistractor: "اُدْرُسْ، يَنْجَحُ خَالِدٌ",
    distractor: "Study! Khalid is passing",
    blankDistractor: "تَنْجَحُ",
    noorTip: "A command asks; a jussive verb after it says what follows from doing it. The command is its own form and is not made jussive; a separate statement after a request keeps the indicative.",
    noorTipUr: "حکم مانگتا ہے؛ اس کے بعد مجزوم فعل بتاتا ہے کہ اسے کرنے سے کیا ہوگا۔ حکم اپنی الگ صورت ہے اور اسے مجزوم نہیں کیا جاتا؛ درخواست کے بعد الگ بیان مرفوع رہتا ہے۔",
    focuses: [
      { title: "A Request and Its Consequence", titleAr: "الطَّلَبُ وَجَوَابُهُ", grammarTerm: "جواب الطلب", reveal: "You read a command and the jussive verb that says what follows.", hookQuestion: "Which word is the request in اُدْرُسْ تَنْجَحْ?" },
      { title: "Signs on the Response Verb", titleAr: "عَلَامَاتُ الْجَزْمِ فِي الْجَوَابِ", grammarTerm: "علامات الجزم", reveal: "You saw a sukūn, a dropped ن and a dropped weak letter in the response.", hookQuestion: "What is the sign on تَنْجُ?" },
      { title: "When Does a Request License a Result?", titleAr: "مَتَى يَصِحُّ الْجَوَابُ؟", grammarTerm: "الطلب", reveal: "You told a response from a separate statement, for a command and a prohibition.", hookQuestion: "Why does يَنْجَحُ keep its ḍamma in اُدْرُسْ، يَنْجَحُ خَالِدٌ?" },
      { title: "In the Quran: Requests, Results and a Contrast", titleAr: "فِي الْقُرْآنِ", grammarTerm: "تطبيق", reveal: "You read 33:70 and 33:71 and told 2:282's وَ from a response.", hookQuestion: "What are يُصْلِحْ and يَغْفِرْ in 33:71?" },
      { title: "At-Tariq I — 86:1–10", titleAr: "الطَّارِقُ ١", grammarTerm: "نص كامل", reveal: "You read the oath, the guardian and where the human being came from.", hookQuestion: "What is the lām of فَلْيَنظُرِ?" },
      { title: "At-Tariq II — 86:11–17", titleAr: "الطَّارِقُ ٢", grammarTerm: "نص كامل", reveal: "You read the decisive word, the plot and the two closing commands.", hookQuestion: "Are the two verbs of 86:17 jussive responses?" },
      { title: "Al-Inshiqaq I — 84:1–6", titleAr: "الِانْشِقَاقُ ١", grammarTerm: "نص كامل", reveal: "You read the sky, the earth and the address to the human being.", hookQuestion: "Which line is repeated in 84:2 and 84:5?" },
      { title: "Al-Inshiqaq II — 84:7–15", titleAr: "الِانْشِقَاقُ ٢", grammarTerm: "نص كامل", reveal: "You read two records and two outcomes.", hookQuestion: "Which record is given behind the back?" },
      { title: "Al-Inshiqaq III — 84:16–25", titleAr: "الِانْشِقَاقُ ٣", grammarTerm: "نص كامل", reveal: "You read the oaths, the question about unbelief and the closing news.", hookQuestion: "Who is excepted in 84:25?" },
    ],
  },

  // ── Ch70 ── Exception with إِلَّا, and Surat Al-Buruj ──────────
  {
    order: 70,
    sourceFile: "Docs/proposals/chapter-70-content-proposal.md",
    title: "Exception with إِلَّا, and Surat Al-Buruj",
    titleUr: "إِلَّا کے ساتھ استثنا، اور سورۃ البروج",
    titleAr: "الِاسْتِثْنَاءُ بِإِلَّا وَالْبُرُوجُ",
    description: "Name the parts of an exception sentence, read the complete affirmative, the complete negative and the restriction with no stated group, use غَيْر and سِوَى as nouns, and read all of Surat Al-Buruj.",
    descriptionUr: "استثنا والے جملے کے اجزا کے نام سیکھیں، تام مثبت، تام منفی اور بغیر بیان کیے گروہ کا حصر پڑھیں، غَيْر اور سِوَى کو اسم کے طور پر استعمال کریں، اور پوری سورۃ البروج پڑھیں۔",
    hook: { ayahAr: "فَشَرِبُوا مِنْهُ إِلَّا قَلِيلًا مِّنْهُمْ", ayahRef: "Al-Baqarah 2:249", highlightedWord: "إِلَّا" },
    examples: [
      card("حَضَرَ الطُّلَّابُ إِلَّا طَالِبًا", "The students attended except a student", "ḥaḍara aṭ-ṭullābu ʾillā ṭāliban"),
      card("مَا حَضَرَ الطُّلَّابُ إِلَّا طَالِبٌ", "None of the students attended except one", "mā ḥaḍara aṭ-ṭullābu ʾillā ṭālibun"),
      card("مَا رَأَيْتُ إِلَّا زَيْدًا", "I saw only Zayd", "mā raʾaytu ʾillā zaydan"),
      card("حَضَرَ الطُّلَّابُ غَيْرَ طَالِبٍ", "The students attended other than a student", "ḥaḍara aṭ-ṭullābu ghayra ṭālibin"),
    ],
    parseText: "حَضَرَ الطُّلَّابُ إِلَّا طَالِبًا",
    parseTokens: [token("حَضَرَ", "فعل", "attended"), token("الطُّلَّابُ", "المستثنى منه", "the students"), token("إِلَّا", "أداة الاستثناء", "except"), token("طَالِبًا", "مستثنى منصوب", "a student")],
    conversation: ["مَنْ حَضَرَ الْيَوْمَ؟","حَضَرَ الطُّلَّابُ إِلَّا خَالِدًا"],
    conversationDistractor: "حَضَرَ خَالِدٌ وَحْدَهُ",
    distractor: "Khalid attended alone",
    blankDistractor: "طَالِبٌ",
    noorTip: "Ask two questions before you choose an ending: is the group stated, and is the sentence affirmative or negative? Complete affirmative: accusative. Complete negative: the group's case or accusative. No stated group: the ending of the word's own role.",
    noorTipUr: "ختم چننے سے پہلے دو سوال پوچھیں: کیا گروہ بیان ہے، اور جملہ مثبت ہے یا منفی؟ تام مثبت: منصوب۔ تام منفی: گروہ کی حالت یا منصوب۔ گروہ بیان نہ ہو: لفظ کے اپنے کردار کا ختم۔",
    focuses: [
      { title: "The Parts of an Exception Sentence", titleAr: "أَرْكَانُ جُمْلَةِ الِاسْتِثْنَاءِ", grammarTerm: "المستثنى", reveal: "You named the verdict, the stated group, the tool and the excepted word.", hookQuestion: "Which word is the excepted word in 2:34?" },
      { title: "Complete Affirmative Exception", titleAr: "التَّامُّ الْمُثْبَتُ", grammarTerm: "تام مثبت", reveal: "You gave the excepted word the accusative after a stated group.", hookQuestion: "Which ending follows إِلَّا in حَضَرَ الطُّلَّابُ إِلَّا ___?" },
      { title: "Complete Negative Exception", titleAr: "التَّامُّ الْمَنْفِيُّ", grammarTerm: "بدل", reveal: "You read the replacement and the accusative analysis, each named.", hookQuestion: "What does the nominative طَالِبٌ show?" },
      { title: "Restriction: No Stated Group", titleAr: "الْحَصْرُ", grammarTerm: "حصر", reveal: "You gave the word after إِلَّا the ending of its own role.", hookQuestion: "Why is زَيْدًا accusative in مَا رَأَيْتُ إِلَّا زَيْدًا?" },
      { title: "غَيْر and سِوَى", titleAr: "غَيْرُ وَسِوَى", grammarTerm: "غير وسوى", reveal: "You read two nouns that mean 'other than', with a genitive dependent.", hookQuestion: "What is طَالِبٍ in حَضَرَ الطُّلَّابُ غَيْرَ طَالِبٍ?" },
      { title: "Al-Buruj I — 85:1–11", titleAr: "الْبُرُوجُ ١", grammarTerm: "نص كامل", reveal: "You read the oaths, the people of the trench and the two outcomes.", hookQuestion: "What did they resent only?" },
      { title: "Al-Buruj II — 85:12–22", titleAr: "الْبُرُوجُ ٢", grammarTerm: "نص كامل", reveal: "You read who He is, the armies and the preserved tablet.", hookQuestion: "What encompasses the deniers from behind?" },
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
