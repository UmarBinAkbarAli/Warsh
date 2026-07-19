"use client";

import { useEffect, useState } from "react";
import DashboardNav from "./DashboardNav";

type Analytics = {
  generatedAt: string;
  users: {
    total: number;
    newLast7: number;
    newLast30: number;
    newLast90: number;
    activeSubs: number;
    subscriptionBreakdown: { status: string; count: number }[];
  };
  signupsPerDay: { date: string; count: number }[];
  engagement: {
    activeLearners7: number;
    usersWithStreak: number;
    avgCurrentStreak: number;
    longestStreak: number;
    totalXp: number;
    avgXp: number;
  };
  learning: {
    completedLessons: number;
    inProgressLessons: number;
    dropoff: {
      lessonId: string;
      title: string;
      chapterOrder: number;
      chapterTitle: string;
      lessonOrder: number;
      started: number;
      completed: number;
      dropped: number;
      dropRate: number;
    }[];
  };
  content: { chapters: number; lessons: number; vocabulary: number; tadabburSurahs: number; achievements: number };
  noor: { totalMessages: number; messagesLast7: number; usersEngaged: number };
};

const STATUS_COLORS: Record<string, string> = {
  active: "#2f6f4f",
  grace: "#a5761f",
  trial: "#4a5478",
  expired: "#9a4040",
  cancelled: "#8a7f63",
};

