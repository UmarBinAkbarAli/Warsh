const fs = require("node:fs");
const path = require("node:path");

const { chapters: book1Chapters } = require("./curriculum-book1.cjs");
const { chapters: books2To4Chapters } = require("./curriculum-books2-4.cjs");
const { chapters: books5To6Chapters } = require("./curriculum-books5-6.cjs");
const { chapters: books7To8Chapters } = require("./curriculum-books7-8.cjs");

const chapters = [...book1Chapters, ...books2To4Chapters, ...books5To6Chapters, ...books7To8Chapters];
const fixturesDir = path.join(__dirname, "fixtures");

const ALLOWED_LEGACY_EXERCISE_TYPES = new Set([
  "TRUE_FALSE",
  "TAP_TRANSLATION",
  "FILL_BLANK",
  "BUILD_SENTENCE",
  "MATCHING",
  "GRAMMAR_PARSE",
  "CONVERSATION_BUILDER",
]);

const LESSON_TEMPLATES = new Set(["STANDARD", "SPOKEN_PHRASES", "REVIEW", "VERB_PATTERN"]);
const DISCOVER_CARD_TYPES = new Set(["WORD", "CONCEPT", "EXAMPLE", "CONTRAST", "AYAH_PREVIEW", "GRAMMAR_NOTE", "SENTENCE"]);
const EXERCISE_TYPES = new Set([
  "TRUE_FALSE",
  "TAP_TRANSLATION",
  "FILL_BLANK",
  "BUILD_SENTENCE",
  "MATCHING",
  "GRAMMAR_PARSE",
  "CONVERSATION_BUILDER",
  "SHADOW_REPEAT",
  "AUDIO_RECOGNITION",
  "WRITE_ARABIC",
  "HARAKAH_PLACEMENT",
  "WORD_ORDER",
  "TRANSLATE_TO_ARABIC",
  "IDENTIFY_ROOT",
  "MATCH_AYAH",
]);

const GRAMMATICAL_ROLES = new Set([
  "SUBJECT",
  "PREDICATE",
  "VERB",
  "OBJECT",
  "PARTICLE",
  "PREPOSITION",
  "POSSESSIVE",
  "ADJECTIVE",
  "DEMONSTRATIVE",
  "RELATIVE_PRONOUN",
]);

const ARABIC_HARAKAT_RE = /[\u064b-\u065f\u0670]/;
const FIXTURE_FILE_RE = /^chapter-(\d{2})-lesson-(\d{2})(?:-[a-z0-9-]+)?\.json$/;

function legacyFail(message) {
  throw new Error(`Curriculum validation failed: ${message}`);
}

function assertLegacyString(value, pathLabel) {
  if (typeof value !== "string" || value.trim().length === 0) {
    legacyFail(`${pathLabel} must be a non-empty string`);
  }
}

function validateLegacyExercise(exercise, pathLabel) {
  if (!ALLOWED_LEGACY_EXERCISE_TYPES.has(exercise.type)) {
    legacyFail(`${pathLabel}.type is unsupported: ${exercise.type}`);
  }

  assertLegacyString(exercise.prompt, `${pathLabel}.prompt`);

  if (["TRUE_FALSE", "TAP_TRANSLATION", "FILL_BLANK", "BUILD_SENTENCE", "CONVERSATION_BUILDER"].includes(exercise.type)) {
    if (!Array.isArray(exercise.options) || exercise.options.length < 2) {
      legacyFail(`${pathLabel}.options must contain at least 2 options`);
    }
    assertLegacyString(exercise.correctAnswer, `${pathLabel}.correctAnswer`);
  }

  if (exercise.type === "TRUE_FALSE" && !exercise.options.includes("True")) {
    legacyFail(`${pathLabel} TRUE_FALSE must include True/False options`);
  }

  if (exercise.type === "MATCHING") {
    if (!Array.isArray(exercise.pairs) || exercise.pairs.length < 2) {
      legacyFail(`${pathLabel}.pairs must contain at least 2 pairs`);
    }
    for (const [index, pair] of exercise.pairs.entries()) {
      assertLegacyString(pair.left, `${pathLabel}.pairs[${index}].left`);
      assertLegacyString(pair.right, `${pathLabel}.pairs[${index}].right`);
    }
  }

  if (exercise.type === "GRAMMAR_PARSE") {
    if (!Array.isArray(exercise.parseTokens) || exercise.parseTokens.length < 2) {
      legacyFail(`${pathLabel}.parseTokens must contain at least 2 tokens`);
    }
    if (!Array.isArray(exercise.labels) || exercise.labels.length < 3) {
      legacyFail(`${pathLabel}.labels must contain at least 3 labels`);
    }
    for (const [index, token] of exercise.parseTokens.entries()) {
      assertLegacyString(token.word, `${pathLabel}.parseTokens[${index}].word`);
      assertLegacyString(token.label, `${pathLabel}.parseTokens[${index}].label`);
    }
  }

  if (exercise.type === "CONVERSATION_BUILDER") {
    if (!Array.isArray(exercise.conversation) || exercise.conversation.length < 2) {
      legacyFail(`${pathLabel}.conversation must contain at least 2 lines`);
    }
  }
}

