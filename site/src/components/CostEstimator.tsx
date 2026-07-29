import { useMemo, useState } from 'preact/hooks'

interface Props {
  minutesLabel: string
  directionLabel: string
  resultLabel: string
  perMeetingLabel: string
  disclaimer: string
  locale: 'en' | 'ru'
}

/**
 * Rough per-minute-of-speech cost, in USD, for one direction:
 * speech recognition + translation of the transcript + voice synthesis.
 * Derived from published list prices at an ordinary speaking rate
 * (~150 words/min). Deliberately rounded up — better to over-quote.
 */
const USD_PER_SPOKEN_MINUTE = 0.021

export default function CostEstimator({
  minutesLabel,
  directionLabel,
  resultLabel,
  perMeetingLabel,
  disclaimer,
  locale
}: Props) {
  const [minutes, setMinutes] = useState(10)
  const [bothWays, setBothWays] = useState(false)

  const total = useMemo(() => {
    const directions = bothWays ? 2 : 1
    return minutes * USD_PER_SPOKEN_MINUTE * directions
  }, [minutes, bothWays])

  const formatted = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(total),
    [total, locale]
  )

  return (
    <div class="rounded-2xl border border-edge bg-panel p-6 sm:p-8">
      <div class="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
        <div class="space-y-6">
          <div>
            <label
              for="cost-minutes"
              class="flex items-baseline justify-between text-sm font-medium"
            >
              <span>{minutesLabel}</span>
              <span class="font-mono text-base text-accent">{minutes}</span>
            </label>
            <input
              id="cost-minutes"
              type="range"
              min={1}
              max={60}
              step={1}
              value={minutes}
              onInput={(event) => setMinutes(Number(event.currentTarget.value))}
              class="mt-3 w-full accent-accent"
            />
          </div>

          <div class="flex items-center gap-3">
            <input
              id="cost-both"
              type="checkbox"
              checked={bothWays}
              onChange={(event) => setBothWays(event.currentTarget.checked)}
              class="h-4 w-4 accent-accent"
            />
            <label for="cost-both" class="text-sm">
              {directionLabel}
            </label>
          </div>
        </div>

        <div class="rounded-xl border border-edge bg-panel-2 px-8 py-6 text-center">
          <div class="text-xs uppercase tracking-wider text-muted">{resultLabel}</div>
          <div
            class="mt-1 font-mono text-4xl font-semibold text-accent"
            aria-live="polite"
            aria-atomic="true"
          >
            {formatted}
          </div>
          <div class="mt-1 text-xs text-muted">{perMeetingLabel}</div>
        </div>
      </div>

      <p class="mt-6 border-t border-edge pt-5 text-xs leading-relaxed text-muted">{disclaimer}</p>
    </div>
  )
}
