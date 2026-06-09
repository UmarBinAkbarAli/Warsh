const metadataMap = require("./urdu-metadata-map.json");

const POST_REPLACEMENTS = [
  [/\bAdvanced\b/gi, "اعلیٰ"],
  [/\bAgreement\b/gi, "مطابقت"],
  [/\bCapstone\b/gi, "جامع"],
  [/\bClassroom\b/gi, "کلاس روم"],
  [/\bComprehension\b/gi, "فہم"],
  [/\bConditional\b/gi, "شرطیہ"],
  [/\bConstruction\b/gi, "ترکیب"],
  [/\bConstructions\b/gi, "ترکیبات"],
  [/\bDemonstrative(?:s)?\b/gi, "اسمائے اشارہ"],
  [/\bDialogue\b/gi, "مکالمہ"],
  [/\bDictation\b/gi, "املا"],
  [/\bException(?:s)?\b/gi, "استثنا"],
  [/\bGrammar\b/gi, "گرامر"],
  [/\bIntegration\b/gi, "ادغام"],
  [/\bMastery\b/gi, "مہارت"],
  [/\bParse\b/gi, "تجزیہ"],
  [/\bParsing\b/gi, "تجزیہ"],
  [/\bPassage(?:s)?\b/gi, "اقتباس"],
  [/\bPattern(?:s)?\b/gi, "پیٹرن"],
  [/\bPractice\b/gi, "مشق"],
  [/\bPronoun(?:s)?\b/gi, "ضمائر"],
  [/\bQuestion(?:ing|s)?\b/gi, "سوالات"],
  [/\bReading\b/gi, "مطالعہ"],
  [/\bReview\b/gi, "جائزہ"],
  [/\bSpoken\b/gi, "بول چال"],
  [/\bUnlock(?:ed)?\b/gi, "کھلا"],
  [/\bVocabulary\b/gi, "الفاظ"],
];

function applyPostReplacements(text) {
  return POST_REPLACEMENTS.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text);
}

function fallbackMetadata(text) {
  const trimmed = text.trim();

  const chapterReview = trimmed.match(/^Chapter\s+(\d+)\s+Review$/i);
  if (chapterReview) {
    return `باب ${chapterReview[1]} کا جائزہ`;
  }

  const reviewLabel = trimmed.match(/^R(\d+)\s+Review(?:\s+—\s+(.+))?$/i);
  if (reviewLabel) {
    return reviewLabel[2] ? `R${reviewLabel[1]} جائزہ — ${reviewLabel[2]}` : `R${reviewLabel[1]} جائزہ`;
  }

  const lessonLabel = trimmed.match(/^Lesson\s+(\d+)$/i);
  if (lessonLabel) {
    return `سبق ${lessonLabel[1]}`;
  }

  return applyPostReplacements(trimmed);
}

function normalizeUrduText(text) {
  return applyPostReplacements(text)
    .replace(/\s+—\s+/g, " — ")
    .replace(/\s+-\s+/g, " - ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function localizeMetadata(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return "";
  }

  const mapped = metadataMap[text] || fallbackMetadata(text);
  return normalizeUrduText(mapped);
}

module.exports = {
  localizeMetadata,
};
