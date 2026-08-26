export const LESSON_FAIL_THRESHOLD = 3;

export interface LessonScoreResult {
  passed: boolean;
  score: number;
  correctCount: number;
  totalScored: number;
  threshold: number;
}

// exerciseResults holds one boolean per answerable exercise the learner
// submitted (SHADOW_REPEAT/SPOKEN_PHRASES exercises are recording-completion
// based and are never included). A lesson with no answerable exercises can
// never fail.
export function calculateLessonScore(exerciseResults: boolean[]): LessonScoreResult {
  const totalScored = exerciseResults.length;
  const wrongCount = exerciseResults.filter((correct) => !correct).length;
  const correctCount = totalScored - wrongCount;
  const passed = totalScored === 0 || wrongCount < LESSON_FAIL_THRESHOLD;
  const score = totalScored > 0 ? Math.round((correctCount / totalScored) * 100) : 100;
  return { passed, score, correctCount, totalScored, threshold: LESSON_FAIL_THRESHOLD };
}
