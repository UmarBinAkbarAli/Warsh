"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardNav from "../DashboardNav";
import { ui } from "../adminUi";

type Achievement = {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedBy: number;
};

type Draft = { key: string; title: string; description: string; icon: string; xpReward: number };

const EMPTY: Draft = { key: "", title: "", description: "", icon: "star-outline", xpReward: 50 };

export default function AchievementsClient() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [editor, setEditor] = useState<{ mode: "create" | "edit"; id?: string; draft: Draft } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/achievements");
      if (res.status === 401 || res.status === 403) { window.location.href = "/dashboard/login"; return; }
      const payload = await res.json();
      if (res.ok) setItems(payload.data);
      else setStatus(payload.error ?? "Failed to load.");
    } catch { setStatus("Network error."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editor) return;
    setBusy(true);
    setStatus("Saving…");
    try {
      const creating = editor.mode === "create";
      const res = await fetch(creating ? "/api/admin/achievements" : `/api/admin/achievements/${editor.id}`, {
        method: creating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editor.draft),
      });
      const payload = await res.json();
      if (!res.ok) { setStatus(payload.error ?? "Save failed."); return; }
      setEditor(null);
      setStatus("Saved ✓");
      load();
    } catch { setStatus("Network error."); }
    finally { setBusy(false); }
  }

  async function doDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/achievements/${deleteTarget.id}`, { method: "DELETE" });
      const payload = await res.json();
      if (!res.ok) { setStatus(payload.error ?? "Delete failed."); return; }
      setDeleteTarget(null);
      setStatus("Deleted ✓");
      load();
    } catch { setStatus("Network error."); }
    finally { setBusy(false); }
  }

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setEditor((e) => (e ? { ...e, draft: { ...e.draft, [k]: v } } : e));
  }

  return (
    <div style={ui.root}>
      <DashboardNav active="/dashboard/achievements" />
      <main style={ui.page}>
        <header style={ui.head}>
          <div>
            <p style={ui.kicker}>Content</p>
            <h1 style={ui.h1}>Achievements</h1>
          </div>
          <button type="button" style={ui.primary} onClick={() => setEditor({ mode: "create", draft: { ...EMPTY } })}>
            + New achievement
          </button>
        </header>

        {status && <div style={ui.statusBar}>{status}</div>}

        <div style={ui.tableWrap}>
          <table style={ui.table}>
            <thead>
              <tr>
                <th style={ui.th}>Icon</th>
                <th style={ui.th}>Title</th>
                <th style={ui.th}>Key</th>
                <th style={ui.th}>Description</th>
                <th style={{ ...ui.th, textAlign: "right" }}>XP</th>
                <th style={{ ...ui.th, textAlign: "right" }}>Unlocked by</th>
                <th style={{ ...ui.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} style={ui.emptyCell}>Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={7} style={ui.emptyCell}>No achievements yet.</td></tr>}
              {!loading && items.map((a) => (
                <tr key={a.id} style={ui.tr}>
                  <td style={{ ...ui.td, fontSize: 22 }}>{a.icon}</td>
                  <td style={{ ...ui.td, fontWeight: 600 }}>{a.title}</td>
                  <td style={ui.td}><code style={ui.code}>{a.key}</code></td>
                  <td style={{ ...ui.td, color: "#6b6252", maxWidth: 360 }}>{a.description}</td>
                  <td style={{ ...ui.td, textAlign: "right" }}>{a.xpReward}</td>
                  <td style={{ ...ui.td, textAlign: "right" }}>{a.unlockedBy}</td>
                  <td style={{ ...ui.td, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button type="button" style={ui.smallBtn} onClick={() => setEditor({ mode: "edit", id: a.id, draft: { key: a.key, title: a.title, description: a.description, icon: a.icon, xpReward: a.xpReward } })}>Edit</button>
                    <button type="button" style={ui.smallDanger} onClick={() => setDeleteTarget(a)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {editor && (
        <div style={ui.overlay}>
          <div style={ui.modal}>
            <h3 style={ui.modalTitle}>{editor.mode === "create" ? "New achievement" : "Edit achievement"}</h3>
            <div style={ui.formGrid}>
              <label style={ui.label}><span>Icon (Ionicons name, e.g. star-outline)</span><input style={ui.input} value={editor.draft.icon} onChange={(e) => set("icon", e.target.value)} /></label>
              <label style={ui.label}><span>XP reward</span><input type="number" style={ui.input} value={editor.draft.xpReward} onChange={(e) => set("xpReward", parseInt(e.target.value, 10) || 0)} /></label>
              <label style={{ ...ui.label, gridColumn: "1 / -1" }}><span>Title</span><input style={ui.input} value={editor.draft.title} onChange={(e) => set("title", e.target.value)} /></label>
              <label style={{ ...ui.label, gridColumn: "1 / -1" }}><span>Key (unique, a–z 0–9 _)</span><input style={ui.input} value={editor.draft.key} onChange={(e) => set("key", e.target.value)} placeholder="first_lesson" /></label>
              <label style={{ ...ui.label, gridColumn: "1 / -1" }}><span>Description</span><textarea rows={2} style={ui.input} value={editor.draft.description} onChange={(e) => set("description", e.target.value)} /></label>
            </div>
            <div style={ui.modalActions}>
              <button type="button" style={ui.primary} disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>
              <button type="button" style={ui.ghost} onClick={() => setEditor(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div style={ui.overlay}>
          <div style={ui.modal}>
            <h3 style={ui.modalTitle}>Delete achievement?</h3>
            <p style={{ color: "#6b6252", fontSize: 14 }}>
              Delete <strong>{deleteTarget.title}</strong>?
              {deleteTarget.unlockedBy > 0 && <> This also removes it from <strong>{deleteTarget.unlockedBy}</strong> user(s) who unlocked it.</>}
              {" "}This cannot be undone.
            </p>
            <div style={ui.modalActions}>
              <button type="button" style={ui.danger} disabled={busy} onClick={doDelete}>{busy ? "Deleting…" : "Delete"}</button>
              <button type="button" style={ui.ghost} onClick={() => setDeleteTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
