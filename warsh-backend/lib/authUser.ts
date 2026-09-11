import { formatDateOfBirth, isMinor } from "./age";

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
  dateOfBirth?: Date | null;
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
    // Both derived server-side; the client only ever displays them. `null`
    // means the age check has not been answered yet and the app must ask.
    dateOfBirth: formatDateOfBirth(user.dateOfBirth),
    isMinor: isMinor(user.dateOfBirth),
  };
}
