export function LevelMeter({ level, label }: { level: number; label: string }): React.JSX.Element {
  const width = Math.min(100, Math.round(level * 100))
  return (
    <div className="field">
      <label>{label}</label>
      <div className="level-meter">
        <div className="fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
