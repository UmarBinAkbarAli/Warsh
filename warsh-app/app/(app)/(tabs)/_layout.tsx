import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useT } from "@i18n/index";
import { Colors } from "../../../constants/theme";

export default function TabsLayout() {
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: Colors.bg.primary,
        },
        tabBarStyle: {
          backgroundColor: Colors.bg.secondary,
          borderTopColor: Colors.border.subtle,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.accent.gold,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.learn"),
          tabBarIcon: ({ color, focused, size }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Feather name="book-open" color={color} size={size} />
              <View
                style={{
                  marginTop: 4,
                  width: 4,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: focused ? Colors.accent.gold : "transparent",
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: t("tabs.vocabulary"),
          tabBarIcon: ({ color, focused, size }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Feather name="layers" color={color} size={size} />
              <View
                style={{
                  marginTop: 4,
                  width: 4,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: focused ? Colors.accent.gold : "transparent",
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t("tabs.noor"),
          tabBarIcon: ({ color, focused, size }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Feather name="message-circle" color={color} size={size} />
              <View
                style={{
                  marginTop: 4,
                  width: 4,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: focused ? Colors.accent.gold : "transparent",
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, focused, size }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Feather name="user" color={color} size={size} />
              <View
                style={{
                  marginTop: 4,
                  width: 4,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: focused ? Colors.accent.gold : "transparent",
                }}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
