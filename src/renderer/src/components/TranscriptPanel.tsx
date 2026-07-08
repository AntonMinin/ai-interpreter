import type { TranscriptEntry } from '../../../shared/types'
import { languageName } from '../../../shared/languages'
import { useT } from '../i18n'

export function TranscriptPanel({ entries }: { entries: TranscriptEntry[] }): React.JSX.Element {
  const t = useT()
  if (entries.length === 0) {
    return <p className="hint">{t('transcript.empty')}</p>
  }
  return (
    <div className="transcript">
      {entries.map((entry) => (
        <div key={entry.id} className={`transcript-entry ${entry.direction}`}>
          <div className="meta">
            {entry.direction === 'outbound' ? t('transcript.you') : t('transcript.meeting')} ·{' '}
            {languageName(entry.sourceLanguage)} → {languageName(entry.targetLanguage)} ·{' '}
            {new Date(entry.timestamp).toLocaleTimeString()}
          </div>
          <div className="source">{entry.sourceText}</div>
          <div className="translated">{entry.translatedText}</div>
        </div>
      ))}
    </div>
  )
}
