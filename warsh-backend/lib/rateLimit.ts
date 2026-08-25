// Lightweight in-process rate limiter.
//
// NOTE: on serverless (Vercel) each instance has its own memory, so this is
// best-effort defense-in-depth against bursts hitting a single instance — it is
// NOT a substitute for a shared store. For strict, cross-instance limits wire up
// Upstash Redis and replace `hit()` below. It still meaningfully raises the cost
// of naive brute-force / email-bomb loops.

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

/**
 * Fixed-window limiter. Returns whether the request is allowed and, if not, how
 * long (seconds) until the window resets.
 */
export function hit(key: string, limit: number, windowMs: number): RateLimitResult {
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
