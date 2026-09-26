import { useT } from "@i18n/index";
import { Tabs } from "expo-router";

import { FloatingTabBar } from "../../../components/navigation/FloatingTabBar";
import { Colors } from "../../../constants/theme";

export default function TabsLayout() {
  const t = useT();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: Colors.bg.primary,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.learn"),
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: t("tabs.vocabulary"),
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: t("tabs.quran"),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t("tabs.noor"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
        }}
      />
    </Tabs>
  );
}
