import { describe, expect, it } from 'vitest'
import { InterpreterController } from '../src/renderer/src/pipeline/controller'
import { DEFAULT_SETTINGS, type Settings } from '../src/shared/types'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function makeController(settings: Partial<Settings> = {}): {
  controller: InterpreterController
  played: string[]
  transcripts: string[]
  errors: (string | null)[]
  stopped: number
  process: (samples: Float32Array, direction: 'outbound' | 'inbound') => Promise<void>
} {
  const played: string[] = []
  const transcripts: string[] = []
  const errors: (string | null)[] = []
  const result = { stopped: 0 }
  const controller = new InterpreterController(
    { ...DEFAULT_SETTINGS, ...settings },
    {
      onStatus: () => {},
      onError: (message) => errors.push(message),
      onInputLevel: () => {},
      onOutputActive: () => {},
      onTranscript: (entry) => {
        transcripts.push(entry.translatedText)
      },
      onStopped: () => {
        result.stopped++
      }
    }
  )
  const inner = controller as unknown as {
    running: boolean
    outboundPlayer: { enqueue: (base64: string, mime: string) => Promise<void> }
    monitorPlayer: { enqueue: (base64: string, mime: string) => Promise<void> }
    processSegment: (
      samples: Float32Array,
      sampleRate: number,
      direction: 'outbound' | 'inbound'
    ) => Promise<void>
  }
  inner.running = true
  const enqueue = async (base64: string): Promise<void> => {
    played.push(base64)
    await delay(5)
  }
  inner.outboundPlayer.enqueue = enqueue
  inner.monitorPlayer.enqueue = enqueue
  return {
    controller,
    played,
    transcripts,
    errors,
    get stopped() {
      return result.stopped
    },
    process: (samples, direction) => inner.processSegment(samples, 16000, direction)
  }
}

function stubInterpreter(sttDelays: Record<string, number>): void {
  let call = 0
  const phrases = Object.keys(sttDelays)
  ;(globalThis as unknown as { window: unknown }).window = {
    interpreter: {
      transcribe: async () => {
        const phrase = phrases[call++]
        await delay(sttDelays[phrase])
        return phrase
      },
      translate: async (req: { text: string }) => `T:${req.text}`,
      synthesize: async (req: { text: string }) => ({
        audioBase64: req.text,
        mimeType: 'audio/mpeg'
      }),
      log: async () => {}
    }
  }
}

describe('InterpreterController segment ordering', () => {
  it('speaks a slow first phrase before a fast second one', async () => {
    stubInterpreter({ first: 60, second: 1 })
    const { played, transcripts, process } = makeController()

    const a = process(new Float32Array(1600), 'outbound')
    const b = process(new Float32Array(1600), 'outbound')
    await Promise.all([a, b])

    expect(played).toEqual(['T:first', 'T:second'])
    expect(transcripts).toEqual(['T:first', 'T:second'])
  })

  it('keeps the two directions independent', async () => {
    stubInterpreter({ out: 40, in: 1 })
    const { played, process } = makeController({
      inbound: { ...DEFAULT_SETTINGS.inbound, enabled: true, speak: true }
    })

    await Promise.all([
      process(new Float32Array(1600), 'outbound'),
      process(new Float32Array(1600), 'inbound')
    ])

    expect(played).toEqual(['T:in', 'T:out'])
  })

  it('honours inbound.subtitles and inbound.speak', async () => {
    stubInterpreter({ heard: 1 })
    const { played, transcripts, process } = makeController({
      inbound: { ...DEFAULT_SETTINGS.inbound, enabled: true, speak: false, subtitles: false }
    })
    await process(new Float32Array(1600), 'inbound')

    expect(transcripts).toEqual([])
    expect(played).toEqual([])
  })
})

describe('InterpreterController failure breaker', () => {
  function stubFailingStt(): void {
    ;(globalThis as unknown as { window: unknown }).window = {
      interpreter: {
        transcribe: async () => {
          throw new Error('OpenAI API key is invalid. Check it in Settings.')
        },
        translate: async () => '',
        synthesize: async () => ({ audioBase64: '', mimeType: 'audio/mpeg' }),
        log: async () => {}
      }
    }
  }

  it('stops the pipeline after three consecutive failures', async () => {
    stubFailingStt()
    const state = makeController()
    for (let i = 0; i < 3; i++) await state.process(new Float32Array(1600), 'outbound')
    await delay(10)

    expect(state.stopped).toBe(1)
    expect(state.controller.isRunning).toBe(false)
    expect(state.errors.at(-1)).toContain('API key is invalid')
  })

  it('does not stop when failures are interrupted by a success', async () => {
    let call = 0
    ;(globalThis as unknown as { window: unknown }).window = {
      interpreter: {
        transcribe: async () => {
          call++
          if (call === 3) return 'ok'
          throw new Error('transient')
        },
        translate: async (req: { text: string }) => `T:${req.text}`,
        synthesize: async (req: { text: string }) => ({
          audioBase64: req.text,
          mimeType: 'audio/mpeg'
        }),
        log: async () => {}
      }
    }
    const state = makeController()
    for (let i = 0; i < 5; i++) await state.process(new Float32Array(1600), 'outbound')
    await delay(10)

    expect(state.stopped).toBe(0)
    expect(state.controller.isRunning).toBe(true)
  })
})
