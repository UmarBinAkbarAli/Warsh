type AuthUser = {
  id: string;
  email: string;
  name: string;
  nativeLanguage: string;
  translationLanguage: string;
  goal: unknown;
  level: unknown;
  xp: number;
  placementType: string | null;
  startingChapterOrder: number | null;
  hasPassword: boolean;
};

export function toAuthUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    nativeLanguage: user.nativeLanguage,
    translationLanguage: user.translationLanguage,
    goal: user.goal,
    level: user.level,
    xp: user.xp,
    placementType: user.placementType,
    startingChapterOrder: user.startingChapterOrder,
    hasPassword: user.hasPassword,
  };
}
