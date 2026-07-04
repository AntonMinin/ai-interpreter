import type { ProviderId } from '../../shared/types'
import { getSettings } from '../settings'
import { AnthropicProvider } from './anthropic'
import { MockProvider } from './mock'
import { OpenAiProvider } from './openai'
import {
  ProviderError,
  type KeyValidator,
  type SttProvider,
  type TranslationProvider,
  type TtsProvider
} from './types'

const openai = new OpenAiProvider(getSettings)
const anthropic = new AnthropicProvider(getSettings)
const mock = new MockProvider()

export function sttProvider(id: ProviderId): SttProvider {
  if (id === 'openai') return openai
  if (id === 'mock') return mock
  throw new ProviderError(`Provider "${id}" does not support speech recognition.`)
}

export function translationProvider(id: ProviderId): TranslationProvider {
  if (id === 'openai') return openai
  if (id === 'anthropic') return anthropic
  return mock
}

export function ttsProvider(id: ProviderId): TtsProvider {
  if (id === 'openai') return openai
  if (id === 'mock') return mock
  throw new ProviderError(`Provider "${id}" does not support speech synthesis.`)
}

export function keyValidator(id: ProviderId): KeyValidator {
  if (id === 'openai') return openai
  if (id === 'anthropic') return anthropic
  return mock
}
