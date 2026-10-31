"use client";

import { useMemo, useState } from "react";
import type { DashboardChapter, DashboardLesson, LessonReview, PromoCodeStat } from "./DashboardClient";

// The curriculum screen is the owner's review checklist: every lesson is
// Approved, Needs fixing (problems found by lib/lessonChecks.ts, or marked by
// the owner) or Not reviewed, with progress per chapter and across the course.

export type ReviewState = "approved" | "fix" | "todo";
type Filter = "all" | ReviewState;

export function reviewStateOf(review: LessonReview | undefined): ReviewState {
  if (!review) return "todo";
  if (review.reviewStatus === "APPROVED") return "approved";
  if (review.reviewStatus === "NEEDS_CORRECTION" || review.problemCount > 0) return "fix";
  return "todo";
}

export const REVIEW_TONE: Record<ReviewState, { label: string; bg: string; border: string; text: string; action: string }> = {
  approved: { label: "Approved", bg: "#edf1e4", border: "#a8bc8f", text: "#5a6953", action: "View" },
  fix: { label: "Needs fixing", bg: "#f7e9e0", border: "#d99a78", text: "#9c5432", action: "Fix" },
  todo: { label: "Not reviewed", bg: "#eae5da", border: "#cfc8b6", text: "#4a4a4a", action: "Review" },
};

