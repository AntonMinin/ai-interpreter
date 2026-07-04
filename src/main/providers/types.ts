import type { KeyTestResult, SynthesizeResult } from '../../shared/types'

export interface SttProvider {
  transcribe(wav: Buffer, language: string): Promise<string>
}

export interface TranslationProvider {
  translate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string>
}

export interface TtsProvider {
  synthesize(text: string, language: string): Promise<SynthesizeResult>
}

export interface KeyValidator {
  testKey(): Promise<KeyTestResult>
}

export class ProviderError extends Error {
  readonly userMessage: string

  constructor(userMessage: string, detail?: string) {
    super(detail ?? userMessage)
    this.userMessage = userMessage
  }
}

export function toUserMessage(error: unknown, fallback: string): string {
  if (error instanceof ProviderError) return error.userMessage
  if (error instanceof Error && /fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT/i.test(error.message)) {
    return 'No internet connection, or the AI provider is unreachable.'
  }
  return fallback
}
