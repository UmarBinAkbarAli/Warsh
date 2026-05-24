import { useFonts } from "expo-font";
import { Component } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Sentry from "@sentry/react-native";
import { Colors } from "../constants/theme";
import { initSentry } from "@services/sentry";
import { initAnalytics } from "@services/analytics";

const sentryEnabled = initSentry();
void initAnalytics();

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: Colors.bg.primary, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: Colors.text.primary, fontSize: 18, fontWeight: "700", marginBottom: 8 }}>Something went wrong</Text>
          <Text style={{ color: Colors.text.secondary, textAlign: "center" }}>Please close and reopen the app.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function RootLayout() {
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
    <ErrorBoundary>
      <SafeAreaProvider>
        <>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default sentryEnabled ? Sentry.wrap(RootLayout) : RootLayout;
