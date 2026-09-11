import { create } from "zustand";

interface OnboardingState {
  goal: string;
  level: string;
  name: string;
  language: string;
  translationLanguage: string;
  placementType: string;
  dailyGoalMinutes: number;
  // ISO YYYY-MM-DD from the age-check step; empty until answered.
  dateOfBirth: string;
  // A Google ID token the backend answered with age_check_required; the
  // age-check screen retries sign-up with it once a date of birth is chosen.
  pendingGoogleIdToken: string;
  setGoal: (goal: string) => void;
  setLevel: (level: string) => void;
  setName: (name: string) => void;
  setLanguage: (language: string) => void;
  setTranslationLanguage: (language: string) => void;
  setPlacementType: (placementType: string) => void;
  setDailyGoalMinutes: (minutes: number) => void;
  setDateOfBirth: (dateOfBirth: string) => void;
  setPendingGoogleIdToken: (idToken: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  goal: "QURAN",
  level: "BEGINNER",
  name: "",
  // English is the pre-auth default; the onboarding language picker sets both
  // fields together (user decision 2026-08-16).
  language: "en",
  translationLanguage: "en",
  placementType: "BEGINNER",
  dailyGoalMinutes: 10,
  dateOfBirth: "",
  pendingGoogleIdToken: "",
  setGoal: (goal) => set({ goal }),
  setLevel: (level) => set({ level }),
  setName: (name) => set({ name }),
  setLanguage: (language) => set({ language }),
  setTranslationLanguage: (translationLanguage) => set({ translationLanguage }),
  setPlacementType: (placementType) => set({ placementType }),
  setDailyGoalMinutes: (dailyGoalMinutes) => set({ dailyGoalMinutes }),
  setDateOfBirth: (dateOfBirth) => set({ dateOfBirth }),
  setPendingGoogleIdToken: (pendingGoogleIdToken) => set({ pendingGoogleIdToken }),
  reset: () => set({ goal: "QURAN", level: "BEGINNER", name: "", language: "en", translationLanguage: "en", placementType: "BEGINNER", dailyGoalMinutes: 10, dateOfBirth: "", pendingGoogleIdToken: "" }),
}));
