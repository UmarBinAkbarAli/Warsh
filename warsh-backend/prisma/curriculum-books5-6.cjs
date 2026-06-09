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

  // ── Ch41 ── Reading Comprehension and Applied Grammar ─────────────────────
  {
    order: 41,
    sourceFile: "reader_lecture_41_reading_comprehension_applied.md",
    title: "Reading Comprehension and Applied Grammar",
    titleAr: "فَهْم الْقِرَاءَة وَتَطْبِيق الْقَوَاعِد",
    description: "Longer reading passages applying all Book 4 grammar in connected Arabic.",
    hook: { ayahAr: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ", ayahRef: "Al-Baqarah 2:3", highlightedWord: "يُؤْمِنُونَ" },
    examples: [
      card("الطَّالِبُ الْمُجْتَهِدُ يَفْهَمُ الدَّرْسَ جَيِّدًا", "The diligent student understands the lesson well", "at-taalibul-mujtahidu yafhamud-darsa jayyidan"),
      card("قَرَأَتِ الطَّالِبَةُ النَّصَّ بِصَوْتٍ عَالٍ", "The female student read the text aloud", "qara'atit-taalibatun-nassa bisawtin aalin"),
      card("فَهِمَ الطُّلَّابُ الْقَاعِدَةَ بَعْدَ التَّكْرَار", "The students understood the rule after repetition", "fahimat-tullaabul-qaa'idata ba'dat-takraar"),
      card("يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ", "They believe in the unseen and establish prayer", "yu'minoona bil-ghaybi wa-yuqeemoonas-salaata"),
    ],
    parseText: "الطَّالِبُ الْمُجْتَهِدُ يَفْهَمُ الدَّرْسَ",
    parseTokens: [token("الطَّالِبُ", "مبتدأ", "the student"), token("الْمُجْتَهِدُ", "نعت", "diligent"), token("يَفْهَمُ", "فعل", "understands"), token("الدَّرْسَ", "مفعول", "the lesson")],
    conversation: ["هَلْ فَهِمْتَ النَّصَّ؟", "نَعَمْ، فَهِمْتُهُ بَعْدَ الْقِرَاءَةِ"],
    conversationDistractor: "لَمْ أَذْهَبْ إِلَى الْمَدْرَسَةِ",
    distractor: "The teacher left the classroom",
    blankDistractor: "يَكْتُبُونَ",
    noorTip: "يُؤْمِنُونَ and يُقِيمُونَ are two present-tense plural verbs carrying the description of the believers.",
    noorTipUr: "یُؤْمِنُونَ اور یُقِیمُونَ — دونوں فعل مضارع جمع ہیں، مؤمنین کی صفت بیان کرتے ہیں۔",
    focuses: [
      { title: "Reading a Full Text", titleAr: "قِرَاءَة نَصّ كَامِل", grammarTerm: "نص متكامل", reveal: "You tracked meaning across a whole paragraph, not just isolated sentences.", hookQuestion: "How do you find the main subject in a long sentence?" },
      { title: "The Diligent Reader", titleAr: "الطَّالِب الْمُجْتَهِد", grammarTerm: "موصوف ونعت", reveal: "You recognised a noun and its adjective working together as the sentence subject.", hookQuestion: "What does الْمُجْتَهِدُ add to الطَّالِبُ?" },
      { title: "Plural Verbs in Context", titleAr: "الأَفْعَال الْجَمْعِيَّة", grammarTerm: "فعل مضارع جمع", reveal: "You saw that plural present-tense verbs carry the weight of describing a whole group.", hookQuestion: "How does يُؤْمِنُونَ differ from يُؤْمِن?" },
      { title: "After Repetition", titleAr: "بَعْدَ التَّكْرَار", grammarTerm: "ظرف زمان", reveal: "You used a time expression to show when understanding occurred.", hookQuestion: "What does بَعْدَ add to فَهِمَ?" },
      { title: "The Believers' Description", titleAr: "وَصْف الْمُؤْمِنِين", grammarTerm: "جملة فعلية وصفية", reveal: "You read the Quranic description of the believers as connected grammar.", hookQuestion: "Name the two actions described in Al-Baqarah 2:3." },
    ],
  },

  // ── Ch42 ── Advanced Questioning and Vocabulary Growth ────────────────────
  {
    order: 42,
    sourceFile: "reader_lecture_42_advanced_questioning.md",
    title: "Advanced Questioning and Vocabulary Growth",
    titleAr: "الِاسْتِفْهَام الْمُتَقَدِّم وَنُمُوُّ الْمُفْرَدَات",
    description: "Complex question patterns and vocabulary expansion through Q&A.",
    hook: { ayahAr: "وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا", ayahRef: "Al-Isra 17:85", highlightedWord: "الْعِلْمِ" },
    examples: [
      card("كَمْ كِتَابًا قَرَأْتَ هَذَا الشَّهْرَ؟", "How many books did you read this month?", "kam kitaaban qara'ta hadhas-shahr"),
      card("مَتَى وَصَلَ الأُسْتَاذُ إِلَى الْمَدِينَةِ؟", "When did the teacher arrive at the city?", "mataa wasalal-ustaadhu ilal-madeena"),
      card("لِمَاذَا تَدْرُسُ الْعَرَبِيَّةَ كُلَّ يَوْمٍ؟", "Why do you study Arabic every day?", "limaadha tadrusul-arabiyyata kulla yawm"),
      card("كَيْفَ تَفْهَمُ الْقُرْآنَ بِالْعَرَبِيَّةِ؟", "How do you understand the Quran in Arabic?", "kayfa tafhamul-qur'aana bil-arabiyya"),
    ],
    parseText: "لِمَاذَا تَدْرُسُ الْعَرَبِيَّةَ",
    parseTokens: [token("لِمَاذَا", "حرف جر", "why"), token("تَدْرُسُ", "فعل", "you study"), token("الْعَرَبِيَّةَ", "مفعول", "Arabic")],
    conversation: ["لِمَاذَا تَتَعَلَّمُ الْعَرَبِيَّةَ؟", "أَتَعَلَّمُهَا لِفَهْمِ الْقُرْآنِ"],
    conversationDistractor: "الطَّالِبُ يَقْرَأُ النَّصَّ",
    distractor: "The student reads the text",
    blankDistractor: "أَيْنَ",
    noorTip: "The Quran reminds us that human knowledge is small — لِمَاذَا we seek it matters most.",
    noorTipUr: "انسان کا علم بہت محدود ہے — ہم جو پوچھتے ہیں وہ ہماری نیت ظاہر کرتا ہے۔",
    focuses: [
      { title: "How Many?", titleAr: "كَمْ", grammarTerm: "اسم الاستفهام", reveal: "You counted things with كَمْ, which always takes a singular accusative noun after it.", hookQuestion: "What case does the noun after كَمْ take?" },
      { title: "When?", titleAr: "مَتَى", grammarTerm: "ظرف زمان استفهامي", reveal: "You asked about the time of an action with this time-interrogative.", hookQuestion: "What is the difference between مَتَى and أَيْنَ?" },
      { title: "Why?", titleAr: "لِمَاذَا", grammarTerm: "حرف جر + اسم استفهام", reveal: "You saw that لِمَاذَا is actually لِ (for) + مَاذَا, asking for the purpose.", hookQuestion: "What is the literal breakdown of لِمَاذَا?" },
      { title: "How?", titleAr: "كَيْفَ", grammarTerm: "اسم الاستفهام", reveal: "You asked about manner with كَيْفَ — a question that demands description.", hookQuestion: "What kind of answer does كَيْفَ expect?" },
      { title: "Knowledge Is Limited", titleAr: "الْعِلْمُ قَلِيل", grammarTerm: "نعت", reveal: "You read a Quranic statement that frames the purpose of all questioning.", hookQuestion: "What does إِلَّا قَلِيلًا tell us about human knowledge?" },
    ],
  },

  // ── Ch43 ── Integrated Arabic Usage & Book 4 Bridge ──────────────────────
  {
    order: 43,
    sourceFile: "reader_lecture_43_book4_bridge.md",
    title: "Integrated Arabic Usage and Book 4 Bridge",
    titleAr: "اسْتِخْدَام الْعَرَبِيَّة الْمُتَكَامِل وَجِسْر الْكِتَاب الرَّابِع",
    description: "Merging all Book 4 grammar in preparation for Book 5 verb mastery.",
    hook: { ayahAr: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا", ayahRef: "Al-Imran 3:8", highlightedWord: "هَدَيْتَنَا" },
    examples: [
      card("يَدْرُسُ الطَّالِبُ الْعَرَبِيَّةَ كُلَّ صَبَاحٍ", "The student studies Arabic every morning", "yadrusut-taalibu arabiyyata kulla sabaahin"),
      card("كَتَبَتِ الْبِنْتُ رِسَالَةً إِلَى أُمِّهَا", "The girl wrote a letter to her mother", "katabaatil-bintu risaalatan ilaa ummiha"),
      card("سَيَذْهَبُ الأُسْتَاذُ إِلَى الْمَسْجِدِ غَدًا", "The teacher will go to the mosque tomorrow", "sayadhhabul-ustaadhu ilal-masjidi ghadan"),
      card("رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا", "Our Lord, do not let our hearts deviate after You have guided us", "rabbanaa laa tuzigh quluubanaa ba'da idh hadaytanaa"),
    ],
    parseText: "سَيَذْهَبُ الأُسْتَاذُ إِلَى الْمَسْجِدِ",
    parseTokens: [token("سَيَذْهَبُ", "فعل", "will go"), token("الأُسْتَاذُ", "فاعل", "the teacher"), token("إِلَى", "حرف جر", "to"), token("الْمَسْجِدِ", "مضاف إليه", "the mosque")],
    conversation: ["مَاذَا سَتَفْعَلُ غَدًا؟", "سَأَذْهَبُ إِلَى الْمَسْجِدِ"],
    conversationDistractor: "لِمَاذَا تَدْرُسُ الْعَرَبِيَّةَ؟",
    distractor: "Why do you study Arabic?",
    blankDistractor: "يَنَامُ",
    noorTip: "هَدَيْتَنَا is a past tense verb with an attached pronoun — You (Allah) guided us.",
    noorTipUr: "ہَدَیْتَنَا میں فعل ماضی اور ضمیر دونوں ہیں — تو نے ہمیں ہدایت دی۔",
    focuses: [
      { title: "Every Morning", titleAr: "كُلَّ صَبَاحٍ", grammarTerm: "ظرف زمان", reveal: "You used كُلَّ with a noun to express regularity of the action.", hookQuestion: "What does كُلَّ صَبَاحٍ tell you about the habit?" },
      { title: "A Letter to Her Mother", titleAr: "رِسَالَة إِلَى أُمِّهَا", grammarTerm: "مفعول + جار ومجرور", reveal: "You followed a verb with both its direct object and a prepositional phrase.", hookQuestion: "What are the two things that follow كَتَبَتْ?" },
      { title: "Tomorrow With سَ", titleAr: "سَيَذْهَبُ غَدًا", grammarTerm: "فعل مضارع + سَ", reveal: "You combined the future marker with an explicit time adverb — both point forward.", hookQuestion: "If سَ already means future, why add غَدًا?" },
      { title: "The Du'a of Steadfastness", titleAr: "لَا تُزِغْ قُلُوبَنَا", grammarTerm: "لا الناهية + فعل مضارع مجزوم", reveal: "You read a complete Quranic supplication using prohibition grammar (لَا + jussive).", hookQuestion: "What does لَا تُزِغْ ask Allah not to do?" },
    ],
  },

  // ── Ch44 ── لَمْ and لَمَّا — Negating the Past via the Present ──────────
  {
    order: 44,
    sourceFile: "reader_lecture_44_lam_lamma.md",
    title: "لَمْ and لَمَّا — Negating Past Action",
    titleAr: "لَمْ وَلَمَّا لِنَفْيِ الْمَاضِي",
    description: "Using لَمْ and لَمَّا with the jussive present tense to negate past actions.",
    hook: { ayahAr: "لَمْ يَلِدْ وَلَمْ يُولَدْ", ayahRef: "Al-Ikhlas 112:3", highlightedWord: "لَمْ" },
    examples: [
      card("لَمْ يَذْهَبِ الطَّالِبُ إِلَى الْمَدْرَسَةِ", "The student did not go to school", "lam yadhhabit-taalibuu ilal-madrasa"),
      card("لَمْ تَفْهَمِ الْبِنْتُ الدَّرْسَ", "The girl did not understand the lesson", "lam tafhamil-bintu ad-darsa"),
      card("لَمَّا يَصِلِ الأُسْتَاذُ بَعْدُ", "The teacher has not arrived yet", "lammaa yasalil-ustaadhu ba'd"),
      card("لَمْ يَلِدْ وَلَمْ يُولَدْ", "He did not beget, nor was He begotten", "lam yalid wa lam yoolad"),
    ],
    parseText: "لَمْ يَذْهَبِ الطَّالِبُ إِلَى الْمَدْرَسَةِ",
    parseTokens: [token("لَمْ", "حرف جر", "did not"), token("يَذْهَبِ", "فعل", "go"), token("الطَّالِبُ", "فاعل", "the student"), token("إِلَى", "حرف جر", "to"), token("الْمَدْرَسَةِ", "مضاف إليه", "school")],
    conversation: ["هَلْ وَصَلَ الأُسْتَاذُ؟", "لَا، لَمَّا يَصِلْ بَعْدُ"],
    conversationDistractor: "سَيَذْهَبُ إِلَى الْمَسْجِدِ",
    distractor: "He will go to the mosque",
    blankDistractor: "لَنْ",
    noorTip: "لَمْ يَلِدْ وَلَمْ يُولَدْ — two negations with لَمْ that together define the uniqueness of Allah.",
    noorTipUr: "لَمْ يَلِدْ وَلَمْ يُولَدْ — سورۃ الاخلاص کے یہ دو جملے اللہ کی انفرادیت بیان کرتے ہیں۔",
    focuses: [
      { title: "لَمْ — Did Not", titleAr: "لَمْ", grammarTerm: "حرف جزم للنفي", reveal: "You negated a past action using لَمْ + a present-tense verb, but the meaning flips to past.", hookQuestion: "Why does لَمْ use a present-tense verb form to mean the past?" },
      { title: "The Verb After لَمْ", titleAr: "الْفِعْل بَعْدَ لَمْ", grammarTerm: "فعل مضارع مجزوم", reveal: "You saw that the final vowel of the verb changes — it becomes مجزوم (sukoon ending).", hookQuestion: "What happens to the verb's ending after لَمْ?" },
      { title: "لَمَّا — Not Yet", titleAr: "لَمَّا", grammarTerm: "حرف نفي وجزم", reveal: "You distinguished لَمَّا from لَمْ — لَمَّا implies the action might still happen.", hookQuestion: "How does the meaning of لَمَّا يَصِلْ differ from لَمْ يَصِلْ?" },
      { title: "Al-Ikhlas Unlocked", titleAr: "لَمْ يَلِدْ وَلَمْ يُولَدْ", grammarTerm: "نفي بلَمْ في القرآن", reveal: "You can now parse the central verse of Al-Ikhlas as living grammar.", hookQuestion: "What is the grammatical difference between يَلِدْ and يُولَدْ?" },
      { title: "He Did Not", titleAr: "لَمْ يَفْعَلْ", grammarTerm: "بناء الجملة النافية", reveal: "You assembled the full negative sentence: لَمْ + jussive verb + subject + complement.", hookQuestion: "What three parts does every لَمْ sentence need?" },
      { title: "Nor Was He", titleAr: "وَلَمْ يُولَدْ", grammarTerm: "فعل مبني للمجهول مجزوم", reveal: "You parsed a passive jussive verb — the subject receives the action rather than doing it.", hookQuestion: "What is the difference between يَلِدْ (active) and يُولَدْ (passive)?" },
    ],
  },

  // ── Ch45 ── The Three States of المضارع (Foundation) ─────────────────────
  {
    order: 45,
    sourceFile: "reader_lecture_45_mudaari_three_states.md",
    title: "The Three States of the Present Tense",
    titleAr: "أَحْوَال الْمُضَارِع الثَّلَاثَة",
    description: "The present tense in its three states: مرفوع, منصوب, and مجزوم.",
    hook: { ayahAr: "لَنْ تَنَالُوا الْبِرَّ حَتَّى تُنفِقُوا مِمَّا تُحِبُّونَ", ayahRef: "Al-Imran 3:92", highlightedWord: "تُنفِقُوا" },
    examples: [
      card("يَدْرُسُ الطَّالِبُ كُلَّ يَوْمٍ", "The student studies every day (مرفوع)", "yadrusu taalibu kulla yawm"),
      card("لَنْ يَدْرُسَ الطَّالِبُ اليَوْمَ", "The student will never study today (منصوب)", "lan yadrusaa taalibuu al-yawm"),
      card("لَمْ يَدْرُسِ الطَّالِبُ أَمْسِ", "The student did not study yesterday (مجزوم)", "lam yadrusu taalibuu amsi"),
      card("لَنْ تَنَالُوا الْبِرَّ حَتَّى تُنفِقُوا", "You will never attain righteousness until you spend", "lan tanaaloo al-birra hattaa tunfiqoo"),
    ],
    parseText: "لَنْ يَدْرُسَ الطَّالِبُ اليَوْمَ",
    parseTokens: [token("لَنْ", "حرف جر", "will never"), token("يَدْرُسَ", "فعل", "study"), token("الطَّالِبُ", "فاعل", "the student"), token("اليَوْمَ", "ظرف زمان", "today")],
    conversation: ["هَلْ سَيَدْرُسُ اليَوْمَ؟", "لَا، لَنْ يَدْرُسَ اليَوْمَ"],
    conversationDistractor: "لَمَّا يَصِلِ الأُسْتَاذُ",
    distractor: "The teacher has not arrived yet",
    blankDistractor: "لَا",
    noorTip: "تُنفِقُوا after حَتَّى is in منصوب — the condition that must be met.",
    noorTipUr: "حَتَّى کے بعد تُنفِقُوا منصوب ہے — شرط کا اظہار کرتا ہے۔",
    focuses: [
      { title: "مرفوع — The Default State", titleAr: "الْمُضَارِع الْمَرْفُوع", grammarTerm: "فعل مضارع مرفوع", reveal: "You saw the present tense in its normal, unmarked state — no triggering particle.", hookQuestion: "When does a present-tense verb stay in مرفوع?" },
      { title: "لَنْ Triggers منصوب", titleAr: "الْمُضَارِع الْمَنْصُوب", grammarTerm: "فعل مضارع منصوب", reveal: "The particle لَنْ (never) pulls the verb into منصوب — a fatḥa appears on the verb's ending.", hookQuestion: "What does the fatḥa ending signal about the verb's state?" },
      { title: "لَمْ Triggers مجزوم", titleAr: "الْمُضَارِع الْمَجْزُوم", grammarTerm: "فعل مضارع مجزوم", reveal: "The particle لَمْ (did not) pulls the verb into مجزوم — the ending loses its vowel (sukoon).", hookQuestion: "What does the sukoon ending tell you about which particle triggered it?" },
      { title: "The Particle Chart", titleAr: "جَدْوَل الأَدَوَات", grammarTerm: "نواصب وجوازم", reveal: "You mapped three particle groups to three states: no particle (مرفوع), nasb-triggers (منصوب), jazm-triggers (مجزوم).", hookQuestion: "Name one particle from each of the three groups." },
      { title: "حَتَّى Triggers منصوب", titleAr: "حَتَّى لِلنَّصْب", grammarTerm: "حرف ناصب", reveal: "You saw حَتَّى (until/so that) among the particles that trigger منصوب — it sets a goal or condition.", hookQuestion: "What condition does حَتَّى set in لَنْ تَنَالُوا الْبِرَّ حَتَّى تُنفِقُوا?" },
      { title: "One Verb, Three Endings", titleAr: "فِعْل وَاحِد بِثَلَاثَة نِهَايَات", grammarTerm: "تصريف الأحوال الثلاثة", reveal: "You conjugated a single verb root in all three states, seeing exactly how the ending changes each time.", hookQuestion: "Write يَدْرُس in مرفوع, منصوب, and مجزوم." },
    ],
  },

  // ── Ch46 ── The Three States of المضارع (Application) ───────────────────
  {
    order: 46,
    sourceFile: "reader_lecture_46_mudaari_application.md",
    title: "The Three States — Recognition and Parsing",
    titleAr: "تَطْبِيق أَحْوَال الْمُضَارِع الثَّلَاثَة",
    description: "Parsing present-tense verbs by state — identifying trigger particles across Quranic text.",
    hook: { ayahAr: "تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ", ayahRef: "Al-Masad 111:1", highlightedWord: "تَبَّتْ" },
    examples: [
      card("أُرِيدُ أَنْ أَفْهَمَ الْقُرْآنَ", "I want to understand the Quran (أَنْ + منصوب)", "ureedo an afhama al-qur'aan"),
      card("لَا تَكْذِبْ أَبَدًا", "Do not lie ever (لَا الناهية + مجزوم)", "laa takdhib abadan"),
      card("يَجِبُ أَنْ نَتَعَلَّمَ الْعَرَبِيَّةَ", "We must learn Arabic (أَنْ + منصوب)", "yajibu an nata'allama al-arabiyya"),
      card("تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ", "Ruined were the hands of Abu Lahab and ruined is he", "tabbat yadaa abee lahabin wa tabb"),
    ],
    parseText: "أُرِيدُ أَنْ أَفْهَمَ الْقُرْآنَ",
    parseTokens: [token("أُرِيدُ", "فعل", "I want"), token("أَنْ", "حرف جر", "to"), token("أَفْهَمَ", "فعل", "understand"), token("الْقُرْآنَ", "مفعول", "the Quran")],
    conversation: ["مَاذَا تُرِيدُ؟", "أُرِيدُ أَنْ أَفْهَمَ الْقُرْآنَ"],
    conversationDistractor: "لَمْ أَذْهَبْ أَمْسِ",
    distractor: "I did not go yesterday",
    blankDistractor: "لَنْ",
    noorTip: "تَبَّتْ is a past tense verb meaning 'perished' — Al-Masad's grammar is now yours to parse.",
    noorTipUr: "تَبَّتْ فعل ماضی ہے — ابو لہب کے ہاتھ خسارے میں رہے۔ اب آپ اس کو پارس کر سکتے ہیں۔",
    focuses: [
      { title: "أَنْ Triggers منصوب", titleAr: "أَنْ الناصبة", grammarTerm: "حرف مصدري ناصب", reveal: "You saw أَنْ turning the following verb into منصوب — it makes the verb work like a noun.", hookQuestion: "What does أَنْ أَفْهَمَ literally mean if you translate أَنْ + verb as a noun?" },
      { title: "لَا الناهية — Prohibition", titleAr: "لَا النَّاهِيَة", grammarTerm: "حرف جزم للنهي", reveal: "You used لَا with the jussive to prohibit an action — a command not to do.", hookQuestion: "How is لَا النَّاهِيَة different from لَا النَّافِيَة (simple negation)?" },
      { title: "Identifying the State", titleAr: "تَحْدِيد الْحَالَة", grammarTerm: "تمييز الأحوال", reveal: "You practised identifying a verb's state by looking backwards to find the trigger particle.", hookQuestion: "What is your first step when parsing a present-tense verb?" },
      { title: "Al-Masad's Verbs", titleAr: "أَفْعَال سُورَة الْمَسَد", grammarTerm: "فعل ماض", reveal: "You read Surah Al-Masad and identified its verb types — past tense, not present.", hookQuestion: "Are the verbs in Al-Masad past or present? What tells you?" },
      { title: "Must + Verb (يَجِبُ أَنْ)", titleAr: "يَجِبُ أَنْ", grammarTerm: "فعل + حرف ناصب", reveal: "You constructed a modal expression: a main verb of obligation followed by أَنْ + منصوب verb.", hookQuestion: "How would you say 'You must read' using يَجِبُ أَنْ?" },
    ],
  },

  // ── Ch47 ── Sound Masculine Plural — Full Treatment ───────────────────────
  {
    order: 47,
    sourceFile: "reader_lecture_47_sound_masc_plural.md",
    title: "Sound Masculine Plural — Full Treatment",
    titleAr: "جَمْع الْمُذَكَّر السَّالِم الْكَامِل",
    description: "Sound masculine plural in all three cases: nominative, accusative/genitive with ين.",
    hook: { ayahAr: "الْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ بَعْضُهُمْ أَوْلِيَاءُ بَعْضٍ", ayahRef: "At-Tawbah 9:71", highlightedWord: "الْمُؤْمِنُونَ" },
    examples: [
      card("الْمُسْلِمُونَ يُصَلُّونَ خَمْسَ مَرَّاتٍ", "The Muslims pray five times (nominative: ون)", "al-muslimoona yusalloona khams marraat"),
      card("رَأَيْتُ الْمُسْلِمِينَ فِي الْمَسْجِدِ", "I saw the Muslims in the mosque (genitive/acc: ين)", "ra'aytu al-muslimiina fil-masjid"),
      card("سَلَّمْتُ عَلَى الْمُؤْمِنِينَ", "I greeted the believers (genitive: ين)", "sallamt alal-mu'miniina"),
      card("الْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ بَعْضُهُمْ أَوْلِيَاءُ بَعْضٍ", "The believing men and women are friends of one another", "al-mu'minoona wal-mu'minaatu ba'duhum awliyaa'u ba'd"),
    ],
    parseText: "الْمُسْلِمُونَ يُصَلُّونَ خَمْسَ مَرَّاتٍ",
    parseTokens: [token("الْمُسْلِمُونَ", "مبتدأ", "the Muslims"), token("يُصَلُّونَ", "فعل", "pray"), token("خَمْسَ", "مفعول", "five"), token("مَرَّاتٍ", "مضاف إليه", "times")],
    conversation: ["أَيْنَ الْمُؤْمِنُونَ؟", "هُمْ فِي الْمَسْجِدِ"],
    conversationDistractor: "أُرِيدُ أَنْ أَفْهَمَ الْقُرْآنَ",
    distractor: "I want to understand the Quran",
    blankDistractor: "الطُّلَّاب",
    noorTip: "الْمُؤْمِنُونَ is in nominative (ون) — as the subject of the sentence.",
    noorTipUr: "الْمُؤْمِنُونَ مرفوع ہے — جملے کا مبتدأ ہے۔ ون → ین کی تبدیلی حالت کے ساتھ ہوتی ہے۔",
    focuses: [
      { title: "Nominative: ـُونَ", titleAr: "الْمُذَكَّر السَّالِم مَرْفُوع", grammarTerm: "جمع مذكر سالم مرفوع", reveal: "You identified the ـُونَ ending as the signal for nominative — the plural is in subject position.", hookQuestion: "Which grammatical role does ـُونَ signal?" },
      { title: "Accusative/Genitive: ـِينَ", titleAr: "الْمُذَكَّر السَّالِم مَنْصُوب/مَجْرُور", grammarTerm: "جمع مذكر سالم منصوب", reveal: "You saw ـِينَ replace ـُونَ when the plural is an object or follows a preposition.", hookQuestion: "Why does الْمُسْلِمِينَ use ين instead of ون?" },
      { title: "The ن Drops in Idafa", titleAr: "حَذْف النُّون فِي الإِضَافَة", grammarTerm: "حذف النون", reveal: "You saw that the final ن disappears when the plural enters an idafa — مُسْلِمُو الْبَلَدِ.", hookQuestion: "What happens to الْمُسْلِمُونَ when it becomes the first word of an idafa?" },
      { title: "Men and Women Together", titleAr: "الْمُؤْمِنُونَ وَالْمُؤْمِنَات", grammarTerm: "جمع مذكر وجمع مؤنث", reveal: "You read the Quranic verse that pairs the masculine and feminine plurals as a community.", hookQuestion: "What is the feminine equivalent of الْمُؤْمِنُونَ?" },
    ],
  },

  // ── Ch48 ── Time, Numbers, and Measurements ───────────────────────────────
  {
    order: 48,
    sourceFile: "reader_lecture_48_time_numbers.md",
    title: "Time, Numbers, and Measurements",
    titleAr: "الْوَقْت وَالأَعْدَاد وَالْمَقَايِيس",
    description: "Telling time, numbers 1–100, months, and measurement vocabulary.",
    hook: { ayahAr: "إِنَّ عِدَّةَ الشُّهُورِ عِنْدَ اللَّهِ اثْنَا عَشَرَ شَهْرًا", ayahRef: "At-Tawbah 9:36", highlightedWord: "اثْنَا عَشَرَ" },
    examples: [
      card("الصَّلَاةُ خَمْسُ مَرَّاتٍ فِي الْيَوْمِ", "Prayer is five times in the day", "as-salaatu khamsu marraaatin fil-yawm"),
      card("فِي السَّنَةِ اثْنَا عَشَرَ شَهْرًا", "In the year there are twelve months", "fis-sanati ithna 'ashara shahran"),
      card("الصَّوْمُ ثَلَاثُونَ يَوْمًا أَوْ تِسْعَة وَعِشْرُونَ", "The fast is thirty days or twenty-nine", "as-sawmu thalaathoona yawman aw tis'atun wa 'ishroon"),
      card("الْوَقْتُ كَالسَّيْفِ إِنْ لَمْ تَقْطَعْهُ قَطَعَكَ", "Time is like a sword — if you do not cut it, it cuts you", "al-waqtu kas-sayfi in lam taqta'hu qata'ak"),
    ],
    parseText: "فِي السَّنَةِ اثْنَا عَشَرَ شَهْرًا",
    parseTokens: [token("فِي", "حرف جر", "in"), token("السَّنَةِ", "مضاف إليه", "the year"), token("اثْنَا عَشَرَ", "مبتدأ", "twelve"), token("شَهْرًا", "تمييز", "months")],
    conversation: ["كَمْ شَهْرًا فِي السَّنَةِ؟", "فِي السَّنَةِ اثْنَا عَشَرَ شَهْرًا"],
    conversationDistractor: "الْمُسْلِمُونَ يُصَلُّونَ خَمْسًا",
    distractor: "The Muslims pray five times",
    blankDistractor: "عِشْرُونَ",
    noorTip: "Allah counted the months at twelve — numbers in Arabic carry grammatical gender that flips against the noun.",
    noorTipUr: "عربی میں اعداد کی جنس اسم کی جنس سے الٹی ہوتی ہے — یہ عربی کا مشہور قاعدہ ہے۔",
    focuses: [
      { title: "Numbers 1–10", titleAr: "الأَعْدَاد ١-١٠", grammarTerm: "أعداد مفردة", reveal: "You met the basic Arabic numerals and their gender rule — the number's gender flips against the noun it counts.", hookQuestion: "Why does ثَلَاثَة go with مَسَاجِد (masc) and ثَلَاث go with كُتُب (fem)?" },
      { title: "11–99 and Tamyeez", titleAr: "الأَعْدَاد ١١-٩٩", grammarTerm: "عدد + تمييز منصوب", reveal: "You saw that numbers 11–99 are followed by a singular indefinite accusative noun — the تَمْيِيز.", hookQuestion: "What case does the noun after عِشْرُونَ take?" },
      { title: "Time Expressions", titleAr: "تَعْبِيرَات الْوَقْت", grammarTerm: "ظروف الزمان", reveal: "You named the units of time in Arabic and used them in sentences.", hookQuestion: "What is the Arabic for hour, day, month, and year?" },
      { title: "The Twelve Months", titleAr: "اثْنَا عَشَرَ شَهْرًا", grammarTerm: "عدد مركب", reveal: "You parsed the Quranic verse that names the twelve months — a compound number followed by its tamyeez.", hookQuestion: "In إِنَّ عِدَّةَ الشُّهُورِ اثْنَا عَشَرَ شَهْرًا, what role does شَهْرًا play?" },
    ],
  },

  // ── Ch49 ── Advanced Sentence Construction ────────────────────────────────
  {
    order: 49,
    sourceFile: "reader_lecture_49_advanced_sentences.md",
    title: "Advanced Sentence Construction",
    titleAr: "بِنَاء الْجُمَل الْمُتَقَدِّمَة",
    description: "Complex multi-clause Arabic sentences with embedded verbal and nominal structures.",
    hook: { ayahAr: "كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ", ayahRef: "Al-Imran 3:110", highlightedWord: "أُخْرِجَتْ" },
    examples: [
      card("الطَّالِبُ الَّذِي يَجْتَهِدُ يَنَالُ الْعِلْمَ", "The student who works hard attains knowledge", "at-taalibuu alladhee yajtahidu yanaalul-'ilm"),
      card("قَرَأْتُ الْكِتَابَ الَّذِي أَعْطَيْتَنِي إِيَّاهُ", "I read the book that you gave me", "qara'tul-kitaaba alladhee a'taytanee iyyaah"),
      card("مَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ", "Whoever does an atom's weight of good will see it", "man ya'mal mithqala dharratin khayran yarah"),
      card("كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ", "You are the best community brought forth for mankind", "kuntum khayra ummatin ukhrijat lin-naas"),
    ],
    parseText: "الطَّالِبُ الَّذِي يَجْتَهِدُ يَنَالُ الْعِلْمَ",
    parseTokens: [token("الطَّالِبُ", "مبتدأ", "the student"), token("الَّذِي", "موصول", "who"), token("يَجْتَهِدُ", "فعل", "works hard"), token("يَنَالُ", "خبر", "attains"), token("الْعِلْمَ", "مفعول", "knowledge")],
    conversation: ["مَنْ يَنَالُ الْعِلْمَ؟", "الطَّالِبُ الَّذِي يَجْتَهِدُ يَنَالُ الْعِلْمَ"],
    conversationDistractor: "فِي السَّنَةِ اثْنَا عَشَرَ شَهْرًا",
    distractor: "There are twelve months in the year",
    blankDistractor: "الَّتِي",
    noorTip: "أُخْرِجَتْ is a passive past verb — the community was brought out, not bringing itself.",
    noorTipUr: "أُخْرِجَتْ مجہول ماضی ہے — امت کو نکالا گیا، یہ اللہ کی طرف سے بعثت ہے۔",
    focuses: [
      { title: "Relative Clause as Subject", titleAr: "الصِّلَة فِي الْجُمْلَة", grammarTerm: "اسم موصول + صلة", reveal: "You embedded a relative clause inside the subject — الَّذِي يَجْتَهِدُ describes the student.", hookQuestion: "What does الَّذِي yجتهد add to the meaning of الطَّالِبُ?" },
      { title: "The Passive Voice", titleAr: "الْمَبْنِيّ لِلْمَجْهُول", grammarTerm: "فعل مجهول", reveal: "You identified a passive verb — the subject receives the action rather than performing it.", hookQuestion: "How do you recognise a passive verb in Arabic?" },
      { title: "مَنْ as Condition", titleAr: "مَنْ الشَّرْطِيَّة", grammarTerm: "اسم شرط", reveal: "You saw مَنْ used not as a question (who?) but as a condition (whoever).", hookQuestion: "What is the difference between interrogative مَنْ and conditional مَنْ?" },
      { title: "Reading Complex Ayah", titleAr: "قِرَاءَة آيَة مُرَكَّبَة", grammarTerm: "تحليل الجملة", reveal: "You parsed كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ — a nominal sentence with كَانَ, an idafa, and a passive relative clause.", hookQuestion: "Name the three grammatical layers in كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ." },
    ],
  },

  // ── Ch50 ── Reading Comprehension and Dialogue Expansion ──────────────────
  {
    order: 50,
    sourceFile: "reader_lecture_50_reading_dialogue.md",
    title: "Reading Comprehension and Dialogue Expansion",
    titleAr: "فَهْم الْمَقْرُوء وَتَوَسُّع الْحِوَار",
    description: "Extended dialogues and connected reading passages for comprehension practice.",
    hook: { ayahAr: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ", ayahRef: "Al-Baqarah 2:186", highlightedWord: "قَرِيبٌ" },
    examples: [
      card("سَأَلَ الرَّجُلُ عَنِ الطَّرِيقِ فَأَجَابَهُ الشَّيْخُ", "The man asked about the road so the shaykh answered him", "sa'alal-rajulu anit-tareeqi fa-ajaabahush-shaykh"),
      card("قَالَ الأُسْتَاذُ إِنَّ الدَّرْسَ سَهْلٌ", "The teacher said that the lesson is easy", "qaalal-ustaadhu innad-darsa sahl"),
      card("وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ", "When My servants ask about Me, I am near", "wa-idha sa'alaka ibaadee 'annee fa-innee qareeb"),
      card("أَجَابَ بِكُلِّ وُضُوحٍ وَلَمْ يَتَرَدَّدْ", "He answered with full clarity and did not hesitate", "ajaaba bikulli wudoohin wa lam yataraddad"),
    ],
    parseText: "قَالَ إِنَّ الدَّرْسَ سَهْلٌ",
    parseTokens: [token("قَالَ", "فعل", "said"), token("إِنَّ", "حرف جر", "that"), token("الدَّرْسَ", "اسم إن", "the lesson"), token("سَهْلٌ", "خبر", "easy")],
    conversation: ["هَلِ اللَّهُ بَعِيدٌ؟", "لَا، إِنَّهُ قَرِيبٌ يُجِيبُ دَعْوَةَ الدَّاعِي"],
    conversationDistractor: "الطَّالِبُ الَّذِي يَجْتَهِدُ يَنَالُ الْعِلْمَ",
    distractor: "The hardworking student attains knowledge",
    blankDistractor: "سَمِعَ",
    noorTip: "قَرِيبٌ — Allah is near. This verse answers the question before the servant even finishes asking.",
    noorTipUr: "اللہ قریب ہے — جب بندہ سوال کرتا ہے تو جواب پہلے سے موجود ہے۔",
    focuses: [
      { title: "فَ — Then / So", titleAr: "الفَاء الْعَطْفِيَّة", grammarTerm: "واو العطف / فاء التعقيب", reveal: "You saw فَ chaining two events where the second follows immediately from the first.", hookQuestion: "What does the فَ between سَأَلَ and أَجَابَ tell you about sequence?" },
      { title: "قَالَ + إِنَّ (Reported Speech)", titleAr: "الْقَوْل + إِنَّ", grammarTerm: "فعل قول + حرف توكيد", reveal: "You used قَالَ followed by إِنَّ to report what someone said — the Arabic equivalent of 'that' in reported speech.", hookQuestion: "What does إِنَّ do after a verb of saying?" },
      { title: "وَإِذَا — When / Whenever", titleAr: "إِذَا الشَّرْطِيَّة", grammarTerm: "اسم شرط زمني", reveal: "You parsed وَإِذَا as a conditional time clause — whenever X happens, Y follows.", hookQuestion: "What is the condition and what is the response in Al-Baqarah 2:186?" },
      { title: "Allah Is Near", titleAr: "فَإِنِّي قَرِيبٌ", grammarTerm: "خبر إن", reveal: "You read فَإِنِّي قَرِيبٌ as the response clause — the فَ shows the direct consequence of asking.", hookQuestion: "In فَإِنِّي قَرِيبٌ, what is the subject and what is the predicate?" },
    ],
  },

  // ── Ch51 ── Verb Pattern Reinforcement ───────────────────────────────────
  {
    order: 51,
    sourceFile: "reader_lecture_51_verb_pattern_reinforcement.md",
    title: "Verb Pattern Reinforcement",
    titleAr: "تَعْزِيز أَوْزَان الأَفْعَال",
    description: "Strengthening verb conjugation across all persons, genders, and numbers.",
    hook: { ayahAr: "يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ", ayahRef: "Al-Jumu'ah 62:1", highlightedWord: "يُسَبِّحُ" },
    examples: [
      card("يُسَبِّحُ اللَّهَ كُلُّ شَيْءٍ", "Everything glorifies Allah", "yusabbihu allaaha kullu shay'"),
      card("يَكْتُبُ الطَّالِبُ وَتَكْتُبُ الطَّالِبَةُ", "The male student writes and the female student writes", "yaktubu at-talibu wa taktubu at-taliba"),
      card("نَعْبُدُكَ وَنَسْتَعِينُكَ", "We worship You and seek Your help", "na'buduka wa nasta'eenuka"),
      card("يَعْلَمُونَ وَيَعْمَلُونَ وَيَقُولُونَ", "They know, they act, and they speak", "ya'lamoona wa ya'maloona wa yaqooloona"),
    ],
    parseText: "يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ",
    parseTokens: [token("يُسَبِّحُ", "فعل", "glorifies"), token("لِلَّهِ", "مضاف إليه", "for Allah"), token("مَا", "فاعل", "what/whatever"), token("فِي", "حرف جر", "in"), token("السَّمَاوَاتِ", "مضاف إليه", "the heavens")],
    conversation: ["مَنْ يُسَبِّحُ اللَّهَ؟", "يُسَبِّحُ لِلَّهِ كُلُّ مَا فِي السَّمَاوَاتِ وَالأَرْضِ"],
    conversationDistractor: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي",
    distractor: "When My servants ask about Me",
    blankDistractor: "يَجْلِسُونَ",
    noorTip: "يُسَبِّحُ is Form II (فَعَّلَ) of سَبَّحَ — the doubled middle root letter intensifies the glorification.",
    noorTipUr: "یُسَبِّح باب تفعیل کا فعل ہے — تشدید تعظیم کو بڑھاتی ہے۔",
    focuses: [
      { title: "The Full Conjugation Table", titleAr: "جَدْوَل التَّصْرِيف الْكَامِل", grammarTerm: "تصريف الفعل المضارع", reveal: "You conjugated a single verb root across all twelve persons in the present tense.", hookQuestion: "How many forms does a present-tense verb have across all persons and genders?" },
      { title: "He vs She (3rd Person)", titleAr: "الْمُذَكَّر وَالْمُؤَنَّث الْغَائِب", grammarTerm: "فعل مضارع غائب", reveal: "You tracked how the prefix changes between يَـ (he) and تَـ (she) in the present tense.", hookQuestion: "Which prefix marks the feminine 3rd-person present verb?" },
      { title: "We (1st Person Plural)", titleAr: "نَحْنُ — نَـ الْمُضَارَعَة", grammarTerm: "فعل مضارع متكلم جمع", reveal: "You used the نَـ prefix (we) — the same prefix in نَعْبُدُ and نَسْتَعِينُ from Al-Fatiha.", hookQuestion: "Why does Al-Fatiha use نَعْبُدُ (we) and not أَعْبُدُ (I)?" },
      { title: "Everything Glorifies", titleAr: "كُلُّ شَيْءٍ يُسَبِّح", grammarTerm: "فعل + فاعل معنوي", reveal: "You parsed يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ — the subject is the clause مَا فِي السَّمَاوَاتِ.", hookQuestion: "What is the grammatical subject (فاعل) of يُسَبِّحُ in this ayah?" },
    ],
  },

  // ── Ch52 ── Grammar Integration and Applied Communication ─────────────────
  {
    order: 52,
    sourceFile: "reader_lecture_52_grammar_integration.md",
    title: "Grammar Integration and Applied Communication",
    titleAr: "تَكَامُل الْقَوَاعِد وَالتَّوَاصُل التَّطْبِيقِيّ",
    description: "Combining all Book 5 concepts in real communicative contexts.",
    hook: { ayahAr: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", ayahRef: "At-Talaq 65:3", highlightedWord: "يَتَوَكَّلْ" },
    examples: [
      card("مَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", "Whoever relies on Allah, He is sufficient for him", "man yatawakkal 'alallahi fa-huwa hasbuh"),
      card("أُرِيدُ أَنْ أَكُونَ مِنَ الصَّادِقِينَ", "I want to be among the truthful", "ureedo an akoona minas-saadiqeen"),
      card("لَمْ يَكُنِ الَّذِينَ كَفَرُوا مُنفَكِّينَ", "Those who disbelieved were not going to desist", "lam yakuni alladheena kafaroo munfakkeen"),
      card("فَاصْبِرْ إِنَّ وَعْدَ اللَّهِ حَقٌّ", "So be patient — indeed Allah's promise is true", "fasbir inna wa'dallahi haqq"),
    ],
    parseText: "مَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    parseTokens: [token("مَنْ", "فاعل", "whoever"), token("يَتَوَكَّلْ", "فعل", "relies"), token("عَلَى", "حرف جر", "on"), token("اللَّهِ", "مضاف إليه", "Allah"), token("فَهُوَ", "مبتدأ", "He"), token("حَسْبُهُ", "خبر", "sufficient")],
    conversation: ["مَا مَعْنَى التَّوَكُّل؟", "التَّوَكُّلُ أَنْ تَعْمَلَ وَتُفَوِّضَ الأَمْرَ لِلَّهِ"],
    conversationDistractor: "يُسَبِّحُ لِلَّهِ كُلُّ شَيْءٍ",
    distractor: "Everything glorifies Allah",
    blankDistractor: "لَنْ يَنَالَ",
    noorTip: "يَتَوَكَّلْ is مجزوم after مَنْ — the conditional particle makes the verb jussive.",
    noorTipUr: "یَتَوَکَّلْ مجزوم ہے — مَنْ شرطیہ کے بعد فعل مجزوم آتا ہے۔",
    focuses: [
      { title: "مَنْ as Conditional", titleAr: "مَنْ الشَّرْطِيَّة", grammarTerm: "اسم شرط جازم", reveal: "You parsed مَنْ as a conditional particle — it triggers jussive on both the condition verb and the response verb.", hookQuestion: "Why is يَتَوَكَّلْ in مجزوم after مَنْ?" },
      { title: "فَ in the Response", titleAr: "الْفَاء الرَّابِطَة", grammarTerm: "فاء جواب الشرط", reveal: "You identified the فَ that introduces the response clause — without it, the sentence would be incomplete.", hookQuestion: "What role does the فَ play before هُوَ حَسْبُهُ?" },
      { title: "أَنْ أَكُونَ", titleAr: "أَنْ + كَوْن", grammarTerm: "فعل ناقص منصوب", reveal: "You saw كَانَ enter منصوب state after أَنْ — أَكُونَ, not أَكُونُ.", hookQuestion: "What changes about أَكُونُ when it follows أَنْ?" },
      { title: "The Command Then Reason", titleAr: "فَاصْبِرْ إِنَّ", grammarTerm: "أمر + تعليل بإن", reveal: "You read a Quranic command (فَاصْبِرْ) followed by إِنَّ giving the reason — a powerful rhetorical pattern.", hookQuestion: "Why does the Quran give the reason after the command?" },
    ],
  },

  // ── Ch53 ── Structural Fluency Development ────────────────────────────────
  {
    order: 53,
    sourceFile: "reader_lecture_53_structural_fluency.md",
    title: "Structural Fluency Development",
    titleAr: "تَطْوِير الطَّلَاقَة التَّرْكِيبِيَّة",
    description: "Developing intuition for Arabic sentence structure through varied practice.",
    hook: { ayahAr: "الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَى جُنُوبِهِمْ", ayahRef: "Al-Imran 3:191", highlightedWord: "يَذْكُرُونَ" },
    examples: [
      card("الَّذِينَ يَذْكُرُونَ اللَّهَ فِي كُلِّ أَحْوَالِهِمْ", "Those who remember Allah in all their states", "alladheena yadhkuroonallaaha fee kulli ahwaalihim"),
      card("قِيَامًا وَقُعُودًا وَعَلَى جُنُوبِهِمْ", "Standing, sitting, and on their sides", "qiyaaman wa qu'oodan wa 'alaa junoobihim"),
      card("رَبَّنَا مَا خَلَقْتَ هَذَا بَاطِلًا", "Our Lord, You did not create this in vain", "rabbanaa maa khalaqta haadha baatilan"),
      card("سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ", "Glory be to You, so protect us from the punishment of fire", "subhaanaka faqinaa 'adhaaban-naar"),
    ],
    parseText: "الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا",
    parseTokens: [token("الَّذِينَ", "مبتدأ", "those who"), token("يَذْكُرُونَ", "فعل", "remember"), token("اللَّهَ", "مفعول", "Allah"), token("قِيَامًا", "حال", "standing")],
    conversation: ["مَتَى يَذْكُرُ الْمُؤْمِنُ اللَّهَ؟", "يَذْكُرُهُ قِيَامًا وَقُعُودًا وَعَلَى جُنُوبِهِ"],
    conversationDistractor: "مَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    distractor: "Whoever relies on Allah, He is sufficient",
    blankDistractor: "جُلُوسًا",
    noorTip: "قِيَامًا وَقُعُودًا are accusative — they describe the state in which the action happens.",
    noorTipUr: "قِیَامًا وَقُعُودًا حال (descriptive accusative) ہیں — وہ حالت بتاتے ہیں جس میں ذکر ہوتا ہے۔",
    focuses: [
      { title: "Reading Without Stopping", titleAr: "الْقِرَاءَة بِلَا تَوَقُّف", grammarTerm: "طلاقة القراءة", reveal: "You practised reading a full passage without breaking to analyse individual words.", hookQuestion: "How does your understanding change when you read for meaning vs. parsing?" },
      { title: "الَّذِينَ — Plural Relative", titleAr: "الَّذِينَ", grammarTerm: "اسم موصول جمع", reveal: "You recognised الَّذِينَ as the plural relative pronoun — الَّذِي (single male) scales to الَّذِينَ (plural).", hookQuestion: "How does الَّذِينَ differ from الَّذِي in use?" },
      { title: "Three States of Being", titleAr: "ثَلَاثَة أَحْوَال", grammarTerm: "أحوال متعددة", reveal: "You saw three simultaneous or alternating states listed in parallel: قِيَامًا، قُعُودًا، عَلَى جُنُوبِهِمْ.", hookQuestion: "What grammatical role do قِيَامًا and قُعُودًا play in the sentence?" },
      { title: "سُبْحَانَكَ — Glorification Formula", titleAr: "سُبْحَانَكَ", grammarTerm: "مفعول مطلق", reveal: "You parsed سُبْحَانَكَ as an absolute object of glorification — a fixed expression of praise.", hookQuestion: "What does سُبْحَانَكَ literally translate to?" },
    ],
  },

  // ── Ch54 ── Book 5 Capstone — Consolidation and Transition ───────────────
  {
    order: 54,
    sourceFile: "reader_lecture_54_book5_capstone.md",
    title: "Book 5 Capstone — Consolidation and Transition",
    titleAr: "خَاتِمَة الْكِتَاب الْخَامِس وَالِانْتِقَال",
    description: "Final integration of Book 5 with a preview of Book 6's analytical approach.",
    hook: { ayahAr: "وَمَن يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ", ayahRef: "Luqman 31:12", highlightedWord: "يَشْكُرْ" },
    examples: [
      card("مَنْ يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ", "Whoever is grateful is only grateful for himself", "man yashkur fa-innamaa yashkuru linafsih"),
      card("قَدْ أَفْلَحَ الْمُؤْمِنُونَ", "The believers have indeed succeeded", "qad aflaha al-mu'minoon"),
      card("وَتِلْكَ الأَمْثَالُ نَضْرِبُهَا لِلنَّاسِ", "And these examples We set forth for the people", "wa tilkal-amthaalu nadribuhaa lin-naas"),
      card("كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ", "A blessed Book We have sent down to you", "kitaabun anzalnaahu ilayka mubaarakun"),
    ],
    parseText: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ",
    parseTokens: [token("قَدْ", "حرف جر", "indeed"), token("أَفْلَحَ", "فعل", "succeeded"), token("الْمُؤْمِنُونَ", "فاعل", "the believers")],
    conversation: ["مَنْ أَفْلَحَ؟", "قَدْ أَفْلَحَ الْمُؤْمِنُونَ"],
    conversationDistractor: "الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا",
    distractor: "Those who remember Allah while standing",
    blankDistractor: "لَنْ يُفْلِحَ",
    noorTip: "يَشْكُرْ is مجزوم after مَنْ — gratitude's grammar is as deliberate as its meaning.",
    noorTipUr: "یَشْکُرْ مجزوم ہے — شکر کا قواعد بھی اتنا ہی مضبوط ہے جتنا اس کا معنی۔",
    focuses: [
      { title: "قَدْ + Past Tense", titleAr: "قَدْ مَع الْمَاضِي", grammarTerm: "قد للتحقيق", reveal: "You saw قَدْ before a past verb — it intensifies the certainty of the completed action.", hookQuestion: "What does قَدْ add to أَفْلَحَ that is not there without it?" },
      { title: "فَإِنَّمَا — Exclusively", titleAr: "فَإِنَّمَا لِلْحَصْر", grammarTerm: "أداة حصر", reveal: "You parsed إِنَّمَا as a restriction particle — 'only', 'exclusively', 'none but'.", hookQuestion: "How does إِنَّمَا restrict the meaning in مَنْ يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ?" },
      { title: "Book 5 Complete", titleAr: "اكْتِمَال الْكِتَاب الْخَامِس", grammarTerm: "مراجعة الكتاب", reveal: "You have mastered the three states of the present tense, لَمْ, لَنْ, and conditional sentences — the core of Books 4 and 5.", hookQuestion: "Name the three states of the present tense and one trigger particle for each." },
      { title: "Book 6 Preview", titleAr: "نَظْرَة عَلَى الْكِتَاب السَّادِس", grammarTerm: "الإعراب والبناء", reveal: "Book 6 asks a different question: not just what a word means, but why its ending changed. You are about to study Arabic as a science.", hookQuestion: "What do you think الْإِعْرَاب means?" },
    ],
  },

  // ── Ch55 ── I'rab and Bina — Declinable vs Indeclinable ─────────────────
  {
    order: 55,
    sourceFile: "reader_lecture_55_irab_bina.md",
    title: "I'rab and Bina — Declinable and Indeclinable",
    titleAr: "الإِعْرَاب وَالْبِنَاء",
    description: "The science of case endings — which words change and which stay fixed.",
    hook: { ayahAr: "وَعَلَّمَ آدَمَ الأَسْمَاءَ كُلَّهَا", ayahRef: "Al-Baqarah 2:31", highlightedWord: "الأَسْمَاءَ" },
    examples: [
      card("الأَسْمَاءُ الْمُعْرَبَةُ تَتَغَيَّرُ نِهَايَتُهَا", "Declinable nouns change their endings", "al-asmaa'ul-mu'rabatu tataghayaru nihaayatuha"),
      card("هَذَا مَبْنِيٌّ لَا يَتَغَيَّرُ أَبَدًا", "This (هَذَا) is indeclinable — it never changes", "haadha mabniyyun laa yataghayaru abadan"),
      card("الضَّمَّةُ عَلَامَةُ الرَّفْعِ فِي الِاسْمِ الْمُفْرَدِ", "The damma is the sign of nominative in a singular noun", "ad-dammatu 'alaamatur-raf'i fil-ismil-mufrad"),
      card("الْفَتْحَةُ عَلَامَةُ النَّصْبِ وَالْكَسْرَةُ عَلَامَةُ الْجَرِّ", "Fatḥa is the sign of accusative and kasra is the sign of genitive", "al-fathatu 'alaamatun-nasbi wal-kasratu 'alaamatun-jarr"),
    ],
    parseText: "الضَّمَّةُ عَلَامَةُ الرَّفْعِ",
    parseTokens: [token("الضَّمَّةُ", "مبتدأ", "the damma"), token("عَلَامَةُ", "خبر", "the sign of"), token("الرَّفْعِ", "مضاف إليه", "nominative")],
    conversation: ["مَا مَعْنَى الْإِعْرَاب؟", "هُوَ تَغْيِيرُ أَوَاخِرِ الْكَلِمَاتِ بِحَسَبِ مَوْقِعِهَا فِي الْجُمْلَةِ"],
    conversationDistractor: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ",
    distractor: "The believers have succeeded",
    blankDistractor: "الْجَزْم",
    noorTip: "Allah taught Adam the names — الأَسْمَاء. Arabic grammar science begins with understanding names and their cases.",
    noorTipUr: "اللہ نے آدم کو اسماء سکھائے — اعراب کی علم ان ناموں کے انجام کی علم ہے۔",
    focuses: [
      { title: "What Is الإِعْرَاب?", titleAr: "تَعْرِيف الإِعْرَاب", grammarTerm: "تعريف", reveal: "You defined الإِعْرَاب: the change in a word's ending based on its grammatical role in the sentence.", hookQuestion: "Give an example of a word that changes ending depending on its role." },
      { title: "What Is الْبِنَاء?", titleAr: "تَعْرِيف الْبِنَاء", grammarTerm: "تعريف", reveal: "You defined الْبِنَاء: a word that stays fixed regardless of its grammatical role — like هَذَا, أَنْتَ, مِنْ.", hookQuestion: "Name three Arabic words that are مَبْنِيّ (indeclinable)." },
      { title: "The Three Cases", titleAr: "الأَحْوَال الثَّلَاثَة لِلِاسْمِ", grammarTerm: "الرفع والنصب والجر", reveal: "You mapped the three grammatical cases: رفع (nominative), نصب (accusative), جر (genitive) — each with its own ending.", hookQuestion: "What vowel marks each of the three cases in a regular singular noun?" },
      { title: "Signs of Each Case", titleAr: "عَلَامَات الإِعْرَاب", grammarTerm: "علامات الأصلية", reveal: "You learned the primary signs: ضمة for رفع, فتحة for نصب, كسرة for جر — the building blocks of all Arabic parsing.", hookQuestion: "What is the علامة of جر in a regular noun?" },
      { title: "مُعْرَب vs مَبْنِيّ in Quran", titleAr: "إِعْرَاب فِي الْقُرْآن", grammarTerm: "تطبيق", reveal: "You applied the distinction to Quranic text — seeing which words change and which stay fixed across different contexts.", hookQuestion: "Is اللَّهِ in بِسْمِ اللَّهِ مُعْرَب or مَبْنِيّ? What is its case?" },
      { title: "Why Arabic Has I'rab", titleAr: "الْحِكْمَة مِنَ الإِعْرَاب", grammarTerm: "فلسفة الإعراب", reveal: "You understood that الإعراب allows Arabic word order to be flexible — the role is carried in the ending, not position.", hookQuestion: "How does Arabic word order differ from English because of إعراب?" },
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
