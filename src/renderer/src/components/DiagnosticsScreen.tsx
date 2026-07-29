import { useCallback, useEffect, useRef, useState } from 'react'
import type { DiagnosticItem, Settings } from '../../../shared/types'
import { findVirtualCable, listDevices, requestMicPermission } from '../audio/devices'
import { useT } from '../i18n'

const ICONS = { ok: '✅', warning: '⚠️', error: '❌' } as const

export function DiagnosticsScreen({ settings }: { settings: Settings }): React.JSX.Element {
  const t = useT()
  const [items, setItems] = useState<DiagnosticItem[] | null>(null)
  const [running, setRunning] = useState(false)
  const latest = useRef(settings)
  latest.current = settings

  const run = useCallback(async (): Promise<void> => {
    const settings = latest.current
    setRunning(true)
    const results: DiagnosticItem[] = []

    const micAllowed = await requestMicPermission()
    results.push(
      micAllowed
        ? { id: 'mic-perm', labelKey: 'diag.micPerm', status: 'ok', messageKey: 'diag.micPermOk' }
        : {
            id: 'mic-perm',
            labelKey: 'diag.micPerm',
            status: 'error',
            messageKey: 'diag.micPermFail',
            actionKey: 'diag.micPermAction'
          }
    )

    const devices = await listDevices()
    results.push(
      devices.inputs.length > 0
        ? {
            id: 'mic-present',
            labelKey: 'diag.micFound',
            status: 'ok',
            messageKey: 'diag.micFoundOk', params: { n: devices.inputs.length }
          }
        : {
            id: 'mic-present',
            labelKey: 'diag.micFound',
            status: 'error',
            messageKey: 'diag.micFoundFail',
            actionKey: 'diag.micFoundAction'
          }
    )

    const cable = findVirtualCable(devices.outputs)
    if (!cable) {
      results.push({
        id: 'cable',
        labelKey: 'diag.cable',
        status: 'error',
        messageKey: 'diag.cableFail',
        actionKey: 'diag.cableAction'
      })
    } else {
      results.push({
        id: 'cable',
        labelKey: 'diag.cable',
        status: 'ok',
        messageKey: 'diag.cableOk', params: { label: cable.label }
      })
      if (!settings.virtualOutputDeviceId) {
        results.push({
          id: 'cable-selected',
          labelKey: 'diag.cableSelected',
          status: 'warning',
          messageKey: 'diag.cableSelectedWarn',
          actionKey: 'diag.cableSelectedAction', params: { label: cable.label }
        })
      } else {
        results.push({
          id: 'cable-selected',
          labelKey: 'diag.cableSelected',
          status: 'ok',
          messageKey: 'diag.cableSelectedOk'
        })
      }
    }

    if (settings.outbound.enabled || settings.inbound.enabled) {
      results.push({
        id: 'directions',
        labelKey: 'diag.directions',
        status: 'ok',
        messageKey: 'diag.directionsOk'
      })
    } else {
      results.push({
        id: 'directions',
        labelKey: 'diag.directions',
        status: 'warning',
        messageKey: 'diag.directionsWarn',
        actionKey: 'diag.directionsAction'
      })
    }

    try {
      const main = await window.interpreter.mainDiagnostics()
      results.push(...main.items)
    } catch {
      results.push({
        id: 'main-diag',
        labelKey: 'diag.providerChecks',
        status: 'error',
        messageKey: 'diag.mainFail'
      })
    }

    setItems(results)
    setRunning(false)
  }, [])

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
                <div className="label">{t(item.labelKey)}</div>
                <div className="message">{t(item.messageKey, item.params)}</div>
                {item.actionKey && (
                  <div className="action">{t(item.actionKey, item.params)}</div>
                )}
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
