import { create } from "zustand";

interface OnboardingState {
  goal: string;
  level: string;
  name: string;
  language: string;
  translationLanguage: string;
  placementType: string;
  dailyGoalMinutes: number;
  setGoal: (goal: string) => void;
  setLevel: (level: string) => void;
  setName: (name: string) => void;
  setLanguage: (language: string) => void;
  setTranslationLanguage: (language: string) => void;
  setPlacementType: (placementType: string) => void;
  setDailyGoalMinutes: (minutes: number) => void;
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
  setGoal: (goal) => set({ goal }),
  setLevel: (level) => set({ level }),
  setName: (name) => set({ name }),
  setLanguage: (language) => set({ language }),
  setTranslationLanguage: (translationLanguage) => set({ translationLanguage }),
  setPlacementType: (placementType) => set({ placementType }),
  setDailyGoalMinutes: (dailyGoalMinutes) => set({ dailyGoalMinutes }),
  reset: () => set({ goal: "QURAN", level: "BEGINNER", name: "", language: "en", translationLanguage: "en", placementType: "BEGINNER", dailyGoalMinutes: 10 }),
}));
