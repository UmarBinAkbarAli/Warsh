"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./dashboard.module.css";

// The real Warsh lesson screen, running inside a phone frame. warsh-app's
// /studio-preview page receives the lesson over postMessage, so edits show
// before they are saved. That page's origin allow-list and its frame-ancestors
// header must include this site.
const APP_URL = (process.env.NEXT_PUBLIC_WARSH_WEB_URL || "https://app.warsh.app").replace(/\/$/, "");
const APP_ORIGIN = new URL(APP_URL).origin;
const CONNECT_TIMEOUT_MS = 12_000;
const SEND_DELAY_MS = 150;

export type PreviewPosition = {
  beat: number;
  cardIndex: number;
  exerciseIndex: number;
  closeStep: number;
};

export type PreviewLesson = {
  id: string;
  title: string;
  titleAr?: string | null;
  xpReward: number;
  template: string;
  content: Record<string, unknown> | null;
};

type Screen = PreviewPosition & { label: string };

const screenAt = (label: string, beat: number, cardIndex = 0, exerciseIndex = 0, closeStep = 0): Screen => ({
  label,
  beat,
  cardIndex,
  exerciseIndex,
  closeStep,
});

/** Every screen a learner passes through, in order. */
function lessonScreens(lesson: PreviewLesson): Screen[] {
  const content = (lesson.content ?? {}) as {
    discover_cards?: unknown[];
    exercises?: unknown[];
    reveal?: { ayah?: { ar?: string } };
    spoken_phrases?: { lab?: unknown };
  };
  const cards = content.discover_cards ?? [];
  const exercises = content.exercises ?? [];
  const practice = exercises.map((_, i) => screenAt(`Practice ${i + 1}`, 3, 0, i));
  const goodbye = screenAt("Noor's goodbye", 5);

  if (lesson.template === "SPOKEN_PHRASES") {
    const lab = Boolean(content.spoken_phrases?.lab);
    return lab
      ? [screenAt("Scene", 1), screenAt("Phrases", 2), ...practice, screenAt("Speak", 4), goodbye]
      : [screenAt("Context", 1), screenAt("Phrases", 2), screenAt("Dialogue", 3), goodbye];
  }

  const learning = lesson.template === "VERB_PATTERN"
    ? [screenAt("Verb pattern", 2)]
    : cards.map((_, i) => screenAt(`Card ${i + 1}`, 2, i));
  return [
    screenAt("Opening ayah", 1),
    ...learning,
    ...practice,
    goodbye,
    ...(content.reveal?.ayah?.ar ? [screenAt("Closing ayah", 5, 0, 0, 1)] : []),
  ];
}

function screenIndex(screens: Screen[], at: PreviewPosition | null): number {
  if (!at) return 0;
  const exact = screens.findIndex((s) =>
    s.beat === at.beat
    && (s.beat !== 2 || s.cardIndex === at.cardIndex)
    && (s.beat !== 3 || s.exerciseIndex === at.exerciseIndex)
    && (s.beat !== 5 || s.closeStep === at.closeStep));
  if (exact >= 0) return exact;
  const sameBeat = screens.findIndex((s) => s.beat === at.beat);
  return sameBeat >= 0 ? sameBeat : 0;
}

export default function PhonePreview({
  lesson: lessonProp,
  target,
  dirty,
  onHide,
}: {
  lesson: PreviewLesson;
  /** The screen for what is selected in the editor. */
  target: PreviewPosition | null;
  dirty: boolean;
  onHide: () => void;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [connected, setConnected] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const [position, setPosition] = useState<PreviewPosition | null>(null);
  // The editor rebuilds these on every render; only a real change should reach the phone.
  const lessonJson = JSON.stringify(lessonProp);
  const lesson = useMemo(() => JSON.parse(lessonJson) as PreviewLesson, [lessonJson]);
  const targetJson = JSON.stringify(target);
  const screens = useMemo(() => lessonScreens(lesson), [lesson]);
  const current = screenIndex(screens, position);

  const send = useCallback((message: unknown) => {
    frameRef.current?.contentWindow?.postMessage(message, APP_ORIGIN);
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== APP_ORIGIN || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === "warsh-preview:ready") {
        setConnected(true);
        setTimedOut(false);
      } else if (event.data?.type === "warsh-preview:position") {
        setPosition(event.data.position as PreviewPosition);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (connected) return;
    const timer = window.setTimeout(() => setTimedOut(true), CONNECT_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [connected, frameKey]);

  // Typing changes the lesson on every keystroke; the phone needs only the latest.
  useEffect(() => {
    if (!connected) return;
    const timer = window.setTimeout(() => {
      send({ type: "warsh-preview:lesson", lesson, language });
    }, SEND_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [connected, language, lesson, send]);

  useEffect(() => {
    const position = JSON.parse(targetJson) as PreviewPosition | null;
    if (connected && position) send({ type: "warsh-preview:jump", position });
  }, [connected, send, targetJson]);

  function reconnect() {
    setConnected(false);
    setTimedOut(false);
    setFrameKey((key) => key + 1);
  }

  function goTo(index: number) {
    const screen = screens[index];
    if (!screen) return;
    send({
      type: "warsh-preview:jump",
      position: {
        beat: screen.beat,
        cardIndex: screen.cardIndex,
        exerciseIndex: screen.exerciseIndex,
        closeStep: screen.closeStep,
      },
    });
  }

  return (
    <div className={styles.studioPreview}>
      <div className={styles.phoneBar}>
        <div className={styles.phoneLanguages} role="group" aria-label="Preview language">
          {(["en", "ur"] as const).map((code) => (
            <button
              key={code}
              type="button"
              aria-pressed={language === code}
              className={language === code ? styles.phoneLanguageActive : ""}
              onClick={() => setLanguage(code)}
            >
              {code === "en" ? "English" : "Urdu"}
            </button>
          ))}
        </div>
        <span role="status" className={dirty ? styles.phoneChipDirty : styles.phoneChip}>
          {dirty ? "Showing unsaved edits" : "Same as saved lesson"}
        </span>
        <button className={styles.cancelBtn} onClick={onHide} type="button">Hide</button>
      </div>

      <div className={styles.phone}>
        <div className={styles.phoneScreen}>
          <div className={styles.phoneStatus} aria-hidden="true">
            <span>9:41</span>
            <span className={styles.phoneCamera} />
            <span>100%</span>
          </div>
          <iframe
            key={frameKey}
            ref={frameRef}
            className={styles.phoneFrame}
            src={`${APP_URL}/studio-preview`}
            title="Lesson on a phone"
            allow="autoplay"
          />
          {!connected && (
            <div className={styles.phoneOverlay}>
              {timedOut ? (
                <>
                  <strong>The preview didn&apos;t load</strong>
                  <span>Check your connection and try again.</span>
                  <button className={styles.cancelBtn} onClick={reconnect} type="button">Try again</button>
                </>
              ) : (
                <span>Loading the lesson…</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.phoneNav}>
        <button type="button" aria-label="Previous screen" disabled={current === 0} onClick={() => goTo(current - 1)}>
          ← Back
        </button>
        <span>
          <strong>{screens[current]?.label ?? ""}</strong>
          Screen {current + 1} of {screens.length}
        </span>
        <button
          type="button"
          aria-label="Next screen"
          disabled={current >= screens.length - 1}
          onClick={() => goTo(current + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
