import { ipcMain, shell } from 'electron'
import { IPC } from '../shared/ipc'
import type {
  DiagnosticItem,
  KeyTestResult,
  MainDiagnostics,
  ProviderId,
  Settings,
  SynthesizeRequest,
  SynthesizeResult,
  TranscribeRequest,
  TranslateRequest
} from '../shared/types'
import { clearLogs, getLogPath, log } from './logger'
import { keyValidator, sttProvider, translationProvider, ttsProvider } from './providers/registry'
import { toUserMessage } from './providers/types'
import { getSecret, secretStatus, setSecret } from './secrets'
import { getSettings, updateSettings } from './settings'

function wrapError(error: unknown, fallback: string): never {
  const message = toUserMessage(error, fallback)
  log('error', `${fallback}: ${error instanceof Error ? error.message : String(error)}`)
  throw new Error(message)
}

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC.getSettings, (): Settings => getSettings())

  ipcMain.handle(IPC.updateSettings, (_event, patch: Partial<Settings>): Settings => {
    return updateSettings(patch)
  })

  ipcMain.handle(IPC.getKeyStatus, () => secretStatus())

  ipcMain.handle(IPC.setApiKey, (_event, provider: 'openai' | 'anthropic', key: string) => {
    setSecret(provider, key)
    return secretStatus()
  })

  ipcMain.handle(
    IPC.testApiKey,
    async (_event, provider: ProviderId): Promise<KeyTestResult> => {
      return keyValidator(provider).testKey()
    }
  )

  ipcMain.handle(IPC.transcribe, async (_event, request: TranscribeRequest): Promise<string> => {
    const settings = getSettings()
    try {
      const wav = Buffer.from(request.wavBase64, 'base64')
      return await sttProvider(settings.sttProvider).transcribe(wav, request.language)
    } catch (error) {
      wrapError(error, 'Speech recognition failed')
    }
  })

  ipcMain.handle(IPC.translate, async (_event, request: TranslateRequest): Promise<string> => {
    const settings = getSettings()
    try {
      return await translationProvider(settings.translationProvider).translate(
        request.text,
        request.sourceLanguage,
        request.targetLanguage
      )
    } catch (error) {
      wrapError(error, 'Translation failed')
    }
  })

  ipcMain.handle(
    IPC.synthesize,
    async (_event, request: SynthesizeRequest): Promise<SynthesizeResult> => {
      const settings = getSettings()
      try {
        return await ttsProvider(settings.ttsProvider).synthesize(request.text, request.language)
      } catch (error) {
        wrapError(error, 'Speech synthesis failed')
      }
    }
  )

  ipcMain.handle(IPC.mainDiagnostics, async (): Promise<MainDiagnostics> => {
    return runMainDiagnostics()
  })

  ipcMain.handle(IPC.log, (_event, level: 'info' | 'warn' | 'error' | 'debug', message: string) => {
    const settings = getSettings()
    if (level === 'debug' && !settings.debugMode) return
    log(level, `[renderer] ${message}`)
  })

  ipcMain.handle(IPC.getLogPath, () => getLogPath())
  ipcMain.handle(IPC.clearLogs, () => clearLogs())
  ipcMain.handle(IPC.openExternal, (_event, url: string) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url)
  })
}

async function runMainDiagnostics(): Promise<MainDiagnostics> {
  const settings = getSettings()
  const items: DiagnosticItem[] = []

  const usesMock =
    settings.sttProvider === 'mock' &&
    settings.translationProvider === 'mock' &&
    settings.ttsProvider === 'mock'

  if (usesMock) {
    items.push({
      id: 'provider',
      label: 'AI provider',
      status: 'warning',
      message: 'Mock provider is active. No real translation will happen.',
      action: 'Select a real provider in Settings when you are ready.'
    })
    return { items }
  }

  const needsOpenAi =
    settings.sttProvider === 'openai' ||
    settings.translationProvider === 'openai' ||
    settings.ttsProvider === 'openai'
  const needsAnthropic = settings.translationProvider === 'anthropic'

  try {
    await fetch('https://api.openai.com/v1', { method: 'HEAD' })
    items.push({ id: 'internet', label: 'Internet connection', status: 'ok', message: 'Online.' })
  } catch {
    items.push({
      id: 'internet',
      label: 'Internet connection',
      status: 'error',
      message: 'No internet connection detected.',
      action: 'Check your network. Cloud translation needs internet access.'
    })
  }

  if (needsOpenAi) {
    if (!getSecret('openai')) {
      items.push({
        id: 'openai-key',
        label: 'OpenAI API key',
        status: 'error',
        message: 'OpenAI API key is not set.',
        action: 'Open Settings and paste your OpenAI API key.'
      })
    } else {
      const result = await keyValidator('openai').testKey()
      items.push({
        id: 'openai-key',
        label: 'OpenAI API key',
        status: result.ok ? 'ok' : 'error',
        message: result.message,
        action: result.ok ? undefined : 'Check the key in Settings.'
      })
    }
  }

  if (needsAnthropic) {
    if (!getSecret('anthropic')) {
      items.push({
        id: 'anthropic-key',
        label: 'Anthropic API key',
        status: 'error',
        message: 'Anthropic API key is not set.',
        action: 'Open Settings and paste your Anthropic API key.'
      })
    } else {
      const result = await keyValidator('anthropic').testKey()
      items.push({
        id: 'anthropic-key',
        label: 'Anthropic API key',
        status: result.ok ? 'ok' : 'error',
        message: result.message,
        action: result.ok ? undefined : 'Check the key in Settings.'
      })
    }
  }

  return { items }
}
