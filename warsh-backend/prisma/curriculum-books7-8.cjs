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
