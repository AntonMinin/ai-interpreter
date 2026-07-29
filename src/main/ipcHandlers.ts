import { BrowserWindow, globalShortcut, ipcMain, shell } from 'electron'
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
      wrapError(error, 'err.sttFailed')
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
      wrapError(error, 'err.translateFailed')
    }
  })

  ipcMain.handle(
    IPC.synthesize,
    async (_event, request: SynthesizeRequest): Promise<SynthesizeResult> => {
      const settings = getSettings()
      try {
        return await ttsProvider(settings.ttsProvider).synthesize(request.text, request.language)
      } catch (error) {
        wrapError(error, 'err.ttsFailed')
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

  ipcMain.handle(IPC.registerHotkey, (_event, accelerator: string): boolean => {
    return registerMuteHotkey(accelerator)
  })
}

let currentHotkey: string | null = null

export function registerMuteHotkey(accelerator: string): boolean {
  if (currentHotkey) {
    globalShortcut.unregister(currentHotkey)
    currentHotkey = null
  }
  if (!accelerator) return true
  try {
    const ok = globalShortcut.register(accelerator, () => {
      for (const window of BrowserWindow.getAllWindows()) {
        window.webContents.send(IPC.hotkeyToggleMute)
      }
    })
    if (ok) currentHotkey = accelerator
    else log('warn', `Global hotkey "${accelerator}" is already taken by another app.`)
    return ok
  } catch (error) {
    log('warn', `Global hotkey "${accelerator}" is invalid: ${String(error)}`)
    return false
  }
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
      status: 'warning',
      labelKey: 'diag.provider',
      messageKey: 'diag.providerMock',
      actionKey: 'diag.providerMockAction'
    })
    return { items }
  }

  const needsOpenAi =
    settings.sttProvider === 'openai' ||
    settings.translationProvider === 'openai' ||
    settings.ttsProvider === 'openai'
  const needsAnthropic = settings.translationProvider === 'anthropic'

  try {
    await fetch('https://api.openai.com/v1', {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000)
    })
    items.push({
      id: 'internet',
      status: 'ok',
      labelKey: 'diag.internet',
      messageKey: 'diag.internetOk'
    })
  } catch {
    items.push({
      id: 'internet',
      status: 'error',
      labelKey: 'diag.internet',
      messageKey: 'diag.internetFail',
      actionKey: 'diag.internetAction'
    })
  }

  for (const provider of ['openai', 'anthropic'] as const) {
    if (provider === 'openai' ? !needsOpenAi : !needsAnthropic) continue
    const labelKey = `diag.${provider}Key`
    if (!getSecret(provider)) {
      items.push({
        id: `${provider}-key`,
        status: 'error',
        labelKey,
        messageKey: `diag.${provider}KeyMissing`,
        actionKey: `diag.${provider}KeyAction`
      })
      continue
    }
    const result = await keyValidator(provider).testKey()
    items.push({
      id: `${provider}-key`,
      status: result.ok ? 'ok' : 'error',
      labelKey,
      messageKey: result.message,
      actionKey: result.ok ? undefined : 'diag.keyCheckAction'
    })
  }

  return { items }
}
