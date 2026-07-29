import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipc'
import type {
  KeyStatus,
  KeyTestResult,
  MainDiagnostics,
  ProviderId,
  Settings,
  SynthesizeRequest,
  SynthesizeResult,
  TranscribeRequest,
  TranslateRequest
} from '../shared/types'

export interface InterpreterApi {
  getSettings(): Promise<Settings>
  updateSettings(patch: Partial<Settings>): Promise<Settings>
  getKeyStatus(): Promise<KeyStatus>
  setApiKey(provider: 'openai' | 'anthropic', key: string): Promise<KeyStatus>
  testApiKey(provider: ProviderId): Promise<KeyTestResult>
  transcribe(request: TranscribeRequest): Promise<string>
  translate(request: TranslateRequest): Promise<string>
  synthesize(request: SynthesizeRequest): Promise<SynthesizeResult>
  mainDiagnostics(): Promise<MainDiagnostics>
  log(level: 'info' | 'warn' | 'error' | 'debug', message: string): Promise<void>
  getLogPath(): Promise<string>
  clearLogs(): Promise<void>
  openExternal(url: string): Promise<void>
  registerHotkey(accelerator: string): Promise<boolean>
  onToggleMute(handler: () => void): () => void
}

const api: InterpreterApi = {
  getSettings: () => ipcRenderer.invoke(IPC.getSettings),
  updateSettings: (patch) => ipcRenderer.invoke(IPC.updateSettings, patch),
  getKeyStatus: () => ipcRenderer.invoke(IPC.getKeyStatus),
  setApiKey: (provider, key) => ipcRenderer.invoke(IPC.setApiKey, provider, key),
  testApiKey: (provider) => ipcRenderer.invoke(IPC.testApiKey, provider),
  transcribe: (request) => ipcRenderer.invoke(IPC.transcribe, request),
  translate: (request) => ipcRenderer.invoke(IPC.translate, request),
  synthesize: (request) => ipcRenderer.invoke(IPC.synthesize, request),
  mainDiagnostics: () => ipcRenderer.invoke(IPC.mainDiagnostics),
  log: (level, message) => ipcRenderer.invoke(IPC.log, level, message),
  getLogPath: () => ipcRenderer.invoke(IPC.getLogPath),
  clearLogs: () => ipcRenderer.invoke(IPC.clearLogs),
  openExternal: (url) => ipcRenderer.invoke(IPC.openExternal, url),
  registerHotkey: (accelerator) => ipcRenderer.invoke(IPC.registerHotkey, accelerator),
  onToggleMute: (handler) => {
    const listener = (): void => handler()
    ipcRenderer.on(IPC.hotkeyToggleMute, listener)
    return () => ipcRenderer.removeListener(IPC.hotkeyToggleMute, listener)
  }
}

contextBridge.exposeInMainWorld('interpreter', api)
