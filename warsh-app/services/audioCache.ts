import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { API_BASE_URL } from "./api";
import { getToken } from "./storage";

const AUDIO_CACHE_DIR = `${FileSystem.cacheDirectory ?? ""}warsh-audio/`;
const AUDIO_CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const webAudioObjectUrls = new Map<string, string>();
const remoteAudioDownloads = new Map<string, Promise<string>>();
const ttsAudioDownloads = new Map<string, Promise<string>>();

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
  if (Platform.OS === "web") {
    return;
  }

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

async function fetchWebAudioUrl(remoteUrl: string, cacheKey: string, headers?: Record<string, string>) {
  const existing = webAudioObjectUrls.get(cacheKey);
  if (existing) {
    return existing;
  }

  const response = await fetch(remoteUrl, { headers });
  if (!response.ok) {
    throw new Error(`Audio request failed with status ${response.status}.`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  webAudioObjectUrls.set(cacheKey, objectUrl);
  return objectUrl;
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
  const existingDownload = ttsAudioDownloads.get(localUri);
  if (existingDownload) return existingDownload;

  const download = (async () => {
    const token = await getToken();
    const remoteUrl = `${API_BASE_URL}/api/audio/tts?text=${encodeURIComponent(text)}`;

    if (Platform.OS === "web") {
      return fetchWebAudioUrl(
        remoteUrl,
        localUri,
        token ? { Authorization: `Bearer ${token}` } : undefined,
      );
    }

    if (await isFreshCachedFile(localUri)) {
      return localUri;
    }

    const result = await FileSystem.downloadAsync(remoteUrl, localUri, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (result.status < 200 || result.status >= 300) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
      throw new Error(`TTS audio download failed with status ${result.status}.`);
    }

    return result.uri;
  })();

  ttsAudioDownloads.set(localUri, download);
  try {
    return await download;
  } finally {
    ttsAudioDownloads.delete(localUri);
  }
}

export async function getCachedRemoteAudioUri(
  remoteUrl: string,
  cacheKey: string,
  category: "words" | "phrases" | "lessons" = "lessons",
) {
  const stablePart = normalizeCachePart(cacheKey || remoteUrl) || "audio";
  const localUri = `${AUDIO_CACHE_DIR}${category}-remote-${stablePart}-${hashText(remoteUrl)}.mp3`;
  const existingDownload = remoteAudioDownloads.get(localUri);
  if (existingDownload) return existingDownload;

  const download = (async () => {
    await ensureAudioCacheDir();
    if (Platform.OS === "web") {
      return fetchWebAudioUrl(remoteUrl, localUri);
    }
    if (await isFreshCachedFile(localUri)) return localUri;

    const result = await FileSystem.downloadAsync(remoteUrl, localUri);
    if (result.status < 200 || result.status >= 300) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
      throw new Error(`Remote audio download failed with status ${result.status}.`);
    }
    return result.uri;
  })();

  remoteAudioDownloads.set(localUri, download);
  try {
    return await download;
  } finally {
    remoteAudioDownloads.delete(localUri);
  }
}

// Vocabulary word audio: first call generates TTS + saves to R2; subsequent calls
// return the R2 public URL directly (no OpenAI cost, faster delivery).
export async function getVocabWordAudioUri(wordId: string, arabicText: string): Promise<string> {
  const localUri = `${AUDIO_CACHE_DIR}vocabword-${wordId}.mp3`;

  await ensureAudioCacheDir();

  // Ask backend for the R2 URL (generates + uploads on first call)
  const token = await getToken();
  const apiUrl = `${API_BASE_URL}/api/vocabulary/words/${wordId}/audio`;
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  if (Platform.OS !== "web" && await isFreshCachedFile(localUri)) {
    return localUri;
  }

  const response = await fetch(apiUrl, { headers });
  if (!response.ok) {
    // Backend unavailable — fall back to on-demand TTS
    return getCachedTtsAudioUri({ text: arabicText, cacheKey: wordId, category: "words" });
  }

  const json = await response.json() as { data: { audioUrl: string } };
  const r2Url = json.data.audioUrl;
  if (Platform.OS === "web") {
    return r2Url;
  }

  // Download from R2 public URL (no auth header — it's a public CDN)
  const result = await FileSystem.downloadAsync(r2Url, localUri);

  if (result.status < 200 || result.status >= 300) {
    await FileSystem.deleteAsync(localUri, { idempotent: true });
    // R2 download failed — fall back to on-demand TTS
    return getCachedTtsAudioUri({ text: arabicText, cacheKey: wordId, category: "words" });
  }

  return result.uri;
}

export async function prefetchTtsAudio(requests: TtsAudioRequest[]) {
  return Promise.all(requests.map((request) => getCachedTtsAudioUri(request)));
}

export function prefetchRemoteAudio(remoteUrl: string, cacheKey: string, category: "words" | "phrases" | "lessons" = "lessons") {
  return getCachedRemoteAudioUri(remoteUrl, cacheKey, category);
}

// Warms the local audio cache for a vocab word ahead of time (e.g. the next
// card in a review/lesson queue) so playback is instant once the user reaches it.
export async function prefetchVocabWordAudio(wordId: string, arabicText: string) {
  return getVocabWordAudioUri(wordId, arabicText);
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
