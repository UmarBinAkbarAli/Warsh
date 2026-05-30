/**
 * One-shot script to transform ch03-l01 through ch04-l03 drift files
 * to warsh-content-schema v1.0.
 */
const fs = require("node:fs");
const path = require("node:path");

const fixturesDir = path.join(__dirname, "fixtures");

function stripHarakat(str) {
  return str.replace(/[ً-ٰٟ]/g, "");
}

// Build translit/meaning lookup from discover_cards
function buildLookup(discoverCards) {
  const byAr = new Map();
  for (const card of discoverCards || []) {
    const text = card.text;
    if (text && text.ar) {
      byAr.set(text.ar, text);
      if (text.ar_plain) byAr.set(text.ar_plain, text);
    }
    if (Array.isArray(card.examples)) {
      for (const ex of card.examples) {
        if (ex.ar) byAr.set(ex.ar, ex);
      }
    }
  }
  return byAr;
}

function lookupArabicText(ar, lookup) {
  const found = lookup.get(ar);
  if (found) return found;
  // Try stripping harakat
  const plain = stripHarakat(ar);
  const found2 = lookup.get(plain);
  if (found2) return found2;
  return null;
}

function enrichArabicText(ar, lookup) {
  const found = lookupArabicText(ar, lookup);
  const ar_plain = stripHarakat(ar);
  return {
    ar,
    ar_plain: found?.ar_plain || ar_plain,
    translit: found?.translit || "—",
    en: found?.en || ar_plain,
    ...(found?.ur ? { ur: found.ur } : {}),
  };
}

function transformTapTranslation(ex, lookup) {
  const direction = ex.direction;
  const prompt = ex.prompt || {};
  const answer = ex.answer;
  const choices = ex.choices || [];

  if (direction === "ar_to_en" || !direction) {
    // prompt.ar is the Arabic to show; choices are English strings
    const promptAr = prompt.ar || "";
    const found = lookupArabicText(promptAr, lookup);
    const newPrompt = {
      ar: promptAr,
      ar_plain: found?.ar_plain || stripHarakat(promptAr),
      translit: found?.translit || prompt.translit || "—",
      en: found?.en || prompt.en || answer || promptAr,
      ...(found?.ur || prompt.ur ? { ur: found?.ur || prompt.ur } : {}),
    };
    const options = choices.map(c => ({ en: c }));
    const correctIndex = choices.indexOf(answer);
    return {
      id: ex.id,
      type: ex.type,
      xp_value: ex.xp_value,
      prompt: newPrompt,
      options,
      correct_index: correctIndex >= 0 ? correctIndex : 0,
      ...(ex.explanation_on_wrong ? { explanation_on_wrong: ex.explanation_on_wrong } : {}),
      ...(ex.audio_url ? { audio_url: ex.audio_url } : {}),
    };
  } else {
    // en_to_ar: prompt is English, choices are Arabic strings, answer is the correct Arabic
    // Flip: show Arabic as prompt, English options
    const correctAr = answer;
    const found = lookupArabicText(correctAr, lookup);
    const newPrompt = {
      ar: correctAr,
      ar_plain: found?.ar_plain || stripHarakat(correctAr),
      translit: found?.translit || "—",
      en: found?.en || prompt.en || correctAr,
      ...(found?.ur || prompt.ur ? { ur: found?.ur || prompt.ur } : {}),
    };
    // choices are Arabic strings - build English options by looking them up
    const options = choices.map(arChoice => {
      const f = lookupArabicText(arChoice, lookup);
      return { en: f?.en || arChoice };
    });
    const correctIndex = choices.indexOf(correctAr);
    return {
      id: ex.id,
      type: ex.type,
      xp_value: ex.xp_value,
      prompt: newPrompt,
      options,
      correct_index: correctIndex >= 0 ? correctIndex : 0,
      ...(ex.explanation_on_wrong ? { explanation_on_wrong: ex.explanation_on_wrong } : {}),
      ...(ex.audio_url ? { audio_url: ex.audio_url } : {}),
    };
  }
}

function transformTrueFalse(ex) {
  const result = { ...ex };
  if ("answer" in result) {
    result.correct_answer = result.answer;
    delete result.answer;
  }
  if ("explanation" in result) {
    result.explanation_on_wrong = result.explanation;
    delete result.explanation;
  }
  delete result.direction;
  delete result.choices;
  return result;
}

