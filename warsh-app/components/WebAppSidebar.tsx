import { Feather } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useT } from "@i18n/index";
import { useAuthStore } from "../stores/authStore";
import { Fonts, Radii, Spacing, WarshPalette, WebLayout, desktopFontSize } from "../constants/theme";

type NavItem = {
  /** i18n key — the same labels as the phone tab bar. */
  labelKey: string;
  icon: keyof typeof Feather.glyphMap;
  href: string;
  active: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    labelKey: "tabs.learn",
    icon: "book-open",
    href: "/(app)/(tabs)",
    active: (path) =>
      path === "/" ||
      path.includes("/chapters") ||
      path.includes("/lessons") ||
      path.includes("/tadabbur"),
  },
  {
    labelKey: "tabs.vocabulary",
    icon: "layers",
    href: "/(app)/(tabs)/vocabulary",
    active: (path) => path.includes("/vocabulary"),
  },
  {
    labelKey: "tabs.quran",
    icon: "book",
    href: "/(app)/(tabs)/quran",
    active: (path) => path.includes("/quran"),
  },
  {
    labelKey: "tabs.noor",
    icon: "message-circle",
    href: "/(app)/(tabs)/chat",
    active: (path) => path.includes("/chat"),
  },
  {
    labelKey: "tabs.profile",
    icon: "user",
    href: "/(app)/(tabs)/profile",
    active: (path) =>
      path.includes("/profile") ||
      path.includes("/settings") ||
      path.includes("/change-password") ||
      path.includes("/manage-subscription"),
  },
];

/**
 * Web navigation. Full sidebar from 1024px; `compact` is the 768–1023px icon
 * rail (design system › Web layout): icons only, labels as accessibility labels.
 */
export function WebAppSidebar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const t = useT();
  const name = user?.name?.trim() || t("webSidebar.learner");
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <View style={[styles.sidebar, compact && styles.rail]}>
      <View style={[styles.brand, compact && styles.brandRail]}>
        <View style={styles.mark}>
          <Text style={styles.markGlyph}>و</Text>
        </View>
        {compact ? null : <Text style={styles.wordmark}>WARSH</Text>}
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const selected = item.active(pathname);
          return (
            <Pressable
              key={item.href}
              accessibilityRole="button"
              accessibilityLabel={t(item.labelKey)}
              accessibilityState={{ selected }}
              onPress={() => router.replace(item.href as never)}
              style={({ pressed }) => [
                styles.navItem,
                compact && styles.navItemRail,
                selected && styles.navItemSelected,
                !selected && pressed && styles.navItemHovered,
              ]}
            >
              <Feather
                name={item.icon}
                size={19}
                color={selected ? WarshPalette.white : WarshPalette.subtleBrown}
              />
              {compact ? null : (
                <Text style={[styles.navLabel, selected && styles.navLabelSelected]}>
                  {t(item.labelKey)}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("settings.title")}
        onPress={() => router.push("/(app)/settings")}
        style={({ pressed }) => [
          styles.footer,
          compact && styles.footerRail,
          pressed && styles.footerHovered,
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        {compact ? null : (
          <>
            <View style={styles.footerCopy}>
              <Text numberOfLines={1} style={styles.footerName}>
                {name}
              </Text>
              <Text style={styles.footerMeta}>{t("webSidebar.meta")}</Text>
            </View>
            <Feather name="settings" size={17} color={WarshPalette.subtleBrown} />
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: WebLayout.sidebarWidth,
    minHeight: "100%",
    paddingHorizontal: 20,
    paddingVertical: 32,
    gap: 36,
    backgroundColor: WarshPalette.white,
    borderRightWidth: 1,
    borderRightColor: WarshPalette.cream,
  },
  rail: {
    width: WebLayout.railWidth,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
  },
  brandRail: {
    paddingHorizontal: 0,
  },
  navItemRail: {
    width: 48,
    paddingHorizontal: 0,
    justifyContent: "center",
  },
  footerRail: {
    padding: 6,
    justifyContent: "center",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
  },
  mark: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.navy,
  },
  markGlyph: {
    color: WarshPalette.gold,
    fontFamily: Fonts.arabic,
    fontSize: desktopFontSize(22, "display"),
  },
  wordmark: {
    color: WarshPalette.navy,
    fontFamily: Fonts.bold,
    fontSize: desktopFontSize(15),
    letterSpacing: 3,
  },
  nav: {
    flex: 1,
    gap: 6,
  },
  navItem: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radii.md,
  },
  navItemSelected: {
    backgroundColor: WarshPalette.navy,
  },
  navItemHovered: {
    backgroundColor: WarshPalette.parchmentSoft,
  },
  navLabel: {
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.semiBold,
    fontSize: desktopFontSize(14),
  },
  navLabelSelected: {
    color: WarshPalette.white,
  },
  footer: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: Spacing.md,
    borderRadius: Radii.md,
  },
  footerHovered: {
    backgroundColor: WarshPalette.parchmentSoft,
  },
  avatar: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: WarshPalette.parchmentDeep,
  },
  avatarText: {
    color: WarshPalette.navy,
    fontFamily: Fonts.semiBold,
    fontSize: desktopFontSize(14),
  },
  footerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  footerName: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: desktopFontSize(13),
  },
  footerMeta: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: desktopFontSize(12),
  },
});
