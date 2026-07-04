import type { PipelineStatus } from '../../../shared/types'

const STATUS_META: Record<PipelineStatus, { label: string; color: string }> = {
  stopped: { label: 'Stopped', color: '#93a1b0' },
  ready: { label: 'Ready', color: '#35c26e' },
  listening: { label: 'Listening', color: '#4fa3e0' },
  transcribing: { label: 'Transcribing', color: '#b287e0' },
  translating: { label: 'Translating', color: '#e0a94f' },
  speaking: { label: 'Speaking', color: '#e0724f' },
  error: { label: 'Error', color: '#e05d5d' }
}

export function StatusBadge({ status }: { status: PipelineStatus }): React.JSX.Element {
  const meta = STATUS_META[status]
  return (
    <span className="status-badge">
      <span className="status-dot" style={{ background: meta.color }} />
      {meta.label}
    </span>
  )
}
