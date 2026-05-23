"use client";

import { useMemo, useState } from "react";
import styles from "./dashboard.module.css";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type DashboardLesson = {
  id: string;
  order: number;
  title: string;
  titleAr: string;
  template: string;
  xpReward: number;
  content: JsonValue;
};

export type DashboardChapter = {
  id: string;
  order: number;
  title: string;
  titleAr: string;
  description: string;
  worldMapX: number;
  worldMapY: number;
  isLocked: boolean;
  lessons: DashboardLesson[];
};

type ChapterDraft = Pick<DashboardChapter, "title" | "titleAr" | "description" | "worldMapX" | "worldMapY" | "isLocked">;
type LessonDraft = {
  title: string;
  titleAr: string;
  template: string;
  xpReward: number;
  content: string;
};

const LESSON_TEMPLATES = ["STANDARD", "SPOKEN_PHRASES", "REVIEW", "VERB_PATTERN"];

function prettyJson(value: JsonValue | null) {
  return JSON.stringify(value ?? null, null, 2);
}

function parseJsonField(value: string, label: string) {
  try {
    return JSON.parse(value) as JsonValue;
  } catch {
    throw new Error(`${label} is not valid JSON.`);
  }
}

function toLessonDraft(lesson: DashboardLesson): LessonDraft {
  return {
    title: lesson.title,
    titleAr: lesson.titleAr,
    template: lesson.template,
    xpReward: lesson.xpReward,
    content: prettyJson(lesson.content),
  };
}

function toChapterDraft(chapter: DashboardChapter): ChapterDraft {
  return {
    title: chapter.title,
    titleAr: chapter.titleAr,
    description: chapter.description,
    worldMapX: chapter.worldMapX,
    worldMapY: chapter.worldMapY,
    isLocked: chapter.isLocked,
  };
}