function validateLegacyLesson(lesson, pathLabel) {
  assertLegacyString(lesson.title, `${pathLabel}.title`);
  assertLegacyString(lesson.titleAr, `${pathLabel}.titleAr`);

  if (lesson.type !== "VOCABULARY") {
    legacyFail(`${pathLabel}.type must be VOCABULARY`);
  }

  assertLegacyString(lesson.hook?.ayahAr, `${pathLabel}.hook.ayahAr`);
  assertLegacyString(lesson.hook?.ayahRef, `${pathLabel}.hook.ayahRef`);
  assertLegacyString(lesson.hook?.question, `${pathLabel}.hook.question`);

  if (!Array.isArray(lesson.discoverCards) || lesson.discoverCards.length < 3 || lesson.discoverCards.length > 4) {
    legacyFail(`${pathLabel}.discoverCards must contain 3-4 cards`);
  }

  if (!Array.isArray(lesson.exercises) || lesson.exercises.length < 4 || lesson.exercises.length > 6) {
    legacyFail(`${pathLabel}.exercises must contain 4-6 exercises`);
  }

  const exerciseTypes = new Set(lesson.exercises.map((exercise) => exercise.type));
  if (exerciseTypes.size < 3) {
    legacyFail(`${pathLabel}.exercises must use at least 3 interaction formats`);
  }
  if (!exerciseTypes.has("TRUE_FALSE")) {
    legacyFail(`${pathLabel}.exercises must include TRUE_FALSE`);
  }

  lesson.exercises.forEach((exercise, index) => validateLegacyExercise(exercise, `${pathLabel}.exercises[${index}]`));

  assertLegacyString(lesson.revealText, `${pathLabel}.revealText`);
  assertLegacyString(lesson.revealAyah?.ayahAr, `${pathLabel}.revealAyah.ayahAr`);
  assertLegacyString(lesson.revealAyah?.ayahRef, `${pathLabel}.revealAyah.ayahRef`);
  assertLegacyString(lesson.revealAyah?.highlightedWord, `${pathLabel}.revealAyah.highlightedWord`);
  assertLegacyString(lesson.content?.ustadh_noor_tip_en, `${pathLabel}.content.ustadh_noor_tip_en`);
  assertLegacyString(lesson.content?.sourceFile, `${pathLabel}.content.sourceFile`);
}

function validateLegacyCurriculum() {
  if (!Array.isArray(chapters) || chapters.length !== 72) {
    legacyFail("expected exactly 72 chapters");
  }

  chapters.forEach((chapter, chapterIndex) => {
    const expectedOrder = chapterIndex + 1;
    if (chapter.order !== expectedOrder) {
      legacyFail(`chapter ${chapterIndex} must have order ${expectedOrder}`);
    }
    assertLegacyString(chapter.title, `chapters[${chapterIndex}].title`);
    assertLegacyString(chapter.titleAr, `chapters[${chapterIndex}].titleAr`);
    assertLegacyString(chapter.description, `chapters[${chapterIndex}].description`);
    if (!Array.isArray(chapter.lessons) || chapter.lessons.length < 4 || chapter.lessons.length > 9) {
      legacyFail(`chapters[${chapterIndex}].lessons must contain 4-9 lessons`);
    }
    chapter.lessons.forEach((lesson, lessonIndex) => validateLegacyLesson(lesson, `chapters[${chapterIndex}].lessons[${lessonIndex}]`));
  });

  console.log(`Legacy curriculum validation passed: ${chapters.length} chapters, ${chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)} lessons.`);
}

