import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="lessons/[chapterId]" />
      <Stack.Screen name="lessons/[lessonId]/play" />
    </Stack>
  );
}
