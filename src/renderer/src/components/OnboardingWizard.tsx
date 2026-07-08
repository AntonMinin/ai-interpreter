import { useEffect, useRef, useState } from 'react'
import type { KeyStatus, ProviderId, Settings } from '../../../shared/types'
import { computeRms } from '../../../core/segmenter'
import { arrayBufferToBase64, encodeWav, generateTone } from '../../../core/audio'
import { MicCapture } from '../audio/capture'
import { AudioQueuePlayer } from '../audio/player'
import { findVirtualCable, requestMicPermission, type AudioDevice } from '../audio/devices'
import { UI_LANGUAGES, useT } from '../i18n'
import { LevelMeter } from './LevelMeter'

interface OnboardingProps {
  settings: Settings
  keyStatus: KeyStatus
  devices: { inputs: AudioDevice[]; outputs: AudioDevice[] }
  onChange(patch: Partial<Settings>): void
  onSaveKey(provider: 'openai' | 'anthropic', key: string): Promise<void>
  onRefreshDevices(): Promise<void>
  onFinish(): void
}

const TOTAL_STEPS = 8

export function OnboardingWizard(props: OnboardingProps): React.JSX.Element {
  const t = useT()
  const [step, setStep] = useState(1)
  const [micLevel, setMicLevel] = useState(0)
  const [micHeard, setMicHeard] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [translationOk, setTranslationOk] = useState(false)
  const micRef = useRef<MicCapture | null>(null)

  const { settings, devices } = props
  const cable = findVirtualCable(devices.outputs)

  useEffect(() => {
    if (step === 2) {
      const mic = new MicCapture()
      micRef.current = mic
      void mic.start(settings.micDeviceId, settings.noiseSuppression, (frame) => {
        const rms = computeRms(frame)
        setMicLevel(rms)
        if (rms > settings.vadThreshold * 1.5) setMicHeard(true)
      })
      return () => {
        void mic.stop()
        micRef.current = null
      }
    }
    return undefined
  }, [step, settings.micDeviceId, settings.noiseSuppression, settings.vadThreshold])

  useEffect(() => {
    setMessage(null)
  }, [step])

  async function testTranslation(): Promise<void> {
    setMessage(t('ob.translating'))
    try {
      const result = await window.interpreter.translate({
        text: settings.testPhrase,
        sourceLanguage: settings.outbound.sourceLanguage,
        targetLanguage: settings.outbound.targetLanguage
      })
      setMessage(t('ob.translationResult', { text: result }))
      setTranslationOk(true)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('ob.translationFailed'))
    }
  }

  async function testVoice(): Promise<void> {
    setMessage(t('ob.synthesizing'))
    try {
      const translated = await window.interpreter.translate({
        text: settings.testPhrase,
        sourceLanguage: settings.outbound.sourceLanguage,
        targetLanguage: settings.outbound.targetLanguage
      })
      const audio = await window.interpreter.synthesize({
        text: translated,
        language: settings.outbound.targetLanguage
      })
      const player = new AudioQueuePlayer(() => settings.monitorDeviceId)
      await player.enqueue(audio.audioBase64, audio.mimeType)
      setMessage(t('ob.voiceDone'))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('ob.voiceFailed'))
    }
  }

  async function testVirtualOutput(): Promise<void> {
    if (!settings.virtualOutputDeviceId) {
      setMessage(t('ob.selectCableFirst'))
      return
    }
    setMessage(t('ob.playingTone'))
    try {
      const wav = encodeWav(generateTone([523, 659, 784], 1200, 24000), 24000)
      const player = new AudioQueuePlayer(() => settings.virtualOutputDeviceId)
      await player.enqueue(arrayBufferToBase64(wav), 'audio/wav')
      setMessage(t('ob.toneSent'))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('ob.playbackFailed'))
    }
  }

  function next(): void {
    setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  }

  function back(): void {
    setStep((s) => Math.max(1, s - 1))
  }

  return (
    <div className="onboarding panel">
      <div className="step-indicator">{t('ob.step', { n: step, total: TOTAL_STEPS })}</div>

      {step === 1 && (
        <div>
          <h2>{t('ob.welcomeTitle')}</h2>
          <p>{t('ob.welcomeBody')}</p>
          <div className="field">
            <label>{t('set.interfaceLanguage')}</label>
            <select
              value={settings.interfaceLanguage}
              onChange={(e) => props.onChange({ interfaceLanguage: e.target.value })}
            >
              {UI_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>{t('ob.micLabel')}</label>
            <select
              value={settings.micDeviceId}
              onChange={(e) => props.onChange({ micDeviceId: e.target.value })}
            >
              <option value="default">{t('set.systemDefault')}</option>
              {devices.inputs.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() =>
              void requestMicPermission().then(async (ok) => {
                setMessage(ok ? t('ob.micGranted') : t('ob.micDenied'))
                await props.onRefreshDevices()
              })
            }
          >
            {t('ob.allowMic')}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>{t('ob.sayTitle')}</h2>
          <p>
            {t('ob.sayBody')} <code>{settings.testPhrase}</code>
          </p>
          <LevelMeter level={Math.min(1, micLevel * 8)} label={t('ob.micLevel')} />
          <p className="hint">{micHeard ? t('ob.heardOk') : t('ob.notHeard')}</p>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>{t('ob.providerTitle')}</h2>
          <p>{t('ob.providerBody')}</p>
          <div className="field">
            <label>{t('ob.providerLabel')}</label>
            <select
              value={settings.translationProvider}
              onChange={(e) => {
                const id = e.target.value as ProviderId
                if (id === 'mock') {
                  props.onChange({
                    sttProvider: 'mock',
                    translationProvider: 'mock',
                    ttsProvider: 'mock'
                  })
                } else {
                  props.onChange({
                    sttProvider: 'openai',
                    translationProvider: id,
                    ttsProvider: 'openai'
                  })
                }
              }}
            >
              <option value="openai">{t('ob.provOpenAi')}</option>
              <option value="anthropic">{t('ob.provAnthropic')}</option>
              <option value="mock">{t('ob.provMock')}</option>
            </select>
          </div>
          {settings.translationProvider !== 'mock' && (
            <div className="field">
              <label>
                {t('set.openaiKey')} {props.keyStatus.openai ? t('ob.savedMark') : ''}
              </label>
              <div className="field-row">
                <input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button
                  disabled={!apiKey}
                  onClick={() =>
                    void props.onSaveKey('openai', apiKey).then(() => {
                      setApiKey('')
                      setMessage(t('ob.keySaved'))
                    })
                  }
                >
                  {t('set.save')}
                </button>
              </div>
              <span className="hint">{t('ob.anthropicLater')}</span>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <h2>{t('ob.translationTitle')}</h2>
          <p>
            {t('ob.testPhraseLabel')} <code>{settings.testPhrase}</code>
          </p>
          <button className="primary" onClick={() => void testTranslation()}>
            {t('ob.translateBtn')}
          </button>
          {!translationOk && <p className="hint">{t('ob.translationHint')}</p>}
        </div>
      )}

      {step === 5 && (
        <div>
          <h2>{t('ob.voiceTitle')}</h2>
          <p>{t('ob.voiceBody')}</p>
          <button className="primary" onClick={() => void testVoice()}>
            {t('ob.voiceBtn')}
          </button>
        </div>
      )}

      {step === 6 && (
        <div>
          <h2>{t('ob.cableTitle')}</h2>
          <p>{t('ob.cableBody')}</p>
          {cable ? (
            <div>
              <p>{t('ob.cableDetected', { label: cable.label })}</p>
              <button
                className="primary"
                onClick={() => props.onChange({ virtualOutputDeviceId: cable.deviceId })}
              >
                {t('ob.useCable', { label: cable.label })}
              </button>
              {settings.virtualOutputDeviceId && (
                <button style={{ marginLeft: 8 }} onClick={() => void testVirtualOutput()}>
                  {t('ob.sendTone')}
                </button>
              )}
            </div>
          ) : (
            <div>
              <p>{t('ob.cableMissing')}</p>
              <ol>
                <li>{t('ob.cableStep1')}</li>
                <li>{t('ob.cableStep2')}</li>
                <li>{t('ob.cableStep3')}</li>
                <li>{t('ob.cableStep4')}</li>
              </ol>
              <button
                onClick={() => void window.interpreter.openExternal('https://vb-audio.com/Cable/')}
              >
                {t('ob.openCablePage')}
              </button>{' '}
              <button onClick={() => void props.onRefreshDevices()}>{t('ob.refresh')}</button>
              <p className="hint">{t('ob.cableSkipHint')}</p>
            </div>
          )}
        </div>
      )}

      {step === 7 && (
        <div>
          <h2>{t('ob.meetingTitle')}</h2>
          <p>{t('ob.meetingBody')}</p>
          <ul>
            <li>
              <strong>{t('ob.meetingMic')}</strong>{' '}
              <code>CABLE Output (VB-Audio Virtual Cable)</code> — {t('ob.meetingMicDesc')}
            </li>
            <li>
              <strong>{t('ob.meetingSpeaker')}</strong> {t('ob.meetingSpeakerDesc')}
            </li>
          </ul>
          <p className="hint">{t('ob.meetingHint')}</p>
        </div>
      )}

      {step === 8 && (
        <div>
          <h2>{t('ob.readyTitle')}</h2>
          <p>{t('ob.readyBody')}</p>
        </div>
      )}

      {message && <div className="test-result">{message}</div>}

      <div className="actions">
        <button onClick={back} disabled={step === 1}>
          {t('ob.back')}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={props.onFinish}>{t('ob.skip')}</button>
          {step < TOTAL_STEPS ? (
            <button className="primary" onClick={next}>
              {t('ob.next')}
            </button>
          ) : (
            <button className="primary" onClick={props.onFinish}>
              {t('ob.finish')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