function createFixtureReporter() {
  return {
    errors: [],
    add(pathLabel, message) {
      this.errors.push(`${pathLabel}: ${message}`);
    },
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function assertString(value, pathLabel, reporter) {
  if (!isNonEmptyString(value)) {
    reporter.add(pathLabel, "must be a non-empty string");
    return false;
  }
  return true;
}

function assertOptionalString(value, pathLabel, reporter) {
  if (value !== undefined && !isNonEmptyString(value)) {
    reporter.add(pathLabel, "must be a non-empty string when provided");
  }
}

function assertBoolean(value, pathLabel, reporter) {
  if (typeof value !== "boolean") {
    reporter.add(pathLabel, "must be a boolean");
    return false;
  }
  return true;
}

function assertInteger(value, pathLabel, reporter, { min, max } = {}) {
  if (!Number.isInteger(value)) {
    reporter.add(pathLabel, "must be an integer");
    return false;
  }
  if (min !== undefined && value < min) {
    reporter.add(pathLabel, `must be >= ${min}`);
    return false;
  }
  if (max !== undefined && value > max) {
    reporter.add(pathLabel, `must be <= ${max}`);
    return false;
  }
  return true;
}

function assertObject(value, pathLabel, reporter) {
  if (!isPlainObject(value)) {
    reporter.add(pathLabel, "must be an object");
    return false;
  }
  return true;
}

function assertArray(value, pathLabel, reporter, { min, max, exact } = {}) {
  if (!Array.isArray(value)) {
    reporter.add(pathLabel, "must be an array");
    return false;
  }
  if (exact !== undefined && value.length !== exact) {
    reporter.add(pathLabel, `must contain exactly ${exact} items`);
  }
  if (min !== undefined && value.length < min) {
    reporter.add(pathLabel, `must contain at least ${min} item(s)`);
  }
  if (max !== undefined && value.length > max) {
    reporter.add(pathLabel, `must contain at most ${max} item(s)`);
  }
  return true;
}

function validateLocalizedText(value, pathLabel, reporter) {
  if (!assertObject(value, pathLabel, reporter)) return;
  assertString(value.en, `${pathLabel}.en`, reporter);
  assertOptionalString(value.ur, `${pathLabel}.ur`, reporter);
}

function validateArabicText(value, pathLabel, reporter) {
  if (!assertObject(value, pathLabel, reporter)) return;
  assertString(value.ar, `${pathLabel}.ar`, reporter);
  assertString(value.ar_plain, `${pathLabel}.ar_plain`, reporter);
  assertString(value.translit, `${pathLabel}.translit`, reporter);
  assertString(value.en, `${pathLabel}.en`, reporter);
  assertOptionalString(value.ur, `${pathLabel}.ur`, reporter);
}

function validateAyahReference(value, pathLabel, reporter) {
  if (!assertObject(value, pathLabel, reporter)) return;
  assertInteger(value.surah, `${pathLabel}.surah`, reporter, { min: 1, max: 114 });
  assertInteger(value.ayah, `${pathLabel}.ayah`, reporter, { min: 1 });
  assertString(value.label, `${pathLabel}.label`, reporter);
  assertString(value.ar, `${pathLabel}.ar`, reporter);
  assertString(value.en, `${pathLabel}.en`, reporter);
  assertOptionalString(value.ur, `${pathLabel}.ur`, reporter);
  assertOptionalString(value.audio_url, `${pathLabel}.audio_url`, reporter);

  if (value.word_timings !== undefined && assertArray(value.word_timings, `${pathLabel}.word_timings`, reporter)) {
    value.word_timings.forEach((timing, index) => {
      const timingPath = `${pathLabel}.word_timings[${index}]`;
      if (!assertObject(timing, timingPath, reporter)) return;
      assertInteger(timing.index, `${timingPath}.index`, reporter, { min: 0 });
      assertInteger(timing.start_ms, `${timingPath}.start_ms`, reporter, { min: 0 });
      assertInteger(timing.end_ms, `${timingPath}.end_ms`, reporter, { min: 0 });
      if (Number.isInteger(timing.start_ms) && Number.isInteger(timing.end_ms) && timing.end_ms <= timing.start_ms) {
        reporter.add(timingPath, "end_ms must be greater than start_ms");
      }
    });
  }
}

function validateHook(value, pathLabel, reporter) {
  if (!assertObject(value, pathLabel, reporter)) return;
  validateAyahReference(value.ayah, `${pathLabel}.ayah`, reporter);
  if (value.noor_intro !== undefined) validateLocalizedText(value.noor_intro, `${pathLabel}.noor_intro`, reporter);
  if (value.autoplay !== undefined && typeof value.autoplay !== "boolean") {
    reporter.add(`${pathLabel}.autoplay`, "must be a boolean when provided");
  }
}

function validateClose(value, pathLabel, reporter) {
  if (!assertObject(value, pathLabel, reporter)) return;
  assertOptionalString(value.noor_message_template, `${pathLabel}.noor_message_template`, reporter);
  if (value.noor_message !== undefined) validateLocalizedText(value.noor_message, `${pathLabel}.noor_message`, reporter);
  if (value.noor_message_template === undefined && value.noor_message === undefined) {
    reporter.add(pathLabel, "must include noor_message_template or noor_message");
  }
}

function validateDiscoverCard(card, pathLabel, reporter) {
  if (!assertObject(card, pathLabel, reporter)) return;
  if (!DISCOVER_CARD_TYPES.has(card.type)) {
    reporter.add(`${pathLabel}.type`, `must be one of ${Array.from(DISCOVER_CARD_TYPES).join(", ")}`);
  }

  if (card.type === "WORD") validateArabicText(card.text, `${pathLabel}.text`, reporter);
  if (card.type === "CONCEPT") {
    validateLocalizedText(card.concept, `${pathLabel}.concept`, reporter);
    validateLocalizedText(card.explanation, `${pathLabel}.explanation`, reporter);
  }
  if (card.type === "EXAMPLE" && card.text === undefined && card.examples === undefined) {
    reporter.add(pathLabel, "EXAMPLE cards must include text or examples");
  }
  if (card.type === "CONTRAST" && (!Array.isArray(card.examples) || card.examples.length < 2)) {
    reporter.add(`${pathLabel}.examples`, "CONTRAST cards must include at least 2 examples");
  }
  if (card.type === "GRAMMAR_NOTE") {
    validateLocalizedText(card.title, `${pathLabel}.title`, reporter);
    validateLocalizedText(card.body, `${pathLabel}.body`, reporter);
  }
  if (card.type === "SENTENCE") {
    validateArabicText(card.text, `${pathLabel}.text`, reporter);
  }

  if (card.text !== undefined && card.type !== "WORD" && card.type !== "SENTENCE") validateArabicText(card.text, `${pathLabel}.text`, reporter);
  if (card.concept !== undefined && card.type !== "CONCEPT") validateLocalizedText(card.concept, `${pathLabel}.concept`, reporter);
  if (card.explanation !== undefined && card.type !== "CONCEPT") validateLocalizedText(card.explanation, `${pathLabel}.explanation`, reporter);
  assertOptionalString(card.image_url, `${pathLabel}.image_url`, reporter);
  assertOptionalString(card.audio_url, `${pathLabel}.audio_url`, reporter);

  if (card.examples !== undefined && assertArray(card.examples, `${pathLabel}.examples`, reporter, { min: 1 })) {
    card.examples.forEach((example, index) => validateArabicText(example, `${pathLabel}.examples[${index}]`, reporter));
  }

  if (card.introduces_vocab !== undefined) {
    if (assertObject(card.introduces_vocab, `${pathLabel}.introduces_vocab`, reporter)) {
      assertOptionalString(card.introduces_vocab.word_id, `${pathLabel}.introduces_vocab.word_id`, reporter);
      assertString(card.introduces_vocab.ar_plain, `${pathLabel}.introduces_vocab.ar_plain`, reporter);
    }
  }
}

function validateReveal(value, pathLabel, reporter) {
  if (!assertObject(value, pathLabel, reporter)) return;
  validateLocalizedText(value.concept_name, `${pathLabel}.concept_name`, reporter);
  validateAyahReference(value.ayah, `${pathLabel}.ayah`, reporter);
  if (assertArray(value.highlighted_word_indices, `${pathLabel}.highlighted_word_indices`, reporter, { min: 1 })) {
    value.highlighted_word_indices.forEach((indexValue, index) => {
      assertInteger(indexValue, `${pathLabel}.highlighted_word_indices[${index}]`, reporter, { min: 0 });
    });
    const unique = new Set(value.highlighted_word_indices);
    if (unique.size !== value.highlighted_word_indices.length) {
      reporter.add(`${pathLabel}.highlighted_word_indices`, "must not contain duplicate indices");
    }
  }
  validateLocalizedText(value.noor_explanation, `${pathLabel}.noor_explanation`, reporter);
}

function validateOrderArray(order, length, pathLabel, reporter) {
  if (!assertArray(order, pathLabel, reporter, { min: 1 })) return;
  const seen = new Set();
  order.forEach((orderIndex, index) => {
    if (assertInteger(orderIndex, `${pathLabel}[${index}]`, reporter, { min: 0, max: Math.max(length - 1, 0) })) {
      if (seen.has(orderIndex)) reporter.add(`${pathLabel}[${index}]`, "must not duplicate another correct_order index");
      seen.add(orderIndex);
    }
  });
}

function validateOptionIndex(indexValue, options, pathLabel, reporter) {
  if (!Array.isArray(options)) return;
  assertInteger(indexValue, pathLabel, reporter, { min: 0, max: options.length - 1 });
}

function assertNoDuplicateStrings(values, pathLabel, reporter) {
  const seen = new Set();
  for (const value of values) {
    if (!isNonEmptyString(value)) continue;
    const key = value.trim().toLowerCase();
    if (seen.has(key)) {
      reporter.add(pathLabel, `must not contain duplicate option "${value}"`);
      return;
    }
    seen.add(key);
  }
}

function validateExercise(exercise, pathLabel, reporter, seenExerciseIds) {
  if (!assertObject(exercise, pathLabel, reporter)) return;
  assertString(exercise.id, `${pathLabel}.id`, reporter);
  if (isNonEmptyString(exercise.id)) {
    if (seenExerciseIds.has(exercise.id)) reporter.add(`${pathLabel}.id`, `duplicates exercise id "${exercise.id}"`);
    seenExerciseIds.add(exercise.id);
  }

  if (!EXERCISE_TYPES.has(exercise.type)) {
    reporter.add(`${pathLabel}.type`, `must be one of the 15 warsh-content-schema exercise types`);
    return;
  }

  if (exercise.xp_value !== undefined) assertInteger(exercise.xp_value, `${pathLabel}.xp_value`, reporter, { min: 0 });
  if (exercise.explanation_on_wrong !== undefined) validateLocalizedText(exercise.explanation_on_wrong, `${pathLabel}.explanation_on_wrong`, reporter);

  for (const alias of ["answer", "choices", "pairs", "word_bank", "blank_label", "direction", "instruction"]) {
    if (exercise[alias] !== undefined) {
      reporter.add(`${pathLabel}.${alias}`, "uses a renderer-era field; use the warsh-content-schema v1.0 field names");
    }
  }

  switch (exercise.type) {
    case "TRUE_FALSE":
      if (assertObject(exercise.statement, `${pathLabel}.statement`, reporter)) {
        assertString(exercise.statement.en, `${pathLabel}.statement.en`, reporter);
        assertOptionalString(exercise.statement.ur, `${pathLabel}.statement.ur`, reporter);
        if (exercise.statement.ar_example !== undefined) validateArabicText(exercise.statement.ar_example, `${pathLabel}.statement.ar_example`, reporter);
      }
      assertBoolean(exercise.correct_answer, `${pathLabel}.correct_answer`, reporter);
      break;
    case "TAP_TRANSLATION":
      validateArabicText(exercise.prompt, `${pathLabel}.prompt`, reporter);
      if (assertArray(exercise.options, `${pathLabel}.options`, reporter, { exact: 4 })) {
        exercise.options.forEach((option, index) => validateLocalizedText(option, `${pathLabel}.options[${index}]`, reporter));
        assertNoDuplicateStrings(exercise.options.map((option) => option?.en), `${pathLabel}.options`, reporter);
        validateOptionIndex(exercise.correct_index, exercise.options, `${pathLabel}.correct_index`, reporter);
      }
      assertOptionalString(exercise.audio_url, `${pathLabel}.audio_url`, reporter);
      break;
    case "FILL_BLANK":
      if (!["TAP", "TYPE"].includes(exercise.mode)) reporter.add(`${pathLabel}.mode`, "must be TAP or TYPE");
      assertString(exercise.sentence_ar, `${pathLabel}.sentence_ar`, reporter);
      if (isNonEmptyString(exercise.sentence_ar) && !exercise.sentence_ar.includes("___")) {
        reporter.add(`${pathLabel}.sentence_ar`, "must include ___ for the blank");
      }
      validateLocalizedText(exercise.hint, `${pathLabel}.hint`, reporter);
      if (exercise.mode === "TAP") {
        if (assertArray(exercise.options, `${pathLabel}.options`, reporter, { exact: 4 })) {
          exercise.options.forEach((option, index) => validateArabicText(option, `${pathLabel}.options[${index}]`, reporter));
        }
      } else if (exercise.options !== undefined) {
        reporter.add(`${pathLabel}.options`, "must be omitted for TYPE mode");
      }
      validateArabicText(exercise.correct_answer, `${pathLabel}.correct_answer`, reporter);
      if (exercise.mode === "TAP" && Array.isArray(exercise.options) && isPlainObject(exercise.correct_answer)) {
        const answerKey = exercise.correct_answer.ar_plain || exercise.correct_answer.ar || exercise.correct_answer.en;
        const optionKeys = exercise.options.map((option) => option?.ar_plain || option?.ar || option?.en);
        if (isNonEmptyString(answerKey) && !optionKeys.includes(answerKey)) {
          reporter.add(`${pathLabel}.correct_answer`, "must match one TAP option");
        }
      }
      break;
    case "BUILD_SENTENCE":
      validateLocalizedText(exercise.target_translation, `${pathLabel}.target_translation`, reporter);
      if (assertArray(exercise.tiles, `${pathLabel}.tiles`, reporter, { min: 2 })) {
        exercise.tiles.forEach((tile, index) => validateArabicText(tile, `${pathLabel}.tiles[${index}]`, reporter));
        validateOrderArray(exercise.correct_order, exercise.tiles.length, `${pathLabel}.correct_order`, reporter);
      }
      break;
    case "MATCHING":
      if (assertArray(exercise.left_column, `${pathLabel}.left_column`, reporter, { min: 2 })) {
        exercise.left_column.forEach((item, index) => validateArabicText(item, `${pathLabel}.left_column[${index}]`, reporter));
      }
      if (assertArray(exercise.right_column, `${pathLabel}.right_column`, reporter, { min: 2 })) {
        exercise.right_column.forEach((item, index) => validateLocalizedText(item, `${pathLabel}.right_column[${index}]`, reporter));
      }
      if (Array.isArray(exercise.left_column) && Array.isArray(exercise.right_column) && exercise.left_column.length !== exercise.right_column.length) {
        reporter.add(pathLabel, "left_column and right_column must have the same length");
      }
      if (assertArray(exercise.correct_pairs, `${pathLabel}.correct_pairs`, reporter, { min: 2 })) {
        const seenLeft = new Set();
        const seenRight = new Set();
        exercise.correct_pairs.forEach((pair, index) => {
          const pairPath = `${pathLabel}.correct_pairs[${index}]`;
          if (!Array.isArray(pair) || pair.length !== 2) {
            reporter.add(pairPath, "must be a [left_index, right_index] tuple");
            return;
          }
          const [leftIndex, rightIndex] = pair;
          const leftOk = assertInteger(leftIndex, `${pairPath}[0]`, reporter, { min: 0, max: (exercise.left_column?.length ?? 1) - 1 });
          const rightOk = assertInteger(rightIndex, `${pairPath}[1]`, reporter, { min: 0, max: (exercise.right_column?.length ?? 1) - 1 });
          if (leftOk) {
            if (seenLeft.has(leftIndex)) reporter.add(pairPath, `left index ${leftIndex} is paired more than once`);
            seenLeft.add(leftIndex);
          }
          if (rightOk) {
            if (seenRight.has(rightIndex)) reporter.add(pairPath, `right index ${rightIndex} is paired more than once`);
            seenRight.add(rightIndex);
          }
        });
      }
      break;
    case "GRAMMAR_PARSE":
      assertString(exercise.sentence_ar, `${pathLabel}.sentence_ar`, reporter);
      if (assertArray(exercise.words, `${pathLabel}.words`, reporter, { min: 1 })) {
        exercise.words.forEach((word, index) => validateArabicText(word, `${pathLabel}.words[${index}]`, reporter));
      }
      if (assertArray(exercise.available_roles, `${pathLabel}.available_roles`, reporter, { min: 1 })) {
        exercise.available_roles.forEach((role, index) => {
          if (!GRAMMATICAL_ROLES.has(role)) reporter.add(`${pathLabel}.available_roles[${index}]`, `must be a GrammaticalRole enum value`);
        });
      }
      if (assertArray(exercise.correct_roles, `${pathLabel}.correct_roles`, reporter, { min: 1 })) {
        if (Array.isArray(exercise.words) && exercise.correct_roles.length !== exercise.words.length) {
          reporter.add(`${pathLabel}.correct_roles`, "must have one role per word");
        }
        exercise.correct_roles.forEach((role, index) => {
          if (!GRAMMATICAL_ROLES.has(role)) reporter.add(`${pathLabel}.correct_roles[${index}]`, `must be a GrammaticalRole enum value`);
          if (Array.isArray(exercise.available_roles) && !exercise.available_roles.includes(role)) {
            reporter.add(`${pathLabel}.correct_roles[${index}]`, "must be present in available_roles");
          }
        });
      }
      break;
    case "CONVERSATION_BUILDER":
      validateArabicText(exercise.prompt_line, `${pathLabel}.prompt_line`, reporter);
      if (!["PICK", "BUILD"].includes(exercise.response_mode)) reporter.add(`${pathLabel}.response_mode`, "must be PICK or BUILD");
      if (exercise.response_mode === "PICK") {
        if (assertArray(exercise.options, `${pathLabel}.options`, reporter, { min: 2 })) {
          exercise.options.forEach((option, index) => validateArabicText(option, `${pathLabel}.options[${index}]`, reporter));
          validateOptionIndex(exercise.correct_option_index, exercise.options, `${pathLabel}.correct_option_index`, reporter);
        }
      }
      if (exercise.response_mode === "BUILD") {
        if (assertArray(exercise.tiles, `${pathLabel}.tiles`, reporter, { min: 2 })) {
          exercise.tiles.forEach((tile, index) => validateArabicText(tile, `${pathLabel}.tiles[${index}]`, reporter));
          validateOrderArray(exercise.correct_order, exercise.tiles.length, `${pathLabel}.correct_order`, reporter);
        }
      }
      break;
    case "SHADOW_REPEAT":
      validateArabicText(exercise.phrase, `${pathLabel}.phrase`, reporter);
      assertString(exercise.audio_url, `${pathLabel}.audio_url`, reporter);
      if (exercise.self_grading !== true) reporter.add(`${pathLabel}.self_grading`, "must be true");
      break;
    case "AUDIO_RECOGNITION":
      assertString(exercise.audio_url, `${pathLabel}.audio_url`, reporter);
      if (assertArray(exercise.options, `${pathLabel}.options`, reporter, { exact: 4 })) {
        exercise.options.forEach((option, index) => validateArabicText(option, `${pathLabel}.options[${index}]`, reporter));
        validateOptionIndex(exercise.correct_index, exercise.options, `${pathLabel}.correct_index`, reporter);
      }
      break;
    case "WRITE_ARABIC":
      validateLocalizedText(exercise.prompt, `${pathLabel}.prompt`, reporter);
      assertOptionalString(exercise.audio_url, `${pathLabel}.audio_url`, reporter);
      validateArabicText(exercise.correct_answer, `${pathLabel}.correct_answer`, reporter);
      assertBoolean(exercise.hint_available, `${pathLabel}.hint_available`, reporter);
      break;
    case "HARAKAH_PLACEMENT":
      assertString(exercise.word_unvowelled, `${pathLabel}.word_unvowelled`, reporter);
      if (isNonEmptyString(exercise.word_unvowelled) && ARABIC_HARAKAT_RE.test(exercise.word_unvowelled)) {
        reporter.add(`${pathLabel}.word_unvowelled`, "must not contain harakat");
      }
      assertString(exercise.correct_vowelled, `${pathLabel}.correct_vowelled`, reporter);
      if (isNonEmptyString(exercise.correct_vowelled) && !ARABIC_HARAKAT_RE.test(exercise.correct_vowelled)) {
        reporter.add(`${pathLabel}.correct_vowelled`, "should contain harakat");
      }
      validateLocalizedText(exercise.hint, `${pathLabel}.hint`, reporter);
      break;
    case "WORD_ORDER":
      if (assertArray(exercise.tiles, `${pathLabel}.tiles`, reporter, { min: 2 })) {
        exercise.tiles.forEach((tile, index) => validateArabicText(tile, `${pathLabel}.tiles[${index}]`, reporter));
        validateOrderArray(exercise.correct_order, exercise.tiles.length, `${pathLabel}.correct_order`, reporter);
      }
      validateLocalizedText(exercise.context, `${pathLabel}.context`, reporter);
      break;
    case "TRANSLATE_TO_ARABIC":
      validateLocalizedText(exercise.source, `${pathLabel}.source`, reporter);
      if (assertArray(exercise.acceptable_answers, `${pathLabel}.acceptable_answers`, reporter, { min: 1 })) {
        exercise.acceptable_answers.forEach((answer, index) => validateArabicText(answer, `${pathLabel}.acceptable_answers[${index}]`, reporter));
      }
      break;
    case "IDENTIFY_ROOT":
      validateArabicText(exercise.word, `${pathLabel}.word`, reporter);
      if (assertArray(exercise.options, `${pathLabel}.options`, reporter, { exact: 4 })) {
        exercise.options.forEach((option, index) => assertString(option, `${pathLabel}.options[${index}]`, reporter));
        assertNoDuplicateStrings(exercise.options, `${pathLabel}.options`, reporter);
        validateOptionIndex(exercise.correct_index, exercise.options, `${pathLabel}.correct_index`, reporter);
      }
      break;
    case "MATCH_AYAH":
      if (assertObject(exercise.ayah_fragment, `${pathLabel}.ayah_fragment`, reporter)) {
        assertString(exercise.ayah_fragment.ar, `${pathLabel}.ayah_fragment.ar`, reporter);
        assertString(exercise.ayah_fragment.surah_ref, `${pathLabel}.ayah_fragment.surah_ref`, reporter);
      }
      if (assertArray(exercise.options, `${pathLabel}.options`, reporter, { exact: 4 })) {
        exercise.options.forEach((option, index) => validateLocalizedText(option, `${pathLabel}.options[${index}]`, reporter));
        validateOptionIndex(exercise.correct_index, exercise.options, `${pathLabel}.correct_index`, reporter);
      }
      break;
  }
}

function validateConjugationTable(value, pathLabel, reporter) {
  if (!assertObject(value, pathLabel, reporter)) return;
  assertString(value.root, `${pathLabel}.root`, reporter);
  validateLocalizedText(value.pattern_name, `${pathLabel}.pattern_name`, reporter);
  if (assertArray(value.rows, `${pathLabel}.rows`, reporter, { min: 1 })) {
    value.rows.forEach((row, index) => {
      const rowPath = `${pathLabel}.rows[${index}]`;
      if (!assertObject(row, rowPath, reporter)) return;
      validateArabicText(row.pronoun, `${rowPath}.pronoun`, reporter);
      validateArabicText(row.conjugated, `${rowPath}.conjugated`, reporter);
      assertOptionalString(row.audio_url, `${rowPath}.audio_url`, reporter);
    });
  }
}

function validateSpokenPhrases(value, pathLabel, reporter) {
  if (!assertObject(value, pathLabel, reporter)) return;
  validateLocalizedText(value.scene, `${pathLabel}.scene`, reporter);
  const phraseIds = new Set();

  if (assertArray(value.phrases, `${pathLabel}.phrases`, reporter, { min: 4, max: 20 })) {
    value.phrases.forEach((phrase, index) => {
      const phrasePath = `${pathLabel}.phrases[${index}]`;
      if (!assertObject(phrase, phrasePath, reporter)) return;
      assertString(phrase.id, `${phrasePath}.id`, reporter);
      if (isNonEmptyString(phrase.id)) {
        if (phraseIds.has(phrase.id)) reporter.add(`${phrasePath}.id`, `duplicates phrase id "${phrase.id}"`);
        phraseIds.add(phrase.id);
      }
      validateArabicText(phrase.phrase, `${phrasePath}.phrase`, reporter);
      assertString(phrase.audio_url, `${phrasePath}.audio_url`, reporter);
      if (phrase.context !== undefined) validateLocalizedText(phrase.context, `${phrasePath}.context`, reporter);
    });
  }

  if (value.dialogue !== undefined && assertArray(value.dialogue, `${pathLabel}.dialogue`, reporter, { min: 1 })) {
    value.dialogue.forEach((line, index) => {
      const linePath = `${pathLabel}.dialogue[${index}]`;
      if (!assertObject(line, linePath, reporter)) return;
      if (!["A", "B"].includes(line.speaker)) reporter.add(`${linePath}.speaker`, "must be A or B");
      assertString(line.phrase_id, `${linePath}.phrase_id`, reporter);
      if (isNonEmptyString(line.phrase_id) && phraseIds.size > 0 && !phraseIds.has(line.phrase_id)) {
        reporter.add(`${linePath}.phrase_id`, `does not reference a spoken_phrases.phrases id`);
      }
    });
  }
}

function validateFixtureMeta(lesson, pathLabel, reporter, fileInfo) {
  if (lesson._meta === undefined) return;
  if (!assertObject(lesson._meta, `${pathLabel}._meta`, reporter)) return;
  assertOptionalString(lesson._meta._note, `${pathLabel}._meta._note`, reporter);
  assertInteger(lesson._meta.chapter_order, `${pathLabel}._meta.chapter_order`, reporter, { min: 1 });
  assertInteger(lesson._meta.lesson_order, `${pathLabel}._meta.lesson_order`, reporter, { min: 1 });
  assertInteger(lesson._meta.estimated_minutes, `${pathLabel}._meta.estimated_minutes`, reporter, { min: 1 });
  assertInteger(lesson._meta.xp_reward, `${pathLabel}._meta.xp_reward`, reporter, { min: 0 });

  if (fileInfo) {
    if (Number.isInteger(lesson._meta.chapter_order) && lesson._meta.chapter_order !== fileInfo.chapterOrder) {
      reporter.add(`${pathLabel}._meta.chapter_order`, `must match filename chapter ${fileInfo.chapterOrder}`);
    }
    if (Number.isInteger(lesson._meta.lesson_order) && lesson._meta.lesson_order !== fileInfo.lessonOrder) {
      reporter.add(`${pathLabel}._meta.lesson_order`, `must match filename lesson ${fileInfo.lessonOrder}`);
    }
  }
}

function validateLessonFixture(fileName, lesson, reporter, globalState) {
  const pathLabel = fileName;
  const match = fileName.match(FIXTURE_FILE_RE);
  const fileInfo = match
    ? { chapterOrder: Number(match[1]), lessonOrder: Number(match[2]), derivedId: `ch${match[1]}-l${match[2]}` }
    : null;

  if (!fileInfo) {
    reporter.add(pathLabel, "filename must match chapter-XX-lesson-YY[-slug].json");
  }

  if (!assertObject(lesson, pathLabel, reporter)) return;
  if (lesson.schema_version !== "1.0") reporter.add(`${pathLabel}.schema_version`, 'must be "1.0"');
  if (!LESSON_TEMPLATES.has(lesson.template)) reporter.add(`${pathLabel}.template`, `must be one of ${Array.from(LESSON_TEMPLATES).join(", ")}`);

  validateFixtureMeta(lesson, pathLabel, reporter, fileInfo);
  validateHook(lesson.hook, `${pathLabel}.hook`, reporter);
  validateClose(lesson.close, `${pathLabel}.close`, reporter);

  const explicitId = lesson.id ?? lesson.lesson_id ?? lesson._meta?.id ?? lesson._meta?.lesson_id;
  const stableId = explicitId ?? fileInfo?.derivedId;
  if (stableId) {
    if (!isNonEmptyString(stableId)) {
      reporter.add(`${pathLabel}.id`, "must be a non-empty string when provided");
    } else if (globalState.lessonIds.has(stableId)) {
      reporter.add(pathLabel, `duplicates lesson id "${stableId}"`);
    } else {
      globalState.lessonIds.add(stableId);
    }
  }

  const slug = lesson.slug ?? lesson._meta?.slug;
  if (slug !== undefined) {
    if (!isNonEmptyString(slug)) {
      reporter.add(`${pathLabel}.slug`, "must be a non-empty string when provided");
    } else if (globalState.slugs.has(slug)) {
      reporter.add(pathLabel, `duplicates lesson slug "${slug}"`);
    } else {
      globalState.slugs.add(slug);
    }
  }

  if (globalState.chapterLessonKeys.has(`${lesson._meta?.chapter_order}:${lesson._meta?.lesson_order}`)) {
    reporter.add(pathLabel, `duplicates chapter_order/lesson_order ${lesson._meta?.chapter_order}/${lesson._meta?.lesson_order}`);
  } else if (Number.isInteger(lesson._meta?.chapter_order) && Number.isInteger(lesson._meta?.lesson_order)) {
    globalState.chapterLessonKeys.add(`${lesson._meta.chapter_order}:${lesson._meta.lesson_order}`);
  }

  if (["STANDARD", "REVIEW"].includes(lesson.template)) {
    const discoverBounds = lesson.template === "REVIEW" ? { min: 2, max: 15 } : { min: 4, max: 15 };
    if (assertArray(lesson.discover_cards, `${pathLabel}.discover_cards`, reporter, discoverBounds)) {
      lesson.discover_cards.forEach((card, index) => validateDiscoverCard(card, `${pathLabel}.discover_cards[${index}]`, reporter));
    }
    const exerciseBounds = lesson.template === "REVIEW" ? { min: 5, max: 12 } : { min: 5, max: 10 };
    if (assertArray(lesson.exercises, `${pathLabel}.exercises`, reporter, exerciseBounds)) {
      const seenExerciseIds = new Set();
      lesson.exercises.forEach((exercise, index) => validateExercise(exercise, `${pathLabel}.exercises[${index}]`, reporter, seenExerciseIds));
      for (const exerciseId of seenExerciseIds) {
        if (globalState.exerciseIds.has(exerciseId)) reporter.add(`${pathLabel}.exercises`, `exercise id "${exerciseId}" is reused in another fixture`);
        globalState.exerciseIds.add(exerciseId);
      }
    }
    validateReveal(lesson.reveal, `${pathLabel}.reveal`, reporter);
    if (lesson.spoken_phrases !== undefined) reporter.add(`${pathLabel}.spoken_phrases`, `${lesson.template} lessons must not include spoken_phrases`);
  }

  if (lesson.template === "VERB_PATTERN") {
    // VERB_PATTERN uses conjugation_table (validated below) instead of discover_cards
    if (lesson.discover_cards !== undefined) reporter.add(`${pathLabel}.discover_cards`, "VERB_PATTERN lessons use conjugation_table, not discover_cards");
    const vpExerciseBounds = { min: 4, max: 10 };
    if (assertArray(lesson.exercises, `${pathLabel}.exercises`, reporter, vpExerciseBounds)) {
      const seenExerciseIds = new Set();
      lesson.exercises.forEach((exercise, index) => validateExercise(exercise, `${pathLabel}.exercises[${index}]`, reporter, seenExerciseIds));
      for (const exerciseId of seenExerciseIds) {
        if (globalState.exerciseIds.has(exerciseId)) reporter.add(`${pathLabel}.exercises`, `exercise id "${exerciseId}" is reused in another fixture`);
        globalState.exerciseIds.add(exerciseId);
      }
    }
    validateReveal(lesson.reveal, `${pathLabel}.reveal`, reporter);
    validateConjugationTable(lesson.conjugation_table, `${pathLabel}.conjugation_table`, reporter);
  } else if (lesson.conjugation_table !== undefined) {
    reporter.add(`${pathLabel}.conjugation_table`, "only VERB_PATTERN lessons may include conjugation_table");
  }

  if (lesson.template === "SPOKEN_PHRASES") {
    validateSpokenPhrases(lesson.spoken_phrases, `${pathLabel}.spoken_phrases`, reporter);
    for (const field of ["discover_cards", "exercises", "reveal", "conjugation_table"]) {
      if (lesson[field] !== undefined) reporter.add(`${pathLabel}.${field}`, "SPOKEN_PHRASES lessons must not include this beat");
    }
    for (const legacyField of ["contextTitle", "contextTitleEn", "contextBody", "phrases", "dialogue"]) {
      if (lesson[legacyField] !== undefined) {
        reporter.add(`${pathLabel}.${legacyField}`, "uses a renderer-era spoken phrase field; wrap content in spoken_phrases per schema v1.0");
      }
    }
  }
}

function readFixture(fileName, reporter) {
  const fullPath = path.join(fixturesDir, fileName);
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    reporter.add(fileName, `must be valid JSON (${error.message})`);
    return null;
  }
}

function validateFixtureCurriculum() {
  const reporter = createFixtureReporter();
  if (!fs.existsSync(fixturesDir)) {
    throw new Error(`Fixture validation failed: ${fixturesDir} does not exist`);
  }

  const files = fs.readdirSync(fixturesDir).filter((fileName) => fileName.endsWith(".json")).sort();
  if (files.length === 0) reporter.add("fixtures", "must contain at least one JSON fixture");

  const globalState = {
    lessonIds: new Set(),
    slugs: new Set(),
    exerciseIds: new Set(),
    chapterLessonKeys: new Set(),
  };

  for (const fileName of files) {
    const lesson = readFixture(fileName, reporter);
    if (lesson) validateLessonFixture(fileName, lesson, reporter, globalState);
  }

  if (reporter.errors.length > 0) {
    const preview = reporter.errors.slice(0, 120).map((error) => `  - ${error}`).join("\n");
    const remaining = reporter.errors.length > 120 ? `\n  ... and ${reporter.errors.length - 120} more error(s)` : "";
    throw new Error(`Fixture validation failed with ${reporter.errors.length} error(s):\n${preview}${remaining}`);
  }

  console.log(`Fixture validation passed: ${files.length} fixture lesson(s).`);
}

function main() {
  const mode = process.argv[2] || "--all";

  if (mode === "--legacy") {
    validateLegacyCurriculum();
    return;
  }

  if (mode === "--fixtures") {
    validateFixtureCurriculum();
    return;
  }

  if (mode !== "--all") {
    throw new Error(`Unknown validation mode "${mode}". Use --all, --legacy, or --fixtures.`);
  }

  validateLegacyCurriculum();
  validateFixtureCurriculum();
}

main();
