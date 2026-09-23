/**
 * Word-level checking for "Answer it" — the spoken conversation in a
 * Conversation Lab (`spoken_phrases.lab.answer_it`, Pen section 26).
 *
 * The recogniser returns plain Arabic text. We never judge harakat or
 * pronunciation: both sides are folded to bare letters and the answer passes
 * when every WORD slot appears and every OPEN slot (a name) has a word of its
 * own. Order is not checked — a beginner who says the right words in a
 * different order has still answered the question.
 */

export type AnswerSlot =
  | { kind: "WORD"; ar: string; accept?: string[] }
  | { kind: "OPEN"; label?: { en: string; ur?: string } };

export type HeardWordStatus = "ok" | "open" | "wrong" | "extra";

export type HeardWord = { text: string; status: HeardWordStatus };

export type AnswerCheck = {
  passed: boolean;
  /** The words as heard, in spoken order, each marked with how it was used. */
  words: HeardWord[];
  /** WORD slots nothing matched, as display Arabic (with harakat). */
  missing: string[];
  /** The recogniser alternative the verdict is based on. */
  transcript: string;
};

// Harakat, superscript alif, Quranic annotation marks and tatweel.
const MARKS = /[ً-ٰٟۖ-ۭـ]/g;
const PUNCTUATION = /[؟?،,.!؛;:"'«»()[\]{}\-–—…]/g;

/** Folds Arabic to bare letters so spelling variants the recogniser picks agree. */
export function normalizeArabic(value: string): string {
  return value
    .normalize("NFC")
    .replace(MARKS, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(PUNCTUATION, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(value: string): string[] {
  const normalized = normalizeArabic(value);
  return normalized ? normalized.split(" ") : [];
}

function acceptedForms(slot: Extract<AnswerSlot, { kind: "WORD" }>): Set<string> {
  return new Set([slot.ar, ...(slot.accept ?? [])].map(normalizeArabic).filter(Boolean));
}

/** Checks one recogniser transcript against the answer slots. */
export function checkTranscript(transcript: string, slots: AnswerSlot[]): AnswerCheck {
  const raw = transcript.replace(PUNCTUATION, " ").split(/\s+/).filter(Boolean);
  const tokens = raw.map(normalizeArabic);
  const used = new Array<HeardWordStatus | null>(tokens.length).fill(null);
  const missing: string[] = [];

  for (const slot of slots) {
    if (slot.kind !== "WORD") continue;
    const forms = acceptedForms(slot);
    const index = tokens.findIndex((token, i) => used[i] === null && forms.has(token));
    if (index >= 0) used[index] = "ok";
    else missing.push(slot.ar);
  }

  // Open slots take the last unused words: a name follows its lead-in
  // (اسْمِي عُمَر), so a wrong lead-in is still reported as the wrong word.
  const openSlots = slots.filter((slot) => slot.kind === "OPEN").length;
  let openFilled = 0;
  for (let i = tokens.length - 1; i >= 0 && openFilled < openSlots; i -= 1) {
    if (used[i] === null && tokens[i]) {
      used[i] = "open";
      openFilled += 1;
    }
  }

  // A leftover word while a WORD slot is empty is the learner's attempt at that
  // slot — the wrong word. With nothing missing it is just extra and harmless.
  const leftoverStatus: HeardWordStatus = missing.length > 0 ? "wrong" : "extra";
  const words = raw.map((text, i) => ({ text, status: used[i] ?? leftoverStatus }));
  const wrongCount = words.filter((word) => word.status === "wrong").length;

  return {
    passed: missing.length === 0 && openFilled === openSlots,
    words,
    // A wrong word already stands in for the slot it replaced; only list the
    // slots no word was offered for.
    missing: missing.slice(wrongCount),
    transcript,
  };
}

/**
 * Checks every recogniser alternative and returns the first that passes, or
 * the top alternative's result so the learner sees what was actually heard.
 */
export function checkAlternatives(transcripts: string[], slots: AnswerSlot[]): AnswerCheck | null {
  const heard = transcripts.map((value) => value.trim()).filter(Boolean);
  if (heard.length === 0) return null;
  const results = heard.map((value) => checkTranscript(value, slots));
  return results.find((result) => result.passed) ?? results[0];
}

/** Bare forms the recogniser can be biased towards (Android 13+). */
export function biasingStrings(slots: AnswerSlot[]): string[] {
  const words = slots.flatMap((slot) => (slot.kind === "WORD" ? [slot.ar, ...(slot.accept ?? [])] : []));
  return [...new Set(words.map((word) => word.replace(MARKS, "").trim()).filter(Boolean))];
}
