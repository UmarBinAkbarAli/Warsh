import AsyncStorage from "@react-native-async-storage/async-storage";

// Checkpoint resume: once a learner finishes the learning cards and reaches
// practice, leaving and reopening the lesson resumes there instead of
// replaying the cards. The cards themselves are never checkpointed.
export const CHECKPOINT_MIN_BEAT = 3;
export const CHECKPOINT_MAX_BEAT = 4;

export function lessonCheckpointKey(userId: string, lessonId: string) {
  return `warsh_lesson_checkpoint_v2_${userId}_${lessonId}`;
}

/** Lesson ids (of those given) that have a saved practice checkpoint. */
export async function lessonsWithCheckpoint(userId: string, lessonIds: string[]): Promise<Set<string>> {
  try {
    const entries = await AsyncStorage.multiGet(lessonIds.map((id) => lessonCheckpointKey(userId, id)));
    const saved = new Set<string>();
    entries.forEach(([, value], index) => {
      const beat = value ? parseInt(value, 10) : NaN;
      if (beat >= CHECKPOINT_MIN_BEAT && beat <= CHECKPOINT_MAX_BEAT) saved.add(lessonIds[index]);
    });
    return saved;
  } catch {
    return new Set();
  }
}
