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

// Best-effort client key from proxy headers (Vercel sets x-forwarded-for).
export function clientKey(request: Request, scope: string): string {
  const fwd = request.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || "unknown";
  return `${scope}:${ip}`;
}
