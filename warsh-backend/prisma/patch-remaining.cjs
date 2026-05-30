/**
 * Patch 2: Fix remaining issues after initial transformation.
 * 1. Add concept_name to ch05/ch06 reveals that are missing it
 * 2. Fix GRAMMAR_PARSE exercises: add sentence_ar, fix ar_plain/translit in words, convert Arabic roles to enum
 * 3. Fix ch03-l04 SENTENCE card translit
 */
const fs = require("node:fs");
const path = require("node:path");

const fixturesDir = path.join(__dirname, "fixtures");

function stripHarakat(str) {
  return str.replace(/[ً-ٰٟ]/g, "");
}

// Map Arabic grammatical role labels to enum values
const ROLE_MAP = {
  "مبتدأ": "SUBJECT",
  "مبتدأ مؤخر": "SUBJECT",
  "خبر": "PREDICATE",
  "خبر مقدم": "PREDICATE",
  "فعل": "VERB",
  "فِعْل": "VERB",
  "فاعل": "SUBJECT",
  "فَاعِل": "SUBJECT",
  "مفعول به": "OBJECT",
  "مفعول": "OBJECT",
  "حرف جر": "PREPOSITION",
  "جار ومجرور": "PREPOSITION",
  "جار ومجرور — خبر": "PREDICATE",
  "جار ومجرور استفهامي": "PREPOSITION",
  "ظرف زمان": "PREDICATE",
  "مضاف": "POSSESSIVE",
  "مضاف — نعت لله": "ADJECTIVE",
  "مضاف إليه": "POSSESSIVE",
  "نعت": "ADJECTIVE",
  "نعت (صِفَة)": "ADJECTIVE",
  "نعت معرفة": "ADJECTIVE",
  "موصوف": "SUBJECT",
  "موصوف معرفة": "SUBJECT",
};

const CHAPTER_CONCEPTS = {
  5: { en: "الإشارة in the Quran", ar: "أسماء الإشارة فِي الْقُرْآن", ur: "قرآن میں اسمائے اشارہ" },
  6: { en: "الصِّفَة in the Quran", ar: "الصِّفَة فِي الْقُرْآن", ur: "قرآن میں صفت" },
};

function fixGrammarParse(ex) {
  // Fix words: add ar_plain and translit if missing
  if (Array.isArray(ex.words)) {
    ex.words = ex.words.map(w => ({
      ar: w.ar,
      ar_plain: w.ar_plain || stripHarakat(w.ar) || "—",
      translit: w.translit || "—",
      en: w.en || w.ar,
      ...(w.ur ? { ur: w.ur } : {}),
    }));
  }

  // Fix available_roles and correct_roles: map Arabic labels to enum
  if (Array.isArray(ex.available_roles)) {
    ex.available_roles = ex.available_roles.map(r => ROLE_MAP[r] || r);
  }
  if (Array.isArray(ex.correct_roles)) {
    ex.correct_roles = ex.correct_roles.map(r => ROLE_MAP[r] || r);
  }

  // Add sentence_ar if missing (join words)
  if (!ex.sentence_ar && Array.isArray(ex.words)) {
    ex.sentence_ar = ex.words.map(w => w.ar).join(" ");
  }

  return ex;
}

const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith(".json")).sort();

for (const fileName of files) {
  const filePath = path.join(fixturesDir, fileName);
  const lesson = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let changed = false;
  const chapterOrder = lesson._meta?.chapter_order;

  // Fix reveal.concept_name for ch05/ch06 if missing
  if ((chapterOrder === 5 || chapterOrder === 6) && lesson.reveal && !lesson.reveal.concept_name) {
    lesson.reveal.concept_name = CHAPTER_CONCEPTS[chapterOrder];
    changed = true;
  }

  // Fix GRAMMAR_PARSE exercises
  if (Array.isArray(lesson.exercises)) {
    lesson.exercises = lesson.exercises.map(ex => {
      if (ex.type === "GRAMMAR_PARSE") {
        const fixed = fixGrammarParse({ ...ex });
        if (JSON.stringify(fixed) !== JSON.stringify(ex)) changed = true;
        return fixed;
      }
      return ex;
    });
  }

  // Fix SENTENCE discover_card translit
  if (Array.isArray(lesson.discover_cards)) {
    lesson.discover_cards = lesson.discover_cards.map(card => {
      if (card.type === "SENTENCE" && card.text && card.text.translit === "") {
        card.text.translit = "—";
        changed = true;
      }
      return card;
    });
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(lesson, null, 2), "utf8");
    console.log(`Patched: ${fileName}`);
  }
}

console.log("Done.");
