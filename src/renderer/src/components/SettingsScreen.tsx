import { useState } from 'react'
import type { KeyStatus, ProviderId, Settings } from '../../../shared/types'
import { LANGUAGES } from '../../../shared/languages'
import type { AudioDevice } from '../audio/devices'

interface SettingsScreenProps {
  settings: Settings
  keyStatus: KeyStatus
  devices: { inputs: AudioDevice[]; outputs: AudioDevice[] }
  onChange(patch: Partial<Settings>): void
  onSaveKey(provider: 'openai' | 'anthropic', key: string): Promise<void>
  onRefreshDevices(): void
}

function LanguageSelect({
  value,
  onChange
}: {
  value: string
  onChange(code: string): void
}): React.JSX.Element {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name} ({lang.nativeName})
        </option>
      ))}
    </select>
  )
}

function DeviceSelect({
  value,
  devices,
  allowDefault,
  onChange
}: {
  value: string
  devices: AudioDevice[]
  allowDefault: boolean
  onChange(deviceId: string): void
}): React.JSX.Element {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {allowDefault && <option value="default">System default</option>}
      {!allowDefault && <option value="">Not selected</option>}
      {devices.map((device) => (
        <option key={device.deviceId} value={device.deviceId}>
          {device.label}
        </option>
      ))}
    </select>
  )
}