export default function DashboardClient({ initialChapters }: { initialChapters: DashboardChapter[] }) {
  const [chapters, setChapters] = useState(initialChapters);
  const [query, setQuery] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapters[0]?.id ?? "");
  const [selectedLessonId, setSelectedLessonId] = useState(initialChapters[0]?.lessons[0]?.id ?? "");
  const [adminToken, setAdminToken] = useState("");
  const [status, setStatus] = useState("Ready");

  const selectedChapter = chapters.find((chapter) => chapter.id === selectedChapterId) ?? chapters[0];
  const selectedLesson =
    selectedChapter?.lessons.find((lesson) => lesson.id === selectedLessonId) ?? selectedChapter?.lessons[0];

  const [chapterDraft, setChapterDraft] = useState<ChapterDraft | null>(selectedChapter ? toChapterDraft(selectedChapter) : null);
  const [lessonDraft, setLessonDraft] = useState<LessonDraft | null>(selectedLesson ? toLessonDraft(selectedLesson) : null);

  const totals = useMemo(() => {
    const lessonCount = chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
    return { lessonCount };
  }, [chapters]);

  const filteredChapters = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return chapters;
    return chapters.filter((chapter) => {
      return (
        chapter.title.toLowerCase().includes(normalized) ||
        chapter.titleAr.includes(query.trim()) ||
        chapter.lessons.some((lesson) => lesson.title.toLowerCase().includes(normalized) || lesson.titleAr.includes(query.trim()))
      );
    });
  }, [chapters, query]);

  function selectChapter(chapter: DashboardChapter) {
    setSelectedChapterId(chapter.id);
    setSelectedLessonId(chapter.lessons[0]?.id ?? "");
    setChapterDraft(toChapterDraft(chapter));
    setLessonDraft(chapter.lessons[0] ? toLessonDraft(chapter.lessons[0]) : null);
    setStatus("Ready");
  }

  function selectLesson(lesson: DashboardLesson) {
    setSelectedLessonId(lesson.id);
    setLessonDraft(toLessonDraft(lesson));
    setStatus("Ready");
  }

  async function saveChapter() {
    if (!selectedChapter || !chapterDraft) return;
    setStatus("Saving chapter...");
    const response = await fetch(`/api/admin/chapters/${selectedChapter.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(adminToken ? { "x-admin-token": adminToken } : {}) },
      body: JSON.stringify(chapterDraft),
    });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error ?? "Chapter save failed.");
      return;
    }
    setChapters((current) =>
      current.map((chapter) => (chapter.id === selectedChapter.id ? { ...chapter, ...payload.data.chapter } : chapter)),
    );
    setStatus("Chapter saved.");
  }

  async function saveLesson() {
    if (!selectedLesson || !lessonDraft) return;

    let body: { title: string; titleAr: string; template: string; xpReward: number; content: JsonValue };
    try {
      body = {
        title: lessonDraft.title,
        titleAr: lessonDraft.titleAr,
        template: lessonDraft.template,
        xpReward: Number(lessonDraft.xpReward),
        content: parseJsonField(lessonDraft.content, "Content"),
      };
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid JSON.");
      return;
    }

    setStatus("Saving lesson...");
    const response = await fetch(`/api/admin/lessons/${selectedLesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(adminToken ? { "x-admin-token": adminToken } : {}) },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error ?? "Lesson save failed.");
      return;
    }

    setChapters((current) =>
      current.map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.map((lesson) =>
          lesson.id === selectedLesson.id ? { ...lesson, ...payload.data.lesson } : lesson,
        ),
      })),
    );
    setStatus("Lesson saved.");
  }

  if (!selectedChapter || !chapterDraft) {
    return <main className={styles.empty}>No curriculum content found. Run the seed before using the dashboard.</main>;
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>Warsh</span>
          <span className={styles.brandArabic}>وَرْش</span>
        </div>
        <input
          className={styles.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search content"
        />
        <div className={styles.rail}>
          {filteredChapters.map((chapter) => (
            <button
              className={`${styles.chapterButton} ${chapter.id === selectedChapter.id ? styles.active : ""}`}
              key={chapter.id}
              onClick={() => selectChapter(chapter)}
              type="button"
            >
              <span>Ch {chapter.order}</span>
              <strong>{chapter.title}</strong>
              <small>{chapter.lessons.length} lessons</small>
            </button>
          ))}
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Content Dashboard</p>
            <h1>Manage Warsh curriculum</h1>
          </div>
          <div className={styles.statusGroup}>
            <span>{chapters.length} chapters</span>
            <span>{totals.lessonCount} lessons</span>
          </div>
        </header>

        <div className={styles.topbar}>
          <label>
            Admin token
            <input
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="Required only if configured"
              type="password"
            />
          </label>
          <span className={styles.saveStatus}>{status}</span>
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.kicker}>Chapter {selectedChapter.order}</p>
              <h2>Chapter metadata</h2>
            </div>
            <button className={styles.primaryButton} onClick={saveChapter} type="button">
              Save chapter
            </button>
          </div>
          <div className={styles.grid}>
            <label>
              English title
              <input value={chapterDraft.title} onChange={(event) => setChapterDraft({ ...chapterDraft, title: event.target.value })} />
            </label>
            <label>
              Arabic title
              <input
                dir="rtl"
                value={chapterDraft.titleAr}
                onChange={(event) => setChapterDraft({ ...chapterDraft, titleAr: event.target.value })}
              />
            </label>
            <label className={styles.wide}>
              Description
              <textarea
                value={chapterDraft.description}
                onChange={(event) => setChapterDraft({ ...chapterDraft, description: event.target.value })}
                rows={3}
              />
            </label>
            <label>
              Map X
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={chapterDraft.worldMapX}
                onChange={(event) => setChapterDraft({ ...chapterDraft, worldMapX: Number(event.target.value) })}
              />
            </label>
            <label>
              Map Y
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={chapterDraft.worldMapY}
                onChange={(event) => setChapterDraft({ ...chapterDraft, worldMapY: Number(event.target.value) })}
              />
            </label>
            <label className={styles.checkbox}>
              <input
                checked={chapterDraft.isLocked}
                onChange={(event) => setChapterDraft({ ...chapterDraft, isLocked: event.target.checked })}
                type="checkbox"
              />
              Locked by default
            </label>
          </div>
        </section>

        <section className={styles.lessonLayout}>
          <div className={styles.lessonList}>
            {selectedChapter.lessons.map((lesson) => (
              <button
                className={`${styles.lessonButton} ${lesson.id === selectedLesson?.id ? styles.activeLesson : ""}`}
                key={lesson.id}
                onClick={() => selectLesson(lesson)}
                type="button"
              >
                <span>Lesson {lesson.order}</span>
                <strong>{lesson.title}</strong>
                <small>{lesson.template}</small>
              </button>
            ))}
            {selectedChapter.lessons.length === 0 && (
              <p style={{ padding: "16px", color: "#9A8F6A", fontSize: "12px" }}>
                No lessons yet. Author content using warsh-content-schema.ts and add via seed.
              </p>
            )}
          </div>

          {selectedLesson && lessonDraft ? (
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Lesson {selectedLesson.order}</p>
                  <h2>Lesson content</h2>
                </div>
                <button className={styles.primaryButton} onClick={saveLesson} type="button">
                  Save lesson
                </button>
              </div>

              <div className={styles.grid}>
                <label>
                  English title
                  <input value={lessonDraft.title} onChange={(event) => setLessonDraft({ ...lessonDraft, title: event.target.value })} />
                </label>
                <label>
                  Arabic title
                  <input
                    dir="rtl"
                    value={lessonDraft.titleAr}
                    onChange={(event) => setLessonDraft({ ...lessonDraft, titleAr: event.target.value })}
                  />
                </label>
                <label>
                  Template
                  <select value={lessonDraft.template} onChange={(event) => setLessonDraft({ ...lessonDraft, template: event.target.value })}>
                    {LESSON_TEMPLATES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  XP reward
                  <input
                    type="number"
                    min="0"
                    value={lessonDraft.xpReward}
                    onChange={(event) => setLessonDraft({ ...lessonDraft, xpReward: Number(event.target.value) })}
                  />
                </label>
              </div>

              <div className={styles.jsonGrid}>
                <label className={styles.jsonField}>
                  Content JSON (warsh-content-schema v1.0)
                  <textarea
                    spellCheck={false}
                    value={lessonDraft.content}
                    onChange={(event) => setLessonDraft({ ...lessonDraft, content: event.target.value })}
                    rows={30}
                  />
                </label>
              </div>
            </section>
          ) : null}
        </section>
      </section>
    </main>
  );
}
