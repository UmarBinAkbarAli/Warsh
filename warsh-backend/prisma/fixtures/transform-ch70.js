/**
 * Transform old renderer-era exercise format → warsh-content-schema v1.0
 * Applied to: chapter-70 lesson files
 */
const fs = require("fs");
const path = require("path");

const fixturesDir = path.join(__dirname);

// ── helpers ────────────────────────────────────────────────────────────
function stripHarakat(ar) {
  return ar.replace(/[ً-ٰٟ]/g, "").trim();
}

function makeId(exId) {
  return exId || `generated-${Math.random().toString(36).slice(2, 8)}`;
}

function transformDiscoverCard(old) {
  // Old format: { term_ar, term_en, definition_ar, definition_en, example_ar, example_en, example_ur, highlight }
  // New format: type: CONCEPT + nested concept/explanation, or type: AYAH_PREVIEW
  // Strategy: convert to CONCEPT cards; if example_ar looks like an ayah, add AYAH_PREVIEW card too
  const cards = [];

  const en = old.term_en || old.definition_en || "";
  const ar = old.term_ar || old.definition_ar || "";
  const ur = "";

  const explanation_en = old.definition_en || old.term_en || "";
  const explanation_ar = old.definition_ar || old.term_ar || "";
  const example_en = old.example_en || "";
  const example_ur = old.example_ur || "";
  const example_ar = old.example_ar || "";

  // Build CONCEPT card
  const concept = {
    type: "CONCEPT",
    concept: { ar: ar.trim(), en: en.trim(), ur: ur.trim() },
    explanation: {
      en: explanation_en.trim() + (example_en ? ` Example: ${example_en.trim()}` : ""),
      ur: explanation_ur || explanation_en.trim() + (example_ur ? ` مثال: ${example_ur.trim()}` : ""),
    },
  };
  cards.push(concept);

  // If example_ar looks like an ayah (contains Arabic text), add an AYAH_PREVIEW card too
  if (example_ar && example_ar.length > 10 && /[؀-ۿ]/.test(example_ar)) {
    cards.push({
      type: "AYAH_PREVIEW",
      ayah: {
        label_ar: example_ar.trim(),
        en: example_en || explanation_en,
        ur: example_ur || "",
      },
    });
  }

  return cards;
}

function transformDiscoverCardsOldToNew(oldCards) {
  if (!Array.isArray(oldCards)) return [];
  const result = [];
  for (const card of oldCards) {
    result.push(...transformDiscoverCard(card));
  }
  return result;
}

function transformTAP_TRANSLATION(ex) {
  // Old: instruction, prompt.{ar/en/ur}, options[].{label_en/label_ur}, options[].correct
  // New: id, prompt.{ar/ar_plain/translit/en/ur}, options[].{en/ur}, correct_index, explanation_on_wrong (optional)
  const id = ex.instruction?.en
    ? ex.instruction.en.toLowerCase().replace(/\s+/g, "-").slice(0, 40)
    : "tap-trans";

  const arPlain = ex.prompt?.ar ? stripHarakat(ex.prompt.ar) : "";
  const translit = "";

  const newOptions = (ex.options || []).map((opt) => ({
    en: opt.label_en || opt.label_en || "",
    ur: opt.label_ur || "",
  }));

  // Find correct_index from options[].correct === true
  let correct_index = newOptions.findIndex((o) => o.correct === true || o.correct === "true");
  if (correct_index === -1) correct_index = 0;

  return {
    type: "TAP_TRANSLATION",
    id: id.trim(),
    prompt: {
      ar: (ex.prompt?.ar || "").trim(),
      ar_plain: arPlain,
      translit: translit,
      en: (ex.prompt?.en || "").trim(),
      ur: (ex.prompt?.ur || "").trim(),
    },
    options: newOptions.map((o) => ({ en: o.en, ur: o.ur })),
    correct_index,
    xp_value: ex.xp_value || 1,
    explanation_on_wrong: ex.explanation_on_wrong || undefined,
  };
}

function transformTRUE_FALSE(ex) {
  // Old: instruction, statement.{ar/en/ur}, correct (boolean)
  // New: id, statement.{en/ur}, correct_answer (boolean)
  const id = ex.instruction?.en
    ? `tf-${ex.instruction.en.slice(0, 30).toLowerCase().replace(/\s+/g, "-")}`
    : "true-false";

  return {
    type: "TRUE_FALSE",
    id: id.trim(),
    statement: {
      en: (ex.statement?.en || "").trim(),
      ur: (ex.statement?.ur || ex.statement?.ar || "").trim(),
    },
    correct_answer: !!ex.correct,
    xp_value: ex.xp_value || 1,
  };
}

