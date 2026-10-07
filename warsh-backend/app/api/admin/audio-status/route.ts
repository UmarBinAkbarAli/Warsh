import { NextResponse } from "next/server";
import { getAdminReadError } from "../../../../lib/admin";
import { catalogAudioKey, normalizeCatalogAudioText } from "../../../../lib/audioCatalog";
import { discoverCardAudioText, exerciseAudioText } from "../../../../lib/audioTargets";
import { r2KeyExists } from "../../../../lib/r2";

export const dynamic = "force-dynamic";

// POST /api/admin/audio-status { kind: "card" | "exercise", record }
// Answers whether the item's Arabic has a clip, using the same text rules and
// sha256 key as the generator and the runtime lookup (no generation fallback).
// status: "custom" = explicit audio_url, "ready" = catalogue clip exists,
// "missing" = text needs a clip that is not generated, "none" = nothing to play.
export async function POST(request: Request) {
  const readError = getAdminReadError(request);
  if (readError) return readError;

  const body = (await request.json().catch(() => null)) as { kind?: string; record?: Record<string, unknown> } | null;
  const record = body?.record;
  if (!record || (body?.kind !== "card" && body?.kind !== "exercise")) {
    return NextResponse.json({ error: "Expected { kind, record }", code: "bad_request" }, { status: 400 });
  }

  if (typeof record.audio_url === "string" && record.audio_url.trim()) {
    return NextResponse.json({ data: { status: "custom" } });
  }
  const raw = body.kind === "card" ? discoverCardAudioText(record) : exerciseAudioText(record);
  const text = typeof raw === "string" ? normalizeCatalogAudioText(raw) : "";
  if (!text) return NextResponse.json({ data: { status: "none" } });

  const exists = await r2KeyExists(catalogAudioKey(text));
  return NextResponse.json({ data: { status: exists ? "ready" : "missing" } });
}
