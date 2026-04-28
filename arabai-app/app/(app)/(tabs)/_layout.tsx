import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { Colors } from "../../../constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      sceneContainerStyle={{
        backgroundColor: Colors.bg.primary,
      }}
      screenOptions={{
        headerShown: false,
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
          title: "Learn",
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
        name="chat"
        options={{
          title: "Noor",
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
          title: "You",
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
