import { createHash } from "crypto";
import { getR2PublicUrl } from "./r2";

export const AUDIO_CATALOG_VERSION = "v1";

export function normalizeCatalogAudioText(text: string): string {
  return text.normalize("NFC").trim().replace(/\s+/g, " ");
}

export function catalogAudioKey(text: string): string {
  const normalized = normalizeCatalogAudioText(text);
  if (!normalized) throw new Error("Audio catalogue text cannot be empty.");
  const digest = createHash("sha256").update(normalized, "utf8").digest("hex");
  return `audio/catalog/${AUDIO_CATALOG_VERSION}/${digest}.mp3`;
}

export function catalogAudioUrl(text: string): string {
  return getR2PublicUrl(catalogAudioKey(text));
}
