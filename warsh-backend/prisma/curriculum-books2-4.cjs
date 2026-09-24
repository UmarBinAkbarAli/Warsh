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
  const specialType = spec.order >= 10 ? "CONVERSATION_BUILDER" : spec.order >= 4 ? "GRAMMAR_PARSE" : "MATCHING";
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
  ];

  if (specialType === "MATCHING") {
    const pairs = spec.examples.slice(0, 3).map((item) => pair(item.arabicText, item.translation));
    exercises.push({
      type: "MATCHING",
      prompt: "Match each Arabic pattern with its meaning.",
      pairs,
      options: pairs.map((item) => item.right).reverse(),
    });
  } else if (specialType === "GRAMMAR_PARSE") {
    exercises.push({
      type: "GRAMMAR_PARSE",
      prompt: "Label the role of each word in a sentence you have already seen.",
      arabicText: spec.parseText,
      parseTokens: spec.parseTokens,
      labels: LABELS,
    });
  } else {
    exercises.push({
      type: "CONVERSATION_BUILDER",
      prompt: "Choose the reply that completes the exchange.",
      conversation: [
        { speaker: "Yusuf", line: spec.conversation[0] },
        { speaker: "Ibrahim", line: "..." },
      ],
      options: [spec.conversation[1], spec.conversationDistractor, second.arabicText, third.arabicText],
      correctAnswer: spec.conversation[1],
    });
  }

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
    titleUr: spec.titleUr ?? localizeMetadata(spec.title),
    titleAr: spec.titleAr,
    description: spec.description,
    descriptionUr: spec.descriptionUr ?? localizeMetadata(spec.description),
    worldMapX: Number((0.08 + spec.order * 0.055).toFixed(2)),
    worldMapY: Number((0.12 + (spec.order % 5) * 0.14).toFixed(2)),
    isLocked: spec.order !== 1,
    lessons: spec.focuses.map((focus, index) => makeLesson(spec, index + 1, focus)),
  };
}