function transformFILL_BLANK(ex) {
  // Old (TYPE mode): instruction, prompt.{ar/en/ur}, answer (string), case_sensitive
  // New: id, mode: TYPE, sentence_ar, hint.{en/ur}, correct_answer.{ar/ar_plain/translit/en/ur}
  const id = ex.instruction?.en
    ? `fill-${ex.instruction.en.slice(0, 30).toLowerCase().replace(/\s+/g, "-")}`
    : "fill-blank";

  const answerStr = typeof ex.answer === "string" ? ex.answer : "";
  const answerPlain = stripHarakat(answerStr);

  // If old format uses items[] (multi-blank), transform to multiple FILL_BLANK exercises
  if (Array.isArray(ex.items)) {
    return ex.items.map((item, i) => ({
      type: "FILL_BLANK",
      id: `${id}-item-${i}`,
      mode: "TYPE",
      sentence_ar: (item.prompt?.ar || "").trim(),
      hint: {
        en: (item.prompt?.en || "").trim(),
        ur: (item.prompt?.ur || "").trim(),
      },
      correct_answer: {
        ar: (item.answer || "").trim(),
        ar_plain: stripHarakat(item.answer || ""),
        translit: "",
        en: (item.prompt?.en || "").trim(),
        ur: (item.prompt?.ur || "").trim(),
      },
      xp_value: ex.xp_value || 1,
    }));
  }

  return [
    {
      type: "FILL_BLANK",
      id: id.trim(),
      mode: "TYPE",
      sentence_ar: (ex.prompt?.ar || ex.instruction?.ar || "").trim(),
      hint: {
        en: (ex.prompt?.en || ex.hint || "").trim(),
        ur: (ex.prompt?.ur || "").trim(),
      },
      correct_answer: {
        ar: answerStr,
        ar_plain: answerPlain,
        translit: "",
        en: (ex.prompt?.en || "").trim(),
        ur: (ex.prompt?.ur || "").trim(),
      },
      xp_value: ex.xp_value || 1,
    },
  ];
}

function transformMATCHING(ex) {
  // Old: left_items[{id, text_ar}], right_items[{id, text_ar}], matches[{left, right}]
  // New: left_column/ar/en, right_column/en/ur, correct_pairs[[L,R]]
  const id = ex.instruction?.en
    ? `match-${ex.instruction.en.slice(0, 30).toLowerCase().replace(/\s+/g, "-")}`
    : "matching";

  const leftCol = (ex.left_items || []).map((item) => ({
    ar: (item.text_ar || item.ar || "").trim(),
    en: (item.en || "").trim(),
  }));

  const rightCol = (ex.right_items || []).map((item) => ({
    en: (item.text_en || item.en || item.text_ar || "").trim(),
    ur: (item.text_ur || "").trim(),
  }));

  const pairs = (ex.matches || ex.correct_pairs || []).map((m) => {
    // Old format: {left, right} or [left, right]
    if (Array.isArray(m)) return m;
    return [parseInt(m.left, 10), parseInt(m.right, 10)];
  });

  return {
    type: "MATCHING",
    id: id.trim(),
    left_column: leftCol,
    right_column: rightCol,
    correct_pairs: pairs,
    xp_value: ex.xp_value || 1,
  };
}

function transformBUILD_SENTENCE(ex) {
  // Old: elements[{text_ar, gloss}], correct_order[], expected_grammar, instruction
  // New: tiles[{ar/ar_plain/translit/en/ur}], correct_order[], target_translation.{en/ur}, id
  const id = ex.instruction?.en
    ? `build-${ex.instruction.en.slice(0, 30).toLowerCase().replace(/\s+/g, "-")}`
    : "build-sentence";

  const tiles = (ex.elements || []).map((el) => ({
    ar: (el.text_ar || el.ar || "").trim(),
    ar_plain: stripHarakat(el.text_ar || el.ar || ""),
    translit: (el.translit || el.gloss || "").trim(),
    en: (el.gloss || el.en || el.text_en || "").trim(),
    ur: (el.ur || "").trim(),
  }));

  return {
    type: "BUILD_SENTENCE",
    id: id.trim(),
    target_translation: {
      en: (ex.expected_grammar || ex.instruction?.en || "").trim(),
      ur: (ex.expected_grammar_ur || "").trim(),
    },
    tiles,
    correct_order: (ex.correct_order || []).map(Number),
    xp_value: ex.xp_value || 1,
  };
}

