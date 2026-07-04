import { describe, expect, it } from 'vitest'
import { computeRms, PhraseSegmenter, type SegmenterConfig } from '../src/core/segmenter'

const SAMPLE_RATE = 16000
const FRAME_SIZE = 320

const config: SegmenterConfig = {
  sampleRate: SAMPLE_RATE,
  vadThreshold: 0.01,
  minPhraseMs: 200,
  maxSilenceMs: 300,
  maxPhraseMs: 5000,
  prerollMs: 100
}

function loudFrame(): Float32Array {
  const frame = new Float32Array(FRAME_SIZE)
  for (let i = 0; i < frame.length; i++) frame[i] = Math.sin(i / 3) * 0.5
  return frame
}

function silentFrame(): Float32Array {
  return new Float32Array(FRAME_SIZE)
}

function feed(segmenter: PhraseSegmenter, frame: () => Float32Array, ms: number): void {
  const frames = Math.ceil((ms / 1000) * SAMPLE_RATE / FRAME_SIZE)
  for (let i = 0; i < frames; i++) segmenter.push(frame())
}

describe('computeRms', () => {
  it('is zero for silence and positive for signal', () => {
    expect(computeRms(silentFrame())).toBe(0)
    expect(computeRms(loudFrame())).toBeGreaterThan(0.3)
  })
})

describe('PhraseSegmenter', () => {
  it('emits a segment after speech followed by silence', () => {
    const segments: Float32Array[] = []
    const segmenter = new PhraseSegmenter(config, { onSegment: (s) => segments.push(s) })
    feed(segmenter, loudFrame, 600)
    feed(segmenter, silentFrame, 400)
    expect(segments).toHaveLength(1)
    const durationMs = (segments[0].length / SAMPLE_RATE) * 1000
    expect(durationMs).toBeGreaterThanOrEqual(600)
  })

  it('ignores segments shorter than minPhraseMs', () => {
    const segments: Float32Array[] = []
    const segmenter = new PhraseSegmenter(config, { onSegment: (s) => segments.push(s) })
    feed(segmenter, loudFrame, 100)
    feed(segmenter, silentFrame, 400)
    expect(segments).toHaveLength(0)
  })

  it('does not emit while speech continues', () => {
    const segments: Float32Array[] = []
    const segmenter = new PhraseSegmenter(config, { onSegment: (s) => segments.push(s) })
    feed(segmenter, loudFrame, 2000)
    expect(segments).toHaveLength(0)
  })

  it('force-splits phrases at maxPhraseMs', () => {
    const segments: Float32Array[] = []
    const segmenter = new PhraseSegmenter(config, { onSegment: (s) => segments.push(s) })
    feed(segmenter, loudFrame, 11000)
    expect(segments.length).toBeGreaterThanOrEqual(2)
  })

  it('fires speech start/end callbacks', () => {
    const log: string[] = []
    const segmenter = new PhraseSegmenter(config, {
      onSpeechStart: () => log.push('start'),
      onSpeechEnd: () => log.push('end')
    })
    feed(segmenter, loudFrame, 500)
    feed(segmenter, silentFrame, 400)
    expect(log).toEqual(['start', 'end'])
  })

  it('flush emits the pending segment', () => {
    const segments: Float32Array[] = []
    const segmenter = new PhraseSegmenter(config, { onSegment: (s) => segments.push(s) })
    feed(segmenter, loudFrame, 500)
    segmenter.flush()
    expect(segments).toHaveLength(1)
  })

  it('includes preroll audio before detected speech', () => {
    const segments: Float32Array[] = []
    const segmenter = new PhraseSegmenter(config, { onSegment: (s) => segments.push(s) })
    feed(segmenter, silentFrame, 500)
    feed(segmenter, loudFrame, 400)
    feed(segmenter, silentFrame, 400)
    expect(segments).toHaveLength(1)
    const durationMs = (segments[0].length / SAMPLE_RATE) * 1000
    expect(durationMs).toBeGreaterThan(450)
  })
})
