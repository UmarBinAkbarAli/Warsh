import type { CSSProperties } from "react";

// Shared styling for the content-manager pages (achievements, vocabulary,
// tadabbur). Keeps the cream/olive look consistent across the dashboard.
export const ui: Record<string, CSSProperties> = {
  root: { minHeight: "100vh", background: "#f3efe4", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: "#2e2a20" },
  page: { padding: "24px 32px 48px", maxWidth: 1200, margin: "0 auto" },
  head: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, gap: 12, flexWrap: "wrap" },
  kicker: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#8a7f63", margin: 0 },
  h1: { fontSize: 30, margin: "4px 0 0" },

  primary: { padding: "9px 16px", borderRadius: 8, border: "none", background: "#0f766e", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  danger: { padding: "9px 16px", borderRadius: 8, border: "none", background: "#b04040", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  ghost: { padding: "9px 16px", borderRadius: 8, border: "1px solid #d8cfb8", background: "#fbf8f0", color: "#5f5844", cursor: "pointer", fontSize: 14 },
  smallBtn: { padding: "4px 10px", marginLeft: 6, borderRadius: 6, border: "1px solid #d8cfb8", background: "#fbf8f0", color: "#5f5844", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  smallDanger: { padding: "4px 10px", marginLeft: 6, borderRadius: 6, border: "1px solid #e0b8b8", background: "#fff", color: "#b04040", fontSize: 12, fontWeight: 600, cursor: "pointer" },

  statusBar: { background: "#faf8f3", border: "1px solid #e2ddd0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#5f5844", marginBottom: 12 },

  searchRow: { display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" },
  search: { flex: 1, minWidth: 240, maxWidth: 420, padding: "9px 12px", borderRadius: 8, border: "1px solid #d8cfb8", background: "#fff", fontSize: 14 },
  select: { padding: "9px 12px", borderRadius: 8, border: "1px solid #d8cfb8", background: "#fff", fontSize: 14 },

  tableWrap: { background: "#fbf8f0", border: "1px solid #e2d9c4", borderRadius: 12, overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "left", padding: "11px 14px", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "#8a7f63", borderBottom: "1px solid #e2d9c4", background: "#f6f1e5", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #efe8d8" },
  td: { padding: "10px 14px", verticalAlign: "middle" },
  emptyCell: { padding: 28, textAlign: "center", color: "#8a7f63" },
  code: { fontSize: 12, background: "#f0ead9", padding: "1px 6px", borderRadius: 4 },

  overlay: { position: "fixed", inset: 0, background: "rgba(40,34,20,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 },
  modal: { background: "#fbf8f0", border: "1px solid #e2d9c4", borderRadius: 14, padding: 24, width: 560, maxWidth: "94%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 50px rgba(80,66,32,0.18)" },
  modalTitle: { fontSize: 19, margin: "0 0 14px" },
  modalActions: { display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label: { display: "grid", gap: 5, fontSize: 13, color: "#5f5844" },
  input: { padding: "8px 10px", borderRadius: 7, border: "1px solid #d8cfb8", background: "#fff", fontSize: 14, width: "100%" },

  pager: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  pageBtn: { padding: "8px 14px", borderRadius: 8, border: "1px solid #d8cfb8", background: "#fbf8f0", color: "#5f5844", cursor: "pointer", fontWeight: 600 },
};
