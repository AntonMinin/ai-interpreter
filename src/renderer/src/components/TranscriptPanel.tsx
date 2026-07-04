import type { TranscriptEntry } from '../../../shared/types'
import { languageName } from '../../../shared/languages'

export function TranscriptPanel({ entries }: { entries: TranscriptEntry[] }): React.JSX.Element {
  if (entries.length === 0) {
    return <p className="hint">Translated phrases will appear here.</p>
  }
  return (
    <div className="transcript">
      {entries.map((entry) => (
        <div key={entry.id} className={`transcript-entry ${entry.direction}`}>
          <div className="meta">
            {entry.direction === 'outbound' ? 'You' : 'Meeting'} ·{' '}
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
