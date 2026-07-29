import { describe, expect, it } from 'vitest'
import { clampSettings, DEFAULT_SETTINGS, type Settings } from '../src/shared/types'

function withPatch(patch: Partial<Settings>): Settings {
  return clampSettings({ ...DEFAULT_SETTINGS, ...patch })
}

describe('clampSettings', () => {
  it('keeps a zero maxPhraseMs from turning every frame into a segment', () => {
    const settings = withPatch({ maxPhraseMs: 0 })
    expect(settings.maxPhraseMs).toBeGreaterThan(settings.minPhraseMs)
  })

  it('rejects a maxPhraseMs below minPhraseMs', () => {
    const settings = withPatch({ minPhraseMs: 3000, maxPhraseMs: 2000 })
    expect(settings.maxPhraseMs).toBeGreaterThan(3000)
  })

  it('clamps out-of-range values into the allowed window', () => {
    expect(withPatch({ vadThreshold: -5 }).vadThreshold).toBe(0.001)
    expect(withPatch({ vadThreshold: 99 }).vadThreshold).toBe(0.2)
    expect(withPatch({ maxSilenceMs: 10 }).maxSilenceMs).toBe(150)
    expect(withPatch({ minPhraseMs: 999999 }).minPhraseMs).toBe(5000)
  })

  it('falls back to defaults for non-numeric junk', () => {
    const settings = withPatch({ vadThreshold: NaN, maxSilenceMs: 'abc' as unknown as number })
    expect(settings.vadThreshold).toBe(DEFAULT_SETTINGS.vadThreshold)
    expect(settings.maxSilenceMs).toBe(DEFAULT_SETTINGS.maxSilenceMs)
  })

  it('leaves sane values untouched', () => {
    expect(withPatch({})).toEqual(DEFAULT_SETTINGS)
  })
})
