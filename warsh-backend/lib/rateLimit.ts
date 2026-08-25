// Rate limiter with a shared Redis backing store when configured, and an
// in-process fallback when it is not.
//
// The in-process path is best-effort only: on serverless (Vercel) each instance
// has its own memory, so the effective ceiling is `limit x concurrent
// instances` and every deploy resets the counters. That is fine for local dev
// and acceptable as a floor, but it is NOT a real limit for a production auth
// endpoint — most importantly POST /api/admin/session, which guards a single
// shared secret with no second factor.
//
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to get true
// cross-instance limits. Nothing else needs to change: `hit()` keeps the same
// signature and transparently upgrades.
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the map can't grow unbounded.
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

function hitInMemory(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// One Ratelimit instance per (limit, window) pair, built lazily and reused so
// the sliding-window script is only registered once per shape.
const limiters = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const id = `${limit}:${windowMs}`;
  let limiter = limiters.get(id);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      prefix: `warsh-rl:${id}`,
      analytics: false,
    });
    limiters.set(id, limiter);
  }
  return limiter;
}

/**
 * Consumes one unit against `key`. Returns whether the request is allowed and,
 * if not, how long (seconds) until capacity frees up.
 */
export async function hit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (!redis) return hitInMemory(key, limit, windowMs);

  try {
    const { success, reset } = await getLimiter(limit, windowMs).limit(key);
    return {
      allowed: success,
      retryAfterSeconds: success ? 0 : Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (error) {
    // Redis being unreachable must not take authentication down with it. Fall
    // back to the in-process limiter rather than failing open entirely.
    console.error("[rate-limit] Redis unavailable, falling back to in-process limiter:", error);
    return hitInMemory(key, limit, windowMs);
  }
}

// Client key from proxy headers. Prefer x-real-ip: the Vercel edge sets it from
// the actual TCP peer and a caller cannot forge it. Fall back to the RIGHTMOST
// x-forwarded-for entry, which is the hop appended by our own trusted proxy —
// never the leftmost, which is whatever the caller chose to send and would let
// an attacker mint a fresh bucket per request.
export function clientKey(request: Request, scope: string): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return `${scope}:${realIp}`;

  const parts = (request.headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const ip = parts[parts.length - 1] || "unknown";
  return `${scope}:${ip}`;
}
