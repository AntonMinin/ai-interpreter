import { useEffect, useRef, useState } from 'preact/hooks'

type Kind = 'question' | 'suggestion' | 'bug'
type Status = 'idle' | 'sending' | 'sent' | 'error'

interface Props {
  locale: 'en' | 'ru'
  siteKey: string
  labels: {
    kind: string
    kindQuestion: string
    kindSuggestion: string
    kindBug: string
    message: string
    messagePlaceholder: string
    contact: string
    contactHint: string
    submit: string
    sending: string
    sentTitle: string
    sentBody: string
    sendAnother: string
    captchaPending: string
    counter: string
    errRateLimited: string
    errCaptcha: string
    errTooShort: string
    errTooLong: string
    errServer: string
    errNetwork: string
    privacyNote: string
  }
}

const MAX = 4000
const MIN = 10

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string
      reset: (id?: string) => void
    }
    onTurnstileReady?: () => void
  }
}

const SCRIPT_ID = 'cf-turnstile-script'

export default function FeedbackForm({ locale, siteKey, labels }: Props) {
  const [kind, setKind] = useState<Kind>('suggestion')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState('')

  const captchaBox = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)

  // Load the Turnstile script once, on mount, and render the widget when ready.
  useEffect(() => {
    let cancelled = false

    const render = () => {
      if (cancelled || !captchaBox.current || !window.turnstile || widgetId.current) return
      widgetId.current = window.turnstile.render(captchaBox.current, {
        sitekey: siteKey,
        theme: 'dark',
        language: locale,
        callback: (value: string) => setToken(value),
        'expired-callback': () => setToken(''),
        'error-callback': () => setToken('')
      })
    }

    if (window.turnstile) {
      render()
    } else if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      script.addEventListener('load', render)
      document.head.appendChild(script)
    } else {
      document.getElementById(SCRIPT_ID)?.addEventListener('load', render)
    }

    return () => {
      cancelled = true
    }
  }, [siteKey, locale])

  const tooShort = message.trim().length > 0 && message.trim().length < MIN
  const canSubmit = message.trim().length >= MIN && token !== '' && status !== 'sending'

  async function submit(event: Event) {
    event.preventDefault()
    if (!canSubmit) return

    setStatus('sending')
    setError(null)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind, message: message.trim(), contact: contact.trim(), token, locale })
      })

      if (response.ok) {
        setStatus('sent')
        setMessage('')
        setContact('')
        return
      }

      const body = (await response.json().catch(() => ({}))) as { reason?: string }
      const map: Record<string, string> = {
        rate_limited: labels.errRateLimited,
        captcha_failed: labels.errCaptcha,
        too_short: labels.errTooShort,
        too_long: labels.errTooLong
      }
      setError(map[body.reason ?? ''] ?? labels.errServer)
      setStatus('error')
    } catch {
      setError(labels.errNetwork)
      setStatus('error')
    } finally {
      // The token is single-use: Cloudflare rejects a replay, so a new
      // challenge is required for every attempt, successful or not.
      setToken('')
      window.turnstile?.reset(widgetId.current ?? undefined)
    }
  }

  if (status === 'sent') {
    return (
      <div class="rounded-2xl border border-accent/40 bg-accent-dim/10 p-8 text-center" role="status">
        <svg
          viewBox="0 0 24 24"
          class="mx-auto h-10 w-10 text-accent"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l2.5 2.5L16 9.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <h3 class="mt-4 text-lg font-semibold">{labels.sentTitle}</h3>
        <p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{labels.sentBody}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          class="mt-6 rounded-xl border border-edge bg-panel px-5 py-2.5 text-sm font-semibold transition-colors hover:border-muted"
        >
          {labels.sendAnother}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} class="rounded-2xl border border-edge bg-panel p-6 sm:p-8" novalidate>
      <fieldset disabled={status === 'sending'} class="space-y-6">
        <div>
          <span class="mb-2 block text-sm font-medium">{labels.kind}</span>
          <div class="flex flex-wrap gap-2" role="radiogroup" aria-label={labels.kind}>
            {(
              [
                ['suggestion', labels.kindSuggestion],
                ['question', labels.kindQuestion],
                ['bug', labels.kindBug]
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={kind === value}
                onClick={() => setKind(value)}
                class={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                  kind === value
                    ? 'border-accent bg-accent-dim/20 font-medium text-fg'
                    : 'border-edge bg-panel-2 text-muted hover:text-fg'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label for="fb-message" class="mb-2 block text-sm font-medium">
            {labels.message}
          </label>
          <textarea
            id="fb-message"
            required
            rows={6}
            maxLength={MAX}
            value={message}
            onInput={(event) => setMessage(event.currentTarget.value)}
            placeholder={labels.messagePlaceholder}
            aria-describedby="fb-counter"
            class="w-full resize-y rounded-lg border border-edge bg-panel-2 px-3.5 py-3 text-sm leading-relaxed text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
          <div id="fb-counter" class="mt-1.5 text-right text-xs text-muted">
            {labels.counter.replace('{n}', String(message.length)).replace('{max}', String(MAX))}
          </div>
        </div>

        <div>
          <label for="fb-contact" class="mb-2 block text-sm font-medium">
            {labels.contact}
          </label>
          <input
            id="fb-contact"
            type="text"
            maxLength={200}
            value={contact}
            onInput={(event) => setContact(event.currentTarget.value)}
            autocomplete="email"
            class="w-full rounded-lg border border-edge bg-panel-2 px-3.5 py-2.5 text-sm text-fg focus:border-accent focus:outline-none"
          />
          <p class="mt-1.5 text-xs text-muted">{labels.contactHint}</p>
        </div>

        <div>
          <div ref={captchaBox} class="min-h-[65px]" />
          {!token && <p class="text-xs text-muted">{labels.captchaPending}</p>}
        </div>

        {error && (
          <p class="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm" role="alert">
            {error}
          </p>
        )}
        {tooShort && !error && <p class="text-sm text-warn">{labels.errTooShort}</p>}

        <div class="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={!canSubmit}
            class="rounded-xl border border-accent bg-accent-dim px-6 py-3 font-semibold text-white transition-colors hover:bg-accent hover:text-ink disabled:cursor-not-allowed disabled:border-edge disabled:bg-panel-2 disabled:text-muted"
          >
            {status === 'sending' ? labels.sending : labels.submit}
          </button>
          <p class="text-xs leading-relaxed text-muted">{labels.privacyNote}</p>
        </div>
      </fieldset>
    </form>
  )
}
