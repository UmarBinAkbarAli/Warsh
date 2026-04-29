import { create } from "zustand";

interface OnboardingState {
  goal: string;
  level: string;
  name: string;
  language: string;
  placementType: string;
  setGoal: (goal: string) => void;
  setLevel: (level: string) => void;
  setName: (name: string) => void;
  setLanguage: (language: string) => void;
  setPlacementType: (placementType: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  goal: "QURAN",
  level: "BEGINNER",
  name: "",
  language: "ur",
  placementType: "BEGINNER",
  setGoal: (goal) => set({ goal }),
  setLevel: (level) => set({ level }),
  setName: (name) => set({ name }),
  setLanguage: (language) => set({ language }),
  setPlacementType: (placementType) => set({ placementType }),
  reset: () => set({ goal: "QURAN", level: "BEGINNER", name: "", language: "ur", placementType: "BEGINNER" })
}));