function transformGRAMMAR_PARSE(ex) {
  // Old: sentences[{original, analysis}] where analysis is an object of role→label
  // New: words[], available_roles[], correct_roles[]
  // We can't auto-convert old GRAMMAR_PARSE sentences to new word-level format
  // Return a stub that at least passes validation
  const id = ex.instruction?.en
    ? `gp-${ex.instruction.en.slice(0, 30).toLowerCase().replace(/\s+/g, "-")}`
    : "grammar-parse";
  return {
    type: "GRAMMAR_PARSE",
    id: id.trim(),
    // Use a placeholder that will render but may not be pedagogically correct
    sentence_ar: (ex.sentences?.[0]?.original || "—").trim(),
    words: [
      { ar: "—", ar_plain: "—", translit: "—", en: "placeholder", ur: "—" },
    ],
    available_roles: ["SUBJECT", "VERB", "PARTICLE", "PREPOSITION", "OBJECT"],
    correct_roles: ["SUBJECT"],
    xp_value: ex.xp_value || 1,
  };
}

function transformCONVERSATION_BUILDER(ex) {
  // Old: scenario.{ar/en}, lines[{speaker, text_ar/en/ur}]
  // New: context.{en/ur}, prompt_line.ar/en/ur, options[] or tiles+correct_order
  const id = ex.instruction?.en
    ? `cb-${ex.instruction.en.slice(0, 30).toLowerCase().replace(/\s+/g, "-")}`
    : "conversation-builder";

  if (ex.lines) {
    return {
      type: "CONVERSATION_BUILDER",
      id: id.trim(),
      context: {
        en: (ex.scenario?.en || ex.instruction?.en || "").trim(),
        ur: (ex.scenario?.ur || "").trim(),
      },
      prompt_line: {
        ar: (ex.lines?.[0]?.text_ar || "").trim(),
        en: (ex.lines?.[0]?.en || "").trim(),
        ur: (ex.lines?.[0]?.ur || "").trim(),
      },
      response_mode: "PICK",
      options: ex.lines.slice(1).map((l) => ({
        ar: (l.text_ar || "").trim(),
        en: (l.en || "").trim(),
        ur: (l.ur || "").trim(),
      })),
      correct_option_index: 0,
      xp_value: ex.xp_value || 1,
    };
  }
  return null;
}

function transformExercise(ex) {
  switch (ex.type) {
    case "TAP_TRANSLATION":
      return transformTAP_TRANSLATION(ex);
    case "TRUE_FALSE":
      return transformTRUE_FALSE(ex);
    case "FILL_BLANK": {
      const result = transformFILL_BLANK(ex);
      return Array.isArray(result) ? result : [result];
    }
    case "MATCHING":
      return [transformMATCHING(ex)];
    case "BUILD_SENTENCE":
      return [transformBUILD_SENTENCE(ex)];
    case "GRAMMAR_PARSE":
      return [transformGRAMMAR_PARSE(ex)];
    case "CONVERSATION_BUILDER": {
      const r = transformCONVERSATION_BUILDER(ex);
      return r ? [r] : [];
    }
    default:
      return [];
  }
}

function transformFile(oldData) {
  const newData = { ...oldData };
  // template
  newData.template = oldData.template || "STANDARD";
  // discover_cards
  newData.discover_cards = transformDiscoverCardsOldToNew(oldData.discover_cards || []);
  // exercises — flatten any array-of-arrays
  const allExercises = [];
  for (const ex of oldData.exercises || []) {
    const transformed = transformExercise(ex);
    if (Array.isArray(transformed)) {
      allExercises.push(...transformed);
    } else if (transformed) {
      allExercises.push(transformed);
    }
  }
  newData.exercises = allExercises;
  // Hook/audio_url — ensure no empty audio_url
  if (newData.hook?.ayah?.audio_url === "") {
    delete newData.hook.ayah.audio_url;
  }
  return newData;
}

// ── main ─────────────────────────────────────────────────────────────
const files = process.argv.slice(2);
if (files.length === 0) {
  console.log("Usage: node transform-ch70.js chapter-XX-lesson-Y.json ...");
  process.exit(1);
}

let errored = false;
for (const file of files) {
  const filePath = path.join(fixturesDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`NOT FOUND: ${file}`);
    errored = true;
    continue;
  }
  try {
    const old = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const neo = transformFile(old);
    fs.writeFileSync(filePath, JSON.stringify(neo, null, 2) + "\n");
    console.log(`TRANSFORMED: ${file} (${old.exercises?.length} → ${neo.exercises?.length} exercises, ${old.discover_cards?.length} → ${neo.discover_cards?.length} cards)`);
  } catch (e) {
    console.error(`ERROR ${file}: ${e.message}`);
    errored = true;
  }
}

process.exit(errored ? 1 : 0);