const specs = [
  // ── Ch16 ── School Life in Quranic Arabic ───────────────────────────────
  // Docs/proposals/chapter-16-content-proposal.md (2026-09-23): classroom
  // objects and أَيْنَ؟ answers (Al-Alaq 96:4, بِالْقَلَمِ), teacher/student/lesson
  // roles (96:5 عَلَّمَ, a thematic link only), أَمْسِ / الْيَوْمَ / غَدًا (Al-Kahf
  // 18:23), and whole-phrase classroom instructions (96:1 اقْرَأْ). No future
  // سَـ, present conjugation or imperative derivation.
  {
    order: 16,
    // The former reader_lecture_16 files never existed in the repository; the
    // approved proposal is the content specification.
    sourceFile: "Docs/proposals/chapter-16-content-proposal.md",
    title: "School Life in Quranic Arabic",
    titleUr: "قرآنی عربی میں اسکول کی زندگی",
    titleAr: "فِي الْمَدْرَسَةِ",
    description: "A school scene in Arabic: classroom objects and where they are, teacher, student and lesson, yesterday, today and tomorrow, and a teacher's instructions — with the Quran words بِالْقَلَمِ, غَدًا and اقْرَأْ.",
    descriptionUr: "عربی میں اسکول کا منظر: کلاس کی چیزیں اور وہ کہاں ہیں، استاد، طالب علم اور سبق، گزرا ہوا کل، آج اور آنے والا کل، اور استاد کی ہدایات — قرآنی الفاظ بِالْقَلَمِ، غَدًا اور اقْرَأْ کے ساتھ۔",
    hook: { ayahAr: "الَّذِي عَلَّمَ بِالْقَلَمِ", ayahRef: "Al-Alaq 96:4", highlightedWord: "بِالْقَلَمِ" },
    examples: [
      card("الْكِتَابُ عَلَى الْمَكْتَبِ", "The book is on the desk.", "al-kitābu ʿalā l-maktabi"),
      card("الْأُسْتَاذُ فِي الْفَصْلِ", "The teacher is in the classroom.", "al-ustādhu fī l-faṣli"),
      card("الدَّرْسُ غَدًا", "The lesson is tomorrow.", "ad-darsu ghadan"),
      card("ذَهَبَ الطَّالِبُ إِلَى الْمَدْرَسَةِ أَمْسِ", "The student went to the school yesterday.", "dhahaba ṭ-ṭālibu ilā l-madrasati amsi"),
    ],
    parseText: "الْأُسْتَاذُ فِي الْفَصْلِ",
    parseTokens: [token("الْأُسْتَاذُ", "مبتدأ", "the teacher"), token("فِي", "حرف جر", "in"), token("الْفَصْلِ", "اسم مجرور", "the classroom")],
    conversation: ["أَيْنَ الْقَلَمُ؟", "الْقَلَمُ عَلَى الدَّفْتَرِ"],
    conversationDistractor: "الدَّرْسُ غَدًا",
    distractor: "The lesson was yesterday.",
    blankDistractor: "أَمْسِ",
    noorTip: "بِالْقَلَمِ in Al-Alaq 96:4 really is the word pen, the one on your desk; the ayah speaks of Allah who taught by the pen, not of a classroom.",
    noorTipUr: "سورۃ العلق 96:4 میں بِالْقَلَمِ واقعی لفظ قلم ہے، وہی جو آپ کی میز پر ہے؛ آیت اللہ کا ذکر کرتی ہے جس نے قلم کے ذریعے سکھایا، کلاس کا نہیں۔",
    focuses: [
      { title: "In the Learning Space", titleAr: "فِي الْفَصْلِ", grammarTerm: "مفردات المدرسة", reveal: "فَصْلٌ, مَكْتَبٌ, دَفْتَرٌ and a أَيْنَ؟ answer; Al-Alaq 96:4 بِالْقَلَمِ is a real pen occurrence.", hookQuestion: "Which word in الَّذِي عَلَّمَ بِالْقَلَمِ contains pen?" },
      { title: "Teacher, Student, and Lesson", titleAr: "الْأُسْتَاذُ وَالطَّالِبُ وَالدَّرْسُ", grammarTerm: "مفردات المدرسة", reveal: "أُسْتَاذٌ teaches, طَالِبٌ learns, دَرْسٌ is the lesson; 96:5 عَلَّمَ is a thematic link, not a school word.", hookQuestion: "Who is in the classroom, and what is the lesson?" },
      { title: "Yesterday, Today, Tomorrow", titleAr: "أَمْسِ وَالْيَوْمَ وَغَدًا", grammarTerm: "ظرف زمان", reveal: "أَمْسِ, الْيَوْمَ, غَدًا by meaning; غَدًا is آنے والا کل, never پرسوں (Al-Kahf 18:23).", hookQuestion: "Which word in Al-Kahf 18:23 means tomorrow?" },
      { title: "Listen and Respond in Class", titleAr: "تَعْلِيمَاتُ الْفَصْلِ", grammarTerm: "فعل أمر", reveal: "اِفْتَحْ، اِقْرَأْ، اُكْتُبْ، اُنْظُرْ، قُلْ understood as whole instructions; Al-Alaq 96:1 اقْرَأْ is the Quran's own command.", hookQuestion: "What does اقْرَأْ ask the listener to do?" },
    ],
  },

  // ── Ch17 ── Past Actions in Quranic Arabic ──────────────────────────────
  // Docs/proposals/chapter-17-content-proposal.md (2026-09-23): seven assessed
  // past actions (أَكَلَ، شَرِبَ، قَرَأَ، كَتَبَ، قَامَ، صَلَّى، سَمِعَ) with ذَهَبَ
  // retrieved; action, doer and object/destination; the scoped ـتْ clue. Quran:
  // Yusuf 12:17, Al-Baqarah 2:249, Al-Mujadilah 58:21 (كَتَبَ = decreed), Al-Jinn
  // 72:19, Al-Qiyamah 75:31–33 (negated صَلَّىٰ), Al-Mujadilah 58:1; 2:286 كَسَبَتْ
  // only as a labelled retrieval of the feminine clue.
  {
    order: 17,
    // The former reader_lecture_17 files never existed in the repository; the
    // approved proposal is the content specification.
    sourceFile: "Docs/proposals/chapter-17-content-proposal.md",
    title: "Past Actions in Quranic Arabic",
    titleUr: "قرآنی عربی میں ماضی کے کام",
    titleAr: "الْأَفْعَالُ الْمَاضِيَةُ",
    description: "Reading who did what: seven past actions, their doers and objects, the feminine ـتْ clue, and real past actions in the Quran read in their context.",
    descriptionUr: "یہ پڑھنا کہ کس نے کیا کیا: ماضی کے سات کام، ان کے کرنے والے اور مفعول، مؤنث ـتْ کا اشارہ، اور قرآن میں ماضی کے حقیقی کام ان کے سیاق میں۔",
    hook: { ayahAr: "وَأَنَّهُ لَمَّا قَامَ عَبْدُ اللَّهِ يَدْعُوهُ", ayahRef: "Al-Jinn 72:19", highlightedWord: "قَامَ" },
    examples: [
      card("أَكَلَ الْوَلَدُ الْخُبْزَ", "The boy ate the bread.", "akala l-waladu l-khubza"),
      card("قَرَأَ الطَّالِبُ الْكِتَابَ", "The student read the book.", "qaraʾa ṭ-ṭālibu l-kitāba"),
      card("سَمِعَ الطَّالِبُ الْأُسْتَاذَ", "The student heard the teacher.", "samiʿa ṭ-ṭālibu l-ustādha"),
      card("ذَهَبَ الرَّجُلُ إِلَى الْمَسْجِدِ", "The man went to the mosque.", "dhahaba r-rajulu ilā l-masjidi"),
    ],
    parseText: "كَتَبَ الطَّالِبُ الدَّرْسَ",
    parseTokens: [token("كَتَبَ", "فعل", "wrote"), token("الطَّالِبُ", "فاعل", "the student"), token("الدَّرْسَ", "مفعول", "the lesson")],
    conversation: ["مَاذَا فَعَلَ الطَّالِبُ؟", "قَرَأَ الْكِتَابَ"],
    conversationDistractor: "الطَّالِبُ فِي الْفَصْلِ",
    distractor: "The teacher heard the student.",
    blankDistractor: "شَرِبَ",
    noorTip: "In Al-Qiyamah 75:31 صَلَّىٰ comes after لَا: nor did he pray. Find the action word, then read what surrounds it before you decide what happened.",
    noorTipUr: "سورۃ القیامہ 75:31 میں صَلَّىٰ، لَا کے بعد آتا ہے: اور نہ نماز پڑھی۔ کام کا لفظ ڈھونڈیں، پھر فیصلے سے پہلے اس کے آس پاس پڑھیں۔",
    focuses: [
      { title: "Eating and Drinking", titleAr: "أَكَلَ وَشَرِبَ", grammarTerm: "فعل ماض", reveal: "Action, doer, object: أَكَلَ الْوَلَدُ الْخُبْزَ. Yusuf 12:17 فَأَكَلَهُ الذِّئْبُ is the brothers' claim; 2:249 شَرِبَ after مَن means whoever drinks.", hookQuestion: "Who ate, according to the brothers in Yusuf 12:17?" },
      { title: "Reading and Writing", titleAr: "قَرَأَ وَكَتَبَ", grammarTerm: "فعل ماض", reveal: "قَرَأَ reports, اِقْرَأْ instructs; in Al-Mujadilah 58:21 كَتَبَ اللَّهُ means Allah has decreed.", hookQuestion: "What does كَتَبَ mean in كَتَبَ اللَّهُ?" },
      { title: "Standing, and an Action Sentence", titleAr: "قَامَ", grammarTerm: "الفعل والفاعل", reveal: "قَامَ is complete with its doer: قَامَ عَبْدُ اللَّهِ (Al-Jinn 72:19).", hookQuestion: "Who stood up in Al-Jinn 72:19?" },
      { title: "Prayer and Movement", titleAr: "صَلَّى وَذَهَبَ", grammarTerm: "النفي بلا", reveal: "صَلَّى / صَلَّتْ as a pair; ذَهَبَ with an optional destination; وَلَا صَلَّىٰ (75:31) is a denial.", hookQuestion: "Did the man in Al-Qiyamah 75:31 pray?" },
      { title: "Hearing, and Who Did What", titleAr: "سَمِعَ", grammarTerm: "الفعل والفاعل والمفعول", reveal: "Order tells the roles: سَمِعَ اللَّهُ قَوْلَ (Al-Mujadilah 58:1), action, doer, what was heard.", hookQuestion: "Who heard, and what was heard, in Al-Mujadilah 58:1?" },
    ],
  },

  // ── Ch18 ── Reading Connected Descriptions ──────────────────────────────
  // Docs/proposals/chapter-18-content-proposal.md (2026-09-23): follow الَّذِي
  // across An-Nas 114:4–5; definite noun + الَّذِي / الَّتِي versus an indefinite
  // noun with its description directly; adjective versus description; الَّتِي on
  // its own in Al-Mujadilah 58:1; the three parts of a long sentence. Authored
  // examples use past verbs and place phrases (present tense is not yet taught).
  // الَّذِي is an اسم موصول, not a مضاف إليه.
  {
    order: 18,
    // The former reader_lecture_18 / reader_lecture_book2_lesson7 / tadabbur_an_nas
    // files never existed in the repository; the approved proposal is the
    // content specification.
    sourceFile: "Docs/proposals/chapter-18-content-proposal.md",
    title: "Reading Connected Descriptions: الَّذِي / الَّتِي in Context",
    titleUr: "جڑی ہوئی وضاحتیں: الَّذِي / الَّتِي سیاق میں",
    titleAr: "الْوَصْفُ بِالَّذِي وَالَّتِي",
    description: "Following الَّذِي across An-Nas 114:4–5, choosing الَّذِي / الَّتِي after a definite noun, telling a description from an adjective and from a full sentence, and reading الَّتِي on its own.",
    descriptionUr: "سورۃ الناس 114:4–5 میں الَّذِي کا مرجع ڈھونڈنا، معرفہ اسم کے بعد الَّذِي / الَّتِي چننا، وضاحت کو صفت اور مکمل جملے سے الگ کرنا، اور الَّتِي کو اکیلا پڑھنا۔",
    hook: { ayahAr: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", ayahRef: "An-Nas 114:5", highlightedWord: "الَّذِي" },
    examples: [
      card("الرَّجُلُ الَّذِي ذَهَبَ إِلَى الْمَسْجِدِ", "the man who went to the mosque", "ar-rajulu lladhī dhahaba ilā l-masjidi"),
      card("رَجُلٌ ذَهَبَ إِلَى الْمَسْجِدِ", "a man who went to the mosque", "rajulun dhahaba ilā l-masjidi"),
      card("الْمَسْجِدُ الَّذِي فِي الْقَرْيَةِ", "the mosque that is in the village", "al-masjidu lladhī fī l-qaryati"),
      card("الْكِتَابُ الَّذِي عَلَى الْمَكْتَبِ جَدِيدٌ", "The book that is on the desk is new.", "al-kitābu lladhī ʿalā l-maktabi jadīdun"),
    ],
    parseText: "الرَّجُلُ الَّذِي قَامَ أُسْتَاذٌ",
    parseTokens: [token("الرَّجُلُ", "مبتدأ", "the man"), token("الَّذِي", "اسم موصول", "who"), token("قَامَ", "فعل", "stood up"), token("أُسْتَاذٌ", "خبر", "a teacher")],
    conversation: ["مَنِ الرَّجُلُ الَّذِي قَامَ؟", "هُوَ الْأُسْتَاذُ"],
    conversationDistractor: "قَامَ الرَّجُلُ",
    distractor: "a man who went to the mosque",
    blankDistractor: "الَّتِي",
    noorTip: "الَّذِي at the start of An-Nas 114:5 carries on the description of الْوَسْوَاسِ from 114:4: look back one ayah to find who it describes.",
    noorTipUr: "سورۃ الناس 114:5 کے شروع کا الَّذِي، 114:4 کے الْوَسْوَاسِ کی وضاحت آگے بڑھاتا ہے: یہ جاننے کے لیے کہ یہ کس کی وضاحت ہے ایک آیت پیچھے دیکھیں۔",
    focuses: [
      { title: "Who Does الَّذِي Describe?", titleAr: "الَّذِي فِي سُورَةِ النَّاسِ", grammarTerm: "اسم موصول", reveal: "الَّذِي in 114:5 describes الْوَسْوَاسِ in 114:4: noun, adjective الْخَنَّاسِ, relative word, action يُوَسْوِسُ.", hookQuestion: "Who does الَّذِي describe in An-Nas 114:5?" },
      { title: "The Noun or a Noun?", titleAr: "الْمَعْرِفَةُ وَالنَّكِرَةُ قَبْلَ الْوَصْفِ", grammarTerm: "صلة الموصول", reveal: "الرَّجُلُ الَّذِي ذَهَبَ, but رَجُلٌ ذَهَبَ: a definite noun takes الَّذِي, an indefinite one its description directly.", hookQuestion: "Why does الْوَسْوَاسِ take الَّذِي?" },
      { title: "Adjective or Clause?", titleAr: "صِفَةٌ أَمْ صِلَةٌ؟", grammarTerm: "النعت وصلة الموصول", reveal: "الْمَسْجِدُ الْكَبِيرُ is one quality; الْمَسْجِدُ الَّذِي فِي الْقَرْيَةِ is a description; a new pen is قَلَمٌ جَدِيدٌ.", hookQuestion: "What does الْخَنَّاسِ add, and what does الَّذِي يُوَسْوِسُ add?" },
      { title: "The Feminine Relative in Context", titleAr: "الَّتِي فِي السِّيَاقِ", grammarTerm: "اسم موصول مؤنث", reveal: "الَّتِي after a feminine thing, and on its own for the woman who: قَوْلَ الَّتِي تُجَادِلُكَ (58:1).", hookQuestion: "Who is الَّتِي in Al-Mujadilah 58:1?" },
      { title: "Read the Whole Sentence", titleAr: "الْجُمْلَةُ كُلُّهَا", grammarTerm: "المبتدأ والصلة والخبر", reveal: "Described noun, description, news: الْكِتَابُ الَّذِي عَلَى الْمَكْتَبِ جَدِيدٌ.", hookQuestion: "Which part of the sentence tells you which book?" },
    ],
  },

  // ── Ch19 ── Attached Pronouns in Context ────────────────────────────────
  // Docs/proposals/chapter-19-content-proposal.md (2026-09-23): final kasra
  // versus ـِي (Al-Fatiha 1:2, Al-Falaq 113:1, Yusuf 12:100); ـهُ on a noun versus
  // an action (Al-Baqarah 2:87); ة → ت transferred to new nouns (Hud 11:71);
  // the owner in a sentence (Maryam 19:16); لِي versus ـِي and the omitted
  // possessive ي of دِينِ (Al-Kafirun 109:6). Plural endings wait for Chapter 20.
  {
    order: 19,
    // The former reader_lecture_19 files never existed in the repository; the
    // approved proposal is the content specification.
    sourceFile: "Docs/proposals/chapter-19-content-proposal.md",
    title: "Attached Pronouns in Context: Reading Possession Accurately",
    titleUr: "سیاق میں جڑی ہوئی ضمیریں: ملکیت درست پڑھنا",
    titleAr: "الضَّمَائِرُ الْمُتَّصِلَةُ فِي السِّيَاقِ",
    description: "Is that kasra my? What is the ending attached to, and whose is it? Reading singular attached pronouns accurately in sentences and in the Quran.",
    descriptionUr: "کیا یہ زیر 'میرا' ہے؟ آخر کس سے جڑا ہے، اور کس کی چیز ہے؟ جملوں اور قرآن میں واحد جڑی ہوئی ضمیریں درست پڑھنا۔",
    hook: { ayahAr: "إِنَّ رَبِّي لَطِيفٌ لِّمَا يَشَاءُ", ayahRef: "Yusuf 12:100", highlightedWord: "رَبِّي" },
    examples: [
      card("رَبِّي", "my Lord", "rabbī"),
      card("كِتَابُهَا عَلَى الْمَكْتَبِ", "Her book is on the desk.", "kitābuhā ʿalā l-maktabi"),
      card("قَرْيَتُهُ كَبِيرَةٌ", "His village is big.", "qaryatuhu kabīratun"),
      card("سَمِعَهُ الطَّالِبُ", "The student heard him.", "samiʿahu ṭ-ṭālibu"),
    ],
    parseText: "كِتَابُهَا جَدِيدٌ",
    parseTokens: [token("كِتَابُهَا", "مبتدأ", "her book"), token("جَدِيدٌ", "خبر", "new")],
    conversation: ["أَيْنَ قَلَمُكِ يَا فَاطِمَةُ؟", "قَلَمِي عَلَى الْمَكْتَبِ"],
    conversationDistractor: "قَلَمُكِ عَلَى الْمَكْتَبِ",
    distractor: "Lord of the worlds",
    blankDistractor: "قَرْيَتُهَا",
    noorTip: "رَبِّ الْعَالَمِينَ and بِرَبِّ الْفَلَقِ end in a kasra but mean Lord of; رَبِّي, with its written ي, is my Lord. Check for the ي before you read my.",
    noorTipUr: "رَبِّ الْعَالَمِينَ اور بِرَبِّ الْفَلَقِ زیر پر ختم ہوتے ہیں لیکن ان کا مطلب … کا رب ہے؛ لکھی ہوئی ي کے ساتھ رَبِّي کا مطلب میرا رب ہے۔ 'میرا' پڑھنے سے پہلے ي دیکھیں۔",
    focuses: [
      { title: "Kasra or “My”?", titleAr: "كَسْرَةٌ أَمْ يَاءُ الْمُتَكَلِّمِ؟", grammarTerm: "ياء المتكلم", reveal: "رَبِّي is my Lord; رَبِّ الْعَالَمِينَ (1:2) and بِرَبِّ الْفَلَقِ (113:1) are Lord of.", hookQuestion: "Which form actually means my Lord?" },
      { title: "Same Shape, Different Attachment", titleAr: "شَكْلٌ وَاحِدٌ وَمَوْضِعَانِ", grammarTerm: "ضمير متصل", reveal: "بَعْدِهِ, after him; وَأَيَّدْنَاهُ, We supported him (2:87): his on a noun, him on an action.", hookQuestion: "What is ـهُ attached to in وَأَيَّدْنَاهُ?" },
      { title: "A Familiar Change in a New Word", titleAr: "التَّاءُ قَبْلَ الضَّمِيرِ", grammarTerm: "التاء المربوطة", reveal: "ة opens into ت before an ending: قَرْيَتُهُ, وَامْرَأَتُهُ (Hud 11:71).", hookQuestion: "Why is there a ت in وَامْرَأَتُهُ?" },
      { title: "Who Owns What in a Sentence?", titleAr: "لِمَنْ هٰذَا؟", grammarTerm: "مرجع الضمير", reveal: "The ending gives the person, the sentence gives the name: مِنْ أَهْلِهَا, Maryam's family (19:16).", hookQuestion: "Whose family is أَهْلِهَا in Maryam 19:16?" },
      { title: "Possession in Quranic Context", titleAr: "الْمِلْكِيَّةُ فِي السِّيَاقِ الْقُرْآنِيِّ", grammarTerm: "حذف ياء المتكلم", reveal: "لِي كِتَابٌ versus كِتَابِي; وَلِيَ دِينِ (109:6) means my religion with the ي unwritten.", hookQuestion: "Why does دِينِ mean my religion in Al-Kafirun 109:6?" },
    ],
  },

  // ── Ch20 ── Plural Attached Pronouns ────────────────────────────────────
  // Docs/proposals/chapter-20-content-proposal.md (2026-09-24): five noun-attached
  // plural endings, each introduced on its own — ـنَا (Ali 'Imran 3:193), ـكُمْ
  // (An-Nisa 4:1), ـهُمْ / ـهِمْ (Al-Baqarah 2:277), ـكُنَّ (Al-Ahzab 33:34), ـهُنَّ
  // (Al-Baqarah 2:233) — then an application lesson with the capped noun-versus-
  // action contrast رَبَّنَا / اهْدِنَا (Al-Fatiha 1:6), a review and a final test.
  {
    order: 20,
    // The former reader_lecture_20 file never existed in the repository; the
    // approved proposal is the content specification.
    sourceFile: "Docs/proposals/chapter-20-content-proposal.md",
    title: "Plural Attached Pronouns: Our, Your and Their",
    titleUr: "جمع کی جڑی ہوئی ضمیریں: ہمارا، تمہارا اور ان کا",
    titleAr: "ضَمَائِرُ الْجَمْعِ الْمُتَّصِلَةُ",
    description: "Our, your for a group, and their: five plural endings on nouns. Who owns it, and is that group spoken to or spoken about?",
    descriptionUr: "ہمارا، گروہ سے تمہارا، اور ان کا: اسم پر جمع کے پانچ آخر۔ مالک کون ہے، اور اس گروہ سے بات ہو رہی ہے یا اس کے بارے میں؟",
    hook: { ayahAr: "رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا", ayahRef: "Ali 'Imran 3:193", highlightedWord: "ذُنُوبَنَا" },
    examples: [
      card("كِتَابُنَا عَلَى الْمَكْتَبِ", "Our book is on the desk.", "kitābunā ʿalā l-maktabi"),
      card("بَيْتُكُمْ كَبِيرٌ", "Your house is big. (to a group)", "baytukum kabīrun"),
      card("الطُّلَّابُ فِي الْفَصْلِ، وَكُتُبُهُمْ عَلَى الْمَكْتَبِ", "The students are in the classroom, and their books are on the desk.", "aṭ-ṭullābu fī l-faṣli, wa kutubuhum ʿalā l-maktabi"),
      card("الطَّالِبَاتُ فِي الْمَدْرَسَةِ، وَكُتُبُهُنَّ جَدِيدَةٌ", "The female students are at school, and their books are new.", "aṭ-ṭālibātu fī l-madrasati, wa kutubuhunna jadīdatun"),
    ],
    parseText: "كِتَابُنَا جَدِيدٌ",
    parseTokens: [token("كِتَابُنَا", "مبتدأ", "our book"), token("جَدِيدٌ", "خبر", "new")],
    conversation: ["أَيْنَ كِتَابُكُمْ؟", "كِتَابُنَا عَلَى الْمَكْتَبِ"],
    conversationDistractor: "كِتَابُكُمْ عَلَى الْمَكْتَبِ",
    distractor: "Your house is big. (to one man)",
    blankDistractor: "كِتَابُكُنَّ",
    noorTip: "رَبَّنَا is our Lord, but اهْدِنَا is guide us: before you read ـنَا as our, check that it sits on a noun.",
    noorTipUr: "رَبَّنَا کا مطلب ہمارا رب ہے، لیکن اهْدِنَا کا مطلب ہمیں ہدایت دے: ـنَا کو 'ہمارا' پڑھنے سے پہلے دیکھیں کہ وہ اسم پر ہے۔",
    focuses: [
      { title: "Our: ـنَا on a Noun", titleAr: "رَبَّنَا وَذُنُوبَنَا", grammarTerm: "ضمير المتكلمين", reveal: "ذُنُوبَنَا, our sins (3:193): the believers who are speaking own them.", hookQuestion: "Whose sins are ذُنُوبَنَا?" },
      { title: "Your, to a Group: ـكُمْ", titleAr: "رَبَّكُمُ", grammarTerm: "ضمير المخاطبين", reveal: "رَبَّكُمُ, your Lord (4:1), said to all people; خَلَقَكُم, created you, is the same ending on an action.", hookQuestion: "Who is being spoken to in رَبَّكُمُ?" },
      { title: "Their: ـهُمْ", titleAr: "أَجْرُهُمْ عِنْدَ رَبِّهِمْ", grammarTerm: "ضمير الغائبين", reveal: "أَجْرُهُمْ and رَبِّهِمْ (2:277): the believers spoken about; ـهُمْ is heard ـهِمْ after a kasra.", hookQuestion: "Why is رَبِّهِمْ read with -him?" },
      { title: "Your, to a Group of Women: ـكُنَّ", titleAr: "بُيُوتُكُنَّ", grammarTerm: "ضمير المخاطبات", reveal: "بُيُوتِكُنَّ, your houses (33:34), said to a group of women.", hookQuestion: "Who decides the ending of بُيُوتِكُنَّ: the houses or the listeners?" },
      { title: "Their, a Group of Women: ـهُنَّ", titleAr: "رِزْقُهُنَّ وَكِسْوَتُهُنَّ", grammarTerm: "ضمير الغائبات", reveal: "رِزْقُهُنَّ وَكِسْوَتُهُنَّ (2:233): the mothers' provision and clothing.", hookQuestion: "Whose provision is رِزْقُهُنَّ?" },
      { title: "Who Belongs to Whom?", titleAr: "الِاسْمُ وَصَاحِبُهُ", grammarTerm: "الاسم والفعل", reveal: "رَبَّنَا, our Lord, but اهْدِنَا, guide us (1:6): the same ending on a noun and on an action.", hookQuestion: "Does ـنَا mean our in اهْدِنَا?" },
    ],
  },

  // ── Ch21 ── Places and Movement: Journeys and Landmarks ──────────────────
  // Docs/proposals/chapter-21-content-proposal.md (2026-09-24): the journey from
  // مِنْ to إِلَى (Al-Isra 17:1), went / left / entered / returned (Ta-Ha 20:86),
  // بَيْنَ … وَ … (Al-Baqarah 2:164), entering and leaving in Al-Qasas 28:15 and
  // 28:21, then CL8 Finding Someone, a review and a final test.
  {
    order: 21,
    // The former reader_lecture_21 files never existed in the repository; the
    // approved proposal is the content specification.
    sourceFile: "Docs/proposals/chapter-21-content-proposal.md",
    title: "Places and Movement: Journeys and Landmarks",
    titleUr: "جگہیں اور حرکت: سفر اور نشانیاں",
    titleAr: "الْأَمَاكِنُ وَالْحَرَكَةُ",
    description: "From where, to where, and where exactly: follow a short journey, tell went, left, entered and returned apart, and find a place between two landmarks.",
    descriptionUr: "کہاں سے، کہاں تک، اور ٹھیک کہاں: ایک مختصر سفر سمجھیں، گیا، نکلا، داخل ہوا اور واپس آیا کو الگ پہچانیں، اور دو نشانیوں کے درمیان جگہ ڈھونڈیں۔",
    hook: { ayahAr: "مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى", ayahRef: "Al-Isra 17:1", highlightedWord: "مِّنَ" },
    examples: [
      card("خَرَجَ أَحْمَدُ مِنَ الْبَيْتِ وَذَهَبَ إِلَى الْمَسْجِدِ", "Ahmad left the house and went to the mosque.", "kharaja aḥmadu mina l-bayti wa dhahaba ilā l-masjidi"),
      card("دَخَلَ الطَّالِبُ الْفَصْلَ", "The student entered the classroom.", "dakhala ṭ-ṭālibu l-faṣla"),
      card("رَجَعَتْ فَاطِمَةُ إِلَى الْبَيْتِ", "Fatimah returned to the house.", "rajaʿat fāṭimatu ilā l-bayti"),
      card("الْمَسْجِدُ بَيْنَ الْمَدْرَسَةِ وَالسُّوقِ", "The mosque is between the school and the market.", "al-masjidu bayna l-madrasati wa s-sūqi"),
    ],
    parseText: "دَخَلَ الطَّالِبُ الْفَصْلَ",
    parseTokens: [token("دَخَلَ", "فعل", "entered"), token("الطَّالِبُ", "فاعل", "the student"), token("الْفَصْلَ", "مفعول", "the classroom")],
    conversation: ["أَيْنَ أَحْمَدُ؟", "خَرَجَ مِنَ الْمَدْرَسَةِ وَذَهَبَ إِلَى الْمَسْجِدِ"],
    conversationDistractor: "الْمَسْجِدُ خَلْفَ الْبَيْتِ",
    distractor: "Ahmad left the mosque and went to the house.",
    blankDistractor: "إِلَى",
    noorTip: "After مِنْ comes where a journey began, after إِلَى where it ended: مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى.",
    noorTipUr: "مِنْ کے بعد وہ جگہ آتی ہے جہاں سے سفر شروع ہوا، إِلَى کے بعد جہاں ختم ہوا: مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى۔",
    focuses: [
      { title: "The Journey: From Where, To Where?", titleAr: "مِنْ أَيْنَ وَإِلَى أَيْنَ؟", grammarTerm: "حرف جر", reveal: "مِّنَ … إِلَى … (17:1): the start and the end of the Night Journey.", hookQuestion: "Where did the Night Journey begin, and where did it end?" },
      { title: "Which Movement Happened?", titleAr: "ذَهَبَ، خَرَجَ، دَخَلَ، رَجَعَ", grammarTerm: "أفعال الحركة", reveal: "فَرَجَعَ مُوسَىٰ إِلَىٰ قَوْمِهِ (20:86): returned, not went.", hookQuestion: "Why does 20:86 say رَجَعَ and not ذَهَبَ?" },
      { title: "Find It by a Landmark", titleAr: "بَيْنَ … وَ …", grammarTerm: "ظرف مكان", reveal: "بَيْنَ السَّمَاءِ وَالْأَرْضِ (2:164): the clouds between the sky and the earth.", hookQuestion: "What sits between the sky and the earth in 2:164?" },
      { title: "Quran Reading: Entering and Leaving", titleAr: "دَخَلَ وَخَرَجَ فِي الْقُرْآنِ", grammarTerm: "فعل ماض", reveal: "وَدَخَلَ الْمَدِينَةَ (28:15), then فَخَرَجَ مِنْهَا (28:21): the same city.", hookQuestion: "What does ـهَا in مِنْهَا point to?" },
    ],
  },

  // ── Ch22 ── Dialogue: Who Said What? ─────────────────────────────────────
  // Docs/proposals/chapter-22-content-proposal.md (2026-09-24): the speaker after
  // قَالَ (Yusuf 12:36), سَأَلَ and questions reported with قَالَ (Al-Baqarah
  // 2:186, Ali 'Imran 3:37), أَجَابَ and a fitting answer, a full exchange
  // (Yusuf 12:90), then CL9 Ask, Answer, Confirm, a review and a final test.
  {
    order: 22,
    // The former reader_lecture_22 files never existed in the repository; the
    // approved proposal is the content specification.
    sourceFile: "Docs/proposals/chapter-22-content-proposal.md",
    title: "Dialogue: Who Said What?",
    titleUr: "مکالمہ: کس نے کیا کہا؟",
    titleAr: "الْحِوَارُ: مَنْ قَالَ مَاذَا؟",
    description: "Follow a short exchange: who spoke, what was said, who asked, which answer fits, and whether the listener understood.",
    descriptionUr: "ایک مختصر گفتگو سمجھیں: کون بولا، کیا کہا گیا، کس نے پوچھا، کون سا جواب مناسب ہے، اور کیا سننے والے کو سمجھ آیا۔",
    hook: { ayahAr: "وَدَخَلَ مَعَهُ السِّجْنَ فَتَيَانِ قَالَ أَحَدُهُمَا", ayahRef: "Yusuf 12:36", highlightedWord: "قَالَ" },
    examples: [
      card("قَالَ الْأُسْتَاذُ: الْكِتَابُ جَدِيدٌ", "The teacher said, “The book is new.”", "qāla l-ustādhu: al-kitābu jadīdun"),
      card("سَأَلَ الطَّالِبُ: أَيْنَ الْكِتَابُ؟", "The student asked, “Where is the book?”", "saʾala ṭ-ṭālibu: ayna l-kitābu?"),
      card("أَجَابَ أَحْمَدُ: الْكِتَابُ عَلَى الْمَكْتَبِ", "Ahmad answered, “The book is on the desk.”", "ajāba aḥmadu: al-kitābu ʿalā l-maktabi"),
      card("هَلْ فَهِمْتَ الدَّرْسَ؟ نَعَمْ، فَهِمْتُ الدَّرْسَ", "Did you understand the lesson? Yes, I understood the lesson.", "hal fahimta d-darsa? naʿam, fahimtu d-darsa"),
    ],
    parseText: "قَالَ الْأُسْتَاذُ: الْكِتَابُ جَدِيدٌ",
    parseTokens: [token("قَالَ", "فعل", "said"), token("الْأُسْتَاذُ", "فاعل", "the teacher"), token("الْكِتَابُ", "مبتدأ", "the book"), token("جَدِيدٌ", "خبر", "new")],
    conversation: ["هَلْ فَهِمْتَ الدَّرْسَ؟", "نَعَمْ، فَهِمْتُ الدَّرْسَ"],
    conversationDistractor: "نَعَمْ، فَهِمْتَ الدَّرْسَ",
    distractor: "Ahmad asked, “Where is the book?”",
    blankDistractor: "سَأَلَ",
    noorTip: "قَالَ can report a question too: قَالَ يَا مَرْيَمُ أَنَّىٰ لَكِ هَٰذَا (3:37). Decide from the words, not from the verb.",
    noorTipUr: "قَالَ سوال بھی بیان کر سکتا ہے: قَالَ يَا مَرْيَمُ أَنَّىٰ لَكِ هَٰذَا (3:37)۔ فیصلہ الفاظ سے کریں، فعل سے نہیں۔",
    focuses: [
      { title: "Who Said What?", titleAr: "مَنْ قَالَ؟", grammarTerm: "فعل القول", reveal: "قَالَ أَحَدُهُمَا (12:36): one of the two young men is the speaker, not Yusuf.", hookQuestion: "Who speaks in قَالَ أَحَدُهُمَا?" },
      { title: "Who Asked, and What?", titleAr: "مَنْ سَأَلَ؟", grammarTerm: "الاستفهام", reveal: "وَإِذَا سَأَلَكَ عِبَادِي (2:186): My servants ask; a question can also be reported with قَالَ (3:37).", hookQuestion: "Who is asking in 2:186?" },
      { title: "An Answer That Fits", titleAr: "الْجَوَابُ الْمُنَاسِبُ", grammarTerm: "الجواب", reveal: "قَالَتْ هُوَ مِنْ عِندِ اللَّهِ (3:37): 'from where?' answered 'from Allah'.", hookQuestion: "How does Maryam's answer fit Zakariyya's question?" },
      { title: "Follow the Full Exchange", titleAr: "الْحِوَارُ كُلُّهُ", grammarTerm: "الحوار", reveal: "قَالُوا … قَالَ أَنَا يُوسُفُ (12:90): a question and its answer.", hookQuestion: "Who asks and who answers in 12:90?" },
    ],
  },

  // ── Ch23 ── Book 2 Reading Consolidation ─────────────────────────────────
  // Docs/proposals/chapter-23-content-proposal.md (2026-09-24): pointer, owner,
  // question and answer (Ta-Ha 20:17–18); a relative and an owner in one
  // sentence (Al-Baqarah 2:21); a whole scene (Al-Qasas 28:21); separate real
  // excerpts (2:201, 113:1, 112:1); a mixed review and a 16-question test.
  {
    order: 23,
    // The former reader_lecture_23 / reader_lessons_11-13 files never existed in
    // the repository; the approved proposal is the content specification.
    sourceFile: "Docs/proposals/chapter-23-content-proposal.md",
    title: "Book 2 Reading Consolidation",
    titleUr: "کتاب 2: پڑھنے کی مشق یکجا",
    titleAr: "مُرَاجَعَةُ الْقِرَاءَةِ فِي الْكِتَابِ الثَّانِي",
    description: "Put Book 2 together: read connected Arabic for who is pointed at, who owns what, who is described, where people go and who said what.",
    descriptionUr: "کتاب 2 کو یکجا کریں: جڑی ہوئی عربی میں پڑھیں کہ کس کی طرف اشارہ ہے، کس کی کیا چیز ہے، کس کا وصف ہے، لوگ کہاں جاتے ہیں اور کس نے کیا کہا۔",
    hook: { ayahAr: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً", ayahRef: "Al-Baqarah 2:201", highlightedWord: "رَبَّنَا" },
    examples: [
      card("هٰذَا كِتَابُ الطَّالِبِ", "This is the student's book.", "hādhā kitābu ṭ-ṭālibi"),
      card("الطَّالِبُ الَّذِي ذَهَبَ إِلَى الْمَسْجِدِ أَخِي", "The student who went to the mosque is my brother.", "aṭ-ṭālibu lladhī dhahaba ilā l-masjidi akhī"),
      card("وَبَعْدَ الصَّلَاةِ رَجَعَ أَحْمَدُ إِلَى بَيْتِهِ", "And after the prayer Ahmad returned to his house.", "wa baʿda ṣ-ṣalāti rajaʿa aḥmadu ilā baytihi"),
      card("رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً", "Our Lord, give us good in this world.", "rabbanā ātinā fī d-dunyā ḥasanatan"),
    ],
    parseText: "هٰذَا كِتَابُ الطَّالِبِ",
    parseTokens: [token("هٰذَا", "مبتدأ", "this"), token("كِتَابُ", "خبر", "the book of"), token("الطَّالِبِ", "مضاف إليه", "the student")],
    conversation: ["مَا هٰذَا؟", "هٰذَا كِتَابِي"],
    conversationDistractor: "كِتَابِي عَلَى الْمَكْتَبِ",
    distractor: "This book",
    blankDistractor: "الَّتِي",
    noorTip: "رَبَّنَا آتِنَا: our Lord, give us. The same ending, two jobs — read each ayah for what it really shows.",
    noorTipUr: "رَبَّنَا آتِنَا: اے ہمارے رب، ہمیں دے۔ ایک ہی آخر، دو کام — ہر آیت کو اسی کے لیے پڑھیں جو وہ واقعی دکھاتی ہے۔",
    focuses: [
      { title: "Pointing, Owning and Asking", titleAr: "مَا تِلْكَ بِيَمِينِكَ؟", grammarTerm: "اسم الإشارة والإضافة", reveal: "مَا تِلْكَ بِيَمِينِكَ … هِيَ عَصَايَ (20:17–18): pointer, question, owner endings and a separate pronoun.", hookQuestion: "Whose staff is عَصَايَ?" },
      { title: "Who Is Described, and Whose Is It?", titleAr: "الْمَوْصُولُ وَالضَّمِيرُ", grammarTerm: "الاسم الموصول", reveal: "رَبَّكُمُ الَّذِي خَلَقَكُمْ (2:21): الَّذِي describes your Lord.", hookQuestion: "Who does الَّذِي describe in 2:21?" },
      { title: "Read the Small Scene", titleAr: "قِرَاءَةُ الْمَشْهَدِ", grammarTerm: "نص متكامل", reveal: "فَخَرَجَ مِنْهَا … قَالَ (28:21): a movement, then speech.", hookQuestion: "What happens first in 28:21, and what next?" },
      { title: "Quran Reading Across Real Ayat", titleAr: "قِرَاءَةُ الْآيَاتِ", grammarTerm: "قراءة الآيات", reveal: "رَبَّنَا آتِنَا (2:201): our on a noun, us on a request.", hookQuestion: "Do رَبَّنَا and آتِنَا mean the same thing?" },
    ],
  },

  // ── Ch24 ── إِنَّ and إِنَّا: Emphasis in Quranic Sentences ──────────────────
  // Docs/proposals/chapter-24-content-proposal.md (2026-09-24): what إِنَّ adds;
  // اسم إنّ منصوب / خبر إنّ مرفوع (the closing words of 2:173); إِنَّا = إِنَّ + نَا
  // (43:3, with إِنَّنَا from 3:193 as recognition); transfer to new sentences;
  // guided reading of 108:1; a mixed review and a 12-question test. Numbers
  // moved out: Chapter 48 teaches them.
  {
    order: 24,
    // The former reader_lecture_24_inna_emphasis.md never existed in the
    // repository; the approved proposal is the content specification.
    sourceFile: "Docs/proposals/chapter-24-content-proposal.md",
    title: "إِنَّ and إِنَّا: Emphasis in Quranic Sentences",
    titleUr: "إِنَّ اور إِنَّا: قرآنی جملوں میں تاکید",
    titleAr: "إِنَّ وَإِنَّا فِي الْجُمَلِ الْقُرْآنِيَّةِ",
    description: "Read إِنَّ as emphasis, give its noun a fatḥa and keep its news with a ḍamma, and read إِنَّا, indeed We, in the Quran.",
    descriptionUr: "إِنَّ کو تاکید کے طور پر پڑھیں، اس کے اسم پر زبر اور خبر پر پیش پہچانیں، اور قرآن میں إِنَّا، بے شک ہم، پڑھیں۔",
    hook: { ayahAr: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", ayahRef: "Al-Kawthar 108:1", highlightedWord: "إِنَّا" },
    examples: [
      card("الْبَيْتُ كَبِيرٌ", "The house is big.", "al-baytu kabīrun"),
      card("إِنَّ الْبَيْتَ كَبِيرٌ", "Indeed, the house is big.", "inna l-bayta kabīrun"),
      card("إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ", "Indeed, Allah is Forgiving and Merciful. (2:173, closing words)", "inna llāha ghafūrun raḥīmun"),
      card("إِنَّا جَعَلْنَاهُ قُرْآنًا عَرَبِيًّا", "Indeed, We have made it an Arabic Quran. (43:3, excerpt)", "innā jaʿalnāhu qurʾānan ʿarabiyyan"),
    ],
    parseText: "إِنَّ اللَّهَ غَفُورٌ",
    parseTokens: [token("إِنَّ", "حرف توكيد ونصب", "indeed"), token("اللَّهَ", "اسم إنّ منصوب", "Allah"), token("غَفُورٌ", "خبر إنّ مرفوع", "Forgiving")],
    conversation: ["هَلِ الْمَسْجِدُ بَعِيدٌ؟", "لَا، إِنَّ الْمَسْجِدَ قَرِيبٌ"],
    conversationDistractor: "نَعَمْ، الْكِتَابُ جَدِيدٌ",
    distractor: "Is the mosque far?",
    blankDistractor: "هَلْ",
    noorTip: "إِنَّ adds emphasis to a statement. Its noun takes a fatḥa; its news keeps its ḍamma.",
    noorTipUr: "إِنَّ جملے پر زور دیتا ہے۔ اس کا اسم زبر لیتا ہے؛ اس کی خبر پیش پر رہتی ہے۔",
    focuses: [
      { title: "What Does إِنَّ Add?", titleAr: "إِنَّ لِلتَّوْكِيدِ", grammarTerm: "حرف توكيد", reveal: "إِنَّ adds emphasis to a statement; the claim itself does not change.", hookQuestion: "What changes when إِنَّ opens a statement?" },
      { title: "The Noun and the News", titleAr: "اسْمُ إِنَّ وَخَبَرُهَا", grammarTerm: "اسم إنّ منصوب، خبر إنّ مرفوع", reveal: "إِنَّ اللَّهَ غَفُورٌ (2:173): the noun takes a fatḥa, the news keeps its ḍamma.", hookQuestion: "Why does اللَّهَ carry a fatḥa after إِنَّ?" },
      { title: "إِنَّا — Indeed We", titleAr: "إِنَّا = إِنَّ + نَا", grammarTerm: "اسم إنّ ضمير متصل", reveal: "إِنَّا جَعَلْنَاهُ (43:3): ـنَا on إِنَّ, then ـنَا on the action.", hookQuestion: "What is ـنَا attached to in إِنَّا?" },
      { title: "Apply إِنَّ", titleAr: "إِنَّ فِي جُمَلٍ جَدِيدَةٍ", grammarTerm: "تطبيق", reveal: "You used the rule in sentences you had not seen.", hookQuestion: "Which word takes the fatḥa in إِنَّ الْمَدْرَسَةَ بَعِيدَةٌ?" },
      { title: "Reading Al-Kawthar 108:1", titleAr: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", grammarTerm: "قراءة قرآنية", reveal: "إِنَّا … أَعْطَيْنَاكَ: the same ـنَا on two hosts; We give, you receive.", hookQuestion: "Who gives and who receives in 108:1?" },
    ],
  },

  // ── Ch25 ── لَيْسَ: Negating Nominal Sentences ────────────────────────────
  {
    order: 25,
    sourceFile: "Docs/proposals/chapter-25-content-correction.md",
    title: "لَيْسَ: Negating Nominal Sentences",
    titleAr: "لَيْسَ لِلنَّفْي",
    description: "Read لَيْسَ, لَيْسَتْ and لَيْسُوا in simple nominal statements, then contrast negation with the emphasis of إِنَّ.",
    hook: { ayahAr: "لَيْسَ كَمِثْلِهِ شَيْءٌ", ayahRef: "Ash-Shura 42:11", highlightedWord: "لَيْسَ" },
    examples: [
      card("الْكِتَابُ جَدِيدٌ", "The book is new", "al-kitābu jadīdun"),
      card("لَيْسَ الْكِتَابُ جَدِيدًا", "The book is not new", "laysa al-kitābu jadīdan"),
      card("الْمَدْرَسَةُ لَيْسَتْ بَعِيدَةً", "The school is not far", "al-madrasatu laysat baʿīdatan"),
      card("لَيْسُوا سَوَاءً", "They are not all alike (3:113, excerpt)", "laysū sawāʾan"),
    ],
    parseText: "لَيْسَ الْكِتَابُ جَدِيدًا",
    parseTokens: [token("لَيْسَ", "فعل ناقص", "is not"), token("الْكِتَابُ", "اسم ليس مرفوع", "the book"), token("جَدِيدًا", "خبر ليس منصوب", "new")],
    conversation: ["هَلِ الْكِتَابُ جَدِيدٌ؟", "لَا، الْكِتَابُ لَيْسَ جَدِيدًا"],
    conversationDistractor: "نَعَمْ، الْكِتَابُ جَدِيدٌ",
    distractor: "Yes, the book is new",
    blankDistractor: "إِنَّ",
    noorTip: "لَيْسَ is a verb, not a particle. In a simple noun-predicate sentence its noun is nominative and its predicate accusative; 42:11 has a more complex prepositional phrase.",
    noorTipUr: "لَيْسَ فعل ہے، حرف نہیں۔ سادہ اسمی جملے میں اس کا اسم مرفوع اور خبر منصوب ہے؛ 42:11 میں جار و مجرور والی پیچیدہ ساخت ہے۔",
    focuses: [
      { title: "What Does لَيْسَ Mean?", titleAr: "لَيْسَ لِلنَّفْيِ", grammarTerm: "فعل ناقص", reveal: "لَيْسَ turns a simple statement negative.", hookQuestion: "What changes when لَيْسَ enters a statement?" },
      { title: "The Noun and the News", titleAr: "اسْمُ لَيْسَ وَخَبَرُهَا", grammarTerm: "اسم ليس وخبرها", reveal: "The noun of لَيْسَ keeps a ḍamma; its news takes a fatḥa.", hookQuestion: "Which ending changes in لَيْسَ الْكِتَابُ جَدِيدًا?" },
      { title: "The Feminine Form", titleAr: "لَيْسَتْ", grammarTerm: "فعل ناقص مؤنث", reveal: "الْمَدْرَسَةُ لَيْسَتْ بَعِيدَةً keeps feminine agreement.", hookQuestion: "Why is the predicate بَعِيدَةً?" },
      { title: "The Plural Form", titleAr: "لَيْسُوا", grammarTerm: "فعل ناقص للجمع", reveal: "لَيْسُوا سَوَاءً (3:113) means they are not all alike; not every plural predicate ends in ـِينَ.", hookQuestion: "Does سَوَاءً end in ـِينَ?" },
      { title: "Emphasis or Negation?", titleAr: "إِنَّ أَمْ لَيْسَ؟", grammarTerm: "التوكيد والنفي", reveal: "إِنَّ adds emphasis; لَيْسَ negates. They have different noun/predicate case patterns.", hookQuestion: "Which word negates a statement?" },
    ],
  },

  // ── Ch26 ── Demonstratives and Possession Spiral ─────────────────────────
  {
    order: 26,
    sourceFile: "reader_lecture_26_demonstratives_possession_spiral.md",
    title: "Demonstratives and Possession Spiral",
    titleAr: "الإِشَارَة وَالإِضَافَة الْمُرَكَّبَة",
    description: "Three-word idafa chains and demonstratives combined with possession.",
    hook: { ayahAr: "ذٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ", ayahRef: "Al-Baqarah 2:2", highlightedWord: "ذٰلِكَ الْكِتَابُ" },
    examples: [
      card("كِتَابُ الطَّالِبِ الْجَدِيدِ مُفِيدٌ", "The student's new book is useful", "kitaabut-taalibil-jadeed mufeed"),
      card("بَابُ غُرْفَةِ الأُسْتَاذِ مَفْتُوحٌ", "The door of the teacher's room is open", "baabu ghurfatil-ustaadhi maftooh"),
      card("هٰذَا كِتَابُ الطَّالِبِ الْمُجْتَهِدِ", "This is the book of the diligent student", "haadha kitaabut-taalibil-mujtahid"),
      card("ذٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ", "That is the Book, no doubt in it", "dhaalika al-kitaabu laa rayba feeh"),
    ],
    parseText: "بَابُ غُرْفَةِ الأُسْتَاذِ مَفْتُوحٌ",
    parseTokens: [token("بَابُ", "مضاف", "door of"), token("غُرْفَةِ", "مضاف إليه", "room of"), token("الأُسْتَاذِ", "مضاف إليه", "the teacher"), token("مَفْتُوحٌ", "خبر", "open")],
    conversation: ["لِمَنْ هٰذَا الْكِتَابُ الْجَدِيدُ؟", "هٰذَا كِتَابُ الطَّالِبِ الْمُجْتَهِدِ"],
    conversationDistractor: "لَيْسَ هٰذَا كِتَابًا",
    distractor: "This is not a book",
    blankDistractor: "لَيْسَ",
    noorTip: "ذٰلِكَ الْكِتَابُ opens Al-Baqarah — a demonstrative pointing to the greatest of Books.",
    noorTipUr: "مضاف اور مضاف الیہ کی زنجیر قرآن میں بہت ملتی ہے — اسے پہچاننا ضروری ہے۔",
    focuses: [
      { title: "Three-Word Idafa", titleAr: "إِضَافَة ثُلَاثِيَّة", grammarTerm: "مركب إضافي مطوّل", reveal: "You chained two idafa constructions to express layered possession.", hookQuestion: "In بَابُ غُرْفَةِ الأُسْتَاذِ, who owns what?" },
      { title: "Demonstrative + Idafa", titleAr: "إِشَارَة مَع إِضَافَة", grammarTerm: "اسم إشارة مع مضاف", reveal: "You pointed at something using demonstrative plus a possession phrase.", hookQuestion: "What does هٰذَا refer to in the example sentence?" },
      { title: "Known vs Unknown", titleAr: "مَعْرِفَة وَنَكِرَة", grammarTerm: "التعريف والتنكير", reveal: "You controlled definiteness through ال to make descriptions agree.", hookQuestion: "Why does الْجَدِيدِ carry ال in كِتَابُ الطَّالِبِ الْجَدِيدِ?" },
      { title: "Describing the Chain", titleAr: "وَصْف الْمُضَاف إِلَيْهِ", grammarTerm: "النعت في الإضافة", reveal: "You added a descriptor to the last noun in the chain.", hookQuestion: "Which noun does الْمُجْتَهِدِ describe?" },
    ],
  },

  // ── Ch27 ── Prepositions in Depth ─────────────────────────────────────────
  {
    order: 27,
    sourceFile: "reader_lecture_27_prepositions_depth.md",
    title: "Prepositions in Depth",
    titleAr: "حُرُوف الْجَر تَفْصِيلًا",
    description: "All major prepositions — meanings, usage patterns, and Quranic examples.",
    hook: { ayahAr: "وَعَلَى اللَّهِ فَتَوَكَّلُوا", ayahRef: "Al-Ma'idah 5:11", highlightedWord: "عَلَى" },
    examples: [
      card("تَوَكَّلْتُ عَلَى اللَّهِ", "I placed my trust in Allah", "tawakkaltu alal-laah"),
      card("ذَهَبَ إِلَى الْمَسْجِدِ", "He went to the mosque", "dhahaba ilal-masjid"),
      card("خَرَجَ مِنَ الْبَيْتِ", "He left from the house", "kharaja minal-bayt"),
      card("الْكِتَابُ فِي الْحَقِيبَةِ بِيَدِهِ", "The book is in the bag in his hand", "al-kitaabu fil-haqeebati biyadih"),
    ],
    parseText: "تَوَكَّلْتُ عَلَى اللَّهِ",
    parseTokens: [token("تَوَكَّلْتُ", "فعل", "I trusted"), token("عَلَى", "حرف جر", "upon"), token("اللَّهِ", "مضاف إليه", "Allah")],
    conversation: ["عَلَى مَنْ تَتَوَكَّلُ؟", "أَتَوَكَّلُ عَلَى اللَّهِ"],
    conversationDistractor: "بَابُ غُرْفَةِ الأُسْتَاذِ مَفْتُوحٌ",
    distractor: "The teacher's room door is open",
    blankDistractor: "عَنْ",
    noorTip: "عَلَى اللَّهِ فَتَوَكَّلُوا — trust is built on a preposition pointing directly to Allah.",
    noorTipUr: "عَلَى اللہ توکل — ایک حرف جر سے پورا معنی بدل جاتا ہے۔",
    focuses: [
      { title: "On and Over (عَلَى)", titleAr: "عَلَى", grammarTerm: "حرف جر", reveal: "You used عَلَى for trust, sitting, and dominion — all senses of over.", hookQuestion: "Why is trust in Allah expressed with عَلَى and not فِي?" },
      { title: "To and Toward (إِلَى)", titleAr: "إِلَى", grammarTerm: "حرف جر", reveal: "You directed movement and attention with إِلَى.", hookQuestion: "What does إِلَى add to a verb of motion?" },
      { title: "From and Away (مِنْ)", titleAr: "مِنْ", grammarTerm: "حرف جر", reveal: "You expressed origin, separation, and partitive meaning with مِنْ.", hookQuestion: "How many meanings can مِنْ carry?" },
      { title: "In and With (فِي، بِـ)", titleAr: "فِي وَبِـ", grammarTerm: "حرف جر", reveal: "You contrasted containment (فِي) with instrumentality (بِـ).", hookQuestion: "What is the difference between فِي and بِـ?" },
    ],
  },

  // ── Ch28 ── Verb Usage and Action Vocabulary ──────────────────────────────
  {
    order: 28,
    sourceFile: "reader_lecture_28_verb_action_vocabulary.md",
    title: "Verb Usage and Action Vocabulary",
    titleAr: "الأَفْعَال الشَّائِعَة",
    description: "Common high-frequency past tense verbs in Quranic context.",
    hook: { ayahAr: "أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ", ayahRef: "An-Nisa 4:82", highlightedWord: "يَتَدَبَّرُونَ" },
    examples: [
      card("فَعَلَ مَا أُمِرَ بِهِ", "He did what he was commanded", "fa'ala maa umira bih"),
      card("جَاءَ الرَّسُولُ بِالْحَقِّ", "The messenger came with the truth", "jaa'ar-rasoolu bil-haqq"),
      card("رَأَى الصَّبِيُّ الْقَمَرَ", "The boy saw the moon", "ra'as-sabiyyu al-qamar"),
      card("عَرَفَ الطَّالِبُ جَوَابَ السُّؤَالِ", "The student knew the answer to the question", "arafa at-talibu jawaabas-su'aal"),
    ],
    parseText: "جَاءَ الرَّسُولُ بِالْحَقِّ",
    parseTokens: [token("جَاءَ", "فعل", "came"), token("الرَّسُولُ", "فاعل", "the messenger"), token("بِالْحَقِّ", "حرف جر", "with the truth")],
    conversation: ["مَاذَا رَأَى الصَّبِيُّ؟", "رَأَى الصَّبِيُّ الْقَمَرَ"],
    conversationDistractor: "تَوَكَّلْتُ عَلَى اللَّهِ",
    distractor: "I placed my trust in Allah",
    blankDistractor: "سَمِعَ",
    noorTip: "يَتَدَبَّرُونَ — do they not reflect? A present tense verb challenging us to act.",
    noorTipUr: "کیا وہ قرآن میں غور نہیں کرتے؟ يَتَدَبَّرُونَ فعل مضارع ہے۔",
    focuses: [
      { title: "He Did / He Made", titleAr: "فَعَلَ", grammarTerm: "فعل ماض", reveal: "You met the root ف-ع-ل which gives Arabic its verb template names.", hookQuestion: "Why do grammarians use فَعَلَ as the model verb?" },
      { title: "He Came", titleAr: "جَاءَ", grammarTerm: "فعل ماض أجوف", reveal: "You saw an alif in the middle of a verb, a sign of a hollow root.", hookQuestion: "What is unusual about the root of جَاءَ?" },
      { title: "He Saw", titleAr: "رَأَى", grammarTerm: "فعل ماض ناقص", reveal: "You recognised رَأَى as a verb ending in alif, a defective root.", hookQuestion: "What does the ى at the end of رَأَى indicate?" },
      { title: "He Knew", titleAr: "عَرَفَ", grammarTerm: "فعل ماض", reveal: "You used عَرَفَ for knowing through acquaintance, not abstract knowledge.", hookQuestion: "How is عَرَفَ different from عَلِمَ?" },
    ],
  },

  // ── Ch29 ── Nominal vs Verbal Sentences ───────────────────────────────────
  {
    order: 29,
    sourceFile: "reader_lecture_29_nominal_vs_verbal_sentences.md",
    title: "Nominal vs Verbal Sentences",
    titleAr: "الْجُمْلَة الِاسْمِيَّة وَالْفِعْلِيَّة",
    description: "Formal distinction between the two sentence types in Arabic.",
    hook: { ayahAr: "قُلْ يَا أَيُّهَا الْكَافِرُونَ", ayahRef: "Al-Kafirun 109:1", highlightedWord: "قُلْ" },
    examples: [
      card("الْمُؤْمِنُ يَذْكُرُ اللَّهَ كَثِيرًا", "The believer remembers Allah often (nominal)", "al-mu'minu yadhkuru allaaha katheeran"),
      card("يَذْكُرُ الْمُؤْمِنُ اللَّهَ كَثِيرًا", "The believer remembers Allah often (verbal)", "yadhkurul-mu'minu allaaha katheeran"),
      card("الطَّالِبُ نَجَحَ", "The student succeeded (nominal)", "at-talibu najaha"),
      card("نَجَحَ الطَّالِبُ", "The student succeeded (verbal)", "najaha at-talibu"),
    ],
    parseText: "نَجَحَ الطَّالِبُ",
    parseTokens: [token("نَجَحَ", "فعل", "succeeded"), token("الطَّالِبُ", "فاعل", "the student")],
    conversation: ["مَا نَوْعُ هٰذِهِ الْجُمْلَةِ؟", "هٰذِهِ جُمْلَةٌ فِعْلِيَّةٌ"],
    conversationDistractor: "رَأَى الصَّبِيُّ الْقَمَرَ",
    distractor: "The boy saw the moon",
    blankDistractor: "نَجَحَتْ",
    noorTip: "قُلْ opens Al-Kafirun — a verbal sentence commanding speech. Notice the difference.",
    noorTipUr: "جملہ اسمیہ اسم سے شروع ہوتا ہے، فعلیہ فعل سے — یہ بنیادی فرق یاد رکھیں۔",
    focuses: [
      { title: "The Nominal Sentence", titleAr: "الْجُمْلَة الِاسْمِيَّة", grammarTerm: "جملة اسمية", reveal: "You confirmed that a nominal sentence opens with a noun or pronoun.", hookQuestion: "Which word opens the nominal sentence in the first example?" },
      { title: "The Verbal Sentence", titleAr: "الْجُمْلَة الْفِعْلِيَّة", grammarTerm: "جملة فعلية", reveal: "You confirmed that a verbal sentence opens with a verb.", hookQuestion: "What is the first word in a verbal sentence?" },
      { title: "The Key Difference", titleAr: "الْفَرْق الأَسَاسِي", grammarTerm: "ترتيب الجملة", reveal: "You saw the same meaning expressed two ways — the opening word decides the type.", hookQuestion: "Can you take الطَّالِبُ نَجَحَ and make it a verbal sentence?" },
      { title: "From Al-Kafirun", titleAr: "قُلْ يَا أَيُّهَا", grammarTerm: "جملة أمرية", reveal: "You read a command sentence and understood it as a type of verbal sentence.", hookQuestion: "Is قُلْ a nominal or verbal sentence opener?" },
    ],
  },

  // ── Ch30 ── Reading Comprehension and Dialogue ────────────────────────────
  {
    order: 30,
    sourceFile: "reader_lecture_30_reading_comprehension.md",
    title: "Reading Comprehension and Dialogue",
    titleAr: "الْقِرَاءَة وَالْفَهْم",
    description: "Longer connected passages applying nominal and verbal sentence patterns.",
    hook: { ayahAr: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", ayahRef: "Ar-Rahman 55:13", highlightedWord: "آلَاءِ" },
    examples: [
      card("قَرَأَ الأُسْتَاذُ قِصَّةً وَفَهِمَ الطُّلَّابُ", "The teacher read a story and the students understood", "qara'al-ustaadhu qissatan wa fahimal-tullaab"),
      card("دَخَلَ الرَّجُلُ الْمَسْجِدَ وَصَلَّى رَكْعَتَيْنِ", "The man entered the mosque and prayed two raka'at", "dakhalr-rajulul-masjida wa sallaa rak'atain"),
      card("سَأَلَتِ الْبِنْتُ سُؤَالًا فَأَجَابَ الأُسْتَاذُ", "The girl asked a question so the teacher answered", "sa'alatil-bintu su'aalan fa-ajaabal-ustaadh"),
      card("فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", "So which of your Lord's favours will you two deny?", "fabiayyil-aalaa'i rabbikumaa tukadhdhiban"),
    ],
    parseText: "دَخَلَ الرَّجُلُ الْمَسْجِدَ",
    parseTokens: [token("دَخَلَ", "فعل", "entered"), token("الرَّجُلُ", "فاعل", "the man"), token("الْمَسْجِدَ", "مفعول", "the mosque")],
    conversation: ["مَاذَا فَعَلَ الرَّجُلُ؟", "دَخَلَ الرَّجُلُ الْمَسْجِدَ وَصَلَّى"],
    conversationDistractor: "الطَّالِبُ نَجَحَ",
    distractor: "The student succeeded",
    blankDistractor: "سَمِعَ",
    noorTip: "Ar-Rahman repeats آلَاءِ — favours — thirty-one times. Every repetition is a lesson in comprehension.",
    noorTipUr: "سورۃ الرحمن میں آلَاءِ کا بار بار ذکر سمجھ کی گہرائی بڑھاتا ہے۔",
    focuses: [
      { title: "Reading a Story", titleAr: "قِرَاءَة قِصَّة", grammarTerm: "نص سردي", reveal: "You followed a sequence of verbal sentences as a narrative.", hookQuestion: "How do you know the order of events in a story?" },
      { title: "Following the Verb", titleAr: "تَتَبُّع الْفِعْل", grammarTerm: "تتابع الأفعال", reveal: "You tracked multiple verbs linked by وَ and فَ.", hookQuestion: "What is the difference between وَ and فَ as connectors?" },
      { title: "Understanding the Flow", titleAr: "تَدَفُّق الْمَعْنَى", grammarTerm: "الترابط النصي", reveal: "You identified how sentences connect to form a coherent passage.", hookQuestion: "Which word in the third example shows consequence?" },
      { title: "Asking About a Passage", titleAr: "الأَسْئِلَة عَلَى النَّص", grammarTerm: "أسئلة الفهم", reveal: "You answered questions about a passage using what you heard.", hookQuestion: "What did the teacher do in the first example?" },
    ],
  },

  // ── Ch31 ── Questions: Full Interrogative Paradigm ─────────────────────────
  {
    order: 31,
    sourceFile: "reader_lecture_31_interrogatives.md",
    title: "Questions: The Full Interrogative Toolkit",
    titleAr: "أَدَوَات الِاسْتِفْهَام",
    description: "Complete set of question words — هَلْ، مَا، مَنْ، أَيْنَ، كَيْفَ، مَتَى.",
    hook: { ayahAr: "فَأَيْنَ تَذْهَبُونَ", ayahRef: "At-Takwir 81:26", highlightedWord: "أَيْنَ" },
    examples: [
      card("هَلْ قَرَأْتَ الْكِتَابَ؟", "Have you read the book?", "hal qara'tal-kitaab"),
      card("مَنْ جَاءَ إِلَى الْمَدْرَسَةِ؟", "Who came to the school?", "man jaa'a ilal-madrasa"),
      card("أَيْنَ تَذْهَبُ يَا مُحَمَّدُ؟", "Where are you going, O Muhammad?", "ayna tadhabu yaa muhammad"),
      card("كَيْفَ حَالُكَ؟", "How are you?", "kayfa haaluk"),
    ],
    parseText: "هَلْ قَرَأْتَ الْكِتَابَ؟",
    parseTokens: [token("هَلْ", "حرف جر", "did"), token("قَرَأْتَ", "فعل", "you read"), token("الْكِتَابَ", "مفعول", "the book")],
    conversation: ["مَتَى جَاءَ الأُسْتَاذُ؟", "جَاءَ الأُسْتَاذُ بَعْدَ الظُّهْرِ"],
    conversationDistractor: "دَخَلَ الرَّجُلُ الْمَسْجِدَ",
    distractor: "The man entered the mosque",
    blankDistractor: "لِمَاذَا",
    noorTip: "فَأَيْنَ تَذْهَبُونَ — where are you going? The Quran's question demands an honest answer.",
    noorTipUr: "سوالیہ الفاظ کو پہچاننا قرآن کو سمجھنے کی بنیاد ہے۔",
    focuses: [
      { title: "Yes/No Questions (هَلْ)", titleAr: "هَلْ", grammarTerm: "حرف استفهام", reveal: "You asked a closed question expecting yes or no.", hookQuestion: "What answer does هَلْ prepare you for?" },
      { title: "What and Who (مَا، مَن)", titleAr: "مَا وَمَنْ", grammarTerm: "اسم استفهام", reveal: "You distinguished between asking about things and people.", hookQuestion: "Why can't you use مَا to ask about a person?" },
      { title: "Where and When (أَيْنَ، مَتَى)", titleAr: "أَيْنَ وَمَتَى", grammarTerm: "ظرف استفهام", reveal: "You asked about place and time with dedicated question words.", hookQuestion: "What kind of answer does مَتَى demand?" },
      { title: "How (كَيْفَ)", titleAr: "كَيْفَ", grammarTerm: "حال استفهامية", reveal: "You asked about manner and condition — the most social question.", hookQuestion: "What does كَيْفَ حَالُكَ literally mean?" },
    ],
  },

  // ── Ch32 ── Applied Grammar and Sentence Analysis ─────────────────────────
  {
    order: 32,
    sourceFile: "reader_lecture_32_applied_grammar_idha.md",
    title: "Applied Grammar: إِذَا",
    titleAr: "إِذَا وَالْجُمْلَة الشَّرْطِيَّة",
    description: "Recognising conditional structure with إِذَا in sentences and Quranic passages.",
    hook: { ayahAr: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", ayahRef: "An-Nasr 110:1", highlightedWord: "إِذَا" },
    examples: [
      card("إِذَا جَاءَ الأُسْتَاذُ قُمْنَا", "When the teacher came, we stood up", "idhaa jaa'al-ustaadhu qumnaa"),
      card("إِذَا أَكَلْتَ فَاغْسِلْ يَدَيْكَ", "When you eat, wash your hands", "idhaa akalta faghsil yadayk"),
      card("إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", "When the help of Allah comes and the opening", "idhaa jaa'a nasrullaahi wal-fath"),
      card("إِذَا طَلَعَتِ الشَّمْسُ انْتَبَهَ الطُّلَّابُ", "When the sun rose, the students woke up", "idhaa tala'atis-shamsu intabahat-tullaab"),
    ],
    parseText: "إِذَا جَاءَ الأُسْتَاذُ قُمْنَا",
    parseTokens: [token("إِذَا", "حرف جر", "when"), token("جَاءَ", "فعل", "came"), token("الأُسْتَاذُ", "فاعل", "the teacher"), token("قُمْنَا", "فعل", "we stood")],
    conversation: ["مَاذَا يَحْدُثُ إِذَا جَاءَ الأُسْتَاذُ؟", "إِذَا جَاءَ الأُسْتَاذُ قُمْنَا"],
    conversationDistractor: "هَلْ قَرَأْتَ الْكِتَابَ؟",
    distractor: "Have you read the book?",
    blankDistractor: "لَوْ",
    noorTip: "An-Nasr begins with إِذَا — a conditional that marks the end of a mission and a command to reflect.",
    noorTipUr: "إِذَا شرط کا حرف ہے — جب کچھ ہو تو کچھ اور ہوتا ہے۔ سورۃ النصر اسی سے شروع ہوتی ہے۔",
    focuses: [
      { title: "When Something Happens (إِذَا)", titleAr: "إِذَا", grammarTerm: "أداة شرط", reveal: "You recognised إِذَا as the signal that a condition is coming.", hookQuestion: "What does إِذَا promise will come next?" },
      { title: "The Answer Clause", titleAr: "جَوَاب الشَّرْط", grammarTerm: "جواب الشرط", reveal: "You identified the second clause that answers the condition.", hookQuestion: "In إِذَا جَاءَ … قُمْنَا, which is the condition and which is the response?" },
      { title: "Parsing a Full Sentence", titleAr: "تَحْلِيل الْجُمْلَة", grammarTerm: "إعراب الجملة", reveal: "You broke a four-word conditional into its grammatical roles.", hookQuestion: "Name the role of each word in the first example." },
      { title: "From An-Nasr", titleAr: "إِذَا جَاءَ نَصْرُ اللَّهِ", grammarTerm: "شرط قرآني", reveal: "You read the opening of An-Nasr as grammar you now fully understand.", hookQuestion: "What is the conditional event in An-Nasr 110:1?" },
    ],
  },

  // ── Ch33 ── Book 3 Bridge ─────────────────────────────────────────────────
  {
    order: 33,
    sourceFile: "reader_lecture_33_book3_bridge.md",
    title: "Book 3 Bridge",
    titleAr: "جِسْر الْكِتَاب الثَّالِث",
    description: "Consolidation of Books 1–3 grammar as Book 4 verbs approach.",
    hook: { ayahAr: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ", ayahRef: "Adh-Dhariyat 51:56", highlightedWord: "لِيَعْبُدُونِ" },
    examples: [
      card("إِنَّ الإِنْسَانَ لَفِي خُسْرٍ", "Indeed mankind is in loss", "innal-insaana lafee khusr"),
      card("الَّذِي خَلَقَ الْجِنَّ وَالإِنسَ لِيَعْبُدُوهُ", "He who created jinn and mankind to worship Him", "alladhee khalaqal-jinna wal-insa liya'budooh"),
      card("رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا", "Our Lord, do not let our hearts deviate after You guided us", "rabbanaa laa tuzigh quloobana ba'da idh hadaytana"),
      card("لَيْسَ الصِّيَامُ مِنَ الطَّعَامِ فَقَطْ", "Fasting is not only about food", "laysas-siyaamu minet-ta'aam faqat"),
    ],
    parseText: "إِنَّ الإِنْسَانَ لَفِي خُسْرٍ",
    parseTokens: [token("إِنَّ", "حرف جر", "indeed"), token("الإِنْسَانَ", "مفعول", "mankind"), token("لَفِي", "حرف جر", "in"), token("خُسْرٍ", "مضاف إليه", "loss")],
    conversation: ["لِمَاذَا خَلَقَ اللَّهُ الإِنسَ وَالْجِنَّ؟", "خَلَقَهُمْ لِيَعْبُدُوهُ"],
    conversationDistractor: "إِذَا جَاءَ الأُسْتَاذُ قُمْنَا",
    distractor: "When the teacher came we stood up",
    blankDistractor: "لَعَلَّ",
    noorTip: "لِيَعْبُدُونِ — the purpose of all creation in two words. This is the summit of Book 3.",
    noorTipUr: "لِيَعْبُدُونِ — تخلیق کا مقصد۔ یہ لام تعلیل ہے جو مقصد بتاتا ہے۔",
    focuses: [
      { title: "The Full Nominal Sentence", titleAr: "الْجُمْلَة الِاسْمِيَّة الْكَامِلَة", grammarTerm: "جملة اسمية مكتملة", reveal: "You parsed a full nominal sentence with إِنَّ and لام التوكيد.", hookQuestion: "Name every grammatical element in إِنَّ الإِنْسَانَ لَفِي خُسْرٍ." },
      { title: "Verb + Object", titleAr: "فِعْل وَمَفْعُول", grammarTerm: "جملة فعلية متعدية", reveal: "You identified verb-object pairs across compound sentences.", hookQuestion: "What is the object of خَلَقَ in the second example?" },
      { title: "Preposition Chains", titleAr: "سِلْسِلَة حُرُوف الْجَر", grammarTerm: "شبه الجملة", reveal: "You tracked multiple prepositions contributing meaning across one sentence.", hookQuestion: "How many prepositions appear in the third example?" },
      { title: "Preview: Book 4 Brings Action", titleAr: "الْمُضَارِع قَادِم", grammarTerm: "مقدمة المضارع", reveal: "You noticed present-tense verb forms in لِيَعْبُدُونِ and تُزِغْ as a preview.", hookQuestion: "What prefix do يَعْبُدُونِ and تُزِغْ share?" },
    ],
  },

  // ── Ch34 ── المضارع: The Present Tense ────────────────────────────────────
  {
    order: 34,
    sourceFile: "reader_lecture_34_present_tense_mudari.md",
    title: "المضارع: The Present Tense",
    titleAr: "الْفِعْل الْمُضَارِع",
    description: "The present tense prefix system — he, we, I, you.",
    hook: { ayahAr: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", ayahRef: "Al-Fatiha 1:5", highlightedWord: "نَعْبُدُ" },
    examples: [
      card("يَقْرَأُ الطَّالِبُ الدَّرْسَ", "The student reads the lesson", "yaqra'ut-talibu ad-darsa"),
      card("نَذْكُرُ اللَّهَ فِي كُلِّ وَقْتٍ", "We remember Allah at all times", "nadhkurul-laaha fee kulli waqt"),
      card("أَفْهَمُ الدَّرْسَ الْيَوْمَ", "I understand the lesson today", "afhamud-darsal-yawm"),
      card("تَكْتُبُ الرِّسَالَةَ الآنَ", "You are writing the letter now", "taktubur-risaalatal-aan"),
    ],
    parseText: "يَقْرَأُ الطَّالِبُ الدَّرْسَ",
    parseTokens: [token("يَقْرَأُ", "فعل", "reads"), token("الطَّالِبُ", "فاعل", "the student"), token("الدَّرْسَ", "مفعول", "the lesson")],
    conversation: ["مَاذَا يَفْعَلُ الطَّالِبُ؟", "يَقْرَأُ الطَّالِبُ الدَّرْسَ"],
    conversationDistractor: "لِيَعْبُدُونِ",
    distractor: "to worship Him",
    blankDistractor: "تَقْرَأُ",
    noorTip: "نَعْبُدُ — we worship — is pure present tense, recurring every prayer. You have been saying this.",
    noorTipUr: "نَعْبُدُ ہر نماز میں پڑھتے ہیں — یہ فعل مضارع متکلم جمع ہے۔",
    focuses: [
      { title: "He Does (يَفْعَلُ)", titleAr: "يَـ", grammarTerm: "فعل مضارع غائب", reveal: "You recognised the يَـ prefix as the mark of third person masculine present.", hookQuestion: "What does the يَـ prefix tell you about the doer?" },
      { title: "We Do (نَفْعَلُ)", titleAr: "نَـ", grammarTerm: "فعل مضارع متكلمين", reveal: "You connected نَعْبُدُ in Al-Fatiha to the نَـ prefix pattern.", hookQuestion: "Why is نَعْبُدُ in the plural 'we' form in Al-Fatiha?" },
      { title: "I Do (أَفْعَلُ)", titleAr: "أَـ", grammarTerm: "فعل مضارع متكلم", reveal: "You used أَـ as the first person singular present prefix.", hookQuestion: "How does أَفْهَمُ differ from يَفْهَمُ?" },
      { title: "From Al-Fatiha — We Worship", titleAr: "نَعْبُدُ وَنَسْتَعِينُ", grammarTerm: "فعل مضارع في القرآن", reveal: "You parsed the two present-tense verbs of Al-Fatiha 1:5 with full understanding.", hookQuestion: "What are the two actions we declare in Al-Fatiha 1:5?" },
    ],
  },

  // ── Ch35 ── Future with سَ and سَوْفَ ──────────────────────────────────────
  {
    order: 35,
    sourceFile: "reader_lecture_35_future_sa_sawfa.md",
    title: "Future with سَ and سَوْفَ",
    titleAr: "سَ وَسَوْفَ لِلْمُسْتَقْبَل",
    description: "Near and emphatic future with the two future particles.",
    hook: { ayahAr: "فَسَوْفَ يَأْتِي اللَّهُ بِقَوْمٍ يُحِبُّهُمْ", ayahRef: "Al-Ma'idah 5:54", highlightedWord: "سَوْفَ يَأْتِي" },
    examples: [
      card("سَيَعْلَمُونَ غَدًا", "They will know tomorrow", "saya'lamoona ghadan"),
      card("سَوْفَ تَرَى نَتِيجَةَ عَمَلِكَ", "You will certainly see the result of your work", "sawfa taraa nateejata amalika"),
      card("سَنَنصُرُكَ إِنْ شَاءَ اللَّهُ", "We will help you, God willing", "sanansurukal-laah"),
      card("سَوْفَ يَأْتِي اللَّهُ بِقَوْمٍ يُحِبُّهُمْ", "Allah will bring a people He loves", "sawfa ya'til-laahu biqawmin yuhibbuhum"),
    ],
    parseText: "سَوْفَ تَرَى نَتِيجَةَ عَمَلِكَ",
    parseTokens: [token("سَوْفَ", "حرف جر", "will"), token("تَرَى", "فعل", "you will see"), token("نَتِيجَةَ", "مضاف", "result of"), token("عَمَلِكَ", "مضاف إليه", "your work")],
    conversation: ["مَتَى سَيَعْلَمُونَ؟", "سَيَعْلَمُونَ غَدًا"],
    conversationDistractor: "يَقْرَأُ الطَّالِبُ الدَّرْسَ",
    distractor: "The student reads the lesson",
    blankDistractor: "لَنْ",
    noorTip: "سَوْفَ يَأْتِي — Allah's promise in the Quran is always certain. سَوْفَ adds that certainty.",
    noorTipUr: "سَ قریب مستقبل ہے، سَوْفَ دور یا تاکیدی مستقبل ہے۔",
    focuses: [
      { title: "سَ — Soon It Will", titleAr: "سَـ", grammarTerm: "سين الاستقبال", reveal: "You attached سَـ directly to a present verb to make a near future.", hookQuestion: "What does the سَـ prefix promise about time?" },
      { title: "سَوْفَ — Certainly It Will", titleAr: "سَوْفَ", grammarTerm: "سوف الاستقبال", reveal: "You saw سَوْفَ before the verb, adding emphasis and distance to the future.", hookQuestion: "How is سَوْفَ more emphatic than سَـ?" },
      { title: "Promise and Warning", titleAr: "وَعْد وَتَحْذِير", grammarTerm: "معاني المستقبل", reveal: "You understood that future particles carry both promise and warning in Quranic context.", hookQuestion: "Is سَيَعْلَمُونَ a promise or a warning?" },
      { title: "Future in the Quran", titleAr: "الْمُسْتَقْبَل الْقُرْآنِي", grammarTerm: "فعل مضارع مع سوف", reveal: "You read a Quranic promise using سَوْفَ + present verb fluently.", hookQuestion: "What is Allah promising in Al-Ma'idah 5:54?" },
    ],
  },

  // ── Ch36 ── المصدر: The Verbal Noun ──────────────────────────────────────
  {
    order: 36,
    sourceFile: "reader_lecture_36_masdar_verbal_noun.md",
    title: "المصدر: The Verbal Noun",
    titleAr: "الْمَصْدَر",
    description: "The masdar — expressing an act as a noun: dhikr, salah, hamd, ibadah.",
    hook: { ayahAr: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ", ayahRef: "Al-Baqarah 2:43", highlightedWord: "الصَّلَاةَ" },
    examples: [
      card("الذِّكْرُ يُطَمْئِنُ الْقُلُوبَ", "Remembrance settles hearts", "adh-dhikru yutma'inul-quloob"),
      card("الصَّلَاةُ عِمَادُ الدِّينِ", "Prayer is the pillar of the religion", "as-salaatu imaadud-deen"),
      card("الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", "All praise is for Allah, Lord of the worlds", "al-hamdu lillaahi rabbil-aalameen"),
      card("الْعِبَادَةُ غَايَةُ الْخَلْقِ", "Worship is the purpose of creation", "al-ibaadatu ghaayatul-khalq"),
    ],
    parseText: "الصَّلَاةُ عِمَادُ الدِّينِ",
    parseTokens: [token("الصَّلَاةُ", "مبتدأ", "prayer"), token("عِمَادُ", "مضاف", "pillar of"), token("الدِّينِ", "مضاف إليه", "the religion")],
    conversation: ["مَا هُوَ عِمَادُ الدِّينِ؟", "الصَّلَاةُ عِمَادُ الدِّينِ"],
    conversationDistractor: "سَيَعْلَمُونَ غَدًا",
    distractor: "They will know tomorrow",
    blankDistractor: "الزَّكَاةُ",
    noorTip: "الصَّلَاةَ in Al-Baqarah 2:43 is a masdar used as a direct object — the act commanded.",
    noorTipUr: "مصدر وہ اسم ہے جو فعل کا معنی رکھتا ہے — صلاة، ذکر، حمد، عبادت سب مصادر ہیں۔",
    focuses: [
      { title: "The Act of Remembering (ذِكْر)", titleAr: "ذِكْر", grammarTerm: "مصدر", reveal: "You saw ذَكَرَ (he remembered) converted to ذِكْر (the act of remembering).", hookQuestion: "How does ذِكْر differ in meaning from ذَكَرَ?" },
      { title: "The Act of Praying (صَلَاة)", titleAr: "صَلَاة", grammarTerm: "مصدر", reveal: "You recognised صَلَاة as a noun that carries the whole meaning of the act.", hookQuestion: "Why is الصَّلَاةُ called the pillar of the religion?" },
      { title: "The Act of Praising (حَمْد)", titleAr: "حَمْد", grammarTerm: "مصدر", reveal: "You traced الْحَمْدُ back to the verb حَمِدَ and understood its nominal force.", hookQuestion: "What does it mean to start with الْحَمْدُ?" },
      { title: "Worship as a Noun (عِبَادَة)", titleAr: "عِبَادَة", grammarTerm: "مصدر", reveal: "You used عِبَادَة in a predicate to define the purpose of creation.", hookQuestion: "How is عِبَادَةُ used in الْعِبَادَةُ غَايَةُ الْخَلْقِ?" },
    ],
  },

  // ── Ch37 ── Feminine Verb Forms ───────────────────────────────────────────
  {
    order: 37,
    sourceFile: "reader_lecture_37_feminine_verb_forms.md",
    title: "Feminine Verb Forms",
    titleAr: "الأَفْعَال الْمُؤَنَّثَة",
    description: "Present tense feminine forms — she does, you (f) do, they (f) do.",
    hook: { ayahAr: "إِنَّ الصَّلَاةَ تَنْهَى عَنِ الْفَحْشَاءِ", ayahRef: "Al-Ankabut 29:45", highlightedWord: "تَنْهَى" },
    examples: [
      card("تَقْرَأُ الْمُعَلِّمَةُ الدَّرْسَ", "The female teacher reads the lesson", "taqra'ul-mu'allimatu ad-darsa"),
      card("تَذْهَبُ إِلَى الْمَسْجِدِ كُلَّ يَوْمٍ", "She goes to the mosque every day", "tadhhabu ilal-masjidi kulla yawm"),
      card("هَلْ تَكْتُبِينَ الرِّسَالَةَ الآنَ؟", "Are you (f) writing the letter now?", "hal taktubeenar-risaalatal-aan"),
      card("إِنَّ الصَّلَاةَ تَنْهَى عَنِ الْفَحْشَاءِ", "Indeed prayer prevents indecency", "innas-salaata tanhal-anil-fahshaa'"),
    ],
    parseText: "تَقْرَأُ الْمُعَلِّمَةُ الدَّرْسَ",
    parseTokens: [token("تَقْرَأُ", "فعل", "reads"), token("الْمُعَلِّمَةُ", "فاعل", "the teacher (f)"), token("الدَّرْسَ", "مفعول", "the lesson")],
    conversation: ["مَاذَا تَفْعَلُ الْمُعَلِّمَةُ؟", "تَقْرَأُ الْمُعَلِّمَةُ الدَّرْسَ"],
    conversationDistractor: "الصَّلَاةُ عِمَادُ الدِّينِ",
    distractor: "Prayer is the pillar of the religion",
    blankDistractor: "يَقْرَأُ",
    noorTip: "تَنْهَى in Al-Ankabut is a feminine present tense verb — prayer itself as an acting agent.",
    noorTipUr: "تَنْهَى — وہ روکتی ہے۔ صلاة مؤنث ہے اس لیے تَـ کا استعمال ہوا۔",
    focuses: [
      { title: "She Does (تَفْعَلُ)", titleAr: "تَـ للغائبة", grammarTerm: "فعل مضارع غائبة", reveal: "You saw the تَـ prefix serving both she and you — context separates them.", hookQuestion: "How do you know تَقْرَأُ means 'she reads' and not 'you read' here?" },
      { title: "She Is Going", titleAr: "تَذْهَبُ", grammarTerm: "فعل مضارع مؤنث", reveal: "You used a feminine present verb in a movement sentence.", hookQuestion: "What would change if the subject were masculine?" },
      { title: "You (f) Are Reading", titleAr: "تَكْتُبِينَ", grammarTerm: "فعل مضارع مخاطبة", reveal: "You added ينَ to the stem to address a female listener directly.", hookQuestion: "What does the ينَ ending signal?" },
      { title: "The Sky and Earth Are Feminine Too", titleAr: "السَّمَاء وَالأَرْض", grammarTerm: "مؤنث مجازي", reveal: "You recognised that grammatically feminine nouns take feminine verbs.", hookQuestion: "Why does تَنْهَى agree with الصَّلَاةَ?" },
    ],
  },

  // ── Ch38 ── Expanded Verb Usage and Communication ─────────────────────────
  {
    order: 38,
    sourceFile: "reader_lecture_38_verb_communication.md",
    title: "Expanded Verb Usage and Communication",
    titleAr: "الأَفْعَال الْمُضَارِعَة فِي الْحِوَار",
    description: "Present tense verbs in dialogue and connected speech.",
    hook: { ayahAr: "أَفَلَا تَعْقِلُونَ", ayahRef: "Al-Baqarah 2:44", highlightedWord: "تَعْقِلُونَ" },
    examples: [
      card("أَفَلَا تَعْقِلُونَ مَا تَقُولُونَ؟", "Do you not understand what you say?", "afalaa ta'qiloona maa taqooloon"),
      card("يَتَكَلَّمُ الأُسْتَاذُ وَيَسْمَعُ الطُّلَّابُ", "The teacher speaks and the students listen", "yatakallamal-ustaadhu wayasma'ut-tullaab"),
      card("مَا تَفْعَلُ الآنَ؟ أَكْتُبُ رِسَالَةً", "What are you doing now? I am writing a letter.", "maa taf'alul-aan? Aktubu risaalatan"),
      card("هَلْ تَفْهَمُونَ الدَّرْسَ؟ نَعَمْ نَفْهَمُهُ", "Do you understand the lesson? Yes, we understand it.", "hal tafhamoonal-dars? na'am nafahamuh"),
    ],
    parseText: "يَتَكَلَّمُ الأُسْتَاذُ وَيَسْمَعُ الطُّلَّابُ",
    parseTokens: [token("يَتَكَلَّمُ", "فعل", "speaks"), token("الأُسْتَاذُ", "فاعل", "the teacher"), token("يَسْمَعُ", "فعل", "listens"), token("الطُّلَّابُ", "فاعل", "the students")],
    conversation: ["هَلْ تَفْهَمُ الدَّرْسَ؟", "نَعَمْ، أَفْهَمُ الدَّرْسَ جَيِّدًا"],
    conversationDistractor: "تَقْرَأُ الْمُعَلِّمَةُ الدَّرْسَ",
    distractor: "The female teacher reads the lesson",
    blankDistractor: "تَسْمَعُ",
    noorTip: "أَفَلَا تَعْقِلُونَ — do you not reason? The Quran questions us in the present tense.",
    noorTipUr: "تَعْقِلُونَ جمع مذکر مخاطب کا صیغہ ہے — تم سب سمجھتے ہو۔",
    focuses: [
      { title: "Do You Not Understand?", titleAr: "أَفَلَا تَعْقِلُونَ", grammarTerm: "استفهام إنكاري", reveal: "You recognised a rhetorical question using the present tense to challenge.", hookQuestion: "What kind of answer does أَفَلَا expect?" },
      { title: "A Conversation in the Present", titleAr: "حِوَار بِالْمُضَارِع", grammarTerm: "فعل مضارع في الحوار", reveal: "You carried a full exchange using present tense verbs naturally.", hookQuestion: "Which present verbs appear in the third example?" },
      { title: "Verb Then Subject", titleAr: "الْفِعْل قَبْلَ الْفَاعِل", grammarTerm: "ترتيب الجملة الفعلية", reveal: "You confirmed the standard order: verb first, then the subject in verbal sentences.", hookQuestion: "In يَتَكَلَّمُ الأُسْتَاذُ, which came first?" },
      { title: "Questions with Present Verbs", titleAr: "أَسْئِلَة الْمُضَارِع", grammarTerm: "استفهام مع المضارع", reveal: "You asked and answered questions using هَلْ with present tense verbs.", hookQuestion: "How do you ask 'do you understand?' in Arabic?" },
    ],
  },

  // ── Ch39 ── Grammar in Context: Surah Quraysh Vocabulary ──────────────────
  {
    order: 39,
    sourceFile: "reader_lecture_39_surah_quraysh_vocabulary.md",
    title: "Surah Quraysh Vocabulary",
    titleAr: "مُفْرَدَات سُورَة قُرَيْش",
    description: "Vocabulary from Surah Al-Quraysh — journey, winter, summer, hunger, fear.",
    hook: { ayahAr: "لِإِيلَافِ قُرَيْشٍ", ayahRef: "Al-Quraysh 106:1", highlightedWord: "إِيلَافِ" },
    examples: [
      card("لِإِيلَافِ قُرَيْشٍ إِيلَافِهِمْ", "For the bonding of Quraysh, their bonding", "li-eelaafi quraysh eelaafihim"),
      card("رِحْلَةُ الشِّتَاءِ وَالصَّيْفِ", "The journey of winter and summer", "rihlatus-shitaa'i was-sayf"),
      card("أَطْعَمَهُمْ مِنْ جُوعٍ", "He fed them from hunger", "at'amahum min joo'"),
      card("آمَنَهُمْ مِنْ خَوْفٍ", "He gave them security from fear", "aamanahum min khawf"),
    ],
    parseText: "رِحْلَةُ الشِّتَاءِ وَالصَّيْفِ",
    parseTokens: [token("رِحْلَةُ", "مضاف", "journey of"), token("الشِّتَاءِ", "مضاف إليه", "winter"), token("الصَّيْفِ", "مضاف إليه", "summer")],
    conversation: ["مَا مَعْنَى إِيلَاف؟", "الإِيلَافُ هُوَ الرِّبَاطُ وَالأَمَانُ"],
    conversationDistractor: "هَلْ تَفْهَمُ الدَّرْسَ؟",
    distractor: "Do you understand the lesson?",
    blankDistractor: "الرَّبِيع",
    noorTip: "Surah Quraysh is only 4 ayat but packed with vocabulary about protection and provision.",
    noorTipUr: "سورۃ قریش میں سفر، موسم، بھوک اور خوف کے الفاظ آتے ہیں — ان کو یاد کریں۔",
    focuses: [
      { title: "The Bond of Quraysh", titleAr: "إِيلَاف قُرَيْش", grammarTerm: "مصدر + مضاف إليه", reveal: "You read إِيلَاف as a masdar expressing the act of bonding.", hookQuestion: "What does إِيلَاف mean as an action noun?" },
      { title: "Two Journeys", titleAr: "رِحْلَة الشِّتَاء وَالصَّيْف", grammarTerm: "عطف في الإضافة", reveal: "You linked two seasons to a single journey noun using واو العطف.", hookQuestion: "How does Arabic connect two possessors to one noun?" },
      { title: "Safe From Hunger", titleAr: "أَطْعَمَ مِنْ جُوع", grammarTerm: "فعل + مِنْ", reveal: "You saw مِنْ expressing the cause of feeding — feeding because of hunger.", hookQuestion: "What does مِنْ جُوعٍ express about the hunger?" },
      { title: "Safe From Fear", titleAr: "آمَنَ مِنْ خَوْف", grammarTerm: "فعل + مِنْ", reveal: "You completed the surah's parallel structure: fed/hungry, safe/afraid.", hookQuestion: "What is the parallel between أَطْعَمَ and آمَنَ in this surah?" },
    ],
  },

  // ── Ch40 ── Sentence Expansion and Expression ─────────────────────────────
  {
    order: 40,
    sourceFile: "reader_lecture_40_sentence_expansion.md",
    title: "Sentence Expansion and Expression",
    titleAr: "تَوَسُّع الْجُمْلَة وَالتَّعْبِير",
    description: "Layered nominal sentences with adjective, idafa, and preposition combined.",
    hook: { ayahAr: "وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ", ayahRef: "Al-Baqarah 2:29", highlightedWord: "عَلِيمٌ" },
    examples: [
      card("الْعَالِمُ الْكَبِيرُ فِي الْمَدِينَةِ مَشْهُورٌ", "The great scholar in the city is famous", "al-aaalmul-kabeeru fil-madeenati mashhoor"),
      card("طَالِبُ الْعِلْمِ الْمُجْتَهِدُ يَنَالُ الأَجْرَ", "The diligent student of knowledge attains the reward", "taalibul-ilmil-mujtahidu yanaalul-ajr"),
      card("وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ", "And He is Knowing of all things", "wa huwa bikulli shay'in aleem"),
      card("الطَّرِيقُ إِلَى الْجَنَّةِ مَفْرُوشٌ بِالْمَكَارِهِ", "The path to Paradise is paved with difficulties", "at-tareequ ilal-jannati mafrooshan bil-makaarih"),
    ],
    parseText: "وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ",
    parseTokens: [token("هُوَ", "مبتدأ", "He"), token("بِكُلِّ", "حرف جر", "of all"), token("شَيْءٍ", "مضاف إليه", "things"), token("عَلِيمٌ", "خبر", "All-Knowing")],
    conversation: ["كَيْفَ تَصِفُ اللَّهَ بِالْعَرَبِيَّةِ؟", "وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ"],
    conversationDistractor: "رِحْلَةُ الشِّتَاءِ وَالصَّيْفِ",
    distractor: "The journey of winter and summer",
    blankDistractor: "جَهُولٌ",
    noorTip: "وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ — four words, a pronoun, a preposition phrase, and an adjective. That is Book 4.",
    noorTipUr: "یہ جملہ مبتدا، شبہ جملہ اور خبر کا مجموعہ ہے — قرآن کی خوبصورت ترکیب۔",
    focuses: [
      { title: "A Richer Description", titleAr: "وَصْف مُثَرَّى", grammarTerm: "نعت + شبه جملة", reveal: "You layered an adjective onto a noun already defined by idafa.", hookQuestion: "In الْعَالِمُ الْكَبِيرُ فِي الْمَدِينَةِ, what is the adjective and what is the place phrase?" },
      { title: "Adding a Preposition", titleAr: "إِضَافَة حَرْف الْجَر", grammarTerm: "شبه جملة في الخبر", reveal: "You used a preposition phrase as the predicate of a nominal sentence.", hookQuestion: "In وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ, what is the subject and what is the predicate?" },
      { title: "Stacking Adjectives", titleAr: "تَعَدُّد الصِّفَات", grammarTerm: "نعت متعدد", reveal: "You described a noun with multiple agreeing adjectives.", hookQuestion: "How would you add another adjective to الطَّرِيقُ الطَّوِيلُ الصَّعْبُ?" },
      { title: "Reading a Complex Ayah", titleAr: "قِرَاءَة آيَة مُرَكَّبَة", grammarTerm: "تركيب قرآني", reveal: "You parsed وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ using every tool you built across 40 chapters.", hookQuestion: "Name every grammatical role in وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ." },
    ],
  },
];

const chapters = specs.map(chapter);
module.exports = { chapters, specs };
