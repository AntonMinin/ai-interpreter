/**
 * Best-effort fixed-window rate limiter, held in the function instance's memory.
 *
 * ponytail: per-instance counters only. A serverless deployment runs several
 * instances and recycles them, so a determined attacker spreading requests
 * across cold starts gets more than `limit` through. This is deliberate: the
 * single-use Turnstile token is the real bot barrier, and this limiter exists
 * to stop one client hammering the endpoint on a warm instance. If abuse
 * actually happens, swap this module for a shared store (Upstash Redis via
 * @upstash/ratelimit is a drop-in) — the call site takes the same shape.
 */

interface Window {
  count: number
  resetAt: number
}

const buckets = new Map<string, Window>()

/** Bound the map so a spray of unique keys cannot grow it without limit. */
const MAX_KEYS = 5_000

function sweep(now: number): void {
  for (const [key, window] of buckets) {
    if (window.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  ok: boolean
  /** Seconds until the current window resets. */
  retryAfter: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_KEYS) sweep(now)
    if (buckets.size >= MAX_KEYS) buckets.clear()
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }

  existing.count += 1
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
  return { ok: existing.count <= limit, retryAfter }
}

/**
 * Bucket key for one client.
 *
 * Prefers the address the adapter resolved (`Astro.clientAddress`), because
 * `x-forwarded-for` is a request header: a client can send its own value, and
 * reading the first entry of it would let anyone pick their own bucket. The
 * header is only a fallback for when the adapter cannot supply an address.
 *
 * With neither available everyone shares one bucket, which makes the limit
 * stricter rather than bypassable — the safe direction to fail in.
 */
export function clientKey(clientAddress: string | undefined, request: Request): string {
  if (clientAddress && clientAddress.length > 0) return clientAddress

  const forwarded = request.headers.get('x-forwarded-for')
  const first = forwarded?.split(',')[0]?.trim()
  return first && first.length > 0 ? first : 'unknown'
}
