import { describe, expect, it } from 'vitest'
import { computeRms } from '../src/core/segmenter'
import { resample } from '../src/core/audio'

function tone(freq: number, rate: number, samples: number): Float32Array {
  const out = new Float32Array(samples)
  for (let i = 0; i < samples; i++) out[i] = Math.sin((2 * Math.PI * freq * i) / rate)
  return out
}

describe('resample anti-aliasing', () => {
  it('attenuates content above the target Nyquist instead of aliasing it down', () => {
    const above = resample(tone(15000, 48000, 48000), 48000, 16000)
    const inBand = resample(tone(1000, 48000, 48000), 48000, 16000)
    expect(computeRms(above)).toBeLessThan(0.15)
    expect(computeRms(inBand)).toBeGreaterThan(0.5)
  })
})
