import type { KeyTestResult, Settings, SynthesizeResult } from '../../shared/types'
import { languageName } from '../../shared/languages'
import { getSecret } from '../secrets'
import { log } from '../logger'
import {
  ProviderError,
  type KeyValidator,
  type SttProvider,
  type TranslationProvider,
  type TtsProvider
} from './types'

const BASE_URL = 'https://api.openai.com/v1'
const REQUEST_TIMEOUT_MS = 30000

async function post(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new ProviderError('err.openaiTimeout')
    }
    throw new ProviderError('err.openaiUnreachable')
  }
}

function requireKey(): string {
  const key = getSecret('openai')
  if (!key) {
    throw new ProviderError('err.openaiKeyMissing')
  }
  return key
}

async function raiseForStatus(response: Response, what: string): Promise<void> {
  if (response.ok) return
  const body = await response.text().catch(() => '')
  log('error', `OpenAI ${what} failed: HTTP ${response.status} ${body.slice(0, 300)}`)
  if (response.status === 401) {
    throw new ProviderError('err.openaiKeyInvalid')
  }
  if (response.status === 429) {
    throw new ProviderError('err.openaiRateLimit')
  }
  throw new ProviderError('err.openaiFailed')
}

export class OpenAiProvider implements SttProvider, TranslationProvider, TtsProvider, KeyValidator {
  constructor(private readonly settings: () => Settings) {}

  async transcribe(wav: Buffer, language: string): Promise<string> {
    const key = requireKey()
    const form = new FormData()
    form.append('file', new Blob([new Uint8Array(wav)], { type: 'audio/wav' }), 'audio.wav')
    form.append('model', this.settings().openaiSttModel)
    form.append('language', language)
    const response = await post(
      `${BASE_URL}/audio/transcriptions`,
      { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form }
    )
    await raiseForStatus(response, 'transcription')
    const data = (await response.json()) as { text?: string }
    return (data.text ?? '').trim()
  }

  async translate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    const key = requireKey()
    const response = await post(
      `${BASE_URL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.settings().openaiTranslationModel,
          messages: [
            {
              role: 'system',
              content:
                `You are a professional simultaneous interpreter. Translate the user's message from ` +
                `${languageName(sourceLanguage)} to ${languageName(targetLanguage)}. ` +
                `Preserve tone and meaning. Output only the translation, nothing else.`
            },
            { role: 'user', content: text }
          ],
          temperature: 0.2
        })
      }
    )
    await raiseForStatus(response, 'translation')
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    return (data.choices?.[0]?.message?.content ?? '').trim()
  }

  async synthesize(text: string): Promise<SynthesizeResult> {
    const key = requireKey()
    const settings = this.settings()
    const response = await post(
      `${BASE_URL}/audio/speech`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: settings.openaiTtsModel,
          voice: settings.openaiTtsVoice,
          input: text,
          response_format: 'mp3'
        })
      }
    )
    await raiseForStatus(response, 'speech synthesis')
    const audio = Buffer.from(await response.arrayBuffer())
    return { audioBase64: audio.toString('base64'), mimeType: 'audio/mpeg' }
  }

  async testKey(): Promise<KeyTestResult> {
    const key = getSecret('openai')
    if (!key) return { ok: false, message: 'err.openaiKeyNotSet' }
    try {
      const response = await fetch(`${BASE_URL}/models`, {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(10000)
      })
      if (response.status === 401) return { ok: false, message: 'err.openaiKeyInvalidShort' }
      if (!response.ok) return { ok: false, message: 'err.openaiFailed' }
      return { ok: true, message: 'err.openaiKeyValid' }
    } catch {
      return { ok: false, message: 'err.openaiUnreachable' }
    }
  }
}
