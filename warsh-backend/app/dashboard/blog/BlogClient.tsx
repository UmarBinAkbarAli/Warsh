"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardNav from "../DashboardNav";
import ImageField from "../ImageField";
import RichTextEditor from "./RichTextEditor";
import { ui, publishContent, type ContentStatus } from "../adminUi";

type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  authorName: string;
  readingMinutes: number;
  status: ContentStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type Draft = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  authorName: string;
  // Blank = auto-estimate from the body on save.
  readingMinutes: string;
};

const EMPTY: Draft = {
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  coverImageUrl: "",
  authorName: "Warsh",
  readingMinutes: "",
};

const SITE_ORIGIN = "https://warsh.app";

function fmtDay(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// Mirrors lib/blog.ts slugifyTitle so the editor can preview the URL the server
// will derive when the slug field is left blank.
function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// Matches lib/blogSanitize.ts's estimateReadingMinutesFromHtml — strips tags
// before counting words, since the body is now HTML from the rich-text editor.
function estimateMinutes(bodyHtml: string): number {
  const text = bodyHtml.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogClient() {
  const [items, setItems] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [editor, setEditor] = useState<{ mode: "create" | "edit"; id?: string; draft: Draft } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PostSummary | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
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

  // The list omits bodies, so opening a post fetches the full record first.
  async function openEditor(post: PostSummary) {
    setStatus("Loading post…");
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`);
      if (res.status === 401 || res.status === 403) { window.location.href = "/dashboard/login"; return; }
      const payload = await res.json();
      if (!res.ok) { setStatus(payload.error ?? "Failed to load post."); return; }
      const p = payload.data.post;
      setEditor({
        mode: "edit",
        id: p.id,
        draft: {
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          body: p.body,
          coverImageUrl: p.coverImageUrl ?? "",
          authorName: p.authorName,
          readingMinutes: String(p.readingMinutes),
        },
      });
      setStatus("");
    } catch { setStatus("Network error."); }
  }

  async function save(): Promise<string | null> {
    if (!editor) return null;
    setBusy(true); setStatus("Saving…");
    try {
      const creating = editor.mode === "create";
      const minutes = editor.draft.readingMinutes.trim();
      const body: Record<string, unknown> = {
        slug: editor.draft.slug.trim(),
        title: editor.draft.title,
        excerpt: editor.draft.excerpt,
        body: editor.draft.body,
        coverImageUrl: editor.draft.coverImageUrl.trim() === "" ? null : editor.draft.coverImageUrl.trim(),
        authorName: editor.draft.authorName,
        readingMinutes: minutes === "" ? null : parseInt(minutes, 10),
      };
      const res = await fetch(creating ? "/api/admin/blog" : `/api/admin/blog/${editor.id}`, {
        method: creating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (!res.ok) { setStatus(payload.error ?? "Save failed."); return null; }
      const savedId = payload.data.post.id as string;
      // Creating then saving again must not make a second post: promote the
      // editor to edit mode as soon as the record exists.
      setEditor((e) => (e ? { ...e, mode: "edit", id: savedId } : e));
      setStatus("Saved ✓");
      await load();
      return savedId;
    } catch { setStatus("Network error."); return null; }
    finally { setBusy(false); }
  }

  // "Save & publish" is the one-click flow the blog is for: persist the draft,
  // then take it live through the shared publish endpoint.
  async function saveAndPublish() {
    const id = await save();
    if (!id) return;
    setBusy(true);
    try {
      await publishContent("blog", id, "publish");
      setStatus("Published ✓ — live on warsh.app within a minute.");
      setEditor(null);
      load();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Publish failed.");
    } finally { setBusy(false); }
  }

  async function togglePublish(post: PostSummary) {
    const action = post.status === "PUBLISHED" ? "unpublish" : "publish";
    setStatus(action === "publish" ? "Publishing…" : "Unpublishing…");
    try {
      await publishContent("blog", post.id, action);
      setStatus(action === "publish" ? "Published ✓" : "Moved to draft ✓");
      load();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Publish failed.");
    }
  }

  async function doDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/blog/${deleteTarget.id}`, { method: "DELETE" });
      const payload = await res.json();
      if (!res.ok) { setStatus(payload.error ?? "Delete failed."); return; }
      setDeleteTarget(null); setStatus("Deleted ✓"); load();
    } catch { setStatus("Network error."); }
    finally { setBusy(false); }
  }

  const d = editor?.draft;
  const effectiveSlug = useMemo(() => (d ? d.slug.trim() || slugifyTitle(d.title) : ""), [d]);

  if (editor && d) {
    return (
      <div style={ui.root}>
        <DashboardNav active="/dashboard/blog" />
        <main style={{ ...ui.page, maxWidth: 1320 }}>
          <header style={ui.head}>
            <div>
              <p style={ui.kicker}>Blog</p>
              <h1 style={ui.h1}>{editor.mode === "create" ? "New post" : "Edit post"}</h1>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" style={ui.ghost} onClick={() => { setEditor(null); setStatus(""); }}>Back</button>
              <button type="button" style={ui.ghost} disabled={busy} onClick={() => save()}>
                {busy ? "Saving…" : "Save draft"}
              </button>
              <button type="button" style={ui.primary} disabled={busy} onClick={saveAndPublish}>Save &amp; publish</button>
            </div>
          </header>

          {status && <div style={ui.statusBar}>{status}</div>}

          <div style={styles.editorGrid}>
            <div style={styles.pane}>
              <div style={{ display: "grid", gap: 12 }}>
                <label style={ui.label}>
                  <span>Title</span>
                  <input style={ui.input} value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="What changes when you understand Al-Fatiha" />
                </label>

                <label style={ui.label}>
                  <span>Slug (blank = from title)</span>
                  <input style={ui.input} value={d.slug} onChange={(e) => set("slug", e.target.value)} placeholder={slugifyTitle(d.title) || "understanding-al-fatiha"} />
                  <small style={styles.hint}>{SITE_ORIGIN}/blog/{effectiveSlug || "…"}</small>
                </label>

                <label style={ui.label}>
                  <span>Excerpt (card + meta description)</span>
                  <textarea style={{ ...ui.input, minHeight: 72, resize: "vertical", fontFamily: "inherit" }} value={d.excerpt} onChange={(e) => set("excerpt", e.target.value)} maxLength={400} />
                  <small style={styles.hint}>{d.excerpt.length}/400</small>
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label style={ui.label}>
                    <span>Author</span>
                    <input style={ui.input} value={d.authorName} onChange={(e) => set("authorName", e.target.value)} />
                  </label>
                  <label style={ui.label}>
                    <span>Reading minutes (blank = auto)</span>
                    <input type="number" min={1} style={ui.input} value={d.readingMinutes} onChange={(e) => set("readingMinutes", e.target.value)} placeholder={String(estimateMinutes(d.body))} />
                  </label>
                </div>

                <ImageField
                  label="Cover image (optional)"
                  value={d.coverImageUrl}
                  folder="blog"
                  onChange={(url) => set("coverImageUrl", url)}
                  onStatus={setStatus}
                />
              </div>
            </div>

            <div style={styles.pane}>
              <p style={ui.kicker}>Body</p>
              <h2 style={{ fontSize: 22, margin: "2px 0 4px" }}>{d.title || "Untitled post"}</h2>
              <p style={{ ...styles.hint, marginTop: 0, marginBottom: 12 }}>
                {fmtDay(new Date().toISOString())} · {d.readingMinutes.trim() || estimateMinutes(d.body)} min read · {d.authorName || "Warsh"}
              </p>
              {d.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.coverImageUrl} alt="" style={styles.coverPreview} />
              )}
              <RichTextEditor
                value={d.body}
                onChange={(html) => set("body", html)}
                onStatus={setStatus}
              />
              <small style={{ ...styles.hint, display: "block", marginTop: 8 }}>
                This is exactly how the post will look on warsh.app — what you see here is what publishes.
              </small>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={ui.root}>
      <DashboardNav active="/dashboard/blog" />
      <main style={ui.page}>
        <header style={ui.head}>
          <div>
            <p style={ui.kicker}>Marketing</p>
            <h1 style={ui.h1}>Blog</h1>
          </div>
          <button type="button" style={ui.primary} onClick={() => { setStatus(""); setEditor({ mode: "create", draft: { ...EMPTY } }); }}>+ New post</button>
        </header>

        {status && <div style={ui.statusBar}>{status}</div>}

        <div style={ui.tableWrap}>
          <table style={ui.table}>
            <thead>
              <tr>
                <th style={ui.th}>Title</th>
                <th style={ui.th}>Slug</th>
                <th style={ui.th}>Status</th>
                <th style={ui.th}>Published</th>
                <th style={{ ...ui.th, textAlign: "right" }}>Read</th>
                <th style={{ ...ui.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} style={ui.emptyCell}>Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td colSpan={6} style={ui.emptyCell}>No posts yet. Write the first one.</td></tr>}
              {!loading && items.map((p) => {
                const live = p.status === "PUBLISHED";
                return (
                  <tr key={p.id} style={ui.tr}>
                    <td style={ui.td}>
                      <strong>{p.title}</strong>
                      <div style={{ ...styles.hint, marginTop: 2, maxWidth: 420 }}>{p.excerpt}</div>
                    </td>
                    <td style={ui.td}><code style={ui.code}>{p.slug}</code></td>
                    <td style={ui.td}>
                      <span style={{ ...ui.badge, ...(live ? ui.badgePublished : ui.badgeDraft) }}>{live ? "live" : "draft"}</span>
                    </td>
                    <td style={ui.td}>{fmtDay(p.publishedAt)}</td>
                    <td style={{ ...ui.td, textAlign: "right", whiteSpace: "nowrap" }}>{p.readingMinutes} min</td>
                    <td style={{ ...ui.td, textAlign: "right", whiteSpace: "nowrap" }}>
                      <button type="button" style={live ? ui.unpublishBtn : ui.publishBtn} onClick={() => togglePublish(p)}>
                        {live ? "Unpublish" : "Publish"}
                      </button>
                      <button type="button" style={ui.smallBtn} onClick={() => openEditor(p)}>Edit</button>
                      {live && (
                        <a href={`${SITE_ORIGIN}/blog/${p.slug}`} target="_blank" rel="noreferrer" style={{ ...ui.smallBtn, display: "inline-block", textDecoration: "none" }}>View</a>
                      )}
                      <button type="button" style={ui.smallDanger} onClick={() => setDeleteTarget(p)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {deleteTarget && (
        <div style={ui.overlay}>
          <div style={ui.modal}>
            <h3 style={ui.modalTitle}>Delete post?</h3>
            <p style={{ color: "#6b6252", fontSize: 14 }}>
              Delete <strong>{deleteTarget.title}</strong>?{" "}
              {deleteTarget.status === "PUBLISHED" && <>It is currently live at <code style={ui.code}>/blog/{deleteTarget.slug}</code>, and that URL will start 404ing. </>}
              Consider unpublishing instead. This cannot be undone.
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

const styles: Record<string, React.CSSProperties> = {
  editorGrid: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 20, alignItems: "start" },
  pane: { background: "#fbf8f0", border: "1px solid #e2d9c4", borderRadius: 12, padding: 18 },
  hint: { fontSize: 12, color: "#8a7f63" },
  coverPreview: { width: "100%", borderRadius: 10, border: "1px solid #e2d9c4", marginTop: 10 },
};
