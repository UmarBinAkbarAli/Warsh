import {nanoid} from "nanoid";
import type {DiscoverCard, DiscoverCardType} from "../schemas/discover-cards";
import type {Exercise, ExerciseType} from "../schemas/exercises";

/**
 * Creates a fresh candidate ID for a new exercise.
 * Format: ex_<nanoid(12)> — e.g. ex_abc123defg
 */
export function createExerciseId(): string {
  return `ex_${nanoid(12)}`;
}

// ============================================================================
// STARTER DISCOVER CARDS
// ============================================================================

export function createStarterCard(type: DiscoverCardType): DiscoverCard {
  const base = {
    image_url: "",
    audio_url: "",
  };

  switch (type) {
    case "WORD":
      return {
        type: "WORD",
        text: {ar: "هَذَا", ar_plain: "هذا", translit: "hadha", en: "this", ur: "یہ"},
        ...base,
        introduces_vocab: {ar_plain: "هذا"},
      };
    case "CONCEPT":
      return {
        type: "CONCEPT",
        concept: {en: "Arabic concept name", ar: "مَفْهُوم", ur: "عربی تصور"},
        explanation: {en: "Short explanation of the concept.", ur: "تصور کی مختصر وضاحت۔"},
        examples: [
          {ar: "هَذَا كِتَابٌ", ar_plain: "هذا كتاب", translit: "hadha kitabun", en: "This is a book.", ur: "یہ ایک کتاب ہے۔"},
        ],
        ...base,
      };
    case "EXAMPLE":
      return {
        type: "EXAMPLE",
        text: {ar: "هَذَا كِتَابٌ", ar_plain: "هذا كتاب", translit: "hadha kitabun", en: "This is a book.", ur: "یہ ایک کتاب ہے۔"},
        explanation: {en: "Short explanation of what this example demonstrates.", ur: "یہ مثال کیا دکھاتی ہے اس کی مختصر وضاحت۔"},
        ...base,
      };
    case "CONTRAST":
      return {
        type: "CONTRAST",
        concept: {en: "Near vs far", ar: "قَرِيب وَبَعِيد", ur: "قریب اور دور"},
        explanation: {en: "Short explanation of the contrast.", ur: "فرق کی مختصر وضاحت۔"},
        examples: [
          {ar: "هَذَا كِتَابٌ", ar_plain: "هذا كتاب", translit: "hadha kitabun", en: "This is a book.", ur: "یہ ایک کتاب ہے۔"},
          {ar: "ذٰلِكَ كِتَابٌ", ar_plain: "ذلك كتاب", translit: "dhalika kitabun", en: "That is a book.", ur: "وہ ایک کتاب ہے۔"},
        ],
        ...base,
      };
    case "AYAH_PREVIEW":
      return {
        type: "AYAH_PREVIEW",
        concept: {en: "Concept in the Quran", ar: "المفهوم في القرآن", ur: "قرآن میں تصور"},
        explanation: {en: "Short explanation of how the concept appears in the ayah.", ur: "آیت میں یہ تصور کیسے آتا ہے اس کی مختصر وضاحت۔"},
        examples: [
          {ar: "وَالْمُؤْمِنَاتُ", ar_plain: "والمؤمنات", translit: "wal-mu'minat", en: "and the believing women", ur: "اور ایمان والی عورتیں"},
        ],
        ...base,
      };
    case "GRAMMAR_NOTE":
      return {
        type: "GRAMMAR_NOTE",
        title: {en: "Grammar note", ar: "Ù…Ù„Ø§Ø­Ø¸Ø© Ù†Ø­ÙˆÙŠØ©", ur: "Ú¯Ø±Ø§Ù…Ø± Ù†ÙˆÙ¹"},
        body: {en: "Short grammar note.", ur: "Ù…Ø®ØªØµØ± Ú¯Ø±Ø§Ù…Ø± Ù†ÙˆÙ¹Û”"},
        ...base,
      };
    case "SENTENCE":
      return {
        type: "SENTENCE",
        text: {ar: "Ù‡ÙŽØ°ÙŽØ§ ÙƒÙØªÙŽØ§Ø¨ÙŒ", ar_plain: "Ù‡Ø°Ø§ ÙƒØªØ§Ø¨", translit: "hadha kitabun", en: "This is a book.", ur: "ÛŒÛ Ø§ÛŒÚ© Ú©ØªØ§Ø¨ ÛÛ’Û”"},
        explanation: {en: "Short sentence note.", ur: "Ø¬Ù…Ù„Û’ Ú©ÛŒ Ù…Ø®ØªØµØ± ÙˆØ¶Ø§Ø­ØªÛ”"},
        ...base,
      };
  }
}

