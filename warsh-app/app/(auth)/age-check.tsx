import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@hooks/useAuth";
import { useAuthStore } from "@stores/authStore";
import { useOnboardingStore } from "@stores/onboardingStore";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { WebAuthLayout } from "@components/WebAuthLayout";
import api, { deleteAccount, getApiErrorCode, getApiErrorMessage, updateUserProfile } from "@services/api";
import { trackAccountDeleted, trackSignupCompleted } from "@services/analytics";
import { cancelAllNotifications } from "@services/notifications";
import { useLanguage } from "@services/language";
import { useT } from "@i18n/index";
import {
  Colors,
  Fonts,
  FontSizes,
  LineHeights,
  Radii,
  Spacing,
  WarshPalette,
} from "../../constants/theme";

/**
 * Neutral date-of-birth step (Pen section 21, approved 2026-09-11).
 *
 * Three modes, chosen by how the screen was reached:
 *  - email sign-up: opened from the login screen's Register link; stores the
 *    date in the onboarding store and continues to the register form.
 *  - Google sign-up: opened when /api/auth/google answered
 *    `age_check_required` for a new identity; retries with the same ID token.
 *  - `mode=existing`: an already signed-in account with no date on record;
 *    saves it through PATCH /api/users/me and cannot be dismissed.
 *
 * The copy never states the minimum age and nothing is preselected; the
 * backend is the only place the threshold is enforced.
 */

type Field = "day" | "month" | "year";

const MIN_YEARS_BACK = 120;

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

const MIN_AGE = 13;

// Mirrors lib/age.ts on the backend, which remains the authority; this only
// lets the email path show the refusal at the age step instead of after the
// learner has filled in the sign-up form.
function isAtLeastMinAge(year: number, month: number, day: number) {
  const now = new Date();
  let age = now.getFullYear() - year;
  const birthdayPassed =
    now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= day);
  if (!birthdayPassed) age -= 1;
  return age >= MIN_AGE;
}

