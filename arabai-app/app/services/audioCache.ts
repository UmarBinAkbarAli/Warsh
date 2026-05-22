import * as FileSystem from "expo-file-system";
import { API_BASE_URL } from "./api";
import { getToken } from "./storage";

const AUDIO_CACHE_DIR = `${FileSystem.cacheDirectory ?? ""}warsh-audio/`;
const AUDIO_CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type TtsAudioRequest = {
  text: string;
  cacheKey?: string;
  category?: "words" | "phrases" | "lessons";
};

function normalizeCachePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

async function ensureAudioCacheDir() {
  if (!FileSystem.cacheDirectory) {
    throw new Error("Audio cache directory is unavailable on this device.");
  }

  const info = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true });
  }
}

async function isFreshCachedFile(uri: string) {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    return false;
  }

  const modificationTimeMs = typeof info.modificationTime === "number" ? info.modificationTime * 1000 : Date.now();
  return Date.now() - modificationTimeMs < AUDIO_CACHE_MAX_AGE_MS;
}

export function getTtsCacheUri({ text, cacheKey, category = "words" }: TtsAudioRequest) {
  const stablePart = normalizeCachePart(cacheKey || text) || "audio";
  return `${AUDIO_CACHE_DIR}${category}-${stablePart}-${hashText(text)}.mp3`;
}

export async function getCachedTtsAudioUri(request: TtsAudioRequest) {
  const text = request.text.trim();
  if (!text) {
    throw new Error("Cannot cache TTS audio for empty text.");
  }

  await ensureAudioCacheDir();
  const localUri = getTtsCacheUri({ ...request, text });

  if (await isFreshCachedFile(localUri)) {
    return localUri;
  }

  const token = await getToken();
  const remoteUrl = `${API_BASE_URL}/api/audio/tts?text=${encodeURIComponent(text)}`;
  const result = await FileSystem.downloadAsync(remoteUrl, localUri, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (result.status < 200 || result.status >= 300) {
    await FileSystem.deleteAsync(localUri, { idempotent: true });
    throw new Error(`TTS audio download failed with status ${result.status}.`);
  }

  return result.uri;
}

export async function prefetchTtsAudio(requests: TtsAudioRequest[]) {
  return Promise.all(requests.map((request) => getCachedTtsAudioUri(request)));
}

export function getVocabularyWordAudioUri(word: { arabic: string; transliteration?: string }) {
  return getCachedTtsAudioUri({
    text: word.arabic,
    cacheKey: word.transliteration || word.arabic,
    category: "words",
  });
}

export function getLessonTextAudioUri(lessonId: string, label: string, text: string) {
  return getCachedTtsAudioUri({
    text,
    cacheKey: `${lessonId}-${label}`,
    category: "lessons",
  });
}
