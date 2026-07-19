"use client";

import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/curriculum", label: "Curriculum" },
  { href: "/dashboard/vocabulary", label: "Vocabulary" },
  { href: "/dashboard/tadabbur", label: "Tadabbur" },
  { href: "/dashboard/achievements", label: "Achievements" },
  { href: "/dashboard/promo", label: "Promo" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/health", label: "Health" },
];

async function signOut() {
  try {
    await fetch("/api/admin/session", { method: "DELETE" });
  } catch {
    /* ignore */
  }
  window.location.href = "/dashboard/login";
}

export default function DashboardNav({ active }: { active?: string }) {
  const pathname = usePathname();
  const current = active ?? pathname;

  return (
    <nav style={s.bar}>
      <div style={s.brand}>
        <strong style={s.brandName}>Warsh</strong>
        <span style={s.brandSub}>Studio</span>
      </div>
      <div style={s.links}>
        {LINKS.map((l) => {
          const isActive = l.href === "/dashboard" ? current === "/dashboard" : current.startsWith(l.href);
          return (
            <a key={l.href} href={l.href} style={{ ...s.link, ...(isActive ? s.linkActive : {}) }}>
              {l.label}
            </a>
          );
        })}
      </div>
      <button type="button" onClick={signOut} style={s.signout}>
        Sign out
      </button>
    </nav>
  );
}

const s: Record<string, React.CSSProperties> = {
  bar: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "10px 20px",
    background: "#efe9da",
    borderBottom: "1px solid #e2d9c4",
    position: "sticky",
    top: 0,
    zIndex: 20,
    flexWrap: "wrap",
  },
  brand: { display: "flex", alignItems: "baseline", gap: 6 },
  brandName: { fontSize: 18, color: "#2e2a20", letterSpacing: 0.3 },
  brandSub: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#8a7f63" },
  links: { display: "flex", gap: 4, flexWrap: "wrap", flex: 1 },
  link: {
    padding: "6px 12px",
    borderRadius: 7,
    fontSize: 14,
    fontWeight: 600,
    color: "#6b6252",
    textDecoration: "none",
  },
  linkActive: { background: "#0f766e", color: "#fff" },
  signout: { fontSize: 13, color: "#8a7f63", background: "none", border: "none", cursor: "pointer" },
};
