export const PLACEMENT_TYPE_TO_STARTING_CHAPTER: Record<string, number> = {
  BEGINNER: 1,
  KNOWS_LETTERS: 4,
  STUDIED_BEFORE: 6,
  CAN_READ_BASIC: 8,
};

export const VALID_PLACEMENT_TYPES = Object.keys(PLACEMENT_TYPE_TO_STARTING_CHAPTER);

export function getStartingChapterOrderForPlacement(placementType: string) {
  return PLACEMENT_TYPE_TO_STARTING_CHAPTER[placementType];
}
