"use client";

import { useState } from "react";

// Preview + upload/replace + remove + paste-URL widget backed by R2
// (POST /api/admin/images). Used by the curriculum editor and content managers.
export default function ImageField({
  label,
  value,
  folder,
  adminToken = "",
  onChange,
  onStatus,
}: {
  label: string;
  value: string;
  folder: "chapters" | "cards" | "discover" | "misc";
  adminToken?: string;
  onChange: (url: string) => void;
  onStatus?: (msg: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [broken, setBroken] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      onStatus?.("Please choose an image file.");
      return;
    }
    setUploading(true);
    onStatus?.("Uploading image…");
    try {
      const res = await fetch(`/api/admin/images?folder=${folder}`, {
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
      setBroken(false);
      onChange(payload.data.imageUrl);
      onStatus?.("Image uploaded ✓");
    } catch {
      onStatus?.("Network error during image upload.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: "#5f5844" }}>{label}</span>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          style={{
            width: 84,
            height: 84,
            flexShrink: 0,
            borderRadius: 8,
            border: "1px solid #ded5bf",
            background: "#f3efe2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            color: "#a89c7d",
            fontSize: 11,
          }}
        >
          {value && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={() => setBroken(true)}
            />
          ) : value && broken ? (
            <span>broken</span>
          ) : (
            <span>no image</span>
          )}
        </div>
        <div style={{ display: "grid", gap: 6, flex: 1 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <label
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #cdb98a",
                background: uploading ? "#efe9d8" : "#8a6d1f",
                color: uploading ? "#8a7f63" : "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: uploading ? "default" : "pointer",
              }}
            >
              {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
              />
            </label>
            {value && (
              <button
                type="button"
                onClick={() => { setBroken(false); onChange(""); onStatus?.("Image removed"); }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #e0b8b8",
                  background: "#fff",
                  color: "#b04040",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            )}
          </div>
          <input
            value={value}
            onChange={(e) => { setBroken(false); onChange(e.target.value); }}
            placeholder="…or paste an image URL"
            style={{ fontSize: 12, padding: "6px 8px", border: "1px solid #d8cfb8", borderRadius: 6 }}
          />
        </div>
      </div>
    </div>
  );
}
