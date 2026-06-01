/**
 * Form config registry for the lesson builder UI.
 * Maps each discover card type and exercise type to UI metadata:
 * - inputKind: the kind of input widget to render
 * - rtl: whether the primary text input is RTL (Arabic)
 * - required: whether the field is required
 * - playerSupported: whether the mobile player can render this type today
 * - authoringScope: whether the structured Add picker offers this type in v1
 */

export type InputKind =
  | "text"       // plain Latin text input
  | "arabic"     // RTL Arabic text input
  | "number"     // numeric input
  | "boolean"    // checkbox / toggle
  | "select"     // dropdown
  | "options"    // 4-option selector (for options arrays)
  | "matching_pairs" // pairwise matching editor
  | "tiles";     // sentence tile reordering

export interface FieldConfig {
  label: { en: string; ur?: string };
  inputKind: InputKind;
  rtl?: boolean;
  required?: boolean;
}

export interface TypeFormConfig {
  type: string;
  label: { en: string; ur?: string };
  playerSupported: boolean;
  authoringScope: boolean;
  fields: Record<string, FieldConfig>;
}

// ============================================================================
// DISCOVER CARD form configs
// ============================================================================

export const discoverCardFormConfig: Record<string, TypeFormConfig> = {
  WORD: {
    type: "WORD",
    label: { en: "Word Card", ur: "لفظ کارڈ" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "text.ar": { label: { en: "Arabic (with harakat)", ur: "عربی (حرکات کے ساتھ)" }, inputKind: "arabic", rtl: true, required: true },
      "text.ar_plain": { label: { en: "Arabic (plain)", ur: "عربی (خالی)" }, inputKind: "arabic", rtl: true, required: true },
      "text.translit": { label: { en: "Transliteration", ur: " transliteretion" }, inputKind: "text", required: true },
      "text.en": { label: { en: "English", ur: "انگریزی" }, inputKind: "text", required: true },
      "text.ur": { label: { en: "Urdu", ur: "اردو" }, inputKind: "text", required: false },
      "image_url": { label: { en: "Image URL", ur: "تصویر URL" }, inputKind: "text", required: false },
      "audio_url": { label: { en: "Audio URL", ur: "آڈیو URL" }, inputKind: "text", required: false },
      "explanation.en": { label: { en: "Explanation (EN)", ur: "وضاحت (انگریزی)" }, inputKind: "text", required: false },
      "explanation.ur": { label: { en: "Explanation (UR)", ur: "وضاحت (اردو)" }, inputKind: "text", required: false },
    },
  },
  CONCEPT: {
    type: "CONCEPT",
    label: { en: "Concept Card", ur: "تصور کارڈ" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "concept.en": { label: { en: "Concept (EN)", ur: "تصور (انگریزی)" }, inputKind: "text", required: true },
      "concept.ar": { label: { en: "Concept (AR)", ur: "تصور (عربی)" }, inputKind: "arabic", rtl: true, required: false },
      "concept.ur": { label: { en: "Concept (UR)", ur: "تصور (اردو)" }, inputKind: "text", required: false },
      "explanation.en": { label: { en: "Explanation (EN)", ur: "وضاحت (انگریزی)" }, inputKind: "text", required: true },
      "explanation.ur": { label: { en: "Explanation (UR)", ur: "وضاحت (اردو)" }, inputKind: "text", required: false },
    },
  },
  EXAMPLE: {
    type: "EXAMPLE",
    label: { en: "Example Card", ur: "مثال کارڈ" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "text.ar": { label: { en: "Arabic sentence", ur: "عربی جملہ" }, inputKind: "arabic", rtl: true, required: false },
      "text.ar_plain": { label: { en: "Arabic (plain)", ur: "عربی (خالی)" }, inputKind: "arabic", rtl: true, required: false },
      "text.translit": { label: { en: "Transliteration", ur: "transliteration" }, inputKind: "text", required: false },
      "text.en": { label: { en: "English", ur: "انگریزی" }, inputKind: "text", required: false },
      "text.ur": { label: { en: "Urdu", ur: "اردو" }, inputKind: "text", required: false },
      "explanation.en": { label: { en: "Explanation (EN)", ur: "وضاحت (انگریزی)" }, inputKind: "text", required: false },
      "explanation.ur": { label: { en: "Explanation (UR)", ur: "وضاحت (اردو)" }, inputKind: "text", required: false },
    },
  },
  CONTRAST: {
    type: "CONTRAST",
    label: { en: "Contrast Card", ur: "فرق کارڈ" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "concept.en": { label: { en: "Contrast title (EN)", ur: "فرق عنوان (انگریزی)" }, inputKind: "text", required: true },
      "concept.ar": { label: { en: "Contrast title (AR)", ur: "فرق عنوان (عربی)" }, inputKind: "arabic", rtl: true, required: false },
      "concept.ur": { label: { en: "Contrast title (UR)", ur: "فرق عنوان (اردو)" }, inputKind: "text", required: false },
      "explanation.en": { label: { en: "Explanation (EN)", ur: "وضاحت (انگریزی)" }, inputKind: "text", required: false },
      "explanation.ur": { label: { en: "Explanation (UR)", ur: "وضاحت (اردو)" }, inputKind: "text", required: false },
    },
  },
  AYAH_PREVIEW: {
    type: "AYAH_PREVIEW",
    label: { en: "Quran Ayah Card", ur: "قرآن آیت کارڈ" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "concept.en": { label: { en: "Concept (EN)", ur: "تصور (انگریزی)" }, inputKind: "text", required: true },
      "concept.ar": { label: { en: "Concept (AR)", ur: "تصور (عربی)" }, inputKind: "arabic", rtl: true, required: false },
      "concept.ur": { label: { en: "Concept (UR)", ur: "تصور (اردو)" }, inputKind: "text", required: false },
      "explanation.en": { label: { en: "Explanation (EN)", ur: "وضاحت (انگریزی)" }, inputKind: "text", required: false },
      "explanation.ur": { label: { en: "Explanation (UR)", ur: "وضاحت (اردو)" }, inputKind: "text", required: false },
    },
  },
};

