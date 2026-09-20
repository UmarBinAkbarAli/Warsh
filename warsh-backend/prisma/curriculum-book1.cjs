// Chapters 1-15: Book 1 (Ch1-10) + Book 2 opening (Ch11-15)
// Replaces curriculum-phase15.cjs with spec-aligned content.

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
      prompt: "Match each Arabic word with its meaning.",
      pairs,
      options: pairs.map((item) => item.right).reverse(),
    });
  } else if (specialType === "GRAMMAR_PARSE") {
    exercises.push({
      type: "GRAMMAR_PARSE",
      prompt: "Label the role of each word in this sentence.",
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

  // ── Ch1 ── This, That, What, Who ─────────────────────────────────────────
  {
    order: 1,
    sourceFile: "reader_lecture_01_haza_zalika.md",
    title: "This, That, What, Who",
    titleAr: "هٰذَا وَذٰلِكَ وَمَا وَمَنْ",
    description: "Your first Arabic words — pointing to things near and far, and asking what and who.",
    hook: { ayahAr: "ذٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ", ayahRef: "Al-Baqarah 2:2", highlightedWord: "ذٰلِكَ" },
    examples: [
      card("هٰذَا بَيْتٌ", "This is a house", "haadha baytun"),
      card("ذٰلِكَ مَسْجِدٌ", "That is a mosque", "dhaalika masjidun"),
      card("مَا هٰذَا؟", "What is this?", "maa haadha"),
      card("مَنْ هٰذَا؟", "Who is this?", "man haadha"),
    ],
    parseText: "هٰذَا بَيْتٌ",
    parseTokens: [token("هٰذَا", "مبتدأ", "this"), token("بَيْتٌ", "خبر", "house")],
    conversation: ["مَا هٰذَا؟", "هٰذَا قَلَمٌ"],
    conversationDistractor: "ذٰلِكَ مَسْجِدٌ",
    distractor: "That is a mosque",
    blankDistractor: "مَنْ",
    noorTip: "Allah opens Al-Baqarah by pointing — ذٰلِكَ الْكِتَابُ. Distance here shows elevation, not remoteness.",
    noorTipUr: "اللہ تعالیٰ سورۃ البقرہ کی ابتدا میں ذٰلِكَ استعمال کرتے ہیں — دوری تعظیم کے لیے ہے۔",
    focuses: [
      { title: "Near — هٰذَا", titleAr: "هٰذَا", grammarTerm: "اسم إشارة للقريب", reveal: "You pointed to something nearby using هٰذَا, and the sentence needed no verb — 'this' and 'house' together are complete.", hookQuestion: "Where is the word 'is' in هٰذَا بَيْتٌ?" },
      { title: "Far — ذٰلِكَ", titleAr: "ذٰلِكَ", grammarTerm: "اسم إشارة للبعيد", reveal: "You pointed to something far away. Arabic uses a different word for distance, not just tone.", hookQuestion: "Why does Allah use ذٰلِكَ (far) for the Quran when He is presenting it?" },
      { title: "What? — مَا", titleAr: "مَا", grammarTerm: "اسم استفهام للأشياء", reveal: "You asked about objects with مَا — the question word that opens the world of things.", hookQuestion: "When do you use مَا and when do you use مَنْ?" },
      { title: "Who? — مَنْ", titleAr: "مَنْ", grammarTerm: "اسم استفهام للعاقل", reveal: "You asked about people with مَنْ. Arabic treats rational beings differently from objects.", hookQuestion: "What is the difference between مَا and مَنْ?" },
    ],
  },

  // ── Ch2 ── Definite, Indefinite, and the Nominal Sentence ─────────────────
  {
    order: 2,
    sourceFile: "reader_lecture_02_marifa_nakira.md",
    title: "Definite, Indefinite, and Where",
    titleAr: "مَعْرِفَة وَنَكِرَة وَأَيْنَ",
    description: "Tanween makes a word indefinite. الـ makes it definite. Together they build your first sentences.",
    hook: { ayahAr: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", ayahRef: "Al-Fatiha 1:2", highlightedWord: "الْحَمْدُ" },
    examples: [
      card("بَيْتٌ", "a house", "baytun"),
      card("الْبَيْتُ", "the house", "al-baytu"),
      card("الْكِتَابُ جَدِيدٌ", "The book is new", "al-kitaabu jadeedun"),
      card("أَيْنَ الْقَلَمُ؟", "Where is the pen?", "ayna al-qalamu"),
    ],
    parseText: "الْكِتَابُ جَدِيدٌ",
    parseTokens: [token("الْكِتَابُ", "مبتدأ", "the book"), token("جَدِيدٌ", "خبر", "new")],
    conversation: ["أَيْنَ الْقَلَمُ؟", "الْقَلَمُ عَلَى الْمَكْتَبِ"],
    conversationDistractor: "ذٰلِكَ مَسْجِدٌ",
    distractor: "That is a mosque",
    blankDistractor: "مَنْ",
    noorTip: "الْحَمْدُ begins with ال — this is specific, complete praise belonging to Allah alone.",
    noorTipUr: "الْحَمْدُ میں ال خاص تعریف کے لیے ہے — یہ تمام تعریف اللہ کے لیے ہے۔",
    focuses: [
      { title: "A House — نَكِرَة", titleAr: "بَيْتٌ", grammarTerm: "نكرة", reveal: "Tanween (ٌ) at the end quietly says 'a' — without a separate Arabic word.", hookQuestion: "Where is the English word 'a' hiding in بَيْتٌ?" },
      { title: "The House — مَعْرِفَة", titleAr: "الْبَيْتُ", grammarTerm: "معرفة بأل", reveal: "ال made the noun specific and tanween disappeared — you cannot have both.", hookQuestion: "What changes when a house becomes the house?" },
      { title: "The Book Is New", titleAr: "الْكِتَابُ جَدِيدٌ", grammarTerm: "جملة اسمية", reveal: "You built a complete sentence with no verb — the subject and predicate together are all Arabic needs.", hookQuestion: "How does Arabic say 'is' without the word 'is'?" },
      { title: "Where? — أَيْنَ", titleAr: "أَيْنَ", grammarTerm: "ظرف مكان استفهامي", reveal: "You asked about location with one word and answered with a short place phrase.", hookQuestion: "What kind of answer does أَيْنَ expect?" },
    ],
  },

  // ── Ch3 ── Possession and the Basmalah ────────────────────────────────────
  {
    order: 3,
    sourceFile: "reader_lecture_03_idafa.md",
    title: "Possession and the Basmalah",
    titleAr: "الإِضَافَة وَالْبَسْمَلَة",
    description: "Two nouns together to express 'of' and ownership — the structure that builds بِسْمِ اللَّهِ.",
    hook: { ayahAr: "بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ", ayahRef: "Al-Fatiha 1:1", highlightedWord: "بِسْمِ" },
    examples: [
      card("كِتَابُ الطَّالِبِ", "the student's book", "kitaabu at-taalib"),
      card("بَيْتُ الأُسْتَاذِ", "the teacher's house", "baytu al-ustaadh"),
      card("يَا مُحَمَّدُ", "O Muhammad!", "yaa muhammadu"),
      card("بِسْمِ اللَّهِ", "in the name of Allah", "bismillaah"),
    ],
    parseText: "كِتَابُ الطَّالِبِ",
    parseTokens: [token("كِتَابُ", "مضاف", "book of"), token("الطَّالِبِ", "مضاف إليه", "the student")],
    conversation: ["لِمَنْ هٰذَا الْكِتَابُ؟", "هٰذَا كِتَابُ الطَّالِبِ"],
    conversationDistractor: "أَيْنَ الْقَلَمُ؟",
    distractor: "The book is new",
    blankDistractor: "فِي",
    noorTip: "بِسْمِ اللَّهِ is an idafa — name of Allah. You have said it thousands of times without knowing the grammar.",
    noorTipUr: "بِسْمِ اللَّهِ ایک اضافی ترکیب ہے — اللہ کے نام پر۔ آپ نے ہزار بار پڑھا، آج سمجھیں۔",
    focuses: [
      { title: "The Student's Book", titleAr: "كِتَابُ الطَّالِبِ", grammarTerm: "مركب إضافي", reveal: "Two nouns together — the first loses tanween, the second goes to kasra. No word for 'of' needed.", hookQuestion: "Why does الطَّالِبِ have a kasra ending here?" },
      { title: "Whose? — لِمَنْ", titleAr: "لِمَنْ", grammarTerm: "لام الملكية مع الاستفهام", reveal: "You asked 'to whom?' with لِمَنْ — the لِ of ownership attached to the question مَنْ.", hookQuestion: "What does لِ add to the question مَنْ?" },
      { title: "O! — يَا", titleAr: "يَا", grammarTerm: "حرف نداء", reveal: "You called someone with يَا and saw tanween disappear from the name — a sign of direct address.", hookQuestion: "What disappears from a noun when يَا comes before it?" },
      { title: "Basmalah Unlocked", titleAr: "بِسْمِ اللَّهِ", grammarTerm: "إضافة مسبوقة بحرف جر", reveal: "بِسْمِ is اسم (name) in idafa with اللَّهِ — preceded by the preposition بِ (with/in). One phrase, three grammatical layers.", hookQuestion: "Name the three grammatical elements inside بِسْمِ اللَّهِ." },
    ],
  },

  // ── Ch4 ── Adjectives and Gender ──────────────────────────────────────────
  {
    order: 4,
    sourceFile: "reader_lecture_04_sifa_mawsoof.md",
    title: "Adjectives and Gender Agreement",
    titleAr: "الصِّفَة وَالْمَوْصُوف",
    description: "Describing nouns — adjectives follow and agree with their noun in gender and definiteness.",
    hook: { ayahAr: "الصِّرَاطَ الْمُسْتَقِيمَ", ayahRef: "Al-Fatiha 1:6", highlightedWord: "الْمُسْتَقِيمَ" },
    examples: [
      card("رَجُلٌ كَرِيمٌ", "a generous man", "rajulun kareemun"),
      card("الْبَيْتُ الْكَبِيرُ", "the big house", "al-baytu al-kabeeru"),
      card("مَدِينَةٌ جَمِيلَةٌ", "a beautiful city", "madeenatun jameelatun"),
      card("الصِّرَاطُ الْمُسْتَقِيمُ", "the straight path", "as-siraatu al-mustaqeem"),
    ],
    parseText: "الْبَيْتُ الْكَبِيرُ جَدِيدٌ",
    parseTokens: [token("الْبَيْتُ", "مبتدأ", "the house"), token("الْكَبِيرُ", "نعت", "big"), token("جَدِيدٌ", "خبر", "new")],
    conversation: ["كَيْفَ الْبَيْتُ؟", "الْبَيْتُ كَبِيرٌ وَجَدِيدٌ"],
    conversationDistractor: "كِتَابُ الطَّالِبِ",
    distractor: "the student's book",
    blankDistractor: "قَدِيمٌ",
    noorTip: "الصِّرَاطَ الْمُسْتَقِيمَ — path and adjective agree in definiteness, case, and gender.",
    noorTipUr: "الصِّرَاطَ الْمُسْتَقِيمَ میں موصوف اور صفت کیسے ملتے ہیں، غور کریں۔",
    focuses: [
      { title: "Adjective Follows Noun", titleAr: "الصِّفَة بَعْدَ الْمَوْصُوف", grammarTerm: "نعت", reveal: "Arabic adjectives always come after their noun — unlike English, which puts them before.", hookQuestion: "Why does كَرِيمٌ come after رَجُلٌ rather than before?" },
      { title: "Definite Agreement", titleAr: "الْبَيْتُ الْكَبِيرُ", grammarTerm: "نعت معرفة", reveal: "Both noun and adjective carry ال — they agree in definiteness. If the noun is definite, the adjective must be too.", hookQuestion: "What would الْبَيْتُ كَبِيرٌ (without ال on كبير) mean differently?" },
      { title: "Feminine Agreement", titleAr: "مَدِينَةٌ جَمِيلَةٌ", grammarTerm: "نعت مؤنث", reveal: "The feminine noun needs a feminine adjective — ة on both.", hookQuestion: "Why does جَمِيلَةٌ have ة while كَرِيمٌ does not?" },
      { title: "The Straight Path", titleAr: "الصِّرَاطُ الْمُسْتَقِيمُ", grammarTerm: "نعت قرآني", reveal: "You read the phrase you ask Allah for seventeen times a day as a grammatical unit — definite noun + definite adjective.", hookQuestion: "Count the agreements between الصِّرَاطَ and الْمُسْتَقِيمَ." },
    ],
  },

  // ── Ch5 ── Feminine Demonstratives and First Verbs ────────────────────────
  {
    order: 5,
    sourceFile: "reader_lecture_05_haadhihi_tilka_dhahaba.md",
    title: "Putting Arabic Together — Possession and First Actions",
    titleUr: "عربی کو جوڑنا — ملکیت اور پہلا عمل",
    titleAr: "هٰذِهِ وَتِلْكَ وَأَوَّل فِعْل",
    description: "Pointing to feminine nouns, lam of possession, and your first past-tense verb.",
    hook: { ayahAr: "هٰذِهِ نَاقَةُ اللَّهِ لَكُمْ آيَةً", ayahRef: "Al-A'raf 7:73", highlightedWord: "هٰذِهِ" },
    examples: [
      card("هٰذِهِ مَدْرَسَةٌ", "This is a school", "haadhihi madrasatun"),
      card("تِلْكَ مَدِينَةٌ", "That is a city", "tilka madeenatun"),
      card("لِي كِتَابٌ", "I have a book", "lee kitaabun"),
      card("ذَهَبَ الطَّالِبُ", "The student went", "dhahaba at-taalib"),
    ],
    parseText: "ذَهَبَ الطَّالِبُ",
    parseTokens: [token("ذَهَبَ", "فعل", "went"), token("الطَّالِبُ", "فاعل", "the student")],
    conversation: ["لِمَنْ هٰذَا الْكِتَابُ؟", "هٰذَا الْكِتَابُ لِي"],
    conversationDistractor: "الْبَيْتُ الْكَبِيرُ جَدِيدٌ",
    distractor: "a beautiful city",
    blankDistractor: "مِنْ",
    noorTip: "Allah points to the camel with هٰذِهِ — feminine, near, and visible to those being addressed.",
    noorTipUr: "اللہ نے هٰذِهِ مؤنث اشارے سے اونٹنی کی طرف اشارہ کیا — یہ قریب اور ظاہر تھی۔",
    focuses: [
      { title: "This Feminine — هٰذِهِ", titleAr: "هٰذِهِ", grammarTerm: "اسم إشارة للمؤنث القريب", reveal: "You learned that هٰذَا changes to هٰذِهِ for feminine nouns — the pointer must match its noun.", hookQuestion: "Why does مَدْرَسَةٌ get هٰذِهِ while بَيْتٌ gets هٰذَا?" },
      { title: "That Feminine — تِلْكَ", titleAr: "تِلْكَ", grammarTerm: "اسم إشارة للمؤنث البعيد", reveal: "You completed the pointing table: near/far × masculine/feminine — four words total.", hookQuestion: "What is the full set of four pointing words you now know?" },
      { title: "I Have — لِي", titleAr: "لِي", grammarTerm: "لام الملكية", reveal: "لِ attached to the pronoun يَ (me) expresses possession — 'to me is a book' = 'I have a book'.", hookQuestion: "What does لِي literally mean word-for-word?" },
      { title: "He Went — ذَهَبَ", titleAr: "ذَهَبَ", grammarTerm: "فعل ماض", reveal: "Your first verb — ذَهَبَ is a past-tense action. The doer (فاعل) comes after it, not before.", hookQuestion: "What comes after a verb in Arabic — before or after the subject?" },
    ],
  },

  // ── Ch6 ── Adjective Descriptions and الَّذِي ─────────────────────────────
  {
    order: 6,
    sourceFile: "reader_lecture_06_sifa_alladhi.md",
    title: "Relative Descriptions — الَّذِي",
    titleUr: "متعلقہ وضاحتیں — الَّذِي",
    titleAr: "الصِّفَة وَالَّذِي",
    description: "Described nouns, then connecting a masculine noun to its description with the relative pronoun الَّذِي.",
    descriptionUr: "موصوف اسم، پھر مذکر اسم کو اسم موصول الَّذِي کے ذریعے اس کی توصیف سے جوڑنا۔",
    hook: { ayahAr: "الَّذِي خَلَقَ فَسَوَّىٰ", ayahRef: "Al-A'la 87:2", highlightedWord: "الَّذِي" },
    examples: [
      card("ذَهَبَ الرَّجُلُ الْكَرِيمُ", "The generous man went", "dhahaba r-rajulu l-kareem"),
      card("الْوَلَدُ الَّذِي ذَهَبَ", "the boy who went", "al-waladu alladhee dhahab"),
      card("الْقَلَمُ الَّذِي عَلَى الْمَكْتَبِ", "the pen that is on the desk", "al-qalamu alladhee alal-maktab"),
      card("الَّذِي خَلَقَ فَسَوَّى", "Who created and proportioned", "alladhee khalaqa fasawwaa"),
    ],
    parseText: "ذَهَبَ الرَّجُلُ الْكَرِيمُ",
    parseTokens: [token("ذَهَبَ", "فعل", "went"), token("الرَّجُلُ", "فاعل", "the man"), token("الْكَرِيمُ", "نعت", "generous")],
    conversation: ["مَنِ الرَّجُلُ الَّذِي ذَهَبَ؟", "الرَّجُلُ الَّذِي ذَهَبَ هُوَ الْأُسْتَاذُ"],
    conversationDistractor: "هٰذِهِ مَدْرَسَةٌ",
    distractor: "I have a book",
    blankDistractor: "الَّتِي",
    noorTip: "الَّذِي opens descriptions of Allah in Al-A'la — who created, proportioned, and guided.",
    noorTipUr: "الَّذِي سورۃ الاعلی میں اللہ کی صفات بیان کرتا ہے — خلق، سوّی، قدّر، ہدی۔",
    focuses: [
      { title: "Definite + Definite Adjective", titleAr: "الصِّفَة الْمَعْرِفَة", grammarTerm: "نعت معرفة", reveal: "You combined a definite noun and its definite adjective as the sentence subject — الرَّجُلُ الْكَرِيمُ.", hookQuestion: "How many ال appear in الرَّجُلُ الْكَرِيمُ and why?" },
      { title: "الَّذِي — Who/That/Which", titleAr: "الَّذِي", grammarTerm: "اسم موصول مذكر", reveal: "الَّذِي connects a noun to a clause that describes it — the clause must contain a complete idea.", hookQuestion: "What does الَّذِي make you wait for?" },
      { title: "Relative Phrase with Place", titleAr: "الَّذِي عَلَى الْمَكْتَبِ", grammarTerm: "صلة الموصول", reveal: "The clause after الَّذِي can be a place phrase — the pen that is on the desk.", hookQuestion: "What is the grammatical role of عَلَى الْمَكْتَبِ after الَّذِي?" },
      { title: "الَّذِي in Al-A'la", titleAr: "الَّذِي خَلَقَ فَسَوَّى", grammarTerm: "اسم موصول في القرآن", reveal: "You read الَّذِي followed by three consecutive verbs describing Allah — created, proportioned, guided.", hookQuestion: "Name the three actions of Allah described after الَّذِي in Al-A'la 87:2-3." },
    ],
  },

  // ── Ch7 ── Attached Pronouns and عِنْدَ ───────────────────────────────────
  {
    order: 7,
    sourceFile: "reader_lecture_07_damair_muttasila.md",
    title: "Attached Pronouns and Simple Possession",
    titleUr: "جڑی ہوئی ضمیریں اور سادہ ملکیت",
    titleAr: "الضَّمَائِر الْمُتَّصِلَة الْمُفْرَدَة",
    description: "Ownership expressed with attached endings — my, your (to a man or a woman), his, her — and 'I have' with عِنْدَ.",
    descriptionUr: "جڑی ہوئی علامتوں سے ملکیت — میرا، تمہارا (مرد یا عورت سے)، اس کا، اس کی — اور عِنْدَ سے 'میرے پاس ہے'۔",
    hook: { ayahAr: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", ayahRef: "Al-Fatiha 1:5", highlightedWord: "إِيَّاكَ" },
    examples: [
      card("كِتَابِي", "my book", "kitaabee"),
      card("كِتَابُكَ", "your book", "kitaabuka"),
      card("كِتَابُهُ", "his book", "kitaabuhu"),
      card("عِنْدِي قَلَمٌ", "I have a pen", "indee qalamun"),
    ],
    parseText: "عِنْدِي قَلَمٌ",
    parseTokens: [token("عِنْدِي", "خبر مقدم", "I have / with me"), token("قَلَمٌ", "مبتدأ مؤخر", "a pen")],
    conversation: ["أَعِنْدَكَ قَلَمٌ؟", "نَعَمْ، عِنْدِي قَلَمٌ"],
    conversationDistractor: "الْوَلَدُ الَّذِي ذَهَبَ",
    distractor: "the boy who went",
    blankDistractor: "مَعَهُ",
    noorTip: "إِيَّاكَ in Al-Fatiha is a separated pronoun for emphasis — 'You alone we worship'.",
    noorTipUr: "إِيَّاكَ میں انفصال زور کے لیے ہے — صرف آپ کی عبادت کرتے ہیں۔",
    focuses: [
      { title: "My — ـِي", titleAr: "كِتَابِي", grammarTerm: "ضمير متكلم متصل", reveal: "ي attached to a noun expresses 'my' — no separate word needed.", hookQuestion: "Where is the word 'my' in كِتَابِي?" },
      { title: "Your — ـُكَ", titleAr: "كِتَابُكَ", grammarTerm: "ضمير مخاطب مذكر", reveal: "كَ at the end says 'your' — it points to the person being addressed.", hookQuestion: "What changes between كِتَابِي and كِتَابُكَ?" },
      { title: "His — ـُهُ", titleAr: "كِتَابُهُ", grammarTerm: "ضمير غائب مذكر", reveal: "هُ points to a third person — absent, being talked about.", hookQuestion: "How does هُ point away to someone not in the conversation?" },
      { title: "I Have — عِنْدِي", titleAr: "عِنْدِي", grammarTerm: "ظرف مع ضمير", reveal: "عِنْدِي literally means 'at me' / 'in my possession' — Arabic expresses 'have' with a place word.", hookQuestion: "Why does Arabic use a place word (عِنْد) to say 'I have'?" },
    ],
  },

  // ── Ch8 ── Feminine Verbs and الَّتِي ─────────────────────────────────────
  {
    order: 8,
    sourceFile: "reader_lecture_08_fi'l_muannath_allatee.md",
    title: "Feminine Past Verbs and الَّتِي",
    titleUr: "مؤنث ماضی کے افعال اور الَّتِي",
    titleAr: "الْفِعْل الْمُؤَنَّث وَالَّتِي",
    description: "The silent تْ marks 'she' on a past verb — ذَهَبَتْ، قَالَتْ — and الَّتِي connects a feminine noun to its description.",
    descriptionUr: "ماضی فعل پر ساکن تْ 'وہ (عورت)' کی علامت ہے — ذَهَبَتْ، قَالَتْ — اور الَّتِي مؤنث اسم کو اس کی وضاحت سے جوڑتا ہے۔",
    hook: { ayahAr: "الَّتِي لَمْ يُخْلَقْ مِثْلُهَا فِي الْبِلَادِ", ayahRef: "Al-Fajr 89:8", highlightedWord: "الَّتِي" },
    examples: [
      card("ذَهَبَتْ فَاطِمَةُ", "Fatimah went", "dhahabat faatimatu"),
      card("رَجَعَتِ الطَّالِبَةُ", "The female student returned", "raja'atit-taalibatu"),
      card("الْبِنْتُ الَّتِي ذَهَبَتْ", "the girl who went", "al-bintu allatee dhahabat"),
      card("أُمِّي فِي الْبَيْتِ", "my mother is in the house", "ummee fil-bayt"),
    ],
    parseText: "ذَهَبَتْ فَاطِمَةُ",
    parseTokens: [token("ذَهَبَتْ", "فعل", "went"), token("فَاطِمَةُ", "فاعل", "Fatimah")],
    conversation: ["أَيْنَ أُمُّكَ؟", "أُمِّي فِي الْبَيْتِ"],
    conversationDistractor: "عِنْدِي قَلَمٌ",
    distractor: "his book",
    blankDistractor: "الَّذِي",
    noorTip: "الَّتِي في Al-Fajr describes Iram — a city of great pillars. Feminine noun, feminine relative pronoun.",
    noorTipUr: "الَّتِي مؤنث اسم موصول ہے — الفجر میں ارم شہر کی صفت کے لیے آیا ہے۔",
    focuses: [
      { title: "She Went — ذَهَبَتْ", titleAr: "ذَهَبَتْ", grammarTerm: "فعل ماض مؤنث", reveal: "تْ at the end of a verb marks a feminine subject — she, not he.", hookQuestion: "What tells you the doer is feminine in ذَهَبَتْ?" },
      { title: "Feminine Marker Across Verbs", titleAr: "تَاء التَّأْنِيث", grammarTerm: "تاء التأنيث الساكنة", reveal: "تْ is consistent — every feminine past verb ends this way, regardless of the verb root.", hookQuestion: "What stays the same between ذَهَبَتْ and رَجَعَتْ?" },
      { title: "الَّتِي — Feminine Relative", titleAr: "الَّتِي", grammarTerm: "اسم موصول مؤنث", reveal: "Just as الَّذِي connects masculine nouns, الَّتِي connects feminine nouns — they must match.", hookQuestion: "Why can't you use الَّذِي for البنت?" },
      { title: "My Mother — أُمِّي", titleAr: "أُمِّي", grammarTerm: "اسم مضاف إلى ياء المتكلم", reveal: "أُمّ + ي gives you 'my mother' — the attached pronoun ي makes it personal and warm.", hookQuestion: "How would you say 'his mother' and 'your mother'?" },
    ],
  },

  // ── Ch9 ── Plural Nouns ───────────────────────────────────────────────────
  {
    order: 9,
    sourceFile: "reader_lecture_09_jama.md",
    title: "Plural Nouns and هٰؤُلَاءِ",
    titleUr: "جمع کے اسماء اور هٰؤُلَاءِ",
    titleAr: "صِيَغُ الْجَمْعِ وَهٰؤُلَاءِ",
    description: "Three plural families — مُسْلِمُونَ، مُؤْمِنَاتٌ، كُتُبٌ — and هٰؤُلَاءِ to point to a nearby group of people.",
    descriptionUr: "جمع کے تین خاندان — مُسْلِمُونَ، مُؤْمِنَاتٌ، كُتُبٌ — اور قریب کی انسانی جماعت کی طرف اشارے کے لیے هٰؤُلَاءِ۔",
    hook: { ayahAr: "إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ", ayahRef: "Al-Hujurat 49:10", highlightedWord: "الْمُؤْمِنُونَ" },
    examples: [
      card("مُسْلِمٌ / مُسْلِمُونَ", "a Muslim / Muslims", "muslimun / muslimoona"),
      card("طَالِبَةٌ / طَالِبَاتٌ", "a female student / female students", "taalibatun / taalibaatun"),
      card("كِتَابٌ / كُتُبٌ", "a book / books (broken plural)", "kitaabun / kutubun"),
      card("هٰؤُلَاءِ مُسْلِمُونَ", "These are Muslims", "haa'ulaa'i muslimoona"),
    ],
    parseText: "هٰؤُلَاءِ مُسْلِمُونَ",
    parseTokens: [token("هٰؤُلَاءِ", "مبتدأ", "these"), token("مُسْلِمُونَ", "خبر", "Muslims")],
    conversation: ["مَنْ هٰؤُلَاءِ؟", "هٰؤُلَاءِ طُلَّابٌ مُجْتَهِدُونَ"],
    conversationDistractor: "الْبِنْتُ الَّتِي ذَهَبَتْ",
    distractor: "my mother is in the house",
    blankDistractor: "أُولَئِكَ",
    noorTip: "الْمُؤْمِنُونَ is the sound masculine plural of مُؤْمِنٌ — the believers — the base word plus ون.",
    noorTipUr: "الْمُؤْمِنُونَ مُؤْمِنٌ کی جمع مذکر سالم ہے — مومن لوگ — اصل لفظ اور ون۔",
    focuses: [
      { title: "Sound Masculine Plural — ونَ", titleAr: "جَمْع الْمُذَكَّر السَّالِم", grammarTerm: "جمع مذكر سالم", reveal: "Add ونَ to make a sound masculine plural — the root stays intact.", hookQuestion: "Why is this called 'sound' (سالم) plural?" },
      { title: "Sound Feminine Plural — ات", titleAr: "جَمْع الْمُؤَنَّث السَّالِم", grammarTerm: "جمع مؤنث سالم", reveal: "Remove ة, add ات — the feminine sound plural is regular and predictable.", hookQuestion: "How do you turn طَالِبَةٌ into its plural?" },
      { title: "Broken Plural — جَمْع مُكَسَّر", titleAr: "جَمْع مُكَسَّر", grammarTerm: "جمع مكسر", reveal: "كِتَاب → كُتُب — the interior shape changes completely. Broken plurals must be learned word-by-word.", hookQuestion: "Why can't you predict a broken plural from the singular?" },
      { title: "These — هٰؤُلَاءِ", titleAr: "هٰؤُلَاءِ", grammarTerm: "اسم إشارة للجمع", reveal: "You completed the pointing system — هٰذَا (near, m), هٰذِهِ (near, f), هٰؤُلَاءِ (near, plural).", hookQuestion: "What is the full set of near-pointing words you now know?" },
    ],
  },

  // ── Ch10 ── Plural Pronouns and قَبْلَ / بَعْدَ ─────────────────────────────
  // Docs/proposals/chapter-10-content-proposal.md (2026-09-18): standalone
  // plural pronouns only (attached forms deferred), the time pair taught as
  // construct phrases, جَاءُوا removed (plural past verbs are not yet taught).
  {
    order: 10,
    sourceFile: "reader_lecture_10_damair_jama.md",
    title: "Plural Pronouns and قَبْلَ / بَعْدَ",
    titleUr: "جمع ضمیریں اور قَبْلَ / بَعْدَ",
    titleAr: "ضَمَائِرُ الْجَمْعِ وَقَبْلَ وَبَعْدَ",
    description: "They, we and you all — هُمْ، هُنَّ، نَحْنُ، أَنْتُمْ، أَنْتُنَّ — then the time pair قَبْلَ and بَعْدَ.",
    descriptionUr: "وہ سب، ہم اور تم سب — هُمْ، هُنَّ، نَحْنُ، أَنْتُمْ، أَنْتُنَّ — پھر وقت کا جوڑا قَبْلَ اور بَعْدَ۔",
    hook: { ayahAr: "وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ", ayahRef: "Al-Kafirun 109:3", highlightedWord: "أَنْتُمْ" },
    examples: [
      card("هُمْ طُلَّابٌ", "They are students", "hum tullaabun"),
      card("نَحْنُ مُسْلِمُونَ", "We are Muslims", "nahnu muslimoona"),
      card("أَنْتُمْ مُؤْمِنُونَ", "You are believers", "antum mu'minoona"),
      card("قَبْلَ الصَّلَاةِ", "before the prayer", "qablas-salaati"),
      card("بَعْدَ الدَّرْسِ", "after the lesson", "ba'dad-darsi"),
    ],
    parseText: "هُمْ طُلَّابٌ",
    parseTokens: [token("هُمْ", "مبتدأ", "they"), token("طُلَّابٌ", "خبر", "students")],
    conversation: ["مَنْ هٰؤُلَاءِ؟", "هُمْ طُلَّابٌ"],
    conversationDistractor: "نَحْنُ مُسْلِمُونَ",
    distractor: "a book / books",
    blankDistractor: "عِنْدَ",
    noorTip: "أَنْتُمْ in Al-Kafirun speaks straight to a group — you all — and عَابِدُونَ after it carries the ون plural ending from Chapter 9.",
    noorTipUr: "الکافرون میں أَنْتُمْ براہِ راست جماعت سے بات کرتا ہے — تم سب — اور اس کے بعد عَابِدُونَ باب 9 والی ون کی علامت رکھتا ہے۔",
    focuses: [
      { title: "They — هُمْ / هُنَّ", titleAr: "هُمْ وَهُنَّ", grammarTerm: "ضمير غائب جمع", reveal: "Arabic has two words for 'they' — هُمْ for a male or mixed group, هُنَّ for a female-only group. Both stand alone.", hookQuestion: "When would you use هُنَّ instead of هُمْ?" },
      { title: "We — نَحْنُ", titleAr: "نَحْنُ", grammarTerm: "ضمير المتكلمين", reveal: "نَحْنُ includes the speaker and others. Al-Fatihah says نَعْبُدُ (we worship) — the same 'we' inside a verb.", hookQuestion: "Why does Al-Fatihah say نَعْبُدُ (we) rather than أَعْبُدُ (I)?" },
      { title: "You all — أَنْتُمْ / أَنْتُنَّ", titleAr: "أَنْتُمْ وَأَنْتُنَّ", grammarTerm: "ضمير مخاطب جمع", reveal: "أَنْتُمْ speaks to a male or mixed group, أَنْتُنَّ to a female-only group — the same choice as هُمْ / هُنَّ, facing the group.", hookQuestion: "What separates هُمْ طُلَّابٌ from أَنْتُمْ طُلَّابٌ?" },
      { title: "Before — قَبْلَ", titleAr: "قَبْلَ", grammarTerm: "ظرف زمان", reveal: "قَبْلَ joins the noun after it into one phrase — قَبْلَ الصَّلَاةِ — and names the earlier of two events.", hookQuestion: "What does قَبْلَ need after it to complete its meaning?" },
      { title: "After — بَعْدَ", titleAr: "بَعْدَ", grammarTerm: "ظرف زمان", reveal: "بَعْدَ follows the same phrase pattern — بَعْدَ الدَّرْسِ — and names the later event.", hookQuestion: "In رَجَعَ بَعْدَ الدَّرْسِ, which happened first?" },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // BOOK 2 OPENS — Chapters 11-15
  // ─────────────────────────────────────────────────────────────────────────

  // ── Ch11 ── The Home and Family ───────────────────────────────────────────
  // Docs/proposals/chapter-11-content-proposal.md (2026-09-19): أَبِي / أُمِّي
  // with a Quran checkpoint that contains the target (Al-Qasas 28:25), the four
  // family words plus the encountered plural إِخْوَةٌ, فِيهِ / فِيهَا chosen from
  // the antecedent (Al-Baqarah 2:2 / 2:30), and بُيُوتِكُمْ assembled step by step.
  {
    order: 11,
    sourceFile: "reader_lecture_11_bayt_usra.md",
    title: "The Home and Family",
    titleUr: "گھر اور خاندان",
    titleAr: "الْبَيْت وَالأُسْرَة",
    description: "Family vocabulary, the ي of 'my', فِيهِ / فِيهَا for inside, and بُيُوتِكُمْ.",
    descriptionUr: "خاندانی الفاظ، 'میرا' کی ي، اندر کے لیے فِيهِ / فِيهَا، اور بُيُوتِكُمْ۔",
    hook: { ayahAr: "وَاللَّهُ جَعَلَ لَكُم مِّن بُيُوتِكُمْ سَكَنًا", ayahRef: "An-Nahl 16:80", highlightedWord: "بُيُوتِكُمْ" },
    examples: [
      card("أَبِي فِي الْبَيْتِ", "My father is in the house", "abee fil-bayt"),
      card("أُمِّي فِي الْمَطْبَخِ", "My mother is in the kitchen", "ummee fil-matbakh"),
      card("الْكِتَابُ فِي الْحَقِيبَةِ — هُوَ فِيهَا", "The book is in the bag — it is in it", "al-kitaabu fil-haqeebati — huwa feeha"),
      card("الْقَلَمُ فِي الدُّرْجِ — هُوَ فِيهِ", "The pen is in the drawer — it is in it", "al-qalamu fid-durji — huwa feeh"),
    ],
    parseText: "أَبِي فِي الْبَيْتِ",
    parseTokens: [token("أَبِي", "مبتدأ", "my father"), token("فِي", "حرف جر", "in"), token("الْبَيْتِ", "خبر", "the house")],
    conversation: ["أَيْنَ أَبُوكَ؟", "أَبِي فِي الْبَيْتِ"],
    conversationDistractor: "هُمْ طُلَّابٌ",
    distractor: "after the lesson",
    blankDistractor: "عِنْدَهَا",
    noorTip: "بُيُوتِكُمْ — your homes — is بَيْتٌ made plural (بُيُوتٌ) with كُمْ, your (to a group), attached at the end.",
    noorTipUr: "بُیُوتِکُمْ میں بيت کی جمع مکسر اور جماعت سے خطاب کی ضمیر كُمْ دونوں ہیں۔",
    focuses: [
      { title: "My Father and Mother", titleAr: "أَبِي وَأُمِّي", grammarTerm: "أسماء الأسرة مع ياء المتكلم", reveal: "Family words take the attached ي of 'my' — أَبِي (my father), أُمِّي (my mother) — the same word the Quran uses in إِنَّ أَبِي يَدْعُوكَ.", hookQuestion: "What is the pattern for attaching 'my' to أَبٌ?" },
      { title: "Family Vocabulary", titleAr: "مُفْرَدَات الأُسْرَة", grammarTerm: "مفردات", reveal: "You built the core family vocabulary: أَبٌ (father), أُمٌّ (mother), أَخٌ (brother), أُخْتٌ (sister), and met إِخْوَةٌ (brothers) as the Quranic plural of أَخٌ.", hookQuestion: "How do you say 'my brother' and 'my sister'?" },
      { title: "In It — Masculine — فِيهِ", titleAr: "فِيهِ", grammarTerm: "جار ومجرور مع ضمير", reveal: "فِي (in) + هِ (it, masculine) = فِيهِ — 'in it', pointing back to a masculine noun such as الْكِتَابُ.", hookQuestion: "Why does the pen use فِيهِ but the bag uses فِيهَا?" },
      { title: "In It — Feminine — فِيهَا", titleAr: "فِيهَا", grammarTerm: "جار ومجرور مع ضمير مؤنث", reveal: "فِي (in) + هَا (it, feminine) = فِيهَا — 'in it', pointing back to a feminine noun such as الْأَرْضِ.", hookQuestion: "How does Arabic keep track of what 'it' refers to across a sentence?" },
      { title: "The Home in the Quran", titleAr: "الْبَيْت فِي الْقُرْآن", grammarTerm: "مفردات قرآنية", reveal: "You parsed بُيُوتِكُمْ — the broken plural of بَيْتٌ with كُمْ, your (to a group), attached.", hookQuestion: "What is the broken plural of بَيْتٌ?" },
    ],
  },

  // ── Ch12 ── Introductions and Personal Questions ──────────────────────────
  // Docs/proposals/chapter-12-content-proposal.md (2026-09-19): مَا اسْمُكَ؟ /
  // اِسْمِي with Al-Hujurat 49:13 excerpted at لِتَعَارَفُوا, مِنْ أَيْنَ with the
  // origin question of Abasa 80:18, professions with عَمَلَكُمْ in At-Tawbah
  // 9:105, and ذَهَبَ / رَجَعَ / خَلَقَ with the exact form خَلَقَ in Al-Alaq 96:2.
  // Feminine address forms are recognition only; the spoken lesson is
  // listening only.
  {
    order: 12,
    sourceFile: "reader_lecture_12_ta'aruf.md",
    title: "Introductions and Personal Questions",
    titleUr: "تعارف اور ذاتی سوالات",
    titleAr: "التَّعَارُف وَالأَسْئِلَة الشَّخْصِيَّة",
    description: "Asking and answering about name, origin and profession; ذَهَبَ, رَجَعَ and خَلَقَ as recognition words; classroom phrases.",
    descriptionUr: "نام، اصل اور پیشے کے بارے میں پوچھنا اور بتانا؛ ذَهَبَ، رَجَعَ اور خَلَقَ بطور پہچان کے الفاظ؛ درس گاہ کے جملے۔",
    hook: { ayahAr: "وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا", ayahRef: "Al-Hujurat 49:13", highlightedWord: "لِتَعَارَفُوا" },
    examples: [
      card("مَا اسْمُكَ؟ — اِسْمِي أَحْمَدُ", "What is your name? — My name is Ahmad", "maa ismuka — ismee ahmad"),
      card("مِنْ أَيْنَ أَنْتَ؟ — أَنَا مِنْ بَاكِسْتَانَ", "Where are you from? — I am from Pakistan", "min ayna anta — anaa min baakistaan"),
      card("مَا مِهْنَتُكَ؟ — أَنَا طَبِيبٌ", "What is your profession? — I am a doctor", "maa mihnatuka — anaa tabeeb"),
      card("ذَهَبَ إِلَى الْمَسْجِدِ", "He went to the mosque", "dhahaba ilal-masjid"),
    ],
    parseText: "أَنَا مِنْ بَاكِسْتَانَ",
    parseTokens: [token("أَنَا", "مبتدأ", "I"), token("مِنْ", "حرف جر", "from"), token("بَاكِسْتَانَ", "خبر", "Pakistan")],
    conversation: ["مَا اسْمُكَ؟", "اِسْمِي عُمَرُ"],
    conversationDistractor: "أَبِي فِي الْبَيْتِ",
    distractor: "My father is in the house",
    blankDistractor: "مِهْنَتُهُ",
    noorTip: "لِتَعَارَفُوا — that you may know one another — is the purpose Al-Hujurat gives for peoples and tribes; asking a name is its first step.",
    noorTipUr: "لِتَعَارَفُوا — تاکہ تم ایک دوسرے کو پہچانو — الحجرات قوموں اور قبیلوں کا یہی مقصد بتاتی ہے؛ نام پوچھنا اس کا پہلا قدم ہے۔",
    focuses: [
      { title: "What Is Your Name?", titleAr: "مَا اسْمُكَ؟", grammarTerm: "جملة استفهامية", reveal: "مَا opens the question and اِسْمُكَ, your name, follows it; the answer is اِسْمِي and the name. مَا اسْمُكِ؟ addresses a woman.", hookQuestion: "In مَا اسْمُكَ؟, which word carries 'your'?" },
      { title: "Where Are You From?", titleAr: "مِنْ أَيْنَ أَنْتَ؟", grammarTerm: "استفهام عن الأصل", reveal: "مِنْ (from) + أَيْنَ (where) asks about origin; أَيْنَ alone asks about location. Answer أَنَا مِنْ and the place.", hookQuestion: "How is مِنْ أَيْنَ different from just أَيْنَ?" },
      { title: "Professions", titleAr: "الْمِهَن", grammarTerm: "مفردات", reveal: "مَا مِهْنَتُكَ؟ and four answers: طَبِيبٌ, مُعَلِّمٌ, مُهَنْدِسٌ, تَاجِرٌ, each as a full sentence with أَنَا; add ة for a woman.", hookQuestion: "What changes when the doctor is a woman?" },
      { title: "Past-Tense Recognition", titleAr: "تَعَرُّفُ الْفِعْلِ الْمَاضِي", grammarTerm: "فعل ماض للتعارف", reveal: "ذَهَبَ, رَجَعَ and خَلَقَ are recognised as whole words; خَلَقَ opens Al-Alaq 96:2 in exactly that form. Conjugation comes later.", hookQuestion: "Which word in خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ is the verb?" },
      { title: "Classroom and Halaqa Phrases", titleAr: "عِبَارَاتُ الدَّرْسِ وَالْحَلْقَةِ", grammarTerm: "عبارات مسموعة", reveal: "Twelve halaqa phrases for listening and recognition, from اِفْتَحُوا الْكُتُبَ to جَزَاكَ اللهُ خَيْرًا يَا أُسْتَاذُ; no grammar is assessed.", hookQuestion: "How does a learner politely begin a question to the teacher?" },
    ],
  },

  // ── Ch13 ── Reading Plurals in the Quran ─────────────────────────────────
  // Docs/proposals/chapter-13-content-proposal.md (2026-09-20): Chapter 9 stays
  // the introduction to the three plural families; Chapter 13 applies them to
  // Quranic forms — ـُونَ with the encountered ـِينَ shape (Al-Kafirun 109:1,
  // الْكَافِرُونَ), ـَات (Al-Ahzab 33:35 excerpt, وَالْمُؤْمِنَاتِ), broken pairs
  // (An-Nas 114:5, صُدُورِ) and a mixed reading lab (Al-Baqarah 2:5,
  // الْمُفْلِحُونَ). Case terminology, number grammar and adjective agreement
  // (Chapter 14) are out of scope.
  {
    order: 13,
    // The former reader_lecture_13_jama_introduction.md never existed in the
    // repository; the approved proposal is the content specification.
    sourceFile: "Docs/proposals/chapter-13-content-proposal.md",
    title: "Reading Plurals in the Quran",
    titleUr: "قرآن میں جمع پڑھنا",
    titleAr: "قِرَاءَةُ الْجُمُوعِ فِي الْقُرْآنِ",
    description: "Recognising the three plural families in Quranic forms and short sentences: ـُونَ and ـِينَ, ـَات, and broken plurals learned with their singulars.",
    descriptionUr: "قرآنی صورتوں اور مختصر جملوں میں جمع کے تین خاندانوں کی پہچان: ـُونَ اور ـِينَ، ـَات، اور جمع مکسر اپنے واحد کے ساتھ۔",
    hook: { ayahAr: "قُلْ يَا أَيُّهَا الْكَافِرُونَ", ayahRef: "Al-Kafirun 109:1", highlightedWord: "الْكَافِرُونَ" },
    examples: [
      card("كَافِرٌ / كَافِرُونَ", "a disbeliever / disbelievers (sound masculine plural)", "kāfirun / kāfirūna"),
      card("مُؤْمِنَةٌ / مُؤْمِنَاتٌ", "a believing woman / believing women (sound feminine plural)", "muʾminatun / muʾminātun"),
      card("صَدْرٌ / صُدُورٌ", "a chest / chests (broken plural)", "ṣadrun / ṣudūrun"),
      card("الْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ", "the believing men and the believing women", "al-muʾminūna wal-muʾminātu"),
    ],
    parseText: "هَؤُلَاءِ مُؤْمِنُونَ",
    parseTokens: [token("هَؤُلَاءِ", "مبتدأ", "these"), token("مُؤْمِنُونَ", "خبر", "believers")],
    conversation: ["مَنْ هَؤُلَاءِ؟", "هَؤُلَاءِ طُلَّابٌ"],
    conversationDistractor: "مَا اسْمُكَ؟",
    distractor: "What is your name?",
    blankDistractor: "مُؤْمِنَةٌ",
    noorTip: "الْكَافِرُونَ keeps كَافِر whole and adds ـُونَ — a sound masculine plural. When the Quran shows the same family as الْمُتَّقِينَ, the ending is ـِينَ but the family is the same.",
    noorTipUr: "الْكَافِرُونَ میں كَافِر پورا رہتا ہے اور ـُونَ لگتا ہے — جمع مذکر سالم۔ جب قرآن یہی خاندان الْمُتَّقِينَ کی صورت میں دکھائے تو آخر ـِينَ ہوتا ہے مگر خاندان وہی ہے۔",
    focuses: [
      { title: "Sound Masculine Plurals in Quranic Context", titleAr: "جَمْعُ الْمُذَكَّرِ السَّالِمِ فِي الْقُرْآنِ", grammarTerm: "جمع مذكر سالم", reveal: "كَافِرُونَ, مُؤْمِنُونَ and مُتَّقِينَ are one family: base whole, ending ـُونَ or ـِينَ. Why the ending changes comes later.", hookQuestion: "Which word in قُلْ يَا أَيُّهَا الْكَافِرُونَ is the plural?" },
      { title: "Sound Feminine Plurals in Quranic Context", titleAr: "جَمْعُ الْمُؤَنَّثِ السَّالِمِ فِي الْقُرْآنِ", grammarTerm: "جمع مؤنث سالم", reveal: "مُؤْمِنَةٌ → مُؤْمِنَاتٌ with a long ā; in Al-Ahzab 33:35 the target is وَالْمُؤْمِنَاتِ beside الْمُؤْمِنِينَ.", hookQuestion: "Which ending marks believing women rather than believing men?" },
      { title: "Broken Plurals in the Quran", titleAr: "الْجَمْعُ الْمُكَسَّرُ فِي الْقُرْآنِ", grammarTerm: "جمع مكسر", reveal: "صَدْرٌ / صُدُورٌ, كِتَابٌ / كُتُبٌ, بَيْتٌ / بُيُوتٌ, وَلَدٌ / أَوْلَادٌ, طَالِبٌ / طُلَّابٌ: no ending, the inside changes, learned as pairs.", hookQuestion: "In فِي صُدُورِ النَّاسِ, which word is the broken plural?" },
      { title: "Plural Reading Lab", titleAr: "مُخْتَبَرُ قِرَاءَةِ الْجُمُوعِ", grammarTerm: "تطبيق", reveal: "Find the base word, look at the ending, look inside: الْمُفْلِحُونَ in Al-Baqarah 2:5 is sound masculine. No adjective or number grammar is assessed.", hookQuestion: "Which family is الْمُفْلِحُونَ, and what is its singular?" },
    ],
  },

  // ── Ch14 ── Describing Plurals ────────────────────────────────────────────
  {
    order: 14,
    sourceFile: "reader_lecture_14_wasf_jama.md",
    title: "Describing Plurals",
    titleAr: "وَصْف الْجَمْع",
    description: "Adjective agreement with plural nouns — and the important rule for non-human plurals.",
    hook: { ayahAr: "وَالْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ بَعْضُهُمْ أَوْلِيَاءُ بَعْضٍ", ayahRef: "At-Tawbah 9:71", highlightedWord: "الْمُؤْمِنُونَ" },
    examples: [
      card("الطُّلَّابُ الْمُجْتَهِدُونَ نَجَحُوا", "The hardworking students succeeded", "at-tullaabul-mujtahidoona najahhoo"),
      card("الطَّالِبَاتُ الْمُجْتَهِدَاتُ نَجَحْنَ", "The hardworking female students succeeded", "at-taalibaatul-mujtahidaatu najahhna"),
      card("الْكُتُبُ الْجَدِيدَةُ عَلَى الْمَكْتَبِ", "The new books are on the desk", "al-kutubu al-jadeeda alal-maktab"),
      card("الْمَسَاجِدُ الْكَبِيرَةُ جَمِيلَةٌ", "The large mosques are beautiful", "al-masaajidu al-kabeera jameela"),
    ],
    parseText: "الْكُتُبُ الْجَدِيدَةُ عَلَى الْمَكْتَبِ",
    parseTokens: [token("الْكُتُبُ", "مبتدأ", "the books"), token("الْجَدِيدَةُ", "نعت", "new"), token("عَلَى", "حرف جر", "on"), token("الْمَكْتَبِ", "مضاف إليه", "the desk")],
    conversation: ["كَيْفَ الطُّلَّابُ؟", "الطُّلَّابُ مُجْتَهِدُونَ وَنَاجِحُونَ"],
    conversationDistractor: "الطَّالِبَاتُ الْمُجْتَهِدَاتُ",
    distractor: "broken plurals of books and houses",
    blankDistractor: "كَبِيرُونَ",
    noorTip: "الْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ — two sound plurals paired together as a community of believers.",
    noorTipUr: "الْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ — مرد اور عورت مؤمنین ایک دوسرے کے دوست ہیں — جمع مذکر اور مؤنث کا جوڑا۔",
    focuses: [
      { title: "Human Plural + Plural Adjective", titleAr: "جَمْع الْعَاقِل + صِفَة جَمْع", grammarTerm: "نعت جمع", reveal: "Human plurals take plural adjectives — الطُّلَّابُ الْمُجْتَهِدُونَ (the hardworking students).", hookQuestion: "Why does مُجْتَهِدُونَ end in ون when describing الطُّلَّاب?" },
      { title: "Feminine Human Plural", titleAr: "جَمْع مُؤَنَّث + صِفَة مُؤَنَّثَة جَمْع", grammarTerm: "نعت جمع مؤنث", reveal: "Feminine human plurals take feminine plural adjectives — الطَّالِبَاتُ الْمُجْتَهِدَاتُ.", hookQuestion: "How does the adjective change from مُجْتَهِدُونَ to مُجْتَهِدَاتٌ?" },
      { title: "Non-Human Plural — Feminine Singular Adjective", titleAr: "جَمْع غَيْر الْعَاقِل + صِفَة مُفْرَدَة مُؤَنَّثَة", grammarTerm: "قاعدة غير العاقل", reveal: "This is a critical Arabic rule — non-human broken plurals take a FEMININE SINGULAR adjective: الْكُتُبُ الْجَدِيدَةُ (not الجديدون).", hookQuestion: "Why is الْجَدِيدَةُ feminine singular when describing الْكُتُبُ (plural)?" },
      { title: "Mosques Are Beautiful", titleAr: "الْمَسَاجِدُ الْكَبِيرَةُ جَمِيلَةٌ", grammarTerm: "تطبيق قاعدة غير العاقل", reveal: "You applied the non-human plural rule to mosques — الْمَسَاجِدُ takes الْكَبِيرَةُ (feminine singular), not الكَبِيرُونَ.", hookQuestion: "Would الْأَقْلَامُ (pens) take a masculine plural or feminine singular adjective?" },
    ],
  },

  // ── Ch15 ── Demonstratives Expanded — هَؤُلَاءِ وَأُولَئِكَ ─────────────────
  {
    order: 15,
    sourceFile: "reader_lecture_15_haulai_ulaika.md",
    title: "Demonstratives Expanded — These and Those",
    titleAr: "هَؤُلَاءِ وَأُولَئِكَ",
    description: "Plural demonstratives for people and things — near and far groups.",
    hook: { ayahAr: "أُولَئِكَ عَلَى هُدًى مِّن رَّبِّهِمْ", ayahRef: "Al-Baqarah 2:5", highlightedWord: "أُولَئِكَ" },
    examples: [
      card("هَؤُلَاءِ هُمُ الْمُؤْمِنُونَ", "These are the believers", "haa'ulaa'i humul-mu'minoon"),
      card("أُولَئِكَ هُمُ الْمُفْلِحُونَ", "Those are the successful ones", "ulaa'ika humul-muflihoon"),
      card("هَؤُلَاءِ طُلَّابٌ مُجْتَهِدُونَ", "These are hardworking students", "haa'ulaa'i tullaabun mujtahidoon"),
      card("أُولَئِكَ عَلَى هُدًى مِنْ رَبِّهِمْ", "Those are upon guidance from their Lord", "ulaa'ika 'alaa hudan min rabbihim"),
    ],
    parseText: "أُولَئِكَ هُمُ الْمُفْلِحُونَ",
    parseTokens: [token("أُولَئِكَ", "مبتدأ", "those"), token("هُمُ", "ضمير فصل", "they"), token("الْمُفْلِحُونَ", "خبر", "the successful")],
    conversation: ["مَنْ هَؤُلَاءِ؟", "هَؤُلَاءِ أَصْدِقَائِي الطُّلَّابُ"],
    conversationDistractor: "الْمَسَاجِدُ الْكَبِيرَةُ جَمِيلَةٌ",
    distractor: "The new books are on the desk",
    blankDistractor: "هٰذَا",
    noorTip: "أُولَئِكَ appears in the Quran to point to the believers who will succeed — distance here is honour.",
    noorTipUr: "أُولَئِكَ قرآن میں کامیاب مؤمنین کی طرف اشارہ کرتا ہے — دوری یہاں تعظیم کے لیے ہے۔",
    focuses: [
      { title: "These — هَؤُلَاءِ", titleAr: "هَؤُلَاءِ", grammarTerm: "اسم إشارة للجمع القريب", reveal: "هَؤُلَاءِ points to a nearby group of people — near in place or in the speaker's focus.", hookQuestion: "In which situations would you use هَؤُلَاءِ rather than هٰذَا?" },
      { title: "Those — أُولَئِكَ", titleAr: "أُولَئِكَ", grammarTerm: "اسم إشارة للجمع البعيد", reveal: "أُولَئِكَ points to a far group. The Quran uses it to elevate — those believers, distant from the speaker, are honoured.", hookQuestion: "Why does Al-Baqarah use أُولَئِكَ (far) for the believers who are on guidance?" },
      { title: "ضَمِير الْفَصْل — Separating Pronoun", titleAr: "هُمُ لِلتَّوْكِيد", grammarTerm: "ضمير فصل", reveal: "In أُولَئِكَ هُمُ الْمُفْلِحُونَ, the هُمُ is not the subject — it is a separating pronoun that adds emphasis: 'those (and no one else) are the successful'.", hookQuestion: "What does هُمُ add in أُولَئِكَ هُمُ الْمُفْلِحُونَ?" },
      { title: "Completing the Pointing System", titleAr: "مَنْظُومَة أَسْمَاء الإِشَارَة", grammarTerm: "كل أسماء الإشارة", reveal: "You now know all Arabic pointing words: هٰذَا (near-m), هٰذِهِ (near-f), ذٰلِكَ (far-m), تِلْكَ (far-f), هَؤُلَاءِ (near-pl), أُولَئِكَ (far-pl).", hookQuestion: "Write all six Arabic pointing words in a table of near/far × masculine/feminine/plural." },
    ],
  },

];

const chapters = specs.map(chapter);

module.exports = { chapters, specs };
