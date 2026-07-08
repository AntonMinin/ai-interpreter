import { useState } from 'react'
import type { KeyStatus, ProviderId, Settings } from '../../../shared/types'
import { LANGUAGES } from '../../../shared/languages'
import type { AudioDevice } from '../audio/devices'
import { UI_LANGUAGES, useT } from '../i18n'

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
  defaultLabel,
  emptyLabel,
  onChange
}: {
  value: string
  devices: AudioDevice[]
  allowDefault: boolean
  defaultLabel: string
  emptyLabel: string
  onChange(deviceId: string): void
}): React.JSX.Element {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {allowDefault && <option value="default">{defaultLabel}</option>}
      {!allowDefault && <option value="">{emptyLabel}</option>}
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
  const t = useT()
  const [openaiKey, setOpenaiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [keyMessage, setKeyMessage] = useState<string | null>(null)

  const set = props.onChange

  async function saveKey(provider: 'openai' | 'anthropic', value: string): Promise<void> {
    await props.onSaveKey(provider, value)
    setKeyMessage(t('set.keySavedMsg', { provider: provider === 'openai' ? 'OpenAI' : 'Anthropic' }))
    if (provider === 'openai') setOpenaiKey('')
    else setAnthropicKey('')
  }

  async function testKey(provider: ProviderId): Promise<void> {
    setKeyMessage(t('set.checkingKey'))
    const result = await window.interpreter.testApiKey(provider)
    setKeyMessage(result.message)
  }

  return (
    <div className="settings-grid">
      <div className="panel">
        <h2>{t('set.interface')}</h2>
        <div className="field">
          <label>{t('set.interfaceLanguage')}</label>
          <select
            value={settings.interfaceLanguage}
            onChange={(e) => set({ interfaceLanguage: e.target.value })}
          >
            {UI_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          <span className="hint">{t('set.interfaceLanguageHint')}</span>
        </div>

        <div className="section-title">{t('set.directions')}</div>
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="outbound-enabled"
            checked={settings.outbound.enabled}
            onChange={(e) => set({ outbound: { ...settings.outbound, enabled: e.target.checked } })}
          />
          <label htmlFor="outbound-enabled">{t('set.outboundLabel')}</label>
        </div>
        <div className="field-row">
          <div className="field">
            <label>{t('set.iSpeak')}</label>
            <LanguageSelect
              value={settings.outbound.sourceLanguage}
              onChange={(code) =>
                set({ outbound: { ...settings.outbound, sourceLanguage: code } })
              }
            />
          </div>
          <div className="field">
            <label>{t('set.theyHear')}</label>
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
          <label htmlFor="inbound-enabled">{t('set.inboundLabel')}</label>
        </div>
        <div className="field-row">
          <div className="field">
            <label>{t('set.theySpeak')}</label>
            <LanguageSelect
              value={settings.inbound.sourceLanguage}
              onChange={(code) => set({ inbound: { ...settings.inbound, sourceLanguage: code } })}
            />
          </div>
          <div className="field">
            <label>{t('set.iReadHear')}</label>
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
          <label htmlFor="inbound-subtitles">{t('set.showSubtitles')}</label>
        </div>
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="inbound-speak"
            checked={settings.inbound.speak}
            onChange={(e) => set({ inbound: { ...settings.inbound, speak: e.target.checked } })}
          />
          <label htmlFor="inbound-speak">{t('set.speakToHeadphones')}</label>
        </div>

        <div className="section-title">{t('set.audioDevices')}</div>
        <div className="field">
          <label>{t('set.mic')}</label>
          <DeviceSelect
            value={settings.micDeviceId}
            devices={devices.inputs}
            allowDefault
            defaultLabel={t('set.systemDefault')}
            emptyLabel={t('set.notSelected')}
            onChange={(deviceId) => set({ micDeviceId: deviceId })}
          />
        </div>
        <div className="field">
          <label>{t('set.virtualOut')}</label>
          <DeviceSelect
            value={settings.virtualOutputDeviceId}
            devices={devices.outputs}
            allowDefault={false}
            defaultLabel={t('set.systemDefault')}
            emptyLabel={t('set.notSelected')}
            onChange={(deviceId) => set({ virtualOutputDeviceId: deviceId })}
          />
        </div>
        <div className="field">
          <label>{t('set.monitorDevice')}</label>
          <DeviceSelect
            value={settings.monitorDeviceId}
            devices={devices.outputs}
            allowDefault
            defaultLabel={t('set.systemDefault')}
            emptyLabel={t('set.notSelected')}
            onChange={(deviceId) => set({ monitorDeviceId: deviceId })}
          />
        </div>
        <button onClick={props.onRefreshDevices}>{t('set.refreshDevices')}</button>

        <div className="section-title">{t('set.speechCapture')}</div>
        <div className="field">
          <label>{t('set.captureMode')}</label>
          <select
            value={settings.captureMode}
            onChange={(e) => set({ captureMode: e.target.value as Settings['captureMode'] })}
          >
            <option value="auto">{t('set.captureAuto')}</option>
            <option value="push-to-talk">{t('set.capturePtt')}</option>
          </select>
        </div>
        {settings.captureMode === 'push-to-talk' && (
          <div className="field">
            <label>{t('set.pttKey')}</label>
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
          <label htmlFor="noise-suppression">{t('set.noiseSuppression')}</label>
        </div>
        <div className="field-row">
          <div className="field">
            <label>{t('set.sensitivity', { value: settings.vadThreshold.toFixed(3) })}</label>
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
            <label>{t('set.minPhrase')}</label>
            <input
              type="number"
              value={settings.minPhraseMs}
              onChange={(e) => set({ minPhraseMs: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label>{t('set.pauseBeforeSend')}</label>
            <input
              type="number"
              value={settings.maxSilenceMs}
              onChange={(e) => set({ maxSilenceMs: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label>{t('set.maxPhrase')}</label>
            <input
              type="number"
              value={settings.maxPhraseMs}
              onChange={(e) => set({ maxPhraseMs: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>{t('set.providers')}</h2>
        <div className="field">
          <label>{t('set.stt')}</label>
          <select
            value={settings.sttProvider}
            onChange={(e) => set({ sttProvider: e.target.value as ProviderId })}
          >
            <option value="openai">{t('prov.openai')}</option>
            <option value="mock">{t('prov.mock')}</option>
          </select>
        </div>
        <div className="field">
          <label>{t('set.translation')}</label>
          <select
            value={settings.translationProvider}
            onChange={(e) => set({ translationProvider: e.target.value as ProviderId })}
          >
            <option value="openai">{t('prov.openai')}</option>
            <option value="anthropic">{t('prov.anthropic')}</option>
            <option value="mock">{t('prov.mock')}</option>
          </select>
        </div>
        <div className="field">
          <label>{t('set.tts')}</label>
          <select
            value={settings.ttsProvider}
            onChange={(e) => set({ ttsProvider: e.target.value as ProviderId })}
          >
            <option value="openai">{t('prov.openai')}</option>
            <option value="mock">{t('prov.mock')}</option>
          </select>
        </div>
        {settings.translationProvider === 'anthropic' && (
          <div className="field">
            <label>{t('set.claudeModel')}</label>
            <input
              type="text"
              value={settings.anthropicModel}
              onChange={(e) => set({ anthropicModel: e.target.value })}
            />
            <span className="hint">{t('set.claudeModelHint')}</span>
          </div>
        )}
        <div className="field">
          <label>{t('set.ttsVoice')}</label>
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

        <div className="section-title">{t('set.apiKeys')}</div>
        <div className="field">
          <label>
            {t('set.openaiKey')} {keyStatus.openai ? t('set.keySaved') : t('set.keyNotSet')}
          </label>
          <div className="field-row">
            <input
              type="password"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
            />
            <button onClick={() => void saveKey('openai', openaiKey)} disabled={!openaiKey}>
              {t('set.save')}
            </button>
            <button onClick={() => void testKey('openai')} disabled={!keyStatus.openai}>
              {t('set.check')}
            </button>
          </div>
        </div>
        <div className="field">
          <label>
            {t('set.anthropicKey')} {keyStatus.anthropic ? t('set.keySaved') : t('set.keyNotSet')}
          </label>
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
              {t('set.save')}
            </button>
            <button onClick={() => void testKey('anthropic')} disabled={!keyStatus.anthropic}>
              {t('set.check')}
            </button>
          </div>
        </div>
        {keyMessage && <div className="test-result">{keyMessage}</div>}
        <p className="hint">{t('set.keysHint')}</p>

        <div className="section-title">{t('set.testPhrase')}</div>
        <div className="field">
          <input
            type="text"
            value={settings.testPhrase}
            onChange={(e) => set({ testPhrase: e.target.value })}
          />
        </div>

        <div className="section-title">{t('set.debugging')}</div>
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="debug-mode"
            checked={settings.debugMode}
            onChange={(e) => set({ debugMode: e.target.checked })}
          />
          <label htmlFor="debug-mode">{t('set.debugMode')}</label>
        </div>
        <button
          onClick={() =>
            void window.interpreter
              .getLogPath()
              .then((p) => setKeyMessage(t('set.logFile', { path: p })))
          }
        >
          {t('set.showLogPath')}
        </button>{' '}
        <button
          onClick={() =>
            void window.interpreter.clearLogs().then(() => setKeyMessage(t('set.logsCleared')))
          }
        >
          {t('set.clearLogs')}
        </button>
      </div>
    </div>
  )
}
