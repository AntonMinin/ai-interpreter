import { useCallback, useEffect, useState } from 'react'
import type { DiagnosticItem, Settings } from '../../../shared/types'
import { findVirtualCable, listDevices, requestMicPermission } from '../audio/devices'
import { useT } from '../i18n'

const ICONS = { ok: '✅', warning: '⚠️', error: '❌' } as const

export function DiagnosticsScreen({ settings }: { settings: Settings }): React.JSX.Element {
  const t = useT()
  const [items, setItems] = useState<DiagnosticItem[] | null>(null)
  const [running, setRunning] = useState(false)

  const run = useCallback(async (): Promise<void> => {
    setRunning(true)
    const results: DiagnosticItem[] = []

    const micAllowed = await requestMicPermission()
    results.push(
      micAllowed
        ? { id: 'mic-perm', label: t('diag.micPerm'), status: 'ok', message: t('diag.micPermOk') }
        : {
            id: 'mic-perm',
            label: t('diag.micPerm'),
            status: 'error',
            message: t('diag.micPermFail'),
            action: t('diag.micPermAction')
          }
    )

    const devices = await listDevices()
    results.push(
      devices.inputs.length > 0
        ? {
            id: 'mic-present',
            label: t('diag.micFound'),
            status: 'ok',
            message: t('diag.micFoundOk', { n: devices.inputs.length })
          }
        : {
            id: 'mic-present',
            label: t('diag.micFound'),
            status: 'error',
            message: t('diag.micFoundFail'),
            action: t('diag.micFoundAction')
          }
    )

    const cable = findVirtualCable(devices.outputs)
    if (!cable) {
      results.push({
        id: 'cable',
        label: t('diag.cable'),
        status: 'error',
        message: t('diag.cableFail'),
        action: t('diag.cableAction')
      })
    } else {
      results.push({
        id: 'cable',
        label: t('diag.cable'),
        status: 'ok',
        message: t('diag.cableOk', { label: cable.label })
      })
      if (!settings.virtualOutputDeviceId) {
        results.push({
          id: 'cable-selected',
          label: t('diag.cableSelected'),
          status: 'warning',
          message: t('diag.cableSelectedWarn'),
          action: t('diag.cableSelectedAction', { label: cable.label })
        })
      } else {
        results.push({
          id: 'cable-selected',
          label: t('diag.cableSelected'),
          status: 'ok',
          message: t('diag.cableSelectedOk')
        })
      }
    }

    if (settings.outbound.enabled || settings.inbound.enabled) {
      results.push({
        id: 'directions',
        label: t('diag.directions'),
        status: 'ok',
        message: t('diag.directionsOk')
      })
    } else {
      results.push({
        id: 'directions',
        label: t('diag.directions'),
        status: 'warning',
        message: t('diag.directionsWarn'),
        action: t('diag.directionsAction')
      })
    }

    try {
      const main = await window.interpreter.mainDiagnostics()
      results.push(...main.items)
    } catch {
      results.push({
        id: 'main-diag',
        label: t('diag.providerChecks'),
        status: 'error',
        message: t('diag.mainFail')
      })
    }

    setItems(results)
    setRunning(false)
  }, [settings, t])

  useEffect(() => {
    void run()
  }, [run])

  return (
    <div className="panel" style={{ maxWidth: 720 }}>
      <h2>{t('diag.title')}</h2>
      {items === null ? (
        <p className="hint">{t('diag.running')}</p>
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
          {t('diag.runAgain')}
        </button>
        <button
          onClick={() => void window.interpreter.openExternal('https://vb-audio.com/Cable/')}
        >
          {t('diag.getCable')}
        </button>
      </div>
    </div>
  )
}
