import { prisma } from "./prisma";
import { PROGRESS_STATUS } from "./course";

export const ACHIEVEMENT_KEYS = {
  FIRST_LESSON: "first_lesson",
  FIRST_CHAPTER: "first_chapter",
  STREAK_3: "streak_3",
  STREAK_7: "streak_7",
  STREAK_30: "streak_30",
  XP_100: "xp_100",
  XP_500: "xp_500",
  XP_1000: "xp_1000",
  LESSONS_10: "lessons_10",
  FIRST_NOOR: "first_noor",
  FIRST_SHADOW_REPEAT: "first_shadow_repeat",
  FIRST_SPOKEN_LESSON: "first_spoken_lesson",
  PHRASES_10: "phrases_10",
  PHRASES_50: "phrases_50",
  PHRASES_100: "phrases_100",
  PHRASES_250: "phrases_250",
  PHRASES_500: "phrases_500",
} as const;

export const ACHIEVEMENTS_CATALOG = [
  {
    key: ACHIEVEMENT_KEYS.FIRST_LESSON,
    title: "الخُطْوَة الأُولَى",
    description: "Complete your very first lesson",
    icon: "footsteps-outline",
    xpReward: 25,
  },
  {
    key: ACHIEVEMENT_KEYS.FIRST_CHAPTER,
    title: "إِكْمَال الفَصْل الأَوَّل",
    description: "Complete your first full chapter",
    icon: "book-outline",
    xpReward: 50,
  },
  {
    key: ACHIEVEMENT_KEYS.STREAK_3,
    title: "ثَلَاثَة أَيَّام",
    description: "Study 3 days in a row",
    icon: "flame-outline",
    xpReward: 15,
  },
  {
    key: ACHIEVEMENT_KEYS.STREAK_7,
    title: "أُسْبُوع",
    description: "Keep a 7-day streak",
    icon: "star-outline",
    xpReward: 25,
  },
  {
    key: ACHIEVEMENT_KEYS.STREAK_30,
    title: "شَهْر كَامِل",
    description: "Keep a 30-day streak",
    icon: "trophy-outline",
    xpReward: 100,
  },
  {
    key: ACHIEVEMENT_KEYS.XP_100,
    title: "عَالِم نَاشِئ",
    description: "Earn 100 points",
    icon: "medal-outline",
    xpReward: 10,
  },
  {
    key: ACHIEVEMENT_KEYS.XP_500,
    title: "عَالِم فِضِّيّ",
    description: "Earn 500 points",
    icon: "medal-outline",
    xpReward: 25,
  },
  {
    key: ACHIEVEMENT_KEYS.XP_1000,
    title: "عَالِم ذَهَبِيّ",
    description: "Earn 1,000 points",
    icon: "medal-outline",
    xpReward: 50,
  },
  {
    key: ACHIEVEMENT_KEYS.LESSONS_10,
    title: "عَشْرَة دُرُوس",
    description: "Complete 10 lessons",
    icon: "library-outline",
    xpReward: 20,
  },
  {
    key: ACHIEVEMENT_KEYS.FIRST_NOOR,
    title: "أَوَّل سُؤَال",
    description: "Send your first message to Ustaad Noor",
    icon: "chatbubble-outline",
    xpReward: 10,
  },
  {
    key: ACHIEVEMENT_KEYS.FIRST_SHADOW_REPEAT,
    title: "أَوَّل مُحَاكَاة",
    description: "Complete your first speaking exercise",
    icon: "mic-outline",
    xpReward: 10,
  },
  {
    key: ACHIEVEMENT_KEYS.FIRST_SPOKEN_LESSON,
    title: "أَوَّل دَرْس كَلَام",
    description: "Complete your first spoken phrases lesson",
    icon: "chatbubbles-outline",
    xpReward: 25,
  },
  {
    key: ACHIEVEMENT_KEYS.PHRASES_10,
    title: "عَشْرَة جُمَل",
    description: "Learn to say 10 phrases",
    icon: "mic-outline",
    xpReward: 15,
  },
  {
    key: ACHIEVEMENT_KEYS.PHRASES_50,
    title: "خَمْسُونَ جُمْلَة",
    description: "Learn to say 50 phrases",
    icon: "mic-outline",
    xpReward: 25,
  },
  {
    key: ACHIEVEMENT_KEYS.PHRASES_100,
    title: "مِئَة جُمْلَة",
    description: "Learn to say 100 phrases",
    icon: "mic-outline",
    xpReward: 50,
  },
  {
    key: ACHIEVEMENT_KEYS.PHRASES_250,
    title: "مِئَتَا وَخَمْسُونَ جُمْلَة",
    description: "Learn to say 250 phrases",
    icon: "mic-outline",
    xpReward: 100,
  },
  {
    key: ACHIEVEMENT_KEYS.PHRASES_500,
    title: "خَمْسُمِئَة جُمْلَة",
    description: "Learn to say 500 phrases",
    icon: "mic-outline",
    xpReward: 200,
  },
] as const;

