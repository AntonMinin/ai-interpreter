export type ProviderId = 'openai' | 'anthropic' | 'mock'

export type CaptureMode = 'auto' | 'push-to-talk'

export interface DirectionSettings {
  enabled: boolean
  sourceLanguage: string
  targetLanguage: string
}

export interface Settings {
  onboardingComplete: boolean
  interfaceLanguage: string
  outbound: DirectionSettings
  inbound: DirectionSettings & { speak: boolean; subtitles: boolean }
  micDeviceId: string
  monitorDeviceId: string
  virtualOutputDeviceId: string
  captureMode: CaptureMode
  pushToTalkKey: string
  vadThreshold: number
  minPhraseMs: number
  maxSilenceMs: number
  maxPhraseMs: number
  noiseSuppression: boolean
  sttProvider: ProviderId
  translationProvider: ProviderId
  ttsProvider: ProviderId
  anthropicModel: string
  openaiSttModel: string
  openaiTranslationModel: string
  openaiTtsModel: string
  openaiTtsVoice: string
  testPhrase: string
  debugMode: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  onboardingComplete: false,
  interfaceLanguage: 'en',
  outbound: { enabled: true, sourceLanguage: 'ru', targetLanguage: 'en' },
  inbound: {
    enabled: false,
    sourceLanguage: 'en',
    targetLanguage: 'ru',
    speak: false,
    subtitles: true
  },
  micDeviceId: 'default',
  monitorDeviceId: 'default',
  virtualOutputDeviceId: '',
  captureMode: 'auto',
  pushToTalkKey: 'Space',
  vadThreshold: 0.012,
  minPhraseMs: 400,
  maxSilenceMs: 700,
  maxPhraseMs: 12000,
  noiseSuppression: true,
  sttProvider: 'openai',
  translationProvider: 'openai',
  ttsProvider: 'openai',
  anthropicModel: 'claude-opus-4-8',
  openaiSttModel: 'gpt-4o-mini-transcribe',
  openaiTranslationModel: 'gpt-4o-mini',
  openaiTtsModel: 'gpt-4o-mini-tts',
  openaiTtsVoice: 'alloy',
  testPhrase: 'Привет! Это проверка перевода.',
  debugMode: false
}

export type PipelineStatus =
  | 'stopped'
  | 'ready'
  | 'listening'
  | 'transcribing'
  | 'translating'
  | 'speaking'
  | 'error'

export type TranscriptDirection = 'outbound' | 'inbound'

export interface TranscriptEntry {
  id: string
  direction: TranscriptDirection
  sourceLanguage: string
  targetLanguage: string
  sourceText: string
  translatedText: string
  timestamp: number
}

export interface KeyStatus {
  openai: boolean
  anthropic: boolean
}

export interface KeyTestResult {
  ok: boolean
  message: string
}

export interface TranscribeRequest {
  wavBase64: string
  language: string
}

export interface TranslateRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
}

export interface SynthesizeRequest {
  text: string
  language: string
}

export interface SynthesizeResult {
  audioBase64: string
  mimeType: string
}

export type DiagnosticStatus = 'ok' | 'warning' | 'error'

export interface DiagnosticItem {
  id: string
  label: string
  status: DiagnosticStatus
  message: string
  action?: string
}

export interface MainDiagnostics {
  items: DiagnosticItem[]
}

export interface PipelineError {
  stage: 'capture' | 'stt' | 'translation' | 'tts' | 'playback' | 'config'
  message: string
}
