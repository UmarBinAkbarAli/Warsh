import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import * as Network from "expo-network";
import { Platform } from "react-native";
import api from "./api";
import { prefetchRemoteAudio } from "./audioCache";

// Warms a whole chapter's images and audio in the background so the learner
// never waits on a download mid-lesson.
//
// This only became worth doing once the artwork was resized: Chapter 1 used to
// carry 17.8 MB of images against 1.8 MB of audio, so warming it would have
// cost a new user 20 MB before they had opened a single lesson. At roughly
// 76 KB an image the same chapter is a few MB, which is a reasonable thing to
// pull in the background — and the reason the ceiling below is set where it is.

const PREFETCHED_KEY = (chapterId: string) => `warsh.chapterPrefetched.${chapterId}`;

// A chapter that somehow grew past this is not silently downloaded; the player
// falls back to warming each lesson as the learner reaches it. Sized to clear a
// normal chapter several times over while still catching a regression like the
// one that prompted this — a chapter of unresized artwork would trip it.
const MAX_CHAPTER_BYTES = 12 * 1024 * 1024;

// Enough parallelism to use the connection, few enough that the foreground
// request the learner is actually waiting on still gets through.
const CONCURRENCY = 4;

type ChapterMedia = { chapterId: string; images: string[]; audio: string[] };

let activeChapterId: string | null = null;

async function alreadyPrefetched(chapterId: string) {
  try {
    return (await AsyncStorage.getItem(PREFETCHED_KEY(chapterId))) !== null;
  } catch {
    return false;
  }
}

async function markPrefetched(chapterId: string) {
  try {
    await AsyncStorage.setItem(PREFETCHED_KEY(chapterId), String(Date.now()));
  } catch {
    // A cache marker that fails to persist only costs a repeat prefetch later,
    // and the downloads themselves are already cached by then.
  }
}

/**
 * Unmetered means WiFi or ethernet. `isInternetReachable` can be null while the
 * probe is still in flight, which is not the same as "offline" — only an
 * explicit false is treated as no connection.
 */
async function isOnUnmeteredNetwork() {
  if (Platform.OS === "web") return true;
  try {
    const state = await Network.getNetworkStateAsync();
    if (state.isInternetReachable === false) return false;
    return (
      state.type === Network.NetworkStateType.WIFI ||
      state.type === Network.NetworkStateType.ETHERNET
    );
  } catch {
    // If the platform will not say, assume metered and stay off the network.
    return false;
  }
}

/**
 * Head-requests the manifest to see what the download would actually cost.
 * A chapter whose assets have regressed in size is skipped rather than pulled
 * down silently over someone's data.
 */
async function measure(urls: string[]) {
  let total = 0;
  for (let index = 0; index < urls.length; index += CONCURRENCY) {
    const batch = urls.slice(index, index + CONCURRENCY);
    const sizes = await Promise.all(
      batch.map(async (url) => {
        try {
          const response = await fetch(url, { method: "HEAD" });
          return Number.parseInt(response.headers.get("content-length") ?? "", 10) || 0;
        } catch {
          return 0;
        }
      }),
    );
    total += sizes.reduce((sum, size) => sum + size, 0);
  }
  return total;
}

async function runBatched<T>(items: T[], run: (item: T) => Promise<unknown>) {
  for (let index = 0; index < items.length; index += CONCURRENCY) {
    if (activeChapterId === null) return; // cancelled
    await Promise.all(items.slice(index, index + CONCURRENCY).map((item) => run(item).catch(() => undefined)));
  }
}

/**
 * Downloads every asset in a chapter. Safe to call repeatedly: it no-ops once
 * the chapter is marked done, and only one chapter warms at a time so a
 * background warm never competes with the lesson the learner just opened.
 *
 * Never throws — a failed prefetch must be invisible, because the player still
 * warms each lesson on its own as a fallback.
 */
export async function prefetchChapter(chapterId: string, options?: { force?: boolean }) {
  if (!chapterId) return;
  if (activeChapterId) return;
  if (!options?.force && (await alreadyPrefetched(chapterId))) return;
  if (!options?.force && !(await isOnUnmeteredNetwork())) return;

  activeChapterId = chapterId;
  try {
    const response = await api.get(`/api/chapters/${chapterId}/media`);
    const media = response.data.data as ChapterMedia;
    const images = media.images ?? [];
    const audio = media.audio ?? [];
    if (images.length === 0 && audio.length === 0) {
      await markPrefetched(chapterId);
      return;
    }

    const bytes = await measure([...images, ...audio]);
    if (bytes > MAX_CHAPTER_BYTES) {
      // Deliberately not marked done, so a later fix to the assets lets this
      // chapter warm normally instead of staying permanently skipped.
      console.warn(`[chapterPrefetch] skipping ${chapterId}: ${(bytes / 1048576).toFixed(1)} MB exceeds the cap`);
      return;
    }

    await runBatched(images, (url) => Image.prefetch(url, "memory-disk"));
    await runBatched(audio, (url) => prefetchRemoteAudio(url, url, "lessons"));

    await markPrefetched(chapterId);
  } catch {
    // Locked chapter, expired token, no connection — all of them just mean the
    // warm-up did not happen, and the lesson player copes on its own.
  } finally {
    activeChapterId = null;
  }
}

/** Lets a signed-out user's markers be cleared so the next account starts fresh. */
export async function clearChapterPrefetchMarkers() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((key) => key.startsWith("warsh.chapterPrefetched."));
    if (ours.length > 0) await AsyncStorage.multiRemove(ours);
  } catch {
    // Nothing to do — stale markers only cost a skipped warm-up.
  }
}