type AchievementCheckContext = {
  userId: string;
  completedLessonCount: number;
  totalXp: number;
  currentStreak: number;
  chapterJustCompleted?: boolean;
  phrasesSpoken?: number;
  firstShadowRepeat?: boolean;
  firstSpokenLesson?: boolean;
};

async function getAlreadyUnlocked(userId: string): Promise<Set<string>> {
  const existing = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: { select: { key: true } } },
  });
  return new Set(existing.map((ua) => ua.achievement.key));
}

async function awardAchievement(userId: string, achievementKey: string): Promise<number> {
  const achievement = await prisma.achievement.findUnique({ where: { key: achievementKey } });
  if (!achievement) return 0;

  await prisma.userAchievement.create({
    data: { userId, achievementId: achievement.id },
  });

  if (achievement.xpReward > 0) {
    await prisma.user.update({ where: { id: userId }, data: { xp: { increment: achievement.xpReward } } });
  }

  return achievement.xpReward;
}

export async function checkAndAwardAchievements(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  ctx: AchievementCheckContext
): Promise<{ key: string; title: string; xpReward: number }[]> {
  const alreadyUnlocked = await getAlreadyUnlocked(ctx.userId);
  const toCheck: { key: string; met: boolean }[] = [
    { key: ACHIEVEMENT_KEYS.FIRST_LESSON, met: ctx.completedLessonCount >= 1 },
    { key: ACHIEVEMENT_KEYS.FIRST_CHAPTER, met: ctx.chapterJustCompleted ?? false },
    { key: ACHIEVEMENT_KEYS.LESSONS_10, met: ctx.completedLessonCount >= 10 },
    { key: ACHIEVEMENT_KEYS.STREAK_3, met: ctx.currentStreak >= 3 },
    { key: ACHIEVEMENT_KEYS.STREAK_7, met: ctx.currentStreak >= 7 },
    { key: ACHIEVEMENT_KEYS.STREAK_30, met: ctx.currentStreak >= 30 },
    { key: ACHIEVEMENT_KEYS.XP_100, met: ctx.totalXp >= 100 },
    { key: ACHIEVEMENT_KEYS.XP_500, met: ctx.totalXp >= 500 },
    { key: ACHIEVEMENT_KEYS.XP_1000, met: ctx.totalXp >= 1000 },
    { key: ACHIEVEMENT_KEYS.FIRST_SHADOW_REPEAT, met: ctx.firstShadowRepeat ?? false },
    { key: ACHIEVEMENT_KEYS.FIRST_SPOKEN_LESSON, met: ctx.firstSpokenLesson ?? false },
    { key: ACHIEVEMENT_KEYS.PHRASES_10, met: (ctx.phrasesSpoken ?? 0) >= 10 },
    { key: ACHIEVEMENT_KEYS.PHRASES_50, met: (ctx.phrasesSpoken ?? 0) >= 50 },
    { key: ACHIEVEMENT_KEYS.PHRASES_100, met: (ctx.phrasesSpoken ?? 0) >= 100 },
    { key: ACHIEVEMENT_KEYS.PHRASES_250, met: (ctx.phrasesSpoken ?? 0) >= 250 },
    { key: ACHIEVEMENT_KEYS.PHRASES_500, met: (ctx.phrasesSpoken ?? 0) >= 500 },
  ];

  const newlyUnlocked: { key: string; title: string; xpReward: number }[] = [];

  for (const check of toCheck) {
    if (!check.met || alreadyUnlocked.has(check.key)) continue;

    const achievement = await tx.achievement.findUnique({ where: { key: check.key } });
    if (!achievement) continue;

    await tx.userAchievement.create({ data: { userId: ctx.userId, achievementId: achievement.id } });
    if (achievement.xpReward > 0) {
      await tx.user.update({ where: { id: ctx.userId }, data: { xp: { increment: achievement.xpReward } } });
    }

    newlyUnlocked.push({ key: check.key, title: achievement.title, xpReward: achievement.xpReward });
  }

  return newlyUnlocked;
}

export async function checkFirstNoorAchievement(userId: string): Promise<{ key: string; title: string; xpReward: number } | null> {
  const alreadyUnlocked = await getAlreadyUnlocked(userId);
  if (alreadyUnlocked.has(ACHIEVEMENT_KEYS.FIRST_NOOR)) return null;

  const xpBonus = await awardAchievement(userId, ACHIEVEMENT_KEYS.FIRST_NOOR);
  const achievement = ACHIEVEMENTS_CATALOG.find((a) => a.key === ACHIEVEMENT_KEYS.FIRST_NOOR);
  if (!achievement) return null;

  return { key: achievement.key, title: achievement.title, xpReward: xpBonus };
}
