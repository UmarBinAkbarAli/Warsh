"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardNav from "../DashboardNav";
import { ui } from "../adminUi";

type Item = { label: string; detail?: string; href: string };
type Category = { key: string; label: string; severity: "high" | "medium" | "low"; count: number; items: Item[] };
type Health = {
  summary: { totalChapters: number; totalLessons: number; totalWords: number; issueCount: number; cleanCategories: number };
  categories: Category[];
};

const SEV: Record<string, { bg: string; fg: string; label: string }> = {
  high: { bg: "#f6e6e6", fg: "#9a4040", label: "high" },
  medium: { bg: "#fdf2e0", fg: "#a5761f", label: "medium" },
  low: { bg: "#eef0f6", fg: "#4a5478", label: "low" },
};

export default function HealthClient() {
  const [data, setData] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/content-health");
      if (res.status === 401 || res.status === 403) { window.location.href = "/dashboard/login"; return; }
      const payload = await res.json();
      if (!res.ok) { setError(payload.error ?? "Failed to load."); return; }
      setData(payload.data);
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={ui.root}>
      <DashboardNav active="/dashboard/health" />
      <main style={ui.page}>
        <header style={ui.head}>
          <div>
            <p style={ui.kicker}>Operations</p>
            <h1 style={ui.h1}>Content Health</h1>
          </div>
          <button type="button" style={ui.ghost} onClick={load} disabled={loading}>{loading ? "Scanning…" : "Re-scan"}</button>
        </header>

        {error && <div style={{ ...ui.statusBar, color: "#b04040" }}>{error}</div>}
        {loading && !data && <div style={ui.statusBar}>Scanning the whole library…</div>}

        {data && (
          <>
            <section style={grid4}>
              <Tile label="Chapters" value={data.summary.totalChapters} />
              <Tile label="Lessons" value={data.summary.totalLessons} />
              <Tile label="Vocabulary" value={data.summary.totalWords} />
              <Tile label="Total issues" value={data.summary.issueCount} accent={data.summary.issueCount > 0 ? "#9a4040" : "#2f6f4f"} />
            </section>

            <div style={{ display: "grid", gap: 12 }}>
              {data.categories.map((c) => {
                const sev = SEV[c.severity];
                const isOpen = open[c.key];
                const clean = c.count === 0;
                return (
                  <section key={c.key} style={{ background: "#fbf8f0", border: "1px solid #e2d9c4", borderRadius: 12, overflow: "hidden" }}>
                    <button
                      type="button"
                      onClick={() => !clean && setOpen((o) => ({ ...o, [c.key]: !o[c.key] }))}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
                        background: "none", border: "none", cursor: clean ? "default" : "pointer", textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{clean ? "✓" : "!"}</span>
                      <span style={{ flex: 1, fontWeight: 600, color: clean ? "#5f6b5a" : "#3a352a" }}>{c.label}</span>
                      <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: sev.bg, color: sev.fg }}>{sev.label}</span>
                      <span style={{
                        minWidth: 40, textAlign: "center", fontWeight: 700,
                        color: clean ? "#2f6f4f" : "#9a4040",
                      }}>{clean ? "0" : c.count}</span>
                      {!clean && <span style={{ color: "#8a7f63", width: 16 }}>{isOpen ? "▲" : "▼"}</span>}
                    </button>

                    {isOpen && !clean && (
                      <div style={{ borderTop: "1px solid #efe8d8", padding: "6px 0" }}>
                        {c.items.map((it, i) => (
                          <a key={i} href={it.href} style={{
                            display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 18px",
                            fontSize: 13.5, color: "#3a4a68", textDecoration: "none", borderBottom: "1px solid #f2ecdd",
                          }}>
                            <span dir="auto">{it.label}</span>
                            <span style={{ color: "#8a7f63", whiteSpace: "nowrap" }}>{it.detail ?? "fix →"}</span>
                          </a>
                        ))}
                        {c.count > c.items.length && (
                          <div style={{ padding: "8px 18px", fontSize: 12.5, color: "#8a7f63" }}>
                            …and {c.count - c.items.length} more (showing first {c.items.length}).
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Tile({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{ background: "#fbf8f0", border: "1px solid #e2d9c4", borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ?? "#2f2a20" }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: 12, color: "#8a7f63", marginTop: 6 }}>{label}</div>
    </div>
  );
}

const grid4: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 18 };
