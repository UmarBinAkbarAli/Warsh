"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardNav from "../DashboardNav";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  nativeLanguage: string;
  xp: number;
  subscriptionStatus: string;
  trialExpiresAt: string | null;
  subscriptionActiveUntil: string | null;
  createdAt: string;
};

type UsersResponse = {
  stats: { total: number; newLast7: number; newLast30: number; activeSubs: number };
  matched: number;
  page: number;
  pageSize: number;
  users: AdminUser[];
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  active: { bg: "#e6f2ea", fg: "#2f6f4f" },
  grace: { bg: "#fdf2e0", fg: "#a5761f" },
  trial: { bg: "#eef0f6", fg: "#4a5478" },
  expired: { bg: "#f6e6e6", fg: "#9a4040" },
};

export default function UsersClient() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async (query: string, statusFilter: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q: query, status: statusFilter, page: String(pageNum), pageSize: "25" });
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/dashboard/login";
        return;
      }
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "Failed to load users.");
        return;
      }
      setData(payload.data);
    } catch {
      setError("Network error — is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(q, status, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load(q, status, 1);
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const params = new URLSearchParams({ q, status, page: "1", pageSize: "500" });
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const payload = await res.json();
      if (!res.ok) { setError(payload.error ?? "Export failed."); return; }
      const rows: AdminUser[] = payload.data.users;
      const header = ["name", "email", "signedUp", "status", "accessUntil", "xp"];
      const csv = [
        header.join(","),
        ...rows.map((u) =>
          [u.name, u.email, u.createdAt, u.subscriptionStatus, u.subscriptionActiveUntil ?? u.trialExpiresAt ?? "", u.xp]
            .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
            .join(","),
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `warsh-users-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed.");
    } finally {
      setExporting(false);
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.matched / data.pageSize)) : 1;

  return (
    <div style={{ minHeight: "100vh", background: "#f3efe4" }}>
      <DashboardNav active="/dashboard/users" />
      <main style={s.page}>
      <header style={s.header}>
        <div>
          <p style={s.kicker}>Directory</p>
          <h1 style={s.h1}>Users</h1>
        </div>
      </header>

      <div style={s.statRow}>
        <StatCard label="Total users" value={data?.stats.total} accent="#0f766e" />
        <StatCard label="New · last 7 days" value={data?.stats.newLast7} />
        <StatCard label="New · last 30 days" value={data?.stats.newLast30} />
        <StatCard label="Active subscriptions" value={data?.stats.activeSubs} accent="#8a6d1f" />
      </div>

      <form onSubmit={onSearch} style={s.searchRow}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by email or name…"
          style={s.search}
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={s.clearBtn}>
          <option value="">All statuses</option>
          <option value="trial">Trial</option>
          <option value="active">Active</option>
          <option value="grace">Grace</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit" style={s.searchBtn}>Search</button>
        {(q || status) && (
          <button type="button" onClick={() => { setQ(""); setStatus(""); setPage(1); load("", "", 1); }} style={s.clearBtn}>
            Clear
          </button>
        )}
        <button type="button" onClick={exportCsv} disabled={exporting} style={{ ...s.clearBtn, marginLeft: "auto" }}>
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </form>

      {error && <div style={s.error}>{error}</div>}

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Name</th>
              <th style={s.th}>Email</th>
              <th style={s.th}>Signed up</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Access until</th>
              <th style={{ ...s.th, textAlign: "right" }}>XP</th>
              <th style={{ ...s.th, textAlign: "right" }}></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={s.emptyCell}>Loading…</td></tr>
            )}
            {!loading && data && data.users.length === 0 && (
              <tr><td colSpan={7} style={s.emptyCell}>No users found.</td></tr>
            )}
            {!loading && data?.users.map((u) => {
              const c = STATUS_COLORS[u.subscriptionStatus] ?? { bg: "#eee", fg: "#555" };
              const accessUntil = u.subscriptionActiveUntil ?? u.trialExpiresAt;
              return (
                <tr key={u.id} style={s.tr} onClick={() => { window.location.href = `/dashboard/users/${u.id}`; }} title="View user">
                  <td style={{ ...s.td, cursor: "pointer" }}>{u.name || "—"}</td>
                  <td style={{ ...s.td, color: "#3a4a68", cursor: "pointer" }}>{u.email}</td>
                  <td style={s.td}>{fmtDate(u.createdAt)}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: c.bg, color: c.fg }}>{u.subscriptionStatus}</span>
                  </td>
                  <td style={s.td}>{fmtDate(accessUntil)}</td>
                  <td style={{ ...s.td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{u.xp}</td>
                  <td style={{ ...s.td, textAlign: "right" }}>
                    <a href={`/dashboard/users/${u.id}`} onClick={(e) => e.stopPropagation()} style={{ color: "#0f766e", fontWeight: 600, textDecoration: "none" }}>View →</a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && (
        <div style={s.pager}>
          <span style={{ color: "#8a7f63", fontSize: 13 }}>
            {data.matched} user{data.matched === 1 ? "" : "s"}{q ? " matched" : ""} · page {data.page} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} style={s.pageBtn}>
              ← Prev
            </button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} style={s.pageBtn}>
              Next →
            </button>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value?: number; accent?: string }) {
  return (
    <div style={s.statCard}>
      <div style={{ ...s.statValue, color: accent ?? "#2f2a20" }}>{value ?? "—"}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f3efe4",
    padding: "28px 32px",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    color: "#2e2a20",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 },
  kicker: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#8a7f63", margin: 0 },
  h1: { fontSize: 30, margin: "4px 0 0" },
  navLink: { color: "#0f766e", fontWeight: 600, textDecoration: "none", fontSize: 14 },
  statRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 },
  statCard: { background: "#fbf8f0", border: "1px solid #e2d9c4", borderRadius: 12, padding: "16px 18px" },
  statValue: { fontSize: 30, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 12, color: "#8a7f63", marginTop: 6 },
  searchRow: { display: "flex", gap: 8, marginBottom: 14 },
  search: { flex: 1, maxWidth: 380, padding: "9px 12px", borderRadius: 8, border: "1px solid #d8cfb8", background: "#fff", fontSize: 14 },
  searchBtn: { padding: "9px 16px", borderRadius: 8, border: "none", background: "#0f766e", color: "#fff", fontWeight: 600, cursor: "pointer" },
  clearBtn: { padding: "9px 14px", borderRadius: 8, border: "1px solid #d8cfb8", background: "#fbf8f0", color: "#5f5844", cursor: "pointer" },
  error: { background: "#fbe6e0", border: "1px solid #e6b8a8", color: "#8a3b28", padding: "10px 12px", borderRadius: 8, marginBottom: 12 },
  tableWrap: { background: "#fbf8f0", border: "1px solid #e2d9c4", borderRadius: 12, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "left", padding: "12px 16px", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, color: "#8a7f63", borderBottom: "1px solid #e2d9c4", background: "#f6f1e5" },
  tr: { borderBottom: "1px solid #efe8d8" },
  td: { padding: "11px 16px", verticalAlign: "middle" },
  emptyCell: { padding: "28px 16px", textAlign: "center", color: "#8a7f63" },
  badge: { padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 },
  pager: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  pageBtn: { padding: "8px 14px", borderRadius: 8, border: "1px solid #d8cfb8", background: "#fbf8f0", color: "#5f5844", cursor: "pointer", fontWeight: 600 },
};
