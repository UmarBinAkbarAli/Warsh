import { Feather } from "@expo/vector-icons";
import { type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Fonts,
  FontSizes,
  Radii,
  Spacing,
  WarshAlpha,
  WarshPalette,
} from "../../constants/theme";
import { pageForAyah } from "../../services/quran/data";
import { useQuranStore } from "../../stores/quranStore";

const TAB_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  index: "book-open",
  vocabulary: "layers",
  quran: "book",
  chat: "message-circle",
  profile: "user",
};

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const desktopWeb = Platform.OS === "web" && width >= 960;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow",
      () => setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide",
      () => setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (desktopWeb || keyboardVisible) {
    return null;
  }

  return (
    <View
      style={[
        styles.dockContainer,
        {
          bottom: Math.max(insets.bottom + Spacing.xs, Spacing.md),
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.dockBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const rawLabel =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;
          const label = typeof rawLabel === "string" ? rawLabel : route.name;
          const iconName = TAB_ICONS[route.name] || "circle";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            // Quran tab: Option B (Resume Last Read)
            if (route.name === "quran") {
              const lastAyah = useQuranStore.getState().lastAyah;
              const layout = useQuranStore.getState().layout;
              const lastPage = lastAyah ? pageForAyah(layout, lastAyah) : null;
              if (lastPage) {
                router.push({
                  pathname: "/(app)/quran/[page]",
                  params: { page: String(lastPage) },
                });
                return;
              }
            }

            if (!isFocused && !event.defaultPrevented) {
              if (Platform.OS !== "web") {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
              }
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          if (isFocused) {
            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: true }}
                accessibilityLabel={label}
                testID={options.tabBarButtonTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.activePill}
              >
                <Feather
                  name={iconName}
                  size={18}
                  color={WarshPalette.navy}
                />
                <Text numberOfLines={1} style={styles.activeLabel}>
                  {label}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: false }}
              accessibilityLabel={label}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.inactiveTab}
              hitSlop={8}
            >
              <Feather
                name={iconName}
                size={20}
                color={WarshAlpha.onNavyMuted}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    position: "absolute",
    left: Spacing.gutter,
    right: Spacing.gutter,
    alignItems: "center",
    justifyContent: "center",
  },
  dockBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: WarshPalette.navy,
    borderRadius: Radii.xl,
    paddingHorizontal: Spacing.sm,
    height: 56,
    width: "100%",
    maxWidth: 420,
    // Spec-11 elevation
    shadowColor: WarshPalette.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarshPalette.creamBg,
    height: 40,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  activeLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    lineHeight: 14,
    color: WarshPalette.navy,
  },
  inactiveTab: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
});