export default function OverviewClient() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.status === 401 || res.status === 403) {
          window.location.href = "/dashboard/login";
          return;
        }
        const payload = await res.json();
        if (!res.ok) {
          setError(payload.error ?? "Failed to load analytics.");
          return;
        }
        setData(payload.data);
      } catch {
        setError("Network error — is the backend running?");
      }
    })();
  }, []);

  const maxSignup = data ? Math.max(1, ...data.signupsPerDay.map((d) => d.count)) : 1;
  const totalSubs = data ? data.users.subscriptionBreakdown.reduce((s, x) => s + x.count, 0) : 0;

  return (
    <div style={s.root}>
      <DashboardNav active="/dashboard" />
      <main style={s.page}>
        <header style={s.head}>
          <div>
            <p style={s.kicker}>Analytics</p>
            <h1 style={s.h1}>Overview</h1>
          </div>
          {data && (
            <span style={s.stamp}>Updated {new Date(data.generatedAt).toLocaleString()}</span>
          )}
        </header>

        {error && <div style={s.error}>{error}</div>}
        {!data && !error && <div style={s.loading}>Loading analytics…</div>}

        {data && (
          <>
            {/* KPI row */}
            <section style={s.kpiRow}>
              <Kpi label="Total users" value={data.users.total} accent="#0f766e" big />
              <Kpi label="New · 7 days" value={data.users.newLast7} />
              <Kpi label="New · 30 days" value={data.users.newLast30} />
              <Kpi label="New · 90 days" value={data.users.newLast90} />
              <Kpi label="Active subs" value={data.users.activeSubs} accent="#8a6d1f" />
            </section>

            <div style={s.grid2}>
              {/* Signups chart */}
              <Card title="Signups · last 30 days">
                <div style={s.chart}>
                  {data.signupsPerDay.map((d) => (
                    <div key={d.date} style={s.barWrap} title={`${d.date}: ${d.count}`}>
                      <div style={{ ...s.bar, height: `${(d.count / maxSignup) * 100}%` }} />
                    </div>
                  ))}
                </div>
                <div style={s.chartAxis}>
                  <span>{data.signupsPerDay[0]?.date.slice(5)}</span>
                  <span>{data.signupsPerDay[data.signupsPerDay.length - 1]?.date.slice(5)}</span>
                </div>
              </Card>

              {/* Subscription breakdown */}
              <Card title="Subscription status">
                <div style={{ display: "grid", gap: 10, marginTop: 4 }}>
                  {data.users.subscriptionBreakdown.map((x) => {
                    const pct = totalSubs > 0 ? Math.round((x.count / totalSubs) * 100) : 0;
                    const color = STATUS_COLORS[x.status] ?? "#8a7f63";
                    return (
                      <div key={x.status}>
                        <div style={s.subRow}>
                          <span style={{ fontWeight: 600, color }}>{x.status}</span>
                          <span style={{ color: "#6b6252" }}>{x.count} · {pct}%</span>
                        </div>
                        <div style={s.track}><div style={{ ...s.trackFill, width: `${pct}%`, background: color }} /></div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Engagement */}
            <section style={s.kpiRow}>
              <Kpi label="Active learners · 7d" value={data.engagement.activeLearners7} />
              <Kpi label="Users on a streak" value={data.engagement.usersWithStreak} />
              <Kpi label="Avg current streak" value={data.engagement.avgCurrentStreak} />
              <Kpi label="Longest streak" value={data.engagement.longestStreak} />
              <Kpi label="Total XP earned" value={data.engagement.totalXp} />
            </section>

            {/* Lesson drop-off */}
            <Card title="Lesson drop-off — where learners start but don't finish">
              <p style={s.hint}>
                {data.learning.completedLessons} lesson completions · {data.learning.inProgressLessons} in progress.
                Highest drop-off first — good candidates to review or simplify.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Lesson</th>
                      <th style={s.th}>Chapter</th>
                      <th style={{ ...s.th, textAlign: "right" }}>Started</th>
                      <th style={{ ...s.th, textAlign: "right" }}>Completed</th>
                      <th style={{ ...s.th, textAlign: "right" }}>Dropped</th>
                      <th style={{ ...s.th, textAlign: "right" }}>Drop rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.learning.dropoff.length === 0 && (
                      <tr><td colSpan={6} style={s.emptyCell}>No lesson progress recorded yet.</td></tr>
                    )}
                    {data.learning.dropoff.map((d) => (
                      <tr key={d.lessonId} style={s.tr}>
                        <td style={s.td}>{d.title}</td>
                        <td style={{ ...s.td, color: "#8a7f63" }}>Ch {d.chapterOrder} · {d.chapterTitle}</td>
                        <td style={{ ...s.td, textAlign: "right" }}>{d.started}</td>
                        <td style={{ ...s.td, textAlign: "right" }}>{d.completed}</td>
                        <td style={{ ...s.td, textAlign: "right", fontWeight: 600 }}>{d.dropped}</td>
                        <td style={{ ...s.td, textAlign: "right" }}>
                          <span style={{ ...s.rate, background: d.dropRate >= 50 ? "#f6e6e6" : "#eef0f6", color: d.dropRate >= 50 ? "#9a4040" : "#4a5478" }}>
                            {d.dropRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Content + Noor */}
            <div style={s.grid2}>
              <Card title="Content library">
                <div style={s.miniGrid}>
                  <Mini label="Chapters" value={data.content.chapters} href="/dashboard/curriculum" />
                  <Mini label="Lessons" value={data.content.lessons} href="/dashboard/curriculum" />
                  <Mini label="Vocabulary" value={data.content.vocabulary} href="/dashboard/vocabulary" />
                  <Mini label="Tadabbur surahs" value={data.content.tadabburSurahs} href="/dashboard/tadabbur" />
                  <Mini label="Achievements" value={data.content.achievements} href="/dashboard/achievements" />
                </div>
              </Card>
              <Card title="Noor (AI tutor)">
                <div style={s.miniGrid}>
                  <Mini label="Total messages" value={data.noor.totalMessages} />
                  <Mini label="Messages · 7d" value={data.noor.messagesLast7} />
                  <Mini label="Users engaged" value={data.noor.usersEngaged} />
                </div>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Kpi({ label, value, accent, big }: { label: string; value: number; accent?: string; big?: boolean }) {
  return (
    <div style={s.kpi}>
      <div style={{ ...s.kpiValue, color: accent ?? "#2f2a20", fontSize: big ? 34 : 28 }}>
        {value.toLocaleString()}
      </div>
      <div style={s.kpiLabel}>{label}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={s.card}>
      <h2 style={s.cardTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Mini({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <div style={s.mini}>
      <div style={s.miniValue}>{value.toLocaleString()}</div>
      <div style={s.miniLabel}>{label}</div>
    </div>
  );
  return href ? <a href={href} style={{ textDecoration: "none" }}>{inner}</a> : inner;
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", background: "#f3efe4", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: "#2e2a20" },
  page: { padding: "24px 32px 48px", maxWidth: 1200, margin: "0 auto" },
  head: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 },
  kicker: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#8a7f63", margin: 0 },
  h1: { fontSize: 30, margin: "4px 0 0" },
  stamp: { fontSize: 12, color: "#8a7f63" },
  error: { background: "#fbe6e0", border: "1px solid #e6b8a8", color: "#8a3b28", padding: "10px 12px", borderRadius: 8 },
  loading: { padding: 40, textAlign: "center", color: "#8a7f63" },
  kpiRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 18 },
  kpi: { background: "#fbf8f0", border: "1px solid #e2d9c4", borderRadius: 12, padding: "16px 18px" },
  kpiValue: { fontWeight: 700, lineHeight: 1 },
  kpiLabel: { fontSize: 12, color: "#8a7f63", marginTop: 6 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 18 },
  card: { background: "#fbf8f0", border: "1px solid #e2d9c4", borderRadius: 12, padding: "18px 20px", marginBottom: 18 },
  cardTitle: { fontSize: 15, margin: "0 0 12px", color: "#3a352a" },
  chart: { display: "flex", alignItems: "flex-end", gap: 3, height: 130 },
  barWrap: { flex: 1, height: "100%", display: "flex", alignItems: "flex-end" },
  bar: { width: "100%", background: "#7fae8f", borderRadius: "3px 3px 0 0", minHeight: 2 },
  chartAxis: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8a7f63", marginTop: 6 },
  subRow: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 },
  track: { height: 8, borderRadius: 999, background: "#efe8d8", overflow: "hidden" },
  trackFill: { height: "100%", borderRadius: 999 },
  hint: { fontSize: 12.5, color: "#8a7f63", margin: "0 0 12px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13.5 },
  th: { textAlign: "left", padding: "8px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "#8a7f63", borderBottom: "1px solid #e2d9c4" },
  tr: { borderBottom: "1px solid #efe8d8" },
  td: { padding: "9px 12px" },
  emptyCell: { padding: 24, textAlign: "center", color: "#8a7f63" },
  rate: { padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 600 },
  miniGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 },
  mini: { background: "#f6f1e5", border: "1px solid #e7dfca", borderRadius: 10, padding: "12px 14px" },
  miniValue: { fontSize: 22, fontWeight: 700, color: "#2f2a20" },
  miniLabel: { fontSize: 12, color: "#8a7f63", marginTop: 2 },
};
