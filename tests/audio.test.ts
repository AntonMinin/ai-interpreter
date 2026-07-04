import { describe, expect, it } from 'vitest'
import { encodeWav, generateTone, resample } from '../src/core/audio'

describe('resample', () => {
  it('returns input unchanged for equal rates', () => {
    const input = new Float32Array([0.1, 0.2, 0.3])
    expect(resample(input, 16000, 16000)).toBe(input)
  })

  it('halves length when downsampling 2x', () => {
    const input = new Float32Array(48000)
    const output = resample(input, 48000, 24000)
    expect(output.length).toBe(24000)
  })

  it('preserves a constant signal', () => {
    const input = new Float32Array(1000).fill(0.5)
    const output = resample(input, 48000, 16000)
    for (const sample of output) expect(sample).toBeCloseTo(0.5, 5)
  })
})

describe('encodeWav', () => {
  it('writes a valid RIFF header', () => {
    const wav = encodeWav(new Float32Array(160), 16000)
    const view = new DataView(wav)
    const tag = String.fromCharCode(
      view.getUint8(0),
      view.getUint8(1),
      view.getUint8(2),
      view.getUint8(3)
    )
    expect(tag).toBe('RIFF')
    expect(view.getUint32(24, true)).toBe(16000)
    expect(view.getUint16(22, true)).toBe(1)
    expect(wav.byteLength).toBe(44 + 160 * 2)
  })

  it('clamps samples outside [-1, 1]', () => {
    const wav = encodeWav(new Float32Array([2, -2]), 16000)
    const view = new DataView(wav)
    expect(view.getInt16(44, true)).toBe(0x7fff)
    expect(view.getInt16(46, true)).toBe(-0x8000)
  })
})

describe('generateTone', () => {
  it('produces the requested duration', () => {
    const tone = generateTone([440], 500, 16000)
    expect(tone.length).toBe(8000)
  })

  it('stays within [-1, 1]', () => {
    const tone = generateTone([440, 880], 300, 16000)
    for (const sample of tone) {
      expect(Math.abs(sample)).toBeLessThanOrEqual(1)
    }
  })
})
