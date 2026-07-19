"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardNav from "../DashboardNav";
import { ui, publishContent, type ContentStatus } from "../adminUi";

type Surah = {
  id: string;
  orderInProg: number;
  surahNumber: number;
  nameAr: string;
  nameEn: string;
  meaningEn: string;
  totalAyat: number;
  status: ContentStatus;
  learners: number;
};

type Draft = {
  orderInProg: number;
  surahNumber: number;
  nameAr: string;
  nameEn: string;
  meaningEn: string;
  totalAyat: number;
  ayatJson: string;
};

const EMPTY: Draft = { orderInProg: 1, surahNumber: 1, nameAr: "", nameEn: "", meaningEn: "", totalAyat: 1, ayatJson: "[]" };

export default function TadabburClient() {
  const [items, setItems] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [editor, setEditor] = useState<{ mode: "create" | "edit"; id?: string; draft: Draft } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Surah | null>(null);
  const [busy, setBusy] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tadabbur");
      if (res.status === 401 || res.status === 403) { window.location.href = "/dashboard/login"; return; }
      const payload = await res.json();
      if (res.ok) setItems(payload.data); else setStatus(payload.error ?? "Failed to load.");
    } catch { setStatus("Network error."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openEdit(s: Surah) {
    setStatus("Loading surah…");
    try {
      const res = await fetch(`/api/admin/tadabbur/${s.id}`);
      const payload = await res.json();
      if (!res.ok) { setStatus(payload.error ?? "Failed to load surah."); return; }
      const full = payload.data.surah;
      setEditor({
        mode: "edit",
        id: s.id,
        draft: {
          orderInProg: full.orderInProg,
          surahNumber: full.surahNumber,
          nameAr: full.nameAr,
          nameEn: full.nameEn,
          meaningEn: full.meaningEn,
          totalAyat: full.totalAyat,
          ayatJson: JSON.stringify(full.ayatData ?? [], null, 2),
        },
      });
      setStatus("");
      setJsonError(null);
    } catch { setStatus("Network error."); }
  }

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setEditor((e) => (e ? { ...e, draft: { ...e.draft, [k]: v } } : e));
  }

  async function togglePublish(s: Surah) {
    setBusy(true);
    try {
      const next = await publishContent("tadabbur", s.id, s.status === "PUBLISHED" ? "unpublish" : "publish");
      setItems((prev) => prev.map((it) => (it.id === s.id ? { ...it, status: next } : it)));
      setStatus(next === "PUBLISHED" ? "Published ✓" : "Unpublished ✓");
    } catch (e) { setStatus(e instanceof Error ? e.message : "Publish failed."); }
    finally { setBusy(false); }
  }

  async function save() {
    if (!editor) return;
    let ayatData: unknown;
    try {
      ayatData = JSON.parse(editor.draft.ayatJson);
      if (!Array.isArray(ayatData)) { setJsonError("Ayah data must be a JSON array."); return; }
    } catch (err) { setJsonError(`Invalid JSON: ${err}`); return; }
    setJsonError(null);
    setBusy(true); setStatus("Saving…");
    try {
      const creating = editor.mode === "create";
      const body = {
        orderInProg: editor.draft.orderInProg,
        surahNumber: editor.draft.surahNumber,
        nameAr: editor.draft.nameAr,
        nameEn: editor.draft.nameEn,
        meaningEn: editor.draft.meaningEn,
        totalAyat: editor.draft.totalAyat,
        ayatData,
      };
      const res = await fetch(creating ? "/api/admin/tadabbur" : `/api/admin/tadabbur/${editor.id}`, {
        method: creating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (!res.ok) { setStatus(payload.error ?? "Save failed."); return; }
      setEditor(null); setStatus("Saved ✓"); load();
    } catch { setStatus("Network error."); }
    finally { setBusy(false); }
  }

  async function doDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/tadabbur/${deleteTarget.id}`, { method: "DELETE" });
      const payload = await res.json();
      if (!res.ok) { setStatus(payload.error ?? "Delete failed."); return; }
      setDeleteTarget(null); setStatus("Deleted ✓"); load();
    } catch { setStatus("Network error."); }
    finally { setBusy(false); }
  }

  const d = editor?.draft;

  return (
    <div style={ui.root}>
      <DashboardNav active="/dashboard/tadabbur" />
      <main style={ui.page}>
        <header style={ui.head}>
          <div>
            <p style={ui.kicker}>Content</p>
            <h1 style={ui.h1}>Tadabbur — Surahs</h1>
          </div>
          <button type="button" style={ui.primary} onClick={() => { setEditor({ mode: "create", draft: { ...EMPTY } }); setJsonError(null); }}>+ New surah</button>
        </header>

        {status && <div style={ui.statusBar}>{status}</div>}

        <div style={ui.tableWrap}>
          <table style={ui.table}>
            <thead>
              <tr>
                <th style={{ ...ui.th, textAlign: "right" }}>Order</th>
                <th style={{ ...ui.th, textAlign: "right" }}>Surah #</th>
                <th style={ui.th}>Arabic</th>
                <th style={ui.th}>English</th>
                <th style={ui.th}>Meaning</th>
                <th style={{ ...ui.th, textAlign: "right" }}>Ayat</th>
                <th style={{ ...ui.th, textAlign: "right" }}>Learners</th>
                <th style={ui.th}>Status</th>
                <th style={{ ...ui.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} style={ui.emptyCell}>Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={9} style={ui.emptyCell}>No surahs yet.</td></tr>}
              {!loading && items.map((s) => (
                <tr key={s.id} style={ui.tr}>
                  <td style={{ ...ui.td, textAlign: "right" }}>{s.orderInProg}</td>
                  <td style={{ ...ui.td, textAlign: "right" }}>{s.surahNumber}</td>
                  <td style={{ ...ui.td, fontSize: 20, direction: "rtl" }}>{s.nameAr}</td>
                  <td style={{ ...ui.td, fontWeight: 600 }}>{s.nameEn}</td>
                  <td style={{ ...ui.td, color: "#6b6252" }}>{s.meaningEn}</td>
                  <td style={{ ...ui.td, textAlign: "right" }}>{s.totalAyat}</td>
                  <td style={{ ...ui.td, textAlign: "right" }}>{s.learners}</td>
                  <td style={ui.td}>
                    <span style={{ ...ui.badge, ...(s.status === "PUBLISHED" ? ui.badgePublished : ui.badgeDraft) }}>
                      {s.status === "PUBLISHED" ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td style={{ ...ui.td, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button type="button" style={s.status === "PUBLISHED" ? ui.unpublishBtn : ui.publishBtn} disabled={busy} onClick={() => togglePublish(s)}>
                      {s.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </button>
                    <button type="button" style={ui.smallBtn} onClick={() => openEdit(s)}>Edit</button>
                    <button type="button" style={ui.smallDanger} onClick={() => setDeleteTarget(s)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {editor && d && (
        <div style={ui.overlay}>
          <div style={{ ...ui.modal, width: 720 }}>
            <h3 style={ui.modalTitle}>{editor.mode === "create" ? "New surah" : "Edit surah"}</h3>
            <div style={ui.formGrid}>
              <label style={ui.label}><span>Order in program</span><input type="number" min={1} style={ui.input} value={d.orderInProg} onChange={(e) => set("orderInProg", parseInt(e.target.value, 10) || 1)} /></label>
              <label style={ui.label}><span>Surah number (1–114)</span><input type="number" min={1} max={114} style={ui.input} value={d.surahNumber} onChange={(e) => set("surahNumber", parseInt(e.target.value, 10) || 1)} /></label>
              <label style={ui.label}><span>Name (Arabic)</span><input dir="rtl" style={ui.input} value={d.nameAr} onChange={(e) => set("nameAr", e.target.value)} /></label>
              <label style={ui.label}><span>Name (English)</span><input style={ui.input} value={d.nameEn} onChange={(e) => set("nameEn", e.target.value)} /></label>
              <label style={ui.label}><span>Total ayat</span><input type="number" min={1} style={ui.input} value={d.totalAyat} onChange={(e) => set("totalAyat", parseInt(e.target.value, 10) || 1)} /></label>
              <label style={{ ...ui.label, gridColumn: "1 / -1" }}><span>Meaning (English)</span><input style={ui.input} value={d.meaningEn} onChange={(e) => set("meaningEn", e.target.value)} /></label>
              <label style={{ ...ui.label, gridColumn: "1 / -1" }}>
                <span>Ayah data (JSON array)</span>
                <textarea
                  rows={14}
                  spellCheck={false}
                  style={{ ...ui.input, fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 12.5, whiteSpace: "pre" }}
                  value={d.ayatJson}
                  onChange={(e) => set("ayatJson", e.target.value)}
                />
              </label>
              {jsonError && <div style={{ gridColumn: "1 / -1", color: "#b04040", fontSize: 12.5 }}>{jsonError}</div>}
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
            <h3 style={ui.modalTitle}>Delete surah?</h3>
            <p style={{ color: "#6b6252", fontSize: 14 }}>
              Delete <strong>{deleteTarget.nameEn}</strong> (<span dir="rtl">{deleteTarget.nameAr}</span>)?
              {deleteTarget.learners > 0 && <> This removes progress for <strong>{deleteTarget.learners}</strong> learner(s).</>}
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
