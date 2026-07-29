import Anthropic from '@anthropic-ai/sdk'
import type { KeyTestResult, Settings } from '../../shared/types'
import { languageName } from '../../shared/languages'
import { getSecret } from '../secrets'
import { log } from '../logger'
import { ProviderError, type KeyValidator, type TranslationProvider } from './types'

function client(): Anthropic {
  const key = getSecret('anthropic')
  if (!key) {
    throw new ProviderError('err.anthropicKeyMissing')
  }
  return new Anthropic({ apiKey: key, timeout: 30000, maxRetries: 1 })
}

export class AnthropicProvider implements TranslationProvider, KeyValidator {
  constructor(private readonly settings: () => Settings) {}

  async translate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    const anthropic = client()
    try {
      const response = await anthropic.messages.create({
        model: this.settings().anthropicModel,
        max_tokens: 2048,
        system:
          `You are a professional simultaneous interpreter. Translate the user's message from ` +
          `${languageName(sourceLanguage)} to ${languageName(targetLanguage)}. ` +
          `Preserve tone and meaning. Output only the translation, nothing else.`,
        messages: [{ role: 'user', content: text }]
      })
      if (response.stop_reason === 'refusal') {
        throw new ProviderError('err.providerRefused')
      }
      const block = response.content.find((b) => b.type === 'text')
      return block && block.type === 'text' ? block.text.trim() : ''
    } catch (error) {
      if (error instanceof ProviderError) throw error
      if (error instanceof Anthropic.AuthenticationError) {
        throw new ProviderError('err.anthropicKeyInvalid')
      }
      if (error instanceof Anthropic.RateLimitError) {
        throw new ProviderError('err.anthropicRateLimit')
      }
      if (error instanceof Anthropic.APIConnectionError) {
        throw new ProviderError('err.anthropicUnreachable')
      }
      log('error', `Anthropic translation failed: ${String(error)}`)
      throw new ProviderError('err.anthropicFailed')
    }
  }

  async testKey(): Promise<KeyTestResult> {
    if (!getSecret('anthropic')) return { ok: false, message: 'err.anthropicKeyNotSet' }
    try {
      await client().models.list()
      return { ok: true, message: 'err.anthropicKeyValid' }
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        return { ok: false, message: 'err.anthropicKeyInvalidShort' }
      }
      if (error instanceof Anthropic.APIConnectionError) {
        return { ok: false, message: 'err.anthropicUnreachable' }
      }
      return { ok: false, message: 'err.anthropicCheckFailed' }
    }
  }
}
