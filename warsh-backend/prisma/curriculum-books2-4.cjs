const LABELS = ["مبتدأ", "خبر", "حرف جر", "مضاف", "مضاف إليه", "فعل", "فاعل", "مفعول"];

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
    titleAr: spec.titleAr,
    description: spec.description,
    worldMapX: Number((0.08 + spec.order * 0.055).toFixed(2)),
    worldMapY: Number((0.12 + (spec.order % 5) * 0.14).toFixed(2)),
    isLocked: spec.order !== 1,
    lessons: spec.focuses.map((focus, index) => makeLesson(spec, index + 1, focus)),
  };
}

const specs = [
  // ── Ch16 ── School and Students ──────────────────────────────────────────
  {
    order: 16,
    sourceFile: "reader_lecture_16_school_students.md",
    title: "School and Students",
    titleAr: "مَدْرَسَة وَطُلَّاب",
    description: "Classroom vocabulary, time markers, and everyday school sentences.",
    hook: { ayahAr: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ", ayahRef: "Al-Alaq 96:1", highlightedWord: "اقْرَأْ" },
    examples: [
      card("هٰذِهِ مَدْرَسَةٌ كَبِيرَةٌ", "This is a large school", "haadhihi madrasatun kabeeratun"),
      card("الأُسْتَاذُ فِي الْفَصْلِ الْيَوْمَ", "The teacher is in the class today", "al-ustaadhu fil-fasli al-yawma"),
      card("الطَّالِبُ يَقْرَأُ الدَّرْسَ", "The student reads the lesson", "at-taalibu yaqra'u ad-darsa"),
      card("ذَهَبْنَا إِلَى الْمَدْرَسَةِ أَمْسِ", "We went to the school yesterday", "dhahabnaa ilal-madrasati amsi"),
    ],
    parseText: "الأُسْتَاذُ فِي الْفَصْلِ",
    parseTokens: [token("الأُسْتَاذُ", "مبتدأ", "the teacher"), token("فِي", "حرف جر", "in"), token("الْفَصْلِ", "مضاف إليه", "the class")],
    conversation: ["أَيْنَ الأُسْتَاذُ؟", "الأُسْتَاذُ فِي الْفَصْلِ الْيَوْمَ"],
    conversationDistractor: "ذَهَبَ إِلَى السُّوقِ",
    distractor: "The pen is on the desk",
    blankDistractor: "أَمْسِ",
    noorTip: "The first word revealed in the Quran was اقْرَأْ — a command to read. That is what school is for.",
    noorTipUr: "قرآن کا پہلا لفظ اقْرَأْ تھا۔ علم حاصل کرنا عبادت ہے۔",
    focuses: [
      { title: "School Place", titleAr: "الْمَدْرَسَة", grammarTerm: "اسم مكان", reveal: "You identified the school as a place of reading, matching the first Quranic command.", hookQuestion: "Why is the first Quranic word a command to read?" },
      { title: "The Teacher", titleAr: "الأُسْتَاذ", grammarTerm: "اسم فاعل", reveal: "You placed the teacher inside the classroom using a preposition phrase.", hookQuestion: "What does فِي tell you about where someone is?" },
      { title: "The Student", titleAr: "الطَّالِب", grammarTerm: "اسم فاعل", reveal: "You saw a student acting on a lesson — a subject doing something.", hookQuestion: "Who is the doer in الطَّالِبُ يَقْرَأُ?" },
      { title: "Lesson and Class", titleAr: "دَرْس وَفَصْل", grammarTerm: "مفردات", reveal: "You connected time markers اليَوْم and أَمْس to locate actions in time.", hookQuestion: "How does أَمْسِ change the meaning of a sentence?" },
    ],
  },

  // ── Ch17 ── Daily Actions and Verbs ──────────────────────────────────────
  {
    order: 17,
    sourceFile: "reader_lecture_17_daily_actions_verbs.md",
    title: "Daily Actions and Verbs",
    titleAr: "أَفْعَال يَوْمِيَّة",
    description: "Past tense verb recognition through daily action vocabulary.",
    hook: { ayahAr: "لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ", ayahRef: "Al-Baqarah 2:286", highlightedWord: "كَسَبَتْ" },
    examples: [
      card("أَكَلَ الْوَلَدُ الطَّعَامَ", "The boy ate the food", "akala al-waladu at-ta'aama"),
      card("قَرَأَتِ الْبِنْتُ الْكِتَابَ", "The girl read the book", "qara'ati al-bintu al-kitaaba"),
      card("كَتَبَ الطَّالِبُ الدَّرْسَ", "The student wrote the lesson", "kataba at-taalibu ad-darsa"),
      card("ذَهَبَتْ فَاطِمَةُ إِلَى الْمَدْرَسَةِ", "Fatimah went to the school", "dhahabat faatimatu ilal-madrasati"),
    ],
    parseText: "كَتَبَ الطَّالِبُ الدَّرْسَ",
    parseTokens: [token("كَتَبَ", "فعل", "wrote"), token("الطَّالِبُ", "فاعل", "the student"), token("الدَّرْسَ", "مفعول", "the lesson")],
    conversation: ["مَاذَا فَعَلَ الْوَلَدُ؟", "أَكَلَ الْوَلَدُ الطَّعَامَ"],
    conversationDistractor: "الأُسْتَاذُ فِي الْفَصْلِ",
    distractor: "The teacher is in the class",
    blankDistractor: "شَرِبَ",
    noorTip: "Every deed is recorded — كَسَبَتْ reminds us that our daily actions carry weight.",
    noorTipUr: "ہر عمل درج ہوتا ہے۔ کَسَبَتْ اور اکْتَسَبَتْ کا فرق سوچیں۔",
    focuses: [
      { title: "He Ate", titleAr: "أَكَلَ", grammarTerm: "فعل ماض", reveal: "You recognised a past tense verb and found the doer after it.", hookQuestion: "Which word tells you the action already happened?" },
      { title: "He Read", titleAr: "قَرَأَ", grammarTerm: "فعل ماض", reveal: "You matched the feminine verb form with a feminine subject.", hookQuestion: "What is the difference between قَرَأَ and قَرَأَتْ?" },
      { title: "He Wrote", titleAr: "كَتَبَ", grammarTerm: "فعل ماض متعدٍّ", reveal: "You saw a verb take an object, making a complete action sentence.", hookQuestion: "What does الدَّرْسَ add after كَتَبَ?" },
      { title: "She Went", titleAr: "ذَهَبَتْ", grammarTerm: "فعل ماض مؤنث", reveal: "You followed a feminine verb with its subject and destination.", hookQuestion: "How does تْ mark the feminine in the verb?" },
    ],
  },

  // ── Ch18 ── Relative Pronouns الَّذِي وَالَّتِي ───────────────────────────
  {
    order: 18,
    sourceFile: "reader_lecture_18_relative_pronouns.md",
    title: "Relative Pronouns: الَّذِي and الَّتِي",
    titleAr: "الَّذِي وَالَّتِي",
    description: "Connecting clauses with the masculine and feminine relative pronouns.",
    hook: { ayahAr: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", ayahRef: "An-Nas 114:5", highlightedWord: "الَّذِي" },
    examples: [
      card("الرَّجُلُ الَّذِي جَاءَ أُسْتَاذٌ", "The man who came is a teacher", "ar-rajulu alladhee jaa'a ustaadh"),
      card("الْبِنْتُ الَّتِي قَرَأَتْ مُجْتَهِدَةٌ", "The girl who read is hardworking", "al-bintu allatee qara'at mujtahida"),
      card("الْكِتَابُ الَّذِي عَلَى الْمَكْتَبِ جَدِيدٌ", "The book that is on the desk is new", "al-kitaabu alladhee alal-maktabi jadeed"),
      card("الْمَدْرَسَةُ الَّتِي ذَهَبْنَا إِلَيْهَا كَبِيرَةٌ", "The school we went to is large", "al-madrasatu allatee dhahabnaa ilayha kabeera"),
    ],
    parseText: "الرَّجُلُ الَّذِي جَاءَ أُسْتَاذٌ",
    parseTokens: [token("الرَّجُلُ", "مبتدأ", "the man"), token("الَّذِي", "مضاف إليه", "who"), token("جَاءَ", "فعل", "came"), token("أُسْتَاذٌ", "خبر", "teacher")],
    conversation: ["مَنِ الرَّجُلُ الَّذِي جَاءَ؟", "الرَّجُلُ الَّذِي جَاءَ أُسْتَاذٌ"],
    conversationDistractor: "أَكَلَ الْوَلَدُ الطَّعَامَ",
    distractor: "The student wrote the lesson",
    blankDistractor: "الَّتِي",
    noorTip: "الَّذِي opens a description of the whisperer in An-Nas — a relative clause that names evil precisely.",
    noorTipUr: "سورۃ الناس میں الَّذِي کے بعد آنے والی صفت پر غور کریں۔",
    focuses: [
      { title: "The One Who (m)", titleAr: "الَّذِي", grammarTerm: "اسم موصول مذكر", reveal: "You connected a masculine noun to a clause that describes it.", hookQuestion: "What does الَّذِي make you wait to hear?" },
      { title: "The One Who (f)", titleAr: "الَّتِي", grammarTerm: "اسم موصول مؤنث", reveal: "You matched the relative pronoun to a feminine noun.", hookQuestion: "Why can't you use الَّذِي for a feminine noun?" },
      { title: "Connecting Clauses", titleAr: "صِلَة الْمَوْصُول", grammarTerm: "صلة الموصول", reveal: "You saw that the clause after الَّذِي must contain a complete idea.", hookQuestion: "What makes a relative clause complete?" },
      { title: "From An-Nas", titleAr: "الَّذِي يُوَسْوِسُ", grammarTerm: "اسم موصول في القرآن", reveal: "You read Quranic Arabic directly, recognising the pattern you just learned.", hookQuestion: "Who is الَّذِي referring to in An-Nas?" },
    ],
  },

  // ── Ch19 ── Attached Pronouns: Singular Possession ───────────────────────
  {
    order: 19,
    sourceFile: "reader_lecture_19_attached_pronouns_singular.md",
    title: "Attached Pronouns: Singular Possession",
    titleAr: "ضَمَائِر الإِفْرَاد الْمُتَّصِلَة",
    description: "My, your, his, her — attaching singular pronouns to nouns.",
    hook: { ayahAr: "لَكُمْ دِينُكُمْ وَلِيَ دِينِ", ayahRef: "Al-Kafirun 109:6", highlightedWord: "دِينِ" },
    examples: [
      card("كِتَابِي جَدِيدٌ", "My book is new", "kitaabee jadeedun"),
      card("بَيْتُكَ كَبِيرٌ", "Your house is large", "baytuka kabeerun"),
      card("قَلَمُهُ عَلَى الْمَكْتَبِ", "His pen is on the desk", "qalamuhoo alal-maktabi"),
      card("مَدْرَسَتُهَا بَعِيدَةٌ", "Her school is far", "madrasatuhaa ba'eedatun"),
    ],
    parseText: "كِتَابِي جَدِيدٌ",
    parseTokens: [token("كِتَابِي", "مبتدأ", "my book"), token("جَدِيدٌ", "خبر", "new")],
    conversation: ["أَيْنَ كِتَابُكَ؟", "كِتَابِي عَلَى الْمَكْتَبِ"],
    conversationDistractor: "الرَّجُلُ الَّذِي جَاءَ أُسْتَاذٌ",
    distractor: "The man who came is a teacher",
    blankDistractor: "بَيْتُهُ",
    noorTip: "Al-Kafirun ends with لِيَ دِينِ — 'my religion' expressed with the attached ي.",
    noorTipUr: "وَلِيَ دِينِ میں یاء ضمیر کو پہچانیں۔",
    focuses: [
      { title: "My + Noun", titleAr: "ـِي", grammarTerm: "ضمير متكلم متصل", reveal: "You attached ي to a noun to express ownership without a separate word.", hookQuestion: "Where is the word 'my' hiding in كِتَابِي?" },
      { title: "Your + Noun", titleAr: "ـُكَ", grammarTerm: "ضمير مخاطب مذكر", reveal: "You switched the ending to address a male listener.", hookQuestion: "What changes when you speak to someone directly?" },
      { title: "His + Noun", titleAr: "ـُهُ", grammarTerm: "ضمير غائب مذكر", reveal: "You expressed his possession with a single ending on the noun.", hookQuestion: "How does هُ point away to a third person?" },
      { title: "Her + Noun", titleAr: "ـُهَا", grammarTerm: "ضمير غائبة مؤنث", reveal: "You completed the singular feminine possession form.", hookQuestion: "What tells you this noun belongs to a female?" },
    ],
  },

  // ── Ch20 ── Attached Pronouns: Plural ────────────────────────────────────
  {
    order: 20,
    sourceFile: "reader_lecture_20_attached_pronouns_plural.md",
    title: "Attached Pronouns: Plural",
    titleAr: "ضَمَائِر الْجَمْع الْمُتَّصِلَة",
    description: "Our, your (plural), their — attaching plural pronouns to nouns.",
    hook: { ayahAr: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", ayahRef: "Al-Fatiha 1:6", highlightedWord: "اهْدِنَا" },
    examples: [
      card("رَبَّنَا اغْفِرْ لَنَا", "Our Lord, forgive us", "rabbanaa ighfir lanaa"),
      card("بَيْتُكُمْ قَرِيبٌ", "Your (pl) house is near", "baytukum qareebun"),
      card("كِتَابُهُمْ عَلَى الطَّاوِلَةِ", "Their (m) book is on the table", "kitaabuhum alat-taawila"),
      card("مَدْرَسَتُهُنَّ جَدِيدَةٌ", "Their (f) school is new", "madrasatuhunna jadeedatun"),
    ],
    parseText: "رَبَّنَا اغْفِرْ لَنَا",
    parseTokens: [token("رَبَّنَا", "مضاف", "our Lord"), token("اغْفِرْ", "فعل", "forgive"), token("لَنَا", "حرف جر", "for us")],
    conversation: ["أَيْنَ كِتَابُكُمْ؟", "كِتَابُنَا عَلَى الطَّاوِلَةِ"],
    conversationDistractor: "مَدْرَسَتُهَا بَعِيدَةٌ",
    distractor: "Her school is far",
    blankDistractor: "كِتَابُهُنَّ",
    noorTip: "اهْدِنَا — guide us — is the most repeated supplication in Islam, using the نَا pronoun.",
    noorTipUr: "اهْدِنَا میں نا جمع متکلم کی ضمیر ہے — ہم سب مل کر مانگتے ہیں۔",
    focuses: [
      { title: "Our + Noun", titleAr: "ـُنَا", grammarTerm: "ضمير المتكلمين", reveal: "You expressed communal ownership with the نا ending.", hookQuestion: "How does رَبَّنَا feel different from رَبِّي?" },
      { title: "Your (pl) + Noun", titleAr: "ـُكُمْ", grammarTerm: "ضمير جمع المخاطب", reveal: "You addressed a group with their shared possession.", hookQuestion: "When do you use كُمْ instead of كَ?" },
      { title: "Their (m) + Noun", titleAr: "ـُهُمْ", grammarTerm: "ضمير جمع الغائب", reveal: "You pointed to a group's possession from a distance.", hookQuestion: "What group does هُمْ represent?" },
      { title: "Their (f) + Noun", titleAr: "ـُهُنَّ", grammarTerm: "ضمير جمع الغائبات", reveal: "You completed the feminine plural possession form.", hookQuestion: "When would you use هُنَّ over هُمْ?" },
    ],
  },

  // ── Ch21 ── Places and Movement ──────────────────────────────────────────
  {
    order: 21,
    sourceFile: "reader_lecture_21_places_movement.md",
    title: "Places and Movement",
    titleAr: "الأَمَاكِن وَالتَّنَقُّل",
    description: "Verbs of movement with prepositions, city and village vocabulary.",
    hook: { ayahAr: "وَاللَّهُ يَعْلَمُ مَا تُسِرُّونَ وَمَا تُعْلِنُونَ", ayahRef: "An-Nahl 16:19", highlightedWord: "يَعْلَمُ" },
    examples: [
      card("ذَهَبَ أَحْمَدُ إِلَى الْمَدِينَةِ", "Ahmad went to the city", "dhahaba ahmadu ilal-madeenat"),
      card("خَرَجَ مِنَ الْبَيْتِ بَاكِرًا", "He left the house early", "kharaja minal-bayti baakiran"),
      card("دَخَلَ الطَّالِبُ الْفَصْلَ", "The student entered the classroom", "dakhala at-talibu al-fasla"),
      card("الْقَرْيَةُ بَعِيدَةٌ عَنِ الْمَدِينَةِ", "The village is far from the city", "al-qaryatu ba'eedatun anil-madeenati"),
    ],
    parseText: "ذَهَبَ أَحْمَدُ إِلَى الْمَدِينَةِ",
    parseTokens: [token("ذَهَبَ", "فعل", "went"), token("أَحْمَدُ", "فاعل", "Ahmad"), token("إِلَى", "حرف جر", "to"), token("الْمَدِينَةِ", "مضاف إليه", "the city")],
    conversation: ["مِنْ أَيْنَ خَرَجَ؟", "خَرَجَ مِنَ الْبَيْتِ"],
    conversationDistractor: "كِتَابُهُمْ عَلَى الطَّاوِلَةِ",
    distractor: "Their book is on the table",
    blankDistractor: "عَنِ",
    noorTip: "Allah knows what we conceal and reveal — يَعْلَمُ shows a present tense verb.",
    noorTipUr: "يَعْلَمُ حال کا فعل ہے — اللہ جانتا ہے، جانتا رہتا ہے۔",
    focuses: [
      { title: "He Went To", titleAr: "ذَهَبَ إِلَى", grammarTerm: "فعل + حرف جر", reveal: "You paired a verb of motion with its direction using إِلَى.", hookQuestion: "What does إِلَى tell you about where Ahmad ended up?" },
      { title: "He Came Out From", titleAr: "خَرَجَ مِنْ", grammarTerm: "فعل + حرف جر", reveal: "You expressed departure from a place using مِنْ.", hookQuestion: "How does مِنْ change the meaning of خَرَجَ?" },
      { title: "He Entered", titleAr: "دَخَلَ", grammarTerm: "فعل ماض", reveal: "You saw that دَخَلَ can take a direct object without a preposition.", hookQuestion: "Why does الْفَصْلَ follow دَخَلَ directly?" },
      { title: "The City and Village", titleAr: "مَدِينَة وَقَرْيَة", grammarTerm: "مفردات مكانية", reveal: "You placed two locations in a relation of distance.", hookQuestion: "What does بَعِيدَةٌ عَنِ describe?" },
    ],
  },

  // ── Ch22 ── Dialogue and Communication ───────────────────────────────────
  {
    order: 22,
    sourceFile: "reader_lecture_22_dialogue_communication.md",
    title: "Dialogue and Communication",
    titleAr: "الْحِوَار وَالتَّوَاصُل",
    description: "Conversation verbs — said, asked, answered, understood.",
    hook: { ayahAr: "وَقُولُوا لِلنَّاسِ حُسْنًا", ayahRef: "Al-Baqarah 2:83", highlightedWord: "قُولُوا" },
    examples: [
      card("قَالَ الأُسْتَاذُ كَلِمَةً حَسَنَةً", "The teacher said a good word", "qaala al-ustaadhu kalimatan hasanatan"),
      card("سَأَلَ الطَّالِبُ سُؤَالًا", "The student asked a question", "sa'ala at-talibu su'aalan"),
      card("أَجَابَتِ الْبِنْتُ بِسُرْعَةٍ", "The girl answered quickly", "ajaabati al-bintu bisur'atin"),
      card("فَهِمَ الطَّالِبُ الدَّرْسَ", "The student understood the lesson", "fahima at-talibu ad-darsa"),
    ],
    parseText: "قَالَ الأُسْتَاذُ كَلِمَةً",
    parseTokens: [token("قَالَ", "فعل", "said"), token("الأُسْتَاذُ", "فاعل", "the teacher"), token("كَلِمَةً", "مفعول", "a word")],
    conversation: ["هَلْ فَهِمْتَ الدَّرْسَ؟", "نَعَمْ، فَهِمْتُ الدَّرْسَ"],
    conversationDistractor: "خَرَجَ مِنَ الْبَيْتِ",
    distractor: "He left the house early",
    blankDistractor: "سَمِعَ",
    noorTip: "قُولُوا لِلنَّاسِ حُسْنًا — speak good to people. Every conversation is a choice.",
    noorTipUr: "لوگوں سے اچھی بات کرو — یہ حکم ہے قرآن کا۔",
    focuses: [
      { title: "He Said", titleAr: "قَالَ", grammarTerm: "فعل قول", reveal: "You used the most frequent speech verb in the Quran.", hookQuestion: "Why does the Quran use قَالَ so often?" },
      { title: "He Asked", titleAr: "سَأَلَ", grammarTerm: "فعل سؤال", reveal: "You paired the asking verb with its object: the question itself.", hookQuestion: "What is the difference between قَالَ and سَأَلَ?" },
      { title: "He Answered", titleAr: "أَجَابَ", grammarTerm: "فعل إجابة", reveal: "You expressed a response, including the manner — quickly.", hookQuestion: "What does بِسُرْعَةٍ add to the verb?" },
      { title: "A Full Exchange", titleAr: "فَهِمَ", grammarTerm: "فعل فهم", reveal: "You completed a full dialogue loop: question, answer, understanding.", hookQuestion: "What happens when فَهِمَ ends the exchange?" },
    ],
  },

  // ── Ch23 ── Grammar Structures Consolidated ───────────────────────────────
  {
    order: 23,
    sourceFile: "reader_lecture_23_book2_consolidation.md",
    title: "Grammar Structures Consolidated",
    titleAr: "مُرَاجَعَة شَامِلَة لِلْكِتَاب الثَّانِي",
    description: "Integration of all Book 2 patterns in connected sentences.",
    hook: { ayahAr: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً", ayahRef: "Al-Baqarah 2:201", highlightedWord: "رَبَّنَا" },
    examples: [
      card("الطَّالِبُ الَّذِي فَهِمَ الدَّرْسَ نَجَحَ", "The student who understood the lesson succeeded", "at-talibu alladhee fahima ad-darsa najaha"),
      card("ذَهَبَتْ إِلَى مَدْرَسَتِهَا بَعْدَ الإِفْطَارِ", "She went to her school after breakfast", "dhahabat ilaa madrasatiha ba'dal-iftaari"),
      card("سَأَلَ الأُسْتَاذُ طُلَّابَهُ أَسْئِلَةً", "The teacher asked his students questions", "sa'ala al-ustaadhu tullaabahu as'ilatan"),
      card("رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً", "Our Lord, give us good in this world", "rabbanaa aatinaa fid-dunyaa hasanatan"),
    ],
    parseText: "ذَهَبَتْ إِلَى مَدْرَسَتِهَا",
    parseTokens: [token("ذَهَبَتْ", "فعل", "she went"), token("إِلَى", "حرف جر", "to"), token("مَدْرَسَتِهَا", "مضاف إليه", "her school")],
    conversation: ["مَاذَا قَالَ الأُسْتَاذُ؟", "سَأَلَ الأُسْتَاذُ طُلَّابَهُ أَسْئِلَةً"],
    conversationDistractor: "فَهِمَ الطَّالِبُ الدَّرْسَ",
    distractor: "The student understood the lesson",
    blankDistractor: "أَجَابَ",
    noorTip: "رَبَّنَا آتِنَا is the traveller's supplication — it uses everything you learned in Book 2.",
    noorTipUr: "یہ دعا Book 2 کے تمام قواعد کو جوڑتی ہے — ربنا، آتنا، حسنة۔",
    focuses: [
      { title: "Nominal Sentence Review", titleAr: "الْجُمْلَة الِاسْمِيَّة", grammarTerm: "جملة اسمية", reveal: "You recognised the subject-predicate pair across complex sentences.", hookQuestion: "Can you still find the مبتدأ in a long sentence?" },
      { title: "Verb + Preposition", titleAr: "فِعْل + حَرْف جَر", grammarTerm: "متعلق بالفعل", reveal: "You tracked how prepositions attach direction and meaning to verbs.", hookQuestion: "What would ذَهَبَتْ mean without إِلَى?" },
      { title: "Pronoun Chains", titleAr: "سِلْسِلَة الضَّمَائِر", grammarTerm: "ضمائر متصلة", reveal: "You saw attached pronouns on verbs, nouns, and prepositions in one passage.", hookQuestion: "Find three different attached pronouns in this chapter's examples." },
      { title: "Reading a Full Passage", titleAr: "قِرَاءَة فَقْرَة", grammarTerm: "نص متكامل", reveal: "You read a Quranic supplication as natural Arabic, not word by word.", hookQuestion: "What makes رَبَّنَا آتِنَا feel complete as a sentence?" },
    ],
  },

  // ── Ch24 ── إِنَّ: Emphasis and Assertion ────────────────────────────────
  {
    order: 24,
    sourceFile: "reader_lecture_24_inna_emphasis.md",
    title: "إِنَّ: Emphasis and Assertion",
    titleAr: "إِنَّ لِلتَّوْكِيد",
    description: "The particle إِنَّ and its sisters for asserting and emphasising meaning.",
    hook: { ayahAr: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", ayahRef: "Al-Kawthar 108:1", highlightedWord: "إِنَّا" },
    examples: [
      card("إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ", "Indeed Allah is Forgiving, Merciful", "inna allaaha ghafoorun raheem"),
      card("إِنَّ الْبَيْتَ كَبِيرٌ", "Indeed the house is large", "innal-bayta kabeer"),
      card("إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", "Indeed We have given you abundance", "innaa a'taynaaka al-kawthar"),
      card("إِنَّ هٰذَا الْقُرْآنَ يَهْدِي", "Indeed this Quran guides", "inna haadhal-qur'aana yahdee"),
    ],
    parseText: "إِنَّ اللَّهَ غَفُورٌ",
    parseTokens: [token("إِنَّ", "حرف جر", "indeed"), token("اللَّهَ", "مفعول", "Allah"), token("غَفُورٌ", "خبر", "forgiving")],
    conversation: ["هَلِ اللَّهُ رَحِيمٌ؟", "نَعَمْ، إِنَّ اللَّهَ رَحِيمٌ"],
    conversationDistractor: "ذَهَبَتْ إِلَى مَدْرَسَتِهَا",
    distractor: "She went to her school",
    blankDistractor: "لَعَلَّ",
    noorTip: "إِنَّا أَعْطَيْنَاكَ — the Divine assertion of gift. إِنَّ removes all doubt.",
    noorTipUr: "إِنَّ یقین دلاتا ہے — شک کی گنجائش نہیں رہتی۔",
    focuses: [
      { title: "إِنَّ Makes It Certain", titleAr: "إِنَّ", grammarTerm: "حرف توكيد", reveal: "You felt the certainty إِنَّ adds before naming the grammar.", hookQuestion: "What changes when you put إِنَّ at the start?" },
      { title: "إِنَّ + Proper Noun", titleAr: "إِنَّ اللَّهَ", grammarTerm: "اسم إن", reveal: "You saw that the noun after إِنَّ takes a fatḥa instead of ḍamma.", hookQuestion: "Why does اللَّهَ carry fatḥa after إِنَّ?" },
      { title: "إِنَّا — Indeed We", titleAr: "إِنَّا", grammarTerm: "إن + نون الوقاية", reveal: "You recognised إِنَّا as إِنَّ with the attached we-pronoun.", hookQuestion: "Who is the 'We' in إِنَّا أَعْطَيْنَاكَ?" },
      { title: "From Al-Kawthar", titleAr: "أَعْطَيْنَاكَ الْكَوْثَرَ", grammarTerm: "إن في القرآن", reveal: "You read the opening of Al-Kawthar as living grammar.", hookQuestion: "What does الْكَوْثَرَ refer to?" },
    ],
  },

  // ── Ch25 ── لَيْسَ: Negating the Nominal Sentence ─────────────────────────
  {
    order: 25,
    sourceFile: "reader_lecture_25_laysa_negation.md",
    title: "لَيْسَ: Negating Nominal Sentences",
    titleAr: "لَيْسَ لِلنَّفْي",
    description: "Using لَيْسَ and لَيْسَتْ to negate nominal sentences.",
    hook: { ayahAr: "لَيْسَ كَمِثْلِهِ شَيْءٌ", ayahRef: "Ash-Shura 42:11", highlightedWord: "لَيْسَ" },
    examples: [
      card("لَيْسَ هٰذَا كِتَابًا", "This is not a book", "laysa haadha kitaaban"),
      card("لَيْسَتِ الْمَدْرَسَةُ بَعِيدَةً", "The school is not far", "laysati al-madrasatu ba'eedatan"),
      card("لَيْسَ الأُسْتَاذُ فِي الْفَصْلِ", "The teacher is not in the class", "laysal-ustaadhu fil-fasli"),
      card("لَيْسَ كَمِثْلِهِ شَيْءٌ", "There is nothing like Him", "laysa kamithlihi shay'un"),
    ],
    parseText: "لَيْسَتِ الْمَدْرَسَةُ بَعِيدَةً",
    parseTokens: [token("لَيْسَتِ", "فعل", "is not"), token("الْمَدْرَسَةُ", "فاعل", "the school"), token("بَعِيدَةً", "خبر", "far")],
    conversation: ["هَلْ هٰذَا كِتَابٌ؟", "لَا، لَيْسَ هٰذَا كِتَابًا"],
    conversationDistractor: "إِنَّ اللَّهَ رَحِيمٌ",
    distractor: "Indeed Allah is merciful",
    blankDistractor: "لَعَلَّ",
    noorTip: "لَيْسَ كَمِثْلِهِ شَيْءٌ is the Quran's unique negation of all comparison for Allah.",
    noorTipUr: "لَيْسَ سے جملہ اسمیہ کی نفی ہوتی ہے — یہ فعل ناقص ہے۔",
    focuses: [
      { title: "It Is Not (m)", titleAr: "لَيْسَ", grammarTerm: "فعل ناقص", reveal: "You negated a masculine nominal sentence with one word.", hookQuestion: "How does لَيْسَ change the sentence structure?" },
      { title: "It Is Not (f)", titleAr: "لَيْسَتْ", grammarTerm: "فعل ناقص مؤنث", reveal: "You matched the negation to a feminine subject.", hookQuestion: "When do you use لَيْسَتْ instead of لَيْسَ?" },
      { title: "Negating a Description", titleAr: "لَيْسَ + خبر", grammarTerm: "خبر لَيْسَ منصوب", reveal: "You saw the predicate of لَيْسَ take a fatḥa ending.", hookQuestion: "Why is بَعِيدَةً with a fatḥa here?" },
      { title: "لَيْسَ in the Quran", titleAr: "لَيْسَ كَمِثْلِهِ شَيْءٌ", grammarTerm: "نفي قرآني", reveal: "You read the most powerful negation in the Quran as grammar you now know.", hookQuestion: "What is being negated in لَيْسَ كَمِثْلِهِ شَيْءٌ?" },
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
module.exports = { chapters };