function daysInMonth(year: number | null, month: number | null) {
  if (!year || !month) return 31;
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export default function AgeCheckScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useT();
  const isUrdu = useLanguage() === "ur";
  const { mode, refused: refusedParam } = useLocalSearchParams<{ mode?: string; refused?: string }>();
  const existing = mode === "existing";

  const { loginWithGoogle, applyPlacement } = useAuth();
  const patchUser = useAuthStore((s) => s.patchUser);
  const clearSession = useAuthStore((s) => s.clearSession);
  const {
    language,
    translationLanguage,
    goal,
    placementType,
    dailyGoalMinutes,
    pendingGoogleIdToken,
    setDateOfBirth,
    setPendingGoogleIdToken,
  } = useOnboardingStore();

  const [day, setDay] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [open, setOpen] = useState<Field | null>(null);
  const [whyOpen, setWhyOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refused, setRefused] = useState(refusedParam === "1");

  const monthNames = useMemo(() => t("ageCheck.months").split(","), [t]);
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: MIN_YEARS_BACK + 1 }, (_, i) => currentYear - i),
    [currentYear],
  );
  const days = useMemo(
    () => Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
    [year, month],
  );

  // A day that no longer exists after changing month/year is cleared rather
  // than silently rolled into the next month.
  useEffect(() => {
    if (day && day > daysInMonth(year, month)) setDay(null);
  }, [day, month, year]);

  const complete = day !== null && month !== null && year !== null;
  const iso = complete ? `${year}-${pad2(month)}-${pad2(day)}` : "";

  async function finishGoogleSignup(dateOfBirth: string) {
    const data = await loginWithGoogle(pendingGoogleIdToken, {
      nativeLanguage: language,
      translationLanguage,
      goal,
      dailyGoalMinutes,
      dateOfBirth,
    });
    setPendingGoogleIdToken("");
    if (data.created) {
      await applyPlacement(placementType);
      if (!data.user?.isMinor) {
        trackSignupCompleted({
          goal: goal ?? "",
          level: "",
          placement: placementType ?? "BEGINNER",
          language: language ?? "en",
        });
      }
    }
    router.replace("/(app)/(tabs)");
  }

  async function handleContinue() {
    if (!complete) return;
    setError("");
    setLoading(true);
    try {
      if (existing) {
        const response = await updateUserProfile({ dateOfBirth: iso });
        patchUser({ dateOfBirth: response.data.data.dateOfBirth, isMinor: response.data.data.isMinor });
        router.replace("/(app)/(tabs)");
        return;
      }
      if (pendingGoogleIdToken) {
        await finishGoogleSignup(iso);
        return;
      }
      if (!isAtLeastMinAge(year, month, day)) {
        setRefused(true);
        return;
      }
      setDateOfBirth(iso);
      router.push("/(auth)/register");
    } catch (err) {
      const code = getApiErrorCode(err);
      if (code === "age_not_permitted") {
        setRefused(true);
      } else if (code === "date_of_birth_locked") {
        // Already answered elsewhere (another device). The persisted user still
        // carries dateOfBirth: null, which is what routed us here, so pull the
        // real value before leaving or the authenticated layout bounces straight
        // back to this screen.
        try {
          const me = await api.get("/api/auth/me");
          patchUser(me.data.data.user);
        } catch {
          patchUser({ dateOfBirth: iso });
        }
        router.replace("/(app)/(tabs)");
      } else if (code === "bad_request") {
        setError(t("ageCheck.errorInvalid"));
      } else {
        setError(getApiErrorMessage(err, t("ageCheck.errorGeneric")));
      }
    } finally {
      setLoading(false);
    }
  }

  function handleBackToStart() {
    setDateOfBirth("");
    setPendingGoogleIdToken("");
    router.replace("/(auth)/auth-options");
  }

  async function handleDeleteAccount() {
    setLoading(true);
    try {
      await deleteAccount();
      trackAccountDeleted();
      await cancelAllNotifications().catch(() => {});
      await clearSession();
      router.replace("/(auth)/auth-options");
    } catch (err) {
      setError(getApiErrorMessage(err, t("ageCheck.errorGeneric")));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await cancelAllNotifications().catch(() => {});
    await clearSession();
    router.replace("/(auth)/auth-options");
  }

  if (refused) {
    return (
      <WebAuthLayout>
        <View
          style={[
            styles.screen,
            styles.refusedScreen,
            { paddingTop: insets.top + Spacing.xxl, paddingBottom: insets.bottom + Spacing.xl },
          ]}
        >
          <View style={styles.refusedBody}>
            <View style={styles.seal}>
              <ArabicText size="xl" style={styles.sealLetter}>
                و
              </ArabicText>
            </View>
            <Text style={[styles.title, styles.centered, isUrdu ? styles.rtlDir : null]}>
              {t("ageCheck.refusedTitle")}
            </Text>
            <Text style={[styles.subtitle, styles.centered, isUrdu ? styles.rtlDir : null]}>
              {existing ? t("ageCheck.refusedExistingBody") : t("ageCheck.refusedBody")}
            </Text>
            {existing ? null : (
              <Text style={[styles.note, styles.centered, isUrdu ? styles.rtlDir : null]}>
                {t("ageCheck.refusedNote")}
              </Text>
            )}
            {error ? <Text style={[styles.error, styles.centered]}>{error}</Text> : null}
          </View>
          {existing ? (
            <View style={styles.ctaStack}>
              <BrandButton
                title={t("ageCheck.deleteAccount")}
                onPress={handleDeleteAccount}
                loading={loading}
                variant="danger"
              />
              <BrandButton
                title={t("ageCheck.signOut")}
                onPress={handleSignOut}
                disabled={loading}
                variant="secondary"
              />
            </View>
          ) : (
            <BrandButton title={t("ageCheck.backToStart")} onPress={handleBackToStart} />
          )}
        </View>
      </WebAuthLayout>
    );
  }

  const fields: { key: Field; label: string; value: string }[] = [
    { key: "day", label: t("ageCheck.day"), value: day ? String(day) : "" },
    { key: "month", label: t("ageCheck.month"), value: month ? monthNames[month - 1] : "" },
    { key: "year", label: t("ageCheck.year"), value: year ? String(year) : "" },
  ];
  // Urdu reads Year · Month · Day right-to-left.
  const orderedFields = isUrdu ? [...fields].reverse() : fields;

  const sheetItems: (number | string)[] =
    open === "day" ? days : open === "month" ? monthNames : open === "year" ? years : [];
  const selectedIndex =
    open === "day" ? (day ?? 0) - 1 : open === "month" ? (month ?? 0) - 1 : open === "year" ? years.indexOf(year ?? -1) : -1;

  function choose(index: number) {
    if (open === "day") setDay(days[index]);
    else if (open === "month") setMonth(index + 1);
    else if (open === "year") setYear(years[index]);
    setOpen(null);
  }

  return (
    <WebAuthLayout>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.screen,
          { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {existing ? (
          <View style={styles.backSlot} />
        ) : (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            hitSlop={12}
            style={[styles.backSlot, isUrdu ? styles.backSlotRtl : null]}
          >
            <Ionicons name={isUrdu ? "chevron-forward" : "chevron-back"} size={24} color={WarshPalette.ink} />
          </Pressable>
        )}

        <Image
          source={require("../../assets/images/warsh-logo.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Warsh"
        />
        <ArabicText size="sm" style={styles.bismillah}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </ArabicText>

        <Text style={[styles.title, styles.centered, isUrdu ? styles.rtlDir : null]}>
          {existing ? t("ageCheck.existingTitle") : t("ageCheck.title")}
        </Text>
        <Text style={[styles.subtitle, styles.centered, isUrdu ? styles.rtlDir : null]}>
          {existing ? t("ageCheck.existingBody") : t("ageCheck.body")}
        </Text>

        <View style={styles.fieldRow}>
          {orderedFields.map((field) => (
            <Pressable
              key={field.key}
              onPress={() => setOpen(field.key)}
              accessibilityRole="button"
              accessibilityLabel={field.label}
              accessibilityValue={{ text: field.value || t("ageCheck.placeholder") }}
              style={({ pressed }) => [
                styles.field,
                isUrdu ? styles.fieldRtl : null,
                pressed ? styles.fieldPressed : null,
              ]}
            >
              <View style={[styles.fieldText, isUrdu ? styles.fieldTextRtl : null]}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <Text
                  style={[styles.fieldValue, field.value ? null : styles.fieldPlaceholder]}
                  numberOfLines={1}
                >
                  {field.value || t("ageCheck.placeholder")}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color={WarshPalette.subtleBrown} />
            </Pressable>
          ))}
        </View>

        <Text style={[styles.helper, styles.centered]}>{t("ageCheck.helper")}</Text>

        {error ? <Text style={[styles.error, styles.centered]}>{error}</Text> : null}

        <View style={styles.spacer} />

        <BrandButton
          title={t("common.continue")}
          onPress={handleContinue}
          loading={loading}
          disabled={!complete}
        />
        <Pressable onPress={() => setWhyOpen(true)} accessibilityRole="button" hitSlop={8} style={styles.whyBtn}>
          <Text style={styles.whyText}>{t("ageCheck.why")}</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={open !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(null)}
        statusBarTranslucent
      >
        <Pressable style={styles.scrim} onPress={() => setOpen(null)} accessibilityRole="button" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <View style={styles.handle} />
          <Text style={[styles.sheetTitle, isUrdu ? styles.rtlText : null]}>
            {open === "day" ? t("ageCheck.pickDay") : open === "month" ? t("ageCheck.pickMonth") : t("ageCheck.pickYear")}
          </Text>
          <FlatList
            data={sheetItems}
            keyExtractor={(item) => String(item)}
            style={styles.sheetList}
            initialScrollIndex={selectedIndex > 0 ? selectedIndex : undefined}
            getItemLayout={(_, index) => ({ length: OPTION_HEIGHT, offset: OPTION_HEIGHT * index, index })}
            renderItem={({ item, index }) => {
              const selected = index === selectedIndex;
              return (
                <Pressable
                  onPress={() => choose(index)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.option,
                    selected ? styles.optionSelected : null,
                    pressed ? styles.optionPressed : null,
                  ]}
                >
                  <Text style={[styles.optionLabel, isUrdu ? styles.rtlText : null]}>{String(item)}</Text>
                  {selected ? <Ionicons name="checkmark" size={20} color={WarshPalette.gold} /> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>

      <Modal
        visible={whyOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setWhyOpen(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.scrim} onPress={() => setWhyOpen(false)} accessibilityRole="button" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.xl }]}>
          <View style={styles.handle} />
          <Text style={[styles.sheetTitle, isUrdu ? styles.rtlText : null]}>{t("ageCheck.whyTitle")}</Text>
          <Text style={[styles.subtitle, isUrdu ? styles.rtlText : null]}>{t("ageCheck.whyBody")}</Text>
          <BrandButton title={t("common.continue")} onPress={() => setWhyOpen(false)} variant="secondary" />
        </View>
      </Modal>
    </WebAuthLayout>
  );
}

const OPTION_HEIGHT = 52;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flexGrow: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.xxl,
  },
  refusedScreen: {
    flex: 1,
    justifyContent: "space-between",
  },
  backSlot: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  backSlotRtl: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  logo: {
    width: 82,
    height: 56,
    alignSelf: "center",
  },
  bismillah: {
    textAlign: "center",
    color: WarshPalette.gold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.display,
    lineHeight: LineHeights.display,
    color: WarshPalette.ink,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.bodyBrown,
    marginBottom: Spacing.xl,
  },
  note: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    color: WarshPalette.subtleBrown,
  },
  centered: {
    textAlign: "center",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  // Centered copy keeps its alignment in Urdu; only the direction flips.
  rtlDir: {
    writingDirection: "rtl",
  },
  fieldRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    borderRadius: Radii.xs,
    borderWidth: 1,
    borderColor: WarshPalette.subtleBrown,
    backgroundColor: WarshPalette.parchmentBg,
    paddingHorizontal: Spacing.md,
  },
  fieldRtl: {
    flexDirection: "row-reverse",
  },
  fieldPressed: {
    backgroundColor: WarshPalette.highlightBgSoft,
  },
  fieldText: {
    flex: 1,
    gap: 2,
  },
  fieldTextRtl: {
    alignItems: "flex-end",
  },
  fieldLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
  },
  fieldValue: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.ink,
  },
  fieldPlaceholder: {
    color: WarshPalette.subtleBrown,
  },
  helper: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    color: WarshPalette.subtleBrown,
    marginTop: Spacing.md,
  },
  error: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.wrongText,
    marginTop: Spacing.md,
  },
  spacer: {
    flexGrow: 1,
    minHeight: Spacing.xxl,
  },
  whyBtn: {
    alignSelf: "center",
    marginTop: Spacing.lg,
  },
  whyText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyM,
    fontWeight: "700",
    color: WarshPalette.gold,
  },
  refusedBody: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: Spacing.md,
  },
  seal: {
    width: 88,
    height: 88,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.cream,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  sealLetter: {
    color: WarshPalette.gold,
  },
  ctaStack: {
    gap: Spacing.md,
  },
  scrim: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: WarshPalette.white,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    maxHeight: "70%",
  },
  handle: {
    alignSelf: "center",
    width: 37,
    height: 3,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.sageSoft,
    marginBottom: Spacing.xl,
  },
  sheetTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    color: WarshPalette.ink,
    marginBottom: Spacing.md,
  },
  sheetList: {
    flexGrow: 0,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: OPTION_HEIGHT,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.sm,
  },
  optionSelected: {
    backgroundColor: WarshPalette.highlightBgSoft,
  },
  optionPressed: {
    backgroundColor: WarshPalette.parchmentBg,
  },
  optionLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.ink,
  },
});
