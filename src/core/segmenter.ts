export interface SegmenterConfig {
  sampleRate: number
  vadThreshold: number
  minPhraseMs: number
  maxSilenceMs: number
  maxPhraseMs: number
  prerollMs: number
}

export interface SegmenterEvents {
  onSpeechStart?: () => void
  onSpeechEnd?: () => void
  onSegment?: (samples: Float32Array) => void
  onLevel?: (rms: number) => void
}

export function computeRms(frame: Float32Array): number {
  let sum = 0
  for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i]
  return Math.sqrt(sum / frame.length)
}

export class PhraseSegmenter {
  private config: SegmenterConfig
  private events: SegmenterEvents
  private preroll: Float32Array[] = []
  private prerollSamples = 0
  private buffer: Float32Array[] = []
  private bufferSamples = 0
  private inSpeech = false
  private silenceSamples = 0

  constructor(config: SegmenterConfig, events: SegmenterEvents = {}) {
    this.config = config
    this.events = events
  }

  updateConfig(config: Partial<SegmenterConfig>): void {
    this.config = { ...this.config, ...config }
  }

  push(frame: Float32Array): void {
    const rms = computeRms(frame)
    this.events.onLevel?.(rms)
    const { sampleRate, vadThreshold, maxSilenceMs, maxPhraseMs, prerollMs } = this.config
    const voiced = rms >= vadThreshold

    if (!this.inSpeech) {
      this.preroll.push(frame)
      this.prerollSamples += frame.length
      const maxPreroll = (prerollMs / 1000) * sampleRate
      while (this.prerollSamples - (this.preroll[0]?.length ?? 0) >= maxPreroll) {
        this.prerollSamples -= this.preroll.shift()!.length
      }
      if (voiced) {
        this.inSpeech = true
        this.silenceSamples = 0
        this.buffer = [...this.preroll]
        this.bufferSamples = this.prerollSamples
        this.preroll = []
        this.prerollSamples = 0
        this.events.onSpeechStart?.()
      }
      return
    }

    this.buffer.push(frame)
    this.bufferSamples += frame.length

    if (voiced) {
      this.silenceSamples = 0
    } else {
      this.silenceSamples += frame.length
    }

    const silenceMs = (this.silenceSamples / sampleRate) * 1000
    const durationMs = (this.bufferSamples / sampleRate) * 1000

    if (silenceMs >= maxSilenceMs || durationMs >= maxPhraseMs) {
      this.finishSegment()
    }
  }

  flush(): void {
    if (this.inSpeech) this.finishSegment()
  }

  reset(): void {
    this.preroll = []
    this.prerollSamples = 0
    this.buffer = []
    this.bufferSamples = 0
    this.inSpeech = false
    this.silenceSamples = 0
  }

  private finishSegment(): void {
    const { sampleRate, minPhraseMs } = this.config
    const speechSamples = this.bufferSamples - this.silenceSamples
    const speechMs = (speechSamples / sampleRate) * 1000
    const segment = concat(this.buffer, this.bufferSamples)
    this.reset()
    this.events.onSpeechEnd?.()
    if (speechMs >= minPhraseMs) {
      this.events.onSegment?.(segment)
    }
  }
}

function concat(chunks: Float32Array[], total: number): Float32Array {
  const out = new Float32Array(total)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}
