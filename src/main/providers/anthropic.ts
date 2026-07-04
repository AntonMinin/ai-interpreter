import Anthropic from '@anthropic-ai/sdk'
import type { KeyTestResult, Settings } from '../../shared/types'
import { languageName } from '../../shared/languages'
import { getSecret } from '../secrets'
import { log } from '../logger'
import { ProviderError, type KeyValidator, type TranslationProvider } from './types'

function client(): Anthropic {
  const key = getSecret('anthropic')
  if (!key) {
    throw new ProviderError('Anthropic API key is not set. Add it in Settings.')
  }
  return new Anthropic({ apiKey: key })
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
        throw new ProviderError('The translation request was declined by the provider.')
      }
      const block = response.content.find((b) => b.type === 'text')
      return block && block.type === 'text' ? block.text.trim() : ''
    } catch (error) {
      if (error instanceof ProviderError) throw error
      if (error instanceof Anthropic.AuthenticationError) {
        throw new ProviderError('Anthropic API key is invalid. Check it in Settings.')
      }
      if (error instanceof Anthropic.RateLimitError) {
        throw new ProviderError('Anthropic rate limit reached. Wait a moment and try again.')
      }
      if (error instanceof Anthropic.APIConnectionError) {
        throw new ProviderError('Could not reach Anthropic. Check your internet connection.')
      }
      log('error', `Anthropic translation failed: ${String(error)}`)
      throw new ProviderError('Anthropic translation failed.')
    }
  }

  async testKey(): Promise<KeyTestResult> {
    if (!getSecret('anthropic')) return { ok: false, message: 'No Anthropic API key set.' }
    try {
      await client().models.list()
      return { ok: true, message: 'Anthropic API key is valid.' }
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        return { ok: false, message: 'Anthropic API key is invalid.' }
      }
      if (error instanceof Anthropic.APIConnectionError) {
        return { ok: false, message: 'Could not reach Anthropic. Check your internet connection.' }
      }
      return { ok: false, message: 'Anthropic key check failed.' }
    }
  }
}
