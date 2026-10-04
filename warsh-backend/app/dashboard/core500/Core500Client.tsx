"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { CoreExample } from "../../../lib/core500Examples";
import { ui } from "../adminUi";
type Word = { id: string; arabic: string; quranicRank: number; translationEn: string; translationUr: string; revision: string;
  coreAyahExamples: (CoreExample & { id: string; position: number; status: string; updatedAt: string; wordId: string })[] };
export default function Core500Client() {
  const [set, setSet] = useState(1);
  const [words, setWords] = useState<Word[]>([]);
  const [selected, setSelected] = useState<Word | null>(null);
  const [json, setJson] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/core500?set=${set}`);
      const body = await response.json(); if (!response.ok) throw new Error(body.error);
      setWords(body.data.words); setSelected(null);
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not load."); }
    finally { setBusy(false); }
  }, [set]);
  useEffect(() => { void load(); }, [load]);
  function select(word: Word) {
    setSelected(word); setMessage("");
    setJson(JSON.stringify(word.coreAyahExamples.map(({ id: _id, position: _position, status: _status, updatedAt: _date, wordId: _word, ...e }) => e), null, 2));
  }
  async function save(status: "DRAFT" | "PUBLISHED") {
    if (!selected || busy) return;
    setBusy(true); setMessage("");
    try {
      const examples = JSON.parse(json);
      const response = await fetch("/api/admin/core500", { method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: selected.id, revision: selected.revision, examples, status }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error);
      await load(); setMessage(status === "PUBLISHED" ? "Three reviewed examples published." : "Draft saved.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not save."); }
    finally { setBusy(false); }
  }
  return <div style={ui.root}><main style={ui.page}>
    <Link href="/dashboard">← Warsh Studio</Link>
    <h1 style={{ ...ui.h1, margin: "20px 0 12px" }}>Core 500 · Ayah review</h1>
    <p>Review three distinct ayahs per word, the highlighted surface and its relationship to the headword, and both translations. Arabic and translations are verified against Quran Foundation when saved. Changes affect Core 500 only.</p>
    <label>Set <select disabled={busy} value={set} onChange={e => setSet(Number(e.target.value))} style={{ ...ui.select, marginLeft: 8 }}>{Array.from({ length: 100 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label>
    <div style={{ ...ui.searchRow, margin: "20px 0" }}>{words.map(word => <button key={word.id} disabled={busy} style={{ ...ui.ghost, minWidth: 140, padding: 16, opacity: busy ? 0.6 : 1 }} onClick={() => select(word)}>
      #{word.quranicRank} <span lang="ar" dir="rtl" style={{ fontSize: 24 }}>{word.arabic}</span><br />{word.coreAyahExamples.filter(e => e.status === "PUBLISHED").length}/3 published
    </button>)}</div>
    {message && <p role="status" style={ui.statusBar}>{message}</p>}
    {selected && <section>
      <h2 style={{ fontSize: 24 }}><span dir="rtl" lang="ar">{selected.arabic}</span> · {selected.translationEn} · <span dir="rtl" lang="ur">{selected.translationUr}</span></h2>
      {selected.coreAyahExamples.map(e => <article key={e.id} style={{ ...ui.tableWrap, padding: 20, marginBottom: 16 }}>
        <a target="_blank" rel="noreferrer" href={e.source}>{e.surahName} {e.surahNumber}:{e.ayahNumber} · {e.matchKind}</a>
        <p lang="ar" dir="rtl" style={{ fontSize: 28, lineHeight: 2 }}>{e.arabic.split(/\s+/).map((part, i) => <span key={i}>{i + 1 === e.wordPosition ? <mark style={ui.badgeDraft}>{part}</mark> : part}{" "}</span>)}</p>
        <p>{e.translationEn}</p><p lang="ur" dir="rtl">{e.translationUr}</p>
      </article>)}
      <label style={ui.label}>Example records (three required)<textarea aria-label="Example records" style={{ ...ui.input, height: 360, fontFamily: "monospace", boxSizing: "border-box" }} value={json} disabled={busy} onChange={e => setJson(e.target.value)} /></label>
      <div style={{ ...ui.searchRow, marginTop: 16 }}><button style={ui.ghost} disabled={busy} onClick={() => void save("DRAFT")}>Save draft</button>
        <button style={{ ...ui.primary, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={() => void save("PUBLISHED")}>Approve and publish these 3 examples</button></div>
    </section>}
  </main></div>;
}
