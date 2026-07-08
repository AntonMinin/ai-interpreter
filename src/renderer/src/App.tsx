import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyStatus, PipelineStatus, Settings, TranscriptEntry } from '../../shared/types'
import { arrayBufferToBase64, encodeWav, generateTone } from '../../core/audio'
import { findVirtualCable, listDevices, type AudioDevice } from './audio/devices'
import { I18nContext, makeT, normalizeUiLanguage } from './i18n'
import { InterpreterController } from './pipeline/controller'
import { DiagnosticsScreen } from './components/DiagnosticsScreen'
import { MainScreen } from './components/MainScreen'
import { OnboardingWizard } from './components/OnboardingWizard'
import { SettingsScreen } from './components/SettingsScreen'

type Screen = 'main' | 'settings' | 'diagnostics' | 'onboarding'

const MAX_TRANSCRIPT_ENTRIES = 100

export function App(): React.JSX.Element {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [keyStatus, setKeyStatus] = useState<KeyStatus>({ openai: false, anthropic: false })
  const [devices, setDevices] = useState<{ inputs: AudioDevice[]; outputs: AudioDevice[] }>({
    inputs: [],
    outputs: []
  })
  const [screen, setScreen] = useState<Screen>('main')
  const [status, setStatus] = useState<PipelineStatus>('stopped')
  const [error, setError] = useState<string | null>(null)
  const [inputLevel, setInputLevel] = useState(0)
  const [outputActive, setOutputActive] = useState(false)
  const [entries, setEntries] = useState<TranscriptEntry[]>([])
  const [running, setRunning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const controllerRef = useRef<InterpreterController | null>(null)

  const uiLanguage = normalizeUiLanguage(settings?.interfaceLanguage ?? 'en')
  const t = makeT(uiLanguage)

  const refreshDevices = useCallback(async (): Promise<void> => {
    setDevices(await listDevices())
  }, [])

  useEffect(() => {
    void (async () => {
      const loaded = await window.interpreter.getSettings()
      setSettings(loaded)
      setKeyStatus(await window.interpreter.getKeyStatus())
      await refreshDevices()
      if (!loaded.onboardingComplete) setScreen('onboarding')

      controllerRef.current = new InterpreterController(loaded, {
        onStatus: setStatus,
        onError: setError,
        onInputLevel: setInputLevel,
        onOutputActive: setOutputActive,
        onTranscript: (entry) =>
          setEntries((prev) => [entry, ...prev].slice(0, MAX_TRANSCRIPT_ENTRIES))
      })
    })()
    navigator.mediaDevices.addEventListener('devicechange', refreshDevices)
    return () => navigator.mediaDevices.removeEventListener('devicechange', refreshDevices)
  }, [refreshDevices])

  useEffect(() => {
    if (!settings) return undefined
    const handleKey = (down: boolean) => (event: KeyboardEvent) => {
      if (settings.captureMode !== 'push-to-talk') return
      if (event.code === settings.pushToTalkKey && !event.repeat) {
        if ((event.target as HTMLElement)?.tagName === 'INPUT') return
        event.preventDefault()
        controllerRef.current?.setPttDown(down)
      }
    }
    const onDown = handleKey(true)
    const onUp = handleKey(false)
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [settings])

  const updateSettings = useCallback(async (patch: Partial<Settings>): Promise<void> => {
    const next = await window.interpreter.updateSettings(patch)
    setSettings(next)
    controllerRef.current?.updateSettings(next)
  }, [])

  const saveKey = useCallback(async (provider: 'openai' | 'anthropic', key: string) => {
    setKeyStatus(await window.interpreter.setApiKey(provider, key))
  }, [])

  async function toggleRunning(): Promise<void> {
    const controller = controllerRef.current
    if (!controller || busy) return
    setBusy(true)
    setTestResult(null)
    try {
      if (controller.isRunning) {
        await controller.stop()
        setRunning(false)
      } else {
        controller.clearError()
        await controller.start()
        setRunning(true)
      }
    } catch {
      setRunning(false)
    } finally {
      setBusy(false)
    }
  }

  async function testAudio(): Promise<void> {
    if (!settings) return
    setTestResult(t('test.playingTone'))
    const wav = encodeWav(generateTone([523, 659, 784], 1200, 24000), 24000)
    const base64 = arrayBufferToBase64(wav)
    const controller = controllerRef.current
    try {
      await controller?.playTestTone('monitor', base64, 'audio/wav')
      if (settings.virtualOutputDeviceId) {
        await controller?.playTestTone('virtual', base64, 'audio/wav')
        setTestResult(t('test.toneBoth'))
      } else {
        setTestResult(t('test.toneMonitorOnly'))
      }
    } catch (err) {
      setTestResult(err instanceof Error ? err.message : t('test.audioFailed'))
    }
  }

  async function testTranslation(): Promise<void> {
    if (!settings) return
    setTestResult(t('test.translating'))
    try {
      const result = await window.interpreter.translate({
        text: settings.testPhrase,
        sourceLanguage: settings.outbound.sourceLanguage,
        targetLanguage: settings.outbound.targetLanguage
      })
      setTestResult(`"${settings.testPhrase}" → "${result}"`)
    } catch (err) {
      setTestResult(err instanceof Error ? err.message : t('test.translationFailed'))
    }
  }

  if (!settings) {
    return <div className="screen">{t('app.loading')}</div>
  }

  const warnings: string[] = []
  const cable = findVirtualCable(devices.outputs)
  if (settings.outbound.enabled && !cable) {
    warnings.push(t('warn.noCable'))
  }
  if (settings.outbound.enabled && cable && !settings.virtualOutputDeviceId) {
    warnings.push(t('warn.cableNotSelected', { label: cable.label }))
  }
  const needsOpenAi =
    settings.sttProvider === 'openai' ||
    settings.translationProvider === 'openai' ||
    settings.ttsProvider === 'openai'
  if (needsOpenAi && !keyStatus.openai) {
    warnings.push(t('warn.noOpenAiKey'))
  }
  if (settings.translationProvider === 'anthropic' && !keyStatus.anthropic) {
    warnings.push(t('warn.noAnthropicKey'))
  }
  if (settings.translationProvider === 'mock') {
    warnings.push(t('warn.mockActive'))
  }

  return (
    <I18nContext.Provider value={uiLanguage}>
      <header className="app-header">
        <h1>AI Interpreter</h1>
        <nav className="nav">
          <button onClick={() => setScreen('main')} disabled={screen === 'main'}>
            {t('nav.home')}
          </button>
          <button onClick={() => setScreen('settings')} disabled={screen === 'settings'}>
            {t('nav.settings')}
          </button>
          <button onClick={() => setScreen('diagnostics')} disabled={screen === 'diagnostics'}>
            {t('nav.diagnostics')}
          </button>
        </nav>
      </header>
      <main className="screen">
        {screen === 'onboarding' && (
          <OnboardingWizard
            settings={settings}
            keyStatus={keyStatus}
            devices={devices}
            onChange={(patch) => void updateSettings(patch)}
            onSaveKey={saveKey}
            onRefreshDevices={refreshDevices}
            onFinish={() => {
              void updateSettings({ onboardingComplete: true })
              setScreen('main')
            }}
          />
        )}
        {screen === 'main' && (
          <MainScreen
            settings={settings}
            devices={devices}
            status={status}
            error={error}
            warnings={warnings}
            inputLevel={inputLevel}
            outputActive={outputActive}
            entries={entries}
            running={running}
            busy={busy}
            testResult={testResult}
            onToggle={() => void toggleRunning()}
            onTestAudio={() => void testAudio()}
            onTestTranslation={() => void testTranslation()}
            onClearError={() => controllerRef.current?.clearError()}
          />
        )}
        {screen === 'settings' && (
          <SettingsScreen
            settings={settings}
            keyStatus={keyStatus}
            devices={devices}
            onChange={(patch) => void updateSettings(patch)}
            onSaveKey={saveKey}
            onRefreshDevices={() => void refreshDevices()}
          />
        )}
        {screen === 'diagnostics' && <DiagnosticsScreen settings={settings} />}
      </main>
    </I18nContext.Provider>
  )
}
