import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "@services/api";
import { COMMITMENT_PROMPT_SHOWN_KEY } from "../constants/commitment";

/**
 * The commitment screen is normally reached from the Learn checklist. This is
 * the fallback: offered once, after the first streak day of a lesson, to anyone
 * who has no streak goal on the server yet — and never again after that.
 */
export async function shouldOfferCommitmentPrompt(userId: string | undefined): Promise<boolean> {
  const [promptShown, goalOnServer] = await Promise.all([
    userId ? AsyncStorage.getItem(`${COMMITMENT_PROMPT_SHOWN_KEY}_${userId}`).catch(() => null) : null,
    api
      .get("/api/progress")
      .then((res) => res.data.data.streakGoalDays ?? null)
      .catch(() => undefined),
  ]);
  // A failed profile read is treated as "unknown": don't nag on a bad
  // connection, the checklist step still offers the screen.
  return !promptShown && goalOnServer === null;
}
