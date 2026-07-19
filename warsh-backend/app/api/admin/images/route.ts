import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminWriteError } from "../../../../lib/admin";
import { uploadImageToR2 } from "../../../../lib/r2";

const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_FOLDERS = new Set(["chapters", "cards", "discover", "misc"]);

// POST /api/admin/images?folder=cards
// Body: raw image bytes, Content-Type: image/png | image/jpeg | image/webp | image/gif
// Uploads to R2 under a unique key and returns the public URL. A unique key per
// upload means replacing an image always yields a new URL, so cached CDN copies
// of the old image never mask the change.
export async function POST(request: Request) {
  const writeError = getAdminWriteError(request);
  if (writeError) return writeError;

  const contentType = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const ext = ALLOWED[contentType];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported image type. Use PNG, JPEG, WebP, or GIF.", code: "unsupported_type" },
      { status: 415 },
    );
  }

  const folderParam = new URL(request.url).searchParams.get("folder") ?? "misc";
  const folder = ALLOWED_FOLDERS.has(folderParam) ? folderParam : "misc";

  const buffer = Buffer.from(await request.arrayBuffer());
  if (buffer.length === 0) {
    return NextResponse.json({ error: "Empty image body.", code: "bad_request" }, { status: 400 });
  }
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: "Image exceeds the 5 MB limit.", code: "too_large" }, { status: 413 });
  }

  const key = `images/admin/${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  try {
    const imageUrl = await uploadImageToR2(key, buffer, contentType === "image/jpg" ? "image/jpeg" : contentType);
    return NextResponse.json({ data: { imageUrl } });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed.", code: "upload_failed" },
      { status: 500 },
    );
  }
}
