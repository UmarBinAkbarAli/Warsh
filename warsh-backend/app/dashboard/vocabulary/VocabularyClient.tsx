"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardNav from "../DashboardNav";
import ImageField from "../ImageField";
import { ui } from "../adminUi";

type Word = {
  id: string;
  arabic: string;
  arabicPlain: string;
  transliteration: string;
  translationEn: string;
  translationUr: string;
  wordType: string;
  gender: string | null;
  pluralForm: string | null;
  rootLetters: string | null;
  topicCategories: string[];
  chapterIntroduced: number;
  frequencyInQuran: number | null;
  audioUrl: string | null;
  imageUrl: string | null;
  sortOrder: number;
};

type Draft = Omit<Word, "id">;

const EMPTY: Draft = {
  arabic: "", arabicPlain: "", transliteration: "", translationEn: "", translationUr: "",
  wordType: "NOUN", gender: "", pluralForm: "", rootLetters: "", topicCategories: [],
  chapterIntroduced: 1, frequencyInQuran: null, audioUrl: "", imageUrl: "", sortOrder: 0,
};

export default function VocabularyClient() {
  const [words, setWords] = useState<Word[]>([]);
  const [wordTypes, setWordTypes] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [editor, setEditor] = useState<{ mode: "create" | "edit"; id?: string; draft: Draft } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Word | null>(null);
  const [busy, setBusy] = useState(false);
  const pageSize = 50;

  const load = useCallback(async (query: string, wtype: string, pageNum: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, type: wtype, page: String(pageNum), pageSize: String(pageSize) });
      const res = await fetch(`/api/admin/vocabulary?${params.toString()}`);
      if (res.status === 401 || res.status === 403) { window.location.href = "/dashboard/login"; return; }
      const payload = await res.json();
      if (!res.ok) { setStatus(payload.error ?? "Failed to load."); return; }
      setWords(payload.data.words);
      setTotal(payload.data.total);
      setWordTypes(payload.data.wordTypes);
    } catch { setStatus("Network error."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(q, type, page); /* eslint-disable-next-line */ }, [page, type]);

  // Deep-link: preselect a search from ?q= (used by Content Health "fix →" links).
  useEffect(() => {
    const urlQ = new URLSearchParams(window.location.search).get("q");
    if (urlQ) { setQ(urlQ); load(urlQ, "", 1); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  function search(e: React.FormEvent) { e.preventDefault(); setPage(1); load(q, type, 1); }

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setEditor((ed) => (ed ? { ...ed, draft: { ...ed.draft, [k]: v } } : ed));
  }

  async function save() {
    if (!editor) return;
    setBusy(true); setStatus("Saving…");
    try {
      const creating = editor.mode === "create";
      const body = {
        ...editor.draft,
        gender: editor.draft.gender || null,
        pluralForm: editor.draft.pluralForm || null,
        rootLetters: editor.draft.rootLetters || null,
        audioUrl: editor.draft.audioUrl || null,
        imageUrl: editor.draft.imageUrl || null,
      };
      const res = await fetch(creating ? "/api/admin/vocabulary" : `/api/admin/vocabulary/${editor.id}`, {
        method: creating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (!res.ok) { setStatus(payload.error ?? "Save failed."); return; }
      setEditor(null); setStatus("Saved ✓"); load(q, type, page);
    } catch { setStatus("Network error."); }
    finally { setBusy(false); }
  }

  async function doDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/vocabulary/${deleteTarget.id}`, { method: "DELETE" });
      const payload = await res.json();
      if (!res.ok) { setStatus(payload.error ?? "Delete failed."); return; }
      setDeleteTarget(null); setStatus("Deleted ✓"); load(q, type, page);
    } catch { setStatus("Network error."); }
    finally { setBusy(false); }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const d = editor?.draft;

  return (
    <div style={ui.root}>
      <DashboardNav active="/dashboard/vocabulary" />
      <main style={ui.page}>
        <header style={ui.head}>
          <div>
            <p style={ui.kicker}>Content</p>
            <h1 style={ui.h1}>Vocabulary</h1>
          </div>
          <button type="button" style={ui.primary} onClick={() => setEditor({ mode: "create", draft: { ...EMPTY } })}>+ New word</button>
        </header>

        <form onSubmit={search} style={ui.searchRow}>
          <input style={ui.search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Arabic, translit, English, Urdu, root…" />
          <select style={ui.select} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
            <option value="">All types</option>
            {wordTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button type="submit" style={ui.primary}>Search</button>
          {(q || type) && <button type="button" style={ui.ghost} onClick={() => { setQ(""); setType(""); setPage(1); load("", "", 1); }}>Clear</button>}
        </form>

        {status && <div style={ui.statusBar}>{status}</div>}

        <div style={ui.tableWrap}>
          <table style={ui.table}>
            <thead>
              <tr>
                <th style={ui.th}>Img</th>
                <th style={ui.th}>Arabic</th>
                <th style={ui.th}>Translit</th>
                <th style={ui.th}>English</th>
                <th style={ui.th}>Urdu</th>
                <th style={ui.th}>Type</th>
                <th style={{ ...ui.th, textAlign: "right" }}>Ch</th>
                <th style={{ ...ui.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} style={ui.emptyCell}>Loading…</td></tr>}
              {!loading && words.length === 0 && <tr><td colSpan={8} style={ui.emptyCell}>No words found.</td></tr>}
              {!loading && words.map((w) => (
                <tr key={w.id} style={ui.tr}>
                  <td style={ui.td}>
                    {w.imageUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={w.imageUrl} alt="" style={{ width: 34, height: 34, borderRadius: 6, objectFit: "cover" }} />
                      : <span style={{ color: "#bcae8c" }}>—</span>}
                  </td>
                  <td style={{ ...ui.td, fontSize: 20, direction: "rtl" }}>{w.arabic}</td>
                  <td style={ui.td}>{w.transliteration}</td>
                  <td style={ui.td}>{w.translationEn}</td>
                  <td style={{ ...ui.td, direction: "rtl" }}>{w.translationUr}</td>
                  <td style={ui.td}><span style={ui.code}>{w.wordType}</span></td>
                  <td style={{ ...ui.td, textAlign: "right" }}>{w.chapterIntroduced}</td>
                  <td style={{ ...ui.td, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button type="button" style={ui.smallBtn} onClick={() => setEditor({ mode: "edit", id: w.id, draft: { ...w, gender: w.gender ?? "", pluralForm: w.pluralForm ?? "", rootLetters: w.rootLetters ?? "", audioUrl: w.audioUrl ?? "", imageUrl: w.imageUrl ?? "" } })}>Edit</button>
                    <button type="button" style={ui.smallDanger} onClick={() => setDeleteTarget(w)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={ui.pager}>
          <span style={{ color: "#8a7f63", fontSize: 13 }}>{total} words · page {page} of {totalPages}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" style={ui.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Prev</button>
            <button type="button" style={ui.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        </div>
      </main>

      {editor && d && (
        <div style={ui.overlay}>
          <div style={ui.modal}>
            <h3 style={ui.modalTitle}>{editor.mode === "create" ? "New word" : "Edit word"}</h3>
            <div style={ui.formGrid}>
              <label style={ui.label}><span>Arabic (harakat)</span><input dir="rtl" style={ui.input} value={d.arabic} onChange={(e) => set("arabic", e.target.value)} /></label>
              <label style={ui.label}><span>Arabic (plain)</span><input dir="rtl" style={ui.input} value={d.arabicPlain} onChange={(e) => set("arabicPlain", e.target.value)} /></label>
              <label style={ui.label}><span>Transliteration</span><input style={ui.input} value={d.transliteration} onChange={(e) => set("transliteration", e.target.value)} /></label>
              <label style={ui.label}><span>Word type</span>
                <select style={ui.input} value={d.wordType} onChange={(e) => set("wordType", e.target.value)}>
                  {wordTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label style={ui.label}><span>English</span><input style={ui.input} value={d.translationEn} onChange={(e) => set("translationEn", e.target.value)} /></label>
              <label style={ui.label}><span>Urdu</span><input dir="rtl" style={ui.input} value={d.translationUr} onChange={(e) => set("translationUr", e.target.value)} /></label>
              <label style={ui.label}><span>Gender</span><input style={ui.input} value={d.gender ?? ""} onChange={(e) => set("gender", e.target.value)} placeholder="masc / fem" /></label>
              <label style={ui.label}><span>Plural form</span><input dir="rtl" style={ui.input} value={d.pluralForm ?? ""} onChange={(e) => set("pluralForm", e.target.value)} /></label>
              <label style={ui.label}><span>Root letters</span><input dir="rtl" style={ui.input} value={d.rootLetters ?? ""} onChange={(e) => set("rootLetters", e.target.value)} /></label>
              <label style={ui.label}><span>Chapter introduced</span><input type="number" min={1} style={ui.input} value={d.chapterIntroduced} onChange={(e) => set("chapterIntroduced", parseInt(e.target.value, 10) || 1)} /></label>
              <label style={ui.label}><span>Frequency in Quran</span><input type="number" min={0} style={ui.input} value={d.frequencyInQuran ?? ""} onChange={(e) => set("frequencyInQuran", e.target.value ? parseInt(e.target.value, 10) : null)} /></label>
              <label style={ui.label}><span>Sort order</span><input type="number" style={ui.input} value={d.sortOrder} onChange={(e) => set("sortOrder", parseInt(e.target.value, 10) || 0)} /></label>
              <label style={{ ...ui.label, gridColumn: "1 / -1" }}><span>Topics (comma-separated)</span><input style={ui.input} value={d.topicCategories.join(", ")} onChange={(e) => set("topicCategories", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} /></label>
              <label style={{ ...ui.label, gridColumn: "1 / -1" }}><span>Audio URL</span><input style={ui.input} value={d.audioUrl ?? ""} onChange={(e) => set("audioUrl", e.target.value)} /></label>
              <div style={{ gridColumn: "1 / -1" }}>
                <ImageField label="Word image" value={d.imageUrl ?? ""} folder="misc" onChange={(url) => set("imageUrl", url)} onStatus={setStatus} />
              </div>
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
            <h3 style={ui.modalTitle}>Delete word?</h3>
            <p style={{ color: "#6b6252", fontSize: 14 }}>
              Delete <strong dir="rtl">{deleteTarget.arabic}</strong> ({deleteTarget.translationEn})? This also removes any learner SRS state for it. This cannot be undone.
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
