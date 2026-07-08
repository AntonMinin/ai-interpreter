import type { PipelineStatus, Settings, TranscriptEntry } from '../../../shared/types'
import { languageName } from '../../../shared/languages'
import type { AudioDevice } from '../audio/devices'
import { useT } from '../i18n'
import { LevelMeter } from './LevelMeter'
import { StatusBadge } from './StatusBadge'
import { TranscriptPanel } from './TranscriptPanel'

interface MainScreenProps {
  settings: Settings
  devices: { inputs: AudioDevice[]; outputs: AudioDevice[] }
  status: PipelineStatus
  error: string | null
  warnings: string[]
  inputLevel: number
  outputActive: boolean
  entries: TranscriptEntry[]
  running: boolean
  busy: boolean
  testResult: string | null
  onToggle(): void
  onTestAudio(): void
  onTestTranslation(): void
  onClearError(): void
}

function deviceLabel(devices: AudioDevice[], deviceId: string, fallback: string): string {
  if (!deviceId || deviceId === 'default') return fallback
  return devices.find((d) => d.deviceId === deviceId)?.label ?? fallback
}

export function MainScreen(props: MainScreenProps): React.JSX.Element {
  const { settings, devices } = props
  const t = useT()

  const modeParts: string[] = []
  if (settings.outbound.enabled) {
    modeParts.push(
      `${languageName(settings.outbound.sourceLanguage)} → ${languageName(settings.outbound.targetLanguage)} (${t('main.voice')})`
    )
  }
  if (settings.inbound.enabled) {
    const extras = [
      settings.inbound.subtitles ? t('main.subtitles') : null,
      settings.inbound.speak ? t('main.voice') : null
    ]
      .filter(Boolean)
      .join(' + ')
    modeParts.push(
      `${languageName(settings.inbound.sourceLanguage)} → ${languageName(settings.inbound.targetLanguage)} (${extras || t('main.off')})`
    )
  }

  return (
    <div className="main-grid">
      <div className="center-column panel">
        <StatusBadge status={props.status} />
        <button
          className={`start-button ${props.running ? 'running' : ''}`}
          onClick={props.onToggle}
          disabled={props.busy}
        >
          {props.busy ? '...' : props.running ? t('main.stop') : t('main.start')}
        </button>
        <div style={{ width: '100%' }}>
          <LevelMeter level={Math.min(1, props.inputLevel * 8)} label={t('main.micInput')} />
          <LevelMeter level={props.outputActive ? 0.85 : 0} label={t('main.translatedOutput')} />
        </div>
        <div style={{ width: '100%' }}>
          <div className="field">
            <label>{t('main.mode')}</label>
            <div>{modeParts.length > 0 ? modeParts.join('  •  ') : t('main.nothingEnabled')}</div>
          </div>
          <div className="field">
            <label>{t('main.microphone')}</label>
            <div>{deviceLabel(devices.inputs, settings.micDeviceId, t('main.systemDefault'))}</div>
          </div>
          <div className="field">
            <label>{t('main.virtualOutput')}</label>
            <div>
              {settings.virtualOutputDeviceId
                ? deviceLabel(
                    devices.outputs,
                    settings.virtualOutputDeviceId,
                    t('main.unknownDevice')
                  )
                : t('main.notSelected')}
            </div>
          </div>
          <div className="field">
            <label>{t('main.monitor')}</label>
            <div>
              {deviceLabel(devices.outputs, settings.monitorDeviceId, t('main.systemDefault'))}
            </div>
          </div>
          {settings.captureMode === 'push-to-talk' && (
            <div className="field">
              <label>{t('main.ptt')}</label>
              <div>{t('main.pttHold', { key: settings.pushToTalkKey })}</div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={props.onTestAudio}>{t('main.testAudio')}</button>
          <button onClick={props.onTestTranslation}>{t('main.testTranslation')}</button>
        </div>
        {props.testResult && <div className="test-result">{props.testResult}</div>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
        <div>
          {props.error && (
            <div className="error-box">
              <span>{props.error}</span>
              <button onClick={props.onClearError}>{t('main.dismiss')}</button>
            </div>
          )}
          {props.warnings.map((warning) => (
            <div key={warning} className="warning-box">
              {warning}
            </div>
          ))}
        </div>
        <div className="panel" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <h2>{t('main.liveTranscript')}</h2>
          <TranscriptPanel entries={props.entries} />
        </div>
      </div>
    </div>
  )
}
