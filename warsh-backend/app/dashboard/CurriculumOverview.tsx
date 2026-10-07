"use client";

import { useMemo, useState } from "react";
import type { DashboardChapter, DashboardLesson, PromoCodeStat } from "./DashboardClient";

type Filter = "all" | "live" | "draft" | "review";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "draft", label: "Draft" },
  { key: "review", label: "Needs review" },
];

function matchesFilter(lesson: DashboardLesson, filter: Filter): boolean {
  if (filter === "live") return lesson.status === "PUBLISHED";
  if (filter === "draft") return lesson.status === "DRAFT";
  if (filter === "review") return (lesson.openIssues ?? 0) > 0;
  return true;
}

function formatUpdated(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
}

function LessonStatus({ lesson }: { lesson: DashboardLesson }) {
  const issues = lesson.openIssues ?? 0;
  const live = lesson.status === "PUBLISHED";
  const label = issues > 0 ? "Review issue" : live ? "Live" : "Draft";
  const tone = issues > 0
    ? { color: "#9a4040", background: "#f6e6e6" }
    : live
      ? { color: "#2f6f4f", background: "#e6f2ea" }
      : { color: "#8a6a1c", background: "#f6edd2" };
  return (
    <span style={{ ...tone, fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 999 }}>
      {label}
    </span>
  );
}

const COLS = "minmax(0, 1fr) 120px 70px 90px 80px";

