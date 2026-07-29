import type { KeyTestResult, SynthesizeResult } from '../../shared/types'
import { languageName } from '../../shared/languages'
import { encodeWav, generateTone } from '../../core/audio'
import { log } from '../logger'
import type { KeyValidator, SttProvider, TranslationProvider, TtsProvider } from './types'

const SAMPLE_PHRASES: Record<string, string[]> = {
  ru: [
    'Привет! Это тестовая фраза от мок-провайдера.',
    'Вторая фраза, чтобы был виден порядок.',
    'Третья фраза подряд.'
  ],
  en: [
    'Hello! This is a test phrase from the mock provider.',
    'Second phrase, so the ordering is visible.',
    'Third phrase in a row.'
  ]
}

const KNOWN_TRANSLATIONS: Record<string, string> = {
  'привет! это проверка перевода.': 'Hi! This is a translation check.',
  'привет! это тестовая фраза от мок-провайдера.':
    'Hello! This is a test phrase from the mock provider.',
  'вторая фраза, чтобы был виден порядок.': 'Second phrase, so the ordering is visible.',
  'третья фраза подряд.': 'Third phrase in a row.',
  'second phrase, so the ordering is visible.': 'Вторая фраза, чтобы был виден порядок.',
  'third phrase in a row.': 'Третья фраза подряд.',
  'hello! this is a test phrase from the mock provider.':
    'Привет! Это тестовая фраза от мок-провайдера.'
}

export class MockProvider implements SttProvider, TranslationProvider, TtsProvider, KeyValidator {
  private counter = 0

  async transcribe(wav: Buffer, language: string): Promise<string> {
    await delay(250)
    const seconds = Math.max(0, (wav.length - 44) / 2 / 16000)
    log('debug', `Mock STT received ${seconds.toFixed(2)}s of ${language} audio`)
    const phrases = SAMPLE_PHRASES[language]
    if (!phrases) return `Mock transcript in ${languageName(language)} (${seconds.toFixed(1)}s).`
    return phrases[this.counter++ % phrases.length]
  }

  async translate(text: string, _sourceLanguage: string, targetLanguage: string): Promise<string> {
    await delay(250)
    const known = KNOWN_TRANSLATIONS[text.trim().toLowerCase()]
    if (known) return known
    return `[${targetLanguage}] ${text}`
  }

  async synthesize(text: string): Promise<SynthesizeResult> {
    await delay(250)
    const tones = [523, 659, 784].slice(0, Math.max(1, Math.min(3, Math.ceil(text.length / 20))))
    const samples = generateTone(tones, 900, 24000)
    const wav = encodeWav(samples, 24000)
    return { audioBase64: Buffer.from(wav).toString('base64'), mimeType: 'audio/wav' }
  }

  async testKey(): Promise<KeyTestResult> {
    return { ok: true, message: 'err.mockNoKey' }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
