// The one commitment Warsh asks for is a streak goal in days. The daily unit is
// fixed at one lesson — that is what the backend's `dailyGoalMet` measures
// (`todayProgress >= 1`) — so the minutes are shown as information, never as a
// choice. No lesson carries its own duration estimate yet, so this is the
// figure every surface quotes.
export const DAILY_UNIT_MINUTES = 10;

export const STREAK_GOAL_OPTIONS = [3, 7, 14, 30] as const;

// Set (per user) once the post-celebration commitment prompt has been shown,
// committed or not, so the fallback path never asks twice.
export const COMMITMENT_PROMPT_SHOWN_KEY = "warsh_commitment_prompt_shown";

export type CommitmentSource = "checklist" | "celebration" | "settings";
