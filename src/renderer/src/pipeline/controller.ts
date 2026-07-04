import { arrayBufferToBase64, encodeWav, resample } from '../../../core/audio'
import { PhraseSegmenter } from '../../../core/segmenter'
import {
  deriveStatus,
  initialPipelineState,
  reducePipeline,
  type PipelineEvent,
  type PipelineState
} from '../../../core/stateMachine'
import type { PipelineStatus, Settings, TranscriptEntry } from '../../../shared/types'
import { LoopbackCapture, MicCapture } from '../audio/capture'
import { AudioQueuePlayer } from '../audio/player'

const TARGET_SAMPLE_RATE = 16000

export interface ControllerCallbacks {
  onStatus(status: PipelineStatus): void
  onError(message: string | null): void
  onInputLevel(rms: number): void
  onOutputActive(active: boolean): void
  onTranscript(entry: TranscriptEntry): void
}

export class InterpreterController {
  private settings: Settings
  private callbacks: ControllerCallbacks
  private state: PipelineState = initialPipelineState
  private mic = new MicCapture()
  private loopback = new LoopbackCapture()
  private outboundSegmenter: PhraseSegmenter | null = null
  private inboundSegmenter: PhraseSegmenter | null = null
  private outboundPlayer: AudioQueuePlayer
  private monitorPlayer: AudioQueuePlayer
  private pttDown = false
  private running = false
  private entryCounter = 0

  constructor(settings: Settings, callbacks: ControllerCallbacks) {
    this.settings = settings
    this.callbacks = callbacks
    this.outboundPlayer = new AudioQueuePlayer(
      () => this.settings.virtualOutputDeviceId,
      (playing) => {
        this.dispatch({ type: playing ? 'PLAYBACK_START' : 'PLAYBACK_END' })
        this.callbacks.onOutputActive(playing || this.monitorPlayer.playing)
      }
    )
    this.monitorPlayer = new AudioQueuePlayer(
      () => this.settings.monitorDeviceId,
      (playing) => {
        this.callbacks.onOutputActive(playing || this.outboundPlayer.playing)
      }
    )
  }

  updateSettings(settings: Settings): void {
    this.settings = settings
    const segmenterConfig = {
      vadThreshold: settings.vadThreshold,
      minPhraseMs: settings.minPhraseMs,
      maxSilenceMs: settings.maxSilenceMs,
      maxPhraseMs: settings.maxPhraseMs
    }
    this.outboundSegmenter?.updateConfig(segmenterConfig)
    this.inboundSegmenter?.updateConfig(segmenterConfig)
  }

  setPttDown(down: boolean): void {
    if (this.pttDown === down) return
    this.pttDown = down
    if (!down) this.outboundSegmenter?.flush()
  }

  get isRunning(): boolean {
    return this.running
  }

