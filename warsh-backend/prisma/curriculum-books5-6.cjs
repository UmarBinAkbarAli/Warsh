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
    isLocked: true,
    lessons: spec.focuses.map((focus, index) => makeLesson(spec, index + 1, focus)),
  };
}

const specs = [

  // ── Ch41 ── Reading Connected Text ─────────────────────────────────────────
  {
    order: 41,
    sourceFile: "Docs/proposals/chapter-41-content-proposal.md",
    title: "Reading Connected Text: Gist, Order, Evidence and Two Surahs",
    titleUr: "جڑی ہوئی عبارت پڑھنا: مفہوم، ترتیب، ثبوت اور دو سورتیں",
    titleAr: "قِرَاءَةُ النَّصِّ الْمُتَّصِلِ",
    description: "Read short constructed texts for gist and order, find who a description or pronoun points to, read place, time and company phrases with their event, answer from the words of the text, then read Surah Al-Fil and Surah Al-Qari'ah in full with supplied vocabulary.",
    descriptionUr: "مختصر بنائے ہوئے متن کو مفہوم اور ترتیب کے لیے پڑھیں، دیکھیں کہ وصف یا ضمیر کس کی طرف ہے، جگہ، وقت اور ساتھ کے ٹکڑے ان کے واقعے کے ساتھ پڑھیں، متن کے الفاظ سے جواب دیں، پھر سورۃ الفیل اور سورۃ القارعہ دیے گئے الفاظ کی مدد سے مکمل پڑھیں۔",
    hook: { ayahAr: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ", ayahRef: "Al-Alaq 96:1", highlightedWord: "اقْرَأْ" },
    examples: [
      card("ذَهَبَ يُوسُفُ إِلَى الْمَسْجِدِ صَبَاحًا. ثُمَّ رَجَعَ إِلَى الْبَيْتِ.", "Yusuf went to the masjid in the morning. Then he returned to the house.", "dhahaba yūsufu ilā l-masjidi ṣabāḥan. thumma rajaʿa ilā l-bayti."),
      card("فِي الْفَصْلِ طَالِبٌ مُجْتَهِدٌ وَطَالِبَةٌ مُجْتَهِدَةٌ.", "In the class there is a diligent boy student and a diligent girl student.", "fī l-faṣli ṭālibun mujtahidun wa-ṭālibatun mujtahidatun."),
      card("جَلَسَ أَحْمَدُ فِي الْمَسْجِدِ بَعْدَ الصَّلَاةِ مَعَ أَخِيهِ.", "Ahmad sat in the masjid after the prayer with his brother.", "jalasa aḥmadu fī l-masjidi baʿda ṣ-ṣalāti maʿa akhīhi."),
      card("أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ", "Have you not considered how your Lord dealt with the companions of the elephant?", "alam tara kayfa faʿala rabbuka bi-aṣḥābi l-fīl"),
    ],
    parseText: "جَلَسَ أَحْمَدُ فِي الْمَسْجِدِ بَعْدَ الصَّلَاةِ",
    parseTokens: [token("جَلَسَ", "فعل", "sat"), token("أَحْمَدُ", "فاعل", "Ahmad"), token("فِي الْمَسْجِدِ", "حرف جر", "in the masjid"), token("بَعْدَ الصَّلَاةِ", "مضاف", "after the prayer")],
    conversation: ["أَيْنَ جَلَسَ أَحْمَدُ؟", "جَلَسَ فِي الْمَسْجِدِ"],
    conversationDistractor: "ثُمَّ رَجَعَ إِلَى الْبَيْتِ",
    distractor: "Ahmad returned to the house",
    blankDistractor: "ثُمَّ",
    noorTip: "A short phrase tells where, when or with whom — read it together with its event. In 2:3, one group (الَّذِينَ) does three things.",
    noorTipUr: "ایک مختصر ٹکڑا بتاتا ہے کہاں، کب یا کس کے ساتھ — اسے اس کے واقعے کے ساتھ پڑھیں۔ 2:3 میں ایک گروہ (الَّذِينَ) تین کام کرتا ہے۔",
    focuses: [
      { title: "Read for the Gist and the Order", titleAr: "قِرَاءَةُ الْفِكْرَةِ وَالتَّرْتِيبِ", grammarTerm: "الترتيب", reveal: "You read two short texts for gist and put events in the order the text states.", hookQuestion: "Which words tell you what came first?" },
      { title: "Who Is Described?", titleAr: "مَنِ الْمَوْصُوفُ؟", grammarTerm: "الوصف والضمير", reveal: "You found the noun a description and هُوَ / هِيَ point back to.", hookQuestion: "How does gender tell you who 'she' is?" },
      { title: "Phrases of Place, Time and Company", titleAr: "عِبَارَاتُ الْمَكَانِ وَالزَّمَانِ وَالصُّحْبَةِ", grammarTerm: "جار ومجرور", reveal: "You read فِي، بَعْدَ، مَعَ phrases together with their event.", hookQuestion: "What does مَعَ أَخِيهِ add to the event?" },
      { title: "Reading With Evidence", titleAr: "الْقِرَاءَةُ بِالدَّلِيلِ", grammarTerm: "الدليل", reveal: "You backed answers with the words of 2:3 and of a constructed text.", hookQuestion: "Which words support that answer?" },
      { title: "Reading Surah Al-Fil", titleAr: "قِرَاءَةُ سُورَةِ الْفِيلِ", grammarTerm: "نص كامل", reveal: "You read all five ayat of Al-Fil and followed what is done to whom.", hookQuestion: "Who do عَلَيْهِمْ and فَجَعَلَهُمْ point back to?" },
      { title: "Reading Surah Al-Qari'ah (1)", titleAr: "قِرَاءَةُ سُورَةِ الْقَارِعَةِ (١)", grammarTerm: "سؤال وجواب", reveal: "You read the question of 101:1–3 and its answer in 101:4–5.", hookQuestion: "What does كَـ mean in كَالْفَرَاشِ?" },
      { title: "Reading Surah Al-Qari'ah (2)", titleAr: "قِرَاءَةُ سُورَةِ الْقَارِعَةِ (٢)", grammarTerm: "فَأَمَّا … وَأَمَّا", reveal: "You read the two outcomes of 101:6–11 and the whole surah as one text.", hookQuestion: "Which outcome goes with light scales?" },
    ],
  },

  // ── Ch42 ── Questions and Answers ──────────────────────────────────────────
  {
    order: 42,
    sourceFile: "Docs/proposals/chapter-42-content-proposal.md",
    title: "Questions and Answers: How Many, When, Why, How",
    titleUr: "سوال اور جواب: کتنے، کب، کیوں، کیسے",
    titleAr: "الْأَسْئِلَةُ وَالْأَجْوِبَةُ: كَمْ وَمَتَى وَلِمَاذَا وَكَيْفَ",
    description: "Ask for a number with كَمْ, a time with مَتَى, a reason with لِمَاذَا (answered with لِأَنَّ) and a state or way with كَيْفَ, choose the answer each one needs, then read Surah At-Takathur in full with supplied vocabulary.",
    descriptionUr: "كَمْ سے تعداد، مَتَى سے وقت، لِمَاذَا سے وجہ (جس کا جواب لِأَنَّ سے دیا جاتا ہے) اور كَيْفَ سے حالت یا طریقہ پوچھیں، ہر ایک کا مناسب جواب چنیں، پھر دیے گئے الفاظ کی مدد سے سورۃ التکاثر مکمل پڑھیں۔",
    hook: { ayahAr: "قَالَ قَائِلٌ مِّنْهُمْ كَمْ لَبِثْتُمْ", ayahRef: "Al-Kahf 18:19", highlightedWord: "كَمْ" },
    examples: [
      card("كَمْ كِتَابًا قَرَأْتَ؟", "How many books did you read?", "kam kitāban qaraʾta?"),
      card("مَتَى سَتَذْهَبُ إِلَى الْمَدْرَسَةِ؟", "When will you go to the school?", "matā sa-tadhhabu ilā l-madrasati?"),
      card("لِمَاذَا ذَهَبْتَ إِلَى الْمَسْجِدِ؟ — لِأَنَّ الْمَسْجِدَ قَرِيبٌ.", "Why did you go to the masjid? — Because the masjid is near.", "li-mādhā dhahabta ilā l-masjidi? — li-anna l-masjida qarībun."),
      card("كَلَّا سَوْفَ تَعْلَمُونَ", "No! You will know.", "kallā sawfa taʿlamūn"),
    ],
    parseText: "مَتَى سَتَذْهَبُ إِلَى الْمَدْرَسَةِ",
    parseTokens: [token("مَتَى", "حرف", "when"), token("سَتَذْهَبُ", "فعل", "will you go"), token("إِلَى الْمَدْرَسَةِ", "حرف جر", "to the school")],
    conversation: ["لِمَاذَا ذَهَبْتَ إِلَى الْمَسْجِدِ؟", "لِأَنَّ الْمَسْجِدَ قَرِيبٌ"],
    conversationDistractor: "ذَهَبْتُ أَمْسِ",
    distractor: "I went yesterday",
    blankDistractor: "كَيْفَ",
    noorTip: "The question word decides what the answer must give: a number, a time, a reason, a state or a way. In 18:19 the question كَمْ gets an amount of time as its answer.",
    noorTipUr: "سوال کا لفظ طے کرتا ہے کہ جواب میں کیا ہونا چاہیے: تعداد، وقت، وجہ، حالت یا طریقہ۔ 18:19 میں سوال كَمْ کا جواب وقت کی مقدار ہے۔",
    focuses: [
      { title: "How Many? — كَمْ", titleAr: "كَمْ؟", grammarTerm: "اسم استفهام", reveal: "You asked for a number with a singular counted noun and answered with a digit.", hookQuestion: "What kind of noun follows كَمْ?" },
      { title: "When? — مَتَى", titleAr: "مَتَى؟", grammarTerm: "اسم استفهام", reveal: "You matched a time answer to the verb in the question.", hookQuestion: "Which time word fits مَتَى ذَهَبْتَ؟" },
      { title: "Why? — لِمَاذَا", titleAr: "لِمَاذَا؟", grammarTerm: "لِأَنَّ", reveal: "You asked for a reason and answered with the starter لِأَنَّ.", hookQuestion: "Which word starts the reason?" },
      { title: "How? — كَيْفَ, and Mixed Questions", titleAr: "كَيْفَ وَالْأَسْئِلَةُ الْمُخْتَلِطَةُ", grammarTerm: "اسم استفهام", reveal: "You told a state answer from a manner answer and sorted all four question words.", hookQuestion: "What does كَيْفَ حَالُكَ؟ ask for?" },
      { title: "Reading Surah At-Takathur", titleAr: "قِرَاءَةُ سُورَةِ التَّكَاثُرِ", grammarTerm: "نص كامل", reveal: "You read all eight ayat of At-Takathur in sections and as one text.", hookQuestion: "Which ayat repeat the same warning?" },
    ],
  },

  // ── Ch43 ── Book 4 Capstone ────────────────────────────────────────────────
  {
    order: 43,
    sourceFile: "Docs/proposals/chapter-43-content-proposal.md",
    title: "Book 4 Capstone: Integrated Reading and Applied Arabic",
    titleUr: "کتاب 4 کا اختتام: مربوط قراءت اور عملی عربی",
    titleAr: "خِتَامُ الْكِتَابِ الرَّابِعِ: الْقِرَاءَةُ وَالتَّطْبِيقُ الْمُتَكَامِلَانِ",
    description: "Use familiar Arabic structures to connect sentence meaning, interpret time cues in context, and read selected short Quranic passages with supplied vocabulary and evidence. Apply familiar phrases in a supported Food and Hospitality conversation.",
    descriptionUr: "جانے پہچانے عربی ڈھانچوں سے جملے کا مفہوم جوڑیں، سیاق میں وقت کے اشارے سمجھیں، اور دیے گئے الفاظ اور ثبوت کی مدد سے منتخب مختصر قرآنی عبارتیں پڑھیں۔ کھانا اور مہمان نوازی کی سہارا دی گئی گفتگو میں جانے پہچانے جملے استعمال کریں۔",
    hook: { ayahAr: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", ayahRef: "Al-Kawthar 108:1", highlightedWord: "الْكَوْثَرَ" },
    examples: [
      card("أَمْسِ كَتَبَ أَحْمَدُ الدَّرْسَ. غَدًا سَيَذْهَبُ إِلَى الْبَيْتِ.", "Yesterday Ahmad wrote the lesson. Tomorrow he will go home.", "amsi kataba aḥmadu d-darsa. ghadan sa-yadhhabu ilā l-bayti."),
      card("قَرَأَ الطَّالِبُ الْمُجْتَهِدُ كِتَابَ الْمُعَلِّمِ فِي الْفَصْلِ.", "The diligent student read the teacher's book in the class.", "qaraʾa ṭ-ṭālibu l-mujtahidu kitāba l-muʿallimi fī l-faṣli."),
      card("فَصَلِّ لِرَبِّكَ وَانْحَرْ", "So pray to your Lord and sacrifice.", "fa-ṣalli li-rabbika wa-nḥar"),
      card("هَلْ تُرِيدُ مَاءً؟ — نَعَمْ، شُكْرًا.", "Do you want water? — Yes, thank you.", "hal turīdu māʾan? — naʿam, shukran."),
    ],
    parseText: "قَرَأَ الطَّالِبُ الْمُجْتَهِدُ كِتَابَ الْمُعَلِّمِ فِي الْفَصْلِ",
    parseTokens: [token("قَرَأَ", "فعل", "read"), token("الطَّالِبُ", "فاعل", "the student"), token("الْمُجْتَهِدُ", "نعت", "diligent"), token("كِتَابَ", "مفعول", "the book of"), token("الْمُعَلِّمِ", "مضاف إليه", "the teacher"), token("فِي الْفَصْلِ", "حرف جر", "in the class")],
    conversation: ["هَلْ تُرِيدُ مَاءً؟", "نَعَمْ، شُكْرًا"],
    conversationDistractor: "لَا، شُكْرًا",
    distractor: "No, thank you",
    blankDistractor: "كَمَا",
    noorTip: "Read the time word and the verb together, take a long sentence apart into its parts, and read a short surah by following what each part says about whom.",
    noorTipUr: "وقت کا لفظ اور فعل ساتھ پڑھیں، لمبے جملے کو اس کے حصوں میں کھولیں، اور مختصر سورت کو یوں پڑھیں کہ ہر حصہ کس کے بارے میں کیا کہتا ہے۔",
    focuses: [
      { title: "Time and Action in Context", titleAr: "الزَّمَنُ وَالْفِعْلُ فِي السِّيَاقِ", grammarTerm: "الزمن", reveal: "You read the time word and the verb form together.", hookQuestion: "Which two clues tell you when?" },
      { title: "Putting a Sentence Together", titleAr: "تَرْكِيبُ الْجُمْلَةِ", grammarTerm: "أجزاء الجملة", reveal: "You took a long sentence apart and found what ـهَا points to.", hookQuestion: "Which word goes with which noun?" },
      { title: "Reading Surah Al-Kawthar", titleAr: "قِرَاءَةُ سُورَةِ الْكَوْثَرِ", grammarTerm: "نص كامل", reveal: "You read all three ayat of Al-Kawthar.", hookQuestion: "Who does ـكَ point to in all three ayat?" },
      { title: "Reading Surah Al-Humazah (1)", titleAr: "قِرَاءَةُ سُورَةِ الْهُمَزَةِ (١)", grammarTerm: "الَّذِي", reveal: "You read 104:1–5: a person described, 'No!', and a question.", hookQuestion: "Whom does الَّذِي of 104:2 describe?" },
      { title: "Reading Surah Al-Humazah (2)", titleAr: "قِرَاءَةُ سُورَةِ الْهُمَزَةِ (٢)", grammarTerm: "نص كامل", reveal: "You read 104:6–9 and the whole surah as one text.", hookQuestion: "What does إِنَّهَا point back to?" },
      { title: "Reading Surah Al-Ma'un (1)", titleAr: "قِرَاءَةُ سُورَةِ الْمَاعُونِ (١)", grammarTerm: "الَّذِي", reveal: "You read the question of 107:1 and the first two actions that describe the person.", hookQuestion: "Who is فَذَلِكَ الَّذِي?" },
      { title: "Reading Surah Al-Ma'un (2)", titleAr: "قِرَاءَةُ سُورَةِ الْمَاعُونِ (٢)", grammarTerm: "الَّذِينَ", reveal: "You read 107:4–7 and the whole surah as one text.", hookQuestion: "Which group do الَّذِينَ هُمْ point back to?" },
      { title: "Food and Hospitality (CL13)", titleAr: "الطَّعَامُ وَالضِّيَافَةُ", grammarTerm: "المحادثة", reveal: "You offered, accepted, declined and thanked, as a guest and as a host.", hookQuestion: "How do you politely decline an offer?" },
    ],
  },

  // ── Ch44 ── لَمْ and لَمَّا ─────────────────────────────────────────────────
  {
    order: 44,
    sourceFile: "Docs/proposals/chapter-44-content-proposal.md",
    title: "لَمْ and لَمَّا — Negating Past Action",
    titleUr: "لَمْ اور لَمَّا — ماضی کی نفی",
    titleAr: "لَمْ وَلَمَّا لِنَفْيِ الْمَاضِي",
    description: "Put a regular verb after لَمْ (did not) or لَمَّا (has not yet), tell the two meanings apart, repair a wrong ending, and read Surah Al-Ikhlas in full and the لَمْ / لَمَّا of 49:14.",
    descriptionUr: "سادہ فعل کو لَمْ (نہیں کیا) یا لَمَّا (ابھی تک نہیں کیا) کے بعد لگائیں، دونوں مفہوم الگ پہچانیں، غلط انجام درست کریں، اور سورۃ الاخلاص اور 49:14 کے لَمْ / لَمَّا کو مکمل پڑھیں۔",
    hook: { ayahAr: "لَمْ يَلِدْ وَلَمْ يُولَدْ", ayahRef: "Al-Ikhlas 112:3", highlightedWord: "لَمْ" },
    examples: [
      card("لَمْ يَذْهَبِ الطَّالِبُ إِلَى الْمَدْرَسَةِ", "The student did not go to school", "lam yadhhabi ṭ-ṭālibu ilā l-madrasati"),
      card("لَمَّا يَكْتُبْ أَحْمَدُ الدَّرْسَ", "Ahmad has not written the lesson yet", "lammā yaktub aḥmadu d-darsa"),
      card("وَلَمَّا يَدْخُلِ الْإِيمَانُ فِي قُلُوبِكُمْ", "and faith has not yet entered your hearts", "wa-lammā yadkhuli l-īmānu fī qulūbikum"),
      card("لَمْ يَلِدْ وَلَمْ يُولَدْ", "He did not beget, nor was He begotten", "lam yalid wa-lam yūlad"),
    ],
    parseText: "لَمْ يَذْهَبِ الطَّالِبُ إِلَى الْمَدْرَسَةِ",
    parseTokens: [token("لَمْ", "حرف", "did not"), token("يَذْهَبِ", "فعل", "go"), token("الطَّالِبُ", "فاعل", "the student"), token("إِلَى الْمَدْرَسَةِ", "حرف جر", "to the school")],
    conversation: ["هَلْ وَصَلَ الْأُسْتَاذُ؟", "لَا، لَمَّا يَصِلْ بَعْدُ"],
    conversationDistractor: "سَيَذْهَبُ إِلَى الْمَسْجِدِ",
    distractor: "He will go to the masjid",
    blankDistractor: "لَنْ",
    noorTip: "لَمْ يَلِدْ وَلَمْ يُولَدْ — لَمْ itself says 'did not'; that these statements about Allah always hold comes from what is said, not from the particle.",
    noorTipUr: "لَمْ يَلِدْ وَلَمْ يُولَدْ — لَمْ خود 'نہیں کیا' کہتا ہے؛ اللہ کے بارے میں ان باتوں کا ہمیشہ سچ ہونا کہی گئی بات سے آتا ہے، حرف سے نہیں۔",
    focuses: [
      { title: "Negating the Past — لَمْ", titleAr: "نَفْيُ الْمَاضِي — لَمْ", grammarTerm: "حرف جزم", reveal: "You put a sound verb after لَمْ and read its ending as sukūn.", hookQuestion: "What changes in the verb after لَمْ?" },
      { title: "Not Yet — لَمَّا", titleAr: "لَمَّا — حَتَّى الْآنَ", grammarTerm: "حرف نفي وجزم", reveal: "You told لَمَّا ('has not yet') from لَمْ ('did not').", hookQuestion: "How does لَمَّا يَذْهَبْ differ from لَمْ يَذْهَبْ?" },
      { title: "Reading Surah Al-Ikhlas", titleAr: "قِرَاءَةُ سُورَةِ الْإِخْلَاصِ", grammarTerm: "نص كامل", reveal: "You read all four ayat of Al-Ikhlas.", hookQuestion: "Which words say there is none like Him?" },
      { title: "Al-Ikhlas Unlocked", titleAr: "الْإِخْلَاصُ مَفْتُوحٌ", grammarTerm: "لم + مضارع", reveal: "You looked closely at the three jussive verbs of 112:3–4.", hookQuestion: "What is يَكُنْ?" },
      { title: "Mixed Negation Practice", titleAr: "مُمَارَسَةُ النَّفْيِ الْمُخْتَلِطَةِ", grammarTerm: "أدوات النفي", reveal: "You chose among لَا، لَمْ، لَمَّا by meaning.", hookQuestion: "Which particle means 'has not yet'?" },
      { title: "لَمَّا and لَمْ Across the Quran", titleAr: "لَمَّا وَلَمْ فِي الْقُرْآنِ", grammarTerm: "49:14", reveal: "You recognised both particles in 49:14 without rebuilding its forms.", hookQuestion: "Which particle is in وَلَمَّا يَدْخُلِ?" },
    ],
  },

  // ── Ch45 ── The Three States of المضارع ─────────────────────────────────────
  {
    order: 45,
    sourceFile: "Docs/proposals/chapter-45-content-proposal.md",
    title: "The Three States of the Present Tense",
    titleUr: "فعلِ مضارع کی تین حالتیں",
    titleAr: "أَحْوَالُ الْمُضَارِعِ الثَّلَاثَةُ",
    description: "Read the present-tense verb in its three states for regular verbs — default (ḍamma), after أَنْ، لَنْ، كَيْ، لِـ or حَتَّى (fatḥa), and after لَمْ، لَمَّا or the لَا of prohibition (sukūn) — with purpose and 'until' taught in their own lessons.",
    descriptionUr: "سادہ افعال کے لیے مضارع کو اس کی تین حالتوں میں پڑھیں — بنیادی (ضمہ)، أَنْ، لَنْ، كَيْ، لِـ یا حَتَّى کے بعد (فتحہ)، اور لَمْ، لَمَّا یا لا نہی کے بعد (سکون) — مقصد اور 'جب تک' کے الگ اسباق کے ساتھ۔",
    hook: { ayahAr: "لَنْ تَنَالُوا الْبِرَّ حَتَّى تُنفِقُوا مِمَّا تُحِبُّونَ", ayahRef: "Al Imran 3:92", highlightedWord: "تُنفِقُوا" },
    examples: [
      card("يَذْهَبُ الطَّالِبُ إِلَى الْمَدْرَسَةِ", "The student goes to the school (default)", "yadhhabu ṭ-ṭālibu ilā l-madrasati"),
      card("لَنْ يَذْهَبَ أَحْمَدُ إِلَى السُّوقِ", "Ahmad will not go to the market (fatḥa)", "lan yadhhaba aḥmadu ilā s-sūqi"),
      card("أَدْرُسُ كَيْ أَنْجَحَ", "I study so that I succeed (purpose)", "adrusu kay anjaḥa"),
      card("لَا تَذْهَبْ", "Don't go (sukūn)", "lā tadhhab"),
    ],
    parseText: "أَدْرُسُ كَيْ أَنْجَحَ",
    parseTokens: [token("أَدْرُسُ", "فعل", "I study"), token("كَيْ", "حرف", "so that"), token("أَنْجَحَ", "فعل", "I succeed")],
    conversation: ["لِمَاذَا تَدْرُسُ؟", "أَدْرُسُ كَيْ أَنْجَحَ"],
    conversationDistractor: "لَمْ أَذْهَبْ إِلَى الْمَدْرَسَةِ",
    distractor: "I did not go to school",
    blankDistractor: "لَا",
    noorTip: "A particle before the verb decides its ending: nothing → ḍamma; أَنْ، لَنْ، كَيْ، لِـ، حَتَّى → fatḥa; لَمْ، لَمَّا، لَا of prohibition → sukūn.",
    noorTipUr: "فعل سے پہلے کا حرف اس کا انجام طے کرتا ہے: کچھ نہیں ← ضمہ؛ أَنْ، لَنْ، كَيْ، لِـ، حَتَّى ← فتحہ؛ لَمْ، لَمَّا، لا نہی ← سکون۔",
    focuses: [
      { title: "The Default State: مَرْفُوع", titleAr: "حَالَةُ الرَّفْعِ", grammarTerm: "فعل مضارع مرفوع", reveal: "You read the verb with no governor and its ḍamma ending.", hookQuestion: "When is a present-tense verb مَرْفُوع?" },
      { title: "After أَنْ and لَنْ: مَنْصُوب", titleAr: "حَالَةُ النَّصْبِ", grammarTerm: "فعل مضارع منصوب", reveal: "You put a regular verb after أَنْ and لَنْ and read its fatḥa.", hookQuestion: "What ending follows لَنْ?" },
      { title: "Purpose — كَيْ and لِـ", titleAr: "الْغَرَضُ — كَيْ وَلِـ", grammarTerm: "كي / لام التعليل", reveal: "You said 'in order to' with كَيْ and لِـ + a verb ending in fatḥa.", hookQuestion: "What does لِـ mean before a noun, and before a verb?" },
      { title: "Until — حَتَّى and a Verb", titleAr: "حَتَّى لِلْغَايَةِ", grammarTerm: "حتى", reveal: "You read an action that continues up to an event not yet reached.", hookQuestion: "What does حَتَّى يَرْجِعَ say in 20:91?" },
      { title: "The مَجْزُوم State", titleAr: "حَالَةُ الْجَزْمِ", grammarTerm: "فعل مضارع مجزوم", reveal: "You put a regular verb after لَمْ and the لَا of prohibition and read its sukūn.", hookQuestion: "How is لَا تَذْهَبْ different from لَا تَذْهَبُ?" },
      { title: "Distinguishing the Three States", titleAr: "التَّمْيِيزُ بَيْنَ الْحَالَاتِ", grammarTerm: "العامل", reveal: "You matched each governor to the ending it gives.", hookQuestion: "Which governor gives sukūn?" },
      { title: "Selected Forms", titleAr: "جِدْوَلُ الْحَالَاتِ", grammarTerm: "تصريف", reveal: "You read one supplied stem in all three states with the same person.", hookQuestion: "What changes, and what stays the same?" },
      { title: "Quranic Application", titleAr: "التَّطْبِيقُ الْقُرْآنِيُّ", grammarTerm: "تطبيق", reveal: "You read each state in exact Quranic excerpts.", hookQuestion: "Which governor sits before نَبْرَحَ in 20:91?" },
    ],
  },

  // ── Ch46 ── Applying the Three States of the Imperfect Verb ───────────────────────────────
  {
    order: 46,
    sourceFile: "Docs/proposals/chapter-46-content-proposal.md",
    title: "Applying the Three States of the Imperfect Verb",
    titleUr: "مضارع کی تین حالتوں کا اطلاق",
    titleAr: "تَطْبِيقُ أَحْوَالِ الْمُضَارِعِ الثَّلَاثَةِ",
    description: "Apply the taught sound-verb model in complete clauses: find the imperfect verb, the governor that really governs it, its state and the sign at its end — plus statement versus prohibition versus command, and a bounded reading of Al-Masad 111:1–3. Weak-final and five-verb endings wait for Chapter 57.",
    descriptionUr: "سکھائے گئے سادہ افعال کے نمونے کو مکمل جملوں میں لاگو کریں: مضارع فعل، اس پر اصل عمل کرنے والا عامل، اس کی حالت اور آخر کی علامت ڈھونڈیں — ساتھ بیان، نہی اور امر کا فرق، اور المسد 111:1–3 کی محدود قرأت۔ معتل آخر اور افعالِ خمسہ کے آخر باب 57 تک مؤخر ہیں۔",
    hook: { ayahAr: "لَا تَجْعَلْ مَعَ اللَّهِ إِلَٰهًا آخَرَ", ayahRef: "Al-Isra' 17:22", highlightedWord: "تَجْعَلْ" },
    examples: [
      card("لَنْ يَذْهَبَ الطَّالِبُ إِلَى السُّوقِ", "The student will not go to the market (fatḥa)", "lan yadhhaba ṭ-ṭālibu ilā s-sūqi"),
      card("لَمْ يَجْلِسْ فِي الْفَصْلِ", "He did not sit in the class (sukūn)", "lam yajlis fī l-faṣli"),
      card("لَا تَذْهَبْ إِلَى السُّوقِ", "Do not go to the market (prohibition)", "lā tadhhab ilā s-sūqi"),
      card("أُرِيدُ أَنْ أَفْهَمَ", "I want to understand (أَنْ governs أَفْهَمَ only)", "urīdu an afhama"),
    ],
    parseText: "أُرِيدُ أَنْ أَفْهَمَ",
    parseTokens: [token("أُرِيدُ", "فعل", "I want"), token("أَنْ", "حرف", "to (governs the next verb)"), token("أَفْهَمَ", "فعل", "understand")],
    conversation: ["مَاذَا تُرِيدُ؟", "أُرِيدُ أَنْ أَفْهَمَ"],
    conversationDistractor: "لَمْ أَذْهَبْ أَمْسِ",
    distractor: "I did not go yesterday",
    blankDistractor: "لَنْ",
    noorTip: "Find the verb, find the governor that really governs it, name the state, point to the ending. A perfect verb has no state.",
    noorTipUr: "فعل ڈھونڈیں، اصل عامل ڈھونڈیں، حالت کا نام لیں، آخر کی طرف اشارہ کریں۔ ماضی فعل کی کوئی حالت نہیں۔",
    focuses: [
      { title: "A Parsing Routine", titleAr: "خُطُوَاتُ التَّحْلِيلِ", grammarTerm: "تحليل الفعل", reveal: "You followed one routine: verb, governor, state, ending.", hookQuestion: "What is your first step when you parse an imperfect verb?" },
      { title: "Governors in Complete Clauses", titleAr: "الْعَامِلُ فِي الْجُمْلَةِ", grammarTerm: "عامل", reveal: "You told the governor from the main verb and from nearby words.", hookQuestion: "In أُرِيدُ أَنْ أَفْهَمَ, which verb does أَنْ govern?" },
      { title: "Statement, Prohibition, Command", titleAr: "الْبَيَانُ وَالنَّهْيُ وَالْأَمْرُ", grammarTerm: "نفي ونهي وأمر", reveal: "You kept لَا تَذْهَبُ, لَا تَذْهَبْ and اِذْهَبْ apart.", hookQuestion: "How does لَا تَذْهَبْ differ from لَا تَذْهَبُ?" },
      { title: "Al-Masad 111:1–3", titleAr: "الْمَسَدُ ١–٣", grammarTerm: "فعل ماض ومضارع", reveal: "You sorted the perfect verbs from سَيَصْلَىٰ and saw سَـ as a future marker, not a governor.", hookQuestion: "Which verb in 111:1–3 is an imperfect?" },
      { title: "Purpose and Endpoint in Context", titleAr: "الْغَرَضُ وَالْغَايَةُ", grammarTerm: "كي / حتى", reveal: "You read كَيْ and حَتَّى clauses and their fatḥa endings.", hookQuestion: "What ending follows حَتَّى in أَجْلِسُ حَتَّى يَحْضُرَ؟" },
      { title: "Error Clinic", titleAr: "عِيَادَةُ الْأَخْطَاءِ", grammarTerm: "تصحيح", reveal: "You repaired planted mistakes and said why each failed.", hookQuestion: "Why is إِنَّ not a governor of the verb after it?" },
    ],
  },

  // ── Ch47 ── Sound Masculine Plural: Case and Iḍāfa ───────────────────────────────
  {
    order: 47,
    sourceFile: "Docs/proposals/chapter-47-content-proposal.md",
    title: "Sound Masculine Plural: Case and Iḍāfa",
    titleUr: "جمع مذکر سالم: حالت اور اضافت",
    titleAr: "جَمْعُ الْمُذَكَّرِ السَّالِمِ: الْإِعْرَابُ وَالْإِضَافَةُ",
    description: "Learn the sound masculine plural noun’s nominative ـُونَ and accusative / genitive ـِينَ forms, then see how its ن drops in iḍāfa while the case still shows. Look-alike verbs follow separate rules.",
    descriptionUr: "جمع مذکر سالم اسم کی مرفوع صورت ـُونَ اور منصوب / مجرور صورت ـِينَ سیکھیں، پھر دیکھیں کہ اضافت میں نون کیسے گرتا ہے جبکہ حالت پھر بھی ظاہر رہتی ہے۔ ملتے جلتے افعال کے قاعدے الگ ہیں۔",
    hook: { ayahAr: "وَالْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ بَعْضُهُمْ أَوْلِيَاءُ بَعْضٍ", ayahRef: "At-Tawbah 9:71", highlightedWord: "وَالْمُؤْمِنُونَ" },
    examples: [
      card("جَاءَ الْمُسْلِمُونَ", "The Muslims came (nominative, constructed)", "jā’a l-muslimūna"),
      card("رَأَيْتُ الْمُسْلِمِينَ", "I saw the Muslims (accusative, constructed)", "ra’aytu l-muslimīna"),
      card("مَرَرْتُ بِالْمُسْلِمِينَ", "I passed by the Muslims (genitive, constructed)", "marartu bil-muslimīna"),
      card("جَاءَ مُسْلِمُو الْمَدِينَةِ", "The Muslims of the city came (iḍāfa, constructed)", "jā’a muslimū l-madīnati"),
    ],
    parseText: "رَأَيْتُ الْمُسْلِمِينَ فِي الْمَسْجِدِ",
    parseTokens: [token("رَأَيْتُ", "فعل", "I saw"), token("الْمُسْلِمِينَ", "مفعول به", "the Muslims"), token("فِي", "حرف جر", "in"), token("الْمَسْجِدِ", "اسم مجرور", "the masjid")],
    conversation: ["مَنْ جَاءَ؟", "جَاءَ الْمُسْلِمُونَ"],
    conversationDistractor: "لَمْ يَذْهَبِ الْمُعَلِّمُونَ",
    distractor: "The teachers did not go",
    blankDistractor: "ـُونَ",
    noorTip: "Read the role: subject or predicate → ـُونَ; object or after a preposition → ـِينَ; first part of an iḍāfa → drop the ن.",
    noorTipUr: "کردار دیکھیں: فاعل یا خبر ← ـُونَ؛ مفعول یا حرفِ جر کے بعد ← ـِينَ؛ اضافت کا پہلا حصہ ← نون گرا دیں۔",
    focuses: [
      { title: "Nominative: ـُونَ", titleAr: "الرَّفْعُ بِالْوَاوِ", grammarTerm: "مرفوع بالواو", reveal: "You read ـُونَ as the sign of a nominative noun.", hookQuestion: "Which ending does a plural subject take?" },
      { title: "Accusative and Genitive: ـِينَ", titleAr: "النَّصْبُ وَالْجَرُّ بِالْيَاءِ", grammarTerm: "منصوب ومجرور بالياء", reveal: "You told object from after-a-preposition by the role, not the ending.", hookQuestion: "Why do رَأَيْتُ الْمُسْلِمِينَ and مَرَرْتُ بِالْمُسْلِمِينَ end alike?" },
      { title: "Iḍāfa: Drop the ن", titleAr: "حَذْفُ النُّونِ لِلْإِضَافَةِ", grammarTerm: "حذف النون", reveal: "You dropped the ن and kept the case in the و or ي.", hookQuestion: "What happens to the ن in مُسْلِمُو الْمَدِينَةِ?" },
      { title: "Noun or Verb?", titleAr: "اسْمٌ أَمْ فِعْلٌ", grammarTerm: "اسم وفعل", reveal: "You told الْمُؤْمِنُونَ, يُؤْمِنُونَ, آمَنُوا and أَطِيعُوا apart.", hookQuestion: "Which of these can take الـ?" },
      { title: "Quranic Application", titleAr: "التَّطْبِيقُ الْقُرْآنِيُّ", grammarTerm: "تطبيق", reveal: "You read الْمُؤْمِنُونَ, الْكَافِرِينَ and الْمُؤْمِنِينَ in 3:28 by their roles.", hookQuestion: "Which of the three is genitive in 3:28?" },
    ],
  },

  // ── Ch48 ── Time, Numbers and Measures ───────────────────────────────
  {
    order: 48,
    sourceFile: "Docs/proposals/chapter-48-content-proposal.md",
    title: "Time, Numbers and Measures",
    titleUr: "وقت، اعداد اور پیمائش",
    titleAr: "الْوَقْتُ وَالْأَعْدَادُ وَالْمَقَايِيسُ",
    description: "Clock time and duration, the numbers 1–100 in selected patterns (the counted noun changes with the range), a few measures, and a travel-planning conversation lab (CL14).",
    descriptionUr: "گھڑی کا وقت اور مدت، منتخب انداز میں 1–100 تک اعداد (معدود کی صورت دائرے کے ساتھ بدلتی ہے)، چند پیمائشیں، اور سفر کی منصوبہ بندی کی گفتگو لیب (CL14)۔",
    hook: { ayahAr: "إِنَّ عِدَّةَ الشُّهُورِ عِنْدَ اللَّهِ اثْنَا عَشَرَ شَهْرًا", ayahRef: "At-Tawbah 9:36", highlightedWord: "اثْنَا" },
    examples: [
      card("ثَلَاثَةُ أَيَّامٍ", "Three days (3–10: plural genitive noun)", "thalāthatu ayyāmin"),
      card("أَحَدَ عَشَرَ كَوْكَبًا", "Eleven stars (11–99: singular noun with fatḥa)", "aḥada ʿashara kawkaban"),
      card("مِائَةُ عَامٍ", "A hundred years (100: singular genitive noun)", "mi’atu ʿāmin"),
      card("فِي السَّاعَةِ السَّابِعَةِ مَسَاءً", "At seven in the evening", "fī s-sāʿati s-sābiʿati masā’an"),
    ],
    parseText: "أَحَدَ عَشَرَ كَوْكَبًا",
    parseTokens: [token("أَحَدَ", "عدد", "eleven (first part)"), token("عَشَرَ", "عدد", "eleven (second part)"), token("كَوْكَبًا", "اسم", "a star (singular, fatḥa)")],
    conversation: ["مَتَى تَبْدَأُ الرِّحْلَةُ؟", "تَبْدَأُ فِي السَّاعَةِ السَّابِعَةِ مَسَاءً"],
    conversationDistractor: "أَيْنَ الْمَكْتَبُ؟",
    distractor: "Where is the office?",
    blankDistractor: "ثَلَاثُ",
    noorTip: "Check the number first, then its noun: 3–10 → plural genitive; 11–99 → singular with fatḥa; 100 → singular genitive.",
    noorTipUr: "پہلے عدد دیکھیں، پھر اس کا معدود: 3–10 ← جمع مجرور؛ 11–99 ← واحد فتحہ کے ساتھ؛ 100 ← واحد مجرور۔",
    focuses: [
      { title: "Time Words and the Clock", titleAr: "الْوَقْتُ وَالسَّاعَةُ", grammarTerm: "ساعة وأوقات", reveal: "You read clock hours as their own list, apart from the numbers.", hookQuestion: "How do you say \"at seven in the evening\"?" },
      { title: "Numbers 1–10", titleAr: "الْأَعْدَادُ ١–١٠", grammarTerm: "عدد ومعدود", reveal: "You matched the number’s gender to the counted noun and used a plural genitive noun.", hookQuestion: "Why ثَلَاثُ لَيَالٍ but ثَلَاثَةُ أَيَّامٍ?" },
      { title: "Numbers 11–20", titleAr: "الْأَعْدَادُ ١١–٢٠", grammarTerm: "أعداد مركبة", reveal: "You read two-part numbers and a singular counted noun.", hookQuestion: "What does the noun after أَحَدَ عَشَرَ look like?" },
      { title: "Tens, Compounds and 100", titleAr: "الْعُقُودُ وَالْمِائَةُ", grammarTerm: "عقود ومائة", reveal: "You read 99 as unit + وَ + ten, and 100 with a singular genitive noun.", hookQuestion: "How is تِسْعٌ وَتِسْعُونَ نَعْجَةً built?" },
      { title: "Measures", titleAr: "الْمَقَايِيسُ", grammarTerm: "مقاييس", reveal: "You told a unit from the instrument you weigh with.", hookQuestion: "Is مِيزَانٌ a unit or an instrument?" },
      { title: "Time and Travel Planning (CL14)", titleAr: "تَخْطِيطُ الْوَقْتِ وَالسَّفَرِ", grammarTerm: "محادثة", reveal: "You asked when a trip begins, how long it takes and when A arrives.", hookQuestion: "Which question asks for the arrival time?" },
    ],
  },

  // ── Ch49 ── Clauses and Links ───────────────────────────────
  {
    order: 49,
    sourceFile: "Docs/proposals/chapter-49-content-proposal.md",
    title: "Clauses and Links",
    titleUr: "جملے اور ربط",
    titleAr: "الْجُمَلُ وَالرَّوَابِطُ",
    description: "Read a sentence in layers: a main clause and the clause it carries, the sisters of إِنَّ, which word each phrase belongs to, and relative clauses with their linking pronoun.",
    descriptionUr: "جملے کو تہ بہ تہ پڑھیں: مرکزی جملہ اور جو جملہ وہ رکھتا ہے، إِنَّ کی بہنیں، ہر ٹکڑا کس لفظ سے جڑا ہے، اور ربط کی ضمیر کے ساتھ صلہ والے جملے۔",
    hook: { ayahAr: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", ayahRef: "Al-Mulk 67:1", highlightedWord: "بِيَدِهِ" },
    examples: [
      card("قَالَ الْمُعَلِّمُ إِنَّ الدَّرْسَ سَهْلٌ", "The teacher said, \"Indeed, the lesson is easy\" (constructed)", "qāla l-muʿallimu inna d-darsa sahlun"),
      card("عَلِمَ الطَّالِبُ أَنَّ الدَّرْسَ سَهْلٌ", "The student knew that the lesson is easy (constructed)", "ʿalima ṭ-ṭālibu anna d-darsa sahlun"),
      card("كِتَابُ الطَّالِبِ الْجَدِيدُ", "The student’s new book (constructed)", "kitābu ṭ-ṭālibi l-jadīdu"),
      card("الْكِتَابُ الَّذِي قَرَأْتُهُ جَدِيدٌ", "The book that I read is new (constructed)", "al-kitābu lladhī qara’tuhu jadīdun"),
    ],
    parseText: "الْكِتَابُ الَّذِي قَرَأْتُهُ جَدِيدٌ",
    parseTokens: [token("الْكِتَابُ", "مبتدأ", "the book"), token("الَّذِي", "اسم موصول", "which"), token("قَرَأْتُهُ", "صلة", "I read it"), token("جَدِيدٌ", "خبر", "new")],
    conversation: ["مَاذَا قَالَ الْمُعَلِّمُ؟", "قَالَ إِنَّ الدَّرْسَ سَهْلٌ"],
    conversationDistractor: "لَمْ أَذْهَبْ أَمْسِ",
    distractor: "I did not go yesterday",
    blankDistractor: "أَنَّ",
    noorTip: "Find the main clause first, then the clause it carries. Ask which word each phrase belongs to, and what each pronoun points back to.",
    noorTipUr: "پہلے مرکزی جملہ ڈھونڈیں، پھر وہ جملہ جو اس میں رکھا گیا ہو۔ پوچھیں کہ ہر ٹکڑا کس لفظ سے جڑا ہے اور ہر ضمیر کس کی طرف لوٹتی ہے۔",
    focuses: [
      { title: "Reading a Sentence in Layers", titleAr: "قِرَاءَةُ الْجُمْلَةِ طَبَقَةً طَبَقَةً", grammarTerm: "جملة داخل جملة", reveal: "You found the main clause and the clause it carries.", hookQuestion: "What is the main clause in قَالَ الْمُعَلِّمُ إِنَّ الدَّرْسَ سَهْلٌ؟" },
      { title: "أَنَّ and كَأَنَّ", titleAr: "أَنَّ وَكَأَنَّ", grammarTerm: "أنّ وكأنّ", reveal: "You read \"that\" and \"as if\" with their noun in fatḥa and told short أَنْ apart.", hookQuestion: "Which أَنَّ follows a verb of knowing?" },
      { title: "لَكِنَّ, لَعَلَّ and لَيْتَ", titleAr: "لَكِنَّ وَلَعَلَّ وَلَيْتَ", grammarTerm: "أخوات إن", reveal: "You read contrast, hope and wish, each with its noun in fatḥa.", hookQuestion: "Which sister expresses a wish?" },
      { title: "Which Word Does the Phrase Belong To?", titleAr: "لِمَنْ تَعُودُ الْعِبَارَةُ", grammarTerm: "إضافة وصفة وجار ومجرور", reveal: "You told iḍāfa, adjective and preposition phrase apart.", hookQuestion: "What decides which noun الْجَدِيدُ describes in كِتَابُ الطَّالِبِ الْجَدِيدُ؟" },
      { title: "Relative Clauses and Their Links", titleAr: "الْجُمْلَةُ الْمَوْصُولَةُ وَرَابِطُهَا", grammarTerm: "صلة الموصول", reveal: "You followed the pronoun that points back to the antecedent.", hookQuestion: "What does the هُ in قَرَأْتُهُ refer to?" },
      { title: "Reading 67:1", titleAr: "قِرَاءَةُ الْآيَةِ", grammarTerm: "جملة اسمية", reveal: "You read a full ayah with a fronted predicate.", hookQuestion: "Which word is the predicate in بِيَدِهِ الْمُلْكُ؟" },
    ],
  },

  // ── Ch50 ── Connected Reading and Practical Fusha ───────────────────────────────
  {
    order: 50,
    sourceFile: "Docs/proposals/chapter-50-content-proposal.md",
    title: "Connected Reading and Practical Fusha",
    titleUr: "مسلسل پڑھنا اور عملی فصحیٰ",
    titleAr: "الْقِرَاءَةُ الْمُتَرَابِطَةُ وَالْفُصْحَى الْعَمَلِيَّةُ",
    description: "Read connected Quranic passages for gist, textual evidence and reference — including all of Al-Adiyat and Az-Zalzalah — and apply those skills in one guided everyday Fusha help dialogue.",
    descriptionUr: "جڑی ہوئی قرآنی عبارتیں مرکزی خیال، متن کی شہادت اور حوالوں کے ساتھ پڑھیں — بشمول پوری العادیات اور الزلزال — اور انہیں مدد مانگنے کی ایک رہنمائی والی روزمرہ فصیح گفتگو میں لاگو کریں۔",
    hook: { ayahAr: "وَالْعَادِيَاتِ ضَبْحًا", ayahRef: "Al-Adiyat 100:1", highlightedWord: "الْعَادِيَاتِ" },
    examples: [
      card("عَلَّمَهُ الْبَيَانَ", "He taught him clear expression (55:4) — the هُ points back to 55:3", "ʿallamahu l-bayāna"),
      card("إِلَّا أَنْ يَشَاءَ اللَّهُ", "Except that Allah wills (18:24)", "illā an yashā’a llāhu"),
      card("فَقَدْتُ حَقِيبَتِي", "I lost my bag (help desk)", "faqadtu ḥaqībatī"),
      card("الْمَكْتَبُ هُنَاكَ", "The office is over there", "al-maktabu hunāka"),
    ],
    parseText: "أَيْنَ الْمَكْتَبُ",
    parseTokens: [token("أَيْنَ", "اسم استفهام", "where"), token("الْمَكْتَبُ", "مبتدأ", "the office")],
    conversation: ["فَقَدْتُ حَقِيبَتِي", "سَأُسَاعِدُكَ"],
    conversationDistractor: "مَتَى تَصِلُ؟",
    distractor: "When do you arrive?",
    blankDistractor: "أَيْنَ",
    noorTip: "Read for the main idea first, then find the words that support it. Follow what each pronoun and connector points to.",
    noorTipUr: "پہلے مرکزی خیال پڑھیں، پھر وہ الفاظ ڈھونڈیں جو اسے سہارا دیں۔ ہر ضمیر اور ربط کا اشارہ دیکھیں۔",
    focuses: [
      { title: "Gist and Detail", titleAr: "الْفِكْرَةُ وَالتَّفَاصِيلُ", grammarTerm: "فهم المقروء", reveal: "You read 2:164 for its main idea and then for details.", hookQuestion: "What is the main idea of 2:164?" },
      { title: "Pronouns and Connectors", titleAr: "الضَّمَائِرُ وَالرَّوَابِطُ", grammarTerm: "ضمائر وروابط", reveal: "You followed إِنِّي, ذَٰلِكَ and إِلَّا أَنْ يَشَاءَ اللَّهُ in 18:23–24.", hookQuestion: "What does ذَٰلِكَ point to in 18:23?" },
      { title: "Reading 24:25 in Chunks", titleAr: "قِطَعُ الْآيَةِ", grammarTerm: "تقطيع النص", reveal: "You cut a long ayah where its meaning turns.", hookQuestion: "Where does 24:25 turn?" },
      { title: "Asking for Help (CL15)", titleAr: "طَلَبُ الْمُسَاعَدَةِ", grammarTerm: "محادثة", reveal: "You opened politely, stated a problem, asked where and thanked.", hookQuestion: "Which sentence states the problem?" },
      { title: "Connected Reading: Ar-Rahman 55:1–4", titleAr: "الْقِرَاءَةُ الْمُتَصِلَةُ", grammarTerm: "إحالة", reveal: "You followed a pronoun across ayat.", hookQuestion: "What does the هُ in عَلَّمَهُ point back to?" },
      { title: "Al-Adiyat and Az-Zalzalah", titleAr: "الْعَادِيَاتُ وَالزَّلْزَلَةُ", grammarTerm: "قراءة سورة كاملة", reveal: "You read two complete surahs in stages, with supplied meanings.", hookQuestion: "How does Al-Adiyat turn at 100:6?" },
    ],
  },

  // ── Ch51 ── Selected Arabic Verb Forms in Context ──────────
  {
    order: 51,
    sourceFile: "Docs/proposals/chapter-51-content-proposal.md",
    title: "Selected Arabic Verb Forms in Context",
    titleUr: "سیاق میں منتخب عربی فعلی اوزان",
    titleAr: "أَوْزَانُ الْأَفْعَالِ الْمُخْتَارَةُ فِي السِّيَاقِ",
    description: "Consolidate selected Form I past and present forms, build the command from a sound verb, and compare selected Form II and Form IV verbs and the sound passive in context.",
    descriptionUr: "ثلاثی کے منتخب ماضی اور مضارع روپ دہرائیں، صحیح فعل سے امر بنائیں، اور وزن ثانی و رابع کے منتخب افعال اور صحیح مجہول کا سیاق میں موازنہ کریں۔",
    hook: { ayahAr: "يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ", ayahRef: "Al-Jumu'ah 62:1", highlightedWord: "يُسَبِّحُ" },
    examples: [
      card("عَلَّمَ أَبِي الْوَلَدَ", "My father taught the boy (Form II)", "ʿallama ʾabī al-walada"),
      card("أَرْسَلَ أَبِي الْكِتَابَ", "My father sent the book (Form IV)", "ʾarsala ʾabī al-kitāba"),
      card("كُتِبَ الدَّرْسُ وَيُكْتَبُ الدَّرْسُ", "The lesson was written and is written (passive)", "kutiba ad-darsu wayuktabu ad-darsu"),
      card("اُكْتُبْ وَاِذْهَبْ", "Write! and Go! (commands)", "uktub wadhhab"),
    ],
    parseText: "يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ",
    parseTokens: [token("يُسَبِّحُ", "فعل", "exalts"), token("لِلَّهِ", "جار ومجرور", "to Allah"), token("مَا", "اسم موصول", "whatever"), token("فِي", "حرف جر", "in"), token("السَّمَاوَاتِ", "اسم مجرور", "the heavens")],
    conversation: ["مَاذَا يَفْعَلُ أَبِي؟","يُعَلِّمُ أَبِي الْوَلَدَ"],
    conversationDistractor: "كُتِبَ الدَّرْسُ",
    distractor: "The lesson was written",
    blankDistractor: "يُكْتَبُ",
    noorTip: "Judge the whole verb stem: a يُـ or an initial أَ alone does not tell you the voice or the person.",
    noorTipUr: "پورے فعل کے وزن کو دیکھیں: صرف يُـ یا شروع کا أَ آواز (معروف/مجہول) یا شخص نہیں بتاتا۔",
    focuses: [
      { title: "Past Endings, Including the Dual", titleAr: "الْمَاضِي وَالتَّثْنِيَةُ", grammarTerm: "الماضي", reveal: "You read the past endings, including ذَهَبَا and ذَهَبَتَا.", hookQuestion: "Which ending marks the two male doers?" },
      { title: "Present Prefixes Are Not Persons", titleAr: "سَوَابِقُ الْمُضَارِعِ", grammarTerm: "المضارع", reveal: "You read the whole present word, not the prefix alone.", hookQuestion: "Why can تَـ mean 'you' or 'she'?" },
      { title: "Moods and the Command", titleAr: "الْمُضَارِعُ وَالْأَمْرُ", grammarTerm: "الأمر", reveal: "You told the final sign from the command, built from تَكْتُبْ and تَذْهَبْ.", hookQuestion: "Which helper vowel does تَكْتُبْ take?" },
      { title: "Form II: عَلَّمَ / يُعَلِّمُ", titleAr: "الْوَزْنُ الثَّانِي", grammarTerm: "تفعيل", reveal: "You told عَلِمَ from عَلَّمَ by the whole stem.", hookQuestion: "What does the shadda tell you here?" },
      { title: "Form IV: أَرْسَلَ / يُرْسِلُ", titleAr: "الْوَزْنُ الرَّابِعُ", grammarTerm: "إفعال", reveal: "You told أَرْسَلَ from أَكْتُبُ, though both begin with أَ.", hookQuestion: "Is the first أَ the word 'I'?" },
      { title: "The Passive Past and Present", titleAr: "الْمَجْهُولُ", grammarTerm: "الفعل المبني للمجهول", reveal: "You read فُعِلَ and يُفْعَلُ and gave the receiver its ḍamma.", hookQuestion: "What is the receiver of كُتِبَ الدَّرْسُ?" },
      { title: "Reading Verbs in Ayat", titleAr: "قِرَاءَةُ الْأَفْعَالِ", grammarTerm: "قراءة", reveal: "You read verbs in 2:183 and 96:5 by stem, ending and sentence.", hookQuestion: "What kind of verb is كُتِبَ in 2:183?" },
    ],
  },

  // ── Ch52 ── Grammar Integration: Clauses, Phrases, Conditions and Two Surahs ──────────
  {
    order: 52,
    sourceFile: "Docs/proposals/chapter-52-content-proposal.md",
    title: "Grammar Integration: Clauses, Phrases, Conditions and Two Surahs",
    titleUr: "گرامر کا امتزاج: جملے، ٹکڑے، شرطیں اور دو سورتیں",
    titleAr: "تَكَامُلُ الْقَوَاعِدِ: جُمَلٌ وَعِبَارَاتٌ وَشُرُوطٌ وَسُورَتَانِ",
    description: "Find clause boundaries, follow phrases and what governs the noun and the verb, read a condition and its nominal response (65:3), and read all of Al-Qadr and At-Tin.",
    descriptionUr: "جملوں کی حدیں پہچانیں، ٹکڑوں اور اسم و فعل پر عمل کرنے والے حروف کو دیکھیں، ایک شرط اور اس کا اسمیہ جواب (65:3) پڑھیں، اور پوری القدر اور التین پڑھیں۔",
    hook: { ayahAr: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", ayahRef: "At-Talaq 65:3", highlightedWord: "فَهُوَ" },
    examples: [
      card("قَالُوا نَحْنُ مُسْلِمُونَ", "They said: we are Muslims (a nominal sentence inside a verbal one)", "qālū naḥnu muslimūna"),
      card("لَنْ نُؤْمِنَ بِكُمْ", "We will not believe in you (لَنْ governs the verb, بِ the pronoun)", "lan nuʾmina bikum"),
      card("مَنْ يَدْرُسْ فَهُوَ نَاجِحٌ", "Whoever studies — he is successful", "man yadrus fahuwa nājiḥun"),
      card("سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ", "Peace it is until the emergence of dawn (97:5)", "salāmun hiya ḥattā maṭlaʿi al-fajri"),
    ],
    parseText: "مَنْ يَدْرُسْ فَهُوَ نَاجِحٌ",
    parseTokens: [token("مَنْ", "اسم شرط", "whoever"), token("يَدْرُسْ", "فعل", "studies"), token("فَهُوَ", "فاء ومبتدأ", "then he"), token("نَاجِحٌ", "خبر", "successful")],
    conversation: ["مَنْ يَدْرُسْ؟","مَنْ يَدْرُسْ فَهُوَ نَاجِحٌ"],
    conversationDistractor: "لَنْ نُؤْمِنَ بِكُمْ",
    distractor: "We will not believe in you",
    blankDistractor: "لَنْ",
    noorTip: "Find where a clause begins and ends, which word a pronoun points back to, and what governs what.",
    noorTipUr: "دیکھیں جملہ کہاں شروع اور ختم ہوتا ہے، ضمیر کس لفظ کی طرف لوٹتی ہے، اور کون کس پر اثر کرتا ہے۔",
    focuses: [
      { title: "Nominal and Verbal Sentences Together", titleAr: "الْجُمْلَةُ الِاسْمِيَّةُ وَالْفِعْلِيَّةُ مَعًا", grammarTerm: "جملة اسمية وفعلية", reveal: "You found the clause boundaries in 2:30 and its relatives.", hookQuestion: "Where does the nominal sentence start?" },
      { title: "Iḍāfa Chains with Case Endings", titleAr: "سَلَاسِلُ الْإِضَافَةِ", grammarTerm: "إضافة", reveal: "You followed the first and second terms of an iḍāfa.", hookQuestion: "Which term is always genitive?" },
      { title: "Prepositions and Verb States", titleAr: "حُرُوفُ الْجَرِّ وَحَالَاتُ الْمُضَارِعِ", grammarTerm: "حروف الجر", reveal: "You kept noun governance apart from verb governance.", hookQuestion: "Which word does بِ govern in يُؤْمِنُونَ بِاللَّهِ؟" },
      { title: "Reading Ayat al-Kursi", titleAr: "تَحْلِيلُ نَصٍّ قُرْآنِيٍّ", grammarTerm: "نص", reveal: "You read the opening of 2:255 closely.", hookQuestion: "What kind of sentence is لَا تَأْخُذُهُ سِنَةٌ؟" },
      { title: "A Condition and Its Response", titleAr: "الشَّرْطُ وَجَوَابُهُ", grammarTerm: "شرط وجواب", reveal: "You read مَنْ … فَـ in 65:3 and in a constructed sentence.", hookQuestion: "Where does the response begin?" },
      { title: "Connected Text: 67:1", titleAr: "فَهْمُ النَّصِّ الْمُتَّصِلِ", grammarTerm: "جملة اسمية", reveal: "You read a full ayah with a fronted predicate.", hookQuestion: "Which word is the predicate in بِيَدِهِ الْمُلْكُ؟" },
      { title: "Al-Qadr — The Whole Surah", titleAr: "سُورَةُ الْقَدْرِ", grammarTerm: "نص كامل", reveal: "You followed one night through five ayat.", hookQuestion: "What does فِيهَا point back to?" },
      { title: "At-Tin — The Whole Surah", titleAr: "سُورَةُ التِّينِ", grammarTerm: "نص كامل", reveal: "You read oaths, a statement, an exception and two questions.", hookQuestion: "Whom does the exception of 95:6 apply to?" },
    ],
  },

  // ── Ch53 ── Reading Fluently: Connectors, Chunks and Two Surahs ──────────
  {
    order: 53,
    sourceFile: "Docs/proposals/chapter-53-content-proposal.md",
    title: "Reading Fluently: Connectors, Chunks and Two Surahs",
    titleUr: "روانی سے پڑھنا: رابطے، ٹکڑے اور دو سورتیں",
    titleAr: "الطَّلَاقَةُ فِي الْقِرَاءَةِ: رَوَابِطُ وَأَجْزَاءٌ وَسُورَتَانِ",
    description: "Follow connectors such as وَ, فَ and أَمَّا, read a long ayah in chunks, hold the gist of a surah, and read all of Ash-Sharh and Ad-Duha.",
    descriptionUr: "وَ، فَ اور أَمَّا جیسے رابطوں کو پہچانیں، لمبی آیت کو ٹکڑوں میں پڑھیں، سورت کا خلاصہ تھامیں، اور پوری الشرح اور الضحیٰ پڑھیں۔",
    hook: { ayahAr: "الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ", ayahRef: "Al Imran 3:191", highlightedWord: "الَّذِينَ" },
    examples: [
      card("فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ", "So as for the orphan, do not oppress him (93:9)", "faʾammā al-yatīma falā taqhar"),
      card("رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا", "Our Lord, You did not create this in vain (3:191)", "rabbanā mā khalaqta hādhā bāṭilan"),
      card("فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", "For indeed, with hardship is ease (94:5)", "faʾinna maʿa al-ʿusri yusran"),
      card("إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ", "Except those who believed and did righteous deeds (103:3)", "ʾillā alladhīna ʾāmanū waʿamilū aṣ-ṣāliḥāti"),
    ],
    parseText: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    parseTokens: [token("فَ", "حرف عطف", "so / for"), token("إِنَّ", "حرف توكيد", "indeed"), token("مَعَ الْعُسْرِ", "خبر مقدم", "with hardship"), token("يُسْرًا", "اسم إن", "ease")],
    conversation: ["مَاذَا قَالَ الْمُؤْمِنُونَ؟","رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا"],
    conversationDistractor: "فَلَا تَقْهَرْ",
    distractor: "Do not oppress",
    blankDistractor: "لَنْ",
    noorTip: "Cut a long ayah where its meaning turns, and follow a connector or a relative back to what it points to.",
    noorTipUr: "لمبی آیت کو وہاں کاٹیں جہاں مطلب مڑتا ہے، اور رابطے یا موصول کو اس کی طرف لوٹائیں جس کی طرف وہ اشارہ کرتا ہے۔",
    focuses: [
      { title: "Transition Words and Sentence Flow", titleAr: "أَدَوَاتُ الرَّبْطِ", grammarTerm: "حروف العطف", reveal: "You told وَ, فَ, بَلْ and أَمَّا by what they do.", hookQuestion: "What does أَمَّا open?" },
      { title: "Reading in Chunks: 3:190–191", titleAr: "الْقِرَاءَةُ بِالْأَجْزَاءِ", grammarTerm: "تقطيع النص", reveal: "You cut 3:191 into chunks and followed الَّذِينَ back.", hookQuestion: "Whom does الَّذِينَ describe?" },
      { title: "Paragraph-Level Reading: Al-Asr", titleAr: "فَهْمُ الْفَقَرَةِ", grammarTerm: "فهم المقروء", reveal: "You held the three ayat of Al-Asr as one argument.", hookQuestion: "Which words give the exception?" },
      { title: "Contextual Vocabulary: 94:5–6", titleAr: "الْمُفْرَدَاتُ بِالسِّيَاقِ", grammarTerm: "مفردات", reveal: "You read فَإِنَّ and the pair العسر / يسرا.", hookQuestion: "What are the two parts of فَإِنَّ؟" },
      { title: "Ash-Sharh — The Whole Surah", titleAr: "سُورَةُ الشَّرْحِ", grammarTerm: "نص كامل", reveal: "You read the gifts, the promise and the two requests.", hookQuestion: "What does الَّذِي point back to in 94:3?" },
      { title: "Ad-Duha I — 93:1–5", titleAr: "الضُّحَى ١", grammarTerm: "نص كامل", reveal: "You read two oaths, two denials and two promises.", hookQuestion: "What does 93:3 say the Lord has not done?" },
      { title: "Ad-Duha II — 93:6–11", titleAr: "الضُّحَى ٢", grammarTerm: "أَمَّا … فَـ", reveal: "You matched what was done for you with what you do for others.", hookQuestion: "Which request echoes the orphan of 93:6?" },
    ],
  },

  // ── Ch54 ── Book 5 Capstone: Forms, Quantities and Al-Fatiha ──────────
  {
    order: 54,
    sourceFile: "Docs/proposals/chapter-54-content-proposal.md",
    title: "Book 5 Capstone: Forms, Quantities and Al-Fatiha",
    titleUr: "کتاب 5 کا اختتام: روپ، مقداریں اور الفاتحہ",
    titleAr: "خِتَامُ الْكِتَابِ الْخَامِسِ: صُوَرٌ وَمَقَادِيرُ وَالْفَاتِحَةُ",
    description: "Revisit selected forms, numbers, time and sentence openers, read Luqman 31:12 and all of Al-Fatiha, preview Book 6, and finish with the Book 5 capstone test.",
    descriptionUr: "منتخب روپ، اعداد، وقت اور جملے کے آغاز دہرائیں، لقمان 31:12 اور پوری الفاتحہ پڑھیں، کتاب 6 کی جھلک دیکھیں، اور کتاب 5 کے اختتامی امتحان پر ختم کریں۔",
    hook: { ayahAr: "وَمَن يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ", ayahRef: "Luqman 31:12", highlightedWord: "فَإِنَّمَا" },
    examples: [
      card("مَنْ يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ", "Whoever is grateful is grateful only for himself (31:12)", "man yashkur faʾinnamā yashkuru linafsihi"),
      card("قَدْ أَفْلَحَ الْمُؤْمِنُونَ", "The believers have certainly succeeded (23:1)", "qad ʾaflaḥa al-muʾminūna"),
      card("أَحَدَ عَشَرَ كَوْكَبًا", "eleven stars (12:4)", "ʾaḥada ʿashara kawkaban"),
      card("اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", "Guide us to the straight path (1:6)", "ahdinā aṣ-ṣirāṭa al-mustaqīma"),
    ],
    parseText: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ",
    parseTokens: [token("قَدْ", "حرف", "certainly"), token("أَفْلَحَ", "فعل", "succeeded"), token("الْمُؤْمِنُونَ", "فاعل", "the believers")],
    conversation: ["مَنْ أَفْلَحَ؟","قَدْ أَفْلَحَ الْمُؤْمِنُونَ"],
    conversationDistractor: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    distractor: "Guide us to the straight path",
    blankDistractor: "لَنْ",
    noorTip: "قَدْ before a past verb is a particle — 'certainly' — not a preposition.",
    noorTipUr: "ماضی فعل سے پہلے قَدْ حرف ہے — 'یقیناً' — حرف جر نہیں۔",
    focuses: [
      { title: "Book 5 Key Grammar Points Review", titleAr: "مُرَاجَعَةُ أَهَمِّ مَسَائِلِ الْكِتَابِ الْخَامِسِ", grammarTerm: "مراجعة", reveal: "You revisited the great topics of Book 5.", hookQuestion: "Which particle puts a verb in jazm?" },
      { title: "Luqman 31:12 — Condition, Response and إِنَّمَا", titleAr: "لُقْمَانُ ١٢", grammarTerm: "إنما", reveal: "You read two conditions and met إِنَّمَا.", hookQuestion: "What does إِنَّمَا mean here?" },
      { title: "Selected Forms and Word Patterns", titleAr: "صُوَرٌ مُخْتَارَةٌ", grammarTerm: "أوزان", reveal: "You told particle, ending, voice and stem apart, and met قَدْ.", hookQuestion: "Is قَدْ a preposition?" },
      { title: "Quantities, Phrases and Clauses", titleAr: "الْمَقَادِيرُ وَالْعِبَارَاتُ", grammarTerm: "عدد ووقت", reveal: "You revisited numbers, time and the sentence openers.", hookQuestion: "What does لَعَلَّ express?" },
      { title: "Al-Fatiha I — 1:1–4", titleAr: "الْفَاتِحَةُ ١", grammarTerm: "نص كامل", reveal: "You read the name, the praise, the mercy and the sovereignty.", hookQuestion: "Whom do 1:3's adjectives describe?" },
      { title: "Al-Fatiha II — 1:5–7", titleAr: "الْفَاتِحَةُ ٢", grammarTerm: "نص كامل", reveal: "You read the request and the path it describes.", hookQuestion: "What does صِرَاطَ of 1:7 point back to?" },
      { title: "Book 6 Preview — The Grammar Science", titleAr: "مُعَايَنَةُ الْكِتَابِ السَّادِسِ", grammarTerm: "الإعراب", reveal: "You saw the question Book 6 asks: why does an ending change?", hookQuestion: "What will Book 6 ask about a word?" },
    ],
  },

  // ── Ch55 ── Iʿrāb: What an Ending Shows ──────────
  {
    order: 55,
    sourceFile: "Docs/proposals/chapter-55-content-proposal.md",
    title: "Iʿrāb: What an Ending Shows",
    titleUr: "اعراب: انجام کیا دکھاتا ہے",
    titleAr: "الْإِعْرَابُ: مَاذَا تُبَيِّنُ الْأَوَاخِرُ",
    description: "Learn what case endings show, which words change and which stay fixed, four common roles, prepositions, iḍāfa and the sound feminine plural, then read all of At-Takwir.",
    descriptionUr: "جانیں کہ حالتوں کے انجام کیا دکھاتے ہیں، کون سے الفاظ بدلتے ہیں اور کون سے مقرر رہتے ہیں، چار عام کردار، حروف جر، اضافت اور جمع مؤنث سالم، پھر پوری التکویر پڑھیں۔",
    hook: { ayahAr: "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا", ayahRef: "Al-Baqarah 2:31", highlightedWord: "الْأَسْمَاءَ" },
    examples: [
      card("كِتَابٌ · كِتَابًا · كِتَابٍ", "a book: nominative, accusative, genitive", "kitābun · kitāban · kitābin"),
      card("هَذَا · فِي هَذَا", "this · in this (a fixed form)", "hadhā · fī hadhā"),
      card("رَأَيْتُ الْمُعَلِّمَاتِ", "I saw the (female) teachers (accusative, with a kasra)", "raʾaytu al-muʿallimāti"),
      card("عَلِمَتْ نَفْسٌ مَا أَحْضَرَتْ", "A soul will know what it has brought (81:14)", "ʿalimat nafsun mā ʾaḥḍarat"),
    ],
    parseText: "كَتَبَ الطَّالِبُ الدَّرْسَ",
    parseTokens: [token("كَتَبَ", "فعل", "wrote"), token("الطَّالِبُ", "فاعل", "the student"), token("الدَّرْسَ", "مفعول", "the lesson")],
    conversation: ["مَاذَا كَتَبَ الطَّالِبُ؟","كَتَبَ الدَّرْسَ"],
    conversationDistractor: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ",
    distractor: "The believers have succeeded",
    blankDistractor: "الْجَزْم",
    noorTip: "Ask what a word is doing in the sentence first, then look at its ending: one vowel can serve two roles.",
    noorTipUr: "پہلے پوچھیں کہ لفظ جملے میں کیا کر رہا ہے، پھر اس کا انجام دیکھیں: ایک حرکت دو کرداروں کے لیے ہو سکتی ہے۔",
    focuses: [
      { title: "What Is Iʿrāb?", titleAr: "مَا الْإِعْرَابُ؟", grammarTerm: "الإعراب", reveal: "You told case from mood and read the three cases.", hookQuestion: "Which part of speech has a case?" },
      { title: "Muʿrab and Mabnī", titleAr: "الْمُعْرَبُ وَالْمَبْنِيُّ", grammarTerm: "المعرب والمبني", reveal: "You told changing words from fixed ones.", hookQuestion: "Why is هَذَا fixed?" },
      { title: "Subject and Predicate", titleAr: "الْمُبْتَدَأُ وَالْخَبَرُ", grammarTerm: "مبتدأ وخبر", reveal: "You told the doer of a verb from the subject of a nominal sentence.", hookQuestion: "Which word is the khabar in الْغُلَامُ كَرِيمٌ؟" },
      { title: "The Direct Object", titleAr: "الْمَفْعُولُ بِهِ", grammarTerm: "مفعول به", reveal: "You found the object and its accusative.", hookQuestion: "What did the verb act upon?" },
      { title: "Prepositions and Case", titleAr: "حُرُوفُ الْجَرِّ", grammarTerm: "حروف الجر", reveal: "You gave the noun after a preposition its genitive.", hookQuestion: "What case does يَدِ take in بِيَدِهِ؟" },
      { title: "The Accusative in Depth", titleAr: "مِنْ مَوَاضِعِ النَّصْبِ", grammarTerm: "النصب", reveal: "You met accusative roles beyond the object.", hookQuestion: "Is every accusative an object?" },
      { title: "Prepositional Phrases and Iḍāfa", titleAr: "الْإِضَافَةُ", grammarTerm: "إضافة", reveal: "You told the first and second terms of an iḍāfa.", hookQuestion: "Which term is always genitive?" },
      { title: "Sound Feminine Plural — One Kasra, Two Cases", titleAr: "جَمْعُ الْمُؤَنَّثِ السَّالِمُ", grammarTerm: "جمع المؤنث السالم", reveal: "You told the accusative from the genitive by role.", hookQuestion: "Why does the object السَّمَاوَاتِ take a kasra?" },
      { title: "Full Parsing: 59:21", titleAr: "تَحْلِيلُ آيَةٍ", grammarTerm: "تحليل", reveal: "You parsed a whole ayah word by word.", hookQuestion: "Which words are fixed in 59:21?" },
      { title: "At-Takwir I — 81:1–14", titleAr: "التَّكْوِيرُ ١", grammarTerm: "نص كامل", reveal: "You followed twelve 'whens' to their conclusion.", hookQuestion: "What do the 'whens' lead to?" },
      { title: "At-Takwir II — 81:15–21", titleAr: "التَّكْوِيرُ ٢", grammarTerm: "نص كامل", reveal: "You read the oaths and the description of the messenger.", hookQuestion: "Whom do 81:20–21 describe?" },
      { title: "At-Takwir III — 81:22–29", titleAr: "التَّكْوِيرُ ٣", grammarTerm: "نص كامل", reveal: "You read the denials, the question and the reminder.", hookQuestion: "What does 81:27 say the Quran is?" },
    ],
  },

  // ── Ch56 ── Special Noun Types ────────────────────────────────────────────
  {
    order: 56,
    sourceFile: "reader_lecture_56_special_noun_types.md",
    title: "Special Noun Types",
    titleAr: "الأَسْمَاء الْخَاصَّة",
    description: "الْمَقْصُور، الْمَنْقُوص، الأَسْمَاء الْخَمْسَة، and the dual form.",
    hook: { ayahAr: "وَيْلٌ لِكُلِّ هُمَزَةٍ لُمَزَةٍ", ayahRef: "Al-Humazah 104:1", highlightedWord: "هُمَزَةٍ" },
    examples: [
      card("مُوسَى وَعِيسَى — اسْمَانِ مَقْصُورَانِ", "Musa and Isa — two nouns ending in alif (مقصور)", "moosaa wa 'eesaa — ismaani maqsooraani"),
      card("الْقَاضِي حَكَمَ بِالْعَدْلِ", "The judge ruled with justice (منقوص — ends in ي)", "al-qaadee hakama bil-'adl"),
      card("أَبُوكَ رَجُلٌ كَرِيمٌ — أَبِيكَ رَجُلٌ كَرِيمٍ", "Your father is a noble man (أب — one of the five nouns)", "abuka rajulun kareem — abeeka rajulin kareem"),
      card("كِتَابَانِ عَلَى الْمَكْتَبِ وَكِتَابَيْنِ فِي الْحَقِيبَةِ", "Two books on the desk (nom) and two books in the bag (gen/acc)", "kitaabaani alal-maktabi wa kitaabayni fil-haqeeba"),
    ],
    parseText: "الْقَاضِي حَكَمَ بِالْعَدْلِ",
    parseTokens: [token("الْقَاضِي", "مبتدأ", "the judge"), token("حَكَمَ", "فعل", "ruled"), token("بِ", "حرف جر", "with"), token("الْعَدْلِ", "مضاف إليه", "justice")],
    conversation: ["مَا هُوَ الِاسْمُ الْمَقْصُور؟", "هُوَ كُلُّ اسْمٍ مَخْتُومٍ بِأَلِفٍ لَازِمَةٍ كَمُوسَى"],
    conversationDistractor: "الضَّمَّةُ عَلَامَةُ الرَّفْع",
    distractor: "The damma is the sign of nominative",
    blankDistractor: "الْهَادِي",
    noorTip: "هُمَزَةٍ and لُمَزَةٍ are nouns of exaggeration — مقصور-like structures common in Quranic condemnation.",
    noorTipUr: "ہُمَزَةٍ اور لُمَزَةٍ مبالغے کے صیغے ہیں — بکثرت عیب لگانے والے کو کہتے ہیں۔",
    focuses: [
      { title: "الْمَقْصُور — Alif Ending", titleAr: "الِاسْمُ الْمَقْصُور", grammarTerm: "اسم مقصور", reveal: "You learned that مقصور nouns (ending in ا or ى) show no case-vowel change — the alif absorbs it.", hookQuestion: "How do you know the case of مُوسَى if the ending never changes?" },
      { title: "الْمَنْقُوص — Ya Ending", titleAr: "الِاسْمُ الْمَنْقُوص", grammarTerm: "اسم منقوص", reveal: "You saw that منقوص nouns (ending in ي) behave irregularly — the ي stays and only tanwin or al determines its case.", hookQuestion: "What is the nominative of الْقَاضِي with tanwin (indefinite)?" },
      { title: "الأَسْمَاء الْخَمْسَة", titleAr: "أَبٌ أَخٌ حَمٌ فُو ذُو", grammarTerm: "الأسماء الخمسة", reveal: "You met the five special nouns whose case is shown by long vowels: أَبُو (nom), أَبَا (acc), أَبِي (gen).", hookQuestion: "What are the three case forms of أَبٌ?" },
      { title: "The Dual — الْمُثَنَّى", titleAr: "الْمُثَنَّى", grammarTerm: "مثنى", reveal: "You formed duals with ـَانِ (nominative) and ـَيْنِ (accusative/genitive) — a grammatical category English lacks.", hookQuestion: "How would you say 'two mosques' in nominative and in genitive?" },
      { title: "Dual in the Quran", titleAr: "الْمُثَنَّى فِي الْقُرْآن", grammarTerm: "مثنى قرآني", reveal: "You identified duals in Quranic text — يَدَا أَبِي لَهَبٍ (two hands) from Surah Al-Masad.", hookQuestion: "What is يَدَا in يَدَا أَبِي لَهَبٍ — and what case is it in?" },
      { title: "الأَسْمَاء الْخَمْسَة in Du'a", titleAr: "أَبِي فِي الدُّعَاء", grammarTerm: "تطبيق الأسماء الخمسة", reveal: "You traced أَبِي through Quranic du'a — seeing how رَبِّي uses the same genitive pattern as أَبِي.", hookQuestion: "Find the genitive form of رَبٌّ in Al-Fatiha." },
      { title: "Al-Humazah Unlocked", titleAr: "سُورَة الْهُمَزَة", grammarTerm: "تطبيق قرآني", reveal: "You can now parse وَيْلٌ لِكُلِّ هُمَزَةٍ لُمَزَةٍ — وَيْلٌ (mubtada), لِكُلِّ (khabar), هُمَزَةٍ (mudaf ilayh).", hookQuestion: "What case is هُمَزَةٍ in, and why?" },
    ],
  },

  // ── Ch57 ── Advanced Verb Grammar — Weak Verbs and الأفعال الخمسة ─────────
  {
    order: 57,
    sourceFile: "reader_lecture_57_weak_verbs_five_verbs.md",
    title: "Weak Verbs and the Five Verbs",
    titleAr: "الأَفْعَال الْمُعْتَلَّة وَالأَفْعَال الْخَمْسَة",
    description: "Weak verbs (with و, ا, ي roots) and the five special present-tense forms.",
    hook: { ayahAr: "كَانَ اللَّهُ غَفُورًا رَحِيمًا", ayahRef: "An-Nisa 4:96", highlightedWord: "كَانَ" },
    examples: [
      card("قَالَ يَقُولُ — فعل أجوف بالواو", "He said / he says — a hollow verb with و root", "qaala yaqoolu — fi'l ajwaf bil-waaw"),
      card("رَأَى يَرَى — فعل ناقص بالألف", "He saw / he sees — a defective verb with ا root", "ra'aa yaraa — fi'l naaqis bil-alif"),
      card("يَفْعَلُونَ تَفْعَلُونَ تَفْعَلَانِ — الأَفْعَال الْخَمْسَة", "They do (m pl) / you do (m pl) / you two do — the five verbs", "yaf'aloona taf'aloona taf'alaani — al-af'aalul-khamsa"),
      card("كَانَ اللَّهُ غَفُورًا رَحِيمًا", "Allah has always been Forgiving, Merciful", "kaanallahu ghafoorun raheemaa"),
    ],
    parseText: "كَانَ اللَّهُ غَفُورًا رَحِيمًا",
    parseTokens: [token("كَانَ", "فعل", "was/is"), token("اللَّهُ", "فاعل", "Allah"), token("غَفُورًا", "خبر كان", "Forgiving"), token("رَحِيمًا", "نعت", "Merciful")],
    conversation: ["مَا الْفِعْل الأَجْوَف؟", "هُوَ فِعْلٌ وَسَطُهُ حَرْفُ عِلَّةٍ كَقَالَ وَبَاعَ"],
    conversationDistractor: "الْقَاضِي حَكَمَ بِالْعَدْلِ",
    distractor: "The judge ruled with justice",
    blankDistractor: "يَسْمَعُونَ",
    noorTip: "كَانَ اللَّهُ — Allah 'was' Forgiving eternally. كَانَ here expresses timeless continuity, not past-only.",
    noorTipUr: "کَانَ اللَّهُ — یہاں ماضی نہیں بلکہ ازل سے ابد تک کا بیان ہے۔",
    focuses: [
      { title: "What Is a Weak Verb?", titleAr: "الْفِعْل الْمُعْتَل", grammarTerm: "فعل معتل", reveal: "You defined weak verbs: those with و، ا، or ي as one of their root letters — causing spelling and vowel changes.", hookQuestion: "Name three common Quranic verbs that are weak." },
      { title: "الْفِعْل الأَجْوَف — Hollow Verbs", titleAr: "الْفِعْل الأَجْوَف", grammarTerm: "فعل أجوف", reveal: "You conjugated hollow verbs (middle root is و or ي) — like قَالَ, كَانَ, بَاعَ — and saw how the middle letter changes or disappears.", hookQuestion: "What happens to the و in قَالَ when it becomes قُلْ?" },
      { title: "الْفِعْل النَّاقِص — Defective Verbs", titleAr: "الْفِعْل النَّاقِص", grammarTerm: "فعل ناقص", reveal: "You saw defective verbs (final root is و or ي) — like رَأَى، دَعَا، مَشَى — where the final letter changes or drops.", hookQuestion: "What is the مجزوم form of يَرَى?" },
      { title: "الأَفْعَال الْخَمْسَة", titleAr: "يَفْعَلُونَ تَفْعَلِينَ", grammarTerm: "الأفعال الخمسة", reveal: "You identified the five present-tense forms that end in ن: their مجزوم drops the ن rather than adding sukoon.", hookQuestion: "What happens to يَفْعَلُونَ in مجزوم state? What drops?" },
      { title: "كَانَ — The Most Important Weak Verb", titleAr: "كَانَ فِي الْقُرْآن", grammarTerm: "فعل ناقص + كان", reveal: "You parsed كَانَ in its Quranic role — changing the case of what follows it from nominative to accusative.", hookQuestion: "In كَانَ اللَّهُ غَفُورًا, why is غَفُورًا with fatḥa?" },
      { title: "Weak Verbs in Daily Recitation", titleAr: "الأَفْعَال الْمُعْتَلَّة فِي التِّلَاوَة", grammarTerm: "تطبيق", reveal: "You traced weak verbs through the surahs you already know — قُلْ (from قَالَ), تَرَى (from رَأَى), يَشَاء (from شَاءَ).", hookQuestion: "Find a weak verb in Surah Al-Kafirun and name its root." },
      { title: "Conjugating in Mجزوم — Five Verb Types", titleAr: "مَجْزُوم الأَفْعَال الْخَمْسَة", grammarTerm: "جزم الأفعال الخمسة", reveal: "You practised the jussive of all five verb types — seeing that each has a unique pattern for the مجزوم.", hookQuestion: "How do you form the مجزوم of يَذْهَبُونَ?" },
    ],
  },

  // ── Ch58 ── Higher-Level Syntax and Classical Usage ───────────────────────
  {
    order: 58,
    sourceFile: "reader_lecture_58_higher_syntax.md",
    title: "Higher-Level Syntax and Classical Usage",
    titleAr: "النَّحْو الرَّفِيع وَالِاسْتِخْدَام الْكِلَاسِيكِيّ",
    description: "Advanced syntactic relationships applied to Quranic and classical Arabic texts.",
    hook: { ayahAr: "وَبِالْحَقِّ أَنزَلْنَاهُ وَبِالْحَقِّ نَزَلَ", ayahRef: "Al-Isra 17:105", highlightedWord: "الْحَقِّ" },
    examples: [
      card("الْجُمْلَةُ الَّتِي تَبْدَأُ بِالْفِعْلِ جُمْلَةٌ فِعْلِيَّةٌ", "A sentence beginning with a verb is a verbal sentence", "al-jumlatu allatee tabda'u bil-fi'li jumlat fi'liyya"),
      card("وَبِالْحَقِّ أَنزَلْنَاهُ وَبِالْحَقِّ نَزَلَ", "And with truth We sent it down and with truth it descended", "wa bil-haqqi anzalnaahu wa bil-haqqi nazal"),
      card("الْخَبَرُ قَدْ يَكُونُ جُمْلَةً فِعْلِيَّةً", "The predicate may itself be a verbal sentence", "al-khabaru qad yakoonu jumlatan fi'liyya"),
      card("تَقَدُّمُ الْخَبَرِ عَلَى الْمُبْتَدَأِ جَائِزٌ", "The predicate may precede the subject", "taqaddum al-khabari alal-mubtada'i jaa'iz"),
    ],
    parseText: "وَبِالْحَقِّ أَنزَلْنَاهُ وَبِالْحَقِّ نَزَلَ",
    parseTokens: [token("وَبِالْحَقِّ", "متعلق بالفعل", "with truth"), token("أَنزَلْنَاهُ", "فعل+فاعل+مفعول", "We sent it down"), token("وَبِالْحَقِّ", "متعلق", "with truth"), token("نَزَلَ", "فعل", "it descended")],
    conversation: ["مَا الْفَرْقُ بَيْنَ أَنزَلْنَاهُ وَنَزَلَ؟", "أَنزَلْنَاهُ فِعْلٌ مُتَعَدٍّ وَنَزَلَ فِعْلٌ لَازِمٌ"],
    conversationDistractor: "كَانَ اللَّهُ غَفُورًا رَحِيمًا",
    distractor: "Allah has always been Forgiving, Merciful",
    blankDistractor: "الصِّدْق",
    noorTip: "وَبِالْحَقِّ is a prepositional phrase placed before its verb — the emphasis is on 'with truth' above all else.",
    noorTipUr: "وَبِالْحَقِّ کو فعل سے پہلے رکھا گیا ہے — اس میں حق پر زور دیا گیا ہے۔",
    focuses: [
      { title: "Sentence Types Revisited", titleAr: "أَنْوَاع الْجُمَل", grammarTerm: "جملة اسمية وفعلية", reveal: "You formally revisited the two sentence types with full analytical vocabulary — مبتدأ/خبر for nominal, فعل/فاعل for verbal.", hookQuestion: "What is the formal test for whether a sentence is اسمية or فعلية?" },
      { title: "Predicate as a Clause", titleAr: "الْخَبَر الْجُمْلَة", grammarTerm: "خبر جملة", reveal: "You saw that the خبر need not be a single word — it can itself be a full verbal or nominal sentence.", hookQuestion: "Give an example of a nominal sentence where the خبر is itself a sentence." },
      { title: "Fronted Predicate", titleAr: "تَقَدُّم الْخَبَر", grammarTerm: "تقديم الخبر", reveal: "You parsed cases where Arabic places the predicate before the subject for emphasis — a flexibility English lacks.", hookQuestion: "In فِي الْبَيْتِ رَجُلٌ, which is the مبتدأ and which is the خبر?" },
      { title: "Transitive vs Intransitive", titleAr: "الْفِعْل الْمُتَعَدِّي وَاللَّازِم", grammarTerm: "متعدٍّ ولازم", reveal: "You distinguished أَنزَلَ (transitive — sends something down to something) from نَزَلَ (intransitive — descends by itself).", hookQuestion: "How do you test if a verb is transitive or intransitive?" },
      { title: "Parallelism in the Quran", titleAr: "التَّوَازِي الْقُرْآنِيّ", grammarTerm: "أسلوب الطباق", reveal: "You felt the parallelism in وَبِالْحَقِّ أَنزَلْنَاهُ وَبِالْحَقِّ نَزَلَ — the structure mirrors itself for emphasis.", hookQuestion: "What is repeated and what changes between the two halves of this ayah?" },
    ],
  },

  // ── Ch59 ── Book 6 Capstone — Integration and Advanced Application ─────────
  {
    order: 59,
    sourceFile: "reader_lecture_59_book6_capstone.md",
    title: "Book 6 Capstone — Integration and Advanced Application",
    titleAr: "خَاتِمَة الْكِتَاب السَّادِس وَتَطْبِيقَاتُهُ",
    description: "Integrating morphology, syntax, and parsing in preparation for Book 7's applied spiral.",
    hook: { ayahAr: "هُوَ الَّذِي أَرْسَلَ رَسُولَهُ بِالْهُدَى وَدِينِ الْحَقِّ", ayahRef: "At-Tawbah 9:33", highlightedWord: "أَرْسَلَ" },
    examples: [
      card("هُوَ الَّذِي أَرْسَلَ رَسُولَهُ بِالْهُدَى", "He it is who sent His messenger with guidance", "huwal-ladhee arsala rasoolahu bil-hudaa"),
      card("بِالْهُدَى وَدِينِ الْحَقِّ لِيُظْهِرَهُ", "With guidance and the religion of truth to manifest it", "bil-hudaa wa deenil-haqqi li-yudh-hirahu"),
      card("أَرْسَلَ — فعل ماض من الرُّبَاعِيّ الْمَزِيد", "He sent — a past verb from the augmented quadrilateral form", "arsala — fi'l maadin minar-rubaai'yil-mazeed"),
      card("الرَّسُولُ مَرْفُوعٌ وَرَسُولَهُ مَنْصُوبٌ وَرَسُولِهِ مَجْرُورٌ", "ar-rasool (nom), rasooluhu (acc obj), rasoolihi (gen)", "ar-rasoolu marfoo' wa rasoolahu manshoob wa rasoolihi majroor"),
    ],
    parseText: "هُوَ الَّذِي أَرْسَلَ رَسُولَهُ بِالْهُدَى",
    parseTokens: [token("هُوَ", "مبتدأ", "He"), token("الَّذِي", "خبر", "who"), token("أَرْسَلَ", "فعل", "sent"), token("رَسُولَهُ", "مفعول", "His messenger"), token("بِالْهُدَى", "حرف جر", "with guidance")],
    conversation: ["مَنِ الَّذِي أَرْسَلَ الرَّسُولَ؟", "اللَّهُ هُوَ الَّذِي أَرْسَلَهُ بِالْهُدَى وَدِينِ الْحَقِّ"],
    conversationDistractor: "الْجُمْلَةُ الَّتِي تَبْدَأُ بِالْفِعْلِ فِعْلِيَّةٌ",
    distractor: "A sentence starting with a verb is verbal",
    blankDistractor: "لِيَمْنَعَهُ",
    noorTip: "أَرْسَلَ is Form IV (أَفْعَلَ) of رَسَلَ — the أَ prefix creates a causative meaning.",
    noorTipUr: "أَرْسَلَ باب افعال کا فعل ہے — أ کا اضافہ سببی معنی دیتا ہے۔",
    focuses: [
      { title: "Parsing a Full Quranic Sentence", titleAr: "تَحْلِيل جُمْلَة قُرْآنِيَّة", grammarTerm: "إعراب الجملة", reveal: "You parsed هُوَ الَّذِي أَرْسَلَ رَسُولَهُ بِالْهُدَى word by word using full i'rab vocabulary.", hookQuestion: "State the grammatical role of every word in هُوَ الَّذِي أَرْسَلَ رَسُولَهُ." },
      { title: "لِـ for Purpose", titleAr: "لَامُ التَّعْلِيل", grammarTerm: "لام التعليل + منصوب", reveal: "You saw لِـ before a verb expressing purpose — لِيُظْهِرَهُ (in order to manifest it) — triggering منصوب.", hookQuestion: "What does لِيُظْهِرَهُ tell you about why the messenger was sent?" },
      { title: "Book 6 Complete", titleAr: "اكْتِمَال الْكِتَاب السَّادِس", grammarTerm: "مراجعة شاملة", reveal: "You have mastered i'rab/bina, special noun types, the five verbs, and weak verbs — the grammar science apex.", hookQuestion: "What is the most important concept you learned in Book 6?" },
      { title: "Book 7 Preview", titleAr: "نَظْرَة عَلَى الْكِتَاب السَّابِع", grammarTerm: "التطبيق التدريجي", reveal: "Book 7 applies everything as a spiral — grammar returns through real-world situations: Hajj, trade, masjid. Grammar serves the moment.", hookQuestion: "What do you think 'the applied spiral' means for how you will learn in Book 7?" },
    ],
  },

];

const chapters = specs.map(chapter);
module.exports = { chapters };
