"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";

// Rich-text body editor for blog posts. Produces sanitized-on-save HTML (see
// lib/blogSanitize.ts) instead of the old markdown-lite plain text. Deliberately
// small toolbar — bold/italic, H2, lists, link, image, video embed — matching
// what warsh-site's post-page renderer actually supports.
export default function RichTextEditor({
  value,
  onChange,
  onStatus,
  adminToken = "",
}: {
  value: string;
  onChange: (html: string) => void;
  onStatus?: (msg: string) => void;
  adminToken?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: false }),
      Image.configure({ inline: false }),
      Youtube.configure({ nocookie: true, modestBranding: true }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: { class: "rte-content" },
    },
  });

  // The value prop only needs to push into the editor when switching posts
  // (create -> edit, or edit -> a different post) — not on every keystroke,
  // which would otherwise fight the editor's own state and reset the cursor.
  const loadedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!editor) return;
    if (loadedFor.current === value) return;
    if (editor.getHTML() === value) {
      loadedFor.current = value;
      return;
    }
    editor.commands.setContent(value, false);
    loadedFor.current = value;
  }, [editor, value]);

  const uploadImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      if (!file.type.startsWith("image/")) {
        onStatus?.("Please choose an image file.");
        return;
      }
      onStatus?.("Uploading image…");
      try {
        const res = await fetch("/api/admin/images?folder=blog", {
          method: "POST",
          headers: {
            "Content-Type": file.type,
            ...(adminToken ? { "x-admin-token": adminToken } : {}),
          },
          body: file,
        });
        const payload = await res.json();
        if (!res.ok) {
          onStatus?.(payload.error ?? "Image upload failed.");
          return;
        }
        editor.chain().focus().setImage({ src: payload.data.imageUrl, alt: "" }).run();
        onStatus?.("Image inserted ✓");
      } catch {
        onStatus?.("Network error during image upload.");
      }
    },
    [editor, adminToken, onStatus],
  );

  function insertLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function insertVideo() {
    if (!editor) return;
    const url = window.prompt("YouTube or Vimeo URL");
    if (!url) return;
    const trimmed = url.trim();
    if (/youtube\.com|youtu\.be/.test(trimmed)) {
      editor.commands.setYoutubeVideo({ src: trimmed });
      return;
    }
    if (/vimeo\.com/.test(trimmed)) {
      const match = /vimeo\.com\/(\d+)/.exec(trimmed);
      if (!match) {
        onStatus?.("Couldn't read a Vimeo video ID from that URL.");
        return;
      }
      editor
        .chain()
        .focus()
        .insertContent(
          `<iframe src="https://player.vimeo.com/video/${match[1]}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`,
        )
        .run();
      return;
    }
    onStatus?.("Only YouTube and Vimeo URLs are supported for video embeds.");
  }

  if (!editor) return null;

  const btn = (active: boolean): React.CSSProperties => ({
    ...toolbarStyles.btn,
    ...(active ? toolbarStyles.btnActive : {}),
  });

  return (
    <div style={toolbarStyles.wrap}>
      <div style={toolbarStyles.bar}>
        <button type="button" style={btn(editor.isActive("bold"))} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" style={{ ...btn(editor.isActive("italic")), fontStyle: "italic" }} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <span style={toolbarStyles.sep} />
        <button type="button" style={btn(editor.isActive("heading", { level: 2 }))} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" style={btn(editor.isActive("heading", { level: 3 }))} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button type="button" style={btn(editor.isActive("bulletList"))} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" style={btn(editor.isActive("orderedList"))} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" style={btn(editor.isActive("blockquote"))} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo;</button>
        <span style={toolbarStyles.sep} />
        <button type="button" style={btn(editor.isActive("link"))} onMouseDown={(e) => e.preventDefault()} onClick={insertLink}>Link</button>
        <button type="button" style={toolbarStyles.btn} onMouseDown={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()}>Image</button>
        <button type="button" style={toolbarStyles.btn} onMouseDown={(e) => e.preventDefault()} onClick={insertVideo}>Video</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file);
            e.target.value = "";
          }}
        />
      </div>
      <EditorContent editor={editor} style={toolbarStyles.editorBox} />
      <style>{RTE_CSS}</style>
    </div>
  );
}

const toolbarStyles: Record<string, React.CSSProperties> = {
  wrap: { border: "1px solid #d8cfb8", borderRadius: 7, background: "#fff", overflow: "hidden" },
  bar: { display: "flex", flexWrap: "wrap", gap: 4, padding: "8px 10px", borderBottom: "1px solid #e8e0cd", background: "#fbf8f0" },
  sep: { width: 1, background: "#e2d9c4", margin: "2px 4px" },
  btn: { padding: "5px 9px", borderRadius: 5, border: "1px solid transparent", background: "transparent", color: "#5f5844", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnActive: { background: "#e6dfc9", border: "1px solid #d8cfb8", color: "#2e2a20" },
  editorBox: { minHeight: 380 },
};

// Scoped via a plain <style> tag rather than a CSS module — this component is
// the only place `.rte-content` renders, and Tiptap's ProseMirror div needs
// hand-written spacing since it ships unstyled.
const RTE_CSS = `
.rte-content { padding: 14px 16px; min-height: 380px; font-size: 15px; line-height: 1.7; color: #2e2a20; outline: none; }
.rte-content p { margin: 0 0 14px; }
.rte-content h2 { font-size: 22px; margin: 18px 0 8px; }
.rte-content h3 { font-size: 18px; margin: 16px 0 6px; }
.rte-content ul, .rte-content ol { margin: 0 0 14px; padding-left: 22px; }
.rte-content li { margin-bottom: 4px; }
.rte-content a { color: #0f766e; text-decoration: underline; }
.rte-content img { max-width: 100%; border-radius: 8px; margin: 10px 0; }
.rte-content iframe { max-width: 100%; border-radius: 8px; margin: 10px 0; aspect-ratio: 16 / 9; height: auto; }
.rte-content blockquote { border-left: 3px solid #d8cfb8; margin: 0 0 14px; padding-left: 14px; color: #6b6252; }
`;
