const { chapters } = require("./curriculum-phase15.cjs");

const ALLOWED_EXERCISE_TYPES = new Set([
  "TRUE_FALSE",
  "TAP_TRANSLATION",
  "FILL_BLANK",
  "BUILD_SENTENCE",
  "MATCHING",
  "GRAMMAR_PARSE",
  "CONVERSATION_BUILDER",
]);

function fail(message) {
  throw new Error(`Curriculum validation failed: ${message}`);
}

function assertString(value, path) {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${path} must be a non-empty string`);
  }
}

function validateExercise(exercise, path) {
  if (!ALLOWED_EXERCISE_TYPES.has(exercise.type)) {
    fail(`${path}.type is unsupported: ${exercise.type}`);
  }

  assertString(exercise.prompt, `${path}.prompt`);

  if (["TRUE_FALSE", "TAP_TRANSLATION", "FILL_BLANK", "BUILD_SENTENCE", "CONVERSATION_BUILDER"].includes(exercise.type)) {
    if (!Array.isArray(exercise.options) || exercise.options.length < 2) {
      fail(`${path}.options must contain at least 2 options`);
    }
    assertString(exercise.correctAnswer, `${path}.correctAnswer`);
  }

  if (exercise.type === "TRUE_FALSE" && !exercise.options.includes("True")) {
    fail(`${path} TRUE_FALSE must include True/False options`);
  }

  if (exercise.type === "MATCHING") {
    if (!Array.isArray(exercise.pairs) || exercise.pairs.length < 2) {
      fail(`${path}.pairs must contain at least 2 pairs`);
    }
    for (const [index, pair] of exercise.pairs.entries()) {
      assertString(pair.left, `${path}.pairs[${index}].left`);
      assertString(pair.right, `${path}.pairs[${index}].right`);
    }
  }

  if (exercise.type === "GRAMMAR_PARSE") {
    if (!Array.isArray(exercise.parseTokens) || exercise.parseTokens.length < 2) {
      fail(`${path}.parseTokens must contain at least 2 tokens`);
    }
    if (!Array.isArray(exercise.labels) || exercise.labels.length < 3) {
      fail(`${path}.labels must contain at least 3 labels`);
    }
    for (const [index, token] of exercise.parseTokens.entries()) {
      assertString(token.word, `${path}.parseTokens[${index}].word`);
      assertString(token.label, `${path}.parseTokens[${index}].label`);
    }
  }

  if (exercise.type === "CONVERSATION_BUILDER") {
    if (!Array.isArray(exercise.conversation) || exercise.conversation.length < 2) {
      fail(`${path}.conversation must contain at least 2 lines`);
    }
  }
}

function validateLesson(lesson, path) {
  assertString(lesson.title, `${path}.title`);
  assertString(lesson.titleAr, `${path}.titleAr`);

  if (lesson.type !== "VOCABULARY") {
    fail(`${path}.type must be VOCABULARY`);
  }

  assertString(lesson.hook?.ayahAr, `${path}.hook.ayahAr`);
  assertString(lesson.hook?.ayahRef, `${path}.hook.ayahRef`);
  assertString(lesson.hook?.question, `${path}.hook.question`);

  if (!Array.isArray(lesson.discoverCards) || lesson.discoverCards.length < 3 || lesson.discoverCards.length > 4) {
    fail(`${path}.discoverCards must contain 3-4 cards`);
  }

  if (!Array.isArray(lesson.exercises) || lesson.exercises.length < 4 || lesson.exercises.length > 6) {
    fail(`${path}.exercises must contain 4-6 exercises`);
  }

  const exerciseTypes = new Set(lesson.exercises.map((exercise) => exercise.type));
  if (exerciseTypes.size < 3) {
    fail(`${path}.exercises must use at least 3 interaction formats`);
  }
  if (!exerciseTypes.has("TRUE_FALSE")) {
    fail(`${path}.exercises must include TRUE_FALSE`);
  }

  lesson.exercises.forEach((exercise, index) => validateExercise(exercise, `${path}.exercises[${index}]`));

  assertString(lesson.revealText, `${path}.revealText`);
  assertString(lesson.revealAyah?.ayahAr, `${path}.revealAyah.ayahAr`);
  assertString(lesson.revealAyah?.ayahRef, `${path}.revealAyah.ayahRef`);
  assertString(lesson.revealAyah?.highlightedWord, `${path}.revealAyah.highlightedWord`);
  assertString(lesson.content?.ustadh_noor_tip_en, `${path}.content.ustadh_noor_tip_en`);
  assertString(lesson.content?.sourceFile, `${path}.content.sourceFile`);
}

function main() {
  if (!Array.isArray(chapters) || chapters.length !== 15) {
    fail("expected exactly 15 chapters");
  }

  chapters.forEach((chapter, chapterIndex) => {
    const expectedOrder = chapterIndex + 1;
    if (chapter.order !== expectedOrder) {
      fail(`chapter ${chapterIndex} must have order ${expectedOrder}`);
    }
    assertString(chapter.title, `chapters[${chapterIndex}].title`);
    assertString(chapter.titleAr, `chapters[${chapterIndex}].titleAr`);
    assertString(chapter.description, `chapters[${chapterIndex}].description`);
    if (!Array.isArray(chapter.lessons) || chapter.lessons.length < 4 || chapter.lessons.length > 6) {
      fail(`chapters[${chapterIndex}].lessons must contain 4-6 lessons`);
    }
    chapter.lessons.forEach((lesson, lessonIndex) => validateLesson(lesson, `chapters[${chapterIndex}].lessons[${lessonIndex}]`));
  });

  console.log(`Curriculum validation passed: ${chapters.length} chapters, ${chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)} lessons.`);
}

main();
