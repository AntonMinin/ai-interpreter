import type { PipelineStatus, Settings, TranscriptEntry } from '../../../shared/types'
import { languageName } from '../../../shared/languages'
import type { AudioDevice } from '../audio/devices'
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
  const modeParts: string[] = []
  if (settings.outbound.enabled) {
    modeParts.push(
      `${languageName(settings.outbound.sourceLanguage)} → ${languageName(settings.outbound.targetLanguage)} (voice)`
    )
  }
  if (settings.inbound.enabled) {
    const extras = [
      settings.inbound.subtitles ? 'subtitles' : null,
      settings.inbound.speak ? 'voice' : null
    ]
      .filter(Boolean)
      .join(' + ')
    modeParts.push(
      `${languageName(settings.inbound.sourceLanguage)} → ${languageName(settings.inbound.targetLanguage)} (${extras || 'off'})`
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
          {props.busy ? '...' : props.running ? 'Stop' : 'Start'}
        </button>
        <div style={{ width: '100%' }}>
          <LevelMeter level={Math.min(1, props.inputLevel * 8)} label="Microphone input" />
          <LevelMeter level={props.outputActive ? 0.85 : 0} label="Translated output" />
        </div>
        <div style={{ width: '100%' }}>
          <div className="field">
            <label>Mode</label>
            <div>{modeParts.length > 0 ? modeParts.join('  •  ') : 'Nothing enabled'}</div>
          </div>
          <div className="field">
            <label>Microphone</label>
            <div>{deviceLabel(devices.inputs, settings.micDeviceId, 'System default')}</div>
          </div>
          <div className="field">
            <label>Virtual microphone output</label>
            <div>
              {settings.virtualOutputDeviceId
                ? deviceLabel(devices.outputs, settings.virtualOutputDeviceId, 'Unknown device')
                : 'Not selected'}
            </div>
          </div>
          <div className="field">
            <label>Your speakers / headphones</label>
            <div>{deviceLabel(devices.outputs, settings.monitorDeviceId, 'System default')}</div>
          </div>
          {settings.captureMode === 'push-to-talk' && (
            <div className="field">
              <label>Push-to-talk</label>
              <div>
                Hold <code>{settings.pushToTalkKey}</code> while speaking
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={props.onTestAudio}>Test audio</button>
          <button onClick={props.onTestTranslation}>Test translation</button>
        </div>
        {props.testResult && <div className="test-result">{props.testResult}</div>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
        <div>
          {props.error && (
            <div className="error-box">
              <span>{props.error}</span>
              <button onClick={props.onClearError}>Dismiss</button>
            </div>
          )}
          {props.warnings.map((warning) => (
            <div key={warning} className="warning-box">
              {warning}
            </div>
          ))}
        </div>
        <div className="panel" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <h2>Live transcript</h2>
          <TranscriptPanel entries={props.entries} />
        </div>
      </div>
    </div>
  )
}