function transformFillBlank(ex, lookup) {
  const template = ex.template || {};
  const blankLabel = ex.blank_label || {};
  const answer = ex.answer || "";
  const choices = ex.choices || [];
  const explanation = ex.explanation;

  const templateEn = template.en || "";
  const eqIdx = templateEn.indexOf(" = ");
  let sentence_ar = eqIdx > 0 ? templateEn.slice(0, eqIdx) : templateEn;
  let hintEn = eqIdx > 0 ? templateEn.slice(eqIdx + 3) : (blankLabel.en || "");
  let hintUr = template.ur ? (template.ur.indexOf(" = ") > 0 ? template.ur.slice(template.ur.indexOf(" = ") + 3) : template.ur) : (blankLabel.ur || "");

  const hint = { en: hintEn, ...(hintUr ? { ur: hintUr } : {}) };

  const options = choices.map(arChoice => {
    const found = lookupArabicText(arChoice, lookup);
    return {
      ar: arChoice,
      ar_plain: found?.ar_plain || stripHarakat(arChoice),
      translit: found?.translit || "—",
      en: found?.en || stripHarakat(arChoice),
      ...(found?.ur ? { ur: found.ur } : {}),
    };
  });

  const foundAnswer = lookupArabicText(answer, lookup);
  const correct_answer = {
    ar: answer,
    ar_plain: foundAnswer?.ar_plain || stripHarakat(answer),
    translit: foundAnswer?.translit || "—",
    en: foundAnswer?.en || stripHarakat(answer),
    ...(foundAnswer?.ur ? { ur: foundAnswer.ur } : {}),
  };

  const result = {
    id: ex.id,
    type: ex.type,
    xp_value: ex.xp_value,
    mode: "TAP",
    sentence_ar,
    hint,
    options,
    correct_answer,
  };
  if (explanation) result.explanation_on_wrong = explanation.en ? explanation : { en: String(explanation) };
  return result;
}

function transformMatching(ex, lookup) {
  const pairs = ex.pairs || [];

  const left_column = pairs.map(p => {
    const found = lookupArabicText(p.ar, lookup);
    return {
      ar: p.ar,
      ar_plain: found?.ar_plain || stripHarakat(p.ar),
      translit: found?.translit || "—",
      en: found?.en || p.en || p.ar,
      ...(found?.ur ? { ur: found.ur } : {}),
    };
  });

  // Rotate right_column by offset 1 for shuffle
  const rightEnglish = pairs.map(p => p.en);
  const rotated = [...rightEnglish.slice(1), rightEnglish[0]];
  const right_column = rotated.map(en => ({ en }));

  // Compute correct_pairs: for each left[i], find which right index has the same en as pairs[i].en
  const correct_pairs = pairs.map((p, leftIdx) => {
    const rightIdx = rotated.indexOf(p.en);
    return [leftIdx, rightIdx];
  });

  return {
    id: ex.id,
    type: ex.type,
    xp_value: ex.xp_value,
    left_column,
    right_column,
    correct_pairs,
  };
}

function transformBuildSentence(ex, lookup) {
  const instruction = ex.instruction || {};
  const wordBank = ex.word_bank || [];
  const answerArr = ex.answer || [];
  const explanation = ex.explanation;

  const tiles = wordBank.map(arWord => {
    const found = lookupArabicText(arWord, lookup);
    return {
      ar: arWord,
      ar_plain: found?.ar_plain || stripHarakat(arWord),
      translit: found?.translit || "—",
      en: found?.en || stripHarakat(arWord),
      ...(found?.ur ? { ur: found.ur } : {}),
    };
  });

  const correct_order = answerArr.map(arWord => {
    const idx = wordBank.indexOf(arWord);
    return idx >= 0 ? idx : 0;
  });

  const target_translation = {
    en: instruction.en || "Build the sentence.",
    ...(instruction.ur ? { ur: instruction.ur } : {}),
  };

  const result = {
    id: ex.id,
    type: ex.type,
    xp_value: ex.xp_value,
    target_translation,
    tiles,
    correct_order,
  };
  if (explanation) result.explanation_on_wrong = explanation.en ? explanation : { en: String(explanation) };
  return result;
}

function transformExercise(ex, lookup) {
  const type = ex.type;
  if (type === "TAP_TRANSLATION" && (ex.answer !== undefined || ex.choices !== undefined || ex.direction !== undefined)) {
    return transformTapTranslation(ex, lookup);
  }
  if (type === "TRUE_FALSE" && (ex.answer !== undefined)) {
    return transformTrueFalse(ex);
  }
  if (type === "FILL_BLANK" && (ex.blank_label !== undefined || ex.choices !== undefined)) {
    return transformFillBlank(ex, lookup);
  }
  if (type === "MATCHING" && ex.pairs !== undefined) {
    return transformMatching(ex, lookup);
  }
  if (type === "BUILD_SENTENCE" && (ex.word_bank !== undefined || ex.instruction !== undefined)) {
    return transformBuildSentence(ex, lookup);
  }
  return ex;
}

