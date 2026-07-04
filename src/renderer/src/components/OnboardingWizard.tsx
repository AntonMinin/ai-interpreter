import { useEffect, useRef, useState } from 'react'
import type { KeyStatus, ProviderId, Settings } from '../../../shared/types'
import { computeRms } from '../../../core/segmenter'
import { arrayBufferToBase64, encodeWav, generateTone } from '../../../core/audio'
import { MicCapture } from '../audio/capture'
import { AudioQueuePlayer } from '../audio/player'
import { findVirtualCable, requestMicPermission, type AudioDevice } from '../audio/devices'
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
    setMessage('Translating test phrase…')
    try {
      const result = await window.interpreter.translate({
        text: settings.testPhrase,
        sourceLanguage: settings.outbound.sourceLanguage,
        targetLanguage: settings.outbound.targetLanguage
      })
      setMessage(`Translation: "${result}"`)
      setTranslationOk(true)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Translation failed.')
    }
  }

  async function testVoice(): Promise<void> {
    setMessage('Synthesizing speech…')
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
      setMessage('You should have heard the translated phrase in your speakers/headphones.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Speech synthesis failed.')
    }
  }

  async function testVirtualOutput(): Promise<void> {
    if (!settings.virtualOutputDeviceId) {
      setMessage('Select the virtual cable output first.')
      return
    }
    setMessage('Playing a tone into the virtual microphone…')
    try {
      const wav = encodeWav(generateTone([523, 659, 784], 1200, 24000), 24000)
      const player = new AudioQueuePlayer(() => settings.virtualOutputDeviceId)
      await player.enqueue(arrayBufferToBase64(wav), 'audio/wav')
      setMessage(
        'Tone sent. If a meeting app is open with "CABLE Output" selected as microphone, its input meter should have moved.'
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Playback failed.')
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
      <div className="step-indicator">
        Step {step} of {TOTAL_STEPS}
      </div>

      {step === 1 && (
        <div>
          <h2>Welcome! Let&apos;s pick your microphone</h2>
          <p>
            AI Interpreter listens to your voice, translates it, and speaks the translation into
            your online meeting. First, choose the microphone you normally use.
          </p>
          <div className="field">
            <label>Microphone</label>
            <select
              value={settings.micDeviceId}
              onChange={(e) => props.onChange({ micDeviceId: e.target.value })}
            >
              <option value="default">System default</option>
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
                setMessage(ok ? 'Microphone access granted.' : 'Microphone access was denied.')
                await props.onRefreshDevices()
              })
            }
          >
            Allow microphone access
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Say something</h2>
          <p>
            Say the test phrase out loud: <code>{settings.testPhrase}</code>
          </p>
          <LevelMeter level={Math.min(1, micLevel * 8)} label="Microphone level" />
          <p className="hint">
            {micHeard
              ? '✅ Great — the app can hear you.'
              : 'The bar should move while you speak. If it does not, go back and pick another microphone.'}
          </p>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Choose an AI provider</h2>
          <p>
            Translation runs in the cloud. You need an API key from the provider you choose. You
            can also pick the offline Mock provider just to explore the app.
          </p>
          <div className="field">
            <label>Provider</label>
            <select
              value={settings.translationProvider}
              onChange={(e) => {
                const id = e.target.value as ProviderId
                if (id === 'mock') {
                  props.onChange({ sttProvider: 'mock', translationProvider: 'mock', ttsProvider: 'mock' })
                } else {
                  props.onChange({
                    sttProvider: 'openai',
                    translationProvider: id,
                    ttsProvider: 'openai'
                  })
                }
              }}
            >
              <option value="openai">OpenAI (speech + translation + voice)</option>
              <option value="anthropic">Anthropic Claude for translation + OpenAI for audio</option>
              <option value="mock">Mock provider (no key, no real translation)</option>
            </select>
          </div>
          {settings.translationProvider !== 'mock' && (
            <div className="field">
              <label>OpenAI API key {props.keyStatus.openai ? '✓ saved' : ''}</label>
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
                      setMessage('Key saved.')
                    })
                  }
                >
                  Save
                </button>
              </div>
              <span className="hint">
                Anthropic key (if selected) can be added later in Settings.
              </span>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <h2>Check translation</h2>
          <p>
            Test phrase: <code>{settings.testPhrase}</code>
          </p>
          <button className="primary" onClick={() => void testTranslation()}>
            Translate test phrase
          </button>
          {!translationOk && (
            <p className="hint">If this fails, check your API key or internet connection.</p>
          )}
        </div>
      )}

      {step === 5 && (
        <div>
          <h2>Check spoken translation</h2>
          <p>The app will translate the test phrase and speak it into your speakers/headphones.</p>
          <button className="primary" onClick={() => void testVoice()}>
            Play translated speech
          </button>
        </div>
      )}

      {step === 6 && (
        <div>
          <h2>Virtual microphone</h2>
          <p>
            To make the meeting hear your translated voice, the app plays it into a{' '}
            <strong>virtual audio cable</strong>. The free VB-CABLE driver works well.
          </p>
          {cable ? (
            <div>
              <p>✅ Virtual cable detected: {cable.label}</p>
              <button
                className="primary"
                onClick={() => props.onChange({ virtualOutputDeviceId: cable.deviceId })}
              >
                Use {cable.label}
              </button>
              {settings.virtualOutputDeviceId && (
                <button style={{ marginLeft: 8 }} onClick={() => void testVirtualOutput()}>
                  Send test tone
                </button>
              )}
            </div>
          ) : (
            <div>
              <p>❌ No virtual cable found. Install it once, then come back:</p>
              <ol>
                <li>Download VB-CABLE (free) and unzip it.</li>
                <li>Right-click the installer → Run as administrator.</li>
                <li>Reboot Windows.</li>
                <li>Return here and click Refresh.</li>
              </ol>
              <button
                onClick={() => void window.interpreter.openExternal('https://vb-audio.com/Cable/')}
              >
                Open VB-CABLE download page
              </button>{' '}
              <button onClick={() => void props.onRefreshDevices()}>Refresh</button>
              <p className="hint">
                You can skip this step and use subtitles-only mode, but the meeting will not hear
                your translated voice.
              </p>
            </div>
          )}
        </div>
      )}

      {step === 7 && (
        <div>
          <h2>Set up your meeting app</h2>
          <p>In Zoom, Google Meet or Microsoft Teams, open audio settings and select:</p>
          <ul>
            <li>
              <strong>Microphone:</strong> <code>CABLE Output (VB-Audio Virtual Cable)</code> — this
              is where your translated voice arrives.
            </li>
            <li>
              <strong>Speaker:</strong> your normal headphones or speakers.
            </li>
          </ul>
          <p className="hint">
            Zoom: Settings → Audio. Google Meet: gear icon → Audio. Teams: Settings → Devices. Also
            disable the meeting app&apos;s automatic noise suppression for the CABLE microphone if
            available — it can eat synthesized speech.
          </p>
        </div>
      )}

      {step === 8 && (
        <div>
          <h2>You&apos;re ready 🎉</h2>
          <p>
            Press <strong>Start</strong> on the main screen, speak normally, and the meeting will
            hear your translated voice. Enable the &quot;Meeting → me&quot; direction in Settings to
            get subtitles for what others say.
          </p>
        </div>
      )}

      {message && <div className="test-result">{message}</div>}

      <div className="actions">
        <button onClick={back} disabled={step === 1}>
          Back
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={props.onFinish}>Skip setup</button>
          {step < TOTAL_STEPS ? (
            <button className="primary" onClick={next}>
              Next
            </button>
          ) : (
            <button className="primary" onClick={props.onFinish}>
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
