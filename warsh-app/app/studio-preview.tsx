import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { Colors, Spacing } from "../constants/theme";
import { enableDirectCatalogAudio } from "../services/audioCache";
import { usePreviewLanguage } from "../services/language";
import { LessonPlayer, type LessonPreview, type LessonPreviewPosition } from "./(app)/lessons/[lessonId]/play";

// Warsh Studio shows this page inside its phone frame. It runs the real lesson
// player on the lesson Studio is editing, saved or not. It needs no sign-in,
// shows only what Studio sends it, and records nothing.
const STUDIO_ORIGINS = __DEV__ ? ["http://localhost:3000", "http://127.0.0.1:3000"] : ["https://api.warsh.app"];

type IncomingMessage =
  | { type: "warsh-preview:lesson"; lesson: LessonPreview["lesson"]; language: "en" | "ur" }
  | { type: "warsh-preview:jump"; position: LessonPreviewPosition };

class ScreenErrorBoundary extends Component<{ children: ReactNode; revision: number }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  // The next edit may well fix what broke this screen, so try again on each one.
  componentDidUpdate(previous: { revision: number }) {
    if (this.state.failed && previous.revision !== this.props.revision) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={styles.message}>
        <Text style={styles.messageTitle}>This screen can&apos;t be shown yet</Text>
        <Text style={styles.messageBody}>Something it needs is missing. Keep editing and it will come back.</Text>
      </View>
    );
  }
}

export default function StudioPreviewScreen() {
  const [lesson, setLesson] = useState<LessonPreview["lesson"] | null>(null);
  const [jump, setJump] = useState<LessonPreviewPosition | null>(null);
  const [revision, setRevision] = useState(0);
  const [studioOrigin, setStudioOrigin] = useState<string | null>(null);
  const lessonIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || window.parent === window) return;

    enableDirectCatalogAudio();

    function onMessage(event: MessageEvent<IncomingMessage>) {
      if (event.source !== window.parent || !STUDIO_ORIGINS.includes(event.origin)) return;
      const message = event.data;
      if (message?.type === "warsh-preview:lesson") {
        setStudioOrigin(event.origin);
        if (lessonIdRef.current && lessonIdRef.current !== message.lesson.id) setJump(null);
        lessonIdRef.current = message.lesson.id;
        usePreviewLanguage.setState({ language: message.language === "ur" ? "ur" : "en" });
        setLesson(message.lesson);
        setRevision((value) => value + 1);
      } else if (message?.type === "warsh-preview:jump") {
        setJump({ ...message.position });
      }
    }

    window.addEventListener("message", onMessage);
    for (const origin of STUDIO_ORIGINS) {
      window.parent.postMessage({ type: "warsh-preview:ready" }, origin);
    }
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const onPosition = useCallback(
    (position: LessonPreviewPosition) => {
      if (studioOrigin) window.parent.postMessage({ type: "warsh-preview:position", position }, studioOrigin);
    },
    [studioOrigin],
  );

  const preview = useMemo(() => (lesson ? { lesson, jump, onPosition } : null), [lesson, jump, onPosition]);

  if (!preview) return <View style={styles.page} />;
  return (
    <ScreenErrorBoundary revision={revision}>
      <LessonPlayer key={preview.lesson.id} preview={preview} />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bg.primary },
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.bg.primary,
  },
  messageTitle: { color: Colors.text.primary, fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  messageBody: { color: Colors.text.secondary, fontSize: 14, textAlign: "center" },
});
