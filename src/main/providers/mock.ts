import type { KeyTestResult, SynthesizeResult } from '../../shared/types'
import { languageName } from '../../shared/languages'
import { encodeWav, generateTone } from '../../core/audio'
import type { KeyValidator, SttProvider, TranslationProvider, TtsProvider } from './types'

const SAMPLE_PHRASES: Record<string, string> = {
  ru: 'Привет! Это тестовая фраза от мок-провайдера.',
  en: 'Hello! This is a test phrase from the mock provider.'
}

const KNOWN_TRANSLATIONS: Record<string, string> = {
  'привет! это проверка перевода.': 'Hi! This is a translation check.',
  'hello! this is a test phrase from the mock provider.':
    'Привет! Это тестовая фраза от мок-провайдера.'
}

export class MockProvider implements SttProvider, TranslationProvider, TtsProvider, KeyValidator {
  async transcribe(_wav: Buffer, language: string): Promise<string> {
    await delay(250)
    return SAMPLE_PHRASES[language] ?? `Mock transcript in ${languageName(language)}.`
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
    return { ok: true, message: 'Mock provider needs no API key.' }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