  async start(): Promise<void> {
    if (this.running) return
    this.running = true
    this.dispatch({ type: 'START' })
    try {
      if (this.settings.outbound.enabled) await this.startOutbound()
      if (this.settings.inbound.enabled) await this.startInbound()
    } catch (error) {
      this.running = false
      await this.shutdownCapture()
      this.dispatch({ type: 'STOP' })
      this.fail('capture', error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  async stop(): Promise<void> {
    if (!this.running) return
    this.running = false
    await this.shutdownCapture()
    this.outboundPlayer.stop()
    this.monitorPlayer.stop()
    this.dispatch({ type: 'STOP' })
  }

  private async shutdownCapture(): Promise<void> {
    await this.mic.stop()
    await this.loopback.stop()
    this.outboundSegmenter = null
    this.inboundSegmenter = null
  }

  private async startOutbound(): Promise<void> {
    const settings = this.settings
    let sampleRate = 48000
    this.outboundSegmenter = new PhraseSegmenter(
      {
        sampleRate,
        vadThreshold: settings.vadThreshold,
        minPhraseMs: settings.minPhraseMs,
        maxSilenceMs: settings.maxSilenceMs,
        maxPhraseMs: settings.maxPhraseMs,
        prerollMs: 300
      },
      {
        onLevel: (rms) => this.callbacks.onInputLevel(rms),
        onSpeechStart: () => this.dispatch({ type: 'SPEECH_START' }),
        onSpeechEnd: () => this.dispatch({ type: 'SPEECH_END' }),
        onSegment: (samples) => {
          void this.processSegment(samples, sampleRate, 'outbound')
        }
      }
    )
    await this.mic.start(settings.micDeviceId, settings.noiseSuppression, (frame, rate) => {
      sampleRate = rate
      this.outboundSegmenter?.updateConfig({ sampleRate: rate })
      if (this.settings.captureMode === 'push-to-talk' && !this.pttDown) {
        this.callbacks.onInputLevel(0)
        return
      }
      this.outboundSegmenter?.push(frame)
    })
  }

  private async startInbound(): Promise<void> {
    const settings = this.settings
    let sampleRate = 48000
    this.inboundSegmenter = new PhraseSegmenter(
      {
        sampleRate,
        vadThreshold: settings.vadThreshold,
        minPhraseMs: settings.minPhraseMs,
        maxSilenceMs: settings.maxSilenceMs,
        maxPhraseMs: settings.maxPhraseMs,
        prerollMs: 300
      },
      {
        onSegment: (samples) => {
          void this.processSegment(samples, sampleRate, 'inbound')
        }
      }
    )
    await this.loopback.start((frame, rate) => {
      sampleRate = rate
      this.inboundSegmenter?.updateConfig({ sampleRate: rate })
      if (this.monitorPlayer.playing) return
      this.inboundSegmenter?.push(frame)
    })
  }

  private async processSegment(
    samples: Float32Array,
    sampleRate: number,
    direction: 'outbound' | 'inbound'
  ): Promise<void> {
    if (!this.running) return
    const config =
      direction === 'outbound'
        ? this.settings.outbound
        : this.settings.inbound
    const wav = encodeWav(resample(samples, sampleRate, TARGET_SAMPLE_RATE), TARGET_SAMPLE_RATE)
    const wavBase64 = arrayBufferToBase64(wav)

    let sourceText = ''
    this.dispatch({ type: 'STT_START' })
    try {
      sourceText = await window.interpreter.transcribe({
        wavBase64,
        language: config.sourceLanguage
      })
    } catch (error) {
      this.fail('stt', error instanceof Error ? error.message : 'Speech recognition failed.')
      return
    } finally {
      this.dispatch({ type: 'STT_END' })
    }
    if (!sourceText || !this.running) return

    let translatedText = ''
    this.dispatch({ type: 'TRANSLATE_START' })
    try {
      translatedText = await window.interpreter.translate({
        text: sourceText,
        sourceLanguage: config.sourceLanguage,
        targetLanguage: config.targetLanguage
      })
    } catch (error) {
      this.fail('translation', error instanceof Error ? error.message : 'Translation failed.')
      return
    } finally {
      this.dispatch({ type: 'TRANSLATE_END' })
    }
    if (!translatedText || !this.running) return

    this.callbacks.onTranscript({
      id: `t${Date.now()}-${this.entryCounter++}`,
      direction,
      sourceLanguage: config.sourceLanguage,
      targetLanguage: config.targetLanguage,
      sourceText,
      translatedText,
      timestamp: Date.now()
    })

    const shouldSpeak =
      direction === 'outbound' || (direction === 'inbound' && this.settings.inbound.speak)
    if (!shouldSpeak) return

    this.dispatch({ type: 'TTS_START' })
    let audio: { audioBase64: string; mimeType: string }
    try {
      audio = await window.interpreter.synthesize({
        text: translatedText,
        language: config.targetLanguage
      })
    } catch (error) {
      this.fail('tts', error instanceof Error ? error.message : 'Speech synthesis failed.')
      return
    } finally {
      this.dispatch({ type: 'TTS_END' })
    }
    if (!this.running) return

    const player = direction === 'outbound' ? this.outboundPlayer : this.monitorPlayer
    try {
      await player.enqueue(audio.audioBase64, audio.mimeType)
    } catch (error) {
      this.fail('playback', error instanceof Error ? error.message : 'Audio playback failed.')
    }
  }

  async playTestTone(target: 'virtual' | 'monitor', audioBase64: string, mime: string): Promise<void> {
    const player = target === 'virtual' ? this.outboundPlayer : this.monitorPlayer
    await player.enqueue(audioBase64, mime)
  }

  private fail(stage: string, message: string): void {
    void window.interpreter.log('error', `[${stage}] ${message}`)
    this.dispatch({ type: 'ERROR', message })
  }

  clearError(): void {
    this.dispatch({ type: 'CLEAR_ERROR' })
  }

  private dispatch(event: PipelineEvent): void {
    this.state = reducePipeline(this.state, event)
    this.callbacks.onStatus(deriveStatus(this.state))
    if (event.type === 'ERROR') this.callbacks.onError(event.message)
    if (event.type === 'CLEAR_ERROR') this.callbacks.onError(null)
  }
}
