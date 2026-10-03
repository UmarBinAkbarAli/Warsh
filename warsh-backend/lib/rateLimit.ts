// Rate limiter backed by one Postgres row per key, with an in-process fallback
// for local tests and for a database that cannot be reached.
//
// The in-process path is best-effort only: on serverless (Vercel) each instance
// has its own memory, so the effective ceiling is `limit x concurrent
// instances` and every deploy resets the counters. It is NOT a real limit for a
// production auth endpoint — most importantly POST /api/admin/session, which
// guards a single shared secret with no second factor — so it is only the
// fallback, never the default. Set RATE_LIMIT_STORE=memory to force it (tests).
//
// The shared path is a fixed window: one atomic upsert per hit either opens a
// new window or increments the open one, so concurrent instances agree without
// any locking. Redis (Upstash) used to back this; every limited route is a
// low-volume auth or Noor endpoint, so the extra write is not worth a vendor.
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

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

const useMemoryOnly = process.env.RATE_LIMIT_STORE === "memory";

// Expired rows are only ever read to be overwritten, so they are harmless; this
// just keeps the table from growing. Roughly one hit in a hundred sweeps.
const SWEEP_ONE_IN = 100;

interface BucketRow {
  count: number;
  retryAfterSeconds: number;
}

async function hitDatabase(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const rows = await prisma.$queryRaw<BucketRow[]>(Prisma.sql`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
    VALUES (${key}, 1, now() + ${windowMs} * interval '1 millisecond')
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."resetAt" <= now() THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= now()
        THEN now() + ${windowMs} * interval '1 millisecond'
        ELSE "RateLimitBucket"."resetAt" END
    RETURNING "count",
      CEIL(EXTRACT(EPOCH FROM ("resetAt" - now())))::int AS "retryAfterSeconds"
  `);

  if (Math.random() * SWEEP_ONE_IN < 1) {
    void prisma
      .$executeRaw`DELETE FROM "RateLimitBucket" WHERE "resetAt" < now() - interval '1 hour'`
      .catch(() => undefined);
  }

  const row = rows[0];
  if (!row || Number(row.count) <= limit) return { allowed: true, retryAfterSeconds: 0 };
  return { allowed: false, retryAfterSeconds: Math.max(1, Number(row.retryAfterSeconds)) };
}

/**
 * Consumes one unit against `key`. Returns whether the request is allowed and,
 * if not, how long (seconds) until capacity frees up.
 */
export async function hit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (useMemoryOnly) return hitInMemory(key, limit, windowMs);

  try {
    return await hitDatabase(key, limit, windowMs);
  } catch (error) {
    // The database being unreachable must not take authentication down with it.
    // Fall back to the in-process limiter rather than failing open entirely.
    console.error("[rate-limit] database unavailable, falling back to in-process limiter:", error);
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
