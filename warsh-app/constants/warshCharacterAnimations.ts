// Generated Warsh character animation manifest. Do not edit by hand; regenerate from D:/Projects/Warsh/animated-poses.
export type WarshCharacterAnimationId =
  | "reading"
  | "writing"
  | "thinking"
  | "learning"
  | "teaching-guiding"
  | "exploring"
  | "celebrating"
  | "encouraging"
  | "presenting"
  | "protecting"
  | "waving"
  | "pointing"
  | "ok-sign"
  | "victory"
  | "saluting"
  | "welcoming"
  | "jumping"
  | "running"
  | "floating"
  | "spinning"
  | "dashing"
  | "leaping"
  | "hovering"
  | "looking-far"
  | "carrying-lantern"
  | "planting-knowledge"
  | "cheering"
  | "making-a-promise"
  | "reaching-goal"
  | "overcoming"
  | "lighting-the-way"
  | "sharing-knowledge"
  | "grateful"
  | "base-character";

export type WarshCharacterAnimationAsset = {
  id: WarshCharacterAnimationId;
  label: string;
  scenario: string;
  fps: number;
  frames: number;
  durationMs: number;
  frameWidth: number;
  frameHeight: number;
  spritesheet: number;
};

export const warshCharacterAnimations: Record<
  WarshCharacterAnimationId,
  WarshCharacterAnimationAsset
> = {
  reading: {
    id: "reading",
    label: "Reading",
    scenario: "lesson-reading",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 370,
    frameHeight: 416,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/01-reading.png"),
  },
  writing: {
    id: "writing",
    label: "Writing",
    scenario: "lesson-writing",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 326,
    frameHeight: 416,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/02-writing.png"),
  },
  thinking: {
    id: "thinking",
    label: "Thinking",
    scenario: "thinking",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 298,
    frameHeight: 408,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/03-thinking.png"),
  },
  learning: {
    id: "learning",
    label: "Learning",
    scenario: "new-concept",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 344,
    frameHeight: 408,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/04-learning.png"),
  },
  "teaching-guiding": {
    id: "teaching-guiding",
    label: "Teaching / Guiding",
    scenario: "noor-guidance",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 378,
    frameHeight: 408,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/05-teaching-guiding.png"),
  },
  exploring: {
    id: "exploring",
    label: "Exploring",
    scenario: "vocabulary-explore",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 368,
    frameHeight: 380,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/06-exploring.png"),
  },
  celebrating: {
    id: "celebrating",
    label: "Celebrating",
    scenario: "lesson-complete",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 320,
    frameHeight: 416,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/07-celebrating.png"),
  },
  encouraging: {
    id: "encouraging",
    label: "Encouraging",
    scenario: "encouragement",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 312,
    frameHeight: 416,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/08-encouraging.png"),
  },
  presenting: {
    id: "presenting",
    label: "Presenting",
    scenario: "presentation",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 414,
    frameHeight: 384,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/09-presenting.png"),
  },
  protecting: {
    id: "protecting",
    label: "Protecting",
    scenario: "locked-or-protected",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 352,
    frameHeight: 410,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/10-protecting.png"),
  },
  waving: {
    id: "waving",
    label: "Waving",
    scenario: "welcome",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 242,
    frameHeight: 292,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/11-waving.png"),
  },
  pointing: {
    id: "pointing",
    label: "Pointing",
    scenario: "hint-or-direction",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 260,
    frameHeight: 280,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/12-pointing.png"),
  },
  "ok-sign": {
    id: "ok-sign",
    label: "OK Sign",
    scenario: "correct-answer",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 226,
    frameHeight: 298,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/13-ok-sign.png"),
  },
  victory: {
    id: "victory",
    label: "Victory",
    scenario: "milestone",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 224,
    frameHeight: 302,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/14-victory.png"),
  },
  saluting: {
    id: "saluting",
    label: "Saluting",
    scenario: "respectful-greeting",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 226,
    frameHeight: 302,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/15-saluting.png"),
  },
  welcoming: {
    id: "welcoming",
    label: "Welcoming",
    scenario: "onboarding-welcome",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 276,
    frameHeight: 304,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/16-welcoming.png"),
  },
  jumping: {
    id: "jumping",
    label: "Jumping",
    scenario: "high-energy-success",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 236,
    frameHeight: 258,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/17-jumping.png"),
  },
  running: {
    id: "running",
    label: "Running",
    scenario: "daily-goal-progress",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 294,
    frameHeight: 266,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/18-running.png"),
  },
  floating: {
    id: "floating",
    label: "Floating",
    scenario: "loading-idle",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 206,
    frameHeight: 246,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/19-floating.png"),
  },
  spinning: {
    id: "spinning",
    label: "Spinning",
    scenario: "processing",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 284,
    frameHeight: 268,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/20-spinning.png"),
  },
  dashing: {
    id: "dashing",
    label: "Dashing",
    scenario: "fast-progress",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 282,
    frameHeight: 254,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/21-dashing.png"),
  },
  leaping: {
    id: "leaping",
    label: "Leaping",
    scenario: "chapter-unlocked",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 234,
    frameHeight: 250,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/22-leaping.png"),
  },
  hovering: {
    id: "hovering",
    label: "Hovering",
    scenario: "ambient-idle",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 234,
    frameHeight: 286,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/23-hovering.png"),
  },
  "looking-far": {
    id: "looking-far",
    label: "Looking Far",
    scenario: "search-or-discovery",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 270,
    frameHeight: 262,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/24-looking-far.png"),
  },
  "carrying-lantern": {
    id: "carrying-lantern",
    label: "Carrying Lantern",
    scenario: "night-learning",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 248,
    frameHeight: 264,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/25-carrying-lantern.png"),
  },
  "planting-knowledge": {
    id: "planting-knowledge",
    label: "Planting Knowledge",
    scenario: "habit-building",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 268,
    frameHeight: 272,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/26-planting-knowledge.png"),
  },
  cheering: {
    id: "cheering",
    label: "Cheering",
    scenario: "positive-feedback",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 260,
    frameHeight: 262,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/27-cheering.png"),
  },
  "making-a-promise": {
    id: "making-a-promise",
    label: "Making a Promise",
    scenario: "commitment-or-streak",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 224,
    frameHeight: 262,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/28-making-a-promise.png"),
  },
  "reaching-goal": {
    id: "reaching-goal",
    label: "Reaching Goal",
    scenario: "goal-reached",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 240,
    frameHeight: 262,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/29-reaching-goal.png"),
  },
  overcoming: {
    id: "overcoming",
    label: "Overcoming",
    scenario: "challenge-complete",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 276,
    frameHeight: 270,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/30-overcoming.png"),
  },
  "lighting-the-way": {
    id: "lighting-the-way",
    label: "Lighting the Way",
    scenario: "guidance",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 248,
    frameHeight: 260,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/31-lighting-the-way.png"),
  },
  "sharing-knowledge": {
    id: "sharing-knowledge",
    label: "Sharing Knowledge",
    scenario: "share-or-teach",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 318,
    frameHeight: 256,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/32-sharing-knowledge.png"),
  },
  grateful: {
    id: "grateful",
    label: "Grateful",
    scenario: "gratitude",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 212,
    frameHeight: 260,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/33-grateful.png"),
  },
  "base-character": {
    id: "base-character",
    label: "Base Character",
    scenario: "neutral-idle",
    fps: 18,
    frames: 24,
    durationMs: 1333,
    frameWidth: 344,
    frameHeight: 544,
    spritesheet: require("../assets/characters/warsh-animations/spritesheets/34-base-character.png"),
  },
};