function transformReveal(reveal, chapterTopic) {
  if (!reveal) return reveal;
  // Already new format
  if (reveal.concept_name) return reveal;

  const ayah = reveal.ayah || {};
  const highlightedWord = reveal.highlighted_word;
  const noorComment = reveal.noor_comment;
  // parse_tokens: remove

  // Find highlighted_word_indices
  let highlighted_word_indices = [0];
  if (highlightedWord && ayah.ar) {
    const words = ayah.ar.split(" ");
    const idx = words.findIndex(w => w === highlightedWord || w.includes(highlightedWord) || highlightedWord.includes(w));
    if (idx >= 0) highlighted_word_indices = [idx];
  }

  const noor_explanation = noorComment || { en: "You have now seen this grammar in the Quran.", ur: "آپ نے اب اس گرامر کو قرآن میں دیکھ لیا ہے۔" };

  return {
    concept_name: chapterTopic,
    ayah,
    highlighted_word_indices,
    noor_explanation,
  };
}

function addCloseIfMissing(lesson, chapterTopic) {
  if (lesson.close) return lesson.close;
  return {
    noor_message: {
      en: `You have completed this lesson on ${chapterTopic?.en || "this topic"}. Review what you learned and continue.`,
      ur: `آپ نے ${chapterTopic?.ur || "اس موضوع"} پر یہ سبق مکمل کیا۔ سیکھی ہوئی باتیں دہرائیں اور آگے بڑھیں۔`,
    },
  };
}

const CHAPTER_TOPICS = {
  3: {
    concept_name: { en: "الإضافة in the Quran", ar: "الإِضَافَة فِي الْقُرْآن", ur: "قرآن میں اضافہ" },
    close_topic_en: "idafa (the possessive construction)",
    close_topic_ur: "اضافہ (ملکیتی ترکیب)",
  },
  4: {
    concept_name: { en: "الصِّفَة in the Quran", ar: "الصِّفَة فِي الْقُرْآن", ur: "قرآن میں صفت" },
    close_topic_en: "adjective agreement",
    close_topic_ur: "صفتی ہم آہنگی",
  },
};

const DRIFT_FILES = [
  "chapter-03-lesson-01.json",
  "chapter-03-lesson-02.json",
  "chapter-03-lesson-03.json",
  "chapter-03-lesson-04.json",
  "chapter-04-lesson-01.json",
  "chapter-04-lesson-02.json",
  "chapter-04-lesson-03.json",
  // ch05 and ch06 have exercises drift but already correct reveal/close
  "chapter-05-lesson-01.json",
  "chapter-05-lesson-02.json",
  "chapter-05-lesson-03.json",
  "chapter-05-lesson-04.json",
  "chapter-06-lesson-01.json",
  "chapter-06-lesson-02.json",
  "chapter-06-lesson-03.json",
  "chapter-06-lesson-04.json",
];

// Also ch01/ch02 need discover_cards bounds fix only (no exercise drift)
// but the validator max was 8 — they have 12-13. The validator is fixed to max 15.
// ch01-l04 and ch02-l04 have min=4 and are REVIEW with 3 cards — validator now uses min=2 for REVIEW.
// Check ch01-l04:

for (const fileName of DRIFT_FILES) {
  const filePath = path.join(fixturesDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping missing file: ${fileName}`);
    continue;
  }

  const lesson = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const chapterOrder = lesson._meta?.chapter_order;
  const chapterInfo = CHAPTER_TOPICS[chapterOrder];
  const lookup = buildLookup(lesson.discover_cards);

  // Transform exercises
  if (Array.isArray(lesson.exercises)) {
    lesson.exercises = lesson.exercises.map(ex => transformExercise(ex, lookup));
  }

  // Transform reveal (only ch3 and ch4 have reveal drift)
  if (chapterOrder === 3 || chapterOrder === 4) {
    lesson.reveal = transformReveal(lesson.reveal, chapterInfo?.concept_name);

    // Add close if missing
    if (!lesson.close) {
      lesson.close = addCloseIfMissing(lesson, {
        en: chapterInfo?.close_topic_en,
        ur: chapterInfo?.close_topic_ur,
      });
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(lesson, null, 2), "utf8");
  console.log(`Fixed: ${fileName}`);
}

console.log("Done.");
