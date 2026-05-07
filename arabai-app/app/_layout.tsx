import { useFonts } from "expo-font";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../constants/theme";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Amiri-Regular": require("../assets/fonts/Amiri-Regular.ttf"),
    "Amiri-Bold": require("../assets/fonts/Amiri-Bold.ttf"),
    "Scheherazade New": require("../assets/fonts/ScheherazadeNew-Regular.ttf"),
    "Scheherazade New Bold": require("../assets/fonts/ScheherazadeNew-Bold.ttf"),
    "Scheherazade New SemiBold": require("../assets/fonts/ScheherazadeNew-SemiBold.ttf"),
    "Scheherazade New Medium": require("../assets/fonts/ScheherazadeNew-Medium.ttf"),
  });

  if (fontError) {
    console.error("Failed to load custom fonts:", fontError);
  }

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg.primary, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={Colors.accent.gold} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
