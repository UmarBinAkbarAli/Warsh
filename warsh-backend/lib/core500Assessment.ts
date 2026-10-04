import { randomInt, randomUUID } from "node:crypto";

export interface AssessmentWord {
  id: string; arabic: string; translationEn: string; translationUr: string;
}
export interface Question {
  id: string; wordId: string; arabic: string;
  options: { id: string; text: string }[]; correctOptionId: string; meaning: string;
}
export interface Answer { optionId: string; correct: boolean }
export interface AssessmentState {
  language: string; phase: string; questions: Question[];
  activeIds: string[]; passedIds: string[]; answers: Record<string, Answer>; round: number;
}

function shuffle<T>(values: T[]): T[] {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const STOP_WORDS = new Set([
  "a", "an", "the", "of", "to", "in", "on", "at", "by", "for", "from", "with", "and", "or", "be", "is", "are", "was",
  "who", "whom", "that", "which", "it", "its", "this", "these", "those", "he", "she", "they", "we", "you", "i",
  "his", "her", "their", "our", "your", "my", "one", "ones", "someone", "something",
  "کا", "کی", "کے", "کو", "میں", "سے", "اور", "ہے", "ہیں", "وہ", "یہ", "جو", "ایک", "پر", "کہ", "نے", "بھی", "تھا", "تھی",
]);

// Crude stem so "creates"/"created"/"creating" count as the same idea.
function stem(token: string) {
  return token.length > 4 ? token.replace(/(ing|ed|es|s)$/, "").replace(/e$/, "") : token;
}

function contentTokens(text: string) {
  return new Set(text.toLowerCase().normalize("NFKC").split(/[^\p{L}\p{N}]+/u)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token)).map(stem));
}

/** Two glosses that share a content word read as the same idea ("Lord" / "the Lord of the worlds"). */
export function meaningsOverlap(a: string, b: string) {
  const left = contentTokens(a);
  for (const token of contentTokens(b)) if (left.has(token)) return true;
  return false;
}

export function buildQuestions(words: AssessmentWord[], distractors: AssessmentWord[], language: "en" | "ur"): Question[] {
  if (words.length !== 5 || new Set(words.map(w => w.id)).size !== 5) throw new Error("A test needs five distinct words.");
  const meaningOf = (w: AssessmentWord) => (language === "ur" ? w.translationUr : w.translationEn).trim();
  return shuffle(words).map(word => {
    const meaning = meaningOf(word);
    const candidates = [...new Set([...shuffle(words.filter(w => w.id !== word.id)), ...shuffle(distractors)].map(meaningOf))]
      .filter(text => text && text !== meaning);
    // No wrong option may share a content word with the answer or with another wrong option.
    const others: string[] = [];
    for (const text of candidates) {
      if (others.length === 3) break;
      if (meaningsOverlap(text, meaning) || others.some(chosen => meaningsOverlap(text, chosen))) continue;
      others.push(text);
    }
    if (!meaning || others.length !== 3) throw new Error("Four distinct meanings are required for each test question.");
    const correctOptionId = randomUUID();
    return {
      id: randomUUID(), wordId: word.id, arabic: word.arabic, meaning, correctOptionId,
      options: shuffle([{ id: correctOptionId, text: meaning }, ...others.map(text => ({ id: randomUUID(), text }))]),
    };
  });
}

export function pendingQuestion(state: AssessmentState): Question | undefined {
  return state.questions.find(q => state.activeIds.includes(q.id) && !state.answers[q.id]);
}

export function gradeAnswer(state: AssessmentState, questionId: string, optionId: string): AssessmentState {
  const q = state.questions.find(q => q.id === questionId);
  if (!q || !state.activeIds.includes(q.id) || !q.options.some(o => o.id === optionId)) throw new Error("invalid_answer");
  const existing = state.answers[q.id];
  // Retrying an identical request after a lost response is safe; changing it is not.
  if (existing) {
    if (existing.optionId !== optionId) throw new Error("answer_already_submitted");
    return state;
  }
  if (state.phase !== "QUIZ" || pendingQuestion(state)?.id !== questionId) throw new Error("question_out_of_order");
  const correct = q.correctOptionId === optionId;
  const next = {
    ...state, answers: { ...state.answers, [q.id]: { optionId, correct } },
    passedIds: [...new Set([...state.passedIds, ...(correct ? [q.wordId] : [])])],
  };
  if (!pendingQuestion(next)) next.phase = next.passedIds.length === 5 ? "COMPLETE" : "REVIEW";
  return next;
}

export function retryMissed(state: AssessmentState): AssessmentState {
  if (state.phase !== "REVIEW") throw new Error("review_required");
  return {
    ...state, phase: "QUIZ", round: state.round + 1, answers: {},
    activeIds: state.questions.filter(q => !state.passedIds.includes(q.wordId)).map(q => q.id),
  };
}

export function publicAssessment(state: AssessmentState) {
  const q = state.phase === "QUIZ" ? pendingQuestion(state) : undefined;
  return {
    language: state.language, phase: state.phase, round: state.round,
    passedCount: state.passedIds.length, total: state.activeIds.length,
    answeredCount: Object.keys(state.answers).length,
    question: q ? { id: q.id, wordId: q.wordId, arabic: q.arabic, options: q.options } : null,
    // Meanings are revealed only after an answer, or for review of missed words.
    review: state.phase === "REVIEW" ? state.questions.filter(q => !state.passedIds.includes(q.wordId))
      .map(q => ({ wordId: q.wordId, arabic: q.arabic, meaning: q.meaning })) : [],
  };
}
