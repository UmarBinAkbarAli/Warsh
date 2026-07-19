"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardNav from "../../DashboardNav";
import { ui } from "../../adminUi";

type Detail = {
  user: {
    id: string; email: string; name: string; nativeLanguage: string; translationLanguage: string;
    goal: string; level: string; xp: number; gems: number; dailyGoalMinutes: number; phrasesSpoken: number;
    createdAt: string; trialStartAt: string; trialExpiresAt: string; subscriptionStatus: string;
    subscriptionProductId: string | null; subscriptionActiveUntil: string | null; noorOverageBalance: number;
  };
  access: { hasAccess: boolean; effectiveStatus: string; trialDaysRemaining: number; subscriptionActive: boolean };
  streak: { currentStreak: number; longestStreak: number; lastActiveDate: string | null; streakFreezes: number } | null;
  learning: { started: number; completed: number; xpFromLessons: number; recent: { title: string; chapterOrder: number; status: string; completed: boolean; when: string }[] };
  noorMessages: number;
  achievements: { title: string; icon: string; unlockedAt: string }[];
  promoRedemptions: { code: string; freeDays: number; when: string }[];
};

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function fmtDay(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function UserDetailClient({ userId }: { userId: string }) {
  const [d, setD] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantDays, setGrantDays] = useState(30);
  const [confirm, setConfirm] = useState<null | "revoke" | "reset">(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.status === 401 || res.status === 403) { window.location.href = "/dashboard/login"; return; }
      const payload = await res.json();
      if (!res.ok) { setError(payload.error ?? "Failed to load user."); return; }
      setD(payload.data);
    } catch { setError("Network error."); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function act(body: Record<string, unknown>, okMsg: string) {
    setBusy(true); setStatus("Working…");
    try {
      const res = await fetch(`/api/admin/users/${userId}/actions`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (!res.ok) { setStatus(payload.error ?? "Action failed."); return; }
      setStatus(okMsg); setGrantOpen(false); setConfirm(null); load();
    } catch { setStatus("Network error."); }
    finally { setBusy(false); }
  }

  if (error) return (
    <div style={ui.root}><DashboardNav active="/dashboard/users" /><main style={ui.page}><div style={{ ...ui.statusBar, color: "#b04040" }}>{error}</div></main></div>
  );
  if (!d) return (
    <div style={ui.root}><DashboardNav active="/dashboard/users" /><main style={ui.page}><div style={ui.statusBar}>Loading…</div></main></div>
  );

  const accessColor = d.access.hasAccess ? "#2f6f4f" : "#9a4040";

  return (
    <div style={ui.root}>
      <DashboardNav active="/dashboard/users" />
      <main style={ui.page}>
        <a href="/dashboard/users" style={{ color: "#0f766e", fontWeight: 600, textDecoration: "none", fontSize: 13 }}>← All users</a>
        <header style={{ ...ui.head, marginTop: 8 }}>
          <div>
            <p style={ui.kicker}>User</p>
            <h1 style={ui.h1}>{d.user.name || d.user.email}</h1>
            <p style={{ color: "#6b6252", margin: "4px 0 0", fontSize: 14 }}>{d.user.email}</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" style={ui.primary} onClick={() => { setGrantDays(30); setGrantOpen(true); }}>Grant free days</button>
            <button type="button" style={ui.ghost} onClick={() => setConfirm("reset")}>Send reset email</button>
            <button type="button" style={ui.danger} onClick={() => setConfirm("revoke")}>Revoke access</button>
          </div>
        </header>

        {status && <div style={ui.statusBar}>{status}</div>}

        {/* Access + key stats */}
        <section style={grid4}>
          <Stat label="Access" value={d.access.hasAccess ? "Active" : "No access"} color={accessColor} />
          <Stat label="Effective status" value={d.access.effectiveStatus} />
          <Stat label="Trial days left" value={String(d.access.trialDaysRemaining)} />
          <Stat label="Total XP" value={String(d.user.xp)} />
        </section>

        <div style={two}>
          <Card title="Profile">
            <Row k="Signed up" v={fmt(d.user.createdAt)} />
            <Row k="Native language" v={d.user.nativeLanguage} />
            <Row k="Translation" v={d.user.translationLanguage} />
            <Row k="Goal" v={d.user.goal} />
            <Row k="Level" v={d.user.level} />
            <Row k="Daily goal (min)" v={String(d.user.dailyGoalMinutes)} />
            <Row k="Gems" v={String(d.user.gems)} />
            <Row k="Phrases spoken" v={String(d.user.phrasesSpoken)} />
          </Card>

          <Card title="Subscription & trial">
            <Row k="Status (raw)" v={d.user.subscriptionStatus} />
            <Row k="Trial started" v={fmtDay(d.user.trialStartAt)} />
            <Row k="Trial expires" v={fmt(d.user.trialExpiresAt)} />
            <Row k="Subscription until" v={fmt(d.user.subscriptionActiveUntil)} />
            <Row k="Product ID" v={d.user.subscriptionProductId ?? "—"} />
            <Row k="Noor overage" v={String(d.user.noorOverageBalance)} />
          </Card>
        </div>

        <div style={two}>
          <Card title="Learning">
            <Row k="Lessons started" v={String(d.learning.started)} />
            <Row k="Lessons completed" v={String(d.learning.completed)} />
            <Row k="XP from lessons" v={String(d.learning.xpFromLessons)} />
            <Row k="Noor messages" v={String(d.noorMessages)} />
            {d.streak && <>
              <Row k="Current streak" v={`${d.streak.currentStreak} days`} />
              <Row k="Longest streak" v={`${d.streak.longestStreak} days`} />
              <Row k="Last active" v={fmtDay(d.streak.lastActiveDate)} />
            </>}
          </Card>

          <Card title="Recent activity">
            {d.learning.recent.length === 0 && <p style={{ color: "#8a7f63", fontSize: 13 }}>No lesson activity.</p>}
            {d.learning.recent.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #efe8d8", fontSize: 13 }}>
                <span>Ch {r.chapterOrder} · {r.title}</span>
                <span style={{ color: r.completed ? "#2f6f4f" : "#8a7f63" }}>{r.completed ? "done" : r.status.toLowerCase()}</span>
              </div>
            ))}
          </Card>
        </div>

        <div style={two}>
          <Card title={`Achievements (${d.achievements.length})`}>
            {d.achievements.length === 0 && <p style={{ color: "#8a7f63", fontSize: 13 }}>None unlocked.</p>}
            {d.achievements.map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13 }}>
                <span>{a.title}</span><span style={{ color: "#8a7f63" }}>{fmtDay(a.unlockedAt)}</span>
              </div>
            ))}
          </Card>
          <Card title={`Promo redemptions (${d.promoRedemptions.length})`}>
            {d.promoRedemptions.length === 0 && <p style={{ color: "#8a7f63", fontSize: 13 }}>None.</p>}
            {d.promoRedemptions.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13 }}>
                <span><code style={ui.code}>{r.code}</code> · {r.freeDays}d</span><span style={{ color: "#8a7f63" }}>{fmtDay(r.when)}</span>
              </div>
            ))}
          </Card>
        </div>
      </main>

      {grantOpen && (
        <div style={ui.overlay}>
          <div style={ui.modal}>
            <h3 style={ui.modalTitle}>Grant free days</h3>
            <p style={{ color: "#6b6252", fontSize: 14 }}>Extend {d.user.email}&apos;s trial window. This adds days on top of any time they already have.</p>
            <label style={{ ...ui.label, marginTop: 8 }}><span>Days to grant</span>
              <input type="number" min={1} max={3650} style={ui.input} value={grantDays} onChange={(e) => setGrantDays(parseInt(e.target.value, 10) || 1)} />
            </label>
            <div style={ui.modalActions}>
              <button type="button" style={ui.primary} disabled={busy} onClick={() => act({ action: "grant_days", days: grantDays }, `Granted ${grantDays} days ✓`)}>{busy ? "Working…" : `Grant ${grantDays} days`}</button>
              <button type="button" style={ui.ghost} onClick={() => setGrantOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {confirm === "revoke" && (
        <div style={ui.overlay}>
          <div style={ui.modal}>
            <h3 style={ui.modalTitle}>Revoke access?</h3>
            <p style={{ color: "#6b6252", fontSize: 14 }}>This expires {d.user.email}&apos;s trial and clears any manual paid period — they lose access immediately. A real store subscription would restore access on next verification.</p>
            <div style={ui.modalActions}>
              <button type="button" style={ui.danger} disabled={busy} onClick={() => act({ action: "revoke" }, "Access revoked ✓")}>{busy ? "Working…" : "Revoke access"}</button>
              <button type="button" style={ui.ghost} onClick={() => setConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {confirm === "reset" && (
        <div style={ui.overlay}>
          <div style={ui.modal}>
            <h3 style={ui.modalTitle}>Send password reset email?</h3>
            <p style={{ color: "#6b6252", fontSize: 14 }}>Emails a password-reset link to <strong>{d.user.email}</strong> (valid 1 hour). You never see or set the password.</p>
            <div style={ui.modalActions}>
              <button type="button" style={ui.primary} disabled={busy} onClick={() => act({ action: "send_reset" }, "Reset email sent ✓")}>{busy ? "Sending…" : "Send email"}</button>
              <button type="button" style={ui.ghost} onClick={() => setConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "#fbf8f0", border: "1px solid #e2d9c4", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: color ?? "#2f2a20" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#8a7f63", marginTop: 4 }}>{label}</div>
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: "#fbf8f0", border: "1px solid #e2d9c4", borderRadius: 12, padding: "16px 18px" }}>
      <h2 style={{ fontSize: 14, margin: "0 0 10px", color: "#3a352a" }}>{title}</h2>
      {children}
    </section>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13.5 }}>
      <span style={{ color: "#8a7f63" }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
    </div>
  );
}

const grid4: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 16 };
const two: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 };