// ============================================================================
// STARTER EXERCISES — 5 v1 authoring scope types
// ============================================================================

export function createStarterExercise(type: ExerciseType): Exercise {
  const id = createExerciseId();
  const base = {id, xp_value: 1};

  switch (type) {
    case "TRUE_FALSE":
      return {
        ...base,
        type: "TRUE_FALSE",
        statement: {
          en: "The word مَسْجِد means 'pen'.",
          ur: "لفظ مسجد کا مطلب 'قلم' ہے۔",
          ar_example: {ar: "مَسْجِد", ar_plain: "مسجد", translit: "masjid", en: "mosque"},
        },
        correct_answer: false,
        explanation_on_wrong: {
          en: "مَسْجِد means 'mosque'. The word for 'pen' is قَلَم.",
          ur: "مسجد کا مطلب مسجد ہے۔ قلم کے لیے لفظ قَلَم ہے۔",
        },
      };
    case "TAP_TRANSLATION":
      return {
        ...base,
        type: "TAP_TRANSLATION",
        prompt: {ar: "هَذَا", ar_plain: "هذا", translit: "hadha", en: "this"},
        options: [
          {en: "that", ur: "وہ"},
          {en: "this", ur: "یہ"},
          {en: "here", ur: "یہاں"},
          {en: "where", ur: "کہاں"},
        ],
        correct_index: 1,
        explanation_on_wrong: {
          en: "هَذَا points at something near.",
          ur: "هَذَا کسی قریب چیز کی طرف اشارہ ہے۔",
        },
      };
    case "FILL_BLANK":
      return {
        ...base,
        type: "FILL_BLANK",
        mode: "TAP",
        sentence_ar: "___ بَيْتٌ",
        hint: {en: "This is a house.", ur: "یہ ایک گھر ہے۔"},
        options: [
          {ar: "كِتَابٌ", ar_plain: "كتاب", translit: "kitabun", en: "book"},
          {ar: "هَذَا", ar_plain: "هذا", translit: "hadha", en: "this"},
          {ar: "قَلَمٌ", ar_plain: "قلم", translit: "qalamun", en: "pen"},
          {ar: "مَسْجِدٌ", ar_plain: "مسجد", translit: "masjidun", en: "mosque"},
        ],
        correct_answer: {ar: "هَذَا", ar_plain: "هذا", translit: "hadha", en: "this"},
      };
    case "BUILD_SENTENCE":
      return {
        ...base,
        type: "BUILD_SENTENCE",
        target_translation: {en: "This is a book.", ur: "یہ ایک کتاب ہے۔"},
        tiles: [
          {ar: "كِتَابٌ", ar_plain: "كتاب", translit: "kitabun", en: "book"},
          {ar: "هَذَا", ar_plain: "هذا", translit: "hadha", en: "this"},
        ],
        correct_order: [1, 0],
        explanation_on_wrong: {
          en: "In Arabic, هَذَا comes first, then the noun.",
          ur: "عربی میں پہلے هَذَا آتا ہے، پھر اسم۔",
        },
      };
    case "MATCHING":
      return {
        ...base,
        type: "MATCHING",
        left_column: [
          {ar: "كِتَاب", ar_plain: "كتاب", translit: "kitab", en: "book"},
          {ar: "قَلَم", ar_plain: "قلم", translit: "qalam", en: "pen"},
        ],
        right_column: [
          {en: "book", ur: "کتاب"},
          {en: "pen", ur: "قلم"},
        ],
        correct_pairs: [
          [0, 0],
          [1, 1],
        ],
      };
    // Remaining 10 types — schemas support them; factory is here for completeness
    case "GRAMMAR_PARSE":
      return {
        ...base,
        type: "GRAMMAR_PARSE",
        sentence_ar: "الطَّالِبَاتُ مُجْتَهِدَاتٌ",
        words: [
          {ar: "الطَّالِبَاتُ", ar_plain: "الطالبات", translit: "at-talibatu", en: "the female students", ur: "طالبات"},
          {ar: "مُجْتَهِدَاتٌ", ar_plain: "مجتهدات", translit: "mujtahidatun", en: "hardworking", ur: "محنتی"},
        ],
        available_roles: ["SUBJECT", "PREDICATE", "ADJECTIVE", "VERB"],
        correct_roles: ["SUBJECT", "PREDICATE"],
      };
    case "CONVERSATION_BUILDER":
      return {
        ...base,
        type: "CONVERSATION_BUILDER",
        prompt_line: {ar: "كَيْفَ حَالُكَ؟", ar_plain: "كيف حالك", translit: "kayfa haluk", en: "How are you?"},
        response_mode: "PICK",
        options: [
          {ar: "أَنَا بِخَيْرٍ", ar_plain: "أنا بخير", translit: "ana bikhayrin", en: "I am well."},
          {ar: "أَنَا لَيْسَ بِخَيْرٍ", ar_plain: "أنا ليس بخير", translit: "ana laysa bikhayrin", en: "I am not well."},
        ],
        correct_option_index: 0,
      };
    case "SHADOW_REPEAT":
      return {
        ...base,
        type: "SHADOW_REPEAT",
        phrase: {ar: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", ar_plain: "بسم الله الرحمن الرحيم", translit: "bismillah", en: "In the name of Allah"},
        audio_url: "https://cdn.warsh.app/audio/vocab/bismillah.mp3",
        self_grading: true,
      };
    case "AUDIO_RECOGNITION":
      return {
        ...base,
        type: "AUDIO_RECOGNITION",
        arabic_text: "هَذَا",
        options: [
          {en: "this", ur: "یہ"},
          {en: "that", ur: "وہ"},
          {en: "what", ur: "کیا"},
          {en: "who", ur: "کون"},
        ],
        correct_index: 0,
      };
    case "WRITE_ARABIC":
      return {
        ...base,
        type: "WRITE_ARABIC",
        prompt: {en: "Write the word for 'book' in Arabic.", ur: "'کتاب' عربی میں لکھیں۔"},
        correct_answer: {ar: "كِتَاب", ar_plain: "كتاب", translit: "kitab", en: "book"},
        hint_available: true,
      };
    case "HARAKAH_PLACEMENT":
      return {
        ...base,
        type: "HARAKAH_PLACEMENT",
        word_unvowelled: "كتاب",
        correct_vowelled: "كِتَاب",
        hint: {en: "book", ur: "کتاب"},
      };
    case "WORD_ORDER":
      return {
        ...base,
        type: "WORD_ORDER",
        tiles: [
          {ar: "هَذَا", ar_plain: "هذا", translit: "hadha", en: "this"},
          {ar: "كِتَابٌ", ar_plain: "كتاب", translit: "kitabun", en: "book"},
        ],
        correct_order: [0, 1],
        context: {en: "Arrange into a sentence: 'This is a book.'", ur: "جملہ بنائیں: 'یہ ایک کتاب ہے۔'"},
      };
    case "TRANSLATE_TO_ARABIC":
      return {
        ...base,
        type: "TRANSLATE_TO_ARABIC",
        source: {en: "This is a book.", ur: "یہ ایک کتاب ہے۔"},
        acceptable_answers: [
          {ar: "هَذَا كِتَابٌ", ar_plain: "هذا كتاب", translit: "hadha kitabun", en: "This is a book."},
        ],
      };
    case "IDENTIFY_ROOT":
      return {
        ...base,
        type: "IDENTIFY_ROOT",
        word: {ar: "كِتَاب", ar_plain: "كتاب", translit: "kitab", en: "book"},
        options: ["ك ت ب", "ق ل م", "ب ي ت", "س ج د"],
        correct_index: 0,
      };
    case "MATCH_AYAH":
      return {
        ...base,
        type: "MATCH_AYAH",
        ayah_fragment: {ar: "وَالْمُؤْمِنَاتُ", surah_ref: "At-Tawbah 9:71"},
        options: [
          {en: "and the believing women", ur: "اور ایمان والی عورتیں"},
          {en: "and the believing men", ur: "اور ایمان والے مرد"},
          {en: "and the books", ur: "اور کتابیں"},
          {en: "and the two students", ur: "اور دو طالب علم"},
        ],
        correct_index: 0,
      };
  }
}