// ============================================================================
// EXERCISE form configs — all 15 player-supported; 5 v1 authoring scope
// ============================================================================

export const exerciseFormConfig: Record<string, TypeFormConfig> = {
  TRUE_FALSE: {
    type: "TRUE_FALSE",
    label: { en: "True / False", ur: "سچ / جھوٹ" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "statement.en": { label: { en: "Statement (EN)", ur: "بیان (انگریزی)" }, inputKind: "text", required: true },
      "statement.ur": { label: { en: "Statement (UR)", ur: "بیان (اردو)" }, inputKind: "text", required: false },
      "correct_answer": { label: { en: "Correct answer", ur: "درست جواب" }, inputKind: "select", required: true },
      "explanation_on_wrong.en": { label: { en: "Wrong explanation (EN)", ur: "غلطی کی وضاحت (انگریزی)" }, inputKind: "text", required: false },
      "explanation_on_wrong.ur": { label: { en: "Wrong explanation (UR)", ur: "غلطی کی وضاحت (اردو)" }, inputKind: "text", required: false },
    },
  },
  TAP_TRANSLATION: {
    type: "TAP_TRANSLATION",
    label: { en: "Tap Translation", ur: "ٹیپ ترجمہ" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "prompt.ar": { label: { en: "Arabic prompt", ur: "عربی سوال" }, inputKind: "arabic", rtl: true, required: true },
      "prompt.ar_plain": { label: { en: "Arabic (plain)", ur: "عربی (خالی)" }, inputKind: "arabic", rtl: true, required: true },
      "prompt.translit": { label: { en: "Transliteration", ur: "transliteration" }, inputKind: "text", required: false },
      "prompt.en": { label: { en: "English", ur: "انگریزی" }, inputKind: "text", required: true },
      "correct_index": { label: { en: "Correct option index (0–3)", ur: "درست آپشن انڈیکس" }, inputKind: "number", required: true },
      "options": { label: { en: "4 translation options", ur: "4 ترجمہ آپشنز" }, inputKind: "options", required: true },
      "explanation_on_wrong.en": { label: { en: "Wrong explanation (EN)", ur: "غلطی کی وضاحت" }, inputKind: "text", required: false },
      "explanation_on_wrong.ur": { label: { en: "Wrong explanation (UR)", ur: "غلطی کی وضاحت" }, inputKind: "text", required: false },
    },
  },
  FILL_BLANK: {
    type: "FILL_BLANK",
    label: { en: "Fill in the Blank", ur: "خالی جگہ پُر کریں" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      mode: { label: { en: "Mode", ur: "موڈ" }, inputKind: "select", required: true },
      sentence_ar: { label: { en: "Sentence with ___ for blank", ur: "جملہ ___ کے ساتھ" }, inputKind: "arabic", rtl: true, required: true },
      "hint.en": { label: { en: "Hint (EN)", ur: "اشارہ (انگریزی)" }, inputKind: "text", required: true },
      "hint.ur": { label: { en: "Hint (UR)", ur: "اشارہ (اردو)" }, inputKind: "text", required: false },
      options: { label: { en: "4 tap options", ur: "4 ٹیپ آپشنز" }, inputKind: "options", required: false },
      "correct_answer.ar": { label: { en: "Correct Arabic answer", ur: "درست عربی جواب" }, inputKind: "arabic", rtl: true, required: true },
      "correct_answer.ar_plain": { label: { en: "Arabic (plain)", ur: "عربی (خالی)" }, inputKind: "arabic", rtl: true, required: false },
      "correct_answer.translit": { label: { en: "Transliteration", ur: "transliteration" }, inputKind: "text", required: false },
      "correct_answer.en": { label: { en: "English", ur: "انگریزی" }, inputKind: "text", required: false },
    },
  },
  BUILD_SENTENCE: {
    type: "BUILD_SENTENCE",
    label: { en: "Build a Sentence", ur: "جملہ بنائیں" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      "target_translation.en": { label: { en: "Target translation (EN)", ur: "ہدف ترجمہ (انگریزی)" }, inputKind: "text", required: true },
      "target_translation.ur": { label: { en: "Target translation (UR)", ur: "ہدف ترجمہ (اردو)" }, inputKind: "text", required: false },
      tiles: { label: { en: "Word tiles", ur: "لفظ ٹائلز" }, inputKind: "tiles", required: true },
      correct_order: { label: { en: "Correct order (indices)", ur: "درست ترتیب" }, inputKind: "number", required: true },
      "explanation_on_wrong.en": { label: { en: "Wrong explanation (EN)", ur: "غلطی کی وضاحت" }, inputKind: "text", required: false },
      "explanation_on_wrong.ur": { label: { en: "Wrong explanation (UR)", ur: "غلطی کی وضاحت" }, inputKind: "text", required: false },
    },
  },
  MATCHING: {
    type: "MATCHING",
    label: { en: "Matching", ur: "میچنگ" },
    playerSupported: true,
    authoringScope: true,
    fields: {
      left_column: { label: { en: "Left column (Arabic words)", ur: "بائیں کالم (عربی الفاظ)" }, inputKind: "matching_pairs", required: true },
      right_column: { label: { en: "Right column (translations)", ur: "دائیں کالم (ترجمے)" }, inputKind: "matching_pairs", required: true },
      correct_pairs: { label: { en: "Correct pairs", ur: "درست جوڑے" }, inputKind: "matching_pairs", required: true },
    },
  },
  // Remaining 10 — playerSupported but authoringScope: false in v1
  GRAMMAR_PARSE: {
    type: "GRAMMAR_PARSE",
    label: { en: "Grammar Parse", ur: "گرامر تجزیہ" },
    playerSupported: true,
    authoringScope: false,
    fields: {},
  },
  CONVERSATION_BUILDER: {
    type: "CONVERSATION_BUILDER",
    label: { en: "Conversation Builder", ur: "گفتگو بنائیں" },
    playerSupported: true,
    authoringScope: false,
    fields: {},
  },
  SHADOW_REPEAT: {
    type: "SHADOW_REPEAT",
    label: { en: "Shadow Repeat", ur: "شیڈو ریپیٹ" },
    playerSupported: true,
    authoringScope: false,
    fields: {},
  },
  AUDIO_RECOGNITION: {
    type: "AUDIO_RECOGNITION",
    label: { en: "Audio Recognition", ur: "آڈیو پہچان" },
    playerSupported: true,
    authoringScope: false,
    fields: {},
  },
  WRITE_ARABIC: {
    type: "WRITE_ARABIC",
    label: { en: "Write Arabic", ur: "عربی لکھیں" },
    playerSupported: true,
    authoringScope: false,
    fields: {},
  },
  HARAKAH_PLACEMENT: {
    type: "HARAKAH_PLACEMENT",
    label: { en: "Harakah Placement", ur: "حرکت لگانا" },
    playerSupported: true,
    authoringScope: false,
    fields: {},
  },
  WORD_ORDER: {
    type: "WORD_ORDER",
    label: { en: "Word Order", ur: "لفظ کی ترتیب" },
    playerSupported: true,
    authoringScope: false,
    fields: {},
  },
  TRANSLATE_TO_ARABIC: {
    type: "TRANSLATE_TO_ARABIC",
    label: { en: "Translate to Arabic", ur: "عربی میں ترجمہ" },
    playerSupported: true,
    authoringScope: false,
    fields: {},
  },
  IDENTIFY_ROOT: {
    type: "IDENTIFY_ROOT",
    label: { en: "Identify Root", ur: "رُوٹ پہچانیں" },
    playerSupported: true,
    authoringScope: false,
    fields: {},
  },
  MATCH_AYAH: {
    type: "MATCH_AYAH",
    label: { en: "Match Ayah", ur: "آیت میچ کریں" },
    playerSupported: true,
    authoringScope: false,
    fields: {},
  },
};
