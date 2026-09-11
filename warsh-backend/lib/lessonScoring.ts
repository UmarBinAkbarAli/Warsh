// A lesson passes when at least this share of its scored exercises are correct.
// Percentage rather than a fixed wrong-count so 5-exercise and 15-exercise
// lessons are held to the same standard (owner decision 2026-09-11).
export const LESSON_PASS_PERCENT = 70;

export interface LessonScoreResult {
  passed: boolean;
  score: number;
  correctCount: number;
  totalScored: number;
  requiredCorrect: number;
}

// exerciseResults holds one boolean per answerable exercise the learner
// submitted (SHADOW_REPEAT/SPOKEN_PHRASES exercises are recording-completion
// based and are never included). A lesson with no answerable exercises can
// never fail.
export function calculateLessonScore(exerciseResults: boolean[]): LessonScoreResult {
  const totalScored = exerciseResults.length;
  const correctCount = exerciseResults.filter(Boolean).length;
  const requiredCorrect = Math.ceil((LESSON_PASS_PERCENT / 100) * totalScored);
  const passed = correctCount >= requiredCorrect;
  const score = totalScored > 0 ? Math.round((correctCount / totalScored) * 100) : 100;
  return { passed, score, correctCount, totalScored, requiredCorrect };
}
