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
 * Client address as reported by the platform edge. On Vercel `x-forwarded-for`
 * is set by the proxy, and its first entry is the real client. Falls back to a
 * shared bucket rather than to something spoofable, so a missing header makes
 * the limit stricter instead of bypassing it.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const first = forwarded?.split(',')[0]?.trim()
  return first && first.length > 0 ? first : 'unknown'
}
