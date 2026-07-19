"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Sign-in failed.");
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <form onSubmit={submit} style={styles.card}>
        <div style={styles.brand}>
          <strong style={styles.brandName}>Warsh</strong>
          <span style={styles.brandSub}>Curriculum Studio</span>
        </div>
        <h1 style={styles.heading}>Admin sign-in</h1>
        <p style={styles.help}>Enter the admin dashboard token to continue.</p>
        <label style={styles.label}>
          <span>Admin token</span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoFocus
            style={styles.input}
            placeholder="ADMIN_DASHBOARD_TOKEN"
          />
        </label>
        {error && <div style={styles.error}>{error}</div>}
        <button type="submit" disabled={busy || !token} style={styles.button}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f3efe4",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    color: "#2e2a20",
  },
  card: {
    width: 360,
    background: "#fbf8f0",
    border: "1px solid #e2d9c4",
    borderRadius: 14,
    padding: 28,
    display: "grid",
    gap: 14,
    boxShadow: "0 10px 30px rgba(80,66,32,0.08)",
  },
  brand: { display: "flex", alignItems: "baseline", gap: 8 },
  brandName: { fontSize: 22, letterSpacing: 0.3 },
  brandSub: { fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "#8a7f63" },
  heading: { fontSize: 20, margin: 0 },
  help: { margin: 0, fontSize: 13, color: "#7a7057" },
  label: { display: "grid", gap: 6, fontSize: 13, color: "#5f5844" },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d8cfb8",
    background: "#fff",
    fontSize: 14,
  },
  error: {
    background: "#fbe6e0",
    border: "1px solid #e6b8a8",
    color: "#8a3b28",
    padding: "8px 10px",
    borderRadius: 8,
    fontSize: 13,
  },
  button: {
    padding: "11px 14px",
    borderRadius: 8,
    border: "none",
    background: "#0f766e",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
};
