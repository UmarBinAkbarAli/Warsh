import { NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";
import { getAdminWriteError } from "../../../../lib/admin";
import { uploadImageToR2 } from "../../../../lib/r2";

const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

// What sharp must report after decoding, per declared extension. Guards against
// a PNG-labelled JPEG as well as a PNG-labelled ZIP.
const SHARP_FORMAT: Record<string, string> = {
  png: "png",
  jpg: "jpeg",
  webp: "webp",
  gif: "gif",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_FOLDERS = new Set(["chapters", "cards", "discover", "blog", "misc"]);

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

  // Reject on the declared length before materializing the body — the guard
  // below only fires once the whole upload is already resident in memory.
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BYTES) {
    return NextResponse.json({ error: "Image exceeds the 5 MB limit.", code: "too_large" }, { status: 413 });
  }

  const buffer = Buffer.from(await request.arrayBuffer());
  if (buffer.length === 0) {
    return NextResponse.json({ error: "Empty image body.", code: "bad_request" }, { status: 400 });
  }
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: "Image exceeds the 5 MB limit.", code: "too_large" }, { status: 413 });
  }

  // The Content-Type header above is client-declared. Decode the bytes to prove
  // they really are the image type they claim, then re-encode: that strips EXIF
  // and any non-image payload riding along in a polyglot file. A decode failure
  // or a format/header mismatch is rejected rather than stored.
  let normalized: Buffer;
  try {
    const image = sharp(buffer, { limitInputPixels: 50_000_000, animated: ext === "gif" });
    const format = (await image.metadata()).format;
    if (format !== SHARP_FORMAT[ext]) {
      throw new Error(`declared ${contentType} but decoded as ${format ?? "unknown"}`);
    }
    normalized = await image.rotate().toBuffer();
  } catch (err) {
    console.warn("[admin-images] rejected upload that did not decode as a valid image:", err);
    return NextResponse.json(
      { error: "File is not a valid image.", code: "unsupported_type" },
      { status: 415 },
    );
  }

  const key = `images/admin/${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  try {
    const imageUrl = await uploadImageToR2(key, normalized, contentType === "image/jpg" ? "image/jpeg" : contentType);
    return NextResponse.json({ data: { imageUrl } });
  } catch (err) {
    // R2/S3 errors name the bucket and endpoint — keep them in the logs, not in
    // the response body.
    console.error("[admin-images] R2 upload failed:", err);
    return NextResponse.json({ error: "Upload failed.", code: "upload_failed" }, { status: 500 });
  }
}
