import { useCallback, useEffect, useState } from 'react'
import type { DiagnosticItem, Settings } from '../../../shared/types'
import { findVirtualCable, listDevices, requestMicPermission } from '../audio/devices'

const ICONS = { ok: '✅', warning: '⚠️', error: '❌' } as const

export function DiagnosticsScreen({ settings }: { settings: Settings }): React.JSX.Element {
  const [items, setItems] = useState<DiagnosticItem[] | null>(null)
  const [running, setRunning] = useState(false)

  const run = useCallback(async (): Promise<void> => {
    setRunning(true)
    const results: DiagnosticItem[] = []

    const micAllowed = await requestMicPermission()
    results.push(
      micAllowed
        ? { id: 'mic-perm', label: 'Microphone access', status: 'ok', message: 'Permission granted.' }
        : {
            id: 'mic-perm',
            label: 'Microphone access',
            status: 'error',
            message: 'Microphone access is blocked.',
            action:
              'Open Windows Settings → Privacy & security → Microphone and allow desktop apps to access the microphone.'
          }
    )

    const devices = await listDevices()
    results.push(
      devices.inputs.length > 0
        ? {
            id: 'mic-present',
            label: 'Microphone found',
            status: 'ok',
            message: `${devices.inputs.length} input device(s) available.`
          }
        : {
            id: 'mic-present',
            label: 'Microphone found',
            status: 'error',
            message: 'No microphone detected.',
            action: 'Plug in a microphone or headset and click "Run checks again".'
          }
    )

    const cable = findVirtualCable(devices.outputs)
    if (!cable) {
      results.push({
        id: 'cable',
        label: 'Virtual audio cable',
        status: 'error',
        message: 'No virtual audio cable detected (VB-CABLE or similar).',
        action:
          'Install the free VB-CABLE driver from vb-audio.com/Cable, reboot, then run checks again. Without it, the meeting cannot hear your translated voice.'
      })
    } else {
      results.push({
        id: 'cable',
        label: 'Virtual audio cable',
        status: 'ok',
        message: `Detected: ${cable.label}`
      })
      if (!settings.virtualOutputDeviceId) {
        results.push({
          id: 'cable-selected',
          label: 'Virtual output selected',
          status: 'warning',
          message: 'A virtual cable is installed but not selected as the translation output.',
          action: `Open Settings and choose "${cable.label}" as the virtual microphone output.`
        })
      } else {
        results.push({
          id: 'cable-selected',
          label: 'Virtual output selected',
          status: 'ok',
          message: 'Translation output is routed to the virtual cable.'
        })
      }
    }

    if (settings.outbound.enabled || settings.inbound.enabled) {
      results.push({
        id: 'directions',
        label: 'Translation directions',
        status: 'ok',
        message: 'At least one translation direction is enabled.'
      })
    } else {
      results.push({
        id: 'directions',
        label: 'Translation directions',
        status: 'warning',
        message: 'Both translation directions are disabled.',
        action: 'Enable at least one direction in Settings.'
      })
    }

    try {
      const main = await window.interpreter.mainDiagnostics()
      results.push(...main.items)
    } catch {
      results.push({
        id: 'main-diag',
        label: 'Provider checks',
        status: 'error',
        message: 'Could not run provider checks.'
      })
    }

    setItems(results)
    setRunning(false)
  }, [settings])

  useEffect(() => {
    void run()
  }, [run])

  return (
    <div className="panel" style={{ maxWidth: 720 }}>
      <h2>Audio & connection diagnostics</h2>
      {items === null ? (
        <p className="hint">Running checks…</p>
      ) : (
        <div>
          {items.map((item) => (
            <div key={item.id} className="diag-item">
              <div className="diag-icon">{ICONS[item.status]}</div>
              <div className="diag-body">
                <div className="label">{item.label}</div>
                <div className="message">{item.message}</div>
                {item.action && <div className="action">{item.action}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button onClick={() => void run()} disabled={running}>
          Run checks again
        </button>
        <button
          onClick={() => void window.interpreter.openExternal('https://vb-audio.com/Cable/')}
        >
          Get VB-CABLE (free)
        </button>
      </div>
    </div>
  )
}
