import { Feather } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuthStore } from "../stores/authStore";
import { Fonts, Radii, Spacing, WarshPalette } from "../constants/theme";

type NavItem = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  href: string;
  active: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Learn",
    icon: "book-open",
    href: "/(app)/(tabs)",
    active: (path) =>
      path === "/" ||
      path.includes("/chapters") ||
      path.includes("/lessons") ||
      path.includes("/tadabbur"),
  },
  {
    label: "Vocabulary",
    icon: "layers",
    href: "/(app)/(tabs)/vocabulary",
    active: (path) => path.includes("/vocabulary"),
  },
  {
    label: "Noor",
    icon: "message-circle",
    href: "/(app)/(tabs)/chat",
    active: (path) => path.includes("/chat"),
  },
  {
    label: "You",
    icon: "user",
    href: "/(app)/(tabs)/profile",
    active: (path) =>
      path.includes("/profile") ||
      path.includes("/settings") ||
      path.includes("/change-password") ||
      path.includes("/manage-subscription"),
  },
];

export function WebAppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const name = user?.name?.trim() || "Learner";
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <View style={styles.mark}>
          <Text style={styles.markGlyph}>و</Text>
        </View>
        <Text style={styles.wordmark}>WARSH</Text>
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const selected = item.active(pathname);
          return (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => router.replace(item.href as never)}
              style={({ pressed }) => [
                styles.navItem,
                selected && styles.navItemSelected,
                !selected && pressed && styles.navItemHovered,
              ]}
            >
              <Feather
                name={item.icon}
                size={19}
                color={selected ? WarshPalette.white : WarshPalette.subtleBrown}
              />
              <Text style={[styles.navLabel, selected && styles.navLabelSelected]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/(app)/settings")}
        style={({ pressed }) => [
          styles.footer,
          pressed && styles.footerHovered,
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.footerCopy}>
          <Text numberOfLines={1} style={styles.footerName}>
            {name}
          </Text>
          <Text style={styles.footerMeta}>Warsh learner</Text>
        </View>
        <Feather name="settings" size={17} color={WarshPalette.subtleBrown} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    minHeight: "100%",
    paddingHorizontal: 20,
    paddingVertical: 32,
    gap: 36,
    backgroundColor: WarshPalette.white,
    borderRightWidth: 1,
    borderRightColor: "#E8DFC8",
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
    borderRadius: 11,
    backgroundColor: WarshPalette.navy,
  },
  markGlyph: {
    color: WarshPalette.gold,
    fontFamily: Fonts.arabic,
    fontSize: 22,
  },
  wordmark: {
    color: WarshPalette.navy,
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "700",
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
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "600",
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
    fontSize: 14,
  },
  footerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  footerName: {
    color: WarshPalette.ink,
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "600",
  },
  footerMeta: {
    color: WarshPalette.subtleBrown,
    fontFamily: "Inter",
    fontSize: 11,
  },
});
