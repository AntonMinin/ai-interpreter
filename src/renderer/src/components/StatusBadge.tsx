import type { PipelineStatus } from '../../../shared/types'
import { useT } from '../i18n'

const STATUS_COLORS: Record<PipelineStatus, string> = {
  stopped: '#93a1b0',
  ready: '#35c26e',
  listening: '#4fa3e0',
  transcribing: '#b287e0',
  translating: '#e0a94f',
  speaking: '#e0724f',
  error: '#e05d5d'
}

export function StatusBadge({ status }: { status: PipelineStatus }): React.JSX.Element {
  const t = useT()
  return (
    <span className="status-badge">
      <span className="status-dot" style={{ background: STATUS_COLORS[status] }} />
      {t(`status.${status}`)}
    </span>
  )
}