export default function CurriculumOverview({
  chapters,
  promoCodes,
  adminToken,
  onAdminTokenChange,
  onOpenLesson,
  onAddLesson,
  onNewChapter,
  onOpenChapter,
}: {
  chapters: DashboardChapter[];
  promoCodes: PromoCodeStat[];
  adminToken: string;
  onAdminTokenChange: (token: string) => void;
  onOpenLesson: (chapterId: string, lessonId: string) => void;
  onAddLesson: (chapterId?: string) => void;
  onNewChapter: () => void;
  onOpenChapter: (chapterId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(chapters.slice(1).map((c) => c.id)),
  );
  const [showSettings, setShowSettings] = useState(false);

  const totalLessons = chapters.reduce((s, c) => s + c.lessons.length, 0);
  const totalDrafts = chapters.reduce(
    (s, c) => s + c.lessons.filter((l) => l.status === "DRAFT").length,
    0,
  );
  const chaptersWithIssues = chapters.filter((c) =>
    c.lessons.some((l) => (l.openIssues ?? 0) > 0),
  ).length;

  const q = query.trim().toLowerCase();
  const searching = q.length > 0 || filter !== "all";

  const rows = useMemo(() => {
    return chapters
      .map((chapter) => {
        const chapterHit =
          q.length > 0 &&
          (chapter.title.toLowerCase().includes(q) || chapter.titleAr.includes(query.trim()));
        const lessons = chapter.lessons.filter((l) => {
          if (!matchesFilter(l, filter)) return false;
          if (!q) return true;
          return (
            chapterHit ||
            l.title.toLowerCase().includes(q) ||
            l.titleAr.includes(query.trim())
          );
        });
        return { chapter, lessons };
      })
      .filter((r) => (searching ? r.lessons.length > 0 : true));
  }, [chapters, q, query, filter, searching]);

  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const border = "1px solid #e2d9c4";

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 1180, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Curriculum</h1>
          <p style={{ margin: "4px 0 0", color: "#6a6b5b", fontSize: 14 }}>
            {chapters.length} chapters · {totalLessons} lessons · {totalDrafts} drafts ·{" "}
            {chaptersWithIssues} with open review issues
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, position: "relative" }}>
          <button type="button" onClick={() => setShowSettings((v) => !v)} style={ghostBtn}>
            Settings
          </button>
          <button type="button" onClick={onNewChapter} style={ghostBtn}>
            + New chapter
          </button>
          <button type="button" onClick={() => onAddLesson()} style={primaryBtn}>
            Add lesson
          </button>
          {showSettings && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                zIndex: 5,
                width: 340,
                padding: 14,
                border,
                borderRadius: 10,
                background: "#fffaf0",
                boxShadow: "0 8px 24px rgba(60,45,10,0.14)",
                display: "grid",
                gap: 12,
              }}
            >
              <label style={{ display: "grid", gap: 4, fontSize: 13, color: "#5f5844" }}>
                Admin token
                <input
                  type="password"
                  value={adminToken}
                  onChange={(e) => onAdminTokenChange(e.target.value)}
                  placeholder="Required only if configured"
                  style={inputStyle}
                />
              </label>
              <div style={{ display: "grid", gap: 6 }}>
                <strong style={{ fontSize: 13, color: "#5f5844" }}>Promo codes</strong>
                {promoCodes.length === 0 && (
                  <span style={{ fontSize: 13, color: "#8a7f63" }}>No promo codes.</span>
                )}
                {promoCodes.map((p) => (
                  <div key={p.code} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <code style={{ fontWeight: 700 }}>{p.code}</code>
                    <span style={{ color: p.active ? "#2f6f4f" : "#9a4040" }}>
                      {p.redemptionCount}
                      {p.maxRedemptions != null ? ` / ${p.maxRedemptions}` : ""} redeemed
                      {p.active ? "" : " · off"}
                    </span>
                  </div>
                ))}
                <a href="/dashboard/promo" style={{ fontSize: 12.5, color: "#0f766e", fontWeight: 600 }}>
                  Manage promo codes
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search lessons, chapters or Arabic words"
          style={{ ...inputStyle, flex: "1 1 280px", minWidth: 0 }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              style={{
                ...ghostBtn,
                ...(filter === f.key
                  ? { background: "#1f2f4a", color: "#fff", borderColor: "#1f2f4a" }
                  : {}),
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        {!searching && (
          <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
            <button type="button" style={linkBtn} onClick={() => setCollapsed(new Set())}>
              Expand all
            </button>
            <button type="button" style={linkBtn} onClick={() => setCollapsed(new Set(chapters.map((c) => c.id)))}>
              Collapse all
            </button>
          </div>
        )}
      </div>

      <div style={{ border, borderRadius: 12, background: "#fffdf7", overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: COLS,
            gap: 12,
            padding: "10px 16px",
            background: "#f3ecda",
            fontSize: 12,
            fontWeight: 700,
            color: "#6a6b5b",
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          <span>Name</span>
          <span>Status</span>
          <span>Cards</span>
          <span>Exercises</span>
          <span>Updated</span>
        </div>
        {rows.length === 0 && (
          <div style={{ padding: 24, color: "#8a7f63", fontSize: 14 }}>
            No lessons match this search.
          </div>
        )}
        {rows.map(({ chapter, lessons }) => {
          const open = searching || !collapsed.has(chapter.id);
          const live = chapter.lessons.filter((l) => l.status === "PUBLISHED").length;
          const draft = chapter.lessons.length - live;
          return (
            <div key={chapter.id} style={{ borderTop: border }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: COLS,
                  gap: 12,
                  alignItems: "center",
                  padding: "10px 16px",
                  background: "#faf5e8",
                }}
              >
                <button
                  type="button"
                  onClick={() => (searching ? undefined : toggle(chapter.id))}
                  aria-expanded={open}
                  style={{ ...linkBtn, color: "#1d221b", textAlign: "left", display: "flex", gap: 8, alignItems: "baseline", minWidth: 0 }}
                >
                  <span aria-hidden>{open ? "▾" : "▸"}</span>
                  <strong style={{ fontSize: 15 }}>
                    {chapter.order} · {chapter.title}
                  </strong>
                  <span style={{ fontSize: 12.5, color: "#8a7f63", fontWeight: 400 }}>
                    {chapter.lessons.length} lessons
                  </span>
                </button>
                <span style={{ fontSize: 12.5, color: "#6a6b5b", gridColumn: "2 / span 3" }}>
                  {live} Live · {draft} Draft
                </span>
                <span style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button type="button" style={linkBtn} onClick={() => onAddLesson(chapter.id)} title="Add a lesson to this chapter">
                    + Lesson
                  </button>
                  <button type="button" style={linkBtn} onClick={() => onOpenChapter(chapter.id)} title="Edit chapter">
                    Edit
                  </button>
                </span>
              </div>
              {open &&
                lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => onOpenLesson(chapter.id, lesson.id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: COLS,
                      gap: 12,
                      alignItems: "center",
                      width: "100%",
                      padding: "10px 16px 10px 40px",
                      border: "none",
                      borderTop: border,
                      background: "transparent",
                      textAlign: "left",
                      font: "inherit",
                      fontSize: 14,
                      cursor: "pointer",
                      color: "#1d221b",
                    }}
                  >
                    <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Lesson {lesson.order} · {lesson.title}
                    </span>
                    <span><LessonStatus lesson={lesson} /></span>
                    <span>{lesson.cardCount ?? "—"}</span>
                    <span>{lesson.exerciseCount ?? "—"}</span>
                    <span style={{ color: "#6a6b5b" }}>{formatUpdated(lesson.updatedAt)}</span>
                  </button>
                ))}
            </div>
          );
        })}
      </div>
      <p style={{ margin: 0, fontSize: 12.5, color: "#8a7f63" }}>
        Lessons stay in pedagogical order. Click a lesson to open the focused editor.
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #d8cfb8",
  background: "#fff",
  font: "inherit",
  fontSize: 14,
};

const ghostBtn: React.CSSProperties = {
  padding: "7px 12px",
  borderRadius: 8,
  border: "1px solid #d8cfb8",
  background: "#fbf8f0",
  color: "#5f5844",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const primaryBtn: React.CSSProperties = {
  ...ghostBtn,
  background: "#1f2f4a",
  borderColor: "#1f2f4a",
  color: "#fff",
};

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  font: "inherit",
  fontSize: 13,
  fontWeight: 600,
  color: "#0f766e",
  cursor: "pointer",
};