export function ReviewChip({ state }: { state: ReviewState }) {
  const t = REVIEW_TONE[state];
  return (
    <span
      style={{
        minWidth: 104,
        textAlign: "center",
        padding: "3px 10px",
        borderRadius: 6,
        border: `1px solid ${t.border}`,
        background: t.bg,
        color: t.text,
        fontSize: 12.5,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {t.label}
    </span>
  );
}

function lessonNote(lesson: DashboardLesson, review: LessonReview | undefined, state: ReviewState): string {
  if (!review) return "Checking…";
  if (state === "approved") {
    return review.problemCount > 0
      ? `Approved · ${review.problemCount} new problem${review.problemCount === 1 ? "" : "s"} since`
      : "Approved";
  }
  if (review.problemCount > 0) {
    return `${review.problemCount} problem${review.problemCount === 1 ? "" : "s"} · ${review.summary}`;
  }
  if (review.reviewStatus === "NEEDS_CORRECTION") return "Marked as needs fixing";
  return lesson.status === "DRAFT" ? "No problems found · not live yet" : "No problems found";
}

export default function CurriculumOverview({
  chapters,
  reviews,
  promoCodes,
  adminToken,
  onAdminTokenChange,
  onOpenLesson,
  onAddLesson,
  onNewChapter,
  onOpenChapter,
}: {
  chapters: DashboardChapter[];
  reviews: Map<string, LessonReview> | null;
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
  const [showSettings, setShowSettings] = useState(false);

  const stateOf = (lesson: DashboardLesson) => reviewStateOf(reviews?.get(lesson.id));

  const totals = useMemo(() => {
    const t = { all: 0, approved: 0, fix: 0, todo: 0 };
    for (const c of chapters) {
      for (const l of c.lessons) {
        t.all += 1;
        t[reviewStateOf(reviews?.get(l.id))] += 1;
      }
    }
    return t;
  }, [chapters, reviews]);

  // The next lesson to review: the first one, in course order, not approved.
  const next = useMemo(() => {
    if (!reviews) return null;
    for (const chapter of chapters) {
      const lesson = chapter.lessons.find((l) => reviewStateOf(reviews.get(l.id)) !== "approved");
      if (lesson) return { chapter, lesson };
    }
    return null;
  }, [chapters, reviews]);

  const [collapsed, setCollapsed] = useState<Set<string> | null>(null);
  const isCollapsed = (id: string) =>
    collapsed ? collapsed.has(id) : id !== (next?.chapter.id ?? chapters[0]?.id);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0 || filter !== "all";

  const rows = useMemo(() => {
    return chapters
      .map((chapter) => {
        const chapterHit =
          q.length > 0 && (chapter.title.toLowerCase().includes(q) || chapter.titleAr.includes(query.trim()));
        const lessons = chapter.lessons.filter((l) => {
          if (filter !== "all" && reviewStateOf(reviews?.get(l.id)) !== filter) return false;
          if (!q) return true;
          return chapterHit || l.title.toLowerCase().includes(q) || l.titleAr.includes(query.trim());
        });
        return { chapter, lessons };
      })
      .filter((r) => (searching ? r.lessons.length > 0 : true));
  }, [chapters, reviews, q, query, filter, searching]);

  function toggle(id: string) {
    setCollapsed((prev) => {
      const base = prev ?? new Set(chapters.filter((c) => isCollapsed(c.id)).map((c) => c.id));
      const nextSet = new Set(base);
      if (nextSet.has(id)) nextSet.delete(id);
      else nextSet.add(id);
      return nextSet;
    });
  }

  const pct = (n: number) => (totals.all ? `${(n / totals.all) * 100}%` : "0%");

  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 1180, margin: "0 auto", width: "100%", color: "#1a1a1a" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 640 }}>
          <h1 style={{ margin: 0, fontSize: 30 }}>Lesson review</h1>
          <p style={{ margin: "6px 0 0", color: "#3d3d3d", fontSize: 15, lineHeight: "22px" }}>
            Open a lesson, fix what is flagged, then approve it. Problems are found for you; approving is your decision.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", position: "relative" }}>
          <button type="button" onClick={() => setShowSettings((v) => !v)} style={ghostBtn}>
            Settings
          </button>
          <button type="button" onClick={onNewChapter} style={ghostBtn}>
            + New chapter
          </button>
          <button type="button" onClick={() => onAddLesson()} style={ghostBtn}>
            + Lesson
          </button>
          {next && (
            <button
              type="button"
              onClick={() => onOpenLesson(next.chapter.id, next.lesson.id)}
              style={{
                display: "grid",
                gap: 2,
                textAlign: "left",
                padding: "10px 20px",
                minHeight: 52,
                borderRadius: 10,
                border: "none",
                background: "#071b44",
                color: "#d4b06a",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600 }}>Continue reviewing</span>
              <span style={{ fontSize: 12.5, color: "#f3ead6" }}>
                Chapter {next.chapter.order} · Lesson {next.lesson.order} — {next.lesson.title}
              </span>
            </button>
          )}
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
                {promoCodes.length === 0 && <span style={{ fontSize: 13, color: "#8a7f63" }}>No promo codes.</span>}
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
                <a href="/dashboard/promo" style={{ fontSize: 12.5, color: "#85672c", fontWeight: 600 }}>
                  Manage promo codes
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <section
        aria-label="Review progress"
        style={{ background: "#faf6e9", border, borderRadius: 14, padding: "18px 22px", display: "grid", gap: 14 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <strong style={{ fontSize: 16 }}>
            {totals.approved} of {totals.all} lessons approved
          </strong>
          <span style={{ color: "#5f5f5f", fontSize: 13 }}>
            {reviews ? `Chapters 1–${chapters.length}` : "Checking every lesson for problems…"}
          </span>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: "#e7e1d3", overflow: "hidden", display: "flex" }}>
          <div style={{ width: pct(totals.approved), background: "#5a6953" }} />
          <div style={{ width: pct(totals.fix), background: "#c8744a" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {(
            [
              ["approved", totals.approved, "Approved"],
              ["fix", totals.fix, "Need fixing (problems found)"],
              ["todo", totals.todo, "Not reviewed yet"],
            ] as const
          ).map(([key, n, label]) => (
            <div key={key} style={{ display: "grid", gap: 2, padding: "10px 14px", borderRadius: 10, background: REVIEW_TONE[key].bg }}>
              <span style={{ fontSize: 24, lineHeight: "30px", fontWeight: 700, color: REVIEW_TONE[key].text }}>
                {reviews ? n : "…"}
              </span>
              <span style={{ fontSize: 13, color: "#3d3d3d" }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div role="group" aria-label="Show" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(
            [
              ["all", "All"],
              ["fix", `Needs fixing · ${totals.fix}`],
              ["todo", `Not reviewed · ${totals.todo}`],
              ["approved", `Approved · ${totals.approved}`],
            ] as const
          ).map(([key, label]) => {
            const active = filter === key;
            const tone = key === "all" ? null : REVIEW_TONE[key];
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(key)}
                style={{
                  minHeight: 36,
                  padding: "0 14px",
                  borderRadius: 999,
                  border: active ? "2px solid #c49b4d" : `1px solid ${tone?.border ?? "#d8cfb8"}`,
                  background: active ? "#fbf3dc" : "#faf6e9",
                  color: active ? "#1a1a1a" : tone?.text ?? "#3d3d3d",
                  font: "inherit",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a lesson or Arabic word"
          aria-label="Search lessons"
          style={{ ...inputStyle, flex: "0 1 300px", minWidth: 0 }}
        />
      </div>

      {rows.length === 0 && <div style={{ padding: 24, color: "#5f5f5f", fontSize: 14 }}>No lessons match.</div>}

      {rows.map(({ chapter, lessons }) => {
        const open = searching || !isCollapsed(chapter.id);
        const count = { approved: 0, fix: 0, todo: 0 };
        for (const l of chapter.lessons) count[stateOf(l)] += 1;
        const n = chapter.lessons.length || 1;
        const allApproved = count.approved === chapter.lessons.length && chapter.lessons.length > 0;
        return (
          <section
            key={chapter.id}
            aria-label={`Chapter ${chapter.order}`}
            style={{
              background: "#faf6e9",
              border: open ? "2px solid #d4b06a" : border,
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => (searching ? undefined : toggle(chapter.id))}
                aria-expanded={open}
                style={{ ...plainBtn, display: "flex", alignItems: "center", gap: 12, flex: "1 1 300px", minWidth: 0, textAlign: "left" }}
              >
                <span aria-hidden style={{ color: "#6f7169", width: 12 }}>{open ? "▾" : "▸"}</span>
                <span style={{ display: "grid", minWidth: 0 }}>
                  <strong style={{ fontSize: 15.5 }}>
                    Chapter {chapter.order} · {chapter.title}
                  </strong>
                  <span dir="rtl" lang="ar" style={{ fontFamily: "'Scheherazade New', Amiri, serif", fontSize: 18, lineHeight: "28px", color: "#3d3d3d", textAlign: "left" }}>
                    {chapter.titleAr}
                  </span>
                </span>
              </button>
              <div style={{ width: 180, height: 8, borderRadius: 4, background: "#e7e1d3", overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${(count.approved / n) * 100}%`, background: "#5a6953" }} />
                <div style={{ width: `${(count.fix / n) * 100}%`, background: "#c8744a" }} />
              </div>
              <span style={{ fontSize: 13, color: "#3d3d3d", minWidth: 220 }}>
                {!reviews
                  ? `${chapter.lessons.length} lessons`
                  : allApproved
                    ? `All ${chapter.lessons.length} approved`
                    : `${count.approved} approved · ${count.fix} need fixing · ${count.todo} to review`}
              </span>
              <span style={{ display: "flex", gap: 10 }}>
                <button type="button" style={linkBtn} onClick={() => onAddLesson(chapter.id)} title="Add a lesson to this chapter">
                  + Lesson
                </button>
                <button type="button" style={linkBtn} onClick={() => onOpenChapter(chapter.id)} title="Edit chapter">
                  Edit
                </button>
              </span>
            </div>
            {open && (
              <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {lessons.map((lesson) => {
                  const review = reviews?.get(lesson.id);
                  const state = stateOf(lesson);
                  const isNext = next?.lesson.id === lesson.id;
                  return (
                    <li key={lesson.id} style={{ borderTop: border, background: isNext ? "#fbf3dc" : "transparent" }}>
                      <button
                        type="button"
                        onClick={() => onOpenLesson(chapter.id, lesson.id)}
                        style={{ ...plainBtn, width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "10px 20px", flexWrap: "wrap", textAlign: "left" }}
                      >
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            background: "#f4ebd0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: "#3d3d3d",
                            flex: "none",
                          }}
                        >
                          {lesson.order}
                        </span>
                        <span style={{ display: "grid", gap: 2, flex: "1 1 320px", minWidth: 0 }}>
                          <span style={{ fontSize: 14.5, fontWeight: 600 }}>
                            {lesson.title}
                            {lesson.status === "DRAFT" && (
                              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: "#85672c", background: "#f4ebd0", borderRadius: 4, padding: "1px 6px" }}>
                                Draft
                              </span>
                            )}
                          </span>
                          <span
                            style={{
                              fontSize: 13,
                              color: state === "fix" && (review?.problemCount ?? 0) > 0 ? "#9c5432" : "#5f5f5f",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {lessonNote(lesson, review, state)}
                          </span>
                        </span>
                        <ReviewChip state={state} />
                        <span
                          style={{
                            minHeight: 34,
                            minWidth: 72,
                            padding: "0 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #d4b06a",
                            borderRadius: 8,
                            background: "#fff",
                            color: "#85672c",
                            fontWeight: 600,
                            fontSize: 13.5,
                          }}
                        >
                          {REVIEW_TONE[state].action}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        );
      })}
    </div>
  );
}

const border = "1px solid #e8e3d9";

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #d8cfb8",
  background: "#fff",
  font: "inherit",
  fontSize: 14,
};

const ghostBtn: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #d8cfb8",
  background: "#fbf8f0",
  color: "#5f5844",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const plainBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  font: "inherit",
  color: "inherit",
  cursor: "pointer",
};

const linkBtn: React.CSSProperties = {
  whiteSpace: "nowrap",
  background: "none",
  border: "none",
  padding: 0,
  font: "inherit",
  fontSize: 13,
  fontWeight: 600,
  color: "#85672c",
  cursor: "pointer",
};
