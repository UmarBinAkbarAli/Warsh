"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardNav from "../DashboardNav";
import { ui } from "../adminUi";

type Promo = {
  id: string;
  code: string;
  freeDays: number;
  maxRedemptions: number | null;
  redemptionCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
};

type Draft = { code: string; freeDays: number; maxRedemptions: string; expiresAt: string; active: boolean };

const EMPTY: Draft = { code: "", freeDays: 30, maxRedemptions: "", expiresAt: "", active: true };

function fmtDay(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function PromoClient() {
  const [items, setItems] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [editor, setEditor] = useState<{ mode: "create" | "edit"; id?: string; draft: Draft } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promo | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promo");
      if (res.status === 401 || res.status === 403) { window.location.href = "/dashboard/login"; return; }
      const payload = await res.json();
      if (res.ok) setItems(payload.data); else setStatus(payload.error ?? "Failed to load.");
    } catch { setStatus("Network error."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setEditor((e) => (e ? { ...e, draft: { ...e.draft, [k]: v } } : e));
  }

  async function save() {
    if (!editor) return;
    setBusy(true); setStatus("Saving…");
    try {
      const creating = editor.mode === "create";
      const body: Record<string, unknown> = {
        code: editor.draft.code,
        freeDays: editor.draft.freeDays,
        maxRedemptions: editor.draft.maxRedemptions.trim() === "" ? null : parseInt(editor.draft.maxRedemptions, 10),
        expiresAt: editor.draft.expiresAt.trim() === "" ? null : new Date(editor.draft.expiresAt).toISOString(),
        active: editor.draft.active,
      };
      const res = await fetch(creating ? "/api/admin/promo" : `/api/admin/promo/${editor.id}`, {
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

  async function toggleActive(p: Promo) {
    setStatus("Updating…");
    try {
      const res = await fetch(`/api/admin/promo/${p.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !p.active }),
      });
      const payload = await res.json();
      if (!res.ok) { setStatus(payload.error ?? "Update failed."); return; }
      setStatus(p.active ? "Deactivated ✓" : "Activated ✓"); load();
    } catch { setStatus("Network error."); }
  }

  async function doDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/promo/${deleteTarget.id}`, { method: "DELETE" });
      const payload = await res.json();
      if (!res.ok) { setStatus(payload.error ?? "Delete failed."); return; }
      setDeleteTarget(null); setStatus("Deleted ✓"); load();
    } catch { setStatus("Network error."); }
    finally { setBusy(false); }
  }

  const d = editor?.draft;

  return (
    <div style={ui.root}>
      <DashboardNav active="/dashboard/promo" />
      <main style={ui.page}>
        <header style={ui.head}>
          <div>
            <p style={ui.kicker}>Growth</p>
            <h1 style={ui.h1}>Promo codes</h1>
          </div>
          <button type="button" style={ui.primary} onClick={() => setEditor({ mode: "create", draft: { ...EMPTY } })}>+ New code</button>
        </header>

        {status && <div style={ui.statusBar}>{status}</div>}

        <div style={ui.tableWrap}>
          <table style={ui.table}>
            <thead>
              <tr>
                <th style={ui.th}>Code</th>
                <th style={{ ...ui.th, textAlign: "right" }}>Free days</th>
                <th style={{ ...ui.th, textAlign: "right" }}>Redeemed</th>
                <th style={ui.th}>Status</th>
                <th style={ui.th}>Expires</th>
                <th style={{ ...ui.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} style={ui.emptyCell}>Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={6} style={ui.emptyCell}>No promo codes yet.</td></tr>}
              {!loading && items.map((p) => {
                const full = p.maxRedemptions != null && p.redemptionCount >= p.maxRedemptions;
                return (
                  <tr key={p.id} style={ui.tr}>
                    <td style={ui.td}><code style={{ ...ui.code, fontSize: 13, fontWeight: 700 }}>{p.code}</code></td>
                    <td style={{ ...ui.td, textAlign: "right" }}>{p.freeDays}</td>
                    <td style={{ ...ui.td, textAlign: "right", color: full ? "#9a4040" : "#2f2a20" }}>
                      {p.redemptionCount}{p.maxRedemptions != null ? ` / ${p.maxRedemptions}` : ""}
                    </td>
                    <td style={ui.td}>
                      <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: p.active ? "#e6f2ea" : "#f0ece2", color: p.active ? "#2f6f4f" : "#8a7f63" }}>
                        {p.active ? "active" : "off"}
                      </span>
                    </td>
                    <td style={ui.td}>{fmtDay(p.expiresAt)}</td>
                    <td style={{ ...ui.td, textAlign: "right", whiteSpace: "nowrap" }}>
                      <button type="button" style={ui.smallBtn} onClick={() => toggleActive(p)}>{p.active ? "Disable" : "Enable"}</button>
                      <button type="button" style={ui.smallBtn} onClick={() => setEditor({ mode: "edit", id: p.id, draft: { code: p.code, freeDays: p.freeDays, maxRedemptions: p.maxRedemptions?.toString() ?? "", expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : "", active: p.active } })}>Edit</button>
                      <button type="button" style={ui.smallDanger} onClick={() => setDeleteTarget(p)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {editor && d && (
        <div style={ui.overlay}>
          <div style={ui.modal}>
            <h3 style={ui.modalTitle}>{editor.mode === "create" ? "New promo code" : "Edit promo code"}</h3>
            <div style={ui.formGrid}>
              <label style={ui.label}><span>Code</span><input style={{ ...ui.input, textTransform: "uppercase" }} value={d.code} onChange={(e) => set("code", e.target.value)} placeholder="LAUNCH50" /></label>
              <label style={ui.label}><span>Free days</span><input type="number" min={1} style={ui.input} value={d.freeDays} onChange={(e) => set("freeDays", parseInt(e.target.value, 10) || 1)} /></label>
              <label style={ui.label}><span>Max redemptions (blank = unlimited)</span><input type="number" min={1} style={ui.input} value={d.maxRedemptions} onChange={(e) => set("maxRedemptions", e.target.value)} placeholder="unlimited" /></label>
              <label style={ui.label}><span>Expires (blank = never)</span><input type="date" style={ui.input} value={d.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} /></label>
              <label style={{ ...ui.label, gridColumn: "1 / -1", flexDirection: "row", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={d.active} onChange={(e) => set("active", e.target.checked)} style={{ width: "auto" }} />
                <span>Active</span>
              </label>
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
            <h3 style={ui.modalTitle}>Delete promo code?</h3>
            <p style={{ color: "#6b6252", fontSize: 14 }}>
              Delete <code style={ui.code}>{deleteTarget.code}</code>?
              {deleteTarget.redemptionCount > 0 && <> This also removes its <strong>{deleteTarget.redemptionCount}</strong> redemption record(s) (users keep the days they already got). </>}
              {" "}Consider disabling instead to keep history. This cannot be undone.
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
