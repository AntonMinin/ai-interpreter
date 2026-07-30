import type { APIRoute } from 'astro'
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TURNSTILE_SECRET_KEY } from 'astro:env/server'
import { clientKey, rateLimit } from '../../lib/rateLimit'

export const prerender = false

/** Cloudflare's documented always-passes test pair, for local development only. */
const TEST_SECRET = '1x0000000000000000000000000000000AA'

const LIMIT = 3
const WINDOW_MS = 10 * 60 * 1000

const MAX_MESSAGE = 4000
const MIN_MESSAGE = 10
const MAX_CONTACT = 200
const MAX_BODY_BYTES = 16 * 1024

const KINDS = ['question', 'suggestion', 'bug'] as const
type Kind = (typeof KINDS)[number]

type Reason =
  | 'rate_limited'
  | 'captcha_failed'
  | 'invalid'
  | 'too_long'
  | 'too_short'
  | 'server_misconfigured'
  | 'delivery_failed'

function fail(reason: Reason, status: number, retryAfter?: number): Response {
  return new Response(JSON.stringify({ ok: false, reason }), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      ...(retryAfter ? { 'retry-after': String(retryAfter) } : {})
    }
  })
}

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  const body = new FormData()
  body.append('secret', secret)
  body.append('response', token)
  if (ip !== 'unknown') body.append('remoteip', ip)

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(10_000)
    })
    if (!response.ok) return false
    const result = (await response.json()) as { success?: boolean }
    return result.success === true
  } catch {
    return false
  }
}

/** Telegram sendMessage with parse_mode omitted, so message text is never parsed as markup. */
async function sendToTelegram(token: string, chatId: string, text: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(10_000)
    })
    return response.ok
  } catch {
    return false
  }
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Secrets come from astro:env/server, declared in astro.config.mjs. They are
  // read at runtime rather than inlined at build time, so a key rotated in the
  // Vercel dashboard applies without a redeploy. import.meta.env.DEV is a
  // build-time flag, which is what it should be.
  const isDev = import.meta.env.DEV === true

  const turnstileSecret = TURNSTILE_SECRET_KEY || (isDev ? TEST_SECRET : '')
  const botToken = TELEGRAM_BOT_TOKEN
  const chatId = TELEGRAM_CHAT_ID

  if (!turnstileSecret || !botToken || !chatId) {
    console.error(
      '[feedback] missing configuration:',
      [
        !turnstileSecret && 'TURNSTILE_SECRET_KEY',
        !botToken && 'TELEGRAM_BOT_TOKEN',
        !chatId && 'TELEGRAM_CHAT_ID'
      ]
        .filter(Boolean)
        .join(', ')
    )
    return fail('server_misconfigured', 500)
  }

  const ip = clientKey(clientAddress, request)

  // Rate limit before touching the captcha or Telegram, so a flood costs us
  // nothing downstream.
  const limit = rateLimit(ip, LIMIT, WINDOW_MS)
  if (!limit.ok) return fail('rate_limited', 429, limit.retryAfter)

  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) return fail('too_long', 413)

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(raw) as Record<string, unknown>
  } catch {
    return fail('invalid', 400)
  }

  const token = str(payload.token)
  const message = str(payload.message)
  const contact = str(payload.contact).slice(0, MAX_CONTACT)
  const kind: Kind = KINDS.includes(payload.kind as Kind) ? (payload.kind as Kind) : 'suggestion'
  const locale = str(payload.locale) === 'ru' ? 'ru' : 'en'

  if (!token) return fail('captcha_failed', 400)
  if (message.length < MIN_MESSAGE) return fail('too_short', 400)
  if (message.length > MAX_MESSAGE) return fail('too_long', 400)

  if (!(await verifyTurnstile(token, turnstileSecret, ip))) {
    return fail('captcha_failed', 403)
  }

  const label = { question: 'Вопрос', suggestion: 'Предложение', bug: 'Баг' }[kind]
  const text = [
    `${label} · ${locale}`,
    '',
    message,
    '',
    contact ? `Связь: ${contact}` : 'Связь: не указана'
  ].join('\n')

  if (!(await sendToTelegram(botToken, chatId, text))) {
    console.error('[feedback] telegram delivery failed')
    return fail('delivery_failed', 502)
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  })
}

/** Anything other than POST gets a clear answer instead of the framework's default. */
export const ALL: APIRoute = () =>
  new Response(JSON.stringify({ ok: false, reason: 'invalid' }), {
    status: 405,
    headers: { 'content-type': 'application/json', allow: 'POST' }
  })