export function SettingsScreen(props: SettingsScreenProps): React.JSX.Element {
  const { settings, devices, keyStatus } = props
  const [openaiKey, setOpenaiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [keyMessage, setKeyMessage] = useState<string | null>(null)

  const set = props.onChange

  async function saveKey(provider: 'openai' | 'anthropic', value: string): Promise<void> {
    await props.onSaveKey(provider, value)
    setKeyMessage(`${provider === 'openai' ? 'OpenAI' : 'Anthropic'} key saved.`)
    if (provider === 'openai') setOpenaiKey('')
    else setAnthropicKey('')
  }

  async function testKey(provider: ProviderId): Promise<void> {
    setKeyMessage('Checking key…')
    const result = await window.interpreter.testApiKey(provider)
    setKeyMessage(result.message)
  }

  return (
    <div className="settings-grid">
      <div className="panel">
        <h2>Translation directions</h2>
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="outbound-enabled"
            checked={settings.outbound.enabled}
            onChange={(e) => set({ outbound: { ...settings.outbound, enabled: e.target.checked } })}
          />
          <label htmlFor="outbound-enabled">
            My voice → meeting (spoken translation into the virtual microphone)
          </label>
        </div>
        <div className="field-row">
          <div className="field">
            <label>I speak</label>
            <LanguageSelect
              value={settings.outbound.sourceLanguage}
              onChange={(code) =>
                set({ outbound: { ...settings.outbound, sourceLanguage: code } })
              }
            />
          </div>
          <div className="field">
            <label>They hear</label>
            <LanguageSelect
              value={settings.outbound.targetLanguage}
              onChange={(code) =>
                set({ outbound: { ...settings.outbound, targetLanguage: code } })
              }
            />
          </div>
        </div>

        <div className="checkbox-row" style={{ marginTop: 16 }}>
          <input
            type="checkbox"
            id="inbound-enabled"
            checked={settings.inbound.enabled}
            onChange={(e) => set({ inbound: { ...settings.inbound, enabled: e.target.checked } })}
          />
          <label htmlFor="inbound-enabled">Meeting → me (translate what others say)</label>
        </div>
        <div className="field-row">
          <div className="field">
            <label>They speak</label>
            <LanguageSelect
              value={settings.inbound.sourceLanguage}
              onChange={(code) => set({ inbound: { ...settings.inbound, sourceLanguage: code } })}
            />
          </div>
          <div className="field">
            <label>I read / hear</label>
            <LanguageSelect
              value={settings.inbound.targetLanguage}
              onChange={(code) => set({ inbound: { ...settings.inbound, targetLanguage: code } })}
            />
          </div>
        </div>
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="inbound-subtitles"
            checked={settings.inbound.subtitles}
            onChange={(e) => set({ inbound: { ...settings.inbound, subtitles: e.target.checked } })}
          />
          <label htmlFor="inbound-subtitles">Show subtitles</label>
        </div>
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="inbound-speak"
            checked={settings.inbound.speak}
            onChange={(e) => set({ inbound: { ...settings.inbound, speak: e.target.checked } })}
          />
          <label htmlFor="inbound-speak">
            Speak translation into my headphones (headphones strongly recommended)
          </label>
        </div>

        <div className="section-title">Audio devices</div>
        <div className="field">
          <label>Microphone</label>
          <DeviceSelect
            value={settings.micDeviceId}
            devices={devices.inputs}
            allowDefault
            onChange={(deviceId) => set({ micDeviceId: deviceId })}
          />
        </div>
        <div className="field">
          <label>Virtual microphone output (select CABLE Input here)</label>
          <DeviceSelect
            value={settings.virtualOutputDeviceId}
            devices={devices.outputs}
            allowDefault={false}
            onChange={(deviceId) => set({ virtualOutputDeviceId: deviceId })}
          />
        </div>
        <div className="field">
          <label>Your speakers / headphones</label>
          <DeviceSelect
            value={settings.monitorDeviceId}
            devices={devices.outputs}
            allowDefault
            onChange={(deviceId) => set({ monitorDeviceId: deviceId })}
          />
        </div>
        <button onClick={props.onRefreshDevices}>Refresh device list</button>

        <div className="section-title">Speech capture</div>
        <div className="field">
          <label>Capture mode</label>
          <select
            value={settings.captureMode}
            onChange={(e) => set({ captureMode: e.target.value as Settings['captureMode'] })}
          >
            <option value="auto">Automatic (voice activity detection)</option>
            <option value="push-to-talk">Push-to-talk</option>
          </select>
        </div>
        {settings.captureMode === 'push-to-talk' && (
          <div className="field">
            <label>Push-to-talk key (press a key in this box)</label>
            <input
              type="text"
              value={settings.pushToTalkKey}
              readOnly
              onKeyDown={(e) => {
                e.preventDefault()
                set({ pushToTalkKey: e.code })
              }}
            />
          </div>
        )}
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="noise-suppression"
            checked={settings.noiseSuppression}
            onChange={(e) => set({ noiseSuppression: e.target.checked })}
          />
          <label htmlFor="noise-suppression">Noise suppression</label>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Voice sensitivity ({settings.vadThreshold.toFixed(3)})</label>
            <input
              type="range"
              min="0.002"
              max="0.06"
              step="0.001"
              value={settings.vadThreshold}
              onChange={(e) => set({ vadThreshold: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Min phrase length (ms)</label>
            <input
              type="number"
              value={settings.minPhraseMs}
              onChange={(e) => set({ minPhraseMs: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label>Pause before sending (ms)</label>
            <input
              type="number"
              value={settings.maxSilenceMs}
              onChange={(e) => set({ maxSilenceMs: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label>Max phrase length (ms)</label>
            <input
              type="number"
              value={settings.maxPhraseMs}
              onChange={(e) => set({ maxPhraseMs: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>AI providers</h2>
        <div className="field">
          <label>Speech recognition</label>
          <select
            value={settings.sttProvider}
            onChange={(e) => set({ sttProvider: e.target.value as ProviderId })}
          >
            <option value="openai">OpenAI</option>
            <option value="mock">Mock (offline testing)</option>
          </select>
        </div>
        <div className="field">
          <label>Translation</label>
          <select
            value={settings.translationProvider}
            onChange={(e) => set({ translationProvider: e.target.value as ProviderId })}
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="mock">Mock (offline testing)</option>
          </select>
        </div>
        <div className="field">
          <label>Speech synthesis</label>
          <select
            value={settings.ttsProvider}
            onChange={(e) => set({ ttsProvider: e.target.value as ProviderId })}
          >
            <option value="openai">OpenAI</option>
            <option value="mock">Mock (offline testing)</option>
          </select>
        </div>
        {settings.translationProvider === 'anthropic' && (
          <div className="field">
            <label>Claude model</label>
            <input
              type="text"
              value={settings.anthropicModel}
              onChange={(e) => set({ anthropicModel: e.target.value })}
            />
            <span className="hint">
              Default: claude-opus-4-8. For lower latency you can use claude-haiku-4-5.
            </span>
          </div>
        )}
        <div className="field">
          <label>TTS voice (OpenAI)</label>
          <select
            value={settings.openaiTtsVoice}
            onChange={(e) => set({ openaiTtsVoice: e.target.value })}
          >
            {['alloy', 'ash', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer'].map(
              (voice) => (
                <option key={voice} value={voice}>
                  {voice}
                </option>
              )
            )}
          </select>
        </div>

        <div className="section-title">API keys</div>
        <div className="field">
          <label>OpenAI API key {keyStatus.openai ? '✓ (saved)' : '(not set)'}</label>
          <div className="field-row">
            <input
              type="password"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
            />
            <button onClick={() => void saveKey('openai', openaiKey)} disabled={!openaiKey}>
              Save
            </button>
            <button onClick={() => void testKey('openai')} disabled={!keyStatus.openai}>
              Check
            </button>
          </div>
        </div>
        <div className="field">
          <label>Anthropic API key {keyStatus.anthropic ? '✓ (saved)' : '(not set)'}</label>
          <div className="field-row">
            <input
              type="password"
              placeholder="sk-ant-..."
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
            />
            <button
              onClick={() => void saveKey('anthropic', anthropicKey)}
              disabled={!anthropicKey}
            >
              Save
            </button>
            <button onClick={() => void testKey('anthropic')} disabled={!keyStatus.anthropic}>
              Check
            </button>
          </div>
        </div>
        {keyMessage && <div className="test-result">{keyMessage}</div>}
        <p className="hint">
          Keys are stored encrypted on this computer (Windows DPAPI) and are never written to
          logs. They are only sent to the provider you selected.
        </p>

        <div className="section-title">Test phrase</div>
        <div className="field">
          <input
            type="text"
            value={settings.testPhrase}
            onChange={(e) => set({ testPhrase: e.target.value })}
          />
        </div>

        <div className="section-title">Debugging</div>
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="debug-mode"
            checked={settings.debugMode}
            onChange={(e) => set({ debugMode: e.target.checked })}
          />
          <label htmlFor="debug-mode">Verbose logging (debug mode)</label>
        </div>
        <button
          onClick={() =>
            void window.interpreter.getLogPath().then((p) => setKeyMessage(`Log file: ${p}`))
          }
        >
          Show log file location
        </button>{' '}
        <button
          onClick={() =>
            void window.interpreter.clearLogs().then(() => setKeyMessage('Logs cleared.'))
          }
        >
          Clear logs
        </button>
      </div>
    </div>
  )
}
