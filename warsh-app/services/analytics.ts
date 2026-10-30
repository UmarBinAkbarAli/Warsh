import { NativeModules, Platform } from "react-native";
import { Mixpanel } from "mixpanel-react-native";
import { useAuthStore } from "@stores/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
const ENV = process.env.EXPO_PUBLIC_ENVIRONMENT ?? "development";

let mp: Mixpanel | null = null;
let web: typeof import("mixpanel-browser").default | null = null;
let initialization: Promise<void> | null = null;
let queue: Promise<void> = Promise.resolve();
let identifiedId: string | null = null;
const LAST_USER_KEY = "warsh_analytics_last_user_v1";

export function initAnalytics(): Promise<void> {
  if (!TOKEN) return Promise.resolve();
  if (initialization) return initialization;
  initialization = (async () => {
    if (Platform.OS === "web") {
      // Initialise only for a verified adult account, never while age is unknown.
      const sdk = (await import("mixpanel-browser")).default;
      const options = { autocapture: false, track_pageview: false, ip: false, cross_subdomain_cookie: true,
        track_marketing: false, store_google: false, save_referrer: false,
        property_blacklist: ["$current_url", "$referrer", "$initial_referrer", "$search_keyword"] };
      sdk.init(TOKEN, options);
      web = sdk;
    } else {
      const instance = new Mixpanel(TOKEN, false);
      await instance.init();
      instance.setUseIpAddressForGeolocation(false);
      mp = instance;
    }
  })().catch(() => { initialization = null; });
  return initialization;
}

function eligibleId(): string | null {
  const { token, user } = useAuthStore.getState();
  return token && user?.dateOfBirth && user.isMinor === false ? user.id : null;
}

// Serialize identity changes and emissions. Recheck the current account after
// each asynchronous boundary so queued work cannot cross an account switch.
function enqueue(action: () => void): Promise<boolean> {
  const userId = eligibleId();
  if (!userId) return Promise.resolve(false);
  let sent = false;
  queue = queue.then(async () => {
    if (eligibleId() !== userId) return;
    await initAnalytics();
    if (eligibleId() !== userId || (!mp && !web)) return;
    if (identifiedId !== userId) {
      const previousId = identifiedId ?? await AsyncStorage.getItem(LAST_USER_KEY);
      if (eligibleId() !== userId) return;
      // The website and web app share a Mixpanel cookie. Local app storage may
      // have been cleared while that cookie still belongs to another account.
      // Never attach an authenticated browser identity to a different user.
      const browserUserId = web?.get_property("$user_id");
      if ((previousId && previousId !== userId) ||
          (typeof browserUserId === "string" && browserUserId !== userId)) await resetSdk();
      if (mp) await mp.identify(userId);
      else web?.identify(userId);
      if (eligibleId() !== userId) { await resetSdk(); identifiedId = null; return; }
      identifiedId = userId;
      await AsyncStorage.setItem(LAST_USER_KEY, userId);
      if (eligibleId() !== userId) { await resetSdk(); identifiedId = null; return; }
    }
    action();
    sent = true;
  }).catch(() => {});
  return queue.then(() => sent);
}

async function resetSdk() {
  // The SDK's public reset() discards the native promise. Await the bridge so
  // the next identify cannot race with a reset from the previous account.
  if (mp && TOKEN && NativeModules.MixpanelReactNative) await NativeModules.MixpanelReactNative.reset(TOKEN);
  else mp?.reset();
  web?.reset();
}

export function setAnalyticsSuppressed(value: boolean) {
  if (value) resetAnalytics();
}

export function track(event: string, props?: Record<string, unknown>) {
  return enqueue(() => {
    const properties = { environment: ENV, surface: Platform.OS === "web" ? "web_app" : Platform.OS, ...props };
    if (mp) mp.track(event, properties);
    else web?.track(event, properties);
  });
}

export function identifyUser(userId: string, peopleProps?: Record<string, unknown>) {
  if (eligibleId() !== userId) return;
  if (peopleProps) setPeopleProps(peopleProps);
}

export function resetAnalytics() {
  // Execute in order with any identify already in flight.
  queue = queue.then(async () => { await resetSdk(); identifiedId = null; }).catch(() => {});
}

export function setPeopleProps(props: Record<string, unknown>) {
  enqueue(() => { if (mp) mp.getPeople().set(props); else web?.people.set(props); });
}

function peopleOnce(props: Record<string, unknown>) {
  enqueue(() => { if (mp) mp.getPeople().setOnce(props); else web?.people.set_once(props); });
}

function peopleIncrement(key: string) {
  enqueue(() => { if (mp) mp.getPeople().increment(key, 1); else web?.people.increment(key, 1); });
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

// The single commitment moment: a streak goal in days, from the Learn
// checklist, the once-only post-celebration prompt, or Settings.
export function trackCommitmentSet(days: number, source: "checklist" | "celebration" | "settings") {
  track("commitment_set", { days, source });
}

// Android restore keys (Zero-Tap Sign-In). Created once per device after
// sign-in; `restore_sign_in` fires when a new device signed in silently with
// a key carried over by backup or device-to-device transfer.
export function trackRestoreCredentialCreated(cloudBackup: boolean) {
  track("restore_credential_created", { cloud_backup: cloudBackup });
}

export function trackRestoreSignIn() {
  track("restore_sign_in");
}

export function trackSignupCompleted(props: { goal: string; level: string; placement: string; language: string }) {
  track("signup_completed", props);
  peopleOnce({ signup_date: new Date().toISOString(), ...props });
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
  peopleIncrement("lessons_completed");
  setPeopleProps({ current_streak: props.currentStreak });
}

export function trackMilestoneUnlocked(key: string, title: string, xp: number) {
  track("milestone_unlocked", { achievement_key: key, title, xp });
}

// ─── Noor ─────────────────────────────────────────────────────────────────────

export function trackNoorMessageSent(messagesUsedToday: number) {
  track("noor_message_sent", { messages_used_today: messagesUsedToday });
  peopleIncrement("noor_messages_sent");
}

// ─── Vocabulary & Tadabbur ────────────────────────────────────────────────────

export function trackSRSReviewCompleted(props: { wordsReviewed: number; hard: number; good: number; easy: number }) {
  track("srs_review_completed", {
    words_reviewed: props.wordsReviewed,
    hard_count: props.hard,
    good_count: props.good,
    easy_count: props.easy,
  });
  peopleIncrement("srs_reviews_completed");
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
  setPeopleProps({ subscription_status: "active", subscription_plan: plan });
}

export function trackSubscriptionRestored(productId: string) {
  track("subscription_restored", { product_id: productId });
  setPeopleProps({ subscription_status: "active" });
}

// Learn-tab subscription health banner (Pen section 23). `state` is the
// normalized store state the backend reported: in_grace | on_hold | paused | pending.
export function trackSubscriptionBannerShown(state: string) {
  track("subscription_banner_shown", { state });
}

export function trackSubscriptionBannerCta(state: string) {
  track("subscription_banner_cta", { state });
}

// ─── Account ──────────────────────────────────────────────────────────────────

export function trackAccountDeleted() {
  track("account_deleted");
}
