import { Feather } from "@expo/vector-icons";
import { useT } from "@i18n/index";
import { Tabs } from "expo-router";
import { View } from "react-native";

import { Colors, Fonts, WarshPalette } from "../../../constants/theme";

// Spec-11 §5.5: active tab has a small gold dot indicator ABOVE the icon
function TabIcon({
  name,
  color,
  size,
  focused,
}: {
  name: keyof typeof Feather.glyphMap;
  color: string;
  size: number;
  focused: boolean;
}) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          marginBottom: 4,
          width: 4,
          height: 4,
          borderRadius: 999,
          backgroundColor: focused ? Colors.accent.gold : "transparent",
        }}
      />
      <Feather name={name} color={color} size={size} />
    </View>
  );
}

export default function TabsLayout() {
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: Colors.bg.primary,
        },
        // Spec-11 §5.5: parchment bar, 1pt sage-soft top border
        tabBarStyle: {
          backgroundColor: Colors.bg.primary,
          borderTopWidth: 1,
          borderTopColor: WarshPalette.sageSoft,
          height: 64,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: Colors.accent.gold,
        tabBarInactiveTintColor: WarshPalette.sage,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: Fonts.regular,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.learn"),
          tabBarIcon: (p) => <TabIcon name="book-open" {...p} />,
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: t("tabs.vocabulary"),
          tabBarIcon: (p) => <TabIcon name="layers" {...p} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t("tabs.noor"),
          tabBarIcon: (p) => <TabIcon name="message-circle" {...p} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: (p) => <TabIcon name="user" {...p} />,
        }}
      />
    </Tabs>
  );
}
