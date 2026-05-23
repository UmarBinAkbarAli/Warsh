import { Mixpanel } from "mixpanel-react-native";

const TOKEN = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
const ENV = process.env.EXPO_PUBLIC_ENVIRONMENT ?? "development";

let mp: Mixpanel | null = null;

export async function initAnalytics() {
  if (!TOKEN || mp) return;
  mp = new Mixpanel(TOKEN, /* trackAutomaticEvents */ false);
  await mp.init();
}

function track(event: string, props?: Record<string, unknown>) {
  if (!mp) return;
  mp.track(event, { environment: ENV, ...props });
}

// ─── Identity ─────────────────────────────────────────────────────────────────

export function identifyUser(userId: string, peopleProps?: Record<string, unknown>) {
  if (!mp) return;
  mp.identify(userId);
  if (peopleProps) {
    mp.getPeople().set(peopleProps);
  }
}

export function resetAnalytics() {
  if (!mp) return;
  mp.reset();
}

export function setPeopleProps(props: Record<string, unknown>) {
  if (!mp) return;
  mp.getPeople().set(props);
}

// ─── Onboarding & Auth ────────────────────────────────────────────────────────

export function trackPreviewCompleted() {
  track("preview_completed");
}

export function trackOnboardingGoalSelected(goal: string) {
  track("onboarding_goal_selected", { goal });
}

export function trackOnboardingLevelSelected(level: string) {
  track("onboarding_level_selected", { level });
}

export function trackOnboardingPlacementSelected(placement: string) {
  track("onboarding_placement_selected", { placement });
}

export function trackOnboardingDailyCommitmentSelected(minutes: number) {
  track("onboarding_daily_commitment_selected", { minutes });
}

export function trackSignupCompleted(props: { goal: string; level: string; placement: string; language: string }) {
  track("signup_completed", props);
  mp?.getPeople().setOnce({ signup_date: new Date().toISOString(), ...props });
}

export function trackLoginCompleted() {
  track("login_completed");
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export function trackLessonStarted(lessonId: string, lessonType?: string | null) {
  track("lesson_started", { lesson_id: lessonId, lesson_type: lessonType ?? "STANDARD" });
}

export function trackLessonCompleted(props: {
  lessonId: string;
  lessonType?: string | null;
  xpEarned: number;
  currentStreak: number;
  dailyGoalMet: boolean;
}) {
  track("lesson_completed", {
    lesson_id: props.lessonId,
    lesson_type: props.lessonType ?? "STANDARD",
    xp_earned: props.xpEarned,
    current_streak: props.currentStreak,
    daily_goal_met: props.dailyGoalMet,
  });
  mp?.getPeople().increment("lessons_completed", 1);
  mp?.getPeople().set({ current_streak: props.currentStreak });
}

export function trackMilestoneUnlocked(key: string, title: string, xp: number) {
  track("milestone_unlocked", { achievement_key: key, title, xp });
}

// ─── Noor ─────────────────────────────────────────────────────────────────────

export function trackNoorMessageSent(messagesUsedToday: number) {
  track("noor_message_sent", { messages_used_today: messagesUsedToday });
  mp?.getPeople().increment("noor_messages_sent", 1);
}

// ─── Vocabulary & Tadabbur ────────────────────────────────────────────────────

export function trackSRSReviewCompleted(props: { wordsReviewed: number; hard: number; good: number; easy: number }) {
  track("srs_review_completed", {
    words_reviewed: props.wordsReviewed,
    hard_count: props.hard,
    good_count: props.good,
    easy_count: props.easy,
  });
  mp?.getPeople().increment("srs_reviews_completed", 1);
}

export function trackTadabburSurahViewed(surahId: string, surahNameEn: string, comprehensionPercent: number) {
  track("tadabbur_surah_viewed", { surah_id: surahId, surah_name: surahNameEn, comprehension_percent: comprehensionPercent });
}

// ─── Monetization ─────────────────────────────────────────────────────────────

export function trackPaywallViewed(source?: string) {
  track("paywall_viewed", { source: source ?? "unknown" });
}

export function trackSubscriptionStarted(plan: "monthly" | "annual") {
  track("subscription_started", { plan });
  mp?.getPeople().set({ subscription_status: "active", subscription_plan: plan });
}

export function trackSubscriptionRestored(productId: string) {
  track("subscription_restored", { product_id: productId });
  mp?.getPeople().set({ subscription_status: "active" });
}

// ─── Account ──────────────────────────────────────────────────────────────────

export function trackAccountDeleted() {
  track("account_deleted");
}
