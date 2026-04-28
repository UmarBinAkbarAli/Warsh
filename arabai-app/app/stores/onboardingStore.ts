import { create } from "zustand";

interface OnboardingState {
  goal: string;
  level: string;
  name: string;
  language: string;
  setGoal: (goal: string) => void;
  setLevel: (level: string) => void;
  setName: (name: string) => void;
  setLanguage: (language: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  goal: "QURAN",
  level: "BEGINNER",
  name: "",
  language: "ur",
  setGoal: (goal) => set({ goal }),
  setLevel: (level) => set({ level }),
  setName: (name) => set({ name }),
  setLanguage: (language) => set({ language }),
  reset: () => set({ goal: "QURAN", level: "BEGINNER", name: "", language: "ur" })
}));
